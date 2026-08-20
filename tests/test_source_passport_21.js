'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const passport = require('../source-passport-21.js');

const root = path.resolve(__dirname, '..');
const registryPayload = JSON.parse(fs.readFileSync(path.join(root, 'sources-registry.json'), 'utf8'));
const healthPayload = JSON.parse(fs.readFileSync(path.join(root, 'source-health.json'), 'utf8'));
assert(Array.isArray(registryPayload.sources) && registryPayload.sources.length > 0, 'real registry schema is empty');
assert(!Array.isArray(healthPayload) && Object.keys(healthPayload).length > 0, 'real health fixture is not the expected object map');
assert(passport.healthEntries(healthPayload).length > 0, 'object health map is not normalized');

const registry = registryPayload.sources.find(item => item.name && item.originRegion && item.languages?.length);
assert(registry, 'real registry has no suitable source fixture');
const health = passport.findHealth(healthPayload, registry.name);
const built = passport.buildPassport({ registry, health, articles: [{ quelleName: registry.name }], unknown: 'Unbekannt' });
assert.notEqual(built.origin, 'Unbekannt', 'known registry origin was discarded');
assert.notEqual(built.languages, 'Unbekannt', 'known registry languages were discarded');
assert.equal(built.qualityScore, null, 'source passport must not invent a quality score');
assert.equal(built.funding, 'Unbekannt', 'missing funding must remain unknown');
assert.equal(built.documentedCorrections, 'Unbekannt', 'absence of correction history must not be misreported as zero');
assert.equal(passport.buildPassport({ profile: { documentedCorrections: [] }, unknown: 'Unbekannt' }).documentedCorrections, '0',
  'an explicitly documented empty correction history must remain distinguishable from unknown');
assert.equal(passport.buildPassport({ articles: [{ corrected: true }], unknown: 'Unbekannt' }).documentedCorrections, '1');

for (const language of ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
  const labels = passport.passportLabels(language);
  for (const key of ['operator', 'origin', 'funding', 'sourceType', 'proximity', 'provenance', 'corrections', 'reliability', 'why', 'unknown']) {
    assert(labels[key], `${language} source-passport label is missing: ${key}`);
  }
  assert(labels.whyText(3).includes('3'), `${language} why-shown explanation does not interpolate the real count`);
}
assert.equal(passport.passportLabels('es').unknown, 'Desconocido');
assert.equal(passport.passportLabels('tr').unknown, 'Bilinmiyor');
assert.equal(passport.passportLabels('xx').unknown, 'Unknown', 'unsupported language must use explicit English fallback');

console.log('WRN source passport 2.1 real-schema contracts: OK');
