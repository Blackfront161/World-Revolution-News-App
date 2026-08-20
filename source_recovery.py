#!/usr/bin/env python3
"""WRN 1.8.3 source recovery helpers.

This module deliberately never edits or deletes the canonical source registry.
It classifies repeated checks, records history, and proposes replacement feed
URLs for human review.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
from typing import Any, Iterable
from urllib.parse import parse_qs, unquote, urljoin, urlsplit, urlunsplit


SCHEMA_VERSION = 1
PERMANENT_FAILURE_THRESHOLD = 4
PERMANENT_FAILURE_MIN_AGE = timedelta(hours=12)
RECOVERY_CONNECT_TIMEOUT = 5
RECOVERY_READ_TIMEOUT = 8
RECOVERY_MAX_BYTES = 131072
RECOVERY_MAX_REQUESTS = 7

TEMPORARY_HTTP_STATUSES = {401, 403, 408, 409, 425, 429}
HARD_HTTP_STATUSES = {404, 410}
COMMON_FEED_PATHS = (
    "/feed/",
    "/feed",
    "/rss",
    "/rss.xml",
    "/feed.xml",
    "/atom.xml",
    "/?feed=rss2",
)


class AlternateFeedParser(HTMLParser):
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
        media_type = values.get("type", "").lower()
        href = values.get("href", "").strip()

        if (
            href
            and "alternate" in rel
            and any(token in media_type for token in (
                "rss",
                "atom",
                "feed+json",
                "application/xml",
                "text/xml",
            ))
        ):
            self.links.append(href)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(value: datetime | None) -> str:
    if value is None:
        return ""
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


def parse_time(value: Any) -> datetime | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def read_json(path: Path, fallback: Any) -> Any:
    if not path.is_file():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def canonical_url(value: Any) -> str:
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


def canonical_name(value: Any) -> str:
    return re.sub(
        r"[^a-z0-9]+",
        "",
        str(value or "").lower(),
    )


def source_identity(item: dict[str, Any]) -> str:
    name = str(item.get("name") or "source").strip()
    original_url = str(
        item.get("previousUrl")
        or item.get("configuredUrl")
        or item.get("url")
        or ""
    ).strip()
    raw = f"{canonical_name(name)}::{canonical_url(original_url)}"
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:18]
    return f"source-{digest}"


def host_of(value: Any) -> str:
    try:
        return (urlsplit(str(value or "")).hostname or "").lower().removeprefix("www.")
    except ValueError:
        return ""


def same_site(first: Any, second: Any) -> bool:
    a = host_of(first)
    b = host_of(second)
    if not a or not b:
        return False
    return a == b or a.endswith(f".{b}") or b.endswith(f".{a}")


def unwrap_proxy_url(value: Any) -> str:
    raw = str(value or "").strip()
    match = re.match(r"^https?://morss\.it/(https?://.+)$", raw, flags=re.I)
    return unquote(match.group(1)) if match else raw


def sanitize_oembed_url(value: Any) -> str:
    raw = str(value or "").strip()
    if "/wp-json/oembed/" not in raw:
        return raw
    try:
        parsed = urlsplit(raw)
        target = parse_qs(parsed.query).get("url", [""])[0]
        return unquote(target).strip() or raw
    except Exception:
        return raw


def looks_like_feed(payload: bytes, content_type: str = "") -> tuple[bool, str]:
    sample = bytes(payload or b"").lstrip()
    lowered = sample.lower()
    media_type = str(content_type or "").lower()

    if not sample:
        return False, "empty"
    if any(token in lowered for token in (
        b"<rss",
        b"<feed",
        b"<rdf:rdf",
        b"<channel",
    )):
        return True, "xml"
    if (
        "application/feed+json" in media_type
        or (
            "application/json" in media_type
            and (b'"items"' in lowered or b'"version"' in lowered)
        )
    ):
        return True, "json"
    return False, "unexpected"


def _read_response(response: Any) -> bytes:
    content = getattr(response, "content", b"") or b""
    return bytes(content[:RECOVERY_MAX_BYTES])


def _response_type(response: Any) -> str:
    headers = getattr(response, "headers", {}) or {}
    return str(headers.get("Content-Type", "") or "")


def _safe_status(response: Any) -> int:
    try:
        return int(getattr(response, "status_code", 0) or 0)
    except (TypeError, ValueError):
        return 0


def _candidate_roots(source: dict[str, Any], failing_url: str) -> list[str]:
    values = [
        source.get("pageUrl"),
        source.get("homepage"),
        source.get("website"),
        unwrap_proxy_url(failing_url),
    ]
    result: list[str] = []

    for value in values:
        raw = sanitize_oembed_url(value)
        if not raw:
            continue
        try:
            parsed = urlsplit(raw)
        except ValueError:
            continue
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            continue
        root = urlunsplit((parsed.scheme, parsed.netloc, "/", "", ""))
        for candidate in (raw, root):
            if candidate not in result:
                result.append(candidate)

    return result


def _alternate_links(response: Any, payload: bytes) -> list[str]:
    parser = AlternateFeedParser()
    try:
        encoding = getattr(response, "encoding", None) or "utf-8"
        parser.feed(payload.decode(encoding, errors="replace"))
    except Exception:
        return []
    base = str(getattr(response, "url", "") or "")
    return [urljoin(base, link) for link in parser.links]


def discover_replacement_feed(
    session: Any,
    source: dict[str, Any],
    failing_url: str,
) -> dict[str, Any] | None:
    """Return a same-site feed candidate without mutating the source registry.

    Cross-domain redirects are intentionally not accepted automatically. They are
    returned by the normal checker as manual-review cases instead.
    """

    configured = str(failing_url or source.get("url") or "").strip()
    candidates: list[tuple[str, str]] = []

    def add(url: Any, reason: str) -> None:
        clean = sanitize_oembed_url(url)
        if not clean or canonical_url(clean) == canonical_url(configured):
            return
        if any(canonical_url(existing) == canonical_url(clean) for existing, _ in candidates):
            return
        candidates.append((clean, reason))

    unwrapped = unwrap_proxy_url(configured)
    if canonical_url(unwrapped) != canonical_url(configured):
        add(unwrapped, "proxy-unwrapped")

    roots = _candidate_roots(source, configured)
    for root in roots:
        add(root, "homepage")
        try:
            parsed = urlsplit(root)
        except ValueError:
            continue
        origin = urlunsplit((parsed.scheme, parsed.netloc, "/", "", ""))
        for path in COMMON_FEED_PATHS:
            add(urljoin(origin, path), "common-path")

    requests_made = 0
    queue = list(candidates)
    visited: set[str] = set()

    while queue and requests_made < RECOVERY_MAX_REQUESTS:
        candidate, reason = queue.pop(0)
        key = canonical_url(candidate)
        if not key or key in visited:
            continue
        visited.add(key)
        requests_made += 1

        try:
            response = session.get(
                candidate,
                timeout=(RECOVERY_CONNECT_TIMEOUT, RECOVERY_READ_TIMEOUT),
                allow_redirects=True,
            )
        except Exception:
            continue

        status = _safe_status(response)
        if not 200 <= status < 400:
            continue

        final_url = str(getattr(response, "url", candidate) or candidate)
        payload = _read_response(response)
        valid, feed_type = looks_like_feed(payload, _response_type(response))

        if valid:
            if configured and not same_site(configured, final_url):
                continue
            return {
                "url": final_url,
                "feedType": feed_type,
                "reason": reason,
                "requests": requests_made,
            }

        for alternate in _alternate_links(response, payload):
            if configured and not same_site(configured, alternate):
                continue
            alt_key = canonical_url(alternate)
            if alt_key and alt_key not in visited:
                queue.insert(0, (alternate, "html-alternate"))

    return None


def suspicious_redirect(original_url: Any, final_url: Any) -> bool:
    original = str(original_url or "").strip()
    final = str(final_url or "").strip()
    if not original or not final:
        return False
    if canonical_url(original) == canonical_url(final):
        return False
    return not same_site(unwrap_proxy_url(original), final)


def failure_kind(result: dict[str, Any]) -> str:
    raw_status = str(result.get("status") or "unknown").lower()
    http_status = int(result.get("httpStatus") or 0)
    message = " ".join(str(result.get(key) or "") for key in (
        "warning",
        "error",
        "message",
        "reason",
    )).lower()
    feed_type = str(result.get("feedType") or "").lower()

    if raw_status == "ok" or result.get("ok") is True:
        return "available"
    if result.get("pageOnly"):
        return "page_only"
    if result.get("accessRestricted"):
        return "temporary_restriction"
    if raw_status == "unknown" or "keine technische feed-adresse" in message:
        return "not_checked"
    if result.get("suspiciousRedirect"):
        return "suspicious_redirect"
    if http_status in TEMPORARY_HTTP_STATUSES or http_status >= 500:
        return "temporary_restriction"
    if any(token in message for token in (
        "timeout",
        "zeitüberschreitung",
        "temporär",
        "temporary",
        "tls",
        "ssl",
        "certificate",
        "zertifikat",
        "rate limit",
        "max retries",
    )):
        return "temporary_restriction"
    if 200 <= http_status < 400 and feed_type in {"unexpected", "empty"}:
        return "website_feed_broken"
    if http_status in HARD_HTTP_STATUSES:
        return "missing_feed"
    if any(token in message for token in (
        "dns",
        "name resolution",
        "name or service not known",
        "getaddrinfo",
        "domainfehler",
        "invalid feed",
        "feed nicht gefunden",
    )):
        return "hard_failure"
    if raw_status == "error":
        return "hard_failure"
    return "temporary_restriction"


def _history_sources(history: Any) -> dict[str, dict[str, Any]]:
    if isinstance(history, dict) and isinstance(history.get("sources"), dict):
        return {
            str(key): value
            for key, value in history["sources"].items()
            if isinstance(value, dict)
        }
    if isinstance(history, dict):
        return {
            str(key): value
            for key, value in history.items()
            if isinstance(value, dict)
        }
    return {}


def _previous_for(
    history: dict[str, dict[str, Any]],
    result: dict[str, Any],
) -> dict[str, Any]:
    identity = source_identity(result)
    if identity in history:
        return history[identity]
    target_name = canonical_name(result.get("name"))
    for previous in history.values():
        if canonical_name(previous.get("name")) == target_name:
            return previous
    return {}


def classify_result(
    result: dict[str, Any],
    previous: dict[str, Any] | None = None,
    now: datetime | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    previous = dict(previous or {})
    checked_at = parse_time(result.get("lastChecked")) or now or utc_now()
    kind = failure_kind(result)
    raw_status = str(result.get("status") or "unknown").lower()

    failures = int(previous.get("consecutiveFailures") or 0)
    restrictions = int(previous.get("consecutiveRestrictions") or 0)
    successes = int(previous.get("consecutiveSuccesses") or 0)
    first_failure = parse_time(previous.get("firstFailureAt"))
    last_success = parse_time(previous.get("lastSuccessAt"))
    last_failure = parse_time(previous.get("lastFailureAt"))

    detailed = "not_checked"
    legacy_status = "unknown"

    if kind == "available":
        detailed = "recovered" if failures or restrictions else "available"
        legacy_status = "ok"
        successes += 1
        failures = 0
        restrictions = 0
        first_failure = None
        last_success = checked_at
    elif kind == "not_checked":
        detailed = "not_checked"
        legacy_status = "unknown"
        successes = 0
        failures = 0
        restrictions = 0
        first_failure = None
    elif kind == "page_only":
        detailed = "website_available_without_feed"
        legacy_status = "warning"
        successes = 0
        failures = 0
        restrictions = 0
        first_failure = None
    elif kind == "temporary_restriction":
        detailed = "temporarily_restricted"
        legacy_status = "warning"
        successes = 0
        failures = 0
        restrictions += 1
        first_failure = None
        last_failure = checked_at
    else:
        successes = 0
        restrictions = 0
        failures += 1
        first_failure = first_failure or checked_at
        last_failure = checked_at
        old_enough = checked_at - first_failure >= PERMANENT_FAILURE_MIN_AGE
        permanent = failures >= PERMANENT_FAILURE_THRESHOLD and old_enough

        if permanent:
            detailed = "permanently_broken"
            legacy_status = "error"
        elif kind == "website_feed_broken":
            detailed = "website_reachable_feed_broken"
            legacy_status = "warning"
        else:
            detailed = "feed_broken_unconfirmed"
            legacy_status = "warning"

    updated = dict(result)
    updated["rawStatus"] = raw_status
    updated["failureKind"] = kind
    updated["detailedState"] = detailed
    updated["status"] = legacy_status
    updated["ok"] = legacy_status == "ok"
    updated["consecutiveFailures"] = failures
    updated["consecutiveRestrictions"] = restrictions
    updated["lastChecked"] = iso(checked_at)
    if first_failure:
        updated["firstFailureAt"] = iso(first_failure)
    else:
        updated.pop("firstFailureAt", None)
    if last_failure:
        updated["lastFailureAt"] = iso(last_failure)
    if last_success:
        updated["lastSuccessAt"] = iso(last_success)

    history_row = {
        "name": str(updated.get("name") or ""),
        "url": str(updated.get("previousUrl") or updated.get("url") or ""),
        "lastState": detailed,
        "failureKind": kind,
        "consecutiveFailures": failures,
        "consecutiveRestrictions": restrictions,
        "consecutiveSuccesses": successes,
        "lastChecked": iso(checked_at),
        "firstFailureAt": iso(first_failure),
        "lastFailureAt": iso(last_failure),
        "lastSuccessAt": iso(last_success),
    }
    history_row = {
        key: value
        for key, value in history_row.items()
        if value not in (None, "")
    }
    return updated, history_row


def apply_history(
    results: Iterable[dict[str, Any]],
    previous_history: Any,
    now: datetime | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    previous = _history_sources(previous_history)
    classified: list[dict[str, Any]] = []
    # Keep older history rows as well. A temporarily absent source must not
    # silently lose its previous checks or disappear from the recovery record.
    current_history: dict[str, dict[str, Any]] = {
        key: dict(value)
        for key, value in previous.items()
    }

    for item in results:
        row = dict(item)
        old = _previous_for(previous, row)
        updated, history_row = classify_result(row, old, now=now)
        identity = source_identity(updated)
        classified.append(updated)
        current_history[identity] = history_row

    generated_at = iso(now or utc_now())
    history_document = {
        "schemaVersion": SCHEMA_VERSION,
        "generatedAt": generated_at,
        "sources": current_history,
    }

    states = {
        "available": 0,
        "recovered": 0,
        "temporarily_restricted": 0,
        "website_reachable_feed_broken": 0,
        "feed_broken_unconfirmed": 0,
        "permanently_broken": 0,
        "not_checked": 0,
    }
    candidates: list[dict[str, Any]] = []
    manual_review: list[dict[str, Any]] = []

    for item in classified:
        state = str(item.get("detailedState") or "not_checked")
        states[state] = states.get(state, 0) + 1
        if item.get("replacementUrl"):
            candidates.append({
                "name": item.get("name", ""),
                "configuredUrl": item.get("previousUrl") or item.get("url", ""),
                "replacementUrl": item.get("replacementUrl", ""),
                "checkedAt": item.get("lastChecked", ""),
            })
        if item.get("suspiciousRedirect") or state in {
            "feed_broken_unconfirmed",
            "permanently_broken",
            "website_reachable_feed_broken",
        }:
            manual_review.append({
                "name": item.get("name", ""),
                "url": item.get("previousUrl") or item.get("url", ""),
                "state": state,
                "failureKind": item.get("failureKind", ""),
                "consecutiveFailures": item.get("consecutiveFailures", 0),
                "replacementUrl": item.get("replacementUrl", ""),
                "finalUrl": item.get("finalUrl", ""),
            })

    report = {
        "schemaVersion": SCHEMA_VERSION,
        "generatedAt": generated_at,
        "policy": {
            "automaticDeletion": False,
            "permanentFailureThreshold": PERMANENT_FAILURE_THRESHOLD,
            "permanentFailureMinimumHours": int(
                PERMANENT_FAILURE_MIN_AGE.total_seconds() // 3600
            ),
            "crossDomainReplacementRequiresReview": True,
        },
        "summary": states,
        "replacementCandidates": candidates,
        "manualReview": manual_review,
    }
    return classified, history_document, report


def merge_discovered_feeds(
    previous: Any,
    results: Iterable[dict[str, Any]],
) -> dict[str, str]:
    merged: dict[str, str] = {}
    if isinstance(previous, dict):
        for name, value in previous.items():
            if isinstance(value, str) and value.strip():
                merged[str(name)] = value.strip()
            elif isinstance(value, dict):
                url = str(value.get("url") or value.get("replacementUrl") or "").strip()
                if url:
                    merged[str(name)] = url

    for item in results:
        name = str(item.get("name") or "").strip()
        candidate = str(item.get("replacementUrl") or "").strip()
        if name and candidate:
            merged[name] = candidate
    return dict(sorted(merged.items(), key=lambda pair: pair[0].lower()))
