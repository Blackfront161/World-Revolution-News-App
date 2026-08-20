'use strict';

(function initSpecialtyCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WRNNewsApp2Specialty = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function specialtyFactory() {
  function text(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function token(value) {
    return text(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  const APPROVED_DEVELOPMENT_GROUPS = Object.freeze([
    { sources: ['ANRed (Argentina)', 'Indymedia Argentina'], anchor: 'tierra no se vende' },
    { sources: ['Democracy Now! (Global)', 'Truthout'], anchor: 'abdul el-sayed' },
    { sources: ['Democracy Now! (Global)', 'Truthout'], anchor: 'citizens bank' },
    { sources: ['Mapuexpress (Mapuche)', 'Radio Kurruf Noticias'], anchor: 'palimpsesto' }
  ]);

  function isApprovedDevelopmentGroup(cluster) {
    const sources = [...new Set((cluster?.items || [])
      .map(item => text(item?.quelleName || item?.source))
      .filter(Boolean))]
      .sort()
      .join('|');
    const titles = token((cluster?.items || []).map(item => item?.title).join(' '));
    return APPROVED_DEVELOPMENT_GROUPS.some(group =>
      [...group.sources].sort().join('|') === sources
      && titles.includes(token(group.anchor))
    );
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ''));
      return /^https?:$/.test(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function localized(value, language = 'en') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return text(value);
    return text(value[language] || value.en || value.de || Object.values(value)[0]);
  }

  function eventTimestamp(value) {
    const timestamp = new Date(value || 0).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function normalizeEvent(raw) {
    const start = eventTimestamp(raw?.eventStart || raw?.pubDate);
    const end = eventTimestamp(raw?.eventEnd || raw?.eventStart || raw?.pubDate);
    const latitude = text(raw?.eventLatitude) && Number.isFinite(Number(raw.eventLatitude))
      ? Number(raw.eventLatitude)
      : null;
    const longitude = text(raw?.eventLongitude) && Number.isFinite(Number(raw.eventLongitude))
      ? Number(raw.eventLongitude)
      : null;
    const hasUsefulCoordinates = latitude !== null
      && longitude !== null
      && !(latitude === 0 && longitude === 0);
    return {
      id: text(raw?.eventUuid || raw?.eventApiId || raw?.link || `${raw?.title}-${start}`),
      title: text(raw?.title) || 'Event',
      source: text(raw?.quelleName || raw?.author) || 'Unknown',
      link: safeUrl(raw?.link),
      content: text(raw?.content || raw?.description),
      image: safeUrl(raw?.image),
      start,
      end: Math.max(start, end),
      timezone: text(raw?.eventTimezone),
      country: text(raw?.eventCountry),
      city: text(raw?.eventCity),
      venue: text(raw?.eventVenue),
      address: text([raw?.eventAddress, raw?.eventPostal].filter(Boolean).join(' ')),
      latitude: hasUsefulCoordinates ? latitude : null,
      longitude: hasUsefulCoordinates ? longitude : null,
      categories: [...new Set([
        ...(Array.isArray(raw?.eventCategories) ? raw.eventCategories : []),
        ...(Array.isArray(raw?.eventTags) ? raw.eventTags : [])
      ].map(text).filter(Boolean))],
      groups: [...new Set((Array.isArray(raw?.eventGroups) ? raw.eventGroups : []).map(text).filter(Boolean))],
      price: text(raw?.eventPrice),
      externalLinks: (Array.isArray(raw?.eventExternalLinks) ? raw.eventExternalLinks : [])
        .map(safeUrl)
        .filter(Boolean),
      recurrence: text(raw?.eventRecurrence),
      occurrenceCount: 1
    };
  }

  function eventSeriesKey(event) {
    return [
      token(event.title),
      token(event.city),
      token(event.venue),
      token(event.source)
    ].join('|');
  }

  function nextWeeklyOccurrence(event, now, seriesEnd) {
    if (!/FREQ=WEEKLY/i.test(event.recurrence)) return 0;
    const match = event.recurrence.match(/BYDAY=([A-Z]{2})/i);
    if (!match) return 0;
    const weekdays = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
    const wantedDay = weekdays[match[1].toUpperCase()];
    if (!Number.isInteger(wantedDay)) return 0;
    const base = new Date(event.start);
    const candidate = new Date(now);
    candidate.setUTCHours(base.getUTCHours(), base.getUTCMinutes(), 0, 0);
    let dayOffset = (wantedDay - candidate.getUTCDay() + 7) % 7;
    if (dayOffset === 0 && candidate.getTime() < now) dayOffset = 7;
    candidate.setUTCDate(candidate.getUTCDate() + dayOffset);
    return candidate.getTime() <= seriesEnd ? candidate.getTime() : 0;
  }

  function collapseRecurringEvents(input, now = Date.now()) {
    const groups = new Map();
    (Array.isArray(input) ? input : []).map(normalizeEvent).forEach(event => {
      if (!event.start || !event.title) return;
      const key = eventSeriesKey(event);
      const group = groups.get(key) || [];
      group.push(event);
      groups.set(key, group);
    });

    return [...groups.values()].map(group => {
      const ordered = group.sort((a, b) => a.start - b.start);
      const seriesEnd = Math.max(...ordered.map(event => event.end));
      const upcomingStart = ordered.find(event => event.start >= now);
      const latest = ordered.at(-1);
      const recurrenceStart = upcomingStart
        ? 0
        : nextWeeklyOccurrence(latest, now, seriesEnd);
      const upcoming = upcomingStart
        || (recurrenceStart ? { ...latest, start: recurrenceStart } : null)
        || ordered.find(event => event.end >= now)
        || latest;
      return {
        ...upcoming,
        end: seriesEnd,
        occurrenceCount: ordered.length,
        occurrences: ordered.map(event => event.start)
      };
    }).sort((a, b) => {
      const aPast = a.end < now;
      const bPast = b.end < now;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aPast ? b.end - a.end : a.start - b.start;
    });
  }

  function filterEvents(events, options = {}, now = Date.now()) {
    const query = token(options.query);
    const country = text(options.country);
    const archived = options.archived === true;
    return (Array.isArray(events) ? events : []).filter(event => {
      if ((event.end < now) !== archived) return false;
      if (country && event.country !== country) return false;
      if (!query) return true;
      return token([
        event.title, event.content, event.city, event.venue,
        event.country, event.categories.join(' ')
      ].join(' ')).includes(query);
    });
  }

  function isCurrentProfile(profile, now = Date.now()) {
    const review = eventTimestamp(`${text(profile?.verification?.nextReviewAt)}T23:59:59Z`);
    return profile?.verification?.status === 'verified' && review >= now;
  }

  function relatedArticles(profile, articles) {
    const aliases = (profile?.aliases || [profile?.publicName])
      .map(token)
      .filter(alias => alias.length >= 5);
    if (!aliases.length) return [];
    return (Array.isArray(articles) ? articles : []).filter(article => {
      const haystack = token(`${article.title} ${article.intro} ${article.content}`);
      return aliases.some(alias => haystack.includes(alias));
    });
  }

  function glossaryEntries(snapshot, language = 'en', section = 'all', query = '') {
    const needle = token(query);
    return (snapshot?.terms || []).map(term => ({
      ...term,
      displayTitle: localized(term.title, language),
      displaySummary: localized(term.summary, language),
      displayPractice: localized(term.practice, language),
      displayDebate: localized(term.debate, language)
    })).filter(term => {
      if (section !== 'all' && term.category !== section) return false;
      if (!needle) return true;
      return token([
        term.displayTitle,
        term.displaySummary,
        term.displayPractice,
        term.displayDebate,
        ...(term.related || []),
        ...Object.values(term.aliases || {})
      ].join(' ')).includes(needle);
    }).sort((a, b) => a.displayTitle.localeCompare(b.displayTitle, language));
  }

  function developmentClusters(articles, storiesCore, options = {}) {
    if (!storiesCore?.clusterStories) return [];
    const threshold = Math.max(0.72, Number(options.threshold) || 0.72);
    const clusters = storiesCore.clusterStories(articles, {
      days: Number(options.days) || 30,
      minSources: 2,
      minItems: 2,
      threshold
    });
    return clusters.filter(cluster =>
      cluster.sourceCount >= 2
      && cluster.matchConfidence >= threshold
      && Array.isArray(cluster.matchReasons)
      && cluster.matchReasons.length >= 2
      && (options.approvedOnly === false || isApprovedDevelopmentGroup(cluster))
    );
  }

  function developmentReviewHistory(review) {
    const allowedActions = new Set(['reported', 'resolved', 'reopened']);
    const entries = (Array.isArray(review?.history) ? review.history : [])
      .map(entry => ({ action: text(entry?.action), at: text(entry?.at) }))
      .filter(entry => allowedActions.has(entry.action) && eventTimestamp(entry.at));
    const createdAt = text(review?.createdAt);
    const updatedAt = text(review?.updatedAt);
    if (createdAt && !entries.some(entry => entry.action === 'reported')) {
      entries.push({ action: 'reported', at: createdAt });
    }
    if (
      review?.status === 'resolved'
      && updatedAt
      && updatedAt !== createdAt
      && !entries.some(entry => entry.action === 'resolved')
    ) {
      entries.push({ action: 'resolved', at: updatedAt });
    }
    return entries
      .sort((first, second) => eventTimestamp(first.at) - eventTimestamp(second.at))
      .slice(-50);
  }

  function transitionDevelopmentReview(review, nextStatus, at = new Date().toISOString()) {
    const status = nextStatus === 'resolved' ? 'resolved' : 'open';
    if (!review || review.status === status) return review;
    const history = developmentReviewHistory(review);
    history.push({
      action: status === 'resolved' ? 'resolved' : 'reopened',
      at: text(at) || new Date().toISOString()
    });
    return {
      ...review,
      status,
      updatedAt: text(at) || new Date().toISOString(),
      history: history.slice(-50)
    };
  }

  return Object.freeze({
    text,
    token,
    safeUrl,
    localized,
    normalizeEvent,
    collapseRecurringEvents,
    filterEvents,
    isCurrentProfile,
    relatedArticles,
    glossaryEntries,
    developmentClusters,
    developmentReviewHistory,
    transitionDevelopmentReview
  });
});
