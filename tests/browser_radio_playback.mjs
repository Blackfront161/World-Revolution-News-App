// Real Chrome decodes the admitted broadcaster streams. Audio is never saved.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium,expect}=await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root=path.resolve('.'), output=path.join(root,'.tmp/radio-playback-20261003');
fs.mkdirSync(output,{recursive:true});
const server=createServer((req,res)=>{
  if(req.url==='/hanging-stream.mp3') { res.setHeader('Content-Type','audio/mpeg');res.flushHeaders();return; }
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.setHeader('Content-Type',{'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const result={checkedAt:new Date().toISOString(),status:'running',stations:[],errors:[],native:'not tested: no attached Android device'};
let browser, page;
try {
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(()=>localStorage.setItem('wrn_system_lang','de'));
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(route.request().resourceType()==='media') return route.continue();
    const name=path.basename(url.pathname);
    if(['news-feed.json','library-feed.json','library-sources.json','radio-stations.json','radio-health.json','podcasts.json','podcast-sources.json'].includes(name)) return route.fulfill({contentType:'application/json',body:fs.readFileSync(path.join(root,name),'utf8')});
    if(url.origin!==origin) return route.fulfill({contentType:'application/json',body:'{}'});
    return route.continue();
  });
  page=await context.newPage();
  page.on('pageerror',error=>result.errors.push(error.message));
  await page.goto(`${origin}/index.html?preview=8&data=snapshot#media/radio`);
  await page.evaluate(()=>{
    window.__radioEventLog=[];
    const audio=document.getElementById('global-media-player');
    for(const name of ['waiting','playing','pause','stalled','emptied','abort','error','loadstart']) audio.addEventListener(name,()=>{
      window.__radioEventLog.push({event:name,at:Date.now(),id:window.WRNMediaPlayer.getState().id,index:window.WRNMediaPlayer.getState().candidateIndex,paused:audio.paused,error:audio.error?.code,timer:globalRadioLoadTimer});
    });
  });
  await expect(page.locator('[data-audio-id="3cr"]')).toBeVisible();
  for(const id of ['3cr','corax','orange']) {
    const row={id,status:'running'};
    try {
      await page.locator(`[data-audio-id="${id}"] .btn-media-play`).click();
      await expect.poll(()=>page.evaluate(()=>window.WRNMediaPlayer.getState().currentTime),{timeout:25000}).toBeGreaterThan(2);
      const start=await page.evaluate(()=>window.WRNMediaPlayer.getState());
      await page.waitForTimeout(4000);
      const ongoing=await page.evaluate(()=>window.WRNMediaPlayer.getState());
      assert(ongoing.currentTime>start.currentTime+2&&!ongoing.paused);
      await page.locator('#global-media-pause').click();
      await expect.poll(()=>page.evaluate(()=>window.WRNMediaPlayer.getState().paused)).toBe(true);
      const paused=await page.evaluate(()=>window.WRNMediaPlayer.getState().currentTime);
      await page.waitForTimeout(500);
      assert(Math.abs((await page.evaluate(()=>window.WRNMediaPlayer.getState().currentTime))-paused)<0.1);
      await page.locator('#global-media-play').click();
      await expect.poll(()=>page.evaluate(()=>window.WRNMediaPlayer.getState().paused)).toBe(false);
      row.status='PASS';row.decodedSeconds=ongoing.currentTime;row.mediaSession=await page.evaluate(()=>navigator.mediaSession?.metadata?.title||'');
    } catch(error) {row.status='FAIL';row.error=String(error.message).slice(0,700);}
    await page.evaluate(()=>window.WRNMediaPlayer.stop());
    assert.equal(await page.locator('#global-media-player').getAttribute('src'),null);
    result.stations.push(row); console.log(JSON.stringify(row));
  }
  // Deterministic failed first candidate; the actual next stream must decode.
  await page.evaluate(origin=>{void window.WRNMediaPlayer.play({id:'fallback-corax',kind:'radio',title:'CORAX fallback',candidates:[origin+'/missing-stream.mp3','https://streaming.fueralle.org/corax_128.mp3']});},origin);
  await expect.poll(()=>page.evaluate(()=>window.WRNMediaPlayer.getState().currentTime),{timeout:35000}).toBeGreaterThan(1);
  assert.equal(await page.evaluate(()=>window.WRNMediaPlayer.getState().candidateIndex),1);
  result.fallback='PASS: failed first URL advances to a real decoding second stream';
  await page.evaluate(()=>window.WRNMediaPlayer.stop());
  await page.evaluate(origin=>{
    const button=document.createElement('button');button.id='test-radio-timeout';button.textContent='Start timeout scenario';
    button.onclick=()=>{void window.WRNMediaPlayer.play({id:'timeout-corax',kind:'radio',title:'CORAX timeout fallback',candidates:[origin+'/hanging-stream.mp3','https://streaming.fueralle.org/corax_128.mp3']});};
    document.body.prepend(button);
  },origin);
  const timeoutStarted=Date.now();
  await page.locator('#test-radio-timeout').click();
  await expect.poll(()=>page.evaluate(()=>window.WRNMediaPlayer.getState().currentTime),{timeout:35000}).toBeGreaterThan(1);
  assert.equal(await page.evaluate(()=>window.WRNMediaPlayer.getState().candidateIndex),1);
  assert(Date.now()-timeoutStarted>=14000,'timeout scenario must really wait for the configured budget');
  assert(Date.now()-timeoutStarted<=34000,'both candidate deadlines remain bounded');
  result.timeout='PASS: hung first stream times out after the real 15-second budget and second stream decodes';
  await page.evaluate(()=>window.WRNMediaPlayer.stop());
  assert.deepEqual(result.errors,[]);
  result.status=result.stations.every(row=>row.status==='PASS')?'PASS':'PARTIAL';
} catch(error) {result.status='FAIL';result.error=String(error.stack||error);if(page)result.diagnostics=await page.evaluate(()=>({state:window.WRNMediaPlayer.getState(),events:window.__radioEventLog.slice(-14),timer:globalRadioLoadTimer}));process.exitCode=1;}
finally {
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(output,'browser-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
