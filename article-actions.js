/* World Revolution News 1.7.16 – Artikelaktionen und Quellenhinweis */
'use strict';

(() => {
    if (window.__wrnArticleActions1716) return;
    window.__wrnArticleActions1716 = true;

    const bypass = new WeakSet();
    let pendingAction = null;

    const translations = {
        de: {
            title: 'Unabhängige Quelle öffnen',
            message:
                'Viele unabhängige Medien arbeiten ohne große Werbebudgets '
                + 'und sind auf freiwillige Spenden angewiesen. Wenn dir ihre '
                + 'Arbeit hilft, freuen sie sich über deinen Beitrag.',
            continue: 'Zur Originalquelle',
            cancel: 'Abbrechen',
            source: 'Quelle'
        },
        en: {
            title: 'Open independent source',
            message:
                'Many independent media projects work without large '
                + 'advertising budgets and depend on voluntary donations. '
                + 'If their work is useful to you, they appreciate your support.',
            continue: 'Open original source',
            cancel: 'Cancel',
            source: 'Source'
        }
    };

    const language = () => {
        const raw = String(
            document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || 'en'
        ).toLowerCase();

        return raw.startsWith('de') ? 'de' : 'en';
    };

    const t = () => translations[language()] || translations.en;

    const cleanText = node => String(node?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const actionType = node => {
        const text = cleanText(node);
        const classText = String(node.className || '').toLowerCase();
        const combined = `${text} ${classText}`;

        if (/übersetz|translate/.test(combined)) return 'translate';
        if (/podcast|audio|vorlesen|listen/.test(combined)) return 'podcast';
        if (/später|later|bookmark|merken|save/.test(combined)) return 'later';
        if (/gelesen|read/.test(combined)) return 'read';
        if (/zine/.test(combined)) return 'zine';
        if (/share|teilen/.test(combined)) return 'share';
        if (/original|quelle öffnen|open source/.test(combined)) {
            return 'original';
        }

        return '';
    };

    const markActionGrid = detail => {
        const root = detail.querySelector(
            '.wrn-detail-actions .button-row, '
            + '.wrn-detail-actions, '
            + '.wrn-detail-card > .button-row, '
            + '.button-row'
        );
        if (!root || root.matches('.card, .wrn-detail-card')) return;

        const candidates = [...root.querySelectorAll('button, a[href], [role="button"]')];

        const mapped = candidates
            .map(node => ({ node, type: actionType(node) }))
            .filter(item => item.type);

        const byType = new Map();

        mapped.forEach(item => {
            if (!byType.has(item.type)) byType.set(item.type, item.node);
        });

        if (byType.size < 4) return;

        root.classList.add('wrn-article-action-grid-1716');

        byType.forEach((node, type) => {
            node.dataset.wrnArticleAction = type;
            node.classList.add('wrn-article-action-1716');
        });
    };

    const detailSelectors = [
        '.wrn-article-detail',
        '.article-detail',
        '[data-wrn-detail]',
        '[class*="article-detail"]'
    ];

    const findDetails = root => {
        const details = [];

        if (root instanceof Element) {
            if (detailSelectors.some(selector => root.matches(selector))) {
                details.push(root);
            }

            detailSelectors.forEach(selector => {
                root.querySelectorAll(selector).forEach(node => {
                    details.push(node);
                });
            });
        }

        return [...new Set(details)];
    };

    const sourceNameFromDetail = detail => {
        const sourceNode = detail?.querySelector(
            '[data-source], .source, .article-source, '
            + '.wrn-detail-source, .meta'
        );

        const value = String(
            sourceNode?.dataset?.source
            || sourceNode?.textContent
            || ''
        )
            .replace(/^(quelle|source)\s*:\s*/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        return value.slice(0, 120);
    };

    const destinationFromNode = node => {
        if (node instanceof HTMLAnchorElement && node.href) {
            return node.href;
        }

        return (
            node.dataset.href
            || node.dataset.url
            || node.getAttribute('data-link')
            || ''
        );
    };

    const ensureNotice = () => {
        let overlay = document.getElementById(
            'wrn-source-support-overlay'
        );
        let dialog = document.getElementById(
            'wrn-source-support-dialog'
        );

        if (overlay && dialog) return { overlay, dialog };

        overlay = document.createElement('div');
        overlay.id = 'wrn-source-support-overlay';
        overlay.className = 'wrn-source-support-overlay';
        overlay.hidden = true;

        dialog = document.createElement('section');
        dialog.id = 'wrn-source-support-dialog';
        dialog.className = 'wrn-source-support-dialog';
        dialog.hidden = true;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute(
            'aria-labelledby',
            'wrn-source-support-title'
        );

        dialog.innerHTML = `
            <div class="wrn-source-support-head">
                <h2 id="wrn-source-support-title"></h2>
                <button
                    type="button"
                    data-source-support="cancel"
                    aria-label="Schließen"
                >×</button>
            </div>
            <p id="wrn-source-support-message"></p>
            <p
                id="wrn-source-support-name"
                class="wrn-source-support-name"
                hidden
            ></p>
            <div class="wrn-source-support-actions">
                <button
                    type="button"
                    data-source-support="cancel"
                ></button>
                <button
                    type="button"
                    data-source-support="continue"
                ></button>
            </div>
        `;

        document.body.append(overlay, dialog);

        overlay.addEventListener('click', closeNotice);

        dialog.addEventListener('click', event => {
            const button = event.target.closest(
                '[data-source-support]'
            );

            if (!button) return;

            if (button.dataset.sourceSupport === 'cancel') {
                closeNotice();
            }

            if (button.dataset.sourceSupport === 'continue') {
                continueToSource();
            }
        });

        return { overlay, dialog };
    };

    const renderNotice = sourceName => {
        const labels = t();
        const { overlay, dialog } = ensureNotice();

        dialog.querySelector('#wrn-source-support-title')
            .textContent = labels.title;

        dialog.querySelector('#wrn-source-support-message')
            .textContent = labels.message;

        const source = dialog.querySelector(
            '#wrn-source-support-name'
        );

        if (sourceName) {
            source.hidden = false;
            source.textContent = `${labels.source}: ${sourceName}`;
        } else {
            source.hidden = true;
            source.textContent = '';
        }

        dialog.querySelectorAll(
            '[data-source-support="cancel"]'
        ).forEach((button, index) => {
            if (index > 0) button.textContent = labels.cancel;
        });

        dialog.querySelector(
            '[data-source-support="continue"]'
        ).textContent = labels.continue;

        overlay.hidden = false;
        dialog.hidden = false;
        document.documentElement.classList.add(
            'wrn-source-support-open'
        );

        dialog.querySelector(
            '[data-source-support="continue"]'
        )?.focus();
    };

    function closeNotice() {
        const overlay = document.getElementById(
            'wrn-source-support-overlay'
        );
        const dialog = document.getElementById(
            'wrn-source-support-dialog'
        );

        if (overlay) overlay.hidden = true;
        if (dialog) dialog.hidden = true;

        pendingAction = null;
        document.documentElement.classList.remove(
            'wrn-source-support-open'
        );
    }

    function continueToSource() {
        const action = pendingAction;
        pendingAction = null;

        const overlay = document.getElementById(
            'wrn-source-support-overlay'
        );
        const dialog = document.getElementById(
            'wrn-source-support-dialog'
        );

        if (overlay) overlay.hidden = true;
        if (dialog) dialog.hidden = true;

        document.documentElement.classList.remove(
            'wrn-source-support-open'
        );

        if (!action?.node) return;

        if (action.url) {
            window.open(
                action.url,
                '_blank',
                'noopener,noreferrer'
            );
            return;
        }

        bypass.add(action.node);
        action.node.click();
    }

    document.addEventListener('click', event => {
        const node = event.target.closest?.(
            '[data-wrn-article-action="original"], '
            + '.wrn-article-detail a[href*="http"]'
        );

        if (!node || bypass.has(node)) {
            if (node) bypass.delete(node);
            return;
        }

        if (actionType(node) !== 'original') return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const detail = node.closest(
            '.wrn-article-detail, .article-detail, '
            + '[data-wrn-detail], [class*="article-detail"]'
        );

        pendingAction = {
            node,
            url: destinationFromNode(node)
        };

        renderNotice(sourceNameFromDetail(detail));
    }, true);

    let queued = false;

    const scan = root => {
        findDetails(root).forEach(markActionGrid);
    };

    const queueScan = root => {
        if (queued) return;
        queued = true;

        window.requestAnimationFrame(() => {
            queued = false;
            scan(root instanceof Element ? root : document.body);
        });
    };

    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.addedNodes.length) {
                queueScan(document.body);
                break;
            }
        }
    });

    const init = () => {
        scan(document.body);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            { once: true }
        );
    } else {
        init();
    }

    document.addEventListener('keydown', event => {
        if (
            event.key === 'Escape'
            && !document.getElementById(
                'wrn-source-support-dialog'
            )?.hidden
        ) {
            closeNotice();
        }
    });
})();
