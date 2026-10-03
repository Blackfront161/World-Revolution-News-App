'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const media = require('../news-app-2-media.js');
const candidate = JSON.parse(fs.readFileSync('docs/evidence/WRN-CONTENT-EDITORIAL-2026-10-03/intake-candidate.json','utf8'));
const sources = JSON.parse(fs.readFileSync('podcast-sources.json','utf8'));
const podcasts = JSON.parse(fs.readFileSync('podcasts.json','utf8'));
const books = JSON.parse(fs.readFileSync('library-feed.json','utf8'));
const oldIds = new Set(podcasts.slice(0,candidate.baselinePodcastRows).map(r=>r.id));
assert(candidate.podcastRecords.every(r=>!oldIds.has(r.id)));
for (const row of candidate.podcastRecords) {
  const stale = {...row, contentPolicy:'playable', audioUrl:'https://example.org/unapproved.mp3', artwork:'https://example.org/unapproved.jpg', description:'UNAPPROVED'};
  for (const catalogs of [[[row],[stale]], [[stale],[row]]]) {
    const result = media.mergePodcastCatalogs(catalogs,sources)[0];
    assert.equal(result.contentPolicy,'metadata_and_links_only');
    assert(!result.audioUrl && !result.artwork && !result.description);
    assert.equal(result.id,row.id); assert.equal(result.episodeUrl,row.episodeUrl); assert.equal(result.published,row.published);
  }
  const withdrawn = media.mergePodcastCatalogs([[{...row,status:'withdrawn'}],[stale]],sources);
  assert.equal(media.visiblePodcastCatalog(withdrawn,sources).length,0,'Withdrawal must beat a later stale playable snapshot');
}
for (const row of candidate.bookRecords) {
  assert(books.some(r=>r.id===row.id && r.readUrl===row.readUrl));
  assert.equal(new URL(row.readUrl).hostname,'de.anarchistlibraries.net');
  assert.equal(row.contentPolicy,'metadata_and_links_only');
  assert.deepEqual(row.downloads,{}); assert.deepEqual(row.languages,['de']);
  assert(!row.readUrl.endsWith('.epub'));
}
const sandbox = {window:{}}; vm.runInNewContext(fs.readFileSync('lexicon-tab.js','utf8'),sandbox);
const snap = sandbox.window.WRNLexicon184.snapshot();
assert(snap.terms.find(t=>t.id==='social-insertion').summary.de.includes('Einfluss'));
assert(snap.terms.find(t=>t.id==='worker-cooperative').sources.includes('knowledge-worker-cooperative-definition'));
assert(snap.terms.find(t=>t.id==='free-prior-informed-consent').summary.de.includes('verweigern oder zurückziehen'));
console.log('New metadata intake preserves identity, dates, withdrawals and strongest rights policy even with stale remote media; corrected glossary references resolve.');
