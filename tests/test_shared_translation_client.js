'use strict';

const assert = require('assert');
const path = require('path');

let fallbackCalls = 0;
const states = [];
const requestBodies = [];

global.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
};
global.document = { documentElement: { lang: 'de' } };
global.window = {
  WRN_CONFIG: { sharedTranslationUrl: 'https://translations.example.test' },
  fetchTranslationRequest: async () => {
    fallbackCalls += 1;
    return { error: false, text: 'Übersetzung über Rückfall', provider: 'legacy' };
  },
  setTimeout,
  clearTimeout,
  dispatchEvent(event) { states.push(event.detail); }
};

global.fetch = async () => ({
  ok: false,
  status: 502,
  headers: { get: () => '' },
  text: async () => JSON.stringify({ message: 'Shared service unavailable' })
});

require(path.resolve(__dirname, '..', 'shared-translation-client.js'));

(async () => {
  const fallbackResult = await window.WRNSharedTranslations.request({
    title: 'Title',
    text: 'Text',
    mode: 'title_and_text'
  });

  assert.strictEqual(fallbackCalls, 1, 'HTTP failures must use the original translation endpoint');
  assert.strictEqual(fallbackResult.error, false, 'a successful fallback must be returned to the article UI');
  assert.strictEqual(fallbackResult.text, 'Übersetzung über Rückfall');
  assert.strictEqual(fallbackResult.sharedFallback, true, 'fallback origin must be traceable');
  assert(states.some(state => state?.fallback === true && state?.status === 502), 'fallback state was not announced');

  global.fetch = async (_url, options = {}) => {
    requestBodies.push(JSON.parse(options.body));
    return {
      ok: true,
      status: 200,
      headers: { get: name => name === 'X-WRN-Shared-Cache' ? 'HIT' : '' },
      text: async () => JSON.stringify({ text: 'Gemeinsame Übersetzung', provider: 'shared-worker' })
    };
  };

  const sharedResult = await window.WRNSharedTranslations.request({
    title: 'Title',
    text: 'Text',
    targetLanguage: 'fr'
  });
  assert.strictEqual(sharedResult.error, false);
  assert.strictEqual(sharedResult.text, 'Gemeinsame Übersetzung');
  assert.strictEqual(sharedResult.cached, true);
  assert.strictEqual(requestBodies.at(-1).targetLanguage, 'fr', 'an explicitly selected letter language must reach the service');
  assert.strictEqual(fallbackCalls, 1, 'successful shared requests must not call the fallback');

  console.log('Shared translation client tests passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
