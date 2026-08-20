#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]


def text(path: str) -> str:
    return (root / path).read_text(encoding="utf-8")


checker = text("check_news_sources.py")
normalizer = text("normalize_source_health.py")
workflow = text(".github/workflows/update.yml")
quality = text(".github/workflows/quality-gate.yml")
config = text("config.js")
worker = text("service-worker.js")
audio_assets_test = text("tests/test_audio_block2_assets.py")
module = text("source_recovery.py")
ui = text("source-recovery-ui-183.js")
css = text("source-recovery-ui-183.css")

for needle in (
    "apply_history",
    "discover_replacement_feed",
    "suspicious_redirect",
    "source-health-history.json",
    "source-recovery-report.json",
):
    assert needle in checker, needle

for field in (
    "rawStatus",
    "detailedState",
    "failureKind",
    "consecutiveFailures",
    "consecutiveRestrictions",
    "consecutiveSuccesses",
    "replacementUrl",
    "suspiciousRedirect",
):
    assert f'"{field}"' in normalizer, field

assert "source-health-history.json" in workflow
assert "source-recovery-report.json" in workflow
assert "python tests/run_contract_matrix.py" in quality
assert "const VERSION = '200-action-radar-1';" in config
assert "source-recovery-ui-183.js" in config
assert "source-recovery-ui-183.css" in config
assert "wrn-app-v2.1.0-r4" in worker
assert "wrn-data-v2.1.0-r2" in worker
assert "source-recovery-ui-183.js" in worker
assert "source-recovery-ui-183.css" in worker
assert 'wrn-app-v2.1.0-r4' in audio_assets_test
assert 'wrn-app-v1.8.3-b2' not in audio_assets_test

assert '"automaticDeletion": False' in module
assert "PERMANENT_FAILURE_THRESHOLD = 4" in module
assert "PERMANENT_FAILURE_MIN_AGE = timedelta(hours=12)" in module
assert "never edits or deletes the canonical source registry" in module
assert "cross-domain" in module.lower()
assert "unlink(" not in module
assert "rmtree(" not in module

for state in (
    "available",
    "recovered",
    "temporarily_restricted",
    "website_reachable_feed_broken",
    "feed_broken_unconfirmed",
    "permanently_broken",
    "not_checked",
):
    assert state in ui, state

assert "data-recovery-candidate" in ui
assert "localStorage.clear(" not in ui
assert "caches.delete(" not in ui
assert "data-recovery-state" in css

print("source recovery asset tests: passed")
