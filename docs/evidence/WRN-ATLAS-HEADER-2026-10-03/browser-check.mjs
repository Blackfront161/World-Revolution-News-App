// Real app DOM and browser history; external feeds/services are isolated fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium, expect} = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root = path.resolve('.');
const output = path.join(root, '.tmp/atlas-header-20261003');
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
  await page.goto(`${origin}/index.html?preview=8&data=snapshot#discover`);
  await ready('discover');
  await page.locator('#next-discover-query').fill('Navigation');
  await page.waitForTimeout(250);
  await page.locator('#next-atlas-toggle').focus();
  const gameRequests = [];
  page.on('request', r => { if (/\/atlas\/|maplibre|supabase|World-Revolution-Map|\/tiles\//i.test(r.url())) gameRequests.push(r.url()); });
  await page.locator('#next-atlas-toggle').press('Enter');
  await ready('atlas');
  await expect(page).toHaveURL(/#atlas$/);
  await expect(page.locator('#next-atlas-mount')).toHaveAttribute('data-atlas-status','not-imported');
  await expect(page.locator('#next-atlas-status')).toContainText('noch nicht eingebunden');
  assert.equal(await page.locator('#next-view iframe').count(),0);
  assert.equal(await page.locator('#next-atlas-toggle img').evaluate(i=>i.complete && i.naturalWidth>0),true);
  await page.locator('[data-action="atlas-return"]').click();
  await ready('discover');
  await expect(page.locator('#next-discover-query')).toHaveValue('Navigation');
  await expect(page.locator('#next-atlas-toggle')).toBeFocused();
  await page.goForward(); await ready('atlas');
  result.checks.push('Keyboard icon, #atlas route, original SVG, no iframe; Back/Forward retains search and focus.');
  for (const language of ['de','en','es','fr','it','pt','ru','el','tr']) {
    await page.locator('#next-language').selectOption(language);
    await expect(page.locator('#next-atlas-status')).not.toBeEmpty();
    assert((await page.locator('#next-atlas-toggle').getAttribute('aria-label')).includes('World Revolution Atlas'));
  }
  await page.locator('#next-language').selectOption('de');
  for (const theme of ['dark','violet','autonom','oled','soft','pink','light','system','contrast']) {
    await page.locator('#next-menu-toggle').click();
    await page.locator('#next-menu-theme').selectOption(theme);
    await page.locator('[data-menu-close]').click();
    for (const width of [320,360,768,1440]) {
      await page.setViewportSize({width,height:900});
      const box = await page.locator('#next-atlas-toggle').boundingBox();
      assert(box && box.width>=44 && box.height>=44 && box.x>=0 && box.x+box.width<=width,`${theme}/${width} icon reachable`);
    }
  }
  await page.setViewportSize({width:360,height:900});
  await page.locator('#next-menu-toggle').click();
  await page.locator('#next-menu-theme').selectOption('autonom');
  await page.locator('#next-menu-font-size').selectOption('200');
  await page.locator('[data-menu-close]').click();
  const bounds = await page.locator('#next-atlas-toggle').boundingBox();
  assert(bounds && bounds.x+bounds.width<=360);
  await page.screenshot({path:path.join(output,'autonom-atlas-360.png')});
  result.checks.push('Nine labels/themes; 320/360/768/1440px, 44px icon target; Autonom200%.');
  await page.locator('#next-menu-toggle').click();
  await page.locator('#next-menu-search').click();
  await expect(page.locator('#next-global-search')).toBeVisible();
  await expect(page.locator('#next-search-input')).toBeFocused();
  await page.locator('#next-search-input').fill('Navigation');
  await page.locator('#next-global-search button').click();
  await ready('discover');
  await expect(page.locator('#next-discover-query')).toHaveValue('Navigation');
  await page.goto(`${origin}/index.html?preview=8&data=snapshot#atlas`);
  await ready('atlas');
  await page.locator('[data-action="atlas-return"]').click();
  await ready('discover');
  assert.deepEqual(gameRequests,[],'No game/map/backend import or request');
  assert.deepEqual(result.errors,[]);
  result.checks.push('Menu search works; cold #atlas fallback returns safely; zero game requests/page errors.');
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
