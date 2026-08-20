/* World Revolution News 1.8.1 – Audio-Herkunftsfilter */
'use strict';

(() => {
  if (window.WRNAudioRegionCore) return;

  const COUNTRY_REGION = Object.freeze({
    DE: 'europe', AT: 'europe', CH: 'europe', IT: 'europe', FR: 'europe',
    ES: 'europe', PT: 'europe', GB: 'europe', IE: 'europe', NL: 'europe',
    BE: 'europe', LU: 'europe', DK: 'europe', SE: 'europe', NO: 'europe',
    FI: 'europe', IS: 'europe', PL: 'europe', CZ: 'europe', SK: 'europe',
    HU: 'europe', SI: 'europe', HR: 'europe', BA: 'europe', RS: 'europe',
    ME: 'europe', MK: 'europe', AL: 'europe', GR: 'europe', BG: 'europe',
    RO: 'europe', MD: 'europe', UA: 'europe', BY: 'europe', LT: 'europe',
    LV: 'europe', EE: 'europe', RU: 'europe', TR: 'europe',
    US: 'north-america', CA: 'north-america', MX: 'north-america',
    AR: 'latin-america', BO: 'latin-america', BR: 'latin-america', CL: 'latin-america',
    CO: 'latin-america', CR: 'latin-america', CU: 'latin-america', DO: 'latin-america',
    EC: 'latin-america', GT: 'latin-america', HN: 'latin-america', NI: 'latin-america',
    PA: 'latin-america', PE: 'latin-america', PY: 'latin-america', SV: 'latin-america',
    UY: 'latin-america', VE: 'latin-america',
    AU: 'oceania', NZ: 'oceania',
    CN: 'asia', HK: 'asia', IN: 'asia', ID: 'asia', JP: 'asia', KR: 'asia',
    KP: 'asia', MY: 'asia', PH: 'asia', SG: 'asia', TH: 'asia', VN: 'asia',
    BD: 'asia', LK: 'asia', NP: 'asia', PK: 'asia', AF: 'asia', IR: 'asia',
    IQ: 'asia', IL: 'asia', PS: 'asia', LB: 'asia', SY: 'asia', JO: 'asia',
    SA: 'asia', YE: 'asia', OM: 'asia', AE: 'asia', QA: 'asia', KW: 'asia',
    KZ: 'asia', KG: 'asia', TJ: 'asia', TM: 'asia', UZ: 'asia', MN: 'asia',
    ZA: 'africa', NG: 'africa', GH: 'africa', KE: 'africa', UG: 'africa',
    TZ: 'africa', ET: 'africa', ER: 'africa', SD: 'africa', SS: 'africa',
    EG: 'africa', LY: 'africa', TN: 'africa', DZ: 'africa', MA: 'africa',
    SN: 'africa', ML: 'africa', BF: 'africa', NE: 'africa', TD: 'africa',
    CM: 'africa', CD: 'africa', CG: 'africa', AO: 'africa', MZ: 'africa',
    ZW: 'africa', ZM: 'africa', BW: 'africa', NA: 'africa', MG: 'africa'
  });

  function normalizeToken(value) {
    return String(value || '')
      .trim()
      .toLocaleLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_/]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function canonicalRegion(value, country = '') {
    const raw = normalizeToken(value);
    const countryCode = String(country || '').trim().toUpperCase();

    if (!raw && COUNTRY_REGION[countryCode]) return COUNTRY_REGION[countryCode];
    if (!raw) return 'unknown';

    if (['global', 'weltweit', 'worldwide', 'international', 'multi'].includes(raw)) return 'global';
    if (raw === 'dach') return 'europe';
    if (raw.includes('europa') || raw.includes('europe')) return 'europe';
    if (raw.includes('afrika') || raw.includes('africa')) return 'africa';
    if (raw.includes('nordamerika') || raw.includes('north america')) return 'north-america';
    if (raw.includes('lateinamerika') || raw.includes('latin america') || raw.includes('south america')) return 'latin-america';
    if (raw.includes('asien') || raw.includes('asia') || raw.includes('middle east') || raw.includes('west asia')) return 'asia';
    if (raw.includes('australien') || raw.includes('oceania') || raw.includes('new zealand') || raw.includes('australia')) return 'oceania';

    return COUNTRY_REGION[countryCode] || 'unknown';
  }

  function matches(selected, value, country = '') {
    const filter = canonicalRegion(selected);
    if (selected === 'all' || filter === 'global') return true;
    return canonicalRegion(value, country) === selected;
  }

  window.WRNAudioRegionCore = Object.freeze({
    canonicalRegion,
    matches,
    regions: Object.freeze([
      'all', 'europe', 'africa', 'north-america',
      'latin-america', 'asia', 'oceania'
    ])
  });
})();
