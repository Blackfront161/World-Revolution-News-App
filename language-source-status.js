/* World Revolution News 1.7.19 – Sprachquellen-Status */
'use strict';

(() => {
    if (window.WRNLanguageSourceStatus) return;

    const labels = () => {
        const de = String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || ''
        ).toLowerCase().startsWith('de');

        return de
            ? {
                open: 'Sprachquellen',
                title: 'Sprachabdeckung der Quellen',
                close: 'Schließen',
                active: 'Aktive Quellenzeilen',
                approved: 'Freigegebene Quellenpakete',
                empty: 'Noch kein Sprach-Audit vorhanden.'
            }
            : {
                open: 'Language sources',
                title: 'Source language coverage',
                close: 'Close',
                active: 'Active source rows',
                approved: 'Approved source packages',
                empty: 'No language audit is available yet.'
            };
    };

    let data = null;

    const ensure = () => {
        let overlay = document.getElementById(
            'wrn-language-source-overlay'
        );
        let dialog = document.getElementById(
            'wrn-language-source-dialog'
        );

        if (overlay && dialog) return { overlay, dialog };

        overlay = document.createElement('div');
        overlay.id = 'wrn-language-source-overlay';
        overlay.className = 'wrn-language-source-overlay';
        overlay.hidden = true;

        dialog = document.createElement('section');
        dialog.id = 'wrn-language-source-dialog';
        dialog.className = 'wrn-language-source-dialog';
        dialog.hidden = true;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.innerHTML = `
            <header>
                <h2></h2>
                <button
                    type="button"
                    data-language-source="close"
                >×</button>
            </header>
            <div id="wrn-language-source-content"></div>
        `;

        document.body.append(overlay, dialog);

        overlay.addEventListener('click', close);
        dialog.addEventListener('click', event => {
            if (
                event.target.closest(
                    '[data-language-source="close"]'
                )
            ) {
                close();
            }
        });

        return { overlay, dialog };
    };

    const rows = values => Object.entries(values || {})
        .sort((a, b) => b[1] - a[1])
        .map(([language, count]) => `
            <div>
                <strong>${language.toUpperCase()}</strong>
                <span>${Number(count)}</span>
            </div>
        `).join('');

    const render = () => {
        const t = labels();
        const { dialog } = ensure();

        dialog.querySelector('h2').textContent = t.title;
        const content = dialog.querySelector(
            '#wrn-language-source-content'
        );

        if (!data) {
            content.innerHTML = `<p>${t.empty}</p>`;
            return;
        }

        content.innerHTML = `
            <section>
                <h3>${t.active}</h3>
                <div class="wrn-language-source-grid">
                    ${rows(data.activeLanguages)}
                </div>
            </section>
            <section>
                <h3>${t.approved}</h3>
                <div class="wrn-language-source-grid">
                    ${rows(data.approvedLanguages)}
                </div>
            </section>
        `;
    };

    async function refresh() {
        try {
            const url = window.WRN_CONFIG?.dataUrls?.languageSourceAudit
                || './language-source-audit.json';
            const response = await fetch(
                `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`,
                { cache: 'no-store' }
            );
            data = response.ok ? await response.json() : null;
        } catch {
            data = null;
        }
        render();
    }

    function open() {
        const { overlay, dialog } = ensure();
        overlay.hidden = false;
        dialog.hidden = false;
        render();
        void refresh();
    }

    function close() {
        document.getElementById('wrn-language-source-overlay')
            ?.setAttribute('hidden', '');
        document.getElementById('wrn-language-source-dialog')
            ?.setAttribute('hidden', '');
    }

    const install = () => {
        if (document.getElementById('wrn-language-source-open')) {
            return true;
        }

        const target = document.querySelector('.wrn-more-grid');
        if (!target) return false;

        const button = document.createElement('button');
        button.id = 'wrn-language-source-open';
        button.type = 'button';
        button.className = 'wrn-language-source-open';
        button.textContent = labels().open;
        button.addEventListener('click', open);
        target.appendChild(button);
        return true;
    };

    const init = () => {
        ensure();

        if (install()) return;

        let attempts = 0;
        const timer = setInterval(() => {
            attempts += 1;
            if (install() || attempts >= 30) clearInterval(timer);
        }, 250);
    };

    window.WRNLanguageSourceStatus = Object.freeze({
        open,
        close,
        refresh
    });

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
