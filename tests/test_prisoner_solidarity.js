'use strict';

const assert = require('node:assert/strict');

global.window = global;
global.document = {
  documentElement: { lang: 'de' },
  getElementById() { return null; }
};
global.addEventListener = () => {};

require('../prisoner-solidarity.js');

const api = global.WRNPrisonerSolidarity190;
assert.ok(api);
assert.equal(api.label('de'), 'Solidarität');
assert.equal(api.label('en'), 'Solidarity');
assert.equal(api.label('tr'), 'Dayanışma');
assert.equal(api.sectionLabel('write', 'de'), 'Briefe schreiben');
assert.equal(api.sectionLabel('rules', 'fr'), 'Règles et conseils');
assert.equal(api.draftPrefix, 'wrn_prisoner_letter_');

assert.equal(api.isCurrent({
  verification: { status: 'verified', nextReviewAt: '2099-01-01' }
}), true);
assert.equal(api.isCurrent({
  verification: { status: 'verified', nextReviewAt: '2020-01-01' }
}), false);
assert.equal(api.isCurrent({
  verification: { status: 'pending', nextReviewAt: '2099-01-01' }
}), false);

// A reachable undated source must never unlock writing/copying/printing,
// even if a future deadline is accidentally attached to it.
assert.equal(api.isCurrent({
  verification: { status: 'needs-review', nextReviewAt: '2099-01-01' }
}), false);
for (const invalidDate of ['2099-13-01', '2099-02-30', '2099-01-00', 'bad-date']) {
  assert.equal(api.isCurrent({verification: {status: 'verified', nextReviewAt: invalidDate}}), false);
}
const reviewedData = require('../prisoner-solidarity.json');
const pendingProfiles = reviewedData.profiles.filter(p => p.verification.status === 'needs-review');
assert.equal(pendingProfiles.length, 17);
assert.equal(pendingProfiles.every(p => api.isCurrent(p) === false), true);
for (const profile of reviewedData.profiles.filter(p => p.verification.status === 'verified')) {
  assert.equal(api.isCurrent({ ...profile, verification: { ...profile.verification, nextReviewAt: '2020-01-01' } }), false);
}

console.log('WRN prisoner solidarity contracts: OK');
