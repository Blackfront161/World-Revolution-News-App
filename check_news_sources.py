#!/usr/bin/env python3
"""World Revolution News – validator-compatible source verification.

The canonical source list is loaded from aggregate.py.
A flat source-health.json is written for the existing app validator.
A rich source-health-report.json is written for diagnostics and summaries.
"""

from __future__ import annotations

import ast
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
from typing import Any
from urllib.parse import urljoin, urlsplit, urlunsplit
import warnings

from source_recovery import (
    apply_history,
    discover_replacement_feed,
    merge_discovered_feeds,
    read_json as read_recovery_json,
    suspicious_redirect,
    write_json as write_recovery_json,
)

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.exceptions import InsecureRequestWarning
    from urllib3.util.retry import Retry
except ImportError:  # The bundled maintenance runtime exposes pip's vendored client.
    from pip._vendor import requests
    from pip._vendor.requests.adapters import HTTPAdapter
    from pip._vendor.urllib3.exceptions import InsecureRequestWarning
    from pip._vendor.urllib3.util.retry import Retry


ROOT = Path(__file__).resolve().parent
AGGREGATE_PATH = ROOT / "aggregate.py"
CATALOG_PATH = ROOT / "source-catalog.json"
MULTILINGUAL_REGISTRY_PATH = ROOT / "multilingual-source-registry.json"
OUTPUT_PATH = ROOT / "source-health.json"
REPORT_PATH = ROOT / "source-health-report.json"
DISCOVERED_PATH = ROOT / "discovered-feeds.json"
HISTORY_PATH = ROOT / "source-health-history.json"
RECOVERY_REPORT_PATH = ROOT / "source-recovery-report.json"

USER_AGENT = (
    "Mozilla/5.0 (compatible; WorldRevolutionNews/1.7.17b; "
    "+https://blackfront161.github.io/Revolution-News-Data/)"
)

CONNECT_TIMEOUT = 8
READ_TIMEOUT = 15
MAX_BYTES = 131072
MAX_WORKERS = 8

warnings.simplefilter("ignore", InsecureRequestWarning)

if hasattr(sys.stdout, "reconfigure"):
    # Windows PowerShell may expose a legacy cp1252 console. Source names such
    # as Anarşist Haberler must not abort an otherwise successful full check.
    sys.stdout.reconfigure(errors="replace")


class FeedLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        if tag.lower() != "link":
            return

        values = {
            str(key).lower(): str(value or "")
            for key, value in attrs
        }

        rel = values.get("rel", "").lower()
        content_type = values.get("type", "").lower()
        href = values.get("href", "").strip()

        if (
            href
            and "alternate" in rel
            and any(token in content_type for token in (
                "rss",
                "atom",
                "feed+json",
                "application/xml",
                "text/xml",
            ))
        ):
            self.links.append(href)


def read_json(path: Path, fallback: Any) -> Any:
    if not path.is_file():
        return fallback

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def canonical_url(value: str) -> str:
    raw = str(value or "").strip()

    if not raw:
        return ""

    try:
        parsed = urlsplit(raw)
    except ValueError:
        return raw.lower().rstrip("/")

    host = (parsed.hostname or "").lower()

    if host.startswith("www."):
        host = host[4:]

    path = re.sub(r"/+", "/", parsed.path or "/")

    if path != "/":
        path = path.rstrip("/")

    return urlunsplit((
        parsed.scheme.lower(),
        host,
        path,
        parsed.query,
        "",
    ))


def as_catalog_sources(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    if not isinstance(data, dict):
        return []

    for key in ("sources", "items", "entries", "results"):
        value = data.get(key)

        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]

    return [
        {"name": key, **value}
        for key, value in data.items()
        if isinstance(value, dict)
    ]


def literal_source_mapping(path: Path) -> dict[str, Any]:
    """Extract the literal source dictionary from aggregate.py safely."""

    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(path))

    preferred_names = {
        "quellen",
        "QUELLEN",
        "sources",
        "SOURCES",
        "kategorien",
        "KATEGORIEN",
    }

    candidates: list[tuple[str, dict[str, Any]]] = []

    for node in tree.body:
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue

        target_names: list[str] = []

        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    target_names.append(target.id)
            value_node = node.value
        else:
            if isinstance(node.target, ast.Name):
                target_names.append(node.target.id)
            value_node = node.value

        if value_node is None:
            continue

        try:
            value = ast.literal_eval(value_node)
        except Exception:
            continue

        if not isinstance(value, dict):
            continue

        for name in target_names:
            candidates.append((name, value))

    for name, value in candidates:
        if name in preferred_names:
            return value

    # Fallback: largest literal dictionary whose values contain source lists.
    suitable = [
        value
        for _, value in candidates
        if any(isinstance(item, list) for item in value.values())
    ]

    if suitable:
        return max(suitable, key=lambda value: len(value))

    return {}


def literal_source_lists(path: Path) -> list[dict[str, Any]]:
    """Extract additional literal source lists appended to aggregate.py."""

    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    sources: list[dict[str, Any]] = []
    for node in tree.body:
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue
        value_node = node.value
        if value_node is None:
            continue
        try:
            value = ast.literal_eval(value_node)
        except Exception:
            continue
        if not isinstance(value, list):
            continue
        for item in value:
            if not isinstance(item, dict):
                continue
            if not item.get("name"):
                continue
            if not any(item.get(field) for field in (
                "feedUrl", "feed", "rss", "url", "homepage",
            )):
                continue
            sources.append(item)
    return sources


def string_list(value: Any) -> list[str]:
    if isinstance(value, str):
        values = [value]
    elif isinstance(value, list):
        values = value
    else:
        values = []

    result: list[str] = []

    for item in values:
        clean = str(item or "").strip()

        if clean and clean not in result:
            result.append(clean)

    return result


def source_metadata(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "languages": string_list(
            item.get("languages", item.get("language", []))
        ),
        "originRegion": str(item.get("originRegion", "") or "").strip(),
        "originCountry": str(item.get("originCountry", "") or "").strip(),
        "originCountryCode": str(
            item.get("originCountryCode", "") or ""
        ).strip().upper(),
    }


def merge_source_metadata(
    target: dict[str, Any],
    incoming: dict[str, Any],
) -> None:
    for language in incoming.get("languages", []):
        if language not in target.setdefault("languages", []):
            target["languages"].append(language)

    for field in (
        "originRegion",
        "originCountry",
        "originCountryCode",
    ):
        if not target.get(field) and incoming.get(field):
            target[field] = incoming[field]


def load_sources(
    aggregate_path: Path = AGGREGATE_PATH,
) -> list[dict[str, Any]]:
    """Load and deduplicate the canonical source list from aggregate.py."""

    if not aggregate_path.is_file():
        raise FileNotFoundError(
            f"aggregate.py fehlt: {aggregate_path}"
        )

    mapping = literal_source_mapping(aggregate_path)
    merged: dict[str, dict[str, Any]] = {}

    for category, values in mapping.items():
        if not isinstance(values, list):
            continue

        for item in values:
            if not isinstance(item, dict):
                continue

            name = str(
                item.get("name")
                or item.get("sourceName")
                or item.get("title")
                or "Unbekannte Quelle"
            ).strip()

            url = str(
                item.get("feedUrl")
                or item.get("feed")
                or item.get("rss")
                or item.get("url")
                or ""
            ).strip()

            page_url = str(
                item.get("homepage")
                or item.get("website")
                or item.get("pageUrl")
                or ""
            ).strip()

            key = (
                canonical_url(url)
                or canonical_url(page_url)
                or re.sub(r"[^a-z0-9]+", "", name.lower())
            )

            if not key:
                continue

            if key not in merged:
                merged[key] = {
                    "name": name,
                    "url": url,
                    "pageUrl": page_url,
                    "categories": [str(category)],
                    **source_metadata(item),
                }
                continue

            current = merged[key]

            if str(category) not in current["categories"]:
                current["categories"].append(str(category))

            if not current["url"] and url:
                current["url"] = url

            if not current["pageUrl"] and page_url:
                current["pageUrl"] = page_url

            merge_source_metadata(current, source_metadata(item))

    for item in literal_source_lists(aggregate_path):
        name = str(item.get("name") or "Unbekannte Quelle").strip()
        url = str(
            item.get("feedUrl")
            or item.get("feed")
            or item.get("rss")
            or item.get("url")
            or ""
        ).strip()
        page_url = str(
            item.get("homepage")
            or item.get("website")
            or item.get("pageUrl")
            or ""
        ).strip()
        key = (
            canonical_url(url)
            or canonical_url(page_url)
            or re.sub(r"[^a-z0-9]+", "", name.lower())
        )
        if not key:
            continue
        categories = string_list(item.get("categories", []))
        if key not in merged:
            merged[key] = {
                "name": name,
                "url": url,
                "pageUrl": page_url,
                "categories": categories,
                **source_metadata(item),
            }
            continue
        current = merged[key]
        for category in categories:
            if category not in current["categories"]:
                current["categories"].append(category)
        if not current["url"] and url:
            current["url"] = url
        if not current["pageUrl"] and page_url:
            current["pageUrl"] = page_url
        merge_source_metadata(current, source_metadata(item))

    # Enrich with declarative registries without deleting aggregate.py sources.
    registry_items: list[dict[str, Any]] = []

    for registry_path in (
        CATALOG_PATH,
        MULTILINGUAL_REGISTRY_PATH,
    ):
        registry_items.extend(
            as_catalog_sources(read_json(registry_path, []))
        )

    for item in registry_items:
        name = str(
            item.get("name")
            or item.get("sourceName")
            or item.get("title")
            or "Unbekannte Quelle"
        ).strip()

        url = str(
            item.get("feedUrl")
            or item.get("feed")
            or item.get("rss")
            or item.get("url")
            or ""
        ).strip()

        page_url = str(
            item.get("homepage")
            or item.get("website")
            or item.get("pageUrl")
            or ""
        ).strip()

        key = (
            canonical_url(url)
            or canonical_url(page_url)
            or re.sub(r"[^a-z0-9]+", "", name.lower())
        )

        if not key:
            continue

        categories = item.get("categories", item.get("category", []))

        if isinstance(categories, str):
            categories = [categories]

        if key not in merged:
            merged[key] = {
                "name": name,
                "url": url,
                "pageUrl": page_url,
                "categories": [
                    str(category)
                    for category in categories
                    if str(category).strip()
                ],
                **source_metadata(item),
            }
            continue

        current = merged[key]

        for category in categories:
            clean = str(category).strip()

            if clean and clean not in current["categories"]:
                current["categories"].append(clean)

        if not current["url"] and url:
            current["url"] = url

        if not current["pageUrl"] and page_url:
            current["pageUrl"] = page_url

        merge_source_metadata(current, source_metadata(item))

    # Some legacy registries describe the same publisher once with a feed URL
    # and once with only a homepage. URL-based deduplication kept the homepage
    # row as a separate "not checked" source. Collapse those rows by source
    # name and retain the technically checkable feed record.
    by_name: dict[str, dict[str, Any]] = {}
    for source in merged.values():
        name_key = re.sub(
            r"[^a-z0-9]+",
            "",
            str(source.get("name") or "").casefold(),
        )
        if not name_key:
            continue
        if name_key not in by_name:
            by_name[name_key] = source
            continue
        current = by_name[name_key]
        if not current.get("url") and source.get("url"):
            current["url"] = source["url"]
        if not current.get("pageUrl") and source.get("pageUrl"):
            current["pageUrl"] = source["pageUrl"]
        for category in source.get("categories", []):
            if category not in current.setdefault("categories", []):
                current["categories"].append(category)
        merge_source_metadata(current, source_metadata(source))

    return sorted(
        by_name.values(),
        key=lambda item: item["name"].lower(),
    )


def make_session() -> requests.Session:
    retry = Retry(
        total=2,
        connect=2,
        read=1,
        backoff_factor=0.6,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=frozenset(["GET"]),
        respect_retry_after_header=True,
    )

    adapter = HTTPAdapter(
        max_retries=retry,
        pool_connections=MAX_WORKERS,
        pool_maxsize=MAX_WORKERS,
    )

    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        # The bundled Windows HTTP stack may advertise Brotli but return the
        # compressed bytes unchanged for streamed responses. Restricting the
        # encoding keeps RSS detection reliable (notably for Chuang).
        "Accept-Encoding": "gzip, deflate",
        "Accept": (
            "application/rss+xml, application/atom+xml, "
            "application/feed+json, application/xml, text/xml, "
            "application/json, text/html;q=0.8, */*;q=0.5"
        ),
    })
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def read_limited(response: requests.Response) -> bytes:
    result = bytearray()

    for chunk in response.iter_content(16384):
        if not chunk:
            continue

        result.extend(chunk[: MAX_BYTES - len(result)])

        if len(result) >= MAX_BYTES:
            break

    return bytes(result)


def looks_like_feed(
    payload: bytes,
    content_type: str,
) -> tuple[bool, str]:
    sample = payload.lstrip()
    lowered = sample.lower()
    content_type = content_type.lower()

    if not sample:
        return False, "empty"

    if any(token in content_type for token in (
        "application/rss+xml",
        "application/atom+xml",
        "application/feed+json",
    )):
        # Some CDNs return a cached Brotli body even when the client did not
        # request Brotli. The explicit feed media type remains checkable and
        # avoids treating the compressed bytes as an HTML failure.
        return True, "declared-feed"

    if any(token in lowered for token in (
        b"<rss",
        b"<feed",
        b"<rdf:rdf",
        b"<channel",
    )):
        return True, "xml"

    if (
        "application/feed+json" in content_type
        or (
            "application/json" in content_type
            and (b'"items"' in lowered or b'"version"' in lowered)
        )
    ):
        return True, "json"

    return False, "unexpected"


def looks_like_access_challenge(payload: bytes) -> bool:
    """Recognise bot challenges that deliberately answer with HTTP 200."""

    lowered = bytes(payload or b"").lower()
    return any(token in lowered for token in (
        b"making sure you&#39;re not a bot",
        b"making sure you're not a bot",
        b"protected by anubis",
        b"enable javascript and cookies",
        b"just a moment...",
        b"<title>verifying connection</title>",
        b"verifying your browser before connecting",
        b'action="/_challenge"',
    ))


def discover_feed(
    session: requests.Session,
    page_url: str,
) -> str:
    if not page_url:
        return ""

    try:
        response = session.get(
            page_url,
            timeout=(CONNECT_TIMEOUT, READ_TIMEOUT),
            allow_redirects=True,
        )
        payload = response.content[:MAX_BYTES]
    except requests.RequestException:
        return ""

    is_feed, _ = looks_like_feed(
        payload,
        response.headers.get("Content-Type", ""),
    )

    if is_feed:
        return response.url

    parser = FeedLinkParser()

    try:
        parser.feed(
            payload.decode(
                response.encoding or "utf-8",
                errors="replace",
            )
        )
    except Exception:
        return ""

    return (
        urljoin(response.url, parser.links[0])
        if parser.links
        else ""
    )



def finalize_result(result: dict[str, Any]) -> dict[str, Any]:
    result["ok"] = result.get("status") == "ok"
    return result

def check_source(source: dict[str, Any]) -> dict[str, Any]:
    checked_at = datetime.now(timezone.utc).isoformat()
    name = source["name"]
    url = str(source.get("url", "")).strip()
    page_url = str(source.get("pageUrl", "")).strip()
    categories = source.get("categories", [])

    result: dict[str, Any] = {
        "name": name,
        "url": url,
        "configuredUrl": url,
        "pageUrl": page_url,
        "status": "unknown",
        "ok": False,
        "lastChecked": checked_at,
        "categories": categories,
        "languages": source.get("languages", []),
        "originRegion": source.get("originRegion", ""),
        "originCountry": source.get("originCountry", ""),
        "originCountryCode": source.get("originCountryCode", ""),
    }

    session = make_session()

    try:
        if not url:
            candidate = discover_replacement_feed(
                session,
                source,
                page_url,
            )
            url = (
                candidate["url"]
                if candidate
                else discover_feed(session, page_url)
            )

            if url:
                result["url"] = url
                result["replacementUrl"] = url
                result["discovered"] = True
                if candidate:
                    result["feedType"] = candidate.get("feedType", "")
                result["warning"] = "Feed-Adresse automatisch erkannt."
            else:
                if page_url:
                    try:
                        page_response = session.get(
                            page_url,
                            timeout=(CONNECT_TIMEOUT, READ_TIMEOUT),
                            allow_redirects=True,
                            stream=True,
                        )
                        result["httpStatus"] = page_response.status_code
                        result["finalUrl"] = page_response.url
                        result["contentType"] = page_response.headers.get(
                            "Content-Type",
                            "",
                        )
                        result["pageOnly"] = True
                        result["status"] = "warning"
                        result["warning"] = (
                            "Website geprüft und erreichbar; "
                            "kein technischer Feed vorhanden."
                            if 200 <= page_response.status_code < 400
                            else (
                                "Website geprüft; automatischer Abruf "
                                f"eingeschränkt (HTTP "
                                f"{page_response.status_code})."
                            )
                        )
                    except requests.RequestException as error:
                        result["status"] = "warning"
                        result["pageOnly"] = True
                        result["warning"] = (
                            "Website ohne technischen Feed geprüft; "
                            f"Abruf derzeit eingeschränkt: {error}"
                        )
                else:
                    result["warning"] = (
                        "Keine technische Feed- oder Website-Adresse vorhanden."
                    )
                return finalize_result(result)

        try:
            response = session.get(
                url,
                timeout=(CONNECT_TIMEOUT, READ_TIMEOUT),
                allow_redirects=True,
                stream=True,
            )
        except requests.exceptions.Timeout as error:
            result["status"] = "warning"
            result["warning"] = f"Zeitüberschreitung: {error}"
            return finalize_result(result)
        except requests.exceptions.SSLError as error:
            result["status"] = "warning"
            result["warning"] = f"TLS-Zertifikatsproblem: {error}"
            return finalize_result(result)
        except requests.exceptions.ConnectionError as error:
            message = str(error)

            if any(token in message for token in (
                "NameResolutionError",
                "Name or service not known",
                "getaddrinfo failed",
            )):
                result["status"] = "error"
                result["error"] = f"DNS-/Domainfehler: {message}"
            else:
                result["status"] = "warning"
                result["warning"] = (
                    f"Temporäres Verbindungsproblem: {message}"
                )

            return finalize_result(result)
        except requests.RequestException as error:
            result["status"] = "warning"
            result["warning"] = f"Abruffehler: {error}"
            return finalize_result(result)

        result["httpStatus"] = response.status_code
        result["finalUrl"] = response.url
        result["contentType"] = response.headers.get(
            "Content-Type",
            "",
        )

        if suspicious_redirect(url, response.url):
            result["status"] = "error"
            result["suspiciousRedirect"] = True
            result["error"] = (
                "Unerwartete Weiterleitung auf eine andere Domain; "
                "manuelle PrÃ¼fung erforderlich."
            )
            return finalize_result(result)

        if response.status_code in (404, 410):
            response.close()
            candidate = discover_replacement_feed(session, source, url)
            if candidate:
                result["previousUrl"] = url
                result["url"] = candidate["url"]
                result["replacementUrl"] = candidate["url"]
                result["finalUrl"] = candidate["url"]
                result["feedType"] = candidate.get("feedType", "")
                result["discovered"] = True
                result["status"] = "ok"
                result["warning"] = (
                    "Verschobene Feed-Adresse gefunden; "
                    "Quellenregister bleibt unverÃ¤ndert."
                )
                return finalize_result(result)

            result["status"] = "error"
            result["error"] = (
                f"Feed nicht gefunden (HTTP {response.status_code})."
            )
            return finalize_result(result)

        if (
            response.status_code in (401, 403, 408, 429)
            or response.status_code >= 500
        ):
            result["status"] = "warning"
            result["warning"] = (
                f"Quelle eingeschränkt (HTTP {response.status_code})."
            )
            return finalize_result(result)

        if not 200 <= response.status_code < 400:
            result["status"] = "warning"
            result["warning"] = (
                f"Unerwarteter HTTP-Status {response.status_code}."
            )
            return finalize_result(result)

        payload = read_limited(response)
        if looks_like_access_challenge(payload):
            result["status"] = "warning"
            result["accessRestricted"] = True
            result["warning"] = (
                "Quelle erreichbar, automatischer Abruf wird jedoch "
                "durch einen Bot-Schutz eingeschränkt."
            )
            return finalize_result(result)

        valid_feed, feed_type = looks_like_feed(
            payload,
            result["contentType"],
        )
        result["feedType"] = feed_type

        if valid_feed:
            result["status"] = "ok"
        else:
            response.close()
            candidate = discover_replacement_feed(session, source, url)
            if candidate:
                result["previousUrl"] = url
                result["url"] = candidate["url"]
                result["replacementUrl"] = candidate["url"]
                result["finalUrl"] = candidate["url"]
                result["feedType"] = candidate.get("feedType", "")
                result["discovered"] = True
                result["status"] = "ok"
                result["warning"] = (
                    "Alternative Feed-Adresse gefunden; "
                    "Quellenregister bleibt unverÃ¤ndert."
                )
            else:
                result["status"] = "warning"
                result["warning"] = (
                    "Adresse erreichbar, Antwort nicht eindeutig als Feed erkannt."
                )

        return finalize_result(result)
    finally:
        session.close()


def stable_key(
    source: dict[str, Any],
    used: set[str],
) -> str:
    raw = f"{source.get('name', '')}-{source.get('url', '')}"
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


def write_results(results: list[dict[str, Any]]) -> None:
    used: set[str] = set()
    flat: dict[str, dict[str, Any]] = {}

    for item in results:
        item["ok"] = item.get("status") == "ok"
        flat[stable_key(item, used)] = item

    summary = {
        "total": len(results),
        "ok": sum(item["status"] == "ok" for item in results),
        "warning": sum(
            item["status"] == "warning"
            for item in results
        ),
        "error": sum(
            item["status"] == "error"
            for item in results
        ),
        "unknown": sum(
            item["status"] == "unknown"
            for item in results
        ),
    }

    generated = datetime.now(timezone.utc)
    generated_at = generated.isoformat()

    report = {
        "schemaVersion": 5,
        "generatedAt": generated_at,
        "freshUntil": (generated + timedelta(hours=12)).isoformat(),
        "refreshPolicy": {
            "workflowIntervalHours": 4,
            "freshnessWindowHours": 12,
            "expiredResultsAreNotPresentedAsCurrent": True,
        },
        "summary": summary,
        "sources": results,
    }

    OUTPUT_PATH.write_text(
        json.dumps(flat, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    discovered = merge_discovered_feeds(
        read_recovery_json(DISCOVERED_PATH, {}),
        results,
    )
    write_recovery_json(DISCOVERED_PATH, discovered)


def main() -> int:
    configured_sources = load_sources()
    requested_names = {
        value.strip().casefold()
        for value in os.getenv("WRN_NEWS_SOURCE_NAMES", "").split("|")
        if value.strip()
    }
    sources = (
        [
            source for source in configured_sources
            if source["name"].casefold() in requested_names
        ]
        if requested_names
        else configured_sources
    )

    if not sources:
        raise SystemExit(
            "Keine Quellen aus aggregate.py geladen."
        )

    results: list[dict[str, Any]] = []

    with ThreadPoolExecutor(
        max_workers=MAX_WORKERS,
    ) as executor:
        futures = {
            executor.submit(check_source, source): source
            for source in sources
        }

        for future in as_completed(futures):
            source = futures[future]

            try:
                result = future.result()
            except Exception as error:
                result = {
                    "name": source["name"],
                    "url": source.get("url", ""),
                    "status": "warning",
                    "ok": False,
                    "lastChecked": datetime.now(
                        timezone.utc
                    ).isoformat(),
                    "warning": f"Interner Prüffehler: {error}",
                    "categories": source.get("categories", []),
                    "languages": source.get("languages", []),
                    "originRegion": source.get("originRegion", ""),
                    "originCountry": source.get("originCountry", ""),
                    "originCountryCode": source.get("originCountryCode", ""),
                }

            results.append(result)
            print(
                f"[{result['status'].upper():7}] "
                f"{result['name']}"
            )

    if requested_names:
        previous_results = as_catalog_sources(
            read_json(REPORT_PATH, {})
        )

        def identities(item: dict[str, Any]) -> tuple[str, str]:
            return (
                canonical_url(str(item.get("url") or "")),
                str(item.get("name") or "").strip().casefold(),
            )

        checked_by_url = {
            identities(item)[0]: item
            for item in results
            if identities(item)[0]
        }
        checked_by_name = {
            identities(item)[1]: item
            for item in results
            if identities(item)[1]
        }
        previous_by_url = {
            identities(item)[0]: item
            for item in previous_results
            if identities(item)[0]
        }
        previous_by_name = {
            identities(item)[1]: item
            for item in previous_results
            if identities(item)[1]
        }

        merged_results: list[dict[str, Any]] = []
        for source in configured_sources:
            url_key, name_key = identities(source)
            existing = (
                checked_by_url.get(url_key)
                or checked_by_name.get(name_key)
                or previous_by_url.get(url_key)
                or previous_by_name.get(name_key)
            )
            if existing:
                item = {**existing}
                item["name"] = source["name"]
                item["url"] = source.get("url", "")
                item["categories"] = source.get("categories", [])
                item["languages"] = source.get("languages", [])
                for field in (
                    "originRegion",
                    "originCountry",
                    "originCountryCode",
                ):
                    item[field] = source.get(field, item.get(field, ""))
            else:
                item = {
                    "name": source["name"],
                    "url": source.get("url", ""),
                    "status": "unknown",
                    "ok": False,
                    "lastChecked": "",
                    "warning": "Prüfung wird beim nächsten vollständigen Lauf ergänzt.",
                    "categories": source.get("categories", []),
                    "languages": source.get("languages", []),
                    "originRegion": source.get("originRegion", ""),
                    "originCountry": source.get("originCountry", ""),
                    "originCountryCode": source.get("originCountryCode", ""),
                }
            merged_results.append(item)

        results = merged_results

    previous_history = read_recovery_json(HISTORY_PATH, {})
    results, history_document, recovery_report = apply_history(
        results,
        previous_history,
    )
    write_recovery_json(HISTORY_PATH, history_document)
    write_recovery_json(RECOVERY_REPORT_PATH, recovery_report)

    priority = {
        "error": 0,
        "warning": 1,
        "unknown": 2,
        "ok": 3,
    }

    results.sort(key=lambda item: (
        priority.get(item["status"], 2),
        item["name"].lower(),
    ))

    write_results(results)

    print(
        f"source-health.json geschrieben: "
        f"{len(results)} Quellen."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
