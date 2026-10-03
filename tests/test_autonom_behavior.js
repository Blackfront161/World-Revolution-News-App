'use strict';

// Run the actual app functions and dispatch branches with storage/control doubles.
// Browser geometry, keyboard focus and reduced motion remain separate browser gates.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8').replace(/\r\n/g, '\n');
const core = require('../news-app-2-core.js');
const release = require('../news-app-2-release.js');

function appFunction(name) {
  const start = app.indexOf(`  function ${name}(`);
  assert(start >= 0, `Missing app function ${name}`);
  const remaining = app.slice(start + 3);
  const next = /\n  (?:(?:async )?function |(?:const|let) |Object\.)/.exec(remaining);
  assert(next, `Missing function boundary after ${name}`);
  return app.slice(start, start + 3 + next.index);
}

const storage = new Map([['wrn_bookmarks', '["saved-before-theme-change"]']]);
const dataset = {};
let themeColor = '';
let openedSource = '';
const context = vm.createContext({
  console, core, release, state: {
    ui: {}, language: 'de', cardArticles: [], sourceIndex: new Map(),
    sourceArchive: { selectedSources: ['Unrelated Source'] },
    discover: { sort: 'oldest', viewMode: 'cards' },
    articles: [
      { id: 'antifa', title: 'Antifascist article', source: 'Source A', primaryTopic: 'Antifascism', timestamp: 3 },
      { id: 'labor', title: 'Labor article', source: 'Source B', primaryTopic: 'Labor Struggles', timestamp: 2 },
      { id: 'archive', title: 'Old antifascist article', source: 'Source C', primaryTopic: 'Antifascism', timestamp: 1 }
    ], quickArticleIds: new Set(['antifa', 'labor'])
  },
  UI_SETTINGS_KEY: 'wrn_next_ui_settings_v1', ARCHIVE_FILTERS_KEY: 'wrn_source_archive_filters_v1',
  themeSelect: { value: 'autonom' }, fontSizeSelect: { value: '200' }, densitySelect: { value: 'compact' },
  systemTheme: { matches: true }, isProduction: false,
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  document: { documentElement: { dataset }, querySelector: () => ({ setAttribute: (name, value) => { themeColor = value; } }) },
  window: { WRNSourceProfiles: { open: source => { openedSource = source; } } },
  changeView: view => { context.state.view = view; },
  translationFor: () => null, newsCardTeaser: article => article.intro || '',
  dateLabel: () => '30. Sept.', isSaved: article => article.id === 'antifa',
  isSportArticle: () => false
});

for (const name of ['readJson', 'writeJson', 'normalizedUiSettings', 'applyUiSettings', 'saveUiSettings',
  'escapeHtml', 'periodArticles', 'persistArchiveFilters', 'allDiscoverResults', 'homeStoryMarkup', 'autonomTopicsMarkup']) {
  vm.runInContext(appFunction(name), context);
}

// Use the real localization dictionaries and translator, not invented test labels.
for (const name of ['RELEASE_COPY', 'ARTICLE_COPY', 'LIBRARY_COPY', 'PRODUCT_COPY', 'APP_SHARE_COPY',
  'EVENT_UI_COPY', 'UI_COPY', 'MEDIA_COPY', 'SPECIAL_COPY', 'COPY']) {
  const start = app.indexOf(`  const ${name} = `);
  assert(start >= 0, `Missing ${name}`);
  const next = /\n  (?:(?:async )?function |(?:const|let) |Object\.)/.exec(app.slice(start + 3));
  assert(next, `Missing object boundary ${name}`);
  vm.runInContext(app.slice(start, start + 3 + next.index), context);
}
const autonomName = app.match(/Object\.values\(MEDIA_COPY\)\.forEach\(copy => \{ copy\.themeAutonom = 'Autonom'; \}\);/);
assert(autonomName);
vm.runInContext(autonomName[0], context);
vm.runInContext(appFunction('t'), context);
context.classificationLabel = value => value;

context.saveUiSettings();
assert.equal(dataset.theme, 'autonom');
assert.equal(dataset.fontSize, '200');
assert.equal(themeColor, '#080a0b');
context.state.ui = context.readJson(context.UI_SETTINGS_KEY, {});
context.applyUiSettings();
assert.equal(dataset.theme, 'autonom', 'reload applies the persisted design');
assert.equal(storage.get('wrn_bookmarks'), '["saved-before-theme-change"]');

for (const theme of ['dark', 'violet', 'oled', 'soft', 'pink', 'light', 'contrast', 'system', 'autonom']) {
  context.themeSelect.value = theme;
  context.saveUiSettings();
  assert.equal(context.readJson(context.UI_SETTINGS_KEY, {}).theme, theme);
  assert.equal(dataset.theme, theme === 'system' ? 'light' : theme);
}
context.systemTheme.matches = false;
context.state.ui.theme = 'system';
context.applyUiSettings();
assert.equal(dataset.theme, 'dark');
assert.equal(context.normalizedUiSettings({ theme: 'unknown' }).theme, 'dark');

const topicStart = app.indexOf("      if (action === 'autonom-topic') {");
const topicEnd = app.indexOf('      const article = ', topicStart);
assert(topicStart >= 0 && topicEnd > topicStart);
vm.runInContext(`function dispatchTopic(target) { const action = target.dataset.action; ${app.slice(topicStart, topicEnd)} }`, context);
for (const language of ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
  context.state.language = language;
  assert.equal(context.t('themeAutonom'), 'Autonom');
  const markup = context.autonomTopicsMarkup();
  assert(markup.includes('data-topic="Antifascism"'));
  assert.equal((markup.match(/data-action="autonom-topic"/g) || []).length, 6);
}

Object.assign(context.state.discover, { query: 'unrelated', region: 'Asia', topic: 'No War',
  source: 'other', language: 'tr', origin: 'Asia', format: 'video', period: 'all', sportOnly: true });
context.dispatchTopic({ dataset: { action: 'autonom-topic', topic: 'Antifascism' } });
assert.equal(context.state.view, 'discover');
assert.equal(context.state.discover.limit, 24);
assert.equal(context.readJson(context.ARCHIVE_FILTERS_KEY, {}).discover.topic, 'Antifascism');
assert.deepEqual(Array.from(context.allDiscoverResults(), article => article.id), ['antifa'],
  'topic action uses real core/release filtering, clears unrelated filters and stays in current feed');
context.dispatchTopic({ dataset: { action: 'autonom-topic', topic: '' } });
assert.deepEqual(Array.from(context.allDiscoverResults(), article => article.id), ['labor', 'antifa']);
const unchanged = JSON.stringify(context.state.discover);
context.dispatchTopic({ dataset: { action: 'autonom-topic', topic: 'Invented topic' } });
assert.equal(JSON.stringify(context.state.discover), unchanged, 'unknown topics cannot alter archive filters');

const article = { id: 'antifa', source: 'Source "A"', title: 'Existing title', intro: 'Existing intro' };
const markup = context.homeStoryMarkup(article);
assert.equal(context.state.cardArticles[0], article);
assert(markup.includes('data-action="source-profile" data-source="Source &quot;A&quot;"'));
assert(markup.includes('aria-pressed="true"'));
const sourceStart = app.indexOf("      if (action === 'source-profile') {");
const sourceEnd = app.indexOf("      if (action === 'article-lexicon')", sourceStart);
assert(sourceStart >= 0 && sourceEnd > sourceStart);
vm.runInContext(`function dispatchSource(target, article) { const action = target.dataset.action; ${app.slice(sourceStart, sourceEnd)} }`, context);
context.dispatchSource({ dataset: { action: 'source-profile', source: article.source } }, null);
assert.equal(openedSource, article.source, 'source action opens the actual source identity');
assert.equal(storage.get('wrn_bookmarks'), '["saved-before-theme-change"]');
console.log('Autonom selection/persistence, existing themes, nine UI languages, real filtering and source action: OK');
