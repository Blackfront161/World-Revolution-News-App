// Real app DOM and browser history; external feeds/services are isolated fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium, expect} = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root = path.resolve('.');
const output = path.join(root, '.tmp/navigation-roadmap-20261003');
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
let browser;
try {
  browser = await chromium.launch({channel:'chrome', headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(() => {
    localStorage.setItem('wrn_system_lang', 'de');
    localStorage.setItem('wrn_next_ui_settings_v1', JSON.stringify({theme:'autonom'}));
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (/\/(news-feed|news)\.json$/.test(url.pathname)) return route.fulfill({contentType:'application/json',body:JSON.stringify(articles)});
    if (/\/(library-feed|library-sources|podcasts|podcast-sources|radio-stations)\.json$/.test(url.pathname)) {
      return route.fulfill({contentType:'application/json',body:fs.readFileSync(path.join(root,path.basename(url.pathname)), 'utf8')});
    }
    if (url.origin !== origin) return route.fulfill({contentType:'application/json',body:'{}'});
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => result.errors.push(error.message));
  const ready = async view => {
    await expect(page.locator('#next-view')).toHaveAttribute('data-view', view);
    await expect(page.locator('#next-loading')).toBeHidden();
  };
  // Cold deep link through the existing redirect must preserve the hash/filters.
  await page.goto(`${origin}/next.html?preview=8#library?language=de&format=epub`);
  await ready('library');
  await expect(page.locator('#next-library-format')).toHaveValue('epub');
  await expect(page.locator('[data-action="library-language"][data-value="de"]')).toHaveAttribute('aria-pressed', 'true');
  result.checks.push('Cold next.html redirect preserves library route and DE/EPUB filters.');

  await page.locator('#next-library-query').fill('ABC des Anarchismus');
  await expect(page.locator('.library-item-card')).toHaveCount(1);
  await page.locator('[data-view-target="media"]').first().click();
  await ready('media');
  await page.goBack();
  await ready('library');
  await expect(page.locator('#next-library-query')).toHaveValue('ABC des Anarchismus');
  await expect(page.locator('#next-library-format')).toHaveValue('epub');
  await expect(page.locator('.library-item-card')).toHaveCount(1);
  assert(!page.url().includes('ABC'), 'Search text must remain local history state');
  await page.goForward();
  await ready('media');
  await page.locator('[data-action="media-section"][data-value="podcasts"]').click();
  await page.locator('#next-media-query').fill('first episode search');
  await page.waitForTimeout(250);
  await page.locator('[data-action="media-section"][data-value="generated"]').click();
  await page.locator('#next-media-query').fill('second episode search');
  await page.waitForTimeout(250);
  await page.goBack();
  await expect(page.locator('[data-action="media-section"][data-value="podcasts"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#next-media-query')).toHaveValue('first episode search');
  await page.goForward();
  await expect(page.locator('#next-media-query')).toHaveValue('second episode search');
  result.checks.push('Back/Forward restores independent library and media searches, languages and format.');

  await page.goto(`${origin}/index.html?preview=8#discover`);
  await ready('discover');
  await page.locator('#next-discover-query').fill('Navigation');
  await page.waitForTimeout(250);
  await page.locator('#next-discover-query').focus();
  await page.evaluate(() => window.scrollTo({top:650,behavior:'instant'}));
  const before = await page.evaluate(() => window.scrollY);
  assert(before > 200);
  await page.locator('[data-view-target="media"]').first().evaluate(button => button.click());
  await ready('media');
  await page.goBack();
  await ready('discover');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
  await expect(page.locator('#next-discover-query')).toHaveValue('Navigation');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'next-discover-query');
  const opener = page.locator('[data-action="open"]').nth(3);
  await opener.click();
  await expect(page.locator('#next-article-dialog')).toBeVisible();
  const dialogReturnY = await page.evaluate(() => history.state.scrollY);
  await page.locator('[data-dialog-close]').click();
  await expect(page.locator('#next-article-dialog')).not.toBeVisible();
  await expect(page.locator('#next-discover-query')).toHaveValue('Navigation');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(dialogReturnY);
  await expect.poll(() => page.evaluate(() => document.activeElement.dataset.action)).toBe('open');
  result.checks.push('News list restores query, actual scroll position and focus; article close restores its opener.');

  // Browser Back has no preceding DOM click to save the outgoing entry.
  await page.locator('[data-view-target="media"]').first().click();
  await page.locator('[data-action="media-section"][data-value="video"]').click();
  await page.locator('[data-action="media-section"][data-value="podcasts"]').click();
  await page.evaluate(() => window.scrollTo({top:650,behavior:'instant'}));
  await page.locator('#next-media-query').focus();
  const mediaPosition = await page.evaluate(() => window.scrollY);
  assert(mediaPosition > 200);
  await expect.poll(() => page.evaluate(() => history.state.scrollY)).toBe(mediaPosition);
  await page.goBack();
  await expect(page.locator('[data-action="media-section"][data-value="video"]')).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(mediaPosition);
  await expect.poll(() => page.evaluate(() => document.activeElement.id)).toBe('next-media-query');
  result.checks.push('Browser Back then Forward without a DOM click preserves the outgoing media scroll and focus.');

  for (const [hash, view] of [['#media/radio','media'],['#media/radio-podcasts','media'],['#media/video','media'],['#lexicon','lexicon'],['#help','help']]) {
    await page.goto(`${origin}/index.html?preview=8${hash}`);
    await ready(view);
    if (view === 'media') await expect(page.locator(`[data-action="media-section"][data-value="${hash.split('/')[1]}"]`)).toHaveAttribute('aria-selected', 'true');
  }
  await page.locator('#next-help-query').fill('private assistance request');
  assert(!page.url().includes('private'));
  const helpHistory = await page.evaluate(() => history.state);
  assert.equal(helpHistory.filters.helpFilters, undefined);
  assert(!JSON.stringify(helpHistory).includes('private assistance request'));
  assert.equal(helpHistory.focusId, '');
  assert.equal(helpHistory.scrollY, 0);
  for (const language of ['de','en']) {
    await page.locator('#next-language').selectOption(language);
    for (const width of [360,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${language}/${width}: horizontal overflow`);
    }
  }
  result.checks.push('Radio, radio shows, video, lexicon and help direct links; private help stays out of URL; DE/EN at 360/768/1440 fit.');
  assert.deepEqual(result.errors, []);
  await page.goto(`${origin}/index.html?preview=8#library?language=de&format=epub`);
  await ready('library');
  await page.screenshot({path:path.join(output,'library-direct-link.png'),fullPage:true});
  result.status = 'PASS';
} catch (error) {
  result.status = 'FAIL';
  result.error = String(error.stack || error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(output,'browser-result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
