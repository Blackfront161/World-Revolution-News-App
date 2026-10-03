// WebKit with mocked native calls: verifies the real generated UI and storage,
// without claiming a Swift/device test or contacting external providers.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from '../../scripts/prepare-ios-web.mjs';

if (!process.env.WRN_PLAYWRIGHT_MODULE) throw new Error('Set WRN_PLAYWRIGHT_MODULE to the installed @playwright/test/index.mjs');
const { webkit, expect } = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const web = path.join(root, 'ios-wrapper/www');
const output = path.join(root, '.tmp/ios-browser');
await fs.mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const file = path.resolve(web, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(web + path.sep)) { response.writeHead(403); response.end(); return; }
    const data = await fs.readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const result = { engine: 'WebKit', nativeBridge: 'mocked', sourceMode: 'local-fixtures', checks: [] };
let browser;
try {
  browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('wrn_next_language', 'de');
    if (!localStorage.getItem('wrn_next_ui_settings_v1')) localStorage.setItem('wrn_next_ui_settings_v1', JSON.stringify({ theme: 'autonom' }));
    window.__exports = []; window.__assets = [];
    window.Capacitor = { getPlatform: () => 'ios', isNativePlatform: () => true, Plugins: {
      WRNDevice: {
        exportFile: async data => { window.__exports.push(data); },
        fetchAsset: async data => {
          window.__assets.push(data.url);
          if (window.__delayAsset) await new Promise(resolve => { window.__resumeAsset = resolve; });
          return { contentType: 'image/png', base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=' };
        },
        print: async () => {}, addCalendarEvent: async () => {}
      }, Share: { share: async () => {} }, LocalNotifications: {
        requestPermissions: async () => ({ display: 'granted' }), schedule: async () => {}, cancel: async () => {}
      }
    } };
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.protocol === 'blob:') return route.continue();
    // WebKit upgrades loopback subresources to HTTPS under the real CSP.
    // Fulfill both schemes from the same local fixture tree, retaining the CSP.
    if (url.hostname === '127.0.0.1' && url.port === new URL(origin).port) {
      const file = path.resolve(web, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!file.startsWith(web + path.sep)) return route.fulfill({ status: 403 });
      try { return route.fulfill({ contentType: mime[path.extname(file)] || 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' }, body: await fs.readFile(file) }); }
      catch { return route.fulfill({ status: 404 }); }
    }
    if (url.hostname === 'example.org') return route.abort();
    return route.fulfill({ contentType: 'application/json', body: '{}' });
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const consoleErrors = []; page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text()); });
  await page.goto(`${origin}/index.html?preview=8&data=snapshot`);
  await expect(page.locator('#next-language')).toBeVisible();
  result.startup = await page.evaluate(() => ({ platform: window.Capacitor?.getPlatform?.(), iosClass: document.documentElement.className, assets: typeof window.WRNIOSAssets }));
  result.consoleErrors = consoleErrors;
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('wrn-ios')), true);
  result.checks.push('Generated WRN UI starts in WebKit with the iOS adapters and local fixtures.');
  for (const theme of ['autonom', 'classic']) {
    await page.evaluate(theme => { localStorage.setItem('wrn_next_ui_settings_v1', JSON.stringify({ theme })); }, theme);
    await page.reload(); await expect(page.locator('#next-language')).toBeVisible();
    for (const width of [320, 390, 430, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${theme}: overflow at ${width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, `${theme}-390.png`), fullPage: false });
  }
  result.checks.push('Classic and Autonom fit 320/390/430/1024 CSS pixels without page overflow.');
  await page.evaluate(() => {
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['iOS backup'], { type: 'text/plain' }));
    link.download = 'wrn-backup.txt'; document.body.append(link); link.click(); link.remove();
  });
  await expect.poll(() => page.evaluate(() => window.__exports.length)).toBe(1);
  assert.deepEqual(await page.evaluate(() => window.__exports[0]), { filename: 'wrn-backup.txt', base64: Buffer.from('iOS backup').toString('base64') });
  result.checks.push('Real blob export reaches the native adapter with exact filename and bytes.');
  assert.equal(await page.evaluate(() => window.WRNIOSAssets.save(['https://example.org/saved.png'])), true);
  await page.reload(); await expect(page.locator('#next-language')).toBeVisible();
  assert.equal(await page.evaluate(async () => (await fetch('https://example.org/saved.png')).headers.get('Content-Type')), 'image/png');
  await page.evaluate(() => { const image = document.createElement('img'); image.id = 'offline-test'; image.src = 'https://example.org/saved.png'; document.body.append(image); });
  await expect.poll(() => page.evaluate(() => document.getElementById('offline-test').src.startsWith('blob:'))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.getElementById('offline-test').naturalWidth)).toBe(1);
  assert.equal(await page.evaluate(async () => {
    const controller = new AbortController(); controller.abort();
    try { await fetch('https://example.org/saved.png', { signal: controller.signal }); return false; } catch { return true; }
  }), true);
  assert.equal(await page.evaluate(async () => { try { await fetch('https://example.org/saved.png', { method: 'POST' }); return false; } catch { return true; } }), true);
  result.checks.push('Saved image survives reload; failed GET and img rendering restore it; abort/POST never use the offline response.');
  await page.evaluate(() => window.caches.delete('wrn-saved-articles-v1'));
  assert.equal(await page.evaluate(async () => { try { await fetch('https://example.org/saved.png'); return false; } catch { return true; } }), true);
  await page.evaluate(() => { window.__delayAsset = true; window.__saving = window.WRNIOSAssets.save(['https://example.org/race.png']); });
  await expect.poll(() => page.evaluate(() => Boolean(window.__resumeAsset))).toBe(true);
  await page.evaluate(() => window.WRNIOSAssets.clear());
  await page.evaluate(() => { window.__resumeAsset(); });
  assert.equal(await page.evaluate(() => window.__saving), false);
  assert.equal(await page.evaluate(async () => Boolean(await (await caches.open('wrn-saved-articles-v1')).match('https://example.org/race.png'))), false);
  result.checks.push('Clear removes saved image bytes; delayed downloads cannot resurrect cleared data.');
  assert.deepEqual(errors, []);
  result.checks.push('No page runtime errors. Native dialogs/downloads are mocked; no Swift/device claim.');
  result.status = 'PASS';
} catch (error) { result.status = 'FAIL'; result.error = String(error.stack || error); throw error; }
finally {
  result.observedAtUTC = new Date().toISOString();
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(result, null, 2) + '\n');
  await browser?.close(); await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify(result));
}
