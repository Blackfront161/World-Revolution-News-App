from build_sources_registry import propagate_reviewed_metadata_by_publisher
from build_source_archive import projected_article


def test_reviewed_aliases_survive_reordering_without_cross_host_or_name_leakage():
    reviewed = {"name": "Publisher", "url": "https://www.example.org/feed/", "languages": ["es"], "importMode": "metadata-only", "reviewEvidence": ["https://www.example.org/about"], "originRegion": "Latin America"}
    legacy = {"name": "Publisher", "url": "https://example.org/", "languages": ["und"]}
    foreign = {"name": "Publisher", "url": "https://foreign.example/", "languages": ["und"]}
    renamed = {"name": "Other", "url": "https://example.org/", "languages": ["und"]}
    for reverse in [False, True]:
        rows = [dict(reviewed), dict(legacy), dict(foreign), dict(renamed)]
        if reverse:
            rows.reverse()
        propagate_reviewed_metadata_by_publisher(rows)
        for row in rows:
            if row["name"] == "Publisher" and "example.org" in row["url"]:
                assert row["languages"] == ["es"]
                assert row["importMode"] == "metadata-only"
                assert row["originRegion"] == "Latin America"
                assert row["reviewEvidence"] == reviewed["reviewEvidence"]
            else:
                assert row["languages"] == ["und"]
                assert "importMode" not in row


def test_archive_keeps_restricted_admission_provenance():
    row = {"title": "Headline", "importMode": "metadata-only", "rightsReview": "original links only", "content": "WRN note", "contentComplete": False, "image": "", "images": []}
    archived = projected_article(row, 1400)
    assert archived["importMode"] == "metadata-only"
    assert archived["rightsReview"] == "original links only"
    assert archived["contentComplete"] is False
    assert archived["image"] == "" and archived["images"] == []


def test_metadata_admission_always_has_canonical_region_and_topic():
    from source_import_policy import metadata_categories
    assert metadata_categories(["Europa"], "Europa") == ["Europe", "Movement News"]
    assert metadata_categories(["Latin America", "Indigenous Struggles"], "Indigenous Struggles") == ["Latin America", "Indigenous Struggles"]
    assert metadata_categories([], "Unknown") == ["Global", "Movement News"]


def test_activated_policy_removes_old_body_and_media_from_both_archive_orders():
    from datetime import datetime, timezone
    from build_source_archive import build_source_archives
    from source_import_policy import restrict_existing_article
    policy = {"name": "Publisher", "homepage": "https://example.org/", "status": "approved", "importMode": "metadata-only", "languages": ["es"], "categories": ["Latin America", "Indigenous Struggles"], "rightsReview": "original links only"}
    old = {"id": "stable-id", "quelleName": "Publisher", "title": "Headline", "link": "https://example.org/story", "pubDate": "2026-10-01T12:00:00Z", "content": "PROTECTED BODY", "summary": "PROTECTED SUMMARY", "image": "https://example.org/protected.jpg", "images": ["https://example.org/protected.jpg"], "language": "und"}
    for news, prior in [([old], []), ([], [old])]:
        manifest, chunks = build_source_archives(news, [], previous_articles=prior, source_policies=[policy], generated_at=datetime(2026, 10, 2, tzinfo=timezone.utc))
        rows = next(iter(chunks.values()))
        assert len(rows) == 1 and rows[0]["link"] == old["link"]
        assert rows[0]["language"] == "es" and rows[0]["importMode"] == "metadata-only"
        assert rows[0]["contentComplete"] is False and not rows[0]["image"] and not rows[0]["images"]
        assert "PROTECTED" not in str(rows)
        assert rows[0]["rightsReview"] == "original links only"
        assert manifest["sources"][0]["itemCount"] == 1
    assert restrict_existing_article(old, [policy])["id"] == "stable-id"
    assert restrict_existing_article({**old, "link": "https://foreign.example/story"}, [policy]) is None
    other = {**old, "quelleName": "Other publisher"}
    assert restrict_existing_article(other, [policy]) == other
