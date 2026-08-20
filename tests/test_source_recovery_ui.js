'use strict';

const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('source-recovery-ui-183.js', 'utf8');

const requiredStates = [
  'available',
  'recovered',
  'temporarily_restricted',
  'website_reachable_feed_broken',
  'feed_broken_unconfirmed',
  'permanently_broken',
  'not_checked'
];

for (const state of requiredStates) {
  assert(source.includes(state), `missing recovery state: ${state}`);
}

for (const language of ['en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
  assert(
    new RegExp(`\\b${language}:\\s*\\{`).test(source),
    `missing UI language: ${language}`
  );
}

assert(source.includes('recoveryStateOf'));
assert(source.includes('dataset.recoveryState'));
assert(source.includes('replacementUrl'));
assert(source.includes('data-recovery-candidate'));
assert(source.includes("cache: 'no-store'"));
assert(!source.includes('localStorage.clear('));
assert(!source.includes('caches.delete('));

console.log('source recovery UI tests: passed');
