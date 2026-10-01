// Isolated local regression: archive pagination, mixed language holds and failed refresh.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root=path.resolve('.');
const output=path.join(root,'.tmp/podcast-archive-browser');fs.mkdirSync(output,{recursive:true});
const podcasts=JSON.parse(fs.readFileSync('podcasts.json','utf8'));
const sources=JSON.parse(fs.readFileSync('podcast-sources.json','utf8'));
const gone=podcasts[0];
const server=createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)]||'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const result={status:'running',checks:[],errors:[]};let browser;let failed=false;
try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('wrn_next_language','de');localStorage.setItem('wrn_lang','de');localStorage.setItem('wrn_next_ui_settings_v1',JSON.stringify({theme:'autonom'}));});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    const json=value=>route.fulfill({contentType:'application/json',body:JSON.stringify(value)});
    if(url.pathname.endsWith('/podcast-sources.json'))return failed?route.abort():json(sources);
    if(url.pathname.endsWith('/podcasts.json')){
      if(failed)return route.abort();
      return json(url.origin===origin?podcasts:[...podcasts.slice(0,8),{id:gone.id,sourceId:gone.sourceId,status:'withdrawn'}]);
    }
    if(url.origin!==origin)return json({});
    return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));
  const openArchive=async()=>{
    await page.locator('[data-view-target="media"]').click();
    await page.locator('[data-action="media-section"][data-value="podcasts"]').click();
    await page.locator('[data-action="media-archive"][data-value="archive"]').click();
    await page.locator('[data-action="media-language-all"]').click();
  };
  await page.goto(`${origin}/index.html?preview=8`);
  await page.waitForFunction(async()=> (await window.WRNStorage?.getDataset?.('news-app-2-podcast-archive'))?.length===1310);
  await openArchive();
  assert.equal(await page.locator('.podcast-card').count(),30);
  await page.locator('[data-action="media-archive-more"]').click();
  assert.equal(await page.locator('.podcast-card').count(),60);
  await page.locator('[data-action="media-language"][data-value="und"]').click();
  assert(await page.locator('.podcast-card').count()>=3);
  assert(!(await page.locator('.podcast-card').allInnerTexts()).join(' ').includes('Leftover Talk'));
  const archive=await page.evaluate(()=>window.WRNStorage.getDataset('news-app-2-podcast-archive'));
  assert.equal(archive.find(p=>p.id===gone.id).status,'withdrawn');
  assert.equal(archive.filter(p=>p.languageSource==='catalog-conflict-requires-review').length,5);
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  }
  for(const language of ['de','en','es','fr','it','pt','ru','el','tr']){
    await page.locator('#next-language').selectOption(language);
    assert(await page.locator('[data-action="media-archive"][data-value="archive"]').isVisible());
  }
  await page.locator('#next-language').selectOption('de');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(output,'archive-und-autonom.png'),fullPage:true});
  result.checks.push('1,310 stable IDs survive partial remote response; pagination 30/60, UND filter, five language-conflict holds, explicit exclusion, four widths and nine UI languages passed.');
  failed=true;await page.reload();await openArchive();
  const cached=await page.evaluate(()=>window.WRNStorage.getDataset('news-app-2-podcast-archive'));
  assert.equal(cached.length,1310);assert.equal(cached.find(p=>p.id===gone.id).status,'withdrawn');
  assert(await page.locator('.podcast-card').count()>0);
  assert.deepEqual(result.errors,[]);
  result.checks.push('All podcast and source requests fail on reload: saved archive, source configuration and withdrawal persist.');
  result.status='passed';
}catch(error){result.status='failed';result.error=String(error.stack||error);process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
