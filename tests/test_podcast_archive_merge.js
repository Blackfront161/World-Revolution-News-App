'use strict';
const assert = require('node:assert/strict');
const media = require('../news-app-2-media.js');
const policy = require('../podcast-content-policy.js');
for (const id of policy.rules.languageConflictEpisodeIds) {
  const stale = policy.projectEpisode({id:`original:${id}`, sourceId:'aradio-berlin', language:'en',languageVerified:true});
  assert.equal(stale.language,'und');
  assert.equal(stale.languageVerified,false);
  assert.equal(stale.languageReviewRequired,true);
}
const sources = [{id:'ok'}, {id:'leftover-talk', enabled:false}, {id:'mudawanat-arabic', contentPolicy:'metadata_and_links_only'}];
const row = (id, fields={}) => ({id, sourceId:'ok', title:id, ...fields});
const initial = [row('old'),row('gone',{status:'withdrawn'}),row('blocked',{sourceId:'leftover-talk'})];
const result = media.mergePodcastCatalogs([initial,[row('new'),row('gone'),row('stale',{sourceId:'mudawanat-arabic',audioUrl:'https://x.example/old.mp3',description:'foreign',license:'CC-BY'})]], sources);
assert.deepEqual(media.visiblePodcastCatalog(result,sources).map(x=>x.id),['old','new','stale']);
assert.equal(result.find(x=>x.id==='gone').status,'withdrawn');
assert.equal(result.find(x=>x.id==='stale').audioUrl,'');
assert.equal(result.find(x=>x.id==='stale').license,'Rights unverified; original source only');
assert.deepEqual(media.mergePodcastCatalogs([result,[]],sources),result);
assert.deepEqual(media.mergePodcastCatalogs([[row('unknown',{sourceId:'missing'})]],sources),[]);
const legacyRdl = media.mergePodcastCatalogs([[{id:policy.rules.restrictedEpisodeIds[0],sourceId:'',audioUrl:'https://example.org/stale.mp3'}]],[{id:policy.rules.canonicalSourceId}]);
assert.equal(legacyRdl.length,1);
assert.equal(legacyRdl[0].sourceId,policy.rules.canonicalSourceId);
assert.equal(legacyRdl[0].audioUrl,'');
console.log('Archive survives partial refresh and revocations; source exclusion and stale rights remain enforced.');
