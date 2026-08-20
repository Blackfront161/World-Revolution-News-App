'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const app = read('news-app-2.js');
const html = read('index.html');
const productionWorker = read('service-worker.js');
const previewWorker = read('news-app-2-sw.js');
const data = JSON.parse(read('solidarity-network.json'));

for (const source of [html, productionWorker, previewWorker]) {
  assert(source.includes('news-card-copy.js?release=1'));
  assert(source.includes('solidarity-network-21.js?release=6'));
  assert(source.includes('news-app-2.js?release=48'));
  assert(source.includes('news-app-2.css?release=43'));
}
assert(productionWorker.includes("wrn-app-v2.1.1-r1"));
assert(productionWorker.includes("wrn-data-v2.1.1-r1"));
assert(previewWorker.includes('`${CACHE_PREFIX}v87`'));

assert(app.includes('const storedTranslation = translationFor(article);'));
assert(app.includes("cardCopy.syncTeaserParagraph(card.querySelector('.news-card__open')"));
assert(!app.includes('intro.textContent = parsed.intro || article.intro'));
assert(app.includes("helpFilters: { query: '', region: '', location: '', language: '', topic: '' }"));
assert(app.includes('id="next-help-query" type="search" autocomplete="off"'));
assert(app.includes('id="next-help-location"'));
assert(app.includes("data-action=\"help-clear\""));
assert(app.includes('<details class="help-profile"'));
assert(app.includes('<summary><span><strong>'));
assert(!app.includes("event.target.closest?.('.help-profile > summary')"), 'native details/summary must keep its built-in keyboard interaction');
assert(!/localStorage[^\n]*helpFilters|sessionStorage[^\n]*helpFilters/.test(app));
const helpRuntime = app.slice(app.indexOf('function renderHelp()'), app.indexOf('function libraryResults()'));
assert(!/geolocation|getCurrentPosition/.test(helpRuntime), 'help directory must not request device location');

const ids = new Set(data.profiles.map(profile => profile.id));
for (const id of ['opferhilfe-schweiz-142', 'dargebotene-hand-143', 'pro-juventute-147']) assert(ids.has(id));
const victimSupport = data.profiles.find(profile => profile.id === 'opferhilfe-schweiz-142');
assert.equal(victimSupport.officialContact, 'tel:142');
assert.equal(victimSupport.emergency, false);
assert(victimSupport.notResponsibleFor.some(value => value.includes('kein Notruf')));
for (const profile of data.profiles.filter(item => ['opferhilfe-schweiz-142', 'dargebotene-hand-143', 'pro-juventute-147'].includes(item.id))) {
  assert.equal(profile.lastChecked, '2026-08-16');
  assert(profile.verificationSources.every(url => url.startsWith('https://')));
}

console.log('Next-update card/help integration contract: OK');
