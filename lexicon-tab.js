/* World Revolution News 1.8.4 – movement glossary */
'use strict';

(() => {
  if (window.WRNLexicon184) return;

  const UI = {
    de: {
      nav: 'Lexikon',
      building: 'Im Aufbau',
      title: 'Begriffe in Bewegung',
      lead: 'Kurze, einordnende Erklärungen zu Begriffen aus anarchistischen, antiautoritären und linksrevolutionären Bewegungen.',
      note: 'Dieses Lexikon erhebt keinen Anspruch auf Vollständigkeit. Begriffe entstehen in politischen Kämpfen, verändern sich und werden in unterschiedlichen Strömungen verschieden verwendet. Die Texte sind Einladungen zur gemeinsamen Klärung – keine endgültigen Festlegungen.',
      search: 'Begriffe, alternative Namen oder Inhalte durchsuchen …',
      noResults: 'Für diese Suche wurde kein Begriff gefunden.',
      terms: 'Begriffe',
      meaning: 'Kurz erklärt',
      practice: 'In der Praxis',
      debate: 'Unterschiedliche Perspektiven',
      related: 'Verwandte Begriffe',
      sources: 'Quellen und Weiterlesen',
      sourceOpen: 'Quelle öffnen',
      pdfOpen: 'PDF öffnen / herunterladen',
      downloadLexicon: 'WRN-Lexikon als JSON sichern',
      printLexicon: 'PDF / Drucken',
      epubLexicon: 'EPUB herunterladen',
      revision: 'Änderungsverlauf',
      downloadHint: 'Die WRN-Kurztexte sind eigene redaktionelle Zusammenfassungen. Externe Texte werden nicht kopiert. Offizielle Downloads öffnen direkt beim jeweiligen Projekt.',
      editorialState: 'Redaktioneller Entwurf · Rückmeldungen willkommen',
      feedback: 'Ergänzung oder Korrektur vorschlagen',
      fallback: 'Die redaktionellen Definitionen sind zunächst auf Deutsch und Englisch verfügbar. Angezeigt wird die englische Fassung.',
      sections: {
        basics: 'Grundlagen',
        organisation: 'Organisierung',
        justice: 'Gerechtigkeit & Fürsorge',
        power: 'Herrschaft & Analyse',
        tactics: 'Praxis & Aktionsformen',
        ecology: 'Ökologie & Gemeingüter',
        struggles: 'Kämpfe & Kritik',
        all: 'Alle Begriffe',
        sources: 'Quellen'
      }
    },
    en: {
      nav: 'Glossary',
      building: 'Under construction',
      title: 'Words in motion',
      lead: 'Short, contextual explanations of terms used in anarchist, anti-authoritarian and revolutionary left movements.',
      note: 'This glossary does not claim to be complete. Terms emerge through political struggle, change over time and are used differently across tendencies. These texts invite shared clarification; they are not final rulings.',
      search: 'Search terms, alternative names or descriptions …',
      noResults: 'No term matches this search.',
      terms: 'Terms',
      meaning: 'In brief',
      practice: 'In practice',
      debate: 'Different perspectives',
      related: 'Related terms',
      sources: 'Sources and further reading',
      sourceOpen: 'Open source',
      pdfOpen: 'Open / download PDF',
      downloadLexicon: 'Save WRN glossary as JSON',
      printLexicon: 'PDF / print',
      epubLexicon: 'Download EPUB',
      revision: 'Revision history',
      downloadHint: 'WRN entries are original editorial summaries. External texts are not copied. Official downloads open directly at the respective project.',
      editorialState: 'Editorial draft · feedback welcome',
      feedback: 'Suggest an addition or correction',
      fallback: '',
      sections: {
        basics: 'Foundations',
        organisation: 'Organising',
        justice: 'Justice & care',
        power: 'Power & analysis',
        tactics: 'Practice & tactics',
        ecology: 'Ecology & commons',
        struggles: 'Struggles & critique',
        all: 'All terms',
        sources: 'Sources'
      }
    },
    es: {
      nav: 'Glosario', building: 'En desarrollo', title: 'Palabras en movimiento',
      lead: 'Explicaciones breves y contextualizadas de términos de movimientos anarquistas, antiautoritarios y de la izquierda revolucionaria.',
      note: 'Este glosario no pretende ser completo. Los términos surgen en las luchas políticas, cambian y se usan de forma diferente según las corrientes.',
      search: 'Buscar términos, nombres alternativos o contenidos …', noResults: 'No se encontró ningún término.',
      terms: 'Términos', meaning: 'En breve', practice: 'En la práctica', debate: 'Perspectivas diferentes',
      related: 'Términos relacionados', sources: 'Fuentes y lecturas', sourceOpen: 'Abrir fuente',
      pdfOpen: 'Abrir / descargar PDF', downloadLexicon: 'Guardar glosario WRN como JSON',
      downloadHint: 'Los textos breves de WRN son resúmenes editoriales propios. Los textos externos no se copian.',
      editorialState: 'Borrador editorial · comentarios bienvenidos', feedback: 'Proponer una adición o corrección',
      fallback: 'Las definiciones editoriales están disponibles inicialmente en alemán e inglés. Se muestra la versión inglesa.',
      sections: { basics:'Fundamentos', organisation:'Organización', justice:'Justicia y cuidados', power:'Poder y análisis', tactics:'Práctica y tácticas', ecology:'Ecología y comunes', struggles:'Luchas y crítica', all:'Todos', sources:'Fuentes' }
    },
    fr: {
      nav: 'Lexique', building: 'En construction', title: 'Des mots en mouvement',
      lead: 'Des explications courtes et contextualisées de termes issus des mouvements anarchistes, antiautoritaires et de la gauche révolutionnaire.',
      note: 'Ce lexique ne prétend pas être complet. Les termes naissent dans les luttes politiques, évoluent et sont employés différemment selon les courants.',
      search: 'Rechercher des termes, variantes ou contenus …', noResults: 'Aucun terme trouvé.',
      terms: 'Termes', meaning: 'En bref', practice: 'Dans la pratique', debate: 'Perspectives différentes',
      related: 'Termes liés', sources: 'Sources et lectures', sourceOpen: 'Ouvrir la source',
      pdfOpen: 'Ouvrir / télécharger le PDF', downloadLexicon: 'Enregistrer le lexique WRN en JSON',
      downloadHint: 'Les textes courts de WRN sont des synthèses éditoriales originales. Les textes externes ne sont pas copiés.',
      editorialState: 'Projet éditorial · retours bienvenus', feedback: 'Proposer un ajout ou une correction',
      fallback: 'Les définitions éditoriales sont d’abord disponibles en allemand et en anglais. La version anglaise est affichée.',
      sections: { basics:'Fondements', organisation:'Organisation', justice:'Justice et soin', power:'Pouvoir et analyse', tactics:'Pratique et tactiques', ecology:'Écologie et communs', struggles:'Luttes et critique', all:'Tous les termes', sources:'Sources' }
    },
    it: {
      nav: 'Glossario', building: 'In costruzione', title: 'Parole in movimento',
      lead: 'Spiegazioni brevi e contestualizzate di termini dei movimenti anarchici, antiautoritari e della sinistra rivoluzionaria.',
      note: 'Questo glossario non pretende di essere completo. I termini nascono nelle lotte politiche, cambiano e sono usati diversamente nelle varie correnti.',
      search: 'Cerca termini, nomi alternativi o contenuti …', noResults: 'Nessun termine trovato.',
      terms: 'Termini', meaning: 'In breve', practice: 'Nella pratica', debate: 'Prospettive diverse',
      related: 'Termini collegati', sources: 'Fonti e letture', sourceOpen: 'Apri fonte',
      pdfOpen: 'Apri / scarica PDF', downloadLexicon: 'Salva il glossario WRN come JSON',
      downloadHint: 'I testi brevi WRN sono sintesi editoriali originali. I testi esterni non vengono copiati.',
      editorialState: 'Bozza editoriale · commenti benvenuti', feedback: 'Proponi un’aggiunta o una correzione',
      fallback: 'Le definizioni editoriali sono inizialmente disponibili in tedesco e inglese. Viene mostrata la versione inglese.',
      sections: { basics:'Fondamenti', organisation:'Organizzazione', justice:'Giustizia e cura', power:'Potere e analisi', tactics:'Pratica e tattiche', ecology:'Ecologia e beni comuni', struggles:'Lotte e critica', all:'Tutti i termini', sources:'Fonti' }
    },
    pt: {
      nav: 'Glossário', building: 'Em construção', title: 'Palavras em movimento',
      lead: 'Explicações breves e contextualizadas de termos de movimentos anarquistas, antiautoritários e da esquerda revolucionária.',
      note: 'Este glossário não pretende ser completo. Os termos nascem nas lutas políticas, mudam e são usados de forma diferente entre correntes.',
      search: 'Pesquisar termos, nomes alternativos ou conteúdos …', noResults: 'Nenhum termo encontrado.',
      terms: 'Termos', meaning: 'Em resumo', practice: 'Na prática', debate: 'Perspetivas diferentes',
      related: 'Termos relacionados', sources: 'Fontes e leituras', sourceOpen: 'Abrir fonte',
      pdfOpen: 'Abrir / descarregar PDF', downloadLexicon: 'Guardar glossário WRN em JSON',
      downloadHint: 'Os textos breves da WRN são resumos editoriais próprios. Textos externos não são copiados.',
      editorialState: 'Rascunho editorial · comentários bem-vindos', feedback: 'Sugerir adição ou correção',
      fallback: 'As definições editoriais estão inicialmente disponíveis em alemão e inglês. É apresentada a versão inglesa.',
      sections: { basics:'Fundamentos', organisation:'Organização', justice:'Justiça e cuidado', power:'Poder e análise', tactics:'Prática e táticas', ecology:'Ecologia e comuns', struggles:'Lutas e crítica', all:'Todos os termos', sources:'Fontes' }
    },
    ru: {
      nav: 'Словарь', building: 'В разработке', title: 'Слова в движении',
      lead: 'Краткие контекстные объяснения терминов анархистских, антиавторитарных и левореволюционных движений.',
      note: 'Этот словарь не претендует на полноту. Термины рождаются в политической борьбе, меняются и по-разному используются различными течениями.',
      search: 'Поиск терминов, вариантов названий или описаний …', noResults: 'Термин не найден.',
      terms: 'Термины', meaning: 'Кратко', practice: 'На практике', debate: 'Разные точки зрения',
      related: 'Связанные термины', sources: 'Источники и материалы', sourceOpen: 'Открыть источник',
      pdfOpen: 'Открыть / скачать PDF', downloadLexicon: 'Сохранить словарь WRN в JSON',
      downloadHint: 'Краткие тексты WRN — собственные редакционные резюме. Внешние тексты не копируются.',
      editorialState: 'Редакционный черновик · отзывы приветствуются', feedback: 'Предложить дополнение или исправление',
      fallback: 'Редакционные определения пока доступны на немецком и английском. Показана английская версия.',
      sections: { basics:'Основы', organisation:'Организация', justice:'Справедливость и забота', power:'Власть и анализ', tactics:'Практика и тактика', ecology:'Экология и общее', struggles:'Борьба и критика', all:'Все термины', sources:'Источники' }
    },
    el: {
      nav: 'Γλωσσάρι', building: 'Υπό ανάπτυξη', title: 'Λέξεις σε κίνηση',
      lead: 'Σύντομες, πλαισιωμένες εξηγήσεις όρων από αναρχικά, αντιεξουσιαστικά και επαναστατικά αριστερά κινήματα.',
      note: 'Το γλωσσάρι δεν ισχυρίζεται ότι είναι πλήρες. Οι όροι γεννιούνται σε πολιτικούς αγώνες, αλλάζουν και χρησιμοποιούνται διαφορετικά.',
      search: 'Αναζήτηση όρων, εναλλακτικών ονομάτων ή περιεχομένου …', noResults: 'Δεν βρέθηκε όρος.',
      terms: 'Όροι', meaning: 'Συνοπτικά', practice: 'Στην πράξη', debate: 'Διαφορετικές οπτικές',
      related: 'Σχετικοί όροι', sources: 'Πηγές και ανάγνωση', sourceOpen: 'Άνοιγμα πηγής',
      pdfOpen: 'Άνοιγμα / λήψη PDF', downloadLexicon: 'Αποθήκευση γλωσσαρίου WRN ως JSON',
      downloadHint: 'Τα σύντομα κείμενα του WRN είναι πρωτότυπες συντακτικές περιλήψεις. Τα εξωτερικά κείμενα δεν αντιγράφονται.',
      editorialState: 'Συντακτικό προσχέδιο · τα σχόλια είναι ευπρόσδεκτα', feedback: 'Πρόταση προσθήκης ή διόρθωσης',
      fallback: 'Οι συντακτικοί ορισμοί είναι αρχικά διαθέσιμοι στα γερμανικά και αγγλικά. Εμφανίζεται η αγγλική έκδοση.',
      sections: { basics:'Βάσεις', organisation:'Οργάνωση', justice:'Δικαιοσύνη και φροντίδα', power:'Εξουσία και ανάλυση', tactics:'Πράξη και τακτικές', ecology:'Οικολογία και κοινά', struggles:'Αγώνες και κριτική', all:'Όλοι οι όροι', sources:'Πηγές' }
    },
    tr: {
      nav: 'Sözlük', building: 'Yapım aşamasında', title: 'Hareket hâlindeki sözcükler',
      lead: 'Anarşist, otorite karşıtı ve devrimci sol hareketlerde kullanılan terimlere ilişkin kısa ve bağlamsal açıklamalar.',
      note: 'Bu sözlük eksiksiz olma iddiasında değildir. Kavramlar siyasi mücadelelerde doğar, değişir ve farklı akımlarda farklı kullanılır.',
      search: 'Terim, alternatif ad veya açıklama ara …', noResults: 'Aramayla eşleşen terim bulunamadı.',
      terms: 'Terimler', meaning: 'Kısaca', practice: 'Pratikte', debate: 'Farklı bakışlar',
      related: 'İlgili terimler', sources: 'Kaynaklar ve ileri okuma', sourceOpen: 'Kaynağı aç',
      pdfOpen: 'PDF aç / indir', downloadLexicon: 'WRN sözlüğünü JSON olarak kaydet',
      downloadHint: 'WRN kısa metinleri özgün editoryal özetlerdir. Dış metinler kopyalanmaz.',
      editorialState: 'Editoryal taslak · geri bildirim bekliyoruz', feedback: 'Ekleme veya düzeltme öner',
      fallback: 'Editoryal tanımlar başlangıçta Almanca ve İngilizce sunulmaktadır. İngilizce sürüm gösteriliyor.',
      sections: { basics:'Temeller', organisation:'Örgütlenme', justice:'Adalet ve bakım', power:'İktidar ve analiz', tactics:'Pratik ve taktikler', ecology:'Ekoloji ve müşterekler', struggles:'Mücadele ve eleştiri', all:'Tüm terimler', sources:'Kaynaklar' }
    }
  };

  const SOURCES = [
    {
      id: 'afaq',
      name: 'An Anarchist FAQ',
      language: 'English',
      description: {
        de: 'Umfangreiche Einführung in anarchistische Grundideen, Strömungen, Geschichte, Organisation und Gesellschaftsentwürfe.',
        en: 'A broad introduction to anarchist principles, tendencies, history, organisation and visions of society.'
      },
      url: 'https://www.anarchistfaq.org/afaq/',
      downloads: [
        { label: 'Section A · PDF · English', url: 'https://www.anarchistfaq.org/afaq/pdf/sectionA.pdf' },
        { label: 'Section B · PDF · English', url: 'https://www.anarchistfaq.org/afaq/pdf/sectionB.pdf' }
      ]
    },
    {
      id: 'libcom',
      name: 'Libcom · Anarchism reading guide',
      language: 'English',
      description: {
        de: 'Thematisch geordneter Leseführer mit Einführungen, historischen Texten und verschiedenen anarchistischen Traditionen.',
        en: 'A thematic reading guide with introductions, historical texts and different anarchist traditions.'
      },
      url: 'https://libcom.org/article/anarchism-reading-guide',
      downloads: []
    },
    {
      id: 'transformharm',
      name: 'TransformHarm',
      language: 'English',
      description: {
        de: 'Kuratierte Artikel, Medien und Bildungsmaterialien zu transformativer und restaurativer Gerechtigkeit, Community Accountability, Abolition und Healing Justice.',
        en: 'Curated articles, media and curricula on transformative and restorative justice, community accountability, abolition and healing justice.'
      },
      url: 'https://transformharm.org/',
      downloads: []
    },
    {
      id: 'creative-interventions',
      name: 'Creative Interventions Toolkit',
      language: 'English · Español · Français',
      description: {
        de: 'Ein ausführlicher Praxisleitfaden für gemeinschaftsbasierte Reaktionen auf zwischenmenschliche Gewalt, transformative Gerechtigkeit und Verantwortungsübernahme.',
        en: 'A detailed practical guide to community-based responses to interpersonal violence, transformative justice and accountability.'
      },
      url: 'https://www.creative-interventions.org/toolkit/',
      downloads: [
        { label: 'Toolkit · PDF · English', url: 'https://www.creative-interventions.org/wp-content/uploads/2020/10/CI-Toolkit-Final-ENTIRE-Aug-2020-new-cover.pdf' },
        { label: 'Toolkit · PDF · Español', url: 'https://www.creative-interventions.org/wp-content/uploads/2020/10/toolkit-completo.pdf' }
      ]
    },
    {
      id: 'anarchist-library',
      name: 'The Anarchist Library',
      language: 'Multilingual',
      description: {
        de: 'Mehrsprachiges Archiv anarchistischer Texte mit Online-Lektüre und herunterladbaren Fassungen, unter anderem zu direkter Aktion und Organisierung.',
        en: 'A multilingual archive of anarchist writing with online reading and downloadable editions, including texts on direct action and organising.'
      },
      url: 'https://theanarchistlibrary.org/',
      downloads: [
        { label: 'Direct Action · PDF · English', url: 'https://theanarchistlibrary.org/mirror/d/dg/david-graeber-direct-action.pdf' }
      ]
    },
    {
      id: 'sins-invalid',
      name: 'Sins Invalid · Disability Justice',
      language: 'English',
      description: {
        de: 'Zehn Grundsätze der Disability Justice aus einer intersektionalen, antikapitalistischen und bewegungsorientierten Perspektive.',
        en: 'Ten principles of Disability Justice from an intersectional, anti-capitalist and movement-based perspective.'
      },
      url: 'https://sinsinvalid.org/10-principles/',
      downloads: []
    },
    {
      id: 'critical-resistance',
      name: 'Critical Resistance',
      language: 'English',
      description: {
        de: 'Materialien zur Abschaffung des Gefängnis-Industrie-Komplexes und zum Aufbau nicht-strafender Formen von Sicherheit und Verantwortung.',
        en: 'Resources on abolishing the prison industrial complex and building non-punitive forms of safety and accountability.'
      },
      url: 'https://criticalresistance.org/resources/',
      downloads: [
        { label: 'Abolitionist Toolkit · PDF · English', url: 'https://criticalresistance.org/wp-content/uploads/2020/05/CR-Abolitionist-Toolkit-online.pdf' },
        { label: 'Abolish Policing Toolkit · PDF · English', url: 'https://criticalresistance.org/wp-content/uploads/2020/12/CR_Abolish-Policing-Toolkit_2020.pdf' }
      ]
    },
    {
      id: 'incite',
      name: 'INCITE! Community Accountability',
      language: 'English',
      description: {
        de: 'Praxiswerkzeug zu Community Accountability, geschlechtsspezifischer Gewalt und staatlicher Gewalt aus feministischen Communities of Color.',
        en: 'A practical resource on community accountability, gender violence and state violence from feminist communities of colour.'
      },
      url: 'https://incite-national.org/community-accountability/',
      downloads: [
        { label: 'Community Accountability Toolkit · PDF · English', url: 'https://incite-national.org/wp-content/uploads/2018/08/TOOLKIT-FINAL.pdf' }
      ]
    },
    {
      id: 'indigenous-action',
      name: 'Indigenous Action',
      language: 'English',
      description: {
        de: 'Indigene, antikoloniale Analysen und Zines zu Land, Autonomie, Solidarität und dem Unterschied zwischen Verbündeten und Kompliz*innen.',
        en: 'Indigenous anti-colonial analysis and zines on land, autonomy, solidarity and the distinction between allies and accomplices.'
      },
      url: 'https://www.indigenousaction.org/zines/',
      downloads: [
        { label: 'Accomplices Not Allies · PDF · English', url: 'https://www.indigenousaction.org/wp-content/uploads/accomplices-not-allies-print-friendly.pdf' }
      ]
    },
    {
      id: 'beautiful-trouble',
      name: 'Beautiful Trouble Toolbox',
      language: 'Multilingual',
      description: {
        de: 'Eine mehrsprachige Sammlung von Taktiken, Prinzipien und Theorien für soziale Bewegungen, direkte Aktionen und Kampagnen.',
        en: 'A multilingual collection of tactics, principles and theories for social movements, direct action and campaigns.'
      },
      url: 'https://beautifultrouble.org/toolbox',
      downloads: [
        { label: 'Toolbox Guide · Online / downloads', url: 'https://beautifultrouble.org/toolbox-guide' }
      ]
    },
    {
      id: 'abcf-support',
      name: 'Anarchist Black Cross Federation · Support Guide',
      language: 'English',
      description: {
        de: 'Praxisleitfaden für langfristige Gefangenenunterstützung, Briefkontakt, Öffentlichkeit und verantwortliche Solidaritätsarbeit.',
        en: 'A practical guide to long-term prisoner support, correspondence, public work and responsible solidarity.'
      },
      url: 'https://www.abcf.net/support-guide/',
      downloads: []
    },
    {
      id: 'wri-refuse',
      name: 'War Resisters’ International · The Right to Refuse to Kill',
      language: 'Multilingual',
      description: {
        de: 'Internationale Dokumentation und Unterstützung zu Kriegsdienstverweigerung, antimilitaristischer Organisierung und Schutz von Verweigernden.',
        en: 'International documentation and support on conscientious objection, antimilitarist organising and protection for refusers.'
      },
      url: 'https://wri-irg.org/en/programmes/right-refuse-kill',
      downloads: []
    }
  ];

  const TERMS = [
    {
      id: 'anarchism', category: 'basics', sources: ['afaq', 'libcom'],
      title: { de: 'Anarchismus', en: 'Anarchism' },
      aliases: { de: ['antiautoritärer Sozialismus'], en: ['anti-authoritarian socialism'] },
      summary: {
        de: 'Eine vielfältige politische Tradition, die Herrschaft und aufgezwungene Hierarchien kritisiert und eine freie, solidarische Selbstorganisation von unten anstrebt.',
        en: 'A diverse political tradition that challenges domination and imposed hierarchy and seeks free, solidaristic self-organisation from below.'
      },
      practice: {
        de: 'Entscheidungen werden möglichst von den Betroffenen selbst getroffen. Kooperation, gegenseitige Hilfe und freiwillige Föderationen ersetzen zentrale Herrschaft.',
        en: 'Decisions should be made by the people affected. Cooperation, mutual aid and voluntary federations replace centralised rule.'
      },
      debate: {
        de: 'Anarchistische Strömungen unterscheiden sich unter anderem bei Ökonomie, Organisation, Gewaltfragen, Technologie und dem Verhältnis zu anderen Bewegungen.',
        en: 'Anarchist tendencies differ on economics, organisation, violence, technology and relations with other movements.'
      },
      related: ['libertarian-communism', 'mutual-aid', 'federation']
    },
    {
      id: 'libertarian-communism', category: 'basics', sources: ['afaq', 'libcom'],
      title: { de: 'Libertärer Kommunismus', en: 'Libertarian communism' },
      aliases: { de: ['Anarchokommunismus'], en: ['anarchist communism', 'anarcho-communism'] },
      summary: {
        de: 'Eine kommunistische und antiautoritäre Vorstellung einer klassenlosen Gesellschaft ohne Staat, Lohnarbeit und Privateigentum an Produktionsmitteln.',
        en: 'A communist and anti-authoritarian vision of a classless society without a state, wage labour or private ownership of productive resources.'
      },
      practice: {
        de: 'Produktion und Verteilung werden gemeinschaftlich und selbstverwaltet organisiert; Bedürfnisse und freie Vereinbarungen treten an die Stelle von Profit und Befehl.',
        en: 'Production and distribution are organised collectively and through self-management; needs and free agreement replace profit and command.'
      },
      debate: {
        de: 'Diskutiert werden etwa Übergänge, Verteilung, Koordination im großen Maßstab und das Verhältnis von individueller Freiheit und kollektiven Absprachen.',
        en: 'Debates concern transition, distribution, large-scale coordination and the relation between individual freedom and collective agreements.'
      },
      related: ['anarchism', 'mutual-aid', 'federation']
    },
    {
      id: 'mutual-aid', category: 'basics', sources: ['afaq', 'libcom'],
      title: { de: 'Gegenseitige Hilfe', en: 'Mutual aid' },
      aliases: { de: ['solidarische Selbsthilfe'], en: ['solidarity-based support'] },
      summary: {
        de: 'Eine Form solidarischer Zusammenarbeit, bei der Menschen Bedürfnisse gemeinsam erfüllen, statt Hilfe als Wohltätigkeit von oben zu organisieren.',
        en: 'Solidaristic cooperation through which people meet needs together rather than organising help as charity from above.'
      },
      practice: {
        de: 'Beispiele sind selbstorganisierte Essensverteilungen, Streikkassen, Nachbarschaftshilfe, Gesundheitskollektive und solidarische Katastrophenhilfe.',
        en: 'Examples include self-organised food distribution, strike funds, neighbourhood support, health collectives and solidarity disaster relief.'
      },
      debate: {
        de: 'Gegenseitige Hilfe ersetzt nicht automatisch politische Organisierung; sie kann bestehende Verhältnisse lindern oder Teil ihrer Veränderung werden.',
        en: 'Mutual aid does not automatically replace political organising; it can merely soften existing conditions or become part of changing them.'
      },
      related: ['collective-care', 'self-organisation', 'direct-action']
    },
    {
      id: 'direct-action', category: 'basics', sources: ['afaq', 'libcom'],
      title: { de: 'Direkte Aktion', en: 'Direct action' },
      aliases: { de: ['unmittelbares Handeln'], en: ['acting directly'] },
      summary: {
        de: 'Handeln, mit dem Betroffene selbst unmittelbar auf ein Problem oder Machtverhältnis einwirken, statt die Lösung ausschließlich an Stellvertretungen zu delegieren.',
        en: 'Action through which affected people intervene directly in a problem or power relation rather than delegating the solution entirely to representatives.'
      },
      practice: {
        de: 'Dazu können Streiks, Blockaden, Besetzungen, Boykotte, kollektive Verweigerung und der direkte Aufbau von Alternativen gehören.',
        en: 'It can include strikes, blockades, occupations, boycotts, collective refusal and directly building alternatives.'
      },
      debate: {
        de: 'Der Begriff beschreibt eine Handlungsweise, nicht automatisch eine bestimmte Taktik. Über Ziele, Risiken und Beteiligung muss jeweils gemeinsam entschieden werden.',
        en: 'The term describes a mode of action, not one fixed tactic. Goals, risks and participation need collective decisions in each situation.'
      },
      related: ['self-organisation', 'class-struggle', 'prefiguration']
    },
    {
      id: 'prefiguration', category: 'basics', sources: ['afaq', 'libcom'],
      title: { de: 'Präfiguration', en: 'Prefiguration' },
      aliases: { de: ['vorwegnehmende Politik'], en: ['prefigurative politics'] },
      summary: {
        de: 'Der Versuch, gewünschte gesellschaftliche Beziehungen schon in heutigen Organisationsformen, Entscheidungen und alltäglichen Praktiken anzulegen.',
        en: 'The attempt to embody desired social relations in present-day organising, decision-making and everyday practice.'
      },
      practice: {
        de: 'Eine herrschaftsfreie Zukunft soll nicht durch dauerhaft autoritäre Mittel entstehen; Strukturen werden deshalb möglichst horizontal, solidarisch und veränderbar gestaltet.',
        en: 'A non-dominating future should not be built through permanently authoritarian means, so structures aim to be horizontal, solidaristic and open to change.'
      },
      debate: {
        de: 'Spannungen entstehen zwischen dem Anspruch, Alternativen vorzuleben, und der Notwendigkeit, unter bestehenden Machtverhältnissen wirksam zu kämpfen.',
        en: 'Tensions arise between living alternatives now and fighting effectively within existing power relations.'
      },
      related: ['horizontal-organisation', 'direct-action', 'collective-care']
    },
    {
      id: 'federation', category: 'organisation', sources: ['afaq', 'libcom'],
      title: { de: 'Föderalismus', en: 'Federalism' },
      aliases: { de: ['anarchistischer Föderalismus'], en: ['anarchist federalism'] },
      summary: {
        de: 'Eine Organisationsweise, in der autonome Gruppen sich freiwillig verbinden, gemeinsame Aufgaben koordinieren und Macht möglichst nicht in einer Zentrale konzentrieren.',
        en: 'A form of organisation in which autonomous groups associate voluntarily, coordinate shared tasks and avoid concentrating power in a centre.'
      },
      practice: {
        de: 'Delegierte erhalten begrenzte Aufträge, bleiben rechenschaftspflichtig und können abberufen werden. Entscheidungen fließen von unten nach oben.',
        en: 'Delegates receive limited mandates, remain accountable and can be recalled. Decisions flow from the bottom upwards.'
      },
      debate: {
        de: 'Die konkrete Balance zwischen lokaler Autonomie, verbindlichen Absprachen und überregionaler Handlungsfähigkeit bleibt umstritten.',
        en: 'The balance between local autonomy, binding agreements and wider coordination remains contested.'
      },
      related: ['autonomy', 'consensus', 'self-organisation']
    },
    {
      id: 'self-organisation', category: 'organisation', sources: ['afaq', 'libcom'],
      title: { de: 'Selbstorganisation', en: 'Self-organisation' },
      aliases: { de: ['Selbstverwaltung'], en: ['self-management'] },
      summary: {
        de: 'Menschen organisieren ihre gemeinsamen Angelegenheiten selbst, ohne dass eine übergeordnete Instanz dauerhaft für sie entscheidet.',
        en: 'People organise their shared affairs themselves without a superior institution permanently deciding for them.'
      },
      practice: {
        de: 'Aufgaben, Wissen und Verantwortung werden geteilt; Regeln und Rollen bleiben überprüfbar und können von den Beteiligten verändert werden.',
        en: 'Tasks, knowledge and responsibility are shared; rules and roles remain reviewable and can be changed by participants.'
      },
      debate: {
        de: 'Formale Hierarchien abzuschaffen verhindert informelle Macht nicht automatisch. Zugang, Zeit, Wissen und Konfliktfähigkeit müssen mitbedacht werden.',
        en: 'Removing formal hierarchy does not automatically prevent informal power. Access, time, knowledge and capacity for conflict must also be addressed.'
      },
      related: ['horizontal-organisation', 'autonomy', 'federation']
    },
    {
      id: 'horizontal-organisation', category: 'organisation', sources: ['afaq', 'libcom'],
      title: { de: 'Horizontale Organisierung', en: 'Horizontal organising' },
      aliases: { de: ['Hierarchiearmut'], en: ['non-hierarchical organising'] },
      summary: {
        de: 'Eine Organisationsweise, die Entscheidungsmacht verteilt, gleiche Beteiligung ermöglicht und feste Befehlsketten vermeidet.',
        en: 'An approach that distributes decision-making power, enables equal participation and avoids fixed chains of command.'
      },
      practice: {
        de: 'Moderation, rotierende Aufgaben, offene Protokolle, zugängliche Informationen und transparente Mandate können horizontale Strukturen unterstützen.',
        en: 'Facilitation, rotating tasks, open minutes, accessible information and transparent mandates can support horizontal structures.'
      },
      debate: {
        de: 'Horizontalität ist kein Zustand ohne Macht. Unsichtbare Hierarchien müssen benannt und aktiv bearbeitet werden.',
        en: 'Horizontality does not mean power disappears. Invisible hierarchies need to be named and actively addressed.'
      },
      related: ['self-organisation', 'consensus', 'prefiguration']
    },
    {
      id: 'consensus', category: 'organisation', sources: ['afaq', 'creative-interventions'],
      title: { de: 'Konsens', en: 'Consensus' },
      aliases: { de: ['konsensorientierte Entscheidung'], en: ['consensus decision-making'] },
      summary: {
        de: 'Ein Entscheidungsverfahren, das eine gemeinsam tragbare Lösung sucht und Einwände ernst nimmt, statt nur Mehrheiten zu zählen.',
        en: 'A decision process seeking an outcome people can live with and taking objections seriously rather than merely counting majorities.'
      },
      practice: {
        de: 'Gute Verfahren unterscheiden Zustimmung, Bedenken, Beiseitestehen und Blockaden und legen fest, wann andere Verfahren nötig sind.',
        en: 'Good processes distinguish consent, concerns, standing aside and blocks, and define when another decision method is needed.'
      },
      debate: {
        de: 'Konsens kann Minderheiten schützen, aber ohne gute Moderation auch Druck, endlose Sitzungen oder versteckte Vetomacht erzeugen.',
        en: 'Consensus can protect minorities but without good facilitation can create pressure, endless meetings or hidden veto power.'
      },
      related: ['horizontal-organisation', 'federation', 'community-accountability']
    },
    {
      id: 'autonomy', category: 'organisation', sources: ['afaq', 'libcom'],
      title: { de: 'Autonomie', en: 'Autonomy' },
      aliases: { de: ['Selbstbestimmung'], en: ['self-determination'] },
      summary: {
        de: 'Die Fähigkeit von Menschen und Gruppen, ihre Angelegenheiten selbstbestimmt zu gestalten – nicht isoliert, sondern in Beziehungen gegenseitiger Verantwortung.',
        en: 'The capacity of people and groups to shape their affairs through self-determination—not in isolation but within relations of mutual responsibility.'
      },
      practice: {
        de: 'Autonome Gruppen können eigene Entscheidungen treffen und zugleich verbindliche föderale Absprachen mit anderen eingehen.',
        en: 'Autonomous groups can make their own decisions while entering binding federal agreements with others.'
      },
      debate: {
        de: 'Individuelle, kollektive und regionale Autonomie können miteinander in Spannung geraten; Abhängigkeiten verschwinden nicht durch ihre bloße Erklärung.',
        en: 'Individual, collective and regional autonomy can conflict, and dependencies do not disappear merely by declaring autonomy.'
      },
      related: ['federation', 'self-organisation', 'collective-care']
    },
    {
      id: 'syndicalism', category: 'organisation', sources: ['afaq', 'libcom'],
      title: { de: 'Syndikalismus', en: 'Syndicalism' },
      aliases: { de: ['revolutionärer Syndikalismus'], en: ['revolutionary syndicalism'] },
      summary: {
        de: 'Eine Strömung der Arbeiter*innenbewegung, die gewerkschaftliche Selbstorganisation und direkte Arbeitskämpfe als zentrale gesellschaftliche Kraft versteht.',
        en: 'A current of the labour movement that treats union self-organisation and direct workplace struggle as a central social force.'
      },
      practice: {
        de: 'Arbeitskämpfe sollen unmittelbare Verbesserungen erkämpfen und zugleich Fähigkeiten und Strukturen für eine selbstverwaltete Gesellschaft entwickeln.',
        en: 'Workplace struggles aim to win immediate improvements while developing capacities and structures for a self-managed society.'
      },
      debate: {
        de: 'Syndikalistische Traditionen unterscheiden sich in revolutionären Zielen, Organisationsformen und ihrem Verhältnis zu Staat, Parteien und Anarchismus.',
        en: 'Syndicalist traditions differ over revolutionary goals, organisational forms and their relationship to the state, parties and anarchism.'
      },
      related: ['class-struggle', 'direct-action', 'federation']
    },
    {
      id: 'transformative-justice', category: 'justice', sources: ['transformharm', 'creative-interventions'],
      title: { de: 'Transformative Gerechtigkeit', en: 'Transformative justice' },
      aliases: { de: ['Transformative Justice', 'TJ'], en: ['TJ'] },
      summary: {
        de: 'Ein Ansatz, der auf Gewalt reagiert, Sicherheit und Heilung unterstützt, Verantwortungsübernahme ermöglicht und zugleich die gesellschaftlichen Bedingungen verändern will, die Gewalt begünstigen.',
        en: 'An approach that responds to harm, supports safety and healing, enables accountability and seeks to change the social conditions that make violence more likely.'
      },
      practice: {
        de: 'Betroffene Bedürfnisse, Sicherheit, Veränderung schädigenden Verhaltens, Unterstützung durch das Umfeld und langfristige Prävention werden gemeinsam betrachtet.',
        en: 'Survivor needs, safety, change in harmful behaviour, community support and long-term prevention are considered together.'
      },
      debate: {
        de: 'Es gibt kein universelles Verfahren. Prozesse können riskant sein und benötigen Zustimmung, Ressourcen, Schutz vor Machtmissbrauch und ehrliche Grenzen.',
        en: 'There is no universal procedure. Processes can carry risks and require consent, resources, safeguards against abuse of power and honest limits.'
      },
      related: ['community-accountability', 'abolition', 'restorative-justice']
    },
    {
      id: 'restorative-justice', category: 'justice', sources: ['transformharm'],
      title: { de: 'Restaurative Gerechtigkeit', en: 'Restorative justice' },
      aliases: { de: ['wiederherstellende Gerechtigkeit'], en: ['restorative practices'] },
      summary: {
        de: 'Ein Ansatz, der entstandenen Schaden, Bedürfnisse, Verantwortung und mögliche Wiedergutmachung ins Zentrum stellt, statt hauptsächlich Regelbruch und Bestrafung zu betrachten.',
        en: 'An approach centring harm, needs, responsibility and possible repair rather than focusing primarily on rule-breaking and punishment.'
      },
      practice: {
        de: 'Mögliche Formen reichen von moderierten Gesprächen bis zu gemeinschaftlichen Vereinbarungen; Teilnahme und Sicherheit müssen sorgfältig geklärt werden.',
        en: 'Forms range from facilitated dialogue to community agreements; participation and safety require careful consideration.'
      },
      debate: {
        de: 'Restaurative Verfahren können innerhalb staatlicher Institutionen stattfinden. Transformative Ansätze kritisieren, dass dadurch strukturelle Ursachen unberührt bleiben können.',
        en: 'Restorative practices can operate inside state institutions. Transformative approaches argue that this may leave structural causes untouched.'
      },
      related: ['transformative-justice', 'community-accountability', 'abolition']
    },
    {
      id: 'community-accountability', category: 'justice', sources: ['transformharm', 'creative-interventions'],
      title: { de: 'Community Accountability', en: 'Community accountability' },
      aliases: { de: ['gemeinschaftliche Verantwortungsübernahme'], en: ['community-based accountability'] },
      summary: {
        de: 'Gemeinschaftsbasierte Prozesse, mit denen Gewalt benannt, Betroffene unterstützt, schädigendes Verhalten verändert und das soziale Umfeld in Verantwortung genommen werden soll.',
        en: 'Community-based processes intended to name harm, support survivors, change harmful behaviour and make the wider social environment accountable.'
      },
      practice: {
        de: 'Mögliche Schritte sind Sicherheitsplanung, Unterstützungsnetzwerke, klare Forderungen, überprüfbare Vereinbarungen und langfristige Begleitung.',
        en: 'Possible steps include safety planning, support networks, clear demands, reviewable agreements and long-term accompaniment.'
      },
      debate: {
        de: 'Eine „Community“ ist nicht automatisch sicher oder gerecht. Freundschaften, Status, Rassismus, Sexismus und materielle Abhängigkeiten beeinflussen solche Prozesse.',
        en: 'A “community” is not automatically safe or just. Friendships, status, racism, sexism and material dependency shape these processes.'
      },
      related: ['transformative-justice', 'collective-care', 'consensus']
    },
    {
      id: 'abolition', category: 'justice', sources: ['transformharm', 'creative-interventions'],
      title: { de: 'Abolitionismus', en: 'Abolition' },
      aliases: { de: ['Gefängnisabolition', 'Gefängnisabschaffung'], en: ['prison abolition'] },
      summary: {
        de: 'Eine Bewegung gegen Gefängnisse, Polizei und andere strafende Institutionen, die zugleich materielle Bedingungen und gemeinschaftliche Fähigkeiten für Sicherheit ohne Einsperrung aufbauen will.',
        en: 'A movement against prisons, policing and other punitive institutions that also builds material conditions and community capacities for safety without confinement.'
      },
      practice: {
        de: 'Dazu gehören der Abbau strafender Systeme und der Ausbau von Wohnen, Versorgung, Konfliktbearbeitung, Prävention, Unterstützung und demokratischer Kontrolle.',
        en: 'It includes dismantling punitive systems while expanding housing, care, conflict work, prevention, support and democratic control.'
      },
      debate: {
        de: 'Abolition wird oft fälschlich als bloßes Schließen von Gefängnissen verstanden. Zentral ist ebenso die Frage, wodurch Sicherheit und Gerechtigkeit stattdessen getragen werden.',
        en: 'Abolition is often mistaken for simply closing prisons. Equally central is what institutions and relationships should support safety and justice instead.'
      },
      related: ['transformative-justice', 'community-accountability', 'collective-care']
    },
    {
      id: 'collective-care', category: 'justice', sources: ['transformharm', 'creative-interventions'],
      title: { de: 'Kollektive Fürsorge', en: 'Collective care' },
      aliases: { de: ['Care', 'radikale Fürsorge'], en: ['radical care'] },
      summary: {
        de: 'Die gemeinsame Verantwortung für körperliches, emotionales und materielles Wohlergehen – besonders unter Bedingungen von Ausbeutung, Repression und Ausschluss.',
        en: 'Shared responsibility for physical, emotional and material wellbeing, especially under conditions of exploitation, repression and exclusion.'
      },
      practice: {
        de: 'Fürsorge kann Barriereabbau, Kinderbetreuung, Essen, Geld, emotionale Unterstützung, Ruhe, Gesundheitsversorgung und nachhaltige Aufgabenverteilung umfassen.',
        en: 'Care can include accessibility, childcare, food, money, emotional support, rest, healthcare and sustainable distribution of work.'
      },
      debate: {
        de: 'Fürsorge darf nicht unsichtbar einzelnen Personen zugeschoben werden. Sie braucht Ressourcen, Grenzen und eine gerechte Verteilung reproduktiver Arbeit.',
        en: 'Care should not be invisibly assigned to a few people. It requires resources, boundaries and fair distribution of reproductive labour.'
      },
      related: ['mutual-aid', 'community-accountability', 'self-organisation']
    },
    {
      id: 'anti-capitalism', category: 'struggles', sources: ['afaq', 'libcom'],
      title: { de: 'Antikapitalismus', en: 'Anti-capitalism' },
      aliases: { de: ['Kapitalismuskritik'], en: ['critique of capitalism'] },
      summary: {
        de: 'Kritik und Widerstand gegen eine Gesellschaft, in der Produktion und Lebensgrundlagen durch Privateigentum, Profit, Marktzwang und Klassenmacht bestimmt werden.',
        en: 'Critique and resistance to a society in which production and the means of life are shaped by private ownership, profit, market compulsion and class power.'
      },
      practice: {
        de: 'Antikapitalistische Praxis reicht von Arbeitskämpfen und Enteignungsforderungen bis zum Aufbau gemeinschaftlicher, selbstverwalteter Alternativen.',
        en: 'Anti-capitalist practice ranges from workplace struggles and expropriation demands to building communal, self-managed alternatives.'
      },
      debate: {
        de: 'Antikapitalistische Strömungen unterscheiden sich stark bei Staat, Parteien, Übergängen, Eigentumsformen und dem Verhältnis anderer Herrschaftsformen zur Klasse.',
        en: 'Anti-capitalist currents differ sharply on the state, parties, transition, ownership and how other forms of domination relate to class.'
      },
      related: ['class-struggle', 'libertarian-communism', 'anti-imperialism']
    },
    {
      id: 'anti-colonialism', category: 'struggles', sources: ['libcom'],
      title: { de: 'Antikolonialismus', en: 'Anti-colonialism' },
      aliases: { de: ['Dekolonisierung'], en: ['decolonisation'] },
      summary: {
        de: 'Widerstand gegen koloniale Herrschaft und ihre fortwirkenden politischen, wirtschaftlichen, kulturellen und epistemischen Machtverhältnisse.',
        en: 'Resistance to colonial rule and its continuing political, economic, cultural and epistemic power relations.'
      },
      practice: {
        de: 'Dazu gehören Kämpfe um Land, Selbstbestimmung, Sprache, Rückgabe geraubter Güter, Reparationen und die Veränderung kolonial geprägter Institutionen.',
        en: 'It includes struggles over land, self-determination, language, return of stolen objects, reparations and transformation of colonial institutions.'
      },
      debate: {
        de: 'Nationale Befreiung kann Kolonialherrschaft brechen, garantiert aber keine herrschaftsfreie Gesellschaft. Staat, Klasse, Patriarchat und indigene Autonomie bleiben umkämpft.',
        en: 'National liberation can break colonial rule but does not guarantee a society without domination. State, class, patriarchy and Indigenous autonomy remain contested.'
      },
      related: ['anti-imperialism', 'autonomy', 'anti-capitalism']
    },
    {
      id: 'anti-imperialism', category: 'struggles', sources: ['afaq', 'libcom'],
      title: { de: 'Antiimperialismus', en: 'Anti-imperialism' },
      aliases: { de: ['Anti-Imperialismus'], en: ['anti-imperialist struggle'] },
      summary: {
        de: 'Widerstand gegen politische, militärische und wirtschaftliche Dominanz mächtiger Staaten und Kapitalinteressen über andere Regionen und Bevölkerungen.',
        en: 'Resistance to political, military and economic domination of regions and peoples by powerful states and capital interests.'
      },
      practice: {
        de: 'Dazu können Kämpfe gegen Besatzung, Krieg, Schuldenregime, Ressourcenraub, Sanktionen und ungleiche Handelsbeziehungen gehören.',
        en: 'It can include struggles against occupation, war, debt regimes, resource extraction, sanctions and unequal trade relations.'
      },
      debate: {
        de: 'Ein emanzipatorischer Antiimperialismus rechtfertigt nicht automatisch autoritäre Regierungen, nur weil sie mit westlichen Mächten im Konflikt stehen.',
        en: 'Emancipatory anti-imperialism does not automatically justify authoritarian governments merely because they oppose Western powers.'
      },
      related: ['anti-colonialism', 'anti-capitalism', 'internationalism']
    },
    {
      id: 'anti-fascism', category: 'struggles', sources: ['libcom'],
      title: { de: 'Antifaschismus', en: 'Anti-fascism' },
      aliases: { de: ['Antifa'], en: ['antifa'] },
      summary: {
        de: 'Politischer und gesellschaftlicher Widerstand gegen faschistische Ideologien, Organisationen, Gewalt und die Bedingungen, unter denen sie wachsen.',
        en: 'Political and social resistance to fascist ideologies, organisations, violence and the conditions in which they grow.'
      },
      practice: {
        de: 'Antifaschismus umfasst Recherche, Aufklärung, Schutz Betroffener, Gegenmobilisierung, direkte Aktion und den Aufbau solidarischer Gegenmacht.',
        en: 'Anti-fascism includes research, education, protecting targeted people, counter-mobilisation, direct action and building solidaristic counter-power.'
      },
      debate: {
        de: 'Strategien unterscheiden sich bei Bündnissen, Öffentlichkeit, Militanz und dem Verhältnis zwischen Abwehr konkreter Gruppen und gesellschaftlicher Ursachenanalyse.',
        en: 'Strategies differ on alliances, publicity, militancy and the balance between confronting groups and addressing social causes.'
      },
      related: ['direct-action', 'anti-capitalism', 'collective-care']
    },
    {
      id: 'class-struggle', category: 'struggles', sources: ['afaq', 'libcom'],
      title: { de: 'Klassenkampf', en: 'Class struggle' },
      aliases: { de: ['Klassenkonflikt'], en: ['class conflict'] },
      summary: {
        de: 'Konflikte zwischen gesellschaftlichen Klassen, deren Interessen und Handlungsmöglichkeiten durch Besitz, Arbeit, Kontrolle über Produktion und Zugang zu Ressourcen geprägt sind.',
        en: 'Conflict between social classes whose interests and capacities are shaped by ownership, labour, control of production and access to resources.'
      },
      practice: {
        de: 'Klassenkampf findet in Betrieben, bei Mieten, Sozialleistungen, Versorgung, Land, Schulden und der Verteilung unbezahlter Arbeit statt.',
        en: 'Class struggle occurs in workplaces and around rent, welfare, care, land, debt and the distribution of unpaid labour.'
      },
      debate: {
        de: 'Klasse wird nicht überall gleich verstanden. Eine emanzipatorische Analyse muss ihre Verbindungen mit Rassismus, Patriarchat, Kolonialismus und Behinderung berücksichtigen.',
        en: 'Class is understood in different ways. Emancipatory analysis must address its relations with racism, patriarchy, colonialism and disability.'
      },
      related: ['anti-capitalism', 'syndicalism', 'direct-action']
    },
    {
      id: 'internationalism', category: 'struggles', sources: ['afaq', 'libcom'],
      title: { de: 'Internationalismus', en: 'Internationalism' },
      aliases: { de: ['grenzüberschreitende Solidarität'], en: ['cross-border solidarity'] },
      summary: {
        de: 'Solidarität und gemeinsame Organisierung über Staatsgrenzen hinweg, ausgehend davon, dass Herrschafts- und Ausbeutungsverhältnisse international miteinander verbunden sind.',
        en: 'Solidarity and shared organising across state borders, recognising that systems of domination and exploitation are internationally connected.'
      },
      practice: {
        de: 'Dazu gehören gegenseitige Unterstützung, Übersetzung, gemeinsame Kampagnen, Streiksolidarität und das Lernen zwischen Bewegungen.',
        en: 'It includes mutual support, translation, shared campaigns, strike solidarity and learning across movements.'
      },
      debate: {
        de: 'Internationalismus muss lokale Unterschiede und ungleiche Macht beachten, damit Solidarität nicht zu Bevormundung oder politischer Projektion wird.',
        en: 'Internationalism must account for local differences and unequal power so that solidarity does not become paternalism or political projection.'
      },
      related: ['anti-imperialism', 'anti-colonialism', 'mutual-aid']
    }
  ];

  const extraTerm = (id, category, sources, deTitle, enTitle, deSummary, enSummary, dePractice, enPractice, deDebate, enDebate, related, aliases = {}) => ({
    id,
    category,
    sources,
    title: { de: deTitle, en: enTitle },
    aliases,
    summary: { de: deSummary, en: enSummary },
    practice: { de: dePractice, en: enPractice },
    debate: { de: deDebate, en: enDebate },
    related,
    revision: { version: '2.1-preview', date: '2026-08-05', note: 'Editorial draft reviewed for the expanded preview glossary.' }
  });

  TERMS.push(
    extraTerm(
      'solidarity', 'basics', ['afaq', 'libcom'], 'Solidarität', 'Solidarity',
      'Gegenseitige Unterstützung in gemeinsamen oder miteinander verbundenen Kämpfen, die über bloßes Mitgefühl hinausgeht.',
      'Mutual support in shared or connected struggles that goes beyond sympathy.',
      'Solidarität zeigt sich durch verlässliche Hilfe, geteilte Risiken, Ressourcen, Streikunterstützung und langfristige Beziehungen.',
      'Solidarity takes shape through reliable aid, shared risk, resources, strike support and long-term relationships.',
      'Sie muss Unterschiede in Macht und Betroffenheit ernst nehmen, ohne Menschen zu bevormunden oder für eigene Ziele zu instrumentalisieren.',
      'It must take differences in power and exposure seriously without paternalism or using people for another agenda.',
      ['mutual-aid', 'internationalism', 'collective-care']
    ),
    extraTerm(
      'commons', 'basics', ['afaq', 'libcom'], 'Commons / Gemeingüter', 'Commons',
      'Ressourcen und Infrastrukturen, die gemeinschaftlich genutzt, gepflegt und nach gemeinsam bestimmten Regeln verwaltet werden.',
      'Resources and infrastructures shared, maintained and governed through collectively determined rules.',
      'Commons können Land, Wissen, Wohnraum, Wasser, digitale Infrastruktur oder Versorgung umfassen.',
      'Commons may include land, knowledge, housing, water, digital infrastructure or systems of care.',
      'Gemeinschaftliche Verwaltung ist nicht automatisch zugänglich oder gerecht; Besitz, Ausschluss und unsichtbare Arbeit bleiben politische Fragen.',
      'Collective governance is not automatically accessible or just; ownership, exclusion and invisible labour remain political questions.',
      ['self-organisation', 'autonomy', 'eco-anarchism']
    ),
    extraTerm(
      'social-revolution', 'basics', ['afaq', 'anarchist-library'], 'Soziale Revolution', 'Social revolution',
      'Eine tiefgreifende Veränderung gesellschaftlicher Beziehungen und Institutionen, nicht nur ein Wechsel von Regierung oder Führung.',
      'A deep transformation of social relations and institutions, not merely a change of government or leadership.',
      'Sie verbindet Widerstand gegen bestehende Herrschaft mit dem Aufbau neuer Formen von Produktion, Fürsorge und Entscheidung.',
      'It links resistance to existing domination with new forms of production, care and decision-making.',
      'Umstritten sind Wege, Zeiträume, Brüche und Übergänge sowie die Gefahr, dass neue Eliten alte Herrschaft ersetzen.',
      'Routes, timeframes, ruptures and transitions are contested, as is the danger that new elites reproduce old domination.',
      ['prefiguration', 'counter-power', 'anti-capitalism']
    ),
    extraTerm(
      'affinity-group', 'organisation', ['afaq', 'beautiful-trouble'], 'Bezugsgruppe', 'Affinity group',
      'Eine kleine Gruppe von Menschen mit Vertrauen, gemeinsamer politischer Orientierung und der Fähigkeit, eigenständig zu handeln.',
      'A small group whose members share trust, political orientation and the capacity to act autonomously.',
      'Bezugsgruppen bereiten Aktionen vor, achten aufeinander, verteilen Rollen und können sich mit anderen Gruppen koordinieren.',
      'Affinity groups prepare actions, look after one another, distribute roles and coordinate with other groups.',
      'Vertrauen darf nicht mit Abschottung verwechselt werden; informelle Gruppen können Zugänge und Verantwortung unsichtbar machen.',
      'Trust should not become closure; informal groups can obscure access and accountability.',
      ['federation', 'direct-action', 'security-culture']
    ),
    extraTerm(
      'assembly', 'organisation', ['afaq', 'libcom'], 'Versammlung', 'Assembly',
      'Ein Raum, in dem Betroffene gemeinsam beraten und Entscheidungen über gemeinsame Angelegenheiten treffen.',
      'A space where affected people deliberate and decide shared matters together.',
      'Versammlungen brauchen verständliche Verfahren, Moderation, Zugänglichkeit, Protokolle und transparente Umsetzung.',
      'Assemblies need understandable procedures, facilitation, accessibility, records and transparent implementation.',
      'Formale Offenheit genügt nicht: Redezeit, Wissen, Sprache und soziale Stellung beeinflussen tatsächliche Beteiligung.',
      'Formal openness is not enough: speaking time, knowledge, language and social position shape real participation.',
      ['consensus', 'delegation-mandate', 'horizontal-organisation']
    ),
    extraTerm(
      'delegation-mandate', 'organisation', ['afaq'], 'Delegiertes Mandat', 'Mandated delegation',
      'Eine zeitlich und inhaltlich begrenzte Übertragung einer Aufgabe, bei der Delegierte an Beschlüsse gebunden und abwählbar bleiben.',
      'A limited transfer of a task in which delegates remain bound by decisions and can be recalled.',
      'Mandate, Berichtspflicht, Rotation und Widerruf sollen verhindern, dass Koordination zu dauerhafter Stellvertretungsmacht wird.',
      'Mandates, reporting, rotation and recall aim to prevent coordination becoming permanent representative power.',
      'Zu enge Mandate können Verhandlungen blockieren; zu offene Mandate können demokratische Kontrolle aushöhlen.',
      'Mandates that are too narrow can block negotiation, while open mandates can weaken democratic control.',
      ['assembly', 'federation', 'decentralisation']
    ),
    extraTerm(
      'decentralisation', 'organisation', ['afaq'], 'Dezentralisierung', 'Decentralisation',
      'Die Verteilung von Entscheidungen, Wissen und Ressourcen auf mehrere selbstständige Einheiten statt auf ein Zentrum.',
      'The distribution of decisions, knowledge and resources among autonomous units rather than a single centre.',
      'Lokale Gruppen entscheiden möglichst selbst und koordinieren gemeinsame Aufgaben föderal.',
      'Local groups decide as much as possible themselves and coordinate shared work federally.',
      'Dezentralisierung allein beseitigt Macht nicht; ungleiche Ressourcen und informelle Zentren können bestehen bleiben.',
      'Decentralisation alone does not remove power; unequal resources and informal centres can remain.',
      ['autonomy', 'federation', 'delegation-mandate']
    ),
    extraTerm(
      'counter-power', 'organisation', ['beautiful-trouble', 'libcom'], 'Gegenmacht', 'Counter-power',
      'Kollektive Fähigkeit, Herrschaft zu begrenzen und eigene Institutionen, Beziehungen und Handlungsmöglichkeiten aufzubauen.',
      'Collective capacity to constrain domination while building independent institutions, relationships and agency.',
      'Gegenmacht kann durch Gewerkschaften, Nachbarschaftsstrukturen, Besetzungen, Versorgungsnetze und Bewegungsmedien entstehen.',
      'Counter-power can grow through unions, neighbourhood structures, occupations, care networks and movement media.',
      'Sie kann sich verfestigen und neue Hierarchien bilden; deshalb bleiben demokratische Kontrolle und Zugänglichkeit zentral.',
      'It can harden into new hierarchies, making democratic control and accessibility essential.',
      ['prefiguration', 'social-revolution', 'self-organisation']
    ),
    extraTerm(
      'disability-justice', 'justice', ['sins-invalid'], 'Disability Justice', 'Disability justice',
      'Ein intersektionaler Ansatz, der Ableismus mit Rassismus, Kapitalismus, Kolonialismus, Geschlecht und weiteren Herrschaftsverhältnissen zusammendenkt.',
      'An intersectional approach linking ableism with racism, capitalism, colonialism, gender and other systems of domination.',
      'Im Mittelpunkt stehen Führung durch besonders Betroffene, kollektiver Zugang, gegenseitige Abhängigkeit und nachhaltige Bewegungsarbeit.',
      'It centres leadership by those most affected, collective access, interdependence and sustainable movement practice.',
      'Barrierefreiheit ist mehr als individuelle Anpassung; auch Tempo, Kultur, Ressourcen und Vorstellungen von Leistung müssen verändert werden.',
      'Accessibility is more than individual accommodation; pace, culture, resources and ideas of productivity also need transformation.',
      ['ableism', 'collective-care', 'intersectionality']
    ),
    extraTerm(
      'healing-justice', 'justice', ['transformharm', 'sins-invalid'], 'Healing Justice', 'Healing justice',
      'Ein bewegungsbezogener Ansatz, der Heilung von individuellem und kollektivem Trauma mit dem Kampf gegen strukturelle Gewalt verbindet.',
      'A movement-based approach connecting healing from individual and collective trauma with struggles against structural violence.',
      'Er kann kulturelle Praxis, Gesundheitsversorgung, Trauerarbeit, Ruhe, Konfliktbearbeitung und politische Organisierung verbinden.',
      'It may combine cultural practice, healthcare, grief work, rest, conflict work and political organising.',
      'Heilung darf nicht zur individualisierten Pflicht oder zum Ersatz für materielle und politische Veränderung werden.',
      'Healing must not become an individual obligation or a substitute for material and political change.',
      ['collective-care', 'transformative-justice', 'disability-justice']
    ),
    extraTerm(
      'consent', 'justice', ['creative-interventions', 'incite'], 'Konsens / Zustimmung', 'Consent',
      'Freiwillige, informierte, konkrete und widerrufbare Zustimmung, die nicht aus Druck, Angst oder Abhängigkeit entsteht.',
      'Voluntary, informed, specific and revocable agreement that is not produced by pressure, fear or dependency.',
      'Zustimmung wird aktiv kommuniziert, kann sich verändern und muss bei Machtgefällen besonders sorgfältig geprüft werden.',
      'Consent is actively communicated, can change and requires particular care where power is unequal.',
      'Ein einmaliges Ja ist kein dauerhafter Freibrief; formale Zustimmung kann materielle Abhängigkeit verdecken.',
      'A single yes is not permanent permission; formal consent can conceal material dependency.',
      ['survivor-centering', 'community-accountability', 'collective-care']
    ),
    extraTerm(
      'survivor-centering', 'justice', ['creative-interventions', 'incite'], 'Betroffenenorientierung', 'Survivor-centering',
      'Eine Praxis, die Bedürfnisse, Entscheidungen, Sicherheit und Selbstbestimmung der von Gewalt betroffenen Person ernst nimmt.',
      'A practice that takes the needs, choices, safety and autonomy of a person subjected to harm seriously.',
      'Unterstützung wird gemeinsam geklärt, statt über den Kopf der betroffenen Person hinweg zu entscheiden.',
      'Support is defined together rather than decided over the survivor’s head.',
      'Betroffenenorientierung bedeutet weder, jede Person allein zu lassen, noch komplexe Prozesse ohne Schutz und kollektive Verantwortung zu führen.',
      'Survivor-centering means neither leaving someone alone nor conducting complex processes without safeguards and collective responsibility.',
      ['consent', 'transformative-justice', 'community-accountability']
    ),
    extraTerm(
      'carceral-logic', 'justice', ['critical-resistance', 'transformharm'], 'Straflogik', 'Carceral logic',
      'Die Vorstellung, Sicherheit entstehe vor allem durch Überwachung, Ausschluss, Zwang, Einsperrung und Bestrafung.',
      'The idea that safety is produced primarily through surveillance, exclusion, coercion, confinement and punishment.',
      'Abolitionistische Praxis untersucht, wie Straflogiken auch in Schulen, Psychiatrie, Sozialarbeit, Grenzen und Bewegungen wirken.',
      'Abolitionist practice examines how carceral logics operate in schools, psychiatry, welfare, borders and movements.',
      'Grenzen und Schutzmaßnahmen sind nicht automatisch strafend; entscheidend sind Zweck, Macht, Verhältnismäßigkeit und mögliche Alternativen.',
      'Boundaries and safeguards are not automatically carceral; purpose, power, proportionality and alternatives matter.',
      ['abolition', 'transformative-justice', 'community-accountability']
    ),
    extraTerm(
      'intersectionality', 'power', ['sins-invalid', 'incite'], 'Intersektionalität', 'Intersectionality',
      'Ein Analyseansatz dafür, wie unterschiedliche Macht- und Unterdrückungsverhältnisse gleichzeitig wirken und sich gegenseitig prägen.',
      'A framework for understanding how different systems of power and oppression operate simultaneously and shape one another.',
      'Politische Praxis fragt nicht nur nach einzelnen Kategorien, sondern danach, wer durch ihre Überschneidung besonders ausgeschlossen wird.',
      'Political practice asks not only about separate categories but who is especially excluded through their intersections.',
      'Intersektionalität ist mehr als eine Liste von Identitäten und verliert ohne Macht-, Institutions- und Verteilungsanalyse ihren kritischen Gehalt.',
      'Intersectionality is more than a list of identities and loses its critical force without analysis of power, institutions and distribution.',
      ['disability-justice', 'racial-capitalism', 'patriarchy']
    ),
    extraTerm(
      'racial-capitalism', 'power', ['incite', 'libcom'], 'Rassifizierter Kapitalismus', 'Racial capitalism',
      'Eine Analyse, nach der kapitalistische Entwicklung historisch durch Rassifizierung, Kolonialismus, Enteignung und ungleich bewertete Arbeit geprägt ist.',
      'An analysis that capitalist development has historically relied on racialisation, colonialism, dispossession and unequally valued labour.',
      'Sie verbindet Kämpfe gegen Ausbeutung mit Kämpfen gegen Grenzen, Polizei, Kolonialität und rassistische Arbeitsteilung.',
      'It links struggles against exploitation with struggles against borders, policing, coloniality and racial divisions of labour.',
      'Der Begriff wird unterschiedlich verwendet; wichtig ist, Rassismus weder auf Klasse zu reduzieren noch Kapitalismus ohne Rassifizierung zu erklären.',
      'The term is used differently; racism should neither be reduced to class nor capitalism explained without racialisation.',
      ['anti-capitalism', 'anti-colonialism', 'intersectionality']
    ),
    extraTerm(
      'settler-colonialism', 'power', ['indigenous-action'], 'Siedlerkolonialismus', 'Settler colonialism',
      'Eine fortdauernde koloniale Struktur, die auf Landnahme, Verdrängung indigener Gesellschaften und dauerhafter Ansiedlung beruht.',
      'An ongoing colonial structure based on taking land, displacing Indigenous societies and permanent settlement.',
      'Widerstand umfasst Landrückgabe, Schutz indigener Souveränität, Wiederbelebung von Sprachen und Abbau kolonialer Institutionen.',
      'Resistance includes land return, protection of Indigenous sovereignty, language revitalisation and dismantling colonial institutions.',
      'Der Begriff darf indigene Gesellschaften nicht vereinheitlichen; konkrete Geschichte, Recht und Selbstbestimmung sind entscheidend.',
      'The term must not flatten Indigenous societies; specific histories, law and self-determination are essential.',
      ['land-back', 'anti-colonialism', 'coloniality']
    ),
    extraTerm(
      'patriarchy', 'power', ['libcom', 'incite'], 'Patriarchat', 'Patriarchy',
      'Ein Geflecht gesellschaftlicher Machtverhältnisse, das Männer und Männlichkeit strukturell privilegiert und Geschlechter hierarchisiert.',
      'A system of social power that structurally privileges men and masculinity and organises gender hierarchically.',
      'Antipatriarchale Praxis verändert Arbeitsteilung, Gewaltverhältnisse, Sexualnormen, politische Kultur und materielle Abhängigkeiten.',
      'Anti-patriarchal practice changes divisions of labour, violence, sexual norms, political culture and material dependency.',
      'Patriarchat wirkt nicht für alle gleich und muss mit Klasse, Rassismus, Kolonialismus, Queerfeindlichkeit und Ableismus zusammengedacht werden.',
      'Patriarchy does not affect everyone equally and must be analysed with class, racism, colonialism, queer oppression and ableism.',
      ['intersectionality', 'consent', 'anti-capitalism']
    ),
    extraTerm(
      'ableism', 'power', ['sins-invalid'], 'Ableismus', 'Ableism',
      'Die Abwertung und strukturelle Benachteiligung behinderter, chronisch kranker oder neurodivergenter Menschen durch Normen von Körper, Geist und Leistung.',
      'The devaluation and structural exclusion of disabled, chronically ill or neurodivergent people through norms of body, mind and productivity.',
      'Anti-ableistische Praxis schafft kollektiven Zugang, flexible Beteiligung, verständliche Kommunikation und materielle Unterstützung.',
      'Anti-ableist practice builds collective access, flexible participation, understandable communication and material support.',
      'Ableismus ist nicht nur eine Frage falscher Sprache oder individueller Vorurteile, sondern in Arbeit, Medizin, Wohnen und Institutionen verankert.',
      'Ableism is not only harmful language or personal prejudice; it is embedded in work, medicine, housing and institutions.',
      ['disability-justice', 'collective-care', 'intersectionality']
    ),
    extraTerm(
      'civil-disobedience', 'tactics', ['beautiful-trouble', 'anarchist-library'], 'Ziviler Ungehorsam', 'Civil disobedience',
      'Bewusster, öffentlicher Verstoß gegen Regeln oder Gesetze, um Unrecht sichtbar zu machen oder politische Veränderung zu erzwingen.',
      'A deliberate, public breach of rules or laws intended to expose injustice or compel political change.',
      'Formen reichen von Blockaden und Besetzungen bis zur Verweigerung staatlicher Anordnungen.',
      'Forms range from blockades and occupations to refusal of state orders.',
      'Umstritten sind Gewaltfreiheit, Öffentlichkeit, rechtliche Risiken und die Frage, wer Folgen tragen kann oder muss.',
      'Nonviolence, publicity, legal risk and who can or must bear consequences are contested.',
      ['direct-action', 'blockade', 'occupation']
    ),
    extraTerm(
      'security-culture', 'tactics', ['beautiful-trouble', 'anarchist-library'], 'Sicherheitskultur', 'Security culture',
      'Gemeinsame Gewohnheiten zum Schutz von Menschen, Informationen und Strukturen vor Überwachung, Repression und vermeidbaren Risiken.',
      'Shared habits that protect people, information and organising from surveillance, repression and avoidable risk.',
      'Dazu gehören bedarfsgerechte Informationsweitergabe, sichere Kommunikation, Vorbereitung und solidarischer Umgang mit Fehlern.',
      'It includes need-to-know information sharing, secure communication, preparation and a solidaristic response to mistakes.',
      'Übertriebene Geheimhaltung kann Angst, Ausschluss und informelle Macht verstärken; Maßnahmen sollten konkret, verhältnismäßig und überprüfbar sein.',
      'Excessive secrecy can intensify fear, exclusion and informal power; measures should be specific, proportionate and reviewable.',
      ['affinity-group', 'direct-action', 'collective-care']
    ),
    extraTerm(
      'diversity-of-tactics', 'tactics', ['beautiful-trouble'], 'Vielfalt der Aktionsformen', 'Diversity of tactics',
      'Ein Bewegungsprinzip, nach dem unterschiedliche Gruppen verschiedene, miteinander vereinbare Aktionsformen einsetzen können.',
      'A movement principle allowing different groups to use varied, mutually compatible forms of action.',
      'Absprachen sollen Handlungsspielraum erhalten und zugleich verhindern, dass eine Taktik andere ohne Zustimmung gefährdet.',
      'Agreements aim to preserve room for action while preventing one tactic from endangering others without consent.',
      'Der Begriff löst Konflikte nicht automatisch; Ziele, Macht, Risiken, öffentliche Wirkung und Verantwortlichkeit müssen konkret verhandelt werden.',
      'The term does not resolve conflict automatically; goals, power, risk, public effects and accountability require concrete negotiation.',
      ['direct-action', 'consent', 'security-culture']
    ),
    extraTerm(
      'occupation', 'tactics', ['beautiful-trouble', 'libcom'], 'Besetzung', 'Occupation',
      'Die kollektive Aneignung oder Nutzung eines Ortes gegen den Willen formaler Eigentümer*innen oder Autoritäten.',
      'The collective taking or use of a place against the wishes of formal owners or authorities.',
      'Besetzungen können Wohnraum schaffen, Produktion unter Kontrolle bringen, Protest sichtbar machen oder Infrastruktur verteidigen.',
      'Occupations can create housing, take control of production, make protest visible or defend infrastructure.',
      'Dauer, Zugang, Sicherheit, Nachbarschaft, Repression und Entscheidungsstrukturen bestimmen, ob eine Besetzung tragfähig ist.',
      'Duration, access, safety, neighbourhood relations, repression and decision structures shape whether an occupation can last.',
      ['direct-action', 'commons', 'counter-power']
    ),
    extraTerm(
      'blockade', 'tactics', ['beautiful-trouble'], 'Blockade', 'Blockade',
      'Eine Aktion, die Verkehrs-, Waren-, Arbeits- oder Entscheidungsabläufe gezielt unterbricht, um Druck auszuüben.',
      'An action that deliberately interrupts flows of traffic, goods, work or decision-making to exert pressure.',
      'Blockaden können körperlich, technisch, symbolisch oder durch massenhafte Verweigerung organisiert werden.',
      'Blockades can be organised physically, technically, symbolically or through mass refusal.',
      'Ziel, Verhältnis zu Betroffenen, Eskalationsrisiko, Barrieren und rechtliche Folgen müssen sorgfältig eingeschätzt werden.',
      'Targets, effects on others, escalation risk, accessibility and legal consequences require careful assessment.',
      ['civil-disobedience', 'direct-action', 'strike']
    ),
    extraTerm(
      'strike', 'tactics', ['libcom', 'afaq'], 'Streik', 'Strike',
      'Die organisierte Verweigerung von Arbeit oder anderen notwendigen Tätigkeiten, um kollektive Forderungen durchzusetzen.',
      'The organised refusal of work or other necessary activity in order to enforce collective demands.',
      'Streiks können betrieblich, politisch, sozial, feministisch, als Miet- oder Schulstreik stattfinden.',
      'Strikes may be workplace, political, social, feminist, rent or school strikes.',
      'Wirksamkeit und Zugänglichkeit hängen von Organisierung, Streikkassen, Sorgearbeit, rechtlichem Status und Solidarität ab.',
      'Effectiveness and accessibility depend on organising, strike funds, care work, legal status and solidarity.',
      ['syndicalism', 'class-struggle', 'solidarity']
    ),
    extraTerm(
      'eco-anarchism', 'ecology', ['afaq', 'libcom'], 'Öko-Anarchismus', 'Eco-anarchism',
      'Anarchistische Ansätze, die ökologische Zerstörung mit Staat, Kapitalismus, Kolonialismus und hierarchischer Naturbeherrschung verbinden.',
      'Anarchist approaches connecting ecological destruction with the state, capitalism, colonialism and hierarchical domination of nature.',
      'Praxis kann Klimakämpfe, Landverteidigung, gemeinschaftliche Versorgung, direkte Aktion und ökologische Wiederherstellung verbinden.',
      'Practice may link climate struggle, land defence, communal provision, direct action and ecological restoration.',
      'Ökologische Politik kann autoritär werden, wenn sie soziale Ungleichheit, indigene Rechte und demokratische Kontrolle ignoriert.',
      'Ecological politics can become authoritarian when it ignores social inequality, Indigenous rights and democratic control.',
      ['climate-justice', 'commons', 'anti-capitalism']
    ),
    extraTerm(
      'climate-justice', 'ecology', ['beautiful-trouble', 'sins-invalid'], 'Klimagerechtigkeit', 'Climate justice',
      'Ein Ansatz, der Klimakrise, historische Verantwortung und ungleiche Folgen mit Fragen von Klasse, Rassismus, Kolonialismus und Behinderung verbindet.',
      'An approach connecting the climate crisis, historical responsibility and unequal impacts with class, racism, colonialism and disability.',
      'Gefordert werden schnelle Emissionssenkung, Reparationen, Schutz besonders Betroffener und demokratisch kontrollierte Transformation.',
      'It calls for rapid emissions cuts, reparations, protection of those most affected and democratically controlled transformation.',
      'Technische Lösungen reichen nicht aus; zugleich dürfen notwendige Veränderungen nicht auf Menschen mit wenig Macht abgewälzt werden.',
      'Technical solutions are insufficient, while necessary changes must not be shifted onto people with little power.',
      ['eco-anarchism', 'anti-colonialism', 'disability-justice']
    ),
    extraTerm(
      'land-back', 'ecology', ['indigenous-action'], 'Land Back', 'Land Back',
      'Indigene Forderungen nach Rückgabe von Land und nach Wiederherstellung politischer, kultureller und ökologischer Selbstbestimmung.',
      'Indigenous demands for the return of land and restoration of political, cultural and ecological self-determination.',
      'Land Back kann Eigentumsübertragung, Zugang, Mitverwaltung, Schutz heiliger Orte und Anerkennung indigener Rechtsordnungen umfassen.',
      'Land Back may involve transfer of title, access, co-governance, protection of sacred places and recognition of Indigenous law.',
      'Der Begriff darf nicht auf Symbolik reduziert oder von nicht-indigenen Projekten ohne konkrete Beziehung und Verantwortung übernommen werden.',
      'The term should not be reduced to symbolism or appropriated by non-Indigenous projects without concrete relationship and accountability.',
      ['settler-colonialism', 'anti-colonialism', 'commons']
    ),
    extraTerm(
      'food-sovereignty', 'ecology', ['indigenous-action', 'libcom'], 'Ernährungssouveränität', 'Food sovereignty',
      'Das Recht und die kollektive Fähigkeit, Ernährungssysteme demokratisch, ökologisch und an lokalen Bedürfnissen auszurichten.',
      'The right and collective capacity to shape food systems democratically, ecologically and around local needs.',
      'Dazu gehören Zugang zu Land und Saatgut, bäuerliche Rechte, gemeinschaftliche Verteilung und Widerstand gegen Konzernkontrolle.',
      'It includes access to land and seed, peasant rights, communal distribution and resistance to corporate control.',
      'Lokale Produktion ist nicht automatisch gerecht; Arbeitsbedingungen, Geschlecht, Migration und indigene Landrechte bleiben zentral.',
      'Local production is not automatically just; labour, gender, migration and Indigenous land rights remain central.',
      ['commons', 'land-back', 'anti-capitalism']
    ),
    extraTerm(
      'degrowth', 'ecology', ['libcom'], 'Degrowth / Postwachstum', 'Degrowth',
      'Eine Kritik am Zwang zu ständigem Wirtschaftswachstum und ein Vorschlag, materiellen Verbrauch demokratisch zu verringern und Wohlstand neu zu verteilen.',
      'A critique of compulsory economic growth and a proposal to reduce material throughput democratically while redistributing wellbeing.',
      'Im Zentrum stehen weniger zerstörerische Produktion, mehr Zeit, öffentliche Versorgung, Reparatur, Gemeingüter und globale Gerechtigkeit.',
      'It centres less destructive production, more time, public provision, repair, commons and global justice.',
      'Pauschale Schrumpfung kann Ungleichheit verschärfen; entscheidend ist, was, wo und unter wessen Kontrolle reduziert oder ausgebaut wird.',
      'Undirected contraction can deepen inequality; what shrinks or grows, where and under whose control is decisive.',
      ['eco-anarchism', 'commons', 'anti-capitalism']
    )
  );

  TERMS.push(
    extraTerm('anti-authoritarianism','basics',['afaq','libcom'],'Antiautoritarismus','Anti-authoritarianism',
      'Die Ablehnung gesellschaftlicher Verhältnisse, in denen Menschen ohne wirksame Kontrolle, Zustimmung oder Abwahl über andere bestimmen.',
      'Opposition to social arrangements in which people rule others without effective control, consent or recall.',
      'Antiautoritäre Praxis verteilt Entscheidungsmacht, macht Ämter widerrufbar und prüft auch informelle Macht.',
      'Anti-authoritarian practice distributes decision-making, makes roles recallable and examines informal power.',
      'Nicht jede Koordination oder Grenze ist autoritär; entscheidend sind Zweck, Kontrolle, Rechenschaft und reale Wahlmöglichkeiten.',
      'Not every form of coordination or boundary is authoritarian; purpose, control, accountability and real choice matter.',
      ['anarchism','hierarchy','horizontal-organisation']),
    extraTerm('hierarchy','power',['afaq','libcom'],'Hierarchie','Hierarchy',
      'Eine dauerhafte Rangordnung, in der manche Menschen systematisch mehr Entscheidungsmacht, Ressourcen oder gesellschaftlichen Wert erhalten.',
      'A durable ranking that systematically gives some people more decision-making power, resources or social value.',
      'Hierarchien werden in Staat, Betrieb, Familie, Bewegung und Alltag sichtbar gemacht und möglichst abgebaut.',
      'Hierarchies are identified in the state, workplace, family, movements and daily life and reduced where possible.',
      'Fachwissen oder zeitweilige Rollen sind nicht automatisch Herrschaft, müssen aber transparent und kontrollierbar bleiben.',
      'Expertise or temporary roles are not automatically domination, but must remain transparent and accountable.',
      ['anti-authoritarianism','domination','informal-hierarchy']),
    extraTerm('domination','power',['afaq'],'Herrschaft','Domination',
      'Ein Verhältnis, in dem Menschen oder Institutionen dauerhaft die Handlungsmöglichkeiten anderer kontrollieren und Zwang absichern können.',
      'A relation in which people or institutions durably control others’ possibilities and can enforce coercion.',
      'Herrschaftskritik untersucht Gesetze, Eigentum, Gewalt, Abhängigkeit und kulturelle Normalisierung gemeinsam.',
      'Critiques of domination examine law, property, violence, dependency and cultural normalisation together.',
      'Macht ist nicht in jeder Form Herrschaft; kollektive Handlungsfähigkeit kann gerade dem Abbau von Herrschaft dienen.',
      'Power is not always domination; collective capacity can be used to dismantle domination.',
      ['hierarchy','state','counter-power']),
    extraTerm('state','power',['afaq','anarchist-library'],'Staat','State',
      'Ein Gefüge zentralisierter Institutionen, das verbindliche Regeln setzt, Territorium verwaltet und ein Gewaltmonopol beansprucht.',
      'A set of centralised institutions that makes binding rules, administers territory and claims a monopoly of force.',
      'Anarchistische Politik sucht föderale und selbstverwaltete Alternativen für Versorgung, Konfliktbearbeitung und gemeinsame Entscheidungen.',
      'Anarchist politics seeks federated and self-managed alternatives for provision, conflict work and shared decisions.',
      'Staaten unterscheiden sich historisch; die Kritik richtet sich nicht gegen gemeinschaftliche Organisation, sondern gegen verselbständigte Herrschaft.',
      'States differ historically; the critique targets autonomous structures of domination, not collective organisation itself.',
      ['domination','federation','social-revolution']),
    extraTerm('platformism','organisation',['anarchist-library','libcom'],'Plattformismus','Platformism',
      'Eine anarchistisch-kommunistische Organisationsidee mit theoretischer und taktischer Einheit, kollektiver Verantwortung und föderaler Struktur.',
      'An anarchist-communist organisational approach stressing theoretical and tactical unity, collective responsibility and federalism.',
      'Gruppen entwickeln eine gemeinsame Analyse und handeln koordiniert, ohne eine zentralistische Partei zu bilden.',
      'Groups develop a shared analysis and coordinated practice without forming a centralist party.',
      'Kritisiert werden mögliche Vereinheitlichung und Organisationsfixierung; Befürwortende betonen Verbindlichkeit und Lernfähigkeit.',
      'Critics warn of uniformity and organisational fixation; supporters stress commitment and collective learning.',
      ['especifismo','federation','libertarian-communism']),
    extraTerm('especifismo','organisation',['anarchist-library'],'Especifismo','Especifismo',
      'Eine vor allem in Lateinamerika entwickelte Organisationsströmung, die spezifisch anarchistische Organisation und soziale Einfügung verbindet.',
      'An organisational current developed especially in Latin America, linking specific anarchist organisation with social insertion.',
      'Anarchistische Gruppen arbeiten langfristig in sozialen Bewegungen, ohne diese zu kontrollieren oder zu ersetzen.',
      'Anarchist groups work long-term within social movements without controlling or replacing them.',
      'Die Grenze zwischen solidarischer Einfügung und politischer Steuerung muss kontinuierlich reflektiert werden.',
      'The line between solidaristic insertion and political direction requires continual reflection.',
      ['platformism','federation','self-organisation']),
    extraTerm('informal-hierarchy','organisation',['afaq','sins-invalid'],'Informelle Hierarchie','Informal hierarchy',
      'Ungleich verteilte Macht, die nicht in offiziellen Ämtern steht, sondern über Wissen, Beziehungen, Redezeit oder Zugang wirkt.',
      'Unequal power not written into formal roles but exercised through knowledge, relationships, speaking time or access.',
      'Transparente Aufgaben, Rotation, Dokumentation, Barrierefreiheit und Feedback können informelle Macht begrenzen.',
      'Transparent tasks, rotation, documentation, accessibility and feedback can limit informal power.',
      'Strukturlosigkeit beseitigt Hierarchien selten; zugleich lösen formale Regeln allein das Problem nicht.',
      'Lack of structure rarely removes hierarchy, while formal rules alone do not solve it.',
      ['hierarchy','rotation','facilitation']),
    extraTerm('rotation','organisation',['afaq'],'Rotation','Rotation',
      'Der geplante Wechsel von Rollen, Aufgaben und Verantwortung, damit Wissen und Einfluss nicht dauerhaft bei wenigen Personen bleiben.',
      'The planned circulation of roles, tasks and responsibility so knowledge and influence do not remain with a few people.',
      'Übergaben, Begleitung und Dokumentation machen Rotation praktisch lernbar statt nur symbolisch.',
      'Handover, mentoring and documentation make rotation learnable rather than symbolic.',
      'Zu schnelle Rotation kann Kontinuität und Fachwissen schwächen; sie braucht Zeit und Ressourcen.',
      'Rotation that is too rapid can weaken continuity and expertise; it needs time and resources.',
      ['informal-hierarchy','delegation-mandate','facilitation']),
    extraTerm('facilitation','organisation',['creative-interventions'],'Moderation','Facilitation',
      'Die Unterstützung eines Gruppenprozesses, damit Beteiligung, Zeit, Konflikte und Entscheidungen nachvollziehbar gestaltet werden.',
      'Support for a group process so participation, time, conflict and decisions are handled transparently.',
      'Moderation achtet auf Redelisten, Verständnis, Barrieren, Ziele und die Umsetzung von Beschlüssen.',
      'Facilitation attends to speaking order, understanding, barriers, goals and follow-through.',
      'Moderation ist selbst eine Machtposition und sollte begrenzt, rotierend und kritisierbar sein.',
      'Facilitation is itself a position of power and should be limited, rotated and open to criticism.',
      ['assembly','consensus','rotation']),
    extraTerm('conflict-transformation','justice',['transformharm','creative-interventions'],'Konflikttransformation','Conflict transformation',
      'Ein Ansatz, der nicht nur einen Streit beendet, sondern Beziehungen, Bedürfnisse und zugrunde liegende Machtverhältnisse verändert.',
      'An approach that seeks not merely to end a dispute but to change relationships, needs and underlying power.',
      'Er verbindet Gespräch, Schutz, materielle Veränderung, Verantwortungsübernahme und langfristige Vereinbarungen.',
      'It combines dialogue, safeguards, material change, accountability and long-term agreements.',
      'Nicht jeder Konflikt ist symmetrisch; bei Gewalt dürfen Sicherheit und Machtunterschiede nicht relativiert werden.',
      'Not every conflict is symmetrical; violence, safety and power differences must not be relativised.',
      ['transformative-justice','community-accountability','consent']),
    extraTerm('accountability','justice',['transformharm','creative-interventions'],'Verantwortungsübernahme','Accountability',
      'Ein Prozess, in dem Menschen die Auswirkungen ihres Handelns anerkennen, Schaden begrenzen und überprüfbare Veränderungen umsetzen.',
      'A process in which people recognise the effects of their actions, limit harm and make verifiable changes.',
      'Konkrete Schritte, Unterstützung, Grenzen und regelmäßige Überprüfung ersetzen bloße Entschuldigungen.',
      'Concrete steps, support, boundaries and review replace apology alone.',
      'Verantwortung darf weder zu öffentlicher Bestrafung noch zu folgenloser Selbstbeschreibung verkürzt werden.',
      'Accountability should be reduced neither to public punishment nor to consequence-free self-description.',
      ['community-accountability','conflict-transformation','transformative-justice']),
    extraTerm('social-reproduction','power',['libcom','incite'],'Soziale Reproduktion','Social reproduction',
      'Arbeit und Beziehungen, durch die Menschen, Alltag und Gesellschaft erhalten werden, etwa Sorge, Ernährung, Bildung und Wohnen.',
      'Work and relationships that sustain people and society, including care, food, education and housing.',
      'Bewegungen machen unbezahlte und schlecht bezahlte Reproduktionsarbeit sichtbar und organisieren sie kollektiv.',
      'Movements make unpaid and underpaid reproductive labour visible and organise it collectively.',
      'Der Begriff darf Fürsorge nicht romantisieren; entscheidend sind Zwang, Geschlecht, Klasse, Migration und Verteilung.',
      'The term must not romanticise care; coercion, gender, class, migration and distribution are central.',
      ['reproductive-labour','collective-care','anti-capitalism']),
    extraTerm('reproductive-labour','power',['libcom','incite'],'Reproduktionsarbeit','Reproductive labour',
      'Bezahlte oder unbezahlte Tätigkeiten, die Leben und Arbeitskraft täglich und über Generationen erhalten.',
      'Paid or unpaid activities that sustain life and labour day to day and across generations.',
      'Dazu zählen Pflege, Haushalt, emotionale Arbeit, Kinderbetreuung, Bildung und gemeinschaftliche Versorgung.',
      'It includes care, housework, emotional labour, childcare, education and communal provision.',
      'Die Anerkennung darf nicht zu einer natürlichen Zuschreibung an Frauen oder Familien führen.',
      'Recognition must not turn into a naturalised assignment to women or families.',
      ['social-reproduction','collective-care','patriarchy']),
    extraTerm('care-strike','tactics',['libcom','incite'],'Care-Streik','Care strike',
      'Die kollektive Unterbrechung oder Sichtbarmachung von Sorge- und Reproduktionsarbeit als politische Arbeitskampfform.',
      'Collective interruption or public visibility of care and reproductive labour as a form of struggle.',
      'Care-Streiks verbinden Verweigerung mit Notfallversorgung, Solidaritätsnetzen und Forderungen nach Umverteilung.',
      'Care strikes combine refusal with emergency provision, solidarity networks and demands for redistribution.',
      'Vollständige Verweigerung kann Schutzbedürftige treffen; Planung und kollektive Absicherung sind deshalb zentral.',
      'Total withdrawal can harm people who depend on care, making planning and collective safeguards essential.',
      ['strike','social-reproduction','collective-care']),
    extraTerm('prison-abolition','justice',['critical-resistance','transformharm'],'Gefängnisabolition','Prison abolition',
      'Eine Bewegung für die Abschaffung von Gefängnissen und der Bedingungen, die Einsperrung als Standardantwort hervorbringen.',
      'A movement to abolish prisons and the conditions that make confinement a default response.',
      'Sie baut Wohnraum, Versorgung, Konfliktbearbeitung, Prävention und nicht-strafende Formen von Sicherheit aus.',
      'It builds housing, care, prevention, conflict work and non-punitive forms of safety.',
      'Abolition bedeutet nicht, Schaden zu leugnen; sie verlangt konkrete Schutzkonzepte und langfristige institutionelle Veränderung.',
      'Abolition does not deny harm; it requires concrete safeguards and long-term institutional change.',
      ['abolition','carceral-logic','police-abolition']),
    extraTerm('police-abolition','justice',['critical-resistance'],'Polizeiabolition','Police abolition',
      'Eine Bewegung, die polizeiliche Gewalt und Aufgaben abbauen und Ressourcen in gemeinschaftliche Sicherheit und Versorgung verlagern will.',
      'A movement seeking to dismantle policing and shift resources toward community safety and provision.',
      'Praktisch geht es um Entkriminalisierung, Krisenhilfe, Gewaltprävention, Wohnraum und demokratisch kontrollierte Alternativen.',
      'In practice it includes decriminalisation, crisis response, violence prevention, housing and democratically controlled alternatives.',
      'Reformen können Schaden mindern, aber auch Institutionen stabilisieren; darüber bestehen strategische Konflikte.',
      'Reforms may reduce harm but also stabilise institutions, creating strategic disagreements.',
      ['prison-abolition','carceral-logic','community-accountability']),
    extraTerm('border-abolition','struggles',['libcom','afaq'],'Grenzabolition','Border abolition',
      'Die Forderung, Bewegungsfreiheit nicht durch Staatsangehörigkeit, Haft, Abschiebung oder tödliche Grenzregime zu hierarchisieren.',
      'A demand to end hierarchies of movement based on citizenship, detention, deportation and lethal border regimes.',
      'Sie verbindet sichere Wege, gleiche soziale Rechte, Entkriminalisierung und den Abbau von Abschiebeinfrastruktur.',
      'It links safe routes, equal social rights, decriminalisation and dismantling deportation infrastructure.',
      'Offene Grenzen lösen globale Ungleichheit nicht allein; Arbeitsrechte, Wohnen und Antirassismus gehören dazu.',
      'Open borders alone do not solve global inequality; labour rights, housing and anti-racism are also required.',
      ['internationalism','anti-colonialism','freedom-of-movement']),
    extraTerm('mutualism','basics',['afaq','anarchist-library'],'Mutualismus','Mutualism',
      'Eine vielfältige anarchistische Tradition, die Gegenseitigkeit, freie Vereinbarung, Selbstverwaltung und Kritik an Monopol und Ausbeutung betont.',
      'A diverse anarchist tradition stressing reciprocity, free agreement, self-management and opposition to monopoly and exploitation.',
      'Vorschläge reichen von Genossenschaften und gemeinschaftlichem Kredit bis zu föderierten Gemeingütern.',
      'Proposals range from cooperatives and mutual credit to federated commons.',
      'Eigentum, Märkte und Lohnarbeit werden innerhalb mutualistischer Strömungen unterschiedlich bewertet.',
      'Property, markets and wage labour are assessed differently across mutualist currents.',
      ['mutual-aid','federation','commons']),
    extraTerm('anarcho-syndicalism','organisation',['afaq','libcom'],'Anarchosyndikalismus','Anarcho-syndicalism',
      'Eine Strömung, die revolutionäre Gewerkschaften zugleich als Kampforganisation und mögliche Grundlage selbstverwalteter Gesellschaft versteht.',
      'A current viewing revolutionary unions as both fighting organisations and a possible basis for a self-managed society.',
      'Direkte Aktion, föderale Organisation, Klassenkampf und Kontrolle der Produktion stehen im Mittelpunkt.',
      'Direct action, federal organisation, class struggle and workers’ control are central.',
      'Diskutiert werden Grenzen betrieblicher Organisierung und das Verhältnis zu Care-Arbeit, Erwerbslosen und anderen Kämpfen.',
      'Debates concern workplace-centred organising and relations to care work, unemployed people and other struggles.',
      ['syndicalism','strike','federation']),
    extraTerm('council-communism','organisation',['libcom','anarchist-library'],'Rätekommunismus','Council communism',
      'Eine antiautoritäre kommunistische Strömung, die Arbeiter*innenräte statt Partei- oder Staatsführung als Grundlage gesellschaftlicher Macht sieht.',
      'An anti-authoritarian communist current that centres workers’ councils rather than party or state leadership.',
      'Delegierte bleiben gebunden und abwählbar; Produktion und gesellschaftliche Entscheidungen sollen von unten koordiniert werden.',
      'Delegates remain mandated and recallable; production and social decisions are coordinated from below.',
      'Anarchistische Kritik fragt, ob der Fokus auf Betrieb und Klasse andere Herrschaftsverhältnisse ausreichend erfasst.',
      'Anarchist critiques ask whether the focus on workplace and class adequately addresses other forms of domination.',
      ['assembly','delegation-mandate','libertarian-communism']),
    extraTerm('autonomous-space','tactics',['libcom','anarchist-library'],'Autonomer Raum','Autonomous space',
      'Ein selbstorganisierter Ort, der sich staatlicher, kommerzieller oder institutioneller Kontrolle teilweise entzieht.',
      'A self-organised place that partially withdraws from state, commercial or institutional control.',
      'Solche Räume können politische Treffen, Kultur, Wohnen, Versorgung und Infrastruktur verbinden.',
      'Such spaces can combine political meetings, culture, housing, care and infrastructure.',
      'Autonomie ist nie vollständig; Eigentum, Geld, Nachbarschaft, Zugänglichkeit und informelle Macht bleiben relevant.',
      'Autonomy is never complete; property, money, neighbourhood relations, accessibility and informal power remain relevant.',
      ['occupation','commons','self-organisation']),
    extraTerm('rent-strike','tactics',['libcom','beautiful-trouble'],'Mietstreik','Rent strike',
      'Die kollektiv organisierte Verweigerung von Mietzahlungen, um Forderungen gegenüber Eigentümer*innen oder Politik durchzusetzen.',
      'Collectively organised refusal to pay rent in order to enforce demands against landlords or government.',
      'Er braucht gemeinsame Beschlüsse, Rechtsberatung, Streikkassen, Schutz vor Räumung und Nachbarschaftsorganisierung.',
      'It requires collective decisions, legal support, strike funds, eviction defence and neighbourhood organising.',
      'Ungleiche Verträge und Risiken können Beteiligte unterschiedlich treffen; Solidarität darf nicht nur symbolisch bleiben.',
      'Unequal contracts and risks affect participants differently; solidarity must be material rather than symbolic.',
      ['strike','squatting','solidarity']),
    extraTerm('boycott','tactics',['beautiful-trouble'],'Boykott','Boycott',
      'Die koordinierte Verweigerung von Kauf, Nutzung oder Zusammenarbeit, um ökonomischen oder politischen Druck auszuüben.',
      'Coordinated refusal to buy, use or cooperate in order to exert economic or political pressure.',
      'Klare Ziele, überprüfbare Forderungen und Alternativen helfen, Beteiligung über symbolische Gesten hinaus aufzubauen.',
      'Clear targets, verifiable demands and alternatives help build participation beyond symbolic gestures.',
      'Boykotte können Beschäftigte oder abhängige Gruppen treffen und benötigen deshalb eine konkrete Folgenabschätzung.',
      'Boycotts can affect workers or dependent groups and therefore require concrete assessment of consequences.',
      ['direct-action','solidarity','blockade']),
    extraTerm('sabotage','tactics',['anarchist-library','libcom'],'Sabotage','Sabotage',
      'Die gezielte Störung von Produktion, Infrastruktur oder Kontrolle, um Ausbeutung, Krieg oder Zerstörung zu behindern.',
      'Deliberate disruption of production, infrastructure or control in order to hinder exploitation, war or destruction.',
      'Historisch reichen Formen von langsamer Arbeit und Maschinenstillstand bis zu digitalen Eingriffen.',
      'Historical forms range from slowdowns and machine stoppages to digital intervention.',
      'Risiken für Menschen, ökologische Folgen, Zielgenauigkeit und Repression müssen besonders streng bewertet werden.',
      'Risks to people, ecological effects, precision and repression require especially strict assessment.',
      ['direct-action','security-culture','blockade']),
    extraTerm('digital-autonomy','tactics',['anarchist-library'],'Digitale Autonomie','Digital autonomy',
      'Die kollektive Fähigkeit, Kommunikation, Daten und technische Infrastruktur möglichst selbstbestimmt zu kontrollieren.',
      'Collective capacity to control communication, data and technical infrastructure as independently as possible.',
      'Dazu gehören freie Software, Verschlüsselung, dezentrale Dienste, Datensparsamkeit und gemeinsames Wissen.',
      'It includes free software, encryption, decentralised services, data minimisation and shared knowledge.',
      'Technische Selbstverwaltung löst soziale Macht nicht automatisch und kann neue Zugangsbarrieren schaffen.',
      'Technical self-management does not automatically solve social power and can create new barriers.',
      ['free-software','security-culture','commons']),
    extraTerm('free-software','tactics',['anarchist-library'],'Freie Software','Free software',
      'Software, deren Nutzung, Untersuchung, Veränderung und Weitergabe durch entsprechende Lizenzen erlaubt ist.',
      'Software whose use, study, modification and redistribution are permitted by its licence.',
      'Freie Software kann gemeinschaftliche Infrastruktur, überprüfbare Sicherheit und Unabhängigkeit von Plattformkonzernen unterstützen.',
      'Free software can support communal infrastructure, auditable security and independence from platform corporations.',
      'Eine freie Lizenz garantiert weder Zugänglichkeit noch demokratische Projektkultur oder Datenschutz.',
      'A free licence guarantees neither accessibility nor democratic project culture nor privacy.',
      ['digital-autonomy','commons','decentralisation']),
    extraTerm('direct-democracy','organisation',['afaq'],'Direkte Demokratie','Direct democracy',
      'Entscheidungsverfahren, in denen Betroffene selbst beraten und entscheiden, statt dauerhafte Repräsentant*innen damit zu beauftragen.',
      'Decision-making in which affected people deliberate and decide themselves rather than assigning permanent representatives.',
      'Versammlungen, imperative Mandate, Rotation und Föderation können direkte Beteiligung über lokale Ebenen hinaus verbinden.',
      'Assemblies, mandated delegates, rotation and federation can connect direct participation beyond the local level.',
      'Mehrheitsentscheide können Minderheiten übergehen; Verfahren brauchen Rechte, Zugang und Konfliktbearbeitung.',
      'Majority decisions can override minorities; processes need rights, access and conflict work.',
      ['assembly','delegation-mandate','federation']),
    extraTerm('anarchist-communism','basics',['afaq','libcom'],'Anarchistischer Kommunismus','Anarchist communism',
      'Eine anarchistische Strömung für gemeinschaftlichen Besitz, freie Bedürfnisbefriedigung und eine föderale Gesellschaft ohne Staat und Klassen.','An anarchist current advocating common ownership, free access according to need and a federated society without state or class.',
      'Produktion, Verteilung und Sorge sollen durch selbstverwaltete Zusammenschlüsse statt Markt, Chef*innen oder Staat koordiniert werden.','Production, distribution and care are coordinated by self-managed associations rather than markets, bosses or the state.',
      'Diskutiert werden Übergänge, Knappheit, Planung und das Verhältnis zwischen individueller Freiheit und kollektiven Entscheidungen.','Debates concern transition, scarcity, planning and the relation between individual freedom and collective decisions.',['libertarian-communism','commons','federation']),
    extraTerm('collectivist-anarchism','basics',['afaq','anarchist-library'],'Kollektivistischer Anarchismus','Collectivist anarchism',
      'Eine historische anarchistische Strömung für kollektivierte Produktionsmittel und föderale Selbstverwaltung.','A historical anarchist current advocating collectivised means of production and federal self-management.',
      'Betriebe und Gemeinden verwalten Ressourcen gemeinsam und koordinieren sich durch widerrufbare Delegation.','Workplaces and communities manage resources collectively and coordinate through recallable delegation.',
      'Umstritten war besonders, ob Verteilung nach Arbeit oder nach Bedürfnissen erfolgen soll.','A central dispute concerned distribution according to labour or according to need.',['anarchist-communism','federation','mutualism']),
    extraTerm('insurrectionary-anarchism','tactics',['anarchist-library'],'Insurrektioneller Anarchismus','Insurrectionary anarchism',
      'Eine Strömung, die unmittelbare Revolte, informelle Organisierung und Brüche mit Herrschaft stärker gewichtet als dauerhafte Massenorganisationen.','A current emphasising immediate revolt, informal organisation and ruptures with domination over permanent mass organisations.',
      'Kleine Bezugsgruppen und autonome Initiativen handeln ohne zentrale Leitung und suchen eine Ausweitung von Konflikten.','Small affinity groups and autonomous initiatives act without central leadership and seek to widen conflicts.',
      'Kritiken betreffen Zugänglichkeit, strategische Kontinuität, Risiken und das Verhältnis zu breiten sozialen Bewegungen.','Critiques concern accessibility, strategic continuity, risk and relations with broad social movements.',['affinity-group','direct-action','social-revolution']),
    extraTerm('social-ecology','ecology',['anarchist-library','afaq'],'Soziale Ökologie','Social ecology',
      'Ein Ansatz, der ökologische Krisen mit gesellschaftlicher Hierarchie und Herrschaft verbindet.','An approach linking ecological crises to social hierarchy and domination.',
      'Er verbindet kommunale Selbstverwaltung, Föderation, ökologische Technik und den Abbau von Herrschaft.','It connects municipal self-government, federation, ecological technology and dismantling domination.',
      'Diskutiert werden Anthropozentrismus, institutionelle Strategie und die Abgrenzung zu anderen ökologischen Strömungen.','Debates concern anthropocentrism, institutional strategy and relations to other ecological currents.',['eco-anarchism','communalism','hierarchy']),
    extraTerm('communalism','organisation',['anarchist-library'],'Kommunalismus','Communalism',
      'Eine Politik demokratischer Gemeinden, die sich föderieren und wirtschaftliche sowie politische Entscheidungen gemeinsam kontrollieren.','A politics of democratic municipalities federating to control economic and political decisions collectively.',
      'Lokale Versammlungen entsenden gebundene Delegierte in Räte für überregionale Aufgaben.','Local assemblies send mandated delegates to councils for tasks across regions.',
      'Offen sind Verhältnis zum Staat, Beteiligung in bestehenden Kommunen und Schutz vor lokaler Ausgrenzung.','Open questions include relations to the state, participation in existing municipalities and protection against local exclusion.',['social-ecology','assembly','federation']),
    extraTerm('queer-anarchism','struggles',['anarchist-library','libcom'],'Queer-Anarchismus','Queer anarchism',
      'Eine Verbindung queerer Befreiung mit anarchistischer Kritik an Staat, Kapitalismus, Patriarchat, Familie und Normalisierung.','A connection between queer liberation and anarchist critiques of the state, capitalism, patriarchy, family and normalisation.',
      'Praxis umfasst Selbstorganisation, gegenseitige Hilfe, Schutz, Care, Wohnraum und Widerstand gegen staatliche und gesellschaftliche Gewalt.','Practice includes self-organisation, mutual aid, safety, care, housing and resistance to state and social violence.',
      'Queerpolitik darf Unterschiede von Klasse, Rassifizierung, Behinderung und Aufenthaltsstatus nicht verdecken.','Queer politics must not obscure differences of class, racialisation, disability and migration status.',['patriarchy','intersectionality','mutual-aid']),
    extraTerm('anarcha-feminism','struggles',['afaq','libcom'],'Anarchafeminismus','Anarcha-feminism',
      'Eine feministische anarchistische Strömung, die patriarchale Herrschaft mit Staat, Kapitalismus und anderen Hierarchien zusammendenkt.','A feminist anarchist current analysing patriarchal domination together with the state, capitalism and other hierarchies.',
      'Sie verändert Organisierung, Sorgearbeit, Sexualität, ökonomische Abhängigkeit und den Umgang mit Gewalt.','It transforms organising, care work, sexuality, economic dependency and responses to violence.',
      'Feministische Erfahrung ist nicht einheitlich; intersektionale und antikoloniale Kritik bleibt notwendig.','Feminist experience is not uniform; intersectional and anti-colonial critique remains necessary.',['patriarchy','intersectionality','reproductive-justice']),
    extraTerm('anti-racism','struggles',['incite','libcom'],'Antirassismus','Anti-racism',
      'Aktiver Widerstand gegen rassistische Ideologien, Institutionen, Gewalt und ungleiche Verteilung von Rechten und Ressourcen.','Active resistance to racist ideologies, institutions, violence and unequal distribution of rights and resources.',
      'Antirassistische Praxis verändert Grenzen, Polizei, Arbeit, Wohnen, Bildung, Bewegungskultur und materielle Macht.','Anti-racist practice changes borders, policing, work, housing, education, movement culture and material power.',
      'Repräsentation und gute Absichten genügen nicht, wenn Strukturen und Ressourcen unverändert bleiben.','Representation and good intentions are insufficient when structures and resources remain unchanged.',['racial-capitalism','intersectionality','anti-colonialism']),
    extraTerm('white-supremacy','power',['incite','critical-resistance'],'Weiße Vorherrschaft','White supremacy',
      'Ein historisch gewachsenes System, das Weißsein materiell, politisch und kulturell privilegiert und andere Menschen rassifiziert abwertet.','A historically produced system materially, politically and culturally privileging whiteness while racialising and subordinating others.',
      'Analyse richtet sich auf Institutionen, Besitz, Grenzen, Polizei, Wissen und alltägliche Vorteile, nicht nur auf offen rechte Gruppen.','Analysis addresses institutions, property, borders, policing, knowledge and everyday advantage, not only openly far-right groups.',
      'Der Begriff braucht konkrete historische und regionale Einordnung und darf andere Rassismen nicht unsichtbar machen.','The term requires specific historical and regional context and should not erase other racisms.',['anti-racism','racial-capitalism','settler-colonialism']),
    extraTerm('coloniality','power',['indigenous-action','incite'],'Kolonialität','Coloniality',
      'Das Fortwirken kolonialer Machtmuster in Wissen, Wirtschaft, Staat, Geschlecht und gesellschaftlichen Hierarchien nach formaler Entkolonisierung.','The persistence of colonial patterns of power in knowledge, economy, state, gender and hierarchy after formal decolonisation.',
      'Dekoloniale Praxis prüft Institutionen, Eigentum, Kategorien, Sprache und internationale Arbeitsteilung.','Decolonial practice examines institutions, property, categories, language and the international division of labour.',
      'Der Begriff darf konkrete Kolonialgeschichten und heutige Besatzungs- oder Siedlerverhältnisse nicht verallgemeinern.','The concept must not flatten specific colonial histories or present occupations and settler relations.',['decolonisation','anti-colonialism','settler-colonialism']),
    extraTerm('decolonisation','struggles',['indigenous-action','libcom'],'Dekolonisierung','Decolonisation',
      'Prozesse zur Beendigung kolonialer Herrschaft und zur Wiederherstellung politischer, materieller, kultureller und epistemischer Selbstbestimmung.','Processes ending colonial domination and restoring political, material, cultural and epistemic self-determination.',
      'Dazu können Landrückgabe, Reparationen, Sprachrevitalisierung und der Abbau kolonialer Institutionen gehören.','It may include land return, reparations, language revitalisation and dismantling colonial institutions.',
      'Dekolonisierung ist mehr als Metapher oder Diversitätsarbeit und muss von konkret Betroffenen bestimmt werden.','Decolonisation is more than metaphor or diversity work and must be shaped by those concretely affected.',['coloniality','land-back','anti-colonialism']),
    extraTerm('reproductive-justice','justice',['incite'],'Reproduktive Gerechtigkeit','Reproductive justice',
      'Ein intersektionaler Ansatz zum Recht, Kinder zu bekommen, keine Kinder zu bekommen und Familien sicher und selbstbestimmt zu versorgen.','An intersectional framework for the right to have children, not have children and raise families safely and autonomously.',
      'Er verbindet Zugang zu Gesundheit und Abtreibung mit Wohnen, Einkommen, Behinderung, Umwelt, Migration und Schutz vor Zwang.','It connects healthcare and abortion access with housing, income, disability, environment, migration and freedom from coercion.',
      'Individuelle Wahl bleibt ohne materielle Bedingungen und Schutz vor staatlicher Kontrolle unvollständig.','Individual choice remains incomplete without material conditions and protection from state control.',['anarcha-feminism','intersectionality','collective-care']),
    extraTerm('harm-reduction','justice',['transformharm','critical-resistance'],'Schadensminderung','Harm reduction',
      'Eine Praxis, die vermeidbaren Schaden verringert, ohne Unterstützung von Abstinenz, Gehorsam oder moralischer Bewertung abhängig zu machen.','A practice reducing preventable harm without making support conditional on abstinence, obedience or moral judgement.',
      'Sie stellt Wissen, sichere Mittel, Gesundheitsversorgung und selbstbestimmte Entscheidungen bereit.','It provides information, safer supplies, healthcare and support for autonomous decisions.',
      'Schadensminderung ersetzt weder strukturelle Veränderung noch darf sie zur technokratischen Verwaltung von Armut werden.','Harm reduction does not replace structural change and must not become technocratic management of poverty.',['collective-care','abolition','healing-justice']),
    extraTerm('mad-pride','struggles',['sins-invalid'],'Mad Pride / Psychiatrie-Erfahrenen-Bewegung','Mad Pride',
      'Eine Bewegung, die psychiatrische Normen, Zwang und Stigmatisierung kritisiert und Wissen von Psychiatrie-Erfahrenen stärkt.','A movement challenging psychiatric norms, coercion and stigma while centring knowledge from psychiatric survivors and mad people.',
      'Praxis umfasst Peer-Support, Krisennetze, Selbstvertretung und Widerstand gegen Zwangsbehandlung und Einsperrung.','Practice includes peer support, crisis networks, self-advocacy and resistance to forced treatment and confinement.',
      'Erfahrungen und Bedürfnisse sind verschieden; Kritik an Zwang darf den freiwilligen Zugang zu hilfreicher Versorgung nicht verhindern.','Experiences and needs differ; opposing coercion should not block voluntary access to helpful care.',['disability-justice','healing-justice','carceral-logic']),
    extraTerm('neurodiversity','power',['sins-invalid'],'Neurodiversität','Neurodiversity',
      'Die Perspektive, neurologische Unterschiede als Teil menschlicher Vielfalt statt ausschließlich als Defizit zu verstehen.','A perspective understanding neurological differences as part of human diversity rather than solely as deficits.',
      'Sie fördert Selbstvertretung, unterschiedliche Kommunikation, flexible Umgebungen und Zugang statt erzwungener Anpassung.','It supports self-advocacy, varied communication, flexible environments and access rather than forced conformity.',
      'Vielfalt anzuerkennen darf Unterstützungsbedarf, Krankheit, Schmerz oder ungleiche Ressourcen nicht leugnen.','Recognising diversity must not deny support needs, illness, pain or unequal resources.',['ableism','disability-justice','collective-care']),
    extraTerm('anti-repression','tactics',['libcom','anarchist-library'],'Antirepression','Anti-repression',
      'Kollektive Unterstützung gegen Überwachung, Strafverfahren, Haft, Berufsverbote und andere staatliche oder private Repression.','Collective support against surveillance, prosecution, imprisonment, blacklisting and other state or private repression.',
      'Sie umfasst Rechtshilfe, Öffentlichkeitsarbeit, Gefangenenunterstützung, Prozessbegleitung, Geld und langfristige Sorge.','It includes legal aid, publicity, prisoner support, court accompaniment, funds and long-term care.',
      'Sicherheitsbedürfnisse müssen mit Transparenz, Betroffenenentscheidungen und dem Schutz vor interner Gewalt verbunden werden.','Security needs must be balanced with transparency, affected people’s choices and protection from internal harm.',['security-culture','prisoner-solidarity','collective-care']),
    extraTerm('prisoner-solidarity','struggles',['critical-resistance','libcom'],'Gefangenensolidarität','Prisoner solidarity',
      'Materielle, politische und persönliche Unterstützung für inhaftierte Menschen und ihre Kämpfe gegen Isolation und Haftbedingungen.','Material, political and personal support for imprisoned people and their struggles against isolation and prison conditions.',
      'Dazu gehören Briefe, Besuche, Geld, Kampagnen, Übersetzung und Unterstützung von Angehörigen.','It includes letters, visits, funds, campaigns, translation and support for families and loved ones.',
      'Sicherheit, Wünsche der inhaftierten Person, Gefängnisregeln und öffentliche Sichtbarkeit müssen sorgfältig abgewogen werden.','Safety, the imprisoned person’s wishes, prison rules and public visibility require careful consideration.',['political-prisoner','anti-repression','prison-abolition']),
    extraTerm('political-prisoner','power',['critical-resistance','anarchist-library'],'Politisch inhaftierte Person','Political prisoner',
      'Eine umstrittene Bezeichnung für Menschen, deren Haft wesentlich mit politischer Aktivität, Zuschreibung, Repression oder Konflikt verbunden ist.','A contested term for people whose imprisonment is substantially connected to political activity, attribution, repression or conflict.',
      'Solidaritätsarbeit dokumentiert Fälle, achtet Selbstbezeichnungen und unterstützt konkrete Bedürfnisse und Verteidigung.','Solidarity work documents cases, respects self-identification and supports concrete needs and defence.',
      'Definitionen unterscheiden sich; Listen brauchen überprüfbare Quellen, Einwilligung, Aktualität und klare Kriterien.','Definitions differ; lists require verifiable sources, consent, currency and transparent criteria.',['prisoner-solidarity','anti-repression','prison-abolition']),
    extraTerm('doxxing','tactics',['anarchist-library'],'Doxxing','Doxxing',
      'Das Sammeln und Veröffentlichen personenbezogener Daten mit dem Ziel oder Risiko von Einschüchterung, Belästigung oder Gewalt.','Collecting and publishing personal information with the aim or risk of intimidation, harassment or violence.',
      'Schutz umfasst Datensparsamkeit, Trennung von Identitäten, Entfernung unnötiger Daten und Unterstützungspläne.','Protection includes data minimisation, separating identities, removing unnecessary data and support plans.',
      'Öffentliches Interesse und Recherche rechtfertigen nicht automatisch die Veröffentlichung privater Daten oder Gefährdung Dritter.','Public interest and investigation do not automatically justify exposing private data or endangering third parties.',['security-culture','operational-security','digital-autonomy']),
    extraTerm('operational-security','tactics',['anarchist-library'],'Operative Sicherheit','Operational security',
      'Ein fortlaufender Prozess, sensible Informationen, mögliche Gegner*innen, Risiken und angemessene Schutzmaßnahmen zu bestimmen.','An ongoing process for identifying sensitive information, potential adversaries, risks and proportionate safeguards.',
      'Gruppen begrenzen Daten, Berechtigungen und Aufbewahrung und planen zugleich Zugänglichkeit und Notfälle.','Groups limit data, permissions and retention while planning accessibility and emergencies.',
      'Übertriebene Geheimhaltung kann Vertrauen, Beteiligung und Verantwortlichkeit beschädigen und ersetzt keine politische Strategie.','Excessive secrecy can damage trust, participation and accountability and does not replace political strategy.',['security-culture','doxxing','digital-autonomy']),
    extraTerm('hacktivism','tactics',['anarchist-library','beautiful-trouble'],'Hacktivismus','Hacktivism',
      'Politisch motivierte digitale Praxis, die technische Fähigkeiten für Protest, Information, Zugang oder Störung einsetzt.','Politically motivated digital practice using technical skills for protest, information, access or disruption.',
      'Formen reichen von Archivierung und Zensurumgehung bis zu digitalen Kampagnen und Eingriffen in Systeme.','Forms range from archiving and censorship circumvention to digital campaigns and interventions in systems.',
      'Rechtliche Folgen, Kollateralschäden, Datenschutz, Einwilligung und ungleiche technische Macht verlangen strenge Abwägung.','Legal consequences, collateral harm, privacy, consent and unequal technical power require strict assessment.',['digital-autonomy','operational-security','direct-action']),
    extraTerm('animal-liberation','struggles',['anarchist-library'],'Tierbefreiung','Animal liberation',
      'Eine Bewegung gegen die Ausbeutung, Gefangenschaft und Tötung nichtmenschlicher Tiere sowie gegen ihre Behandlung als Ware.','A movement opposing exploitation, confinement and killing of non-human animals and their treatment as commodities.',
      'Praxis umfasst direkte Hilfe, Aufklärung, Arbeitskämpfe, Ernährungs- und Produktionsveränderung sowie Widerstand gegen Industrien.','Practice includes direct aid, education, labour struggle, changing food and production and resistance to industries.',
      'Strategien müssen Arbeitsbedingungen, Klasse, Behinderung, indigene Selbstbestimmung, Ökologie und Zugänglichkeit mitdenken.','Strategies must consider labour, class, disability, Indigenous self-determination, ecology and accessibility.',['eco-anarchism','anti-capitalism','direct-action']),
    extraTerm('speciesism','power',['anarchist-library'],'Speziesismus','Speciesism',
      'Die hierarchische Bewertung von Lebewesen allein aufgrund ihrer Artzugehörigkeit, durch die Ausbeutung und Gewalt normalisiert werden.','The hierarchical valuation of beings solely by species membership, normalising exploitation and violence.',
      'Antispeziesistische Praxis untersucht Ernährung, Forschung, Arbeit, Eigentum und ökologische Beziehungen und baut nicht-ausbeuterische Alternativen auf.','Anti-speciesist practice examines food, research, labour, property and ecological relations while building non-exploitative alternatives.',
      'Vergleiche mit menschlichen Unterdrückungsverhältnissen müssen deren Geschichte respektieren und dürfen betroffene Gruppen nicht instrumentalisieren.','Comparisons with human oppression must respect its histories and must not instrumentalise affected groups.',['animal-liberation','hierarchy','eco-anarchism']),
    extraTerm('libertarian-municipalism','organisation',['anarchist-library','afaq'],'Libertärer Munizipalismus','Libertarian municipalism',
      'Ein Ansatz, der demokratische Versammlungen in Gemeinden oder Stadtteilen als Ausgangspunkt föderierter Gegenmacht versteht.','An approach treating democratic assemblies in municipalities or neighbourhoods as a basis for federated counter-power.',
      'Lokale Versammlungen entscheiden möglichst direkt und entsenden gebundene, abwählbare Delegierte in überregionale Räte.','Local assemblies decide as directly as possible and send mandated, recallable delegates to wider councils.',
      'Umstritten sind das Verhältnis zu bestehenden Kommunen, ungleiche Beteiligungsmöglichkeiten und die Gefahr, lokale Grenzen zu idealisieren.','Its relationship to existing municipalities, unequal participation and the risk of idealising local boundaries are contested.',['communalism','federation','direct-democracy']),
    extraTerm('dual-power','organisation',['libcom','anarchist-library'],'Doppelte Macht / Dual Power','Dual power',
      'Eine Strategie, die unabhängige Gegeninstitutionen aufbaut und zugleich die Macht bestehender Institutionen begrenzt oder herausfordert.','A strategy that builds independent counter-institutions while limiting or challenging the power of existing institutions.',
      'Beispiele sind selbstverwaltete Versorgungsnetze, kämpferische Basisorganisationen, Versammlungen und gemeinschaftlich kontrollierte Infrastruktur.','Examples include self-managed care networks, militant grassroots organisations, assemblies and community-controlled infrastructure.',
      'Der Begriff hat unterschiedliche revolutionäre Traditionen; offen bleibt, wann parallele Strukturen tatsächliche Macht gewinnen und wie sie kontrolliert werden.','The term has different revolutionary traditions; when parallel structures gain real power and how they remain accountable are open questions.',['counter-power','prefiguration','commons']),
    extraTerm('solidarity-unionism','organisation',['libcom','afaq'],'Solidarischer Gewerkschaftskampf','Solidarity unionism',
      'Eine basisorientierte Form gewerkschaftlicher Organisierung, die direkte Beteiligung und gemeinsames Handeln stärker gewichtet als Stellvertretung.','A rank-and-file form of workplace organising that prioritises direct participation and collective action over representation.',
      'Beschäftigte bearbeiten konkrete Konflikte gemeinsam, bauen dauerhafte Beziehungen auf und entscheiden über Forderungen und Eskalation selbst.','Workers address concrete disputes together, build lasting relationships and decide demands and escalation themselves.',
      'Informelle Stärke ersetzt weder Schutz noch Ressourcen; Zugänglichkeit, prekäre Arbeit und Repression müssen ausdrücklich berücksichtigt werden.','Informal strength does not replace protection or resources; accessibility, precarious work and repression need explicit attention.',['anarcho-syndicalism','rank-and-file','direct-action']),
    extraTerm('rank-and-file','organisation',['libcom'],'Basisorganisierung im Betrieb','Rank-and-file organising',
      'Organisierung, bei der Beschäftigte Entscheidungen und Aktivitäten möglichst selbst tragen, statt sie dauerhaft an Funktionär*innen abzugeben.','Organising in which workers carry decisions and activity themselves rather than permanently handing them to officials.',
      'Sie nutzt Versammlungen, gewählte und abwählbare Delegierte, transparente Verhandlungen und Verbindungen über einzelne Betriebe hinaus.','It uses assemblies, elected and recallable delegates, transparent negotiations and links beyond individual workplaces.',
      'Auch Basisstrukturen können Ausschlüsse und informelle Hierarchien entwickeln; aktive Zugänge und Rechenschaft bleiben notwendig.','Rank-and-file structures can also develop exclusions and informal hierarchies; active access and accountability remain necessary.',['syndicalism','solidarity-unionism','workers-control']),
    extraTerm('workers-control','power',['libcom','afaq'],'Arbeiter*innenkontrolle / Selbstverwaltung','Workers’ control',
      'Die direkte demokratische Kontrolle von Arbeit und Produktion durch die Menschen, die sie ausführen, statt durch Eigentümer*innen oder Management.','Direct democratic control of work and production by the people doing it rather than owners or management.',
      'Dazu gehören Versammlungen, zugängliche Informationen, gemeinsame Planung, abwählbare Delegation und Kontrolle über Überschüsse und Arbeitsbedingungen.','It includes assemblies, accessible information, collective planning, recallable delegation and control over surplus and working conditions.',
      'Ein einzelner selbstverwalteter Betrieb kann weiterhin Marktzwängen und gesellschaftlicher Ungleichheit unterliegen; gesamtgesellschaftliche Koordination bleibt nötig.','A single self-managed workplace can remain subject to market pressure and social inequality; wider coordination is still needed.',['self-organisation','rank-and-file','commons']),
    extraTerm('wildcat-strike','tactics',['libcom'],'Wilder Streik','Wildcat strike',
      'Ein Streik, der ohne formale Genehmigung oder gegen die Vorgaben einer etablierten Gewerkschaftsführung begonnen wird.','A strike begun without formal authorisation or against the direction of an established union leadership.',
      'Er kann kurzfristig aus einem Konflikt entstehen oder von Beschäftigten bewusst unabhängig vorbereitet werden.','It may emerge quickly from a dispute or be deliberately prepared by workers independently.',
      'Spontane Stärke kann mit hohem rechtlichem und materiellem Risiko verbunden sein; Unterstützung, Kommunikation und gemeinsame Entscheidungen sind zentral.','Spontaneous strength can carry high legal and material risk; support, communication and collective decisions are central.',['strike','rank-and-file','solidarity']),
    extraTerm('general-strike','tactics',['libcom','afaq'],'Generalstreik','General strike',
      'Eine breit angelegte Arbeitsniederlegung über viele Betriebe oder gesellschaftliche Bereiche hinweg, häufig mit politischen Zielen.','A broad work stoppage across many workplaces or social sectors, often pursuing political goals.',
      'Er verbindet betriebliche Organisierung, Versorgung, Streikkassen, öffentliche Kommunikation und Solidarität mit nicht entlohnter Sorgearbeit.','It links workplace organising, provision, strike funds, public communication and solidarity with unpaid care work.',
      'Reichweite, Ziel und demokratische Kontrolle sind umstritten; ein Generalstreik ist kein einzelner symbolischer Aktionstag.','Its scope, goal and democratic control are contested; a general strike is not simply a symbolic day of action.',['strike','care-strike','social-revolution']),
    extraTerm('squatting','tactics',['libcom','anarchist-library'],'Haus- und Landbesetzung','Squatting',
      'Die Nutzung leerstehender Gebäude oder ungenutzten Landes ohne Zustimmung formaler Eigentümer*innen, oft für Wohnen, Kultur oder politische Infrastruktur.','The use of vacant buildings or unused land without formal owners’ consent, often for housing, culture or political infrastructure.',
      'Besetzungen können Räume kollektiv instand setzen, Bedürfnisse unmittelbar erfüllen und Eigentumsverhältnisse öffentlich infrage stellen.','Squats can collectively repair spaces, meet needs directly and publicly challenge property relations.',
      'Dauerhafte Selbstverwaltung verlangt klare Zugänge, Sorgearbeit, Konfliktbearbeitung, Nachbarschaftsbeziehungen und Vorbereitung auf Räumung.','Sustained self-management requires clear access, care work, conflict processes, neighbourhood relations and preparation for eviction.',['occupation','autonomous-space','commons']),
    extraTerm('community-self-defence','tactics',['beautiful-trouble','critical-resistance'],'Kollektiver Selbstschutz','Community self-defence',
      'Gemeinschaftlich organisierte Maßnahmen, mit denen Menschen einander vor konkreter Gewalt, Einschüchterung oder staatlicher Repression schützen.','Collectively organised measures through which people protect one another from concrete violence, intimidation or state repression.',
      'Das kann Begleitung, Beobachtung, sichere Räume, Kommunikationsketten, Deeskalation und verlässliche Nachsorge umfassen.','It can include accompaniment, observation, safer spaces, communication trees, de-escalation and reliable aftercare.',
      'Schutz darf nicht zur unkontrollierten Macht einzelner Gruppen werden; Verhältnismäßigkeit, Einwilligung und Verantwortung sind entscheidend.','Protection must not become unaccountable power for individual groups; proportionality, consent and accountability are essential.',['collective-care','anti-repression','community-accountability']),
    extraTerm('prison-industrial-complex','power',['critical-resistance'],'Gefängnis-Industrie-Komplex','Prison industrial complex',
      'Ein Begriff für das Zusammenspiel von Gefängnissen, Polizei, Gerichten, Politik und wirtschaftlichen Interessen, das Überwachung und Einsperrung ausweitet.','A term for the interaction of prisons, policing, courts, politics and economic interests that expands surveillance and confinement.',
      'Die Analyse fragt, welche Probleme kriminalisiert werden, wer betroffen ist, wer profitiert und welche nicht-strafenden Alternativen möglich sind.','The analysis asks which problems are criminalised, who is affected, who benefits and which non-punitive alternatives are possible.',
      'Der Komplex ist nicht nur privatwirtschaftlich; öffentliche Institutionen, Rassismus, Grenzen, Armut und Ableismus sind ebenfalls zentral.','The complex is not only private business; public institutions, racism, borders, poverty and ableism are also central.',['abolition','prison-abolition','carceral-logic']),
    extraTerm('carceral-feminism','power',['incite','critical-resistance'],'Strafender Feminismus','Carceral feminism',
      'Eine Kritik an feministischen Strategien, die Sicherheit vor Gewalt vor allem durch Polizei, Strafrecht und Gefängnis herstellen wollen.','A critique of feminist strategies that seek safety from violence mainly through policing, criminal law and prisons.',
      'Alternativen verbinden Betroffenenunterstützung mit materieller Sicherheit, Prävention, Verantwortungsübernahme und struktureller Veränderung.','Alternatives connect survivor support with material safety, prevention, accountability and structural change.',
      'Die Kritik darf Gewalt nicht verharmlosen; sie fragt, welche Antworten Betroffene schützen, ohne weitere staatliche Gewalt zu erzeugen.','The critique must not minimise violence; it asks which responses protect survivors without producing further state violence.',['transformative-justice','survivor-centering','carceral-logic']),
    extraTerm('freedom-of-movement','struggles',['libcom','afaq'],'Bewegungsfreiheit','Freedom of movement',
      'Die Forderung, dass Menschen Grenzen überschreiten, ihren Aufenthaltsort wählen und ihr Leben ohne diskriminierende Migrationskontrolle gestalten können.','The demand that people can cross borders, choose where to live and shape their lives without discriminatory migration control.',
      'Sie verbindet Kämpfe gegen Abschiebung und Lager mit Zugang zu Wohnen, Arbeit, Versorgung, politischer Teilhabe und sicheren Fluchtwegen.','It links struggles against deportation and camps with access to housing, work, care, political participation and safe routes.',
      'Formale Reisefreiheit genügt nicht, wenn Geld, Pässe, Rassismus oder Behinderung reale Bewegung verhindern.','Formal travel freedom is insufficient when money, passports, racism or disability block real mobility.',['border-abolition','migrant-solidarity','internationalism']),
    extraTerm('migrant-solidarity','struggles',['libcom','incite'],'Migrantische Solidarität','Migrant solidarity',
      'Gemeinsames Handeln mit und von Menschen, die von Grenzregimen, unsicherem Aufenthalt, Ausbeutung oder Abschiebung betroffen sind.','Collective action with and by people affected by border regimes, insecure status, exploitation or deportation.',
      'Praxis kann Rechts- und Alltagshilfe, Arbeitskämpfe, sichere Unterbringung, Übersetzung und Kampagnen gegen Abschiebung verbinden.','Practice can combine legal and everyday support, workplace struggle, safe housing, translation and anti-deportation campaigns.',
      'Solidarität muss Selbstorganisation und Entscheidungen der direkt Betroffenen stärken, statt sie zu bevormunden oder öffentlich zu gefährden.','Solidarity should strengthen self-organisation and decisions by those directly affected rather than paternalising or exposing them.',['freedom-of-movement','border-abolition','solidarity']),
    extraTerm('trans-liberation','struggles',['anarchist-library','incite'],'Transbefreiung','Trans liberation',
      'Ein Kampf für die Selbstbestimmung von trans, nichtbinären und genderdiversen Menschen sowie gegen institutionelle und alltägliche Geschlechternormen.','A struggle for the self-determination of trans, non-binary and gender-diverse people and against institutional and everyday gender norms.',
      'Er umfasst Zugang zu Gesundheitsversorgung, Wohnen und Arbeit, Schutz vor Gewalt, freie Namenswahl und selbstbestimmte Gemeinschaften.','It includes access to healthcare, housing and work, protection from violence, free choice of name and self-determined communities.',
      'Repräsentation allein beseitigt materielle Ausschlüsse nicht; Klasse, Rassismus, Migration, Haft und Behinderung müssen mitgedacht werden.','Representation alone does not remove material exclusion; class, racism, migration, imprisonment and disability must be considered.',['queer-anarchism','anarcha-feminism','intersectionality']),
    extraTerm('ecofeminism','ecology',['libcom','anarchist-library'],'Ökofeminismus','Ecofeminism',
      'Ansätze, die ökologische Zerstörung mit patriarchaler Herrschaft, kolonialer Landnahme und der Abwertung von Sorge- und Reproduktionsarbeit verbinden.','Approaches linking ecological destruction with patriarchal domination, colonial dispossession and the devaluation of care and reproductive labour.',
      'Ökofeministische Praxis verbindet Land- und Klimakämpfe mit Versorgung, Körperautonomie, Arbeitskämpfen und gemeinschaftlicher Reproduktion.','Ecofeminist practice links land and climate struggles with care, bodily autonomy, labour struggle and collective reproduction.',
      'Biologistische Vorstellungen von Geschlecht oder eine romantische Gleichsetzung von Frauen und Natur werden innerhalb des Ökofeminismus kritisiert.','Biological ideas of gender or romantic equations of women with nature are criticised within ecofeminism.',['climate-justice','social-reproduction','anarcha-feminism']),
    extraTerm('extractivism','ecology',['indigenous-action','libcom'],'Extraktivismus','Extractivism',
      'Ein Wirtschafts- und Herrschaftsmodell, das große Mengen an Rohstoffen, Energie oder Daten entnimmt und Kosten auf Menschen und Ökosysteme abwälzt.','An economic and political model extracting large quantities of resources, energy or data while shifting costs onto people and ecosystems.',
      'Widerstand verbindet Landverteidigung, Arbeitskämpfe, indigene Selbstbestimmung, Klimagerechtigkeit und den Aufbau anderer Versorgungsweisen.','Resistance links land defence, labour struggle, Indigenous self-determination, climate justice and different systems of provision.',
      'Nicht jede Rohstoffnutzung ist gleich; Maßstab, Zweck, Kontrolle, Reparatur und globale Arbeitsteilung müssen konkret untersucht werden.','Not all resource use is identical; scale, purpose, control, repair and global divisions of labour require concrete analysis.',['anti-colonialism','climate-justice','land-back']),
    extraTerm('just-transition','ecology',['beautiful-trouble','sins-invalid'],'Gerechter Übergang','Just transition',
      'Ein Konzept für den sozial und demokratisch gestalteten Umbau weg von fossiler und zerstörerischer Produktion.','A concept for a socially just and democratic shift away from fossil-based and destructive production.',
      'Beschäftigte und betroffene Communities sollen Planung, neue Versorgung, Qualifizierung, Einkommen und ökologische Reparatur mitbestimmen.','Workers and affected communities should shape planning, new provision, training, income protection and ecological repair.',
      'Der Begriff kann zur leeren Formel werden, wenn Eigentum, globale Verantwortung, Tempo und reale Entscheidungsmacht ausgeblendet bleiben.','The term can become empty if ownership, global responsibility, pace and real decision-making power are ignored.',['climate-justice','workers-control','degrowth']),
    extraTerm('counter-information','tactics',['anarchist-library','libcom'],'Gegeninformation','Counter-information',
      'Die unabhängige Sammlung, Prüfung und Verbreitung von Informationen, die dominante Darstellungen ergänzt, widerspricht oder unsichtbare Kämpfe dokumentiert.','The independent collection, verification and distribution of information that supplements or challenges dominant narratives and documents overlooked struggles.',
      'Sie kann Recherche, Übersetzung, Archive, Bewegungsmedien, Flugblätter, Audio, Video und sichere Veröffentlichung verbinden.','It may combine research, translation, archives, movement media, leaflets, audio, video and safer publishing.',
      'Gegenöffentlichkeit ist nicht automatisch korrekt; Quellenschutz, Belege, Korrekturen und die Sicherheit betroffener Menschen bleiben redaktionelle Pflichten.','Counter-public information is not automatically accurate; source protection, evidence, corrections and people’s safety remain editorial duties.',['movement-media','hacktivism','digital-autonomy']),
    extraTerm('movement-media','tactics',['libcom','anarchist-library'],'Bewegungsmedien','Movement media',
      'Medien, die aus sozialen Bewegungen heraus entstehen und deren Kämpfe, Debatten und Wissen unabhängig dokumentieren und verbreiten.','Media produced within social movements to document and circulate their struggles, debates and knowledge independently.',
      'Sie verbinden Berichterstattung mit Archiven, Übersetzung, Gegeninformation und direkter Beteiligung von Menschen aus den jeweiligen Kämpfen.','They combine reporting with archives, translation, counter-information and direct participation by people in the struggles concerned.',
      'Politische Nähe ersetzt keine redaktionelle Sorgfalt; Quellenklarheit, Fehlerkorrektur, Schutz und unterschiedliche Perspektiven bleiben wichtig.','Political proximity does not replace editorial care; clear sourcing, correction, protection and multiple perspectives remain important.',['counter-information','commons','internationalism']),
    extraTerm('digital-self-defence','tactics',['anarchist-library'],'Digitale Selbstverteidigung','Digital self-defence',
      'Alltagstaugliche und verhältnismäßige Praktiken zum Schutz von Kommunikation, Geräten, Konten und Kontakten vor vermeidbaren digitalen Risiken.','Practical and proportionate habits for protecting communication, devices, accounts and contacts from avoidable digital risks.',
      'Dazu gehören sparsame Datennutzung, aktuelle Software, starke Zugänge, verschlüsselte Kommunikation, Backups und gemeinsam vereinbarte Schutzstufen.','It includes data minimisation, current software, strong access controls, encrypted communication, backups and collectively agreed protection levels.',
      'Technik allein schafft keine Sicherheit; Bedrohungsmodell, Zugänglichkeit, menschliche Fehler und solidarische Unterstützung müssen zusammen betrachtet werden.','Technology alone does not create safety; threat models, accessibility, human error and mutual support must be considered together.',['operational-security','security-culture','digital-autonomy'])
    ,extraTerm('climate-justice','ecology',['indigenous-action','libcom'],'Klimagerechtigkeit','Climate justice',
      'Ein Ansatz, der die Klimakrise als Folge ungleicher Macht-, Eigentums- und Kolonialverhältnisse versteht.','An approach understanding the climate crisis as a result of unequal power, ownership and colonial relations.',
      'Klimagerechte Praxis verbindet Emissionssenkung mit Umverteilung, Landrechten, Versorgung, Reparatur und demokratischer Kontrolle.','Climate justice links emission cuts with redistribution, land rights, provision, repair and democratic control.',
      'Ein technischer Wandel ist nicht automatisch gerecht, wenn Kosten ausgelagert und betroffene Menschen von Entscheidungen ausgeschlossen werden.','Technical change is not automatically just when costs are displaced and affected people are excluded from decisions.',['extractivism','just-transition','land-back'])
    ,extraTerm('degrowth','ecology',['anarchist-library','libcom'],'Postwachstum / Degrowth','Degrowth',
      'Eine Kritik am Zwang zu stetigem Wirtschaftswachstum und ein Vorschlag, materiell zerstörerische Produktion demokratisch zu verringern.','A critique of compulsory economic growth and a proposal to democratically reduce materially destructive production.',
      'Im Mittelpunkt stehen gute Versorgung, Zeit, Reparatur, Gemeingüter und globale Gerechtigkeit statt wachsender Warenmengen.','It centres good provision, time, repair, commons and global justice rather than increasing commodity output.',
      'Pauschale Kürzungen können Ungleichheit verschärfen; entscheidend ist, was schrumpft, was wächst und wer darüber entscheidet.','Across-the-board cuts can deepen inequality; what shrinks, what grows and who decides are decisive.',['climate-justice','commons','just-transition'])
    ,extraTerm('land-back','struggles',['indigenous-action'],'Land Back','Land Back',
      'Eine indigene Forderung nach Rückgabe von Land, Wiederherstellung von Beziehungen und realer politischer Selbstbestimmung.','An Indigenous demand for the return of land, restored relationships and meaningful political self-determination.',
      'Sie kann Rückgabe, Mitverwaltung, Zugang, Sprach- und Kulturarbeit sowie den Schutz von Wasser und Ökosystemen umfassen.','It can include restitution, co-governance, access, language and cultural work, and protection of water and ecosystems.',
      'Symbolische Anerkennung ersetzt weder materielle Rückgabe noch die Entscheidungen der jeweils betroffenen indigenen Gemeinschaften.','Symbolic recognition replaces neither material restitution nor the decisions of the Indigenous communities concerned.',['decolonisation','settler-colonialism','climate-justice'])
    ,extraTerm('no-borders','struggles',['libcom','afaq'],'No Borders','No borders',
      'Eine Bewegung und Perspektive gegen Grenzregime, Abschiebung, Lager und die Hierarchisierung von Rechten nach Pass oder Aufenthaltsstatus.','A movement and perspective opposing border regimes, deportation, camps and hierarchies of rights based on passports or status.',
      'Praxis verbindet Bewegungsfreiheit mit sicherem Wohnen, Arbeitsrechten, Versorgung, Fluchthilfe und Selbstorganisation.','Practice links freedom of movement with safe housing, labour rights, care, support in flight and self-organisation.',
      'Grenzen verschwinden nicht durch eine Parole; konkrete Sicherheit, Ressourcen und Entscheidungen direkt Betroffener bleiben zentral.','Borders do not disappear through a slogan; concrete safety, resources and decisions by directly affected people remain central.',['border-abolition','freedom-of-movement','migrant-solidarity'])
    ,extraTerm('consent','justice',['creative-interventions','transformharm'],'Einvernehmen / Consent','Consent',
      'Eine freiwillige, informierte, konkrete und widerrufbare Zustimmung zwischen beteiligten Personen.','A voluntary, informed, specific and revocable agreement between the people involved.',
      'Consent braucht verständliche Kommunikation, reale Wahlmöglichkeiten, Aufmerksamkeit für Machtunterschiede und die Möglichkeit, jederzeit Nein zu sagen.','Consent requires clear communication, real choices, attention to power differences and the possibility to say no at any time.',
      'Schweigen, Abhängigkeit oder frühere Zustimmung sind keine automatische Zustimmung für eine neue Situation.','Silence, dependency or previous agreement are not automatic consent in a new situation.',['community-accountability','collective-care','survivor-centering'])
    ,extraTerm('survivor-centering','justice',['transformharm','incite'],'Betroffenenorientierung','Survivor-centering',
      'Ein Grundsatz, nach dem Sicherheit, Bedürfnisse, Grenzen und Entscheidungen von Betroffenen von Gewalt den Ausgangspunkt einer Reaktion bilden.','A principle making the safety, needs, boundaries and decisions of people harmed the starting point of a response.',
      'Unterstützung kann Schutz, Vertraulichkeit, materielle Hilfe, Begleitung und selbst gewählte Formen von Verantwortungsübernahme verbinden.','Support can combine safety, confidentiality, material aid, accompaniment and chosen forms of accountability.',
      'Betroffenenorientierung bedeutet nicht, Verantwortung auf einzelne Personen abzuwälzen oder andere gefährdete Menschen unsichtbar zu machen.','Survivor-centering does not mean shifting responsibility onto individuals or erasing other people at risk.',['consent','transformative-justice','community-accountability'])
    ,extraTerm('disability-justice','struggles',['sins-invalid'],'Disability Justice','Disability justice',
      'Ein intersektionaler Ansatz gegen Ableismus, der Behinderung mit Rassismus, Kapitalismus, Geschlecht, Migration und weiteren Machtverhältnissen zusammendenkt.','An intersectional approach against ableism connecting disability with racism, capitalism, gender, migration and other power relations.',
      'Er fordert Zugänglichkeit, kollektive Sorge, Selbstbestimmung, materielle Sicherheit und Führung durch besonders betroffene Menschen.','It calls for accessibility, collective care, self-determination, material safety and leadership by those most affected.',
      'Reine Barrierefreiheit einzelner Angebote genügt nicht, wenn Institutionen weiterhin Menschen aussortieren oder abhängig machen.','Accessibility of individual services is insufficient when institutions continue to exclude or create dependency.',['ableism','collective-care','intersectionality'])
    ,extraTerm('source-criticism','tactics',['libcom','anarchist-library'],'Quellenkritik','Source criticism',
      'Die systematische Prüfung, wer eine Information veröffentlicht, worauf sie beruht, in welchem Kontext sie entstand und was unklar bleibt.','The systematic examination of who published information, what supports it, its context and what remains uncertain.',
      'Dazu gehören Originalquelle, Datum, Interessen, Belege, unabhängige Bestätigung, Übersetzung und sichtbare Korrekturen.','It includes the original source, date, interests, evidence, independent corroboration, translation and visible corrections.',
      'Politische Nähe oder professionelles Auftreten beweisen keine Richtigkeit; zugleich darf Unsicherheit nicht zur falschen Gleichsetzung aller Quellen führen.','Political affinity or professional appearance do not prove accuracy, while uncertainty should not falsely equate all sources.',['counter-information','movement-media','digital-autonomy'])
    ,extraTerm('algorithmic-governance','power',['anarchist-library','libcom'],'Algorithmische Steuerung','Algorithmic governance',
      'Der Einsatz automatisierter Bewertung, Sortierung und Vorhersage, um Zugänge, Sichtbarkeit, Arbeit oder staatliche Entscheidungen zu lenken.','The use of automated scoring, ranking and prediction to shape access, visibility, work or public decisions.',
      'Kritische Praxis verlangt nachvollziehbare Regeln, Einspruchsmöglichkeiten, Datensparsamkeit und demokratische Kontrolle durch betroffene Menschen.','Critical practice requires explainable rules, routes of appeal, data minimisation and democratic control by affected people.',
      'Ein technisches System ist nicht neutral: Trainingsdaten, Zielvorgaben und Machtverhältnisse prägen seine Ergebnisse.','A technical system is not neutral: training data, objectives and power relations shape its outcomes.',['surveillance-capitalism','digital-autonomy','source-criticism'])
    ,extraTerm('surveillance-capitalism','power',['anarchist-library','libcom'],'Überwachungskapitalismus','Surveillance capitalism',
      'Ein Geschäftsmodell, das Verhalten erfasst, auswertet und für Vorhersage, Werbung, Kontrolle oder Marktsteuerung verwertet.','A business model that captures and analyses behaviour for prediction, advertising, control or market direction.',
      'Gegenstrategien verbinden Datensparsamkeit, freie Technik, Regulierung, kollektive Rechte und nichtkommerzielle Infrastruktur.','Counter-strategies combine data minimisation, free technology, regulation, collective rights and non-commercial infrastructure.',
      'Nicht jede Datenerhebung folgt demselben Modell; entscheidend sind Zweck, Eigentum, Zwang, Zugriff und reale Ausweichmöglichkeiten.','Not all data collection follows the same model; purpose, ownership, coercion, access and real alternatives are decisive.',['algorithmic-governance','digital-self-defence','platform-cooperativism'])
    ,extraTerm('platform-cooperativism','organisation',['libcom','anarchist-library'],'Plattformkooperativismus','Platform cooperativism',
      'Der Aufbau digitaler Plattformen, die von Beschäftigten, Nutzer*innen oder Gemeinschaften gemeinsam besessen und kontrolliert werden.','The building of digital platforms jointly owned and controlled by workers, users or communities.',
      'Dazu gehören demokratische Satzungen, transparente Technik, faire Verteilung, Datenrechte und rechenschaftspflichtige Leitung.','It includes democratic rules, transparent technology, fair distribution, data rights and accountable governance.',
      'Eine Genossenschaftsform allein verhindert weder informelle Hierarchien noch Marktdruck; reale Mitentscheidung muss überprüfbar bleiben.','A cooperative legal form alone prevents neither informal hierarchy nor market pressure; meaningful participation must remain verifiable.',['workers-control','commons','data-commons'])
    ,extraTerm('data-commons','organisation',['anarchist-library','libcom'],'Daten-Gemeingut','Data commons',
      'Datenbestände und Regeln, die gemeinschaftlich verwaltet werden und einem klaren öffentlichen oder kollektiven Zweck dienen.','Data and rules governed collectively for a clear public or shared purpose.',
      'Ein Daten-Gemeingut braucht begrenzte Zugriffe, Zustimmung, dokumentierte Verantwortung, Schutz vor Weiterverkauf und Möglichkeiten zum Widerspruch.','A data commons needs limited access, consent, documented responsibility, protection from resale and routes to object.',
      'Gemeinsamer Besitz hebt Datenschutzrisiken nicht auf; sensible Daten können auch in solidarischen Projekten Menschen gefährden.','Shared ownership does not remove privacy risks; sensitive data can endanger people even in solidarity projects.',['commons','digital-autonomy','platform-cooperativism'])
    ,extraTerm('accessibility','justice',['sins-invalid'],'Barrierefreiheit','Accessibility',
      'Die Gestaltung von Räumen, Informationen und Technik so, dass Menschen mit unterschiedlichen Körpern, Sinnen, Sprachen und Bedürfnissen teilnehmen können.','The design of spaces, information and technology so people with different bodies, senses, languages and needs can participate.',
      'Sie umfasst verständliche Sprache, Tastatur- und Screenreader-Nutzung, Untertitel, Pausen, Wege, Assistenz und mehrere Zugangsformen.','It includes plain language, keyboard and screen-reader access, captions, rest, physical access, assistance and multiple ways to participate.',
      'Barrierefreiheit ist kein nachträgliches Extra; Betroffene müssen Planung, Prüfung und Prioritäten mitbestimmen.','Accessibility is not an afterthought; affected people must shape planning, testing and priorities.',['disability-justice','collective-care','consent'])
    ,extraTerm('solidarity-disaster-response','tactics',['beautiful-trouble','libcom'],'Solidarische Katastrophenhilfe','Solidarity disaster response',
      'Selbstorganisierte gegenseitige Hilfe vor, während und nach Katastrophen, ausgehend von lokalen Bedürfnissen und Fähigkeiten.','Self-organised mutual aid before, during and after disasters, grounded in local needs and capacities.',
      'Sie kann Warnketten, Evakuierung, Versorgung, medizinische Unterstützung, Reparatur und langfristigen Wiederaufbau verbinden.','It can combine warning networks, evacuation, supplies, medical support, repair and long-term rebuilding.',
      'Spontane Hilfe braucht Schutz, Koordination und Verantwortlichkeit und darf staatliche Pflichten oder lokale Selbstbestimmung nicht verdrängen.','Spontaneous aid needs safety, coordination and accountability and must not displace public duties or local self-determination.',['mutual-aid','collective-care','climate-justice'])
    ,extraTerm('anti-militarism','struggles',['afaq','libcom'],'Antimilitarismus','Anti-militarism',
      'Widerstand gegen Militärherrschaft, Aufrüstung, Kriegsvorbereitung und die gesellschaftliche Normalisierung militärischer Gewalt.','Resistance to military rule, armament, preparation for war and the social normalisation of military violence.',
      'Praxis reicht von Kriegsdienstverweigerung und Deserteur*innenhilfe bis zu Streiks, Rüstungskonversion und grenzüberschreitender Solidarität.','Practice ranges from conscientious objection and support for deserters to strikes, arms conversion and cross-border solidarity.',
      'Antimilitarismus muss die Sicherheit angegriffener Menschen ernst nehmen und darf Herrschaft oder Gewalt nicht einseitig unsichtbar machen.','Anti-militarism must take the safety of people under attack seriously and must not obscure domination or violence selectively.',['internationalism','direct-action','workers-control'])
    ,extraTerm('anarchist-black-cross','organisation',['abcf-support'],'Anarchist Black Cross','Anarchist Black Cross',
      'Ein internationales Geflecht autonomer Gruppen, das anarchistische und andere politische Gefangene unterstützt und gegen Repression arbeitet.','An international network of autonomous groups supporting anarchist and other political prisoners and organising against repression.',
      'Gruppen organisieren Briefabende, materielle Hilfe, Öffentlichkeitsarbeit, Prozessbegleitung und langfristige Beziehungen zu Gefangenen.','Groups organise letter-writing nights, material support, public work, court support and long-term relationships with prisoners.',
      'Die Bezeichnung ist kein einheitliches Gütesiegel: Gruppen arbeiten autonom, und Adressen sowie Unterstützungswünsche müssen immer aktuell geprüft werden.','The name is not a single quality seal: groups work autonomously, and addresses and support wishes must always be checked for currency.',['prisoner-solidarity','anti-repression','prison-abolition'])
    ,extraTerm('prisoner-solidarity','justice',['abcf-support','critical-resistance'],'Gefangenensolidarität','Prisoner solidarity',
      'Verlässliche politische, soziale und materielle Unterstützung für inhaftierte Menschen unter Achtung ihrer eigenen Wünsche und Grenzen.','Reliable political, social and material support for imprisoned people that respects their own wishes and boundaries.',
      'Dazu gehören Briefkontakt, Fonds, Besuche, Übersetzungen, Öffentlichkeitsarbeit und Unterstützung für Angehörige und Support-Netzwerke.','It includes correspondence, funds, visits, translation, public work and support for families and support networks.',
      'Solidarität darf Menschen nicht vereinnahmen oder gefährden; Einwilligung, Datenschutz, aktuelle Gefängnisregeln und Kontinuität sind zentral.','Solidarity must not appropriate or endanger people; consent, privacy, current prison rules and continuity are central.',['anarchist-black-cross','letter-writing-solidarity','anti-repression'])
    ,extraTerm('letter-writing-solidarity','tactics',['abcf-support'],'Briefsolidarität','Letter-writing solidarity',
      'Regelmäßiger Briefkontakt mit Gefangenen, der Isolation durchbricht und politische wie persönliche Verbundenheit ausdrücken kann.','Regular correspondence with prisoners that can break isolation and express political as well as personal connection.',
      'Vor jedem Versand werden Adresse, gewünschte Anrede, Sprache, Rückadresse sowie Regeln für Bilder, Beilagen und Papier geprüft.','Before sending, writers check the address, preferred form of address, language, return address and rules for photos, enclosures and paper.',
      'Ein einmaliger symbolischer Brief ersetzt keine verlässliche Beziehung; zugleich bestimmen Gefangene selbst, ob und wie sie Kontakt wünschen.','A one-off symbolic letter does not replace a reliable relationship, while prisoners themselves decide whether and how they want contact.',['prisoner-solidarity','anarchist-black-cross','collective-care'])
    ,extraTerm('prison-censorship','power',['abcf-support','critical-resistance'],'Gefängniszensur','Prison censorship',
      'Kontrolle, Verzögerung, Zurückhaltung oder Ablehnung von Post, Medien und Kommunikation innerhalb von Gefängnissystemen.','The monitoring, delay, withholding or rejection of mail, media and communication within prison systems.',
      'Solidaritätsarbeit dokumentiert Rücksendungen, vermeidet riskante Inhalte und prüft Regeln, ohne Zensur als unveränderlich hinzunehmen.','Solidarity work documents returned mail, avoids risky content and checks rules without treating censorship as unchangeable.',
      'Regeln unterscheiden sich stark und können informell angewandt werden; Sicherheit und Wünsche der angeschriebenen Person gehen vor.','Rules vary widely and may be applied informally; the safety and wishes of the person receiving mail come first.',['letter-writing-solidarity','prisoner-solidarity','anti-repression'])
    ,extraTerm('conscientious-objection','struggles',['wri-refuse'],'Kriegsdienstverweigerung','Conscientious objection',
      'Die Weigerung, Militärdienst oder Beteiligung am Töten aus Gewissens-, politischen, ethischen oder religiösen Gründen zu leisten.','Refusal to perform military service or participate in killing for conscientious, political, ethical or religious reasons.',
      'Unterstützung umfasst Rechtsberatung, internationale Öffentlichkeit, Schutznetzwerke und Organisierung gegen Wehrpflicht und militärischen Zwang.','Support includes legal advice, international visibility, protection networks and organising against conscription and military coercion.',
      'Rechtliche Anerkennung ist weltweit ungleich; antimilitaristische Kritik geht oft über staatlich erlaubte Ersatzdienste hinaus.','Legal recognition is unequal worldwide, and antimilitarist critique often goes beyond state-approved alternative service.',['anti-militarism','deserter-solidarity','direct-action'])
    ,extraTerm('deserter-solidarity','struggles',['wri-refuse'],'Deserteur*innen-Solidarität','Deserter solidarity',
      'Unterstützung für Menschen, die militärische Einheiten verlassen oder sich einer weiteren Teilnahme an Krieg und Gewalt entziehen.','Support for people who leave military units or withdraw from further participation in war and violence.',
      'Sie kann sichere Unterkunft, Rechts- und Asylberatung, materielle Hilfe, Übersetzung und grenzüberschreitende Netzwerke umfassen.','It can include safe housing, legal and asylum advice, material aid, translation and cross-border networks.',
      'Öffentlichkeit kann schützen, aber auch gefährden; Entscheidungen über Namen, Orte und Geschichten müssen bei Betroffenen liegen.','Publicity can protect but also endanger; decisions about names, locations and stories must remain with those affected.',['conscientious-objection','anti-militarism','internationalism'])
    ,extraTerm('arms-conversion','tactics',['wri-refuse','libcom'],'Rüstungskonversion','Arms conversion',
      'Der geplante Umbau militärischer Produktion und Infrastruktur für zivile, sozial nützliche und ökologisch tragfähige Zwecke.','The planned transformation of military production and infrastructure towards civilian, socially useful and ecologically sustainable purposes.',
      'Beschäftigte, Gemeinden und Friedensbewegungen entwickeln Alternativen, sichern Fähigkeiten und verbinden Abrüstung mit guten Arbeitsplätzen.','Workers, communities and peace movements develop alternatives, retain skills and link disarmament with good jobs.',
      'Konversion darf Kosten nicht auf Beschäftigte abwälzen; entscheidend sind demokratische Kontrolle, Finanzierung und reale zivile Nachfrage.','Conversion must not shift costs onto workers; democratic control, funding and real civilian demand are decisive.',['anti-militarism','workers-control','climate-justice'])
    ,extraTerm('war-profiteering','power',['wri-refuse'],'Kriegsprofite','War profiteering',
      'Gewinne und Machtzuwachs, die Unternehmen, Finanzakteure oder politische Netzwerke aus Krieg, Aufrüstung und Militarisierung ziehen.','Profit and increased power gained by companies, financial actors or political networks from war, armament and militarisation.',
      'Kritische Praxis untersucht Lieferketten, Verträge, Banken, Lobbying und politische Entscheidungen und macht Interessenkonflikte sichtbar.','Critical practice examines supply chains, contracts, banks, lobbying and political decisions and exposes conflicts of interest.',
      'Ökonomische Interessen erklären nicht jeden Krieg allein; Analyse muss zugleich Kolonialismus, Nationalismus, Staatsmacht und konkrete Aggression berücksichtigen.','Economic interests do not explain every war on their own; analysis must also consider colonialism, nationalism, state power and concrete aggression.',['anti-militarism','arms-conversion','source-criticism'])
    ,extraTerm('tenant-union','organisation',['libcom','beautiful-trouble'],'Mieter*innengewerkschaft','Tenant union',
      'Ein dauerhafter Zusammenschluss von Mieter*innen, der gemeinsame Interessen gegenüber Vermieter*innen, Eigentumskonzernen und Behörden organisiert.','A lasting organisation of tenants building collective power toward landlords, property companies and public authorities.',
      'Mitglieder beraten sich, dokumentieren Probleme, verhandeln gemeinsam und organisieren Mietstreiks, Kundgebungen oder Räumungsschutz.','Members advise one another, document problems, bargain collectively and organise rent strikes, demonstrations or eviction defence.',
      'Eine starke Organisation braucht zugängliche Strukturen und darf besonders gefährdete oder informell wohnende Menschen nicht ausschließen.','A strong organisation needs accessible structures and must not exclude especially vulnerable or informally housed people.',['rent-strike','solidarity-unionism','squatting'])
    ,extraTerm('eviction-defence','tactics',['beautiful-trouble','libcom'],'Räumungsschutz','Eviction defence',
      'Kollektive Unterstützung, um Zwangsräumungen zu verhindern, hinauszuzögern oder ihre Folgen solidarisch aufzufangen.','Collective support to prevent or delay forced evictions or respond to their consequences in solidarity.',
      'Sie reicht von Begleitung und Rechtsberatung über Öffentlichkeit bis zu Blockaden, Ersatzunterkunft und langfristiger Organisierung.','It ranges from accompaniment and legal support to publicity, blockades, replacement housing and long-term organising.',
      'Sicherheit, Einwilligung und Ziele der betroffenen Menschen bestimmen Form und Sichtbarkeit der Unterstützung.','The safety, consent and goals of affected people determine the form and visibility of support.',['tenant-union','direct-action','collective-care'])
    ,extraTerm('strike-fund','organisation',['libcom'],'Streikkasse','Strike fund',
      'Gemeinsam verwaltete Mittel, die Beschäftigte und Angehörige während eines Arbeitskampfs materiell absichern.','Collectively governed resources supporting workers and their households during industrial action.',
      'Beiträge, solidarische Spenden und transparente Auszahlungsregeln verlängern die Handlungsfähigkeit eines Streiks.','Contributions, solidarity donations and transparent payment rules extend a strike’s capacity to act.',
      'Verteilung und Kontrolle müssen nachvollziehbar sein, damit finanzielle Abhängigkeit keine neue interne Macht erzeugt.','Distribution and control must be transparent so financial dependency does not create new internal power.',['class-struggle','solidarity-unionism','mutual-aid'])
    ,extraTerm('picket-line','tactics',['libcom'],'Streikposten','Picket line',
      'Eine sichtbare Präsenz Streikender vor einem Betrieb oder Zugang, die informiert, mobilisiert und die Streikwirkung schützt.','A visible presence of strikers at a workplace or entrance that informs, mobilises and protects the strike’s impact.',
      'Streikposten sprechen Kolleg*innen und Öffentlichkeit an, beobachten Zugänge und koordinieren Unterstützung.','Pickets speak with colleagues and the public, monitor access and coordinate support.',
      'Rechtslage, Sicherheit, Barrierefreiheit und der Umgang mit Konflikten müssen gemeinsam vorbereitet werden.','Legal context, safety, accessibility and conflict response need collective preparation.',['general-strike','direct-action','strike-fund'])
    ,extraTerm('lockout','power',['libcom'],'Aussperrung','Lockout',
      'Der Ausschluss von Beschäftigten durch eine Arbeitgeberseite, meist um Arbeitskampf, Organisierung oder Zugeständnisse zu brechen.','The exclusion of workers by an employer, commonly used to break industrial action, organising or concessions.',
      'Gegenwehr verbindet Streikkassen, Öffentlichkeit, betriebliche Organisierung und Solidarität anderer Belegschaften.','Resistance combines strike funds, public pressure, workplace organising and solidarity from other workforces.',
      'Nicht jede Betriebsschließung ist eine Aussperrung; entscheidend sind Zweck, Machtmittel und Zusammenhang des Konflikts.','Not every workplace closure is a lockout; purpose, power and the context of conflict are decisive.',['class-struggle','union-busting','workers-control'])
    ,extraTerm('union-busting','power',['libcom'],'Gewerkschaftsbekämpfung','Union busting',
      'Maßnahmen von Unternehmen oder beauftragten Dienstleistern, die Organisierung, Betriebsgruppen oder Arbeitskämpfe behindern und zerschlagen sollen.','Measures by companies or hired consultants intended to obstruct and dismantle organising, workplace groups or industrial action.',
      'Dokumentation, kollektiver Schutz, Rechtsunterstützung und öffentliche Kampagnen können Einschüchterung und Kündigungen entgegenwirken.','Documentation, collective protection, legal support and public campaigns can counter intimidation and dismissals.',
      'Repression wirkt oft informell; Analyse muss auch Befristung, Überwachung, Spaltung und algorithmische Kontrolle berücksichtigen.','Repression is often informal; analysis must also consider precarity, surveillance, division and algorithmic control.',['solidarity-unionism','anti-repression','rank-and-file'])
    ,extraTerm('social-centre','organisation',['anarchist-library','libcom'],'Soziales Zentrum','Social centre',
      'Ein selbstorganisierter Raum für politische, soziale, kulturelle und praktische Aktivitäten einer Gemeinschaft oder Bewegung.','A self-organised space for the political, social, cultural and practical activities of a community or movement.',
      'Zentren können Versammlungen, Beratung, Küche, Bibliothek, Veranstaltungen, Werkstätten und gegenseitige Hilfe verbinden.','Centres can combine assemblies, advice, kitchens, libraries, events, workshops and mutual aid.',
      'Zugang, Sorgearbeit, Konflikte, Finanzierung und das Verhältnis zur Nachbarschaft brauchen verbindliche gemeinsame Regeln.','Access, care work, conflict, funding and relations with the neighbourhood need shared and accountable rules.',['autonomous-space','assembly','mutual-aid'])
    ,extraTerm('solidarity-economy','organisation',['afaq','libcom'],'Solidarische Ökonomie','Solidarity economy',
      'Wirtschaftliche Praxis, die Versorgung, Kooperation und demokratische Kontrolle über Profit und Konkurrenz stellt.','Economic practice prioritising provision, cooperation and democratic control over profit and competition.',
      'Dazu zählen Genossenschaften, Gemeingüter, solidarische Landwirtschaft, Tauschnetze und gemeinschaftliche Fonds.','It includes cooperatives, commons, community-supported agriculture, exchange networks and collective funds.',
      'Einzelne Projekte bleiben Markt- und Eigentumsverhältnissen ausgesetzt; politische Organisierung und gerechter Zugang bleiben notwendig.','Individual projects remain exposed to markets and property relations; political organising and fair access remain necessary.',['commons','mutual-aid','workers-control'])
    ,extraTerm('commoning','basics',['afaq','anarchist-library'],'Commoning','Commoning',
      'Die fortlaufende gemeinsame Praxis, Ressourcen zu pflegen, zu teilen und Regeln ihrer Nutzung demokratisch auszuhandeln.','The ongoing collective practice of caring for and sharing resources while democratically negotiating their use.',
      'Commoning verbindet ein Gemeingut mit einer Gemeinschaft und überprüfbaren Verfahren für Zugang, Verantwortung und Konflikte.','Commoning connects a commons with a community and accountable processes for access, responsibility and conflict.',
      'Gemeinschaftliche Verwaltung kann informelle Ausschlüsse erzeugen; Eigentumsform allein garantiert keine Gleichheit.','Collective governance can create informal exclusions; ownership form alone does not guarantee equality.',['commons','self-organisation','collective-care'])
    ,extraTerm('community-land-trust','organisation',['libcom'],'Community Land Trust','Community land trust',
      'Ein Modell, bei dem Boden dauerhaft gemeinschaftlich gebunden und von Gebäuden oder Nutzungsrechten getrennt verwaltet wird.','A model holding land in lasting community stewardship while governing buildings or use rights separately.',
      'Bewohner*innen und Gemeinwesen legen Regeln fest, um leistbares Wohnen, soziale Nutzung und Schutz vor Spekulation zu sichern.','Residents and communities set rules to protect affordable housing, social use and land from speculation.',
      'Rechtsform und Beteiligung unterscheiden sich; ohne reale Kontrolle kann das Modell paternalistisch oder bürokratisch werden.','Legal forms and participation vary; without meaningful control the model can become paternalistic or bureaucratic.',['tenant-union','commons','squatting'])
    ,extraTerm('dog-whistle','power',['anarchist-library','libcom'],'Dog Whistle / codierte Botschaft','Dog whistle',
      'Eine scheinbar neutrale Formulierung, die für ein bestimmtes Publikum zusätzlich eine rassistische, autoritäre oder verschwörungsideologische Bedeutung trägt.','An apparently neutral phrase carrying an additional racist, authoritarian or conspiracist meaning for a particular audience.',
      'Quellenkritik prüft Kontext, wiederkehrende Begriffe, Zielgruppen und die Wirkung einer Aussage statt nur einzelne Wörter.','Source criticism examines context, recurring language, audiences and effects rather than isolated words.',
      'Nicht jede mehrdeutige Formulierung ist absichtlich codiert; Behauptungen brauchen nachvollziehbare Belege.','Not every ambiguous phrase is deliberately coded; claims need traceable evidence.',['source-criticism','fascism','disinformation'])
    ,extraTerm('entryism','power',['anarchist-library','libcom'],'Entrismus','Entryism',
      'Der strategische Eintritt in eine Organisation, Bewegung oder Öffentlichkeit, um ihre Richtung schrittweise von innen zu verändern.','Strategic entry into an organisation, movement or public sphere in order to shift its direction from within.',
      'Transparente Regeln, demokratische Verfahren und überprüfbare Verantwortlichkeit helfen, verdeckte Machtverschiebungen zu erkennen.','Transparent rules, democratic procedures and accountable responsibility help reveal covert shifts in power.',
      'Politische Veränderung innerhalb bestehender Strukturen ist nicht automatisch Entrismus; entscheidend sind Täuschung, Ziel und Methode.','Political change within existing structures is not automatically entryism; deception, purpose and method matter.',['informal-hierarchy','accountability','fascism'])
    ,extraTerm('far-right-monitoring','tactics',['anarchist-library','libcom'],'Monitoring der extremen Rechten','Far-right monitoring',
      'Systematische, quellenbasierte Beobachtung öffentlich sichtbarer rechter Netzwerke, Narrative, Veranstaltungen und Machtverbindungen.','Systematic, source-based observation of publicly visible far-right networks, narratives, events and power links.',
      'Recherche dokumentiert Belege, trennt Fakten von Einschätzungen und schützt besonders gefährdete Personen und sensible Daten.','Research documents evidence, separates facts from assessments and protects vulnerable people and sensitive data.',
      'Öffentliches Interesse rechtfertigt keine unbegrenzte Datensammlung; Sicherheit, Datenschutz und Fehlerkorrektur bleiben zentral.','Public interest does not justify unlimited data collection; safety, privacy and corrections remain essential.',['source-criticism','doxxing','security-culture'])
    ,extraTerm('counter-mobilisation','tactics',['beautiful-trouble','libcom'],'Gegenmobilisierung','Counter-mobilisation',
      'Kollektive Organisierung gegen eine angekündigte rechte, autoritäre oder menschenfeindliche Veranstaltung oder Kampagne.','Collective organising against an announced far-right, authoritarian or dehumanising event or campaign.',
      'Formen reichen von Information, Schutz und Kundgebungen bis zu Blockaden, Kulturprogrammen und langfristiger lokaler Organisierung.','Forms range from information, protection and demonstrations to blockades, cultural programmes and long-term local organising.',
      'Ziele, Risiken, Zugänglichkeit und die Bedürfnisse direkt betroffener Gruppen sollten gemeinsam geklärt werden.','Goals, risks, accessibility and the needs of directly targeted groups should be agreed collectively.',['antifascism','direct-action','collective-care'])
    ,extraTerm('deplatforming','tactics',['beautiful-trouble','libcom'],'Deplatforming','Deplatforming',
      'Der Entzug von Bühne, Infrastruktur oder Reichweite für organisierte menschenfeindliche Propaganda und Rekrutierung.','Withdrawing platforms, infrastructure or reach from organised dehumanising propaganda and recruitment.',
      'Dazu gehören abgesagte Räume, moderierte Plattformen, Werbeboykotte und öffentliche Aufklärung über Veranstaltende.','It can include cancelled venues, moderated platforms, advertising boycotts and public information about organisers.',
      'Deplatforming ersetzt keine politische Auseinandersetzung und braucht klare Kriterien, Belege und Möglichkeiten zur Korrektur.','Deplatforming does not replace political struggle and needs clear criteria, evidence and paths for correction.',['antifascism','counter-mobilisation','accountability'])
    ,extraTerm('disinformation','power',['anarchist-library','libcom'],'Desinformation','Disinformation',
      'Absichtlich verbreitete falsche oder irreführende Information, die Wahrnehmung, Verhalten oder politische Entscheidungen beeinflussen soll.','False or misleading information deliberately spread to influence perception, behaviour or political decisions.',
      'Gegenstrategien verbinden Quellenprüfung, Kontext, transparente Korrekturen, Medienkompetenz und langsameres Weiterverbreiten.','Responses combine source checks, context, transparent corrections, media literacy and slower sharing.',
      'Irrtum, Satire und unvollständige Information sind nicht automatisch Desinformation; Absicht lässt sich oft nur begrenzt belegen.','Error, satire and incomplete information are not automatically disinformation; intent is often difficult to prove.',['source-criticism','algorithmic-governance','movement-media'])
    ,extraTerm('movement-archive','organisation',['anarchist-library','libcom'],'Bewegungsarchiv','Movement archive',
      'Eine gemeinschaftlich betreute Sammlung von Dokumenten, Medien und Erinnerungen sozialer Kämpfe und selbstorganisierter Praxis.','A collectively stewarded collection of documents, media and memories from social struggles and self-organised practice.',
      'Archive sichern Flugblätter, Zines, Interviews, Fotos und digitale Dateien mit Kontext, Zugangsregeln und langfristigen Formaten.','Archives preserve leaflets, zines, interviews, images and digital files with context, access rules and durable formats.',
      'Bewahrung muss Einwilligung, Sicherheitsrisiken, koloniale Sammlungspraxis und das Recht auf Löschung berücksichtigen.','Preservation must consider consent, security risks, colonial collecting practices and the right to deletion.',['movement-media','commons','security-culture'])
    ,extraTerm('community-self-defence','tactics',['beautiful-trouble','libcom'],'Kollektiver Selbstschutz','Community self-defence',
      'Gemeinsam entwickelte Praxis, mit der bedrohte Gemeinschaften Gewalt vorbeugen, sich gegenseitig schützen und handlungsfähig bleiben.','Collectively developed practice through which threatened communities prevent harm, protect one another and retain agency.',
      'Sie kann Begleitung, sichere Räume, Beobachtung, Notfallketten, rechtliche Unterstützung und öffentliche Gegenwehr verbinden.','It can combine accompaniment, safe spaces, monitoring, emergency networks, legal support and public resistance.',
      'Selbstschutz muss Betroffenenentscheidungen, Verhältnismäßigkeit, Deeskalation und Verantwortlichkeit einschließen.','Self-defence needs survivor choice, proportionality, de-escalation and accountability.',['collective-care','antifascism','security-culture'])
  );

  // Keep the public glossary stable when an editorial expansion replaces an older draft entry.
  const uniqueTerms = [...new Map(TERMS.map(term => [term.id, term])).values()];
  TERMS.splice(0, TERMS.length, ...uniqueTerms);

  const hiddenNodes = new Map();
  const state = { section: 'basics', query: '' };

  const lang = value => String(
    value
    || document.getElementById('ui-language')?.value
    || document.documentElement.lang
    || 'en'
  ).toLowerCase().split(/[-_]/)[0];

  const ui = code => ({ ...UI.en, ...(UI[lang(code)] || {}) });
  const editorialLanguage = () => lang() === 'de' ? 'de' : 'en';
  const textFor = value => value?.[editorialLanguage()] || value?.en || value?.de || '';
  const sourceById = id => SOURCES.find(source => source.id === id);

  function safeExternalLink(url, label, className = '') {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.referrerPolicy = 'no-referrer';
    link.className = className;
    link.textContent = label;
    return link;
  }

  function ensureRoot() {
    let root = document.getElementById('wrn-lexicon-184');
    if (root) return root;
    root = document.createElement('section');
    root.id = 'wrn-lexicon-184';
    root.className = 'wrn-lexicon-184';
    root.hidden = true;
    const anchor = document.getElementById('feed-container');
    anchor?.parentNode?.insertBefore(root, anchor);
    return root;
  }

  function relatedLabels(term) {
    return (term.related || [])
      .map(id => TERMS.find(item => item.id === id))
      .filter(Boolean)
      .map(item => textFor(item.title));
  }

  function sourceLabels(term) {
    return (term.sources || []).map(sourceById).filter(Boolean);
  }

  function matchesQuery(term, query) {
    if (!query) return true;
    const searchable = [
      textFor(term.title),
      ...(term.aliases?.[editorialLanguage()] || term.aliases?.en || []),
      textFor(term.summary),
      textFor(term.practice),
      textFor(term.debate)
    ].join(' ').toLocaleLowerCase();
    return searchable.includes(query.toLocaleLowerCase());
  }

  function termCard(term) {
    const t = ui();
    const card = document.createElement('details');
    card.className = 'wrn-lexicon-card-184';
    card.dataset.term = term.id;

    const summary = document.createElement('summary');
    const heading = document.createElement('span');
    const title = document.createElement('strong');
    const aliases = document.createElement('small');
    const teaser = document.createElement('p');
    title.textContent = textFor(term.title);
    aliases.textContent = (term.aliases?.[editorialLanguage()] || term.aliases?.en || []).join(' · ');
    teaser.textContent = textFor(term.summary);
    heading.append(title, aliases);
    summary.append(heading, teaser);

    const body = document.createElement('div');
    body.className = 'wrn-lexicon-card-body-184';
    [
      [t.practice, textFor(term.practice)],
      [t.debate, textFor(term.debate)]
    ].forEach(([label, value]) => {
      const section = document.createElement('section');
      const h = document.createElement('h4');
      const p = document.createElement('p');
      h.textContent = label;
      p.textContent = value;
      section.append(h, p);
      body.appendChild(section);
    });

    const related = relatedLabels(term);
    if (related.length) {
      const section = document.createElement('section');
      const h = document.createElement('h4');
      const values = document.createElement('div');
      values.className = 'wrn-lexicon-tags-184';
      h.textContent = t.related;
      related.forEach(value => {
        const tag = document.createElement('span');
        tag.textContent = value;
        values.appendChild(tag);
      });
      section.append(h, values);
      body.appendChild(section);
    }

    const sources = sourceLabels(term);
    if (sources.length) {
      const section = document.createElement('section');
      const h = document.createElement('h4');
      const links = document.createElement('div');
      links.className = 'wrn-lexicon-source-links-184';
      h.textContent = t.sources;
      sources.forEach(source => links.appendChild(
        safeExternalLink(source.url, source.name)
      ));
      section.append(h, links);
      body.appendChild(section);
    }

    const revision = term.revision || {
      version: '1.8.4',
      date: '2026-07-24',
      note: 'Initial editorial draft.'
    };
    const revisionSection = document.createElement('section');
    const revisionHeading = document.createElement('h4');
    const revisionText = document.createElement('p');
    revisionHeading.textContent = t.revision;
    revisionText.textContent = `${revision.date} · ${revision.version} · ${revision.note}`;
    revisionSection.append(revisionHeading, revisionText);
    body.appendChild(revisionSection);

    const feedback = document.createElement('button');
    feedback.type = 'button';
    feedback.className = 'wrn-lexicon-feedback-184';
    feedback.textContent = t.feedback;
    feedback.addEventListener('click', () => window.openFeedback?.());
    body.appendChild(feedback);

    card.append(summary, body);
    return card;
  }

  function downloadLexicon() {
    const data = {
      title: 'World Revolution News – Begriffslexikon',
      version: '1.0-editorial-draft',
      exportedAt: new Date().toISOString(),
      notice: UI.de.note,
      sources: SOURCES.map(source => ({
        name: source.name,
        url: source.url,
        downloads: source.downloads
      })),
      terms: TERMS
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wrn-begriffslexikon.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportMarkup() {
    const escape = value => String(value || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return TERMS
      .slice()
      .sort((left, right) => textFor(left.title).localeCompare(textFor(right.title), editorialLanguage()))
      .map(term => `<article><h2>${escape(textFor(term.title))}</h2><p>${escape(textFor(term.summary))}</p><h3>${escape(ui().practice)}</h3><p>${escape(textFor(term.practice))}</p><h3>${escape(ui().debate)}</h3><p>${escape(textFor(term.debate))}</p></article>`)
      .join('');
  }

  function printLexicon() {
    const popup = window.open('', '_blank');
    if (!popup) return;
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="${editorialLanguage()}"><head><meta charset="utf-8"><title>WRN Begriffslexikon</title><style>@page{size:A4;margin:16mm}body{font:11pt/1.45 Georgia,serif;color:#111}h1,h2,h3{font-family:Arial,sans-serif}h1{border-bottom:3px solid #111}article{break-inside:avoid;margin:0 0 9mm}h2{font-size:15pt;margin:0 0 2mm}h3{font-size:10pt;margin:3mm 0 1mm}p{margin:0 0 2mm}</style></head><body><h1>World Revolution News – Begriffslexikon</h1><p>${UI.de.note}</p>${exportMarkup()}</body></html>`);
    popup.document.close();
    popup.focus();
    window.setTimeout(() => popup.print(), 300);
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipStored(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const write16 = (view, at, value) => view.setUint16(at, value, true);
    const write32 = (view, at, value) => view.setUint32(at, value >>> 0, true);
    files.forEach(file => {
      const name = encoder.encode(file.name);
      const data = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
      const checksum = crc32(data);
      const local = new Uint8Array(30 + name.length);
      const localView = new DataView(local.buffer);
      write32(localView, 0, 0x04034b50);
      write16(localView, 4, 20);
      write16(localView, 6, 0);
      write16(localView, 8, 0);
      write32(localView, 14, checksum);
      write32(localView, 18, data.length);
      write32(localView, 22, data.length);
      write16(localView, 26, name.length);
      local.set(name, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + name.length);
      const centralView = new DataView(central.buffer);
      write32(centralView, 0, 0x02014b50);
      write16(centralView, 4, 20);
      write16(centralView, 6, 20);
      write16(centralView, 8, 0);
      write16(centralView, 10, 0);
      write32(centralView, 16, checksum);
      write32(centralView, 20, data.length);
      write32(centralView, 24, data.length);
      write16(centralView, 28, name.length);
      write32(centralView, 42, offset);
      central.set(name, 46);
      centralParts.push(central);
      offset += local.length + data.length;
    });
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    write32(endView, 0, 0x06054b50);
    write16(endView, 8, files.length);
    write16(endView, 10, files.length);
    write32(endView, 12, centralSize);
    write32(endView, 16, offset);
    return new Blob([...localParts, ...centralParts, end], { type: 'application/epub+zip' });
  }

  function downloadEpub() {
    const identifier = `urn:uuid:${crypto.randomUUID?.() || `wrn-${Date.now()}`}`;
    const content = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="${editorialLanguage()}"><head><title>WRN Begriffslexikon</title><meta charset="utf-8"/><style>body{font-family:serif;line-height:1.45}article{margin-bottom:2em}h2{border-bottom:1px solid #999}</style></head><body><h1>World Revolution News – Begriffslexikon</h1>${exportMarkup()}</body></html>`;
    const container = '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>';
    const packageFile = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${identifier}</dc:identifier><dc:title>World Revolution News – Begriffslexikon</dc:title><dc:language>${editorialLanguage()}</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta></metadata><manifest><item id="content" href="content.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="content"/></spine></package>`;
    const blob = zipStored([
      { name: 'mimetype', data: 'application/epub+zip' },
      { name: 'META-INF/container.xml', data: container },
      { name: 'OEBPS/package.opf', data: packageFile },
      { name: 'OEBPS/content.xhtml', data: content }
    ]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wrn-begriffslexikon.epub';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function renderSources(host) {
    const t = ui();
    const header = document.createElement('div');
    header.className = 'wrn-lexicon-sources-head-184';
    const heading = document.createElement('h3');
    const hint = document.createElement('p');
    const actions = document.createElement('div');
    actions.className = 'wrn-lexicon-export-actions-185';
    const download = document.createElement('button');
    const print = document.createElement('button');
    const epub = document.createElement('button');
    heading.textContent = t.sources;
    hint.textContent = t.downloadHint;
    download.type = 'button';
    download.textContent = t.downloadLexicon;
    download.addEventListener('click', downloadLexicon);
    print.type = 'button';
    print.textContent = t.printLexicon;
    print.addEventListener('click', printLexicon);
    epub.type = 'button';
    epub.textContent = t.epubLexicon;
    epub.addEventListener('click', downloadEpub);
    actions.append(download, print, epub);
    header.append(heading, hint, actions);
    host.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'wrn-lexicon-sources-grid-184';
    SOURCES.forEach(source => {
      const card = document.createElement('article');
      const h = document.createElement('h3');
      const meta = document.createElement('small');
      const description = document.createElement('p');
      const actions = document.createElement('div');
      h.textContent = source.name;
      meta.textContent = source.language;
      description.textContent = textFor(source.description);
      actions.className = 'wrn-lexicon-source-actions-184';
      actions.appendChild(safeExternalLink(source.url, t.sourceOpen, 'primary'));
      source.downloads.forEach(downloadItem => {
        actions.appendChild(safeExternalLink(
          downloadItem.url,
          `${t.pdfOpen}: ${downloadItem.label}`
        ));
      });
      card.append(h, meta, description, actions);
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }

  function render() {
    const root = ensureRoot();
    const t = ui();
    root.textContent = '';

    const header = document.createElement('header');
    const kicker = document.createElement('span');
    const title = document.createElement('h2');
    const lead = document.createElement('p');
    kicker.className = 'wrn-lexicon-kicker-184';
    kicker.textContent = 'WORLD REVOLUTION NEWS · MOVEMENT GLOSSARY';
    title.textContent = t.title;
    lead.textContent = t.lead;
    header.append(kicker, title, lead);
    root.appendChild(header);

    if (lang() !== 'de' && lang() !== 'en' && t.fallback) {
      const fallback = document.createElement('p');
      fallback.className = 'wrn-lexicon-fallback-184';
      fallback.textContent = t.fallback;
      root.appendChild(fallback);
    }

    const content = document.createElement('div');
    content.className = 'wrn-lexicon-content-184';
    root.appendChild(content);

    if (state.section === 'sources') {
      renderSources(content);
      return;
    }

    const controls = document.createElement('div');
    controls.className = 'wrn-lexicon-controls-184';
    const search = document.createElement('input');
    const count = document.createElement('span');
    search.type = 'search';
    search.value = state.query;
    search.placeholder = t.search;
    search.setAttribute('aria-label', t.search);
    controls.append(search, count);
    content.appendChild(controls);

    const list = document.createElement('div');
    list.className = 'wrn-lexicon-list-184';
    const filtered = TERMS
      .filter(term => state.section === 'all' || term.category === state.section)
      .filter(term => matchesQuery(term, state.query))
      .sort((left, right) => textFor(left.title).localeCompare(textFor(right.title), editorialLanguage()));
    count.textContent = `${filtered.length} ${t.terms}`;
    filtered.forEach(term => list.appendChild(termCard(term)));
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'wrn-lexicon-empty-184';
      empty.textContent = t.noResults;
      list.appendChild(empty);
    }
    content.appendChild(list);

    search.addEventListener('input', () => {
      state.query = search.value.trim();
      render();
      const next = ensureRoot().querySelector('.wrn-lexicon-controls-184 input');
      next?.focus();
      next?.setSelectionRange(state.query.length, state.query.length);
    });
  }

  function hideStandard() {
    [
      'feed-container', 'archive-container', 'event-filter-panel',
      'status-container', 'txt-archive-title', 'wrn-video-hub',
      'wrn-stories-view', 'wrn-audio-tab-183', 'wrn-briefing-2',
      'wrn-about-184'
    ].forEach(id => {
      const node = document.getElementById(id);
      if (!node || node.id === 'wrn-lexicon-184') return;
      if (!hiddenNodes.has(node)) hiddenNodes.set(node, {
        hidden: node.hidden,
        display: node.style.display
      });
      node.hidden = true;
      node.style.display = 'none';
    });
  }

  function show(section = state.section) {
    state.section = UI.en.sections[section] ? section : 'basics';
    hideStandard();
    const root = ensureRoot();
    render();
    root.hidden = false;
    root.style.display = 'block';
    document.body.dataset.wrnTab = 'lexicon';
  }

  function hide() {
    const root = document.getElementById('wrn-lexicon-184');
    if (root) {
      root.hidden = true;
      root.style.display = 'none';
    }
    hiddenNodes.forEach((value, node) => {
      if (!node.isConnected) return;
      node.hidden = value.hidden;
      node.style.display = value.display;
    });
    hiddenNodes.clear();
  }

  window.WRNLexicon184 = Object.freeze({
    show,
    hide,
    render,
    label: code => ui(code).nav,
    sectionLabel: (section, code) => ui(code).sections[section] || section,
    exportData: downloadLexicon,
    exportEpub: downloadEpub,
    printPdf: printLexicon,
    snapshot: () => JSON.parse(JSON.stringify({
      schemaVersion: 1,
      terms: TERMS,
      sources: SOURCES
    })),
    termCount: TERMS.length,
    sourceCount: SOURCES.length
  });
})();
