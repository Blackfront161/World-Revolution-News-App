from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / ".github" / "workflows"
APP_WORKFLOWS = {"quality-gate.yml", "validate-app.yml"}


def test_app_repository_owns_only_read_only_validation_workflows() -> None:
    workflow_paths = {
        path.name: path
        for pattern in ("*.yml", "*.yaml")
        for path in WORKFLOWS.glob(pattern)
    }
    assert set(workflow_paths) == APP_WORKFLOWS

    for name, path in workflow_paths.items():
        text = path.read_text(encoding="utf-8")
        assert re.search(r"(?m)^permissions:\s*$", text), name
        assert re.search(r"(?m)^\s+contents:\s+read\s*$", text), name
        assert not re.search(r"(?mi)^\s*schedule\s*:", text), name
        assert not re.search(r"(?mi)^\s*[a-z-]+\s*:\s*write\s*$", text), name
        assert not re.search(r"(?mi)\bwrite-all\b", text), name
        assert not re.search(
            r"(?mi)\bgit\b[^\r\n]*\b(?:add|commit|push)\b",
            text,
        ), name
