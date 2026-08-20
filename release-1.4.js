/* World Revolution News 1.8.1 – vollständige Sprachen und mobile Navigation */
'use strict';

(() => {
    const BETA_LANGUAGES = new Set();
    const nativeNames = {
        en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', it: 'Italiano',
        pt: 'Português', ru: 'Русский', el: 'Ελληνικά', tr: 'Türkçe'
    };

    const releaseTexts = {
        en: { more:'More', beta:'Some technical areas still use the English fallback. Article translation works in the selected language.', sources:'Sources', storage:'Storage', status:'Status', filterMenu:'Open source and filter menu' },
        de: { more:'Mehr', beta:'Einige technische Bereiche verwenden noch den englischen Rückfalltext. Artikelübersetzungen funktionieren in der gewählten Sprache.', sources:'Quellen', storage:'Speicher', status:'Status', filterMenu:'Quellen- und Filtermenü öffnen' },
        es: { more:'Más', beta:'Algunas áreas técnicas todavía usan el texto alternativo en inglés. La traducción de artículos funciona en el idioma seleccionado.', sources:'Fuentes', storage:'Almacenamiento', status:'Estado', filterMenu:'Abrir fuentes y filtros' },
        fr: { more:'Plus', beta:'Certaines zones techniques utilisent encore le texte anglais de secours. La traduction des articles fonctionne dans la langue choisie.', sources:'Sources', storage:'Stockage', status:'État', filterMenu:'Ouvrir les sources et les filtres' },
        it: { more:'Altro', beta:'Alcune aree tecniche usano ancora il testo inglese di riserva. La traduzione degli articoli funziona nella lingua scelta.', sources:'Fonti', storage:'Memoria', status:'Stato', filterMenu:'Apri fonti e filtri' },
        pt: { more:'Mais', beta:'Algumas áreas técnicas ainda usam o texto alternativo em inglês. A tradução de artigos funciona no idioma selecionado.', sources:'Fontes', storage:'Armazenamento', status:'Estado', filterMenu:'Abrir fontes e filtros' },
        ru: { more:'Ещё', beta:'Некоторые технические разделы пока используют английский запасной текст. Перевод статей работает на выбранном языке.', sources:'Источники', storage:'Хранилище', status:'Статус', filterMenu:'Открыть источники и фильтры' },
        el: { more:'Περισσότερα', beta:'Ορισμένες τεχνικές ενότητες χρησιμοποιούν ακόμη αγγλικό εφεδρικό κείμενο. Η μετάφραση άρθρων λειτουργεί στην επιλεγμένη γλώσσα.', sources:'Πηγές', storage:'Αποθήκευση', status:'Κατάσταση', filterMenu:'Άνοιγμα πηγών και φίλτρων' },
        tr: { more:'Daha fazla', beta:'Bazı teknik bölümler hâlâ İngilizce yedek metni kullanıyor. Makale çevirisi seçilen dilde çalışır.', sources:'Kaynaklar', storage:'Depolama', status:'Durum', filterMenu:'Kaynakları ve filtreleri aç' }
    };

    const coreLocalePatches = {
        es: { langLabel:'Idioma:', themeLabel:'Diseño:', themeDark:'Oscuro', themeLight:'Claro', clearBtn:'Vaciar caché 🗑️', searchPlace:'Buscar artículos…', topBookmarks:'Leer después', sortNew:'Más recientes', sortOld:'Más antiguos', latestNews:'Últimas novedades:', filterAll:'Todas las fuentes', btnDonateTop:'Donar', btnDonateCancel:'Cerrar', btnPaypal:'Continuar a PayPal', fbTitle:'Contacto', fbPlace:'Escribe ideas, errores o nuevas fuentes…', fbCaptcha:'Captcha: ¿Cuánto es', fbCancel:'Cancelar', fbSend:'Enviar por correo', contactLabel:'Contacto:', archiveTitle:'🗄️ Archivo (> 3 meses)', btnExpand:'Leer más ⬇️', btnCollapse:'Cerrar ⬆️', btnReadMore:'Original', audioHub:'Podcasts y radio', audioHubTitle:'Podcasts y radio', tabOriginal:'Podcasts originales', tabGenerated:'Podcasts generados', tabRadio:'Radio en directo', podcastLibraryRefresh:'Actualizar', podcastClose:'Cerrar', searchPodcasts:'Buscar podcasts…', allSources:'Todas las fuentes', allLanguages:'Todos los idiomas', originalLoading:'Cargando…', originalEmpty:'No hay podcasts disponibles', listenOriginal:'Escuchar en la fuente', feedLink:'Feed' },
        fr: { langLabel:'Langue :', themeLabel:'Design :', themeDark:'Sombre', themeLight:'Clair', clearBtn:'Vider le cache 🗑️', searchPlace:'Rechercher des articles…', topBookmarks:'À lire plus tard', sortNew:'Plus récents', sortOld:'Plus anciens', latestNews:'Dernières mises à jour :', filterAll:'Toutes les sources', btnDonateTop:'Soutenir', btnDonateCancel:'Fermer', btnPaypal:'Continuer vers PayPal', fbTitle:'Contact', fbPlace:'Écrivez vos idées, erreurs ou nouvelles sources…', fbCaptcha:'Captcha : combien font', fbCancel:'Annuler', fbSend:'Envoyer par e-mail', contactLabel:'Contact :', archiveTitle:'🗄️ Archive (> 3 mois)', btnExpand:'Lire plus ⬇️', btnCollapse:'Réduire ⬆️', btnReadMore:'Original', audioHub:'Podcasts et radio', audioHubTitle:'Podcasts et radio', tabOriginal:'Podcasts originaux', tabGenerated:'Podcasts générés', tabRadio:'Radio en direct', podcastLibraryRefresh:'Actualiser', podcastClose:'Fermer', searchPodcasts:'Rechercher des podcasts…', allSources:'Toutes les sources', allLanguages:'Toutes les langues', originalLoading:'Chargement…', originalEmpty:'Aucun podcast disponible', listenOriginal:'Écouter à la source', feedLink:'Flux' },
        it: { langLabel:'Lingua:', themeLabel:'Design:', themeDark:'Scuro', themeLight:'Chiaro', clearBtn:'Svuota cache 🗑️', searchPlace:'Cerca articoli…', topBookmarks:'Leggi dopo', sortNew:'Più recenti', sortOld:'Più vecchi', latestNews:'Ultimi aggiornamenti:', filterAll:'Tutte le fonti', btnDonateTop:'Dona', btnDonateCancel:'Chiudi', btnPaypal:'Continua su PayPal', fbTitle:'Contatto', fbPlace:'Scrivi idee, errori o nuove fonti…', fbCaptcha:'Captcha: quanto fa', fbCancel:'Annulla', fbSend:'Invia via e-mail', contactLabel:'Contatto:', archiveTitle:'🗄️ Archivio (> 3 mesi)', btnExpand:'Leggi altro ⬇️', btnCollapse:'Riduci ⬆️', btnReadMore:'Originale', audioHub:'Podcast e radio', audioHubTitle:'Podcast e radio', tabOriginal:'Podcast originali', tabGenerated:'Podcast generati', tabRadio:'Radio in diretta', podcastLibraryRefresh:'Aggiorna', podcastClose:'Chiudi', searchPodcasts:'Cerca podcast…', allSources:'Tutte le fonti', allLanguages:'Tutte le lingue', originalLoading:'Caricamento…', originalEmpty:'Nessun podcast disponibile', listenOriginal:'Ascolta alla fonte', feedLink:'Feed' },
        pt: { langLabel:'Idioma:', themeLabel:'Design:', themeDark:'Escuro', themeLight:'Claro', clearBtn:'Limpar cache 🗑️', searchPlace:'Pesquisar artigos…', topBookmarks:'Ler depois', sortNew:'Mais recentes', sortOld:'Mais antigos', latestNews:'Atualizações recentes:', filterAll:'Todas as fontes', btnDonateTop:'Doar', btnDonateCancel:'Fechar', btnPaypal:'Continuar para PayPal', fbTitle:'Contato', fbPlace:'Escreva ideias, erros ou novas fontes…', fbCaptcha:'Captcha: quanto é', fbCancel:'Cancelar', fbSend:'Enviar por e-mail', contactLabel:'Contato:', archiveTitle:'🗄️ Arquivo (> 3 meses)', btnExpand:'Ler mais ⬇️', btnCollapse:'Recolher ⬆️', btnReadMore:'Original', audioHub:'Podcasts e rádio', audioHubTitle:'Podcasts e rádio', tabOriginal:'Podcasts originais', tabGenerated:'Podcasts gerados', tabRadio:'Rádio ao vivo', podcastLibraryRefresh:'Atualizar', podcastClose:'Fechar', searchPodcasts:'Pesquisar podcasts…', allSources:'Todas as fontes', allLanguages:'Todos os idiomas', originalLoading:'Carregando…', originalEmpty:'Nenhum podcast disponível', listenOriginal:'Ouvir na fonte', feedLink:'Feed' },
        ru: { langLabel:'Язык:', themeLabel:'Оформление:', themeDark:'Тёмное', themeLight:'Светлое', clearBtn:'Очистить кэш 🗑️', searchPlace:'Поиск статей…', topBookmarks:'Прочитать позже', sortNew:'Сначала новые', sortOld:'Сначала старые', latestNews:'Последние обновления:', filterAll:'Все источники', btnDonateTop:'Поддержать', btnDonateCancel:'Закрыть', btnPaypal:'Перейти к PayPal', fbTitle:'Связаться', fbPlace:'Напишите об идеях, ошибках или новых источниках…', fbCaptcha:'Проверка: сколько будет', fbCancel:'Отмена', fbSend:'Отправить письмом', contactLabel:'Контакт:', archiveTitle:'🗄️ Архив (> 3 месяцев)', btnExpand:'Читать далее ⬇️', btnCollapse:'Свернуть ⬆️', btnReadMore:'Оригинал', audioHub:'Подкасты и радио', audioHubTitle:'Подкасты и радио', tabOriginal:'Оригинальные подкасты', tabGenerated:'Созданные подкасты', tabRadio:'Прямой эфир', podcastLibraryRefresh:'Обновить', podcastClose:'Закрыть', searchPodcasts:'Поиск подкастов…', allSources:'Все источники', allLanguages:'Все языки', originalLoading:'Загрузка…', originalEmpty:'Подкасты недоступны', listenOriginal:'Слушать у источника', feedLink:'Лента' },
        el: { langLabel:'Γλώσσα:', themeLabel:'Σχεδίαση:', themeDark:'Σκούρο', themeLight:'Φωτεινό', clearBtn:'Εκκαθάριση cache 🗑️', searchPlace:'Αναζήτηση άρθρων…', topBookmarks:'Ανάγνωση αργότερα', sortNew:'Νεότερα', sortOld:'Παλαιότερα', latestNews:'Τελευταίες ενημερώσεις:', filterAll:'Όλες οι πηγές', btnDonateTop:'Δωρεά', btnDonateCancel:'Κλείσιμο', btnPaypal:'Συνέχεια στο PayPal', fbTitle:'Επικοινωνία', fbPlace:'Γράψτε ιδέες, σφάλματα ή νέες πηγές…', fbCaptcha:'Captcha: πόσο κάνει', fbCancel:'Ακύρωση', fbSend:'Αποστολή με e-mail', contactLabel:'Επικοινωνία:', archiveTitle:'🗄️ Αρχείο (> 3 μήνες)', btnExpand:'Περισσότερα ⬇️', btnCollapse:'Σύμπτυξη ⬆️', btnReadMore:'Πρωτότυπο', audioHub:'Podcast και ραδιόφωνο', audioHubTitle:'Podcast και ραδιόφωνο', tabOriginal:'Πρωτότυπα podcast', tabGenerated:'Δημιουργημένα podcast', tabRadio:'Ζωντανό ραδιόφωνο', podcastLibraryRefresh:'Ανανέωση', podcastClose:'Κλείσιμο', searchPodcasts:'Αναζήτηση podcast…', allSources:'Όλες οι πηγές', allLanguages:'Όλες οι γλώσσες', originalLoading:'Φόρτωση…', originalEmpty:'Δεν υπάρχουν διαθέσιμα podcast', listenOriginal:'Ακρόαση στην πηγή', feedLink:'Ροή' },
        tr: { langLabel:'Dil:', themeLabel:'Tasarım:', themeDark:'Koyu', themeLight:'Açık', clearBtn:'Önbelleği temizle 🗑️', searchPlace:'Makale ara…', topBookmarks:'Sonra oku', sortNew:'En yeni', sortOld:'En eski', latestNews:'Son güncellemeler:', filterAll:'Tüm kaynaklar', btnDonateTop:'Bağış yap', btnDonateCancel:'Kapat', btnPaypal:'PayPal’a devam et', fbTitle:'İletişim', fbPlace:'Fikirleri, hataları veya yeni kaynakları yazın…', fbCaptcha:'Doğrulama: kaç eder', fbCancel:'İptal', fbSend:'E-posta ile gönder', contactLabel:'İletişim:', archiveTitle:'🗄️ Arşiv (> 3 ay)', btnExpand:'Devamını oku ⬇️', btnCollapse:'Daralt ⬆️', btnReadMore:'Orijinal', audioHub:'Podcast ve radyo', audioHubTitle:'Podcast ve radyo', tabOriginal:'Orijinal podcastler', tabGenerated:'Oluşturulan podcastler', tabRadio:'Canlı radyo', podcastLibraryRefresh:'Yenile', podcastClose:'Kapat', searchPodcasts:'Podcast ara…', allSources:'Tüm kaynaklar', allLanguages:'Tüm diller', originalLoading:'Yükleniyor…', originalEmpty:'Kullanılabilir podcast yok', listenOriginal:'Kaynakta dinle', feedLink:'Akış' }
    };

    function lang() {
        try { return (typeof currentLang !== 'undefined' && currentLang) || document.documentElement.lang || 'en'; }
        catch { return document.documentElement.lang || 'en'; }
    }

    function text() { return releaseTexts[lang()] || releaseTexts.en; }
    function setText(id, value) { const node = document.getElementById(id); if (node && node.textContent !== value) node.textContent = value; }

    function mergeLocales() {
        try {
            Object.entries(coreLocalePatches).forEach(([code, values]) => {
                if (typeof uiTexte !== 'undefined' && uiTexte[code]) Object.assign(uiTexte[code], values);
            });
        } catch (error) { console.warn('Release locale patches could not be applied:', error); }
    }

    function createMobileMenu() {
        if (document.getElementById('mobile-more-menu')) return;
        const source = document.querySelector('.top-action-bar');
        if (!source) return;
        const details = document.createElement('details');
        details.id = 'mobile-more-menu';
        details.className = 'mobile-more-menu';
        const summary = document.createElement('summary');
        summary.id = 'mobile-more-summary';
        const panel = document.createElement('div');
        panel.className = 'mobile-more-panel';
        [...source.querySelectorAll('button')].forEach(original => {
            const clone = original.cloneNode(true);
            clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
            clone.removeAttribute('id');
            clone.removeAttribute('onclick');
            clone.addEventListener('click', event => {
                event.preventDefault();
                details.open = false;
                original.click();
            });
            panel.append(clone);
        });
        details.append(summary, panel);
        source.after(details);

        const mirror = () => {
            const originals = [...source.querySelectorAll('button')];
            const clones = [...panel.querySelectorAll('button')];
            originals.forEach((button, index) => { if (clones[index]) clones[index].innerHTML = button.innerHTML; });
        };
        new MutationObserver(mirror).observe(source, { subtree: true, childList: true, characterData: true });
        mirror();
    }

    function ensureBetaNote() {
        document.getElementById('language-beta-note')?.remove();
    }

    const statusByLanguage = {
        en:{title:'System status',refresh:'Check again',close:'Close',version:'App version',connection:'Connection',news:'News',events:'Events',podcasts:'Original podcasts',generated:'Generated podcasts',radio:'Live radio',sourceHealth:'News sources',podcastHealth:'Podcast sources',worker:'Azure / R2 / Worker'},
        de:{title:'Systemstatus',refresh:'Neu prüfen',close:'Schließen',version:'App-Version',connection:'Verbindung',news:'Nachrichten',events:'Termine',podcasts:'Original-Podcasts',generated:'Erzeugte Podcasts',radio:'Live-Radio',sourceHealth:'Nachrichtenquellen',podcastHealth:'Podcastquellen',worker:'Azure / R2 / Worker'},
        es:{title:'Estado del sistema',refresh:'Comprobar de nuevo',close:'Cerrar',version:'Versión de la app',connection:'Conexión',news:'Noticias',events:'Eventos',podcasts:'Podcasts originales',generated:'Podcasts generados',radio:'Radio en directo',sourceHealth:'Fuentes de noticias',podcastHealth:'Fuentes de podcasts',worker:'Azure / R2 / Worker'},
        fr:{title:'État du système',refresh:'Vérifier à nouveau',close:'Fermer',version:'Version de l’application',connection:'Connexion',news:'Actualités',events:'Événements',podcasts:'Podcasts originaux',generated:'Podcasts générés',radio:'Radio en direct',sourceHealth:'Sources d’actualités',podcastHealth:'Sources de podcasts',worker:'Azure / R2 / Worker'},
        it:{title:'Stato del sistema',refresh:'Controlla di nuovo',close:'Chiudi',version:'Versione app',connection:'Connessione',news:'Notizie',events:'Eventi',podcasts:'Podcast originali',generated:'Podcast generati',radio:'Radio in diretta',sourceHealth:'Fonti di notizie',podcastHealth:'Fonti podcast',worker:'Azure / R2 / Worker'},
        pt:{title:'Estado do sistema',refresh:'Verificar novamente',close:'Fechar',version:'Versão da aplicação',connection:'Ligação',news:'Notícias',events:'Eventos',podcasts:'Podcasts originais',generated:'Podcasts gerados',radio:'Rádio ao vivo',sourceHealth:'Fontes de notícias',podcastHealth:'Fontes de podcasts',worker:'Azure / R2 / Worker'},
        ru:{title:'Состояние системы',refresh:'Проверить снова',close:'Закрыть',version:'Версия приложения',connection:'Соединение',news:'Новости',events:'События',podcasts:'Оригинальные подкасты',generated:'Созданные подкасты',radio:'Прямой эфир',sourceHealth:'Источники новостей',podcastHealth:'Источники подкастов',worker:'Azure / R2 / Worker'},
        el:{title:'Κατάσταση συστήματος',refresh:'Νέος έλεγχος',close:'Κλείσιμο',version:'Έκδοση εφαρμογής',connection:'Σύνδεση',news:'Ειδήσεις',events:'Εκδηλώσεις',podcasts:'Πρωτότυπα podcast',generated:'Δημιουργημένα podcast',radio:'Ζωντανό ραδιόφωνο',sourceHealth:'Πηγές ειδήσεων',podcastHealth:'Πηγές podcast',worker:'Azure / R2 / Worker'},
        tr:{title:'Sistem durumu',refresh:'Tekrar kontrol et',close:'Kapat',version:'Uygulama sürümü',connection:'Bağlantı',news:'Haberler',events:'Etkinlikler',podcasts:'Orijinal podcastler',generated:'Oluşturulan podcastler',radio:'Canlı radyo',sourceHealth:'Haber kaynakları',podcastHealth:'Podcast kaynakları',worker:'Azure / R2 / Worker'}
    };

    function applyStatusLanguage() {
        const s = statusByLanguage[lang()] || statusByLanguage.en;
        setText('system-status-title', s.title);
        setText('btn-system-status-refresh', s.refresh);
        setText('btn-system-status-close', s.close);
        setText('system-status-version-label', s.version);
        const rows = {
            'system-status-connection':s.connection, 'system-status-news':s.news, 'system-status-events':s.events,
            'system-status-podcasts':s.podcasts, 'system-status-generated':s.generated, 'system-status-radio':s.radio,
            'system-status-source-health':s.sourceHealth, 'system-status-podcast-health':s.podcastHealth,
            'system-status-worker':s.worker
        };
        Object.entries(rows).forEach(([id, label]) => {
            const node = document.querySelector(`#${id} .system-status-name`);
            if (node && node.textContent !== label) node.textContent = label;
        });
    }

    function applyReleaseLanguage() {
        document.documentElement.lang = lang();
        const select = document.getElementById('ui-language');
        if (select) {
            [...select.options].forEach(option => {
                const code = option.value;
                const base = nativeNames[code] || option.textContent.replace(/\s*[·(].*$/, '');
                option.textContent = BETA_LANGUAGES.has(code) ? `${base} · Beta` : base;
            });
        }
        setText('mobile-more-summary', text().more);
        setText('btn-open-system-status', `● ${text().status}`);
        setText('btn-open-data-control', `💾 ${text().storage}`);
        const filterButton = document.querySelector('.filter-control-menu');
        if (filterButton) filterButton.setAttribute('aria-label', text().filterMenu);
        ensureBetaNote();
        applyStatusLanguage();
    }

    mergeLocales();
    const originalChangeLanguage = window.changeLanguage;
    if (typeof originalChangeLanguage === 'function') {
        window.changeLanguage = function(...args) {
            const result = originalChangeLanguage.apply(this, args);
            applyReleaseLanguage();
            return result;
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        createMobileMenu();
        applyReleaseLanguage();
        const statusModal = document.getElementById('system-status-modal');
        if (statusModal) {
            new MutationObserver(applyStatusLanguage).observe(statusModal, { subtree:true, childList:true, characterData:true });
        }
        window.addEventListener('resize', () => {
            if (window.innerWidth > 720) document.getElementById('mobile-more-menu')?.removeAttribute('open');
        });
    });
})();
