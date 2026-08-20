#!/usr/bin/env python3
"""Build small, lazily loadable 30-day news archives per source."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DEFAULT_DAYS = 30
DEFAULT_EXCERPT_LIMIT = 1400
CARD_FIELDS = (
    "kontinent", "categories", "primaryRegion", "primaryTopic",
    "secondaryTopics", "classificationConfidence", "classificationMethod",
    "editorialReview", "editorialReviewReasons", "quelleName", "author",
    "title", "link", "pubDate", "content", "contentComplete", "image",
    "images", "language", "languages", "originCountry", "originCountryCode",
    "originRegion", "sourceHomepage", "sourceTags", "type", "sourceType",
)


def read_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return fallback


def parse_date(value: Any) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = parsedate_to_datetime(text.replace(" UTC", " +0000"))
        except (TypeError, ValueError, OverflowError):
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def iso(value: datetime | None) -> str:
    return value.isoformat().replace("+00:00", "Z") if value else ""


def source_name(article: dict[str, Any]) -> str:
    return str(article.get("quelleName") or "Unknown source").strip()


def stable_article_key(article: dict[str, Any]) -> str:
    return str(article.get("link") or article.get("id") or article.get("title") or "").strip()


def source_id(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_name.casefold()).strip("-")[:54]
    digest = hashlib.sha256(name.casefold().encode("utf-8")).hexdigest()[:8]
    return f"{slug or 'source'}-{digest}"


def projected_article(article: dict[str, Any], excerpt_limit: int) -> dict[str, Any]:
    projected = {key: article[key] for key in CARD_FIELDS if key in article}
    content = str(projected.get("content") or "").strip()
    projected["content"] = content[:excerpt_limit]
    if len(content) > excerpt_limit:
        projected["webFeedTruncated"] = True
        projected["webFeedOriginalLength"] = len(content)
        projected["contentComplete"] = False
    images = projected.get("images")
    if isinstance(images, list):
        projected["images"] = images[:1]
    return projected


def build_source_archives(
    news: list[dict[str, Any]],
    quick_feed: list[dict[str, Any]],
    *,
    previous_articles: list[dict[str, Any]] | None = None,
    previous_tracking: dict[str, str] | None = None,
    days: int = DEFAULT_DAYS,
    excerpt_limit: int = DEFAULT_EXCERPT_LIMIT,
    generated_at: datetime | None = None,
) -> tuple[dict[str, Any], dict[str, list[dict[str, Any]]]]:
    merged: dict[str, dict[str, Any]] = {}
    for article in previous_articles or []:
        if isinstance(article, dict) and stable_article_key(article):
            merged[stable_article_key(article)] = article
    # Current archive rows win over an older projected copy of the same item.
    for article in news:
        if isinstance(article, dict) and stable_article_key(article):
            merged[stable_article_key(article)] = article
    dated = [
        (parse_date(article.get("pubDate")), article)
        for article in merged.values()
        if isinstance(article, dict) and source_name(article)
    ]
    dated = [(stamp, article) for stamp, article in dated if stamp]
    reference = max((stamp for stamp, _ in dated), default=generated_at or datetime.now(timezone.utc))
    cutoff = reference - timedelta(days=max(1, days))
    created = (generated_at or datetime.now(timezone.utc)).astimezone(timezone.utc)
    quick_keys = {
        stable_article_key(article)
        for article in quick_feed
        if isinstance(article, dict)
    }
    grouped: dict[str, list[tuple[datetime, dict[str, Any]]]] = {}
    for stamp, article in dated:
        if stamp < cutoff:
            continue
        grouped.setdefault(source_name(article), []).append((stamp, article))

    chunks: dict[str, list[dict[str, Any]]] = {}
    sources = []
    for name in sorted(grouped, key=str.casefold):
        rows = sorted(grouped[name], key=lambda item: item[0], reverse=True)
        identifier = source_id(name)
        projected = [projected_article(article, excerpt_limit) for _, article in rows]
        chunks[identifier] = projected
        oldest = rows[-1][0]
        newest = rows[0][0]
        tracking_started = parse_date((previous_tracking or {}).get(name)) or created
        coverage_complete = (
            oldest <= cutoff + timedelta(hours=24)
            and tracking_started <= cutoff + timedelta(hours=24)
        )
        sources.append({
            "id": identifier,
            "name": name,
            "path": f"news-archive/{identifier}.json",
            "itemCount": len(rows),
            "quickIndexCount": sum(stable_article_key(article) in quick_keys for _, article in rows),
            "newestAt": iso(newest),
            "oldestAt": iso(oldest),
            "coverage": "complete" if coverage_complete else "partial",
            "coverageDays": round(min(days, max(0.0, (reference - oldest).total_seconds() / 86400)), 2),
            "trackingStartedAt": iso(tracking_started),
        })

    manifest = {
        "schemaVersion": 1,
        "generatedAt": iso(created),
        "windowDays": days,
        "referenceAt": iso(reference),
        "cutoffAt": iso(cutoff),
        "sourceCount": len(sources),
        "itemCount": sum(source["itemCount"] for source in sources),
        "quickIndexCount": len(quick_feed),
        "sources": sources,
    }
    return manifest, chunks


def write_payload(path: Path, payload: Any, *, pretty: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    separators = None if pretty else (",", ":")
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2 if pretty else None, separators=separators) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--news", type=Path, default=ROOT / "news.json")
    parser.add_argument("--quick-feed", type=Path, default=ROOT / "news-feed.json")
    parser.add_argument("--output", type=Path, default=ROOT / "news-archive")
    parser.add_argument("--manifest", type=Path, default=ROOT / "news-archive-manifest.json")
    parser.add_argument("--days", type=int, default=DEFAULT_DAYS)
    parser.add_argument("--excerpt-limit", type=int, default=DEFAULT_EXCERPT_LIMIT)
    args = parser.parse_args()

    news = read_json(args.news, [])
    quick_feed = read_json(args.quick_feed, [])
    if not isinstance(news, list) or not news:
        raise SystemExit("news.json is missing or empty")
    if not isinstance(quick_feed, list):
        quick_feed = []

    previous_manifest = read_json(args.manifest, {})
    previous_tracking = {
        str(source.get("name") or ""): str(source.get("trackingStartedAt") or "")
        for source in previous_manifest.get("sources", [])
        if isinstance(source, dict) and source.get("name")
    } if isinstance(previous_manifest, dict) else {}
    previous_articles = []
    for archive_path in args.output.glob("*.json") if args.output.is_dir() else []:
        payload = read_json(archive_path, [])
        if isinstance(payload, list):
            previous_articles.extend(item for item in payload if isinstance(item, dict))

    manifest, chunks = build_source_archives(
        news,
        quick_feed,
        previous_articles=previous_articles,
        previous_tracking=previous_tracking,
        days=max(1, args.days),
        excerpt_limit=max(240, args.excerpt_limit),
    )
    args.output.mkdir(parents=True, exist_ok=True)
    expected = {f"{identifier}.json" for identifier in chunks}
    for stale in args.output.glob("*.json"):
        if stale.name not in expected:
            stale.unlink()
    for identifier, items in chunks.items():
        write_payload(args.output / f"{identifier}.json", items)
    write_payload(args.manifest, manifest, pretty=True)
    print(
        f"[SOURCE-ARCHIVE] {manifest['itemCount']} articles, "
        f"{manifest['sourceCount']} sources, {manifest['windowDays']} days."
    )


if __name__ == "__main__":
    main()
