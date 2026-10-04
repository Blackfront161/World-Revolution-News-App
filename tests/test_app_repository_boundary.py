from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / ".github" / "workflows"
APP_WORKFLOWS = {"quality-gate.yml", "validate-app.yml", "ios-build.yml"}


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


def test_ios_compilation_is_manual_sha_bound_and_unsigned() -> None:
    text = (WORKFLOWS / "ios-build.yml").read_text(encoding="utf-8")
    assert re.search(r"(?m)^  workflow_dispatch:\s*$", text)
    assert not re.search(r"(?m)^  (?:push|pull_request|schedule|workflow_run):", text)
    assert "source_sha:" in text and "required: true" in text
    assert '[[ "$WRN_IOS_SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]]' in text
    assert "ref: ${{ inputs.source_sha }}" in text
    assert 'test "$(git rev-parse HEAD)" = "$WRN_IOS_SOURCE_SHA"' in text
    assert "persist-credentials: false" in text
    assert "runs-on: macos-26" in text and "timeout-minutes: 40" in text
    assert "build:simulator" in text and "build:device:unsigned" in text
    assert "CODE_SIGNING_ALLOWED=NO" in text
    assert not re.search(r"(?i)secrets\.|write-all|release create|apple-id|exportArchive", text)
    assert text.count("retention-days: 3") == 2
    assert "outputs/ios/cloud/WRN-device-unsigned.tar.gz" in text
    assert not re.search(r"(?m)^\s+path:.*\*", text)
