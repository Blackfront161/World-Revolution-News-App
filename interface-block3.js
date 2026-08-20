/* World Revolution News 1.8.4 – release interface improvements */
'use strict';

(() => {
  if (typeof window === 'undefined' || window.WRNInterfaceBlock3) return;

  const VERSION = '1.8.4-rc1';
  const CORRUPTION_CATEGORY = 'WRN Corruption';
  const SOURCE_BAR_ID = 'wrn-source-range-bar-183';
  const ZINE_EDITOR_CLASS = 'wrn-zine-editor-183';
  const DAY_MS = 86400000;
  const TOPIC_CATEGORIES = new Set([
    'Labor Struggles', 'Antifascism', 'Antisexism', 'Queer-Feminism', 'Antiracism',
    'No Borders', 'Anticapitalism', 'Theory & Strategy', 'Anticolonialism',
    'Anti-Imperialism', 'Squatting & Housing', 'Demonstrations', 'Anti-Rep & Prisons',
    'Cyberactivism', 'No War', 'Animal Liberation', 'Eco-Anarchism',
    'Indigenous Struggles', 'Radical Health & Disability', 'Libraries', 'Movement News',
    CORRUPTION_CATEGORY
  ]);

  const TEXTS = Object.freeze({
    en: {
      corruption: 'Corruption', sources: 'Sources', allSources: 'All sources', period: 'Period',
      hours24: 'Last 24 hours', days7: 'Last 7 days', days30: 'Last 30 days',
      apply: 'Apply', reset: 'Reset', loading30: 'Loading the full 30-day archive…',
      loaded30: '30-day archive loaded', loadFailed: 'The archive could not be loaded. Current data remains available.',
      selected: 'selected', translate: 'Translate', zineTitle: 'Edit Zine before printing',
      title: 'Title', text: 'Article text', up: 'Move up', down: 'Move down', remove: 'Remove',
      image: 'Article image', imageUrl: 'Image URL', chooseImage: 'Choose an image',
      removeImage: 'Remove image', saved: 'Changes saved locally',
      imageFailed: 'The image could not be processed.', switching: 'Opening developments…'
    },
    de: {
      corruption: 'Korruption', sources: 'Quellen', allSources: 'Alle Quellen', period: 'Zeitraum',
      hours24: 'Letzte 24 Stunden', days7: 'Letzte 7 Tage', days30: 'Letzte 30 Tage',
      apply: 'Anwenden', reset: 'Zurücksetzen', loading30: 'Vollständiges 30-Tage-Archiv wird geladen…',
      loaded30: '30-Tage-Archiv geladen', loadFailed: 'Das Archiv konnte nicht geladen werden. Die aktuellen Daten bleiben erhalten.',
      selected: 'ausgewählt', translate: 'Übersetzen', zineTitle: 'Zine vor dem Druck bearbeiten',
      title: 'Titel', text: 'Artikeltext', up: 'Nach oben', down: 'Nach unten', remove: 'Entfernen',
      image: 'Artikelbild', imageUrl: 'Bildadresse', chooseImage: 'Bild auswählen',
      removeImage: 'Bild entfernen', saved: 'Änderungen lokal gespeichert',
      imageFailed: 'Das Bild konnte nicht verarbeitet werden.', switching: 'Entwicklungen werden geöffnet…'
    },
    es: {
      corruption: 'Corrupción', sources: 'Fuentes', allSources: 'Todas las fuentes', period: 'Periodo',
      hours24: 'Últimas 24 horas', days7: 'Últimos 7 días', days30: 'Últimos 30 días',
      apply: 'Aplicar', reset: 'Restablecer', loading30: 'Cargando el archivo completo de 30 días…',
      loaded30: 'Archivo de 30 días cargado', loadFailed: 'No se pudo cargar el archivo. Los datos actuales siguen disponibles.',
      selected: 'seleccionadas', translate: 'Traducir', zineTitle: 'Editar el zine antes de imprimir',
      title: 'Título', text: 'Texto del artículo', up: 'Subir', down: 'Bajar', remove: 'Eliminar',
      image: 'Imagen del artículo', imageUrl: 'URL de la imagen', chooseImage: 'Elegir imagen',
      removeImage: 'Quitar imagen', saved: 'Cambios guardados localmente',
      imageFailed: 'No se pudo procesar la imagen.', switching: 'Abriendo desarrollos…'
    },
    fr: {
      corruption: 'Corruption', sources: 'Sources', allSources: 'Toutes les sources', period: 'Période',
      hours24: 'Dernières 24 heures', days7: '7 derniers jours', days30: '30 derniers jours',
      apply: 'Appliquer', reset: 'Réinitialiser', loading30: 'Chargement de l’archive complète sur 30 jours…',
      loaded30: 'Archive de 30 jours chargée', loadFailed: 'L’archive n’a pas pu être chargée. Les données actuelles restent disponibles.',
      selected: 'sélectionnées', translate: 'Traduire', zineTitle: 'Modifier le zine avant impression',
      title: 'Titre', text: 'Texte de l’article', up: 'Monter', down: 'Descendre', remove: 'Retirer',
      image: 'Image de l’article', imageUrl: 'Adresse de l’image', chooseImage: 'Choisir une image',
      removeImage: 'Retirer l’image', saved: 'Modifications enregistrées localement',
      imageFailed: 'L’image n’a pas pu être traitée.', switching: 'Ouverture des évolutions…'
    },
    it: {
      corruption: 'Corruzione', sources: 'Fonti', allSources: 'Tutte le fonti', period: 'Periodo',
      hours24: 'Ultime 24 ore', days7: 'Ultimi 7 giorni', days30: 'Ultimi 30 giorni',
      apply: 'Applica', reset: 'Reimposta', loading30: 'Caricamento dell’archivio completo di 30 giorni…',
      loaded30: 'Archivio di 30 giorni caricato', loadFailed: 'Impossibile caricare l’archivio. I dati attuali restano disponibili.',
      selected: 'selezionate', translate: 'Traduci', zineTitle: 'Modifica lo zine prima della stampa',
      title: 'Titolo', text: 'Testo dell’articolo', up: 'Sposta su', down: 'Sposta giù', remove: 'Rimuovi',
      image: 'Immagine dell’articolo', imageUrl: 'Indirizzo immagine', chooseImage: 'Scegli immagine',
      removeImage: 'Rimuovi immagine', saved: 'Modifiche salvate localmente',
      imageFailed: 'Non è stato possibile elaborare l’immagine.', switching: 'Apertura sviluppi…'
    },
    pt: {
      corruption: 'Corrupção', sources: 'Fontes', allSources: 'Todas as fontes', period: 'Período',
      hours24: 'Últimas 24 horas', days7: 'Últimos 7 dias', days30: 'Últimos 30 dias',
      apply: 'Aplicar', reset: 'Repor', loading30: 'A carregar o arquivo completo de 30 dias…',
      loaded30: 'Arquivo de 30 dias carregado', loadFailed: 'Não foi possível carregar o arquivo. Os dados atuais continuam disponíveis.',
      selected: 'selecionadas', translate: 'Traduzir', zineTitle: 'Editar o zine antes de imprimir',
      title: 'Título', text: 'Texto do artigo', up: 'Mover para cima', down: 'Mover para baixo', remove: 'Remover',
      image: 'Imagem do artigo', imageUrl: 'Endereço da imagem', chooseImage: 'Escolher imagem',
      removeImage: 'Remover imagem', saved: 'Alterações guardadas localmente',
      imageFailed: 'Não foi possível processar a imagem.', switching: 'A abrir desenvolvimentos…'
    },
    ru: {
      corruption: 'Коррупция', sources: 'Источники', allSources: 'Все источники', period: 'Период',
      hours24: 'Последние 24 часа', days7: 'Последние 7 дней', days30: 'Последние 30 дней',
      apply: 'Применить', reset: 'Сбросить', loading30: 'Загружается полный архив за 30 дней…',
      loaded30: 'Архив за 30 дней загружен', loadFailed: 'Не удалось загрузить архив. Текущие данные остаются доступными.',
      selected: 'выбрано', translate: 'Перевести', zineTitle: 'Редактировать зин перед печатью',
      title: 'Заголовок', text: 'Текст статьи', up: 'Выше', down: 'Ниже', remove: 'Удалить',
      image: 'Изображение статьи', imageUrl: 'Адрес изображения', chooseImage: 'Выбрать изображение',
      removeImage: 'Удалить изображение', saved: 'Изменения сохранены локально',
      imageFailed: 'Не удалось обработать изображение.', switching: 'Открываются события…'
    },
    el: {
      corruption: 'Διαφθορά', sources: 'Πηγές', allSources: 'Όλες οι πηγές', period: 'Περίοδος',
      hours24: 'Τελευταίες 24 ώρες', days7: 'Τελευταίες 7 ημέρες', days30: 'Τελευταίες 30 ημέρες',
      apply: 'Εφαρμογή', reset: 'Επαναφορά', loading30: 'Φόρτωση πλήρους αρχείου 30 ημερών…',
      loaded30: 'Το αρχείο 30 ημερών φορτώθηκε', loadFailed: 'Δεν ήταν δυνατή η φόρτωση του αρχείου. Τα τρέχοντα δεδομένα παραμένουν διαθέσιμα.',
      selected: 'επιλεγμένες', translate: 'Μετάφραση', zineTitle: 'Επεξεργασία zine πριν από την εκτύπωση',
      title: 'Τίτλος', text: 'Κείμενο άρθρου', up: 'Πάνω', down: 'Κάτω', remove: 'Αφαίρεση',
      image: 'Εικόνα άρθρου', imageUrl: 'Διεύθυνση εικόνας', chooseImage: 'Επιλογή εικόνας',
      removeImage: 'Αφαίρεση εικόνας', saved: 'Οι αλλαγές αποθηκεύτηκαν τοπικά',
      imageFailed: 'Δεν ήταν δυνατή η επεξεργασία της εικόνας.', switching: 'Άνοιγμα εξελίξεων…'
    },
    tr: {
      corruption: 'Yolsuzluk', sources: 'Kaynaklar', allSources: 'Tüm kaynaklar', period: 'Dönem',
      hours24: 'Son 24 saat', days7: 'Son 7 gün', days30: 'Son 30 gün',
      apply: 'Uygula', reset: 'Sıfırla', loading30: 'Tam 30 günlük arşiv yükleniyor…',
      loaded30: '30 günlük arşiv yüklendi', loadFailed: 'Arşiv yüklenemedi. Mevcut veriler kullanılabilir durumda.',
      selected: 'seçili', translate: 'Çevir', zineTitle: 'Yazdırmadan önce zine’i düzenle',
      title: 'Başlık', text: 'Makale metni', up: 'Yukarı taşı', down: 'Aşağı taşı', remove: 'Kaldır',
      image: 'Makale görseli', imageUrl: 'Görsel adresi', chooseImage: 'Görsel seç',
      removeImage: 'Görseli kaldır', saved: 'Değişiklikler yerel olarak kaydedildi',
      imageFailed: 'Görsel işlenemedi.', switching: 'Gelişmeler açılıyor…'
    }
  });

  const CORRUPTION_TERMS = Object.freeze([
    'corruption', 'corrupt', 'bribery', 'bribe', 'embezzlement', 'kickback', 'graft', 'extortion', 'nepotism', 'cronyism',
    'korruption', 'korrupt', 'bestechung', 'bestechlich', 'veruntreuung', 'vetternwirtschaft', 'nepotismus',
    'corrupción', 'corrupcion', 'soborno', 'cohecho', 'malversación', 'malversacion',
    'corruption', 'pot-de-vin', 'pots-de-vin', 'détournement', 'detournement',
    'corruzione', 'tangente', 'tangenti', 'concussione', 'peculato',
    'corrupção', 'corrupcao', 'suborno', 'peculato',
    'коррупц', 'взятк', 'хищен', 'непотизм',
    'διαφθορ', 'δωροδοκ', 'υπεξαίρεσ',
    'yolsuzluk', 'rüşvet', 'rusvet', 'zimmet', 'kayırma', 'kayirma'
  ]);

  const state = {
    selectedSources: new Set(),
    pendingDays: 7,
    appliedDays: 0,
    fullArchiveLoaded: false,
    archiveLoading: false,
    lastCategory: '',
    storySwitching: false
  };

  const language = () => {
    const raw = String(
      window.WRNI18n?.currentLanguage?.()
      || document.getElementById('ui-language')?.value
      || document.documentElement.lang
      || 'en'
    ).toLowerCase().split(/[-_]/)[0];
    return TEXTS[raw] ? raw : 'en';
  };

  const text = () => TEXTS[language()] || TEXTS.en;
  const clean = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const normalize = value => clean(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

  function currentCategory() {
    try { return String(activeKontinent || 'Global'); } catch { return 'Global'; }
  }

  function articles() {
    try { return Array.isArray(allNewsData) ? allNewsData : []; } catch { return []; }
  }

  function currentItems() {
    try { return Array.isArray(currentFilteredItems) ? currentFilteredItems : []; } catch { return []; }
  }

  function sourceName(item) {
    return clean(item?.quelleName || item?.sourceName || item?.source || item?.author || '');
  }

  function articleKey(item) {
    return clean(
      item?.link
      || item?.id
      || `${sourceName(item)}::${item?.title || ''}::${item?.pubDate || item?.published || ''}`
    );
  }

  function dateMs(item) {
    const raw = item?.eventStart || item?.pubDate || item?.published || item?.date || item?.createdAt;
    const value = raw ? new Date(raw).getTime() : 0;
    return Number.isFinite(value) ? value : 0;
  }

  function matchesCorruption(item) {
    const categories = getArticleCategoriesSafe(item);
    if (
      item?.type === 'event'
      || item?.sourceType === 'radar-api'
      || clean(item?.kontinent) === 'Radar'
      || categories.includes('Radar')
    ) return false;
    const containsTerm = value => {
      const haystack = normalize(
        (Array.isArray(value) ? value : [value])
          .flat()
          .join(' ')
      );
      return CORRUPTION_TERMS.some(term => haystack.includes(normalize(term)));
    };

    // Nur Titel, Zusammenfassung oder redaktionelle Metadaten sind belastbare
    // Signale. Volltexte enthalten oft historische Nebenbemerkungen und
    // erzeugten zuvor zahlreiche sachfremde Treffer.
    return containsTerm(item?.title)
      || containsTerm([item?.summary, item?.description])
      || containsTerm([
      item?.kategorie, item?.category, categories, item?.topics, item?.tags
      ]);
  }

  function rowsForCategory(input, category = currentCategory()) {
    const rows = Array.isArray(input) ? input : [];
    if (category === CORRUPTION_CATEGORY) return rows.filter(matchesCorruption);
    if (category === 'Global' || !category) {
      return rows.filter(item => (
        item?.type !== 'event'
        && item?.sourceType !== 'radar-api'
        && !getArticleCategoriesSafe(item).includes('Radar')
      ));
    }
    if (['Bookmarks', 'Read'].includes(category)) return [];
    if (typeof articleMatchesCategory === 'function') {
      try { return rows.filter(item => articleMatchesCategory(item, category)); } catch {}
    }
    return rows;
  }

  function getArticleCategoriesSafe(item) {
    if (typeof getArticleCategories === 'function') {
      try { return getArticleCategories(item); } catch {}
    }
    const categories = Array.isArray(item?.categories) ? item.categories : [];
    const legacy = clean(item?.kontinent);
    return legacy ? [...categories, legacy] : categories;
  }

  function baseArticlesForCategory(category = currentCategory()) {
    return rowsForCategory(articles(), category);
  }

  function filterRows(input, options = {}) {
    const rows = Array.isArray(input) ? input : [];
    const category = String(options.category || currentCategory());
    if (['Bookmarks', 'Read', 'Radar'].includes(category)) return [...rows];

    const selected = options.selectedSources === undefined
      ? state.selectedSources
      : new Set(options.selectedSources || []);
    const days = Number(options.days === undefined ? state.appliedDays : options.days) || 0;
    let result = category === CORRUPTION_CATEGORY
      ? rows.filter(matchesCorruption)
      : [...rows];

    if (selected.size) result = result.filter(item => selected.has(sourceName(item)));
    if (days > 0) {
      const now = Number(options.now || Date.now());
      const cutoff = now - days * DAY_MS;
      result = result.filter(item => dateMs(item) >= cutoff);
    }
    return result;
  }

  function shouldShowSourceBar() {
    const tab = document.body?.dataset?.wrnTab || '';
    return ['start', 'regions', 'topics'].includes(tab)
      && !document.body.classList.contains('wrn-detail-open');
  }

  function status(message, kind = '') {
    const node = document.querySelector(`#${SOURCE_BAR_ID} [data-source-range-status]`);
    if (!node) return;
    node.textContent = message || '';
    node.dataset.kind = kind;
  }

  function mergeRows(existing, incoming) {
    const map = new Map();
    [...existing, ...incoming].forEach(item => {
      if (!item || typeof item !== 'object') return;
      const key = articleKey(item);
      if (!key) return;
      const previous = map.get(key);
      if (!previous || dateMs(item) >= dateMs(previous)) map.set(key, item);
    });
    return [...map.values()];
  }

  function fetchJsonWithXhr(url) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'json';
      request.timeout = 45000;
      request.setRequestHeader('Accept', 'application/json');
      request.onload = () => {
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(`HTTP ${request.status}`));
          return;
        }
        const data = request.response;
        if (!Array.isArray(data)) {
          reject(new Error('JSON is not a list.'));
          return;
        }
        resolve(data);
      };
      request.onerror = () => reject(new Error('Network error'));
      request.ontimeout = () => reject(new Error('Timeout'));
      request.send();
    });
  }

  async function ensureThirtyDayArchive() {
    if (state.fullArchiveLoaded || state.archiveLoading) return state.fullArchiveLoaded;
    state.archiveLoading = true;
    status(text().loading30, 'loading');
    const configuredArchive = window.WRN_CONFIG?.dataUrls?.newsArchive;
    const currentFeed = window.WRN_CONFIG?.dataUrls?.news || './news-feed.json';
    const baseUrl = configuredArchive || currentFeed.replace(/news-feed\.json(?:\?.*)?$/i, 'news.json');
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = `${baseUrl}${separator}v=${Date.now()}`;

    try {
      const rows = await fetchJsonWithXhr(url);
      const cutoff = Date.now() - 31 * DAY_MS;
      const recent = rows.filter(item => {
        const value = dateMs(item);
        return value > 0 && value >= cutoff;
      });
      const merged = mergeRows(articles(), recent);
      try { allNewsData = merged; } catch {}
      window.WRNSourceProfiles?.setArticles?.(merged);
      try {
        window.WRNStorage?.putDataset?.('news-30-day', recent).catch?.(() => false);
      } catch {}
      state.fullArchiveLoaded = true;
      status(`${text().loaded30}: ${recent.length}`, 'ok');
      return true;
    } catch (error) {
      console.warn('WRN 30-day archive:', error);
      status(text().loadFailed, 'error');
      return false;
    } finally {
      state.archiveLoading = false;
    }
  }

  function sourceUniverse() {
    return [...new Set(baseArticlesForCategory().map(sourceName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, language()))
      .slice(0, 200);
  }

  function renderSourceChoices() {
    const container = document.querySelector(`#${SOURCE_BAR_ID} [data-source-range-choices]`);
    const count = document.querySelector(`#${SOURCE_BAR_ID} [data-source-range-count]`);
    if (!container) return;
    const names = sourceUniverse();
    container.textContent = '';

    names.forEach(name => {
      const label = document.createElement('label');
      label.className = 'wrn-source-range-chip-183';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = name;
      input.checked = state.selectedSources.has(name);
      input.addEventListener('change', () => {
        if (input.checked) state.selectedSources.add(name);
        else state.selectedSources.delete(name);
        updateSourceCount();
      });
      const span = document.createElement('span');
      span.textContent = name;
      label.append(input, span);
      container.appendChild(label);
    });

    if (count) count.textContent = String(names.length);
    updateSourceCount();
  }

  function updateSourceCount() {
    const toggle = document.querySelector(`#${SOURCE_BAR_ID} [data-source-range-toggle]`);
    if (!toggle) return;
    const number = state.selectedSources.size;
    toggle.textContent = number
      ? `${text().sources}: ${number} ${text().selected}`
      : `${text().sources}: ${text().allSources}`;
  }

  function ensureSourceBar() {
    let bar = document.getElementById(SOURCE_BAR_ID);
    if (bar) return bar;

    bar = document.createElement('aside');
    bar.id = SOURCE_BAR_ID;
    bar.className = 'wrn-source-range-bar-183';
    bar.hidden = true;
    bar.innerHTML = `
      <button type="button" data-source-range-toggle aria-expanded="false"></button>
      <section data-source-range-panel hidden>
        <header>
          <strong data-source-range-heading></strong>
          <span><span data-source-range-count>0</span></span>
        </header>
        <div data-source-range-choices class="wrn-source-range-choices-183"></div>
        <div class="wrn-source-range-controls-183">
          <label><span data-source-range-period></span>
            <select data-source-range-days>
              <option value="1"></option>
              <option value="7" selected></option>
              <option value="30"></option>
            </select>
          </label>
          <button type="button" data-source-range-apply></button>
          <button type="button" data-source-range-reset></button>
        </div>
        <p data-source-range-status aria-live="polite"></p>
      </section>`;

    bar.addEventListener('click', event => {
      const toggle = event.target.closest('[data-source-range-toggle]');
      if (toggle) {
        const panel = bar.querySelector('[data-source-range-panel]');
        panel.hidden = !panel.hidden;
        toggle.setAttribute('aria-expanded', String(!panel.hidden));
        if (!panel.hidden) renderSourceChoices();
        return;
      }
      if (event.target.closest('[data-source-range-apply]')) void applySourceRange();
      if (event.target.closest('[data-source-range-reset]')) resetSourceRange();
    });

    bar.querySelector('[data-source-range-days]').addEventListener('change', event => {
      state.pendingDays = Number(event.target.value || 7);
    });

    document.body.appendChild(bar);
    refreshSourceBarLanguage();
    return bar;
  }

  function refreshSourceBarLanguage() {
    const bar = ensureSourceBar();
    const copy = text();
    bar.querySelector('[data-source-range-heading]').textContent = copy.sources;
    bar.querySelector('[data-source-range-period]').textContent = copy.period;
    const options = bar.querySelector('[data-source-range-days]').options;
    options[0].textContent = copy.hours24;
    options[1].textContent = copy.days7;
    options[2].textContent = copy.days30;
    bar.querySelector('[data-source-range-apply]').textContent = copy.apply;
    bar.querySelector('[data-source-range-reset]').textContent = copy.reset;
    updateSourceCount();
  }

  async function applySourceRange() {
    const days = Number(
      document.querySelector(`#${SOURCE_BAR_ID} [data-source-range-days]`)?.value
      || state.pendingDays
      || 7
    );
    state.pendingDays = days;
    if (days > 0) await ensureThirtyDayArchive();
    state.appliedDays = days;
    try { window.applyFilters?.(); } catch (error) { console.error(error); }
    const selected = [...state.selectedSources];
    const periodLabel = document.querySelector(
      `#${SOURCE_BAR_ID} [data-source-range-days]`
    )?.selectedOptions?.[0]?.textContent || `${days} days`;
    status(
      selected.length
        ? `${selected.join(' · ')} — ${periodLabel}`
        : `${text().allSources} — ${periodLabel}`,
      'ok'
    );
    renderSourceChoices();
  }

  function resetSourceRange() {
    state.selectedSources.clear();
    state.pendingDays = 7;
    state.appliedDays = 0;
    const select = document.querySelector(`#${SOURCE_BAR_ID} [data-source-range-days]`);
    if (select) select.value = '7';
    status('');
    try { window.applyFilters?.(); } catch (error) { console.error(error); }
    renderSourceChoices();
  }

  function installFilterWrapper() {
    if (window.__wrnBlock3FilterWrapped || typeof window.applyFilters !== 'function') return;
    window.__wrnBlock3FilterWrapped = true;
    const originalApplyFilters = window.applyFilters;

    window.applyFilters = function(...args) {
      const result = originalApplyFilters.apply(this, args);
      queueCardDecoration();
      queueSourceBarRefresh();
      return result;
    };
  }

  function installCategoryWrapper() {
    if (window.__wrnBlock3CategoryWrapped || typeof window.ladeKontinentNews !== 'function') return;
    window.__wrnBlock3CategoryWrapped = true;
    const originalLoad = window.ladeKontinentNews;

    window.ladeKontinentNews = function(category, ...rest) {
      const value = String(category || 'Global');
      if (state.lastCategory && state.lastCategory !== value) {
        state.selectedSources.clear();
        state.appliedDays = 0;
        status('');
      }
      state.lastCategory = value;
      const result = originalLoad.call(this, value, ...rest);
      queueSourceBarRefresh();
      queueCorruptionTab();
      const sparseTopic = TOPIC_CATEGORIES.has(value)
        && baseArticlesForCategory(value).length < 12;
      if (sparseTopic && !state.fullArchiveLoaded && !state.archiveLoading) {
        ensureThirtyDayArchive().then(loaded => {
          if (!loaded || currentCategory() !== value) return;
          originalLoad.call(window, value, ...rest);
          queueSourceBarRefresh();
          queueCorruptionTab();
        });
      }
      return result;
    };
  }

  function corruptionLabel() {
    return text().corruption;
  }

  function installCorruptionTab() {
    if (document.body?.dataset?.wrnTab !== 'topics') return;
    const bar = document.querySelector('.wrn-subtabs');
    if (!bar) return;

    let button = bar.querySelector('[data-subkey="WRN Corruption"], [data-subkey="wrn-corruption"]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'wrn-subtab';
      button.dataset.subkey = 'wrn-corruption';
      button.addEventListener('click', () => {
        bar.querySelectorAll('.wrn-subtab').forEach(node => node.classList.remove('active'));
        button.classList.add('active');
        state.lastCategory = CORRUPTION_CATEGORY;
        window.ladeKontinentNews?.(CORRUPTION_CATEGORY);
      });
      bar.appendChild(button);
    }
    button.textContent = corruptionLabel();
    if (currentCategory() === CORRUPTION_CATEGORY) {
      bar.querySelectorAll('.wrn-subtab').forEach(node => node.classList.toggle('active', node === button));
    }
  }

  function queueCorruptionTab() {
    window.setTimeout(installCorruptionTab, 0);
    window.setTimeout(installCorruptionTab, 120);
  }

  function actionType(node) {
    if (!node || node.dataset.wrnCardOnly === 'true') return '';
    const label = normalize(node.textContent || '');
    const id = String(node.id || '').toLocaleLowerCase();
    const classes = String(node.className || '').toLocaleLowerCase();

    /* The historic generic class name "btn-translate" is used for nearly
       every article action. It must never decide the action type by itself. */
    if (node.matches('.btn-expand, [id^="expand-"]') || /weiterlesen|read more|collapse|zuklappen/.test(label)) return 'expand';
    if (id.startsWith('podcast-') || classes.includes('btn-podcast') || /podcast|audio|vorlesen|listen/.test(label)) return 'podcast';
    if (id.startsWith('bmark-') || classes.includes('btn-read-later') || /spater|later|bookmark|merken|save|favor/.test(label)) return 'later';
    if (id.startsWith('zine-') || classes.includes('btn-zine-article') || /zine/.test(label)) return 'zine';
    if (id.startsWith('readstate-') || classes.includes('btn-read-state') || /gelesen|mark read|\bread\b|leido|okun/.test(label)) return 'read';
    if (/share|teilen|partag|compart|condiv|paylas|κοινο/.test(label)) return 'share';
    if (
      node.matches('a[href], [data-link], [data-url]')
      && (
        classes.includes('original')
        || /original|quelle|source|оригинал|πρωτότυπ|orijinal/.test(label)
      )
    ) return 'original';
    if (id.startsWith('btn-') || /ubersetz|translate|traduc|tradu|перев|μεταφ|cevir/.test(label)) return 'translate';
    return '';
  }

  function compactTranslateLabel(original) {
    const value = clean(original?.textContent || text().translate).replace(/^\[|\]$/g, '').trim();
    return value || text().translate;
  }

  function decorateCard(card) {
    if (!(card instanceof Element)) return;
    const row = card.querySelector('.button-row');
    const meta = card.querySelector('.meta');
    if (!row || !meta) return;

    const typed = new Map();
    [...row.children].forEach(node => {
      const type = actionType(node);
      if (!type || typed.has(type)) return;
      typed.set(type, node);
      node.dataset.wrnArticleAction = type;
    });

    const order = ['expand', 'translate', 'podcast', 'later', 'zine', 'read', 'share', 'original'];
    order.forEach(type => {
      const node = typed.get(type);
      if (node) row.appendChild(node);
    });

    const originalTranslate = typed.get('translate');
    if (originalTranslate) {
      originalTranslate.dataset.wrnTranslatePrimary = 'true';
      let compact = meta.querySelector('[data-wrn-card-only="true"]');
      if (!compact) {
        compact = document.createElement('button');
        compact.type = 'button';
        compact.className = 'wrn-card-language-action-183';
        compact.dataset.wrnCardOnly = 'true';
        compact.innerHTML = '<span class="wrn-rb-star-184" aria-hidden="true">★</span>';
        compact.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          originalTranslate.click();
        });
        meta.appendChild(compact);
      }
      const sync = () => {
        compact.dataset.label = compactTranslateLabel(originalTranslate);
        compact.title = compact.dataset.label;
        compact.setAttribute('aria-label', compact.dataset.label);
        compact.classList.toggle(
          'is-loading',
          Boolean(originalTranslate.disabled)
          || /loading|laden|charg|carg|загруз|φόρτ|yüklen/.test(
            normalize(originalTranslate.textContent)
          )
        );
      };
      sync();
      if (!originalTranslate.dataset.wrnCompactObserver) {
        originalTranslate.dataset.wrnCompactObserver = '183';
        new MutationObserver(sync).observe(originalTranslate, {
          childList: true,
          characterData: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'disabled']
        });
      }
    }
    const originalAction = typed.get('original');
    if (originalAction && !card.classList.contains('wrn-detail-card')) {
      let quickRow = card.querySelector(':scope > .wrn-card-quick-actions-184');
      if (!quickRow) {
        quickRow = document.createElement('div');
        quickRow.className = 'wrn-card-quick-actions-184';
        card.appendChild(quickRow);
      }
      let quickOriginal = quickRow.querySelector('[data-wrn-quick-original]');
      if (!quickOriginal) {
        quickOriginal = document.createElement('a');
        quickOriginal.dataset.wrnQuickOriginal = 'true';
        quickOriginal.className = 'wrn-card-original-action-184';
        quickOriginal.target = '_blank';
        quickOriginal.rel = 'noopener noreferrer';
        quickRow.appendChild(quickOriginal);
      }
      quickOriginal.textContent = clean(originalAction.textContent) || 'Original';
      const href = originalAction.getAttribute?.('href')
        || originalAction.dataset?.link
        || originalAction.dataset?.url
        || '';
      if (href) {
        quickOriginal.href = href;
        quickOriginal.onclick = null;
      } else {
        quickOriginal.removeAttribute('href');
        quickOriginal.onclick = event => {
          event.preventDefault();
          originalAction.click();
        };
      }
    }
    card.dataset.wrnBlock3Decorated = VERSION;
  }

  let decorateQueued = false;
  function queueCardDecoration() {
    if (decorateQueued) return;
    decorateQueued = true;
    window.requestAnimationFrame(() => {
      decorateQueued = false;
      document.querySelectorAll('#feed-container .card, #archive-container .card, .wrn-detail-host .card')
        .forEach(decorateCard);
    });
  }

  function zineStorageKey() {
    try { return typeof ZINE_KEY !== 'undefined' ? ZINE_KEY : 'wrn_zine_articles'; }
    catch { return 'wrn_zine_articles'; }
  }

  function zineItems() {
    try {
      if (typeof zineArticles !== 'undefined' && Array.isArray(zineArticles)) return zineArticles;
      const parsed = JSON.parse(localStorage.getItem(zineStorageKey()) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function snapshotArticle(item) {
    if (!item || typeof item !== 'object') return null;
    try { return structuredClone(item); } catch {}
    try { return JSON.parse(JSON.stringify(item)); } catch { return { ...item }; }
  }

  function commitZine(items) {
    const safe = (Array.isArray(items) ? items : []).filter(item => item && typeof item === 'object');
    try { zineArticles = safe; } catch {}
    try {
      if (typeof saveZineArticles === 'function') saveZineArticles();
      else localStorage.setItem(zineStorageKey(), JSON.stringify(safe));
    } catch (error) {
      console.warn('WRN Zine save:', error);
    }
    try { if (typeof updateZineUi === 'function') updateZineUi(); } catch {}
    return safe;
  }

  function visibleArticleKey(item) {
    try { return clean(window.WRNReading?.articleKey?.(item) || articleKey(item)); }
    catch { return articleKey(item); }
  }

  function exactArticleForCard(index) {
    let candidate = currentItems()[index] || null;
    const card = document.getElementById(`card-${index}`);
    const expected = clean(card?.dataset?.articleKey || '');
    if (candidate && (!expected || visibleArticleKey(candidate) === expected)) return candidate;
    if (expected) {
      candidate = currentItems().find(item => visibleArticleKey(item) === expected)
        || articles().find(item => visibleArticleKey(item) === expected)
        || null;
    }
    return candidate;
  }

  function installZineSelectionFix() {
    if (window.__wrnBlock3ZineSelectionWrapped || typeof window.toggleZine !== 'function') return;
    window.__wrnBlock3ZineSelectionWrapped = true;
    window.toggleZine = function(index) {
      const article = exactArticleForCard(Number(index));
      if (!article) return;
      const key = articleKey(article);
      const list = [...zineItems()];
      const existing = list.findIndex(item => articleKey(item) === key);
      if (existing >= 0) list.splice(existing, 1);
      else list.push(snapshotArticle(article));
      commitZine(list);
    };
  }

  function syncZineEditor() {
    const list = [...zineItems()];
    document.querySelectorAll(`#zine-list .${ZINE_EDITOR_CLASS}`).forEach(row => {
      const index = Number(row.dataset.zineIndex);
      if (!Number.isInteger(index) || !list[index]) return;
      const title = row.querySelector('[data-zine-edit-title]')?.value;
      const content = row.querySelector('[data-zine-edit-content]')?.value;
      const imageControl = row.querySelector('[data-zine-edit-image]');
      const image = imageControl?.dataset?.zineImageValue ?? imageControl?.value;
      if (typeof title === 'string') list[index].title = title;
      if (typeof content === 'string') list[index].content = content;
      if (typeof image === 'string') list[index].image = zineUrl(image);
    });
    commitZine(list);
    return list;
  }

  function zineHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function zineUrl(value) {
    const raw = String(value || '').trim();
    if (
      raw.length <= 4500000
      && /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(raw)
    ) return raw;
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function compressedZineImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('invalid-image'));
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('error', () => reject(reader.error || new Error('read-failed')), { once: true });
      reader.addEventListener('load', () => {
        const image = new Image();
        image.addEventListener('error', () => reject(new Error('decode-failed')), { once: true });
        image.addEventListener('load', () => {
          const maxSide = 1600;
          const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
          const context = canvas.getContext('2d', { alpha: false });
          if (!context) {
            reject(new Error('canvas-unavailable'));
            return;
          }
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const result = canvas.toDataURL('image/jpeg', 0.82);
          if (!zineUrl(result)) {
            reject(new Error('image-too-large'));
            return;
          }
          resolve(result);
        }, { once: true });
        image.src = String(reader.result || '');
      }, { once: true });
      reader.readAsDataURL(file);
    });
  }

  function printDesignedZine() {
    const items = syncZineEditor();
    if (!items.length) return;
    const settings = window.WRNZineDesigner1719?.settings?.() || {};
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.alert(language() === 'de'
        ? 'Bitte erlaube das Druckfenster für diese App.'
        : 'Please allow the print window for this app.');
      return;
    }

    const format = ['a4', 'a5', 'square', 'story'].includes(settings.format)
      ? settings.format : 'a4';
    const style = ['cyber', 'newspaper', 'minimal', 'contrast'].includes(settings.style)
      ? settings.style : 'cyber';
    const columns = ['1', '2', '3'].includes(String(settings.columns))
      ? String(settings.columns) : '2';
    const images = ['normal', 'gray', 'none'].includes(settings.images)
      ? settings.images : 'normal';
    const density = settings.density === 'compact' ? 'compact' : 'comfortable';
    const font = ['sans', 'serif', 'mono'].includes(settings.font) ? settings.font : 'sans';
    const accent = {
      cyan:'#00e5ef', red:'#ff3158', purple:'#9c74ff', black:'#111'
    }[settings.accent] || '#00e5ef';
    const pageSize = {
      a4:'A4 portrait', a5:'A5 portrait', square:'210mm 210mm', story:'108mm 192mm'
    }[format];
    const title = zineHtml(settings.headline || '');
    const intro = zineHtml(settings.intro || '');
    const footer = zineHtml(settings.footer || '');
    const labelSource = language() === 'de' ? 'Quelle' : 'Source';
    const labelOriginal = language() === 'de' ? 'Original' : 'Original';

    const rows = items.map(article => {
      const articleTitle = zineHtml(article.title || (language() === 'de' ? 'Ohne Titel' : 'Untitled'));
      const content = zineHtml(article.content || article.description || article.summary || '')
        .replace(/\r?\n\r?\n+/g, '</p><p>')
        .replace(/\r?\n/g, '<br>');
      const source = zineHtml(sourceName(article) || '—');
      const date = zineHtml(String(article.pubDate || article.published || '').slice(0, 10));
      const original = zineUrl(article.link);
      const image = images === 'none' ? '' : zineUrl(article.image);
      return `<article class="zine-article">
        ${image ? `<img class="hero" src="${zineHtml(image)}" alt="">` : ''}
        <h2>${articleTitle}</h2>
        <div class="meta">${zineHtml(labelSource)}: ${source}${date ? ` · ${date}` : ''}</div>
        <div class="copy"><p>${content}</p></div>
        ${original ? `<p class="original"><strong>${zineHtml(labelOriginal)}:</strong> ${zineHtml(original)}</p>` : ''}
      </article>`;
    }).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        @page { size:${pageSize}; margin:0; }
        * { box-sizing:border-box; }
        html,body { margin:0; padding:0; }
        body { font-family:${font === 'serif' ? 'Georgia,serif' : font === 'mono' ? 'Consolas,monospace' : 'Arial,sans-serif'}; line-height:${density === 'compact' ? '1.28' : '1.45'}; }
        main { min-height:100vh; padding:${density === 'compact' ? '8mm' : '12mm'}; }
        .issue { margin:0 0 9mm; padding:0 0 5mm; border-bottom:3px solid currentColor; text-align:center; }
        .issue h1 { margin:0; font-size:24pt; letter-spacing:.04em; }
        .issue p { margin:3mm auto 0; max-width:75ch; }
        .zine-article { break-after:page; padding-bottom:7mm; }
        .zine-article:last-of-type { break-after:auto; }
        .zine-article h2 { margin:0 0 3mm; font-size:18pt; line-height:1.12; }
        .meta { margin-bottom:4mm; font-size:9pt; opacity:.75; }
        .copy { columns:${columns}; column-gap:8mm; }
        .copy p { margin:0 0 3mm; orphans:3; widows:3; }
        .hero { width:100%; max-height:70mm; object-fit:cover; margin:0 0 5mm; filter:${images === 'gray' ? 'grayscale(1) contrast(1.05)' : 'none'}; }
        .original { margin-top:6mm; padding-top:3mm; border-top:1px solid currentColor; font-size:8pt; overflow-wrap:anywhere; }
        footer { position:fixed; left:8mm; right:8mm; bottom:4mm; text-align:center; font-size:7.5pt; opacity:.7; }
        body.cyber { background:#05060b; color:#f5f7ff; }
        body.cyber main { border:2px solid ${accent}; }
        body.cyber h1, body.cyber h2 { color:${accent}; }
        body.newspaper { background:#f5f0df; color:#17130d; font-family:Georgia,serif; }
        body.minimal { background:#fff; color:#151515; }
        body.contrast { background:#fff; color:#000; font-weight:600; }
        body.contrast main { border:4px solid #000; }
        @media screen { main { width:${format === 'a5' ? '148mm' : format === 'story' ? '108mm' : '210mm'}; margin:auto; } }
      </style></head><body class="${style}"><main>
        ${title || intro ? `<header class="issue">${title ? `<h1>${title}</h1>` : ''}${intro ? `<p>${intro}</p>` : ''}</header>` : ''}
        ${rows}
        ${footer ? `<footer>${footer}</footer>` : ''}
      </main></body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 350);
  }

  function renderZineEditor() {
    const container = document.getElementById('zine-list');
    if (!container) return;
    container.classList.add('zine-preview', 'wrn-zine-edit-list-183');
    const copy = text();
    const items = [...zineItems()];
    container.textContent = '';

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'zine-empty';
      empty.textContent = language() === 'de' ? 'Das Zine ist noch leer.' : 'The Zine is empty.';
      container.appendChild(empty);
    }

    items.forEach((article, index) => {
      const row = document.createElement('article');
      row.className = ZINE_EDITOR_CLASS;
      row.dataset.zineIndex = String(index);

      const heading = document.createElement('div');
      heading.className = 'wrn-zine-editor-heading-183';
      const number = document.createElement('strong');
      number.textContent = `${index + 1}. ${sourceName(article)}`;
      const actions = document.createElement('div');

      const makeMove = (label, delta, disabled) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.disabled = disabled;
        button.addEventListener('click', () => {
          syncZineEditor();
          const current = [...zineItems()];
          const target = index + delta;
          if (target < 0 || target >= current.length) return;
          [current[index], current[target]] = [current[target], current[index]];
          commitZine(current);
          renderZineEditor();
        });
        return button;
      };

      actions.append(
        makeMove(`↑ ${copy.up}`, -1, index === 0),
        makeMove(`↓ ${copy.down}`, 1, index === items.length - 1)
      );
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'danger';
      remove.textContent = copy.remove;
      remove.addEventListener('click', () => {
        syncZineEditor();
        const current = [...zineItems()];
        current.splice(index, 1);
        commitZine(current);
        renderZineEditor();
      });
      actions.appendChild(remove);
      heading.append(number, actions);

      const titleLabel = document.createElement('label');
      const titleSpan = document.createElement('span');
      titleSpan.textContent = copy.title;
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.value = String(article.title || '');
      titleInput.dataset.zineEditTitle = 'true';
      titleLabel.append(titleSpan, titleInput);

      const textLabel = document.createElement('label');
      const textSpan = document.createElement('span');
      textSpan.textContent = copy.text;
      const textarea = document.createElement('textarea');
      textarea.rows = 8;
      textarea.value = String(article.content || article.description || article.summary || '');
      textarea.dataset.zineEditContent = 'true';
      textLabel.append(textSpan, textarea);

      const imageGroup = document.createElement('div');
      imageGroup.className = 'wrn-zine-editor-image-184';
      const preview = document.createElement('img');
      preview.alt = '';
      const updatePreview = value => {
        const safe = zineUrl(value);
        preview.hidden = !safe;
        if (safe) preview.src = safe;
        else preview.removeAttribute('src');
      };
      updatePreview(article.image);

      const imageControls = document.createElement('div');
      const imageLabel = document.createElement('label');
      const imageSpan = document.createElement('span');
      imageSpan.textContent = copy.imageUrl;
      const imageInput = document.createElement('input');
      imageInput.type = 'url';
      imageInput.inputMode = 'url';
      imageInput.placeholder = 'https://…';
      const existingImage = zineUrl(article.image);
      imageInput.value = existingImage.startsWith('data:') ? '' : existingImage;
      imageInput.dataset.zineImageValue = existingImage;
      imageInput.dataset.zineEditImage = 'true';
      imageLabel.append(imageSpan, imageInput);

      const fileLabel = document.createElement('label');
      fileLabel.className = 'wrn-zine-file-label-184';
      const fileSpan = document.createElement('span');
      fileSpan.textContent = copy.chooseImage;
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/png,image/jpeg,image/webp,image/gif';
      fileLabel.append(fileSpan, fileInput);

      const removeImage = document.createElement('button');
      removeImage.type = 'button';
      removeImage.className = 'danger';
      removeImage.textContent = copy.removeImage;
      imageControls.append(imageLabel, fileLabel, removeImage);
      imageGroup.append(preview, imageControls);

      const saved = document.createElement('small');
      saved.className = 'wrn-zine-editor-saved-183';
      const saveOnChange = () => {
        syncZineEditor();
        saved.textContent = copy.saved;
        window.setTimeout(() => { saved.textContent = ''; }, 1200);
      };
      titleInput.addEventListener('change', saveOnChange);
      textarea.addEventListener('change', saveOnChange);
      imageInput.addEventListener('change', () => {
        imageInput.value = zineUrl(imageInput.value);
        imageInput.dataset.zineImageValue = imageInput.value;
        updatePreview(imageInput.dataset.zineImageValue);
        saveOnChange();
      });
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        fileInput.disabled = true;
        try {
          const result = await compressedZineImage(file);
          imageInput.value = '';
          imageInput.dataset.zineImageValue = result;
          updatePreview(imageInput.dataset.zineImageValue);
          saveOnChange();
        } catch {
          window.alert(copy.imageFailed);
        } finally {
          fileInput.disabled = false;
          fileInput.value = '';
        }
      });
      removeImage.addEventListener('click', () => {
        imageInput.value = '';
        imageInput.dataset.zineImageValue = '';
        fileInput.value = '';
        updatePreview('');
        saveOnChange();
      });

      row.append(heading, titleLabel, textLabel, imageGroup, saved);
      container.appendChild(row);
    });

    document.getElementById('zine-modal')?.classList.add('wrn-zine-modal-editor-183');
    try { window.WRNZineDesigner1719?.install?.(); } catch {}
  }

  function installZineEditor() {
    if (window.__wrnBlock3ZineEditorInstalled) return;
    window.__wrnBlock3ZineEditorInstalled = true;
    const originalOpen = window.openZineManager;

    window.renderZineList = renderZineEditor;
    window.openZineManager = function(...args) {
      const result = typeof originalOpen === 'function' ? originalOpen.apply(this, args) : undefined;
      const title = document.getElementById('zine-modal-title');
      if (title) title.textContent = text().zineTitle;
      const hint = document.getElementById('zine-modal-hint');
      if (hint) {
        hint.textContent = language() === 'de'
          ? '1. Artikel sammeln · 2. Überschriften und Texte bearbeiten · 3. Format gestalten und als PDF speichern.'
          : '1. Collect articles · 2. Edit titles and text · 3. Choose a format and save as PDF.';
      }
      window.setTimeout(renderZineEditor, 0);
      return result;
    };
    window.printZine = printDesignedZine;
  }

  function showStoriesIndicator(button) {
    document.querySelectorAll('.wrn-top-tab').forEach(node => {
      node.classList.toggle('active', node === button);
    });
    document.body.dataset.wrnTab = 'stories';
    let indicator = document.getElementById('wrn-stories-switch-indicator-183');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'wrn-stories-switch-indicator-183';
      indicator.className = 'wrn-stories-switch-indicator-183';
      document.body.appendChild(indicator);
    }
    indicator.innerHTML = `
      <span class="wrn-rb-star-184" aria-hidden="true">★</span>
      <span>${text().switching}</span>`;
    indicator.hidden = false;
  }

  function installImmediateStoriesSwitch() {
    if (window.__wrnBlock3StoriesSwitch) return;
    window.__wrnBlock3StoriesSwitch = true;
    document.addEventListener('click', event => {
      const button = event.target.closest?.('.wrn-top-tab[data-key="stories"]');
      if (!button || state.storySwitching || document.body.dataset.wrnTab === 'stories') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      state.storySwitching = true;
      showStoriesIndicator(button);
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          try { window.WRNActivateTab?.('stories'); }
          finally {
            window.setTimeout(() => {
              const indicator = document.getElementById('wrn-stories-switch-indicator-183');
              if (indicator) indicator.hidden = true;
              state.storySwitching = false;
            }, 120);
          }
        }, 0);
      });
    }, true);
  }

  let sourceRefreshQueued = false;
  function queueSourceBarRefresh() {
    if (sourceRefreshQueued) return;
    sourceRefreshQueued = true;
    window.requestAnimationFrame(() => {
      sourceRefreshQueued = false;
      const bar = ensureSourceBar();
      bar.hidden = !shouldShowSourceBar();
      if (!bar.hidden) renderSourceChoices();
      queueCorruptionTab();
    });
  }

  function installObservers() {
    const observer = new MutationObserver(records => {
      let cards = false;
      let navigation = false;
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.('.card') || node.querySelector?.('.card')) cards = true;
          if (node.matches?.('.wrn-subtabs, .wrn-top-tabs') || node.querySelector?.('.wrn-subtabs, .wrn-top-tabs')) navigation = true;
        }
      }
      if (cards) queueCardDecoration();
      if (navigation) queueSourceBarRefresh();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const bodyObserver = new MutationObserver(() => queueSourceBarRefresh());
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['data-wrn-tab', 'class'] });
  }

  function refreshLanguage() {
    refreshSourceBarLanguage();
    queueCorruptionTab();
    queueCardDecoration();
    if (document.getElementById('zine-modal')?.style.display === 'block') renderZineEditor();
  }

  function init() {
    ensureSourceBar();
    installFilterWrapper();
    installCategoryWrapper();
    installZineSelectionFix();
    installZineEditor();
    installImmediateStoriesSwitch();
    installObservers();
    queueCardDecoration();
    queueSourceBarRefresh();
    queueCorruptionTab();
    window.addEventListener('wrn-language-change', refreshLanguage);
    document.getElementById('ui-language')?.addEventListener('change', () => window.setTimeout(refreshLanguage, 0));
  }

  window.WRNInterfaceBlock3 = Object.freeze({
    version: VERSION,
    applySourceRange,
    resetSourceRange,
    ensureThirtyDayArchive,
    rowsForCategory,
    filterRows,
    matchesCorruption,
    renderZineEditor,
    state: () => ({
      selectedSources: [...state.selectedSources],
      pendingDays: state.pendingDays,
      appliedDays: state.appliedDays,
      fullArchiveLoaded: state.fullArchiveLoaded
    }),
    test: Object.freeze({ actionType, mergeRows, articleKey, rowsForCategory, filterRows })
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
