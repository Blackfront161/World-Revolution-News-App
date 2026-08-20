/* World Revolution News 1.8.4 - stable public podcasts and regional audio */
'use strict';

(() => {
  if (window.__wrnAudioTab183) return;
  window.__wrnAudioTab183 = true;

  const legacyAudioTab181 = window.WRNAudioTab181;
  try { legacyAudioTab181?.close?.(); } catch {}

  const VIEW_ID = 'wrn-audio-tab-183';
  const SOURCE_URL = './podcast-sources.json';
  const GENERATED_URLS = [
    './generated-podcasts.json',
    './generated_podcasts.json',
    './podcast-feed.json',
    './ai-podcasts.json',
    './podcasts-generated.json',
    './generated-audio.json'
  ];
  const REGIONS = ['global', 'europe', 'africa', 'north-america', 'latin-america', 'asia', 'oceania'];
  const hiddenNodes = new Map();

  const state = {
    active: false,
    view: 'original',
    search: '',
    source: 'all',
    language: 'all',
    category: 'all',
    region: 'global',
    original: [],
    generated: [],
    radio: [],
    sources: [],
    loaded: { original: false, generated: false, radio: false },
    loading: { original: false, generated: false, radio: false },
    error: { original: '', generated: '', radio: '' },
    highlightId: ''
  };

  const TEXTS = {
    en: {
      title: 'Audio hub', original: 'Original podcasts', generated: 'Generated podcasts', radio: 'Live radio',
      intro: 'Independent podcasts, public Azure audio and live radio in one player.', search: 'Search audio...',
      allSources: 'All sources', allLanguages: 'All languages', refresh: 'Refresh', loading: 'Loading audio...',
      empty: 'No matching audio found.', configured: 'source configured; episodes appear after the next data update.',
      configuredMany: 'sources configured; episodes appear after the next data update.', publicLibrary: 'Public library',
      workerFallback: 'The public library is temporarily unavailable. Cached items are shown.', originalLink: 'Open original',
      feedLink: 'Open feed', source: 'Source', episodes: 'episodes', sources: 'sources', privacy: 'Public generated podcasts are listed for up to 30 days.', streamUnavailable: 'No direct browser stream is currently available. Open the station website.',
      global: 'All regions', europe: 'Europe', africa: 'Africa', northAmerica: 'North America', latinAmerica: 'Latin America', asia: 'Asia', oceania: 'Oceania',
      allCategories: 'All categories', politics: 'Politics', society: 'Society', culture: 'Culture'
    },
    de: {
      title: 'Audio-Hub', original: 'Original-Podcasts', generated: 'Erzeugte Podcasts', radio: 'Live-Radio',
      intro: 'Unabhängige Podcasts, öffentliche Azure-Audios und Live-Radio in einem Player.', search: 'Audio durchsuchen...',
      allSources: 'Alle Quellen', allLanguages: 'Alle Sprachen', refresh: 'Neu laden', loading: 'Audio wird geladen...',
      empty: 'Keine passenden Audios gefunden.', configured: 'Quelle eingerichtet; Folgen erscheinen nach der nächsten Datenaktualisierung.',
      configuredMany: 'Quellen eingerichtet; Folgen erscheinen nach der nächsten Datenaktualisierung.', publicLibrary: 'Öffentliche Bibliothek',
      workerFallback: 'Die öffentliche Bibliothek ist vorübergehend nicht erreichbar. Zwischengespeicherte Einträge werden angezeigt.', originalLink: 'Original öffnen',
      feedLink: 'Feed öffnen', source: 'Quelle', episodes: 'Folgen', sources: 'Quellen', privacy: 'Öffentlich erzeugte Podcasts werden bis zu 30 Tage angezeigt.', streamUnavailable: 'Derzeit ist kein direkter Browser-Stream verfügbar. Öffne die Senderseite.',
      global: 'Alle Regionen', europe: 'Europa', africa: 'Afrika', northAmerica: 'Nordamerika', latinAmerica: 'Lateinamerika', asia: 'Asien', oceania: 'Ozeanien',
      allCategories: 'Alle Kategorien', politics: 'Politik', society: 'Gesellschaft', culture: 'Kultur'
    },
    es: {
      title: 'Centro de audio', original: 'Podcasts originales', generated: 'Podcasts generados', radio: 'Radio en directo',
      intro: 'Podcasts independientes, audios públicos de Azure y radio en un solo reproductor.', search: 'Buscar audio...',
      allSources: 'Todas las fuentes', allLanguages: 'Todos los idiomas', refresh: 'Actualizar', loading: 'Cargando audio...',
      empty: 'No se encontró audio.', configured: 'fuente configurada; los episodios aparecerán tras la próxima actualización.',
      configuredMany: 'fuentes configuradas; los episodios aparecerán tras la próxima actualización.', publicLibrary: 'Biblioteca pública',
      workerFallback: 'La biblioteca pública no está disponible temporalmente. Se muestran elementos en caché.', originalLink: 'Abrir original',
      feedLink: 'Abrir feed', source: 'Fuente', episodes: 'episodios', sources: 'fuentes', privacy: 'Los podcasts públicos generados se muestran hasta 30 días.', streamUnavailable: 'No hay un stream directo disponible. Abre la página de la emisora.',
      global: 'Todas las regiones', europe: 'Europa', africa: 'África', northAmerica: 'Norteamérica', latinAmerica: 'Latinoamérica', asia: 'Asia', oceania: 'Oceanía'
    },
    fr: {
      title: 'Espace audio', original: 'Podcasts originaux', generated: 'Podcasts générés', radio: 'Radio en direct',
      intro: 'Podcasts indépendants, audios Azure publics et radio dans un lecteur unique.', search: 'Rechercher un audio...',
      allSources: 'Toutes les sources', allLanguages: 'Toutes les langues', refresh: 'Actualiser', loading: 'Chargement audio...',
      empty: 'Aucun audio correspondant.', configured: 'source configurée ; les épisodes apparaîtront après la prochaine mise à jour.',
      configuredMany: 'sources configurées ; les épisodes apparaîtront après la prochaine mise à jour.', publicLibrary: 'Bibliothèque publique',
      workerFallback: 'La bibliothèque publique est temporairement indisponible. Les éléments en cache sont affichés.', originalLink: 'Ouvrir l’original',
      feedLink: 'Ouvrir le flux', source: 'Source', episodes: 'épisodes', sources: 'sources', privacy: 'Les podcasts générés publics sont affichés pendant 30 jours maximum.', streamUnavailable: 'Aucun flux direct n’est disponible. Ouvrez le site de la station.',
      global: 'Toutes les régions', europe: 'Europe', africa: 'Afrique', northAmerica: 'Amérique du Nord', latinAmerica: 'Amérique latine', asia: 'Asie', oceania: 'Océanie'
    },
    it: {
      title: 'Hub audio', original: 'Podcast originali', generated: 'Podcast generati', radio: 'Radio in diretta',
      intro: 'Podcast indipendenti, audio Azure pubblici e radio in un unico lettore.', search: 'Cerca audio...',
      allSources: 'Tutte le fonti', allLanguages: 'Tutte le lingue', refresh: 'Aggiorna', loading: 'Caricamento audio...',
      empty: 'Nessun audio corrispondente.', configured: 'fonte configurata; gli episodi appariranno dopo il prossimo aggiornamento.',
      configuredMany: 'fonti configurate; gli episodi appariranno dopo il prossimo aggiornamento.', publicLibrary: 'Biblioteca pubblica',
      workerFallback: 'La biblioteca pubblica è temporaneamente non disponibile. Sono mostrati gli elementi in cache.', originalLink: 'Apri originale',
      feedLink: 'Apri feed', source: 'Fonte', episodes: 'episodi', sources: 'fonti', privacy: 'I podcast pubblici generati sono mostrati per un massimo di 30 giorni.', streamUnavailable: 'Nessuno stream diretto è disponibile. Apri il sito della stazione.',
      global: 'Tutte le regioni', europe: 'Europa', africa: 'Africa', northAmerica: 'Nord America', latinAmerica: 'America Latina', asia: 'Asia', oceania: 'Oceania'
    },
    pt: {
      title: 'Central de áudio', original: 'Podcasts originais', generated: 'Podcasts gerados', radio: 'Rádio ao vivo',
      intro: 'Podcasts independentes, áudios públicos do Azure e rádio num único leitor.', search: 'Pesquisar áudio...',
      allSources: 'Todas as fontes', allLanguages: 'Todos os idiomas', refresh: 'Atualizar', loading: 'Carregando áudio...',
      empty: 'Nenhum áudio correspondente.', configured: 'fonte configurada; os episódios aparecerão após a próxima atualização.',
      configuredMany: 'fontes configuradas; os episódios aparecerão após a próxima atualização.', publicLibrary: 'Biblioteca pública',
      workerFallback: 'A biblioteca pública está temporariamente indisponível. Itens em cache são exibidos.', originalLink: 'Abrir original',
      feedLink: 'Abrir feed', source: 'Fonte', episodes: 'episódios', sources: 'fontes', privacy: 'Podcasts públicos gerados ficam visíveis por até 30 dias.', streamUnavailable: 'Não há stream direto disponível. Abra o site da estação.',
      global: 'Todas as regiões', europe: 'Europa', africa: 'África', northAmerica: 'América do Norte', latinAmerica: 'América Latina', asia: 'Ásia', oceania: 'Oceania'
    },
    ru: {
      title: 'Аудиоцентр', original: 'Оригинальные подкасты', generated: 'Созданные подкасты', radio: 'Прямой эфир',
      intro: 'Независимые подкасты, общедоступные аудио Azure и радио в одном проигрывателе.', search: 'Поиск аудио...',
      allSources: 'Все источники', allLanguages: 'Все языки', refresh: 'Обновить', loading: 'Загрузка аудио...',
      empty: 'Подходящие аудио не найдены.', configured: 'источник настроен; выпуски появятся после следующего обновления данных.',
      configuredMany: 'источники настроены; выпуски появятся после следующего обновления данных.', publicLibrary: 'Общедоступная библиотека',
      workerFallback: 'Общедоступная библиотека временно недоступна. Показаны сохранённые записи.', originalLink: 'Открыть оригинал',
      feedLink: 'Открыть ленту', source: 'Источник', episodes: 'выпусков', sources: 'источников', privacy: 'Общедоступные созданные подкасты показываются до 30 дней.', streamUnavailable: 'Прямой поток недоступен. Откройте сайт станции.',
      global: 'Все регионы', europe: 'Европа', africa: 'Африка', northAmerica: 'Северная Америка', latinAmerica: 'Латинская Америка', asia: 'Азия', oceania: 'Океания'
    },
    el: {
      title: 'Κέντρο ήχου', original: 'Πρωτότυπα podcast', generated: 'Παραγόμενα podcast', radio: 'Ζωντανό ραδιόφωνο',
      intro: 'Ανεξάρτητα podcast, δημόσια ηχητικά Azure και ραδιόφωνο σε ένα πρόγραμμα αναπαραγωγής.', search: 'Αναζήτηση ήχου...',
      allSources: 'Όλες οι πηγές', allLanguages: 'Όλες οι γλώσσες', refresh: 'Ανανέωση', loading: 'Φόρτωση ήχου...',
      empty: 'Δεν βρέθηκε αντίστοιχο ηχητικό.', configured: 'η πηγή ρυθμίστηκε· τα επεισόδια θα εμφανιστούν μετά την επόμενη ενημέρωση.',
      configuredMany: 'οι πηγές ρυθμίστηκαν· τα επεισόδια θα εμφανιστούν μετά την επόμενη ενημέρωση.', publicLibrary: 'Δημόσια βιβλιοθήκη',
      workerFallback: 'Η δημόσια βιβλιοθήκη δεν είναι προσωρινά διαθέσιμη. Εμφανίζονται αποθηκευμένες εγγραφές.', originalLink: 'Άνοιγμα πρωτοτύπου',
      feedLink: 'Άνοιγμα ροής', source: 'Πηγή', episodes: 'επεισόδια', sources: 'πηγές', privacy: 'Τα δημόσια παραγόμενα podcast εμφανίζονται έως 30 ημέρες.', streamUnavailable: 'Δεν υπάρχει άμεση ροή. Ανοίξτε τον ιστότοπο του σταθμού.',
      global: 'Όλες οι περιοχές', europe: 'Ευρώπη', africa: 'Αφρική', northAmerica: 'Βόρεια Αμερική', latinAmerica: 'Λατινική Αμερική', asia: 'Ασία', oceania: 'Ωκεανία'
    },
    tr: {
      title: 'Ses merkezi', original: 'Orijinal podcastler', generated: 'Oluşturulan podcastler', radio: 'Canlı radyo',
      intro: 'Bağımsız podcastler, herkese açık Azure sesleri ve radyo tek oynatıcıda.', search: 'Ses ara...',
      allSources: 'Tüm kaynaklar', allLanguages: 'Tüm diller', refresh: 'Yenile', loading: 'Ses yükleniyor...',
      empty: 'Eşleşen ses bulunamadı.', configured: 'kaynak yapılandırıldı; bölümler sonraki veri güncellemesinden sonra görünecek.',
      configuredMany: 'kaynaklar yapılandırıldı; bölümler sonraki veri güncellemesinden sonra görünecek.', publicLibrary: 'Herkese açık kütüphane',
      workerFallback: 'Herkese açık kütüphane geçici olarak kullanılamıyor. Önbellekteki öğeler gösteriliyor.', originalLink: 'Orijinali aç',
      feedLink: 'Akışı aç', source: 'Kaynak', episodes: 'bölüm', sources: 'kaynak', privacy: 'Herkese açık oluşturulan podcastler 30 güne kadar gösterilir.', streamUnavailable: 'Doğrudan yayın kullanılamıyor. İstasyon sitesini açın.',
      global: 'Tüm bölgeler', europe: 'Avrupa', africa: 'Afrika', northAmerica: 'Kuzey Amerika', latinAmerica: 'Latin Amerika', asia: 'Asya', oceania: 'Okyanusya'
    }
  };

  const COUNTRY_REGION = Object.freeze({
    DZ:'africa', AO:'africa', BJ:'africa', BW:'africa', BF:'africa', BI:'africa', CM:'africa', CV:'africa', CF:'africa', TD:'africa', KM:'africa', CD:'africa', CG:'africa', CI:'africa', DJ:'africa', EG:'africa', GQ:'africa', ER:'africa', SZ:'africa', ET:'africa', GA:'africa', GM:'africa', GH:'africa', GN:'africa', GW:'africa', KE:'africa', LS:'africa', LR:'africa', LY:'africa', MG:'africa', MW:'africa', ML:'africa', MR:'africa', MU:'africa', MA:'africa', MZ:'africa', NA:'africa', NE:'africa', NG:'africa', RW:'africa', SN:'africa', SC:'africa', SL:'africa', SO:'africa', ZA:'africa', SS:'africa', SD:'africa', TZ:'africa', TG:'africa', TN:'africa', UG:'africa', ZM:'africa', ZW:'africa',
    AR:'latin-america', BO:'latin-america', BR:'latin-america', CL:'latin-america', CO:'latin-america', CR:'latin-america', CU:'latin-america', DO:'latin-america', EC:'latin-america', SV:'latin-america', GT:'latin-america', HT:'latin-america', HN:'latin-america', MX:'latin-america', NI:'latin-america', PA:'latin-america', PY:'latin-america', PE:'latin-america', PR:'latin-america', UY:'latin-america', VE:'latin-america',
    AU:'oceania', NZ:'oceania', FJ:'oceania', PG:'oceania', WS:'oceania', TO:'oceania', VU:'oceania', SB:'oceania', NC:'oceania', PF:'oceania', GU:'oceania',
    US:'north-america', CA:'north-america', GL:'north-america',
    CN:'asia', HK:'asia', IN:'asia', ID:'asia', JP:'asia', KP:'asia', KR:'asia', MY:'asia', MM:'asia', NP:'asia', PK:'asia', PH:'asia', SG:'asia', LK:'asia', TH:'asia', VN:'asia', BD:'asia', KH:'asia', LA:'asia', MN:'asia', TW:'asia', TL:'asia', AF:'asia', KZ:'asia', KG:'asia', TJ:'asia', TM:'asia', UZ:'asia',
    AL:'europe', AT:'europe', BE:'europe', BA:'europe', BG:'europe', HR:'europe', CY:'europe', CZ:'europe', DK:'europe', EE:'europe', FI:'europe', FR:'europe', DE:'europe', GR:'europe', HU:'europe', IS:'europe', IE:'europe', IT:'europe', LV:'europe', LT:'europe', LU:'europe', MT:'europe', MD:'europe', ME:'europe', NL:'europe', MK:'europe', NO:'europe', PL:'europe', PT:'europe', RO:'europe', RS:'europe', SK:'europe', SI:'europe', ES:'europe', SE:'europe', CH:'europe', UA:'europe', GB:'europe', UK:'europe', TR:'europe'
  });

  function languageCode() {
    try {
      if (typeof currentLang !== 'undefined' && currentLang) return String(currentLang).slice(0, 2).toLowerCase();
    } catch {}
    return String(document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  }

  function text() { return { ...TEXTS.en, ...(TEXTS[languageCode()] || {}) }; }
  function clean(value) { return String(value == null ? '' : value).trim(); }
  function key(value) { return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function unique(values) { return [...new Set(values.map(clean).filter(Boolean))]; }

  function safeUrl(value) {
    const input = clean(value);
    if (!input) return '';
    try {
      if (typeof getSafeHttpUrl === 'function') return getSafeHttpUrl(input) || '';
      const url = new URL(input, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function canonicalRegion(value, country = '') {
    const normalized = key(value);
    if (normalized) {
      if (['global', 'world', 'weltweit', 'international'].includes(normalized)) return 'global';
      if (/oceania|ozeanien|okyanusya|okeanija|океания|ωκεania|australia|aotearoa|new zealand|pacific/.test(normalized)) return 'oceania';
      if (/latin america|lateinamerika|latinoamerica|america latina|amerique latine|latinskaja amerika/.test(normalized)) return 'latin-america';
      if (/north america|nordamerika|norteamerica|amerique du nord|america do norte|kuzey amerika/.test(normalized)) return 'north-america';
      if (/africa|afrika|afrique|afriki/.test(normalized)) return 'africa';
      if (/asia|asien|asie|azija|asya/.test(normalized)) return 'asia';
      if (/europe|europa|evropa|evropi|dach/.test(normalized)) return 'europe';
    }
    const code = clean(country).toUpperCase();
    if (COUNTRY_REGION[code]) return COUNTRY_REGION[code];
    return 'global';
  }

  function sourceMaps(sources) {
    const byId = new Map();
    const byName = new Map();
    sources.forEach(source => {
      if (source?.id) byId.set(key(source.id), source);
      if (source?.name) byName.set(key(source.name), source);
    });
    return { byId, byName };
  }

  function matchSource(item, maps) {
    return maps.byId.get(key(item?.sourceId)) || maps.byName.get(key(item?.sourceName || item?.source || item?.publisher)) || null;
  }

  function candidateUrls(item) {
    const values = [
      item?.audioUrl, item?.audio_url, item?.enclosureUrl, item?.enclosure, item?.mediaUrl,
      item?.file, item?.url, ...(Array.isArray(item?.audioUrls) ? item.audioUrls : []),
      ...(Array.isArray(item?.candidates) ? item.candidates : [])
    ];
    return unique(values).map(safeUrl).filter(Boolean);
  }

  function editorialCategory(item, source = null) {
    const haystack = key([
      item?.title, item?.description, item?.summary, item?.content,
      item?.category, ...(Array.isArray(item?.categories) ? item.categories : []),
      ...(Array.isArray(source?.tags) ? source.tags : [])
    ].filter(Boolean).join(' '));
    if (/(election|government|parliament|state|war|imperial|fascis|anarch|union|strike|protest|prison|politi|regierung|wahl|krieg|streik)/.test(haystack)) return 'politics';
    if (/(culture|cultural|history|book|literature|film|art |theory|education|kultur|geschichte|buch|kunst)/.test(haystack)) return 'culture';
    return 'society';
  }

  function isEditoriallyRelevant(item, source = null) {
    const haystack = key([
      item?.title, item?.description, item?.summary
    ].filter(Boolean).join(' '));
    const entertainmentOnly = /(jazz|playlist|dj set|music mix|musiksendung|hitparade|sports show|gaming|celebrity gossip|mystery radio club|meet the beat|musica machina|music show|radioshow|charts|dance mix|party mix)/.test(haystack);
    const politicalContext = /(polit|society|social|movement|anarch|feminis|antifasc|anticapital|labor|labour|worker|strike|protest|ecolog|climate|colonial|indigenous|migration|refugee|prison|abolition|history|theory|rights|justice|solidarity)/.test(haystack);
    // Eine generell passende Quelle macht eine konkrete reine Musik- oder
    // Unterhaltungssendung noch nicht redaktionell relevant.
    if (entertainmentOnly && !politicalContext) return false;
    return politicalContext || source?.editorialRelevant === true || !entertainmentOnly;
  }

  function normalizePodcast(item, kind, maps) {
    if (!item || typeof item !== 'object') return null;
    const source = matchSource(item, maps);
    const candidates = candidateUrls(item);
    if (!candidates.length) return null;
    const sourceName = clean(item.sourceName || item.source || item.publisher || source?.name || 'World Revolution News');
    const country = clean(item.country || item.originCountry || source?.country).toUpperCase();
    const region = canonicalRegion(item.region || item.continent || item.kontinent || item.originRegion || source?.region, country);
    const created = clean(item.createdAt || item.published || item.pubDate || item.date);
    const id = clean(item.id || item.guid || candidates[0]);
    return {
      id: `${kind}:${id}`,
      rawId: id,
      kind,
      title: clean(item.title || item.name || 'Podcast'),
      description: clean(item.description || item.summary || item.content || item.text),
      sourceName,
      sourceId: clean(item.sourceId || source?.id),
      language: clean(item.language || item.lang || source?.language || 'und').toLowerCase(),
      country,
      region,
      candidates,
      artwork: safeUrl(item.artwork || item.image || item.cover),
      originalUrl: safeUrl(item.articleUrl || item.originalUrl || item.episodeUrl || item.link || item.homepage || source?.homepage),
      feedUrl: safeUrl(item.feedUrl || source?.feedUrl || source?.feedUrls?.[0]),
      createdAt: created,
      duration: clean(item.duration || item.durationText),
      mode: clean(item.mode),
      voice: clean(item.voiceLabel || item.voice),
      license: clean(item.license || source?.license),
      editorialCategory: editorialCategory(item, source)
    };
  }

  function normalizeRadio(item) {
    if (!item || typeof item !== 'object' || item.enabled === false) return null;
    const candidates = unique([...(Array.isArray(item.streamCandidates) ? item.streamCandidates : []), item.streamUrl, item.url]).map(safeUrl).filter(Boolean);
    const originalUrl = safeUrl(item.website);
    if (!candidates.length && !originalUrl) return null;
    return {
      id: `radio:${clean(item.id || item.name || candidates[0])}`,
      rawId: clean(item.id || item.name || candidates[0]),
      kind: 'radio', title: clean(item.name || 'Live radio'), description: clean(item.description),
      sourceName: clean(item.name), language: clean((item.languages || [item.language]).filter(Boolean).join(', ')).toLowerCase(),
      country: clean(item.country).toUpperCase(), region: canonicalRegion(item.region, item.country), candidates,
      artwork: safeUrl(item.artwork), originalUrl, createdAt: ''
    };
  }

  function dedupe(items) {
    const seen = new Set();
    return items.filter(item => {
      const identity = key(item.rawId || item.candidates?.[0] || item.title);
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  function dedupeGenerated(items) {
    const sorted = [...items].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const seen = new Set();
    return sorted.filter(item => {
      const identity = key([
        item.title,
        item.originalUrl,
        item.language,
        item.mode,
        item.voice
      ].join('|')) || key(item.candidates?.[0] || item.rawId);
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || 9000);
    try {
      const response = await fetch(url, { cache: options.cache || 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { data: await response.json(), date: response.headers.get('last-modified') || response.headers.get('date') || '' };
    } finally { clearTimeout(timer); }
  }

  async function loadSources() {
    if (state.sources.length) return state.sources;
    try {
      const result = await fetchJson(`${SOURCE_URL}?v=183`, { cache: 'default' });
      state.sources = Array.isArray(result.data) ? result.data : [];
    } catch { state.sources = []; }
    return state.sources;
  }

  async function loadOriginal(force = false) {
    if (state.loading.original || (state.loaded.original && !force)) return;
    state.loading.original = true; state.error.original = ''; render();
    try {
      const [, result] = await Promise.all([
        loadSources(),
        fetchJson(`${window.WRN_CONFIG?.dataUrls?.podcasts || './podcasts.json'}?v=${force ? Date.now() : '183'}`, { cache: force ? 'no-store' : 'default', timeout: 12000 })
      ]);
      const maps = sourceMaps(state.sources);
      state.original = dedupe((Array.isArray(result.data) ? result.data : [])
        .map(item => {
          const source = matchSource(item, maps);
          return isEditoriallyRelevant(item, source)
            ? normalizePodcast(item, 'original', maps)
            : null;
        })
        .filter(Boolean));
      state.loaded.original = true;
      window.WRNStatusCenter?.noteDataset?.('podcasts', { data: state.original, source: 'network', updatedAt: result.date || new Date().toISOString() });
    } catch (error) { state.error.original = clean(error?.message || error); }
    finally { state.loading.original = false; render(); }
  }

  async function loadGenerated(force = false) {
    if (state.loading.generated || (state.loaded.generated && !force)) return;
    state.loading.generated = true; state.error.generated = ''; render();
    const maps = sourceMaps(await loadSources());
    const collected = [];
    let workerError = '';
    const proxy = clean(window.WRN_CONFIG?.proxyUrl || (typeof PROXY_URL !== 'undefined' ? PROXY_URL : ''));
    if (proxy) {
      try {
        const result = await fetchJson(`${proxy}/?action=podcasts.list&limit=100&v=${Date.now()}`, { timeout: 12000 });
        const rows = Array.isArray(result.data?.items) ? result.data.items : [];
        collected.push(...rows);
      } catch (error) { workerError = clean(error?.message || error); }
    }
    for (const url of GENERATED_URLS) {
      try {
        const result = await fetchJson(`${url}?v=${force ? Date.now() : '183'}`, { cache: force ? 'no-store' : 'default', timeout: 5000 });
        const rows = Array.isArray(result.data) ? result.data : (Array.isArray(result.data?.items) ? result.data.items : []);
        if (rows.length) collected.push(...rows);
      } catch {}
    }
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    state.generated = dedupeGenerated(collected.map(item => normalizePodcast(item, 'generated', maps)).filter(Boolean).filter(item => {
      if (!item.createdAt) return true;
      const time = new Date(item.createdAt).getTime();
      return !Number.isFinite(time) || time >= cutoff;
    }));
    state.loaded.generated = true;
    state.error.generated = state.generated.length ? '' : workerError;
    state.loading.generated = false;
    window.WRNStatusCenter?.noteDataset?.('generated', { data: state.generated, source: state.generated.length ? 'network' : 'none', updatedAt: new Date().toISOString(), error: workerError ? new Error(workerError) : null });
    render();
  }

  async function loadRadio(force = false) {
    if (state.loading.radio || (state.loaded.radio && !force)) return;
    state.loading.radio = true; state.error.radio = ''; render();
    try {
      const result = await fetchJson(`${window.WRN_CONFIG?.dataUrls?.radio || './radio-stations.json'}?v=${force ? Date.now() : '183'}`, { cache: force ? 'no-store' : 'default', timeout: 12000 });
      state.radio = dedupe((Array.isArray(result.data) ? result.data : []).map(normalizeRadio).filter(Boolean));
      state.loaded.radio = true;
      window.WRNStatusCenter?.noteDataset?.('radio', { data: state.radio, source: 'network', updatedAt: result.date || new Date().toISOString() });
    } catch (error) { state.error.radio = clean(error?.message || error); }
    finally { state.loading.radio = false; render(); }
  }

  function regionLabel(region) {
    const t = text();
    return ({ global:t.global, europe:t.europe, africa:t.africa, 'north-america':t.northAmerica, 'latin-america':t.latinAmerica, asia:t.asia, oceania:t.oceania })[region] || region;
  }

  function currentRows() {
    const rows = state.view === 'generated' ? state.generated : state.view === 'radio' ? state.radio : state.original;
    const query = key(state.search);
    return rows.filter(item => state.source === 'all' || item.sourceName === state.source)
      .filter(item => state.language === 'all' || item.language === state.language)
      .filter(item => state.category === 'all' || item.editorialCategory === state.category)
      .filter(item => state.region === 'global' || item.region === state.region)
      .filter(item => !query || key(`${item.title} ${item.description} ${item.sourceName}`).includes(query))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  function configuredSourceCounts() {
    const counts = Object.fromEntries(REGIONS.map(region => [region, 0]));
    state.sources.forEach(source => {
      const region = canonicalRegion(source.region, source.country);
      counts[region] = (counts[region] || 0) + 1;
      counts.global += 1;
    });
    return counts;
  }

  function episodeCounts() {
    const counts = Object.fromEntries(REGIONS.map(region => [region, 0]));
    const rows = state.view === 'radio' ? state.radio : state.view === 'generated' ? state.generated : state.original;
    rows.forEach(item => { counts[item.region] = (counts[item.region] || 0) + 1; counts.global += 1; });
    return counts;
  }

  function ensureRoot() {
    document.getElementById('wrn-audio-tab-181')?.remove();
    let root = document.getElementById(VIEW_ID);
    if (root) return root;
    root = document.createElement('section');
    root.id = VIEW_ID; root.className = 'wrn-audio-tab-panel-183'; root.hidden = true;
    const anchor = document.getElementById('feed-container');
    anchor?.parentNode?.insertBefore(root, anchor);
    return root;
  }

  function hideStandardViews() {
    ['feed-container','archive-container','event-filter-panel','status-container','txt-archive-title','wrn-video-hub','wrn-stories-timeline','wrn-briefing-2'].forEach(id => {
      const node = document.getElementById(id); if (!node) return;
      if (!hiddenNodes.has(node)) hiddenNodes.set(node, { hidden:node.hidden, display:node.style.display });
      node.hidden = true; node.style.display = 'none';
    });
  }

  function restoreStandardViews() {
    hiddenNodes.forEach((value, node) => { if (!node.isConnected) return; node.hidden = value.hidden; node.style.display = value.display; });
    hiddenNodes.clear();
  }

  function makeButton(label, className, handler) {
    const button = document.createElement('button'); button.type = 'button'; button.className = className; button.textContent = label; button.addEventListener('click', handler); return button;
  }

  function firstSentence(value, limit = 240) {
    const content = clean(value).replace(/\s+/g, ' ').trim();
    if (!content) return '';
    const sentence = content.match(/^.{1,240}?[.!?](?:\s|$)/)?.[0] || content.slice(0, limit);
    return sentence.trim() + (sentence.length < content.length && !/[.!?]$/.test(sentence.trim()) ? '…' : '');
  }

  function appendMedia(card, item) {
    const statusId = `media-status-${clean(item.id).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120)}`;
    const config = { id:item.id, kind:item.kind, title:item.title, artist:item.sourceName, candidates:item.candidates, artwork:item.artwork, statusId, showPause:item.kind !== 'radio', showProgress:item.kind !== 'radio' };
    if (typeof appendSimpleMediaControls === 'function') appendSimpleMediaControls(card, config);
    else card.append(makeButton(`▶ ${item.title}`, 'btn-media-play', () => window.WRNMediaPlayer?.play?.(config)));
    window.WRNAudioTools?.appendCardActions?.(card, config, { queue:item.kind !== 'radio' });
  }

  function renderCard(item) {
    const t = text();
    const card = document.createElement('article'); card.className = 'wrn-audio-card-183';
    if (state.highlightId && item.rawId === state.highlightId) card.classList.add('is-highlighted');
    const title = document.createElement('h3'); title.textContent = item.title; card.append(title);
    const meta = document.createElement('div'); meta.className = 'wrn-audio-meta-183';
    const parts = [item.sourceName, item.createdAt ? new Date(item.createdAt).toLocaleDateString(languageCode()) : '', item.language && item.language !== 'und' ? item.language.toUpperCase() : '', item.duration, regionLabel(item.region)].filter(Boolean);
    meta.textContent = parts.join(' · '); card.append(meta);
    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'wrn-audio-first-sentence-184';
      desc.textContent = firstSentence(item.description);
      card.append(desc);
    }
    if (item.candidates.length) appendMedia(card, item);
    else {
      const unavailable = document.createElement('p');
      unavailable.className = 'wrn-audio-warning-183';
      unavailable.textContent = t.streamUnavailable;
      card.append(unavailable);
    }
    const links = document.createElement('div'); links.className = 'wrn-audio-links-183';
    if (item.originalUrl) { const link = document.createElement('a'); link.href=item.originalUrl; link.target='_blank'; link.rel='noopener noreferrer'; link.referrerPolicy='no-referrer'; link.textContent=t.originalLink; links.append(link); }
    if (item.feedUrl) { const link = document.createElement('a'); link.href=item.feedUrl; link.target='_blank'; link.rel='noopener noreferrer'; link.referrerPolicy='no-referrer'; link.textContent=t.feedLink; links.append(link); }
    card.append(links); return card;
  }

  function render() {
    if (!state.active) return;
    const root = ensureRoot();
    const t = text(); root.textContent = '';
    const head = document.createElement('header'); head.className = 'wrn-audio-head-183';
    const copy = document.createElement('div'); const h2 = document.createElement('h2'); h2.textContent=t.title; const intro=document.createElement('p'); intro.textContent=t.intro; copy.append(h2,intro);
    const refresh = makeButton(t.refresh, 'wrn-audio-refresh-183', () => loadView(true)); head.append(copy,refresh); root.append(head);

    if (state.view === 'generated') { const note=document.createElement('p'); note.className='wrn-audio-public-note-183'; note.textContent=`${t.publicLibrary}: ${t.privacy}`; root.append(note); }

    const controls=document.createElement('div'); controls.className='wrn-audio-controls-183';
    const search=document.createElement('input'); search.type='search'; search.placeholder=t.search; search.value=state.search; search.addEventListener('input',()=>{state.search=search.value; renderList();}); controls.append(search);
    const rows=state.view==='generated'?state.generated:state.view==='radio'?state.radio:state.original;
    const sourceSelect=document.createElement('select'); sourceSelect.append(new Option(t.allSources,'all')); unique(rows.map(item=>item.sourceName)).sort().forEach(value=>sourceSelect.append(new Option(value,value))); sourceSelect.value=state.source; sourceSelect.addEventListener('change',()=>{state.source=sourceSelect.value; renderList();}); controls.append(sourceSelect);
    const languageSelect=document.createElement('select'); languageSelect.append(new Option(t.allLanguages,'all')); unique(rows.map(item=>item.language).filter(value=>value&&value!=='und')).sort().forEach(value=>languageSelect.append(new Option(value.toUpperCase(),value))); languageSelect.value=state.language; languageSelect.addEventListener('change',()=>{state.language=languageSelect.value; renderList();}); controls.append(languageSelect);
    if (state.view === 'original') {
      const categorySelect=document.createElement('select');
      categorySelect.append(
        new Option(t.allCategories,'all'),
        new Option(t.politics,'politics'),
        new Option(t.society,'society'),
        new Option(t.culture,'culture')
      );
      categorySelect.value=state.category;
      categorySelect.addEventListener('change',()=>{state.category=categorySelect.value;renderList();});
      controls.append(categorySelect);
    }
    root.append(controls);

    if (state.view === 'original') {
      const regions=document.createElement('div'); regions.className='wrn-audio-regions-183';
      const episodes=episodeCounts(); const sources=configuredSourceCounts();
      REGIONS.forEach(region=>{
        const count=episodes[region]||0; const sourceCount=sources[region]||0;
        const suffix=count>0
          ?String(count)
          :(sourceCount>0?`${sourceCount} ${sourceCount===1?t.source:t.sources}`:'0');
        const button=makeButton(`${regionLabel(region)} (${suffix})`, `wrn-audio-region-183${state.region===region?' active':''}`,()=>{state.region=region; renderList(); document.querySelectorAll('.wrn-audio-region-183').forEach(node=>node.classList.toggle('active',node===button));});
        button.title=count>0?`${count} ${t.episodes}`:`${sourceCount} ${t.sources}`; regions.append(button);
      }); root.append(regions);
    }
    const status=document.createElement('div'); status.id='wrn-audio-status-183'; status.className='wrn-audio-status-183'; root.append(status);
    const list=document.createElement('div'); list.id='wrn-audio-list-183'; list.className='wrn-audio-list-183'; root.append(list); renderList();
  }

  function renderList() {
    const list=document.getElementById('wrn-audio-list-183'); const status=document.getElementById('wrn-audio-status-183'); if(!list||!status)return;
    const t=text(); const view=state.view; list.textContent=''; status.textContent='';
    if(state.loading[view]){status.textContent=t.loading;return;}
    const rows=currentRows();
    if(!rows.length){
      if(state.error[view]) status.textContent=`${t.empty} ${state.error[view]}`;
      else if(view==='original'&&state.region!=='global'){
        const count=configuredSourceCounts()[state.region]||0;
        status.textContent=count?`${count} ${count===1?t.configured:t.configuredMany}`:t.empty;
      } else status.textContent=t.empty;
      return;
    }
    const fragment=document.createDocumentFragment(); rows.slice(0,220).forEach(item=>fragment.append(renderCard(item))); list.append(fragment);
    if(view==='generated'&&state.error.generated){const warning=document.createElement('p');warning.className='wrn-audio-warning-183';warning.textContent=t.workerFallback;list.prepend(warning);}
    setTimeout(()=>document.querySelectorAll('#wrn-audio-tab-183 input[type="range"]').forEach(range=>range.classList.add('wrn-seekable-183')),0);
  }

  function loadView(force=false){ if(state.view==='generated')return loadGenerated(force); if(state.view==='radio')return loadRadio(force); return loadOriginal(force); }

  function open(view='original', highlightId=''){
    state.active=true; state.view=['original','generated','radio'].includes(view)?view:'original'; state.highlightId=clean(highlightId); state.region='global'; state.category='all';
    hideStandardViews(); const root=ensureRoot(); root.hidden=false; root.style.display='block'; document.body.dataset.wrnTab='audio'; render(); void loadView(false);
  }
  function close(){state.active=false; const root=document.getElementById(VIEW_ID); if(root){root.hidden=true;root.style.display='none';} if(document.body.dataset.wrnTab==='audio')delete document.body.dataset.wrnTab; restoreStandardViews();}

  const api=Object.freeze({ version:'1.8.4', open, close, show:open, hide:close, render, refresh:()=>loadView(true), identifyRegion:canonicalRegion, normalizePodcast:(item,kind='original')=>normalizePodcast(item,kind,sourceMaps(state.sources)), getState:()=>({active:state.active,view:state.view,counts:{original:state.original.length,generated:state.generated.length,radio:state.radio.length}}) });
  window.WRNAudioTab181=api; window.WRNAudioTab183=api;
  window.openAudioHub=(tab='original',highlightId='')=>open(tab,highlightId);
  window.openPodcastLibrary=(highlightId='')=>open(highlightId?'generated':'original',highlightId);

  document.getElementById('ui-language')?.addEventListener('change',()=>{ if(state.active)render(); });
})();
