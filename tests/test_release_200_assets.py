from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

legacy_config = (ROOT / "config.js").read_text(encoding="utf-8")
release_config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
radar = (ROOT / "action-radar.js").read_text(encoding="utf-8")
editorial = (ROOT / "editorial-review-ui.js").read_text(encoding="utf-8")
freshness = (ROOT / "source-health-freshness.js").read_text(encoding="utf-8")
checker = (ROOT / "check_news_sources.py").read_text(encoding="utf-8")
roadmap = json.loads((ROOT / "ROADMAP.json").read_text(encoding="utf-8"))

assert "? '2.1.0'" in release_config
assert "wrn-app-v2.1.0-r4" in worker
assert "action-radar.js" in legacy_config and "action-radar.js" in worker
assert "editorial-review-ui.js" in legacy_config and "editorial-review-ui.js" in worker
assert "source-health-freshness.js" in legacy_config and "source-health-freshness.js" in worker

for language in ("de", "en", "es", "fr", "it", "pt", "ru", "el", "tr"):
    assert f"{language}:" in radar
    assert f"{language}:" in editorial
    assert f"{language}:" in freshness

for token in (
    "navigator.geolocation",
    "wrn_event_reminders_v2",
    "Notification.requestPermission",
    "distanceKm",
    "openstreetmap.org",
):
    assert token in radar

for token in (
    "wrn_editorial_review_decisions_v2",
    "editorial-review.json",
    "exportDecisions",
    "wrn-more-admin-tools-184",
):
    assert token in editorial

assert "timedelta(hours=12)" in checker
assert '"freshUntil"' in checker
assert '"workflowIntervalHours": 4' in checker
assert '"expiredResultsAreNotPresentedAsCurrent": True' in checker

assert roadmap["current"]["version"] == "2.1.0"
assert roadmap["current"]["status"].startswith("Lokaler Produktionskandidat")
assert "serverseitige Standortverfolgung" in roadmap["excluded"]

loader_block = legacy_config[legacy_config.index("const loadCore"):legacy_config.index("openLandingTab();", legacy_config.index("const loadCore"))]
assert "alternative-social-media.js" not in loader_block

print("WRN 2.1 production-candidate assets: OK")
