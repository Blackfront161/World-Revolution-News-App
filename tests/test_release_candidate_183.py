#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import hashlib
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory


ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "release_audit_183.py"

spec = importlib.util.spec_from_file_location("release_audit_183", AUDIT_PATH)
assert spec and spec.loader
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

report_path = ROOT / "release-readiness-183.json"
before_hash = hashlib.sha256(report_path.read_bytes()).hexdigest()
before_mtime = report_path.stat().st_mtime_ns
with TemporaryDirectory() as temporary:
    status_path = Path(temporary) / "status.txt"
    exit_code = os.system(f'git -C "{ROOT}" status --short -- "{report_path.name}" > "{status_path}"')
    assert exit_code == 0
    before_status = status_path.read_text(encoding="utf-8")
    assert audit.main(["--no-write"]) == 0, "explicit --no-write audit failed"
after_hash = hashlib.sha256(report_path.read_bytes()).hexdigest()
after_mtime = report_path.stat().st_mtime_ns
with TemporaryDirectory() as temporary:
    status_path = Path(temporary) / "status.txt"
    exit_code = os.system(f'git -C "{ROOT}" status --short -- "{report_path.name}" > "{status_path}"')
    assert exit_code == 0
    after_status = status_path.read_text(encoding="utf-8")
assert before_hash == after_hash, "read-only audit changed the tracked report"
assert before_mtime == after_mtime, "read-only audit changed the tracked report mtime"
assert before_status == after_status, "read-only audit changed the report git status"

report = audit.run_audit(root=ROOT, write_report=False)
summary = report["summary"]
check_ids = {item["id"] for item in report["checks"]}

assert report["version"] == audit.EXPECTED_VERSION
assert report["readOnlyAudit"] is True
assert summary["fail"] == 0, [
    item for item in report["checks"] if item["status"] == "fail"
]
assert summary["total"] >= 35
assert "quality-test-file:tests/run_contract_matrix.py" in check_ids
assert "quality-js-discovery" in check_ids
assert "quality-full-pytest" in check_ids
assert "quality-audit-no-write" in check_ids
assert "file:solidarity-network-21.js" in check_ids
assert "app-shell:solidarity-network-21.js" in check_ids

with TemporaryDirectory() as temporary:
    missing_audit = audit.ReleaseAudit(Path(temporary))
    missing_audit.check_files()
    missing_module = next(item for item in missing_audit.checks if item["id"] == "file:solidarity-network-21.js")
    assert missing_module["status"] == "fail", "audit must fail when the solidarity network runtime is absent"

with TemporaryDirectory() as temporary:
    generated = audit.run_audit(root=Path(temporary), write_report=True)
    assert generated["readOnlyAudit"] is False
    assert (Path(temporary) / audit.REPORT_PATH.name).is_file(), "explicit report generation must still write"

with TemporaryDirectory() as temporary:
    artifact_path = Path(temporary) / audit.REPORT_PATH.name
    in_memory = audit.run_audit(root=ROOT, write_report=False)
    audit.write_report_artifact(in_memory, artifact_path)
    assert json.loads(artifact_path.read_text(encoding="utf-8")) == in_memory
    cli_artifact = Path(temporary) / "cli" / audit.REPORT_PATH.name
    assert audit.main(["--no-write", "--artifact", str(cli_artifact)]) == 0
    cli_report = json.loads(cli_artifact.read_text(encoding="utf-8"))
    assert cli_report["readOnlyAudit"] is True
    assert cli_report["summary"] == in_memory["summary"]
    assert hashlib.sha256(report_path.read_bytes()).hexdigest() == before_hash
    assert report_path.stat().st_mtime_ns == before_mtime
    assert audit.main(["--artifact", str(Path(temporary) / "forbidden.json")]) == 2

source_recovery = (ROOT / "source_recovery.py").read_text(encoding="utf-8")
assert "PERMANENT_FAILURE_THRESHOLD = 4" in source_recovery
assert "PERMANENT_FAILURE_MIN_AGE = timedelta(hours=12)" in source_recovery
assert '"automaticDeletion": False' in source_recovery
assert "unlink(" not in source_recovery
assert "rmtree(" not in source_recovery

worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
assert "isIndexNavigation ? './index.html' : request" in worker
assert "cache.match(request, { ignoreSearch: true })" in worker

quality = (
    ROOT / ".github" / "workflows" / "quality-gate.yml"
).read_text(encoding="utf-8")
for command in (
    "python tests/run_contract_matrix.py",
    'python release_audit_183.py --no-write --artifact "${RUNNER_TEMP}/release-readiness-183.json"',
    "node tests/test_runtime_selftest_183.js",
    "python tests/test_release_candidate_183.py",
    "node tests/test_solidarity_worker_fallback.js",
):
    assert command in quality
assert "${{ runner.temp }}/release-readiness-183.json" in quality
assert "\n            release-readiness-183.json" not in quality
assert audit.REPORT_PATH.name == "release-readiness-183.json"

print(
    f"WRN {audit.EXPECTED_VERSION} production-candidate audit: "
    f"{summary['pass']} passed, "
    f"{summary['warning']} warnings, "
    f"{summary['total']} total"
)
