/* World Revolution News 1.8.3 – source recovery states UI */
'use strict';

(() => {
  if (typeof window === 'undefined' || window.WRNSourceRecoveryUI183) return;

  const VERSION = '1.8.3-b4';
  const CONTROL_ID = 'wrn-source-recovery-controls-183';
  const STATES = Object.freeze([
    'available',
    'recovered',
    'temporarily_restricted',
    'website_reachable_feed_broken',
    'feed_broken_unconfirmed',
    'permanently_broken',
    'not_checked'
  ]);

  const TEXTS = Object.freeze({
    en: {
      heading: 'Recovery state', all: 'All recovery states', candidate: 'Discovered feed candidate',
      available: 'Available', recovered: 'Recovered', temporarily_restricted: 'Temporarily restricted',
      website_reachable_feed_broken: 'Website available, feed broken',
      feed_broken_unconfirmed: 'Feed issue – confirmation pending',
      permanently_broken: 'Feed permanently broken', not_checked: 'Not checked'
    },
    de: {
      heading: 'Wiederherstellungsstatus', all: 'Alle Wiederherstellungszustände', candidate: 'Gefundene Feed-Adresse',
      available: 'Erreichbar', recovered: 'Wiederhergestellt', temporarily_restricted: 'Vorübergehend eingeschränkt',
      website_reachable_feed_broken: 'Website erreichbar, Feed defekt',
      feed_broken_unconfirmed: 'Feed-Fehler – Bestätigung ausstehend',
      permanently_broken: 'Feed dauerhaft defekt', not_checked: 'Noch nicht geprüft'
    },
    es: {
      heading: 'Estado de recuperación', all: 'Todos los estados', candidate: 'Dirección de feed encontrada',
      available: 'Disponible', recovered: 'Recuperada', temporarily_restricted: 'Temporalmente restringida',
      website_reachable_feed_broken: 'Sitio disponible, feed defectuoso',
      feed_broken_unconfirmed: 'Fallo del feed – pendiente de confirmación',
      permanently_broken: 'Feed defectuoso permanentemente', not_checked: 'No comprobada'
    },
    fr: {
      heading: 'État de récupération', all: 'Tous les états', candidate: 'Adresse de flux trouvée',
      available: 'Disponible', recovered: 'Récupérée', temporarily_restricted: 'Temporairement limitée',
      website_reachable_feed_broken: 'Site disponible, flux défectueux',
      feed_broken_unconfirmed: 'Problème de flux – confirmation en attente',
      permanently_broken: 'Flux définitivement défectueux', not_checked: 'Non vérifiée'
    },
    it: {
      heading: 'Stato di recupero', all: 'Tutti gli stati', candidate: 'Indirizzo feed trovato',
      available: 'Disponibile', recovered: 'Ripristinata', temporarily_restricted: 'Temporaneamente limitata',
      website_reachable_feed_broken: 'Sito disponibile, feed non funzionante',
      feed_broken_unconfirmed: 'Problema del feed – conferma in attesa',
      permanently_broken: 'Feed definitivamente non funzionante', not_checked: 'Non verificata'
    },
    pt: {
      heading: 'Estado de recuperação', all: 'Todos os estados', candidate: 'Endereço de feed encontrado',
      available: 'Disponível', recovered: 'Recuperada', temporarily_restricted: 'Temporariamente limitada',
      website_reachable_feed_broken: 'Site disponível, feed com defeito',
      feed_broken_unconfirmed: 'Problema no feed – confirmação pendente',
      permanently_broken: 'Feed permanentemente com defeito', not_checked: 'Não verificada'
    },
    ru: {
      heading: 'Состояние восстановления', all: 'Все состояния', candidate: 'Найденный адрес ленты',
      available: 'Доступен', recovered: 'Восстановлен', temporarily_restricted: 'Временно ограничен',
      website_reachable_feed_broken: 'Сайт доступен, лента не работает',
      feed_broken_unconfirmed: 'Ошибка ленты — ожидается подтверждение',
      permanently_broken: 'Лента окончательно не работает', not_checked: 'Не проверен'
    },
    el: {
      heading: 'Κατάσταση αποκατάστασης', all: 'Όλες οι καταστάσεις', candidate: 'Διεύθυνση ροής που βρέθηκε',
      available: 'Διαθέσιμη', recovered: 'Αποκαταστάθηκε', temporarily_restricted: 'Προσωρινά περιορισμένη',
      website_reachable_feed_broken: 'Ο ιστότοπος λειτουργεί, η ροή όχι',
      feed_broken_unconfirmed: 'Πρόβλημα ροής – αναμονή επιβεβαίωσης',
      permanently_broken: 'Η ροή είναι μόνιμα εκτός λειτουργίας', not_checked: 'Δεν ελέγχθηκε'
    },
    tr: {
      heading: 'Kurtarma durumu', all: 'Tüm durumlar', candidate: 'Bulunan akış adresi',
      available: 'Erişilebilir', recovered: 'Kurtarıldı', temporarily_restricted: 'Geçici olarak kısıtlı',
      website_reachable_feed_broken: 'Site erişilebilir, akış bozuk',
      feed_broken_unconfirmed: 'Akış sorunu – doğrulama bekleniyor',
      permanently_broken: 'Akış kalıcı olarak bozuk', not_checked: 'Henüz kontrol edilmedi'
    }
  });

  const state = {
    filter: 'all',
    byName: new Map(),
    byUrl: new Map(),
    loading: false,
    loaded: false,
    scheduled: false,
    decorating: false,
    modalObserver: null
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
  const list = value => Array.isArray(value) ? value : (value ? [value] : []);

  const canonicalName = value => String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '');

  const canonicalUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.href);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      const path = url.pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
      return `${host}${path}${url.search}`;
    } catch {
      return raw.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    }
  };

  const rowsFrom = data => {
    if (Array.isArray(data)) return data.filter(item => item && typeof item === 'object');
    if (!data || typeof data !== 'object') return [];
    for (const key of ['sources', 'items', 'results', 'entries']) {
      if (Array.isArray(data[key])) return data[key];
      if (data[key] && typeof data[key] === 'object') return Object.values(data[key]);
    }
    return Object.values(data).filter(item => item && typeof item === 'object');
  };

  const recoveryStateOf = (item, broadStatus = '') => {
    const explicit = String(item?.detailedState || item?.recoveryState || '').trim();
    if (STATES.includes(explicit)) return explicit;
    const status = String(item?.status || broadStatus || '').toLowerCase();
    if (status === 'ok') return 'available';
    if (status === 'warning') return 'temporarily_restricted';
    if (status === 'error') return 'feed_broken_unconfirmed';
    return 'not_checked';
  };

  const validHttpUrl = value => {
    try {
      const url = new URL(String(value || ''));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  function indexHealth(data) {
    state.byName.clear();
    state.byUrl.clear();
    rowsFrom(data).forEach(item => {
      const name = canonicalName(item.name || item.sourceName || item.source || '');
      const urls = [
        item.url,
        item.configuredUrl,
        item.previousUrl,
        item.finalUrl,
        item.replacementUrl
      ];
      if (name) state.byName.set(name, item);
      urls.forEach(value => {
        const key = canonicalUrl(value);
        if (key) state.byUrl.set(key, item);
      });
    });
  }

  async function fetchHealth() {
    if (state.loading) return;
    state.loading = true;
    try {
      const configured = window.WRN_CONFIG?.dataUrls?.sourceHealth || './source-health.json';
      const separator = configured.includes('?') ? '&' : '?';
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(`${configured}${separator}recovery=${Date.now()}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        indexHealth(await response.json());
        state.loaded = true;
      } finally {
        window.clearTimeout(timer);
      }
    } catch (error) {
      console.warn('WRN source recovery UI:', error);
    } finally {
      state.loading = false;
      scheduleDecorate();
    }
  }

  function ensureControls(modal) {
    let controls = document.getElementById(CONTROL_ID);
    if (!controls) {
      controls = document.createElement('section');
      controls.id = CONTROL_ID;
      controls.className = 'wrn-source-recovery-controls-183';

      const label = document.createElement('label');
      const heading = document.createElement('span');
      heading.dataset.recoveryHeading = 'true';
      const select = document.createElement('select');
      select.dataset.recoveryFilter = 'true';
      select.addEventListener('change', () => {
        state.filter = select.value;
        decorateRows();
      });
      label.append(heading, select);

      const summary = document.createElement('div');
      summary.dataset.recoverySummary = 'true';
      summary.className = 'wrn-source-recovery-summary-183';
      controls.append(label, summary);

      const status = modal.querySelector('#wrn-source-status');
      if (status?.parentNode) status.insertAdjacentElement('afterend', controls);
      else modal.prepend(controls);
    }
    refreshControlsLanguage(controls);
    return controls;
  }

  function refreshControlsLanguage(controls = document.getElementById(CONTROL_ID)) {
    if (!controls) return;
    const copy = text();
    const heading = controls.querySelector('[data-recovery-heading]');
    const select = controls.querySelector('[data-recovery-filter]');
    if (heading) heading.textContent = copy.heading;
    if (!select) return;
    const selected = STATES.includes(state.filter) ? state.filter : 'all';
    select.textContent = '';
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = copy.all;
    select.appendChild(all);
    STATES.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = copy[key];
      select.appendChild(option);
    });
    select.value = selected;
  }

  function healthForRow(row) {
    const name = canonicalName(row.querySelector('.wrn-source-row-main strong')?.textContent || '');
    const url = canonicalUrl(row.querySelector('a[href]')?.href || '');
    return (url && state.byUrl.get(url)) || (name && state.byName.get(name)) || null;
  }

  function addCandidate(row, item) {
    let link = row.querySelector('[data-recovery-candidate]');
    const candidate = validHttpUrl(item?.replacementUrl);
    if (!candidate) {
      link?.remove();
      return;
    }
    if (!link) {
      link = document.createElement('a');
      link.dataset.recoveryCandidate = 'true';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      row.appendChild(link);
    }
    link.href = candidate;
    link.textContent = `${text().candidate}: ${candidate}`;
  }

  function renderRecoverySummary(rows) {
    const summary = document.querySelector(`#${CONTROL_ID} [data-recovery-summary]`);
    if (!summary) return;
    const counts = Object.fromEntries(STATES.map(key => [key, 0]));
    rows.forEach(row => {
      const key = row.dataset.recoveryState || 'not_checked';
      counts[key] = (counts[key] || 0) + 1;
    });
    summary.textContent = '';
    STATES.forEach(key => {
      if (!counts[key]) return;
      const chip = document.createElement('span');
      chip.dataset.state = key;
      chip.textContent = `${text()[key]}: ${counts[key]}`;
      summary.appendChild(chip);
    });
  }

  function decorateRows() {
    const modal = document.getElementById('wrn-source-verification-modal');
    if (!modal || modal.hidden || state.decorating) return;
    state.decorating = true;
    try {
      ensureControls(modal);
      const rows = [...modal.querySelectorAll('.wrn-source-row')];
      rows.forEach(row => {
        const item = healthForRow(row);
        const broad = row.dataset.state || '';
        const recoveryState = recoveryStateOf(item, broad);
        row.dataset.recoveryState = recoveryState;
        const badge = row.querySelector('.wrn-source-badge');
        if (badge && badge.textContent !== text()[recoveryState]) {
          badge.textContent = text()[recoveryState];
        }
        addCandidate(row, item);
        row.hidden = state.filter !== 'all' && recoveryState !== state.filter;
      });
      renderRecoverySummary(rows);
    } finally {
      state.decorating = false;
    }
  }

  function scheduleDecorate() {
    if (state.scheduled) return;
    state.scheduled = true;
    window.requestAnimationFrame(() => {
      state.scheduled = false;
      decorateRows();
    });
  }

  function observeModal() {
    const modal = document.getElementById('wrn-source-verification-modal');
    if (!modal || state.modalObserver) return;
    state.modalObserver = new MutationObserver(() => {
      if (!state.decorating) scheduleDecorate();
    });
    state.modalObserver.observe(modal, { childList: true, subtree: true });
    scheduleDecorate();
  }

  function openRecoveryUi() {
    window.setTimeout(() => {
      observeModal();
      scheduleDecorate();
      void fetchHealth();
    }, 0);
  }

  function init() {
    document.addEventListener('click', event => {
      if (event.target.closest?.('#wrn-source-verification-open')) openRecoveryUi();
      if (event.target.closest?.('[data-source-action="refresh"]')) {
        window.setTimeout(() => void fetchHealth(), 120);
      }
    }, true);

    const rootObserver = new MutationObserver(() => {
      if (document.getElementById('wrn-source-verification-modal')) observeModal();
    });
    rootObserver.observe(document.documentElement, { childList: true, subtree: true });

    document.getElementById('ui-language')?.addEventListener('change', () => {
      window.setTimeout(() => {
        refreshControlsLanguage();
        scheduleDecorate();
      }, 0);
    });
    window.addEventListener('wrn-language-change', () => {
      refreshControlsLanguage();
      scheduleDecorate();
    });

    observeModal();
  }

  window.WRNSourceRecoveryUI183 = Object.freeze({
    version: VERSION,
    refresh: fetchHealth,
    recoveryStateOf,
    state: () => ({ filter: state.filter, loaded: state.loaded })
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
