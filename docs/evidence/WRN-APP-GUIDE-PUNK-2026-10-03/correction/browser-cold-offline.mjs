import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const {chromium,expect}=await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root=path.resolve('.'), output=path.join(root,'.tmp/app-guide-cold-offline-20261003');
fs.mkdirSync(output,{recursive:true});
const articles=Array.from({length:60},(_,i)=>({id:`guide-${i}`,title:`Guide article ${i}`,source:'Local fixture',language:'de',primaryTopic:'Labor Struggles',topics:['Labor Struggles'],primaryRegion:'Europe',link:`https://example.org/guide-${i}`,published:new Date(Date.now()-i*1000).toISOString(),content:'Local article for offline task guide. '.repeat(30)}));
let networkAvailable=true, workerSourceMode='baseline', failedPath='', offlineSuccessResponses=0;
const oldWorkerSources=Object.fromEntries(['service-worker.js','news-app-2-sw.js'].map(name=>[name,execFileSync('git',['show','2481ef1a0cdd23a839c38f0058cfc9b73c0c90a6:'+name],{encoding:'utf8'})]));
const server=createServer((request,response)=>{
 if(!networkAvailable){request.destroy();return;}
 const url=new URL(request.url,'http://localhost');
 if(url.pathname===failedPath){response.writeHead(503).end('forced core failure');return;}
 const workerFile=url.pathname.slice(1);
 if(oldWorkerSources[workerFile] && workerSourceMode==='baseline'){response.setHeader('Content-Type','application/javascript');response.setHeader('Cache-Control','no-store');response.end(oldWorkerSources[workerFile]);return;}
 if(url.pathname==='/offline-probe.html'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><title>Offline probe</title>Worker install probe');return;}
 if(['/news.json','/news-feed.json'].includes(url.pathname)){response.setHeader('Content-Type','application/json');response.end(JSON.stringify(articles));return;}
 const file=path.resolve(root,'.'+url.pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
 response.setHeader('Content-Type',{'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream');
 response.setHeader('Cache-Control','no-store');response.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,result={status:'running',checks:[],errors:[]};let context;
const launch=async(profile,offline=false)=>{
 const c=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:{width:360,height:900},serviceWorkers:'allow'});
 await c.route(/^https:\/\//,async route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
 if(offline)await c.setOffline(true);
 return c;
};
try{
 for(const [worker,cache,query] of [['service-worker.js','wrn-app-v2.1.2-r30',''],['news-app-2-sw.js','wrn-news-app-2-v118','?preview=8&data=snapshot']]){
  const profile=path.join(process.env.TEMP,`wrn-${worker==='service-worker.js'?'p30':'p118'}-${Date.now()}`);
  context=await launch(profile);let page=await context.newPage();
  networkAvailable=true;workerSourceMode='baseline';failedPath='';
  await page.goto(`${origin}/offline-probe.html`);
  await page.evaluate(async worker=>{await navigator.serviceWorker.register('./'+worker,{updateViaCache:'none'});await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Worker readiness timeout')),25000))]);},worker);
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),{timeout:30000}).toBe(true);

  await page.evaluate(()=>window.oldWorker=navigator.serviceWorker.controller);
  workerSourceMode='current';
  for(const failure of ['/app-guide.js','/world-revolution-atlas-punk.svg']) {
    failedPath=failure;
    const outcome=await page.evaluate(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      const completion=new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(new Error('failed update did not settle')),20000);
        reg.addEventListener('updatefound',()=>{
          const candidate=reg.installing;
          candidate.addEventListener('statechange',()=>{
            if(['redundant','activated'].includes(candidate.state)){clearTimeout(timeout);resolve(candidate.state);}
          });
        },{once:true});
      });
      await reg.update();return completion;
    });
    assert.equal(outcome,'redundant',failure+' must reject install');
    assert(await page.evaluate(()=>navigator.serviceWorker.controller===window.oldWorker),'old actual worker preserved');
    const names=await page.evaluate(()=>caches.keys());
    assert(!names.includes(cache),'failed candidate cache absent');
    assert(names.some(name=>name===cache.replace('r30','r29').replace('v118','v117')),'old actual cache preserved');
  }
  failedPath='';
  const switched=await page.evaluate(async()=>{
    const reg=await navigator.serviceWorker.getRegistration();
    const done=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('successful update did not take control')),20000);
      navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timeout);resolve(true);},{once:true});
    });
    await reg.update();return done;
  });
  assert(switched);
  result.checks.push(`${worker}: actual old r29/v117 worker survives guide and SVG HTTP503 candidates; exact current worker activates after complete core fetch.`);
  const installed=await page.evaluate(async cache=>{const c=await caches.open(cache);return (await c.keys()).map(r=>new URL(r.url).pathname);},cache);
  assert(installed.includes('/app-guide.js'));assert(installed.includes('/world-revolution-atlas-punk.svg'));
  await page.goto(`${origin}/index.html${query}#atlas`);
  await expect(page.locator('#next-view')).toHaveAttribute('data-view','atlas',{timeout:20000});
  networkAvailable=false;
  await context.setOffline(true);
  await page.locator('#next-menu-toggle').click();await page.locator('#next-menu-app-guide').click();
  await expect(page.locator('.app-guide')).toBeVisible();
  await page.locator('[data-release-close]').last().click();
  await context.close();context=null;
  // Full Chrome/profile reopen while offline, not a same-document warm toggle.
  context=await launch(profile,true);page=await context.newPage();
  page.on('pageerror',error=>result.errors.push(`${worker}: ${error.message}`));
  await page.goto(`${origin}/index.html${query}#atlas`);
  await expect(page.locator('#next-view')).toHaveAttribute('data-view','atlas',{timeout:20000});
  assert(await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)));
  assert(await page.locator('#next-atlas-toggle img').evaluate(img=>img.complete&&img.naturalWidth>0));
  await expect(page.locator('#next-atlas-mount')).toHaveAttribute('data-atlas-status','not-imported');
  await page.locator('#next-menu-toggle').click();await page.locator('#next-menu-app-guide').click();
  await expect(page.locator('.app-guide')).toBeVisible();
  assert.equal(await page.locator('.app-guide details').count(),6);
  await page.screenshot({path:path.join(output,worker+'-cold-offline.png')});
  result.checks.push(`${worker}: ${cache} validated core, warm guide then complete Chrome shutdown/profile reopen offline; App boot, punk icon, six help topics, no game import PASS.`);
  await context.close();context=null;
  networkAvailable=true;
 }
 assert.deepEqual(result.errors,[]);result.status='PASS';
}catch(error){result.status='FAIL';result.error=String(error.stack||error);process.exitCode=1;}
finally{if(context)await context.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(output,'browser-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
