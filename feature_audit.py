#!/usr/bin/env python3
"""Generate a non-empty feature audit from the actual repository tree."""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "feature-audit.json"

GROUPS: dict[str, dict[str, list[str]]] = {
    "core": {
        "critical": [
            "index.html",
            "app.js",
            "config.js",
            "service-worker.js",
            "manifest.json",
        ],
        "optional": [
            "styles.css",
            "app-background.css",
            "app-background.webp",
            "wrn-header.js",
            "wrn-header.css",
        ],
    },
    "navigation_and_reading": {
        "critical": [],
        "optional": [
            "release-1.5-nav.js",
            "release-1.5-nav.css",
            "reading-state.js",
            "accessibility.js",
            "typography.js",
            "typography.css",
        ],
    },
    "privacy_and_storage": {
        "critical": [
            "wrn-origin-safety.js",
        ],
        "optional": [
            "offline-db.js",
            "data-control.js",
            "status-center.js",
            "recovery.html",
            "mobile-repair.html",
        ],
    },
    "news_and_sources": {
        "critical": [
            "aggregate.py",
            "check_news_sources.py",
        ],
        "optional": [
            "build_source_catalog.py",
            "source-verification.js",
            "source-verification.css",
            "multilingual-source-registry.json",
            "build_sources_registry.py",
            "source-filters.js",
        ],
    },
    "briefing_and_summaries": {
        "critical": [
            "briefing.js",
            "briefing.css",
            "briefing-loader.js",
            "briefing-2.js",
            "briefing-2.css",
        ],
        "optional": [
            "briefing-loader.css",
            "article-summary-core.js",
            "article-summary.js",
            "article-summary.css",
        ],
    },
    "developments_and_timelines": {
        "critical": [
            "stories-core.js",
            "stories-timeline.js",
            "stories-timeline.css",
        ],
        "optional": [
            "tests/test_stories_core.js",
        ],
    },
    "audio": {
        "critical": [],
        "optional": [
            "aggregate_podcasts.py",
            "check_audio_sources.py",
            "audio-region-core.js",
            "audio-tab.js",
            "audio-tab.css",
            "audio-reliability.js",
            "audio-reliability.css",
            "radio-stations.json",
            "podcasts.json",
        ],
    },
    "video_hub": {
        "critical": [
            "video-hub.js",
            "video-hub.css",
        ],
        "optional": [],
    },
    "translation": {
        "critical": [],
        "optional": [
            "shared-translation-client.js",
            "shared-translation-status.js",
            "shared-translation-status.css",
            "translation-dialog-l10n.js",
            "wrn-i18n.js",
        ],
    },
    "zine_and_flyers": {
        "critical": [],
        "optional": [
            "zine-designer.js",
            "zine-designer.css",
        ],
    },
    "diagnostics_and_ci": {
        "critical": [
            "feature_audit.py",
            "language_source_audit.py",
            "validate_release_1722.py",
        ],
        "optional": [
            "runtime-selftest.js",
            "runtime-selftest.css",
            "origin-safety-report.json",
            "csp-audit.json",
            "sources-registry.json",
        ],
    },
}


def file_record(
    filename: str,
    *,
    critical: bool,
    config_text: str,
    worker_text: str,
) -> dict[str, Any]:
    path = ROOT / filename
    present = path.is_file()

    return {
        "file": filename,
        "critical": critical,
        "present": present,
        "sizeBytes": path.stat().st_size if present else 0,
        "loadedByConfig": (
            filename in config_text
            if present
            else False
        ),
        "cachedByServiceWorker": (
            filename in worker_text
            if present
            else False
        ),
    }


def main() -> int:
    config_text = (
        (ROOT / "config.js").read_text(
            encoding="utf-8",
            errors="replace",
        )
        if (ROOT / "config.js").is_file()
        else ""
    )

    worker_text = (
        (ROOT / "service-worker.js").read_text(
            encoding="utf-8",
            errors="replace",
        )
        if (ROOT / "service-worker.js").is_file()
        else ""
    )

    groups: dict[str, Any] = {}
    critical_missing: list[str] = []
    optional_missing: list[str] = []

    for group_name, definitions in GROUPS.items():
        records: list[dict[str, Any]] = []

        for critical, filenames in (
            (True, definitions["critical"]),
            (False, definitions["optional"]),
        ):
            for filename in filenames:
                record = file_record(
                    filename,
                    critical=critical,
                    config_text=config_text,
                    worker_text=worker_text,
                )
                records.append(record)

                if not record["present"]:
                    if critical:
                        critical_missing.append(filename)
                    else:
                        optional_missing.append(filename)

        groups[group_name] = {
            "total": len(records),
            "present": sum(
                item["present"]
                for item in records
            ),
            "missing": sum(
                not item["present"]
                for item in records
            ),
            "files": records,
        }

    payload = {
        "schemaVersion": 2,
        "generatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
        "version": "1.8.2",
        "summary": {
            "groups": len(groups),
            "groupNames": list(groups),
            "criticalMissing": len(critical_missing),
            "optionalMissing": len(optional_missing),
            "criticalMissingFiles": critical_missing,
            "optionalMissingFiles": optional_missing,
        },
        "groups": groups,
    }

    OUTPUT.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            payload["summary"],
            ensure_ascii=False,
            indent=2,
        )
    )

    if not groups:
        print("FEHLER: Keine Auditgruppen erzeugt.")
        return 1

    if critical_missing:
        print("FEHLER: Kritische Dateien fehlen:")
        for filename in critical_missing:
            print(f"- {filename}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
