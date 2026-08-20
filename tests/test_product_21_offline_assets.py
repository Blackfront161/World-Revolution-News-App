from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
PREVIEW = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
PRODUCTION = (ROOT / "service-worker.js").read_text(encoding="utf-8")
APP_CHECK = (ROOT / "app-check.html").read_text(encoding="utf-8")

SCRIPTS = (
    "./wrn-product-21.js?release=1",
    "./source-passport-21.js?release=1",
)
DATASET = "./verified-solidarity-actions.json"


def test_preview_worker_precaches_product_21_and_bumps_cache():
    assert "`${CACHE_PREFIX}v87`" in PREVIEW
    assert "`${CACHE_PREFIX}v86`" not in PREVIEW
    for asset in SCRIPTS:
        assert f"'{asset}'" in PREVIEW
    assert f"'{DATASET}'" in PREVIEW
    assert "new URL('./verified-solidarity-actions.json'" in PREVIEW
    assert '"actions":[]' in PREVIEW


def test_production_worker_caches_scripts_and_routes_dataset_offline():
    for asset in SCRIPTS:
        assert f"'{asset}'" in PRODUCTION
    assert f"'{DATASET}'" in PRODUCTION
    assert "new URL('./verified-solidarity-actions.json'" in PRODUCTION
    assert '"actions":[]' in PRODUCTION
    assert "const appCache = await caches.open(APP_CACHE);" in PRODUCTION
    assert "stripReservedFallbackHeader(cached) || stripReservedFallbackHeader(preloaded) || new Response" in PRODUCTION


def test_workers_keep_distinct_cache_names():
    preview_cache = re.search(r"CACHE_NAME = `\$\{CACHE_PREFIX\}(v\d+)`", PREVIEW)
    production_app = re.search(r"APP_CACHE = '([^']+)'", PRODUCTION)
    production_data = re.search(r"DATA_CACHE = '([^']+)'", PRODUCTION)
    assert preview_cache and preview_cache.group(1) == "v87"
    assert production_app and production_data
    assert production_app.group(1) == "wrn-app-v2.1.1-r1"
    assert production_data.group(1) == "wrn-data-v2.1.1-r1"
    assert "wrn-app-v2.1.1-dev.1-r1" not in PRODUCTION
    assert "wrn-data-v2.1.1-dev.1-r1" not in PRODUCTION
    assert production_app.group(1) != production_data.group(1)


def test_app_check_cache_expectations_match_the_production_worker():
    for worker_name, page_name in (
        ("APP_CACHE", "EXPECTED_APP_CACHE"),
        ("DATA_CACHE", "EXPECTED_DATA_CACHE"),
    ):
        worker_value = re.search(rf"const {worker_name} = '([^']+)'", PRODUCTION)
        page_value = re.search(rf"const {page_name} = '([^']+)'", APP_CHECK)
        assert worker_value and page_value
        assert page_value.group(1) == worker_value.group(1)


def test_solidarity_network_assets_are_offline_in_both_workers():
    for worker in (PREVIEW, PRODUCTION):
        for asset in (
            "solidarity-network-21.js?release=6",
            "solidarity-network.json",
            "solidarity-resources.json",
        ):
            assert asset in worker
        assert "Offline fallback: no verified profiles available." in worker
        assert '"fallbackContext"' not in worker
        assert "X-WRN-Synthetic-Offline-Fallback" in worker
        assert "solidarity-network-empty-v1" in worker
        assert "Offline fallback: no verified resources available." in worker


def test_worker_updates_replace_old_cache_versions_and_core_revisions():
    assert "news-app-2.js?release=48" in PREVIEW
    assert "news-app-2.js?release=48" in PRODUCTION
    assert "news-app-2.js?release=42" not in PREVIEW
    assert "news-app-2.js?release=42" not in PRODUCTION
    assert ".filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)" in PREVIEW
    assert "const keep = new Set([APP_CACHE, DATA_CACHE]);" in PRODUCTION
    assert "name.startsWith(APP_CACHE_PREFIX)" in PRODUCTION
    assert "name.startsWith(DATA_CACHE_PREFIX)" in PRODUCTION
    assert "&& !keep.has(name)" in PRODUCTION
