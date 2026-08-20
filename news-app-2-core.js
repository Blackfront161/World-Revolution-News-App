/* World Revolution News – News App 2 preview core */
'use strict';

(function expose(factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.WRNNewsApp2Core = Object.freeze(api);
})(function createCore() {
  const REGION_ALIASES = Object.freeze({
    'Australia & NZ': 'Oceania',
    Australia: 'Oceania',
    'North Am.': 'North America',
    'Latin Am.': 'Latin America'
  });

  function text(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function stripHtml(value) {
    return text(String(value ?? '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'"))
      .replace(/\s+([,.;:!?])/g, '$1');
  }

  function stripHtmlPreserveBreaks(value) {
    return String(value ?? '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|section|article|header|footer|aside|h[1-6]|blockquote|figure|figcaption|ul|ol|li)>/gi, '\n\n')
      .replace(/<li\b[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(line => line.replace(/[\t ]+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function articleContentParagraphs(value) {
    const preserved = stripHtmlPreserveBreaks(value);
    if (!preserved) return [];
    let paragraphs = preserved.split(/\n{2,}|\n(?=[•])/).map(text).filter(Boolean);
    if (paragraphs.length > 1 || preserved.length < 900) return paragraphs;

    const sentences = preserved.split(/(?<=[.!?])\s+(?=[\p{Lu}\d„“«»])/u).map(text).filter(Boolean);
    if (sentences.length < 2) return paragraphs;
    paragraphs = [];
    let current = '';
    sentences.forEach(sentence => {
      if (current && `${current} ${sentence}`.length > 760) {
        paragraphs.push(current);
        current = sentence;
      } else {
        current = [current, sentence].filter(Boolean).join(' ');
      }
    });
    if (current) paragraphs.push(current);
    return paragraphs;
  }

  function safeHttpUrl(value) {
    try {
      const url = new URL(String(value || ''));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function safeImageUrl(value) {
    const candidate = safeHttpUrl(value);
    if (!candidate) return '';
    try {
      const pathname = new URL(candidate).pathname.toLowerCase();
      if (/\.(?:mp4|m4v|mov|webm|ogv|mp3|m4a|aac|ogg|oga|wav|flac|m3u8)$/i.test(pathname)) {
        return '';
      }
      return candidate;
    } catch {
      return '';
    }
  }

  function imageIdentity(value) {
    const candidate = safeImageUrl(value);
    if (!candidate) return '';
    try {
      const url = new URL(candidate);
      url.hash = '';
      url.search = '';
      url.pathname = url.pathname.replace(/-\d{2,5}x\d{2,5}(?=\.[a-z0-9]+$)/i, '');
      return url.href.toLowerCase();
    } catch {
      return candidate.toLowerCase();
    }
  }

  function isLikelyArticleImage(value) {
    const candidate = safeImageUrl(value);
    if (!candidate) return false;
    try {
      const pathname = decodeURIComponent(new URL(candidate).pathname).toLowerCase();
      const filename = pathname.split('/').pop() || '';
      if (/\/(?:themes|plugins|assets)\//i.test(pathname)) return false;
      if (/(?:^|[-_.])(logo|favicon|avatar|sprite|spacer|pixel|mega)(?:[-_.0-9]|$)/i.test(filename)) return false;
      if (/(?:shop[-_]?slide|homepage[-_]?graphic|social[-_]?share)/i.test(filename)) return false;
      const dimensions = filename.match(/-(\d{2,5})x(\d{2,5})(?=\.[a-z0-9]+$)/i);
      if (dimensions && (Number(dimensions[1]) < 180 || Number(dimensions[2]) < 100)) return false;
      return true;
    } catch {
      return false;
    }
  }

  function articleImageUrls(values, primaryImage = '') {
    const excluded = Array.isArray(primaryImage) ? primaryImage : [primaryImage];
    const seen = new Set(excluded.map(imageIdentity).filter(Boolean));
    return (Array.isArray(values) ? values : [])
      .map(safeImageUrl)
      .filter(isLikelyArticleImage)
      .filter(candidate => {
        const identity = imageIdentity(candidate);
        if (!identity || seen.has(identity)) return false;
        seen.add(identity);
        return true;
      });
  }

  function normalizeContentBlocks(values) {
    if (!Array.isArray(values)) return [];
    return values.slice(0, 400).map(block => {
      if (!block || typeof block !== 'object') return null;
      const type = text(block.type).toLocaleLowerCase();
      if (type === 'image') {
        const url = safeImageUrl(block.url || block.src);
        if (!isLikelyArticleImage(url)) return null;
        return {
          type: 'image',
          url,
          alt: text(block.alt),
          caption: text(block.caption)
        };
      }
      if (!['paragraph', 'quote', 'heading'].includes(type)) return null;
      const value = text(block.text || block.value);
      if (!value) return null;
      return {
        type,
        text: value,
        ...(type === 'heading'
          ? { level: Math.min(4, Math.max(2, Number(block.level) || 2)) }
          : {})
      };
    }).filter(Boolean);
  }

  function articleContentMode(article, normalizedContent = '') {
    const content = text(
      normalizedContent
      || article?.content
      || article?.description
      || article?.summary
      || ''
    );
    if (!content) return 'metadata';
    if (article?.contentComplete === false || article?.webFeedTruncated) return 'excerpt';
    const explicit = text(article?.contentMode).toLowerCase();
    if (['full', 'excerpt', 'metadata'].includes(explicit)) return explicit;
    return 'full';
  }

  function hasCompleteArticle(article) {
    if (!article || articleContentMode(article, article.content) === 'metadata') return false;
    if (article.contentComplete !== false && !article.webFeedTruncated) return true;
    return Boolean(article.webFeedTruncated || article.detailPath || article.detailUrl);
  }

  function isLeadEligible(article) {
    const title = text(article?.title);
    const content = text(article?.content || article?.intro || article?.description);
    const normalized = content.toLocaleLowerCase();
    const placeholderMarkers = [
      'no text available',
      'kein text verfügbar',
      'aucun texte disponible',
      'sin texto disponible',
      'nessun testo disponibile',
      'nenhum texto disponível'
    ];
    return title.length >= 4
      && content.length >= 80
      && Boolean(safeHttpUrl(article?.link))
      && hasCompleteArticle(article)
      && !placeholderMarkers.some(marker => normalized.includes(marker));
  }

  function dateValue(article) {
    const timestamp = Date.parse(
      article?.pubDate || article?.date || article?.eventStart || ''
    );
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function articleId(article) {
    return text(article?.link)
      || `${text(article?.quelleName)}::${text(article?.title)}::${dateValue(article)}`;
  }

  function normalizeRegion(value) {
    const region = text(value);
    return REGION_ALIASES[region] || region || 'Global';
  }

  function normalizeArticle(article) {
    const categories = Array.isArray(article?.categories)
      ? article.categories.map(text).filter(Boolean)
      : [];
    const primaryRegion = normalizeRegion(
      article?.primaryRegion || article?.kontinent || categories[0]
    );
    const primaryTopic = text(
      article?.primaryTopic
      || categories.find(item => normalizeRegion(item) !== primaryRegion)
      || ''
    );
    const content = stripHtmlPreserveBreaks(
      article?.content || article?.description || article?.summary || ''
    );
    const contentBlocks = normalizeContentBlocks(article?.contentBlocks);
    const contentMode = articleContentMode(article, content);

    return {
      ...article,
      id: articleId(article),
      type: text(article?.type || 'article'),
      title: text(article?.title || 'Untitled'),
      intro: excerpt(content, 230),
      content,
      contentMode,
      contentBlocks,
      source: text(article?.quelleName || article?.source || 'Unknown source'),
      author: text(article?.author),
      link: safeHttpUrl(article?.link),
      videoUrl: videoUrl(article),
      image: safeImageUrl(article?.image || article?.imageUrl),
      primaryRegion,
      primaryTopic,
      secondaryTopics: Array.isArray(article?.secondaryTopics)
        ? article.secondaryTopics.map(text).filter(Boolean)
        : [],
      categories,
      timestamp: dateValue(article)
    };
  }

  function normalizeArticles(payload) {
    const source = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.articles)
          ? payload.articles
          : [];
    const seen = new Set();

    return source
      .filter(item => item && typeof item === 'object' && item.type !== 'event')
      .map(normalizeArticle)
      .filter(item => {
        const key = `${item.link || ''}|${item.title.toLowerCase()}`;
        if (!item.title || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  function excerpt(value, maxLength = 180) {
    const clean = stripHtml(value);
    if (clean.length <= maxLength) return clean;
    const slice = clean.slice(0, Math.max(1, maxLength - 1));
    const boundary = slice.lastIndexOf(' ');
    return `${slice.slice(0, boundary > maxLength * 0.55 ? boundary : slice.length)}…`;
  }

  function balanceBySource(items, limit = 10, maxPerSource = 2) {
    const source = Array.isArray(items) ? items : [];
    const remaining = source.slice();
    const result = [];
    const counts = new Map();
    let lastSource = '';

    while (remaining.length && result.length < limit) {
      let index = remaining.findIndex(item => {
        const name = text(item?.source || item?.quelleName);
        return name !== lastSource && (counts.get(name) || 0) < maxPerSource;
      });
      if (index < 0) {
        index = remaining.findIndex(item => {
          const name = text(item?.source || item?.quelleName);
          return (counts.get(name) || 0) < maxPerSource;
        });
      }
      if (index < 0) break;

      const [item] = remaining.splice(index, 1);
      const name = text(item?.source || item?.quelleName);
      result.push(item);
      counts.set(name, (counts.get(name) || 0) + 1);
      lastSource = name;
    }

    return result;
  }

  function applyEditorialDecisions(items, payload) {
    const decisions = Array.isArray(payload?.decisions)
      ? payload.decisions.filter(item => item?.status === 'approved')
      : [];
    if (!decisions.length) return Array.isArray(items) ? items : [];
    const byLink = new Map();
    const byId = new Map();
    decisions.forEach(decision => {
      const link = safeHttpUrl(decision.link);
      const id = text(decision.articleId);
      if (link) byLink.set(link, decision);
      if (id) byId.set(id, decision);
    });
    return (Array.isArray(items) ? items : []).map(article => {
      const decision = byId.get(article.id) || byLink.get(safeHttpUrl(article.link));
      if (!decision) return article;
      const primaryRegion = text(decision.primaryRegion) || article.primaryRegion;
      const primaryTopic = text(decision.primaryTopic) || article.primaryTopic;
      return {
        ...article,
        primaryRegion,
        primaryTopic,
        categories: [...new Set([
          ...(Array.isArray(article.categories) ? article.categories : []),
          primaryRegion,
          primaryTopic
        ].filter(Boolean))],
        correctionNote: text(decision.correctionNote) || article.correctionNote || '',
        editorialDecisionAt: text(decision.decidedAt),
        editorialDecisionId: text(decision.id)
      };
    });
  }

  function sourceFamily(value) {
    const normalized = text(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[([\{].*?[)\]}]/g, ' ')
      .replace(/\b(?:turkce|kurdi|kurdish|deutsch|german|english|francais|french|espanol|spanish|italiano|italian|portugues|portuguese|arabic|arabisch)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const aliases = [
      [/\bbianet\b/, 'bianet'],
      [/\bevrensel\b/, 'evrensel'],
      [/\b(?:znetwork|znet)\b/, 'znetwork'],
      [/\bbulatlat\b/, 'bulatlat'],
      [/\b(?:the )?anarchist librar(?:y|ies)\b/, 'anarchist-libraries'],
      [/\blibcom\b/, 'libcom'],
      [/\bindymedia\b/, 'indymedia'],
      [/\bcrimethinc\b/, 'crimethinc'],
      [/\bfreedom news\b/, 'freedom-news'],
      [/\bblack rose\b/, 'black-rose']
    ];
    const alias = aliases.find(([pattern]) => pattern.test(normalized));
    return alias?.[1] || normalized || 'unknown-source';
  }

  function editorialFacet(item, keys, fallback = '') {
    for (const key of keys) {
      const value = text(item?.[key]).toLocaleLowerCase();
      if (value) return value;
    }
    return text(fallback).toLocaleLowerCase();
  }

  function canonicalEditorialCountry(value) {
    const normalized = text(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const aliases = {
      tr:'turkey', tur:'turkey', turkey:'turkey', turkiye:'turkey',
      gb:'united-kingdom', gbr:'united-kingdom', uk:'united-kingdom', 'united-kingdom':'united-kingdom',
      us:'united-states', usa:'united-states', 'united-states':'united-states',
      de:'germany', deu:'germany', germany:'germany', deutschland:'germany',
      fr:'france', fra:'france', france:'france',
      es:'spain', esp:'spain', spain:'spain', espana:'spain',
      it:'italy', ita:'italy', italy:'italy', italia:'italy',
      gr:'greece', grc:'greece', greece:'greece',
      ph:'philippines', phl:'philippines', philippines:'philippines',
      br:'brazil', bra:'brazil', brazil:'brazil', brasil:'brazil'
    };
    return aliases[normalized] || normalized;
  }

  function editorialCountry(item, family) {
    const explicit = editorialFacet(item, [
      'originCountryCode', 'originCountry', 'countryCode', 'country'
    ]);
    if (explicit) return canonicalEditorialCountry(explicit);
    const knownSourceCountries = {
      bianet: 'turkey',
      evrensel: 'turkey',
      bulatlat: 'philippines',
      'freedom-news': 'united-kingdom',
      'black-rose': 'united-states'
    };
    return canonicalEditorialCountry(knownSourceCountries[family] || '');
  }

  function balanceEditorially(items, limit = 10, options = {}) {
    const source = Array.isArray(items) ? items.filter(Boolean) : [];
    const target = Math.max(0, Number(limit) || 0);
    if (!source.length || !target) return [];
    const maxPerFamily = Math.max(1, Number(options.maxPerFamily) || 2);
    const configuredCountryLimit = Number(options.maxPerCountry);
    const maxPerCountry = Number.isFinite(configuredCountryLimit) && configuredCountryLimit > 0
      ? Math.max(1, configuredCountryLimit)
      : Number.POSITIVE_INFINITY;
    const poolSize = Math.max(target, Number(options.poolSize) || Math.max(40, target * 6));
    const remaining = source.slice(0, poolSize).map((item, rank) => ({ item, rank }));
    const selected = [];
    const familyCounts = new Map();
    const countryCounts = new Map();
    const regionCounts = new Map();
    const topicCounts = new Map();

    while (remaining.length && selected.length < target) {
      const position = selected.length;
      let bestIndex = -1;
      let bestScore = Number.NEGATIVE_INFINITY;

      remaining.forEach((entry, index) => {
        const family = sourceFamily(entry.item?.source || entry.item?.quelleName);
        const familyCount = familyCounts.get(family) || 0;
        if (familyCount >= maxPerFamily) return;
        const country = editorialCountry(entry.item, family);
        if (country && (countryCounts.get(country) || 0) >= maxPerCountry) return;
        const region = editorialFacet(entry.item, ['primaryRegion', 'kontinent']);
        const topic = editorialFacet(entry.item, ['primaryTopic']);
        let score = -entry.rank * 2;

        if (familyCount) score -= position < 5 ? 240 : 55 * familyCount;
        if (country && countryCounts.has(country)) score -= position < 5 ? 65 : 18;
        if (region && regionCounts.has(region)) score -= position < 5 ? 30 : 9;
        if (topic && topicCounts.has(topic)) score -= position < 5 ? 18 : 6;

        const previous = selected[selected.length - 1];
        if (previous) {
          if (family === previous.family) score -= 500;
          if (country && country === previous.country) score -= 90;
          if (region && region === previous.region) score -= 35;
          if (topic && topic === previous.topic) score -= 20;
        }
        if (score > bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      });

      if (bestIndex < 0) break;
      const [{ item }] = remaining.splice(bestIndex, 1);
      const family = sourceFamily(item?.source || item?.quelleName);
      const country = editorialCountry(item, family);
      const region = editorialFacet(item, ['primaryRegion', 'kontinent']);
      const topic = editorialFacet(item, ['primaryTopic']);
      selected.push({ item, family, country, region, topic });
      familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
      if (country) countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
      if (region) regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
      if (topic) topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }

    if (selected.length < target) {
      const chosen = new Set(selected.map(entry => entry.item));
      source.forEach(item => {
        if (selected.length >= target || chosen.has(item)) return;
        const family = sourceFamily(item?.source || item?.quelleName);
        const country = editorialCountry(item, family);
        if ((familyCounts.get(family) || 0) >= maxPerFamily) return;
        if (country && (countryCounts.get(country) || 0) >= maxPerCountry) return;
        selected.push({ item, family, country });
        chosen.add(item);
        familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
        if (country) countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
      });
      source.forEach(item => {
        if (selected.length < target && !chosen.has(item)) {
          selected.push({ item });
          chosen.add(item);
        }
      });
    }
    return selected.slice(0, target).map(entry => entry.item);
  }

  function editorialQuality(items) {
    const rows = Array.isArray(items) ? items.filter(Boolean) : [];
    const families = rows.map(item => sourceFamily(item?.source || item?.quelleName));
    const regions = new Set(rows.map(item => editorialFacet(item, ['primaryRegion', 'kontinent'])).filter(Boolean));
    const topics = new Set(rows.map(item => editorialFacet(item, ['primaryTopic'])).filter(Boolean));
    const counts = new Map();
    let maxSourceStreak = 0;
    let currentStreak = 0;
    let previousFamily = '';
    families.forEach(family => {
      counts.set(family, (counts.get(family) || 0) + 1);
      currentStreak = family === previousFamily ? currentStreak + 1 : 1;
      maxSourceStreak = Math.max(maxSourceStreak, currentStreak);
      previousFamily = family;
    });
    const maxSourceCount = Math.max(0, ...counts.values());
    return {
      sampleSize: rows.length,
      uniqueSourceFamilies: counts.size,
      uniqueRegions: regions.size,
      uniqueTopics: topics.size,
      maxSourceStreak,
      maxSourceShare: rows.length ? maxSourceCount / rows.length : 0
    };
  }

  function matchesPreferences(article, preferences = {}) {
    const regions = new Set(preferences.regions || []);
    const topics = new Set(preferences.topics || []);
    const sources = new Set(preferences.sources || []);
    const blockedSources = new Set(preferences.blockedSources || []);

    if (blockedSources.has(article.source)) return false;
    if (!regions.size && !topics.size && !sources.size) return true;

    const articleTopics = new Set([
      article.primaryTopic,
      ...(article.secondaryTopics || []),
      ...(article.categories || [])
    ].filter(Boolean));

    return regions.has(article.primaryRegion)
      || sources.has(article.source)
      || [...topics].some(topic => articleTopics.has(topic));
  }

  function filterArticles(items, filters = {}) {
    const query = text(filters.query).toLocaleLowerCase();
    return (Array.isArray(items) ? items : []).filter(article => {
      if (filters.region && article.primaryRegion !== filters.region) return false;
      if (
        filters.topic
        && article.primaryTopic !== filters.topic
        && !(article.secondaryTopics || []).includes(filters.topic)
        && !(article.categories || []).includes(filters.topic)
      ) return false;
      if (filters.source && article.source !== filters.source) return false;
      if (!query) return true;
      return [
        article.title,
        article.intro,
        article.source,
        article.primaryRegion,
        article.primaryTopic
      ].join(' ').toLocaleLowerCase().includes(query);
    });
  }

  function collectFacets(items) {
    const regions = new Set();
    const topics = new Set();
    const sources = new Set();

    for (const article of Array.isArray(items) ? items : []) {
      if (article.primaryRegion) regions.add(article.primaryRegion);
      if (article.primaryTopic) topics.add(article.primaryTopic);
      for (const topic of article.secondaryTopics || []) topics.add(topic);
      if (article.source) sources.add(article.source);
    }

    return {
      regions: [...regions].sort((a, b) => a.localeCompare(b)),
      topics: [...topics].sort((a, b) => a.localeCompare(b)),
      sources: [...sources].sort((a, b) => a.localeCompare(b))
    };
  }

  function splitTranslatedTeaser(value) {
    const clean = text(value);
    const separators = [/\s*-{3,}\s*/, /\n\n+/];
    for (const separator of separators) {
      const parts = String(value || '').trim().split(separator);
      if (parts.length >= 2) {
        return {
          title: text(parts.shift()),
          intro: text(parts.join(' '))
        };
      }
    }
    return { title: clean, intro: '' };
  }

  function isVideoUrl(value) {
    const candidate = safeHttpUrl(value);
    if (!candidate) return '';
    try {
      const url = new URL(candidate);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      const path = url.pathname.toLowerCase();
      const youtube = host === 'youtu.be'
        || ((host === 'youtube.com' || host.endsWith('.youtube.com'))
          && (/^\/(?:watch|shorts|live|embed)\b/.test(path) || url.searchParams.has('v')));
      const vimeo = host === 'vimeo.com' || host.endsWith('.vimeo.com');
      const federated = host === 'kolektiva.media'
        || host.endsWith('.kolektiva.media')
        || host.includes('peertube');
      return youtube || vimeo || federated ? candidate : '';
    } catch {
      return '';
    }
  }

  function videoUrl(article) {
    const enclosure = typeof article?.enclosure === 'object' ? article.enclosure?.url : article?.enclosure;
    const direct = [article?.videoUrl, article?.mediaUrl, enclosure, article?.link];
    for (const value of direct) {
      const candidate = isVideoUrl(value);
      if (candidate) return candidate;
    }

    const embeddedText = [article?.content, article?.description, article?.summary]
      .filter(Boolean)
      .join(' ')
      .replace(/&amp;/gi, '&');
    const urls = embeddedText.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    for (const value of urls) {
      const candidate = isVideoUrl(value.replace(/[),.;!?]+$/g, ''));
      if (candidate) return candidate;
    }
    return '';
  }

  function hasVideo(article) {
    return Boolean(videoUrl(article));
  }

  function localizedGlossaryValue(value, language = 'en') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return text(value);
    return text(value[language] || value.en || value.de || Object.values(value)[0]);
  }

  function annotateGlossaryText(value, terms, language = 'en', limit = 12) {
    const source = String(value || '');
    if (!source || !Array.isArray(terms) || !terms.length) {
      return { segments: source ? [{ text: source, termId: '' }] : [], matchCount: 0 };
    }

    const isWordCharacter = character => Boolean(character && /[\p{L}\p{N}]/u.test(character));
    const candidates = [];
    const seen = new Set();
    terms.forEach(term => {
      const labels = [
        localizedGlossaryValue(term?.title, language),
        localizedGlossaryValue(term?.title, 'en'),
        localizedGlossaryValue(term?.title, 'de'),
        ...(term?.aliases?.[language] || []),
        ...(term?.aliases?.en || []),
        ...(term?.aliases?.de || [])
      ];
      labels.forEach(label => {
        const clean = text(label);
        const key = clean.toLocaleLowerCase(language);
        if (clean.length < 5 || seen.has(`${term?.id}|${key}`)) return;
        seen.add(`${term?.id}|${key}`);
        candidates.push({ termId: text(term?.id), label: clean, key });
      });
    });

    const haystack = source.toLocaleLowerCase(language);
    const matches = [];
    candidates.forEach(candidate => {
      let from = 0;
      while (from < haystack.length) {
        const start = haystack.indexOf(candidate.key, from);
        if (start < 0) break;
        const end = start + candidate.key.length;
        const boundaryBefore = start === 0 || !isWordCharacter(source[start - 1]);
        const boundaryAfter = end >= source.length || !isWordCharacter(source[end]);
        if (boundaryBefore && boundaryAfter) {
          matches.push({ start, end, termId: candidate.termId });
          break;
        }
        from = start + Math.max(1, candidate.key.length);
      }
    });

    const accepted = [];
    const usedTerms = new Set();
    matches
      .sort((left, right) => left.start - right.start || (right.end - right.start) - (left.end - left.start))
      .forEach(match => {
        if (accepted.length >= Math.max(0, Number(limit) || 0) || usedTerms.has(match.termId)) return;
        if (accepted.some(current => match.start < current.end && match.end > current.start)) return;
        accepted.push(match);
        usedTerms.add(match.termId);
      });

    if (!accepted.length) return { segments: [{ text: source, termId: '' }], matchCount: 0 };
    const segments = [];
    let cursor = 0;
    accepted.sort((left, right) => left.start - right.start).forEach(match => {
      if (match.start > cursor) segments.push({ text: source.slice(cursor, match.start), termId: '' });
      segments.push({ text: source.slice(match.start, match.end), termId: match.termId });
      cursor = match.end;
    });
    if (cursor < source.length) segments.push({ text: source.slice(cursor), termId: '' });
    return { segments, matchCount: accepted.length };
  }

  return {
    annotateGlossaryText,
    applyEditorialDecisions,
    articleContentParagraphs,
    articleContentMode,
    hasCompleteArticle,
    articleImageUrls,
    articleId,
    balanceEditorially,
    balanceBySource,
    collectFacets,
    canonicalEditorialCountry,
    dateValue,
    excerpt,
    filterArticles,
    hasVideo,
    isLeadEligible,
    videoUrl,
    matchesPreferences,
    normalizeArticle,
    normalizeArticles,
    normalizeContentBlocks,
    normalizeRegion,
    safeHttpUrl,
    safeImageUrl,
    sourceFamily,
    editorialQuality,
    splitTranslatedTeaser,
    stripHtml,
    stripHtmlPreserveBreaks,
    text
  };
});
