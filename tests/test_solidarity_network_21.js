'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const network = require('../solidarity-network-21.js');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'solidarity-network.json'), 'utf8'));
const resources = JSON.parse(fs.readFileSync(path.join(root, 'solidarity-resources.json'), 'utf8'));
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const now = Date.parse('2026-08-16T12:00:00Z');

(async () => {
assert.equal(data.profiles.length, 10);
assert.deepEqual(new Set(data.profiles.map(item => item.id)), new Set([
  'rote-hilfe-ev', 'augenauf-ch', 'humanrights-ch', 'pro-asyl',
  'queer-base-vienna', 'transinterqueer', 'alarm-phone',
  'opferhilfe-schweiz-142', 'dargebotene-hand-143', 'pro-juventute-147'
]));
data.profiles.forEach(profile => {
  assert.equal(network.profileAssessment(profile, now).eligible, true, `${profile.id} failed schema/verification assessment`);
  assert(profile.verificationSources.every(url => url.startsWith('https://')), `${profile.id} has a non-official verification shape`);
  assert.deepEqual(new Set(Object.keys(profile.fieldEvidence)), new Set(network.REQUIRED_EVIDENCE_FIELDS), `${profile.id} is not fieldwise evidenced`);
});

const declaredDomains = {
  'rote-hilfe-ev': ['rote-hilfe.de'], 'augenauf-ch': ['augenauf.ch'],
  'humanrights-ch': ['www.humanrights.ch', 'humanrights.ch'], 'pro-asyl': ['www.proasyl.de', 'proasyl.de'],
  'queer-base-vienna': ['friends.queerbase.at', 'queerbase.at'],
  transinterqueer: ['www.transinterqueer.org', 'transinterqueer.org'],
  'alarm-phone': ['alarmphone.org'],
  'opferhilfe-schweiz-142': ['www.opferhilfe-schweiz.ch', 'opferhilfe-schweiz.ch'],
  'dargebotene-hand-143': ['www.143.ch', '143.ch'],
  'pro-juventute-147': ['www.147.ch', '147.ch']
};
data.profiles.forEach(profile => assert.deepEqual(profile.officialDomains, declaredDomains[profile.id], `${profile.id} official domains changed without review`));

const stale = { ...data.profiles[0], nextCheck: '2026-08-15' };
assert(network.profileAssessment(stale, now).reasons.includes('verification-stale'));
const falseEmergency = { ...data.profiles[0], emergency: true, emergencyEvidence: [] };
assert(network.profileAssessment(falseEmergency, now).reasons.includes('unproven-emergency-label'));
const futureCheck = { ...data.profiles[0], lastChecked: '2026-08-17' };
assert(network.profileAssessment(futureCheck, now).reasons.includes('last-check-in-future'));
const reversedInterval = { ...data.profiles[0], nextCheck: '2026-08-11' };
assert(network.profileAssessment(reversedInterval, now).reasons.includes('invalid-review-interval'));
const excessiveInterval = { ...data.profiles[0], nextCheck: '2027-08-12' };
assert(network.profileAssessment(excessiveInterval, now).reasons.includes('invalid-review-interval'));
for (const impossible of ['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01', '2026-00-10']) {
  const invalidCalendarDate = { ...data.profiles[0], lastChecked: impossible };
  assert(network.profileAssessment(invalidCalendarDate, now).reasons.includes('invalid-dates'), `${impossible} must be rejected`);
}
const leapYear = { ...data.profiles[0], lastChecked: '2028-02-29', nextCheck: '2028-05-29' };
assert.equal(network.profileAssessment(leapYear, Date.parse('2028-03-01T12:00:00Z')).eligible, true, 'valid leap day must pass');
const monthBoundary = { ...data.profiles[0], lastChecked: '2026-08-31', nextCheck: '2026-09-30' };
assert.equal(network.profileAssessment(monthBoundary, Date.parse('2026-09-01T12:00:00Z')).eligible, true, 'valid month boundary must pass');
const unsafeWebsite = { ...data.profiles[0], officialWebsite: 'javascript:alert(1)' };
assert(network.profileAssessment(unsafeWebsite, now).reasons.includes('unsafe-or-undeclared-official-url'));
const undeclaredEvidence = { ...data.profiles[0], verificationSources: ['https://lookalike.example/claim'] };
assert(network.profileAssessment(undeclaredEvidence, now).reasons.includes('unsafe-or-undeclared-official-url'));
const unsafeContact = { ...data.profiles[0], officialContact: 'mailto:contact@lookalike.example' };
assert(network.profileAssessment(unsafeContact, now).reasons.includes('unsafe-or-undeclared-official-url'));
assert.deepEqual(data.profiles.filter(item => item.emergency).map(item => item.id), ['alarm-phone', 'dargebotene-hand-143', 'pro-juventute-147']);
const victimSupport = data.profiles.find(profile => profile.id === 'opferhilfe-schweiz-142');
assert.equal(victimSupport.officialContact, 'tel:142');
assert.equal(victimSupport.emergency, false, 'official 142 profile must explicitly remain non-emergency');
assert(victimSupport.notResponsibleFor.some(value => value.includes('kein Notruf')));
assert.equal(network.validOfficialContact('tel:142', victimSupport.officialDomains), true);

const triq = data.profiles.find(profile => profile.id === 'transinterqueer');
for (const officialLimit of [
  'akute Krisenberatung', 'Unterstützung bei Rechtsprozessen', 'Unterstützung bei Krankenkassen-Widersprüchen',
  'Antidiskriminierungsberatung', 'Unterstützung bei der Jobsuche', 'Unterstützung bei der Wohnungssuche',
  'Tipps oder Unterstützung bei Forschungsvorhaben, Semester- oder Abschlussarbeiten'
]) assert(triq.notResponsibleFor.includes(officialLimit), `TrIQ limit missing: ${officialLimit}`);
assert(triq.confirmedCounsellingLanguages.includes('hr'), 'TrIQ officially offers Croatian peer counselling');

const humanrights = data.profiles.find(profile => profile.id === 'humanrights-ch');
assert.deepEqual(humanrights.confirmedCounsellingLanguages, ['de', 'en']);
assert.equal(humanrights.officialContact, 'mailto:freiheitsentzug@humanrights.ch');
assert.equal(humanrights.officialWebsite, 'https://www.humanrights.ch/de/beratungsstelle-freiheitsentzug/beratung/');
assert.deepEqual(humanrights.helpTopics, ['prisoner-support'], 'direct detention counselling must not be mixed with the general address database');
assert(humanrights.canHelpWith.some(value => value.includes('Haftbedingungen')));

const queerBase = data.profiles.find(profile => profile.id === 'queer-base-vienna');
assert.deepEqual(queerBase.confirmedCounsellingLanguages, []);
assert.deepEqual(queerBase.informationLanguages, ['en', 'de', 'fa', 'fr', 'tr', 'ku', 'ru', 'uk', 'ar']);
assert(queerBase.requirements.some(value => value.includes('Dolmetschverfügbarkeit')),
  'multilingual service evidence must not promise unconfirmed direct counselling availability');

assert(network.filterProfiles(data.profiles, { region: 'DE', language: 'de', topic: 'flight-asylum' }, now).some(item => item.id === 'pro-asyl'));
assert.deepEqual(network.filterProfiles(data.profiles, { region: 'DE-BE', topic: 'queer-trans-inter' }, now).map(item => item.id), ['transinterqueer']);
assert.equal(network.filterProfiles(data.profiles, { language: 'zz' }, now).length, 0);
assert.equal(network.filterProfiles(data.profiles, { language: 'uk' }, now).length, 0,
  'information languages must never act as counselling-language filters');
assert.deepEqual(network.filterProfiles(data.profiles, { query: 'jugendliche' }, now).map(item => item.id), ['pro-juventute-147']);
assert.deepEqual(network.filterProfiles(data.profiles, { region: 'CH', topic: 'mental-health' }, now).map(item => item.id),
  ['dargebotene-hand-143', 'pro-juventute-147']);
assert(network.filterProfiles(data.profiles, { region: 'CH-ZH' }, now).some(item => item.id === 'opferhilfe-schweiz-142'),
  'a nationwide CH profile must match a cantonal CH-ZH selection');
assert.deepEqual(network.filterProfiles(data.profiles, { location: 'Liechtenstein' }, now).map(item => item.id),
  ['dargebotene-hand-143']);

const keywordOnly = network.contextualProfiles(data.profiles, [], now);
assert.equal(keywordOnly.length, 0, 'profile matching must never infer topics from article keywords');
assert(network.contextualProfiles(data.profiles, ['police-violence'], now).some(item => item.id === 'augenauf-ch'));

assert.equal(network.validOfficialContact('mailto:%E0%A4%A@humanrights.ch', ['humanrights.ch']), false);
assert.equal(network.validOfficialContact('tel:%E0%A4%A', ['alarmphone.org']), false);

const regional = network.regionalOfflinePackage(data, 'CH-ZH', now);
assert.deepEqual(regional.profileIds, ['augenauf-ch', 'humanrights-ch', 'opferhilfe-schweiz-142', 'dargebotene-hand-143', 'pro-juventute-147']);
assert.equal('profiles' in regional, false, 'regional packages must never embed profile authority');
const sealedRegional = await network.addCorruptionChecksum(regional);
assert.equal((await network.regionalPackageAssessment(sealedRegional, data, now, network.regionalDatasetKey('CH-ZH'))).eligible, true);

const records = new Map();
const storage = {
  async putDataset(key, value) { records.set(key, structuredClone(value)); return true; },
  async getDataset(key) { return records.has(key) ? structuredClone(records.get(key)) : null; },
  async getAllDatasetRecords() { return [...records].map(([key, value]) => ({ key, data: structuredClone(value) })); }
};
assert.equal((await network.storeCanonicalRegistry(storage, data, now)).ok, true);
assert.equal((await network.storeRegionalOfflinePackage(storage, regional, now)).ok, true);
const datasetKey = network.regionalDatasetKey('CH-ZH');
const pristine = structuredClone(records.get(datasetKey));
const nextDay = Date.parse('2026-08-17T12:00:00Z');
const resaved = await network.storeRegionalOfflinePackage(storage, { region: 'CH-ZH' }, nextDay);
assert.equal(resaved.ok, true);
assert.equal(resaved.value.sourceCheckedAt, data.updatedAt,
  'resaving on a later day must retain the canonical registry source date');
assert.equal((await network.storeRegionalOfflinePackage(storage, {
  ...regional, sourceCheckedAt: '2026-08-17T00:00:00Z'
}, nextDay)).reason, 'canonical-source-date-mismatch');
assert.equal((await network.storeRegionalOfflinePackage({
  async getDataset() { return null; }, async putDataset() { return true; }
}, { region: 'CH-ZH' }, nextDay)).reason, 'canonical-registry-unavailable');
const corruptedCanonical = structuredClone(records.get(network.CANONICAL_REGISTRY_KEY));
corruptedCanonical.sourceUpdatedAt = '2026-08-17T00:00:00Z';
const corruptedCanonicalStorage = {
  async getDataset(key) { return key === network.CANONICAL_REGISTRY_KEY ? structuredClone(corruptedCanonical) : null; },
  async putDataset() { return true; }
};
assert.equal((await network.storeRegionalOfflinePackage(corruptedCanonicalStorage, { region: 'CH-ZH' }, nextDay)).reason,
  'canonical-registry-unavailable', 'a modified canonical record without a matching checksum must be rejected');

const canonicalRecord = structuredClone(records.get(network.CANONICAL_REGISTRY_KEY));
const sourceAfterCache = await network.addCorruptionChecksum({
  ...canonicalRecord,
  cachedAt: '2026-08-16T11:59:00.000Z',
  sourceUpdatedAt: '2026-08-16T12:00:00.000Z'
});
let canonicalAssessment = await network.canonicalRegistryAssessment(sourceAfterCache, now);
assert.equal(canonicalAssessment.eligible, false, 'a freshly rehashed source date after cachedAt must be rejected');
assert(canonicalAssessment.reasons.includes('source-updated-after-cache'));
const sourceAfterCacheStorage = {
  async getDataset(key) { return key === network.CANONICAL_REGISTRY_KEY ? structuredClone(sourceAfterCache) : null; },
  async putDataset() { return true; }
};
assert.equal((await network.storeRegionalOfflinePackage(sourceAfterCacheStorage, { region: 'CH-ZH' }, now)).reason,
  'canonical-registry-unavailable');

const futureSource = await network.addCorruptionChecksum({
  ...canonicalRecord,
  cachedAt: '2026-08-16T12:02:00.000Z',
  sourceUpdatedAt: '2026-08-16T12:01:00.000Z'
});
canonicalAssessment = await network.canonicalRegistryAssessment(futureSource, now);
assert.equal(canonicalAssessment.eligible, false, 'a freshly rehashed future source date must be rejected');
assert(canonicalAssessment.reasons.includes('source-updated-in-future'));
const futureSourceStorage = {
  async getDataset(key) { return key === network.CANONICAL_REGISTRY_KEY ? structuredClone(futureSource) : null; },
  async putDataset() { return true; }
};
assert.equal((await network.storeRegionalOfflinePackage(futureSourceStorage, { region: 'CH-ZH' }, now)).reason,
  'canonical-registry-unavailable');

const changedService = await network.addCorruptionChecksum({
  ...network.regionalOfflinePackage(data, 'CH-ZH', now),
  profiles: [{ ...data.profiles[1], canHelpWith: ['manipulierte Leistungszusage'] }]
});
records.set(datasetKey, changedService);
let restored = await network.loadRegionalOfflinePackages(storage, await network.loadCanonicalRegistry(storage, now), now);
assert.equal(restored.profiles.length, 0);
assert(restored.rejected[0].reasons.includes('embedded-profile-content-forbidden'));

const changedContact = await network.addCorruptionChecksum({
  ...network.regionalOfflinePackage(data, 'CH-ZH', now),
  officialContact: 'mailto:attacker@augenauf.ch',
  canHelpWith: ['manipulierte Leistungszusage'],
  audiences: ['unbestätigte Zielgruppe']
});
records.set(datasetKey, changedContact);
restored = await network.loadRegionalOfflinePackages(storage, await network.loadCanonicalRegistry(storage, now), now);
assert.equal(restored.profiles.length, 0, 'rehashed package claims and contacts must never render');
assert(restored.rejected[0].reasons.includes('unexpected-package-fields'));

const unknownId = await network.addCorruptionChecksum({ ...regional, profileIds: ['augenauf-ch', 'attacker-added'] });
records.set(datasetKey, unknownId);
restored = await network.loadRegionalOfflinePackages(storage, await network.loadCanonicalRegistry(storage, now), now);
assert.equal(restored.profiles.length, 0);
assert(restored.rejected[0].reasons.includes('unknown-or-stale-profile-id'));

records.clear();
await network.storeCanonicalRegistry(storage, data, now);
records.set(network.regionalDatasetKey('CH-BE'), pristine);
restored = await network.loadRegionalOfflinePackages(storage, await network.loadCanonicalRegistry(storage, now), now);
assert.equal(restored.profiles.length, 0);
assert(restored.rejected[0].reasons.includes('record-key-mismatch'));

const alteredReadbackRecords = new Map();
const canonicalReadback = structuredClone(records.get(network.CANONICAL_REGISTRY_KEY));
const alteredReadbackStorage = {
  async putDataset(key, value) {
    const changed = structuredClone(value);
    changed.profileIds.push('attacker-added');
    alteredReadbackRecords.set(key, await network.addCorruptionChecksum(changed));
    return true;
  },
  async getDataset(key) {
    if (key === network.CANONICAL_REGISTRY_KEY) return structuredClone(canonicalReadback);
    return structuredClone(alteredReadbackRecords.get(key));
  }
};
assert.equal((await network.storeRegionalOfflinePackage(alteredReadbackStorage, regional, now)).reason, 'readback-identity-mismatch',
  'readback must be byte-semantically identical even if altered storage recomputes a valid digest');

assert.equal(network.regionalPayloadMode(null, false), 'restore-offline-packages');
assert.equal(network.regionalPayloadMode({ data: { profiles: [] }, responseMetadata: { syntheticSolidarityFallback: true } }, true), 'restore-offline-packages');
assert.equal(network.regionalPayloadMode({ data: { profiles: [], fallbackContext: 'service-worker-offline-empty' }, responseMetadata: { syntheticSolidarityFallback: false } }, true), 'authoritative-response',
  'a forged body marker must never trigger restoration');
assert.equal(network.regionalPayloadMode({ data: { profiles: [] }, responseMetadata: { syntheticSolidarityFallback: false } }, true), 'authoritative-response',
  'an honestly empty online response must not revive old offline profiles');
records.clear();
await network.storeCanonicalRegistry(storage, data, now);
records.set(datasetKey, pristine);
assert.deepEqual(
  (await network.resolveRegionalNetworkPayload(storage, { data: { profiles: [] }, responseMetadata: { syntheticSolidarityFallback: true } }, true, now)).profiles.map(item => item.id),
  ['augenauf-ch', 'humanrights-ch', 'opferhilfe-schweiz-142', 'dargebotene-hand-143', 'pro-juventute-147'],
  'an offline HTTP 200 empty fallback must restore the valid regional package'
);
assert.deepEqual((await network.resolveRegionalNetworkPayload(storage, { data: { profiles: [], fallbackContext: 'service-worker-offline-empty' }, responseMetadata: { syntheticSolidarityFallback: false } }, true, now)).profiles, [],
  'an honest online empty dataset must remain authoritative even when an old regional package exists');

const submission = network.localSubmissionDraft({
  kind: 'correction', verified: true, published: true,
  officialEvidenceUrls: ['https://example.org/official', 'javascript:bad'], details: 'Correction'
}, now);
assert.equal(submission.status, 'local-draft');
assert.equal(submission.verified, false);
assert.equal(submission.published, false);
assert.equal(submission.transmitted, false);
assert.equal(submission.persisted, false);
assert.deepEqual(submission.officialEvidenceUrls, ['https://example.org/official']);

assert.equal(resources.resources.length, 0, 'unverified or redistribution-uncleared offline material must remain absent');
assert(resources.editorialInputChecklist.includes('nachgewiesenes Recht zur Offline-Verbreitung'));

for (const language of ['de','en','es','fr','it','pt','ru','el','tr']) {
  assert(app.includes(`${language}:{ helpFind:`), `missing help UI copy for ${language}`);
  assert(app.includes(`HELP_TOPIC_LABELS`), 'localized topic labels missing');
}
assert(!/localStorage\.(?:setItem|getItem)\([^\n]*(?:helpFilters|help-profile|solidarity-search)/.test(app), 'sensitive help use must not be stored in browser history');
assert(app.includes("helpFilters: { query: '', region: '', location: '', language: '', topic: '' }"));
assert(app.includes('id="next-help-query"'), 'help search input must be rendered');
assert(app.includes('aria-describedby="help-search-privacy"'), 'help search must reference the local privacy notice');
assert(app.includes("'next-video-query', 'next-help-query'"), 'help search input must pass the delegated input-event allowlist');
assert(app.includes('role="status" aria-live="polite" aria-atomic="true"'), 'help result count must be announced without re-announcing the complete result list');
assert(!app.includes('<section class="help-results" aria-live="polite">'), 'the full help result list must not be an over-verbose live region');
assert(!app.includes("event.target.closest?.('.help-profile > summary')"), 'native details/summary keyboard behaviour must not be replaced');
assert(app.includes("fetchJson('solidarity-network.json', { includeResponseMetadata: true })"));
assert(app.includes("fetchJson('solidarity-resources.json')"));
assert(app.includes('await window.WRNSolidarityNetwork21.resolveRegionalNetworkPayload('));

console.log('WRN solidarity network schema, verification, filters, offline, moderation and privacy: OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
