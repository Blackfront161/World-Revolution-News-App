from pathlib import Path
import importlib.util
import re

import pytest


ROOT = Path(__file__).resolve().parents[1]
RUNNER_PATH = ROOT / "tests" / "run_contract_matrix.py"
WORKFLOW_PATH = ROOT / ".github" / "workflows" / "quality-gate.yml"


def test_quality_gate_uses_complete_deterministic_contract_discovery(tmp_path: Path) -> None:
    spec = importlib.util.spec_from_file_location("wrn_contract_matrix", RUNNER_PATH)
    assert spec and spec.loader
    runner = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(runner)

    discovered = runner.javascript_contracts()
    expected = sorted((ROOT / "tests").rglob("test_*.js"), key=lambda path: path.as_posix())
    assert discovered == expected
    assert len(discovered) >= 37

    pytest_managed, main_only = runner.python_contract_inventory()
    python_contracts = runner.python_contracts()
    assert set(pytest_managed).isdisjoint(main_only)
    assert set(pytest_managed).union(main_only) == set(python_contracts)
    assert {path.name for path in main_only} == {
        "test_block3_assets.py",
        "test_inline_text.py",
        "test_video_assets.py",
        "test_video_pipeline_assets.py",
    }
    for path in main_only:
        source = path.read_text(encoding="utf-8")
        assert "def main(" in source
        assert 'if __name__ == "__main__"' in source or "if __name__ == '__main__'" in source

    workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
    assert "python tests/run_contract_matrix.py" in workflow
    assert "python tests/validate_app.py" in workflow
    assert "node tests/test_solidarity_worker_fallback.js" in workflow
    assert 'python release_audit_183.py --no-write --artifact "${RUNNER_TEMP}/release-readiness-183.json"' in workflow
    assert "${{ runner.temp }}/release-readiness-183.json" in workflow
    assert "\n            release-readiness-183.json" not in workflow
    assert re.search(r"(?m)^\s*python release_audit_183\.py\s*$", workflow) is None

    runner_source = RUNNER_PATH.read_text(encoding="utf-8")
    assert 'rglob("test_*.py")' in runner_source
    assert "pytest_command.extend(path.relative_to(ROOT).as_posix() for path in pytest_managed)" in runner_source
    assert "for path in main_only:" in runner_source

    fixtures = {
        "test_helper_via_main.py": """
def verify():
    assert True

def main():
    verify()

if __name__ == '__main__':
    main()
""",
        "test_empty.py": "value = 1\n",
        "test_pytest_real.py": "def test_real_item():\n    assert True\n",
        "test_main_only.py": """
def main():
    assert True

if __name__ == '__main__':
    main()
""",
        "test_mixed.py": """
def test_real_item():
    assert True

def main():
    raise RuntimeError('main contract')

if __name__ == '__main__':
    main()
""",
        "test_collection_error.py": "import module_that_does_not_exist_for_wrn_policy\n",
    }
    paths = {}
    for name, source in fixtures.items():
        path = tmp_path / name
        path.write_text(source.strip() + "\n", encoding="utf-8")
        paths[name] = path

    pytest_managed, main_only = runner.python_contract_inventory(
        [paths["test_pytest_real.py"], paths["test_helper_via_main.py"], paths["test_main_only.py"]],
        cwd=tmp_path,
    )
    assert pytest_managed == [paths["test_pytest_real.py"]]
    assert main_only == [paths["test_helper_via_main.py"], paths["test_main_only.py"]]
    for path in main_only:
        runner.subprocess.run([runner.sys.executable, str(path)], cwd=tmp_path, check=True)

    with pytest.raises(RuntimeError, match="Zero-item Python test"):
        runner.python_contract_inventory([paths["test_empty.py"]], cwd=tmp_path)
    with pytest.raises(RuntimeError, match="Ambiguous mixed pytest/main contract"):
        runner.python_contract_inventory([paths["test_mixed.py"]], cwd=tmp_path)
    with pytest.raises(RuntimeError, match="Pytest collection failed"):
        runner.python_contract_inventory([paths["test_collection_error.py"]], cwd=tmp_path)
