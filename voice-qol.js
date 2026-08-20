/* World Revolution News 1.7.5 – Gerätestimmen */
'use strict';

(() => {
  if (window.WRNVoiceTools) return;

  function appLanguage() {
    try {
      return typeof currentLang !== 'undefined' ? currentLang : (document.documentElement.lang || 'en');
    } catch {
      return document.documentElement.lang || 'en';
    }
  }

  function t(key, language = appLanguage()) {
    return window.WRNI18n?.t?.(`briefing.${key}`, language) || key;
  }

  function voiceValue(voice) {
    return voice?.name || voice?.voiceURI || '';
  }

  function qualityNameScore(name) {
    const value = String(name || '').toLowerCase();
    if (/(neural|natural|premium|enhanced|studio|wavenet)/.test(value)) return 18;
    if (/(compact|basic|espeak)/.test(value)) return -8;
    return 0;
  }

  function scoreVoice(voice, languageTag) {
    const desired = String(languageTag || '').toLowerCase();
    const prefix = desired.split('-')[0];
    const actual = String(voice?.lang || '').toLowerCase();
    let score = 0;
    if (actual === desired) score += 60;
    else if (actual.startsWith(prefix)) score += 40;
    if (voice?.default) score += 16;
    if (voice?.localService) score += 10;
    score += qualityNameScore(voice?.name);
    return score;
  }

  function ranked(languageTag) {
    const all = window.speechSynthesis?.getVoices?.() || [];
    const prefix = String(languageTag || '').toLowerCase().split('-')[0];
    return all
      .filter(voice => String(voice.lang || '').toLowerCase().startsWith(prefix))
      .sort((a, b) =>
        scoreVoice(b, languageTag) - scoreVoice(a, languageTag)
        || String(a.name || '').localeCompare(String(b.name || ''))
      );
  }

  function label(voice, language = appLanguage()) {
    const parts = [voice?.name || 'Voice', voice?.lang || ''];
    if (voice?.default) parts.push(t('voiceDefault', language));
    parts.push(voice?.localService ? t('voiceLocal', language) : t('voiceOnline', language));
    return parts.filter(Boolean).join(' · ');
  }

  function find(selectedName, languageTag) {
    const all = window.speechSynthesis?.getVoices?.() || [];
    return all.find(voice =>
      voiceValue(voice) === selectedName
      || voice.voiceURI === selectedName
      || `${voice.name}::${voice.lang}` === selectedName
    ) || ranked(languageTag)[0] || null;
  }

  function preview(selectedName, languageTag, text, options = {}) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return false;
    const voice = find(selectedName, languageTag);
    if (!voice) return false;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text || t('voicePreviewText', String(languageTag || appLanguage()).split('-')[0])
    );
    utterance.lang = languageTag || voice.lang || appLanguage();
    utterance.voice = voice;
    utterance.rate = Number(options.rate || 1);
    utterance.pitch = Number(options.pitch || 1);
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function previewLegacyPodcastVoice() {
    const select = document.getElementById('podcast-voice-select');
    if (!select) return;

    let button = document.getElementById('wrn-podcast-voice-preview');
    if (!button) {
      button = document.createElement('button');
      button.id = 'wrn-podcast-voice-preview';
      button.type = 'button';
      button.className = 'wrn-voice-preview-button';
      select.insertAdjacentElement('afterend', button);
    }

    button.textContent = `▶ ${t('voicePreview')}`;
    button.onclick = () => {
      const language = appLanguage();
      const tag = ({
        de:'de-DE', en:'en-US', es:'es-ES', fr:'fr-FR', it:'it-IT',
        pt:'pt-PT', ru:'ru-RU', el:'el-GR', tr:'tr-TR'
      })[language] || language;
      preview(select.value, tag, t('voicePreviewText', language), {
        rate: document.getElementById('podcast-rate-select')?.value || 1
      });
    };
  }

  const observer = new MutationObserver(previewLegacyPodcastVoice);

  function init() {
    previewLegacyPodcastVoice();
    observer.observe(document.body, { childList: true, subtree: true });
    document.getElementById('ui-language')?.addEventListener('change', () => {
      window.setTimeout(previewLegacyPodcastVoice, 20);
    });
  }

  window.WRNVoiceTools = Object.freeze({
    ranked,
    label,
    find,
    preview,
    scoreVoice,
    voiceValue
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
