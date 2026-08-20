/* World Revolution News – pure product contracts for the planned 2.1 release */
'use strict';

((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WRNProduct21 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const CLAIM_STATES = new Set(['confirmed', 'contradicted', 'unresolved', 'corrected', 'retracted']);
  const OVERLOOKED_STATEMENT = 'In den von WRN beobachteten internationalen Quellen bisher kaum behandelt.';
  const ACTION_INPUT_FIELDS = Object.freeze([
    'id', 'title', 'details', 'actionType', 'organizer', 'originalSource', 'locationOrReach',
    'startsAt|deadline', 'lastCheckedAt', 'nextCheckAt', 'expiresAt', 'verificationStatus',
    'dossierId', 'safetyNotes[]'
  ]);
  const CLAIM_INPUT_FIELDS = Object.freeze([
    'claims[].id', 'claims[].text', 'claims[].status', 'claims[].evidenceUrl',
    'claims[].occurredAt', 'reportProvenance'
  ]);

  function text(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function safeHttpUrl(value) {
    try {
      const url = new URL(text(value));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function dateMs(value) {
    const parsed = Date.parse(text(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function articleKey(item) {
    return text(item?.id || item?.link || `${item?.quelleName || item?.source || ''}::${item?.title || ''}::${item?.pubDate || ''}`);
  }

  function sourceName(item) {
    return text(item?.quelleName || item?.sourceName || item?.source || item?.author);
  }

  function normalizeClaim(claim, fallbackId = '') {
    const status = text(claim?.status).toLowerCase();
    const value = text(claim?.text || claim?.statement || claim?.claim);
    const evidenceUrl = safeHttpUrl(claim?.evidenceUrl || claim?.sourceUrl || claim?.url);
    if (!value || !CLAIM_STATES.has(status)) return null;
    // A confirmed claim requires an explicit status and traceable evidence.
    // Repetition across sources is never interpreted as truth.
    if (status === 'confirmed' && !evidenceUrl) return null;
    return {
      id: text(claim?.id || fallbackId || `${status}:${value}`),
      text: value,
      status,
      evidenceUrl,
      occurredAt: text(claim?.occurredAt || claim?.updatedAt || claim?.publishedAt),
      editorialStatus: text(claim?.editorialStatus) === 'reviewed' ? 'reviewed' : 'automatic'
    };
  }

  function claimsFromItem(item) {
    const claims = (Array.isArray(item?.claims) ? item.claims : [])
      .map((claim, index) => normalizeClaim(claim, `${articleKey(item)}:claim:${index}`))
      .filter(Boolean);
    const correction = text(item?.correctionNote || item?.correction);
    if (correction) {
      claims.push({
        id: `${articleKey(item)}:correction`, text: correction,
        status: text(item?.status).toLowerCase().includes('retract') ? 'retracted' : 'corrected',
        evidenceUrl: safeHttpUrl(item?.link),
        occurredAt: text(item?.updatedAt || item?.modifiedAt || item?.pubDate),
        editorialStatus: 'automatic'
      });
    }
    return claims;
  }

  function mediaFromItem(item) {
    const candidates = [
      ...(Array.isArray(item?.evidenceMedia) ? item.evidenceMedia : []),
      item?.videoUrl ? { type: 'video', url: item.videoUrl, title: item.title } : null,
      item?.documentUrl ? { type: 'document', url: item.documentUrl, title: item.title } : null,
      item?.eyewitnessUrl ? { type: 'eyewitness', url: item.eyewitnessUrl, title: item.title } : null
    ].filter(Boolean);
    const seen = new Set();
    return candidates.map((entry, index) => {
      const url = safeHttpUrl(entry?.url || entry?.originalUrl);
      if (!url || seen.has(url)) return null;
      seen.add(url);
      const type = text(entry?.type);
      return {
        id: text(entry?.id || `${articleKey(item)}:media:${type || 'document'}:${url}`),
        type: ['video', 'document', 'eyewitness', 'audio'].includes(type) ? type : 'document',
        title: text(entry?.title || item?.title), url,
        publishedAt: text(entry?.publishedAt || item?.pubDate)
      };
    }).filter(Boolean);
  }

  function normalizeSolidarityAction(action) {
    const normalized = {
      id: text(action?.id), actionType: text(action?.actionType), organizer: text(action?.organizer),
      originalSource: safeHttpUrl(action?.originalSource), locationOrReach: text(action?.locationOrReach),
      startsAt: text(action?.startsAt), deadline: text(action?.deadline),
      lastCheckedAt: text(action?.lastCheckedAt), nextCheckAt: text(action?.nextCheckAt), expiresAt: text(action?.expiresAt),
      verificationStatus: text(action?.verificationStatus).toLowerCase(), dossierId: text(action?.dossierId),
      safetyNotes: Array.isArray(action?.safetyNotes) ? action.safetyNotes.map(text).filter(Boolean) : [text(action?.safetyNotes)].filter(Boolean),
      title: text(action?.title), details: text(action?.details)
    };
    const required = [normalized.id, normalized.title, normalized.details, normalized.actionType, normalized.organizer, normalized.originalSource,
      normalized.locationOrReach, normalized.lastCheckedAt, normalized.nextCheckAt, normalized.expiresAt, normalized.dossierId];
    normalized.schemaComplete = required.every(Boolean)
      && Boolean(dateMs(normalized.lastCheckedAt) && dateMs(normalized.nextCheckAt) && dateMs(normalized.expiresAt))
      && Boolean(dateMs(normalized.startsAt) || dateMs(normalized.deadline))
      && normalized.safetyNotes.length > 0;
    return normalized;
  }

  function activeVerifiedActions(actions, now = Date.now()) {
    return (Array.isArray(actions) ? actions : [])
      .map(action => solidarityActionAssessment(action, now))
      .filter(result => result.eligible)
      .map(result => result.action);
  }

  function solidarityActionAssessment(action, now = Date.now()) {
    const normalized = normalizeSolidarityAction(action);
    const missing = [];
    const simpleRequired = ['id', 'title', 'details', 'actionType', 'organizer', 'originalSource', 'locationOrReach',
      'lastCheckedAt', 'nextCheckAt', 'expiresAt', 'verificationStatus', 'dossierId'];
    simpleRequired.forEach(field => { if (!normalized[field]) missing.push(field); });
    if (!normalized.startsAt && !normalized.deadline) missing.push('startsAt|deadline');
    if (!normalized.safetyNotes.length) missing.push('safetyNotes[]');
    const invalidDates = ['lastCheckedAt', 'nextCheckAt', 'expiresAt']
      .filter(field => normalized[field] && !dateMs(normalized[field]));
    if (normalized.startsAt && !dateMs(normalized.startsAt)) invalidDates.push('startsAt');
    if (normalized.deadline && !dateMs(normalized.deadline)) invalidDates.push('deadline');
    const reasons = [];
    if (missing.length) reasons.push('missing-fields');
    if (invalidDates.length) reasons.push('invalid-dates');
    if (normalized.verificationStatus && normalized.verificationStatus !== 'verified') reasons.push('not-verified');
    if (dateMs(normalized.lastCheckedAt) && dateMs(normalized.lastCheckedAt) > now) reasons.push('last-check-in-future');
    if (dateMs(normalized.nextCheckAt) && dateMs(normalized.nextCheckAt) < now) reasons.push('verification-stale');
    if (dateMs(normalized.expiresAt) && dateMs(normalized.expiresAt) <= now) reasons.push('expired');
    if (dateMs(normalized.deadline) && dateMs(normalized.deadline) < now) reasons.push('deadline-passed');
    if (dateMs(normalized.startsAt) && dateMs(normalized.expiresAt) && dateMs(normalized.startsAt) > dateMs(normalized.expiresAt)) reasons.push('invalid-period');
    return { action: normalized, eligible: reasons.length === 0, missing, invalidDates, reasons };
  }

  function clusterSnapshot(cluster, verifiedActions = []) {
    const items = Array.isArray(cluster?.items) ? cluster.items : [];
    const claims = items.flatMap(claimsFromItem);
    const dossierId = text(cluster?.id);
    return {
      id: dossierId, title: text(cluster?.title),
      itemIds: [...new Set(items.map(articleKey).filter(Boolean))].sort(),
      sources: [...new Set(items.map(sourceName).filter(Boolean))].sort(),
      claims, media: items.flatMap(mediaFromItem),
      verifiedActionIds: verifiedActions.filter(action => action.dossierId === dossierId).map(action => action.id).sort(),
      grouping: {
        confidence: Number(cluster?.matchConfidence || 0),
        evidence: Array.isArray(cluster?.matchReasons) ? cluster.matchReasons.map(text).filter(Boolean) : [],
        contentConfirmation: claims.some(claim => claim.status === 'confirmed') ? 'explicit-claims-present' : 'not-assessed'
      }
    };
  }

  function createDevelopmentSnapshot(clusters, actions = [], createdAt = new Date().toISOString()) {
    const verifiedActions = activeVerifiedActions(actions, dateMs(createdAt) || Date.now());
    return { schemaVersion: 1, createdAt: text(createdAt), clusters: (Array.isArray(clusters) ? clusters : []).map(cluster => clusterSnapshot(cluster, verifiedActions)) };
  }

  function normalizeSnapshotHistory(value) {
    if (value?.schemaVersion === 2 && Array.isArray(value.snapshots)) {
      return { schemaVersion: 2, snapshots: value.snapshots.filter(snapshot => snapshot?.schemaVersion === 1 && snapshot?.createdAt) };
    }
    if (value?.schemaVersion === 1 && value?.createdAt) return { schemaVersion: 2, snapshots: [value] };
    return { schemaVersion: 2, snapshots: [] };
  }

  function appendSnapshotHistory(value, snapshot, maximum = 7) {
    const history = normalizeSnapshotHistory(value);
    if (!snapshot?.createdAt) return history;
    const limit = Math.max(2, Math.min(30, Number(maximum) || 7));
    const snapshots = [...history.snapshots.filter(item => item.createdAt !== snapshot.createdAt), snapshot]
      .sort((first, second) => dateMs(first.createdAt) - dateMs(second.createdAt))
      .slice(-limit);
    return { schemaVersion: 2, snapshots };
  }

  function previousSnapshot(value) {
    const history = normalizeSnapshotHistory(value);
    return history.snapshots.at(-1) || null;
  }

  function snapshotDiff(previous, current) {
    const before = Array.isArray(previous?.clusters) ? previous.clusters : [];
    const after = Array.isArray(current?.clusters) ? current.clusters : [];
    const beforeById = new Map(before.map(cluster => [cluster.id, cluster]));
    const beforeItemCluster = new Map(before.flatMap(cluster => (cluster.itemIds || []).map(id => [id, cluster.id])));
    const changes = [];
    const clusterReassignments = [];
    const seenReassignments = new Set();
    for (const cluster of after) {
      const old = beforeById.get(cluster.id);
      const oldClaims = new Map((old?.claims || []).map(claim => [claim.id, claim]));
      const newClaimIds = new Set((cluster.claims || []).map(claim => claim.id));
      const oldSources = new Set(old?.sources || []);
      const oldMedia = new Set((old?.media || []).map(item => item.id));
      const oldActions = new Set(old?.verifiedActionIds || []);
      const reassigned = (cluster.itemIds || []).flatMap(itemId => {
        const fromClusterId = beforeItemCluster.get(itemId);
        if (!fromClusterId || fromClusterId === cluster.id) return [];
        const value = { itemId, fromClusterId, toClusterId: cluster.id };
        const key = `${itemId}\u0000${fromClusterId}\u0000${cluster.id}`;
        if (!seenReassignments.has(key)) {
          seenReassignments.add(key);
          clusterReassignments.push(value);
        }
        return [value];
      });
      const change = {
        clusterId: cluster.id, title: cluster.title, isNewCluster: !old,
        newConfirmedInformation: (cluster.claims || []).filter(claim => {
          if (claim.status !== 'confirmed') return false;
          const oldClaim = oldClaims.get(claim.id);
          return !oldClaim || oldClaim.text !== claim.text || oldClaim.evidenceUrl !== claim.evidenceUrl;
        }),
        correctedOrRetracted: (cluster.claims || []).filter(claim => {
          const oldClaim = oldClaims.get(claim.id);
          return ['corrected', 'retracted'].includes(claim.status) && (!oldClaim || oldClaim.status !== claim.status || oldClaim.text !== claim.text);
        }),
        deletedClaims: (old?.claims || []).filter(claim => !newClaimIds.has(claim.id)),
        newSources: (cluster.sources || []).filter(source => !oldSources.has(source)),
        newMedia: (cluster.media || []).filter(item => !oldMedia.has(item.id)),
        newVerifiedActions: (cluster.verifiedActionIds || []).filter(id => !oldActions.has(id)),
        clusterReassignments: reassigned
      };
      change.total = change.newConfirmedInformation.length + change.correctedOrRetracted.length + change.deletedClaims.length
        + change.newSources.length + change.newMedia.length + change.newVerifiedActions.length + reassigned.length;
      if (change.total || change.isNewCluster) changes.push(change);
    }
    const afterIds = new Set(after.map(cluster => cluster.id));
    for (const cluster of before) {
      if (afterIds.has(cluster.id)) continue;
      const survivingItems = (cluster.itemIds || []).filter(itemId => after.some(candidate => (candidate.itemIds || []).includes(itemId)));
      changes.push({
        clusterId: cluster.id, title: cluster.title, isNewCluster: false, removedCluster: true,
        newConfirmedInformation: [], correctedOrRetracted: [], deletedClaims: cluster.claims || [],
        newSources: [], newMedia: [], newVerifiedActions: [], clusterReassignments: [],
        removedItemIds: (cluster.itemIds || []).filter(itemId => !survivingItems.includes(itemId)),
        total: (cluster.claims || []).length + (cluster.itemIds || []).length
      });
    }
    return { firstVisit: !previous?.createdAt, changes, clusterReassignments, total: changes.reduce((sum, change) => sum + change.total, 0) };
  }

  function overlookedClusters(clusters, metadataResolver, options = {}) {
    const maximum = Number.isFinite(options.maximumInternationalSources) ? options.maximumInternationalSources : 1;
    const minimumFocusSources = Number.isFinite(options.minimumFocusSources) ? Math.max(1, options.minimumFocusSources) : 2;
    const resolve = typeof metadataResolver === 'function' ? metadataResolver : item => item || {};
    return (Array.isArray(clusters) ? clusters : []).flatMap(cluster => {
      const rows = (cluster?.items || []).map(item => {
        const metadata = resolve(item) || {};
        const language = text(item?.originalLanguage || item?.language || metadata.language || metadata.languages?.[0]).toLowerCase().split(/[-_]/)[0];
        const sourceType = text(metadata.sourceType || item?.sourceType).toLowerCase();
        const originScope = text(metadata.originScope || item?.originScope).toLowerCase();
        const hasExplicitSourceContext = /local|movement|community/.test(sourceType) || originScope === 'local';
        const hasExplicitLanguage = Boolean(language && language !== 'und' && language !== 'unknown');
        return { item, focus: hasExplicitSourceContext || (hasExplicitLanguage && language !== 'en') };
      });
      const focusSources = new Set(rows.filter(row => row.focus).map(row => sourceName(row.item)).filter(Boolean));
      const internationalSources = new Set(rows.filter(row => !row.focus).map(row => sourceName(row.item)).filter(Boolean));
      if (focusSources.size < minimumFocusSources || internationalSources.size > maximum) return [];
      return [{ clusterId: text(cluster?.id), title: text(cluster?.title), focusSources: [...focusSources],
        internationalSourceCount: internationalSources.size, statement: OVERLOOKED_STATEMENT, scope: 'observed-wrn-sources-only' }];
    });
  }

  function dossierInputChecklist(cluster, actions = []) {
    const items = Array.isArray(cluster?.items) ? cluster.items : [];
    const snapshot = clusterSnapshot(cluster, activeVerifiedActions(actions));
    const missing = [];
    if (!text(cluster?.id)) missing.push('dossier.id');
    if (!text(cluster?.title)) missing.push('dossier.title');
    if (!items.length) missing.push('items[]');
    if (!items.some(item => sourceName(item) && safeHttpUrl(item?.link) && dateMs(item?.pubDate || item?.publishedAt))) {
      missing.push('items[].source+link+publishedAt');
    }
    if (!snapshot.claims.length) missing.push(...CLAIM_INPUT_FIELDS);
    if (!items.some(item => text(item?.reportProvenance || item?.provenanceType))) missing.push('reportProvenance');
    if (!snapshot.media.length) missing.push('evidenceMedia[].type+url+title');
    if (!snapshot.verifiedActionIds.length) missing.push(...ACTION_INPUT_FIELDS.map(field => `actions[].${field}`));
    return { complete: missing.length === 0, missing: [...new Set(missing)], snapshot };
  }

  function selectDailyEdition(items, config = {}, now = Date.now()) {
    const type = ['morning', 'daily', 'weekly'].includes(config.type) ? config.type : 'daily';
    const count = [5, 7, 10].includes(Number(config.count)) ? Number(config.count) : 5;
    const maximumAgeHours = { morning: 18, daily: 36, weekly: 168 }[type];
    const cutoff = now - maximumAgeHours * 3600_000;
    return (Array.isArray(items) ? items : []).filter(item => {
      const timestamp = dateMs(item?.pubDate || item?.publishedAt || item?.date);
      return timestamp >= cutoff && timestamp <= now;
    }).slice(0, count);
  }

  function restoreEditionArticles(articleIds, currentArticles, offlineArticles) {
    const current = new Map((Array.isArray(currentArticles) ? currentArticles : []).map(item => [text(item?.id), item]));
    const offline = new Map((Array.isArray(offlineArticles) ? offlineArticles : []).map(item => [text(item?.id), item]));
    return (Array.isArray(articleIds) ? articleIds : []).map(id => current.get(text(id)) || offline.get(text(id))).filter(Boolean);
  }

  function dailyEditionDescriptor(input = {}) {
    const articleIds = (Array.isArray(input.articleIds) ? input.articleIds : [])
      .map(text).filter(Boolean).slice(0, 30);
    const language = text(input.language || 'de').toLowerCase();
    const editionType = ['morning', 'daily', 'weekly'].includes(input.editionType) ? input.editionType : 'daily';
    const itemCount = [5, 7, 10].includes(Number(input.itemCount)) ? Number(input.itemCount) : Math.max(1, articleIds.length);
    const signature = JSON.stringify([language, editionType, itemCount, articleIds]);
    let hash = 2166136261;
    for (let index = 0; index < signature.length; index += 1) {
      hash ^= signature.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const editionId = `edition-${(hash >>> 0).toString(36)}`;
    return { editionId, datasetKey: `wrn-daily-edition-offline-v2-${editionId}`, language, editionType, itemCount, articleIds };
  }

  function dailyEditionDatasetAssessment(dataset, expected) {
    const descriptor = dailyEditionDescriptor(expected || dataset || {});
    const reasons = [];
    if (!dataset || dataset.schemaVersion !== 2) reasons.push('invalid-schema');
    if (text(dataset?.editionId) !== descriptor.editionId) reasons.push('wrong-edition');
    if (text(dataset?.language).toLowerCase() !== descriptor.language
      || text(dataset?.editionType) !== descriptor.editionType
      || Number(dataset?.itemCount) !== descriptor.itemCount) reasons.push('wrong-configuration');
    const storedIds = (Array.isArray(dataset?.articleIds) ? dataset.articleIds : []).map(text).filter(Boolean);
    if (JSON.stringify(storedIds) !== JSON.stringify(descriptor.articleIds)) reasons.push('wrong-article-order');
    const storedArticleIds = new Set((Array.isArray(dataset?.articles) ? dataset.articles : []).map(articleKey).filter(Boolean));
    if (descriptor.articleIds.some(id => !storedArticleIds.has(id))) reasons.push('missing-offline-article');
    if (!dateMs(dataset?.savedAt)) reasons.push('invalid-saved-at');
    return { eligible: reasons.length === 0, reasons, descriptor, dataset };
  }

  async function storeDailyEdition(storage, input, articles, now = Date.now()) {
    const descriptor = dailyEditionDescriptor(input);
    const articleById = new Map((Array.isArray(articles) ? articles : []).map(article => [articleKey(article), article]));
    const orderedArticles = descriptor.articleIds.map(id => articleById.get(id)).filter(Boolean);
    const dataset = {
      schemaVersion: 2,
      editionId: descriptor.editionId,
      language: descriptor.language,
      editionType: descriptor.editionType,
      itemCount: descriptor.itemCount,
      savedAt: new Date(now).toISOString(),
      articleIds: [...descriptor.articleIds],
      articles: orderedArticles,
      articlesStored: true,
      audioStored: false,
      audioMode: 'device-speech'
    };
    if (!storage?.putDataset || !storage?.getDataset) return { ok: false, reason: 'storage-unavailable', descriptor };
    try {
      if (await storage.putDataset(descriptor.datasetKey, dataset) !== true) return { ok: false, reason: 'write-failed', descriptor };
      const persisted = await storage.getDataset(descriptor.datasetKey);
      const assessment = dailyEditionDatasetAssessment(persisted, descriptor);
      return assessment.eligible
        ? { ok: true, descriptor, dataset: persisted }
        : { ok: false, reason: 'readback-invalid', assessment, descriptor };
    } catch (error) {
      return { ok: false, reason: 'storage-error', error, descriptor };
    }
  }

  async function loadDailyEdition(storage, input) {
    const descriptor = dailyEditionDescriptor(input);
    if (!storage?.getDataset) return { ok: false, reason: 'storage-unavailable', descriptor };
    try {
      const dataset = await storage.getDataset(descriptor.datasetKey);
      const assessment = dailyEditionDatasetAssessment(dataset, descriptor);
      return assessment.eligible
        ? { ok: true, descriptor, dataset }
        : { ok: false, reason: 'dataset-invalid', assessment, descriptor };
    } catch (error) {
      return { ok: false, reason: 'storage-error', error, descriptor };
    }
  }

  function speechQueue(items, startIndex = 0, formatter = item => text(item?.title)) {
    const source = Array.isArray(items) ? items : [];
    const start = Math.max(0, Math.min(source.length, Number(startIndex) || 0));
    return source.slice(start).map((item, offset) => ({ index: start + offset, text: `${start + offset + 1}. ${formatter(item)}` }));
  }

  return Object.freeze({ OVERLOOKED_STATEMENT, ACTION_INPUT_FIELDS, CLAIM_INPUT_FIELDS, safeHttpUrl,
    normalizeClaim, normalizeSolidarityAction, solidarityActionAssessment, activeVerifiedActions,
    createDevelopmentSnapshot, normalizeSnapshotHistory, appendSnapshotHistory, previousSnapshot,
    snapshotDiff, overlookedClusters, dossierInputChecklist, selectDailyEdition,
    restoreEditionArticles, dailyEditionDescriptor, dailyEditionDatasetAssessment,
    storeDailyEdition, loadDailyEdition, speechQueue });
});
