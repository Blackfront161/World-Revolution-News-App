from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import zipfile

import pytest


ROOT = Path(__file__).resolve().parents[1]
HELPERS = ROOT / "scripts" / "wrn-aab-release-helpers.ps1"


def ps_quote(path: Path) -> str:
    return str(path).replace("'", "''")


def run_powershell(command: str) -> subprocess.CompletedProcess[str]:
    powershell = shutil.which("pwsh")
    assert powershell, "PowerShell 7 (pwsh) is required for AAB guard tests"
    return subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-Command", command],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def test_input_aab_is_bound_to_expected_sha256(tmp_path: Path) -> None:
    candidate = tmp_path / "candidate.aab"
    candidate.write_bytes(b"deterministic unsigned candidate")
    expected = hashlib.sha256(candidate.read_bytes()).hexdigest().upper()
    helper = ps_quote(HELPERS)
    aab = ps_quote(candidate)

    accepted = run_powershell(
        f". '{helper}'; Assert-WrnAabInputHash -AabPath '{aab}' -ExpectedSha256 '{expected}'"
    )
    assert accepted.returncode == 0, accepted.stdout + accepted.stderr
    assert expected in accepted.stdout

    rejected = run_powershell(
        f". '{helper}'; Assert-WrnAabInputHash -AabPath '{aab}' -ExpectedSha256 '{'0' * 64}'"
    )
    assert rejected.returncode != 0
    assert "Erwarteter SHA-256" in rejected.stderr
    assert "Tatsächlicher SHA-256" in rejected.stderr


def test_signature_metadata_requires_sf_and_signature_block(tmp_path: Path) -> None:
    unsigned = tmp_path / "unsigned.aab"
    signed_shape = tmp_path / "signed-shape.aab"
    with zipfile.ZipFile(unsigned, "w") as archive:
        archive.writestr("base/assets/public/index.html", "ok")
    with zipfile.ZipFile(signed_shape, "w") as archive:
        archive.writestr("META-INF/MANIFEST.MF", "manifest")
        archive.writestr("META-INF/WRN_KEY.SF", "signature file")
        archive.writestr("META-INF/WRN_KEY.RSA", "signature block")

    helper = ps_quote(HELPERS)
    command = (
        f". '{helper}'; "
        f"[pscustomobject]@{{unsigned=@(Get-WrnAabSignatureEntries -AabPath '{ps_quote(unsigned)}');"
        f"signed=@(Get-WrnAabSignatureEntries -AabPath '{ps_quote(signed_shape)}')}} "
        "| ConvertTo-Json -Compress"
    )
    completed = run_powershell(command)
    assert completed.returncode == 0, completed.stdout + completed.stderr
    data = json.loads(completed.stdout)
    assert data["unsigned"] == []
    assert sorted(data["signed"]) == ["META-INF/WRN_KEY.RSA", "META-INF/WRN_KEY.SF"]


def test_gui_signer_checks_hash_before_password_dialog_and_refuses_overwrite() -> None:
    script = (ROOT / "scripts" / "sign-google-play-aab-2.0.8-gui.ps1").read_text(encoding="utf-8")
    build_script = (ROOT / "scripts" / "build-android-release.ps1").read_text(encoding="utf-8")
    assert script.index("Assert-WrnAabInputHash") < script.index("ShowDialog")
    assert "Ausgabe-AAB existiert bereits und wird nicht überschrieben" in script
    assert "Invoke-WrnArtifactTransaction" in script
    assert "New-WrnVerifiedSignedAab" in script
    assert "Ausgabe-SHA-256" in script
    helpers = (ROOT / "scripts" / "wrn-aab-release-helpers.ps1").read_text(encoding="utf-8")
    assert "ExpectedCertificateSha256" in helpers
    assert ".wrn-publish-" in helpers
    assert ".wrn-artifact-transaction.json" in helpers
    assert "Repair-WrnArtifactTransaction" in helpers
    assert "GetLinkCount" in helpers
    assert "[System.IO.File]::Move" in helpers
    assert "-BuildRoot $outputRoot" in build_script
    assert "lintRelease" in build_script
    assert "testReleaseUnitTest" in build_script
    assert "OfflineGradle" in build_script
    assert 'resolvedCommit = ""' in build_script
    assert 'sourceHeadCommit = ""' in build_script
    assert 'sourceByteProvenance = "pending"' in build_script
    assert "nicht als byteidentisch mit einem Git-Commit attestiert" in build_script
    assert "Raw-Blob-Byteidentität wird nicht behauptet" in build_script
    assert 'resolvedCommit = "$headCommit+working-tree"' not in build_script
    assert script.index("Invoke-WrnArtifactTransaction") < script.index("Signierte AAB erstellt")
    assert build_script.index("Invoke-WrnArtifactTransaction") < build_script.index("Release erfolgreich")
    assert "Name = 'JsonReport'" in build_script and "Name = 'MarkdownReport'" in build_script


def test_build_release_transaction_callbacks_keep_helper_scope(tmp_path: Path) -> None:
    build_script = (ROOT / "scripts" / "build-android-release.ps1").read_text(encoding="utf-8")
    transaction_callbacks = build_script[
        build_script.index("    $prepare = {") : build_script.index("    Invoke-WrnArtifactTransaction")
    ]

    assert ".GetNewClosure()" not in transaction_callbacks
    assert "Get-WrnAabWebAssetManifest" in transaction_callbacks
    assert "Compare-WrnHashManifest" in transaction_callbacks
    assert "New-WrnVerifiedSignedAab" in transaction_callbacks
    assert "Assert-WrnAabSignature" in transaction_callbacks

    output = tmp_path / "scope-probe.txt"
    completed = run_powershell(
        "& { "
        f". '{ps_quote(HELPERS)}'; "
        f"$artifacts = @([pscustomobject]@{{ Name = 'Probe'; FinalPath = '{ps_quote(output)}' }}); "
        "$expected = @{ 'asset.txt' = 'scope-ok' }; "
        "$prepare = { param($entries) "
        "Set-Content -LiteralPath $entries[0].TemporaryPath -Value 'scope-ok' -NoNewline; "
        "$actual = @{ 'asset.txt' = (Get-Content -LiteralPath $entries[0].TemporaryPath -Raw) }; "
        "if (@(Compare-WrnHashManifest $expected $actual).Count) { throw 'prepare scope mismatch' } }; "
        "$validate = { param($entries) "
        "$actual = @{ 'asset.txt' = (Get-Content -LiteralPath $entries[0].TemporaryPath -Raw) }; "
        "if (@(Compare-WrnHashManifest $expected $actual).Count) { throw 'validate scope mismatch' }; "
        "[pscustomobject]@{ Valid = $true } }; "
        "Invoke-WrnArtifactTransaction -Artifacts $artifacts "
        f"-BuildRoot '{ps_quote(tmp_path)}' -Prepare $prepare -Validate $validate | Out-Null "
        "}"
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    assert output.read_text(encoding="utf-8") == "scope-ok"


def test_version_code_contract_distinguishes_local_build_from_play_console() -> None:
    build_script = (ROOT / "scripts" / "build-android-release.ps1").read_text(encoding="utf-8")
    automation = (ROOT / "RELEASE_AUTOMATION.md").read_text(encoding="utf-8")
    handoff = (ROOT / "RELEASE-HANDOFF-2.0.8.md").read_text(encoding="utf-8")
    assert "if ($nextCode -lt $oldCode)" in build_script
    assert "lokalen Code" in automation and "erneut gebaut" in automation
    assert "nicht erkennen" in automation
    assert "Play Console" in automation
    assert "höherer Versionscode" in handoff


def test_atomic_output_removes_failed_temporary_file_and_allows_retry() -> None:
    if os.name != "nt":
        pytest.skip("Atomic AAB regression requires Windows reparse-point semantics")
    powershell = shutil.which("pwsh")
    assert powershell, "PowerShell 7 (pwsh) is required for the atomic AAB regression test"
    script = ROOT / "tests" / "test_aab_atomic_output.ps1"
    completed = subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-File", str(script)],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    assert "hard-crash recovery" in completed.stdout
    assert "reparse and hardlink cleanup gates passed" in completed.stdout


def test_real_aab_signature_gate_read_only() -> None:
    unsigned = Path(
        r"C:\Users\patri\Documents\World Rev Ne\android-release-project\release\corrected-4a1f2b4\WorldRevolutionNews-2.0.8-code23-4a1f2b4-unsigned.aab"
    )
    signed = ROOT / "outputs" / "WorldRevolutionNews-2.0.8-code23-release37.aab"
    jarsigner = Path(r"C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe")
    keytool = Path(r"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe")
    missing = [str(path) for path in (unsigned, signed, jarsigner, keytool) if not path.is_file()]
    if missing:
        pytest.skip("Read-only signature fixtures/tools unavailable: " + ", ".join(missing))

    expected = "7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8"
    wrong = "0" * 64
    command = (
        f". '{ps_quote(HELPERS)}'; "
        f"$unsigned = Test-WrnAabSignature -AabPath '{ps_quote(unsigned)}' -JarsignerPath '{ps_quote(jarsigner)}' -KeytoolPath '{ps_quote(keytool)}' -ExpectedCertificateSha256 '{expected}'; "
        f"$signed = Test-WrnAabSignature -AabPath '{ps_quote(signed)}' -JarsignerPath '{ps_quote(jarsigner)}' -KeytoolPath '{ps_quote(keytool)}' -ExpectedCertificateSha256 '{expected}'; "
        f"$wrong = Test-WrnAabSignature -AabPath '{ps_quote(signed)}' -JarsignerPath '{ps_quote(jarsigner)}' -KeytoolPath '{ps_quote(keytool)}' -ExpectedCertificateSha256 '{wrong}'; "
        "[pscustomobject]@{unsigned=$unsigned;signed=$signed;wrong=$wrong} | ConvertTo-Json -Depth 5 -Compress"
    )
    completed = run_powershell(command)
    assert completed.returncode == 0, completed.stdout + completed.stderr
    data = json.loads(completed.stdout)

    assert data["unsigned"]["JarsignerExitCode"] == 0
    assert data["unsigned"]["JarsignerReportedUnsigned"] is True
    assert data["unsigned"]["Valid"] is False
    assert data["signed"]["Valid"] is True
    assert data["signed"]["ActualCertificateSha256"] == expected
    assert data["wrong"]["Valid"] is False
    assert data["wrong"]["CertificateMatches"] is False
