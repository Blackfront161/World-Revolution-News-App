/* WRN 1.7.21c: browser deletion is repository-scoped. */
/* World Revolution News – einfache Kontrolle des lokalen App-Speichers */
'use strict';

(() => {
    const BACKUP_FORMAT = 'world-revolution-news-backup';
    const BACKUP_VERSION = 2;
    const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
    const READING_KEYS = new Set([
        'wrn_bookmarks',
        'wrn_read_list',
        'wrn_read_positions',
        'wrn_zine_articles'
    ]);

    const texts = {
        en: {
            button: '💾 Storage', title: 'Local storage',
            intro: 'No account is required. These lists and offline files are stored only on this device. Privacy details are available under Info.',
            overview: 'Stored on this device', bookmarks: 'Read later', read: 'Read articles', zine: 'Zine',
            offline: 'Offline datasets', storage: 'Storage used', backup: 'Back up reading lists',
            backupHint: 'Exports Read later, Read status, reading positions and the Zine as a small JSON file.',
            export: 'Export backup', import: 'Import backup', deleteTitle: 'Free storage',
            deleteReading: 'Delete reading lists', deleteOffline: 'Delete offline storage', deleteAll: 'Clear cache & local app data',
            close: 'Close', ready: 'Ready.', working: 'Working…', exported: 'Backup downloaded.',
            imported: 'Backup imported. The app will reload.', importInvalid: 'This is not a valid World Revolution News backup.',
            importLarge: 'The selected backup is too large.', importConfirm: 'Import this backup? Existing reading lists will be replaced.',
            clearReadingConfirm: 'Delete Read later, Read status, reading positions and the Zine?',
            clearOfflineConfirm: 'Delete downloaded news, events, translations and app caches?',
            clearAllConfirm: 'Delete the cache and all local app data on this device, including bookmarks, settings, offline articles and translations?',
            cleared: 'Selected data deleted.', clearFailed: 'Data could not be fully deleted.',
            exportFailed: 'Backup could not be created.', importFailed: 'Backup could not be imported.'
        },
        de: {
            button: '💾 Speicher', title: 'Lokaler Speicher',
            intro: 'Es ist kein Konto nötig. Diese Listen und Offline-Dateien liegen nur auf diesem Gerät. Details zum Datenschutz findest du unter Info.',
            overview: 'Auf diesem Gerät gespeichert', bookmarks: 'Später lesen', read: 'Gelesene Artikel', zine: 'Zine',
            offline: 'Offline-Datensätze', storage: 'Belegter Speicher', backup: 'Leselisten sichern',
            backupHint: 'Exportiert Später lesen, Lesestatus, Lesepositionen und das Zine als kleine JSON-Datei.',
            export: 'Sicherung exportieren', import: 'Sicherung importieren', deleteTitle: 'Speicher freigeben',
            deleteReading: 'Leselisten löschen', deleteOffline: 'Offline-Speicher löschen', deleteAll: 'Cache & lokale App-Daten leeren',
            close: 'Schließen', ready: 'Bereit.', working: 'Wird verarbeitet …', exported: 'Sicherung wurde heruntergeladen.',
            imported: 'Sicherung wurde importiert. Die App wird neu geladen.', importInvalid: 'Diese Datei ist keine gültige World-Revolution-News-Sicherung.',
            importLarge: 'Die ausgewählte Sicherung ist zu groß.', importConfirm: 'Sicherung importieren? Vorhandene Leselisten werden ersetzt.',
            clearReadingConfirm: 'Später lesen, Lesestatus, Lesepositionen und Zine wirklich löschen?',
            clearOfflineConfirm: 'Heruntergeladene Nachrichten, Events, Übersetzungen und App-Caches löschen?',
            clearAllConfirm: 'Cache und alle lokalen App-Daten auf diesem Gerät löschen – einschließlich Lesezeichen, Einstellungen, Offline-Artikel und Übersetzungen?',
            cleared: 'Ausgewählte Daten wurden gelöscht.', clearFailed: 'Daten konnten nicht vollständig gelöscht werden.',
            exportFailed: 'Sicherung konnte nicht erstellt werden.', importFailed: 'Sicherung konnte nicht importiert werden.'
        }
    };

    function language() {
        try {
            if (typeof currentLang !== 'undefined' && currentLang) return currentLang;
        } catch {}
        return document.documentElement.lang || 'en';
    }

    function t() {
        return texts[language()] || texts.en;
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function readJson(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || 'null');
            return value ?? fallback;
        } catch {
            return fallback;
        }
    }

    function formatBytes(value) {
        const bytes = Number(value) || 0;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
        if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
        return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
    }

    function setStatus(message, kind = '') {
        const status = document.getElementById('data-control-status');
        if (!status) return;
        status.textContent = message;
        status.className = `data-control-status${kind ? ` ${kind}` : ''}`;
    }

    async function readStorageSummary() {
        let indexed = { datasetCount: 0, datasetBytes: 0, translationBytes: 0 };
        try {
            if (window.WRNStorage?.getStorageSummary) indexed = await window.WRNStorage.getStorageSummary();
        } catch (error) {
            console.warn('Lokale Speicherübersicht konnte nicht gelesen werden:', error);
        }

        let estimatedUsage = 0;
        try {
            if (navigator.storage?.estimate) estimatedUsage = Number((await navigator.storage.estimate()).usage || 0);
        } catch {}

        if (!estimatedUsage) {
            for (let index = 0; index < localStorage.length; index += 1) {
                const key = localStorage.key(index) || '';
                estimatedUsage += new Blob([key, localStorage.getItem(key) || '']).size;
            }
            estimatedUsage += Number(indexed.datasetBytes || 0) + Number(indexed.translationBytes || 0);
        }
        return { indexed, estimatedUsage };
    }

    async function refresh() {
        const bookmarks = readJson('wrn_bookmarks', []);
        const read = readJson('wrn_read_list', []);
        const zine = readJson('wrn_zine_articles', []);
        const summary = await readStorageSummary();
        setText('data-count-bookmarks', Array.isArray(bookmarks) ? String(bookmarks.length) : '0');
        setText('data-count-read', Array.isArray(read) ? String(read.length) : '0');
        setText('data-count-zine', Array.isArray(zine) ? String(zine.length) : '0');
        setText('data-count-offline', String(summary.indexed.datasetCount || 0));
        setText('data-storage-total', formatBytes(summary.estimatedUsage));
    }

    function refreshLanguage() {
        const locale = t();
        setText('btn-open-data-control', locale.button);
        setText('data-control-title', locale.title);
        setText('data-control-intro', locale.intro);
        setText('data-overview-title', locale.overview);
        setText('data-label-bookmarks', locale.bookmarks);
        setText('data-label-read', locale.read);
        setText('data-label-zine', locale.zine);
        setText('data-label-offline', locale.offline);
        setText('data-label-storage', locale.storage);
        setText('data-backup-title', locale.backup);
        setText('data-backup-hint', locale.backupHint);
        setText('btn-data-export', locale.export);
        setText('btn-data-import', locale.import);
        setText('data-delete-title', locale.deleteTitle);
        setText('btn-data-clear-reading', locale.deleteReading);
        setText('btn-data-clear-offline', locale.deleteOffline);
        setText('btn-data-clear-all', locale.deleteAll);
        setText('btn-data-close', locale.close);
    }

    function close() {
        const modal = document.getElementById('data-control-modal');
        if (modal) modal.style.display = 'none';
    }

    async function open() {
        if (typeof closeAllModals === 'function') closeAllModals();
        const overlay = document.getElementById('fb-overlay');
        const modal = document.getElementById('data-control-modal');
        if (overlay) overlay.style.display = 'block';
        if (modal) modal.style.display = 'block';
        refreshLanguage();
        setStatus(t().working);
        await refresh();
        setStatus(t().ready, 'success');
        window.setTimeout(() => document.getElementById('btn-data-export')?.focus(), 0);
    }

    function exportBackup() {
        const locale = t();
        setStatus(locale.working);
        try {
            const local = {};
            READING_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value !== null) local[key] = value;
            });
            const backup = {
                format: BACKUP_FORMAT,
                schemaVersion: BACKUP_VERSION,
                createdAt: new Date().toISOString(),
                appVersion: window.WRN_CONFIG?.version || '',
                localStorage: local
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `world-revolution-news-leselisten-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.append(link);
            link.click();
            const objectUrl = link.href;
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
            setStatus(locale.exported, 'success');
        } catch (error) {
            console.error(error);
            setStatus(`${locale.exportFailed} ${error?.message || error}`, 'error');
        }
    }

    function validateBackup(data) {
        if (!data || typeof data !== 'object' || data.format !== BACKUP_FORMAT) return false;
        if (![1, BACKUP_VERSION].includes(Number(data.schemaVersion))) return false;
        return Boolean(data.localStorage && typeof data.localStorage === 'object' && !Array.isArray(data.localStorage));
    }

    async function importBackupFile(file) {
        const locale = t();
        if (!file) return;
        if (file.size > MAX_IMPORT_BYTES) {
            setStatus(locale.importLarge, 'error');
            return;
        }
        setStatus(locale.working);
        try {
            const data = JSON.parse(await file.text());
            if (!validateBackup(data)) throw new Error(locale.importInvalid);
            if (!window.confirm(locale.importConfirm)) {
                setStatus(locale.ready);
                return;
            }
            READING_KEYS.forEach(key => localStorage.removeItem(key));
            Object.entries(data.localStorage).forEach(([key, value]) => {
                if (READING_KEYS.has(key) && typeof value === 'string' && value.length <= 5_000_000) {
                    localStorage.setItem(key, value);
                }
            });
            setStatus(locale.imported, 'success');
            window.setTimeout(() => window.location.reload(), 700);
        } catch (error) {
            console.error(error);
            const message = error?.message === locale.importInvalid ? locale.importInvalid : `${locale.importFailed} ${error?.message || error}`;
            setStatus(message, 'error');
        }
    }

    async function clearBrowserCaches() {
        if (!('caches' in window)) return;
        const names = await window.WRNOriginSafety.getOwnedCacheNames();
        await Promise.all(names.map(name => caches.delete(name)));
    }

    async function clearCategory(category) {
        const locale = t();
        const confirmation = category === 'reading'
            ? locale.clearReadingConfirm
            : category === 'offline' ? locale.clearOfflineConfirm : locale.clearAllConfirm;
        if (!window.confirm(confirmation)) return;
        setStatus(locale.working);
        try {
            if (category === 'reading') {
                READING_KEYS.forEach(key => localStorage.removeItem(key));
                window.dispatchEvent(new CustomEvent('wrnzinechange'));
            } else if (category === 'offline') {
                await window.WRNStorage?.clearDatasets?.();
                await window.WRNStorage?.clearTranslations?.();
                await clearBrowserCaches();
            } else if (category === 'all') {
                [...Array(localStorage.length)].map((_, index) => localStorage.key(index)).filter(Boolean).forEach(key => {
                    if (key.startsWith('wrn_')) localStorage.removeItem(key);
                });
                await window.WRNStorage?.clearAll?.();
                await clearBrowserCaches();
            }
            setStatus(locale.cleared, 'success');
            await refresh();
            if (category === 'all') window.setTimeout(() => window.location.reload(), 600);
        } catch (error) {
            console.error(error);
            setStatus(`${locale.clearFailed} ${error?.message || error}`, 'error');
        }
    }

    function initialize() {
        refreshLanguage();
        document.getElementById('btn-data-export')?.addEventListener('click', exportBackup);
        document.getElementById('btn-data-import')?.addEventListener('click', () => document.getElementById('data-import-file')?.click());
        document.getElementById('data-import-file')?.addEventListener('change', event => {
            const input = event.currentTarget;
            importBackupFile(input?.files?.[0]);
            if (input) input.value = '';
        });
        document.querySelectorAll('[data-clear-category]').forEach(button => {
            button.addEventListener('click', () => clearCategory(button.dataset.clearCategory || ''));
        });
    }

    window.WRNDataControl = { open, close, refresh, refreshLanguage, exportBackup, importBackupFile, clearCategory };
    window.openDataControl = open;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
})();
