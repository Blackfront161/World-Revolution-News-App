/* World Revolution News – pure source-passport 2.1 normalization */
'use strict';

((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WRNSourcePassport21 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const text = value => String(value ?? '').trim();
  const normalize = value => text(value).toLocaleLowerCase();
  const PASSPORT_LABELS = Object.freeze({
    de: Object.freeze({ operator:'Betreiber / Organisation', origin:'Herkunftsregion', funding:'Öffentlich bekannte Finanzierung', sourceType:'Quellentyp', proximity:'Nähe zum Ereignis', provenance:'Primärbericht / Weiterveröffentlichung', corrections:'Dokumentierte Korrekturen', reliability:'Technische Feed-Zuverlässigkeit', why:'Warum wird diese Quelle angezeigt?', unknown:'Unbekannt', whyTemplate:'{count} aktuelle WRN-Einträge nennen diese Quelle. Das ist keine Qualitätsbewertung.' }),
    en: Object.freeze({ operator:'Operator / organization', origin:'Region of origin', funding:'Publicly known funding', sourceType:'Source type', proximity:'Proximity to the event', provenance:'Primary report / republication', corrections:'Documented corrections', reliability:'Technical feed reliability', why:'Why is this source shown?', unknown:'Unknown', whyTemplate:'{count} current WRN entries cite this source. This is not a quality rating.' }),
    es: Object.freeze({ operator:'Operador / organización', origin:'Región de origen', funding:'Financiación conocida públicamente', sourceType:'Tipo de fuente', proximity:'Proximidad al acontecimiento', provenance:'Informe primario / republicación', corrections:'Correcciones documentadas', reliability:'Fiabilidad técnica del feed', why:'¿Por qué se muestra esta fuente?', unknown:'Desconocido', whyTemplate:'{count} entradas actuales de WRN citan esta fuente. No es una valoración de calidad.' }),
    fr: Object.freeze({ operator:'Opérateur / organisation', origin:'Région d’origine', funding:'Financement connu publiquement', sourceType:'Type de source', proximity:'Proximité de l’événement', provenance:'Reportage primaire / republication', corrections:'Corrections documentées', reliability:'Fiabilité technique du flux', why:'Pourquoi cette source est-elle affichée ?', unknown:'Inconnu', whyTemplate:'{count} entrées WRN actuelles citent cette source. Ce n’est pas une note de qualité.' }),
    it: Object.freeze({ operator:'Gestore / organizzazione', origin:'Regione di origine', funding:'Finanziamento noto pubblicamente', sourceType:'Tipo di fonte', proximity:'Prossimità all’evento', provenance:'Resoconto primario / ripubblicazione', corrections:'Correzioni documentate', reliability:'Affidabilità tecnica del feed', why:'Perché viene mostrata questa fonte?', unknown:'Sconosciuto', whyTemplate:'{count} voci WRN attuali citano questa fonte. Non è una valutazione di qualità.' }),
    pt: Object.freeze({ operator:'Operador / organização', origin:'Região de origem', funding:'Financiamento conhecido publicamente', sourceType:'Tipo de fonte', proximity:'Proximidade ao acontecimento', provenance:'Relato primário / republicação', corrections:'Correções documentadas', reliability:'Fiabilidade técnica do feed', why:'Porque é apresentada esta fonte?', unknown:'Desconhecido', whyTemplate:'{count} entradas atuais da WRN citam esta fonte. Não é uma avaliação de qualidade.' }),
    ru: Object.freeze({ operator:'Оператор / организация', origin:'Регион происхождения', funding:'Публично известное финансирование', sourceType:'Тип источника', proximity:'Близость к событию', provenance:'Первичный материал / перепубликация', corrections:'Документированные исправления', reliability:'Техническая надёжность ленты', why:'Почему показан этот источник?', unknown:'Неизвестно', whyTemplate:'Этот источник указан в {count} текущих материалах WRN. Это не оценка качества.' }),
    el: Object.freeze({ operator:'Φορέας / οργάνωση', origin:'Περιοχή προέλευσης', funding:'Δημόσια γνωστή χρηματοδότηση', sourceType:'Τύπος πηγής', proximity:'Εγγύτητα στο γεγονός', provenance:'Πρωτογενής αναφορά / αναδημοσίευση', corrections:'Τεκμηριωμένες διορθώσεις', reliability:'Τεχνική αξιοπιστία ροής', why:'Γιατί εμφανίζεται αυτή η πηγή;', unknown:'Άγνωστο', whyTemplate:'Η πηγή αναφέρεται σε {count} τρέχουσες εγγραφές WRN. Αυτό δεν είναι αξιολόγηση ποιότητας.' }),
    tr: Object.freeze({ operator:'İşleten / kuruluş', origin:'Menşe bölgesi', funding:'Kamuya açık bilinen finansman', sourceType:'Kaynak türü', proximity:'Olaya yakınlık', provenance:'Birincil haber / yeniden yayın', corrections:'Belgelenmiş düzeltmeler', reliability:'Akışın teknik güvenilirliği', why:'Bu kaynak neden gösteriliyor?', unknown:'Bilinmiyor', whyTemplate:'Bu kaynak {count} güncel WRN kaydında geçiyor. Bu bir kalite değerlendirmesi değildir.' })
  });

  function passportLabels(language = 'en') {
    const labels = PASSPORT_LABELS[text(language).toLowerCase().split(/[-_]/)[0]] || PASSPORT_LABELS.en;
    return Object.freeze({ ...labels, whyText: count => labels.whyTemplate.replace('{count}', String(Number(count) || 0)) });
  }

  function healthEntries(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.sources)) return payload.sources;
    if (Array.isArray(payload?.items)) return payload.items;
    if (payload && typeof payload === 'object') return Object.values(payload).filter(value => value && typeof value === 'object');
    return [];
  }

  function findHealth(payload, name) {
    const key = normalize(name);
    return healthEntries(payload).find(entry => normalize(entry?.name || entry?.sourceName || entry?.source) === key) || null;
  }

  function documentedCorrections(profile, registry, articles, unknown = 'Unknown') {
    const explicit = profile?.documentedCorrections ?? registry?.documentedCorrections;
    if (Array.isArray(explicit)) return String(explicit.length);
    if (Number.isFinite(Number(explicit)) && explicit !== '') return String(Number(explicit));
    const current = (Array.isArray(articles) ? articles : []).filter(article =>
      article?.correction === true || article?.corrected === true
      || /correct|korrig/i.test(text(article?.correctionNote || article?.status))
    ).length;
    return current > 0 ? String(current) : unknown;
  }

  function buildPassport({ profile = {}, registry = {}, health = null, articles = [], unknown = 'Unknown' } = {}) {
    const languages = Array.isArray(profile.languages) && profile.languages.length ? profile.languages
      : Array.isArray(registry.languages) ? registry.languages : [];
    const available = health ? !(health.ok === false || health.available === false || ['error', 'offline'].includes(health.status)) : null;
    return {
      operator: text(profile.operator || profile.organization || registry.operator || registry.organization) || unknown,
      origin: text(profile.originCountry || registry.originCountry || profile.originRegion || registry.originRegion) || unknown,
      languages: languages.length ? languages.map(value => text(value).toUpperCase()).join(', ') : unknown,
      funding: text(profile.funding || registry.funding) || unknown,
      sourceType: text(profile.sourceType || registry.sourceType || registry.mediaType) || unknown,
      eventProximity: text(profile.eventProximity || registry.eventProximity) || unknown,
      reportProvenance: text(profile.reportProvenance || registry.reportProvenance) || unknown,
      documentedCorrections: documentedCorrections(profile, registry, articles, unknown),
      feedReliability: available === null
        ? unknown
        : `${available ? 'available' : 'unavailable'}${health?.detailedState ? ` · ${text(health.detailedState)}` : ''}`,
      whyShownCount: articles.length,
      qualityScore: null
    };
  }

  return Object.freeze({ PASSPORT_LABELS, passportLabels, healthEntries, findHealth, documentedCorrections, buildPassport });
});
