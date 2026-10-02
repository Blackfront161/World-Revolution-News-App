package com.world.revolution;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import android.content.Context;
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

/** Two phases separated by adb install -r on an isolated emulator.
 * Never run the seed method on a user's installation: it writes test settings.
 */
@RunWith(AndroidJUnit4.class)
public class AutonomUpgradeInstrumentedTest {
    private static final String UI = "{\"theme\":\"oled\",\"fontSize\":\"large\",\"density\":\"compact\"}";
    private static final String MARKER = "wrn_autonom_upgrade_fixture_v1";

    private String js(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        AtomicReference<String> result = new AtomicReference<>();
        CountDownLatch latch = new CountDownLatch(1);
        scenario.onActivity(activity -> {
            WebView web = activity.getBridge().getWebView();
            web.evaluateJavascript(script, value -> { result.set(value); latch.countDown(); });
        });
        assertTrue("WebView callback timed out", latch.await(10, TimeUnit.SECONDS));
        return result.get();
    }

    private void ready(ActivityScenario<MainActivity> scenario) throws Exception {
        for (int attempt = 0; attempt < 120; attempt++) {
            if ("true".equals(js(scenario,
                    "Boolean(document.querySelector('#next-menu-theme') && document.querySelector('#next-view article'))"))) return;
            Thread.sleep(250);
        }
        throw new AssertionError("Actual WRN WebView did not render articles");
    }

    private Context context() {
        return InstrumentationRegistry.getInstrumentation().getTargetContext();
    }

    @Test public void seedPreviousVersion() throws Exception {
        assertEquals("true", InstrumentationRegistry.getArguments().getString("wrnIsolatedUpgradeTest"));
        try (InputStream stream = context().getAssets().open("public/news-feed.json")) {
            Object feed = new JSONTokener(new String(stream.readAllBytes(), StandardCharsets.UTF_8)).nextValue();
            JSONArray items = feed instanceof JSONArray ? (JSONArray) feed
                : ((JSONObject) feed).getJSONArray(((JSONObject) feed).has("items") ? "items" : "articles");
            JSONObject fixture = items.getJSONObject(0);
            String bookmarks = new JSONArray().put(fixture).toString();
            try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
                ready(scenario);
                assertEquals("true", js(scenario, "(() => {"
                    + "[['#next-menu-theme','oled'],['#next-menu-font-size','large'],['#next-menu-density','compact']].forEach(([key,value])=>{const control=document.querySelector(key);control.value=value;control.dispatchEvent(new Event('change',{bubbles:true}));});"
                    + "localStorage.setItem('wrn_bookmarks'," + JSONObject.quote(bookmarks) + ");"
                    + "localStorage.setItem('" + MARKER + "'," + JSONObject.quote(bookmarks) + ");"
                    + "return localStorage.getItem('wrn_bookmarks') === localStorage.getItem('" + MARKER + "');})()"));
            }
        }
    }

    @Test public void verifyUpgradeAndAutonomPersistence() throws Exception {
        assertEquals("true", InstrumentationRegistry.getArguments().getString("wrnIsolatedUpgradeTest"));
        long expectedCode = Long.parseLong(InstrumentationRegistry.getArguments().getString("wrnExpectedVersionCode"));
        assertEquals(expectedCode, context().getPackageManager()
                .getPackageInfo(context().getPackageName(), 0).getLongVersionCode());
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            ready(scenario);
            assertEquals(JSONObject.quote(UI), js(scenario, "localStorage.getItem('wrn_next_ui_settings_v1')"));
            assertEquals("true", js(scenario, "Boolean(localStorage.getItem('" + MARKER
                    + "') && localStorage.getItem('wrn_bookmarks') === localStorage.getItem('" + MARKER + "'))"));
            assertEquals("true", js(scenario,
                "document.documentElement.dataset.theme === 'oled' && document.documentElement.dataset.fontSize === 'large' && document.documentElement.dataset.density === 'compact'"));
            // Dispatch the actual select change handler, then force a new Activity/WebView.
            assertEquals("true", js(scenario, "(() => {const theme = document.querySelector('#next-menu-theme');"
                + "theme.value = 'autonom'; theme.dispatchEvent(new Event('change',{bubbles:true}));"
                + "return document.documentElement.dataset.theme === 'autonom';})()"));
        }
        try (ActivityScenario<MainActivity> restarted = ActivityScenario.launch(MainActivity.class)) {
            ready(restarted);
            assertEquals("true", js(restarted,
                "document.documentElement.dataset.theme === 'autonom' && document.documentElement.dataset.fontSize === 'large' && document.documentElement.dataset.density === 'compact'"));
            assertEquals("true", js(restarted, "localStorage.getItem('wrn_bookmarks') === localStorage.getItem('" + MARKER + "')"));
        }
    }
}
