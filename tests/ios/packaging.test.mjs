import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { root, prepareWeb } from '../../scripts/prepare-ios-web.mjs';
import { verifyIOS } from '../../scripts/verify-ios-project.mjs';

test('synchronized native bundle preserves source hashes and iOS configuration', async () => {
  const result = await verifyIOS();
  assert.ok(result.verifiedWebFiles > 300);
  assert.equal(result.nativeCompilation, 'pending-macOS-Xcode');
});
test('public packaging excludes backend, admin UI, credentials and tests', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'ios-wrapper/.tmp/web-manifest.json')));
  assert.ok(!Object.keys(manifest.files).some(name => /^(admin\/|cloudflare\/|tests\/|\.env|ios-wrapper\/|android-wrapper\/)/.test(name)));
  const index = await fs.readFile(path.join(root, 'ios-wrapper/www/index.html'), 'utf8');
  assert.equal((index.match(/src="wrn-ios\.js"/g) ?? []).length, 1);
  assert.ok(index.includes('native-device-bridge.js'));
  assert.ok(index.includes('audio-tools.js'));
});
test('an incomplete source cannot replace an existing generated app package', async () => {
  const temporary = path.join(root, '.tmp', `ios-incomplete-${Date.now()}`);
  const source = path.join(temporary, 'source');
  const wrapper = path.join(temporary, 'wrapper');
  await fs.mkdir(path.join(source, 'news-archive'), { recursive: true });
  await fs.mkdir(path.join(wrapper, 'www'), { recursive: true });
  await fs.writeFile(path.join(wrapper, 'www', 'previous.txt'), 'previous package');
  await assert.rejects(prepareWeb(source, wrapper), /Missing app input/);
  assert.equal(await fs.readFile(path.join(wrapper, 'www', 'previous.txt'), 'utf8'), 'previous package');
});
test('native functions remain user-triggered and calendar uses the system editor', async () => {
  const plugin = await fs.readFile(path.join(root, 'ios-wrapper/ios/App/App/WRNDevicePlugin.swift'), 'utf8');
  assert.ok(plugin.includes('EKEventEditViewController()'));
  assert.ok(!plugin.includes('requestFullAccessToEvents'));
  assert.ok(plugin.includes('max(start + 60000, end) / 1000'));
  assert.ok(plugin.includes('data.count <= 16 * 1024 * 1024'));
  assert.ok(plugin.includes('UIActivityViewController(activityItems: [file]'));
});
test('a missing declared guide or header asset cannot replace a working native web bundle', async () => {
  for (const missing of ['app-guide.js', 'world-revolution-atlas-punk.svg']) {
    const temporary = path.join(root, '.tmp', `ios-guide-incomplete-${missing}-${Date.now()}`);
    const source = path.join(temporary, 'source'), wrapper = path.join(temporary, 'wrapper');
    await fs.mkdir(path.join(source, 'news-archive'), { recursive: true });
    await fs.mkdir(path.join(wrapper, 'www'), { recursive: true });
    await fs.writeFile(path.join(wrapper, 'www', 'previous.txt'), 'previous complete package');
    for (const name of ['news-card-copy.js','news-app-2-config.js','offline-db.js','native-device-bridge.js']) await fs.writeFile(path.join(source,name), '');
    await fs.writeFile(path.join(source, 'index.html'), '<script src="app-guide.js?release=1"></script>');
    await fs.writeFile(path.join(source, 'news-app-2.js'), 'const icon = "world-revolution-atlas-punk.svg";');
    if (missing !== 'app-guide.js') await fs.writeFile(path.join(source, 'app-guide.js'), '');
    if (missing !== 'world-revolution-atlas-punk.svg') await fs.writeFile(path.join(source, 'world-revolution-atlas-punk.svg'), '<svg/>');
    await assert.rejects(prepareWeb(source, wrapper), new RegExp(`Missing app input: ${missing.replaceAll('.', '\\.')}`));
    assert.equal(await fs.readFile(path.join(wrapper, 'www', 'previous.txt'), 'utf8'), 'previous complete package');
  }
});
