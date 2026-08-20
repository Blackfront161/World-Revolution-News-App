/* World Revolution News - safe source-language labels for translation notices. */
'use strict';

(() => {
  if (window.WRNLanguageOrigin) return;

  const UNKNOWN_CODES = new Set([
    '', 'und', 'mul', 'zxx', 'mis', 'unknown', 'null', 'undefined',
    'n/a', 'n-a', 'na', 'none', 'auto', 'other', 'unk', 'xx'
  ]);
  const CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

  function normalize(code) {
    const raw = String(code ?? '').trim().replaceAll('_', '-');
    const lowered = raw.toLowerCase();
    const primary = lowered.split('-')[0];
    if (!raw || UNKNOWN_CODES.has(lowered) || UNKNOWN_CODES.has(primary) || !CODE_PATTERN.test(raw)) return '';
    try {
      const canonical = Intl.getCanonicalLocales(raw)[0] || '';
      const canonicalPrimary = canonical.toLowerCase().split('-')[0];
      if (!canonical || UNKNOWN_CODES.has(canonical.toLowerCase()) || UNKNOWN_CODES.has(canonicalPrimary)) return '';
      const knownName = new Intl.DisplayNames(['en'], { type: 'language' }).of(canonical) || '';
      const normalizedName = knownName.trim().toLowerCase();
      if (!normalizedName || normalizedName === canonical.toLowerCase() || normalizedName === canonicalPrimary) return '';
      return canonical;
    } catch {
      return '';
    }
  }

  function displayName(code, locale = document.documentElement.lang || 'en') {
    const canonical = normalize(code);
    if (!canonical) return '';
    let localized = '';
    try {
      const safeLocale = Intl.getCanonicalLocales(String(locale || 'en').replaceAll('_', '-'))[0] || 'en';
      localized = new Intl.DisplayNames([safeLocale, 'en'], { type: 'language' }).of(canonical) || '';
    } catch {
      try {
        localized = new Intl.DisplayNames(['en'], { type: 'language' }).of(canonical) || '';
      } catch {
        return '';
      }
    }
    const normalizedLabel = localized.trim().toLowerCase();
    const normalizedCode = canonical.toLowerCase();
    const primary = normalizedCode.split('-')[0];
    if (!normalizedLabel || normalizedLabel === normalizedCode || normalizedLabel === primary) return '';
    return localized.trim();
  }

  function confidence(article) {
    const values = [
      article?.languageConfidence,
      article?.language_confidence,
      article?.detectionConfidence,
      article?.languageDetection?.confidence
    ];
    const value = values.find(candidate => Number.isFinite(Number(candidate)));
    return value === undefined ? null : Number(value);
  }

  function fromArticle(article, locale = document.documentElement.lang || 'en') {
    if (!article || typeof article !== 'object') return null;
    const declared = [
      article.language,
      article.lang,
      article.sprache,
      article.originalLanguage,
      article.original_language,
      article.sourceLanguage,
      article.source_language
    ];
    let canonical = '';
    for (const candidate of declared) {
      canonical = normalize(candidate);
      if (canonical) break;
    }
    if (!canonical) {
      const detected = article.detectedLanguage || article.detected_language;
      const detectedConfidence = confidence(article);
      if (article.languageDetectionVerified === true || (detectedConfidence !== null && detectedConfidence >= 0.8)) {
        canonical = normalize(detected);
      }
    }
    if (!canonical) return null;
    const label = displayName(canonical, locale);
    return label ? { code: canonical, label } : null;
  }

  window.WRNLanguageOrigin = Object.freeze({ normalize, displayName, fromArticle });
})();
