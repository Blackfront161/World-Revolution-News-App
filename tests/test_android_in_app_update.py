from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / "android-wrapper" / "android"
APP = ANDROID / "app"
JAVA = APP / "src" / "main" / "java" / "com" / "world" / "revolution"


class AndroidInAppUpdateContractTest(unittest.TestCase):
    def test_official_play_update_dependency_is_pinned(self) -> None:
        gradle = (APP / "build.gradle").read_text(encoding="utf-8")
        self.assertIn("com.google.android.play:app-update:2.1.0", gradle)
        self.assertNotIn("app-update-ktx", gradle)

    def test_policy_uses_flexible_normally_and_immediate_only_when_critical(self) -> None:
        policy = (JAVA / "WRNAppUpdatePolicy.java").read_text(encoding="utf-8")
        self.assertIn("CRITICAL_UPDATE_PRIORITY = 4", policy)
        self.assertIn("updatePriority >= CRITICAL_UPDATE_PRIORITY && immediateAllowed", policy)
        self.assertIn("if (flexibleAllowed)", policy)
        self.assertIn("RETRY_COOLDOWN_MILLIS", policy)

    def test_controller_handles_lifecycle_completion_and_safe_failures(self) -> None:
        controller = (JAVA / "WRNAppUpdateController.java").read_text(encoding="utf-8")
        main = (JAVA / "MainActivity.java").read_text(encoding="utf-8")

        for lifecycle in ("onStart", "onResume", "onStop", "onDestroy"):
            self.assertIn(f"appUpdateController.{lifecycle}()", main)
            self.assertIn(f"public void {lifecycle}()", main)
        self.assertIn("registerListener(installStateListener)", controller)
        self.assertIn("unregisterListener(installStateListener)", controller)
        self.assertIn("InstallStatus.DOWNLOADED", controller)
        self.assertIn("showCompletionConfirmation()", controller)
        self.assertIn("CompletionPrompt", controller)
        self.assertIn("completionPrompt.show(", controller)
        self.assertIn("completeUpdate()", controller)
        self.assertIn("Activity.RESULT_OK", controller)
        self.assertIn("suppressFurtherPromptsForCooldown()", controller)
        self.assertIn("updateFlowLauncher.unregister()", controller)
        self.assertIn("LongSupplier currentTimeMillis", controller)
        self.assertIn("WRNAppUpdateController(\n        AppUpdateManager", controller)

    def test_fake_manager_contract_covers_required_states(self) -> None:
        fake_test = (
            APP
            / "src/androidTest/java/com/world/revolution/WRNAppUpdateFakeManagerInstrumentedTest.java"
        ).read_text(encoding="utf-8")
        for contract in (
            "setUpdateNotAvailable()",
            "setUpdateAvailable",
            "userRejectsUpdate()",
            "downloadCompletes()",
            "confirmRestart()",
            "controller.onStop()",
            "controller.onDestroy()",
            "handleUpdateFlowResult(Activity.RESULT_CANCELED)",
        ):
            self.assertIn(contract, fake_test)


if __name__ == "__main__":
    unittest.main()
