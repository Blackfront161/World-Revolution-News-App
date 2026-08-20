#!/usr/bin/env python3
"""Create a content-free operational status for CI and maintainers."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "operations-status.json"


def load_json(name: str, fallback: Any) -> Any:
    path = ROOT / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return fallback


def parse_date(value: Any) -> datetime | None:
    try:
        parsed = datetime.fromisoformat(str(value or "").replace("Z", "+00:00"))
        return parsed.replace(tzinfo=parsed.tzinfo or timezone.utc)
    except (TypeError, ValueError):
        return None


def age_hours(value: Any, now: datetime) -> float | None:
    parsed = parse_date(value)
    if not parsed:
        return None
    return max(0.0, (now - parsed.astimezone(timezone.utc)).total_seconds() / 3600)


def status_for_age(value: float | None, warning: float, error: float) -> str:
    if value is None or value > error:
        return "error"
    if value > warning:
        return "warning"
    return "ok"


def health_counts(payload: Any) -> dict[str, int]:
    values = payload.values() if isinstance(payload, dict) else []
    counts = {"total": 0, "ok": 0, "warning": 0, "error": 0}
    for item in values:
        if not isinstance(item, dict):
            continue
        counts["total"] += 1
        raw = str(item.get("status") or "").casefold()
        if item.get("ok") is True and raw not in {"error", "failed", "broken"}:
            counts["ok"] += 1
        elif raw in {"error", "failed", "broken", "dead"}:
            counts["error"] += 1
        else:
            counts["warning"] += 1
    return counts


def audio_health_counts(payload: Any) -> dict[str, int]:
    summary = payload.get("podcasts", {}).get("summary", {}) if isinstance(payload, dict) else {}
    if not isinstance(summary, dict):
        return {"total": 0, "ok": 0, "warning": 0, "error": 0}
    return {
        "total": int(summary.get("total") or 0),
        "ok": int(summary.get("playable") or 0),
        "warning": int(summary.get("limited") or 0) + int(summary.get("unknown") or 0),
        "error": int(summary.get("broken") or 0),
    }


def environment_count(name: str) -> int:
    try:
        return max(0, int(os.environ.get(name, "0")))
    except (TypeError, ValueError):
        return 0


def build_status(now: datetime | None = None) -> dict[str, Any]:
    current = now or datetime.now(timezone.utc)
    feed = load_json("feed-status.json", {})
    run = load_json("aggregate-run-status.json", {})
    sources = health_counts(load_json("source-health.json", {}))
    podcasts = health_counts(load_json("podcast-health.json", {}))
    libraries_payload = load_json("library-health.json", {})
    libraries = health_counts(libraries_payload.get("sources", {}) if isinstance(libraries_payload, dict) else {})
    audio = audio_health_counts(load_json("audio-health.json", {}))
    workflow_failures = environment_count("WRN_WORKFLOW_FAILURES")

    fetch_age = age_hours(feed.get("lastSuccessfulFetchAt"), current)
    article_age = age_hours(feed.get("news", {}).get("newestArticleAt"), current)
    checks = [
        {
            "id": "feed-fetch-age",
            "status": status_for_age(fetch_age, 2.5, 5.0),
            "value": round(fetch_age, 2) if fetch_age is not None else None,
            "unit": "hours",
            "warningAt": 2.5,
            "errorAt": 5.0,
        },
        {
            "id": "newest-article-age",
            "status": status_for_age(article_age, 12.0, 24.0),
            "value": round(article_age, 2) if article_age is not None else None,
            "unit": "hours",
            "warningAt": 12.0,
            "errorAt": 24.0,
        },
        {
            "id": "source-errors",
            "status": "error" if sources["error"] else ("warning" if sources["warning"] else "ok"),
            "value": sources["error"],
            "unit": "sources",
            "warningCount": sources["warning"],
            "totalCount": sources["total"],
        },
        {
            "id": "podcast-errors",
            "status": "error" if podcasts["error"] else ("warning" if podcasts["warning"] else "ok"),
            "value": podcasts["error"],
            "unit": "sources",
            "warningCount": podcasts["warning"],
            "totalCount": podcasts["total"],
        },
        {
            "id": "audio-errors",
            "status": "error" if audio["error"] else ("warning" if audio["warning"] else "ok"),
            "value": audio["error"],
            "unit": "episodes",
            "warningCount": audio["warning"],
            "totalCount": audio["total"],
        },
        {
            "id": "library-errors",
            "status": "error" if libraries["error"] else ("warning" if libraries["warning"] else "ok"),
            "value": libraries["error"],
            "unit": "sources",
            "warningCount": libraries["warning"],
            "totalCount": libraries["total"],
        },
        {
            "id": "workflow-errors",
            "status": "error" if workflow_failures else "ok",
            "value": workflow_failures,
            "unit": "workflows",
        },
        {
            "id": "aggregate-budget",
            "status": "error" if run.get("stoppedForBudget") else "ok",
            "value": bool(run.get("stoppedForBudget")),
            "unit": "boolean",
        },
    ]
    rank = {"ok": 0, "warning": 1, "error": 2}
    overall = max((item["status"] for item in checks), key=rank.get, default="error")
    return {
        "schemaVersion": 1,
        "generatedAt": current.isoformat(),
        "status": overall,
        "healthy": overall != "error",
        "checks": checks,
        "privacy": "Counters and timestamps only; no article, feedback, URL or user content.",
    }


def main() -> int:
    status = build_status()
    TARGET.write_text(
        json.dumps(status, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(status, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
