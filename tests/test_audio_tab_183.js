'use strict';
const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('audio-tab-183.js', 'utf8');
const radioStations = JSON.parse(fs.readFileSync('radio-stations.json', 'utf8'));
assert(source.includes("action=podcasts.list"), 'public worker podcast library is missing');
assert(source.includes("generated-podcasts.json"), 'static generated podcast fallback is missing');
assert(source.includes("appendSimpleMediaControls"), 'shared seekable player is not used');
assert(source.includes("window.openAudioHub"), 'legacy audio entry point is not redirected');
assert(source.includes('legacyAudioTab181?.close?.()'), 'legacy audio tab is not closed during the upgrade');
assert(!/function ensureRoot\(\)\s*\{\s*window\.WRNAudioTab181\?\.close/.test(source), 'the current audio tab closes itself while opening');
assert(source.includes("version:'1.8.4'"), 'audio hotfix version is missing');
assert(source.includes('if (!candidates.length && !originalUrl) return null;'), 'stations without a direct stream are hidden instead of linking to their website');
assert.strictEqual(radioStations.length, 27, 'the configured radio catalog changed unexpectedly');
assert(radioStations.every(station => station.website), 'every radio station needs a website fallback');
assert(source.includes("oceania: 'Ozeanien'"), 'German Oceania label is missing');
assert(!source.includes('Australia & Oceania'), 'old Australia & Oceania label remains');
for (const language of ['en','de','es','fr','it','pt','ru','el','tr']) {
  assert(new RegExp(`\\n    ${language}: \\{`).test(source), `missing UI language ${language}`);
}
for (const region of ['africa','latin-america','asia','oceania']) {
  assert(source.includes(`'${region}'`) || source.includes(`${region}:`), `missing region ${region}`);
}
console.log('Audio tab 1.8.4 tests passed.');
