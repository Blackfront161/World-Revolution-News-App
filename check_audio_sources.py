#!/usr/bin/env python3
"""Check actual podcast audio files and live radio streams."""

from __future__ import annotations
from collections import defaultdict
from datetime import datetime, timezone
import configparser
import io
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
except ImportError:  # The bundled maintenance runtime exposes pip's vendored client.
    from pip._vendor import requests
    from pip._vendor.requests.adapters import HTTPAdapter
    from pip._vendor.urllib3.util.retry import Retry

ROOT = Path(__file__).resolve().parent
PODCASTS = ROOT / "podcasts.json"
RADIOS = ROOT / "radio-stations.json"
OUTPUT = ROOT / "audio-health.json"

TIMEOUT = (8, 15)
MAX_BYTES = 65536
USER_AGENT = (
    "Mozilla/5.0 (compatible; WorldRevolutionNews/1.8.1; "
    "+https://blackfront161.github.io/Revolution-News-Data/)"
)


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def rows(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
        for field in ("items", "episodes", "stations", "sources", "results"):
            if isinstance(data.get(field), list):
                return [item for item in data[field] if isinstance(item, dict)]
        return [
            {"name": name, **value}
            for name, value in data.items()
            if isinstance(value, dict)
        ]
    return []


def first(item: dict[str, Any], names: tuple[str, ...]) -> str:
    for name in names:
        value = item.get(name)
        if value:
            if isinstance(value, dict):
                for nested in ("url", "href", "src"):
                    if value.get(nested):
                        return str(value[nested]).strip()
            return str(value).strip()
    return ""


def podcast_name(item: dict[str, Any]) -> str:
    return first(
        item,
        (
            "sourceName", "podcastName", "podcast", "show",
            "quelleName", "source", "author"
        ),
    ) or "Unbekannter Podcast"


def podcast_url(item: dict[str, Any]) -> str:
    return first(
        item,
        (
            "audioUrl", "audio_url", "enclosureUrl", "enclosure",
            "mediaUrl", "file", "url"
        ),
    )


def radio_name(item: dict[str, Any]) -> str:
    return first(item, ("name", "station", "title", "label", "sourceName")) \
        or "Unbekanntes Radio"


def radio_urls(item: dict[str, Any]) -> list[str]:
    result: list[str] = []

    candidates = item.get("streamCandidates")
    if isinstance(candidates, list):
        result.extend(
            str(value).strip()
            for value in candidates
            if str(value or "").strip()
        )

    legacy = first(
        item,
        ("streamUrl", "stream_url", "audioUrl", "playlistUrl", "stream", "url"),
    )
    if legacy:
        result.append(legacy)

    return list(dict.fromkeys(result))


def client() -> requests.Session:
    retry = Retry(
        total=2,
        connect=2,
        read=1,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=frozenset(["GET"]),
    )
    adapter = HTTPAdapter(max_retries=retry)
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "audio/*, application/x-mpegURL, audio/x-mpegurl, */*",
    })
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def read_limited(response: requests.Response) -> bytes:
    result = bytearray()
    for chunk in response.iter_content(8192):
        if not chunk:
            continue
        result.extend(chunk[: MAX_BYTES - len(result)])
        if len(result) >= MAX_BYTES:
            break
    return bytes(result)


def playlist_target(body: bytes, content_type: str, base_url: str) -> str:
    text = body.decode("utf-8", errors="replace")
    lowered = content_type.lower()

    if "scpls" in lowered or "[playlist]" in text.lower():
        parser = configparser.ConfigParser()
        try:
            parser.read_file(io.StringIO(text))
            for section in parser.sections():
                for name, value in parser.items(section):
                    if name.lower().startswith("file") and value.strip():
                        return urljoin(base_url, value.strip())
        except Exception:
            pass

    if "mpegurl" in lowered or "#extm3u" in text.lower():
        for line in text.splitlines():
            value = line.strip()
            if value and not value.startswith("#"):
                return urljoin(base_url, value)

    return ""


def test_url(
    session: requests.Session,
    url: str,
    *,
    resolve_playlist: bool = True,
) -> dict[str, Any]:
    result = {
        "url": url,
        "status": "unknown",
        "httpStatus": 0,
        "contentType": "",
        "detail": "",
    }

    if not url:
        result["status"] = "broken"
        result["detail"] = "Keine Audio-Adresse."
        return result

    try:
        response = session.get(
            url,
            headers={"Range": "bytes=0-65535"},
            timeout=TIMEOUT,
            allow_redirects=True,
            stream=True,
        )
        result["httpStatus"] = response.status_code
        result["contentType"] = response.headers.get("Content-Type", "")

        if response.status_code in (401, 403, 408, 429):
            result["status"] = "limited"
            result["detail"] = f"Automatischer Test begrenzt (HTTP {response.status_code})."
            return result
        if response.status_code in (404, 410):
            result["status"] = "broken"
            result["detail"] = f"Nicht gefunden (HTTP {response.status_code})."
            return result
        if response.status_code >= 500:
            result["status"] = "limited"
            result["detail"] = f"Temporärer Serverfehler (HTTP {response.status_code})."
            return result
        if not 200 <= response.status_code < 400:
            result["status"] = "limited"
            result["detail"] = f"Unerwarteter Status HTTP {response.status_code}."
            return result

        body = read_limited(response)
        if resolve_playlist:
            nested = playlist_target(body, result["contentType"], response.url)
            if nested and nested != url:
                nested_result = test_url(
                    session,
                    nested,
                    resolve_playlist=False,
                )
                nested_result["playlistUrl"] = url
                return nested_result

        ctype = result["contentType"].lower()
        signature = (
            body.startswith(b"ID3")
            or body.startswith(b"OggS")
            or body.startswith(b"fLaC")
            or b"ftyp" in body[:32]
            or body[:2] in (b"\xff\xfb", b"\xff\xf3", b"\xff\xf2")
        )
        if ctype.startswith("audio/") or "application/ogg" in ctype or signature:
            result["status"] = "playable"
            result["detail"] = "Audioantwort erfolgreich."
        elif body:
            result["status"] = "limited"
            result["detail"] = "Erreichbar, Audioformat nicht eindeutig."
        else:
            result["status"] = "limited"
            result["detail"] = "Leere Testantwort."
        return result

    except requests.exceptions.Timeout as error:
        result["status"] = "limited"
        result["detail"] = f"Zeitüberschreitung: {error}"
        return result
    except requests.RequestException as error:
        message = str(error)
        result["status"] = (
            "broken"
            if any(token in message for token in (
                "NameResolutionError",
                "Name or service not known",
                "getaddrinfo failed",
            ))
            else "limited"
        )
        result["detail"] = message
        return result


def summary(checks: list[dict[str, Any]]) -> dict[str, int]:
    return {
        "total": len(checks),
        "playable": sum(item.get("status") == "playable" for item in checks),
        "limited": sum(item.get("status") == "limited" for item in checks),
        "broken": sum(item.get("status") == "broken" for item in checks),
        "unknown": sum(item.get("status") == "unknown" for item in checks),
    }


def main() -> int:
    podcast_items = rows(read_json(PODCASTS, []))
    radio_items = rows(read_json(RADIOS, []))
    previous = read_json(OUTPUT, {})
    skip_podcasts = os.getenv("WRN_AUDIO_SKIP_PODCASTS", "").strip() == "1"

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in podcast_items:
        grouped[podcast_name(item)].append(item)

    podcast_checks: list[dict[str, Any]] = []
    radio_checks: list[dict[str, Any]] = []
    session = client()

    try:
        for name, episodes in ([] if skip_podcasts else sorted(grouped.items())):
            urls = [podcast_url(item) for item in episodes]
            urls = [url for url in urls if url][:2]

            if not urls:
                podcast_checks.append({
                    "name": name,
                    "status": "broken",
                    "detail": "Keine Audiodatei in den Episoden.",
                })
                continue

            checks = [test_url(session, url) for url in urls]
            statuses = [item["status"] for item in checks]
            status = (
                "playable" if "playable" in statuses
                else "limited" if "limited" in statuses
                else "broken" if "broken" in statuses
                else "unknown"
            )
            podcast_checks.append({
                "name": name,
                "status": status,
                "testedEpisodes": len(checks),
                "checks": checks,
            })

        for station in radio_items:
            candidates = radio_urls(station)[:4]

            if not candidates:
                radio_checks.append({
                    "name": radio_name(station),
                    "url": "",
                    "status": "unknown",
                    "httpStatus": 0,
                    "contentType": "",
                    "detail": "Keine Stream-Adresse im Katalog.",
                    "candidateChecks": [],
                })
                continue

            candidate_checks = [
                test_url(session, candidate)
                for candidate in candidates
            ]
            selected = next(
                (item for item in candidate_checks if item.get("status") == "playable"),
                next(
                    (item for item in candidate_checks if item.get("status") == "limited"),
                    candidate_checks[0],
                ),
            )
            radio_checks.append({
                "name": radio_name(station),
                **selected,
                "candidateChecks": candidate_checks,
            })
    finally:
        session.close()

    previous_podcasts = previous.get("podcasts") if isinstance(previous, dict) else None
    podcast_payload = (
        previous_podcasts
        if skip_podcasts and isinstance(previous_podcasts, dict)
        else {
            "summary": summary(podcast_checks),
            "checks": podcast_checks,
            "episodeCount": len(podcast_items),
        }
    )

    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "podcasts": podcast_payload,
        "radio": {
            "summary": summary(radio_checks),
            "checks": radio_checks,
            "stationCount": len(radio_items),
        },
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "podcasts": payload["podcasts"]["summary"],
        "radio": payload["radio"]["summary"],
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
