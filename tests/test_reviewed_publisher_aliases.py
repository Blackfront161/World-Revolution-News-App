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
