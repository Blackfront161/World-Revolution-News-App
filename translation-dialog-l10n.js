/* World Revolution News 1.7.5 – Übersetzungsdialoge in allen App-Sprachen */
'use strict';

(() => {
  if (window.__wrnTranslationDialogL10n175) return;
  window.__wrnTranslationDialogL10n175 = true;

  const L = {
    en:{original:'Original',translation:'Translation',compare:'Compare',report:'Report translation',compareTitle:'Compare original and translation',originalColumn:'Original',translatedColumn:'Machine translation',compareHint:'The comparison stays on this device and does not send article text anywhere.',close:'Close',reportTitle:'Report a translation problem',reportIntro:'Only article metadata, the selected issue and your note are prepared for an email. The article text is not attached.',issueLabel:'Problem',noteLabel:'Optional note',notePlaceholder:'Briefly describe the problem…',send:'Prepare email',issues:['Meaning is wrong','Text is missing','Names or quotations changed','Wrong target language','Formatting or paragraphs are broken','Other problem']},
    de:{original:'Original',translation:'Übersetzung',compare:'Vergleichen',report:'Übersetzung melden',compareTitle:'Original und Übersetzung vergleichen',originalColumn:'Original',translatedColumn:'Maschinelle Übersetzung',compareHint:'Der Vergleich bleibt auf diesem Gerät und sendet keinen Artikeltext weiter.',close:'Schließen',reportTitle:'Übersetzungsproblem melden',reportIntro:'Für die E-Mail werden nur Artikeldaten, die Fehlerart und deine Notiz vorbereitet. Der Artikeltext wird nicht angehängt.',issueLabel:'Problem',noteLabel:'Optionale Notiz',notePlaceholder:'Beschreibe das Problem kurz …',send:'E-Mail vorbereiten',issues:['Bedeutung ist falsch','Text fehlt','Namen oder Zitate wurden verändert','Falsche Zielsprache','Formatierung oder Absätze sind beschädigt','Anderes Problem']},
    es:{original:'Original',translation:'Traducción',compare:'Comparar',report:'Informar traducción',compareTitle:'Comparar original y traducción',originalColumn:'Original',translatedColumn:'Traducción automática',compareHint:'La comparación permanece en este dispositivo y no envía el texto.',close:'Cerrar',reportTitle:'Informar un problema de traducción',reportIntro:'El correo solo incluye metadatos, el problema seleccionado y tu nota. No se adjunta el artículo.',issueLabel:'Problema',noteLabel:'Nota opcional',notePlaceholder:'Describe brevemente el problema…',send:'Preparar correo',issues:['Significado incorrecto','Falta texto','Nombres o citas modificados','Idioma de destino incorrecto','Formato o párrafos dañados','Otro problema']},
    fr:{original:'Original',translation:'Traduction',compare:'Comparer',report:'Signaler la traduction',compareTitle:'Comparer l’original et la traduction',originalColumn:'Original',translatedColumn:'Traduction automatique',compareHint:'La comparaison reste sur cet appareil et n’envoie aucun texte.',close:'Fermer',reportTitle:'Signaler un problème de traduction',reportIntro:'Seules les métadonnées, le problème choisi et votre note sont préparés pour l’e-mail.',issueLabel:'Problème',noteLabel:'Note facultative',notePlaceholder:'Décrivez brièvement le problème…',send:'Préparer l’e-mail',issues:['Sens incorrect','Texte manquant','Noms ou citations modifiés','Mauvaise langue cible','Mise en forme endommagée','Autre problème']},
    it:{original:'Originale',translation:'Traduzione',compare:'Confronta',report:'Segnala traduzione',compareTitle:'Confronta originale e traduzione',originalColumn:'Originale',translatedColumn:'Traduzione automatica',compareHint:'Il confronto resta sul dispositivo e non invia il testo.',close:'Chiudi',reportTitle:'Segnala un problema di traduzione',reportIntro:'L’e-mail include solo metadati, problema scelto e nota. Il testo non viene allegato.',issueLabel:'Problema',noteLabel:'Nota facoltativa',notePlaceholder:'Descrivi brevemente il problema…',send:'Prepara e-mail',issues:['Significato errato','Testo mancante','Nomi o citazioni modificati','Lingua di destinazione errata','Formattazione danneggiata','Altro problema']},
    pt:{original:'Original',translation:'Tradução',compare:'Comparar',report:'Reportar tradução',compareTitle:'Comparar original e tradução',originalColumn:'Original',translatedColumn:'Tradução automática',compareHint:'A comparação fica neste dispositivo e não envia o texto.',close:'Fechar',reportTitle:'Reportar problema de tradução',reportIntro:'O e-mail inclui apenas metadados, o problema escolhido e a nota. O artigo não é anexado.',issueLabel:'Problema',noteLabel:'Nota opcional',notePlaceholder:'Descreve brevemente o problema…',send:'Preparar e-mail',issues:['Significado errado','Texto em falta','Nomes ou citações alterados','Idioma de destino errado','Formatação danificada','Outro problema']},
    ru:{original:'Оригинал',translation:'Перевод',compare:'Сравнить',report:'Сообщить о переводе',compareTitle:'Сравнение оригинала и перевода',originalColumn:'Оригинал',translatedColumn:'Машинный перевод',compareHint:'Сравнение остаётся на устройстве и не отправляет текст.',close:'Закрыть',reportTitle:'Сообщить о проблеме перевода',reportIntro:'В письмо включаются только метаданные, тип проблемы и заметка. Текст статьи не прикладывается.',issueLabel:'Проблема',noteLabel:'Необязательная заметка',notePlaceholder:'Кратко опишите проблему…',send:'Подготовить письмо',issues:['Неверный смысл','Отсутствует текст','Изменены имена или цитаты','Неверный язык перевода','Нарушено форматирование','Другая проблема']},
    el:{original:'Πρωτότυπο',translation:'Μετάφραση',compare:'Σύγκριση',report:'Αναφορά μετάφρασης',compareTitle:'Σύγκριση πρωτοτύπου και μετάφρασης',originalColumn:'Πρωτότυπο',translatedColumn:'Αυτόματη μετάφραση',compareHint:'Η σύγκριση παραμένει στη συσκευή και δεν στέλνει το κείμενο.',close:'Κλείσιμο',reportTitle:'Αναφορά προβλήματος μετάφρασης',reportIntro:'Το e-mail περιλαμβάνει μόνο μεταδεδομένα, το πρόβλημα και τη σημείωση. Το άρθρο δεν επισυνάπτεται.',issueLabel:'Πρόβλημα',noteLabel:'Προαιρετική σημείωση',notePlaceholder:'Περιγράψτε σύντομα το πρόβλημα…',send:'Προετοιμασία e-mail',issues:['Λανθασμένο νόημα','Λείπει κείμενο','Άλλαξαν ονόματα ή αποσπάσματα','Λάθος γλώσσα στόχος','Κατεστραμμένη μορφοποίηση','Άλλο πρόβλημα']},
    tr:{original:'Özgün',translation:'Çeviri',compare:'Karşılaştır',report:'Çeviriyi bildir',compareTitle:'Özgün metin ve çeviriyi karşılaştır',originalColumn:'Özgün',translatedColumn:'Makine çevirisi',compareHint:'Karşılaştırma cihazda kalır ve metni göndermez.',close:'Kapat',reportTitle:'Çeviri sorununu bildir',reportIntro:'E-postaya yalnızca meta veriler, seçilen sorun ve not eklenir. Makale metni eklenmez.',issueLabel:'Sorun',noteLabel:'İsteğe bağlı not',notePlaceholder:'Sorunu kısaca açıklayın…',send:'E-posta hazırla',issues:['Anlam yanlış','Metin eksik','Adlar veya alıntılar değişti','Hedef dil yanlış','Biçimlendirme bozuk','Diğer sorun']}
  };

  function lang(){ const code=document.getElementById('ui-language')?.value||document.documentElement.lang||'en'; return L[code]?code:'en'; }
  function set(id,value){ const el=document.getElementById(id); if(el&&value) el.textContent=value; }

  function patchControls(root=document){
    const t=L[lang()]||L.en;
    root.querySelectorAll?.('.translation-view-buttons').forEach(row=>{
      const buttons=[...row.querySelectorAll('button')];
      [t.original,t.translation,t.compare,t.report].forEach((label,index)=>{if(buttons[index]) buttons[index].textContent=label;});
    });
  }

  function patchModals(){
    const t=L[lang()]||L.en;
    set('translation-compare-title',t.compareTitle);
    set('translation-compare-original-heading',t.originalColumn);
    set('translation-compare-translated-heading',t.translatedColumn);
    set('translation-compare-hint',t.compareHint);
    set('btn-translation-compare-close',t.close);
    set('translation-report-title',t.reportTitle);
    set('translation-report-intro',t.reportIntro);
    set('translation-report-issue-label',t.issueLabel);
    set('translation-report-note-label',t.noteLabel);
    set('btn-translation-report-send',t.send);
    set('btn-translation-report-close',t.close);
    const note=document.getElementById('translation-report-note'); if(note) note.placeholder=t.notePlaceholder;
    const select=document.getElementById('translation-report-issue');
    if(select){[...select.options].forEach((option,index)=>{if(t.issues[index]) option.textContent=t.issues[index];});}
  }

  function refresh(){patchControls();patchModals();}
  const observer=new MutationObserver(mutations=>{for(const mutation of mutations){mutation.addedNodes.forEach(node=>{if(node instanceof Element){patchControls(node);patchModals();}});}});
  function init(){refresh();observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});document.getElementById('ui-language')?.addEventListener('change',()=>setTimeout(refresh,30));}
  window.WRNTranslationDialogL10n=Object.freeze({refresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
