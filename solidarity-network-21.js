(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WRNSolidarityNetwork21 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const HELP_TOPICS = Object.freeze([
    'antirepression', 'police-violence', 'flight-asylum', 'feminist-help',
    'queer-trans-inter', 'prisoner-support', 'housing-food-health',
    'digital-security', 'labor-struggle', 'crisis-support',
    'violence-victim-support', 'mental-health'
  ]);
  const REQUIRED_PROFILE_FIELDS = Object.freeze([
    'id', 'name', 'officialOperator', 'regions', 'confirmedCounsellingLanguages',
    'informationLanguages', 'helpTopics', 'audiences', 'canHelpWith',
    'notResponsibleFor', 'requirements', 'officialWebsite', 'officialContact',
    'verificationSources', 'lastChecked', 'nextCheck', 'reachabilityStatus',
    'emergency', 'officialDomains', 'fieldEvidence'
  ]);
  const REQUIRED_EVIDENCE_FIELDS = Object.freeze([
    'identity', 'serviceScope', 'audiencesAndRequirements', 'limits', 'contact', 'emergency'
  ]);
  const EMPTY_ARRAY_FIELDS = new Set(['confirmedCounsellingLanguages']);
  const REGION_DATASET_PREFIX = 'wrn-solidarity-region-v3-';
  const CANONICAL_REGISTRY_KEY = 'wrn-solidarity-canonical-v1';
  const SYNTHETIC_FALLBACK_HEADER = 'X-WRN-Synthetic-Offline-Fallback';
  const SYNTHETIC_FALLBACK_VALUE = 'solidarity-network-empty-v1';
  const MAX_REVIEW_INTERVAL_MS = 120 * 24 * 60 * 60 * 1000;
  const MAX_EMERGENCY_REVIEW_INTERVAL_MS = 45 * 24 * 60 * 60 * 1000;

  const text = value => String(value == null ? '' : value).trim();
  const list = value => Array.isArray(value) ? value.map(text).filter(Boolean) : [];
  const validInstant = value => Number.isFinite(Date.parse(text(value)));

  function isoDateMs(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
    if (!match) return Number.NaN;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(0);
    parsed.setUTCHours(0, 0, 0, 0);
    parsed.setUTCFullYear(year, month - 1, day);
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return Number.NaN;
    return parsed.getTime();
  }

  const validIsoDate = value => Number.isFinite(isoDateMs(value));

  function canonicalJson(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
    return `{${Object.keys(value).sort().filter(key => value[key] !== undefined)
      .map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }

  async function sha256Hex(value) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle || typeof TextEncoder === 'undefined') throw new Error('sha256-unavailable');
    const bytes = new TextEncoder().encode(canonicalJson(value));
    const digest = await subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function withoutChecksum(value) {
    if (!value || typeof value !== 'object') return value;
    const { checksum, ...payload } = value;
    return payload;
  }

  async function addCorruptionChecksum(value) {
    const payload = withoutChecksum(value);
    return {
      ...payload,
      checksum: {
        algorithm: 'SHA-256',
        purpose: 'corruption-detection-only',
        digest: await sha256Hex(payload)
      }
    };
  }

  async function checksumReasons(value) {
    if (value?.checksum?.algorithm !== 'SHA-256'
      || value?.checksum?.purpose !== 'corruption-detection-only'
      || !/^[a-f0-9]{64}$/.test(text(value?.checksum?.digest))) return ['missing-or-invalid-corruption-checksum'];
    try {
      return await sha256Hex(withoutChecksum(value)) === value.checksum.digest ? [] : ['corruption-checksum-mismatch'];
    } catch {
      return ['corruption-checksum-unavailable'];
    }
  }

  function parsedUrl(value, protocols) {
    try {
      const url = new URL(text(value));
      return protocols.includes(url.protocol) ? url : null;
    } catch {
      return null;
    }
  }

  function safeDecode(value) {
    try { return decodeURIComponent(value); } catch { return null; }
  }

  function declaredDomainForUrl(value, domains) {
    const url = parsedUrl(value, ['https:']);
    if (!url) return false;
    const hostname = url.hostname.toLowerCase();
    return list(domains).some(domain => hostname === domain.toLowerCase());
  }

  function validOfficialContact(value, domains) {
    const url = parsedUrl(value, ['https:', 'mailto:', 'tel:']);
    if (!url) return false;
    if (url.protocol === 'https:') return declaredDomainForUrl(value, domains);
    const decoded = safeDecode(url.pathname);
    if (decoded === null) return false;
    if (url.protocol === 'mailto:') {
      const address = decoded.toLowerCase();
      const contactDomain = address.includes('@') ? address.split('@').pop() : '';
      return list(domains).some(domain => contactDomain === domain.toLowerCase());
    }
    return /^\+?[0-9][0-9().+\-\s]{2,}$/.test(decoded);
  }

  function profileAssessment(profile, now = Date.now()) {
    const missing = REQUIRED_PROFILE_FIELDS.filter(field => {
      if (!(field in (profile || {}))) return true;
      if (Array.isArray(profile[field])) return profile[field].length === 0 && !EMPTY_ARRAY_FIELDS.has(field);
      return profile[field] === '' || profile[field] == null;
    });
    const invalidTopics = list(profile?.helpTopics).filter(topic => !HELP_TOPICS.includes(topic));
    const domains = list(profile?.officialDomains).map(domain => domain.toLowerCase());
    const verificationUrls = list(profile?.verificationSources);
    const invalidDates = ['lastChecked', 'nextCheck'].filter(field => !validIsoDate(profile?.[field]));
    const lastChecked = isoDateMs(profile?.lastChecked);
    const nextCheck = isoDateMs(profile?.nextCheck);
    const emergencyEvidence = list(profile?.emergencyEvidence);
    const evidence = profile?.fieldEvidence && typeof profile.fieldEvidence === 'object' ? profile.fieldEvidence : {};
    const missingEvidenceFields = REQUIRED_EVIDENCE_FIELDS.filter(field => !Array.isArray(evidence[field]) || !evidence[field].length);
    const evidenceUrls = REQUIRED_EVIDENCE_FIELDS.flatMap(field => list(evidence[field]));
    const invalidOfficialUrls = [profile?.officialWebsite, ...verificationUrls, ...emergencyEvidence, ...evidenceUrls]
      .filter(url => !declaredDomainForUrl(url, domains));
    const interval = nextCheck - lastChecked;
    const reasons = [];
    if (missing.length) reasons.push('missing-fields');
    if (invalidTopics.length) reasons.push('invalid-topics');
    if (invalidDates.length) reasons.push('invalid-dates');
    if (!verificationUrls.length || missingEvidenceFields.length) reasons.push('missing-official-verification');
    if (!domains.length || invalidOfficialUrls.length || !validOfficialContact(profile?.officialContact, domains)) reasons.push('unsafe-or-undeclared-official-url');
    if (validIsoDate(profile?.lastChecked) && lastChecked > now) reasons.push('last-check-in-future');
    if (validIsoDate(profile?.nextCheck) && nextCheck < now) reasons.push('verification-stale');
    if (validIsoDate(profile?.lastChecked) && validIsoDate(profile?.nextCheck)
      && (interval <= 0 || interval > MAX_REVIEW_INTERVAL_MS
        || (profile?.emergency === true && interval > MAX_EMERGENCY_REVIEW_INTERVAL_MS))) reasons.push('invalid-review-interval');
    if (profile?.emergency === true && !emergencyEvidence.length) reasons.push('unproven-emergency-label');
    if (!['reachable', 'limited', 'unknown', 'unreachable'].includes(profile?.reachabilityStatus)) reasons.push('invalid-reachability');
    return { eligible: reasons.length === 0, reasons, missing, invalidTopics, invalidDates, missingEvidenceFields, invalidOfficialUrls };
  }

  function regionMatches(values, requestedRegion) {
    const region = text(requestedRegion).toLowerCase();
    if (!region) return true;
    return list(values).map(value => value.toLowerCase())
      .some(value => value === region || value.startsWith(`${region}-`) || region.startsWith(`${value}-`));
  }

  function filterProfiles(profiles, filters = {}, now = Date.now()) {
    const region = text(filters.region).toLowerCase();
    const language = text(filters.language).toLowerCase();
    const topic = text(filters.topic);
    const query = text(filters.query).toLocaleLowerCase();
    const location = text(filters.location).toLocaleLowerCase();
    return (Array.isArray(profiles) ? profiles : []).filter(profile => {
      if (!profileAssessment(profile, now).eligible) return false;
      if (region && !regionMatches(profile.regions, region)) return false;
      if (location && !list(profile.locations).some(value => value.toLocaleLowerCase() === location)) return false;
      if (language && !list(profile.confirmedCounsellingLanguages).some(value => value.toLowerCase() === language)) return false;
      if (topic && !list(profile.helpTopics).includes(topic)) return false;
      if (query) {
        const searchable = [
          profile.name, profile.officialOperator, ...list(profile.regions), ...list(profile.locations),
          ...list(profile.helpTopics), ...list(profile.audiences),
          ...list(profile.canHelpWith), ...list(profile.notResponsibleFor),
          ...list(profile.requirements)
        ].join(' ').toLocaleLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }

  function contextualProfiles(profiles, editorialHelpTopics, now = Date.now()) {
    const topics = new Set(list(editorialHelpTopics).filter(topic => HELP_TOPICS.includes(topic)));
    if (!topics.size) return [];
    return filterProfiles(profiles, {}, now).filter(profile => list(profile.helpTopics).some(topic => topics.has(topic)));
  }

  function regionalOfflinePackage(canonicalRegistry, region, now = Date.now()) {
    const profiles = Array.isArray(canonicalRegistry?.profiles) ? canonicalRegistry.profiles : [];
    const selected = filterProfiles(profiles, { region }, now);
    const sourceCheckedAt = text(canonicalRegistry?.sourceUpdatedAt || canonicalRegistry?.updatedAt);
    return {
      schemaVersion: 3,
      region: text(region),
      generatedAt: new Date(now).toISOString(),
      sourceCheckedAt: validInstant(sourceCheckedAt) ? sourceCheckedAt : '',
      profileIds: selected.map(profile => profile.id)
    };
  }

  function regionalDatasetKey(region) {
    const normalized = text(region).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    return normalized ? `${REGION_DATASET_PREFIX}${normalized}` : '';
  }

  function canonicalProfiles(canonicalRegistry, now) {
    return (Array.isArray(canonicalRegistry?.profiles) ? canonicalRegistry.profiles : [])
      .filter(profile => profileAssessment(profile, now).eligible);
  }

  async function regionalPackageAssessment(value, canonicalRegistry, now = Date.now(), recordKey = '') {
    const reasons = [];
    const allowedFields = new Set(['schemaVersion', 'region', 'generatedAt', 'sourceCheckedAt', 'profileIds', 'checksum']);
    const region = text(value?.region);
    const profileIds = Array.isArray(value?.profileIds) ? value.profileIds.map(text) : [];
    if (value?.schemaVersion !== 3 || !region || !validInstant(value?.generatedAt) || !validInstant(value?.sourceCheckedAt)) reasons.push('invalid-package');
    if ('profiles' in (value || {})) reasons.push('embedded-profile-content-forbidden');
    if (Object.keys(value || {}).some(key => !allowedFields.has(key))) reasons.push('unexpected-package-fields');
    if (validInstant(value?.generatedAt) && Date.parse(value.generatedAt) > now + 5 * 60 * 1000) reasons.push('generated-in-future');
    const expectedKey = regionalDatasetKey(region);
    if (recordKey && recordKey !== expectedKey) reasons.push('record-key-mismatch');
    if (!profileIds.length || new Set(profileIds).size !== profileIds.length || profileIds.some(id => !id)) reasons.push('invalid-profile-ids');
    const byId = new Map(canonicalProfiles(canonicalRegistry, now).map(profile => [profile.id, profile]));
    const selected = profileIds.map(id => byId.get(id));
    const canonicalCheckedAt = text(canonicalRegistry?.sourceUpdatedAt || canonicalRegistry?.updatedAt);
    if (!validInstant(canonicalCheckedAt) || value?.sourceCheckedAt !== canonicalCheckedAt) reasons.push('canonical-source-date-mismatch');
    if (selected.some(profile => !profile)) reasons.push('unknown-or-stale-profile-id');
    if (selected.some(profile => profile && !regionMatches(profile.regions, region))) reasons.push('profile-region-mismatch');
    reasons.push(...await checksumReasons(value));
    return { eligible: reasons.length === 0, reasons, region, profiles: selected.filter(Boolean), expectedKey, value };
  }

  async function canonicalRegistryRecord(payload, now = Date.now()) {
    return addCorruptionChecksum({
      schemaVersion: 1,
      cachedAt: new Date(now).toISOString(),
      sourceUpdatedAt: validInstant(payload?.updatedAt) ? payload.updatedAt : '',
      profiles: Array.isArray(payload?.profiles) ? payload.profiles : [],
      editorialNotes: list(payload?.editorialNotes)
    });
  }

  async function canonicalRegistryAssessment(value, now = Date.now()) {
    const reasons = await checksumReasons(value);
    if (value?.schemaVersion !== 1 || !validInstant(value?.cachedAt)
      || !validInstant(value?.sourceUpdatedAt) || !Array.isArray(value?.profiles)) reasons.push('invalid-canonical-cache');
    const cachedAt = Date.parse(text(value?.cachedAt));
    const sourceUpdatedAt = Date.parse(text(value?.sourceUpdatedAt));
    if (Number.isFinite(cachedAt) && Number.isFinite(sourceUpdatedAt) && sourceUpdatedAt > cachedAt) {
      reasons.push('source-updated-after-cache');
    }
    // No clock-skew allowance: callers already inject `now`, so accepting future
    // editorial data would hide a broken or manipulated registry timestamp.
    if (Number.isFinite(sourceUpdatedAt) && sourceUpdatedAt > now) reasons.push('source-updated-in-future');
    if (value?.profiles?.some(profile => !profileAssessment(profile, now).eligible)) reasons.push('invalid-canonical-profile');
    return { eligible: reasons.length === 0, reasons, profiles: value?.profiles || [], value };
  }

  async function storeCanonicalRegistry(storage, payload, now = Date.now()) {
    if (!storage?.putDataset || !storage?.getDataset) return { ok: false, reason: 'storage-unavailable' };
    try {
      const record = await canonicalRegistryRecord(payload, now);
      if (await storage.putDataset(CANONICAL_REGISTRY_KEY, record) !== true) return { ok: false, reason: 'write-failed' };
      const persisted = await storage.getDataset(CANONICAL_REGISTRY_KEY);
      const assessment = await canonicalRegistryAssessment(persisted, now);
      return assessment.eligible && canonicalJson(persisted) === canonicalJson(record)
        ? { ok: true, value: persisted }
        : { ok: false, reason: 'readback-invalid', assessment };
    } catch (error) {
      return { ok: false, reason: 'storage-error', error };
    }
  }

  async function loadCanonicalRegistry(storage, now = Date.now()) {
    try {
      const value = await storage?.getDataset?.(CANONICAL_REGISTRY_KEY);
      const assessment = await canonicalRegistryAssessment(value, now);
      return assessment.eligible ? assessment.value : null;
    } catch {
      return null;
    }
  }

  async function storeRegionalOfflinePackage(storage, value, now = Date.now()) {
    const region = text(typeof value === 'string' ? value : value?.region);
    const datasetKey = regionalDatasetKey(region);
    if (!storage?.putDataset || !storage?.getDataset) return { ok: false, reason: 'storage-unavailable', datasetKey };
    const canonicalRegistry = await loadCanonicalRegistry(storage, now);
    if (!canonicalRegistry) return { ok: false, reason: 'canonical-registry-unavailable', datasetKey };
    const generated = regionalOfflinePackage(canonicalRegistry, region, now);
    if (value && typeof value === 'object') {
      const allowedInputFields = new Set(['schemaVersion', 'region', 'generatedAt', 'sourceCheckedAt', 'profileIds']);
      if (Object.keys(value).some(key => !allowedInputFields.has(key))) {
        return { ok: false, reason: 'package-input-invalid', datasetKey };
      }
      if ('sourceCheckedAt' in value && value.sourceCheckedAt !== generated.sourceCheckedAt) {
        return { ok: false, reason: 'canonical-source-date-mismatch', datasetKey };
      }
      if ('profileIds' in value && canonicalJson(value.profileIds) !== canonicalJson(generated.profileIds)) {
        return { ok: false, reason: 'canonical-selection-mismatch', datasetKey };
      }
    }
    let sealed;
    try {
      sealed = await addCorruptionChecksum(generated);
    } catch (error) {
      return { ok: false, reason: 'checksum-unavailable', error, datasetKey };
    }
    const assessment = await regionalPackageAssessment(sealed, canonicalRegistry, now, datasetKey);
    if (!assessment.eligible) return { ok: false, reason: 'package-invalid', assessment, datasetKey };
    try {
      if (await storage.putDataset(datasetKey, sealed) !== true) return { ok: false, reason: 'write-failed', datasetKey };
      const persisted = await storage.getDataset(datasetKey);
      const readback = await regionalPackageAssessment(persisted, canonicalRegistry, now, datasetKey);
      const exactIdentity = canonicalJson(persisted) === canonicalJson(sealed);
      return readback.eligible && exactIdentity
        ? { ok: true, datasetKey, value: persisted }
        : { ok: false, reason: exactIdentity ? 'readback-invalid' : 'readback-identity-mismatch', assessment: readback, datasetKey };
    } catch (error) {
      return { ok: false, reason: 'storage-error', error, datasetKey };
    }
  }

  async function loadRegionalOfflinePackages(storage, canonicalRegistry, now = Date.now()) {
    if (!storage?.getAllDatasetRecords) return { profiles: [], packages: [], rejected: [] };
    try {
      const records = await storage.getAllDatasetRecords();
      const packages = [];
      const rejected = [];
      for (const record of (Array.isArray(records) ? records : []).filter(item => text(item?.key).startsWith(REGION_DATASET_PREFIX))) {
        const assessment = await regionalPackageAssessment(record?.data, canonicalRegistry, now, text(record?.key));
        if (assessment.eligible) packages.push({ ...record.data, reconstructedProfiles: assessment.profiles });
        else rejected.push({ key: record.key, reasons: assessment.reasons });
      }
      const byId = new Map();
      packages.forEach(value => value.reconstructedProfiles.forEach(profile => byId.set(profile.id, profile)));
      return { profiles: [...byId.values()], packages, rejected };
    } catch (error) {
      return { profiles: [], packages: [], rejected: [], error };
    }
  }

  function regionalPayloadMode(responseEnvelope, fetchSucceeded) {
    if (!fetchSucceeded) return 'restore-offline-packages';
    return responseEnvelope?.responseMetadata?.syntheticSolidarityFallback === true
      ? 'restore-offline-packages'
      : 'authoritative-response';
  }

  async function resolveRegionalNetworkPayload(storage, responseEnvelope, fetchSucceeded, now = Date.now()) {
    const payload = responseEnvelope?.data ?? responseEnvelope;
    if (regionalPayloadMode(responseEnvelope, fetchSucceeded) === 'authoritative-response') {
      const authoritative = Array.isArray(payload?.profiles) ? payload : { profiles: [], editorialNotes: [] };
      await storeCanonicalRegistry(storage, authoritative, now);
      return authoritative;
    }
    const canonical = await loadCanonicalRegistry(storage, now);
    if (!canonical) return { profiles: [], editorialNotes: [] };
    const restored = await loadRegionalOfflinePackages(storage, canonical, now);
    const sourceCheckedAt = restored.packages.map(item => item.sourceCheckedAt).filter(validInstant).sort().at(-1) || canonical.sourceUpdatedAt;
    return {
      profiles: restored.profiles,
      editorialNotes: [],
      offlineProvenance: restored.profiles.length ? {
        kind: 'stored-regional-package',
        sourceCheckedAt,
        packageGeneratedAt: restored.packages.map(item => item.generatedAt).filter(validInstant).sort().at(-1) || '',
        onlineConfirmed: false
      } : null
    };
  }

  function localSubmissionDraft(input, now = Date.now()) {
    return {
      schemaVersion: 1,
      id: `submission-${now}-${Math.random().toString(36).slice(2, 9)}`,
      kind: input?.kind === 'correction' ? 'correction' : 'new-profile',
      profileId: text(input?.profileId),
      submitterContact: text(input?.submitterContact),
      officialEvidenceUrls: list(input?.officialEvidenceUrls).filter(url => /^https:\/\//i.test(url)),
      details: text(input?.details),
      status: 'local-draft', verified: false, published: false, transmitted: false, persisted: false,
      draftedAt: new Date(now).toISOString()
    };
  }

  return Object.freeze({
    HELP_TOPICS, REQUIRED_PROFILE_FIELDS, REQUIRED_EVIDENCE_FIELDS, REGION_DATASET_PREFIX,
    CANONICAL_REGISTRY_KEY, SYNTHETIC_FALLBACK_HEADER, SYNTHETIC_FALLBACK_VALUE,
    profileAssessment, filterProfiles, contextualProfiles, regionalOfflinePackage,
    regionalDatasetKey, regionalPackageAssessment, addCorruptionChecksum,
    canonicalRegistryAssessment, storeCanonicalRegistry, loadCanonicalRegistry,
    storeRegionalOfflinePackage, loadRegionalOfflinePackages, regionalPayloadMode,
    resolveRegionalNetworkPayload, validOfficialContact, localSubmissionDraft
  });
});
