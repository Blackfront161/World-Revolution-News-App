// Isolated fixture-only browser acceptance. Never sends to contacts or plays audio.
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const runtime = process.env.WRN_PLAYWRIGHT_MODULE;
if (!runtime) throw Error('Set WRN_PLAYWRIGHT_MODULE to the installed @playwright/test/index.mjs');
const { chromium, expect } = await import(pathToFileURL(runtime).href);
const root = path.resolve('.');
const output = path.resolve('.tmp/audio-sharing');
const appUrl = 'https://play.google.com/store/apps/details?id=com.world.revolution';
fs.mkdirSync(output, { recursive: true });
const original = {
  id: 'share-original', title: 'Antifaschismus und soziale Kämpfe', sourceName: 'Radio CORAX',
  sourceKind: 'free-radio', sourceId: 'radio-corax', language: 'de', region: 'Europe',
  published: new Date().toISOString(), description: 'Eine Gesprächsfolge über solidarische Organisierung.',
  audioUrl: 'https://example.org/folge.mp3', episodeUrl: 'https://example.org/folge/42'
};
const generated = {
  id: 'share-generated', title: 'Solidarische Organisierung', source: 'WRN', language: 'de', mode: 'full',
  createdAt: new Date().toISOString(), expiresAt: '2099-01-01T00:00:00Z',
  audioUrl: 'https://example.org/?action=podcast.audio&key=podcasts%2Fde%2Ffull%2Fshare.mp3',
  articleUrl: 'https://example.org/article'
};
const station = { id: 'share-radio', name: 'Radio Test', languages: ['de'], country: 'DE', region: 'Europe',
  website: 'https://example.org/radio', streamCandidates: [], description: 'Freies Radio ohne direkten Stream.' };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const file = path.resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const result = { status: 'IN-PROGRESS', observedAtUTC: new Date().toISOString(), checks: [] };
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('wrn_next_language', 'de');
    localStorage.setItem('wrn_next_ui_settings_v1', JSON.stringify({ theme: 'autonom' }));
    window.__audioShares = []; window.__audioCopies = [];
    Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.__audioShares.push(data); } });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__audioCopies.push(text); } } });
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const json = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    if (url.searchParams.get('action') === 'podcasts.list') return json({ items: [generated] });
    if (url.searchParams.get('action') === 'podcast.status') return json({ naturalVoicesAvailable: true });
    if (url.pathname.endsWith('/generated-podcasts.json')) return json([generated]);
    if (url.pathname.endsWith('/podcasts.json')) return json([original]);
    if (url.pathname.endsWith('/radio-stations.json')) return json([station]);
    if (url.pathname.endsWith('/radio-health.json')) return json({ stations: [] });
    if (url.origin !== origin) return json({});
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/index.html?preview=8&data=snapshot`);
  await page.locator('#next-view article').first().waitFor();
  await page.locator('#next-language').selectOption('de');
  await page.locator('[data-view-target="media"]').click();
  await page.locator('[data-action="media-section"][data-value="radio-podcasts"]').click();
  const originalCard = page.locator('.podcast-card').filter({ hasText: original.title });
  await originalCard.getByRole('button', { name: `Teilen: ${original.title}`, exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__audioShares.length)).toBe(1);
  assert.equal((await page.evaluate(() => window.__audioShares[0])).url, original.episodeUrl);
  await originalCard.getByRole('button', { name: `Link kopieren: ${original.title}`, exact: true }).click();
  await expect(originalCard.locator('[role="status"]').filter({ hasText: 'Link kopiert.' })).toBeVisible();
  const copiedEpisode = await page.evaluate(() => window.__audioCopies[0]);
  assert(copiedEpisode.endsWith(original.episodeUrl) && copiedEpisode.includes(appUrl));
  result.checks.push('Actual original podcast card copies its episode URL together with the App reference.');
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('Canceled', 'AbortError'); } }));
  await originalCard.getByRole('button', { name: `Teilen: ${original.title}`, exact: true }).click();
  await expect(originalCard.getByRole('button', { name: `Teilen: ${original.title}`, exact: true })).toBeEnabled();
  assert.equal(await page.evaluate(() => window.__audioCopies.length), 1);
  result.checks.push('Canceling the browser share does not copy or show a success message.');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw Error('Permission denied'); } } });
    document.execCommand = () => false;
  });
  await originalCard.getByRole('button', { name: `Link kopieren: ${original.title}`, exact: true }).click();
  await expect(originalCard.locator('.audio-share-link')).toBeVisible();
  await expect(originalCard.locator('.audio-share-link')).toBeFocused();
  assert((await originalCard.locator('.audio-share-link').inputValue()).endsWith(original.episodeUrl));
  assert((await originalCard.locator('.audio-share-link').inputValue()).includes(appUrl));
  result.checks.push('Denied clipboard reveals the selected, labeled manual copy field.');
  await page.locator('[data-action="media-section"][data-value="radio"]').click();
  await page.evaluate(() => { window.Capacitor = { isNativePlatform: () => true, Plugins: { Share: { share: async data => window.__audioShares.push(data) } } }; });
  const radioCard = page.locator('.radio-card').filter({ hasText: station.name });
  await radioCard.getByRole('button', { name: `Teilen: ${station.name}`, exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__audioShares.length)).toBe(2);
  assert((await page.evaluate(() => window.__audioShares[1])).text.includes('Originalangebot über die World Revolution News App entdecken:'));
  assert((await page.evaluate(() => window.__audioShares[1])).text.includes(appUrl));
  assert.equal((await page.evaluate(() => window.__audioShares[1])).url, station.website);
  await radioCard.getByRole('button', {name:`Link kopieren: ${station.name}`,exact:true}).click();
  const copiedRadio = await radioCard.locator('.audio-share-link').inputValue();
  assert(copiedRadio.includes(appUrl) && copiedRadio.endsWith(station.website));
  result.checks.push('A radio without a direct stream still opens the Capacitor share bridge with its station website.');
  await page.locator('[data-action="media-section"][data-value="generated"]').click();
  const generatedCard = page.locator('.podcast-card').filter({ hasText: generated.title });
  await generatedCard.getByRole('button', { name: `Teilen: ${generated.title}`, exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__audioShares.length)).toBe(3);
  assert.equal((await page.evaluate(() => window.__audioShares[2])).url, generated.audioUrl);
  result.checks.push('Generated podcast shares the exact audio key and full version, rather than the article.');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth,
      buttons: [...document.querySelectorAll('.audio-share-actions button')].map(button => ({ height: button.getBoundingClientRect().height, right: button.getBoundingClientRect().right })) }));
    assert(geometry.content <= width + 1, `Overflow at ${width}: ${geometry.content}`);
    assert(geometry.buttons.every(button => button.height >= 44 && button.right <= width + 1));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(output, 'generated-autonom-mobile.png'), fullPage: true });
  await page.locator('#next-language').selectOption('fr');
  await expect(generatedCard.getByRole('button', { name: `Partager: ${generated.title}`, exact: true })).toBeVisible();
  assert.deepEqual(errors, []);
  result.checks.push('Four widths have no page overflow; touch targets >=44px; language change updates sharing; no page errors.');
  const classic = await context.newPage();
  await classic.goto(`${origin}/classic.html`);
  await classic.waitForFunction(() => Boolean(window.WRNAudioTab183));
  await classic.waitForFunction(() => {
    const intro = document.getElementById('wrn-intro-screen-1720');
    return !intro || intro.getAttribute('aria-hidden') === 'true';
  });
  await classic.evaluate(() => { currentLang = 'de'; window.openAudioHub('radio'); });
  const classicRadio = classic.locator('.wrn-audio-card-183').filter({ hasText: station.name });
  await classicRadio.getByRole('button', { name: `Teilen: ${station.name}`, exact: true }).click();
  await expect.poll(() => classic.evaluate(() => window.__audioShares.length)).toBe(1);
  assert.equal((await classic.evaluate(() => window.__audioShares[0])).url, station.website);
  await classic.evaluate(() => window.openAudioHub('original'));
  const classicEpisode = classic.locator('.wrn-audio-card-183').filter({ hasText: original.title });
  await classicEpisode.getByRole('button', { name: `Link kopieren: ${original.title}`, exact: true }).click();
  await expect.poll(() => classic.evaluate(() => window.__audioCopies.length)).toBe(1);
  const classicCopy = await classic.evaluate(() => window.__audioCopies[0]);
  assert(classicCopy.endsWith(original.episodeUrl) && classicCopy.includes(appUrl));
  result.checks.push('Actual Classic Audio-Hub shares directory-only radio and copies episode plus App reference.');
  result.status = 'PASS';
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(result));
