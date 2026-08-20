import json
from pathlib import Path

from aggregate_podcasts import (
    detect_episode_language,
    detect_episode_language_details,
    deduplicate_episodes,
    episode_feed_language,
    podcast_language_allowed,
    source_feed_candidates,
)


def test_explicit_feed_language_wins():
    assert detect_episode_language(
        {"language": "en-US"},
        "Ein deutscher Titel",
        "Eine deutsche Beschreibung mit vielen deutschen Wörtern.",
        "de",
    ) == "en"


def test_clear_english_episode_overrides_german_source():
    assert detect_episode_language(
        {},
        "Dark Socialism: surviving within the ruins of disaster capitalism",
        "In this episode we speak with the author about the climate crisis and why the left needs a new strategy.",
        "de",
    ) == "en"


def test_dissens_style_descriptions_select_each_episode_language():
    assert detect_episode_language(
        {},
        "Der Kampf um bezahlbaren Wohnraum",
        "In dieser Folge sprechen wir mit einer Aktivistin über die Bewegung und darüber, wie sich Menschen gemeinsam organisieren.",
        "de",
    ) == "de"
    assert detect_episode_language(
        {},
        "Organizing beyond the crisis",
        "In this episode we speak with an activist about the movement and why people organize together across the city.",
        "de",
    ) == "en"


def test_short_or_ambiguous_episode_keeps_source_language():
    assert detect_episode_language({}, "Bad News #103", "", "de") == "de"


def test_language_marker_is_respected():
    assert detect_episode_language(
        {},
        "Evangelikale in den USA (englisch)",
        "Sendung des Anarchistischen Radios.",
        "de",
    ) == "en"


def test_feed_metadata_precedes_automatic_text_detection():
    assert detect_episode_language(
        {},
        "An English-looking title",
        "This episode is about the movement and why the people organize.",
        "de",
        "fr-FR",
    ) == "fr"


def test_multilingual_source_does_not_apply_generic_channel_language():
    assert episode_feed_language(
        {"language": "de", "languages": ["de", "en"]},
        {"language": "de-DE"},
    ) == ""


def test_language_decision_keeps_audit_source():
    assert detect_episode_language_details(
        {},
        "Dark Socialism",
        "In this episode we speak with the author about why the left needs a strategy.",
        "de",
    ) == ("en", "automatic-text")


def test_greek_and_russian_are_supported_per_episode():
    assert detect_episode_language(
        {},
        "Συζήτηση για το κίνημα",
        "Αυτό είναι ένα επεισόδιο για την κοινωνία και την αλληλεγγύη.",
        "de",
    ) == "el"
    assert detect_episode_language(
        {},
        "Разговор о движении",
        "Это выпуск о том, как люди действуют вместе и что важно для движения.",
        "de",
    ) == "ru"


def test_chinese_podcasts_are_disabled_for_wrn_21():
    assert podcast_language_allowed("zh") is False
    sources = json.loads(
        (Path(__file__).resolve().parents[1] / "podcast-sources.json").read_text(
            encoding="utf-8"
        )
    )
    chinese = [source for source in sources if source.get("language") == "zh"]
    assert chinese
    assert all(source.get("enabled") is False for source in chinese)


def test_new_multilingual_original_podcast_sources_are_registered():
    sources = json.loads(
        (Path(__file__).resolve().parents[1] / "podcast-sources.json").read_text(
            encoding="utf-8"
        )
    )
    by_id = {source["id"]: source for source in sources if source.get("id")}
    expected = {
        "fumaca": "pt",
        "acik-yesil": "tr",
        "iklim-kusagi-konusuyor": "tr",
        "contrabanda-specials": "es",
        "infowar-greece": "el",
        "epanastasi-greece": "el",
        "mudawanat-arabic": "ar",
        "jalsa-arabic": "ar",
    }
    for source_id, language in expected.items():
        source = by_id[source_id]
        assert source["language"] == language
        assert source["feedUrls"]
        assert all(url.startswith("https://") for url in source["feedUrls"])


def test_language_evidence_is_published_for_auditing():
    aggregator = (
        Path(__file__).resolve().parents[1] / "aggregate_podcasts.py"
    ).read_text(encoding="utf-8")
    for field in (
        '"languageSource"',
        '"languageConfidence"',
        '"languageVerified"',
        '"languageReviewRequired"',
        '"configuredLanguages"',
    ):
        assert field in aggregator


def test_episode_id_deduplicates_provider_audio_variants():
    rows = deduplicate_episodes([
        {
            "id": "same-episode",
            "audioUrl": "https://cdn.example/old.mp3",
            "sourcePriority": 80,
        },
        {
            "id": "same-episode",
            "audioUrl": "https://cdn.example/new.mp3",
            "sourcePriority": 80,
        },
    ])
    assert len(rows) == 1
    assert rows[0]["id"] == "same-episode"


def test_repaired_canonical_feed_is_checked_before_legacy_fallbacks(monkeypatch):
    monkeypatch.setattr(
        "aggregate_podcasts.discover_feeds",
        lambda _homepage: ["https://example.org/discovered.xml"],
    )
    candidates = source_feed_candidates({
        "feedUrl": "https://example.org/current.xml",
        "feedUrls": ["https://example.org/old.xml"],
        "homepage": "https://example.org/",
    })
    assert candidates == [
        "https://example.org/current.xml",
        "https://example.org/old.xml",
        "https://example.org/discovered.xml",
    ]
