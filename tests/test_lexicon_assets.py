from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def test_lexicon_assets_are_loaded_and_cached():
    config = read("config.js")
    worker = read("service-worker.js")

    assert "['lexicon-tab.css', 'lexicon-tab-recovery-184']" in config
    assert "['lexicon-tab.js', 'lexicon-tab-recovery-184']" in config
    assert "'./lexicon-tab.css'" in worker
    assert "'./lexicon-tab.js'" in worker


def test_lexicon_has_sections_sources_and_downloads():
    script = read("lexicon-tab.js")

    for section in (
        "basics", "organisation", "justice", "power", "tactics",
        "ecology", "struggles", "all", "sources",
    ):
        assert f"{section}:" in script or f"'{section}'" in script

    for source in (
        "TransformHarm",
        "Creative Interventions Toolkit",
        "An Anarchist FAQ",
        "Libcom · Anarchism reading guide",
        "The Anarchist Library",
        "Sins Invalid · Disability Justice",
        "Critical Resistance",
        "INCITE! Community Accountability",
        "Indigenous Action",
        "Beautiful Trouble Toolbox",
    ):
        assert source in script

    assert script.count("extraTerm(") >= 25
    assert "wrn-begriffslexikon.json" in script
    assert "noopener noreferrer" in script
    assert "Eigentümer*innen" in script
    assert "formaler Eigentümer oder" not in script
    assert "Politisch inhaftierte Person" in script
    assert "Politische*r Gefangene*r','Political prisoner" not in script
    for term_id in (
        "libertarian-municipalism", "workers-control", "prison-industrial-complex",
        "migrant-solidarity", "trans-liberation", "extractivism",
        "movement-media", "digital-self-defence", "tenant-union",
        "eviction-defence", "strike-fund", "picket-line", "lockout",
        "union-busting", "social-centre", "solidarity-economy", "commoning",
        "community-land-trust",
        "dog-whistle", "entryism", "far-right-monitoring",
        "counter-mobilisation", "deplatforming", "disinformation",
        "movement-archive", "community-self-defence",
    ):
        assert f"extraTerm('{term_id}'" in script

    assert "building.textContent = t.building" not in script
    assert "stateLabel.textContent = t.editorialState" not in script


def test_lexicon_is_in_navigation_and_about_is_menu_only():
    navigation = read("release-1.5-nav.js")

    assert "key: 'lexicon'" in navigation
    assert "window.WRNLexicon184?.show?.(target)" in navigation
    assert "menuOnly: true" in navigation
    assert "activateTab('about')" in navigation
