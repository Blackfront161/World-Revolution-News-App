'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../news-app-2-core.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'news-app-2.js'), 'utf8');
const start = source.indexOf('async function translateOpenArticle()');
const end = source.indexOf('\n  function openBriefing()', start);
assert(start > 0 && end > start);
const functionSource = source.slice(start, end).trim();

async function staleResponseScenario(changeState) {
  const article = { id: 'a', title: 'Article A', content: 'Original article text', intro: 'Original' };
  const state = { activeArticle: article, language: 'de' };
  const label = { textContent: '' };
  const button = {
    disabled: false,
    setAttribute() {}, removeAttribute() {},
    querySelector() { return label; }
  };
  let resolveTranslation;
  let stored = 0;
  let toasted = 0;
  const context = {
    state, articleDialog: { open: true }, articleTranslationGeneration: 0,
    translationFor: () => null,
    document: { getElementById() { return button; } },
    window: { WRNSharedTranslations: {
      request: () => new Promise(resolve => { resolveTranslation = resolve; })
    } },
    core,
    release: { splitTranslationChunks: text => [text] },
    storeTranslation: () => { stored += 1; },
    showToast: () => { toasted += 1; },
    t: key => key,
    console
  };
  const translate = vm.runInNewContext(`(${functionSource})`, context);
  const pending = translate();
  changeState(state, article, context);
  resolveTranslation({ error: false, text: 'Translated A\n---\nTranslated body' });
  await pending;
  assert.equal(stored, 0, 'a stale response must not enter the translation cache');
  assert.equal(toasted, 0, 'a stale response must not change the new reader view');
}

(async () => {
  await staleResponseScenario(state => { state.activeArticle = { id: 'b', title: 'Article B' }; });
  await staleResponseScenario(state => { state.language = 'fr'; });
  await staleResponseScenario((state, article) => { article.content = 'Corrected article text'; });
  console.log('Reader stale translation responses: OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
