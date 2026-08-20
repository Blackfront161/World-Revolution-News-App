/* World Revolution News 1.7.18 – sichere Startanimation */
'use strict';

(() => {
    if (window.__wrnIntroScreen1720) return;
    window.__wrnIntroScreen1720 = true;

    const params = new URLSearchParams(location.search);

    if (params.get('intro') === '0') return;

    let screen = null;
    let progressBar = null;
    let progress = 0;
    let finished = false;
    let appReady = false;
    let minimumElapsed = false;
    let raf = 0;

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    const now = () => performance.now();

    const create = () => {
        if (document.getElementById('wrn-intro-screen-1720')) {
            return;
        }

        screen = document.createElement('section');
        screen.id = 'wrn-intro-screen-1720';
        screen.className = 'wrn-intro-screen-1720';
        screen.setAttribute('aria-label', 'World Revolution News startet');
        screen.setAttribute('role', 'status');
        screen.innerHTML = `
            <div class="wrn-intro-backdrop-1720"></div>
            <div class="wrn-intro-shade-1720"></div>

            <div class="wrn-intro-content-1720">
                <img
                    class="wrn-intro-logo-1720"
                    src="./wrn-logo.webp?v=1720"
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                >

                <div class="wrn-intro-wordmark-1720">
                    WORLD REVOLUTION NEWS
                </div>

                <div
                    class="wrn-intro-progress-track-1720"
                    aria-hidden="true"
                >
                    <span class="wrn-intro-progress-1720"></span>
                </div>

                <p class="wrn-intro-status-1720">
                    Independent news loading
                </p>

                <button
                    type="button"
                    class="wrn-intro-skip-1720"
                >
                    Skip
                </button>
            </div>
        `;

        progressBar = screen.querySelector(
            '.wrn-intro-progress-1720'
        );

        screen.querySelector('.wrn-intro-skip-1720')
            ?.addEventListener('click', () => finish('skip'));

        document.body.prepend(screen);
        document.documentElement.classList.add('wrn-intro-active-1720');

        const language = String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || 'en'
        ).toLowerCase();

        if (language.startsWith('de')) {
            screen.querySelector('.wrn-intro-status-1720')
                .textContent = 'Unabhängige Nachrichten werden geladen';
            screen.querySelector('.wrn-intro-skip-1720')
                .textContent = 'Überspringen';
        }

        requestAnimationFrame(() => {
            screen?.classList.add('wrn-intro-visible-1720');
        });

        startProgress();
    };

    const setProgress = value => {
        progress = Math.max(progress, Math.min(100, value));

        if (progressBar) {
            progressBar.style.transform =
                `scaleX(${progress / 100})`;
        }
    };

    const startProgress = () => {
        const started = now();
        const duration = reducedMotion ? 220 : 2100;

        const tick = () => {
            if (finished) return;

            const elapsed = now() - started;
            const ratio = Math.min(1, elapsed / duration);

            /*
             * Schnell bis 72 %, danach langsamer.
             * wrn-app-ready schließt die letzten Prozent ab.
             */
            const target = ratio < 0.65
                ? ratio / 0.65 * 72
                : 72 + ((ratio - 0.65) / 0.35) * 18;

            setProgress(target);

            if (!minimumElapsed || !appReady) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);
    };

    const maybeFinish = () => {
        if (finished || !minimumElapsed || !appReady) return;

        setProgress(100);
        window.setTimeout(() => finish('ready'), reducedMotion ? 20 : 180);
    };

    function finish(reason = 'timeout') {
        if (finished) return;
        finished = true;

        cancelAnimationFrame(raf);
        setProgress(100);

        if (!screen) {
            document.documentElement.classList.remove(
                'wrn-intro-active-1720'
            );
            return;
        }

        screen.dataset.finishReason = reason;
        screen.classList.add('wrn-intro-leaving-1720');

        window.setTimeout(() => {
            screen?.remove();
            screen = null;
            document.documentElement.classList.remove(
                'wrn-intro-active-1720'
            );
            window.dispatchEvent(
                new CustomEvent('wrn-intro-closed', {
                    detail: { reason }
                })
            );
        }, reducedMotion ? 30 : 430);
    }

    const init = () => {
        create();

        window.setTimeout(() => {
            minimumElapsed = true;
            maybeFinish();
        }, reducedMotion ? 120 : 900);

        /*
         * Harter Watchdog: Die Animation kann niemals wieder
         * die App blockieren.
         */
        window.setTimeout(() => finish('watchdog'), 4200);
    };

    window.addEventListener('wrn-app-ready', () => {
        appReady = true;
        maybeFinish();
    }, { once: true });

    window.addEventListener('load', () => {
        window.setTimeout(() => {
            appReady = true;
            maybeFinish();
        }, 500);
    }, { once: true });

    window.addEventListener('pageshow', event => {
        if (event.persisted) finish('pageshow');
    });

    window.WRNCloseIntro = finish;

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            { once: true }
        );
    } else {
        init();
    }
})();
