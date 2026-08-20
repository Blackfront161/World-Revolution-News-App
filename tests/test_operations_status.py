from datetime import datetime, timezone
import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "operations_status",
    ROOT / "scripts" / "build_operations_status.py",
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


def test_status_payload_never_contains_content_fields():
    payload = MODULE.build_status(datetime(2026, 8, 5, tzinfo=timezone.utc))
    keys = {
        str(key).casefold()
        for check in payload["checks"]
        for key in check
    }
    for forbidden in ("message", "email", "url", "content", "feedbacktext"):
        assert forbidden not in keys


def test_age_thresholds_are_deterministic():
    assert MODULE.status_for_age(2.5, 2.5, 5.0) == "ok"
    assert MODULE.status_for_age(2.6, 2.5, 5.0) == "warning"
    assert MODULE.status_for_age(5.1, 2.5, 5.0) == "error"
    assert MODULE.status_for_age(None, 2.5, 5.0) == "error"


def test_audio_health_summary_is_content_free():
    counts = MODULE.audio_health_counts({
        "podcasts": {"summary": {"total": 8, "playable": 5, "limited": 1, "unknown": 1, "broken": 1}}
    })
    assert counts == {"total": 8, "ok": 5, "warning": 2, "error": 1}
