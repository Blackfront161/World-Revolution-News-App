'use strict';

const assert = require('node:assert/strict');
const pipeline = require('../video-pipeline-core.js');

assert.equal(
  pipeline.identifyVideo('https://youtu.be/dQw4w9WgXcQ?t=2').canonicalId,
  pipeline.identifyVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ').canonicalId
);
assert.equal(
  pipeline.identifyVideo('https://kolektiva.media/w/tDVHuFhrhB5wedNZhrn62B').platform,
  'Kolektiva'
);
assert.equal(pipeline.identifyVideo('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), null);

const registry = {
  defaults: { maxItemsTotal: 10, maxItemsPerSource: 1 },
  sources: [{
    id: 'test-source',
    name: 'Test Source',
    sourceNames: ['Test Source'],
    kind: 'news-embedded',
    topics: ['No War'],
    languages: ['en'],
    regions: ['Europe'],
    maxItemsPerRun: 1,
    editorialStatus: 'approved-existing'
  }]
};
assert.equal(
  pipeline.isEditoriallyRelevant(
    { title: 'Kollaborative Modellierung mit Event Storming', primaryTopic: 'Movement News' },
    registry.sources[0]
  ),
  false
);
const result = pipeline.buildVideoFeed({
  registry,
  seeds: [],
  articles: [
    {
      title: 'Anti-war protest blocks military convoy',
      quelleName: 'Test Source',
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      pubDate: '2026-08-01T10:00:00Z',
      primaryRegion: 'Europe',
      primaryTopic: 'No War',
      originalLanguage: 'en'
    },
    {
      title: 'Translated report about the anti-war protest',
      quelleName: 'Test Source',
      link: 'https://youtu.be/dQw4w9WgXcQ',
      pubDate: '2026-08-01T11:00:00Z',
      primaryRegion: 'Europe',
      primaryTopic: 'No War',
      originalLanguage: 'en'
    },
    {
      title: 'A second anti-war video exceeds the source quota',
      quelleName: 'Test Source',
      link: 'https://www.youtube.com/watch?v=abcdefghijk',
      pubDate: '2026-08-01T09:00:00Z',
      primaryRegion: 'Europe',
      primaryTopic: 'No War',
      originalLanguage: 'en'
    },
    {
      title: 'Truck simulator gameplay',
      quelleName: 'Unrelated Uploads',
      link: 'https://www.youtube.com/watch?v=lmnopqrstuv',
      pubDate: '2026-08-01T13:00:00Z',
      primaryRegion: 'Global',
      primaryTopic: 'Movement News'
    }
  ]
});

assert.equal(result.stats.duplicateCount, 1);
assert.equal(result.stats.quotaRemovedCount, 1);
assert.equal(result.stats.rejectedCount, 1);
assert.equal(result.items.length, 1);
assert.equal(result.items[0].duplicateCount, 2);
assert.equal(result.items[0].sourceId, 'test-source');
assert.equal(result.items[0].section, 'reports');
assert.ok(result.items[0].thumbnailUrl.includes('i.ytimg.com'));

const health = pipeline.buildVideoHealth(result, registry, { generatedAt: '2026-08-09T00:00:00Z' });
assert.equal(health.totals.acceptedCount, 1);
assert.equal(health.totals.duplicateCount, 1);
assert.equal(health.byPlatform.YouTube, 1);

console.log('Video pipeline contracts: OK');
