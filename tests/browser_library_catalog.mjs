// Local browser regression: real catalog, partial mirror, persistent takedown and failed refresh.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root=path.resolve('.');
const output=path.join(root,'.tmp/library-catalog-browser');fs.mkdirSync(output,{recursive:true});
const books=JSON.parse(fs.readFileSync(path.join(root,'library-feed.json'),'utf8'));
const sources=JSON.parse(fs.readFileSync(path.join(root,'library-sources.json'),'utf8'));
const removed=books[0];
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
  await context.addInitScript(()=>{localStorage.setItem('wrn_next_language','de');localStorage.setItem('wrn_lang','de');});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    const json=value=>route.fulfill({contentType:'application/json',body:JSON.stringify(value)});
    if(url.pathname.endsWith('/library-sources.json'))return json(sources);
    if(url.pathname.endsWith('/library-feed.json')){
      if(failed)return route.abort();
      if(url.origin!==origin)return json([...books.slice(0,8),{id:removed.id,sourceId:removed.sourceId,status:'withdrawn'}]);
      return json(books);
    }
    if(url.origin!==origin)return json({});
    return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',error=>result.errors.push(error.message));
  async function openLibrary(){
    await page.locator('[data-view-target="discover"]').first().click();
    await page.locator('[data-view-target="library"]').click();
    await page.locator('#next-library-query').waitFor();
  }
  await page.goto(`${origin}/index.html?preview=8`);
  await openLibrary();
  await page.waitForFunction(async()=>{const rows=await window.WRNStorage?.getDataset?.('news-app-2-library-feed');return rows?.length===715;});
  await page.waitForFunction(()=>document.querySelector('.library-index-section .section-heading')?.innerText.includes('714'));
  assert((await page.locator('.library-index-section .section-heading').innerText()).includes('714'));
  const paths=JSON.parse(fs.readFileSync(path.join(root,'learning-paths.json'),'utf8'));
  const expectedRelations=paths.paths.flatMap(p=>p.entries).filter(e=>e.bookId!==removed.id).length;
  assert.equal(await page.locator('.learning-paths details').count(),3);
  assert.equal(await page.locator('[data-learning-book]').count(),expectedRelations);
  await page.locator('.learning-paths summary').first().click();
  await page.locator('.learning-paths [data-action="article-lexicon-open"]').first().click();
  await page.locator('#next-lexicon-query').waitFor();
  assert((await page.locator('#next-lexicon-query').inputValue()).length>0);
  await openLibrary();
  await page.locator('[data-action="library-language"][data-value="de"]').click();
  assert((await page.locator('.library-index-section .section-heading').innerText()).includes('52'));
  await page.locator('#next-library-query').fill('ABC des Anarchismus');
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.library-item-card').count(),1);
  assert((await page.locator('.library-item-card').innerText()).includes('Berkman'));
  await page.locator('#next-library-format').selectOption('epub');
  assert.equal(await page.locator('.library-item-card').count(),1);
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    assert(await page.locator('.library-item-card').isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  }
  await page.locator('#next-library-query').focus();await page.keyboard.press('Tab');
  assert.equal(await page.locator('#next-library-source').evaluate(el=>el===document.activeElement),true);
  await page.screenshot({path:path.join(output,'library-de.png'),fullPage:true});
  for(const language of ['de','en','es','fr','it','pt','ru','el','tr']){
    await page.locator('#next-language').selectOption(language);
    assert(await page.locator('#next-library-query').isVisible());
    assert.equal(await page.locator('.library-item-card').count(),1);
  }
  result.checks.push('715 stable records merged despite partial remote snapshot; withdrawal hides one title; DE search, author, format, keyboard and four widths/nine UI languages passed.');
  result.checks.push('Three learning paths resolve their current book records and open the associated glossary term.');
  failed=true;
  await page.reload();await openLibrary();
  await page.waitForFunction(async()=>{const rows=await window.WRNStorage?.getDataset?.('news-app-2-library-feed');return rows?.length===715;});
  assert((await page.locator('.library-index-section .section-heading').innerText()).includes('714'));
  const saved=await page.evaluate(()=>window.WRNStorage.getDataset('news-app-2-library-feed'));
  assert.equal(saved.find(b=>b.id===removed.id).status,'withdrawn');
  result.checks.push('All catalog requests failed on reload: last saved archive and persistent withdrawal remain.');
  assert.deepEqual(result.errors,[]);result.status='passed';
}catch(error){result.status='failed';result.error=String(error.stack||error);process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
