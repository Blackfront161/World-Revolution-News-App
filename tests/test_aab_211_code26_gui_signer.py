from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path, PureWindowsPath
import shutil
import subprocess

import pytest


ROOT = Path(__file__).resolve().parents[1]
SIGNER = ROOT / "scripts" / "sign-google-play-aab-2.1.1-code26-968c320-gui.ps1"
OLD_SIGNER = ROOT / "scripts" / "sign-google-play-aab-2.1.0-code25-gui.ps1"
HELPERS = ROOT / "scripts" / "wrn-aab-release-helpers.ps1"

WINDOWS_A_DIR = PureWindowsPath(
    r"C:\Users\patri\Documents\World Rev Ne\wrn-unsigned-output-a-968c320a-20260820-final-r3"
)
WINDOWS_B_DIR = PureWindowsPath(
    r"C:\Users\patri\Documents\World Rev Ne\wrn-unsigned-output-b-968c320a-20260820-final-r3"
)
UNSIGNED_NAME = "WorldRevolutionNews-2.1.1-code26-968c320-unsigned.aab"
SIGNED_NAME = "WorldRevolutionNews-2.1.1-code26-968c320-signed.aab"
SIGNATURE_REPORT_NAME = (
    "WorldRevolutionNews-2.1.1-code26-968c320-signed.signature-report.json"
)
WINDOWS_INPUT_AAB = WINDOWS_A_DIR / UNSIGNED_NAME
WINDOWS_PEER_AAB = WINDOWS_B_DIR / UNSIGNED_NAME
WINDOWS_OUTPUT_AAB = WINDOWS_A_DIR / SIGNED_NAME
WINDOWS_SIGNATURE_REPORT = WINDOWS_A_DIR / SIGNATURE_REPORT_NAME
WINDOWS_BUILD_REPORT = WINDOWS_A_DIR / "release-report-code26.json"
WINDOWS_PEER_BUILD_REPORT = WINDOWS_B_DIR / "release-report-code26.json"

INPUT_AAB = Path(str(WINDOWS_INPUT_AAB))
PEER_AAB = Path(str(WINDOWS_PEER_AAB))
OUTPUT_AAB = Path(str(WINDOWS_OUTPUT_AAB))
SIGNATURE_REPORT = Path(str(WINDOWS_SIGNATURE_REPORT))
BUILD_REPORT = Path(str(WINDOWS_BUILD_REPORT))
PEER_BUILD_REPORT = Path(str(WINDOWS_PEER_BUILD_REPORT))

EXPECTED_COMMIT = "968c320adfe87d1e11e88f99f448a435d4242750"
EXPECTED_INPUT = "1FB816FB213ED78600FAE93170A08238E422C7D37E48DCADEF5D02C5B8FE587D"
EXPECTED_REPORT = "AFD396714D7FEBAA046FFC11A67832C80F2A883C399342FBF1ED4D4AF61A497A"
EXPECTED_PEER_REPORT = "907EDFD39A34028874146D7420FE5E1F6A29ED877EFF42DC5B0D7065C29024B7"
EXPECTED_CERT = "7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8"


def test_code26_gui_signer_is_exactly_bound_and_secret_safe() -> None:
    source = SIGNER.read_text(encoding="utf-8")
    old_source = OLD_SIGNER.read_text(encoding="utf-8")
    helpers = HELPERS.read_text(encoding="utf-8")

    for value in (
        str(WINDOWS_A_DIR),
        str(WINDOWS_B_DIR),
        UNSIGNED_NAME,
        SIGNED_NAME,
        SIGNATURE_REPORT_NAME,
        EXPECTED_COMMIT,
        EXPECTED_INPUT,
        EXPECTED_REPORT,
        EXPECTED_PEER_REPORT,
        EXPECTED_CERT,
        "2.1.1",
        "$expectedVersionCode = 26",
        "WRN_KEY",
    ):
        assert value in source

    assert "hardening-2.1.0-code25-6a86e75" in old_source
    assert "2.1.1" not in old_source and "code26" not in old_source.lower()
    assert source.count("UseSystemPasswordChar = $true") == 2
    assert "$env:WRN_KEYSTORE_PASSWORD = $storeBox.Text" in source
    assert "$env:WRN_KEY_PASSWORD = $(if ($keyBox.Text)" in source
    assert source.count("$env:WRN_KEYSTORE_PASSWORD = $null") >= 3
    assert source.count("$env:WRN_KEY_PASSWORD = $null") >= 3
    assert "$preflight = Invoke-Code26Preflight" in source
    assert source.index("$preflight = Invoke-Code26Preflight") < source.index("ShowDialog")
    assert "Assert-Code26BuildReport" in source
    assert "Assert-Code26KeystoreCertificate" in source
    assert "-storepass:env WRN_KEYSTORE_PASSWORD" in source
    assert "Get-WrnAabWebAssetManifest -AabPath $unsignedAab" in source
    assert "Get-WrnAabPayloadManifest -AabPath $unsignedAab" in source
    assert "Get-WrnAabSignatureEntries -AabPath $unsignedAab" in source
    assert "Compare-WrnHashManifest $selectedPayloadManifest $peerPayloadManifest" in source
    assert "-ExpectedInputSha256 $expectedUnsignedSha256" in source
    assert "-ExpectedAssetManifest $clickPreflight.AssetManifest" in source
    assert "-ExpectedPayloadManifest $clickPreflight.PayloadManifest" in source
    assert "Invoke-WrnArtifactTransaction" in source
    assert "Ausgabe existiert bereits und wird nicht ueberschrieben" in source
    assert "uploadPerformed = $false" in source
    assert "New-WrnVerifiedSignedAab" in source
    assert ".GetNewClosure()" not in source
    for forbidden_upload_command in (
        "gh release",
        "curl.exe",
        "invoke-webrequest",
        "invoke-restmethod",
        "play.google.com/console",
    ):
        assert forbidden_upload_command not in source.lower()
    assert "[string]$ExpectedInputSha256 = ''" in helpers
    assert "[System.IO.FileShare]::Read" in helpers
    assert "PayloadDifferences = $payloadDifferences" in helpers


def test_code26_signer_has_no_powershell_parse_errors() -> None:
    powershell = shutil.which("pwsh")
    if not powershell:
        pytest.skip("PowerShell 7 is unavailable")
    command = (
        "$tokens=$null;$errors=$null;"
        f"[System.Management.Automation.Language.Parser]::ParseFile('{SIGNER}',"
        "[ref]$tokens,[ref]$errors)|Out-Null;"
        "if(@($errors).Count){$errors|ForEach-Object{$_.Message};exit 1}"
    )
    completed = subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-Command", command],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr


def test_exact_code26_preflight_is_read_only() -> None:
    if os.name != "nt":
        pytest.skip("Exact AAB preflight uses Windows signing tools and paths")
    powershell = shutil.which("pwsh")
    keystore = Path(r"C:\Users\patri\Desktop\App Entwicklung\Android_Keys\world-revolution.jks")
    tools = (
        Path(r"C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe"),
        Path(r"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"),
    )
    fixtures = (INPUT_AAB, PEER_AAB, BUILD_REPORT, PEER_BUILD_REPORT, keystore, *tools)
    if not powershell or not all(path.is_file() for path in fixtures):
        pytest.skip("Exact local Code-26 preflight fixtures are unavailable")
    if OUTPUT_AAB.exists() or SIGNATURE_REPORT.exists():
        pytest.skip("Exact local preflight requires unused output paths")

    watched = (INPUT_AAB, PEER_AAB, BUILD_REPORT, PEER_BUILD_REPORT)
    before = {
        path: (hashlib.sha256(path.read_bytes()).hexdigest().upper(), path.stat().st_mtime_ns)
        for path in watched
    }
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
    assert report["sourceCommit"] == EXPECTED_COMMIT
    assert report["versionName"] == "2.1.1"
    assert report["versionCode"] == 26
    assert report["inputSha256"] == report["peerSha256"] == EXPECTED_INPUT
    assert report["buildReportSha256"] == EXPECTED_REPORT
    assert report["peerBuildReportSha256"] == EXPECTED_PEER_REPORT
    assert report["inputAssetCount"] == 350
    assert report["inputPayloadCount"] == 796
    assert report["inputSignatureEntryCount"] == 0
    assert report["peerSignatureEntryCount"] == 0
    assert report["keyAlias"] == "WRN_KEY"
    assert report["expectedCertificateSha256"] == EXPECTED_CERT
    assert report["outputExists"] is False
    assert report["reportExists"] is False
    assert report["uploadPerformed"] is False
    for path, (expected_hash, expected_mtime) in before.items():
        assert hashlib.sha256(path.read_bytes()).hexdigest().upper() == expected_hash
        assert path.stat().st_mtime_ns == expected_mtime
    assert not OUTPUT_AAB.exists()
    assert not SIGNATURE_REPORT.exists()
