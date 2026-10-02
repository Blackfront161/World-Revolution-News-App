package com.world.revolution;

import static org.junit.Assert.*;
import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Run only on the private, INTERNET-free QA package after an actual Code32 upgrade. */
@RunWith(AndroidJUnit4.class)
public class RoadmapKnowledgeInstrumentedTest {
  private String js(ActivityScenario<MainActivity> scenario, String script) throws Exception {
    AtomicReference<String> result=new AtomicReference<>(); CountDownLatch latch=new CountDownLatch(1);
    scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(script,value -> {result.set(value);latch.countDown();}));
    assertTrue(latch.await(10,TimeUnit.SECONDS)); return result.get();
  }
  private void waitTrue(ActivityScenario<MainActivity> scenario,String script) throws Exception {
    for(int i=0;i<120;i++){if("true".equals(js(scenario,script)))return;Thread.sleep(250);}
    fail("Offline WebView condition did not become true: "+script);
  }
  private String asset(Context context,String name) throws Exception {
    try(java.io.InputStream stream=context.getAssets().open("public/"+name)){return new String(stream.readAllBytes(),StandardCharsets.UTF_8);}
  }
  @Test public void knowledgeAndListeningPathsRemainAvailableWithoutInternet() throws Exception {
    assertEquals("true",InstrumentationRegistry.getArguments().getString("wrnIsolatedUpgradeTest"));
    Context context=InstrumentationRegistry.getInstrumentation().getTargetContext();
    assertEquals("com.world.revolution.autonomtest",context.getPackageName());
    assertEquals(33L,context.getPackageManager().getPackageInfo(context.getPackageName(),0).getLongVersionCode());
    assertEquals(PackageManager.PERMISSION_DENIED,context.checkSelfPermission(Manifest.permission.INTERNET));
    assertEquals(728,new JSONArray(asset(context,"library-feed.json")).length());
    assertEquals(1778,new JSONArray(asset(context,"podcasts.json")).length());
    assertEquals(3,new JSONObject(asset(context,"learning-paths.json")).getJSONArray("paths").length());
    assertEquals(4,new JSONObject(asset(context,"lexicon-locales.json")).getJSONObject("terms").length());
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      waitTrue(scenario,"Boolean(document.querySelector('#next-view article'))");
      js(scenario,"document.querySelector('[data-view-target=\"discover\"]').click()");
      waitTrue(scenario,"Boolean(document.querySelector('[data-view-target=\"library\"]'))");
      js(scenario,"document.querySelector('[data-view-target=\"library\"]').click()");
      waitTrue(scenario,"document.querySelectorAll('[data-learning-podcast]').length === 7");
      assertEquals("true",js(scenario,"document.querySelectorAll('[data-learning-book]').length === 30"));
      assertEquals("true",js(scenario,"document.documentElement.dataset.theme === 'autonom'"));
      js(scenario,"document.querySelector('[data-view-target=\"media\"]').click()");
      waitTrue(scenario,"Boolean(document.querySelector('.media-section-tabs'))");
      js(scenario,"document.querySelector('[data-action=\"media-section\"][data-value=\"podcasts\"]').click()");
      waitTrue(scenario,"Boolean(document.querySelector('a[href=\"https://www.lora.ch/radio/audiothek\"]') && document.querySelector('a[href=\"https://radiokurruf.org/tag/podcast/\"]'))");
      js(scenario,"document.querySelector('#next-language').value='fr'; document.querySelector('#next-language').dispatchEvent(new Event('change',{bubbles:true}))");
    }
    try(ActivityScenario<MainActivity> restarted=ActivityScenario.launch(MainActivity.class)){
      waitTrue(restarted,"Boolean(document.querySelector('#next-view article'))");
      js(restarted,"document.querySelector('[data-view-target=\"discover\"]').click()");
      waitTrue(restarted,"Boolean(document.querySelector('[data-view-target=\"lexicon\"]'))");
      js(restarted,"document.querySelector('[data-view-target=\"lexicon\"]').click()");
      waitTrue(restarted,"Boolean(document.querySelector('#next-lexicon-query'))");
      waitTrue(restarted,"document.querySelector('#next-view').textContent.includes('Entraide')");
      assertEquals("true",js(restarted,"document.querySelector('#next-view').textContent.includes('WRN editorial translation')"));
    }
    System.out.println("WRN_CODE33_OFFLINE_KNOWLEDGE=PASS");
  }
}

