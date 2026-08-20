/* World Revolution News – release-readiness helpers for the isolated News App 2 preview */
'use strict';

(function expose(factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.WRNNewsApp2Release = Object.freeze(api);
})(function createReleaseHelpers() {
  const ARTICLE_TYPES = new Set([
    'news', 'analysis', 'commentary', 'interview', 'press-release', 'podcast', 'event'
  ]);
  const BACKUP_FORMAT = 'world-revolution-news-backup';
  const BACKUP_VERSION = 2;

  function text(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function token(value) {
    return text(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ''));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function sourceName(article) {
    return text(article?.source || article?.quelleName || article?.sourceName);
  }

  function sourceIndex(payload) {
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.sources)
        ? payload.sources
        : [];
    const index = new Map();
    index.generatedAt = text(payload?.generatedAt);
    index.metadataCompleteness = payload?.metadataCompleteness || {};
    rows.forEach(row => {
      const name = text(row?.name || row?.sourceName || row?.source);
      if (!name) return;
      const key = token(name);
      const existing = index.get(key);
      const candidate = {
        name,
        languages: [...new Set(
          (Array.isArray(row?.languages) ? row.languages : [row?.language])
            .map(value => text(value).toLowerCase())
            .filter(Boolean)
        )],
        languageSource: text(row?.languageSource),
        originRegion: text(row?.originRegion),
        originCountry: text(row?.originCountry || row?.originCountryCode),
        geographySource: text(row?.geographySource),
        origins: Array.isArray(row?.origins) ? row.origins.map(text).filter(Boolean) : [],
        mediaType: text(row?.mediaType),
        sourceType: text(row?.sourceType),
        originScope: text(row?.originScope),
        homepage: safeUrl(row?.homepage || row?.website || row?.url),
        status: text(row?.status),
        active: row?.active !== false
      };
      if (
        !existing
        || (candidate.languages.length + Number(Boolean(candidate.originRegion)) + Number(Boolean(candidate.homepage)))
          > (existing.languages.length + Number(Boolean(existing.originRegion)) + Number(Boolean(existing.homepage)))
      ) {
        index.set(key, candidate);
      }
    });
    return index;
  }

  function sourceMeta(article, index) {
    const catalog = index instanceof Map ? index.get(token(sourceName(article))) : null;
    const languages = [
      ...(Array.isArray(article?.languages) ? article.languages : []),
      article?.language,
      article?.lang,
      ...(catalog?.languages || [])
    ].map(value => text(value).toLowerCase().split(/[-_]/)[0]).filter(Boolean);
    return {
      name: sourceName(article),
      language: languages.find(value => value && value !== 'und') || languages[0] || 'und',
      originRegion: text(article?.originRegion || catalog?.originRegion),
      originCountry: text(article?.originCountry || article?.originCountryCode || catalog?.originCountry),
      geographySource: text(article?.geographySource || catalog?.geographySource || 'unknown'),
      languageSource: text(article?.languageSource || catalog?.languageSource || 'unknown'),
      provenance: catalog?.origins || [],
      registryGeneratedAt: text(index?.generatedAt),
      homepage: safeUrl(article?.sourceHomepage || catalog?.homepage),
      mediaType: text(article?.sourceType || catalog?.mediaType),
      sourceType: text(article?.sourceType || catalog?.sourceType),
      originScope: text(article?.originScope || catalog?.originScope),
      active: catalog?.active !== false
    };
  }

  function classifyArticle(article) {
    const explicit = token(article?.contentType || article?.articleType || article?.format || article?.type);
    const map = {
      article: 'news', nachricht: 'news', bericht: 'news', news: 'news',
      analysis: 'analysis', analyse: 'analysis', essay: 'analysis', background: 'analysis',
      opinion: 'commentary', commentary: 'commentary', comment: 'commentary', kommentar: 'commentary', column: 'commentary',
      interview: 'interview', gesprach: 'interview',
      pressrelease: 'press-release', 'press-release': 'press-release', pressemitteilung: 'press-release', statement: 'press-release',
      podcast: 'podcast', audio: 'podcast', event: 'event', termin: 'event'
    };
    if (map[explicit]) return map[explicit];
    const haystack = token([
      article?.title,
      ...(article?.categories || []),
      ...(article?.secondaryTopics || [])
    ].join(' '));
    if (article?.eventStart || /\bevent\b|\btermin\b/.test(haystack)) return 'event';
    if (article?.audioUrl || /\bpodcast\b|\baudio\b/.test(haystack)) return 'podcast';
    if (/\binterview\b|\bq&a\b|\bgesprach\b/.test(haystack)) return 'interview';
    if (/press release|pressemitteilung|communique|official statement|stellungnahme/.test(haystack)) return 'press-release';
    if (/\banalysis\b|\banalyse\b|\bhintergrund\b|\bessay\b|\btheory\b|\bstrategie\b/.test(haystack)) return 'analysis';
    if (/\bkommentar\b|\bcommentary\b|\bopinion\b|\bcolumn\b|\bmeinung\b/.test(haystack)) return 'commentary';
    return 'news';
  }

  function filterArticles(items, filters = {}, index = new Map()) {
    const language = text(filters.language).toLowerCase();
    const origin = text(filters.origin);
    const source = text(filters.source);
    const format = text(filters.format);
    const result = (Array.isArray(items) ? items : []).filter(article => {
      const meta = sourceMeta(article, index);
      if (language && language !== 'all' && meta.language !== language) return false;
      if (origin && origin !== 'all' && ![meta.originRegion, meta.originCountry].includes(origin)) return false;
      if (source && source !== 'all' && meta.name !== source) return false;
      if (format && format !== 'all' && classifyArticle(article) !== format) return false;
      return true;
    });
    const direction = filters.sort === 'oldest' ? 1 : -1;
    return result.sort((a, b) =>
      direction * ((Number(a?.timestamp) || Date.parse(a?.pubDate || '') || 0)
        - (Number(b?.timestamp) || Date.parse(b?.pubDate || '') || 0))
    );
  }

  function splitTranslationChunks(value, limit = 5200) {
    const clean = text(value);
    const maximum = Math.max(800, Math.min(5900, Number(limit) || 5200));
    if (!clean) return [];
    const paragraphs = String(value || '')
      .replace(/\r/g, '')
      .split(/\n{2,}/)
      .map(text)
      .filter(Boolean);
    const units = paragraphs.length > 1
      ? paragraphs
      : (clean.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [clean]).map(text).filter(Boolean);
    const chunks = [];
    let current = '';
    const pushCurrent = () => {
      if (current) chunks.push(current);
      current = '';
    };
    units.forEach(unit => {
      if (unit.length > maximum) {
        pushCurrent();
        let remaining = unit;
        while (remaining.length > maximum) {
          const slice = remaining.slice(0, maximum);
          const boundary = Math.max(slice.lastIndexOf(' '), 1);
          chunks.push(remaining.slice(0, boundary).trim());
          remaining = remaining.slice(boundary).trim();
        }
        current = remaining;
        return;
      }
      if (current && current.length + unit.length + 2 > maximum) pushCurrent();
      current += `${current ? '\n\n' : ''}${unit}`;
    });
    pushCurrent();
    return chunks;
  }

  function number(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function radians(value) {
    return value * Math.PI / 180;
  }

  function distanceKm(from, to) {
    const latitudeA = number(from?.latitude);
    const longitudeA = number(from?.longitude);
    const latitudeB = number(to?.latitude);
    const longitudeB = number(to?.longitude);
    if ([latitudeA, longitudeA, latitudeB, longitudeB].some(value => value === null)) return null;
    const deltaLatitude = radians(latitudeB - latitudeA);
    const deltaLongitude = radians(longitudeB - longitudeA);
    const a = Math.sin(deltaLatitude / 2) ** 2
      + Math.cos(radians(latitudeA)) * Math.cos(radians(latitudeB))
      * Math.sin(deltaLongitude / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function filterEvents(items, filters = {}, now = Date.now()) {
    const query = token(filters.query);
    const radius = Number(filters.radius) || 0;
    const location = filters.location || null;
    return (Array.isArray(items) ? items : []).filter(event => {
      if ((Number(event?.end) < now) !== (filters.archived === true)) return false;
      if (
        filters.country
        && (
          filters.country === '__international__'
            ? !['XC', 'XE'].includes(event.country)
            : event.country !== filters.country
        )
      ) return false;
      if (filters.city && event.city !== filters.city) return false;
      if (
        filters.category
        && !(event.categories || []).includes(filters.category)
        && !(event.categories || []).some(value => eventCategoryGroup(value) === filters.category)
      ) return false;
      if (filters.group && !(event.groups || []).includes(filters.group)) return false;
      if (filters.date) {
        const requested = new Date(`${filters.date}T00:00:00`).getTime();
        const end = requested + 24 * 60 * 60 * 1000;
        if (Number(event.start) >= end || Number(event.end) < requested) return false;
      }
      if (radius && location) {
        const distance = distanceKm(location, event);
        if (distance === null || distance > radius) return false;
      }
      if (query && !token([
        event.title, event.content, event.city, event.venue, event.country,
        ...(event.categories || []), ...(event.groups || [])
      ].join(' ')).includes(query)) return false;
      return true;
    }).map(event => ({
      ...event,
      distanceKm: location ? distanceKm(location, event) : null
    }));
  }

  function eventCategoryGroup(value) {
    const normalized = token(value);
    if (/protest|action|demo|kundgebung|activism|march|camp/.test(normalized)) return 'Action & Protest';
    if (/meeting|discussion|presentation|plenum|assemble|talk|vortrag|lesekreis|reading group/.test(normalized)) return 'Meetings & Discussion';
    if (/workshop|course|education|language|repair|diy|training|self defense|boxing|yoga/.test(normalized)) return 'Workshops & Learning';
    if (/concert|music|punk|dj|party|dance|film|cinema|theater|art|exhibition|performance|lesung/.test(normalized)) return 'Culture & Nightlife';
    if (/food|kufa|voku|vegan|cafe|bar|market|shop/.test(normalized)) return 'Food & Community';
    if (/solidar|benefit|care|help|fund|prison|sans papiers/.test(normalized)) return 'Solidarity & Support';
    if (/sport|football|circus|hula|martial|clown|bike|bici|velo/.test(normalized)) return 'Sport & Movement';
    if (/hack|computer|tech|linux|electronics|digital/.test(normalized)) return 'Technology';
    return normalized ? 'Other' : '';
  }

  function eventMapUrl(event) {
    const latitude = number(event?.latitude);
    const longitude = number(event?.longitude);
    if (latitude !== null && longitude !== null) {
      return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latitude)}&mlon=${encodeURIComponent(longitude)}#map=15/${encodeURIComponent(latitude)}/${encodeURIComponent(longitude)}`;
    }
    const query = text([event?.venue, event?.address, event?.city, event?.country].filter(Boolean).join(', '));
    return query ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}` : '';
  }

  function eventRouteUrl(event) {
    const destination = text([
      event?.venue,
      event?.address,
      event?.city,
      event?.country
    ].filter(Boolean).join(', '));
    return destination ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` : '';
  }

  function icsDate(value) {
    const date = new Date(Number(value) || value || 0);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }

  function icsEscape(value) {
    return text(value)
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  }

  function eventIcs(event) {
    const start = icsDate(event?.start);
    if (!start) return '';
    const end = icsDate(event?.end || event?.start);
    const location = [event?.venue, event?.address, event?.city, event?.country].filter(Boolean).join(', ');
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//World Revolution News//News App 2//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${icsEscape(event?.id || `${event?.title}-${start}`)}@worldrevolutionnews`,
      `DTSTAMP:${icsDate(Date.now())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${icsEscape(event?.title || 'Event')}`,
      `DESCRIPTION:${icsEscape(event?.content || '')}`,
      `LOCATION:${icsEscape(location)}`,
      event?.link ? `URL:${safeUrl(event.link)}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }

  function readingProgress(scrollTop, scrollHeight, clientHeight) {
    const available = Math.max(0, Number(scrollHeight) - Number(clientHeight));
    if (!available) return 0;
    return Math.max(0, Math.min(1, Number(scrollTop) / available));
  }

  function backupPayload(localStorageValues, appVersion = '') {
    const allowed = [
      'wrn_bookmarks', 'wrn_read_list', 'wrn_read_positions', 'wrn_zine_articles',
      'wrn_next_preferences_v1', 'wrn_next_story_watch_v1', 'wrn_next_ui_settings_v1',
      'wrn_next_development_reviews_v1',
      'wrn_system_lang', 'wrn_audio_queue_v1', 'wrn_audio_favorites_v1',
      'wrn_media_positions_v1', 'wrn_event_reminders_v2', 'wrn_saved_event_filters_v1'
    ];
    const localStorage = {};
    allowed.forEach(key => {
      const value = localStorageValues?.[key];
      if (typeof value === 'string' && value.length <= 5_000_000) localStorage[key] = value;
    });
    return {
      format: BACKUP_FORMAT,
      schemaVersion: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      appVersion: text(appVersion),
      localStorage
    };
  }

  function validBackup(value) {
    return Boolean(
      value
      && typeof value === 'object'
      && value.format === BACKUP_FORMAT
      && [1, BACKUP_VERSION].includes(Number(value.schemaVersion))
      && value.localStorage
      && typeof value.localStorage === 'object'
      && !Array.isArray(value.localStorage)
    );
  }

  return {
    ARTICLE_TYPES,
    BACKUP_FORMAT,
    BACKUP_VERSION,
    backupPayload,
    classifyArticle,
    distanceKm,
    eventIcs,
    eventCategoryGroup,
    eventMapUrl,
    eventRouteUrl,
    filterArticles,
    filterEvents,
    readingProgress,
    safeUrl,
    sourceIndex,
    sourceMeta,
    splitTranslationChunks,
    text,
    token,
    validBackup
  };
});
