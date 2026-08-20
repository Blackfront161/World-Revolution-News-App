'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const product = require('../wrn-product-21.js');
const network = require('../solidarity-network-21.js');

const NOW = Date.parse('2026-08-16T12:00:00Z');
const root = path.resolve(__dirname, '..');
const profiles = JSON.parse(fs.readFileSync(path.join(root, 'solidarity-network.json'), 'utf8')).profiles;
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');

assert(app.includes('await product21.loadDailyEdition(window.WRNStorage, entry)'), 'history UI must load the entry-specific dataset');
assert(app.includes('historyItemIds.length && !state.briefing.prepared'), 'prepared offline-only articles must not be replaced by the live feed');
assert(!app.includes("getDataset?.('wrn-daily-edition-offline-v1')"), 'history UI must not use the shared legacy dataset');
assert(app.includes('await network.storeRegionalOfflinePackage(window.WRNStorage, { region })'), 'regional UI must await persistence rebuilt from the canonical registry in storage');
assert(app.includes('await window.WRNSolidarityNetwork21.resolveRegionalNetworkPayload('), 'startup must resolve worker fallback against regional packages');
assert(!app.includes('pendingSolidaritySubmissions'), 'UI must not claim a durable moderation queue');

function storageSession(records, options = {}) {
  return {
    async putDataset(key, value) {
      if (options.throwOnWrite) throw new Error('simulated-write-error');
      if (options.failWrite) return false;
      records.set(key, structuredClone(value));
      return true;
    },
    async getDataset(key) {
      return records.has(key) ? structuredClone(records.get(key)) : null;
    },
    async getAllDatasetRecords() {
      return [...records.entries()].map(([key, data]) => ({ key, data: structuredClone(data) }));
    }
  };
}

(async () => {
  const records = new Map();
  const firstSession = storageSession(records);
  const firstArticles = Array.from({ length: 5 }, (_, index) => ({ id: `first-${index}`, title: `First ${index}` }));
  const secondArticles = Array.from({ length: 7 }, (_, index) => ({ id: `second-${6 - index}`, title: `Second ${6 - index}` }));
  const firstEntry = { language: 'de', editionType: 'morning', itemCount: 5, articleIds: firstArticles.map(item => item.id) };
  const secondEntry = { language: 'fr', editionType: 'daily', itemCount: 7, articleIds: secondArticles.map(item => item.id) };

  const firstWrite = await product.storeDailyEdition(firstSession, firstEntry, firstArticles, NOW);
  const secondWrite = await product.storeDailyEdition(firstSession, secondEntry, secondArticles, NOW + 1000);
  assert.equal(firstWrite.ok, true);
  assert.equal(secondWrite.ok, true);
  assert.notEqual(firstWrite.descriptor.datasetKey, secondWrite.descriptor.datasetKey, 'two editions must never overwrite each other');
  assert.equal(records.size, 2);

  // A new storage facade simulates a complete application restart with no network articles.
  const offlineRestart = storageSession(records);
  const firstReload = await product.loadDailyEdition(offlineRestart, firstEntry);
  const secondReload = await product.loadDailyEdition(offlineRestart, secondEntry);
  assert.equal(firstReload.ok, true);
  assert.equal(secondReload.ok, true);
  assert.deepEqual(product.restoreEditionArticles(firstEntry.articleIds, [], firstReload.dataset.articles).map(item => item.id), firstEntry.articleIds);
  assert.deepEqual(product.restoreEditionArticles(secondEntry.articleIds, [], secondReload.dataset.articles).map(item => item.id), secondEntry.articleIds,
    'offline-only articles must retain their saved order after restart');

  const tampered = structuredClone(secondReload.dataset);
  tampered.articleIds.reverse();
  records.set(secondWrite.descriptor.datasetKey, tampered);
  assert.equal((await product.loadDailyEdition(offlineRestart, secondEntry)).ok, false,
    'offlineReady must be false when the matching persisted dataset is not valid');

  const regionalRecords = new Map();
  const regionalSession = storageSession(regionalRecords);
  const canonicalRegistry = { schemaVersion: 2, updatedAt: '2026-08-16T00:00:00Z', profiles };
  const regionalPackage = network.regionalOfflinePackage(canonicalRegistry, 'CH-ZH', NOW);
  assert.equal((await network.storeCanonicalRegistry(regionalSession, canonicalRegistry, NOW)).ok, true);
  assert.equal((await network.storeRegionalOfflinePackage(regionalSession, regionalPackage, NOW)).ok, true);
  const restartedCanonical = await network.loadCanonicalRegistry(storageSession(regionalRecords), NOW);
  const regionalRestart = await network.loadRegionalOfflinePackages(storageSession(regionalRecords), restartedCanonical, NOW);
  assert.deepEqual(regionalRestart.profiles.map(profile => profile.id),
    ['augenauf-ch', 'humanrights-ch', 'opferhilfe-schweiz-142', 'dargebotene-hand-143', 'pro-juventute-147']);

  const staleCanonical = structuredClone(canonicalRegistry);
  staleCanonical.profiles.find(profile => profile.id === 'augenauf-ch').nextCheck = '2026-08-11';
  const staleRestart = await network.loadRegionalOfflinePackages(storageSession(regionalRecords), staleCanonical, NOW);
  assert.equal(staleRestart.profiles.some(profile => profile.id === 'augenauf-ch'), false,
    'stale profiles must be rejected during offline restoration');
  assert(staleRestart.rejected.length > 0);

  const failedWriteRecords = new Map();
  await network.storeCanonicalRegistry(storageSession(failedWriteRecords), canonicalRegistry, NOW);
  assert.equal((await network.storeRegionalOfflinePackage(storageSession(failedWriteRecords, { failWrite: true }), regionalPackage, NOW)).reason, 'write-failed');
  const thrownWriteRecords = new Map();
  await network.storeCanonicalRegistry(storageSession(thrownWriteRecords), canonicalRegistry, NOW);
  assert.equal((await network.storeRegionalOfflinePackage(storageSession(thrownWriteRecords, { throwOnWrite: true }), regionalPackage, NOW)).reason, 'storage-error');

  const speechItems = [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }];
  assert.deepEqual(product.speechQueue(speechItems, 1).map(segment => segment.index), [1, 2],
    'after aborting item 2, a restart at progress index 1 must resume at item 2');

  console.log('WRN 2.1 daily editions and solidarity regional packages survive an offline restart: OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
