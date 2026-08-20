#!/usr/bin/env python3
"""Aggregiert kuratierte Original-Podcast-Feeds.

Es werden ausschließlich Metadaten und Original-URLs gespeichert.
Audiodateien werden weder kopiert noch neu veröffentlicht.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import feedparser
import requests
from bs4 import BeautifulSoup

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

ROOT = Path(__file__).resolve().parent
SOURCES_FILE = ROOT / "podcast-sources.json"
OUTPUT_FILE = ROOT / "podcasts.json"
HEALTH_FILE = ROOT / "podcast-health.json"

MAX_PER_SOURCE = 35
MAX_RADIO_ARCHIVE = 600
MAX_INDEPENDENT_ARCHIVE_PER_LANGUAGE = 240
DEFAULT_MAX_AGE_DAYS = 730
USER_AGENT = "WorldRevolutionNews-AudioCatalog/1.7.5 (+https://blackfront161.github.io/Revolution-News-Data/)"
AUDIO_EXTENSIONS = (".mp3", ".m4a", ".ogg", ".oga", ".opus", ".wav", ".aac", ".flac")
HTTPS_UPGRADE_HOSTS = {"www.freie-radios.net", "freie-radios.net"}
TRUSTED_BINARY_AUDIO_HOSTS = {"www.freie-radios.net", "freie-radios.net"}

# The catalogue supports these languages in the app.  Feeds often expose no
# per-episode language at all, so the source language remains the safe
# fallback.  We only override it when an episode contains a clear marker or a
# sufficiently strong stop-word signal.  That keeps an English guest name in a
# German episode from moving the whole episode into the English shelf.
LANGUAGE_MARKERS = {
    "de": (r"\b(?:auf deutsch|deutsch|deutschsprachig|german(?: language)?)\b",),
    "en": (r"\b(?:auf englisch|englisch|in english|english(?: language)?)\b",),
    "es": (r"\b(?:en español|spanish(?: language)?)\b",),
    "fr": (r"\b(?:en français|french(?: language)?)\b",),
    "it": (r"\b(?:in italiano|italian(?: language)?)\b",),
    "pt": (r"\b(?:em português|portuguese(?: language)?)\b",),
    "tr": (r"\b(?:türkçe|in turkish|turkish(?: language)?)\b",),
    "el": (r"(?:στα ελληνικά|ελληνικά|in greek|greek language)",),
    "ru": (r"(?:на русском|по-русски|in russian|russian language)",),
    "ar": (r"\b(?:بالعربية|in arabic|arabic(?: language)?)\b",),
    "zh": (r"(?:中文|汉语|漢語|in chinese|chinese language)",),
}
LANGUAGE_STOPWORDS = {
    "de": {"aber", "auch", "auf", "aus", "bei", "das", "dass", "dem", "den", "der", "die", "ein", "eine", "für", "gegen", "ist", "mit", "nicht", "oder", "sich", "und", "von", "was", "wie", "wir", "über"},
    "en": {"about", "after", "against", "and", "are", "but", "for", "from", "how", "into", "is", "not", "of", "on", "our", "that", "the", "their", "this", "to", "what", "with", "why"},
    "es": {"como", "con", "contra", "de", "del", "desde", "el", "en", "es", "esta", "la", "las", "los", "más", "no", "para", "por", "que", "se", "sin", "una", "y"},
    "fr": {"avec", "ce", "ces", "comme", "contre", "dans", "de", "des", "du", "elle", "en", "est", "et", "la", "le", "les", "mais", "ne", "pas", "pour", "que", "qui", "sur", "une"},
    "it": {"che", "come", "con", "contro", "da", "del", "della", "di", "e", "gli", "il", "in", "la", "le", "ma", "non", "per", "più", "sono", "su", "tra", "una"},
    "pt": {"com", "como", "contra", "da", "das", "de", "do", "dos", "e", "em", "entre", "não", "os", "para", "pela", "por", "que", "se", "sem", "uma"},
    "tr": {"ama", "bir", "bu", "da", "de", "için", "ile", "mi", "mı", "nasıl", "ne", "olarak", "olan", "ve", "ya"},
    "el": {"αλλά", "από", "για", "δεν", "είναι", "ένα", "η", "θα", "και", "με", "μια", "να", "οι", "που", "σε", "στη", "στο", "την", "της", "το", "των"},
    "ru": {"без", "был", "быть", "в", "для", "его", "и", "из", "как", "к", "на", "не", "но", "о", "от", "по", "с", "что", "это"},
}
DISABLED_PODCAST_LANGUAGES = {"zh"}
LANGUAGE_EVIDENCE_CONFIDENCE = {
    "episode-metadata": 1.0,
    "transcript-metadata": 0.98,
    "feed-metadata": 0.95,
    "text-marker": 0.92,
    "script": 0.9,
    "automatic-text": 0.82,
    "source-fallback": 0.55,
}

session = requests.Session()
session.headers.update({
    "User-Agent": USER_AGENT,
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5",
})


def clean_text(value: object) -> str:
    if not value:
        return ""
    soup = BeautifulSoup(str(value), "html.parser")
    return re.sub(r"\s+", " ", soup.get_text(" ", strip=True)).strip()


def normalise_language(value: object) -> str:
    """Return an app language code for common RSS language spellings."""
    raw = str(value or "").strip().lower().replace("_", "-")
    if not raw:
        return ""
    aliases = {
        "ger": "de", "deu": "de", "german": "de",
        "eng": "en", "english": "en",
        "spa": "es", "spanish": "es",
        "fra": "fr", "fre": "fr", "french": "fr",
        "ita": "it", "italian": "it",
        "por": "pt", "portuguese": "pt",
        "tur": "tr", "turkish": "tr",
        "ell": "el", "gre": "el", "greek": "el",
        "rus": "ru", "russian": "ru",
        "ara": "ar", "arabic": "ar",
        "zho": "zh", "chi": "zh", "chinese": "zh",
    }
    primary = raw.split("-", 1)[0]
    primary = aliases.get(primary, primary)
    return primary if primary in {
        "de", "en", "es", "fr", "it", "pt", "tr", "el", "ru", "ar", "zh"
    } else ""


def detect_episode_language_details(
    entry,
    title: str,
    description: str,
    source_default: str,
    feed_default: str = "",
) -> tuple[str, str]:
    """Return the episode language and the strongest available evidence."""
    fallback = normalise_language(source_default) or "und"

    for key in (
        "language", "dc_language", "content_language",
        "transcript_language", "podcast_transcript_language",
    ):
        explicit = normalise_language(entry.get(key))
        if explicit:
            return explicit, "episode-metadata"

    for transcript in entry.get("podcast_transcript", []) or []:
        if not isinstance(transcript, dict):
            continue
        explicit = normalise_language(
            transcript.get("language") or transcript.get("lang")
        )
        if explicit:
            return explicit, "transcript-metadata"

    feed_language = normalise_language(feed_default)
    if feed_language:
        return feed_language, "feed-metadata"

    text = f"{title}\n{description}".lower()
    for language, patterns in LANGUAGE_MARKERS.items():
        if any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in patterns):
            return language, "text-marker"

    # CJK and Arabic scripts are distinctive enough not to need stop words.
    if len(re.findall(r"[\u4e00-\u9fff]", text)) >= 4:
        return "zh", "script"
    if len(re.findall(r"[\u0600-\u06ff]", text)) >= 6:
        return "ar", "script"

    tokens = re.findall(r"[^\W\d_]+", text, flags=re.UNICODE)
    scores = {
        language: sum(1 for token in tokens if token in words)
        for language, words in LANGUAGE_STOPWORDS.items()
    }
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    best_language, best_score = ranked[0]
    runner_up = ranked[1][1]
    if best_score >= 4 and best_score >= runner_up + 2:
        return best_language, "automatic-text"
    return fallback, "source-fallback"


def detect_episode_language(
    entry,
    title: str,
    description: str,
    default: str,
    feed_default: str = "",
) -> str:
    return detect_episode_language_details(
        entry,
        title,
        description,
        default,
        feed_default,
    )[0]


def episode_feed_language(source: dict, parsed_feed) -> str:
    """Use channel language only when the curated source is not multilingual."""
    configured = {
        normalise_language(value)
        for value in (source.get("languages") or [source.get("language")])
        if normalise_language(value)
    }
    if len(configured) > 1:
        return ""
    for key in ("language", "dc_language", "content_language"):
        language = normalise_language(parsed_feed.get(key))
        if language:
            return language
    return ""


def podcast_language_allowed(value: object) -> bool:
    return normalise_language(value) not in DISABLED_PODCAST_LANGUAGES


def deduplicate_episodes(items: list[dict]) -> list[dict]:
    """Prefer stable episode IDs, then resolve shared audio by source priority."""
    by_id: dict[str, dict] = {}
    without_id: list[dict] = []
    for item in items:
        episode_id = str(item.get("id") or "").strip()
        if not episode_id:
            without_id.append(item)
            continue
        existing = by_id.get(episode_id)
        if (
            not existing
            or int(item.get("sourcePriority", 0))
            > int(existing.get("sourcePriority", 0))
        ):
            by_id[episode_id] = item

    by_audio: dict[str, dict] = {}
    for item in [*by_id.values(), *without_id]:
        audio_url = str(item.get("audioUrl") or "").strip()
        if not audio_url:
            continue
        existing = by_audio.get(audio_url)
        if (
            not existing
            or int(item.get("sourcePriority", 0))
            > int(existing.get("sourcePriority", 0))
        ):
            by_audio[audio_url] = item
    return list(by_audio.values())


def safe_url(value: object, base: str = "") -> str:
    if not value:
        return ""
    url = urljoin(base, str(value).strip())
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return ""
    if parsed.scheme == "http" and (parsed.hostname or "").lower() in HTTPS_UPGRADE_HOSTS:
        url = "https://" + url.split("://", 1)[1]
    return url


def is_audio_candidate(value: object, content_type: object = "") -> bool:
    if not value:
        return False
    typ = str(content_type or "").lower().split(";", 1)[0].strip()
    if typ.startswith("audio/"):
        return True
    parsed = urlparse(str(value).strip())
    path = parsed.path.lower()
    if path.endswith(AUDIO_EXTENSIONS):
        return True
    return (parsed.hostname or "").lower() in TRUSTED_BINARY_AUDIO_HOSTS and path.endswith(".bin")


def parse_date(entry) -> str:
    for key in ("published_parsed", "updated_parsed", "created_parsed"):
        value = entry.get(key)
        if value:
            return datetime(*value[:6], tzinfo=timezone.utc).isoformat()
    for key in ("published", "updated", "pubDate"):
        value = entry.get(key)
        if not value:
            continue
        try:
            dt = parsedate_to_datetime(value)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).isoformat()
        except Exception:
            continue
    return ""


def audio_from_entry(entry) -> str:
    candidates: list[str] = []
    for enc in entry.get("enclosures", []) or []:
        href = enc.get("href") or enc.get("url")
        typ = str(enc.get("type") or "").lower()
        if is_audio_candidate(href, typ):
            candidates.append(href)

    for link in entry.get("links", []) or []:
        href = link.get("href")
        typ = str(link.get("type") or "").lower()
        rel = str(link.get("rel") or "").lower()
        if href and rel == "enclosure" and is_audio_candidate(href, typ):
            candidates.append(href)

    for item in entry.get("media_content", []) or []:
        href = item.get("url")
        typ = str(item.get("type") or "").lower()
        if is_audio_candidate(href, typ):
            candidates.append(href)

    html_parts = []
    for key in ("summary", "description"):
        if entry.get(key):
            html_parts.append(str(entry.get(key)))
    for part in entry.get("content", []) or []:
        if part.get("value"):
            html_parts.append(str(part.get("value")))

    for html in html_parts:
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup.find_all(["audio", "source", "a"]):
            href = tag.get("src") or tag.get("href")
            if is_audio_candidate(href, tag.get("type")):
                candidates.append(href)

    for candidate in candidates:
        url = safe_url(candidate, entry.get("link") or "")
        if url:
            return url
    return ""


def discover_feeds(homepage: str) -> list[str]:
    if not homepage:
        return []
    try:
        response = session.get(homepage, timeout=22)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        found = []
        for link in soup.find_all("link", rel=lambda x: x and "alternate" in x):
            typ = str(link.get("type") or "").lower()
            href = link.get("href")
            if href and ("rss" in typ or "atom" in typ or "xml" in typ):
                found.append(urljoin(response.url, href))
        return list(dict.fromkeys(found))
    except Exception:
        return []


def find_audio_on_page(url: str) -> str:
    if not url:
        return ""
    try:
        response = session.get(url, timeout=25)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup.find_all(["audio", "source", "a"]):
            href = tag.get("src") or tag.get("href")
            if not href:
                continue
            absolute = safe_url(href, response.url)
            typ = str(tag.get("type") or "").lower()
            if absolute and is_audio_candidate(absolute, typ):
                return absolute
    except Exception:
        return ""
    return ""


def source_feed_candidates(source: dict) -> list[str]:
    """Return maintained feed URLs before slower homepage discovery.

    Some sources publish a repaired canonical URL in ``feedUrl`` while keeping
    older fallbacks in ``feedUrls``. The repaired endpoint must win, otherwise
    a working source can be reported as broken despite valid metadata.
    """

    candidates = []
    canonical = str(source.get("feedUrl") or "").strip()
    if canonical:
        candidates.append(canonical)
    candidates.extend(source.get("feedUrls") or [])
    candidates.extend(discover_feeds(source.get("homepage", "")))
    return list(dict.fromkeys(candidate for candidate in candidates if candidate))


def source_entries(source: dict) -> tuple[list[dict], str, list[str]]:
    candidates = source_feed_candidates(source)
    errors: list[str] = []

    for feed_url in candidates:
        try:
            response = session.get(feed_url, timeout=32)
            response.raise_for_status()
            parsed = feedparser.parse(response.content)

            if not parsed.entries:
                errors.append(f"{feed_url}: keine Einträge")
                continue

            feed_language = episode_feed_language(source, parsed.feed)
            result = []
            for entry in parsed.entries[:MAX_PER_SOURCE * 3]:
                audio = audio_from_entry(entry)
                episode_url = safe_url(entry.get("link") or entry.get("id") or "", feed_url)

                if not audio and source.get("pageAudioFallback") and episode_url:
                    audio = find_audio_on_page(episode_url)
                    time.sleep(0.12)

                if not audio:
                    continue

                title = clean_text(entry.get("title")) or source.get("name", "Podcast")
                description = clean_text(
                    entry.get("summary")
                    or entry.get("description")
                    or (entry.get("content") or [{}])[0].get("value")
                )
                published = parse_date(entry)
                duration = clean_text(entry.get("itunes_duration") or entry.get("duration"))
                image = ""

                for img in entry.get("media_thumbnail", []) or []:
                    image = safe_url(img.get("url"))
                    if image:
                        break

                if not image:
                    image = safe_url(
                        entry.get("image", {}).get("href")
                        if isinstance(entry.get("image"), dict)
                        else ""
                    )

                language, language_source = detect_episode_language_details(
                    entry,
                    title,
                    description,
                    source.get("language", ""),
                    feed_language,
                )
                configured_languages = sorted({
                    normalise_language(value)
                    for value in (source.get("languages") or [source.get("language")])
                    if normalise_language(value)
                })
                language_confidence = LANGUAGE_EVIDENCE_CONFIDENCE.get(
                    language_source,
                    0.5,
                )
                language_mismatch = bool(
                    configured_languages
                    and language not in configured_languages
                )
                guid_seed = str(entry.get("id") or entry.get("guid") or audio)
                result.append({
                    "id": hashlib.sha256(f"{source.get('id')}|{guid_seed}".encode()).hexdigest()[:24],
                    "type": "original-podcast",
                    "sourceId": source.get("id", ""),
                    "sourceName": source.get("name", ""),
                    "sourceKind": source.get("sourceKind", "independent-podcast"),
                    "sourcePriority": int(source.get("priority", 50)),
                    "title": title,
                    "description": description[:4000],
                    "published": published,
                    "duration": duration,
                    "language": language,
                    "languageSource": language_source,
                    "languageConfidence": language_confidence,
                    "languageVerified": language_confidence >= 0.8,
                    "languageReviewRequired": (
                        language_confidence < 0.8 or language_mismatch
                    ),
                    "configuredLanguages": configured_languages,
                    "country": source.get("country", ""),
                    "region": source.get("region", ""),
                    "audioUrl": audio,
                    "episodeUrl": episode_url or source.get("homepage", ""),
                    "feedUrl": feed_url,
                    "artwork": image,
                    "topics": source.get("topics", []),
                    "categories": source.get("categories", []),
                    "license": source.get("license", "Originalquelle"),
                })

                if len(result) >= MAX_PER_SOURCE:
                    break

            if result:
                return result, feed_url, errors

            errors.append(f"{feed_url}: Einträge ohne direkt abspielbare Audiodatei")
        except Exception as exc:
            errors.append(f"{feed_url}: {type(exc).__name__}: {exc}")

    return [], "", errors[-6:]


def parse_iso(value: str) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return None


def partitioned_catalog(items: list[dict]) -> list[dict]:
    """Keep radio and every independent podcast language autonomous.

    The browser applies the smaller presentation quotas (50 radio episodes and
    30 independent episodes per selected language). These archive limits leave
    enough history for source balancing without letting one language or the
    radio pool consume another group's capacity.
    """
    radio: list[dict] = []
    independent: dict[str, list[dict]] = {}
    for item in items:
        kind = str(item.get("sourceKind") or "independent-podcast").lower()
        if kind in {"free-radio", "aggregator"}:
            radio.append(item)
            continue
        language = str(item.get("language") or "und").lower().split("-", 1)[0]
        independent.setdefault(language or "und", []).append(item)

    selected = radio[:MAX_RADIO_ARCHIVE]
    for language in sorted(independent):
        selected.extend(
            independent[language][:MAX_INDEPENDENT_ARCHIVE_PER_LANGUAGE]
        )
    return sorted(
        selected,
        key=lambda item: item.get("published") or "",
        reverse=True,
    )


def main() -> int:
    sources = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    catalog_source_ids = {
        source.get("id")
        for source in sources
        if source.get("id")
    }
    requested_ids = {
        value.strip()
        for value in os.environ.get("WRN_PODCAST_SOURCE_IDS", "").split(",")
        if value.strip()
    }
    if requested_ids:
        sources = [
            source for source in sources
            if source.get("id") in requested_ids
        ]
        missing = requested_ids - {
            source.get("id") for source in sources
        }
        if missing:
            raise SystemExit(
                "Unbekannte Podcast-Quellen: "
                + ", ".join(sorted(missing))
            )
    all_items: list[dict] = []
    health: dict[str, dict] = {}
    if requested_ids and HEALTH_FILE.exists():
        try:
            existing_health = json.loads(
                HEALTH_FILE.read_text(encoding="utf-8")
            )
            if isinstance(existing_health, dict):
                health.update({
                    key: value
                    for key, value in existing_health.items()
                    if key in catalog_source_ids
                })
        except Exception:
            pass

    for source in sources:
        source_id = source.get("id", source.get("name", "unknown"))
        if source.get("enabled", True) is False:
            health[source_id] = {
                "name": source.get("name"),
                "status": "disabled",
                "ok": False,
                "episodes": 0,
                "feedOrError": source.get("disabledReason", "deaktiviert"),
                "checkedAt": datetime.now(timezone.utc).isoformat(),
            }
            continue

        print(f"[PODCAST] {source.get('name')}")
        items, used_feed, errors = source_entries(source)
        max_age = int(source.get("maxAgeDays", DEFAULT_MAX_AGE_DAYS))
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age)
        fresh: list[dict] = []
        stale: list[dict] = []

        for item in items:
            published = parse_iso(item.get("published", ""))
            if published and published < cutoff:
                stale.append(item)
            else:
                fresh.append(item)

        selected = [
            item for item in (fresh or stale[: min(10, MAX_PER_SOURCE)])
            if podcast_language_allowed(item.get("language"))
        ]
        all_items.extend(selected)

        latest = max(
            (item.get("published", "") for item in items if item.get("published")),
            default=""
        )

        if fresh:
            status = "healthy"
        elif stale:
            status = "stale"
        else:
            status = "error"

        health[source_id] = {
            "name": source.get("name"),
            "status": status,
            "ok": status in {"healthy", "stale"},
            "episodes": len(selected),
            "freshEpisodes": len(fresh),
            "latestPublished": latest,
            "feedOrError": used_feed or "; ".join(errors),
            "checkedAt": datetime.now(timezone.utc).isoformat(),
            "region": source.get("region", ""),
            "language": source.get("language", ""),
        }

    # Stabile Episoden-IDs entfernen auch Provider-Duplikate mit wechselnden
    # Audio-URLs. Bei gemeinsam genutzten Audiodateien gewinnt anschließend
    # weiterhin die spezifischere Quelle vor Aggregatoren.
    items = deduplicate_episodes(all_items)
    items.sort(key=lambda x: x.get("published") or "", reverse=True)

    previous_items = []
    if OUTPUT_FILE.exists():
        try:
            loaded = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
            if isinstance(loaded, list):
                previous_items = [
                    item for item in loaded
                    if (
                        isinstance(item, dict)
                        and item.get("audioUrl")
                        and podcast_language_allowed(item.get("language"))
                    )
                ]
        except Exception as exc:
            print(f"[PODCAST] bisherige Datei konnte nicht gelesen werden: {exc}")

    if requested_ids and previous_items:
        retained = [
            item for item in previous_items
            if item.get("sourceId") not in requested_ids
        ]
        targeted = {
            item.get("audioUrl"): item
            for item in items
            if item.get("audioUrl")
        }
        for item in retained:
            targeted.setdefault(item.get("audioUrl"), item)
        items = sorted(
            targeted.values(),
            key=lambda item: item.get("published") or "",
            reverse=True,
        )

    if items:
        output_items = partitioned_catalog(items)
        OUTPUT_FILE.write_text(
            json.dumps(output_items, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )
        print(f"[PODCAST] {len(output_items)} Folgen gespeichert")
    elif previous_items:
        print(f"[PODCAST] keine neuen Folgen; {len(previous_items)} vorhandene Folgen bleiben erhalten")
    else:
        OUTPUT_FILE.write_text("[]\n", encoding="utf-8")
        print("[PODCAST] keine abspielbaren Folgen vorhanden")

    HEALTH_FILE.write_text(
        json.dumps(health, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
