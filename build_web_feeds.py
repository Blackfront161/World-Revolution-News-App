#!/usr/bin/env python3
"""Build small browser feeds while retaining the complete news/event archives.

The feed builder intentionally does not rewrite config.js. Application releases and
emergency settings are maintained separately from the automated data refresh.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent

NEWS_SOURCE = ROOT / "news.json"
EVENTS_SOURCE = ROOT / "events.json"
NEWS_TARGET = ROOT / "news-feed.json"
EVENTS_TARGET = ROOT / "events-feed.json"
STATUS_TARGET = ROOT / "feed-status.json"
RUN_STATUS_SOURCE = ROOT / "aggregate-run-status.json"
CONFIG_PATH = ROOT / "config.js"
DETAIL_CHUNK_PREFIX = "news-detail-"

NEWS_LIMIT = max(50, int(os.environ.get("WRN_NEWS_FEED_LIMIT", "500")))
NEWS_DETAIL_CHUNK_SIZE = max(
    10,
    min(100, int(os.environ.get("WRN_NEWS_DETAIL_CHUNK_SIZE", "25"))),
)
EVENT_LIMIT = max(50, int(os.environ.get("WRN_EVENT_FEED_LIMIT", "1000")))
NEWS_CONTENT_LIMIT = max(1000, int(os.environ.get("WRN_NEWS_CONTENT_LIMIT", "4500")))
EVENT_CONTENT_LIMIT = max(800, int(os.environ.get("WRN_EVENT_CONTENT_LIMIT", "2800")))
EVENT_COUNTRY_MINIMUM = max(
    1,
    int(os.environ.get("WRN_EVENT_COUNTRY_MINIMUM", "8")),
)
NEWS_CATEGORY_MINIMUM = max(
    4,
    int(os.environ.get("WRN_NEWS_CATEGORY_MINIMUM", "12")),
)
NEWS_CATEGORIES = (
    "Global", "Europe", "Africa", "North America", "Latin America",
    "Asia", "Australia & NZ", "Labor Struggles", "Antifascism",
    "Antisexism", "Queer-Feminism", "Antiracism", "No Borders",
    "Anticapitalism", "Theory & Strategy", "Anticolonialism",
    "Anti-Imperialism", "Squatting & Housing", "Demonstrations",
    "Anti-Rep & Prisons", "Cyberactivism", "No War",
    "Animal Liberation", "Eco-Anarchism", "Indigenous Struggles",
    "Radical Health & Disability", "Libraries", "Movement News",
)
CONFIG_UPDATE_ENABLED = os.environ.get("WRN_UPDATE_CONFIG", "").strip().lower() in {
    "1", "true", "yes", "on"
}
FEED_TARGETS = {
    value.strip().lower()
    for value in os.environ.get("WRN_FEED_TARGETS", "news,events,status").split(",")
    if value.strip()
}


def load_list(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError(f"{path.name} muss eine JSON-Liste enthalten.")
    return [item for item in data if isinstance(item, dict)]


def load_object(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return {}
    return data if isinstance(data, dict) else {}


def date_value(item: dict[str, Any]) -> float:
    candidates = (
        item.get("eventStart"),
        item.get("pubDate"),
        item.get("date"),
        item.get("published"),
    )
    for raw in candidates:
        value = str(raw or "").strip()
        if not value:
            continue
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.timestamp()
        except Exception:
            pass
        try:
            parsed = parsedate_to_datetime(value)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.timestamp()
        except Exception:
            pass
    return 0.0


def clean_text(value: Any) -> str:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.strip()


def shorten(value: Any, limit: int) -> tuple[str, bool]:
    text = clean_text(value)
    if len(text) <= limit:
        return text, False
    shortened = text[:limit]
    word_boundary = max(
        shortened.rfind(" "),
        shortened.rfind("\n"),
        shortened.rfind("."),
    )
    if word_boundary >= int(limit * 0.78):
        shortened = shortened[:word_boundary]
    return shortened.rstrip(" \n.,;:") + " …", True


def stable_key(item: dict[str, Any]) -> str:
    return str(
        item.get("link")
        or item.get("eventApiId")
        or item.get("id")
        or item.get("title")
        or ""
    ).strip().casefold()


def article_content_mode(item: dict[str, Any], content: str | None = None) -> str:
    """Classify published article text without ever implying missing text is full."""

    normalized = clean_text(item.get("content") if content is None else content)
    if not normalized:
        return "metadata"
    if item.get("contentComplete") is False or item.get("webFeedTruncated"):
        return "excerpt"
    explicit = clean_text(item.get("contentMode")).casefold()
    if explicit in {"full", "excerpt", "metadata"}:
        return explicit
    return "full"


def prepare(
    rows: list[dict[str, Any]],
    *,
    limit: int,
    content_limit: int,
    preserve_order: bool = False,
) -> list[dict[str, Any]]:
    ordered = rows if preserve_order else sorted(rows, key=date_value, reverse=True)
    output: list[dict[str, Any]] = []
    seen: set[str] = set()

    for source in ordered:
        key = stable_key(source)
        if key and key in seen:
            continue
        if key:
            seen.add(key)

        item = dict(source)
        # Structured full-article blocks live in lazy detail chunks. Keeping
        # them out of the quick feed preserves a fast start page.
        item.pop("contentBlocks", None)
        content, truncated = shorten(item.get("content"), content_limit)
        item["content"] = content
        if truncated:
            item["contentComplete"] = False
            item["webFeedTruncated"] = True
            item["webFeedOriginalLength"] = len(clean_text(source.get("content")))
        item["contentMode"] = article_content_mode(item, content)

        for field in ("title", "author", "quelleName", "eventVenue"):
            if field in item:
                item[field] = clean_text(item.get(field))

        output.append(item)
        if len(output) >= limit:
            break

    return output


def article_categories(item: dict[str, Any]) -> set[str]:
    categories = item.get("categories")
    values = categories if isinstance(categories, list) else [categories]
    values = [*values, item.get("kontinent")]
    return {
        clean_text(value)
        for value in values
        if clean_text(value)
    }


def balanced_news_rows(
    rows: list[dict[str, Any]],
    *,
    limit: int,
) -> list[dict[str, Any]]:
    """Keep the quick feed recent while guaranteeing useful category coverage."""
    ordered = sorted(rows, key=date_value, reverse=True)
    selected: list[dict[str, Any]] = []
    selected_keys: set[str] = set()

    def add(item: dict[str, Any]) -> None:
        key = stable_key(item)
        if key and key in selected_keys:
            return
        if key:
            selected_keys.add(key)
        selected.append(item)

    def diversified_category_matches(category: str) -> list[dict[str, Any]]:
        matches = [
            item for item in ordered
            if category in article_categories(item)
        ]
        by_source: dict[str, list[dict[str, Any]]] = {}
        for item in matches:
            source = clean_text(
                item.get("quelleName")
                or item.get("sourceName")
                or item.get("source")
                or "unknown"
            ).casefold()
            by_source.setdefault(source, []).append(item)

        result: list[dict[str, Any]] = []
        source_rows = list(by_source.values())
        depth = 0
        while len(result) < NEWS_CATEGORY_MINIMUM:
            added = False
            for rows_for_source in source_rows:
                if depth < len(rows_for_source):
                    result.append(rows_for_source[depth])
                    added = True
                    if len(result) >= NEWS_CATEGORY_MINIMUM:
                        break
            if not added:
                break
            depth += 1
        return result

    for category in NEWS_CATEGORIES:
        for item in diversified_category_matches(category):
            add(item)

    for item in ordered:
        if len(selected) >= limit:
            break
        add(item)

    return selected[:limit]


def prepare_events(
    rows: list[dict[str, Any]],
    *,
    limit: int,
    content_limit: int,
) -> list[dict[str, Any]]:
    """Publish only usable current events, nearest event first."""
    now = datetime.now(timezone.utc).timestamp()
    current = [
        item for item in rows
        if date_value({
            "eventStart": item.get("eventEnd")
            or item.get("eventStart")
            or item.get("pubDate")
        }) >= now - (2 * 60 * 60)
    ]
    ordered = sorted(current, key=date_value)
    selected: list[dict[str, Any]] = []
    selected_keys: set[str] = set()

    def select(item: dict[str, Any]) -> None:
        key = stable_key(item)
        if key and key in selected_keys:
            return
        if key:
            selected_keys.add(key)
        selected.append(item)

    by_country: dict[str, list[dict[str, Any]]] = {}
    for item in ordered:
        country = clean_text(item.get("eventCountry")).upper()
        if country:
            by_country.setdefault(country, []).append(item)
    countries = sorted(by_country)
    for depth in range(EVENT_COUNTRY_MINIMUM):
        for country in countries:
            if len(selected) >= limit:
                break
            if depth < len(by_country[country]):
                select(by_country[country][depth])
    for item in ordered:
        if len(selected) >= limit:
            break
        select(item)

    ordered = sorted(selected[:limit], key=date_value)
    output: list[dict[str, Any]] = []
    seen: set[str] = set()

    for source in ordered:
        key = stable_key(source)
        if key and key in seen:
            continue
        if key:
            seen.add(key)

        item = dict(source)
        item.pop("contentBlocks", None)
        content, truncated = shorten(item.get("content"), content_limit)
        item["content"] = content
        if truncated:
            item["contentComplete"] = False
            item["webFeedTruncated"] = True
            item["webFeedOriginalLength"] = len(clean_text(source.get("content")))
        item["contentMode"] = article_content_mode(item, content)
        output.append(item)
        if len(output) >= limit:
            break

    return output


def atomic_json(path: Path, data: Any) -> int:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(payload, encoding="utf-8")
    temporary.replace(path)
    return len(payload.encode("utf-8"))


def activate_config() -> bool:
    """Legacy opt-in migration; disabled unless WRN_UPDATE_CONFIG is explicit."""
    if not CONFIG_UPDATE_ENABLED:
        return False
    if not CONFIG_PATH.is_file():
        raise FileNotFoundError("config.js wurde nicht gefunden.")

    text = CONFIG_PATH.read_text(encoding="utf-8")
    original = text
    text = re.sub(
        r"news:\s*'https://blackfront161\.github\.io/"
        r"Revolution-News-Data/(?:news|news-feed)\.json'",
        "news: 'https://blackfront161.github.io/Revolution-News-Data/news-feed.json'",
        text,
        count=1,
    )
    text = re.sub(
        r"events:\s*'https://blackfront161\.github\.io/"
        r"Revolution-News-Data/(?:events|events-feed)\.json'",
        "events: 'https://blackfront161.github.io/Revolution-News-Data/events-feed.json'",
        text,
        count=1,
    )
    if text == original:
        return False
    CONFIG_PATH.write_text(text, encoding="utf-8")
    return True


def configured_version() -> str:
    if not CONFIG_PATH.is_file():
        return ""
    source = CONFIG_PATH.read_text(encoding="utf-8")
    match = re.search(
        r"window\.WRN_CONFIG\s*=\s*Object\.freeze\(\{.*?"
        r"\bversion:\s*['\"]([^'\"]+)",
        source,
        re.DOTALL,
    )
    return match.group(1) if match else ""


def newest_article_at(rows: list[dict[str, Any]]) -> str:
    newest = max((date_value(item) for item in rows), default=0.0)
    return datetime.fromtimestamp(newest, tz=timezone.utc).isoformat() if newest else ""


def ensure_news_feed_does_not_regress(
    rows: list[dict[str, Any]],
    previous_status: dict[str, Any],
) -> None:
    """Reject an automated publication whose newest article is older than live state."""

    candidate = max((date_value(item) for item in rows), default=0.0)
    previous_value = str(previous_status.get("news", {}).get("newestArticleAt") or "")
    previous = date_value({"date": previous_value}) if previous_value else 0.0
    if candidate and previous and candidate < previous:
        raise SystemExit(
            "Der neue News-Feed wäre älter als der bereits veröffentlichte Feed. "
            "Die vorhandenen Dateien werden nicht überschrieben."
        )


def aggregate_run_status() -> dict[str, Any]:
    if not RUN_STATUS_SOURCE.is_file():
        return {}
    try:
        payload = json.loads(RUN_STATUS_SOURCE.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return {}
    if not isinstance(payload, dict):
        return {}
    allowed = {
        "mode", "startedAt", "finishedAt", "elapsedSeconds",
        "sourcesConfigured", "sourcesEligible", "sourcesAttempted",
        "sourcesWithEntries", "sourcesSkippedByHealth", "newArticles",
        "enrichedArticles", "stoppedForBudget", "entryErrorCount",
    }
    return {key: payload.get(key) for key in allowed if key in payload}


def source_family(item: dict[str, Any]) -> str:
    value = clean_text(
        item.get("quelleName") or item.get("sourceName") or item.get("source")
    ).casefold()
    value = re.sub(r"[([{].*?[)\]}]", " ", value)
    value = re.sub(
        r"\b(türkçe|kurdi|kurdish|deutsch|german|english|français|french|"
        r"español|spanish|italiano|italian|português|portuguese)\b",
        " ",
        value,
    )
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    aliases = (
        (r"\bbianet\b", "bianet"),
        (r"\bevrensel\b", "evrensel"),
        (r"\b(znetwork|znet)\b", "znetwork"),
        (r"\bbulatlat\b", "bulatlat"),
        (r"\bindymedia\b", "indymedia"),
        (r"\bcrimethinc\b", "crimethinc"),
    )
    for pattern, alias in aliases:
        if re.search(pattern, value):
            return alias
    return value or "unknown-source"


def editorial_quality(rows: list[dict[str, Any]], sample_size: int = 50) -> dict[str, Any]:
    sample = rows[:max(0, sample_size)]
    families = [source_family(item) for item in sample]
    counts: dict[str, int] = {}
    max_streak = 0
    current_streak = 0
    previous = ""
    for family in families:
        counts[family] = counts.get(family, 0) + 1
        current_streak = current_streak + 1 if family == previous else 1
        max_streak = max(max_streak, current_streak)
        previous = family
    regions = {
        clean_text(item.get("primaryRegion") or item.get("kontinent"))
        for item in sample
        if clean_text(item.get("primaryRegion") or item.get("kontinent"))
    }
    topics = {
        clean_text(item.get("primaryTopic"))
        for item in sample
        if clean_text(item.get("primaryTopic"))
    }
    maximum = max(counts.values(), default=0)
    return {
        "sampleSize": len(sample),
        "uniqueSourceFamilies": len(counts),
        "uniqueRegions": len(regions),
        "uniqueTopics": len(topics),
        "maxSourceStreak": max_streak,
        "maxSourceShare": round(maximum / len(sample), 4) if sample else 0,
    }
    return {key: value for key, value in payload.items() if key in allowed}


def write_news_detail_chunks(
    quick_rows: list[dict[str, Any]],
    archive_rows: list[dict[str, Any]],
) -> list[str]:
    """Publish bounded, lazy-loaded full-text chunks for the quick feed."""

    archive_by_key = {
        stable_key(item): item
        for item in archive_rows
        if stable_key(item)
    }
    written: list[str] = []
    for start in range(0, len(quick_rows), NEWS_DETAIL_CHUNK_SIZE):
        quick_chunk = quick_rows[start:start + NEWS_DETAIL_CHUNK_SIZE]
        detail_rows: list[dict[str, Any]] = []
        filename = (
            f"{DETAIL_CHUNK_PREFIX}"
            f"{(start // NEWS_DETAIL_CHUNK_SIZE) + 1:02d}.json"
        )
        for quick_item in quick_chunk:
            archive_item = archive_by_key.get(stable_key(quick_item))
            if not archive_item:
                continue
            full_content = clean_text(archive_item.get("content"))
            quick_content = clean_text(quick_item.get("content"))
            has_structured_content = bool(archive_item.get("contentBlocks"))
            if len(full_content) <= len(quick_content) and not has_structured_content:
                continue
            quick_item["detailPath"] = filename
            detail_item = dict(archive_item)
            detail_item["contentMode"] = article_content_mode(detail_item)
            detail_rows.append(detail_item)
        if detail_rows:
            atomic_json(ROOT / filename, detail_rows)
            written.append(filename)
    return written


def main() -> int:
    news = load_list(NEWS_SOURCE)
    events = load_list(EVENTS_SOURCE)
    news_feed = prepare(
        balanced_news_rows(news, limit=NEWS_LIMIT),
        limit=NEWS_LIMIT,
        content_limit=NEWS_CONTENT_LIMIT,
        preserve_order=True,
    )
    event_feed = prepare_events(
        events,
        limit=EVENT_LIMIT,
        content_limit=EVENT_CONTENT_LIMIT,
    )

    write_news = "news" in FEED_TARGETS
    write_events = "events" in FEED_TARGETS
    write_status = "status" in FEED_TARGETS

    if write_news and not news_feed:
        raise SystemExit(
            "Der schnelle News-Feed wäre leer. "
            "Die vorhandenen Dateien werden nicht überschrieben."
        )

    previous_status = load_object(STATUS_TARGET)
    if write_news:
        ensure_news_feed_does_not_regress(news_feed, previous_status)

    detail_files = write_news_detail_chunks(news_feed, news) if write_news else []
    news_bytes = atomic_json(NEWS_TARGET, news_feed) if write_news else (
        NEWS_TARGET.stat().st_size if NEWS_TARGET.is_file() else 0
    )
    event_bytes = atomic_json(EVENTS_TARGET, event_feed) if write_events else (
        EVENTS_TARGET.stat().st_size if EVENTS_TARGET.is_file() else 0
    )
    published_news_feed = news_feed if write_news else load_list(NEWS_TARGET)
    published_event_feed = event_feed if write_events else load_list(EVENTS_TARGET)
    config_changed = activate_config()

    published_at = datetime.now(timezone.utc).isoformat()
    aggregation = aggregate_run_status()
    last_successful_fetch_at = clean_text(
        aggregation.get("finishedAt") or aggregation.get("startedAt")
    ) or published_at
    status = {
        "ok": True,
        "generatedAt": published_at,
        "lastSuccessfulFetchAt": last_successful_fetch_at,
        "lastPublishedAt": published_at,
        "version": configured_version(),
        "news": {
            "archiveCount": len(news),
            "feedCount": len(published_news_feed),
            "bytes": news_bytes,
            "contentLimit": NEWS_CONTENT_LIMIT,
            "categoryMinimum": NEWS_CATEGORY_MINIMUM,
            "newestArticleAt": newest_article_at(published_news_feed),
            "detailChunkCount": len(detail_files),
            "detailChunkSize": NEWS_DETAIL_CHUNK_SIZE,
            "editorialQuality": editorial_quality(published_news_feed),
        },
        "events": {
            "archiveCount": len(events),
            "feedCount": len(published_event_feed),
            "bytes": event_bytes,
            "contentLimit": EVENT_CONTENT_LIMIT,
            "countryMinimum": EVENT_COUNTRY_MINIMUM,
        },
        "configActivated": config_changed,
        "configUpdateEnabled": CONFIG_UPDATE_ENABLED,
        "publication": {
            "pending": False,
            "newArticlesFound": int(aggregation.get("newArticles") or 0),
        },
        "aggregation": aggregation,
    }
    if write_status:
        atomic_json(STATUS_TARGET, status)

    print(
        f"[WEB-FEED] News: {len(published_news_feed)}/{len(news)} "
        f"({news_bytes / 1024 / 1024:.2f} MiB)"
    )
    print(
        f"[WEB-FEED] Termine: {len(published_event_feed)}/{len(events)} "
        f"({event_bytes / 1024 / 1024:.2f} MiB)"
    )
    print(
        "[WEB-FEED] config.js: "
        + ("opt-in aktualisiert" if config_changed else "geschützt / unverändert")
    )
    print(
        "[WEB-FEED] Ziele: "
        + ", ".join(sorted(FEED_TARGETS))
    )
    if write_news:
        print(
            f"[WEB-FEED] Volltexte: {len(detail_files)} "
            "bedarfsgeladene Pakete"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
