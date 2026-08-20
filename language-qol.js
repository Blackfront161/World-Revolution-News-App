/* World Revolution News 1.7.5 – Sprach- und Bedienungsverbesserungen */
'use strict';

(() => {
  if (window.__wrnLanguageQol175) return;
  window.__wrnLanguageQol175 = true;

  const patches = {
    es: {
      init:'Cargando datos…', error:'Modo sin conexión.', btnLoading:'Traduciendo…', btnDone:'Traducido',
      btnReadMore:'Ver original', btnExpand:'Leer más ⬇️', btnCollapse:'Contraer ⬆️',
      filterAll:'Todas las fuentes', sortNew:'Más recientes', sortOld:'Más antiguas',
      latestNews:'Actualizaciones:', translatingRest:'Traduciendo el texto restante…',
      topBookmarks:'Guardados', btnDonateTop:'Donar', donateTitle:'Apoyar el proyecto',
      btnPaypal:'Continuar a PayPal', btnDonateCancel:'Cerrar', dateLabel:'FECHA:', langLabel:'Idioma:',
      searchPlace:'Buscar artículos…', bookmarkCat:'Guardados', themeLabel:'Diseño:',
      themeDark:'Oscuro', themeLight:'Claro', clearBtn:'Borrar caché 🗑️',
      catAfrica:'África', catNorthAmerica:'Norteamérica', catLatinAmerica:'Latinoamérica',
      catAsia:'Asia', catAustralia:'Oceanía', catLabor:'Luchas laborales',
      catAntifascism:'Antifascismo', catAntisexism:'Antisexismo', catQueer:'Feminismo queer',
      catAntiracism:'Antirracismo', catNoBorders:'Sin fronteras', catAnticapitalism:'Anticapitalismo',
      catTheory:'Teoría y estrategia', catAnticolonialism:'Anticolonialismo',
      catAntiimperialism:'Antiimperialismo', catSquatting:'Vivienda y okupación',
      catDemos:'Manifestaciones', catAntirepression:'Antirrepresión y cárceles',
      catCyber:'Ciberactivismo', catNoWar:'Contra la guerra', catAnimal:'Liberación animal',
      catEco:'Ecología y clima', catIndigenous:'Luchas indígenas', catHealth:'Salud radical',
      catLibraries:'Bibliotecas', infoBtn:'ℹ️ Información', archiveTitle:'🗄️ Archivo (> 3 meses)',
      publisherLabel:'FUENTE:', authorLabel:'AUTORÍA:', contactLabel:'Contacto:',
      radarSummary:'Eventos', radarCat:'Eventos'
    },
    fr: {
      init:'Chargement des données…', error:'Mode hors ligne.', btnLoading:'Traduction…', btnDone:'Traduit',
      btnReadMore:'Voir l’original', btnExpand:'Lire la suite ⬇️', btnCollapse:'Réduire ⬆️',
      filterAll:'Toutes les sources', sortNew:'Plus récents', sortOld:'Plus anciens',
      latestNews:'Mises à jour :', translatingRest:'Traduction du reste du texte…',
      topBookmarks:'Enregistrés', btnDonateTop:'Soutenir', donateTitle:'Soutenir le projet',
      btnPaypal:'Continuer vers PayPal', btnDonateCancel:'Fermer', dateLabel:'DATE :', langLabel:'Langue :',
      searchPlace:'Rechercher des articles…', bookmarkCat:'Enregistrés', themeLabel:'Design :',
      themeDark:'Sombre', themeLight:'Clair', clearBtn:'Vider le cache 🗑️',
      catAfrica:'Afrique', catNorthAmerica:'Amérique du Nord', catLatinAmerica:'Amérique latine',
      catAsia:'Asie', catAustralia:'Océanie', catLabor:'Luttes du travail',
      catAntifascism:'Antifascisme', catAntisexism:'Antisexisme', catQueer:'Féminisme queer',
      catAntiracism:'Antiracisme', catNoBorders:'Sans frontières', catAnticapitalism:'Anticapitalisme',
      catTheory:'Théorie et stratégie', catAnticolonialism:'Anticolonialisme',
      catAntiimperialism:'Anti-impérialisme', catSquatting:'Squats et logement',
      catDemos:'Manifestations', catAntirepression:'Antirépression et prisons',
      catCyber:'Cyberactivisme', catNoWar:'Contre la guerre', catAnimal:'Libération animale',
      catEco:'Écologie et climat', catIndigenous:'Luttes autochtones', catHealth:'Santé radicale',
      catLibraries:'Bibliothèques', infoBtn:'ℹ️ Informations', archiveTitle:'🗄️ Archives (> 3 mois)',
      publisherLabel:'SOURCE :', authorLabel:'AUTEUR·ICE :', contactLabel:'Contact :',
      radarSummary:'Événements', radarCat:'Événements'
    },
    it: {
      init:'Caricamento dati…', error:'Modalità offline.', btnLoading:'Traduzione…', btnDone:'Tradotto',
      btnReadMore:'Apri originale', btnExpand:'Leggi altro ⬇️', btnCollapse:'Riduci ⬆️',
      filterAll:'Tutte le fonti', sortNew:'Più recenti', sortOld:'Più vecchi',
      latestNews:'Aggiornamenti:', translatingRest:'Traduzione del testo restante…',
      topBookmarks:'Salvati', btnDonateTop:'Dona', donateTitle:'Sostieni il progetto',
      btnPaypal:'Continua su PayPal', btnDonateCancel:'Chiudi', dateLabel:'DATA:', langLabel:'Lingua:',
      searchPlace:'Cerca articoli…', bookmarkCat:'Salvati', themeLabel:'Design:',
      themeDark:'Scuro', themeLight:'Chiaro', clearBtn:'Svuota cache 🗑️',
      catAfrica:'Africa', catNorthAmerica:'Nord America', catLatinAmerica:'America Latina',
      catAsia:'Asia', catAustralia:'Oceania', catLabor:'Lotte del lavoro',
      catAntifascism:'Antifascismo', catAntisexism:'Antisessismo', catQueer:'Femminismo queer',
      catAntiracism:'Antirazzismo', catNoBorders:'Senza frontiere', catAnticapitalism:'Anticapitalismo',
      catTheory:'Teoria e strategia', catAnticolonialism:'Anticolonialismo',
      catAntiimperialism:'Anti-imperialismo', catSquatting:'Occupazioni e casa',
      catDemos:'Manifestazioni', catAntirepression:'Antirepressione e carceri',
      catCyber:'Cyberattivismo', catNoWar:'Contro la guerra', catAnimal:'Liberazione animale',
      catEco:'Ecologia e clima', catIndigenous:'Lotte indigene', catHealth:'Salute radicale',
      catLibraries:'Biblioteche', infoBtn:'ℹ️ Informazioni', archiveTitle:'🗄️ Archivio (> 3 mesi)',
      publisherLabel:'FONTE:', authorLabel:'AUTORE/TRICE:', contactLabel:'Contatto:',
      radarSummary:'Eventi', radarCat:'Eventi'
    },
    pt: {
      init:'A carregar dados…', error:'Modo offline.', btnLoading:'A traduzir…', btnDone:'Traduzido',
      btnReadMore:'Abrir original', btnExpand:'Ler mais ⬇️', btnCollapse:'Recolher ⬆️',
      filterAll:'Todas as fontes', sortNew:'Mais recentes', sortOld:'Mais antigos',
      latestNews:'Atualizações:', translatingRest:'A traduzir o texto restante…',
      topBookmarks:'Guardados', btnDonateTop:'Doar', donateTitle:'Apoiar o projeto',
      btnPaypal:'Continuar para o PayPal', btnDonateCancel:'Fechar', dateLabel:'DATA:', langLabel:'Idioma:',
      searchPlace:'Pesquisar artigos…', bookmarkCat:'Guardados', themeLabel:'Design:',
      themeDark:'Escuro', themeLight:'Claro', clearBtn:'Limpar cache 🗑️',
      catAfrica:'África', catNorthAmerica:'América do Norte', catLatinAmerica:'América Latina',
      catAsia:'Ásia', catAustralia:'Oceania', catLabor:'Lutas laborais',
      catAntifascism:'Antifascismo', catAntisexism:'Antissexismo', catQueer:'Feminismo queer',
      catAntiracism:'Antirracismo', catNoBorders:'Sem fronteiras', catAnticapitalism:'Anticapitalismo',
      catTheory:'Teoria e estratégia', catAnticolonialism:'Anticolonialismo',
      catAntiimperialism:'Anti-imperialismo', catSquatting:'Ocupações e habitação',
      catDemos:'Manifestações', catAntirepression:'Antirrepressão e prisões',
      catCyber:'Ciberativismo', catNoWar:'Contra a guerra', catAnimal:'Libertação animal',
      catEco:'Ecologia e clima', catIndigenous:'Lutas indígenas', catHealth:'Saúde radical',
      catLibraries:'Bibliotecas', infoBtn:'ℹ️ Informação', archiveTitle:'🗄️ Arquivo (> 3 meses)',
      publisherLabel:'FONTE:', authorLabel:'AUTORIA:', contactLabel:'Contacto:',
      radarSummary:'Eventos', radarCat:'Eventos'
    },
    ru: {
      init:'Загрузка данных…', error:'Автономный режим.', btnLoading:'Перевод…', btnDone:'Переведено',
      btnReadMore:'Открыть оригинал', btnExpand:'Читать далее ⬇️', btnCollapse:'Свернуть ⬆️',
      filterAll:'Все источники', sortNew:'Сначала новые', sortOld:'Сначала старые',
      latestNews:'Обновления:', translatingRest:'Перевод оставшегося текста…',
      topBookmarks:'Сохранённое', btnDonateTop:'Поддержать', donateTitle:'Поддержать проект',
      btnPaypal:'Перейти к PayPal', btnDonateCancel:'Закрыть', dateLabel:'ДАТА:', langLabel:'Язык:',
      searchPlace:'Поиск статей…', bookmarkCat:'Сохранённое', themeLabel:'Оформление:',
      themeDark:'Тёмное', themeLight:'Светлое', clearBtn:'Очистить кэш 🗑️',
      catAfrica:'Африка', catNorthAmerica:'Северная Америка', catLatinAmerica:'Латинская Америка',
      catAsia:'Азия', catAustralia:'Океания', catLabor:'Рабочая борьба',
      catAntifascism:'Антифашизм', catAntisexism:'Антисексизм', catQueer:'Квир-феминизм',
      catAntiracism:'Антирасизм', catNoBorders:'Без границ', catAnticapitalism:'Антикапитализм',
      catTheory:'Теория и стратегия', catAnticolonialism:'Антиколониализм',
      catAntiimperialism:'Антиимпериализм', catSquatting:'Сквоты и жильё',
      catDemos:'Демонстрации', catAntirepression:'Антирепрессии и тюрьмы',
      catCyber:'Киберактивизм', catNoWar:'Против войны', catAnimal:'Освобождение животных',
      catEco:'Экология и климат', catIndigenous:'Борьба коренных народов', catHealth:'Радикальное здоровье',
      catLibraries:'Библиотеки', infoBtn:'ℹ️ Информация', archiveTitle:'🗄️ Архив (> 3 месяцев)',
      publisherLabel:'ИСТОЧНИК:', authorLabel:'АВТОР:', contactLabel:'Контакт:',
      radarSummary:'События', radarCat:'События'
    },
    el: {
      init:'Φόρτωση δεδομένων…', error:'Λειτουργία εκτός σύνδεσης.', btnLoading:'Μετάφραση…', btnDone:'Μεταφράστηκε',
      btnReadMore:'Άνοιγμα πρωτοτύπου', btnExpand:'Περισσότερα ⬇️', btnCollapse:'Σύμπτυξη ⬆️',
      filterAll:'Όλες οι πηγές', sortNew:'Νεότερα', sortOld:'Παλαιότερα',
      latestNews:'Ενημερώσεις:', translatingRest:'Μετάφραση υπόλοιπου κειμένου…',
      topBookmarks:'Αποθηκευμένα', btnDonateTop:'Δωρεά', donateTitle:'Στήριξη του έργου',
      btnPaypal:'Συνέχεια στο PayPal', btnDonateCancel:'Κλείσιμο', dateLabel:'ΗΜΕΡΟΜΗΝΙΑ:', langLabel:'Γλώσσα:',
      searchPlace:'Αναζήτηση άρθρων…', bookmarkCat:'Αποθηκευμένα', themeLabel:'Σχεδίαση:',
      themeDark:'Σκούρο', themeLight:'Ανοιχτό', clearBtn:'Εκκαθάριση cache 🗑️',
      catAfrica:'Αφρική', catNorthAmerica:'Βόρεια Αμερική', catLatinAmerica:'Λατινική Αμερική',
      catAsia:'Ασία', catAustralia:'Ωκεανία', catLabor:'Εργατικοί αγώνες',
      catAntifascism:'Αντιφασισμός', catAntisexism:'Αντισεξισμός', catQueer:'Κουίρ φεμινισμός',
      catAntiracism:'Αντιρατσισμός', catNoBorders:'Χωρίς σύνορα', catAnticapitalism:'Αντικαπιταλισμός',
      catTheory:'Θεωρία και στρατηγική', catAnticolonialism:'Αντιαποικιοκρατία',
      catAntiimperialism:'Αντιιμπεριαλισμός', catSquatting:'Καταλήψεις και στέγαση',
      catDemos:'Διαδηλώσεις', catAntirepression:'Αντικαταστολή και φυλακές',
      catCyber:'Κυβερνοακτιβισμός', catNoWar:'Ενάντια στον πόλεμο', catAnimal:'Απελευθέρωση ζώων',
      catEco:'Οικολογία και κλίμα', catIndigenous:'Αγώνες αυτοχθόνων', catHealth:'Ριζοσπαστική υγεία',
      catLibraries:'Βιβλιοθήκες', infoBtn:'ℹ️ Πληροφορίες', archiveTitle:'🗄️ Αρχείο (> 3 μήνες)',
      publisherLabel:'ΠΗΓΗ:', authorLabel:'ΣΥΝΤΑΚΤΗΣ:', contactLabel:'Επικοινωνία:',
      radarSummary:'Εκδηλώσεις', radarCat:'Εκδηλώσεις'
    },
    tr: {
      init:'Veriler yükleniyor…', error:'Çevrimdışı mod.', btnLoading:'Çevriliyor…', btnDone:'Çevrildi',
      btnReadMore:'Orijinali aç', btnExpand:'Devamını oku ⬇️', btnCollapse:'Daralt ⬆️',
      filterAll:'Tüm kaynaklar', sortNew:'En yeni', sortOld:'En eski',
      latestNews:'Güncellemeler:', translatingRest:'Kalan metin çevriliyor…',
      topBookmarks:'Kaydedilenler', btnDonateTop:'Bağış', donateTitle:'Projeyi destekle',
      btnPaypal:'PayPal’a devam et', btnDonateCancel:'Kapat', dateLabel:'TARİH:', langLabel:'Dil:',
      searchPlace:'Makalelerde ara…', bookmarkCat:'Kaydedilenler', themeLabel:'Tasarım:',
      themeDark:'Koyu', themeLight:'Açık', clearBtn:'Önbelleği temizle 🗑️',
      catAfrica:'Afrika', catNorthAmerica:'Kuzey Amerika', catLatinAmerica:'Latin Amerika',
      catAsia:'Asya', catAustralia:'Okyanusya', catLabor:'Emek mücadeleleri',
      catAntifascism:'Antifaşizm', catAntisexism:'Antiseksizm', catQueer:'Kuir feminizm',
      catAntiracism:'Irkçılık karşıtlığı', catNoBorders:'Sınırsız', catAnticapitalism:'Antikapitalizm',
      catTheory:'Teori ve strateji', catAnticolonialism:'Sömürgecilik karşıtlığı',
      catAntiimperialism:'Emperyalizm karşıtlığı', catSquatting:'İşgaller ve konut',
      catDemos:'Gösteriler', catAntirepression:'Baskı ve hapishaneler',
      catCyber:'Siber aktivizm', catNoWar:'Savaşa karşı', catAnimal:'Hayvan özgürlüğü',
      catEco:'Ekoloji ve iklim', catIndigenous:'Yerli halk mücadeleleri', catHealth:'Radikal sağlık',
      catLibraries:'Kütüphaneler', infoBtn:'ℹ️ Bilgi', archiveTitle:'🗄️ Arşiv (> 3 ay)',
      publisherLabel:'KAYNAK:', authorLabel:'YAZAR:', contactLabel:'İletişim:',
      radarSummary:'Etkinlikler', radarCat:'Etkinlikler'
    }
  };

  function apply() {
    try {
      if (typeof uiTexte !== 'undefined') {
        Object.entries(patches).forEach(([code, values]) => Object.assign(uiTexte[code] || (uiTexte[code] = {}), values));
      }
      window.WRNI18n?.auditLegacyTranslations?.();
      if (typeof changeLanguage === 'function') changeLanguage();
      window.WRNSummary?.refreshLabels?.();
      window.WRNBriefing?.refreshLanguage?.();
    } catch (error) {
      console.warn('Language QoL patch failed:', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once:true });
  else window.setTimeout(apply, 0);
})();
