/* World Revolution News 2.0 – lokale redaktionelle Prüfliste */
'use strict';

(() => {
    if (window.WRNEditorialReview) return;

    const STORAGE_KEY = 'wrn_editorial_review_decisions_v2';
    const state = {
        items: [],
        generatedAt: '',
        search: '',
        reason: 'all',
        confidence: 'all',
        decision: 'open',
        loading: false
    };
    const TEXT = {
        de: { open:'Redaktionelle Prüfliste', title:'Redaktionelle Prüfliste', intro:'Unsichere automatische Themen- und Regionszuordnungen. Entscheidungen bleiben lokal, bis sie als JSON exportiert und redaktionell übernommen werden.', close:'Schließen', refresh:'Neu laden', export:'Entscheidungen exportieren', search:'Titel oder Quelle suchen …', allReasons:'Alle Gründe', allConfidence:'Alle Sicherheiten', openItems:'Offen', reviewed:'Geprüft', allItems:'Alle', low:'Niedrig', medium:'Mittel', high:'Hoch', empty:'Keine passenden Einträge.', current:'Aktuelle Zuordnung', suggestions:'Vorschläge', region:'Region', topic:'Thema', confidence:'Sicherheit', accept:'Vorschlag übernehmen', keep:'Zuordnung bestätigen', postpone:'Später prüfen', generated:'Liste erstellt', local:'Nur auf diesem Gerät', loadError:'Die Prüfliste konnte nicht geladen werden.', noSpecific:'Keine eindeutigen Themenhinweise', lowTopic:'Niedrige Themen-Sicherheit', lowRegion:'Niedrige Regions-Sicherheit' },
        en: { open:'Editorial review list', title:'Editorial review list', intro:'Uncertain automatic topic and region assignments. Decisions remain local until exported as JSON and applied editorially.', close:'Close', refresh:'Reload', export:'Export decisions', search:'Search title or source …', allReasons:'All reasons', allConfidence:'All confidence levels', openItems:'Open', reviewed:'Reviewed', allItems:'All', low:'Low', medium:'Medium', high:'High', empty:'No matching entries.', current:'Current assignment', suggestions:'Suggestions', region:'Region', topic:'Topic', confidence:'Confidence', accept:'Use suggestion', keep:'Confirm assignment', postpone:'Review later', generated:'List created', local:'On this device only', loadError:'The review list could not be loaded.', noSpecific:'No specific topic evidence', lowTopic:'Low topic confidence', lowRegion:'Low region confidence' },
        es: { open:'Lista de revisión editorial', title:'Lista de revisión editorial', intro:'Asignaciones automáticas inciertas de tema y región. Las decisiones permanecen locales hasta exportarlas como JSON.', close:'Cerrar', refresh:'Recargar', export:'Exportar decisiones', search:'Buscar título o fuente …', allReasons:'Todos los motivos', allConfidence:'Todos los niveles', openItems:'Pendientes', reviewed:'Revisados', allItems:'Todos', low:'Baja', medium:'Media', high:'Alta', empty:'No hay entradas.', current:'Asignación actual', suggestions:'Sugerencias', region:'Región', topic:'Tema', confidence:'Confianza', accept:'Usar sugerencia', keep:'Confirmar', postpone:'Revisar después', generated:'Lista creada', local:'Solo en este dispositivo', loadError:'No se pudo cargar la lista.', noSpecific:'Sin indicios temáticos claros', lowTopic:'Baja confianza temática', lowRegion:'Baja confianza regional' },
        fr: { open:'Liste de contrôle éditorial', title:'Liste de contrôle éditorial', intro:'Attributions automatiques incertaines de thème et de région. Les décisions restent locales jusqu’à leur export JSON.', close:'Fermer', refresh:'Recharger', export:'Exporter les décisions', search:'Rechercher titre ou source …', allReasons:'Toutes les raisons', allConfidence:'Tous les niveaux', openItems:'Ouverts', reviewed:'Vérifiés', allItems:'Tous', low:'Faible', medium:'Moyenne', high:'Élevée', empty:'Aucune entrée.', current:'Attribution actuelle', suggestions:'Suggestions', region:'Région', topic:'Thème', confidence:'Confiance', accept:'Utiliser la suggestion', keep:'Confirmer', postpone:'Vérifier plus tard', generated:'Liste créée', local:'Sur cet appareil uniquement', loadError:'Impossible de charger la liste.', noSpecific:'Aucun indice thématique précis', lowTopic:'Faible confiance thématique', lowRegion:'Faible confiance régionale' },
        it: { open:'Lista di revisione editoriale', title:'Lista di revisione editoriale', intro:'Assegnazioni automatiche incerte di argomento e regione. Le decisioni restano locali fino all’esportazione JSON.', close:'Chiudi', refresh:'Ricarica', export:'Esporta decisioni', search:'Cerca titolo o fonte …', allReasons:'Tutti i motivi', allConfidence:'Tutti i livelli', openItems:'Aperti', reviewed:'Revisionati', allItems:'Tutti', low:'Bassa', medium:'Media', high:'Alta', empty:'Nessuna voce.', current:'Assegnazione attuale', suggestions:'Suggerimenti', region:'Regione', topic:'Argomento', confidence:'Affidabilità', accept:'Usa suggerimento', keep:'Conferma', postpone:'Rivedi dopo', generated:'Lista creata', local:'Solo su questo dispositivo', loadError:'Impossibile caricare la lista.', noSpecific:'Nessun indizio tematico preciso', lowTopic:'Bassa affidabilità tematica', lowRegion:'Bassa affidabilità regionale' },
        pt: { open:'Lista de revisão editorial', title:'Lista de revisão editorial', intro:'Atribuições automáticas incertas de tema e região. As decisões permanecem locais até serem exportadas em JSON.', close:'Fechar', refresh:'Recarregar', export:'Exportar decisões', search:'Pesquisar título ou fonte …', allReasons:'Todos os motivos', allConfidence:'Todos os níveis', openItems:'Abertos', reviewed:'Revistos', allItems:'Todos', low:'Baixa', medium:'Média', high:'Alta', empty:'Sem entradas.', current:'Atribuição atual', suggestions:'Sugestões', region:'Região', topic:'Tema', confidence:'Confiança', accept:'Usar sugestão', keep:'Confirmar', postpone:'Rever mais tarde', generated:'Lista criada', local:'Apenas neste dispositivo', loadError:'Não foi possível carregar a lista.', noSpecific:'Sem indícios temáticos claros', lowTopic:'Baixa confiança temática', lowRegion:'Baixa confiança regional' },
        ru: { open:'Редакторская проверка', title:'Редакторская проверка', intro:'Неуверенные автоматические назначения темы и региона. Решения хранятся локально до экспорта в JSON.', close:'Закрыть', refresh:'Обновить', export:'Экспорт решений', search:'Поиск по заголовку или источнику …', allReasons:'Все причины', allConfidence:'Все уровни', openItems:'Открытые', reviewed:'Проверенные', allItems:'Все', low:'Низкая', medium:'Средняя', high:'Высокая', empty:'Нет записей.', current:'Текущее назначение', suggestions:'Предложения', region:'Регион', topic:'Тема', confidence:'Уверенность', accept:'Принять предложение', keep:'Подтвердить', postpone:'Проверить позже', generated:'Список создан', local:'Только на этом устройстве', loadError:'Не удалось загрузить список.', noSpecific:'Нет точных тематических признаков', lowTopic:'Низкая уверенность темы', lowRegion:'Низкая уверенность региона' },
        el: { open:'Λίστα συντακτικού ελέγχου', title:'Λίστα συντακτικού ελέγχου', intro:'Αβέβαιες αυτόματες αναθέσεις θέματος και περιοχής. Οι αποφάσεις μένουν τοπικά έως την εξαγωγή JSON.', close:'Κλείσιμο', refresh:'Επαναφόρτωση', export:'Εξαγωγή αποφάσεων', search:'Αναζήτηση τίτλου ή πηγής …', allReasons:'Όλοι οι λόγοι', allConfidence:'Όλα τα επίπεδα', openItems:'Ανοιχτά', reviewed:'Ελεγμένα', allItems:'Όλα', low:'Χαμηλή', medium:'Μέση', high:'Υψηλή', empty:'Δεν υπάρχουν εγγραφές.', current:'Τρέχουσα ανάθεση', suggestions:'Προτάσεις', region:'Περιοχή', topic:'Θέμα', confidence:'Βεβαιότητα', accept:'Χρήση πρότασης', keep:'Επιβεβαίωση', postpone:'Έλεγχος αργότερα', generated:'Η λίστα δημιουργήθηκε', local:'Μόνο σε αυτή τη συσκευή', loadError:'Η λίστα δεν φορτώθηκε.', noSpecific:'Χωρίς σαφή θεματικά στοιχεία', lowTopic:'Χαμηλή θεματική βεβαιότητα', lowRegion:'Χαμηλή περιφερειακή βεβαιότητα' },
        tr: { open:'Editoryal inceleme listesi', title:'Editoryal inceleme listesi', intro:'Belirsiz otomatik konu ve bölge atamaları. Kararlar JSON olarak dışa aktarılana kadar yerel kalır.', close:'Kapat', refresh:'Yeniden yükle', export:'Kararları dışa aktar', search:'Başlık veya kaynak ara …', allReasons:'Tüm nedenler', allConfidence:'Tüm güven düzeyleri', openItems:'Açık', reviewed:'İncelendi', allItems:'Tümü', low:'Düşük', medium:'Orta', high:'Yüksek', empty:'Eşleşen kayıt yok.', current:'Mevcut atama', suggestions:'Öneriler', region:'Bölge', topic:'Konu', confidence:'Güven', accept:'Öneriyi kullan', keep:'Atamayı onayla', postpone:'Daha sonra incele', generated:'Liste oluşturuldu', local:'Yalnızca bu cihazda', loadError:'Liste yüklenemedi.', noSpecific:'Belirgin konu kanıtı yok', lowTopic:'Düşük konu güveni', lowRegion:'Düşük bölge güveni' }
    };

    const language = () => {
        const raw = document.getElementById('ui-language')?.value || document.documentElement.lang || 'en';
        const code = String(raw).toLowerCase().split(/[-_]/)[0];
        return TEXT[code] ? code : 'en';
    };
    const t = () => TEXT[language()] || TEXT.en;
    const escapeHtml = value => String(value ?? '')
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    const itemId = item => {
        const raw = String(item.link || `${item.source}|${item.title}`);
        let hash = 0;
        for (let index = 0; index < raw.length; index += 1) hash = ((hash << 5) - hash + raw.charCodeAt(index)) | 0;
        return `review-${Math.abs(hash).toString(16)}`;
    };
    const readDecisions = () => {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        } catch {
            return {};
        }
    };
    const writeDecisions = decisions => localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    const confidenceBand = value => Number(value) < .45 ? 'low' : Number(value) < .7 ? 'medium' : 'high';
    const reasonLabel = value => ({
        'no-specific-topic-evidence': t().noSpecific,
        'low-topic-confidence': t().lowTopic,
        'low-region-confidence': t().lowRegion
    }[value] || String(value || '').replaceAll('-', ' '));

    const ensureModal = () => {
        let modal = document.getElementById('wrn-editorial-review-modal');
        if (modal) return modal;
        const overlay = document.createElement('div');
        overlay.id = 'wrn-editorial-review-overlay';
        overlay.className = 'wrn-editorial-review-overlay';
        overlay.hidden = true;
        overlay.addEventListener('click', close);
        modal = document.createElement('section');
        modal.id = 'wrn-editorial-review-modal';
        modal.className = 'wrn-editorial-review-modal';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <header class="wrn-editorial-head">
                <div><h2 data-text="title"></h2><p data-text="intro"></p><small id="wrn-editorial-meta"></small></div>
                <button type="button" data-action="close">×</button>
            </header>
            <div class="wrn-editorial-toolbar">
                <input type="search" id="wrn-editorial-search">
                <select id="wrn-editorial-reason"></select>
                <select id="wrn-editorial-confidence"></select>
                <select id="wrn-editorial-decision"></select>
            </div>
            <div class="wrn-editorial-summary" id="wrn-editorial-summary"></div>
            <div class="wrn-editorial-list" id="wrn-editorial-list" aria-live="polite"></div>
            <footer>
                <button type="button" data-action="refresh"></button>
                <button type="button" data-action="export"></button>
                <button type="button" data-action="close"></button>
            </footer>`;
        modal.querySelectorAll('[data-action="close"]').forEach(button => button.addEventListener('click', close));
        modal.querySelector('[data-action="refresh"]').addEventListener('click', () => void load(true));
        modal.querySelector('[data-action="export"]').addEventListener('click', exportDecisions);
        modal.querySelector('#wrn-editorial-search').addEventListener('input', event => { state.search = event.target.value; renderList(); });
        modal.querySelector('#wrn-editorial-reason').addEventListener('change', event => { state.reason = event.target.value; renderList(); });
        modal.querySelector('#wrn-editorial-confidence').addEventListener('change', event => { state.confidence = event.target.value; renderList(); });
        modal.querySelector('#wrn-editorial-decision').addEventListener('change', event => { state.decision = event.target.value; renderList(); });
        document.body.append(overlay, modal);
        return modal;
    };

    const insertButton = () => {
        const target = document.querySelector('.wrn-more-admin-tools-184');
        if (!target || document.getElementById('wrn-editorial-review-open')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'wrn-editorial-review-open';
        button.className = 'wrn-editorial-review-open';
        button.textContent = t().open;
        button.addEventListener('click', open);
        target.append(button);
    };

    const updateLanguage = () => {
        const labels = t();
        const modal = ensureModal();
        modal.querySelector('[data-text="title"]').textContent = labels.title;
        modal.querySelector('[data-text="intro"]').textContent = labels.intro;
        modal.querySelector('#wrn-editorial-search').placeholder = labels.search;
        modal.querySelector('[data-action="refresh"]').textContent = labels.refresh;
        modal.querySelector('[data-action="export"]').textContent = labels.export;
        modal.querySelectorAll('[data-action="close"]').forEach(button => {
            if (button.textContent !== '×') button.textContent = labels.close;
            button.setAttribute('aria-label', labels.close);
        });
        const reason = modal.querySelector('#wrn-editorial-reason');
        const reasons = [...new Set(state.items.flatMap(item => item.reasons || []))].sort();
        reason.innerHTML = `<option value="all">${escapeHtml(labels.allReasons)}</option>${reasons.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(reasonLabel(value))}</option>`).join('')}`;
        reason.value = reasons.includes(state.reason) ? state.reason : 'all';
        modal.querySelector('#wrn-editorial-confidence').innerHTML = `
            <option value="all">${escapeHtml(labels.allConfidence)}</option>
            <option value="low">${escapeHtml(labels.low)}</option>
            <option value="medium">${escapeHtml(labels.medium)}</option>
            <option value="high">${escapeHtml(labels.high)}</option>`;
        modal.querySelector('#wrn-editorial-confidence').value = state.confidence;
        modal.querySelector('#wrn-editorial-decision').innerHTML = `
            <option value="open">${escapeHtml(labels.openItems)}</option>
            <option value="reviewed">${escapeHtml(labels.reviewed)}</option>
            <option value="all">${escapeHtml(labels.allItems)}</option>`;
        modal.querySelector('#wrn-editorial-decision').value = state.decision;
        const openButton = document.getElementById('wrn-editorial-review-open');
        if (openButton) openButton.textContent = labels.open;
        renderList();
    };

    const filteredItems = () => {
        const query = state.search.trim().toLocaleLowerCase();
        const decisions = readDecisions();
        return state.items.filter(item => {
            const id = itemId(item);
            const reviewed = Boolean(decisions[id]?.status && decisions[id].status !== 'postponed');
            if (state.decision === 'open' && reviewed) return false;
            if (state.decision === 'reviewed' && !reviewed) return false;
            if (state.reason !== 'all' && !(item.reasons || []).includes(state.reason)) return false;
            if (state.confidence !== 'all' && confidenceBand(item.confidence) !== state.confidence) return false;
            if (query && !`${item.title || ''} ${item.source || ''}`.toLocaleLowerCase().includes(query)) return false;
            return true;
        });
    };

    const setDecision = (item, status, topic = '') => {
        const decisions = readDecisions();
        decisions[itemId(item)] = {
            status,
            selectedTopic: topic || item.primaryTopic || '',
            title: item.title || '',
            source: item.source || '',
            link: item.link || '',
            reviewedAt: new Date().toISOString()
        };
        writeDecisions(decisions);
        renderList();
    };

    const renderList = () => {
        const modal = ensureModal();
        const list = modal.querySelector('#wrn-editorial-list');
        const summary = modal.querySelector('#wrn-editorial-summary');
        const labels = t();
        const decisions = readDecisions();
        const rows = filteredItems();
        const reviewedCount = Object.values(decisions).filter(row => row?.status && row.status !== 'postponed').length;
        summary.textContent = `${rows.length} / ${state.items.length} · ${reviewedCount} ${labels.reviewed.toLocaleLowerCase()} · ${labels.local}`;
        if (!rows.length) {
            list.innerHTML = `<p class="wrn-editorial-empty">${escapeHtml(labels.empty)}</p>`;
            return;
        }
        list.innerHTML = rows.slice(0, 300).map(item => {
            const id = itemId(item);
            const decision = decisions[id];
            const suggestions = [...new Set(item.suggestedTopics || [])].slice(0, 8);
            return `<article class="wrn-editorial-card ${decision?.status || ''}" data-review-id="${escapeHtml(id)}">
                <div class="wrn-editorial-card-head">
                    <div><strong>${escapeHtml(item.title || '')}</strong><span>${escapeHtml(item.source || '')}</span></div>
                    <span class="confidence ${confidenceBand(item.confidence)}">${escapeHtml(labels.confidence)}: ${Math.round(Number(item.confidence || 0) * 100)}%</span>
                </div>
                <div class="wrn-editorial-current"><span>${escapeHtml(labels.current)}</span><b>${escapeHtml(labels.region)}: ${escapeHtml(item.primaryRegion || '—')}</b><b>${escapeHtml(labels.topic)}: ${escapeHtml(item.primaryTopic || '—')}</b></div>
                <div class="wrn-editorial-reasons">${(item.reasons || []).map(value => `<span>${escapeHtml(reasonLabel(value))}</span>`).join('')}</div>
                <div class="wrn-editorial-suggestions"><span>${escapeHtml(labels.suggestions)}:</span>${suggestions.map(value => `<button type="button" data-topic="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join('')}</div>
                <div class="wrn-editorial-actions">
                    <button type="button" data-decision="keep">${escapeHtml(labels.keep)}</button>
                    <button type="button" data-decision="postponed">${escapeHtml(labels.postpone)}</button>
                    ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Original</a>` : ''}
                </div>
            </article>`;
        }).join('');
        list.querySelectorAll('[data-topic]').forEach(button => {
            button.addEventListener('click', () => {
                const item = state.items.find(row => itemId(row) === button.closest('[data-review-id]').dataset.reviewId);
                if (item) setDecision(item, 'accepted-suggestion', button.dataset.topic);
            });
        });
        list.querySelectorAll('[data-decision]').forEach(button => {
            button.addEventListener('click', () => {
                const item = state.items.find(row => itemId(row) === button.closest('[data-review-id]').dataset.reviewId);
                if (item) setDecision(item, button.dataset.decision);
            });
        });
    };

    const load = async force => {
        if (state.loading || (state.items.length && !force)) return;
        state.loading = true;
        const list = ensureModal().querySelector('#wrn-editorial-list');
        list.textContent = '…';
        try {
            const url = window.WRN_CONFIG?.dataUrls?.editorialReview || './editorial-review.json';
            const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}review=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            state.items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
            state.generatedAt = data.generatedAt || '';
            const meta = ensureModal().querySelector('#wrn-editorial-meta');
            meta.textContent = state.generatedAt ? `${t().generated}: ${new Date(state.generatedAt).toLocaleString(language())}` : '';
            updateLanguage();
        } catch (error) {
            list.textContent = t().loadError;
        } finally {
            state.loading = false;
        }
    };

    const exportDecisions = () => {
        const decisions = readDecisions();
        const payload = {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            sourceGeneratedAt: state.generatedAt,
            decisions: Object.values(decisions)
        };
        const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wrn-editorial-decisions-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    function open() {
        const modal = ensureModal();
        modal.hidden = false;
        document.getElementById('wrn-editorial-review-overlay').hidden = false;
        document.documentElement.classList.add('wrn-editorial-open');
        updateLanguage();
        void load(false);
    }
    function close() {
        ensureModal().hidden = true;
        document.getElementById('wrn-editorial-review-overlay').hidden = true;
        document.documentElement.classList.remove('wrn-editorial-open');
    }

    const init = () => {
        ensureModal();
        let attempts = 0;
        const timer = setInterval(() => {
            attempts += 1;
            insertButton();
            if (attempts > 120) clearInterval(timer);
        }, 250);
        document.addEventListener('click', event => {
            if (event.target?.closest?.('.wrn-header-menu')) {
                setTimeout(insertButton, 0);
            }
        });
        document.getElementById('ui-language')?.addEventListener('change', updateLanguage);
    };

    window.WRNEditorialReview = Object.freeze({ open, close, load, exportDecisions });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
