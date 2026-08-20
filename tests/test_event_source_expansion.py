from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_curated_event_sources_cover_local_movement_calendars():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    expected = {
        "Barrikade (CH)": "https://barrikade.info/spip.php?page=backend",
        "Flying High Bonn": "https://flyinghigh-bonn.org/feed/rss",
        "Gancio Graz": "https://gancio.graz.events/feed/rss",
        "Sa Pratza Sardegna": "https://sapratza.in/feed/rss",
        "Koledar Kompot Ljubljana": "https://koledar.kompot.si/feed/rss",
        "Agenda Autónoma Bogotá": "https://autonoma.red/feed/rss",
        "Eventos Coletivos Brasil": "https://eventos.coletivos.org/feed/rss",
    }
    for name, feed in expected.items():
        assert name in aggregate
        assert feed in aggregate


def test_new_event_sources_use_https_and_explicit_origin_metadata():
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8")
    for country_code in ('"DE"', '"AT"', '"IT"', '"SI"', '"CO"', '"BR"'):
        assert f'"originCountryCode": {country_code}' in aggregate
