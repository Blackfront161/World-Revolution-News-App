/* World Revolution News 1.8.4 – transparenter, leuchtender Header */
'use strict';

(() => {
    if (window.__wrnFutureHeader1720) return;
    window.__wrnFutureHeader1720 = true;

    const removeOldHeaderAssets = header => {
        header.querySelectorAll(
            '.wrn-brand-title-image, .wrn-title-script, '
            + 'img[src*="wrn-title-script"], '
            + '.wrn-future-header-image, .wrn-custom-header-banner'
        ).forEach(node => node.remove());
    };

    let observedHeader = null;
    let headerObserver = null;

    const updateStickyHeight = () => {
        const header = document.querySelector('header');
        if (!header) return;
        const height = Math.max(1, Math.ceil(header.getBoundingClientRect().height));
        document.documentElement.style.setProperty('--wrn-sticky-header-height', `${height}px`);
    };

    const installStickyHeightObserver = header => {
        if (!header || observedHeader === header) {
            updateStickyHeight();
            return;
        }
        headerObserver?.disconnect?.();
        observedHeader = header;
        if ('ResizeObserver' in window) {
            headerObserver = new ResizeObserver(updateStickyHeight);
            headerObserver.observe(header);
        }
        updateStickyHeight();
    };

    const install = () => {
        const header = document.querySelector('header');
        const heading = header?.querySelector('h1');
        const brandArea = heading?.parentElement || header?.firstElementChild || header;

        if (!header || !heading || !brandArea) return false;

        removeOldHeaderAssets(header);

        const image = document.createElement('img');
        image.className = 'wrn-future-header-image wrn-custom-header-banner';
        image.src = './wrn-future-header-white.png?v=184-release-1';
        image.alt = '';
        image.setAttribute('aria-hidden', 'true');
        image.decoding = 'async';
        image.fetchPriority = 'high';
        image.draggable = false;

        image.addEventListener('load', () => {
            header.classList.add('wrn-future-header-ready');
            updateStickyHeight();
        }, { once: true });

        image.addEventListener('error', () => {
            header.classList.remove('wrn-future-header-ready');
            image.remove();
        }, { once: true });

        brandArea.appendChild(image);
        installStickyHeightObserver(header);
        return true;
    };

    const start = () => {
        if (install()) return;

        let attempts = 0;
        const timer = window.setInterval(() => {
            attempts += 1;
            if (install() || attempts >= 24) {
                window.clearInterval(timer);
            }
        }, 150);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }

    window.addEventListener('pageshow', install);
    window.addEventListener('resize', updateStickyHeight, { passive: true });
})();
