package com.world.revolution;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;

import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;

import java.util.function.LongSupplier;

final class WRNAppUpdateController {
    static final String PREFERENCES_NAME = "wrn_play_updates";
    static final String LAST_DECLINED_OR_FAILED_AT = "last_declined_or_failed_at";

    interface CompletionPrompt {
        boolean canShow();
        boolean isShowing();
        void show(Runnable restart, Runnable defer);
        void dismiss();
        void showInstallFailure();
    }

    private final AppUpdateManager appUpdateManager;
    private final SharedPreferences preferences;
    private final ActivityResultLauncher<IntentSenderRequest> updateFlowLauncher;
    private final CompletionPrompt completionPrompt;
    private final LongSupplier currentTimeMillis;
    private final InstallStateUpdatedListener installStateListener;

    private boolean listenerRegistered;
    private boolean availabilityCheckInFlight;
    private boolean flowRequestedThisSession;
    private boolean completionDeferredThisSession;
    private boolean destroyed;

    WRNAppUpdateController(MainActivity activity) {
        appUpdateManager = AppUpdateManagerFactory.create(activity);
        preferences = activity.getSharedPreferences(PREFERENCES_NAME, Activity.MODE_PRIVATE);
        completionPrompt = new AndroidCompletionPrompt(activity);
        currentTimeMillis = System::currentTimeMillis;
        updateFlowLauncher = activity.registerForActivityResult(
            new ActivityResultContracts.StartIntentSenderForResult(),
            result -> handleUpdateFlowResult(result.getResultCode())
        );
        installStateListener = createInstallStateListener();
    }

    WRNAppUpdateController(
        AppUpdateManager appUpdateManager,
        SharedPreferences preferences,
        ActivityResultLauncher<IntentSenderRequest> updateFlowLauncher,
        CompletionPrompt completionPrompt,
        LongSupplier currentTimeMillis
    ) {
        this.appUpdateManager = appUpdateManager;
        this.preferences = preferences;
        this.updateFlowLauncher = updateFlowLauncher;
        this.completionPrompt = completionPrompt;
        this.currentTimeMillis = currentTimeMillis;
        installStateListener = createInstallStateListener();
    }

    private InstallStateUpdatedListener createInstallStateListener() {
        return state -> {
            if (destroyed) return;
            if (state.installStatus() == InstallStatus.DOWNLOADED) {
                showCompletionConfirmation();
            } else if (
                state.installStatus() == InstallStatus.CANCELED
                    || state.installStatus() == InstallStatus.FAILED
            ) {
                suppressFurtherPromptsForCooldown();
            }
        };
    }

    void onStart() {
        if (destroyed || listenerRegistered) return;
        appUpdateManager.registerListener(installStateListener);
        listenerRegistered = true;
    }

    void onResume() {
        if (destroyed || availabilityCheckInFlight) return;
        availabilityCheckInFlight = true;
        appUpdateManager
            .getAppUpdateInfo()
            .addOnSuccessListener(info -> {
                availabilityCheckInFlight = false;
                if (!destroyed) handleAppUpdateInfo(info);
            })
            .addOnFailureListener(error -> {
                availabilityCheckInFlight = false;
                if (!destroyed) suppressFurtherPromptsForCooldown();
            });
    }

    void onStop() {
        if (!listenerRegistered) return;
        appUpdateManager.unregisterListener(installStateListener);
        listenerRegistered = false;
    }

    void onDestroy() {
        if (destroyed) return;
        destroyed = true;
        onStop();
        updateFlowLauncher.unregister();
        completionPrompt.dismiss();
    }

    private void handleAppUpdateInfo(AppUpdateInfo info) {
        if (info.installStatus() == InstallStatus.DOWNLOADED) {
            showCompletionConfirmation();
            return;
        }

        if (
            info.updateAvailability()
                == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
        ) {
            if (
                !flowRequestedThisSession
                    && info.updatePriority() >= WRNAppUpdatePolicy.CRITICAL_UPDATE_PRIORITY
                    && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
            ) {
                startUpdateFlow(info, AppUpdateType.IMMEDIATE);
            }
            return;
        }

        if (
            info.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE
                || flowRequestedThisSession
                || !WRNAppUpdatePolicy.canPrompt(
                    currentTimeMillis.getAsLong(),
                    preferences.getLong(LAST_DECLINED_OR_FAILED_AT, 0L)
                )
        ) {
            return;
        }

        int updateType = WRNAppUpdatePolicy.chooseUpdateType(
            info.updatePriority(),
            info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE),
            info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
        );
        if (updateType != WRNAppUpdatePolicy.NO_UPDATE_FLOW) {
            startUpdateFlow(info, updateType);
        }
    }

    private void startUpdateFlow(AppUpdateInfo info, int updateType) {
        flowRequestedThisSession = true;
        try {
            boolean started = appUpdateManager.startUpdateFlowForResult(
                info,
                updateFlowLauncher,
                AppUpdateOptions.newBuilder(updateType).build()
            );
            if (!started) suppressFurtherPromptsForCooldown();
        } catch (RuntimeException error) {
            suppressFurtherPromptsForCooldown();
        }
    }

    void handleUpdateFlowResult(int resultCode) {
        if (resultCode == Activity.RESULT_OK) return;
        suppressFurtherPromptsForCooldown();
    }

    private void suppressFurtherPromptsForCooldown() {
        flowRequestedThisSession = true;
        preferences
            .edit()
            .putLong(LAST_DECLINED_OR_FAILED_AT, currentTimeMillis.getAsLong())
            .apply();
    }

    private void showCompletionConfirmation() {
        if (
            destroyed
                || completionDeferredThisSession
                || completionPrompt.isShowing()
                || !completionPrompt.canShow()
        ) {
            return;
        }

        completionPrompt.show(
            () -> {
                completionDeferredThisSession = true;
                appUpdateManager
                    .completeUpdate()
                    .addOnFailureListener(error -> {
                        if (destroyed) return;
                        suppressFurtherPromptsForCooldown();
                        completionPrompt.showInstallFailure();
                    });
            },
            () -> completionDeferredThisSession = true
        );
    }

    private static final class AndroidCompletionPrompt implements CompletionPrompt {
        private final MainActivity activity;
        private AlertDialog dialog;

        private AndroidCompletionPrompt(MainActivity activity) {
            this.activity = activity;
        }

        @Override
        public boolean canShow() {
            return !activity.isFinishing() && !activity.isDestroyed();
        }

        @Override
        public boolean isShowing() {
            return dialog != null;
        }

        @Override
        public void show(Runnable restart, Runnable defer) {
            dialog = new AlertDialog.Builder(activity)
                .setTitle(R.string.update_ready_title)
                .setMessage(R.string.update_ready_message)
                .setPositiveButton(R.string.update_restart_action, (ignored, which) -> {
                    restart.run();
                })
                .setNegativeButton(R.string.update_later_action, (ignored, which) -> {
                    defer.run();
                })
                .setOnCancelListener(ignored -> defer.run())
                .setOnDismissListener(ignored -> dialog = null)
                .create();
            dialog.show();
        }

        @Override
        public void dismiss() {
            if (dialog == null) return;
            dialog.dismiss();
            dialog = null;
        }

        @Override
        public void showInstallFailure() {
            Toast.makeText(
                activity,
                R.string.update_install_failed,
                Toast.LENGTH_LONG
            ).show();
        }
    }
}
