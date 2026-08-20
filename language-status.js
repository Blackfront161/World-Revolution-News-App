/* World Revolution News 1.7.5 – transparenter Sprachstatus */
'use strict';

(() => {
  if (window.__wrnLanguageStatus175) return;
  window.__wrnLanguageStatus175 = true;

  const messages = {
    de: {
      complete:'Sprachstatus: vollständig',
      extended:'Sprachstatus: erweitert – Hauptnavigation, Briefing, Audio und Artikelaktionen sind übersetzt. Einzelne ältere technische Dialoge können Englisch verwenden.'
    },
    en: {
      complete:'Language status: complete',
      extended:'Language status: extended – navigation, briefing, audio and article actions are translated. A few older technical dialogs may use English.'
    },
    es: {
      complete:'Estado del idioma: completo',
      extended:'Estado del idioma: ampliado – navegación, resumen, audio y acciones están traducidos. Algunos diálogos técnicos antiguos pueden aparecer en inglés.'
    },
    fr: {
      complete:'État de la langue : complet',
      extended:'État de la langue : étendu – navigation, briefing, audio et actions sont traduits. Quelques anciens dialogues techniques peuvent rester en anglais.'
    },
    it: {
      complete:'Stato lingua: completo',
      extended:'Stato lingua: esteso – navigazione, briefing, audio e azioni sono tradotti. Alcuni vecchi dialoghi tecnici possono restare in inglese.'
    },
    pt: {
      complete:'Estado do idioma: completo',
      extended:'Estado do idioma: alargado – navegação, resumo, áudio e ações estão traduzidos. Alguns diálogos técnicos antigos podem usar inglês.'
    },
    ru: {
      complete:'Статус языка: полный',
      extended:'Статус языка: расширенный — навигация, обзор, аудио и действия переведены. Некоторые старые технические окна могут быть на английском.'
    },
    el: {
      complete:'Κατάσταση γλώσσας: πλήρης',
      extended:'Κατάσταση γλώσσας: εκτεταμένη – η πλοήγηση, η ενημέρωση, ο ήχος και οι ενέργειες έχουν μεταφραστεί. Ορισμένοι παλιοί τεχνικοί διάλογοι μπορεί να είναι στα αγγλικά.'
    },
    tr: {
      complete:'Dil durumu: tam',
      extended:'Dil durumu: geliştirilmiş – gezinme, özet, ses ve makale işlemleri çevrilmiştir. Bazı eski teknik pencereler İngilizce olabilir.'
    }
  };

  function current() {
    const select = document.getElementById('ui-language');
    return select?.value || document.documentElement.lang || 'en';
  }

  function render() {
    const select = document.getElementById('ui-language');
    if (!select) return;

    let note = document.getElementById('wrn-language-status');
    if (!note) {
      note = document.createElement('small');
      note.id = 'wrn-language-status';
      note.className = 'wrn-language-status';
      select.insertAdjacentElement('afterend', note);
    }

    const code = current();
    const text = messages[code] || messages.en;
    const complete = code === 'de' || code === 'en';
    note.textContent = complete ? text.complete : text.extended;
    note.dataset.level = complete ? 'complete' : 'extended';
  }

  const observer = new MutationObserver(render);

  function init() {
    render();
    document.getElementById('ui-language')?.addEventListener('change', () => {
      window.setTimeout(render, 10);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
