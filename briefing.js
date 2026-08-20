/* World Revolution News 1.7.3 – Briefing mit verbesserter Stimmenauswahl */
'use strict';

(() => {
  if (window.WRNBriefing) return;

  const SETTINGS_KEY = 'wrn_briefing_settings_v1';
  const HISTORY_KEY = 'wrn_briefing_history_v1';
  const FEEDBACK_KEY = 'wrn_briefing_feedback_v1';
  const AUDIO_KEY = 'wrn_briefing_audio_state_v1';
  const SCROLL_KEY = 'wrn_briefing_scroll_v1';
  const SETTINGS_VERSION = 1;
  const MAX_HISTORY = 7;
  const MAX_SOURCE_PER_BRIEFING = 2;

  const TOPICS = Object.freeze([
    'Labor Struggles', 'Antifascism', 'Antisexism', 'Queer-Feminism', 'Antiracism',
    'No Borders', 'Anticapitalism', 'Theory & Strategy', 'Anticolonialism',
    'Anti-Imperialism', 'Squatting & Housing', 'Demonstrations', 'Anti-Rep & Prisons',
    'Cyberactivism', 'No War', 'Animal Liberation', 'Eco-Anarchism',
    'Indigenous Struggles', 'Radical Health & Disability', 'Libraries'
  ]);

  const REGIONS = Object.freeze([
    'Global', 'Europe', 'Africa', 'North America', 'Latin America', 'Asia', 'Australia & NZ'
  ]);

  const LENGTH_COUNTS = Object.freeze({ short: 4, standard: 7, long: 10 });
  const SPEECH_TAGS = Object.freeze({
    de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT',
    pt: 'pt-PT', ru: 'ru-RU', el: 'el-GR', tr: 'tr-TR'
  });
  const WIZARD_TEXTS = Object.freeze({
    de: ['Themen & Regionen', 'Sprache & Länge', 'Anhören & erstellen', 'Zurück', 'Weiter', 'Erweiterte Einstellungen'],
    en: ['Topics & regions', 'Language & length', 'Listen & create', 'Back', 'Next', 'Advanced settings'],
    es: ['Temas y regiones', 'Idioma y duración', 'Escuchar y crear', 'Atrás', 'Siguiente', 'Ajustes avanzados'],
    fr: ['Thèmes et régions', 'Langue et longueur', 'Écouter et créer', 'Retour', 'Suivant', 'Réglages avancés'],
    it: ['Temi e regioni', 'Lingua e durata', 'Ascolta e crea', 'Indietro', 'Avanti', 'Impostazioni avanzate'],
    pt: ['Temas e regiões', 'Idioma e duração', 'Ouvir e criar', 'Voltar', 'Seguinte', 'Definições avançadas'],
    ru: ['Темы и регионы', 'Язык и объём', 'Прослушать и создать', 'Назад', 'Далее', 'Расширенные настройки'],
    el: ['Θέματα και περιοχές', 'Γλώσσα και έκταση', 'Ακρόαση και δημιουργία', 'Πίσω', 'Επόμενο', 'Προχωρημένες ρυθμίσεις'],
    tr: ['Konular ve bölgeler', 'Dil ve uzunluk', 'Dinle ve oluştur', 'Geri', 'İleri', 'Gelişmiş ayarlar']
  });

  const STOPWORDS = new Set([
    'the','and','for','with','from','that','this','into','over','after','against','about','their','they','are','was','were',
    'der','die','das','den','dem','des','und','mit','für','von','aus','auf','gegen','über','eine','einer','einem','einen','ist','sind',
    'les','des','une','pour','avec','dans','sur','contre','est','sont','del','los','las','una','para','con','por','contra','sono','della',
    'que','dos','das','uma','com','sem','это','для','как','что','και','των','για','ile','bir','bu','için'
  ]);

  let root = null;
  let active = false;
  let settingsOpen = false;
  let currentBriefing = null;
  let generatingPromise = null;
  let voices = [];
  let speechQueue = [];
  let speechIndex = 0;
  let speechStatus = 'stopped';
  let currentUtterance = null;
  let scrollTimer = null;
  let showOnlyNew = false;

  function i18n() {
    return window.WRNI18n;
  }

  function appLanguage() {
    return i18n()?.currentLanguage?.() || 'en';
  }

  function t(key, language = appLanguage(), vars = {}) {
    return i18n()?.t?.(`briefing.${key}`, language, vars) || key;
  }

  function safeJsonParse(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed === undefined || parsed === null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function loadLocal(key, fallback) {
    try {
      return safeJsonParse(localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function saveLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Could not save ${key}:`, error);
      return false;
    }
  }

  function removeLocal(key) {
    try { localStorage.removeItem(key); } catch {}
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function uniqueAllowed(values, allowed) {
    const allow = new Set(allowed);
    return [...new Set(Array.isArray(values) ? values.filter(value => allow.has(value)) : [])];
  }

  function normalizeSettings(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const topics = uniqueAllowed(raw.topics, TOPICS);
    const regions = uniqueAllowed(raw.regions, REGIONS);
    const language = i18n()?.normalizeLanguage?.(raw.language) || 'en';
    const length = Object.prototype.hasOwnProperty.call(LENGTH_COUNTS, raw.length) ? raw.length : 'standard';

    return {
      version: SETTINGS_VERSION,
      configured: Boolean(raw.configured && (topics.length || regions.length)),
      topics,
      regions,
      language,
      length,
      options: {
        events: raw.options?.events !== false,
        background: raw.options?.background !== false,
        connections: raw.options?.connections !== false,
        updates: raw.options?.updates !== false,
        avoidRead: raw.options?.avoidRead !== false
      },
      voices: raw.voices && typeof raw.voices === 'object' ? raw.voices : {},
      speechRate: clampNumber(raw.speechRate, 0.7, 1.6, 1),
      speechPitch: clampNumber(raw.speechPitch, 0.7, 1.4, 1),
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString()
    };
  }

  function getSettings() {
    return normalizeSettings(loadLocal(SETTINGS_KEY, null));
  }

  function saveSettings(settings) {
    const normalized = normalizeSettings({ ...settings, configured: true });
    if (!normalized?.configured) return null;
    normalized.updatedAt = new Date().toISOString();
    saveLocal(SETTINGS_KEY, normalized);
    return normalized;
  }

  function contentFingerprint(settings) {
    if (!settings) return '';
    return JSON.stringify({
      topics: [...settings.topics].sort(),
      regions: [...settings.regions].sort(),
      language: settings.language,
      length: settings.length,
      options: settings.options,
      feedback: loadFeedback()
    });
  }

  function loadHistory() {
    const history = loadLocal(HISTORY_KEY, []);
    if (!Array.isArray(history)) return [];
    return history
      .filter(item => item && typeof item === 'object' && item.date && item.fingerprint)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, MAX_HISTORY);
  }

  function saveBriefing(briefing) {
    const history = loadHistory().filter(item => item.date !== briefing.date || item.fingerprint !== briefing.fingerprint);
    history.unshift(briefing);
    saveLocal(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  }

  function loadFeedback() {
    const raw = loadLocal(FEEDBACK_KEY, {});
    return {
      topics: raw?.topics && typeof raw.topics === 'object' ? raw.topics : {},
      sources: raw?.sources && typeof raw.sources === 'object' ? raw.sources : {}
    };
  }

  function adjustFeedback(item, direction) {
    const feedback = loadFeedback();
    const delta = direction === 'more' ? 1 : -1;

    for (const topic of item.topicMatches || []) {
      feedback.topics[topic] = clampNumber((feedback.topics[topic] || 0) + delta, -3, 3, 0);
    }

    const sourceName = item.primarySource || item.sources?.[0]?.source;
    if (sourceName) {
      feedback.sources[sourceName] = clampNumber((feedback.sources[sourceName] || 0) + delta * 0.5, -3, 3, 0);
    }

    saveLocal(FEEDBACK_KEY, feedback);
    announce(t('feedbackSaved', currentBriefing?.language));
  }

  function reduceSource(sourceName) {
    if (!sourceName) return;
    const feedback = loadFeedback();
    feedback.sources[sourceName] = -3;
    saveLocal(FEEDBACK_KEY, feedback);
    announce(t('sourceHidden', currentBriefing?.language));
  }

  function articleKey(article) {
    try {
      return window.WRNReading?.articleKey?.(article)
        || String(article?.link || `${article?.quelleName || ''}::${article?.title || ''}::${article?.pubDate || ''}`);
    } catch {
      return String(article?.link || article?.title || '');
    }
  }

  function cleanText(value) {
    const text = String(value || '');
    const element = document.createElement('textarea');
    element.innerHTML = text;
    return element.value
      .replace(/<[^>]*>/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function articleDateMs(article) {
    const raw = article?.eventStart || article?.pubDate || article?.date;
    const value = raw ? new Date(raw).getTime() : 0;
    return Number.isFinite(value) ? value : 0;
  }

  function isEvent(article) {
    try {
      if (typeof isEventArticle === 'function') return Boolean(isEventArticle(article));
      return article?.type === 'event' || article?.kategorie === 'Radar';
    } catch {
      return article?.type === 'event';
    }
  }

  function matchesCategory(article, category) {
    try {
      return typeof articleMatchesCategory === 'function'
        ? Boolean(articleMatchesCategory(article, category))
        : false;
    } catch {
      return false;
    }
  }

  function sourceName(article) {
    return cleanText(article?.quelleName || article?.source || t('source', appLanguage()));
  }

  function isRead(article) {
    try { return Boolean(window.WRNReading?.isRead?.(article)); } catch { return false; }
  }

  function normalizedTitleTokens(title) {
    return cleanText(title)
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !STOPWORDS.has(token))
      .slice(0, 14);
  }

  function similarity(first, second) {
    const a = new Set(first);
    const b = new Set(second);
    if (!a.size || !b.size) return 0;
    let intersection = 0;
    for (const token of a) if (b.has(token)) intersection++;
    return intersection / (a.size + b.size - intersection);
  }

  function sentenceSummary(article, length) {
    const source = cleanText(article?.content || article?.description || article?.summary || article?.title || '');
    if (!source) return '';

    const summaryLength = length === 'long' ? 'detailed' : length === 'short' ? 'short' : 'standard';
    const sourceLanguage = i18n()?.normalizeLanguage?.(
      article?.language || article?.lang || article?.sourceLanguage || 'en'
    ) || 'en';

    const generated = window.WRNSummaryCore?.summarizeText?.(source, {
      title: cleanText(article?.title || ''),
      length: summaryLength,
      language: sourceLanguage
    });

    if (generated?.plainText) {
      const maximum = length === 'long' ? 720 : length === 'short' ? 300 : 500;
      const value = generated.plainText.trim();
      return value.length > maximum
        ? `${value.slice(0, maximum).replace(/\s+\S*$/, '')}…`
        : value;
    }

    const desiredSentences = length === 'long' ? 3 : length === 'short' ? 1 : 2;
    const sentences = source.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [source];
    return sentences.slice(0, desiredSentences).join(' ').trim();
  }

  function actualRegionMatches(article) {
    return REGIONS.filter(region => region !== 'Global' && matchesCategory(article, region));
  }

  function candidateFromArticle(article, settings, feedback, now) {
    if (!article || typeof article !== 'object') return null;

    const event = isEvent(article);
    if (event && !settings.options.events) return null;

    const topicMatches = settings.topics.filter(topic => matchesCategory(article, topic));
    const requestedRegions = settings.regions.filter(region => region !== 'Global');
    const regionMatches = requestedRegions.filter(region => matchesCategory(article, region));

    if (settings.topics.length && !topicMatches.length) return null;
    if (requestedRegions.length && !regionMatches.length) return null;

    const dateMs = articleDateMs(article);
    const ageDays = dateMs ? Math.max(0, (now - dateMs) / 86400000) : 12;
    const futureDays = event && dateMs ? (dateMs - now) / 86400000 : 0;

    if (!event && ageDays > 120) return null;
    if (event && futureDays < -1) return null;
    if (event && futureDays > 90) return null;

    const read = isRead(article);
    const source = sourceName(article);
    let score = Math.max(0, 12 - Math.min(ageDays, 24) * 0.45);
    score += topicMatches.length * 4.2;
    score += regionMatches.length * 3.2;
    if (settings.regions.includes('Global')) score += 1;
    if (settings.options.avoidRead && !read) score += 2.4;
    if (event) score += futureDays >= 0 && futureDays <= 14 ? 3 : 0.8;

    for (const topic of topicMatches) score += Number(feedback.topics?.[topic] || 0) * 1.4;
    score += Number(feedback.sources?.[source] || 0) * 1.1;

    return {
      article,
      key: articleKey(article),
      title: cleanText(article.title || 'Untitled'),
      summary: sentenceSummary(article, settings.length),
      dateMs,
      score,
      event,
      read,
      topicMatches,
      regionMatches: regionMatches.length ? regionMatches : actualRegionMatches(article),
      source,
      tokens: normalizedTitleTokens(article.title),
      ageDays,
      futureDays
    };
  }

  function clusterCandidates(candidates) {
    const clusters = [];

    for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
      const exact = clusters.find(cluster => cluster.items.some(item => item.key === candidate.key));
      if (exact) continue;

      const related = clusters.find(cluster => {
        const representative = cluster.items[0];
        const closeInTime = !representative.dateMs || !candidate.dateMs
          || Math.abs(representative.dateMs - candidate.dateMs) <= 7 * 86400000;
        return closeInTime && similarity(representative.tokens, candidate.tokens) >= 0.54;
      });

      if (related) related.items.push(candidate);
      else clusters.push({ items: [candidate] });
    }

    return clusters.map(cluster => {
      cluster.items.sort((a, b) => b.score - a.score);
      const primary = cluster.items[0];
      const sources = [];
      const seen = new Set();

      for (const item of cluster.items) {
        const sourceKey = `${item.source}::${item.key}`;
        if (seen.has(sourceKey)) continue;
        seen.add(sourceKey);
        sources.push({
          key: item.key,
          source: item.source,
          title: item.title,
          link: String(item.article?.link || '')
        });
      }

      return {
        ...primary,
        clusterSize: cluster.items.length,
        sources,
        primarySource: primary.source,
        score: primary.score + Math.min(3, cluster.items.length - 1) * 0.8
      };
    });
  }

  function selectDiverse(clusters, count) {
    const selected = [];
    const sourceCounts = new Map();

    for (const item of clusters.sort((a, b) => b.score - a.score)) {
      const countForSource = sourceCounts.get(item.primarySource) || 0;
      if (countForSource >= MAX_SOURCE_PER_BRIEFING && selected.length < count) continue;
      selected.push(item);
      sourceCounts.set(item.primarySource, countForSource + 1);
      if (selected.length >= count) break;
    }

    if (selected.length < count) {
      for (const item of clusters) {
        if (selected.includes(item)) continue;
        selected.push(item);
        if (selected.length >= count) break;
      }
    }

    return selected;
  }

  function itemContentSignature(item) {
    const text = [
      item?.title || '',
      item?.summary || '',
      ...(item?.sources || []).map(source => `${source.source || ''}:${source.title || ''}`)
    ].join('|');
    return window.WRNSummaryCore?.hashText?.(text)
      || String(text.length);
  }

  function previousItemMap(history, date) {
    const previous = history.find(item => item.date < date);
    const map = new Map();
    if (!previous) return map;

    for (const section of previous.sections || []) {
      for (const item of section.items || []) {
        if (!item?.key) continue;
        map.set(item.key, {
          signature: item.contentSignature || itemContentSignature(item),
          item
        });
      }
    }
    return map;
  }

  function connectionItem(items, settings) {
    if (!settings.options.connections) return null;

    for (let firstIndex = 0; firstIndex < items.length; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < items.length; secondIndex++) {
        const first = items[firstIndex];
        const second = items[secondIndex];
        const sharedTopics = first.topicMatches.filter(topic => second.topicMatches.includes(topic));
        const firstRegions = first.regionMatches || [];
        const secondRegions = second.regionMatches || [];
        const differentRegions = firstRegions.some(region => !secondRegions.includes(region))
          || secondRegions.some(region => !firstRegions.includes(region));

        if (!sharedTopics.length || !differentRegions) continue;

        return {
          key: `connection::${first.key}::${second.key}`,
          title: `${first.title} ↔ ${second.title}`,
          summary: '',
          topicMatches: sharedTopics,
          regionMatches: [...new Set([...firstRegions, ...secondRegions])],
          sources: [...first.sources, ...second.sources],
          connectionTitles: [first.title, second.title],
          primarySource: first.primarySource,
          score: 0,
          event: false,
          read: false,
          isConnection: true
        };
      }
    }
    return null;
  }

  function section(id, items) {
    return { id, items: items.filter(Boolean) };
  }

  function prepareBriefing(settings) {
    const data = (() => {
      try { return typeof allNewsData !== 'undefined' && Array.isArray(allNewsData) ? allNewsData : []; }
      catch { return []; }
    })();

    const now = Date.now();
    const feedback = loadFeedback();
    const candidates = data
      .map(article => candidateFromArticle(article, settings, feedback, now))
      .filter(Boolean);

    const eventClusters = clusterCandidates(candidates.filter(item => item.event));
    const newsClusters = clusterCandidates(candidates.filter(item => !item.event));
    newsClusters.forEach(item => { item.contentSignature = itemContentSignature(item); });

    const date = todayKey();
    const history = loadHistory();
    const previousMap = previousItemMap(history, date);

    const updatedCandidates = settings.options.updates
      ? newsClusters.filter(item => {
          const previous = previousMap.get(item.key);
          return previous && previous.signature !== item.contentSignature;
        })
      : [];

    const updateLimit = settings.length === 'long' ? 3 : settings.length === 'short' ? 1 : 2;
    const updates = selectDiverse(updatedCandidates, updateLimit);
    const updateKeys = new Set(updates.map(item => item.key));

    const desired = LENGTH_COUNTS[settings.length] || LENGTH_COUNTS.standard;
    const reserved = updates.length
      + (settings.options.events ? 1 : 0)
      + (settings.options.background ? 1 : 0);
    const mainCount = Math.max(2, desired - reserved);

    const selectedMain = selectDiverse(
      newsClusters.filter(item => item.ageDays <= 21 && !updateKeys.has(item.key)),
      mainCount
    );

    const selectedKeys = new Set([...updates, ...selectedMain].map(item => item.key));
    const underRadar = newsClusters.find(item => !selectedKeys.has(item.key) && item.sources.length === 1 && item.ageDays <= 14)
      || newsClusters.find(item => !selectedKeys.has(item.key) && item.ageDays <= 30);

    const eventItems = settings.options.events
      ? selectDiverse(eventClusters.filter(item => item.futureDays >= -0.5 && item.futureDays <= 45), settings.length === 'long' ? 3 : 2)
      : [];

    const background = settings.options.background
      ? newsClusters.find(item => !selectedKeys.has(item.key) && item.ageDays >= 7 && item.ageDays <= 120)
      : null;

    const connection = connectionItem([...updates, ...selectedMain], settings);

    const sections = [
      section('updates', updates),
      section('overview', selectedMain),
      section('underRadar', underRadar ? [underRadar] : []),
      section('connections', connection ? [connection] : []),
      section('events', eventItems),
      section('background', background ? [background] : [])
    ].filter(entry => entry.items.length);

    for (const currentSection of sections) {
      for (const item of currentSection.items) {
        const previous = previousMap.get(item.key);
        item.contentSignature = item.contentSignature || itemContentSignature(item);
        item.isNew = !previous;
        item.isUpdated = Boolean(previous && previous.signature !== item.contentSignature);
      }
    }

    return {
      version: 2,
      date,
      language: settings.language,
      fingerprint: contentFingerprint(settings),
      generatedAt: new Date().toISOString(),
      sections,
      translationFallback: false,
      offline: navigator.onLine === false,
      settingsSnapshot: {
        topics: settings.topics,
        regions: settings.regions,
        language: settings.language,
        length: settings.length,
        options: settings.options
      }
    };
  }

  function parseTranslation(value, fallbackTitle, fallbackSummary) {
    const clean = typeof cleanTranslationOutput === 'function'
      ? cleanTranslationOutput(value)
      : cleanText(value);
    const parts = String(clean || '').split('---');
    if (parts.length >= 2) {
      return {
        title: parts.shift().trim() || fallbackTitle,
        summary: parts.join('---').trim() || fallbackSummary
      };
    }
    return { title: fallbackTitle, summary: clean || fallbackSummary };
  }

  function shouldTranslate(item, targetLanguage) {
    if (item.isConnection) return false;
    const raw = item.article?.language || item.article?.lang || item.article?.sourceLanguage || '';
    const sourceLanguage = raw ? i18n()?.normalizeLanguage?.(raw) : '';
    if (sourceLanguage && sourceLanguage === targetLanguage) return false;
    if (!sourceLanguage && targetLanguage === 'en') return false;
    return Boolean(item.title || item.summary);
  }

  async function translateItem(item, targetLanguage) {
    if (!shouldTranslate(item, targetLanguage)) return item;

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);
      const clientId = typeof getClientId === 'function' ? getClientId() : 'wrn-briefing';
      const proxy = typeof PROXY_URL !== 'undefined'
        ? PROXY_URL
        : window.WRN_CONFIG?.proxyUrl;

      if (!proxy) return { ...item, translationFailed: true };

      const response = await fetch(proxy, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': clientId
        },
        body: JSON.stringify({
          action: 'translate',
          targetLanguage,
          mode: 'title_and_text',
          title: String(item.title || '').slice(0, 500),
          text: String(item.summary || '').slice(0, 2200)
        }),
        signal: controller.signal
      });
      window.clearTimeout(timeout);

      const raw = await response.text();
      let data = raw;
      try { data = JSON.parse(raw); } catch {}
      const translatedText = typeof extractTranslationText === 'function'
        ? extractTranslationText(data)
        : (data?.text || data?.translation || data?.translatedText || raw);

      if (!response.ok || !translatedText) return { ...item, translationFailed: true };
      const parsed = parseTranslation(translatedText, item.title, item.summary);
      return { ...item, title: parsed.title, summary: parsed.summary, translated: true };
    } catch (error) {
      console.warn('Briefing translation failed:', error);
      return { ...item, translationFailed: true };
    }
  }

  async function translateBriefing(briefing) {
    const allItems = briefing.sections.flatMap(entry => entry.items).filter(item => !item.isConnection);
    if (!allItems.length) return briefing;

    let cursor = 0;
    const translatedByKey = new Map();
    const workers = Array.from({ length: Math.min(2, allItems.length) }, async () => {
      while (cursor < allItems.length) {
        const index = cursor++;
        const item = allItems[index];
        translatedByKey.set(item.key, await translateItem(item, briefing.language));
      }
    });
    await Promise.all(workers);

    let fallback = false;
    const sections = briefing.sections.map(entry => ({
      ...entry,
      items: entry.items.map(item => {
        if (item.isConnection) {
          const translatedSources = item.sources.map(source => translatedByKey.get(source.key));
          const titles = translatedSources.filter(Boolean).map(source => source.title);
          return titles.length >= 2 ? { ...item, title: `${titles[0]} ↔ ${titles[1]}` } : item;
        }
        const translated = translatedByKey.get(item.key) || item;
        if (translated.translationFailed) fallback = true;
        return translated;
      })
    }));

    return { ...briefing, sections, translationFallback: fallback };
  }

  function briefingWordCount(briefing) {
    return briefing.sections.reduce((total, entry) => total + entry.items.reduce((sum, item) => {
      return sum + `${item.title} ${item.summary || ''}`.trim().split(/\s+/).filter(Boolean).length;
    }, 0), 0);
  }

  function readMinutes(briefing) {
    return Math.max(1, Math.ceil(briefingWordCount(briefing) / 220));
  }

  function listenMinutes(briefing) {
    return Math.max(1, Math.ceil(briefingWordCount(briefing) / 150));
  }

  function getCachedToday(settings) {
    const fingerprint = contentFingerprint(settings);
    return loadHistory().find(item => item.date === todayKey() && item.fingerprint === fingerprint) || null;
  }

  function hasData() {
    try { return typeof allNewsData !== 'undefined' && Array.isArray(allNewsData) && allNewsData.length > 0; }
    catch { return false; }
  }

  async function waitForData(timeoutMs = 12000) {
    const started = Date.now();
    while (!hasData() && Date.now() - started < timeoutMs) {
      await new Promise(resolve => window.setTimeout(resolve, 120));
    }
    return hasData();
  }

  async function ensureDailyBriefing({ force = false } = {}) {
    const settings = getSettings();
    if (!settings?.configured) {
      currentBriefing = null;
      if (active) render();
      return null;
    }

    if (!force) {
      const cached = getCachedToday(settings);
      if (cached) {
        currentBriefing = cached;
        if (active) render();
        return cached;
      }
    }

    if (generatingPromise) return generatingPromise;

    generatingPromise = (async () => {
      setLoading(true, 'loading');
      const available = await waitForData();
      if (!available) {
        const history = loadHistory();
        currentBriefing = history[0] || null;
        setLoading(false);
        if (active) render();
        return currentBriefing;
      }

      let briefing = prepareBriefing(settings);
      if (briefing.sections.some(entry => entry.items.length)) {
        setLoading(true, 'loadingTranslation');
        briefing = await translateBriefing(briefing);
      }

      saveBriefing(briefing);
      currentBriefing = briefing;
      setLoading(false);
      if (active) render();
      return briefing;
    })().finally(() => {
      generatingPromise = null;
    });

    return generatingPromise;
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function button(className, text, onClick) {
    const element = createElement('button', className, text);
    element.type = 'button';
    if (onClick) element.addEventListener('click', onClick);
    return element;
  }

  function announce(message) {
    const live = root?.querySelector('.wrn-briefing-live');
    if (live) live.textContent = message;
  }

  function ensureRoot() {
    if (root?.isConnected) return root;
    root = document.getElementById('wrn-briefing-view');
    if (root) return root;

    root = createElement('main', 'wrn-briefing-view');
    root.id = 'wrn-briefing-view';
    root.hidden = true;
    root.setAttribute('aria-label', t('title'));
    root.addEventListener('scroll', () => {
      if (!currentBriefing) return;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const positions = loadLocal(SCROLL_KEY, {});
        positions[currentBriefing.date] = root.scrollTop;
        saveLocal(SCROLL_KEY, positions);
      }, 220);
    }, { passive: true });

    const feed = document.getElementById('feed-container');
    if (feed?.parentNode) feed.parentNode.insertBefore(root, feed);
    else document.body.appendChild(root);
    return root;
  }

  function renderTopbar(container, language, settings) {
    const topbar = createElement('div', 'wrn-briefing-topbar');
    const headingWrap = createElement('div', 'wrn-briefing-heading-wrap');
    const title = createElement('h2', 'wrn-briefing-title', t('title', language));
    const date = createElement('div', 'wrn-briefing-date', currentBriefing
      ? new Intl.DateTimeFormat(language, { dateStyle: 'full' }).format(new Date(`${currentBriefing.date}T12:00:00`))
      : t('today', language));
    headingWrap.append(title, date);

    const actions = createElement('div', 'wrn-briefing-top-actions');
    if (settings?.configured) {
      const history = loadHistory();
      if (history.length > 1) {
        const select = createElement('select', 'wrn-briefing-history');
        select.setAttribute('aria-label', t('history', language));
        history.forEach(item => {
          const option = document.createElement('option');
          option.value = item.date;
          option.textContent = item.date === todayKey()
            ? t('today', language)
            : new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${item.date}T12:00:00`));
          option.selected = item.date === currentBriefing?.date;
          select.appendChild(option);
        });
        select.addEventListener('change', () => {
          currentBriefing = history.find(item => item.date === select.value) || currentBriefing;
          stopSpeech();
          render();
        });
        actions.appendChild(select);
      }

      const settingsButton = button('wrn-briefing-settings-toggle', '⚙', () => {
        settingsOpen = !settingsOpen;
        render();
      });
      settingsButton.title = t('settings', language);
      settingsButton.setAttribute('aria-label', t('settings', language));
      settingsButton.setAttribute('aria-expanded', String(settingsOpen));
      actions.appendChild(settingsButton);
    }

    topbar.append(headingWrap, actions);
    container.appendChild(topbar);
  }

  function chipGroup(titleText, values, selected, labelFunction, name) {
    const fieldset = createElement('fieldset', 'wrn-briefing-fieldset');
    const legend = createElement('legend', '', titleText);
    const chips = createElement('div', 'wrn-briefing-chips');

    values.forEach(value => {
      const label = createElement('label', 'wrn-briefing-chip');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = name;
      input.value = value;
      input.checked = selected.includes(value);
      const span = createElement('span', '', labelFunction(value));
      label.append(input, span);
      chips.appendChild(label);
    });

    fieldset.append(legend, chips);
    return fieldset;
  }

  function selectField(labelText, name, options, selectedValue) {
    const label = createElement('label', 'wrn-briefing-select-field');
    const span = createElement('span', '', labelText);
    const select = document.createElement('select');
    select.name = name;
    options.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      option.selected = value === selectedValue;
      select.appendChild(option);
    });
    label.append(span, select);
    return label;
  }

  function toggleField(labelText, name, checked) {
    const label = createElement('label', 'wrn-briefing-toggle');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = name;
    input.checked = checked;
    label.append(input, createElement('span', '', labelText));
    return label;
  }

  function currentVoiceOptions(language, selectedName) {
    refreshVoices();
    const tag = SPEECH_TAGS[language] || language;
    const prefix = tag.split('-')[0].toLowerCase();
    const matching = window.WRNVoiceTools?.ranked?.(tag)
      || voices
        .filter(voice => String(voice.lang || '').toLowerCase().startsWith(prefix))
        .sort((a, b) => Number(b.localService) - Number(a.localService) || Number(b.default) - Number(a.default));

    const options = matching.map(voice => [
      voice.name,
      window.WRNVoiceTools?.label?.(voice, language)
        || `${voice.name} · ${voice.lang}${voice.localService ? ' · local' : ' · online'}`
    ]);

    if (!options.length) options.push(['', t('noVoice', language)]);
    return {
      options,
      selected: matching.some(voice => voice.name === selectedName)
        ? selectedName
        : (matching[0]?.name || '')
    };
  }

  function previewSelectedVoice(briefingLanguage, selectedName, rate = 1, pitch = 1) {
    const tag = SPEECH_TAGS[briefingLanguage] || briefingLanguage;
    const sample = t('voicePreviewText', briefingLanguage);
    return window.WRNVoiceTools?.preview?.(selectedName, tag, sample, { rate, pitch }) || false;
  }

  function renderSettings(container, language, existing) {
    const settings = existing || {
      topics: [], regions: [], language: appLanguage(), length: 'standard',
      options: { events: true, background: true, connections: true, updates: true, avoidRead: true },
      voices: {}, speechRate: 1, speechPitch: 1
    };

    const panel = createElement('section', 'wrn-briefing-settings-panel');
    panel.hidden = Boolean(existing?.configured && !settingsOpen);
    const title = createElement('h3', '', t('setupTitle', language));
    const intro = createElement('p', 'wrn-briefing-intro', t('setupIntro', language));
    const privacy = createElement('p', 'wrn-briefing-privacy', `🔒 ${t('personalizationPrivate', language)}`);
    const form = document.createElement('form');
    form.className = 'wrn-briefing-form';
    const wizardText = WIZARD_TEXTS[language] || WIZARD_TEXTS.en;
    let wizardStep = 1;
    const progress = createElement('ol', 'wrn-briefing-wizard-progress-185');
    wizardText.slice(0, 3).forEach((label, index) => {
      const item = createElement('li', '', label);
      item.dataset.step = String(index + 1);
      progress.appendChild(item);
    });
    form.appendChild(progress);

    const stepOne = createElement('section', 'wrn-briefing-wizard-step-185');
    stepOne.dataset.step = '1';
    stepOne.append(
      chipGroup(
        t('topicsQuestion', language), TOPICS, settings.topics,
        value => i18n()?.topicLabel?.(value, language) || value, 'topics'
      ),
      chipGroup(
        t('regionsQuestion', language), REGIONS, settings.regions,
        value => i18n()?.regionLabel?.(value, language) || value, 'regions'
      )
    );

    const languageOptions = i18n()?.supportedLanguages?.map(code => [code, i18n().languageLabels[code]]) || [['en', 'English']];
    const lengthOptions = [
      ['short', t('short', language)], ['standard', t('standard', language)], ['long', t('long', language)]
    ];
    const row = createElement('div', 'wrn-briefing-form-row');
    const languageField = selectField(t('language', language), 'language', languageOptions, settings.language);
    const lengthField = selectField(t('length', language), 'length', lengthOptions, settings.length);
    row.append(languageField, lengthField);
    const stepTwo = createElement('section', 'wrn-briefing-wizard-step-185');
    stepTwo.dataset.step = '2';
    stepTwo.appendChild(row);

    const optionsFieldset = createElement('fieldset', 'wrn-briefing-fieldset wrn-briefing-options');
    optionsFieldset.appendChild(createElement('legend', '', t('includeTitle', language)));
    optionsFieldset.append(
      toggleField(t('includeEvents', language), 'events', settings.options.events),
      toggleField(t('includeBackground', language), 'background', settings.options.background),
      toggleField(t('includeConnections', language), 'connections', settings.options.connections),
      toggleField(t('includeUpdates', language), 'updates', settings.options.updates),
      toggleField(t('avoidRead', language), 'avoidRead', settings.options.avoidRead)
    );
    const advanced = document.createElement('details');
    advanced.className = 'wrn-briefing-advanced-185';
    const advancedSummary = document.createElement('summary');
    advancedSummary.textContent = wizardText[5];
    advanced.append(advancedSummary, optionsFieldset);
    stepTwo.appendChild(advanced);

    const stepThree = createElement('section', 'wrn-briefing-wizard-step-185');
    stepThree.dataset.step = '3';
    const speech = createElement('fieldset', 'wrn-briefing-fieldset wrn-briefing-speech-settings');
    speech.appendChild(createElement('legend', '', t('listen', language)));
    const voiceState = currentVoiceOptions(settings.language, settings.voices?.[settings.language]);
    const voiceField = selectField(t('voice', language), 'voice', voiceState.options, voiceState.selected);
    const rateField = selectField(t('speed', language), 'speechRate', [
      ['0.8', '0.8×'], ['0.9', '0.9×'], ['1', '1.0×'], ['1.1', '1.1×'], ['1.25', '1.25×'], ['1.4', '1.4×']
    ], String(settings.speechRate));
    const pitchField = selectField(t('pitch', language), 'speechPitch', [
      ['0.8', '0.8'], ['0.9', '0.9'], ['1', '1.0'], ['1.1', '1.1'], ['1.2', '1.2']
    ], String(settings.speechPitch));
    const speechRow = createElement('div', 'wrn-briefing-form-row');
    const previewButton = button('wrn-briefing-voice-preview', `▶ ${t('voicePreview', language)}`, () => {
      previewSelectedVoice(
        languageField.querySelector('select')?.value || settings.language,
        voiceField.querySelector('select')?.value || '',
        rateField.querySelector('select')?.value || 1,
        pitchField.querySelector('select')?.value || 1
      );
    });
    speechRow.append(voiceField, rateField, pitchField, previewButton);
    speech.append(
      speechRow,
      createElement('p', 'wrn-briefing-note', t('deviceVoiceNote', language)),
      createElement('p', 'wrn-briefing-note wrn-briefing-voice-note', t('voiceQualityNote', language))
    );
    stepThree.appendChild(speech);

    const message = createElement('div', 'wrn-briefing-form-message');
    message.setAttribute('role', 'alert');
    const formActions = createElement('div', 'wrn-briefing-form-actions');
    const submit = button('wrn-briefing-primary', existing?.configured ? t('update', language) : t('create', language));
    submit.type = 'submit';
    formActions.appendChild(submit);

    if (existing?.configured) {
      formActions.append(
        button('wrn-briefing-secondary', t('close', language), () => {
          settingsOpen = false;
          render();
        }),
        button('wrn-briefing-danger', t('reset', language), resetBriefing)
      );
    }

    const transfer = createElement('div', 'wrn-briefing-transfer');
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json,.json';
    importInput.hidden = true;
    importInput.addEventListener('change', () => importSettingsFile(importInput.files?.[0]));
    transfer.append(
      button('wrn-briefing-link-button', t('exportSettings', language), exportSettings),
      button('wrn-briefing-link-button', t('importSettings', language), () => importInput.click()),
      importInput
    );

    stepThree.append(message, formActions, transfer);
    form.append(stepOne, stepTwo, stepThree);

    const setWizardStep = value => {
      wizardStep = Math.min(3, Math.max(1, Number(value) || 1));
      form.querySelectorAll('.wrn-briefing-wizard-step-185').forEach(section => {
        section.hidden = Number(section.dataset.step) !== wizardStep;
      });
      progress.querySelectorAll('li').forEach(item => {
        const itemStep = Number(item.dataset.step);
        item.classList.toggle('active', itemStep === wizardStep);
        item.classList.toggle('done', itemStep < wizardStep);
        item.setAttribute('aria-current', itemStep === wizardStep ? 'step' : 'false');
      });
    };
    const navigation = (step, includeBack, includeNext) => {
      const nav = createElement('div', 'wrn-briefing-wizard-nav-185');
      if (includeBack) nav.appendChild(button('wrn-briefing-secondary', `← ${wizardText[3]}`, () => setWizardStep(step - 1)));
      if (includeNext) nav.appendChild(button('wrn-briefing-primary', `${wizardText[4]} →`, () => {
        if (step === 1) {
          const selected = form.querySelectorAll('input[name="topics"]:checked, input[name="regions"]:checked');
          if (!selected.length) {
            message.textContent = t('noneSelected', language);
            return;
          }
        }
        message.textContent = '';
        setWizardStep(step + 1);
      }));
      return nav;
    };
    stepOne.appendChild(navigation(1, false, true));
    stepTwo.appendChild(navigation(2, true, true));
    stepThree.insertBefore(navigation(3, true, false), message);
    setWizardStep(1);

    const languageSelect = languageField.querySelector('select');
    languageSelect.addEventListener('change', () => {
      const selectedLanguage = languageSelect.value;
      const voiceSelect = voiceField.querySelector('select');
      const nextVoices = currentVoiceOptions(selectedLanguage, settings.voices?.[selectedLanguage]);
      voiceSelect.textContent = '';
      nextVoices.options.forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        voiceSelect.appendChild(option);
      });
      voiceSelect.value = nextVoices.selected;
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(form);
      const topics = data.getAll('topics');
      const regions = data.getAll('regions');
      if (!topics.length && !regions.length) {
        message.textContent = t('noneSelected', language);
        return;
      }

      const briefingLanguage = i18n()?.normalizeLanguage?.(data.get('language')) || 'en';
      const next = saveSettings({
        ...settings,
        configured: true,
        topics,
        regions,
        language: briefingLanguage,
        length: data.get('length'),
        options: {
          events: data.has('events'), background: data.has('background'),
          connections: data.has('connections'), updates: data.has('updates'), avoidRead: data.has('avoidRead')
        },
        voices: { ...settings.voices, [briefingLanguage]: data.get('voice') || '' },
        speechRate: data.get('speechRate'),
        speechPitch: data.get('speechPitch')
      });

      if (!next) {
        message.textContent = t('noneSelected', language);
        return;
      }

      settingsOpen = false;
      currentBriefing = null;
      announce(t('settingsSaved', language));
      await ensureDailyBriefing({ force: true });
    });

    panel.append(title, intro, privacy, form);
    container.appendChild(panel);
  }

  function reasonLabels(item, language) {
    const labels = [];
    if (item.topicMatches?.length) {
      labels.push(`${t('reasonTopic', language)}: ${item.topicMatches.map(topic => i18n()?.topicLabel?.(topic, language) || topic).join(', ')}`);
    }
    if (item.regionMatches?.length) {
      labels.push(`${t('reasonRegion', language)}: ${item.regionMatches.map(region => i18n()?.regionLabel?.(region, language) || region).join(', ')}`);
    }
    if (!item.read) labels.push(t('reasonUnread', language));
    if (item.event) labels.push(t('reasonEvent', language));
    return labels;
  }

  function renderSources(container, item, language) {
    const sources = createElement('div', 'wrn-briefing-sources');
    const label = createElement('strong', '', `${t('sources', language)}:`);
    sources.appendChild(label);

    item.sources?.forEach(source => {
      const sourceButton = button('wrn-briefing-source', source.source || t('source', language), () => {
        if (typeof window.WRNOpenArticleByKey === 'function') {
          window.WRNOpenArticleByKey(source.key);
        }
      });
      sourceButton.title = `${t('openArticle', language)}: ${source.title}`;
      sources.appendChild(sourceButton);
    });

    container.appendChild(sources);
  }

  function renderItem(item, language) {
    const article = createElement('article', 'wrn-briefing-item');
    article.dataset.articleKey = item.key;
    const head = createElement('div', 'wrn-briefing-item-head');
    const title = createElement('h4', '', item.title);
    head.appendChild(title);
    if (item.isUpdated) head.appendChild(createElement('span', 'wrn-briefing-new wrn-briefing-updated', t('updatedLabel', language)));
    else if (item.isNew) head.appendChild(createElement('span', 'wrn-briefing-new', t('newLabel', language)));
    article.appendChild(head);

    if (item.summary) article.appendChild(createElement('p', 'wrn-briefing-summary', item.summary));

    const reasons = reasonLabels(item, language);
    if (reasons.length) {
      const reason = createElement('details', 'wrn-briefing-reason');
      reason.appendChild(createElement('summary', '', t('why', language)));
      const list = document.createElement('ul');
      reasons.forEach(value => list.appendChild(createElement('li', '', value)));
      reason.appendChild(list);
      article.appendChild(reason);
    }

    renderSources(article, item, language);

    const actions = createElement('div', 'wrn-briefing-item-actions');
    actions.append(
      button('wrn-briefing-feedback', `＋ ${t('more', language)}`, () => adjustFeedback(item, 'more')),
      button('wrn-briefing-feedback', `− ${t('less', language)}`, () => adjustFeedback(item, 'less'))
    );
    if (item.primarySource) {
      actions.appendChild(button('wrn-briefing-feedback', t('hideSource', language), () => reduceSource(item.primarySource)));
    }
    article.appendChild(actions);
    return article;
  }

  function renderSpeechControls(container, briefing, settings, language) {
    const controls = createElement('section', 'wrn-briefing-audio-controls');
    const top = createElement('div', 'wrn-briefing-audio-buttons');
    const playLabel = speechStatus === 'paused' ? t('resume', language) : t('listen', language);
    top.append(
      button('wrn-briefing-primary wrn-briefing-play', `▶ ${playLabel}`, () => startOrResumeSpeech()),
      button('wrn-briefing-secondary', `Ⅱ ${t('pause', language)}`, pauseSpeech),
      button('wrn-briefing-secondary', `■ ${t('stop', language)}`, stopSpeech)
    );

    const voiceState = currentVoiceOptions(briefing.language, settings.voices?.[briefing.language]);
    const row = createElement('div', 'wrn-briefing-audio-options');
    const voiceField = selectField(t('voice', language), 'audioVoice', voiceState.options, voiceState.selected);
    const voiceSelect = voiceField.querySelector('select');
    voiceSelect.addEventListener('change', () => {
      const next = getSettings();
      if (!next) return;
      next.voices[briefing.language] = voiceSelect.value;
      saveSettings(next);
    });
    row.append(
      voiceField,
      button('wrn-briefing-voice-preview', `▶ ${t('voicePreview', language)}`, () => {
        previewSelectedVoice(
          briefing.language,
          voiceSelect.value,
          settings.speechRate,
          settings.speechPitch
        );
      })
    );

    const progress = createElement('div', 'wrn-briefing-audio-progress');
    const saved = loadLocal(AUDIO_KEY, {});
    const queueLength = buildSpeechQueue(briefing, language).length;
    const current = saved.date === briefing.date ? Number(saved.index || 0) : 0;
    progress.textContent = queueLength ? `${Math.min(current + 1, queueLength)} / ${queueLength}` : '';

    controls.append(top, row, progress, createElement('p', 'wrn-briefing-note', t('deviceVoiceNote', language)));
    container.appendChild(controls);
  }

  function briefingStats(briefing) {
    const items = (briefing.sections || []).flatMap(entry => entry.items || []);
    const realItems = items.filter(item => !item.isConnection);
    const sources = new Set();
    const regions = new Set();
    const topics = new Set();

    realItems.forEach(item => {
      (item.sources || []).forEach(source => { if (source.source) sources.add(source.source); });
      (item.regionMatches || []).forEach(region => regions.add(region));
      (item.topicMatches || []).forEach(topic => topics.add(topic));
    });

    return {
      newCount: realItems.filter(item => item.isNew).length,
      updatedCount: realItems.filter(item => item.isUpdated).length,
      sourceCount: sources.size,
      regionCount: regions.size,
      topicCount: topics.size
    };
  }

  function renderBriefingStats(container, briefing, language) {
    const stats = briefingStats(briefing);
    const section = createElement('section', 'wrn-briefing-stats');
    section.setAttribute('aria-label', t('briefingStats', language));

    [
      [stats.newCount, t('newCount', language), 'new'],
      [stats.updatedCount, t('updatedCount', language), 'updated'],
      [stats.sourceCount, t('sourceCount', language), 'sources'],
      [stats.regionCount, t('regionCount', language), 'regions'],
      [stats.topicCount, t('topicCount', language), 'topics']
    ].forEach(([value, label, key]) => {
      const card = createElement('div', `wrn-briefing-stat wrn-briefing-stat-${key}`);
      card.append(
        createElement('strong', '', String(value)),
        createElement('span', '', label)
      );
      section.appendChild(card);
    });

    container.appendChild(section);
    container.appendChild(createElement('p', 'wrn-briefing-summary-privacy', `🔒 ${t('summaryPrivacy', language)}`));
  }

  function renderBriefingContent(container, briefing, settings) {
    const language = briefing.language;
    const meta = createElement('div', 'wrn-briefing-meta');
    const created = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(briefing.generatedAt));
    meta.append(
      createElement('span', '', `${t('readTime', language)}: ${readMinutes(briefing)} min`),
      createElement('span', '', `${t('listenTime', language)}: ${listenMinutes(briefing)} min`),
      createElement('span', '', `${t('generatedAt', language)}: ${created}`)
    );
    if (briefing.offline) meta.appendChild(createElement('span', 'wrn-briefing-offline', t('offline', language)));
    if (briefing.date !== todayKey()) {
      const staleDate = new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${briefing.date}T12:00:00`));
      meta.appendChild(createElement('span', 'wrn-briefing-offline', `${t('stale', language)} ${staleDate}`));
    }
    container.appendChild(meta);
    renderBriefingStats(container, briefing, language);

    const actions = createElement('div', 'wrn-briefing-main-actions');
    actions.append(
      button('wrn-briefing-primary', `▶ ${t('listen', language)}`, startOrResumeSpeech),
      button('wrn-briefing-secondary', `↻ ${t('update', language)}`, () => ensureDailyBriefing({ force: true })),
      button('wrn-briefing-secondary', `↗ ${t('share', language)}`, shareBriefing),
      button('wrn-briefing-secondary', showOnlyNew ? t('showAll', language) : t('onlyNew', language), () => {
        showOnlyNew = !showOnlyNew;
        render();
      })
    );
    container.appendChild(actions);

    renderSpeechControls(container, briefing, settings, language);

    if (briefing.translationFallback) {
      container.appendChild(createElement('p', 'wrn-briefing-warning', t('translationFallback', language)));
    }

    if (!briefing.sections.length) {
      container.appendChild(createElement('div', 'wrn-briefing-empty', t('empty', language)));
      return;
    }

    let visibleItems = 0;
    for (const entry of briefing.sections) {
      const items = showOnlyNew
        ? entry.items.filter(item => item.isNew || item.isUpdated)
        : entry.items;
      if (!items.length) continue;

      const sectionElement = createElement('section', `wrn-briefing-section wrn-briefing-section-${entry.id}`);
      sectionElement.appendChild(createElement('h3', '', t(entry.id, language)));
      items.forEach(item => sectionElement.appendChild(renderItem(item, language)));
      visibleItems += items.length;
      container.appendChild(sectionElement);
    }

    if (showOnlyNew && visibleItems === 0) {
      container.appendChild(createElement('div', 'wrn-briefing-empty wrn-briefing-no-new', t('noNew', language)));
    }

    container.appendChild(createElement('p', 'wrn-briefing-refresh-note', t('refreshOnceDaily', language)));
  }

  function renderLoading(container, language) {
    const loading = createElement('div', 'wrn-briefing-loading');
    const spinner = createElement('div', 'wrn-briefing-spinner');
    const text = createElement('p', '', t(root?.dataset.loadingKey || 'loading', language));
    loading.append(spinner, text);
    container.appendChild(loading);
  }

  function setLoading(value, key = 'loading') {
    ensureRoot();
    root.dataset.loading = value ? 'true' : 'false';
    root.dataset.loadingKey = key;
    if (active) render();
  }

  function render() {
    const view = ensureRoot();
    const settings = getSettings();
    const language = settings?.language || appLanguage();
    view.textContent = '';
    view.setAttribute('lang', language);
    view.setAttribute('aria-label', t('title', language));

    const live = createElement('div', 'wrn-briefing-live');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('role', 'status');
    view.appendChild(live);

    renderTopbar(view, language, settings);

    if (!settings?.configured) {
      settingsOpen = true;
      renderSettings(view, appLanguage(), null);
      view.appendChild(createElement('div', 'wrn-briefing-empty', t('noPersonalization', appLanguage())));
      return;
    }

    renderSettings(view, language, settings);

    if (view.dataset.loading === 'true') {
      renderLoading(view, language);
      return;
    }

    if (!currentBriefing) {
      const cached = getCachedToday(settings) || loadHistory()[0] || null;
      currentBriefing = cached;
    }

    if (currentBriefing) renderBriefingContent(view, currentBriefing, settings);
    else renderLoading(view, language);

    window.dispatchEvent(new CustomEvent('wrn-briefing-rendered', {
      detail: {
        view,
        briefing: currentBriefing,
        settings
      }
    }));

    window.requestAnimationFrame(() => {
      const positions = loadLocal(SCROLL_KEY, {});
      const stored = Number(positions[currentBriefing?.date] || 0);
      if (stored > 0 && view.scrollTop === 0) view.scrollTop = stored;
    });
  }

  function show() {
    active = true;
    ensureRoot().hidden = false;
    document.body.classList.add('wrn-briefing-active');
    render();
    const settings = getSettings();
    if (settings?.configured) ensureDailyBriefing();
  }

  function hide() {
    active = false;
    document.body.classList.remove('wrn-briefing-active');
    if (root) root.hidden = true;
  }

  function resetBriefing() {
    const language = getSettings()?.language || appLanguage();
    if (!window.confirm(t('resetConfirm', language))) return;
    stopSpeech();
    [SETTINGS_KEY, HISTORY_KEY, FEEDBACK_KEY, AUDIO_KEY, SCROLL_KEY].forEach(removeLocal);
    currentBriefing = null;
    settingsOpen = true;
    announce(t('resetDone', language));
    render();
  }

  function exportSettings() {
    const settings = getSettings();
    if (!settings) return;
    const payload = JSON.stringify({ type: 'wrn-briefing-settings', version: 1, settings }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wrn-briefing-settings-${todayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSettingsFile(file) {
    if (!file) return;
    const language = appLanguage();
    try {
      const data = JSON.parse(await file.text());
      const imported = normalizeSettings(data?.settings || data);
      if (!imported?.configured) throw new Error('invalid');
      saveSettings(imported);
      currentBriefing = null;
      settingsOpen = false;
      announce(t('importSuccess', language));
      await ensureDailyBriefing({ force: true });
    } catch {
      announce(t('importInvalid', language));
    }
  }

  function buildSpeechQueue(briefing, language) {
    const queue = [];
    for (const entry of briefing.sections || []) {
      queue.push(t(entry.id, language));
      for (const item of entry.items || []) {
        queue.push(`${item.title}. ${item.summary || ''}`.trim());
      }
    }
    return queue.filter(Boolean);
  }

  function refreshVoices() {
    if (!('speechSynthesis' in window)) {
      voices = [];
      return;
    }
    voices = window.speechSynthesis.getVoices() || [];
  }

  function selectedVoice(language, settings) {
    refreshVoices();
    const desiredName = settings.voices?.[language];
    const tag = SPEECH_TAGS[language] || language;
    const prefix = tag.split('-')[0].toLowerCase();
    return window.WRNVoiceTools?.find?.(desiredName, tag)
      || voices.find(voice => voice.name === desiredName)
      || voices.find(voice => String(voice.lang || '').toLowerCase() === tag.toLowerCase())
      || voices.find(voice => String(voice.lang || '').toLowerCase().startsWith(prefix))
      || null;
  }

  function saveAudioPosition() {
    if (!currentBriefing) return;
    saveLocal(AUDIO_KEY, { date: currentBriefing.date, index: speechIndex, updatedAt: new Date().toISOString() });
  }

  function speakCurrent() {
    if (!currentBriefing || !speechQueue.length || speechIndex >= speechQueue.length) {
      stopSpeech();
      return;
    }

    const settings = getSettings();
    if (!settings) return;
    const utterance = new SpeechSynthesisUtterance(speechQueue[speechIndex]);
    utterance.lang = SPEECH_TAGS[currentBriefing.language] || currentBriefing.language;
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;
    const voice = selectedVoice(currentBriefing.language, settings);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (speechStatus !== 'playing') return;
      speechIndex += 1;
      saveAudioPosition();
      speakCurrent();
    };
    utterance.onerror = event => {
      console.warn('Briefing speech error:', event.error);
      speechStatus = 'stopped';
      render();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function startOrResumeSpeech() {
    if (!('speechSynthesis' in window) || !currentBriefing) return;

    if (speechStatus === 'paused' && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      speechStatus = 'playing';
      render();
      return;
    }

    stopSpeech(false);
    const settings = getSettings();
    const language = currentBriefing.language;
    speechQueue = buildSpeechQueue(currentBriefing, language);
    const saved = loadLocal(AUDIO_KEY, {});
    speechIndex = saved.date === currentBriefing.date
      ? Math.min(Number(saved.index || 0), Math.max(0, speechQueue.length - 1))
      : 0;

    if (!selectedVoice(language, settings)) announce(t('noVoice', language));
    speechStatus = 'playing';
    speakCurrent();
    render();
  }

  function pauseSpeech() {
    if (!('speechSynthesis' in window) || speechStatus !== 'playing') return;
    window.speechSynthesis.pause();
    speechStatus = 'paused';
    saveAudioPosition();
    render();
  }

  function stopSpeech(resetPosition = true) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    currentUtterance = null;
    speechStatus = 'stopped';
    if (resetPosition) {
      speechIndex = 0;
      if (currentBriefing) saveLocal(AUDIO_KEY, { date: currentBriefing.date, index: 0 });
    }
    if (active && root) render();
  }

  function plainBriefingText(briefing) {
    const language = briefing.language;
    const lines = [t('title', language), briefing.date, ''];
    for (const entry of briefing.sections) {
      lines.push(t(entry.id, language));
      for (const item of entry.items) {
        lines.push(`• ${item.title}`);
        if (item.summary) lines.push(item.summary);
        const sourceNames = item.sources?.map(source => source.source).filter(Boolean);
        if (sourceNames?.length) lines.push(`${t('sources', language)}: ${sourceNames.join(', ')}`);
        lines.push('');
      }
    }
    return lines.join('\n').trim();
  }

  async function shareBriefing() {
    if (!currentBriefing) return;
    const text = plainBriefingText(currentBriefing);
    try {
      if (navigator.share) await navigator.share({ title: t('title', currentBriefing.language), text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch (error) {
      if (error?.name !== 'AbortError') console.warn('Briefing share failed:', error);
    }
  }

  function refreshLanguage() {
    if (active) render();
  }

  function hasSettings() {
    return Boolean(getSettings()?.configured);
  }

  function init() {
    ensureRoot();
    refreshVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        refreshVoices();
        const languageSelect = root?.querySelector('select[name="language"]');
        const voiceSelect = root?.querySelector('select[name="voice"]');
        if (!languageSelect || !voiceSelect) return;
        const currentValue = voiceSelect.value;
        const state = currentVoiceOptions(languageSelect.value, currentValue);
        voiceSelect.textContent = '';
        state.options.forEach(([value, text]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = text;
          voiceSelect.appendChild(option);
        });
        voiceSelect.value = state.selected;
      });
    }

    window.addEventListener('wrn-app-ready', () => {
      if (getSettings()?.configured) ensureDailyBriefing();
    });

    window.setInterval(() => {
      if (getSettings()?.configured) ensureDailyBriefing();
    }, 60 * 60 * 1000);
  }

  window.WRNBriefing = Object.freeze({
    show,
    hide,
    render,
    ensureDailyBriefing,
    refreshLanguage,
    reset: resetBriefing,
    hasSettings,
    getSettings,
    getHistory: loadHistory,
    test: Object.freeze({
      normalizeSettings,
      todayKey,
      normalizedTitleTokens,
      similarity,
      clusterCandidates,
      contentFingerprint
    })
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
