'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync(require('node:path').join(__dirname, '../shared-translation-client.js'), 'utf8');
function setup(fetch) {
  const delays = [];
  const window = { WRN_CONFIG: { sharedTranslationUrl: 'https://cache.example/', proxyUrl: 'https://proxy.example/' },
    setTimeout: (f, ms) => { delays.push(ms); return 1; }, clearTimeout() {}, dispatchEvent() {} };
  vm.runInNewContext(code, { window, document: { documentElement: { lang: 'de' } }, fetch, AbortController,
    CustomEvent: class {}, Map, JSON, console });
  return { api: window.WRNSharedTranslations, delays };
}
const response = (status, data) => ({ ok: status === 200, status, headers: { get: () => '' },
  text: async () => JSON.stringify(data), json: async () => data });
(async () => {
  const calls = []; let finish;
  const dedup = setup((url, args) => { calls.push([url, JSON.parse(args.body)]); return new Promise(r => { finish = r; }); });
  const args = { title: 'Title', text: 'Text.', targetLanguage: 'fr' };
  const one = dedup.api.request(args), two = dedup.api.request(args);
  assert.equal(calls.length, 1); assert.equal(one, two);
  assert.equal(dedup.delays[0], 65000, 'client must outlast all bounded worker provider phases');
  finish(response(200, { text: 'Titre---Texte.' })); await one;
  let failedCalls = 0;
  for (const [status, data] of [[429, {code:'RATE_LIMITED'}], [403, {error:'Origin not allowed'}], [503, {reason:'quota_guard_unavailable'}], [502, {details:[{provider:'gemini'}]}]]) {
    const api = setup(async () => { failedCalls++; return response(status, data); });
    const before = failedCalls; const result = await api.api.request(args);
    assert(result.error); assert.equal(failedCalls-before, 1, 'must not retry protected or exhausted upstream');
  }
  const fallbackCalls = [];
  const fallback = setup(async (url, options) => {
    fallbackCalls.push([url, JSON.parse(options.body)]);
    if(url.includes('cache')) throw new Error('Network unavailable');
    return response(200, {text:'Titre---Texte.',provider:'gemini'});
  });
  const result = await fallback.api.request(args);
  assert.equal(result.error, false); assert.equal(result.sharedFallback, true);
  assert.equal(fallbackCalls.length, 2); assert.equal(fallbackCalls[1][1].targetLanguage, 'fr');
  console.log('Translation client: deduplication, provider deadline, target-safe direct fallback and terminal quota/CORS guards PASS');
})().catch(e => {console.error(e);process.exitCode=1;});
