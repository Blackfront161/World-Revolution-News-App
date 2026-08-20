/* World Revolution News 1.7.5 – Audio-Player-Stabilität */
'use strict';

(() => {
  if (window.__wrnAudioPlayerFixes175) return;
  window.__wrnAudioPlayerFixes175 = true;

  try {
    if (typeof mediaUiTexts !== 'undefined') {
      Object.assign(mediaUiTexts.es, { continueAt:'Continuar desde' });
      Object.assign(mediaUiTexts.fr, { continueAt:'Reprendre à' });
      Object.assign(mediaUiTexts.it, { continueAt:'Riprendi da' });
      Object.assign(mediaUiTexts.pt, { continueAt:'Continuar em' });
      Object.assign(mediaUiTexts.ru, { continueAt:'Продолжить с' });
      Object.assign(mediaUiTexts.el, { continueAt:'Συνέχεια από' });
      Object.assign(mediaUiTexts.tr, { continueAt:'Buradan devam et' });
    }
  } catch {}

  function init() {
    const audio = document.getElementById('global-media-player');
    if (!audio || audio.dataset.wrnTimeoutFix === '175') return;
    audio.dataset.wrnTimeoutFix = '175';

    let timer = 0;
    const clear = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const arm = () => {
      clear();
      timer = window.setTimeout(() => {
        const state = window.WRNMediaPlayer?.getState?.();
        if (!state?.id || !audio.paused || audio.readyState >= 3) return;
        try {
          if (typeof tryNextGlobalMediaCandidate === 'function') {
            tryNextGlobalMediaCandidate();
          }
        } catch {}
      }, 12000);
    };

    ['loadstart','waiting','stalled'].forEach(name => audio.addEventListener(name, arm));
    ['playing','canplay','pause','ended','emptied'].forEach(name => audio.addEventListener(name, clear));

    window.addEventListener('offline', clear);
    window.addEventListener('online', () => {
      const state = window.WRNMediaPlayer?.getState?.();
      if (state?.id && audio.paused) arm();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
