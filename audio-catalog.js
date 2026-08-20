/* World Revolution News 1.7.5 – Audio-Katalog, Status und Quellenprüfung */
'use strict';

(() => {
  if (window.__wrnAudioCatalog175Loaded) return;
  window.__wrnAudioCatalog175Loaded = true;

  const STORAGE_KEY = 'wrn_audio_catalog_filters_v1';
  const HEALTH_REFRESH_MS = 5 * 60 * 1000;

  const TEXTS = {
    de: {
      topics:'Themen', regions:'Regionen', languages:'Sprachen', sources:'Quellen',
      all:'Alle', available:'Funktionierend', allStatuses:'Alle Status',
      health:'Quellenprüfung', healthy:'funktionierend', stale:'älter, aber nutzbar', degraded:'vorübergehend gestört · Ersatzstream',
      broken:'derzeit gestört', unknown:'noch nicht geprüft', reset:'Filter zurücksetzen',
      noItems:'Keine passenden Audioinhalte gefunden.', searchRadio:'Radios durchsuchen…',
      station:'Sender', sourceStatus:'Quellenstatus', catalogInfo:'Kuratierter Audio-Katalog',
      retry:'Erneut prüfen', unavailable:'Stream derzeit nicht erreichbar',
      openWebsite:'Senderseite öffnen', podcastCount:'Folgen', radioCount:'Sender'
    },
    en: {
      topics:'Topics', regions:'Regions', languages:'Languages', sources:'Sources',
      all:'All', available:'Working', allStatuses:'All statuses',
      health:'Source check', healthy:'working', stale:'older but usable', degraded:'temporarily degraded · fallback stream',
      broken:'currently unavailable', unknown:'not checked yet', reset:'Reset filters',
      noItems:'No matching audio content found.', searchRadio:'Search radio stations…',
      station:'Station', sourceStatus:'Source status', catalogInfo:'Curated audio catalog',
      retry:'Check again', unavailable:'Stream currently unavailable',
      openWebsite:'Open station website', podcastCount:'episodes', radioCount:'stations'
    },
    es: {
      topics:'Temas', regions:'Regiones', languages:'Idiomas', sources:'Fuentes',
      all:'Todos', available:'Funcionando', allStatuses:'Todos los estados',
      health:'Comprobación de fuentes', healthy:'funciona', stale:'antiguo pero utilizable',
      broken:'no disponible', unknown:'sin comprobar', reset:'Restablecer filtros',
      noItems:'No se encontró audio coincidente.', searchRadio:'Buscar radios…',
      station:'Emisora', sourceStatus:'Estado', catalogInfo:'Catálogo de audio seleccionado',
      retry:'Comprobar de nuevo', unavailable:'Emisión no disponible',
      openWebsite:'Abrir sitio de la emisora', podcastCount:'episodios', radioCount:'emisoras'
    },
    fr: {
      topics:'Thèmes', regions:'Régions', languages:'Langues', sources:'Sources',
      all:'Tous', available:'Fonctionnels', allStatuses:'Tous les états',
      health:'Vérification des sources', healthy:'fonctionnel', stale:'ancien mais utilisable',
      broken:'indisponible', unknown:'non vérifié', reset:'Réinitialiser les filtres',
      noItems:'Aucun contenu audio correspondant.', searchRadio:'Rechercher des radios…',
      station:'Radio', sourceStatus:'État', catalogInfo:'Catalogue audio sélectionné',
      retry:'Vérifier à nouveau', unavailable:'Flux indisponible',
      openWebsite:'Ouvrir le site', podcastCount:'épisodes', radioCount:'radios'
    },
    it: {
      topics:'Temi', regions:'Regioni', languages:'Lingue', sources:'Fonti',
      all:'Tutti', available:'Funzionanti', allStatuses:'Tutti gli stati',
      health:'Controllo fonti', healthy:'funzionante', stale:'datato ma utilizzabile',
      broken:'non disponibile', unknown:'non verificato', reset:'Reimposta filtri',
      noItems:'Nessun contenuto audio corrispondente.', searchRadio:'Cerca radio…',
      station:'Emittente', sourceStatus:'Stato', catalogInfo:'Catalogo audio selezionato',
      retry:'Controlla di nuovo', unavailable:'Stream non disponibile',
      openWebsite:'Apri sito emittente', podcastCount:'episodi', radioCount:'emittenti'
    },
    pt: {
      topics:'Temas', regions:'Regiões', languages:'Idiomas', sources:'Fontes',
      all:'Todos', available:'A funcionar', allStatuses:'Todos os estados',
      health:'Verificação de fontes', healthy:'a funcionar', stale:'antigo mas utilizável',
      broken:'indisponível', unknown:'não verificado', reset:'Repor filtros',
      noItems:'Nenhum áudio correspondente.', searchRadio:'Pesquisar rádios…',
      station:'Emissora', sourceStatus:'Estado', catalogInfo:'Catálogo de áudio selecionado',
      retry:'Verificar novamente', unavailable:'Transmissão indisponível',
      openWebsite:'Abrir site', podcastCount:'episódios', radioCount:'emissoras'
    },
    ru: {
      topics:'Темы', regions:'Регионы', languages:'Языки', sources:'Источники',
      all:'Все', available:'Работают', allStatuses:'Все состояния',
      health:'Проверка источников', healthy:'работает', stale:'старый, но доступный',
      broken:'недоступен', unknown:'не проверен', reset:'Сбросить фильтры',
      noItems:'Подходящие аудиоматериалы не найдены.', searchRadio:'Поиск радиостанций…',
      station:'Станция', sourceStatus:'Состояние', catalogInfo:'Отобранный аудиокаталог',
      retry:'Проверить снова', unavailable:'Поток недоступен',
      openWebsite:'Открыть сайт', podcastCount:'выпусков', radioCount:'станций'
    },
    el: {
      topics:'Θέματα', regions:'Περιοχές', languages:'Γλώσσες', sources:'Πηγές',
      all:'Όλα', available:'Λειτουργούν', allStatuses:'Όλες οι καταστάσεις',
      health:'Έλεγχος πηγών', healthy:'λειτουργεί', stale:'παλιό αλλά διαθέσιμο',
      broken:'μη διαθέσιμο', unknown:'δεν ελέγχθηκε', reset:'Επαναφορά φίλτρων',
      noItems:'Δεν βρέθηκε αντίστοιχο ηχητικό περιεχόμενο.', searchRadio:'Αναζήτηση ραδιοφώνων…',
      station:'Σταθμός', sourceStatus:'Κατάσταση', catalogInfo:'Επιλεγμένος κατάλογος ήχου',
      retry:'Νέος έλεγχος', unavailable:'Η ροή δεν είναι διαθέσιμη',
      openWebsite:'Άνοιγμα ιστοτόπου', podcastCount:'επεισόδια', radioCount:'σταθμοί'
    },
    tr: {
      topics:'Konular', regions:'Bölgeler', languages:'Diller', sources:'Kaynaklar',
      all:'Tümü', available:'Çalışan', allStatuses:'Tüm durumlar',
      health:'Kaynak kontrolü', healthy:'çalışıyor', stale:'eski ama kullanılabilir',
      broken:'kullanılamıyor', unknown:'henüz kontrol edilmedi', reset:'Filtreleri sıfırla',
      noItems:'Eşleşen ses içeriği bulunamadı.', searchRadio:'Radyo ara…',
      station:'İstasyon', sourceStatus:'Durum', catalogInfo:'Seçilmiş ses kataloğu',
      retry:'Tekrar kontrol et', unavailable:'Yayın kullanılamıyor',
      openWebsite:'İstasyon sitesini aç', podcastCount:'bölüm', radioCount:'istasyon'
    }
  };

  const SOURCE_META = {
    'aradio-berlin':{region:'DACH',topics:['Anarchismus','Antifaschismus']},
    'bad-news':{region:'International',topics:['Anarchismus','International']},
    'dissens':{region:'DACH',topics:['Theorie & Strategie','Antikapitalismus']},
    'final-straw':{region:'Nordamerika',topics:['Anarchismus','Anti-Rep & Knast']},
    'radio-corax':{region:'DACH',topics:['Freie Radios','Antifaschismus']},
    'radio-dreyeckland':{region:'DACH',topics:['Freie Radios','Politik']},
    'fsk-hamburg':{region:'DACH',topics:['Freie Radios','Antikapitalismus']},
    'radio-blau':{region:'DACH',topics:['Freie Radios']},
    'coloradio':{region:'DACH',topics:['Freie Radios']},
    'radio-z':{region:'DACH',topics:['Freie Radios']},
    'lora-muenchen':{region:'DACH',topics:['Freie Radios','Ökologie']},
    'common-voices':{region:'DACH',topics:['Migration','Mehrsprachig']},
    'frequenz-a':{region:'DACH',topics:['Anarchismus']},
    'crimethinc-ex-worker':{region:'Nordamerika',topics:['Anarchismus','Theorie & Strategie']},
    'its-going-down':{region:'Nordamerika',topics:['Antifaschismus','Anarchismus']},
    'radio-blackout':{region:'Europa',topics:['Freie Radios','Antikapitalismus']},
    'radio-onda-rossa':{region:'Europa',topics:['Freie Radios','Antikapitalismus']},
    'working-class-history':{region:'Europa',topics:['Arbeitskämpfe','Geschichte']},
    'indigenous-action':{region:'Nordamerika',topics:['Indigene Kämpfe','Antikolonialismus']},
    'rev-left-radio':{region:'Nordamerika',topics:['Theorie & Strategie','Antikapitalismus']},
    'red-menace':{region:'Nordamerika',topics:['Theorie & Strategie','Antikapitalismus']},
    'guerrilla-history':{region:'Nordamerika',topics:['Geschichte','Antikolonialismus']},
    'millennials-killing-capitalism':{region:'Nordamerika',topics:['Antikapitalismus','Arbeitskämpfe']},
    'black-myths':{region:'Nordamerika',topics:['Antirassismus','Geschichte']},
    'freie-radios':{region:'DACH',topics:['Freie Radios','Politik']},
    'black-autonomy':{region:'Nordamerika',topics:['Anarchismus','Antirassismus','Black Liberation']},
    'the-response':{region:'Nordamerika',topics:['Mutual Aid','Klima','Selbstorganisation']},
    'srsly-wrong':{region:'Nordamerika',topics:['Bibliotheksökonomie','Soziale Ökologie','Antikapitalismus']}
  };

  let podcastHealth = {};
  let radioHealth = {};
  let lastHealthFetch = 0;
  let filters = loadFilters();

  function lang() {
    const current = String(
      (typeof currentLang !== 'undefined' && currentLang)
      || document.documentElement.lang
      || 'de'
    ).toLowerCase();
    return TEXTS[current] ? current : 'en';
  }

  function t() { return TEXTS[lang()] || TEXTS.en; }

  function loadFilters() {
    const defaults = {
      podcastTopic:'', podcastRegion:'', podcastLanguage:'', podcastStatus:'available',
      radioTopic:'', radioRegion:'', radioLanguage:'', radioStatus:'available', radioSearch:''
    };
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch {
      return defaults;
    }
  }

  function saveFilters() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); } catch {}
  }

  function values(item, key) {
    const raw = item?.[key];
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (raw) return [String(raw)];
    return [];
  }

  function podcastTopics(item) {
    const meta = SOURCE_META[item.sourceId] || {};
    return [...new Set([
      ...values(item, 'topics'),
      ...values(item, 'categories'),
      ...values(meta, 'topics')
    ])];
  }

  function podcastRegion(item) {
    return String(item.region || SOURCE_META[item.sourceId]?.region || '').trim();
  }

  function statusForPodcast(item) {
    const status = podcastHealth[item.sourceId]?.status;
    return status || (podcastHealth[item.sourceId]?.ok === true ? 'healthy' : 'unknown');
  }

  function statusForRadio(station) {
    return radioHealth[station.id]?.status
      || station.healthStatus
      || (radioHealth[station.id]?.ok === true ? 'healthy' : 'unknown');
  }

  function statusMatches(status, selected) {
    if (!selected || selected === 'all') return true;
    if (selected === 'available') return ['healthy','stale','degraded'].includes(status);
    return status === selected;
  }

  async function loadHealth(force = false) {
    if (!force && Date.now() - lastHealthFetch < HEALTH_REFRESH_MS) return;
    lastHealthFetch = Date.now();
    const urls = window.WRN_CONFIG?.dataUrls || {};

    const fetchJson = async (url) => {
      if (!url) return {};
      try {
        const response = await fetch(`${url}?v=${force ? Date.now() : '175'}`, {
          cache: force ? 'no-store' : 'default'
        });
        return response.ok ? await response.json() : {};
      } catch {
        return {};
      }
    };

    [podcastHealth, radioHealth] = await Promise.all([
      fetchJson(urls.podcastHealth || './podcast-health.json'),
      fetchJson(urls.radioHealth || './radio-health.json')
    ]);
    renderHealthSummary();
  }

  function sortedUnique(list) {
    return [...new Set(list.map(value => String(value || '').trim()).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b, lang()));
  }

  function makeChip(value, label, group, selected, onChange) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `wrn-audio-chip${selected === value ? ' active' : ''}`;
    button.textContent = label;
    button.dataset.value = value;
    button.dataset.group = group;
    button.addEventListener('click', () => onChange(value));
    return button;
  }

  function createChipRow(label, group, options, selected, onChange) {
    const row = document.createElement('div');
    row.className = 'wrn-audio-filter-row';

    const heading = document.createElement('strong');
    heading.className = 'wrn-audio-filter-label';
    heading.textContent = label;

    const scroller = document.createElement('div');
    scroller.className = 'wrn-audio-chip-scroll';
    options.forEach(([value, text]) => {
      scroller.append(makeChip(value, text, group, selected, onChange));
    });

    row.append(heading, scroller);
    return row;
  }

  function ensurePodcastMenu() {
    const panel = document.getElementById('panel-original-podcasts');
    const toolbar = panel?.querySelector('.podcast-library-toolbar');
    if (!panel || !toolbar) return null;

    let menu = document.getElementById('wrn-podcast-submenus');
    if (!menu) {
      menu = document.createElement('section');
      menu.id = 'wrn-podcast-submenus';
      menu.className = 'wrn-audio-submenus';
      toolbar.insertAdjacentElement('afterend', menu);
    }
    return menu;
  }

  function ensureRadioMenu() {
    const panel = document.getElementById('panel-live-radio');
    const toolbar = panel?.querySelector('.live-radio-toolbar');
    if (!panel || !toolbar) return null;

    let menu = document.getElementById('wrn-radio-submenus');
    if (!menu) {
      menu = document.createElement('section');
      menu.id = 'wrn-radio-submenus';
      menu.className = 'wrn-audio-submenus';

      const search = document.createElement('input');
      search.id = 'wrn-radio-search';
      search.className = 'wrn-audio-search';
      search.type = 'search';
      search.placeholder = t().searchRadio;
      search.value = filters.radioSearch || '';
      search.addEventListener('input', () => {
        filters.radioSearch = search.value;
        saveFilters();
        renderLiveRadio();
      });
      menu.append(search);
      toolbar.insertAdjacentElement('afterend', menu);
    }
    return menu;
  }

  function buildPodcastMenus() {
    const menu = ensurePodcastMenu();
    if (!menu || typeof originalPodcastData === 'undefined') return;
    menu.textContent = '';

    const topics = sortedUnique(originalPodcastData.flatMap(podcastTopics));
    const regions = sortedUnique(originalPodcastData.map(podcastRegion));
    const languages = sortedUnique(originalPodcastData.map(item => item.language));

    menu.append(
      createChipRow(t().topics, 'podcast-topic',
        [['',t().all], ...topics.map(value => [value,value])],
        filters.podcastTopic,
        value => { filters.podcastTopic=value; saveFilters(); buildPodcastMenus(); renderOriginalPodcastLibrary(); }
      ),
      createChipRow(t().regions, 'podcast-region',
        [['',t().all], ...regions.map(value => [value,value])],
        filters.podcastRegion,
        value => { filters.podcastRegion=value; saveFilters(); buildPodcastMenus(); renderOriginalPodcastLibrary(); }
      ),
      createChipRow(t().languages, 'podcast-language',
        [['',t().all], ...languages.map(value => [value,value.toUpperCase()])],
        filters.podcastLanguage,
        value => { filters.podcastLanguage=value; saveFilters(); buildPodcastMenus(); renderOriginalPodcastLibrary(); }
      ),
      createChipRow(t().sourceStatus, 'podcast-status',
        [['available',t().available],['all',t().allStatuses],['healthy',t().healthy],['stale',t().stale],['error',t().broken]],
        filters.podcastStatus,
        value => { filters.podcastStatus=value; saveFilters(); buildPodcastMenus(); renderOriginalPodcastLibrary(); }
      )
    );

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'wrn-audio-reset';
    reset.textContent = t().reset;
    reset.addEventListener('click', () => {
      filters.podcastTopic='';
      filters.podcastRegion='';
      filters.podcastLanguage='';
      filters.podcastStatus='available';
      saveFilters();
      buildPodcastMenus();
      renderOriginalPodcastLibrary();
    });
    menu.append(reset);
  }

  function buildRadioMenus() {
    const menu = ensureRadioMenu();
    if (!menu || typeof radioStationData === 'undefined') return;

    const oldSearch = document.getElementById('wrn-radio-search');
    menu.textContent = '';

    const search = oldSearch || document.createElement('input');
    search.id = 'wrn-radio-search';
    search.className = 'wrn-audio-search';
    search.type = 'search';
    search.placeholder = t().searchRadio;
    search.value = filters.radioSearch || '';
    search.oninput = () => {
      filters.radioSearch = search.value;
      saveFilters();
      renderLiveRadio();
    };
    menu.append(search);

    const topics = sortedUnique(radioStationData.flatMap(item => values(item,'topics')));
    const regions = sortedUnique(radioStationData.map(item => item.region));
    const languages = sortedUnique(radioStationData.flatMap(item => values(item,'languages')));

    menu.append(
      createChipRow(t().topics, 'radio-topic',
        [['',t().all], ...topics.map(value => [value,value])],
        filters.radioTopic,
        value => { filters.radioTopic=value; saveFilters(); buildRadioMenus(); renderLiveRadio(); }
      ),
      createChipRow(t().regions, 'radio-region',
        [['',t().all], ...regions.map(value => [value,value])],
        filters.radioRegion,
        value => { filters.radioRegion=value; saveFilters(); buildRadioMenus(); renderLiveRadio(); }
      ),
      createChipRow(t().languages, 'radio-language',
        [['',t().all], ...languages.map(value => [value,value.toUpperCase()])],
        filters.radioLanguage,
        value => { filters.radioLanguage=value; saveFilters(); buildRadioMenus(); renderLiveRadio(); }
      ),
      createChipRow(t().sourceStatus, 'radio-status',
        [['available',t().available],['all',t().allStatuses],['healthy',t().healthy],['error',t().broken],['unknown',t().unknown]],
        filters.radioStatus,
        value => { filters.radioStatus=value; saveFilters(); buildRadioMenus(); renderLiveRadio(); }
      )
    );

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'wrn-audio-reset';
    reset.textContent = t().reset;
    reset.addEventListener('click', () => {
      filters.radioTopic='';
      filters.radioRegion='';
      filters.radioLanguage='';
      filters.radioStatus='available';
      filters.radioSearch='';
      saveFilters();
      buildRadioMenus();
      renderLiveRadio();
    });
    menu.append(reset);
  }

  function healthBadge(status) {
    const span = document.createElement('span');
    span.className = `wrn-audio-health-badge ${status || 'unknown'}`;
    span.textContent = status === 'healthy' ? `● ${t().healthy}`
      : status === 'stale' ? `◐ ${t().stale}`
      : status === 'degraded' ? `◒ ${t().degraded || t().stale}`
      : status === 'error' ? `× ${t().broken}`
      : `○ ${t().unknown}`;
    return span;
  }

  function renderHealthSummary() {
    let box = document.getElementById('wrn-audio-health-summary');
    const modal = document.getElementById('podcast-library-modal');
    const tabs = modal?.querySelector('.audio-hub-tabs');
    if (!modal || !tabs) return;

    if (!box) {
      box = document.createElement('details');
      box.id = 'wrn-audio-health-summary';
      box.className = 'wrn-audio-health-summary';
      tabs.insertAdjacentElement('afterend', box);
    }

    const podcastRows = Object.values(podcastHealth || {});
    const radioRows = Object.values(radioHealth || {});
    const pGood = podcastRows.filter(row => ['healthy','stale'].includes(row.status) || row.ok === true).length;
    const rGood = radioRows.filter(row => row.status === 'healthy' || row.ok === true).length;

    box.innerHTML = '';
    const summary = document.createElement('summary');
    summary.textContent = `${t().health}: ${pGood}/${podcastRows.length || '–'} ${t().podcastCount} · ${rGood}/${radioRows.length || '–'} ${t().radioCount}`;
    box.append(summary);

    const body = document.createElement('div');
    body.className = 'wrn-audio-health-body';

    const failures = [
      ...podcastRows.filter(row => row.status === 'error').map(row => `${row.name}: ${row.feedOrError || ''}`),
      ...radioRows.filter(row => row.status === 'error').map(row => `${row.name}: ${row.message || ''}`)
    ].slice(0, 20);

    if (failures.length) {
      const list = document.createElement('ul');
      failures.forEach(text => {
        const item = document.createElement('li');
        item.textContent = text;
        list.append(item);
      });
      body.append(list);
    } else {
      const text = document.createElement('p');
      text.textContent = t().catalogInfo;
      body.append(text);
    }

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'wrn-audio-reset';
    retry.textContent = t().retry;
    retry.addEventListener('click', async () => {
      await loadHealth(true);
      if (typeof renderOriginalPodcastLibrary === 'function') renderOriginalPodcastLibrary();
      if (typeof renderLiveRadio === 'function') renderLiveRadio();
    });
    body.append(retry);
    box.append(body);
  }

  function favorite(id) {
    return Boolean(window.WRNAudioTools?.isFavorite?.(id));
  }

  const originalPopulateFilters = window.populateOriginalPodcastFilters;
  window.populateOriginalPodcastFilters = function(...args) {
    const result = typeof originalPopulateFilters === 'function'
      ? originalPopulateFilters.apply(this,args)
      : undefined;
    buildPodcastMenus();
    return result;
  };

  window.renderOriginalPodcastLibrary = function() {
    if (typeof originalPodcastData === 'undefined') return;
    const container = document.getElementById('original-podcast-list');
    if (!container) return;
    buildPodcastMenus();
    container.className = 'podcast-library-list';

    const source = document.getElementById('original-podcast-source-filter')?.value || '';
    const search = (document.getElementById('original-podcast-search')?.value || '').trim().toLowerCase();
    const favoritesOnly = Boolean(document.getElementById('original-podcast-favorites-only')?.checked);

    const items = originalPodcastData
      .filter(item => !source || item.sourceName === source)
      .filter(item => !filters.podcastLanguage || item.language === filters.podcastLanguage)
      .filter(item => !filters.podcastRegion || podcastRegion(item) === filters.podcastRegion)
      .filter(item => !filters.podcastTopic || podcastTopics(item).includes(filters.podcastTopic))
      .filter(item => statusMatches(statusForPodcast(item), filters.podcastStatus))
      .filter(item => !search || `${item.title || ''} ${item.description || ''} ${item.sourceName || ''} ${podcastTopics(item).join(' ')}`.toLowerCase().includes(search))
      .filter(item => !favoritesOnly || favorite(`original:${item.id || item.audioUrl}`))
      .sort((a,b) => {
        const favoriteDelta = Number(favorite(`original:${b.id || b.audioUrl}`)) - Number(favorite(`original:${a.id || a.audioUrl}`));
        return favoriteDelta || (new Date(b.published || 0) - new Date(a.published || 0));
      });

    container.textContent = '';
    if (!items.length) {
      container.textContent = t().noItems;
      return;
    }

    items.slice(0,240).forEach(item => {
      const card = document.createElement('article');
      card.className = 'original-podcast-card wrn-audio-catalog-card';

      const title = document.createElement('h4');
      title.textContent = item.title || 'Podcast';
      card.append(title);

      const badgeRow = document.createElement('div');
      badgeRow.className = 'wrn-audio-badge-row';
      badgeRow.append(healthBadge(statusForPodcast(item)));
      podcastTopics(item).slice(0,3).forEach(topic => {
        const chip = document.createElement('span');
        chip.className = 'wrn-audio-meta-chip';
        chip.textContent = topic;
        badgeRow.append(chip);
      });
      card.append(badgeRow);

      const meta = document.createElement('div');
      meta.className = 'original-podcast-meta';
      const date = item.published ? new Date(item.published).toLocaleDateString(lang() === 'en' ? 'en-US' : lang()) : '';
      meta.textContent = [
        item.sourceName || '',
        podcastRegion(item),
        date,
        item.duration || '',
        item.language ? item.language.toUpperCase() : ''
      ].filter(Boolean).join(' · ');
      card.append(meta);

      if (item.description) {
        const description = document.createElement('p');
        description.className = 'original-podcast-description';
        description.textContent = String(item.description).slice(0,700);
        card.append(description);
      }

      const id = `original:${item.id || item.audioUrl}`;
      const mediaConfig = {
        id, kind:'original', title:item.title || 'Podcast',
        artist:item.sourceName || 'Original-Podcast',
        candidates:[item.audioUrl], artwork:item.artwork || '',
        statusId:`media-status-${safeDomId(id)}`,
        showPause:true, showProgress:true
      };
      appendSimpleMediaControls(card, mediaConfig);
      window.WRNAudioTools?.appendCardActions?.(card, mediaConfig, { queue:true });

      const links = document.createElement('div');
      links.className = 'original-podcast-links';
      const ui = (typeof uiTexte !== 'undefined' && (uiTexte[currentLang] || uiTexte.en)) || {};
      if (getSafeHttpUrl(item.episodeUrl)) links.append(makeMediaLink(item.episodeUrl, ui.listenOriginal || t().openWebsite));
      if (getSafeHttpUrl(item.feedUrl)) links.append(makeMediaLink(item.feedUrl, ui.feedLink || 'Feed'));
      if (item.license) {
        const license = document.createElement('span');
        license.textContent = item.license;
        license.className = 'original-podcast-meta';
        links.append(license);
      }
      card.append(links);
      container.append(card);
    });

    if (typeof renderContinueListening === 'function') renderContinueListening();
  };

  window.renderLiveRadio = function() {
    if (typeof radioStationData === 'undefined') return;
    const container = document.getElementById('live-radio-list');
    if (!container) return;
    buildRadioMenus();
    container.className = 'live-radio-list';
    container.textContent = '';

    const favoritesOnly = Boolean(document.getElementById('live-radio-favorites-only')?.checked);
    const query = String(filters.radioSearch || '').trim().toLowerCase();

    const stations = radioStationData
      .filter(station => station.enabled !== false)
      .filter(station => !filters.radioRegion || station.region === filters.radioRegion)
      .filter(station => !filters.radioLanguage || values(station,'languages').includes(filters.radioLanguage))
      .filter(station => !filters.radioTopic || values(station,'topics').includes(filters.radioTopic))
      .filter(station => statusMatches(statusForRadio(station), filters.radioStatus))
      .filter(station => !query || `${station.name || ''} ${station.city || ''} ${station.country || ''} ${station.description || ''} ${values(station,'topics').join(' ')}`.toLowerCase().includes(query))
      .filter(station => !favoritesOnly || favorite(`radio:${station.id || station.name}`))
      .sort((a,b) => {
        const favoriteDelta = Number(favorite(`radio:${b.id || b.name}`)) - Number(favorite(`radio:${a.id || a.name}`));
        return favoriteDelta
          || String(a.region || '').localeCompare(String(b.region || ''), lang())
          || String(a.name || '').localeCompare(String(b.name || ''), lang());
      });

    if (!stations.length) {
      container.textContent = t().noItems;
      return;
    }

    stations.forEach(station => {
      const status = statusForRadio(station);
      const card = document.createElement('article');
      card.className = `live-radio-card wrn-audio-catalog-card status-${status}`;

      const title = document.createElement('h4');
      title.textContent = station.name || 'Radio';
      card.append(title);

      const badgeRow = document.createElement('div');
      badgeRow.className = 'wrn-audio-badge-row';
      badgeRow.append(healthBadge(status));
      values(station,'topics').slice(0,3).forEach(topic => {
        const chip = document.createElement('span');
        chip.className = 'wrn-audio-meta-chip';
        chip.textContent = topic;
        badgeRow.append(chip);
      });
      card.append(badgeRow);

      const meta = document.createElement('div');
      meta.className = 'live-radio-meta';
      meta.textContent = [
        station.city || '',
        station.country || '',
        station.region || '',
        values(station,'languages').map(value => value.toUpperCase()).join(', ')
      ].filter(Boolean).join(' · ');
      card.append(meta);

      if (station.description) {
        const desc = document.createElement('p');
        desc.className = 'live-radio-description';
        desc.textContent = station.description;
        card.append(desc);
      }

      const id = `radio:${station.id || station.name}`;
      const candidates = [
        radioHealth[station.id]?.workingStream,
        station.workingStream,
        ...(station.streamCandidates || [])
      ].filter(Boolean);

      if (status !== 'error' && candidates.length) {
        const mediaConfig = {
          id, kind:'radio', title:station.name || 'Live-Radio',
          artist:`Live-Radio${station.city ? ` · ${station.city}` : ''}`,
          candidates, artwork:station.artwork || '',
          statusId:`media-status-${safeDomId(id)}`
        };
        appendSimpleMediaControls(card, mediaConfig);
        window.WRNAudioTools?.appendCardActions?.(card, mediaConfig, { queue:false });
      } else {
        const unavailable = document.createElement('div');
        unavailable.className = 'wrn-audio-unavailable';
        unavailable.textContent = t().unavailable;
        card.append(unavailable);
      }

      const links = document.createElement('div');
      links.className = 'live-radio-links';
      if (getSafeHttpUrl(station.website)) links.append(makeMediaLink(station.website,t().openWebsite));
      card.append(links);
      container.append(card);
    });
  };

  const originalLoadPodcasts = window.loadOriginalPodcasts;
  window.loadOriginalPodcasts = async function(...args) {
    const result = await originalLoadPodcasts?.apply(this,args);
    await loadHealth(false);
    buildPodcastMenus();
    window.renderOriginalPodcastLibrary();
    return result;
  };

  const originalLoadRadio = window.loadLiveRadio;
  window.loadLiveRadio = async function(...args) {
    const result = await originalLoadRadio?.apply(this,args);
    await loadHealth(false);
    buildRadioMenus();
    window.renderLiveRadio();
    return result;
  };

  function init() {
    loadHealth(false).then(() => {
      buildPodcastMenus();
      buildRadioMenus();
      renderHealthSummary();
    });

    window.addEventListener('wrnaudiofavoriteschange', () => {
      if (typeof activeAudioHubTab !== 'undefined' && activeAudioHubTab === 'original') window.renderOriginalPodcastLibrary();
      if (typeof activeAudioHubTab !== 'undefined' && activeAudioHubTab === 'radio') window.renderLiveRadio();
    });

    const languageSelect = document.getElementById('ui-language');
    languageSelect?.addEventListener('change', () => {
      window.setTimeout(() => {
        buildPodcastMenus();
        buildRadioMenus();
        renderHealthSummary();
      }, 40);
    });
  }

  window.WRNAudioCatalog = Object.freeze({
    refreshHealth: () => loadHealth(true),
    resetFilters() {
      localStorage.removeItem(STORAGE_KEY);
      filters = loadFilters();
      buildPodcastMenus();
      buildRadioMenus();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
