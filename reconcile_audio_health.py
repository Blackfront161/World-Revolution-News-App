#!/usr/bin/env python3
"""Reconcile real media checks with legacy podcast/radio health files."""

from __future__ import annotations

import json
from pathlib import Path
import re
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio-health.json"
PODCAST = ROOT / "podcast-health.json"
RADIO = ROOT / "radio-health.json"

ARCHIVED = {
    "commonvoices",
    "badnewsaradionetwork",
    "badnews",
}


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def key(value: Any) -> str:
    return re.sub(
        r"[^a-z0-9]+",
        "",
        str(value or "").lower()
    )


def name_of(item: Any, fallback: str = "") -> str:
    if isinstance(item, dict):
        for field in (
            "name", "sourceName", "source", "podcast",
            "station", "title", "label"
        ):
            if item.get(field):
                return str(item[field])
    return fallback


def status_map(value: str) -> tuple[str, bool]:
    raw = str(value or "").lower()

    if raw == "playable":
        return "ok", True
    if raw == "limited":
        return "warning", False
    if raw == "broken":
        return "error", False
    return "unknown", False


def checks(section: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(section, dict):
        return {}

    rows = section.get("checks", [])
    if not isinstance(rows, list):
        return {}

    result = {}

    for item in rows:
        if not isinstance(item, dict):
            continue

        name = name_of(item)
        if name:
            result[key(name)] = item

    return result


def update_item(
    item: dict[str, Any],
    verified: dict[str, dict[str, Any]],
    fallback_name: str = "",
) -> dict[str, Any] | None:
    name = name_of(item, fallback_name)
    normalized = key(name)

    if normalized in ARCHIVED:
        return None

    check = verified.get(normalized)
    if not check:
        return item

    status, ok = status_map(check.get("status", ""))

    item["status"] = status
    item["ok"] = ok
    item["lastChecked"] = check.get(
        "checkedAt",
        check.get("generatedAt", item.get("lastChecked", ""))
    )
    item["audioStatus"] = check.get("status", "")
    item["audioDetail"] = check.get(
        "detail",
        check.get("warning", check.get("error", ""))
    )
    if (
        check.get("status") == "playable"
        and check.get("url")
        and "workingStream" in item
    ):
        item["workingStream"] = check["url"]

    return item


def reconcile(data: Any, verified: dict[str, dict[str, Any]]) -> Any:
    if isinstance(data, list):
        output = []

        for item in data:
            if not isinstance(item, dict):
                output.append(item)
                continue

            updated = update_item(item, verified)
            if updated is not None:
                output.append(updated)

        return output

    if not isinstance(data, dict):
        return data

    for container in ("sources", "checks", "items", "results", "entries"):
        if isinstance(data.get(container), list):
            data[container] = reconcile(data[container], verified)
            return data

    output = {}

    for name, item in data.items():
        if not isinstance(item, dict):
            output[name] = item
            continue

        updated = update_item(item, verified, name)

        if updated is not None:
            output[name] = updated

    return output


def write(path: Path, data: Any) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )


def main() -> int:
    audio = read_json(AUDIO, {})
    podcast_checks = checks(audio.get("podcasts", {}))
    radio_checks = checks(audio.get("radio", {}))

    if PODCAST.exists():
        write(
            PODCAST,
            reconcile(read_json(PODCAST, {}), podcast_checks)
        )

    if RADIO.exists():
        write(
            RADIO,
            reconcile(read_json(RADIO, {}), radio_checks)
        )

    print(
        f"Audio-Abgleich: {len(podcast_checks)} Podcasts, "
        f"{len(radio_checks)} Radios."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
