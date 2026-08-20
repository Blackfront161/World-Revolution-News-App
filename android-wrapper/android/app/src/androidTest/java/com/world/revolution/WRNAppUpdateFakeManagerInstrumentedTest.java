package com.world.revolution;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContract;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.app.ActivityOptionsCompat;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import com.google.android.play.core.appupdate.testing.FakeAppUpdateManager;
import com.google.android.play.core.install.model.AppUpdateType;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;

@RunWith(AndroidJUnit4.class)
public class WRNAppUpdateFakeManagerInstrumentedTest {
    private static final int NEXT_VERSION_CODE = 26;
    private static final long NOW = 1_800_000_000_000L;
    private static final long STATE_TIMEOUT_NANOS = TimeUnit.SECONDS.toNanos(5);

    private SharedPreferences preferences;

    @Before
    public void clearUpdatePreferences() {
        Context context = ApplicationProvider.getApplicationContext();
        preferences = context.getSharedPreferences(
            WRNAppUpdateController.PREFERENCES_NAME,
            Context.MODE_PRIVATE
        );
        preferences.edit().clear().commit();
    }

    @Test
    public void noUpdateDoesNotLaunchAndNormalUpdateUsesFlexibleFlow() {
        FakeAppUpdateManager noUpdateManager = newManager();
        WRNAppUpdateController noUpdateController = controller(
            noUpdateManager,
            new RecordingLauncher(),
            new RecordingPrompt()
        );

        noUpdateManager.setUpdateNotAvailable();
        noUpdateController.onResume();
        awaitMainLooperIdle();
        assertFalse(noUpdateManager.isConfirmationDialogVisible());
        assertFalse(noUpdateManager.isImmediateFlowVisible());

        FakeAppUpdateManager normalUpdateManager = newManager();
        normalUpdateManager.setUpdateAvailable(
            NEXT_VERSION_CODE,
            AppUpdateType.FLEXIBLE
        );
        normalUpdateManager.setUpdatePriority(3);
        controller(
            normalUpdateManager,
            new RecordingLauncher(),
            new RecordingPrompt()
        ).onResume();
        awaitCondition(
            "Flexible update flow did not become visible",
            normalUpdateManager::isConfirmationDialogVisible
        );
        assertTrue(normalUpdateManager.isConfirmationDialogVisible());
        assertFalse(normalUpdateManager.isImmediateFlowVisible());
    }

    @Test
    public void criticalUpdateUsesImmediateFlow() {
        FakeAppUpdateManager manager = newManager();
        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.IMMEDIATE);
        manager.setUpdatePriority(WRNAppUpdatePolicy.CRITICAL_UPDATE_PRIORITY);

        controller(manager, new RecordingLauncher(), new RecordingPrompt()).onResume();

        awaitCondition(
            "Critical immediate update flow did not become visible",
            manager::isImmediateFlowVisible
        );

        assertTrue(manager.isImmediateFlowVisible());
        assertFalse(manager.isConfirmationDialogVisible());
    }

    @Test
    public void canceledResultCreatesCooldownAndPreventsRelaunch() {
        FakeAppUpdateManager manager = newManager();
        RecordingLauncher firstLauncher = new RecordingLauncher();
        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        WRNAppUpdateController first = controller(
            manager,
            firstLauncher,
            new RecordingPrompt()
        );

        first.onResume();
        awaitCondition(
            "Flexible update flow did not launch before cancellation",
            manager::isConfirmationDialogVisible
        );
        manager.userRejectsUpdate();
        first.handleUpdateFlowResult(Activity.RESULT_CANCELED);
        awaitCondition(
            "Canceled update result did not persist its cooldown",
            () -> preferences.getLong(
                WRNAppUpdateController.LAST_DECLINED_OR_FAILED_AT,
                0L
            ) == NOW
        );
        assertEquals(
            NOW,
            preferences.getLong(WRNAppUpdateController.LAST_DECLINED_OR_FAILED_AT, 0L)
        );

        RecordingLauncher secondLauncher = new RecordingLauncher();
        controller(manager, secondLauncher, new RecordingPrompt()).onResume();
        awaitMainLooperIdle();
        assertFalse(manager.isConfirmationDialogVisible());
    }

    @Test
    public void downloadedUpdateWaitsForExplicitRestartConfirmation() {
        FakeAppUpdateManager manager = newManager();
        RecordingPrompt prompt = new RecordingPrompt();
        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        WRNAppUpdateController controller = controller(
            manager,
            new RecordingLauncher(),
            prompt
        );

        controller.onStart();
        controller.onResume();
        awaitCondition(
            "Flexible update confirmation did not become visible",
            manager::isConfirmationDialogVisible
        );
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        manager.downloadCompletes();

        awaitCondition(
            "Downloaded update did not request restart confirmation",
            () -> prompt.showCount == 1
        );

        assertEquals(1, prompt.showCount);
        assertFalse(manager.isInstallSplashScreenVisible());

        prompt.confirmRestart();
        awaitCondition(
            "Update completed before or without restart confirmation",
            manager::isInstallSplashScreenVisible
        );
        assertTrue(manager.isInstallSplashScreenVisible());
        manager.installCompletes();
    }

    @Test
    public void failedDownloadCreatesCooldownAndDoesNotNagAgain() {
        FakeAppUpdateManager manager = newManager();
        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        WRNAppUpdateController first = controller(
            manager,
            new RecordingLauncher(),
            new RecordingPrompt()
        );

        first.onStart();
        first.onResume();
        awaitCondition(
            "Flexible update confirmation did not become visible before failure",
            manager::isConfirmationDialogVisible
        );
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        manager.downloadFails();
        awaitCondition(
            "Failed download did not persist its cooldown",
            () -> preferences.getLong(
                WRNAppUpdateController.LAST_DECLINED_OR_FAILED_AT,
                0L
            ) == NOW
        );
        assertEquals(
            NOW,
            preferences.getLong(WRNAppUpdateController.LAST_DECLINED_OR_FAILED_AT, 0L)
        );

        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        RecordingLauncher secondLauncher = new RecordingLauncher();
        controller(manager, secondLauncher, new RecordingPrompt()).onResume();
        awaitMainLooperIdle();
        assertFalse(manager.isConfirmationDialogVisible());
    }

    @Test
    public void downloadedUpdateCanBeDeferredForRestOfSession() {
        FakeAppUpdateManager manager = newManager();
        RecordingPrompt prompt = new RecordingPrompt();
        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        WRNAppUpdateController controller = controller(
            manager,
            new RecordingLauncher(),
            prompt
        );

        controller.onStart();
        controller.onResume();
        awaitCondition(
            "Flexible update confirmation did not become visible before defer",
            manager::isConfirmationDialogVisible
        );
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        manager.downloadCompletes();
        awaitCondition(
            "Downloaded update did not show the deferrable restart prompt",
            () -> prompt.showCount == 1
        );
        prompt.defer();
        controller.onResume();
        awaitMainLooperIdle();

        assertEquals(1, prompt.showCount);
        assertFalse(manager.isInstallSplashScreenVisible());
    }

    @Test
    public void stopUnregistersListenerAndDestroyUnregistersLauncher() {
        FakeAppUpdateManager manager = newManager();
        RecordingLauncher launcher = new RecordingLauncher();
        RecordingPrompt prompt = new RecordingPrompt();
        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        WRNAppUpdateController controller = controller(manager, launcher, prompt);

        controller.onStart();
        controller.onResume();
        awaitCondition(
            "Flexible update confirmation did not become visible before stop",
            manager::isConfirmationDialogVisible
        );
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        controller.onStop();
        manager.downloadCompletes();
        awaitMainLooperIdle();

        assertEquals(0, prompt.showCount);
        controller.onDestroy();
        assertTrue(launcher.unregistered);
        assertEquals(1, prompt.dismissCount);
    }

    private WRNAppUpdateController controller(
        FakeAppUpdateManager manager,
        RecordingLauncher launcher,
        RecordingPrompt prompt
    ) {
        return new WRNAppUpdateController(
            manager,
            preferences,
            launcher,
            prompt,
            () -> NOW
        );
    }

    private static FakeAppUpdateManager newManager() {
        Context context = ApplicationProvider.getApplicationContext();
        return new FakeAppUpdateManager(context);
    }

    private static void awaitMainLooperIdle() {
        InstrumentationRegistry.getInstrumentation().waitForIdleSync();
    }

    private static void awaitCondition(String failureMessage, BooleanSupplier condition) {
        long deadline = System.nanoTime() + STATE_TIMEOUT_NANOS;
        do {
            awaitMainLooperIdle();
            if (condition.getAsBoolean()) return;
            Thread.yield();
        } while (System.nanoTime() < deadline);
        fail(failureMessage);
    }

    private static final class RecordingLauncher
        extends ActivityResultLauncher<IntentSenderRequest> {
        private volatile boolean unregistered;

        @Override
        public void launch(IntentSenderRequest input, ActivityOptionsCompat options) {}

        @Override
        public void unregister() {
            unregistered = true;
        }

        @Override
        public ActivityResultContract<IntentSenderRequest, ?> getContract() {
            return new ActivityResultContracts.StartIntentSenderForResult();
        }
    }

    private static final class RecordingPrompt
        implements WRNAppUpdateController.CompletionPrompt {
        private volatile int showCount;
        private volatile int dismissCount;
        private volatile boolean showing;
        private volatile Runnable restart;
        private volatile Runnable defer;

        @Override
        public boolean canShow() {
            return true;
        }

        @Override
        public boolean isShowing() {
            return showing;
        }

        @Override
        public void show(Runnable restart, Runnable defer) {
            showCount += 1;
            showing = true;
            this.restart = restart;
            this.defer = defer;
        }

        @Override
        public void dismiss() {
            dismissCount += 1;
            showing = false;
        }

        @Override
        public void showInstallFailure() {}

        private void confirmRestart() {
            showing = false;
            restart.run();
        }

        private void defer() {
            showing = false;
            defer.run();
        }
    }
}
