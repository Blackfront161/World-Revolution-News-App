/* World Revolution News – Barrierefreiheit, Darstellungsmodi und Tastaturhilfe */
'use strict';

(() => {
    const THEME_KEY = 'wrn_theme_style';
    const MOTION_KEY = 'wrn_motion_preference';
    const THEMES = new Set(['theme-dark', 'theme-light', 'theme-oled', 'theme-contrast', 'theme-soft']);
    const MOTION_MODES = new Set(['auto', 'reduced', 'full']);
    const THEME_COLORS = {
        'theme-dark': '#050508',
        'theme-light': '#f1e9dc',
        'theme-oled': '#000000',
        'theme-contrast': '#000000',
        'theme-soft': '#171714'
    };

    let previousFocus = null;
    let initialized = false;
    let modalObserver = null;

    const labels = {
        en: {
            skip: 'Skip to articles',
            design: 'Design',
            motion: 'Motion',
            dark: 'Dark',
            light: 'Light',
            oled: 'OLED black',
            contrast: 'High contrast',
            soft: 'Eye-friendly',
            motionAuto: 'System setting',
            motionReduced: 'Reduced',
            motionFull: 'Normal',
            searchFocused: 'Search field focused',
            modalClosed: 'Dialog closed'
        },
        de: {
            skip: 'Zu den Artikeln springen',
            design: 'Design',
            motion: 'Bewegung',
            dark: 'Dunkel',
            light: 'Hell',
            oled: 'OLED-Schwarz',
            contrast: 'Hoher Kontrast',
            soft: 'Augenschonend',
            motionAuto: 'Systemeinstellung',
            motionReduced: 'Reduziert',
            motionFull: 'Normal',
            searchFocused: 'Suchfeld fokussiert',
            modalClosed: 'Dialog geschlossen'
        },
        es: {
            skip:'Ir a los artículos', design:'Diseño', motion:'Movimiento', dark:'Oscuro',
            light:'Claro', oled:'Negro OLED', contrast:'Alto contraste', soft:'Suave para la vista',
            motionAuto:'Ajuste del sistema', motionReduced:'Reducido', motionFull:'Normal',
            searchFocused:'Campo de búsqueda enfocado', modalClosed:'Diálogo cerrado'
        },
        fr: {
            skip:'Aller aux articles', design:'Design', motion:'Mouvement', dark:'Sombre',
            light:'Clair', oled:'Noir OLED', contrast:'Contraste élevé', soft:'Doux pour les yeux',
            motionAuto:'Réglage système', motionReduced:'Réduit', motionFull:'Normal',
            searchFocused:'Champ de recherche sélectionné', modalClosed:'Fenêtre fermée'
        },
        it: {
            skip:'Vai agli articoli', design:'Design', motion:'Movimento', dark:'Scuro',
            light:'Chiaro', oled:'Nero OLED', contrast:'Contrasto elevato', soft:'Riposante',
            motionAuto:'Impostazione di sistema', motionReduced:'Ridotto', motionFull:'Normale',
            searchFocused:'Campo di ricerca selezionato', modalClosed:'Finestra chiusa'
        },
        pt: {
            skip:'Ir para os artigos', design:'Design', motion:'Movimento', dark:'Escuro',
            light:'Claro', oled:'Preto OLED', contrast:'Alto contraste', soft:'Suave para os olhos',
            motionAuto:'Definição do sistema', motionReduced:'Reduzido', motionFull:'Normal',
            searchFocused:'Campo de pesquisa selecionado', modalClosed:'Janela fechada'
        },
        ru: {
            skip:'Перейти к статьям', design:'Оформление', motion:'Движение', dark:'Тёмная',
            light:'Светлая', oled:'Чёрная OLED', contrast:'Высокая контрастность', soft:'Мягкая',
            motionAuto:'Настройка системы', motionReduced:'Уменьшено', motionFull:'Обычно',
            searchFocused:'Поле поиска выбрано', modalClosed:'Окно закрыто'
        },
        el: {
            skip:'Μετάβαση στα άρθρα', design:'Σχεδίαση', motion:'Κίνηση', dark:'Σκούρο',
            light:'Φωτεινό', oled:'Μαύρο OLED', contrast:'Υψηλή αντίθεση', soft:'Ξεκούραστο',
            motionAuto:'Ρύθμιση συστήματος', motionReduced:'Μειωμένη', motionFull:'Κανονική',
            searchFocused:'Επιλέχθηκε το πεδίο αναζήτησης', modalClosed:'Το παράθυρο έκλεισε'
        },
        tr: {
            skip:'Makalelere geç', design:'Tasarım', motion:'Hareket', dark:'Koyu',
            light:'Açık', oled:'OLED siyah', contrast:'Yüksek kontrast', soft:'Göz dostu',
            motionAuto:'Sistem ayarı', motionReduced:'Azaltılmış', motionFull:'Normal',
            searchFocused:'Arama alanı seçildi', modalClosed:'Pencere kapatıldı'
        }
    };

    function text() {
        const lang = document.documentElement.lang || 'en';
        return labels[lang] || labels.en;
    }

    function announce(message) {
        const region = document.getElementById('accessibility-live');
        if (!region || !message) return;
        region.textContent = '';
        window.setTimeout(() => { region.textContent = String(message); }, 20);
    }

    function getTheme() {
        const saved = localStorage.getItem(THEME_KEY) || 'theme-dark';
        return THEMES.has(saved) ? saved : 'theme-dark';
    }

    function applyTheme(themeName) {
        const theme = THEMES.has(themeName) ? themeName : 'theme-dark';
        const body = document.getElementById('app-body') || document.body;
        if (!body) return theme;
        THEMES.forEach(name => body.classList.remove(name));
        body.classList.add(theme);
        localStorage.setItem(THEME_KEY, theme);
        const select = document.getElementById('ui-theme');
        if (select && select.value !== theme) select.value = theme;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS['theme-dark']);
        return theme;
    }

    function getMotionPreference() {
        return 'auto';
    }

    function systemPrefersReducedMotion() {
        return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    }

    function applyMotionPreference(modeName) {
        const mode = MOTION_MODES.has(modeName) ? modeName : 'auto';
        const body = document.getElementById('app-body') || document.body;
        if (!body) return mode;
        const effective = mode === 'auto' ? (systemPrefersReducedMotion() ? 'reduced' : 'full') : mode;
        body.dataset.motion = effective;
        body.dataset.motionPreference = mode;
        if (mode === 'auto') localStorage.removeItem(MOTION_KEY);
        else localStorage.setItem(MOTION_KEY, mode);
        const select = document.getElementById('ui-motion');
        if (select && select.value !== mode) select.value = mode;
        return mode;
    }

    function updateLanguage(lang = document.documentElement.lang || 'en') {
        const t = labels[lang] || labels.en;
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        setText('skip-to-content', t.skip);
        setText('txt-theme-label', t.design);
        setText('txt-motion-label', t.motion);
        setText('opt-theme-dark', t.dark);
        setText('opt-theme-light', t.light);
        setText('opt-theme-oled', t.oled);
        setText('opt-theme-contrast', t.contrast);
        setText('opt-theme-soft', t.soft);
        setText('opt-motion-auto', t.motionAuto);
        setText('opt-motion-reduced', t.motionReduced);
        setText('opt-motion-full', t.motionFull);
    }

    function isVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && !element.hidden;
    }

    function visibleModal() {
        return [...document.querySelectorAll('.feedback-modal')].find(isVisible) || null;
    }

    function focusModal(modal) {
        if (!modal) return;
        if (!previousFocus || !document.contains(previousFocus)) previousFocus = document.activeElement;
        if (!modal.hasAttribute('role')) modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
        const target = modal.querySelector('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || modal;
        window.setTimeout(() => target.focus({ preventScroll: true }), 30);
    }

    function restoreFocusIfNoModal() {
        if (visibleModal()) return;
        if (previousFocus && document.contains(previousFocus) && typeof previousFocus.focus === 'function') {
            previousFocus.focus({ preventScroll: true });
        }
        previousFocus = null;
    }

    function observeModals() {
        const modals = [...document.querySelectorAll('.feedback-modal')];
        if (!modals.length || typeof MutationObserver === 'undefined') return;
        modalObserver?.disconnect();
        modalObserver = new MutationObserver(records => {
            let opened = null;
            let closed = false;
            records.forEach(record => {
                const modal = record.target;
                if (isVisible(modal)) opened = modal;
                else closed = true;
            });
            if (opened) focusModal(opened);
            else if (closed) restoreFocusIfNoModal();
        });
        modals.forEach(modal => modalObserver.observe(modal, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] }));
    }

    function isTypingTarget(target) {
        if (!(target instanceof Element)) return false;
        return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
    }

    function handleKeyboard(event) {
        if (event.key === 'Escape') {
            const modal = visibleModal();
            if (modal && typeof window.closeAllModals === 'function') {
                event.preventDefault();
                window.closeAllModals();
                announce(text().modalClosed);
                return;
            }
            document.querySelectorAll('details[open]').forEach(details => { details.open = false; });
            return;
        }

        if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTypingTarget(event.target)) {
            const search = document.getElementById('search-input');
            if (search) {
                event.preventDefault();
                search.focus();
                search.select?.();
                announce(text().searchFocused);
            }
        }
    }

    function handleSystemMotionChange() {
        if (getMotionPreference() === 'auto') applyMotionPreference('auto');
    }

    function init() {
        if (initialized) return;
        initialized = true;
        applyTheme(getTheme());
        // Die Oberfläche übernimmt automatisch die Systemeinstellung. Eine
        // zusätzliche, erklärungsbedürftige Bewegungs-Auswahl ist nicht nötig.
        applyMotionPreference('auto');
        updateLanguage();
        observeModals();
        document.addEventListener('keydown', handleKeyboard);
        const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        media?.addEventListener?.('change', handleSystemMotionChange);
        document.body.classList.add('accessibility-ready');
    }

    window.changeMotionPreference = applyMotionPreference;
    window.WRNAccessibility = Object.freeze({
        init,
        announce,
        getTheme,
        applyTheme,
        getMotionPreference,
        applyMotionPreference,
        updateLanguage,
        focusModal
    });
})();
