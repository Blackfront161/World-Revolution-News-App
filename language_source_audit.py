#!/usr/bin/env python3
"""Generate language coverage from sources-registry.json."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any

from build_sources_registry import build_registry


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "language-source-audit.json"
REQUIRED_SOURCE_LANGUAGES = ("tr", "ku")


def offered_languages() -> list[str]:
    path = ROOT / "index.html"

    if not path.is_file():
        return []

    text = path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    languages = re.findall(
        r"<option\b[^>]*\bvalue=[\"']"
        r"([a-zA-Z]{2,3}(?:[-_][a-zA-Z]{2,4})?)"
        r"[\"']",
        text,
        flags=re.IGNORECASE,
    )

    result: list[str] = []
    supported = {"de", "en", "es", "fr", "it", "pt", "ru", "el", "tr"}

    for language in languages:
        normalized = re.split(
            r"[-_]",
            language.lower(),
        )[0]

        if normalized in supported and normalized not in result:
            result.append(normalized)

    return result


def supported_interface_languages() -> list[str]:
    path = ROOT / "wrn-i18n.js"

    if not path.is_file():
        return []

    text = path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    match = re.search(
        r"SUPPORTED_LANGUAGES\s*=\s*"
        r"Object\.freeze\(\[([^\]]+)\]\)",
        text,
    )

    if not match:
        return []

    result: list[str] = []

    for language in re.findall(
        r'''["']([a-zA-Z]{2,3})["']''',
        match.group(1),
    ):
        normalized = language.lower()

        if normalized not in result:
            result.append(normalized)

    return result


def main() -> int:
    registry = build_registry()

    active = [
        item
        for item in registry.get("sources", [])
        if item.get("active", True)
    ]

    counts: Counter[str] = Counter()
    explicit_counts: Counter[str] = Counter()
    inferred_counts: Counter[str] = Counter()

    for source in active:
        languages = source.get("languages") or ["und"]

        for language in languages:
            normalized = str(language or "und").lower()
            counts[normalized] += 1

            if source.get("languageSource") == "explicit":
                explicit_counts[normalized] += 1
            elif source.get("languageSource") == "inferred":
                inferred_counts[normalized] += 1

    offered = offered_languages()
    supported_interface = supported_interface_languages()

    missing_interface = [
        language
        for language in offered
        if language not in supported_interface
    ]

    missing_source_coverage = [
        language
        for language in offered
        if counts.get(language, 0) == 0
    ]

    missing_required_source_languages = [
        language
        for language in REQUIRED_SOURCE_LANGUAGES
        if counts.get(language, 0) == 0
    ]

    known_rows = sum(
        count
        for language, count in counts.items()
        if language != "und"
    )

    payload: dict[str, Any] = {
        "schemaVersion": 3,
        "generatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
        "version": "1.8.2",
        "activeSourceRows": len(active),
        "knownLanguageRows": known_rows,
        "unknownLanguageRows": counts.get("und", 0),
        "activeLanguages": dict(
            sorted(counts.items())
        ),
        "explicitLanguages": dict(
            sorted(explicit_counts.items())
        ),
        "inferredLanguages": dict(
            sorted(inferred_counts.items())
        ),
        "offeredInterfaceLanguages": offered,
        "supportedInterfaceLanguages": supported_interface,
        "missingInterfaceLanguages": missing_interface,
        "missingSourceCoverageLanguages":
            missing_source_coverage,
        "requiredSourceLanguages":
            list(REQUIRED_SOURCE_LANGUAGES),
        "missingRequiredSourceLanguages":
            missing_required_source_languages,
        # Backward-compatible field: an offered interface language is
        # missing only when the UI does not support it. Source-language
        # coverage is reported separately.
        "missingOfferedLanguages": missing_interface,
        "sourceRegistryGeneratedAt":
            registry.get("generatedAt", ""),
        "sourceCount":
            registry.get("sourceCount", 0),
    }

    OUTPUT.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(payload, ensure_ascii=False, indent=2))

    if payload["activeSourceRows"] == 0:
        print("FEHLER: Keine aktiven Quellenzeilen.")
        return 1

    if payload["knownLanguageRows"] == 0:
        print(
            "FEHLER: Alle Quellen haben weiterhin "
            "die Sprache und."
        )
        return 1

    if payload["missingInterfaceLanguages"]:
        print(
            "FEHLER: Nicht unterstützte angebotene "
            "Oberflächensprachen: "
            + ", ".join(
                payload["missingInterfaceLanguages"]
            )
        )
        return 1

    if payload["missingSourceCoverageLanguages"]:
        print(
            "HINWEIS: Für diese Oberflächensprachen "
            "gibt es derzeit keine explizite Quellenabdeckung: "
            + ", ".join(
                payload["missingSourceCoverageLanguages"]
            )
        )

    if payload["missingRequiredSourceLanguages"]:
        print(
            "FEHLER: Erforderliche Quellenabdeckung fehlt: "
            + ", ".join(
                payload["missingRequiredSourceLanguages"]
            )
        )
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
