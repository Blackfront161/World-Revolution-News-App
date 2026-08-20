#!/usr/bin/env python3
"""Validate WRN 1.7.22 CSP, audits, syntax contracts and workflow safety."""

from __future__ import annotations

from datetime import datetime
import argparse
import json
from pathlib import Path
import re
from typing import Any


ROOT = Path(__file__).resolve().parent
WORKFLOW_REPORT = ROOT / "workflow-audit.json"

TRANSLATION_CACHE = (
    "https://wrn-translation-cache.paghklo.workers.dev"
)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def valid_timestamp(value: Any) -> bool:
    if not isinstance(value, str) or not value.strip():
        return False

    try:
        datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
        return True
    except ValueError:
        return False


def audit_workflows(output_path: Path | None = WORKFLOW_REPORT) -> dict[str, Any]:
    directory = ROOT / ".github" / "workflows"
    rows = []

    if directory.is_dir():
        paths = sorted(
            list(directory.glob("*.yml"))
            + list(directory.glob("*.yaml"))
        )

        for path in paths:
            text = path.read_text(
                encoding="utf-8",
                errors="replace",
            )
            writer = (
                "contents: write" in text
                or "git push" in text
                or "wrn-safe-push.sh" in text
            )

            row = {
                "path": str(path.relative_to(ROOT)),
                "writer": writer,
                "commonConcurrency": (
                    "group: wrn-main-write" in text
                    if writer
                    else None
                ),
                "safePush": (
                    (
                        "wrn-safe-push.sh" in text
                        or "Push-Versuch" in text
                    )
                    if writer
                    else None
                ),
                "modifiesWorkflows": (
                    (
                        "git add -A" in text
                        and ".github/workflows" not in text
                    )
                    or (
                        "git add .github/workflows" in text
                    )
                ),
            }

            warnings = []

            if writer and not row["commonConcurrency"]:
                warnings.append(
                    "missing_wrn_main_write"
                )

            if writer and not row["safePush"]:
                warnings.append("missing_safe_push")

            if row["modifiesWorkflows"]:
                warnings.append(
                    "possible_workflow_self_modification"
                )

            row["warnings"] = warnings
            rows.append(row)

    report = {
        "schemaVersion": 1,
        "generatedAt": datetime.now().astimezone().isoformat(),
        "workflowCount": len(rows),
        "warningCount": sum(
            len(row["warnings"])
            for row in rows
        ),
        "workflows": rows,
    }

    if output_path is not None:
        output_path = output_path.resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(
                report,
                ensure_ascii=False,
                indent=2,
            ) + "\n",
            encoding="utf-8",
        )

    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--strict-workflows",
        action="store_true",
    )
    output_group = parser.add_mutually_exclusive_group()
    output_group.add_argument(
        "--no-write",
        action="store_true",
        help="Prüft Workflows vollständig, ohne workflow-audit.json oder andere Berichte zu schreiben.",
    )
    output_group.add_argument(
        "--workflow-report",
        type=Path,
        help="Schreibt den Workflow-Bericht ausdrücklich an diesen Pfad (zum Beispiel RUNNER_TEMP).",
    )
    args = parser.parse_args(argv)

    errors: list[str] = []
    warnings: list[str] = []

    for filename in (
        "feature-audit.json",
        "language-source-audit.json",
        "sources-registry.json",
        "csp-audit.json",
    ):
        path = ROOT / filename

        if not path.is_file():
            errors.append(f"{filename} fehlt.")
            continue

        try:
            data = load_json(path)
        except Exception as error:
            errors.append(
                f"{filename} ist ungültig: {error}"
            )
            continue

        if not valid_timestamp(data.get("generatedAt")):
            errors.append(
                f"{filename}: generatedAt ungültig."
            )

    feature_path = ROOT / "feature-audit.json"

    if feature_path.is_file():
        feature = load_json(feature_path)

        if int(
            feature.get("summary", {}).get(
                "groups",
                0,
            )
        ) <= 0:
            errors.append(
                "feature-audit.json enthält keine Gruppen."
            )

        if not feature.get("groups"):
            errors.append(
                "feature-audit.json: groups ist leer."
            )

    language_path = ROOT / "language-source-audit.json"

    if language_path.is_file():
        language = load_json(language_path)

        if int(language.get("activeSourceRows", 0)) <= 0:
            errors.append(
                "language-source-audit.json enthält "
                "keine aktiven Quellen."
            )

        if int(language.get("knownLanguageRows", 0)) <= 0:
            errors.append(
                "language-source-audit.json enthält "
                "nur unbekannte Sprachen."
            )

    registry_path = ROOT / "sources-registry.json"

    if registry_path.is_file():
        registry = load_json(registry_path)

        if int(registry.get("activeSourceCount", 0)) <= 0:
            errors.append(
                "sources-registry.json enthält "
                "keine aktiven Quellen."
            )

        if not registry.get("sources"):
            errors.append(
                "sources-registry.json: sources ist leer."
            )

    csp_path = ROOT / "csp-audit.json"

    if csp_path.is_file():
        csp = load_json(csp_path)

        if csp.get("status") != "ok":
            errors.append(
                "csp-audit.json meldet keinen OK-Status."
            )

        if TRANSLATION_CACHE not in csp.get(
            "requiredConnectEndpoints",
            [],
        ):
            errors.append(
                "Übersetzungs-Cache fehlt im CSP-Audit."
            )

    worker_path = ROOT / "service-worker.js"

    if worker_path.is_file():
        worker = worker_path.read_text(
            encoding="utf-8",
            errors="replace",
        )

        if ".filter(name => !keep.has(name))" in worker:
            errors.append(
                "Service Worker enthält breite Cache-Löschung."
            )

        if "APP_CACHE_PREFIX" not in worker or "DATA_CACHE_PREFIX" not in worker:
            errors.append(
                "Service Worker enthält keine präzisen App-/Daten-Cache-Präfixe."
            )

    workflow_output = None if args.no_write else (args.workflow_report or WORKFLOW_REPORT)
    workflow_report = audit_workflows(workflow_output)

    if workflow_report["warningCount"]:
        warnings.append(
            f"{workflow_report['warningCount']} "
            "Workflow-Warnungen; Details im "
            + (str(workflow_output) if workflow_output else "read-only Prüfergebnis")
            + "."
        )

        if args.strict_workflows:
            errors.append(
                "Workflow-Audit enthält Warnungen."
            )

    if (ROOT / "index.html").is_file():
        index_text = (ROOT / "index.html").read_text(
            encoding="utf-8",
            errors="replace",
        )

        if TRANSLATION_CACHE not in index_text:
            header_files = (
                ROOT / "_headers",
                ROOT / "headers.txt",
                ROOT / "headers.conf",
            )

            if not any(
                path.is_file()
                and TRANSLATION_CACHE
                in path.read_text(
                    encoding="utf-8",
                    errors="replace",
                )
                for path in header_files
            ):
                errors.append(
                    "Übersetzungs-Cache ist in keiner "
                    "veröffentlichten CSP enthalten."
                )

    for warning in warnings:
        print(f"WARNUNG: {warning}")

    if errors:
        for error in errors:
            print(f"FEHLER: {error}")

        print(
            f"1.7.22-Prüfung fehlgeschlagen: "
            f"{len(errors)} Fehler."
        )
        return 1

    print("WRN 1.7.22-Prüfung: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
