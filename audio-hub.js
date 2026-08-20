/* World Revolution News – Audio-Hub, Podcast-Erzeugung und Live-Radio */
'use strict';

let originalPodcastData = [];
let generatedPodcastData = [];
let radioStationData = [];
let activeAudioHubTab = localStorage.getItem('wrn_audio_hub_tab') || 'original';

const azurePodcastVoices = {
    en: [
        { value: 'en-US-AriaNeural', label: 'Aria – professional (female)' },
        { value: 'en-US-GuyNeural', label: 'Guy – newscast (male)' }
    ],
    de: [
        { value: 'de-DE-KatjaNeural', label: 'Katja (weiblich)' },
        { value: 'de-DE-ConradNeural', label: 'Conrad (männlich)' }
    ],
    es: [
        { value: 'es-ES-ElviraNeural', label: 'Elvira (femenina)' },
        { value: 'es-ES-AlvaroNeural', label: 'Álvaro (masculina)' }
    ],
    fr: [
        { value: 'fr-FR-DeniseNeural', label: 'Denise (féminine)' },
        { value: 'fr-FR-HenriNeural', label: 'Henri (masculine)' }
    ],
    it: [
        { value: 'it-IT-ElsaNeural', label: 'Elsa (femminile)' },
        { value: 'it-IT-DiegoNeural', label: 'Diego (maschile)' }
    ],
    pt: [
        { value: 'pt-BR-FranciscaNeural', label: 'Francisca (feminina)' },
        { value: 'pt-BR-AntonioNeural', label: 'Antonio (masculina)' }
    ],
    ru: [
        { value: 'ru-RU-SvetlanaNeural', label: 'Светлана (женский)' },
        { value: 'ru-RU-DmitryNeural', label: 'Дмитрий (мужской)' }
    ],
    el: [
        { value: 'el-GR-AthinaNeural', label: 'Αθηνά (γυναικεία)' },
        { value: 'el-GR-NestorasNeural', label: 'Νέστορας (ανδρική)' }
    ],
    tr: [
        { value: 'tr-TR-EmelNeural', label: 'Emel (kadın)' },
        { value: 'tr-TR-AhmetNeural', label: 'Ahmet (erkek)' }
    ]
};
let podcastGenerationArticleId = null;
let podcastLibraryCount = 0;
let podcastServiceStatus = null;


const continueListeningTexts = {
    en:{title:'Continue listening', play:'Continue', remove:'Remove', at:'at'},
    de:{title:'Weiterhören', play:'Fortsetzen', remove:'Entfernen', at:'bei'},
    es:{title:'Seguir escuchando', play:'Continuar', remove:'Quitar', at:'en'},
    fr:{title:'Reprendre', play:'Continuer', remove:'Retirer', at:'à'},
    it:{title:'Continua l’ascolto', play:'Continua', remove:'Rimuovi', at:'a'},
    pt:{title:'Continuar a ouvir', play:'Continuar', remove:'Remover', at:'em'},
    ru:{title:'Продолжить прослушивание', play:'Продолжить', remove:'Убрать', at:'с'},
    el:{title:'Συνέχεια ακρόασης', play:'Συνέχεια', remove:'Αφαίρεση', at:'στο'},
    tr:{title:'Dinlemeye devam et', play:'Devam et', remove:'Kaldır', at:'konum'}
};

function getContinueListeningText() {
    return continueListeningTexts[currentLang] || continueListeningTexts.en;
}

function renderContinueListening() {
    const box = document.getElementById('continue-listening');
    if (!box) return;
    const record = window.WRNMediaProgress?.getRecent?.();
    box.hidden = !record;
    if (!record) return;

    const t = getContinueListeningText();
    setTxt('continue-listening-label', t.title);
    setTxt('continue-listening-title', record.title || 'Podcast');
    setTxt('continue-listening-meta', `${record.artist || ''}${record.position ? ` · ${t.at} ${formatMediaTime(record.position)}` : ''}`);
    setTxt('continue-listening-play', `▶ ${t.play}`);
    setTxt('continue-listening-remove', t.remove);
}

async function resumeContinueListening() {
    await window.WRNMediaProgress?.resumeRecent?.();
    renderContinueListening();
}

function clearContinueListening() {
    window.WRNMediaProgress?.clearRecent?.();
    renderContinueListening();
}

function updateSharedPodcastUiText() {
    const t = uiTexte[currentLang] || uiTexte.en;
    const libraryLabel = podcastLibraryCount > 0 ? `${t.podcastLibrary} (${podcastLibraryCount})` : t.podcastLibrary;
    setTxt('txt-podcast-library', libraryLabel);
    setTxt('podcast-library-title', t.podcastLibraryTitle);
    setTxt('btn-podcast-library-refresh', t.podcastLibraryRefresh);
    setTxt('btn-podcast-library-close', t.podcastClose);
    setTxt('podcast-options-title', t.podcastOptionsTitle);
    setTxt('txt-podcast-azure-voice', t.podcastAzureVoice);
    setTxt('btn-podcast-short', t.podcastShort);
    setTxt('txt-podcast-short-help', t.podcastShortHelp);
    setTxt('btn-podcast-full', t.podcastFull);
    setTxt('txt-podcast-full-help', t.podcastFullHelp);
    setTxt('btn-podcast-device', t.podcastDevice);
    setTxt('txt-podcast-device-help', t.podcastDeviceHelp);
    setTxt('btn-podcast-options-close', t.podcastClose);
    setTxt('txt-podcast-voice-fixed', t.podcastVoiceFixed);
    setTxt('podcast-quota-title', t.podcastQuotaTitle);
    setTxt('podcast-quota-message', t.podcastQuotaInfo);
    setTxt('podcast-quota-device', t.podcastQuotaDevice);
    setTxt('txt-podcast-library', t.audioHub || t.podcastLibrary);
    setTxt('podcast-library-title', t.audioHubTitle || t.podcastLibraryTitle);
    setTxt('tab-original-podcasts', t.tabOriginal);
    setTxt('tab-generated-podcasts', t.tabGenerated);
    setTxt('tab-live-radio', t.tabRadio);
    setTxt('btn-original-podcast-refresh', t.podcastLibraryRefresh);
    setTxt('live-radio-note', t.liveRadioNote);
    setPh('original-podcast-search', t.searchPodcasts);
    if (podcastServiceStatus) renderPodcastQuotaStatus(podcastServiceStatus);
    renderContinueListening();
    window.WRNAudioTools?.updateLabels?.();
    window.WRNAudioTools?.renderQueue?.();
}

function setAzurePodcastControlsDisabled(disabled) {
    ['btn-podcast-short', 'btn-podcast-full'].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = Boolean(disabled);
    });
    const voiceSelect = document.getElementById('azure-podcast-voice-select');
    if (voiceSelect) voiceSelect.disabled = Boolean(disabled);
}

function formatPodcastResetDate(value) {
    const date = new Date(value || '');
    if (!Number.isFinite(date.getTime())) return '';
    try {
        return new Intl.DateTimeFormat(currentLang === 'en' ? 'en-US' : currentLang, {
            dateStyle: 'long', timeStyle: 'short'
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
}

function renderPodcastQuotaStatus(statusData) {
    const t = uiTexte[currentLang] || uiTexte.en;
    const status = document.getElementById('podcast-quota-status');
    if (!status) return;
    const available = Boolean(statusData?.naturalVoicesAvailable);
    status.classList.toggle('available', available);
    status.classList.toggle('unavailable', !available);
    if (available) {
        status.textContent = t.podcastQuotaAvailable;
    } else {
        const reset = formatPodcastResetDate(statusData?.resetAt);
        status.textContent = reset
            ? `${t.podcastQuotaUnavailable} ${t.podcastQuotaReset}: ${reset}.`
            : t.podcastQuotaUnavailable;
    }
    setAzurePodcastControlsDisabled(!available);
}

async function refreshPodcastAvailability() {
    const t = uiTexte[currentLang] || uiTexte.en;
    const status = document.getElementById('podcast-quota-status');
    if (status) {
        status.className = 'podcast-quota-status checking';
        status.textContent = t.podcastQuotaChecking;
    }
    setAzurePodcastControlsDisabled(true);
    try {
        const response = await fetch(`${PROXY_URL}/?action=podcast.status`, { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.error) throw new Error(data.message || `HTTP ${response.status}`);
        podcastServiceStatus = data;
        renderPodcastQuotaStatus(data);
        return data;
    } catch (error) {
        podcastServiceStatus = {
            naturalVoicesAvailable: false,
            reason: 'status_unavailable',
            resetAt: ''
        };
        renderPodcastQuotaStatus(podcastServiceStatus);
        if (status) status.title = String(error?.message || error);
        return podcastServiceStatus;
    }
}

function populateAzurePodcastVoiceOptions() {
    const select = document.getElementById('azure-podcast-voice-select');
    if (!select) return;
    const previous = localStorage.getItem(`wrn_azure_voice_${currentLang}`) || '';
    const voices = azurePodcastVoices[currentLang] || azurePodcastVoices.en;
    select.textContent = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.value;
        option.textContent = voice.label;
        select.append(option);
    });
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
}

function changeAzurePodcastVoice(value) {
    localStorage.setItem(`wrn_azure_voice_${currentLang}`, String(value || ''));
}

function showPodcastModal(modalId) {
    const overlay = document.getElementById('fb-overlay');
    const modal = document.getElementById(modalId);
    if (overlay) overlay.style.display = 'block';
    if (modalId === 'podcast-options-modal') {
        document.body.classList.add('wrn-podcast-options-open');
        if (modal) modal.style.display = 'flex';
    } else if (modal) {
        modal.style.display = 'block';
    }
}

async function openPodcastOptions(idNum) {
    const article = currentFilteredItems[idNum];
    if (!article) return;
    closeAllModals();
    podcastGenerationArticleId = idNum;
    const title = document.getElementById('podcast-options-article-title');
    const status = document.getElementById('podcast-options-status');
    if (title) title.textContent = article.title || '';
    if (status) status.textContent = '';
    populateAzurePodcastVoiceOptions();
    updateSharedPodcastUiText();
    setPodcastGenerationButtonsDisabled(false);
    setAzurePodcastControlsDisabled(true);
    showPodcastModal('podcast-options-modal');
    await refreshPodcastAvailability();
}

function setPodcastGenerationButtonsDisabled(disabled) {
    ['btn-podcast-short', 'btn-podcast-full', 'btn-podcast-device'].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = Boolean(disabled);
    });
}

async function generateAzurePodcast(mode) {
    const idNum = podcastGenerationArticleId;
    const article = currentFilteredItems[idNum];
    if (!article || !['short', 'full'].includes(mode)) return;
    const t = uiTexte[currentLang] || uiTexte.en;
    const status = document.getElementById('podcast-options-status');
    setPodcastGenerationButtonsDisabled(true);
    if (status) status.textContent = t.podcastGenerating;

    try {
        const translated = await translateFullArticleForLanguage(idNum, (current, total) => {
            if (status) status.textContent = `${t.podcastGenerating} ${Math.round((current / Math.max(total, 1)) * 100)}%`;
        });
        if (translated.error || !translated.text) throw new Error(translated.message || t.podcastTranslationFailed);

        applyFullTranslationToCard(idNum, translated);
        const voiceSelect = document.getElementById('azure-podcast-voice-select');
        const voice = voiceSelect?.value || (azurePodcastVoices[currentLang] || azurePodcastVoices.en)[0].value;
        changeAzurePodcastVoice(voice);

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Id': getClientId()
            },
            body: JSON.stringify({
                action: 'podcast.generate',
                targetLanguage: currentLang,
                mode,
                voice,
                title: String(translated.title || article.title || '').slice(0, 300),
                text: String(translated.text || '').slice(0, mode === 'short' ? 12000 : 9000),
                articleUrl: getSafeHttpUrl(article.link),
                source: String(article.quelleName || '').slice(0, 120)
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.error || !data.podcast) {
            const generationError = new Error(data.message || `HTTP ${response.status}`);
            generationError.deviceVoiceOnly = Boolean(data.deviceVoiceOnly);
            generationError.resetAt = data.resetAt || '';
            generationError.reason = data.reason || '';
            throw generationError;
        }

        if (status) status.textContent = t.podcastGenerated;
        closeAllModals();
        await openPodcastLibrary(data.podcast.id || '');
    } catch (error) {
        if (status) status.textContent = `${t.podcastGenerationFailed} ${error?.message || error}`;
        setPodcastGenerationButtonsDisabled(false);
        if (error?.deviceVoiceOnly) {
            podcastServiceStatus = {
                naturalVoicesAvailable: false,
                reason: error.reason || 'monthly_limit',
                resetAt: error.resetAt || ''
            };
            renderPodcastQuotaStatus(podcastServiceStatus);
        } else {
            await refreshPodcastAvailability();
        }
    }
}

function startDevicePodcastFromOptions() {
    const idNum = podcastGenerationArticleId;
    closeAllModals();
    if (Number.isInteger(idNum)) startPodcast(idNum);
}

async function openPodcastLibrary(highlightId = '') {
    closeAllModals();
    updateSharedPodcastUiText();
    showPodcastModal('podcast-library-modal');
    await loadPodcastLibrary(highlightId);
}

async function loadPodcastLibrary(highlightId = '') {
    const t = uiTexte[currentLang] || uiTexte.en;
    const container = document.getElementById('podcast-library-list');
    if (!container) return;
    container.textContent = t.podcastLibraryLoading;

    try {
        const response = await fetch(`${PROXY_URL}/?action=podcasts.list&limit=100`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || data.error || !Array.isArray(data.items)) throw new Error(data.message || `HTTP ${response.status}`);
        podcastLibraryCount = data.items.length;
        generatedPodcastData = data.items;
        window.WRNStatusCenter?.noteDataset('generated', {
            data: data.items,
            source: 'network',
            updatedAt: response.headers.get('date') || new Date().toISOString()
        });
        updateSharedPodcastUiText();
        renderPodcastLibrary(data.items, highlightId);
    } catch (error) {
        container.textContent = `${t.podcastGenerationFailed} ${error?.message || error}`;
    }
}


// Gemeinsamer Audio-Player: siehe media-player.js.

function renderPodcastLibrary(items, highlightId = '') {
    const t = uiTexte[currentLang] || uiTexte.en;
    const container = document.getElementById('podcast-library-list');
    if (!container) return;
    container.textContent = '';
    if (!items.length) { container.textContent = t.podcastLibraryEmpty; return; }
    const locale = currentLang === 'en' ? 'en-US' : currentLang;
    const sortedItems = [...items].sort((a,b) => {
        const aId = `generated:${a.id || a.audioUrl}`;
        const bId = `generated:${b.id || b.audioUrl}`;
        const favoriteDelta = Number(window.WRNAudioTools?.isFavorite?.(bId)) - Number(window.WRNAudioTools?.isFavorite?.(aId));
        return favoriteDelta || (new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    });
    sortedItems.forEach(item => {
        const card=document.createElement('article'); card.className='podcast-library-card';
        if (item.id === highlightId) card.classList.add('podcast-library-card-new');
        const title=document.createElement('h4'); title.textContent=item.title || 'Podcast'; card.append(title);
        const meta=document.createElement('div'); meta.className='podcast-library-meta';
        const modeLabel=item.mode === 'short' ? t.podcastModeShort : t.podcastModeFull;
        const created=item.createdAt ? new Date(item.createdAt).toLocaleString(locale) : '';
        meta.textContent=`${modeLabel} · ${(item.language || '').toUpperCase()} · ${item.voiceLabel || item.voice || ''}${created ? ` · ${t.podcastCreated}: ${created}` : ''}`; card.append(meta);
        if (item.source) { const source=document.createElement('div'); source.className='podcast-library-source'; source.textContent=`${t.podcastSource}: ${item.source}`; card.append(source); }
        const id=`generated:${item.id || item.audioUrl}`;
        const mediaConfig = { id, kind:'generated', title:item.title || 'Podcast', artist:item.source || 'World Revolution News', candidates:[item.audioUrl], statusId:`media-status-${safeDomId(id)}`, showPause:true, showProgress:true };
        appendSimpleMediaControls(card, mediaConfig);
        window.WRNAudioTools?.appendCardActions?.(card, mediaConfig, { queue:true });
        if (getSafeHttpUrl(item.articleUrl)) { const link=document.createElement('a'); link.href=item.articleUrl; link.target='_blank'; link.rel='noopener noreferrer'; link.referrerPolicy='no-referrer'; link.className='podcast-original-link'; link.textContent=t.podcastOriginal; card.append(link); }
        container.append(card);
    });
    renderContinueListening();
    window.WRNAudioTools?.renderQueue?.();
}

function pausePodcastLibraryAudio() {
    // Absichtlich leer: Audio soll beim Schließen des Fensters und bei gesperrtem Bildschirm weiterlaufen.
}

function switchAudioHubTab(tab, highlightId = '') {
    const allowed = ['original', 'generated', 'radio'];
    activeAudioHubTab = allowed.includes(tab) ? tab : 'original';
    localStorage.setItem('wrn_audio_hub_tab', activeAudioHubTab);
    const mapping = {
        original: ['panel-original-podcasts', 'tab-original-podcasts'],
        generated: ['panel-generated-podcasts', 'tab-generated-podcasts'],
        radio: ['panel-live-radio', 'tab-live-radio']
    };
    Object.entries(mapping).forEach(([key, [panelId, buttonId]]) => {
        const panel = document.getElementById(panelId);
        const button = document.getElementById(buttonId);
        if (panel) panel.hidden = key !== activeAudioHubTab;
        if (button) button.classList.toggle('active', key === activeAudioHubTab);
    });
    pausePodcastLibraryAudio();
    if (activeAudioHubTab === 'original') loadOriginalPodcasts(false);
    if (activeAudioHubTab === 'generated') loadPodcastLibrary(highlightId);
    if (activeAudioHubTab === 'radio') loadLiveRadio(false);
    renderContinueListening();
    window.WRNAudioTools?.renderQueue?.();
}

async function openAudioHub(tab = 'original', highlightId = '') {
    closeAllModals();
    updateSharedPodcastUiText();
    showPodcastModal('podcast-library-modal');
    switchAudioHubTab(tab, highlightId);
    renderContinueListening();
    window.WRNAudioTools?.renderQueue?.();
}

// Compatibility: newly generated Azure podcasts open the generated tab.
async function openPodcastLibrary(highlightId = '') {
    return openAudioHub(highlightId ? 'generated' : 'original', highlightId);
}

async function loadOriginalPodcasts(force = false) {
    const t = uiTexte[currentLang] || uiTexte.en;
    const container = document.getElementById('original-podcast-list');
    if (!container) return;
    if (originalPodcastData.length && !force) {
        populateOriginalPodcastFilters();
        renderOriginalPodcastLibrary();
        return;
    }
    container.textContent = t.originalLoading;
    try {
        const response = await fetch(`${GITHUB_PODCASTS_URL}?v=${force ? Date.now() : '1'}`, { cache: force ? 'no-store' : 'default' });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) throw new Error(`HTTP ${response.status}`);
        originalPodcastData = data.filter(item => getSafeHttpUrl(item.audioUrl));
        window.WRNStatusCenter?.noteDataset('podcasts', {
            data: originalPodcastData,
            source: 'network',
            updatedAt: response.headers.get('last-modified') || response.headers.get('date') || new Date().toISOString()
        });
        populateOriginalPodcastFilters();
        renderOriginalPodcastLibrary();
    } catch (error) {
        container.className = 'podcast-library-list media-load-error';
        container.textContent = `${t.originalEmpty} (${error?.message || error})`;
    }
}

function populateOriginalPodcastFilters() {
    const t = uiTexte[currentLang] || uiTexte.en;
    const sourceSelect = document.getElementById('original-podcast-source-filter');
    const languageSelect = document.getElementById('original-podcast-language-filter');
    if (!sourceSelect || !languageSelect) return;
    const selectedSource = sourceSelect.value;
    const selectedLanguage = languageSelect.value;
    sourceSelect.textContent = '';
    languageSelect.textContent = '';
    const sourceAll = document.createElement('option'); sourceAll.value = ''; sourceAll.textContent = t.allSources; sourceSelect.append(sourceAll);
    const languageAll = document.createElement('option'); languageAll.value = ''; languageAll.textContent = t.allLanguages; languageSelect.append(languageAll);
    [...new Set(originalPodcastData.map(item => item.sourceName).filter(Boolean))].sort().forEach(value => {
        const option = document.createElement('option'); option.value = value; option.textContent = value; sourceSelect.append(option);
    });
    [...new Set(originalPodcastData.map(item => item.language).filter(Boolean))].sort().forEach(value => {
        const option = document.createElement('option'); option.value = value; option.textContent = value.toUpperCase(); languageSelect.append(option);
    });
    if ([...sourceSelect.options].some(o => o.value === selectedSource)) sourceSelect.value = selectedSource;
    if ([...languageSelect.options].some(o => o.value === selectedLanguage)) languageSelect.value = selectedLanguage;
}

function renderOriginalPodcastLibrary() {
    const t = uiTexte[currentLang] || uiTexte.en;
    const container = document.getElementById('original-podcast-list');
    if (!container) return;
    container.className='podcast-library-list';
    const source=document.getElementById('original-podcast-source-filter')?.value || '';
    const language=document.getElementById('original-podcast-language-filter')?.value || '';
    const search=(document.getElementById('original-podcast-search')?.value || '').trim().toLowerCase();
    const favoritesOnly=Boolean(document.getElementById('original-podcast-favorites-only')?.checked);
    const items=originalPodcastData
        .filter(item => !source || item.sourceName === source)
        .filter(item => !language || item.language === language)
        .filter(item => !search || `${item.title || ''} ${item.description || ''} ${item.sourceName || ''}`.toLowerCase().includes(search))
        .filter(item => !favoritesOnly || window.WRNAudioTools?.isFavorite?.(`original:${item.id || item.audioUrl}`))
        .sort((a,b) => {
            const favoriteDelta = Number(window.WRNAudioTools?.isFavorite?.(`original:${b.id || b.audioUrl}`)) - Number(window.WRNAudioTools?.isFavorite?.(`original:${a.id || a.audioUrl}`));
            return favoriteDelta || (new Date(b.published || 0) - new Date(a.published || 0));
        });
    container.textContent='';
    if (!items.length) { container.textContent=t.originalEmpty; return; }
    items.slice(0,180).forEach(item => {
        const card=document.createElement('article'); card.className='original-podcast-card';
        const title=document.createElement('h4'); title.textContent=item.title || 'Podcast'; card.append(title);
        const meta=document.createElement('div'); meta.className='original-podcast-meta';
        const date=item.published ? new Date(item.published).toLocaleDateString(currentLang === 'en' ? 'en-US' : currentLang) : '';
        meta.textContent=`${item.sourceName || ''}${date ? ` · ${date}` : ''}${item.duration ? ` · ${item.duration}` : ''}${item.language ? ` · ${item.language.toUpperCase()}` : ''}`; card.append(meta);
        if (item.description) { const description=document.createElement('p'); description.className='original-podcast-description'; description.textContent=String(item.description).slice(0,700); card.append(description); }
        const id=`original:${item.id || item.audioUrl}`;
        const mediaConfig = {
            id, kind:'original', title:item.title || 'Podcast', artist:item.sourceName || 'Original-Podcast',
            candidates:[item.audioUrl], artwork:item.artwork || '', statusId:`media-status-${safeDomId(id)}`,
            showPause:true, showProgress:true
        };
        appendSimpleMediaControls(card, mediaConfig);
        window.WRNAudioTools?.appendCardActions?.(card, mediaConfig, { queue:true });
        const links=document.createElement('div'); links.className='original-podcast-links';
        if (getSafeHttpUrl(item.episodeUrl)) links.append(makeMediaLink(item.episodeUrl,t.listenOriginal));
        if (getSafeHttpUrl(item.feedUrl)) links.append(makeMediaLink(item.feedUrl,t.feedLink));
        if (item.license) { const license=document.createElement('span'); license.textContent=item.license; license.className='original-podcast-meta'; links.append(license); }
        card.append(links); container.append(card);
    });
    renderContinueListening();
}

function makeMediaLink(url, label) {
    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer'; link.textContent = label; return link;
}

function pauseOtherAudio() {
    // Kompatibilitätsfunktion. Der einheitliche Player stellt sicher, dass immer nur ein Audio läuft.
}

async function loadLiveRadio(force = false) {
    const t = uiTexte[currentLang] || uiTexte.en;
    const container = document.getElementById('live-radio-list');
    if (!container) return;
    if (radioStationData.length && !force) { renderLiveRadio(); return; }
    container.textContent = t.originalLoading;
    try {
        const response = await fetch(`${GITHUB_RADIO_URL}?v=${force ? Date.now() : '1'}`, { cache: force ? 'no-store' : 'default' });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) throw new Error(`HTTP ${response.status}`);
        radioStationData = data;
        window.WRNStatusCenter?.noteDataset('radio', {
            data: radioStationData,
            source: 'network',
            updatedAt: response.headers.get('last-modified') || response.headers.get('date') || new Date().toISOString()
        });
        renderLiveRadio();
    } catch (error) {
        container.className = 'live-radio-list media-load-error';
        container.textContent = `${t.radioStreamError} (${error?.message || error})`;
    }
}

function renderLiveRadio() {
    const t = uiTexte[currentLang] || uiTexte.en;
    const container=document.getElementById('live-radio-list');
    if (!container) return;
    container.className='live-radio-list'; container.textContent='';
    const favoritesOnly=Boolean(document.getElementById('live-radio-favorites-only')?.checked);
    const stations=radioStationData
        .filter(station => station.enabled !== false)
        .filter(station => !favoritesOnly || window.WRNAudioTools?.isFavorite?.(`radio:${station.id || station.name}`))
        .sort((a,b) => {
            const favoriteDelta = Number(window.WRNAudioTools?.isFavorite?.(`radio:${b.id || b.name}`)) - Number(window.WRNAudioTools?.isFavorite?.(`radio:${a.id || a.name}`));
            return favoriteDelta || String(a.name || '').localeCompare(String(b.name || ''));
        });
    stations.forEach(station => {
        const card=document.createElement('article'); card.className='live-radio-card';
        const title=document.createElement('h4'); title.textContent=station.name || 'Radio'; card.append(title);
        const meta=document.createElement('div'); meta.className='live-radio-meta';
        meta.textContent=`${station.city || ''}${station.country ? ` · ${station.country}` : ''}${station.languages?.length ? ` · ${station.languages.join(', ').toUpperCase()}` : ''}`; card.append(meta);
        if (station.description) { const desc=document.createElement('p'); desc.className='live-radio-description'; desc.textContent=station.description; card.append(desc); }
        const id=`radio:${station.id || station.name}`;
        const mediaConfig = { id, kind:'radio', title:station.name || 'Live-Radio', artist:`Live-Radio${station.city ? ` · ${station.city}` : ''}`, candidates:station.streamCandidates || [], artwork:station.artwork || '', statusId:`media-status-${safeDomId(id)}` };
        appendSimpleMediaControls(card, mediaConfig);
        window.WRNAudioTools?.appendCardActions?.(card, mediaConfig, { queue:false });
        const links=document.createElement('div'); links.className='live-radio-links';
        if (getSafeHttpUrl(station.website)) links.append(makeMediaLink(station.website,t.radioOpen));
        card.append(links); container.append(card);
    });
}



document.addEventListener('DOMContentLoaded', () => {
    window.WRNMediaProgress?.subscribe?.(renderContinueListening);
    window.addEventListener('wrnaudiofavoriteschange', () => {
        if (activeAudioHubTab === 'original' && originalPodcastData.length) renderOriginalPodcastLibrary();
        if (activeAudioHubTab === 'generated' && generatedPodcastData.length) renderPodcastLibrary(generatedPodcastData);
        if (activeAudioHubTab === 'radio' && radioStationData.length) renderLiveRadio();
    });
    renderContinueListening();
    window.WRNAudioTools?.renderQueue?.();
    window.WRNAudioTools?.updateLabels?.();
});
