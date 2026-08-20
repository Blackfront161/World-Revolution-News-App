from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path, PureWindowsPath
import shutil
import subprocess

import pytest


ROOT = Path(__file__).resolve().parents[1]
SIGNER = ROOT / "scripts" / "sign-google-play-aab-2.1.0-code25-gui.ps1"
HELPERS = ROOT / "scripts" / "wrn-aab-release-helpers.ps1"
WINDOWS_INPUT_AAB = PureWindowsPath(
    r"C:\Users\patri\Documents\World Rev Ne\android-release-project\release\hardening-2.1.0-code25-6a86e75\WorldRevolutionNews-2.1.0-code25-6a86e75-unsigned.aab"
)
WINDOWS_OUTPUT_AAB = WINDOWS_INPUT_AAB.with_name(
    "WorldRevolutionNews-2.1.0-code25-6a86e75-signed.aab"
)
WINDOWS_REPORT = WINDOWS_INPUT_AAB.with_name(
    "WorldRevolutionNews-2.1.0-code25-6a86e75-signed.signature-report.json"
)
INPUT_AAB = Path(str(WINDOWS_INPUT_AAB))
OUTPUT_AAB = Path(str(WINDOWS_OUTPUT_AAB))
REPORT = Path(str(WINDOWS_REPORT))
EXPECTED_INPUT = "878231B1CE6B4AB1218AC3F906A5DA27B754216F93DFB0DDB52E454739AFDCC6"
EXPECTED_CERT = "7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8"


def test_code25_gui_signer_is_bound_and_secret_safe() -> None:
    source = SIGNER.read_text(encoding="utf-8")
    helpers = HELPERS.read_text(encoding="utf-8")

    for value in (
        str(WINDOWS_INPUT_AAB.parent),
        WINDOWS_INPUT_AAB.name,
        WINDOWS_OUTPUT_AAB.name,
        EXPECTED_INPUT,
        EXPECTED_CERT,
        "WRN_KEY",
    ):
        assert value in source
    assert WINDOWS_REPORT.name in source
    assert source.count("UseSystemPasswordChar = $true") == 2
    assert "-storepass:env" not in source
    assert "-keypass:env" not in source
    assert "$env:WRN_KEYSTORE_PASSWORD = $storeBox.Text" in source
    assert "$env:WRN_KEY_PASSWORD = $(if ($keyBox.Text)" in source
    assert source.count("$env:WRN_KEYSTORE_PASSWORD = $null") >= 3
    assert source.count("$env:WRN_KEY_PASSWORD = $null") >= 3
    assert source.index("Assert-WrnAabInputHash") < source.index("ShowDialog")
    assert "Get-WrnAabWebAssetManifest -AabPath $unsignedAab" in source
    assert "Get-WrnAabPayloadManifest -AabPath $unsignedAab" in source
    assert "Get-WrnAabSignatureEntries -AabPath $unsignedAab" in source
    assert "-ExpectedInputSha256 $expectedUnsignedSha256" in source
    assert "-ExpectedAssetManifest $expectedAssetManifest" in source
    assert "-ExpectedPayloadManifest $expectedPayloadManifest" in source
    assert "Invoke-WrnArtifactTransaction" in source
    assert "Ausgabe existiert bereits und wird nicht überschrieben" in source
    assert "uploadPerformed = $false" in source
    assert "New-WrnVerifiedSignedAab" in source
    assert "[string]$ExpectedInputSha256 = ''" in helpers
    assert "Assert-WrnAabInputHash -AabPath $inputPath -ExpectedSha256 $ExpectedInputSha256" in helpers
    assert "[System.IO.FileShare]::Read" in helpers
    assert "PayloadDifferences = $payloadDifferences" in helpers


def test_exact_local_preflight_is_read_only() -> None:
    if os.name != "nt":
        pytest.skip("Exact AAB preflight uses Windows signing tools and paths")
    powershell = shutil.which("pwsh")
    keystore = Path(r"C:\Users\patri\Desktop\App Entwicklung\Android_Keys\world-revolution.jks")
    tools = (
        Path(r"C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe"),
        Path(r"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"),
    )
    if not powershell or not INPUT_AAB.is_file() or not keystore.is_file() or not all(path.is_file() for path in tools):
        pytest.skip("Exact local AAB/keystore/Java preflight fixtures are unavailable")
    if OUTPUT_AAB.exists() or REPORT.exists():
        pytest.skip("Exact local preflight requires unused output paths")

    before_hash = hashlib.sha256(INPUT_AAB.read_bytes()).hexdigest().upper()
    before_mtime = INPUT_AAB.stat().st_mtime_ns
    environment = os.environ.copy()
    environment["WRN_KEYSTORE_PASSWORD"] = "must-not-be-used"
    environment["WRN_KEY_PASSWORD"] = "must-not-be-used"
    completed = subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-File", str(SIGNER), "-PreflightOnly"],
        cwd=ROOT,
        env=environment,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    report = json.loads(completed.stdout)
    assert report["status"] == "preflight-passed"
    assert report["inputSha256"] == EXPECTED_INPUT == before_hash
    assert report["inputSignatureEntryCount"] == 0
    assert report["inputAssetCount"] > 0
    assert report["inputPayloadCount"] >= report["inputAssetCount"]
    assert report["outputExists"] is False
    assert report["reportExists"] is False
    assert hashlib.sha256(INPUT_AAB.read_bytes()).hexdigest().upper() == before_hash
    assert INPUT_AAB.stat().st_mtime_ns == before_mtime
    assert not OUTPUT_AAB.exists()
    assert not REPORT.exists()
