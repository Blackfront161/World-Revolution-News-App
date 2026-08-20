from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / "android-wrapper"
CAPACITOR_PACKAGES = (
    "@capacitor/android",
    "@capacitor/cli",
    "@capacitor/core",
)


class AndroidToolchainFoundationTest(unittest.TestCase):
    def test_npm_lock_and_capacitor_versions_are_authoritative(self) -> None:
        package = json.loads((WRAPPER / "package.json").read_text(encoding="utf-8"))
        lock = json.loads((WRAPPER / "package-lock.json").read_text(encoding="utf-8"))

        self.assertEqual("2.1.1", package["version"])
        self.assertEqual("2.1.1", lock["version"])
        self.assertEqual("2.1.1", lock["packages"][""]["version"])
        for name in CAPACITOR_PACKAGES:
            self.assertEqual("8.4.0", package["dependencies"][name])
            self.assertEqual("8.4.0", lock["packages"][""]["dependencies"][name])
            self.assertEqual("8.4.0", lock["packages"][f"node_modules/{name}"]["version"])

        self.assertEqual("cap sync android", package["scripts"]["sync:android"])
        self.assertEqual("cap open android", package["scripts"]["open:android"])
        self.assertNotIn("npx", package["scripts"]["sync:android"])
        self.assertNotIn("pnpm", package["scripts"]["sync:android"])

        gradle = (WRAPPER / "android/app/build.gradle").read_text(encoding="utf-8")
        self.assertIn("versionCode 26", gradle)
        self.assertIn('versionName "2.1.1"', gradle)

    def test_generated_capacitor_settings_and_pnpm_workspace_are_not_sources(self) -> None:
        self.assertFalse((WRAPPER / "pnpm-workspace.yaml").exists())
        ignore = (WRAPPER / ".gitignore").read_text(encoding="utf-8")
        self.assertIn("/android/capacitor.settings.gradle", ignore)

        ignored = subprocess.run(
            [
                "git",
                "check-ignore",
                "--no-index",
                "--quiet",
                "android-wrapper/android/capacitor.settings.gradle",
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(0, ignored.returncode)

    def test_instrumentation_uses_production_identity_and_launches_main_activity(self) -> None:
        test_source = (
            WRAPPER
            / "android/app/src/androidTest/java/com/world/revolution/AppLaunchInstrumentedTest.java"
        ).read_text(encoding="utf-8")

        self.assertIn("package com.world.revolution;", test_source)
        self.assertIn('assertEquals("com.world.revolution", appContext.getPackageName())', test_source)
        self.assertIn("ActivityScenario.launch(MainActivity.class)", test_source)
        self.assertNotIn("com.getcapacitor.app", test_source)
        self.assertNotIn("com.getcapacitor.myapp", test_source)


if __name__ == "__main__":
    unittest.main()
