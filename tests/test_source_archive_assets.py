import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / "news-app-2.js").read_text(encoding="utf-8")
CONFIG = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
STYLE = (ROOT / "news-app-2.css").read_text(encoding="utf-8")
PREVIEW_WORKER = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8")
LIVE_WORKER = (ROOT / "service-worker.js").read_text(encoding="utf-8")
FAST_WORKFLOW = (ROOT / ".github" / "workflows" / "update-fast.yml").read_text(encoding="utf-8")
FULL_WORKFLOW = (ROOT / ".github" / "workflows" / "update.yml").read_text(encoding="utf-8")
MANIFEST = json.loads((ROOT / "news-archive-manifest.json").read_text(encoding="utf-8"))


for token in (
    "WRN_FORCE_EXISTING_ARTICLE_REFRESH",
    "WRN_NEWS_ARTICLE_LINKS",
):
    assert token not in SCRIPT

for token in (
    "newsArchiveManifest", "newsArchiveBase", "loadSelectedSourceArchives",
    "archive-source", "sourceArchiveCoverageState", "ARCHIVE_FILTERS_KEY",
    "selectedSources", "news-app-2-source-archive",
):
    assert token in SCRIPT or token in CONFIG, token

for token in (
    ".source-archive-panel", ".source-archive-source-list",
    ".source-archive-coverage--complete", "@media (max-width: 640px)",
):
    assert token in STYLE, token

for worker in (PREVIEW_WORKER, LIVE_WORKER):
    assert "news-archive-manifest.json" in worker
    assert "news-archive" in worker

for workflow in (FAST_WORKFLOW, FULL_WORKFLOW):
    assert "python build_source_archive.py" in workflow
    assert "git add news-archive-manifest.json news-archive/" in workflow

assert MANIFEST["schemaVersion"] == 1
assert MANIFEST["windowDays"] == 30
assert MANIFEST["sourceCount"] == len(MANIFEST["sources"])
assert MANIFEST["sourceCount"] >= 20
assert MANIFEST["itemCount"] >= 100

source_names = set()
for source in MANIFEST["sources"]:
    assert source["name"] not in source_names
    source_names.add(source["name"])
    assert source["coverage"] in {"complete", "partial"}
    assert source["trackingStartedAt"]
    assert source["itemCount"] >= 1
    path = ROOT / source["path"]
    assert path.is_file(), source["path"]
    payload = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(payload, list) and len(payload) == source["itemCount"]
    assert all(item.get("quelleName") == source["name"] for item in payload)

print(
    f"Source archive assets: {MANIFEST['itemCount']} articles in "
    f"{MANIFEST['sourceCount']} source chunks."
)
