/* World Revolution News – Statuszentrum */
'use strict';

(() => {
    const config = window.WRN_CONFIG || {};
    const runtime = {
        datasets: Object.create(null),
        lastRefresh: '',
        refreshing: false
    };

    const texts = {
        de: {
            title: 'Systemstatus',
            refresh: 'Neu prüfen',
            close: 'Schließen',
            version: 'App-Version',
            connection: 'Verbindung',
            online: 'Online',
            offline: 'Offline',
            loading: 'Wird geprüft …',
            available: 'Verfügbar',
            unavailable: 'Nicht verfügbar',
            notConfigured: 'Noch nicht eingerichtet',
            items: 'Einträge',
            sources: 'Quellen',
            errors: 'Fehler',
            warnings: 'Warnungen',
            news: 'Nachrichten',
            events: 'Events',
            podcasts: 'Original-Podcasts',
            generated: 'Erzeugte Podcasts',
            radio: 'Live-Radio',
            sourceHealth: 'Nachrichtenquellen',
            podcastHealth: 'Podcastquellen',
            worker: 'Azure / R2 / Worker',
            naturalVoices: 'Natürliche Stimmen',
            deviceOnly: 'Nur Gerätestimmen verfügbar',
            updated: 'Zuletzt geprüft',
            loadedFrom: 'Geladen aus',
            network: 'Netzwerk',
            offlineStorage: 'Offline-Speicher',
            legacyStorage: 'alter lokaler Speicher',
            noData: 'Keine Daten',
            noEvents: 'Aktuell keine Termine',
            statusHint: 'Dieser Bereich zeigt technische Erreichbarkeit und vorhandene Datensätze. Er garantiert nicht, dass weltweit alle möglichen Quellen oder Termine erfasst sind.'
        },
        en: {
            title: 'System status',
            refresh: 'Check again',
            close: 'Close',
            version: 'App version',
            connection: 'Connection',
            online: 'Online',
            offline: 'Offline',
            loading: 'Checking …',
            available: 'Available',
            unavailable: 'Unavailable',
            notConfigured: 'Not configured yet',
            items: 'items',
            sources: 'sources',
            errors: 'errors',
            warnings: 'warnings',
            news: 'News',
            events: 'Events',
            podcasts: 'Original podcasts',
            generated: 'Generated podcasts',
            radio: 'Live radio',
            sourceHealth: 'News sources',
            podcastHealth: 'Podcast sources',
            worker: 'Azure / R2 / Worker',
            naturalVoices: 'Natural voices',
            deviceOnly: 'Device voices only',
            updated: 'Last checked',
            loadedFrom: 'Loaded from',
            network: 'network',
            offlineStorage: 'offline storage',
            legacyStorage: 'legacy local storage',
            noData: 'No data',
            noEvents: 'No current events',
            statusHint: 'This panel shows technical availability and loaded datasets. It does not guarantee that every possible source or event worldwide has been captured.'
        }
    };

    function language() {
        return document.documentElement.lang === 'de' ? 'de' : 'en';
    }

    function t() {
        return texts[language()] || texts.en;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function formatDate(value) {
        if (!value) return '—';
        const date = new Date(value);
        if (!Number.isFinite(date.getTime())) return '—';
        try {
            return new Intl.DateTimeFormat(language() === 'de' ? 'de-DE' : 'en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(date);
        } catch {
            return date.toLocaleString();
        }
    }

    function statusClass(kind) {
        return ['ok', 'warning', 'error', 'checking'].includes(kind) ? kind : 'checking';
    }

    function renderRow(id, label, state = {}) {
        const row = byId(id);
        if (!row) return;
        const badge = row.querySelector('.system-status-badge');
        const title = row.querySelector('.system-status-name');
        const details = row.querySelector('.system-status-details');
        if (title) title.textContent = label;
        if (badge) {
            badge.className = `system-status-badge ${statusClass(state.kind)}`;
            badge.textContent = state.badge || t().loading;
        }
        if (details) details.textContent = state.details || '';
    }

    function sourceLabel(source) {
        if (source === 'network') return t().network;
        if (source === 'indexeddb') return t().offlineStorage;
        if (source === 'legacy') return t().legacyStorage;
        return t().noData;
    }

    function noteDataset(key, result = {}) {
        runtime.datasets[key] = {
            count: Array.isArray(result.data) ? result.data.length : Number(result.count) || 0,
            source: result.source || 'none',
            updatedAt: result.updatedAt || '',
            error: result.error ? String(result.error.message || result.error) : ''
        };
        if (isOpen()) renderRuntimeDatasets();
    }

    function renderRuntimeDatasets() {
        const mapping = {
            news: ['system-status-news', t().news],
            events: ['system-status-events', t().events]
        };
        Object.entries(mapping).forEach(([key, [id, label]]) => {
            const item = runtime.datasets[key];
            if (!item) return;
            const kind = item.count > 0 ? (item.source === 'network' ? 'ok' : 'warning') : (key === 'events' ? 'warning' : 'error');
            const badge = item.count > 0 ? `${item.count} ${t().items}` : (key === 'events' ? t().noEvents : t().noData);
            const parts = [`${t().loadedFrom}: ${sourceLabel(item.source)}`];
            if (item.updatedAt) parts.push(formatDate(item.updatedAt));
            if (item.error) parts.push(item.error);
            renderRow(id, label, { kind, badge, details: parts.join(' · ') });
        });
    }

    function healthSummary(data) {
        const entries = Array.isArray(data)
            ? data
            : (data && typeof data === 'object' ? Object.values(data) : []);
        const normalized = entries.filter(item => item && typeof item === 'object');
        let ok = 0;
        let warnings = 0;
        let errors = 0;
        normalized.forEach(item => {
            const value = String(item.status || item.state || item.result || '').toLowerCase();
            const httpStatus = Number(item.httpStatus || 0);
            if (item.ok === true || value === 'ok' || value === 'success') {
                ok += 1;
            } else if (value.includes('warning') || (httpStatus >= 200 && httpStatus < 400)) {
                warnings += 1;
            } else {
                errors += 1;
            }
        });
        return { total: normalized.length, ok, warnings, errors };
    }

    async function fetchJson(url) {
        const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}status=${Date.now()}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}`);
            error.status = response.status;
            throw error;
        }
        const data = await response.json();
        return {
            data,
            updatedAt: response.headers.get('last-modified') || response.headers.get('date') || ''
        };
    }

    async function refreshDatasetRow(id, label, url) {
        renderRow(id, label, { kind: 'checking', badge: t().loading });
        try {
            const result = await fetchJson(url);
            const count = Array.isArray(result.data)
                ? result.data.length
                : (result.data && typeof result.data === 'object' ? Object.keys(result.data).length : 0);
            renderRow(id, label, {
                kind: count > 0 ? 'ok' : 'warning',
                badge: count > 0 ? `${count} ${t().items}` : (id === 'system-status-events' ? t().noEvents : t().noData),
                details: result.updatedAt ? `${t().updated}: ${formatDate(result.updatedAt)}` : ''
            });
            return { count, data: result.data, updatedAt: result.updatedAt };
        } catch (error) {
            renderRow(id, label, {
                kind: error.status === 404 ? 'warning' : 'error',
                badge: error.status === 404 ? t().notConfigured : t().unavailable,
                details: String(error.message || error)
            });
            return null;
        }
    }

    async function refreshHealthRow(id, label, url) {
        renderRow(id, label, { kind: 'checking', badge: t().loading });
        try {
            const result = await fetchJson(url);
            const summary = healthSummary(result.data);
            const details = [];
            if (summary.total) details.push(`${summary.total} ${t().sources}`);
            if (summary.warnings) details.push(`${summary.warnings} ${t().warnings || 'warnings'}`);
            if (summary.errors) details.push(`${summary.errors} ${t().errors}`);
            if (result.updatedAt) details.push(formatDate(result.updatedAt));
            renderRow(id, label, {
                kind: (summary.errors > 0 || summary.warnings > 0) ? 'warning' : (summary.total > 0 ? 'ok' : 'warning'),
                badge: summary.total > 0 ? `${summary.ok}/${summary.total}` : t().notConfigured,
                details: details.join(' · ')
            });
        } catch (error) {
            renderRow(id, label, {
                kind: error.status === 404 ? 'warning' : 'error',
                badge: error.status === 404 ? t().notConfigured : t().unavailable,
                details: String(error.message || error)
            });
        }
    }

    async function refreshGeneratedRow() {
        renderRow('system-status-generated', t().generated, { kind: 'checking', badge: t().loading });
        try {
            const response = await fetch(`${config.proxyUrl}/?action=podcasts.list&limit=100&status=${Date.now()}`, { cache: 'no-store' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.error || !Array.isArray(data.items)) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            renderRow('system-status-generated', t().generated, {
                kind: 'ok',
                badge: `${data.items.length} ${t().items}`,
                details: response.headers.get('date') ? `${t().updated}: ${formatDate(response.headers.get('date'))}` : ''
            });
        } catch (error) {
            renderRow('system-status-generated', t().generated, {
                kind: 'error',
                badge: t().unavailable,
                details: String(error.message || error)
            });
        }
    }

    async function refreshWorkerRow() {
        renderRow('system-status-worker', t().worker, { kind: 'checking', badge: t().loading });
        try {
            const response = await fetch(`${config.proxyUrl}/?action=podcast.status&status=${Date.now()}`, { cache: 'no-store' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.error) throw new Error(data.message || `HTTP ${response.status}`);
            const natural = data.naturalVoicesAvailable !== false;
            const details = [];
            if (data.podcastStorage === true || data.storageAvailable === true) details.push('R2: OK');
            if (data.azureSpeech === true || natural) details.push(`Azure: ${natural ? 'OK' : t().deviceOnly}`);
            if (data.reason && !natural) details.push(String(data.reason));
            renderRow('system-status-worker', t().worker, {
                kind: natural ? 'ok' : 'warning',
                badge: natural ? t().available : t().deviceOnly,
                details: details.join(' · ')
            });
        } catch (error) {
            renderRow('system-status-worker', t().worker, {
                kind: 'error',
                badge: t().unavailable,
                details: String(error.message || error)
            });
        }
    }

    function renderStaticText() {
        const labels = t();
        const title = byId('system-status-title');
        const hint = byId('system-status-hint');
        const refreshButton = byId('btn-system-status-refresh');
        const closeButton = byId('btn-system-status-close');
        const versionLabel = byId('system-status-version-label');
        const version = byId('system-status-version');
        if (title) title.textContent = labels.title;
        if (hint) hint.textContent = labels.statusHint;
        if (refreshButton) refreshButton.textContent = labels.refresh;
        if (closeButton) closeButton.textContent = labels.close;
        if (versionLabel) versionLabel.textContent = labels.version;
        if (version) version.textContent = config.version || '—';
        const versionInline = byId('app-version-inline');
        if (versionInline) versionInline.textContent = `v${config.version || '—'}`;
    }

    function renderConnection() {
        renderRow('system-status-connection', t().connection, {
            kind: navigator.onLine ? 'ok' : 'warning',
            badge: navigator.onLine ? t().online : t().offline,
            details: navigator.onLine ? '' : t().offlineStorage
        });
    }

    async function refresh() {
        if (runtime.refreshing) return;
        runtime.refreshing = true;
        renderStaticText();
        renderConnection();
        renderRuntimeDatasets();
        const button = byId('btn-system-status-refresh');
        if (button) button.disabled = true;

        const urls = config.dataUrls || {};
        await Promise.allSettled([
            runtime.datasets.news ? Promise.resolve() : refreshDatasetRow('system-status-news', t().news, urls.news),
            runtime.datasets.events ? Promise.resolve() : refreshDatasetRow('system-status-events', t().events, urls.events),
            refreshDatasetRow('system-status-podcasts', t().podcasts, urls.podcasts),
            refreshDatasetRow('system-status-radio', t().radio, urls.radio),
            refreshGeneratedRow(),
            refreshHealthRow('system-status-source-health', t().sourceHealth, urls.sourceHealth),
            refreshHealthRow('system-status-podcast-health', t().podcastHealth, urls.podcastHealth),
            refreshWorkerRow()
        ]);

        runtime.lastRefresh = new Date().toISOString();
        const checked = byId('system-status-last-check');
        if (checked) checked.textContent = `${t().updated}: ${formatDate(runtime.lastRefresh)}`;
        runtime.refreshing = false;
        if (button) button.disabled = false;
    }

    function isOpen() {
        const modal = byId('system-status-modal');
        return Boolean(modal && modal.style.display !== 'none' && modal.style.display !== '');
    }

    function open() {
        if (typeof window.closeAllModals === 'function') window.closeAllModals();
        const overlay = byId('fb-overlay');
        const modal = byId('system-status-modal');
        if (overlay) overlay.style.display = 'block';
        if (modal) modal.style.display = 'block';
        refresh();
    }

    function close() {
        const overlay = byId('fb-overlay');
        const modal = byId('system-status-modal');
        if (overlay) overlay.style.display = 'none';
        if (modal) modal.style.display = 'none';
    }

    function init() {
        renderStaticText();
        renderConnection();
        window.addEventListener('online', renderConnection);
        window.addEventListener('offline', renderConnection);
    }

    window.WRNStatusCenter = Object.freeze({ init, open, close, refresh, noteDataset });
    window.openSystemStatus = open;
    window.closeSystemStatus = close;
    window.refreshSystemStatus = refresh;
})();
