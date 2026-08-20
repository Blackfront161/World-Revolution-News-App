/* World Revolution News 1.8.2 – Quellenprüfung mit Sprach- und Herkunftsfiltern */
'use strict';

(() => {
    if (window.WRNSourceVerification) return;

    const config = window.WRN_CONFIG || {};
    const urls = config.dataUrls || {};

    const state = {
        rows: [],
        filter: 'all',
        search: '',
        language: 'all',
        origin: 'all',
        loadedAt: '',
        loading: false,
        summary: {
            total: 0,
            ok: 0,
            warning: 0,
            error: 0,
            unknown: 0
        }
    };

    const TEXT = {
        de: { title:'Quellenprüfung', open:'Quellenprüfung', refresh:'Neu prüfen', close:'Schließen', search:'Quelle suchen …', all:'Alle', ok:'Erreichbar', warning:'Eingeschränkt', error:'Defekt', unknown:'Nicht geprüft', total:'Quellen', empty:'Keine passenden Quellen gefunden.', loading:'Quellen werden geprüft …', updated:'Geprüft', news:'Nachrichten', podcast:'Podcasts', radio:'Radio', catalog:'Katalog', unavailable:'Statusdatei nicht erreichbar', limited:'Aus Leistungsgründen werden höchstens 300 Einträge angezeigt.', pending:'Prüfung ausstehend' },
        en: { title:'Source verification', open:'Source verification', refresh:'Check again', close:'Close', search:'Search sources …', all:'All', ok:'Available', warning:'Limited', error:'Broken', unknown:'Not checked', total:'Sources', empty:'No matching sources found.', loading:'Checking sources …', updated:'Checked', news:'News', podcast:'Podcasts', radio:'Radio', catalog:'Catalog', unavailable:'Status file unavailable', limited:'For performance, no more than 300 entries are shown.', pending:'Check pending' },
        es: { title:'Verificación de fuentes', open:'Verificación de fuentes', refresh:'Comprobar de nuevo', close:'Cerrar', search:'Buscar fuente …', all:'Todas', ok:'Disponible', warning:'Limitada', error:'Defectuosa', unknown:'No comprobada', total:'Fuentes', empty:'No se encontraron fuentes.', loading:'Comprobando fuentes …', updated:'Comprobado', news:'Noticias', podcast:'Pódcasts', radio:'Radio', catalog:'Catálogo', unavailable:'Archivo de estado no disponible', limited:'Por rendimiento se muestran como máximo 300 entradas.', pending:'Comprobación pendiente' },
        fr: { title:'Vérification des sources', open:'Vérification des sources', refresh:'Vérifier à nouveau', close:'Fermer', search:'Rechercher une source …', all:'Toutes', ok:'Disponible', warning:'Limitée', error:'Défectueuse', unknown:'Non vérifiée', total:'Sources', empty:'Aucune source correspondante.', loading:'Vérification des sources …', updated:'Vérifié', news:'Actualités', podcast:'Podcasts', radio:'Radio', catalog:'Catalogue', unavailable:'Fichier d’état indisponible', limited:'Pour les performances, 300 entrées maximum sont affichées.', pending:'Vérification en attente' },
        it: { title:'Verifica delle fonti', open:'Verifica delle fonti', refresh:'Controlla di nuovo', close:'Chiudi', search:'Cerca fonte …', all:'Tutte', ok:'Disponibile', warning:'Limitata', error:'Non funzionante', unknown:'Non verificata', total:'Fonti', empty:'Nessuna fonte corrispondente.', loading:'Verifica delle fonti …', updated:'Verificato', news:'Notizie', podcast:'Podcast', radio:'Radio', catalog:'Catalogo', unavailable:'File di stato non disponibile', limited:'Per le prestazioni vengono mostrate al massimo 300 voci.', pending:'Verifica in attesa' },
        pt: { title:'Verificação de fontes', open:'Verificação de fontes', refresh:'Verificar novamente', close:'Fechar', search:'Pesquisar fonte …', all:'Todas', ok:'Disponível', warning:'Limitada', error:'Com defeito', unknown:'Não verificada', total:'Fontes', empty:'Nenhuma fonte correspondente.', loading:'A verificar fontes …', updated:'Verificado', news:'Notícias', podcast:'Podcasts', radio:'Rádio', catalog:'Catálogo', unavailable:'Ficheiro de estado indisponível', limited:'Por desempenho são mostradas no máximo 300 entradas.', pending:'Verificação pendente' },
        ru: { title:'Проверка источников', open:'Проверка источников', refresh:'Проверить снова', close:'Закрыть', search:'Поиск источника …', all:'Все', ok:'Доступен', warning:'Ограничен', error:'Не работает', unknown:'Не проверен', total:'Источники', empty:'Подходящих источников нет.', loading:'Проверка источников …', updated:'Проверено', news:'Новости', podcast:'Подкасты', radio:'Радио', catalog:'Каталог', unavailable:'Файл состояния недоступен', limited:'Для производительности показывается не более 300 записей.', pending:'Проверка ожидается' },
        el: { title:'Έλεγχος πηγών', open:'Έλεγχος πηγών', refresh:'Νέος έλεγχος', close:'Κλείσιμο', search:'Αναζήτηση πηγής …', all:'Όλες', ok:'Διαθέσιμη', warning:'Περιορισμένη', error:'Ελαττωματική', unknown:'Δεν ελέγχθηκε', total:'Πηγές', empty:'Δεν βρέθηκαν αντίστοιχες πηγές.', loading:'Έλεγχος πηγών …', updated:'Ελέγχθηκε', news:'Ειδήσεις', podcast:'Podcast', radio:'Ραδιόφωνο', catalog:'Κατάλογος', unavailable:'Το αρχείο κατάστασης δεν είναι διαθέσιμο', limited:'Για λόγους απόδοσης εμφανίζονται έως 300 εγγραφές.', pending:'Ο έλεγχος εκκρεμεί' },
        tr: { title:'Kaynak doğrulama', open:'Kaynak doğrulama', refresh:'Tekrar kontrol et', close:'Kapat', search:'Kaynak ara …', all:'Tümü', ok:'Erişilebilir', warning:'Sınırlı', error:'Bozuk', unknown:'Kontrol edilmedi', total:'Kaynaklar', empty:'Eşleşen kaynak bulunamadı.', loading:'Kaynaklar kontrol ediliyor …', updated:'Kontrol edildi', news:'Haberler', podcast:'Podcastler', radio:'Radyo', catalog:'Katalog', unavailable:'Durum dosyasına erişilemiyor', limited:'Performans için en fazla 300 kayıt gösterilir.', pending:'Kontrol bekliyor' }
    };

    const DIMENSION_TEXT = {
        de: { language:'Sprache', origin:'Herkunft', allLanguages:'Alle Sprachen', allOrigins:'Alle Herkunftsorte' },
        en: { language:'Language', origin:'Origin', allLanguages:'All languages', allOrigins:'All origins' },
        es: { language:'Idioma', origin:'Origen', allLanguages:'Todos los idiomas', allOrigins:'Todos los orígenes' },
        fr: { language:'Langue', origin:'Origine', allLanguages:'Toutes les langues', allOrigins:'Toutes les origines' },
        it: { language:'Lingua', origin:'Origine', allLanguages:'Tutte le lingue', allOrigins:'Tutte le origini' },
        pt: { language:'Idioma', origin:'Origem', allLanguages:'Todos os idiomas', allOrigins:'Todas as origens' },
        ru: { language:'Язык', origin:'Происхождение', allLanguages:'Все языки', allOrigins:'Все регионы происхождения' },
        el: { language:'Γλώσσα', origin:'Προέλευση', allLanguages:'Όλες οι γλώσσες', allOrigins:'Όλες οι προελεύσεις' },
        tr: { language:'Dil', origin:'Köken', allLanguages:'Tüm diller', allOrigins:'Tüm kökenler' }
    };

    const language = () => {
        const raw = window.WRNI18n?.currentLanguage?.()
            || document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || 'en';
        const code = String(raw).toLowerCase().split(/[-_]/)[0];
        return TEXT[code] ? code : 'en';
    };

    const t = () => TEXT[language()] || TEXT.en;
    const dimensionText = () => DIMENSION_TEXT[language()] || DIMENSION_TEXT.en;

    const list = value => {
        const values = Array.isArray(value) ? value : value ? [value] : [];
        return [...new Set(values.map(item => String(item || '').trim()).filter(Boolean))];
    };

    const languagesOf = item => list(
        item.languages || item.language || item.lang
    ).map(value => value.toLowerCase().split(/[-_]/)[0]);

    const originsOf = item => [...new Set([
        ...list(item.originRegion),
        ...list(item.originCountry),
        ...list(item.originCountryCode)
    ])];

    const escapeHtml = value => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const timeoutFetch = async (url, milliseconds = 9000) => {
        const controller = new AbortController();
        const timer = window.setTimeout(
            () => controller.abort(),
            milliseconds
        );

        try {
            const separator = url.includes('?') ? '&' : '?';
            const response = await fetch(
                `${url}${separator}verify=${Date.now()}`,
                {
                    cache: 'no-store',
                    headers: { Accept: 'application/json' },
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            return await response.json();
        } finally {
            window.clearTimeout(timer);
        }
    };

    const asArray = data => {
        if (Array.isArray(data)) return data;

        if (!data || typeof data !== 'object') return [];

        for (const key of [
            'sources',
            'items',
            'results',
            'entries',
            'checks'
        ]) {
            if (Array.isArray(data[key])) return data[key];
        }

        return Object.entries(data)
            .filter(([, value]) => value && typeof value === 'object')
            .map(([key, value]) => ({
                __key: key,
                ...value
            }));
    };

    const statusOf = item => {
        const raw = String(
            item.status
            || item.state
            || item.result
            || item.health
            || item.audioStatus
            || ''
        ).toLowerCase();

        const message = String(
            item.error
            || item.warning
            || item.message
            || item.reason
            || item.detail
            || item.audioDetail
            || ''
        ).toLowerCase();

        const combined = `${raw} ${message}`;

        const httpStatus = Number(
            item.httpStatus
            || item.statusCode
            || item.code
            || 0
        );

        const pendingCheck = (
            combined.includes('prüfung wird beim nächsten')
            || combined.includes('check pending')
            || combined.includes('not checked')
            || combined.includes('noch nicht geprüft')
            || combined.includes('keine audio-adresse')
            || combined.includes('no audio address')
        );

        if (pendingCheck && !httpStatus) return 'unknown';

        if (
            item.ok === true
            || ['ok', 'online', 'success', 'healthy', 'available', 'playable']
                .includes(raw)
            || (
                httpStatus >= 200
                && httpStatus < 400
                && !combined.includes('certificate')
                && !combined.includes('tls')
            )
        ) {
            return 'ok';
        }

        if (
            raw.includes('warn')
            || raw.includes('limited')
            || raw.includes('restricted')
            || raw.includes('partial')
            || raw.includes('slow')
            || raw.includes('redirect')
            || raw.includes('blocked')
            || raw.includes('timeout')
            || raw.includes('rate')
            || combined.includes('certificate')
            || combined.includes('tls')
            || combined.includes('ssl')
            || combined.includes('timeout')
            || combined.includes('tempor')
            || combined.includes('max retries')
            || [401, 403, 408, 429].includes(httpStatus)
            || httpStatus >= 500
        ) {
            return 'warning';
        }

        if (
            raw.includes('error')
            || raw.includes('broken')
            || raw.includes('fail')
            || raw.includes('offline')
            || combined.includes('not found')
            || combined.includes('name resolution')
            || combined.includes('dns')
            || combined.includes('no feed')
            || combined.includes('invalid feed')
            || [404, 410].includes(httpStatus)
        ) {
            return 'error';
        }

        if (
            raw.includes('unknown')
            || combined.includes('keine technische feed-adresse')
            || combined.includes('nicht als defekt gewertet')
            || combined.includes('not checked')
        ) {
            return 'unknown';
        }

        if (item.ok === false) return 'warning';

        return 'unknown';
    };

    const nameOf = (item, fallback = '') => String(
        item.name
        || item.sourceName
        || item.source
        || item.quelleName
        || item.title
        || item.label
        || item.__key
        || fallback
        || 'Unbekannte Quelle'
    ).trim();

    const urlOf = item => {
        const candidates = Array.isArray(item.streamCandidates)
            ? item.streamCandidates
            : [];
        return String(
            item.url
            || item.feedUrl
            || item.feed
            || item.link
            || item.homepage
            || item.website
            || item.workingStream
            || candidates[0]
            || ''
        ).trim();
    };

    const detailOf = item => {
        const parts = [];

        const httpStatus = Number(
            item.httpStatus
            || item.statusCode
            || item.code
            || 0
        );

        if (httpStatus) parts.push(`HTTP ${httpStatus}`);

        const message = String(
            item.error
            || item.warning
            || item.message
            || item.reason
            || item.detail
            || item.audioDetail
            || ''
        ).trim();

        if (message) parts.push(message.slice(0, 240));

        const date = String(
            item.checkedAt
            || item.updatedAt
            || item.lastCheck
            || ''
        ).trim();

        if (date) parts.push(date);

        return parts.join(' · ');
    };

    const normalize = (data, kind, fallbackStatus = 'unknown') =>
        asArray(data).map((item, index) => {
            const source = item && typeof item === 'object'
                ? item
                : { name: String(item || '') };

            const derived = statusOf(source);

            return {
                id: `${kind}-${index}-${nameOf(source, index)}`,
                kind,
                name: nameOf(source, `${kind} ${index + 1}`),
                url: urlOf(source),
                status: derived === 'unknown'
                    ? fallbackStatus
                    : derived,
                detail: detailOf(source),
                languages: languagesOf(source),
                origins: originsOf(source)
            };
        });

    const normalizeRadioCatalog = data =>
        asArray(data).map((item, index) => ({
            id: `radio-catalog-${index}-${nameOf(item, index)}`,
            kind: 'radio',
            name: nameOf(item, `Radio ${index + 1}`),
            url: urlOf(item),
            status: 'unknown',
            detail: Array.isArray(item.streamCandidates) && item.streamCandidates.length
                ? `${t().pending} · ${item.streamCandidates.length} Stream-Adresse(n)`
                : t().pending,
            languages: languagesOf(item),
            origins: originsOf(item)
        }));

    const canonicalUrl = value => {
        const raw = String(value || '').trim();

        if (!raw) return '';

        try {
            const url = new URL(raw);
            const host = url.hostname
                .toLowerCase()
                .replace(/^www\./, '');

            const path = url.pathname
                .replace(/\/+/g, '/')
                .replace(/\/$/, '') || '/';

            const params = [...url.searchParams.entries()]
                .sort(([a], [b]) => a.localeCompare(b));

            const query = new URLSearchParams(params).toString();

            return `${host}${path}${query ? `?${query}` : ''}`;
        } catch {
            return raw
                .toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '');
        }
    };

    const canonicalName = value => String(value || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/[^a-z0-9]+/g, '');

    const dedupeRows = rows => {
        const byKey = new Map();

        rows.forEach(row => {
            const urlKey = canonicalUrl(row.url);
            const nameKey = canonicalName(row.name);
            const kindKey = String(row.kind || 'source').toLowerCase();
            const key = `${kindKey}:${nameKey || urlKey || row.id}`;

            if (!byKey.has(key)) {
                byKey.set(key, { ...row });
                return;
            }

            const current = byKey.get(key);
            const priority = {
                ok: 4,
                warning: 3,
                error: 2,
                unknown: 1
            };

            if (
                (priority[row.status] || 0)
                > (priority[current.status] || 0)
            ) {
                current.status = row.status;
            }

            if (!current.url && row.url) {
                current.url = row.url;
            }

            if (
                row.detail
                && !String(current.detail || '')
                    .includes(row.detail)
            ) {
                current.detail = [
                    current.detail,
                    row.detail
                ].filter(Boolean).join(' · ');
            }

            current.languages = [...new Set([
                ...list(current.languages),
                ...list(row.languages)
            ])];
            current.origins = [...new Set([
                ...list(current.origins),
                ...list(row.origins)
            ])];
        });

        return [...byKey.values()];
    };

    const mergeCatalog = (catalogRows, healthRows) => {
        const healthByUrl = new Map();
        const healthByName = new Map();

        dedupeRows(healthRows).forEach(row => {
            const urlKey = canonicalUrl(row.url);
            const nameKey = canonicalName(row.name);

            if (urlKey) healthByUrl.set(urlKey, row);
            if (nameKey) healthByName.set(nameKey, row);
        });

        const merged = [];

        dedupeRows(catalogRows).forEach(catalog => {
            const urlKey = canonicalUrl(catalog.url);
            const nameKey = canonicalName(catalog.name);

            const health = (
                (urlKey && healthByUrl.get(urlKey))
                || (nameKey && healthByName.get(nameKey))
            );

            if (health) {
                merged.push({
                    ...catalog,
                    ...health,
                    name: health.name || catalog.name,
                    url: health.url || catalog.url,
                    languages: [...new Set([
                        ...list(catalog.languages),
                        ...list(health.languages)
                    ])],
                    origins: [...new Set([
                        ...list(catalog.origins),
                        ...list(health.origins)
                    ])]
                });

                if (urlKey) healthByUrl.delete(urlKey);
                if (nameKey) healthByName.delete(nameKey);
            } else {
                merged.push(catalog);
            }
        });

        const leftovers = dedupeRows([
            ...healthByUrl.values(),
            ...healthByName.values()
        ]);

        return dedupeRows([
            ...merged,
            ...leftovers
        ]);
    };


    const preferVerifiedAudio = (legacyRows, verifiedRows) => {
        const verified = new Map();

        dedupeRows(verifiedRows).forEach(row => {
            verified.set(canonicalName(row.name), row);
        });

        const archived = new Set([
            'commonvoices',
            'badnewsaradionetwork',
            'badnews'
        ]);

        const merged = dedupeRows(legacyRows)
            .filter(row => !archived.has(canonicalName(row.name)))
            .map(row => {
                const replacement = verified.get(
                    canonicalName(row.name)
                );

                if (!replacement) return row;

                verified.delete(canonicalName(row.name));

                return {
                    ...row,
                    ...replacement,
                    name: row.name || replacement.name,
                    url: replacement.url || row.url,
                    detail: replacement.detail || row.detail
                };
            });

        return dedupeRows([
            ...merged,
            ...verified.values()
        ]);
    };

    const summarize = rows => {
        const result = {
            total: rows.length,
            ok: 0,
            warning: 0,
            error: 0,
            unknown: 0
        };

        rows.forEach(row => {
            if (result[row.status] === undefined) {
                result.unknown += 1;
            } else {
                result[row.status] += 1;
            }
        });

        return result;
    };

    const ensureModal = () => {
        let modal = document.getElementById(
            'wrn-source-verification-modal'
        );

        if (modal) return modal;

        const overlay = document.createElement('div');
        overlay.id = 'wrn-source-verification-overlay';
        overlay.className = 'wrn-source-verification-overlay';
        overlay.hidden = true;

        modal = document.createElement('section');
        modal.id = 'wrn-source-verification-modal';
        modal.className = 'wrn-source-verification-modal';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute(
            'aria-labelledby',
            'wrn-source-verification-title'
        );

        modal.innerHTML = `
            <div class="wrn-source-verification-head">
                <div>
                    <h2 id="wrn-source-verification-title"></h2>
                    <p id="wrn-source-verification-updated"></p>
                </div>
                <button
                    type="button"
                    class="wrn-source-close"
                    data-source-action="close"
                >×</button>
            </div>

            <div
                class="wrn-source-summary"
                id="wrn-source-summary"
            ></div>

            <div class="wrn-source-controls">
                <input
                    type="search"
                    id="wrn-source-search"
                    autocomplete="off"
                >
                <div
                    class="wrn-source-filter-row"
                    id="wrn-source-filter-row"
                ></div>
                <div class="wrn-source-dimension-row">
                    <label>
                        <span id="wrn-source-language-label"></span>
                        <select id="wrn-source-language-filter"></select>
                    </label>
                    <label>
                        <span id="wrn-source-origin-label"></span>
                        <select id="wrn-source-origin-filter"></select>
                    </label>
                </div>
            </div>

            <div
                id="wrn-source-status"
                class="wrn-source-status"
                aria-live="polite"
            ></div>

            <div
                id="wrn-source-list"
                class="wrn-source-list"
            ></div>

            <div class="wrn-source-footer">
                <small id="wrn-source-limit-note"></small>
                <div>
                    <button
                        type="button"
                        data-source-action="refresh"
                    ></button>
                    <button
                        type="button"
                        data-source-action="close"
                    ></button>
                </div>
            </div>
        `;

        document.body.append(overlay, modal);

        overlay.addEventListener('click', close);

        modal.addEventListener('click', event => {
            const button = event.target.closest(
                '[data-source-action]'
            );

            if (!button) return;

            if (button.dataset.sourceAction === 'close') close();
            if (button.dataset.sourceAction === 'refresh') {
                void refresh();
            }

            const filter = button.dataset.sourceFilter;
            if (filter) {
                state.filter = filter;
                render();
            }
        });

        modal.querySelector('#wrn-source-search')
            ?.addEventListener('input', event => {
                state.search = String(event.target.value || '')
                    .trim()
                    .toLowerCase();
                renderList();
            });

        modal.querySelector('#wrn-source-language-filter')
            ?.addEventListener('change', event => {
                state.language = String(event.target.value || 'all');
                renderList();
            });

        modal.querySelector('#wrn-source-origin-filter')
            ?.addEventListener('change', event => {
                state.origin = String(event.target.value || 'all');
                renderList();
            });

        return modal;
    };

    const insertButton = () => {
        const existing = document.getElementById('wrn-source-verification-open');
        const target = document.querySelector('.wrn-more-admin-tools-184')
            || document.querySelector('.wrn-more-grid');

        if (existing) {
            if (target && existing.parentElement !== target) {
                target.appendChild(existing);
            }
            existing.hidden = !target;
            return Boolean(target);
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'wrn-source-verification-open';
        button.className = 'wrn-source-verification-open';
        button.textContent = t().open;
        button.addEventListener('click', open);

        if (target) {
            target.appendChild(button);
            return true;
        }

        button.hidden = true;
        document.body.appendChild(button);
        return false;
    };

    const renderSummary = () => {
        const labels = t();
        const summary = state.summary;
        const node = document.getElementById('wrn-source-summary');

        if (!node) return;

        node.innerHTML = [
            ['total', labels.total, summary.total],
            ['ok', labels.ok, summary.ok],
            ['warning', labels.warning, summary.warning],
            ['error', labels.error, summary.error],
            ['unknown', labels.unknown, summary.unknown]
        ].map(([kind, label, value]) => `
            <div class="wrn-source-metric" data-state="${kind}">
                <span>${escapeHtml(label)}</span>
                <strong>${Number(value) || 0}</strong>
            </div>
        `).join('');
    };

    const renderFilters = () => {
        const labels = t();
        const node = document.getElementById(
            'wrn-source-filter-row'
        );

        if (!node) return;

        const filters = [
            ['all', labels.all],
            ['ok', labels.ok],
            ['warning', labels.warning],
            ['error', labels.error],
            ['unknown', labels.unknown]
        ];

        node.innerHTML = filters.map(([key, label]) => `
            <button
                type="button"
                data-source-filter="${key}"
                class="${state.filter === key ? 'active' : ''}"
            >${escapeHtml(label)}</button>
        `).join('');
    };

    const renderDimensionFilters = () => {
        const labels = dimensionText();
        const languageSelect = document.getElementById('wrn-source-language-filter');
        const originSelect = document.getElementById('wrn-source-origin-filter');
        if (!languageSelect || !originSelect) return;

        const languages = [...new Set(
            state.rows.flatMap(row => list(row.languages))
        )].sort();
        const origins = [...new Set(
            state.rows.flatMap(row => list(row.origins))
        )].sort((a, b) => a.localeCompare(b));

        const languageValue = languages.includes(state.language) ? state.language : 'all';
        const originValue = origins.includes(state.origin) ? state.origin : 'all';
        state.language = languageValue;
        state.origin = originValue;
        languageSelect.innerHTML = [
            `<option value="all">${escapeHtml(labels.allLanguages)}</option>`,
            ...languages.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value.toUpperCase())}</option>`)
        ].join('');
        originSelect.innerHTML = [
            `<option value="all">${escapeHtml(labels.allOrigins)}</option>`,
            ...origins.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        ].join('');

        if ([...languageSelect.options].some(option => option.value === languageValue)) languageSelect.value = languageValue;
        if ([...originSelect.options].some(option => option.value === originValue)) originSelect.value = originValue;
        document.getElementById('wrn-source-language-label').textContent = labels.language;
        document.getElementById('wrn-source-origin-label').textContent = labels.origin;
    };

    const visibleRows = () => {
        const search = state.search;

        return state.rows.filter(row => {
            if (
                state.filter !== 'all'
                && row.status !== state.filter
            ) {
                return false;
            }

            if (
                state.language !== 'all'
                && !list(row.languages).includes(state.language)
            ) return false;

            if (
                state.origin !== 'all'
                && !list(row.origins).includes(state.origin)
            ) return false;

            if (!search) return true;

            return [
                row.name,
                row.url,
                row.detail,
                row.kind,
                ...list(row.languages),
                ...list(row.origins)
            ].some(value => String(value || '')
                .toLowerCase()
                .includes(search));
        });
    };

    const renderList = () => {
        const labels = t();
        const node = document.getElementById('wrn-source-list');

        if (!node) return;

        const rows = visibleRows().slice(0, 300);

        if (!rows.length) {
            node.innerHTML = `
                <p class="wrn-source-empty">
                    ${escapeHtml(labels.empty)}
                </p>
            `;
            return;
        }

        node.innerHTML = rows.map(row => `
            <article
                class="wrn-source-row"
                data-state="${escapeHtml(row.status)}"
            >
                <div class="wrn-source-row-main">
                    <strong>${escapeHtml(row.name)}</strong>
                    <span>
                        ${escapeHtml(
                            row.kind === 'podcast'
                                ? labels.podcast
                                : row.kind === 'radio'
                                    ? labels.radio
                                    : row.kind === 'catalog'
                                        ? labels.catalog
                                        : labels.news
                        )}
                    </span>
                    ${(row.languages?.length || row.origins?.length) ? `
                        <small class="wrn-source-meta">
                            ${escapeHtml([
                                ...list(row.languages).map(value => value.toUpperCase()),
                                ...list(row.origins)
                            ].join(' · '))}
                        </small>
                    ` : ''}
                </div>

                <span class="wrn-source-badge">
                    ${escapeHtml(labels[row.status] || labels.unknown)}
                </span>

                ${row.detail ? `
                    <p>${escapeHtml(row.detail)}</p>
                ` : ''}

                ${row.url ? `
                    <a
                        href="${escapeHtml(row.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >${escapeHtml(row.url)}</a>
                ` : ''}
            </article>
        `).join('');
    };

    const render = () => {
        const labels = t();
        const modal = ensureModal();

        modal.querySelector('#wrn-source-verification-title')
            .textContent = labels.title;

        modal.querySelector('#wrn-source-verification-updated')
            .textContent = state.loadedAt
                ? `${labels.updated}: ${state.loadedAt}`
                : '';

        const search = modal.querySelector('#wrn-source-search');
        search.placeholder = labels.search;

        modal.querySelector('#wrn-source-limit-note')
            .textContent = labels.limited;

        modal.querySelectorAll('[data-source-action="refresh"]')
            .forEach(button => {
                button.textContent = labels.refresh;
            });

        modal.querySelectorAll('[data-source-action="close"]')
            .forEach(button => {
                if (!button.classList.contains('wrn-source-close')) {
                    button.textContent = labels.close;
                }
            });

        renderSummary();
        renderFilters();
        renderDimensionFilters();
        renderList();
    };

    async function refresh() {
        if (state.loading) return;

        state.loading = true;
        ensureModal();

        const status = document.getElementById('wrn-source-status');
        if (status) status.textContent = t().loading;

        const endpoints = [
            ['news', urls.sourceHealth],
            ['catalog', urls.sourceCatalog],
            ['podcast', urls.podcastHealth],
            ['radio', urls.radioHealth],
            ['radioCatalog', urls.radio],
            ['audio', urls.audioHealth]
        ].filter(([, url]) => Boolean(url));

        const settled = await Promise.allSettled(
            endpoints.map(async ([kind, url]) => ({
                kind,
                data: await timeoutFetch(url)
            }))
        );

        const grouped = {
            news: [],
            catalog: [],
            podcast: [],
            radio: [],
            radioCatalog: [],
            audioPodcast: [],
            audioRadio: []
        };

        settled.forEach((result, index) => {
            const kind = endpoints[index][0];

            if (result.status === 'fulfilled') {
                if (kind === 'audio') {
                    grouped.audioPodcast = normalize(
                        result.value.data?.podcasts?.checks || [],
                        'podcast',
                        'unknown'
                    );
                    grouped.audioRadio = normalize(
                        result.value.data?.radio?.checks || [],
                        'radio',
                        'unknown'
                    );
                } else if (kind === 'radioCatalog') {
                    grouped.radioCatalog = normalizeRadioCatalog(result.value.data);
                } else {
                    grouped[kind] = normalize(
                        result.value.data,
                        kind,
                        'unknown'
                    );
                }
            } else if (kind !== 'audio' && kind !== 'radioCatalog') {
                grouped[kind] = [{
                    id: `${kind}-unavailable`,
                    kind,
                    name: t().unavailable,
                    url: endpoints[index][1],
                    status: 'warning',
                    detail: String(
                        result.reason?.message || result.reason
                    )
                }];
            }
        });

        const news = mergeCatalog(
            grouped.catalog,
            grouped.news
        );

        const podcasts = preferVerifiedAudio(
            grouped.podcast,
            grouped.audioPodcast
        );
        const radios = mergeCatalog(
            grouped.radioCatalog,
            preferVerifiedAudio(
                grouped.radio,
                grouped.audioRadio
            )
        );

        state.rows = dedupeRows([
            ...news,
            ...podcasts,
            ...radios
        ]).sort((a, b) => {
            const priority = {
                error: 0,
                warning: 1,
                unknown: 2,
                ok: 3
            };

            return (
                priority[a.status] - priority[b.status]
                || a.name.localeCompare(b.name)
            );
        });

        state.summary = summarize(state.rows);
        state.loadedAt = new Intl.DateTimeFormat(
            language() === 'de' ? 'de-DE' : 'en-GB',
            {
                dateStyle: 'medium',
                timeStyle: 'short'
            }
        ).format(new Date());

        state.loading = false;

        if (status) status.textContent = '';
        render();
    }

    function open() {
        const modal = ensureModal();
        const overlay = document.getElementById(
            'wrn-source-verification-overlay'
        );

        modal.hidden = false;
        overlay.hidden = false;
        document.documentElement.classList.add(
            'wrn-source-modal-open'
        );

        render();

        if (!state.loadedAt && !state.loading) {
            void refresh();
        }
    }

    function close() {
        const modal = document.getElementById(
            'wrn-source-verification-modal'
        );
        const overlay = document.getElementById(
            'wrn-source-verification-overlay'
        );

        if (modal) modal.hidden = true;
        if (overlay) overlay.hidden = true;

        document.documentElement.classList.remove(
            'wrn-source-modal-open'
        );
    }

    function init() {
        ensureModal();
        insertButton();

        /*
         * Die neue Navigation erzeugt das Mehr-Menü teilweise erst nach
         * diesem Modul. Deshalb auch dann kurz weiterprüfen, wenn der
         * Übergangsbutton bereits im Header angelegt werden konnte.
         */
        let attempts = 0;
        const timer = window.setInterval(() => {
            attempts += 1;
            insertButton();

            const button = document.getElementById(
                'wrn-source-verification-open'
            );
            const target = document.querySelector('.wrn-more-admin-tools-184')
                || document.querySelector('.wrn-more-grid');

            if (
                (button && target && button.parentElement === target)
                || attempts >= 30
            ) {
                window.clearInterval(timer);
            }
        }, 250);

        document.getElementById('ui-language')
            ?.addEventListener('change', () => {
                const button = document.getElementById(
                    'wrn-source-verification-open'
                );
                if (button) button.textContent = t().open;
                render();
            });
    }

    window.WRNSourceVerification = Object.freeze({
        open,
        close,
        refresh,
        summary: () => ({ ...state.summary }),
        rows: () => state.rows.map(row => ({ ...row }))
    });

    window.openSourceVerification = open;

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
