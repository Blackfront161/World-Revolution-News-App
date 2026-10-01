'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function setup({ language = 'de', navigator = {}, capacitor, legacyCopy = false } = {}) {
  const document = {
    documentElement: { lang: language }, activeElement: null,
    addEventListener() {}, querySelectorAll: () => [], getElementById: () => null,
    execCommand: () => legacyCopy,
    createElement(tag) {
      return {
        tag, children: [], attributes: {}, listeners: {}, hidden: false, disabled: false,
        append(...nodes) { this.children.push(...nodes); },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, callback) { this.listeners[name] = callback; },
        querySelector(selector) { return this.children.find(node => selector === `.${node.className}`) || null; },
        focus() { document.activeElement = this; }, select() { this.selected = true; }
      };
    }
  };
  const window = { addEventListener() {}, Capacitor: capacitor };
  const context = { window, document, navigator, URL, console };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'podcast-content-policy.js'), 'utf8'), context);
  vm.runInNewContext(fs.readFileSync(path.join(root, 'audio-tools.js'), 'utf8'), context);
  const api = window.WRNAudioTools;
  const host = document.createElement('div');
  api.appendShareActions(host, {
    kind: 'original', title: 'Folge <eins>', source: 'Radio CORAX',
    episodeUrl: 'https://www.freie-radios.net/143922', audioUrl: 'https://example.org/episode.mp3'
  });
  return { api, host, document, controls: host.children[0]?.children };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

(async () => {
  const { api } = setup();
  assert.equal(api.getShareData({ kind: 'radio', name: 'Sender', website: 'https://example.org/', streamUrl: 'https://example.org/live' }).url, 'https://example.org/');
  assert.equal(api.getShareData({ kind: 'radio', streamUrl: 'https://example.org/live' }).url, 'https://example.org/live');
  assert.equal(api.getShareData({ kind: 'original', episodeUrl: 'https://example.org/episode', audioUrl: 'https://example.org/audio.mp3' }).url, 'https://example.org/episode');
  assert.equal(api.getShareData({ kind: 'original', audioUrl: 'https://example.org/audio.mp3' }).url, 'https://example.org/audio.mp3');
  const generated = 'https://example.org/?action=podcast.audio&key=podcasts%2Fde%2Ffull%2Fone.mp3';
  assert.equal(api.getShareData({ kind: 'generated', audioUrl: generated, episodeUrl: 'https://example.org/article' }).url, generated);
  assert.equal(api.getShareData({ kind: 'generated', episodeUrl: 'https://example.org/article' }), null);
  for (const url of ['javascript:alert(1)', 'data:text/plain,hi', 'blob:https://example.org/a', './local.mp3', 'capacitor://localhost/a', 'http://localhost/a', 'http://127.0.0.1/a', 'http://[::1]/a', 'https://user:secret@example.org/a']) {
    assert.equal(api.getShareData({ kind: 'generated', audioUrl: url }), null, url);
  }
  let payload, webCalls = 0;
  let releaseNative;
  const native = setup({ capacitor: { isNativePlatform: () => true, Plugins: { Share: {
    share: data => { payload = data; return new Promise(resolve => { releaseNative = resolve; }); }
  } } }, navigator: { share: () => { webCalls += 1; } } });
  native.controls[0].listeners.click();
  assert.equal(payload.url, 'https://www.freie-radios.net/143922');
  assert.equal(payload.title, 'Folge <eins>');
  assert.equal(payload.dialogTitle, 'Teilen');
  assert(native.controls[0].disabled && native.controls[1].disabled);
  native.controls[1].listeners.click(); // An open share operation cannot also copy.
  assert.equal(webCalls, 0);
  releaseNative(); await flush();
  assert(!native.controls[0].disabled);
  assert.equal(native.controls[2].textContent, 'Teilen-Dialog geschlossen.');

  let copied = '';
  const web = setup({ navigator: { share: async data => { payload = data; }, clipboard: { writeText: async value => { copied = value; } } } });
  web.controls[0].listeners.click(); await flush();
  assert.equal(payload.text, 'Folge <eins> · Radio CORAX');
  assert.equal(copied, '');
  web.controls[1].listeners.click(); await flush();
  assert.equal(copied, payload.url);
  assert.equal(web.controls[2].textContent, 'Link kopiert.');

  for (const error of [{ name: 'AbortError' }, { message: 'Share canceled' }, { code: 'USER_CANCELLED' }]) {
    copied = '';
    const canceled = setup({ navigator: { share: async () => { throw error; }, clipboard: { writeText: async value => { copied = value; } } } });
    canceled.controls[0].listeners.click(); await flush();
    assert.equal(copied, '');
    assert.equal(canceled.controls[2].textContent, '');
    assert(canceled.controls[3].hidden);
    assert(!canceled.controls[0].disabled);
  }
  copied = '';
  const denied = setup({ navigator: { share: async () => { throw { name: 'NotAllowedError' }; }, clipboard: { writeText: async value => { copied = value; } } } });
  denied.controls[0].listeners.click(); await flush();
  assert.equal(copied, 'https://www.freie-radios.net/143922');
  const manual = setup({ navigator: { clipboard: { writeText: async () => { throw Error('Denied'); } } } });
  manual.controls[1].listeners.click(); await flush();
  assert(!manual.controls[3].hidden && manual.controls[3].selected);
  assert.equal(manual.controls[3].value, 'https://www.freie-radios.net/143922');
  assert.equal(manual.controls[2].textContent, 'Diesen Link manuell kopieren:');
  assert.equal(manual.document.activeElement, manual.controls[3]);
  const legacy = setup({ legacyCopy: true });
  legacy.controls[1].listeners.click(); await flush();
  assert(legacy.controls[3].hidden);
  assert.equal(legacy.controls[2].textContent, 'Link kopiert.');
  assert.equal(legacy.document.activeElement, legacy.controls[1]);
  for (const language of ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
    const localized = setup({ language });
    assert(localized.controls[0].textContent);
    assert.equal(localized.controls[2].attributes['aria-live'], 'polite');
  }
  const invalid = setup();
  const host = invalid.document.createElement('div');
  invalid.api.appendShareActions(host, { kind: 'generated', audioUrl: 'javascript:alert(1)' });
  assert.equal(host.children.length, 0);
  invalid.api.appendShareActions(invalid.host, { kind: 'radio', website: 'https://example.org/' });
  assert.equal(invalid.host.children.length, 1);
  console.log('Audio sharing: native/web, cancellation, clipboard/manual fallback, links, safety and nine languages OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
