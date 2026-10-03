'use strict';
const assert = require('node:assert/strict');
const core = require('../news-app-2-core.js');

for (const view of ['home', 'following', 'discover', 'events', 'lexicon', 'library', 'prisoners', 'help', 'developments', 'saved', 'atlas']) {
  assert.equal(core.navigationRoute(`#${view}`).view, view);
}
for (const section of ['video', 'podcasts', 'generated', 'radio', 'radio-podcasts', 'zine']) {
  assert.equal(core.navigationRoute(`#media/${section}`).mediaSection, section);
}
for (const hash of ['', '#unknown', '#media/unknown', '#library/radio', '#media/radio/extra', '#media?' + 'a'.repeat(2048)]) {
  assert.equal(core.navigationRoute(hash), null);
}
const original = {
  library: { query: 'private reading search', languages: ['de', 'en'], source: 'anarchist-library', format: 'epub', limit: 60 },
  media: { query: 'an episode', languages: ['de'], source: 'source&name', section: 'podcasts' },
  eventFilter: { country: 'CH', regions: ['Europe'], location: { latitude: 1, longitude: 2 } },
  helpFilters: { query: 'sensitive help request', location: 'private town' },
  articles: [{ content: 'body' }],
  localSolidarityDrafts: [{ details: 'private draft' }]
};
const filters = core.navigationFilters(original);
original.library.languages.push('fr');
assert.deepEqual(filters.library.languages, ['de', 'en'], 'History must own its array snapshot');
assert.equal(filters.library.query, 'private reading search');
assert.equal(filters.eventFilter.location, undefined, 'History must exclude location coordinates');
assert.equal(filters.helpFilters, undefined, 'Help privacy promise excludes all help filters from history');
assert(!JSON.stringify(filters).includes('sensitive help request'));
assert(!JSON.stringify(filters).includes('private town'));
assert.equal(filters.articles, undefined);
assert.equal(filters.localSolidarityDrafts, undefined);
const hash = core.navigationHash({ view: 'library', filters });
assert.equal(hash, '#library?source=anarchist-library&language=de%2Cen&format=epub');
assert.deepEqual(core.navigationRoute(hash).filters.library, {source:'anarchist-library', languages:['de','en'], format:'epub'});
assert(!hash.includes('private'));
assert.equal(core.navigationHash({view:'help',filters}), '#help');
assert.equal(core.navigationHash({view:'events',filters}), '#events');
const podcastHash = core.navigationHash({view:'media',mediaSection:'podcasts',filters});
assert.equal(core.navigationRoute(podcastHash).filters.media.source, 'source&name');
assert.equal(core.navigationRoute('#media/video?language=de&topic=Labor&source=publisher').filters.videoFilters.language, 'de');
assert.deepEqual(core.navigationRoute('#library?language=all').filters.library.languages, []);
assert.equal(core.navigationRoute('#library?source=%00bad&query=private&location=here').filters.library.source, undefined);
const malformed = core.navigationFilters({library:{query:{bad:true},languages:[1],limit:Infinity,source:'x'.repeat(300)}});
assert.equal(malformed.library.query, undefined);
assert.equal(malformed.library.languages, undefined);
assert.equal(malformed.library.limit, undefined);
assert.equal(malformed.library.source.length, 256);
console.log('Navigation routes, independent filter snapshots and URL privacy: PASS');
for (const [hash,id] of [['#lexicon?item=access-intimacy','access-intimacy'], ['#library?item=book-123','book-123'], ['#media/radio?item=3cr','3cr'], ['#discover?item=news-123','news-123']]) {
  const route=core.navigationRoute(hash);
  assert.equal(route.itemId,id);
  assert.equal(core.navigationHash({...route, filters:route.filters}),hash);
}
for (const hash of ['#help?item=private-name','#prisoners?item=private-profile','#lexicon?item=%22%3E','#library?item=https%3A%2F%2Fexternal.test','#media/radio?item='+'x'.repeat(129)]) {
  assert.equal(core.navigationRoute(hash).itemId,undefined,'only bounded public catalog IDs become item routes');
}
