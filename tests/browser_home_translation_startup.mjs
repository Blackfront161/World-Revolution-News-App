import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium,expect}=await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
const c=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const article=(id,title)=>({id,title,source:'Fixture newsroom',language:'en',link:`https://example.org/${id}`,published:new Date().toISOString(),content:'Communities organise to protect housing and public libraries. '.repeat(12),primaryRegion:'Europe',primaryTopic:'Movement News'});
const live=[article('live-lead','Current headline'),article('live-side','Current second headline')];
const held=[],requests=[];
await c.addInitScript(()=>{localStorage.setItem('wrn_system_lang','de');});
await c.route('**/*',async r=>{
 const u=new URL(r.request().url());const json=b=>r.fulfill({contentType:'application/json',body:JSON.stringify(b)});
 if(u.hostname==='wrn-translation-cache.paghklo.workers.dev'){
  if(r.request().method()==='GET')return json({ok:true});
  const body=r.request().postDataJSON();requests.push(body);return json({text:`Deutsch: ${body.title}---Gemeinschaften schützen Wohnungen und Bibliotheken.`});
 }
 if(u.hostname!=='127.0.0.1'&&u.pathname.endsWith('/news-feed.json')){held.push(r);return;}
 if(u.hostname!=='127.0.0.1'&&u.pathname.endsWith('/feed-status.json'))return json({ok:true,generatedAt:new Date().toISOString(),lastPublishedAt:new Date().toISOString()});
 if(u.hostname!=='127.0.0.1')return json({});
 if(u.pathname==='/news-feed.json')return json([article('old-lead','Old packaged headline')]);
 return r.continue();
});
try{
 const p=await c.newPage();await p.goto('http://127.0.0.1:8765/index.html?preview=8');
 await expect(p.locator('.home-headline-open')).toHaveText('Old packaged headline');
 assert.equal(requests.length,0,'displayed packaged data must not trigger translations before live attempt finishes');
 assert(held.length>0);await Promise.all(held.splice(0).map(r=>r.fulfill({contentType:'application/json',body:JSON.stringify(live)})));
 await expect(p.locator('.home-headline-open')).toHaveText('Deutsch: Current headline');
 assert(requests.length>0);assert(requests.every(r=>r.title!=='Old packaged headline'));
 const output='.tmp/home-translation-repair-20261002';fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(`${output}/browser-startup.json`,JSON.stringify({status:'PASS',requests:requests.map(r=>r.title),checks:['offline headline shown immediately','zero snapshot translation requests during live load','current lead translated after live data selection']},null,2)+'\n');
 console.log('Actual shell: immediate offline headline, no stale-snapshot translation, current live lead automatically translated PASS');
}finally{await browser.close();}
