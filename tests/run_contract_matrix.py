#!/usr/bin/env python3
"""Run every JS, pytest-managed and main-only Python contract exactly once."""

from __future__ import annotations

import ast
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
TESTS = ROOT / "tests"


def javascript_contracts() -> list[Path]:
    """Return every JS contract test in stable path order."""
    return sorted(TESTS.rglob("test_*.js"), key=lambda path: path.as_posix())


def python_contracts() -> list[Path]:
    """Return every Python test module in stable path order."""
    return sorted(TESTS.rglob("test_*.py"), key=lambda path: path.as_posix())


def _is_main_guard(node: ast.If) -> bool:
    test = node.test
    return (
        isinstance(test, ast.Compare)
        and isinstance(test.left, ast.Name)
        and test.left.id == "__name__"
        and len(test.ops) == 1
        and isinstance(test.ops[0], ast.Eq)
        and len(test.comparators) == 1
        and isinstance(test.comparators[0], ast.Constant)
        and test.comparators[0].value == "__main__"
    )


def _guard_calls_main(node: ast.If) -> bool:
    return _is_main_guard(node) and any(
        isinstance(child, ast.Call)
        and isinstance(child.func, ast.Name)
        and child.func.id == "main"
        for statement in node.body
        for child in ast.walk(statement)
    )


_COLLECTION_MARKER = "WRN_PYTEST_COLLECTION="
_COLLECTION_PROBE = r'''
import json
import pathlib
import pytest
import sys

MARKER = "WRN_PYTEST_COLLECTION="

class InventoryPlugin:
    def pytest_collection_finish(self, session):
        items = [
            {"nodeid": item.nodeid, "path": str(pathlib.Path(str(item.path)).resolve())}
            for item in session.items
        ]
        print(MARKER + json.dumps(items, sort_keys=True))

raise SystemExit(pytest.main(["--collect-only", "-q", *sys.argv[1:]], plugins=[InventoryPlugin()]))
'''


def pytest_collection_items(paths: list[Path], cwd: Path = ROOT) -> dict[Path, list[str]]:
    """Collect real pytest Items and fail on every import/collection error."""
    resolved = [path.resolve() for path in paths]
    result = subprocess.run(
        [sys.executable, "-c", _COLLECTION_PROBE, *(str(path) for path in resolved)],
        cwd=cwd,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )
    combined = f"{result.stdout}\n{result.stderr}"
    marker_lines = [line for line in combined.splitlines() if line.startswith(_COLLECTION_MARKER)]
    if result.returncode not in (0, 5) or len(marker_lines) != 1:
        raise RuntimeError(
            "Pytest collection failed or returned no machine-readable inventory:\n"
            f"{combined.strip()}"
        )
    try:
        payload = json.loads(marker_lines[0][len(_COLLECTION_MARKER):])
    except json.JSONDecodeError as error:
        raise RuntimeError("Pytest collection inventory is invalid JSON") from error
    inventory = {path: [] for path in resolved}
    for item in payload:
        item_path = Path(item["path"]).resolve()
        if item_path not in inventory:
            raise RuntimeError(f"Pytest collected an unexpected test path: {item_path}")
        inventory[item_path].append(str(item["nodeid"]))
    return inventory


def _reachable_main_contract(tree: ast.Module) -> bool:
    """Detect Assert/Raise reachable through main's local helper call graph."""
    functions = {
        node.name: node
        for node in tree.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }
    if "main" not in functions:
        return False
    if not any(isinstance(node, ast.If) and _guard_calls_main(node) for node in tree.body):
        return False
    pending = ["main"]
    visited: set[str] = set()
    has_contract_effect = False
    while pending:
        name = pending.pop()
        if name in visited:
            continue
        visited.add(name)
        function = functions[name]
        if any(isinstance(node, (ast.Assert, ast.Raise)) for node in ast.walk(function)):
            has_contract_effect = True
        for node in ast.walk(function):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id in functions and node.func.id not in visited:
                    pending.append(node.func.id)
    return has_contract_effect


def _top_level_collection_contract(tree: ast.Module) -> bool:
    """Recognize legacy modules whose assertions execute during pytest import."""
    return any(isinstance(node, ast.Assert) for node in tree.body)


def python_contract_inventory(
    paths: list[Path] | None = None,
    cwd: Path = ROOT,
) -> tuple[list[Path], list[Path]]:
    """Partition contracts using actual pytest collection plus explicit main logic.

    Real pytest Items win only when no executable main contract exists. A main
    contract may reach Assert/Raise through local helper calls. Existing legacy
    top-level assertion modules remain pytest import contracts because pytest
    executes those assertions during collection; an empty zero-Item module is
    always rejected.
    """
    contracts = sorted(paths or python_contracts(), key=lambda path: path.as_posix())
    collection = pytest_collection_items(contracts, cwd=cwd)
    pytest_managed: list[Path] = []
    main_only: list[Path] = []
    for path in contracts:
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        item_count = len(collection[path.resolve()])
        has_main_contract = _reachable_main_contract(tree)
        if item_count and has_main_contract:
            raise RuntimeError(f"Ambiguous mixed pytest/main contract: {path}")
        if item_count:
            pytest_managed.append(path)
        elif has_main_contract:
            main_only.append(path)
        elif _top_level_collection_contract(tree):
            pytest_managed.append(path)
        else:
            raise RuntimeError(f"Zero-item Python test has no explicit executable contract: {path}")
    if set(pytest_managed).intersection(main_only):
        raise RuntimeError("Python contract classes overlap")
    if set(pytest_managed).union(main_only) != set(contracts):
        raise RuntimeError("Python contract inventory is incomplete")
    return pytest_managed, main_only


def main() -> int:
    contracts = javascript_contracts()
    if not contracts:
        raise SystemExit("No JavaScript contract tests discovered.")
    for path in contracts:
        relative = path.relative_to(ROOT)
        print(f"[js-contract] {relative.as_posix()}", flush=True)
        subprocess.run(["node", str(relative)], cwd=ROOT, check=True)
    print(f"[js-contract] {len(contracts)} tests passed", flush=True)
    pytest_managed, main_only = python_contract_inventory()
    pytest_command = [sys.executable, "-m", "pytest", "-q"]
    pytest_command.extend(path.relative_to(ROOT).as_posix() for path in pytest_managed)
    subprocess.run(pytest_command, cwd=ROOT, check=True)
    print(f"[pytest-contract] {len(pytest_managed)} modules managed by pytest", flush=True)
    for path in main_only:
        relative = path.relative_to(ROOT)
        print(f"[python-main-contract] {relative.as_posix()}", flush=True)
        subprocess.run([sys.executable, str(relative)], cwd=ROOT, check=True)
    print(f"[python-main-contract] {len(main_only)} scripts passed", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
