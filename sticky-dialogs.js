/* World Revolution News 1.7.16 – feststehende Dialog-Kopfzeilen */
'use strict';

(() => {
    if (window.__wrnStickyDialogs1716) return;
    window.__wrnStickyDialogs1716 = true;

    const dialogSelectors = [
        '[role="dialog"]',
        '.podcast-library-modal',
        '.podcast-options-modal',
        '.system-status-modal',
        '.feedback-modal',
        '.wrn-source-verification-modal',
        '.wrn-more-panel',
        '.wrn-article-detail',
        '[class*="audio"][class*="modal"]',
        '[class*="audio"][class*="panel"]',
        '[class*="briefing"][class*="modal"]',
        '[class*="briefing"][class*="panel"]',
        '[class*="zine"][class*="modal"]',
        '[class*="storage"][class*="modal"]'
    ];

    const closePattern =
        /schließen|close|zurück|back|×|✕|✖/i;

    const findCloseButton = dialog => {
        const candidates = [
            ...dialog.querySelectorAll(
                'button, a, [role="button"]'
            )
        ];

        return candidates.find(node => {
            const text = [
                node.textContent,
                node.getAttribute('aria-label'),
                node.getAttribute('title'),
                node.dataset.action
            ].filter(Boolean).join(' ');

            return closePattern.test(text);
        }) || null;
    };

    const suitableHeader = (dialog, closeButton) => {
        const explicit = dialog.querySelector(
            ':scope > header, '
            + ':scope > .modal-header, '
            + ':scope > .dialog-header, '
            + ':scope > .panel-header, '
            + ':scope > [class*="head"]'
        );

        if (explicit?.contains(closeButton)) return explicit;

        let current = closeButton?.parentElement;

        while (current && current !== dialog) {
            const hasHeading = Boolean(
                current.querySelector('h1, h2, h3, [role="heading"]')
            );

            if (hasHeading) return current;
            current = current.parentElement;
        }

        return closeButton?.parentElement || null;
    };

    const enhance = dialog => {
        if (!(dialog instanceof Element)) return;
        if (dialog.dataset.wrnStickyChecked === '1716') return;

        const closeButton = findCloseButton(dialog);

        if (!closeButton) {
            dialog.dataset.wrnStickyChecked = '1716';
            return;
        }

        const header = suitableHeader(dialog, closeButton);

        dialog.classList.add('wrn-sticky-dialog-1716');
        closeButton.classList.add('wrn-sticky-close-1716');

        if (header) {
            header.classList.add('wrn-sticky-dialog-head-1716');
        }

        dialog.dataset.wrnStickyChecked = '1716';
    };

    const scan = root => {
        if (!(root instanceof Element || root instanceof Document)) {
            return;
        }

        dialogSelectors.forEach(selector => {
            if (
                root instanceof Element
                && root.matches(selector)
            ) {
                enhance(root);
            }

            root.querySelectorAll(selector).forEach(enhance);
        });
    };

    let queued = false;

    const queueScan = () => {
        if (queued) return;
        queued = true;

        window.requestAnimationFrame(() => {
            queued = false;
            scan(document);
        });
    };

    const init = () => {
        scan(document);

        new MutationObserver(records => {
            if (records.some(record => record.addedNodes.length)) {
                queueScan();
            }
        }).observe(document.body, {
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
})();
