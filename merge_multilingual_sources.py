#!/usr/bin/env python3
"""Safely merge approved multilingual sources without deleting existing ones."""

from __future__ import annotations

import ast
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
REGISTRY = ROOT / "multilingual-source-registry.json"
AGGREGATE = ROOT / "aggregate.py"
PODCAST_SOURCES = ROOT / "podcast-sources.json"
RADIO_SOURCES = ROOT / "radio-sources.json"

START = "# WRN MULTILINGUAL SOURCES 1.8.2 START"
END = "# WRN MULTILINGUAL SOURCES 1.8.2 END"
LEGACY_BLOCKS = (
    (
        "# WRN MULTILINGUAL SOURCES 1.7.19 START",
        "# WRN MULTILINGUAL SOURCES 1.7.19 END",
    ),
)


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def find_source_mapping(source: str) -> tuple[str, int]:
    tree = ast.parse(source)
    candidates = []

    for node in tree.body:
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue

        names = []

        if isinstance(node, ast.Assign):
            names = [
                target.id
                for target in node.targets
                if isinstance(target, ast.Name)
            ]
            value = node.value
        else:
            names = [node.target.id] if isinstance(node.target, ast.Name) else []
            value = node.value

        try:
            literal = ast.literal_eval(value)
        except Exception:
            continue

        if (
            isinstance(literal, dict)
            and any(isinstance(item, list) for item in literal.values())
        ):
            for name in names:
                candidates.append((
                    name,
                    int(getattr(node, "end_lineno", node.lineno)),
                    len(literal)
                ))

    if not candidates:
        raise RuntimeError("Keine Quellen-Tabelle in aggregate.py gefunden.")

    candidates.sort(key=lambda item: item[2], reverse=True)
    name, line, _ = candidates[0]
    return name, line


def remove_marked_block(source: str, start: str, end: str) -> str:
    while start in source:
        if end not in source:
            raise RuntimeError(f"Unvollständiger Quellenblock: {start}")

        before = source.index(start)
        after = source.index(end, before) + len(end)
        source = source[:before].rstrip() + "\n" + source[after:].lstrip()

    return source


def patch_aggregate(registry: dict[str, Any]) -> bool:
    """Write one additive, idempotent source block; never replace quellen."""

    if not AGGREGATE.exists():
        raise FileNotFoundError("aggregate.py fehlt.")

    original = AGGREGATE.read_text(encoding="utf-8")
    source = remove_marked_block(original, START, END)

    for legacy_start, legacy_end in LEGACY_BLOCKS:
        source = remove_marked_block(source, legacy_start, legacy_end)

    variable, end_line = find_source_mapping(source)

    approved = [
        item for item in registry.get("sources", [])
        if item.get("kind") == "news"
        and item.get("status") == "approved"
        and item.get("adapter") == "rss"
        and item.get("name") != "Democracy Now!"
    ]

    block = [
        START,
        "# Additive and idempotent: the existing source dictionary is never replaced.",
        f"_wrn_extra_sources_182 = {approved!r}",
        "for _wrn_source in _wrn_extra_sources_182:",
        "    _wrn_name = str(_wrn_source.get('name', '')).casefold()",
        "    _wrn_url = str(_wrn_source.get('feedUrl', '')).rstrip('/').casefold()",
        "    _wrn_existing = None",
        f"    for _wrn_existing_bucket in {variable}.values():",
        "        if not isinstance(_wrn_existing_bucket, list):",
        "            continue",
        "        for _wrn_item in _wrn_existing_bucket:",
        "            if not isinstance(_wrn_item, dict):",
        "                continue",
        "            _wrn_item_name = str(_wrn_item.get('name', '')).casefold()",
        "            _wrn_item_url = str(",
        "                _wrn_item.get('url')",
        "                or _wrn_item.get('feedUrl')",
        "                or _wrn_item.get('feed')",
        "                or ''",
        "            ).rstrip('/').casefold()",
        "            if _wrn_item_name == _wrn_name or _wrn_item_url == _wrn_url:",
        "                _wrn_existing = _wrn_item",
        "                break",
        "        if _wrn_existing is not None:",
        "            break",
        "    if _wrn_existing is None:",
        "        _wrn_primary_category = _wrn_source.get('categories', ['Global'])[0]",
        "        _wrn_existing = {",
        "            'name': _wrn_source['name'],",
        "            'url': _wrn_source['feedUrl'],",
        "        }",
        f"        {variable}.setdefault(_wrn_primary_category, []).append(_wrn_existing)",
        "    _wrn_existing.setdefault('homepage', _wrn_source.get('homepage', ''))",
        "    _wrn_existing.setdefault('language', _wrn_source.get('languages', ['und'])[0])",
        "    _wrn_existing.setdefault('languages', list(_wrn_source.get('languages', ['und'])))",
        "    _wrn_existing.setdefault('categories', list(_wrn_source.get('categories', ['Global'])))",
        "    _wrn_existing.setdefault('originCountry', _wrn_source.get('originCountry', ''))",
        "    _wrn_existing.setdefault('originCountryCode', _wrn_source.get('originCountryCode', ''))",
        "    _wrn_existing.setdefault('originRegion', _wrn_source.get('originRegion', ''))",
        END,
        "",
    ]

    lines = source.splitlines()
    lines[end_line:end_line] = block
    new_source = "\n".join(lines) + "\n"

    changed = new_source != original
    AGGREGATE.write_text(new_source, encoding="utf-8")
    return changed


def name_of(item: dict[str, Any], fallback: str = "") -> str:
    for field in ("name", "title", "station", "sourceName", "label"):
        if item.get(field):
            return str(item[field])
    return fallback


def merge_json_source(
    path: Path,
    item: dict[str, Any],
    *,
    container_names: tuple[str, ...],
) -> bool:
    data = read_json(path, [])
    wanted = name_of(item).lower()

    if isinstance(data, list):
        if any(
            isinstance(row, dict)
            and name_of(row).lower() == wanted
            for row in data
        ):
            return False
        data.append(item)

    elif isinstance(data, dict):
        container = next(
            (
                name for name in container_names
                if isinstance(data.get(name), list)
            ),
            None
        )

        if container:
            if any(
                isinstance(row, dict)
                and name_of(row).lower() == wanted
                for row in data[container]
            ):
                return False
            data[container].append(item)
        else:
            if any(
                isinstance(value, dict)
                and name_of(value, key).lower() == wanted
                for key, value in data.items()
            ):
                return False
            data[item["name"]] = {
                key: value
                for key, value in item.items()
                if key != "name"
            }
    else:
        data = [item]

    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    return True


def main() -> int:
    registry = read_json(REGISTRY, {})
    changed = []

    if patch_aggregate(registry):
        changed.append("aggregate.py")

    rdl = next(
        item for item in registry.get("sources", [])
        if item.get("name") == "Radio Dreyeckland"
    )

    radio = {
        "name": rdl["name"],
        "streamUrl": rdl["streamUrl"],
        "homepage": rdl["homepage"],
        "language": "de",
        "languages": rdl["languages"],
        "description": (
            "Freies Radio aus Freiburg mit politischen, kulturellen "
            "und mehrsprachigen Sendungen."
        )
    }

    if merge_json_source(
        RADIO_SOURCES,
        radio,
        container_names=("stations", "sources", "items"),
    ):
        changed.append("radio-sources.json")

    podcast = {
        "name": "Radio Dreyeckland",
        "feedUrl": rdl["podcastFeed"],
        "homepage": rdl["homepage"],
        "language": "de",
        "languages": rdl["languages"],
        "contentPolicy": "metadata_and_links_only"
    }

    if merge_json_source(
        PODCAST_SOURCES,
        podcast,
        container_names=("podcasts", "sources", "items"),
    ):
        changed.append("podcast-sources.json")

    print("Geändert:", ", ".join(changed) if changed else "nichts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
