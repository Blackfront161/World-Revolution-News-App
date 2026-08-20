#!/usr/bin/env python3
"""Build a neutral source catalogue from news.json.

The catalogue describes only data that is present in the app. It does not rate,
endorse, or infer the political reliability of a source.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
NEWS_PATH = ROOT / "news.json"
OUTPUT_PATH = ROOT / "source-catalog.json"


def parse_date(value: object) -> datetime | None:
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = parsedate_to_datetime(text)
        except (TypeError, ValueError, OverflowError):
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def string_list(value: object) -> list[str]:
    source = value if isinstance(value, list) else ([value] if value else [])
    result: list[str] = []
    for item in source:
        clean = str(item).strip()
        if clean and clean not in result:
            result.append(clean)
    return result


def source_name(article: dict[str, object]) -> str:
    return str(article.get("quelleName") or article.get("sourceName") or article.get("source") or "").strip()


def article_categories(article: dict[str, object]) -> list[str]:
    result: list[str] = []
    for key in ("categories", "eventCategories", "tags", "eventTags"):
        for item in string_list(article.get(key)):
            if item not in result:
                result.append(item)
    old = str(article.get("kontinent") or "").strip()
    if old and old not in result:
        result.append(old)
    return result


def homepage_from_link(value: object) -> tuple[str, str]:
    try:
        parsed = urlparse(str(value or ""))
    except ValueError:
        return "", ""
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return "", ""
    return f"{parsed.scheme}://{parsed.netloc}/", parsed.netloc


def main() -> int:
    if not NEWS_PATH.is_file():
        raise SystemExit("news.json fehlt.")
    data = json.loads(NEWS_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("news.json muss eine Liste sein.")

    sources: dict[str, dict[str, object]] = {}
    for raw_article in data:
        if not isinstance(raw_article, dict):
            continue
        name = source_name(raw_article)
        if not name:
            continue
        entry = sources.setdefault(name, {
            "name": name,
            "articleCount": 0,
            "languages": set(),
            "categories": Counter(),
            "website": "",
            "domain": "",
            "latestArticleAt": "",
            "latestArticleTitle": "",
            "latestArticleUrl": "",
        })
        entry["articleCount"] = int(entry["articleCount"]) + 1
        language = str(raw_article.get("language") or raw_article.get("lang") or "").strip()
        if language:
            entry["languages"].add(language)
        for category in article_categories(raw_article):
            entry["categories"][category] += 1

        link = str(raw_article.get("link") or "").strip()
        if not entry["website"]:
            website, domain = homepage_from_link(link)
            entry["website"] = website
            entry["domain"] = domain

        article_date = parse_date(raw_article.get("updatedAt") or raw_article.get("pubDate") or raw_article.get("eventStart"))
        previous_date = parse_date(entry["latestArticleAt"])
        if article_date and (previous_date is None or article_date > previous_date):
            entry["latestArticleAt"] = article_date.isoformat().replace("+00:00", "Z")
            entry["latestArticleTitle"] = str(raw_article.get("title") or "").strip()
            entry["latestArticleUrl"] = link

    output_sources = []
    for name in sorted(sources, key=str.casefold):
        entry = sources[name]
        output_sources.append({
            "name": entry["name"],
            "website": entry["website"],
            "domain": entry["domain"],
            "articleCount": entry["articleCount"],
            "languages": sorted(entry["languages"], key=str.casefold),
            "categories": [category for category, _ in entry["categories"].most_common(8)],
            "latestArticleAt": entry["latestArticleAt"],
            "latestArticleTitle": entry["latestArticleTitle"],
            "latestArticleUrl": entry["latestArticleUrl"],
        })

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sourceCount": len(output_sources),
        "sources": output_sources,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"source-catalog.json aktualisiert: {len(output_sources)} Quellen")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
