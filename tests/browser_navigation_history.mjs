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
  await page.goto(`${origin}/index.html?preview=8#lexicon?item=indigenous-data-sovereignty`);
  await ready('lexicon');
  const term = page.locator('[data-navigation-item="indigenous-data-sovereignty"]');
  await expect(term).toHaveAttribute('open','');
  await expect.poll(() => page.evaluate(() => document.activeElement.dataset.navigationItem)).toBe('indigenous-data-sovereignty');
  await term.locator('[data-action="article-lexicon-open"][data-term="data-commons"]').click();
  await expect(page.locator('[data-navigation-item="data-commons"]')).toHaveAttribute('open','');
  assert(page.url().includes('item=data-commons'));
  const books = JSON.parse(fs.readFileSync('library-feed.json','utf8'));
  const book = (Array.isArray(books) ? books : books.items).at(-1);
  await page.goto(`${origin}/index.html?preview=8#library?item=${book.id}`);
  await ready('library');
  await expect(page.locator(`[data-navigation-item="${book.id}"]`)).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.activeElement.dataset.navigationItem)).toBe(book.id);
  assert.equal(await page.locator('#global-media-player').evaluate(audio => audio.paused),true);
  await page.goto(`${origin}/index.html?preview=8#media/radio?item=3cr`);
  await ready('media');
  await expect.poll(() => page.evaluate(() => document.activeElement.dataset.navigationItem)).toBe('3cr');
  assert.equal(await page.locator('#global-media-player').evaluate(audio => audio.paused),true,'cold item link must not autoplay');
  await page.goto(`${origin}/index.html?preview=8#lexicon?item=withdrawn-or-unknown`);
  await ready('lexicon');
  await expect(page.getByText('Der verlinkte Eintrag ist nicht verfügbar.',{exact:true})).toBeVisible();
  result.checks.push('Cold term and off-page book links focus the real item; related terms navigate; radio link never autoplays; unknown ID is explicit.');
  await page.goto(`${origin}/index.html?preview=8#lexicon?item=worker-cooperative`);
  await ready('lexicon');
  const coop = page.locator('[data-navigation-item="worker-cooperative"]');
  const bookLink = coop.locator('.knowledge-item-links a').first();
  assert((await bookLink.boundingBox()).height >= 44);
  await bookLink.click();
  await ready('library');
  await expect.poll(() => page.evaluate(() => document.activeElement.dataset.navigationItem)).toBe('anarchist-library-en-23d84c4377c0ec75e9b1dd92');
  await page.goBack();
  await ready('lexicon');
  await expect(coop).toHaveAttribute('open','');
  await page.goto(`${origin}/index.html?preview=8#lexicon?item=mutual-aid`);
  await ready('lexicon');
  const podcastLink=page.locator('[data-navigation-item="mutual-aid"] .knowledge-item-links a[href^="#media/"]').first();
  await expect(podcastLink).toBeVisible();
  const podcastId=await podcastLink.getAttribute('data-item');
  await podcastLink.click();
  await ready('media');
  await expect.poll(() => page.evaluate(() => document.activeElement.dataset.navigationItem)).toBe(podcastId);
  assert.equal(await page.locator('#global-media-player').evaluate(audio => audio.paused),true);
  await page.goBack();
  await ready('lexicon');
  await expect(page.locator('[data-navigation-item="mutual-aid"]')).toHaveAttribute('open','');
  result.checks.push('Real lexicon/book and lexicon/podcast round trips retain the open term, 44px targets and no autoplay; only validated catalog bindings appear.');
  await page.goto(`${origin}/index.html?preview=8#lexicon?item=access-intimacy`);
  await ready('lexicon');
  for (const language of ['de','en','es','fr','it','pt','ru','el','tr']) {
    await page.locator('#next-language').selectOption(language);
    for (const width of [360,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${language}/${width}: horizontal overflow`);
    }
    await page.setViewportSize({width:360,height:900});
    await page.evaluate(() => document.documentElement.style.fontSize='200%');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${language}/360/200%: reflow overflow`);
    await page.evaluate(() => document.documentElement.style.fontSize='');
    await page.locator('[data-action="system-status"]').evaluate(button=>button.click());
    await expect(page.locator('[data-quota-status]')).toBeVisible();
    await expect(page.locator('[data-translation-status] strong')).toHaveClass('system-ok');
    await expect(page.locator('[data-quota-status] > div')).toHaveCount(5);
    await expect(page.locator('[data-quota-status] > div').first()).toContainText('940 / 950');
    assert(await page.locator('#next-release-dialog').evaluate(dialog=>dialog.scrollWidth<=dialog.clientWidth+1), `${language}: quota dialog overflows`);
    await page.locator('[data-release-close]').last().click();
  }
  result.checks.push('Nine UI languages: lexicon at 360/768/1440 and 200% text reflow; actual quota dialog shows known counters and unknown provider/storage without overflow.');
  await page.locator('#next-language').selectOption('de');
  for(const mode of ['proxy-http','proxy-disabled','cache-missing-fields','proxy-missing-fields']) {
    healthMode=mode;
    await page.locator('[data-action="system-status"]').evaluate(button=>button.click());
    await expect(page.locator('[data-quota-status]')).toBeVisible();
    await expect(page.locator('[data-translation-status] strong')).toHaveClass('system-warning');
    await expect(page.locator('[data-translation-status] strong')).toHaveText('Offline');
    await page.locator('[data-release-close]').last().click();
  }
  healthMode='';
  result.checks.push('Actual quota UI never labels translation available when cache is healthy but proxy fails, translation is disabled, or health fields are missing.');
  assert.deepEqual(result.errors, []);
  await page.goto(`${origin}/index.html?preview=8#library?language=de&format=epub`);
  await ready('library');
  await page.screenshot({path:path.join(output,'library-direct-link.png'),fullPage:true});
  result.status = 'PASS';
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
