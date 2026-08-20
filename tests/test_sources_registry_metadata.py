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
