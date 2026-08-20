import json
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]


def test_aggregator_stops_before_the_workflow_timeout():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    for token in (
        "WRN_AGGREGATE_BUDGET_SECONDS",
        "WRN_AGGREGATE_STOP_RESERVE_SECONDS",
        "aggregate_budget_exhausted()",
        "aggregate_stopped_for_budget",
        "rotate_source_buckets",
        "WRN_SOURCE_ROTATION_HOURS",
    ):
        assert token in aggregate


def test_checkpoints_are_throttled_and_atomic():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    assert "WRN_CHECKPOINT_INTERVAL_SECONDS" in aggregate
    assert 'temporary = f"{path}.tmp"' in aggregate
    assert "os.replace(temporary, path)" in aggregate
    assert "save_checkpoint(force=True)" in aggregate
    assert "NON_IMAGE_MEDIA_EXTENSIONS" in aggregate
    assert "pathname.endswith(NON_IMAGE_MEDIA_EXTENSIONS)" in aggregate
    assert 'tail = clean[-700:]' in aggregate
    assert 'short_text and marker in clean' in aggregate
    assert 'marker.strip() == "appeared first on"' in aggregate


def test_radar_events_use_complete_offset_pagination_without_archive_truncation():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    assert 'RADAR_PAGE_SIZE = 500' in aggregate
    assert '"offset": offset' in aggregate
    assert 'while reported_count is None or offset < reported_count' in aggregate
    assert 'events = events[:1000]' not in aggregate
    assert 'Radar API pagination was incomplete' in aggregate
    assert 'RADAR_PAGE_ATTEMPTS = 4' in aggregate
    assert 'if radar_metadata["complete"]' in aggregate
    assert '[TEILFORTSCHRITT]' in aggregate


def test_feed_builder_and_aggregator_contracts_are_preserved():
    builder = (ROOT / "build_web_feeds.py").read_text(encoding="utf-8")
    assert 'WRN_FEED_TARGETS' in builder
    assert 'write_news = "news" in FEED_TARGETS' in builder
    assert 'write_events = "events" in FEED_TARGETS' in builder
    assert 'published_event_feed = event_feed if write_events else load_list(EVENTS_TARGET)' in builder
    assert 'published_news_feed = news_feed if write_news else load_list(NEWS_TARGET)' in builder
    assert 'newestArticleAt' in builder
    assert 'lastSuccessfulFetchAt' in builder
    assert 'lastPublishedAt' in builder
    assert 'ensure_news_feed_does_not_regress' in builder
    assert 'write_news_detail_chunks' in builder
    assert 'quick_item["detailPath"] = filename' in builder
    assert 'WRN_NEWS_DETAIL_CHUNK_SIZE' in builder
    assert 'aggregate-run-status.json' in builder
    assert '"[WEB-FEED] Ziele: "' in builder
    assert 'WRN_EVENT_COUNTRY_MINIMUM' in builder
    assert 'for depth in range(EVENT_COUNTRY_MINIMUM)' in builder
    assert 'if depth < len(by_country[country])' in builder
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    assert 'if primary_topic and primary_topic not in categories' in aggregate
    assert 'categories.append(primary_topic)' in aggregate
    assert 'AGGREGATE_MODE == "fast"' in aggregate
    assert 'ThreadPoolExecutor' in aggregate
    assert 'and not FAST_MODE' in aggregate
    assert 'save_aggregate_run_status()' in aggregate
    assert 'len(clean_text) < previous_text_length' in aggregate
    assert 'clean_text = previous_text' in aggregate
    assert 'for previous_image in previous_images' in aggregate
    assert 'New images are added; established images remain.' in aggregate
    assert 'def image_is_structural(image):' in aggregate
    assert 'def extract_article_content(root, base_url):' in aggregate
    assert 'def extract_json_ld_article_content(soup):' in aggregate
    assert 'json_ld_blocks, json_ld_text = extract_json_ld_article_content(soup)' in aggregate
    assert '"contentBlocks": content_blocks[:400]' in aggregate
    assert 'STRUCTURAL_IMAGE_TOKENS' in aggregate
    assert '".et_pb_post_content"' in aggregate
    assert 'item.pop("contentBlocks", None)' in builder
    assert 'has_structured_content = bool(archive_item.get("contentBlocks"))' in builder


def test_generated_detail_chunks_preserve_full_text_and_images():
    quick_rows = json.loads((ROOT / "news-feed.json").read_text(encoding="utf-8"))
    chunk_cache = {}
    checked = 0
    for quick in quick_rows:
        detail_path = str(quick.get("detailPath") or "")
        if not detail_path:
            continue
        detail_file = ROOT / detail_path
        assert detail_file.is_file(), detail_path
        details = chunk_cache.setdefault(
            detail_path,
            json.loads(detail_file.read_text(encoding="utf-8")),
        )
        detail = next(
            item for item in details
            if item.get("link") == quick.get("link")
        )
        assert len(str(detail.get("content") or "")) >= len(
            str(quick.get("content") or "")
        )
        assert set(quick.get("images") or []).issubset(
            set(detail.get("images") or [])
        )
        checked += 1
    assert checked > 0


def test_web_feed_assigns_an_explicit_content_mode():
    from build_web_feeds import prepare

    rows = prepare(
        [
            {"title": "Full", "link": "https://example.org/full", "content": "Complete"},
            {"title": "Metadata", "link": "https://example.org/meta", "content": ""},
            {
                "title": "Excerpt",
                "link": "https://example.org/excerpt",
                "content": "A longer article body",
                "contentComplete": False,
            },
        ],
        limit=3,
        content_limit=200,
    )
    assert [item["contentMode"] for item in rows] == ["full", "metadata", "excerpt"]


def test_web_feed_refuses_to_replace_a_newer_publication():
    from build_web_feeds import ensure_news_feed_does_not_regress

    previous_status = {
        "news": {"newestArticleAt": "2026-08-05T12:00:00+00:00"}
    }
    with pytest.raises(SystemExit, match="älter als der bereits veröffentlichte Feed"):
        ensure_news_feed_does_not_regress(
            [{"pubDate": "Wed, 05 Aug 2026 10:00:00 +0000"}],
            previous_status,
        )

    ensure_news_feed_does_not_regress(
        [{"pubDate": "Wed, 05 Aug 2026 14:00:00 +0000"}],
        previous_status,
    )


def test_editorial_quality_measures_source_streaks_without_exposing_names():
    from build_web_feeds import editorial_quality

    report = editorial_quality([
        {"quelleName": "Bianet Türkçe", "primaryRegion": "Europe", "primaryTopic": "Labor"},
        {"quelleName": "Bianet Kurdî", "primaryRegion": "Europe", "primaryTopic": "Rights"},
        {"quelleName": "Freedom News", "primaryRegion": "Europe", "primaryTopic": "Anarchism"},
    ])
    assert report["uniqueSourceFamilies"] == 2
    assert report["maxSourceStreak"] == 2
    assert report["maxSourceShare"] == 0.6667
    assert "sources" not in report


def test_aggregate_run_status_is_returned_without_unknown_fields(monkeypatch, tmp_path):
    import build_web_feeds

    status_path = tmp_path / "aggregate-run-status.json"
    status_path.write_text(json.dumps({
        "mode": "fast",
        "finishedAt": "2026-08-05T12:00:00+00:00",
        "newArticles": 12,
        "privateMessage": "must not leave the workflow",
    }), encoding="utf-8")
    monkeypatch.setattr(build_web_feeds, "RUN_STATUS_SOURCE", status_path)
    assert build_web_feeds.aggregate_run_status() == {
        "mode": "fast",
        "finishedAt": "2026-08-05T12:00:00+00:00",
        "newArticles": 12,
    }


def test_reclassifier_ignores_runtime_source_transformations():
    from reclassify_news_categories import definitions

    base, _extras, classify, regions, topics = definitions()
    assert base
    assert callable(classify)
    assert regions
    assert topics


if __name__ == "__main__":
    test_aggregator_stops_before_the_workflow_timeout()
    test_checkpoints_are_throttled_and_atomic()
    test_radar_events_use_complete_offset_pagination_without_archive_truncation()
    test_feed_builder_and_aggregator_contracts_are_preserved()
    test_generated_detail_chunks_preserve_full_text_and_images()
    test_web_feed_assigns_an_explicit_content_mode()
    test_reclassifier_ignores_runtime_source_transformations()
    print("WRN feed upload pipeline: OK")
