import feedparser
import requests
import cloudscraper
from bs4 import BeautifulSoup
import json
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from inline_text import inline_preserving_text, prefer_inline_preserving_text
from multilingual_content import (
    trim_repeated_translation,
    trim_repeated_translation_blocks,
)

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass


# WRN 1.7.23 ENTRY SAFETY
AGGREGATE_ENTRY_ERRORS = []
AGGREGATE_STARTED_AT = time.monotonic()
AGGREGATE_STARTED_AT_ISO = datetime.now(timezone.utc).isoformat()
AGGREGATE_MODE = os.environ.get("WRN_AGGREGATE_MODE", "enrich").strip().lower()
if AGGREGATE_MODE not in {"fast", "enrich", "full"}:
    raise ValueError(f"Unbekannter WRN_AGGREGATE_MODE: {AGGREGATE_MODE}")
FAST_MODE = AGGREGATE_MODE == "fast"
SKIP_RADAR = FAST_MODE or os.environ.get("WRN_SKIP_RADAR", "").strip().lower() in {
    "1", "true", "yes", "on",
}
AGGREGATE_METRICS = {
    "mode": AGGREGATE_MODE,
    "startedAt": AGGREGATE_STARTED_AT_ISO,
    "sourcesConfigured": 0,
    "sourcesEligible": 0,
    "sourcesAttempted": 0,
    "sourcesWithEntries": 0,
    "sourcesSkippedByHealth": 0,
    "newArticles": 0,
    "enrichedArticles": 0,
    "stoppedForBudget": False,
}
AGGREGATE_BUDGET_SECONDS = max(
    300,
    int(os.environ.get("WRN_AGGREGATE_BUDGET_SECONDS", "1980")),
)
AGGREGATE_STOP_RESERVE_SECONDS = max(
    60,
    int(os.environ.get("WRN_AGGREGATE_STOP_RESERVE_SECONDS", "120")),
)
CHECKPOINT_INTERVAL_SECONDS = max(
    30,
    int(os.environ.get("WRN_CHECKPOINT_INTERVAL_SECONDS", "240")),
)
_LAST_CHECKPOINT_AT = 0.0


def aggregate_seconds_remaining():
    elapsed = time.monotonic() - AGGREGATE_STARTED_AT
    return max(0.0, AGGREGATE_BUDGET_SECONDS - elapsed)


def aggregate_budget_exhausted():
    return aggregate_seconds_remaining() <= AGGREGATE_STOP_RESERVE_SECONDS


def safe_text(value, fallback=""):
    if value is None:
        return fallback

    try:
        text = value if isinstance(value, str) else str(value)
    except Exception:
        return fallback

    text = text.strip()
    return text if text else fallback


def safe_lower(value, fallback=""):
    return safe_text(value, fallback).casefold()


def log_feed_entry_error(feed_name, entry, error):
    try:
        title_value = (
            entry.get("title")
            if hasattr(entry, "get")
            else ""
        )
    except Exception:
        title_value = ""

    record = {
        "feed": safe_text(feed_name, "Unbekannte Quelle"),
        "title": safe_text(title_value, "Unbekannter Eintrag"),
        "errorType": type(error).__name__,
        "error": safe_text(error, "Unbekannter Fehler"),
        "recordedAt": datetime.now().isoformat(),
    }

    AGGREGATE_ENTRY_ERRORS.append(record)

    print(
        "  [EINTRAG ÜBERSPRUNGEN] "
        f"{record['feed']} – {record['title']}: "
        f"{record['errorType']}: {record['error']}"
    )


def save_aggregate_error_report():
    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now().isoformat(),
        "errorCount": len(AGGREGATE_ENTRY_ERRORS),
        "errors": AGGREGATE_ENTRY_ERRORS[-500:],
    }

    with open(
        "aggregate-errors.json",
        "w",
        encoding="utf-8",
    ) as report_file:
        json.dump(
            payload,
            report_file,
            ensure_ascii=False,
            indent=2,
        )



# --- KONFIGURATION & QUELLEN ---
quellen = {
    "Global": [
        {"name": "Anarchist Federation", "url": "https://www.anarchistfederation.net/feed/"},
        {"name": "CrimethInc. (Global)", "url": "https://crimethinc.com/feed"},
        {"name": "Anarkismo (International)", "url": "http://www.anarkismo.net/backend?locale=en"},
        {"name": "ZNet (International)", "url": "https://znetwork.org/feed/"},
        {"name": "Libcom (Global News)", "url": "https://libcom.org/news/feed"},
        {"name": "IWA-AIT (Internationale)", "url": "https://iwa-ait.org/rss.xml"},
        {"name": "Agency", "url": "https://www.anarchistagency.com/feed/"},
        {"name": "Waging Nonviolence", "url": "https://wagingnonviolence.org/feed/"},
        {"name": "Anarchist News", "url": "https://morss.it/https://anarchistnews.org/rss.xml"},
        {"name": "A-Infos (Global)", "url": "http://www.ainfos.ca/ainfos.xml"},
        {"name": "Autonomies", "url": "https://autonomies.org/feed/"},
        {"name": "Unicorn Riot", "url": "https://unicornriot.ninja/feed/"},
        {"name": "Abolition Media", "url": "https://www.abolitionmedia.noblogs.org/feed/"},
        {"name": "Slingshot Collective", "url": "https://slingshotcollective.org/feed/"}
    ],
    "Europe": [
        {"name": "Paris-Luttes (FR)", "url": "https://paris-luttes.info/spip.php?page=backend"},
        {"name": "Lundi Matin (FR)", "url": "https://lundi.am/spip.php?page=backend"},
        {"name": "Rebellyon (FR)", "url": "https://rebellyon.info/spip.php?page=backend"},
        {"name": "MIA Marseille (FR)", "url": "https://mars-infos.org/spip.php?page=backend"},
        {"name": "Barrikade (CH)", "url": "https://barrikade.info/spip.php?page=backend"},
        {"name": "Kontrapolis (DE)", "url": "https://kontrapolis.info/feed/"},
        {"name": "Perspektive Online (DE)", "url": "https://www.perspektive-online.de/feed/"},
        {"name": "Avtonom (RU)", "url": "https://avtonom.org/rss.xml"},
        {"name": "Pramen (BY)", "url": "https://pramen.io/feed/"},
        {"name": "Athens Indymedia (GR)", "url": "https://athens.indymedia.org/rss/"},
        {"name": "Apatris (GR)", "url": "https://apatris.org/feed/"},
        {"name": "Alerta (GR)", "url": "https://www.alerta.gr/feed/"},
        {"name": "Infolibre (GR)", "url": "https://infolibre.gr/feed/"},
        {"name": "OmniaTV (GR)", "url": "https://omniatv.com/feed/"},
        {"name": "Antifa Infoblatt", "url": "https://www.antifainfoblatt.de/rss.xml"},
        {"name": "Freedom News", "url": "https://freedomnews.org.uk/feed/"},
        {"name": "A-Radio Berlin", "url": "https://www.aradio-berlin.org/feed/"},
        {"name": "A Las Barricadas (ES)", "url": "https://www.alasbarricadas.org/noticias/rss.xml"},
        {"name": "Umanita Nova (IT)", "url": "http://www.umanitanova.org/feed/"},
        {"name": "Federacja Anarchistyczna (PL)", "url": "https://federacja-anarchistyczna.pl/feed/"},
        {"name": "Antifa.cz", "url": "https://www.antifa.cz/rss.xml"},
        {"name": "Lower Class Magazine", "url": "https://lowerclassmag.com/feed/"},
        {"name": "Anarchist Communist Group", "url": "https://www.anarchistcommunism.org/feed/"}
        ,{
            "name": "Union Communiste Libertaire (FR)",
            "url": "https://www.unioncommunistelibertaire.org/spip.php?page=backend",
            "homepage": "https://www.unioncommunistelibertaire.org/",
            "language": "fr",
            "categories": ["Europe", "Anticapitalism", "Labor Struggles", "Queer-Feminism"],
            "originCountry": "France",
            "originCountryCode": "FR",
            "originRegion": "Europe",
        },
        {
            "name": "Courant Alternatif / OCL (FR)",
            "url": "https://oclibertaire.lautre.net/spip.php?page=backend",
            "homepage": "https://oclibertaire.lautre.net/",
            "language": "fr",
            "categories": ["Europe", "Anticapitalism", "Movement News", "Theory & Strategy"],
            "originCountry": "France",
            "originCountryCode": "FR",
            "originRegion": "Europe",
        }
    ],
    "Africa": [
        {"name": "Pambazuka News", "url": "https://www.pambazuka.org/rss.xml"},
        {
            "name": "The Elephant (Kenya)",
            "url": "https://www.theelephant.info/feed/",
            "homepage": "https://www.theelephant.info/",
            "language": "en",
            "categories": ["Africa", "Anticolonialism", "Anti-Imperialism"],
            "originCountry": "Kenya",
            "originCountryCode": "KE",
            "originRegion": "East Africa",
        },
        {"name": "Mada Masr (Egypt)", "url": "https://madamasr.com/en/feed"},
        {"name": "Attac / CADTM Maroc", "url": "https://www.cadtm.org/spip.php?page=backend"},
        {"name": "Zabalaza", "url": "https://zabalaza.net/feed/"},
        {"name": "ROAPE", "url": "https://roape.net/feed/"},
        {"name": "Anarkismo (Africa)", "url": "http://www.anarkismo.net/backend?topic=africa"},
        {"name": "Abahlali baseMjondolo (South Africa)", "url": "https://abahlali.org/feed/"},
        {"name": "Black Agenda Report", "url": "https://www.blackagendareport.com/rss.xml"}
    ],
    "North America": [
        {"name": "It's Going Down", "url": "https://itsgoingdown.org/feed/"},
        {"name": "Montreal Antifasciste", "url": "https://montreal-antifasciste.info/fr/feed/"},
        {"name": "SubMedia", "url": "https://sub.media/feed/"},
        {"name": "Black Rose / Rosa Negra", "url": "https://blackrosefed.org/feed/"},
        {"name": "C4SS", "url": "https://c4ss.org/feed"},
        {"name": "CrimethInc.", "url": "https://crimethinc.com/feed"},
        {"name": "Unicorn Riot", "url": "https://unicornriot.ninja/feed/"},
        {"name": "Indigenous Action", "url": "https://www.indigenousaction.org/feed/"},
        {"name": "The Appeal", "url": "https://theappeal.org/feed/"},
        {"name": "Truthout", "url": "https://truthout.org/feed/"},
        {"name": "Waging Nonviolence", "url": "https://wagingnonviolence.org/feed/"},
        {"name": "Slingshot Collective", "url": "https://slingshotcollective.org/feed/"}
    ],
    "Latin America": [
        {"name": "Enlace Zapatista (EZLN)", "url": "https://enlacezapatista.ezln.org.mx/feed/"},
        {"name": "El Libertario", "url": "http://periodicoellibertario.blogspot.com/feeds/posts/default"},
        {"name": "Avispa Midia", "url": "https://avispa.org/feed/"},
        {"name": "Desinformémonos", "url": "https://desinformemonos.org/feed/"},
        {"name": "Comunizar", "url": "https://comunizar.com.ar/feed/"},
        {"name": "Indymedia Argentina", "url": "https://argentina.indymedia.org/feed/"},
        {"name": "ANRed (Argentina)", "url": "https://www.anred.org/feed/"},
        {"name": "Pueblos en Camino", "url": "https://pueblosencamino.org/?feed=rss2"},
        {"name": "Subversiones (Mexico)", "url": "https://subversiones.org/feed/"}
        ,{
            "name": "Coordenação Anarquista Brasileira (CAB)",
            "url": "https://cabanarquista.com.br/feed/",
            "homepage": "https://cabanarquista.com.br/",
            "language": "pt",
            "categories": ["Latin America", "Anticapitalism", "Anticolonialism", "Indigenous Struggles"],
            "originCountry": "Brazil",
            "originCountryCode": "BR",
            "originRegion": "South America",
        }
    ],
    "Radar": [
        {"name": "Kontrapolis (Berlin)", "url": "https://kontrapolis.info/feed/"},
        # Stressfaktor-Termine werden bereits über die öffentliche
        # Radar.squat-API geladen. Der frühere Direkt-Feed liefert inzwischen
        # nur noch eine Bot-Schutzseite und würde dieselben Termine doppeln.
        {"name": "Paris-Luttes (Agenda FR)", "url": "https://paris-luttes.info/spip.php?page=backend-agenda"},
        {"name": "Barrikade (CH)", "url": "https://barrikade.info/spip.php?page=backend"},
        {"name": "CrimethInc. (Events)", "url": "https://morss.it/https://crimethinc.com/categories/events/feed"},
        {"name": "Gancio Cisti", "url": "https://gancio.cisti.org/feed/rss"},
        {"name": "Nantes Révoltée Agenda", "url": "https://nantes.indymedia.org/events/feed/"},
        {"name": "LaPunta Firenze", "url": "https://lapunta.org/feed/rss", "homepage": "https://lapunta.org/"},
        {"name": "Convoca-la Barcelona", "url": "https://bcn.convoca.la/feed/rss", "homepage": "https://bcn.convoca.la/"},
        {"name": "Convócala Madrid", "url": "https://mad.convoca.la/feed/rss", "homepage": "https://mad.convoca.la/"},
        {"name": "Rhein-Main Events", "url": "https://events.rheinmain.social/feed/rss", "homepage": "https://events.rheinmain.social/"},
        {"name": "Akce Nolog Praha", "url": "https://akce.nolog.cz/feed/rss", "homepage": "https://akce.nolog.cz/"},
        {"name": "Vagancio Buenos Aires", "url": "https://vagancio.partidopirata.com.ar/feed/rss", "homepage": "https://vagancio.partidopirata.com.ar/"},
        {"name": "Enredad.es", "url": "https://enredad.es/feed/rss", "homepage": "https://enredad.es/"},
        {"name": "ALÉ Montpellier", "url": "https://www.aleale.org/feed/rss", "homepage": "https://www.aleale.org/"},
        {"name": "Agenda des Luttes Rouen", "url": "https://agenda.rouen-luttes.org/feed/rss", "homepage": "https://agenda.rouen-luttes.org/"},
        {
            "name": "Flying High Bonn",
            "url": "https://flyinghigh-bonn.org/feed/rss",
            "homepage": "https://flyinghigh-bonn.org/",
            "language": "de",
            "originCountry": "Germany",
            "originCountryCode": "DE",
        },
        {
            "name": "Gancio Graz",
            "url": "https://gancio.graz.events/feed/rss",
            "homepage": "https://gancio.graz.events/",
            "language": "de",
            "originCountry": "Austria",
            "originCountryCode": "AT",
        },
        {
            "name": "Sa Pratza Sardegna",
            "url": "https://sapratza.in/feed/rss",
            "homepage": "https://sapratza.in/",
            "language": "it",
            "originCountry": "Italy",
            "originCountryCode": "IT",
        },
        {
            "name": "Koledar Kompot Ljubljana",
            "url": "https://koledar.kompot.si/feed/rss",
            "homepage": "https://koledar.kompot.si/",
            "language": "sl",
            "originCountry": "Slovenia",
            "originCountryCode": "SI",
        },
        {
            "name": "Agenda Autónoma Bogotá",
            "url": "https://autonoma.red/feed/rss",
            "homepage": "https://autonoma.red/",
            "language": "es",
            "originCountry": "Colombia",
            "originCountryCode": "CO",
        },
        {
            "name": "Eventos Coletivos Brasil",
            "url": "https://eventos.coletivos.org/feed/rss",
            "homepage": "https://eventos.coletivos.org/",
            "language": "pt",
            "originCountry": "Brazil",
            "originCountryCode": "BR",
        }
    ],
    "Asia": [
        {"name": "Bulatlat (Philippines)", "url": "https://www.bulatlat.com/feed/"},
        {
            "name": "The Polis Project (India)",
            "url": "https://www.thepolisproject.com/feed/",
            "homepage": "https://www.thepolisproject.com/",
            "language": "en",
            "categories": ["Asia", "Antifascism", "Anticolonialism", "Anti-Rep & Prisons"],
            "originCountry": "India",
            "originCountryCode": "IN",
            "originRegion": "South Asia",
        },
        {"name": "Rojava Info Center", "url": "https://rojavainformationcenter.org/feed/"},
        {
            "name": "ANF English (Kurdistan)",
            "url": "https://english.anf-news.com/feed.rss",
            "homepage": "https://english.anf-news.com/",
        },
        {"name": "Lausan (HK)", "url": "https://lausan.hk/feed/"},
        {"name": "Chuang (CN)", "url": "https://chuangcn.org/feed/"},
        {"name": "New Bloom (TW)", "url": "https://newbloommag.net/feed/"},
        {"name": "Mekong Review", "url": "https://mekongreview.com/feed/"},
        {"name": "Thozhilalar Koodam (India)", "url": "https://tnlabor.in/feed/"},
        {"name": "Radical Socialist (India)", "url": "http://www.radicalsocialist.in/index.php?format=feed&type=rss"},
        {"name": "Palang Hitam (Indonesia)", "url": "https://palanghitam.noblogs.org/feed/"},
        {"name": "Federation of Anarchism Era", "url": "https://asranarshism.com/feed/"},
        {"name": "Fauda", "url": "https://fauda.noblogs.org/feed/"},
        {"name": "Manila Today", "url": "https://manilatoday.net/feed/"},
        {"name": "Kodao Productions", "url": "https://kodao.org/feed/"},
        {"name": "Karapatan (Human Rights)", "url": "https://www.karapatan.org/feed/"},
        {"name": "Asian Labour Review", "url": "https://labourreview.org/feed/"}
    ],
    "Australia & NZ": [
        {"name": "IndigenousX (Australia)", "url": "https://indigenousx.com.au/feed/"},
        {"name": "MACG", "url": "https://melbacg.wordpress.com/feed/"},
        {"name": "Slackbastard", "url": "https://slackbastard.anarchobase.com/?feed=rss2"},
        {"name": "Green Left", "url": "https://www.greenleft.org.au/rss.xml"},
        {"name": "AWSM", "url": "https://awsm.nz/feed/"},
        {"name": "Red Flag (Aus)", "url": "https://redflag.org.au/feed"},
        {"name": "Overland", "url": "https://overland.org.au/feed/"}
        ,{
            "name": "Black Flag Sydney",
            "url": "https://blackflagsydney.com/feed/",
            "homepage": "https://blackflagsydney.com/",
            "language": "en",
            "categories": ["Oceania", "Anticapitalism", "Labor Struggles", "Theory & Strategy"],
            "originCountry": "Australia",
            "originCountryCode": "AU",
            "originRegion": "Oceania",
        }
    ],
    "Labor Struggles": [
        {"name": "IWW (Global)", "url": "https://www.iww.org/feed/"},
        {"name": "FAU (Deutschland)", "url": "https://www.fau.org/rss.xml"},
        {"name": "CNT (Spanien)", "url": "https://www.cnt.es/feed/"},
        {"name": "Labor Notes", "url": "https://labornotes.org/feed"},
        {"name": "AngryWorkers", "url": "https://angryworkers.org/feed/"},
        {"name": "LabourNet DE", "url": "https://www.labournet.de/feed/"},
        {"name": "Libcom (Workplace)", "url": "https://libcom.org/news/feed"},
        {"name": "Thozhilalar Koodam", "url": "https://tnlabor.in/feed/"}
    ],
    "Antifascism": [
        {"name": "Unicorn Riot", "url": "https://unicornriot.ninja/feed/"},
        {"name": "Antifa Infoblatt", "url": "https://www.antifainfoblatt.de/rss.xml"},
        {"name": "Montreal Antifasciste", "url": "https://montreal-antifasciste.info/fr/feed/"},
        {"name": "Barrikade", "url": "https://barrikade.info/spip.php?page=backend"},
        {"name": "Act for Freedom Now!", "url": "https://actforfree.noblogs.org/feed/"},
        {"name": "Fajfa (Antifa)", "url": "https://fajfa.noblogs.org/feed/"},
        {"name": "Antifa.cz", "url": "https://www.antifa.cz/rss.xml"},
        {"name": "Antifa Bern", "url": "https://antifa-bern.ch/feed/"},
        {
            "name": "Anti-Fascistische Actie Nederland",
            "url": "https://afanederland.org/feed/",
            "homepage": "https://afanederland.org/",
            "language": "nl",
            "categories": ["Europe", "Antifascism", "Antiracism", "Movement News"],
            "originCountry": "Netherlands",
            "originCountryCode": "NL",
            "originRegion": "Europe",
        },
        {
            "name": "Anonymous Comrades Collective",
            "url": "https://accollective.noblogs.org/feed/",
            "homepage": "https://accollective.noblogs.org/",
            "language": "en",
            "categories": ["North America", "Antifascism", "Antiracism", "Movement News"],
            "originCountry": "United States",
            "originCountryCode": "US",
            "originRegion": "North America",
        },
        {
            "name": "Juntas! Brasil",
            "url": "https://coletivojuntas.com.br/feed/",
            "homepage": "https://coletivojuntas.com.br/",
            "language": "pt",
            "categories": ["Latin America", "Antifascism", "Queer-Feminism", "Antiracism"],
            "originCountry": "Brazil",
            "originCountryCode": "BR",
            "originRegion": "Latin America",
        },
        {
            "name": "Worldwide Antifascism Research Network",
            "url": "https://antifascismresearchnetwork.com/feed/",
            "homepage": "https://antifascismresearchnetwork.com/",
            "language": "en",
            "categories": ["Global", "Antifascism", "Theory & Strategy"],
            "originCountry": "Global",
            "originCountryCode": "",
            "originRegion": "Global",
        },
        {
            "name": "Slackbastard",
            "url": "https://slackbastard.anarchobase.com/?feed=rss2",
            "homepage": "https://slackbastard.anarchobase.com/",
            "language": "en",
            "categories": ["Oceania", "Antifascism", "Antiracism", "Movement News"],
            "originCountry": "Australia",
            "originCountryCode": "AU",
            "originRegion": "Oceania",
        },
    ],
    "Antisexism": [
        {"name": "Anarkismo (Gender)", "url": "http://www.anarkismo.net/backend?topic=gender"},
        {"name": "Jineolojî Academy", "url": "https://jineoloji.eu/en/feed/"},
        {"name": "Ni Una Menos", "url": "https://niunamenos.org.ar/feed/"},
        {"name": "Feministische Antifa", "url": "https://fantifa.noblogs.org/feed/"},
        {"name": "Missy Magazine (DE)", "url": "https://missy-magazine.de/feed/"}
    ],
    "Queer-Feminism": [
        {"name": "Queer Anarchism", "url": "https://queeranarchism.tumblr.com/rss"},
        {"name": "Black Rose (Feminism)", "url": "https://blackrosefed.org/category/anarcha-feminism/feed/"},
        {"name": "GenderIT (Technofeminism)", "url": "https://www.genderit.org/rss.xml"},
        {"name": "Transgender Europe (TGEU)", "url": "https://tgeu.org/feed/"},
        {
            "name": "Autostraddle News",
            "url": "https://www.autostraddle.com/category/news/feed/",
            "homepage": "https://www.autostraddle.com/category/news/",
            "categories": ["Queer-Feminism", "North America"],
            "language": "en",
            "originCountry": "United States",
            "originCountryCode": "US",
            "originRegion": "North America",
            "imageHosts": ["autostraddle.com", "www.autostraddle.com"]
        },
        {"name": "Make Rojava Green Again", "url": "https://makerojavagreenagain.org/feed/"},
        {"name": "Pinko Magazine", "url": "https://pinko.online/feed/"},
        {"name": "Feminist Anti-War Resistance", "url": "https://femagainstwar.org/feed/"}
    ],
    "Antiracism": [
        {"name": "Institute of Race Relations", "url": "https://irr.org.uk/feed/"},
        {"name": "Black Rose (Anti-Racism)", "url": "https://blackrosefed.org/category/anti-racism/feed/"},
        {"name": "Colorlines", "url": "https://colorlines.com/rss.xml"},
        {"name": "Abolition Journal", "url": "https://abolitionjournal.org/feed/"}
    ],
    "No Borders": [
        {"name": "Abolish Frontex", "url": "https://abolishfrontex.org/feed/"},
        {"name": "Sea-Watch", "url": "https://sea-watch.org/feed/"},
        {"name": "Are You Syrious?", "url": "https://medium.com/feed/are-you-syrious"},
        {"name": "No One Is Illegal", "url": "https://noii-van.org/feed/"},
        {"name": "Migrant Solidarity Network (CH)", "url": "https://migrant-solidarity-network.ch/feed/"}
    ],
    "Anticapitalism": [
        {"name": "CrimethInc.", "url": "https://crimethinc.com/feed"},
        {"name": "Comunizar", "url": "https://comunizar.com.ar/feed/"},
        {"name": "ZNet (Global)", "url": "https://znetwork.org/feed/"},
        {"name": "Tricontinental: Institute for Social Research", "url": "https://thetricontinental.org/feed/"},
        {"name": "Monthly Review", "url": "https://monthlyreview.org/feed/"},
        {"name": "Novara Media (UK)", "url": "https://novaramedia.com/feed/"},
        {"name": "The New Inquiry", "url": "https://thenewinquiry.com/feed/"}
    ],
    "Theory & Strategy": [
        {"name": "Ill Will", "url": "https://illwill.com/rss.xml"},
        {"name": "Endnotes", "url": "https://endnotes.org.uk/feed.xml"},
        {"name": "Wildcat", "url": "https://www.wildcat-www.de/wildcat.rss"},
        {"name": "CrimethInc. (Texts)", "url": "https://crimethinc.com/categories/texts/feed"}
    ],
    "Anticolonialism": [
        {"name": "Avispa Midia", "url": "https://avispa.org/feed/"},
        {"name": "Lausan", "url": "https://lausan.hk/feed/"},
        {"name": "Black Rose (Anti-Colonial)", "url": "https://blackrosefed.org/category/anti-colonialism/feed/"}
    ],
    "Anti-Imperialism": [
        {"name": "Pambazuka News", "url": "https://www.pambazuka.org/rss.xml"},
        {"name": "ROAPE", "url": "https://roape.net/feed/"},
        {"name": "Asian Labour Review", "url": "https://labourreview.org/feed/"}
    ],
    "Squatting & Housing": [
        {"name": "Squat!net", "url": "https://de.squat.net/feed/"},
        {"name": "Barrikade", "url": "https://barrikade.info/spip.php?page=backend"},
        {"name": "Mietergewerkschaft Berlin", "url": "https://mietergewerkschaft.berlin/feed/"},
        {"name": "Housing Action", "url": "https://housingaction.noblogs.org/feed/"},
        {"name": "Recht auf Stadt (Hamburg)", "url": "https://www.rechtaufstadt.net/feed/"},
        {"name": "Zwangsräumung Verhindern (Berlin)", "url": "https://zwangsraeumungverhindern.org/feed/"},
        {"name": "Defend Council Housing (UK)", "url": "https://www.defendcouncilhousing.org.uk/feed/"}
    ],
    "Demonstrations": [
        {"name": "It's Going Down", "url": "https://itsgoingdown.org/feed/"},
        {"name": "Athens Indymedia", "url": "https://athens.indymedia.org/rss/"},
        {"name": "Kontrapolis", "url": "https://kontrapolis.info/feed/"}
    ],
    "Anti-Rep & Prisons": [
        {"name": "IWOC (Incarcerated Workers)", "url": "https://incarceratedworkers.org/feed"},
        {"name": "Kite Line Radio", "url": "https://kitelineradio.noblogs.org/feed/"},
        {"name": "Critical Resistance", "url": "https://criticalresistance.org/feed/"},
        {"name": "Rote Hilfe", "url": "https://www.rote-hilfe.de/rss.xml"},
        {"name": "Anarchist Black Cross", "url": "https://www.abcf.net/feed/"},
        {"name": "ABC Belarus", "url": "https://abc-belarus.org/?feed=rss2&lang=en"},
        {"name": "ABC Dresden", "url": "https://abcdd.org/feed/", "homepage": "https://abcdd.org/", "language": "de", "categories": ["Europe", "Anti-Rep & Prisons", "Anarchism"], "originCountry": "Germany", "originCountryCode": "DE", "originRegion": "Europe"},
        {"name": "Bristol ABC", "url": "https://bristolabc.org/feed/", "homepage": "https://bristolabc.org/", "language": "en", "categories": ["Europe", "Anti-Rep & Prisons", "Anarchism"], "originCountry": "United Kingdom", "originCountryCode": "GB", "originRegion": "Europe"},
        {"name": "BOAK (RU)", "url": "https://boak.noblogs.org/feed/"},
    ],
    "Cyberactivism": [
        {"name": "Systemli", "url": "https://www.systemli.org/index.xml"},
        {"name": "DDoSecrets", "url": "https://ddosecrets.com/api.php?action=featuredfeed&feed=rss"},
        {"name": "Kolektiva Media (Video)", "url": "https://kolektiva.media/feeds/videos.xml?videoFilter=local"},
        {"name": "Electronic Frontier Foundation", "url": "https://www.eff.org/rss/updates.xml"}
    ],
    "No War": [
        {"name": "War Resisters' International", "url": "https://wri-irg.org/en/feed"},
        {"name": "Rheinmetall Entwaffnen", "url": "https://rheinmetallentwaffnen.noblogs.org/feed/"},
        {"name": "Antimilitarismus", "url": "https://antimilitarismus.noblogs.org/feed/"},
        {"name": "Democracy Now! (Global)", "url": "https://www.democracynow.org/democracynow.rss"},
        {"name": "Stop the War Coalition", "url": "https://www.stopwar.org.uk/rss.xml"},
        {"name": "Labor for Palestine", "url": "https://laborforpalestine.net/feed/"},
        {"name": "World BEYOND War", "url": "https://worldbeyondwar.org/feed/"}
    ],
    "Animal Liberation": [
        {"name": "Tierbefreier", "url": "https://tierbefreier.org/feed/"},
        {"name": "Unoffensive Animal", "url": "https://unoffensiveanimal.is/feed/"},
        {"name": "ALF Press Office (North America)", "url": "https://animalliberationpressoffice.org/NAALPO/feed/"},
        {"name": "Hunt Saboteurs Association (UK)", "url": "https://www.huntsabs.org.uk/feed/"},
        {"name": "ARIWA – Animal Rights Watch (Germany)", "url": "https://www.ariwa.org/feed/", "homepage": "https://www.ariwa.org/", "language": "de", "categories": ["Europe", "Animal Liberation"], "originCountry": "Germany", "originCountryCode": "DE", "originRegion": "Europe"},
        {"name": "PETA Deutschland", "url": "https://www.peta.de/feed/", "homepage": "https://www.peta.de/", "language": "de", "categories": ["Europe", "Animal Liberation"], "originCountry": "Germany", "originCountryCode": "DE", "originRegion": "Europe"},
        {"name": "Animal Equality Deutschland", "url": "https://animalequality.de/feed/", "homepage": "https://animalequality.de/", "language": "de", "categories": ["Europe", "Animal Liberation"], "originCountry": "Germany", "originCountryCode": "DE", "originRegion": "Europe"},
        {"name": "Tier im Fokus (Switzerland)", "url": "https://tierimfokus.ch/feed/", "homepage": "https://tierimfokus.ch/", "language": "de", "categories": ["Europe", "Animal Liberation"], "originCountry": "Switzerland", "originCountryCode": "CH", "originRegion": "Europe"},
        {"name": "L214 (France)", "url": "https://www.l214.com/feed/", "homepage": "https://www.l214.com/", "language": "fr", "categories": ["Europe", "Animal Liberation"], "originCountry": "France", "originCountryCode": "FR", "originRegion": "Europe"},
        {"name": "269 Libération Animale (France)", "url": "https://www.269liberationanimale.fr/feed/", "homepage": "https://www.269liberationanimale.fr/", "language": "fr", "categories": ["Europe", "Animal Liberation"], "originCountry": "France", "originCountryCode": "FR", "originRegion": "Europe"},
        {"name": "Animal Aid (UK)", "url": "https://www.animalaid.org.uk/feed/", "homepage": "https://www.animalaid.org.uk/news/", "language": "en", "categories": ["Europe", "Animal Liberation"], "originCountry": "United Kingdom", "originCountryCode": "GB", "originRegion": "Europe"},
    ],
    "Eco-Anarchism": [
        {"name": "Earth First!", "url": "https://earthfirstjournal.news/feed/"},
        {"name": "Winter Oak", "url": "https://winteroak.org.uk/feed/"},
        {"name": "SubMedia", "url": "https://sub.media/feed/"},
        {"name": "Solarpunk Magazine", "url": "https://solarpunkmagazine.com/feed/"},
        {"name": "Defend the Atlanta Forest", "url": "https://defendtheatlantaforest.org/feed/"},
        {"name": "Desmog", "url": "https://www.desmog.com/feed/"},
        {"name": "Ende Gelände", "url": "https://www.ende-gelaende.org/feed/"}
    ],
    "Indigenous Struggles": [
        {"name": "Enlace Zapatista (EZLN)", "url": "https://enlacezapatista.ezln.org.mx/feed/"},
        {"name": "Avispa Midia", "url": "https://avispa.org/feed/"},
        {"name": "IEN Earth", "url": "https://www.ienearth.org/feed/"},
        {"name": "IndigenousX", "url": "https://indigenousx.com.au/feed/"},
        {"name": "Bulatlat (Indigenous)", "url": "https://www.bulatlat.com/feed/"},
        {"name": "Cultural Survival", "url": "https://www.culturalsurvival.org/rss.xml"},
        {"name": "Native News Online", "url": "https://nativenewsonline.net/feed/"},
        {"name": "Grist (Indigenous Affairs)", "url": "https://grist.org/indigenous/feed/"},
        {"name": "Indigenous Action", "url": "https://www.indigenousaction.org/feed/"},
        {"name": "Mapuexpress (Mapuche)", "url": "https://www.mapuexpress.org/feed/"},
        {"name": "Warrior Publications", "url": "https://warriorpublications.wordpress.com/feed/"}
    ],
    "Radical Health & Disability": [
        {"name": "Asylum Magazine", "url": "https://asylummagazine.org/feed/"},
        {"name": "Mad in America", "url": "https://www.madinamerica.com/feed/"},
        {"name": "Disability Visibility", "url": "https://disabilityvisibilityproject.com/feed/"}
    ],
    "Libraries": [
        {"name": "Anarchistische Bibliothek (DE)", "url": "https://de.anarchistlibraries.net/feed/"},
        {"name": "The Anarchist Library (EN)", "url": "https://theanarchistlibrary.org/feed"},
        {"name": "Biblioteca Anarquista (ES)", "url": "https://es.anarchistlibraries.net/feed/"},
        {"name": "Bibliothèque Anarchiste (FR)", "url": "https://fr.anarchistlibraries.net/feed/"},
        {"name": "Libreria Anarchica (IT)", "url": "https://it.theanarchistlibrary.org/feed"},
        {"name": "Biblioteca Anarquista (PT)", "url": "https://pt.theanarchistlibrary.org/feed"},
        {"name": "Anarchist Library (RU)", "url": "https://ru.anarchistlibraries.net/feed/"},
        {"name": "Anarchist Library (TR)", "url": "https://tr.theanarchistlibrary.org/feed"},
        {"name": "Anarchist Library (PL)", "url": "https://pl.theanarchistlibrary.org/feed"},
        {"name": "Anarchist Library (SV)", "url": "https://www.anarkistiskabiblioteket.se/feed/"},
        {"name": "RevoltLib", "url": "https://revoltlib.com/feed"},
        {"name": "Sprout Distro", "url": "https://www.sproutdistro.com/rss.xml"},
        {"name": "Zabalaza Books (Africa)", "url": "https://zabalazabooks.net/feed/"},
        {"name": "Libcom Library", "url": "https://libcom.org/news/feed"}
    ]
}
# WRN MULTILINGUAL SOURCES 1.8.2 START
# Additive and idempotent: the existing source dictionary is never replaced.
_wrn_extra_sources_182 = [{'name': 'Graswurzelrevolution', 'kind': 'news', 'adapter': 'rss', 'languages': ['de'], 'homepage': 'https://www.graswurzel.net/gwr/', 'feedUrl': 'https://www.graswurzel.net/gwr/feed/', 'categories': ['Europe', 'No War', 'Anarchism'], 'status': 'approved'}, {'name': 'Agência Pública', 'kind': 'news', 'adapter': 'rss', 'languages': ['pt'], 'homepage': 'https://apublica.org/', 'feedUrl': 'https://apublica.org/feed/', 'categories': ['Latin America', 'Environment', 'Investigative'], 'status': 'approved'}, {'name': 'Bianet Türkçe', 'kind': 'news', 'adapter': 'rss', 'languages': ['tr'], 'homepage': 'https://bianet.org/', 'feedUrl': 'https://bianet.org/rss/bianet', 'categories': ['Europe', 'Labor Struggles', 'Antiracism', 'Queer-Feminism'], 'originCountry': 'Türkiye', 'originCountryCode': 'TR', 'originRegion': 'Türkiye', 'status': 'approved', 'addedIn': '1.8.2'}, {'name': 'Evrensel', 'kind': 'news', 'adapter': 'rss', 'languages': ['tr'], 'homepage': 'https://www.evrensel.net/', 'feedUrl': 'https://www.evrensel.net/rss/haber.xml', 'categories': ['Europe', 'Labor Struggles', 'Anticapitalism', 'No War'], 'originCountry': 'Türkiye', 'originCountryCode': 'TR', 'originRegion': 'Türkiye', 'status': 'approved', 'addedIn': '1.8.2'}, {'name': 'Bianet Kurdî', 'kind': 'news', 'adapter': 'rss', 'languages': ['ku'], 'homepage': 'https://bianet.org/kurdi', 'feedUrl': 'https://bianet.org/rss/kurdi', 'categories': ['Europe', 'Anticolonialism', 'Antiracism', 'No Borders'], 'originCountry': 'Türkiye', 'originCountryCode': 'TR', 'originRegion': 'Türkiye', 'status': 'approved', 'addedIn': '1.8.2'}, {'name': 'Pressin Kurdî', 'kind': 'news', 'adapter': 'rss', 'languages': ['ku'], 'homepage': 'https://pressin.info/kurdi', 'feedUrl': 'https://pressin.info/kurdi/rss/latest-posts', 'categories': ['Asia', 'Anticolonialism', 'Anti-Imperialism'], 'originCountry': 'Iraq', 'originCountryCode': 'IQ', 'originRegion': 'Kurdistan Region', 'status': 'approved', 'addedIn': '1.8.2'}]
for _wrn_source in _wrn_extra_sources_182:
    _wrn_name = str(_wrn_source.get('name', '')).casefold()
    _wrn_url = str(_wrn_source.get('feedUrl', '')).rstrip('/').casefold()
    _wrn_existing = None
    for _wrn_existing_bucket in quellen.values():
        if not isinstance(_wrn_existing_bucket, list):
            continue
        for _wrn_item in _wrn_existing_bucket:
            if not isinstance(_wrn_item, dict):
                continue
            _wrn_item_name = str(_wrn_item.get('name', '')).casefold()
            _wrn_item_url = str(
                _wrn_item.get('url')
                or _wrn_item.get('feedUrl')
                or _wrn_item.get('feed')
                or ''
            ).rstrip('/').casefold()
            if _wrn_item_name == _wrn_name or _wrn_item_url == _wrn_url:
                _wrn_existing = _wrn_item
                break
        if _wrn_existing is not None:
            break
    if _wrn_existing is None:
        _wrn_primary_category = _wrn_source.get('categories', ['Global'])[0]
        _wrn_existing = {
            'name': _wrn_source['name'],
            'url': _wrn_source['feedUrl'],
        }
        quellen.setdefault(_wrn_primary_category, []).append(_wrn_existing)
    _wrn_existing.setdefault('homepage', _wrn_source.get('homepage', ''))
    _wrn_existing.setdefault('language', _wrn_source.get('languages', ['und'])[0])
    _wrn_existing.setdefault('languages', list(_wrn_source.get('languages', ['und'])))
    _wrn_existing.setdefault('categories', list(_wrn_source.get('categories', ['Global'])))
    _wrn_existing.setdefault('originCountry', _wrn_source.get('originCountry', ''))
    _wrn_existing.setdefault('originCountryCode', _wrn_source.get('originCountryCode', ''))
    _wrn_existing.setdefault('originRegion', _wrn_source.get('originRegion', ''))
# WRN MULTILINGUAL SOURCES 1.8.2 END

# WRN SOURCE EXPANSION 1.8.5 START
_wrn_extra_sources_185 = [
    {
        "name": "Africa Is a Country",
        "url": "https://africasacountry.com/feed",
        "homepage": "https://africasacountry.com/",
        "language": "en",
        "categories": ["Africa", "Anticolonialism", "Anti-Imperialism", "Theory & Strategy"],
        "originRegion": "Africa",
    },
    {
        "name": "African Feminism",
        "url": "https://africanfeminism.com/feed/",
        "homepage": "https://africanfeminism.com/",
        "language": "en",
        "categories": ["Africa", "Antisexism", "Queer-Feminism", "Anticolonialism"],
        "originRegion": "Africa",
    },
    {
        "name": "Minority Africa",
        "url": "https://minorityafrica.org/feed/",
        "homepage": "https://minorityafrica.org/",
        "language": "en",
        "categories": ["Africa", "Antisexism", "Queer-Feminism", "Antiracism", "Indigenous Struggles", "Radical Health & Disability", "No Borders"],
        "originRegion": "Africa",
    },
    {
        "name": "Elitsha",
        "url": "https://elitshanews.org.za/en/feed/",
        "homepage": "https://elitshanews.org.za/",
        "language": "en",
        "categories": ["Africa", "Labor Struggles", "Squatting & Housing", "Antiracism"],
        "originCountry": "South Africa",
        "originCountryCode": "ZA",
        "originRegion": "Southern Africa",
    },
    {
        "name": "African Arguments",
        "url": "https://africanarguments.org/feed/",
        "homepage": "https://africanarguments.org/",
        "language": "en",
        "categories": ["Africa", "Anticolonialism", "Anti-Imperialism"],
        "originRegion": "Africa",
    },
    {
        "name": "WoMin African Alliance",
        "url": "https://womin.africa/feed/",
        "homepage": "https://womin.africa/",
        "language": "en",
        "categories": ["Africa", "Antisexism", "Eco-Anarchism", "Indigenous Struggles", "Anticapitalism"],
        "originRegion": "Africa",
    },
    {
        "name": "APTN News",
        "url": "https://www.aptnnews.ca/feed/",
        "homepage": "https://www.aptnnews.ca/",
        "language": "en",
        "categories": ["Indigenous Struggles", "North America", "Anticolonialism"],
        "originCountry": "Canada",
        "originCountryCode": "CA",
        "originRegion": "North America",
    },
    {
        "name": "IndigiNews",
        "url": "https://indiginews.com/feed/",
        "homepage": "https://indiginews.com/",
        "language": "en",
        "categories": ["Indigenous Struggles", "North America", "Anticolonialism"],
        "originCountry": "Canada",
        "originCountryCode": "CA",
        "originRegion": "North America",
    },
    {
        "name": "Nunatsiaq News",
        "url": "https://nunatsiaq.com/feed/",
        "homepage": "https://nunatsiaq.com/",
        "language": "en",
        "categories": ["Indigenous Struggles", "North America", "Anticolonialism"],
        "originCountry": "Canada",
        "originCountryCode": "CA",
        "originRegion": "Inuit Nunangat",
    },
    {
        "name": "The Feminist Wire",
        "url": "https://thefeministwire.com/feed/",
        "homepage": "https://thefeministwire.com/",
        "language": "en",
        "categories": ["Antisexism", "Queer-Feminism", "Antiracism", "North America"],
        "originRegion": "North America",
    },
    {
        "name": "Feminist Newswire",
        "url": "https://feminist.org/news/feed/",
        "homepage": "https://feminist.org/news/",
        "language": "en",
        "categories": ["Antisexism", "Queer-Feminism", "North America"],
        "originRegion": "North America",
    },
    {
        "name": "AWID",
        "url": "https://www.awid.org/rss.xml",
        "homepage": "https://www.awid.org/",
        "language": "en",
        "categories": ["Antisexism", "Queer-Feminism", "Anticapitalism", "Global"],
        "originRegion": "Global",
    },
    {
        "name": "Equality Now",
        "url": "https://equalitynow.org/feed/",
        "homepage": "https://equalitynow.org/",
        "language": "en",
        "categories": ["Antisexism", "Global"],
        "originRegion": "Global",
    },
    {
        "name": "Women Enabled International",
        "url": "https://womenenabled.org/feed/",
        "homepage": "https://womenenabled.org/",
        "language": "en",
        "categories": ["Antisexism", "Radical Health & Disability", "Global"],
        "originRegion": "Global",
    },
    {
        "name": "Anarşist Haberler",
        "url": "https://www.anarsisthaberler.net/feed/",
        "homepage": "https://www.anarsisthaberler.net/",
        "language": "tr",
        "categories": ["Europe", "Theory & Strategy", "Anticapitalism", "Antifascism"],
        "originCountry": "Türkiye",
        "originCountryCode": "TR",
        "originRegion": "Türkiye",
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Radikal Perspektif",
        "url": "https://rpkolektif.wordpress.com/feed/",
        "homepage": "https://rpkolektif.wordpress.com/",
        "language": "tr",
        "categories": ["Europe", "Theory & Strategy", "Anticapitalism"],
        "originCountry": "Türkiye",
        "originCountryCode": "TR",
        "originRegion": "Türkiye",
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Yeryüzü Postası",
        "url": "https://www.yeryuzupostasi.org/feed/",
        "homepage": "https://www.yeryuzupostasi.org/",
        "language": "tr",
        "categories": ["Europe", "Anticapitalism", "Labor Struggles", "Theory & Strategy", "No War"],
        "originCountry": "Türkiye",
        "originCountryCode": "TR",
        "originRegion": "Türkiye",
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
]

_wrn_known_source_names_185 = {
    safe_lower(item.get("name"))
    for bucket in quellen.values()
    for item in bucket
    if isinstance(item, dict)
}
for _wrn_source in _wrn_extra_sources_185:
    if safe_lower(_wrn_source.get("name")) in _wrn_known_source_names_185:
        continue
    _wrn_primary_category = _wrn_source.get("categories", ["Global"])[0]
    quellen.setdefault(_wrn_primary_category, []).append(_wrn_source)
    _wrn_known_source_names_185.add(safe_lower(_wrn_source.get("name")))

for _wrn_bucket in quellen.values():
    for _wrn_source in _wrn_bucket:
        if safe_lower(_wrn_source.get("name")).startswith("bianet "):
            _wrn_source["maxNewItems"] = 1
        if safe_lower(_wrn_source.get("name")) == "umanita nova (it)":
            _wrn_source.update({
                "url": "https://umanitanova.org/feed/",
                "homepage": "https://umanitanova.org/",
                "language": "it",
                "languages": ["it"],
                "categories": [
                    "Europe", "Movement News", "Anticapitalism",
                    "Antifascism", "No War", "Theory & Strategy",
                ],
                "originCountry": "Italy",
                "originCountryCode": "IT",
                "originRegion": "Southern Europe",
                "maxNewItems": 4,
                "minArticleTextLength": 700,
                "articleSelectors": ["article", ".entry-content", "main"],
            })
        if safe_lower(_wrn_source.get("name")) == "truthout":
            # Truthouts Feed enthält nur Anreißer. Der erste Reparaturlauf
            # darf deshalb alle im Feed sichtbaren Auszüge nachladen; danach
            # werden vollständige Artikel weiterhin sofort übersprungen.
            _wrn_source["maxNewItems"] = 15
            _wrn_source["minArticleTextLength"] = 1200
            _wrn_source["articleSelectors"] = [
                "[itemprop='articleBody']",
                ".article-content",
                ".entry-content",
                "article",
                "main",
            ]

# WRN SOURCE BALANCE 1.8.6 START
# Regions and topics with low visible diversity receive small, source-specific
# intake limits. This adds diversity without allowing a new feed to dominate.
_wrn_extra_sources_186 = [
    {
        "name": "Groundxero",
        "url": "https://www.groundxero.in/feed/",
        "homepage": "https://www.groundxero.in/",
        "language": "en",
        "categories": [
            "Asia", "Antiracism", "Labor Struggles",
            "Indigenous Struggles", "Antisexism", "Eco-Anarchism",
        ],
        "originCountry": "India",
        "originCountryCode": "IN",
        "originRegion": "South Asia",
        "maxNewItems": 4,
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Round Table India",
        "url": "https://www.roundtableindia.co.in/feed/",
        "homepage": "https://www.roundtableindia.co.in/",
        "language": "en",
        "categories": [
            "Asia", "Antiracism", "Anticolonialism",
            "Antisexism", "Theory & Strategy",
        ],
        "originCountry": "India",
        "originCountryCode": "IN",
        "originRegion": "South Asia",
        "maxNewItems": 4,
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "A.N.A. Brasil",
        "url": "https://noticiasanarquistas.noblogs.org/feed/",
        "homepage": "https://noticiasanarquistas.noblogs.org/",
        "language": "pt",
        "categories": [
            "Latin America", "Movement News", "Anticapitalism",
            "Antifascism", "No War",
        ],
        "originCountry": "Brazil",
        "originCountryCode": "BR",
        "originRegion": "South America",
        "maxNewItems": 4,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "La Zarzamora",
        "url": "https://lazarzamora.cl/feed/",
        "homepage": "https://lazarzamora.cl/",
        "language": "es",
        "categories": [
            "Latin America", "Antisexism", "Animal Liberation",
            "Indigenous Struggles", "Antiracism", "Anti-Rep & Prisons",
        ],
        "originCountry": "Chile",
        "originCountryCode": "CL",
        "originRegion": "South America",
        "maxNewItems": 4,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Radio Kurruf Noticias",
        "url": "https://radiokurruf.org/feed/",
        "homepage": "https://radiokurruf.org/",
        "language": "es",
        "categories": [
            "Latin America", "Indigenous Struggles",
            "Anti-Rep & Prisons", "Anticolonialism",
        ],
        "originCountry": "Chile",
        "originCountryCode": "CL",
        "originRegion": "Wallmapu",
        "maxNewItems": 3,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Agencia Tierra Viva",
        "url": "https://agenciatierraviva.com.ar/feed/",
        "homepage": "https://agenciatierraviva.com.ar/",
        "language": "es",
        "categories": [
            "Latin America", "Indigenous Struggles",
            "Eco-Anarchism", "Anticapitalism",
        ],
        "originCountry": "Argentina",
        "originCountryCode": "AR",
        "originRegion": "South America",
        "maxNewItems": 3,
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "InfoAut",
        "url": "https://infoaut.org/feed",
        "homepage": "https://infoaut.org/",
        "language": "it",
        "categories": [
            "Europe", "Movement News", "Anti-Rep & Prisons",
            "Anticapitalism", "Labor Struggles", "Antifascism",
        ],
        "originCountry": "Italy",
        "originCountryCode": "IT",
        "originRegion": "Southern Europe",
        "maxNewItems": 3,
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Sicilia Libertaria",
        "url": "https://www.sicilialibertaria.it/feed/",
        "homepage": "https://www.sicilialibertaria.it/",
        "language": "it",
        "categories": [
            "Europe", "Theory & Strategy", "Anticapitalism",
            "No War", "Antifascism",
        ],
        "originCountry": "Italy",
        "originCountryCode": "IT",
        "originRegion": "Southern Europe",
        "maxNewItems": 3,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Anarres Info",
        "url": "https://anarresinfo.org/feed/",
        "homepage": "https://anarresinfo.org/",
        "language": "it",
        "categories": [
            "Europe", "Movement News", "Theory & Strategy",
            "No War", "Anticapitalism",
        ],
        "originCountry": "Italy",
        "originCountryCode": "IT",
        "originRegion": "Southern Europe",
        "maxNewItems": 3,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "European Digital Rights",
        "url": "https://edri.org/feed/",
        "homepage": "https://edri.org/",
        "language": "en",
        "categories": [
            "Europe", "Cyberactivism", "No Borders",
            "Antiracism", "Anti-Rep & Prisons",
        ],
        "originCountry": "Belgium",
        "originCountryCode": "BE",
        "originRegion": "Europe",
        "maxNewItems": 4,
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Access Now",
        "url": "https://www.accessnow.org/feed/",
        "homepage": "https://www.accessnow.org/",
        "language": "en",
        "categories": [
            "Global", "Cyberactivism", "No Borders",
            "Antiracism", "Anti-Rep & Prisons",
        ],
        "originRegion": "Global",
        "maxNewItems": 4,
        "minArticleTextLength": 700,
        "articleSelectors": ["article", ".entry-content", "main"],
    },
    {
        "name": "Tactical Tech",
        "url": "https://tacticaltech.org/rss.xml",
        "homepage": "https://tacticaltech.org/",
        "language": "en",
        "categories": ["Global", "Cyberactivism", "Theory & Strategy"],
        "originRegion": "Global",
        "maxNewItems": 3,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", "main"],
    },
    {
        "name": "Digitalcourage",
        "url": "https://digitalcourage.de/rss.xml",
        "homepage": "https://digitalcourage.de/",
        "language": "de",
        "categories": [
            "Europe", "Cyberactivism",
            "Anti-Rep & Prisons", "Anticapitalism",
        ],
        "originCountry": "Germany",
        "originCountryCode": "DE",
        "originRegion": "Europe",
        "maxNewItems": 4,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", "main"],
    },
    {
        "name": "No Trace Project",
        "url": "https://www.notrace.how/rss.xml",
        "homepage": "https://www.notrace.how/",
        "language": "en",
        "categories": [
            "Global", "Cyberactivism", "Anti-Rep & Prisons",
            "Theory & Strategy", "Anarchism",
        ],
        "originRegion": "Global",
        "maxNewItems": 4,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", "main"],
    },
    {
        "name": "Animal Rising",
        "url": "https://www.animalrising.org/blog-feed.xml",
        "homepage": "https://www.animalrising.org/",
        "language": "en",
        "categories": [
            "Europe", "Animal Liberation",
            "Demonstrations", "Anti-Rep & Prisons",
        ],
        "originCountry": "United Kingdom",
        "originCountryCode": "GB",
        "originRegion": "Europe",
        "maxNewItems": 4,
        "minArticleTextLength": 650,
        "articleSelectors": ["article", "main"],
    },
]

_wrn_known_source_names_186 = {
    safe_lower(item.get("name"))
    for bucket in quellen.values()
    for item in bucket
    if isinstance(item, dict)
}
for _wrn_source in _wrn_extra_sources_186:
    if safe_lower(_wrn_source.get("name")) in _wrn_known_source_names_186:
        continue
    _wrn_primary_category = _wrn_source.get("categories", ["Global"])[0]
    quellen.setdefault(_wrn_primary_category, []).append(_wrn_source)
    _wrn_known_source_names_186.add(safe_lower(_wrn_source.get("name")))
# WRN SOURCE BALANCE 1.8.6 END


def rotate_source_buckets(source_buckets):
    """Rotate categories and sources so a timed run never starves the tail."""
    if os.environ.get("WRN_NEWS_SOURCE_NAMES", "").strip():
        return source_buckets
    buckets = list(source_buckets.items())
    if not buckets:
        return source_buckets
    rotation_hours = max(
        1,
        int(os.environ.get("WRN_SOURCE_ROTATION_HOURS", "2")),
    )
    rotation_slot = int(time.time() // (rotation_hours * 60 * 60))
    category_offset = rotation_slot % len(buckets)
    buckets = buckets[category_offset:] + buckets[:category_offset]
    rotated = {}
    for index, (category, sources) in enumerate(buckets):
        rows = list(sources)
        if rows:
            source_offset = (rotation_slot + index) % len(rows)
            rows = rows[source_offset:] + rows[:source_offset]
        rotated[category] = rows
    print(
        "[ZEITPLAN] Rotierende Quellenreihenfolge: "
        f"{rotation_hours}-Stunden-Slot {rotation_slot}, "
        f"{sum(len(rows) for rows in rotated.values())} Quellen."
    )
    return rotated


quellen = rotate_source_buckets(quellen)

ARTICLE_MIN_LENGTHS = {
    safe_lower(source.get("name")): max(
        350,
        int(source.get("minArticleTextLength", 700)),
    )
    for bucket in quellen.values()
    for source in bucket
    if isinstance(source, dict) and safe_text(source.get("name"))
}
# WRN SOURCE EXPANSION 1.8.5 END

SPAM_BLACKLIST = [
    "sicherheitslage verschlimmert",
    "mordeaffen",
    "kurt gustav wilckens"
]

# Quellen mit abgeschnittenen RSS-Texten sollen die App nicht dominieren.
# Vollständige Artikel bleiben von dieser Grenze unberührt.
MAX_INCOMPLETE_PER_SOURCE = 6
INCOMPLETE_SOURCE_LIMITS = {
    "anarchist news": 4,
}
INCOMPLETE_MARKERS = (
    "read more",
    "continue reading",
    "continue to read",
    "read the full article",
    "full story at",
    "weiterlesen",
    "mehr lesen",
    " appeared first on ",
    "no text available",
    "full text of this article is protected",
)

REGION_CATEGORIES = {
    "Global", "Europe", "Africa", "North America",
    "Latin America", "Asia", "Australia & NZ",
}
COUNTRY_PRIMARY_REGIONS = {
    "DZ": "Africa", "AO": "Africa", "BJ": "Africa", "BW": "Africa",
    "BF": "Africa", "BI": "Africa", "CM": "Africa", "CD": "Africa",
    "CG": "Africa", "CI": "Africa", "EG": "Africa", "ET": "Africa",
    "GH": "Africa", "KE": "Africa", "MA": "Africa", "MZ": "Africa",
    "NG": "Africa", "RW": "Africa", "SN": "Africa", "SO": "Africa",
    "ZA": "Africa", "SD": "Africa", "TZ": "Africa", "TN": "Africa",
    "UG": "Africa", "ZM": "Africa", "ZW": "Africa",
    "US": "North America", "CA": "North America", "GL": "North America",
    "MX": "Latin America", "AR": "Latin America", "BO": "Latin America",
    "BR": "Latin America", "CL": "Latin America", "CO": "Latin America",
    "CR": "Latin America", "CU": "Latin America", "EC": "Latin America",
    "GT": "Latin America", "HT": "Latin America", "HN": "Latin America",
    "NI": "Latin America", "PA": "Latin America", "PE": "Latin America",
    "PY": "Latin America", "SV": "Latin America", "UY": "Latin America",
    "VE": "Latin America",
    "CN": "Asia", "HK": "Asia", "IN": "Asia", "ID": "Asia",
    "JP": "Asia", "KR": "Asia", "KP": "Asia", "MY": "Asia",
    "MM": "Asia", "NP": "Asia", "PK": "Asia", "PH": "Asia",
    "SG": "Asia", "LK": "Asia", "TH": "Asia", "TW": "Asia",
    "VN": "Asia", "BD": "Asia", "KH": "Asia", "AF": "Asia",
    "IQ": "Asia", "IR": "Asia", "IL": "Asia", "PS": "Asia",
    "LB": "Asia", "SY": "Asia", "JO": "Asia", "YE": "Asia",
    "AU": "Australia & NZ", "NZ": "Australia & NZ", "FJ": "Australia & NZ",
    "PG": "Australia & NZ", "WS": "Australia & NZ", "VU": "Australia & NZ",
    "AL": "Europe", "AT": "Europe", "BE": "Europe", "BG": "Europe",
    "CH": "Europe", "CZ": "Europe", "DE": "Europe", "DK": "Europe",
    "ES": "Europe", "FI": "Europe", "FR": "Europe", "GB": "Europe",
    "GR": "Europe", "HR": "Europe", "HU": "Europe", "IE": "Europe",
    "IT": "Europe", "NL": "Europe", "NO": "Europe", "PL": "Europe",
    "PT": "Europe", "RO": "Europe", "RS": "Europe", "SE": "Europe",
    "TR": "Europe", "UA": "Europe",
}
TOPIC_CATEGORY_PATTERNS = {
    "Labor Struggles": (
        r"\bstrike\b", r"\bstrikers?\b", r"\bworkers?\b", r"\btrade union\b",
        r"\blabou?r\b", r"\bunionis", r"\bstreik", r"\barbeiter", r"\bgewerkschaft",
        r"\bgr[eè]ve", r"\bsyndicat", r"\bhuelga", r"\bsindicat", r"\bgrev",
        r"\bişçi", r"\bemekçi", r"\bsendika", r"\bdireniş",
        r"\btrabajador", r"\btrabalhador", r"\bεργαζ", r"\bαπεργ",
        r"\bрабоч", r"\bзабастов", r"\bعامل", r"\bإضراب", r"\bkarker",
    ),
    "Antifascism": (
        r"\banti[- ]?fasc", r"\bfascis", r"\bneo[- ]?nazi", r"\bfar[- ]right\b",
        r"\bextreme droite\b", r"\bextrema derecha\b", r"\bultradestra\b",
        r"\brechtsextrem", r"\bafd\b", r"\bfaşis", r"\başırı sağ",
        r"\bantifascis", r"\bantifascist", r"\bαντιφασ", r"\bфашис",
        r"\bfaşîst",
    ),
    "Antisexism": (
        r"\bsexism", r"\bmisogyn", r"\bpatriarch", r"\bsexual violence\b",
        r"\bsexual assault\b", r"\bharassment\b", r"\bsexismus", r"\bviolaci[oó]n",
        r"\bviolence sexuelle\b", r"\bviolenza sessuale\b", r"\bcinsiyetçi",
        r"\bcinsel şiddet", r"\bkadına yönelik şiddet", r"\btaciz",
        r"\bviolencia machista", r"\bfeminicid", r"\bfemicid",
        r"\bέμφυλη βία", r"\bпатриарх", r"\bнасилие над женщ",
        r"\bعنف ضد المرأة", r"\bkadın cinayet",
    ),
    "Queer-Feminism": (
        r"\bqueer\b", r"\blgbt", r"\btrans(?:gender|phob| rights?)?\b",
        r"\blesbian", r"\bhomophob", r"\bfeminis", r"\bnon[- ]?binary\b",
        r"\blgbti", r"\bkuir", r"\btransfobi",
        r"\bmujeres?\b", r"\bderechos reproductiv", r"\bγυναικ",
        r"\bфемини", r"\bженщин", r"\bنسوي", r"\bjin\b",
    ),
    "Antiracism": (
        r"\banti[- ]?rac", r"\bracis", r"\bwhite supremacy\b",
        r"\bxenophob", r"\bapartheid\b", r"\brassismus\b",
        r"\bırkçı", r"\bırkçılık", r"\bnefret suçu",
        r"\bdiscriminaci[oó]n racial", r"\bρατσισ", r"\bрасизм",
        r"\bعنصري", r"\birqperest",
    ),
    "No Borders": (
        r"\bmigran", r"\brefugee", r"\basylum\b", r"\bborder", r"\bdeport",
        r"\bimmigration\b", r"\bfl[uü]cht", r"\babschieb", r"\br[eé]fugi",
        r"\bgöçmen", r"\bmülteci", r"\bsığınmacı", r"\bsınır dışı",
        r"\bfrontera", r"\brefugiado", r"\bμετανάστ", r"\bπρόσφυγ",
        r"\bмигран", r"\bбежен", r"\bلاجئ", r"\bمهاجر", r"\bpenaber",
    ),
    "Anticapitalism": (
        r"\banti[- ]?capital", r"\bcapitalis", r"\bclass struggle\b",
        r"\bworking class\b", r"\bneoliberal", r"\bkapitalis", r"\bcapitalismo\b",
        r"\bsermaye", r"\bözelleştir",
        r"\blucha de clases", r"\banticapitalis", r"\bκαπιταλισ",
        r"\bкапитализм", r"\bرأسمالي", r"\bkapîtalîzm",
    ),
    "Theory & Strategy": (
        r"\banarchis", r"\blibertarian communis", r"\bmutual aid\b",
        r"\bdirect action\b", r"\bsyndicalis", r"\bpolitical theory\b",
        r"\brevolutionary strateg", r"\bbook review\b", r"\banarş",
        r"\bdayanışma", r"\bdoğrudan eylem",
        r"\bautogesti[oó]n", r"\bcomunismo libertario", r"\bαναρχ",
        r"\bанарх", r"\bанархи", r"\bلاسلطوي", r"\bئەنارشی",
    ),
    "Anticolonialism": (
        r"\banti[- ]?coloni", r"\bdecoloni", r"\bcolonialis",
        r"\bsettler colon", r"\bcolonial rule\b", r"\bsömürge", r"\bkolonyal",
        r"\bcolonialismo", r"\bdescolon", r"\bαποικιοκρα", r"\bколониал",
        r"\bاستعمار", r"\bkolonyalîzm",
    ),
    "Anti-Imperialism": (
        r"\banti[- ]?imperial", r"\bimperialis", r"\bimperial power\b", r"\bemperyal",
        r"\bαντιιμπεριαλ", r"\bимпериал", r"\bإمبريال", r"\bîmperyal",
    ),
    "Squatting & Housing": (
        r"\bsquat", r"\bhousing\b", r"\btenant", r"\brent strike\b",
        r"\beviction", r"\bhausbesetz", r"\bmiet", r"\blogement\b",
        r"\bbarınma", r"\bkonut", r"\bkira", r"\btahliye",
        r"\bdesalojo", r"\bocupaci[oó]n", r"\bστέγα", r"\bκατάληψη",
        r"\bвыселен", r"\bсквот", r"\bإسكان",
    ),
    "Demonstrations": (
        r"\bprotest", r"\bdemonstrat", r"\brally\b", r"\bmarch\b",
        r"\bmobilis", r"\bkundgebung", r"\bmanifestaci[oó]n\b",
        r"\bprotesto", r"\beylem", r"\byürüyüş", r"\bmiting",
        r"\bmarcha\b", r"\bδιαδήλω", r"\bпротест", r"\bмитинг",
        r"\bاحتجاج", r"\bخۆپیشاندان",
    ),
    "Anti-Rep & Prisons": (
        r"\bprison", r"\barrest", r"\brepress",
        r"\bdetention\b", r"\bincarcer", r"\bpolitical prisoner",
        r"\bprisoner support\b", r"\babolition(?:ist|ism)?\b",
        r"\bpolice (?:violence|brutality|killing|raid|repression)\b",
        r"\bstate repression\b", r"\bknast\b", r"\bgef[aä]ng",
        r"\bcezaevi", r"\bhapishane", r"\bgözaltı", r"\btutuk", r"\bmahkeme",
        r"\bc[aá]rcel", r"\bprisi[oó]n", r"\bdetenid", r"\brepresi[oó]n",
        r"\bφυλακ", r"\bαστυνομ", r"\bтюрьм", r"\bарест", r"\bполици",
        r"\bسجن", r"\bاعتقال", r"\bشرطة", r"\bzindan", r"\bgirtî",
    ),
    "Cyberactivism": (
        r"\bcyber", r"\bdigital rights?\b", r"\bsurveillance\b", r"\bencryption\b",
        r"\bhack(?:er|ing)?\b", r"\bprivacy\b", r"\bopen[- ]source\b",
        r"\bdijital hak", r"\bgözetim", r"\bsansür", r"\bsiber",
        r"\bvigilancia digital", r"\bλογοκρισ", r"\bнаблюден", r"\bцензур",
        r"\bمراقبة", r"\bسانسور",
    ),
    "No War": (
        r"\banti[- ]?war\b", r"\bwar\b", r"\bmilitar", r"\barmy\b",
        r"\bweapons?\b", r"\bconscription\b", r"\bceasefire\b", r"\bkrieg",
        r"\baufr[uü]st", r"\barmement\b", r"\bsavaş", r"\bsilah", r"\basker",
        r"\bguerra\b", r"\bαντιπολεμ", r"\bвойн", r"\bвоенн",
        r"\bحرب", r"\bسلاح", r"\bşer\b",
    ),
    "Animal Liberation": (
        r"\banimal liberation\b", r"\banimal rights?\b", r"\bvegan",
        r"\bslaughterhouse\b", r"\bhunt sab", r"\btierbefrei", r"\bvivisection\b",
        r"\bhayvan hak", r"\bmezbaha",
        r"\bliberaci[oó]n animal", r"\bαπελευθέρωση ζώων", r"\bживотн",
        r"\bحقوق الحيوان",
    ),
    "Eco-Anarchism": (
        r"\bclimate\b", r"\becolog", r"\benvironment", r"\bforest\b",
        r"\bpipeline\b", r"\bfossil fuel", r"\bmining\b", r"\bklima",
        r"\biklim", r"\bekoloji", r"\bçevre", r"\bmaden",
        r"\bcambio clim[aá]tico", r"\bmedio ambiente", r"\bκλίμα",
        r"\bокружающей сред", r"\bклимат", r"\bمناخ", r"\bژینگە",
    ),
    "Indigenous Struggles": (
        r"\bindigenous\b", r"\bfirst nations?\b", r"\bnative peoples?\b",
        r"\bmapuche\b", r"\bzapatist", r"\baboriginal\b", r"\bindigen", r"\byerli halk",
        r"\bpueblos? originarios?", r"\bιθαγεν", r"\bкоренн", r"\bالسكان الأصلي",
    ),
    "Radical Health & Disability": (
        r"\bdisabil", r"\bmental health\b", r"\bpsychiatr", r"\bhealth care\b",
        r"\bhealthcare\b", r"\bclinic\b", r"\bableis", r"\bbehinder",
        r"\bengelli", r"\bruh sağlığı", r"\bsağlık",
    ),
    "Libraries": (
        r"\banarchist librar", r"\bbiblioth[eè]que anarch", r"\bbiblioteca anarqu",
        r"\banarchistische bibliothek\b",
    ),
    "Movement News": (),
}

TOPIC_CATEGORY_STRONG_PATTERNS = {
    "Labor Struggles": (
        r"\bgeneral strike\b", r"\bwildcat strike\b", r"\bstrike action\b",
        r"\bpicket line\b", r"\bcollective bargaining\b", r"\bworkers'? control\b",
        r"\bgenel grev\b", r"\biş bırakma\b", r"\bgreve générale\b",
    ),
    "Antifascism": (
        r"\banti[- ]?fascist action\b", r"\bfascist attack\b",
        r"\bneo[- ]?nazi attack\b", r"\bwhite nationalist\b",
        r"\bantifaschistische aktion\b", r"\bfaşist saldır",
    ),
    "Antisexism": (
        r"\bgender[- ]based violence\b", r"\bdomestic violence\b",
        r"\bsexual abuse\b", r"\bviolence against women\b",
        r"\bpatriarchal violence\b", r"\bfeminist strike\b",
        r"\berkek şiddeti\b", r"\bkadın cinayet",
    ),
    "Queer-Feminism": (
        r"\btrans liberation\b", r"\bqueer liberation\b",
        r"\breproductive justice\b", r"\babortion rights?\b",
        r"\blgbtqia?\+? rights?\b", r"\bpride march\b", r"\bkürtaj hakkı\b",
    ),
    "Antiracism": (
        r"\bracial justice\b", r"\bpolice racism\b", r"\bracist attack\b",
        r"\bwhite supremacist\b", r"\banti[- ]?racist action\b",
        r"\bırkçı saldır",
    ),
    "No Borders": (
        r"\bno borders?\b", r"\brefugee solidarity\b",
        r"\bmigrant solidarity\b", r"\bdeportation flight\b",
        r"\bdetention cent(?:er|re)\b", r"\bsınır dışı edil",
    ),
    "Anticapitalism": (
        r"\bclass war\b", r"\babolish capitalism\b",
        r"\bcapitalist crisis\b", r"\bsocial revolution\b",
        r"\bkapitalist sistem\b",
    ),
    "Theory & Strategy": (
        r"\bpolitical strategy\b", r"\bmovement strategy\b",
        r"\bprefigurative politics\b", r"\bdual power\b",
        r"\bcounter[- ]power\b", r"\banarchist theory\b",
        r"\blibertarian communism\b", r"\bdevrimci strateji\b",
    ),
    "Anticolonialism": (
        r"\bsettler colonialism\b", r"\bcolonial occupation\b",
        r"\bdecolonial struggle\b", r"\bcolonial violence\b",
        r"\bsömürgecilik karşıtı\b",
    ),
    "Anti-Imperialism": (
        r"\banti[- ]?imperialist struggle\b", r"\bimperialist war\b",
        r"\bforeign occupation\b", r"\beconomic imperialism\b",
        r"\bemperyalist savaş\b",
    ),
    "Squatting & Housing": (
        r"\bhousing crisis\b", r"\btenant union\b", r"\brent resistance\b",
        r"\beviction resistance\b", r"\bsquat eviction\b",
        r"\bzwangsräum", r"\bkira grevi\b",
    ),
    "Demonstrations": (
        r"\bmass protest\b", r"\bstreet protest\b", r"\bprotest march\b",
        r"\bsolidarity demonstration\b", r"\bbasın açıklaması\b",
        r"\bkitlesel eylem\b",
    ),
    "Anti-Rep & Prisons": (
        r"\bpolitical prisoner", r"\bprisoner support\b",
        r"\bprison abolition\b", r"\bpolice raid\b",
        r"\bpolice violence\b", r"\bstate repression\b",
        r"\bsolitary confinement\b", r"\banti[- ]?repression\b",
        r"\bcezaevi direnişi\b", r"\bpolis şiddeti\b",
    ),
    "Cyberactivism": (
        r"\bdigital surveillance\b", r"\bstate surveillance\b",
        r"\bdigital repression\b", r"\binternet shutdown\b",
        r"\bdata protection\b", r"\bfree software\b",
    ),
    "No War": (
        r"\banti[- ]?war movement\b", r"\bwar resistance\b",
        r"\bconscientious object", r"\bmilitary occupation\b",
        r"\barms shipment\b", r"\bweapons export\b",
        r"\bceasefire now\b", r"\bsavaş karşıtı\b", r"\bvicdani ret\b",
    ),
    "Animal Liberation": (
        r"\banimal liberation front\b", r"\bfactory farming\b",
        r"\banimal exploitation\b", r"\bslaughterhouse blockade\b",
        r"\bhayvan özgürleş",
    ),
    "Eco-Anarchism": (
        r"\bclimate justice\b", r"\becological crisis\b",
        r"\benvironmental justice\b", r"\bforest occupation\b",
        r"\banti[- ]?mining\b", r"\bfossil infrastructure\b",
        r"\biklim adaleti\b", r"\bekolojik yıkım\b",
    ),
    "Indigenous Struggles": (
        r"\bindigenous sovereignty\b", r"\bindigenous resistance\b",
        r"\bland back\b", r"\btribal sovereignty\b",
        r"\bnative land\b", r"\byerli halkların\b",
    ),
    "Radical Health & Disability": (
        r"\bdisability justice\b", r"\bmad pride\b",
        r"\bpsychiatric abolition\b", r"\bcollective access\b",
        r"\bhealth workers? strike\b", r"\bsağlık emekçi",
    ),
    "Libraries": (
        r"\banarchist archive\b", r"\binfoshop\b",
        r"\bradical librar", r"\bmovement archive\b",
    ),
    "Movement News": (),
}

TOPIC_CATEGORY_MIN_SCORES = {
    "Labor Struggles": 4.2,
    "Queer-Feminism": 4.3,
    "Theory & Strategy": 4.7,
    "Demonstrations": 4.4,
    "Anti-Rep & Prisons": 4.5,
    "No War": 4.5,
    "Radical Health & Disability": 4.5,
}
TOPIC_DEFAULT_MIN_SCORE = 4.0
TOPIC_MAX_ASSIGNMENTS = 3
# Some outlets are explicitly scoped to a movement field (for example
# Anarchist Black Cross prison-support groups). Their source profile remains a
# valid fallback, while broad magazines still require evidence in the article.
TOPIC_SOURCE_FALLBACKS = {
    "Anti-Rep & Prisons",
    "Indigenous Struggles",
    "Animal Liberation",
    "Libraries",
}


def score_article_topics(title, content, configured, primary, source_tags=None):
    configured_list = [
        safe_text(category)
        for category in (configured if isinstance(configured, list) else [configured])
        if safe_text(category)
    ]
    title_text = safe_text(title).casefold()
    content_text = safe_text(content)[:16000].casefold()
    tags_text = " ".join(
        safe_text(tag.get("term") if isinstance(tag, dict) else tag)
        for tag in (source_tags or [])
    ).casefold()
    regex_cache = globals().setdefault("_WRN_TOPIC_REGEX_CACHE", {})

    def compiled(pattern):
        return regex_cache.setdefault(
            pattern,
            re.compile(pattern, flags=re.IGNORECASE),
        )

    def combined(patterns):
        if not patterns:
            return None
        return compiled("(?:" + ")|(?:".join(patterns) + ")")

    def occurrences(regex, value, limit=3):
        if regex is None or not value:
            return 0
        count = 0
        for _ in regex.finditer(value):
            count += 1
            if count >= limit:
                break
        return count

    scores = {}
    for category, patterns in TOPIC_CATEGORY_PATTERNS.items():
        if category == "Movement News":
            continue
        score = 0.0
        if category in configured_list:
            score += 0.75
        if category == primary:
            score += 0.75
        general_regex = combined(patterns)
        if general_regex and general_regex.search(title_text):
            score += 3.25
        if general_regex and tags_text and general_regex.search(tags_text):
            score += 2.5
        content_hits = occurrences(general_regex, content_text, limit=5)
        if content_hits:
            score += 1.55 + (content_hits - 1) * 0.65

        strong_regex = combined(
            TOPIC_CATEGORY_STRONG_PATTERNS.get(category, ())
        )
        if strong_regex and strong_regex.search(title_text):
            score += 5.5
        if strong_regex and tags_text and strong_regex.search(tags_text):
            score += 4.0
        content_hits = occurrences(strong_regex, content_text)
        if content_hits:
            score += 3.0 + (content_hits - 1) * 0.9
        if score:
            scores[category] = round(score, 2)
    return scores


def classify_article(
    title,
    content,
    configured,
    primary,
    source_tags=None,
    origin_country_code="",
):
    configured_list = [
        safe_text(category)
        for category in (configured if isinstance(configured, list) else [configured])
        if safe_text(category)
    ]
    configured_regions = [
        category for category in configured_list
        if category in REGION_CATEGORIES
    ]
    country_region = COUNTRY_PRIMARY_REGIONS.get(
        safe_text(origin_country_code).upper()
    )
    non_global_regions = [
        category for category in configured_regions
        if category != "Global"
    ]
    primary_region = (
        country_region
        or (primary if primary in REGION_CATEGORIES and primary != "Global" else "")
        or (non_global_regions[0] if non_global_regions else "")
        or (primary if primary in REGION_CATEGORIES else "")
        or (configured_regions[0] if configured_regions else "")
        or "Global"
    )
    categories = [primary_region]

    scores = score_article_topics(
        title,
        content,
        configured_list,
        primary,
        source_tags,
    )
    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    best_score = ranked[0][1] if ranked else 0.0
    matched_topics = [
        category
        for category, score in ranked
        if (
            score >= TOPIC_CATEGORY_MIN_SCORES.get(
                category,
                TOPIC_DEFAULT_MIN_SCORE,
            )
            and score >= best_score - 1.6
        )
    ][:TOPIC_MAX_ASSIGNMENTS]

    for category in matched_topics:
        if category not in categories:
            categories.append(category)

    assignment_method = "content"
    if not matched_topics:
        # A source profile is only a weak prior. If title, tags and body do not
        # substantiate a topic, assigning every item from a specialised outlet
        # to that topic produces misleading sections (for example culture
        # reviews from a feminist magazine). Keep such items discoverable in
        # Movement News instead of inventing topical certainty.
        configured_topics = [
            category for category in configured_list
            if category in TOPIC_SOURCE_FALLBACKS
        ]
        fallback = (
            primary
            if primary in TOPIC_SOURCE_FALLBACKS
            else configured_topics[0] if len(configured_topics) == 1 else ""
        )
        if fallback:
            categories.append(fallback)
            matched_topics = [fallback]
            assignment_method = "specialised-source"
        else:
            categories.append("Movement News")
            matched_topics = ["Movement News"]
            assignment_method = "editorial-review"

    primary_topic = matched_topics[0]
    secondary_topics = matched_topics[1:]
    best_topic_score = float(scores.get(primary_topic, 0.0))
    if assignment_method == "content":
        confidence = max(0.58, min(0.98, best_topic_score / 8.0))
    elif assignment_method == "specialised-source":
        confidence = 0.58
    else:
        confidence = 0.35

    review_reasons = []
    if confidence < 0.6:
        review_reasons.append("low-topic-confidence")
    if primary_region == "Global" and safe_text(origin_country_code):
        review_reasons.append("country-without-region-map")
    if primary_topic == "Movement News":
        review_reasons.append("no-specific-topic-evidence")

    return {
        "categories": categories,
        "primaryRegion": primary_region,
        "primaryTopic": primary_topic,
        "secondaryTopics": secondary_topics,
        "classificationConfidence": round(confidence, 3),
        "classificationMethod": assignment_method,
        "topicScores": {
            key: value for key, value in ranked[:6]
        },
        "editorialReview": bool(review_reasons),
        "editorialReviewReasons": review_reasons,
    }


def infer_article_categories(
    title,
    content,
    configured,
    primary,
    source_tags=None,
    origin_country_code="",
):
    return classify_article(
        title,
        content,
        configured,
        primary,
        source_tags,
        origin_country_code,
    )["categories"]


GANCIO_EVENT_DATE_RE = re.compile(
    r"^\[(?P<date>\d{4}-\d{2}-\d{2})(?:[ T][^\]]+)?\]\s*"
)


def normalize_feed_event(title, published):
    clean_title = safe_text(title, "Termin ohne Titel")
    match = GANCIO_EVENT_DATE_RE.match(clean_title)
    if not match:
        return clean_title, safe_text(
            published,
            datetime.now().isoformat(),
        )
    return (
        GANCIO_EVENT_DATE_RE.sub("", clean_title).strip() or clean_title,
        f"{match.group('date')}T12:00:00Z",
    )


def repair_overbroad_archive_categories(article):
    if article.get("kontinent") == "Radar":
        return article
    current = article.get("categories", [article.get("kontinent", "Global")])
    current = current if isinstance(current, list) else [current]
    topic_count = sum(
        1 for category in current if category in TOPIC_CATEGORY_PATTERNS
    )
    if topic_count >= 3:
        article["categories"] = infer_article_categories(
            article.get("title"),
            article.get("content"),
            current,
            article.get("kontinent", "Global"),
        )
    primary_topic = safe_text(article.get("primaryTopic"))
    categories = article.get("categories")
    categories = categories if isinstance(categories, list) else [categories]
    categories = [safe_text(category) for category in categories if safe_text(category)]

    # Normalize every retained archive row as well as newly fetched rows. A
    # source can be skipped temporarily because of backoff, but its published
    # region/category contract must still stay valid in the generated feeds.
    region_candidates = [
        safe_text(article.get("originRegion")),
        *[category for category in categories if category in REGION_CATEGORIES],
        safe_text(article.get("primaryRegion")),
        safe_text(article.get("kontinent")),
    ]
    primary_region = next(
        (
            candidate
            for candidate in region_candidates
            if candidate in REGION_CATEGORIES and candidate != "Global"
        ),
        next(
            (
                candidate
                for candidate in region_candidates
                if candidate in REGION_CATEGORIES
            ),
            "Global",
        ),
    )
    categories = [
        primary_region,
        *[
            category
            for category in categories
            if category not in REGION_CATEGORIES
        ],
    ]
    article["primaryRegion"] = primary_region

    source_name = safe_lower(article.get("quelleName"))
    is_abc_source = (
        "anarchist black cross" in source_name
        or source_name.startswith("abc ")
    )
    if is_abc_source:
        primary_topic = "Anti-Rep & Prisons"
        categories = [
            primary_region,
            primary_topic,
            *[
                category
                for category in categories[1:]
                if category != primary_topic
            ],
        ]
        article["primaryTopic"] = primary_topic
        article["secondaryTopics"] = [
            category
            for category in categories[2:]
            if category in TOPIC_CATEGORY_PATTERNS
        ][: max(0, TOPIC_MAX_ASSIGNMENTS - 1)]
        article["classificationMethod"] = "specialised-source"
        article["classificationConfidence"] = max(
            0.58,
            float(article.get("classificationConfidence") or 0),
        )
    if primary_topic and primary_topic not in categories:
        categories.append(primary_topic)
    article["categories"] = list(dict.fromkeys(categories))
    return article


def save_aggregate_run_status():
    payload = {
        "schemaVersion": 1,
        **AGGREGATE_METRICS,
        "finishedAt": datetime.now(timezone.utc).isoformat(),
        "elapsedSeconds": round(time.monotonic() - AGGREGATE_STARTED_AT, 3),
        "entryErrorCount": len(AGGREGATE_ENTRY_ERRORS),
    }
    temporary = "aggregate-run-status.json.tmp"
    with open(temporary, "w", encoding="utf-8") as report_file:
        json.dump(payload, report_file, ensure_ascii=False, indent=2)
        report_file.write("\n")
    os.replace(temporary, "aggregate-run-status.json")


def content_is_incomplete(text, min_length=350):
    clean = re.sub(r"\s+", " ", str(text or "")).strip().lower()
    try:
        required_length = max(350, int(min_length or 350))
    except (TypeError, ValueError):
        required_length = 350
    if len(clean) < required_length:
        return True
    # Feed teasers normally place these markers at the end. Searching an
    # entire long article produced false positives when its body merely linked
    # to another text with labels such as "read more".
    tail = clean[-700:]
    short_text = len(clean) < max(1200, int(required_length * 1.35))
    for marker in INCOMPLETE_MARKERS:
        # WordPress can append this syndication footer to a genuinely complete
        # article. It only signals a teaser when the text itself is short.
        if marker.strip() == "appeared first on":
            if short_text and marker in clean:
                return True
            continue
        if marker in tail or (short_text and marker in clean):
            return True
    return False


def incomplete_limit_for_source(source_name):
    normalized = str(source_name or "").strip().lower()
    for source_fragment, limit in INCOMPLETE_SOURCE_LIMITS.items():
        if source_fragment in normalized:
            return limit
    return MAX_INCOMPLETE_PER_SOURCE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'}
AUTONOMOUS_TIMEOUT = (8.0, 15.0) 

retry_strategy = Retry(total=2, backoff_factor=1.0, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["GET"])
adapter = HTTPAdapter(max_retries=retry_strategy)

http = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True})
http.mount("https://", adapter)
http.mount("http://", adapter)

session = requests.Session()
session.mount("https://", adapter)

RADAR_API_URL = "https://radar.squat.net/api/1.2/search/events.json"
RADAR_PAGE_SIZE = 500
RADAR_PAGE_ATTEMPTS = 4
RADAR_API_FIELDS = ",".join((
    "body",
    "category",
    "date_time",
    "image",
    "price",
    "link",
    "offline",
    "offline:address",
    "offline:map",
    "offline:timezone",
    "topic",
    "title",
    "language",
    "url",
    "created",
    "uuid",
))

LAYOUT_FILES = [
    'logo', 'banner', 'favicon', 'sidebar', 'footer', 'avatar', 'pixel',
    'nav_', 'blank.gif', 'spacer.gif', 'sprite', 'shop-slide',
    'homepage-graphic', 'social-share',
]
STRUCTURAL_IMAGE_TOKENS = (
    'navigation', 'navbar', 'menu', 'header', 'footer', 'sidebar',
    'related', 'recommended', 'social', 'share', 'advert', 'sponsor',
    'donate', 'shop', 'newsletter', 'breadcrumb',
)
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
NON_IMAGE_MEDIA_EXTENSIONS = (
    '.mp4', '.m4v', '.mov', '.webm', '.ogv',
    '.mp3', '.m4a', '.aac', '.ogg', '.oga', '.wav', '.flac', '.m3u8',
)

def clean_image_url(url, base_url):
    if not url: return None
    full_url = urljoin(base_url, url)
    pathname = safe_lower(urlparse(full_url).path)
    if pathname.endswith(NON_IMAGE_MEDIA_EXTENSIONS):
        return None
    filename = full_url.split('/')[-1].lower()
    if any(kw in filename for kw in LAYOUT_FILES): return None
    # Theme/plugin paths are almost always chrome.  A generic ``/assets/``
    # path, however, is also commonly used for legitimate article media.
    if any(kw in full_url.lower() for kw in ['/themes/', '/plugins/']): return None
    return full_url


def extract_meta_image(soup, base_url):
    """Return the publisher-declared lead image, if present."""
    if not soup:
        return None
    selectors = (
        ('meta', {'property': 'og:image:secure_url'}),
        ('meta', {'property': 'og:image:url'}),
        ('meta', {'property': 'og:image'}),
        ('meta', {'name': 'twitter:image'}),
        ('meta', {'name': 'twitter:image:src'}),
        ('meta', {'itemprop': 'image'}),
    )
    for tag_name, attrs in selectors:
        tag = soup.find(tag_name, attrs=attrs)
        candidate = clean_image_url(
            tag.get('content') if tag else '',
            base_url,
        )
        if candidate:
            return candidate
    image_src = soup.find('link', rel=lambda value: value and 'image_src' in value)
    return clean_image_url(
        image_src.get('href') if image_src else '',
        base_url,
    )


def image_is_structural(image):
    for parent in image.parents:
        if getattr(parent, 'name', None) in {'nav', 'header', 'footer', 'aside'}:
            return True
        classes = parent.get('class', []) if hasattr(parent, 'get') else []
        marker = ' '.join((
            safe_text(parent.get('id')) if hasattr(parent, 'get') else '',
            ' '.join(classes) if isinstance(classes, list) else safe_text(classes),
        )).casefold()
        if marker and any(token in marker for token in STRUCTURAL_IMAGE_TOKENS):
            return True
    return False


def collect_image_urls(soup, base_url, limit=24):
    images = []
    if not soup:
        return images
    for image in soup.find_all('img'):
        if image_is_structural(image):
            continue
        width = safe_text(image.get('width'))
        height = safe_text(image.get('height'))
        if width.isdigit() and int(width) < 180:
            continue
        if height.isdigit() and int(height) < 100:
            continue
        src = (
            image.get('data-src')
            or image.get('data-lazy-src')
            or image.get('data-original')
            or image.get('data-lazy')
            or image.get('src')
        )
        srcset = safe_text(image.get('data-srcset') or image.get('srcset'))
        if srcset:
            srcset_candidates = [
                part.strip().split(' ')[0]
                for part in srcset.split(',')
                if part.strip()
            ]
            if srcset_candidates:
                src = srcset_candidates[-1]
        candidate = clean_image_url(src, base_url)
        if candidate and candidate.startswith(('http://', 'https://')) and candidate not in images:
            images.append(candidate)
        if len(images) >= limit:
            break
    return images


DEFAULT_ARTICLE_SELECTORS = (
    "[itemprop='articleBody']",
    "article [itemprop='articleBody']",
    ".et_pb_post_content",
    "article .entry-content",
    ".article-content",
    ".entry-content",
    ".wp-block-post-content",
    ".single-post-content",
    ".td-post-content",
    ".post-content",
    ".story-content",
    ".article-body",
    "article",
    "main",
)


def select_article_root(soup, configured_selectors=None):
    selectors = [
        safe_text(selector)
        for selector in (configured_selectors or [])
        if safe_text(selector)
    ]
    for selector in (*selectors, *DEFAULT_ARTICLE_SELECTORS):
        try:
            candidate = soup.select_one(selector)
        except Exception:
            candidate = None
        if candidate and len(candidate.get_text(" ", strip=True)) >= 250:
            return candidate
    return soup


def extract_article_text(root):
    if not root:
        return ""
    for unwanted in root.select(
        "script, style, nav, footer, aside, form, noscript, "
        ".newsletter, .related, .recommended, .social-share, .advertisement"
    ):
        unwanted.decompose()
    paragraphs = [
        inline_preserving_text(paragraph)
        for paragraph in root.find_all(("p", "li"))
    ]
    text_blocks = [
        paragraph
        for paragraph in paragraphs
        if len(paragraph) > 30
    ]
    return "\n\n".join(text_blocks)


def extract_article_content(root, base_url):
    """Preserve useful article text and images in their publisher order."""
    if not root:
        return [], ""
    clean_root = BeautifulSoup(str(root), "html.parser")
    for unwanted in clean_root.select(
        "script, style, nav, footer, aside, form, noscript, iframe, "
        ".newsletter, .related, .recommended, .social-share, .advertisement, "
        ".comments, .share-buttons, .post-navigation"
    ):
        unwanted.decompose()

    blocks = []
    text_blocks = []
    seen_images = set()

    def append_image(image, caption=""):
        if not image or image_is_structural(image):
            return
        src = (
            image.get('data-src')
            or image.get('data-lazy-src')
            or image.get('data-original')
            or image.get('data-lazy')
            or image.get('src')
        )
        srcset = safe_text(image.get('data-srcset') or image.get('srcset'))
        if srcset:
            candidates = [
                part.strip().split(' ')[0]
                for part in srcset.split(',')
                if part.strip()
            ]
            if candidates:
                src = candidates[-1]
        image_url = clean_image_url(src, base_url)
        if (
            not image_url
            or not image_url.startswith(('http://', 'https://'))
            or image_url in seen_images
        ):
            return
        seen_images.add(image_url)
        blocks.append({
            "type": "image",
            "url": image_url,
            "alt": safe_text(image.get('alt')),
            "caption": safe_text(caption),
        })

    for node in clean_root.find_all((
        "h2", "h3", "h4", "p", "li", "blockquote", "figure", "img"
    )):
        if node.name == "img":
            if node.find_parent("figure"):
                continue
            append_image(node)
            continue
        if node.name == "figure":
            figure_caption = node.find("figcaption")
            append_image(
                node.find("img"),
                inline_preserving_text(figure_caption) if figure_caption else "",
            )
            continue
        if node.name in {"p", "li"} and node.find_parent(("blockquote", "figure")):
            continue
        value = safe_text(inline_preserving_text(node))
        minimum = 4 if node.name.startswith("h") else 30
        if len(value) < minimum:
            continue
        if node.name.startswith("h"):
            block = {"type": "heading", "level": int(node.name[1]), "text": value}
        elif node.name == "blockquote":
            block = {"type": "quote", "text": value}
        else:
            block = {"type": "paragraph", "text": value}
        blocks.append(block)
        text_blocks.append(value)
        if len(blocks) >= 400:
            break
    return blocks, "\n\n".join(text_blocks)


def extract_json_ld_article_content(soup):
    """Use publisher-provided Article JSON-LD when the visible page is partial."""

    candidates = []

    def visit(value):
        if isinstance(value, dict):
            body = value.get("articleBody")
            if isinstance(body, str):
                cleaned = BeautifulSoup(body, "html.parser").get_text(
                    separator="\n\n"
                ).strip()
                if len(cleaned) >= 250:
                    candidates.append(cleaned)
            for nested in value.values():
                if isinstance(nested, (dict, list)):
                    visit(nested)
        elif isinstance(value, list):
            for nested in value:
                visit(nested)

    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = script.string or script.get_text(" ", strip=True)
        if not safe_text(raw):
            continue
        try:
            visit(json.loads(raw))
        except (TypeError, ValueError, json.JSONDecodeError):
            continue

    if not candidates:
        return [], ""
    text = max(candidates, key=len)
    paragraphs = [
        safe_text(paragraph)
        for paragraph in re.split(r"\n\s*\n+", text)
        if len(safe_text(paragraph)) >= 30
    ][:400]
    return [
        {"type": "paragraph", "text": paragraph}
        for paragraph in paragraphs
    ], "\n\n".join(paragraphs)


def scrape_article_page(
    link,
    feed,
    existing_text="",
    existing_image="",
    existing_images=None,
    existing_blocks=None,
):
    """Load a publisher page once and preserve its full text and media."""

    full_text = safe_text(existing_text)
    image_url = clean_image_url(existing_image, link)
    image_urls = list(existing_images or [])
    content_blocks = list(existing_blocks or [])

    try:
        time.sleep(1.5)
        html_req = http.get(
            link,
            headers=HEADERS,
            timeout=AUTONOMOUS_TIMEOUT,
        )
        html_req.raise_for_status()
        soup = BeautifulSoup(html_req.text, "html.parser")
        article_root = select_article_root(
            soup,
            feed.get("articleSelectors"),
        )

        for candidate in collect_image_urls(article_root, link):
            if candidate not in image_urls:
                image_urls.append(candidate)

        if not image_url:
            image_url = extract_meta_image(soup, link)
            if image_url and image_url not in image_urls:
                image_urls.insert(0, image_url)

        if not image_url:
            for img in soup.find_all("img"):
                src = (
                    img.get("src")
                    or img.get("data-src")
                    or img.get("data-lazy-src")
                    or img.get("data-original")
                    or img.get("data-lazy")
                )
                image_url = clean_image_url(src, link)
                if image_url:
                    if image_url not in image_urls:
                        image_urls.append(image_url)
                    break

        page_blocks, page_text = extract_article_content(article_root, link)
        json_ld_blocks, json_ld_text = extract_json_ld_article_content(soup)
        if len(json_ld_text) > len(page_text):
            page_blocks, page_text = json_ld_blocks, json_ld_text
        full_text = prefer_inline_preserving_text(full_text, page_text)
        if len(page_text) >= 250 and page_blocks:
            content_blocks = page_blocks

        waf_phrases = (
            "Please wait a moment while we ensure the security",
            "Protected by Anubis",
            "Enable JavaScript and cookies",
            "Verifying your browser before connecting",
            "Making sure you're not a bot",
        )
        if any(
            phrase.casefold() in full_text.casefold()
            for phrase in waf_phrases
        ):
            full_text = safe_text(existing_text)
            content_blocks = list(existing_blocks or [])
    except Exception:
        return full_text, image_url, image_urls, content_blocks

    return full_text, image_url, image_urls, content_blocks


# =================================================================
# 1. ARCHIV LADEN (Das clevere Gedächtnis, das nie vergisst)
# =================================================================
archiv_dict = {}
gesehene_titel = set()

try:
    for archive_file in ('news.json', 'events.json'):
        if not os.path.exists(archive_file):
            continue
        with open(archive_file, 'r', encoding='utf-8') as f:
            alter_stand = json.load(f)
            for art in alter_stand:
                # Nachrichten und Termine werden getrennt veröffentlicht, aber
                # für Deduplizierung gemeinsam in den Arbeitsspeicher geladen.
                if "link" in art:
                    archiv_dict[art['link']] = art
                    titel_clean = art.get('title', '').lower().strip()
                    gesehene_titel.add(titel_clean)
except Exception as e:
    print("Starte mit leerem Archiv (Erster Durchlauf).")

radar_count = 0 
TARGET_SOURCE_NAMES = {
    name.strip().casefold()
    for name in os.environ.get("WRN_NEWS_SOURCE_NAMES", "").split(",")
    if name.strip()
}
if "autostraddle news" in TARGET_SOURCE_NAMES:
    for archive_key, archive_item in list(archiv_dict.items()):
        if safe_lower(archive_item.get("quelleName")) == "autostraddle":
            archiv_dict.pop(archive_key, None)


def radar_terms(value):
    if not isinstance(value, list):
        return []
    return [
        safe_text(item.get("name"))
        for item in value
        if isinstance(item, dict) and safe_text(item.get("name"))
    ]


def radar_iso_date(raw_value):
    try:
        return datetime.fromtimestamp(
            int(str(raw_value)),
            tz=timezone.utc,
        ).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError, OSError):
        return ""


def radar_image_url(event):
    image = event.get("image")
    if not isinstance(image, dict):
        return ""
    file_ref = image.get("file")
    if not isinstance(file_ref, dict):
        return ""
    uri = safe_text(file_ref.get("uri"))
    if not uri:
        return ""
    file_id = safe_text(file_ref.get("id"))
    filename = safe_text(file_ref.get("filename"))
    if file_id and filename:
        return (
            "https://radar.squat.net/sites/default/files/"
            f"styles/large/public/{filename}"
        )
    return ""


def radar_price_text(value):
    if value is None:
        return ""
    if isinstance(value, (str, int, float)):
        return safe_text(value)
    if isinstance(value, dict):
        parts = [
            safe_text(value.get(key))
            for key in ("value", "amount", "description", "summary")
        ]
        return " · ".join(part for part in parts if part)
    if isinstance(value, list):
        return " · ".join(
            part for part in (radar_price_text(item) for item in value) if part
        )
    return ""


def fetch_radar_events():
    """Fetch the current structured Radar.squat event search.

    Radar's public search already limits results to events whose end time is
    current or in the future. The API limits a response page, so every page is
    requested through its stable ``offset`` parameter and merged by Radar's
    event id. No country competes with another country for a fixed global cap.
    """
    raw_results = {}
    first_payload = None
    reported_count = None
    offset = 0
    page_count = 0
    complete = True
    fetch_error = ""

    while reported_count is None or offset < reported_count:
        payload = None
        last_page_error = None
        for attempt in range(1, RADAR_PAGE_ATTEMPTS + 1):
            try:
                response = session.get(
                    RADAR_API_URL,
                    params={
                        "limit": RADAR_PAGE_SIZE,
                        "offset": offset,
                        "fields": RADAR_API_FIELDS,
                    },
                    headers={
                        **HEADERS,
                        "Accept": "application/json",
                    },
                    timeout=(10, 65),
                )
                response.raise_for_status()
                payload = response.json()
                break
            except Exception as page_error:
                last_page_error = page_error
                if attempt < RADAR_PAGE_ATTEMPTS:
                    delay = (1, 4, 12)[attempt - 1]
                    print(
                        "  [RADAR WIEDERHOLUNG] "
                        f"Offset {offset}, Versuch {attempt + 1}/"
                        f"{RADAR_PAGE_ATTEMPTS} in {delay}s: {page_error}"
                    )
                    time.sleep(delay)

        if payload is None:
            if not raw_results:
                raise last_page_error or RuntimeError(
                    "Radar API lieferte keine Daten."
                )
            complete = False
            fetch_error = safe_text(last_page_error, "Radar-Seite nicht erreichbar")
            break

        result = payload.get("result")
        if not isinstance(result, dict):
            raise ValueError(
                f"Radar API returned no result object at offset {offset}."
            )
        if first_payload is None:
            first_payload = payload
        reported_count = int(payload.get("count") or len(result))
        if not result:
            break
        before = len(raw_results)
        raw_results.update(result)
        page_count += 1
        next_offset = offset + len(result)
        if next_offset <= offset:
            raise ValueError("Radar API pagination did not advance.")
        if len(raw_results) == before and next_offset < reported_count:
            raise ValueError(
                f"Radar API repeated a page at offset {offset}."
            )
        offset = next_offset
        if offset < reported_count:
            time.sleep(0.15)

    if reported_count and len(raw_results) < reported_count:
        complete = False
        if not fetch_error:
            fetch_error = (
                "Radar API pagination was incomplete: "
                f"{len(raw_results)} of {reported_count} events loaded."
            )

    global_payload = first_payload or {}

    fetched = []
    for api_id, event in raw_results.items():
        if not isinstance(event, dict):
            continue

        dates = event.get("date_time")
        if not isinstance(dates, list) or not dates:
            continue
        date_info = dates[0] if isinstance(dates[0], dict) else {}
        event_start = radar_iso_date(date_info.get("value"))
        event_end = radar_iso_date(date_info.get("value2"))
        if not event_start:
            continue

        locations = event.get("offline")
        location = (
            locations[0]
            if isinstance(locations, list)
            and locations
            and isinstance(locations[0], dict)
            else {}
        )
        address = location.get("address")
        if not isinstance(address, dict):
            address = {}
        map_data = location.get("map")
        if not isinstance(map_data, dict):
            map_data = {}

        body = event.get("body")
        body_html = (
            safe_text(body.get("value"))
            if isinstance(body, dict)
            else safe_text(body)
        )
        content = BeautifulSoup(
            body_html,
            "html.parser",
        ).get_text(separator="\n\n").strip()
        if not content:
            content = "Weitere Informationen auf der Radar.squat-Originalseite."

        title = safe_text(event.get("title"), "Termin ohne Titel")
        canonical_url = safe_text(
            event.get("url"),
            f"https://radar.squat.net/en/node/{api_id}",
        )
        categories = radar_terms(event.get("category"))
        topics = radar_terms(event.get("topic"))
        language = safe_lower(event.get("language"), "und")
        venue = safe_text(address.get("name_line"), safe_text(location.get("title")))
        city = safe_text(address.get("locality"))
        country = safe_text(address.get("country")).upper()
        street = safe_text(address.get("thoroughfare"))
        postal = safe_text(address.get("postal_code"))
        external_links = [
            safe_text(item.get("url"))
            for item in event.get("link", [])
            if isinstance(item, dict) and safe_text(item.get("url"))
        ]

        fetched.append({
            "kontinent": "Radar",
            "categories": ["Radar"],
            "quelleName": "Radar.squat",
            "author": "Radar.squat",
            "title": title,
            "link": canonical_url,
            "pubDate": event_start,
            "content": content,
            "contentComplete": True,
            "image": radar_image_url(event),
            "language": language,
            "languages": [language],
            "sourceType": "radar-api",
            "eventApiId": safe_text(api_id),
            "eventUuid": safe_text(event.get("uuid")),
            "eventStart": event_start,
            "eventEnd": event_end or event_start,
            "eventTimezone": safe_text(location.get("timezone")),
            "eventCountry": country,
            "eventCity": city,
            "eventVenue": venue,
            "eventAddress": street,
            "eventPostal": postal,
            "eventLatitude": safe_text(map_data.get("lat")),
            "eventLongitude": safe_text(map_data.get("lon")),
            "eventCategories": categories,
            "eventTags": topics,
            "eventGroups": [],
            "eventPrice": radar_price_text(event.get("price")),
            "eventExternalLinks": external_links,
            "eventRecurrence": safe_text(date_info.get("rrule")),
            "sourceHomepage": "https://radar.squat.net",
        })

    fetched.sort(key=lambda item: item.get("eventStart", ""))
    return fetched, {
        "reportedCount": int(global_payload.get("count") or len(fetched)),
        "loadedCount": len(fetched),
        "pageCount": page_count,
        "complete": complete,
        "nextOffset": offset,
        "error": fetch_error,
        "facets": (
            global_payload.get("facets")
            if isinstance(global_payload.get("facets"), dict)
            else {}
        ),
    }


try:
    if TARGET_SOURCE_NAMES or SKIP_RADAR:
        raise LookupError("news-only-refresh")
    radar_events, radar_metadata = fetch_radar_events()
    # Only a complete global response may replace the previous Radar rows.
    # On a transient network failure the successfully loaded pages are merged
    # into the archive, so a partial run can never shrink the event collection.
    if radar_metadata["complete"]:
        for archive_key, archive_item in list(archiv_dict.items()):
            old_source = safe_lower(archive_item.get("quelleName"))
            old_link = safe_lower(archive_item.get("link"))
            if (
                archive_item.get("sourceType") in {"radar-api", "radar-api-meta"}
                or old_source.startswith("radar squat.net")
                or (
                    archive_item.get("kontinent") == "Radar"
                    and "radar.squat.net" in old_link
                )
            ):
                archiv_dict.pop(archive_key, None)
    for radar_event in radar_events:
        archiv_dict[radar_event["link"]] = radar_event
    radar_count = sum(
        1 for item in archiv_dict.values()
        if item.get("kontinent") == "Radar"
    )
    if radar_metadata["complete"]:
        print(
            "\n--- Radar.squat API ---\n"
            f"  [OK] {radar_count} aktuelle Termine geladen "
            f"({radar_metadata['pageCount']} Seiten; "
            f"Radar meldet {radar_metadata['reportedCount']})."
        )
    else:
        print(
            "\n--- Radar.squat API ---\n"
            f"  [TEILFORTSCHRITT] {radar_metadata['loadedCount']} Termine "
            f"aus {radar_metadata['pageCount']} Seiten geladen und mit dem "
            f"vorhandenen Bestand zusammengeführt; jetzt {radar_count}. "
            f"Nächster Lauf versucht den vollständigen Bestand erneut. "
            f"Fehler: {radar_metadata['error']}"
        )
except Exception as radar_error:
    if TARGET_SOURCE_NAMES or SKIP_RADAR:
        radar_count = sum(
            1
            for archive_item in archiv_dict.values()
            if (
                archive_item.get("sourceType") == "radar-api"
                or safe_lower(archive_item.get("quelleName")).startswith(
                    "radar squat.net"
                )
            )
        )
        print(
            "\n--- Radar.squat API ---\n"
            "  [ÜBERSPRUNGEN] Separater Nachrichten-Workflow; "
            f"{radar_count} vorhandene Termine bleiben erhalten."
        )
    else:
        radar_count = sum(
            1
            for archive_item in archiv_dict.values()
            if archive_item.get("kontinent") == "Radar"
        )
        print(
            "\n--- Radar.squat API ---\n"
            "  [FEHLER] Strukturierter Abruf fehlgeschlagen; "
            f"bestehende Radar-Termine bleiben erhalten: {radar_error}"
        )

# HILFSFUNKTION: CHECKPOINTS SPEICHERN (Sicherheit gegen Abstürze)
def atomic_json_write(path, payload):
    temporary = f"{path}.tmp"
    with open(temporary, "w", encoding="utf-8") as output:
        json.dump(payload, output, ensure_ascii=False, indent=2)
        output.write("\n")
    os.replace(temporary, path)


def save_checkpoint(force=False):
    global _LAST_CHECKPOINT_AT
    now = time.monotonic()
    if (
        not force
        and _LAST_CHECKPOINT_AT
        and now - _LAST_CHECKPOINT_AT < CHECKPOINT_INTERVAL_SECONDS
    ):
        return False

    alle = list(archiv_dict.values())
    try:
        # Sortieren nach Datum
        alle.sort(key=lambda x: x.get('pubDate', ''), reverse=True)
    except:
        pass
    
    events = [item for item in alle if item.get('kontinent') == 'Radar']
    try:
        events.sort(
            key=lambda item: (
                item.get("eventStart")
                or item.get("pubDate")
                or ""
            )
        )
    except Exception:
        pass
    news_candidates = [
        repair_overbroad_archive_categories(item)
        for item in alle
        if item.get('kontinent') != 'Radar'
    ]

    # Von abgeschnittenen Vorschautexten bleiben pro Quelle nur die aktuellsten
    # Einträge. So verdrängen Feeds mit ständigem „Read more“ keine Volltexte.
    incomplete_counts = {}
    news = []
    for article in news_candidates:
        source = str(article.get('quelleName') or 'Unbekannte Quelle')
        article_language = article.get('language') or (
            article.get('languages', ['und'])[0]
            if isinstance(article.get('languages'), list)
            and article.get('languages')
            else 'und'
        )
        article['content'] = trim_repeated_translation(
            article.get('content'),
            article_language,
        )
        article['contentBlocks'] = trim_repeated_translation_blocks(
            article.get('contentBlocks'),
            article_language,
        )
        minimum_length = ARTICLE_MIN_LENGTHS.get(
            safe_lower(source),
            700,
        )
        incomplete = (
            article.get('contentComplete') is False
            or content_is_incomplete(
                article.get('content'),
                minimum_length,
            )
        )
        article['contentComplete'] = not incomplete
        if incomplete:
            count = incomplete_counts.get(source, 0)
            if count >= incomplete_limit_for_source(source):
                continue
            incomplete_counts[source] = count + 1
        news.append(article)
        if len(news) >= 2000:
            break

    atomic_json_write("news.json", news)
    atomic_json_write("events.json", events)
    _LAST_CHECKPOINT_AT = time.monotonic()
    print(
        "[CHECKPOINT] "
        f"{len(news)} Nachrichten und {len(events)} Termine atomar gespeichert."
    )
    return True


if os.environ.get("WRN_RADAR_ONLY", "").strip().lower() in {
    "1", "true", "yes", "on"
}:
    save_checkpoint(force=True)
    save_aggregate_error_report()
    AGGREGATE_METRICS["stoppedForBudget"] = aggregate_budget_exhausted()
    save_aggregate_run_status()
    print(
        "\n[ERFOLG] Radar.squat wurde separat aktualisiert: "
        f"{radar_count} strukturierte Termine."
    )
    raise SystemExit(0)


def source_key(feed):
    return (
        safe_lower(feed.get("name")),
        safe_lower(feed.get("url") or feed.get("feedUrl")).rstrip("/"),
    )


def load_fast_health_index():
    try:
        with open("source-health.json", "r", encoding="utf-8") as source_file:
            payload = json.load(source_file)
    except (OSError, ValueError, TypeError):
        return {}, {}
    rows = payload.values() if isinstance(payload, dict) else payload
    by_name = {}
    by_url = {}
    for row in rows if isinstance(rows, (list, tuple, dict_values_type)) else []:
        if not isinstance(row, dict):
            continue
        name = safe_lower(row.get("name"))
        url = safe_lower(row.get("configuredUrl") or row.get("url")).rstrip("/")
        if name:
            by_name[name] = row
        if url:
            by_url[url] = row
    return by_name, by_url


def fast_source_is_eligible(feed, health_by_name, health_by_url):
    name, url = source_key(feed)
    health = health_by_url.get(url) or health_by_name.get(name)
    if not health or health.get("ok") is True:
        return True
    failures = int(health.get("consecutiveFailures") or 0)
    restrictions = int(health.get("consecutiveRestrictions") or 0)
    permanently_broken = safe_lower(health.get("detailedState")) == "permanently_broken"
    return not permanently_broken and max(failures, restrictions) < 3


def fetch_fast_feed(feed):
    response = requests.get(
        feed.get("url") or feed.get("feedUrl"),
        headers=HEADERS,
        timeout=(4.0, 9.0),
    )
    response.raise_for_status()
    parsed = feedparser.parse(response.content)
    if not parsed.entries:
        raise ValueError("Feed enthält keine Einträge.")
    return parsed


def prepare_fast_sources(source_buckets):
    health_by_name, health_by_url = load_fast_health_index()
    eligible = {}
    configured = 0
    skipped = 0
    for category, feeds in source_buckets.items():
        if category == "Radar":
            continue
        rows = []
        for feed in feeds:
            if not isinstance(feed, dict):
                continue
            configured += 1
            if (
                TARGET_SOURCE_NAMES
                and safe_lower(feed.get("name")) not in TARGET_SOURCE_NAMES
            ):
                continue
            if fast_source_is_eligible(feed, health_by_name, health_by_url):
                rows.append(feed)
            else:
                skipped += 1
        if rows:
            eligible[category] = rows

    AGGREGATE_METRICS["sourcesConfigured"] = configured
    AGGREGATE_METRICS["sourcesEligible"] = sum(len(rows) for rows in eligible.values())
    AGGREGATE_METRICS["sourcesSkippedByHealth"] = skipped
    prefetched = {}
    max_workers = max(4, min(24, int(os.environ.get("WRN_FAST_FETCH_WORKERS", "12"))))
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fetch_fast_feed, feed): feed
            for feeds in eligible.values()
            for feed in feeds
        }
        for future in as_completed(futures):
            feed = futures[future]
            try:
                prefetched[source_key(feed)] = future.result()
            except Exception as error:
                print(
                    f"  [SCHNELLABRUF] {safe_text(feed.get('name'))} "
                    f"übersprungen: {error}"
                )
    print(
        "[SCHNELLABRUF] "
        f"{len(prefetched)} von {AGGREGATE_METRICS['sourcesEligible']} "
        f"geeigneten Quellen parallel geladen; {skipped} wiederholt "
        "eingeschränkte Quellen bleiben für den Reparaturlauf."
    )
    return eligible, prefetched


# ``dict_values`` is deliberately captured without importing implementation
# details from collections.abc; it keeps health-file iteration explicit.
dict_values_type = type({}.values())

aggregate_stopped_for_budget = False

active_sources = quellen
fast_feed_payloads = {}
if FAST_MODE:
    active_sources, fast_feed_payloads = prepare_fast_sources(quellen)
else:
    AGGREGATE_METRICS["sourcesConfigured"] = sum(
        len(feeds) for category, feeds in quellen.items() if category != "Radar"
    )
    AGGREGATE_METRICS["sourcesEligible"] = AGGREGATE_METRICS["sourcesConfigured"]

for kontinent, feeds in active_sources.items():
    if aggregate_budget_exhausted():
        aggregate_stopped_for_budget = True
        break
    print(f"\n--- Kategorie: {kontinent} ---")
    is_radar = (kontinent == "Radar")
    
    for feed in feeds:
        if aggregate_budget_exhausted():
            aggregate_stopped_for_budget = True
            break
        if not isinstance(feed, dict):
            print(
                "  [FEHLER] Ungültiger Quellen-Eintrag "
                "übersprungen."
            )
            continue
        if (
            TARGET_SOURCE_NAMES
            and safe_lower(feed.get("name")) not in TARGET_SOURCE_NAMES
        ):
            continue

        feed_name = safe_text(
            feed.get("name"),
            "Unbekannte Quelle",
        )
        AGGREGATE_METRICS["sourcesAttempted"] += 1

        print(f"-> Portal: {feed_name}...")
        parsed = None
        if FAST_MODE:
            parsed = fast_feed_payloads.get(source_key(feed))
        else:
            try:
                feed_req = http.get(feed['url'], headers=HEADERS, timeout=AUTONOMOUS_TIMEOUT)
                parsed = feedparser.parse(feed_req.text)
                if not parsed.entries:
                    feed_req = session.get(feed['url'], headers=HEADERS, timeout=AUTONOMOUS_TIMEOUT)
                    parsed = feedparser.parse(feed_req.content)
            except:
                try:
                    feed_req = session.get(feed['url'], headers=HEADERS, timeout=AUTONOMOUS_TIMEOUT)
                    parsed = feedparser.parse(feed_req.content)
                except:
                    pass

        if not parsed or not parsed.entries:
            print(f"  [FEHLER] Konnte {feed_name} nicht abrufen.")
            continue
        AGGREGATE_METRICS["sourcesWithEntries"] += 1

        limit = 100 if is_radar else 15
        
        # =========================================================
        # DAS NEUE SPEED-LIMIT (Macht den Code rasend schnell)
        # =========================================================
        MAX_NEUE_SCRAPES = max(
            1,
            int(feed.get("maxNewItems", 4)),
        )
        tiefe_scrapes_gemacht = 0
        attempted_links = set()

        for entry in parsed.entries[:limit]:
            if aggregate_budget_exhausted():
                aggregate_stopped_for_budget = True
                break
            try:
                if not hasattr(entry, "get"):
                    raise TypeError(
                        "Feed-Eintrag unterstützt keine "
                        "get()-Abfragen."
                    )
                link = entry.get('link', '')
                title = safe_text(entry.get("title"), "Kein Titel")
                entry_published = entry.get(
                    'published',
                    entry.get('updated', datetime.now().isoformat()),
                )
                event_start = ""
                if is_radar:
                    title, event_start = normalize_feed_event(
                        title,
                        entry_published,
                    )
                title_lower = safe_lower(title).strip()
                author = safe_text(entry.get("author"), "Unknown")
                source_tags = entry.get("tags", [])
                minimum_article_length = int(
                    feed.get("minArticleTextLength", 700)
                )
            
                # Spam rausfiltern
                if any(bad in title_lower or bad in safe_lower(author) for bad in SPAM_BLACKLIST):
                    continue

                # IST DER ARTIKEL SCHON BEKANNT? (Ultraschnell überspringen!)
                existing_article = archiv_dict.get(link)
                observed_at = datetime.now(timezone.utc).isoformat()
                previous_text = safe_text(
                    existing_article.get("content") if existing_article else ""
                )
                previous_title = safe_text(
                    existing_article.get("title") if existing_article else ""
                )
                previous_complete = bool(
                    existing_article.get("contentComplete")
                    if existing_article
                    else False
                )
                previous_text_length = len(previous_text)
                previous_images = list(
                    existing_article.get("images", [])
                    if existing_article and isinstance(existing_article.get("images"), list)
                    else []
                )
                previous_image_count = len(previous_images)
                previous_primary_image = safe_text(
                    existing_article.get("image") if existing_article else ""
                )
                if existing_article:
                    configured_categories = feed.get("categories", [kontinent])
                    if not isinstance(configured_categories, list):
                        configured_categories = [configured_categories]
                    existing_classification = classify_article(
                        existing_article.get("title", ""),
                        existing_article.get("content", ""),
                        configured_categories,
                        kontinent,
                        source_tags,
                        feed.get("originCountryCode"),
                    )
                    for classification_key in (
                        "categories",
                        "primaryRegion",
                        "primaryTopic",
                        "secondaryTopics",
                        "classificationConfidence",
                        "classificationMethod",
                        "topicScores",
                        "editorialReview",
                        "editorialReviewReasons",
                    ):
                        existing_article[classification_key] = (
                            existing_classification[classification_key]
                        )
                    for existing_key, configured_key in (
                        ("sourceHomepage", "homepage"),
                        ("originCountry", "originCountry"),
                        ("originCountryCode", "originCountryCode"),
                        ("originRegion", "originRegion"),
                    ):
                        configured_value = safe_text(
                            feed.get(configured_key)
                        )
                        if configured_value:
                            existing_article[existing_key] = (
                                configured_value
                            )
                    existing_article["sourceTags"] = [
                        safe_text(
                            tag.get("term")
                            if isinstance(tag, dict)
                            else tag
                        )
                        for tag in source_tags
                        if safe_text(
                            tag.get("term")
                            if isinstance(tag, dict)
                            else tag
                        )
                    ]
                    if is_radar:
                        existing_article["title"] = title
                        existing_article["pubDate"] = event_start
                        existing_article["eventStart"] = event_start
                        existing_article["eventEnd"] = event_start
                        existing_article["type"] = "event"
                        existing_article["sourceType"] = "rss-event"
                        radar_count += 1
                        continue
                    existing_blocks = existing_article.get("contentBlocks", [])
                    has_structured_content = (
                        isinstance(existing_blocks, list)
                        and any(
                            isinstance(block, dict)
                            and block.get("type") in {"paragraph", "quote", "heading"}
                            for block in existing_blocks
                        )
                    )
                    if not content_is_incomplete(
                        existing_article.get("content", ""),
                        minimum_article_length,
                    ):
                        existing_article["contentComplete"] = True
                        image_was_checked = bool(
                            previous_primary_image
                            or previous_images
                            or existing_article.get("imageStatus")
                            in {"available", "unavailable"}
                        )
                        if FAST_MODE or (
                            has_structured_content and image_was_checked
                        ):
                            continue
                
                if (
                    not existing_article
                    and title_lower in gesehene_titel
                    and not is_radar
                ):
                    continue

                # Pro Quelle werden neue und unvollständige bestehende
                # Artikel gemeinsam begrenzt. So werden ältere Feed-Auszüge
                # schrittweise repariert, ohne die Quellseite zu überlasten.
                if not is_radar and not FAST_MODE:
                    if tiefe_scrapes_gemacht >= MAX_NEUE_SCRAPES:
                        continue 
                    tiefe_scrapes_gemacht += 1
                    attempted_links.add(link)
            
                pubDate = event_start if is_radar else entry_published
                full_text = safe_text(
                    existing_article.get("content")
                    if existing_article
                    else ""
                )
                image_url = (
                    existing_article.get("image")
                    if existing_article
                    else None
                )
                image_urls = list(
                    existing_article.get("images", [])
                    if existing_article
                    and isinstance(existing_article.get("images"), list)
                    else []
                )
                content_blocks = list(
                    existing_article.get("contentBlocks", [])
                    if existing_article
                    and isinstance(existing_article.get("contentBlocks"), list)
                    else []
                )

                if is_radar:
                    radar_desc = entry.get('summary', entry.get('description', ''))
                    full_text = BeautifulSoup(str(radar_desc), 'html.parser').get_text(separator="\n\n").strip()

                # Bilder abgreifen
                if 'media_content' in entry and len(entry.media_content) > 0:
                    image_url = clean_image_url(entry.media_content[0].get('url', ''), link)
                    if image_url:
                        image_urls.append(image_url)

                if not image_url and 'enclosures' in entry and len(entry.enclosures) > 0:
                    for enc in entry.enclosures:
                        href = safe_text(enc.get("href"))
                        if safe_text(enc.get("type")).startswith('image/') or any(ext in href.lower() for ext in IMAGE_EXTENSIONS):
                            image_url = clean_image_url(href, link)
                            if image_url:
                                image_urls.append(image_url)
                                break

                for content_key in ['description', 'summary']:
                    if content_key in entry and isinstance(entry[content_key], str):
                        desc_soup = BeautifulSoup(entry[content_key], 'html.parser')
                        for candidate in collect_image_urls(desc_soup, link):
                            if candidate not in image_urls:
                                image_urls.append(candidate)
                        if not image_url and image_urls:
                            image_url = image_urls[0]

                # Text extrahieren (Der langsame Teil - aber auf 4 Limitiert!)
                if not is_radar:
                    try:
                        if 'content' in entry and len(entry.content) > 0:
                            c_obj = entry.content[0]
                            val = c_obj.value if hasattr(c_obj, 'value') else (c_obj.get('value', '') if isinstance(c_obj, dict) else '')
                            content_soup = BeautifulSoup(str(val), 'html.parser')
                            for candidate in collect_image_urls(content_soup, link):
                                if candidate not in image_urls:
                                    image_urls.append(candidate)
                            if not image_url and image_urls:
                                image_url = image_urls[0]
                            feed_blocks, feed_text = extract_article_content(
                                content_soup,
                                link,
                            )
                            if len(feed_text) > len(full_text):
                                full_text = feed_text
                            if len(feed_text) >= 250 and feed_blocks:
                                content_blocks = feed_blocks
                    except:
                        pass

                if (
                    link
                    and not is_radar
                    and not FAST_MODE
                    and (
                        content_is_incomplete(
                            full_text,
                            minimum_article_length,
                        )
                        or not content_blocks
                    )
                ):
                    full_text, image_url, image_urls, content_blocks = (
                        scrape_article_page(
                            link,
                            feed,
                            full_text,
                            image_url,
                            image_urls,
                            content_blocks,
                        )
                    )
            
                if not is_radar and (not full_text or len(full_text) < 150) and 'description' in entry:
                    try:
                        description_text = BeautifulSoup(
                            str(entry.description),
                            'html.parser',
                        ).get_text(separator="\n\n").strip()
                        if len(description_text) > len(full_text):
                            full_text = description_text
                    except:
                        pass

                preferred_content_language = safe_text(
                    feed.get('language')
                    or (
                        feed.get('languages', ['und'])[0]
                        if isinstance(feed.get('languages'), list)
                        and feed.get('languages')
                        else 'und'
                    ),
                    'und',
                )
                clean_text = trim_repeated_translation(
                    safe_text(full_text),
                    preferred_content_language,
                )
                content_blocks = trim_repeated_translation_blocks(
                    content_blocks,
                    preferred_content_language,
                )
                if existing_article and len(clean_text) < previous_text_length:
                    clean_text = previous_text
            
                if any(bad in clean_text.casefold() for bad in SPAM_BLACKLIST):
                    continue
            
                if is_radar:
                    if clean_text == "":
                        clean_text = "Weitere Infos zum Termin auf der Originalseite."
                elif not FAST_MODE and not is_radar and "anarchist news" not in safe_lower(feed_name) and safe_lower(title) in clean_text.casefold() and len(clean_text) < len(title) + 150:
                    clean_text = "⚠️ The full text of this article is protected by the publisher's firewall. Please use the [ ORIGINAL ] button below to read it directly on their website."
                elif not is_radar and clean_text == "":
                    clean_text = "⚠️ No text available. Please use the [ ORIGINAL ] button below."

                if not image_url or not image_url.startswith('http'):
                    image_url = ""
                image_urls = [
                    candidate
                    for candidate in image_urls
                    if candidate and candidate.startswith(('http://', 'https://'))
                ]
                if image_url and image_url not in image_urls:
                    image_urls.insert(0, image_url)

                allowed_image_hosts = {
                    safe_lower(host)
                    for host in feed.get("imageHosts", [])
                    if safe_text(host)
                }
                if allowed_image_hosts:
                    if image_url:
                        image_host = safe_lower(urlparse(image_url).hostname)
                        if image_host not in allowed_image_hosts:
                            image_url = ""
                    image_urls = [
                        candidate
                        for candidate in image_urls
                        if safe_lower(urlparse(candidate).hostname) in allowed_image_hosts
                    ]
                    content_blocks = [
                        block
                        for block in content_blocks
                        if (
                            not isinstance(block, dict)
                            or block.get("type") != "image"
                            or safe_lower(urlparse(block.get("url", "")).hostname)
                            in allowed_image_hosts
                        )
                    ]

                # A quick feed refresh or a temporary publisher response must
                # never remove media that a previous enrichment already
                # accepted. New images are added; established images remain.
                if existing_article:
                    existing_article["lastSeenAt"] = observed_at
                    existing_article.setdefault("firstSeenAt", observed_at)
                    for previous_image in previous_images:
                        candidate = clean_image_url(previous_image, link)
                        if (
                            candidate
                            and candidate.startswith(('http://', 'https://'))
                            and candidate not in image_urls
                        ):
                            image_urls.append(candidate)
                    preserved_primary = clean_image_url(
                        previous_primary_image,
                        link,
                    )
                    if preserved_primary and preserved_primary.startswith(
                        ('http://', 'https://')
                    ):
                        if not image_url:
                            image_url = preserved_primary
                        if preserved_primary not in image_urls:
                            image_urls.insert(0, preserved_primary)
                image_urls = list(dict.fromkeys(image_urls))

                # =========================================================
                # ARTIKEL ZUM GEDÄCHTNIS HINZUFÜGEN
                # =========================================================
                classification = classify_article(
                    title,
                    clean_text,
                    feed.get("categories", [kontinent]),
                    kontinent,
                    source_tags,
                    feed.get("originCountryCode"),
                )
                feed_categories = classification["categories"]

                feed_languages = feed.get(
                    "languages",
                    [feed.get("language", "und")],
                )
                if not isinstance(feed_languages, list):
                    feed_languages = [feed_languages]
                feed_languages = [
                    safe_lower(language, "und")
                    for language in feed_languages
                    if safe_text(language)
                ] or ["und"]

                content_complete = True if is_radar else not content_is_incomplete(
                    clean_text,
                    minimum_article_length,
                )
                change_history = list(
                    existing_article.get("changeHistory", [])
                    if existing_article
                    and isinstance(existing_article.get("changeHistory"), list)
                    else []
                )
                changes = []
                if existing_article:
                    if previous_title and title != previous_title:
                        changes.append("title")
                    if len(clean_text) > previous_text_length:
                        changes.append("content")
                    if len(image_urls) > previous_image_count:
                        changes.append("images")
                    if content_complete and not previous_complete:
                        changes.append("complete")
                if changes:
                    change_history.append({
                        "at": observed_at,
                        "changes": list(dict.fromkeys(changes)),
                    })
                change_history = change_history[-12:]
                first_seen_at = safe_text(
                    existing_article.get("firstSeenAt")
                    if existing_article
                    else observed_at,
                    observed_at,
                )
                last_changed_at = (
                    observed_at
                    if changes or not existing_article
                    else safe_text(
                        existing_article.get("lastChangedAt"),
                        first_seen_at,
                    )
                )

                archiv_dict[link] = {
                    "kontinent": kontinent,
                    "categories": feed_categories,
                    "primaryRegion": classification["primaryRegion"],
                    "primaryTopic": classification["primaryTopic"],
                    "secondaryTopics": classification["secondaryTopics"],
                    "classificationConfidence": classification["classificationConfidence"],
                    "classificationMethod": classification["classificationMethod"],
                    "editorialReview": classification["editorialReview"],
                    "editorialReviewReasons": classification["editorialReviewReasons"],
                    "quelleName": feed_name,
                    "author": author,
                    "title": title,
                    "link": link,
                    "pubDate": pubDate,
                    "content": clean_text,
                    "contentComplete": content_complete,
                    "image": image_url,
                    "images": image_urls[:24],
                    "imageStatus": "available" if image_url else "unavailable",
                    "imageCheckedAt": datetime.now(timezone.utc).isoformat(),
                    "contentBlocks": content_blocks[:400],
                    "language": feed_languages[0],
                    "languages": feed_languages,
                    "originCountry": safe_text(feed.get("originCountry")),
                    "originCountryCode": safe_text(feed.get("originCountryCode")),
                    "originRegion": safe_text(feed.get("originRegion")),
                    "sourceHomepage": safe_text(feed.get("homepage")),
                    "sourceTags": [
                        safe_text(
                            tag.get("term")
                            if isinstance(tag, dict)
                            else tag
                        )
                        for tag in source_tags
                        if safe_text(
                            tag.get("term")
                            if isinstance(tag, dict)
                            else tag
                        )
                    ],
                    "firstSeenAt": first_seen_at,
                    "lastSeenAt": observed_at,
                    "lastChangedAt": last_changed_at,
                    "changeHistory": change_history,
                    "correctionNote": safe_text(
                        existing_article.get("correctionNote")
                        if existing_article
                        else ""
                    ),
                }
                if not is_radar:
                    if not existing_article:
                        AGGREGATE_METRICS["newArticles"] += 1
                    elif (
                        len(clean_text) > previous_text_length
                        or len(image_urls) > previous_image_count
                    ):
                        AGGREGATE_METRICS["enrichedArticles"] += 1
                if is_radar:
                    archiv_dict[link].update({
                        "type": "event",
                        "sourceType": "rss-event",
                        "eventStart": event_start,
                        "eventEnd": event_start,
                    })
                gesehene_titel.add(title_lower)
                if is_radar: radar_count += 1
            except Exception as entry_error:
                log_feed_entry_error(
                    feed_name,
                    entry,
                    entry_error,
                )
                continue

        # Unvollständige ältere Artikel können aus dem aktuellen RSS-Fenster
        # herausfallen. Nutze freie Abrufplätze, um auch diese Archiv-Einträge
        # schrittweise zu reparieren, statt sie dauerhaft als Anreißer zu
        # belassen.
        if (
            not aggregate_stopped_for_budget
            and not is_radar
            and not FAST_MODE
            and tiefe_scrapes_gemacht < MAX_NEUE_SCRAPES
        ):
            minimum_article_length = int(
                feed.get("minArticleTextLength", 700)
            )
            repair_candidates = [
                (archive_link, article)
                for archive_link, article in archiv_dict.items()
                if (
                    safe_lower(article.get("quelleName"))
                    == safe_lower(feed_name)
                    and archive_link not in attempted_links
                    and (
                        content_is_incomplete(
                            article.get("content", ""),
                            minimum_article_length,
                        )
                        or not article.get("contentBlocks")
                        or (
                            not article.get("image")
                            and article.get("imageStatus")
                            not in {"available", "unavailable"}
                        )
                    )
                )
            ]
            repair_candidates.sort(
                key=lambda pair: safe_text(
                    pair[1].get("pubDate")
                ),
                reverse=True,
            )
            for archive_link, article in repair_candidates:
                if aggregate_budget_exhausted():
                    aggregate_stopped_for_budget = True
                    break
                if tiefe_scrapes_gemacht >= MAX_NEUE_SCRAPES:
                    break
                tiefe_scrapes_gemacht += 1
                repaired_text, repaired_image, repaired_images, repaired_blocks = (
                    scrape_article_page(
                        archive_link,
                        feed,
                        article.get("content", ""),
                        article.get("image", ""),
                        article.get("images", []),
                        article.get("contentBlocks", []),
                    )
                )
                if len(repaired_text) > len(
                    safe_text(article.get("content"))
                ):
                    article["content"] = safe_text(repaired_text)
                if repaired_image:
                    article["image"] = repaired_image
                article["images"] = list(dict.fromkeys(
                    candidate
                    for candidate in repaired_images
                    if candidate
                ))[:24]
                if repaired_blocks:
                    article["contentBlocks"] = repaired_blocks[:400]
                article["imageStatus"] = (
                    "available" if article.get("image") else "unavailable"
                )
                article["imageCheckedAt"] = datetime.now(timezone.utc).isoformat()
                article["contentComplete"] = not content_is_incomplete(
                    article.get("content", ""),
                    minimum_article_length,
                )
            
        # =========================================================
        # CHECKPOINT NACH JEDER QUELLE SPEICHERN (Sichert die Daten)
        # =========================================================
        save_checkpoint()
        if aggregate_stopped_for_budget:
            break

    if aggregate_stopped_for_budget:
        break

# SYSTEM-MELDUNG FALLS RADAR GESTÖRT IST
if radar_count == 0:
    archiv_dict["system_info_radar"] = {
        "kontinent": "Radar",
        "quelleName": "System Info",
        "author": "News-Bot",
        "title": "🛡️ Radar temporär blockiert",
        "link": "https://radar.squat.net",
        "pubDate": datetime.now().isoformat(),
        "content": "Die Terminkalender haben aktuell ihre Firewalls verschärft und blockieren den automatischen Abruf. Wir versuchen es beim nächsten Update-Durchlauf erneut. Bitte besuche die Seiten in der Zwischenzeit direkt über den Button unten.",
        "image": ""
    }
    save_checkpoint(force=True)

if aggregate_stopped_for_budget:
    print(
        "\n[ZEITPLAN] Aggregation kontrolliert beendet. "
        f"Noch {aggregate_seconds_remaining():.0f} Sekunden für Feed-Bau, "
        "Prüfungen und Upload reserviert."
    )

save_checkpoint(force=True)
save_aggregate_error_report()
AGGREGATE_METRICS["stoppedForBudget"] = aggregate_stopped_for_budget
save_aggregate_run_status()

print(f"\n>>> ERFOLG: Es wurden {radar_count} Radar-Termine gefunden! <<<")
print(f"\n[ERFOLG] {len(archiv_dict)} Artikel sicher im Archiv abgelegt.")
print(
    "[LAUFSTATUS] "
    f"Modus {AGGREGATE_MODE}: {AGGREGATE_METRICS['newArticles']} neue, "
    f"{AGGREGATE_METRICS['enrichedArticles']} angereicherte Artikel; "
    f"{AGGREGATE_METRICS['sourcesWithEntries']} Quellen mit Einträgen."
)
