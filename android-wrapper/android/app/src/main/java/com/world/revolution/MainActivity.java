package com.world.revolution;

import android.os.Bundle;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private WRNAppUpdateController appUpdateController;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        registerPlugin(WRNDevicePlugin.class);
        super.onCreate(savedInstanceState);
        appUpdateController = new WRNAppUpdateController(this);
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (appUpdateController != null) appUpdateController.onStart();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (appUpdateController != null) appUpdateController.onResume();
    }

    @Override
    protected void onStop() {
        if (appUpdateController != null) appUpdateController.onStop();
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        if (appUpdateController != null) appUpdateController.onDestroy();
        super.onDestroy();
    }
}
