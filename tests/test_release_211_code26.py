from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / "android-wrapper"


def test_release_211_code26_metadata_is_consistent() -> None:
    config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
    worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    preview_worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
    app_check = (ROOT / "app-check.html").read_text(encoding="utf-8")
    diagnostics = (ROOT / "app-diagnostics.js").read_text(encoding="utf-8")
    selftest = (ROOT / "runtime-selftest.js").read_text(encoding="utf-8")
    gradle = (WRAPPER / "android/app/build.gradle").read_text(encoding="utf-8")
    package = json.loads((WRAPPER / "package.json").read_text(encoding="utf-8"))
    lock = json.loads((WRAPPER / "package-lock.json").read_text(encoding="utf-8"))
    roadmap = json.loads((ROOT / "ROADMAP.json").read_text(encoding="utf-8"))
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    checklist = (ROOT / "NEWS-APP-2-RELEASE-CHECKLIST.md").read_text(encoding="utf-8")

    for version in ("2.1.1", "2.1.1-dev.1-test", "2.1.1-dev.1-preview"):
        assert version in config
    assert "2026.08.20-wrn-2.1.1-release" in config
    assert "wrn-app-v2.1.1-r1" in worker and "wrn-data-v2.1.1-r1" in worker
    assert "`${CACHE_PREFIX}v87`" in preview_worker
    for release_contract in (app_check, diagnostics, selftest):
        assert "2.1.1" in release_contract

    assert "versionCode 26" in gradle
    assert 'versionName "2.1.1"' in gradle
    assert package["version"] == "2.1.1"
    assert lock["version"] == "2.1.1"
    assert lock["packages"][""]["version"] == "2.1.1"
    assert "Historische verifizierte Store-Baseline | 2.0.8" in readme
    assert "Aktuelle Live-/Verteilungs-AAB | 2.1.0, Code 25" in readme
    assert "Android / Google Play | 2.1.1, Code 26" in readme
    assert "2.1.0`/Code 25 als aktuellen signierten Live-/Verteilungsstand" in checklist
    assert roadmap["confirmedLiveDistribution"]["version"] == "2.1.0"
    assert roadmap["confirmedLiveDistribution"]["versionCode"] == 25
    assert roadmap["current"]["version"] == "2.1.1"


def test_consumed_code25_bindings_remain_historical() -> None:
    signer = (ROOT / "scripts/sign-google-play-aab-2.1.0-code25-gui.ps1").read_text(
        encoding="utf-8"
    )
    gradle = (WRAPPER / "android/app/build.gradle").read_text(encoding="utf-8")

    assert "hardening-2.1.0-code25-6a86e75" in signer
    assert "WorldRevolutionNews-2.1.0-code25-6a86e75-unsigned.aab" in signer
    assert "2.1.1" not in signer and "code26" not in signer.lower()
    assert "com.google.android.play:app-update:2.1.0" in gradle
