/* World Revolution News 1.8.0 – sicheres Briefing-Lazy-Loading */
'use strict';

(() => {
    if (window.__wrnBriefingLoader180) return;
    window.__wrnBriefingLoader180 = true;

    let loadingPromise = null;
    let replayingClick = false;

    const text = () => {
        const de = String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || ''
        ).toLowerCase().startsWith('de');

        return de
            ? {
                loading: 'Persönliches Briefing wird geladen …',
                failed: 'Das Briefing konnte nicht geladen werden.',
                retry: 'Erneut versuchen',
                back: 'Zurück zu Start'
            }
            : {
                loading: 'Loading personal briefing …',
                failed: 'The briefing could not be loaded.',
                retry: 'Try again',
                back: 'Back to Start'
            };
    };

    const addStyle = () => {
        if (document.querySelector(
            'link[data-wrn-briefing-style="180"]'
        )) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './briefing.css?v=180';
        link.dataset.wrnBriefingStyle = '180';
        document.head.appendChild(link);
    };

    const loadScript = () => {
        if (window.WRNBriefing) return Promise.resolve(true);
        if (loadingPromise) return loadingPromise;

        loadingPromise = new Promise(resolve => {
            const existing = document.querySelector(
                'script[data-wrn-briefing-module="180"]'
            );

            if (existing?.dataset.loaded === 'true') {
                resolve(Boolean(window.WRNBriefing));
                return;
            }

            const script = existing || document.createElement('script');

            if (!existing) {
                script.src = './briefing.js?v=180';
                script.dataset.wrnBriefingModule = '180';
            }

            let finished = false;

            const finish = success => {
                if (finished) return;
                finished = true;
                script.dataset.loaded = success ? 'true' : 'false';
                resolve(success && Boolean(window.WRNBriefing));
            };

            const timer = window.setTimeout(
                () => finish(false),
                15000
            );

            script.addEventListener('load', () => {
                window.clearTimeout(timer);
                finish(true);
            }, { once: true });

            script.addEventListener('error', () => {
                window.clearTimeout(timer);
                finish(false);
            }, { once: true });

            if (!existing) document.body.appendChild(script);
        }).finally(() => {
            if (!window.WRNBriefing) loadingPromise = null;
        });

        return loadingPromise;
    };

    const mainContainers = () => [
        document.getElementById('feed-container'),
        document.getElementById('archive-container'),
        document.getElementById('txt-archive-title'),
        document.getElementById('event-filter-panel')
    ].filter(Boolean);

    const hideNewsContent = () => {
        mainContainers().forEach(node => {
            if (!node.dataset.wrnBriefingPreviousDisplay) {
                node.dataset.wrnBriefingPreviousDisplay =
                    node.style.display || '__default__';
            }
            node.style.display = 'none';
        });
    };

    const restoreNewsContent = () => {
        mainContainers().forEach(node => {
            const previous =
                node.dataset.wrnBriefingPreviousDisplay;

            if (previous === '__default__') {
                node.style.removeProperty('display');
            } else if (previous) {
                node.style.display = previous;
            }

            delete node.dataset.wrnBriefingPreviousDisplay;
        });
    };

    const ensureLoadingPanel = () => {
        let panel = document.getElementById(
            'wrn-briefing-loading-panel'
        );

        if (panel) return panel;

        panel = document.createElement('section');
        panel.id = 'wrn-briefing-loading-panel';
        panel.className = 'wrn-briefing-loading-panel';
        panel.hidden = true;

        const status = document.createElement('p');
        status.id = 'wrn-briefing-loading-status';
        status.setAttribute('aria-live', 'polite');

        const actions = document.createElement('div');
        actions.className = 'wrn-briefing-loading-actions';

        const retry = document.createElement('button');
        retry.type = 'button';
        retry.dataset.action = 'retry';

        const back = document.createElement('button');
        back.type = 'button';
        back.dataset.action = 'back';

        actions.append(retry, back);
        panel.append(status, actions);

        const feed = document.getElementById('feed-container');

        if (feed?.parentElement) {
            feed.parentElement.insertBefore(panel, feed);
        } else {
            document.body.appendChild(panel);
        }

        panel.addEventListener('click', event => {
            const button = event.target.closest('button');
            if (!button) return;

            if (button.dataset.action === 'retry') {
                void activateBriefing(true);
            }

            if (button.dataset.action === 'back') {
                panel.hidden = true;
                restoreNewsContent();

                const start = document.querySelector(
                    '.wrn-top-tab[data-key="start"]'
                );

                if (start instanceof HTMLElement) start.click();
            }
        });

        return panel;
    };

    const setPanel = (message, failed = false) => {
        const labels = text();
        const panel = ensureLoadingPanel();
        const status = panel.querySelector(
            '#wrn-briefing-loading-status'
        );
        const retry = panel.querySelector(
            '[data-action="retry"]'
        );
        const back = panel.querySelector(
            '[data-action="back"]'
        );

        panel.hidden = false;
        panel.dataset.state = failed ? 'error' : 'loading';
        status.textContent = message;
        retry.textContent = labels.retry;
        back.textContent = labels.back;
        retry.hidden = !failed;
    };

    const hidePanel = () => {
        const panel = document.getElementById(
            'wrn-briefing-loading-panel'
        );

        if (panel) panel.hidden = true;
    };

    async function activateBriefing(forceRetry = false) {
        const labels = text();

        if (forceRetry) loadingPromise = null;

        hideNewsContent();
        setPanel(labels.loading, false);
        addStyle();

        const loaded = await loadScript();

        if (!loaded || !window.WRNBriefing?.show) {
            setPanel(labels.failed, true);
            return false;
        }

        hidePanel();

        try {
            window.WRNBriefing.show();
            return true;
        } catch (error) {
            console.error('WRN Briefing start failed:', error);
            setPanel(labels.failed, true);
            return false;
        }
    }

    document.addEventListener('click', event => {
        const tab = event.target.closest?.(
            '.wrn-top-tab[data-key="briefing"]'
        );

        if (!tab || replayingClick || window.WRNBriefing) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        void activateBriefing().then(success => {
            if (!success) return;

            replayingClick = true;
            tab.click();
            replayingClick = false;
        });
    }, true);

    document.addEventListener('click', event => {
        const tab = event.target.closest?.('.wrn-top-tab');

        if (!tab || tab.dataset.key === 'briefing') return;

        hidePanel();
        restoreNewsContent();
    }, true);

    window.WRNBriefingLoader = Object.freeze({
        load: activateBriefing,
        restoreNewsContent
    });
})();
