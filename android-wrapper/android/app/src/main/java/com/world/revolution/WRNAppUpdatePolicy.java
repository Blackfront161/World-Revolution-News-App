package com.world.revolution;

import com.google.android.play.core.install.model.AppUpdateType;

final class WRNAppUpdatePolicy {
    static final int NO_UPDATE_FLOW = -1;
    static final int CRITICAL_UPDATE_PRIORITY = 4;
    static final long RETRY_COOLDOWN_MILLIS = 24L * 60L * 60L * 1000L;

    private WRNAppUpdatePolicy() {}

    static int chooseUpdateType(
        int updatePriority,
        boolean flexibleAllowed,
        boolean immediateAllowed
    ) {
        if (updatePriority >= CRITICAL_UPDATE_PRIORITY && immediateAllowed) {
            return AppUpdateType.IMMEDIATE;
        }
        if (flexibleAllowed) {
            return AppUpdateType.FLEXIBLE;
        }
        return NO_UPDATE_FLOW;
    }

    static boolean canPrompt(long nowMillis, long lastDeclinedOrFailedAtMillis) {
        if (lastDeclinedOrFailedAtMillis <= 0L) return true;
        if (nowMillis < lastDeclinedOrFailedAtMillis) return false;
        return nowMillis - lastDeclinedOrFailedAtMillis >= RETRY_COOLDOWN_MILLIS;
    }
}
