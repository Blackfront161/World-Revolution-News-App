package com.world.revolution;

import static org.junit.Assert.*;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.os.SystemClock;
import android.view.accessibility.AccessibilityNodeInfo;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.json.JSONObject;
import org.json.JSONArray;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Real Capacitor/Android chooser. Uses only the private QA receiver; no contacts. */
@RunWith(AndroidJUnit4.class)
public class AudioSharingInstrumentedTest {
    private String js(ActivityScenario<MainActivity> scenario, String script) throws Exception {
        AtomicReference<String> value = new AtomicReference<>();
        CountDownLatch latch = new CountDownLatch(1);
        scenario.onActivity(a -> a.getBridge().getWebView().evaluateJavascript(script,
            result -> { value.set(result); latch.countDown(); }));
        assertTrue(latch.await(10, TimeUnit.SECONDS));
        return value.get();
    }
    private void waitTrue(ActivityScenario<MainActivity> scenario, String code) throws Exception {
        for (int i=0; i<160; i++) {
            if ("true".equals(js(scenario, code))) return;
            Thread.sleep(250);
        }
        fail("WebView assertion timed out: " + code + " => " + js(scenario, code));
    }
    private void guard() throws Exception {
        assertEquals("true", InstrumentationRegistry.getArguments().getString("wrnIsolatedUpgradeTest"));
        Context c=InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("com.world.revolution.autonomtest", c.getPackageName());
        long expected = Long.parseLong(InstrumentationRegistry.getArguments().getString("wrnExpectedVersionCode", "32"));
        assertTrue("Only isolated Code32/33 QA allowed", expected == 32L || expected == 33L);
        assertEquals(expected,c.getPackageManager().getPackageInfo(c.getPackageName(),0).getLongVersionCode());
    }
    private void ready(ActivityScenario<MainActivity> scenario) throws Exception {
        waitTrue(scenario,"Boolean(window.WRNAudioTools?.appendShareActions && document.querySelector('#next-menu-theme') && document.querySelector('#next-view article'))");
        assertEquals("true",js(scenario,"Boolean(window.Capacitor.isNativePlatform() && window.Capacitor.Plugins.Share)"));
    }
    private void mount(ActivityScenario<MainActivity> scenario, String item) throws Exception {
        js(scenario,"(() => {window.currentLang='de';document.querySelector('#qa-share')?.remove();"
            + "const host=document.createElement('div');host.id='qa-share';host.className='media-links';"
            + "host.style.cssText='position:fixed;top:140px;left:12px;right:12px;z-index:99999;padding:12px;background:var(--surface)';"
            + "document.body.append(host);window.WRNAudioTools.appendShareActions(host,"+item+");return true;})()");
        waitTrue(scenario,"document.querySelectorAll('#qa-share button').length===2");
    }
    private boolean chooserVisible() {
        AccessibilityNodeInfo n=InstrumentationRegistry.getInstrumentation().getUiAutomation().getRootInActiveWindow();
        return n!=null && String.valueOf(n.getPackageName()).contains("intentresolver");
    }
    private AccessibilityNodeInfo findReceiver(AccessibilityNodeInfo node) {
        if(node==null)return null;
        if("WRN Share Test".contentEquals(node.getText()==null?"":node.getText()))return node;
        for(int i=0;i<node.getChildCount();i++){
            AccessibilityNodeInfo match=findReceiver(node.getChild(i));if(match!=null)return match;
        }
        return null;
    }
    private void waitChooser() throws Exception {
        for(int i=0;i<80;i++){if(chooserVisible())return;Thread.sleep(250);}
        fail("Actual Android chooser did not appear");
    }
    private void tapCopy(ActivityScenario<MainActivity> scenario) throws Exception {
        JSONArray bounds=new JSONArray(js(scenario,"(() => {const b=document.querySelectorAll('#qa-share button')[1];const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,innerWidth];})()"));
        AtomicReference<float[]> target=new AtomicReference<>();
        scenario.onActivity(a -> {
            android.webkit.WebView web=a.getBridge().getWebView();int[] origin=new int[2];web.getLocationOnScreen(origin);
            try {
                float scale=web.getWidth()/(float)bounds.getDouble(2);
                target.set(new float[]{origin[0]+(float)bounds.getDouble(0)*scale,origin[1]+(float)bounds.getDouble(1)*scale});
            } catch(Exception e){throw new RuntimeException(e);}
        });
        float[] point=target.get();long time=SystemClock.uptimeMillis();
        MotionEvent down=MotionEvent.obtain(time,time,MotionEvent.ACTION_DOWN,point[0],point[1],0);
        MotionEvent up=MotionEvent.obtain(time,time+60,MotionEvent.ACTION_UP,point[0],point[1],0);
        try {
            InstrumentationRegistry.getInstrumentation().sendPointerSync(down);
            InstrumentationRegistry.getInstrumentation().sendPointerSync(up);
        } finally {down.recycle();up.recycle();}
    }
    private void choosePrivateReceiver() throws Exception {
        for(int i=0;i<80;i++){
            AccessibilityNodeInfo n=findReceiver(InstrumentationRegistry.getInstrumentation().getUiAutomation().getRootInActiveWindow());
            while(n!=null && !n.isClickable())n=n.getParent();
            if(n!=null && n.performAction(AccessibilityNodeInfo.ACTION_CLICK))return;
            Thread.sleep(250);
        }
        fail("Private QA share receiver is not selectable");
    }
    @Test public void nativeCancelDoesNotCopy() throws Exception {
        guard();
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            ready(scenario);
            mount(scenario,"{kind:'radio',name:'WRN Radio Test',website:'https://example.org/radio'}");
            scenario.onActivity(a -> ((ClipboardManager)a.getSystemService(Context.CLIPBOARD_SERVICE))
                .setPrimaryClip(ClipData.newPlainText("QA","WRN-CANCEL-MARKER")));
            js(scenario,"document.querySelector('#qa-share button').click()");
            waitChooser();
            InstrumentationRegistry.getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_BACK);
            waitTrue(scenario,"!document.querySelector('#qa-share button').disabled");
            assertEquals("true",js(scenario,"document.querySelector('#qa-share .audio-share-status').textContent==='' && document.querySelector('#qa-share .audio-share-link').hidden"));
            scenario.onActivity(a -> {
                ClipboardManager c=(ClipboardManager)a.getSystemService(Context.CLIPBOARD_SERVICE);
                assertEquals("WRN-CANCEL-MARKER",String.valueOf(c.getPrimaryClip().getItemAt(0).getText()));
            });
            System.out.println("WRN_NATIVE_CANCEL_NO_COPY=PASS");
        }
    }
    @Test public void realChooserDeliversRadioOriginalAndGenerated() throws Exception {
        guard();
        String[][] cases={
            {"{kind:'radio',name:'WRN Radio Test',website:'https://example.org/radio',streamUrl:'https://example.org/live'}","https://example.org/radio"},
            {"{kind:'original',title:'WRN Episode Test',source:'WRN QA',episodeUrl:'https://example.org/episode/42',audioUrl:'https://example.org/audio.mp3'}","https://example.org/episode/42"},
            {"{kind:'generated',title:'WRN Generated Test',source:'WRN QA',audioUrl:'https://example.org/?action=podcast.audio&key=de%2Ffull%2Fqa.mp3',episodeUrl:'https://example.org/article'}","https://example.org/?action=podcast.audio&key=de%2Ffull%2Fqa.mp3"}
        };
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            ready(scenario);
            for(String[] test:cases){
                WRNShareTestReceiverActivity.received=null;
                mount(scenario,test[0]);
                js(scenario,"document.querySelector('#qa-share button').click()");
                waitChooser();choosePrivateReceiver();
                for(int i=0;i<80 && WRNShareTestReceiverActivity.received==null;i++)Thread.sleep(250);
                Intent received=WRNShareTestReceiverActivity.received;
                assertNotNull(received);
                assertEquals(Intent.ACTION_SEND,received.getAction());
                assertEquals("text/plain",received.getType());
                assertTrue(received.getStringExtra(Intent.EXTRA_TEXT).contains(test[1]));
                assertTrue(received.getStringExtra(Intent.EXTRA_SUBJECT).startsWith("WRN "));
                waitTrue(scenario,"!document.querySelector('#qa-share button').disabled");
                assertEquals("true",js(scenario,"document.querySelector('#qa-share .audio-share-link').hidden"));
                System.out.println("WRN_NATIVE_TARGET_URL=PASS "+test[1]);
            }
        }
    }
    @Test public void nativeCopyPreservesGeneratedKey() throws Exception {
        guard();
        String url="https://example.org/?action=podcast.audio&key=de%2Ffull%2Fqa.mp3";
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            ready(scenario);
            mount(scenario,"{kind:'generated',title:'WRN Copy Test',audioUrl:"+JSONObject.quote(url)+"}");
            tapCopy(scenario);
            waitTrue(scenario,"document.querySelector('#qa-share .audio-share-status').textContent==='Link kopiert.'");
            scenario.onActivity(a -> {
                ClipboardManager c=(ClipboardManager)a.getSystemService(Context.CLIPBOARD_SERVICE);
                assertEquals(url,String.valueOf(c.getPrimaryClip().getItemAt(0).getText()));
            });
            System.out.println("WRN_NATIVE_COPY_EXACT_KEY=PASS");
        }
    }
}
