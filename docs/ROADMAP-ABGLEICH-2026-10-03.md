# WRN: Anforderungen und Roadmap, 3. Oktober 2026

Der vorhandene Inhaltsbestand und die vorhandenen Produktfunktionen werden weiterverwendet. Die wichtigsten nächsten Schritte sind verlässliche Podcast-Veröffentlichung, ein frisch geprüfter Next-Terminkatalog und durchgängige Wege zum Finden, Öffnen und Wiederfinden von Inhalten. Der eigenständige Atlas und die laufende native iOS-Arbeit bleiben eigene, koordinierte Integrationsstränge.

**Auftrag dieses Arbeitsgangs:** Abgleich und Ergänzung der bestehenden [ROADMAP.json](../ROADMAP.json). Keine Produktimplementierung, Quellenaufnahme, PR-Zusammenführung, Erzeugung von Übersetzungen/Audios, Build oder Veröffentlichung. Die Umsetzung folgt nach Prüfung dieses Ergebnisses. Bestehende Website-, Atlas- und iOS-Arbeiten wurden lesend berücksichtigt; ihre Arbeitsbäume bleiben unverändert.

Der [bereinigte Belegsatz](evidence/roadmap-reconciliation-2026-10-03/audit.json) enthält Gitstände, PR-Metadaten, öffentliche Kataloghashes, Health-/Statusantworten, den tatsächlichen Regionalcheck und Live-Browserbeobachtungen. Er enthält keine fremden Artikelvolltexte, Zugangsdaten oder internen Workflow-Rohlogs. Die Inhaltsprüfung folgt dem Skill WRN Content Audit. Ein erreichbarer Link, ein erfolgreicher Test oder ein Workerbericht wird nur für seinen belegten Umfang bewertet.

## 1. Übersicht und Gestaltung

**Vorhanden/teilweise erledigt:** Autonom ist wählbar; bestehende Themes, Überschriften, Themenfilter und WRN-Wortmarke sind umgesetzt. Die Website besitzt bereits Aufmacher, kompakte Nachrichten, Themen/Regionen und eigene gekennzeichnete KI-Illustrationen. Ihre Hauptnavigation bietet Start, Für mich, Entdecken, Medien und Gespeichert; weitere Bereiche führen zu Nachrichten, Quellen, Sport, Events, Wissen und Solidarität. Ein erneuter kompletter Entwurf wäre Doppelarbeit.

**Codebelege:** [news-app-2.js](../news-app-2.js) enthält Navigation-Snapshots, History/Popstate und Artikelrückkehr; [tests/test_navigation_history.js](../tests/test_navigation_history.js) prüft den vorhandenen Vertrag. Next verwendet `apps/website/src/App.tsx` und `features/directory/directory-navigation.ts`. Vorhandene Quelltests beweisen noch nicht die vollständige mobile Bedienung.

**Offen/ungeprüft:** Teilbereich-/Inhaltsdirektlinks, vollständiger Erhalt von Suchbegriff, Quelle, Sprache, Thema, Listenposition/Fokus und Artikelposition über alle Rückwege. Im Website-Katalog sind Filter vorhanden, aber vollständiger Erhalt nach Verlassen und Wiederöffnen ist nicht nachgewiesen. Der Atlas fehlt als tatsächlich integrierter historischer Bereich. Video/Audio sollten auf Start deutlicher erreichbar sein. Tastatur, 200%-Reflow und kleine Touchflächen benötigen aktuelle gemeinsame Szenarien.

**Roadmap:** `NAV-FINDABILITY-20261003`, P1, erweitert bestehende Navigation und Gestaltung.

## 2. App und Website: Daten, Auslieferung, sichtbare Funktion

| Inhaltsklasse | Gemeinsamer/kanonischer Stand | Auslieferung und sichtbarer Stand | Grenze des Nachweises |
|---|---|---|---|
| Bibliothek | Data: **731** Einträge, Stand 2.10., 22:19 UTC | App-Bundle **728**, geprüfte Live-Website **728** | App kann remote nachladen; Sichtbarkeit aller drei neuen IDs in der aktuellen Runtime nicht geprüft. **718 Downloadverweise sind keine gespeicherten Volltexte.** |
| Lexikon/Lernpfade | Aktuell geprüfter App-Stand: **167 Begriffe, vier Pfade** | Gleicher Umfang in Website-Liverelease `5664227` | Anzahl beweist keine vollständige Übersetzung oder redaktionelle Tiefe. |
| Originalpodcasts | **1778 Zeilen, 1722 eindeutige Episoden-URLs**, 56 konfigurierte Quellen, 50 im Feed vertreten | Website zeigt **1722** Originallink-Einträge mit Suche/Sprach-/Quellenfilter | **829** Audio-Links im Data-Feed, **949** nur Metadaten/Links. Keine pauschale Playback-Abnahme. |
| Radio | **28** Einträge; neun begrenzte Audioantworten, 19 ohne freigegebenen Stream | Website: 28 Verweise; 3CR bietet externen Originalsender-Livelink | Streamprüfung ist kein Decoder-, Hintergrund- oder Gerätetest. |
| Video | **16** aktuelle Data-Einzelvideos, zehn Register-/Kanalquellen | Website: 16 Einzelvideo-Originallinks, älterer Snapshot 2.10., 06:06 UTC | Gleiche Anzahl bedeutet nicht gleiche IDs oder Aktualität; weiterer Website-Video-Runtimepfad separat. |
| Nachrichten/Bilder | Geprüfter App-Handoff umfasst 426 Artikelzeilen; Rechteklassen bleiben bindend | Website-Aufmacher und kompakte Nachrichten sind live; 20 weitere Home-Kandidaten benötigen Aufnahmeprüfung | Kataloglink, freigegebener Volltext und freigegebenes Bild sind unterschiedliche Klassen. |

Die Veröffentlichung der Website-Kataloge ist bereits erfolgt. Der alte Roadmap-Blocker „Hostinger anmelden/erstes Katalogpaket hochladen“ ist überholt und wurde korrigiert. Produktcommit `566422758241190f432d8c8a09d67a5f589d90ac` und Livebeleg `737a4fe7a5751e0315fda33c4eb96c7547420ff0` sind im [bestehenden unabhängigen Livebericht](evidence/radio-roadmap-2026-10-03/website-followup-live-review.json) gebunden. Das ist eine abgegrenzte Live-Abnahme, keine vollständige Funktionsgleichheit.

**Roadmap:** `WEBSITE-CONTENT-PARITY` und `CONTENT-CATALOG-PARITY`, P1. Die drei neuen Bücher, aktuelle Video-IDs und Zulässigkeit abgleichen; keine Neuaufnahme des bereits synchronisierten Bestands. Laufende Gefangenenintegration bleibt beim vorhandenen Website-Arbeiter.

## 3. Videos

**Vorhanden:** Auswahlfeed, Kanalregister, App-Wiedergabewege über Direktvideo/iframe und Originalverweise. Andrewism, Audible Anarchist, David-Graeber-Archiv, subMedia und Kolektiva sind bereits berücksichtigt. Sie werden nicht erneut als neue Quellen geplant.

**Technischer Beleg:** Veröffentlichter Healthstand prüft 40 URLs begrenzt: 39 erreichbar, ein Timeout bei `antimilitarismus.noblogs.org`; 16 Originalseiten und 14 Embed-URLs erreichbar. Das beweist weder erfolgreiche Wiedergabe noch zulässige Einbettung oder redaktionelle Eignung. Bei zehn der 16 aktuellen Data-Videos fehlt ein Veröffentlichungsdatum.

**Livebeobachtung:** Im älteren Website-Snapshot stehen identische Episodentitel auf zwei Plattform-URLs sowie mehrere SPX6900/Kryptothemen. Das ist ein konkreter Anlass für Relevanz- und plattformübergreifende Identitätsprüfung, keine automatische Löschfreigabe. Ein unabhängiger Hostinganbieter allein macht jeden Beitrag noch nicht passend zu WRN.

**Roadmap:** `VIDEO-EDITORIAL-QUALITY-20261003`, P2. Beiträge/Betreiber, Sprache, Region, Thema, Datum und Rechte prüfen; Video vs Kanal unterscheiden; zulässigen Player samt Fehler-/Originalweg abnehmen. Temporäre Störungen datieren und erneut prüfen. Erst danach gezielt fehlende anarchistische, libertär-sozialistische oder passende unabhängige Quellen kuratieren.

## 4. Podcasts und Audio

**Erledigt:** Data [PR41](https://github.com/Blackfront161/Revolution-News-Data/pull/41), [PR42](https://github.com/Blackfront161/Revolution-News-Data/pull/42) und [PR43](https://github.com/Blackfront161/Revolution-News-Data/pull/43) sind gemergt: Archivaktualisierung, Anwendung der aktuellen Inhaltsbeschränkungen auf Altdaten und 3CR/regelmäßige Radiohealth. Vier neue Programme und 433 geprüfte Metadatenzeilen sind bereits hinzugekommen. Working Class History verwendet im Aggregator bereits `feedUrl` vor `feedUrls`; der aktuelle Registereintrag enthält den offiziellen Spreaker-Feed. Diese Änderungen nicht nochmals implementieren.

**Echter P0-Blocker:** [Run 37023481297](https://github.com/Blackfront161/Revolution-News-Data/actions/runs/37023481297) ist nicht der letzte Fehler. Auch [Run 37063775566](https://github.com/Blackfront161/Revolution-News-Data/actions/runs/37063775566) scheitert beim Speichern: `podcast-archive.json` wurde verändert, aber der aktuelle Main-Workflow stagt nur `podcasts.json`, `podcast-health.json` und `generated-podcasts.json`. Der saubere-Arbeitsbaum-Guard stoppt den Rebase korrekt. Aggregation/Validierung und erfolgreiche Veröffentlichung sind deshalb getrennt zu bewerten.

**Vorhandener Playercode:** [media-player.js](../media-player.js) speichert Episodenpositionen, setzt sie nach Metadatenladevorgang wieder und bindet MediaSession-Aktionen/Positionsstatus. [audio-tools.js](../audio-tools.js) ergänzt vorhandene Werkzeuge. Wiederaufnahme und Sperrbildschirm haben somit bereits eine Implementierung. Die tatsächliche Android-/iOS-Hintergrundwiedergabe, Unterbrechung und Systemsteuerung sind noch gesondert zu testen.

**Live-Website:** Originalfolgen erscheinen als Metadaten/Originallinks mit Suche und Filtern. Der separate Abschnitt „Aktuelles Audio“ meldet **„Aktuelles Audio ist nicht verfügbar.“** Der erzeugte gemeinsame Data-Katalog ist aktuell leer. Ein vorhandener Generator und ein verfügbarer Statusendpoint ersetzen keine ausgelieferte Hörfassung.

**Roadmap:** `PODCAST-CATALOG-EXPANSION` enthält zuerst P0-Workflowkorrektur samt echter erfolgreicher geplanter Ausführung und öffentlichem Archiv-Readback; Quellen-/Archivkuratierung bleibt P2. `RADIO-HEALTH-20261003` ergänzt die fehlenden tatsächlichen Wiedergabe-/Fallback-/Teilenprüfungen, ohne die erledigte Healthpipeline neu zu planen.

## 5. Lexikon und Bibliothek

**Vorhanden:** 167 Begriffe, vier Lernpfade, Referenzen und Buch-/Podcastbeziehungen; Bibliotheksmerger erhalten stabile IDs, Ausgaben und Widerrufe. App und Website haben Katalog- und Such-/Filteroberflächen. Mehr Katalogzeilen allein beheben keine Wissenslücken.

**Offen:** Systematische Lückenmatrix nach Themen/Nutzen und Sprache; fundierte Erklärungen mit Beispielen, belegten unterschiedlichen Positionen, Reviewdatum und verwandten Begriffen. Beziehungen zu realen Artikeln/Büchern/Folgen ausbauen und Rückwege testen. Die neun UI-Sprachen sind keine neun vollständig übersetzten Wissensbestände.

Libcom, Kate Sharpley Library, Zabalaza Books und Anarchist Archive sind vorgemerkt/verlinkt. Die vorhandene allgemeine OPDS-Aggregation ist kein Beleg für vier fertige anbieterspezifische Adapter. Metadatenaufnahme, Original-Lesezugang, Downloadverweis und zulässiges Offlinebuch separat zählen.

**Roadmap:** Vorhandene Aufgaben `KNOWLEDGE-LEXICON-LIBRARY`, `LEXICON-EDITORIAL-20261003` und `LIBRARY-ADAPTERS-20261003`, P2, vertieft. Erst drei aktuelle Titelabweichungen klären, dann zehn nachweislich neue oder wesentlich verbesserte DE/EN-Begriffe und zehn weitere DE-Titel nach Bedarfsprüfung. Keine zusätzliche konkurrierende Wissensaufgabe.

## 6. Übersetzung und neuronale Stimmen

**Aktiv vorhanden:** App-Konfiguration zeigt auf `revolution-proxy.paghklo.workers.dev` und `wrn-translation-cache.paghklo.workers.dev`. Öffentliche GET-Prüfung: Proxy API v2 und gemeinsamer Cache **v1.7.8**, KV, sieben Tage TTL, erreichbar. Frühere unabhängige Live-MISS/HIT-Prüfung belegte **Gemini 3.5 Flash Lite** als verwendetes Modell. Cache-/Raceschutz und aktive Cost Guards sind bereits umgesetzt. Codebelege: [shared-translation-client.js](../shared-translation-client.js), [Proxy](../cloudflare/revolution-proxy/src/index.js), [Quota Client](../cloudflare/shared/quota-client.js), [Konfiguration](../cloudflare/revolution-proxy/wrangler.jsonc).

**Cloudstimme:** Aktiver Proxy verwendet **Azure Neural Speech** und gemeinsame R2-Dateien. Lokales `speechSynthesis` liest auf dem Gerät und erzeugt keine gemeinsam abrufbare Podcastdatei. Gemini-TTS, Workers AI oder die eigenen Next-Serviceentwürfe sind keine belegten aktiven App-TTS-Anbieter.

**Eigene technische Grenzen:** 950 Übersetzungen/Tag, 950 KV-Schreibvorgänge/Tag, 475000 Azure-Zeichen/Monat, Speichergrenze 9663676416 Bytes, 30 Tage Audioaufbewahrung und maximal 25 MiB je Audio. Public `podcast.status` meldet konfiguriert/verfügbar, im Oktober bisher null Zeichen/null Dateien, nächsten Monatsreset 1.11. UTC. Das sind WRN-Statuswerte, keine unabhängige Azure-Abrechnung oder erfolgreiche Syntheseprüfung.

**Providerkontingente/Kosten:** Google limitiert je Projekt über RPM/TPM/RPD; tatsächliche Accountlimits werden in AI Studio angezeigt, nicht pro API-Schlüssel garantiert. [Offizielle Gemini-Limits](https://ai.google.dev/gemini-api/docs/rate-limits). Die geprüfte Preisübersicht nennt für Gemini 3.5 Flash Lite Standard Paid Tier 0,30 USD je Million Eingabe- und 2,50 USD je Million Ausgabetokens; kostenlose Nutzung hängt vom angebotenen Tier und Account ab. Preis pro übersetztem Text hängt von beiden Tokenmengen ab. [Offizielle Gemini-Preise](https://ai.google.dev/gemini-api/docs/pricing).

Azure Neural Speech F0 nennt 0,5 Millionen Zeichen pro Monat kostenlos; der WRN-Guard liegt darunter. **Nicht belegt ist, ob das tatsächlich verwendete Azure-Konto F0 oder S0 hat.** Regionen/Tarife und weitere Nutzung können Kosten ändern. [Azure Speech Pricing](https://azure.microsoft.com/en-us/pricing/details/speech/). Cloudflare Workers AI bietet 10000 Neurons/Tag kostenlos und nennt darüber im bezahlten Tarif 0,011 USD je 1000 Neurons; es ist hier eine mögliche Alternative, keine aktive kostenlose App-Stimme. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). R2/KV/Workers und eventuelle HF-Nutzung brauchen ebenfalls Account-/Budgetprüfung; lokale Stimme vermeidet Cloudkosten pro Aufruf, bietet aber keine gemeinsame Datei.

**Roadmap:** `PROVIDER-QUOTA-VISIBILITY-20261003`, P1, ergänzt Anzeigen für eigene Nutzung, Reset/Wartezeit, unbekannte Providerquote, Fehler und Alternativen. Vor Modellwechsel repräsentative Qualität/Terminologie, Latenz und Kosten prüfen. Data Draft PR20 zuerst gegen die bereits aktiven Guards abgleichen. `HELP-AUDIO-TRANSLATION-20261003` erklärt KI-Kennzeichnung, Originalsprache, gemeinsamen Cache und lokale/cloudbasierte Stimmen.

## 7. World Revolution Atlas

**Eigenständiger Stand vorhanden/in Arbeit:** Atlas-Arbeiter im bestehenden Chat „ok fahre fort“, Projekt „Widerstands Karte“, Repository `World-Revolution-Map`, Draft [PR1](https://github.com/Blackfront161/World-Revolution-Map/pull/1), Remotehead `09c0b1c`. Aktuelles `docs/current-handoff.md` beschreibt r73 als uncommitteten WIP. Gemeldeter Umfang: 674 Ereignisse, 669 sichtbar/fünf sensible Koordinaten verborgen, weiterführende Beziehungen und Blender-/Unreal-Labor. Die gemeldeten 178 Tests sind eine Workerangabe, kein WRN-Hosttest. Neun UI-Sprachen bedeuten hier ebenfalls keine vollständig übersetzten historischen Beschreibungen.

**Wiederverwendbarer Entwurf:** `docs/embedding.md` und `artifacts/wrn-atlas-r68/integration-manifest.json` beschreiben das ältere r68-Embeddingpaket, API 2.3.0, Theme-/Sprach-/Rückwegvertrag. `offlineInEmbed:false`; der Host muss Offline verantworten. Im Embed werden eigener Service Worker/Supabasezugriff deaktiviert. Es fehlt ein aktueller, unveränderlicher freigegebener WRN-Handoff.

**Nicht gleichsetzen:** Next `packages/browser-content/src/atlas/AtlasBeta.tsx` bietet Quellen/Länderquiz (134 Quellen, 28 Länder). Das ist keine historische Karte oder Globusintegration. Repositoryname Map und Atlas-/Game-Labor sagen ebenfalls nichts über die tatsächlich eingebettete WRN-Funktion aus. Der frühere Website-Versuch überschritt das 8-MiB-Shellbudget; das spricht für ein optionales Paket mit eigenen Grenzen, nicht für Abschalten des Guards.

**Roadmap:** `ATLAS-HOST-INTEGRATION-20261003`, P2, ersetzt den unscharfen späteren Kartenhinweis in `MEDIA-PRINT-OFFLINE`. Vorhandenes Atlasprojekt weiterverwenden; r73/r68-Differenz, Version/Hashes, Quellen/Attribution, Koordinatenschutz, PostMessage/Origins, Themes/Sprachen und Host-Back prüfen. Lazy Load, Cache-/Transfer-/RAMbudget, mobile Karte/Zeitleiste und Offline-Neustart abnehmen. Keine zweite Atlasimplementierung.

## 8. Native iOS-Arbeit

**In Arbeit:** Bestehender Arbeiter „IOS Experte“, eigener Branch `codex/ios-app`, beobachteter Head `7c150fc`. Capacitor 8.4.0, iOS17+, Xcode26+, native Share-/PDF-/Kalender-/lokale Benachrichtigungswege, Safe Areas und AVAudioSession-Konfiguration sind vorhanden. Gemeinsamer Export basiert auf `83db917`, älter als aktuell geprüfter App-Stand. Eigener Offlineweg wegen WKWebView `capacitor://` ohne PWA-Service Worker; vorhandene Grenzen 8 MiB pro Datei/64 MiB gesamt und sichere HTTPS-Regeln erhalten.

**Fehlend/ungeprüft:** Erster tatsächlicher Xcode-/Swift-Build, Simulator-/Gerätestests, native Hintergrund-/Lockscreen-/Unterbrechungssteuerung, persistenter Offline-Neustart, signierte IPA/Provisioning und Storeprüfung. Native APNs-Anbindung ist nicht vorhanden; Web-VAPID ist kein Ersatz. Bei abschließender API-Prüfung kein offener App-/iOS-PR; die Draft-PR-Vorbereitung ist laufende Arbeit. Mobile Website und vorbereitete Swift-Dateien sind keine abgeschlossene native App.

**Voraussetzungen/Kosten:** Zulässiger Mac oder gehosteter Xcode-Runner, Apple-Signierungs-/Gerätezugang. Apple Developer Program: **99 USD pro Mitgliedschaftsjahr bzw. lokale Währung**; konkretes Konto und mögliche Befreiung nicht geprüft. [Apple-Mitgliedschaft](https://developer.apple.com/programs/enroll/). Runner-/Mac-/Providerkosten hängen von bestehendem Zugang und Tarifen ab. Dieser Audit kauft oder bucht nichts.

**Roadmap:** `IOS-NATIVE-VALIDATION-20261003`, P2, bündelt Abnahmen der vorhandenen Arbeit. Kein zweiter Port. Aktuelle gemeinsame Frontendbasis und Backendverträge vor Gerätetests angleichen. Die bisherige Arbeitsfreigabe für Draft-PR bedeutet keine automatische Cloudbuild-/Signierungs-/Storefreigabe.

## Aktuelle PRs, Releases und echte Blocker

| Projekt | Frisch abgeglichener Zustand | Konsequenz |
|---|---|---|
| Data | PR41/42/43 gemergt; PR38 offen (zukünftige Feedzeitpunkte), PR20 Draft (ältere Cost-Guard-/Lexikonarbeit) | Erledigtes erhalten; offene Entwürfe auf Überschneidung prüfen. Podcastworkflow blockiert weiterhin. |
| Next | PR4 Draft kompakte Home, PR3 offen aktuelle News, PR2 Draft Directory-Publisher, PR1 Draft 2.2/Atlasbeta | Bestehende Entwürfe berücksichtigen. PR4 Remotehead `bc95c2b` ist älter als Website-Livebeleg `737a4fe`; vor Merge aktuelle Commit-/Basiskette abgleichen. Livebereitstellung ist keine PR-Zusammenführung. |
| App | PR9 und ältere PRs gemergt; aktueller Arbeitsbranch hat neuere geprüfte Quellen als main | Geprüfte Quelle, Repository-main, lokales Artefakt und Playversion getrennt führen. |
| Google Play | **App 2.1.2/Code32**, Produktion verfügbar, 178/178 Länder; **Next 2.2.0/Code27**, interner Test; Code28 historisch/inaktiv | Code28 nicht als aktuellen Produktionsstand planen. Code33 nicht hochgeladen beobachtet; dieser Audit liefert keinen neuen Release. |
| Next-Regionaltermine | Revision3 gültig bis **2.10.2026, 00:00 UTC**; ausgeführter `check-current-regional-events.mjs` endet Exit1 `regional-events-renewal-required` | P0-Inhaltspaketblocker. Website zeigt stale Hinweis und keine künftige Liste; Nachrichten/Medien bleiben erreichbar. Legacy-App Code32 verwendet einen anderen Terminpfad; Code27-Geräteverhalten nicht erneut geprüft. |
| Atlas/iOS | Bestehende separate Arbeiter und unfertige Integrations-/Buildabnahmen | Eigentum/Branches erhalten; unveränderliche Übergaben und Gerätetests einplanen. |

**Blocker nachgewiesen:** Podcast-Staging/Rebase und abgelaufener Next-Terminkatalog. **Weitere fehlende Nachweise:** Provideraccountlimits/Tarife, native iOS-Toolchain/Signierung, tatsächliche Medienwiedergabe und aktueller Atlas-Handoff. Fehlender Nachweis wird nicht als kaputte oder fertige Funktion ausgegeben. Das gesamte Portal ist nicht durch den Regionalblocker offline.

## Erstes zusammenhängendes Arbeitspaket

**„Inhalte zuverlässig finden, öffnen und wiederfinden“**, nach Prüfung dieses Plans:

1. **P0 Veröffentlichung sichern:** In der vorhandenen Podcastpipeline alle tatsächlich erzeugten freigegebenen Dateien einschließlich Archiv validieren/stagen; ein echter geplanter Lauf und öffentlicher Readback. Next-Termine wirklich neu prüfen, neue Revision samt Hashpins und abhängigen Inhaltspaketen erstellen. Ablaufdatum nicht ohne Review verlängern; Rebase-, Rechte-, Widerrufs- und Frischeguards erhalten.
2. **P1 gemeinsamen Stand sichtbar machen:** Drei neue Bibliotheks-IDs, aktuelle Video-IDs sowie App-Bundle/Remote-/Website-Zeitstand vergleichen. Freigegebene gemeinsame Projektionen weiterverwenden. Bereits laufende Website-/Gefangenenarbeit nicht überschreiben. Originallink, zulässiges Audio/Video und Volltext bewusst unterscheiden.
3. **P1 bestehende Bedienwege schließen:** Sichtbare Einstiege für Audio/Video/Wissen, eindeutige Unterbereiche, Direktlinks und vollständige Rückkehrzustände. Vorhandene Quoten-/Fehlerdaten verständlich anzeigen, Radio-/Podcastwiedergabe gezielt nachweisen und Aufgabenhilfe ergänzen. Das schafft zuerst Nutzbarkeit; breitere Inhalte und Atlas/iOS folgen in den vorhandenen Strängen.

**Abnahme:** sechs Kernwege J1–J6 in `ROADMAP.json`: News lesen/übersetzen/Zurück, Podcastserie filtern/öffnen/fortsetzen, Radio hören/teilen, Video ansehen/Original/Zurück, Lexikon→Buch/Podcast, gemeinsame Übersetzung mit zweitem Nutzer plus Quote/Timeout/Offline. 360/768/1440 px, Tastatur/Fokus und 200%-Reflow; DE/EN vollständige Wege, alle neun UI-Sprachen auf fehlende Labels/Überlauf. Je Fall konkrete Version, Eingabehash, Browser/Gerät, Datum und Ergebnis. Native Audio- und Offlineprüfungen separat. J7 Atlas und J8 iOS gehören zu deren späteren Integrationsabnahmen.

## Offene Entscheidungen und Roadmap-Änderung

Zu entscheiden sind Website-Playerumfang nach Rechteklasse gegenüber bewusstem Originalpfad, monatliche Providerbudgetobergrenze nach tatsächlichem Accountnachweis, Atlaspaket/Budgets sowie Mac-/Runner-/Apple-Signierungsweg des bestehenden iOS-Arbeiters. Die Architekturvorgabe ist Wiederverwendung der vorhandenen Systeme; diese Entscheidungen benötigen keine parallelen Projekte.

17 vorhandene Aufgaben wurden abgeglichen; **fünf tatsächlich fehlende Querschnittsaufgaben** ergänzt: Navigation, Videoredaktion, Quotenanzeige, Atlas-Hostintegration und native iOS-Abnahme. Historische Batch-/Releasebelege bleiben erhalten. Code31-Plan ist durch veröffentlichte Code32-Produktion überholt; Website-Loginblocker korrigiert. Wissen, Bibliotheksadapter, Hilfe, Radio und Podcastausbau bleiben ihre bestehenden Aufgaben, ergänzt um Priorität, Projekte, Abhängigkeiten und überprüfbare Abnahmen.

Die Dokumentationsprüfung kontrolliert JSON, eindeutige Aufgaben-IDs, auflösbare Abhängigkeiten ohne Zyklen und auflösbare Beleglinks sowie einen ausschließlich dokumentarischen Git-Diff. Sie ist keine Produkt-Testmatrix und keine Releasefreigabe.
