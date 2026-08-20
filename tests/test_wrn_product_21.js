'use strict';

const assert = require('node:assert/strict');
const product = require('../wrn-product-21.js');

const NOW = Date.parse('2026-08-12T12:00:00Z');
Date.now = () => NOW;
const article = (id, source, language, additions = {}) => ({
  id, title: `Report ${id}`, quelleName: source, language,
  link: `https://example.org/${id}`, pubDate: '2026-08-12T08:00:00Z', ...additions
});
const cluster = (id, items) => ({ id, title: `Dossier ${id}`, items, matchConfidence: 0.81, matchReasons: ['entity', 'phrase'] });

const completeAction = {
  id: 'action-1', actionType: 'letter campaign', organizer: 'Example collective',
  title: 'Write before the deadline', details: 'Use the verified postal instructions from the organizer.',
  originalSource: 'https://example.org/action', locationOrReach: 'International',
  startsAt: '2026-08-10T00:00:00Z', deadline: '2026-08-20T00:00:00Z',
  lastCheckedAt: '2026-08-11T10:00:00Z', nextCheckAt: '2026-08-14T10:00:00Z',
  expiresAt: '2026-08-21T00:00:00Z', verificationStatus: 'verified', dossierId: 'a',
  safetyNotes: ['Do not publish private addresses.']
};

assert.equal(product.activeVerifiedActions([completeAction], NOW).length, 1, 'complete current verified action must be active');
assert.equal(product.activeVerifiedActions([{ ...completeAction, verificationStatus: 'pending' }], NOW).length, 0, 'unverified action must not be active');
assert.equal(product.activeVerifiedActions([{ ...completeAction, expiresAt: '2026-08-11T00:00:00Z' }], NOW).length, 0, 'expired action must not be active');
assert.equal(product.activeVerifiedActions([{ ...completeAction, nextCheckAt: '2026-08-12T11:00:00Z' }], NOW).length, 0, 'stale verification must not be active');
assert.equal(product.activeVerifiedActions([{ ...completeAction, safetyNotes: [] }], NOW).length, 0, 'incomplete action schema must not be active');
assert.equal(product.activeVerifiedActions([{ ...completeAction, startsAt: '', deadline: '' }], NOW).length, 0, 'action must have a beginning or deadline');
assert.equal(product.activeVerifiedActions([{ ...completeAction, title: '' }], NOW).length, 0, 'action without display title must not be active');
const incompleteAssessment = product.solidarityActionAssessment({ title: 'Unreviewed action' }, NOW);
assert.equal(incompleteAssessment.eligible, false);
assert(incompleteAssessment.missing.includes('originalSource'));
assert(incompleteAssessment.missing.includes('startsAt|deadline'));
assert(incompleteAssessment.reasons.includes('missing-fields'));
assert.equal(product.solidarityActionAssessment({ ...completeAction, lastCheckedAt: '2026-08-13T10:00:00Z' }, NOW).eligible, false,
  'a future last-check must not be treated as completed verification');

const first = product.createDevelopmentSnapshot([
  cluster('a', [article('one', 'Local A', 'es', {
    claims: [{ id: 'claim-1', text: 'Initial explicit statement', status: 'confirmed', evidenceUrl: 'https://example.org/evidence' }]
  })])
], [completeAction], '2026-08-12T12:00:00Z');
const initial = product.snapshotDiff(null, first);
assert.equal(initial.firstVisit, true, 'missing snapshot must be treated as first visit');
const migratedHistory = product.normalizeSnapshotHistory(first);
assert.equal(migratedHistory.schemaVersion, 2, 'legacy single snapshot must migrate to history schema');
assert.equal(product.previousSnapshot(migratedHistory).createdAt, first.createdAt);
let history = migratedHistory;
for (let index = 0; index < 9; index += 1) {
  history = product.appendSnapshotHistory(history, { ...first, createdAt: `2026-08-13T0${index}:00:00Z` }, 7);
}
assert.equal(history.snapshots.length, 7, 'snapshot history must remain bounded');
assert.equal(product.previousSnapshot(history).createdAt, '2026-08-13T08:00:00Z');

const followUp = product.createDevelopmentSnapshot([
  cluster('a', [
    article('one', 'Local A', 'es', {
      claims: [{ id: 'claim-1', text: 'Corrected explicit statement', status: 'corrected', evidenceUrl: 'https://example.org/evidence-2' }]
    }),
    article('two', 'Movement B', 'de', {
      documentUrl: 'https://example.org/document.pdf',
      claims: [{ id: 'claim-2', text: 'New confirmed detail', status: 'confirmed', evidenceUrl: 'https://example.org/evidence-3' }]
    })
  ])
], [completeAction], '2026-08-12T12:05:00Z');
const followUpDiff = product.snapshotDiff(first, followUp);
assert.equal(followUpDiff.firstVisit, false);
assert.deepEqual(followUpDiff.changes[0].newSources, ['Movement B'], 'new source must be reported');
assert.equal(followUpDiff.changes[0].newMedia.length, 1, 'new document must be reported');
assert.equal(followUpDiff.changes[0].newConfirmedInformation.length, 1, 'new explicitly confirmed information must be reported');
assert.equal(followUpDiff.changes[0].correctedOrRetracted.length, 1, 'correction must be reported');

const changedSameClaimId = product.createDevelopmentSnapshot([
  cluster('a', [article('one', 'Local A', 'es', {
    claims: [{ id: 'claim-1', text: 'Materially revised statement', status: 'confirmed', evidenceUrl: 'https://example.org/revised-evidence' }]
  })])
], [], '2026-08-12T12:07:00Z');
assert.equal(product.snapshotDiff(first, changedSameClaimId).changes[0].newConfirmedInformation.length, 1,
  'changed text/evidence under a stable claim ID must be visible');

const mediaBefore = product.createDevelopmentSnapshot([cluster('media', [article('m', 'Local A', 'es', { documentUrl: 'https://example.org/old.pdf' })])], [], '2026-08-12T12:08:00Z');
const mediaAfter = product.createDevelopmentSnapshot([cluster('media', [article('m', 'Local A', 'es', { documentUrl: 'https://example.org/new.pdf' })])], [], '2026-08-12T12:09:00Z');
assert.equal(product.snapshotDiff(mediaBefore, mediaAfter).changes[0].newMedia.length, 1, 'media URL replacement at the same position must be visible');

const deleted = product.createDevelopmentSnapshot([
  cluster('a', [article('one', 'Local A', 'es')])
], [], '2026-08-12T12:10:00Z');
const deletedDiff = product.snapshotDiff(followUp, deleted);
assert.equal(deletedDiff.changes[0].deletedClaims.length, 2, 'deleted claims must not silently disappear');

const reassigned = product.createDevelopmentSnapshot([
  cluster('b', [article('one', 'Local A', 'es')])
], [], '2026-08-12T12:15:00Z');
assert.equal(product.snapshotDiff(deleted, reassigned).clusterReassignments.length, 1, 'changed cluster assignment must be reported');
const transition = product.snapshotDiff(deleted, reassigned);
assert.equal(transition.changes.filter(change => change.removedCluster).length, 1, 'fully disappeared cluster must be explicit');
assert.equal(new Set(transition.clusterReassignments.map(item => `${item.itemId}:${item.fromClusterId}:${item.toClusterId}`)).size,
  transition.clusterReassignments.length, 'split/merge transitions must not be duplicated');

const noEvidence = product.normalizeClaim({ id: 'x', text: 'Repeated statement', status: 'confirmed' });
assert.equal(noEvidence, null, 'repetition without evidence must never become confirmed automatically');
assert.equal(first.clusters[0].grouping.contentConfirmation, 'explicit-claims-present');
assert.equal(first.clusters[0].grouping.confidence, 0.81, 'grouping confidence must remain separate from content confirmation');

const overlooked = product.overlookedClusters([
  cluster('local', [article('l1', 'Local A', 'es'), article('l2', 'Movement B', 'de')]),
  cluster('english-local', [article('e1', 'Community A', 'en', { sourceType: 'local' }), article('e2', 'Movement English', 'en', { sourceType: 'movement' })]),
  cluster('broad', [article('b1', 'Local C', 'es'), article('b2', 'International A', 'en'), article('b3', 'International B', 'en')]),
  cluster('thin', [article('t1', 'Only one local source', 'es')])
], item => ({ sourceType: item.sourceType }));
assert.equal(overlooked.length, 2, 'only sufficiently covered clusters scarcely represented elsewhere qualify');
assert(overlooked.some(item => item.clusterId === 'english-local'), 'explicit English local/movement sources must remain eligible');
assert.equal(overlooked[0].statement, 'In den von WRN beobachteten internationalen Quellen bisher kaum behandelt.');
assert.equal(overlooked[0].scope, 'observed-wrn-sources-only');
assert.equal(product.overlookedClusters([]).length, 0, 'empty data must produce an honest empty state');

const incompleteDossier = product.dossierInputChecklist(cluster('input', [article('input-1', 'Local A', 'es')]), []);
assert.equal(incompleteDossier.complete, false);
assert(incompleteDossier.missing.includes('claims[].id'));
assert(incompleteDossier.missing.includes('reportProvenance'));
assert(incompleteDossier.missing.includes('evidenceMedia[].type+url+title'));
assert(incompleteDossier.missing.includes('actions[].originalSource'));

const completeDossier = product.dossierInputChecklist(cluster('a', [article('complete', 'Local A', 'es', {
  reportProvenance: 'primary',
  evidenceMedia: [{ type: 'document', url: 'https://example.org/document', title: 'Document' }],
  claims: [{ id: 'claim-complete', text: 'Documented statement', status: 'confirmed', evidenceUrl: 'https://example.org/evidence', occurredAt: '2026-08-12T08:00:00Z' }]
})]), [completeAction]);
assert.equal(completeDossier.complete, true, `complete structured dossier was rejected: ${completeDossier.missing.join(', ')}`);

const editionNow = Date.parse('2026-08-12T12:00:00Z');
const editionCandidates = Array.from({ length: 12 }, (_, index) => ({
  id: `edition-${index}`,
  title: `Story ${index}`,
  publishedAt: new Date(editionNow - index * 6 * 3600_000).toISOString()
}));
assert.equal(product.selectDailyEdition(editionCandidates, { type: 'morning', count: 10 }, editionNow).length, 4,
  'morning edition must enforce its 18-hour time window');
assert.equal(product.selectDailyEdition(editionCandidates, { type: 'daily', count: 7 }, editionNow).length, 7,
  'daily edition must honor the selected 7-item count');
assert.equal(product.selectDailyEdition(editionCandidates, { type: 'weekly', count: 10 }, editionNow).length, 10,
  'weekly edition must honor the selected 10-item count');
assert.deepEqual(product.restoreEditionArticles(['current', 'offline'], [{ id:'current', title:'Current' }], [{ id:'offline', title:'Offline' }]).map(item => item.id), ['current','offline'],
  'history restoration must merge current and offline article data in saved order');
assert.deepEqual(product.speechQueue([{ title:'One' }, { title:'Two' }, { title:'Three' }], 1).map(item => item.index), [1,2],
  'speech queue must resume at an exact article boundary');

console.log('WRN planned 2.1 product contracts A/C/E: OK');
