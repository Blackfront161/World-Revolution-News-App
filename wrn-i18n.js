/* World Revolution News 1.8.1 – Entwicklungen, Video, Audio und vollständige Sprachen */
'use strict';

(() => {
  if (window.WRNI18n) return;

  const SUPPORTED_LANGUAGES = Object.freeze(['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']);
  const LANGUAGE_LABELS = Object.freeze({
    de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français', it: 'Italiano',
    pt: 'Português', ru: 'Русский', el: 'Ελληνικά', tr: 'Türkçe'
  });

  const EN = {
    nav: {
      briefing: 'Briefing', stories: 'Developments', video: 'Video', start: 'Start', regions: 'Regions', topics: 'Topics', events: 'Events',
      audio: 'Audio', saved: 'Saved', zine: 'Zine', more: 'More', search: 'Search',
      searchPlaceholder: 'Search articles…', menu: 'Sources', settings: 'More & settings',
      sources: 'Sources', back: 'Back', article: 'Article', language: 'Language', design: 'Design',
      fontSize: 'Font size', view: 'Article view', format: 'Format', sort: 'Sorting', info: 'Info',
      contact: 'Contact', donate: 'Donate', storage: 'Storage', status: 'Status', clear: 'Clear cache',
      originalPodcasts: 'Original podcasts', generatedPodcasts: 'Generated podcasts', liveRadio: 'Live radio',
      bookmarks: 'Read later', read: 'Read'
    },
    briefing: {
      title: 'Briefing', today: 'Today', setupTitle: 'Set up your daily briefing',
      setupIntro: 'Choose at least one topic or region. Nothing is generated until you confirm.',
      topicsQuestion: 'Which topics do you want to keep in view?',
      regionsQuestion: 'Which world regions do you want to follow?',
      language: 'Briefing language', length: 'Length', short: 'Short · about 3 minutes',
      standard: 'Standard · about 5 minutes', long: 'Detailed · about 8–10 minutes',
      includeTitle: 'Include in the briefing', includeEvents: 'Events and actions',
      includeBackground: 'Background and archive', includeConnections: 'International connections',
      avoidRead: 'Prefer unread developments', create: 'Create briefing', update: 'Update briefing',
      settings: 'Briefing settings', close: 'Close', reset: 'Reset briefing',
      resetConfirm: 'Delete briefing settings, history and listening position?',
      noneSelected: 'Select at least one topic or region.', loading: 'Creating your briefing…',
      loadingTranslation: 'Translating the briefing…', empty: 'No matching content was found today.',
      noPersonalization: 'No briefing is generated until you choose topics or regions and confirm.',
      history: 'Previous briefings', listen: 'Listen', pause: 'Pause', resume: 'Resume', stop: 'Stop',
      voice: 'Device voice', speed: 'Speed', pitch: 'Pitch',
      deviceVoiceNote: 'Uses the free voices installed on this device. No audio file is uploaded.',
      noVoice: 'No matching device voice was found. Text remains available.',
      overview: 'Today at a glance', underRadar: 'Under the radar', connections: 'Connections',
      events: 'Events and actions', background: 'Background', why: 'Why this appears', sources: 'Sources',
      generatedAt: 'Created', offline: 'Offline copy', stale: 'Saved briefing from', readTime: 'Reading time',
      listenTime: 'Listening time', share: 'Share briefing', more: 'More like this', less: 'Less like this',
      updated: 'Updated', newLabel: 'New', openArticle: 'Open article in the app',
      translationFallback: 'Some entries could not be translated and remain in their original language.',
      source: 'Source', sourcePlural: 'Sources', continueReading: 'Continue reading', continueListening: 'Continue listening',
      refreshOnceDaily: 'Automatically refreshed once per day when the app is opened.',
      settingsSaved: 'Settings saved.', resetDone: 'Briefing was reset.',
      reasonTopic: 'Topic', reasonRegion: 'Region', reasonUnread: 'Not read yet', reasonEvent: 'Upcoming event',
      feedbackSaved: 'Your local selection was adjusted.', previous: 'Previous', next: 'Next',
      allTopics: 'All selected topics', globalRegion: 'Worldwide', personalizationPrivate: 'Your selection stays on this device.',
      exportSettings: 'Export settings', importSettings: 'Import settings', importInvalid: 'The selected settings file is invalid.',
      importSuccess: 'Settings imported.', sourceHidden: 'Source hidden from future briefings.', hideSource: 'Show this source less often'
    }
  };

  const OVERRIDES = {
    de: {
      nav: {
        briefing: 'Briefing', stories: 'Entwicklungen', video: 'Video', start: 'Start', regions: 'Regionen', topics: 'Themen', events: 'Termine',
        audio: 'Audio', saved: 'Gespeichert', zine: 'Zine', more: 'Mehr', search: 'Suche',
        searchPlaceholder: 'Artikel durchsuchen…', menu: 'Quellen', settings: 'Mehr & Einstellungen',
        sources: 'Quellen', back: 'Zurück', article: 'Artikel', language: 'Sprache', design: 'Design',
        fontSize: 'Schriftgröße', view: 'Artikelansicht', format: 'Format', sort: 'Sortierung', info: 'Info',
        contact: 'Kontakt', donate: 'Spenden', storage: 'Speicher', status: 'Status', clear: 'Cache leeren',
        originalPodcasts: 'Original-Podcasts', generatedPodcasts: 'Erzeugte Podcasts', liveRadio: 'Live-Radio',
        bookmarks: 'Später lesen', read: 'Gelesen'
      },
      briefing: {
        title: 'Briefing', today: 'Heute', setupTitle: 'Tägliches Briefing einrichten',
        setupIntro: 'Wähle mindestens ein Thema oder eine Region. Vor der Bestätigung wird nichts erzeugt.',
        topicsQuestion: 'Welche Themen möchtest du im Blick behalten?',
        regionsQuestion: 'Welche Weltregionen möchtest du verfolgen?',
        language: 'Briefing-Sprache', length: 'Umfang', short: 'Kurz · etwa 3 Minuten',
        standard: 'Standard · etwa 5 Minuten', long: 'Ausführlich · etwa 8–10 Minuten',
        includeTitle: 'In das Briefing aufnehmen', includeEvents: 'Termine und Aktionen',
        includeBackground: 'Hintergrund und Archiv', includeConnections: 'Internationale Zusammenhänge',
        avoidRead: 'Ungelesene Entwicklungen bevorzugen', create: 'Briefing erstellen', update: 'Briefing aktualisieren',
        settings: 'Briefing-Einstellungen', close: 'Schließen', reset: 'Briefing zurücksetzen',
        resetConfirm: 'Briefing-Einstellungen, Verlauf und Hörposition wirklich löschen?',
        noneSelected: 'Wähle mindestens ein Thema oder eine Region aus.', loading: 'Dein Briefing wird erstellt…',
        loadingTranslation: 'Das Briefing wird übersetzt…', empty: 'Heute wurden keine passenden Inhalte gefunden.',
        noPersonalization: 'Solange keine Themen oder Regionen bestätigt wurden, wird kein Briefing erzeugt.',
        history: 'Frühere Briefings', listen: 'Anhören', pause: 'Pause', resume: 'Fortsetzen', stop: 'Stopp',
        voice: 'Gerätestimme', speed: 'Geschwindigkeit', pitch: 'Tonhöhe',
        deviceVoiceNote: 'Verwendet die dauerhaft kostenlosen Stimmen des Geräts. Es wird keine Audiodatei hochgeladen.',
        noVoice: 'Keine passende Gerätestimme gefunden. Die Textfassung bleibt verfügbar.',
        overview: 'Heute im Überblick', underRadar: 'Unter dem Radar', connections: 'Zusammenhänge',
        events: 'Termine und Aktionen', background: 'Hintergrund', why: 'Warum wird mir das gezeigt?', sources: 'Quellen',
        generatedAt: 'Erstellt', offline: 'Offline-Kopie', stale: 'Gespeichertes Briefing vom', readTime: 'Lesezeit',
        listenTime: 'Hörzeit', share: 'Briefing teilen', more: 'Mehr davon', less: 'Weniger davon',
        updated: 'Aktualisiert', newLabel: 'Neu', openArticle: 'Artikel in der App öffnen',
        translationFallback: 'Einige Einträge konnten nicht übersetzt werden und bleiben in der Originalsprache.',
        source: 'Quelle', sourcePlural: 'Quellen', continueReading: 'Weiterlesen', continueListening: 'Weiterhören',
        refreshOnceDaily: 'Wird beim Öffnen der App höchstens einmal täglich aktualisiert.',
        settingsSaved: 'Einstellungen gespeichert.', resetDone: 'Das Briefing wurde zurückgesetzt.',
        reasonTopic: 'Thema', reasonRegion: 'Region', reasonUnread: 'Noch nicht gelesen', reasonEvent: 'Kommender Termin',
        feedbackSaved: 'Deine lokale Auswahl wurde angepasst.', previous: 'Zurück', next: 'Weiter',
        allTopics: 'Alle ausgewählten Themen', globalRegion: 'Weltweit', personalizationPrivate: 'Deine Auswahl bleibt auf diesem Gerät.',
        exportSettings: 'Einstellungen exportieren', importSettings: 'Einstellungen importieren', importInvalid: 'Die gewählte Einstellungsdatei ist ungültig.',
        importSuccess: 'Einstellungen importiert.', sourceHidden: 'Die Quelle wird künftig seltener gezeigt.', hideSource: 'Diese Quelle seltener zeigen'
      }
    },
    es: {
      nav: {
        briefing:'Resumen', stories:'Desarrollos', video:'Vídeo', start:'Inicio', regions:'Regiones', topics:'Temas', events:'Eventos', audio:'Audio', saved:'Guardado', zine:'Fanzine', search:'Buscar', searchPlaceholder:'Buscar artículos…', settings:'Más y ajustes', sources:'Fuentes', back:'Atrás', article:'Artículo', language:'Idioma', design:'Diseño', fontSize:'Tamaño de letra', view:'Vista', format:'Formato', sort:'Orden', info:'Información', contact:'Contacto', donate:'Donar', storage:'Almacenamiento', status:'Estado', clear:'Vaciar caché', originalPodcasts:'Pódcasts originales', generatedPodcasts:'Pódcasts generados', liveRadio:'Radio en directo', bookmarks:'Leer después', read:'Leído'
      },
      briefing: {
        title:'Resumen', today:'Hoy', setupTitle:'Configura tu resumen diario', setupIntro:'Elige al menos un tema o una región. No se genera nada hasta confirmar.', topicsQuestion:'¿Qué temas quieres seguir?', regionsQuestion:'¿Qué regiones del mundo quieres seguir?', language:'Idioma del resumen', length:'Duración', short:'Corto · unos 3 minutos', standard:'Estándar · unos 5 minutos', long:'Detallado · 8–10 minutos', includeTitle:'Incluir', includeEvents:'Eventos y acciones', includeBackground:'Contexto y archivo', includeConnections:'Conexiones internacionales', avoidRead:'Priorizar novedades no leídas', create:'Crear resumen', update:'Actualizar resumen', settings:'Ajustes del resumen', close:'Cerrar', reset:'Restablecer resumen', resetConfirm:'¿Borrar ajustes, historial y posición de audio?', noneSelected:'Elige al menos un tema o una región.', loading:'Creando tu resumen…', loadingTranslation:'Traduciendo el resumen…', empty:'Hoy no se encontró contenido adecuado.', noPersonalization:'No se genera ningún resumen hasta que confirmes temas o regiones.', history:'Resúmenes anteriores', listen:'Escuchar', pause:'Pausa', resume:'Continuar', stop:'Detener', voice:'Voz del dispositivo', speed:'Velocidad', pitch:'Tono', deviceVoiceNote:'Usa las voces gratuitas instaladas en el dispositivo. No se sube audio.', noVoice:'No se encontró una voz adecuada. El texto sigue disponible.', overview:'Lo esencial de hoy', underRadar:'Bajo el radar', connections:'Conexiones', events:'Eventos y acciones', background:'Contexto', why:'Por qué aparece', sources:'Fuentes', generatedAt:'Creado', offline:'Copia sin conexión', stale:'Resumen guardado del', readTime:'Tiempo de lectura', listenTime:'Tiempo de escucha', share:'Compartir resumen', more:'Más de esto', less:'Menos de esto', updated:'Actualizado', newLabel:'Nuevo', openArticle:'Abrir artículo en la app', translationFallback:'Algunas entradas no pudieron traducirse.', continueReading:'Seguir leyendo', continueListening:'Seguir escuchando', refreshOnceDaily:'Se actualiza una vez al día al abrir la app.', settingsSaved:'Ajustes guardados.', resetDone:'Resumen restablecido.', reasonTopic:'Tema', reasonRegion:'Región', reasonUnread:'Aún no leído', reasonEvent:'Próximo evento', feedbackSaved:'Tu selección local se ha ajustado.', personalizationPrivate:'Tu selección permanece en este dispositivo.', exportSettings:'Exportar ajustes', importSettings:'Importar ajustes', importInvalid:'El archivo no es válido.', importSuccess:'Ajustes importados.', hideSource:'Mostrar esta fuente con menos frecuencia'
      }
    },
    fr: {
      nav: {
        briefing:'Briefing', stories:'Évolutions', video:'Vidéo', start:'Accueil', regions:'Régions', topics:'Thèmes', events:'Événements', audio:'Audio', saved:'Enregistré', zine:'Zine', search:'Recherche', searchPlaceholder:'Rechercher des articles…', settings:'Plus et réglages', sources:'Sources', back:'Retour', article:'Article', language:'Langue', design:'Design', fontSize:'Taille du texte', view:'Affichage', format:'Format', sort:'Tri', info:'Info', contact:'Contact', donate:'Soutenir', storage:'Stockage', status:'État', clear:'Vider le cache', originalPodcasts:'Podcasts originaux', generatedPodcasts:'Podcasts générés', liveRadio:'Radio en direct', bookmarks:'À lire plus tard', read:'Lu'
      },
      briefing: {
        title:'Briefing', today:"Aujourd’hui", setupTitle:'Configurer le briefing quotidien', setupIntro:'Choisissez au moins un thème ou une région. Rien ne sera créé avant confirmation.', topicsQuestion:'Quels thèmes souhaitez-vous suivre ?', regionsQuestion:'Quelles régions du monde souhaitez-vous suivre ?', language:'Langue du briefing', length:'Durée', short:'Court · environ 3 minutes', standard:'Standard · environ 5 minutes', long:'Détaillé · 8–10 minutes', includeTitle:'Inclure', includeEvents:'Événements et actions', includeBackground:'Contexte et archives', includeConnections:'Liens internationaux', avoidRead:'Privilégier les nouveautés non lues', create:'Créer le briefing', update:'Actualiser le briefing', settings:'Réglages du briefing', close:'Fermer', reset:'Réinitialiser le briefing', resetConfirm:'Supprimer les réglages, l’historique et la position audio ?', noneSelected:'Choisissez au moins un thème ou une région.', loading:'Création de votre briefing…', loadingTranslation:'Traduction du briefing…', empty:"Aucun contenu correspondant aujourd’hui.", noPersonalization:'Aucun briefing ne sera créé avant votre confirmation.', history:'Briefings précédents', listen:'Écouter', pause:'Pause', resume:'Reprendre', stop:'Arrêter', voice:'Voix de l’appareil', speed:'Vitesse', pitch:'Hauteur', deviceVoiceNote:'Utilise les voix gratuites installées sur cet appareil. Aucun audio n’est envoyé.', noVoice:'Aucune voix adaptée. Le texte reste disponible.', overview:"L’essentiel aujourd’hui", underRadar:'Sous les radars', connections:'Liens', events:'Événements et actions', background:'Contexte', why:'Pourquoi cet élément apparaît', sources:'Sources', generatedAt:'Créé', offline:'Copie hors ligne', stale:'Briefing enregistré du', readTime:'Temps de lecture', listenTime:'Temps d’écoute', share:'Partager', more:'Plus de ce type', less:'Moins de ce type', updated:'Actualisé', newLabel:'Nouveau', openArticle:"Ouvrir l’article dans l’app", translationFallback:'Certaines entrées n’ont pas pu être traduites.', continueReading:'Reprendre la lecture', continueListening:'Reprendre l’écoute', refreshOnceDaily:"Actualisé une fois par jour à l’ouverture de l’app.", settingsSaved:'Réglages enregistrés.', resetDone:'Briefing réinitialisé.', reasonTopic:'Thème', reasonRegion:'Région', reasonUnread:'Pas encore lu', reasonEvent:'Événement à venir', feedbackSaved:'Votre sélection locale a été ajustée.', personalizationPrivate:'Votre sélection reste sur cet appareil.', exportSettings:'Exporter les réglages', importSettings:'Importer les réglages', importInvalid:'Le fichier sélectionné est invalide.', importSuccess:'Réglages importés.', hideSource:'Afficher cette source moins souvent'
      }
    },
    it: {
      nav: {
        briefing:'Briefing', stories:'Sviluppi', video:'Video', start:'Inizio', regions:'Regioni', topics:'Temi', events:'Eventi', audio:'Audio', saved:'Salvati', zine:'Zine', search:'Cerca', searchPlaceholder:'Cerca articoli…', settings:'Altro e impostazioni', sources:'Fonti', back:'Indietro', article:'Articolo', language:'Lingua', design:'Design', fontSize:'Dimensione testo', view:'Vista', format:'Formato', sort:'Ordine', info:'Info', contact:'Contatto', donate:'Dona', storage:'Archivio', status:'Stato', clear:'Svuota cache', originalPodcasts:'Podcast originali', generatedPodcasts:'Podcast generati', liveRadio:'Radio dal vivo', bookmarks:'Leggi dopo', read:'Letto'
      },
      briefing: {
        title:'Briefing', today:'Oggi', setupTitle:'Configura il briefing quotidiano', setupIntro:'Scegli almeno un tema o una regione. Non viene creato nulla prima della conferma.', topicsQuestion:'Quali temi vuoi seguire?', regionsQuestion:'Quali regioni del mondo vuoi seguire?', language:'Lingua del briefing', length:'Durata', short:'Breve · circa 3 minuti', standard:'Standard · circa 5 minuti', long:'Dettagliato · 8–10 minuti', includeTitle:'Includi', includeEvents:'Eventi e azioni', includeBackground:'Contesto e archivio', includeConnections:'Collegamenti internazionali', avoidRead:'Dare priorità alle novità non lette', create:'Crea briefing', update:'Aggiorna briefing', settings:'Impostazioni briefing', close:'Chiudi', reset:'Reimposta briefing', resetConfirm:'Eliminare impostazioni, cronologia e posizione audio?', noneSelected:'Scegli almeno un tema o una regione.', loading:'Creazione del briefing…', loadingTranslation:'Traduzione del briefing…', empty:'Nessun contenuto adatto trovato oggi.', noPersonalization:'Nessun briefing viene creato finché non confermi.', history:'Briefing precedenti', listen:'Ascolta', pause:'Pausa', resume:'Continua', stop:'Ferma', voice:'Voce del dispositivo', speed:'Velocità', pitch:'Tono', deviceVoiceNote:'Usa le voci gratuite installate sul dispositivo. Nessun audio viene caricato.', noVoice:'Nessuna voce adatta trovata. Il testo resta disponibile.', overview:'Oggi in breve', underRadar:'Sotto il radar', connections:'Collegamenti', events:'Eventi e azioni', background:'Contesto', why:'Perché viene mostrato', sources:'Fonti', generatedAt:'Creato', offline:'Copia offline', stale:'Briefing salvato del', readTime:'Tempo di lettura', listenTime:'Tempo di ascolto', share:'Condividi briefing', more:'Più contenuti simili', less:'Meno contenuti simili', updated:'Aggiornato', newLabel:'Nuovo', openArticle:"Apri l’articolo nell’app", translationFallback:'Alcune voci non sono state tradotte.', continueReading:'Continua a leggere', continueListening:'Continua ad ascoltare', refreshOnceDaily:"Aggiornato una volta al giorno all’apertura dell’app.", settingsSaved:'Impostazioni salvate.', resetDone:'Briefing reimpostato.', reasonTopic:'Tema', reasonRegion:'Regione', reasonUnread:'Non ancora letto', reasonEvent:'Evento imminente', feedbackSaved:'La selezione locale è stata aggiornata.', personalizationPrivate:'La selezione resta su questo dispositivo.', exportSettings:'Esporta impostazioni', importSettings:'Importa impostazioni', importInvalid:'Il file selezionato non è valido.', importSuccess:'Impostazioni importate.', hideSource:'Mostra questa fonte meno spesso'
      }
    },
    pt: {
      nav: {
        briefing:'Resumo', stories:'Desenvolvimentos', video:'Vídeo', start:'Início', regions:'Regiões', topics:'Temas', events:'Eventos', audio:'Áudio', saved:'Guardados', zine:'Zine', search:'Pesquisar', searchPlaceholder:'Pesquisar artigos…', settings:'Mais e definições', sources:'Fontes', back:'Voltar', article:'Artigo', language:'Idioma', design:'Design', fontSize:'Tamanho do texto', view:'Vista', format:'Formato', sort:'Ordenação', info:'Info', contact:'Contacto', donate:'Doar', storage:'Armazenamento', status:'Estado', clear:'Limpar cache', originalPodcasts:'Podcasts originais', generatedPodcasts:'Podcasts gerados', liveRadio:'Rádio ao vivo', bookmarks:'Ler depois', read:'Lido'
      },
      briefing: {
        title:'Resumo', today:'Hoje', setupTitle:'Configurar o briefing diário', setupIntro:'Escolha pelo menos um tema ou região. Nada é criado antes da confirmação.', topicsQuestion:'Que temas quer acompanhar?', regionsQuestion:'Que regiões do mundo quer acompanhar?', language:'Idioma do briefing', length:'Duração', short:'Curto · cerca de 3 minutos', standard:'Padrão · cerca de 5 minutos', long:'Detalhado · 8–10 minutos', includeTitle:'Incluir', includeEvents:'Eventos e ações', includeBackground:'Contexto e arquivo', includeConnections:'Ligações internacionais', avoidRead:'Dar prioridade ao que ainda não foi lido', create:'Criar resumo', update:'Atualizar briefing', settings:'Definições do briefing', close:'Fechar', reset:'Repor briefing', resetConfirm:'Apagar definições, histórico e posição de áudio?', noneSelected:'Escolha pelo menos um tema ou região.', loading:'A criar o briefing…', loadingTranslation:'A traduzir o briefing…', empty:'Hoje não foi encontrado conteúdo correspondente.', noPersonalization:'Nenhum briefing é criado até confirmar.', history:'Briefings anteriores', listen:'Ouvir', pause:'Pausa', resume:'Continuar', stop:'Parar', voice:'Voz do dispositivo', speed:'Velocidade', pitch:'Tom', deviceVoiceNote:'Usa as vozes gratuitas instaladas no dispositivo. Nenhum áudio é enviado.', noVoice:'Nenhuma voz adequada encontrada. O texto continua disponível.', overview:'Hoje em resumo', underRadar:'Fora do radar', connections:'Ligações', events:'Eventos e ações', background:'Contexto', why:'Porque aparece', sources:'Fontes', generatedAt:'Criado', offline:'Cópia offline', stale:'Briefing guardado de', readTime:'Tempo de leitura', listenTime:'Tempo de audição', share:'Partilhar briefing', more:'Mais disto', less:'Menos disto', updated:'Atualizado', newLabel:'Novo', openArticle:'Abrir artigo na aplicação', translationFallback:'Algumas entradas não puderam ser traduzidas.', continueReading:'Continuar a ler', continueListening:'Continuar a ouvir', refreshOnceDaily:'Atualizado uma vez por dia ao abrir a aplicação.', settingsSaved:'Definições guardadas.', resetDone:'Briefing reposto.', reasonTopic:'Tema', reasonRegion:'Região', reasonUnread:'Ainda não lido', reasonEvent:'Próximo evento', feedbackSaved:'A seleção local foi ajustada.', personalizationPrivate:'A sua seleção fica neste dispositivo.', exportSettings:'Exportar definições', importSettings:'Importar definições', importInvalid:'O ficheiro selecionado é inválido.', importSuccess:'Definições importadas.', hideSource:'Mostrar esta fonte com menos frequência'
      }
    },
    ru: {
      nav: {
        briefing:'Обзор', stories:'Развитие событий', video:'Видео', start:'Главная', regions:'Регионы', topics:'Темы', events:'События', audio:'Аудио', saved:'Сохранённое', zine:'Зин', search:'Поиск', searchPlaceholder:'Поиск статей…', settings:'Ещё и настройки', sources:'Источники', back:'Назад', article:'Статья', language:'Язык', design:'Оформление', fontSize:'Размер текста', view:'Вид', format:'Формат', sort:'Сортировка', info:'Инфо', contact:'Связаться', donate:'Поддержать', storage:'Хранилище', status:'Статус', clear:'Очистить кеш', originalPodcasts:'Оригинальные подкасты', generatedPodcasts:'Созданные подкасты', liveRadio:'Радио', bookmarks:'Прочитать позже', read:'Прочитано'
      },
      briefing: {
        title:'Обзор', today:'Сегодня', setupTitle:'Настройте ежедневный обзор', setupIntro:'Выберите хотя бы одну тему или регион. До подтверждения ничего не создаётся.', topicsQuestion:'Какие темы вы хотите отслеживать?', regionsQuestion:'Какие регионы мира вы хотите отслеживать?', language:'Язык обзора', length:'Длина', short:'Короткий · около 3 минут', standard:'Стандартный · около 5 минут', long:'Подробный · 8–10 минут', includeTitle:'Включить', includeEvents:'События и акции', includeBackground:'Контекст и архив', includeConnections:'Международные связи', avoidRead:'Отдавать приоритет непрочитанному', create:'Создать обзор', update:'Обновить обзор', settings:'Настройки обзора', close:'Закрыть', reset:'Сбросить обзор', resetConfirm:'Удалить настройки, историю и позицию аудио?', noneSelected:'Выберите хотя бы одну тему или регион.', loading:'Создаём обзор…', loadingTranslation:'Переводим обзор…', empty:'Сегодня подходящих материалов не найдено.', noPersonalization:'Обзор не создаётся до подтверждения выбора.', history:'Предыдущие обзоры', listen:'Слушать', pause:'Пауза', resume:'Продолжить', stop:'Стоп', voice:'Голос устройства', speed:'Скорость', pitch:'Высота', deviceVoiceNote:'Используются бесплатные голоса устройства. Аудио не загружается.', noVoice:'Подходящий голос не найден. Текст доступен.', overview:'Главное сегодня', underRadar:'Вне поля зрения', connections:'Связи', events:'События и акции', background:'Контекст', why:'Почему это показано', sources:'Источники', generatedAt:'Создано', offline:'Офлайн-копия', stale:'Сохранённый обзор от', readTime:'Время чтения', listenTime:'Время прослушивания', share:'Поделиться', more:'Больше такого', less:'Меньше такого', updated:'Обновлено', newLabel:'Новое', openArticle:'Открыть статью в приложении', translationFallback:'Некоторые материалы не удалось перевести.', continueReading:'Продолжить чтение', continueListening:'Продолжить прослушивание', refreshOnceDaily:'Обновляется раз в день при открытии приложения.', settingsSaved:'Настройки сохранены.', resetDone:'Обзор сброшен.', reasonTopic:'Тема', reasonRegion:'Регион', reasonUnread:'Ещё не прочитано', reasonEvent:'Предстоящее событие', feedbackSaved:'Локальная подборка изменена.', personalizationPrivate:'Ваш выбор остаётся на этом устройстве.', exportSettings:'Экспорт настроек', importSettings:'Импорт настроек', importInvalid:'Файл настроек недействителен.', importSuccess:'Настройки импортированы.', hideSource:'Показывать этот источник реже'
      }
    },
    el: {
      nav: {
        briefing:'Ενημέρωση', stories:'Εξελίξεις', video:'Βίντεο', start:'Αρχική', regions:'Περιοχές', topics:'Θέματα', events:'Εκδηλώσεις', audio:'Ήχος', saved:'Αποθηκευμένα', zine:'Zine', search:'Αναζήτηση', searchPlaceholder:'Αναζήτηση άρθρων…', settings:'Περισσότερα και ρυθμίσεις', sources:'Πηγές', back:'Πίσω', article:'Άρθρο', language:'Γλώσσα', design:'Σχεδίαση', fontSize:'Μέγεθος κειμένου', view:'Προβολή', format:'Μορφή', sort:'Ταξινόμηση', info:'Πληροφορίες', contact:'Επικοινωνία', donate:'Δωρεά', storage:'Αποθήκευση', status:'Κατάσταση', clear:'Εκκαθάριση cache', originalPodcasts:'Πρωτότυπα podcast', generatedPodcasts:'Δημιουργημένα podcast', liveRadio:'Ζωντανό ραδιόφωνο', bookmarks:'Για αργότερα', read:'Διαβασμένα'
      },
      briefing: {
        title:'Ενημέρωση', today:'Σήμερα', setupTitle:'Ρύθμιση καθημερινής ενημέρωσης', setupIntro:'Επιλέξτε τουλάχιστον ένα θέμα ή περιοχή. Δεν δημιουργείται τίποτα πριν την επιβεβαίωση.', topicsQuestion:'Ποια θέματα θέλετε να παρακολουθείτε;', regionsQuestion:'Ποιες περιοχές του κόσμου θέλετε να παρακολουθείτε;', language:'Γλώσσα ενημέρωσης', length:'Διάρκεια', short:'Σύντομη · περίπου 3 λεπτά', standard:'Κανονική · περίπου 5 λεπτά', long:'Αναλυτική · 8–10 λεπτά', includeTitle:'Να περιλαμβάνονται', includeEvents:'Εκδηλώσεις και δράσεις', includeBackground:'Ιστορικό και αρχείο', includeConnections:'Διεθνείς συνδέσεις', avoidRead:'Προτεραιότητα στα μη διαβασμένα', create:'Δημιουργία ενημέρωσης', update:'Ενημέρωση τώρα', settings:'Ρυθμίσεις ενημέρωσης', close:'Κλείσιμο', reset:'Επαναφορά ενημέρωσης', resetConfirm:'Διαγραφή ρυθμίσεων, ιστορικού και θέσης ήχου;', noneSelected:'Επιλέξτε τουλάχιστον ένα θέμα ή περιοχή.', loading:'Δημιουργία ενημέρωσης…', loadingTranslation:'Μετάφραση ενημέρωσης…', empty:'Δεν βρέθηκε σχετικό περιεχόμενο σήμερα.', noPersonalization:'Δεν δημιουργείται ενημέρωση μέχρι την επιβεβαίωση.', history:'Προηγούμενες ενημερώσεις', listen:'Ακρόαση', pause:'Παύση', resume:'Συνέχεια', stop:'Διακοπή', voice:'Φωνή συσκευής', speed:'Ταχύτητα', pitch:'Τόνος', deviceVoiceNote:'Χρησιμοποιεί τις δωρεάν φωνές της συσκευής. Δεν μεταφορτώνεται ήχος.', noVoice:'Δεν βρέθηκε κατάλληλη φωνή. Το κείμενο παραμένει διαθέσιμο.', overview:'Σήμερα με μια ματιά', underRadar:'Κάτω από το ραντάρ', connections:'Συνδέσεις', events:'Εκδηλώσεις και δράσεις', background:'Ιστορικό', why:'Γιατί εμφανίζεται', sources:'Πηγές', generatedAt:'Δημιουργήθηκε', offline:'Αντίγραφο εκτός σύνδεσης', stale:'Αποθηκευμένη ενημέρωση από', readTime:'Χρόνος ανάγνωσης', listenTime:'Χρόνος ακρόασης', share:'Κοινοποίηση', more:'Περισσότερα σαν αυτό', less:'Λιγότερα σαν αυτό', updated:'Ενημερώθηκε', newLabel:'Νέο', openArticle:'Άνοιγμα άρθρου στην εφαρμογή', translationFallback:'Ορισμένες εγγραφές δεν μεταφράστηκαν.', continueReading:'Συνέχεια ανάγνωσης', continueListening:'Συνέχεια ακρόασης', refreshOnceDaily:'Ενημερώνεται μία φορά την ημέρα όταν ανοίγει η εφαρμογή.', settingsSaved:'Οι ρυθμίσεις αποθηκεύτηκαν.', resetDone:'Η ενημέρωση επαναφέρθηκε.', reasonTopic:'Θέμα', reasonRegion:'Περιοχή', reasonUnread:'Δεν έχει διαβαστεί', reasonEvent:'Επερχόμενη εκδήλωση', feedbackSaved:'Η τοπική επιλογή προσαρμόστηκε.', personalizationPrivate:'Η επιλογή σας παραμένει σε αυτή τη συσκευή.', exportSettings:'Εξαγωγή ρυθμίσεων', importSettings:'Εισαγωγή ρυθμίσεων', importInvalid:'Το αρχείο δεν είναι έγκυρο.', importSuccess:'Οι ρυθμίσεις εισήχθησαν.', hideSource:'Να εμφανίζεται αυτή η πηγή λιγότερο'
      }
    },
    tr: {
      nav: {
        briefing:'Özet', stories:'Gelişmeler', video:'Video', start:'Başlangıç', regions:'Bölgeler', topics:'Konular', events:'Etkinlikler', audio:'Ses', saved:'Kaydedilenler', zine:'Zine', search:'Ara', searchPlaceholder:'Makalelerde ara…', settings:'Daha fazla ve ayarlar', sources:'Kaynaklar', back:'Geri', article:'Makale', language:'Dil', design:'Tasarım', fontSize:'Yazı boyutu', view:'Görünüm', format:'Biçim', sort:'Sıralama', info:'Bilgi', contact:'İletişim', donate:'Bağış', storage:'Depolama', status:'Durum', clear:'Önbelleği temizle', originalPodcasts:'Orijinal podcastler', generatedPodcasts:'Oluşturulan podcastler', liveRadio:'Canlı radyo', bookmarks:'Sonra oku', read:'Okundu'
      },
      briefing: {
        title:'Özet', today:'Bugün', setupTitle:'Günlük özetini ayarla', setupIntro:'En az bir konu veya bölge seç. Onaydan önce hiçbir şey oluşturulmaz.', topicsQuestion:'Hangi konuları takip etmek istiyorsun?', regionsQuestion:'Dünyanın hangi bölgelerini takip etmek istiyorsun?', language:'Özet dili', length:'Uzunluk', short:'Kısa · yaklaşık 3 dakika', standard:'Standart · yaklaşık 5 dakika', long:'Ayrıntılı · 8–10 dakika', includeTitle:'Dahil et', includeEvents:'Etkinlikler ve eylemler', includeBackground:'Arka plan ve arşiv', includeConnections:'Uluslararası bağlantılar', avoidRead:'Okunmamış gelişmelere öncelik ver', create:'Özet oluştur', update:'Özeti güncelle', settings:'Özet ayarları', close:'Kapat', reset:'Özeti sıfırla', resetConfirm:'Ayarlar, geçmiş ve dinleme konumu silinsin mi?', noneSelected:'En az bir konu veya bölge seç.', loading:'Özetin oluşturuluyor…', loadingTranslation:'Özet çevriliyor…', empty:'Bugün uygun içerik bulunamadı.', noPersonalization:'Seçimini onaylayana kadar özet oluşturulmaz.', history:'Önceki özetler', listen:'Dinle', pause:'Duraklat', resume:'Devam et', stop:'Durdur', voice:'Cihaz sesi', speed:'Hız', pitch:'Ton', deviceVoiceNote:'Cihazdaki ücretsiz sesleri kullanır. Ses dosyası yüklenmez.', noVoice:'Uygun cihaz sesi bulunamadı. Metin kullanılabilir.', overview:'Bugünün özeti', underRadar:'Gözden kaçanlar', connections:'Bağlantılar', events:'Etkinlikler ve eylemler', background:'Arka plan', why:'Neden gösteriliyor', sources:'Kaynaklar', generatedAt:'Oluşturuldu', offline:'Çevrimdışı kopya', stale:'Kaydedilmiş özet tarihi', readTime:'Okuma süresi', listenTime:'Dinleme süresi', share:'Özeti paylaş', more:'Bunun gibi daha fazla', less:'Bunun gibi daha az', updated:'Güncellendi', newLabel:'Yeni', openArticle:'Makaleyi uygulamada aç', translationFallback:'Bazı girdiler çevrilemedi.', continueReading:'Okumaya devam et', continueListening:'Dinlemeye devam et', refreshOnceDaily:'Uygulama açıldığında günde bir kez güncellenir.', settingsSaved:'Ayarlar kaydedildi.', resetDone:'Özet sıfırlandı.', reasonTopic:'Konu', reasonRegion:'Bölge', reasonUnread:'Henüz okunmadı', reasonEvent:'Yaklaşan etkinlik', feedbackSaved:'Yerel seçimin ayarlandı.', personalizationPrivate:'Seçimin bu cihazda kalır.', exportSettings:'Ayarları dışa aktar', importSettings:'Ayarları içe aktar', importInvalid:'Seçilen dosya geçersiz.', importSuccess:'Ayarlar içe aktarıldı.', hideSource:'Bu kaynağı daha az göster'
      }
    }
  };


  const EXTRA_TEXTS = {
    en: {
      briefing: {
        updates:'Changed since yesterday', includeUpdates:'Track updates from previous briefings',
        updatedLabel:'Updated', briefingStats:'Briefing overview', newCount:'new',
        updatedCount:'updated', sourceCount:'sources', regionCount:'regions', topicCount:'topics',
        onlyNew:'Only new & updated', showAll:'Show all', noNew:'No new or updated entries in this briefing.',
        summaryPrivacy:'Brief summaries and article summaries are created locally from the available text.',
        voicePreview:"Test voice",
        voicePreviewText:"This is the selected voice for your World Revolution News briefing.",
        voiceLocal:"local · offline",
        voiceOnline:"online",
        voiceDefault:"default",
        voiceQualityNote:"Local voices remain free and can work offline. Online voices may sound more natural, but can use data and depend on the device provider."
      },
      summary: {
        button:'Summarize', title:'Local summary', short:'Short', standard:'Standard',
        back:'Back', chooseTitle:'Choose summary length', chooseHint:'Select a length. The article remains unchanged.',
        detailed:'Detailed', regenerate:'Regenerate', copy:'Copy', share:'Share', listen:'Listen',
        stop:'Stop', close:'Close', local:'On this device', notice:'Automatically extracted from the article text. Check the original source for important details.',
        noText:'This article does not contain enough text for a useful summary.', compression:'Summary',
        words:'words', copied:'Summary copied.', copyFailed:'Could not copy the summary.'
      }
    },
    de: {
      briefing: {
        updates:'Seit gestern verändert', includeUpdates:'Aktualisierungen aus früheren Briefings verfolgen',
        updatedLabel:'Aktualisiert', briefingStats:'Briefing-Übersicht', newCount:'neu',
        updatedCount:'aktualisiert', sourceCount:'Quellen', regionCount:'Regionen', topicCount:'Themen',
        onlyNew:'Nur Neues & Aktualisiertes', showAll:'Alles anzeigen',
        noNew:'In diesem Briefing gibt es keine neuen oder aktualisierten Einträge.',
        summaryPrivacy:'Briefing- und Artikelzusammenfassungen werden lokal aus dem verfügbaren Text erstellt.',
        voicePreview:'Stimme testen',
        voicePreviewText:'Das ist die ausgewählte Stimme für dein Briefing von World Revolution News.',
        voiceLocal:'lokal · offline',
        voiceOnline:'online',
        voiceDefault:'Standard',
        voiceQualityNote:'Lokale Stimmen bleiben kostenlos und können offline funktionieren. Online-Stimmen können natürlicher klingen, benötigen aber eventuell Daten und hängen vom Geräteanbieter ab.'
      },
      summary: {
        button:'Zusammenfassen', title:'Lokale Zusammenfassung', short:'Kurz', standard:'Standard',
        back:'Zurück', chooseTitle:'Umfang wählen', chooseHint:'Wähle zuerst den gewünschten Umfang. Der Artikel bleibt unverändert.',
        detailed:'Ausführlich', regenerate:'Neu erstellen', copy:'Kopieren', share:'Teilen', listen:'Anhören',
        stop:'Stoppen', close:'Schließen', local:'Auf diesem Gerät',
        notice:'Automatisch aus dem Artikeltext extrahiert. Prüfe bei wichtigen Angaben die Originalquelle.',
        noText:'Dieser Artikel enthält nicht genügend Text für eine brauchbare Zusammenfassung.',
        compression:'Zusammenfassung', words:'Wörter', copied:'Zusammenfassung kopiert.',
        copyFailed:'Die Zusammenfassung konnte nicht kopiert werden.'
      }
    },
    es: {
      briefing: {
        updates:'Cambios desde ayer', includeUpdates:'Seguir actualizaciones de resúmenes anteriores',
        updatedLabel:'Actualizado', briefingStats:'Resumen general', newCount:'nuevos',
        updatedCount:'actualizados', sourceCount:'fuentes', regionCount:'regiones', topicCount:'temas',
        onlyNew:'Solo nuevos y actualizados', showAll:'Mostrar todo',
        noNew:'No hay entradas nuevas o actualizadas.', summaryPrivacy:'Los resúmenes se crean localmente a partir del texto disponible.',
        voicePreview:'Probar voz',
        voicePreviewText:'Esta es la voz seleccionada para el resumen de World Revolution News.',
        voiceLocal:'local · sin conexión',
        voiceOnline:'en línea',
        voiceDefault:'predeterminada',
        voiceQualityNote:'Las voces locales pueden funcionar sin conexión. Las voces en línea pueden sonar más naturales, pero usan datos.'
      },
      summary: {
        button:'Resumir', title:'Resumen local', short:'Breve', standard:'Estándar', detailed:'Detallado',
        back:'Atrás', chooseTitle:'Elegir longitud', chooseHint:'Elige primero la longitud. El artículo no se modifica.',
        regenerate:'Volver a crear', copy:'Copiar', share:'Compartir', listen:'Escuchar', stop:'Detener',
        close:'Cerrar', local:'En este dispositivo',
        notice:'Extraído automáticamente del texto. Consulta la fuente original para datos importantes.',
        noText:'El artículo no contiene texto suficiente para un resumen útil.', compression:'Resumen',
        words:'palabras', copied:'Resumen copiado.', copyFailed:'No se pudo copiar el resumen.'
      }
    },
    fr: {
      briefing: {
        updates:'Changements depuis hier', includeUpdates:'Suivre les mises à jour des briefings précédents',
        updatedLabel:'Mis à jour', briefingStats:'Vue d’ensemble', newCount:'nouveaux',
        updatedCount:'mis à jour', sourceCount:'sources', regionCount:'régions', topicCount:'thèmes',
        onlyNew:'Nouveaux et mis à jour', showAll:'Tout afficher',
        noNew:'Aucune entrée nouvelle ou mise à jour.', summaryPrivacy:'Les résumés sont créés localement à partir du texte disponible.',
        voicePreview:'Tester la voix',
        voicePreviewText:'Voici la voix sélectionnée pour le briefing de World Revolution News.',
        voiceLocal:'locale · hors ligne',
        voiceOnline:'en ligne',
        voiceDefault:'par défaut',
        voiceQualityNote:'Les voix locales peuvent fonctionner hors ligne. Les voix en ligne peuvent sembler plus naturelles, mais utilisent des données.'
      },
      summary: {
        button:'Résumer', title:'Résumé local', short:'Court', standard:'Standard', detailed:'Détaillé',
        back:'Retour', chooseTitle:'Choisir la longueur', chooseHint:'Choisissez d’abord la longueur. L’article reste inchangé.',
        regenerate:'Recréer', copy:'Copier', share:'Partager', listen:'Écouter', stop:'Arrêter',
        close:'Fermer', local:'Sur cet appareil',
        notice:'Extrait automatiquement du texte. Vérifiez la source originale pour les informations importantes.',
        noText:'Le texte est insuffisant pour produire un résumé utile.', compression:'Résumé',
        words:'mots', copied:'Résumé copié.', copyFailed:'Impossible de copier le résumé.'
      }
    },
    it: {
      briefing: {
        updates:'Cambiamenti da ieri', includeUpdates:'Segui aggiornamenti dai briefing precedenti',
        updatedLabel:'Aggiornato', briefingStats:'Panoramica briefing', newCount:'nuovi',
        updatedCount:'aggiornati', sourceCount:'fonti', regionCount:'regioni', topicCount:'temi',
        onlyNew:'Solo nuovi e aggiornati', showAll:'Mostra tutto',
        noNew:'Nessuna voce nuova o aggiornata.', summaryPrivacy:'I riassunti vengono creati localmente dal testo disponibile.',
        voicePreview:'Prova voce',
        voicePreviewText:'Questa è la voce selezionata per il briefing di World Revolution News.',
        voiceLocal:'locale · offline',
        voiceOnline:'online',
        voiceDefault:'predefinita',
        voiceQualityNote:'Le voci locali possono funzionare offline. Le voci online possono essere più naturali, ma usano dati.'
      },
      summary: {
        button:'Riassumi', title:'Riassunto locale', short:'Breve', standard:'Standard', detailed:'Dettagliato',
        back:'Indietro', chooseTitle:'Scegli la lunghezza', chooseHint:'Scegli prima la lunghezza. L’articolo rimane invariato.',
        regenerate:'Ricrea', copy:'Copia', share:'Condividi', listen:'Ascolta', stop:'Ferma',
        close:'Chiudi', local:'Su questo dispositivo',
        notice:'Estratto automaticamente dal testo. Controlla la fonte originale per i dettagli importanti.',
        noText:'Il testo non è sufficiente per un riassunto utile.', compression:'Riassunto',
        words:'parole', copied:'Riassunto copiato.', copyFailed:'Impossibile copiare il riassunto.'
      }
    },
    pt: {
      briefing: {
        updates:'Alterações desde ontem', includeUpdates:'Acompanhar atualizações de briefings anteriores',
        updatedLabel:'Atualizado', briefingStats:'Visão geral', newCount:'novos',
        updatedCount:'atualizados', sourceCount:'fontes', regionCount:'regiões', topicCount:'temas',
        onlyNew:'Só novos e atualizados', showAll:'Mostrar tudo',
        noNew:'Não há entradas novas ou atualizadas.', summaryPrivacy:'Os resumos são criados localmente a partir do texto disponível.',
        voicePreview:'Testar voz',
        voicePreviewText:'Esta é a voz selecionada para o resumo da World Revolution News.',
        voiceLocal:'local · offline',
        voiceOnline:'online',
        voiceDefault:'predefinida',
        voiceQualityNote:'As vozes locais podem funcionar offline. As vozes online podem soar mais naturais, mas usam dados.'
      },
      summary: {
        button:'Resumir', title:'Resumo local', short:'Curto', standard:'Normal', detailed:'Detalhado',
        back:'Voltar', chooseTitle:'Escolher extensão', chooseHint:'Escolhe primeiro a extensão. O artigo não é alterado.',
        regenerate:'Criar novamente', copy:'Copiar', share:'Partilhar', listen:'Ouvir', stop:'Parar',
        close:'Fechar', local:'Neste dispositivo',
        notice:'Extraído automaticamente do texto. Confirma a fonte original para detalhes importantes.',
        noText:'O artigo não tem texto suficiente para um resumo útil.', compression:'Resumo',
        words:'palavras', copied:'Resumo copiado.', copyFailed:'Não foi possível copiar o resumo.'
      }
    },
    ru: {
      briefing: {
        updates:'Изменения со вчерашнего дня', includeUpdates:'Отслеживать изменения из прошлых обзоров',
        updatedLabel:'Обновлено', briefingStats:'Обзор выпуска', newCount:'новых',
        updatedCount:'обновлено', sourceCount:'источников', regionCount:'регионов', topicCount:'тем',
        onlyNew:'Только новое и обновлённое', showAll:'Показать всё',
        noNew:'Новых или обновлённых материалов нет.', summaryPrivacy:'Сводки создаются локально из доступного текста.',
        voicePreview:'Проверить голос',
        voicePreviewText:'Это выбранный голос для обзора World Revolution News.',
        voiceLocal:'локальный · офлайн',
        voiceOnline:'онлайн',
        voiceDefault:'по умолчанию',
        voiceQualityNote:'Локальные голоса могут работать офлайн. Онлайн-голоса могут звучать естественнее, но используют интернет.'
      },
      summary: {
        button:'Сводка', title:'Локальная сводка', short:'Кратко', standard:'Обычно', detailed:'Подробно',
        back:'Назад', chooseTitle:'Выберите объём', chooseHint:'Сначала выберите объём. Текст статьи не изменится.',
        regenerate:'Создать заново', copy:'Копировать', share:'Поделиться', listen:'Слушать', stop:'Стоп',
        close:'Закрыть', local:'На этом устройстве',
        notice:'Автоматически извлечено из текста. Важные детали проверяйте в оригинальном источнике.',
        noText:'Недостаточно текста для полезной сводки.', compression:'Сводка',
        words:'слов', copied:'Сводка скопирована.', copyFailed:'Не удалось скопировать сводку.'
      }
    },
    el: {
      briefing: {
        updates:'Αλλαγές από χθες', includeUpdates:'Παρακολούθηση ενημερώσεων προηγούμενων ενημερώσεων',
        updatedLabel:'Ενημερώθηκε', briefingStats:'Επισκόπηση', newCount:'νέα',
        updatedCount:'ενημερωμένα', sourceCount:'πηγές', regionCount:'περιοχές', topicCount:'θέματα',
        onlyNew:'Μόνο νέα και ενημερωμένα', showAll:'Εμφάνιση όλων',
        noNew:'Δεν υπάρχουν νέες ή ενημερωμένες εγγραφές.', summaryPrivacy:'Οι περιλήψεις δημιουργούνται τοπικά από το διαθέσιμο κείμενο.',
        voicePreview:'Δοκιμή φωνής',
        voicePreviewText:'Αυτή είναι η επιλεγμένη φωνή για την ενημέρωση του World Revolution News.',
        voiceLocal:'τοπική · εκτός σύνδεσης',
        voiceOnline:'online',
        voiceDefault:'προεπιλογή',
        voiceQualityNote:'Οι τοπικές φωνές μπορούν να λειτουργούν εκτός σύνδεσης. Οι online φωνές μπορεί να ακούγονται φυσικότερες αλλά χρησιμοποιούν δεδομένα.'
      },
      summary: {
        button:'Περίληψη', title:'Τοπική περίληψη', short:'Σύντομη', standard:'Κανονική', detailed:'Αναλυτική',
        back:'Πίσω', chooseTitle:'Επιλογή έκτασης', chooseHint:'Επιλέξτε πρώτα την έκταση. Το άρθρο παραμένει αμετάβλητο.',
        regenerate:'Νέα δημιουργία', copy:'Αντιγραφή', share:'Κοινοποίηση', listen:'Ακρόαση', stop:'Διακοπή',
        close:'Κλείσιμο', local:'Σε αυτή τη συσκευή',
        notice:'Αυτόματη εξαγωγή από το κείμενο. Ελέγξτε την αρχική πηγή για σημαντικές λεπτομέρειες.',
        noText:'Δεν υπάρχει αρκετό κείμενο για χρήσιμη περίληψη.', compression:'Περίληψη',
        words:'λέξεις', copied:'Η περίληψη αντιγράφηκε.', copyFailed:'Η αντιγραφή απέτυχε.'
      }
    },
    tr: {
      briefing: {
        updates:'Dünden bu yana değişenler', includeUpdates:'Önceki özetlerdeki güncellemeleri izle',
        updatedLabel:'Güncellendi', briefingStats:'Özet görünümü', newCount:'yeni',
        updatedCount:'güncellenmiş', sourceCount:'kaynak', regionCount:'bölge', topicCount:'konu',
        onlyNew:'Yalnızca yeni ve güncel', showAll:'Tümünü göster',
        noNew:'Yeni veya güncellenmiş içerik yok.', summaryPrivacy:'Özetler mevcut metinden cihazda yerel olarak oluşturulur.',
        voicePreview:'Sesi dene',
        voicePreviewText:'Bu, World Revolution News özeti için seçilen sestir.',
        voiceLocal:'yerel · çevrimdışı',
        voiceOnline:'çevrimiçi',
        voiceDefault:'varsayılan',
        voiceQualityNote:'Yerel sesler çevrimdışı çalışabilir. Çevrimiçi sesler daha doğal olabilir ancak veri kullanır.'
      },
      summary: {
        button:'Özetle', title:'Yerel özet', short:'Kısa', standard:'Standart', detailed:'Ayrıntılı',
        back:'Geri', chooseTitle:'Özet uzunluğunu seç', chooseHint:'Önce uzunluğu seç. Makale değiştirilmez.',
        regenerate:'Yeniden oluştur', copy:'Kopyala', share:'Paylaş', listen:'Dinle', stop:'Durdur',
        close:'Kapat', local:'Bu cihazda',
        notice:'Makaleden otomatik çıkarılmıştır. Önemli ayrıntıları özgün kaynaktan doğrula.',
        noText:'Yararlı bir özet için yeterli metin yok.', compression:'Özet',
        words:'kelime', copied:'Özet kopyalandı.', copyFailed:'Özet kopyalanamadı.'
      }
    }
  };

  const TOPIC_UI_KEYS = Object.freeze({
    'Labor Struggles': 'catLabor', 'Antifascism': 'catAntifascism', 'Antisexism': 'catAntisexism',
    'Queer-Feminism': 'catQueer', 'Antiracism': 'catAntiracism', 'No Borders': 'catNoBorders',
    'Anticapitalism': 'catAnticapitalism', 'Theory & Strategy': 'catTheory',
    'Anticolonialism': 'catAnticolonialism', 'Anti-Imperialism': 'catAntiimperialism',
    'Squatting & Housing': 'catSquatting', 'Demonstrations': 'catDemos',
    'Anti-Rep & Prisons': 'catAntirepression', 'Cyberactivism': 'catCyber', 'No War': 'catNoWar',
    'Animal Liberation': 'catAnimal', 'Eco-Anarchism': 'catEco',
    'Indigenous Struggles': 'catIndigenous', 'Radical Health & Disability': 'catHealth',
    'Libraries': 'catLibraries', 'Movement News': 'catMovementNews'
  });

  const REGION_UI_KEYS = Object.freeze({
    Global: 'catGlobal', Europe: 'catEurope', Africa: 'catAfrica', 'North America': 'catNorthAmerica',
    'Latin America': 'catLatinAmerica', Asia: 'catAsia', 'Australia & NZ': 'catAustralia'
  });

  const FALLBACK_TOPICS = Object.freeze({
    'Labor Struggles':'Labor struggles', 'Antifascism':'Antifascism', 'Antisexism':'Antisexism',
    'Queer-Feminism':'Queer feminism', 'Antiracism':'Antiracism', 'No Borders':'No Borders',
    'Anticapitalism':'Anticapitalism', 'Theory & Strategy':'Theory & strategy',
    'Anticolonialism':'Anticolonialism', 'Anti-Imperialism':'Anti-imperialism',
    'Squatting & Housing':'Squatting & housing', 'Demonstrations':'Demonstrations',
    'Anti-Rep & Prisons':'Anti-repression & prisons', 'Cyberactivism':'Cyberactivism', 'No War':'No war',
    'Animal Liberation':'Animal liberation', 'Eco-Anarchism':'Ecology & climate',
    'Indigenous Struggles':'Indigenous struggles', 'Radical Health & Disability':'Radical health & disability',
    Libraries:'Libraries', 'Movement News':'Movement news'
  });

  const FALLBACK_REGIONS = Object.freeze({
    Global:'Global', Europe:'Europe', Africa:'Africa', 'North America':'North America',
    'Latin America':'Latin America', Asia:'Asia', 'Australia & NZ':'Oceania'
  });

  function normalizeLanguage(value) {
    const code = String(value || '').toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
  }

  function mergeObjects(base, extra) {
    return Object.assign({}, base || {}, extra || {});
  }

  function dictionary(language) {
    const lang = normalizeLanguage(language);
    const override = OVERRIDES[lang] || {};
    const extra = EXTRA_TEXTS[lang] || EXTRA_TEXTS.en;
    return {
      nav: mergeObjects(EN.nav, override.nav),
      briefing: mergeObjects(mergeObjects(EN.briefing, override.briefing), extra.briefing),
      summary: mergeObjects(EXTRA_TEXTS.en.summary, extra.summary)
    };
  }

  function replaceVariables(value, variables) {
    return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(variables || {}, key) ? String(variables[key]) : `{${key}}`;
    });
  }

  function t(path, language, variables = {}) {
    const [group, key] = String(path || '').split('.');
    const dict = dictionary(language);
    const value = dict?.[group]?.[key] ?? EN?.[group]?.[key] ?? path;
    return replaceVariables(value, variables);
  }

  function currentLanguage() {
    try {
      const selected = document.getElementById('ui-language')?.value;
      if (selected) return normalizeLanguage(selected);
      if (typeof currentLang !== 'undefined' && currentLang) return normalizeLanguage(currentLang);
      return normalizeLanguage(document.documentElement.lang || 'en');
    } catch {
      return normalizeLanguage(document.documentElement.lang || 'en');
    }
  }

  function legacyText(language, key) {
    try {
      if (typeof uiTexte !== 'undefined' && uiTexte?.[normalizeLanguage(language)]?.[key]) {
        return uiTexte[normalizeLanguage(language)][key];
      }
    } catch {}
    return '';
  }

  function topicLabel(topic, language) {
    if (topic === 'Movement News') {
      return ({
        de:'Bewegungsnews', en:'Movement news', es:'Noticias de movimientos',
        fr:'Actualités des mouvements', it:'Notizie dei movimenti',
        pt:'Notícias dos movimentos', ru:'Новости движений',
        el:'Νέα κινημάτων', tr:'Hareket haberleri'
      })[normalizeLanguage(language)] || 'Movement news';
    }
    const key = TOPIC_UI_KEYS[topic];
    return (key && legacyText(language, key)) || FALLBACK_TOPICS[topic] || topic;
  }

  function regionLabel(region, language) {
    const key = REGION_UI_KEYS[region];
    return (key && legacyText(language, key)) || FALLBACK_REGIONS[region] || region;
  }

  function auditLegacyTranslations() {
    try {
      if (typeof uiTexte === 'undefined' || !uiTexte.en) return;
      for (const language of SUPPORTED_LANGUAGES) {
        if (!uiTexte[language]) uiTexte[language] = {};
        for (const [key, value] of Object.entries(uiTexte.en)) {
          if (uiTexte[language][key] === undefined || uiTexte[language][key] === null || uiTexte[language][key] === '') {
            uiTexte[language][key] = value;
          }
        }
      }
    } catch (error) {
      console.warn('WRN language audit could not complete:', error);
    }
  }

  window.WRNI18n = Object.freeze({
    supportedLanguages: SUPPORTED_LANGUAGES,
    languageLabels: LANGUAGE_LABELS,
    normalizeLanguage,
    currentLanguage,
    dictionary,
    t,
    topicLabel,
    regionLabel,
    auditLegacyTranslations
  });

  auditLegacyTranslations();
  window.addEventListener('load', auditLegacyTranslations, { once: true });
})();
