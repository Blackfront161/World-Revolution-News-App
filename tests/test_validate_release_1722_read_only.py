from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATOR_PATH = ROOT / "validate_release_1722.py"
TRACKED_REPORT = ROOT / "workflow-audit.json"

spec = importlib.util.spec_from_file_location("validate_release_1722", VALIDATOR_PATH)
assert spec and spec.loader
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def report_identity() -> tuple[str, int]:
    return (
        hashlib.sha256(TRACKED_REPORT.read_bytes()).hexdigest(),
        TRACKED_REPORT.stat().st_mtime_ns,
    )


def test_read_only_mode_does_not_modify_tracked_workflow_report() -> None:
    before = report_identity()
    assert validator.main(["--no-write"]) == 0
    assert report_identity() == before


def test_explicit_workflow_report_is_written_outside_worktree(tmp_path: Path) -> None:
    before = report_identity()
    output = tmp_path / "quality-artifacts" / "workflow-audit.json"
    assert validator.main(["--workflow-report", str(output)]) == 0
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["schemaVersion"] == 1
    assert report["workflowCount"] > 0
    assert report["warningCount"] >= 0
    assert report_identity() == before


def test_quality_gate_uses_only_the_temporary_workflow_artifact() -> None:
    workflow = (ROOT / ".github" / "workflows" / "quality-gate.yml").read_text(encoding="utf-8")
    assert 'python validate_release_1722.py --workflow-report "${RUNNER_TEMP}/workflow-audit.json"' in workflow
    assert "${{ runner.temp }}/workflow-audit.json" in workflow
    assert "\n            workflow-audit.json" not in workflow
    operations = (ROOT / "OPERATIONS.md").read_text(encoding="utf-8")
    assert "python validate_release_1722.py --no-write" in operations
