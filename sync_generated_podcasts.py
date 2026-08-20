#!/usr/bin/env python3
"""Keep the static generated-podcast recovery file aligned with the live R2 library."""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


DEFAULT_LIBRARY_URL = (
    "https://revolution-proxy.paghklo.workers.dev/"
    "?action=podcasts.list&limit=500"
)
DEFAULT_ORIGIN = "https://blackfront161.github.io"
TRUSTED_AUDIO_HOST = "revolution-proxy.paghklo.workers.dev"


def parse_timestamp(value: object) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        return None


def safe_https_url(value: object, *, host: str | None = None) -> str:
    text = str(value or "").strip()
    parsed = urlparse(text)
    if parsed.scheme != "https" or not parsed.netloc:
        return ""
    if host and parsed.hostname != host:
        return ""
    return text


def normalize_items(items: object, now: datetime | None = None) -> list[dict]:
    if not isinstance(items, list):
        raise ValueError("Podcast library response has no item list")
    now = now or datetime.now(timezone.utc)
    normalized: list[dict] = []
    seen: set[str] = set()

    for raw in items:
        if not isinstance(raw, dict):
            continue
        podcast_id = str(raw.get("id") or "").strip()
        audio_url = safe_https_url(raw.get("audioUrl"), host=TRUSTED_AUDIO_HOST)
        expires_at = parse_timestamp(raw.get("expiresAt"))
        if not podcast_id.startswith("podcasts/") or not podcast_id.endswith(".mp3"):
            continue
        if not audio_url or podcast_id in seen or (expires_at and expires_at <= now):
            continue

        seen.add(podcast_id)
        normalized.append(
            {
                "id": podcast_id,
                "title": str(raw.get("title") or "Podcast").strip(),
                "source": str(raw.get("source") or "").strip(),
                "language": str(raw.get("language") or "").strip(),
                "mode": str(raw.get("mode") or "full").strip(),
                "voiceLabel": str(raw.get("voiceLabel") or raw.get("voice") or "").strip(),
                "createdAt": str(raw.get("createdAt") or "").strip(),
                "expiresAt": str(raw.get("expiresAt") or "").strip(),
                "size": max(0, int(raw.get("size") or 0)),
                "audioUrl": audio_url,
                "articleUrl": safe_https_url(raw.get("articleUrl")),
            }
        )

    normalized.sort(
        key=lambda item: parse_timestamp(item.get("createdAt"))
        or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return normalized


def fetch_library(url: str, origin: str) -> dict:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "Origin": origin,
            "User-Agent": "World-Revolution-News-Podcast-Snapshot/1.0",
        },
    )
    with urlopen(request, timeout=25) as response:
        if response.status != 200:
            raise RuntimeError(f"Podcast library returned HTTP {response.status}")
        payload = json.load(response)
    if not isinstance(payload, dict):
        raise ValueError("Podcast library response is not an object")
    return payload


def write_atomic(path: Path, items: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=path.parent,
        delete=False,
        newline="\n",
    ) as handle:
        json.dump(items, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_LIBRARY_URL)
    parser.add_argument("--origin", default=DEFAULT_ORIGIN)
    parser.add_argument("--output", type=Path, default=Path("generated-podcasts.json"))
    parser.add_argument(
        "--optional",
        action="store_true",
        help="Preserve the existing snapshot if the live library is temporarily unavailable.",
    )
    args = parser.parse_args()

    try:
        payload = fetch_library(args.url, args.origin)
        items = normalize_items(payload.get("items"))
        write_atomic(args.output, items)
        print(f"Generated podcast recovery snapshot: {len(items)} active items")
        return 0
    except Exception as error:  # noqa: BLE001 - CLI boundary must preserve the last good file.
        print(f"Generated podcast recovery snapshot failed: {error}", file=sys.stderr)
        return 0 if args.optional else 1


if __name__ == "__main__":
    raise SystemExit(main())
