/* World Revolution News – 1.7.21 Origin Safety and Workflow Locking
 *
* Ziel dieser Stufe:
* - den fehlenden visuellen Hintergrund wiederherstellen
* - den bisherigen Texttitel im Header vollständig durch das neue Banner ersetzen
* - den schwarzen Hintergrund des gelieferten Headerbilds entfernen und als transparentes Banner verwenden
* - die Startanimation wieder mit dem neuen Banner und dem Hintergrund synchronisieren
* - die Audio-, Quellen- und Zine-Verbesserungen aus 1.7.19 unverändert beibehalten
 */
'use strict';

/*
 * Origin-Sicherheit muss vor data-control.js und app.js aktiv sein.
 * Deshalb wird der Schutz direkt in config.js initialisiert.
 */
(() => {
    if (window.__wrnOriginSafetyBootstrap1721) return;
    window.__wrnOriginSafetyBootstrap1721 = true;

    const isOwnedCacheName = name =>
        String(name || '').startsWith('wrn-');

    const isOwnedStorageKey = key => {
        const value = String(key || '');
        return /^wrn(?:_|-|:)/i.test(value) || /^wrn[A-Z]/.test(value);
    };

    const scopePath = new URL('./', location.href).pathname;

    const isOwnedScope = scope => {
        try {
            return new URL(scope, location.href)
                .pathname
                .startsWith(scopePath);
        } catch {
            return false;
        }
    };

    const clearOwnedStorage = storage => {
        if (!storage) return 0;

        const keys = [];

        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);
            if (isOwnedStorageKey(key)) keys.push(key);
        }

        keys.forEach(key => storage.removeItem(key));
        return keys.length;
    };

    if (
        window.Storage?.prototype
        && !Storage.prototype.__wrnSafeClear1721
    ) {
        Storage.prototype.clear = function scopedClear() {
            return clearOwnedStorage(this);
        };

        Object.defineProperty(
            Storage.prototype,
            '__wrnSafeClear1721',
            { value: true }
        );
    }

    if (window.caches && !window.caches.__wrnSafeCaches1721) {
        const nativeKeys = window.caches.keys.bind(window.caches);
        const nativeDelete = window.caches.delete.bind(window.caches);

        window.caches.keys = async () =>
            (await nativeKeys()).filter(isOwnedCacheName);

        window.caches.delete = name =>
            isOwnedCacheName(name)
                ? nativeDelete(name)
                : Promise.resolve(false);

        Object.defineProperty(
            window.caches,
            '__wrnSafeCaches1721',
            { value: true }
        );
    }

    const workerContainer = navigator.serviceWorker;

    if (
        workerContainer
        && !workerContainer.__wrnSafeRegistrations1721
        && typeof workerContainer.getRegistrations === 'function'
    ) {
        const nativeGetRegistrations =
            workerContainer.getRegistrations.bind(workerContainer);

        workerContainer.getRegistrations = async () =>
            (await nativeGetRegistrations())
                .filter(registration =>
                    isOwnedScope(registration.scope)
                );

        Object.defineProperty(
            workerContainer,
            '__wrnSafeRegistrations1721',
            { value: true }
        );
    }

    window.WRNOriginSafety = Object.freeze({
        version: '1.8.4',
        scopePath,
        isOwnedCacheName,
        isOwnedStorageKey,
        isOwnedScope,
        clearOwnedStorage,
        getOwnedCacheNames: async () =>
            window.caches ? window.caches.keys() : [],
        getOwnedServiceWorkerRegistrations: async () =>
            navigator.serviceWorker
                ? navigator.serviceWorker.getRegistrations()
                : []
    });
})();


/*
 * Frühe, unabhängige Startanimation.
 * Ein harter Watchdog entfernt sie immer, selbst wenn andere Module ausfallen.
 */
(() => {
    if (window.__wrnIntroBootstrap1718) return;
    window.__wrnIntroBootstrap1718 = true;

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = './intro-screen.css?v=184';
    style.dataset.wrnIntroAsset = 'style';
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = './intro-screen.js?v=1718';
    script.dataset.wrnIntroAsset = 'script';
    script.defer = true;

    const target = document.head || document.documentElement;
    target.appendChild(script);
})();


window.WRN_EMERGENCY_MODE = false;

window.WRN_CONFIG = Object.freeze({
    appName: 'World Revolution News',
    version: '2.0.8',
    build: '2026.08.11-wrn-2.0.8-release',
    releasedAt: '2026-08-11T12:00:00+02:00',
    repository: 'Blackfront161/Revolution-News-Data',
    emergencyMode: false,
    recoveryStage: 15,
    dataUrls: Object.freeze({
        news: './news-feed.json',
        newsArchive: './news.json',
        events: './events-feed.json',
        podcasts: './podcasts.json',
        radio: './radio-stations.json',
        sourceHealth: 'https://blackfront161.github.io/Revolution-News-Data/source-health.json',
        sourceHealthReport: './source-health-report.json',
        sourceCatalog: 'https://blackfront161.github.io/Revolution-News-Data/sources-registry.json',
        podcastHealth: 'https://blackfront161.github.io/Revolution-News-Data/podcast-health.json',
        radioHealth: 'https://blackfront161.github.io/Revolution-News-Data/radio-health.json',
        podcastSources: 'https://blackfront161.github.io/Revolution-News-Data/podcast-sources.json',
        radioSources: 'https://blackfront161.github.io/Revolution-News-Data/radio-sources.json',
        audioHealth: 'https://blackfront161.github.io/Revolution-News-Data/audio-health.json',
        featureAudit: 'https://blackfront161.github.io/Revolution-News-Data/feature-audit.json',
        languageSourceAudit: 'https://blackfront161.github.io/Revolution-News-Data/language-source-audit.json',
        editorialReview: './editorial-review.json',
        alternativeSocialMedia: './alternative-social-media.json',
        prisonerSolidarity: './prisoner-solidarity.json',
        generatedPodcasts: 'https://blackfront161.github.io/Revolution-News-Data/generated-podcasts.json'
    }),
    proxyUrl: 'https://revolution-proxy.paghklo.workers.dev',
    sharedTranslationUrl: 'https://wrn-translation-cache.paghklo.workers.dev'
});

/*
 * Nur Geräte mit begrenztem Bildschirm oder wenig Arbeitsspeicher erhalten
 * einen verkleinerten Feed. Auf Desktop wird news-feed.json vollständig genutzt.
 * Mit ?full=1 kann die Begrenzung auch auf Mobilgeräten testweise aufgehoben werden.
 */
(() => {
    if (window.__wrnRecoveryFeedGuard1721) return;
    window.__wrnRecoveryFeedGuard1721 = true;

    const wantsFullFeed = () =>
        new URLSearchParams(location.search).get('full') === '1';

    const isConstrainedDevice = () => {
        const narrow = window.matchMedia('(max-width: 820px)').matches;
        const memory = Number(navigator.deviceMemory || 0);
        return narrow || (memory > 0 && memory <= 4);
    };

    const nativeFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
        const response = await nativeFetch(...args);

        if (
            wantsFullFeed()
            || !isConstrainedDevice()
            || !response.ok
        ) {
            return response;
        }

        const url = String(
            typeof args[0] === 'string'
                ? args[0]
                : args[0]?.url || ''
        );

        const limit = /news-feed\.json/i.test(url)
            ? 180
            : (/events-feed\.json/i.test(url) ? 220 : 0);

        if (!limit) return response;

        try {
            const rows = await response.clone().json();

            if (!Array.isArray(rows) || rows.length <= limit) {
                return response;
            }

            const headers = new Headers(response.headers);
            headers.set(
                'content-type',
                'application/json; charset=utf-8'
            );
            headers.delete('content-length');

            return new Response(
                JSON.stringify(rows.slice(0, limit)),
                {
                    status: response.status,
                    statusText: response.statusText,
                    headers
                }
            );
        } catch {
            return response;
        }
    };
})();

/*
 * Reine CSS-Leistungsbremse für Smartphones.
 * Keine DOM-Gesamtsuche bei Klicks und keine Entfernung von App-Funktionen.
 */
(() => {
    if (document.getElementById('wrn-recovery-stage-10-style')) return;

    const style = document.createElement('style');
    style.id = 'wrn-recovery-stage-10-style';
    style.textContent = `
        html,
        body {
            pointer-events: auto !important;
        }

        button,
        a,
        input,
        select,
        textarea,
        summary,
        label,
        [role="button"] {
            pointer-events: auto;
        }

        #wrn-start-screen,
        .wrn-start-screen,
        .wrn-start-leaving,
        .app-start-screen,
        .wrn-article-detail[hidden],
        .wrn-more-panel[hidden],
        .wrn-search-panel[hidden],
        .wrn-subtabs-wrap[hidden],
        [hidden] {
            pointer-events: none !important;
        }

        @media (max-width: 820px) {
            html,
            body {
                background-color: #050508 !important;
                background-image: none !important;
                background-attachment: scroll !important;
                scroll-behavior: auto !important;
            }

            html,
            body,
            body *:not(.wrn-intro-screen-1718):not(.wrn-intro-screen-1718 *) {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
            }

            body::before,
            body::after,
            #wrn-start-screen,
            .wrn-start-screen,
            .wrn-start-leaving,
            .app-start-screen {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }

            body,
            .card,
            .feedback-modal,
            .podcast-options-modal,
            .podcast-library-modal,
            .system-status-modal,
            .global-media-bar {
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                filter: none !important;
                box-shadow: none !important;
                text-shadow: none !important;
            }

            .card {
                background: #101017 !important;
                border: 1px solid #30303a !important;
                content-visibility: auto;
                contain-intrinsic-size: 240px;
            }

            #feed-container video,
            #archive-container video,
            .article-video {
                display: none !important;
            }
        }
    `;

    document.head.appendChild(style);
})();

/* Startbildschirm und alte Blockadeklassen nur einmal entfernen. */
(() => {
    if (window.__wrnRecoveryInteractionRelease1721) return;
    window.__wrnRecoveryInteractionRelease1721 = true;

    const release = () => {
        document.documentElement.classList.remove(
            'wrn-booting',
            'wrn-app-entering'
        );

        document.documentElement.style.pointerEvents = 'auto';

        if (document.body) {
            document.body.style.pointerEvents = 'auto';
        }

        document.getElementById('wrn-start-screen')?.remove();
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            release,
            { once: true }
        );
    } else {
        release();
    }

    window.addEventListener('pageshow', release, { once: true });
    window.setTimeout(release, 700);
    window.setTimeout(release, 2400);

    window.WRNReleaseInteraction = release;
})();

/*
 * Nur auf leistungsschwächeren Geräten dürfen Offline-Zugriffe den Start nicht
 * blockieren. Der bestehende Inhalt wird nicht gelöscht.
 */
(() => {
    if (window.__wrnRecoveryStorageGuard1721) return;
    window.__wrnRecoveryStorageGuard1721 = true;

    const shouldGuardStorage = () => {
        const narrow = window.matchMedia('(max-width: 820px)').matches;
        const memory = Number(navigator.deviceMemory || 0);
        return narrow || (memory > 0 && memory <= 4);
    };

    if (!shouldGuardStorage()) return;

    const timeout = (promise, milliseconds, fallback) =>
        new Promise(resolve => {
            let finished = false;

            const timer = window.setTimeout(() => {
                if (finished) return;
                finished = true;
                resolve(fallback);
            }, milliseconds);

            Promise.resolve(promise).then(value => {
                if (finished) return;
                finished = true;
                window.clearTimeout(timer);
                resolve(value);
            }).catch(() => {
                if (finished) return;
                finished = true;
                window.clearTimeout(timer);
                resolve(fallback);
            });
        });

    document.addEventListener('DOMContentLoaded', () => {
        const storage = window.WRNStorage;

        if (!storage || storage.__recoveryStage10Guard) return;

        const original = {
            migrateLegacyLocalStorage:
                storage.migrateLegacyLocalStorage?.bind(storage),
            requestPersistentStorage:
                storage.requestPersistentStorage?.bind(storage),
            getDataset:
                storage.getDataset?.bind(storage),
            putDataset:
                storage.putDataset?.bind(storage)
        };

        storage.__recoveryStage10Guard = true;

        storage.migrateLegacyLocalStorage = () =>
            original.migrateLegacyLocalStorage
                ? timeout(
                    original.migrateLegacyLocalStorage(),
                    1100,
                    false
                )
                : Promise.resolve(false);

        storage.requestPersistentStorage = () =>
            original.requestPersistentStorage
                ? timeout(
                    original.requestPersistentStorage(),
                    800,
                    false
                )
                : Promise.resolve(false);

        storage.getDataset = key =>
            original.getDataset
                ? timeout(
                    original.getDataset(key),
                    1200,
                    null
                )
                : Promise.resolve(null);

        storage.putDataset = (key, data) => {
            if (original.putDataset) {
                window.setTimeout(() => {
                    void timeout(
                        original.putDataset(key, data),
                        1800,
                        false
                    );
                }, 0);
            }

            return Promise.resolve(false);
        };
    }, { once: true });
})();

/*
 * Wiederherstellungsstufe 10:
 * - Sicherheitsmodul
 * - Sprache und Typografie
 * - horizontale Hauptnavigation
 * - kompakter futuristischer Header
 * - gemeinsamer Übersetzungs-Cache
 * - bereinigtes Quellenprüfungszentrum mit Feed-Erkennung
 * - echtes Briefing als Lazy-Load
 * - fairer Hinweis vor externen Originalquellen
 * - responsive Dreierspalten für Artikelaktionen
 * - feststehende Dialog-Kopfzeilen
 * - vorhandenes Systemstatuszentrum
 *
 * Geschichten, Zeitleisten und Briefing 2 werden ab 1.8.0 geladen.
 * Das Aktionsradar, lokale Erinnerungen und redaktionelle Prüfwerkzeuge
 * werden ab Version 2.0 datensparsam ergänzt.
 */
(() => {
    if (window.__wrnRecoveryCoreLoader180) return;
    window.__wrnRecoveryCoreLoader180 = true;

    const VERSION = '200-action-radar-1';

    const addStyle = (file, marker) => {
        if (
            document.querySelector(
                `link[data-wrn-style="${marker}"]`
            )
        ) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `./${file}?v=${VERSION}`;
        link.dataset.wrnStyle = marker;
        link.addEventListener('error', () => {
            console.warn(`WRN stylesheet missing: ${file}`);
        }, { once: true });

        document.head.appendChild(link);
    };

    const loadScript = (
        file,
        marker,
        timeoutMilliseconds = 9000
    ) => new Promise(resolve => {
        const existing = document.querySelector(
            `script[data-wrn-module="${marker}"]`
        );

        if (existing?.dataset.loaded === 'true') {
            resolve(true);
            return;
        }

        const script = existing || document.createElement('script');

        if (!existing) {
            script.src = `./${file}?v=${VERSION}`;
            script.dataset.wrnModule = marker;
        }

        let finished = false;

        const finish = success => {
            if (finished) return;
            finished = true;
            script.dataset.loaded = success ? 'true' : 'false';
            resolve(success);
        };

        const timer = window.setTimeout(
            () => finish(false),
            timeoutMilliseconds
        );

        script.addEventListener('load', () => {
            window.clearTimeout(timer);
            finish(true);
        }, { once: true });

        script.addEventListener('error', () => {
            window.clearTimeout(timer);
            finish(false);
        }, { once: true });

        if (!existing) {
            document.body.appendChild(script);
        }
    });

    const loadSequentially = async files => {
        for (const [file, marker] of files) {
            await loadScript(file, marker);
        }
    };

    const openLandingTab = () => {
        const briefingButton = document.querySelector(
            '.wrn-top-tab[data-key="briefing"]'
        );

        if (briefingButton instanceof HTMLElement) {
            briefingButton.click();
            return;
        }

        if (typeof window.WRNActivateTab === 'function') {
            window.WRNActivateTab('briefing');
            return;
        }

        if (typeof window.ladeKontinentNews === 'function') {
            window.ladeKontinentNews('Global');
        }
    };

    const loadCore = async () => {
        [
            ['release-1.5-nav.css', 'navigation-recovery-10'],
            ['typography.css', 'typography-recovery-10'],
            ['interface-qol.css', 'interface-recovery-10'],
            ['shared-translation-status.css', 'translation-status-recovery-10'],
            ['app-background.css', 'background-recovery-10'],
            ['wrn-header.css', 'future-header-recovery-10'],
            ['source-verification.css', 'source-verification-recovery-10'],
            ['briefing-loader.css', 'briefing-loader-recovery-10'],
            ['article-actions.css', 'article-actions-recovery-10'],
            ['sticky-dialogs.css', 'sticky-dialogs-recovery-10'],
            ['audio-tab.css', 'audio-tab-recovery-10'],
            ['audio-tab-183.css', 'audio-tab-recovery-183'],
            ['interface-block3.css', 'interface-block3-recovery-183'],
            ['source-recovery-ui-183.css', 'source-recovery-ui-183'],
            ['audio-reliability.css', 'audio-reliability-recovery-10'],
            ['runtime-selftest.css', 'runtime-selftest-recovery-10'],
            ['recovery-audit.css', 'recovery-audit-recovery-10'],
            ['language-source-status.css', 'language-source-status-recovery-10'],
            ['briefing-2.css', 'briefing2-recovery-13'],
            ['stories-timeline.css', 'stories-recovery-13'],
            ['video-hub.css', 'video-hub-recovery-14'],
            ['lexicon-tab.css', 'lexicon-tab-recovery-184'],
            ['prisoner-solidarity.css', 'prisoner-solidarity-recovery-190'],
            ['action-radar.css', 'action-radar-recovery-200'],
            ['editorial-review-ui.css', 'editorial-review-recovery-200'],
            ['source-health-freshness.css', 'source-health-freshness-recovery-200'],
            ['about-tab.css', 'about-tab-recovery-184'],
            ['article-summary.css', 'article-summary-recovery-184'],
            ['zine-designer.css', 'zine-designer-recovery-10'],
            ['light-theme.css', 'light-theme-recovery-184']
        ].forEach(([file, marker]) => addStyle(file, marker));

        await loadSequentially([
            ['wrn-origin-safety.js', 'origin-safety-recovery-10'],
            ['app-safety.js', 'safety-recovery-10'],
            ['wrn-i18n.js', 'i18n-recovery-10'],
            ['source-filters.js', 'source-filters-recovery-15'],
            ['audio-region-core.js', 'audio-region-recovery-14'],
            ['stories-core.js', 'stories-core-recovery-13'],
            ['briefing-2.js', 'briefing2-recovery-13'],
            ['stories-timeline.js', 'stories-recovery-13'],
            ['video-hub.js', 'video-hub-recovery-14'],
            ['lexicon-tab.js', 'lexicon-tab-recovery-184'],
            ['prisoner-solidarity.js', 'prisoner-solidarity-recovery-190'],
            ['about-tab.js', 'about-tab-recovery-184'],
            ['article-summary-core.js', 'article-summary-core-recovery-184'],
            ['article-summary.js', 'article-summary-recovery-184'],
            ['typography.js', 'typography-recovery-10'],
            ['wrn-header.js', 'future-header-recovery-10'],
            ['release-1.5-nav.js', 'navigation-recovery-10'],
            ['source-verification.js', 'source-verification-recovery-10'],
            ['source-health-freshness.js', 'source-health-freshness-recovery-200'],
            ['action-radar.js', 'action-radar-recovery-200'],
            ['editorial-review-ui.js', 'editorial-review-recovery-200'],
            ['briefing-loader.js', 'briefing-loader-recovery-10'],
            ['article-actions.js', 'article-actions-recovery-10'],
            ['sticky-dialogs.js', 'sticky-dialogs-recovery-10'],
            ['audio-tab.js', 'audio-tab-recovery-10'],
            ['audio-tab-183.js', 'audio-tab-recovery-183'],
            ['interface-block3.js', 'interface-block3-recovery-183'],
            ['source-recovery-ui-183.js', 'source-recovery-ui-183'],
            ['audio-reliability.js', 'audio-reliability-recovery-10'],
            ['runtime-selftest.js', 'runtime-selftest-recovery-10'],
            ['recovery-audit.js', 'recovery-audit-recovery-10'],
            ['language-source-status.js', 'language-source-status-recovery-10'],
            ['zine-designer.js', 'zine-designer-recovery-10'],
            ['shared-translation-client.js', 'translation-client-recovery-10'],
            ['translation-dialog-l10n.js', 'translation-dialog-recovery-10']
        ]);

        /*
         * Briefing ist wieder die erste Ansicht. Der vorhandene Lazy-Loader
         * zeigt während des Ladens einen Status statt einer leeren Seite.
         */
        openLandingTab();
        window.setTimeout(openLandingTab, 700);

        /*
         * Nur ein leichter Gesundheitscheck wird verzögert gestartet.
         * Schwere Diagnosebeobachter bleiben deaktiviert.
         */
        window.setTimeout(() => {
            void loadScript(
                'shared-translation-status.js',
                'translation-status-recovery-10',
                9000
            );
        }, 1400);

        window.dispatchEvent(
            new CustomEvent('wrn-app-ready')
        );
    };

    if (document.readyState === 'complete') {
        void loadCore();
    } else {
        window.addEventListener(
            'load',
            () => void loadCore(),
            { once: true }
        );
    }
})();

/*
 * Rettungsfeed nur, falls die normale Haupt-App nach mehreren Sekunden weiterhin
 * keine Karte erzeugt hat.
 */
(() => {
    if (window.__wrnRecoveryRescueFeed1721) return;
    window.__wrnRecoveryRescueFeed1721 = true;

    const run = async () => {
        await new Promise(resolve => {
            window.setTimeout(resolve, 9000);
        });

        const status = document.getElementById('status-container');
        const feed = document.getElementById('feed-container');

        const stillLoading =
            /Lade Nachrichten|Loading news|Connecting/i.test(
                String(status?.textContent || '')
            );

        if (
            !feed
            || !stillLoading
            || feed.children.length > 0
        ) {
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(
            () => controller.abort(),
            7000
        );

        try {
            const response = await fetch(
                `./news-feed.json?rescue=${Date.now()}`,
                {
                    cache: 'no-store',
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rows = await response.json();

            if (!Array.isArray(rows) || rows.length === 0) {
                throw new Error('Leerer Feed');
            }

            feed.textContent = '';

            rows.slice(0, 30).forEach(item => {
                const card = document.createElement('article');
                card.className = 'card wrn-rescue-card';

                const meta = document.createElement('div');
                meta.className = 'meta';
                meta.textContent = [
                    item.quelleName || 'World Revolution News',
                    item.pubDate
                        ? String(item.pubDate).slice(0, 10)
                        : ''
                ].filter(Boolean).join(' · ');

                const title = document.createElement('div');
                title.className = 'title';
                title.textContent = String(
                    item.title || 'Nachricht'
                );

                const teaser = document.createElement('div');
                teaser.className = 'teaser';
                teaser.textContent = String(
                    item.content || ''
                ).slice(0, 420);

                card.append(meta, title, teaser);

                if (item.link) {
                    const link = document.createElement('a');
                    link.className = 'btn-translate';
                    link.href = String(item.link);
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = '[ Original öffnen ]';
                    card.appendChild(link);
                }

                feed.appendChild(card);
            });

            if (status) {
                status.style.color = 'var(--color-green)';
                status.textContent = 'Nachrichten geladen';
            }
        } catch (error) {
            if (status) {
                status.style.color = '#ff334f';
                status.textContent =
                    'Nachrichten konnten nicht geladen werden.';
            }

            console.error('WRN Rettungsfeed:', error);
        } finally {
            window.clearTimeout(timer);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            () => void run(),
            { once: true }
        );
    } else {
        void run();
    }
})();
