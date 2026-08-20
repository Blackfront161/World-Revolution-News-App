/* World Revolution News – News App 2 media helpers */
'use strict';

(function expose(factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.WRNNewsApp2Media = Object.freeze(api);
})(function createMediaHelpers() {
  const POLITICS = /anarch|antifasc|anti-fasc|anticapital|anti-capital|libertar|communis|solidarit|strike|union|labou?r|protest|revolution|prison|border|migration|racis|colonial|imperial|feminis|queer|climate|ecolog|indigenous|housing|squat|politi|society|gesellschaft|politik|bewegung/i;
  const CULTURE = /culture|kultur|book|literature|music|film|theatre|theater|art|kunst|history|geschichte/i;

  const INFORMATION_VIDEOS = Object.freeze([
    {
      id: 'lrTzjaXskUU',
      title: 'How Anarchy Works',
      source: 'Andrewism',
      language: 'English',
      region: 'Latin America',
      url: 'https://www.youtube.com/watch?v=lrTzjaXskUU',
      channelUrl: 'https://www.youtube.com/@Andrewism',
      summary: 'A clear introduction to cooperation and organisation without rulers.'
    },
    {
      id: 'o8Btb1sGRK0',
      title: 'How Does Anarchy Handle “Bad People”?',
      source: 'Andrewism',
      language: 'English',
      region: 'Latin America',
      url: 'https://www.youtube.com/watch?v=o8Btb1sGRK0',
      channelUrl: 'https://www.youtube.com/@Andrewism',
      summary: 'Community responses to harm without relying on authoritarian institutions.'
    },
    {
      id: 'nrm4gj_eDGA',
      title: 'David Graeber on Democracy and Debt',
      source: 'David Graeber / OWS Free University',
      language: 'English',
      region: 'North America',
      url: 'https://www.youtube.com/watch?v=nrm4gj_eDGA',
      channelUrl: 'https://davidgraeber.org/videos/',
      summary: 'An open-air lecture connecting democracy, debt and organising.'
    },
    {
      id: 'mOlpZzlh09s',
      title: 'Anarchism: What It Really Stands For',
      source: 'Audible Anarchist / Emma Goldman',
      language: 'English',
      region: 'Europe',
      url: 'https://www.youtube.com/watch?v=mOlpZzlh09s',
      channelUrl: 'https://www.youtube.com/channel/UCaO1QA8QL99_eb0XhJI2Fyw',
      summary: 'A volunteer-read introduction to Emma Goldman’s explanation of anarchism.'
    },
    {
      id: 'mfEYye6TNlk',
      title: 'Ecology and Revolutionary Thought',
      source: 'Audible Anarchist / Murray Bookchin',
      language: 'English',
      region: 'North America',
      url: 'https://www.youtube.com/watch?v=mfEYye6TNlk',
      channelUrl: 'https://www.youtube.com/channel/UCaO1QA8QL99_eb0XhJI2Fyw',
      summary: 'An introduction to the connection between ecological and social domination.'
    },
    {
      id: 'submedia-channel',
      title: 'subMedia',
      source: 'Anarchist video collective',
      language: 'Multilingual',
      region: 'Global',
      url: 'https://kolektiva.media/a/submedia/video-channels',
      channelUrl: 'https://kolektiva.media/a/submedia/video-channels',
      summary: 'Movement reporting, documentaries and analysis from struggles around the world.'
    }
  ]);

  function text(value) {
    return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ''));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function canonicalRegion(value) {
    const clean = text(value);
    const normalized = clean
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
    const aliases = {
      dach: 'Europe',
      europa: 'Europe',
      europe: 'Europe',
      lateinamerika: 'Latin America',
      'latin america': 'Latin America',
      nordamerika: 'North America',
      'north america': 'North America',
      afrika: 'Africa',
      africa: 'Africa',
      asien: 'Asia',
      asia: 'Asia',
      ozeanien: 'Oceania',
      oceania: 'Oceania',
      global: 'Global'
    };
    return aliases[normalized] || clean || 'Global';
  }

  function categoryFor(item) {
    const haystack = [
      item?.title,
      item?.description,
      ...(item?.topics || []),
      ...(item?.categories || [])
    ].join(' ');
    if (POLITICS.test(haystack)) return 'politics';
    if (CULTURE.test(haystack)) return 'culture';
    return 'society';
  }

  function normalizePodcast(item) {
    const published = text(item?.published || item?.createdAt);
    const source = text(item?.sourceName || item?.source || 'Unknown source');
    const rawKind = text(item?.sourceKind).toLocaleLowerCase();
    const sourceKind = rawKind === 'free-radio' || rawKind === 'aggregator'
      ? rawKind
      : /^radio dreyeckland$/iu.test(source)
        ? 'free-radio'
        : 'independent-podcast';
    return {
      id: text(item?.id || `${item?.sourceName || ''}:${item?.title || ''}:${item?.published || ''}`),
      title: text(item?.title || 'Untitled'),
      description: text(item?.description),
      source,
      sourceId: text(item?.sourceId || item?.sourceSlug || source).toLocaleLowerCase(),
      sourceKind,
      sourcePriority: Number(item?.sourcePriority || 0),
      published,
      timestamp: Date.parse(published) || 0,
      expiresAt: text(item?.expiresAt),
      mode: text(item?.mode),
      voiceLabel: text(item?.voiceLabel),
      duration: text(item?.duration),
      language: text(item?.language),
      country: text(item?.country),
      region: canonicalRegion(item?.region),
      audioUrl: safeUrl(item?.audioUrl || item?.url),
      episodeUrl: safeUrl(item?.episodeUrl || item?.link || item?.articleUrl),
      artwork: safeUrl(item?.artwork),
      topics: Array.isArray(item?.topics) ? item.topics.map(text).filter(Boolean) : [],
      categories: Array.isArray(item?.categories) ? item.categories.map(text).filter(Boolean) : [],
      category: categoryFor(item)
    };
  }

  function normalizeRadio(item) {
    const streams = (item?.streamCandidates || []).map(safeUrl).filter(Boolean);
    return {
      id: text(item?.id || item?.name),
      name: text(item?.name || 'Radio'),
      city: text(item?.city),
      country: text(item?.country),
      region: canonicalRegion(item?.region),
      languages: Array.isArray(item?.languages) ? item.languages.map(text).filter(Boolean) : [],
      topics: Array.isArray(item?.topics) ? item.topics.map(text).filter(Boolean) : [],
      description: text(item?.description),
      website: safeUrl(item?.website),
      streams,
      streamUrl: streams[0] || '',
      healthStatus: text(item?.healthStatus || 'unknown')
    };
  }

  function isRelevantPodcast(item) {
    if (!item) return false;
    const normalized = item.category ? item : normalizePodcast(item);
    const haystack = [
      normalized.title,
      normalized.description,
      normalized.source,
      ...normalized.topics,
      ...normalized.categories
    ].join(' ');
    return POLITICS.test(haystack)
      || normalized.topics.length > 0
      || normalized.sourcePriority >= 70;
  }

  function filterItems(items, filters = {}) {
    const query = text(filters.query).toLocaleLowerCase();
    const languages = new Set(
      (Array.isArray(filters.languages) ? filters.languages : [])
        .map(value => text(value).toLocaleLowerCase())
        .filter(Boolean)
    );
    return (Array.isArray(items) ? items : []).filter(item => {
      if (
        filters.region
        && filters.region !== 'all'
        && canonicalRegion(item.region) !== canonicalRegion(filters.region)
      ) return false;
      if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
      if (languages.size && !languages.has(text(item.language).toLocaleLowerCase())) return false;
      if (
        filters.source
        && filters.source !== 'all'
        && text(item.sourceId || item.source).toLocaleLowerCase() !== text(filters.source).toLocaleLowerCase()
      ) return false;
      if (!query) return true;
      return [
        item.title,
        item.name,
        item.source,
        item.description,
        item.region,
        item.country,
        ...(item.topics || [])
      ].join(' ').toLocaleLowerCase().includes(query);
    });
  }

  function balancedBySource(items, limit) {
    const ordered = [...(Array.isArray(items) ? items : [])]
      .sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));
    const groups = new Map();
    ordered.forEach(item => {
      const key = text(item?.sourceId || item?.source || 'unknown').toLocaleLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    const result = [];
    let depth = 0;
    while (result.length < limit) {
      let added = false;
      for (const rows of groups.values()) {
        if (depth >= rows.length) continue;
        result.push(rows[depth]);
        added = true;
        if (result.length >= limit) break;
      }
      if (!added) break;
      depth += 1;
    }
    return result;
  }

  function podcastQuota(items, options = {}) {
    const kind = options.kind === 'free-radio' ? 'free-radio' : 'independent-podcast';
    const matching = (Array.isArray(items) ? items : []).filter(item => {
      const itemKind = item?.sourceKind === 'free-radio' || item?.sourceKind === 'aggregator'
        ? 'free-radio'
        : 'independent-podcast';
      return itemKind === kind;
    });
    if (kind === 'free-radio') return balancedBySource(matching, Number(options.radioLimit) || 50);

    const selectedLanguages = (Array.isArray(options.languages) && options.languages.length
      ? options.languages
      : [...new Set(matching.map(item => text(item?.language).toLocaleLowerCase()).filter(Boolean))]
    ).map(value => text(value).toLocaleLowerCase());
    const perLanguage = Number(options.perLanguage) || 30;
    return selectedLanguages.flatMap(language => balancedBySource(
      matching.filter(item => text(item?.language).toLocaleLowerCase() === language),
      perLanguage
    )).sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));
  }

  return {
    INFORMATION_VIDEOS,
    canonicalRegion,
    balancedBySource,
    categoryFor,
    filterItems,
    isRelevantPodcast,
    normalizePodcast,
    normalizeRadio,
    podcastQuota,
    safeUrl,
    text
  };
});
