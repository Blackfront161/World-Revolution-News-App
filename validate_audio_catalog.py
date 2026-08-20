#!/usr/bin/env python3
"""Structural validation and GitHub Actions summary for WRN audio data."""
from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load(name, expected):
    path = ROOT / name
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, expected):
        raise ValueError(f"{name}: falscher JSON-Typ")
    return data


def duplicate_values(items, key):
    seen = set()
    duplicates = set()
    for item in items:
        value = item.get(key)
        if not value:
            continue
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    return sorted(duplicates)


def main() -> int:
    podcast_sources = load("podcast-sources.json", list)
    radio_sources = load("radio-sources.json", list)
    podcasts = load("podcasts.json", list)
    podcast_health = load("podcast-health.json", dict)
    stations = load("radio-stations.json", list)
    radio_health = load("radio-health.json", dict)

    errors = []
    warnings = []

    for label, rows in (
        ("Podcastquellen", podcast_sources),
        ("Radioquellen", radio_sources),
        ("Podcasts", podcasts),
        ("Radios", stations),
    ):
        duplicates = duplicate_values(rows, "id")
        if duplicates:
            errors.append(f"{label}: doppelte IDs: {', '.join(duplicates)}")

    podcast_source_ids = {item.get("id") for item in podcast_sources if item.get("id")}
    radio_source_ids = {item.get("id") for item in radio_sources if item.get("id")}

    unknown_podcast_health = sorted(set(podcast_health) - podcast_source_ids)
    unknown_radio_health = sorted(set(radio_health) - radio_source_ids)
    if unknown_podcast_health:
        warnings.append(f"Podcast-Status ohne Quelle: {', '.join(unknown_podcast_health)}")
    if unknown_radio_health:
        warnings.append(f"Radio-Status ohne Quelle: {', '.join(unknown_radio_health)}")

    bad_podcasts = [
        item.get("title", item.get("id", "?"))
        for item in podcasts
        if not item.get("audioUrl") or not item.get("episodeUrl")
    ]
    if bad_podcasts:
        errors.append(f"Podcastfolgen ohne Audio-/Original-URL: {len(bad_podcasts)}")

    statuses = {}
    for row in radio_health.values():
        status = row.get("status", "unknown")
        statuses[status] = statuses.get(status, 0) + 1

    podcast_statuses = {}
    for row in podcast_health.values():
        status = row.get("status", "unknown")
        podcast_statuses[status] = podcast_statuses.get(status, 0) + 1

    summary = [
        "# WRN Audio-Katalog",
        "",
        f"- Podcastquellen: **{len(podcast_sources)}**",
        f"- Podcastfolgen: **{len(podcasts)}**",
        f"- Radioquellen: **{len(radio_sources)}**",
        f"- Radios: **{len(stations)}**",
        f"- Podcaststatus: `{podcast_statuses}`",
        f"- Radiostatus: `{statuses}`",
    ]
    if warnings:
        summary += ["", "## Hinweise"] + [f"- {item}" for item in warnings]
    if errors:
        summary += ["", "## Strukturfehler"] + [f"- {item}" for item in errors]

    output = "\n".join(summary) + "\n"
    print(output)
    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        Path(step_summary).write_text(output, encoding="utf-8")

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
