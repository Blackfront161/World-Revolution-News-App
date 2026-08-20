#!/usr/bin/env python3
"""Repair known podcast sources without assuming one fixed JSON schema."""

from __future__ import annotations
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any

ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "podcast-sources.json"
RULES = ROOT / "audio-source-overrides.json"
ARCHIVE = ROOT / "podcast-source-archive.json"
DERIVED = ROOT / "derived-podcast-series.json"
REPORT = ROOT / "audio-source-report.json"


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def source_name(item: dict[str, Any], fallback: str = "") -> str:
    for field in ("name", "title", "sourceName", "source", "label", "podcast"):
        if item.get(field):
            return str(item[field])
    return fallback


def matches(name: str, candidates: list[str]) -> bool:
    normalized = key(name)
    return any(normalized == key(candidate) for candidate in candidates)


def set_url(item: dict[str, Any], value: str) -> None:
    for field in ("feedUrl", "feed", "rss", "url"):
        if field in item:
            item[field] = value
            return
    item["feedUrl"] = value


def set_homepage(item: dict[str, Any], value: str) -> None:
    for field in ("homepage", "website", "siteUrl"):
        if field in item:
            item[field] = value
            return
    item["homepage"] = value


def process_rows(
    rows: list[Any],
    rules: dict[str, Any]
) -> tuple[list[Any], list[dict[str, Any]], list[str]]:
    active: list[Any] = []
    archived: list[dict[str, Any]] = []
    changes: list[str] = []

    for row in rows:
        if not isinstance(row, dict):
            active.append(row)
            continue

        name = source_name(row)

        archive_rule = next(
            (
                rule for rule in rules.get("archive", [])
                if matches(name, rule.get("matchNames", []))
            ),
            None,
        )
        if archive_rule:
            archived.append({
                "name": name,
                "reason": archive_rule.get("reason", ""),
                "source": row,
            })
            changes.append(f"archived:{name}")
            continue

        replacement = next(
            (
                rule for rule in rules.get("replacements", [])
                if matches(name, rule.get("matchNames", []))
            ),
            None,
        )
        if replacement:
            set_url(row, replacement["feedUrl"])
            set_homepage(row, replacement.get("homepage", ""))
            row["repairNote"] = replacement.get("reason", "")
            changes.append(f"repaired:{name}")

        active.append(row)

    return active, archived, changes


def main() -> int:
    if not SOURCES.exists():
        raise SystemExit("podcast-sources.json fehlt.")

    data = read_json(SOURCES, [])
    rules = read_json(RULES, {})

    archived: list[dict[str, Any]] = []
    changes: list[str] = []

    if isinstance(data, list):
        data, archived, changes = process_rows(data, rules)
    elif isinstance(data, dict):
        container = next(
            (
                name for name in ("sources", "podcasts", "items", "entries")
                if isinstance(data.get(name), list)
            ),
            None,
        )
        if container:
            data[container], archived, changes = process_rows(
                data[container],
                rules,
            )
        else:
            rebuilt: dict[str, Any] = {}
            for name, value in data.items():
                if not isinstance(value, dict):
                    rebuilt[name] = value
                    continue

                fake = {"name": source_name(value, name), **value}
                active, removed, changed = process_rows([fake], rules)
                archived.extend(removed)
                changes.extend(changed)

                if active:
                    item = active[0]
                    item.pop("name", None) if "name" not in value else None
                    rebuilt[name] = item
            data = rebuilt
    else:
        raise SystemExit("Unbekanntes Format in podcast-sources.json.")

    old_archive = read_json(ARCHIVE, [])
    if not isinstance(old_archive, list):
        old_archive = []

    archive_map = {
        key(item.get("name")): item
        for item in old_archive
        if isinstance(item, dict)
    }
    for item in archived:
        archive_map[key(item.get("name"))] = item

    SOURCES.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    ARCHIVE.write_text(
        json.dumps(
            sorted(
                archive_map.values(),
                key=lambda item: str(item.get("name", "")).lower(),
            ),
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    DERIVED.write_text(
        json.dumps(
            rules.get("derivedSeries", []),
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "changes": changes,
        "activeArchiveEntries": len(archive_map),
    }
    REPORT.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
