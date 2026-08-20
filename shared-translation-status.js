/* World Revolution News 1.7.5 – Status gemeinsamer Übersetzungen */
'use strict';

(() => {
  if (window.__wrnSharedTranslationStatus175) return;
  window.__wrnSharedTranslationStatus175 = true;

  const texts = {
    de:{disabled:'Gemeinsamer Übersetzungscache: nicht aktiviert',checking:'Gemeinsamer Übersetzungscache wird geprüft …',online:'Gemeinsamer Übersetzungscache: online',kv:'globales KV',edge:'regionaler Ersatzcache',hit:'Übersetzung aus gemeinsamem Cache',miss:'Neue Übersetzung wurde gemeinsam gespeichert',fallback:'Gemeinsamer Cache nicht erreichbar – normale Übersetzung verwendet'},
    en:{disabled:'Shared translation cache: not enabled',checking:'Checking shared translation cache …',online:'Shared translation cache: online',kv:'global KV',edge:'regional fallback cache',hit:'Translation loaded from shared cache',miss:'New translation stored in shared cache',fallback:'Shared cache unavailable – normal translation used'},
    es:{disabled:'Caché compartida de traducciones: no activada',checking:'Comprobando caché compartida…',online:'Caché compartida: en línea',kv:'KV global',edge:'caché regional de reserva',hit:'Traducción cargada desde la caché compartida',miss:'Nueva traducción guardada en la caché compartida',fallback:'Caché compartida no disponible; se usa la traducción normal'},
    fr:{disabled:'Cache de traduction partagée : non activé',checking:'Vérification du cache partagé…',online:'Cache partagé : en ligne',kv:'KV global',edge:'cache régional de secours',hit:'Traduction chargée depuis le cache partagé',miss:'Nouvelle traduction enregistrée dans le cache partagé',fallback:'Cache partagé indisponible ; traduction normale utilisée'},
    it:{disabled:'Cache traduzioni condivise: non attivata',checking:'Controllo cache condivisa…',online:'Cache condivisa: online',kv:'KV globale',edge:'cache regionale di riserva',hit:'Traduzione caricata dalla cache condivisa',miss:'Nuova traduzione salvata nella cache condivisa',fallback:'Cache condivisa non disponibile; usata traduzione normale'},
    pt:{disabled:'Cache partilhada de traduções: não ativada',checking:'A verificar cache partilhada…',online:'Cache partilhada: online',kv:'KV global',edge:'cache regional de reserva',hit:'Tradução carregada da cache partilhada',miss:'Nova tradução guardada na cache partilhada',fallback:'Cache partilhada indisponível; usada tradução normal'},
    ru:{disabled:'Общий кэш переводов: не включён',checking:'Проверка общего кэша…',online:'Общий кэш: доступен',kv:'глобальный KV',edge:'региональный резервный кэш',hit:'Перевод загружен из общего кэша',miss:'Новый перевод сохранён в общем кэше',fallback:'Общий кэш недоступен — использован обычный перевод'},
    el:{disabled:'Κοινή cache μεταφράσεων: ανενεργή',checking:'Έλεγχος κοινής cache…',online:'Κοινή cache: online',kv:'παγκόσμιο KV',edge:'περιφερειακή εφεδρική cache',hit:'Η μετάφραση φορτώθηκε από την κοινή cache',miss:'Η νέα μετάφραση αποθηκεύτηκε στην κοινή cache',fallback:'Η κοινή cache δεν είναι διαθέσιμη – χρησιμοποιήθηκε κανονική μετάφραση'},
    tr:{disabled:'Ortak çeviri önbelleği: etkin değil',checking:'Ortak önbellek denetleniyor…',online:'Ortak önbellek: çevrimiçi',kv:'küresel KV',edge:'bölgesel yedek önbellek',hit:'Çeviri ortak önbellekten yüklendi',miss:'Yeni çeviri ortak önbelleğe kaydedildi',fallback:'Ortak önbellek kullanılamıyor; normal çeviri kullanıldı'}
  };

  function lang(){
    const value = document.getElementById('ui-language')?.value || document.documentElement.lang || 'en';
    return texts[value] ? value : 'en';
  }
  function t(){ return texts[lang()] || texts.en; }

  function ensureStatus(){
    const languageStatus = document.getElementById('wrn-language-status');
    const select = document.getElementById('ui-language');
    if (!languageStatus && !select) return null;
    let node = document.getElementById('wrn-shared-translation-status');
    if (!node) {
      node = document.createElement('small');
      node.id = 'wrn-shared-translation-status';
      node.className = 'wrn-shared-translation-status';
      (languageStatus || select).insertAdjacentElement('afterend', node);
    }
    return node;
  }

  function show(text, state='neutral'){
    const node = ensureStatus();
    if (!node) return;
    node.textContent = text;
    node.dataset.state = state;
  }

  async function check(){
    if (!window.WRNSharedTranslations?.enabled?.()) {
      show(t().disabled, 'disabled');
      return;
    }
    show(t().checking, 'checking');
    const result = await window.WRNSharedTranslations.health();
    if (result?.ok) {
      const storage = result.storage === 'kv' ? t().kv : t().edge;
      show(`${t().online} · ${storage}`, result.storage === 'kv' ? 'online' : 'warning');
    } else {
      show(t().fallback, 'error');
    }
  }

  window.addEventListener('wrnsharedtranslationstate', event => {
    const detail = event.detail || {};
    if (detail.type !== 'translation') return;
    if (detail.fallback || detail.ok === false) {
      show(t().fallback, 'warning');
    } else if (String(detail.cacheState).toUpperCase() === 'HIT') {
      show(`${t().hit}${detail.storage ? ` · ${detail.storage}` : ''}`, 'hit');
    } else {
      show(`${t().miss}${detail.storage ? ` · ${detail.storage}` : ''}`, 'miss');
    }
  });

  function init(){
    ensureStatus();
    check();
    document.getElementById('ui-language')?.addEventListener('change', () => setTimeout(check, 20));
  }

  window.WRNSharedTranslationStatus = Object.freeze({ check });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
