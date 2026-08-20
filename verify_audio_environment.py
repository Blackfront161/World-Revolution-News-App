#!/usr/bin/env python3
"""Vorprüfung der Python-Umgebung für den WRN-Audio-Workflow."""

from __future__ import annotations

import importlib
import json
from pathlib import Path
import py_compile
import subprocess
import sys


REQUIRED_MODULES = {
    "bs4": "beautifulsoup4",
    "cloudscraper": "cloudscraper",
    "feedparser": "feedparser",
    "lxml": "lxml",
    "dateutil": "python-dateutil",
    "requests": "requests",
}

REQUIRED_FILES = [
    "aggregate_podcasts.py",
    "apply_audio_source_repairs.py",
    "check_audio_sources.py",
    "check_news_sources.py",
    "normalize_source_health.py",
    "feature_audit.py",
    "reconcile_audio_health.py",
    "merge_multilingual_sources.py",
    "language_source_audit.py",
]


def main() -> int:
    missing_modules: list[str] = []
    versions: dict[str, str] = {}

    for module_name, package_name in REQUIRED_MODULES.items():
        try:
            module = importlib.import_module(module_name)
            versions[package_name] = str(
                getattr(module, "__version__", "installiert")
            )
        except Exception as error:
            missing_modules.append(
                f"{package_name} ({module_name}): {error}"
            )

    missing_files = [
        path for path in REQUIRED_FILES
        if not Path(path).is_file()
    ]

    syntax_errors: list[str] = []

    for path in REQUIRED_FILES:
        if not Path(path).is_file():
            continue

        try:
            py_compile.compile(path, doraise=True)
        except Exception as error:
            syntax_errors.append(f"{path}: {error}")

    pip_check = subprocess.run(
        [sys.executable, "-m", "pip", "check"],
        capture_output=True,
        text=True,
        check=False,
    )

    report = {
        "python": sys.version,
        "versions": versions,
        "missingModules": missing_modules,
        "missingFiles": missing_files,
        "syntaxErrors": syntax_errors,
        "pipCheckReturnCode": pip_check.returncode,
        "pipCheckOutput": (
            pip_check.stdout.strip()
            or pip_check.stderr.strip()
            or "Keine Konflikte gefunden."
        ),
    }

    Path("audio-environment-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(report, ensure_ascii=False, indent=2))

    return 1 if (
        missing_modules
        or missing_files
        or syntax_errors
        or pip_check.returncode != 0
    ) else 0


if __name__ == "__main__":
    raise SystemExit(main())
