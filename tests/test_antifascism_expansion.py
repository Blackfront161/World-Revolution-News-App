import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_international_antifascism_sources_are_registered():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")

    expected_sources = {
        "Anti-Fascistische Actie Nederland": ("https://afanederland.org/feed/", "NL"),
        "Anonymous Comrades Collective": ("https://accollective.noblogs.org/feed/", "US"),
        "Juntas! Brasil": ("https://coletivojuntas.com.br/feed/", "BR"),
        "Worldwide Antifascism Research Network": (
            "https://antifascismresearchnetwork.com/feed/",
            "Global",
        ),
        "Slackbastard": ("https://slackbastard.anarchobase.com/?feed=rss2", "AU"),
    }

    for name, (url, country_code) in expected_sources.items():
        assert f'"name": "{name}"' in aggregate
        assert f'"url": "{url}"' in aggregate
        if country_code == "Global":
            assert '"originCountry": "Global"' in aggregate
        else:
            assert f'"originCountryCode": "{country_code}"' in aggregate


def test_fast_refresh_uses_the_approved_two_hour_cadence():
    workflow = (ROOT / ".github" / "workflows" / "update-fast.yml").read_text(
        encoding="utf-8"
    )
    assert 'cron: "7 */2 * * *"' in workflow


def test_new_antifascism_sources_pass_health_and_registry_generation():
    expected_names = {
        "Anti-Fascistische Actie Nederland",
        "Anonymous Comrades Collective",
        "Juntas! Brasil",
        "Worldwide Antifascism Research Network",
        "Slackbastard",
    }
    health = json.loads((ROOT / "source-health.json").read_text(encoding="utf-8"))
    registry = json.loads((ROOT / "sources-registry.json").read_text(encoding="utf-8"))

    health_by_name = {
        item["name"]: item
        for item in health.values()
        if isinstance(item, dict) and item.get("name")
    }
    registry_names = {
        item.get("name")
        for item in registry.get("sources", [])
        if isinstance(item, dict)
    }

    assert expected_names <= set(health_by_name)
    assert expected_names <= registry_names
    for name in expected_names:
        assert health_by_name[name]["status"] == "ok"
        assert health_by_name[name]["ok"] is True
