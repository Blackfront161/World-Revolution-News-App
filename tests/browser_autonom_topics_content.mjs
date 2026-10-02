// Isolated UI acceptance using the actual shell/catalog; remote feeds and AI are fixtures.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium, expect} = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root=path.resolve('.'), out=path.join(root,'.tmp/autonom-content-20261002/browser');
fs.mkdirSync(out,{recursive:true});
const topics=['Anti-Imperialism','Anticapitalism','Anticolonialism','Antifascism','No War','Theory & Strategy',
  'Antiracism','Antisexism','Queer-Feminism','No Borders','Radical Health & Disability','Indigenous Struggles',
  'Movement News','Demonstrations','Labor Struggles','Squatting & Housing','Anti-Rep & Prisons','Cyberactivism',
  'Eco-Anarchism','Animal Liberation','Libraries'];
const articles=topics.map((topic,i)=>({id:`topic-${i}`,title:`Themenmeldung ${i}`,source:`Testquelle ${i}`,language:'de',
  primaryTopic:topic,primaryRegion:'Europe',topics:[topic],link:`https://example.org/article-${i}`,
  published:new Date(Date.now()-i*1000).toISOString(),content:'Menschen diskutieren gemeinsame Verantwortung. '.repeat(12),
  image:`https://example.org/image-${i}.svg`}));
const context={window:{}};vm.runInNewContext(fs.readFileSync('lexicon-tab.js','utf8'),context);
const expanded=context.window.WRNLexicon184.snapshot().terms.filter(t=>t.revision?.version==='knowledge-expansion-3');
assert.equal(expanded.length,12);
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer((req,res)=>{
  const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`, result={status:'running',checks:[],errors:[]};
let browser;
try {
  browser=await chromium.launch({channel:'chrome',headless:true});
  const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await c.addInitScript(()=>{localStorage.setItem('wrn_system_lang','de');localStorage.setItem('wrn_next_ui_settings_v1',JSON.stringify({theme:'autonom'}));});
  await c.route('**/*',async r=>{
    const u=new URL(r.request().url()), json=data=>r.fulfill({contentType:'application/json',body:JSON.stringify(data)});
    if(/\/(news-feed|news)\.json$/.test(u.pathname))return json(articles);
    if(/\/(library-sources|library-feed)\.json$/.test(u.pathname))return json(JSON.parse(fs.readFileSync(path.join(root,path.basename(u.pathname)),'utf8')));
    if(u.hostname==='example.org'&&u.pathname.endsWith('.svg'))return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#8c1825"/></svg>'});
    if(u.origin!==origin)return json({});
    return r.continue();
  });
  const p=await c.newPage();p.on('pageerror',e=>result.errors.push(e.message));
  await p.goto(origin+'/index.html?preview=8');
  const nav=p.locator('.autonom-topics'), buttons=nav.locator('button');
  await expect(buttons).toHaveCount(22);
  assert.deepEqual(await buttons.evaluateAll(es=>es.map(e=>e.dataset.topic)),['',...topics]);

  const checkHeader=async label=>{
    const layout=await p.evaluate(()=>{
      const es=['#next-menu-toggle','#next-brand-link','#next-website-link','.language-control','#next-search-toggle'].map(sel=>document.querySelector(sel));
      return es.map(e=>{const r=e.getBoundingClientRect();return {row:getComputedStyle(e).gridRowStart,x:r.x,right:r.right,width:r.width,height:r.height,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth};});
    });
    assert(layout.every(e=>e.row==='1'),`${label}: all header controls must share the title row`);
    for(let i=1;i<layout.length;i++)assert(layout[i-1].right<=layout[i].x+1,`${label}: overlapping header controls`);
    assert(layout.filter((_,i)=>i!==1).every(e=>e.width>=44&&e.height>=44),`${label}: header touch target below44px ${JSON.stringify(layout)}`);
    assert(layout.every(e=>e.scrollWidth<=e.clientWidth+1),`${label}: header content clipped ${JSON.stringify(layout)}`);
  };
  for(const language of ['de','en','es','fr','it','pt','ru','el','tr']) {
    await p.locator('#next-language').selectOption(language);
    for(const width of [320,390,768,1440]) {
      await p.setViewportSize({width,height:844});
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${language}/${width} page overflow`);
      await checkHeader(`${language}/${width}`);
      const bad=await buttons.evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width<44||e.getBoundingClientRect().height<44||e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1).map(e=>({text:e.textContent,width:e.clientWidth,scrollWidth:e.scrollWidth,height:e.clientHeight,scrollHeight:e.scrollHeight})));
      assert.deepEqual(bad,[],`${language}/${width} topic clipped or too small`);
    }
  }
  result.checks.push('All 21 canonical topics plus All; nine languages and four widths without page overflow or clipped topic labels.');
  await p.locator('#next-menu-toggle').click();await p.locator('#next-menu-font-size').selectOption('200');await p.locator('[data-menu-close]').click();
  for(const width of [320,390,768,1440]) {
    await p.setViewportSize({width,height:844});
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`200%/${width} page overflow`);
    await checkHeader(`200%/${width}`);
    assert(await buttons.evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1)),`200%/${width} topic clipped`);
  }
  await p.locator('#next-menu-toggle').click();await p.locator('#next-menu-font-size').selectOption('normal');await p.locator('[data-menu-close]').click();
  result.checks.push('Topic labels wrap at 200% text size in four widths.');
  await p.locator('#next-language').selectOption('de');await p.setViewportSize({width:390,height:844});
  for(const [i,topic] of topics.entries()) {
    await nav.locator(`button[data-topic=${JSON.stringify(topic)}]`).click();
    await expect(p.locator('#next-view')).toHaveAttribute('data-view','discover');
    await expect(buttons).toHaveCount(22);
    const active=nav.locator('[aria-pressed="true"]');await expect(active).toHaveAttribute('data-topic',topic);
    await expect(p.locator('.news-card')).toHaveCount(1);
    assert((await p.locator('.news-card').innerText()).includes(`Themenmeldung ${i}`));
    assert(await active.evaluate(e=>{const n=e.parentElement.getBoundingClientRect(),r=e.getBoundingClientRect();return r.left>=n.left-1&&r.right<=n.right+1;}),'selected topic must remain visible after rerender');
  }
  result.checks.push('Every topic routes to its matching article, preserves all topic buttons, marks selection and keeps it in view.');
  await nav.locator('button[data-topic=""]').click();
  await expect(p.locator('.news-card')).toHaveCount(21);
  await buttons.first().focus();
  for(let i=0;i<21;i++)await p.keyboard.press('Tab');
  await expect(buttons.last()).toBeFocused();
  await p.keyboard.press('Enter');await expect(buttons.last()).toHaveAttribute('aria-pressed','true');
  result.checks.push('All resets the topic filter; keyboard reaches and activates the final topic.');
  await p.locator('[data-view-target="home"]').first().click();
  await p.screenshot({path:path.join(out,'autonom-topics-390.png')});
  await p.locator('[data-view-target="discover"]').first().click();
  await p.locator('[data-view-target="library"]').click();
  await expect(p.locator('.learning-paths details')).toHaveCount(4);
  await expect(p.locator('[data-learning-book]')).toHaveCount(33);
  await p.locator('.learning-paths summary').last().click();
  await expect(p.locator('.learning-paths details').last()).toContainText('The Future of Digital Proudhonism');
  await p.screenshot({path:path.join(out,'digital-learning-path-390.png')});
  await p.locator('[data-view-target="discover"]').first().click();
  await p.locator('[data-view-target="lexicon"]').click();
  for(const language of ['de','en']) {
    await p.locator('#next-language').selectOption(language);
    for(const term of expanded) {
      await p.locator('#next-lexicon-query').fill(term.title[language]);
      const card=p.locator('.lexicon-card').filter({has:p.locator('summary strong',{hasText:term.title[language]})}).first();
      await expect(card).toBeVisible();await card.locator('summary').click();
      await expect(card.locator('.source-actions a')).toHaveCount(1);
      await expect(card).toContainText(language==='de'?'Redaktionell geprüft':'Editorially reviewed');
      await expect(card).toContainText('2026-10-02');
      await expect(card).not.toContainText(language==='de'?'Prüfung ausstehend':'review pending');
      await expect(card.locator('.source-actions a')).toHaveAttribute('href',context.window.WRNLexicon184.snapshot().sources.find(s=>s.id===term.sources[0]).url);
      await expect(card).toContainText(term.debate[language]);
    }
  }
  await p.locator('#next-language').selectOption('de');
  await p.locator('#next-lexicon-query').fill('Agrarökologie');await p.locator('.lexicon-card summary').click();
  await p.screenshot({path:path.join(out,'agroecology-390.png')});
  result.checks.push('Four learning paths with 33 bound entries; all 12 new terms visible in DE/EN with debate, exact primary link and dated independent editorial review.');
  assert.deepEqual(result.errors,[]);result.status='PASS';
} catch(e) {result.status='FAIL';result.error=String(e.stack||e);process.exitCode=1;}
finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result));
