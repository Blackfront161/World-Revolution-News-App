/* World Revolution News 1.8.1 – Audio direkt im Hauptreiter */
'use strict';

(() => {
  if (window.WRNAudioTab181) return;

  const state = {
    activeView: 'original',
    original: [],
    generated: [],
    radio: [],
    loaded: false,
    loading: false,
    query: '',
    language: 'all',
    region: 'all',
    current: null
  };

  const hiddenNodes = new Map();
  let panel = null;
  let audio = null;
  let playerBar = null;

  const TEXTS = {
    de: {
      title: 'Audio', original: 'Original-Podcasts', generated: 'Erzeugte Podcasts', radio: 'Live-Radio',
      search: 'Audio durchsuchen …', allLanguages: 'Alle Sprachen', play: 'Abspielen', pause: 'Pause', stop: 'Stopp',
      open: 'Original öffnen', loading: 'Audiodaten werden geladen …', empty: 'Keine passenden Einträge gefunden.',
      failed: 'Audiodaten konnten nicht geladen werden.', retry: 'Erneut laden', noDescription: 'Eine aktuelle Folge dieser unabhängigen Quelle.',
      live: 'LIVE', origin: 'Herkunft', all: 'Global', europe: 'Europa', africa: 'Afrika', northAmerica: 'Nordamerika',
      latinAmerica: 'Lateinamerika', asia: 'Asien', oceania: 'Ozeanien', unknown: 'Ohne Zuordnung'
    },
    en: {
      title: 'Audio', original: 'Original podcasts', generated: 'Generated podcasts', radio: 'Live radio',
      search: 'Search audio …', allLanguages: 'All languages', play: 'Play', pause: 'Pause', stop: 'Stop',
      open: 'Open original', loading: 'Loading audio data …', empty: 'No matching items found.',
      failed: 'Audio data could not be loaded.', retry: 'Reload', noDescription: 'A current episode from this independent source.',
      live: 'LIVE', origin: 'Origin', all: 'Global', europe: 'Europe', africa: 'Africa', northAmerica: 'North America',
      latinAmerica: 'Latin America', asia: 'Asia', oceania: 'Oceania', unknown: 'Unassigned'
    },
    es: {
      title: 'Audio', original: 'Pódcasts originales', generated: 'Pódcasts generados', radio: 'Radio en directo',
      search: 'Buscar audio …', allLanguages: 'Todos los idiomas', play: 'Reproducir', pause: 'Pausa', stop: 'Detener',
      open: 'Abrir original', loading: 'Cargando audio …', empty: 'No se encontraron elementos.',
      failed: 'No se pudieron cargar los datos de audio.', retry: 'Volver a cargar', noDescription: 'Un episodio actual de esta fuente independiente.',
      live: 'EN DIRECTO', origin: 'Origen', all: 'Global', europe: 'Europa', africa: 'África', northAmerica: 'Norteamérica',
      latinAmerica: 'Latinoamérica', asia: 'Asia', oceania: 'Oceanía', unknown: 'Sin asignar'
    },
    fr: {
      title: 'Audio', original: 'Podcasts originaux', generated: 'Podcasts générés', radio: 'Radio en direct',
      search: 'Rechercher dans l’audio …', allLanguages: 'Toutes les langues', play: 'Lire', pause: 'Pause', stop: 'Arrêter',
      open: 'Ouvrir l’original', loading: 'Chargement de l’audio …', empty: 'Aucun élément correspondant.',
      failed: 'Les données audio n’ont pas pu être chargées.', retry: 'Recharger', noDescription: 'Un épisode récent de cette source indépendante.',
      live: 'DIRECT', origin: 'Origine', all: 'Global', europe: 'Europe', africa: 'Afrique', northAmerica: 'Amérique du Nord',
      latinAmerica: 'Amérique latine', asia: 'Asie', oceania: 'Australie et Océanie', unknown: 'Non attribué'
    },
    it: {
      title: 'Audio', original: 'Podcast originali', generated: 'Podcast generati', radio: 'Radio dal vivo',
      search: 'Cerca audio …', allLanguages: 'Tutte le lingue', play: 'Riproduci', pause: 'Pausa', stop: 'Ferma',
      open: 'Apri originale', loading: 'Caricamento audio …', empty: 'Nessun elemento corrispondente.',
      failed: 'Impossibile caricare i dati audio.', retry: 'Ricarica', noDescription: 'Un episodio recente di questa fonte indipendente.',
      live: 'DAL VIVO', origin: 'Origine', all: 'Globale', europe: 'Europa', africa: 'Africa', northAmerica: 'Nord America',
      latinAmerica: 'America Latina', asia: 'Asia', oceania: 'Oceania', unknown: 'Non assegnato'
    },
    pt: {
      title: 'Áudio', original: 'Podcasts originais', generated: 'Podcasts gerados', radio: 'Rádio ao vivo',
      search: 'Pesquisar áudio …', allLanguages: 'Todos os idiomas', play: 'Reproduzir', pause: 'Pausa', stop: 'Parar',
      open: 'Abrir original', loading: 'A carregar áudio …', empty: 'Nenhum item correspondente.',
      failed: 'Não foi possível carregar os dados de áudio.', retry: 'Recarregar', noDescription: 'Um episódio recente desta fonte independente.',
      live: 'AO VIVO', origin: 'Origem', all: 'Global', europe: 'Europa', africa: 'África', northAmerica: 'América do Norte',
      latinAmerica: 'América Latina', asia: 'Ásia', oceania: 'Austrália e Oceânia', unknown: 'Sem atribuição'
    },
    ru: {
      title: 'Аудио', original: 'Оригинальные подкасты', generated: 'Созданные подкасты', radio: 'Прямой эфир',
      search: 'Поиск аудио …', allLanguages: 'Все языки', play: 'Воспроизвести', pause: 'Пауза', stop: 'Стоп',
      open: 'Открыть оригинал', loading: 'Загрузка аудио …', empty: 'Подходящих материалов нет.',
      failed: 'Не удалось загрузить аудиоданные.', retry: 'Загрузить снова', noDescription: 'Новый выпуск независимого источника.',
      live: 'ЭФИР', origin: 'Происхождение', all: 'Весь мир', europe: 'Европа', africa: 'Африка', northAmerica: 'Северная Америка',
      latinAmerica: 'Латинская Америка', asia: 'Азия', oceania: 'Австралия и Океания', unknown: 'Не определено'
    },
    el: {
      title: 'Ήχος', original: 'Πρωτότυπα podcast', generated: 'Δημιουργημένα podcast', radio: 'Ζωντανό ραδιόφωνο',
      search: 'Αναζήτηση ήχου …', allLanguages: 'Όλες οι γλώσσες', play: 'Αναπαραγωγή', pause: 'Παύση', stop: 'Διακοπή',
      open: 'Άνοιγμα πρωτοτύπου', loading: 'Φόρτωση ήχου …', empty: 'Δεν βρέθηκαν αντίστοιχες εγγραφές.',
      failed: 'Δεν ήταν δυνατή η φόρτωση των δεδομένων ήχου.', retry: 'Επαναφόρτωση', noDescription: 'Ένα πρόσφατο επεισόδιο ανεξάρτητης πηγής.',
      live: 'ΖΩΝΤΑΝΑ', origin: 'Προέλευση', all: 'Παγκόσμια', europe: 'Ευρώπη', africa: 'Αφρική', northAmerica: 'Βόρεια Αμερική',
      latinAmerica: 'Λατινική Αμερική', asia: 'Ασία', oceania: 'Αυστραλία και Ωκεανία', unknown: 'Χωρίς αντιστοίχιση'
    },
    tr: {
      title: 'Ses', original: 'Orijinal podcastler', generated: 'Oluşturulan podcastler', radio: 'Canlı radyo',
      search: 'Seslerde ara …', allLanguages: 'Tüm diller', play: 'Oynat', pause: 'Duraklat', stop: 'Durdur',
      open: 'Orijinali aç', loading: 'Ses verileri yükleniyor …', empty: 'Eşleşen kayıt bulunamadı.',
      failed: 'Ses verileri yüklenemedi.', retry: 'Yeniden yükle', noDescription: 'Bu bağımsız kaynaktan güncel bir bölüm.',
      live: 'CANLI', origin: 'Köken', all: 'Küresel', europe: 'Avrupa', africa: 'Afrika', northAmerica: 'Kuzey Amerika',
      latinAmerica: 'Latin Amerika', asia: 'Asya', oceania: 'Avustralya ve Okyanusya', unknown: 'Atanmamış'
    }
  };

  const language = () => window.WRNI18n?.currentLanguage?.()
    || document.getElementById('ui-language')?.value
    || document.documentElement.lang
    || 'en';
  const text = () => TEXTS[language()] || TEXTS.en;

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

  const asArray = data => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    for (const key of ['items','episodes','podcasts','stations','sources','results','entries']) {
      if (Array.isArray(data[key])) return data[key];
    }
    return Object.entries(data)
      .filter(([, value]) => value && typeof value === 'object')
      .map(([key, value]) => ({ __key: key, ...value }));
  };

  const first = (item, fields) => {
    for (const field of fields) {
      const value = item?.[field];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const nested of ['url','href','src']) {
          if (value[nested]) return String(value[nested]).trim();
        }
      }
      if (Array.isArray(value) && value.length) return String(value[0]).trim();
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return '';
  };

  const cleanText = value => String(value || '')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

  const oneSentence = value => {
    const clean = cleanText(value);
    if (!clean) return text().noDescription;
    const match = clean.match(/^(.{25,220}?[.!?])(?:\s|$)/);
    const sentence = match ? match[1] : clean.slice(0, 180);
    return sentence.length < clean.length && !/[.!?]$/.test(sentence)
      ? `${sentence.trim()} …`
      : sentence.trim();
  };

  const normalLanguage = item => {
    const raw = first(item, ['language','lang','sprache','locale']).toLowerCase();
    return raw ? raw.split(/[-_]/)[0].slice(0, 3) : 'und';
  };

  const canonicalRegion = (value, country) =>
    window.WRNAudioRegionCore?.canonicalRegion?.(value, country) || 'unknown';

  const normalizePodcast = (item, generated = false) => {
    const country = first(item, ['country','countryCode','land']);
    const regionRaw = first(item, ['region','continent','kontinent','originRegion']);
    return {
      id: first(item, ['id','guid','__key']) || `${generated ? 'g' : 'o'}-${Math.random()}`,
      kind: generated ? 'generated' : 'original',
      title: first(item, ['title','name','episodeTitle']) || 'Podcast',
      source: first(item, ['sourceName','podcastName','podcast','show','quelleName','source','author'])
        || (generated ? 'World Revolution News' : 'Podcast'),
      description: oneSentence(first(item, ['description','summary','content','teaser','subtitle','excerpt'])),
      audioUrl: first(item, ['audioUrl','audio_url','enclosureUrl','enclosure','mediaUrl','file','url']),
      originalUrl: first(item, ['originalUrl','episodeUrl','link','homepage','sourceUrl','webUrl']),
      date: first(item, ['pubDate','publishedAt','date','published']),
      duration: first(item, ['duration','length','runtime']),
      language: normalLanguage(item),
      country,
      regionRaw,
      region: canonicalRegion(regionRaw, country)
    };
  };

  const normalizeRadio = item => ({
    id: first(item, ['id','__key']) || `r-${Math.random()}`,
    kind: 'radio',
    title: first(item, ['name','station','title','label']) || 'Live-Radio',
    source: first(item, ['country','region','city','source']) || text().live,
    description: oneSentence(first(item, ['description','summary','tagline','content'])),
    audioUrl: first(item, ['streamCandidates','streamUrl','stream_url','audioUrl','playlistUrl','stream','url']),
    originalUrl: first(item, ['homepage','website','link']),
    language: normalLanguage(item),
    country: first(item, ['country','countryCode']),
    regionRaw: first(item, ['region','continent','kontinent']),
    region: canonicalRegion(first(item, ['region','continent','kontinent']), first(item, ['country','countryCode']))
  });

  const fetchJson = async url => {
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  const fetchFirst = async urls => {
    for (const url of urls.filter(Boolean)) {
      try { return await fetchJson(url); } catch {}
    }
    return [];
  };

  async function load(force = false) {
    if (state.loading || (state.loaded && !force)) return;
    state.loading = true;
    renderLoading();
    const urls = window.WRN_CONFIG?.dataUrls || {};

    try {
      const [original, generated, radio] = await Promise.all([
        fetchFirst([urls.podcasts, './podcasts.json']),
        fetchFirst([urls.generatedPodcasts, './generated-podcasts.json', './generated_podcasts.json', './podcast-feed.json']),
        fetchFirst([urls.radio, './radio-stations.json'])
      ]);

      state.original = asArray(original).map(item => normalizePodcast(item, false)).filter(item => item.audioUrl).slice(0, 240);
      state.generated = asArray(generated).map(item => normalizePodcast(item, true)).filter(item => item.audioUrl).slice(0, 100);
      state.radio = asArray(radio).map(normalizeRadio).filter(item => item.audioUrl).slice(0, 140);
      state.loaded = true;
    } catch (error) {
      console.warn('WRN audio data:', error);
    } finally {
      state.loading = false;
      render();
    }
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    audio.preload = 'none';
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('play', updatePlayer);
    audio.addEventListener('pause', updatePlayer);
    audio.addEventListener('ended', () => { state.current = null; updatePlayer(); renderCards(); });
    audio.addEventListener('error', () => playerBar?.classList.add('wrn-audio-player-error'));
    document.body.appendChild(audio);
    return audio;
  }

  const playableUrl = raw => {
    const url = String(raw || '').trim();
    if (!url.startsWith('http://')) return url;
    const proxy = window.WRN_CONFIG?.proxyUrl;
    return proxy ? `${proxy}?url=${encodeURIComponent(url)}` : url;
  };

  async function play(item) {
    const media = ensureAudio();
    if (state.current?.id === item.id && !media.paused) {
      if (item.kind === 'radio') stop(); else media.pause();
      updatePlayer(); renderCards(); return;
    }
    if (state.current?.id === item.id && media.paused && media.currentSrc) {
      await media.play(); updatePlayer(); renderCards(); return;
    }

    state.current = item;
    media.src = playableUrl(item.audioUrl);
    media.load();
    try {
      await media.play();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: item.title, artist: item.source,
          album: item.kind === 'radio' ? text().radio : (item.kind === 'generated' ? text().generated : text().original)
        });
        navigator.mediaSession.setActionHandler('play', () => media.play());
        navigator.mediaSession.setActionHandler('pause', () => media.pause());
        navigator.mediaSession.setActionHandler('stop', stop);
      }
    } catch (error) {
      console.warn('WRN audio playback:', error);
      playerBar?.classList.add('wrn-audio-player-error');
    }
    updatePlayer(); renderCards();
  }

  function stop() {
    if (!audio) return;
    audio.pause(); audio.removeAttribute('src'); audio.load(); state.current = null;
    updatePlayer(); renderCards();
  }

  function ensurePlayer() {
    if (playerBar) return playerBar;
    playerBar = document.createElement('aside');
    playerBar.id = 'wrn-audio-player-181';
    playerBar.className = 'wrn-audio-player-1719';
    playerBar.hidden = true;
    playerBar.innerHTML = `
      <div><strong id="wrn-audio-player-title"></strong><span id="wrn-audio-player-source"></span></div>
      <button type="button" data-player-action="toggle"></button>
      <button type="button" data-player-action="stop">■</button>`;
    playerBar.addEventListener('click', event => {
      const action = event.target.closest('[data-player-action]')?.dataset.playerAction;
      if (action === 'toggle' && audio) audio.paused ? void audio.play() : audio.pause();
      if (action === 'stop') stop();
    });
    document.body.appendChild(playerBar);
    return playerBar;
  }

  function updatePlayer() {
    const bar = ensurePlayer();
    if (!state.current) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.classList.remove('wrn-audio-player-error');
    bar.querySelector('#wrn-audio-player-title').textContent = state.current.title;
    bar.querySelector('#wrn-audio-player-source').textContent = state.current.source;
    bar.querySelector('[data-player-action="toggle"]').textContent = audio?.paused ? `▶ ${text().play}` : `Ⅱ ${text().pause}`;
    bar.querySelector('[data-player-action="stop"]').title = text().stop;
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'wrn-audio-tab-panel-181';
    panel.className = 'wrn-audio-tab-panel-1719';
    panel.hidden = true;
    panel.innerHTML = `
      <header class="wrn-audio-tab-head-1719">
        <div><h2></h2><p id="wrn-audio-tab-count"></p></div>
        <button type="button" data-audio-tab-action="reload" aria-label="Reload">↻</button>
      </header>
      <div class="wrn-audio-origin-block-181" id="wrn-audio-origin-block-181">
        <strong id="wrn-audio-origin-label-181"></strong>
        <nav id="wrn-audio-region-tabs-181" class="wrn-audio-region-tabs-181"></nav>
      </div>
      <div class="wrn-audio-tab-controls-1719 wrn-audio-search-controls-181">
        <div>
          <input type="search" id="wrn-audio-search-181">
          <select id="wrn-audio-language-181"></select>
        </div>
      </div>
      <div id="wrn-audio-tab-status-181" aria-live="polite"></div>
      <div id="wrn-audio-tab-list-181"></div>`;

    panel.addEventListener('click', event => {
      const region = event.target.closest('[data-audio-region]')?.dataset.audioRegion;
      if (region) { state.region = region; render(); return; }
      const itemId = event.target.closest('[data-audio-play]')?.dataset.audioPlay;
      if (itemId) {
        const item = currentItems().find(row => row.id === itemId);
        if (item) void play(item);
      }
      if (event.target.closest('[data-audio-tab-action="reload"]')) void load(true);
    });

    panel.querySelector('#wrn-audio-search-181').addEventListener('input', event => {
      state.query = String(event.target.value || '').trim().toLowerCase(); renderCards();
    });
    panel.querySelector('#wrn-audio-language-181').addEventListener('change', event => {
      state.language = String(event.target.value || 'all'); renderCards();
    });

    const feed = document.getElementById('feed-container');
    if (feed?.parentElement) feed.parentElement.insertBefore(panel, feed);
    else document.body.appendChild(panel);
    return panel;
  }

  const currentItems = () => state.activeView === 'generated'
    ? state.generated
    : state.activeView === 'radio'
      ? state.radio
      : state.original;

  const filteredItems = () => currentItems().filter(item => {
    if (state.activeView === 'original' && state.region !== 'all') {
      if (!window.WRNAudioRegionCore?.matches?.(state.region, item.regionRaw || item.region, item.country)) return false;
    }
    if (state.language !== 'all' && item.language !== state.language) return false;
    if (!state.query) return true;
    return [item.title,item.source,item.description,item.language,item.regionRaw,item.country]
      .some(value => String(value || '').toLowerCase().includes(state.query));
  });

  function renderLoading() {
    const node = ensurePanel();
    node.querySelector('h2').textContent = text().title;
    node.querySelector('#wrn-audio-tab-status-181').textContent = text().loading;
    node.querySelector('#wrn-audio-tab-list-181').innerHTML = '';
  }

  function regionLabel(key) {
    const t = text();
    return ({
      all: t.all, europe: t.europe, africa: t.africa,
      'north-america': t.northAmerica, 'latin-america': t.latinAmerica,
      asia: t.asia, oceania: t.oceania, unknown: t.unknown
    })[key] || key;
  }

  function renderRegionTabs() {
    const block = panel.querySelector('#wrn-audio-origin-block-181');
    block.hidden = state.activeView !== 'original';
    if (block.hidden) return;
    panel.querySelector('#wrn-audio-origin-label-181').textContent = text().origin;
    const options = window.WRNAudioRegionCore?.regions || ['all','europe','africa','north-america','latin-america','asia','oceania'];
    panel.querySelector('#wrn-audio-region-tabs-181').innerHTML = options.map(key => {
      const count = key === 'all'
        ? state.original.length
        : state.original.filter(item => window.WRNAudioRegionCore?.matches?.(key, item.regionRaw || item.region, item.country)).length;
      return `<button type="button" data-audio-region="${escapeHtml(key)}" class="${state.region === key ? 'active' : ''}">${escapeHtml(regionLabel(key))} <span>${count}</span></button>`;
    }).join('');
  }

  function renderCards() {
    if (!panel) return;
    const t = text();
    const items = filteredItems();
    const list = panel.querySelector('#wrn-audio-tab-list-181');
    panel.querySelector('#wrn-audio-tab-count').textContent = `${items.length} / ${currentItems().length}`;
    if (!items.length) {
      list.innerHTML = `<p class="wrn-audio-empty-1719">${escapeHtml(t.empty)}</p>`;
      return;
    }

    list.innerHTML = items.map(item => {
      const isCurrent = state.current?.id === item.id;
      const isPlaying = isCurrent && audio && !audio.paused;
      const actionLabel = item.kind === 'radio' ? (isPlaying ? t.stop : t.play) : (isPlaying ? t.pause : t.play);
      const region = item.region && item.region !== 'unknown' ? regionLabel(item.region) : '';
      return `
        <article class="wrn-audio-card-1719" data-kind="${escapeHtml(item.kind)}" data-playing="${isPlaying ? 'true' : 'false'}">
          <div class="wrn-audio-card-meta-1719">
            <span>${escapeHtml(item.source)}</span>
            <span>${escapeHtml(item.language.toUpperCase())}</span>
            ${region ? `<span>${escapeHtml(region)}</span>` : ''}
            ${item.kind === 'radio' ? `<span class="wrn-live-badge-1719">${escapeHtml(t.live)}</span>` : ''}
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <div class="wrn-audio-card-actions-1719">
            <button type="button" data-audio-play="${escapeHtml(item.id)}">${escapeHtml(actionLabel)}</button>
            ${item.originalUrl ? `<a href="${escapeHtml(item.originalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.open)}</a>` : ''}
          </div>
        </article>`;
    }).join('');
  }

  function render() {
    const node = ensurePanel();
    const t = text();
    const viewTitle = state.activeView === 'generated' ? t.generated : state.activeView === 'radio' ? t.radio : t.original;
    node.querySelector('h2').textContent = viewTitle;
    node.querySelector('#wrn-audio-search-181').placeholder = t.search;
    renderRegionTabs();

    const languageSelect = node.querySelector('#wrn-audio-language-181');
    const languages = [...new Set(currentItems().map(item => item.language).filter(Boolean))].sort();
    languageSelect.innerHTML = [
      `<option value="all">${escapeHtml(t.allLanguages)}</option>`,
      ...languages.map(code => `<option value="${escapeHtml(code)}">${escapeHtml(code.toUpperCase())}</option>`)
    ].join('');
    languageSelect.value = languages.includes(state.language) ? state.language : 'all';
    state.language = languageSelect.value;
    node.querySelector('#wrn-audio-tab-status-181').textContent = state.loaded ? '' : (state.loading ? t.loading : t.failed);
    renderCards(); updatePlayer();
  }

  function hideRegularContent() {
    [
      document.getElementById('feed-container'), document.getElementById('archive-container'),
      document.getElementById('event-filter-panel'), document.getElementById('txt-archive-title')
    ].filter(Boolean).forEach(node => {
      if (!hiddenNodes.has(node)) hiddenNodes.set(node, node.style.display || '');
      node.style.display = 'none';
    });
  }

  function restoreRegularContent() {
    hiddenNodes.forEach((display, node) => display ? (node.style.display = display) : node.style.removeProperty('display'));
    hiddenNodes.clear();
  }

  function open(view = 'original') {
    if (['original','generated','radio'].includes(view)) state.activeView = view;
    const node = ensurePanel();
    hideRegularContent();
    node.hidden = false;
    if (!state.loaded && !state.loading) void load(false); else render();
  }

  function close() {
    if (panel) panel.hidden = true;
    restoreRegularContent();
  }

  function setView(view) {
    if (!['original','generated','radio'].includes(view)) return;
    state.activeView = view;
    state.language = 'all';
    if (view !== 'original') state.region = 'all';
    open(view);
  }

  window.addEventListener('wrn-language-change', () => { if (panel && !panel.hidden) render(); });
  document.getElementById('ui-language')?.addEventListener('change', () => { if (panel && !panel.hidden) render(); });

  const api = Object.freeze({ open, close, setView, reload: () => load(true), stop, state: () => ({ ...state }) });
  window.WRNAudioTab181 = api;
  window.WRNAudioTab1719 = api;
})();
