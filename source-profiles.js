/* World Revolution News – Quellenprofile und redaktionelle Kennzeichnungen */
'use strict';

(() => {
    const CONFIG = window.WRN_CONFIG || {};
    const passportCore = window.WRNSourcePassport21;
    const CATALOG_URL = CONFIG.dataUrls?.sourceCatalog
        || 'https://blackfront161.github.io/Revolution-News-Data/source-catalog.json';
    const HEALTH_URL = CONFIG.dataUrls?.sourceHealth
        || 'https://blackfront161.github.io/Revolution-News-Data/source-health.json';

    let articleData = [];
    let catalogSources = [];
    let catalogGeneratedAt = '';
    let healthData = null;
    let registrySources = [];
    let catalogPromise = null;

    const typeOrder = ['news', 'analysis', 'commentary', 'interview', 'press-release', 'podcast', 'event'];
    const typeTexts = {
        en: {
            all: 'All formats', news: 'News', analysis: 'Analysis', commentary: 'Commentary', interview: 'Interview',
            'press-release': 'Press release', podcast: 'Podcast', event: 'Event', automatic: 'Automatically classified',
            updated: 'Updated', corrected: 'Corrected', translated: 'Machine translated', sourceProfile: 'Source profile',
            website: 'Website', domain: 'Domain', languages: 'Languages', regions: 'Topics / regions', currentItems: 'Current entries',
            latest: 'Latest entry', status: 'Technical status', statusUnknown: 'No separate technical check',
            available: 'Available', unavailable: 'Unavailable', lastCheck: 'Last successful update', recent: 'Recent entries',
            close: 'Close', filter: 'Show only this source', info: 'Profile', note: 'This profile is generated from the available app data. It is not a political rating or endorsement.'
        },
        de: {
            all: 'Alle Formate', news: 'Nachricht', analysis: 'Analyse', commentary: 'Kommentar', interview: 'Interview',
            'press-release': 'Pressemitteilung', podcast: 'Podcast', event: 'Event', automatic: 'Automatisch erkannt',
            updated: 'Aktualisiert', corrected: 'Korrigiert', translated: 'Maschinell übersetzt', sourceProfile: 'Quellenprofil',
            website: 'Webseite', domain: 'Domain', languages: 'Sprachen', regions: 'Themen / Regionen', currentItems: 'Aktuelle Einträge',
            latest: 'Neuester Eintrag', status: 'Technischer Status', statusUnknown: 'Keine getrennte technische Prüfung',
            available: 'Erreichbar', unavailable: 'Nicht erreichbar', lastCheck: 'Letzte erfolgreiche Aktualisierung', recent: 'Neueste Einträge',
            close: 'Schließen', filter: 'Nur diese Quelle zeigen', info: 'Profil', note: 'Dieses Profil wird aus den verfügbaren App-Daten erzeugt. Es ist keine politische Bewertung oder Empfehlung.'
        },
        es: {
            all: 'Todos los formatos', news: 'Noticia', analysis: 'Análisis', commentary: 'Comentario', interview: 'Entrevista',
            'press-release': 'Comunicado de prensa', podcast: 'Pódcast', event: 'Evento', automatic: 'Clasificado automáticamente',
            updated: 'Actualizado', corrected: 'Corregido', translated: 'Traducción automática', sourceProfile: 'Perfil de la fuente',
            website: 'Sitio web', domain: 'Dominio', languages: 'Idiomas', regions: 'Temas / regiones', currentItems: 'Entradas actuales',
            latest: 'Entrada más reciente', status: 'Estado técnico', statusUnknown: 'Sin comprobación técnica independiente',
            available: 'Disponible', unavailable: 'No disponible', lastCheck: 'Última actualización correcta', recent: 'Entradas recientes',
            close: 'Cerrar', filter: 'Mostrar solo esta fuente', info: 'Perfil', note: 'Este perfil se genera con los datos disponibles en la aplicación. No es una valoración política ni una recomendación.'
        },
        fr: {
            all: 'Tous les formats', news: 'Actualité', analysis: 'Analyse', commentary: 'Commentaire', interview: 'Entretien',
            'press-release': 'Communiqué de presse', podcast: 'Podcast', event: 'Événement', automatic: 'Classé automatiquement',
            updated: 'Mis à jour', corrected: 'Corrigé', translated: 'Traduit automatiquement', sourceProfile: 'Profil de la source',
            website: 'Site web', domain: 'Domaine', languages: 'Langues', regions: 'Thèmes / régions', currentItems: 'Entrées actuelles',
            latest: 'Entrée la plus récente', status: 'État technique', statusUnknown: 'Aucune vérification technique distincte',
            available: 'Disponible', unavailable: 'Indisponible', lastCheck: 'Dernière mise à jour réussie', recent: 'Entrées récentes',
            close: 'Fermer', filter: 'Afficher uniquement cette source', info: 'Profil', note: 'Ce profil est généré à partir des données disponibles dans l’application. Il ne constitue ni une évaluation politique ni une recommandation.'
        },
        it: {
            all: 'Tutti i formati', news: 'Notizia', analysis: 'Analisi', commentary: 'Commento', interview: 'Intervista',
            'press-release': 'Comunicato stampa', podcast: 'Podcast', event: 'Evento', automatic: 'Classificato automaticamente',
            updated: 'Aggiornato', corrected: 'Corretto', translated: 'Traduzione automatica', sourceProfile: 'Profilo della fonte',
            website: 'Sito web', domain: 'Dominio', languages: 'Lingue', regions: 'Temi / regioni', currentItems: 'Voci attuali',
            latest: 'Voce più recente', status: 'Stato tecnico', statusUnknown: 'Nessun controllo tecnico separato',
            available: 'Disponibile', unavailable: 'Non disponibile', lastCheck: 'Ultimo aggiornamento riuscito', recent: 'Voci recenti',
            close: 'Chiudi', filter: 'Mostra solo questa fonte', info: 'Profilo', note: 'Questo profilo viene generato dai dati disponibili nell’app. Non è una valutazione politica né una raccomandazione.'
        },
        pt: {
            all: 'Todos os formatos', news: 'Notícia', analysis: 'Análise', commentary: 'Comentário', interview: 'Entrevista',
            'press-release': 'Comunicado de imprensa', podcast: 'Podcast', event: 'Evento', automatic: 'Classificado automaticamente',
            updated: 'Atualizado', corrected: 'Corrigido', translated: 'Tradução automática', sourceProfile: 'Perfil da fonte',
            website: 'Site', domain: 'Domínio', languages: 'Línguas', regions: 'Temas / regiões', currentItems: 'Entradas atuais',
            latest: 'Entrada mais recente', status: 'Estado técnico', statusUnknown: 'Sem verificação técnica separada',
            available: 'Disponível', unavailable: 'Indisponível', lastCheck: 'Última atualização bem-sucedida', recent: 'Entradas recentes',
            close: 'Fechar', filter: 'Mostrar apenas esta fonte', info: 'Perfil', note: 'Este perfil é gerado a partir dos dados disponíveis na aplicação. Não é uma avaliação política nem uma recomendação.'
        },
        ru: {
            all: 'Все форматы', news: 'Новость', analysis: 'Анализ', commentary: 'Комментарий', interview: 'Интервью',
            'press-release': 'Пресс-релиз', podcast: 'Подкаст', event: 'Событие', automatic: 'Определено автоматически',
            updated: 'Обновлено', corrected: 'Исправлено', translated: 'Машинный перевод', sourceProfile: 'Профиль источника',
            website: 'Сайт', domain: 'Домен', languages: 'Языки', regions: 'Темы / регионы', currentItems: 'Текущие материалы',
            latest: 'Последний материал', status: 'Техническое состояние', statusUnknown: 'Нет отдельной технической проверки',
            available: 'Доступен', unavailable: 'Недоступен', lastCheck: 'Последнее успешное обновление', recent: 'Недавние материалы',
            close: 'Закрыть', filter: 'Показывать только этот источник', info: 'Профиль', note: 'Этот профиль создаётся из доступных данных приложения. Он не является политической оценкой или рекомендацией.'
        },
        el: {
            all: 'Όλες οι μορφές', news: 'Είδηση', analysis: 'Ανάλυση', commentary: 'Σχόλιο', interview: 'Συνέντευξη',
            'press-release': 'Δελτίο τύπου', podcast: 'Podcast', event: 'Εκδήλωση', automatic: 'Αυτόματη ταξινόμηση',
            updated: 'Ενημερώθηκε', corrected: 'Διορθώθηκε', translated: 'Αυτόματη μετάφραση', sourceProfile: 'Προφίλ πηγής',
            website: 'Ιστότοπος', domain: 'Τομέας', languages: 'Γλώσσες', regions: 'Θέματα / περιοχές', currentItems: 'Τρέχουσες καταχωρίσεις',
            latest: 'Νεότερη καταχώριση', status: 'Τεχνική κατάσταση', statusUnknown: 'Δεν υπάρχει χωριστός τεχνικός έλεγχος',
            available: 'Διαθέσιμη', unavailable: 'Μη διαθέσιμη', lastCheck: 'Τελευταία επιτυχής ενημέρωση', recent: 'Πρόσφατες καταχωρίσεις',
            close: 'Κλείσιμο', filter: 'Εμφάνιση μόνο αυτής της πηγής', info: 'Προφίλ', note: 'Το προφίλ δημιουργείται από τα διαθέσιμα δεδομένα της εφαρμογής. Δεν αποτελεί πολιτική αξιολόγηση ή σύσταση.'
        },
        tr: {
            all: 'Tüm biçimler', news: 'Haber', analysis: 'Analiz', commentary: 'Yorum', interview: 'Söyleşi',
            'press-release': 'Basın açıklaması', podcast: 'Podcast', event: 'Etkinlik', automatic: 'Otomatik sınıflandırıldı',
            updated: 'Güncellendi', corrected: 'Düzeltildi', translated: 'Makine çevirisi', sourceProfile: 'Kaynak profili',
            website: 'Web sitesi', domain: 'Alan adı', languages: 'Diller', regions: 'Konular / bölgeler', currentItems: 'Güncel içerikler',
            latest: 'En yeni içerik', status: 'Teknik durum', statusUnknown: 'Ayrı teknik denetim yok',
            available: 'Erişilebilir', unavailable: 'Erişilemiyor', lastCheck: 'Son başarılı güncelleme', recent: 'Son içerikler',
            close: 'Kapat', filter: 'Yalnızca bu kaynağı göster', info: 'Profil', note: 'Bu profil, uygulamadaki mevcut verilerden oluşturulur. Siyasi değerlendirme veya öneri değildir.'
        }
    };

    function currentLanguage() {
        try {
            return typeof currentLang !== 'undefined' ? currentLang : (document.documentElement.lang || 'en');
        } catch {
            return document.documentElement.lang || 'en';
        }
    }

    function textSet(lang = currentLanguage()) {
        return typeTexts[lang] || typeTexts.en;
    }

    function normalize(value) {
        return String(value ?? '').trim().toLowerCase();
    }

    function articleCategories(article) {
        const values = [];
        const candidates = [article?.categories, article?.eventCategories, article?.tags, article?.eventTags];
        candidates.forEach(candidate => {
            const list = Array.isArray(candidate) ? candidate : (candidate ? [candidate] : []);
            list.forEach(value => {
                const clean = String(value ?? '').trim();
                if (clean && !values.includes(clean)) values.push(clean);
            });
        });
        const oldCategory = String(article?.kontinent || '').trim();
        if (oldCategory && !values.includes(oldCategory)) values.push(oldCategory);
        return values;
    }

    function explicitType(article) {
        const value = normalize(article?.contentType || article?.articleType || article?.format || article?.type);
        const mappings = {
            news: 'news', article: 'news', nachricht: 'news', bericht: 'news',
            analysis: 'analysis', analyse: 'analysis', essay: 'analysis', background: 'analysis',
            opinion: 'commentary', commentary: 'commentary', comment: 'commentary', kommentar: 'commentary', column: 'commentary',
            interview: 'interview', gespräch: 'interview', gespraech: 'interview',
            pressrelease: 'press-release', 'press-release': 'press-release', pressemitteilung: 'press-release', statement: 'press-release', communiqué: 'press-release', communique: 'press-release',
            podcast: 'podcast', audio: 'podcast', event: 'event', termin: 'event'
        };
        return mappings[value] || '';
    }

    function classifyArticle(article) {
        const explicit = explicitType(article);
        if (explicit) return { key: explicit, automatic: false };

        const categories = articleCategories(article).map(normalize);
        const title = normalize(article?.title);
        const combined = `${title} ${categories.join(' ')}`;

        if (article?.eventStart || article?.eventCity || categories.some(value => value === 'radar' || value.includes('event'))) {
            return { key: 'event', automatic: false };
        }
        if (article?.audioUrl || article?.enclosure || /\bpodcast\b|audiofolge|radio show/.test(combined)) {
            return { key: 'podcast', automatic: true };
        }
        if (/\binterview\b|\bgespräch\b|\bgespraech\b|questions? and answers?|\bq&a\b/.test(combined)) {
            return { key: 'interview', automatic: true };
        }
        if (/pressemitteilung|press release|communiqué|communique|official statement|stellungnahme/.test(combined)) {
            return { key: 'press-release', automatic: true };
        }
        if (/\banalysis\b|\banalyse\b|hintergrund|background|\bessay\b|theory|strategie/.test(combined)) {
            return { key: 'analysis', automatic: true };
        }
        if (/\bkommentar\b|\bcommentary\b|\bopinion\b|\bcolumn\b|meinung/.test(combined)) {
            return { key: 'commentary', automatic: true };
        }
        return { key: 'news', automatic: true };
    }

    function matchesType(article, selectedType) {
        return !selectedType || classifyArticle(article).key === selectedType;
    }

    function hasExplicitCorrection(article) {
        const values = [article?.correction, article?.corrected, article?.correctionNote, article?.status];
        return values.some(value => {
            if (value === true) return true;
            const normalized = normalize(value);
            return normalized.includes('correct') || normalized.includes('korrig');
        });
    }

    function isUpdated(article) {
        const explicit = [article?.updated, article?.isUpdated, article?.modified, article?.updatedAt, article?.modifiedAt]
            .some(value => value === true || (typeof value === 'string' && value.trim()));
        if (explicit) return true;
        const status = normalize(article?.status);
        return status.includes('updated') || status.includes('aktualisiert');
    }

    function badgeMarkup(article, lang = currentLanguage()) {
        const texts = textSet(lang);
        const classification = classifyArticle(article);
        const label = texts[classification.key] || typeTexts.en[classification.key] || classification.key;
        const autoTitle = classification.automatic ? ` title="${escapeHtml(texts.automatic)}"` : '';
        const badges = [`<span class="editorial-badge editorial-type editorial-type-${escapeHtml(classification.key)}"${autoTitle}>${escapeHtml(label)}</span>`];
        if (hasExplicitCorrection(article)) {
            badges.push(`<span class="editorial-badge editorial-corrected">${escapeHtml(texts.corrected)}</span>`);
        } else if (isUpdated(article)) {
            badges.push(`<span class="editorial-badge editorial-updated">${escapeHtml(texts.updated)}</span>`);
        }
        return `<div class="editorial-badges" aria-label="${escapeHtml(texts.all)}">${badges.join('')}</div>`;
    }

    function markTranslated(card, article, targetLanguage) {
        if (!card) return;
        let container = card.querySelector('.editorial-badges');
        if (!container) {
            container = document.createElement('div');
            container.className = 'editorial-badges';
            card.querySelector('.title')?.before(container);
        }
        let badge = container.querySelector('.editorial-translated');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'editorial-badge editorial-translated';
            container.append(badge);
        }
        const texts = textSet(targetLanguage);
        const original = String(article?.language || article?.lang || article?.originalLanguage || '').trim();
        badge.textContent = original
            ? `${texts.translated} · ${original.toUpperCase()} → ${String(targetLanguage || '').toUpperCase()}`
            : texts.translated;
    }

    function sourceName(article) {
        return String(article?.quelleName || article?.sourceName || article?.source || 'Unknown').trim();
    }

    function safeDate(value) {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function deriveCatalogFromArticles() {
        const map = new Map();
        articleData.forEach(article => {
            const name = sourceName(article);
            if (!name || name === 'Unknown') return;
            let entry = map.get(name);
            if (!entry) {
                entry = { name, articleCount: 0, languages: new Set(), categories: new Map(), latestArticleAt: '', latestArticleTitle: '', latestArticleUrl: '', website: '', domain: '' };
                map.set(name, entry);
            }
            entry.articleCount += 1;
            const language = String(article?.language || article?.lang || '').trim();
            if (language) entry.languages.add(language);
            articleCategories(article).forEach(category => entry.categories.set(category, (entry.categories.get(category) || 0) + 1));
            const link = getSafeHttpUrl(article?.link || '');
            if (link && !entry.website) {
                try {
                    const url = new URL(link);
                    entry.website = `${url.protocol}//${url.host}/`;
                    entry.domain = url.host;
                } catch {}
            }
            const date = safeDate(article?.pubDate || article?.eventStart || article?.updatedAt);
            const current = safeDate(entry.latestArticleAt);
            if (date && (!current || date > current)) {
                entry.latestArticleAt = date.toISOString();
                entry.latestArticleTitle = String(article?.title || '');
                entry.latestArticleUrl = link;
            }
        });
        return [...map.values()].map(entry => ({
            ...entry,
            languages: [...entry.languages].sort(),
            categories: [...entry.categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name]) => name)
        })).sort((a, b) => a.name.localeCompare(b.name));
    }

    async function fetchOptionalJson(url) {
        try {
            const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    async function loadCatalog(force = false) {
        if (catalogPromise && !force) return catalogPromise;
        catalogPromise = (async () => {
            const [catalog, health, registry] = await Promise.all([
                fetchOptionalJson(CATALOG_URL),
                fetchOptionalJson(HEALTH_URL),
                fetchOptionalJson('sources-registry.json')
            ]);
            if (catalog && Array.isArray(catalog.sources)) {
                catalogSources = catalog.sources;
                catalogGeneratedAt = catalog.generatedAt || '';
            } else if (Array.isArray(catalog)) {
                catalogSources = catalog;
            } else {
                catalogSources = deriveCatalogFromArticles();
                catalogGeneratedAt = new Date().toISOString();
            }
            healthData = health;
            registrySources = Array.isArray(registry?.sources) ? registry.sources : (Array.isArray(registry) ? registry : []);
            return catalogSources;
        })();
        return catalogPromise;
    }

    function findCatalogSource(name) {
        const normalized = normalize(name);
        return catalogSources.find(entry => normalize(entry?.name) === normalized)
            || deriveCatalogFromArticles().find(entry => normalize(entry?.name) === normalized)
            || { name };
    }

    function findHealth(name) {
        if (passportCore?.findHealth) return passportCore.findHealth(healthData, name);
        if (!healthData) return null;
        const candidates = Array.isArray(healthData)
            ? healthData
            : Array.isArray(healthData.sources)
                ? healthData.sources
                : Array.isArray(healthData.items)
                    ? healthData.items
                    : typeof healthData === 'object'
                        ? Object.values(healthData)
                        : [];
        const normalized = normalize(name);
        return candidates.find(entry => normalize(entry?.name || entry?.sourceName || entry?.source) === normalized) || null;
    }

    function sourceArticles(name) {
        const normalized = normalize(name);
        return articleData
            .filter(article => normalize(sourceName(article)) === normalized)
            .sort((a, b) => (safeDate(b?.pubDate || b?.eventStart)?.getTime() || 0) - (safeDate(a?.pubDate || a?.eventStart)?.getTime() || 0));
    }

    function buildModal() {
        if (document.getElementById('source-profile-modal')) return;
        const modal = document.createElement('div');
        modal.className = 'feedback-modal source-profile-modal';
        modal.id = 'source-profile-modal';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'source-profile-title');
        modal.innerHTML = `
            <h3 id="source-profile-title"></h3>
            <div id="source-profile-body" class="source-profile-body"></div>
            <div class="feedback-actions source-profile-actions">
                <button type="button" class="btn-submit" id="source-profile-filter"></button>
                <a class="btn-submit source-profile-website" id="source-profile-website" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"></a>
                <button type="button" class="btn-cancel" id="source-profile-close"></button>
            </div>`;
        document.body.append(modal);
        document.getElementById('source-profile-close')?.addEventListener('click', close);
    }

    function valueRow(label, value) {
        if (!value) return '';
        return `<div class="source-profile-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
    }

    function healthSummary(health, texts) {
        if (!health) return texts.statusUnknown;
        const failed = health.ok === false || health.available === false || health.status === 'error' || health.status === 'offline';
        return failed ? texts.unavailable : texts.available;
    }

    async function open(name) {
        buildModal();
        await loadCatalog(false);
        if (typeof closeAllModals === 'function') closeAllModals();
        const texts = textSet();
        const profile = findCatalogSource(name);
        const registry = findRegistrySource(name) || {};
        const articles = sourceArticles(name);
        const health = findHealth(name);
        const modal = document.getElementById('source-profile-modal');
        const overlay = document.getElementById('fb-overlay');
        const body = document.getElementById('source-profile-body');
        const title = document.getElementById('source-profile-title');
        const website = document.getElementById('source-profile-website');
        const filterButton = document.getElementById('source-profile-filter');
        const closeButton = document.getElementById('source-profile-close');
        if (!modal || !body || !title) return;

        title.textContent = `${texts.sourceProfile}: ${profile.name || name}`;
        const categories = Array.isArray(profile.categories) ? profile.categories.join(' · ') : '';
        const languages = Array.isArray(profile.languages) ? profile.languages.map(value => String(value).toUpperCase()).join(', ') : '';
        const latestDate = safeDate(profile.latestArticleAt);
        const latest = latestDate ? latestDate.toLocaleString() : '';
        const healthDate = safeDate(health?.lastSuccessAt || health?.lastSuccess || health?.lastChecked || health?.updatedAt || health?.checkedAt);
        const passport = passportLabels();
        const unknown = passport.unknown;
        const passportData = passportCore?.buildPassport
            ? passportCore.buildPassport({ profile, registry, health, articles, unknown })
            : {
                operator: unknown, origin: unknown, languages: languages || unknown, funding: unknown,
                sourceType: registry.mediaType || unknown, eventProximity: unknown, reportProvenance: unknown,
                documentedCorrections: unknown, feedReliability: healthSummary(health, texts), whyShownCount: articles.length
            };
        const recent = articles.slice(0, 5).map(article => {
            const url = getSafeHttpUrl(article?.link || '');
            const label = escapeHtml(article?.title || 'Untitled');
            return url ? `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${label}</a></li>` : `<li>${label}</li>`;
        }).join('');

        body.innerHTML = `
            <div class="source-profile-grid">
                ${valueRow(passport.operator, passportData.operator)}
                ${valueRow(passport.origin, passportData.origin)}
                ${valueRow(texts.domain, profile.domain || '')}
                ${valueRow(texts.languages, passportData.languages)}
                ${valueRow(passport.funding, passportData.funding)}
                ${valueRow(passport.sourceType, passportData.sourceType)}
                ${valueRow(passport.proximity, passportData.eventProximity)}
                ${valueRow(passport.provenance, passportData.reportProvenance)}
                ${valueRow(passport.corrections, passportData.documentedCorrections)}
                ${valueRow(passport.reliability, passportData.feedReliability)}
                ${valueRow(texts.regions, categories)}
                ${valueRow(texts.currentItems, String(profile.articleCount ?? articles.length))}
                ${valueRow(texts.latest, latest)}
                ${valueRow(texts.status, healthSummary(health, texts))}
                ${valueRow(texts.lastCheck, healthDate ? healthDate.toLocaleString() : (catalogGeneratedAt ? new Date(catalogGeneratedAt).toLocaleString() : ''))}
            </div>
            <h4>${escapeHtml(passport.why)}</h4><p>${escapeHtml(passport.whyText(passportData.whyShownCount))}</p>
            ${recent ? `<h4>${escapeHtml(texts.recent)}</h4><ul class="source-profile-recent">${recent}</ul>` : ''}
            <p class="source-profile-note">${escapeHtml(texts.note)}</p>`;

        if (website) {
            const url = getSafeHttpUrl(profile.website || articles[0]?.link || '');
            website.hidden = !url;
            if (url) website.href = url;
            website.textContent = texts.website;
        }
        if (filterButton) {
            filterButton.textContent = texts.filter;
            filterButton.onclick = () => {
                if (typeof filterBySource === 'function') filterBySource(profile.name || name);
                close();
            };
        }
        if (closeButton) closeButton.textContent = texts.close;
        if (overlay) overlay.hidden = false;
        modal.hidden = false;
        modal.focus?.();
    }

    function findRegistrySource(name) {
        const normalized = normalize(name);
        return registrySources.find(entry => normalize(entry?.name) === normalized) || null;
    }

    function passportLabels(lang = currentLanguage()) {
        if (passportCore?.passportLabels) return passportCore.passportLabels(lang);
        return {
            operator: 'Operator / organization', origin: 'Region of origin', funding: 'Publicly known funding',
            sourceType: 'Source type', proximity: 'Proximity to the event', provenance: 'Primary report / republication',
            corrections: 'Documented corrections', reliability: 'Technical feed reliability', why: 'Why is this source shown?',
            unknown: 'Unknown', whyText: count => `${count} current WRN entries cite this source. This is not a quality rating.`
        };
    }

    function close() {
        const modal = document.getElementById('source-profile-modal');
        const overlay = document.getElementById('fb-overlay');
        if (modal) modal.hidden = true;
        if (overlay) overlay.hidden = true;
    }

    function updateUi(lang = currentLanguage()) {
        const texts = textSet(lang);
        const select = document.getElementById('content-type-filter');
        if (select) {
            const current = select.value;
            select.textContent = '';
            const all = document.createElement('option');
            all.value = '';
            all.textContent = texts.all;
            select.append(all);
            typeOrder.forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = texts[key] || typeTexts.en[key];
                select.append(option);
            });
            if ([...select.options].some(option => option.value === current)) select.value = current;
            select.setAttribute('aria-label', texts.all);
        }
        const closeButton = document.getElementById('source-profile-close');
        if (closeButton) closeButton.textContent = texts.close;
    }

    function makeSourceListRow(name, active, onFilter) {
        const texts = textSet();
        const row = document.createElement('div');
        row.className = 'source-list-row';
        const filter = document.createElement('button');
        filter.type = 'button';
        filter.className = 'btn-micro source-list-filter';
        filter.textContent = name;
        if (active) filter.classList.add('active');
        filter.addEventListener('click', onFilter);
        const info = document.createElement('button');
        info.type = 'button';
        info.className = 'btn-micro source-list-info';
        info.textContent = `ⓘ ${texts.info}`;
        info.addEventListener('click', () => open(name));
        row.append(filter, info);
        return row;
    }

    function setArticles(items) {
        articleData = Array.isArray(items) ? items : [];
        if (!catalogSources.length) catalogSources = deriveCatalogFromArticles();
    }

    window.openSourceProfileEncoded = encoded => {
        try { open(decodeText(encoded)); } catch { open(String(encoded || '')); }
    };
    window.WRNSourceProfiles = Object.freeze({
        setArticles,
        classifyArticle,
        matchesType,
        badgeMarkup,
        markTranslated,
        makeSourceListRow,
        open,
        close,
        updateUi,
        loadCatalog
    });

    document.addEventListener('DOMContentLoaded', () => {
        buildModal();
        updateUi();
        loadCatalog(false);
    });
})();
