#!/usr/bin/env python3
"""Prüft die vom Audio-Workflow erzeugten JSON-Dateien."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


FILES = {
    "podcasts.json": ("items", "episodes", "podcasts"),
    "podcast-health.json": ("checks", "sources", "items"),
    "audio-health.json": ("podcasts", "radio"),
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def count_entries(data: Any, candidates: tuple[str, ...]) -> int:
    if isinstance(data, list):
        return len(data)

    if not isinstance(data, dict):
        return 0

    for key in candidates:
        value = data.get(key)

        if isinstance(value, list):
            return len(value)

        if isinstance(value, dict):
            checks = value.get("checks")

            if isinstance(checks, list):
                return len(checks)

            return len(value)

    return len(data)


def main() -> int:
    errors: list[str] = []
    report: dict[str, Any] = {}

    for filename, candidates in FILES.items():
        path = Path(filename)

        if not path.is_file():
            errors.append(f"{filename} fehlt.")
            continue

        try:
            data = load(path)
        except Exception as error:
            errors.append(
                f"{filename} enthält ungültiges JSON: {error}"
            )
            continue

        count = count_entries(data, candidates)

        report[filename] = {
            "sizeBytes": path.stat().st_size,
            "entryCount": count,
        }

        if filename == "podcasts.json" and count == 0:
            errors.append(
                "podcasts.json enthält keine Original-Podcast-Episoden."
            )

    Path("audio-output-report.json").write_text(
        json.dumps(
            {"files": report, "errors": errors},
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(report, ensure_ascii=False, indent=2))

    if errors:
        for error in errors:
            print(f"FEHLER: {error}")
        return 1

    print("Audio-Ausgabedateien erfolgreich geprüft.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
