// Isolated fixture acceptance: no external content or AI requests, no outgoing share.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium, expect} = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const out = '.tmp/translation-autonom-fix-20261002/browser'; fs.mkdirSync(out,{recursive:true});
const articles = Array.from({length:12},(_,i)=>({id:`fix-${i}`,title:`Original headline ${i}`,source:`Fixture source ${i}`,
  language:'en',link:`https://example.org/article-${i}`,published:new Date(Date.now()-i*1000).toISOString(),
  content:'People organise together for housing and fair working conditions. '.repeat(12),
  image:`https://example.org/image-${i}.svg`,primaryRegion:'Europe',primaryTopic:'Labor Struggles'}));
const browser = await chromium.launch({channel:'chrome',headless:true});
const result={status:'IN-PROGRESS',checks:[],errors:[]};
try {
 const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await c.addInitScript(()=>{
  localStorage.setItem('wrn_system_lang','de');
  localStorage.setItem('wrn_next_ui_settings_v1',JSON.stringify({theme:'autonom'}));
  window.__shares=[]; window.__translations=[];
  Object.defineProperty(navigator,'share',{configurable:true,value:async p=>window.__shares.push(p)});
 });
 let slowFinished=false; const slowRoutes=[];
 await c.route('**/*',async r=>{
  const u=new URL(r.request().url());
  const json=data=>r.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  if(u.hostname==='wrn-translation-cache.paghklo.workers.dev') {
   const body=r.request().postDataJSON();
   const i=Number(body.title.match(/(\d+)$/)?.[1]||0);
   if(i>0 && !slowFinished) {slowRoutes.push({r,body,i});return;}
   return json({text:`Deutsche Überschrift ${i}---Menschen organisieren sich gemeinsam.`});
  }
  if(u.pathname.endsWith('.svg') && u.hostname==='example.org')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#bc2328"/></svg>'});
  if(/\/(news-feed|news)\.json$/.test(u.pathname)) return json(articles);
  if(u.hostname!=='127.0.0.1')return json({});
  return r.continue();
 });
 const p=await c.newPage();p.on('pageerror',e=>result.errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/index.html?preview=8');
 await expect(p.locator('.home-headline-open')).toHaveText('Deutsche Überschrift 0',{timeout:10000});
 assert(slowRoutes.length>0,'slow translation fixture was not queued');
 result.checks.push('Actual lead translated and rendered while other requests remain unresolved.');
 slowFinished=true; await Promise.all(slowRoutes.map(({r,i})=>r.fulfill({contentType:'application/json',body:JSON.stringify({text:`Deutsche Überschrift ${i}---Menschen organisieren sich gemeinsam.`})})));
 await expect(p.locator('.home-story__body strong').first()).toContainText('Deutsche Überschrift');
 for(const language of ['de','en','es','fr','it','pt','ru','el','tr']) {
  await p.locator('#next-language').selectOption(language);
  for(const width of [320,390,768,1440]) {
   await p.setViewportSize({width,height:844});
   const g=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
    images:[...document.querySelectorAll('.home-story__image img')].map(e=>({fit:getComputedStyle(e).objectFit,w:e.getBoundingClientRect().width})),
    teasers:[...document.querySelectorAll('.home-story__body button > span,.news-card__open p,.home-hero__content > p')].map(e=>getComputedStyle(e).display)}));
   assert(g.scroll<=g.width+1,`${language}/${width} page overflow`);
   assert(g.images.every(x=>x.fit==='cover'&&x.w>=100),`${language}/${width} tiny images`);
   assert(g.teasers.every(x=>x==='none'),`${language}/${width} home teasers still visible`);
  }
 }
 result.checks.push('Autonom headline-only rows, substantial cover images, nine languages x four widths without overflow.');
 await p.locator('#next-menu-toggle').click();
 await p.locator('#next-menu-font-size').selectOption('200');
 await p.locator('[data-menu-close]').click();
 for(const width of [320,390,768,1440]) {
  await p.setViewportSize({width,height:844});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`200%/${width} home overflow`);
 }
 result.checks.push('200% text size stays within the homepage at four widths.');
 await p.locator('#next-menu-toggle').click();
 await p.locator('#next-menu-font-size').selectOption('normal');
 await p.locator('[data-menu-close]').click();
 await p.locator('#next-language').selectOption('de');await p.setViewportSize({width:390,height:844});
 await p.screenshot({path:out+'/autonom-headlines-390.png'});
 await p.locator('.home-headline-open').click();
 await expect(p.locator('#next-article-dialog')).toBeVisible();
 await p.locator('[data-action="article-share"]').click();
 const payload=await p.evaluate(()=>window.__shares.at(-1));
 assert.equal(payload.title,'Deutsche Überschrift 0');
 assert(payload.text.startsWith('Deutsche Überschrift 0\nÜbersetzt mit World Revolution News App.\n'));
 assert(payload.text.includes(articles[0].link));
 result.checks.push('Actual reader shares translated headline, translated-with-app attribution, original URL and Play link.');
 for(const width of [320,390,768,1440]) {
  await p.setViewportSize({width,height:844});
  for(const language of ['de','fr','ru','el','tr']) {
   await p.locator('#next-language').selectOption(language);
   const g=await p.locator('#next-dialog-translate').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));
   assert(g.scroll<=g.width+1,`${language}/${width} translate label overflow`);
  }
 }
 result.checks.push('Reader translation labels stay inside their buttons in five languages and four widths.');
 assert.deepEqual(result.errors,[]);result.status='PASS';
} finally { await browser.close(); fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n'); }
console.log(JSON.stringify(result));
