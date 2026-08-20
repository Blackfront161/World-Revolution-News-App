from __future__ import annotations

from pathlib import Path
import shutil
import subprocess


ROOT = Path(__file__).resolve().parents[1]


def test_recursive_android_asset_manifest_and_copy() -> None:
    powershell = shutil.which("pwsh")
    assert powershell, "PowerShell 7 (pwsh) is required for the Android release regression test"
    script = ROOT / "tests" / "test_android_release_assets.ps1"
    completed = subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-File", str(script)],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    assert "missing, unexpected, changed, stale and junction paths detected safely" in completed.stdout


def test_webdir_quarantine_and_restore_guards() -> None:
    powershell = shutil.which("pwsh")
    assert powershell, "PowerShell 7 (pwsh) is required for the webDir quarantine regression test"
    script = ROOT / "tests" / "test_webdir_quarantine.ps1"
    completed = subprocess.run(
        [powershell, "-NoLogo", "-NoProfile", "-File", str(script)],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    assert "without touching external or foreign files" in completed.stdout
