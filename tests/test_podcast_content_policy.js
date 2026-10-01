'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const policy = require('../podcast-content-policy.js');
const media = require('../news-app-2-media.js');
assert.deepEqual(policy.rules, JSON.parse(fs.readFileSync(path.join(root, 'podcast-content-policy.json'), 'utf8')));
const stale = {
  id: policy.rules.restrictedEpisodeIds[0], title: 'Solidarische Organisierung', sourceName: 'Radio Dreyeckland',
  sourceId: '', feedUrl: 'https://rdl.de/podcasts/all', episodeUrl: 'https://rdl.de/beitrag/solidaritaet',
  audioUrl: 'https://rdl.de/recording.mp3', url: 'https://rdl.de/recording.mp3',
  audioUrls: ['https://rdl.de/recording.mp3'], candidates: ['https://rdl.de/recording.mp3'],
  description: 'Foreign full text', summary: 'Foreign summary', content: 'Foreign body', transcript: 'Foreign transcript',
  artwork: 'https://rdl.de/photo.jpg', image: 'https://rdl.de/photo.jpg', language: 'de', published: '2026-09-30'
};
const projected = policy.projectEpisode(stale);
assert.equal(projected.id, stale.id);
assert.equal(projected.sourceId, 'radio-dreyeckland');
assert.equal(projected.endpointId, policy.rules.endpointId);
assert.equal(projected.episodeUrl, stale.episodeUrl);
for (const key of ['audioUrls','candidates','image','summary','content','transcript','url']) assert.equal(projected[key], undefined, key);
for (const key of ['audioUrl','artwork','description']) assert.equal(projected[key], '');
assert.equal(stale.audioUrl, 'https://rdl.de/recording.mp3');
assert.equal(policy.isMetadataOnly({ id: `original:${stale.id}`, candidates: stale.candidates }), true);
assert.equal(policy.isMetadataOnly({ id: 'other', sourceId: 'radio-dreyeckland', feedUrl: 'https://rdl.de/rss.xml' }), false);
assert.equal(policy.isMetadataOnly({ id: 'future', feedUrl: stale.feedUrl, contentPolicy: 'playable' }), true);
assert.equal(policy.isMetadataOnly({ sourceId: 'restricted' }, [{ id: 'restricted', contentPolicy: 'metadata_and_links_only' }]), true);
assert.equal(policy.isMetadataOnly({ feedUrl: 'https://example.org/rss' }, [{ feedUrl: 'https://example.org/rss', contentPolicy: 'metadata_and_links_only' }]), true);
for (const url of ['http://rdl.de/beitrag/1','https://user:password@rdl.de/beitrag/1','https://rdl.de/audio.MP3?x=1','javascript:alert(1)']) assert.equal(policy.originalUrl(url), '');
const normalized = media.normalizePodcast(stale);
assert.equal(normalized.audioUrl, ''); assert.equal(normalized.artwork, '');
assert.equal(normalized.contentPolicy, 'metadata_and_links_only');
assert.equal(normalized.sourceKind, 'free-radio');
const ordinary = { id:'ordinary', audioUrl:'https://example.org/audio.mp3', title:'Normal', language:'de' };
for (const sourceId of policy.rules.metadataOnlySourceIds || []) {
  const projected = policy.projectEpisode({id:'new-stale-'+sourceId,sourceId,license:'CC BY-NC-ND 3.0',audioUrl:'https://example.org/foreign.mp3',summary:'foreign',episodeUrl:'https://example.org/episode'});
  assert.equal(projected.sourceId,sourceId);
  assert.equal(projected.audioUrl,'');
  assert.equal(projected.endpointId,undefined);
  assert.equal(projected.summary,undefined);
  assert.equal(projected.license,'Rights unverified; original source only');
  assert.equal(projected.rightsStatus,'unverified');
}
for (const id of policy.rules.metadataOnlyEpisodeIds || []) {
  assert(policy.isMetadataOnly({id:`original:${id}`,candidates:['https://example.org/foreign.mp3']}));
}
assert.equal(media.normalizePodcast(ordinary).audioUrl, ordinary.audioUrl);

const stored = new Map([
  ['wrn_audio_queue_v1', JSON.stringify([{ id:`original:${stale.id}`, candidates: stale.candidates }, {id:'ordinary', candidates:[ordinary.audioUrl]}])],
  ['wrn_audio_favorites_v1', JSON.stringify({ [stale.id]: true })]
]);
const window = { WRNPodcastContentPolicy: policy, addEventListener(){}, dispatchEvent(){} };
const document = { addEventListener(){}, getElementById(){ return null; }, querySelectorAll(){ return []; } };
const context = vm.createContext({ window, document, URL, console, setTimeout, clearTimeout, setInterval, clearInterval,
  location:{href:'https://example.org/'}, localStorage: {getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value)}, navigator:{} });
for (const name of ['audio-tools.js','audio-tab-183.js','media-player.js']) vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'), context);
const classic = window.WRNAudioTab183.normalizePodcast(stale);
assert(classic); assert.equal(classic.rawId, stale.id); assert.equal(classic.candidates.length, 0);
assert.equal(classic.originalUrl, stale.episodeUrl); assert.equal(classic.artwork,'');
assert.equal(window.WRNAudioTools.getShareData(stale).url, stale.episodeUrl);
assert.equal(window.WRNAudioTools.getShareData({id:stale.id, audioUrl:stale.audioUrl}), null);
assert.equal(window.WRNAudioTools.getShareData(ordinary).url, ordinary.audioUrl);
assert.equal(window.WRNAudioTools.addToQueue({id:stale.id, candidates:stale.candidates}), false);
assert.equal(window.WRNAudioTools.getQueue().length, 1);
assert.equal(window.WRNAudioTools.getQueue()[0].id, 'ordinary');
assert.equal(window.WRNAudioTools.isFavorite(stale.id), true);
assert.equal(JSON.parse(stored.get('wrn_audio_queue_v1')).length, 2, 'Reading does not reset stored queue or favorites');
async function main() {
  assert.equal(await window.WRNMediaPlayer.play({id:stale.id,candidates:stale.candidates}), false);
  assert.equal(await window.WRNMediaPlayer.play({id:'new',feedUrl:stale.feedUrl,candidates:stale.candidates}), false);
  delete window.WRNPodcastContentPolicy;
  assert.equal(await window.WRNMediaPlayer.play({id:'ordinary',candidates:[ordinary.audioUrl]}), false);
  assert.equal(window.WRNAudioTools.getShareData(ordinary), null);
  assert.equal(window.WRNAudioTools.addToQueue({id:'ordinary',candidates:[ordinary.audioUrl]}), false);
  assert.equal(window.WRNAudioTools.getQueue().length, 0);
  assert.equal(window.WRNAudioTab183.normalizePodcast(stale), null);
  context.window.WRNPodcastContentPolicy = policy;
  const missingContext = vm.createContext({window:{},URL});
  vm.runInContext(fs.readFileSync(path.join(root,'news-app-2-media.js'),'utf8'),missingContext);
  const missingNormalized = missingContext.window.WRNNewsApp2Media.normalizePodcast(stale);
  assert.equal(missingNormalized.audioUrl,''); assert.equal(missingNormalized.artwork,''); assert.equal(missingNormalized.description,'');
  for (const lang of ['de','en','es','fr','it','pt','ru','el','tr']) assert(policy.originalOnlyText(lang));
  for (const name of ['index.html','classic.html']) {
    const html = fs.readFileSync(path.join(root,name),'utf8');
    assert(html.indexOf('podcast-content-policy.js') < html.indexOf('media-player.js'));
  }
  console.log('Podcast policy contracts passed: stale payload, Classic/current views, sharing, queue, favorites, direct player.');
}
main().catch(error => { console.error(error); process.exitCode=1; });
