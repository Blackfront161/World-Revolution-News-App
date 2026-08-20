/* World Revolution News 2.1.1 – App-Selbsttest */
'use strict';

(() => {
  if (window.WRNDiagnostics) return;

  const TEXTS = {
    de:{
      button:'App prüfen',title:'App-Selbsttest',run:'Erneut prüfen',copy:'Bericht kopieren',
      safeOn:'Sicheren Modus einschalten',safeOff:'Sicheren Modus ausschalten',
      clear:'Fehlerprotokoll leeren',close:'Schließen',running:'Prüfung läuft…',
      copied:'Prüfbericht kopiert.',copyFailed:'Kopieren nicht möglich.',
      pass:'Bestanden',warn:'Hinweise',fail:'Fehler',total:'Prüfungen',
      note:'Der sichere Modus lädt nur zentrale Funktionen und hilft bei Problemen mit Zusatzmodulen.'
    },
    en:{
      button:'Check app',title:'App self-test',run:'Run again',copy:'Copy report',
      safeOn:'Enable safe mode',safeOff:'Disable safe mode',
      clear:'Clear error log',close:'Close',running:'Running checks…',
      copied:'Diagnostic report copied.',copyFailed:'Could not copy report.',
      pass:'Passed',warn:'Warnings',fail:'Errors',total:'Checks',
      note:'Safe mode loads only core features and helps isolate optional-module problems.'
    }
  };

  let latestReport = null;

  function language() {
    const raw = document.getElementById('ui-language')?.value
      || document.documentElement.lang
      || 'en';
    return String(raw).toLowerCase().startsWith('de') ? 'de' : 'en';
  }

  function t() { return TEXTS[language()] || TEXTS.en; }

  function addResult(results, status, name, value) {
    results.push({ status, name, value: String(value ?? '') });
  }

  async function fetchJson(url, timeout = 9000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json, text/plain;q=0.5' },
        signal: controller.signal
      });
      const text = await response.text();
      let data = null;
      try { data = JSON.parse(text); } catch {}
      return { ok: response.ok, status: response.status, data, text, headers: response.headers };
    } finally {
      clearTimeout(timer);
    }
  }

  function storageCheck() {
    const key = '__wrn_diag_test__';
    try {
      localStorage.setItem(key, '1');
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    } finally {
      try { localStorage.removeItem(key); } catch {}
    }
  }

  async function serviceWorkerCheck() {
    if (!('serviceWorker' in navigator)) return { supported:false, controlled:false, scope:'' };
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      controlled: Boolean(navigator.serviceWorker.controller),
      scope: registration?.scope || ''
    };
  }

  async function runChecks() {
    const results = [];
    const startedAt = new Date().toISOString();
    const version = window.WRN_CONFIG?.version || 'unknown';

    addResult(
      results,
      version === '2.1.1' || version === '2.1.1-dev.1-test' || version === '2.1.1-dev.1-preview' ? 'pass' : 'warn',
      'App-Version',
      version
    );

    addResult(
      results,
      navigator.onLine ? 'pass' : 'warn',
      'Netzwerk',
      navigator.onLine ? 'online' : 'offline'
    );

    const storageAvailable = storageCheck();
    addResult(
      results,
      storageAvailable ? 'pass' : 'fail',
      'Lokaler Speicher',
      storageAvailable ? 'verfügbar' : 'nicht verfügbar'
    );

    const sw = await serviceWorkerCheck().catch(error => ({ error }));
    addResult(
      results,
      sw.error ? 'fail' : (sw.controlled ? 'pass' : 'warn'),
      'Service Worker',
      sw.error?.message || (sw.controlled ? `aktiv · ${sw.scope}` : 'registriert oder erster Aufruf noch nicht kontrolliert')
    );

    const moduleChecks = [
      ['Navigation', Boolean(document.querySelector('.wrn-app-tabs') || window.__wrnAppNav175Loaded)],
      ['Briefing', Boolean(window.WRNBriefing)],
      ['Zusammenfassung', Boolean(window.WRNSummary) || window.WRNSafety?.isActive?.()],
      ['Audio-Katalog', Boolean(window.__wrnAudioCatalog175Loaded) || window.WRNSafety?.isActive?.()],
      ['Gemeinsame Übersetzungen', Boolean(window.WRNSharedTranslations)],
      ['Typografie', Boolean(window.WRNTypography)],
      ['Fehlerprotokoll', Boolean(window.WRNSafety)]
    ];

    moduleChecks.forEach(([name, ok]) => {
      addResult(results, ok ? 'pass' : 'warn', `Modul: ${name}`, ok ? 'geladen' : 'nicht geladen');
    });

    const dataUrls = window.WRN_CONFIG?.dataUrls || {};
    const targets = [
      ['News', dataUrls.news || './news.json', 'array'],
      ['Termine', dataUrls.events || './events.json', 'array'],
      ['Podcasts', dataUrls.podcasts || './podcasts.json', 'array'],
      ['Podcast-Status', dataUrls.podcastHealth || './podcast-health.json', 'object'],
      ['Radios', dataUrls.radio || './radio-stations.json', 'array'],
      ['Radio-Status', dataUrls.radioHealth || './radio-health.json', 'object']
    ];

    const responses = {};
    for (const [name, url, expected] of targets) {
      try {
        const response = await fetchJson(`${url}${url.includes('?') ? '&' : '?'}diag=${Date.now()}`);
        responses[name] = response.data;
        const typeOk = expected === 'array'
          ? Array.isArray(response.data)
          : Boolean(response.data && typeof response.data === 'object' && !Array.isArray(response.data));
        const count = Array.isArray(response.data)
          ? response.data.length
          : (response.data && typeof response.data === 'object' ? Object.keys(response.data).length : 0);
        addResult(
          results,
          response.ok && typeOk ? 'pass' : 'fail',
          `Daten: ${name}`,
          response.ok && typeOk ? `${count} Einträge` : `HTTP ${response.status} oder falsches JSON-Format`
        );
      } catch (error) {
        addResult(results, 'fail', `Daten: ${name}`, error?.message || String(error));
      }
    }

    const radioHealth = responses['Radio-Status'];
    if (radioHealth && typeof radioHealth === 'object') {
      const rows = Object.values(radioHealth);
      const unknown = rows.filter(item => item?.status === 'unknown').length;
      const healthy = rows.filter(item => ['healthy','degraded'].includes(item?.status) || item?.ok === true).length;
      const broken = rows.filter(item => item?.status === 'error').length;
      addResult(
        results,
        unknown === 0 ? (broken ? 'warn' : 'pass') : 'warn',
        'Radio-Gesundheit',
        `${healthy} erreichbar · ${broken} gestört · ${unknown} ungeprüft`
      );
    }

    const podcastHealth = responses['Podcast-Status'];
    if (podcastHealth && typeof podcastHealth === 'object') {
      const rows = Object.values(podcastHealth);
      const healthy = rows.filter(item => ['healthy','stale'].includes(item?.status) || item?.ok === true).length;
      const broken = rows.filter(item => ['error','disabled'].includes(item?.status)).length;
      addResult(
        results,
        broken ? 'warn' : 'pass',
        'Podcast-Gesundheit',
        `${healthy} nutzbar · ${broken} gestört/deaktiviert`
      );
    }

    const sharedUrl = String(window.WRN_CONFIG?.sharedTranslationUrl || '').replace(/\/+$/, '');
    if (sharedUrl) {
      try {
        const response = await fetchJson(`${sharedUrl}/health?diag=${Date.now()}`);
        const data = response.data || {};
        addResult(
          results,
          response.ok && data.ok && data.storage === 'kv' ? 'pass' : 'warn',
          'Gemeinsamer Übersetzungscache',
          response.ok
            ? `${data.storage || 'unbekannt'} · upstream ${data.upstreamConfigured ? 'bereit' : 'fehlt'}`
            : `HTTP ${response.status}`
        );
      } catch (error) {
        addResult(results, 'warn', 'Gemeinsamer Übersetzungscache', error?.message || String(error));
      }
    } else {
      addResult(results, 'warn', 'Gemeinsamer Übersetzungscache', 'nicht konfiguriert');
    }

    addResult(
      results,
      'speechSynthesis' in window ? 'pass' : 'warn',
      'Gerätestimmen',
      'speechSynthesis' in window ? `${speechSynthesis.getVoices?.().length || 0} Stimmen gemeldet` : 'nicht unterstützt'
    );

    const errors = window.WRNSafety?.getErrors?.() || [];
    addResult(
      results,
      errors.length ? 'warn' : 'pass',
      'Gespeicherte App-Fehler',
      errors.length ? `${errors.length} Einträge · zuletzt: ${errors.at(-1)?.message || ''}` : 'keine'
    );

    latestReport = {
      app: 'World Revolution News',
      version,
      startedAt,
      completedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: location.href,
      safeMode: Boolean(window.WRNSafety?.isActive?.()),
      typography: window.WRNTypography?.current?.() || '',
      results,
      errors
    };
    return latestReport;
  }

  function resultRow(item) {
    const row = document.createElement('div');
    row.className = `wrn-diagnostics-row ${item.status}`;

    const icon = document.createElement('span');
    icon.className = 'wrn-diagnostics-icon';
    icon.textContent = item.status === 'pass' ? '✓' : item.status === 'warn' ? '!' : '×';

    const name = document.createElement('div');
    name.className = 'wrn-diagnostics-name';
    name.textContent = item.name;

    const value = document.createElement('div');
    value.className = 'wrn-diagnostics-value';
    value.textContent = item.value;

    row.append(icon, name, value);
    return row;
  }

  function render(dialog, report) {
    const results = report.results || [];
    const counts = {
      pass: results.filter(item => item.status === 'pass').length,
      warn: results.filter(item => item.status === 'warn').length,
      fail: results.filter(item => item.status === 'fail').length,
      total: results.length
    };

    const summary = dialog.querySelector('.wrn-diagnostics-summary');
    summary.textContent = '';
    [
      [counts.pass, t().pass],
      [counts.warn, t().warn],
      [counts.fail, t().fail],
      [counts.total, t().total]
    ].forEach(([value, label]) => {
      const item = document.createElement('div');
      const strong = document.createElement('strong');
      const span = document.createElement('span');
      strong.textContent = value;
      span.textContent = label;
      item.append(strong, span);
      summary.appendChild(item);
    });

    const list = dialog.querySelector('.wrn-diagnostics-list');
    list.textContent = '';
    results.forEach(item => list.appendChild(resultRow(item)));
  }

  async function copyReport(status) {
    const text = JSON.stringify(latestReport || {}, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = t().copied;
    } catch {
      status.textContent = t().copyFailed;
    }
  }

  function close() {
    document.querySelector('.wrn-diagnostics-overlay')?.remove();
  }

  async function open() {
    close();

    const overlay = document.createElement('div');
    overlay.className = 'wrn-diagnostics-overlay';

    const dialog = document.createElement('section');
    dialog.className = 'wrn-diagnostics-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const head = document.createElement('div');
    head.className = 'wrn-diagnostics-head';
    const title = document.createElement('h2');
    title.textContent = `🩺 ${t().title}`;
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'wrn-diagnostics-close';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', t().close);
    closeButton.addEventListener('click', close);
    head.append(title, closeButton);

    const note = document.createElement('p');
    note.className = 'wrn-diagnostics-note';
    note.textContent = t().note;

    const summary = document.createElement('div');
    summary.className = 'wrn-diagnostics-summary';

    const list = document.createElement('div');
    list.className = 'wrn-diagnostics-list';
    list.textContent = t().running;

    const status = document.createElement('div');
    status.className = 'wrn-diagnostics-status';
    status.setAttribute('role', 'status');

    const actions = document.createElement('div');
    actions.className = 'wrn-diagnostics-actions';

    const makeButton = (label, handler, className = '') => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = label;
      button.addEventListener('click', handler);
      return button;
    };

    const runButton = makeButton(t().run, async () => {
      list.textContent = t().running;
      status.textContent = '';
      render(dialog, await runChecks());
    });

    const copyButton = makeButton(t().copy, () => copyReport(status));
    const safeActive = Boolean(window.WRNSafety?.isActive?.());
    const safeButton = makeButton(
      safeActive ? t().safeOff : t().safeOn,
      () => window.WRNSafety?.setActive?.(!safeActive),
      'danger'
    );
    const clearButton = makeButton(t().clear, () => {
      window.WRNSafety?.clearErrors?.();
      status.textContent = 'OK';
    });
    actions.append(runButton, copyButton, safeButton, clearButton);

    dialog.append(head, note, summary, list, status, actions);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });
    document.body.appendChild(overlay);

    render(dialog, await runChecks());
    closeButton.focus();
  }

  function injectButton() {
    const actions = document.querySelector('.wrn-more-actions');
    if (!actions || actions.querySelector('[data-wrn-action="diagnostics"]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wrn-more-action';
    button.dataset.wrnAction = 'diagnostics';

    const icon = document.createElement('span');
    icon.className = 'wrn-menu-action-icon';
    icon.textContent = '🩺';

    const label = document.createElement('span');
    label.className = 'wrn-menu-action-label';
    label.textContent = t().button;

    button.append(icon, label);
    button.addEventListener('click', open);
    actions.insertBefore(button, actions.firstChild);
  }

  const observer = new MutationObserver(injectButton);

  function init() {
    injectButton();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.WRNDiagnostics = Object.freeze({
    open,
    run: runChecks,
    latest: () => latestReport
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
