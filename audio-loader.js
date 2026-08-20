/* World Revolution News 1.7.17 – Audio lazy loading */
'use strict';

(() => {
    if (window.__wrnAudioLoader1717) return;
    window.__wrnAudioLoader1717 = true;

    let loadingPromise = null;
    let replaying = false;

    const loadStyle = file => {
        if (document.querySelector(`link[data-wrn-audio-style="${file}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `./${file}?v=1717`;
        link.dataset.wrnAudioStyle = file;
        document.head.appendChild(link);
    };

    const loadScript = file => new Promise(resolve => {
        const selector = `script[data-wrn-audio-module="${file}"]`;
        const existing = document.querySelector(selector);

        if (existing?.dataset.loaded === 'true') {
            resolve(true);
            return;
        }

        const script = existing || document.createElement('script');
        if (!existing) {
            script.src = `./${file}?v=1717`;
            script.dataset.wrnAudioModule = file;
        }

        let finished = false;
        const finish = value => {
            if (finished) return;
            finished = true;
            script.dataset.loaded = value ? 'true' : 'false';
            resolve(value);
        };

        const timer = window.setTimeout(() => finish(false), 12000);
        script.addEventListener('load', () => {
            window.clearTimeout(timer);
            finish(true);
        }, { once: true });
        script.addEventListener('error', () => {
            window.clearTimeout(timer);
            finish(false);
        }, { once: true });

        if (!existing) document.body.appendChild(script);
    });

    const load = () => {
        if (loadingPromise) return loadingPromise;

        loadingPromise = (async () => {
            loadStyle('audio-catalog.css');

            for (const file of [
                'audio-player-fixes.js',
                'audio-catalog.js'
            ]) {
                if (!await loadScript(file)) return false;
            }

            window.dispatchEvent(new CustomEvent('wrn-audio-ready'));
            return true;
        })();

        return loadingPromise;
    };

    document.addEventListener('click', event => {
        const tab = event.target.closest?.('.wrn-top-tab[data-key="audio"]');
        if (!tab || replaying) return;

        const loaded = document.querySelector(
            'script[data-wrn-audio-module="audio-catalog.js"]'
        )?.dataset.loaded === 'true';

        if (loaded) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        void load().then(success => {
            if (!success) {
                loadingPromise = null;
                window.alert(
                    document.documentElement.lang?.startsWith('de')
                        ? 'Audio konnte nicht geladen werden.'
                        : 'Audio could not be loaded.'
                );
                return;
            }

            replaying = true;
            tab.click();
            replaying = false;
        });
    }, true);

    window.WRNAudioLoader = Object.freeze({ load });
})();
