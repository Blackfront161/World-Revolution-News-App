package com.world.revolution;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

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

import com.google.android.play.core.appupdate.testing.FakeAppUpdateManager;
import com.google.android.play.core.install.model.AppUpdateType;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class WRNAppUpdateFakeManagerInstrumentedTest {
    private static final int NEXT_VERSION_CODE = 26;
    private static final long NOW = 1_800_000_000_000L;

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
        FakeAppUpdateManager manager = newManager();
        RecordingLauncher launcher = new RecordingLauncher();
        RecordingPrompt prompt = new RecordingPrompt();
        WRNAppUpdateController controller = controller(manager, launcher, prompt);

        manager.setUpdateNotAvailable();
        controller.onResume();
        assertEquals(0, launcher.launchCount);

        manager.setUpdateAvailable(NEXT_VERSION_CODE);
        manager.setUpdatePriority(3);
        controller.onResume();
        assertEquals(1, launcher.launchCount);
        assertTrue(manager.isConfirmationDialogVisible());
        assertFalse(manager.isImmediateFlowVisible());
    }

    @Test
    public void criticalUpdateUsesImmediateFlow() {
        FakeAppUpdateManager manager = newManager();
        RecordingLauncher launcher = new RecordingLauncher();
        manager.setUpdateAvailable(NEXT_VERSION_CODE);
        manager.setUpdatePriority(WRNAppUpdatePolicy.CRITICAL_UPDATE_PRIORITY);

        controller(manager, launcher, new RecordingPrompt()).onResume();

        assertEquals(1, launcher.launchCount);
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
        manager.userRejectsUpdate();
        first.handleUpdateFlowResult(Activity.RESULT_CANCELED);
        assertEquals(
            NOW,
            preferences.getLong(WRNAppUpdateController.LAST_DECLINED_OR_FAILED_AT, 0L)
        );

        RecordingLauncher secondLauncher = new RecordingLauncher();
        controller(manager, secondLauncher, new RecordingPrompt()).onResume();
        assertEquals(0, secondLauncher.launchCount);
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
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        manager.downloadCompletes();

        assertEquals(1, prompt.showCount);
        assertFalse(manager.isInstallSplashScreenVisible());

        prompt.confirmRestart();
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
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        manager.downloadFails();
        assertEquals(
            NOW,
            preferences.getLong(WRNAppUpdateController.LAST_DECLINED_OR_FAILED_AT, 0L)
        );

        manager.setUpdateAvailable(NEXT_VERSION_CODE, AppUpdateType.FLEXIBLE);
        RecordingLauncher secondLauncher = new RecordingLauncher();
        controller(manager, secondLauncher, new RecordingPrompt()).onResume();
        assertEquals(0, secondLauncher.launchCount);
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
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        manager.downloadCompletes();
        prompt.defer();
        controller.onResume();

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
        manager.userAcceptsUpdate();
        manager.downloadStarts();
        controller.onStop();
        manager.downloadCompletes();

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

    private static final class RecordingLauncher
        extends ActivityResultLauncher<IntentSenderRequest> {
        private int launchCount;
        private boolean unregistered;

        @Override
        public void launch(IntentSenderRequest input, ActivityOptionsCompat options) {
            launchCount += 1;
        }

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
        private int showCount;
        private int dismissCount;
        private boolean showing;
        private Runnable restart;
        private Runnable defer;

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
