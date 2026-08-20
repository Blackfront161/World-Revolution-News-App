'use strict';

const assert = require('assert');
const path = require('path');
const release = require(path.resolve(__dirname, '..', 'news-app-2-release.js'));

const catalog = release.sourceIndex({
  generatedAt: '2026-08-02T10:00:00Z',
  sources: [{
    name: 'Example',
    languages: ['de'],
    originRegion: 'Europe',
    originCountry: 'CH',
    homepage: 'https://example.org/',
    geographySource: 'explicit',
    languageSource: 'explicit',
    sourceType: 'movement',
    originScope: 'local',
    origins: ['aggregate.py']
  }]
});
const articles = [
  { title: 'Older', source: 'Example', timestamp: 100, type: 'analysis' },
  { title: 'Newer', source: 'Other', language: 'en', originRegion: 'North America', timestamp: 200 }
];
assert.strictEqual(release.sourceMeta(articles[0], catalog).language, 'de');
assert.strictEqual(release.sourceMeta(articles[0], catalog).geographySource, 'explicit');
assert.strictEqual(release.sourceMeta(articles[0], catalog).registryGeneratedAt, '2026-08-02T10:00:00Z');
assert.deepStrictEqual(release.sourceMeta(articles[0], catalog).provenance, ['aggregate.py']);
assert.strictEqual(release.sourceMeta(articles[0], catalog).sourceType, 'movement');
assert.strictEqual(release.sourceMeta(articles[0], catalog).originScope, 'local');
assert.deepStrictEqual(
  release.filterArticles(articles, { language: 'de', sort: 'newest' }, catalog).map(item => item.title),
  ['Older']
);
assert.deepStrictEqual(
  release.filterArticles(articles, { sort: 'oldest' }, catalog).map(item => item.title),
  ['Older', 'Newer']
);
assert.strictEqual(release.classifyArticle(articles[0]), 'analysis');

const chunks = release.splitTranslationChunks('A '.repeat(3500), 1200);
assert(chunks.length > 1, 'long articles must be split into multiple translation requests');
assert(chunks.every(chunk => chunk.length <= 1200));
assert.strictEqual(chunks.join(' ').replace(/\s+/g, ' ').trim(), 'A '.repeat(3500).trim());

const bern = { latitude: 46.948, longitude: 7.4474 };
const nearby = { latitude: 46.95, longitude: 7.44 };
assert(release.distanceKm(bern, nearby) < 2);
assert.strictEqual(release.distanceKm(bern, {}), null);
assert.strictEqual(release.eventMapUrl({ latitude: null, longitude: null, city: 'Berlin' }), 'https://www.openstreetmap.org/search?query=Berlin');
assert.strictEqual(release.eventMapUrl({ latitude: null, longitude: null }), '');

const now = Date.parse('2026-07-28T10:00:00Z');
const event = {
  id: 'event-1',
  title: 'Meeting',
  start: Date.parse('2026-07-29T18:00:00Z'),
  end: Date.parse('2026-07-29T20:00:00Z'),
  country: 'CH',
  city: 'Bern',
  categories: ['meeting'],
  groups: ['Collective'],
  latitude: 46.95,
  longitude: 7.44,
  link: 'https://example.org/event'
};
assert.strictEqual(release.filterEvents([event], { archived: false, country: 'CH' }, now).length, 1);
assert.strictEqual(release.filterEvents([event], { archived: false, city: 'Zurich' }, now).length, 0);
assert.strictEqual(release.eventCategoryGroup('action/protest/camp'), 'Action & Protest');
assert.strictEqual(release.eventCategoryGroup('film'), 'Culture & Nightlife');
assert.strictEqual(release.filterEvents([
  { title: 'Unclear one', country: 'XC', categories: [], groups: [], start: now + 1000, end: now + 2000 },
  { title: 'Unclear two', country: 'XE', categories: [], groups: [], start: now + 1000, end: now + 2000 },
  { title: 'Known', country: 'DE', categories: [], groups: [], start: now + 1000, end: now + 2000 }
], { country: '__international__' }, now).length, 2);
assert(release.eventIcs(event).includes('BEGIN:VEVENT'));
assert(release.eventMapUrl(event).startsWith('https://www.openstreetmap.org/'));

const backup = release.backupPayload({
  wrn_bookmarks: '[]',
  wrn_next_development_reviews_v1: '[]',
  unrelated: 'secret'
}, '2.0.0-preview');
assert.strictEqual(release.validBackup(backup), true);
assert.strictEqual(backup.localStorage.unrelated, undefined);
assert.strictEqual(backup.localStorage.wrn_next_development_reviews_v1, '[]');

console.log('News App 2 release helpers: OK');
