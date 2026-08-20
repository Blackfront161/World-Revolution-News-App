#!/usr/bin/env python3
"""Reapply WRN's current region/topic classifier to the stored news archive."""

from __future__ import annotations

import ast
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any

ROOT = Path(__file__).resolve().parent
AGGREGATE = ROOT / "aggregate.py"
NEWS = ROOT / "news.json"
REPORT = ROOT / "source-category-audit.json"
REVIEW_QUEUE = ROOT / "editorial-review.json"
SOURCE_CATALOG = ROOT / "source-catalog.json"


def definitions() -> tuple[dict[str, list[dict[str, Any]]], list[dict[str, Any]], Any, set[str], dict[str, Any]]:
    tree = ast.parse(AGGREGATE.read_text(encoding="utf-8"))
    base_sources: dict[str, list[dict[str, Any]]] = {}
    extra_sources: list[dict[str, Any]] = []
    selected_nodes: list[ast.stmt] = []

    for node in tree.body:
        if isinstance(node, ast.Assign):
            names = {
                target.id
                for target in node.targets
                if isinstance(target, ast.Name)
            }
            if "quellen" in names and not base_sources:
                # The first assignment is the literal source catalogue. Later
                # assignments may deliberately transform it (for example,
                # rotating source buckets for scheduled aggregation runs) and
                # therefore are not safe for ``ast.literal_eval``.
                try:
                    candidate = ast.literal_eval(node.value)
                except (TypeError, ValueError):
                    candidate = None
                if isinstance(candidate, dict):
                    base_sources = candidate
            if any(name.startswith("_wrn_extra_sources_") for name in names):
                try:
                    value = ast.literal_eval(node.value)
                except Exception:
                    value = []
                if isinstance(value, list):
                    extra_sources.extend(
                        item for item in value
                        if isinstance(item, dict) and item.get("name")
                    )
            if names & {
                "REGION_CATEGORIES",
                "COUNTRY_PRIMARY_REGIONS",
                "TOPIC_CATEGORY_PATTERNS",
                "TOPIC_CATEGORY_STRONG_PATTERNS",
                "TOPIC_CATEGORY_MIN_SCORES",
                "TOPIC_DEFAULT_MIN_SCORE",
                "TOPIC_MAX_ASSIGNMENTS",
                "TOPIC_SOURCE_FALLBACKS",
            }:
                selected_nodes.append(node)
        elif isinstance(node, ast.FunctionDef) and node.name in {
            "safe_text",
            "score_article_topics",
            "classify_article",
            "infer_article_categories",
        }:
            selected_nodes.append(node)

    if not base_sources:
        raise RuntimeError("Keine literale Basisdefinition für 'quellen' gefunden.")

    namespace: dict[str, Any] = {"re": re}
    exec(
        compile(
            ast.Module(body=selected_nodes, type_ignores=[]),
            str(AGGREGATE),
            "exec",
        ),
        namespace,
    )
    return (
        base_sources,
        extra_sources,
        namespace["classify_article"],
        namespace["REGION_CATEGORIES"],
        namespace["TOPIC_CATEGORY_PATTERNS"],
    )


def configured_sources(
    base: dict[str, list[dict[str, Any]]],
    extras: list[dict[str, Any]],
) -> dict[str, list[tuple[str, dict[str, Any]]]]:
    result: dict[str, list[tuple[str, dict[str, Any]]]] = {}
    for bucket, rows in base.items():
        for source in rows:
            result.setdefault(str(source.get("name", "")).casefold(), []).append(
                (bucket, source)
            )
    for source in extras:
        categories = source.get("categories") or ["Global"]
        bucket = str(categories[0])
        result.setdefault(str(source.get("name", "")).casefold(), []).append(
            (bucket, source)
        )
    return result


def main() -> int:
    base, extras, classify, regions, topics = definitions()
    if SOURCE_CATALOG.is_file():
        catalog = json.loads(SOURCE_CATALOG.read_text(encoding="utf-8"))
        catalog_rows = catalog.get("sources", []) if isinstance(catalog, dict) else []
        extras.extend(
            row for row in catalog_rows
            if isinstance(row, dict) and row.get("name")
        )
    sources = configured_sources(base, extras)
    rows = json.loads(NEWS.read_text(encoding="utf-8"))
    if not isinstance(rows, list):
        raise SystemExit("news.json muss eine Liste sein.")

    missing_sources: Counter[str] = Counter()
    source_assignments: dict[str, dict[str, Any]] = {}
    without_region = 0
    without_topic = 0
    review_rows: list[dict[str, Any]] = []

    for article in rows:
        source_name = str(article.get("quelleName") or "").strip()
        candidates = sources.get(source_name.casefold(), [])
        preferred = None
        current_primary = str(article.get("kontinent") or "")
        for candidate in candidates:
            if candidate[0] == current_primary:
                preferred = candidate
                break
        if preferred is None and candidates:
            preferred = candidates[0]

        if preferred:
            primary, source = preferred
            configured = source.get("categories") or [primary]
        else:
            missing_sources[source_name or "Unbekannt"] += 1
            existing = article.get("categories") or []
            existing = existing if isinstance(existing, list) else [existing]
            configured = [
                category for category in existing
                if category in regions
            ]
            if current_primary in regions and current_primary not in configured:
                configured.insert(0, current_primary)
            primary = configured[0] if configured else "Global"

        classification = classify(
            article.get("title", ""),
            article.get("content", ""),
            configured,
            primary,
            article.get("sourceTags", []),
            article.get("originCountryCode", ""),
        )
        article.update({
            "categories": classification["categories"],
            "primaryRegion": classification["primaryRegion"],
            "primaryTopic": classification["primaryTopic"],
            "secondaryTopics": classification["secondaryTopics"],
            "classificationConfidence": classification["classificationConfidence"],
            "classificationMethod": classification["classificationMethod"],
            "editorialReview": classification["editorialReview"],
            "editorialReviewReasons": classification["editorialReviewReasons"],
        })

        article_regions = [
            category for category in article["categories"]
            if category in regions
        ]
        article_topics = [
            category for category in article["categories"]
            if category in topics
        ]
        without_region += int(not article_regions)
        without_topic += int(not article_topics)
        summary = source_assignments.setdefault(source_name or "Unbekannt", {
            "articles": 0,
            "regions": set(),
            "topics": set(),
        })
        summary["articles"] += 1
        summary["regions"].update(article_regions)
        summary["topics"].update(article_topics)
        if article["editorialReview"]:
            review_rows.append({
                "link": article.get("link", ""),
                "title": article.get("title", ""),
                "source": source_name,
                "primaryRegion": article["primaryRegion"],
                "primaryTopic": article["primaryTopic"],
                "confidence": article["classificationConfidence"],
                "reasons": article["editorialReviewReasons"],
                "suggestedTopics": list(classification.get("topicScores", {}))[:5],
            })

    NEWS.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    report = {
        "schemaVersion": 1,
        "articleCount": len(rows),
        "configuredSourceCount": len(sources),
        "articlesWithoutRegion": without_region,
        "articlesWithoutTopic": without_topic,
        "unmatchedStoredSources": dict(missing_sources.most_common()),
        "sources": {
            name: {
                "articles": value["articles"],
                "regions": sorted(value["regions"]),
                "topics": sorted(value["topics"]),
            }
            for name, value in sorted(source_assignments.items())
        },
    }
    REPORT.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    REVIEW_QUEUE.write_text(
        json.dumps({
            "schemaVersion": 1,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "count": len(review_rows),
            "items": sorted(
                review_rows,
                key=lambda row: (row["confidence"], row["source"], row["title"]),
            ),
        }, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"{len(rows)} Artikel klassifiziert; "
        f"ohne Region: {without_region}; ohne Thema: {without_topic}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
