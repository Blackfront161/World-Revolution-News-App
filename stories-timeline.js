/* World Revolution News 1.8.1 – Entwicklungen und Zeitleisten */
'use strict';

(() => {
  if (window.WRNStories) return;

  const VIEW_ID = 'wrn-stories-view';
  const WATCHLIST_KEY = 'wrn_story_watchlist_v1';
  const STATE_KEY = 'wrn_story_view_state_v1';

  const TEXTS = {
    de: {
      title: 'Entwicklungen:', intro: 'Hier werden Berichte verschiedener Quellen zum selben Thema als verständlicher Verlauf zusammengefasst.',
      search: 'Thema oder Quelle suchen…', period: 'Zeitraum', sources: 'Mindestens Quellen', days7: '7 Tage', days14: '14 Tage', days30: '30 Tage',
      refresh: 'Neu laden', moreFilters: 'Weitere Filter', empty: 'Im gewählten Zeitraum wurde noch kein Thema von mehreren Quellen berichtet.', articles: 'Beiträge', perspectives: 'Was die Quellen unterschiedlich berichten',
      timeline: 'Zeitleiste', watch: 'Beobachten', watching: 'Beobachtet', share: 'Teilen', copy: 'Kopiert', open: 'Artikel öffnen',
      sourcesLabel: 'Quellen', first: 'Beginn', latest: 'Neuester Stand', local: 'Lokal analysiert', terms: 'Beobachtungsliste',
      translate: 'Übersetzen', translating: 'Wird übersetzt…', original: 'Original', translationError: 'Übersetzung fehlgeschlagen',
      watchedOnly: 'Beobachtete', showAll: 'Alle', reset: 'Übersicht',
      kind: 'Art', allKinds: 'Nachrichten & Termine', newsKind: 'Nachrichten', eventKind: 'Termine',
      beta: 'Beta', linkedBecause: 'Verbunden wegen', confidence: 'Übereinstimmung',
      betaHint: 'Nur Nachrichten oder nur Termine werden bei hoher inhaltlicher Übereinstimmung gruppiert.'
    },
    en: {
      title: 'Understand developments', intro: 'Reports from different sources about the same topic are combined into an easy-to-follow timeline.',
      search: 'Search developments…', period: 'Period', sources: 'Minimum sources', days7: '7 days', days14: '14 days', days30: '30 days',
      refresh: 'Reload', moreFilters: 'More filters', empty: 'No topic was reported by multiple sources in the selected period.', articles: 'articles', perspectives: 'How sources differ',
      timeline: 'Timeline', watch: 'Watch', watching: 'Watching', share: 'Share', copy: 'Copied', open: 'Open article',
      sourcesLabel: 'Sources', first: 'Beginning', latest: 'Latest', local: 'Analyzed locally', terms: 'Watchlist',
      translate: 'Translate', translating: 'Translating…', original: 'Original', translationError: 'Translation failed',
      watchedOnly: 'Watched', showAll: 'All', reset: 'Overview',
      kind: 'Type', allKinds: 'News & events', newsKind: 'News', eventKind: 'Events',
      beta: 'Beta', linkedBecause: 'Linked because of', confidence: 'Match',
      betaHint: 'Only news with news or events with events are grouped, and only with strong content overlap.'
    },
    es: {
      title:'Desarrollos y cronologías', intro:'Varios informes se agrupan localmente. No se suben datos.', search:'Buscar desarrollos…', period:'Periodo',
      sources:'Fuentes mínimas', days7:'7 días', days14:'14 días', days30:'30 días', refresh:'Recalcular', empty:'Aún no hay un desarrollo con varias fuentes.',
      articles:'artículos', perspectives:'Comparar perspectivas', timeline:'Cronología', watch:'Seguir', watching:'Siguiendo', share:'Compartir', copy:'Copiado',
      open:'Abrir artículo', sourcesLabel:'Fuentes', first:'Inicio', latest:'Último estado', local:'Análisis local', terms:'Lista de seguimiento',
      translate:'Traducir', translating:'Traduciendo…', original:'Original', translationError:'Error de traducción'
    },
    fr: {
      title:'Évolutions et chronologies', intro:'Plusieurs articles sont regroupés localement. Aucune donnée n’est envoyée.', search:'Rechercher…', period:'Période',
      sources:'Sources minimum', days7:'7 jours', days14:'14 jours', days30:'30 jours', refresh:'Recalculer', empty:'Aucune évolution multi-source trouvée.',
      articles:'articles', perspectives:'Comparer les perspectives', timeline:'Chronologie', watch:'Suivre', watching:'Suivi', share:'Partager', copy:'Copié',
      open:'Ouvrir l’article', sourcesLabel:'Sources', first:'Début', latest:'Dernier état', local:'Analyse locale', terms:'Liste de suivi',
      translate:'Traduire', translating:'Traduction…', original:'Original', translationError:'Échec de la traduction'
    },
    it: {
      title:'Sviluppi e cronologie', intro:'Più articoli vengono raggruppati localmente. Nessun dato viene caricato.', search:'Cerca sviluppi…', period:'Periodo',
      sources:'Fonti minime', days7:'7 giorni', days14:'14 giorni', days30:'30 giorni', refresh:'Ricalcola', empty:'Nessuno sviluppo con più fonti trovato.',
      articles:'articoli', perspectives:'Confronto delle prospettive', timeline:'Cronologia', watch:'Segui', watching:'Seguita', share:'Condividi', copy:'Copiato',
      open:'Apri articolo', sourcesLabel:'Fonti', first:'Inizio', latest:'Ultimo stato', local:'Analisi locale', terms:'Lista osservata',
      translate:'Traduci', translating:'Traduzione…', original:'Originale', translationError:'Traduzione non riuscita'
    },
    pt: {
      title:'Desenvolvimentos e cronologias', intro:'Várias notícias são agrupadas localmente. Nenhum dado é enviado.', search:'Pesquisar desenvolvimentos…', period:'Período',
      sources:'Fontes mínimas', days7:'7 dias', days14:'14 dias', days30:'30 dias', refresh:'Recalcular', empty:'Ainda não foi encontrado um desenvolvimento com várias fontes.',
      articles:'artigos', perspectives:'Comparar perspetivas', timeline:'Cronologia', watch:'Observar', watching:'Observada', share:'Partilhar', copy:'Copiado',
      open:'Abrir artigo', sourcesLabel:'Fontes', first:'Início', latest:'Último estado', local:'Análise local', terms:'Lista de observação',
      translate:'Traduzir', translating:'A traduzir…', original:'Original', translationError:'Falha na tradução'
    },
    ru: {
      title:'Развитие событий и хронология', intro:'Материалы группируются локально. Данные не загружаются.', search:'Поиск событий…', period:'Период',
      sources:'Минимум источников', days7:'7 дней', days14:'14 дней', days30:'30 дней', refresh:'Пересчитать', empty:'События из нескольких источников пока не найдены.',
      articles:'материалов', perspectives:'Сравнение взглядов', timeline:'Хронология', watch:'Наблюдать', watching:'Отслеживается', share:'Поделиться', copy:'Скопировано',
      open:'Открыть статью', sourcesLabel:'Источники', first:'Начало', latest:'Последнее', local:'Локальный анализ', terms:'Список наблюдения',
      translate:'Перевести', translating:'Перевод…', original:'Оригинал', translationError:'Ошибка перевода'
    },
    el: {
      title:'Εξελίξεις και χρονολόγια', intro:'Πολλαπλές αναφορές ομαδοποιούνται τοπικά. Δεν αποστέλλονται δεδομένα.', search:'Αναζήτηση εξελίξεων…', period:'Περίοδος',
      sources:'Ελάχιστες πηγές', days7:'7 ημέρες', days14:'14 ημέρες', days30:'30 ημέρες', refresh:'Επανυπολογισμός', empty:'Δεν βρέθηκε ακόμη εξέλιξη με πολλές πηγές.',
      articles:'άρθρα', perspectives:'Σύγκριση οπτικών', timeline:'Χρονολόγιο', watch:'Παρακολούθηση', watching:'Παρακολουθείται', share:'Κοινοποίηση', copy:'Αντιγράφηκε',
      open:'Άνοιγμα άρθρου', sourcesLabel:'Πηγές', first:'Αρχή', latest:'Τελευταία εξέλιξη', local:'Τοπική ανάλυση', terms:'Λίστα παρακολούθησης',
      translate:'Μετάφραση', translating:'Μετάφραση…', original:'Πρωτότυπο', translationError:'Αποτυχία μετάφρασης'
    },
    tr: {
      title:'Gelişmeler ve zaman çizelgeleri', intro:'Birden çok haber yerel olarak gruplanır. Veri yüklenmez.', search:'Gelişme ara…', period:'Dönem',
      sources:'En az kaynak', days7:'7 gün', days14:'14 gün', days30:'30 gün', refresh:'Yeniden hesapla', empty:'Henüz çok kaynaklı bir gelişme bulunamadı.',
      articles:'yazı', perspectives:'Bakış açılarını karşılaştır', timeline:'Zaman çizelgesi', watch:'İzle', watching:'İzleniyor', share:'Paylaş', copy:'Kopyalandı',
      open:'Makaleyi aç', sourcesLabel:'Kaynaklar', first:'Başlangıç', latest:'Son durum', local:'Yerel analiz', terms:'İzleme listesi',
      translate:'Çevir', translating:'Çevriliyor…', original:'Orijinal', translationError:'Çeviri başarısız'
    }
  };
  const CONTROL_TEXTS = {
    en: { watchedOnly:'Watched', showAll:'All', reset:'Overview', kind:'Type', allKinds:'News & events', newsKind:'News', eventKind:'Events' },
    de: { watchedOnly:'Beobachtete', showAll:'Alle', reset:'Übersicht', kind:'Art', allKinds:'Nachrichten & Termine', newsKind:'Nachrichten', eventKind:'Termine' },
    es: { watchedOnly:'Seguidos', showAll:'Todos', reset:'Vista general', kind:'Tipo', allKinds:'Noticias y eventos', newsKind:'Noticias', eventKind:'Eventos' },
    fr: { watchedOnly:'Suivis', showAll:'Tout', reset:'Vue d’ensemble', kind:'Type', allKinds:'Actualités et événements', newsKind:'Actualités', eventKind:'Événements' },
    it: { watchedOnly:'Seguiti', showAll:'Tutti', reset:'Panoramica', kind:'Tipo', allKinds:'Notizie ed eventi', newsKind:'Notizie', eventKind:'Eventi' },
    pt: { watchedOnly:'Observados', showAll:'Todos', reset:'Visão geral', kind:'Tipo', allKinds:'Notícias e eventos', newsKind:'Notícias', eventKind:'Eventos' },
    ru: { watchedOnly:'Отслеживаемые', showAll:'Все', reset:'Обзор', kind:'Тип', allKinds:'Новости и события', newsKind:'Новости', eventKind:'События' },
    el: { watchedOnly:'Παρακολουθούμενα', showAll:'Όλα', reset:'Επισκόπηση', kind:'Τύπος', allKinds:'Ειδήσεις και εκδηλώσεις', newsKind:'Ειδήσεις', eventKind:'Εκδηλώσεις' },
    tr: { watchedOnly:'İzlenenler', showAll:'Tümü', reset:'Genel görünüm', kind:'Tür', allKinds:'Haberler ve etkinlikler', newsKind:'Haberler', eventKind:'Etkinlikler' }
  };

  let root = null;
  let active = false;
  const DEFAULT_STATE = Object.freeze({
    days: 30,
    minSources: 2,
    kind: 'all',
    search: '',
    watchedOnly: false
  });
  let state = normalizeState(readLocal(STATE_KEY, DEFAULT_STATE));

  function normalizeState(value) {
    const candidate = value && typeof value === 'object' ? value : {};
    return {
      days: [7, 14, 30].includes(Number(candidate.days))
        ? Number(candidate.days)
        : DEFAULT_STATE.days,
      minSources: [2, 3, 4].includes(Number(candidate.minSources))
        ? Number(candidate.minSources)
        : DEFAULT_STATE.minSources,
      kind: ['all', 'news', 'event'].includes(candidate.kind)
        ? candidate.kind
        : DEFAULT_STATE.kind,
      search: String(candidate.search || ''),
      watchedOnly: candidate.watchedOnly === true
    };
  }

  function language() {
    return window.WRNI18n?.currentLanguage?.()
      || document.documentElement.lang
      || 'en';
  }

  function text() {
    const code = language();
    return {
      ...TEXTS.en,
      ...(TEXTS[code] || {}),
      ...(CONTROL_TEXTS[code] || CONTROL_TEXTS.en)
    };
  }

  function readLocal(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function articles() {
    try {
      return Array.isArray(allNewsData) ? allNewsData : [];
    } catch {
      return [];
    }
  }

  function currentWatchlist() {
    return window.WRNStoriesCore?.normalizeWatchTerms(
      readLocal(WATCHLIST_KEY, [])
    ) || [];
  }

  function setWatchlist(values) {
    const normalized = window.WRNStoriesCore?.normalizeWatchTerms(values) || [];
    writeLocal(WATCHLIST_KEY, normalized);
    window.dispatchEvent(new CustomEvent('wrn-watchlist-change', { detail: { terms: normalized } }));
    return normalized;
  }

  function watchStory(story) {
    const existing = currentWatchlist();
    const candidate = (story.keywords || []).slice(0, 3).join(' ');
    const candidateToken = window.WRNStoriesCore.normalizeToken(candidate);
    const alreadyWatching = existing.some(value =>
      window.WRNStoriesCore.normalizeToken(value) === candidateToken
    );
    const normalized = setWatchlist(
      alreadyWatching
        ? existing.filter(value =>
            window.WRNStoriesCore.normalizeToken(value) !== candidateToken
          )
        : [...existing, candidate]
    );
    render();
    return normalized;
  }

  function isWatching(story) {
    const normalized = currentWatchlist().map(value =>
      window.WRNStoriesCore.normalizeToken(value)
    );
    const haystack = window.WRNStoriesCore.normalizeToken(
      `${story.title} ${(story.keywords || []).join(' ')}`
    );
    return normalized.some(value => value && haystack.includes(value));
  }

  function ensureRoot() {
    root = document.getElementById(VIEW_ID);

    if (root) return root;

    root = document.createElement('main');
    root.id = VIEW_ID;
    root.className = 'wrn-stories-view';
    root.hidden = true;

    const feed = document.getElementById('feed-container');

    if (feed?.parentElement) {
      feed.parentElement.insertBefore(root, feed);
    } else {
      document.body.appendChild(root);
    }

    return root;
  }

  function hideNews() {
    [
      'feed-container',
      'archive-container',
      'txt-archive-title',
      'event-filter-panel',
      'status-container',
      'wrn-briefing-view',
      'wrn-briefing-loading-panel'
    ].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.hidden = true;
    });
  }

  function showNewsAgain() {
    ['feed-container', 'status-container'].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.hidden = false;
    });
  }

  function formatDate(value) {
    const date = new Date(value || 0);
    if (!Number.isFinite(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(language(), { dateStyle: 'medium' }).format(date);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }

  function openArticle(item) {
    try {
      const articleKey = window.WRNReading?.articleKey?.(item)
        || window.WRNStoriesCore.itemKey(item)
        || item?.link;
      if (
        articleKey
        && typeof window.WRNOpenArticleByKey === 'function'
        && window.WRNOpenArticleByKey(articleKey)
      ) {
        return;
      }
    } catch {}

    const link = String(item?.link || '');

    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }

  function articleSummary(item) {
    const source = item?.summary || item?.description || item?.content || item?.title || '';

    try {
      const generated = window.WRNSummaryCore?.summarizeText?.(source, {
        title: item?.title || '',
        length: 'short',
        language: item?.language || 'en'
      });

      if (generated?.plainText) return generated.plainText;
    } catch {}

    return window.WRNStoriesCore.summarizeText(source, 320);
  }

  function parseTranslation(value, fallbackTitle) {
    const cleanValue = String(value || '').trim();
    const parts = cleanValue.split('---');
    if (parts.length < 2) return { title: fallbackTitle, text: cleanValue };
    return {
      title: parts.shift().trim() || fallbackTitle,
      text: parts.join('---').trim()
    };
  }

  async function translateTimelineItem(item, titleNode, summaryNode, button) {
    const copy = text();
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('is-loading');
    button.innerHTML = `<span class="wrn-rb-star-184" aria-hidden="true">★</span><span>${copy.translating}</span>`;
    try {
      const cached = await window.WRNArticleTranslation?.getCached?.(
        item,
        language()
      );
      const result = cached?.text
        ? { error: false, ...cached }
        : await window.WRNArticleTranslation?.translate?.(
            item,
            null,
            language()
          );
      if (!result || result.error || !result.text) throw new Error(result?.message || copy.translationError);
      if (result.title) titleNode.textContent = result.title;
      if (result.text) summaryNode.textContent = articleSummary({
        ...item,
        title: result.title || item?.title,
        content: result.text
      });
      button.textContent = `✓ ${copy.translate}`;
    } catch (error) {
      button.textContent = copy.translationError;
      button.title = String(error?.message || error);
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  }

  function usefulTitle(value) {
    const title = window.WRNStoriesCore?.cleanText?.(value) || '';
    return title && !/^(kein titel|ohne titel|no title|untitled|sans titre|sin t[ií]tulo)$/i.test(title)
      ? title
      : '';
  }

  function displayTitle(story) {
    return usefulTitle(story?.title)
      || story?.items?.map(item => usefulTitle(item?.title)).find(Boolean)
      || text().latest;
  }

  function shareStory(story, button) {
    const copy = text();
    const lines = [
      displayTitle(story),
      `${copy.sourcesLabel}: ${story.sources.join(', ')}`,
      ''
    ];

    for (const item of story.items) {
      lines.push(`${formatDate(window.WRNStoriesCore.dateMs(item))} · ${window.WRNStoriesCore.sourceName(item)}`);
      lines.push(window.WRNStoriesCore.cleanText(item.title));
      if (item.link) lines.push(item.link);
      lines.push('');
    }

    const payload = lines.join('\n').trim();

    if (navigator.share) {
      navigator.share({ title: displayTitle(story), text: payload }).catch(() => {});
      return;
    }

    navigator.clipboard?.writeText(payload).then(() => {
      const old = button.textContent;
      button.textContent = `✓ ${copy.copy}`;
      window.setTimeout(() => { button.textContent = old; }, 1200);
    }).catch(() => {});
  }

  function makeControls(container) {
    const copy = text();
    const controls = document.createElement('section');
    controls.className = 'wrn-stories-controls';

    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = copy.search;
    search.value = state.search || '';
    search.addEventListener('input', () => {
      state.search = search.value;
      writeLocal(STATE_KEY, state);
      renderStories();
    });

    const period = document.createElement('select');
    period.setAttribute('aria-label', copy.period);
    [
      [7, copy.days7],
      [14, copy.days14],
      [30, copy.days30]
    ].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = label;
      period.appendChild(option);
    });
    period.value = String(state.days || 30);
    period.addEventListener('change', () => {
      state.days = Number(period.value);
      writeLocal(STATE_KEY, state);
      renderStories();
    });

    const kind = document.createElement('select');
    kind.setAttribute('aria-label', copy.kind);
    [
      ['all', copy.allKinds],
      ['news', copy.newsKind],
      ['event', copy.eventKind]
    ].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      kind.appendChild(option);
    });
    kind.value = state.kind || 'all';
    kind.addEventListener('change', () => {
      state.kind = kind.value;
      writeLocal(STATE_KEY, state);
      renderStories();
    });

    const advanced = document.createElement('details');
    advanced.className = 'wrn-stories-advanced';
    const advancedLabel = document.createElement('summary');
    advancedLabel.textContent = copy.moreFilters || copy.sources;
    const advancedBody = document.createElement('div');

    const minimum = document.createElement('select');
    minimum.setAttribute('aria-label', copy.sources);
    [2, 3, 4].forEach(value => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = `${copy.sources}: ${value}`;
      minimum.appendChild(option);
    });
    minimum.value = String(state.minSources || 2);
    minimum.addEventListener('change', () => {
      state.minSources = Number(minimum.value);
      writeLocal(STATE_KEY, state);
      renderStories();
    });

    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.textContent = `↻ ${copy.refresh}`;
    refresh.addEventListener('click', renderStories);

    advancedBody.append(minimum, refresh);
    advanced.append(advancedLabel, advancedBody);

    const watched = document.createElement('button');
    watched.type = 'button';
    watched.className = 'wrn-stories-watched-toggle';
    watched.setAttribute('aria-pressed', String(state.watchedOnly));
    watched.textContent = state.watchedOnly
      ? `★ ${copy.showAll}`
      : `☆ ${copy.watchedOnly}`;
    watched.addEventListener('click', () => {
      state.watchedOnly = !state.watchedOnly;
      writeLocal(STATE_KEY, state);
      render();
    });

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'wrn-stories-reset';
    reset.textContent = `↶ ${copy.reset}`;
    reset.addEventListener('click', () => {
      state = { ...DEFAULT_STATE };
      writeLocal(STATE_KEY, state);
      render();
    });

    controls.append(search, period, kind, watched, advanced, reset);
    container.appendChild(controls);
  }

  function storyCard(story) {
    const copy = text();
    const card = document.createElement('article');
    card.className = 'wrn-story-card';
    card.dataset.storyId = story.id;

    const heading = document.createElement('div');
    heading.className = 'wrn-story-heading';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = displayTitle(story);
    const meta = document.createElement('p');
    meta.className = 'wrn-story-meta';
    meta.textContent = `${story.kind === 'event' ? copy.eventKind : copy.newsKind} · ${story.itemCount} ${copy.articles} · ${story.sourceCount} ${copy.sourcesLabel} · ${formatDate(story.oldest)} → ${formatDate(story.newest)}`;
    titleWrap.append(title, meta);

    const actions = document.createElement('div');
    actions.className = 'wrn-story-actions';

    const watch = document.createElement('button');
    watch.type = 'button';
    const watching = isWatching(story);
    watch.className = 'wrn-story-watch';
    watch.innerHTML = `<span class="wrn-story-watch-star" aria-hidden="true">${watching ? '★' : '☆'}</span><span>${watching ? copy.watching : copy.watch}</span>`;
    watch.setAttribute('aria-pressed', String(watching));
    watch.addEventListener('click', () => watchStory(story));

    const share = document.createElement('button');
    share.type = 'button';
    share.textContent = `↗ ${copy.share}`;
    share.addEventListener('click', () => shareStory(story, share));

    actions.append(watch, share);
    heading.append(titleWrap, actions);
    card.appendChild(heading);

    const sourceLine = document.createElement('div');
    sourceLine.className = 'wrn-story-sources';
    sourceLine.textContent = `${copy.sourcesLabel}: ${story.sources.join(' · ')}`;
    card.appendChild(sourceLine);

    if (story.matchReasons?.length) {
      const reason = document.createElement('p');
      reason.className = 'wrn-story-match-reason-185';
      const confidence = Math.round(Number(story.matchConfidence || 0) * 100);
      reason.textContent = `${copy.linkedBecause}: ${story.matchReasons.join(' · ')} · ${copy.confidence}: ${confidence}%`;
      card.appendChild(reason);
    }

    const timeline = document.createElement('details');
    timeline.open = false;
    const timelineSummary = document.createElement('summary');
    timelineSummary.textContent = copy.timeline;
    const list = document.createElement('ol');
    list.className = 'wrn-story-timeline';

    story.items.forEach((item, index) => {
      const row = document.createElement('li');
      const rowHead = document.createElement('div');
      rowHead.className = 'wrn-story-timeline-head';
      const rowMeta = document.createElement('span');
      rowMeta.textContent = `${index === 0 ? copy.first : (index === story.items.length - 1 ? copy.latest : formatDate(window.WRNStoriesCore.dateMs(item)))} · ${window.WRNStoriesCore.sourceName(item)}`;
      const rowTitle = document.createElement('strong');
      rowTitle.textContent = window.WRNStoriesCore.cleanText(item.title);
      const summary = document.createElement('p');
      summary.textContent = articleSummary(item);
      const translate = document.createElement('button');
      translate.type = 'button';
      translate.className = 'wrn-story-translate-184';
      translate.innerHTML = `<span class="wrn-rb-star-static-184" aria-hidden="true">★</span><span>${copy.translate}</span>`;
      translate.addEventListener('click', () => translateTimelineItem(item, rowTitle, summary, translate));
      rowHead.append(rowMeta, translate);
      const open = document.createElement('button');
      open.type = 'button';
      open.textContent = copy.open;
      open.addEventListener('click', () => openArticle(item));
      const itemActions = document.createElement('div');
      itemActions.className = 'wrn-story-item-actions-184';
      itemActions.appendChild(open);
      const originalUrl = String(item?.link || '');
      if (/^https?:\/\//i.test(originalUrl)) {
        const original = document.createElement('a');
        original.href = originalUrl;
        original.target = '_blank';
        original.rel = 'noopener noreferrer';
        original.referrerPolicy = 'no-referrer';
        original.textContent = copy.original;
        itemActions.appendChild(original);
      }
      row.append(rowHead, rowTitle, summary, itemActions);
      list.appendChild(row);
    });

    timeline.append(timelineSummary, list);
    card.appendChild(timeline);

    const perspectives = document.createElement('details');
    const perspectiveSummary = document.createElement('summary');
    perspectiveSummary.textContent = copy.perspectives;
    const grid = document.createElement('div');
    grid.className = 'wrn-story-perspectives';

    window.WRNStoriesCore.perspectiveRows(story).forEach(row => {
      const column = document.createElement('section');
      const source = document.createElement('h4');
      source.textContent = row.source;
      const itemTitle = document.createElement('strong');
      itemTitle.textContent = row.title;
      const summary = document.createElement('p');
      summary.textContent = row.summary;
      column.append(source, itemTitle, summary);
      grid.appendChild(column);
    });

    perspectives.append(perspectiveSummary, grid);
    card.appendChild(perspectives);

    return card;
  }

  function renderStories() {
    const list = root?.querySelector('.wrn-stories-list');
    if (!list || !window.WRNStoriesCore) return;

    const stories = window.WRNStoriesCore.clusterStories(articles(), {
      days: Number(state.days || 30),
      minSources: Number(state.minSources || 2)
    });

    const query = window.WRNStoriesCore.normalizeToken(state.search || '');
    let filtered = query
      ? stories.filter(story =>
          window.WRNStoriesCore.normalizeToken(
            `${story.title} ${story.sources.join(' ')} ${story.keywords.join(' ')}`
          ).includes(query)
        )
      : stories;
    if (state.watchedOnly) {
      filtered = filtered.filter(isWatching);
    }
    if (state.kind !== 'all') {
      filtered = filtered.filter(story => story.kind === state.kind);
    }

    list.textContent = '';

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'wrn-stories-empty';
      const message = document.createElement('p');
      message.textContent = text().empty;
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.textContent = `↶ ${text().reset}`;
      reset.addEventListener('click', () => {
        state = { ...DEFAULT_STATE };
        writeLocal(STATE_KEY, state);
        render();
      });
      empty.append(message, reset);
      list.appendChild(empty);
      return;
    }

    filtered.slice(0, 24).forEach(story => list.appendChild(storyCard(story)));
  }

  function render() {
    const view = ensureRoot();
    const copy = text();
    view.textContent = '';
    view.setAttribute('lang', language());

    const head = document.createElement('header');
    head.className = 'wrn-stories-topbar';
    const title = document.createElement('h2');
    title.textContent = copy.title;
    const beta = document.createElement('span');
    beta.className = 'wrn-stories-beta-185';
    beta.textContent = copy.beta;
    beta.title = copy.betaHint;
    title.append(' ', beta);
    const intro = document.createElement('p');
    intro.textContent = `🔒 ${copy.intro}`;
    head.append(title, intro);
    view.appendChild(head);

    makeControls(view);

    const list = document.createElement('section');
    list.className = 'wrn-stories-list';
    list.setAttribute('aria-live', 'polite');
    view.appendChild(list);

    renderStories();
  }

  function show() {
    active = true;
    hideNews();
    const view = ensureRoot();
    view.hidden = false;
    document.body.classList.add('wrn-stories-active');
    render();
  }

  function hide() {
    active = false;
    document.body.classList.remove('wrn-stories-active');
    if (root) root.hidden = true;
    showNewsAgain();
  }

  function refreshLanguage() {
    if (active) render();
  }

  window.addEventListener('wrn-language-change', refreshLanguage);
  window.addEventListener('wrn-watchlist-change', () => {
    if (active) renderStories();
  });

  window.WRNStories = Object.freeze({
    show,
    hide,
    render,
    refreshLanguage,
    getWatchlist: currentWatchlist,
    setWatchlist,
    test: Object.freeze({
      clusterStories: (...args) => window.WRNStoriesCore.clusterStories(...args),
      isWatching
    })
  });
})();
