/* World Revolution News – gemeinsamer Podcast- und Radio-Player */
'use strict';

const mediaUiTexts = {
    en:{play:'Play', pause:'Pause', stop:'Stop', loading:'Connecting…', playing:'Playing', paused:'Paused', failed:'Audio could not be loaded.', continueAt:'Resume at'},
    de:{play:'Abspielen', pause:'Pause', stop:'Stop', loading:'Verbinde…', playing:'Läuft', paused:'Pausiert', failed:'Audio konnte nicht geladen werden.', continueAt:'Fortsetzen bei'},
    es:{play:'Reproducir', pause:'Pausa', stop:'Parar', loading:'Conectando…', playing:'Reproduciendo', paused:'Pausado', failed:'No se pudo cargar el audio.', continueAt:'Resume at'},
    fr:{play:'Lecture', pause:'Pause', stop:'Arrêter', loading:'Connexion…', playing:'Lecture', paused:'En pause', failed:'Impossible de charger l’audio.', continueAt:'Resume at'},
    it:{play:'Riproduci', pause:'Pausa', stop:'Stop', loading:'Connessione…', playing:'In riproduzione', paused:'In pausa', failed:'Impossibile caricare l’audio.', continueAt:'Resume at'},
    pt:{play:'Reproduzir', pause:'Pausa', stop:'Parar', loading:'Conectando…', playing:'Reproduzindo', paused:'Pausado', failed:'Não foi possível carregar o áudio.', continueAt:'Resume at'},
    ru:{play:'Воспроизвести', pause:'Пауза', stop:'Стоп', loading:'Подключение…', playing:'Воспроизведение', paused:'Пауза', failed:'Не удалось загрузить аудио.', continueAt:'Resume at'},
    el:{play:'Αναπαραγωγή', pause:'Παύση', stop:'Στοπ', loading:'Σύνδεση…', playing:'Αναπαραγωγή', paused:'Παύση', failed:'Δεν ήταν δυνατή η φόρτωση του ήχου.', continueAt:'Resume at'},
    tr:{play:'Oynat', pause:'Duraklat', stop:'Durdur', loading:'Bağlanıyor…', playing:'Çalıyor', paused:'Duraklatıldı', failed:'Ses yüklenemedi.', continueAt:'Resume at'}
};
const MEDIA_POSITION_STORAGE_KEY = 'wrn_media_positions_v1';
const MEDIA_POSITION_MAX_ITEMS = 30;
const mediaPositionListeners = new Set();
let lastMediaPositionSave = 0;

function dispatchMediaEvent(name, detail = {}) {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {}
}

function getStoredGlobalPlaybackRate() {
    const fromTools = window.WRNAudioTools?.getPlaybackRate?.();
    const value = Number(fromTools || localStorage.getItem('wrn_audio_playback_rate') || 1);
    return [0.75, 1, 1.25, 1.5, 1.75, 2].includes(value) ? value : 1;
}

function applyGlobalPlaybackRate() {
    const audio = document.getElementById('global-media-player');
    if (!audio) return 1;
    const rate = globalMediaState.kind === 'radio' ? 1 : getStoredGlobalPlaybackRate();
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
    updateGlobalMediaProgress();
    return rate;
}

let globalMediaState = {
    id:'', kind:'', title:'', artist:'', candidates:[], candidateIndex:0,
    statusId:'', progressId:'', timeId:'', artwork:'', initialized:false,
    resumeApplied:false
};

function mediaKindCanResume(kind) {
    return kind === 'original' || kind === 'generated';
}

function readMediaPositions() {
    try {
        const parsed = JSON.parse(localStorage.getItem(MEDIA_POSITION_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
}

function writeMediaPositions(records) {
    try { localStorage.setItem(MEDIA_POSITION_STORAGE_KEY, JSON.stringify(records)); } catch {}
    mediaPositionListeners.forEach(listener => { try { listener(); } catch {} });
}

function getSavedMediaPosition(id) {
    if (!id) return null;
    const record = readMediaPositions()[id];
    if (!record || !Number.isFinite(Number(record.position)) || Number(record.position) < 5) return null;
    return record;
}

function getRecentMediaPosition() {
    const records = Object.values(readMediaPositions())
        .filter(record => record && mediaKindCanResume(record.kind) && Number(record.position) >= 5)
        .sort((a,b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    return records[0] || null;
}

function clearSavedMediaPosition(id) {
    if (!id) return;
    const records = readMediaPositions();
    if (!(id in records)) return;
    delete records[id];
    writeMediaPositions(records);
}

function persistGlobalMediaPosition(force = false) {
    const audio = document.getElementById('global-media-player');
    if (!audio || !globalMediaState.id || !mediaKindCanResume(globalMediaState.kind)) return;
    const now = Date.now();
    if (!force && now - lastMediaPositionSave < 4000) return;
    lastMediaPositionSave = now;

    const position = Number(audio.currentTime);
    const duration = Number(audio.duration);
    if (!Number.isFinite(position) || position < 5) return;
    if (Number.isFinite(duration) && duration > 0 && (duration - position < 20 || position / duration > 0.97)) {
        clearSavedMediaPosition(globalMediaState.id);
        return;
    }

    const records = readMediaPositions();
    records[globalMediaState.id] = {
        id: globalMediaState.id,
        kind: globalMediaState.kind,
        title: globalMediaState.title,
        artist: globalMediaState.artist,
        candidates: globalMediaState.candidates,
        artwork: globalMediaState.artwork,
        position,
        duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
        updatedAt: now
    };
    const trimmed = Object.fromEntries(Object.entries(records)
        .sort(([,a],[,b]) => Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0))
        .slice(0, MEDIA_POSITION_MAX_ITEMS));
    writeMediaPositions(trimmed);
}

function applySavedMediaPosition() {
    const audio = document.getElementById('global-media-player');
    if (!audio || globalMediaState.resumeApplied || !mediaKindCanResume(globalMediaState.kind)) return;
    const record = getSavedMediaPosition(globalMediaState.id);
    globalMediaState.resumeApplied = true;
    if (!record || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const target = Math.min(Number(record.position), Math.max(0, audio.duration - 10));
    if (target >= 5) audio.currentTime = target;
}

async function resumeRecentMediaPosition() {
    const record = getRecentMediaPosition();
    if (!record) return false;
    await playGlobalMedia({
        id: record.id,
        kind: record.kind,
        title: record.title,
        artist: record.artist,
        candidates: record.candidates,
        artwork: record.artwork
    });
    return true;
}

window.WRNMediaProgress = Object.freeze({
    getRecent: getRecentMediaPosition,
    clearRecent() { const record = getRecentMediaPosition(); if (record) clearSavedMediaPosition(record.id); },
    resumeRecent: resumeRecentMediaPosition,
    subscribe(listener) { if (typeof listener === 'function') mediaPositionListeners.add(listener); return () => mediaPositionListeners.delete(listener); }
});

function getMediaUiText() {
    return mediaUiTexts[currentLang] || mediaUiTexts.en;
}

function normalizePlayableMediaUrl(value) {
    const safe = getSafeHttpUrl(value);
    if (!safe) return '';
    try {
        const url = new URL(safe);
        // Eine HTTPS-App darf keine HTTP-Audiodateien laden. Bei bekannten
        // Podcast-Hosts wird deshalb auf deren HTTPS-Adresse umgestellt.
        const upgradeHosts = new Set(['www.freie-radios.net', 'freie-radios.net']);
        if (url.protocol === 'http:' && upgradeHosts.has(url.hostname.toLowerCase())) {
            url.protocol = 'https:';
            return url.href;
        }
        if (location.protocol === 'https:' && url.protocol === 'http:') return '';
        return url.href;
    } catch { return ''; }
}

function uniquePlayableCandidates(values) {
    return [...new Set((Array.isArray(values) ? values : [values])
        .map(normalizePlayableMediaUrl)
        .filter(Boolean))];
}

function getGlobalMediaPlayer() {
    const audio = document.getElementById('global-media-player');
    if (!audio) return null;
    if (!globalMediaState.initialized) {
        globalMediaState.initialized = true;
        audio.addEventListener('loadstart', () => setGlobalMediaStatus(getMediaUiText().loading));
        audio.addEventListener('waiting', () => setGlobalMediaStatus(getMediaUiText().loading));
        audio.addEventListener('loadedmetadata', () => { applySavedMediaPosition(); applyGlobalPlaybackRate(); updateGlobalMediaProgress(); });
        audio.addEventListener('playing', () => {
            setGlobalMediaStatus(getMediaUiText().playing, 'playing');
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
            updateGlobalMediaButtons();
            dispatchMediaEvent('wrnmediastate', { state:'playing', media:{ ...globalMediaState } });
        });
        audio.addEventListener('pause', () => {
            persistGlobalMediaPosition(true);
            if (!audio.ended && globalMediaState.id) setGlobalMediaStatus(getMediaUiText().paused);
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
            updateGlobalMediaButtons();
            dispatchMediaEvent('wrnmediastate', { state:'paused', media:{ ...globalMediaState } });
        });
        audio.addEventListener('ended', () => {
            const endedMedia = { ...globalMediaState };
            clearSavedMediaPosition(endedMedia.id);
            stopGlobalMedia({ clearSaved:false, reason:'ended' });
            dispatchMediaEvent('wrnmediaended', endedMedia);
        });
        audio.addEventListener('error', () => {
            window.WRNLocalDiagnostics?.record?.('audio-load', 'Audio konnte nicht geladen werden.', globalMediaState.kind || 'audio');
            tryNextGlobalMediaCandidate();
        });
        ['durationchange', 'progress', 'emptied'].forEach(eventName => {
            audio.addEventListener(eventName, updateGlobalMediaProgress);
        });
        audio.addEventListener('timeupdate', () => { updateGlobalMediaProgress(); persistGlobalMediaPosition(false); });
        setupMediaSessionHandlers();
    }
    return audio;
}

function setGlobalMediaStatus(text, className='') {
    const globalStatus = document.getElementById('global-media-status');
    if (globalStatus) globalStatus.textContent = text || '';
    if (globalMediaState.statusId) {
        const localStatus = document.getElementById(globalMediaState.statusId);
        if (localStatus) {
            localStatus.textContent = text || '';
            localStatus.className = `media-card-status ${className}`.trim();
        }
    }
}

function updateGlobalMediaBar() {
    const bar = document.getElementById('global-media-bar');
    const title = document.getElementById('global-media-title');
    const subtitle = document.getElementById('global-media-subtitle');
    const pauseButton = document.getElementById('global-media-pause');
    const progressRow = document.getElementById('global-media-progress-row');
    const backButton = document.getElementById('global-media-back');
    const forwardButton = document.getElementById('global-media-forward');
    const isLiveRadio = globalMediaState.kind === 'radio';
    if (bar) bar.hidden = !globalMediaState.id;
    if (title) title.textContent = globalMediaState.title || 'Audio';
    if (subtitle) subtitle.textContent = globalMediaState.artist || '';
    if (pauseButton) pauseButton.hidden = isLiveRadio;
    if (progressRow) progressRow.hidden = isLiveRadio;
    if (backButton) backButton.hidden = isLiveRadio;
    if (forwardButton) forwardButton.hidden = isLiveRadio;
    updateGlobalMediaButtons();
    updateGlobalMediaProgress();
}

function formatMediaTime(value) {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const rest = total % 60;
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
        : `${minutes}:${String(rest).padStart(2, '0')}`;
}

function updateGlobalMediaProgress() {
    const audio = document.getElementById('global-media-player');
    if (!audio) return;
    const current = Number.isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0;
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const isLive = globalMediaState.kind === 'radio' || !duration;

    const updateRange = element => {
        if (!element) return;
        element.disabled = isLive || !globalMediaState.id;
        element.max = duration || 1;
        element.value = duration ? Math.min(current, duration) : 0;
    };
    const updateTime = element => {
        if (!element) return;
        element.textContent = isLive
            ? `${formatMediaTime(current)} / LIVE`
            : `${formatMediaTime(current)} / ${formatMediaTime(duration)}`;
    };

    updateRange(document.getElementById('global-media-progress'));
    updateTime(document.getElementById('global-media-time'));
    updateRange(globalMediaState.progressId ? document.getElementById(globalMediaState.progressId) : null);
    updateTime(globalMediaState.timeId ? document.getElementById(globalMediaState.timeId) : null);

    if ('mediaSession' in navigator && typeof navigator.mediaSession.setPositionState === 'function' && duration > 0) {
        try {
            navigator.mediaSession.setPositionState({
                duration,
                playbackRate: audio.playbackRate || 1,
                position: Math.min(current, Math.max(0, duration - 0.001))
            });
        } catch {}
    }
}

function seekGlobalMedia(value) {
    const audio = getGlobalMediaPlayer();
    const target = Number(value);
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0 || !Number.isFinite(target)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, target));
    updateGlobalMediaProgress();
}

function skipGlobalMedia(seconds) {
    const audio = getGlobalMediaPlayer();
    const offset = Number(seconds);
    if (!audio || globalMediaState.kind === 'radio' || !Number.isFinite(offset) || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + offset));
    updateGlobalMediaProgress();
    persistGlobalMediaPosition(true);
}

function updateGlobalMediaButtons() {
    const audio = document.getElementById('global-media-player');
    const t = getMediaUiText();
    document.querySelectorAll('.btn-media-play[data-media-id]').forEach(button => {
        const active = button.dataset.mediaId === globalMediaState.id
            && Boolean(audio)
            && !audio.paused;
        button.textContent = `▶ ${t.play}`;
        button.classList.toggle('is-playing', active);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', active ? `${t.playing}: ${globalMediaState.title || t.play}` : t.play);
    });
    document.querySelectorAll('.btn-media-pause[data-media-id]').forEach(button => {
        const active = button.dataset.mediaId === globalMediaState.id;
        button.textContent = `❚❚ ${t.pause}`;
        button.disabled = !active || !audio || audio.paused;
    });
    document.querySelectorAll('.btn-media-stop[data-media-id]').forEach(button => {
        button.textContent = `■ ${t.stop}`;
        button.disabled = button.dataset.mediaId !== globalMediaState.id;
    });
    const globalPlay = document.getElementById('global-media-play');
    const globalPause = document.getElementById('global-media-pause');
    const globalStop = document.getElementById('global-media-stop');
    if (globalPlay) {
        globalPlay.textContent = `▶ ${t.play}`;
        globalPlay.disabled = !globalMediaState.id || Boolean(audio && !audio.paused);
    }
    if (globalPause) {
        globalPause.textContent = `❚❚ ${t.pause}`;
        globalPause.disabled = !globalMediaState.id || !audio || audio.paused;
    }
    if (globalStop) {
        globalStop.textContent = `■ ${t.stop}`;
        globalStop.disabled = !globalMediaState.id;
    }
}

function setMediaSessionMetadata(config) {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const artwork = normalizePlayableMediaUrl(config.artwork) || new URL('icon.svg', location.href).href;
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: config.title || 'World Revolution News',
            artist: config.artist || (config.kind === 'radio' ? 'Live-Radio' : 'Podcast'),
            album: 'World Revolution News',
            artwork: [{ src: artwork }]
        });
    } catch (error) { console.warn('Media-Session-Metadaten:', error); }
}

function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;
    const safeSet = (action, handler) => { try { navigator.mediaSession.setActionHandler(action, handler); } catch {} };
    safeSet('play', () => resumeGlobalMedia());
    safeSet('pause', () => pauseGlobalMedia());
    safeSet('stop', () => stopGlobalMedia());
    safeSet('seekbackward', details => {
        const audio = getGlobalMediaPlayer(); if (!audio || !Number.isFinite(audio.duration)) return;
        audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 15));
    });
    safeSet('seekforward', details => {
        const audio = getGlobalMediaPlayer(); if (!audio || !Number.isFinite(audio.duration)) return;
        audio.currentTime = Math.min(audio.duration, audio.currentTime + (details.seekOffset || 30));
    });
    safeSet('seekto', details => {
        const audio = getGlobalMediaPlayer(); if (!audio || !Number.isFinite(details.seekTime)) return;
        audio.currentTime = Math.max(0, Math.min(audio.duration || details.seekTime, details.seekTime));
    });
}

async function playGlobalMedia(config) {
    const audio = getGlobalMediaPlayer();
    if (!audio) return;
    const candidates = uniquePlayableCandidates(config.candidates || config.url || []);
    if (!candidates.length) {
        globalMediaState = { ...globalMediaState, id:config.id || '', statusId:config.statusId || '' };
        setGlobalMediaStatus(getMediaUiText().failed, 'error');
        return;
    }

    if (globalMediaState.id === config.id && audio.src) {
        if (audio.paused) {
            try { await audio.play(); } catch (error) {
                console.warn('Audio playback failed', error);
                setGlobalMediaStatus(getMediaUiText().failed, 'error');
            }
        }
        updateGlobalMediaButtons();
        updateGlobalMediaProgress();
        return;
    }

    persistGlobalMediaPosition(true);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    globalMediaState = {
        id:String(config.id || ''), kind:String(config.kind || ''), title:String(config.title || 'Audio'),
        artist:String(config.artist || ''), candidates, candidateIndex:0,
        statusId:String(config.statusId || ''), progressId:String(config.progressId || ''),
        timeId:String(config.timeId || ''), artwork:String(config.artwork || ''), initialized:true, resumeApplied:false
    };
    audio.src = candidates[0];
    audio.preload = 'none';
    applyGlobalPlaybackRate();
    updateGlobalMediaBar();
    setMediaSessionMetadata(globalMediaState);
    setGlobalMediaStatus(getMediaUiText().loading);
    dispatchMediaEvent('wrnmediachange', { ...globalMediaState });
    try { await audio.play(); }
    catch (error) {
        // Ein echter Medienfehler löst zusätzlich das error-Ereignis aus. Eine
        // Browser-Autoplay-Sperre wird hier verständlich angezeigt.
        console.warn('Audio playback failed', error);
        if (error?.name === 'NotAllowedError') setGlobalMediaStatus(getMediaUiText().failed, 'error');
        else if (!audio.error) setGlobalMediaStatus(getMediaUiText().failed, 'error');
    }
}

function tryNextGlobalMediaCandidate() {
    const audio = getGlobalMediaPlayer();
    if (!audio || !globalMediaState.id) return;
    if (globalMediaState.candidateIndex + 1 < globalMediaState.candidates.length) {
        globalMediaState.candidateIndex += 1;
        globalMediaState.resumeApplied = false;
        audio.src = globalMediaState.candidates[globalMediaState.candidateIndex];
        setGlobalMediaStatus(getMediaUiText().loading);
        audio.load();
        audio.play().catch(() => {});
        return;
    }
    const failedStatusId = globalMediaState.statusId;
    const failedText = getMediaUiText().failed;
    stopGlobalMedia({ clearSaved:false, reason:'error' });
    if (failedStatusId) {
        const status = document.getElementById(failedStatusId);
        if (status) {
            status.textContent = failedText;
            status.className = 'media-card-status error';
        }
    }
}

function pauseGlobalMedia() {
    const audio = getGlobalMediaPlayer();
    if (audio && !audio.paused) audio.pause();
    persistGlobalMediaPosition(true);
}

async function resumeGlobalMedia() {
    const audio = getGlobalMediaPlayer();
    if (!audio || !globalMediaState.id || !audio.paused) return;
    try { await audio.play(); } catch (error) {
        console.warn('Audio playback failed', error);
        setGlobalMediaStatus(getMediaUiText().failed, 'error');
    }
}

function stopGlobalMedia(options = {}) {
    const audio = getGlobalMediaPlayer();
    if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
    }
    const oldMedia = { ...globalMediaState };
    const oldMediaId = globalMediaState.id;
    const oldStatusId = globalMediaState.statusId;
    const oldProgressId = globalMediaState.progressId;
    const oldTimeId = globalMediaState.timeId;
    globalMediaState = {
        id:'', kind:'', title:'', artist:'', candidates:[], candidateIndex:0,
        statusId:'', progressId:'', timeId:'', artwork:'', initialized:true, resumeApplied:false
    };
    if (options.clearSaved !== false && oldMediaId) clearSavedMediaPosition(oldMediaId);
    if (oldStatusId) { const status = document.getElementById(oldStatusId); if (status) status.textContent = ''; }
    if (oldProgressId) { const progress = document.getElementById(oldProgressId); if (progress) { progress.value = 0; progress.disabled = true; } }
    if (oldTimeId) { const time = document.getElementById(oldTimeId); if (time) time.textContent = '0:00 / 0:00'; }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        try { navigator.mediaSession.metadata = null; } catch {}
    }
    updateGlobalMediaBar();
    dispatchMediaEvent('wrnmediachange', { ...globalMediaState });
    if (oldMediaId) dispatchMediaEvent('wrnmediastopped', { ...oldMedia, reason:String(options.reason || 'manual') });
}

function setGlobalMediaPlaybackRate(value) {
    const numeric = Number(value);
    const allowed = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const rate = allowed.includes(numeric) ? numeric : 1;
    const audio = getGlobalMediaPlayer();
    if (!audio || globalMediaState.kind === 'radio') return 1;
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
    updateGlobalMediaProgress();
    dispatchMediaEvent('wrnmediaratechange', { rate });
    return rate;
}

function getGlobalMediaState() {
    const audio = document.getElementById('global-media-player');
    return {
        ...globalMediaState,
        paused: !audio || audio.paused,
        currentTime: Number(audio?.currentTime || 0),
        duration: Number.isFinite(audio?.duration) ? Number(audio.duration) : 0,
        playbackRate: Number(audio?.playbackRate || 1)
    };
}

window.WRNMediaPlayer = Object.freeze({
    getState: getGlobalMediaState,
    setPlaybackRate: setGlobalMediaPlaybackRate,
    seek: seekGlobalMedia,
    skip: skipGlobalMedia,
    play: playGlobalMedia,
    pause: pauseGlobalMedia,
    resume: resumeGlobalMedia,
    stop: stopGlobalMedia
});

function safeDomId(value) { return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 140); }
function appendSimpleMediaControls(card, config) {
    const mediaConfig = { ...config };
    const row = document.createElement('div');
    row.className = 'media-button-row';

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'btn-media-play';
    play.dataset.mediaId = mediaConfig.id;
    play.textContent = `▶ ${getMediaUiText().play}`;
    play.setAttribute('aria-pressed', 'false');
    play.addEventListener('click', () => playGlobalMedia(mediaConfig));
    row.append(play);

    if (mediaConfig.showPause) {
        const pause = document.createElement('button');
        pause.type = 'button';
        pause.className = 'btn-media-pause';
        pause.dataset.mediaId = mediaConfig.id;
        pause.textContent = `❚❚ ${getMediaUiText().pause}`;
        pause.disabled = true;
        pause.addEventListener('click', () => {
            if (globalMediaState.id === mediaConfig.id) pauseGlobalMedia();
        });
        row.append(pause);
    }

    if (mediaConfig.showStop !== false) {
        const stop = document.createElement('button');
        stop.type = 'button';
        stop.className = 'btn-media-stop';
        stop.dataset.mediaId = mediaConfig.id;
        stop.textContent = `■ ${getMediaUiText().stop}`;
        stop.disabled = mediaConfig.id !== globalMediaState.id;
        stop.addEventListener('click', () => {
            if (globalMediaState.id === mediaConfig.id) stopGlobalMedia();
        });
        row.append(stop);
    }
    card.append(row);

    if (mediaConfig.showProgress) {
        const safeId = safeDomId(mediaConfig.id);
        mediaConfig.progressId = `media-progress-${safeId}`;
        mediaConfig.timeId = `media-time-${safeId}`;
        const progressRow = document.createElement('div');
        progressRow.className = 'media-progress-row';
        const progress = document.createElement('input');
        progress.type = 'range';
        progress.min = '0';
        progress.max = '1';
        progress.step = '0.1';
        progress.value = '0';
        progress.disabled = true;
        progress.id = mediaConfig.progressId;
        progress.setAttribute('aria-label', 'Audio position');
        progress.addEventListener('input', () => {
            if (globalMediaState.id === mediaConfig.id) seekGlobalMedia(progress.value);
        });
        const time = document.createElement('span');
        time.id = mediaConfig.timeId;
        time.className = 'media-time-label';
        time.textContent = '0:00 / 0:00';
        progressRow.append(progress, time);
        card.append(progressRow);
    }

    const status = document.createElement('div');
    status.className = 'media-card-status';
    status.id = mediaConfig.statusId;
    card.append(status);
    const savedPosition = getSavedMediaPosition(mediaConfig.id);
    if (savedPosition && globalMediaState.id !== mediaConfig.id) {
        status.textContent = `${getMediaUiText().continueAt || 'Resume at'} ${formatMediaTime(savedPosition.position)}`;
    }
    if (globalMediaState.id === mediaConfig.id) {
        const audio = getGlobalMediaPlayer();
        globalMediaState.progressId = mediaConfig.progressId || '';
        globalMediaState.timeId = mediaConfig.timeId || '';
        status.textContent = audio && !audio.paused ? getMediaUiText().playing : getMediaUiText().paused;
    }
    updateGlobalMediaButtons();
    updateGlobalMediaProgress();
}
