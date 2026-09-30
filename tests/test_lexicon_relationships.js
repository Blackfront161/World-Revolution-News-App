'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('lexicon-tab.js', 'utf8'), context);
const snapshot = context.window.WRNLexicon184.snapshot();
const ids = new Set(snapshot.terms.map(term => term.id));
const sourceIds = new Set(snapshot.sources.map(source => source.id));
assert.equal(ids.size, snapshot.terms.length, 'Public term IDs must be unique');
assert.equal(sourceIds.size, snapshot.sources.length, 'Reference IDs must be unique');
const unresolved = snapshot.terms.flatMap(term => [
  ...(term.related || []).filter(id => !ids.has(id)).map(id => `${term.id} -> term:${id}`),
  ...(term.sources || []).filter(id => !sourceIds.has(id)).map(id => `${term.id} -> source:${id}`)
]);
assert.equal(unresolved.length, 0, `Broken public relationships: ${unresolved.join(', ')}`);
for (const id of ['community-self-defence', 'counter-mobilisation', 'deplatforming']) {
  assert(snapshot.terms.find(term => term.id === id).related.includes('anti-fascism'), `${id} loses its anti-fascism relation`);
}
for (const id of ['dog-whistle', 'entryism']) {
  assert(snapshot.terms.find(term => term.id === id).related.includes('fascism'), `${id} loses its fascism relation`);
}
const term = snapshot.terms.find(term => term.id === 'fascism');
for (const language of ['de', 'en']) {
  for (const field of ['title', 'summary', 'practice', 'debate']) {
    assert.equal(typeof term[field][language], 'string');
    assert(term[field][language].trim(), `Missing ${language}/${field}`);
  }
}
assert(term.sources.includes('ushmm-fascism'), 'New definition needs its specific reference');
assert.equal(snapshot.sources.find(source => source.id === 'ushmm-fascism').url, 'https://encyclopedia.ushmm.org/content/en/article/fascism-1');
assert(term.revision.note.includes('review pending'), 'Draft must not claim independent acceptance');
term.title.de = 'Changed exported copy';
assert.equal(context.window.WRNLexicon184.snapshot().terms.find(term => term.id === 'fascism').title.de, 'Faschismus', 'Export mutation must not change the glossary');
console.log(`PASS ${ids.size} unique public terms, ${sourceIds.size} references, no broken relationships, five repaired links, DE/EN draft and isolated export`);
