/* World Revolution News 1.7.18 – Wiederherstellungs-Audit */
'use strict';

(() => {
    if (window.WRNRecoveryAudit) return;

    let report = null;

    const labels = () => {
        const de = String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || ''
        ).toLowerCase().startsWith('de');

        return de
            ? {
                open: 'Funktions-Audit',
                title: 'Wiederherstellungs-Audit',
                close: 'Schließen',
                reload: 'Neu laden',
                empty:
                    'Noch kein Audit-Bericht vorhanden. '
                    + 'Starte den Repair-and-verify-audio-Workflow.',
                present: 'Vorhanden',
                missing: 'Fehlt',
                lazy: 'Bei Bedarf',
                critical: 'Kritisch'
            }
            : {
                open: 'Feature audit',
                title: 'Recovery audit',
                close: 'Close',
                reload: 'Reload',
                empty:
                    'No audit report yet. Run the repair-and-verify-audio workflow.',
                present: 'Present',
                missing: 'Missing',
                lazy: 'On demand',
                critical: 'Critical'
            };
    };

    const ensure = () => {
        let overlay = document.getElementById(
            'wrn-recovery-audit-overlay'
        );
        let dialog = document.getElementById(
            'wrn-recovery-audit-dialog'
        );

        if (overlay && dialog) return { overlay, dialog };

        overlay = document.createElement('div');
        overlay.id = 'wrn-recovery-audit-overlay';
        overlay.className = 'wrn-recovery-audit-overlay';
        overlay.hidden = true;

        dialog = document.createElement('section');
        dialog.id = 'wrn-recovery-audit-dialog';
        dialog.className = 'wrn-recovery-audit-dialog';
        dialog.hidden = true;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.innerHTML = `
            <header>
                <div>
                    <h2></h2>
                    <small id="wrn-recovery-audit-time"></small>
                </div>
                <button
                    type="button"
                    data-recovery-audit="close"
                    aria-label="Schließen"
                >×</button>
            </header>

            <div id="wrn-recovery-audit-content"></div>

            <footer>
                <button
                    type="button"
                    data-recovery-audit="reload"
                ></button>
                <button
                    type="button"
                    data-recovery-audit="close"
                ></button>
            </footer>
        `;

        document.body.append(overlay, dialog);

        overlay.addEventListener('click', close);

        dialog.addEventListener('click', event => {
            const action = event.target.closest(
                '[data-recovery-audit]'
            )?.dataset.recoveryAudit;

            if (action === 'close') close();
            if (action === 'reload') void refresh();
        });

        return { overlay, dialog };
    };

    const statusLabel = (row, t) => {
        if (!row.present) return t.missing;
        if (row.status === 'present_lazy') return t.lazy;
        return t.present;
    };

    const render = () => {
        const t = labels();
        const { dialog } = ensure();

        dialog.querySelector('h2').textContent = t.title;
        dialog.querySelectorAll('[data-recovery-audit="reload"]')
            .forEach(button => {
                button.textContent = t.reload;
            });
        dialog.querySelectorAll('[data-recovery-audit="close"]')
            .forEach((button, index) => {
                if (index > 0) button.textContent = t.close;
            });

        const time = dialog.querySelector('#wrn-recovery-audit-time');
        const content = dialog.querySelector(
            '#wrn-recovery-audit-content'
        );

        if (!report?.groups) {
            time.textContent = '';
            content.innerHTML = `<p>${t.empty}</p>`;
            return;
        }

        time.textContent = report.generatedAt
            ? new Date(report.generatedAt).toLocaleString()
            : '';

        content.innerHTML = Object.entries(report.groups)
            .map(([name, group]) => `
                <section class="wrn-recovery-audit-group">
                    <h3>${name.replaceAll('_', ' ')}</h3>
                    <p>
                        ${Number(group.present || 0)}
                        / ${Number(group.total || 0)}
                    </p>
                    <div>
                        ${(group.files || []).map(row => `
                            <article
                                data-state="${row.present
                                    ? row.status
                                    : 'missing'}"
                            >
                                <strong>${row.file}</strong>
                                <span>${statusLabel(row, t)}</span>
                                ${row.critical
                                    ? `<small>${t.critical}</small>`
                                    : ''}
                            </article>
                        `).join('')}
                    </div>
                </section>
            `).join('');
    };

    async function refresh() {
        try {
            const url = window.WRN_CONFIG?.dataUrls?.featureAudit
                || './feature-audit.json';

            const response = await fetch(
                `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`,
                { cache: 'no-store' }
            );

            report = response.ok ? await response.json() : null;
        } catch {
            report = null;
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
        const overlay = document.getElementById(
            'wrn-recovery-audit-overlay'
        );
        const dialog = document.getElementById(
            'wrn-recovery-audit-dialog'
        );

        if (overlay) overlay.hidden = true;
        if (dialog) dialog.hidden = true;
    }

    const install = () => {
        if (document.getElementById('wrn-recovery-audit-open')) {
            return true;
        }

        const target = document.querySelector('.wrn-more-grid');
        if (!target) return false;

        const button = document.createElement('button');
        button.id = 'wrn-recovery-audit-open';
        button.type = 'button';
        button.className = 'wrn-recovery-audit-open';
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

            if (install() || attempts >= 30) {
                clearInterval(timer);
            }
        }, 250);
    };

    window.WRNRecoveryAudit = Object.freeze({
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
