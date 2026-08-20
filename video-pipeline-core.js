'use strict';

(function exposeVideoPipeline(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WRNVideoPipeline = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function createVideoPipeline() {
  const EDITORIAL_TOPICS = new Set([
    'Anti-Rep & Prisons', 'Anticapitalism', 'Antifascism', 'No War',
    'Labor Struggles', 'No Borders', 'Squatting & Housing', 'Queer-Feminism',
    'Antiracism', 'Indigenous Struggles', 'Eco-Anarchism', 'Animal Liberation',
    'Demonstrations', 'Theory & Strategy', 'Cyberactivism', 'Anti-Imperialism',
    'Anticolonialism'
  ]);
  const EDITORIAL_TERMS = /(?:anarch|anti[- ]?fasc|anti[- ]?capital|anti[- ]?militar|repress|prison|police|cops?|solidarit|protest|demonstrat|strike|labou?r\b|union|squat|occup|evict|revolt|riot|revolution|border|migration|refugee|deport|palestin|indigenous|colonial|imperial|feminis|queer|racis|climate|ecolog|surveill|huelga|represi[oó]n|anarqu|ocupaci[oó]n|gr[eè]ve|[ée]meut|besetz|abschieb|streik|gef[aä]ng|guerra|αναρχ|απεργ|καταστολ|αντιφασ|anarh|grev|represj)/iu;
  const VIDEO_EXTENSIONS = /\.(?:mp4|m4v|webm|ogv)(?:[?#]|$)/iu;

  function text(value) {
    return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || '').replaceAll('&amp;', '&'));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function slug(value) {
    return text(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  function safeId(value) {
    const id = text(value);
    return /^[A-Za-z0-9_-]{6,100}$/.test(id) ? id : '';
  }

  function hostMatches(host, domain) {
    return host === domain || host.endsWith(`.${domain}`);
  }

  function identifyVideo(raw) {
    const href = safeUrl(raw);
    if (!href) return null;
    const url = new URL(href);
    const host = url.hostname.toLocaleLowerCase().replace(/^www\./, '');
    const path = url.pathname;
    if (host === 'youtu.be') {
      const id = safeId(path.split('/').filter(Boolean)[0]);
      return id ? { platform: 'YouTube', canonicalId: `youtube:${id}`, originalUrl: href, embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`, platformId: id } : null;
    }
    if (hostMatches(host, 'youtube.com') || hostMatches(host, 'youtube-nocookie.com')) {
      const id = safeId(url.searchParams.get('v') || path.match(/\/(?:embed|shorts|live|v)\/([^/?]+)/)?.[1]);
      return id ? { platform: 'YouTube', canonicalId: `youtube:${id}`, originalUrl: href, embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`, platformId: id } : null;
    }
    if (hostMatches(host, 'vimeo.com')) {
      const id = path.match(/\/(?:video\/)?(\d+)(?:$|\/)/)?.[1] || '';
      return id ? { platform: 'Vimeo', canonicalId: `vimeo:${id}`, originalUrl: href, embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(id)}?dnt=1`, platformId: id } : null;
    }
    const peerTubeId = safeId(path.match(/^\/videos\/(?:watch|embed)\/([^/?]+)/)?.[1] || path.match(/^\/w\/([^/?]+)/)?.[1]);
    if (peerTubeId && url.protocol === 'https:') {
      const platform = hostMatches(host, 'kolektiva.media') ? 'Kolektiva' : 'PeerTube';
      return { platform, canonicalId: `peertube:${url.origin}:${peerTubeId}`, originalUrl: href, embedUrl: `${url.origin}/videos/embed/${encodeURIComponent(peerTubeId)}`, platformId: peerTubeId };
    }
    if (VIDEO_EXTENSIONS.test(url.pathname)) {
      const canonical = `${url.origin}${url.pathname}`;
      return { platform: 'Direct', canonicalId: `direct:${canonical.toLocaleLowerCase()}`, originalUrl: href, embedUrl: '', platformId: '' };
    }
    return null;
  }

  function extractVideoUrls(item) {
    const values = [item?.videoUrl, item?.video, item?.link, item?.content, item?.contentComplete, item?.description]
      .filter(Boolean)
      .map(String);
    const urls = [];
    for (const value of values) {
      const decoded = value.replaceAll('&amp;', '&');
      if (/^https?:\/\//iu.test(decoded.trim())) urls.push(decoded.trim());
      urls.push(...(decoded.match(/https?:\/\/[^\s"'<>]+/giu) || []));
    }
    return [...new Set(urls.map(value => value.replace(/[),.;\]}]+$/u, '')))]
      .filter(value => identifyVideo(value));
  }

  function normalizedLanguage(value) {
    const raw = text(value).toLocaleLowerCase();
    const aliases = { english: 'en', german: 'de', deutsch: 'de', spanish: 'es', español: 'es', french: 'fr', français: 'fr', italian: 'it', italiano: 'it', portuguese: 'pt', português: 'pt', russian: 'ru', greek: 'el', turkish: 'tr', multilingual: 'mul' };
    return aliases[raw] || raw.split(/[-_]/u)[0] || 'und';
  }

  function videoSection(raw, sourceEntry) {
    const explicit = text(raw?.section || raw?.videoSection).toLocaleLowerCase();
    if (['reports', 'interviews', 'documentaries', 'education', 'live'].includes(explicit)) return explicit;
    const title = text(raw?.title);
    if (raw?.live === true || /(?:^|\W)(?:live|livestream|en directo|ao vivo)(?:\W|$)/iu.test(title)) return 'live';
    if (/(?:interview|conversation|gespr[aä]ch|entrevista|entretien|intervista)/iu.test(title)) return 'interviews';
    if (/(?:documentary|documental|documentaire|dokumentation|documentario)/iu.test(title)) return 'documentaries';
    return text(raw?.sourceKind || sourceEntry?.kind) === 'news-embedded' ? 'reports' : 'education';
  }

  function registryRows(registry) {
    return Array.isArray(registry?.sources) ? registry.sources : [];
  }

  function registrySource(raw, registry) {
    const wantedId = text(raw?.sourceId);
    const wantedName = text(raw?.source || raw?.sourceName || raw?.quelleName).toLocaleLowerCase();
    return registryRows(registry).find(source => (
      (wantedId && source.id === wantedId)
      || [source.name, ...(source.sourceNames || [])].map(value => text(value).toLocaleLowerCase()).includes(wantedName)
    )) || null;
  }

  function isEditoriallyRelevant(raw, source) {
    if (raw?.editorialStatus === 'approved') return true;
    const topic = text(raw?.topic || raw?.primaryTopic);
    if (EDITORIAL_TOPICS.has(topic)) return true;
    const explicitTags = (raw?.sourceTags || []).map(text);
    if (explicitTags.some(value => EDITORIAL_TOPICS.has(value))) return true;
    const haystack = [raw?.title, raw?.description, raw?.summary, raw?.content, raw?.source, raw?.sourceName, raw?.quelleName, topic, ...(raw?.topics || []), ...(raw?.categories || [])].map(text).join(' ');
    return EDITORIAL_TERMS.test(haystack);
  }

  function normalizeVideo(raw, registry) {
    const identified = identifyVideo(raw?.originalUrl || raw?.url || raw?.videoUrl || raw?.video);
    if (!identified) return null;
    const sourceEntry = registrySource(raw, registry);
    const source = text(raw?.source || raw?.sourceName || raw?.quelleName || sourceEntry?.name || 'Unknown source');
    const publishedAt = text(raw?.publishedAt || raw?.pubDate || raw?.published || raw?.date);
    const timestamp = Date.parse(publishedAt) || 0;
    const imageCandidate = safeUrl(raw?.thumbnailUrl || raw?.image);
    const thumbnailUrl = imageCandidate && !VIDEO_EXTENSIONS.test(imageCandidate)
      ? imageCandidate
      : identified.platform === 'YouTube'
        ? `https://i.ytimg.com/vi/${encodeURIComponent(identified.platformId)}/hqdefault.jpg`
        : '';
    const topics = [...new Set([
      raw?.topic,
      raw?.primaryTopic,
      ...(raw?.topics || []),
      ...(raw?.secondaryTopics || [])
    ].map(text).filter(Boolean))];
    return {
      id: identified.canonicalId,
      canonicalId: identified.canonicalId,
      platformId: identified.platformId,
      title: text(raw?.title || 'Untitled video'),
      description: text(raw?.description || raw?.summary || raw?.intro || raw?.content).slice(0, 700),
      sourceId: text(sourceEntry?.id || raw?.sourceId || slug(source)),
      source,
      sourceKind: text(raw?.sourceKind || sourceEntry?.kind || 'news-embedded'),
      section: videoSection(raw, sourceEntry),
      platform: identified.platform,
      language: normalizedLanguage(raw?.language || raw?.originalLanguage || sourceEntry?.languages?.[0] || 'und'),
      region: text(raw?.region || raw?.primaryRegion || sourceEntry?.regions?.[0] || 'Global'),
      topic: topics[0] || text(sourceEntry?.topics?.[0] || 'Movement News'),
      topics,
      publishedAt: timestamp ? new Date(timestamp).toISOString() : '',
      timestamp,
      durationSeconds: Number.isFinite(Number(raw?.durationSeconds)) && Number(raw.durationSeconds) > 0 ? Number(raw.durationSeconds) : null,
      thumbnailUrl,
      subtitlesAvailable: typeof raw?.subtitlesAvailable === 'boolean' ? raw.subtitlesAvailable : null,
      transcriptUrl: safeUrl(raw?.transcriptUrl),
      originalUrl: identified.originalUrl,
      embedUrl: identified.embedUrl,
      articleUrl: safeUrl(raw?.articleUrl || raw?.link),
      editorialStatus: text(raw?.editorialStatus || sourceEntry?.editorialStatus || 'derived'),
      duplicateCount: 1,
      relatedArticleUrls: []
    };
  }

  function metadataScore(item) {
    return ['title', 'description', 'source', 'language', 'region', 'topic', 'publishedAt', 'thumbnailUrl', 'transcriptUrl']
      .reduce((score, key) => score + (item?.[key] ? 1 : 0), 0)
      + (item?.subtitlesAvailable !== null ? 1 : 0)
      + (item?.durationSeconds ? 1 : 0);
  }

  function deduplicateVideos(items) {
    const byId = new Map();
    let duplicateCount = 0;
    for (const item of items) {
      if (!item?.canonicalId) continue;
      if (!byId.has(item.canonicalId)) {
        byId.set(item.canonicalId, { ...item });
        continue;
      }
      duplicateCount += 1;
      const current = byId.get(item.canonicalId);
      const preferred = metadataScore(item) > metadataScore(current)
        || (metadataScore(item) === metadataScore(current) && item.timestamp > current.timestamp)
        ? item
        : current;
      const alternatives = [
        ...(current.relatedArticleUrls || []), current.articleUrl,
        ...(item.relatedArticleUrls || []), item.articleUrl
      ].filter(Boolean);
      byId.set(item.canonicalId, {
        ...preferred,
        duplicateCount: Number(current.duplicateCount || 1) + 1,
        relatedArticleUrls: [...new Set(alternatives)]
      });
    }
    return { items: [...byId.values()], duplicateCount };
  }

  function balanceVideos(items, registry) {
    const defaults = registry?.defaults || {};
    const totalLimit = Math.max(1, Number(defaults.maxItemsTotal || 120));
    const defaultSourceLimit = Math.max(1, Number(defaults.maxItemsPerSource || 2));
    const sources = new Map(registryRows(registry).map(source => [source.id, source]));
    const groups = new Map();
    [...items].sort((a, b) => b.timestamp - a.timestamp || a.title.localeCompare(b.title)).forEach(item => {
      if (!groups.has(item.sourceId)) groups.set(item.sourceId, []);
      const limit = Math.max(1, Number(sources.get(item.sourceId)?.maxItemsPerRun || defaultSourceLimit));
      if (groups.get(item.sourceId).length < limit) groups.get(item.sourceId).push(item);
    });
    const result = [];
    const queues = [...groups.values()].sort((a, b) => (b[0]?.timestamp || 0) - (a[0]?.timestamp || 0));
    while (result.length < totalLimit && queues.some(queue => queue.length)) {
      for (const queue of queues) {
        if (queue.length && result.length < totalLimit) result.push(queue.shift());
      }
    }
    return result;
  }

  function buildVideoFeed(input = {}) {
    const registry = input.registry || { sources: [] };
    const candidates = [];
    const rejected = [];
    for (const seed of Array.isArray(input.seeds) ? input.seeds : []) {
      const normalized = normalizeVideo(seed, registry);
      if (normalized && isEditoriallyRelevant(seed, registrySource(seed, registry))) candidates.push(normalized);
      else rejected.push({ source: text(seed?.source), title: text(seed?.title), reason: normalized ? 'editorial-filter' : 'invalid-video-url' });
    }
    for (const article of Array.isArray(input.articles) ? input.articles : []) {
      const sourceEntry = registrySource(article, registry);
      for (const url of extractVideoUrls(article)) {
        if (!isEditoriallyRelevant(article, sourceEntry)) {
          rejected.push({ source: text(article?.quelleName || article?.source), title: text(article?.title), reason: 'editorial-filter' });
          continue;
        }
        const normalized = normalizeVideo({
          ...article,
          url,
          source: article?.quelleName || article?.source,
          sourceKind: 'news-embedded',
          articleUrl: article?.link
        }, registry);
        if (normalized) candidates.push(normalized);
        else rejected.push({ source: text(article?.quelleName || article?.source), title: text(article?.title), reason: 'invalid-video-url' });
      }
    }
    const deduplicated = deduplicateVideos(candidates);
    const items = balanceVideos(deduplicated.items, registry);
    return {
      items,
      rejected,
      stats: {
        candidateCount: candidates.length,
        acceptedBeforeQuota: deduplicated.items.length,
        acceptedCount: items.length,
        duplicateCount: deduplicated.duplicateCount,
        quotaRemovedCount: deduplicated.items.length - items.length,
        rejectedCount: rejected.length
      }
    };
  }

  function countBy(items, key) {
    const counts = new Map();
    items.forEach(item => {
      const value = text(item?.[key] || 'unknown');
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
  }

  function networkState(result) {
    if (!result) return 'not-checked';
    if (result.ok) return 'reachable';
    if ([404, 410].includes(Number(result.status))) return 'dead';
    if ([401, 403, 451].includes(Number(result.status))) return 'blocked';
    return 'unavailable';
  }

  function ageState(item, now) {
    if (!item?.publishedAt) return { ageDays: null, ageStatus: 'unknown' };
    const ageDays = Math.max(0, Math.floor((now - Date.parse(item.publishedAt)) / 86400000));
    return {
      ageDays,
      ageStatus: ageDays <= 30 ? 'current' : ageDays <= 365 ? 'recent-archive' : 'archive'
    };
  }

  function buildVideoHealth(feed, registry, options = {}) {
    const items = Array.isArray(feed?.items) ? feed.items : [];
    const generatedAt = text(options.generatedAt || new Date().toISOString());
    const generatedTimestamp = Date.parse(generatedAt) || Date.now();
    const networkChecks = options.networkChecks || { mode: 'not-run', checked: 0, reachable: 0, failed: 0 };
    const sourceNetwork = new Map((networkChecks?.sources?.results || []).map(result => [result.sourceId, result]));
    const itemNetwork = new Map((networkChecks?.items?.results || []).map(result => [result.canonicalId, result]));
    const required = ['title', 'description', 'source', 'platform', 'language', 'region', 'topic', 'publishedAt', 'originalUrl'];
    const missingMetadata = Object.fromEntries(required.map(key => [key, items.filter(item => !item?.[key]).length]));
    const sourceCounts = countBy(items, 'sourceId');
    const itemHealth = items.map(item => {
      const checked = itemNetwork.get(item.canonicalId);
      const originalStatus = networkState(checked?.original);
      const embedStatus = item.embedUrl
        ? networkState(checked?.embed) === 'reachable' ? 'embeddable' : networkState(checked?.embed)
        : 'not-applicable';
      const age = ageState(item, generatedTimestamp);
      const platformStatus = text(item.availability || 'unknown');
      const platformAttention = !['OK', 'unknown'].includes(platformStatus);
      return {
        canonicalId: item.canonicalId,
        originalStatus,
        embedStatus,
        platformStatus,
        playabilityReason: text(item.playabilityReason),
        ...age,
        status: ['dead', 'blocked', 'unavailable'].includes(originalStatus)
          || ['dead', 'blocked', 'unavailable'].includes(embedStatus)
          || platformAttention
          ? 'attention'
          : 'healthy'
      };
    });
    const hasNetworkAttention = itemHealth.some(item => item.status === 'attention');
    return {
      schemaVersion: 1,
      generatedAt,
      status: items.length && Object.values(missingMetadata).every(count => count === 0) && !hasNetworkAttention
        ? 'healthy'
        : items.length ? 'attention' : 'empty',
      networkChecks,
      totals: { ...feed.stats, registrySources: registryRows(registry).length },
      coverage: {
        duration: items.filter(item => item.durationSeconds).length,
        thumbnails: items.filter(item => item.thumbnailUrl).length,
        subtitlesKnown: items.filter(item => item.subtitlesAvailable !== null).length,
        transcripts: items.filter(item => item.transcriptUrl).length
      },
      missingMetadata,
      byPlatform: countBy(items, 'platform'),
      byLanguage: countBy(items, 'language'),
      bySource: sourceCounts,
      itemHealth,
      sources: registryRows(registry).map(source => ({
        id: source.id,
        name: source.name,
        enabled: source.enabled !== false,
        editorialStatus: source.editorialStatus,
        itemCount: Number(sourceCounts[source.id] || 0),
        networkStatus: networkState(sourceNetwork.get(source.id))
      }))
    };
  }

  return {
    text,
    safeUrl,
    identifyVideo,
    extractVideoUrls,
    normalizeVideo,
    isEditoriallyRelevant,
    deduplicateVideos,
    balanceVideos,
    buildVideoFeed,
    buildVideoHealth
  };
});
