// Real app DOM and browser history; external feeds/services are isolated fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium, expect} = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root = path.resolve('.');
const output = path.join(root, '.tmp/app-guide-20261003');
fs.mkdirSync(output, {recursive:true});
const articles = Array.from({length:60}, (_, i) => ({
  id:`navigation-${i}`, title:`Navigation article ${i}`, source:'Navigation fixture', language:'de',
  primaryTopic:'Labor Struggles', topics:['Labor Struggles'], primaryRegion:'Europe',
  link:`https://example.org/navigation-${i}`, published:new Date(Date.now() - i * 1000).toISOString(),
  content:'Lokaler Testartikel für die Zurücknavigation. '.repeat(30)
}));
const server = createServer((request, response) => {
  const file = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {response.writeHead(404).end(); return;}
  response.setHeader('Content-Type', {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(file)] || 'application/octet-stream');
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const result = {status:'running', checks:[], errors:[]};
let browser, page, healthMode='';
try {
  browser = await chromium.launch({channel:'chrome', headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(() => {
    localStorage.setItem('wrn_system_lang', 'de');
    localStorage.setItem('wrn_next_ui_settings_v1', JSON.stringify({theme:'autonom'}));
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const action = url.searchParams.get('action');
    if (url.pathname === '/health' || ['translation.status','podcast.status'].includes(action)) {
      if(action==='translation.status' && healthMode==='proxy-http') return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false})});
      if(action==='translation.status' && healthMode==='proxy-disabled') return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,enabled:false,quotas:[]})});
      if((url.pathname==='/health' && healthMode==='cache-missing-fields') || (action==='translation.status' && healthMode==='proxy-missing-fields')) return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,enabled:true,quotas:[]})});
      const metric = url.pathname === '/health' ? 'translation_kv_writes' : action === 'translation.status' ? 'translation_upstream' : 'azure_characters';
      return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,enabled:true,healthy:true,storage:'kv',quotas:[{metric,used:940,limit:950,remaining:10,available:true,resetAt:'2026-10-04T00:00:00.000Z'}]})});
    }
    if (/\/(news-feed|news)\.json$/.test(url.pathname)) return route.fulfill({contentType:'application/json',body:JSON.stringify(articles)});
    if (/\/(library-feed|library-sources|podcasts|podcast-sources|radio-stations)\.json$/.test(url.pathname)) {
      return route.fulfill({contentType:'application/json',body:fs.readFileSync(path.join(root,path.basename(url.pathname)), 'utf8')});
    }
    if (url.origin !== origin) return route.fulfill({contentType:'application/json',body:'{}'});
    return route.continue();
  });
  page = await context.newPage();
  page.on('pageerror', error => result.errors.push(error.message));
  const ready = async view => {
    await expect(page.locator('#next-view')).toHaveAttribute('data-view', view);
    await expect(page.locator('#next-loading')).toBeHidden();
  };

  await page.addInitScript(() => {
    window.guideAudioCalls = [];
    HTMLMediaElement.prototype.play = function() { window.guideAudioCalls.push('media'); return Promise.resolve(); };
    if (window.speechSynthesis) window.speechSynthesis.speak = () => window.guideAudioCalls.push('speech');
  });
  await page.goto(`${origin}/index.html?preview=8&data=snapshot#discover`);
  await ready('discover');
  await page.locator('#next-discover-query').fill('Navigation');
  const openGuide = async () => {
    await page.locator('#next-menu-toggle').click();
    await page.locator('#next-menu-app-guide').press('Enter');
    await expect(page.locator('#next-release-dialog')).toHaveAttribute('data-panel','app-guide');
  };
  const mutatingRequests = [];
  page.on('request', request => { if (request.method() === 'POST') mutatingRequests.push(request.url()); });
  for (const language of ['de','en','es','fr','it','pt','ru','el','tr']) {
    await page.locator('#next-language').selectOption(language);
    await openGuide();
    await expect(page.locator('.app-guide')).toHaveAttribute('lang',language);
    assert.equal(await page.locator('.app-guide details').count(),6);
    await expect(page.locator('#next-release-title')).not.toBeEmpty();
    for (const width of [320,360,768,1440]) {
      await page.setViewportSize({width,height:900});
      for (const section of await page.locator('.app-guide details').all()) {
        await section.evaluate(node => {node.open=true;});
        const bounds=await section.boundingBox();
        assert(bounds && bounds.x>=0 && bounds.x+bounds.width<=width+1,`${language}/${width} section in screen`);
        assert.equal(await section.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,`${language}/${width} no section overflow`);
      }
    }
    await page.locator('#next-release-dialog').press('Escape');
    await expect(page.locator('#next-menu-toggle')).toBeFocused();
    await expect(page.locator('#next-discover-query')).toHaveValue('Navigation');
  }
  result.checks.push('Nine guide languages; six complete tasks; 320/360/768/1440px; Escape restores header focus and news search.');
  await page.locator('#next-language').selectOption('de');
  await page.setViewportSize({width:360,height:900});
  await page.locator('#next-menu-toggle').click();
  await page.locator('#next-menu-font-size').selectOption('200');
  await page.locator('#next-menu-app-guide').click();
  await expect(page.locator('.app-guide')).toHaveAttribute('lang','de');
  for(const section of await page.locator('.app-guide details').all()) {
    await section.evaluate(node => {node.open=true;});
    assert.equal(await section.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,'200% guide reflow');
  }
  await page.screenshot({path:path.join(output,'guide-de-360-200.png')});
  await page.locator('[data-release-close]').last().click();
  await expect(page.locator('#next-menu-toggle')).toBeFocused();
  await page.locator('#next-menu-toggle').click();
  await page.locator('#next-menu-font-size').selectOption('normal');
  await page.locator('[data-menu-close]').click();
  await openGuide();
  await page.locator('[data-guide-topic="radio"] [data-action="app-guide-view"]').click();
  await ready('media');
  await expect(page).toHaveURL(/#media\/radio/);
  await expect(page.locator('#next-release-dialog')).not.toBeVisible();
  await page.goBack(); await ready('discover');
  await expect(page.locator('#next-discover-query')).toHaveValue('Navigation');
  await openGuide();
  await page.locator('.app-guide__links [data-view="library"]').click();
  await ready('library');
  await page.goBack(); await ready('discover');
  await openGuide();
  await page.locator('.app-guide [data-action="open-search"]').click();
  await expect(page.locator('#next-search-input')).toBeFocused();
  await expect(page.locator('#next-release-dialog')).not.toBeVisible();
  result.checks.push('Guide Radio/Library links and browser Back preserve selection; search focus and close button; 200% reflow.');

  await openGuide();
  await page.locator('[data-guide-topic="translation"] summary').click();
  await page.locator('.app-guide [data-action="system-status"]').click();
  await expect(page.locator('#next-release-dialog')).toBeVisible();
  await expect(page.locator('#next-release-title')).toContainText('Systemstatus');
  await expect(page.locator('.app-guide')).toHaveCount(0);
  await page.locator('[data-release-close]').last().click();
  await openGuide();
  await page.locator('[data-guide-topic="offline"] summary').click();
  await page.locator('.app-guide [data-action="data-control"]').click();
  await expect(page.locator('#next-release-title')).toContainText('Lokale Daten');
  await page.locator('[data-release-close]').last().click();
  await openGuide();
  await page.locator('[data-guide-topic="feedback"] summary').click();
  await page.locator('.app-guide [data-action="feedback-open"]').click();
  await expect(page.locator('#next-feedback-dialog')).toBeVisible();
  await expect(page.locator('#next-release-dialog')).not.toBeVisible();
  await page.locator('[data-feedback-close]').click();
  await page.evaluate(() => {
    window.guideShares=[];
    Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>window.guideShares.push(payload)});
  });
  await openGuide();
  await page.locator('[data-guide-topic="sharing"] summary').click();
  await page.locator('.app-guide [data-action="share-app"]').click();
  await expect.poll(()=>page.evaluate(()=>window.guideShares.length)).toBe(1);
  assert((await page.evaluate(()=>JSON.stringify(window.guideShares[0]))).includes('play.google.com'));
  await page.locator('[data-release-close]').last().click();
  for(const theme of ['dark','violet','autonom','oled','soft','pink','light','system','contrast']) {
    await page.locator('#next-menu-toggle').click();
    await page.locator('#next-menu-theme').selectOption(theme);
    await page.locator('#next-menu-app-guide').click();
    assert.equal(await page.locator('.app-guide').evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,`${theme} guide no overflow`);
    await page.locator('[data-release-close]').last().click();
  }
  result.checks.push('Real System status/local data/feedback destinations and mocked app Share; nine guide themes at360; no feedback transmission.');
  await page.locator('#next-menu-toggle').click();
  await page.locator('#next-menu-theme').selectOption('autonom');
  await page.locator('[data-menu-close]').click();
  await page.locator('#next-atlas-toggle').click(); await ready('atlas');
  await expect(page.locator('#next-atlas-toggle img')).toHaveAttribute('src','world-revolution-atlas-punk.svg');
  assert.equal(await page.locator('#next-atlas-toggle img').evaluate(node=>node.complete && node.naturalWidth>0),true);
  await page.screenshot({path:path.join(output,'atlas-punk-autonom-360.png')});
  for (const theme of ['light','dark']) {
    await page.locator('#next-menu-toggle').click();
    await page.locator('#next-menu-theme').selectOption(theme);
    await page.locator('[data-menu-close]').click();
    await page.screenshot({path:path.join(output,`atlas-punk-${theme}-360.png`)});
  }
  const calls=await page.evaluate(()=>window.guideAudioCalls);
  assert.deepEqual(calls,[],'guide/radio navigation does not play or synthesize');
  assert.deepEqual(mutatingRequests,[],'no provider, translation, feedback or audio POST');
  await page.context().setOffline(true);
  await openGuide();
  await expect(page.locator('.app-guide')).toBeVisible();
  await page.locator('[data-guide-topic="offline"] summary').click();
  await expect(page.locator('[data-guide-topic="offline"] p')).toBeVisible();
  await page.screenshot({path:path.join(output,'guide-de-warm-offline.png')});
  await page.context().setOffline(false);
  assert.deepEqual(result.errors,[]);
  result.checks.push('Punk SVG loads in Autonom/light/dark; zero autoplay/speech or POSTs; local help opens warm offline (not cold offline/Android proof).');
  result.status='PASS';
} catch (error) {
  if (page) {
    result.diagnostics = await page.evaluate(() => ({hash:location.hash,dialogs:[...document.querySelectorAll('dialog[open]')].map(node=>node.id),focus:document.activeElement?.outerHTML?.slice(0,300),itemOpen:document.querySelector('[data-navigation-item="indigenous-data-sovereignty"]')?.open}));
    await page.screenshot({path:path.join(output,'failure.png')});
  }
  result.status = 'FAIL';
  result.error = String(error.stack || error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(output,'browser-result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
