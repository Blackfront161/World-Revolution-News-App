/* World Revolution News – Lesestatus, Leseposition und Nachrichtenansicht */
'use strict';

(() => {
    const BOOKMARKS_KEY = 'wrn_bookmarks';
    const READ_KEY = 'wrn_read_list';
    const POSITIONS_KEY = 'wrn_read_positions';
    const VIEW_KEY = 'wrn_news_view';
    const ALLOWED_VIEWS = new Set(['cards', 'compact', 'headlines']);
    const openCards = new Map();
    let scrollTimer = 0;

    const texts = {
        en: {
            readLater: 'Read later', saved: 'Saved', read: 'Read', markRead: 'Mark read', unread: 'Mark unread',
            readList: 'Read', viewCards: 'Standard', viewCompact: 'Compact', viewHeadlines: 'Headlines only', progress: 'Reading progress'
        },
        de: {
            readLater: 'Später lesen', saved: 'Gemerkt', read: 'Gelesen', markRead: 'Als gelesen', unread: 'Als ungelesen',
            readList: 'Gelesen', viewCards: 'Standard', viewCompact: 'Kompakt', viewHeadlines: 'Nur Titel', progress: 'Lesefortschritt'
        },
        es: { readLater:'Leer después', saved:'Guardado', read:'Leído', markRead:'Marcar leído', unread:'Marcar no leído', readList:'Leídos', viewCards:'Tarjetas', viewCompact:'Compacto', viewHeadlines:'Titulares', progress:'Progreso' },
        fr: { readLater:'Lire plus tard', saved:'Enregistré', read:'Lu', markRead:'Marquer comme lu', unread:'Marquer non lu', readList:'Lus', viewCards:'Cartes', viewCompact:'Compact', viewHeadlines:'Titres', progress:'Progression' },
        it: { readLater:'Leggi dopo', saved:'Salvato', read:'Letto', markRead:'Segna letto', unread:'Segna non letto', readList:'Letti', viewCards:'Schede', viewCompact:'Compatto', viewHeadlines:'Titoli', progress:'Avanzamento' },
        pt: { readLater:'Ler depois', saved:'Guardado', read:'Lido', markRead:'Marcar lido', unread:'Marcar não lido', readList:'Lidos', viewCards:'Cartões', viewCompact:'Compacto', viewHeadlines:'Títulos', progress:'Progresso' },
        ru: { readLater:'Прочитать позже', saved:'Сохранено', read:'Прочитано', markRead:'Отметить прочитанным', unread:'Отметить непрочитанным', readList:'Прочитано', viewCards:'Карточки', viewCompact:'Компактно', viewHeadlines:'Заголовки', progress:'Прогресс' },
        el: { readLater:'Ανάγνωση αργότερα', saved:'Αποθηκεύτηκε', read:'Διαβάστηκε', markRead:'Σήμανση ως διαβασμένο', unread:'Σήμανση ως αδιάβαστο', readList:'Διαβασμένα', viewCards:'Κάρτες', viewCompact:'Συμπαγής', viewHeadlines:'Τίτλοι', progress:'Πρόοδος' },
        tr: { readLater:'Sonra oku', saved:'Kaydedildi', read:'Okundu', markRead:'Okundu işaretle', unread:'Okunmadı işaretle', readList:'Okunanlar', viewCards:'Kartlar', viewCompact:'Kompakt', viewHeadlines:'Başlıklar', progress:'İlerleme' }
    };

    function language() {
        try {
            if (typeof currentLang !== 'undefined' && currentLang) return currentLang;
        } catch {}
        return document.documentElement.lang || 'en';
    }

    function t() {
        return texts[language()] || texts.en;
    }

    function readJson(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || 'null');
            return value ?? fallback;
        } catch {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.warn(error); }
    }

    function articleKey(articleOrLink) {
        if (typeof articleOrLink === 'string') return articleOrLink.trim();
        const article = articleOrLink || {};
        return String(article.link || `${article.quelleName || ''}::${article.title || ''}::${article.pubDate || article.eventStart || ''}`).trim();
    }

    function getBookmarks() {
        const items = readJson(BOOKMARKS_KEY, []);
        return Array.isArray(items) ? items : [];
    }

    function getReadLinks() {
        const items = readJson(READ_KEY, []);
        return Array.isArray(items) ? items.filter(Boolean) : [];
    }

    function getPositions() {
        const items = readJson(POSITIONS_KEY, {});
        return items && typeof items === 'object' && !Array.isArray(items) ? items : {};
    }

    function isBookmarked(articleOrLink) {
        const key = articleKey(articleOrLink);
        return getBookmarks().some(item => articleKey(item) === key);
    }

    function isRead(articleOrLink) {
        const key = articleKey(articleOrLink);
        return getReadLinks().includes(key);
    }

    function toggleBookmark(article) {
        const key = articleKey(article);
        const bookmarks = getBookmarks();
        const index = bookmarks.findIndex(item => articleKey(item) === key);
        if (index >= 0) bookmarks.splice(index, 1);
        else bookmarks.push(article);
        writeJson(BOOKMARKS_KEY, bookmarks);
        return index < 0;
    }

    function setRead(articleOrLink, value = true) {
        const key = articleKey(articleOrLink);
        if (!key) return false;
        const links = getReadLinks();
        const index = links.indexOf(key);
        if (value && index < 0) links.push(key);
        if (!value && index >= 0) links.splice(index, 1);
        writeJson(READ_KEY, links);
        if (value) clearPosition(articleOrLink);
        refreshVisibleState(key);
        return value;
    }

    function toggleRead(articleOrLink) {
        return setRead(articleOrLink, !isRead(articleOrLink));
    }

    function getReadArticleItems(items) {
        const keys = new Set(getReadLinks());
        return (Array.isArray(items) ? items : []).filter(item => keys.has(articleKey(item)));
    }

    function bookmarkButtonHtml(saved) {
        const label = saved ? t().saved : t().readLater;
        return `<span class="bookmark-button-content"><svg class="bookmark-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="url(#rbGrad)" stroke="#ff0000" stroke-width="0.6" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>${escapeHtml(label)}</span></span>`;
    }

    function readButtonHtml(read) {
        return read ? `✓ ${t().read}` : `○ ${t().markRead}`;
    }

    function listLabel(kind, count = 0) {
        const label = kind === 'read' ? t().readList : t().readLater;
        return count >= 0 ? `${label} (${count})` : label;
    }

    function getPosition(articleOrLink) {
        const key = articleKey(articleOrLink);
        const entry = getPositions()[key];
        if (!entry || typeof entry !== 'object') return null;
        const ratio = Number(entry.ratio);
        if (!Number.isFinite(ratio) || ratio <= 0 || ratio >= 1) return null;
        return { ...entry, ratio };
    }

    function savePosition(article, ratio) {
        const key = articleKey(article);
        if (!key || !Number.isFinite(ratio)) return;
        const cleanRatio = Math.max(0, Math.min(1, ratio));
        if (cleanRatio >= 0.94) {
            setRead(article, true);
            return;
        }
        if (cleanRatio < 0.02) return;
        const positions = getPositions();
        positions[key] = {
            ratio: cleanRatio,
            updatedAt: new Date().toISOString(),
            title: String(article?.title || '').slice(0, 300),
            link: String(article?.link || '')
        };
        writeJson(POSITIONS_KEY, positions);
        refreshProgressBar(key, cleanRatio);
    }

    function clearPosition(articleOrLink) {
        const key = articleKey(articleOrLink);
        const positions = getPositions();
        if (Object.prototype.hasOwnProperty.call(positions, key)) {
            delete positions[key];
            writeJson(POSITIONS_KEY, positions);
        }
        refreshProgressBar(key, 0);
    }

    function ratioForContent(content) {
        if (!content || content.offsetParent === null) return 0;
        const rect = content.getBoundingClientRect();
        const top = window.scrollY + rect.top;
        const height = Math.max(content.scrollHeight, rect.height, 1);
        const readingPoint = window.scrollY + Math.min(window.innerHeight * 0.45, 360);
        return Math.max(0, Math.min(1, (readingPoint - top) / height));
    }

    function trackOpenCards() {
        for (const [id, data] of openCards.entries()) {
            if (!document.documentElement.contains(data.card) || data.card.dataset.expanded !== 'true') {
                openCards.delete(id);
                continue;
            }
            savePosition(data.article, ratioForContent(data.content));
        }
    }

    function scheduleTrack() {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(trackOpenCards, 180);
    }

    function onExpand(idNum, article, card, content) {
        if (!card || !content) return;
        const id = String(idNum);
        openCards.set(id, { article, card, content });
        const stored = getPosition(article);
        if (!stored || stored.ratio < 0.03) return;
        window.requestAnimationFrame(() => {
            const rect = content.getBoundingClientRect();
            const top = window.scrollY + rect.top;
            const target = top + stored.ratio * Math.max(content.scrollHeight, rect.height, 1) - Math.min(window.innerHeight * 0.35, 280);
            window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        });
    }

    function onCollapse(idNum, article, content) {
        if (content) savePosition(article, ratioForContent(content));
        openCards.delete(String(idNum));
    }

    function progressMarkup(article, idNum) {
        const stored = getPosition(article);
        const ratio = stored?.ratio || 0;
        const percent = Math.round(ratio * 100);
        return `<div class="article-reading-progress${ratio > 0 ? ' has-progress' : ''}" id="reading-progress-${idNum}" title="${escapeHtml(t().progress)}: ${percent}%"><span style="width:${percent}%"></span></div>`;
    }

    function refreshProgressBar(key, ratio) {
        document.querySelectorAll('.card[data-article-key]').forEach(card => {
            if (card.dataset.articleKey !== key) return;
            const progress = card.querySelector('.article-reading-progress');
            if (!progress) return;
            const percent = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
            progress.classList.toggle('has-progress', percent > 0);
            const bar = progress.querySelector('span');
            if (bar) bar.style.width = `${percent}%`;
            progress.title = `${t().progress}: ${percent}%`;
        });
    }

    function refreshVisibleState(key) {
        const read = isRead(key);
        document.querySelectorAll('.card[data-article-key]').forEach(card => {
            if (card.dataset.articleKey !== key) return;
            card.classList.toggle('read', read);
            const button = card.querySelector('[id^="readstate-"]');
            if (button) {
                button.innerHTML = readButtonHtml(read);
                button.classList.toggle('is-read', read);
                button.setAttribute('aria-pressed', String(read));
            }
        });
    }

    function decorateRenderedCards(items, startIndex, count) {
        for (let index = startIndex; index < startIndex + count; index += 1) {
            const article = items[index];
            const card = document.getElementById(`card-${index}`);
            if (!article || !card) continue;
            const key = articleKey(article);
            card.dataset.articleKey = key;
            card.classList.toggle('read', isRead(article));
            const bookmarkButton = document.getElementById(`bmark-${index}`);
            if (bookmarkButton) {
                const saved = isBookmarked(article);
                bookmarkButton.innerHTML = bookmarkButtonHtml(saved);
                bookmarkButton.classList.toggle('is-bookmarked', saved);
                bookmarkButton.setAttribute('aria-pressed', String(saved));
            }
            const readButton = document.getElementById(`readstate-${index}`);
            if (readButton) {
                const read = isRead(article);
                readButton.innerHTML = readButtonHtml(read);
                readButton.classList.toggle('is-read', read);
                readButton.setAttribute('aria-pressed', String(read));
            }
        }
    }

    function getViewMode() {
        const value = localStorage.getItem(VIEW_KEY) || 'cards';
        return ALLOWED_VIEWS.has(value) ? value : 'cards';
    }

    function applyViewMode(value) {
        const mode = ALLOWED_VIEWS.has(value) ? value : 'cards';
        document.body.dataset.newsView = mode;
        localStorage.setItem(VIEW_KEY, mode);
        const select = document.getElementById('ui-news-view');
        if (select && select.value !== mode) select.value = mode;
        return mode;
    }

    function updateUi() {
        const text = t();
        const saved = getBookmarks().length;
        const read = getReadLinks().length;
        const bookmarkLabel = document.getElementById('txt-top-bookmarks');
        if (bookmarkLabel) bookmarkLabel.textContent = `${text.readLater} (${saved})`;
        const readLabel = document.getElementById('txt-top-read');
        if (readLabel) readLabel.textContent = `${text.readList} (${read})`;
        const optionCards = document.getElementById('opt-view-cards');
        const optionCompact = document.getElementById('opt-view-compact');
        const optionHeadlines = document.getElementById('opt-view-headlines');
        if (optionCards) optionCards.textContent = text.viewCards;
        if (optionCompact) optionCompact.textContent = text.viewCompact;
        if (optionHeadlines) optionHeadlines.textContent = text.viewHeadlines;
        document.querySelectorAll('[id^="bmark-"]').forEach(button => {
            const card = button.closest('.card');
            if (card) {
                const saved = isBookmarked(card.dataset.articleKey);
                button.innerHTML = bookmarkButtonHtml(saved);
                button.classList.toggle('is-bookmarked', saved);
                button.setAttribute('aria-pressed', String(saved));
            }
        });
        document.querySelectorAll('[id^="readstate-"]').forEach(button => {
            const card = button.closest('.card');
            if (card) {
                const read = isRead(card.dataset.articleKey);
                button.innerHTML = readButtonHtml(read);
                button.classList.toggle('is-read', read);
                button.setAttribute('aria-pressed', String(read));
            }
        });
    }

    function init() {
        applyViewMode(getViewMode());
        updateUi();
        window.addEventListener('scroll', scheduleTrack, { passive: true });
        window.addEventListener('pagehide', trackOpenCards);
        window.addEventListener('beforeunload', trackOpenCards);
    }

    window.changeNewsView = applyViewMode;
    window.WRNReading = Object.freeze({
        init,
        updateUi,
        articleKey,
        getBookmarks,
        getReadLinks,
        getReadArticleItems,
        isBookmarked,
        isRead,
        toggleBookmark,
        setRead,
        toggleRead,
        bookmarkButtonHtml,
        readButtonHtml,
        listLabel,
        progressMarkup,
        decorateRenderedCards,
        onExpand,
        onCollapse,
        getViewMode,
        applyViewMode
    });
})();
