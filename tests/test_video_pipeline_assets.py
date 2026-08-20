from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(name: str):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def main() -> None:
    for name in (
        "video-pipeline-core.js",
        "video-sources-registry.json",
        "video-editorial-seed.json",
        "video-feed.json",
        "video-health.json",
        "scripts/build_video_feed.js",
        "VIDEO-PIPELINE.md",
    ):
        assert (ROOT / name).exists(), f"missing video pipeline asset: {name}"

    registry = load("video-sources-registry.json")
    sources = registry["sources"]
    ids = [source["id"] for source in sources]
    assert len(ids) == len(set(ids))
    assert len(sources) >= 6
    for source in sources:
        assert source["editorialStatus"].startswith("approved")
        assert source["platform"] in {"YouTube", "Vimeo", "PeerTube", "Kolektiva", "Direct"}
        homepage = source["homepage"]
        assert homepage.startswith("https://") and "." in homepage.removeprefix("https://").split("/", 1)[0]
        assert source["languages"] and source["regions"] and source["topics"]

    feed = load("video-feed.json")
    items = feed["items"]
    canonical_ids = [item["canonicalId"] for item in items]
    assert items
    assert len(canonical_ids) == len(set(canonical_ids))
    for item in items:
        for key in ("title", "source", "platform", "language", "region", "topic", "originalUrl"):
            assert item[key], f"{item['canonicalId']} is missing {key}"
        assert item["section"] in {"reports", "interviews", "documentaries", "education", "live"}

    by_platform_id = {item["platformId"]: item for item in items}
    requested_documentaries = {"tDDLFpz7pjE", "I0UGM8zeNLw"}
    additional_documentaries = {"0uNSjlCkxwA", "AHGl9a8BcqI", "bgmClo2LPls"}
    assert requested_documentaries | additional_documentaries <= set(by_platform_id)
    for platform_id in requested_documentaries | additional_documentaries:
        assert by_platform_id[platform_id]["section"] == "documentaries"
        assert by_platform_id[platform_id]["availability"] == "OK"
    assert {by_platform_id[item]["language"] for item in requested_documentaries} == {"de"}
    assert {by_platform_id[item]["language"] for item in additional_documentaries} == {"de", "en", "fr"}

    health = load("video-health.json")
    assert health["totals"]["acceptedCount"] == len(items)
    assert health["totals"]["duplicateCount"] >= 2
    assert health["networkChecks"]["mode"] in {"not-run", "sources-and-items"}
    assert len(health["itemHealth"]) == len(items)
    for item_health in health["itemHealth"]:
        assert item_health["originalStatus"] in {"not-checked", "reachable", "dead", "blocked", "unavailable"}
        assert item_health["embedStatus"] in {"not-checked", "embeddable", "dead", "blocked", "unavailable", "not-applicable"}
        assert item_health["ageStatus"] in {"unknown", "current", "recent-archive", "archive"}
        assert item_health["platformStatus"]

    config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8")
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "news-app-2-config.js?release=14" in index
    for key, filename in (
        ("videoFeed", "video-feed.json"),
        ("videoHealth", "video-health.json"),
        ("videoSources", "video-sources-registry.json"),
    ):
        assert f"{key}: wrnDataUrl('{filename}')" in config
        assert f"{key}: wrnMirrorDataUrl('{filename}')" in config
        for worker_name in ("news-app-2-sw.js", "service-worker.js"):
            worker = (ROOT / worker_name).read_text(encoding="utf-8")
            assert filename in worker
            assert "news-app-2-config.js?release=14" in worker

    print("Video pipeline assets: OK")


if __name__ == "__main__":
    main()
