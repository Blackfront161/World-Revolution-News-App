import ast
from pathlib import Path

from source_import_policy import metadata_article
from build_sources_registry import normalize_record


FEED = {"name": "Restricted source", "homepage": "https://example.org/",
        "importMode": "metadata-only", "languages": ["de"], "categories": ["Europa"]}


def test_feed_fulltext_summary_and_media_never_enter_metadata_record():
    entry = {"title": "Headline", "link": "https://example.org/story", "published": "2026-09-30",
             "summary": "PROTECTED SUMMARY", "content": [{"value": "PROTECTED FULL TEXT"}],
             "media_content": [{"url": "https://example.org/private.jpg"}]}
    result = metadata_article(FEED, entry, "Europa")
    assert result["link"] == entry["link"]
    assert result["image"] == "" and result["images"] == []
    assert not result["contentComplete"]
    assert "PROTECTED" not in str(result)


def test_restricted_records_reject_foreign_credential_and_non_https_links():
    for link in ("http://example.org/story", "https://foreign.org/story",
                 "https://example.org.attacker.org/story", "https://user:pass@example.org/story"):
        assert metadata_article(FEED, {"title": "Headline", "link": link}, "Europa") is None


def test_directory_source_is_visible_without_active_feed():
    result = normalize_record({"name": "Directory", "homepage": "https://example.org/",
                               "status": "directory-only", "importMode": "disabled"},
                              origin="multilingual-source-registry.json", inherited_category="")
    assert result["status"] == "directory-only"
    assert not result["active"]
    assert result["importMode"] == "disabled"


def test_actual_aggregator_short_circuits_before_body_extraction():
    source = (Path(__file__).resolve().parents[1] / "aggregate.py").read_text(encoding="utf-8")
    tree = ast.parse(source)
    branch = next(node for node in ast.walk(tree) if isinstance(node, ast.If)
                  and ast.unparse(node.test) == "feed.get('importMode') == 'metadata-only'")
    assert isinstance(branch.body[-1], ast.Continue)
    code = ast.unparse(branch)
    assert "metadata_article" in code and "archiv_dict[link] = admitted" in code
    assert "scrape_article_page" not in code and "BeautifulSoup" not in code
    # Run that branch in its real loop shape; any fallthrough attempts a scrape.
    scope = {"feed": FEED, "entry": {"title": "Headline", "link": "https://example.org/story"},
             "kontinent": "Europa", "link": "https://example.org/story", "title_lower": "headline",
             "metadata_article": metadata_article, "classify_article": lambda title, content, *_: {"primaryRegion": "Europe"} if content == "" else (_ for _ in ()).throw(AssertionError("foreign body used in classification")), "archiv_dict": {}, "gesehene_titel": set(),
             "AGGREGATE_METRICS": {"newArticles": 0, "enrichedArticles": 0}}
    exec(compile("for _ in [1]:\n" + "\n".join("    " + line for line in code.splitlines())
                 + "\n    raise AssertionError('body scrape reached')", "admission-branch", "exec"), scope)
    assert scope["archiv_dict"][scope["link"]]["importMode"] == "metadata-only"
    assert scope["AGGREGATE_METRICS"]["newArticles"] == 1


def test_additive_merge_keeps_existing_feed_ids_and_is_idempotent(tmp_path, monkeypatch):
    import merge_multilingual_sources as merger
    path = tmp_path / "aggregate.py"
    path.write_text("quellen = {'Europa': [{'name': 'Existing', 'url': 'https://old.example/feed'}]}\n"
                    + merger.START + "\n_wrn_extra_sources_182 = [{'name': 'Existing', 'feedUrl': 'https://old.example/feed'}]\n"
                    + merger.END + "\n", encoding="utf-8")
    monkeypatch.setattr(merger, "AGGREGATE", path)
    registry = {"sources": [{"name": "Existing", "feedUrl": "https://new.example/feed",
                             "kind": "news", "status": "approved", "adapter": "rss"},
                            {**FEED, "kind": "news", "status": "approved", "adapter": "rss",
                             "feedUrl": "https://example.org/feed"}]}
    assert merger.patch_aggregate(registry)
    first = path.read_bytes()
    assert not merger.patch_aggregate(registry)
    assert path.read_bytes() == first
    scope = {}
    exec(first, scope)
    assert scope["quellen"]["Europa"][0]["url"] == "https://old.example/feed"
    assert sum(row["name"] == "Restricted source" for rows in scope["quellen"].values() for row in rows) == 1
    admitted = next(row for rows in scope["quellen"].values() for row in rows if row["name"] == "Restricted source")
    assert admitted["importMode"] == "metadata-only"
