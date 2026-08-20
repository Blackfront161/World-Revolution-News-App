/* World Revolution News 1.7.5 – Fehlerprotokoll und sicherer Modus */
'use strict';

(() => {
  if (window.WRNSafety) return;

  const ERROR_KEY = 'wrn_error_log_v1';
  const SAFE_KEY = 'wrn_safe_mode_v1';
  const MAX_ERRORS = 30;

  function safeJson(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readErrors() {
    try {
      const value = safeJson(localStorage.getItem(ERROR_KEY), []);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeErrors(items) {
    try {
      localStorage.setItem(ERROR_KEY, JSON.stringify(items.slice(-MAX_ERRORS)));
    } catch {}
  }

  function record(kind, message, source = '', line = 0, column = 0, stack = '') {
    const cleanMessage = String(message || 'Unknown error').slice(0, 1000);
    const item = {
      time: new Date().toISOString(),
      kind: String(kind || 'error'),
      message: cleanMessage,
      source: String(source || '').slice(0, 600),
      line: Number(line || 0),
      column: Number(column || 0),
      stack: String(stack || '').slice(0, 3000),
      version: window.WRN_CONFIG?.version || ''
    };
    const errors = readErrors();
    const previous = errors[errors.length - 1];
    if (
      previous
      && previous.message === item.message
      && previous.source === item.source
      && Date.now() - Date.parse(previous.time || 0) < 3000
    ) return;
    errors.push(item);
    writeErrors(errors);
    document.dispatchEvent(new CustomEvent('wrnerrorrecorded', { detail: item }));
  }

  function isActive() {
    const query = new URLSearchParams(location.search).get('safe');
    if (query === '1') return true;
    if (query === '0') return false;
    try { return localStorage.getItem(SAFE_KEY) === '1'; }
    catch { return false; }
  }

  function setActive(active) {
    try { localStorage.setItem(SAFE_KEY, active ? '1' : '0'); } catch {}
    const url = new URL(location.href);
    if (active) url.searchParams.set('safe', '1');
    else url.searchParams.delete('safe');
    location.assign(url.toString());
  }

  function clearErrors() {
    try { localStorage.removeItem(ERROR_KEY); } catch {}
  }

  if (isActive()) document.documentElement.classList.add('wrn-safe-mode');

  window.addEventListener('error', event => {
    record(
      'error',
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error?.stack || ''
    );
  });

  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    record(
      'promise',
      reason?.message || String(reason || 'Unhandled promise rejection'),
      '',
      0,
      0,
      reason?.stack || ''
    );
  });

  window.WRNSafety = Object.freeze({
    isActive,
    setActive,
    getErrors: readErrors,
    clearErrors,
    record
  });
})();
