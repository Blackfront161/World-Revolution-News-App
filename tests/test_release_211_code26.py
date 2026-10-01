from __future__ import annotations

import json
import importlib.util
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / "android-wrapper"


def test_preview_cache_diagnostic_matches_rejected_contract(monkeypatch) -> None:
    spec = importlib.util.spec_from_file_location("wrn_preview_cache_diagnostic", ROOT / "tests/validate_app.py")
    assert spec and spec.loader
    validator = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(validator)
    preview_path = ROOT / "news-app-2-sw.js"
    preview = preview_path.read_text(encoding="utf-8")
    generation = re.search(r"const CACHE_NAME = `\$\{CACHE_PREFIX\}(v\d+)`;", preview)
    assert generation
    expected = generation.group(1)
    marker = f"`${{CACHE_PREFIX}}{expected}`"
    assert marker in preview

    validator.check_phase1k_release_fixes()
    assert validator.ERRORS == [], "validator must accept the actual current worker"

    original_read = Path.read_text

    def read_with_stale_preview(path, *args, **kwargs):
        if path == preview_path:
            return preview.replace(marker, "`${CACHE_PREFIX}stale`", 1)
        return original_read(path, *args, **kwargs)

    monkeypatch.setattr(Path, "read_text", read_with_stale_preview)
    validator.check_phase1k_release_fixes()
    assert validator.ERRORS == [
        f"Vorschaupfad des 2.1-Entwicklungsworkers muss Cache {expected} verwenden."
    ], "a rejected worker must report the same cache generation that the validator enforces"


def test_current_release_metadata_is_consistent() -> None:
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

    for version in ("2.1.2", "2.1.2-dev.1-test", "2.1.2-dev.1-preview"):
        assert version in config
    assert "2026.09.27-wrn-2.1.2-release" in config
    assert "wrn-app-v2.1.2-r10" in worker and "wrn-data-v2.1.2-r1" in worker
    assert "`${CACHE_PREFIX}v98`" in preview_worker
    for release_contract in (app_check, diagnostics, selftest):
        assert "2.1.2" in release_contract

    assert "versionCode 29" in gradle
    assert 'versionName "2.1.2"' in gradle
    assert package["version"] == "2.1.2"
    assert lock["version"] == "2.1.2"
    assert lock["packages"][""]["version"] == "2.1.2"
    assert "Historische verifizierte Store-Baseline | 2.0.8" in readme
    assert "Aktuelle Live-/Verteilungs-AAB | 2.1.2, Code 28" in readme
    assert "Android / Google Play | 2.1.2, Code 32" in readme
    assert "2.1.0`/Code 25 als aktuellen signierten Live-/Verteilungsstand" in checklist
    assert roadmap["confirmedLiveDistribution"]["version"] == "2.1.2"
    assert roadmap["confirmedLiveDistribution"]["versionCode"] == 28
    assert roadmap["current"]["version"] == "2.1.2"


def test_consumed_code25_bindings_remain_historical() -> None:
    signer = (ROOT / "scripts/sign-google-play-aab-2.1.0-code25-gui.ps1").read_text(
        encoding="utf-8"
    )
    gradle = (WRAPPER / "android/app/build.gradle").read_text(encoding="utf-8")

    assert "hardening-2.1.0-code25-6a86e75" in signer
    assert "WorldRevolutionNews-2.1.0-code25-6a86e75-unsigned.aab" in signer
    assert "2.1.1" not in signer and "code26" not in signer.lower()
    assert "com.google.android.play:app-update:2.1.0" in gradle
