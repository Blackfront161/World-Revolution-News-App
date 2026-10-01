package com.world.revolution;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

/** Isolated QA debug variant only. Never packaged into the production AAB. */
public class WRNShareTestReceiverActivity extends Activity {
    public static volatile Intent received;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        received = new Intent(getIntent());
        finish();
    }
}
