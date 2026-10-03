import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../ios-wrapper/web/wrn-ios.js', import.meta.url), 'utf8');
function harness(platform = 'ios', exportFile = async () => {}) {
  const state = { listeners: [], classes: [], alerts: [], exports: [] };
  const document = {
    documentElement: { lang: 'de', classList: { add: name => state.classes.push(name) } },
    addEventListener: (...args) => state.listeners.push(args)
  };
  class FileReader {
    readAsDataURL() { this.result = 'data:text/plain;base64,SGVsbG8='; this.onload(); }
  }
  const context = { document, FileReader, fetch: async () => ({ blob: async () => ({ size: 5 }) }), window: {
    Capacitor: { getPlatform: () => platform, Plugins: { WRNDevice: { exportFile: async data => { state.exports.push(data); await exportFile(data); } } } },
    alert: text => state.alerts.push(text)
  } };
  vm.runInNewContext(source, context);
  state.dispatch = async (href = 'blob:capacitor://localhost/export', filename = 'wrn-backup.json') => {
    const event = { target: { closest: () => ({ href, download: filename }) }, preventDefault: () => { state.prevented = true; } };
    await state.listeners[0][1](event);
  };
  return state;
}

test('web and Android keep their existing download behavior', () => {
  for (const platform of ['web', 'android']) assert.equal(harness(platform).listeners.length, 0);
});
test('iOS attaches a capturing download handler', () => {
  const state = harness();
  assert.equal(state.listeners[0][0], 'click');
  assert.equal(state.listeners[0][2], true);
  assert.deepEqual(state.classes, ['wrn-ios']);
});
test('blob export reaches native share sheet with filename and exact bytes', async () => {
  const state = harness(); await state.dispatch();
  assert.equal(state.prevented, true);
  assert.equal(state.exports[0].base64, 'SGVsbG8=');
  assert.equal(state.exports[0].filename, 'wrn-backup.json');
  assert.equal(state.alerts.length, 0);
});
test('ordinary HTTPS links are untouched', async () => {
  const state = harness(); await state.dispatch('https://example.org/book.pdf');
  assert.equal(state.exports.length, 0);
  assert.equal(state.prevented, undefined);
});
test('native cancellation leaves clipboard and app data untouched and silent', async () => {
  const state = harness('ios', async () => { throw { code: 'CANCELLED' }; });
  await state.dispatch(); assert.equal(state.alerts.length, 0);
});
test('failed native export produces a visible localized error', async () => {
  const state = harness('ios', async () => { throw new Error('write failed'); });
  await state.dispatch(); assert.match(state.alerts[0], /Export fehlgeschlagen/);
});
