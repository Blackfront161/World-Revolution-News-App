/* World Revolution News – transparente Übersetzungsansichten und Abschnitts-Cache */
'use strict';

(() => {
    const records = new Map();
    let activeReportKey = null;

    const texts = {
        en: {
            original: 'Original', translation: 'Translation', compare: 'Compare', report: 'Report translation',
            translatedView: 'Translated view', originalView: 'Original view', teaserOnly: 'Preview translated', full: 'Full article translated',
            originalLanguage: 'Original language', targetLanguage: 'Target language', provider: 'Provider', unknown: 'Unknown',
            compareTitle: 'Compare original and translation', originalColumn: 'Original', translatedColumn: 'Machine translation',
            compareHint: 'The comparison stays on this device and does not send article text anywhere.', close: 'Close',
            reportTitle: 'Report a translation problem', reportIntro: 'Only the article metadata, your selected problem and your note are prepared for an email. The article text is not attached.',
            issueLabel: 'Problem', issueWrongMeaning: 'Meaning is wrong', issueMissing: 'Text is missing', issueNames: 'Names or quotations changed',
            issueLanguage: 'Wrong target language', issueFormatting: 'Formatting or paragraphs are broken', issueOther: 'Other problem',
            noteLabel: 'Optional note', notePlaceholder: 'Briefly describe the problem…', send: 'Prepare email',
            cache: 'Sections already translated are reused locally.', machineTranslated: 'Machine translated', machineTranslatedFrom: 'Machine translated from {language}', openOriginal: 'Open original'
        },
        de: {
            original: 'Original', translation: 'Übersetzung', compare: 'Vergleichen', report: 'Übersetzung melden',
            translatedView: 'Übersetzte Ansicht', originalView: 'Originalansicht', teaserOnly: 'Vorschau übersetzt', full: 'Ganzer Artikel übersetzt',
            originalLanguage: 'Originalsprache', targetLanguage: 'Zielsprache', provider: 'Anbieter', unknown: 'Unbekannt',
            compareTitle: 'Original und Übersetzung vergleichen', originalColumn: 'Original', translatedColumn: 'Maschinelle Übersetzung',
            compareHint: 'Der Vergleich bleibt auf diesem Gerät und sendet keinen Artikeltext weiter.', close: 'Schließen',
            reportTitle: 'Übersetzungsproblem melden', reportIntro: 'Für die E-Mail werden nur Artikeldaten, die ausgewählte Fehlerart und deine Notiz vorbereitet. Der Artikeltext wird nicht angehängt.',
            issueLabel: 'Problem', issueWrongMeaning: 'Bedeutung ist falsch', issueMissing: 'Text fehlt', issueNames: 'Namen oder Zitate wurden verändert',
            issueLanguage: 'Falsche Zielsprache', issueFormatting: 'Formatierung oder Absätze sind beschädigt', issueOther: 'Anderes Problem',
            noteLabel: 'Optionale Notiz', notePlaceholder: 'Beschreibe das Problem kurz …', send: 'E-Mail vorbereiten',
            cache: 'Bereits übersetzte Abschnitte werden lokal wiederverwendet.', machineTranslated: 'Maschinell übersetzt', machineTranslatedFrom: 'Maschinell übersetzt aus {language}', openOriginal: 'Original öffnen'
        },
        es: {
            original:'Original', translation:'Traducción', compare:'Comparar', report:'Informar de un error',
            originalLanguage:'Idioma original', machineTranslated:'Traducción automática', machineTranslatedFrom:'Traducción automática del {language}', openOriginal:'Abrir original'
        },
        fr: {
            original:'Original', translation:'Traduction', compare:'Comparer', report:'Signaler la traduction',
            originalLanguage:'Langue d’origine', machineTranslated:'Traduit automatiquement', machineTranslatedFrom:'Traduit automatiquement depuis le {language}', openOriginal:'Ouvrir l’original'
        },
        it: {
            original:'Originale', translation:'Traduzione', compare:'Confronta', report:'Segnala la traduzione',
            originalLanguage:'Lingua originale', machineTranslated:'Traduzione automatica', machineTranslatedFrom:'Traduzione automatica da {language}', openOriginal:'Apri originale'
        },
        pt: {
            original:'Original', translation:'Tradução', compare:'Comparar', report:'Comunicar erro de tradução',
            originalLanguage:'Idioma original', machineTranslated:'Tradução automática', machineTranslatedFrom:'Tradução automática de {language}', openOriginal:'Abrir original'
        },
        ru: {
            original:'Оригинал', translation:'Перевод', compare:'Сравнить', report:'Сообщить об ошибке',
            originalLanguage:'Язык оригинала', machineTranslated:'Машинный перевод', machineTranslatedFrom:'Машинный перевод с языка: {language}', openOriginal:'Открыть оригинал'
        },
        el: {
            original:'Πρωτότυπο', translation:'Μετάφραση', compare:'Σύγκριση', report:'Αναφορά μετάφρασης',
            originalLanguage:'Γλώσσα πρωτοτύπου', machineTranslated:'Μηχανική μετάφραση', machineTranslatedFrom:'Μηχανική μετάφραση από {language}', openOriginal:'Άνοιγμα πρωτοτύπου'
        },
        tr: {
            original:'Özgün metin', translation:'Çeviri', compare:'Karşılaştır', report:'Çeviri hatası bildir',
            originalLanguage:'Özgün dil', machineTranslated:'Makine çevirisi', machineTranslatedFrom:'{language} dilinden makine çevirisi', openOriginal:'Özgün metni aç'
        }
    };

    function currentLanguage() {
        try {
            return typeof currentLang !== 'undefined' ? currentLang : (document.documentElement.lang || 'en');
        } catch {
            return document.documentElement.lang || 'en';
        }
    }

    function textSet() {
        return { ...texts.en, ...(texts[currentLanguage()] || {}) };
    }

    function articleAt(idNum) {
        try {
            return Array.isArray(currentFilteredItems) ? currentFilteredItems[idNum] : null;
        } catch {
            return null;
        }
    }

    function articleKey(article) {
        return String(article?.link || article?.guid || article?.id || article?.title || 'article').trim();
    }

    function hashText(value) {
        let hash = 2166136261;
        const text = String(value ?? '');
        for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    function articleFingerprint(article) {
        return hashText(`${article?.title || ''}\n${article?.content || ''}\n${article?.updatedAt || article?.modifiedAt || ''}`);
    }

    function chunkCacheKey(article, language, index, sourceText) {
        const firstTitle = Number(index) === 0 ? String(article?.title || '') : '';
        const fingerprint = hashText(`${firstTitle}\n${sourceText}`);
        return `translation-chunk::${articleKey(article)}::${language}::${index}::${fingerprint}`;
    }

    async function getCachedChunk(article, language, index, sourceText) {
        if (!window.WRNStorage?.getTranslation) return null;
        try {
            const value = await window.WRNStorage.getTranslation(chunkCacheKey(article, language, index, sourceText));
            if (!value || typeof value.text !== 'string' || !value.text.trim()) return null;
            return { error: false, ...value, cached: true };
        } catch (error) {
            console.warn('Übersetzungsabschnitt konnte nicht gelesen werden:', error);
            return null;
        }
    }

    async function putCachedChunk(article, language, index, sourceText, result) {
        if (!window.WRNStorage?.putTranslation || !result?.text) return;
        try {
            const source = sourceLanguage(article);
            await window.WRNStorage.putTranslation(
                chunkCacheKey(article, language, index, sourceText),
                {
                    text: String(result.text),
                    provider: String(result.provider || ''),
                    ...(source ? { sourceLanguage: source.code } : {}),
                    cachedAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.warn('Übersetzungsabschnitt konnte nicht gespeichert werden:', error);
        }
    }

    function originalTeaser(article) {
        return window.WRNNewsCardCopy?.completeFirstSentence(
            article?.content || article?.intro || '',
            currentLanguage()
        ) || '';
    }

    function translatedTeaser(record) {
        return window.WRNNewsCardCopy?.completeFirstSentence(
            record.teaser || record.text || '',
            record.language || currentLanguage()
        ) || '';
    }

    function recordKey(article, language) {
        return `${articleKey(article)}::${language}`;
    }

    function findRecord(idNum, container = null) {
        const tools = container || document.getElementById(`translation-tools-${idNum}`);
        const explicitKey = String(tools?.dataset?.translationRecordKey || '');
        if (explicitKey && records.has(explicitKey)) return records.get(explicitKey);

        const article = articleAt(idNum);
        if (!article) return null;
        return records.get(recordKey(article, currentLanguage())) || null;
    }

    function setPressed(container, mode) {
        container?.querySelectorAll('[data-translation-view]').forEach(button => {
            const active = button.dataset.translationView === mode;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }

    function applyCardValues(idNum, mode) {
        const record = findRecord(idNum);
        const article = record?.article || articleAt(idNum);
        const card = document.getElementById(`card-${idNum}`);
        const title = document.getElementById(`title-${idNum}`);
        const teaser = document.getElementById(`teaser-${idNum}`);
        const content = document.getElementById(`content-${idNum}`);
        const controls = document.getElementById(`translation-tools-${idNum}`);
        if (!article || !record || !card || !title || !teaser || !content) return;

        if (mode === 'original') {
            title.textContent = String(article.title || '');
            teaser.textContent = originalTeaser(article);
            content.textContent = String(article.content || '');
            title.classList.remove('translated');
            card.dataset.translationView = 'original';
        } else {
            title.textContent = String(record.title || article.title || '');
            teaser.textContent = translatedTeaser(record);
            content.textContent = record.scope === 'full' ? String(record.text || '') : String(article.content || '');
            title.classList.add('translated');
            card.dataset.translationView = 'translated';
        }

        const expanded = card.dataset.expanded === 'true';
        teaser.style.display = expanded ? 'none' : 'block';
        content.style.display = expanded ? 'block' : 'none';
        setPressed(controls, mode);
    }

    function showOriginal(idNum) {
        applyCardValues(idNum, 'original');
    }

    function showTranslated(idNum) {
        applyCardValues(idNum, 'translated');
    }

    function sourceLanguage(article, explicitCode = '') {
        const helper = window.WRNLanguageOrigin;
        if (!helper) return null;
        const explicit = helper.normalize(explicitCode);
        if (explicit) {
            const label = helper.displayName(explicit, currentLanguage());
            if (label) return { code: explicit, label };
        }
        return helper.fromArticle(article, currentLanguage());
    }

    function targetLanguage(code) {
        const helper = window.WRNLanguageOrigin;
        return helper?.displayName(code, currentLanguage()) || '';
    }

    function translationStatus(record, t = textSet()) {
        const source = sourceLanguage(record.article, record.sourceLanguage);
        return window.WRNNewsCardCopy?.translationNotice(
            t.machineTranslated,
            t.machineTranslatedFrom,
            source?.label || ''
        ) || t.machineTranslated;
    }

    function ensureControls(idNum, record) {
        const container = document.getElementById(`translation-tools-${idNum}`);
        if (!container) return;
        const t = textSet();
        container.hidden = false;
        container.textContent = '';
        container.dataset.translationRecordKey = recordKey(record.article, record.language);

        const buttonRow = document.createElement('div');
        buttonRow.className = 'translation-view-buttons';

        const makeButton = (label, action, view = '') => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'translation-view-button';
            button.textContent = label;
            button.dataset.translationAction = action;
            if (view) button.dataset.translationView = view;
            return button;
        };

        buttonRow.append(
            makeButton(t.original, 'original', 'original'),
            makeButton(t.translation, 'translated', 'translated'),
            makeButton(t.compare, 'compare'),
            makeButton(t.report, 'report')
        );

        const status = document.createElement('p');
        status.className = 'translation-machine-status-185';
        status.textContent = translationStatus(record, t);
        container.append(status, buttonRow);

        const originalUrl = String(record.article?.link || '');
        if (/^https?:\/\//i.test(originalUrl)) {
            const link = document.createElement('a');
            link.className = 'translation-original-link-185';
            link.href = originalUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.referrerPolicy = 'no-referrer';
            link.textContent = t.openOriginal;
            container.appendChild(link);
        }
    }

    function registerTranslation(idNum, article, translated, scope = 'full') {
        if (!article || !translated) return;
        const language = String(translated.language || currentLanguage());
        const record = {
            article,
            language,
            sourceLanguage: sourceLanguage(article, translated.sourceLanguage)?.code || '',
            scope,
            title: String(translated.title || article.title || ''),
            teaser: String(translated.teaser || ''),
            text: String(translated.text || ''),
            provider: Array.isArray(translated.providers)
                ? translated.providers.filter(Boolean).join(', ')
                : String(translated.provider || ''),
            translatedAt: translated.translatedAt || new Date().toISOString()
        };
        records.set(recordKey(article, language), record);
        ensureControls(idNum, record);
        showTranslated(idNum);
    }

    function showModal(id) {
        const overlay = document.getElementById('fb-overlay');
        const modal = document.getElementById(id);
        document.body.classList.add('wrn-translation-modal-open');
        if (overlay) overlay.style.display = 'block';
        if (modal) {
            modal.style.display = 'block';
            window.setTimeout(() => {
                modal.querySelector('button, [href], input, select, textarea')?.focus();
            }, 0);
        }
    }

    function openCompare(idNum) {
        const record = findRecord(idNum);
        if (!record) return;
        const t = textSet();
        const article = record.article;
        const originalText = record.scope === 'full' ? String(article.content || '') : originalTeaser(article);
        const translatedText = record.scope === 'full' ? String(record.text || '') : translatedTeaser(record);

        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        setText('translation-compare-title', t.compareTitle);
        setText('translation-compare-meta', translationStatus(record, t));
        setText('translation-compare-original-heading', t.originalColumn);
        setText('translation-compare-translated-heading', t.translatedColumn);
        setText('translation-compare-original-title', String(article.title || ''));
        setText('translation-compare-translated-title', record.title);
        setText('translation-compare-original-text', originalText);
        setText('translation-compare-translated-text', translatedText);
        setText('translation-compare-hint', t.compareHint);
        setText('btn-translation-compare-close', t.close);
        showModal('translation-compare-modal');
    }

    function fillReportOptions() {
        const t = textSet();
        const select = document.getElementById('translation-report-issue');
        if (!select) return;
        const options = [
            ['wrong-meaning', t.issueWrongMeaning],
            ['missing', t.issueMissing],
            ['names-quotes', t.issueNames],
            ['wrong-language', t.issueLanguage],
            ['formatting', t.issueFormatting],
            ['other', t.issueOther]
        ];
        select.textContent = '';
        options.forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            select.append(option);
        });
    }

    function openReport(idNum) {
        const record = findRecord(idNum);
        if (!record) return;
        activeReportKey = recordKey(record.article, record.language);
        const t = textSet();
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        setText('translation-report-title', t.reportTitle);
        setText('translation-report-intro', t.reportIntro);
        setText('translation-report-issue-label', t.issueLabel);
        setText('translation-report-note-label', t.noteLabel);
        setText('btn-translation-report-send', t.send);
        setText('btn-translation-report-close', t.close);
        fillReportOptions();
        const note = document.getElementById('translation-report-note');
        if (note) {
            note.value = '';
            note.placeholder = t.notePlaceholder;
        }
        showModal('translation-report-modal');
    }

    function sendReport() {
        if (!activeReportKey) return;
        const record = records.get(activeReportKey);
        if (!record) return;
        const select = document.getElementById('translation-report-issue');
        const note = document.getElementById('translation-report-note');
        const article = record.article;
        const issue = select?.options?.[select.selectedIndex]?.text || select?.value || '';
        const source = sourceLanguage(article, record.sourceLanguage);
        const body = [
            'Übersetzungsproblem in World Revolution News',
            '',
            `Artikel: ${article?.title || ''}`,
            `Quelle: ${article?.quelleName || article?.sourceName || ''}`,
            `Link: ${article?.link || ''}`,
            ...(source ? [`Originalsprache: ${source.label}`] : []),
            `Zielsprache: ${targetLanguage(record.language) || String(record.language || '').toUpperCase()}`,
            `Umfang: ${record.scope}`,
            `Problem: ${issue}`,
            '',
            `Notiz: ${String(note?.value || '').trim() || '-'}`,
            '',
            'Der Artikeltext wurde aus Datenschutzgründen nicht automatisch angehängt.'
        ].join('\n');
        const subject = `Übersetzung melden: ${String(article?.title || '').slice(0, 90)}`;
        window.location.href = `mailto:worldrevnews@brief.li?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        closeModals();
    }

    function closeModals() {
        ['translation-compare-modal', 'translation-report-modal'].forEach(id => {
            const modal = document.getElementById(id);
            if (modal) modal.style.display = 'none';
        });
        const overlay = document.getElementById('fb-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.remove('wrn-translation-modal-open');
        activeReportKey = null;
    }

    function refreshTexts() {
        document.querySelectorAll('[id^="translation-tools-"]').forEach(container => {
            const idNum = Number(container.id.replace('translation-tools-', ''));
            const matching = findRecord(idNum, container);
            if (matching && matching.language === currentLanguage()) ensureControls(idNum, matching);
        });
    }

    function handleControlClick(event) {
        const button = event.target.closest?.('[data-translation-action]');
        const container = button?.closest?.('[id^="translation-tools-"]');
        if (!button || !container) return;
        const idNum = Number(container.id.replace('translation-tools-', ''));
        if (!Number.isInteger(idNum)) return;

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.translationAction;
        if (action === 'original') showOriginal(idNum);
        if (action === 'translated') showTranslated(idNum);
        if (action === 'compare') openCompare(idNum);
        if (action === 'report') openReport(idNum);
    }

    document.addEventListener('click', handleControlClick);

    window.closeTranslationModals = closeModals;
    window.sendTranslationReport = sendReport;
    window.WRNTranslationTools = {
        articleFingerprint,
        getCachedChunk,
        putCachedChunk,
        registerTranslation,
        showOriginal,
        showTranslated,
        openCompare,
        openReport,
        closeModals,
        refreshTexts,
        sourceLanguage,
        translationStatus
    };
})();
