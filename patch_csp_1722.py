#!/usr/bin/env python3
"""Add the WRN shared translation cache to existing CSP connect-src rules.

The script is idempotent. It patches CSP declarations in HTML meta tags
and header-style text files, but does not invent a new restrictive CSP when
the repository has none.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any


ROOT = Path(__file__).resolve().parent
REPORT = ROOT / "csp-audit.json"

REQUIRED_CONNECT_ENDPOINTS = (
    "https://wrn-translation-cache.paghklo.workers.dev",
    "https://revolution-proxy.paghklo.workers.dev",
)

TEXT_CANDIDATES = (
    "index.html",
    "recovery.html",
    "mobile-repair.html",
    "offline.html",
    "_headers",
    "headers.txt",
    "headers.conf",
)

META_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE | re.DOTALL)
CONTENT_RE = re.compile(
    r"(?P<prefix>\bcontent\s*=\s*)"
    r"(?P<quote>[\"'])"
    r"(?P<value>.*?)"
    r"(?P=quote)",
    re.IGNORECASE | re.DOTALL,
)
HEADER_RE = re.compile(
    r"(?P<prefix>Content-Security-Policy\s*:\s*)"
    r"(?P<value>[^\r\n]+)",
    re.IGNORECASE,
)


def patch_policy(policy: str) -> tuple[str, list[str]]:
    directives = [
        item.strip()
        for item in policy.split(";")
        if item.strip()
    ]

    changed: list[str] = []
    connect_index: int | None = None

    for index, directive in enumerate(directives):
        if directive.lower().startswith("connect-src"):
            connect_index = index
            break

    if connect_index is None:
        directives.append(
            "connect-src 'self' "
            + " ".join(REQUIRED_CONNECT_ENDPOINTS)
        )
        changed.extend(REQUIRED_CONNECT_ENDPOINTS)
    else:
        tokens = directives[connect_index].split()

        for endpoint in REQUIRED_CONNECT_ENDPOINTS:
            if endpoint not in tokens:
                tokens.append(endpoint)
                changed.append(endpoint)

        directives[connect_index] = " ".join(tokens)

    return "; ".join(directives) + ";", changed


def patch_html(text: str) -> tuple[str, list[str], int]:
    all_added: list[str] = []
    declarations = 0

    def replace_meta(match: re.Match[str]) -> str:
        nonlocal declarations

        tag = match.group(0)

        if not re.search(
            r"http-equiv\s*=\s*[\"']"
            r"Content-Security-Policy[\"']",
            tag,
            re.IGNORECASE,
        ):
            return tag

        content_match = CONTENT_RE.search(tag)

        if not content_match:
            return tag

        declarations += 1
        new_policy, added = patch_policy(
            content_match.group("value")
        )
        all_added.extend(added)

        replacement = (
            content_match.group("prefix")
            + content_match.group("quote")
            + new_policy
            + content_match.group("quote")
        )

        return (
            tag[: content_match.start()]
            + replacement
            + tag[content_match.end() :]
        )

    return META_RE.sub(replace_meta, text), all_added, declarations


def patch_header_text(
    text: str,
) -> tuple[str, list[str], int]:
    all_added: list[str] = []
    declarations = 0

    def replace_header(match: re.Match[str]) -> str:
        nonlocal declarations

        declarations += 1
        policy, added = patch_policy(match.group("value"))
        all_added.extend(added)
        return match.group("prefix") + policy

    return HEADER_RE.sub(replace_header, text), all_added, declarations


def process_file(
    path: Path,
    *,
    write: bool,
) -> dict[str, Any]:
    original = path.read_text(encoding="utf-8")
    suffix = path.suffix.lower()

    if suffix in {".html", ".htm"}:
        updated, added, declarations = patch_html(original)
    else:
        updated, added, declarations = patch_header_text(
            original
        )

    changed = updated != original

    if changed and write:
        path.write_text(updated, encoding="utf-8")

    return {
        "path": str(path.relative_to(ROOT)),
        "declarations": declarations,
        "changed": changed,
        "addedEndpoints": sorted(set(added)),
        "requiredEndpointPresent": all(
            endpoint in updated
            for endpoint in REQUIRED_CONNECT_ENDPOINTS
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check",
        action="store_true",
        help="Do not modify files; require endpoints already present.",
    )
    args = parser.parse_args()

    results: list[dict[str, Any]] = []

    for filename in TEXT_CANDIDATES:
        path = ROOT / filename

        if path.is_file():
            result = process_file(
                path,
                write=not args.check,
            )

            if result["declarations"]:
                results.append(result)

    declaration_count = sum(
        item["declarations"]
        for item in results
    )

    changed_files = [
        item["path"]
        for item in results
        if item["changed"]
    ]

    complete = bool(results) and all(
        item["requiredEndpointPresent"]
        for item in results
    )

    if args.check and changed_files:
        complete = False

    status = (
        "ok"
        if complete
        else (
            "not_found"
            if declaration_count == 0
            else "incomplete"
        )
    )

    report = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(
            timezone.utc
        ).isoformat(),
        "version": "1.7.22",
        "status": status,
        "checkOnly": args.check,
        "requiredConnectEndpoints": list(
            REQUIRED_CONNECT_ENDPOINTS
        ),
        "declarationCount": declaration_count,
        "changedFiles": changed_files,
        "files": results,
    }

    REPORT.write_text(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(report, ensure_ascii=False, indent=2))

    if declaration_count == 0:
        print(
            "FEHLER: Keine bestehende "
            "Content-Security-Policy gefunden."
        )
        return 1

    if args.check and changed_files:
        print(
            "FEHLER: Die CSP ist noch nicht vollständig "
            "im Repository gespeichert."
        )
        return 1

    return 0 if complete else 1


if __name__ == "__main__":
    raise SystemExit(main())
