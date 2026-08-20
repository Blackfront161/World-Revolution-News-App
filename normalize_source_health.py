#!/usr/bin/env python3
"""Normalize source-health.json to the schema expected by tests/validate_app.py.

Required top-level format:

{
  "stable-key": {
    "name": "...",
    "url": "...",
    "status": "ok|warning|error|unknown",
    "lastChecked": "ISO timestamp"
  }
}

Rich metadata is preserved separately in source-health-report.json.
"""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlparse, parse_qs, unquote


ROOT = Path(__file__).resolve().parent
HEALTH_PATH = ROOT / "source-health.json"
REPORT_PATH = ROOT / "source-health-report.json"
CATALOG_PATH = ROOT / "source-catalog.json"

METADATA_KEYS = {
    "schemaVersion",
    "generatedAt",
    "summary",
    "sources",
    "items",
    "entries",
    "results",
}


def read_json(path: Path, fallback: Any) -> Any:
    if not path.is_file():
        return fallback

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def as_rows(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    if not isinstance(data, dict):
        return []

    for key in ("sources", "items", "entries", "results"):
        value = data.get(key)

        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]

        if isinstance(value, dict):
            return [
                {"__key": entry_key, **entry_value}
                for entry_key, entry_value in value.items()
                if isinstance(entry_value, dict)
            ]

    rows: list[dict[str, Any]] = []

    for key, value in data.items():
        if key in METADATA_KEYS or not isinstance(value, dict):
            continue

        rows.append({"__key": key, **value})

    return rows


def name_of(item: dict[str, Any]) -> str:
    return str(
        item.get("name")
        or item.get("sourceName")
        or item.get("source")
        or item.get("quelleName")
        or item.get("title")
        or item.get("__key")
        or "Unbekannte Quelle"
    ).strip()


def url_of(item: dict[str, Any]) -> str:
    return str(
        item.get("url")
        or item.get("feedUrl")
        or item.get("feed")
        or item.get("rss")
        or item.get("finalUrl")
        or item.get("pageUrl")
        or item.get("homepage")
        or ""
    ).strip()


def status_of(item: dict[str, Any]) -> str:
    raw = str(
        item.get("status")
        or item.get("state")
        or item.get("result")
        or ""
    ).strip().lower()

    if raw in {"ok", "online", "healthy", "available", "playable", "success"}:
        return "ok"

    if raw in {
        "warning",
        "warn",
        "limited",
        "restricted",
        "partial",
        "timeout",
        "blocked",
    }:
        return "warning"

    if raw in {"error", "broken", "failed", "offline", "invalid"}:
        return "error"

    if item.get("ok") is True:
        return "ok"

    if item.get("ok") is False:
        message = str(
            item.get("warning")
            or item.get("error")
            or item.get("message")
            or ""
        ).lower()

        if any(token in message for token in (
            "404",
            "410",
            "dns",
            "name resolution",
            "nicht gefunden",
            "invalid feed",
        )):
            return "error"

        return "warning"

    return "unknown"


def checked_of(item: dict[str, Any], fallback: str) -> str:
    return str(
        item.get("lastChecked")
        or item.get("checkedAt")
        or item.get("lastCheck")
        or item.get("updatedAt")
        or fallback
    ).strip()


def stable_key(name: str, url: str, used: set[str]) -> str:
    raw = f"{name}-{url}"
    key = re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")[:120]

    if not key:
        key = "source"

    original = key
    number = 2

    while key in used:
        key = f"{original}-{number}"
        number += 1

    used.add(key)
    return key


def catalog_rows() -> list[dict[str, Any]]:
    return as_rows(read_json(CATALOG_PATH, []))



def sanitize_oembed_url(value: str) -> str:
    """Replace accidental WordPress oEmbed endpoints with their target page."""

    raw = str(value or "").strip()

    if "/wp-json/oembed/" not in raw:
        return raw

    try:
        parsed = urlparse(raw)
        target = parse_qs(parsed.query).get("url", [""])[0]
        target = unquote(target).strip()

        if target:
            return target
    except Exception:
        pass

    return raw

def normalize() -> dict[str, dict[str, Any]]:
    original = read_json(HEALTH_PATH, {})
    generated_at = (
        original.get("generatedAt")
        if isinstance(original, dict)
        else None
    ) or datetime.now(timezone.utc).isoformat()

    rows = as_rows(original)

    # Preserve the rich format before rewriting source-health.json.
    if isinstance(original, dict) and any(
        key in original for key in ("schemaVersion", "summary", "sources")
    ):
        REPORT_PATH.write_text(
            json.dumps(original, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    # If source-health.json is empty or damaged, build unknown entries
    # from source-catalog.json instead of producing an empty file.
    if not rows:
        rows = catalog_rows()

    result: dict[str, dict[str, Any]] = {}
    used: set[str] = set()

    for item in rows:
        name = name_of(item)
        url = url_of(item)
        status = status_of(item)
        last_checked = checked_of(item, generated_at)

        key = stable_key(name, url, used)

        normalized: dict[str, Any] = {
            "name": name,
            "url": sanitize_oembed_url(url),
            "status": status,
            "ok": status == "ok",
            "lastChecked": last_checked,
        }

        # Additional fields remain available to the app but do not break
        # the legacy validator.
        for field in (
            "httpStatus",
            "finalUrl",
            "contentType",
            "feedType",
            "warning",
            "error",
            "categories",
            "pageUrl",
            "discovered",
            "configuredUrl",
            "previousUrl",
            "replacementUrl",
            "rawStatus",
            "detailedState",
            "failureKind",
            "consecutiveFailures",
            "consecutiveRestrictions",
            "consecutiveSuccesses",
            "firstFailureAt",
            "lastFailureAt",
            "lastSuccessAt",
            "suspiciousRedirect",
        ):
            if field in item and item[field] not in (None, "", [], {}):
                normalized[field] = item[field]

        result[key] = normalized

    HEALTH_PATH.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return result


def validate(data: dict[str, dict[str, Any]]) -> list[str]:
    errors: list[str] = []

    if not isinstance(data, dict):
        return ["source-health.json muss ein Objekt sein."]

    for key, item in data.items():
        if not isinstance(item, dict):
            errors.append(f"Eintrag {key!r} muss ein Objekt sein.")
            continue

        for required in ("name", "url", "status", "ok", "lastChecked"):
            if required not in item:
                errors.append(
                    f"{key!r} fehlt das Feld {required!r}."
                )

    return errors


def main() -> int:
    normalized = normalize()
    errors = validate(normalized)

    print(
        f"source-health.json normalisiert: "
        f"{len(normalized)} Quellen."
    )

    if REPORT_PATH.is_file():
        print(
            "Erweiterter Bericht gespeichert: "
            "source-health-report.json"
        )

    if errors:
        for error in errors:
            print(f"FEHLER: {error}")
        return 1

    print("Validator-kompatibles Quellenschema: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
