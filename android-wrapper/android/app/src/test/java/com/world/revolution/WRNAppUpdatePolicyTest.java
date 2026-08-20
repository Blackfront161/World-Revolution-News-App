package com.world.revolution;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.android.play.core.install.model.AppUpdateType;

import org.junit.Test;

public class WRNAppUpdatePolicyTest {
    @Test
    public void normalUpdateUsesFlexibleFlow() {
        assertEquals(
            AppUpdateType.FLEXIBLE,
            WRNAppUpdatePolicy.chooseUpdateType(3, true, true)
        );
    }

    @Test
    public void criticalUpdateMayUseImmediateFlow() {
        assertEquals(
            AppUpdateType.IMMEDIATE,
            WRNAppUpdatePolicy.chooseUpdateType(4, true, true)
        );
    }

    @Test
    public void immediateOnlyNonCriticalUpdateDoesNotStart() {
        assertEquals(
            WRNAppUpdatePolicy.NO_UPDATE_FLOW,
            WRNAppUpdatePolicy.chooseUpdateType(3, false, true)
        );
    }

    @Test
    public void criticalUpdateFallsBackToFlexibleWhenImmediateIsUnavailable() {
        assertEquals(
            AppUpdateType.FLEXIBLE,
            WRNAppUpdatePolicy.chooseUpdateType(5, true, false)
        );
    }

    @Test
    public void cancellationCooldownPreventsNagLoop() {
        long lastPrompt = 1_000L;
        assertFalse(WRNAppUpdatePolicy.canPrompt(lastPrompt + 1_000L, lastPrompt));
        assertFalse(WRNAppUpdatePolicy.canPrompt(lastPrompt - 1L, lastPrompt));
        assertTrue(
            WRNAppUpdatePolicy.canPrompt(
                lastPrompt + WRNAppUpdatePolicy.RETRY_COOLDOWN_MILLIS,
                lastPrompt
            )
        );
    }
}
