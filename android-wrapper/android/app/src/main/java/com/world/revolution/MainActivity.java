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
    public void onStart() {
        super.onStart();
        if (appUpdateController != null) appUpdateController.onStart();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (appUpdateController != null) appUpdateController.onResume();
    }

    @Override
    public void onStop() {
        if (appUpdateController != null) appUpdateController.onStop();
        super.onStop();
    }

    @Override
    public void onDestroy() {
        if (appUpdateController != null) appUpdateController.onDestroy();
        super.onDestroy();
    }
}
