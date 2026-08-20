/* World Revolution News 1.8.2 – Quellen-, Sprach- und Herkunftsfilter */
'use strict';

(() => {
    if (window.WRNSourceFilters) return;

    const STORAGE_LANGUAGE = 'wrn_source_language_filter';
    const STORAGE_ORIGIN = 'wrn_source_origin_filter';

    const TEXT = {
        de: { allLanguages: 'Alle Sprachen', allOrigins: 'Alle Herkunftsorte', language: 'Quellsprache', origin: 'Herkunft' },
        en: { allLanguages: 'All languages', allOrigins: 'All origins', language: 'Source language', origin: 'Origin' },
        es: { allLanguages: 'Todos los idiomas', allOrigins: 'Todos los orígenes', language: 'Idioma de la fuente', origin: 'Origen' },
        fr: { allLanguages: 'Toutes les langues', allOrigins: 'Toutes les origines', language: 'Langue de la source', origin: 'Origine' },
        it: { allLanguages: 'Tutte le lingue', allOrigins: 'Tutte le origini', language: 'Lingua della fonte', origin: 'Origine' },
        pt: { allLanguages: 'Todos os idiomas', allOrigins: 'Todas as origens', language: 'Idioma da fonte', origin: 'Origem' },
        ru: { allLanguages: 'Все языки', allOrigins: 'Все регионы происхождения', language: 'Язык источника', origin: 'Происхождение' },
        el: { allLanguages: 'Όλες οι γλώσσες', allOrigins: 'Όλες οι προελεύσεις', language: 'Γλώσσα πηγής', origin: 'Προέλευση' },
        tr: { allLanguages: 'Tüm diller', allOrigins: 'Tüm kökenler', language: 'Kaynak dili', origin: 'Köken' }
    };

    const LANGUAGE_NAMES = Object.freeze({
        ar: 'العربية', ca: 'Català', de: 'Deutsch', el: 'Ελληνικά', en: 'English',
        es: 'Español', fr: 'Français', id: 'Bahasa Indonesia', it: 'Italiano',
        ku: 'Kurdî', pl: 'Polski', pt: 'Português', ru: 'Русский', tr: 'Türkçe',
        und: 'Unbekannt', zh: '中文'
    });

    const state = {
        byName: new Map(),
        byUrl: new Map(),
        sources: [],
        loaded: false
    };

    const list = value => {
        const values = Array.isArray(value) ? value : value ? [value] : [];
        return [...new Set(values.map(item => String(item || '').trim()).filter(Boolean))];
    };

    const languageCode = value => String(value || '').trim().toLowerCase().split(/[-_]/)[0];
    const sourceNameKey = value => String(value || '').trim().toLocaleLowerCase();

    const canonicalUrl = value => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        try {
            const url = new URL(raw, window.location?.href || 'https://example.invalid/');
            return `${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}${url.search}`;
        } catch {
            return raw.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
        }
    };

    const currentUiLanguage = () => {
        const raw = window.WRNI18n?.currentLanguage?.()
            || document?.getElementById?.('ui-language')?.value
            || document?.documentElement?.lang
            || 'en';
        const code = languageCode(raw);
        return TEXT[code] ? code : 'en';
    };

    const text = () => TEXT[currentUiLanguage()] || TEXT.en;

    const metadataFor = article => {
        const name = sourceNameKey(article?.quelleName || article?.sourceName || article?.source || '');
        const url = canonicalUrl(article?.sourceHomepage || article?.feedUrl || article?.sourceUrl || '');
        return state.byName.get(name) || state.byUrl.get(url) || {};
    };

    const articleLanguages = article => {
        const metadata = metadataFor(article);
        const values = [
            ...list(article?.languages),
            ...list(article?.language),
            ...list(article?.lang),
            ...list(metadata.languages)
        ].map(languageCode).filter(Boolean);
        return [...new Set(values)];
    };

    const articleOrigins = article => {
        const metadata = metadataFor(article);
        return [...new Set([
            ...list(article?.originRegion),
            ...list(article?.originCountry),
            ...list(article?.originCountryCode),
            ...list(metadata.originRegion),
            ...list(metadata.originCountry),
            ...list(metadata.originCountryCode)
        ])];
    };

    const selected = () => ({
        language: document?.getElementById?.('source-language-filter')?.value || '',
        origin: document?.getElementById?.('source-origin-filter')?.value || ''
    });

    const matches = (article, override = null) => {
        const filters = override || selected();
        const language = languageCode(filters.language);
        const origin = String(filters.origin || '').trim().toLocaleLowerCase();

        if (language && !articleLanguages(article).includes(language)) return false;
        if (origin && !articleOrigins(article).some(value => value.toLocaleLowerCase() === origin)) return false;
        return true;
    };

    const sourceRows = data => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.sources)) return data.sources;
        return [];
    };

    const setRegistry = data => {
        state.sources = sourceRows(data).filter(item => item && typeof item === 'object');
        state.byName.clear();
        state.byUrl.clear();

        state.sources.forEach(item => {
            const name = sourceNameKey(item.name || item.sourceName || '');
            const url = canonicalUrl(item.url || item.feedUrl || item.homepage || '');
            if (name) state.byName.set(name, item);
            if (url) state.byUrl.set(url, item);
        });

        state.loaded = true;
        populate();
        window.applyFilters?.();
    };

    const option = (value, label) => {
        const node = document.createElement('option');
        node.value = value;
        node.textContent = label;
        return node;
    };

    const replaceOptions = (select, firstLabel, values, saved) => {
        if (!select) return;
        select.replaceChildren(option('', firstLabel));
        values.forEach(([value, label]) => select.appendChild(option(value, label)));
        if ([...select.options].some(item => item.value === saved)) select.value = saved;
    };

    function populate() {
        if (typeof document === 'undefined') return;
        const labels = text();
        const languageSelect = document.getElementById('source-language-filter');
        const originSelect = document.getElementById('source-origin-filter');
        if (!languageSelect || !originSelect) return;

        const languages = [...new Set(state.sources.flatMap(item => list(item.languages || item.language).map(languageCode)).filter(Boolean))]
            .sort((a, b) => (LANGUAGE_NAMES[a] || a).localeCompare(LANGUAGE_NAMES[b] || b));
        const origins = [...new Set(state.sources.flatMap(item => [
            ...list(item.originRegion),
            ...list(item.originCountry)
        ]))].sort((a, b) => a.localeCompare(b));

        const savedLanguage = languageSelect.value || localStorage.getItem(STORAGE_LANGUAGE) || '';
        const savedOrigin = originSelect.value || localStorage.getItem(STORAGE_ORIGIN) || '';
        replaceOptions(languageSelect, labels.allLanguages, languages.map(code => [code, LANGUAGE_NAMES[code] || code.toUpperCase()]), savedLanguage);
        replaceOptions(originSelect, labels.allOrigins, origins.map(value => [value, value]), savedOrigin);
        languageSelect.setAttribute('aria-label', labels.language);
        originSelect.setAttribute('aria-label', labels.origin);
    }

    const loadRegistry = async () => {
        const url = window.WRN_CONFIG?.dataUrls?.sourceCatalog || './sources-registry.json';
        try {
            const separator = url.includes('?') ? '&' : '?';
            const response = await fetch(`${url}${separator}filters=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setRegistry(await response.json());
        } catch (error) {
            console.warn('Quellenregister für Filter nicht erreichbar:', error);
            setRegistry({ sources: [] });
        }
    };

    const persistAndApply = () => {
        const filters = selected();
        localStorage.setItem(STORAGE_LANGUAGE, filters.language);
        localStorage.setItem(STORAGE_ORIGIN, filters.origin);
        window.applyFilters?.();
    };

    const init = () => {
        const languageSelect = document.getElementById('source-language-filter');
        const originSelect = document.getElementById('source-origin-filter');
        if (!languageSelect || !originSelect) return;
        languageSelect.addEventListener('change', persistAndApply);
        originSelect.addEventListener('change', persistAndApply);
        document.getElementById('ui-language')?.addEventListener('change', populate);
        populate();
        void loadRegistry();
    };

    window.WRNSourceFilters = Object.freeze({
        articleLanguages,
        articleOrigins,
        matches,
        populate,
        setRegistry,
        sources: () => state.sources.map(item => ({ ...item })),
        loaded: () => state.loaded
    });

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    }
})();
