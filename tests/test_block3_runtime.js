'use strict';

const assert = require('assert');
const path = require('path');

global.window = {};
global.document = {
  readyState: 'loading',
  documentElement: { lang: 'en' },
  addEventListener() {},
  getElementById() { return null; }
};

require(path.resolve(__dirname, '..', 'interface-block3.js'));
const api = global.window.WRNInterfaceBlock3;
assert(api, 'Block 3 API was not exported.');
assert.strictEqual(api.matchesCorruption({ title: 'Minister faces bribery investigation' }), true);
assert.strictEqual(api.matchesCorruption({ title: 'Neue Vorwürfe wegen Bestechung' }), true);
assert.strictEqual(api.matchesCorruption({ title: 'Caso de corrupción y soborno' }), true);
assert.strictEqual(api.matchesCorruption({ title: 'Local community opens a library' }), false);
assert.strictEqual(
  api.matchesCorruption({ title: 'Community report', content: 'The appendix mentions corruption once.' }),
  false,
  'One incidental body mention must not classify an article as corruption news.'
);
assert.strictEqual(
  api.matchesCorruption({ title: 'Community report', tags: ['anti-corruption'] }),
  true,
  'Explicit editorial tags must classify an article as corruption news.'
);

const filterRows = [
  { title: 'Current A', quelleName: 'A', pubDate: '2026-07-20T00:00:00Z' },
  { title: 'Current B', quelleName: 'B', pubDate: '2026-07-19T00:00:00Z' },
  { title: 'Old A', quelleName: 'A', pubDate: '2026-06-01T00:00:00Z' }
];
const sourceAndDateResult = api.test.filterRows(filterRows, {
  category: 'Global',
  selectedSources: ['A'],
  days: 7,
  now: new Date('2026-07-22T00:00:00Z').getTime()
});
assert.deepStrictEqual(sourceAndDateResult.map(row => row.title), ['Current A']);
assert.strictEqual(filterRows.length, 3, 'source filtering must not mutate the global article list');

const corruptionRows = api.test.rowsForCategory([
  { title: 'Bribery investigation' },
  { title: 'Community library' }
], 'WRN Corruption');
assert.deepStrictEqual(corruptionRows.map(row => row.title), ['Bribery investigation']);

assert.deepStrictEqual(api.state().selectedSources, []);
const merged = api.test.mergeRows(
  [{ id: 'keep', title: 'Existing article', pubDate: '2026-07-01T00:00:00Z' }],
  [{ id: 'new', title: 'New archive article', pubDate: '2026-07-02T00:00:00Z' }]
);
assert.strictEqual(merged.length, 2, 'Archive merge must preserve existing data.');
assert(merged.some(item => item.id === 'keep'), 'Existing article was lost during archive merge.');
assert(merged.some(item => item.id === 'new'), 'Archive article was not merged.');



function fakeNode({ id = '', className = '', textContent = '', anchor = false } = {}) {
  return {
    id,
    className,
    textContent,
    dataset: {},
    matches(selector) {
      if (selector.includes('.btn-expand') && className.includes('btn-expand')) return true;
      if (selector.includes('[id^="expand-"]') && id.startsWith('expand-')) return true;
      if (selector.includes('a[href]') && anchor) return true;
      if (selector.includes('[data-link]') || selector.includes('[data-url]')) return false;
      return false;
    }
  };
}

assert.strictEqual(api.test.actionType(fakeNode({ id: 'btn-2', className: 'btn-translate', textContent: '[ Translate ]' })), 'translate');
assert.strictEqual(api.test.actionType(fakeNode({ id: 'podcast-2', className: 'btn-translate btn-podcast', textContent: '[ Podcast ]' })), 'podcast');
assert.strictEqual(api.test.actionType(fakeNode({ id: 'bmark-2', className: 'btn-translate btn-read-later', textContent: '[ Bookmark ]' })), 'later');
assert.strictEqual(api.test.actionType(fakeNode({ id: 'zine-2', className: 'btn-translate btn-zine-article', textContent: '[ Add to Zine ]' })), 'zine');
assert.strictEqual(api.test.actionType(fakeNode({ id: 'readstate-2', className: 'btn-translate btn-read-state', textContent: '[ Mark read ]' })), 'read');
assert.strictEqual(api.test.actionType(fakeNode({ className: 'btn-translate', textContent: '[ Share ]' })), 'share');
assert.strictEqual(api.test.actionType(fakeNode({ className: 'btn-translate', textContent: '[ Original ]', anchor: true })), 'original');

console.log('Block 3 runtime core: OK');
