/* Privacy-first, local-only diagnostics for the News App 2 preview. */
'use strict';

(() => {
  const STORAGE_KEY = 'wrn_local_diagnostics_v1';
  const MAX_RECORDS = 30;

  function safeText(value, limit = 240) {
    return String(value || '')
      .replace(/https?:\/\/\S+/gi, '[URL]')
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[E-Mail]')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, limit);
  }

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.slice(-MAX_RECORDS) : [];
    } catch {
      return [];
    }
  }

  function write(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
      return true;
    } catch {
      return false;
    }
  }

  function record(kind, value, context = '') {
    const message = safeText(value?.message || value || 'Unbekannter Fehler');
    if (!message) return false;
    const records = read();
    records.push({
      recordedAt: new Date().toISOString(),
      kind: safeText(kind, 32) || 'error',
      message,
      context: safeText(context, 80),
      online: navigator.onLine !== false,
      version: safeText(window.WRN_CONFIG?.version || 'preview', 40)
    });
    return write(records);
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  window.addEventListener('error', event => {
    record('script-error', event.error || event.message, 'window');
  });
  window.addEventListener('unhandledrejection', event => {
    record('promise-rejection', event.reason, 'window');
  });

  window.WRNLocalDiagnostics = Object.freeze({
    storageKey: STORAGE_KEY,
    list: read,
    count: () => read().length,
    record,
    clear,
    exportPayload: () => ({
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      privacy: 'local-only; URLs and email addresses removed; no automatic upload',
      records: read()
    })
  });
})();
