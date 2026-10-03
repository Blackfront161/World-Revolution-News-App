package com.world.revolution;

import static org.junit.Assert.*;
import android.Manifest;
import android.content.pm.PackageManager;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** QA-only variant: separate applicationId, INTERNET permission removed. */
@RunWith(AndroidJUnit4.class)
public class AutonomOfflineMotionInstrumentedTest {
    private String js(ActivityScenario<MainActivity> scenario, String code) throws Exception {
        AtomicReference<String> value = new AtomicReference<>();
        CountDownLatch latch = new CountDownLatch(1);
        scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(code,
            result -> { value.set(result); latch.countDown(); }));
        assertTrue(latch.await(10, TimeUnit.SECONDS));
        return value.get();
    }
    private void waitTrue(ActivityScenario<MainActivity> scenario, String code) throws Exception {
        for (int i=0; i<160; i++) { if ("true".equals(js(scenario, code))) return; Thread.sleep(250); }
        fail("WebView assertion timed out: " + code + " result=" + js(scenario, code));
    }
    private void ready(ActivityScenario<MainActivity> scenario) throws Exception {
        waitTrue(scenario, "Boolean(document.querySelector('#next-menu-theme') && document.querySelector('#next-view article'))");
    }
    @Test public void offlineRestartAndSavedFullReader() throws Exception {
        assertEquals("true", InstrumentationRegistry.getArguments().getString("wrnIsolatedUpgradeTest"));
        assertEquals(PackageManager.PERMISSION_DENIED, InstrumentationRegistry.getInstrumentation()
            .getTargetContext().checkSelfPermission(Manifest.permission.INTERNET));
        JSONObject fixture = null;
        try (InputStream stream = InstrumentationRegistry.getInstrumentation().getTargetContext().getAssets().open("public/news.json")) {
            JSONArray rows = (JSONArray)new JSONTokener(new String(stream.readAllBytes(), StandardCharsets.UTF_8)).nextValue();
            for (int i=0;i<rows.length();i++) {
                JSONObject row=rows.getJSONObject(i);
                if (row.optString("quelleName").equals("LabourNet DE") && row.optString("content").length()>2000
                    && !Boolean.FALSE.equals(row.opt("contentComplete"))) { fixture=row; break; }
            }
        }
        assertNotNull("A real complete packaged article is required", fixture);
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            ready(scenario);
            assertEquals("true", js(scenario, "(() => {localStorage.setItem('wrn_bookmarks',"
                + JSONObject.quote(new JSONArray().put(fixture).toString()) + ");return true;})()"));
        }
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            ready(scenario);
            assertEquals("true", js(scenario, "document.documentElement.dataset.theme === 'autonom'"));
            js(scenario, "document.querySelector('[data-view-target=\"saved\"]').click()");
            waitTrue(scenario, "Boolean(document.querySelector('#next-view article [data-action=\"open\"]'))");
            js(scenario, "document.querySelector('#next-view article [data-action=\"open\"]').click()");
            waitTrue(scenario, "Boolean(document.querySelector('#next-article-dialog[open] .article-body') && document.querySelector('#next-article-dialog .article-body').innerText.length > 500)");
            String title=fixture.getString("title");
            assertEquals("true", js(scenario, "document.querySelector('#next-article-title').textContent.includes("
                + JSONObject.quote(title.substring(0, Math.min(30,title.length()))) + ")"));
            assertEquals("true", js(scenario, "document.querySelector('#next-article-dialog .article-body').innerText.length > 2000"));
            System.out.println("WRN_OFFLINE_READER_CHARACTERS=" + js(scenario, "document.querySelector('#next-article-dialog .article-body').innerText.length"));
        }
    }
    @Test public void actualAndroidReducedMotionPreference() throws Exception {
        assertEquals("true", InstrumentationRegistry.getArguments().getString("wrnIsolatedUpgradeTest"));
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            ready(scenario);
            assertEquals("true", js(scenario, "matchMedia('(prefers-reduced-motion: reduce)').matches"));
            assertEquals("true", js(scenario, "Boolean(document.querySelector('.autonom-topics .is-active'))"));
            assertEquals("true", js(scenario, "getComputedStyle(document.querySelector('.autonom-topics .is-active')).boxShadow === 'none'"));
            assertEquals("true", js(scenario, "parseFloat(getComputedStyle(document.querySelector('.autonom-topics .is-active')).transitionDuration) <= 0.00001"));
        }
    }
}
