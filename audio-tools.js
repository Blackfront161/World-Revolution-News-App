/* World Revolution News – Audio-Warteschlange, Favoriten, Tempo und Schlaf-Timer */
'use strict';

(() => {
    const QUEUE_KEY = 'wrn_audio_queue_v1';
    const FAVORITES_KEY = 'wrn_audio_favorites_v1';
    const SPEED_KEY = 'wrn_audio_playback_rate';
    const QUEUE_LIMIT = 40;

    let sleepTimeout = null;
    let sleepInterval = null;
    let sleepDeadline = 0;
    let stopAtEpisodeEnd = false;
    let lastEndedId = '';

    const texts = {
        en: {
            queue:'Queue', queueEmpty:'The queue is empty.', addQueue:'Add to queue', queued:'Queued', playNow:'Play now', remove:'Remove', clear:'Clear queue',
            favorite:'Favorite', unfavorite:'Favorited', favoritesOnly:'Favorites only', speed:'Speed', sleep:'Sleep timer', off:'Off', end:'End of episode',
            timerStops:'Stops in', timerEnd:'Stops at the end of this episode', minutes:'min'
        },
        de: {
            queue:'Warteschlange', queueEmpty:'Die Warteschlange ist leer.', addQueue:'Zur Warteschlange', queued:'Eingereiht', playNow:'Jetzt abspielen', remove:'Entfernen', clear:'Leeren',
            favorite:'Favorit', unfavorite:'Favorisiert', favoritesOnly:'Nur Favoriten', speed:'Tempo', sleep:'Schlaf-Timer', off:'Aus', end:'Am Ende der Folge',
            timerStops:'Stoppt in', timerEnd:'Stoppt am Ende dieser Folge', minutes:'Min.'
        },
        es:{queue:'Cola',queueEmpty:'La cola está vacía.',addQueue:'Añadir a la cola',queued:'En cola',playNow:'Reproducir ahora',remove:'Quitar',clear:'Vaciar',favorite:'Favorito',unfavorite:'Favorito',favoritesOnly:'Solo favoritos',speed:'Velocidad',sleep:'Temporizador',off:'Desactivado',end:'Al final del episodio',timerStops:'Se detiene en',timerEnd:'Se detiene al final del episodio',minutes:'min'},
        fr:{queue:'File d’attente',queueEmpty:'La file est vide.',addQueue:'Ajouter à la file',queued:'Ajouté',playNow:'Lire maintenant',remove:'Retirer',clear:'Vider',favorite:'Favori',unfavorite:'Favori',favoritesOnly:'Favoris seulement',speed:'Vitesse',sleep:'Minuteur',off:'Désactivé',end:'Fin de l’épisode',timerStops:'Arrêt dans',timerEnd:'Arrêt à la fin de l’épisode',minutes:'min'},
        it:{queue:'Coda',queueEmpty:'La coda è vuota.',addQueue:'Aggiungi alla coda',queued:'In coda',playNow:'Riproduci ora',remove:'Rimuovi',clear:'Svuota',favorite:'Preferito',unfavorite:'Preferito',favoritesOnly:'Solo preferiti',speed:'Velocità',sleep:'Timer',off:'Disattivato',end:'Fine episodio',timerStops:'Interruzione tra',timerEnd:'Interruzione a fine episodio',minutes:'min'},
        pt:{queue:'Fila',queueEmpty:'A fila está vazia.',addQueue:'Adicionar à fila',queued:'Na fila',playNow:'Reproduzir agora',remove:'Remover',clear:'Limpar',favorite:'Favorito',unfavorite:'Favorito',favoritesOnly:'Só favoritos',speed:'Velocidade',sleep:'Temporizador',off:'Desligado',end:'Fim do episódio',timerStops:'Para em',timerEnd:'Para no fim do episódio',minutes:'min'},
        ru:{queue:'Очередь',queueEmpty:'Очередь пуста.',addQueue:'Добавить в очередь',queued:'В очереди',playNow:'Воспроизвести',remove:'Удалить',clear:'Очистить',favorite:'Избранное',unfavorite:'В избранном',favoritesOnly:'Только избранное',speed:'Скорость',sleep:'Таймер сна',off:'Выкл.',end:'В конце выпуска',timerStops:'Остановка через',timerEnd:'Остановка в конце выпуска',minutes:'мин.'},
        el:{queue:'Ουρά',queueEmpty:'Η ουρά είναι κενή.',addQueue:'Προσθήκη στην ουρά',queued:'Στην ουρά',playNow:'Αναπαραγωγή τώρα',remove:'Αφαίρεση',clear:'Καθαρισμός',favorite:'Αγαπημένο',unfavorite:'Αγαπημένο',favoritesOnly:'Μόνο αγαπημένα',speed:'Ταχύτητα',sleep:'Χρονοδιακόπτης',off:'Κλειστό',end:'Στο τέλος του επεισοδίου',timerStops:'Σταματά σε',timerEnd:'Σταματά στο τέλος του επεισοδίου',minutes:'λεπ.'},
        tr:{queue:'Sıra',queueEmpty:'Sıra boş.',addQueue:'Sıraya ekle',queued:'Sırada',playNow:'Şimdi oynat',remove:'Kaldır',clear:'Temizle',favorite:'Favori',unfavorite:'Favoride',favoritesOnly:'Yalnız favoriler',speed:'Hız',sleep:'Uyku zamanlayıcısı',off:'Kapalı',end:'Bölüm sonunda',timerStops:'Şu sürede durur',timerEnd:'Bölüm sonunda durur',minutes:'dk.'}
    };

    function t() {
        try { return texts[currentLang] || texts.en; } catch { return texts.en; }
    }

    function cleanConfig(config) {
        if (!config || !config.id) return null;
        const candidates = Array.isArray(config.candidates) ? config.candidates : [config.url || config.candidates];
        const playable = candidates.map(value => String(value || '')).filter(Boolean).slice(0, 8);
        if (!playable.length) return null;
        return {
            id: String(config.id),
            kind: String(config.kind || 'original'),
            title: String(config.title || 'Audio').slice(0, 500),
            artist: String(config.artist || '').slice(0, 300),
            candidates: playable,
            artwork: String(config.artwork || '').slice(0, 1500),
            statusId: String(config.statusId || ''),
            queuedAt: Date.now()
        };
    }

    function readQueue() {
        try {
            const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed.filter(item => item && item.id && Array.isArray(item.candidates)) : [];
        } catch { return []; }
    }

    function writeQueue(queue) {
        const normalized = queue.slice(0, QUEUE_LIMIT);
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(normalized)); } catch {}
        renderQueue();
        updateQueueButtons();
        window.dispatchEvent(new CustomEvent('wrnaudioqueuechange', { detail: { count: normalized.length } }));
    }

    function queueHas(id) {
        return readQueue().some(item => item.id === id);
    }

    function addToQueue(config) {
        const item = cleanConfig(config);
        if (!item || item.kind === 'radio') return false;
        const queue = readQueue();
        if (!queue.some(entry => entry.id === item.id)) queue.push(item);
        writeQueue(queue);
        return true;
    }

    function removeQueueItem(index) {
        const queue = readQueue();
        if (!Number.isInteger(index) || index < 0 || index >= queue.length) return;
        queue.splice(index, 1);
        writeQueue(queue);
    }

    function clearQueue() {
        writeQueue([]);
    }

    async function playQueueItem(index) {
        const queue = readQueue();
        if (!Number.isInteger(index) || index < 0 || index >= queue.length) return;
        const [item] = queue.splice(index, 1);
        writeQueue(queue);
        if (item) await playGlobalMedia(item);
    }

    async function playNextQueueItem() {
        const queue = readQueue();
        if (!queue.length) return false;
        const item = queue.shift();
        writeQueue(queue);
        await playGlobalMedia(item);
        return true;
    }

    function readFavorites() {
        try {
            const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch { return {}; }
    }

    function writeFavorites(favorites) {
        try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch {}
        updateFavoriteButtons();
        window.dispatchEvent(new CustomEvent('wrnaudiofavoriteschange'));
    }

    function isFavorite(id) {
        return Boolean(id && readFavorites()[id]);
    }

    function toggleFavorite(config) {
        const item = cleanConfig(config);
        if (!item) return false;
        const favorites = readFavorites();
        if (favorites[item.id]) delete favorites[item.id];
        else favorites[item.id] = { ...item, favoriteAt: Date.now() };
        writeFavorites(favorites);
        return Boolean(favorites[item.id]);
    }

    function favoriteFirst(items, idGetter) {
        return [...items].sort((a, b) => {
            const aId = typeof idGetter === 'function' ? idGetter(a) : a?.id;
            const bId = typeof idGetter === 'function' ? idGetter(b) : b?.id;
            const favoriteDelta = Number(isFavorite(bId)) - Number(isFavorite(aId));
            return favoriteDelta;
        });
    }

    function updateFavoriteButtons() {
        const language = t();
        document.querySelectorAll('[data-audio-favorite-id]').forEach(button => {
            const active = isFavorite(button.dataset.audioFavoriteId);
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
            button.textContent = active ? `★ ${language.unfavorite}` : `☆ ${language.favorite}`;
        });
    }

    function updateQueueButtons() {
        const language = t();
        document.querySelectorAll('[data-audio-queue-id]').forEach(button => {
            const active = queueHas(button.dataset.audioQueueId);
            button.classList.toggle('active', active);
            button.disabled = active;
            button.textContent = active ? `✓ ${language.queued}` : `＋ ${language.addQueue}`;
        });
    }

    function appendCardActions(card, config, options = {}) {
        const item = cleanConfig(config);
        if (!card || !item) return;
        const language = t();
        const row = document.createElement('div');
        row.className = 'audio-tool-card-actions';

        const favorite = document.createElement('button');
        favorite.type = 'button';
        favorite.className = 'btn-audio-favorite';
        favorite.dataset.audioFavoriteId = item.id;
        favorite.setAttribute('aria-pressed', String(isFavorite(item.id)));
        favorite.textContent = isFavorite(item.id) ? `★ ${language.unfavorite}` : `☆ ${language.favorite}`;
        favorite.addEventListener('click', () => toggleFavorite(item));
        row.append(favorite);

        if (options.queue !== false && item.kind !== 'radio') {
            const queueButton = document.createElement('button');
            queueButton.type = 'button';
            queueButton.className = 'btn-audio-queue';
            queueButton.dataset.audioQueueId = item.id;
            const queued = queueHas(item.id);
            queueButton.disabled = queued;
            queueButton.textContent = queued ? `✓ ${language.queued}` : `＋ ${language.addQueue}`;
            queueButton.addEventListener('click', () => addToQueue(item));
            row.append(queueButton);
        }

        card.append(row);
    }

    function renderQueue() {
        const panel = document.getElementById('audio-queue-panel');
        const list = document.getElementById('audio-queue-list');
        const title = document.getElementById('audio-queue-title');
        const clearButton = document.getElementById('audio-queue-clear');
        if (!panel || !list) return;
        const language = t();
        const queue = readQueue();
        panel.hidden = false;
        if (title) title.textContent = `${language.queue} (${queue.length})`;
        if (clearButton) {
            clearButton.textContent = language.clear;
            clearButton.disabled = queue.length === 0;
        }
        list.textContent = '';
        if (!queue.length) {
            const empty = document.createElement('p');
            empty.className = 'audio-queue-empty';
            empty.textContent = language.queueEmpty;
            list.append(empty);
            return;
        }
        queue.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'audio-queue-item';
            const copy = document.createElement('div');
            copy.className = 'audio-queue-copy';
            const itemTitle = document.createElement('strong');
            itemTitle.textContent = item.title || 'Podcast';
            const meta = document.createElement('small');
            meta.textContent = item.artist || '';
            copy.append(itemTitle, meta);

            const actions = document.createElement('div');
            actions.className = 'audio-queue-actions';
            const play = document.createElement('button');
            play.type = 'button';
            play.className = 'btn-media-play';
            play.textContent = `▶ ${language.playNow}`;
            play.addEventListener('click', () => playQueueItem(index));
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'btn-media-clear';
            remove.textContent = language.remove;
            remove.addEventListener('click', () => removeQueueItem(index));
            actions.append(play, remove);
            row.append(copy, actions);
            list.append(row);
        });
    }

    function setPlaybackRate(value) {
        const allowed = [0.75, 1, 1.25, 1.5, 1.75, 2];
        const numeric = allowed.includes(Number(value)) ? Number(value) : 1;
        try { localStorage.setItem(SPEED_KEY, String(numeric)); } catch {}
        window.WRNMediaPlayer?.setPlaybackRate?.(numeric);
        const select = document.getElementById('global-media-speed');
        if (select) select.value = String(numeric);
    }

    function getPlaybackRate() {
        const numeric = Number(localStorage.getItem(SPEED_KEY) || 1);
        return [0.75, 1, 1.25, 1.5, 1.75, 2].includes(numeric) ? numeric : 1;
    }

    function clearSleepTimer({ resetSelect = true } = {}) {
        if (sleepTimeout) window.clearTimeout(sleepTimeout);
        if (sleepInterval) window.clearInterval(sleepInterval);
        sleepTimeout = null;
        sleepInterval = null;
        sleepDeadline = 0;
        stopAtEpisodeEnd = false;
        if (resetSelect) {
            const select = document.getElementById('global-media-sleep');
            if (select) select.value = 'off';
        }
        updateSleepTimerUi();
    }

    function stopForSleepTimer() {
        stopGlobalMedia({ clearSaved: false });
        clearSleepTimer();
    }

    function setSleepTimer(value) {
        clearSleepTimer({ resetSelect: false });
        const select = document.getElementById('global-media-sleep');
        if (select) select.value = String(value || 'off');
        if (value === 'end') {
            const state = window.WRNMediaPlayer?.getState?.() || {};
            if (state.kind === 'radio') {
                if (select) select.value = 'off';
                return;
            }
            stopAtEpisodeEnd = true;
            updateSleepTimerUi();
            return;
        }
        const minutes = Number(value);
        if (!Number.isFinite(minutes) || minutes <= 0) {
            updateSleepTimerUi();
            return;
        }
        sleepDeadline = Date.now() + minutes * 60 * 1000;
        sleepTimeout = window.setTimeout(stopForSleepTimer, minutes * 60 * 1000);
        sleepInterval = window.setInterval(updateSleepTimerUi, 1000);
        updateSleepTimerUi();
    }

    function updateSleepTimerUi() {
        const status = document.getElementById('global-media-sleep-status');
        if (!status) return;
        const language = t();
        if (stopAtEpisodeEnd) {
            status.textContent = language.timerEnd;
            return;
        }
        if (!sleepDeadline) {
            status.textContent = '';
            return;
        }
        const seconds = Math.max(0, Math.ceil((sleepDeadline - Date.now()) / 1000));
        if (seconds <= 0) {
            stopForSleepTimer();
            return;
        }
        const minutes = Math.floor(seconds / 60);
        const rest = seconds % 60;
        status.textContent = `${language.timerStops} ${minutes}:${String(rest).padStart(2, '0')}`;
    }

    function syncControlsWithMedia() {
        const state = window.WRNMediaPlayer?.getState?.() || {};
        const isRadio = state.kind === 'radio';
        const speedField = document.getElementById('global-media-speed-field');
        const speed = document.getElementById('global-media-speed');
        const sleepEnd = document.querySelector('#global-media-sleep option[value="end"]');
        if (speedField) speedField.hidden = isRadio;
        if (speed) speed.disabled = !state.id || isRadio;
        if (sleepEnd) sleepEnd.disabled = isRadio;
        if (isRadio && stopAtEpisodeEnd) clearSleepTimer();
        if (!isRadio && state.id) setPlaybackRate(getPlaybackRate());
        updateSleepTimerUi();
    }

    function updateLabels() {
        const language = t();
        const speedLabel = document.getElementById('global-media-speed-label');
        const sleepLabel = document.getElementById('global-media-sleep-label');
        const offOption = document.querySelector('#global-media-sleep option[value="off"]');
        const endOption = document.querySelector('#global-media-sleep option[value="end"]');
        if (speedLabel) speedLabel.textContent = language.speed;
        if (sleepLabel) sleepLabel.textContent = language.sleep;
        if (offOption) offOption.textContent = language.off;
        if (endOption) endOption.textContent = language.end;
        const originalFavorites = document.getElementById('original-podcast-favorites-label');
        const radioFavorites = document.getElementById('live-radio-favorites-label');
        if (originalFavorites) originalFavorites.textContent = language.favoritesOnly;
        if (radioFavorites) radioFavorites.textContent = language.favoritesOnly;
        renderQueue();
        updateFavoriteButtons();
        updateQueueButtons();
    }

    async function handleEnded(event) {
        const ended = event?.detail || {};
        if (!ended.id || ended.id === lastEndedId) return;
        lastEndedId = ended.id;
        window.setTimeout(() => { if (lastEndedId === ended.id) lastEndedId = ''; }, 1000);
        if (stopAtEpisodeEnd) {
            clearSleepTimer();
            return;
        }
        await playNextQueueItem();
    }

    window.addEventListener('wrnmediachange', syncControlsWithMedia);
    window.addEventListener('wrnmediaended', handleEnded);
    window.addEventListener('wrnmediastopped', event => {
        if (event?.detail?.reason !== 'ended') clearSleepTimer();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const speed = document.getElementById('global-media-speed');
        if (speed) speed.value = String(getPlaybackRate());
        updateLabels();
        syncControlsWithMedia();
    });

    window.WRNAudioTools = Object.freeze({
        addToQueue,
        clearQueue,
        renderQueue,
        appendCardActions,
        isFavorite,
        favoriteFirst,
        setPlaybackRate,
        getPlaybackRate,
        setSleepTimer,
        clearSleepTimer,
        updateLabels,
        queueHas,
        getQueue: readQueue
    });

    window.setGlobalPlaybackRate = setPlaybackRate;
    window.setGlobalSleepTimer = setSleepTimer;
    window.clearAudioQueue = clearQueue;
})();
