/* World Revolution News – parallel News App 2 preview */
'use strict';

(() => {
  const core = window.WRNNewsApp2Core;
  const cardCopy = window.WRNNewsCardCopy;
  const specialty = window.WRNNewsApp2Specialty;
  const product21 = window.WRNProduct21;
  const media = window.WRNNewsApp2Media;
  const release = window.WRNNewsApp2Release;
  if (!core || !cardCopy || !specialty || !product21 || !media || !release || window.__wrnNewsApp2Loaded) return;
  window.__wrnNewsApp2Loaded = true;
  const isProduction = window.WRN_CONFIG?.releaseChannel === 'production';

  const PREFS_KEY = 'wrn_next_preferences_v1';
  const TRANSLATIONS_KEY = 'wrn_next_teaser_translations_v1';
  const BOOKMARKS_KEY = 'wrn_bookmarks';
  const READ_KEY = 'wrn_read_list';
  const ZINE_KEY = 'wrn_zine_articles';
  const LANGUAGE_KEY = 'wrn_system_lang';
  const STORY_WATCH_KEY = 'wrn_next_story_watch_v1';
  const DEVELOPMENT_REVIEW_KEY = 'wrn_next_development_reviews_v1';
  const UI_SETTINGS_KEY = 'wrn_next_ui_settings_v1';
  const READING_POSITIONS_KEY = 'wrn_read_positions';
  const EVENT_REMINDERS_KEY = 'wrn_event_reminders_v2';
  const EVENT_FILTERS_KEY = 'wrn_saved_event_filters_v1';
  const ARCHIVE_FILTERS_KEY = 'wrn_source_archive_filters_v1';
  const PUSH_PREFS_KEY = 'wrn_notification_preferences_v1';
  const VIDEO_WATCH_LATER_KEY = 'wrn_video_watch_later_v1';
  const VIDEO_HISTORY_KEY = 'wrn_video_history_v1';
  const BRIEFING_HISTORY_KEY = 'wrn_briefing_history_v1';
  const LAST_VISIT_KEY = 'wrn_last_visit_v1';
  const DEVELOPMENT_SNAPSHOT_KEY = 'wrn_development_snapshot_v1';
  const HOME_COUNT = 10;
  const BRIEFING_DURATIONS = Object.freeze([3, 5, 10, 20]);
  const DAILY_EDITION_ITEM_COUNTS = Object.freeze([5, 7, 10]);
  const DAILY_EDITION_TYPES = Object.freeze(['morning', 'daily', 'weekly']);
  const BRIEFING_WORDS_PER_MINUTE = 150;
  const BRIEFING_CANDIDATE_LIMIT = 80;
  const LIVE_DATA_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
  const LIVE_STARTUP_BUDGET_MS = 8000;
  const INDEXEDDB_STARTUP_BUDGET_MS = 1200;
  const PACKAGED_FEED_TIMEOUT_MS = 6000;
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.world.revolution';
  const ARTICLE_SHARE_ATTRIBUTION = Object.freeze({
    de: 'Gefunden mit World Revolution News:',
    en: 'Found with World Revolution News:',
    es: 'Encontrado con World Revolution News:',
    fr: 'Trouvé avec World Revolution News :',
    it: 'Trovato con World Revolution News:',
    pt: 'Encontrado com World Revolution News:',
    ru: 'Найдено с помощью World Revolution News:',
    el: 'Βρέθηκε μέσω του World Revolution News:',
    tr: 'World Revolution News ile bulundu:'
  });
  const AZURE_PODCAST_VOICES = Object.freeze({
    en: [['en-US-AriaNeural', 'Aria · Azure (female)'], ['en-US-GuyNeural', 'Guy · Azure (male)']],
    de: [['de-DE-KatjaNeural', 'Katja · Azure (weiblich)'], ['de-DE-ConradNeural', 'Conrad · Azure (männlich)']],
    es: [['es-ES-ElviraNeural', 'Elvira · Azure (femenina)'], ['es-ES-AlvaroNeural', 'Álvaro · Azure (masculina)']],
    fr: [['fr-FR-DeniseNeural', 'Denise · Azure (féminine)'], ['fr-FR-HenriNeural', 'Henri · Azure (masculine)']],
    it: [['it-IT-ElsaNeural', 'Elsa · Azure (femminile)'], ['it-IT-DiegoNeural', 'Diego · Azure (maschile)']],
    pt: [['pt-BR-FranciscaNeural', 'Francisca · Azure (feminina)'], ['pt-BR-AntonioNeural', 'Antônio · Azure (masculina)']],
    ru: [['ru-RU-SvetlanaNeural', 'Светлана · Azure (женский)'], ['ru-RU-DmitryNeural', 'Дмитрий · Azure (мужской)']],
    el: [['el-GR-AthinaNeural', 'Αθηνά · Azure (γυναικεία)'], ['el-GR-NestorasNeural', 'Νέστορας · Azure (ανδρική)']],
    tr: [['tr-TR-EmelNeural', 'Emel · Azure (kadın)'], ['tr-TR-AhmetNeural', 'Ahmet · Azure (erkek)']]
  });
  const DEVELOPMENT_MATCH_THRESHOLD = 0.72;
  const EVENT_REGION_COUNTRIES = Object.freeze({
    Africa: 'DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' '),
    Asia: 'AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP KR OM PK PS PH QA SA SG LK SY TW TJ TH TL TR TM AE UZ VN YE'.split(' '),
    Europe: 'AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA'.split(' '),
    'Latin America': 'AR BO BR CL CO CR CU DO EC SV GT HT HN MX NI PA PY PE PR UY VE BZ GY SR GF'.split(' '),
    'North America': ['CA', 'US', 'GL', 'BM', 'PM'],
    Oceania: 'AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU NC PF GU MP AS CK NU'.split(' '),
    Global: ['XC', 'XE']
  });
  const EVENT_REGION_BY_COUNTRY = Object.freeze(Object.fromEntries(
    Object.entries(EVENT_REGION_COUNTRIES)
      .flatMap(([region, countries]) => countries.map(country => [country, region]))
  ));

  const PRODUCT_COPY = {
    de: {
      currentPeriod:'Aktuell', last7Days:'Letzte 7 Tage', last30Days:'Letzte 30 Tage', allArticles:'Alle Artikel',
      archiveBrowse:'Zum Nachrichtenarchiv', showMore:'Mehr Artikel laden',
      groupPolitics:'Politik & Herrschaft', groupRights:'Rechte & Gesellschaft',
      groupAction:'Bewegung & Praxis', groupEcology:'Ökologie & Wissen',
      prisonersShort:'Gefangene', summary:'Zusammenfassen', podcast:'Podcast', markRead:'Als gelesen',
      markUnread:'Als ungelesen', share:'Teilen', shared:'Geteilt.', linkCopied:'Link kopiert.',
      shareFailed:'Teilen ist nicht verfügbar.', translationCompare:'Übersetzungsvergleich',
      originalVersion:'Original', translatedVersion:'Übersetzung', closeTool:'Schließen',
      summaryLocal:'Lokale Zusammenfassung – bitte mit dem Original abgleichen.',
      summaryShort:'Kurz', summaryStandard:'Standard', summaryDetailed:'Ausführlich',
      deviceVoice:'Kostenlose Gerätestimme', voice:'Stimme', speed:'Tempo', play:'Abspielen',
      pause:'Pause', stop:'Stopp', ready:'Bereit – startet erst nach deiner Auswahl.',
      listening:'Wird vorgelesen', finished:'Wiedergabe beendet.'
    },
    en: {
      currentPeriod:'Current', last7Days:'Last 7 days', last30Days:'Last 30 days', allArticles:'All articles',
      archiveBrowse:'Open news archive', showMore:'Load more articles',
      groupPolitics:'Politics & power', groupRights:'Rights & society',
      groupAction:'Movements & action', groupEcology:'Ecology & knowledge',
      prisonersShort:'Prisoners', summary:'Summarize', podcast:'Podcast', markRead:'Mark read',
      markUnread:'Mark unread', share:'Share', shared:'Shared.', linkCopied:'Link copied.',
      shareFailed:'Sharing is unavailable.', translationCompare:'Translation comparison',
      originalVersion:'Original', translatedVersion:'Translation', closeTool:'Close',
      summaryLocal:'Local summary – please compare it with the original.',
      summaryShort:'Short', summaryStandard:'Standard', summaryDetailed:'Detailed',
      deviceVoice:'Free device voice', voice:'Voice', speed:'Speed', play:'Play',
      pause:'Pause', stop:'Stop', ready:'Ready – starts only after you choose play.',
      listening:'Reading aloud', finished:'Playback finished.'
    },
    es: {
      currentPeriod:'Actualidad', last7Days:'Últimos 7 días', last30Days:'Últimos 30 días', allArticles:'Todos los artículos',
      archiveBrowse:'Abrir archivo de noticias', showMore:'Cargar más artículos',
      groupPolitics:'Política y poder', groupRights:'Derechos y sociedad',
      groupAction:'Movimientos y acción', groupEcology:'Ecología y conocimiento',
      prisonersShort:'Presxs', summary:'Resumir', podcast:'Pódcast', markRead:'Marcar como leído',
      markUnread:'Marcar como no leído', share:'Compartir', shared:'Compartido.', linkCopied:'Enlace copiado.',
      shareFailed:'No se puede compartir.', translationCompare:'Comparar traducción',
      originalVersion:'Original', translatedVersion:'Traducción', closeTool:'Cerrar',
      summaryLocal:'Resumen local; compáralo con el original.',
      summaryShort:'Breve', summaryStandard:'Estándar', summaryDetailed:'Detallado',
      deviceVoice:'Voz gratuita del dispositivo', voice:'Voz', speed:'Velocidad', play:'Reproducir',
      pause:'Pausa', stop:'Detener', ready:'Listo; comienza solo cuando lo elijas.',
      listening:'Leyendo', finished:'Reproducción terminada.'
    },
    fr: {
      currentPeriod:'Actualité', last7Days:'7 derniers jours', last30Days:'30 derniers jours', allArticles:'Tous les articles',
      archiveBrowse:'Ouvrir les archives', showMore:'Charger plus d’articles',
      groupPolitics:'Politique et pouvoir', groupRights:'Droits et société',
      groupAction:'Mouvements et action', groupEcology:'Écologie et savoirs',
      prisonersShort:'Prisonnier·ères', summary:'Résumer', podcast:'Podcast', markRead:'Marquer comme lu',
      markUnread:'Marquer non lu', share:'Partager', shared:'Partagé.', linkCopied:'Lien copié.',
      shareFailed:'Le partage est indisponible.', translationCompare:'Comparer la traduction',
      originalVersion:'Original', translatedVersion:'Traduction', closeTool:'Fermer',
      summaryLocal:'Résumé local – à comparer avec l’original.',
      summaryShort:'Court', summaryStandard:'Standard', summaryDetailed:'Détaillé',
      deviceVoice:'Voix gratuite de l’appareil', voice:'Voix', speed:'Vitesse', play:'Lire',
      pause:'Pause', stop:'Arrêter', ready:'Prêt – démarre uniquement après votre choix.',
      listening:'Lecture en cours', finished:'Lecture terminée.'
    },
    it: {
      currentPeriod:'Attualità', last7Days:'Ultimi 7 giorni', last30Days:'Ultimi 30 giorni', allArticles:'Tutti gli articoli',
      archiveBrowse:'Apri archivio notizie', showMore:'Carica altri articoli',
      groupPolitics:'Politica e potere', groupRights:'Diritti e società',
      groupAction:'Movimenti e azione', groupEcology:'Ecologia e sapere',
      prisonersShort:'Prigionieri', summary:'Riassumi', podcast:'Podcast', markRead:'Segna come letto',
      markUnread:'Segna come non letto', share:'Condividi', shared:'Condiviso.', linkCopied:'Link copiato.',
      shareFailed:'Condivisione non disponibile.', translationCompare:'Confronto traduzione',
      originalVersion:'Originale', translatedVersion:'Traduzione', closeTool:'Chiudi',
      summaryLocal:'Riassunto locale – confrontalo con l’originale.',
      summaryShort:'Breve', summaryStandard:'Standard', summaryDetailed:'Dettagliato',
      deviceVoice:'Voce gratuita del dispositivo', voice:'Voce', speed:'Velocità', play:'Riproduci',
      pause:'Pausa', stop:'Stop', ready:'Pronto – parte solo dopo la selezione.',
      listening:'Lettura in corso', finished:'Riproduzione terminata.'
    },
    pt: {
      currentPeriod:'Atualidade', last7Days:'Últimos 7 dias', last30Days:'Últimos 30 dias', allArticles:'Todos os artigos',
      archiveBrowse:'Abrir arquivo de notícias', showMore:'Carregar mais artigos',
      groupPolitics:'Política e poder', groupRights:'Direitos e sociedade',
      groupAction:'Movimentos e ação', groupEcology:'Ecologia e saberes',
      prisonersShort:'Prisioneiros', summary:'Resumir', podcast:'Podcast', markRead:'Marcar como lido',
      markUnread:'Marcar como não lido', share:'Partilhar', shared:'Partilhado.', linkCopied:'Ligação copiada.',
      shareFailed:'Partilha indisponível.', translationCompare:'Comparar tradução',
      originalVersion:'Original', translatedVersion:'Tradução', closeTool:'Fechar',
      summaryLocal:'Resumo local – compara com o original.',
      summaryShort:'Curto', summaryStandard:'Padrão', summaryDetailed:'Detalhado',
      deviceVoice:'Voz gratuita do dispositivo', voice:'Voz', speed:'Velocidade', play:'Reproduzir',
      pause:'Pausa', stop:'Parar', ready:'Pronto – só começa após a tua escolha.',
      listening:'A ler', finished:'Reprodução terminada.'
    },
    ru: {
      currentPeriod:'Актуальное', last7Days:'Последние 7 дней', last30Days:'Последние 30 дней', allArticles:'Все материалы',
      archiveBrowse:'Открыть архив новостей', showMore:'Загрузить ещё',
      groupPolitics:'Политика и власть', groupRights:'Права и общество',
      groupAction:'Движения и действия', groupEcology:'Экология и знания',
      prisonersShort:'Заключённые', summary:'Кратко', podcast:'Подкаст', markRead:'Отметить прочитанным',
      markUnread:'Отметить непрочитанным', share:'Поделиться', shared:'Отправлено.', linkCopied:'Ссылка скопирована.',
      shareFailed:'Поделиться не удалось.', translationCompare:'Сравнение перевода',
      originalVersion:'Оригинал', translatedVersion:'Перевод', closeTool:'Закрыть',
      summaryLocal:'Локальное резюме — сверьте с оригиналом.',
      summaryShort:'Коротко', summaryStandard:'Обычно', summaryDetailed:'Подробно',
      deviceVoice:'Бесплатный голос устройства', voice:'Голос', speed:'Скорость', play:'Воспроизвести',
      pause:'Пауза', stop:'Стоп', ready:'Готово — запуск только после выбора.',
      listening:'Чтение', finished:'Воспроизведение завершено.'
    },
    el: {
      currentPeriod:'Τρέχοντα', last7Days:'Τελευταίες 7 ημέρες', last30Days:'Τελευταίες 30 ημέρες', allArticles:'Όλα τα άρθρα',
      archiveBrowse:'Άνοιγμα αρχείου ειδήσεων', showMore:'Φόρτωση περισσότερων',
      groupPolitics:'Πολιτική και εξουσία', groupRights:'Δικαιώματα και κοινωνία',
      groupAction:'Κινήματα και δράση', groupEcology:'Οικολογία και γνώση',
      prisonersShort:'Κρατούμενοι', summary:'Σύνοψη', podcast:'Podcast', markRead:'Σήμανση ως διαβασμένο',
      markUnread:'Σήμανση ως αδιάβαστο', share:'Κοινοποίηση', shared:'Κοινοποιήθηκε.', linkCopied:'Ο σύνδεσμος αντιγράφηκε.',
      shareFailed:'Η κοινοποίηση δεν είναι διαθέσιμη.', translationCompare:'Σύγκριση μετάφρασης',
      originalVersion:'Πρωτότυπο', translatedVersion:'Μετάφραση', closeTool:'Κλείσιμο',
      summaryLocal:'Τοπική σύνοψη – ελέγξτε την με το πρωτότυπο.',
      summaryShort:'Σύντομη', summaryStandard:'Κανονική', summaryDetailed:'Αναλυτική',
      deviceVoice:'Δωρεάν φωνή συσκευής', voice:'Φωνή', speed:'Ταχύτητα', play:'Αναπαραγωγή',
      pause:'Παύση', stop:'Διακοπή', ready:'Έτοιμο – ξεκινά μόνο μετά την επιλογή σας.',
      listening:'Ανάγνωση', finished:'Η αναπαραγωγή ολοκληρώθηκε.'
    },
    tr: {
      currentPeriod:'Güncel', last7Days:'Son 7 gün', last30Days:'Son 30 gün', allArticles:'Tüm haberler',
      archiveBrowse:'Haber arşivini aç', showMore:'Daha fazla haber yükle',
      groupPolitics:'Siyaset ve iktidar', groupRights:'Haklar ve toplum',
      groupAction:'Hareketler ve eylem', groupEcology:'Ekoloji ve bilgi',
      prisonersShort:'Tutsaklar', summary:'Özetle', podcast:'Podcast', markRead:'Okundu işaretle',
      markUnread:'Okunmadı işaretle', share:'Paylaş', shared:'Paylaşıldı.', linkCopied:'Bağlantı kopyalandı.',
      shareFailed:'Paylaşım kullanılamıyor.', translationCompare:'Çeviri karşılaştırması',
      originalVersion:'Özgün', translatedVersion:'Çeviri', closeTool:'Kapat',
      summaryLocal:'Yerel özet – özgün metinle karşılaştırın.',
      summaryShort:'Kısa', summaryStandard:'Standart', summaryDetailed:'Ayrıntılı',
      deviceVoice:'Ücretsiz cihaz sesi', voice:'Ses', speed:'Hız', play:'Oynat',
      pause:'Duraklat', stop:'Durdur', ready:'Hazır – yalnızca seçiminizden sonra başlar.',
      listening:'Seslendiriliyor', finished:'Oynatma tamamlandı.'
    }
  };

  const ARTICLE_COPY = {
    de: {
      loadingFullArticle:'Vollständiger Artikel wird geladen …',
      fullArticleUnavailable:'Vollständiger Artikel derzeit nicht verfügbar',
      fullArticleUnavailableText:'Die App zeigt keinen unvollständigen Text als vollständigen Artikel. Öffne das Original oder versuche es erneut.',
      partialArticleLabel:'Verfügbarer Artikelauszug', partialArticleText:'Der vollständige Text konnte nicht geladen werden. Der verfügbare Text endet hier.',
      continueOriginal:'Im Original weiterlesen',
      retryFullArticle:'Erneut vollständig laden', articleImages:'Weitere Artikelbilder',
      offlineComplete:'Vollständig offline', savingOffline:'Wird vollständig offline gespeichert …',
      offlineExcerptSaved:'Auszug gespeichert – der vollständige Text bleibt über das Original erreichbar.',
      offlineSave:'Offline speichern', offlineRemove:'Offline-Dateien entfernen',
      offlineRemoved:'Offline-Dateien entfernt. Der gemerkte Artikel bleibt erhalten.',
      articleHistory:'Änderungsgeschichte', publishedLabel:'Veröffentlicht', updatedLabel:'Aktualisiert',
      changeContent:'Artikeltext ergänzt', changeImages:'Artikelbilder ergänzt', changeTitle:'Titel aktualisiert',
      changeComplete:'Vollständiger Text nachgeladen', correctionLabel:'Korrekturhinweis'
    },
    en: {
      loadingFullArticle:'Loading the complete article …',
      fullArticleUnavailable:'Complete article currently unavailable',
      fullArticleUnavailableText:'The app does not present an incomplete text as a complete article. Open the original or try again.',
      partialArticleLabel:'Available article excerpt', partialArticleText:'The complete text could not be loaded. The available text ends here.',
      continueOriginal:'Continue reading the original',
      retryFullArticle:'Retry complete article', articleImages:'More article images',
      offlineComplete:'Fully available offline', savingOffline:'Saving the complete article offline …',
      offlineExcerptSaved:'Excerpt saved – the complete text remains available from the original.',
      offlineSave:'Save offline', offlineRemove:'Remove offline files',
      offlineRemoved:'Offline files removed. The bookmark remains available.',
      articleHistory:'Change history', publishedLabel:'Published', updatedLabel:'Updated',
      changeContent:'Article text expanded', changeImages:'Article images added', changeTitle:'Title updated',
      changeComplete:'Complete text retrieved', correctionLabel:'Correction note'
    },
    es: {
      loadingFullArticle:'Cargando el artículo completo …',
      fullArticleUnavailable:'El artículo completo no está disponible actualmente',
      fullArticleUnavailableText:'La aplicación no presenta un texto incompleto como artículo completo. Abre el original o inténtalo de nuevo.',
      partialArticleLabel:'Extracto disponible', partialArticleText:'No se pudo cargar el texto completo. El texto disponible termina aquí.',
      continueOriginal:'Seguir leyendo en el original',
      retryFullArticle:'Volver a cargar el artículo completo', articleImages:'Más imágenes del artículo',
      offlineComplete:'Disponible completamente sin conexión', savingOffline:'Guardando el artículo completo sin conexión …',
      offlineExcerptSaved:'Extracto guardado; el texto completo sigue disponible en el original.',
      offlineSave:'Guardar sin conexión', offlineRemove:'Eliminar archivos sin conexión', offlineRemoved:'Archivos sin conexión eliminados; el marcador se conserva.',
      articleHistory:'Historial de cambios', publishedLabel:'Publicado', updatedLabel:'Actualizado', changeContent:'Texto ampliado', changeImages:'Imágenes añadidas', changeTitle:'Título actualizado', changeComplete:'Texto completo recuperado', correctionLabel:'Nota de corrección'
    },
    fr: {
      loadingFullArticle:'Chargement de l’article complet …',
      fullArticleUnavailable:'L’article complet est actuellement indisponible',
      fullArticleUnavailableText:'L’application ne présente pas un texte incomplet comme un article complet. Ouvrez l’original ou réessayez.',
      partialArticleLabel:'Extrait disponible', partialArticleText:'Le texte complet n’a pas pu être chargé. Le texte disponible s’arrête ici.',
      continueOriginal:'Continuer sur l’original',
      retryFullArticle:'Recharger l’article complet', articleImages:'Autres images de l’article',
      offlineComplete:'Entièrement disponible hors ligne', savingOffline:'Enregistrement complet hors ligne …',
      offlineExcerptSaved:'Extrait enregistré ; le texte complet reste accessible dans l’original.',
      offlineSave:'Enregistrer hors ligne', offlineRemove:'Supprimer les fichiers hors ligne', offlineRemoved:'Fichiers hors ligne supprimés ; le favori est conservé.',
      articleHistory:'Historique des modifications', publishedLabel:'Publié', updatedLabel:'Actualisé', changeContent:'Texte enrichi', changeImages:'Images ajoutées', changeTitle:'Titre actualisé', changeComplete:'Texte complet récupéré', correctionLabel:'Note de correction'
    },
    it: {
      loadingFullArticle:'Caricamento dell’articolo completo …',
      fullArticleUnavailable:'L’articolo completo non è attualmente disponibile',
      fullArticleUnavailableText:'L’app non presenta un testo incompleto come articolo completo. Apri l’originale o riprova.',
      partialArticleLabel:'Estratto disponibile', partialArticleText:'Non è stato possibile caricare il testo completo. Il testo disponibile termina qui.',
      continueOriginal:'Continua nell’originale',
      retryFullArticle:'Ricarica l’articolo completo', articleImages:'Altre immagini dell’articolo',
      offlineComplete:'Interamente disponibile offline', savingOffline:'Salvataggio completo offline …',
      offlineExcerptSaved:'Estratto salvato; il testo completo resta disponibile nell’originale.',
      offlineSave:'Salva offline', offlineRemove:'Rimuovi file offline', offlineRemoved:'File offline rimossi; il segnalibro resta disponibile.',
      articleHistory:'Cronologia modifiche', publishedLabel:'Pubblicato', updatedLabel:'Aggiornato', changeContent:'Testo ampliato', changeImages:'Immagini aggiunte', changeTitle:'Titolo aggiornato', changeComplete:'Testo completo recuperato', correctionLabel:'Nota di correzione'
    },
    pt: {
      loadingFullArticle:'A carregar o artigo completo …',
      fullArticleUnavailable:'O artigo completo não está disponível neste momento',
      fullArticleUnavailableText:'A aplicação não apresenta um texto incompleto como artigo completo. Abre o original ou tenta novamente.',
      partialArticleLabel:'Excerto disponível', partialArticleText:'Não foi possível carregar o texto completo. O texto disponível termina aqui.',
      continueOriginal:'Continuar a ler no original',
      retryFullArticle:'Carregar novamente o artigo completo', articleImages:'Mais imagens do artigo',
      offlineComplete:'Totalmente disponível offline', savingOffline:'A guardar o artigo completo offline …',
      offlineExcerptSaved:'Excerto guardado; o texto completo continua disponível no original.',
      offlineSave:'Guardar offline', offlineRemove:'Remover ficheiros offline', offlineRemoved:'Ficheiros offline removidos; o marcador permanece.',
      articleHistory:'Histórico de alterações', publishedLabel:'Publicado', updatedLabel:'Atualizado', changeContent:'Texto ampliado', changeImages:'Imagens adicionadas', changeTitle:'Título atualizado', changeComplete:'Texto completo recuperado', correctionLabel:'Nota de correção'
    },
    ru: {
      loadingFullArticle:'Загружается полный текст статьи …',
      fullArticleUnavailable:'Полный текст статьи сейчас недоступен',
      fullArticleUnavailableText:'Приложение не выдаёт неполный текст за полную статью. Откройте оригинал или повторите попытку.',
      partialArticleLabel:'Доступный фрагмент статьи', partialArticleText:'Полный текст загрузить не удалось. Доступный текст заканчивается здесь.',
      continueOriginal:'Продолжить чтение в оригинале',
      retryFullArticle:'Повторить загрузку полного текста', articleImages:'Другие изображения статьи',
      offlineComplete:'Полностью доступно офлайн', savingOffline:'Полная статья сохраняется офлайн …',
      offlineExcerptSaved:'Фрагмент сохранён; полный текст остаётся доступен в оригинале.',
      offlineSave:'Сохранить офлайн', offlineRemove:'Удалить офлайн-файлы', offlineRemoved:'Офлайн-файлы удалены; закладка сохранена.',
      articleHistory:'История изменений', publishedLabel:'Опубликовано', updatedLabel:'Обновлено', changeContent:'Текст дополнен', changeImages:'Изображения добавлены', changeTitle:'Заголовок обновлён', changeComplete:'Полный текст загружен', correctionLabel:'Примечание об исправлении'
    },
    el: {
      loadingFullArticle:'Φόρτωση πλήρους άρθρου …',
      fullArticleUnavailable:'Το πλήρες άρθρο δεν είναι διαθέσιμο αυτή τη στιγμή',
      fullArticleUnavailableText:'Η εφαρμογή δεν παρουσιάζει ένα ελλιπές κείμενο ως πλήρες άρθρο. Ανοίξτε το πρωτότυπο ή δοκιμάστε ξανά.',
      partialArticleLabel:'Διαθέσιμο απόσπασμα άρθρου', partialArticleText:'Δεν ήταν δυνατή η φόρτωση του πλήρους κειμένου. Το διαθέσιμο κείμενο τελειώνει εδώ.',
      continueOriginal:'Συνέχεια στο πρωτότυπο',
      retryFullArticle:'Επαναφόρτωση πλήρους άρθρου', articleImages:'Περισσότερες εικόνες άρθρου',
      offlineComplete:'Πλήρως διαθέσιμο εκτός σύνδεσης', savingOffline:'Αποθήκευση πλήρους άρθρου εκτός σύνδεσης …',
      offlineExcerptSaved:'Το απόσπασμα αποθηκεύτηκε· το πλήρες κείμενο παραμένει διαθέσιμο στο πρωτότυπο.',
      offlineSave:'Αποθήκευση εκτός σύνδεσης', offlineRemove:'Αφαίρεση αρχείων εκτός σύνδεσης', offlineRemoved:'Τα αρχεία αφαιρέθηκαν· ο σελιδοδείκτης παραμένει.',
      articleHistory:'Ιστορικό αλλαγών', publishedLabel:'Δημοσιεύτηκε', updatedLabel:'Ενημερώθηκε', changeContent:'Το κείμενο εμπλουτίστηκε', changeImages:'Προστέθηκαν εικόνες', changeTitle:'Ο τίτλος ενημερώθηκε', changeComplete:'Ανακτήθηκε πλήρες κείμενο', correctionLabel:'Σημείωση διόρθωσης'
    },
    tr: {
      loadingFullArticle:'Makalenin tamamı yükleniyor …',
      fullArticleUnavailable:'Makalenin tamamı şu anda kullanılamıyor',
      fullArticleUnavailableText:'Uygulama eksik bir metni tam makale olarak göstermez. Özgün metni açın veya yeniden deneyin.',
      partialArticleLabel:'Mevcut makale özeti', partialArticleText:'Tam metin yüklenemedi. Mevcut metin burada sona eriyor.',
      continueOriginal:'Özgün metinde okumaya devam et',
      retryFullArticle:'Tam makaleyi yeniden yükle', articleImages:'Diğer makale görselleri',
      offlineComplete:'Tamamı çevrimdışı kullanılabilir', savingOffline:'Tam makale çevrimdışı kaydediliyor …',
      offlineExcerptSaved:'Özet kaydedildi; tam metne özgün kaynaktan erişilebilir.',
      offlineSave:'Çevrimdışı kaydet', offlineRemove:'Çevrimdışı dosyaları kaldır', offlineRemoved:'Çevrimdışı dosyalar kaldırıldı; yer imi korunuyor.',
      articleHistory:'Değişiklik geçmişi', publishedLabel:'Yayımlandı', updatedLabel:'Güncellendi', changeContent:'Metin genişletildi', changeImages:'Görseller eklendi', changeTitle:'Başlık güncellendi', changeComplete:'Tam metin alındı', correctionLabel:'Düzeltme notu'
    }
  };

  const LIBRARY_COPY = {
    de:{ library:'Bibliothek', libraryText:'Mehrsprachige Texte und Bücher aus passenden unabhängigen Bibliotheken.', libraryIntro:'Ein eigener Lesebereich mit mehreren anarchistischen und libertär-kommunistischen Katalogen. Das Nachrichtenthema „Libraries“ bleibt unverändert.', librarySearch:'Titel, Autor*in oder Thema suchen', librarySources:'Bibliotheken', libraryCatalog:'Vollständigen Katalog öffnen', libraryIndex:'Durchsuchbarer Katalog', libraryLanguage:'Sprache', libraryFormat:'Format', libraryAllLanguages:'Alle Sprachen', libraryAllSources:'Alle Bibliotheken', libraryAllFormats:'Alle Formate', libraryRead:'Lesen', libraryDownloads:'Downloads', libraryNoResults:'Keine passenden Bibliothekstitel gefunden.', libraryLocalIndex:'Der lokale Suchindex wird täglich ergänzt; der offizielle Katalog enthält die vollständige Sammlung.', libraryMore:'Mehr Titel laden' },
    en:{ library:'Library', libraryText:'Multilingual texts and books from compatible independent libraries.', libraryIntro:'A separate reading area with several anarchist and libertarian-communist catalogues. The news topic “Libraries” remains unchanged.', librarySearch:'Search title, author or topic', librarySources:'Libraries', libraryCatalog:'Open full catalogue', libraryIndex:'Searchable catalogue', libraryLanguage:'Language', libraryFormat:'Format', libraryAllLanguages:'All languages', libraryAllSources:'All libraries', libraryAllFormats:'All formats', libraryRead:'Read', libraryDownloads:'Downloads', libraryNoResults:'No matching library titles found.', libraryLocalIndex:'The local search index is extended daily; the official catalogue contains the complete collection.', libraryMore:'Load more titles' },
    es:{ library:'Biblioteca', libraryText:'Textos y libros multilingües de bibliotecas independientes afines.', libraryIntro:'Área de lectura separada con varios catálogos anarquistas y comunistas libertarios. El tema informativo «Libraries» no cambia.', librarySearch:'Buscar título, autoría o tema', librarySources:'Bibliotecas', libraryCatalog:'Abrir catálogo completo', libraryIndex:'Catálogo consultable', libraryLanguage:'Idioma', libraryFormat:'Formato', libraryAllLanguages:'Todos los idiomas', libraryAllSources:'Todas las bibliotecas', libraryAllFormats:'Todos los formatos', libraryRead:'Leer', libraryDownloads:'Descargas', libraryNoResults:'No se encontraron títulos.', libraryLocalIndex:'El índice local se amplía a diario; el catálogo oficial contiene la colección completa.', libraryMore:'Cargar más títulos' },
    fr:{ library:'Bibliothèque', libraryText:'Textes et livres multilingues de bibliothèques indépendantes proches.', libraryIntro:'Espace de lecture séparé avec plusieurs catalogues anarchistes et communistes libertaires. Le thème d’actualité «Libraries» reste inchangé.', librarySearch:'Rechercher titre, auteur·ice ou thème', librarySources:'Bibliothèques', libraryCatalog:'Ouvrir le catalogue complet', libraryIndex:'Catalogue consultable', libraryLanguage:'Langue', libraryFormat:'Format', libraryAllLanguages:'Toutes les langues', libraryAllSources:'Toutes les bibliothèques', libraryAllFormats:'Tous les formats', libraryRead:'Lire', libraryDownloads:'Téléchargements', libraryNoResults:'Aucun titre correspondant.', libraryLocalIndex:'L’index local est complété chaque jour ; le catalogue officiel contient la collection complète.', libraryMore:'Charger plus de titres' },
    it:{ library:'Biblioteca', libraryText:'Testi e libri multilingue da biblioteche indipendenti affini.', libraryIntro:'Area di lettura separata con diversi cataloghi anarchici e comunisti libertari. Il tema notizie “Libraries” resta invariato.', librarySearch:'Cerca titolo, autore o tema', librarySources:'Biblioteche', libraryCatalog:'Apri catalogo completo', libraryIndex:'Catalogo ricercabile', libraryLanguage:'Lingua', libraryFormat:'Formato', libraryAllLanguages:'Tutte le lingue', libraryAllSources:'Tutte le biblioteche', libraryAllFormats:'Tutti i formati', libraryRead:'Leggi', libraryDownloads:'Download', libraryNoResults:'Nessun titolo corrispondente.', libraryLocalIndex:'L’indice locale viene ampliato ogni giorno; il catalogo ufficiale contiene la raccolta completa.', libraryMore:'Carica altri titoli' },
    pt:{ library:'Biblioteca', libraryText:'Textos e livros multilingues de bibliotecas independentes próximas.', libraryIntro:'Área de leitura separada com vários catálogos anarquistas e comunistas libertários. O tema noticioso “Libraries” permanece.', librarySearch:'Pesquisar título, autoria ou tema', librarySources:'Bibliotecas', libraryCatalog:'Abrir catálogo completo', libraryIndex:'Catálogo pesquisável', libraryLanguage:'Idioma', libraryFormat:'Formato', libraryAllLanguages:'Todos os idiomas', libraryAllSources:'Todas as bibliotecas', libraryAllFormats:'Todos os formatos', libraryRead:'Ler', libraryDownloads:'Downloads', libraryNoResults:'Nenhum título correspondente.', libraryLocalIndex:'O índice local é ampliado diariamente; o catálogo oficial contém a coleção completa.', libraryMore:'Carregar mais títulos' },
    ru:{ library:'Библиотека', libraryText:'Многоязычные тексты и книги из близких независимых библиотек.', libraryIntro:'Отдельный раздел с анархистскими и либертарно-коммунистическими каталогами. Новостная тема Libraries не меняется.', librarySearch:'Поиск по названию, автору или теме', librarySources:'Библиотеки', libraryCatalog:'Открыть полный каталог', libraryIndex:'Каталог с поиском', libraryLanguage:'Язык', libraryFormat:'Формат', libraryAllLanguages:'Все языки', libraryAllSources:'Все библиотеки', libraryAllFormats:'Все форматы', libraryRead:'Читать', libraryDownloads:'Скачать', libraryNoResults:'Подходящих материалов нет.', libraryLocalIndex:'Локальный индекс пополняется ежедневно; полный сборник доступен в официальном каталоге.', libraryMore:'Загрузить ещё' },
    el:{ library:'Βιβλιοθήκη', libraryText:'Πολύγλωσσα κείμενα και βιβλία από συναφείς ανεξάρτητες βιβλιοθήκες.', libraryIntro:'Ξεχωριστός χώρος ανάγνωσης με αναρχικούς και ελευθεριακούς κομμουνιστικούς καταλόγους. Το θέμα ειδήσεων Libraries παραμένει.', librarySearch:'Αναζήτηση τίτλου, συγγραφέα ή θέματος', librarySources:'Βιβλιοθήκες', libraryCatalog:'Πλήρης κατάλογος', libraryIndex:'Κατάλογος αναζήτησης', libraryLanguage:'Γλώσσα', libraryFormat:'Μορφή', libraryAllLanguages:'Όλες οι γλώσσες', libraryAllSources:'Όλες οι βιβλιοθήκες', libraryAllFormats:'Όλες οι μορφές', libraryRead:'Ανάγνωση', libraryDownloads:'Λήψεις', libraryNoResults:'Δεν βρέθηκαν τίτλοι.', libraryLocalIndex:'Το τοπικό ευρετήριο επεκτείνεται καθημερινά· ο επίσημος κατάλογος έχει την πλήρη συλλογή.', libraryMore:'Περισσότεροι τίτλοι' },
    tr:{ library:'Kütüphane', libraryText:'Uyumlu bağımsız kütüphanelerden çok dilli metinler ve kitaplar.', libraryIntro:'Anarşist ve özgürlükçü komünist kataloglarla ayrı bir okuma alanı. Libraries haber konusu değişmez.', librarySearch:'Başlık, yazar veya konu ara', librarySources:'Kütüphaneler', libraryCatalog:'Tam kataloğu aç', libraryIndex:'Aranabilir katalog', libraryLanguage:'Dil', libraryFormat:'Biçim', libraryAllLanguages:'Tüm diller', libraryAllSources:'Tüm kütüphaneler', libraryAllFormats:'Tüm biçimler', libraryRead:'Oku', libraryDownloads:'İndir', libraryNoResults:'Eşleşen başlık bulunamadı.', libraryLocalIndex:'Yerel dizin her gün genişletilir; resmi katalog tüm koleksiyonu içerir.', libraryMore:'Daha fazla başlık' }
  };

  const COPY = {
    de: {
      preview: 'News App 2 · Vorschau', language: 'Sprache', classic: 'Bisherige App',
      searchLabel: 'Nachrichten durchsuchen', search: 'Suchen', searchPlaceholder: 'Titel, Quelle oder Thema',
      home: 'Start', following: 'Für mich', discover: 'Entdecken', media: 'Medien', saved: 'Gespeichert',
      loading: 'Nachrichten werden geladen …', latest: 'Aktuell', important: 'Das Wichtigste',
      briefing: 'In 5 Minuten', briefingHint: 'Fünf aktuelle Meldungen in Kürze',
      moreNews: 'Weitere Nachrichten', source: 'Quelle', translate: 'Übersetzen',
      translating: 'Übersetzung läuft …', translated: 'Maschinell übersetzt', translatedFrom: 'Maschinell übersetzt aus {language}', translationFailed: 'Übersetzung nicht verfügbar.',
      original: 'Original öffnen', save: 'Später lesen', savedLabel: 'Gespeichert', removeSaved: 'Entfernen',
      personalTitle: 'Deine Nachrichten', personalIntro: 'Nach deinen ausgewählten Regionen und Themen zusammengestellt.',
      personalize: 'Deinen Feed einrichten', personalLocal: 'Nur auf diesem Gerät gespeichert',
      editSelection: 'Auswahl bearbeiten', chooseRegions: 'Regionen auswählen', chooseTopics: 'Themen auswählen',
      savePreferences: 'Auswahl speichern', cancel: 'Abbrechen', noPreferences: 'Noch keine Auswahl gespeichert',
      noPreferencesText: 'Wähle Regionen und Themen. Deine Auswahl bleibt ausschließlich auf diesem Gerät.',
      noMatches: 'Keine passenden Nachrichten gefunden', noMatchesText: 'Passe deine Auswahl oder Suche an.',
      discoverIntro: 'Durchsuche Regionen, Themen und Quellen, ohne deinen persönlichen Feed zu verändern.',
      all: 'Alle', regions: 'Regionen', topics: 'Themen', results: 'Ergebnisse',
      mediaIntro: 'Video, Podcasts und Radio an einem ruhigen, datensparsamen Ort.',
      video: 'Video', videoText: 'Videos aus Nachrichten und kuratierten Informationsquellen.',
      podcasts: 'Original-Podcasts', podcastsText: 'Sendungen aus unabhängigen und bewegungsnahen Quellen.',
      generated: 'Erzeugte Podcasts', generatedText: 'Gespeicherte Azure-Podcasts der letzten 30 Tage.',
      radio: 'Live-Radio', radioText: 'Freie und nichtkommerzielle Radiostationen.',
      openClassic: 'Im bisherigen Bereich öffnen', specialty: 'Weitere Bereiche',
      events: 'Termine', eventsText: 'Aktionen, Treffen und Veranstaltungen.',
      lexicon: 'Lexikon', lexiconText: '100 Begriffe, Perspektiven und Quellen.',
      prisoners: 'Gefangenensolidarität', prisonersText: 'Informationen und private Briefwerkstatt.',
      developments: 'Entwicklungen', developmentsText: 'Zusammengehörige Meldungen und Zeitverläufe.',
      savedIntro: 'Lokal gespeicherte Artikel aus beiden App-Oberflächen.',
      emptySaved: 'Noch keine Artikel gespeichert', emptySavedText: 'Tippe bei einem Artikel auf den Stern.',
      openArticle: 'Artikel öffnen', readOriginal: 'Beim Original lesen', loadError: 'Die Nachrichtendaten konnten nicht geladen werden.',
      retry: 'Erneut versuchen', menuSearch: 'Suche öffnen', close: 'Schließen',
      fileModeTitle: 'Die Vorschau wurde als Datei geöffnet.',
      fileModeText: 'Nachrichten-Feeds dürfen im file://-Modus nicht geladen werden. Öffne die Vorschau über den lokalen Testserver.',
      openLocalPreview: 'Lokale Vorschau öffnen',
      selectionSaved: 'Deine Auswahl wurde lokal gespeichert.', articleSaved: 'Artikel gespeichert.',
      articleRemoved: 'Artikel entfernt.', translatedTitle: 'Übersetzter Titel und Einleitung',
      previewNotice: 'Parallele Vorschau – die veröffentlichte App bleibt unverändert.',
      liveNotice: 'Unabhängige Nachrichten aus Bewegungen und sozialen Kämpfen.'
    },
    en: {
      preview: 'News App 2 · Preview', language: 'Language', classic: 'Current app',
      searchLabel: 'Search news', search: 'Search', searchPlaceholder: 'Title, source or topic',
      home: 'Home', following: 'For you', discover: 'Discover', media: 'Media', saved: 'Saved',
      loading: 'Loading news …', latest: 'Latest', important: 'Top stories',
      briefing: 'In 5 minutes', briefingHint: 'Five current stories at a glance',
      moreNews: 'More news', source: 'Source', translate: 'Translate',
      translating: 'Translating …', translated: 'Machine translated', translatedFrom: 'Machine translated from {language}', translationFailed: 'Translation unavailable.',
      original: 'Open original', save: 'Read later', savedLabel: 'Saved', removeSaved: 'Remove',
      personalTitle: 'Your news', personalIntro: 'Built from your selected regions and topics.',
      personalize: 'Set up your feed', personalLocal: 'Stored only on this device',
      editSelection: 'Edit selection', chooseRegions: 'Choose regions', chooseTopics: 'Choose topics',
      savePreferences: 'Save selection', cancel: 'Cancel', noPreferences: 'No selection saved yet',
      noPreferencesText: 'Choose regions and topics. Your selection stays on this device.',
      noMatches: 'No matching news', noMatchesText: 'Adjust your selection or search.',
      discoverIntro: 'Explore regions, topics and sources without changing your personal feed.',
      all: 'All', regions: 'Regions', topics: 'Topics', results: 'Results',
      mediaIntro: 'Video, podcasts and radio in one calm, privacy-conscious place.',
      video: 'Video', videoText: 'Videos from news stories and curated information sources.',
      podcasts: 'Original podcasts', podcastsText: 'Shows from independent and movement sources.',
      generated: 'Generated podcasts', generatedText: 'Stored Azure podcasts from the last 30 days.',
      radio: 'Live radio', radioText: 'Free and non-commercial radio stations.',
      openClassic: 'Open current section', specialty: 'More areas',
      events: 'Events', eventsText: 'Actions, meetings and events.',
      lexicon: 'Glossary', lexiconText: '100 terms, perspectives and sources.',
      prisoners: 'Prisoner solidarity', prisonersText: 'Information and private letter workshop.',
      developments: 'Developments', developmentsText: 'Related coverage and timelines.',
      savedIntro: 'Articles stored locally from both app interfaces.',
      emptySaved: 'No saved articles yet', emptySavedText: 'Tap the star on an article.',
      openArticle: 'Open article', readOriginal: 'Read original', loadError: 'News data could not be loaded.',
      retry: 'Try again', menuSearch: 'Open search', close: 'Close',
      fileModeTitle: 'The preview was opened as a file.',
      fileModeText: 'News feeds cannot be loaded in file:// mode. Open the preview through the local test server.',
      openLocalPreview: 'Open local preview',
      selectionSaved: 'Your selection was saved locally.', articleSaved: 'Article saved.',
      articleRemoved: 'Article removed.', translatedTitle: 'Translated title and introduction',
      previewNotice: 'Parallel preview – the published app remains unchanged.',
      liveNotice: 'Independent news from movements and social struggles.'
    },
    es: {
      preview:'News App 2 · Vista previa', language:'Idioma', classic:'Aplicación actual', searchLabel:'Buscar noticias', search:'Buscar',
      searchPlaceholder:'Título, fuente o tema', home:'Inicio', following:'Para mí', discover:'Explorar', media:'Medios', saved:'Guardado',
      loading:'Cargando noticias …', latest:'Actualidad', important:'Lo más importante', briefing:'En 5 minutos',
      briefingHint:'Cinco noticias actuales en breve', moreNews:'Más noticias', source:'Fuente', translate:'Traducir',
      translating:'Traduciendo …', translated:'Traducción automática', translatedFrom:'Traducción automática del {language}', translationFailed:'Traducción no disponible.',
      original:'Abrir original', save:'Leer después', savedLabel:'Guardado', removeSaved:'Eliminar',
      personalTitle:'Tus noticias', personalIntro:'Según tus regiones y temas seleccionados.', personalize:'Configurar tu feed',
      personalLocal:'Guardado solo en este dispositivo', editSelection:'Editar selección', chooseRegions:'Elegir regiones',
      chooseTopics:'Elegir temas', savePreferences:'Guardar selección', cancel:'Cancelar', noPreferences:'Aún no hay selección',
      noPreferencesText:'Elige regiones y temas. La selección permanece en este dispositivo.', noMatches:'No hay noticias coincidentes',
      noMatchesText:'Ajusta tu selección o búsqueda.', discoverIntro:'Explora regiones, temas y fuentes sin cambiar tu feed.',
      all:'Todo', regions:'Regiones', topics:'Temas', results:'Resultados', mediaIntro:'Vídeo, pódcasts y radio en un solo lugar.',
      video:'Vídeo', videoText:'Vídeos de noticias y fuentes informativas seleccionadas.', podcasts:'Pódcasts originales',
      podcastsText:'Programas de fuentes independientes y de movimientos.', generated:'Pódcasts generados',
      generatedText:'Pódcasts de Azure guardados durante 30 días.', radio:'Radio en directo',
      radioText:'Radios libres y no comerciales.', openClassic:'Abrir área actual', specialty:'Más áreas',
      events:'Eventos', eventsText:'Acciones, reuniones y eventos.', lexicon:'Glosario', lexiconText:'100 términos, perspectivas y fuentes.',
      prisoners:'Solidaridad con presxs', prisonersText:'Información y taller privado de cartas.', developments:'Desarrollos',
      developmentsText:'Noticias relacionadas y cronologías.', savedIntro:'Artículos guardados localmente.',
      emptySaved:'No hay artículos guardados', emptySavedText:'Pulsa la estrella en un artículo.', openArticle:'Abrir artículo',
      readOriginal:'Leer original', loadError:'No se pudieron cargar las noticias.', retry:'Intentar de nuevo',
      menuSearch:'Abrir búsqueda', close:'Cerrar', selectionSaved:'Selección guardada localmente.',
      fileModeTitle:'La vista previa se abrió como archivo.', fileModeText:'Las fuentes de noticias no pueden cargarse en modo file://. Abre la vista previa mediante el servidor de prueba local.', openLocalPreview:'Abrir vista previa local',
      articleSaved:'Artículo guardado.', articleRemoved:'Artículo eliminado.', translatedTitle:'Título e introducción traducidos',
      previewNotice:'Vista previa paralela: la aplicación publicada no cambia.',
      liveNotice:'Noticias independientes de movimientos y luchas sociales.'
    },
    fr: {
      preview:'News App 2 · Aperçu', language:'Langue', classic:'Application actuelle', searchLabel:'Rechercher des actualités', search:'Rechercher',
      searchPlaceholder:'Titre, source ou thème', home:'Accueil', following:'Pour moi', discover:'Découvrir', media:'Médias', saved:'Enregistré',
      loading:'Chargement des actualités …', latest:'Actualité', important:'À la une', briefing:'En 5 minutes',
      briefingHint:'Cinq informations actuelles en bref', moreNews:'Plus d’actualités', source:'Source', translate:'Traduire',
      translating:'Traduction …', translated:'Traduit automatiquement', translatedFrom:'Traduit automatiquement depuis le {language}', translationFailed:'Traduction indisponible.',
      original:'Ouvrir l’original', save:'Lire plus tard', savedLabel:'Enregistré', removeSaved:'Supprimer',
      personalTitle:'Vos actualités', personalIntro:'Selon vos régions et thèmes choisis.', personalize:'Configurer votre fil',
      personalLocal:'Stocké uniquement sur cet appareil', editSelection:'Modifier la sélection', chooseRegions:'Choisir les régions',
      chooseTopics:'Choisir les thèmes', savePreferences:'Enregistrer', cancel:'Annuler', noPreferences:'Aucune sélection enregistrée',
      noPreferencesText:'Choisissez des régions et thèmes. Le choix reste sur cet appareil.', noMatches:'Aucune actualité correspondante',
      noMatchesText:'Modifiez votre sélection ou recherche.', discoverIntro:'Explorez régions, thèmes et sources sans changer votre fil.',
      all:'Tout', regions:'Régions', topics:'Thèmes', results:'Résultats', mediaIntro:'Vidéos, podcasts et radio au même endroit.',
      video:'Vidéo', videoText:'Vidéos d’actualité et sources informatives sélectionnées.', podcasts:'Podcasts originaux',
      podcastsText:'Émissions de sources indépendantes et militantes.', generated:'Podcasts générés',
      generatedText:'Podcasts Azure enregistrés pendant 30 jours.', radio:'Radio en direct',
      radioText:'Radios libres et non commerciales.', openClassic:'Ouvrir l’espace actuel', specialty:'Autres espaces',
      events:'Événements', eventsText:'Actions, rencontres et événements.', lexicon:'Lexique', lexiconText:'100 termes, perspectives et sources.',
      prisoners:'Solidarité avec les prisonnier·ères', prisonersText:'Informations et atelier privé de lettres.',
      developments:'Évolutions', developmentsText:'Articles liés et chronologies.', savedIntro:'Articles enregistrés localement.',
      emptySaved:'Aucun article enregistré', emptySavedText:'Touchez l’étoile d’un article.', openArticle:'Ouvrir l’article',
      readOriginal:'Lire l’original', loadError:'Impossible de charger les actualités.', retry:'Réessayer',
      menuSearch:'Ouvrir la recherche', close:'Fermer', selectionSaved:'Sélection enregistrée localement.',
      fileModeTitle:'L’aperçu a été ouvert comme fichier.', fileModeText:'Les flux d’actualités ne peuvent pas être chargés en mode file://. Ouvrez l’aperçu avec le serveur de test local.', openLocalPreview:'Ouvrir l’aperçu local',
      articleSaved:'Article enregistré.', articleRemoved:'Article supprimé.', translatedTitle:'Titre et introduction traduits',
      previewNotice:'Aperçu parallèle – l’application publiée reste inchangée.',
      liveNotice:'Actualités indépendantes des mouvements et des luttes sociales.'
    },
    it: {
      preview:'News App 2 · Anteprima', language:'Lingua', classic:'App attuale', searchLabel:'Cerca notizie', search:'Cerca',
      searchPlaceholder:'Titolo, fonte o tema', home:'Inizio', following:'Per me', discover:'Scopri', media:'Media', saved:'Salvati',
      loading:'Caricamento notizie …', latest:'Attualità', important:'In primo piano', briefing:'In 5 minuti',
      briefingHint:'Cinque notizie attuali in breve', moreNews:'Altre notizie', source:'Fonte', translate:'Traduci',
      translating:'Traduzione …', translated:'Traduzione automatica', translatedFrom:'Traduzione automatica dal {language}', translationFailed:'Traduzione non disponibile.',
      original:'Apri originale', save:'Leggi dopo', savedLabel:'Salvato', removeSaved:'Rimuovi',
      personalTitle:'Le tue notizie', personalIntro:'In base a regioni e temi scelti.', personalize:'Configura il tuo feed',
      personalLocal:'Salvato solo su questo dispositivo', editSelection:'Modifica selezione', chooseRegions:'Scegli regioni',
      chooseTopics:'Scegli temi', savePreferences:'Salva selezione', cancel:'Annulla', noPreferences:'Nessuna selezione salvata',
      noPreferencesText:'Scegli regioni e temi. La selezione resta sul dispositivo.', noMatches:'Nessuna notizia corrispondente',
      noMatchesText:'Modifica selezione o ricerca.', discoverIntro:'Esplora regioni, temi e fonti senza cambiare il feed.',
      all:'Tutto', regions:'Regioni', topics:'Temi', results:'Risultati', mediaIntro:'Video, podcast e radio in un unico luogo.',
      video:'Video', videoText:'Video da notizie e fonti informative selezionate.', podcasts:'Podcast originali',
      podcastsText:'Programmi da fonti indipendenti e dei movimenti.', generated:'Podcast generati',
      generatedText:'Podcast Azure conservati per 30 giorni.', radio:'Radio in diretta', radioText:'Radio libere e non commerciali.',
      openClassic:'Apri area attuale', specialty:'Altre aree', events:'Eventi', eventsText:'Azioni, incontri ed eventi.',
      lexicon:'Glossario', lexiconText:'100 termini, prospettive e fonti.', prisoners:'Solidarietà ai prigionieri',
      prisonersText:'Informazioni e laboratorio privato di lettere.', developments:'Sviluppi',
      developmentsText:'Notizie collegate e cronologie.', savedIntro:'Articoli salvati localmente.',
      emptySaved:'Nessun articolo salvato', emptySavedText:'Tocca la stella su un articolo.', openArticle:'Apri articolo',
      readOriginal:'Leggi originale', loadError:'Impossibile caricare le notizie.', retry:'Riprova',
      menuSearch:'Apri ricerca', close:'Chiudi', selectionSaved:'Selezione salvata localmente.',
      fileModeTitle:'L’anteprima è stata aperta come file.', fileModeText:'I feed delle notizie non possono essere caricati in modalità file://. Apri l’anteprima tramite il server di prova locale.', openLocalPreview:'Apri anteprima locale',
      articleSaved:'Articolo salvato.', articleRemoved:'Articolo rimosso.', translatedTitle:'Titolo e introduzione tradotti',
      previewNotice:'Anteprima parallela: l’app pubblicata non cambia.',
      liveNotice:'Notizie indipendenti da movimenti e lotte sociali.'
    },
    pt: {
      preview:'News App 2 · Pré-visualização', language:'Idioma', classic:'Aplicação atual', searchLabel:'Pesquisar notícias', search:'Pesquisar',
      searchPlaceholder:'Título, fonte ou tema', home:'Início', following:'Para mim', discover:'Explorar', media:'Media', saved:'Guardados',
      loading:'A carregar notícias …', latest:'Atualidade', important:'Destaques', briefing:'Em 5 minutos',
      briefingHint:'Cinco notícias atuais em resumo', moreNews:'Mais notícias', source:'Fonte', translate:'Traduzir',
      translating:'A traduzir …', translated:'Tradução automática', translatedFrom:'Tradução automática de {language}', translationFailed:'Tradução indisponível.',
      original:'Abrir original', save:'Ler depois', savedLabel:'Guardado', removeSaved:'Remover',
      personalTitle:'As tuas notícias', personalIntro:'Com base nas regiões e temas escolhidos.', personalize:'Configurar o feed',
      personalLocal:'Guardado apenas neste dispositivo', editSelection:'Editar seleção', chooseRegions:'Escolher regiões',
      chooseTopics:'Escolher temas', savePreferences:'Guardar seleção', cancel:'Cancelar', noPreferences:'Nenhuma seleção guardada',
      noPreferencesText:'Escolhe regiões e temas. A seleção fica neste dispositivo.', noMatches:'Nenhuma notícia correspondente',
      noMatchesText:'Altera a seleção ou pesquisa.', discoverIntro:'Explora regiões, temas e fontes sem alterar o teu feed.',
      all:'Tudo', regions:'Regiões', topics:'Temas', results:'Resultados', mediaIntro:'Vídeo, podcasts e rádio num só lugar.',
      video:'Vídeo', videoText:'Vídeos de notícias e fontes informativas selecionadas.', podcasts:'Podcasts originais',
      podcastsText:'Programas de fontes independentes e de movimentos.', generated:'Podcasts gerados',
      generatedText:'Podcasts Azure guardados durante 30 dias.', radio:'Rádio em direto', radioText:'Rádios livres e não comerciais.',
      openClassic:'Abrir área atual', specialty:'Outras áreas', events:'Eventos', eventsText:'Ações, encontros e eventos.',
      lexicon:'Glossário', lexiconText:'100 termos, perspetivas e fontes.', prisoners:'Solidariedade com prisioneiros',
      prisonersText:'Informação e oficina privada de cartas.', developments:'Desenvolvimentos',
      developmentsText:'Notícias relacionadas e cronologias.', savedIntro:'Artigos guardados localmente.',
      emptySaved:'Nenhum artigo guardado', emptySavedText:'Toca na estrela de um artigo.', openArticle:'Abrir artigo',
      readOriginal:'Ler original', loadError:'Não foi possível carregar as notícias.', retry:'Tentar novamente',
      menuSearch:'Abrir pesquisa', close:'Fechar', selectionSaved:'Seleção guardada localmente.',
      fileModeTitle:'A pré-visualização foi aberta como ficheiro.', fileModeText:'Os feeds de notícias não podem ser carregados no modo file://. Abre a pré-visualização através do servidor de teste local.', openLocalPreview:'Abrir pré-visualização local',
      articleSaved:'Artigo guardado.', articleRemoved:'Artigo removido.', translatedTitle:'Título e introdução traduzidos',
      previewNotice:'Pré-visualização paralela: a aplicação publicada não muda.',
      liveNotice:'Notícias independentes de movimentos e lutas sociais.'
    },
    ru: {
      preview:'News App 2 · Предпросмотр', language:'Язык', classic:'Текущее приложение', searchLabel:'Поиск новостей', search:'Поиск',
      searchPlaceholder:'Заголовок, источник или тема', home:'Главная', following:'Для меня', discover:'Обзор', media:'Медиа', saved:'Сохранённое',
      loading:'Загрузка новостей …', latest:'Сейчас', important:'Главное', briefing:'За 5 минут',
      briefingHint:'Пять актуальных новостей кратко', moreNews:'Другие новости', source:'Источник', translate:'Перевести',
      translating:'Перевод …', translated:'Машинный перевод', translatedFrom:'Машинный перевод с языка: {language}', translationFailed:'Перевод недоступен.',
      original:'Открыть оригинал', save:'Прочитать позже', savedLabel:'Сохранено', removeSaved:'Удалить',
      personalTitle:'Ваши новости', personalIntro:'По выбранным регионам и темам.', personalize:'Настроить ленту',
      personalLocal:'Хранится только на этом устройстве', editSelection:'Изменить выбор', chooseRegions:'Выбрать регионы',
      chooseTopics:'Выбрать темы', savePreferences:'Сохранить', cancel:'Отмена', noPreferences:'Выбор ещё не сохранён',
      noPreferencesText:'Выберите регионы и темы. Данные останутся на устройстве.', noMatches:'Подходящих новостей нет',
      noMatchesText:'Измените выбор или поиск.', discoverIntro:'Изучайте регионы, темы и источники, не меняя личную ленту.',
      all:'Все', regions:'Регионы', topics:'Темы', results:'Результаты', mediaIntro:'Видео, подкасты и радио в одном месте.',
      video:'Видео', videoText:'Видео из новостей и отобранных источников.', podcasts:'Оригинальные подкасты',
      podcastsText:'Передачи независимых и общественных источников.', generated:'Созданные подкасты',
      generatedText:'Подкасты Azure за последние 30 дней.', radio:'Прямое радио', radioText:'Свободные некоммерческие радиостанции.',
      openClassic:'Открыть текущий раздел', specialty:'Другие разделы', events:'События', eventsText:'Акции, встречи и события.',
      lexicon:'Словарь', lexiconText:'100 терминов, точек зрения и источников.', prisoners:'Солидарность с заключёнными',
      prisonersText:'Информация и приватная мастерская писем.', developments:'Развитие · Бета',
      developmentsText:'Связанные материалы и хронологии.', savedIntro:'Локально сохранённые статьи.',
      emptySaved:'Сохранённых статей пока нет', emptySavedText:'Нажмите звезду на статье.', openArticle:'Открыть статью',
      readOriginal:'Читать оригинал', loadError:'Не удалось загрузить новости.', retry:'Повторить',
      menuSearch:'Открыть поиск', close:'Закрыть', selectionSaved:'Выбор сохранён локально.',
      fileModeTitle:'Предпросмотр открыт как файл.', fileModeText:'Новостные ленты нельзя загрузить в режиме file://. Откройте предпросмотр через локальный тестовый сервер.', openLocalPreview:'Открыть локальный предпросмотр',
      articleSaved:'Статья сохранена.', articleRemoved:'Статья удалена.', translatedTitle:'Переведённые заголовок и введение',
      previewNotice:'Параллельный предпросмотр — опубликованное приложение не меняется.',
      liveNotice:'Независимые новости движений и социальной борьбы.'
    },
    el: {
      preview:'News App 2 · Προεπισκόπηση', language:'Γλώσσα', classic:'Τρέχουσα εφαρμογή', searchLabel:'Αναζήτηση ειδήσεων', search:'Αναζήτηση',
      searchPlaceholder:'Τίτλος, πηγή ή θέμα', home:'Αρχική', following:'Για μένα', discover:'Ανακάλυψη', media:'Μέσα', saved:'Αποθηκευμένα',
      loading:'Φόρτωση ειδήσεων …', latest:'Τώρα', important:'Σημαντικότερα', briefing:'Σε 5 λεπτά',
      briefingHint:'Πέντε τρέχουσες ειδήσεις εν συντομία', moreNews:'Περισσότερες ειδήσεις', source:'Πηγή', translate:'Μετάφραση',
      translating:'Μετάφραση …', translated:'Αυτόματη μετάφραση', translatedFrom:'Αυτόματη μετάφραση από {language}', translationFailed:'Η μετάφραση δεν είναι διαθέσιμη.',
      original:'Άνοιγμα πρωτοτύπου', save:'Ανάγνωση αργότερα', savedLabel:'Αποθηκεύτηκε', removeSaved:'Αφαίρεση',
      personalTitle:'Οι ειδήσεις σου', personalIntro:'Με βάση τις περιοχές και τα θέματα που επέλεξες.', personalize:'Ρύθμιση ροής',
      personalLocal:'Αποθήκευση μόνο σε αυτή τη συσκευή', editSelection:'Επεξεργασία επιλογής', chooseRegions:'Επιλογή περιοχών',
      chooseTopics:'Επιλογή θεμάτων', savePreferences:'Αποθήκευση', cancel:'Ακύρωση', noPreferences:'Δεν υπάρχει αποθηκευμένη επιλογή',
      noPreferencesText:'Επίλεξε περιοχές και θέματα. Η επιλογή μένει στη συσκευή.', noMatches:'Δεν βρέθηκαν σχετικές ειδήσεις',
      noMatchesText:'Άλλαξε την επιλογή ή την αναζήτηση.', discoverIntro:'Εξερεύνησε περιοχές, θέματα και πηγές χωρίς αλλαγή της ροής.',
      all:'Όλα', regions:'Περιοχές', topics:'Θέματα', results:'Αποτελέσματα', mediaIntro:'Βίντεο, podcast και ραδιόφωνο μαζί.',
      video:'Βίντεο', videoText:'Βίντεο από ειδήσεις και επιλεγμένες ενημερωτικές πηγές.', podcasts:'Πρωτότυπα podcast',
      podcastsText:'Εκπομπές από ανεξάρτητες πηγές και κινήματα.', generated:'Δημιουργημένα podcast',
      generatedText:'Podcast Azure αποθηκευμένα για 30 ημέρες.', radio:'Ζωντανό ραδιόφωνο', radioText:'Ελεύθεροι μη εμπορικοί σταθμοί.',
      openClassic:'Άνοιγμα τρέχουσας ενότητας', specialty:'Περισσότερες ενότητες', events:'Εκδηλώσεις', eventsText:'Δράσεις, συναντήσεις και εκδηλώσεις.',
      lexicon:'Λεξικό', lexiconText:'100 όροι, οπτικές και πηγές.', prisoners:'Αλληλεγγύη κρατουμένων',
      prisonersText:'Πληροφορίες και ιδιωτικό εργαστήριο επιστολών.', developments:'Εξελίξεις',
      developmentsText:'Σχετικές ειδήσεις και χρονολόγια.', savedIntro:'Άρθρα αποθηκευμένα τοπικά.',
      emptySaved:'Δεν υπάρχουν αποθηκευμένα άρθρα', emptySavedText:'Πάτησε το αστέρι σε ένα άρθρο.', openArticle:'Άνοιγμα άρθρου',
      readOriginal:'Ανάγνωση πρωτοτύπου', loadError:'Δεν ήταν δυνατή η φόρτωση.', retry:'Δοκιμή ξανά',
      menuSearch:'Άνοιγμα αναζήτησης', close:'Κλείσιμο', selectionSaved:'Η επιλογή αποθηκεύτηκε τοπικά.',
      fileModeTitle:'Η προεπισκόπηση ανοίχτηκε ως αρχείο.', fileModeText:'Οι ροές ειδήσεων δεν φορτώνονται σε λειτουργία file://. Ανοίξτε την προεπισκόπηση μέσω του τοπικού διακομιστή δοκιμών.', openLocalPreview:'Άνοιγμα τοπικής προεπισκόπησης',
      articleSaved:'Το άρθρο αποθηκεύτηκε.', articleRemoved:'Το άρθρο αφαιρέθηκε.', translatedTitle:'Μεταφρασμένος τίτλος και εισαγωγή',
      previewNotice:'Παράλληλη προεπισκόπηση — η δημοσιευμένη εφαρμογή δεν αλλάζει.',
      liveNotice:'Ανεξάρτητες ειδήσεις από κινήματα και κοινωνικούς αγώνες.'
    },
    tr: {
      preview:'News App 2 · Önizleme', language:'Dil', classic:'Mevcut uygulama', searchLabel:'Haberlerde ara', search:'Ara',
      searchPlaceholder:'Başlık, kaynak veya konu', home:'Başlangıç', following:'Benim için', discover:'Keşfet', media:'Medya', saved:'Kaydedilenler',
      loading:'Haberler yükleniyor …', latest:'Güncel', important:'Önemli haberler', briefing:'5 dakikada',
      briefingHint:'Beş güncel haberin kısa özeti', moreNews:'Diğer haberler', source:'Kaynak', translate:'Çevir',
      translating:'Çevriliyor …', translated:'Makine çevirisi', translatedFrom:'{language} dilinden makine çevirisi', translationFailed:'Çeviri kullanılamıyor.',
      original:'Orijinali aç', save:'Sonra oku', savedLabel:'Kaydedildi', removeSaved:'Kaldır',
      personalTitle:'Haberlerin', personalIntro:'Seçtiğin bölge ve konulara göre.', personalize:'Akışını ayarla',
      personalLocal:'Yalnızca bu cihazda saklanır', editSelection:'Seçimi düzenle', chooseRegions:'Bölgeleri seç',
      chooseTopics:'Konuları seç', savePreferences:'Seçimi kaydet', cancel:'İptal', noPreferences:'Henüz seçim kaydedilmedi',
      noPreferencesText:'Bölge ve konu seç. Seçimin bu cihazda kalır.', noMatches:'Uygun haber bulunamadı',
      noMatchesText:'Seçimini veya aramanı değiştir.', discoverIntro:'Kişisel akışını değiştirmeden bölge, konu ve kaynakları keşfet.',
      all:'Tümü', regions:'Bölgeler', topics:'Konular', results:'Sonuçlar', mediaIntro:'Video, podcast ve radyo tek yerde.',
      video:'Video', videoText:'Haberlerden ve seçilmiş bilgi kaynaklarından videolar.', podcasts:'Orijinal podcastler',
      podcastsText:'Bağımsız ve hareket kaynaklarından programlar.', generated:'Oluşturulan podcastler',
      generatedText:'Son 30 günün Azure podcastleri.', radio:'Canlı radyo', radioText:'Özgür ve ticari olmayan radyolar.',
      openClassic:'Mevcut bölümü aç', specialty:'Diğer alanlar', events:'Etkinlikler', eventsText:'Eylemler, toplantılar ve etkinlikler.',
      lexicon:'Sözlük', lexiconText:'100 kavram, bakış açısı ve kaynak.', prisoners:'Tutsak dayanışması',
      prisonersText:'Bilgi ve özel mektup atölyesi.', developments:'Gelişmeler',
      developmentsText:'İlgili haberler ve zaman çizelgeleri.', savedIntro:'Yerel olarak kaydedilen haberler.',
      emptySaved:'Henüz kaydedilmiş haber yok', emptySavedText:'Bir haberdeki yıldıza dokun.', openArticle:'Haberi aç',
      readOriginal:'Orijinali oku', loadError:'Haberler yüklenemedi.', retry:'Tekrar dene',
      menuSearch:'Aramayı aç', close:'Kapat', selectionSaved:'Seçimin yerel olarak kaydedildi.',
      fileModeTitle:'Önizleme dosya olarak açıldı.', fileModeText:'Haber akışları file:// modunda yüklenemez. Önizlemeyi yerel test sunucusu üzerinden açın.', openLocalPreview:'Yerel önizlemeyi aç',
      articleSaved:'Haber kaydedildi.', articleRemoved:'Haber kaldırıldı.', translatedTitle:'Çevrilmiş başlık ve giriş',
      previewNotice:'Paralel önizleme — yayımlanmış uygulama değişmez.',
      liveNotice:'Hareketlerden ve toplumsal mücadelelerden bağımsız haberler.'
    }
  };

  const SPECIAL_COPY = {
    de: {
      backDiscover:'Zurück zu Entdecken', underConstruction:'Im Aufbau',
      eventUpcoming:'Kommende Termine', eventArchive:'Archiv', eventSearch:'Termine durchsuchen',
      eventCountry:'Land', eventAllCountries:'Alle Länder', eventRepeat:'zusammengefasste Termine',
      when:'Wann', where:'Wo', internationalUnknown:'International / unklar', noEvents:'Keine passenden Termine gefunden.',
      glossaryIntro:'Kurze Einordnungen zu Begriffen aus anarchistischen, antiautoritären und linksrevolutionären Bewegungen.',
      glossaryNote:'Ohne Anspruch auf Vollständigkeit: Begriffe bewegen sich, werden umkämpft und gemeinsam weiterentwickelt.',
      glossarySearch:'Begriffe durchsuchen', glossarySources:'Quellen', meaning:'Kurz erklärt', practice:'In der Praxis',
      debate:'Unterschiedliche Perspektiven', related:'Verwandte Begriffe', downloadJson:'Lexikon als JSON sichern',
      sourceOpen:'Quelle öffnen', inlineGlossaryHint:'Markierte Begriffe antippen, um sie kurz einzuordnen.',
      openFullGlossary:'Im vollständigen Lexikon öffnen',
      fallbackLanguage:'Dieser Eintrag ist noch nicht vollständig übersetzt; die englische Fassung wird angezeigt.',
      prisonerIntro:'Verifizierte öffentliche Adressen und eine private Briefwerkstatt für solidarische Post.',
      prisonerLimited:'Bewusst kleine, unvollständige und redaktionell geprüfte Liste – keine juristische Bewertung.',
      verified:'Geprüft', reviewBy:'Erneut prüfen bis', address:'Postadresse', writeLetter:'Brief schreiben',
      relatedNews:'Zugehörige Nachrichten', noRelated:'Noch kein passender Artikel im lokalen Archiv.',
      mailRules:'Versandregeln', localOnly:'Entwürfe und persönliche Angaben bleiben auf diesem Gerät.',
      prisonerPeople:'Gefangene', prisonerSources:'Quellen', linkedProfiles:'Verknüpfte Profile', noLinkedProfiles:'Keine direkt verknüpften Profile.',
      sourceChecked:'Geprüft am', profilesTotal:'Profile', profilesEurope:'davon Europa',
      developmentIntro:'Hier kannst du verschiedene Berichte zum selben Ereignis direkt miteinander vergleichen.',
      developmentGuard:'Ein gemeinsamer Ort oder Oberbegriff reicht nicht aus. Verbunden werden nur eigenständige Quellen mit mehreren starken Inhaltssignalen.',
      whyLinked:'Einordnung', confidence:'Bündelungssicherheit', storySources:'Quellen', storyArticles:'Berichte',
      assignmentStrength:'Bündelungssicherheit', strengthHigh:'hoch', strengthVeryHigh:'sehr hoch',
      strengthExplanation:'Entscheidend sind ähnliche Titel, Namen und prägende Formulierungen. Zeitpunkt, Region und Thema dienen als zusätzliche Hinweise. Der Wert bewertet weder den Wahrheitsgehalt noch die Qualität einer Quelle.',
      sourceMix:'Quellenbreite', mixBroad:'breit', mixVaried:'unterschiedlich', mixLimited:'begrenzt',
      mixSources:'Eigenständige Quellen', mixOrigins:'Herkunft der Quellen', mixLanguages:'Originalsprachen', mixUnknown:'Quellen ohne Herkunftsangabe',
      mixExplanation:'Die Quellenbreite zeigt, wie viele eigenständige Quellen, Herkunftsräume und Originalsprachen vertreten sind. Artikeltexte werden dabei nicht vermischt.',
      compareReports:'Berichte vergleichen', compareIntro:'Jeder Bericht bleibt getrennt. So lassen sich Schwerpunkt, Sprache und Herkunft der Quellen direkt vergleichen.',
      comparisonShared:'Gemeinsam', comparisonDifferent:'Unterschiede', comparisonSameEvent:'Dasselbe Ereignis',
      openReport:'Bericht öffnen', limitedPerspective:'Bisher ist die Quellenbreite begrenzt. Weitere unabhängige Berichte können das Bild ergänzen.',
      storyTimeline:'Zeitverlauf', noDevelopments:'Aktuell gibt es keine ausreichend sichere Mehrquellen-Entwicklung.',
      watch:'Beobachten', watching:'Beobachtet', showWatched:'Nur beobachtete', showAll:'Alle Entwicklungen',
      originEvidence:'Herkunftsnachweis', originExplicit:'belegt', originInferred:'nachvollziehbar abgeleitet', registryUpdated:'Registerstand',
      reviewQueue:'Redaktionelle Prüfliste', reviewGrouping:'Bündelung melden', reviewRecorded:'Zur Prüfung gemeldet',
      reviewIntro:'Melde eine unpassende Zuordnung. Der Eintrag bleibt lokal auf diesem Gerät und kann als JSON an die Redaktion weitergegeben werden.',
      reviewReport:'Betroffener Bericht', reviewWholeCluster:'Gesamtes Bündel', reviewReason:'Grund', reviewNote:'Optionale Notiz',
      reviewReasonWrongArticle:'Bericht gehört nicht in dieses Bündel', reviewReasonDifferentEvent:'Berichte beschreiben unterschiedliche Ereignisse',
      reviewReasonDuplicate:'Quelle oder Meldung ist doppelt', reviewReasonClassification:'Region oder Thema ist falsch', reviewReasonOther:'Anderer Grund',
      reviewSubmit:'Zur Prüfliste hinzufügen', reviewSaved:'Prüfhinweis lokal gespeichert.', reviewEmpty:'Noch keine offenen Prüfhinweise.',
      reviewOpen:'offen', reviewResolved:'geprüft', reviewResolve:'Als geprüft markieren', reviewReopen:'Wieder öffnen', reviewRemove:'Entfernen',
      reviewExport:'Prüfliste als JSON exportieren', reviewClose:'Schließen', reviewAudit:'Lokales Prüfprotokoll', reviewCreated:'Gemeldet am',
      reviewHistory:'Änderungsgeschichte', reviewReported:'Gemeldet', reviewMarkedResolved:'Als geprüft markiert', reviewReopened:'Wieder geöffnet'
    },
    en: {
      backDiscover:'Back to Discover', underConstruction:'Under construction',
      eventUpcoming:'Upcoming events', eventArchive:'Archive', eventSearch:'Search events', eventCountry:'Country',
      eventAllCountries:'All countries', eventRepeat:'grouped dates', when:'When', where:'Where', internationalUnknown:'International / unclear', noEvents:'No matching events found.',
      glossaryIntro:'Short contextual explanations of terms used in anarchist, anti-authoritarian and revolutionary left movements.',
      glossaryNote:'No claim to completeness: words move, are contested and develop through collective use.',
      glossarySearch:'Search terms', glossarySources:'Sources', meaning:'In brief', practice:'In practice',
      debate:'Different perspectives', related:'Related terms', downloadJson:'Save glossary as JSON',
      sourceOpen:'Open source', inlineGlossaryHint:'Tap a marked term for a short contextual explanation.',
      openFullGlossary:'Open in the full glossary',
      fallbackLanguage:'This entry is not fully translated yet; the English version is shown.',
      prisonerIntro:'Verified public addresses and a private workshop for solidarity letters.',
      prisonerLimited:'A deliberately small, incomplete and editorially reviewed list — not a legal assessment.',
      verified:'Verified', reviewBy:'Review again by', address:'Mailing address', writeLetter:'Write a letter',
      relatedNews:'Related news', noRelated:'No matching article in the local archive yet.', mailRules:'Mail rules',
      localOnly:'Drafts and personal details remain on this device.',
      prisonerPeople:'People', prisonerSources:'Sources', linkedProfiles:'Linked profiles', noLinkedProfiles:'No directly linked profiles.',
      sourceChecked:'Checked on', profilesTotal:'profiles', profilesEurope:'in Europe',
      developmentIntro:'Compare different reports about the same event directly.',
      developmentGuard:'A shared location or broad term is not enough. Only independent sources with several strong content signals are linked.', whyLinked:'Classification',
      confidence:'Grouping confidence', storySources:'Sources', storyArticles:'Reports', storyTimeline:'Timeline',
      assignmentStrength:'Grouping confidence', strengthHigh:'high', strengthVeryHigh:'very high',
      strengthExplanation:'Similar titles, names, and distinctive wording are decisive. Timing, region, and topic are supporting signals. The value does not rate a source or the truth of a report.',
      sourceMix:'Source breadth', mixBroad:'broad', mixVaried:'varied', mixLimited:'limited',
      mixSources:'Independent sources', mixOrigins:'Source origins', mixLanguages:'Original languages', mixUnknown:'Sources without origin data',
      mixExplanation:'Source breadth shows how many independent sources, source origins, and original languages are represented. Article texts are never blended.',
      compareReports:'Compare reports', compareIntro:'Each report remains separate so emphasis, language, and source origin can be compared directly.',
      comparisonShared:'In common', comparisonDifferent:'Differences', comparisonSameEvent:'The same event',
      openReport:'Open report', limitedPerspective:'Source breadth is still limited. Further independent reporting may add context.',
      noDevelopments:'There is currently no sufficiently reliable multi-source development.',
      watch:'Watch', watching:'Watching', showWatched:'Watched only', showAll:'All developments',
      originEvidence:'Origin evidence', originExplicit:'declared', originInferred:'traceably inferred', registryUpdated:'Registry updated',
      reviewQueue:'Editorial review queue', reviewGrouping:'Report grouping', reviewRecorded:'Reported for review',
      reviewIntro:'Report an unsuitable grouping. The entry remains on this device and can be shared with editors as JSON.',
      reviewReport:'Affected report', reviewWholeCluster:'Whole cluster', reviewReason:'Reason', reviewNote:'Optional note',
      reviewReasonWrongArticle:'Report does not belong in this cluster', reviewReasonDifferentEvent:'Reports describe different events',
      reviewReasonDuplicate:'Source or report is duplicated', reviewReasonClassification:'Region or topic is wrong', reviewReasonOther:'Other reason',
      reviewSubmit:'Add to review queue', reviewSaved:'Review note saved locally.', reviewEmpty:'No open review notes yet.',
      reviewOpen:'open', reviewResolved:'reviewed', reviewResolve:'Mark reviewed', reviewReopen:'Reopen', reviewRemove:'Remove',
      reviewExport:'Export review queue as JSON', reviewClose:'Close', reviewAudit:'Local review log', reviewCreated:'Reported on',
      reviewHistory:'Change history', reviewReported:'Reported', reviewMarkedResolved:'Marked as reviewed', reviewReopened:'Reopened'
    },
    es: {
      backDiscover:'Volver a Explorar', underConstruction:'En desarrollo', eventUpcoming:'Próximos eventos', eventArchive:'Archivo',
      eventSearch:'Buscar eventos', eventCountry:'País', eventAllCountries:'Todos los países', eventRepeat:'fechas agrupadas', when:'Cuándo', where:'Dónde', noEvents:'No se encontraron eventos.',
      glossaryIntro:'Explicaciones breves de términos de movimientos anarquistas, antiautoritarios y revolucionarios.', glossaryNote:'Sin pretensión de totalidad: las palabras cambian y se debaten.', glossarySearch:'Buscar términos', glossarySources:'Fuentes', meaning:'En breve', practice:'En la práctica', debate:'Perspectivas diferentes', related:'Términos relacionados', downloadJson:'Guardar glosario como JSON', sourceOpen:'Abrir fuente',
      prisonerIntro:'Direcciones públicas verificadas y taller privado de cartas solidarias.', prisonerLimited:'Lista pequeña e incompleta; no es una valoración jurídica.', verified:'Verificado', reviewBy:'Revisar antes de', address:'Dirección postal', writeLetter:'Escribir una carta', relatedNews:'Noticias relacionadas', noRelated:'Aún no hay noticias relacionadas.', mailRules:'Normas de envío', localOnly:'Los borradores permanecen en este dispositivo.', prisonerPeople:'Personas', prisonerSources:'Fuentes', linkedProfiles:'Perfiles vinculados', noLinkedProfiles:'No hay perfiles vinculados directamente.', sourceChecked:'Comprobado el', profilesTotal:'perfiles', profilesEurope:'en Europa',
      developmentIntro:'Compara directamente distintos informes sobre el mismo hecho.', developmentGuard:'Un lugar o término general compartido no basta. Solo se conectan fuentes independientes con varias señales sólidas.', whyLinked:'Clasificación', confidence:'Confianza de agrupación', storySources:'Fuentes', storyArticles:'Informes', storyTimeline:'Cronología', noDevelopments:'No hay desarrollos suficientemente seguros.', watch:'Seguir', watching:'Siguiendo', showWatched:'Solo seguidos', showAll:'Todos',
      assignmentStrength:'Confianza de agrupación', strengthHigh:'alta', strengthVeryHigh:'muy alta', strengthExplanation:'El porcentaje solo describe cuánto indican los títulos, las personas o lugares nombrados y las formulaciones distintivas que se trata del mismo hecho. No evalúa la veracidad ni la calidad de una fuente.', sourceMix:'Amplitud de fuentes', mixBroad:'amplia', mixVaried:'variada', mixLimited:'limitada', mixSources:'Fuentes independientes', mixOrigins:'Origen de las fuentes', mixLanguages:'Idiomas originales', mixUnknown:'Fuentes sin origen indicado', mixExplanation:'La amplitud muestra cuántas fuentes independientes, procedencias e idiomas originales están representados. Los textos de los artículos no se mezclan.', compareReports:'Comparar informes', compareIntro:'Cada informe permanece separado para comparar directamente el enfoque, el idioma y el origen.', comparisonShared:'En común', comparisonDifferent:'Diferencias', comparisonSameEvent:'El mismo hecho', openReport:'Abrir informe', limitedPerspective:'La amplitud de fuentes sigue siendo limitada. Otros informes independientes pueden aportar contexto.'
    },
    fr: {
      backDiscover:'Retour à Découvrir', underConstruction:'En construction', eventUpcoming:'Événements à venir', eventArchive:'Archives', eventSearch:'Rechercher des événements', eventCountry:'Pays', eventAllCountries:'Tous les pays', eventRepeat:'dates regroupées', when:'Quand', where:'Où', noEvents:'Aucun événement trouvé.',
      glossaryIntro:'Explications brèves de termes des mouvements anarchistes, anti-autoritaires et révolutionnaires.', glossaryNote:'Sans prétention d’exhaustivité : les mots évoluent et sont débattus.', glossarySearch:'Rechercher des termes', glossarySources:'Sources', meaning:'En bref', practice:'En pratique', debate:'Perspectives différentes', related:'Termes liés', downloadJson:'Enregistrer en JSON', sourceOpen:'Ouvrir la source',
      prisonerIntro:'Adresses publiques vérifiées et atelier privé de lettres solidaires.', prisonerLimited:'Liste volontairement petite et incomplète ; pas une évaluation juridique.', verified:'Vérifié', reviewBy:'Réviser avant le', address:'Adresse postale', writeLetter:'Écrire une lettre', relatedNews:'Actualités liées', noRelated:'Aucun article lié pour le moment.', mailRules:'Règles postales', localOnly:'Les brouillons restent sur cet appareil.', prisonerPeople:'Personnes', prisonerSources:'Sources', linkedProfiles:'Profils liés', noLinkedProfiles:'Aucun profil directement lié.', sourceChecked:'Vérifié le', profilesTotal:'profils', profilesEurope:'en Europe',
      developmentIntro:'Comparez directement différents rapports sur le même événement.', developmentGuard:'Un lieu ou un terme général commun ne suffit pas. Seules des sources indépendantes présentant plusieurs signaux forts sont reliées.', whyLinked:'Classement', confidence:'Fiabilité du regroupement', storySources:'Sources', storyArticles:'Rapports', storyTimeline:'Chronologie', noDevelopments:'Aucune évolution multisource assez fiable.', watch:'Suivre', watching:'Suivi', showWatched:'Suivis seulement', showAll:'Toutes',
      assignmentStrength:'Fiabilité du regroupement', strengthHigh:'élevée', strengthVeryHigh:'très élevée', strengthExplanation:'Le pourcentage indique seulement dans quelle mesure les titres, les personnes ou lieux nommés et les formulations distinctives renvoient au même événement. Il n’évalue ni la véracité ni la qualité d’une source.', sourceMix:'Diversité des sources', mixBroad:'large', mixVaried:'variée', mixLimited:'limitée', mixSources:'Sources indépendantes', mixOrigins:'Origine des sources', mixLanguages:'Langues originales', mixUnknown:'Sources sans origine indiquée', mixExplanation:'La diversité indique combien de sources indépendantes, d’origines et de langues originales sont représentées. Les textes ne sont jamais mélangés.', compareReports:'Comparer les rapports', compareIntro:'Chaque rapport reste séparé afin de comparer directement son angle, sa langue et l’origine de sa source.', comparisonShared:'En commun', comparisonDifferent:'Différences', comparisonSameEvent:'Le même événement', openReport:'Ouvrir le rapport', limitedPerspective:'La diversité des sources reste limitée. D’autres rapports indépendants peuvent apporter du contexte.'
    },
    it: {
      backDiscover:'Torna a Scopri', underConstruction:'In costruzione', eventUpcoming:'Prossimi eventi', eventArchive:'Archivio', eventSearch:'Cerca eventi', eventCountry:'Paese', eventAllCountries:'Tutti i paesi', eventRepeat:'date raggruppate', when:'Quando', where:'Dove', noEvents:'Nessun evento trovato.',
      glossaryIntro:'Brevi spiegazioni di termini dei movimenti anarchici, antiautoritari e rivoluzionari.', glossaryNote:'Senza pretesa di completezza: le parole cambiano e sono controverse.', glossarySearch:'Cerca termini', glossarySources:'Fonti', meaning:'In breve', practice:'Nella pratica', debate:'Prospettive diverse', related:'Termini collegati', downloadJson:'Salva come JSON', sourceOpen:'Apri fonte',
      prisonerIntro:'Indirizzi pubblici verificati e laboratorio privato per lettere solidali.', prisonerLimited:'Elenco volutamente piccolo e incompleto; non è una valutazione legale.', verified:'Verificato', reviewBy:'Ricontrollare entro', address:'Indirizzo postale', writeLetter:'Scrivi una lettera', relatedNews:'Notizie correlate', noRelated:'Nessuna notizia correlata.', mailRules:'Regole postali', localOnly:'Le bozze restano su questo dispositivo.', prisonerPeople:'Persone', prisonerSources:'Fonti', linkedProfiles:'Profili collegati', noLinkedProfiles:'Nessun profilo collegato direttamente.', sourceChecked:'Verificato il', profilesTotal:'profili', profilesEurope:'in Europa',
      developmentIntro:'Confronta direttamente diversi resoconti dello stesso evento.', developmentGuard:'Un luogo o termine generale in comune non basta. Si collegano solo fonti indipendenti con più segnali forti.', whyLinked:'Classificazione', confidence:'Affidabilità del raggruppamento', storySources:'Fonti', storyArticles:'Resoconti', storyTimeline:'Cronologia', noDevelopments:'Nessuno sviluppo multisorgente abbastanza affidabile.', watch:'Segui', watching:'Seguito', showWatched:'Solo seguiti', showAll:'Tutti',
      assignmentStrength:'Affidabilità del raggruppamento', strengthHigh:'alta', strengthVeryHigh:'molto alta', strengthExplanation:'La percentuale descrive soltanto quanto titoli, persone o luoghi citati e formulazioni distintive indicano lo stesso evento. Non valuta la veridicità né la qualità di una fonte.', sourceMix:'Ampiezza delle fonti', mixBroad:'ampia', mixVaried:'varia', mixLimited:'limitata', mixSources:'Fonti indipendenti', mixOrigins:'Origine delle fonti', mixLanguages:'Lingue originali', mixUnknown:'Fonti senza origine indicata', mixExplanation:'L’ampiezza mostra quante fonti indipendenti, origini e lingue originali sono rappresentate. I testi degli articoli non vengono mescolati.', compareReports:'Confronta i resoconti', compareIntro:'Ogni resoconto resta separato per confrontare direttamente taglio, lingua e origine della fonte.', comparisonShared:'In comune', comparisonDifferent:'Differenze', comparisonSameEvent:'Lo stesso evento', openReport:'Apri resoconto', limitedPerspective:'L’ampiezza delle fonti è ancora limitata. Altri resoconti indipendenti possono aggiungere contesto.'
    },
    pt: {
      backDiscover:'Voltar a Explorar', underConstruction:'Em construção', eventUpcoming:'Próximos eventos', eventArchive:'Arquivo', eventSearch:'Pesquisar eventos', eventCountry:'País', eventAllCountries:'Todos os países', eventRepeat:'datas agrupadas', when:'Quando', where:'Onde', noEvents:'Nenhum evento encontrado.',
      glossaryIntro:'Explicações breves de termos de movimentos anarquistas, antiautoritários e revolucionários.', glossaryNote:'Sem pretensão de totalidade: as palavras mudam e são disputadas.', glossarySearch:'Pesquisar termos', glossarySources:'Fontes', meaning:'Em resumo', practice:'Na prática', debate:'Perspetivas diferentes', related:'Termos relacionados', downloadJson:'Guardar como JSON', sourceOpen:'Abrir fonte',
      prisonerIntro:'Endereços públicos verificados e oficina privada de cartas solidárias.', prisonerLimited:'Lista deliberadamente pequena e incompleta; não é avaliação jurídica.', verified:'Verificado', reviewBy:'Rever até', address:'Endereço postal', writeLetter:'Escrever carta', relatedNews:'Notícias relacionadas', noRelated:'Ainda não há notícia relacionada.', mailRules:'Regras postais', localOnly:'Os rascunhos ficam neste dispositivo.', prisonerPeople:'Pessoas', prisonerSources:'Fontes', linkedProfiles:'Perfis associados', noLinkedProfiles:'Nenhum perfil diretamente associado.', sourceChecked:'Verificado em', profilesTotal:'perfis', profilesEurope:'na Europa',
      developmentIntro:'Compara diretamente diferentes relatos do mesmo acontecimento.', developmentGuard:'Um local ou termo geral em comum não basta. Só são ligadas fontes independentes com vários sinais fortes.', whyLinked:'Classificação', confidence:'Confiança do agrupamento', storySources:'Fontes', storyArticles:'Relatos', storyTimeline:'Cronologia', noDevelopments:'Nenhum desenvolvimento multisource suficientemente fiável.', watch:'Observar', watching:'Observado', showWatched:'Só observados', showAll:'Todos',
      assignmentStrength:'Confiança do agrupamento', strengthHigh:'alta', strengthVeryHigh:'muito alta', strengthExplanation:'A percentagem descreve apenas até que ponto os títulos, pessoas ou locais mencionados e formulações distintivas indicam o mesmo acontecimento. Não avalia a veracidade nem a qualidade de uma fonte.', sourceMix:'Amplitude das fontes', mixBroad:'ampla', mixVaried:'variada', mixLimited:'limitada', mixSources:'Fontes independentes', mixOrigins:'Origem das fontes', mixLanguages:'Línguas originais', mixUnknown:'Fontes sem origem indicada', mixExplanation:'A amplitude mostra quantas fontes independentes, origens e línguas originais estão representadas. Os textos dos artigos não são misturados.', compareReports:'Comparar relatos', compareIntro:'Cada relato permanece separado para comparar diretamente o enfoque, a língua e a origem.', comparisonShared:'Em comum', comparisonDifferent:'Diferenças', comparisonSameEvent:'O mesmo acontecimento', openReport:'Abrir relato', limitedPerspective:'A amplitude das fontes ainda é limitada. Outros relatos independentes podem acrescentar contexto.'
    },
    ru: {
      backDiscover:'Назад к обзору', underConstruction:'В разработке', eventUpcoming:'Предстоящие события', eventArchive:'Архив', eventSearch:'Поиск событий', eventCountry:'Страна', eventAllCountries:'Все страны', eventRepeat:'объединённых дат', when:'Когда', where:'Где', noEvents:'События не найдены.',
      glossaryIntro:'Краткие объяснения терминов анархистских, антиавторитарных и революционных движений.', glossaryNote:'Без претензии на полноту: слова меняются и оспариваются.', glossarySearch:'Поиск терминов', glossarySources:'Источники', meaning:'Кратко', practice:'На практике', debate:'Разные взгляды', related:'Связанные термины', downloadJson:'Сохранить JSON', sourceOpen:'Открыть источник',
      prisonerIntro:'Проверенные публичные адреса и приватная мастерская писем солидарности.', prisonerLimited:'Намеренно небольшой и неполный список; не юридическая оценка.', verified:'Проверено', reviewBy:'Проверить до', address:'Почтовый адрес', writeLetter:'Написать письмо', relatedNews:'Связанные новости', noRelated:'Связанных материалов пока нет.', mailRules:'Почтовые правила', localOnly:'Черновики остаются на устройстве.', prisonerPeople:'Люди', prisonerSources:'Источники', linkedProfiles:'Связанные профили', noLinkedProfiles:'Нет напрямую связанных профилей.', sourceChecked:'Проверено', profilesTotal:'профилей', profilesEurope:'в Европе',
      developmentIntro:'Сравнивайте разные сообщения об одном событии напрямую.', developmentGuard:'Общего места или широкого термина недостаточно. Связываются только независимые источники с несколькими сильными признаками.', whyLinked:'Классификация', confidence:'Надёжность группировки', storySources:'Источники', storyArticles:'Материалы', storyTimeline:'Хронология', noDevelopments:'Нет достаточно надёжного развития из нескольких источников.', watch:'Отслеживать', watching:'Отслеживается', showWatched:'Только отслеживаемые', showAll:'Все',
      assignmentStrength:'Надёжность группировки', strengthHigh:'высокая', strengthVeryHigh:'очень высокая', strengthExplanation:'Процент показывает только, насколько заголовки, названные люди или места и характерные формулировки указывают на одно событие. Он не оценивает правдивость или качество источника.', sourceMix:'Широта источников', mixBroad:'широкая', mixVaried:'разнообразная', mixLimited:'ограниченная', mixSources:'Независимые источники', mixOrigins:'Происхождение источников', mixLanguages:'Языки оригиналов', mixUnknown:'Источники без данных о происхождении', mixExplanation:'Широта показывает число независимых источников, регионов происхождения и языков оригинала. Тексты статей не смешиваются.', compareReports:'Сравнить материалы', compareIntro:'Каждый материал остаётся отдельным, чтобы можно было сравнить акцент, язык и происхождение источника.', comparisonShared:'Общее', comparisonDifferent:'Различия', comparisonSameEvent:'Одно событие', openReport:'Открыть материал', limitedPerspective:'Широта источников пока ограничена. Дополнительные независимые материалы могут расширить контекст.'
    },
    el: {
      backDiscover:'Πίσω στην Ανακάλυψη', underConstruction:'Υπό ανάπτυξη', eventUpcoming:'Επερχόμενες εκδηλώσεις', eventArchive:'Αρχείο', eventSearch:'Αναζήτηση εκδηλώσεων', eventCountry:'Χώρα', eventAllCountries:'Όλες οι χώρες', eventRepeat:'ομαδοποιημένες ημερομηνίες', when:'Πότε', where:'Πού', noEvents:'Δεν βρέθηκαν εκδηλώσεις.',
      glossaryIntro:'Σύντομες εξηγήσεις όρων αναρχικών, αντιεξουσιαστικών και επαναστατικών κινημάτων.', glossaryNote:'Χωρίς αξίωση πληρότητας: οι λέξεις αλλάζουν και αμφισβητούνται.', glossarySearch:'Αναζήτηση όρων', glossarySources:'Πηγές', meaning:'Συνοπτικά', practice:'Στην πράξη', debate:'Διαφορετικές οπτικές', related:'Σχετικοί όροι', downloadJson:'Αποθήκευση JSON', sourceOpen:'Άνοιγμα πηγής',
      prisonerIntro:'Επαληθευμένες δημόσιες διευθύνσεις και ιδιωτικό εργαστήριο επιστολών.', prisonerLimited:'Σκόπιμα μικρός και ελλιπής κατάλογος· όχι νομική αξιολόγηση.', verified:'Επαληθεύτηκε', reviewBy:'Επανέλεγχος έως', address:'Ταχυδρομική διεύθυνση', writeLetter:'Γράψτε επιστολή', relatedNews:'Σχετικές ειδήσεις', noRelated:'Δεν υπάρχει σχετικό άρθρο ακόμη.', mailRules:'Κανόνες αλληλογραφίας', localOnly:'Τα προσχέδια μένουν στη συσκευή.', prisonerPeople:'Πρόσωπα', prisonerSources:'Πηγές', linkedProfiles:'Συνδεδεμένα προφίλ', noLinkedProfiles:'Δεν υπάρχουν άμεσα συνδεδεμένα προφίλ.', sourceChecked:'Ελέγχθηκε', profilesTotal:'προφίλ', profilesEurope:'στην Ευρώπη',
      developmentIntro:'Σύγκρινε απευθείας διαφορετικές αναφορές για το ίδιο γεγονός.', developmentGuard:'Ένας κοινός τόπος ή γενικός όρος δεν αρκεί. Συνδέονται μόνο ανεξάρτητες πηγές με πολλά ισχυρά στοιχεία.', whyLinked:'Ταξινόμηση', confidence:'Βεβαιότητα ομαδοποίησης', storySources:'Πηγές', storyArticles:'Αναφορές', storyTimeline:'Χρονολόγιο', noDevelopments:'Δεν υπάρχει αρκετά αξιόπιστη εξέλιξη πολλών πηγών.', watch:'Παρακολούθηση', watching:'Παρακολουθείται', showWatched:'Μόνο παρακολουθούμενα', showAll:'Όλα',
      assignmentStrength:'Βεβαιότητα ομαδοποίησης', strengthHigh:'υψηλή', strengthVeryHigh:'πολύ υψηλή', strengthExplanation:'Το ποσοστό περιγράφει μόνο πόσο οι τίτλοι, τα κατονομαζόμενα πρόσωπα ή μέρη και οι χαρακτηριστικές διατυπώσεις δείχνουν το ίδιο γεγονός. Δεν αξιολογεί την αλήθεια ή την ποιότητα μιας πηγής.', sourceMix:'Εύρος πηγών', mixBroad:'ευρύ', mixVaried:'ποικίλο', mixLimited:'περιορισμένο', mixSources:'Ανεξάρτητες πηγές', mixOrigins:'Προέλευση πηγών', mixLanguages:'Γλώσσες πρωτοτύπου', mixUnknown:'Πηγές χωρίς στοιχεία προέλευσης', mixExplanation:'Το εύρος δείχνει πόσες ανεξάρτητες πηγές, προελεύσεις και γλώσσες πρωτοτύπου εκπροσωπούνται. Τα κείμενα δεν αναμειγνύονται.', compareReports:'Σύγκριση αναφορών', compareIntro:'Κάθε αναφορά παραμένει χωριστή, ώστε να συγκρίνονται άμεσα η έμφαση, η γλώσσα και η προέλευση.', comparisonShared:'Κοινά', comparisonDifferent:'Διαφορές', comparisonSameEvent:'Το ίδιο γεγονός', openReport:'Άνοιγμα αναφοράς', limitedPerspective:'Το εύρος πηγών παραμένει περιορισμένο. Πρόσθετες ανεξάρτητες αναφορές μπορούν να προσθέσουν πλαίσιο.'
    },
    tr: {
      backDiscover:'Keşfet’e dön', underConstruction:'Yapım aşamasında', eventUpcoming:'Yaklaşan etkinlikler', eventArchive:'Arşiv', eventSearch:'Etkinlik ara', eventCountry:'Ülke', eventAllCountries:'Tüm ülkeler', eventRepeat:'birleştirilmiş tarihler', when:'Ne zaman', where:'Nerede', noEvents:'Etkinlik bulunamadı.',
      glossaryIntro:'Anarşist, otorite karşıtı ve devrimci hareket kavramlarının kısa açıklamaları.', glossaryNote:'Eksiksizlik iddiası yoktur: sözcükler değişir ve tartışılır.', glossarySearch:'Kavram ara', glossarySources:'Kaynaklar', meaning:'Kısaca', practice:'Pratikte', debate:'Farklı bakışlar', related:'İlgili kavramlar', downloadJson:'JSON kaydet', sourceOpen:'Kaynağı aç',
      prisonerIntro:'Doğrulanmış kamusal adresler ve özel dayanışma mektubu atölyesi.', prisonerLimited:'Bilinçli olarak küçük ve eksik liste; hukuki değerlendirme değildir.', verified:'Doğrulandı', reviewBy:'Yeniden kontrol', address:'Posta adresi', writeLetter:'Mektup yaz', relatedNews:'İlgili haberler', noRelated:'Henüz ilgili haber yok.', mailRules:'Posta kuralları', localOnly:'Taslaklar bu cihazda kalır.', prisonerPeople:'Kişiler', prisonerSources:'Kaynaklar', linkedProfiles:'Bağlı profiller', noLinkedProfiles:'Doğrudan bağlı profil yok.', sourceChecked:'Kontrol tarihi', profilesTotal:'profil', profilesEurope:'Avrupa’da',
      developmentIntro:'Aynı olayla ilgili farklı haberleri doğrudan karşılaştır.', developmentGuard:'Ortak bir yer veya genel terim yeterli değildir. Yalnızca birden fazla güçlü içerik sinyali olan bağımsız kaynaklar bağlanır.', whyLinked:'Sınıflandırma', confidence:'Gruplama güveni', storySources:'Kaynaklar', storyArticles:'Haberler', storyTimeline:'Zaman çizelgesi', noDevelopments:'Yeterince güvenilir çok kaynaklı gelişme yok.', watch:'İzle', watching:'İzleniyor', showWatched:'Yalnız izlenenler', showAll:'Tümü',
      assignmentStrength:'Gruplama güveni', strengthHigh:'yüksek', strengthVeryHigh:'çok yüksek', strengthExplanation:'Yüzde yalnızca başlıkların, adı geçen kişi veya yerlerin ve ayırt edici ifadelerin aynı olaya ne ölçüde işaret ettiğini açıklar. Bir kaynağın doğruluğunu veya kalitesini değerlendirmez.', sourceMix:'Kaynak genişliği', mixBroad:'geniş', mixVaried:'çeşitli', mixLimited:'sınırlı', mixSources:'Bağımsız kaynaklar', mixOrigins:'Kaynak kökenleri', mixLanguages:'Özgün diller', mixUnknown:'Köken bilgisi olmayan kaynaklar', mixExplanation:'Kaynak genişliği, kaç bağımsız kaynak, köken ve özgün dilin temsil edildiğini gösterir. Makale metinleri birbirine karıştırılmaz.', compareReports:'Haberleri karşılaştır', compareIntro:'Vurgu, dil ve kaynak kökeni doğrudan karşılaştırılabilsin diye her haber ayrı kalır.', comparisonShared:'Ortak', comparisonDifferent:'Farklar', comparisonSameEvent:'Aynı olay', openReport:'Haberi aç', limitedPerspective:'Kaynak genişliği şimdilik sınırlı. Ek bağımsız haberler bağlamı genişletebilir.'
    }
  };

  const MEDIA_COPY = {
    de: {
      current:'Neue Videos', information:'Hintergrund', politics:'Politik', society:'Gesellschaft', culture:'Kultur',
      allCategories:'Alle Kategorien', allRegions:'Alle Regionen', mediaSearch:'Medien durchsuchen',
      privacyMedia:'Datenschutz: Nichts startet automatisch. Externe Medien werden erst nach deiner Auswahl geladen.',
      playEpisode:'Folge abspielen', openEpisode:'Original öffnen', openChannel:'Kanal öffnen',
      noMedia:'Keine passenden Medien gefunden.', noGenerated:'Noch keine erzeugten Podcasts gespeichert.',
      generatedNotice:'Erzeugte Podcasts bleiben höchstens 30 Tage gespeichert.', station:'Sender', listenLive:'Live hören',
      streamFallback:'Kein geprüfter Browser-Stream. Öffne die Senderseite.', episodes:'Folgen', stations:'Sender',
      currentVideosIntro:'Politisch zugeordnete Video-Beiträge aus den Nachrichtenfeeds. Allgemeine Plattform-Uploads werden ausgefiltert.', informationVideosIntro:'Dauerhaft hilfreiche Erklärungen, Dokumentationen und Kanäle aus der kuratierten Mediensammlung.',
      videoLead:'Im Fokus', moreVideos:'Weitere neue Videos', filterVideos:'Videos filtern',
      openVideo:'Video öffnen', openArticle:'Beitrag öffnen'
    },
    en: {
      current:'New videos', information:'Background', politics:'Politics', society:'Society', culture:'Culture',
      allCategories:'All categories', allRegions:'All regions', mediaSearch:'Search media',
      privacyMedia:'Privacy: nothing starts automatically. External media load only after you choose them.',
      playEpisode:'Play episode', openEpisode:'Open original', openChannel:'Open channel',
      noMedia:'No matching media found.', noGenerated:'No generated podcasts are stored yet.',
      generatedNotice:'Generated podcasts are stored for no longer than 30 days.', station:'Station', listenLive:'Listen live',
      streamFallback:'No verified browser stream. Open the station website.', episodes:'Episodes', stations:'Stations',
      currentVideosIntro:'Politically classified video posts from the news feeds. General platform uploads are filtered out.', informationVideosIntro:'Durable explainers, documentaries and channels from the curated media collection.',
      videoLead:'In focus', moreVideos:'More new videos', filterVideos:'Filter videos',
      openVideo:'Open video', openArticle:'Open article'
    },
    es: {
      current:'Vídeos nuevos', information:'Contexto', politics:'Política', society:'Sociedad', culture:'Cultura',
      allCategories:'Todas las categorías', allRegions:'Todas las regiones', mediaSearch:'Buscar medios',
      privacyMedia:'Privacidad: nada se inicia automáticamente. Los medios externos se cargan solo tras elegirlos.',
      playEpisode:'Reproducir episodio', openEpisode:'Abrir original', openChannel:'Abrir canal',
      noMedia:'No se encontraron medios.', noGenerated:'Aún no hay pódcasts generados guardados.',
      generatedNotice:'Los pódcasts generados se guardan como máximo 30 días.', station:'Emisora', listenLive:'Escuchar en directo',
      streamFallback:'No hay un flujo web verificado. Abre la web de la emisora.', episodes:'Episodios', stations:'Emisoras',
      currentVideosIntro:'Vídeos clasificados políticamente de los canales de noticias. Se excluyen las subidas generales de las plataformas.', informationVideosIntro:'Explicaciones, documentales y canales duraderos de la selección editorial.', videoLead:'En foco', moreVideos:'Más vídeos nuevos', filterVideos:'Filtrar vídeos', openVideo:'Abrir vídeo', openArticle:'Abrir artículo'
    },
    fr: {
      current:'Nouvelles vidéos', information:'Contexte', politics:'Politique', society:'Société', culture:'Culture',
      allCategories:'Toutes les catégories', allRegions:'Toutes les régions', mediaSearch:'Rechercher des médias',
      privacyMedia:'Confidentialité : rien ne démarre automatiquement. Les médias externes ne chargent qu’après votre choix.',
      playEpisode:'Lire l’épisode', openEpisode:'Ouvrir l’original', openChannel:'Ouvrir la chaîne',
      noMedia:'Aucun média correspondant.', noGenerated:'Aucun podcast généré n’est encore enregistré.',
      generatedNotice:'Les podcasts générés sont conservés au maximum 30 jours.', station:'Station', listenLive:'Écouter en direct',
      streamFallback:'Aucun flux web vérifié. Ouvrez le site de la station.', episodes:'Épisodes', stations:'Stations',
      currentVideosIntro:'Vidéos classées politiquement issues des flux d’actualité. Les téléversements généraux des plateformes sont écartés.', informationVideosIntro:'Explications, documentaires et chaînes durables de la sélection éditoriale.', videoLead:'À la une', moreVideos:'Autres nouvelles vidéos', filterVideos:'Filtrer les vidéos', openVideo:'Ouvrir la vidéo', openArticle:'Ouvrir l’article'
    },
    it: {
      current:'Nuovi video', information:'Contesto', politics:'Politica', society:'Società', culture:'Cultura',
      allCategories:'Tutte le categorie', allRegions:'Tutte le regioni', mediaSearch:'Cerca media',
      privacyMedia:'Privacy: nulla parte automaticamente. I media esterni si caricano solo dopo la scelta.',
      playEpisode:'Riproduci episodio', openEpisode:'Apri originale', openChannel:'Apri canale',
      noMedia:'Nessun media corrispondente.', noGenerated:'Nessun podcast generato è ancora salvato.',
      generatedNotice:'I podcast generati restano salvati al massimo 30 giorni.', station:'Emittente', listenLive:'Ascolta dal vivo',
      streamFallback:'Nessuno stream web verificato. Apri il sito dell’emittente.', episodes:'Episodi', stations:'Emittenti',
      currentVideosIntro:'Video classificati politicamente dai feed di notizie. I caricamenti generici delle piattaforme vengono esclusi.', informationVideosIntro:'Spiegazioni, documentari e canali duraturi della selezione editoriale.', videoLead:'In evidenza', moreVideos:'Altri nuovi video', filterVideos:'Filtra i video', openVideo:'Apri video', openArticle:'Apri articolo'
    },
    pt: {
      current:'Novos vídeos', information:'Contexto', politics:'Política', society:'Sociedade', culture:'Cultura',
      allCategories:'Todas as categorias', allRegions:'Todas as regiões', mediaSearch:'Pesquisar media',
      privacyMedia:'Privacidade: nada começa automaticamente. Os media externos só carregam após a escolha.',
      playEpisode:'Reproduzir episódio', openEpisode:'Abrir original', openChannel:'Abrir canal',
      noMedia:'Nenhum media correspondente.', noGenerated:'Ainda não há podcasts gerados guardados.',
      generatedNotice:'Os podcasts gerados ficam guardados no máximo 30 dias.', station:'Estação', listenLive:'Ouvir em direto',
      streamFallback:'Sem transmissão web verificada. Abre o site da estação.', episodes:'Episódios', stations:'Estações',
      currentVideosIntro:'Vídeos classificados politicamente dos feeds de notícias. Publicações gerais das plataformas são excluídas.', informationVideosIntro:'Explicações, documentários e canais duradouros da seleção editorial.', videoLead:'Em destaque', moreVideos:'Mais vídeos novos', filterVideos:'Filtrar vídeos', openVideo:'Abrir vídeo', openArticle:'Abrir artigo'
    },
    ru: {
      current:'Новые видео', information:'Контекст', politics:'Политика', society:'Общество', culture:'Культура',
      allCategories:'Все категории', allRegions:'Все регионы', mediaSearch:'Поиск медиа',
      privacyMedia:'Конфиденциальность: ничего не запускается автоматически. Внешние медиа загружаются только после выбора.',
      playEpisode:'Воспроизвести', openEpisode:'Открыть оригинал', openChannel:'Открыть канал',
      noMedia:'Подходящих медиа нет.', noGenerated:'Созданные подкасты пока не сохранены.',
      generatedNotice:'Созданные подкасты хранятся не более 30 дней.', station:'Станция', listenLive:'Слушать эфир',
      streamFallback:'Нет проверенного веб-потока. Откройте сайт станции.', episodes:'Выпуски', stations:'Станции',
      currentVideosIntro:'Политически классифицированные видео из новостных лент. Общие загрузки платформ отфильтровываются.', informationVideosIntro:'Полезные объяснения, документальные материалы и каналы из редакционной подборки.', videoLead:'В фокусе', moreVideos:'Другие новые видео', filterVideos:'Фильтр видео', openVideo:'Открыть видео', openArticle:'Открыть статью'
    },
    el: {
      current:'Νέα βίντεο', information:'Υπόβαθρο', politics:'Πολιτική', society:'Κοινωνία', culture:'Πολιτισμός',
      allCategories:'Όλες οι κατηγορίες', allRegions:'Όλες οι περιοχές', mediaSearch:'Αναζήτηση πολυμέσων',
      privacyMedia:'Απόρρητο: τίποτα δεν ξεκινά αυτόματα. Τα εξωτερικά μέσα φορτώνουν μόνο μετά την επιλογή.',
      playEpisode:'Αναπαραγωγή', openEpisode:'Άνοιγμα πρωτοτύπου', openChannel:'Άνοιγμα καναλιού',
      noMedia:'Δεν βρέθηκαν πολυμέσα.', noGenerated:'Δεν υπάρχουν ακόμη αποθηκευμένα podcast.',
      generatedNotice:'Τα δημιουργημένα podcast διατηρούνται έως 30 ημέρες.', station:'Σταθμός', listenLive:'Ζωντανή ακρόαση',
      streamFallback:'Δεν υπάρχει επαληθευμένη ροή. Ανοίξτε τη σελίδα του σταθμού.', episodes:'Επεισόδια', stations:'Σταθμοί',
      currentVideosIntro:'Πολιτικά ταξινομημένα βίντεο από τις ροές ειδήσεων. Οι γενικές αναρτήσεις πλατφορμών φιλτράρονται.', informationVideosIntro:'Διαχρονικές επεξηγήσεις, ντοκιμαντέρ και κανάλια από την επιμελημένη συλλογή.', videoLead:'Στο επίκεντρο', moreVideos:'Περισσότερα νέα βίντεο', filterVideos:'Φιλτράρισμα βίντεο', openVideo:'Άνοιγμα βίντεο', openArticle:'Άνοιγμα άρθρου'
    },
    tr: {
      current:'Yeni videolar', information:'Arka plan', politics:'Siyaset', society:'Toplum', culture:'Kültür',
      allCategories:'Tüm kategoriler', allRegions:'Tüm bölgeler', mediaSearch:'Medya ara',
      privacyMedia:'Gizlilik: hiçbir şey otomatik başlamaz. Harici medya yalnızca seçiminizden sonra yüklenir.',
      playEpisode:'Bölümü oynat', openEpisode:'Orijinali aç', openChannel:'Kanalı aç',
      noMedia:'Uygun medya bulunamadı.', noGenerated:'Henüz oluşturulmuş podcast kaydedilmedi.',
      generatedNotice:'Oluşturulan podcastler en fazla 30 gün saklanır.', station:'İstasyon', listenLive:'Canlı dinle',
      streamFallback:'Doğrulanmış web yayını yok. İstasyon sitesini açın.', episodes:'Bölümler', stations:'İstasyonlar',
      currentVideosIntro:'Haber akışlarından siyasi olarak sınıflandırılmış videolar. Genel platform yüklemeleri filtrelenir.', informationVideosIntro:'Editoryal seçkideki kalıcı açıklamalar, belgeseller ve kanallar.', videoLead:'Öne çıkan', moreVideos:'Diğer yeni videolar', filterVideos:'Videoları filtrele', openVideo:'Videoyu aç', openArticle:'Haberi aç'
    }
  };

  const APP_SHARE_COPY = {
    de: {
      shareApp:'App weiterempfehlen',
      shareAppNote:'Die App darf gerne verbreitet werden – danke für deine Unterstützung.',
      shareAppText:'Ich empfehle dir World Revolution News – unabhängige, mehrsprachige Nachrichten aus Bewegungen und sozialen Kämpfen.'
    },
    en: {
      shareApp:'Recommend the app',
      shareAppNote:'Please feel free to share the app – thank you for your support.',
      shareAppText:'I recommend World Revolution News – independent, multilingual news from movements and social struggles.'
    },
    es: {
      shareApp:'Recomendar la aplicación',
      shareAppNote:'Puedes compartir la aplicación libremente. Gracias por tu apoyo.',
      shareAppText:'Te recomiendo World Revolution News: noticias independientes y multilingües de movimientos y luchas sociales.'
    },
    fr: {
      shareApp:'Recommander l’application',
      shareAppNote:'N’hésitez pas à partager l’application. Merci pour votre soutien.',
      shareAppText:'Je vous recommande World Revolution News : des informations indépendantes et multilingues sur les mouvements et les luttes sociales.'
    },
    it: {
      shareApp:'Consiglia l’app',
      shareAppNote:'Condividi pure l’app. Grazie per il tuo sostegno.',
      shareAppText:'Ti consiglio World Revolution News: notizie indipendenti e multilingue da movimenti e lotte sociali.'
    },
    pt: {
      shareApp:'Recomendar a aplicação',
      shareAppNote:'Podes partilhar a aplicação livremente. Obrigado pelo teu apoio.',
      shareAppText:'Recomendo a World Revolution News: notícias independentes e multilingues de movimentos e lutas sociais.'
    },
    ru: {
      shareApp:'Рекомендовать приложение',
      shareAppNote:'Приложением можно свободно делиться. Спасибо за поддержку.',
      shareAppText:'Рекомендую World Revolution News — независимые многоязычные новости о движениях и социальной борьбе.'
    },
    el: {
      shareApp:'Προτείνετε την εφαρμογή',
      shareAppNote:'Μπορείτε ελεύθερα να μοιραστείτε την εφαρμογή. Ευχαριστούμε για την υποστήριξη.',
      shareAppText:'Σας προτείνω το World Revolution News — ανεξάρτητες, πολύγλωσσες ειδήσεις από κινήματα και κοινωνικούς αγώνες.'
    },
    tr: {
      shareApp:'Uygulamayı öner',
      shareAppNote:'Uygulamayı özgürce paylaşabilirsiniz. Desteğiniz için teşekkür ederiz.',
      shareAppText:'World Revolution News’u öneriyorum: hareketlerden ve toplumsal mücadelelerden bağımsız, çok dilli haberler.'
    }
  };

  const VIDEO_PORTAL_COPY = {
    de: {
      videoPortalTitle:'Videoportal', videoPortalIntro:'Redaktionell ausgewählte Videos – nach Bereich und Quelle durchmischt. Der Player lädt erst nach deinem Klick.',
      videoNew:'Neu', videoReports:'Berichte', videoInterviews:'Interviews', videoDocumentaries:'Dokumentationen', videoEducation:'Bildung & Analyse', videoLive:'Live', videoLater:'Später ansehen',
      videoSearch:'Videos durchsuchen', videoLanguage:'Sprache', videoTopic:'Thema', videoRegion:'Region', videoSource:'Quelle', videoPlatform:'Plattform', videoDuration:'Dauer', videoSort:'Sortierung',
      videoAllLanguages:'Alle Sprachen', videoAllTopics:'Alle Themen', videoAllSources:'Alle Quellen', videoAllPlatforms:'Alle Plattformen', videoAllDurations:'Alle Längen',
      videoDurationShort:'Bis 10 Min.', videoDurationMedium:'10–30 Min.', videoDurationLong:'Über 30 Min.', videoDurationUnknown:'Dauer offen',
      videoSortBalanced:'Ausgewogen', videoSortNewest:'Neueste zuerst', videoSortTitle:'Titel A–Z', videoSortSource:'Quelle A–Z',
      videoPlay:'Video laden', videoClose:'Player schließen', videoOriginal:'Beim Original öffnen', videoSaveLater:'Später ansehen', videoRemoveLater:'Von Später ansehen entfernen',
      videoViewed:'Bereits angesehen', videoDateUnknown:'Datum offen', videoSubtitles:'Untertitel', videoTranscript:'Transkript', videoResults:'Videos',
      videoPlayerPrivacy:'Erst jetzt wird eine Verbindung zur Videoplattform hergestellt.', videoPlayerFallback:'Falls die Wiedergabe nicht funktioniert, öffne das Video direkt bei der Quelle.',
      videoHistoryLocal:'Wiedergabeverlauf und „Später ansehen“ bleiben nur auf diesem Gerät.', videoHistoryClear:'Verlauf löschen', videoLanguageUnknown:'Sprache offen'
    },
    en: {
      videoPortalTitle:'Video portal', videoPortalIntro:'Editorially selected videos, mixed across sections and sources. The player loads only after your click.',
      videoNew:'New', videoReports:'Reports', videoInterviews:'Interviews', videoDocumentaries:'Documentaries', videoEducation:'Education & analysis', videoLive:'Live', videoLater:'Watch later',
      videoSearch:'Search videos', videoLanguage:'Language', videoTopic:'Topic', videoRegion:'Region', videoSource:'Source', videoPlatform:'Platform', videoDuration:'Duration', videoSort:'Sort order',
      videoAllLanguages:'All languages', videoAllTopics:'All topics', videoAllSources:'All sources', videoAllPlatforms:'All platforms', videoAllDurations:'All lengths',
      videoDurationShort:'Up to 10 min', videoDurationMedium:'10–30 min', videoDurationLong:'Over 30 min', videoDurationUnknown:'Duration pending',
      videoSortBalanced:'Balanced', videoSortNewest:'Newest first', videoSortTitle:'Title A–Z', videoSortSource:'Source A–Z',
      videoPlay:'Load video', videoClose:'Close player', videoOriginal:'Open original', videoSaveLater:'Watch later', videoRemoveLater:'Remove from watch later',
      videoViewed:'Already viewed', videoDateUnknown:'Date pending', videoSubtitles:'Subtitles', videoTranscript:'Transcript', videoResults:'Videos',
      videoPlayerPrivacy:'A connection to the video platform is established only now.', videoPlayerFallback:'If playback fails, open the video directly at its source.',
      videoHistoryLocal:'Playback history and “Watch later” remain on this device.', videoHistoryClear:'Clear history', videoLanguageUnknown:'Language pending'
    }
  };
  Object.entries(VIDEO_PORTAL_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));

  const FEEDBACK_STATUS_COPY = {
    de: { offline:'Du bist offline. Deine Nachricht wurde nicht gesendet. Nutze später erneut „Direkt senden“ oder die E-Mail-Alternative.', timeout:'Das Senden dauert zu lange. Bitte versuche es erneut oder nutze die E-Mail-Alternative.' },
    en: { offline:'You are offline. Your message was not sent. Try “Send directly” again later or use the email alternative.', timeout:'Sending is taking too long. Please try again or use the email alternative.' },
    es: { offline:'No tienes conexión. El mensaje no se ha enviado. Inténtalo de nuevo más tarde o usa la alternativa por correo.', timeout:'El envío está tardando demasiado. Inténtalo de nuevo o usa la alternativa por correo.' },
    fr: { offline:'Vous êtes hors ligne. Le message n’a pas été envoyé. Réessayez plus tard ou utilisez l’alternative par e-mail.', timeout:'L’envoi prend trop de temps. Réessayez ou utilisez l’alternative par e-mail.' },
    it: { offline:'Sei offline. Il messaggio non è stato inviato. Riprova più tardi o usa l’alternativa e-mail.', timeout:'L’invio richiede troppo tempo. Riprova o usa l’alternativa e-mail.' },
    pt: { offline:'Estás offline. A mensagem não foi enviada. Tenta novamente mais tarde ou usa a alternativa por e-mail.', timeout:'O envio está a demorar demasiado. Tenta novamente ou usa a alternativa por e-mail.' },
    ru: { offline:'Нет подключения к сети. Сообщение не отправлено. Повторите попытку позже или воспользуйтесь электронной почтой.', timeout:'Отправка занимает слишком много времени. Повторите попытку или воспользуйтесь электронной почтой.' },
    el: { offline:'Είστε εκτός σύνδεσης. Το μήνυμα δεν στάλθηκε. Δοκιμάστε αργότερα ή χρησιμοποιήστε το email.', timeout:'Η αποστολή καθυστερεί πολύ. Δοκιμάστε ξανά ή χρησιμοποιήστε το email.' },
    tr: { offline:'Çevrimdışısınız. Mesaj gönderilmedi. Daha sonra tekrar deneyin veya e-posta seçeneğini kullanın.', timeout:'Gönderim çok uzun sürüyor. Tekrar deneyin veya e-posta seçeneğini kullanın.' }
  };

  const ABOUT_PROJECT_COPY = {
    de: [
      ['Unabhängig und gemeinnützig ausgerichtet', 'World Revolution News arbeitet ohne verpflichtende Konten, personalisierte Werbung oder Einflussnahme durch Parteien, Regierungen und Unternehmen.'],
      ['Redaktionelle Grundsätze', 'Im Mittelpunkt stehen soziale Bewegungen, Arbeitskämpfe, Antifaschismus, Antirassismus, Feminismus, Queerpolitik, Ökologie, Gefangenensolidarität und libertäre Perspektiven.'],
      ['Geprüfte Quellenauswahl', 'Quellen werden nach politischer Einordnung, Aktualität, Transparenz, technischer Zuverlässigkeit und regionaler sowie sprachlicher Vielfalt ausgewählt und regelmäßig überprüft.'],
      ['Transparente Übersetzungen', 'Automatische Übersetzungen und Zusammenfassungen werden als solche kenntlich gemacht. Das Original bleibt erreichbar und Fehler können gemeldet werden.'],
      ['Mitwirken und Rückmeldung geben', 'Über Feedback können Fehler, Korrekturen und neue Quellen vorgeschlagen werden. Rückmeldungen werden datensparsam verarbeitet.'],
      ['Weiterempfehlen und unterstützen', 'Du kannst die App frei weiterempfehlen und das unabhängige Projekt freiwillig unterstützen.']
    ],
    en: [
      ['Independent and public-interest oriented', 'World Revolution News works without mandatory accounts, personalized advertising, or influence from parties, governments, and companies.'],
      ['Editorial principles', 'Coverage focuses on social movements, labor struggles, antifascism, antiracism, feminism, queer politics, ecology, prisoner solidarity, and libertarian perspectives.'],
      ['Reviewed source selection', 'Sources are selected and regularly reviewed for political context, recency, transparency, technical reliability, and regional and linguistic diversity.'],
      ['Transparent translations', 'Automated translations and summaries are clearly identified. The original remains accessible and errors can be reported.'],
      ['Participate and give feedback', 'Feedback can be used to report errors and corrections or suggest new sources. Responses are processed with data minimization.'],
      ['Recommend and support', 'You can freely recommend the app and voluntarily support the independent project.']
    ],
    es: [
      ['Independiente y orientado al interés público', 'World Revolution News funciona sin cuentas obligatorias, publicidad personalizada ni influencia de partidos, gobiernos o empresas.'],
      ['Principios editoriales', 'La cobertura se centra en movimientos sociales, luchas laborales, antifascismo, antirracismo, feminismo, políticas queer, ecología, solidaridad con personas presas y perspectivas libertarias.'],
      ['Selección de fuentes revisada', 'Las fuentes se seleccionan y revisan según su contexto político, actualidad, transparencia, fiabilidad técnica y diversidad regional y lingüística.'],
      ['Traducciones transparentes', 'Las traducciones y los resúmenes automáticos se identifican claramente. El original sigue accesible y se pueden comunicar errores.'],
      ['Participar y enviar comentarios', 'Puedes comunicar errores y correcciones o proponer nuevas fuentes. Los mensajes se procesan reduciendo al mínimo los datos.'],
      ['Recomendar y apoyar', 'Puedes recomendar libremente la aplicación y apoyar voluntariamente el proyecto independiente.']
    ],
    fr: [
      ['Indépendant et tourné vers l’intérêt public', 'World Revolution News fonctionne sans compte obligatoire, publicité personnalisée ni influence de partis, de gouvernements ou d’entreprises.'],
      ['Principes éditoriaux', 'La couverture porte sur les mouvements sociaux, les luttes du travail, l’antifascisme, l’antiracisme, le féminisme, les politiques queer, l’écologie, la solidarité avec les prisonnier·ères et les perspectives libertaires.'],
      ['Sélection de sources vérifiée', 'Les sources sont choisies et réévaluées selon leur contexte politique, leur actualité, leur transparence, leur fiabilité technique et leur diversité régionale et linguistique.'],
      ['Traductions transparentes', 'Les traductions et résumés automatiques sont clairement signalés. L’original reste accessible et les erreurs peuvent être signalées.'],
      ['Participer et donner son avis', 'Vous pouvez signaler des erreurs et corrections ou proposer de nouvelles sources. Les messages sont traités avec un minimum de données.'],
      ['Recommander et soutenir', 'Vous pouvez recommander librement l’application et soutenir volontairement le projet indépendant.']
    ],
    it: [
      ['Indipendente e orientato all’interesse pubblico', 'World Revolution News opera senza account obbligatori, pubblicità personalizzata o influenze di partiti, governi e aziende.'],
      ['Principi editoriali', 'La copertura riguarda movimenti sociali, lotte del lavoro, antifascismo, antirazzismo, femminismo, politiche queer, ecologia, solidarietà con le persone detenute e prospettive libertarie.'],
      ['Selezione verificata delle fonti', 'Le fonti sono selezionate e riesaminate in base al contesto politico, all’attualità, alla trasparenza, all’affidabilità tecnica e alla diversità regionale e linguistica.'],
      ['Traduzioni trasparenti', 'Le traduzioni e i riassunti automatici sono chiaramente indicati. L’originale resta accessibile e gli errori possono essere segnalati.'],
      ['Partecipare e inviare feedback', 'È possibile segnalare errori e correzioni o proporre nuove fonti. I messaggi sono trattati riducendo al minimo i dati.'],
      ['Consigliare e sostenere', 'Puoi consigliare liberamente l’app e sostenere volontariamente il progetto indipendente.']
    ],
    pt: [
      ['Independente e orientado para o interesse público', 'A World Revolution News funciona sem contas obrigatórias, publicidade personalizada ou influência de partidos, governos e empresas.'],
      ['Princípios editoriais', 'A cobertura centra-se em movimentos sociais, lutas laborais, antifascismo, antirracismo, feminismo, políticas queer, ecologia, solidariedade com pessoas presas e perspetivas libertárias.'],
      ['Seleção de fontes verificada', 'As fontes são selecionadas e revistas segundo o contexto político, atualidade, transparência, fiabilidade técnica e diversidade regional e linguística.'],
      ['Traduções transparentes', 'As traduções e os resumos automáticos são identificados claramente. O original permanece acessível e os erros podem ser comunicados.'],
      ['Participar e enviar comentários', 'É possível comunicar erros e correções ou sugerir novas fontes. As mensagens são tratadas com minimização de dados.'],
      ['Recomendar e apoiar', 'Podes recomendar livremente a aplicação e apoiar voluntariamente o projeto independente.']
    ],
    ru: [
      ['Независимость и общественная направленность', 'World Revolution News работает без обязательных аккаунтов, персонализированной рекламы и влияния партий, правительств или компаний.'],
      ['Редакционные принципы', 'В центре внимания — общественные движения, трудовая борьба, антифашизм, антирасизм, феминизм, квир-политика, экология, солидарность с заключёнными и либертарные взгляды.'],
      ['Проверенный выбор источников', 'Источники отбираются и регулярно проверяются с учётом политического контекста, актуальности, прозрачности, технической надёжности, регионального и языкового разнообразия.'],
      ['Прозрачные переводы', 'Автоматические переводы и резюме явно обозначаются. Оригинал остаётся доступным, а об ошибках можно сообщить.'],
      ['Участие и обратная связь', 'Можно сообщить об ошибках и исправлениях или предложить новые источники. Сообщения обрабатываются с минимальным объёмом данных.'],
      ['Рекомендации и поддержка', 'Приложение можно свободно рекомендовать, а независимый проект — добровольно поддержать.']
    ],
    el: [
      ['Ανεξάρτητο και προσανατολισμένο στο δημόσιο συμφέρον', 'Το World Revolution News λειτουργεί χωρίς υποχρεωτικούς λογαριασμούς, εξατομικευμένες διαφημίσεις ή επιρροή από κόμματα, κυβερνήσεις και εταιρείες.'],
      ['Συντακτικές αρχές', 'Η κάλυψη εστιάζει σε κοινωνικά κινήματα, εργατικούς αγώνες, αντιφασισμό, αντιρατσισμό, φεμινισμό, queer πολιτικές, οικολογία, αλληλεγγύη σε κρατούμενους και ελευθεριακές προοπτικές.'],
      ['Ελεγμένη επιλογή πηγών', 'Οι πηγές επιλέγονται και ελέγχονται τακτικά ως προς το πολιτικό πλαίσιο, την επικαιρότητα, τη διαφάνεια, την τεχνική αξιοπιστία και την περιφερειακή και γλωσσική ποικιλία.'],
      ['Διαφανείς μεταφράσεις', 'Οι αυτόματες μεταφράσεις και περιλήψεις επισημαίνονται σαφώς. Το πρωτότυπο παραμένει διαθέσιμο και μπορούν να αναφερθούν λάθη.'],
      ['Συμμετοχή και σχόλια', 'Μπορείτε να αναφέρετε λάθη και διορθώσεις ή να προτείνετε νέες πηγές. Τα μηνύματα υποβάλλονται σε επεξεργασία με ελαχιστοποίηση δεδομένων.'],
      ['Πρόταση και υποστήριξη', 'Μπορείτε να προτείνετε ελεύθερα την εφαρμογή και να στηρίξετε εθελοντικά το ανεξάρτητο έργο.']
    ],
    tr: [
      ['Bağımsız ve kamu yararına odaklı', 'World Revolution News zorunlu hesaplar, kişiselleştirilmiş reklamlar veya partilerin, hükûmetlerin ve şirketlerin etkisi olmadan çalışır.'],
      ['Editoryal ilkeler', 'Haberler toplumsal hareketlere, emek mücadelelerine, antifaşizme, ırkçılık karşıtlığına, feminizme, queer politikalara, ekolojiye, mahpus dayanışmasına ve özgürlükçü perspektiflere odaklanır.'],
      ['Denetlenmiş kaynak seçimi', 'Kaynaklar siyasi bağlam, güncellik, şeffaflık, teknik güvenilirlik ile bölgesel ve dilsel çeşitliliğe göre seçilir ve düzenli olarak incelenir.'],
      ['Şeffaf çeviriler', 'Otomatik çeviriler ve özetler açıkça belirtilir. Özgün metne erişim korunur ve hatalar bildirilebilir.'],
      ['Katılım ve geri bildirim', 'Hataları ve düzeltmeleri bildirebilir veya yeni kaynaklar önerebilirsiniz. Mesajlar veri minimizasyonuyla işlenir.'],
      ['Önerme ve destek', 'Uygulamayı özgürce önerebilir ve bağımsız projeyi gönüllü olarak destekleyebilirsiniz.']
    ]
  };

  const UI_COPY = {
    de: {
      menu:'Menü', menuOpen:'Menü öffnen', aboutProject:'Über das Projekt', privacy:'Datenschutz', diagnostics:'Diagnose',
      sourceCheck:'Quellenbericht', selfTest:'App-Selbsttest', releaseChecklist:'Release-Checkliste', feedback:'Feedback & neue Quellen', briefingCreate:'Briefing erstellen',
      feedbackKicker:'Direkter Kontakt', feedbackTitle:'Feedback schreiben', feedbackIntro:'Schreibe uns Feedback, melde einen Fehler oder schlage eine neue Quelle vor.', feedbackType:'Worum geht es?', feedbackGeneral:'Allgemeines Feedback', feedbackSource:'Neue Quelle vorschlagen', feedbackCorrection:'Korrektur melden', feedbackTechnical:'Technisches Problem', feedbackReply:'E-Mail für eine Antwort (optional)', feedbackMessage:'Deine Nachricht', feedbackPlaceholder:'Was möchtest du uns mitteilen?', feedbackPrivacy:'Die Nachricht wird verschlüsselt übertragen, nicht in der App gespeichert und im privaten Projekt-Postfach spätestens nach 90 Tagen gelöscht. Es werden keine Analyse- oder Werbedaten angehängt.', copyText:'Text kopieren', openEmail:'E-Mail-Alternative', copied:'Text kopiert', feedbackRequired:'Bitte schreibe zuerst eine Nachricht.', sendFeedback:'Direkt senden', feedbackSending:'Wird gesendet …', feedbackSent:'Danke. Deine Nachricht wurde gesendet.', feedbackFailed:'Direktes Senden ist gerade nicht verfügbar. Nutze bitte die E-Mail-Alternative.',
      openLiveData:'Aktuelle Feeds öffnen',
      donate:'Spenden', donateKicker:'Freiwillige Unterstützung', donateTitle:'Projekt unterstützen',
      donateBody:'Dieses unabhängige Projekt kann freiwillig unterstützt werden.',
      donateWarning:'Wenn du fortfährst, verlässt du die App und öffnest PayPal.', donatePaypal:'Weiter zu PayPal',
      display:'Darstellung', project:'Projekt', theme:'Farbdarstellung', themeDark:'Dunkel', themeLight:'Hell',
      themeSystem:'Systemeinstellung', themeContrast:'Hoher Kontrast', fontSize:'Schriftgröße', normal:'Normal',
      large:'Groß', xlarge:'Sehr groß', density:'Artikeldarstellung', compact:'Kompakt', standard:'Standard',
      spacious:'Großzügig', settingsLocal:'Diese Einstellungen bleiben auf diesem Gerät.',
      briefingSetup:'Wähle in drei kurzen Schritten, was du hören oder lesen möchtest.', step:'Schritt', of:'von',
      next:'Weiter', back:'Zurück', listen:'Anhören', stop:'Stoppen', done:'Fertig', briefingLocal:'Wird nur auf diesem Gerät zusammengestellt.',
      briefingAmount:'Länge', briefingItems:'Meldungen', briefingMinutes:'Minuten', briefingApprox:'ca.',
      briefingHistory:'Letzte Briefings', briefingHistoryClear:'Briefing-Verlauf löschen',
      noBriefing:'Keine passenden Meldungen gefunden.',
      speechUnavailable:'Die kostenlose Gerätestimme ist auf diesem Gerät nicht verfügbar.',
      chooseSources:'Quellen priorisieren oder ausblenden', sourcePreferenceSearch:'Quellen durchsuchen',
      sourceNeutral:'Standard', sourceFollow:'Folgen', sourceHide:'Ausblenden',
      followPrisoners:'Politische Gefangene beobachten', followDevelopments:'Entwicklungen beobachten',
      feedLanguage:'App-Sprache', preferredBriefingLength:'Standardlänge des Briefings',
      shownBecause:'Angezeigt wegen', followedPrisoners:'Beobachtete Gefangene',
      followedDevelopments:'Beobachtete Entwicklungen', noWatchOptions:'Aktuell steht keine Auswahl zur Verfügung.',
      zine:'Zine', zineIntro:'Stelle Artikel zu einer eigenen Ausgabe zusammen und gestalte sie anschließend für Druck oder PDF.',
      zineAdd:'Zum Zine', zineAdded:'Artikel zum Zine hinzugefügt.', zineRemove:'Aus Zine entfernen',
      zineRemoved:'Artikel aus dem Zine entfernt.', zineEmpty:'Das Zine ist noch leer.',
      zineClear:'Zine leeren', zineClearConfirm:'Alle Artikel aus dem Zine entfernen?'
    },
    en: {
      menu:'Menu', menuOpen:'Open menu', aboutProject:'About the project', privacy:'Privacy', diagnostics:'Diagnostics',
      sourceCheck:'Source report', selfTest:'App self-test', releaseChecklist:'Release checklist', feedback:'Feedback & new sources', briefingCreate:'Create briefing',
      feedbackKicker:'Direct contact', feedbackTitle:'Write feedback', feedbackIntro:'Send feedback, report a problem or suggest a new source.', feedbackType:'What is this about?', feedbackGeneral:'General feedback', feedbackSource:'Suggest a new source', feedbackCorrection:'Report a correction', feedbackTechnical:'Technical problem', feedbackReply:'Email for a reply (optional)', feedbackMessage:'Your message', feedbackPlaceholder:'What would you like to tell us?', feedbackPrivacy:'The message is encrypted in transit, is not stored in the app and is deleted from the private project inbox within 90 days. No analytics or advertising data is attached.', copyText:'Copy text', openEmail:'Email alternative', copied:'Text copied', feedbackRequired:'Please write a message first.', sendFeedback:'Send directly', feedbackSending:'Sending …', feedbackSent:'Thank you. Your message was sent.', feedbackFailed:'Direct sending is currently unavailable. Please use the email alternative.',
      openLiveData:'Open current feeds',
      donate:'Donate', donateKicker:'Voluntary support', donateTitle:'Support the project',
      donateBody:'You can voluntarily support this independent project.',
      donateWarning:'If you continue, you will leave the app and open PayPal.', donatePaypal:'Continue to PayPal',
      display:'Appearance', project:'Project', theme:'Colour theme', themeDark:'Dark', themeLight:'Light',
      themeSystem:'System setting', themeContrast:'High contrast', fontSize:'Text size', normal:'Normal',
      large:'Large', xlarge:'Very large', density:'Article layout', compact:'Compact', standard:'Standard',
      spacious:'Spacious', settingsLocal:'These settings remain on this device.',
      briefingSetup:'Choose what you want to hear or read in three short steps.', step:'Step', of:'of',
      next:'Next', back:'Back', listen:'Listen', stop:'Stop', done:'Done', briefingLocal:'Assembled only on this device.',
      briefingAmount:'Length', briefingItems:'stories', briefingMinutes:'minutes', briefingApprox:'approx.',
      briefingHistory:'Recent briefings', briefingHistoryClear:'Clear briefing history',
      noBriefing:'No matching stories found.',
      speechUnavailable:'The free device voice is not available on this device.',
      chooseSources:'Prioritize or hide sources', sourcePreferenceSearch:'Search sources',
      sourceNeutral:'Default', sourceFollow:'Follow', sourceHide:'Hide',
      followPrisoners:'Watch political prisoners', followDevelopments:'Watch developments',
      feedLanguage:'App language', preferredBriefingLength:'Default briefing length',
      shownBecause:'Shown because of', followedPrisoners:'Watched prisoners',
      followedDevelopments:'Watched developments', noWatchOptions:'No options are currently available.',
      zine:'Zine', zineIntro:'Collect articles into your own issue, then design it for print or PDF.',
      zineAdd:'Add to Zine', zineAdded:'Article added to the Zine.', zineRemove:'Remove from Zine',
      zineRemoved:'Article removed from the Zine.', zineEmpty:'The Zine is empty.',
      zineClear:'Clear Zine', zineClearConfirm:'Remove every article from the Zine?'
    },
    es: {
      menu:'Menú', menuOpen:'Abrir menú', aboutProject:'Sobre el proyecto', privacy:'Privacidad', diagnostics:'Diagnóstico',
      sourceCheck:'Informe de fuentes', selfTest:'Autoprueba', releaseChecklist:'Lista de publicación', feedback:'Comentarios y nuevas fuentes', briefingCreate:'Crear resumen',
      feedbackKicker:'Contacto directo', feedbackTitle:'Escribir comentarios', feedbackIntro:'Envía comentarios, informa de un problema o sugiere una nueva fuente.', feedbackType:'¿De qué se trata?', feedbackGeneral:'Comentario general', feedbackSource:'Sugerir una fuente', feedbackCorrection:'Informar de una corrección', feedbackTechnical:'Problema técnico', feedbackReply:'Correo para responder (opcional)', feedbackMessage:'Tu mensaje', feedbackPlaceholder:'¿Qué quieres contarnos?', feedbackPrivacy:'El mensaje se transmite cifrado, no se guarda en la app y se elimina del buzón privado del proyecto en un máximo de 90 días. No se adjuntan datos de análisis ni publicidad.', copyText:'Copiar texto', openEmail:'Alternativa por correo', copied:'Texto copiado', feedbackRequired:'Escribe primero un mensaje.', sendFeedback:'Enviar directamente', feedbackSending:'Enviando …', feedbackSent:'Gracias. Tu mensaje ha sido enviado.', feedbackFailed:'El envío directo no está disponible. Usa la alternativa por correo.',
      openLiveData:'Abrir fuentes actuales',
      donate:'Donar', donateKicker:'Apoyo voluntario', donateTitle:'Apoyar el proyecto',
      donateBody:'Puedes apoyar voluntariamente este proyecto independiente.',
      donateWarning:'Si continúas, saldrás de la aplicación y abrirás PayPal.', donatePaypal:'Continuar a PayPal',
      display:'Apariencia', project:'Proyecto', theme:'Tema de color', themeDark:'Oscuro', themeLight:'Claro',
      themeSystem:'Sistema', themeContrast:'Alto contraste', fontSize:'Tamaño del texto', normal:'Normal',
      large:'Grande', xlarge:'Muy grande', density:'Vista de artículos', compact:'Compacta', standard:'Estándar',
      spacious:'Amplia', settingsLocal:'Estos ajustes permanecen en este dispositivo.',
      briefingSetup:'Elige en tres pasos lo que quieres escuchar o leer.', step:'Paso', of:'de', next:'Siguiente', back:'Atrás',
      listen:'Escuchar', stop:'Detener', done:'Listo', briefingLocal:'Se crea solo en este dispositivo.',
      briefingAmount:'Duración', briefingItems:'noticias', briefingMinutes:'minutos', briefingApprox:'aprox.',
      noBriefing:'No se encontraron noticias.', speechUnavailable:'La lectura no está disponible.',
      chooseSources:'Priorizar u ocultar fuentes', sourcePreferenceSearch:'Buscar fuentes', sourceNeutral:'Predeterminado',
      sourceFollow:'Seguir', sourceHide:'Ocultar', followPrisoners:'Seguir a presxs políticxs',
      followDevelopments:'Seguir desarrollos', feedLanguage:'Idioma de la aplicación',
      preferredBriefingLength:'Duración predeterminada del resumen', shownBecause:'Se muestra por',
      followedPrisoners:'Presxs seguidxs', followedDevelopments:'Desarrollos seguidos', noWatchOptions:'No hay opciones disponibles.',
      zine:'Zine', zineIntro:'Reúne artículos en una edición y diseña el resultado para imprimir o guardar en PDF.',
      zineAdd:'Añadir al Zine', zineAdded:'Artículo añadido al Zine.', zineRemove:'Quitar del Zine',
      zineRemoved:'Artículo eliminado del Zine.', zineEmpty:'El Zine está vacío.',
      zineClear:'Vaciar Zine', zineClearConfirm:'¿Quitar todos los artículos del Zine?'
    },
    fr: {
      menu:'Menu', menuOpen:'Ouvrir le menu', aboutProject:'À propos du projet', privacy:'Confidentialité', diagnostics:'Diagnostic',
      sourceCheck:'Rapport des sources', selfTest:'Autotest', releaseChecklist:'Liste de publication', feedback:'Commentaires et nouvelles sources', briefingCreate:'Créer un briefing',
      feedbackKicker:'Contact direct', feedbackTitle:'Écrire un commentaire', feedbackIntro:'Envoyez un commentaire, signalez un problème ou proposez une source.', feedbackType:'De quoi s’agit-il ?', feedbackGeneral:'Commentaire général', feedbackSource:'Proposer une source', feedbackCorrection:'Signaler une correction', feedbackTechnical:'Problème technique', feedbackReply:'E-mail pour une réponse (facultatif)', feedbackMessage:'Votre message', feedbackPlaceholder:'Que souhaitez-vous nous dire ?', feedbackPrivacy:'Le message est transmis de manière chiffrée, n’est pas conservé dans l’application et est supprimé de la boîte privée du projet sous 90 jours. Aucune donnée publicitaire ou analytique n’est jointe.', copyText:'Copier le texte', openEmail:'Alternative par e-mail', copied:'Texte copié', feedbackRequired:'Écrivez d’abord un message.', sendFeedback:'Envoyer directement', feedbackSending:'Envoi …', feedbackSent:'Merci. Votre message a été envoyé.', feedbackFailed:'L’envoi direct est indisponible. Utilisez l’alternative par e-mail.',
      openLiveData:'Ouvrir les flux actuels',
      donate:'Faire un don', donateKicker:'Soutien volontaire', donateTitle:'Soutenir le projet',
      donateBody:'Vous pouvez soutenir volontairement ce projet indépendant.',
      donateWarning:'En continuant, vous quitterez l’application et ouvrirez PayPal.', donatePaypal:'Continuer vers PayPal',
      display:'Affichage', project:'Projet', theme:'Thème de couleur', themeDark:'Sombre', themeLight:'Clair',
      themeSystem:'Système', themeContrast:'Contraste élevé', fontSize:'Taille du texte', normal:'Normale',
      large:'Grande', xlarge:'Très grande', density:'Affichage des articles', compact:'Compact', standard:'Standard',
      spacious:'Aéré', settingsLocal:'Ces réglages restent sur cet appareil.',
      briefingSetup:'Choisissez en trois étapes ce que vous souhaitez écouter ou lire.', step:'Étape', of:'sur', next:'Suivant', back:'Retour',
      listen:'Écouter', stop:'Arrêter', done:'Terminé', briefingLocal:'Assemblé uniquement sur cet appareil.',
      briefingAmount:'Durée', briefingItems:'informations', briefingMinutes:'minutes', briefingApprox:'env.',
      noBriefing:'Aucune information correspondante.', speechUnavailable:'La lecture vocale est indisponible.',
      chooseSources:'Prioriser ou masquer des sources', sourcePreferenceSearch:'Rechercher des sources', sourceNeutral:'Par défaut',
      sourceFollow:'Suivre', sourceHide:'Masquer', followPrisoners:'Suivre des prisonnier·ères politiques',
      followDevelopments:'Suivre des évolutions', feedLanguage:'Langue de l’application',
      preferredBriefingLength:'Durée par défaut du briefing', shownBecause:'Affiché en raison de',
      followedPrisoners:'Prisonnier·ères suivi·es', followedDevelopments:'Évolutions suivies', noWatchOptions:'Aucune option disponible.',
      zine:'Zine', zineIntro:'Rassemblez des articles dans un numéro, puis préparez-le pour l’impression ou le PDF.',
      zineAdd:'Ajouter au Zine', zineAdded:'Article ajouté au Zine.', zineRemove:'Retirer du Zine',
      zineRemoved:'Article retiré du Zine.', zineEmpty:'Le Zine est vide.',
      zineClear:'Vider le Zine', zineClearConfirm:'Retirer tous les articles du Zine ?'
    },
    it: {
      menu:'Menu', menuOpen:'Apri menu', aboutProject:'Il progetto', privacy:'Privacy', diagnostics:'Diagnostica',
      sourceCheck:'Rapporto fonti', selfTest:'Autotest', releaseChecklist:'Lista di rilascio', feedback:'Feedback e nuove fonti', briefingCreate:'Crea briefing',
      feedbackKicker:'Contatto diretto', feedbackTitle:'Scrivi un feedback', feedbackIntro:'Invia un feedback, segnala un problema o proponi una nuova fonte.', feedbackType:'Di cosa si tratta?', feedbackGeneral:'Feedback generale', feedbackSource:'Proponi una fonte', feedbackCorrection:'Segnala una correzione', feedbackTechnical:'Problema tecnico', feedbackReply:'E-mail per una risposta (opzionale)', feedbackMessage:'Il tuo messaggio', feedbackPlaceholder:'Cosa vuoi comunicarci?', feedbackPrivacy:'Il messaggio viene trasmesso in modo cifrato, non viene salvato nell’app ed è eliminato dalla casella privata del progetto entro 90 giorni. Non vengono allegati dati pubblicitari o analitici.', copyText:'Copia testo', openEmail:'Alternativa e-mail', copied:'Testo copiato', feedbackRequired:'Scrivi prima un messaggio.', sendFeedback:'Invia direttamente', feedbackSending:'Invio …', feedbackSent:'Grazie. Il messaggio è stato inviato.', feedbackFailed:'L’invio diretto non è disponibile. Usa l’alternativa e-mail.',
      openLiveData:'Apri i feed attuali',
      donate:'Dona', donateKicker:'Sostegno volontario', donateTitle:'Sostieni il progetto',
      donateBody:'Puoi sostenere volontariamente questo progetto indipendente.',
      donateWarning:'Continuando, lascerai l’app e aprirai PayPal.', donatePaypal:'Continua su PayPal',
      display:'Aspetto', project:'Progetto', theme:'Tema colore', themeDark:'Scuro', themeLight:'Chiaro',
      themeSystem:'Sistema', themeContrast:'Contrasto elevato', fontSize:'Dimensione testo', normal:'Normale',
      large:'Grande', xlarge:'Molto grande', density:'Vista articoli', compact:'Compatta', standard:'Standard',
      spacious:'Spaziosa', settingsLocal:'Queste impostazioni restano su questo dispositivo.',
      briefingSetup:'Scegli in tre passaggi cosa ascoltare o leggere.', step:'Passaggio', of:'di', next:'Avanti', back:'Indietro',
      listen:'Ascolta', stop:'Ferma', done:'Fatto', briefingLocal:'Creato solo su questo dispositivo.',
      briefingAmount:'Durata', briefingItems:'notizie', briefingMinutes:'minuti', briefingApprox:'ca.',
      noBriefing:'Nessuna notizia corrispondente.', speechUnavailable:'La lettura vocale non è disponibile.',
      chooseSources:'Dai priorità o nascondi fonti', sourcePreferenceSearch:'Cerca fonti', sourceNeutral:'Predefinito',
      sourceFollow:'Segui', sourceHide:'Nascondi', followPrisoners:'Segui prigionierə politicə',
      followDevelopments:'Segui sviluppi', feedLanguage:'Lingua dell’app',
      preferredBriefingLength:'Durata predefinita del briefing', shownBecause:'Mostrato per',
      followedPrisoners:'Prigionierə seguitə', followedDevelopments:'Sviluppi seguiti', noWatchOptions:'Nessuna opzione disponibile.',
      zine:'Zine', zineIntro:'Raccogli articoli in un numero e preparalo per la stampa o il PDF.',
      zineAdd:'Aggiungi allo Zine', zineAdded:'Articolo aggiunto allo Zine.', zineRemove:'Rimuovi dallo Zine',
      zineRemoved:'Articolo rimosso dallo Zine.', zineEmpty:'Lo Zine è vuoto.',
      zineClear:'Svuota Zine', zineClearConfirm:'Rimuovere tutti gli articoli dallo Zine?'
    },
    pt: {
      menu:'Menu', menuOpen:'Abrir menu', aboutProject:'Sobre o projeto', privacy:'Privacidade', diagnostics:'Diagnóstico',
      sourceCheck:'Relatório de fontes', selfTest:'Autoteste', releaseChecklist:'Lista de lançamento', feedback:'Comentários e novas fontes', briefingCreate:'Criar briefing',
      feedbackKicker:'Contacto direto', feedbackTitle:'Escrever comentário', feedbackIntro:'Envia comentários, comunica um problema ou sugere uma nova fonte.', feedbackType:'Qual é o assunto?', feedbackGeneral:'Comentário geral', feedbackSource:'Sugerir uma fonte', feedbackCorrection:'Comunicar uma correção', feedbackTechnical:'Problema técnico', feedbackReply:'E-mail para resposta (opcional)', feedbackMessage:'A tua mensagem', feedbackPlaceholder:'O que nos queres dizer?', feedbackPrivacy:'A mensagem é transmitida de forma cifrada, não é guardada na app e é eliminada da caixa privada do projeto no prazo de 90 dias. Não são anexados dados analíticos nem publicitários.', copyText:'Copiar texto', openEmail:'Alternativa por e-mail', copied:'Texto copiado', feedbackRequired:'Escreve primeiro uma mensagem.', sendFeedback:'Enviar diretamente', feedbackSending:'A enviar …', feedbackSent:'Obrigado. A mensagem foi enviada.', feedbackFailed:'O envio direto não está disponível. Usa a alternativa por e-mail.',
      openLiveData:'Abrir fontes atuais',
      donate:'Doar', donateKicker:'Apoio voluntário', donateTitle:'Apoiar o projeto',
      donateBody:'Podes apoiar voluntariamente este projeto independente.',
      donateWarning:'Ao continuar, sairás da aplicação e abrirás o PayPal.', donatePaypal:'Continuar para o PayPal',
      display:'Aparência', project:'Projeto', theme:'Tema de cores', themeDark:'Escuro', themeLight:'Claro',
      themeSystem:'Sistema', themeContrast:'Alto contraste', fontSize:'Tamanho do texto', normal:'Normal',
      large:'Grande', xlarge:'Muito grande', density:'Vista de artigos', compact:'Compacta', standard:'Padrão',
      spacious:'Ampla', settingsLocal:'Estas definições ficam neste dispositivo.',
      briefingSetup:'Escolhe em três passos o que queres ouvir ou ler.', step:'Passo', of:'de', next:'Seguinte', back:'Voltar',
      listen:'Ouvir', stop:'Parar', done:'Concluir', briefingLocal:'Criado apenas neste dispositivo.',
      briefingAmount:'Duração', briefingItems:'notícias', briefingMinutes:'minutos', briefingApprox:'aprox.',
      noBriefing:'Nenhuma notícia correspondente.', speechUnavailable:'A leitura em voz alta não está disponível.',
      chooseSources:'Priorizar ou ocultar fontes', sourcePreferenceSearch:'Pesquisar fontes', sourceNeutral:'Padrão',
      sourceFollow:'Seguir', sourceHide:'Ocultar', followPrisoners:'Seguir prisioneiros políticos',
      followDevelopments:'Seguir desenvolvimentos', feedLanguage:'Idioma da aplicação',
      preferredBriefingLength:'Duração predefinida do briefing', shownBecause:'Mostrado por',
      followedPrisoners:'Prisioneiros seguidos', followedDevelopments:'Desenvolvimentos seguidos', noWatchOptions:'Não há opções disponíveis.',
      zine:'Zine', zineIntro:'Reúne artigos numa edição e prepara-a para impressão ou PDF.',
      zineAdd:'Adicionar ao Zine', zineAdded:'Artigo adicionado ao Zine.', zineRemove:'Remover do Zine',
      zineRemoved:'Artigo removido do Zine.', zineEmpty:'O Zine está vazio.',
      zineClear:'Esvaziar Zine', zineClearConfirm:'Remover todos os artigos do Zine?'
    },
    ru: {
      menu:'Меню', menuOpen:'Открыть меню', aboutProject:'О проекте', privacy:'Конфиденциальность', diagnostics:'Диагностика',
      sourceCheck:'Отчёт об источниках', selfTest:'Самопроверка', releaseChecklist:'Список готовности', feedback:'Отзывы и новые источники', briefingCreate:'Создать брифинг',
      feedbackKicker:'Прямая связь', feedbackTitle:'Написать отзыв', feedbackIntro:'Отправьте отзыв, сообщите о проблеме или предложите источник.', feedbackType:'О чём сообщение?', feedbackGeneral:'Общий отзыв', feedbackSource:'Предложить источник', feedbackCorrection:'Сообщить об исправлении', feedbackTechnical:'Техническая проблема', feedbackReply:'Email для ответа (необязательно)', feedbackMessage:'Ваше сообщение', feedbackPlaceholder:'Что вы хотите нам сообщить?', feedbackPrivacy:'Сообщение передаётся в зашифрованном виде, не хранится в приложении и удаляется из закрытого ящика проекта в течение 90 дней. Аналитические и рекламные данные не прикрепляются.', copyText:'Копировать текст', openEmail:'Отправить по email', copied:'Текст скопирован', feedbackRequired:'Сначала напишите сообщение.', sendFeedback:'Отправить напрямую', feedbackSending:'Отправка …', feedbackSent:'Спасибо. Сообщение отправлено.', feedbackFailed:'Прямая отправка недоступна. Используйте email.',
      openLiveData:'Открыть актуальные ленты',
      donate:'Поддержать', donateKicker:'Добровольная поддержка', donateTitle:'Поддержать проект',
      donateBody:'Вы можете добровольно поддержать этот независимый проект.',
      donateWarning:'При продолжении вы покинете приложение и откроете PayPal.', donatePaypal:'Перейти в PayPal',
      display:'Оформление', project:'Проект', theme:'Цветовая тема', themeDark:'Тёмная', themeLight:'Светлая',
      themeSystem:'Системная', themeContrast:'Высокий контраст', fontSize:'Размер текста', normal:'Обычный',
      large:'Большой', xlarge:'Очень большой', density:'Вид статей', compact:'Компактный', standard:'Стандартный',
      spacious:'Свободный', settingsLocal:'Эти настройки остаются на устройстве.',
      briefingSetup:'За три шага выберите, что слушать или читать.', step:'Шаг', of:'из', next:'Далее', back:'Назад',
      listen:'Слушать', stop:'Стоп', done:'Готово', briefingLocal:'Составляется только на этом устройстве.',
      briefingAmount:'Длина', briefingItems:'материалов', briefingMinutes:'минут', briefingApprox:'ок.',
      noBriefing:'Подходящих материалов нет.', speechUnavailable:'Озвучивание недоступно.',
      chooseSources:'Выбрать приоритетные или скрытые источники', sourcePreferenceSearch:'Поиск источников',
      sourceNeutral:'По умолчанию', sourceFollow:'Следить', sourceHide:'Скрыть',
      followPrisoners:'Следить за политзаключёнными', followDevelopments:'Следить за событиями',
      feedLanguage:'Язык приложения', preferredBriefingLength:'Длина обзора по умолчанию',
      shownBecause:'Показано по причине', followedPrisoners:'Отслеживаемые заключённые',
      followedDevelopments:'Отслеживаемые события', noWatchOptions:'Сейчас вариантов нет.',
      zine:'Zine', zineIntro:'Соберите статьи в выпуск и подготовьте его к печати или сохранению в PDF.',
      zineAdd:'Добавить в Zine', zineAdded:'Статья добавлена в Zine.', zineRemove:'Удалить из Zine',
      zineRemoved:'Статья удалена из Zine.', zineEmpty:'Zine пока пуст.',
      zineClear:'Очистить Zine', zineClearConfirm:'Удалить все статьи из Zine?'
    },
    el: {
      menu:'Μενού', menuOpen:'Άνοιγμα μενού', aboutProject:'Σχετικά με το έργο', privacy:'Απόρρητο', diagnostics:'Διαγνωστικά',
      sourceCheck:'Αναφορά πηγών', selfTest:'Αυτοέλεγχος', releaseChecklist:'Λίστα έκδοσης', feedback:'Σχόλια και νέες πηγές', briefingCreate:'Δημιουργία ενημέρωσης',
      feedbackKicker:'Άμεση επικοινωνία', feedbackTitle:'Γράψτε σχόλιο', feedbackIntro:'Στείλτε σχόλια, αναφέρετε πρόβλημα ή προτείνετε νέα πηγή.', feedbackType:'Ποιο είναι το θέμα;', feedbackGeneral:'Γενικό σχόλιο', feedbackSource:'Πρόταση πηγής', feedbackCorrection:'Αναφορά διόρθωσης', feedbackTechnical:'Τεχνικό πρόβλημα', feedbackReply:'Email για απάντηση (προαιρετικό)', feedbackMessage:'Το μήνυμά σας', feedbackPlaceholder:'Τι θέλετε να μας πείτε;', feedbackPrivacy:'Το μήνυμα μεταδίδεται κρυπτογραφημένα, δεν αποθηκεύεται στην εφαρμογή και διαγράφεται από το ιδιωτικό γραμματοκιβώτιο του έργου εντός 90 ημερών. Δεν επισυνάπτονται δεδομένα διαφήμισης ή ανάλυσης.', copyText:'Αντιγραφή κειμένου', openEmail:'Εναλλακτικά με email', copied:'Το κείμενο αντιγράφηκε', feedbackRequired:'Γράψτε πρώτα ένα μήνυμα.', sendFeedback:'Άμεση αποστολή', feedbackSending:'Αποστολή …', feedbackSent:'Ευχαριστούμε. Το μήνυμα στάλθηκε.', feedbackFailed:'Η άμεση αποστολή δεν είναι διαθέσιμη. Χρησιμοποιήστε το email.',
      openLiveData:'Άνοιγμα τρεχουσών ροών',
      donate:'Δωρεά', donateKicker:'Εθελοντική υποστήριξη', donateTitle:'Υποστήριξη του έργου',
      donateBody:'Μπορείτε να υποστηρίξετε εθελοντικά αυτό το ανεξάρτητο έργο.',
      donateWarning:'Αν συνεχίσετε, θα φύγετε από την εφαρμογή και θα ανοίξετε το PayPal.', donatePaypal:'Συνέχεια στο PayPal',
      display:'Εμφάνιση', project:'Έργο', theme:'Χρωματικό θέμα', themeDark:'Σκούρο', themeLight:'Ανοιχτό',
      themeSystem:'Σύστημα', themeContrast:'Υψηλή αντίθεση', fontSize:'Μέγεθος κειμένου', normal:'Κανονικό',
      large:'Μεγάλο', xlarge:'Πολύ μεγάλο', density:'Προβολή άρθρων', compact:'Συμπαγής', standard:'Κανονική',
      spacious:'Άνετη', settingsLocal:'Αυτές οι ρυθμίσεις μένουν στη συσκευή.',
      briefingSetup:'Επιλέξτε σε τρία βήματα τι θέλετε να ακούσετε ή να διαβάσετε.', step:'Βήμα', of:'από', next:'Επόμενο', back:'Πίσω',
      listen:'Ακρόαση', stop:'Διακοπή', done:'Τέλος', briefingLocal:'Δημιουργείται μόνο σε αυτή τη συσκευή.',
      briefingAmount:'Διάρκεια', briefingItems:'ειδήσεις', briefingMinutes:'λεπτά', briefingApprox:'περ.',
      noBriefing:'Δεν βρέθηκαν ειδήσεις.', speechUnavailable:'Η εκφώνηση δεν είναι διαθέσιμη.',
      chooseSources:'Προτεραιότητα ή απόκρυψη πηγών', sourcePreferenceSearch:'Αναζήτηση πηγών',
      sourceNeutral:'Προεπιλογή', sourceFollow:'Παρακολούθηση', sourceHide:'Απόκρυψη',
      followPrisoners:'Παρακολούθηση πολιτικών κρατουμένων', followDevelopments:'Παρακολούθηση εξελίξεων',
      feedLanguage:'Γλώσσα εφαρμογής', preferredBriefingLength:'Προεπιλεγμένη διάρκεια ενημέρωσης',
      shownBecause:'Εμφανίζεται λόγω', followedPrisoners:'Παρακολουθούμενοι κρατούμενοι',
      followedDevelopments:'Παρακολουθούμενες εξελίξεις', noWatchOptions:'Δεν υπάρχουν διαθέσιμες επιλογές.',
      zine:'Zine', zineIntro:'Συγκεντρώστε άρθρα σε ένα τεύχος και σχεδιάστε το για εκτύπωση ή PDF.',
      zineAdd:'Προσθήκη στο Zine', zineAdded:'Το άρθρο προστέθηκε στο Zine.', zineRemove:'Αφαίρεση από το Zine',
      zineRemoved:'Το άρθρο αφαιρέθηκε από το Zine.', zineEmpty:'Το Zine είναι κενό.',
      zineClear:'Εκκαθάριση Zine', zineClearConfirm:'Να αφαιρεθούν όλα τα άρθρα από το Zine;'
    },
    tr: {
      menu:'Menü', menuOpen:'Menüyü aç', aboutProject:'Proje hakkında', privacy:'Gizlilik', diagnostics:'Tanılama',
      sourceCheck:'Kaynak raporu', selfTest:'Uygulama testi', releaseChecklist:'Yayın kontrol listesi', feedback:'Geri bildirim ve yeni kaynaklar', briefingCreate:'Bülten oluştur',
      feedbackKicker:'Doğrudan iletişim', feedbackTitle:'Geri bildirim yaz', feedbackIntro:'Geri bildirim gönderin, sorun bildirin veya yeni bir kaynak önerin.', feedbackType:'Konu nedir?', feedbackGeneral:'Genel geri bildirim', feedbackSource:'Yeni kaynak öner', feedbackCorrection:'Düzeltme bildir', feedbackTechnical:'Teknik sorun', feedbackReply:'Yanıt için e-posta (isteğe bağlı)', feedbackMessage:'Mesajınız', feedbackPlaceholder:'Bize ne söylemek istersiniz?', feedbackPrivacy:'Mesaj şifreli olarak iletilir, uygulamada saklanmaz ve özel proje kutusundan 90 gün içinde silinir. Analiz veya reklam verileri eklenmez.', copyText:'Metni kopyala', openEmail:'E-posta alternatifi', copied:'Metin kopyalandı', feedbackRequired:'Önce bir mesaj yazın.', sendFeedback:'Doğrudan gönder', feedbackSending:'Gönderiliyor …', feedbackSent:'Teşekkürler. Mesajınız gönderildi.', feedbackFailed:'Doğrudan gönderim kullanılamıyor. E-posta alternatifini kullanın.',
      openLiveData:'Güncel akışları aç',
      donate:'Bağış yap', donateKicker:'Gönüllü destek', donateTitle:'Projeyi destekle',
      donateBody:'Bu bağımsız projeyi gönüllü olarak destekleyebilirsiniz.',
      donateWarning:'Devam ederseniz uygulamadan ayrılır ve PayPal’ı açarsınız.', donatePaypal:'PayPal’a devam et',
      display:'Görünüm', project:'Proje', theme:'Renk teması', themeDark:'Koyu', themeLight:'Açık',
      themeSystem:'Sistem', themeContrast:'Yüksek kontrast', fontSize:'Metin boyutu', normal:'Normal',
      large:'Büyük', xlarge:'Çok büyük', density:'Haber görünümü', compact:'Kompakt', standard:'Standart',
      spacious:'Geniş', settingsLocal:'Bu ayarlar yalnızca bu cihazda kalır.',
      briefingSetup:'Dinlemek veya okumak istediklerini üç adımda seç.', step:'Adım', of:'/', next:'İleri', back:'Geri',
      listen:'Dinle', stop:'Durdur', done:'Bitti', briefingLocal:'Yalnızca bu cihazda hazırlanır.',
      briefingAmount:'Uzunluk', briefingItems:'haber', briefingMinutes:'dakika', briefingApprox:'yakl.',
      noBriefing:'Uygun haber bulunamadı.', speechUnavailable:'Sesli okuma kullanılamıyor.',
      chooseSources:'Kaynaklara öncelik ver veya gizle', sourcePreferenceSearch:'Kaynak ara',
      sourceNeutral:'Varsayılan', sourceFollow:'Takip et', sourceHide:'Gizle',
      followPrisoners:'Siyasi mahpusları takip et', followDevelopments:'Gelişmeleri takip et',
      feedLanguage:'Uygulama dili', preferredBriefingLength:'Varsayılan bülten uzunluğu',
      shownBecause:'Gösterilme nedeni', followedPrisoners:'Takip edilen mahpuslar',
      followedDevelopments:'Takip edilen gelişmeler', noWatchOptions:'Şu anda seçenek yok.',
      zine:'Zine', zineIntro:'Makaleleri bir sayıda topla ve baskı veya PDF için tasarla.',
      zineAdd:'Zine’a ekle', zineAdded:'Makale Zine’a eklendi.', zineRemove:'Zine’dan çıkar',
      zineRemoved:'Makale Zine’dan çıkarıldı.', zineEmpty:'Zine henüz boş.',
      zineClear:'Zine’ı temizle', zineClearConfirm:'Zine’daki tüm makaleler kaldırılsın mı?'
    }
  };

  const RELEASE_COPY = {
    de: {
      themeOled:'OLED-Schwarz', themeSoft:'Gedämpft', themePink:'Pink', website:'Webseite', font200:'200 %',
      systemStatus:'Systemstatus', localData:'Lokale Daten', advancedFilters:'Weitere Filter',
      sort:'Sortierung', newestFirst:'Neueste zuerst', oldestFirst:'Älteste zuerst',
      sourceLanguage:'Quellsprache', sourceOrigin:'Herkunft', contentFormat:'Format',
      exactSource:'Quelle', allLanguages:'Alle Sprachen', allOrigins:'Alle Herkünfte',
      allFormats:'Alle Formate', allSources:'Alle Quellen', cardsView:'Karten',
      compactView:'Kompakt', headlinesView:'Schlagzeilen', sourceProfile:'Quellenprofil',
      newsFormat:'Nachricht', analysisFormat:'Analyse', commentaryFormat:'Kommentar',
      interviewFormat:'Interview', pressReleaseFormat:'Pressemitteilung',
      readArticles:'Gelesen', readProgress:'Lesefortschritt', continueReading:'Weiterlesen',
      city:'Stadt', category:'Kategorie', group:'Gruppe', date:'Datum',
      allCities:'Alle Städte', allGroups:'Alle Gruppen', allEventCategories:'Alle Kategorien',
      nearMe:'In meiner Nähe', locationOff:'Nähe aus', locationPrivate:'Der Standort bleibt auf diesem Gerät und wird nicht gespeichert.',
      locationUnavailable:'Standort konnte nicht bestimmt werden.', map:'Karte', route:'Route',
      calendar:'Kalender', remind:'Erinnern', reminderSet:'Erinnerung gespeichert',
      reminderRemoved:'Erinnerung entfernt', distance:'Entfernung',
      saveFilter:'Filter speichern', savedFilters:'Gespeicherte Filter', filterSaved:'Terminfilter gespeichert.',
      audioQueue:'Warteschlange', favoritesOnly:'Nur Favoriten', cloudPodcast:'Natürliche Stimme (online)',
      shortPodcast:'Kurz-Podcast', fullPodcast:'Ganzer Artikel', podcastGenerating:'Podcast wird erzeugt …',
      podcastReady:'Podcast wurde erzeugt und ist abspielbereit.', podcastFailed:'Podcast konnte nicht erzeugt werden.',
      azureVoice:'Stimme', onlineCostNotice:'Online-Erzeugung nutzt das begrenzte gemeinsame Stimmenkontingent.',
      cloudVoiceChecking:'Azure online: Verfügbarkeit wird geprüft …',
      cloudVoiceAvailable:'Azure online: verfügbar. Benötigt eine Internetverbindung.',
      cloudVoiceUnavailable:'Azure online: derzeit nicht verfügbar.',
      cloudVoiceUnknown:'Azure online: Status nicht prüfbar. Die Erzeugung kann trotzdem versucht werden.',
      deviceVoiceAvailable:'Kostenlose Gerätestimme: auf diesem Gerät verfügbar.',
      deviceVoiceUnavailable:'Kostenlose Gerätestimme: auf diesem Gerät nicht verfügbar. Die Azure-Stimme oben kann trotzdem verwendet werden.',
      translationProblem:'Übersetzungsproblem melden', reportReason:'Grund',
      reportWrong:'Falsche Bedeutung', reportMissing:'Text fehlt', reportNames:'Namen oder Begriffe',
      reportOther:'Anderes', reportNote:'Hinweis (optional)', prepareEmail:'E-Mail vorbereiten',
      translatingPart:'Übersetze Abschnitt', translationComplete:'Vollständiger Artikel übersetzt.',
      aboutTitle:'Über World Revolution News', aboutIntro:'Unabhängige, mehrsprachige Nachrichten aus Bewegungen und sozialen Kämpfen – ohne Konto, Tracking oder personalisierte Werbung.',
      aboutPrinciples:'Die neue App verbindet aktuelle Meldungen, transparente Quellen, Übersetzungen, Audio, Termine, Lexikon, Solidarität und Zine-Werkzeuge in einer einhändig bedienbaren Oberfläche.',
      previewIsolation:'Diese Release-Kandidatin ist weiterhin von der veröffentlichten App getrennt.',
      statusOnline:'Verbindung', statusData:'Nachrichten geladen', statusEvents:'Termine geladen',
      statusSources:'Quellenprüfung', statusTranslation:'Übersetzungsdienst', statusOffline:'Offline-Cache',
      online:'Online', offline:'Offline', available:'Verfügbar', checking:'Wird geprüft …',
      storageIntro:'Alle persönlichen Listen und Einstellungen bleiben lokal auf diesem Gerät.',
      bookmarks:'Später lesen', zineItems:'Zine-Artikel', appSettings:'App-Einstellungen',
      exportBackup:'Sicherung exportieren', importBackup:'Sicherung importieren',
      clearReading:'Leselisten löschen', clearOffline:'Vorschau-Cache löschen',
      clearAll:'Alle lokalen App-Daten löschen', backupExported:'Sicherung heruntergeladen.',
      backupImported:'Sicherung importiert. Die Vorschau wird neu geladen.',
      invalidBackup:'Keine gültige World-Revolution-News-Sicherung.',
      clearReadingConfirm:'Später lesen, Gelesen, Lesepositionen und Zine wirklich löschen?',
      clearOfflineConfirm:'Nur die getrennten Vorschau-Caches löschen?',
      clearAllConfirm:'Alle lokalen World-Revolution-News-Daten auf diesem Gerät löschen?',
      selectedDataCleared:'Ausgewählte Daten wurden gelöscht.', close:'Schließen'
    },
    en: {
      themeOled:'OLED black', themeSoft:'Muted', themePink:'Pink', website:'Website', font200:'200%',
      systemStatus:'System status', localData:'Local data', advancedFilters:'More filters',
      sort:'Sort', newestFirst:'Newest first', oldestFirst:'Oldest first',
      sourceLanguage:'Source language', sourceOrigin:'Origin', contentFormat:'Format',
      exactSource:'Source', allLanguages:'All languages', allOrigins:'All origins',
      allFormats:'All formats', allSources:'All sources', cardsView:'Cards',
      compactView:'Compact', headlinesView:'Headlines', sourceProfile:'Source profile',
      newsFormat:'News', analysisFormat:'Analysis', commentaryFormat:'Commentary',
      interviewFormat:'Interview', pressReleaseFormat:'Press release',
      readArticles:'Read', readProgress:'Reading progress', continueReading:'Continue reading',
      city:'City', category:'Category', group:'Group', date:'Date',
      allCities:'All cities', allGroups:'All groups', allEventCategories:'All categories',
      nearMe:'Near me', locationOff:'Disable nearby', locationPrivate:'Your location stays on this device and is not stored.',
      locationUnavailable:'Location could not be determined.', map:'Map', route:'Route',
      calendar:'Calendar', remind:'Remind me', reminderSet:'Reminder saved',
      reminderRemoved:'Reminder removed', distance:'Distance',
      saveFilter:'Save filter', savedFilters:'Saved filters', filterSaved:'Event filter saved.',
      audioQueue:'Queue', favoritesOnly:'Favorites only', cloudPodcast:'Natural voice (online)',
      shortPodcast:'Short podcast', fullPodcast:'Full article', podcastGenerating:'Generating podcast …',
      podcastReady:'Podcast is ready to play.', podcastFailed:'Podcast could not be generated.',
      azureVoice:'Voice', onlineCostNotice:'Online generation uses the shared limited voice allowance.',
      cloudVoiceChecking:'Azure online: checking availability …',
      cloudVoiceAvailable:'Azure online: available. Requires an internet connection.',
      cloudVoiceUnavailable:'Azure online: currently unavailable.',
      cloudVoiceUnknown:'Azure online: status could not be checked. Generation can still be attempted.',
      deviceVoiceAvailable:'Free device voice: available on this device.',
      deviceVoiceUnavailable:'Free device voice: unavailable on this device. The Azure voice above can still be used.',
      translationProblem:'Report translation problem', reportReason:'Reason',
      reportWrong:'Wrong meaning', reportMissing:'Missing text', reportNames:'Names or terms',
      reportOther:'Other', reportNote:'Note (optional)', prepareEmail:'Prepare email',
      translatingPart:'Translating section', translationComplete:'Full article translated.',
      aboutTitle:'About World Revolution News', aboutIntro:'Independent multilingual news from movements and social struggles, without accounts, tracking or personalized ads.',
      aboutPrinciples:'The new app combines current news, transparent sources, translations, audio, events, a glossary, solidarity and Zine tools in a one-thumb interface.',
      previewIsolation:'This release candidate remains isolated from the published app.',
      statusOnline:'Connection', statusData:'News loaded', statusEvents:'Events loaded',
      statusSources:'Source verification', statusTranslation:'Translation service', statusOffline:'Offline cache',
      online:'Online', offline:'Offline', available:'Available', checking:'Checking …',
      storageIntro:'All personal lists and settings stay locally on this device.',
      bookmarks:'Read later', zineItems:'Zine articles', appSettings:'App settings',
      exportBackup:'Export backup', importBackup:'Import backup',
      clearReading:'Delete reading lists', clearOffline:'Delete preview cache',
      clearAll:'Delete all local app data', backupExported:'Backup downloaded.',
      backupImported:'Backup imported. The preview will reload.',
      invalidBackup:'Not a valid World Revolution News backup.',
      clearReadingConfirm:'Delete Read later, Read, reading positions and the Zine?',
      clearOfflineConfirm:'Delete only the isolated preview caches?',
      clearAllConfirm:'Delete all local World Revolution News data on this device?',
      selectedDataCleared:'Selected data was deleted.', close:'Close'
    },
    es: {
      themeOled:'Negro OLED', themeSoft:'Atenuado', themePink:'Rosa', website:'Sitio web', font200:'200 %',
      systemStatus:'Estado del sistema', localData:'Datos locales', advancedFilters:'Más filtros',
      sort:'Orden', newestFirst:'Más recientes primero', oldestFirst:'Más antiguos primero',
      sourceLanguage:'Idioma de origen', sourceOrigin:'Procedencia', contentFormat:'Formato',
      exactSource:'Fuente', allLanguages:'Todos los idiomas', allOrigins:'Todas las procedencias',
      allFormats:'Todos los formatos', allSources:'Todas las fuentes', cardsView:'Tarjetas',
      compactView:'Compacta', headlinesView:'Titulares', sourceProfile:'Perfil de la fuente',
      newsFormat:'Noticia', analysisFormat:'Análisis', commentaryFormat:'Comentario',
      interviewFormat:'Entrevista', pressReleaseFormat:'Comunicado de prensa',
      readArticles:'Leídos', readProgress:'Progreso de lectura', continueReading:'Seguir leyendo',
      city:'Ciudad', category:'Categoría', group:'Grupo', date:'Fecha',
      allCities:'Todas las ciudades', allGroups:'Todos los grupos', allEventCategories:'Todas las categorías',
      nearMe:'Cerca de mí', locationOff:'Desactivar proximidad', locationPrivate:'Tu ubicación permanece en este dispositivo y no se guarda.',
      locationUnavailable:'No se pudo determinar la ubicación.', map:'Mapa', route:'Ruta',
      calendar:'Calendario', remind:'Avisarme', reminderSet:'Recordatorio guardado',
      reminderRemoved:'Recordatorio eliminado', distance:'Distancia',
      saveFilter:'Guardar filtro', savedFilters:'Filtros guardados', filterSaved:'Filtro de eventos guardado.',
      audioQueue:'Cola', favoritesOnly:'Solo favoritos', cloudPodcast:'Voz natural (en línea)',
      shortPodcast:'Pódcast corto', fullPodcast:'Artículo completo', podcastGenerating:'Generando pódcast…',
      podcastReady:'El pódcast está listo para reproducirse.', podcastFailed:'No se pudo generar el pódcast.',
      azureVoice:'Voz', onlineCostNotice:'La generación en línea usa el cupo compartido y limitado de voces.',
      cloudVoiceChecking:'Azure en línea: comprobando disponibilidad…', cloudVoiceAvailable:'Azure en línea: disponible. Requiere conexión a internet.', cloudVoiceUnavailable:'Azure en línea: no disponible en este momento.', cloudVoiceUnknown:'Azure en línea: no se pudo comprobar el estado. Aun así puedes intentar la generación.', deviceVoiceAvailable:'Voz gratuita del dispositivo: disponible en este dispositivo.', deviceVoiceUnavailable:'Voz gratuita del dispositivo: no disponible en este dispositivo. La voz de Azure indicada arriba puede seguir utilizándose.',
      translationProblem:'Informar de un problema de traducción', reportReason:'Motivo',
      reportWrong:'Significado incorrecto', reportMissing:'Falta texto', reportNames:'Nombres o términos',
      reportOther:'Otro', reportNote:'Nota (opcional)', prepareEmail:'Preparar correo',
      translatingPart:'Traduciendo sección', translationComplete:'Artículo completo traducido.',
      aboutTitle:'Acerca de World Revolution News', aboutIntro:'Noticias independientes y multilingües de movimientos y luchas sociales, sin cuentas, seguimiento ni publicidad personalizada.',
      aboutPrinciples:'La nueva aplicación reúne noticias actuales, fuentes transparentes, traducciones, audio, eventos, glosario, solidaridad y herramientas Zine en una interfaz manejable con una mano.',
      previewIsolation:'Esta versión candidata sigue separada de la aplicación publicada.',
      statusOnline:'Conexión', statusData:'Noticias cargadas', statusEvents:'Eventos cargados',
      statusSources:'Verificación de fuentes', statusTranslation:'Servicio de traducción', statusOffline:'Caché sin conexión',
      online:'En línea', offline:'Sin conexión', available:'Disponible', checking:'Comprobando…',
      storageIntro:'Todas las listas y preferencias personales permanecen localmente en este dispositivo.',
      bookmarks:'Leer más tarde', zineItems:'Artículos del Zine', appSettings:'Ajustes de la aplicación',
      exportBackup:'Exportar copia', importBackup:'Importar copia',
      clearReading:'Borrar listas de lectura', clearOffline:'Borrar caché de vista previa',
      clearAll:'Borrar todos los datos locales', backupExported:'Copia descargada.',
      backupImported:'Copia importada. La vista previa se recargará.',
      invalidBackup:'No es una copia válida de World Revolution News.',
      clearReadingConfirm:'¿Borrar Leer más tarde, Leídos, posiciones de lectura y el Zine?',
      clearOfflineConfirm:'¿Borrar solo las cachés separadas de la vista previa?',
      clearAllConfirm:'¿Borrar todos los datos locales de World Revolution News de este dispositivo?',
      selectedDataCleared:'Se borraron los datos seleccionados.', close:'Cerrar'
    },
    fr: {
      themeOled:'Noir OLED', themeSoft:'Atténué', themePink:'Rose', website:'Site web', font200:'200 %',
      systemStatus:'État du système', localData:'Données locales', advancedFilters:'Plus de filtres',
      sort:'Tri', newestFirst:'Plus récents', oldestFirst:'Plus anciens',
      sourceLanguage:'Langue source', sourceOrigin:'Origine', contentFormat:'Format',
      exactSource:'Source', allLanguages:'Toutes les langues', allOrigins:'Toutes les origines',
      allFormats:'Tous les formats', allSources:'Toutes les sources', cardsView:'Cartes',
      compactView:'Compact', headlinesView:'Titres', sourceProfile:'Profil de la source',
      newsFormat:'Actualité', analysisFormat:'Analyse', commentaryFormat:'Commentaire',
      interviewFormat:'Entretien', pressReleaseFormat:'Communiqué de presse',
      readArticles:'Lus', readProgress:'Progression de lecture', continueReading:'Continuer la lecture',
      city:'Ville', category:'Catégorie', group:'Groupe', date:'Date',
      allCities:'Toutes les villes', allGroups:'Tous les groupes', allEventCategories:'Toutes les catégories',
      nearMe:'Près de moi', locationOff:'Désactiver la proximité', locationPrivate:'Votre position reste sur cet appareil et n’est pas enregistrée.',
      locationUnavailable:'La position n’a pas pu être déterminée.', map:'Carte', route:'Itinéraire',
      calendar:'Calendrier', remind:'Me rappeler', reminderSet:'Rappel enregistré',
      reminderRemoved:'Rappel supprimé', distance:'Distance',
      saveFilter:'Enregistrer le filtre', savedFilters:'Filtres enregistrés', filterSaved:'Filtre d’événements enregistré.',
      audioQueue:'File d’attente', favoritesOnly:'Favoris uniquement', cloudPodcast:'Voix naturelle (en ligne)',
      shortPodcast:'Podcast court', fullPodcast:'Article complet', podcastGenerating:'Création du podcast…',
      podcastReady:'Le podcast est prêt à être écouté.', podcastFailed:'Le podcast n’a pas pu être créé.',
      azureVoice:'Voix', onlineCostNotice:'La création en ligne utilise le quota vocal partagé et limité.',
      cloudVoiceChecking:'Azure en ligne : vérification de la disponibilité…', cloudVoiceAvailable:'Azure en ligne : disponible. Une connexion internet est nécessaire.', cloudVoiceUnavailable:'Azure en ligne : actuellement indisponible.', cloudVoiceUnknown:'Azure en ligne : état impossible à vérifier. La création peut tout de même être essayée.', deviceVoiceAvailable:'Voix gratuite de l’appareil : disponible sur cet appareil.', deviceVoiceUnavailable:'Voix gratuite de l’appareil : indisponible sur cet appareil. La voix Azure ci-dessus peut toujours être utilisée.',
      translationProblem:'Signaler un problème de traduction', reportReason:'Motif',
      reportWrong:'Sens incorrect', reportMissing:'Texte manquant', reportNames:'Noms ou termes',
      reportOther:'Autre', reportNote:'Note (facultative)', prepareEmail:'Préparer l’e-mail',
      translatingPart:'Traduction de la section', translationComplete:'Article complet traduit.',
      aboutTitle:'À propos de World Revolution News', aboutIntro:'Actualités indépendantes et multilingues issues des mouvements et des luttes sociales, sans compte, suivi ni publicité personnalisée.',
      aboutPrinciples:'La nouvelle application réunit actualités, sources transparentes, traductions, audio, événements, lexique, solidarité et outils Zine dans une interface utilisable d’une seule main.',
      previewIsolation:'Cette version candidate reste séparée de l’application publiée.',
      statusOnline:'Connexion', statusData:'Actualités chargées', statusEvents:'Événements chargés',
      statusSources:'Vérification des sources', statusTranslation:'Service de traduction', statusOffline:'Cache hors ligne',
      online:'En ligne', offline:'Hors ligne', available:'Disponible', checking:'Vérification…',
      storageIntro:'Toutes les listes et préférences personnelles restent localement sur cet appareil.',
      bookmarks:'À lire plus tard', zineItems:'Articles du Zine', appSettings:'Réglages de l’application',
      exportBackup:'Exporter la sauvegarde', importBackup:'Importer la sauvegarde',
      clearReading:'Supprimer les listes de lecture', clearOffline:'Supprimer le cache de prévisualisation',
      clearAll:'Supprimer toutes les données locales', backupExported:'Sauvegarde téléchargée.',
      backupImported:'Sauvegarde importée. La prévisualisation va être rechargée.',
      invalidBackup:'Cette sauvegarde World Revolution News n’est pas valide.',
      clearReadingConfirm:'Supprimer À lire plus tard, Lus, les positions de lecture et le Zine ?',
      clearOfflineConfirm:'Supprimer uniquement les caches séparés de la prévisualisation ?',
      clearAllConfirm:'Supprimer toutes les données locales de World Revolution News sur cet appareil ?',
      selectedDataCleared:'Les données sélectionnées ont été supprimées.', close:'Fermer'
    },
    it: {
      themeOled:'Nero OLED', themeSoft:'Attenuato', themePink:'Rosa', website:'Sito web', font200:'200 %',
      systemStatus:'Stato del sistema', localData:'Dati locali', advancedFilters:'Altri filtri',
      sort:'Ordinamento', newestFirst:'Più recenti', oldestFirst:'Più vecchi',
      sourceLanguage:'Lingua originale', sourceOrigin:'Provenienza', contentFormat:'Formato',
      exactSource:'Fonte', allLanguages:'Tutte le lingue', allOrigins:'Tutte le provenienze',
      allFormats:'Tutti i formati', allSources:'Tutte le fonti', cardsView:'Schede',
      compactView:'Compatta', headlinesView:'Titoli', sourceProfile:'Profilo della fonte',
      newsFormat:'Notizia', analysisFormat:'Analisi', commentaryFormat:'Commento',
      interviewFormat:'Intervista', pressReleaseFormat:'Comunicato stampa',
      readArticles:'Letti', readProgress:'Avanzamento lettura', continueReading:'Continua a leggere',
      city:'Città', category:'Categoria', group:'Gruppo', date:'Data',
      allCities:'Tutte le città', allGroups:'Tutti i gruppi', allEventCategories:'Tutte le categorie',
      nearMe:'Vicino a me', locationOff:'Disattiva vicinanza', locationPrivate:'La posizione resta su questo dispositivo e non viene salvata.',
      locationUnavailable:'Impossibile determinare la posizione.', map:'Mappa', route:'Percorso',
      calendar:'Calendario', remind:'Ricordamelo', reminderSet:'Promemoria salvato',
      reminderRemoved:'Promemoria rimosso', distance:'Distanza',
      saveFilter:'Salva filtro', savedFilters:'Filtri salvati', filterSaved:'Filtro eventi salvato.',
      audioQueue:'Coda', favoritesOnly:'Solo preferiti', cloudPodcast:'Voce naturale (online)',
      shortPodcast:'Podcast breve', fullPodcast:'Articolo completo', podcastGenerating:'Creazione del podcast…',
      podcastReady:'Il podcast è pronto per l’ascolto.', podcastFailed:'Impossibile creare il podcast.',
      azureVoice:'Voce', onlineCostNotice:'La creazione online usa il contingente vocale condiviso e limitato.',
      cloudVoiceChecking:'Azure online: verifica della disponibilità…', cloudVoiceAvailable:'Azure online: disponibile. Richiede una connessione a internet.', cloudVoiceUnavailable:'Azure online: al momento non disponibile.', cloudVoiceUnknown:'Azure online: stato non verificabile. Puoi comunque provare a generare l’audio.', deviceVoiceAvailable:'Voce gratuita del dispositivo: disponibile su questo dispositivo.', deviceVoiceUnavailable:'Voce gratuita del dispositivo: non disponibile su questo dispositivo. Puoi comunque usare la voce Azure qui sopra.',
      translationProblem:'Segnala un problema di traduzione', reportReason:'Motivo',
      reportWrong:'Significato errato', reportMissing:'Testo mancante', reportNames:'Nomi o termini',
      reportOther:'Altro', reportNote:'Nota (facoltativa)', prepareEmail:'Prepara e-mail',
      translatingPart:'Traduzione della sezione', translationComplete:'Articolo completo tradotto.',
      aboutTitle:'Informazioni su World Revolution News', aboutIntro:'Notizie indipendenti e multilingue da movimenti e lotte sociali, senza account, tracciamento o pubblicità personalizzata.',
      aboutPrinciples:'La nuova app riunisce notizie attuali, fonti trasparenti, traduzioni, audio, eventi, glossario, solidarietà e strumenti Zine in un’interfaccia utilizzabile con una mano.',
      previewIsolation:'Questa versione candidata resta separata dall’app pubblicata.',
      statusOnline:'Connessione', statusData:'Notizie caricate', statusEvents:'Eventi caricati',
      statusSources:'Verifica delle fonti', statusTranslation:'Servizio di traduzione', statusOffline:'Cache offline',
      online:'Online', offline:'Offline', available:'Disponibile', checking:'Verifica…',
      storageIntro:'Tutte le liste e impostazioni personali restano localmente su questo dispositivo.',
      bookmarks:'Leggi più tardi', zineItems:'Articoli Zine', appSettings:'Impostazioni dell’app',
      exportBackup:'Esporta backup', importBackup:'Importa backup',
      clearReading:'Elimina elenchi di lettura', clearOffline:'Elimina cache anteprima',
      clearAll:'Elimina tutti i dati locali', backupExported:'Backup scaricato.',
      backupImported:'Backup importato. L’anteprima verrà ricaricata.',
      invalidBackup:'Questo non è un backup valido di World Revolution News.',
      clearReadingConfirm:'Eliminare Leggi più tardi, Letti, posizioni di lettura e Zine?',
      clearOfflineConfirm:'Eliminare solo le cache separate dell’anteprima?',
      clearAllConfirm:'Eliminare tutti i dati locali di World Revolution News su questo dispositivo?',
      selectedDataCleared:'I dati selezionati sono stati eliminati.', close:'Chiudi'
    },
    pt: {
      themeOled:'Preto OLED', themeSoft:'Suave', themePink:'Rosa', website:'Site', font200:'200 %',
      systemStatus:'Estado do sistema', localData:'Dados locais', advancedFilters:'Mais filtros',
      sort:'Ordenação', newestFirst:'Mais recentes', oldestFirst:'Mais antigos',
      sourceLanguage:'Idioma de origem', sourceOrigin:'Origem', contentFormat:'Formato',
      exactSource:'Fonte', allLanguages:'Todos os idiomas', allOrigins:'Todas as origens',
      allFormats:'Todos os formatos', allSources:'Todas as fontes', cardsView:'Cartões',
      compactView:'Compacta', headlinesView:'Manchetes', sourceProfile:'Perfil da fonte',
      newsFormat:'Notícia', analysisFormat:'Análise', commentaryFormat:'Comentário',
      interviewFormat:'Entrevista', pressReleaseFormat:'Comunicado de imprensa',
      readArticles:'Lidos', readProgress:'Progresso de leitura', continueReading:'Continuar a ler',
      city:'Cidade', category:'Categoria', group:'Grupo', date:'Data',
      allCities:'Todas as cidades', allGroups:'Todos os grupos', allEventCategories:'Todas as categorias',
      nearMe:'Perto de mim', locationOff:'Desativar proximidade', locationPrivate:'A tua localização permanece neste dispositivo e não é guardada.',
      locationUnavailable:'Não foi possível determinar a localização.', map:'Mapa', route:'Rota',
      calendar:'Calendário', remind:'Lembrar-me', reminderSet:'Lembrete guardado',
      reminderRemoved:'Lembrete removido', distance:'Distância',
      saveFilter:'Guardar filtro', savedFilters:'Filtros guardados', filterSaved:'Filtro de eventos guardado.',
      audioQueue:'Fila', favoritesOnly:'Apenas favoritos', cloudPodcast:'Voz natural (online)',
      shortPodcast:'Podcast curto', fullPodcast:'Artigo completo', podcastGenerating:'A criar podcast…',
      podcastReady:'O podcast está pronto para reprodução.', podcastFailed:'Não foi possível criar o podcast.',
      azureVoice:'Voz', onlineCostNotice:'A criação online usa a quota partilhada e limitada de vozes.',
      cloudVoiceChecking:'Azure online: a verificar disponibilidade…', cloudVoiceAvailable:'Azure online: disponível. Requer ligação à internet.', cloudVoiceUnavailable:'Azure online: indisponível neste momento.', cloudVoiceUnknown:'Azure online: não foi possível verificar o estado. Ainda podes tentar gerar o áudio.', deviceVoiceAvailable:'Voz gratuita do dispositivo: disponível neste dispositivo.', deviceVoiceUnavailable:'Voz gratuita do dispositivo: indisponível neste dispositivo. A voz Azure acima continua disponível.',
      translationProblem:'Comunicar problema de tradução', reportReason:'Motivo',
      reportWrong:'Significado incorreto', reportMissing:'Texto em falta', reportNames:'Nomes ou termos',
      reportOther:'Outro', reportNote:'Nota (opcional)', prepareEmail:'Preparar e-mail',
      translatingPart:'A traduzir secção', translationComplete:'Artigo completo traduzido.',
      aboutTitle:'Sobre o World Revolution News', aboutIntro:'Notícias independentes e multilingues de movimentos e lutas sociais, sem contas, rastreio ou publicidade personalizada.',
      aboutPrinciples:'A nova aplicação reúne notícias atuais, fontes transparentes, traduções, áudio, eventos, glossário, solidariedade e ferramentas Zine numa interface utilizável com uma mão.',
      previewIsolation:'Esta versão candidata continua separada da aplicação publicada.',
      statusOnline:'Ligação', statusData:'Notícias carregadas', statusEvents:'Eventos carregados',
      statusSources:'Verificação de fontes', statusTranslation:'Serviço de tradução', statusOffline:'Cache offline',
      online:'Online', offline:'Offline', available:'Disponível', checking:'A verificar…',
      storageIntro:'Todas as listas e definições pessoais permanecem localmente neste dispositivo.',
      bookmarks:'Ler mais tarde', zineItems:'Artigos do Zine', appSettings:'Definições da aplicação',
      exportBackup:'Exportar cópia', importBackup:'Importar cópia',
      clearReading:'Eliminar listas de leitura', clearOffline:'Eliminar cache da pré-visualização',
      clearAll:'Eliminar todos os dados locais', backupExported:'Cópia transferida.',
      backupImported:'Cópia importada. A pré-visualização será recarregada.',
      invalidBackup:'Esta não é uma cópia válida do World Revolution News.',
      clearReadingConfirm:'Eliminar Ler mais tarde, Lidos, posições de leitura e o Zine?',
      clearOfflineConfirm:'Eliminar apenas as caches separadas da pré-visualização?',
      clearAllConfirm:'Eliminar todos os dados locais do World Revolution News neste dispositivo?',
      selectedDataCleared:'Os dados selecionados foram eliminados.', close:'Fechar'
    },
    ru: {
      themeOled:'Чёрный OLED', themeSoft:'Приглушённая', themePink:'Розовая', website:'Сайт', font200:'200 %',
      systemStatus:'Состояние системы', localData:'Локальные данные', advancedFilters:'Дополнительные фильтры',
      sort:'Сортировка', newestFirst:'Сначала новые', oldestFirst:'Сначала старые',
      sourceLanguage:'Язык источника', sourceOrigin:'Происхождение', contentFormat:'Формат',
      exactSource:'Источник', allLanguages:'Все языки', allOrigins:'Все регионы происхождения',
      allFormats:'Все форматы', allSources:'Все источники', cardsView:'Карточки',
      compactView:'Компактно', headlinesView:'Заголовки', sourceProfile:'Профиль источника',
      newsFormat:'Новость', analysisFormat:'Анализ', commentaryFormat:'Комментарий',
      interviewFormat:'Интервью', pressReleaseFormat:'Пресс-релиз',
      readArticles:'Прочитано', readProgress:'Прогресс чтения', continueReading:'Продолжить чтение',
      city:'Город', category:'Категория', group:'Группа', date:'Дата',
      allCities:'Все города', allGroups:'Все группы', allEventCategories:'Все категории',
      nearMe:'Рядом со мной', locationOff:'Отключить поиск рядом', locationPrivate:'Местоположение остаётся на этом устройстве и не сохраняется.',
      locationUnavailable:'Не удалось определить местоположение.', map:'Карта', route:'Маршрут',
      calendar:'Календарь', remind:'Напомнить', reminderSet:'Напоминание сохранено',
      reminderRemoved:'Напоминание удалено', distance:'Расстояние',
      saveFilter:'Сохранить фильтр', savedFilters:'Сохранённые фильтры', filterSaved:'Фильтр событий сохранён.',
      audioQueue:'Очередь', favoritesOnly:'Только избранное', cloudPodcast:'Естественный голос (онлайн)',
      shortPodcast:'Короткий подкаст', fullPodcast:'Полная статья', podcastGenerating:'Создание подкаста…',
      podcastReady:'Подкаст готов к воспроизведению.', podcastFailed:'Не удалось создать подкаст.',
      azureVoice:'Голос', onlineCostNotice:'Онлайн-создание использует общий ограниченный голосовой ресурс.',
      cloudVoiceChecking:'Azure онлайн: проверка доступности…', cloudVoiceAvailable:'Azure онлайн: доступен. Требуется подключение к интернету.', cloudVoiceUnavailable:'Azure онлайн: сейчас недоступен.', cloudVoiceUnknown:'Azure онлайн: не удалось проверить состояние. Создание аудио всё равно можно запустить.', deviceVoiceAvailable:'Бесплатный голос устройства: доступен на этом устройстве.', deviceVoiceUnavailable:'Бесплатный голос устройства: недоступен на этом устройстве. Голос Azure выше по-прежнему можно использовать.',
      translationProblem:'Сообщить о проблеме перевода', reportReason:'Причина',
      reportWrong:'Неверный смысл', reportMissing:'Отсутствует текст', reportNames:'Имена или термины',
      reportOther:'Другое', reportNote:'Примечание (необязательно)', prepareEmail:'Подготовить письмо',
      translatingPart:'Перевод раздела', translationComplete:'Полная статья переведена.',
      aboutTitle:'О World Revolution News', aboutIntro:'Независимые многоязычные новости движений и социальной борьбы без аккаунтов, отслеживания и персонализированной рекламы.',
      aboutPrinciples:'Новое приложение объединяет актуальные новости, прозрачные источники, переводы, аудио, события, словарь, солидарность и инструменты Zine в интерфейсе для управления одной рукой.',
      previewIsolation:'Эта версия-кандидат по-прежнему отделена от опубликованного приложения.',
      statusOnline:'Соединение', statusData:'Новостей загружено', statusEvents:'Событий загружено',
      statusSources:'Проверка источников', statusTranslation:'Служба перевода', statusOffline:'Офлайн-кэш',
      online:'Онлайн', offline:'Офлайн', available:'Доступно', checking:'Проверка…',
      storageIntro:'Все личные списки и настройки хранятся локально на этом устройстве.',
      bookmarks:'Прочитать позже', zineItems:'Статьи Zine', appSettings:'Настройки приложения',
      exportBackup:'Экспортировать копию', importBackup:'Импортировать копию',
      clearReading:'Удалить списки чтения', clearOffline:'Удалить кэш предпросмотра',
      clearAll:'Удалить все локальные данные', backupExported:'Копия загружена.',
      backupImported:'Копия импортирована. Предпросмотр будет перезагружен.',
      invalidBackup:'Это недействительная копия World Revolution News.',
      clearReadingConfirm:'Удалить «Прочитать позже», прочитанные статьи, позиции чтения и Zine?',
      clearOfflineConfirm:'Удалить только отдельные кэши предпросмотра?',
      clearAllConfirm:'Удалить все локальные данные World Revolution News на этом устройстве?',
      selectedDataCleared:'Выбранные данные удалены.', close:'Закрыть'
    },
    el: {
      themeOled:'Μαύρο OLED', themeSoft:'Ήπιο', themePink:'Ροζ', website:'Ιστότοπος', font200:'200 %',
      systemStatus:'Κατάσταση συστήματος', localData:'Τοπικά δεδομένα', advancedFilters:'Περισσότερα φίλτρα',
      sort:'Ταξινόμηση', newestFirst:'Νεότερα πρώτα', oldestFirst:'Παλαιότερα πρώτα',
      sourceLanguage:'Γλώσσα πηγής', sourceOrigin:'Προέλευση', contentFormat:'Μορφή',
      exactSource:'Πηγή', allLanguages:'Όλες οι γλώσσες', allOrigins:'Όλες οι προελεύσεις',
      allFormats:'Όλες οι μορφές', allSources:'Όλες οι πηγές', cardsView:'Κάρτες',
      compactView:'Συμπαγής', headlinesView:'Τίτλοι', sourceProfile:'Προφίλ πηγής',
      newsFormat:'Είδηση', analysisFormat:'Ανάλυση', commentaryFormat:'Σχόλιο',
      interviewFormat:'Συνέντευξη', pressReleaseFormat:'Δελτίο Τύπου',
      readArticles:'Διαβασμένα', readProgress:'Πρόοδος ανάγνωσης', continueReading:'Συνέχεια ανάγνωσης',
      city:'Πόλη', category:'Κατηγορία', group:'Ομάδα', date:'Ημερομηνία',
      allCities:'Όλες οι πόλεις', allGroups:'Όλες οι ομάδες', allEventCategories:'Όλες οι κατηγορίες',
      nearMe:'Κοντά μου', locationOff:'Απενεργοποίηση εγγύτητας', locationPrivate:'Η τοποθεσία παραμένει σε αυτή τη συσκευή και δεν αποθηκεύεται.',
      locationUnavailable:'Δεν ήταν δυνατός ο προσδιορισμός της τοποθεσίας.', map:'Χάρτης', route:'Διαδρομή',
      calendar:'Ημερολόγιο', remind:'Υπενθύμιση', reminderSet:'Η υπενθύμιση αποθηκεύτηκε',
      reminderRemoved:'Η υπενθύμιση αφαιρέθηκε', distance:'Απόσταση',
      saveFilter:'Αποθήκευση φίλτρου', savedFilters:'Αποθηκευμένα φίλτρα', filterSaved:'Το φίλτρο εκδηλώσεων αποθηκεύτηκε.',
      audioQueue:'Ουρά', favoritesOnly:'Μόνο αγαπημένα', cloudPodcast:'Φυσική φωνή (online)',
      shortPodcast:'Σύντομο podcast', fullPodcast:'Πλήρες άρθρο', podcastGenerating:'Δημιουργία podcast…',
      podcastReady:'Το podcast είναι έτοιμο για αναπαραγωγή.', podcastFailed:'Δεν ήταν δυνατή η δημιουργία του podcast.',
      azureVoice:'Φωνή', onlineCostNotice:'Η online δημιουργία χρησιμοποιεί το κοινό περιορισμένο όριο φωνής.',
      cloudVoiceChecking:'Azure online: έλεγχος διαθεσιμότητας…', cloudVoiceAvailable:'Azure online: διαθέσιμο. Απαιτεί σύνδεση στο διαδίκτυο.', cloudVoiceUnavailable:'Azure online: προσωρινά μη διαθέσιμο.', cloudVoiceUnknown:'Azure online: δεν ήταν δυνατός ο έλεγχος. Μπορείτε παρ’ όλα αυτά να δοκιμάσετε τη δημιουργία.', deviceVoiceAvailable:'Δωρεάν φωνή συσκευής: διαθέσιμη σε αυτή τη συσκευή.', deviceVoiceUnavailable:'Δωρεάν φωνή συσκευής: μη διαθέσιμη σε αυτή τη συσκευή. Η φωνή Azure παραπάνω μπορεί ακόμη να χρησιμοποιηθεί.',
      translationProblem:'Αναφορά προβλήματος μετάφρασης', reportReason:'Αιτία',
      reportWrong:'Λανθασμένο νόημα', reportMissing:'Λείπει κείμενο', reportNames:'Ονόματα ή όροι',
      reportOther:'Άλλο', reportNote:'Σημείωση (προαιρετικά)', prepareEmail:'Προετοιμασία email',
      translatingPart:'Μετάφραση ενότητας', translationComplete:'Μεταφράστηκε ολόκληρο το άρθρο.',
      aboutTitle:'Σχετικά με το World Revolution News', aboutIntro:'Ανεξάρτητες, πολύγλωσσες ειδήσεις από κινήματα και κοινωνικούς αγώνες, χωρίς λογαριασμούς, παρακολούθηση ή εξατομικευμένες διαφημίσεις.',
      aboutPrinciples:'Η νέα εφαρμογή συνδυάζει τρέχουσες ειδήσεις, διαφανείς πηγές, μεταφράσεις, ήχο, εκδηλώσεις, λεξικό, αλληλεγγύη και εργαλεία Zine σε διεπαφή για χρήση με ένα χέρι.',
      previewIsolation:'Αυτή η υποψήφια έκδοση παραμένει χωριστή από τη δημοσιευμένη εφαρμογή.',
      statusOnline:'Σύνδεση', statusData:'Ειδήσεις που φορτώθηκαν', statusEvents:'Εκδηλώσεις που φορτώθηκαν',
      statusSources:'Έλεγχος πηγών', statusTranslation:'Υπηρεσία μετάφρασης', statusOffline:'Μνήμη εκτός σύνδεσης',
      online:'Online', offline:'Εκτός σύνδεσης', available:'Διαθέσιμο', checking:'Έλεγχος…',
      storageIntro:'Όλες οι προσωπικές λίστες και ρυθμίσεις παραμένουν τοπικά σε αυτή τη συσκευή.',
      bookmarks:'Ανάγνωση αργότερα', zineItems:'Άρθρα Zine', appSettings:'Ρυθμίσεις εφαρμογής',
      exportBackup:'Εξαγωγή αντιγράφου', importBackup:'Εισαγωγή αντιγράφου',
      clearReading:'Διαγραφή λιστών ανάγνωσης', clearOffline:'Διαγραφή μνήμης προεπισκόπησης',
      clearAll:'Διαγραφή όλων των τοπικών δεδομένων', backupExported:'Το αντίγραφο λήφθηκε.',
      backupImported:'Το αντίγραφο εισήχθη. Η προεπισκόπηση θα φορτωθεί ξανά.',
      invalidBackup:'Δεν είναι έγκυρο αντίγραφο του World Revolution News.',
      clearReadingConfirm:'Να διαγραφούν οι λίστες ανάγνωσης, τα διαβασμένα, οι θέσεις ανάγνωσης και το Zine;',
      clearOfflineConfirm:'Να διαγραφούν μόνο οι ξεχωριστές μνήμες προεπισκόπησης;',
      clearAllConfirm:'Να διαγραφούν όλα τα τοπικά δεδομένα World Revolution News από αυτή τη συσκευή;',
      selectedDataCleared:'Τα επιλεγμένα δεδομένα διαγράφηκαν.', close:'Κλείσιμο'
    },
    tr: {
      themeOled:'OLED siyahı', themeSoft:'Yumuşak', themePink:'Pembe', website:'Web sitesi', font200:'%200',
      systemStatus:'Sistem durumu', localData:'Yerel veriler', advancedFilters:'Daha fazla filtre',
      sort:'Sıralama', newestFirst:'Önce en yeniler', oldestFirst:'Önce en eskiler',
      sourceLanguage:'Kaynak dili', sourceOrigin:'Köken', contentFormat:'Biçim',
      exactSource:'Kaynak', allLanguages:'Tüm diller', allOrigins:'Tüm kökenler',
      allFormats:'Tüm biçimler', allSources:'Tüm kaynaklar', cardsView:'Kartlar',
      compactView:'Kompakt', headlinesView:'Başlıklar', sourceProfile:'Kaynak profili',
      newsFormat:'Haber', analysisFormat:'Analiz', commentaryFormat:'Yorum',
      interviewFormat:'Röportaj', pressReleaseFormat:'Basın açıklaması',
      readArticles:'Okunanlar', readProgress:'Okuma ilerlemesi', continueReading:'Okumaya devam et',
      city:'Şehir', category:'Kategori', group:'Grup', date:'Tarih',
      allCities:'Tüm şehirler', allGroups:'Tüm gruplar', allEventCategories:'Tüm kategoriler',
      nearMe:'Yakınımda', locationOff:'Yakınlığı kapat', locationPrivate:'Konumunuz bu cihazda kalır ve kaydedilmez.',
      locationUnavailable:'Konum belirlenemedi.', map:'Harita', route:'Rota',
      calendar:'Takvim', remind:'Hatırlat', reminderSet:'Hatırlatıcı kaydedildi',
      reminderRemoved:'Hatırlatıcı kaldırıldı', distance:'Mesafe',
      saveFilter:'Filtreyi kaydet', savedFilters:'Kayıtlı filtreler', filterSaved:'Etkinlik filtresi kaydedildi.',
      audioQueue:'Sıra', favoritesOnly:'Yalnızca favoriler', cloudPodcast:'Doğal ses (çevrimiçi)',
      shortPodcast:'Kısa podcast', fullPodcast:'Tam makale', podcastGenerating:'Podcast oluşturuluyor…',
      podcastReady:'Podcast oynatılmaya hazır.', podcastFailed:'Podcast oluşturulamadı.',
      azureVoice:'Ses', onlineCostNotice:'Çevrimiçi üretim ortak ve sınırlı ses kotasını kullanır.',
      cloudVoiceChecking:'Azure çevrimiçi: kullanılabilirlik denetleniyor…', cloudVoiceAvailable:'Azure çevrimiçi: kullanılabilir. İnternet bağlantısı gerekir.', cloudVoiceUnavailable:'Azure çevrimiçi: şu anda kullanılamıyor.', cloudVoiceUnknown:'Azure çevrimiçi: durum denetlenemedi. Yine de ses üretmeyi deneyebilirsiniz.', deviceVoiceAvailable:'Ücretsiz cihaz sesi: bu cihazda kullanılabilir.', deviceVoiceUnavailable:'Ücretsiz cihaz sesi: bu cihazda kullanılamıyor. Yukarıdaki Azure sesi yine de kullanılabilir.',
      translationProblem:'Çeviri sorunu bildir', reportReason:'Neden',
      reportWrong:'Yanlış anlam', reportMissing:'Eksik metin', reportNames:'Adlar veya terimler',
      reportOther:'Diğer', reportNote:'Not (isteğe bağlı)', prepareEmail:'E-posta hazırla',
      translatingPart:'Bölüm çevriliyor', translationComplete:'Makalenin tamamı çevrildi.',
      aboutTitle:'World Revolution News hakkında', aboutIntro:'Hesap, takip veya kişiselleştirilmiş reklam olmadan hareketlerden ve toplumsal mücadelelerden bağımsız, çok dilli haberler.',
      aboutPrinciples:'Yeni uygulama güncel haberleri, şeffaf kaynakları, çevirileri, sesi, etkinlikleri, sözlüğü, dayanışmayı ve Zine araçlarını tek elle kullanılabilen bir arayüzde birleştirir.',
      previewIsolation:'Bu sürüm adayı yayımlanmış uygulamadan ayrı kalmaya devam eder.',
      statusOnline:'Bağlantı', statusData:'Yüklenen haberler', statusEvents:'Yüklenen etkinlikler',
      statusSources:'Kaynak doğrulama', statusTranslation:'Çeviri hizmeti', statusOffline:'Çevrimdışı önbellek',
      online:'Çevrimiçi', offline:'Çevrimdışı', available:'Kullanılabilir', checking:'Kontrol ediliyor…',
      storageIntro:'Tüm kişisel listeler ve ayarlar bu cihazda yerel olarak kalır.',
      bookmarks:'Daha sonra oku', zineItems:'Zine makaleleri', appSettings:'Uygulama ayarları',
      exportBackup:'Yedeği dışa aktar', importBackup:'Yedeği içe aktar',
      clearReading:'Okuma listelerini sil', clearOffline:'Önizleme önbelleğini sil',
      clearAll:'Tüm yerel verileri sil', backupExported:'Yedek indirildi.',
      backupImported:'Yedek içe aktarıldı. Önizleme yeniden yüklenecek.',
      invalidBackup:'Geçerli bir World Revolution News yedeği değil.',
      clearReadingConfirm:'Daha sonra oku, Okunanlar, okuma konumları ve Zine silinsin mi?',
      clearOfflineConfirm:'Yalnızca ayrı önizleme önbellekleri silinsin mi?',
      clearAllConfirm:'Bu cihazdaki tüm yerel World Revolution News verileri silinsin mi?',
      selectedDataCleared:'Seçilen veriler silindi.', close:'Kapat'
    }
  };

  const PODCAST_LIBRARY_COPY = {
    de: { podcastSeries:'Podcast-Reihen', radioShows:'Radio-Sendungen', liveRadio:'Live-Radio', podcastLanguages:'Sprachen', allLanguages:'Alle Sprachen', podcastSource:'Podcastquelle', allPodcastSources:'Alle Podcastquellen', independentQuota:'Bis zu 30 Folgen je Sprache · ausgewogen nach Podcastreihe', radioQuota:'Bis zu 50 Radiofolgen · getrennt von den Podcast-Reihen', loadingAllEvents:'Alle aktuellen Radar.squat-Termine werden nachgeladen …', allEventsReady:'Vollständiger Radar-Terminbestand geladen' },
    en: { podcastSeries:'Podcast series', radioShows:'Radio programmes', liveRadio:'Live radio', podcastLanguages:'Languages', allLanguages:'All languages', podcastSource:'Podcast source', allPodcastSources:'All podcast sources', independentQuota:'Up to 30 episodes per language · balanced by podcast series', radioQuota:'Up to 50 radio episodes · separate from podcast series', loadingAllEvents:'Loading all current Radar.squat events …', allEventsReady:'Complete Radar event collection loaded' },
    es: { podcastSeries:'Series de pódcast', radioShows:'Programas de radio', liveRadio:'Radio en directo', podcastLanguages:'Idiomas', allLanguages:'Todos los idiomas', podcastSource:'Fuente del pódcast', allPodcastSources:'Todas las fuentes', independentQuota:'Hasta 30 episodios por idioma · equilibrados por serie', radioQuota:'Hasta 50 programas de radio · separados de las series de pódcast', loadingAllEvents:'Cargando todos los eventos actuales de Radar.squat …', allEventsReady:'Colección completa de eventos de Radar cargada' },
    fr: { podcastSeries:'Séries de podcasts', radioShows:'Émissions de radio', liveRadio:'Radio en direct', podcastLanguages:'Langues', allLanguages:'Toutes les langues', podcastSource:'Source du podcast', allPodcastSources:'Toutes les sources', independentQuota:'Jusqu’à 30 épisodes par langue · équilibrés par série', radioQuota:'Jusqu’à 50 émissions de radio · séparées des séries de podcasts', loadingAllEvents:'Chargement de tous les événements actuels de Radar.squat …', allEventsReady:'Collection complète des événements Radar chargée' },
    it: { podcastSeries:'Serie podcast', radioShows:'Programmi radio', liveRadio:'Radio in diretta', podcastLanguages:'Lingue', allLanguages:'Tutte le lingue', podcastSource:'Fonte podcast', allPodcastSources:'Tutte le fonti', independentQuota:'Fino a 30 episodi per lingua · bilanciati per serie', radioQuota:'Fino a 50 programmi radio · separati dalle serie podcast', loadingAllEvents:'Caricamento di tutti gli eventi attuali di Radar.squat …', allEventsReady:'Raccolta completa degli eventi Radar caricata' },
    pt: { podcastSeries:'Séries de podcasts', radioShows:'Programas de rádio', liveRadio:'Rádio em direto', podcastLanguages:'Idiomas', allLanguages:'Todos os idiomas', podcastSource:'Fonte do podcast', allPodcastSources:'Todas as fontes', independentQuota:'Até 30 episódios por idioma · equilibrados por série', radioQuota:'Até 50 programas de rádio · separados das séries de podcasts', loadingAllEvents:'A carregar todos os eventos atuais do Radar.squat …', allEventsReady:'Coleção completa de eventos Radar carregada' },
    ru: { podcastSeries:'Серии подкастов', radioShows:'Радиопередачи', liveRadio:'Радио в эфире', podcastLanguages:'Языки', allLanguages:'Все языки', podcastSource:'Источник подкаста', allPodcastSources:'Все источники', independentQuota:'До 30 выпусков на язык · сбалансировано по сериям', radioQuota:'До 50 радиопередач · отдельно от серий подкастов', loadingAllEvents:'Загружаются все актуальные события Radar.squat …', allEventsReady:'Полная коллекция событий Radar загружена' },
    el: { podcastSeries:'Σειρές podcast', radioShows:'Ραδιοφωνικές εκπομπές', liveRadio:'Ζωντανό ραδιόφωνο', podcastLanguages:'Γλώσσες', allLanguages:'Όλες οι γλώσσες', podcastSource:'Πηγή podcast', allPodcastSources:'Όλες οι πηγές', independentQuota:'Έως 30 επεισόδια ανά γλώσσα · ισορροπημένα ανά σειρά', radioQuota:'Έως 50 ραδιοφωνικές εκπομπές · χωριστά από τις σειρές podcast', loadingAllEvents:'Φόρτωση όλων των τρεχουσών εκδηλώσεων Radar.squat …', allEventsReady:'Φορτώθηκε η πλήρης συλλογή εκδηλώσεων Radar' },
    tr: { podcastSeries:'Podcast dizileri', radioShows:'Radyo programları', liveRadio:'Canlı radyo', podcastLanguages:'Diller', allLanguages:'Tüm diller', podcastSource:'Podcast kaynağı', allPodcastSources:'Tüm podcast kaynakları', independentQuota:'Dil başına en fazla 30 bölüm · podcast dizilerine göre dengeli', radioQuota:'En fazla 50 radyo programı · podcast dizilerinden ayrı', loadingAllEvents:'Tüm güncel Radar.squat etkinlikleri yükleniyor …', allEventsReady:'Radar etkinliklerinin tamamı yüklendi' }
  };
  Object.entries(PODCAST_LIBRARY_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const ZINE_EDITOR_COPY = {
    de: { zineAddText:'Eigenen Text einfügen', zineAddImage:'Eigenes Bild einfügen', zineEdit:'Bearbeiten', zineEditorTitle:'Zine-Inhalt bearbeiten', zineType:'Inhaltstyp', zineArticleType:'Artikel', zineTextType:'Nur Text', zineImageType:'Nur Bild', zineItemTitle:'Titel (optional)', zineItemSource:'Quelle / Vermerk (optional)', zineItemText:'Text', zineImageUrl:'Bildadresse (optional)', zineImageFile:'Bild vom Gerät', zineSaveItem:'Inhalt speichern', zineMoveUp:'Nach oben', zineMoveDown:'Nach unten', zineImageTooLarge:'Das Bild ist zu groß. Maximal 900 KB.', zineSaved:'Zine-Inhalt gespeichert.' },
    en: { zineAddText:'Add your own text', zineAddImage:'Add your own image', zineEdit:'Edit', zineEditorTitle:'Edit zine content', zineType:'Content type', zineArticleType:'Article', zineTextType:'Text only', zineImageType:'Image only', zineItemTitle:'Title (optional)', zineItemSource:'Source / note (optional)', zineItemText:'Text', zineImageUrl:'Image URL (optional)', zineImageFile:'Image from device', zineSaveItem:'Save content', zineMoveUp:'Move up', zineMoveDown:'Move down', zineImageTooLarge:'The image is too large. Maximum 900 KB.', zineSaved:'Zine content saved.' },
    es: { zineAddText:'Añadir texto propio', zineAddImage:'Añadir imagen propia', zineEdit:'Editar', zineEditorTitle:'Editar contenido del zine', zineType:'Tipo de contenido', zineArticleType:'Artículo', zineTextType:'Solo texto', zineImageType:'Solo imagen', zineItemTitle:'Título (opcional)', zineItemSource:'Fuente / nota (opcional)', zineItemText:'Texto', zineImageUrl:'URL de imagen (opcional)', zineImageFile:'Imagen del dispositivo', zineSaveItem:'Guardar contenido', zineMoveUp:'Subir', zineMoveDown:'Bajar', zineImageTooLarge:'La imagen es demasiado grande. Máximo 900 KB.', zineSaved:'Contenido guardado.' },
    fr: { zineAddText:'Ajouter votre texte', zineAddImage:'Ajouter votre image', zineEdit:'Modifier', zineEditorTitle:'Modifier le contenu du zine', zineType:'Type de contenu', zineArticleType:'Article', zineTextType:'Texte seul', zineImageType:'Image seule', zineItemTitle:'Titre (facultatif)', zineItemSource:'Source / note (facultatif)', zineItemText:'Texte', zineImageUrl:'Adresse de l’image (facultatif)', zineImageFile:'Image de l’appareil', zineSaveItem:'Enregistrer', zineMoveUp:'Monter', zineMoveDown:'Descendre', zineImageTooLarge:'Image trop volumineuse. Maximum 900 Ko.', zineSaved:'Contenu enregistré.' },
    it: { zineAddText:'Aggiungi testo', zineAddImage:'Aggiungi immagine', zineEdit:'Modifica', zineEditorTitle:'Modifica contenuto zine', zineType:'Tipo di contenuto', zineArticleType:'Articolo', zineTextType:'Solo testo', zineImageType:'Solo immagine', zineItemTitle:'Titolo (facoltativo)', zineItemSource:'Fonte / nota (facoltativa)', zineItemText:'Testo', zineImageUrl:'URL immagine (facoltativo)', zineImageFile:'Immagine dal dispositivo', zineSaveItem:'Salva', zineMoveUp:'Sposta su', zineMoveDown:'Sposta giù', zineImageTooLarge:'Immagine troppo grande. Massimo 900 KB.', zineSaved:'Contenuto salvato.' },
    pt: { zineAddText:'Adicionar texto', zineAddImage:'Adicionar imagem', zineEdit:'Editar', zineEditorTitle:'Editar conteúdo do zine', zineType:'Tipo de conteúdo', zineArticleType:'Artigo', zineTextType:'Só texto', zineImageType:'Só imagem', zineItemTitle:'Título (opcional)', zineItemSource:'Fonte / nota (opcional)', zineItemText:'Texto', zineImageUrl:'URL da imagem (opcional)', zineImageFile:'Imagem do dispositivo', zineSaveItem:'Guardar', zineMoveUp:'Mover para cima', zineMoveDown:'Mover para baixo', zineImageTooLarge:'Imagem demasiado grande. Máximo 900 KB.', zineSaved:'Conteúdo guardado.' },
    ru: { zineAddText:'Добавить свой текст', zineAddImage:'Добавить изображение', zineEdit:'Изменить', zineEditorTitle:'Редактировать зин', zineType:'Тип содержимого', zineArticleType:'Статья', zineTextType:'Только текст', zineImageType:'Только изображение', zineItemTitle:'Заголовок (необязательно)', zineItemSource:'Источник / примечание', zineItemText:'Текст', zineImageUrl:'Адрес изображения', zineImageFile:'Изображение с устройства', zineSaveItem:'Сохранить', zineMoveUp:'Выше', zineMoveDown:'Ниже', zineImageTooLarge:'Изображение слишком большое. Максимум 900 КБ.', zineSaved:'Содержимое сохранено.' },
    el: { zineAddText:'Προσθήκη κειμένου', zineAddImage:'Προσθήκη εικόνας', zineEdit:'Επεξεργασία', zineEditorTitle:'Επεξεργασία zine', zineType:'Τύπος περιεχομένου', zineArticleType:'Άρθρο', zineTextType:'Μόνο κείμενο', zineImageType:'Μόνο εικόνα', zineItemTitle:'Τίτλος (προαιρετικά)', zineItemSource:'Πηγή / σημείωση', zineItemText:'Κείμενο', zineImageUrl:'Διεύθυνση εικόνας', zineImageFile:'Εικόνα από συσκευή', zineSaveItem:'Αποθήκευση', zineMoveUp:'Πάνω', zineMoveDown:'Κάτω', zineImageTooLarge:'Η εικόνα είναι πολύ μεγάλη. Μέγιστο 900 KB.', zineSaved:'Το περιεχόμενο αποθηκεύτηκε.' },
    tr: { zineAddText:'Kendi metnini ekle', zineAddImage:'Kendi görselini ekle', zineEdit:'Düzenle', zineEditorTitle:'Zine içeriğini düzenle', zineType:'İçerik türü', zineArticleType:'Makale', zineTextType:'Yalnızca metin', zineImageType:'Yalnızca görsel', zineItemTitle:'Başlık (isteğe bağlı)', zineItemSource:'Kaynak / not', zineItemText:'Metin', zineImageUrl:'Görsel adresi', zineImageFile:'Cihazdan görsel', zineSaveItem:'Kaydet', zineMoveUp:'Yukarı', zineMoveDown:'Aşağı', zineImageTooLarge:'Görsel çok büyük. En fazla 900 KB.', zineSaved:'İçerik kaydedildi.' }
  };
  Object.entries(ZINE_EDITOR_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const PODCAST_SERVICE_COPY = {
    de: { generatedChecking:'Audio-Dienst wird geprüft …', generatedUnavailable:'Der Audio-Dienst ist derzeit nicht erreichbar. Die gespeicherten Einträge bleiben sichtbar; Abspielen und Erzeugen sind bis zur Wiederherstellung des Worker-/R2-Dienstes deaktiviert.', generatedUnavailableShort:'Audio derzeit nicht verfügbar.' },
    en: { generatedChecking:'Checking the audio service …', generatedUnavailable:'The audio service is currently unavailable. Stored entries remain visible; playback and generation are disabled until the Worker/R2 service is restored.', generatedUnavailableShort:'Audio is currently unavailable.' },
    es: { generatedChecking:'Comprobando el servicio de audio …', generatedUnavailable:'El servicio de audio no está disponible. Las entradas guardadas siguen visibles; la reproducción y creación quedan desactivadas hasta restaurar Worker/R2.' },
    fr: { generatedChecking:'Vérification du service audio …', generatedUnavailable:'Le service audio est indisponible. Les entrées restent visibles ; lecture et création sont désactivées jusqu’au rétablissement du service Worker/R2.' },
    it: { generatedChecking:'Verifica del servizio audio …', generatedUnavailable:'Il servizio audio non è disponibile. Le voci restano visibili; riproduzione e creazione sono disattivate fino al ripristino di Worker/R2.' },
    pt: { generatedChecking:'A verificar o serviço de áudio …', generatedUnavailable:'O serviço de áudio está indisponível. As entradas continuam visíveis; reprodução e criação ficam desativadas até restaurar Worker/R2.' },
    ru: { generatedChecking:'Проверка аудиосервиса …', generatedUnavailable:'Аудиосервис недоступен. Сохранённые записи остаются видимыми; воспроизведение и создание отключены до восстановления Worker/R2.' },
    el: { generatedChecking:'Έλεγχος υπηρεσίας ήχου …', generatedUnavailable:'Η υπηρεσία ήχου δεν είναι διαθέσιμη. Οι εγγραφές παραμένουν ορατές· η αναπαραγωγή και δημιουργία απενεργοποιούνται μέχρι την αποκατάσταση Worker/R2.' },
    tr: { generatedChecking:'Ses hizmeti kontrol ediliyor …', generatedUnavailable:'Ses hizmetine ulaşılamıyor. Kayıtlar görünür kalır; Worker/R2 yeniden çalışana kadar oynatma ve oluşturma devre dışıdır.' }
  };
  Object.values(PODCAST_SERVICE_COPY).forEach(copy => {
    if (!copy.generatedUnavailableShort) copy.generatedUnavailableShort = PODCAST_SERVICE_COPY.en.generatedUnavailableShort;
  });
  Object.entries(PODCAST_SERVICE_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const EVENT_MORE_COPY = {
    de:'Weitere Termine anzeigen', en:'Show more events', es:'Mostrar más eventos', fr:'Afficher plus d’événements',
    it:'Mostra altri eventi', pt:'Mostrar mais eventos', ru:'Показать ещё события', el:'Εμφάνιση περισσότερων εκδηλώσεων', tr:'Daha fazla etkinlik göster'
  };
  Object.entries(EVENT_MORE_COPY).forEach(([language, label]) => { MEDIA_COPY[language].moreEvents = label; });
  const PROFESSIONAL_COPY = {
    de: { notifications:'Benachrichtigungen', notificationTitle:'Freiwillige Benachrichtigungen', notificationIntro:'Ausgeschaltet, bis du sie ausdrücklich aktivierst. Vorgesehen sind nur wichtige Meldungen aus deinen gefolgten Themen und Regionen sowie sichtbare Korrekturen.', notificationStatus:'Berechtigung', notificationUnsupported:'Auf diesem Gerät nicht verfügbar', notificationDenied:'Im System blockiert', notificationReady:'Vom Gerät erlaubt', notificationOff:'Nicht aktiviert', enableNotifications:'Auf diesem Gerät erlauben', pushBreaking:'Nur wichtige Eilmeldungen', pushFollowed:'Nur gefolgte Themen und Regionen', pushCorrections:'Korrekturen ebenfalls melden', quietHours:'Ruhezeit', quietFrom:'Von', quietUntil:'Bis', saveNotificationSettings:'Einstellungen speichern', notificationSaved:'Benachrichtigungseinstellungen lokal gespeichert.', localErrors:'Lokale Fehlerhinweise', diagnosticsIntro:'Maximal 30 technische Hinweise bleiben nur auf diesem Gerät. URLs und E-Mail-Adressen werden entfernt; es erfolgt keine automatische Übertragung.', exportDiagnostics:'Fehlerhinweise exportieren', clearDiagnostics:'Fehlerhinweise löschen', diagnosticsCleared:'Lokale Fehlerhinweise gelöscht.', offlineArticles:'Offline lesbare Artikel' },
    en: { notifications:'Notifications', notificationTitle:'Optional notifications', notificationIntro:'Off until you explicitly enable them. Only important updates from followed topics and regions, plus visible corrections, are intended.', notificationStatus:'Permission', notificationUnsupported:'Unavailable on this device', notificationDenied:'Blocked by the system', notificationReady:'Allowed by the device', notificationOff:'Not enabled', enableNotifications:'Allow on this device', pushBreaking:'Important breaking news only', pushFollowed:'Followed topics and regions only', pushCorrections:'Also notify corrections', quietHours:'Quiet hours', quietFrom:'From', quietUntil:'Until', saveNotificationSettings:'Save settings', notificationSaved:'Notification settings saved locally.', localErrors:'Local error notices', diagnosticsIntro:'At most 30 technical notices stay on this device. URLs and email addresses are removed; nothing is uploaded automatically.', exportDiagnostics:'Export error notices', clearDiagnostics:'Delete error notices', diagnosticsCleared:'Local error notices deleted.', offlineArticles:'Articles readable offline' },
    es: { notifications:'Notificaciones', notificationTitle:'Notificaciones opcionales', notificationIntro:'Desactivadas hasta que las habilites expresamente. Solo avisos importantes de temas y regiones seguidos, además de correcciones visibles.', notificationStatus:'Permiso', notificationUnsupported:'No disponible en este dispositivo', notificationDenied:'Bloqueado por el sistema', notificationReady:'Permitido por el dispositivo', notificationOff:'No activado', enableNotifications:'Permitir en este dispositivo', pushBreaking:'Solo alertas importantes', pushFollowed:'Solo temas y regiones seguidos', pushCorrections:'Avisar también de correcciones', quietHours:'Horario de silencio', quietFrom:'Desde', quietUntil:'Hasta', saveNotificationSettings:'Guardar ajustes', notificationSaved:'Ajustes guardados localmente.', localErrors:'Avisos de error locales', diagnosticsIntro:'Como máximo 30 avisos técnicos permanecen en este dispositivo. Se eliminan URLs y correos; no se envía nada automáticamente.', exportDiagnostics:'Exportar avisos', clearDiagnostics:'Borrar avisos', diagnosticsCleared:'Avisos locales borrados.', offlineArticles:'Artículos disponibles sin conexión' },
    fr: { notifications:'Notifications', notificationTitle:'Notifications facultatives', notificationIntro:'Désactivées jusqu’à ton accord explicite. Uniquement les alertes importantes des thèmes et régions suivis, ainsi que les corrections visibles.', notificationStatus:'Autorisation', notificationUnsupported:'Indisponible sur cet appareil', notificationDenied:'Bloqué par le système', notificationReady:'Autorisé par l’appareil', notificationOff:'Non activé', enableNotifications:'Autoriser sur cet appareil', pushBreaking:'Alertes importantes uniquement', pushFollowed:'Uniquement thèmes et régions suivis', pushCorrections:'Signaler aussi les corrections', quietHours:'Plage de silence', quietFrom:'De', quietUntil:'À', saveNotificationSettings:'Enregistrer', notificationSaved:'Paramètres enregistrés localement.', localErrors:'Erreurs locales', diagnosticsIntro:'Au maximum 30 avis techniques restent sur cet appareil. Les URL et adresses e-mail sont supprimées ; aucun envoi automatique.', exportDiagnostics:'Exporter les erreurs', clearDiagnostics:'Effacer les erreurs', diagnosticsCleared:'Erreurs locales effacées.', offlineArticles:'Articles lisibles hors ligne' },
    it: { notifications:'Notifiche', notificationTitle:'Notifiche facoltative', notificationIntro:'Disattivate finché non le abiliti esplicitamente. Solo avvisi importanti per temi e regioni seguiti e correzioni visibili.', notificationStatus:'Autorizzazione', notificationUnsupported:'Non disponibile su questo dispositivo', notificationDenied:'Bloccato dal sistema', notificationReady:'Consentito dal dispositivo', notificationOff:'Non attivato', enableNotifications:'Consenti su questo dispositivo', pushBreaking:'Solo notizie urgenti importanti', pushFollowed:'Solo temi e regioni seguiti', pushCorrections:'Segnala anche le correzioni', quietHours:'Orario silenzioso', quietFrom:'Dalle', quietUntil:'Alle', saveNotificationSettings:'Salva impostazioni', notificationSaved:'Impostazioni salvate localmente.', localErrors:'Errori locali', diagnosticsIntro:'Al massimo 30 avvisi tecnici restano sul dispositivo. URL ed e-mail vengono rimossi; nessun invio automatico.', exportDiagnostics:'Esporta errori', clearDiagnostics:'Elimina errori', diagnosticsCleared:'Errori locali eliminati.', offlineArticles:'Articoli leggibili offline' },
    pt: { notifications:'Notificações', notificationTitle:'Notificações opcionais', notificationIntro:'Desativadas até as ativares explicitamente. Apenas alertas importantes de temas e regiões seguidos e correções visíveis.', notificationStatus:'Permissão', notificationUnsupported:'Indisponível neste dispositivo', notificationDenied:'Bloqueado pelo sistema', notificationReady:'Permitido pelo dispositivo', notificationOff:'Não ativado', enableNotifications:'Permitir neste dispositivo', pushBreaking:'Só alertas importantes', pushFollowed:'Só temas e regiões seguidos', pushCorrections:'Avisar também correções', quietHours:'Período silencioso', quietFrom:'Das', quietUntil:'Às', saveNotificationSettings:'Guardar definições', notificationSaved:'Definições guardadas localmente.', localErrors:'Erros locais', diagnosticsIntro:'No máximo 30 avisos técnicos ficam neste dispositivo. URLs e e-mails são removidos; nada é enviado automaticamente.', exportDiagnostics:'Exportar erros', clearDiagnostics:'Apagar erros', diagnosticsCleared:'Erros locais apagados.', offlineArticles:'Artigos disponíveis offline' },
    ru: { notifications:'Уведомления', notificationTitle:'Добровольные уведомления', notificationIntro:'Выключены до явного согласия. Только важные сообщения по выбранным темам и регионам, а также исправления.', notificationStatus:'Разрешение', notificationUnsupported:'Недоступно на устройстве', notificationDenied:'Заблокировано системой', notificationReady:'Разрешено устройством', notificationOff:'Не включено', enableNotifications:'Разрешить на устройстве', pushBreaking:'Только важные срочные новости', pushFollowed:'Только выбранные темы и регионы', pushCorrections:'Сообщать также об исправлениях', quietHours:'Тихие часы', quietFrom:'С', quietUntil:'До', saveNotificationSettings:'Сохранить', notificationSaved:'Настройки сохранены локально.', localErrors:'Локальные ошибки', diagnosticsIntro:'Не более 30 технических сообщений остаются на устройстве. URL и e-mail удаляются; автоматической отправки нет.', exportDiagnostics:'Экспорт ошибок', clearDiagnostics:'Удалить ошибки', diagnosticsCleared:'Локальные ошибки удалены.', offlineArticles:'Статьи для чтения без сети' },
    el: { notifications:'Ειδοποιήσεις', notificationTitle:'Προαιρετικές ειδοποιήσεις', notificationIntro:'Απενεργοποιημένες μέχρι να τις επιτρέψετε ρητά. Μόνο σημαντικές ενημερώσεις από θέματα και περιοχές που ακολουθείτε και διορθώσεις.', notificationStatus:'Άδεια', notificationUnsupported:'Δεν διατίθεται σε αυτή τη συσκευή', notificationDenied:'Αποκλεισμένο από το σύστημα', notificationReady:'Επιτρέπεται από τη συσκευή', notificationOff:'Δεν ενεργοποιήθηκε', enableNotifications:'Να επιτραπεί στη συσκευή', pushBreaking:'Μόνο σημαντικές έκτακτες ειδήσεις', pushFollowed:'Μόνο θέματα και περιοχές που ακολουθείτε', pushCorrections:'Ειδοποίηση και για διορθώσεις', quietHours:'Ώρες ησυχίας', quietFrom:'Από', quietUntil:'Έως', saveNotificationSettings:'Αποθήκευση', notificationSaved:'Οι ρυθμίσεις αποθηκεύτηκαν τοπικά.', localErrors:'Τοπικά σφάλματα', diagnosticsIntro:'Έως 30 τεχνικές ειδοποιήσεις μένουν στη συσκευή. URL και e-mail αφαιρούνται· δεν γίνεται αυτόματη αποστολή.', exportDiagnostics:'Εξαγωγή σφαλμάτων', clearDiagnostics:'Διαγραφή σφαλμάτων', diagnosticsCleared:'Τα τοπικά σφάλματα διαγράφηκαν.', offlineArticles:'Άρθρα διαθέσιμα εκτός σύνδεσης' },
    tr: { notifications:'Bildirimler', notificationTitle:'İsteğe bağlı bildirimler', notificationIntro:'Açıkça izin verene kadar kapalıdır. Yalnızca takip edilen konu ve bölgelerden önemli haberler ile düzeltmeler amaçlanır.', notificationStatus:'İzin', notificationUnsupported:'Bu cihazda kullanılamıyor', notificationDenied:'Sistem tarafından engellendi', notificationReady:'Cihaz izin verdi', notificationOff:'Etkin değil', enableNotifications:'Bu cihazda izin ver', pushBreaking:'Yalnızca önemli son dakika haberleri', pushFollowed:'Yalnızca takip edilen konu ve bölgeler', pushCorrections:'Düzeltmeleri de bildir', quietHours:'Sessiz saatler', quietFrom:'Başlangıç', quietUntil:'Bitiş', saveNotificationSettings:'Ayarları kaydet', notificationSaved:'Bildirim ayarları yerel olarak kaydedildi.', localErrors:'Yerel hata kayıtları', diagnosticsIntro:'En fazla 30 teknik kayıt bu cihazda kalır. URL ve e-posta adresleri kaldırılır; otomatik gönderim yapılmaz.', exportDiagnostics:'Hataları dışa aktar', clearDiagnostics:'Hataları sil', diagnosticsCleared:'Yerel hatalar silindi.', offlineArticles:'Çevrimdışı okunabilir makaleler' }
  };
  Object.entries(PROFESSIONAL_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const ZINE_TEMPLATE_COPY = {
    de: {
      zineContentTab:'Inhalt', zineTemplatesTab:'Sprühschablonen', zineTemplatesTitle:'Sprühschablonen',
      zineTemplatesIntro:'Wähle aus kuratierten Vorlagen von Red Shepherd und Kreaktivismus sowie eigenen WRN-Motiven. Externe Dateien bleiben mit ihrer Originalquelle verknüpft.',
      zineStencilUse:'Motiv auswählen', zineStencilSelected:'Ausgewählt', zineStencilPreview:'Druckvorschau',
      zineStencilDownload:'SVG speichern', zineStencilPrint:'Drucken / als PDF', zineStencilHint:'Schwarz sind die auszuschneidenden Flächen. Alle Motive sind einlagig aufgebaut; helle Schneidestege halten die Vorlage zusammen.',
      zineStencilCutSafe:'WRN · einlagig', zineStencilExternal:'Externe Vorlage', zineStencilOriginal:'Original öffnen', zineStencilSource:'Quelle', zineStencilExternalHint:'Prüfe vor dem Schneiden die Stege und passe sie bei Bedarf an. Die Originaldatei und weitere Formatangaben findest du direkt bei der Quelle.',
      zineStencilSolidarity:'Solidarität', zineStencilSolidarityText:'Klare Typografie für Solidarität und gegenseitige Unterstützung.',
      zineStencilRefugees:'Refugees Welcome', zineStencilRefugeesText:'Willkommensmotiv gegen Grenzen, Ausgrenzung und Entrechtung.',
      zineStencilNoOneIllegal:'No One Is Illegal', zineStencilNoOneIllegalText:'International verständliches Motiv für Bewegungsfreiheit und gleiche Rechte.',
      zineStencilUnite:'Unite', zineStencilUniteText:'Kompaktes Motiv für Zusammenhalt und gemeinsame Organisierung.',
      zineStencilFeminism:'Feminismus', zineStencilFeminismText:'Kräftige Schablone für feministische Kämpfe und Sichtbarkeit.',
      zineStencilInternationalSolidarity:'Internationale Solidarität', zineStencilInternationalSolidarityText:'Mehrteiliges Motiv für grenzüberschreitende Solidarität.',
      zineStencilAllArms:'All the arms we need', zineStencilAllArmsText:'Eine Umarmung als Gegenbild zu Gewalt und Militarisierung.',
      zineStencilAllArmsGroup:'Zusammen statt bewaffnet', zineStencilAllArmsGroupText:'Drei verbundene Personen als Motiv für Freundschaft und gegenseitigen Schutz.',
      zineStencilStayAll:'Wir bleiben alle', zineStencilStayAllText:'Schablone gegen Verdrängung und für gemeinsames Bleiberecht.',
      zineStencilAntifaAction:'Antifaschistische Aktion', zineStencilAntifaActionText:'Klassisches antifaschistisches Fahnenmotiv als klare Druckvorlage.',
      zineStencilFightRacism:'Fight Racism', zineStencilFightRacismText:'Direkte antirassistische Botschaft mit kontrastreicher Typografie.',
      zineStencilFightWhitePride:'Fight White Pride', zineStencilFightWhitePrideText:'Motiv gegen weißen Nationalismus und rechte Überlegenheitsideologien.',
      zineStencilFightAuthority:'Fight Authority', zineStencilFightAuthorityText:'Kompakte antiautoritäre Text- und Figurenkomposition.',
      zineStencilFist:'Erhobene Faust', zineStencilFistText:'Kräftige Faustsilhouette für Solidarität und gemeinsamen Widerstand.',
      zineStencilMegaphone:'Megafon & Stimme', zineStencilMegaphoneText:'Klares Aktionsmotiv für Aufrufe, Kundgebungen und Gegenöffentlichkeit.',
      zineStencilDove:'Taube & Zweig', zineStencilDoveText:'Dynamisches Motiv für Frieden, Deserteure und Antimilitarismus.',
      zineStencilChain:'Gesprengte Kette', zineStencilChainText:'Offene Kettenglieder und Splitter als Zeichen für Befreiung.',
      zineStencilFlower:'Blume durch Beton', zineStencilFlowerText:'Eine widerständige Pflanze bricht durch eine harte Oberfläche.',
      zineStencilSurveillance:'Keine Überwachung', zineStencilSurveillanceText:'Durchgestrichene Kamera in einem offenen, schneidbaren Kreis.',
      zineStencilMutualAid:'Gegenseitige Hilfe', zineStencilMutualAidText:'Zwei ineinandergreifende Hände für Unterstützung und Zusammenhalt.',
      zineStencilAnarchy:'Gebrochenes A', zineStencilAnarchyText:'Kräftiges A aus getrennten Formen in einem bewusst offenen Kreis.',
      zineStencilKnowledge:'Freies Wissen', zineStencilKnowledgeText:'Offenes Buch und Flamme für Bildung, Erinnerung und freie Information.',
      zineStencilHousing:'Wohnen für alle', zineStencilHousingText:'Eine verbundene Häuserzeile als Zeichen gegen Verdrängung.',
      zineStencilEarth:'Erde schützen', zineStencilEarthText:'Offene Weltform mit Blättern für Klimagerechtigkeit und Fürsorge.',
      zineStencilAntiwar:'Blume statt Rakete', zineStencilAntiwarText:'Eine gebrochene Rakete, aus deren Bruchstelle eine Blume wächst.'
    },
    en: {
      zineContentTab:'Content', zineTemplatesTab:'Spray stencils', zineTemplatesTitle:'Spray stencils',
      zineTemplatesIntro:'Choose curated templates from Red Shepherd and Kreaktivismus alongside original WRN motifs. External files remain linked to their original source.',
      zineStencilUse:'Choose motif', zineStencilSelected:'Selected', zineStencilPreview:'Print preview',
      zineStencilDownload:'Save SVG', zineStencilPrint:'Print / save PDF', zineStencilHint:'Black areas are cut out. Every motif uses one layer; white bridges keep the stencil together.',
      zineStencilCutSafe:'WRN · one layer', zineStencilExternal:'External template', zineStencilOriginal:'Open original', zineStencilSource:'Source', zineStencilExternalHint:'Check the bridges before cutting and adjust them if necessary. The original file and further format details are available directly from the source.',
      zineStencilSolidarity:'Solidarity', zineStencilSolidarityText:'Clear typography for solidarity and mutual support.',
      zineStencilRefugees:'Refugees Welcome', zineStencilRefugeesText:'A welcoming motif against borders, exclusion and disenfranchisement.',
      zineStencilNoOneIllegal:'No One Is Illegal', zineStencilNoOneIllegalText:'An internationally legible motif for freedom of movement and equal rights.',
      zineStencilUnite:'Unite', zineStencilUniteText:'A compact motif for cohesion and collective organising.',
      zineStencilFeminism:'Feminism', zineStencilFeminismText:'A bold stencil for feminist struggles and visibility.',
      zineStencilInternationalSolidarity:'International solidarity', zineStencilInternationalSolidarityText:'A multi-part motif for solidarity across borders.',
      zineStencilAllArms:'All the arms we need', zineStencilAllArmsText:'An embrace as a counter-image to violence and militarisation.',
      zineStencilAllArmsGroup:'Together, not armed', zineStencilAllArmsGroupText:'Three connected people as a motif for friendship and mutual protection.',
      zineStencilStayAll:'We all stay', zineStencilStayAllText:'A stencil against displacement and for the right to remain together.',
      zineStencilAntifaAction:'Antifascist action', zineStencilAntifaActionText:'The classic antifascist flags as a clear printable template.',
      zineStencilFightRacism:'Fight racism', zineStencilFightRacismText:'A direct antiracist message with strong, high-contrast lettering.',
      zineStencilFightWhitePride:'Fight white pride', zineStencilFightWhitePrideText:'A motif opposing white nationalism and supremacist ideologies.',
      zineStencilFightAuthority:'Fight authority', zineStencilFightAuthorityText:'A compact antiauthoritarian text-and-figure composition.',
      zineStencilFist:'Raised fist', zineStencilFistText:'A forceful fist silhouette for solidarity and collective resistance.',
      zineStencilMegaphone:'Megaphone & voice', zineStencilMegaphoneText:'A clear action motif for calls, rallies and independent media.',
      zineStencilDove:'Dove & branch', zineStencilDoveText:'A dynamic motif for peace, deserters and antimilitarism.',
      zineStencilChain:'Broken chain', zineStencilChainText:'Open chain links and fragments as a sign of liberation.',
      zineStencilFlower:'Flower through concrete', zineStencilFlowerText:'A resistant plant breaking through a hard surface.',
      zineStencilSurveillance:'No surveillance', zineStencilSurveillanceText:'A crossed-out camera inside an open, cut-safe circle.',
      zineStencilMutualAid:'Mutual aid', zineStencilMutualAidText:'Two interlocking hands for support and solidarity.',
      zineStencilAnarchy:'Broken-circle A', zineStencilAnarchyText:'A bold A made from separate shapes inside a deliberately open circle.',
      zineStencilKnowledge:'Free knowledge', zineStencilKnowledgeText:'An open book and flame for education, memory and free information.',
      zineStencilHousing:'Housing for all', zineStencilHousingText:'A connected row of homes as a sign against displacement.',
      zineStencilEarth:'Protect the earth', zineStencilEarthText:'An open globe with leaves for climate justice and care.',
      zineStencilAntiwar:'Flowers, not missiles', zineStencilAntiwarText:'A broken missile with a flower growing from the fracture.'
    }
  };
  Object.entries(ZINE_TEMPLATE_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const SOURCE_ARCHIVE_COPY = {
    de: {
      sourceArchiveTitle:'30-Tage-Quellenarchiv',
      sourceArchiveIntro:'Wähle eine oder mehrere Quellen. Erst dann lädt die App deren 30-Tage-Dateien gezielt nach.',
      sourceArchiveSearch:'Quellen durchsuchen', sourceArchiveClear:'Auswahl leeren',
      sourceArchiveSelected:'Ausgewählte Quellen', sourceArchiveQuick:'Schnellindex – noch kein Quellenarchiv nachgeladen',
      sourceArchiveLoading:'Quellenarchiv wird nachgeladen …', sourceArchiveComplete:'30-Tage-Abdeckung vollständig',
      sourceArchivePartial:'Verfügbare Archivabdeckung – noch nicht volle 30 Tage',
      sourceArchiveUnavailable:'Quellenarchiv derzeit nicht verfügbar', sourceArchiveNoSources:'Keine passenden Quellen',
      sourceArchiveArticle:'Beitrag', sourceArchiveItems:'Beiträge', sourceArchiveMax:'Bis zu 20 Quellen gleichzeitig auswählbar.'
    },
    en: {
      sourceArchiveTitle:'30-day source archive',
      sourceArchiveIntro:'Choose one or more sources. The app then loads only their 30-day archive files.',
      sourceArchiveSearch:'Search sources', sourceArchiveClear:'Clear selection',
      sourceArchiveSelected:'Selected sources', sourceArchiveQuick:'Quick index – no source archive loaded yet',
      sourceArchiveLoading:'Loading source archive …', sourceArchiveComplete:'Complete 30-day coverage',
      sourceArchivePartial:'Available archive coverage – not yet a full 30 days',
      sourceArchiveUnavailable:'Source archive is currently unavailable', sourceArchiveNoSources:'No matching sources',
      sourceArchiveArticle:'article', sourceArchiveItems:'articles', sourceArchiveMax:'Up to 20 sources can be selected at once.'
    }
  };
  Object.entries(SOURCE_ARCHIVE_COPY).forEach(([language, copy]) => Object.assign(PRODUCT_COPY[language], copy));
  const MENU_UPDATES_COPY = {
    de: { title:'Letzte Aktualisierungen', items:['„In 5 Minuten“ wird direkt in der gewählten App-Sprache angezeigt.', 'Neue Dokumentationen mit Sprachfilter, App-Player und Link zum Original.', 'Neues Solinaridao-Logo, Webseiten-Button und wählbares Pink-Theme.', 'Sprühschablonen, erweitertes Lexikon und 30-Tage-Quellenarchiv.'] },
    en: { title:'Latest updates', items:['“In 5 minutes” now appears directly in the selected app language.', 'New documentaries with language filter, in-app player and original link.', 'New Solinaridao logo, website button and selectable pink theme.', 'Spray stencils, expanded glossary and 30-day source archive.'] },
    es: { title:'Últimas actualizaciones', items:['«En 5 minutos» aparece directamente en el idioma elegido de la app.', 'Nuevos documentales con filtro de idioma, reproductor y enlace original.', 'Nuevo logotipo Solinaridao, botón web y tema rosa seleccionable.', 'Plantillas de aerosol, glosario ampliado y archivo de fuentes de 30 días.'] },
    fr: { title:'Dernières mises à jour', items:['« En 5 minutes » s’affiche directement dans la langue choisie.', 'Nouveaux documentaires avec filtre de langue, lecteur et lien original.', 'Nouveau logo Solinaridao, bouton du site et thème rose au choix.', 'Pochoirs, lexique enrichi et archives des sources sur 30 jours.'] },
    it: { title:'Ultimi aggiornamenti', items:['«In 5 minuti» appare direttamente nella lingua scelta dell’app.', 'Nuovi documentari con filtro lingua, player e link all’originale.', 'Nuovo logo Solinaridao, pulsante web e tema rosa selezionabile.', 'Stencil spray, glossario ampliato e archivio fonti di 30 giorni.'] },
    pt: { title:'Últimas atualizações', items:['«Em 5 minutos» aparece diretamente no idioma escolhido da aplicação.', 'Novos documentários com filtro de idioma, leitor e ligação ao original.', 'Novo logótipo Solinaridao, botão do site e tema rosa selecionável.', 'Moldes de spray, glossário ampliado e arquivo de fontes de 30 dias.'] },
    ru: { title:'Последние обновления', items:['«За 5 минут» сразу показывается на выбранном языке приложения.', 'Новые документальные фильмы с фильтром языка, плеером и ссылкой на оригинал.', 'Новый логотип Solinaridao, кнопка сайта и выбираемая розовая тема.', 'Трафареты, расширенный словарь и архив источников за 30 дней.'] },
    el: { title:'Τελευταίες ενημερώσεις', items:['Το «Σε 5 λεπτά» εμφανίζεται απευθείας στην επιλεγμένη γλώσσα.', 'Νέα ντοκιμαντέρ με φίλτρο γλώσσας, player και σύνδεσμο στο πρωτότυπο.', 'Νέο λογότυπο Solinaridao, κουμπί ιστοσελίδας και ροζ θέμα.', 'Στένσιλ, εμπλουτισμένο γλωσσάρι και αρχείο πηγών 30 ημερών.'] },
    tr: { title:'Son güncellemeler', items:['“5 dakikada” seçilen uygulama dilinde doğrudan gösterilir.', 'Dil filtreli, uygulama oynatıcılı ve özgün bağlantılı yeni belgeseller.', 'Yeni Solinaridao logosu, web sitesi düğmesi ve seçilebilir pembe tema.', 'Sprey şablonları, genişletilmiş sözlük ve 30 günlük kaynak arşivi.'] }
  };
  const WEBSITE_NOTICE_COPY = {
    de: { kicker:'Unabhängig & werbefrei', title:'Projektwebseite öffnen', body:'World Revolution News ist unabhängig, zeigt keine Werbung und verwendet kein Werbetracking. Damit das Projekt weiterlaufen kann, ist es auf Spenden angewiesen.', warning:'Wenn du fortfährst, verlässt du die App und öffnest solinaridao.com.', cancel:'Abbrechen', continue:'Zur Webseite' },
    en: { kicker:'Independent & ad-free', title:'Open the project website', body:'World Revolution News is independent, shows no advertising and uses no advertising tracking. The project is sustained by voluntary work and donations.', warning:'If you continue, you will leave the app and open solinaridao.com.', cancel:'Cancel', continue:'Open website' },
    es: { kicker:'Independiente y sin publicidad', title:'Abrir el sitio del proyecto', body:'World Revolution News es independiente, no muestra publicidad ni utiliza rastreo publicitario. El proyecto se sostiene con trabajo voluntario y donaciones.', warning:'Si continúas, saldrás de la aplicación y abrirás solinaridao.com.', cancel:'Cancelar', continue:'Abrir sitio' },
    fr: { kicker:'Indépendant et sans publicité', title:'Ouvrir le site du projet', body:'World Revolution News est indépendant, sans publicité ni suivi publicitaire. Le projet repose sur le travail bénévole et les dons.', warning:'En continuant, vous quittez l’application et ouvrez solinaridao.com.', cancel:'Annuler', continue:'Ouvrir le site' },
    it: { kicker:'Indipendente e senza pubblicità', title:'Apri il sito del progetto', body:'World Revolution News è indipendente, non mostra pubblicità e non usa tracciamento pubblicitario. Il progetto vive di lavoro volontario e donazioni.', warning:'Continuando uscirai dall’app e aprirai solinaridao.com.', cancel:'Annulla', continue:'Apri il sito' },
    pt: { kicker:'Independente e sem publicidade', title:'Abrir o site do projeto', body:'A World Revolution News é independente, não apresenta publicidade nem utiliza rastreio publicitário. O projeto é mantido por trabalho voluntário e donativos.', warning:'Ao continuar, sais da aplicação e abres solinaridao.com.', cancel:'Cancelar', continue:'Abrir site' },
    ru: { kicker:'Независимо и без рекламы', title:'Открыть сайт проекта', body:'World Revolution News — независимый проект без рекламы и рекламного отслеживания. Он поддерживается добровольной работой и пожертвованиями.', warning:'При продолжении вы покинете приложение и откроете solinaridao.com.', cancel:'Отмена', continue:'Открыть сайт' },
    el: { kicker:'Ανεξάρτητο και χωρίς διαφημίσεις', title:'Άνοιγμα ιστοσελίδας έργου', body:'Το World Revolution News είναι ανεξάρτητο, χωρίς διαφημίσεις ή διαφημιστική παρακολούθηση. Το έργο στηρίζεται σε εθελοντική εργασία και δωρεές.', warning:'Αν συνεχίσετε, θα φύγετε από την εφαρμογή και θα ανοίξετε το solinaridao.com.', cancel:'Ακύρωση', continue:'Άνοιγμα ιστοσελίδας' },
    tr: { kicker:'Bağımsız ve reklamsız', title:'Proje web sitesini aç', body:'World Revolution News bağımsızdır, reklam göstermez ve reklam takibi kullanmaz. Proje gönüllü emek ve bağışlarla sürdürülür.', warning:'Devam edersen uygulamadan ayrılır ve solinaridao.com adresini açarsın.', cancel:'İptal', continue:'Web sitesini aç' }
  };
  const NAVIGATION_A11Y_COPY = {
    de:'Hauptnavigation', en:'Main navigation', es:'Navegación principal',
    fr:'Navigation principale', it:'Navigazione principale', pt:'Navegação principal',
    ru:'Основная навигация', el:'Κύρια πλοήγηση', tr:'Ana gezinme'
  };
  Object.entries(NAVIGATION_A11Y_COPY).forEach(([language, label]) => {
    MEDIA_COPY[language].mainNavigation = label;
  });
  const TODAY_COPY = {
    de: { todayTitle:'Deine Tageslage', todayIntro:'Neuigkeiten, Quellenbreite und direkte Werkzeuge auf einen Blick.', sinceVisit:'Seit deinem letzten Besuch', firstVisit:'Dein erster Überblick', newReports:'neue Meldungen', coverage:'Quellenbreite', coverageGood:'breit aufgestellt', coverageNarrow:'noch einseitig', languagesCount:'Sprachen', regionsCount:'Regionen', sourcesCount:'Quellen', blindSpot:'Blinder Fleck', dailyEdition:'Tagesausgabe', dailyEditionText:'Fünf ausgewählte Meldungen lesen, hören und offline sichern.', createEdition:'Ausgabe erstellen', saveEdition:'Offline sichern', editionSaved:'Tagesausgabe offline gespeichert.', solidarity:'Solidaritätsinformationen', verifiedProfiles:'geprüfte Profile', upcomingActions:'kommende Aktionen', openSolidarity:'Solidarität öffnen', liveDossiers:'Live-Dossiers', openDossiers:'Dossiers öffnen', actionKit:'Aktionspaket', actionKitText:'Zine, Schablonen und Solidaritätsinformationen funktionieren auch ohne Konto.' },
    en: { todayTitle:'Your daily overview', todayIntro:'Updates, source diversity and practical tools at a glance.', sinceVisit:'Since your last visit', firstVisit:'Your first overview', newReports:'new reports', coverage:'Source diversity', coverageGood:'broad coverage', coverageNarrow:'still one-sided', languagesCount:'languages', regionsCount:'regions', sourcesCount:'sources', blindSpot:'Blind spot', dailyEdition:'Daily edition', dailyEditionText:'Read, listen to and save five selected reports offline.', createEdition:'Create edition', saveEdition:'Save offline', editionSaved:'Daily edition saved offline.', solidarity:'Solidarity information', verifiedProfiles:'verified profiles', upcomingActions:'upcoming actions', openSolidarity:'Open solidarity', liveDossiers:'Live dossiers', openDossiers:'Open dossiers', actionKit:'Action kit', actionKitText:'Zine, stencils and solidarity information work without an account.' },
    es: { todayTitle:'Tu panorama diario', todayIntro:'Novedades, diversidad de fuentes y herramientas prácticas de un vistazo.', sinceVisit:'Desde tu última visita', firstVisit:'Tu primer panorama', newReports:'noticias nuevas', coverage:'Diversidad de fuentes', coverageGood:'cobertura amplia', coverageNarrow:'aún unilateral', languagesCount:'idiomas', regionsCount:'regiones', sourcesCount:'fuentes', blindSpot:'Punto ciego', dailyEdition:'Edición diaria', dailyEditionText:'Lee, escucha y guarda sin conexión cinco noticias seleccionadas.', createEdition:'Crear edición', saveEdition:'Guardar sin conexión', editionSaved:'Edición diaria guardada sin conexión.', solidarity:'Información solidaria', verifiedProfiles:'perfiles verificados', upcomingActions:'acciones próximas', openSolidarity:'Abrir solidaridad', liveDossiers:'Dosieres en vivo', openDossiers:'Abrir dosieres', actionKit:'Kit de acción', actionKitText:'El zine, las plantillas y la información solidaria funcionan sin cuenta.' },
    fr: { todayTitle:'Votre point quotidien', todayIntro:'Nouveautés, diversité des sources et outils pratiques en un coup d’œil.', sinceVisit:'Depuis votre dernière visite', firstVisit:'Votre premier aperçu', newReports:'nouveaux articles', coverage:'Diversité des sources', coverageGood:'couverture large', coverageNarrow:'encore trop unilatérale', languagesCount:'langues', regionsCount:'régions', sourcesCount:'sources', blindSpot:'Angle mort', dailyEdition:'Édition du jour', dailyEditionText:'Lire, écouter et enregistrer hors ligne cinq articles sélectionnés.', createEdition:'Créer l’édition', saveEdition:'Enregistrer hors ligne', editionSaved:'Édition du jour enregistrée hors ligne.', solidarity:'Informations de solidarité', verifiedProfiles:'profils vérifiés', upcomingActions:'actions à venir', openSolidarity:'Ouvrir la solidarité', liveDossiers:'Dossiers en direct', openDossiers:'Ouvrir les dossiers', actionKit:'Kit d’action', actionKitText:'Le zine, les pochoirs et les informations solidaires fonctionnent sans compte.' },
    it: { todayTitle:'Il tuo punto quotidiano', todayIntro:'Novità, varietà delle fonti e strumenti pratici a colpo d’occhio.', sinceVisit:'Dall’ultima visita', firstVisit:'Il tuo primo riepilogo', newReports:'nuove notizie', coverage:'Varietà delle fonti', coverageGood:'copertura ampia', coverageNarrow:'ancora unilaterale', languagesCount:'lingue', regionsCount:'regioni', sourcesCount:'fonti', blindSpot:'Punto cieco', dailyEdition:'Edizione giornaliera', dailyEditionText:'Leggi, ascolta e salva offline cinque notizie selezionate.', createEdition:'Crea edizione', saveEdition:'Salva offline', editionSaved:'Edizione giornaliera salvata offline.', solidarity:'Informazioni di solidarietà', verifiedProfiles:'profili verificati', upcomingActions:'azioni imminenti', openSolidarity:'Apri solidarietà', liveDossiers:'Dossier live', openDossiers:'Apri dossier', actionKit:'Kit d’azione', actionKitText:'Zine, stencil e informazioni solidali funzionano senza account.' },
    pt: { todayTitle:'O teu resumo diário', todayIntro:'Novidades, diversidade de fontes e ferramentas práticas num relance.', sinceVisit:'Desde a última visita', firstVisit:'O teu primeiro resumo', newReports:'novas notícias', coverage:'Diversidade de fontes', coverageGood:'cobertura ampla', coverageNarrow:'ainda unilateral', languagesCount:'idiomas', regionsCount:'regiões', sourcesCount:'fontes', blindSpot:'Ponto cego', dailyEdition:'Edição diária', dailyEditionText:'Lê, ouve e guarda offline cinco notícias selecionadas.', createEdition:'Criar edição', saveEdition:'Guardar offline', editionSaved:'Edição diária guardada offline.', solidarity:'Informações de solidariedade', verifiedProfiles:'perfis verificados', upcomingActions:'ações futuras', openSolidarity:'Abrir solidariedade', liveDossiers:'Dossiês ao vivo', openDossiers:'Abrir dossiês', actionKit:'Kit de ação', actionKitText:'Zine, stencils e informações solidárias funcionam sem conta.' },
    ru: { todayTitle:'Ваш обзор дня', todayIntro:'Новое, разнообразие источников и полезные инструменты.', sinceVisit:'С прошлого посещения', firstVisit:'Ваш первый обзор', newReports:'новых материалов', coverage:'Разнообразие источников', coverageGood:'широкий охват', coverageNarrow:'пока односторонне', languagesCount:'языков', regionsCount:'регионов', sourcesCount:'источников', blindSpot:'Слепая зона', dailyEdition:'Выпуск дня', dailyEditionText:'Читайте, слушайте и сохраняйте офлайн пять выбранных материалов.', createEdition:'Создать выпуск', saveEdition:'Сохранить офлайн', editionSaved:'Выпуск дня сохранён офлайн.', solidarity:'Информация о солидарности', verifiedProfiles:'проверенных профилей', upcomingActions:'ближайших акций', openSolidarity:'Открыть раздел', liveDossiers:'Живые досье', openDossiers:'Открыть досье', actionKit:'Набор действий', actionKitText:'Зин, трафареты и информация о солидарности доступны без аккаунта.' },
    el: { todayTitle:'Η καθημερινή σας εικόνα', todayIntro:'Νέα, ποικιλία πηγών και πρακτικά εργαλεία με μια ματιά.', sinceVisit:'Από την τελευταία επίσκεψη', firstVisit:'Η πρώτη σας επισκόπηση', newReports:'νέες ειδήσεις', coverage:'Ποικιλία πηγών', coverageGood:'ευρεία κάλυψη', coverageNarrow:'ακόμη μονόπλευρη', languagesCount:'γλώσσες', regionsCount:'περιοχές', sourcesCount:'πηγές', blindSpot:'Τυφλό σημείο', dailyEdition:'Ημερήσια έκδοση', dailyEditionText:'Διαβάστε, ακούστε και αποθηκεύστε εκτός σύνδεσης πέντε επιλεγμένες ειδήσεις.', createEdition:'Δημιουργία έκδοσης', saveEdition:'Αποθήκευση εκτός σύνδεσης', editionSaved:'Η ημερήσια έκδοση αποθηκεύτηκε εκτός σύνδεσης.', solidarity:'Πληροφορίες αλληλεγγύης', verifiedProfiles:'επαληθευμένα προφίλ', upcomingActions:'επόμενες δράσεις', openSolidarity:'Άνοιγμα αλληλεγγύης', liveDossiers:'Ζωντανοί φάκελοι', openDossiers:'Άνοιγμα φακέλων', actionKit:'Πακέτο δράσης', actionKitText:'Zine, στένσιλ και πληροφορίες αλληλεγγύης λειτουργούν χωρίς λογαριασμό.' },
    tr: { todayTitle:'Günlük özetin', todayIntro:'Yenilikler, kaynak çeşitliliği ve pratik araçlar bir arada.', sinceVisit:'Son ziyaretinden beri', firstVisit:'İlk genel bakışın', newReports:'yeni haber', coverage:'Kaynak çeşitliliği', coverageGood:'geniş kapsam', coverageNarrow:'hâlâ tek yönlü', languagesCount:'dil', regionsCount:'bölge', sourcesCount:'kaynak', blindSpot:'Kör nokta', dailyEdition:'Günlük sayı', dailyEditionText:'Seçilen beş haberi oku, dinle ve çevrimdışı kaydet.', createEdition:'Sayı oluştur', saveEdition:'Çevrimdışı kaydet', editionSaved:'Günlük sayı çevrimdışı kaydedildi.', solidarity:'Dayanışma bilgileri', verifiedProfiles:'doğrulanmış profil', upcomingActions:'yaklaşan eylem', openSolidarity:'Dayanışmayı aç', liveDossiers:'Canlı dosyalar', openDossiers:'Dosyaları aç', actionKit:'Eylem paketi', actionKitText:'Zine, şablonlar ve dayanışma bilgileri hesapsız çalışır.' }
  };
  Object.entries(TODAY_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const PRODUCT_21_COPY = {
    de: { solidarity:'Solidaritätsaktionen', verifiedActions:'aktuell vollständig geprüfte Aktionen', noVerifiedActions:'Derzeit liegt keine vollständig geprüfte aktive Aktion vor. Schlagworttreffer aus Terminen werden nicht als geprüft ausgegeben.', dossierChanges:'Dossieränderungen', dossierRemoved:'Dossier nicht mehr im aktuellen Datenstand', overlooked:'Übersehen', overlookedEmpty:'Derzeit erfüllt kein Dossier die belegbaren Kriterien dieses Bereichs.', automaticGroup:'Automatisch gruppiert', contentUnassessed:'Inhaltliche Bestätigung nicht automatisch bewertet', structuredMatchOnly:'Übereinstimmungen werden nur bei derselben strukturierten Claim-ID gezeigt; aus ähnlichem Wortlaut wird nichts abgeleitet.', dossierOverview:'Kurzüberblick', dossierClaims:'Angabenstatus', dossierCorrections:'Korrekturverlauf', dossierMedia:'Medien und Dokumente', whatCanDo:'Was kannst du jetzt tun?', unknownStructured:'Nicht strukturiert erfasst', inputChecklist:'Eingabe- und Prüfliste', missingEditorialData:'Noch fehlende strukturierte oder redaktionelle Angaben', rejectedActions:'nicht freigabefähige Datensätze' },
    en: { solidarity:'Solidarity actions', verifiedActions:'currently fully verified actions', noVerifiedActions:'There is currently no fully verified active action. Keyword matches from events are not presented as verified.', dossierChanges:'Dossier changes', dossierRemoved:'Dossier no longer present in the current dataset', overlooked:'Overlooked', overlookedEmpty:'No dossier currently meets the documented criteria for this section.', automaticGroup:'Automatically grouped', contentUnassessed:'Content confirmation is not assessed automatically', structuredMatchOnly:'Agreement is shown only for the same structured claim ID; similar wording is not interpreted.', dossierOverview:'Overview', dossierClaims:'Claim status', dossierCorrections:'Correction history', dossierMedia:'Media and documents', whatCanDo:'What can you do now?', unknownStructured:'Not captured in structured form', inputChecklist:'Input and review checklist', missingEditorialData:'Structured or editorial information still required', rejectedActions:'records not eligible for publication' },
    es: { solidarity:'Acciones solidarias', verifiedActions:'acciones activas verificadas por completo', noVerifiedActions:'Actualmente no hay ninguna acción activa verificada por completo. Las coincidencias por palabras clave no se presentan como verificadas.', dossierChanges:'Cambios del dosier', dossierRemoved:'El dosier ya no está en los datos actuales', overlooked:'Pasado por alto', overlookedEmpty:'Ningún dosier cumple ahora los criterios documentados.', automaticGroup:'Agrupado automáticamente', contentUnassessed:'La confirmación del contenido no se evalúa automáticamente', structuredMatchOnly:'La coincidencia solo se muestra con el mismo ID estructurado; no se infiere por redacción similar.', dossierOverview:'Resumen', dossierClaims:'Estado de afirmaciones', dossierCorrections:'Historial de correcciones', dossierMedia:'Medios y documentos', whatCanDo:'¿Qué puedes hacer ahora?', unknownStructured:'No registrado de forma estructurada', inputChecklist:'Lista de entrada y revisión', missingEditorialData:'Aún faltan datos estructurados o editoriales', rejectedActions:'registros no aptos para publicación' },
    fr: { solidarity:'Actions de solidarité', verifiedActions:'actions actives entièrement vérifiées', noVerifiedActions:'Aucune action active entièrement vérifiée actuellement. Les correspondances par mots-clés ne sont pas présentées comme vérifiées.', dossierChanges:'Modifications du dossier', dossierRemoved:'Dossier absent des données actuelles', overlooked:'Peu couvert', overlookedEmpty:'Aucun dossier ne remplit actuellement les critères documentés.', automaticGroup:'Regroupé automatiquement', contentUnassessed:'La confirmation du contenu n’est pas évaluée automatiquement', structuredMatchOnly:'La concordance exige le même identifiant structuré ; aucune déduction par formulation similaire.', dossierOverview:'Aperçu', dossierClaims:'État des affirmations', dossierCorrections:'Historique des corrections', dossierMedia:'Médias et documents', whatCanDo:'Que pouvez-vous faire maintenant ?', unknownStructured:'Non renseigné sous forme structurée', inputChecklist:'Liste de saisie et de vérification', missingEditorialData:'Informations structurées ou éditoriales encore requises', rejectedActions:'enregistrements non publiables' },
    it: { solidarity:'Azioni di solidarietà', verifiedActions:'azioni attive completamente verificate', noVerifiedActions:'Al momento non ci sono azioni attive completamente verificate. Le corrispondenze per parola chiave non sono indicate come verificate.', dossierChanges:'Modifiche al dossier', dossierRemoved:'Dossier non più presente nei dati attuali', overlooked:'Poco coperto', overlookedEmpty:'Nessun dossier soddisfa ora i criteri documentati.', automaticGroup:'Raggruppato automaticamente', contentUnassessed:'La conferma dei contenuti non viene valutata automaticamente', structuredMatchOnly:'La concordanza richiede lo stesso ID strutturato; non viene dedotta da formulazioni simili.', dossierOverview:'Panoramica', dossierClaims:'Stato delle affermazioni', dossierCorrections:'Cronologia correzioni', dossierMedia:'Media e documenti', whatCanDo:'Cosa puoi fare ora?', unknownStructured:'Non registrato in forma strutturata', inputChecklist:'Elenco di inserimento e verifica', missingEditorialData:'Dati strutturati o redazionali ancora necessari', rejectedActions:'record non pubblicabili' },
    pt: { solidarity:'Ações de solidariedade', verifiedActions:'ações ativas totalmente verificadas', noVerifiedActions:'Não existe atualmente nenhuma ação ativa totalmente verificada. Correspondências por palavras-chave não são apresentadas como verificadas.', dossierChanges:'Alterações do dossiê', dossierRemoved:'Dossiê já não presente nos dados atuais', overlooked:'Pouco coberto', overlookedEmpty:'Nenhum dossiê cumpre atualmente os critérios documentados.', automaticGroup:'Agrupado automaticamente', contentUnassessed:'A confirmação do conteúdo não é avaliada automaticamente', structuredMatchOnly:'A concordância exige o mesmo ID estruturado; não é inferida por texto semelhante.', dossierOverview:'Resumo', dossierClaims:'Estado das afirmações', dossierCorrections:'Histórico de correções', dossierMedia:'Média e documentos', whatCanDo:'O que podes fazer agora?', unknownStructured:'Não registado de forma estruturada', inputChecklist:'Lista de introdução e verificação', missingEditorialData:'Ainda faltam dados estruturados ou editoriais', rejectedActions:'registos sem condições de publicação' },
    ru: { solidarity:'Действия солидарности', verifiedActions:'полностью проверенных активных действий', noVerifiedActions:'Сейчас нет полностью проверенных активных действий. Совпадения по ключевым словам не выдаются за проверенные.', dossierChanges:'Изменения досье', dossierRemoved:'Досье отсутствует в текущих данных', overlooked:'Мало освещено', overlookedEmpty:'Сейчас ни одно досье не соответствует документированным критериям.', automaticGroup:'Сгруппировано автоматически', contentUnassessed:'Содержание не подтверждается автоматически', structuredMatchOnly:'Совпадение показывается только для одного структурированного ID; похожая формулировка не считается доказательством.', dossierOverview:'Краткий обзор', dossierClaims:'Статус утверждений', dossierCorrections:'История исправлений', dossierMedia:'Медиа и документы', whatCanDo:'Что можно сделать сейчас?', unknownStructured:'Нет структурированных данных', inputChecklist:'Список ввода и проверки', missingEditorialData:'Требуются дополнительные структурированные или редакционные данные', rejectedActions:'записи, не готовые к публикации' },
    el: { solidarity:'Δράσεις αλληλεγγύης', verifiedActions:'πλήρως επαληθευμένες ενεργές δράσεις', noVerifiedActions:'Δεν υπάρχει τώρα πλήρως επαληθευμένη ενεργή δράση. Οι αντιστοιχίες λέξεων-κλειδιών δεν εμφανίζονται ως επαληθευμένες.', dossierChanges:'Αλλαγές φακέλου', dossierRemoved:'Ο φάκελος δεν υπάρχει πλέον στα τρέχοντα δεδομένα', overlooked:'Λίγη κάλυψη', overlookedEmpty:'Κανένας φάκελος δεν πληροί τώρα τα τεκμηριωμένα κριτήρια.', automaticGroup:'Αυτόματη ομαδοποίηση', contentUnassessed:'Το περιεχόμενο δεν επιβεβαιώνεται αυτόματα', structuredMatchOnly:'Η συμφωνία απαιτεί το ίδιο δομημένο αναγνωριστικό· δεν συνάγεται από παρόμοια διατύπωση.', dossierOverview:'Σύνοψη', dossierClaims:'Κατάσταση ισχυρισμών', dossierCorrections:'Ιστορικό διορθώσεων', dossierMedia:'Μέσα και έγγραφα', whatCanDo:'Τι μπορείς να κάνεις τώρα;', unknownStructured:'Δεν έχει καταγραφεί δομημένα', inputChecklist:'Λίστα εισαγωγής και ελέγχου', missingEditorialData:'Απαιτούνται ακόμη δομημένα ή συντακτικά δεδομένα', rejectedActions:'εγγραφές που δεν είναι έτοιμες για δημοσίευση' },
    tr: { solidarity:'Dayanışma eylemleri', verifiedActions:'tam olarak doğrulanmış etkin eylem', noVerifiedActions:'Şu anda tam olarak doğrulanmış etkin bir eylem yok. Anahtar kelime eşleşmeleri doğrulanmış olarak sunulmaz.', dossierChanges:'Dosya değişiklikleri', dossierRemoved:'Dosya güncel veri kümesinde artık yok', overlooked:'Az ele alınan', overlookedEmpty:'Şu anda hiçbir dosya belgelenmiş ölçütleri karşılamıyor.', automaticGroup:'Otomatik gruplandı', contentUnassessed:'İçerik doğrulaması otomatik yapılmaz', structuredMatchOnly:'Uyum yalnızca aynı yapılandırılmış kimlik için gösterilir; benzer ifadeden sonuç çıkarılmaz.', dossierOverview:'Kısa bakış', dossierClaims:'İddia durumu', dossierCorrections:'Düzeltme geçmişi', dossierMedia:'Medya ve belgeler', whatCanDo:'Şimdi ne yapabilirsin?', unknownStructured:'Yapılandırılmış olarak kaydedilmedi', inputChecklist:'Girdi ve inceleme listesi', missingEditorialData:'Yapılandırılmış veya editoryal bilgiler hâlâ gerekli', rejectedActions:'yayına uygun olmayan kayıt' }
  };
  Object.entries(PRODUCT_21_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const DAILY_EDITION_COPY = Object.freeze({
    de:{ dailyEditionText:'Wähle 5–10 Meldungen für Morgenlage, Tagesausgabe oder Wochenrückblick.', editionType:'Ausgabetyp', editionMorning:'Morgenlage', editionDaily:'Tagesausgabe', editionWeekly:'Wochenrückblick', editionCount:'Anzahl Meldungen', deviceVoice:'Audio nutzt die Gerätestimme und ist keine erzeugte Audiodatei.', generatedAudioUnavailable:'Keine erzeugte Audiodatei gespeichert.', offlineArticlesReady:'Artikel und Ausgabedaten sind offline gespeichert.', resumeEdition:'Ab hier fortsetzen' },
    en:{ dailyEditionText:'Choose 5–10 stories for a morning, daily or weekly edition.', editionType:'Edition type', editionMorning:'Morning edition', editionDaily:'Daily edition', editionWeekly:'Weekly review', editionCount:'Number of stories', deviceVoice:'Audio uses the device voice and is not a generated audio file.', generatedAudioUnavailable:'No generated audio file is stored.', offlineArticlesReady:'Articles and edition data are stored offline.', resumeEdition:'Resume here' },
    es:{ dailyEditionText:'Elige entre 5 y 10 noticias para la edición matinal, diaria o semanal.', editionType:'Tipo de edición', editionMorning:'Edición matinal', editionDaily:'Edición diaria', editionWeekly:'Resumen semanal', editionCount:'Número de noticias', deviceVoice:'El audio usa la voz del dispositivo y no es un archivo de audio generado.', generatedAudioUnavailable:'No hay ningún archivo de audio generado guardado.', offlineArticlesReady:'Los artículos y los datos de la edición están guardados sin conexión.', resumeEdition:'Continuar desde aquí' },
    fr:{ dailyEditionText:'Choisissez 5 à 10 articles pour l’édition du matin, du jour ou de la semaine.', editionType:'Type d’édition', editionMorning:'Édition du matin', editionDaily:'Édition du jour', editionWeekly:'Revue de la semaine', editionCount:'Nombre d’articles', deviceVoice:'L’audio utilise la voix de l’appareil et n’est pas un fichier audio généré.', generatedAudioUnavailable:'Aucun fichier audio généré n’est enregistré.', offlineArticlesReady:'Les articles et les données de l’édition sont disponibles hors ligne.', resumeEdition:'Reprendre ici' },
    it:{ dailyEditionText:'Scegli da 5 a 10 notizie per l’edizione mattutina, giornaliera o settimanale.', editionType:'Tipo di edizione', editionMorning:'Edizione mattutina', editionDaily:'Edizione giornaliera', editionWeekly:'Riepilogo settimanale', editionCount:'Numero di notizie', deviceVoice:'L’audio usa la voce del dispositivo e non è un file audio generato.', generatedAudioUnavailable:'Non è salvato alcun file audio generato.', offlineArticlesReady:'Articoli e dati dell’edizione sono salvati offline.', resumeEdition:'Riprendi da qui' },
    pt:{ dailyEditionText:'Escolhe entre 5 e 10 notícias para a edição da manhã, diária ou semanal.', editionType:'Tipo de edição', editionMorning:'Edição da manhã', editionDaily:'Edição diária', editionWeekly:'Resumo semanal', editionCount:'Número de notícias', deviceVoice:'O áudio usa a voz do dispositivo e não é um ficheiro de áudio gerado.', generatedAudioUnavailable:'Não existe ficheiro de áudio gerado guardado.', offlineArticlesReady:'Os artigos e os dados da edição estão guardados offline.', resumeEdition:'Continuar daqui' },
    ru:{ dailyEditionText:'Выберите 5–10 материалов для утреннего, дневного или недельного выпуска.', editionType:'Тип выпуска', editionMorning:'Утренний выпуск', editionDaily:'Выпуск дня', editionWeekly:'Обзор недели', editionCount:'Количество материалов', deviceVoice:'Для аудио используется голос устройства, это не созданный аудиофайл.', generatedAudioUnavailable:'Созданный аудиофайл не сохранён.', offlineArticlesReady:'Материалы и данные выпуска сохранены офлайн.', resumeEdition:'Продолжить отсюда' },
    el:{ dailyEditionText:'Επιλέξτε 5–10 ειδήσεις για πρωινή, ημερήσια ή εβδομαδιαία έκδοση.', editionType:'Τύπος έκδοσης', editionMorning:'Πρωινή έκδοση', editionDaily:'Ημερήσια έκδοση', editionWeekly:'Εβδομαδιαία ανασκόπηση', editionCount:'Αριθμός ειδήσεων', deviceVoice:'Ο ήχος χρησιμοποιεί τη φωνή της συσκευής και δεν είναι παραγόμενο αρχείο ήχου.', generatedAudioUnavailable:'Δεν έχει αποθηκευτεί παραγόμενο αρχείο ήχου.', offlineArticlesReady:'Τα άρθρα και τα δεδομένα της έκδοσης αποθηκεύτηκαν εκτός σύνδεσης.', resumeEdition:'Συνέχεια από εδώ' },
    tr:{ dailyEditionText:'Sabah, günlük veya haftalık sayı için 5–10 haber seç.', editionType:'Sayı türü', editionMorning:'Sabah sayısı', editionDaily:'Günlük sayı', editionWeekly:'Haftalık özet', editionCount:'Haber sayısı', deviceVoice:'Ses, cihaz sesini kullanır; üretilmiş bir ses dosyası değildir.', generatedAudioUnavailable:'Üretilmiş bir ses dosyası kaydedilmedi.', offlineArticlesReady:'Haberler ve sayı verileri çevrimdışı kaydedildi.', resumeEdition:'Buradan sürdür' }
  });
  Object.entries(DAILY_EDITION_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const EDITION_SAVE_FAILURE_COPY = Object.freeze({
    de:'Tagesausgabe konnte nicht bestätigt gespeichert werden.', en:'The daily edition could not be confirmed as saved.',
    es:'No se pudo confirmar el guardado de la edición.', fr:'L’enregistrement de l’édition n’a pas pu être confirmé.',
    it:'Impossibile confermare il salvataggio dell’edizione.', pt:'Não foi possível confirmar que a edição foi guardada.',
    ru:'Не удалось подтвердить сохранение выпуска.', el:'Δεν επιβεβαιώθηκε η αποθήκευση της έκδοσης.',
    tr:'Sayının kaydedildiği doğrulanamadı.'
  });
  Object.entries(EDITION_SAVE_FAILURE_COPY).forEach(([language, copy]) => { MEDIA_COPY[language].editionSaveFailed = copy; });
  const HELP_COPY = Object.freeze({
    de:{ helpFind:'Hilfe finden', helpFindText:'Geprüfte Organisationen manuell nach Region, Sprache und Hilfethema filtern.', helpPrivacy:'Kein Standort wird übertragen. Filter und geöffnete Profile werden nicht im Verlauf gespeichert.', helpRegion:'Land / Region', helpLanguage:'Sprache', helpTopic:'Hilfethema', helpAll:'Alle', helpCan:'Kann helfen bei', helpNot:'Nicht zuständig für', helpRequirements:'Voraussetzungen', helpChecked:'Geprüft', helpNextCheck:'Nächste Prüfung', helpReachability:'Erreichbarkeit', helpEmergency:'Notfallkontakt – Grenzen beachten', helpOffline:'Regionalpaket offline sichern', helpOfflineSaved:'Geprüftes Regionalpaket offline gespeichert.', helpOfflineFailed:'Regionalpaket konnte nicht bestätigt gespeichert werden.', helpNoResults:'Keine aktuell geprüften Profile für diese Filter.', helpSubmit:'Lokaler Korrekturentwurf', helpSubmissionText:'Bleibt nur vorübergehend in dieser geöffneten Seite. Er wird weder übertragen noch dauerhaft für Moderator*innen gespeichert.', helpEvidence:'Offizielle Beleg-URLs', helpDetails:'Angaben / Korrektur', helpQueue:'Lokalen Entwurf erstellen', helpPending:'Lokaler Entwurf erstellt; nicht übertragen und nicht dauerhaft gespeichert.', helpSources:'Verifizierungsquellen' },
    en:{ helpFind:'Find help', helpFindText:'Manually filter verified organisations by region, language and help topic.', helpPrivacy:'No location is transmitted. Filters and opened profiles are not saved to history.', helpRegion:'Country / region', helpLanguage:'Language', helpTopic:'Help topic', helpAll:'All', helpCan:'Can help with', helpNot:'Not responsible for', helpRequirements:'Requirements', helpChecked:'Checked', helpNextCheck:'Next check', helpReachability:'Reachability', helpEmergency:'Emergency contact – note its limits', helpOffline:'Save regional package offline', helpOfflineSaved:'Verified regional package saved offline.', helpOfflineFailed:'The regional package could not be confirmed as saved.', helpNoResults:'No currently verified profiles match these filters.', helpSubmit:'Local correction draft', helpSubmissionText:'Remains temporarily in this open page only. It is neither transmitted nor stored persistently for moderators.', helpEvidence:'Official evidence URLs', helpDetails:'Details / correction', helpQueue:'Create local draft', helpPending:'Local draft created; not transmitted or persistently stored.', helpSources:'Verification sources' },
    es:{ helpFind:'Encontrar ayuda', helpFindText:'Filtra manualmente organizaciones verificadas por región, idioma y tema.', helpPrivacy:'No se transmite la ubicación. Los filtros y perfiles abiertos no se guardan en el historial.', helpRegion:'País / región', helpLanguage:'Idioma', helpTopic:'Tema de ayuda', helpAll:'Todos', helpCan:'Puede ayudar con', helpNot:'No se ocupa de', helpRequirements:'Requisitos', helpChecked:'Comprobado', helpNextCheck:'Próxima revisión', helpReachability:'Disponibilidad', helpEmergency:'Contacto de emergencia: consulta los límites', helpOffline:'Guardar paquete regional sin conexión', helpOfflineSaved:'Paquete regional verificado guardado.', helpOfflineFailed:'No se pudo confirmar el guardado del paquete regional.', helpNoResults:'No hay perfiles verificados para estos filtros.', helpSubmit:'Borrador local de corrección', helpSubmissionText:'Solo permanece temporalmente en esta página abierta. No se transmite ni se guarda para moderación.', helpEvidence:'URL oficiales', helpDetails:'Datos / corrección', helpQueue:'Crear borrador local', helpPending:'Borrador local creado; no transmitido ni guardado de forma permanente.', helpSources:'Fuentes de verificación' },
    fr:{ helpFind:'Trouver de l’aide', helpFindText:'Filtrer manuellement les organisations vérifiées par région, langue et thème.', helpPrivacy:'Aucune position n’est transmise. Les filtres et profils ouverts ne sont pas enregistrés.', helpRegion:'Pays / région', helpLanguage:'Langue', helpTopic:'Thème d’aide', helpAll:'Tous', helpCan:'Peut aider pour', helpNot:'Ne prend pas en charge', helpRequirements:'Conditions', helpChecked:'Vérifié', helpNextCheck:'Prochaine vérification', helpReachability:'Joignabilité', helpEmergency:'Contact d’urgence — respecter ses limites', helpOffline:'Enregistrer le paquet régional hors ligne', helpOfflineSaved:'Paquet régional vérifié enregistré.', helpOfflineFailed:'L’enregistrement du paquet régional n’a pas pu être confirmé.', helpNoResults:'Aucun profil actuellement vérifié pour ces filtres.', helpSubmit:'Brouillon local de correction', helpSubmissionText:'Reste temporairement dans cette page ouverte. Il n’est ni transmis ni stocké durablement pour la modération.', helpEvidence:'URL officielles', helpDetails:'Informations / correction', helpQueue:'Créer un brouillon local', helpPending:'Brouillon local créé, ni transmis ni stocké durablement.', helpSources:'Sources de vérification' },
    it:{ helpFind:'Trova aiuto', helpFindText:'Filtra manualmente le organizzazioni verificate per regione, lingua e tema.', helpPrivacy:'Nessuna posizione viene trasmessa. Filtri e profili aperti non sono salvati nella cronologia.', helpRegion:'Paese / regione', helpLanguage:'Lingua', helpTopic:'Tema di aiuto', helpAll:'Tutti', helpCan:'Può aiutare con', helpNot:'Non competente per', helpRequirements:'Requisiti', helpChecked:'Verificato', helpNextCheck:'Prossima verifica', helpReachability:'Raggiungibilità', helpEmergency:'Contatto di emergenza — osservare i limiti', helpOffline:'Salva pacchetto regionale offline', helpOfflineSaved:'Pacchetto regionale verificato salvato.', helpOfflineFailed:'Impossibile confermare il salvataggio del pacchetto regionale.', helpNoResults:'Nessun profilo verificato per questi filtri.', helpSubmit:'Bozza locale di correzione', helpSubmissionText:'Resta temporaneamente solo in questa pagina aperta. Non viene trasmessa né salvata in modo permanente per la moderazione.', helpEvidence:'URL ufficiali', helpDetails:'Dati / correzione', helpQueue:'Crea bozza locale', helpPending:'Bozza locale creata; non trasmessa né salvata in modo permanente.', helpSources:'Fonti di verifica' },
    pt:{ helpFind:'Encontrar ajuda', helpFindText:'Filtra manualmente organizações verificadas por região, idioma e tema.', helpPrivacy:'Nenhuma localização é transmitida. Filtros e perfis abertos não ficam no histórico.', helpRegion:'País / região', helpLanguage:'Idioma', helpTopic:'Tema de ajuda', helpAll:'Todos', helpCan:'Pode ajudar com', helpNot:'Não é responsável por', helpRequirements:'Requisitos', helpChecked:'Verificado', helpNextCheck:'Próxima verificação', helpReachability:'Disponibilidade', helpEmergency:'Contacto de emergência — respeita os limites', helpOffline:'Guardar pacote regional offline', helpOfflineSaved:'Pacote regional verificado guardado.', helpOfflineFailed:'Não foi possível confirmar que o pacote regional foi guardado.', helpNoResults:'Sem perfis verificados para estes filtros.', helpSubmit:'Rascunho local de correção', helpSubmissionText:'Permanece temporariamente apenas nesta página aberta. Não é transmitido nem guardado de forma persistente para moderação.', helpEvidence:'URLs oficiais', helpDetails:'Dados / correção', helpQueue:'Criar rascunho local', helpPending:'Rascunho local criado; não transmitido nem guardado de forma persistente.', helpSources:'Fontes de verificação' },
    ru:{ helpFind:'Найти помощь', helpFindText:'Вручную фильтруйте проверенные организации по региону, языку и теме.', helpPrivacy:'Местоположение не передаётся. Фильтры и открытые профили не сохраняются в истории.', helpRegion:'Страна / регион', helpLanguage:'Язык', helpTopic:'Тема помощи', helpAll:'Все', helpCan:'Может помочь', helpNot:'Не отвечает за', helpRequirements:'Условия', helpChecked:'Проверено', helpNextCheck:'Следующая проверка', helpReachability:'Доступность', helpEmergency:'Экстренный контакт — учитывайте ограничения', helpOffline:'Сохранить региональный пакет', helpOfflineSaved:'Проверенный региональный пакет сохранён.', helpOfflineFailed:'Не удалось подтвердить сохранение регионального пакета.', helpNoResults:'Нет проверенных профилей для этих фильтров.', helpSubmit:'Локальный черновик исправления', helpSubmissionText:'Временно остаётся только на этой открытой странице. Не передаётся и не сохраняется для модераторов.', helpEvidence:'Официальные URL', helpDetails:'Данные / исправление', helpQueue:'Создать локальный черновик', helpPending:'Локальный черновик создан; не передан и не сохранён постоянно.', helpSources:'Источники проверки' },
    el:{ helpFind:'Εύρεση βοήθειας', helpFindText:'Χειροκίνητο φιλτράρισμα επαληθευμένων οργανώσεων ανά περιοχή, γλώσσα και θέμα.', helpPrivacy:'Δεν μεταδίδεται τοποθεσία. Τα φίλτρα και τα προφίλ δεν αποθηκεύονται στο ιστορικό.', helpRegion:'Χώρα / περιοχή', helpLanguage:'Γλώσσα', helpTopic:'Θέμα βοήθειας', helpAll:'Όλα', helpCan:'Μπορεί να βοηθήσει με', helpNot:'Δεν είναι αρμόδιο για', helpRequirements:'Προϋποθέσεις', helpChecked:'Ελέγχθηκε', helpNextCheck:'Επόμενος έλεγχος', helpReachability:'Διαθεσιμότητα', helpEmergency:'Επαφή έκτακτης ανάγκης — δείτε τα όρια', helpOffline:'Αποθήκευση περιφερειακού πακέτου', helpOfflineSaved:'Το επαληθευμένο πακέτο αποθηκεύτηκε.', helpOfflineFailed:'Δεν επιβεβαιώθηκε η αποθήκευση του περιφερειακού πακέτου.', helpNoResults:'Κανένα επαληθευμένο προφίλ για αυτά τα φίλτρα.', helpSubmit:'Τοπικό προσχέδιο διόρθωσης', helpSubmissionText:'Παραμένει προσωρινά μόνο σε αυτή την ανοικτή σελίδα. Δεν μεταδίδεται ούτε αποθηκεύεται μόνιμα για εποπτεία.', helpEvidence:'Επίσημα URL', helpDetails:'Στοιχεία / διόρθωση', helpQueue:'Δημιουργία τοπικού προσχεδίου', helpPending:'Τοπικό προσχέδιο δημιουργήθηκε· δεν μεταδόθηκε ούτε αποθηκεύτηκε μόνιμα.', helpSources:'Πηγές επαλήθευσης' },
    tr:{ helpFind:'Yardım bul', helpFindText:'Doğrulanmış kuruluşları bölge, dil ve yardım konusuna göre elle filtrele.', helpPrivacy:'Konum aktarılmaz. Filtreler ve açılan profiller geçmişe kaydedilmez.', helpRegion:'Ülke / bölge', helpLanguage:'Dil', helpTopic:'Yardım konusu', helpAll:'Tümü', helpCan:'Şunlarda yardımcı olabilir', helpNot:'Şunlardan sorumlu değil', helpRequirements:'Koşullar', helpChecked:'Kontrol edildi', helpNextCheck:'Sonraki kontrol', helpReachability:'Ulaşılabilirlik', helpEmergency:'Acil iletişim — sınırları dikkate al', helpOffline:'Bölgesel paketi çevrimdışı kaydet', helpOfflineSaved:'Doğrulanmış bölgesel paket kaydedildi.', helpOfflineFailed:'Bölgesel paketin kaydedildiği doğrulanamadı.', helpNoResults:'Bu filtrelere uygun güncel doğrulanmış profil yok.', helpSubmit:'Yerel düzeltme taslağı', helpSubmissionText:'Yalnızca bu açık sayfada geçici olarak kalır. Moderatörlere iletilmez veya kalıcı olarak saklanmaz.', helpEvidence:'Resmî URL’ler', helpDetails:'Bilgi / düzeltme', helpQueue:'Yerel taslak oluştur', helpPending:'Yerel taslak oluşturuldu; iletilmedi ve kalıcı saklanmadı.', helpSources:'Doğrulama kaynakları' }
  });
  Object.entries(HELP_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));
  const HELP_BOUNDARY_COPY = Object.freeze({
    de:{ helpLocation:'Ort / Abdeckung', helpAdviceOnly:'Beratung – kein Notruf', helpCrisisContact:'Krisen-/Notfallkontakt – Grenzen im Profil lesen' },
    en:{ helpLocation:'Place / coverage', helpAdviceOnly:'Advice – not an emergency number', helpCrisisContact:'Crisis/emergency contact – read limits in profile' },
    es:{ helpLocation:'Lugar / cobertura', helpAdviceOnly:'Asesoramiento, no emergencias', helpCrisisContact:'Contacto de crisis/emergencia: consulta los límites' },
    fr:{ helpLocation:'Lieu / couverture', helpAdviceOnly:'Conseil – pas un numéro d’urgence', helpCrisisContact:'Contact de crise/urgence – lire les limites' },
    it:{ helpLocation:'Luogo / copertura', helpAdviceOnly:'Consulenza – non emergenza', helpCrisisContact:'Contatto crisi/emergenza – leggi i limiti' },
    pt:{ helpLocation:'Local / cobertura', helpAdviceOnly:'Aconselhamento – não emergência', helpCrisisContact:'Contacto de crise/emergência – lê os limites' },
    ru:{ helpLocation:'Место / охват', helpAdviceOnly:'Консультация — не экстренный номер', helpCrisisContact:'Кризисный/экстренный контакт — читайте ограничения' },
    el:{ helpLocation:'Τόπος / κάλυψη', helpAdviceOnly:'Συμβουλή – όχι επείγον', helpCrisisContact:'Επαφή κρίσης/έκτακτης ανάγκης – διαβάστε τα όρια' },
    tr:{ helpLocation:'Yer / kapsama', helpAdviceOnly:'Danışmanlık – acil numara değil', helpCrisisContact:'Kriz/acil durum irtibatı – sınırları okuyun' }
  });
  Object.entries(HELP_BOUNDARY_COPY).forEach(([language, copy]) => Object.assign(MEDIA_COPY[language], copy));

  const previousVisitAt = Number(localStorage.getItem(LAST_VISIT_KEY) || 0);
  const currentVisitStartedAt = Date.now();
  const storedDevelopmentSnapshotHistory = product21.normalizeSnapshotHistory(
    readJson(DEVELOPMENT_SNAPSHOT_KEY, null)
  );

  const storedArchiveFilters = readJson(ARCHIVE_FILTERS_KEY, {});
  const storedDiscoverFilters = storedArchiveFilters?.discover && typeof storedArchiveFilters.discover === 'object'
    ? storedArchiveFilters.discover
    : {};
  const storedArchiveSources = Array.isArray(storedArchiveFilters?.selectedSources)
    ? storedArchiveFilters.selectedSources.map(core.text).filter(Boolean).slice(0, 20)
    : [];

  const state = {
    articles: [],
    facets: { regions: [], topics: [], sources: [] },
    view: 'home',
    language: supportedLanguage(localStorage.getItem(LANGUAGE_KEY) || navigator.language || 'de'),
    ui: readJson(UI_SETTINGS_KEY, { theme: 'dark', fontSize: 'normal', density: 'standard' }),
    preferences: normalizedPreferences(readJson(PREFS_KEY, {})),
    translations: readJson(TRANSLATIONS_KEY, {}),
    discover: {
      query: '', region: core.text(storedDiscoverFilters.region), topic: core.text(storedDiscoverFilters.topic),
      period: ['current', '7d', '30d', 'all'].includes(storedDiscoverFilters.period) ? storedDiscoverFilters.period : 'current',
      limit: 24,
      sort: ['newest', 'oldest'].includes(storedDiscoverFilters.sort) ? storedDiscoverFilters.sort : 'newest',
      language: core.text(storedDiscoverFilters.language || 'all'),
      origin: core.text(storedDiscoverFilters.origin || 'all'),
      source: core.text(storedDiscoverFilters.source || 'all'),
      format: core.text(storedDiscoverFilters.format || 'all'),
      viewMode: ['cards', 'compact', 'headlines'].includes(storedDiscoverFilters.viewMode) ? storedDiscoverFilters.viewMode : 'cards'
    },
    sourceArchive: {
      manifest: null, manifestLoading: false, manifestFailed: false,
      selectedSources: storedArchiveSources, loadedSources: new Set(), failedSources: new Set(),
      loadingSources: new Set(), sourceQuery: ''
    },
    events: [],
    eventArchiveLoaded: false,
    eventArchiveLoading: false,
    eventFilter: {
      query: '', country: '', city: '', category: '', group: '', date: '',
      archived: false, radius: 0, location: null, regions: [], limit: 60
    },
    sourceCatalog: null,
    editorialDecisions: { schemaVersion: 1, decisions: [] },
    sourceIndex: new Map(),
    prisonerData: { profiles: [], sources: [] },
    solidarityActions: [],
    solidarityNetwork: { profiles: [], editorialNotes: [] },
    solidarityResources: { resources: [], editorialInputChecklist: [] },
    helpFilters: { query: '', region: '', location: '', language: '', topic: '' },
    localSolidarityDrafts: [],
    prisoners: { section: 'people' },
    lexicon: { section: 'all', query: '' },
    lexiconSnapshot: { terms: [], sources: [] },
    librarySources: [],
    libraryItems: [],
    library: { query: '', languages: [], source: 'all', format: 'all', limit: 30 },
    developmentWatch: readJson(STORY_WATCH_KEY, []),
    developmentReviews: readJson(DEVELOPMENT_REVIEW_KEY, []),
    developmentSnapshotHistory: storedDevelopmentSnapshotHistory,
    developmentSnapshotBeforeVisit: product21.previousSnapshot(storedDevelopmentSnapshotHistory),
    developmentSnapshotCurrent: null,
    developmentChanges: { firstVisit: true, changes: [], clusterReassignments: [], total: 0 },
    developmentSnapshotStored: false,
    developmentReviewStoryId: '',
    activeDossierId: '',
    developmentsWatchedOnly: false,
    podcasts: [],
    generatedPodcasts: [],
    podcastService: 'unknown',
    radioStations: [],
    videoItems: [],
    videoHealth: { schemaVersion: 1, status: 'unavailable', itemHealth: [] },
    videoWatchLater: readJson(VIDEO_WATCH_LATER_KEY, []),
    videoHistory: readJson(VIDEO_HISTORY_KEY, []),
    activeVideoId: '',
    videoFilters: {
      section: 'new', query: '', language: 'all', topic: 'all', region: 'all',
      source: 'all', platform: 'all', duration: 'all', sort: 'balanced'
    },
    media: {
      section: 'video', videoMode: 'current', query: '', region: 'all',
      category: 'all', favoritesOnly: false, languages: [], source: 'all', zinePanel: 'content', stencilId: 'red-shepherd-solidarity'
    },
    savedMode: 'bookmarks',
    savedArticles: [],
    dailyEditionItems: [],
    briefing: { step: 1, regions: [], topics: [], language: '', amount: 5, itemCount: 5, editionType: 'daily', dailyEdition: false, progressIndex: 0, items: [], historyItemIds: [] },
    briefingHistory: normalizedBriefingHistory(readJson(BRIEFING_HISTORY_KEY, [])),
    cardArticles: [],
    activeArticle: null,
    dataStatus: {
      mode: 'loading', source: '', revision: '', generatedAt: '',
      lastSuccessfulFetchAt: '', lastPublishedAt: '', newestArticleAt: '', publishPending: false
    }
  };
  const articleDetailChunkCache = new Map();
  let articleArchivePromise = null;
  let articlePodcast = {
    chunks: [],
    index: 0,
    utterance: null,
    playing: false,
    paused: false,
    language: 'de'
  };
  let articleCloudPodcastId = '';
  let podcastServiceProbe = null;
  let briefingSpeechGeneration = 0;

  const viewRoot = document.getElementById('next-view');
  const viewAnnouncer = document.getElementById('next-view-announcer');
  const loading = document.getElementById('next-loading');
  const articleDialog = document.getElementById('next-article-dialog');
  const preferencesDialog = document.getElementById('next-preferences-dialog');
  const menuDialog = document.getElementById('next-menu-dialog');
  const donationDialog = document.getElementById('next-donation-dialog');
  const websiteDialog = document.getElementById('next-website-dialog');
  const feedbackDialog = document.getElementById('next-feedback-dialog');
  const feedbackForm = document.getElementById('next-feedback-form');
  const briefingDialog = document.getElementById('next-briefing-dialog');
  const developmentReviewDialog = document.getElementById('next-development-review-dialog');
  const searchPanel = document.getElementById('next-global-search');
  const searchInput = document.getElementById('next-search-input');
  const languageSelect = document.getElementById('next-language');
  const themeSelect = document.getElementById('next-menu-theme');
  const fontSizeSelect = document.getElementById('next-menu-font-size');
  const densitySelect = document.getElementById('next-menu-density');
  const briefingTranslationsInFlight = new Set();
  const briefingTranslationsAttempted = new Set();
  let briefingTranslationWarningShown = false;
  let dataRefreshInFlight = false;
  let lastSuccessfulDataLoad = 0;
  let specialtyHydrationPromise = null;
  let specialtyDataReady = false;
  let restoringAppHistory = false;
  let articleReturnFocus = null;
  let helpReturnFocus = null;
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: light)');

  function appNavigationSnapshot(extra = {}) {
    return {
      wrnAppNavigation: true,
      view: state.view,
      mediaSection: state.media.section,
      zinePanel: state.media.zinePanel,
      lexiconSection: state.lexicon.section,
      prisonerSection: state.prisoners.section,
      savedMode: state.savedMode,
      videoSection: state.videoFilters.section,
      activeVideoId: state.activeVideoId,
      ...extra
    };
  }

  function writeAppHistory(mode = 'push', extra = {}) {
    if (restoringAppHistory) return;
    const snapshot = appNavigationSnapshot(extra);
    try {
      if (mode === 'replace') history.replaceState(snapshot, '', location.href);
      else history.pushState(snapshot, '', location.href);
    } catch {}
  }

  function openArticleDialogWithHistory() {
    if (articleDialog.open) return;
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement
      && activeElement !== document.body
      && !articleDialog.contains(activeElement)) {
      articleReturnFocus = {
        element: activeElement,
        id: activeElement.id || '',
        action: activeElement.dataset.action || '',
        index: activeElement.dataset.index || ''
      };
    }
    writeAppHistory('push', { wrnOverlay: 'article' });
    articleDialog.showModal();
  }

  function restoreArticleReturnFocus() {
    const remembered = articleReturnFocus;
    if (!remembered) return false;
    let target = remembered.element?.isConnected ? remembered.element : null;
    if (!target && remembered.id) target = document.getElementById(remembered.id);
    if (!target && remembered.action) {
      target = [...document.querySelectorAll('[data-action]')].find(element => (
        element.dataset.action === remembered.action
        && (remembered.index === '' || element.dataset.index === remembered.index)
      ));
    }
    articleReturnFocus = null;
    if (!(target instanceof HTMLElement)) return false;
    target.focus({ preventScroll: true });
    return document.activeElement === target;
  }

  function closeArticleDialogWithHistory() {
    if (!articleDialog.open) return;
    if (history.state?.wrnOverlay === 'article') history.back();
    else articleDialog.close();
  }

  function supportedLanguage(value) {
    const language = String(value || '').toLowerCase().split('-')[0];
    return Object.prototype.hasOwnProperty.call(COPY, language) ? language : 'en';
  }

  const EVENT_UI_COPY = Object.freeze({
    de: { eventTools:'Terminwerkzeuge', radius:'Umkreis', locationOptIn:'Optional: Erst „In meiner Nähe“ fragt nach deinem Standort. Die Koordinaten bleiben auf diesem Gerät.', calendarOpened:'Kalender geöffnet', calendarFailed:'Kalender konnte nicht geöffnet werden.', reminderFailed:'Die Erinnerung konnte auf diesem Gerät nicht eingerichtet werden.' },
    en: { eventTools:'Event tools', radius:'Radius', locationOptIn:'Optional: your location is requested only after selecting “Near me”. Coordinates stay on this device.', calendarOpened:'Calendar opened', calendarFailed:'The calendar could not be opened.', reminderFailed:'The reminder could not be set on this device.' },
    es: { eventTools:'Herramientas de eventos', radius:'Radio', locationOptIn:'Opcional: la ubicación solo se solicita al elegir «Cerca de mí». Las coordenadas permanecen en este dispositivo.', calendarOpened:'Calendario abierto', calendarFailed:'No se pudo abrir el calendario.', reminderFailed:'No se pudo configurar el recordatorio en este dispositivo.' },
    fr: { eventTools:'Outils des événements', radius:'Rayon', locationOptIn:'Facultatif : la position n’est demandée qu’après avoir choisi « Près de moi ». Les coordonnées restent sur cet appareil.', calendarOpened:'Calendrier ouvert', calendarFailed:'Impossible d’ouvrir le calendrier.', reminderFailed:'Impossible de programmer le rappel sur cet appareil.' },
    it: { eventTools:'Strumenti per gli eventi', radius:'Raggio', locationOptIn:'Facoltativo: la posizione viene richiesta solo dopo aver scelto «Vicino a me». Le coordinate restano su questo dispositivo.', calendarOpened:'Calendario aperto', calendarFailed:'Impossibile aprire il calendario.', reminderFailed:'Impossibile impostare il promemoria su questo dispositivo.' },
    pt: { eventTools:'Ferramentas de eventos', radius:'Raio', locationOptIn:'Opcional: a localização só é pedida depois de escolher «Perto de mim». As coordenadas ficam neste dispositivo.', calendarOpened:'Calendário aberto', calendarFailed:'Não foi possível abrir o calendário.', reminderFailed:'Não foi possível definir o lembrete neste dispositivo.' },
    ru: { eventTools:'Инструменты событий', radius:'Радиус', locationOptIn:'Необязательно: геолокация запрашивается только после выбора «Рядом со мной». Координаты остаются на устройстве.', calendarOpened:'Календарь открыт', calendarFailed:'Не удалось открыть календарь.', reminderFailed:'Не удалось установить напоминание на этом устройстве.' },
    el: { eventTools:'Εργαλεία εκδηλώσεων', radius:'Ακτίνα', locationOptIn:'Προαιρετικά: η τοποθεσία ζητείται μόνο αφού επιλέξεις «Κοντά μου». Οι συντεταγμένες μένουν στη συσκευή.', calendarOpened:'Το ημερολόγιο άνοιξε', calendarFailed:'Δεν ήταν δυνατό το άνοιγμα του ημερολογίου.', reminderFailed:'Δεν ήταν δυνατή η ρύθμιση υπενθύμισης σε αυτή τη συσκευή.' },
    tr: { eventTools:'Etkinlik araçları', radius:'Yarıçap', locationOptIn:'İsteğe bağlı: konum yalnızca “Yakınımda” seçildikten sonra istenir. Koordinatlar bu cihazda kalır.', calendarOpened:'Takvim açıldı', calendarFailed:'Takvim açılamadı.', reminderFailed:'Bu cihazda hatırlatıcı ayarlanamadı.' }
  });

  function t(key) {
    if (isProduction && key === 'preview') return 'World Revolution News';
    if (isProduction && key === 'previewNotice') {
      return COPY[state.language]?.liveNotice || COPY.en.liveNotice;
    }
    return RELEASE_COPY[state.language]?.[key]
      || RELEASE_COPY.en[key]
      || ARTICLE_COPY[state.language]?.[key]
      || ARTICLE_COPY.en[key]
      || LIBRARY_COPY[state.language]?.[key]
      || LIBRARY_COPY.en[key]
      || PRODUCT_COPY[state.language]?.[key]
      || PRODUCT_COPY.en[key]
      || APP_SHARE_COPY[state.language]?.[key]
      || APP_SHARE_COPY.en[key]
      || EVENT_UI_COPY[state.language]?.[key]
      || EVENT_UI_COPY.en[key]
      || UI_COPY[state.language]?.[key]
      || UI_COPY.en[key]
      || MEDIA_COPY[state.language]?.[key]
      || MEDIA_COPY.en[key]
      || SPECIAL_COPY[state.language]?.[key]
      || SPECIAL_COPY.en[key]
      || COPY[state.language]?.[key]
      || COPY.en[key]
      || key;
  }

  const CLASSIFICATION_COPY = Object.freeze({
    de: {
      Africa:'Afrika', Asia:'Asien', Oceania:'Ozeanien', 'Australia & NZ':'Australien & Neuseeland', Europe:'Europa', Global:'Global', 'Latin America':'Lateinamerika', 'North America':'Nordamerika', DACH:'DACH',
      'Animal Liberation':'Tierbefreiung', 'Anti-Imperialism':'Antiimperialismus', 'Anti-Rep & Prisons':'Antirepression & Gefängnisse', Anticapitalism:'Antikapitalismus', Anticolonialism:'Antikolonialismus', Antifascism:'Antifaschismus', Antiracism:'Antirassismus', Antisexism:'Antisexismus', Cyberactivism:'Cyberaktivismus', Demonstrations:'Demonstrationen', 'Eco-Anarchism':'Öko-Anarchismus', 'Indigenous Struggles':'Indigene Kämpfe', 'Labor Struggles':'Arbeitskämpfe', Libraries:'Bibliotheken', 'Movement News':'Bewegungsnachrichten', 'No Borders':'Keine Grenzen', 'No War':'Gegen Krieg', 'Queer-Feminism':'Queerfeminismus', 'Radical Health & Disability':'Radikale Gesundheit & Behinderung', 'Squatting & Housing':'Besetzungen & Wohnen', 'Theory & Strategy':'Theorie & Strategie'
    },
    en: {},
    es: {
      Africa:'África', Asia:'Asia', Oceania:'Oceanía', 'Australia & NZ':'Australia y Nueva Zelanda', Europe:'Europa', Global:'Global', 'Latin America':'América Latina', 'North America':'América del Norte', DACH:'DACH',
      'Animal Liberation':'Liberación animal', 'Anti-Imperialism':'Antiimperialismo', 'Anti-Rep & Prisons':'Antirrepresión y prisiones', Anticapitalism:'Anticapitalismo', Anticolonialism:'Anticolonialismo', Antifascism:'Antifascismo', Antiracism:'Antirracismo', Antisexism:'Antisexismo', Cyberactivism:'Ciberactivismo', Demonstrations:'Manifestaciones', 'Eco-Anarchism':'Ecoanarquismo', 'Indigenous Struggles':'Luchas indígenas', 'Labor Struggles':'Luchas laborales', Libraries:'Bibliotecas', 'Movement News':'Noticias de movimientos', 'No Borders':'Sin fronteras', 'No War':'Contra la guerra', 'Queer-Feminism':'Feminismo queer', 'Radical Health & Disability':'Salud radical y discapacidad', 'Squatting & Housing':'Okupación y vivienda', 'Theory & Strategy':'Teoría y estrategia'
    },
    fr: {
      Africa:'Afrique', Asia:'Asie', Oceania:'Océanie', 'Australia & NZ':'Australie et Nouvelle-Zélande', Europe:'Europe', Global:'Monde', 'Latin America':'Amérique latine', 'North America':'Amérique du Nord', DACH:'DACH',
      'Animal Liberation':'Libération animale', 'Anti-Imperialism':'Anti-impérialisme', 'Anti-Rep & Prisons':'Antirépression et prisons', Anticapitalism:'Anticapitalisme', Anticolonialism:'Anticolonialisme', Antifascism:'Antifascisme', Antiracism:'Antiracisme', Antisexism:'Antisexisme', Cyberactivism:'Cyberactivisme', Demonstrations:'Manifestations', 'Eco-Anarchism':'Écoanarchisme', 'Indigenous Struggles':'Luttes autochtones', 'Labor Struggles':'Luttes du travail', Libraries:'Bibliothèques', 'Movement News':'Actualités des mouvements', 'No Borders':'Sans frontières', 'No War':'Contre la guerre', 'Queer-Feminism':'Féminisme queer', 'Radical Health & Disability':'Santé radicale et handicap', 'Squatting & Housing':'Squats et logement', 'Theory & Strategy':'Théorie et stratégie'
    },
    it: {
      Africa:'Africa', Asia:'Asia', Oceania:'Oceania', 'Australia & NZ':'Australia e Nuova Zelanda', Europe:'Europa', Global:'Globale', 'Latin America':'America Latina', 'North America':'America del Nord', DACH:'DACH',
      'Animal Liberation':'Liberazione animale', 'Anti-Imperialism':'Anti-imperialismo', 'Anti-Rep & Prisons':'Antirepressione e carceri', Anticapitalism:'Anticapitalismo', Anticolonialism:'Anticolonialismo', Antifascism:'Antifascismo', Antiracism:'Antirazzismo', Antisexism:'Antisessismo', Cyberactivism:'Cyberattivismo', Demonstrations:'Manifestazioni', 'Eco-Anarchism':'Ecoanarchismo', 'Indigenous Struggles':'Lotte indigene', 'Labor Struggles':'Lotte del lavoro', Libraries:'Biblioteche', 'Movement News':'Notizie dai movimenti', 'No Borders':'Senza frontiere', 'No War':'Contro la guerra', 'Queer-Feminism':'Femminismo queer', 'Radical Health & Disability':'Salute radicale e disabilità', 'Squatting & Housing':'Occupazioni e abitare', 'Theory & Strategy':'Teoria e strategia'
    },
    pt: {
      Africa:'África', Asia:'Ásia', Oceania:'Oceânia', 'Australia & NZ':'Austrália e Nova Zelândia', Europe:'Europa', Global:'Global', 'Latin America':'América Latina', 'North America':'América do Norte', DACH:'DACH',
      'Animal Liberation':'Libertação animal', 'Anti-Imperialism':'Anti-imperialismo', 'Anti-Rep & Prisons':'Antirrepressão e prisões', Anticapitalism:'Anticapitalismo', Anticolonialism:'Anticolonialismo', Antifascism:'Antifascismo', Antiracism:'Antirracismo', Antisexism:'Antissexismo', Cyberactivism:'Ciberativismo', Demonstrations:'Manifestações', 'Eco-Anarchism':'Ecoanarquismo', 'Indigenous Struggles':'Lutas indígenas', 'Labor Struggles':'Lutas laborais', Libraries:'Bibliotecas', 'Movement News':'Notícias dos movimentos', 'No Borders':'Sem fronteiras', 'No War':'Contra a guerra', 'Queer-Feminism':'Feminismo queer', 'Radical Health & Disability':'Saúde radical e deficiência', 'Squatting & Housing':'Ocupações e habitação', 'Theory & Strategy':'Teoria e estratégia'
    },
    ru: {
      Africa:'Африка', Asia:'Азия', Oceania:'Океания', 'Australia & NZ':'Австралия и Новая Зеландия', Europe:'Европа', Global:'Весь мир', 'Latin America':'Латинская Америка', 'North America':'Северная Америка', DACH:'DACH',
      'Animal Liberation':'Освобождение животных', 'Anti-Imperialism':'Антиимпериализм', 'Anti-Rep & Prisons':'Антирепрессии и тюрьмы', Anticapitalism:'Антикапитализм', Anticolonialism:'Антиколониализм', Antifascism:'Антифашизм', Antiracism:'Антирасизм', Antisexism:'Антисексизм', Cyberactivism:'Киберактивизм', Demonstrations:'Демонстрации', 'Eco-Anarchism':'Экоанархизм', 'Indigenous Struggles':'Борьба коренных народов', 'Labor Struggles':'Трудовая борьба', Libraries:'Библиотеки', 'Movement News':'Новости движений', 'No Borders':'Без границ', 'No War':'Против войны', 'Queer-Feminism':'Квир-феминизм', 'Radical Health & Disability':'Радикальное здоровье и инвалидность', 'Squatting & Housing':'Сквоты и жильё', 'Theory & Strategy':'Теория и стратегия'
    },
    el: {
      Africa:'Αφρική', Asia:'Ασία', Oceania:'Ωκεανία', 'Australia & NZ':'Αυστραλία και Νέα Ζηλανδία', Europe:'Ευρώπη', Global:'Παγκόσμια', 'Latin America':'Λατινική Αμερική', 'North America':'Βόρεια Αμερική', DACH:'DACH',
      'Animal Liberation':'Απελευθέρωση των ζώων', 'Anti-Imperialism':'Αντιιμπεριαλισμός', 'Anti-Rep & Prisons':'Αντικαταστολή και φυλακές', Anticapitalism:'Αντικαπιταλισμός', Anticolonialism:'Αντιαποικιοκρατία', Antifascism:'Αντιφασισμός', Antiracism:'Αντιρατσισμός', Antisexism:'Αντισεξισμός', Cyberactivism:'Κυβερνοακτιβισμός', Demonstrations:'Διαδηλώσεις', 'Eco-Anarchism':'Οικοαναρχισμός', 'Indigenous Struggles':'Αγώνες αυτοχθόνων', 'Labor Struggles':'Εργατικοί αγώνες', Libraries:'Βιβλιοθήκες', 'Movement News':'Νέα κινημάτων', 'No Borders':'Χωρίς σύνορα', 'No War':'Ενάντια στον πόλεμο', 'Queer-Feminism':'Κουίρ φεμινισμός', 'Radical Health & Disability':'Ριζοσπαστική υγεία και αναπηρία', 'Squatting & Housing':'Καταλήψεις και στέγαση', 'Theory & Strategy':'Θεωρία και στρατηγική'
    },
    tr: {
      Africa:'Afrika', Asia:'Asya', Oceania:'Okyanusya', 'Australia & NZ':'Avustralya ve Yeni Zelanda', Europe:'Avrupa', Global:'Küresel', 'Latin America':'Latin Amerika', 'North America':'Kuzey Amerika', DACH:'DACH',
      'Animal Liberation':'Hayvan özgürlüğü', 'Anti-Imperialism':'Anti-emperyalizm', 'Anti-Rep & Prisons':'Baskı karşıtlığı ve hapishaneler', Anticapitalism:'Antikapitalizm', Anticolonialism:'Sömürgecilik karşıtlığı', Antifascism:'Antifaşizm', Antiracism:'Irkçılık karşıtlığı', Antisexism:'Cinsiyetçilik karşıtlığı', Cyberactivism:'Siber aktivizm', Demonstrations:'Gösteriler', 'Eco-Anarchism':'Eko-anarşizm', 'Indigenous Struggles':'Yerli halkların mücadeleleri', 'Labor Struggles':'Emek mücadeleleri', Libraries:'Kütüphaneler', 'Movement News':'Hareket haberleri', 'No Borders':'Sınırsız', 'No War':'Savaşa hayır', 'Queer-Feminism':'Kuir feminizm', 'Radical Health & Disability':'Radikal sağlık ve engellilik', 'Squatting & Housing':'İşgal evleri ve barınma', 'Theory & Strategy':'Teori ve strateji'
    }
  });

  function classificationLabel(value) {
    const clean = String(value || '').trim();
    if (!clean) return '';
    return CLASSIFICATION_COPY[state.language]?.[clean]
      || CLASSIFICATION_COPY.en[clean]
      || clean;
  }

  function classificationList(values) {
    return (values || []).map(classificationLabel);
  }

  const ORIGIN_COUNTRY_CODES = Object.freeze({
    Argentina:'AR', Australia:'AU', Belarus:'BY', Belgium:'BE', Brazil:'BR', Canada:'CA', Chile:'CL', China:'CN',
    France:'FR', Germany:'DE', Greece:'GR', India:'IN', Iraq:'IQ', Italy:'IT', Kenya:'KE', Mexico:'MX',
    'New Zealand':'NZ', Philippines:'PH', Russia:'RU', 'South Africa':'ZA', Spain:'ES', Sweden:'SE', Switzerland:'CH',
    Tunisia:'TN', Türkiye:'TR', Turkey:'TR', 'United Kingdom':'GB', 'United States':'US'
  });
  const ORIGIN_REGION_COPY = Object.freeze({
    de:{ 'East Africa':'Ostafrika', 'East Asia':'Ostasien', 'Eastern Europe':'Osteuropa', 'Kurdistan Region':'Region Kurdistan', 'South America':'Südamerika', 'South Asia':'Südasien', 'Southern Africa':'Südliches Afrika', 'Southern Europe':'Südeuropa' },
    en:{},
    es:{ 'East Africa':'África Oriental', 'East Asia':'Asia Oriental', 'Eastern Europe':'Europa Oriental', 'Kurdistan Region':'Región del Kurdistán', 'South America':'América del Sur', 'South Asia':'Asia del Sur', 'Southern Africa':'África Austral', 'Southern Europe':'Europa del Sur' },
    fr:{ 'East Africa':'Afrique de l’Est', 'East Asia':'Asie de l’Est', 'Eastern Europe':'Europe de l’Est', 'Kurdistan Region':'Région du Kurdistan', 'South America':'Amérique du Sud', 'South Asia':'Asie du Sud', 'Southern Africa':'Afrique australe', 'Southern Europe':'Europe du Sud' },
    it:{ 'East Africa':'Africa orientale', 'East Asia':'Asia orientale', 'Eastern Europe':'Europa orientale', 'Kurdistan Region':'Regione del Kurdistan', 'South America':'America meridionale', 'South Asia':'Asia meridionale', 'Southern Africa':'Africa australe', 'Southern Europe':'Europa meridionale' },
    pt:{ 'East Africa':'África Oriental', 'East Asia':'Ásia Oriental', 'Eastern Europe':'Europa Oriental', 'Kurdistan Region':'Região do Curdistão', 'South America':'América do Sul', 'South Asia':'Sul da Ásia', 'Southern Africa':'África Austral', 'Southern Europe':'Sul da Europa' },
    ru:{ 'East Africa':'Восточная Африка', 'East Asia':'Восточная Азия', 'Eastern Europe':'Восточная Европа', 'Kurdistan Region':'Регион Курдистан', 'South America':'Южная Америка', 'South Asia':'Южная Азия', 'Southern Africa':'Южная Африка', 'Southern Europe':'Южная Европа' },
    el:{ 'East Africa':'Ανατολική Αφρική', 'East Asia':'Ανατολική Ασία', 'Eastern Europe':'Ανατολική Ευρώπη', 'Kurdistan Region':'Περιφέρεια Κουρδιστάν', 'South America':'Νότια Αμερική', 'South Asia':'Νότια Ασία', 'Southern Africa':'Νότια Αφρική', 'Southern Europe':'Νότια Ευρώπη' },
    tr:{ 'East Africa':'Doğu Afrika', 'East Asia':'Doğu Asya', 'Eastern Europe':'Doğu Avrupa', 'Kurdistan Region':'Kürdistan Bölgesi', 'South America':'Güney Amerika', 'South Asia':'Güney Asya', 'Southern Africa':'Güney Afrika', 'Southern Europe':'Güney Avrupa' }
  });

  function originLabel(value) {
    const clean = String(value || '').trim();
    if (!clean) return '';
    if (Object.prototype.hasOwnProperty.call(CLASSIFICATION_COPY[state.language] || {}, clean)) {
      return classificationLabel(clean);
    }
    const regional = ORIGIN_REGION_COPY[state.language]?.[clean] || ORIGIN_REGION_COPY.en[clean];
    if (regional) return regional;
    const countryCode = ORIGIN_COUNTRY_CODES[clean];
    if (countryCode && typeof Intl?.DisplayNames === 'function') {
      try {
        return new Intl.DisplayNames([state.language], { type: 'region' }).of(countryCode) || clean;
      } catch {}
    }
    return clean;
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function normalizedPreferences(value = {}) {
    const uniqueStrings = key => [...new Set(
      (Array.isArray(value[key]) ? value[key] : []).map(item => String(item || '').trim()).filter(Boolean)
    )];
    const storedBriefingAmount = Number(value.briefingAmount);
    const briefingAmount = storedBriefingAmount === 8 ? 10 : storedBriefingAmount;
    return {
      regions: uniqueStrings('regions'),
      topics: uniqueStrings('topics'),
      sources: uniqueStrings('sources'),
      blockedSources: uniqueStrings('blockedSources'),
      prisonerIds: uniqueStrings('prisonerIds'),
      preferredLanguage: value.preferredLanguage ? supportedLanguage(value.preferredLanguage) : '',
      briefingAmount: BRIEFING_DURATIONS.includes(briefingAmount) ? briefingAmount : 5
    };
  }

  function normalizedBriefingHistory(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 12).map(entry => {
      const articleIds = (Array.isArray(entry?.articleIds) ? entry.articleIds : []).map(core.text).filter(Boolean).slice(0, 30);
      const language = supportedLanguage(entry?.language || 'de');
      const itemCount = DAILY_EDITION_ITEM_COUNTS.includes(Number(entry?.itemCount)) ? Number(entry.itemCount) : Math.max(1, Math.min(10, articleIds.length || 5));
      const editionType = DAILY_EDITION_TYPES.includes(entry?.editionType) ? entry.editionType : 'daily';
      const descriptor = product21.dailyEditionDescriptor({ language, itemCount, editionType, articleIds });
      return {
        createdAt: core.text(entry?.createdAt),
        editionId: descriptor.editionId,
        datasetKey: descriptor.datasetKey,
        language,
        amount: BRIEFING_DURATIONS.includes(Number(entry?.amount)) ? Number(entry.amount) : 5,
        itemCount,
        editionType,
        dailyEdition: entry?.dailyEdition === true,
        progressIndex: Math.max(0, Number(entry?.progressIndex) || 0),
        offlineReady: false,
        audioMode: entry?.audioMode === 'generated-file' ? 'generated-file' : 'device-speech',
        articleIds,
        titles: (Array.isArray(entry?.titles) ? entry.titles : []).map(core.text).filter(Boolean).slice(0, 3)
      };
    }).filter(entry => entry.createdAt && entry.articleIds.length);
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Local storage unavailable', error);
      return false;
    }
  }

  function normalizedUiSettings(value = {}) {
    return {
      theme: ['dark', 'oled', 'soft', 'pink', 'light', 'system', 'contrast'].includes(value.theme) ? value.theme : 'dark',
      fontSize: ['normal', 'large', 'xlarge', '200'].includes(value.fontSize) ? value.fontSize : 'normal',
      density: ['compact', 'standard', 'spacious'].includes(value.density) ? value.density : 'standard'
    };
  }

  function applyUiSettings() {
    state.ui = normalizedUiSettings(state.ui);
    const resolvedTheme = state.ui.theme === 'system'
      ? (systemTheme?.matches ? 'light' : 'dark')
      : state.ui.theme;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.fontSize = state.ui.fontSize;
    document.documentElement.dataset.density = state.ui.density;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      resolvedTheme === 'light' ? '#f3eee5' : resolvedTheme === 'pink' ? '#160710' : '#05080b'
    );
    themeSelect.value = state.ui.theme;
    fontSizeSelect.value = state.ui.fontSize;
    densitySelect.value = state.ui.density;
  }

  function saveUiSettings() {
    state.ui = normalizedUiSettings({
      theme: themeSelect.value,
      fontSize: fontSizeSelect.value,
      density: densitySelect.value
    });
    writeJson(UI_SETTINGS_KEY, state.ui);
    applyUiSettings();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  window.escapeHtml = escapeHtml;
  window.getSafeHttpUrl = core.safeHttpUrl;

  function lexiconFeatureText() {
    const count = state.lexiconSnapshot.terms.length;
    return t('lexiconText').replace(/\b100\b/, String(count || 100));
  }

  function articleLexiconMarkup(value) {
    const annotated = core.annotateGlossaryText(
      value,
      state.lexiconSnapshot.terms,
      state.language,
      12
    );
    return {
      count: annotated.matchCount,
      html: annotated.segments.map(segment => segment.termId
        ? `<button type="button" class="article-lexicon-term" data-action="article-lexicon" data-term="${escapeHtml(segment.termId)}">${escapeHtml(segment.text)}</button>`
        : escapeHtml(segment.text)).join('')
    };
  }

  function applyArticleLexiconMarkup(value) {
    const body = document.querySelector('#next-article-content .article-body');
    if (!body) return;
    const annotated = articleLexiconMarkup(value);
    body.innerHTML = annotated.html;
    const existing = document.querySelector('#next-article-content .article-lexicon-hint');
    if (!annotated.count) {
      existing?.remove();
      return;
    }
    const hint = existing || document.createElement('p');
    hint.className = 'article-lexicon-hint';
    hint.textContent = `A–Z · ${t('inlineGlossaryHint')}`;
    if (!existing) body.before(hint);
  }

  function structuredArticleMarkup(article, translated = false, contentOverride = '') {
    const blocks = translated ? [] : core.normalizeContentBlocks(article?.contentBlocks);
    if (!blocks.length) {
      const paragraphs = core.articleContentParagraphs(
        contentOverride || article?.content || article?.intro || ''
      );
      const inferredImages = core.articleImageUrls(article?.images, article?.image).slice(0, 8);
      const interval = inferredImages.length
        ? Math.max(1, Math.ceil(paragraphs.length / (inferredImages.length + 1)))
        : 0;
      let imageIndex = 0;
      let matchCount = 0;
      const markup = paragraphs.map((paragraph, index) => {
        const annotated = articleLexiconMarkup(paragraph);
        matchCount += annotated.count;
        const shouldInsertImage = imageIndex < inferredImages.length
          && ((index + 1) % interval === 0 || index === paragraphs.length - 1);
        const image = shouldInsertImage ? inferredImages[imageIndex++] : '';
        return `<p>${annotated.html}</p>${image ? `<figure class="article-inline-image article-inline-image--inferred">
          <a href="${escapeHtml(image)}" target="_blank" rel="noopener noreferrer">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(`${t('articleImages')} ${imageIndex}`)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          </a>
        </figure>` : ''}`;
      }).join('');
      return {
        count: matchCount,
        html: `<div class="article-body article-structured-body">${markup}</div>`,
        inlineImages: inferredImages.slice(0, imageIndex)
      };
    }
    let matchCount = 0;
    const inlineImages = [];
    const markup = blocks.map(block => {
      if (block.type === 'image') {
        const image = core.articleImageUrls([block.url], [article.image, ...inlineImages])[0];
        if (!image) return '';
        inlineImages.push(image);
        return `<figure class="article-inline-image">
          <a href="${escapeHtml(image)}" target="_blank" rel="noopener noreferrer">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(block.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          </a>
          ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
        </figure>`;
      }
      const annotated = articleLexiconMarkup(block.text);
      matchCount += annotated.count;
      if (block.type === 'heading') {
        const level = Math.min(4, Math.max(2, Number(block.level) || 2));
        return `<h${level}>${annotated.html}</h${level}>`;
      }
      if (block.type === 'quote') return `<blockquote>${annotated.html}</blockquote>`;
      return `<p>${annotated.html}</p>`;
    }).join('');
    return {
      count: matchCount,
      html: `<div class="article-body article-structured-body">${markup}</div>`,
      inlineImages
    };
  }

  function renderArticleLexiconTerm(termId) {
    const term = state.lexiconSnapshot.terms.find(item => item.id === termId);
    if (!term) return;
    const localized = value => specialty.localized(value, state.language);
    const title = localized(term.title);
    const related = (term.related || []).map(id => state.lexiconSnapshot.terms.find(item => item.id === id)).filter(Boolean);
    const sources = (term.sources || []).map(id => state.lexiconSnapshot.sources.find(item => item.id === id)).filter(Boolean);
    showArticleTool(title, `
      <p class="article-lexicon-summary">${escapeHtml(localized(term.summary))}</p>
      ${localized(term.practice) ? `<h3>${escapeHtml(t('practice'))}</h3><p>${escapeHtml(localized(term.practice))}</p>` : ''}
      ${localized(term.debate) ? `<h3>${escapeHtml(t('debate'))}</h3><p>${escapeHtml(localized(term.debate))}</p>` : ''}
      ${related.length ? `<h3>${escapeHtml(t('related'))}</h3><div class="article-lexicon-related">${related.map(item => `<button type="button" class="tag" data-action="article-lexicon" data-term="${escapeHtml(item.id)}">${escapeHtml(localized(item.title))}</button>`).join('')}</div>` : ''}
      ${sources.length ? `<h3>${escapeHtml(t('glossarySources'))}</h3><div class="article-lexicon-sources">${sources.map(source => {
        const url = core.safeHttpUrl(source.url);
        return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>` : '';
      }).join('')}</div>` : ''}
      <button type="button" class="secondary-button article-lexicon-open" data-action="article-lexicon-open" data-term="${escapeHtml(term.id)}">${escapeHtml(t('openFullGlossary'))}</button>
    `);
  }

  function dateLabel(article) {
    if (!article?.timestamp) return '';
    try {
      return new Intl.DateTimeFormat(state.language, {
        day: '2-digit',
        month: 'short',
        year: new Date(article.timestamp).getFullYear() === new Date().getFullYear()
          ? undefined
          : 'numeric'
      }).format(new Date(article.timestamp));
    } catch {
      return '';
    }
  }

  function applyLanguage() {
    window.currentLang = state.language;
    document.documentElement.lang = state.language;
    languageSelect.value = state.language;
    languageSelect.setAttribute('aria-label', t('language'));
    document.querySelector('.bottom-nav')?.setAttribute('aria-label', t('mainNavigation'));
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    searchInput.placeholder = t('searchPlaceholder');
    document.getElementById('next-search-toggle').setAttribute('aria-label', t('menuSearch'));
    document.getElementById('next-menu-toggle').setAttribute('aria-label', t('menuOpen'));
    document.querySelector('[data-dialog-close]').setAttribute('aria-label', t('close'));
    document.querySelector('[data-menu-close]').setAttribute('aria-label', t('close'));
    document.querySelector('[data-donation-close]').setAttribute('aria-label', t('close'));
    document.querySelector('[data-feedback-close]').setAttribute('aria-label', t('close'));
    document.querySelector('[data-briefing-close]').setAttribute('aria-label', t('close'));
    document.getElementById('next-menu-title').textContent = t('menu');
    document.getElementById('next-menu-display-title').textContent = t('display');
    document.getElementById('next-menu-project-title').textContent = t('project');
    document.getElementById('next-menu-theme-label').textContent = t('theme');
    document.getElementById('next-website-link-label').textContent = 'SOLINARIDAO.COM';
    document.querySelectorAll('[data-website-open]').forEach(element => {
      element.setAttribute('aria-label', `${t('website')} · Solinaridao.com ↗`);
    });
    const websiteNotice = WEBSITE_NOTICE_COPY[state.language] || WEBSITE_NOTICE_COPY.en;
    document.getElementById('next-website-dialog-kicker').textContent = websiteNotice.kicker;
    document.getElementById('next-website-dialog-title').textContent = websiteNotice.title;
    document.getElementById('next-website-dialog-body').textContent = websiteNotice.body;
    document.getElementById('next-website-dialog-warning').textContent = websiteNotice.warning;
    document.getElementById('next-website-dialog-cancel').textContent = websiteNotice.cancel;
    document.getElementById('next-website-dialog-continue').textContent = websiteNotice.continue;
    document.querySelector('[data-website-close]').setAttribute('aria-label', t('close'));
    document.getElementById('next-menu-font-label').textContent = t('fontSize');
    document.getElementById('next-menu-density-label').textContent = t('density');
    [
      [themeSelect, [['dark', 'themeDark'], ['oled', 'themeOled'], ['soft', 'themeSoft'], ['pink', 'themePink'], ['light', 'themeLight'], ['system', 'themeSystem'], ['contrast', 'themeContrast']]],
      [fontSizeSelect, [['normal', 'normal'], ['large', 'large'], ['xlarge', 'xlarge'], ['200', 'font200']]],
      [densitySelect, [['compact', 'compact'], ['standard', 'standard'], ['spacious', 'spacious']]]
    ].forEach(([select, options]) => {
      options.forEach(([value, key]) => {
        const option = select.querySelector(`option[value="${value}"]`);
        if (option) option.textContent = t(key);
      });
    });
    document.getElementById('next-menu-about').textContent = t('aboutProject');
    document.getElementById('next-menu-share-app-label').textContent = t('shareApp');
    document.getElementById('next-menu-feedback').textContent = t('feedback');
    document.getElementById('next-menu-notifications').textContent = t('notifications');
    const privacyLink = document.getElementById('next-menu-privacy');
    privacyLink.textContent = t('privacy');
    privacyLink.href = `privacy.html?lang=${encodeURIComponent(state.language)}&return=${isProduction ? 'app' : 'preview'}`;
    document.getElementById('next-menu-donate-label').textContent = t('donate');
    document.getElementById('next-donation-kicker').textContent = t('donateKicker');
    document.getElementById('next-donation-title').textContent = t('donateTitle');
    document.getElementById('next-donation-body').textContent = t('donateBody');
    document.getElementById('next-donation-warning').textContent = t('donateWarning');
    document.getElementById('next-donation-paypal').textContent = t('donatePaypal');
    document.getElementById('next-donation-cancel').textContent = t('cancel');
    document.getElementById('next-menu-data').textContent = t('localData');
    const updates = MENU_UPDATES_COPY[state.language] || MENU_UPDATES_COPY.en;
    document.getElementById('next-menu-updates-title').textContent = updates.title;
    document.getElementById('next-menu-updates-list').innerHTML = updates.items
      .map(item => `<li>${escapeHtml(item)}</li>`).join('');
    document.querySelector('[data-release-close]')?.setAttribute('aria-label', t('close'));
    window.WRNAudioTools?.updateLabels?.();
    window.WRNSourceProfiles?.updateUi?.(state.language);
  }

  function articleHistoryDate(value) {
    const date = new Date(value || '');
    if (!Number.isFinite(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(state.language, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return date.toISOString().slice(0, 16).replace('T', ' ');
    }
  }

  function articleHistoryMarkup(article) {
    const correction = String(article?.correctionNote || '').trim();
    if (!correction) return '';
    return `<aside class="article-correction" role="note"><strong>${escapeHtml(t('correctionLabel'))}</strong><span>${escapeHtml(correction)}</span></aside>`;
  }

  function feedbackMessagePayload() {
    const type = document.getElementById('next-feedback-type');
    const email = document.getElementById('next-feedback-email').value.trim();
    const message = document.getElementById('next-feedback-message').value.trim();
    const website = document.getElementById('next-feedback-website')?.value.trim() || '';
    const typeLabel = type.selectedOptions?.[0]?.textContent?.trim() || t('feedbackGeneral');
    const subject = `World Revolution News – ${typeLabel}`;
    const lines = [
      `${t('feedbackType')}: ${typeLabel}`,
      email ? `${t('feedbackReply')}: ${email}` : '',
      '',
      message,
      '',
      `App: News App 2 · ${state.language.toUpperCase()}`
    ].filter((line, index, values) => line || (index > 0 && values[index - 1]));
    return {
      subject,
      body: lines.join('\n'),
      message,
      email,
      website,
      type: type.value || 'feedback',
      language: state.language
    };
  }

  function openFeedbackEmail(payload = feedbackMessagePayload()) {
    const mailLink = document.createElement('a');
    mailLink.href = `mailto:worldrevnews@brief.li?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
    mailLink.rel = 'noopener';
    mailLink.click();
  }

  async function submitFeedbackDirectly() {
    const payload = feedbackMessagePayload();
    const messageField = document.getElementById('next-feedback-message');
    const status = document.getElementById('next-feedback-status');
    const submit = document.getElementById('next-feedback-submit');
    if (!payload.message) {
      showToast(t('feedbackRequired'));
      messageField.focus();
      return;
    }
    status.className = 'feedback-status';
    status.textContent = t('feedbackSending');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    try {
      if (navigator.onLine === false) {
        const offlineError = new Error('feedback-offline');
        offlineError.code = 'offline';
        throw offlineError;
      }
      const response = await fetch(window.WRN_CONFIG?.proxyUrl || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': 'wrn-news-app-2-feedback'
        },
        body: JSON.stringify({
          action: 'feedback.submit',
          type: payload.type,
          email: payload.email,
          message: payload.message,
          language: payload.language,
          website: payload.website
        }),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        const requestError = new Error('feedback-request-failed');
        requestError.code = 'request';
        requestError.status = response.status;
        throw requestError;
      }
      status.className = 'feedback-status is-success';
      status.textContent = t('feedbackSent');
      messageField.value = '';
      document.getElementById('next-feedback-email').value = '';
      showToast(t('feedbackSent'));
    } catch (error) {
      const feedbackCopy = FEEDBACK_STATUS_COPY[state.language] || FEEDBACK_STATUS_COPY.en;
      const failureKind = error?.code === 'offline'
        ? 'offline'
        : error?.name === 'AbortError'
          ? 'timeout'
          : 'request';
      const message = failureKind === 'offline'
        ? feedbackCopy.offline
        : failureKind === 'timeout'
          ? feedbackCopy.timeout
          : t('feedbackFailed');
      window.WRNLocalDiagnostics?.record?.('feedback-send', `Feedback delivery: ${failureKind}`, 'feedback');
      status.className = 'feedback-status is-error';
      status.textContent = message;
      showToast(message);
    } finally {
      window.clearTimeout(timeoutId);
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  }

  async function copyFeedbackText() {
    const payload = feedbackMessagePayload();
    const messageField = document.getElementById('next-feedback-message');
    if (!payload.message) {
      showToast(t('feedbackRequired'));
      messageField.focus();
      return;
    }
    const fullText = `${payload.subject}\n\n${payload.body}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const scratch = document.createElement('textarea');
        scratch.value = fullText;
        scratch.setAttribute('readonly', '');
        scratch.style.position = 'fixed';
        scratch.style.opacity = '0';
        document.body.appendChild(scratch);
        scratch.select();
        document.execCommand('copy');
        scratch.remove();
      }
      showToast(t('copied'));
    } catch (error) {
      console.warn('Feedback copy unavailable', error);
      messageField.focus();
      messageField.select();
    }
  }

  function dataStatusLabel() {
    const labels = {
      de: { live: 'Feed aktualisiert', offline: 'Offline-Daten – Live-Feed nicht erreichbar', snapshot: 'Gespeicherter Vorschau-Datenstand' },
      en: { live: 'Feed updated', offline: 'Offline data – live feed unavailable', snapshot: 'Saved preview snapshot' },
      es: { live: 'Feed actualizado', offline: 'Datos sin conexión – feed no disponible', snapshot: 'Instantánea guardada' },
      fr: { live: 'Flux actualisé', offline: 'Données hors ligne – flux indisponible', snapshot: 'Aperçu enregistré' },
      it: { live: 'Feed aggiornato', offline: 'Dati offline – feed non disponibile', snapshot: 'Anteprima salvata' },
      pt: { live: 'Feed atualizado', offline: 'Dados offline – feed indisponível', snapshot: 'Pré-visualização guardada' },
      ru: { live: 'Лента обновлена', offline: 'Офлайн-данные — лента недоступна', snapshot: 'Сохранённый снимок' },
      el: { live: 'Η ροή ενημερώθηκε', offline: 'Δεδομένα εκτός σύνδεσης – η ροή δεν είναι διαθέσιμη', snapshot: 'Αποθηκευμένη προεπισκόπηση' },
      tr: { live: 'Akış güncellendi', offline: 'Çevrimdışı veriler – canlı akış kullanılamıyor', snapshot: 'Kaydedilmiş önizleme' }
    };
    const copy = labels[state.language] || labels.en;
    if (state.dataStatus.mode === 'snapshot') return copy.snapshot;
    if (state.dataStatus.mode !== 'live') return copy.offline;
    return copy.live;
  }

  function dataStatusDetailsMarkup() {
    if (state.dataStatus.mode !== 'live') return '';
    const labels = {
      de:{ fetched:'Abgerufen', published:'Veröffentlicht', pending:'Neue Meldungen warten auf Veröffentlichung' },
      en:{ fetched:'Fetched', published:'Published', pending:'New reports are waiting to be published' },
      es:{ fetched:'Recogido', published:'Publicado', pending:'Hay noticias nuevas pendientes de publicación' },
      fr:{ fetched:'Récupéré', published:'Publié', pending:'De nouveaux articles attendent leur publication' },
      it:{ fetched:'Recuperato', published:'Pubblicato', pending:'Nuove notizie attendono la pubblicazione' },
      pt:{ fetched:'Recolhido', published:'Publicado', pending:'Há novas notícias a aguardar publicação' },
      ru:{ fetched:'Получено', published:'Опубликовано', pending:'Новые материалы ожидают публикации' },
      el:{ fetched:'Ανάκτηση', published:'Δημοσίευση', pending:'Νέες ειδήσεις περιμένουν δημοσίευση' },
      tr:{ fetched:'Alındı', published:'Yayınlandı', pending:'Yeni haberler yayınlanmayı bekliyor' }
    };
    const copy = labels[state.language] || labels.en;
    const fetchedAt = Date.parse(state.dataStatus.lastSuccessfulFetchAt || '');
    const publishedAt = Date.parse(state.dataStatus.lastPublishedAt || state.dataStatus.generatedAt || '');
    const format = value => {
      if (!Number.isFinite(value)) return '';
      try {
        return new Intl.DateTimeFormat(state.language, {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        }).format(new Date(value));
      } catch {
        return '';
      }
    };
    const fetched = format(fetchedAt);
    const published = format(publishedAt);
    const rows = [
      fetched ? `<span>${escapeHtml(copy.fetched)}: ${escapeHtml(fetched)}</span>` : '',
      published ? `<span>${escapeHtml(copy.published)}: ${escapeHtml(published)}</span>` : '',
      state.dataStatus.publishPending ? `<strong>⚠ ${escapeHtml(copy.pending)}</strong>` : ''
    ].filter(Boolean);
    return rows.length
      ? `<div class="data-freshness${state.dataStatus.publishPending ? ' data-freshness--warning' : ''}" role="status">${rows.join('')}</div>`
      : '';
  }

  function translationForLanguage(article, language = state.language) {
    return state.translations?.[language]?.[article.id] || null;
  }

  function translationFor(article) {
    return translationForLanguage(article, state.language);
  }

  function translationSourceLanguage(article, translation = null) {
    const helper = window.WRNLanguageOrigin;
    if (!helper) return null;
    const cachedCode = helper.normalize(translation?.sourceLanguage);
    if (cachedCode) {
      const label = helper.displayName(cachedCode, state.language);
      if (label) return { code: cachedCode, label };
    }
    return helper.fromArticle(article, state.language);
  }

  function translationNoteLabel(article, translation = null) {
    const source = translationSourceLanguage(article, translation);
    return cardCopy.translationNotice(t('translated'), t('translatedFrom'), source?.label || '');
  }

  function newsCardTeaser(article, translation = null, language = state.language) {
    const source = translation
      ? translation.intro || translation.content
      : article?.content || article?.intro;
    return cardCopy.completeFirstSentence(source, language);
  }

  function storeTranslation(article, translation, language = state.language) {
    if (!state.translations[language]) state.translations[language] = {};
    const entry = {
      title: core.text(translation.title),
      intro: cardCopy.completeFirstSentence(translation.intro, language),
      storedAt: new Date().toISOString()
    };
    const source = translationSourceLanguage(article, translation);
    if (source) entry.sourceLanguage = source.code;
    if (translation.content) {
      entry.content = core.text(translation.content);
      entry.fullContent = true;
    }
    state.translations[language][article.id] = entry;
    writeJson(TRANSLATIONS_KEY, state.translations);
  }

  function bookmarks() {
    const values = readJson(BOOKMARKS_KEY, []);
    return Array.isArray(values) ? values : [];
  }

  function isSaved(article) {
    return bookmarks().some(item => core.articleId(item) === article.id);
  }

  function savedArticleById(items, id) {
    return (Array.isArray(items) ? items : []).find(item => core.articleId(item) === id);
  }

  function mergeSavedArticles(items, storedItems = [], preferredItems = []) {
    return (Array.isArray(items) ? items : []).map(bookmark => {
      const id = core.articleId(bookmark);
      const stored = savedArticleById(storedItems, id);
      const preferred = savedArticleById(preferredItems, id);
      const richest = preferred || stored || bookmark;
      const richestContent = [preferred, stored, bookmark]
        .filter(Boolean)
        .sort((left, right) => String(right.content || '').length - String(left.content || '').length)[0];
      return {
        ...bookmark,
        ...richest,
        content: richestContent?.content || richest.content || bookmark.content || '',
        contentBlocks: core.normalizeContentBlocks(
          preferred?.contentBlocks || stored?.contentBlocks || bookmark.contentBlocks
        ),
        images: [...new Set([
          ...(Array.isArray(bookmark.images) ? bookmark.images : []),
          ...(Array.isArray(stored?.images) ? stored.images : []),
          ...(Array.isArray(preferred?.images) ? preferred.images : [])
        ])]
      };
    });
  }

  async function syncOfflineBookmarks(items, preferredItems = []) {
    if (!window.WRNStorage?.putDataset) return false;
    const existing = state.savedArticles.length
      ? state.savedArticles
      : await window.WRNStorage.getDataset?.('news-app-2-saved-articles');
    state.savedArticles = mergeSavedArticles(items, existing, preferredItems);
    const stored = await window.WRNStorage.putDataset(
      'news-app-2-saved-articles',
      state.savedArticles
    );
    if (stored) void window.WRNStorage.requestPersistentStorage?.();
    return stored;
  }

  function savedArticleAssetUrls(article) {
    return [...new Set([
      article?.detailUrl,
      article?.image,
      ...(Array.isArray(article?.images) ? article.images : []),
      ...core.normalizeContentBlocks(article?.contentBlocks)
        .filter(block => block.type === 'image')
        .map(block => block.url)
    ].map(core.safeHttpUrl).filter(Boolean))].slice(0, 30);
  }

  async function cacheSavedArticleAssets(article) {
    if (!('caches' in window)) return false;
    try {
      const cache = await caches.open('wrn-saved-articles-v1');
      const urls = savedArticleAssetUrls(article);
      await Promise.allSettled(urls.map(async url => {
        const sameOrigin = new URL(url, window.location.href).origin === window.location.origin;
        const response = await fetch(url, {
          cache: 'reload',
          credentials: 'omit',
          mode: sameOrigin ? 'same-origin' : 'no-cors'
        });
        if (response.ok || response.type === 'opaque') await cache.put(url, response);
      }));
      return true;
    } catch (error) {
      console.warn('Saved article assets could not be cached', error);
      return false;
    }
  }

  async function removeSavedArticleAssets(article, remainingItems = bookmarks()) {
    if (!('caches' in window)) return false;
    try {
      const cache = await caches.open('wrn-saved-articles-v1');
      const retained = new Set(
        (Array.isArray(remainingItems) ? remainingItems : [])
          .filter(item => core.articleId(item) !== core.articleId(article))
          .flatMap(savedArticleAssetUrls)
      );
      await Promise.allSettled(
        savedArticleAssetUrls(article)
          .filter(url => !retained.has(url))
          .map(url => cache.delete(url))
      );
      return true;
    } catch (error) {
      console.warn('Saved article assets could not be removed', error);
      return false;
    }
  }

  function lightweightBookmark(article) {
    const {
      content, contentBlocks, images, detailHydrated, detailLoading,
      detailFailed, offlineReady, offlineSavedAt, ...bookmark
    } = article || {};
    return bookmark;
  }

  async function removeArticleOffline(article) {
    if (!article) return false;
    const id = core.articleId(article);
    const items = bookmarks().map(item => (
      core.articleId(item) === id ? lightweightBookmark(item) : item
    ));
    writeJson(BOOKMARKS_KEY, items);
    await removeSavedArticleAssets(article, items);
    state.savedArticles = state.savedArticles.map(item => (
      core.articleId(item) === id ? lightweightBookmark(item) : item
    ));
    await window.WRNStorage?.putDataset?.('news-app-2-saved-articles', state.savedArticles);
    showToast(t('offlineRemoved'));
    if (state.view === 'saved') renderSaved();
    return true;
  }

  async function prepareSavedArticle(article, options = {}) {
    if (!article) return false;
    const silent = options?.silent === true;
    if (!silent) showToast(t('savingOffline'));
    if (
      !article.detailHydrated
      && (
        core.articleContentMode(article, article.content) !== 'full'
        || !article.contentBlocks?.length
      )
    ) {
      await hydrateArticleDetail(article);
    }
    const contentMode = core.articleContentMode(article, article.content);
    const offlineArticle = {
      ...article,
      contentMode,
      detailHydrated: article.detailHydrated === true,
      detailLoading: false,
      offlineReady: contentMode === 'full' && Boolean(article.content),
      offlineSavedAt: new Date().toISOString()
    };
    await cacheSavedArticleAssets(offlineArticle);
    const stored = await syncOfflineBookmarks(bookmarks(), [offlineArticle]);
    if (stored && !silent) showToast(t(offlineArticle.offlineReady ? 'offlineComplete' : 'offlineExcerptSaved'));
    if (state.view === 'saved') renderSaved();
    return stored;
  }

  async function loadOfflineBookmarks() {
    const stored = await window.WRNStorage?.getDataset?.('news-app-2-saved-articles');
    state.savedArticles = mergeSavedArticles(bookmarks(), stored || []);
    await syncOfflineBookmarks(bookmarks());
    if (state.view === 'saved') renderSaved();
  }

  function toggleSaved(article) {
    const items = bookmarks();
    const index = items.findIndex(item => core.articleId(item) === article.id);
    const saved = index < 0;
    if (saved) {
      const { contentBlocks, ...bookmark } = article;
      items.push(bookmark);
    }
    else items.splice(index, 1);
    writeJson(BOOKMARKS_KEY, items);
    if (saved) void prepareSavedArticle(article);
    else void (async () => {
      await removeSavedArticleAssets(article, items);
      await syncOfflineBookmarks(items);
    })();
    showToast(saved ? t('articleSaved') : t('articleRemoved'));
    return saved;
  }

  function readArticles() {
    const values = readJson(READ_KEY, []);
    return Array.isArray(values) ? values.filter(Boolean) : [];
  }

  function isRead(article) {
    return readArticles().includes(article?.link || article?.id || '');
  }

  function toggleRead(article) {
    const key = article?.link || article?.id || '';
    if (!key) return false;
    const values = readArticles();
    const index = values.indexOf(key);
    const read = index < 0;
    if (read) values.push(key);
    else values.splice(index, 1);
    writeJson(READ_KEY, values);
    if (read) {
      const positions = readingPositions();
      delete positions[readingKey(article)];
      writeJson(READING_POSITIONS_KEY, positions);
    }
    return read;
  }

  function readingKey(article) {
    return article?.link || article?.id || '';
  }

  function readingPositions() {
    const values = readJson(READING_POSITIONS_KEY, {});
    return values && typeof values === 'object' && !Array.isArray(values) ? values : {};
  }

  function readingPosition(article) {
    return readingPositions()[readingKey(article)] || null;
  }

  function storeReadingPosition(article, container, force = false) {
    const key = readingKey(article);
    if (!key || !container) return;
    const now = Date.now();
    if (!force && now - (storeReadingPosition.lastSave || 0) < 900) return;
    storeReadingPosition.lastSave = now;
    const progress = release.readingProgress(
      container.scrollTop,
      container.scrollHeight,
      container.clientHeight
    );
    const positions = readingPositions();
    if (progress > .985) {
      delete positions[key];
      if (!isRead(article)) {
        const values = readArticles();
        values.push(key);
        writeJson(READ_KEY, [...new Set(values)]);
      }
    } else if (progress > .015) {
      positions[key] = {
        position: Math.max(0, container.scrollTop),
        progress,
        title: article.title,
        source: article.source,
        updatedAt: now
      };
    }
    const trimmed = Object.fromEntries(Object.entries(positions)
      .sort(([, a], [, b]) => Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0))
      .slice(0, 100));
    writeJson(READING_POSITIONS_KEY, trimmed);
    updateArticleReadingMeter(progress);
  }

  function updateArticleReadingMeter(progress) {
    const meter = document.getElementById('next-article-reading-progress');
    const label = document.getElementById('next-article-reading-label');
    const percentage = Math.round(Math.max(0, Math.min(1, Number(progress) || 0)) * 100);
    if (meter) meter.value = percentage;
    if (label) label.textContent = `${percentage} %`;
  }

  function readingProgressMarkup(article) {
    const position = readingPosition(article);
    if (!position?.progress || isRead(article)) return '';
    const percentage = Math.round(position.progress * 100);
    return `<div class="reading-progress">
      <progress value="${percentage}" max="100" aria-label="${escapeHtml(t('readProgress'))}"></progress>
      <span>${percentage} %</span>
    </div>`;
  }

  function zineArticles() {
    const values = readJson(ZINE_KEY, []);
    return Array.isArray(values) ? values.filter(item => item && typeof item === 'object') : [];
  }

  function zineArticleKey(article) {
    return String(
      article?.zineId
      || article?.link
      || `${article?.source || article?.quelleName || ''}::${article?.title || ''}::${article?.pubDate || article?.timestamp || ''}`
    ).trim();
  }

  function newZineId() {
    return `zine-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function safeZineImage(value) {
    const candidate = String(value || '').trim();
    if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(candidate) && candidate.length <= 1_250_000) {
      return candidate;
    }
    return core.safeImageUrl(candidate);
  }

  function isInZine(article) {
    const key = zineArticleKey(article);
    return Boolean(key && zineArticles().some(item => zineArticleKey(item) === key));
  }

  function storeZineArticles(items) {
    writeJson(ZINE_KEY, items);
    window.dispatchEvent(new CustomEvent('wrnzinechange', { detail: { count: items.length } }));
  }

  function toggleZineArticle(article) {
    const items = zineArticles();
    const key = zineArticleKey(article);
    const index = items.findIndex(item => zineArticleKey(item) === key);
    const added = index < 0;
    if (added) {
      items.push({
        ...article,
        zineId: newZineId(),
        zineType: 'article',
        quelleName: article.source,
        pubDate: article.pubDate || (article.timestamp ? new Date(article.timestamp).toISOString() : ''),
        summary: article.intro,
        description: article.content || article.intro
      });
    } else {
      items.splice(index, 1);
    }
    storeZineArticles(items);
    showToast(t(added ? 'zineAdded' : 'zineRemoved'));
    return added;
  }

  function removeZineArticle(key) {
    storeZineArticles(zineArticles().filter(article => zineArticleKey(article) !== key));
    if (state.view === 'media' && state.media.section === 'zine') renderMedia();
  }

  function moveZineArticle(key, offset) {
    const items = zineArticles();
    const index = items.findIndex(item => zineArticleKey(item) === key);
    const destination = index + Number(offset || 0);
    if (index < 0 || destination < 0 || destination >= items.length) return;
    [items[index], items[destination]] = [items[destination], items[index]];
    storeZineArticles(items);
    renderMedia();
  }

  function openZineEditor(key = '', preferredType = 'text') {
    const existing = zineArticles().find(item => zineArticleKey(item) === key) || null;
    const type = existing?.zineType || preferredType;
    const image = safeZineImage(existing?.image || existing?.imageUrl);
    openReleaseDialog(
      t('zine'),
      t('zineEditorTitle'),
      `<form class="zine-item-editor" id="next-zine-item-editor">
        <input type="hidden" name="key" value="${escapeHtml(key)}">
        <label><span>${escapeHtml(t('zineType'))}</span><select name="type">
          <option value="article"${type === 'article' ? ' selected' : ''}>${escapeHtml(t('zineArticleType'))}</option>
          <option value="text"${type === 'text' ? ' selected' : ''}>${escapeHtml(t('zineTextType'))}</option>
          <option value="image"${type === 'image' ? ' selected' : ''}>${escapeHtml(t('zineImageType'))}</option>
        </select></label>
        <label><span>${escapeHtml(t('zineItemTitle'))}</span><input name="title" maxlength="300" value="${escapeHtml(existing?.title || '')}"></label>
        <label><span>${escapeHtml(t('zineItemSource'))}</span><input name="source" maxlength="180" value="${escapeHtml(existing?.source || existing?.quelleName || '')}"></label>
        <label><span>${escapeHtml(t('zineItemText'))}</span><textarea name="content" rows="12" maxlength="40000">${escapeHtml(existing?.description || existing?.content || existing?.intro || '')}</textarea></label>
        <label><span>${escapeHtml(t('zineImageUrl'))}</span><input name="imageUrl" inputmode="url" value="${escapeHtml(image.startsWith('data:') ? '' : image)}"></label>
        <label><span>${escapeHtml(t('zineImageFile'))}</span><input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
        ${image ? `<img class="zine-editor-preview" src="${escapeHtml(image)}" alt="">` : ''}
      </form>`,
      `<button type="button" class="secondary-button" data-release-close>${escapeHtml(t('close'))}</button>
       <button type="button" class="primary-button" data-action="zine-save-item">${escapeHtml(t('zineSaveItem'))}</button>`
    );
  }

  function readZineImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      if (file.size > 900 * 1024) return reject(new Error('image-too-large'));
      const reader = new FileReader();
      reader.onload = () => resolve(safeZineImage(reader.result));
      reader.onerror = () => reject(reader.error || new Error('image-read-failed'));
      reader.readAsDataURL(file);
    });
  }

  async function saveZineEditor() {
    const form = document.getElementById('next-zine-item-editor');
    if (!form) return;
    const data = new FormData(form);
    const key = String(data.get('key') || '');
    const items = zineArticles();
    const index = items.findIndex(item => zineArticleKey(item) === key);
    const existing = index >= 0 ? items[index] : {};
    let fileImage = '';
    try {
      fileImage = await readZineImageFile(form.elements.imageFile?.files?.[0]);
    } catch (error) {
      if (error?.message === 'image-too-large') showToast(t('zineImageTooLarge'));
      return;
    }
    const type = ['article', 'text', 'image'].includes(String(data.get('type'))) ? String(data.get('type')) : 'text';
    const title = core.text(data.get('title')) || (type === 'image' ? t('zineImageType') : t('zineTextType'));
    const content = String(data.get('content') || '').trim().slice(0, 40000);
    const image = fileImage || safeZineImage(data.get('imageUrl')) || safeZineImage(existing.image || existing.imageUrl);
    const updated = {
      ...existing,
      zineId: existing.zineId || newZineId(),
      zineType: type,
      title,
      source: core.text(data.get('source')),
      quelleName: core.text(data.get('source')),
      content,
      description: content,
      intro: core.excerpt(content, 230),
      image: type === 'text' ? '' : image,
      imageUrl: type === 'text' ? '' : image
    };
    if (index >= 0) items[index] = updated;
    else items.push(updated);
    storeZineArticles(items);
    document.getElementById('next-release-dialog')?.close();
    renderMedia();
    showToast(t('zineSaved'));
  }

  function showToast(message) {
    const toast = document.getElementById('next-toast');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
  }

  function openReleaseDialog(kicker, title, body, actions = '') {
    const dialog = document.getElementById('next-release-dialog');
    document.getElementById('next-release-kicker').textContent = kicker;
    document.getElementById('next-release-title').textContent = title;
    document.getElementById('next-release-content').innerHTML = body;
    document.getElementById('next-release-actions').innerHTML = actions;
    if (!dialog.open) dialog.showModal();
    return dialog;
  }

  function renderAbout() {
    const sections = ABOUT_PROJECT_COPY[state.language] || ABOUT_PROJECT_COPY.en;
    openReleaseDialog(
      'World Revolution News',
      t('aboutTitle'),
      `<p class="release-note">${escapeHtml(t('aboutIntro'))}</p>
      <p>${escapeHtml(t('aboutPrinciples'))}</p>
      <div class="about-project-grid">${sections.map(([title, body]) => `<section><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></section>`).join('')}</div>
      ${isProduction ? '' : `<p class="release-note release-danger">${escapeHtml(t('previewIsolation'))}</p>`}`,
      `<button type="button" class="primary-button" data-release-close>${escapeHtml(t('close'))}</button>`
    );
  }

  function localStorageSnapshot() {
    const values = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key) values[key] = localStorage.getItem(key);
    }
    return values;
  }

  function estimatedLocalStorageBytes() {
    return Object.entries(localStorageSnapshot()).reduce(
      (total, [key, value]) => total + new Blob([key, value || '']).size,
      0
    );
  }

  function formatBytes(value) {
    const bytes = Number(value) || 0;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
  }

  function notificationPreferences() {
    return {
      enabled: false,
      breakingOnly: true,
      followedOnly: true,
      corrections: true,
      quietFrom: '22:00',
      quietUntil: '07:00',
      ...readJson(PUSH_PREFS_KEY, {})
    };
  }

  function notificationPermissionLabel() {
    if (!('Notification' in window)) return t('notificationUnsupported');
    if (Notification.permission === 'denied') return t('notificationDenied');
    if (Notification.permission === 'granted') return t('notificationReady');
    return t('notificationOff');
  }

  const NOTIFICATION_DELIVERY_COPY = {
    de: { label: 'News-Zustellung', local: 'Nur Geräte- und Terminerinnerungen', connected: 'Freiwilliger News-Push verbunden', unavailable: 'News-Push auf diesem Gerät nicht verfügbar', failed: 'News-Push konnte nicht verbunden werden', disable: 'Auf diesem Gerät ausschalten' },
    en: { label: 'News delivery', local: 'Device and event reminders only', connected: 'Optional news push connected', unavailable: 'News push unavailable on this device', failed: 'News push could not be connected', disable: 'Turn off on this device' },
    es: { label: 'Envío de noticias', local: 'Solo recordatorios del dispositivo y eventos', connected: 'Notificaciones de noticias conectadas', unavailable: 'Notificaciones no disponibles en este dispositivo', failed: 'No se pudieron conectar las notificaciones', disable: 'Desactivar en este dispositivo' },
    fr: { label: 'Diffusion des actualités', local: 'Rappels locaux et d’événements uniquement', connected: 'Notifications d’actualité connectées', unavailable: 'Notifications indisponibles sur cet appareil', failed: 'Connexion des notifications impossible', disable: 'Désactiver sur cet appareil' },
    it: { label: 'Invio notizie', local: 'Solo promemoria del dispositivo e degli eventi', connected: 'Notifiche news collegate', unavailable: 'Notifiche non disponibili su questo dispositivo', failed: 'Impossibile collegare le notifiche', disable: 'Disattiva su questo dispositivo' },
    pt: { label: 'Envio de notícias', local: 'Apenas lembretes do dispositivo e de eventos', connected: 'Notificações de notícias ligadas', unavailable: 'Notificações indisponíveis neste dispositivo', failed: 'Não foi possível ligar as notificações', disable: 'Desativar neste dispositivo' },
    ru: { label: 'Доставка новостей', local: 'Только напоминания устройства и событий', connected: 'Добровольные уведомления подключены', unavailable: 'Уведомления недоступны на устройстве', failed: 'Не удалось подключить уведомления', disable: 'Отключить на устройстве' },
    el: { label: 'Αποστολή ειδήσεων', local: 'Μόνο υπενθυμίσεις συσκευής και εκδηλώσεων', connected: 'Οι προαιρετικές ειδοποιήσεις συνδέθηκαν', unavailable: 'Οι ειδοποιήσεις δεν διατίθενται στη συσκευή', failed: 'Η σύνδεση ειδοποιήσεων απέτυχε', disable: 'Απενεργοποίηση στη συσκευή' },
    tr: { label: 'Haber iletimi', local: 'Yalnızca cihaz ve etkinlik hatırlatıcıları', connected: 'İsteğe bağlı haber bildirimleri bağlandı', unavailable: 'Haber bildirimleri bu cihazda kullanılamıyor', failed: 'Haber bildirimleri bağlanamadı', disable: 'Bu cihazda kapat' }
  };

  function notificationDeliveryCopy() {
    return NOTIFICATION_DELIVERY_COPY[state.language]
      || NOTIFICATION_DELIVERY_COPY.en;
  }

  function pushConfiguration() {
    const value = window.WRN_CONFIG?.push || {};
    const publicKey = String(value.publicKey || '').trim();
    const publicKeyUrl = String(value.publicKeyUrl || '').trim();
    const subscriptionUrl = String(value.subscriptionUrl || '').trim();
    let validUrl = '';
    let validKeyUrl = '';
    try {
      const parsed = new URL(subscriptionUrl);
      if (parsed.protocol === 'https:') validUrl = parsed.href;
    } catch {}
    try {
      const parsed = new URL(publicKeyUrl);
      if (parsed.protocol === 'https:') validKeyUrl = parsed.href;
    } catch {}
    return {
      enabled: Boolean(value.enabled && (publicKey || validKeyUrl) && validUrl),
      publicKey,
      publicKeyUrl: validKeyUrl,
      subscriptionUrl: validUrl
    };
  }

  async function configuredPushPublicKey(config) {
    if (config.publicKey) return config.publicKey;
    const response = await fetch(config.publicKeyUrl, { cache: 'no-store', credentials: 'omit' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.enabled || !payload.publicKey) throw new Error('Push gateway unavailable');
    return String(payload.publicKey);
  }

  function supportsWebPush() {
    return Boolean(
      'Notification' in window
      && 'serviceWorker' in navigator
      && 'PushManager' in window
    );
  }

  function decodeApplicationServerKey(value) {
    const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${normalized}${'='.repeat((4 - normalized.length % 4) % 4)}`;
    const raw = window.atob(padded);
    return Uint8Array.from(raw, character => character.charCodeAt(0));
  }

  async function currentPushSubscription() {
    if (!supportsWebPush()) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }

  async function refreshNotificationDeliveryStatus(status = '') {
    const target = document.getElementById('next-notification-delivery');
    if (!target) return;
    const copy = notificationDeliveryCopy();
    if (status === 'failed') {
      target.textContent = copy.failed;
      return;
    }
    if (!supportsWebPush()) {
      target.textContent = copy.unavailable;
      return;
    }
    if (!pushConfiguration().enabled) {
      target.textContent = copy.local;
      return;
    }
    try {
      target.textContent = await currentPushSubscription() ? copy.connected : copy.local;
    } catch {
      target.textContent = copy.failed;
    }
  }

  async function connectPushSubscription(prefs) {
    const config = pushConfiguration();
    if (!config.enabled || !supportsWebPush()) return false;
    const publicKey = await configuredPushPublicKey(config);
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeApplicationServerKey(publicKey)
      });
    }
    const response = await fetch(config.subscriptionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: {
          ...prefs,
          regions: [...new Set(state.preferences.regions || [])],
          topics: [...new Set(state.preferences.topics || [])]
        },
        language: state.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        appVersion: String(window.WRN_CONFIG?.version || '')
      })
    });
    if (!response.ok) throw new Error(`Push subscription failed (${response.status})`);
    return true;
  }

  async function disconnectPushSubscription() {
    try {
      const subscription = await currentPushSubscription();
      if (subscription) {
        const config = pushConfiguration();
        if (config.subscriptionUrl) {
          await fetch(config.subscriptionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'push.unsubscribe', endpoint: subscription.endpoint })
          }).catch(() => null);
        }
        await subscription.unsubscribe();
      }
    } catch {}
  }

  function renderNotificationSettings() {
    const prefs = notificationPreferences();
    const checked = value => value ? ' checked' : '';
    const delivery = notificationDeliveryCopy();
    openReleaseDialog(
      t('notifications'),
      t('notificationTitle'),
      `<p>${escapeHtml(t('notificationIntro'))}</p>
      <div class="notification-permission"><span>${escapeHtml(t('notificationStatus'))}</span><strong>${escapeHtml(notificationPermissionLabel())}</strong></div>
      <fieldset class="notification-settings">
        <label><input id="next-notify-breaking" type="checkbox"${checked(prefs.breakingOnly)}> <span>${escapeHtml(t('pushBreaking'))}</span></label>
        <label><input id="next-notify-followed" type="checkbox"${checked(prefs.followedOnly)}> <span>${escapeHtml(t('pushFollowed'))}</span></label>
        <label><input id="next-notify-corrections" type="checkbox"${checked(prefs.corrections)}> <span>${escapeHtml(t('pushCorrections'))}</span></label>
        <legend>${escapeHtml(t('quietHours'))}</legend>
        <div class="notification-times">
          <label><span>${escapeHtml(t('quietFrom'))}</span><input id="next-notify-from" type="time" value="${escapeHtml(prefs.quietFrom)}"></label>
          <label><span>${escapeHtml(t('quietUntil'))}</span><input id="next-notify-until" type="time" value="${escapeHtml(prefs.quietUntil)}"></label>
        </div>
      </fieldset>`,
      `<button type="button" data-action="notifications-enable">${escapeHtml(t('enableNotifications'))}</button>
       ${prefs.enabled ? `<button type="button" data-action="notifications-disable">${escapeHtml(delivery.disable)}</button>` : ''}
       <button type="button" class="primary-button" data-action="notifications-save">${escapeHtml(t('saveNotificationSettings'))}</button>`
    );
  }

  function saveNotificationSettings(enabled = null) {
    const previous = notificationPreferences();
    const prefs = {
      enabled: enabled === null ? previous.enabled : Boolean(enabled),
      breakingOnly: Boolean(document.getElementById('next-notify-breaking')?.checked),
      followedOnly: Boolean(document.getElementById('next-notify-followed')?.checked),
      corrections: Boolean(document.getElementById('next-notify-corrections')?.checked),
      quietFrom: document.getElementById('next-notify-from')?.value || '22:00',
      quietUntil: document.getElementById('next-notify-until')?.value || '07:00'
    };
    writeJson(PUSH_PREFS_KEY, prefs);
    showToast(t('notificationSaved'));
    return prefs;
  }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      showToast(t('notificationUnsupported'));
      return;
    }
    const permission = await Notification.requestPermission();
    const prefs = saveNotificationSettings(permission === 'granted');
    if (permission === 'granted') {
      try {
        await connectPushSubscription(prefs);
      } catch (error) {
        window.WRNDiagnostics?.record?.('push-subscription', error);
        renderNotificationSettings();
        void refreshNotificationDeliveryStatus('failed');
        return;
      }
    }
    renderNotificationSettings();
  }

  async function updateNotificationSettings() {
    const prefs = saveNotificationSettings();
    if (prefs.enabled && Notification.permission === 'granted') {
      try {
        await connectPushSubscription(prefs);
      } catch (error) {
        window.WRNDiagnostics?.record?.('push-preferences', error);
        void refreshNotificationDeliveryStatus('failed');
      }
    }
  }

  async function disableNotifications() {
    await disconnectPushSubscription();
    saveNotificationSettings(false);
    renderNotificationSettings();
  }

  function renderDataControl() {
    openReleaseDialog(
      t('localData'),
      t('localData'),
      `<div class="data-overview">
        <div><span>${escapeHtml(t('bookmarks'))}</span><strong>${bookmarks().length}</strong></div>
        <div><span>${escapeHtml(t('readArticles'))}</span><strong>${readArticles().length}</strong></div>
        <div><span>${escapeHtml(t('zineItems'))}</span><strong>${zineArticles().length}</strong></div>
        <div><span>${escapeHtml(t('videoLater'))}</span><strong>${Array.isArray(state.videoWatchLater) ? state.videoWatchLater.length : 0}</strong></div>
        <div><span>${escapeHtml(t('videoViewed'))}</span><strong>${Array.isArray(state.videoHistory) ? state.videoHistory.length : 0}</strong></div>
        <div><span>${escapeHtml(t('offlineArticles'))}</span><strong>${state.savedArticles.filter(article => article.offlineReady).length}</strong></div>
        <div><span>${escapeHtml(t('briefingHistory'))}</span><strong>${state.briefingHistory.length}</strong></div>
      </div>
      <div class="release-action-grid">
        <button type="button" data-action="data-export">${escapeHtml(t('exportBackup'))}</button>
        <button type="button" data-action="data-import">${escapeHtml(t('importBackup'))}</button>
        <button type="button" data-action="data-clear-reading">${escapeHtml(t('clearReading'))}</button>
        <button type="button" data-action="data-clear-offline">${escapeHtml(t('clearOffline'))}</button>
        <button type="button" data-action="data-clear-all">${escapeHtml(t('clearAll'))}</button>
      </div>`,
      `<button type="button" class="primary-button" data-release-close>${escapeHtml(t('close'))}</button>`
    );
  }

  function exportLocalDiagnostics() {
    const payload = window.WRNLocalDiagnostics?.exportPayload?.();
    if (!payload) return;
    downloadText(
      `world-revolution-news-errors-${new Date().toISOString().slice(0, 10)}.json`,
      `${JSON.stringify(payload, null, 2)}\n`,
      'application/json;charset=utf-8'
    );
  }

  function clearLocalDiagnostics() {
    window.WRNLocalDiagnostics?.clear?.();
    showToast(t('diagnosticsCleared'));
    renderDataControl();
  }

  function exportDataBackup() {
    const backup = release.backupPayload(localStorageSnapshot(), window.WRN_CONFIG?.version || '');
    downloadText(
      `world-revolution-news-backup-${new Date().toISOString().slice(0, 10)}.json`,
      `${JSON.stringify(backup, null, 2)}\n`,
      'application/json;charset=utf-8'
    );
    showToast(t('backupExported'));
  }

  async function importDataBackup(file) {
    if (!file || file.size > 8 * 1024 * 1024) return showToast(t('invalidBackup'));
    try {
      const data = JSON.parse(await file.text());
      if (!release.validBackup(data)) throw new Error('Invalid backup');
      const sanitized = release.backupPayload(data.localStorage, data.appVersion).localStorage;
      Object.entries(sanitized).forEach(([key, value]) => localStorage.setItem(key, value));
      showToast(t('backupImported'));
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      console.warn('Backup import failed', error);
      showToast(t('invalidBackup'));
    }
  }

  async function clearPreviewCaches() {
    if (!('caches' in window)) return;
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith('wrn-news-app-2-') || name === 'wrn-saved-articles-v1')
        .map(name => caches.delete(name))
    );
  }

  async function clearLocalData(category) {
    if (category === 'reading') {
      if (!window.confirm(t('clearReadingConfirm'))) return;
      [BOOKMARKS_KEY, READ_KEY, READING_POSITIONS_KEY, ZINE_KEY, VIDEO_WATCH_LATER_KEY, VIDEO_HISTORY_KEY, BRIEFING_HISTORY_KEY].forEach(key => localStorage.removeItem(key));
      state.videoWatchLater = [];
      state.videoHistory = [];
      state.briefingHistory = [];
      await window.WRNStorage?.putDataset?.('news-app-2-saved-articles', []);
      if ('caches' in window) await caches.delete('wrn-saved-articles-v1');
    } else if (category === 'offline') {
      if (!window.confirm(t('clearOfflineConfirm'))) return;
      await clearPreviewCaches();
      await window.WRNStorage?.clearAll?.();
    } else {
      if (!window.confirm(t('clearAllConfirm'))) return;
      [...Array(localStorage.length)].map((_, index) => localStorage.key(index))
        .filter(key => key?.startsWith('wrn_'))
        .forEach(key => localStorage.removeItem(key));
      await clearPreviewCaches();
      await window.WRNStorage?.clearAll?.();
    }
    showToast(t('selectedDataCleared'));
    renderDataControl();
  }

  async function renderSystemStatus() {
    openReleaseDialog(
      t('systemStatus'),
      t('systemStatus'),
      `<p class="release-note">${escapeHtml(t('checking'))}</p>`,
      `<button type="button" class="primary-button" data-release-close>${escapeHtml(t('close'))}</button>`
    );
    const [translation, sourceResult, cacheNames] = await Promise.all([
      window.WRNSharedTranslations?.health?.().catch(error => ({ ok: false, error: String(error) }))
        || Promise.resolve({ ok: false }),
      window.WRNSourceVerification?.refresh?.().catch(error => ({ ok: false, error: String(error) }))
        || Promise.resolve(null),
      'caches' in window ? caches.keys().catch(() => []) : Promise.resolve([])
    ]);
    const sourceSummary = window.WRNSourceVerification?.summary?.() || {};
    const serviceWorkerActive = Boolean(navigator.serviceWorker?.controller);
    const sourceOk = Number(sourceSummary.error || 0) === 0 && Number(sourceSummary.total || 0) > 0;
    const online = navigator.onLine;
    document.getElementById('next-release-content').innerHTML = `
      <div class="status-overview">
        <div><span>${escapeHtml(t('statusOnline'))}</span><strong class="${online ? 'system-ok' : 'system-warning'}">${escapeHtml(t(online ? 'online' : 'offline'))}</strong></div>
        <div><span>${escapeHtml(t('statusData'))}</span><strong class="${state.articles.length ? 'system-ok' : 'system-warning'}">${state.articles.length}</strong></div>
        <div><span>${escapeHtml(t('statusEvents'))}</span><strong class="${state.events.length ? 'system-ok' : 'system-warning'}">${state.events.length}</strong></div>
        <div><span>${escapeHtml(t('statusSources'))}</span><strong class="${sourceOk ? 'system-ok' : 'system-warning'}">${sourceSummary.ok || 0} / ${sourceSummary.total || 0}</strong></div>
        <div><span>${escapeHtml(t('statusTranslation'))}</span><strong class="${translation?.ok ? 'system-ok' : 'system-warning'}">${escapeHtml(translation?.ok ? t('available') : t('offline'))}</strong></div>
        <div><span>${escapeHtml(t('statusOffline'))}</span><strong class="${serviceWorkerActive ? 'system-ok' : ''}">${serviceWorkerActive ? 'Service Worker aktiv' : `${cacheNames.filter(name => name.startsWith('wrn-news-app-2-')).length} Cache`}</strong></div>
      </div>
      <div class="release-action-grid">
        <a href="source-check.html">${escapeHtml(t('sourceCheck'))}</a>
        <a href="app-check.html">${escapeHtml(t('selfTest'))}</a>
      </div>`;
    void sourceResult;
  }

  function cardMarkup(article) {
    const cardIndex = state.cardArticles.push(article) - 1;
    const translation = translationFor(article);
    const title = translation?.title || article.title;
    const intro = newsCardTeaser(article, translation);
    const saved = isSaved(article);
    const image = article.image
      ? `<div class="news-card__image" data-optional-image><img src="${escapeHtml(article.image)}" alt="" loading="lazy" decoding="async" sizes="(max-width: 560px) calc(100vw - 28px), (max-width: 820px) 34vw, 18vw" referrerpolicy="no-referrer"></div>`
      : '';
    const preferenceReasons = state.view === 'following'
      ? [
          (state.preferences.regions || []).includes(article.primaryRegion) ? classificationLabel(article.primaryRegion) : '',
          (state.preferences.topics || []).includes(article.primaryTopic) ? classificationLabel(article.primaryTopic) : '',
          (state.preferences.sources || []).includes(article.source) ? article.source : ''
        ].filter(Boolean)
      : [];
    const offlineControl = state.view === 'saved' && state.savedMode === 'bookmarks'
      ? `<button class="small-action" type="button" data-action="${article.offlineReady ? 'offline-remove' : 'offline-save'}" data-index="${cardIndex}">${escapeHtml(t(article.offlineReady ? 'offlineRemove' : 'offlineSave'))}</button>`
      : '';

    return `
      <article class="news-card" data-card-index="${cardIndex}">
        <div class="news-card__body">
          <div class="meta-line">
            <button class="source-profile-trigger" type="button" data-action="source-profile" data-source="${escapeHtml(article.source)}" aria-label="${escapeHtml(`${t('sourceProfile')}: ${article.source}`)}">${escapeHtml(article.source)}</button>
            <span>${escapeHtml(dateLabel(article))}</span>
          </div>
          ${window.WRNSourceProfiles?.badgeMarkup?.(article, state.language) || ''}
          <button class="news-card__open" type="button" data-action="open" data-index="${cardIndex}">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(intro || '')}</p>
          </button>
          <div class="meta-line article-classification">
            ${article.primaryRegion ? `<span class="tag">${escapeHtml(classificationLabel(article.primaryRegion))}</span>` : ''}
            ${article.primaryTopic ? `<span class="tag optional-meta">${escapeHtml(classificationLabel(article.primaryTopic))}</span>` : ''}
          </div>
          ${preferenceReasons.length ? `<small class="preference-reason">${escapeHtml(t('shownBecause'))}: ${escapeHtml(preferenceReasons.join(' · '))}</small>` : ''}
          ${translation ? `<small class="translation-note">${escapeHtml(translationNoteLabel(article, translation))}</small>` : ''}
          ${article.offlineReady ? `<small class="offline-ready-note">✓ ${escapeHtml(t('offlineComplete'))}</small>` : ''}
          ${readingProgressMarkup(article)}
          <div class="card-actions">
            <button class="small-action" type="button" data-action="open" data-index="${cardIndex}">${escapeHtml(t('openArticle'))}</button>
            ${offlineControl}
            <button class="translate-card" type="button" data-action="translate" data-index="${cardIndex}">
              <span class="red-black-star" aria-hidden="true">★</span>
              <span>${escapeHtml(t('translate'))}</span>
            </button>
            <button class="save-card" type="button" data-action="save" data-index="${cardIndex}" aria-label="${escapeHtml(saved ? t('removeSaved') : t('save'))}" aria-pressed="${saved}">${saved ? '★' : '☆'}</button>
          </div>
        </div>
        ${image}
      </article>`;
  }

  function cardsMarkup(items) {
    if (!items.length) {
      return `<div class="empty-state"><strong>${escapeHtml(t('noMatches'))}</strong><p>${escapeHtml(t('noMatchesText'))}</p></div>`;
    }
    const viewMode = state.view === 'discover' ? state.discover.viewMode : 'cards';
    return `<div class="article-grid" data-view-mode="${escapeHtml(viewMode)}">${items.map(cardMarkup).join('')}</div>`;
  }

  function headingMarkup(eyebrow, title, intro, action = '') {
    return `
      <header class="view-heading">
        <div>
          <span class="eyebrow">${escapeHtml(eyebrow)}</span>
          <h1>${escapeHtml(title)}</h1>
          ${intro ? `<p>${escapeHtml(intro)}</p>` : ''}
        </div>
        ${action}
      </header>`;
  }

  function eventRegion(event) {
    return EVENT_REGION_BY_COUNTRY[String(event?.country || '').toUpperCase()] || 'Global';
  }

  function eventsForRegions(items, regions) {
    const selected = new Set((regions || []).filter(Boolean));
    if (!selected.size) return items;
    return items.filter(event => selected.has(eventRegion(event)));
  }

  function preferredHomeEvents() {
    const preferredRegions = [...new Set(state.preferences.regions || [])];
    const locationActive = Boolean(state.eventFilter.location && Number(state.eventFilter.radius));
    let items = release.filterEvents(state.events, {
      archived: false,
      location: locationActive ? state.eventFilter.location : null,
      radius: locationActive ? state.eventFilter.radius : 0
    });
    if (!locationActive) items = eventsForRegions(items, preferredRegions);
    items.sort((first, second) => {
      if (locationActive) {
        const distance = (first.distanceKm ?? Infinity) - (second.distanceKm ?? Infinity);
        if (distance) return distance;
      }
      return Number(first.start) - Number(second.start);
    });
    return {
      items: items.slice(0, 2),
      regions: locationActive ? [] : preferredRegions,
      context: locationActive
        ? `${t('nearMe')} · ${state.eventFilter.radius} km`
        : preferredRegions.length
          ? classificationList(preferredRegions).join(' · ')
          : t('allRegions')
    };
  }

  function homeServiceData() {
    const developments = specialty
      .developmentClusters(state.articles, window.WRNStoriesCore, {
        days: 30,
        threshold: DEVELOPMENT_MATCH_THRESHOLD
      })
      .slice(0, 2);
    const homeEvents = preferredHomeEvents();
    return { developments, homeEvents };
  }

  function developmentHomeTitle(story) {
    const anchor = Array.isArray(story?.items) ? story.items.at(-1) : null;
    return translationFor(anchor)?.title || story?.title || '';
  }

  function homeServiceMarkup(serviceData = homeServiceData()) {
    const { developments, homeEvents } = serviceData;
    if (!developments.length && !state.events.length) return '';

    return `
      <section class="home-service-grid" aria-label="${escapeHtml(`${t('developments')} · ${t('events')}`)}">
        ${developments.length ? `<article class="home-service-card">
          <header>
            <div><span class="eyebrow">${escapeHtml(t('sourceMix'))}</span><h2>${escapeHtml(t('developments'))}</h2></div>
            <button type="button" class="home-service-link" data-view-target="developments" aria-label="${escapeHtml(t('developments'))}">→</button>
          </header>
          <ol class="home-service-list">${developments.map(story => `<li><button type="button" data-view-target="developments" data-dossier-id="${escapeHtml(story.id)}">
            <strong>${escapeHtml(developmentHomeTitle(story))}</strong>
            <small>${story.itemCount} ${escapeHtml(t('storyArticles'))} · ${story.sourceCount} ${escapeHtml(t('storySources'))}</small>
          </button></li>`).join('')}</ol>
        </article>` : ''}
        ${state.events.length ? `<article class="home-service-card">
          <header>
            <div><span class="eyebrow">${escapeHtml(homeEvents.context)}</span><h2>${escapeHtml(t('eventUpcoming'))}</h2></div>
            <button type="button" class="home-service-link" data-action="home-events" aria-label="${escapeHtml(t('eventUpcoming'))}">→</button>
          </header>
          ${homeEvents.items.length ? `<ol class="home-service-list">${homeEvents.items.map(event => `<li>
            <strong>${escapeHtml(translationFor(event)?.title || event.title)}</strong>
            <small>${escapeHtml(eventWhenLabel(event))}${event.city ? ` · ${escapeHtml(event.city)}` : ''}</small>
          </li>`).join('')}</ol>` : `<p class="home-service-empty">${escapeHtml(t('noEvents'))}</p>`}
        </article>` : ''}
      </section>`;
  }

  function personalizedHomeGroups(items, excludedIds = []) {
    const hasArticlePreferences = ['regions', 'topics', 'sources']
      .some(key => Array.isArray(state.preferences[key]) && state.preferences[key].length);
    if (!hasArticlePreferences) return { personalized: [], remaining: items };

    const excluded = new Set(excludedIds);
    const personalized = core.balanceBySource(
      state.articles.filter(article =>
        !excluded.has(article.id)
        && core.matchesPreferences(article, state.preferences)
      ),
      3,
      1
    );
    const personalizedIds = new Set(personalized.map(article => article.id));
    return {
      personalized,
      remaining: items
        .filter(article => !personalizedIds.has(article.id))
        .slice(0, Math.max(0, HOME_COUNT - 1 - personalized.length))
    };
  }

  function personalizedHomeMarkup(items) {
    if (!items.length) return '';
    const context = [
      ...classificationList(state.preferences.regions || []),
      ...classificationList(state.preferences.topics || []),
      ...(state.preferences.sources || [])
    ].slice(0, 4).join(' · ');
    return `
      <section class="home-personalized-section">
        <div class="section-heading">
          <div>
            <h2>${escapeHtml(t('personalTitle'))}</h2>
            <small>${escapeHtml(context || t('personalIntro'))}</small>
          </div>
          <button class="section-text-action" type="button" data-view-target="following">${escapeHtml(t('following'))} →</button>
        </div>
        ${cardsMarkup(items)}
      </section>`;
  }

  function homeTodayData(dailyItems, homeServices) {
    const now = Date.now();
    const validPreviousVisit = previousVisitAt > 0 && previousVisitAt < currentVisitStartedAt
      && previousVisitAt > now - (90 * 86400_000);
    const since = validPreviousVisit ? previousVisitAt : now - 86400_000;
    const newItems = state.articles
      .filter(article => {
        const timestamp = core.dateValue(article);
        return timestamp > since && timestamp <= now && core.isLeadEligible(article);
      })
      .sort((first, second) => core.dateValue(second) - core.dateValue(first));
    const recent = state.articles.filter(article => {
      const timestamp = core.dateValue(article);
      return timestamp >= now - (7 * 86400_000) && timestamp <= now;
    }).slice(0, 160);
    const languageCounts = new Map();
    recent.forEach(article => {
      const language = core.text(article.language || article.languages?.[0] || 'und').split(/[-_]/)[0];
      if (!language || language === 'und') return;
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
    });
    const regions = new Set(recent.map(article => core.text(article.primaryRegion)).filter(Boolean));
    const sources = new Set(recent.map(article => core.text(article.source || article.quelleName)).filter(Boolean));
    const dominantLanguageShare = recent.length
      ? Math.max(0, ...languageCounts.values()) / recent.length
      : 1;
    const coverageNarrow = recent.length < 12 || languageCounts.size < 3 || dominantLanguageShare > .62;
    const verifiedActions = product21.activeVerifiedActions(state.solidarityActions, now);
    const clusters = developmentClusters();
    const currentSnapshot = product21.createDevelopmentSnapshot(clusters, verifiedActions, new Date(now).toISOString());
    state.developmentSnapshotCurrent = currentSnapshot;
    state.developmentChanges = product21.snapshotDiff(state.developmentSnapshotBeforeVisit, currentSnapshot);
    if (!state.developmentSnapshotStored) {
      state.developmentSnapshotHistory = product21.appendSnapshotHistory(
        state.developmentSnapshotHistory,
        currentSnapshot,
        7
      );
      writeJson(DEVELOPMENT_SNAPSHOT_KEY, state.developmentSnapshotHistory);
      state.developmentSnapshotStored = true;
    }
    const overlooked = product21.overlookedClusters(clusters, developmentSourceMetadata);
    return {
      dailyItems: dailyItems.slice(0, 10),
      newItems,
      firstVisit: !validPreviousVisit,
      coverage: { languages: languageCounts.size, regions: regions.size, sources: sources.size, narrow: coverageNarrow },
      verifiedActions,
      solidarityAssessments: state.solidarityActions.map(action => product21.solidarityActionAssessment(action, now)),
      developmentChanges: state.developmentChanges,
      overlooked,
      dossierCount: homeServices.developments.length
    };
  }

  function homeTodayMarkup(data) {
    state.dailyEditionItems = data.dailyItems;
    const rejectedActionCount = data.solidarityAssessments.filter(item => !item.eligible).length;
    const updates = (data.firstVisit ? [] : data.newItems.slice(0, 2)).map(article => {
      const index = state.cardArticles.push(article) - 1;
      const translated = translationFor(article);
      return `<button type="button" data-action="open" data-index="${index}"><strong>${escapeHtml(translated?.title || article.title)}</strong><small>${escapeHtml(article.source || article.quelleName || '')}</small></button>`;
    }).join('');
    const dossierUpdates = data.developmentChanges.firstVisit ? '' : data.developmentChanges.changes.slice(0, 3).map(change =>
      change.removedCluster
        ? `<div class="home-today-removed"><strong>${escapeHtml(change.title)}</strong><small>${escapeHtml(t('dossierRemoved'))}</small></div>`
        : `<button type="button" data-view-target="developments" data-dossier-id="${escapeHtml(change.clusterId)}"><strong>${escapeHtml(change.title)}</strong><small>${change.total} ${escapeHtml(t('dossierChanges'))}</small></button>`
    ).join('');
    return `<section class="home-today" aria-labelledby="home-today-title">
      <div class="section-heading home-today__heading"><div><span class="eyebrow">${escapeHtml(t('todayIntro'))}</span><h2 id="home-today-title">${escapeHtml(t('todayTitle'))}</h2></div></div>
      <div class="home-today__grid">
        <article class="home-today-card home-today-card--updates">
          <header><span aria-hidden="true">↻</span><div><small>${escapeHtml(t(data.firstVisit ? 'firstVisit' : 'sinceVisit'))}</small><strong>${data.newItems.length} ${escapeHtml(t('newReports'))}</strong></div></header>
          ${updates || dossierUpdates ? `<div class="home-today-updates">${updates}${dossierUpdates}</div>` : ''}
          <button class="home-today-link" type="button" data-action="open-archive" data-period="7d">${escapeHtml(t('archiveBrowse'))} →</button>
        </article>
        <article class="home-today-card${data.coverage.narrow ? ' has-warning' : ''}">
          <header><span aria-hidden="true">◎</span><div><small>${escapeHtml(t('coverage'))}</small><strong>${escapeHtml(t(data.coverage.narrow ? 'coverageNarrow' : 'coverageGood'))}</strong></div></header>
          <div class="home-today-metrics"><span><b>${data.coverage.languages}</b>${escapeHtml(t('languagesCount'))}</span><span><b>${data.coverage.regions}</b>${escapeHtml(t('regionsCount'))}</span><span><b>${data.coverage.sources}</b>${escapeHtml(t('sourcesCount'))}</span></div>
          ${data.coverage.narrow ? `<small class="home-today-warning">${escapeHtml(t('blindSpot'))}</small>` : ''}
          <button class="home-today-link" type="button" data-view-target="discover">${escapeHtml(t('sourcesCount'))} →</button>
        </article>
        <article class="home-today-card">
          <header><span aria-hidden="true">◫</span><div><small>${escapeHtml(t('dailyEdition'))}</small><strong>${data.dailyItems.length} ${escapeHtml(t('briefingItems'))}</strong></div></header>
          <p>${escapeHtml(t('dailyEditionText'))}</p>
          <div class="home-today-actions"><button type="button" data-action="daily-edition">${escapeHtml(t('createEdition'))}</button><button type="button" data-action="daily-offline">${escapeHtml(t('saveEdition'))}</button></div>
        </article>
        <article class="home-today-card">
          <header><span aria-hidden="true">✦</span><div><small>${escapeHtml(t('solidarity'))}</small><strong>${data.verifiedActions.length} ${escapeHtml(t('verifiedActions'))}</strong></div></header>
          <p>${data.verifiedActions.length ? data.verifiedActions.map(action => escapeHtml(action.title)).join(' · ') : escapeHtml(t('noVerifiedActions'))}</p>
          ${!data.verifiedActions.length ? `<details class="data-input-checklist"><summary>${escapeHtml(t('inputChecklist'))}</summary><p>${escapeHtml(t('missingEditorialData'))}${rejectedActionCount ? ` · ${rejectedActionCount} ${escapeHtml(t('rejectedActions'))}` : ''}</p><ul>${product21.ACTION_INPUT_FIELDS.map(field => `<li><code>${escapeHtml(field)}</code></li>`).join('')}</ul></details>` : ''}
          <div class="home-today-actions"><button type="button" data-view-target="prisoners">${escapeHtml(t('openSolidarity'))}</button><button type="button" data-view-target="developments">${escapeHtml(t('liveDossiers'))}</button></div>
        </article>
        <article class="home-today-card home-today-card--wide">
          <header><span aria-hidden="true">✂</span><div><small>${escapeHtml(t('actionKit'))}</small><strong>${escapeHtml(t('actionKitText'))}</strong></div></header>
          <button class="home-today-link" type="button" data-action="open-action-kit">${escapeHtml(t('zineTemplatesTab'))} →</button>
        </article>
      </div>
    </section>`;
  }

  function renderHome() {
    state.cardArticles = [];
    const balanced = core.balanceEditorially(state.articles, HOME_COUNT, {
      maxPerFamily: 2,
      poolSize: 60
    });
    const hero = balanced.find(core.isLeadEligible)
      || state.articles.find(core.isLeadEligible);
    if (!hero) return renderError();
    const selected = [hero, ...balanced.filter(article => article.id !== hero.id)]
      .slice(0, HOME_COUNT);
    const briefingSeen = new Set();
    const briefingItems = [...selected, ...state.articles]
      .filter(article => {
        if (!core.isLeadEligible(article) || briefingSeen.has(article.id)) return false;
        briefingSeen.add(article.id);
        return true;
      })
      .slice(0, 5);
    const homeServices = homeServiceData();
    const todayData = homeTodayData(briefingItems, homeServices);
    state.editorialQuality = core.editorialQuality(selected);
    viewRoot.dataset.sourceFamilies = String(state.editorialQuality.uniqueSourceFamilies);
    viewRoot.dataset.maxSourceStreak = String(state.editorialQuality.maxSourceStreak);
    const homeGroups = personalizedHomeGroups(selected.slice(1), [hero.id]);

    const heroIndex = state.cardArticles.push(hero) - 1;
    const heroTranslation = translationFor(hero);
    const heroTitle = heroTranslation?.title || hero.title;
    const heroIntro = newsCardTeaser(hero, heroTranslation);
    const heroImage = hero.image
      ? `<div class="home-hero__image" data-optional-image><img src="${escapeHtml(hero.image)}" alt="" decoding="async" fetchpriority="high" sizes="(max-width: 820px) calc(100vw - 18px), 45vw" referrerpolicy="no-referrer"></div>`
      : '';

    viewRoot.innerHTML = `
      <div class="meta-line">
        <span class="tag">${escapeHtml(t('previewNotice'))}</span>
        ${state.dataStatus.mode === 'snapshot' ? `<button class="tag data-status-action" type="button" data-action="live-data">${escapeHtml(t('openLiveData'))} →</button>` : ''}
      </div>
      <div class="section-heading"><h2>${escapeHtml(t('latest'))}</h2><small>${selected.length}</small></div>
      <article class="home-hero">
        ${heroImage}
        <div class="home-hero__content">
          <span class="eyebrow">${escapeHtml(hero.source)} · ${escapeHtml(dateLabel(hero))}</span>
          <h1>${escapeHtml(heroTitle)}</h1>
          <p>${escapeHtml(heroIntro)}</p>
          <div class="meta-line article-classification">
            <span class="tag">${escapeHtml(classificationLabel(hero.primaryRegion))}</span>
            ${hero.primaryTopic ? `<span class="tag">${escapeHtml(classificationLabel(hero.primaryTopic))}</span>` : ''}
          </div>
          ${heroTranslation ? `<small class="translation-note">${escapeHtml(translationNoteLabel(hero, heroTranslation))}</small>` : ''}
          <div class="card-actions">
            <button class="small-action" type="button" data-action="open" data-index="${heroIndex}">${escapeHtml(t('openArticle'))}</button>
            <button class="translate-card" type="button" data-action="translate" data-index="${heroIndex}">
              <span class="red-black-star" aria-hidden="true">★</span><span>${escapeHtml(t('translate'))}</span>
            </button>
          </div>
        </div>
      </article>
      <div class="section-heading briefing-heading">
        <div><h2>${escapeHtml(t('briefing'))}</h2><small>${escapeHtml(t('briefingHint'))}</small></div>
        <button class="secondary-button" type="button" data-action="briefing-open">${escapeHtml(t('briefingCreate'))}</button>
      </div>
      <div class="briefing-strip">
        ${briefingItems.map((article, index) => {
          const cardIndex = state.cardArticles.push(article) - 1;
          const translation = translationFor(article);
          const title = translation?.title || article.title;
          const intro = newsCardTeaser(article, translation);
          return `<button class="briefing-item" type="button" data-action="open" data-index="${cardIndex}" data-briefing-id="${escapeHtml(article.id)}"><b>${index + 1}</b><span class="briefing-item__copy"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(intro)}</small></span></button>`;
        }).join('')}
      </div>
      ${homeTodayMarkup(todayData)}
      ${homeServiceMarkup(homeServices)}
      ${personalizedHomeMarkup(homeGroups.personalized)}
      <div class="section-heading">
        <h2>${escapeHtml(t('moreNews'))}</h2>
        <button class="section-text-action" type="button" data-action="open-archive" data-period="7d">${escapeHtml(t('archiveBrowse'))} →</button>
      </div>
      ${cardsMarkup(homeGroups.remaining)}
    `;
    const serviceTranslationItems = [
      ...homeServices.developments.map(story => Array.isArray(story.items) ? story.items.at(-1) : null),
      ...homeServices.homeEvents.items
    ].filter(Boolean);
    void ensureHomeTranslations([
      hero,
      ...briefingItems,
      ...todayData.newItems.slice(0, 2),
      ...homeGroups.personalized,
      ...serviceTranslationItems
    ]);
  }

  function articleNeedsTeaserTranslation(article, targetLanguage) {
    if (!article || translationForLanguage(article, targetLanguage)) return false;
    const requestKey = `${targetLanguage}::${article.id}`;
    if (briefingTranslationsAttempted.has(requestKey)) return false;
    const sourceLanguage = String(
      article.language || article.lang || article.sprache || ''
    ).trim().toLowerCase().split(/[-_]/)[0];
    return !sourceLanguage || sourceLanguage === 'und' || sourceLanguage !== targetLanguage;
  }

  async function requestBriefingTranslation(article, targetLanguage) {
    if (!window.WRNSharedTranslations?.request || !articleNeedsTeaserTranslation(article, targetLanguage)) {
      return translationForLanguage(article, targetLanguage);
    }
    const requestKey = `${targetLanguage}::${article.id}`;
    if (briefingTranslationsInFlight.has(requestKey) || briefingTranslationsAttempted.has(requestKey)) return null;
    briefingTranslationsInFlight.add(requestKey);
    briefingTranslationsAttempted.add(requestKey);
    try {
      const result = await window.WRNSharedTranslations.request({
        title: article.title,
        text: newsCardTeaser(article, null, targetLanguage),
        targetLanguage,
        mode: 'title_and_text'
      });
      if (result?.error || !result?.text) throw new Error(result?.message || 'Translation failed');
      const parsed = core.splitTranslatedTeaser(result.text);
      const translated = {
        title: parsed.title || article.title,
        intro: cardCopy.completeFirstSentence(parsed.intro, targetLanguage)
      };
      storeTranslation(article, translated, targetLanguage);
      return translated;
    } catch (error) {
      if (!briefingTranslationWarningShown) {
        console.warn('Automatic briefing translation is currently unavailable', error);
        briefingTranslationWarningShown = true;
      }
      window.setTimeout(() => briefingTranslationsAttempted.delete(requestKey), 5 * 60 * 1000);
      return null;
    } finally {
      briefingTranslationsInFlight.delete(requestKey);
    }
  }

  async function ensureBriefingTranslations(items) {
    if (!Array.isArray(items)) return;
    for (let attempt = 0; attempt < 12 && !window.WRNSharedTranslations?.request; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 250));
    }
    if (!window.WRNSharedTranslations?.request) {
      if (!briefingTranslationWarningShown) {
        console.warn('Automatic briefing translation client is unavailable');
        briefingTranslationWarningShown = true;
      }
      return;
    }
    const language = state.language;
    await Promise.allSettled(items.slice(0, 5).map(async article => {
      if (!articleNeedsTeaserTranslation(article, language)) return;
      const item = [...viewRoot.querySelectorAll('.briefing-item')]
        .find(element => element.dataset.briefingId === article.id);
      item?.setAttribute('aria-busy', 'true');
      const translated = await requestBriefingTranslation(article, language);
      const currentItem = [...viewRoot.querySelectorAll('.briefing-item')]
        .find(element => element.dataset.briefingId === article.id);
      if (translated && currentItem && state.language === language) {
        const title = currentItem.querySelector('.briefing-item__copy strong');
        const intro = currentItem.querySelector('.briefing-item__copy small');
        if (title) title.textContent = translated.title;
        if (intro) intro.textContent = newsCardTeaser(article, translated, language);
      }
      currentItem?.removeAttribute('aria-busy');
    }));
  }

  async function ensureHomeTranslations(items) {
    if (!Array.isArray(items) || state.view !== 'home') return;
    const language = state.language;
    const uniqueItems = [...new Map(
      items
        .filter(item => item?.id)
        .map(item => [item.id, item])
    ).values()];
    const needsTranslation = uniqueItems.filter(item => articleNeedsTeaserTranslation(item, language));
    if (!needsTranslation.length) return;

    const visibleBriefingIds = new Set(
      [...viewRoot.querySelectorAll('.briefing-item[data-briefing-id]')]
        .map(element => element.dataset.briefingId)
    );
    await ensureBriefingTranslations(
      uniqueItems.filter(item => visibleBriefingIds.has(String(item.id)))
    );

    const remaining = needsTranslation.filter(item => articleNeedsTeaserTranslation(item, language));
    const results = await Promise.allSettled(
      remaining.map(item => requestBriefingTranslation(item, language))
    );
    const changed = results.some(result => result.status === 'fulfilled' && result.value);
    if (changed && state.view === 'home' && state.language === language) renderHome();
  }

  function hasPreferences() {
    return ['regions', 'topics', 'sources', 'blockedSources', 'prisonerIds']
      .some(key => Array.isArray(state.preferences[key]) && state.preferences[key].length)
      || (Array.isArray(state.developmentWatch) && state.developmentWatch.length);
  }

  function followedContextMarkup() {
    const prisonerIds = new Set(state.preferences.prisonerIds || []);
    const prisoners = (state.prisonerData.profiles || []).filter(profile => prisonerIds.has(profile.id));
    const watched = new Set(Array.isArray(state.developmentWatch) ? state.developmentWatch : []);
    const developments = specialty
      .developmentClusters(state.articles, window.WRNStoriesCore, {
        days: 30,
        threshold: DEVELOPMENT_MATCH_THRESHOLD
      })
      .filter(story => watched.has(story.id));
    if (!prisoners.length && !developments.length) return '';

    return `<div class="followed-context">
      ${prisoners.length ? `<section>
        <div class="section-heading"><h2>${escapeHtml(t('followedPrisoners'))}</h2><small>${prisoners.length}</small></div>
        <button type="button" class="followed-context__button" data-view-target="prisoners">${prisoners.map(profile => escapeHtml(profile.publicName)).join(' · ')}</button>
      </section>` : ''}
      ${developments.length ? `<section>
        <div class="section-heading"><h2>${escapeHtml(t('followedDevelopments'))}</h2><small>${developments.length}</small></div>
        <button type="button" class="followed-context__button" data-view-target="developments">${developments.map(story => escapeHtml(story.title)).join(' · ')}</button>
      </section>` : ''}
    </div>`;
  }

  function renderFollowing() {
    state.cardArticles = [];
    if (!hasPreferences()) {
      viewRoot.innerHTML = `
        ${headingMarkup(t('following'), t('noPreferences'), t('noPreferencesText'))}
        <div class="empty-state">
          <strong>${escapeHtml(t('personalize'))}</strong>
          <p>${escapeHtml(t('personalLocal'))}</p>
          <button class="primary-button" type="button" data-action="preferences">${escapeHtml(t('personalize'))}</button>
        </div>`;
      return;
    }

    const hasArticlePreferences = ['regions', 'topics', 'sources', 'blockedSources']
      .some(key => Array.isArray(state.preferences[key]) && state.preferences[key].length);
    const chosen = hasArticlePreferences
      ? state.articles.filter(article => core.matchesPreferences(article, state.preferences))
      : [];
    const selected = core.balanceBySource(chosen, HOME_COUNT, 2);
    const summary = [
      ...classificationList(state.preferences.regions || []),
      ...classificationList(state.preferences.topics || []),
      ...(state.preferences.sources || [])
    ].slice(0, 5).join(' · ');

    viewRoot.innerHTML = `
      ${headingMarkup(t('following'), t('personalTitle'), t('personalIntro'))}
      <div class="personal-summary">
        <div><strong>${escapeHtml(summary || t('personalize'))}</strong><p>${escapeHtml(t('personalLocal'))}</p></div>
        <button class="secondary-button" type="button" data-action="preferences">${escapeHtml(t('editSelection'))}</button>
      </div>
      ${followedContextMarkup()}
      ${cardsMarkup(selected)}
    `;
  }

  function filterChipMarkup(kind, value, active) {
    return `<button type="button" class="filter-chip${active ? ' active' : ''}" data-filter-kind="${escapeHtml(kind)}" data-filter-value="${escapeHtml(value)}">${escapeHtml(value ? classificationLabel(value) : t('all'))}</button>`;
  }

  const TOPIC_GROUPS = [
    ['groupPolitics', ['Anti-Imperialism', 'Anticapitalism', 'Anticolonialism', 'Antifascism', 'No War', 'Theory & Strategy']],
    ['groupRights', ['Antiracism', 'Antisexism', 'Queer-Feminism', 'No Borders', 'Radical Health & Disability', 'Indigenous Struggles']],
    ['groupAction', ['Movement News', 'Demonstrations', 'Labor Struggles', 'Squatting & Housing', 'Anti-Rep & Prisons', 'Cyberactivism']],
    ['groupEcology', ['Eco-Anarchism', 'Animal Liberation', 'Libraries']]
  ];

  function periodArticles(items) {
    if (!['7d', '30d'].includes(state.discover.period)) return items;
    const newest = Math.max(...state.articles.map(article => Number(article.timestamp) || 0));
    if (!Number.isFinite(newest) || newest <= 0) return items;
    const days = state.discover.period === '7d' ? 7 : 30;
    const threshold = newest - days * 24 * 60 * 60 * 1000;
    return items.filter(article => Number(article.timestamp) >= threshold);
  }

  function persistArchiveFilters() {
    writeJson(ARCHIVE_FILTERS_KEY, {
      schemaVersion: 1,
      discover: {
        region: state.discover.region,
        topic: state.discover.topic,
        period: state.discover.period,
        sort: state.discover.sort,
        language: state.discover.language,
        origin: state.discover.origin,
        source: state.discover.source,
        format: state.discover.format,
        viewMode: state.discover.viewMode
      },
      selectedSources: state.sourceArchive.selectedSources
    });
  }

  function normalizedSourceArchiveManifest(payload) {
    const sources = (Array.isArray(payload?.sources) ? payload.sources : [])
      .filter(source => source && typeof source === 'object')
      .map(source => ({
        id: core.text(source.id),
        name: core.text(source.name),
        path: core.text(source.path),
        itemCount: Math.max(0, Number(source.itemCount) || 0),
        quickIndexCount: Math.max(0, Number(source.quickIndexCount) || 0),
        newestAt: core.text(source.newestAt),
        oldestAt: core.text(source.oldestAt),
        coverage: source.coverage === 'complete' ? 'complete' : 'partial',
        coverageDays: Math.max(0, Number(source.coverageDays) || 0)
      }))
      .filter(source => source.id && source.name && /^news-archive\/[a-z0-9_-]+\.json$/i.test(source.path));
    if (!sources.length) throw new Error('Source archive manifest has no sources');
    return {
      schemaVersion: Number(payload.schemaVersion) || 1,
      generatedAt: core.text(payload.generatedAt),
      windowDays: Math.max(1, Number(payload.windowDays) || 30),
      cutoffAt: core.text(payload.cutoffAt),
      referenceAt: core.text(payload.referenceAt),
      sourceCount: sources.length,
      itemCount: sources.reduce((sum, source) => sum + source.itemCount, 0),
      sources
    };
  }

  async function ensureSourceArchiveManifest() {
    if (state.sourceArchive.manifest) return state.sourceArchive.manifest;
    if (state.sourceArchive.manifestLoading) return null;
    state.sourceArchive.manifestLoading = true;
    state.sourceArchive.manifestFailed = false;
    const urls = window.WRN_CONFIG?.dataUrls || {};
    const mirrors = window.WRN_CONFIG?.dataMirrors || {};
    try {
      const payload = await fetchFirstJson([
        mirrors.newsArchiveManifest,
        urls.newsArchiveManifest,
        'news-archive-manifest.json'
      ], {
        cacheKey: 'wrn_source_archive_manifest',
        cacheToken: state.dataStatus.revision || Date.now(),
        timeoutMs: 20000
      });
      state.sourceArchive.manifest = normalizedSourceArchiveManifest(payload);
      void window.WRNStorage?.putDataset?.('news-app-2-source-archive-manifest', payload);
    } catch (error) {
      try {
        const cached = await window.WRNStorage?.getDataset?.('news-app-2-source-archive-manifest');
        state.sourceArchive.manifest = normalizedSourceArchiveManifest(cached);
      } catch {
        state.sourceArchive.manifestFailed = true;
        console.warn('Source archive manifest unavailable', error);
      }
    } finally {
      state.sourceArchive.manifestLoading = false;
    }
    return state.sourceArchive.manifest;
  }

  function sourceArchiveEntry(sourceName) {
    return state.sourceArchive.manifest?.sources?.find(source => source.name === sourceName) || null;
  }

  async function loadSourceArchive(sourceName) {
    if (
      !sourceName
      || state.sourceArchive.loadedSources.has(sourceName)
      || state.sourceArchive.loadingSources.has(sourceName)
    ) return;
    const manifest = await ensureSourceArchiveManifest();
    const source = manifest?.sources?.find(item => item.name === sourceName);
    if (!source) {
      state.sourceArchive.failedSources.add(sourceName);
      return;
    }
    state.sourceArchive.loadingSources.add(sourceName);
    state.sourceArchive.failedSources.delete(sourceName);
    const filename = source.path.split('/').pop();
    const urls = window.WRN_CONFIG?.dataUrls || {};
    const mirrors = window.WRN_CONFIG?.dataMirrors || {};
    const cacheKey = `news-app-2-source-archive-${source.id}`;
    try {
      let payload;
      try {
        payload = await fetchFirstJson([
          mirrors.newsArchiveBase ? `${mirrors.newsArchiveBase}${filename}` : '',
          urls.newsArchiveBase ? `${urls.newsArchiveBase}${filename}` : '',
          source.path
        ], {
          cacheKey: `wrn_source_archive_${source.id}`,
          cacheToken: manifest.generatedAt || state.dataStatus.revision || Date.now(),
          timeoutMs: 25000
        });
        if (!Array.isArray(payload)) throw new Error('Invalid source archive chunk');
        void window.WRNStorage?.putDataset?.(cacheKey, payload);
      } catch (error) {
        payload = await window.WRNStorage?.getDataset?.(cacheKey);
        if (!Array.isArray(payload)) throw error;
      }
      const merged = core.normalizeArticles([...state.articles, ...payload])
        .filter(core.hasCompleteArticle);
      state.articles = core.applyEditorialDecisions(merged, state.editorialDecisions);
      state.facets = core.collectFacets(state.articles);
      state.sourceArchive.loadedSources.add(sourceName);
      window.WRNSourceProfiles?.setArticles?.(state.articles);
    } catch (error) {
      state.sourceArchive.failedSources.add(sourceName);
      console.warn('Source archive unavailable', sourceName, error);
    } finally {
      state.sourceArchive.loadingSources.delete(sourceName);
    }
  }

  async function loadSelectedSourceArchives() {
    if (!['30d', 'all'].includes(state.discover.period)) return;
    await ensureSourceArchiveManifest();
    if (state.view === 'discover') renderDiscover();
    await Promise.all(state.sourceArchive.selectedSources.map(loadSourceArchive));
    if (state.view === 'discover') renderDiscover();
  }

  function sourceArchiveCoverageState() {
    if (state.sourceArchive.manifestFailed) return 'unavailable';
    if (state.sourceArchive.manifestLoading || state.sourceArchive.loadingSources.size) return 'loading';
    if (!state.sourceArchive.selectedSources.length) return 'quick';
    const entries = state.sourceArchive.selectedSources.map(sourceArchiveEntry).filter(Boolean);
    const allLoaded = state.sourceArchive.selectedSources.every(source => state.sourceArchive.loadedSources.has(source));
    const allComplete = entries.length === state.sourceArchive.selectedSources.length
      && entries.every(source => source.coverage === 'complete');
    return allLoaded && allComplete ? 'complete' : 'partial';
  }

  function sourceArchiveMarkup() {
    if (!['30d', 'all'].includes(state.discover.period)) return '';
    const manifestSources = state.sourceArchive.manifest?.sources || state.facets.sources.map(name => ({
      name, itemCount: 0, coverage: 'partial', coverageDays: 0
    }));
    const query = core.text(state.sourceArchive.sourceQuery).toLocaleLowerCase();
    const visibleSources = manifestSources
      .filter(source => !query || source.name.toLocaleLowerCase().includes(query))
      .slice(0, 80);
    const selected = new Set(state.sourceArchive.selectedSources);
    const coverageState = sourceArchiveCoverageState();
    const coverageKey = {
      quick: 'sourceArchiveQuick', loading: 'sourceArchiveLoading', complete: 'sourceArchiveComplete',
      partial: 'sourceArchivePartial', unavailable: 'sourceArchiveUnavailable'
    }[coverageState];
    return `<section class="source-archive-panel" data-archive-state="${coverageState}">
      <div class="source-archive-heading">
        <div><span class="eyebrow">${escapeHtml(t('last30Days'))}</span><h2>${escapeHtml(t('sourceArchiveTitle'))}</h2></div>
        <span class="source-archive-coverage source-archive-coverage--${coverageState}" role="status">${escapeHtml(t(coverageKey))}</span>
      </div>
      <p>${escapeHtml(t('sourceArchiveIntro'))}</p>
      <div class="source-archive-tools">
        <input id="next-archive-source-query" type="search" value="${escapeHtml(state.sourceArchive.sourceQuery)}" placeholder="${escapeHtml(t('sourceArchiveSearch'))}">
        ${selected.size ? `<button type="button" class="secondary-button" data-action="archive-source-clear">${escapeHtml(t('sourceArchiveClear'))}</button>` : ''}
      </div>
      ${selected.size ? `<div class="source-archive-selected" aria-label="${escapeHtml(t('sourceArchiveSelected'))}">${[...selected].map(name => `<button type="button" data-action="archive-source" data-value="${escapeHtml(name)}" aria-pressed="true">${escapeHtml(name)} ×</button>`).join('')}</div>` : ''}
      <div class="source-archive-source-list">${visibleSources.length ? visibleSources.map(source => {
        const active = selected.has(source.name);
        const loaded = state.sourceArchive.loadedSources.has(source.name);
        const loading = state.sourceArchive.loadingSources.has(source.name);
        const label = source.itemCount
          ? `${source.itemCount} ${t(source.itemCount === 1 ? 'sourceArchiveArticle' : 'sourceArchiveItems')}`
          : t('sourceArchiveQuick');
        return `<button type="button" class="source-archive-source${active ? ' active' : ''}" data-action="archive-source" data-value="${escapeHtml(source.name)}" aria-pressed="${active}"${!active && selected.size >= 20 ? ' disabled' : ''}>
          <strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(label)}${loading ? ' · …' : loaded ? ' · ✓' : ''}</small>
        </button>`;
      }).join('') : `<p class="empty-state">${escapeHtml(t('sourceArchiveNoSources'))}</p>`}</div>
      <small class="source-archive-limit">${escapeHtml(t('sourceArchiveMax'))}</small>
    </section>`;
  }

  function allDiscoverResults() {
    let periodItems = periodArticles(core.filterArticles(state.articles, {
        query: state.discover.query,
        region: state.discover.region,
        topic: state.discover.topic
      }));
    if (['30d', 'all'].includes(state.discover.period) && state.sourceArchive.selectedSources.length) {
      const selectedSources = new Set(state.sourceArchive.selectedSources);
      periodItems = periodItems.filter(article => selectedSources.has(article.source));
    }
    const results = release.filterArticles(
      periodItems,
      state.discover,
      state.sourceIndex
    );
    const exactSourceSelected = state.discover.source && state.discover.source !== 'all';
    if (state.discover.sort !== 'newest' || state.discover.query || exactSourceSelected || results.length < 2) {
      return results;
    }
    const leadCount = Math.min(24, results.length);
    const balancedLead = core.balanceEditorially(results, leadCount, {
      maxPerFamily: 2,
      maxPerCountry: state.discover.region === 'Europe' ? 4 : 6,
      poolSize: Math.min(results.length, 180)
    });
    const leadItems = new Set(balancedLead);
    return [...balancedLead, ...results.filter(item => !leadItems.has(item))];
  }

  function discoverResults() {
    return allDiscoverResults().slice(0, state.discover.limit);
  }

  function periodButton(value, label) {
    const active = state.discover.period === value;
    return `<button type="button" class="${active ? 'active' : ''}" data-action="discover-period" data-value="${value}" aria-pressed="${active}">${escapeHtml(label)}</button>`;
  }

  function topicDirectoryMarkup(topics) {
    const available = new Set(topics);
    const grouped = new Set(TOPIC_GROUPS.flatMap(([, values]) => values));
    const groups = TOPIC_GROUPS.map(([label, values]) => {
      const items = values.filter(value => available.has(value));
      if (!items.length) return '';
      return `<section class="topic-group">
        <h3>${escapeHtml(t(label))}</h3>
        <div class="filter-chips filter-chips--topics">
          ${items.map(value => filterChipMarkup('topic', value, state.discover.topic === value)).join('')}
        </div>
      </section>`;
    }).join('');
    const remaining = topics.filter(value => !grouped.has(value));
    const remainingMarkup = remaining.length
      ? `<section class="topic-group">
          <h3>${escapeHtml(t('topics'))}</h3>
          <div class="filter-chips filter-chips--topics">
            ${remaining.map(value => filterChipMarkup('topic', value, state.discover.topic === value)).join('')}
          </div>
        </section>`
      : '';
    return `<div class="topic-directory">${groups}${remainingMarkup}</div>`;
  }

  function selectOptions(values, selected, allValue, allLabel, labeler = value => value) {
    return `<option value="${escapeHtml(allValue)}">${escapeHtml(allLabel)}</option>${
      values.map(value => `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(labeler(value))}</option>`).join('')
    }`;
  }

  function discoverAdvancedFiltersMarkup() {
    const sourceMetadata = state.articles.map(article => release.sourceMeta(article, state.sourceIndex));
    const languages = [...new Set(sourceMetadata.map(item => item.language).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    const origins = [...new Set(sourceMetadata.flatMap(item => [item.originRegion, item.originCountry]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    const formats = [
      ['news', t('newsFormat')],
      ['analysis', t('analysisFormat')],
      ['commentary', t('commentaryFormat')],
      ['interview', t('interviewFormat')],
      ['press-release', t('pressReleaseFormat')],
      ['podcast', t('podcast')]
    ];
    const viewModes = [
      ['cards', t('cardsView')],
      ['compact', t('compactView')],
      ['headlines', t('headlinesView')]
    ];
    return `<details class="advanced-filter-panel"${
      ['oldest'].includes(state.discover.sort)
      || ['language', 'origin', 'source', 'format'].some(key => !['', 'all'].includes(state.discover[key]))
      || state.discover.viewMode !== 'cards' ? ' open' : ''
    }>
      <summary>${escapeHtml(t('advancedFilters'))}</summary>
      <div class="advanced-filter-grid">
        <label><span>${escapeHtml(t('sort'))}</span><select id="next-discover-sort">
          <option value="newest"${state.discover.sort === 'newest' ? ' selected' : ''}>${escapeHtml(t('newestFirst'))}</option>
          <option value="oldest"${state.discover.sort === 'oldest' ? ' selected' : ''}>${escapeHtml(t('oldestFirst'))}</option>
        </select></label>
        <label><span>${escapeHtml(t('sourceLanguage'))}</span><select id="next-discover-language">${
          selectOptions(languages.map(value => value.toUpperCase()), state.discover.language.toUpperCase(), 'ALL', t('allLanguages'))
            .replaceAll('value="ALL"', 'value="all"')
            .replace(/value="([A-Z]{2,3})"/g, (_, value) => `value="${value.toLowerCase()}"`)
        }</select></label>
        <label><span>${escapeHtml(t('sourceOrigin'))}</span><select id="next-discover-origin">${
          selectOptions(origins, state.discover.origin, 'all', t('allOrigins'), originLabel)
        }</select></label>
        <label><span>${escapeHtml(t('contentFormat'))}</span><select id="next-discover-format">
          <option value="all">${escapeHtml(t('allFormats'))}</option>
          ${formats.map(([value, label]) => `<option value="${value}"${state.discover.format === value ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('')}
        </select></label>
        <label><span>${escapeHtml(t('exactSource'))}</span><select id="next-discover-source">${
          selectOptions(state.facets.sources, state.discover.source, 'all', t('allSources'))
        }</select></label>
        <div class="view-mode-switch" aria-label="${escapeHtml(t('cardsView'))}">${
          viewModes.map(([value, label]) => `<button type="button" class="${state.discover.viewMode === value ? 'active' : ''}" data-action="discover-view" data-value="${value}" aria-pressed="${state.discover.viewMode === value}">${escapeHtml(label)}</button>`).join('')
        }</div>
      </div>
    </details>`;
  }

  function renderDiscover() {
    state.cardArticles = [];
    const results = discoverResults();
    const total = allDiscoverResults().length;
    const regionChips = ['', ...state.facets.regions].map(value =>
      filterChipMarkup('region', value, state.discover.region === value)
    ).join('');
    const topics = [...state.facets.topics].sort((a, b) => a.localeCompare(b, state.language));

    viewRoot.innerHTML = `
      ${headingMarkup(t('discover'), t('discover'), t('discoverIntro'))}
      <section class="feature-grid feature-grid--compact" aria-label="${escapeHtml(t('specialty'))}">
        ${featureCard('◷', t('events'), t('eventsText'), 'events')}
        ${featureCard('A–Z', t('lexicon'), lexiconFeatureText(), 'lexicon')}
        ${featureCard('▤', t('library'), t('libraryText'), 'library')}
        ${featureCard('✉', t('prisonersShort'), t('prisonersText'), 'prisoners')}
        ${featureCard('✚', t('helpFind'), t('helpFindText'), 'help')}
        ${featureCard('↗', t('developments'), t('developmentsText'), 'developments')}
      </section>
      <nav class="archive-periods" aria-label="${escapeHtml(t('allArticles'))}">
        ${periodButton('current', t('currentPeriod'))}
        ${periodButton('7d', t('last7Days'))}
        ${periodButton('30d', t('last30Days'))}
        ${periodButton('all', t('allArticles'))}
      </nav>
      ${sourceArchiveMarkup()}
      <div class="discover-controls">
        <input id="next-discover-query" type="search" value="${escapeHtml(state.discover.query)}" placeholder="${escapeHtml(t('searchPlaceholder'))}" aria-label="${escapeHtml(t('searchLabel'))}">
        <section class="filter-directory">
          <span class="eyebrow">${escapeHtml(t('regions'))}</span>
          <div class="filter-chips filter-chips--regions">${regionChips}</div>
        </section>
        <section class="filter-directory">
          <div class="filter-directory__heading">
            <span class="eyebrow">${escapeHtml(t('topics'))}</span>
            ${state.discover.topic ? filterChipMarkup('topic', '', false) : ''}
          </div>
          ${topicDirectoryMarkup(topics)}
        </section>
        ${discoverAdvancedFiltersMarkup()}
      </div>
      <div class="section-heading"><h2>${escapeHtml(t('results'))}</h2><small>${results.length} ${escapeHtml(t('of'))} ${total}</small></div>
      ${cardsMarkup(results)}
      ${results.length < total ? `<div class="load-more-row"><button class="secondary-button" type="button" data-action="discover-more">${escapeHtml(t('showMore'))}</button></div>` : ''}
    `;
  }

  function featureCard(icon, title, description, view) {
    return `<button class="feature-card" type="button" data-view-target="${escapeHtml(view)}"><span aria-hidden="true">${escapeHtml(icon)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></button>`;
  }

  function specialtyBack() {
    return `<button class="secondary-button" type="button" data-view-target="discover">← ${escapeHtml(t('backDiscover'))}</button>`;
  }

  const HELP_TOPIC_LABELS = Object.freeze({
    de:['Antirepression','Polizeigewalt','Flucht / Asyl','Feministische Hilfe','Queer / Trans / Inter','Gefangenenhilfe','Wohnung / Essen / Gesundheit','Digitale Sicherheit','Arbeitskampf','Krisenhilfe','Gewalt / Opferhilfe','Psychische Gesundheit'],
    en:['Anti-repression','Police violence','Flight / asylum','Feminist help','Queer / trans / inter','Prisoner support','Housing / food / health','Digital security','Labor struggle','Crisis support','Violence / victim support','Mental health'],
    es:['Antirrepresión','Violencia policial','Huida / asilo','Ayuda feminista','Queer / trans / inter','Ayuda a presxs','Vivienda / comida / salud','Seguridad digital','Lucha laboral','Ayuda en crisis','Violencia / ayuda a víctimas','Salud mental'],
    fr:['Antirépression','Violences policières','Exil / asile','Aide féministe','Queer / trans / inter','Soutien aux détenu·es','Logement / nourriture / santé','Sécurité numérique','Lutte du travail','Aide en situation de crise','Violence / aide aux victimes','Santé mentale'],
    it:['Antirepressione','Violenza della polizia','Fuga / asilo','Aiuto femminista','Queer / trans / inter','Sostegno ai detenuti','Casa / cibo / salute','Sicurezza digitale','Lotta del lavoro','Aiuto in caso di crisi','Violenza / aiuto alle vittime','Salute mentale'],
    pt:['Antirrepressão','Violência policial','Fuga / asilo','Ajuda feminista','Queer / trans / inter','Apoio a presos','Habitação / comida / saúde','Segurança digital','Luta laboral','Apoio em crise','Violência / apoio às vítimas','Saúde mental'],
    ru:['Антирепрессии','Полицейское насилие','Бегство / убежище','Феминистская помощь','Квир / транс / интер','Помощь заключённым','Жильё / еда / здоровье','Цифровая безопасность','Трудовая борьба','Кризисная помощь','Насилие / помощь пострадавшим','Психическое здоровье'],
    el:['Αντικαταστολή','Αστυνομική βία','Φυγή / άσυλο','Φεμινιστική βοήθεια','Queer / trans / inter','Στήριξη κρατουμένων','Στέγαση / τροφή / υγεία','Ψηφιακή ασφάλεια','Εργατικός αγώνας','Βοήθεια σε κρίση','Βία / βοήθεια θυμάτων','Ψυχική υγεία'],
    tr:['Baskıya karşı destek','Polis şiddeti','Kaçış / iltica','Feminist yardım','Queer / trans / inter','Mahpus desteği','Barınma / gıda / sağlık','Dijital güvenlik','Emek mücadelesi','Kriz desteği','Şiddet / mağdur desteği','Ruh sağlığı']
  });

  const HELP_LANGUAGE_COPY = Object.freeze({
    de:{ counselling:'Bestätigte Beratungssprachen', information:'Informationssprachen (keine Beratungszusage)', none:'Keine konkrete Beratungssprache bestätigt', offline:'Gespeichertes Offline-Regionalpaket', offlineChecked:'Ursprünglicher Prüfstand', offlineUnconfirmed:'Keine aktuelle Onlinebestätigung.' },
    en:{ counselling:'Confirmed counselling languages', information:'Information languages (not a counselling promise)', none:'No specific counselling language confirmed', offline:'Stored offline regional package', offlineChecked:'Original review state', offlineUnconfirmed:'No current online confirmation.' },
    es:{ counselling:'Idiomas de asesoramiento confirmados', information:'Idiomas de información (sin promesa de asesoramiento)', none:'No hay idioma de asesoramiento confirmado', offline:'Paquete regional guardado sin conexión', offlineChecked:'Estado de revisión original', offlineUnconfirmed:'Sin confirmación actual en línea.' },
    fr:{ counselling:'Langues de conseil confirmées', information:'Langues d’information (sans garantie de conseil)', none:'Aucune langue de conseil précise confirmée', offline:'Paquet régional hors ligne enregistré', offlineChecked:'État de vérification initial', offlineUnconfirmed:'Aucune confirmation en ligne actuelle.' },
    it:{ counselling:'Lingue di consulenza confermate', information:'Lingue informative (senza garanzia di consulenza)', none:'Nessuna lingua di consulenza specifica confermata', offline:'Pacchetto regionale offline salvato', offlineChecked:'Stato della verifica originale', offlineUnconfirmed:'Nessuna conferma online attuale.' },
    pt:{ counselling:'Idiomas de aconselhamento confirmados', information:'Idiomas informativos (sem promessa de aconselhamento)', none:'Nenhum idioma de aconselhamento confirmado', offline:'Pacote regional offline guardado', offlineChecked:'Estado da verificação original', offlineUnconfirmed:'Sem confirmação online atual.' },
    ru:{ counselling:'Подтверждённые языки консультации', information:'Языки информации (без обещания консультации)', none:'Конкретный язык консультации не подтверждён', offline:'Сохранённый офлайн-региональный пакет', offlineChecked:'Исходное состояние проверки', offlineUnconfirmed:'Нет текущего онлайн-подтверждения.' },
    el:{ counselling:'Επιβεβαιωμένες γλώσσες συμβουλευτικής', information:'Γλώσσες ενημέρωσης (όχι υπόσχεση συμβουλευτικής)', none:'Δεν επιβεβαιώθηκε συγκεκριμένη γλώσσα συμβουλευτικής', offline:'Αποθηκευμένο περιφερειακό πακέτο εκτός σύνδεσης', offlineChecked:'Αρχική κατάσταση ελέγχου', offlineUnconfirmed:'Δεν υπάρχει τρέχουσα επιβεβαίωση στο διαδίκτυο.' },
    tr:{ counselling:'Doğrulanmış danışmanlık dilleri', information:'Bilgi dilleri (danışmanlık sözü değildir)', none:'Belirli bir danışmanlık dili doğrulanmadı', offline:'Kaydedilmiş çevrimdışı bölgesel paket', offlineChecked:'İlk inceleme durumu', offlineUnconfirmed:'Güncel çevrimiçi doğrulama yok.' }
  });

  const HELP_UI_COPY = Object.freeze({
    de:{ search:'Name, Ort oder Hilfe durchsuchen', clear:'Filter löschen', results:'{count} geprüfte Angebote', safety:'Nicht jedes Angebot ist ein Notruf. Prüfe Zuständigkeit und Grenzen, bevor du sensible Angaben teilst. Bei akuter Gefahr nutze die offiziellen örtlichen Notdienste.', external:'Der Kontakt öffnet außerhalb von WRN. Beachte Browser-, Geräte- und Telefonverläufe.', audiences:'Für wen', gaps:'Noch nicht redaktionell abgedeckt', gapsText:'Diese Themen haben derzeit kein passendes, aktuell geprüftes Profil. Es werden keine Platzhalter erfunden.', reach:{reachable:'erreichbar',limited:'eingeschränkt',unknown:'unbekannt',unreachable:'nicht erreichbar'} },
    en:{ search:'Search name, place or support', clear:'Clear filters', results:'{count} verified services', safety:'Not every service is an emergency service. Check scope and limits before sharing sensitive details. In immediate danger use official local emergency services.', external:'The contact opens outside WRN. Consider browser, device and telephone histories.', audiences:'Who it is for', gaps:'Not yet editorially covered', gapsText:'These topics currently have no matching, recently verified profile. No placeholders are invented.', reach:{reachable:'reachable',limited:'limited',unknown:'unknown',unreachable:'unreachable'} },
    es:{ search:'Buscar nombre, lugar o ayuda', clear:'Borrar filtros', results:'{count} servicios verificados', safety:'No todos los servicios son de emergencia. Comprueba el ámbito y los límites antes de compartir datos sensibles. En peligro inmediato usa los servicios de emergencia oficiales locales.', external:'El contacto se abre fuera de WRN. Ten en cuenta los historiales del navegador, dispositivo y teléfono.', audiences:'Para quién', gaps:'Aún sin cobertura editorial', gapsText:'Estos temas no tienen actualmente un perfil adecuado y revisado. No se inventan marcadores.', reach:{reachable:'accesible',limited:'limitado',unknown:'desconocido',unreachable:'no accesible'} },
    fr:{ search:'Rechercher un nom, lieu ou soutien', clear:'Effacer les filtres', results:'{count} services vérifiés', safety:'Tous les services ne sont pas des urgences. Vérifiez le champ et les limites avant de transmettre des données sensibles. En cas de danger immédiat, utilisez les urgences locales officielles.', external:'Le contact s’ouvre hors de WRN. Tenez compte des historiques du navigateur, de l’appareil et du téléphone.', audiences:'Pour qui', gaps:'Pas encore couvert éditorialement', gapsText:'Ces thèmes n’ont actuellement aucun profil correspondant récemment vérifié. Aucun profil fictif n’est créé.', reach:{reachable:'joignable',limited:'limité',unknown:'inconnu',unreachable:'injoignable'} },
    it:{ search:'Cerca nome, luogo o aiuto', clear:'Azzera filtri', results:'{count} servizi verificati', safety:'Non tutti i servizi sono di emergenza. Verifica ambito e limiti prima di condividere dati sensibili. In pericolo immediato usa i servizi di emergenza locali ufficiali.', external:'Il contatto si apre fuori da WRN. Considera le cronologie di browser, dispositivo e telefono.', audiences:'Per chi', gaps:'Non ancora coperto editorialmente', gapsText:'Questi temi non hanno ancora un profilo adatto e verificato di recente. Non vengono inventati segnaposto.', reach:{reachable:'raggiungibile',limited:'limitato',unknown:'sconosciuto',unreachable:'non raggiungibile'} },
    pt:{ search:'Pesquisar nome, local ou apoio', clear:'Limpar filtros', results:'{count} serviços verificados', safety:'Nem todos os serviços são de emergência. Confirma o âmbito e os limites antes de partilhar dados sensíveis. Em perigo imediato usa os serviços de emergência locais oficiais.', external:'O contacto abre fora da WRN. Considera os históricos do navegador, dispositivo e telefone.', audiences:'Para quem', gaps:'Ainda sem cobertura editorial', gapsText:'Estes temas ainda não têm um perfil adequado e recentemente verificado. Não são inventados marcadores.', reach:{reachable:'acessível',limited:'limitado',unknown:'desconhecido',unreachable:'inacessível'} },
    ru:{ search:'Поиск по названию, месту или помощи', clear:'Сбросить фильтры', results:'Проверенных служб: {count}', safety:'Не каждая служба является экстренной. Проверьте сферу и ограничения до передачи чувствительных данных. При непосредственной опасности используйте официальные местные экстренные службы.', external:'Контакт открывается вне WRN. Учитывайте историю браузера, устройства и телефона.', audiences:'Для кого', gaps:'Пока не охвачено редакцией', gapsText:'Для этих тем пока нет подходящего недавно проверенного профиля. Заглушки не выдумываются.', reach:{reachable:'доступна',limited:'ограниченно',unknown:'неизвестно',unreachable:'недоступна'} },
    el:{ search:'Αναζήτηση ονόματος, τόπου ή βοήθειας', clear:'Καθαρισμός φίλτρων', results:'{count} επαληθευμένες υπηρεσίες', safety:'Δεν είναι κάθε υπηρεσία επείγουσα. Ελέγξτε το πεδίο και τα όρια πριν μοιραστείτε ευαίσθητα στοιχεία. Σε άμεσο κίνδυνο χρησιμοποιήστε τις επίσημες τοπικές υπηρεσίες έκτακτης ανάγκης.', external:'Η επαφή ανοίγει εκτός WRN. Λάβετε υπόψη τα ιστορικά προγράμματος περιήγησης, συσκευής και τηλεφώνου.', audiences:'Για ποιον', gaps:'Δεν καλύπτεται ακόμη συντακτικά', gapsText:'Αυτά τα θέματα δεν έχουν ακόμη κατάλληλο, πρόσφατα ελεγμένο προφίλ. Δεν δημιουργούνται επινοημένα υποκατάστατα.', reach:{reachable:'διαθέσιμο',limited:'περιορισμένο',unknown:'άγνωστο',unreachable:'μη διαθέσιμο'} },
    tr:{ search:'Ad, yer veya destek ara', clear:'Filtreleri temizle', results:'{count} doğrulanmış hizmet', safety:'Her hizmet acil servis değildir. Hassas bilgileri paylaşmadan önce kapsamı ve sınırları kontrol edin. Acil tehlikede resmi yerel acil servisleri kullanın.', external:'İletişim WRN dışında açılır. Tarayıcı, cihaz ve telefon geçmişlerini dikkate alın.', audiences:'Kimler için', gaps:'Henüz editoryal olarak kapsanmıyor', gapsText:'Bu konular için şu anda uygun ve yakın zamanda kontrol edilmiş profil yok. Yer tutucu uydurulmaz.', reach:{reachable:'ulaşılabilir',limited:'sınırlı',unknown:'bilinmiyor',unreachable:'ulaşılamıyor'} }
  });

  function helpTopicLabel(topic) {
    const index = window.WRNSolidarityNetwork21.HELP_TOPICS.indexOf(topic);
    return (HELP_TOPIC_LABELS[state.language] || HELP_TOPIC_LABELS.en)[index] || topic;
  }

  function helpProfileMarkup(profile) {
    const languageCopy = HELP_LANGUAGE_COPY[state.language] || HELP_LANGUAGE_COPY.en;
    const ui = HELP_UI_COPY[state.language] || HELP_UI_COPY.en;
    const checked = new Date(profile.lastChecked);
    const next = new Date(profile.nextCheck);
    const formatDate = date => Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(state.language, { dateStyle: 'medium' }).format(date)
      : t('unknown');
    const listMarkup = values => `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`;
    const locations = Array.isArray(profile.locations) && profile.locations.length
      ? ` · ${profile.locations.map(escapeHtml).join(' · ')}` : '';
    return `<details class="help-profile" data-help-profile="${escapeHtml(profile.id)}">
      <summary><span><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.officialOperator)} · ${profile.regions.map(escapeHtml).join(' · ')}${locations}</small></span><em class="help-profile__boundary ${profile.emergency ? 'is-crisis' : 'is-advice'}">${escapeHtml(t(profile.emergency ? 'helpCrisisContact' : 'helpAdviceOnly'))}</em></summary>
      <div class="help-profile__body">
        <div><h3>${escapeHtml(ui.audiences)}</h3>${listMarkup(profile.audiences)}</div>
        <div><h3>${escapeHtml(t('helpCan'))}</h3>${listMarkup(profile.canHelpWith)}</div>
        <div><h3>${escapeHtml(t('helpNot'))}</h3>${listMarkup(profile.notResponsibleFor)}</div>
        <div><h3>${escapeHtml(t('helpRequirements'))}</h3>${listMarkup(profile.requirements)}</div>
        <p><strong>${escapeHtml(t('helpChecked'))}:</strong> ${escapeHtml(formatDate(checked))} · <strong>${escapeHtml(t('helpNextCheck'))}:</strong> ${escapeHtml(formatDate(next))} · <strong>${escapeHtml(t('helpReachability'))}:</strong> ${escapeHtml(ui.reach[profile.reachabilityStatus] || ui.reach.unknown)}</p>
        <p><strong>${escapeHtml(languageCopy.counselling)}:</strong> ${profile.confirmedCounsellingLanguages.length ? profile.confirmedCounsellingLanguages.map(value => `<span class="help-tag">${escapeHtml(value.toUpperCase())}</span>`).join(' ') : escapeHtml(languageCopy.none)}</p>
        <p><strong>${escapeHtml(languageCopy.information)}:</strong> ${profile.informationLanguages.map(value => `<span class="help-tag">${escapeHtml(value.toUpperCase())}</span>`).join(' ')}</p>
        <p>${profile.helpTopics.map(value => `<span class="help-tag">${escapeHtml(helpTopicLabel(value))}</span>`).join(' ')}</p>
        <p class="help-external-warning">${escapeHtml(ui.external)}</p>
        <p class="help-contact-actions"><a class="primary-button" href="${escapeHtml(profile.officialContact)}"${profile.officialContact.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(t('contact'))}</a> <a class="secondary-button" href="${escapeHtml(profile.officialWebsite)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('website'))}</a></p>
        <details><summary>${escapeHtml(t('helpSources'))}</summary><ul>${profile.verificationSources.map((url, index) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(`${t('helpSources')} ${index + 1}`)}</a></li>`).join('')}</ul></details>
      </div>
    </details>`;
  }

  function contextualHelpMarkup(editorialHelpTopics) {
    const profiles = window.WRNSolidarityNetwork21.contextualProfiles(
      state.solidarityNetwork.profiles,
      editorialHelpTopics
    );
    if (!profiles.length) return '';
    return `<aside class="contextual-help" aria-label="${escapeHtml(t('helpFind'))}"><h2>${escapeHtml(t('helpFind'))}</h2><p>${escapeHtml(t('helpPrivacy'))}</p><ul>${profiles.slice(0, 3).map(profile => `<li><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.helpTopics.map(helpTopicLabel).join(' · '))}</small></li>`).join('')}</ul><button class="secondary-button" type="button" data-view-target="help">${escapeHtml(t('helpFind'))}</button></aside>`;
  }

  function renderHelp() {
    const network = window.WRNSolidarityNetwork21;
    const profiles = network.filterProfiles(state.solidarityNetwork.profiles, state.helpFilters);
    const all = state.solidarityNetwork.profiles.filter(profile => network.profileAssessment(profile).eligible);
    const regions = [...new Set(all.flatMap(profile => profile.regions))].sort();
    const locations = [...new Set(all.flatMap(profile => profile.locations || []))].sort((a, b) => a.localeCompare(b, state.language));
    const languages = [...new Set(all.flatMap(profile => profile.confirmedCounsellingLanguages))].sort();
    const languageCopy = HELP_LANGUAGE_COPY[state.language] || HELP_LANGUAGE_COPY.en;
    const ui = HELP_UI_COPY[state.language] || HELP_UI_COPY.en;
    const offline = state.solidarityNetwork.offlineProvenance;
    const offlineChecked = offline?.sourceCheckedAt ? new Date(offline.sourceCheckedAt) : null;
    const offlineCheckedLabel = offlineChecked && Number.isFinite(offlineChecked.getTime())
      ? new Intl.DateTimeFormat(state.language, { dateStyle: 'medium' }).format(offlineChecked)
      : t('unknown');
    const option = (value, selected, label = value) => `<option value="${escapeHtml(value)}"${selected === value ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    const missingTopics = network.HELP_TOPICS.filter(topic => !all.some(profile => profile.helpTopics.includes(topic)));
    const filtersActive = Object.values(state.helpFilters).some(Boolean);
    viewRoot.innerHTML = `
      ${headingMarkup(t('helpFind'), t('helpFind'), t('helpFindText'), specialtyBack())}
      <p class="help-privacy" id="help-search-privacy" role="note">${escapeHtml(t('helpPrivacy'))}</p>
      <p class="help-safety" role="note">${escapeHtml(ui.safety)}</p>
      ${offline ? `<aside class="help-offline-origin" role="status"><strong>${escapeHtml(languageCopy.offline)}</strong><span>${escapeHtml(languageCopy.offlineChecked)}: ${escapeHtml(offlineCheckedLabel)}. ${escapeHtml(languageCopy.offlineUnconfirmed)}</span></aside>` : ''}
      <fieldset class="help-filters"><legend>${escapeHtml(t('helpFind'))}</legend>
        <label class="help-search"><span>${escapeHtml(ui.search)}</span><input id="next-help-query" type="search" autocomplete="off" spellcheck="false" aria-describedby="help-search-privacy" value="${escapeHtml(state.helpFilters.query)}"></label>
        <label><span>${escapeHtml(t('helpRegion'))}</span><select id="next-help-region">${option('', state.helpFilters.region, t('helpAll'))}${regions.map(value => option(value, state.helpFilters.region)).join('')}</select></label>
        <label><span>${escapeHtml(t('helpLocation'))}</span><select id="next-help-location">${option('', state.helpFilters.location, t('helpAll'))}${locations.map(value => option(value, state.helpFilters.location)).join('')}</select></label>
        <label><span>${escapeHtml(t('helpLanguage'))}</span><select id="next-help-language">${option('', state.helpFilters.language, t('helpAll'))}${languages.map(value => option(value, state.helpFilters.language, value.toUpperCase())).join('')}</select></label>
        <label><span>${escapeHtml(t('helpTopic'))}</span><select id="next-help-topic">${option('', state.helpFilters.topic, t('helpAll'))}${network.HELP_TOPICS.map(value => option(value, state.helpFilters.topic, helpTopicLabel(value))).join('')}</select></label>
      </fieldset>
      <div class="help-results-heading"><strong role="status" aria-live="polite" aria-atomic="true">${escapeHtml(ui.results.replace('{count}', String(profiles.length)))}</strong>${filtersActive ? `<button class="secondary-button" type="button" data-action="help-clear">${escapeHtml(ui.clear)}</button>` : ''}</div>
      ${state.helpFilters.region ? `<button class="secondary-button" type="button" data-action="help-offline">${escapeHtml(t('helpOffline'))}</button>` : ''}
      <section class="help-results">${profiles.length ? profiles.map(helpProfileMarkup).join('') : `<div class="empty-state compact"><strong>${escapeHtml(t('helpNoResults'))}</strong></div>`}</section>
      ${missingTopics.length ? `<details class="help-gaps"><summary>${escapeHtml(ui.gaps)}</summary><p>${escapeHtml(ui.gapsText)}</p><p>${missingTopics.map(topic => `<span class="help-tag">${escapeHtml(helpTopicLabel(topic))}</span>`).join(' ')}</p></details>` : ''}
      <details class="help-submission"><summary>${escapeHtml(t('helpSubmit'))}</summary><p>${escapeHtml(t('helpSubmissionText'))}</p>
        <label><span>${escapeHtml(t('helpEvidence'))}</span><input id="next-help-evidence" type="url" inputmode="url"></label>
        <label><span>${escapeHtml(t('helpDetails'))}</span><textarea id="next-help-details" rows="5"></textarea></label>
        <button class="primary-button" type="button" data-action="help-submit">${escapeHtml(t('helpQueue'))}</button>
      </details>`;
  }

  async function saveSolidarityRegionOffline() {
    const network = window.WRNSolidarityNetwork21;
    const region = state.helpFilters.region;
    if (!network || !region) return;
    const result = await network.storeRegionalOfflinePackage(window.WRNStorage, { region });
    showToast(t(result.ok ? 'helpOfflineSaved' : 'helpOfflineFailed'));
  }

  function libraryResults() {
    const query = core.text(state.library.query).toLocaleLowerCase();
    const languages = new Set(state.library.languages || []);
    return (Array.isArray(state.libraryItems) ? state.libraryItems : [])
      .filter(item => {
        const itemLanguages = Array.isArray(item.languages) ? item.languages : [];
        const formats = Array.isArray(item.formats) ? item.formats : [];
        if (languages.size && !itemLanguages.some(language => languages.has(language))) return false;
        if (state.library.source !== 'all' && item.sourceId !== state.library.source) return false;
        if (state.library.format !== 'all' && !formats.includes(state.library.format)) return false;
        if (!query) return true;
        return [item.title, ...(item.authors || []), ...(item.topics || []), item.sourceName]
          .join(' ').toLocaleLowerCase().includes(query);
      })
      .sort((first, second) => String(first.title || '').localeCompare(String(second.title || ''), state.language));
  }

  function libraryDownloadMarkup(item) {
    const links = { ...(item.downloads || {}) };
    if (item.readUrl && !links.html) links.html = item.readUrl;
    return Object.entries(links).map(([format, rawUrl]) => {
      const url = core.safeHttpUrl(rawUrl);
      if (!url) return '';
      const label = format === 'html' ? t('libraryRead') : format.toUpperCase();
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    }).join('');
  }

  function renderLibrary() {
    const allResults = libraryResults();
    const results = allResults.slice(0, state.library.limit);
    const languages = [...new Set([
      ...state.librarySources.flatMap(source => source.languages || []),
      ...state.libraryItems.flatMap(item => item.languages || [])
    ])].filter(Boolean).sort();
    const formats = [...new Set([
      ...state.librarySources.flatMap(source => source.formats || []),
      ...state.libraryItems.flatMap(item => item.formats || [])
    ])].filter(Boolean).sort();
    viewRoot.innerHTML = `
      ${headingMarkup(t('library'), t('library'), t('libraryText'), specialtyBack())}
      <section class="library-source-section">
        <div class="section-heading"><h2>${escapeHtml(t('librarySources'))}</h2><small>${state.librarySources.length}</small></div>
        <div class="library-source-grid">${state.librarySources.map(source => {
          const catalogUrl = core.safeHttpUrl(source.catalogUrl || source.homepage);
          return `<article class="library-source-card">
            <span class="eyebrow">${escapeHtml((source.languages || []).map(value => value.toUpperCase()).join(' · '))}</span>
            <h3>${escapeHtml(source.name)}</h3>
            <p>${escapeHtml(source.description || '')}</p>
            <div class="meta-line">${(source.formats || []).map(format => `<span class="tag">${escapeHtml(String(format).toUpperCase())}</span>`).join('')}</div>
            ${catalogUrl ? `<a href="${escapeHtml(catalogUrl)}" target="_blank" rel="noopener noreferrer">↗ ${escapeHtml(t('libraryCatalog'))}</a>` : ''}
          </article>`;
        }).join('')}</div>
      </section>
      <section class="library-index-section">
        <div class="section-heading"><h2>${escapeHtml(t('libraryIndex'))}</h2><small>${results.length} ${escapeHtml(t('of'))} ${allResults.length}</small></div>
        <div class="library-controls">
          <input id="next-library-query" type="search" value="${escapeHtml(state.library.query)}" placeholder="${escapeHtml(t('librarySearch'))}">
          <label><span>${escapeHtml(t('librarySources'))}</span><select id="next-library-source">
            <option value="all">${escapeHtml(t('libraryAllSources'))}</option>
            ${state.librarySources.map(source => `<option value="${escapeHtml(source.id)}"${state.library.source === source.id ? ' selected' : ''}>${escapeHtml(source.name)}</option>`).join('')}
          </select></label>
          <label><span>${escapeHtml(t('libraryFormat'))}</span><select id="next-library-format">
            <option value="all">${escapeHtml(t('libraryAllFormats'))}</option>
            ${formats.map(format => `<option value="${escapeHtml(format)}"${state.library.format === format ? ' selected' : ''}>${escapeHtml(format.toUpperCase())}</option>`).join('')}
          </select></label>
        </div>
        <div class="filter-chips library-language-chips">
          <button type="button" class="${state.library.languages.length ? '' : 'active'}" data-action="library-language-all">${escapeHtml(t('libraryAllLanguages'))}</button>
          ${languages.map(language => `<button type="button" class="${state.library.languages.includes(language) ? 'active' : ''}" data-action="library-language" data-value="${escapeHtml(language)}" aria-pressed="${state.library.languages.includes(language)}">${escapeHtml(language.toUpperCase())}</button>`).join('')}
        </div>
        ${results.length ? `<div class="library-item-grid">${results.map(item => `<article class="library-item-card">
          <span class="eyebrow">${escapeHtml(item.sourceName || '')} · ${escapeHtml((item.languages || []).map(value => value.toUpperCase()).join(', '))}</span>
          <h3>${escapeHtml(item.title || '')}</h3>
          ${(item.authors || []).length ? `<p>${escapeHtml(item.authors.join(', '))}</p>` : ''}
          <div class="meta-line">${(item.topics || []).slice(0, 4).map(topic => `<span class="tag">${escapeHtml(classificationLabel(topic))}</span>`).join('')}</div>
          <div class="library-downloads" aria-label="${escapeHtml(t('libraryDownloads'))}">${libraryDownloadMarkup(item)}</div>
        </article>`).join('')}</div>` : `<div class="empty-state"><strong>${escapeHtml(t('libraryNoResults'))}</strong></div>`}
        ${results.length < allResults.length ? `<div class="load-more-row"><button type="button" class="secondary-button" data-action="library-more">${escapeHtml(t('libraryMore'))}</button></div>` : ''}
      </section>`;
  }

  function formatTimestamp(value, options = {}) {
    if (!value) return '—';
    try {
      const format = options.dateOnly
        ? { dateStyle: 'medium' }
        : { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      if (options.timeZone) format.timeZone = options.timeZone;
      return new Intl.DateTimeFormat(state.language, format).format(new Date(value));
    } catch {
      return '—';
    }
  }

  function countryLabel(value) {
    return ['XC', 'XE'].includes(value) ? t('internationalUnknown') : value;
  }

  function eventWhenLabel(event) {
    const start = formatTimestamp(event.start, { timeZone: event.timezone });
    const range = event.end > event.start + 12 * 60 * 60 * 1000
      ? ` – ${formatTimestamp(event.end, { timeZone: event.timezone })}`
      : '';
    return `${start}${range}${event.timezone ? ` · ${event.timezone}` : ''}`;
  }

  function eventReminders() {
    const values = readJson(EVENT_REMINDERS_KEY, {});
    return values && typeof values === 'object' && !Array.isArray(values) ? values : {};
  }

  function hasEventReminder(event) {
    return Boolean(eventReminders()[event?.id]);
  }

  async function toggleEventReminder(event) {
    if (!event?.id) return false;
    const reminders = eventReminders();
    const enabled = !reminders[event.id];
    if (enabled) {
      const reminder = {
        id: event.id,
        title: event.title,
        start: event.start,
        city: event.city,
        link: event.link,
        remindAt: Math.max(Date.now(), Number(event.start) - 2 * 60 * 60 * 1000),
        createdAt: Date.now()
      };
      try {
        const scheduled = await window.WRNDeviceBridge?.scheduleReminder?.(event, reminder.remindAt);
        if (scheduled?.native) reminder.nativeNotificationId = scheduled.id;
      } catch (error) {
        console.warn('Native event reminder unavailable', error?.message || error);
        showToast(t('reminderFailed'));
        return false;
      }
      reminders[event.id] = reminder;
      if (!reminder.nativeNotificationId && 'Notification' in window && Notification.permission === 'default') {
        void Notification.requestPermission().catch(() => {});
      }
    } else {
      if (reminders[event.id]?.nativeNotificationId) {
        try {
          await window.WRNDeviceBridge?.cancelReminder?.(reminders[event.id].nativeNotificationId);
        } catch (error) {
          console.warn('Native event reminder cancellation unavailable', error?.message || error);
        }
      }
      delete reminders[event.id];
    }
    writeJson(EVENT_REMINDERS_KEY, reminders);
    showToast(t(enabled ? 'reminderSet' : 'reminderRemoved'));
    return enabled;
  }

  async function addEventToCalendar(event) {
    if (!event?.id) return false;
    const filename = `wrn-event-${String(event.id).replace(/[^a-z0-9_-]/gi, '-').slice(0, 70)}.ics`;
    try {
      await window.WRNDeviceBridge?.addCalendarEvent?.(event, () => {
        downloadText(filename, release.eventIcs(event), 'text/calendar;charset=utf-8');
      });
      showToast(t('calendarOpened'));
      return true;
    } catch (error) {
      console.warn('Calendar handoff unavailable', error?.message || error);
      showToast(t('calendarFailed'));
      return false;
    }
  }

  function checkEventReminders() {
    const reminders = eventReminders();
    let changed = false;
    Object.values(reminders).forEach(reminder => {
      if (
        reminder?.notifiedAt
        || Number(reminder?.remindAt) > Date.now()
        || Number(reminder?.start) < Date.now() - 12 * 60 * 60 * 1000
      ) return;
      reminder.notifiedAt = Date.now();
      changed = true;
      const message = [reminder.title, reminder.city].filter(Boolean).join(' · ');
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('World Revolution News', {
            body: message,
            icon: 'icon.svg',
            tag: `wrn-event-${reminder.id}`
          });
        } catch {
          showToast(message);
        }
      } else {
        showToast(message);
      }
    });
    if (changed) writeJson(EVENT_REMINDERS_KEY, reminders);
  }

  function savedEventFilters() {
    const values = readJson(EVENT_FILTERS_KEY, []);
    return Array.isArray(values) ? values : [];
  }

  function storeCurrentEventFilter() {
    const record = {
      id: `filter-${Date.now()}`,
      label: [
        ...(state.eventFilter.regions || []),
        state.eventFilter.city,
        state.eventFilter.country,
        state.eventFilter.category,
        state.eventFilter.query
      ].filter(Boolean).join(' · ') || t('events'),
      query: state.eventFilter.query,
      regions: [...(state.eventFilter.regions || [])],
      country: state.eventFilter.country,
      city: state.eventFilter.city,
      category: state.eventFilter.category,
      group: state.eventFilter.group,
      date: state.eventFilter.date,
      radius: state.eventFilter.radius
    };
    writeJson(EVENT_FILTERS_KEY, [...savedEventFilters(), record].slice(-12));
    showToast(t('filterSaved'));
    renderEvents();
  }

  function downloadText(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  async function printZineStencil() {
    const target = document.querySelector('[data-stencil-print-target]');
    if (!target) return;
    const stencil = zineStencil();
    const landscape = stencil.orientation === 'landscape';
    const pageWidth = landscape ? '297mm' : '210mm';
    const pageHeight = landscape ? '210mm' : '297mm';
    target.classList.add('wrn-stencil-printing');
    const pageStyle = document.createElement('style');
    pageStyle.dataset.stencilPrintPage = 'true';
    pageStyle.textContent = `@page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 0; }
      @media print {
        body * { visibility: hidden !important; }
        [data-stencil-print-target], [data-stencil-print-target] * { visibility: visible !important; }
        [data-stencil-print-target] {
          position: fixed !important; inset: 0 !important; width: ${pageWidth} !important; height: ${pageHeight} !important;
          margin: 0 !important; border: 0 !important; box-shadow: none !important; background: #fff !important;
        }
        [data-stencil-print-target] > svg,
        [data-stencil-print-target] > img { width: 100% !important; height: 100% !important; object-fit: contain !important; }
      }`;
    document.head.appendChild(pageStyle);
    const cleanup = () => {
      target.classList.remove('wrn-stencil-printing');
      pageStyle.remove();
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    try {
      await (window.WRNDeviceBridge?.print?.(t('zineStencilPrint')) || Promise.resolve(window.print()));
    } catch (error) {
      console.warn('Stencil print unavailable', error?.name || 'error');
      cleanup();
    }
    window.setTimeout(cleanup, 60_000);
  }

  function eventById(id) {
    return state.events.find(event => event.id === id) || null;
  }

  function renderEvents() {
    state.cardArticles = [];
    const selectedRegions = state.eventFilter.regions || [];
    const eventRegions = [...new Set([
      ...state.events.map(eventRegion),
      ...selectedRegions
    ].filter(Boolean))].sort((first, second) => first.localeCompare(second, state.language));
    const countries = [...new Set(
      state.events
        .map(item => ['XC', 'XE'].includes(item.country) ? '__international__' : item.country)
        .filter(Boolean)
    )].sort((a, b) => {
      const labelA = a === '__international__' ? t('internationalUnknown') : countryLabel(a);
      const labelB = b === '__international__' ? t('internationalUnknown') : countryLabel(b);
      return labelA.localeCompare(labelB);
    });
    const cities = [...new Set(state.events.map(item => item.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const categories = [...new Set(
      state.events.flatMap(item => item.categories || []).map(release.eventCategoryGroup).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
    const groups = [...new Set(state.events.flatMap(item => item.groups || []).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const allFiltered = eventsForRegions(
      release.filterEvents(state.events, state.eventFilter),
      selectedRegions
    );
    const filtered = allFiltered.slice(0, Number(state.eventFilter.limit) || 60);
    const savedFilters = savedEventFilters();
    viewRoot.innerHTML = `
      ${headingMarkup(t('events'), t('events'), t('eventsText'), specialtyBack())}
      <div class="special-tabs" role="tablist" aria-label="${escapeHtml(t('events'))}">
        <button type="button" class="filter-chip${state.eventFilter.archived ? '' : ' active'}" data-action="event-period" data-value="upcoming">${escapeHtml(t('eventUpcoming'))}</button>
        <button type="button" class="filter-chip${state.eventFilter.archived ? ' active' : ''}" data-action="event-period" data-value="archive">${escapeHtml(t('eventArchive'))}</button>
      </div>
      <div class="special-filter-row">
        <input id="next-event-query" type="search" value="${escapeHtml(state.eventFilter.query)}" placeholder="${escapeHtml(t('eventSearch'))}" aria-label="${escapeHtml(t('eventSearch'))}">
        <label><span class="sr-only">${escapeHtml(t('eventCountry'))}</span><select id="next-event-country">
          <option value="">${escapeHtml(t('eventAllCountries'))}</option>
          ${countries.map(country => `<option value="${escapeHtml(country)}"${country === state.eventFilter.country ? ' selected' : ''}>${escapeHtml(country === '__international__' ? t('internationalUnknown') : countryLabel(country))}</option>`).join('')}
        </select></label>
      </div>
      ${state.eventArchiveLoading ? `<div class="notice-card event-archive-status" role="status"><strong>Radar.squat</strong><p>${escapeHtml(t('loadingAllEvents'))}</p></div>` : state.eventArchiveLoaded ? `<p class="event-archive-ready">✓ ${escapeHtml(t('allEventsReady'))} · ${state.events.length}</p>` : ''}
      <div class="event-filter-grid">
        <select id="next-event-region" aria-label="${escapeHtml(t('regions'))}">
          <option value="">${escapeHtml(t('allRegions'))}</option>
          ${selectedRegions.length > 1 ? `<option value="__preferences__" selected>${escapeHtml(t('following'))}: ${classificationList(selectedRegions).map(escapeHtml).join(' · ')}</option>` : ''}
          ${eventRegions.map(region => `<option value="${escapeHtml(region)}"${selectedRegions.length === 1 && selectedRegions[0] === region ? ' selected' : ''}>${escapeHtml(classificationLabel(region))}</option>`).join('')}
        </select>
        <select id="next-event-city" aria-label="${escapeHtml(t('city'))}">${selectOptions(cities, state.eventFilter.city, '', t('allCities'))}</select>
        <select id="next-event-category" aria-label="${escapeHtml(t('category'))}">${selectOptions(categories, state.eventFilter.category, '', t('allEventCategories'))}</select>
        <select id="next-event-group" aria-label="${escapeHtml(t('group'))}">${selectOptions(groups, state.eventFilter.group, '', t('allGroups'))}</select>
        <input id="next-event-date" type="date" value="${escapeHtml(state.eventFilter.date)}" aria-label="${escapeHtml(t('date'))}">
      </div>
      <div class="event-radar-tools" role="group" aria-label="${escapeHtml(t('eventTools'))}">
        <button type="button" class="${state.eventFilter.location ? 'is-active' : ''}" data-action="event-location" aria-pressed="${Boolean(state.eventFilter.location)}">⌖ ${escapeHtml(state.eventFilter.location ? t('locationOff') : t('nearMe'))}</button>
        <select id="next-event-radius" aria-label="${escapeHtml(t('radius'))}"${state.eventFilter.location ? '' : ' disabled'}>
          <option value="0">${escapeHtml(t('radius'))}</option>
          ${[10, 25, 50, 100, 250].map(value => `<option value="${value}"${Number(state.eventFilter.radius) === value ? ' selected' : ''}>${value} km</option>`).join('')}
        </select>
        <button type="button" data-action="event-radar">◎ ${escapeHtml(t('map'))}</button>
        <button type="button" data-action="event-filter-save">＋ ${escapeHtml(t('saveFilter'))}</button>
        ${savedFilters.length ? `<select id="next-event-saved-filter" aria-label="${escapeHtml(t('savedFilters'))}">
          <option value="">${escapeHtml(t('savedFilters'))}</option>
          ${savedFilters.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join('')}
        </select>` : ''}
      </div>
      <p class="event-location-note">${escapeHtml(t(state.eventFilter.location ? 'locationPrivate' : 'locationOptIn'))}</p>
      <div class="section-heading"><h2>${escapeHtml(state.eventFilter.archived ? t('eventArchive') : t('eventUpcoming'))}</h2><small>${filtered.length} / ${allFiltered.length}</small></div>
      ${filtered.length ? `<div class="event-grid">${filtered.map(event => `
        <article class="event-card">
          ${event.image ? `<img src="${escapeHtml(event.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
          <div>
            <span class="eyebrow">${escapeHtml(event.source)}</span>
            <h3>${escapeHtml(event.title)}</h3>
            <dl><div><dt>${escapeHtml(t('when'))}</dt><dd>${escapeHtml(eventWhenLabel(event))}</dd></div>
            <div><dt>${escapeHtml(t('where'))}</dt><dd>${escapeHtml([event.venue, event.city, countryLabel(event.country)].filter(Boolean).join(' · ') || '—')}</dd></div></dl>
            ${event.content ? `<p>${escapeHtml(core.excerpt(event.content, 220))}</p>` : ''}
            <div class="meta-line">${event.categories.slice(0, 3).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
            ${event.price ? `<p><strong>${escapeHtml(event.price)}</strong></p>` : ''}
            ${Number.isFinite(event.distanceKm) ? `<small class="event-distance">${escapeHtml(t('distance'))}: ${event.distanceKm < 10 ? event.distanceKm.toFixed(1) : Math.round(event.distanceKm)} km</small>` : ''}
            ${event.occurrenceCount > 1 ? `<small>${event.occurrenceCount} ${escapeHtml(t('eventRepeat'))}</small>` : ''}
            <div class="event-card-actions">
              <div class="event-card-actions__links">
                ${event.link ? `<a href="${escapeHtml(event.link)}" target="_blank" rel="noopener noreferrer">↗ ${escapeHtml(t('original'))}</a>` : ''}
                ${release.eventMapUrl(event) ? `<a href="${escapeHtml(release.eventMapUrl(event))}" target="_blank" rel="noopener noreferrer">◎ ${escapeHtml(t('map'))}</a>` : ''}
                ${release.eventRouteUrl(event) ? `<a href="${escapeHtml(release.eventRouteUrl(event))}" target="_blank" rel="noopener noreferrer">→ ${escapeHtml(t('route'))}</a>` : ''}
              </div>
              <div class="event-card-actions__personal">
                <button type="button" data-action="event-calendar" data-event-id="${escapeHtml(event.id)}">＋ ${escapeHtml(t('calendar'))}</button>
                <button type="button" class="${hasEventReminder(event) ? 'event-reminder-active' : ''}" data-action="event-reminder" data-event-id="${escapeHtml(event.id)}" aria-pressed="${hasEventReminder(event)}">◷ ${escapeHtml(t('remind'))}</button>
              </div>
            </div>
          </div>
        </article>`).join('')}</div>${filtered.length < allFiltered.length ? `<button class="secondary-button event-more-button" type="button" data-action="event-more">${escapeHtml(t('moreEvents'))} · ${Math.min(60, allFiltered.length - filtered.length)}</button>` : ''}` : `<div class="empty-state"><strong>${escapeHtml(t('noEvents'))}</strong></div>`}
    `;
  }

  function requestEventLocation() {
    if (state.eventFilter.location) {
      state.eventFilter.location = null;
      state.eventFilter.radius = 0;
      renderEvents();
      return;
    }
    if (!navigator.geolocation) {
      showToast(t('locationUnavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      state.eventFilter.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      state.eventFilter.radius = 50;
      renderEvents();
    }, error => {
      console.warn('Optional event distance unavailable', error);
      showToast(t('locationUnavailable'));
    }, {
      enableHighAccuracy: false,
      maximumAge: 10 * 60 * 1000,
      timeout: 9000
    });
  }

  function renderEventRadar() {
    const items = eventsForRegions(
      release.filterEvents(state.events, state.eventFilter),
      state.eventFilter.regions
    ).slice(0, 80);
    const groups = new Map();
    items.forEach(event => {
      const key = [countryLabel(event.country), event.city || '—'].filter(Boolean).join(' · ');
      const rows = groups.get(key) || [];
      rows.push(event);
      groups.set(key, rows);
    });
    const body = groups.size
      ? `<p class="release-note">${escapeHtml(t('locationPrivate'))}</p>
        <div class="event-grid">${[...groups.entries()].map(([place, rows]) => `
          <article class="event-card"><div>
            <span class="eyebrow">${escapeHtml(place)}</span>
            <h3>${rows.length} ${escapeHtml(t('events'))}</h3>
            <ol>${rows.slice(0, 8).map(event => `<li>
              <a href="${escapeHtml(release.eventMapUrl(event) || event.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.title)}</a>
              <small>${escapeHtml(eventWhenLabel(event))}${Number.isFinite(event.distanceKm) ? ` · ${event.distanceKm.toFixed(1)} km` : ''}</small>
            </li>`).join('')}</ol>
          </div></article>`).join('')}</div>`
      : `<div class="empty-state"><strong>${escapeHtml(t('noEvents'))}</strong></div>`;
    openReleaseDialog(
      t('events'),
      `${t('events')} · ${t('map')}`,
      body,
      `<button type="button" class="primary-button" data-release-close>${escapeHtml(t('close'))}</button>`
    );
  }

  function applySavedEventFilter(id) {
    const record = savedEventFilters().find(item => item.id === id);
    if (!record) return;
    Object.assign(state.eventFilter, {
      query: record.query || '',
      regions: Array.isArray(record.regions) ? record.regions.filter(Boolean) : [],
      country: record.country || '',
      city: record.city || '',
      category: record.category || '',
      group: record.group || '',
      date: record.date || '',
      radius: state.eventFilter.location ? Number(record.radius || 0) : 0
    });
    renderEvents();
  }

  function sectionLabel(section) {
    return window.WRNLexicon184?.sectionLabel?.(section, state.language) || section;
  }

  function renderLexiconSources() {
    return `<div class="source-grid">${state.lexiconSnapshot.sources.map(source => {
      const sourceUrl = core.safeHttpUrl(source.url);
      const downloads = (source.downloads || [])
        .map(download => ({ ...download, url: core.safeHttpUrl(download.url) }))
        .filter(download => download.url);
      return `
        <article class="source-card">
          <span class="eyebrow">${escapeHtml(source.language || '')}</span>
          <h3>${escapeHtml(source.name)}</h3>
          <p>${escapeHtml(specialty.localized(source.description, state.language))}</p>
          <div class="source-actions">
            ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('sourceOpen'))}</a>` : ''}
            ${downloads.map(download => `<a href="${escapeHtml(download.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(download.label)}</a>`).join('')}
          </div>
        </article>`;
    }).join('')}</div>`;
  }

  function renderLexicon() {
    state.cardArticles = [];
    const sections = ['all', 'basics', 'organisation', 'justice', 'power', 'tactics', 'ecology', 'struggles', 'sources'];
    const terms = specialty.glossaryEntries(state.lexiconSnapshot, state.language, state.lexicon.section, state.lexicon.query);
    viewRoot.innerHTML = `
      ${headingMarkup(t('lexicon'), t('lexicon'), t('glossaryIntro'), specialtyBack())}
      <div class="special-tabs lexicon-tabs">${sections.map(section => `<button type="button" class="filter-chip${state.lexicon.section === section ? ' active' : ''}" data-action="lexicon-section" data-value="${section}">${escapeHtml(section === 'sources' ? t('glossarySources') : sectionLabel(section))}</button>`).join('')}</div>
      ${state.lexicon.section === 'sources' ? `
        <div class="special-actions"><button type="button" class="secondary-button" data-action="lexicon-download">${escapeHtml(t('downloadJson'))}</button></div>
        ${renderLexiconSources()}` : `
        <div class="special-filter-row"><input id="next-lexicon-query" type="search" value="${escapeHtml(state.lexicon.query)}" placeholder="${escapeHtml(t('glossarySearch'))}" aria-label="${escapeHtml(t('glossarySearch'))}"><span class="result-count">${terms.length}</span></div>
        <div class="lexicon-grid">${terms.map(term => `
          <details class="lexicon-card">
            <summary><span class="eyebrow">${escapeHtml(sectionLabel(term.category))}</span><strong>${escapeHtml(term.displayTitle)}</strong><p>${escapeHtml(term.displaySummary)}</p></summary>
            <div class="lexicon-detail">
              ${term.displayPractice ? `<h4>${escapeHtml(t('practice'))}</h4><p>${escapeHtml(term.displayPractice)}</p>` : ''}
              ${term.displayDebate ? `<h4>${escapeHtml(t('debate'))}</h4><p>${escapeHtml(term.displayDebate)}</p>` : ''}
              ${(term.related || []).length ? `<h4>${escapeHtml(t('related'))}</h4><div class="meta-line">${term.related.map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>` : ''}
              ${!['de', 'en'].includes(state.language) ? `<small>${escapeHtml(t('fallbackLanguage'))}</small>` : ''}
            </div>
          </details>`).join('')}</div>`}
    `;
  }

  function prisonerAddress(profile) {
    return (profile?.mailingAddress?.lines || []).join('\n');
  }

  function prisonerExternalUrl(value) {
    const url = String(value || '').trim();
    return /^https:\/\//i.test(url) ? url : '';
  }

  function sortedPrisonerProfiles() {
    return [...(state.prisonerData.profiles || [])].sort((a, b) => {
      const aEurope = a.region === 'Europe' ? 0 : 1;
      const bEurope = b.region === 'Europe' ? 0 : 1;
      return aEurope - bEurope
        || String(a.country || '').localeCompare(String(b.country || ''), state.language)
        || String(a.publicName || '').localeCompare(String(b.publicName || ''), state.language);
    });
  }

  function prisonerSourcesMarkup(profiles) {
    const sources = state.prisonerData.sources || [];
    const sourceKinds = state.language === 'de'
      ? {
          'primary-support-group': 'Solidaritätsgruppe',
          'letter-writing-guidance': 'Briefhinweise',
          'support-network': 'Solidaritätsnetzwerk',
          'official-mail-guidance': 'Offizielle Postregeln'
        }
      : {
          'primary-support-group': 'Solidarity group',
          'letter-writing-guidance': 'Letter-writing guidance',
          'support-network': 'Support network',
          'official-mail-guidance': 'Official mail guidance'
        };
    return `<div class="prisoner-source-grid">${sources.map(source => {
      const linked = profiles.filter(profile => (profile.verification?.sourceIds || []).includes(source.id));
      const url = prisonerExternalUrl(source.url);
      return `<article class="prisoner-source-card">
        <header><div><span class="eyebrow">${escapeHtml(sourceKinds[source.kind] || t('prisonerSources'))}</span><h3>${escapeHtml(source.name || source.id)}</h3></div><span class="verification-badge">${escapeHtml(t('sourceChecked'))}: ${escapeHtml(formatTimestamp(`${source.checkedAt}T12:00:00Z`, { dateOnly: true }))}</span></header>
        <h4>${escapeHtml(t('linkedProfiles'))}</h4>
        <div class="meta-line">${linked.length
          ? linked.map(profile => `<span class="tag">${escapeHtml(profile.publicName)}</span>`).join('')
          : `<span>${escapeHtml(t('noLinkedProfiles'))}</span>`}</div>
        ${url ? `<a class="small-action prisoner-source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">↗ ${escapeHtml(t('sourceOpen'))}</a>` : ''}
      </article>`;
    }).join('')}</div>`;
  }

  function renderPrisoners() {
    state.cardArticles = [];
    const profiles = sortedPrisonerProfiles();
    const section = state.prisoners.section === 'sources' ? 'sources' : 'people';
    const europeCount = profiles.filter(profile => profile.region === 'Europe').length;
    viewRoot.innerHTML = `
      ${headingMarkup(t('prisoners'), t('prisoners'), t('prisonerIntro'), specialtyBack())}
      <div class="notice-card"><p>${escapeHtml(t('prisonerLimited'))}</p></div>
      <div class="special-tabs prisoner-tabs" role="tablist" aria-label="${escapeHtml(t('prisoners'))}">
        <button type="button" role="tab" aria-selected="${section === 'people'}" class="filter-chip${section === 'people' ? ' active' : ''}" data-action="prisoner-section" data-value="people">${escapeHtml(t('prisonerPeople'))} · ${profiles.length}</button>
        <button type="button" role="tab" aria-selected="${section === 'sources'}" class="filter-chip${section === 'sources' ? ' active' : ''}" data-action="prisoner-section" data-value="sources">${escapeHtml(t('prisonerSources'))} · ${(state.prisonerData.sources || []).length}</button>
      </div>
      <p class="prisoner-directory-summary"><strong>${profiles.length} ${escapeHtml(t('profilesTotal'))}</strong><span>${europeCount} ${escapeHtml(t('profilesEurope'))}</span></p>
      ${section === 'sources' ? prisonerSourcesMarkup(profiles) : `<div class="prisoner-grid">${profiles.map(profile => {
        const current = specialty.isCurrentProfile(profile);
        const related = specialty.relatedArticles(profile, state.articles).slice(0, 3);
        const sourceUrl = prisonerExternalUrl(profile.verification?.profileUrl);
        const relatedMarkup = related.map(article => {
          const index = state.cardArticles.push(article) - 1;
          return `<button type="button" data-action="open" data-index="${index}"><strong>${escapeHtml(article.title)}</strong><small>${escapeHtml(article.source)}</small></button>`;
        }).join('');
        return `<article class="prisoner-card${current ? '' : ' stale'}">
          <header><div><span class="eyebrow">${escapeHtml(profile.country)} · ${escapeHtml(profile.institution)}</span><h3>${escapeHtml(profile.publicName)}</h3></div><span class="verification-badge">${escapeHtml(current ? t('verified') : t('reviewBy'))}: ${escapeHtml(formatTimestamp(`${profile.verification?.[current ? 'verifiedAt' : 'nextReviewAt']}T12:00:00Z`, { dateOnly: true }))}</span></header>
          <p>${escapeHtml(specialty.localized(profile.context, state.language))}</p>
          <div class="meta-line">${(profile.movementTags || []).map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>
          <details><summary>${escapeHtml(t('address'))}</summary><address>${escapeHtml(prisonerAddress(profile))}</address><p>${escapeHtml(specialty.localized(profile.mailRules?.notes, state.language))}</p></details>
          <div class="prisoner-related"><h4>${escapeHtml(t('relatedNews'))}</h4>${relatedMarkup || `<p>${escapeHtml(t('noRelated'))}</p>`}</div>
          <div class="prisoner-card-actions">
            <button type="button" class="primary-button" data-action="letter" data-profile-id="${escapeHtml(profile.id)}"${current ? '' : ' disabled'}>✉ ${escapeHtml(t('writeLetter'))}</button>
            ${sourceUrl ? `<a class="small-action prisoner-source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">↗ ${escapeHtml(t('sourceOpen'))}</a>` : ''}
          </div>
        </article>`;
      }).join('')}</div>`}
    `;
  }

  function developmentClassification(story) {
    const sourceItems = window.WRNStoriesCore?.perspectiveRows?.(story, 12)
      ?.map(row => row.item)
      || story?.items
      || [];
    const articles = sourceItems.map(core.normalizeArticle);
    const ranked = values => {
      const counts = new Map();
      values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
      return [...counts.entries()]
        .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], state.language))
        .map(([value]) => value);
    };
    const regions = ranked(articles.map(article => article.primaryRegion)).slice(0, 2);
    const topics = ranked(articles.flatMap(article => [
      article.primaryTopic,
      ...(article.secondaryTopics || [])
    ])).slice(0, 3);
    return [
      ...regions.map(value => `<span class="tag development-tag development-tag--region"><span aria-hidden="true">◎</span>${escapeHtml(classificationLabel(value))}</span>`),
      ...topics.map(value => `<span class="tag development-tag development-tag--topic"><span aria-hidden="true">#</span>${escapeHtml(classificationLabel(value))}</span>`)
    ].join('');
  }

  function developmentSourceMetadata(item) {
    return release.sourceMeta(item, state.sourceIndex);
  }

  function developmentAnalysis(story) {
    const storiesCore = window.WRNStoriesCore;
    return {
      mix: storiesCore.sourceMix(story, developmentSourceMetadata),
      perspectives: storiesCore.perspectiveRows(story, 6, developmentSourceMetadata)
    };
  }

  function languageLabel(code) {
    try {
      return new Intl.DisplayNames([state.language], { type: 'language' }).of(code) || code;
    } catch {
      return code;
    }
  }

  function developmentMixMarkup(mix) {
    const levelLabel = t(`mix${mix.level.charAt(0).toUpperCase()}${mix.level.slice(1)}`);
    const rows = [
      `<div><dt>${escapeHtml(t('mixSources'))}</dt><dd>${mix.sourceCount}</dd></div>`
    ];
    if (mix.origins.length) {
      rows.push(`<div><dt>${escapeHtml(t('mixOrigins'))}</dt><dd>${mix.origins.map(escapeHtml).join(', ')}</dd></div>`);
    }
    if (mix.languages.length) {
      rows.push(`<div><dt>${escapeHtml(t('mixLanguages'))}</dt><dd>${mix.languages.map(languageLabel).map(escapeHtml).join(', ')}</dd></div>`);
    }
    if (mix.unknownOriginSources) {
      rows.push(`<div><dt>${escapeHtml(t('mixUnknown'))}</dt><dd>${mix.unknownOriginSources}</dd></div>`);
    }
    if (mix.explicitOriginSources || mix.inferredOriginSources) {
      rows.push(`<div><dt>${escapeHtml(t('originEvidence'))}</dt><dd>${mix.explicitOriginSources} ${escapeHtml(t('originExplicit'))} · ${mix.inferredOriginSources} ${escapeHtml(t('originInferred'))}</dd></div>`);
    }
    if (state.sourceIndex?.generatedAt) {
      rows.push(`<div><dt>${escapeHtml(t('registryUpdated'))}</dt><dd>${escapeHtml(new Intl.DateTimeFormat(state.language, { dateStyle: 'medium' }).format(new Date(state.sourceIndex.generatedAt)))}</dd></div>`);
    }
    return `<details class="source-mix-details development-quality-card development-mix--${escapeHtml(mix.level)}">
      <summary><span>${escapeHtml(t('sourceMix'))}</span><strong>${escapeHtml(levelLabel)}</strong></summary>
      <p>${escapeHtml(t('mixExplanation'))}</p>
      <dl>${rows.join('')}</dl>
      ${mix.level === 'limited' ? `<p class="development-caution">${escapeHtml(t('limitedPerspective'))}</p>` : ''}
    </details>`;
  }

  function developmentComparisonMarkup(rows) {
    const articles = rows.map(row => core.normalizeArticle(row.item));
    const minimumShared = Math.max(2, Math.ceil(articles.length * 0.6));
    const sharedValues = (groups, maximum) => {
      const counts = new Map();
      groups.forEach(values => {
        [...new Set(values.filter(Boolean))].forEach(value => {
          counts.set(value, (counts.get(value) || 0) + 1);
        });
      });
      return [...counts.entries()]
        .filter(([, count]) => count >= minimumShared)
        .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], state.language))
        .slice(0, maximum)
        .map(([value]) => value);
    };
    const sharedRegions = sharedValues(articles.map(article => [article.primaryRegion]), 2);
    const sharedTopics = sharedValues(articles.map(article => [
      article.primaryTopic,
      ...(article.secondaryTopics || [])
    ]), 3);
    const sharedMarkup = [
      ...sharedRegions.map(value => `<span class="tag development-tag development-tag--region"><span aria-hidden="true">◎</span>${escapeHtml(classificationLabel(value))}</span>`),
      ...sharedTopics.map(value => `<span class="tag development-tag development-tag--topic"><span aria-hidden="true">#</span>${escapeHtml(classificationLabel(value))}</span>`)
    ].join('') || `<span class="tag">${escapeHtml(t('comparisonSameEvent'))}</span>`;
    const distinctCount = values => new Set(values.filter(Boolean)).size;
    const differenceFacts = [
      `${rows.length} ${t('storySources')}`,
      distinctCount(rows.map(row => row.language)) > 1 ? `${distinctCount(rows.map(row => row.language))} ${t('mixLanguages')}` : '',
      distinctCount(rows.map(row => row.origin)) > 1 ? `${distinctCount(rows.map(row => row.origin))} ${t('mixOrigins')}` : '',
      distinctCount(articles.map(article => article.primaryRegion)) > 1 ? `${distinctCount(articles.map(article => article.primaryRegion))} ${t('regions')}` : '',
      distinctCount(articles.map(article => article.primaryTopic)) > 1 ? `${distinctCount(articles.map(article => article.primaryTopic))} ${t('topics')}` : ''
    ].filter(Boolean);
    return `<div class="perspective-grid report-comparison-overview">
      <div class="perspective-card"><span class="eyebrow">${escapeHtml(t('comparisonShared'))}</span><div class="evidence-line">${sharedMarkup}</div></div>
      <div class="perspective-card"><span class="eyebrow">${escapeHtml(t('comparisonDifferent'))}</span><div class="perspective-meta">${differenceFacts.map(value => `<span>${escapeHtml(value)}</span>`).join('')}</div></div>
    </div>`;
  }

  const PERSPECTIVE_LABELS = Object.freeze({
    de:{ topic:'Aussage / Thema', sources:'Berichtende Quelle', agreement:'Übereinstimmende Angaben', differences:'Abweichend / widersprüchlich', unresolved:'Ungeklärt', languageOrigin:'Originalsprache / Herkunft', provenance:'Primärbericht / Weiterveröffentlichung', evidence:'Zeitpunkt / Beleg', primary:'Primärbericht', republication:'Weiterveröffentlichung' },
    en:{ topic:'Statement / topic', sources:'Reporting source', agreement:'Matching information', differences:'Divergent / contradictory', unresolved:'Unresolved', languageOrigin:'Original language / origin', provenance:'Primary report / republication', evidence:'Time / evidence', primary:'Primary report', republication:'Republication' },
    es:{ topic:'Afirmación / tema', sources:'Fuente informante', agreement:'Datos coincidentes', differences:'Divergente / contradictorio', unresolved:'Sin aclarar', languageOrigin:'Idioma original / origen', provenance:'Informe primario / republicación', evidence:'Momento / prueba', primary:'Informe primario', republication:'Republicación' },
    fr:{ topic:'Affirmation / thème', sources:'Source du reportage', agreement:'Informations concordantes', differences:'Divergent / contradictoire', unresolved:'Non résolu', languageOrigin:'Langue originale / origine', provenance:'Reportage primaire / republication', evidence:'Date / preuve', primary:'Reportage primaire', republication:'Republication' },
    it:{ topic:'Affermazione / tema', sources:'Fonte del resoconto', agreement:'Informazioni concordanti', differences:'Divergente / contraddittorio', unresolved:'Non chiarito', languageOrigin:'Lingua originale / origine', provenance:'Resoconto primario / ripubblicazione', evidence:'Momento / prova', primary:'Resoconto primario', republication:'Ripubblicazione' },
    pt:{ topic:'Afirmação / tema', sources:'Fonte do relato', agreement:'Informações coincidentes', differences:'Divergente / contraditório', unresolved:'Por esclarecer', languageOrigin:'Idioma original / origem', provenance:'Relato primário / republicação', evidence:'Momento / prova', primary:'Relato primário', republication:'Republicação' },
    ru:{ topic:'Утверждение / тема', sources:'Сообщающий источник', agreement:'Совпадающие сведения', differences:'Расхождения / противоречия', unresolved:'Не выяснено', languageOrigin:'Язык оригинала / происхождение', provenance:'Первичный материал / перепубликация', evidence:'Время / доказательство', primary:'Первичный материал', republication:'Перепубликация' },
    el:{ topic:'Ισχυρισμός / θέμα', sources:'Πηγή αναφοράς', agreement:'Συμφωνούντα στοιχεία', differences:'Αποκλίσεις / αντιφάσεις', unresolved:'Ανεπίλυτο', languageOrigin:'Γλώσσα πρωτοτύπου / προέλευση', provenance:'Πρωτογενής αναφορά / αναδημοσίευση', evidence:'Χρόνος / τεκμήριο', primary:'Πρωτογενής αναφορά', republication:'Αναδημοσίευση' },
    tr:{ topic:'İddia / konu', sources:'Haber kaynağı', agreement:'Uyuşan bilgiler', differences:'Farklı / çelişkili', unresolved:'Açıklığa kavuşmamış', languageOrigin:'Özgün dil / köken', provenance:'Birincil haber / yeniden yayın', evidence:'Zaman / kanıt', primary:'Birincil haber', republication:'Yeniden yayın' }
  });

  function developmentPerspectivesMarkup(rows) {
    const labels = PERSPECTIVE_LABELS[state.language] || PERSPECTIVE_LABELS.en;
    const claimsById = new Map();
    rows.forEach(row => (row.item?.claims || []).forEach(claim => {
      const normalized = product21.normalizeClaim(claim);
      if (!normalized) return;
      if (!claimsById.has(normalized.id)) claimsById.set(normalized.id, []);
      claimsById.get(normalized.id).push({ row, claim: normalized });
    }));
    const matrixRows = rows.map(row => {
      const normalized = core.normalizeArticle(row.item);
      const index = state.cardArticles.push(normalized) - 1;
      const claims = (row.item?.claims || []).map(claim => product21.normalizeClaim(claim)).filter(Boolean);
      const agreements = claims.filter(claim => (claimsById.get(claim.id) || []).length > 1 && claim.status === 'confirmed');
      const differences = claims.filter(claim => ['contradicted', 'corrected', 'retracted'].includes(claim.status));
      const unresolved = claims.filter(claim => claim.status === 'unresolved');
      const claimText = values => values.length ? values.map(claim => escapeHtml(claim.text)).join('<br>') : escapeHtml(t('unknownStructured'));
      const provenance = core.text(row.item?.reportProvenance || row.item?.provenanceType);
      const provenanceLabel = provenance === 'primary' ? labels.primary : provenance === 'republication' ? labels.republication : t('unknownStructured');
      const evidenceUrl = core.safeHttpUrl(row.link);
      const dateValue = Number(row.date);
      const date = Number.isFinite(dateValue) && dateValue > 0
        ? new Intl.DateTimeFormat(state.language, { dateStyle:'medium', timeStyle:'short' }).format(new Date(dateValue))
        : t('unknownStructured');
      return `<tr>
        <th scope="row"><button type="button" class="matrix-report" data-action="open" data-index="${index}">${escapeHtml(row.title)}</button><small>${escapeHtml(row.summary)}</small></th>
        <td>${escapeHtml(row.source)}</td><td>${claimText(agreements)}</td><td>${claimText(differences)}</td><td>${claimText(unresolved)}</td>
        <td>${escapeHtml([row.language ? languageLabel(row.language) : '', row.origin].filter(Boolean).join(' · ') || t('unknownStructured'))}</td>
        <td>${escapeHtml(provenanceLabel)}</td><td>${escapeHtml(date)}${evidenceUrl ? `<br><a href="${escapeHtml(evidenceUrl)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(t('sourceOpen'))}</a>` : ''}</td>
      </tr>`;
    }).join('');
    return `<details class="perspective-details">
      <summary>${escapeHtml(t('compareReports'))} (${rows.length})</summary>
      <p>${escapeHtml(t('compareIntro'))}</p>
      <p class="development-caution">${escapeHtml(t('contentUnassessed'))}</p>
      <p class="development-caution">${escapeHtml(t('structuredMatchOnly'))}</p>
      ${developmentComparisonMarkup(rows)}
      <div class="perspective-matrix-scroll" tabindex="0"><table class="perspective-matrix"><thead><tr>${Object.values(labels).slice(0, 8).map(label => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${matrixRows}</tbody></table></div>
    </details>`;
  }

  function dossierEvidenceMarkup(story) {
    const record = state.developmentSnapshotCurrent?.clusters?.find(item => item.id === story.id)
      || product21.createDevelopmentSnapshot([story], state.solidarityActions).clusters[0];
    const change = state.developmentChanges?.firstVisit
      ? null
      : state.developmentChanges?.changes?.find(item => item.clusterId === story.id);
    const latest = core.normalizeArticle(story.items?.[story.items.length - 1] || {});
    const claims = record?.claims || [];
    const corrections = claims.filter(claim => ['corrected', 'retracted'].includes(claim.status));
    const actions = product21.activeVerifiedActions(state.solidarityActions).filter(action => action.dossierId === story.id);
    const inputChecklist = product21.dossierInputChecklist(story, state.solidarityActions);
    const list = values => values.length ? `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : `<p>${escapeHtml(t('unknownStructured'))}</p>`;
    return `<section class="dossier-evidence" aria-label="${escapeHtml(t('dossierOverview'))}">
      <div class="dossier-provenance"><strong>${escapeHtml(t('automaticGroup'))}</strong><span>${escapeHtml(t('contentUnassessed'))}</span></div>
      <h4>${escapeHtml(t('dossierOverview'))}</h4><p>${escapeHtml(latest.intro || latest.title)}</p>
      ${change ? `<h4>${escapeHtml(t('dossierChanges'))}</h4>${list([
        ...change.newConfirmedInformation.map(item => item.text), ...change.correctedOrRetracted.map(item => item.text),
        ...change.newSources.map(item => `+ ${item}`), ...change.newMedia.map(item => `+ ${item.title}`),
        ...change.newVerifiedActions.map(item => `+ ${item}`), ...change.deletedClaims.map(item => `− ${item.text}`)
      ])}` : ''}
      <h4>${escapeHtml(t('dossierClaims'))}</h4>${list(claims.map(claim => `${claim.status}: ${claim.text}`))}
      <h4>${escapeHtml(t('dossierCorrections'))}</h4>${list(corrections.map(claim => `${claim.occurredAt || '–'} · ${claim.text}`))}
      <h4>${escapeHtml(t('dossierMedia'))}</h4>${record?.media?.length ? `<ul>${record.media.map(item => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(item.type)} · ${escapeHtml(item.title)}</a></li>`).join('')}</ul>` : `<p>${escapeHtml(t('unknownStructured'))}</p>`}
      <h4>${escapeHtml(t('whatCanDo'))}</h4>${actions.length ? `<ul>${actions.map(action => `<li><a href="${escapeHtml(action.originalSource)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"><strong>${escapeHtml(action.title)}</strong></a><br>${escapeHtml(action.organizer)} · ${escapeHtml(action.locationOrReach)}</li>`).join('')}</ul>` : `<p>${escapeHtml(t('noVerifiedActions'))}</p>`}
      ${inputChecklist.complete ? '' : `<details class="data-input-checklist"><summary>${escapeHtml(t('inputChecklist'))}</summary><p>${escapeHtml(t('missingEditorialData'))}</p><ul>${inputChecklist.missing.map(field => `<li><code>${escapeHtml(field)}</code></li>`).join('')}</ul></details>`}
    </section>`;
  }

  function developmentStrength(story) {
    const value = Math.round((story?.matchConfidence || 0) * 100);
    return {
      value,
      label: t(value >= 82 ? 'strengthVeryHigh' : 'strengthHigh')
    };
  }

  function developmentClusters() {
    return specialty.developmentClusters(state.articles, window.WRNStoriesCore, {
      days: 30,
      threshold: DEVELOPMENT_MATCH_THRESHOLD
    });
  }

  function reviewArticleKey(item) {
    const normalized = core.normalizeArticle(item);
    return normalized.link || `${normalized.source}::${normalized.title}`;
  }

  function normalizedDevelopmentReviews() {
    return Array.isArray(state.developmentReviews)
      ? state.developmentReviews.filter(item => item && typeof item === 'object' && item.id)
      : [];
  }

  function storeDevelopmentReviews(values) {
    state.developmentReviews = values.slice(0, 250);
    writeJson(DEVELOPMENT_REVIEW_KEY, state.developmentReviews);
  }

  function developmentReviewCount(storyId = '') {
    return normalizedDevelopmentReviews().filter(item => (
      item.status !== 'resolved' && (!storyId || item.storyId === storyId)
    )).length;
  }

  function openDevelopmentReview(storyId) {
    const story = developmentClusters().find(item => item.id === storyId);
    if (!story || !developmentReviewDialog) return;
    state.developmentReviewStoryId = story.id;
    document.getElementById('next-development-review-kicker').textContent = t('reviewAudit');
    document.getElementById('next-development-review-title').textContent = t('reviewGrouping');
    document.getElementById('next-development-review-content').innerHTML = `
      <p>${escapeHtml(t('reviewIntro'))}</p>
      <div class="review-story-summary"><span>${story.itemCount} ${escapeHtml(t('storyArticles'))} · ${story.sourceCount} ${escapeHtml(t('storySources'))}</span><strong>${escapeHtml(story.title)}</strong></div>
      <form id="next-development-review-form" class="development-review-form">
        <label><span>${escapeHtml(t('reviewReport'))}</span><select name="articleKey">
          <option value="">${escapeHtml(t('reviewWholeCluster'))}</option>
          ${story.items.map(item => {
            const normalized = core.normalizeArticle(item);
            return `<option value="${escapeHtml(reviewArticleKey(item))}">${escapeHtml(normalized.source)} · ${escapeHtml(normalized.title)}</option>`;
          }).join('')}
        </select></label>
        <label><span>${escapeHtml(t('reviewReason'))}</span><select name="reason" required>
          <option value="wrong-article">${escapeHtml(t('reviewReasonWrongArticle'))}</option>
          <option value="different-event">${escapeHtml(t('reviewReasonDifferentEvent'))}</option>
          <option value="duplicate">${escapeHtml(t('reviewReasonDuplicate'))}</option>
          <option value="classification">${escapeHtml(t('reviewReasonClassification'))}</option>
          <option value="other">${escapeHtml(t('reviewReasonOther'))}</option>
        </select></label>
        <label><span>${escapeHtml(t('reviewNote'))}</span><textarea name="note" maxlength="500" rows="4"></textarea></label>
      </form>`;
    document.getElementById('next-development-review-actions').innerHTML = `
      <button type="button" class="secondary-button" data-review-close>${escapeHtml(t('reviewClose'))}</button>
      <button type="submit" form="next-development-review-form" class="primary-button">${escapeHtml(t('reviewSubmit'))}</button>`;
    if (!developmentReviewDialog.open) developmentReviewDialog.showModal();
  }

  function reviewReasonLabel(reason) {
    const labels = {
      'wrong-article': 'reviewReasonWrongArticle',
      'different-event': 'reviewReasonDifferentEvent',
      duplicate: 'reviewReasonDuplicate',
      classification: 'reviewReasonClassification',
      other: 'reviewReasonOther'
    };
    return t(labels[reason] || 'reviewReasonOther');
  }

  function developmentReviewHistoryMarkup(item) {
    const labels = {
      reported: 'reviewReported',
      resolved: 'reviewMarkedResolved',
      reopened: 'reviewReopened'
    };
    const history = specialty.developmentReviewHistory(item);
    if (!history.length) return '';
    return `<details class="review-history">
      <summary>${escapeHtml(t('reviewHistory'))} <span>${history.length}</span></summary>
      <ol>${history.map(entry => `<li><span>${escapeHtml(t(labels[entry.action] || 'reviewHistory'))}</span><time>${escapeHtml(new Intl.DateTimeFormat(state.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.at)))}</time></li>`).join('')}</ol>
    </details>`;
  }

  function openDevelopmentReviewQueue() {
    if (!developmentReviewDialog) return;
    const reviews = normalizedDevelopmentReviews()
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)));
    document.getElementById('next-development-review-kicker').textContent = t('reviewAudit');
    document.getElementById('next-development-review-title').textContent = t('reviewQueue');
    document.getElementById('next-development-review-content').innerHTML = reviews.length
      ? `<div class="development-review-list">${reviews.map(item => `<article class="development-review-item${item.status === 'resolved' ? ' is-resolved' : ''}">
          <header><span class="review-status">${escapeHtml(t(item.status === 'resolved' ? 'reviewResolved' : 'reviewOpen'))}</span><time>${escapeHtml(new Intl.DateTimeFormat(state.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt)))}</time></header>
          <strong>${escapeHtml(item.storyTitle)}</strong>
          ${item.articleTitle ? `<small>${escapeHtml(item.articleSource)} · ${escapeHtml(item.articleTitle)}</small>` : ''}
          <p>${escapeHtml(reviewReasonLabel(item.reason))}${item.note ? ` — ${escapeHtml(item.note)}` : ''}</p>
          ${developmentReviewHistoryMarkup(item)}
          <div><button type="button" data-action="development-review-status" data-review-id="${escapeHtml(item.id)}">${escapeHtml(t(item.status === 'resolved' ? 'reviewReopen' : 'reviewResolve'))}</button><button type="button" data-action="development-review-remove" data-review-id="${escapeHtml(item.id)}">${escapeHtml(t('reviewRemove'))}</button></div>
        </article>`).join('')}</div>`
      : `<div class="empty-state"><strong>${escapeHtml(t('reviewEmpty'))}</strong></div>`;
    document.getElementById('next-development-review-actions').innerHTML = `
      <button type="button" class="secondary-button" data-review-close>${escapeHtml(t('reviewClose'))}</button>
      ${reviews.length ? `<button type="button" class="primary-button" data-action="development-review-export">${escapeHtml(t('reviewExport'))}</button>` : ''}`;
    if (!developmentReviewDialog.open) developmentReviewDialog.showModal();
  }

  function submitDevelopmentReview(form) {
    const story = developmentClusters().find(item => item.id === state.developmentReviewStoryId);
    if (!story) return;
    const data = new FormData(form);
    const articleKey = String(data.get('articleKey') || '');
    const article = story.items.find(item => reviewArticleKey(item) === articleKey);
    const normalized = article ? core.normalizeArticle(article) : null;
    const now = new Date().toISOString();
    storeDevelopmentReviews([{
      id: `development-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storyId: story.id,
      storyTitle: story.title,
      articleKey,
      articleTitle: normalized?.title || '',
      articleSource: normalized?.source || '',
      reason: String(data.get('reason') || 'other'),
      note: String(data.get('note') || '').trim().slice(0, 500),
      matchConfidence: Number(story.matchConfidence || 0),
      sourceCount: Number(story.sourceCount || 0),
      status: 'open',
      createdAt: now,
      updatedAt: now,
      history: [{ action: 'reported', at: now }]
    }, ...normalizedDevelopmentReviews()]);
    developmentReviewDialog.close();
    showToast(t('reviewSaved'));
    renderDevelopments();
  }

  function renderDevelopments() {
    state.cardArticles = [];
    const all = developmentClusters();
    const watched = new Set(Array.isArray(state.developmentWatch) ? state.developmentWatch : []);
    const clusters = state.developmentsWatchedOnly ? all.filter(story => watched.has(story.id)) : all;
    if (!state.developmentSnapshotCurrent) {
      state.developmentSnapshotCurrent = product21.createDevelopmentSnapshot(all, state.solidarityActions);
      state.developmentChanges = product21.snapshotDiff(state.developmentSnapshotBeforeVisit, state.developmentSnapshotCurrent);
    }
    const overlooked = product21.overlookedClusters(all, developmentSourceMetadata);
    viewRoot.innerHTML = `
      ${headingMarkup(t('developments'), t('developments'), t('developmentIntro'), specialtyBack())}
      <div class="special-tabs"><button type="button" class="filter-chip${state.developmentsWatchedOnly ? '' : ' active'}" data-action="development-filter" data-value="all">${escapeHtml(t('showAll'))}</button><button type="button" class="filter-chip${state.developmentsWatchedOnly ? ' active' : ''}" data-action="development-filter" data-value="watched">${escapeHtml(t('showWatched'))}</button></div>
      <section class="overlooked-section" aria-labelledby="overlooked-title"><h2 id="overlooked-title">${escapeHtml(t('overlooked'))}</h2><p>${escapeHtml(product21.OVERLOOKED_STATEMENT)}</p>${overlooked.length ? `<ul>${overlooked.map(item => `<li><button type="button" data-view-target="developments" data-dossier-id="${escapeHtml(item.clusterId)}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.focusSources.join(' · '))}</small></button></li>`).join('')}</ul>` : `<p>${escapeHtml(t('overlookedEmpty'))}</p>`}</section>
      ${clusters.length ? `<div class="development-grid">${clusters.map(story => {
        const isWatching = watched.has(story.id);
        const classification = developmentClassification(story);
        const strength = developmentStrength(story);
        const analysis = developmentAnalysis(story);
        return `<article class="development-card${state.activeDossierId === story.id ? ' is-active-dossier' : ''}" data-dossier-card="${escapeHtml(story.id)}" tabindex="-1">
          <header><div><span class="eyebrow">${story.itemCount} ${escapeHtml(t('storyArticles'))} · ${story.sourceCount} ${escapeHtml(t('storySources'))}</span><h3>${escapeHtml(story.title)}</h3></div><button type="button" class="watch-button" data-action="watch-development" data-story-id="${escapeHtml(story.id)}" aria-pressed="${isWatching}">${isWatching ? '★' : '☆'} ${escapeHtml(isWatching ? t('watching') : t('watch'))}</button></header>
          <div class="evidence-line"><strong>${escapeHtml(t('whyLinked'))}:</strong> ${classification}</div>
          <div class="development-quality-grid">
            <details class="assignment-details development-quality-card">
              <summary><span>${escapeHtml(t('assignmentStrength'))}</span><strong>${escapeHtml(strength.label)} · ${strength.value}%</strong></summary>
              <p>${escapeHtml(t('strengthExplanation'))}</p>
            </details>
            ${developmentMixMarkup(analysis.mix)}
          </div>
           ${developmentPerspectivesMarkup(analysis.perspectives)}
           ${dossierEvidenceMarkup(story)}
          ${contextualHelpMarkup(story.helpTopics)}
          <h4 class="timeline-heading">${escapeHtml(t('storyTimeline'))}</h4>
          <ol class="timeline-list">${story.items.map(item => {
            const normalized = core.normalizeArticle(item);
            const index = state.cardArticles.push(normalized) - 1;
            return `<li><time>${escapeHtml(dateLabel(normalized))}</time><button type="button" data-action="open" data-index="${index}"><strong>${escapeHtml(normalized.title)}</strong><small>${escapeHtml(normalized.source)}</small></button></li>`;
          }).join('')}</ol>
        </article>`;
      }).join('')}</div>` : `<div class="empty-state"><strong>${escapeHtml(t('noDevelopments'))}</strong></div>`}
    `;
  }

  function renderMedia() {
    state.cardArticles = [];
    const section = state.media.section;
    viewRoot.innerHTML = `
      ${headingMarkup(t('media'), t('media'), t('mediaIntro'))}
      <div class="media-section-tabs" role="tablist" aria-label="${escapeHtml(t('media'))}">
        ${mediaTab('video', '▶', t('video'))}
        ${mediaTab('podcasts', '◉', t('podcastSeries'))}
        ${mediaTab('generated', '◌', t('generated'))}
        ${mediaTab('radio', '⌁', t('liveRadio'))}
        ${mediaTab('radio-podcasts', '⌁', t('radioShows'))}
        ${mediaTab('zine', '📄', t('zine'))}
      </div>
      ${['podcasts', 'radio-podcasts', 'generated', 'radio'].includes(section) ? `
        <label class="audio-favorites-filter">
          <input id="next-media-favorites-only" type="checkbox"${state.media.favoritesOnly ? ' checked' : ''}>
          <span>${escapeHtml(t('favoritesOnly'))}</span>
        </label>` : ''}
      ${['podcasts', 'radio-podcasts', 'generated'].includes(section) ? `
        <section class="audio-queue-panel" id="audio-queue-panel" aria-live="polite">
          <div class="audio-queue-heading">
            <strong id="audio-queue-title">${escapeHtml(t('audioQueue'))}</strong>
            <button type="button" id="audio-queue-clear">${escapeHtml(t('clear'))}</button>
          </div>
          <div id="audio-queue-list" class="audio-queue-list"></div>
        </section>` : ''}
      ${section === 'zine'
        ? renderZineSection()
        : section === 'podcasts'
        ? renderPodcastSection(state.podcasts, false, 'independent-podcast')
        : section === 'radio-podcasts'
          ? renderPodcastSection(state.podcasts, false, 'free-radio')
        : section === 'generated'
          ? renderPodcastSection(state.generatedPodcasts, true, 'generated')
          : section === 'radio'
            ? renderRadioSection()
            : renderVideoSection()}
    `;
    if (section === 'generated' && ['unknown', 'checking'].includes(state.podcastService)) {
      void probePodcastService().then(() => {
        if (state.view === 'media' && state.media.section === 'generated') renderMedia();
      });
    }
    if (['podcasts', 'radio-podcasts', 'generated', 'radio'].includes(section)) {
      window.setTimeout(installMediaControls, 0);
    }
  }

  function mediaTab(value, icon, label) {
    const active = state.media.section === value;
    return `<button type="button" role="tab" aria-selected="${active}" class="${active ? 'active' : ''}" data-action="media-section" data-value="${escapeHtml(value)}"><span aria-hidden="true">${escapeHtml(icon)}</span><strong>${escapeHtml(label)}</strong></button>`;
  }

  function mediaFilters({ categories = false } = {}) {
    const regions = [...new Set([
      ...state.articles.map(item => media.canonicalRegion(item.primaryRegion)),
      ...state.podcasts.map(item => media.canonicalRegion(item.region)),
      ...state.radioStations.map(item => media.canonicalRegion(item.region)),
      ...media.INFORMATION_VIDEOS.map(item => media.canonicalRegion(item.region))
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return `<div class="media-controls${categories ? '' : ' media-controls--two'}">
      <input id="next-media-query" type="search" value="${escapeHtml(state.media.query)}" placeholder="${escapeHtml(t('mediaSearch'))}" aria-label="${escapeHtml(t('mediaSearch'))}">
      ${categories ? `<select id="next-media-category" aria-label="${escapeHtml(t('allCategories'))}">
        <option value="all"${state.media.category === 'all' ? ' selected' : ''}>${escapeHtml(t('allCategories'))}</option>
        <option value="politics"${state.media.category === 'politics' ? ' selected' : ''}>${escapeHtml(t('politics'))}</option>
        <option value="society"${state.media.category === 'society' ? ' selected' : ''}>${escapeHtml(t('society'))}</option>
        <option value="culture"${state.media.category === 'culture' ? ' selected' : ''}>${escapeHtml(t('culture'))}</option>
      </select>` : ''}
      <select id="next-media-region" aria-label="${escapeHtml(t('allRegions'))}">
        <option value="all"${state.media.region === 'all' ? ' selected' : ''}>${escapeHtml(t('allRegions'))}</option>
        ${regions.map(region => `<option value="${escapeHtml(region)}"${state.media.region === region ? ' selected' : ''}>${escapeHtml(classificationLabel(region))}</option>`).join('')}
      </select>
    </div>`;
  }

  const VIDEO_SECTION_KEYS = Object.freeze({
    new: 'videoNew', reports: 'videoReports', interviews: 'videoInterviews',
    documentaries: 'videoDocumentaries', education: 'videoEducation', live: 'videoLive', saved: 'videoLater'
  });

  function videoDurationBucket(item) {
    const seconds = Number(item?.durationSeconds || 0);
    if (!seconds) return 'unknown';
    if (seconds <= 600) return 'short';
    if (seconds <= 1800) return 'medium';
    return 'long';
  }

  function videoDurationLabel(item) {
    const seconds = Number(item?.durationSeconds || 0);
    if (!seconds) return t('videoDurationUnknown');
    const minutes = Math.max(1, Math.round(seconds / 60));
    return `${minutes} Min.`;
  }

  function videoDateLabel(item) {
    const timestamp = Date.parse(item?.publishedAt || '');
    if (!Number.isFinite(timestamp)) return t('videoDateUnknown');
    return new Intl.DateTimeFormat(state.language, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(timestamp));
  }

  function videoHistoryIds() {
    return new Set((Array.isArray(state.videoHistory) ? state.videoHistory : []).map(item => core.text(item?.canonicalId || item)).filter(Boolean));
  }

  function videoFacet(items, key) {
    return [...new Set(items.map(item => core.text(item?.[key])).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, state.language));
  }

  function videoLanguageLabel(code) {
    return ['und', 'mul'].includes(core.text(code).toLocaleLowerCase()) ? t('videoLanguageUnknown') : languageLabel(code);
  }

  function videoFilterSelect(id, label, current, allLabel, values, format = value => value) {
    return `<label><span>${escapeHtml(label)}</span><select id="${escapeHtml(id)}" aria-label="${escapeHtml(label)}">
      <option value="all"${current === 'all' ? ' selected' : ''}>${escapeHtml(allLabel)}</option>
      ${values.map(value => `<option value="${escapeHtml(value)}"${current === value ? ' selected' : ''}>${escapeHtml(format(value))}</option>`).join('')}
    </select></label>`;
  }

  function videoFilterMarkup(items) {
    const filters = state.videoFilters;
    return `<div class="video-search-row">
      <label><span class="sr-only">${escapeHtml(t('videoSearch'))}</span><input id="next-video-query" type="search" value="${escapeHtml(filters.query)}" placeholder="${escapeHtml(t('videoSearch'))}" aria-label="${escapeHtml(t('videoSearch'))}"></label>
      <label><span>${escapeHtml(t('videoSort'))}</span><select id="next-video-sort">
        ${[['balanced', 'videoSortBalanced'], ['newest', 'videoSortNewest'], ['title', 'videoSortTitle'], ['source', 'videoSortSource']].map(([value, key]) => `<option value="${value}"${filters.sort === value ? ' selected' : ''}>${escapeHtml(t(key))}</option>`).join('')}
      </select></label>
    </div>
    <div class="video-filter-grid">
      ${videoFilterSelect('next-video-language', t('videoLanguage'), filters.language, t('videoAllLanguages'), videoFacet(items, 'language'), videoLanguageLabel)}
      ${videoFilterSelect('next-video-topic', t('videoTopic'), filters.topic, t('videoAllTopics'), videoFacet(items, 'topic'), classificationLabel)}
      ${videoFilterSelect('next-video-region', t('videoRegion'), filters.region, t('allRegions'), videoFacet(items, 'region'), classificationLabel)}
      ${videoFilterSelect('next-video-source', t('videoSource'), filters.source, t('videoAllSources'), videoFacet(items, 'source'))}
      ${videoFilterSelect('next-video-platform', t('videoPlatform'), filters.platform, t('videoAllPlatforms'), videoFacet(items, 'platform'))}
      ${videoFilterSelect('next-video-duration', t('videoDuration'), filters.duration, t('videoAllDurations'), ['short', 'medium', 'long', 'unknown'], value => t({ short:'videoDurationShort', medium:'videoDurationMedium', long:'videoDurationLong', unknown:'videoDurationUnknown' }[value]))}
    </div>`;
  }

  function filteredVideoItems() {
    const filters = state.videoFilters;
    const saved = new Set(Array.isArray(state.videoWatchLater) ? state.videoWatchLater : []);
    const query = core.text(filters.query).toLocaleLowerCase();
    const items = state.videoItems.filter(item => {
      if (filters.section === 'saved' && !saved.has(item.canonicalId)) return false;
      if (!['new', 'saved'].includes(filters.section) && item.section !== filters.section) return false;
      if (filters.language !== 'all' && item.language !== filters.language) return false;
      if (filters.topic !== 'all' && item.topic !== filters.topic) return false;
      if (filters.region !== 'all' && item.region !== filters.region) return false;
      if (filters.source !== 'all' && item.source !== filters.source) return false;
      if (filters.platform !== 'all' && item.platform !== filters.platform) return false;
      if (filters.duration !== 'all' && videoDurationBucket(item) !== filters.duration) return false;
      return !query || [item.title, item.description, item.source, item.topic, item.region, item.language]
        .map(core.text).join(' ').toLocaleLowerCase().includes(query);
    });
    if (filters.sort === 'newest') return [...items].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (filters.sort === 'title') return [...items].sort((a, b) => a.title.localeCompare(b.title, state.language));
    if (filters.sort === 'source') return [...items].sort((a, b) => a.source.localeCompare(b.source, state.language) || a.title.localeCompare(b.title, state.language));
    return items;
  }

  function renderVideoSection() {
    const items = filteredVideoItems();
    const savedCount = new Set(Array.isArray(state.videoWatchLater) ? state.videoWatchLater : []).size;
    const nonDefaultFilter = Object.entries(state.videoFilters).some(([key, value]) => (
      !['section', 'sort'].includes(key) && value !== (key === 'query' ? '' : 'all')
    )) || state.videoFilters.sort !== 'balanced';
    return `<section class="video-portal" aria-labelledby="video-portal-title">
      <div class="video-portal-heading">
        <div><span class="eyebrow">${escapeHtml(t('video'))}</span><h2 id="video-portal-title">${escapeHtml(t('videoPortalTitle'))}</h2><p>${escapeHtml(t('videoPortalIntro'))}</p></div>
        <span>${escapeHtml(String(state.videoItems.length))} ${escapeHtml(t('videoResults'))}</span>
      </div>
      <div class="video-section-tabs" role="tablist" aria-label="${escapeHtml(t('video'))}">
        ${Object.entries(VIDEO_SECTION_KEYS).map(([value, key]) => `<button type="button" role="tab" aria-selected="${state.videoFilters.section === value}" class="${state.videoFilters.section === value ? 'active' : ''}" data-action="video-section" data-value="${value}">${escapeHtml(t(key))}${value === 'saved' && savedCount ? ` <span>${savedCount}</span>` : ''}</button>`).join('')}
      </div>
      ${state.videoHistory.length ? `<div class="video-local-note"><button type="button" data-action="video-history-clear">${escapeHtml(t('videoHistoryClear'))}</button></div>` : ''}
      <details class="video-filter-panel"${nonDefaultFilter ? ' open' : ''}>
        <summary>${escapeHtml(t('filterVideos'))}<span>${items.length}</span></summary>
        <div class="video-filter-panel__body">${videoFilterMarkup(state.videoItems)}</div>
      </details>
      <div class="video-results-summary" aria-live="polite"><strong>${items.length}</strong> ${escapeHtml(t('videoResults'))}</div>
      ${items.length ? `<div class="video-portal-grid">${items.map(videoPortalCardMarkup).join('')}</div>` : mediaEmpty(t('noMedia'))}
    </section>`;
  }

  function videoPlayerMarkup(item) {
    if (state.activeVideoId !== item.canonicalId) return '';
    const player = item.embedUrl
      ? `<iframe src="${escapeHtml(item.embedUrl)}" title="${escapeHtml(item.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`
      : `<video src="${escapeHtml(item.originalUrl)}" controls preload="metadata"></video>`;
    return `<div class="video-player-shell" data-video-player>
      <div class="video-player-toolbar"><span>◉ ${escapeHtml(t('videoPlayerPrivacy'))}</span><button type="button" data-action="video-close">${escapeHtml(t('videoClose'))}</button></div>
      <div class="video-player-frame">${player}</div>
      <p>${escapeHtml(t('videoPlayerFallback'))} <a href="${escapeHtml(item.originalUrl)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(t('videoOriginal'))}</a></p>
    </div>`;
  }

  function videoPortalCardMarkup(item) {
    const saved = (Array.isArray(state.videoWatchLater) ? state.videoWatchLater : []).includes(item.canonicalId);
    const viewed = videoHistoryIds().has(item.canonicalId);
    const thumbnail = core.safeImageUrl(item.thumbnailUrl);
    return `<article class="video-portal-card${state.activeVideoId === item.canonicalId ? ' is-playing' : ''}">
      <div class="video-portal-card__visual">
        ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span aria-hidden="true">▶</span>'}
        <span class="video-platform-badge">${escapeHtml(item.platform)}</span>
        <span class="video-duration-badge">${escapeHtml(videoDurationLabel(item))}</span>
      </div>
      <div class="video-portal-card__body">
        <div class="video-card-kicker"><span>${escapeHtml(item.source)}</span><time datetime="${escapeHtml(item.publishedAt || '')}">${escapeHtml(videoDateLabel(item))}</time></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(core.excerpt(item.description, 220))}</p>
        <div class="video-card-tags">
          <span>${escapeHtml(videoLanguageLabel(item.language))}</span><span>${escapeHtml(classificationLabel(item.topic))}</span><span>${escapeHtml(classificationLabel(item.region))}</span>
        </div>
        <div class="video-accessibility-meta">
          ${item.subtitlesAvailable ? `<span>CC · ${escapeHtml(t('videoSubtitles'))}</span>` : ''}
          ${item.transcriptUrl ? `<a href="${escapeHtml(item.transcriptUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('videoTranscript'))}</a>` : ''}
          ${viewed ? `<span>✓ ${escapeHtml(t('videoViewed'))}</span>` : ''}
        </div>
        <div class="video-card-actions">
          <button type="button" class="primary-button" data-action="video-play" data-video-id="${escapeHtml(item.canonicalId)}">▶ ${escapeHtml(t('videoPlay'))}</button>
          <button type="button" class="secondary-button" data-action="video-watch-later" data-video-id="${escapeHtml(item.canonicalId)}" aria-pressed="${saved}">${saved ? '✓' : '+'} ${escapeHtml(t(saved ? 'videoRemoveLater' : 'videoSaveLater'))}</button>
          <a href="${escapeHtml(item.originalUrl)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(t('videoOriginal'))}</a>
        </div>
        ${videoPlayerMarkup(item)}
      </div>
    </article>`;
  }

  function mediaDescription(value) {
    const clean = core.text(value);
    const firstSentence = clean.match(/^(.{20,260}?[.!?])(?:\s|$)/)?.[1];
    return firstSentence || core.excerpt(clean, 220);
  }

  function podcastLibraryControls(source, kind) {
    const curatedLanguages = new Set(['ar', 'de', 'el', 'en', 'es', 'fr', 'it', 'pt', 'tr']);
    const kindItems = (source || []).filter(item => curatedLanguages.has(core.text(item.language).toLocaleLowerCase()) && (kind === 'free-radio'
      ? ['free-radio', 'aggregator'].includes(item.sourceKind)
      : !['free-radio', 'aggregator'].includes(item.sourceKind)));
    const languages = [...new Set(kindItems.map(item => item.language).filter(Boolean))]
      .sort((a, b) => languageLabel(a).localeCompare(languageLabel(b), state.language));
    const selectedLanguages = new Set(state.media.languages || []);
    const languageFiltered = selectedLanguages.size
      ? kindItems.filter(item => selectedLanguages.has(item.language))
      : kindItems;
    const sources = [...new Map(languageFiltered.map(item => [item.sourceId || item.source, item.source])).entries()]
      .sort((a, b) => a[1].localeCompare(b[1], state.language));
    return `<section class="podcast-library-controls" aria-label="${escapeHtml(t('podcastLanguages'))}">
      <div class="podcast-library-summary"><strong>${escapeHtml(kind === 'free-radio' ? t('radioShows') : t('podcastSeries'))}</strong><span>${escapeHtml(kind === 'free-radio' ? t('radioQuota') : t('independentQuota'))}</span></div>
      <div class="podcast-language-filter" role="group" aria-label="${escapeHtml(t('podcastLanguages'))}">
        <button type="button" class="filter-chip${selectedLanguages.size ? '' : ' active'}" data-action="media-language-all" aria-pressed="${!selectedLanguages.size}">${escapeHtml(t('allLanguages'))}</button>
        ${languages.map(language => `<button type="button" class="filter-chip${selectedLanguages.has(language) ? ' active' : ''}" data-action="media-language" data-value="${escapeHtml(language)}" aria-pressed="${selectedLanguages.has(language)}">${escapeHtml(languageLabel(language))}</button>`).join('')}
      </div>
      <label class="podcast-source-filter"><span>${escapeHtml(t('podcastSource'))}</span><select id="next-media-source">
        <option value="all">${escapeHtml(t('allPodcastSources'))}</option>
        ${sources.map(([id, name]) => `<option value="${escapeHtml(id)}"${state.media.source === id ? ' selected' : ''}>${escapeHtml(name)}</option>`).join('')}
      </select></label>
    </section>`;
  }

  function renderPodcastSection(source, generated, kind) {
    const filterState = generated
      ? { ...state.media, languages: [], source: 'all' }
      : state.media;
    const curatedLanguages = new Set(['ar', 'de', 'el', 'en', 'es', 'fr', 'it', 'pt', 'tr']);
    let filtered = media.filterItems(
      (source || []).filter(item => generated || (
        curatedLanguages.has(core.text(item.language).toLocaleLowerCase())
        && media.isRelevantPodcast(item)
      )),
      filterState
    );
    if (state.media.favoritesOnly) {
      filtered = filtered.filter(item => window.WRNAudioTools?.isFavorite?.(item.id));
    }
    filtered = window.WRNAudioTools?.favoriteFirst?.(filtered) || filtered;
    filtered = generated
      ? filtered.slice(0, 60)
      : media.podcastQuota(filtered, {
          kind,
          languages: state.media.languages,
          radioLimit: 50,
          perLanguage: 30
        });
    return `
      ${mediaFilters({ categories: true })}
      ${generated ? '' : podcastLibraryControls(source, kind)}
      ${generated ? `<div class="notice-card"><strong>30 Tage</strong><p>${escapeHtml(t('generatedNotice'))}</p></div>
        ${state.podcastService === 'available' ? '' : `<div class="notice-card${state.podcastService === 'unavailable' ? ' release-danger' : ''}" role="status"><strong>${escapeHtml(t(state.podcastService === 'unavailable' ? 'cloudVoiceUnavailable' : 'checking'))}</strong><p>${escapeHtml(t(state.podcastService === 'unavailable' ? 'generatedUnavailable' : 'generatedChecking'))}</p>${state.podcastService === 'unavailable' ? `<button type="button" class="secondary-button" data-action="podcast-service-retry">${escapeHtml(t('retry'))}</button>` : ''}</div>`}` : ''}
      <div class="section-heading"><h2>${escapeHtml(generated ? t('generated') : kind === 'free-radio' ? t('radioShows') : t('podcastSeries'))}</h2><small>${filtered.length} ${escapeHtml(t('episodes'))}</small></div>
      ${filtered.length ? `<div class="media-results">${filtered.map(podcast => `
        <article class="media-result-card podcast-card">
          ${podcast.artwork ? `<img src="${escapeHtml(podcast.artwork)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<div class="media-result-card__icon" aria-hidden="true">◉</div>`}
          <div>
            <div class="meta-line">
              <span>${escapeHtml(podcast.source)}</span>
              <span>${escapeHtml(podcast.language.toUpperCase())}${podcast.region ? ` · ${escapeHtml(classificationLabel(podcast.region))}` : ''}</span>
              ${generated ? `<span>${escapeHtml(podcast.mode === 'full' ? t('fullPodcast') : t('shortPodcast'))}${podcast.voiceLabel ? ` · ${escapeHtml(podcast.voiceLabel)}` : ''}</span>` : ''}
            </div>
            <h3>${escapeHtml(podcast.title)}</h3>
            <p>${escapeHtml(mediaDescription(podcast.description))}</p>
            ${podcast.audioUrl && (!generated || state.podcastService === 'available') ? `<div class="media-play-host" data-audio-control
              data-audio-card-mode="podcast"
              data-audio-id="${escapeHtml(podcast.id)}"
              data-audio-kind="${generated ? 'generated' : 'original'}"
              data-audio-title="${escapeHtml(podcast.title)}"
              data-audio-artist="${escapeHtml(podcast.source)}"
              data-audio-url="${escapeHtml(podcast.audioUrl)}"
              data-audio-artwork="${escapeHtml(podcast.artwork)}"></div>` : generated ? `<p class="media-card-status error">${escapeHtml(t(state.podcastService === 'unavailable' ? 'generatedUnavailableShort' : 'generatedChecking'))}</p>` : ''}
            <div class="media-links">
              ${podcast.episodeUrl ? `<a href="${escapeHtml(podcast.episodeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('openEpisode'))}</a>` : ''}
            </div>
          </div>
        </article>`).join('')}</div>` : mediaEmpty(generated ? t('noGenerated') : t('noMedia'))}
    `;
  }

  function renderRadioSection() {
    let filtered = media.filterItems(state.radioStations, state.media);
    if (state.media.favoritesOnly) {
      filtered = filtered.filter(item => window.WRNAudioTools?.isFavorite?.(item.id));
    }
    filtered = window.WRNAudioTools?.favoriteFirst?.(filtered) || filtered;
    return `
      ${mediaFilters()}
      <div class="section-heading"><h2>${escapeHtml(t('radio'))}</h2><small>${filtered.length} ${escapeHtml(t('stations'))}</small></div>
      ${filtered.length ? `<div class="media-results">${filtered.map(station => `
        <article class="media-result-card radio-card">
          <div class="media-result-card__icon" aria-hidden="true">⌁</div>
          <div>
            <div class="meta-line"><span>${escapeHtml(t('station'))}</span><span>${escapeHtml([station.city, station.country].filter(Boolean).join(', '))}</span></div>
            <h3>${escapeHtml(station.name)}</h3>
            <p>${escapeHtml(station.description)}</p>
            ${station.streamUrl
              ? `<div class="media-play-host" data-audio-control
                  data-audio-id="${escapeHtml(station.id)}"
                  data-audio-kind="radio"
                  data-audio-title="${escapeHtml(station.name)}"
                  data-audio-artist="${escapeHtml([station.city, station.country].filter(Boolean).join(', '))}"
                  data-audio-url="${escapeHtml(station.streamUrl)}"
                  data-audio-candidates="${escapeHtml(station.streams.join('|'))}"></div>`
              : `<p class="stream-fallback">${escapeHtml(t('streamFallback'))}</p>`}
            <div class="media-links">${station.website ? `<a href="${escapeHtml(station.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('openEpisode'))}</a>` : ''}</div>
          </div>
        </article>`).join('')}</div>` : mediaEmpty(t('noMedia'))}
    `;
  }

  function installMediaControls(root = viewRoot) {
    root.querySelectorAll('[data-audio-control]').forEach((host, index) => {
      if (host.dataset.audioInstalled === 'true' || !host.dataset.audioUrl) return;
      host.dataset.audioInstalled = 'true';
      const id = host.dataset.audioId || `preview-audio-${index}`;
      const compactPodcastCard = host.dataset.audioCardMode === 'podcast';
      const config = {
        id,
        kind: host.dataset.audioKind || 'original',
        title: host.dataset.audioTitle || 'Audio',
        artist: host.dataset.audioArtist || '',
        candidates: (host.dataset.audioCandidates || host.dataset.audioUrl)
          .split('|')
          .map(value => value.trim())
          .filter(Boolean),
        artwork: host.dataset.audioArtwork || '',
        statusId: `next-audio-status-${id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100)}`,
        showPause: !compactPodcastCard,
        showStop: !compactPodcastCard,
        showProgress: host.dataset.audioKind !== 'radio' && !compactPodcastCard
      };
      window.appendSimpleMediaControls?.(host, config);
      window.WRNAudioTools?.appendCardActions?.(host, config, {
        queue: config.kind !== 'radio' && !compactPodcastCard
      });
    });
    if (document.getElementById('audio-queue-panel')) {
      window.WRNAudioTools?.renderQueue?.();
    }
    const clear = document.getElementById('audio-queue-clear');
    if (clear) clear.onclick = () => window.WRNAudioTools?.clearQueue?.();
  }

  function mediaEmpty(message) {
    return `<div class="empty-state compact"><strong>${escapeHtml(message)}</strong></div>`;
  }

  const ZINE_STENCILS = Object.freeze([
    { id:'red-shepherd-solidarity', name:'zineStencilSolidarity', description:'zineStencilSolidarityText', sourceName:'Red Shepherd', sourcePage:'https://red-shepherd.de/diy/stencil-vorlagen-schablonen/#1.0', previewUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/solid-e1588587047793.jpg', downloadUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/solid-e1588587047793.jpg', format:'JPG', orientation:'landscape' },
    { id:'red-shepherd-refugees', name:'zineStencilRefugees', description:'zineStencilRefugeesText', sourceName:'Red Shepherd', sourcePage:'https://red-shepherd.de/diy/stencil-vorlagen-schablonen/#1.0', previewUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/refugees_welcome.jpg', downloadUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/refugees_welcome.jpg', format:'JPG' },
    { id:'red-shepherd-no-one-illegal', name:'zineStencilNoOneIllegal', description:'zineStencilNoOneIllegalText', sourceName:'Red Shepherd', sourcePage:'https://red-shepherd.de/diy/stencil-vorlagen-schablonen/#1.0', previewUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/nooneisillegal.jpg', downloadUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/nooneisillegal.jpg', format:'JPG' },
    { id:'red-shepherd-unite', name:'zineStencilUnite', description:'zineStencilUniteText', sourceName:'Red Shepherd', sourcePage:'https://red-shepherd.de/diy/stencil-vorlagen-schablonen/#1.0', previewUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/unite.jpg', downloadUrl:'https://red-shepherd.de/wp-content/uploads/2020/05/unite.jpg', format:'JPG' },
    { id:'red-shepherd-feminism', name:'zineStencilFeminism', description:'zineStencilFeminismText', sourceName:'Red Shepherd', sourcePage:'https://red-shepherd.de/diy/stencil-vorlagen-schablonen/#1.0', previewUrl:'https://red-shepherd.de/wp-content/uploads/2020/06/feminismus-stencil.jpg', downloadUrl:'https://red-shepherd.de/wp-content/uploads/2020/06/feminismus-stencil.jpg', format:'JPG' },
    { id:'red-shepherd-international-solidarity', name:'zineStencilInternationalSolidarity', description:'zineStencilInternationalSolidarityText', sourceName:'Red Shepherd', sourcePage:'https://red-shepherd.de/diy/stencil-vorlagen-schablonen/#1.0', previewUrl:'https://red-shepherd.de/wp-content/uploads/2020/10/internationale-solidaritaet.jpg', downloadUrl:'https://red-shepherd.de/wp-content/uploads/2020/10/internationale-solidaritaet.jpg', format:'JPG' },
    { id:'kreaktivismus-all-arms', name:'zineStencilAllArms', description:'zineStencilAllArmsText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/89.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/89.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/89.pdf', format:'SVG' },
    { id:'kreaktivismus-all-arms-group', name:'zineStencilAllArmsGroup', description:'zineStencilAllArmsGroupText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/243.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/243.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/243.pdf', format:'SVG' },
    { id:'kreaktivismus-stay-all', name:'zineStencilStayAll', description:'zineStencilStayAllText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/434.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/434.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/434.pdf', format:'SVG' },
    { id:'kreaktivismus-antifa-action', name:'zineStencilAntifaAction', description:'zineStencilAntifaActionText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/1.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/1.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/1.pdf', format:'SVG' },
    { id:'kreaktivismus-fight-racism', name:'zineStencilFightRacism', description:'zineStencilFightRacismText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/251.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/251.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/251.pdf', format:'SVG' },
    { id:'kreaktivismus-fight-white-pride', name:'zineStencilFightWhitePride', description:'zineStencilFightWhitePrideText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/9.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/9.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/9.pdf', format:'SVG' },
    { id:'kreaktivismus-fight-authority', name:'zineStencilFightAuthority', description:'zineStencilFightAuthorityText', sourceName:'Kreaktivismus', sourcePage:'https://kreaktivismus.org/downloadbereich/stencils/', previewUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/JPG/4.jpg', downloadUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/SVG/4.svg', pdfUrl:'https://kreaktivismus.org/wp-content/uploads/Downloadbereich/Stencil/PDF/4.pdf', format:'SVG', orientation:'landscape' },
    { id:'raised-fist', name:'zineStencilFist', description:'zineStencilFistText', art:'<rect x="178" y="369" width="118" height="208" rx="55"/><rect x="289" y="299" width="122" height="270" rx="58"/><rect x="404" y="315" width="122" height="254" rx="58"/><rect x="519" y="374" width="112" height="206" rx="52"/><path d="M222 548h414l-18 160-89 124-18 110H282l-19-126-61-122z"/><path d="M189 554c-39-17-83 14-82 57 1 20 10 38 27 51l180 139 76-91-135-105z"/><path d="m307 588 236 1-10 72-165 92-116-89z"/>' },
    { id:'megaphone', name:'zineStencilMegaphone', description:'zineStencilMegaphoneText', art:'<path d="M112 488h154l364-196v482L266 584H112z"/><path d="m220 575 120 1 75 266H283z"/><path d="M108 500H63v73h45z"/><path d="m657 355 86-74 31 42-88 70zm39 125h100v56H696zm-39 183 29-39 88 70-31 42z"/><path d="M309 653c-59 0-111 35-137 85l48 35c22-32 48-48 89-48z"/>' },
    { id:'peace-dove', name:'zineStencilDove', description:'zineStencilDoveText', art:'<path d="M95 611c130-27 214-94 275-200 52-90 119-164 235-201-27 83-75 146-135 194 106-35 190-22 266 25-96 27-169 78-232 147 82 10 148 44 199 102-83 6-159-12-225-54-69 87-161 157-300 184 45-49 72-99 80-151-52 2-106-12-163-46z"/><path d="m574 648 39-18 25 54 55-18 16 49-54 18 26 57-42 19-26-57-58 20-16-50 57-19z"/>' },
    { id:'broken-chain', name:'zineStencilChain', description:'zineStencilChainText', art:'<path d="M173 384c-83 83-83 218 0 301l54 54c83 83 218 83 301 0l38-38-69-69-38 38c-45 45-118 45-163 0l-54-54c-45-45-45-118 0-163l41-41-69-69z"/><path d="m586 343-69 69 41 41c45 45 45 118 0 163l-42 42 69 69 42-42c83-83 83-218 0-301z"/><path d="m359 421 25-151 58 10-26 151zm86 25 111-106 41 43-111 106zm-145 14-112-101 39-44 113 101z"/><path d="m347 536 49-49 48 48-49 49z"/>' },
    { id:'resistance-flower', name:'zineStencilFlower', description:'zineStencilFlowerText', art:'<path d="M374 474h54v393h-54z"/><path d="M394 640c-116 13-187 79-199 190 119-2 184-63 199-190zm35 74c105 13 167 69 182 168-108 3-166-50-182-168z"/><circle cx="401" cy="397" r="67"/><ellipse cx="401" cy="260" rx="49" ry="101"/><ellipse cx="270" cy="371" rx="49" ry="101" transform="rotate(-72 270 371)"/><ellipse cx="319" cy="505" rx="49" ry="101" transform="rotate(-144 319 505)"/><ellipse cx="483" cy="505" rx="49" ry="101" transform="rotate(144 483 505)"/><ellipse cx="532" cy="371" rx="49" ry="101" transform="rotate(72 532 371)"/><path d="m105 895 139-59 99 38 58-28 59 28 99-38 139 59-32 70H137z"/><path d="m104 826 116-58 17 39-115 58zm577 39-116-58 17-39 116 58z"/>' },
    { id:'no-surveillance', name:'zineStencilSurveillance', description:'zineStencilSurveillanceText', art:'<path d="M400 165c-106 0-201 45-268 117l58 53c53-57 127-92 210-92 54 0 104 15 147 40l39-68c-55-32-119-50-186-50zm230 92-51 59c66 54 108 136 108 228 0 55-15 106-41 150l68 39c33-56 51-121 51-189 0-116-52-220-135-287zM112 346c-49 58-77 132-77 198 0 205 164 372 365 372 103 0 196-43 263-112l-57-54c-53 54-126 88-206 88-158 0-287-132-287-294 0-49 12-95 33-135z"/><path d="m217 393 319 39 81 194-307-38z"/><path d="m536 432 115-50 33 79-104 94z"/><path d="M277 582h92v160h-92z"/><path d="m155 789 511-523 56 55-511 523z"/>' },
    { id:'mutual-aid', name:'zineStencilMutualAid', description:'zineStencilMutualAidText', art:'<path d="M88 718 277 535l85 45-183 244z"/><path d="m712 718-189-183-85 45 183 244z"/><path d="M258 506c33-43 77-72 132-83l113 64-70 80-76-43-54 70-77-38z"/><path d="M542 506c-33-43-77-72-132-83l-113 64 70 80 76-43 54 70 77-38z"/><path d="m315 622 54-57 63 60-54 57zm79 45 54-57 63 60-54 57z"/><path d="M163 832h189v76H163zm285 0h189v76H448z"/>' },
    { id:'broken-circle-a', name:'zineStencilAnarchy', description:'zineStencilAnarchyText', art:'<path d="M400 154c-118 0-222 56-290 143l63 49c54-69 136-113 227-113 64 0 123 22 172 58l47-65c-62-45-138-72-219-72zm260 114-60 53c49 55 79 129 79 210 0 67-20 129-55 180l66 46c45-65 71-143 71-226 0-101-38-193-101-263zM105 342c-42 59-66 131-66 189 0 208 162 377 361 377 98 0 187-41 252-107l-57-56c-51 52-120 84-195 84-155 0-280-134-280-298 0-49 11-96 32-137z"/><path d="m361 286-170 463h91l57-160h122l58 160h91L439 286z"/><path d="M176 520h448v72H176z"/>' },
    { id:'open-book-flame', name:'zineStencilKnowledge', description:'zineStencilKnowledgeText', art:'<path d="M102 529c107-36 199-25 276 34v294c-77-59-169-70-276-34z"/><path d="M698 529c-107-36-199-25-276 34v294c77-59 169-70 276-34z"/><path d="M378 581h44v303h-44z"/><path d="M399 190c81 87 105 150 72 213-15 29-36 49-65 65 11-55-1-93-37-126-1 52-25 88-69 119-14-35-18-70-10-104 13-59 55-109 109-167z"/><path d="m245 625 104 21v48l-104-22zm0 95 104 22v48l-104-22zm310-95-104 21v48l104-22zm0 95-104 22v48l104-22z"/>' },
    { id:'housing-for-all', name:'zineStencilHousing', description:'zineStencilHousingText', art:'<path d="m62 566 143-145 143 145v286H62z"/><path d="m249 566 151-181 151 181v286H249z"/><path d="m452 566 143-145 143 145v286H452z"/><path d="m35 548 170-173 170 173-47 46-123-124L81 594zm177-3 188-226 188 226-49 42-139-167-139 167zm213 3 170-173 170 173-46 46-124-124-123 124z"/><path d="M99 704h82v148H99zm269-159h64v307h-64zm251 159h82v148h-82z"/>' },
    { id:'earth-leaf', name:'zineStencilEarth', description:'zineStencilEarthText', art:'<path d="M395 177c-113 0-214 55-279 140l64 48c50-66 128-109 215-109 52 0 101 15 143 41l42-67c-55-34-118-53-185-53zm230 94-58 54c51 55 82 130 82 213 0 66-20 128-54 179l66 45c43-64 68-141 68-224 0-104-40-198-104-267zM81 374c-27 51-42 108-42 164 0 199 159 361 356 361 85 0 164-30 226-81l-50-61c-48 40-109 63-176 63-153 0-277-126-277-282 0-42 9-82 25-118z"/><path d="m285 328 90-32 80 48 48 82-80 60-104-22-65-70z"/><path d="m445 555 111-42 55 63-47 83-95 38-79-55z"/><path d="M146 723c102-23 180 1 233 84-106 25-184 1-233-84zm504-22c-104-13-180 19-225 106 107 15 183-16 225-106z"/>' },
    { id:'broken-missile-flower', name:'zineStencilAntiwar', description:'zineStencilAntiwarText', art:'<path d="m159 802 178-237 87 65-178 237z"/><path d="m459 520 166-221 86 65-166 221z"/><path d="m630 297 94-55-9 109z"/><path d="m202 739-99 9 49 92zm106 80-10 100 92-49z"/><path d="m390 572 35-119 49 15-35 119zm80-33 88-87 36 37-89 87zm-144-10-91-84 35-38 91 84z"/><circle cx="420" cy="384" r="54"/><ellipse cx="420" cy="282" rx="37" ry="75"/><ellipse cx="325" cy="365" rx="37" ry="75" transform="rotate(-72 325 365)"/><ellipse cx="361" cy="472" rx="37" ry="75" transform="rotate(-144 361 472)"/><ellipse cx="479" cy="472" rx="37" ry="75" transform="rotate(144 479 472)"/><ellipse cx="515" cy="365" rx="37" ry="75" transform="rotate(72 515 365)"/>' }
  ]);

  function zineStencil(id = state.media.stencilId) {
    return ZINE_STENCILS.find(item => item.id === id) || ZINE_STENCILS[0];
  }

  function stencilSvgMarkup(stencil, attributes = '') {
    return `<svg ${attributes} viewBox="0 0 800 1100" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="1100" fill="#fff"/><g fill="#000">${stencil.art}</g></svg>`;
  }

  function stencilVisualMarkup(stencil, attributes = '') {
    if (stencil.previewUrl) {
      return `<img ${attributes} src="${escapeHtml(stencil.previewUrl)}" alt="${escapeHtml(t(stencil.name))}" loading="lazy" decoding="async">`;
    }
    return stencilSvgMarkup(stencil, attributes);
  }

  function stencilDownloadSvg(stencil) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${stencilSvgMarkup(stencil, 'width="210mm" height="297mm" role="img"')}\n`;
  }

  function zineIssueMarkup(items, editable = false) {
    return `<section class="wrn-zine" id="zine-container" data-wrn-zine aria-label="${escapeHtml(t('zine'))}">
      <div class="section-heading"><h2>${escapeHtml(t('zine'))}</h2><small>${items.length}</small></div>
      ${items.length ? `<div class="zine-content">${items.map((article, index) => {
        const type = article.zineType || 'article';
        const image = safeZineImage(article.image || article.imageUrl);
        const body = core.articleContentParagraphs(article.description || article.content || article.intro || '')
          .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
        const key = zineArticleKey(article);
        return `<article class="zine-workspace-item">
          <div class="zine-workspace-copy">
            <span class="eyebrow">${escapeHtml(article.source || article.quelleName || (type === 'image' ? t('zineImageType') : t('zineTextType')))}</span>
            ${article.title ? `<h3>${escapeHtml(article.title)}</h3>` : ''}
            ${image ? `<img class="zine-workspace-image" src="${escapeHtml(image)}" alt="">` : ''}
            ${type === 'image' ? '' : `<div class="zine-item-body">${body}</div>`}
          </div>
          ${editable ? `<div class="zine-item-actions">
            <div class="zine-item-action-group">
              <button type="button" data-action="zine-move" data-value="-1" data-zine-key="${escapeHtml(key)}" aria-label="${escapeHtml(t('zineMoveUp'))}"${index === 0 ? ' disabled' : ''}>↑</button>
              <button type="button" data-action="zine-move" data-value="1" data-zine-key="${escapeHtml(key)}" aria-label="${escapeHtml(t('zineMoveDown'))}"${index === items.length - 1 ? ' disabled' : ''}>↓</button>
            </div>
            <div class="zine-item-action-group">
              <button type="button" data-action="zine-edit" data-zine-key="${escapeHtml(key)}">${escapeHtml(t('zineEdit'))}</button>
              <button type="button" data-action="zine-remove" data-zine-key="${escapeHtml(key)}">${escapeHtml(t('zineRemove'))}</button>
            </div>
          </div>` : ''}
        </article>`;
      }).join('')}</div>` : mediaEmpty(t('zineEmpty'))}
    </section>`;
  }

  function renderZineStencils() {
    const selected = zineStencil();
    return `<section class="zine-stencil-library" aria-labelledby="zine-stencil-title">
      <div class="section-heading"><div><span class="eyebrow">${escapeHtml(t('zineTemplatesTab'))}</span><h2 id="zine-stencil-title">${escapeHtml(t('zineTemplatesTitle'))}</h2></div></div>
      <p>${escapeHtml(t('zineTemplatesIntro'))}</p>
      <div class="zine-stencil-grid">${ZINE_STENCILS.map(stencil => {
        const active = stencil.id === selected.id;
        return `<article class="zine-stencil-card${active ? ' is-selected' : ''}">
          <div class="zine-stencil-thumb">${stencilVisualMarkup(stencil)}</div>
          <div><span class="zine-stencil-safe">${escapeHtml(t(stencil.sourceName ? 'zineStencilExternal' : 'zineStencilCutSafe'))}</span><h3>${escapeHtml(t(stencil.name))}</h3><p>${escapeHtml(t(stencil.description))}</p>${stencil.sourceName ? `<a class="zine-stencil-source" href="${escapeHtml(stencil.sourcePage)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('zineStencilSource'))}: ${escapeHtml(stencil.sourceName)}</a>` : ''}</div>
          <button type="button" class="${active ? 'secondary-button' : 'primary-button'}" data-action="zine-stencil-select" data-value="${escapeHtml(stencil.id)}" aria-pressed="${active}">${active ? `✓ ${escapeHtml(t('zineStencilSelected'))}` : escapeHtml(t('zineStencilUse'))}</button>
        </article>`;
      }).join('')}</div>
    </section>
    <section class="zine-stencil-preview" aria-labelledby="zine-stencil-preview-title">
      <div><span class="eyebrow">${escapeHtml(t('zineStencilPreview'))}</span><h2 id="zine-stencil-preview-title">${escapeHtml(t(selected.name))}</h2><p>${escapeHtml(t(selected.sourceName ? 'zineStencilExternalHint' : 'zineStencilHint'))}</p>${selected.sourceName ? `<p class="zine-stencil-credit">${escapeHtml(t('zineStencilSource'))}: <a href="${escapeHtml(selected.sourcePage)}" target="_blank" rel="noopener noreferrer">${escapeHtml(selected.sourceName)}</a></p>` : ''}</div>
      <div class="zine-stencil-sheet" data-stencil-print-target>${stencilVisualMarkup(selected, `role="img" aria-label="${escapeHtml(t(selected.name))}"`)}</div>
      <div class="zine-stencil-actions">
        ${selected.downloadUrl ? `<a class="secondary-button" href="${escapeHtml(selected.downloadUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('zineStencilOriginal'))} · ${escapeHtml(selected.format || '')}</a>${selected.pdfUrl ? `<a class="secondary-button" href="${escapeHtml(selected.pdfUrl)}" target="_blank" rel="noopener noreferrer">PDF</a>` : ''}` : `<button type="button" class="secondary-button" data-action="zine-stencil-download">${escapeHtml(t('zineStencilDownload'))}</button>`}
        <button type="button" class="primary-button" data-action="zine-stencil-print">${escapeHtml(t('zineStencilPrint'))}</button>
      </div>
    </section>`;
  }

  function renderZineSection() {
    const items = zineArticles();
    const panel = state.media.zinePanel === 'stencils' ? 'stencils' : 'content';
    return `<p class="zine-workspace-intro">${escapeHtml(t('zineIntro'))}</p>
      <div class="zine-subtabs" role="tablist" aria-label="${escapeHtml(t('zine'))}">
        <button type="button" role="tab" aria-selected="${panel === 'content'}" class="${panel === 'content' ? 'active' : ''}" data-action="zine-panel" data-value="content">${escapeHtml(t('zineContentTab'))}</button>
        <button type="button" role="tab" aria-selected="${panel === 'stencils'}" class="${panel === 'stencils' ? 'active' : ''}" data-action="zine-panel" data-value="stencils">${escapeHtml(t('zineTemplatesTab'))}</button>
      </div>
      ${panel === 'stencils' ? renderZineStencils() : `<section class="zine-compose-panel" aria-label="${escapeHtml(t('zineEditorTitle'))}">
        <div class="zine-compose-panel__copy"><strong>${escapeHtml(t('zineEditorTitle'))}</strong><small>${items.length} ${escapeHtml(t('zineArticleType'))}</small></div>
        <div class="zine-toolbar">
          <div class="zine-tool-group zine-tool-group--add">
            <button class="secondary-button" type="button" data-action="zine-add-text"><span aria-hidden="true">T＋</span>${escapeHtml(t('zineAddText'))}</button>
            <button class="secondary-button" type="button" data-action="zine-add-image"><span aria-hidden="true">▧＋</span>${escapeHtml(t('zineAddImage'))}</button>
          </div>
          <div class="zine-tool-group zine-tool-group--manage">
            <button class="secondary-button zine-clear-button" type="button" data-action="zine-clear"${items.length ? '' : ' disabled'}>${escapeHtml(t('zineClear'))}</button>
          </div>
        </div>
      </section>${zineIssueMarkup(items, true)}`}`;
  }

  function renderSaved() {
    state.cardArticles = [];
    const saved = state.savedMode === 'read'
      ? state.articles.filter(article => isRead(article))
      : core.normalizeArticles(state.savedArticles.length ? state.savedArticles : bookmarks());
    viewRoot.innerHTML = `
      ${headingMarkup(t('saved'), t('saved'), t('savedIntro'))}
      <div class="saved-tabs" role="tablist">
        <button type="button" role="tab" class="${state.savedMode === 'bookmarks' ? 'active' : ''}" data-action="saved-mode" data-value="bookmarks" aria-selected="${state.savedMode === 'bookmarks'}">☆ ${escapeHtml(t('bookmarks'))} (${bookmarks().length})</button>
        <button type="button" role="tab" class="${state.savedMode === 'read' ? 'active' : ''}" data-action="saved-mode" data-value="read" aria-selected="${state.savedMode === 'read'}">✓ ${escapeHtml(t('readArticles'))} (${readArticles().length})</button>
      </div>
      ${saved.length
        ? cardsMarkup(saved)
        : `<div class="empty-state"><strong>${escapeHtml(t('emptySaved'))}</strong><p>${escapeHtml(t('emptySavedText'))}</p></div>`}
    `;
  }

  function renderError() {
    const fileMode = window.location.protocol === 'file:';
    const localPreviewUrl = 'http://127.0.0.1:8765/next.html?preview=8';
    viewRoot.innerHTML = `
      <div class="empty-state">
        <strong>${escapeHtml(t(fileMode ? 'fileModeTitle' : 'loadError'))}</strong>
        ${fileMode
          ? `<p>${escapeHtml(t('fileModeText'))}</p>
            <a class="primary-button file-preview-link" href="${localPreviewUrl}">${escapeHtml(t('openLocalPreview'))}</a>
            <small>${localPreviewUrl}</small>`
          : `<button class="primary-button" type="button" data-action="retry">${escapeHtml(t('retry'))}</button>`}
      </div>`;
  }

  function render() {
    loading.hidden = true;
    const discoverViews = new Set(['discover', 'events', 'lexicon', 'library', 'prisoners', 'help', 'developments']);
    document.querySelectorAll('[data-view-target]').forEach(button => {
      const active = button.dataset.viewTarget === state.view
        || (button.dataset.viewTarget === 'discover' && discoverViews.has(state.view));
      button.classList.toggle('active', active);
      if (button.closest('.bottom-nav')) {
        if (active) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      }
    });

    if (state.view === 'following') renderFollowing();
    else if (state.view === 'discover') renderDiscover();
    else if (state.view === 'events') renderEvents();
    else if (state.view === 'lexicon') renderLexicon();
    else if (state.view === 'library') renderLibrary();
    else if (state.view === 'prisoners') renderPrisoners();
    else if (state.view === 'help') renderHelp();
    else if (state.view === 'developments') renderDevelopments();
    else if (state.view === 'media') renderMedia();
    else if (state.view === 'saved') renderSaved();
    else renderHome();
    applyLanguage();
    if (viewAnnouncer) {
      const heading = viewRoot.querySelector('h1, h2')?.textContent?.trim() || t('home');
      viewAnnouncer.textContent = '';
      window.requestAnimationFrame(() => { viewAnnouncer.textContent = heading; });
    }
  }

  async function translateTeaser(article, button, card) {
    if (!window.WRNSharedTranslations?.request || !article) {
      showToast(t('translationFailed'));
      return;
    }
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const label = button.querySelector('span:last-child');
    if (label) label.textContent = t('translating');

    try {
      const result = await window.WRNSharedTranslations.request({
        title: article.title,
        text: newsCardTeaser(article),
        mode: 'title_and_text'
      });
      if (result?.error || !result?.text) throw new Error(result?.message || 'Translation failed');
      const parsed = core.splitTranslatedTeaser(result.text);
      storeTranslation(article, {
        title: parsed.title || article.title,
        intro: parsed.intro
      });
      const storedTranslation = translationFor(article);
      const translatedIntro = newsCardTeaser(article, storedTranslation);
      if (card) {
        const title = card.querySelector('h3');
        if (title) title.textContent = storedTranslation?.title || article.title;
        cardCopy.syncTeaserParagraph(card.querySelector('.news-card__open'), 'p', '.card-actions', translatedIntro);
        let note = card.querySelector('.translation-note');
        if (!note) {
          note = document.createElement('small');
          note.className = 'translation-note';
          card.querySelector('.card-actions')?.before(note);
        }
        note.textContent = translationNoteLabel(article, storedTranslation);
      } else {
        const hero = document.querySelector('.home-hero');
        const title = hero?.querySelector('h1');
        if (title) title.textContent = storedTranslation?.title || article.title;
        cardCopy.syncTeaserParagraph(hero?.querySelector('.home-hero__content'), ':scope > p', '.card-actions', translatedIntro);
        if (hero) {
          let note = hero.querySelector('.translation-note');
          if (!note) {
            note = document.createElement('small');
            note.className = 'translation-note';
            hero.querySelector('.card-actions')?.before(note);
          }
          note.textContent = translationNoteLabel(article, storedTranslation);
        }
      }
      showToast(t('translatedTitle'));
    } catch (error) {
      console.warn('Teaser translation failed', error);
      showToast(t('translationFailed'));
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if (label) label.textContent = t('translate');
    }
  }

  function mergeHydratedArticle(article, detail, detailMeta = {}) {
    if (!article || !detail) return false;
    const existingImages = Array.isArray(article.images) ? article.images : [];
    const detailImages = Array.isArray(detail.images) ? detail.images : [];
    const mergedImages = [...new Set([...existingImages, ...detailImages])];
    const content = detail.content.length >= article.content.length
      ? detail.content
      : article.content;
    const expectedLength = Math.max(
      article.content.length,
      Number(article.webFeedOriginalLength) || 0
    );
    const archiveRecoveredTruncation = Boolean(
      article.webFeedTruncated
      && expectedLength > 0
      && content.length >= Math.floor(expectedLength * 0.98)
    );
    const contentComplete = detail.contentComplete !== false || archiveRecoveredTruncation;
    const contentMode = core.articleContentMode({
      ...detail,
      content,
      contentComplete,
      webFeedTruncated: false
    }, content);
    Object.assign(article, detail, detailMeta, {
      content,
      intro: core.excerpt(content, 230),
      image: detail.image || article.image,
      images: mergedImages,
      contentComplete,
      contentMode,
      webFeedTruncated: false,
      detailHydrated: true,
      detailLoading: false,
      detailFailed: false
    });
    return article.contentMode === 'full';
  }

  async function loadArticleArchive() {
    if (articleArchivePromise) return articleArchivePromise;
    articleArchivePromise = (async () => {
      const dataUrls = window.WRN_CONFIG?.dataUrls || {};
      const dataMirrors = window.WRN_CONFIG?.dataMirrors || {};
      try {
        const payload = await fetchFirstJson([
          dataMirrors.news,
          dataUrls.news,
          'news.json'
        ], {
          cacheKey: 'wrn_archive',
          cacheToken: state.dataStatus.revision || Date.now(),
          timeoutMs: 45000
        });
        if (!Array.isArray(payload)) throw new Error('Invalid article archive');
        void window.WRNStorage?.putDataset?.('news-app-2-article-archive', payload);
        return core.normalizeArticles(payload);
      } catch (error) {
        const cached = await window.WRNStorage?.getDataset?.('news-app-2-article-archive');
        const articles = core.normalizeArticles(cached);
        if (articles.length) return articles;
        articleArchivePromise = null;
        throw error;
      }
    })();
    return articleArchivePromise;
  }

  async function hydrateArticleFromArchive(article) {
    const archive = await loadArticleArchive();
    const detail = archive.find(candidate => (
      candidate.id === article.id
      || (candidate.link && candidate.link === article.link)
    ));
    if (!detail) throw new Error('Article missing from full archive');
    return mergeHydratedArticle(article, detail, { detailSource: 'archive' });
  }

  async function hydrateArticleDetail(article) {
    if (
      !article
      || article.detailHydrated
      || article.detailLoading
      || article.detailFailed
    ) return false;
    article.detailLoading = true;
    try {
      if (!article.detailUrl) return await hydrateArticleFromArchive(article);
      const cacheKey = `${article.detailUrl}|${state.dataStatus.revision || ''}`;
      let payload = articleDetailChunkCache.get(cacheKey);
      if (!payload) {
        payload = await fetchJson(article.detailUrl, {
          cacheKey: 'wrn_detail',
          cacheToken: state.dataStatus.revision || Date.now(),
          timeoutMs: 20000
        });
        if (!Array.isArray(payload)) throw new Error('Invalid article detail chunk');
        articleDetailChunkCache.set(cacheKey, payload);
      }
      const details = core.normalizeArticles(payload);
      const detail = details.find(candidate => (
        candidate.id === article.id
        || (candidate.link && candidate.link === article.link)
      ));
      if (!detail) throw new Error('Article missing from detail chunk');
      const detailUrl = article.detailUrl;
      const detailPath = article.detailPath;
      return mergeHydratedArticle(article, detail, { detailUrl, detailPath, detailSource: 'chunk' });
    } catch (error) {
      try {
        return await hydrateArticleFromArchive(article);
      } catch (archiveError) {
        article.detailLoading = false;
        article.detailFailed = true;
        console.warn('Article full text unavailable; feed excerpt remains visible', error, archiveError);
        return false;
      }
    }
  }

  function renderArticleLoadState(article) {
    state.activeArticle = article;
    document.getElementById('next-article-source').textContent =
      `${article.source} · ${dateLabel(article)}`;
    document.getElementById('next-article-title').textContent = article.title;
    updateDialogSave();
    updateDialogZine();
    updateDialogRead();
    stopArticlePodcast();
    document.getElementById('next-article-content').innerHTML = `
      <section class="article-completeness-state" role="status" aria-live="polite">
        <span class="red-black-star loading-star article-loading-indicator" aria-hidden="true">★</span>
        <h1>${escapeHtml(t('loadingFullArticle'))}</h1>
      </section>`;
    openArticleDialogWithHistory();
  }

  function openArticle(article, options = {}) {
    state.activeArticle = article;
    const allowPartial = options.allowPartial === true;
    const contentMode = core.articleContentMode(article, article.content);
    article.contentMode = contentMode;
    const requiresCompleteArticle = (
      article.webFeedTruncated
      || article.contentComplete === false
      || contentMode !== 'full'
    );
    if (requiresCompleteArticle && !allowPartial) {
      if (article.detailHydrated || article.detailFailed) {
        openArticle(article, { allowPartial: true });
        return;
      }
      renderArticleLoadState(article);
      void hydrateArticleDetail(article).then(updated => {
        if (state.activeArticle !== article || !articleDialog.open) return;
        if (updated) openArticle(article);
        else openArticle(article, { allowPartial: true });
      });
      return;
    }
    const renderedContentMode = core.articleContentMode(article, article.content);
    const isMetadataOnly = allowPartial && renderedContentMode === 'metadata';
    const isPartial = allowPartial && renderedContentMode === 'excerpt';
    const translation = translationFor(article);
    const articleBodyText = translation?.fullContent ? translation.content : (article.content || article.intro);
    const articleBody = structuredArticleMarkup(article, Boolean(translation?.fullContent), articleBodyText);
    const continuationMarkup = isMetadataOnly
      ? `<aside class="article-continuation article-metadata-only" role="note" aria-label="${escapeHtml(t('fullArticleUnavailable'))}">
          <strong>${escapeHtml(t('fullArticleUnavailable'))}</strong>
          <p>${escapeHtml(t('fullArticleUnavailableText'))}</p>
          <div>
            ${article.link ? `<a class="primary-button" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">↗ ${escapeHtml(t('continueOriginal'))}</a>` : ''}
            <button type="button" class="secondary-button" data-action="article-detail-retry">${escapeHtml(t('retryFullArticle'))}</button>
          </div>
        </aside>`
      : isPartial
      ? `<aside class="article-continuation" role="note" aria-label="${escapeHtml(t('partialArticleLabel'))}">
          <strong>${escapeHtml(t('partialArticleLabel'))}</strong>
          <p>${escapeHtml(t('partialArticleText'))}</p>
          <div>
            ${article.link ? `<a class="primary-button" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">↗ ${escapeHtml(t('continueOriginal'))}</a>` : ''}
            <button type="button" class="secondary-button" data-action="article-detail-retry">${escapeHtml(t('retryFullArticle'))}</button>
          </div>
        </aside>`
      : '';
    const primaryImage = core.safeImageUrl(article.image);
    const articleImages = core.articleImageUrls(article.images, [primaryImage, ...articleBody.inlineImages]);
    const imageGallery = articleImages.length
      ? `<section class="article-image-gallery" aria-label="${escapeHtml(t('articleImages'))}">
          <h2>${escapeHtml(t('articleImages'))}</h2>
          <div>${articleImages.map((image, index) => `
            <a href="${escapeHtml(image)}" target="_blank" rel="noopener noreferrer">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(`${t('articleImages')} ${index + 1}`)}" loading="lazy" decoding="async" sizes="(max-width: 720px) calc(100vw - 42px), 440px" referrerpolicy="no-referrer">
            </a>`).join('')}</div>
        </section>`
      : '';
    const related = state.articles
      .filter(candidate => candidate.id !== article.id && candidate.source === article.source)
      .slice(0, 5);
    const relatedMarkup = related.length
      ? `<section class="publisher-related">
          <h2>${escapeHtml(t('moreNews'))} · ${escapeHtml(article.source)}</h2>
          <div>
            ${related.map(candidate => {
              const index = state.cardArticles.push(candidate) - 1;
              const candidateTranslation = translationFor(candidate);
              return `<button type="button" data-action="open" data-index="${index}">
                <strong>${escapeHtml(candidateTranslation?.title || candidate.title)}</strong>
                <small>${escapeHtml(dateLabel(candidate))}</small>
              </button>`;
            }).join('')}
          </div>
        </section>`
      : '';
    document.getElementById('next-article-source').textContent =
      `${article.source} · ${dateLabel(article)}`;
    document.getElementById('next-article-title').textContent =
      translation?.title || article.title;
    updateDialogSave();
    updateDialogZine();
    updateDialogRead();
    stopArticlePodcast();

    document.getElementById('next-article-content').innerHTML = `
      ${primaryImage ? `<a class="article-lead-image-link" href="${escapeHtml(primaryImage)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t('articleImages'))}"><img class="article-lead-image" src="${escapeHtml(primaryImage)}" alt="" decoding="async" fetchpriority="high" sizes="(max-width: 920px) calc(100vw - 42px), 880px" referrerpolicy="no-referrer"></a>` : ''}
      <h1>${escapeHtml(translation?.title || article.title)}</h1>
      <div class="article-reading-meter">
        <progress id="next-article-reading-progress" value="0" max="100" aria-label="${escapeHtml(t('readProgress'))}"></progress>
        <span id="next-article-reading-label">0 %</span>
      </div>
      <div class="meta-line">
        <span class="tag">${escapeHtml(classificationLabel(article.primaryRegion))}</span>
        ${article.primaryTopic ? `<span class="tag">${escapeHtml(classificationLabel(article.primaryTopic))}</span>` : ''}
      </div>
      ${article.link ? `<p class="article-source-link"><a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">↗ ${escapeHtml(t('original'))}</a></p>` : ''}
      ${translation ? `<p class="translation-note">${escapeHtml(translationNoteLabel(article, translation))}</p>` : ''}
      ${articleHistoryMarkup(article)}
      <section class="article-tool-panel" id="next-article-tool-panel" aria-live="polite" hidden></section>
      ${(translation?.intro || article.intro) ? `<p class="article-intro">${escapeHtml(translation?.intro || article.intro)}</p>` : ''}
      ${articleBody.count ? `<p class="article-lexicon-hint">A–Z · ${escapeHtml(t('inlineGlossaryHint'))}</p>` : ''}
      ${articleBody.html}
      ${continuationMarkup}
      ${imageGallery}
      ${contextualHelpMarkup(article.helpTopics)}
      ${relatedMarkup}
    `;
    openArticleDialogWithHistory();
    const articleContent = document.getElementById('next-article-content');
    const savedPosition = readingPosition(article);
    articleContent.scrollTop = 0;
    window.requestAnimationFrame(() => {
      if (savedPosition?.position) {
        articleContent.scrollTop = Math.min(
          savedPosition.position,
          Math.max(0, articleContent.scrollHeight - articleContent.clientHeight)
        );
      }
      updateArticleReadingMeter(
        savedPosition?.progress || (isRead(article) ? 1 : release.readingProgress(
          articleContent.scrollTop,
          articleContent.scrollHeight,
          articleContent.clientHeight
        ))
      );
    });
  }

  function updateDialogSave() {
    const button = document.getElementById('next-dialog-save');
    const saved = state.activeArticle ? isSaved(state.activeArticle) : false;
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', saved ? t('removeSaved') : t('save'));
    button.textContent = saved ? '★' : '☆';
  }

  function updateDialogZine() {
    const button = document.getElementById('next-dialog-zine');
    const added = state.activeArticle ? isInZine(state.activeArticle) : false;
    button.setAttribute('aria-pressed', String(added));
    button.querySelector('span:last-child').textContent = t(added ? 'zineRemove' : 'zineAdd');
  }

  function updateDialogRead() {
    const button = document.getElementById('next-dialog-read');
    const read = state.activeArticle ? isRead(state.activeArticle) : false;
    button.setAttribute('aria-pressed', String(read));
    button.querySelector('span:first-child').textContent = read ? '✓' : '○';
    button.querySelector('span:last-child').textContent = t(read ? 'markUnread' : 'markRead');
  }

  function showArticleTool(title, body) {
    const panel = document.getElementById('next-article-tool-panel');
    if (!panel) return null;
    panel.innerHTML = `
      <header>
        <h2>${escapeHtml(title)}</h2>
        <button type="button" data-action="article-tool-close" aria-label="${escapeHtml(t('closeTool'))}">×</button>
      </header>
      <div class="article-tool-panel__body">${body}</div>
    `;
    panel.hidden = false;
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return panel;
  }

  function closeArticleTool() {
    stopArticlePodcast();
    stopArticleCloudPodcast();
    const panel = document.getElementById('next-article-tool-panel');
    if (!panel) return;
    panel.hidden = true;
    panel.textContent = '';
  }

  function renderArticleSummary(length = 'standard') {
    const article = state.activeArticle;
    if (!article || !window.WRNSummaryCore?.summarizeText) return;
    const translation = translationFor(article);
    const text = translation?.fullContent ? translation.content : (article.content || article.intro);
    const summary = window.WRNSummaryCore.summarizeText(text, {
      title: translation?.title || article.title,
      length,
      language: translation?.fullContent
        ? state.language
        : String(article.language || article.lang || state.language).toLowerCase().split(/[-_]/)[0]
    });
    const lengthButtons = [
      ['short', 'summaryShort'],
      ['standard', 'summaryStandard'],
      ['detailed', 'summaryDetailed']
    ].map(([value, key]) => `<button type="button" class="${length === value ? 'active' : ''}" data-action="article-summary-length" data-value="${value}" aria-pressed="${length === value}">${escapeHtml(t(key))}</button>`).join('');
    const bullets = summary.bullets.length
      ? `<ul>${summary.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';
    showArticleTool(t('summary'), `
      <div class="article-summary-lengths">${lengthButtons}</div>
      <p class="article-summary-lead">${escapeHtml(summary.lead || article.intro)}</p>
      ${bullets}
      <small>${escapeHtml(t('summaryLocal'))}</small>
    `);
  }

  function renderTranslationComparison() {
    const article = state.activeArticle;
    const translation = article ? translationFor(article) : null;
    if (!article || !translation) return;
    showArticleTool(t('translationCompare'), `
      <p class="translation-note">${escapeHtml(translationNoteLabel(article, translation))}</p>
      <div class="translation-comparison">
        <section>
          <h3>${escapeHtml(t('originalVersion'))}</h3>
          <strong>${escapeHtml(article.title)}</strong>
          <p>${escapeHtml(article.content || article.intro)}</p>
        </section>
        <section>
          <h3>${escapeHtml(t('translatedVersion'))}</h3>
          <strong>${escapeHtml(translation.title || article.title)}</strong>
          <p>${escapeHtml(translation.fullContent ? translation.content : translation.intro)}</p>
        </section>
      </div>
      <div class="translation-report">
        <strong>${escapeHtml(t('translationProblem'))}</strong>
        <label><span>${escapeHtml(t('reportReason'))}</span>
          <select id="next-translation-report-reason">
            <option value="wrong">${escapeHtml(t('reportWrong'))}</option>
            <option value="missing">${escapeHtml(t('reportMissing'))}</option>
            <option value="names">${escapeHtml(t('reportNames'))}</option>
            <option value="other">${escapeHtml(t('reportOther'))}</option>
          </select>
        </label>
        <label><span>${escapeHtml(t('reportNote'))}</span><textarea id="next-translation-report-note" maxlength="1000"></textarea></label>
        <button type="button" class="secondary-button" data-action="translation-report">${escapeHtml(t('prepareEmail'))}</button>
      </div>
    `);
  }

  function splitTextForArticleSpeech(value, maxLength = 280) {
    const text = core.text(value).replace(/https?:\/\/\S+/g, '');
    const sentences = text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [text];
    const chunks = [];
    let current = '';
    for (const sentenceValue of sentences) {
      const sentence = sentenceValue.trim();
      if (!sentence) continue;
      const words = sentence.split(/\s+/);
      for (const word of words) {
        if (current && current.length + word.length + 1 > maxLength) {
          chunks.push(current);
          current = word;
        } else {
          current += `${current ? ' ' : ''}${word}`;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  function articleVoiceOptions() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const prefix = articlePodcast.language.toLowerCase();
    return voices
      .slice()
      .sort((a, b) => {
        const aMatch = String(a.lang || '').toLowerCase().startsWith(prefix);
        const bMatch = String(b.lang || '').toLowerCase().startsWith(prefix);
        return Number(bMatch) - Number(aMatch) || Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name);
      })
      .map(voice => `<option value="${escapeHtml(voice.voiceURI || voice.name)}">${escapeHtml(`${voice.name} (${voice.lang})`)}</option>`)
      .join('');
  }

  function refreshArticleVoiceOptions() {
    const select = document.getElementById('next-article-podcast-voice');
    if (!select) return;
    const selectedVoice = select.value;
    select.innerHTML = `<option value="">${escapeHtml(t('deviceVoice'))}</option>${articleVoiceOptions()}`;
    if ([...select.options].some(option => option.value === selectedVoice)) select.value = selectedVoice;
  }

  function updateCloudPodcastAvailability(messageKey, stateClass, disabled = false) {
    const availability = document.getElementById('next-cloud-podcast-availability');
    if (availability) {
      availability.className = `podcast-availability ${stateClass}`;
      availability.textContent = t(messageKey);
    }
    document.querySelectorAll('[data-action="article-cloud-podcast"]').forEach(button => {
      button.disabled = disabled;
    });
  }

  function probePodcastService(force = false) {
    if (podcastServiceProbe && !force) return podcastServiceProbe;
    const proxyUrl = media.safeUrl(window.WRN_CONFIG?.proxyUrl);
    if (!proxyUrl) {
      state.podcastService = 'unavailable';
      return Promise.resolve(false);
    }
    state.podcastService = 'checking';
    podcastServiceProbe = (async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${proxyUrl}/?action=podcast.status&status=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Podcast status ${response.status}`);
        const status = await response.json();
        state.podcastService = status?.naturalVoicesAvailable === false ? 'unavailable' : 'available';
      } catch (error) {
        console.warn('Podcast service unavailable', error);
        state.podcastService = 'unavailable';
      } finally {
        window.clearTimeout(timer);
      }
      return state.podcastService === 'available';
    })();
    return podcastServiceProbe;
  }

  async function checkCloudPodcastAvailability() {
    try {
      if (await probePodcastService()) {
        updateCloudPodcastAvailability('cloudVoiceAvailable', 'is-available');
        return;
      }
      updateCloudPodcastAvailability('cloudVoiceUnavailable', 'is-unavailable', true);
    } catch {
      state.podcastService = 'unavailable';
      updateCloudPodcastAvailability('cloudVoiceUnavailable', 'is-unavailable', true);
    }
  }

  function renderArticlePodcast() {
    const article = state.activeArticle;
    if (!article) return;
    const deviceSpeechAvailable = 'speechSynthesis' in window
      && typeof window.SpeechSynthesisUtterance === 'function';
    stopArticlePodcast();
    const translation = translationFor(article);
    articlePodcast.language = translation?.fullContent
      ? state.language
      : String(article.language || article.lang || state.language).toLowerCase().split(/[-_]/)[0];
    articlePodcast.chunks = deviceSpeechAvailable
      ? splitTextForArticleSpeech(
        `${translation?.title || article.title}. ${translation?.fullContent ? translation.content : (article.content || article.intro)}`
      )
      : [];
    const voices = AZURE_PODCAST_VOICES[state.language] || AZURE_PODCAST_VOICES.en;
    showArticleTool(t('podcast'), `
      <div class="podcast-cloud-options">
        <strong>${escapeHtml(t('cloudPodcast'))}</strong>
        <div class="podcast-availability is-checking" id="next-cloud-podcast-availability" role="status">${escapeHtml(t('cloudVoiceChecking'))}</div>
        <p>${escapeHtml(t('onlineCostNotice'))}</p>
        <label><span>${escapeHtml(t('azureVoice'))}</span><select id="next-cloud-podcast-voice" aria-label="${escapeHtml(t('azureVoice'))}">${
          voices.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('')
        }</select></label>
        <button type="button" class="secondary-button" data-action="article-cloud-podcast" data-value="short">${escapeHtml(t('shortPodcast'))}</button>
        <button type="button" class="secondary-button" data-action="article-cloud-podcast" data-value="full">${escapeHtml(t('fullPodcast'))}</button>
        <span class="podcast-cloud-status" id="next-cloud-podcast-status"></span>
      </div>
      ${deviceSpeechAvailable ? `
        <div class="podcast-availability is-available" id="next-device-podcast-availability">${escapeHtml(t('deviceVoiceAvailable'))}</div>
        <div class="article-podcast-settings">
          <label><span>${escapeHtml(t('voice'))}</span><select id="next-article-podcast-voice"><option value="">${escapeHtml(t('deviceVoice'))}</option>${articleVoiceOptions()}</select></label>
          <label><span>${escapeHtml(t('speed'))}</span><select id="next-article-podcast-speed"><option value=".85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label>
        </div>
        <div class="article-podcast-controls">
          <button type="button" class="primary-button" data-action="article-podcast-play" aria-pressed="false">${escapeHtml(t('play'))}</button>
          <button type="button" class="secondary-button" data-action="article-podcast-stop">${escapeHtml(t('stop'))}</button>
          <span id="next-article-podcast-status">${escapeHtml(t('ready'))}</span>
        </div>
      ` : `
        <div class="notice-card podcast-device-unavailable">
          <strong>${escapeHtml(t('deviceVoice'))}</strong>
          <p>${escapeHtml(t('deviceVoiceUnavailable'))}</p>
        </div>
      `}
    `);
    refreshArticleVoiceOptions();
    void checkCloudPodcastAvailability();
  }

  async function generateCloudPodcast(mode) {
    const article = state.activeArticle;
    const status = document.getElementById('next-cloud-podcast-status');
    const buttons = [...document.querySelectorAll('[data-action="article-cloud-podcast"]')];
    const requestedVoice = document.getElementById('next-cloud-podcast-voice')?.value || '';
    if (!article) return;
    if (!window.WRN_CONFIG?.proxyUrl) {
      if (status) status.textContent = t('podcastFailed');
      showToast(t('podcastFailed'));
      return;
    }
    buttons.forEach(button => { button.disabled = true; });
    if (status) status.textContent = t('podcastGenerating');
    try {
      if (!translationFor(article)?.fullContent) {
        await translateOpenArticle();
        renderArticlePodcast();
      }
      const translated = translationFor(article);
      const voice = requestedVoice
        || document.getElementById('next-cloud-podcast-voice')?.value
        || '';
      const fullText = translated?.fullContent
        ? translated.content
        : (article.content || article.intro);
      const shortSummary = window.WRNSummaryCore?.summarizeText?.(fullText, {
        title: translated?.title || article.title,
        length: 'detailed',
        language: state.language
      });
      const shortText = [shortSummary?.lead, ...(shortSummary?.bullets || [])]
        .filter(Boolean)
        .join('. ');
      const podcastText = mode === 'short'
        ? (shortText || fullText)
        : fullText;
      const response = await fetch(window.WRN_CONFIG.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': 'wrn-news-app-2'
        },
        body: JSON.stringify({
          action: 'podcast.generate',
          targetLanguage: state.language,
          mode: mode === 'full' ? 'full' : 'short',
          voice,
          title: String(translated?.title || article.title).slice(0, 300),
          text: String(podcastText || '').slice(0, mode === 'short' ? 12000 : 9000),
          articleUrl: article.link,
          source: String(article.source || '').slice(0, 120)
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.podcast) throw new Error(data?.message || `HTTP ${response.status}`);
      const podcast = media.normalizePodcast(data.podcast);
      if (!podcast.audioUrl) throw new Error('Missing podcast audio');
      articleCloudPodcastId = podcast.id;
      state.generatedPodcasts = [
        podcast,
        ...state.generatedPodcasts.filter(item => item.id !== podcast.id)
      ];
      const currentStatus = document.getElementById('next-cloud-podcast-status');
      if (currentStatus) currentStatus.textContent = t('podcastReady');
      const panel = document.getElementById('next-article-tool-panel');
      const host = document.createElement('div');
      host.className = 'media-play-host';
      host.dataset.audioControl = '';
      host.dataset.audioId = podcast.id;
      host.dataset.audioKind = 'generated';
      host.dataset.audioTitle = podcast.title;
      host.dataset.audioArtist = podcast.source;
      host.dataset.audioUrl = podcast.audioUrl;
      host.dataset.audioArtwork = podcast.artwork || '';
      panel?.querySelector('.article-tool-panel__body')?.append(host);
      installMediaControls(panel || document);
    } catch (error) {
      console.warn('Cloud podcast generation failed', error);
      const currentStatus = document.getElementById('next-cloud-podcast-status');
      const detail = core.excerpt(core.text(error?.message), 160);
      if (currentStatus) {
        currentStatus.textContent = detail
          ? `${t('podcastFailed')} ${detail}`
          : t('podcastFailed');
      }
      showToast(t('podcastFailed'));
    } finally {
      document.querySelectorAll('[data-action="article-cloud-podcast"]').forEach(button => {
        button.disabled = false;
      });
    }
  }

  function stopArticleCloudPodcast() {
    if (!articleCloudPodcastId) return;
    const mediaState = window.WRNMediaPlayer?.getState?.();
    if (mediaState?.id === articleCloudPodcastId) window.WRNMediaPlayer.stop();
    articleCloudPodcastId = '';
  }

  function updateArticlePodcastUi(status) {
    const button = document.querySelector('[data-action="article-podcast-play"]');
    const label = document.getElementById('next-article-podcast-status');
    const activelyPlaying = articlePodcast.playing && !articlePodcast.paused;
    if (button) {
      button.textContent = t(activelyPlaying ? 'pause' : 'play');
      button.classList.toggle('is-playing', activelyPlaying);
      button.setAttribute('aria-pressed', String(activelyPlaying));
    }
    if (label) {
      const progress = articlePodcast.chunks.length
        ? ` · ${Math.min(articlePodcast.index + 1, articlePodcast.chunks.length)}/${articlePodcast.chunks.length}`
        : '';
      label.textContent = `${status || t('ready')}${progress}`;
    }
  }

  function speakArticlePodcastChunk() {
    if (!articlePodcast.chunks.length || articlePodcast.index >= articlePodcast.chunks.length) {
      articlePodcast.playing = false;
      articlePodcast.paused = false;
      updateArticlePodcastUi(t('finished'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(articlePodcast.chunks[articlePodcast.index]);
    utterance.lang = articlePodcast.language;
    utterance.rate = Number(document.getElementById('next-article-podcast-speed')?.value || 1);
    const selectedVoice = document.getElementById('next-article-podcast-voice')?.value || '';
    if (selectedVoice) {
      utterance.voice = (window.speechSynthesis.getVoices() || [])
        .find(voice => (voice.voiceURI || voice.name) === selectedVoice) || null;
    }
    articlePodcast.utterance = utterance;
    articlePodcast.playing = true;
    articlePodcast.paused = false;
    utterance.onend = () => {
      if (articlePodcast.utterance !== utterance) return;
      articlePodcast.index += 1;
      articlePodcast.utterance = null;
      speakArticlePodcastChunk();
    };
    utterance.onerror = () => {
      if (articlePodcast.utterance !== utterance) return;
      stopArticlePodcast(false);
      updateArticlePodcastUi(t('speechUnavailable'));
    };
    updateArticlePodcastUi(t('listening'));
    window.speechSynthesis.speak(utterance);
  }

  function toggleArticlePodcast() {
    if (!('speechSynthesis' in window)) return showToast(t('speechUnavailable'));
    if (articlePodcast.playing && !articlePodcast.paused) {
      window.speechSynthesis.pause();
      articlePodcast.paused = true;
      updateArticlePodcastUi(t('pause'));
      return;
    }
    if (articlePodcast.playing && articlePodcast.paused) {
      window.speechSynthesis.resume();
      articlePodcast.paused = false;
      updateArticlePodcastUi(t('listening'));
      return;
    }
    speakArticlePodcastChunk();
  }

  function stopArticlePodcast(reset = true) {
    window.speechSynthesis?.cancel?.();
    articlePodcast.utterance = null;
    articlePodcast.playing = false;
    articlePodcast.paused = false;
    if (reset) articlePodcast.index = 0;
    updateArticlePodcastUi(t('ready'));
  }

  async function shareOpenArticle() {
    const article = state.activeArticle;
    if (!article?.link) return showToast(t('shareFailed'));
    const attribution = ARTICLE_SHARE_ATTRIBUTION[state.language] || ARTICLE_SHARE_ATTRIBUTION.en;
    const shareText = `${article.title}\n${article.link}\n\n${attribution}\n${PLAY_STORE_URL}`;
    const shareData = { title: article.title, text: shareText };
    try {
      const nativeShare = window.Capacitor?.Plugins?.Share;
      if (typeof nativeShare?.share === 'function') {
        await nativeShare.share({ ...shareData, dialogTitle: t('share') });
        showToast(t('shared'));
        return;
      }
      if (navigator.share) {
        await navigator.share(shareData);
        showToast(t('shared'));
        return;
      }
      await navigator.clipboard.writeText(shareText);
      showToast(t('linkCopied'));
    } catch (error) {
      if (error?.name !== 'AbortError') showToast(t('shareFailed'));
    }
  }

  async function shareApp() {
    const localizedShareText = `${t('shareAppText')}\n${PLAY_STORE_URL}`;
    const shareData = {
      title: 'World Revolution News',
      text: localizedShareText
    };
    if (menuDialog.open) menuDialog.close();
    try {
      const nativeShare = window.Capacitor?.Plugins?.Share;
      if (typeof nativeShare?.share === 'function') {
        await nativeShare.share({ ...shareData, dialogTitle: t('shareApp') });
        showToast(t('shared'));
        return;
      }
      if (navigator.share) {
        await navigator.share(shareData);
        showToast(t('shared'));
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(localizedShareText);
      } else {
        const field = document.createElement('textarea');
        field.value = localizedShareText;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      showToast(t('copied'));
    } catch (error) {
      if (error?.name !== 'AbortError') showToast(t('shareFailed'));
    }
  }

  function reportTranslationProblem() {
    const article = state.activeArticle;
    if (!article) return;
    const reason = document.getElementById('next-translation-report-reason')?.value || 'other';
    const note = document.getElementById('next-translation-report-note')?.value.trim() || '';
    const subject = `WRN translation report: ${article.title}`.slice(0, 180);
    const body = [
      `Article: ${article.title}`,
      `Source: ${article.source}`,
      `URL: ${article.link}`,
      `Target language: ${state.language}`,
      `Reason: ${reason}`,
      `Note: ${note}`
    ].join('\n');
    window.location.href = `mailto:worldrevnews@brief.li?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function translateOpenArticle() {
    const article = state.activeArticle;
    const button = document.getElementById('next-dialog-translate');
    if (!article || !window.WRNSharedTranslations?.request) return;
    if (translationFor(article)?.fullContent) {
      renderTranslationComparison();
      return;
    }
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    try {
      const chunks = release.splitTranslationChunks(article.content || article.intro, 5200);
      if (!chunks.length) throw new Error('No article text');
      let translatedTitle = article.title;
      const translatedParts = [];
      for (let index = 0; index < chunks.length; index += 1) {
        button.querySelector('span:last-child').textContent =
          `${t('translatingPart')} ${index + 1}/${chunks.length}`;
        const result = await window.WRNSharedTranslations.request({
          title: index === 0 ? article.title : '',
          text: chunks[index],
          targetLanguage: state.language,
          mode: index === 0 ? 'title_and_text' : 'continuation'
        });
        if (result?.error || !result?.text) throw new Error(result?.message || 'Translation failed');
        if (index === 0) {
          const parsed = core.splitTranslatedTeaser(result.text);
          const hasSeparatedTitle = Boolean(parsed.intro);
          translatedTitle = hasSeparatedTitle ? (parsed.title || article.title) : article.title;
          translatedParts.push(hasSeparatedTitle ? parsed.intro : result.text);
        } else {
          translatedParts.push(core.text(result.text));
        }
      }
      const fullContent = translatedParts.filter(Boolean).join('\n\n');
      const translated = {
        title: translatedTitle,
        intro: core.excerpt(fullContent || article.intro, 230),
        content: fullContent || article.content || article.intro
      };
      storeTranslation(article, translated);
      document.getElementById('next-article-title').textContent = translated.title;
      const content = document.getElementById('next-article-content');
      content.querySelector('h1').textContent = translated.title;
      content.querySelector('.article-intro').textContent = translated.intro;
      applyArticleLexiconMarkup(translated.content);
      renderTranslationComparison();
      showToast(t('translationComplete'));
    } catch (error) {
      console.warn('Article translation failed', error);
      showToast(t('translationFailed'));
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.querySelector('span:last-child').textContent = t('translate');
    }
  }

  function openBriefing() {
    state.briefing = {
      step: 1,
      regions: [...(state.preferences.regions || [])],
      topics: [...(state.preferences.topics || [])],
      language: state.preferences.preferredLanguage || state.language,
      amount: state.preferences.briefingAmount || 5,
      itemCount: 5,
      editionType: 'daily',
      dailyEdition: false,
      progressIndex: 0,
      items: [],
      historyItemIds: [],
      prepared: false,
      translating: false
    };
    renderBriefingStep();
    briefingDialog.showModal();
  }

  function openDailyEdition() {
    const items = state.dailyEditionItems.slice(0, 10);
    if (!items.length) return;
    state.briefing = {
      step: 2,
      regions: [],
      topics: [],
      language: state.preferences.preferredLanguage || state.language,
      amount: 5,
      itemCount: 5,
      editionType: 'daily',
      dailyEdition: true,
      progressIndex: 0,
      items: [],
      historyItemIds: [],
      prepared: false,
      translating: false
    };
    renderBriefingStep();
    briefingDialog.showModal();
  }

  async function saveDailyEditionOffline() {
    const hasConfiguredEdition = state.briefing.dailyEdition && state.briefing.items.length;
    const items = hasConfiguredEdition
      ? state.briefing.items.slice(0, state.briefing.itemCount || 5)
      : state.dailyEditionItems.slice(0, 5);
    if (!items.length) return;
    const storedBookmarks = bookmarks();
    const known = new Set(storedBookmarks.map(item => core.articleId(item)));
    items.forEach(article => {
      if (known.has(article.id)) return;
      const { contentBlocks, ...bookmark } = article;
      storedBookmarks.push(bookmark);
      known.add(article.id);
    });
    writeJson(BOOKMARKS_KEY, storedBookmarks);
    for (const article of items) {
      await prepareSavedArticle(article, { silent: true });
    }
    const settings = hasConfiguredEdition ? state.briefing : {
      language: state.preferences.preferredLanguage || state.language,
      amount: 5,
      itemCount: 5,
      editionType: 'daily',
      dailyEdition: true,
      progressIndex: 0,
      offlineReady: false
    };
    const entry = rememberBriefing(items, settings);
    const result = await product21.storeDailyEdition(
      window.WRNStorage,
      entry,
      items.map(article => ({ ...article, contentBlocks: undefined }))
    );
    const historyEntry = state.briefingHistory.find(item => item.editionId === entry.editionId);
    if (historyEntry) historyEntry.offlineReady = result.ok;
    writeJson(BRIEFING_HISTORY_KEY, state.briefingHistory);
    if (!result.ok) {
      showToast(t('editionSaveFailed'));
      return;
    }
    if (hasConfiguredEdition) {
      state.briefing.offlineReady = true;
      state.briefing.historyItemIds = [];
      if (state.briefing.step === 3 && briefingDialog.open) renderBriefingStep();
    }
    showToast(t('editionSaved'));
  }

  function rememberBriefing(items = state.briefing.items, settings = state.briefing) {
    if (!items.length) return null;
    if (items === state.briefing.items && state.briefing.historyItemIds.length) {
      return state.briefingHistory.find(item => item.editionId === state.briefing.editionId) || null;
    }
    const descriptor = product21.dailyEditionDescriptor({
      language: settings.language,
      itemCount: settings.itemCount || items.length,
      editionType: settings.editionType || 'daily',
      articleIds: items.map(article => article.id)
    });
    const existing = state.briefingHistory.find(item => item.editionId === descriptor.editionId);
    const entry = {
      ...descriptor,
      createdAt: existing?.createdAt || new Date().toISOString(),
      amount: settings.amount,
      dailyEdition: settings.dailyEdition === true,
      progressIndex: Math.max(0, Number(settings.progressIndex) || 0),
      offlineReady: existing?.offlineReady === true || settings.offlineReady === true,
      audioMode: 'device-speech',
      titles: items.slice(0, 3).map(article =>
        translationForLanguage(article, settings.language)?.title || article.title
      )
    };
    state.briefingHistory = [entry, ...state.briefingHistory.filter(item => item.editionId !== entry.editionId)].slice(0, 12);
    writeJson(BRIEFING_HISTORY_KEY, state.briefingHistory);
    return entry;
  }

  async function refreshBriefingOfflineStates() {
    let changed = false;
    for (const entry of state.briefingHistory) {
      const result = entry.dailyEdition
        ? await product21.loadDailyEdition(window.WRNStorage, entry)
        : { ok: false };
      if (entry.offlineReady !== result.ok) changed = true;
      entry.offlineReady = result.ok;
    }
    if (changed) writeJson(BRIEFING_HISTORY_KEY, state.briefingHistory);
  }

  function briefingHistoryMarkup() {
    if (!state.briefingHistory.length) return '';
    return `<details class="briefing-history"><summary>${escapeHtml(t('briefingHistory'))} · ${state.briefingHistory.length}</summary><div>${state.briefingHistory.map((entry, index) => {
      const parsedDate = new Date(entry.createdAt);
      const date = Number.isFinite(parsedDate.getTime())
        ? new Intl.DateTimeFormat(state.language, { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate)
        : t('unknown');
      return `<button type="button" data-action="briefing-history-open" data-index="${index}"><strong>${escapeHtml(entry.dailyEdition ? t(`edition${entry.editionType.charAt(0).toUpperCase()}${entry.editionType.slice(1)}`) : (entry.titles[0] || t('briefing')))}</strong><small>${escapeHtml(date)} · ${entry.articleIds.length} ${escapeHtml(t('briefingItems'))}${entry.progressIndex ? ` · ${escapeHtml(t('resumeEdition'))} ${entry.progressIndex + 1}` : ''}</small></button>`;
    }).join('')}<button class="briefing-history__clear" type="button" data-action="briefing-history-clear">${escapeHtml(t('briefingHistoryClear'))}</button></div></details>`;
  }

  async function openBriefingHistory(index) {
    const entry = state.briefingHistory[index];
    if (!entry) return;
    const offlineResult = entry.dailyEdition
      ? await product21.loadDailyEdition(window.WRNStorage, entry)
      : { ok: false, dataset: null };
    entry.offlineReady = offlineResult.ok;
    writeJson(BRIEFING_HISTORY_KEY, state.briefingHistory);
    const restoredItems = product21.restoreEditionArticles(entry.articleIds, state.articles, offlineResult.dataset?.articles);
    state.briefing = {
      step: 3, regions: [], topics: [], language: entry.language, amount: entry.amount,
      itemCount: entry.itemCount, editionType: entry.editionType, dailyEdition: entry.dailyEdition,
      progressIndex: Math.min(entry.progressIndex, Math.max(0, entry.articleIds.length - 1)),
      editionId: entry.editionId, datasetKey: entry.datasetKey,
      offlineReady: offlineResult.ok, audioMode: entry.audioMode,
      items: restoredItems,
      historyItemIds: [...entry.articleIds],
      prepared: true,
      translating: false
    };
    renderBriefingStep();
  }

  function briefingStepLabel() {
    return `${t('step')} ${state.briefing.step} ${t('of')} 3`;
  }

  function briefingLanguageOptions() {
    const labels = {
      de:'Deutsch', en:'English', es:'Español', fr:'Français', it:'Italiano',
      pt:'Português', ru:'Русский', el:'Ελληνικά', tr:'Türkçe'
    };
    return Object.entries(labels).map(([value, label]) =>
      `<option value="${value}"${state.briefing.language === value ? ' selected' : ''}>${escapeHtml(label)}</option>`
    ).join('');
  }

  function collectBriefingStep() {
    if (state.briefing.step === 1) {
      state.briefing.regions = [...briefingDialog.querySelectorAll('input[name="briefing-region"]:checked')].map(input => input.value);
      state.briefing.topics = [...briefingDialog.querySelectorAll('input[name="briefing-topic"]:checked')].map(input => input.value);
      state.briefing.prepared = false;
    }
    if (state.briefing.step === 2) {
      state.briefing.language = document.getElementById('next-briefing-language')?.value || state.language;
      if (state.briefing.dailyEdition) {
        state.briefing.itemCount = Number(briefingDialog.querySelector('input[name="edition-count"]:checked')?.value || 5);
        state.briefing.editionType = briefingDialog.querySelector('input[name="edition-type"]:checked')?.value || 'daily';
      } else {
        state.briefing.amount = Number(briefingDialog.querySelector('input[name="briefing-amount"]:checked')?.value || 5);
      }
    }
  }

  function buildBriefingItems() {
    const preferences = {
      regions: state.briefing.regions,
      topics: state.briefing.topics,
      sources: [...(state.preferences.sources || [])],
      blockedSources: [...(state.preferences.blockedSources || [])]
    };
    let candidates = state.briefing.regions.length || state.briefing.topics.length
      ? state.articles.filter(article => core.matchesPreferences(article, preferences))
      : state.articles;
    if (state.briefing.dailyEdition) {
      const maximumAge = { morning: 18, daily: 36, weekly: 24 * 7 }[state.briefing.editionType] || 36;
      const cutoff = Date.now() - maximumAge * 60 * 60 * 1000;
      candidates = candidates.filter(article => core.dateValue(article) >= cutoff && core.dateValue(article) <= Date.now());
    }
    const balanced = core.balanceBySource(
      candidates,
      Math.min(candidates.length, BRIEFING_CANDIDATE_LIMIT),
      2
    );
    if (state.briefing.dailyEdition) {
      state.briefing.items = product21.selectDailyEdition(balanced, {
        type: state.briefing.editionType,
        count: state.briefing.itemCount
      });
      return;
    }
    const targetWords = state.briefing.amount * BRIEFING_WORDS_PER_MINUTE;
    let selectedWords = 0;
    state.briefing.items = [];
    for (const article of balanced) {
      state.briefing.items.push(article);
      selectedWords += briefingArticleText(article).split(/\s+/).filter(Boolean).length;
      if (selectedWords >= targetWords) break;
    }
  }

  function briefingArticleText(article) {
    const translated = translationForLanguage(article, state.briefing.language);
    return [
      translated?.title || article.title,
      mediaDescription(translated?.intro || article.intro || article.content)
    ].filter(Boolean).join('. ');
  }

  function briefingEstimatedMinutes() {
    const words = state.briefing.items
      .map(briefingArticleText)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean)
      .length;
    return Math.max(1, Math.round(words / BRIEFING_WORDS_PER_MINUTE));
  }

  async function translateGeneratedBriefing() {
    const targetLanguage = state.briefing.language || state.language;
    const items = [...state.briefing.items];
    await Promise.allSettled(items.map(article => requestBriefingTranslation(article, targetLanguage)));
    if (state.briefing.language !== targetLanguage) return;
    state.briefing.translating = false;
    rememberBriefing();
    if (state.briefing.step === 3 && briefingDialog.open) renderBriefingStep();
  }

  function renderBriefingStep() {
    document.getElementById('next-briefing-step-label').textContent = briefingStepLabel();
    const content = document.getElementById('next-briefing-content');
    const actions = document.getElementById('next-briefing-actions');

    if (state.briefing.step === 1) {
      const regions = new Set(state.briefing.regions);
      const topics = new Set(state.briefing.topics);
      content.innerHTML = `
        <p>${escapeHtml(t('briefingSetup'))}</p>
        ${briefingHistoryMarkup()}
        <section class="briefing-section">
          <h3>${escapeHtml(t('chooseRegions'))}</h3>
          <div class="choice-grid">${state.facets.regions.map(value => choiceMarkup('briefing-region', value, regions.has(value), classificationLabel(value))).join('')}</div>
        </section>
        <section class="briefing-section">
          <h3>${escapeHtml(t('chooseTopics'))}</h3>
          <div class="choice-grid">${state.facets.topics.slice(0, 28).map(value => choiceMarkup('briefing-topic', value, topics.has(value), classificationLabel(value))).join('')}</div>
        </section>`;
      actions.innerHTML = `<button class="secondary-button" type="button" data-briefing-close>${escapeHtml(t('cancel'))}</button><button class="primary-button" type="button" data-action="briefing-next">${escapeHtml(t('next'))}</button>`;
      return;
    }

    if (state.briefing.step === 2) {
      const configurationMarkup = state.briefing.dailyEdition
        ? `<section class="briefing-section">
          <h3>${escapeHtml(t('editionType'))}</h3>
          <div class="briefing-lengths">
            ${DAILY_EDITION_TYPES.map(value => `<label><input type="radio" name="edition-type" value="${value}"${state.briefing.editionType === value ? ' checked' : ''}><strong>${escapeHtml(t(`edition${value.charAt(0).toUpperCase()}${value.slice(1)}`))}</strong></label>`).join('')}
          </div>
        </section>
        <section class="briefing-section">
          <h3>${escapeHtml(t('editionCount'))}</h3>
          <div class="briefing-lengths">
            ${DAILY_EDITION_ITEM_COUNTS.map(count => `<label><input type="radio" name="edition-count" value="${count}"${state.briefing.itemCount === count ? ' checked' : ''}><strong>${count}</strong><span>${escapeHtml(t('briefingItems'))}</span></label>`).join('')}
          </div>
        </section>`
        : `<section class="briefing-section">
          <h3>${escapeHtml(t('briefingAmount'))}</h3>
          <div class="briefing-lengths">
            ${BRIEFING_DURATIONS.map(amount => `<label><input type="radio" name="briefing-amount" value="${amount}"${state.briefing.amount === amount ? ' checked' : ''}><strong>${amount}</strong><span>${escapeHtml(t('briefingMinutes'))}</span></label>`).join('')}
          </div>
        </section>`;
      content.innerHTML = `
        <section class="briefing-section">
          <h3>${escapeHtml(t('language'))}</h3>
          <select class="briefing-language" id="next-briefing-language">${briefingLanguageOptions()}</select>
        </section>
        ${configurationMarkup}`;
      actions.innerHTML = `<button class="secondary-button" type="button" data-action="briefing-back">${escapeHtml(t('back'))}</button><button class="primary-button" type="button" data-action="briefing-next">${escapeHtml(t('next'))}</button>`;
      return;
    }

    if (state.briefing.historyItemIds.length && !state.briefing.prepared) {
      state.briefing.items = product21.restoreEditionArticles(state.briefing.historyItemIds, state.articles, []);
      state.briefing.prepared = true;
    } else if (!state.briefing.prepared) {
      buildBriefingItems();
      state.briefing.prepared = true;
    }
    const targetLanguage = state.briefing.language || state.language;
    const needsTranslation = state.briefing.items.some(article =>
      articleNeedsTeaserTranslation(article, targetLanguage)
    );
    if (needsTranslation || state.briefing.translating) {
      content.innerHTML = `<div class="loading-state briefing-translation-loading" role="status"><span class="red-black-star loading-star" aria-hidden="true">★</span><strong>${escapeHtml(t('translating'))}</strong></div>`;
      actions.innerHTML = `<button class="secondary-button" type="button" data-action="briefing-back">${escapeHtml(t('back'))}</button><button class="primary-button" type="button" disabled>${escapeHtml(t('listen'))}</button>`;
      if (!state.briefing.translating) {
        state.briefing.translating = true;
        void translateGeneratedBriefing();
      }
      return;
    }
    rememberBriefing();
    const estimatedMinutes = briefingEstimatedMinutes();
    const editionStatus = state.briefing.dailyEdition
      ? `<p class="briefing-audio-notice"><strong>${escapeHtml(t('deviceVoice'))}</strong><br><span>${escapeHtml(t('generatedAudioUnavailable'))}</span>${state.briefing.offlineReady ? `<br><span>${escapeHtml(t('offlineArticlesReady'))}</span>` : ''}</p>`
      : '';
    content.innerHTML = state.briefing.items.length
      ? `<p class="briefing-duration"><strong>${escapeHtml(t('briefingApprox'))} ${estimatedMinutes} ${escapeHtml(t('briefingMinutes'))}</strong> · ${state.briefing.items.length} ${escapeHtml(t('briefingItems'))}</p>${editionStatus}<ol class="briefing-preview">${state.briefing.items.map((article, index) => { const translated = translationForLanguage(article, targetLanguage); return `<li${index === state.briefing.progressIndex ? ' class="is-current"' : ''}><b>${index + 1}</b><div><strong>${escapeHtml(translated?.title || article.title)}</strong><small>${escapeHtml(article.source)} · ${escapeHtml(mediaDescription(translated?.intro || article.intro))}</small>${state.briefing.dailyEdition ? `<button type="button" data-action="briefing-resume-item" data-index="${index}">${escapeHtml(t('resumeEdition'))}</button>` : ''}</div></li>`; }).join('')}</ol>`
      : `<div class="empty-state compact"><strong>${escapeHtml(t('noBriefing'))}</strong></div>`;
    actions.innerHTML = `<button class="secondary-button" type="button" data-action="briefing-back">${escapeHtml(t('back'))}</button><button class="secondary-button" type="button" data-action="briefing-stop">${escapeHtml(t('stop'))}</button><button class="primary-button" type="button" data-action="briefing-listen"${state.briefing.items.length ? '' : ' disabled'}>${escapeHtml(t('listen'))}</button><button class="primary-button" type="button" data-briefing-close>${escapeHtml(t('done'))}</button>`;
  }

  function speakBriefing() {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      showToast(t('speechUnavailable'));
      return;
    }
    const generation = ++briefingSpeechGeneration;
    window.speechSynthesis.cancel();
    const startIndex = Math.max(0, Math.min(state.briefing.items.length - 1, Number(state.briefing.progressIndex) || 0));
    const languageCodes = { de:'de-DE', en:'en-US', es:'es-ES', fr:'fr-FR', it:'it-IT', pt:'pt-PT', ru:'ru-RU', el:'el-GR', tr:'tr-TR' };
    const queue = product21.speechQueue(state.briefing.items, startIndex, briefingArticleText);
    const speakItem = queueIndex => {
      const segment = queue[queueIndex];
      if (generation !== briefingSpeechGeneration || !segment) return;
      state.briefing.progressIndex = segment.index;
      state.briefing.historyItemIds = [];
      rememberBriefing();
      if (briefingDialog.open) renderBriefingStep();
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = languageCodes[state.briefing.language] || state.briefing.language;
      utterance.rate = 1;
      utterance.onend = () => speakItem(queueIndex + 1);
      utterance.onerror = () => {
        state.briefing.progressIndex = segment.index;
        state.briefing.historyItemIds = [];
        rememberBriefing();
      };
      window.speechSynthesis.speak(utterance);
    };
    speakItem(0);
  }

  function openPreferences() {
    const selectedRegions = new Set(state.preferences.regions || []);
    const selectedTopics = new Set(state.preferences.topics || []);
    const followedSources = new Set(state.preferences.sources || []);
    const blockedSources = new Set(state.preferences.blockedSources || []);
    const selectedPrisoners = new Set(state.preferences.prisonerIds || []);
    const selectedDevelopments = new Set(Array.isArray(state.developmentWatch) ? state.developmentWatch : []);
    const topics = [...state.facets.topics].sort((a, b) => a.localeCompare(b, state.language));
    const sources = [...state.facets.sources].sort((a, b) => a.localeCompare(b, state.language));
    const developments = specialty.developmentClusters(
      state.articles,
      window.WRNStoriesCore,
      { days: 30, threshold: DEVELOPMENT_MATCH_THRESHOLD }
    );

    document.getElementById('next-region-choices').innerHTML = [...state.facets.regions]
      .sort((a, b) => a.localeCompare(b, state.language)).map(value =>
      choiceMarkup('region', value, selectedRegions.has(value), classificationLabel(value))
    ).join('');
    document.getElementById('next-topic-choices').innerHTML = topics.map(value =>
      choiceMarkup('topic', value, selectedTopics.has(value), classificationLabel(value))
    ).join('');
    document.getElementById('next-source-choices').innerHTML = sources.map(value =>
      sourcePreferenceMarkup(
        value,
        followedSources.has(value) ? 'follow' : blockedSources.has(value) ? 'hide' : 'neutral'
      )
    ).join('');
    document.getElementById('next-prisoner-choices').innerHTML = (state.prisonerData.profiles || [])
      .filter(specialty.isCurrentProfile)
      .map(profile => choiceMarkup('prisoner', profile.id, selectedPrisoners.has(profile.id), profile.publicName))
      .join('') || `<small>${escapeHtml(t('noWatchOptions'))}</small>`;
    document.getElementById('next-development-choices').innerHTML = developments
      .map(story => choiceMarkup('development', story.id, selectedDevelopments.has(story.id), story.title))
      .join('') || `<small>${escapeHtml(t('noWatchOptions'))}</small>`;
    document.getElementById('next-preference-language').value = state.preferences.preferredLanguage || state.language;
    document.getElementById('next-preference-briefing-length').innerHTML = BRIEFING_DURATIONS.map(amount =>
      `<label><input type="radio" name="preference-briefing-amount" value="${amount}"${state.preferences.briefingAmount === amount ? ' checked' : ''}><strong>${amount}</strong><span>${escapeHtml(t('briefingMinutes'))}</span></label>`
    ).join('');
    document.getElementById('next-preference-source-search').value = '';
    filterPreferenceSources('');
    preferencesDialog.showModal();
  }

  function choiceMarkup(kind, value, selected, label = value) {
    return `<label class="choice-chip"><input type="checkbox" name="${escapeHtml(kind)}" value="${escapeHtml(value)}"${selected ? ' checked' : ''}><span>${escapeHtml(label)}</span></label>`;
  }

  function sourcePreferenceMarkup(source, value) {
    return `<label class="source-preference-row" data-source-row data-source-search="${escapeHtml(source.toLocaleLowerCase())}">
      <span>${escapeHtml(source)}</span>
      <select data-source-preference="${escapeHtml(source)}" aria-label="${escapeHtml(`${source}: ${t('chooseSources')}`)}">
        <option value="neutral"${value === 'neutral' ? ' selected' : ''}>${escapeHtml(t('sourceNeutral'))}</option>
        <option value="follow"${value === 'follow' ? ' selected' : ''}>${escapeHtml(t('sourceFollow'))}</option>
        <option value="hide"${value === 'hide' ? ' selected' : ''}>${escapeHtml(t('sourceHide'))}</option>
      </select>
    </label>`;
  }

  function filterPreferenceSources(query) {
    const normalized = String(query || '').trim().toLocaleLowerCase();
    preferencesDialog.querySelectorAll('[data-source-row]').forEach(row => {
      row.hidden = Boolean(normalized && !row.dataset.sourceSearch.includes(normalized));
    });
  }

  function savePreferences() {
    const sourcePreferences = [...preferencesDialog.querySelectorAll('[data-source-preference]')];
    const selectedLanguage = supportedLanguage(document.getElementById('next-preference-language').value);
    state.preferences = {
      ...normalizedPreferences(state.preferences),
      regions: [...preferencesDialog.querySelectorAll('input[name="region"]:checked')].map(input => input.value),
      topics: [...preferencesDialog.querySelectorAll('input[name="topic"]:checked')].map(input => input.value),
      sources: sourcePreferences.filter(select => select.value === 'follow').map(select => select.dataset.sourcePreference),
      blockedSources: sourcePreferences.filter(select => select.value === 'hide').map(select => select.dataset.sourcePreference),
      prisonerIds: [...preferencesDialog.querySelectorAll('input[name="prisoner"]:checked')].map(input => input.value),
      preferredLanguage: selectedLanguage,
      briefingAmount: Number(preferencesDialog.querySelector('input[name="preference-briefing-amount"]:checked')?.value || 5)
    };
    state.developmentWatch = [...preferencesDialog.querySelectorAll('input[name="development"]:checked')].map(input => input.value);
    writeJson(PREFS_KEY, state.preferences);
    writeJson(STORY_WATCH_KEY, state.developmentWatch);
    state.language = selectedLanguage;
    localStorage.setItem(LANGUAGE_KEY, state.language);
    applyLanguage();
    window.dispatchEvent(new CustomEvent('wrnlanguagechange', { detail: { language: state.language } }));
    preferencesDialog.close();
    state.view = 'following';
    render();
    showToast(t('selectionSaved'));
  }

  function changeView(view) {
    if (!['home', 'following', 'discover', 'events', 'lexicon', 'library', 'prisoners', 'help', 'developments', 'media', 'saved'].includes(view)) return;
    const previousView = state.view;
    if (view === 'help' && document.activeElement instanceof HTMLElement
      && document.activeElement.dataset.viewTarget === 'help') {
      helpReturnFocus = document.activeElement;
    }
    const restoreHelpTrigger = previousView === 'help' && view === 'discover';
    const changed = state.view !== view;
    state.view = view;
    render();
    if (view === 'events') void ensureAllEventsLoaded();
    if (view === 'discover') void loadSelectedSourceArchives();
    const helpTrigger = helpReturnFocus?.isConnected
      ? helpReturnFocus
      : document.querySelector('[data-view-target="help"]');
    if (restoreHelpTrigger && helpTrigger instanceof HTMLElement) {
      helpTrigger.focus({ preventScroll: true });
      helpReturnFocus = null;
    } else {
      document.getElementById('next-main').focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (changed || !history.state?.wrnAppNavigation) writeAppHistory('push');
  }

  function bindEvents() {
    window.speechSynthesis?.addEventListener?.('voiceschanged', refreshArticleVoiceOptions);
    viewRoot.addEventListener('error', event => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      window.WRNLocalDiagnostics?.record?.('image-load', 'Bild konnte nicht geladen werden.', image.closest('[data-article-id]') ? 'article' : 'interface');
      const optionalContainer = image.closest('[data-optional-image]');
      if (optionalContainer) {
        optionalContainer.remove();
        return;
      }
      if (image.classList.contains('article-lead-image')) {
        image.closest('.article-lead-image-link')?.remove();
        return;
      }
      image.closest('.article-inline-image, .article-image-gallery a')?.remove();
    }, true);

    document.addEventListener('click', event => {
      const target = event.target.closest('[data-view-target], [data-action], [data-filter-kind], [data-menu-close], [data-feedback-close], [data-briefing-close], [data-release-close], [data-review-close]');
      if (!target) return;

      if (target.hasAttribute('data-menu-close')) {
        menuDialog.close();
        return;
      }

      if (target.hasAttribute('data-feedback-close')) {
        feedbackDialog.close();
        return;
      }

      if (target.hasAttribute('data-briefing-close')) {
        window.speechSynthesis?.cancel?.();
        briefingDialog.close();
        return;
      }

      if (target.dataset.viewTarget) {
        if (menuDialog.open) menuDialog.close();
        if (target.dataset.viewTarget === 'developments') {
          state.activeDossierId = core.text(target.dataset.dossierId);
        }
        changeView(target.dataset.viewTarget);
        if (target.dataset.viewTarget === 'developments' && state.activeDossierId) {
          window.requestAnimationFrame(() => {
            const dossier = [...document.querySelectorAll('[data-dossier-card]')]
              .find(element => element.dataset.dossierCard === state.activeDossierId);
            dossier?.focus?.({ preventScroll: true });
            dossier?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
          });
        }
        return;
      }

      if (target.dataset.filterKind) {
        state.discover[target.dataset.filterKind] = target.dataset.filterValue;
        state.discover.limit = 24;
        persistArchiveFilters();
        renderDiscover();
        return;
      }

      if (target.hasAttribute('data-review-close')) {
        developmentReviewDialog?.close();
        return;
      }

      if (target.hasAttribute('data-release-close')) {
        document.getElementById('next-release-dialog')?.close();
        return;
      }

      const action = target.dataset.action;
      const article = Number.isInteger(Number(target.dataset.index))
        ? state.cardArticles[Number(target.dataset.index)]
        : null;
      if (action === 'open' && article) openArticle(article);
      if (action === 'translate' && article) {
        translateTeaser(article, target, target.closest('.news-card'));
      }
      if (action === 'save' && article) {
        const saved = toggleSaved(article);
        target.setAttribute('aria-pressed', String(saved));
        target.setAttribute('aria-label', saved ? t('removeSaved') : t('save'));
        target.textContent = saved ? '★' : '☆';
        if (state.view === 'saved' && !saved) renderSaved();
      }
      if (action === 'offline-save' && article) void prepareSavedArticle(article);
      if (action === 'offline-remove' && article) void removeArticleOffline(article);
      if (action === 'open-archive') {
        state.discover.period = ['7d', '30d', 'all'].includes(target.dataset.period)
          ? target.dataset.period
          : 'current';
        state.discover.limit = 24;
        persistArchiveFilters();
        changeView('discover');
        void loadSelectedSourceArchives();
      }
      if (action === 'home-events') {
        state.eventFilter.archived = false;
        state.eventFilter.regions = state.eventFilter.location
          ? []
          : [...new Set(state.preferences.regions || [])];
        changeView('events');
      }
      if (action === 'discover-period') {
        state.discover.period = ['current', '7d', '30d', 'all'].includes(target.dataset.value)
          ? target.dataset.value
          : 'current';
        state.discover.limit = 24;
        persistArchiveFilters();
        renderDiscover();
        void loadSelectedSourceArchives();
      }
      if (action === 'archive-source') {
        const source = core.text(target.dataset.value);
        const selected = new Set(state.sourceArchive.selectedSources);
        if (selected.has(source)) selected.delete(source);
        else if (source && selected.size < 20) selected.add(source);
        state.sourceArchive.selectedSources = [...selected];
        state.discover.source = 'all';
        state.discover.limit = 24;
        persistArchiveFilters();
        renderDiscover();
        void loadSelectedSourceArchives();
      }
      if (action === 'archive-source-clear') {
        state.sourceArchive.selectedSources = [];
        state.discover.source = 'all';
        state.discover.limit = 24;
        persistArchiveFilters();
        renderDiscover();
      }
      if (action === 'discover-more') {
        state.discover.limit += 24;
        renderDiscover();
      }
      if (action === 'library-language-all') {
        state.library.languages = [];
        state.library.limit = 30;
        renderLibrary();
      }
      if (action === 'library-language') {
        const values = new Set(state.library.languages || []);
        if (values.has(target.dataset.value)) values.delete(target.dataset.value);
        else values.add(target.dataset.value);
        state.library.languages = [...values];
        state.library.limit = 30;
        renderLibrary();
      }
      if (action === 'library-more') {
        state.library.limit += 30;
        renderLibrary();
      }
      if (action === 'discover-view') {
        state.discover.viewMode = ['cards', 'compact', 'headlines'].includes(target.dataset.value)
          ? target.dataset.value
          : 'cards';
        persistArchiveFilters();
        renderDiscover();
      }
      if (action === 'source-profile') {
        window.WRNSourceProfiles?.open?.(target.dataset.source || article?.source || '');
      }
      if (action === 'article-lexicon') renderArticleLexiconTerm(target.dataset.term || '');
      if (action === 'article-lexicon-open') {
        const term = state.lexiconSnapshot.terms.find(item => item.id === target.dataset.term);
        state.lexicon.section = 'all';
        state.lexicon.query = term ? specialty.localized(term.title, state.language) : '';
        if (articleDialog.open) articleDialog.close();
        changeView('lexicon');
      }
      if (action === 'article-detail-retry' && state.activeArticle) {
        state.activeArticle.detailFailed = false;
        state.activeArticle.detailLoading = false;
        openArticle(state.activeArticle);
      }
      if (action === 'article-summary') renderArticleSummary();
      if (action === 'article-summary-length') renderArticleSummary(target.dataset.value || 'standard');
      if (action === 'article-translate') translateOpenArticle();
      if (action === 'article-podcast') renderArticlePodcast();
      if (action === 'article-podcast-play') toggleArticlePodcast();
      if (action === 'article-podcast-stop') stopArticlePodcast();
      if (action === 'article-cloud-podcast') void generateCloudPodcast(target.dataset.value || 'short');
      if (action === 'article-zine' && state.activeArticle) {
        toggleZineArticle(state.activeArticle);
        updateDialogZine();
      }
      if (action === 'article-read' && state.activeArticle) {
        toggleRead(state.activeArticle);
        updateDialogRead();
      }
      if (action === 'article-share') shareOpenArticle();
      if (action === 'share-app') void shareApp();
      if (action === 'translation-report') reportTranslationProblem();
      if (action === 'article-tool-close') closeArticleTool();
      if (action === 'about') {
        if (menuDialog.open) menuDialog.close();
        renderAbout();
      }
      if (action === 'feedback-open') {
        if (menuDialog.open) menuDialog.close();
        if (!feedbackDialog.open) feedbackDialog.showModal();
        window.setTimeout(() => document.getElementById('next-feedback-message')?.focus(), 0);
      }
      if (action === 'feedback-copy') void copyFeedbackText();
      if (action === 'feedback-email') {
        const payload = feedbackMessagePayload();
        if (!payload.message) {
          showToast(t('feedbackRequired'));
          document.getElementById('next-feedback-message')?.focus();
        } else {
          openFeedbackEmail(payload);
        }
      }
      if (action === 'notifications-open') {
        if (menuDialog.open) menuDialog.close();
        renderNotificationSettings();
      }
      if (action === 'notifications-enable') void enableNotifications();
      if (action === 'notifications-disable') void disableNotifications();
      if (action === 'notifications-save') void updateNotificationSettings();
      if (action === 'system-status') {
        if (menuDialog.open) menuDialog.close();
        void renderSystemStatus();
      }
      if (action === 'data-control') {
        if (menuDialog.open) menuDialog.close();
        renderDataControl();
      }
      if (action === 'data-export') exportDataBackup();
      if (action === 'data-import') document.getElementById('next-data-import-file')?.click();
      if (action === 'data-clear-reading') void clearLocalData('reading');
      if (action === 'data-clear-offline') void clearLocalData('offline');
      if (action === 'diagnostics-export') exportLocalDiagnostics();
      if (action === 'diagnostics-clear') clearLocalDiagnostics();
      if (action === 'data-clear-all') void clearLocalData('all');
      if (action === 'preferences') {
        if (menuDialog.open) menuDialog.close();
        openPreferences();
      }
      if (action === 'retry') loadData();
      if (action === 'live-data') {
        const liveUrl = new URL(window.location.href);
        liveUrl.searchParams.delete('data');
        window.location.assign(liveUrl.href);
      }
      if (action === 'event-period') {
        state.eventFilter.archived = target.dataset.value === 'archive';
        state.eventFilter.limit = 60;
        renderEvents();
      }
      if (action === 'event-more') {
        state.eventFilter.limit = (Number(state.eventFilter.limit) || 60) + 60;
        renderEvents();
      }
      if (action === 'event-location') requestEventLocation();
      if (action === 'event-radar') renderEventRadar();
      if (action === 'event-filter-save') storeCurrentEventFilter();
      if (action === 'event-calendar') {
        const selectedEvent = eventById(target.dataset.eventId);
        if (selectedEvent) void addEventToCalendar(selectedEvent);
      }
      if (action === 'event-reminder') {
        const selectedEvent = eventById(target.dataset.eventId);
        if (selectedEvent) {
          void toggleEventReminder(selectedEvent).then(() => renderEvents());
        }
      }
      if (action === 'lexicon-section') {
        state.lexicon.section = target.dataset.value || 'all';
        renderLexicon();
        writeAppHistory('push');
      }
      if (action === 'lexicon-download') window.WRNLexicon184?.exportData?.();
      if (action === 'letter') {
        window.WRNPrisonerSolidarity190?.loadData?.()
          .then(() => window.WRNPrisonerSolidarity190.openWorkshop(target.dataset.profileId))
          .catch(error => {
            console.warn('Letter workshop unavailable', error);
            showToast(t('loadError'));
          });
      }
      if (action === 'prisoner-section') {
        state.prisoners.section = target.dataset.value === 'sources' ? 'sources' : 'people';
        renderPrisoners();
        writeAppHistory('push');
      }
      if (action === 'development-filter') {
        state.developmentsWatchedOnly = target.dataset.value === 'watched';
        renderDevelopments();
      }
      if (action === 'watch-development') {
        const values = new Set(Array.isArray(state.developmentWatch) ? state.developmentWatch : []);
        if (values.has(target.dataset.storyId)) values.delete(target.dataset.storyId);
        else values.add(target.dataset.storyId);
        state.developmentWatch = [...values];
        writeJson(STORY_WATCH_KEY, state.developmentWatch);
        renderDevelopments();
      }
      if (action === 'media-section') {
        state.media.section = target.dataset.value || 'video';
        state.media.query = '';
        state.media.region = 'all';
        state.media.category = 'all';
        state.media.favoritesOnly = false;
        state.media.languages = [];
        state.media.source = 'all';
        renderMedia();
        writeAppHistory('push');
      }
      if (action === 'podcast-service-retry') {
        podcastServiceProbe = null;
        state.podcastService = 'checking';
        renderMedia();
      }
      if (action === 'media-language-all') {
        state.media.languages = [];
        state.media.source = 'all';
        renderMedia();
      }
      if (action === 'media-language') {
        const values = new Set(state.media.languages || []);
        if (values.has(target.dataset.value)) values.delete(target.dataset.value);
        else values.add(target.dataset.value);
        state.media.languages = [...values];
        state.media.source = 'all';
        renderMedia();
      }
      if (action === 'development-review-open') openDevelopmentReview(target.dataset.storyId || '');
      if (action === 'development-review-queue') openDevelopmentReviewQueue();
      if (action === 'development-review-status') {
        const now = new Date().toISOString();
        storeDevelopmentReviews(normalizedDevelopmentReviews().map(item => item.id === target.dataset.reviewId
          ? specialty.transitionDevelopmentReview(item, item.status === 'resolved' ? 'open' : 'resolved', now)
          : item));
        openDevelopmentReviewQueue();
        if (state.view === 'developments') renderDevelopments();
      }
      if (action === 'development-review-remove') {
        storeDevelopmentReviews(normalizedDevelopmentReviews().filter(item => item.id !== target.dataset.reviewId));
        openDevelopmentReviewQueue();
        if (state.view === 'developments') renderDevelopments();
      }
      if (action === 'development-review-export') {
        downloadText(
          `world-revolution-news-development-reviews-${new Date().toISOString().slice(0, 10)}.json`,
          `${JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), reviews: normalizedDevelopmentReviews() }, null, 2)}\n`,
          'application/json;charset=utf-8'
        );
      }
      if (action === 'video-section') {
        state.videoFilters.section = VIDEO_SECTION_KEYS[target.dataset.value] ? target.dataset.value : 'new';
        state.activeVideoId = '';
        renderMedia();
        writeAppHistory('push');
      }
      if (action === 'video-play') {
        const canonicalId = core.text(target.dataset.videoId);
        if (state.videoItems.some(item => item.canonicalId === canonicalId)) {
          state.activeVideoId = canonicalId;
          const history = (Array.isArray(state.videoHistory) ? state.videoHistory : [])
            .filter(item => core.text(item?.canonicalId || item) !== canonicalId);
          state.videoHistory = [{ canonicalId, viewedAt: new Date().toISOString() }, ...history].slice(0, 100);
          writeJson(VIDEO_HISTORY_KEY, state.videoHistory);
          renderMedia();
          writeAppHistory('push');
          window.setTimeout(() => document.querySelector('[data-video-player] button')?.focus(), 0);
        }
      }
      if (action === 'video-close') {
        state.activeVideoId = '';
        renderMedia();
      }
      if (action === 'video-watch-later') {
        const canonicalId = core.text(target.dataset.videoId);
        const saved = new Set(Array.isArray(state.videoWatchLater) ? state.videoWatchLater : []);
        if (saved.has(canonicalId)) saved.delete(canonicalId);
        else if (state.videoItems.some(item => item.canonicalId === canonicalId)) saved.add(canonicalId);
        state.videoWatchLater = [...saved].slice(-100);
        writeJson(VIDEO_WATCH_LATER_KEY, state.videoWatchLater);
        renderMedia();
      }
      if (action === 'video-history-clear') {
        state.videoHistory = [];
        localStorage.removeItem(VIDEO_HISTORY_KEY);
        renderMedia();
      }
      if (action === 'zine-panel') {
        state.media.zinePanel = target.dataset.value === 'stencils' ? 'stencils' : 'content';
        renderMedia();
        writeAppHistory('push');
      }
      if (action === 'zine-stencil-select') {
        state.media.stencilId = zineStencil(target.dataset.value).id;
        renderMedia();
      }
      if (action === 'zine-stencil-download') {
        const stencil = zineStencil();
        downloadText(`wrn-spruehschablone-${stencil.id}.svg`, stencilDownloadSvg(stencil), 'image/svg+xml;charset=utf-8');
      }
      if (action === 'zine-stencil-print') void printZineStencil();
      if (action === 'zine-remove') removeZineArticle(target.dataset.zineKey || '');
      if (action === 'zine-add-text') openZineEditor('', 'text');
      if (action === 'zine-add-image') openZineEditor('', 'image');
      if (action === 'zine-edit') openZineEditor(target.dataset.zineKey || '', 'article');
      if (action === 'zine-move') moveZineArticle(target.dataset.zineKey || '', Number(target.dataset.value || 0));
      if (action === 'zine-save-item') void saveZineEditor();
      if (action === 'zine-clear' && zineArticles().length && window.confirm(t('zineClearConfirm'))) {
        storeZineArticles([]);
        renderMedia();
      }
      if (action === 'saved-mode') {
        state.savedMode = target.dataset.value === 'read' ? 'read' : 'bookmarks';
        renderSaved();
        writeAppHistory('push');
      }
      if (action === 'daily-edition') openDailyEdition();
      if (action === 'daily-offline') void saveDailyEditionOffline();
      if (action === 'help-offline' && state.helpFilters.region) void saveSolidarityRegionOffline();
      if (action === 'help-clear') {
        state.helpFilters = { query: '', region: '', location: '', language: '', topic: '' };
        renderHelp();
        document.getElementById('next-help-query')?.focus();
      }
      if (action === 'help-submit') {
        const evidence = document.getElementById('next-help-evidence')?.value || '';
        const details = document.getElementById('next-help-details')?.value || '';
        if (!evidence || !details) return;
        state.localSolidarityDrafts.push(window.WRNSolidarityNetwork21.localSubmissionDraft({
          kind: 'correction', officialEvidenceUrls: [evidence], details
        }));
        document.getElementById('next-help-evidence').value = '';
        document.getElementById('next-help-details').value = '';
        showToast(t('helpPending'));
      }
      if (action === 'open-action-kit') {
        state.media.section = 'zine';
        state.media.zinePanel = 'stencils';
        changeView('media');
      }
      if (action === 'briefing-open') {
        if (menuDialog.open) menuDialog.close();
        openBriefing();
      }
      if (action === 'briefing-next') {
        collectBriefingStep();
        state.briefing.step = Math.min(3, state.briefing.step + 1);
        renderBriefingStep();
      }
      if (action === 'briefing-back') {
        collectBriefingStep();
        state.briefing.step = Math.max(1, state.briefing.step - 1);
        renderBriefingStep();
      }
      if (action === 'briefing-history-open') void openBriefingHistory(Number(target.dataset.index));
      if (action === 'briefing-history-clear') {
        state.briefingHistory = [];
        localStorage.removeItem(BRIEFING_HISTORY_KEY);
        renderBriefingStep();
      }
      if (action === 'briefing-listen') speakBriefing();
      if (action === 'briefing-resume-item') {
        state.briefing.progressIndex = Math.max(0, Math.min(state.briefing.items.length - 1, Number(target.dataset.index) || 0));
        state.briefing.historyItemIds = [];
        rememberBriefing();
        renderBriefingStep();
      }
      if (action === 'briefing-stop') {
        briefingSpeechGeneration += 1;
        window.speechSynthesis?.cancel?.();
        state.briefing.historyItemIds = [];
        rememberBriefing();
      }
    });

    document.getElementById('next-menu-toggle').addEventListener('click', () => menuDialog.showModal());
    document.querySelectorAll('[data-website-open]').forEach(button => {
      button.addEventListener('click', () => websiteDialog.showModal());
    });
    document.querySelectorAll('[data-website-close]').forEach(button => {
      button.addEventListener('click', () => websiteDialog.close());
    });
    document.getElementById('next-website-dialog-continue').addEventListener('click', () => websiteDialog.close());
    document.getElementById('next-menu-donate').addEventListener('click', () => {
      menuDialog.close();
      donationDialog.showModal();
    });
    document.querySelectorAll('[data-donation-close]').forEach(button => {
      button.addEventListener('click', () => donationDialog.close());
    });
    feedbackForm.addEventListener('submit', event => {
      event.preventDefault();
      void submitFeedbackDirectly();
    });

    document.getElementById('next-search-toggle').addEventListener('click', event => {
      const open = searchPanel.hidden;
      searchPanel.hidden = !open;
      event.currentTarget.setAttribute('aria-expanded', String(open));
      if (open) searchInput.focus();
    });

    document.getElementById('next-global-search').addEventListener('submit', event => {
      event.preventDefault();
      state.discover.query = searchInput.value.trim();
      state.discover.period = 'all';
      state.discover.limit = 24;
      searchPanel.hidden = true;
      document.getElementById('next-search-toggle').setAttribute('aria-expanded', 'false');
      changeView('discover');
      void loadSelectedSourceArchives();
    });

    viewRoot.addEventListener('input', event => {
      const id = event.target.id;
      if (!['next-discover-query', 'next-archive-source-query', 'next-event-query', 'next-lexicon-query', 'next-media-query', 'next-library-query', 'next-video-query', 'next-help-query'].includes(id)) return;
      if (id === 'next-discover-query') state.discover.query = event.target.value;
      if (id === 'next-archive-source-query') state.sourceArchive.sourceQuery = event.target.value;
      if (id === 'next-event-query') {
        state.eventFilter.query = event.target.value;
        state.eventFilter.limit = 60;
      }
      if (id === 'next-lexicon-query') state.lexicon.query = event.target.value;
      if (id === 'next-media-query') state.media.query = event.target.value;
      if (id === 'next-video-query') state.videoFilters.query = event.target.value;
      if (id === 'next-help-query') state.helpFilters.query = event.target.value;
      if (id === 'next-library-query') {
        state.library.query = event.target.value;
        state.library.limit = 30;
      }
      window.clearTimeout(bindEvents.searchTimer);
      if (id === 'next-discover-query') state.discover.limit = 24;
      bindEvents.searchTimer = window.setTimeout(() => {
        if (id === 'next-help-query') renderHelp();
        else if (id === 'next-event-query') renderEvents();
        else if (id === 'next-lexicon-query') renderLexicon();
        else if (['next-media-query', 'next-video-query'].includes(id)) renderMedia();
        else if (id === 'next-library-query') renderLibrary();
        else renderDiscover();
        const replacement = document.getElementById(id);
        replacement?.focus();
        replacement?.setSelectionRange(replacement.value.length, replacement.value.length);
      }, 180);
    });

    viewRoot.addEventListener('change', event => {
      const helpMap = {
        'next-help-region': 'region',
        'next-help-location': 'location',
        'next-help-language': 'language',
        'next-help-topic': 'topic'
      };
      if (helpMap[event.target.id]) {
        state.helpFilters[helpMap[event.target.id]] = event.target.value;
        renderHelp();
        document.getElementById(event.target.id)?.focus();
        return;
      }
      const discoverMap = {
        'next-discover-sort': 'sort',
        'next-discover-language': 'language',
        'next-discover-origin': 'origin',
        'next-discover-format': 'format',
        'next-discover-source': 'source'
      };
      if (discoverMap[event.target.id]) {
        state.discover[discoverMap[event.target.id]] = event.target.value;
        if (discoverMap[event.target.id] === 'source' && event.target.value !== 'all') {
          state.sourceArchive.selectedSources = [event.target.value];
        }
        state.discover.limit = 24;
        persistArchiveFilters();
        renderDiscover();
        void loadSelectedSourceArchives();
        return;
      }
      if (event.target.id === 'next-library-source') {
        state.library.source = event.target.value || 'all';
        state.library.limit = 30;
        renderLibrary();
        return;
      }
      if (event.target.id === 'next-library-format') {
        state.library.format = event.target.value || 'all';
        state.library.limit = 30;
        renderLibrary();
        return;
      }
      if (event.target.id === 'next-event-country') {
        state.eventFilter.country = event.target.value;
        state.eventFilter.limit = 60;
        renderEvents();
      }
      if (event.target.id === 'next-event-region') {
        state.eventFilter.regions = event.target.value === '__preferences__'
          ? [...new Set(state.preferences.regions || [])]
          : event.target.value
            ? [event.target.value]
            : [];
        state.eventFilter.limit = 60;
        renderEvents();
      }
      const eventMap = {
        'next-event-city': 'city',
        'next-event-category': 'category',
        'next-event-group': 'group',
        'next-event-date': 'date',
        'next-event-radius': 'radius'
      };
      if (eventMap[event.target.id]) {
        state.eventFilter[eventMap[event.target.id]] = eventMap[event.target.id] === 'radius'
          ? Number(event.target.value || 0)
          : event.target.value;
        state.eventFilter.limit = 60;
        renderEvents();
      }
      if (event.target.id === 'next-event-saved-filter') {
        applySavedEventFilter(event.target.value);
      }
      const videoFilterMap = {
        'next-video-language': 'language',
        'next-video-topic': 'topic',
        'next-video-region': 'region',
        'next-video-source': 'source',
        'next-video-platform': 'platform',
        'next-video-duration': 'duration',
        'next-video-sort': 'sort'
      };
      if (videoFilterMap[event.target.id]) {
        state.videoFilters[videoFilterMap[event.target.id]] = event.target.value;
        state.activeVideoId = '';
        renderMedia();
      }
      if (event.target.id === 'next-media-region') {
        state.media.region = event.target.value;
        renderMedia();
      }
      if (event.target.id === 'next-media-category') {
        state.media.category = event.target.value;
        renderMedia();
      }
      if (event.target.id === 'next-media-source') {
        state.media.source = event.target.value || 'all';
        renderMedia();
      }
      if (event.target.id === 'next-media-favorites-only') {
        state.media.favoritesOnly = event.target.checked;
        renderMedia();
      }
    });

    viewRoot.addEventListener('play', event => {
      if (!(event.target instanceof HTMLMediaElement)) return;
      viewRoot.querySelectorAll('audio, video').forEach(player => {
        if (player !== event.target && !player.paused) player.pause();
      });
    }, true);

    languageSelect.addEventListener('change', () => {
      state.language = supportedLanguage(languageSelect.value);
      window.currentLang = state.language;
      localStorage.setItem(LANGUAGE_KEY, state.language);
      applyLanguage();
      render();
      window.dispatchEvent(new CustomEvent('wrnlanguagechange', { detail: { language: state.language } }));
    });
    [themeSelect, fontSizeSelect, densitySelect].forEach(select => {
      select.addEventListener('change', saveUiSettings);
    });
    systemTheme?.addEventListener?.('change', () => {
      if (state.ui.theme === 'system') applyUiSettings();
    });

    document.querySelector('[data-dialog-close]').addEventListener('click', () => {
      stopArticlePodcast();
      closeArticleDialogWithHistory();
    });
    document.getElementById('next-dialog-save').addEventListener('click', () => {
      if (!state.activeArticle) return;
      toggleSaved(state.activeArticle);
      updateDialogSave();
    });
    document.getElementById('next-save-preferences').addEventListener('click', event => {
      event.preventDefault();
      savePreferences();
    });
    document.getElementById('next-preference-source-search').addEventListener('input', event => {
      filterPreferenceSources(event.target.value);
    });
    document.getElementById('next-data-import-file').addEventListener('change', event => {
      const file = event.target.files?.[0];
      void importDataBackup(file);
      event.target.value = '';
    });
    developmentReviewDialog?.addEventListener('submit', event => {
      if (event.target.id !== 'next-development-review-form') return;
      event.preventDefault();
      submitDevelopmentReview(event.target);
    });

    const articleContent = document.getElementById('next-article-content');
    articleContent.addEventListener('scroll', () => {
      if (state.activeArticle) storeReadingPosition(state.activeArticle, articleContent, false);
    }, { passive: true });

    document.getElementById('global-media-progress').addEventListener('input', event => {
      window.WRNMediaPlayer?.seek?.(event.target.value);
    });
    document.getElementById('global-media-back').addEventListener('click', () => window.WRNMediaPlayer?.skip?.(-15));
    document.getElementById('global-media-play').addEventListener('click', () => window.WRNMediaPlayer?.resume?.());
    document.getElementById('global-media-pause').addEventListener('click', () => window.WRNMediaPlayer?.pause?.());
    document.getElementById('global-media-forward').addEventListener('click', () => window.WRNMediaPlayer?.skip?.(30));
    document.getElementById('global-media-stop').addEventListener('click', () => window.WRNMediaPlayer?.stop?.());
    document.getElementById('global-media-close').addEventListener('click', () => window.WRNMediaPlayer?.stop?.());
    document.getElementById('global-media-speed').addEventListener('change', event => {
      window.WRNAudioTools?.setPlaybackRate?.(event.target.value);
    });
    document.getElementById('global-media-sleep').addEventListener('change', event => {
      window.WRNAudioTools?.setSleepTimer?.(event.target.value);
    });

    articleDialog.addEventListener('click', event => {
      if (event.target === articleDialog) {
        stopArticlePodcast();
        closeArticleDialogWithHistory();
      }
    });
    articleDialog.addEventListener('close', () => {
      if (state.activeArticle) storeReadingPosition(state.activeArticle, articleContent, true);
      stopArticlePodcast();
      stopArticleCloudPodcast();
      if (!restoringAppHistory) {
        window.requestAnimationFrame(() => restoreArticleReturnFocus());
      }
    });
    preferencesDialog.addEventListener('click', event => {
      if (event.target === preferencesDialog) preferencesDialog.close();
    });
    menuDialog.addEventListener('click', event => {
      if (event.target === menuDialog) menuDialog.close();
    });
    donationDialog.addEventListener('click', event => {
      if (event.target === donationDialog) donationDialog.close();
    });
    websiteDialog.addEventListener('click', event => {
      if (event.target === websiteDialog) websiteDialog.close();
    });
    feedbackDialog.addEventListener('click', event => {
      if (event.target === feedbackDialog) feedbackDialog.close();
    });
    briefingDialog.addEventListener('click', event => {
      if (event.target === briefingDialog) {
        window.speechSynthesis?.cancel?.();
        briefingDialog.close();
      }
    });
    developmentReviewDialog?.addEventListener('click', event => {
      if (event.target === developmentReviewDialog) developmentReviewDialog.close();
    });
    document.getElementById('next-release-dialog').addEventListener('click', event => {
      if (event.target.id === 'next-release-dialog') event.currentTarget.close();
    });
    document.getElementById('fb-overlay').addEventListener('click', event => {
      event.currentTarget.hidden = true;
      window.WRNSourceProfiles?.close?.();
    });
    document.addEventListener('click', event => {
      if (event.target?.id === 'source-profile-close') {
        document.getElementById('fb-overlay').hidden = true;
      }
    });

    const sourceVerificationModal = document.getElementById('wrn-source-verification-modal');
    if (sourceVerificationModal && 'MutationObserver' in window) {
      const repairGeneratedStatusText = () => {
        const walker = document.createTreeWalker(sourceVerificationModal, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          if (node.data.includes('unverÃ¤ndert')) {
            node.data = node.data.replaceAll('unverÃ¤ndert', 'unverändert');
          }
          node = walker.nextNode();
        }
      };
      new MutationObserver(repairGeneratedStatusText).observe(sourceVerificationModal, {
        childList: true,
        subtree: true,
        characterData: true
      });
      repairGeneratedStatusText();
    }
  }

  function versionedDataUrl(url, key, value) {
    const target = new URL(String(url || ''), window.location.href);
    target.searchParams.set(key, String(value || Date.now()));
    return target.href;
  }

  async function fetchJson(url, options = {}) {
    const requestUrl = options.cacheToken
      ? versionedDataUrl(url, options.cacheKey || 'wrn_refresh', options.cacheToken)
      : url;
    const controller = new AbortController();
    const externalSignal = options.signal;
    const abortFromExternal = () => controller.abort(externalSignal?.reason);
    if (externalSignal?.aborted) abortFromExternal();
    else externalSignal?.addEventListener?.('abort', abortFromExternal, { once: true });
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || 20000);
    try {
      const response = await fetch(requestUrl, {
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`${requestUrl}: HTTP ${response.status}`);
      const data = await response.json();
      if (options.includeResponseMetadata !== true) return data;
      return {
        data,
        responseMetadata: {
          syntheticSolidarityFallback: response.headers.get('X-WRN-Synthetic-Offline-Fallback') === 'solidarity-network-empty-v1'
        }
      };
    } finally {
      window.clearTimeout(timeout);
      externalSignal?.removeEventListener?.('abort', abortFromExternal);
    }
  }

  async function fetchFirstJson(urls, options = {}) {
    let lastError = null;
    for (const url of [...new Set(urls.filter(Boolean))]) {
      try {
        return await fetchJson(url, options);
      } catch (error) {
        lastError = error;
        console.warn('Data source unavailable; trying fallback', url, error);
      }
    }
    throw lastError || new Error('No data source configured');
  }

  async function fetchMergedJsonArrays(urls, options = {}) {
    const results = await Promise.allSettled(
      [...new Set(urls.filter(Boolean))].map(url => fetchJson(url, options))
    );
    const merged = new Map();
    let lastError = null;
    results.forEach(result => {
      if (result.status !== 'fulfilled') {
        lastError = result.reason;
        return;
      }
      if (!Array.isArray(result.value)) return;
      result.value.forEach(item => {
        const key = core.text(item?.id || [item?.sourceId, item?.title, item?.published].join(':'));
        if (key && !merged.has(key)) merged.set(key, item);
      });
    });
    if (merged.size) return [...merged.values()];
    throw lastError || new Error('No valid array data source configured');
  }

  async function loadGeneratedPodcasts(fallbackCandidates = []) {
    const proxyUrl = media.safeUrl(window.WRN_CONFIG?.proxyUrl);
    let workerItems = [];
    let fallbackItems = [];
    let workerAvailable = false;
    let fallbackAvailable = false;

    if (proxyUrl) {
      try {
        const libraryUrl = new URL(proxyUrl);
        libraryUrl.searchParams.set('action', 'podcasts.list');
        libraryUrl.searchParams.set('limit', '500');
        const payload = await fetchJson(libraryUrl.href);
        if (!Array.isArray(payload?.items)) {
          throw new Error('Generated podcast library returned an invalid response');
        }
        workerItems = payload.items;
        workerAvailable = true;
      } catch (error) {
        console.warn('Generated podcast library unavailable; using static fallback', error);
      }
    }

    let fallbackError = null;
    const fallbackUrls = [...new Set([
      ...(Array.isArray(fallbackCandidates) ? fallbackCandidates : [fallbackCandidates]),
      'generated-podcasts.json'
    ].filter(Boolean))];
    for (const url of fallbackUrls) {
      try {
        const fallback = await fetchJson(url);
        if (!Array.isArray(fallback)) throw new Error('Static generated podcast fallback is invalid');
        fallbackItems.push(...fallback);
        fallbackAvailable = true;
      } catch (error) {
        fallbackError = error;
        console.warn(`Static generated podcast fallback unavailable: ${url}`, error);
      }
    }

    if (!workerAvailable && !fallbackAvailable && fallbackError) throw fallbackError;
    if (!workerAvailable && !fallbackAvailable) return [];
    const now = Date.now();
    const merged = new Map();
    [...workerItems, ...fallbackItems].forEach(item => {
      const expiresAt = Date.parse(item?.expiresAt || '');
      if (Number.isFinite(expiresAt) && expiresAt <= now) return;
      const key = core.text(item?.id || item?.audioUrl);
      if (key && !merged.has(key)) merged.set(key, item);
    });
    return [...merged.values()].sort((first, second) =>
      Date.parse(second?.createdAt || second?.published || '') -
      Date.parse(first?.createdAt || first?.published || '')
    );
  }

  async function loadSpecialtyData() {
    state.lexiconSnapshot = window.WRNLexicon184?.snapshot?.() || { terms: [], sources: [] };
    const [solidarityNetworkResult, solidarityResourcesResult] = await Promise.allSettled([
      fetchJson('solidarity-network.json', { includeResponseMetadata: true }),
      fetchJson('solidarity-resources.json')
    ]);
    const solidarityPayload = solidarityNetworkResult.status === 'fulfilled' ? solidarityNetworkResult.value : null;
    state.solidarityNetwork = await window.WRNSolidarityNetwork21.resolveRegionalNetworkPayload(
      window.WRNStorage,
      solidarityPayload,
      solidarityNetworkResult.status === 'fulfilled'
    );
    state.solidarityResources = solidarityResourcesResult.status === 'fulfilled' && Array.isArray(solidarityResourcesResult.value?.resources)
      ? solidarityResourcesResult.value
      : { resources: [], editorialInputChecklist: [] };
    const dataUrls = window.WRN_CONFIG?.dataUrls || {};
    const dataMirrors = window.WRN_CONFIG?.dataMirrors || {};
    const [eventsResult, prisonersResult, solidarityActionsResult, podcastsResult, generatedResult, radioResult, radioHealthResult, sourceCatalogResult, librarySourcesResult, libraryFeedResult, editorialDecisionsResult, videoFeedResult, videoHealthResult] = await Promise.allSettled([
      fetchFirstJson([dataMirrors.events, dataUrls.events, 'events-feed.json']),
      fetchJson('prisoner-solidarity.json'),
      fetchJson('verified-solidarity-actions.json'),
      fetchMergedJsonArrays(['podcasts.json', dataUrls.podcasts, dataMirrors.podcasts]),
      loadGeneratedPodcasts([
        dataMirrors.generatedPodcasts,
        dataUrls.generatedPodcasts,
        'generated-podcasts.json'
      ]),
      fetchFirstJson([dataMirrors.radio, dataUrls.radio, 'radio-stations.json']),
      fetchFirstJson([dataMirrors.radioHealth, dataUrls.radioHealth, 'radio-health.json']),
      fetchFirstJson([dataMirrors.sourceCatalog, dataUrls.sourceCatalog, 'sources-registry.json']),
      fetchFirstJson([dataMirrors.librarySources, dataUrls.librarySources, 'library-sources.json']),
      fetchFirstJson([dataMirrors.libraryFeed, dataUrls.libraryFeed, 'library-feed.json']),
      fetchFirstJson([dataMirrors.editorialDecisions, dataUrls.editorialDecisions, 'editorial-decisions.json']),
      fetchFirstJson([dataMirrors.videoFeed, dataUrls.videoFeed, 'video-feed.json']),
      fetchFirstJson([dataMirrors.videoHealth, dataUrls.videoHealth, 'video-health.json'])
    ]);
    if (eventsResult.status === 'fulfilled') {
      state.events = specialty.collapseRecurringEvents(eventsResult.value);
      void window.WRNStorage?.putDataset?.('news-app-2-events', eventsResult.value);
    } else {
      console.warn('Events unavailable in preview', eventsResult.reason);
      const cachedEvents = await window.WRNStorage?.getDataset?.('news-app-2-events');
      state.events = Array.isArray(cachedEvents)
        ? specialty.collapseRecurringEvents(cachedEvents)
        : [];
    }
    if (prisonersResult.status === 'fulfilled' && Array.isArray(prisonersResult.value?.profiles)) {
      state.prisonerData = prisonersResult.value;
    } else {
      console.warn('Prisoner solidarity data unavailable in preview', prisonersResult.reason);
      state.prisonerData = { profiles: [], sources: [] };
    }
    state.solidarityActions = solidarityActionsResult.status === 'fulfilled' && Array.isArray(solidarityActionsResult.value?.actions)
      ? solidarityActionsResult.value.actions
      : [];
    if (solidarityActionsResult.status !== 'fulfilled') {
      console.warn('Structured solidarity actions unavailable; no action is presented as verified', solidarityActionsResult.reason);
    }
    state.podcasts = podcastsResult.status === 'fulfilled' && Array.isArray(podcastsResult.value)
      ? podcastsResult.value.map(media.normalizePodcast).sort((a, b) => b.timestamp - a.timestamp)
      : [];
    state.generatedPodcasts = generatedResult.status === 'fulfilled' && Array.isArray(generatedResult.value)
      ? generatedResult.value.map(media.normalizePodcast).sort((a, b) => b.timestamp - a.timestamp)
      : [];
    const radioHealth = radioHealthResult.status === 'fulfilled' && radioHealthResult.value
      ? radioHealthResult.value
      : {};
    state.radioStations = radioResult.status === 'fulfilled' && Array.isArray(radioResult.value)
      ? radioResult.value.map(item => {
        const health = radioHealth[item.id] || {};
        return media.normalizeRadio({
          ...item,
          streamCandidates: health.ok && health.workingStream ? [health.workingStream] : [],
          healthStatus: health.status || item.healthStatus
        });
      })
      : [];
    state.videoItems = videoFeedResult.status === 'fulfilled' && Array.isArray(videoFeedResult.value?.items)
      ? videoFeedResult.value.items.filter(item => item?.canonicalId && item?.originalUrl)
      : [];
    state.videoHealth = videoHealthResult.status === 'fulfilled' && videoHealthResult.value
      ? videoHealthResult.value
      : { schemaVersion: 1, status: 'unavailable', itemHealth: [] };
    if (sourceCatalogResult.status === 'fulfilled') {
      state.sourceCatalog = sourceCatalogResult.value;
      state.sourceIndex = release.sourceIndex(sourceCatalogResult.value);
    } else {
      state.sourceCatalog = null;
      state.sourceIndex = release.sourceIndex([]);
      console.warn('Source catalog unavailable in preview', sourceCatalogResult.reason);
    }
    if (librarySourcesResult.status === 'fulfilled' && Array.isArray(librarySourcesResult.value)) {
      state.librarySources = librarySourcesResult.value.filter(source => source?.id && source?.status !== 'disabled');
      void window.WRNStorage?.putDataset?.('news-app-2-library-sources', state.librarySources);
    } else {
      state.librarySources = await window.WRNStorage?.getDataset?.('news-app-2-library-sources') || [];
      console.warn('Library source registry unavailable in preview', librarySourcesResult.reason);
    }
    if (libraryFeedResult.status === 'fulfilled' && Array.isArray(libraryFeedResult.value)) {
      state.libraryItems = libraryFeedResult.value.filter(item => item?.id && item?.title);
      void window.WRNStorage?.putDataset?.('news-app-2-library-feed', state.libraryItems);
    } else {
      state.libraryItems = await window.WRNStorage?.getDataset?.('news-app-2-library-feed') || [];
      console.warn('Library catalogue unavailable in preview', libraryFeedResult.reason);
    }
    if (editorialDecisionsResult.status === 'fulfilled') {
      state.editorialDecisions = editorialDecisionsResult.value;
      state.articles = core.applyEditorialDecisions(state.articles, state.editorialDecisions);
      state.facets = core.collectFacets(state.articles);
    } else {
      console.warn('Shared editorial decisions unavailable', editorialDecisionsResult.reason);
    }
    window.WRNSourceProfiles?.setArticles?.(state.articles);
    window.WRNSourceProfiles?.loadCatalog?.(false);
  }

  async function ensureAllEventsLoaded() {
    if (state.eventArchiveLoaded || state.eventArchiveLoading) return;
    state.eventArchiveLoading = true;
    if (state.view === 'events') renderEvents();
    const dataUrls = window.WRN_CONFIG?.dataUrls || {};
    const dataMirrors = window.WRN_CONFIG?.dataMirrors || {};
    try {
      const archive = await fetchFirstJson([
        dataMirrors.eventArchive,
        dataUrls.eventArchive,
        'events.json'
      ], { timeoutMs: 90000 });
      if (!Array.isArray(archive)) throw new Error('Complete event archive is invalid');
      state.events = specialty.collapseRecurringEvents(archive);
      state.eventArchiveLoaded = true;
      checkEventReminders();
    } catch (error) {
      console.warn('Complete Radar event archive unavailable; quick event feed remains active', error);
    } finally {
      state.eventArchiveLoading = false;
      if (state.view === 'events') renderEvents();
    }
  }

  function liveNewsSources() {
    const config = window.WRN_CONFIG || {};
    if (!String(config.dataMode || '').startsWith('live-')) return [];
    const urls = config.dataUrls || {};
    const mirrors = config.dataMirrors || {};
    return [
      { source: 'github-main', status: mirrors.feedStatus, feed: mirrors.newsFeed },
      { source: 'github-pages', status: urls.feedStatus, feed: urls.newsFeed }
    ].filter(item => item.status && item.feed);
  }

  function normalizedNewsPayload(candidate, payload) {
    const articles = core.normalizeArticles(payload);
    if (!articles.length) throw new Error(`No articles in ${candidate.url}`);
    const feedBaseUrl = new URL(candidate.url, window.location.href);
    articles.forEach(article => {
      if (article.detailPath) article.detailUrl = new URL(article.detailPath, feedBaseUrl).href;
    });
    const completeArticles = articles.filter(core.hasCompleteArticle);
    if (!completeArticles.length) throw new Error(`No complete articles in ${candidate.url}`);
    return completeArticles;
  }

  function applyNewsPayload(candidate, payload) {
    const completeArticles = normalizedNewsPayload(candidate, payload);
    state.articles = completeArticles;
    state.sourceArchive.loadedSources.clear();
    state.sourceArchive.failedSources.clear();
    state.facets = core.collectFacets(completeArticles);
    state.dataStatus = candidate.live
      ? {
          mode: 'live',
          source: candidate.source,
          revision: candidate.revision,
          generatedAt: candidate.generatedAt,
          lastSuccessfulFetchAt: candidate.lastSuccessfulFetchAt,
          lastPublishedAt: candidate.lastPublishedAt,
          newestArticleAt: candidate.newestArticleAt,
          publishPending: candidate.publishPending
        }
      : {
          mode: window.WRN_CONFIG?.dataMode === 'branch-snapshot' ? 'snapshot' : 'offline',
          source: candidate.source,
          revision: '',
          generatedAt: '',
          lastSuccessfulFetchAt: '',
          lastPublishedAt: '',
          newestArticleAt: '',
          publishPending: false
        };
    if (candidate.source !== 'indexeddb-cache') {
      void window.WRNStorage?.putDataset?.('news-app-2-news', payload);
    }
    lastSuccessfulDataLoad = Date.now();
    return completeArticles;
  }

  function scheduleSpecialtyHydration() {
    if (specialtyDataReady) return Promise.resolve();
    if (specialtyHydrationPromise) return specialtyHydrationPromise;
    specialtyHydrationPromise = (async () => {
      await loadSpecialtyData();
      await refreshBriefingOfflineStates();
      await loadSelectedSourceArchives();
      specialtyDataReady = true;
      render();
    })().catch(error => {
      console.warn('Supplemental app data unavailable; news view remains usable', error);
    }).finally(() => {
      specialtyHydrationPromise = null;
    });
    return specialtyHydrationPromise;
  }

  async function readStoredNewsWithinBudget() {
    let timeout = 0;
    try {
      return await Promise.race([
        Promise.resolve(window.WRNStorage?.getDataset?.('news-app-2-news')),
        new Promise(resolve => {
          timeout = window.setTimeout(() => resolve(null), INDEXEDDB_STARTUP_BUDGET_MS);
        })
      ]);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function loadLiveNewsWithinBudget() {
    const sources = liveNewsSources();
    if (!sources.length) return null;
    const checkedAt = Date.now();
    const controller = new AbortController();
    const budgetTimer = window.setTimeout(() => controller.abort(), LIVE_STARTUP_BUDGET_MS);
    try {
      const checked = await Promise.allSettled(sources.map(async item => {
        const statusPromise = fetchJson(item.status, {
          cacheKey: 'wrn_status',
          cacheToken: checkedAt,
          timeoutMs: LIVE_STARTUP_BUDGET_MS,
          signal: controller.signal
        }).catch(error => {
          console.warn('Live feed status unavailable', item.status, error);
          return null;
        });
        const feedPromise = fetchJson(item.feed, {
          cacheKey: 'wrn_revision',
          cacheToken: checkedAt,
          timeoutMs: LIVE_STARTUP_BUDGET_MS,
          signal: controller.signal
        });
        const [status, payload] = await Promise.all([statusPromise, feedPromise]);
        const generatedAt = String(status?.generatedAt || '');
        const lastPublishedAt = String(status?.lastPublishedAt || generatedAt);
        const parsedGeneratedTime = Date.parse(lastPublishedAt);
        const statusOk = status?.ok === true && Number.isFinite(parsedGeneratedTime);
        const candidate = {
          ...item,
          live: true,
          url: item.feed,
          generatedAt: statusOk ? generatedAt : '',
          lastPublishedAt: statusOk ? lastPublishedAt : '',
          lastSuccessfulFetchAt: statusOk ? String(
            status?.lastSuccessfulFetchAt || status?.aggregation?.finishedAt || generatedAt
          ) : '',
          newestArticleAt: statusOk ? String(status?.news?.newestArticleAt || '') : '',
          publishPending: statusOk && status?.publication?.pending === true,
          generatedTime: statusOk ? parsedGeneratedTime : 0,
          revision: statusOk ? lastPublishedAt : `retry-${checkedAt}`,
          statusOk
        };
        normalizedNewsPayload(candidate, payload);
        return {
          candidate,
          payload
        };
      }));
      const available = checked
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        .sort((first, second) => {
          if (first.candidate.statusOk !== second.candidate.statusOk) {
            return first.candidate.statusOk ? -1 : 1;
          }
          return second.candidate.generatedTime - first.candidate.generatedTime;
        });
      if (available.length) return available[0];
      const failed = checked.find(result => result.status === 'rejected');
      throw failed?.reason || new Error('No live news feed completed within the shared budget');
    } finally {
      window.clearTimeout(budgetTimer);
      controller.abort();
    }
  }

  async function loadData({ background = false } = {}) {
    if (dataRefreshInFlight) return false;
    dataRefreshInFlight = true;
    try {
      if (!background) {
        loading.hidden = false;
        viewRoot.innerHTML = '';
      }
      const liveAttempt = loadLiveNewsWithinBudget().then(
        value => ({ value, error: null }),
        error => ({ value: null, error })
      );
      let lastError = null;
      let renderedLocalData = false;

      if (!background) {
        try {
          const offlinePayload = await readStoredNewsWithinBudget();
          applyNewsPayload({
            live: false,
            source: 'indexeddb-cache',
            url: window.WRN_CONFIG?.dataUrls?.newsFeed || 'news-feed.json'
          }, offlinePayload);
          render();
          renderedLocalData = true;
          void scheduleSpecialtyHydration();
        } catch (error) {
          lastError = error;
        }

        if (!renderedLocalData) {
          const packagedCandidates = [
            { live: false, source: 'packaged-feed', url: 'news-feed.json' },
            { live: false, source: 'packaged-archive', url: 'news.json' }
          ];
          for (const candidate of packagedCandidates) {
            try {
              const payload = await fetchJson(candidate.url, { timeoutMs: PACKAGED_FEED_TIMEOUT_MS });
              applyNewsPayload(candidate, payload);
              render();
              renderedLocalData = true;
              void scheduleSpecialtyHydration();
              break;
            } catch (error) {
              lastError = error;
              console.warn('Packaged news source unavailable', candidate.url, error);
            }
          }
        }
      }

      const liveResult = await liveAttempt;
      if (liveResult.value) {
        const { candidate, payload } = liveResult.value;
        if (
          candidate.statusOk
          && state.dataStatus.mode === 'live'
          && candidate.revision === state.dataStatus.revision
        ) {
          lastSuccessfulDataLoad = Date.now();
          return true;
        }
        applyNewsPayload(candidate, payload);
        render();
        void scheduleSpecialtyHydration();
        return true;
      }
      lastError = liveResult.error || lastError;

      if (renderedLocalData) return true;

      console.error('News App 2 could not load data', lastError);
      if (!background || !state.articles.length) {
        loading.hidden = true;
        renderError();
      }
      return false;
    } finally {
      dataRefreshInFlight = false;
    }
  }

  function refreshLiveData(force = false) {
    if (document.hidden || dataRefreshInFlight) return;
    const stale = Date.now() - lastSuccessfulDataLoad >= LIVE_DATA_REFRESH_INTERVAL_MS;
    if (force || stale) void loadData({ background: true });
  }

  window.filterBySource = source => {
    state.discover.source = String(source || 'all');
    state.discover.period = 'all';
    state.sourceArchive.selectedSources = state.discover.source === 'all' ? [] : [state.discover.source];
    state.discover.limit = 24;
    persistArchiveFilters();
    document.getElementById('fb-overlay').hidden = true;
    changeView('discover');
  };

  window.addEventListener('popstate', event => {
    const closedArticle = articleDialog.open;
    const snapshot = event.state;
    if (!snapshot?.wrnAppNavigation) return;
    restoringAppHistory = true;
    try {
      if (closedArticle) articleDialog.close();
      state.view = snapshot.view || 'home';
      state.media.section = snapshot.mediaSection || state.media.section;
      state.media.zinePanel = snapshot.zinePanel || state.media.zinePanel;
      state.lexicon.section = snapshot.lexiconSection || state.lexicon.section;
      state.prisoners.section = snapshot.prisonerSection || state.prisoners.section;
      state.savedMode = snapshot.savedMode || state.savedMode;
      state.videoFilters.section = snapshot.videoSection || state.videoFilters.section;
      state.activeVideoId = snapshot.activeVideoId || '';
      render();
      window.requestAnimationFrame(() => {
        if (closedArticle && restoreArticleReturnFocus()) return;
        document.getElementById('next-main')?.focus({ preventScroll: true });
      });
    } finally {
      restoringAppHistory = false;
    }
  });

  applyUiSettings();
  applyLanguage();
  bindEvents();
  writeAppHistory('replace');
  writeJson(LAST_VISIT_KEY, currentVisitStartedAt);
  void window.WRNStorage?.migrateLegacyLocalStorage?.();
  void loadOfflineBookmarks();
  void loadData();
  checkEventReminders();
  window.setInterval(checkEventReminders, 60 * 1000);
  window.setInterval(refreshLiveData, LIVE_DATA_REFRESH_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshLiveData();
  });
  window.addEventListener('focus', () => refreshLiveData());
  window.addEventListener('online', () => refreshLiveData(true));
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(isProduction ? './service-worker.js' : './news-app-2-sw.js', {
        scope: './',
        updateViaCache: 'none'
      }).catch(error => console.warn('Preview offline cache unavailable', error));
    }, { once: true });
  }
})();
