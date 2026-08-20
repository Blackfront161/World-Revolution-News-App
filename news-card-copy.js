/* World Revolution News – shared, non-truncating news-card copy rules. */
'use strict';

(function expose(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WRNNewsCardCopy = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function createNewsCardCopy() {
  const MAX_SENTENCE_LENGTH = 360;
  const TERMINAL = /[.!?。！？]["'»”’）)\]]*$/u;
  const BOUNDARY = /[.!?。！？]["'»”’）)\]]*(?=\s|$)/gu;
  const ABBREVIATIONS = new Set([
    'dr.', 'prof.', 'mr.', 'mrs.', 'ms.', 'sr.', 'jr.', 'st.', 'vs.',
    'z.b.', 'bzw.', 'u.a.', 'd.h.', 'ca.', 'nr.', 'art.', 'abs.', 'vgl.',
    'etc.', 'e.g.', 'i.e.', 'p.ex.', 'avv.', 'ecc.', 'evtl.', 'fr.',
    'ggf.', 'hr.', 'inkl.', 'pl.', 'resp.', 's.', 'sen.', 'sog.', 'str.',
    'u.a.m.', 'u.s.w.', 'usw.', 'e.v.'
  ]);
  const FALLBACK_MONTHS = new Set([
    'januar','februar','märz','maerz','april','mai','juni','juli','august','september','oktober','november','dezember',
    'january','february','march','may','june','july','october','december',
    'enero','febrero','marzo','abril','mayo','junio','julio','agosto','octubre','noviembre','diciembre',
    'janvier','février','fevrier','mars','avril','juin','juillet','août','aout','octobre','décembre','decembre',
    'gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','ottobre','dicembre',
    'janeiro','fevereiro','março','marco','abril','maio','junho','julho','agosto','outubro','dezembro',
    'января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря',
    'ocak','şubat','subat','mart','nisan','mayıs','mayis','haziran','temmuz','ağustos','agustos','eylül','eylul','ekim','kasım','kasim','aralık','aralik'
  ]);

  function cleanText(value) {
    return String(value == null ? '' : value)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function safeLocale(language) {
    try { return Intl.getCanonicalLocales(String(language || 'en').replaceAll('_', '-'))[0] || 'en'; }
    catch { return 'en'; }
  }

  function normalizedWord(value) {
    return String(value || '').toLocaleLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  }

  function monthNames(language) {
    const names = new Set(FALLBACK_MONTHS);
    try {
      const locale = safeLocale(language);
      for (let month = 0; month < 12; month += 1) {
        const date = new Date(Date.UTC(2024, month, 1));
        for (const width of ['long', 'short']) {
          const name = normalizedWord(new Intl.DateTimeFormat(locale, { month: width, timeZone: 'UTC' }).format(date));
          if (name) names.add(name);
        }
      }
    } catch { /* Static multilingual month list remains available. */ }
    return names;
  }

  function boundaryNeedsContinuation(prefix, suffix, language) {
    const before = String(prefix || '').trim();
    const after = String(suffix || '').trimStart();
    if (!before || !after) return false;
    const lastToken = before.match(/([^\s]+)$/u)?.[1]?.toLocaleLowerCase() || '';
    if (ABBREVIATIONS.has(lastToken)) return true;
    const ordinal = before.match(/(?:^|\s)(\d{1,2})\.["'»”’）)\]]*$/u);
    if (!ordinal) return false;
    const nextWord = normalizedWord(after.match(/^\S+/u)?.[0]);
    return Boolean(nextWord && monthNames(language).has(nextWord));
  }

  function acceptable(sentence, maxLength) {
    const value = String(sentence || '').trim();
    return Boolean(value && value.length <= maxLength && TERMINAL.test(value));
  }

  function segmenterSentence(value, language, maxLength, SegmenterClass) {
    const segments = [...new SegmenterClass(safeLocale(language), { granularity: 'sentence' }).segment(value)];
    let candidate = '';
    for (let index = 0; index < segments.length; index += 1) {
      candidate += segments[index].segment;
      const suffix = segments.slice(index + 1).map(item => item.segment).join('');
      if (boundaryNeedsContinuation(candidate, suffix, language)) continue;
      return acceptable(candidate, maxLength) ? candidate.trim() : '';
    }
    return '';
  }

  function fallbackSentence(value, language, maxLength) {
    BOUNDARY.lastIndex = 0;
    let match;
    while ((match = BOUNDARY.exec(value))) {
      const candidate = value.slice(0, BOUNDARY.lastIndex).trim();
      const suffix = value.slice(BOUNDARY.lastIndex);
      if (boundaryNeedsContinuation(candidate, suffix, language)) continue;
      return acceptable(candidate, maxLength) ? candidate : '';
    }
    return '';
  }

  function completeFirstSentence(value, language = 'en', options = {}) {
    const clean = cleanText(value);
    const maxLength = Number.isFinite(Number(options.maxLength))
      ? Math.max(80, Number(options.maxLength))
      : MAX_SENTENCE_LENGTH;
    if (!clean) return '';
    const SegmenterClass = options.Segmenter === undefined ? globalThis.Intl?.Segmenter : options.Segmenter;
    if (typeof SegmenterClass === 'function') {
      try { return segmenterSentence(clean, language, maxLength, SegmenterClass); }
      catch { /* Older engines use the deterministic fallback below. */ }
    }
    return fallbackSentence(clean, language, maxLength);
  }

  function translationNotice(genericLabel, fromTemplate, sourceLanguageLabel = '') {
    const generic = String(genericLabel || '').trim();
    const source = String(sourceLanguageLabel || '').trim();
    if (!source) return generic;
    const template = String(fromTemplate || '').trim();
    return template.includes('{language}') ? template.replace('{language}', source) : generic;
  }

  function syncTeaserParagraph(container, selector, beforeSelector, teaser, documentRef = globalThis.document) {
    let paragraph = container?.querySelector(selector) || null;
    const text = cleanText(teaser);
    if (!text) {
      paragraph?.remove();
      return null;
    }
    if (!paragraph && container && documentRef?.createElement) {
      paragraph = documentRef.createElement('p');
      const before = container.querySelector(beforeSelector);
      if (before?.before) before.before(paragraph);
      else container.append?.(paragraph);
    }
    if (paragraph) paragraph.textContent = text;
    return paragraph;
  }

  return { MAX_SENTENCE_LENGTH, cleanText, completeFirstSentence, translationNotice, syncTeaserParagraph, boundaryNeedsContinuation };
});
