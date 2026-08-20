#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "source_recovery.py"
spec = importlib.util.spec_from_file_location("source_recovery", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = module
spec.loader.exec_module(module)

NOW = datetime(2026, 7, 22, 12, 0, tzinfo=timezone.utc)


def raw(name: str, status: str, **extra):
    return {
        "name": name,
        "url": f"https://example.org/{name.lower()}/feed",
        "status": status,
        "ok": status == "ok",
        "lastChecked": NOW.isoformat(),
        **extra,
    }


def test_first_hard_failure_is_not_permanent():
    classified, history, report = module.apply_history(
        [raw("Alpha", "error", httpStatus=404, error="Feed nicht gefunden")],
        {},
        now=NOW,
    )
    row = classified[0]
    assert row["status"] == "warning"
    assert row["detailedState"] == "feed_broken_unconfirmed"
    assert row["consecutiveFailures"] == 1
    assert report["summary"]["permanently_broken"] == 0
    assert report["policy"]["automaticDeletion"] is False
    assert len(history["sources"]) == 1


def test_permanent_requires_count_and_time():
    row = raw("Alpha", "error", httpStatus=404, error="Feed nicht gefunden")
    identity = module.source_identity(row)
    previous = {
        "schemaVersion": 1,
        "sources": {
            identity: {
                "name": "Alpha",
                "url": row["url"],
                "consecutiveFailures": 3,
                "firstFailureAt": (NOW - timedelta(hours=13)).isoformat(),
                "lastFailureAt": (NOW - timedelta(hours=4)).isoformat(),
            }
        },
    }
    classified, _, report = module.apply_history([row], previous, now=NOW)
    assert classified[0]["detailedState"] == "permanently_broken"
    assert classified[0]["status"] == "error"
    assert classified[0]["consecutiveFailures"] == 4
    assert report["summary"]["permanently_broken"] == 1


def test_four_fast_failures_still_not_permanent():
    row = raw("Alpha", "error", httpStatus=410, error="Feed gone")
    identity = module.source_identity(row)
    previous = {
        "sources": {
            identity: {
                "name": "Alpha",
                "url": row["url"],
                "consecutiveFailures": 3,
                "firstFailureAt": (NOW - timedelta(hours=6)).isoformat(),
            }
        }
    }
    classified, _, _ = module.apply_history([row], previous, now=NOW)
    assert classified[0]["detailedState"] == "feed_broken_unconfirmed"
    assert classified[0]["status"] == "warning"


def test_temporary_restriction_never_becomes_permanent():
    row = raw("Beta", "warning", httpStatus=403, warning="Quelle eingeschränkt")
    identity = module.source_identity(row)
    previous = {
        "sources": {
            identity: {
                "name": "Beta",
                "url": row["url"],
                "consecutiveRestrictions": 99,
                "firstFailureAt": (NOW - timedelta(days=30)).isoformat(),
            }
        }
    }
    classified, _, _ = module.apply_history([row], previous, now=NOW)
    assert classified[0]["detailedState"] == "temporarily_restricted"
    assert classified[0]["status"] == "warning"
    assert classified[0]["consecutiveRestrictions"] == 100
    assert classified[0]["consecutiveFailures"] == 0


def test_recovery_resets_failures():
    row = raw("Gamma", "ok", httpStatus=200, feedType="xml")
    identity = module.source_identity(row)
    previous = {
        "sources": {
            identity: {
                "name": "Gamma",
                "url": row["url"],
                "consecutiveFailures": 3,
                "firstFailureAt": (NOW - timedelta(days=2)).isoformat(),
            }
        }
    }
    classified, history, report = module.apply_history([row], previous, now=NOW)
    result = classified[0]
    assert result["detailedState"] == "recovered"
    assert result["status"] == "ok"
    assert result["consecutiveFailures"] == 0
    history_row = next(iter(history["sources"].values()))
    assert history_row["consecutiveFailures"] == 0
    assert report["summary"]["recovered"] == 1


def test_reachable_html_is_separate_state():
    classified, _, _ = module.apply_history([
        raw(
            "Delta",
            "warning",
            httpStatus=200,
            feedType="unexpected",
            warning="Adresse erreichbar, Antwort nicht eindeutig als Feed erkannt.",
        )
    ], {}, now=NOW)
    assert classified[0]["detailedState"] == "website_reachable_feed_broken"
    assert classified[0]["status"] == "warning"


def test_unknown_does_not_count_as_failure():
    classified, _, _ = module.apply_history([
        raw("Epsilon", "unknown", warning="Keine technische Feed-Adresse vorhanden.")
    ], {}, now=NOW)
    assert classified[0]["detailedState"] == "not_checked"
    assert classified[0]["consecutiveFailures"] == 0


def test_page_only_source_is_checked_without_becoming_defective():
    classified, _, _ = module.apply_history([raw(
        "Page only",
        "warning",
        pageOnly=True,
        httpStatus=200,
        warning="Website geprüft und erreichbar; kein technischer Feed vorhanden.",
    )], {}, now=NOW)
    assert classified[0]["detailedState"] == "website_available_without_feed"
    assert classified[0]["status"] == "warning"
    assert classified[0]["consecutiveFailures"] == 0
    assert classified[0]["consecutiveRestrictions"] == 0


def test_http_200_bot_challenge_remains_temporary():
    row = raw(
        "Protected",
        "warning",
        accessRestricted=True,
        httpStatus=200,
        feedType="unexpected",
        warning="Quelle erreichbar, automatischer Abruf durch Bot-Schutz eingeschränkt.",
    )
    identity = module.source_identity(row)
    previous = {
        "sources": {
            identity: {
                "name": "Protected",
                "url": row["url"],
                "consecutiveFailures": 12,
                "firstFailureAt": (NOW - timedelta(days=7)).isoformat(),
            }
        }
    }
    classified, _, _ = module.apply_history([row], previous, now=NOW)
    assert classified[0]["detailedState"] == "temporarily_restricted"
    assert classified[0]["status"] == "warning"
    assert classified[0]["consecutiveFailures"] == 0


def test_cross_domain_redirect_is_suspicious():
    assert module.suspicious_redirect(
        "https://example.org/feed",
        "https://casino.invalid/feed",
    )
    assert not module.suspicious_redirect(
        "https://www.example.org/feed",
        "https://news.example.org/rss",
    )


def test_history_rows_are_preserved_when_source_is_absent():
    previous = {
        "sources": {
            "source-old": {
                "name": "Old Source",
                "url": "https://old.example/feed",
                "consecutiveFailures": 2,
                "lastState": "feed_broken_unconfirmed",
            }
        }
    }
    _, history, _ = module.apply_history(
        [raw("Current", "ok", httpStatus=200, feedType="xml")],
        previous,
        now=NOW,
    )
    assert "source-old" in history["sources"]
    assert history["sources"]["source-old"]["consecutiveFailures"] == 2


def test_discovered_candidates_are_preserved():
    merged = module.merge_discovered_feeds(
        {"Old": "https://old.example/feed"},
        [{
            "name": "New",
            "replacementUrl": "https://new.example/rss",
        }],
    )
    assert merged == {
        "New": "https://new.example/rss",
        "Old": "https://old.example/feed",
    }


class FakeResponse:
    def __init__(self, url, status, body, content_type="text/html"):
        self.url = url
        self.status_code = status
        self.content = body
        self.headers = {"Content-Type": content_type}
        self.encoding = "utf-8"


class FakeSession:
    def __init__(self, responses):
        self.responses = responses
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append(url)
        if url not in self.responses:
            return FakeResponse(url, 404, b"")
        return self.responses[url]


def test_same_site_html_alternate_discovery():
    homepage = "https://example.org/"
    alternate = "https://example.org/news.xml"
    session = FakeSession({
        homepage: FakeResponse(
            homepage,
            200,
            b'<html><head><link rel="alternate" type="application/rss+xml" href="/news.xml"></head></html>',
        ),
        alternate: FakeResponse(
            alternate,
            200,
            b"<rss><channel></channel></rss>",
            "application/rss+xml",
        ),
    })
    result = module.discover_replacement_feed(
        session,
        {"name": "Example", "pageUrl": homepage},
        "https://example.org/old-feed",
    )
    assert result is not None
    assert result["url"] == alternate
    assert result["reason"] == "html-alternate"


def test_cross_domain_candidate_is_rejected():
    homepage = "https://example.org/"
    evil = "https://other.invalid/rss"
    session = FakeSession({
        homepage: FakeResponse(
            homepage,
            200,
            f'<link rel="alternate" type="application/rss+xml" href="{evil}">'.encode(),
        ),
        evil: FakeResponse(evil, 200, b"<rss></rss>", "application/rss+xml"),
    })
    result = module.discover_replacement_feed(
        session,
        {"name": "Example", "pageUrl": homepage},
        "https://example.org/old-feed",
    )
    assert result is None


if __name__ == "__main__":
    tests = [value for name, value in sorted(globals().items()) if name.startswith("test_")]
    for test in tests:
        test()
    print(f"source recovery tests: {len(tests)} passed")
