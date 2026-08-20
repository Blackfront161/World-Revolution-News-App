/* World Revolution News 1.7.11 – Typografie-Auswahl ohne DOM-Endlosschleife */
'use strict';

(() => {
  if (window.WRNTypography) return;

  const KEY = 'wrn_typography_mode_v1';
  const MODES = ['balanced', 'accessible', 'compact'];
  const TEXTS = {
    de:{label:'Lesemodus',balanced:'Ausgewogen',accessible:'Sehr gut lesbar',compact:'Kompakt',note:'Offline-Systemschriften · bleibt bei Updates gespeichert'},
    en:{label:'Reading mode',balanced:'Balanced',accessible:'High readability',compact:'Compact',note:'Offline system fonts · preserved across updates'},
    es:{label:'Modo de lectura',balanced:'Equilibrado',accessible:'Alta legibilidad',compact:'Compacto',note:'Fuentes del sistema sin conexión'},
    fr:{label:'Mode de lecture',balanced:'Équilibré',accessible:'Très lisible',compact:'Compact',note:'Polices système hors ligne'},
    it:{label:'Modalità lettura',balanced:'Bilanciata',accessible:'Alta leggibilità',compact:'Compatta',note:'Caratteri di sistema offline'},
    pt:{label:'Modo de leitura',balanced:'Equilibrado',accessible:'Alta legibilidade',compact:'Compacto',note:'Tipos de letra do sistema offline'},
    ru:{label:'Режим чтения',balanced:'Сбалансированный',accessible:'Высокая читаемость',compact:'Компактный',note:'Офлайн системные шрифты'},
    el:{label:'Λειτουργία ανάγνωσης',balanced:'Ισορροπημένη',accessible:'Υψηλή αναγνωσιμότητα',compact:'Συμπαγής',note:'Γραμματοσειρές συστήματος εκτός σύνδεσης'},
    tr:{label:'Okuma modu',balanced:'Dengeli',accessible:'Yüksek okunabilirlik',compact:'Kompakt',note:'Çevrimdışı sistem yazı tipleri'}
  };

  function language() {
    const raw = document.getElementById('ui-language')?.value
      || document.documentElement.lang
      || 'en';
    const code = String(raw).toLowerCase().split(/[-_]/)[0];
    return TEXTS[code] ? code : 'en';
  }

  function copy() {
    return TEXTS[language()] || TEXTS.en;
  }

  function current() {
    try {
      const stored = localStorage.getItem(KEY);
      return MODES.includes(stored) ? stored : 'balanced';
    } catch {
      return 'balanced';
    }
  }

  function apply(mode, persist = true) {
    const normalized = MODES.includes(mode) ? mode : 'balanced';
    document.documentElement.dataset.wrnTypography = normalized;
    if (persist) {
      try { localStorage.setItem(KEY, normalized); } catch {}
    }
    document.dispatchEvent(new CustomEvent('wrntypographychange', {
      detail: { mode: normalized }
    }));
    return normalized;
  }

  function buildField() {
    const grid = document.querySelector('.wrn-more-grid');
    if (!grid || grid.querySelector('.wrn-typography-field')) return;

    const texts = copy();
    const field = document.createElement('label');
    field.className = 'wrn-more-field wrn-typography-field';

    const label = document.createElement('span');
    label.textContent = texts.label;

    const select = document.createElement('select');
    select.setAttribute('aria-label', texts.label);
    MODES.forEach(mode => {
      const option = document.createElement('option');
      option.value = mode;
      option.textContent = texts[mode];
      select.appendChild(option);
    });
    select.value = current();
    select.addEventListener('change', () => apply(select.value));

    const note = document.createElement('small');
    note.textContent = texts.note;

    field.append(label, select, note);

    const fontSizeField = [...grid.querySelectorAll('.wrn-more-field')]
      .find(item => item.querySelector('select[data-original-id="ui-fontsize"]'));
    if (fontSizeField?.nextSibling) grid.insertBefore(field, fontSizeField.nextSibling);
    else grid.appendChild(field);
  }

  function setTextIfChanged(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function refreshField() {
    const field = document.querySelector('.wrn-typography-field');
    if (!field) return;

    const texts = copy();
    const label = field.querySelector(':scope > span');
    const select = field.querySelector('select');
    const note = field.querySelector('small');

    setTextIfChanged(label, texts.label);

    if (select) {
      [...select.options].forEach(option => {
        setTextIfChanged(option, texts[option.value] || option.value);
      });

      if (select.getAttribute('aria-label') !== texts.label) {
        select.setAttribute('aria-label', texts.label);
      }

      const nextValue = current();
      if (select.value !== nextValue) select.value = nextValue;
    }

    setTextIfChanged(note, texts.note);
  }

  apply(current(), false);

  let refreshQueued = false;
  const observer = new MutationObserver(() => {
    if (refreshQueued) return;
    refreshQueued = true;

    window.requestAnimationFrame(() => {
      refreshQueued = false;
      buildField();
      refreshField();
    });
  });

  function init() {
    buildField();
    observer.observe(document.body, { childList: true, subtree: true });
    document.getElementById('ui-language')?.addEventListener('change', () => {
      window.setTimeout(refreshField, 10);
    });
  }

  window.WRNTypography = Object.freeze({
    modes: [...MODES],
    current,
    apply,
    refresh: refreshField
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
