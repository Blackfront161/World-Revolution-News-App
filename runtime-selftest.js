/* World Revolution News 2.1.1 – read-only runtime self-test */
'use strict';

(() => {
    if (window.WRNRuntimeSelfTest) return;

    const EXPECTED_VERSION = '2.1.1';
    const TEMP_STORAGE_KEY = '__wrn_runtime_selftest_183__';
    const SUPPORTED_LANGUAGES = Object.freeze([
        'en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr'
    ]);
    const MODULES = Object.freeze([
        'WRNVideoHub',
        'WRNAudioTab183',
        'WRNInterfaceBlock3',
        'WRNSourceRecoveryUI183',
        'WRNSourceVerification',
        'WRNActionRadar',
        'WRNEditorialReview',
        'WRNSourceHealthFreshness'
    ]);

    const TEXTS = Object.freeze({
        en: Object.freeze({
            button:'App self-test', title:'WRN 2.1.1 app self-test',
            subtitle:'Read-only checks for this device and app instance.',
            run:'Run again', copy:'Copy report', close:'Close',
            running:'Checks are running…', copied:'Report copied.',
            copyFailed:'The report could not be copied.',
            pass:'Passed', warn:'Warnings', fail:'Errors', total:'Total',
            version:'App version', build:'Build identifier', navigation:'Navigation',
            pointer:'Pointer and controls', storage:'Local storage',
            swSupport:'Service worker support', swRegistration:'Service worker registration',
            swControl:'Service worker control', manifest:'Web app manifest',
            news:'News', events:'Events', podcasts:'Original podcasts',
            generatedPodcasts:'Generated podcasts', radio:'Live radio',
            sourceHealth:'Source status', recovery:'Source recovery data',
            entries:'entries', loaded:'loaded', missing:'missing',
            available:'available', unavailable:'unavailable',
            supported:'supported', unsupported:'not supported',
            registered:'registered', notRegistered:'not registered',
            controlled:'controls this page', notControlled:'does not control this page yet',
            online:'online', offline:'offline',
            offlineHint:'Offline: network checks are reported as warnings.'
        }),
        de: Object.freeze({
            button:'App-Selbsttest', title:'WRN 2.1.1 App-Selbsttest',
            subtitle:'Rein lesende Prüfungen für dieses Gerät und diese App-Instanz.',
            run:'Erneut prüfen', copy:'Bericht kopieren', close:'Schließen',
            running:'Prüfung läuft…', copied:'Bericht kopiert.',
            copyFailed:'Der Bericht konnte nicht kopiert werden.',
            pass:'Bestanden', warn:'Hinweise', fail:'Fehler', total:'Gesamt',
            version:'App-Version', build:'Build-Kennung', navigation:'Navigation',
            pointer:'Pointer und Bedienbarkeit', storage:'Lokaler Speicher',
            swSupport:'Service-Worker-Unterstützung', swRegistration:'Service-Worker-Registrierung',
            swControl:'Service-Worker-Kontrolle', manifest:'Web-App-Manifest',
            news:'Nachrichten', events:'Termine', podcasts:'Original-Podcasts',
            generatedPodcasts:'Erzeugte Podcasts', radio:'Live-Radio',
            sourceHealth:'Quellenstatus', recovery:'Quellen-Wiederherstellungsdaten',
            entries:'Einträge', loaded:'geladen', missing:'fehlt',
            available:'verfügbar', unavailable:'nicht verfügbar',
            supported:'unterstützt', unsupported:'nicht unterstützt',
            registered:'registriert', notRegistered:'nicht registriert',
            controlled:'kontrolliert diese Seite', notControlled:'kontrolliert diese Seite noch nicht',
            online:'online', offline:'offline',
            offlineHint:'Offline: Netzwerkprüfungen werden als Hinweise gewertet.'
        }),
        es: Object.freeze({
            button:'Autoprueba de la app', title:'Autoprueba de la app WRN 2.1.1',
            subtitle:'Comprobaciones de solo lectura del dispositivo y esta instancia de la app.',
            run:'Comprobar de nuevo', copy:'Copiar informe', close:'Cerrar',
            running:'Comprobando…', copied:'Informe copiado.',
            copyFailed:'No se pudo copiar el informe.',
            pass:'Correcto', warn:'Avisos', fail:'Errores', total:'Total',
            version:'Versión de la app', build:'Identificador de compilación', navigation:'Navegación',
            pointer:'Puntero y controles', storage:'Almacenamiento local',
            swSupport:'Compatibilidad con service worker', swRegistration:'Registro del service worker',
            swControl:'Control del service worker', manifest:'Manifiesto web',
            news:'Noticias', events:'Eventos', podcasts:'Pódcasts originales',
            generatedPodcasts:'Pódcasts generados', radio:'Radio en directo',
            sourceHealth:'Estado de fuentes', recovery:'Datos de recuperación de fuentes',
            entries:'entradas', loaded:'cargado', missing:'falta',
            available:'disponible', unavailable:'no disponible',
            supported:'compatible', unsupported:'no compatible',
            registered:'registrado', notRegistered:'no registrado',
            controlled:'controla esta página', notControlled:'aún no controla esta página',
            online:'en línea', offline:'sin conexión',
            offlineHint:'Sin conexión: los fallos de red se muestran como avisos.'
        }),
        fr: Object.freeze({
            button:'Autotest de l’app', title:'Autotest de l’app WRN 2.1.1',
            subtitle:'Contrôles en lecture seule de cet appareil et de cette instance de l’app.',
            run:'Vérifier à nouveau', copy:'Copier le rapport', close:'Fermer',
            running:'Vérification en cours…', copied:'Rapport copié.',
            copyFailed:'Le rapport n’a pas pu être copié.',
            pass:'Réussis', warn:'Avertissements', fail:'Erreurs', total:'Total',
            version:'Version de l’app', build:'Identifiant du build', navigation:'Navigation',
            pointer:'Pointeur et commandes', storage:'Stockage local',
            swSupport:'Prise en charge du service worker', swRegistration:'Enregistrement du service worker',
            swControl:'Contrôle du service worker', manifest:'Manifeste web',
            news:'Actualités', events:'Événements', podcasts:'Podcasts originaux',
            generatedPodcasts:'Podcasts générés', radio:'Radio en direct',
            sourceHealth:'État des sources', recovery:'Données de récupération des sources',
            entries:'entrées', loaded:'chargé', missing:'absent',
            available:'disponible', unavailable:'indisponible',
            supported:'pris en charge', unsupported:'non pris en charge',
            registered:'enregistré', notRegistered:'non enregistré',
            controlled:'contrôle cette page', notControlled:'ne contrôle pas encore cette page',
            online:'en ligne', offline:'hors ligne',
            offlineHint:'Hors ligne : les erreurs réseau sont signalées comme avertissements.'
        }),
        it: Object.freeze({
            button:'Autotest dell’app', title:'Autotest dell’app WRN 2.1.1',
            subtitle:'Controlli di sola lettura del dispositivo e di questa istanza dell’app.',
            run:'Controlla di nuovo', copy:'Copia rapporto', close:'Chiudi',
            running:'Controllo in corso…', copied:'Rapporto copiato.',
            copyFailed:'Impossibile copiare il rapporto.',
            pass:'Superati', warn:'Avvisi', fail:'Errori', total:'Totale',
            version:'Versione app', build:'Identificatore build', navigation:'Navigazione',
            pointer:'Puntatore e comandi', storage:'Memoria locale',
            swSupport:'Supporto service worker', swRegistration:'Registrazione service worker',
            swControl:'Controllo service worker', manifest:'Manifesto web',
            news:'Notizie', events:'Eventi', podcasts:'Podcast originali',
            generatedPodcasts:'Podcast generati', radio:'Radio in diretta',
            sourceHealth:'Stato fonti', recovery:'Dati di recupero fonti',
            entries:'voci', loaded:'caricato', missing:'mancante',
            available:'disponibile', unavailable:'non disponibile',
            supported:'supportato', unsupported:'non supportato',
            registered:'registrato', notRegistered:'non registrato',
            controlled:'controlla questa pagina', notControlled:'non controlla ancora questa pagina',
            online:'online', offline:'offline',
            offlineHint:'Offline: i problemi di rete vengono mostrati come avvisi.'
        }),
        pt: Object.freeze({
            button:'Autoteste da aplicação', title:'Autoteste da aplicação WRN 2.1.1',
            subtitle:'Verificações só de leitura deste dispositivo e desta instância da aplicação.',
            run:'Verificar novamente', copy:'Copiar relatório', close:'Fechar',
            running:'A verificar…', copied:'Relatório copiado.',
            copyFailed:'Não foi possível copiar o relatório.',
            pass:'Aprovados', warn:'Avisos', fail:'Erros', total:'Total',
            version:'Versão da aplicação', build:'Identificador do build', navigation:'Navegação',
            pointer:'Ponteiro e controlos', storage:'Armazenamento local',
            swSupport:'Suporte a service worker', swRegistration:'Registo do service worker',
            swControl:'Controlo do service worker', manifest:'Manifesto web',
            news:'Notícias', events:'Eventos', podcasts:'Podcasts originais',
            generatedPodcasts:'Podcasts gerados', radio:'Rádio em direto',
            sourceHealth:'Estado das fontes', recovery:'Dados de recuperação de fontes',
            entries:'entradas', loaded:'carregado', missing:'em falta',
            available:'disponível', unavailable:'indisponível',
            supported:'suportado', unsupported:'não suportado',
            registered:'registado', notRegistered:'não registado',
            controlled:'controla esta página', notControlled:'ainda não controla esta página',
            online:'online', offline:'offline',
            offlineHint:'Offline: os problemas de rede são apresentados como avisos.'
        }),
        ru: Object.freeze({
            button:'Самопроверка приложения', title:'Самопроверка приложения WRN 2.1.1',
            subtitle:'Проверки этого устройства и экземпляра приложения только для чтения.',
            run:'Проверить снова', copy:'Копировать отчёт', close:'Закрыть',
            running:'Идёт проверка…', copied:'Отчёт скопирован.',
            copyFailed:'Не удалось скопировать отчёт.',
            pass:'Пройдено', warn:'Предупреждения', fail:'Ошибки', total:'Всего',
            version:'Версия приложения', build:'Идентификатор сборки', navigation:'Навигация',
            pointer:'Указатель и управление', storage:'Локальное хранилище',
            swSupport:'Поддержка service worker', swRegistration:'Регистрация service worker',
            swControl:'Контроль service worker', manifest:'Веб-манифест',
            news:'Новости', events:'События', podcasts:'Оригинальные подкасты',
            generatedPodcasts:'Созданные подкасты', radio:'Прямое радио',
            sourceHealth:'Состояние источников', recovery:'Данные восстановления источников',
            entries:'записей', loaded:'загружено', missing:'отсутствует',
            available:'доступно', unavailable:'недоступно',
            supported:'поддерживается', unsupported:'не поддерживается',
            registered:'зарегистрирован', notRegistered:'не зарегистрирован',
            controlled:'контролирует страницу', notControlled:'ещё не контролирует страницу',
            online:'в сети', offline:'не в сети',
            offlineHint:'Не в сети: сетевые ошибки отмечаются как предупреждения.'
        }),
        el: Object.freeze({
            button:'Αυτοέλεγχος εφαρμογής', title:'Αυτοέλεγχος εφαρμογής WRN 2.1.1',
            subtitle:'Έλεγχοι μόνο για ανάγνωση σε αυτή τη συσκευή και παρουσία εφαρμογής.',
            run:'Νέος έλεγχος', copy:'Αντιγραφή αναφοράς', close:'Κλείσιμο',
            running:'Ο έλεγχος εκτελείται…', copied:'Η αναφορά αντιγράφηκε.',
            copyFailed:'Δεν ήταν δυνατή η αντιγραφή της αναφοράς.',
            pass:'Επιτυχίες', warn:'Προειδοποιήσεις', fail:'Σφάλματα', total:'Σύνολο',
            version:'Έκδοση εφαρμογής', build:'Αναγνωριστικό build', navigation:'Πλοήγηση',
            pointer:'Δείκτης και χειρισμός', storage:'Τοπική αποθήκευση',
            swSupport:'Υποστήριξη service worker', swRegistration:'Εγγραφή service worker',
            swControl:'Έλεγχος service worker', manifest:'Μανιφέστο ιστού',
            news:'Ειδήσεις', events:'Εκδηλώσεις', podcasts:'Πρωτότυπα podcast',
            generatedPodcasts:'Παραγόμενα podcast', radio:'Ζωντανό ραδιόφωνο',
            sourceHealth:'Κατάσταση πηγών', recovery:'Δεδομένα ανάκτησης πηγών',
            entries:'εγγραφές', loaded:'φορτώθηκε', missing:'λείπει',
            available:'διαθέσιμο', unavailable:'μη διαθέσιμο',
            supported:'υποστηρίζεται', unsupported:'δεν υποστηρίζεται',
            registered:'εγγεγραμμένο', notRegistered:'μη εγγεγραμμένο',
            controlled:'ελέγχει τη σελίδα', notControlled:'δεν ελέγχει ακόμη τη σελίδα',
            online:'σε σύνδεση', offline:'εκτός σύνδεσης',
            offlineHint:'Εκτός σύνδεσης: τα προβλήματα δικτύου εμφανίζονται ως προειδοποιήσεις.'
        }),
        tr: Object.freeze({
            button:'Uygulama öz testi', title:'WRN 2.1.1 uygulama öz testi',
            subtitle:'Bu cihaz ve uygulama örneği için salt okunur denetimler.',
            run:'Yeniden denetle', copy:'Raporu kopyala', close:'Kapat',
            running:'Denetimler çalışıyor…', copied:'Rapor kopyalandı.',
            copyFailed:'Rapor kopyalanamadı.',
            pass:'Başarılı', warn:'Uyarılar', fail:'Hatalar', total:'Toplam',
            version:'Uygulama sürümü', build:'Derleme tanımlayıcısı', navigation:'Gezinme',
            pointer:'İşaretçi ve denetimler', storage:'Yerel depolama',
            swSupport:'Service worker desteği', swRegistration:'Service worker kaydı',
            swControl:'Service worker denetimi', manifest:'Web uygulaması manifesti',
            news:'Haberler', events:'Etkinlikler', podcasts:'Özgün podcastler',
            generatedPodcasts:'Üretilen podcastler', radio:'Canlı radyo',
            sourceHealth:'Kaynak durumu', recovery:'Kaynak kurtarma verileri',
            entries:'kayıt', loaded:'yüklendi', missing:'eksik',
            available:'kullanılabilir', unavailable:'kullanılamıyor',
            supported:'destekleniyor', unsupported:'desteklenmiyor',
            registered:'kayıtlı', notRegistered:'kayıtlı değil',
            controlled:'bu sayfayı denetliyor', notControlled:'bu sayfayı henüz denetlemiyor',
            online:'çevrimiçi', offline:'çevrimdışı',
            offlineHint:'Çevrimdışı: ağ sorunları uyarı olarak gösterilir.'
        })
    });

    let latestReport = null;
    let overlay = null;
    let previousFocus = null;

    const language = () => {
        const raw = document.getElementById('ui-language')?.value
            || document.documentElement.lang
            || 'en';
        const code = String(raw).toLowerCase().split('-')[0];
        return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
    };

    const t = () => TEXTS[language()] || TEXTS.en;

    const countEntries = data => {
        if (Array.isArray(data)) return data.length;
        if (!data || typeof data !== 'object') return 0;
        for (const key of ['items', 'entries', 'episodes', 'stations', 'sources']) {
            if (Array.isArray(data[key])) return data[key].length;
        }
        return Object.keys(data).length;
    };

    const result = (name, status, detail) => ({
        name,
        status,
        detail: String(detail ?? '')
    });

    const networkFailureStatus = () =>
        navigator.onLine === false ? 'warn' : 'fail';

    const testUrl = (configured, fallback) => {
        if (!configured) return fallback;
        try {
            const target = new URL(configured, location.href);
            return target.origin === location.origin
                ? target.href
                : fallback;
        } catch {
            return fallback;
        }
    };

    async function fetchJson(url) {
        try {
            const separator = String(url).includes('?') ? '&' : '?';
            const response = await fetch(
                `${url}${separator}wrn_selftest=${Date.now()}`,
                {
                    cache: 'no-store',
                    headers: { Accept: 'application/json' }
                }
            );
            if (!response.ok) {
                return {
                    result: result(
                        '',
                        navigator.onLine === false ? 'warn' : 'fail',
                        `HTTP ${response.status}`
                    ),
                    data: null
                };
            }
            const data = await response.json();
            const total = countEntries(data);
            return {
                result: result(
                    '',
                    total > 0 ? 'pass' : 'warn',
                    `${total} ${t().entries}`
                ),
                data
            };
        } catch (error) {
            return {
                result: result(
                    '',
                    networkFailureStatus(),
                    error?.message || String(error)
                ),
                data: null
            };
        }
    }

    function checkStorage() {
        let ok = false;
        try {
            localStorage.setItem(TEMP_STORAGE_KEY, '1');
            ok = localStorage.getItem(TEMP_STORAGE_KEY) === '1';
        } catch {
            ok = false;
        } finally {
            try {
                localStorage.removeItem(TEMP_STORAGE_KEY);
            } catch {}
        }
        return ok;
    }

    async function checkManifest() {
        const response = await fetchJson('./manifest.json');
        const manifest = response.data;
        if (!manifest) {
            return result(t().manifest, response.result.status, response.result.detail);
        }
        const valid = manifest.name === 'World Revolution News'
            && Boolean(manifest.start_url)
            && Array.isArray(manifest.icons)
            && manifest.icons.some(icon => icon?.src === 'icon.svg');
        return result(
            t().manifest,
            valid ? 'pass' : 'fail',
            valid ? `${manifest.name} · ${manifest.start_url}` : t().missing
        );
    }

    async function checkRecoveryData(sourceHealthUrl) {
        const report = await fetchJson('./source-recovery-report.json');
        if (report.data && countEntries(report.data) > 0) {
            return result(t().recovery, 'pass', report.result.detail);
        }

        const health = await fetchJson(sourceHealthUrl);
        const rows = health.data && typeof health.data === 'object'
            ? Object.values(health.data)
            : [];
        const recoveryRows = rows.filter(item =>
            item && typeof item === 'object'
            && (
                'detailedState' in item
                || 'replacementUrl' in item
                || 'consecutiveFailures' in item
            )
        );
        if (recoveryRows.length) {
            return result(
                t().recovery,
                'pass',
                `${recoveryRows.length} ${t().entries}`
            );
        }
        if (rows.length) {
            return result(
                t().recovery,
                'warn',
                `${rows.length} ${t().entries} · ${t().missing}`
            );
        }
        return result(
            t().recovery,
            navigator.onLine === false ? 'warn' : 'fail',
            report.result.detail || health.result.detail || t().missing
        );
    }

    async function run() {
        const text = t();
        const config = window.WRN_CONFIG || {};
        const urls = config.dataUrls || {};
        const results = [];
        const startedAt = new Date().toISOString();

        results.push(result(
            text.version,
            config.version === EXPECTED_VERSION ? 'pass' : 'fail',
            config.version || text.missing
        ));

        const build = String(config.build || '');
        results.push(result(
            text.build,
            build.includes('2.1') && build.includes('development')
                ? 'pass' : 'fail',
            build || text.missing
        ));

        const tabCount = document.querySelectorAll(
            '.wrn-top-tab, .wrn-app-tab, [data-wrn-tab]'
        ).length;
        results.push(result(
            text.navigation,
            tabCount >= 5 ? 'pass' : 'warn',
            `${tabCount} tabs`
        ));

        const rootPointer = getComputedStyle(document.documentElement).pointerEvents;
        const bodyPointer = document.body
            ? getComputedStyle(document.body).pointerEvents
            : 'auto';
        results.push(result(
            text.pointer,
            rootPointer === 'none' || bodyPointer === 'none' ? 'fail' : 'pass',
            `html: ${rootPointer} · body: ${bodyPointer}`
        ));

        const storageAvailable = checkStorage();
        results.push(result(
            text.storage,
            storageAvailable ? 'pass' : 'fail',
            storageAvailable ? text.available : text.unavailable
        ));

        const supportsServiceWorker = 'serviceWorker' in navigator;
        results.push(result(
            text.swSupport,
            supportsServiceWorker ? 'pass' : 'warn',
            supportsServiceWorker ? text.supported : text.unsupported
        ));

        let registration = null;
        let registrationError = null;
        if (supportsServiceWorker) {
            try {
                registration = await navigator.serviceWorker.getRegistration();
            } catch (error) {
                registrationError = error;
            }
        }
        results.push(result(
            text.swRegistration,
            registrationError
                ? networkFailureStatus()
                : (registration ? 'pass' : 'warn'),
            registrationError?.message
                || (registration ? `${text.registered} · ${registration.scope}` : text.notRegistered)
        ));
        results.push(result(
            text.swControl,
            navigator.serviceWorker?.controller ? 'pass' : 'warn',
            navigator.serviceWorker?.controller ? text.controlled : text.notControlled
        ));

        results.push(await checkManifest());

        for (const moduleName of MODULES) {
            const loaded = Boolean(window[moduleName]);
            results.push(result(
                `Module: ${moduleName}`,
                loaded ? 'pass' : 'warn',
                loaded ? text.loaded : text.missing
            ));
        }

        const dataTargets = [
            [text.news, testUrl(urls.news, './news-feed.json')],
            [text.events, testUrl(urls.events, './events-feed.json')],
            [text.podcasts, testUrl(urls.podcasts, './podcasts.json')],
            [text.generatedPodcasts, testUrl(urls.generatedPodcasts, './generated-podcasts.json')],
            [text.radio, testUrl(urls.radio, './radio-stations.json')],
            [text.sourceHealth, testUrl(urls.sourceHealth, './source-health.json')]
        ];
        for (const [name, url] of dataTargets) {
            const check = await fetchJson(url);
            results.push(result(name, check.result.status, check.result.detail));
        }

        results.push(await checkRecoveryData(
            testUrl(urls.sourceHealth, './source-health.json')
        ));

        const counts = {
            pass: results.filter(item => item.status === 'pass').length,
            warn: results.filter(item => item.status === 'warn').length,
            fail: results.filter(item => item.status === 'fail').length,
            total: results.length
        };
        latestReport = {
            app: 'World Revolution News',
            expectedVersion: EXPECTED_VERSION,
            version: config.version || '',
            build,
            language: language(),
            online: navigator.onLine,
            startedAt,
            completedAt: new Date().toISOString(),
            url: location.href,
            userAgent: navigator.userAgent,
            counts,
            results
        };
        return latestReport;
    }

    const createButton = (label, className, handler) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = label;
        button.addEventListener('click', handler);
        return button;
    };

    function render(report) {
        if (!overlay) return;
        const text = t();
        const summary = overlay.querySelector('.wrn-selftest-summary');
        const list = overlay.querySelector('.wrn-selftest-results');
        summary.textContent = '';
        list.textContent = '';

        for (const [key, label] of [
            ['pass', text.pass],
            ['warn', text.warn],
            ['fail', text.fail],
            ['total', text.total]
        ]) {
            const item = document.createElement('div');
            item.className = `wrn-selftest-stat ${key}`;
            const value = document.createElement('strong');
            value.textContent = report.counts[key];
            const caption = document.createElement('span');
            caption.textContent = label;
            item.append(value, caption);
            summary.appendChild(item);
        }

        report.results.forEach(item => {
            const row = document.createElement('article');
            row.className = `wrn-selftest-result ${item.status}`;
            const icon = document.createElement('span');
            icon.className = 'wrn-selftest-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = item.status === 'pass' ? '✓' : item.status === 'warn' ? '!' : '×';
            const content = document.createElement('div');
            const name = document.createElement('strong');
            name.textContent = item.name;
            const detail = document.createElement('p');
            detail.textContent = item.detail;
            content.append(name, detail);
            row.append(icon, content);
            list.appendChild(row);
        });

        const status = overlay.querySelector('.wrn-selftest-status');
        status.textContent = navigator.onLine === false
            ? text.offlineHint
            : `${text.total}: ${report.counts.total}`;
    }

    async function rerun() {
        if (!overlay) return;
        overlay.querySelector('.wrn-selftest-results').textContent = t().running;
        overlay.querySelector('.wrn-selftest-status').textContent = '';
        render(await run());
    }

    async function copyReport() {
        const status = overlay?.querySelector('.wrn-selftest-status');
        const value = JSON.stringify(latestReport || {}, null, 2);
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const field = document.createElement('textarea');
                field.value = value;
                field.setAttribute('readonly', '');
                field.className = 'wrn-selftest-copy-field';
                document.body.appendChild(field);
                field.select();
                const copied = document.execCommand('copy');
                field.remove();
                if (!copied) throw new Error('copy failed');
            }
            if (status) status.textContent = t().copied;
        } catch {
            if (status) status.textContent = t().copyFailed;
        }
    }

    function close() {
        if (!overlay) return;
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        overlay = null;
        previousFocus?.focus?.();
        previousFocus = null;
    }

    function onKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }
        if (event.key !== 'Tab' || !overlay) return;
        const focusable = [...overlay.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    async function open() {
        close();
        const text = t();
        previousFocus = document.activeElement;
        overlay = document.createElement('div');
        overlay.className = 'wrn-selftest-overlay';

        const dialog = document.createElement('section');
        dialog.className = 'wrn-selftest-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'wrn-selftest-title');

        const head = document.createElement('header');
        head.className = 'wrn-selftest-head';
        const headings = document.createElement('div');
        const title = document.createElement('h2');
        title.id = 'wrn-selftest-title';
        title.textContent = text.title;
        const subtitle = document.createElement('p');
        subtitle.textContent = text.subtitle;
        headings.append(title, subtitle);
        const closeIcon = createButton('×', 'wrn-selftest-close', close);
        closeIcon.setAttribute('aria-label', text.close);
        head.append(headings, closeIcon);

        const summary = document.createElement('div');
        summary.className = 'wrn-selftest-summary';
        summary.setAttribute('aria-label', text.total);

        const list = document.createElement('div');
        list.className = 'wrn-selftest-results';
        list.textContent = text.running;

        const footer = document.createElement('footer');
        footer.className = 'wrn-selftest-footer';
        const status = document.createElement('div');
        status.className = 'wrn-selftest-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        const actions = document.createElement('div');
        actions.className = 'wrn-selftest-actions';
        actions.append(
            createButton(text.run, 'wrn-selftest-action primary', rerun),
            createButton(text.copy, 'wrn-selftest-action', copyReport),
            createButton(text.close, 'wrn-selftest-action', close)
        );
        footer.append(status, actions);
        dialog.append(head, summary, list, footer);
        overlay.appendChild(dialog);
        overlay.addEventListener('click', event => {
            if (event.target === overlay) close();
        });
        document.body.appendChild(overlay);
        document.addEventListener('keydown', onKeyDown);
        closeIcon.focus();
        await rerun();
    }

    const install = () => {
        const target = document.querySelector('.wrn-more-admin-tools-184')
            || document.querySelector('.wrn-more-grid, .wrn-more-actions');
        if (!target) return false;
        const existing = document.getElementById('wrn-selftest-open');
        if (existing) {
            if (existing.parentElement !== target) target.appendChild(existing);
            existing.hidden = false;
            return true;
        }
        const button = createButton(t().button, 'wrn-selftest-open', open);
        button.id = 'wrn-selftest-open';
        target.appendChild(button);
        return true;
    };

    const init = () => {
        install();

        // The settings panel is rebuilt when language or navigation state
        // changes. Keep watching so the compact self-test action is restored
        // after a rebuild instead of disappearing for the rest of the session.
        const observer = new MutationObserver(() => install());
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('wrn-language-change', install);
        window.addEventListener('wrn-app-ready', install);
    };

    window.WRNRuntimeSelfTest = Object.freeze({
        expectedVersion: EXPECTED_VERSION,
        run,
        open,
        close
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
