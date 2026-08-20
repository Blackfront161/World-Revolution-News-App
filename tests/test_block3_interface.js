'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'interface-block3.js'), 'utf8');

for (const marker of [
  'WRNInterfaceBlock3',
  'CORRUPTION_CATEGORY',
  'ensureThirtyDayArchive',
  'XMLHttpRequest',
  'dataUrls?.newsArchive',
  "replace(/news-feed\\.json",
  'selectedSources',
  "['expand', 'translate', 'podcast', 'later', 'zine', 'read', 'share', 'original']",
  'renderZineEditor',
  'exactArticleForCard',
  'wrn-stories-switch-indicator-183'
]) {
  assert(source.includes(marker), `Missing Block 3 marker: ${marker}`);
}

for (const label of [
  'Korruption', 'Corruption', 'Corrupción', 'Corruzione', 'Corrupção',
  'Коррупция', 'Διαφθορά', 'Yolsuzluk'
]) {
  assert(source.includes(label), `Missing corruption label: ${label}`);
}

assert(!source.includes('localStorage.clear('), 'Block 3 must not clear all local storage.');
assert(!source.includes('caches.delete('), 'Block 3 must not delete caches.');
assert(!source.includes('serviceWorker.getRegistrations'), 'Block 3 must not unregister service workers.');

console.log('Block 3 interface contract: OK');
