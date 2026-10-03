import json
from pathlib import Path

import build_sources_registry as registry


ROOT = Path(__file__).resolve().parents[1]


def test_geography_inference_keeps_provenance():
    region, country, code, source = registry.inferred_geography(
        "Independent Media Berlin",
        "https://example.org/feed",
        origin="aggregate.py",
        inherited_category="Europe",
    )
    assert (region, country, code) == ("Europe", "Germany", "DE")
    assert source == "inferred:name"

    region, country, code, source = registry.inferred_geography(
        "Novara Media (UK)",
        "https://novaramedia.com/feed/",
        origin="aggregate.py",
        inherited_category="Europe",
    )
    assert (region, country, code) == ("Europe", "United Kingdom", "GB")
    assert source == "inferred:name"

    region, country, code, source = registry.inferred_geography(
        "Independent Media",
        "https://example.fr/feed",
        origin="aggregate.py",
        inherited_category="",
    )
    assert (region, country, code) == ("Europe", "France", "FR")
    assert source == "inferred:country-domain"


def test_generated_registry_reports_metadata_completeness():
    payload = json.loads((ROOT / "sources-registry.json").read_text(encoding="utf-8"))
    completeness = payload["metadataCompleteness"]
    assert payload["schemaVersion"] == 3
    assert completeness["knownGeography"] >= 300
    assert completeness["explicitGeography"] > 0
    assert completeness["inferredGeography"] > 0
    assert completeness["unknownGeography"] > 0
    assert all(source["geographySource"] for source in payload["sources"])
    assert "aggregate.py" in payload["provenanceFiles"]


def test_restricted_source_projection_preserves_mode_and_review_evidence():
    source = registry.normalize_record({"name": "Directory", "homepage": "https://example.org/",
        "status": "directory-only", "importMode": "disabled", "operator": "Collective",
        "rightsReview": "unknown", "reviewEvidence": ["https://example.org/about"]},
        origin="multilingual-source-registry.json", inherited_category="")
    assert not source["active"]
    assert source["importMode"] == "disabled"
    assert source["reviewEvidence"] == ["https://example.org/about"]


def test_new_sources_have_explicit_scoped_imports_and_stable_unique_urls():
    payload = json.loads((ROOT / "sources-registry.json").read_text(encoding="utf-8"))
    names = {"Autonome Antifa Freiburg", "antifa-frankfurt.org", "Untergrund-Blättle"}
    sources = [source for source in payload["sources"] if source["name"] in names]
    assert len(sources) == 3 and len({source["canonicalUrl"] for source in sources}) == 3
    assert sum(source["active"] for source in sources) == 1
    assert next(source for source in sources if source["name"] == "Untergrund-Blättle")["importMode"] == "metadata-only"
    inputs = json.loads((ROOT / "multilingual-source-registry.json").read_text(encoding="utf-8"))
    assert not any(source["name"] in names and source.get("status") == "approved"
                   for source in inputs["sources"]), "App projection must not activate its legacy aggregator"
