/* World Revolution News 1.8.4 – purpose and feedback */
'use strict';

(() => {
  if (window.WRNAbout184) return;

  const COPY = {
    de: {
      nav: 'Über das Projekt', title: 'Warum es World Revolution News gibt',
      lead: 'World Revolution News bündelt Nachrichten, Termine, Videos, Podcasts und freie Radios aus anarchistischen, antiautoritären, antikolonialen, feministischen, ökologischen und anderen linksrevolutionären Zusammenhängen.',
      why: 'Warum wir die App machen',
      whyText: 'Die App soll Kämpfe, Ideen und Perspektiven sichtbar machen, die in kommerziellen Medien häufig verkürzt, verzerrt oder gar nicht vorkommen. Sie erleichtert es, Entwicklungen über Regionen und Bewegungen hinweg zu verfolgen und die jeweiligen Originalquellen zu finden.',
      found: 'Was du hier findest',
      items: ['Nachrichten nach Regionen und Themen', 'Termine aus Radar.squat und weiteren Kalendern', 'Podcasts, erzeugte Audiofassungen, freie Radios und Videos', 'Werkzeuge zum Übersetzen, Zusammenfassen, Speichern und Gestalten eines eigenen Zines', 'Ein wachsendes Begriffslexikon mit Quellen und weiterführenden Materialien'],
      principles: 'Transparenz und Grenzen',
      principlesText: 'World Revolution News ist keine neutrale Nachrichtenagentur und keine abschließende Instanz für politische Wahrheit. Auswahl, automatische Zuordnung, Übersetzungen und Zusammenfassungen können Fehler enthalten. Deshalb bleiben Quelle, Datum und Link zum Original sichtbar.',
      sourceSelection: 'Wie Quellen ausgewählt werden',
      sourceSelectionText: 'Wir bevorzugen nachvollziehbare, unabhängige und bewegungsnahe Quellen. Reichweite allein ist kein Kriterium. Quellen werden nach Sprache, Region, thematischer Relevanz, technischer Erreichbarkeit und erkennbarem autoritären oder diskriminierenden Inhalt geprüft. Fehlerhafte Zuordnungen können gemeldet werden.',
      privacy: 'Datenschutz und KI-Hinweise',
      privacyText: 'Die App benötigt kein Benutzerkonto. Einstellungen, Lesestatus und Beobachtungen bleiben grundsätzlich auf deinem Gerät. Für Übersetzungen, Zusammenfassungen und erzeugte Podcasts können ausgewählte Artikeltexte an die angegebenen Dienste gesendet werden. Maschinelle Ergebnisse sind gekennzeichnet und ersetzen nie das Original.',
      social: 'Alternative soziale Netzwerke · kuratierte Vorbereitung',
      socialText: 'Mastodon, PeerTube, Mobilizon und weitere freie Netzwerke sollen später nur über transparent ausgewählte Konten, Kanäle und Instanzen erscheinen – nicht als ungefilterter Feed.',
      feedback: 'Hilf mit', feedbackText: 'Kennst du eine fehlende Quelle, entdeckst du einen Fehler oder hast du eine Idee? Schreib uns. Besonders freuen wir uns über Hinweise aus Regionen und Sprachen, die noch wenig vertreten sind.',
      button: 'Feedback senden',
      note: 'Begriffe, Bewegungen und politische Einschätzungen verändern sich. Wir erheben keinen Anspruch auf Vollständigkeit. World Revolution News ist ein gemeinsames, lernendes Projekt, das mit Kritik, Ergänzungen und neuen Perspektiven wachsen soll.'
    },
    en: {
      nav: 'About the project', title: 'Why World Revolution News exists',
      lead: 'World Revolution News brings together news, events, videos, podcasts and free radio from anarchist, anti-authoritarian, anti-colonial, feminist, ecological and other revolutionary left contexts.',
      why: 'Why we build it', whyText: 'The app aims to make struggles, ideas and perspectives visible when commercial media shorten, distort or ignore them. It helps people follow developments across regions and movements and find the respective original sources.',
      found: 'What you can find', items: ['News by region and topic', 'Events from Radar.squat and other calendars', 'Podcasts, generated audio, free radio and videos', 'Tools to translate, summarize, save and design your own zine', 'A growing movement glossary with sources and further reading'],
      principles: 'Transparency and limits', principlesText: 'World Revolution News is not a neutral news agency or a final authority on political truth. Selection, automatic classification, translations and summaries can contain errors. The source, date and original link therefore remain visible.',
      sourceSelection: 'How sources are selected',
      sourceSelectionText: 'We prefer traceable, independent and movement-connected sources. Reach alone is not a criterion. Sources are reviewed for language, region, editorial relevance, technical availability and recognisably authoritarian or discriminatory content. Misclassification can be reported.',
      privacy: 'Privacy and AI notices',
      privacyText: 'The app requires no user account. Settings, reading state and watchlists normally stay on the device. For translations, summaries and generated podcasts, selected article text may be sent to the named services. Machine results are labelled and never replace the original.',
      social: 'Alternative social networks · curated preparation',
      socialText: 'Mastodon, PeerTube, Mobilizon and other free networks will later be included only through transparently selected accounts, channels and instances—not as an unfiltered feed.',
      feedback: 'Take part', feedbackText: 'Know a missing source, found a mistake or have an idea? Write to us. We especially welcome suggestions from underrepresented regions and languages.',
      button: 'Send feedback', note: 'Terms, movements and political assessments change. We do not claim completeness. World Revolution News is a shared learning project intended to grow through criticism, additions and new perspectives.'
    },
    es: {
      nav: 'Sobre la app', title: 'Por qué existe World Revolution News',
      lead: 'World Revolution News facilita encontrar información independiente, anarquista, libertaria de izquierda y antiautoritaria de muchas regiones.',
      why: 'Por qué hacemos la app', whyText: 'Voces importantes están repartidas entre sitios pequeños, idiomas y formatos. La app las reúne sin sustituir las fuentes originales.',
      found: 'Qué encontrarás', items: ['Noticias por región y tema', 'Eventos de Radar.squat y otros calendarios', 'Podcasts, audio generado, radio y vídeos', 'Herramientas para traducir, resumir, guardar y diseñar tu propio zine'],
      principles: 'Cómo trabajamos', principlesText: 'Las fuentes siguen visibles y enlazadas. Las traducciones y los resúmenes automáticos pueden contener errores. La selección está abierta a críticas y cambios.',
      sourceSelection:'Cómo se eligen las fuentes', sourceSelectionText:'Damos prioridad a fuentes independientes, verificables y vinculadas a movimientos. Se revisan su región, idioma, relevancia, disponibilidad técnica y posibles contenidos autoritarios o discriminatorios.',
      privacy:'Privacidad y avisos sobre IA', privacyText:'No hace falta una cuenta. Los ajustes y las listas permanecen normalmente en tu dispositivo. Para traducir, resumir o crear audio, el texto seleccionado puede enviarse al servicio indicado; los resultados automáticos siempre se identifican.',
      social:'Redes sociales alternativas · preparación curada', socialText:'Mastodon, PeerTube, Mobilizon y otras redes libres se integrarán más adelante mediante cuentas e instancias seleccionadas de forma transparente, nunca como un flujo sin filtrar.',
      feedback: 'Participa', feedbackText: '¿Conoces una fuente que falta, un error o tienes una idea? Escríbenos. Agradecemos especialmente propuestas de regiones e idiomas poco representados.',
      button: 'Enviar comentarios', note: 'La colección no pretende ser completa. Las palabras, perspectivas y movimientos cambian; la app debe crecer con sus usuarias y usuarios.'
    },
    fr: {
      nav: 'À propos', title: 'Pourquoi World Revolution News existe',
      lead: 'World Revolution News facilite l’accès à des informations indépendantes, anarchistes, libertaires de gauche et antiautoritaires de nombreuses régions.',
      why: 'Pourquoi nous créons cette app', whyText: 'Des voix importantes sont dispersées entre de petits sites, langues et formats. L’app les réunit sans remplacer les sources originales.',
      found: 'Ce que vous trouverez', items: ['Actualités par région et thème', 'Événements de Radar.squat et d’autres agendas', 'Podcasts, audio généré, radios et vidéos', 'Outils pour traduire, résumer, sauvegarder et créer votre propre zine'],
      principles: 'Notre méthode', principlesText: 'Les sources restent visibles et liées. Les traductions et résumés automatiques peuvent comporter des erreurs. La sélection reste ouverte à la critique et au changement.',
      sourceSelection:'Comment les sources sont choisies', sourceSelectionText:'Nous privilégions les sources indépendantes, vérifiables et liées aux mouvements. Leur région, langue, pertinence, disponibilité technique et d’éventuels contenus autoritaires ou discriminatoires sont examinés.',
      privacy:'Confidentialité et indications sur l’IA', privacyText:'Aucun compte n’est requis. Réglages et listes restent normalement sur votre appareil. Pour traduire, résumer ou produire un audio, le texte choisi peut être envoyé au service indiqué ; les résultats automatiques sont toujours signalés.',
      social:'Réseaux sociaux alternatifs · préparation éditoriale', socialText:'Mastodon, PeerTube, Mobilizon et d’autres réseaux libres seront ajoutés plus tard à travers des comptes et instances sélectionnés de façon transparente, jamais comme un flux non filtré.',
      feedback: 'Participer', feedbackText: 'Vous connaissez une source manquante, une erreur ou avez une idée ? Écrivez-nous. Les propositions de régions et langues peu représentées sont particulièrement bienvenues.',
      button: 'Envoyer un retour', note: 'Cette collection ne prétend pas être complète. Les mots, perspectives et mouvements évoluent ; l’app doit grandir avec ses utilisatrices et utilisateurs.'
    },
    it: {
      nav: 'Informazioni', title: 'Perché esiste World Revolution News',
      lead: 'World Revolution News rende più facili da trovare notizie indipendenti, anarchiche, libertarie di sinistra e antiautoritarie da molte regioni.',
      why: 'Perché creiamo l’app', whyText: 'Voci importanti sono sparse tra piccoli siti, lingue e formati. L’app le riunisce senza sostituire le fonti originali.',
      found: 'Cosa trovi', items: ['Notizie per regione e tema', 'Eventi da Radar.squat e altri calendari', 'Podcast, audio generato, radio e video', 'Strumenti per tradurre, riassumere, salvare e creare il tuo zine'],
      principles: 'Come lavoriamo', principlesText: 'Le fonti restano visibili e collegate. Traduzioni e riassunti automatici possono contenere errori. Selezione e contesto restano aperti a critica e cambiamento.',
      sourceSelection:'Come vengono scelte le fonti', sourceSelectionText:'Diamo priorità a fonti indipendenti, verificabili e vicine ai movimenti. Ne controlliamo regione, lingua, rilevanza, disponibilità tecnica e possibili contenuti autoritari o discriminatori.',
      privacy:'Privacy e indicazioni sull’IA', privacyText:'Non serve un account. Impostazioni ed elenchi restano normalmente sul dispositivo. Per tradurre, riassumere o creare audio, il testo selezionato può essere inviato al servizio indicato; i risultati automatici sono sempre segnalati.',
      social:'Social network alternativi · preparazione curata', socialText:'Mastodon, PeerTube, Mobilizon e altre reti libere saranno integrati in seguito tramite account e istanze scelti in modo trasparente, mai come flusso non filtrato.',
      feedback: 'Partecipa', feedbackText: 'Conosci una fonte mancante, hai trovato un errore o hai un’idea? Scrivici. Apprezziamo in particolare suggerimenti da regioni e lingue poco rappresentate.',
      button: 'Invia feedback', note: 'La raccolta non pretende di essere completa. Parole, prospettive e movimenti cambiano: l’app dovrebbe crescere insieme a chi la usa.'
    },
    pt: {
      nav: 'Sobre', title: 'Por que existe a World Revolution News',
      lead: 'A World Revolution News facilita encontrar informação independente, anarquista, libertária de esquerda e antiautoritária de muitas regiões.',
      why: 'Por que fazemos a app', whyText: 'Vozes importantes estão espalhadas por pequenos sites, idiomas e formatos. A app reúne-as sem substituir as fontes originais.',
      found: 'O que encontras', items: ['Notícias por região e tema', 'Eventos do Radar.squat e outros calendários', 'Podcasts, áudio gerado, rádio e vídeos', 'Ferramentas para traduzir, resumir, guardar e criar o teu zine'],
      principles: 'Como trabalhamos', principlesText: 'As fontes permanecem visíveis e ligadas. Traduções e resumos automáticos podem conter erros. A seleção continua aberta a crítica e mudança.',
      sourceSelection:'Como as fontes são escolhidas', sourceSelectionText:'Damos prioridade a fontes independentes, verificáveis e ligadas a movimentos. São avaliados região, idioma, relevância, disponibilidade técnica e possíveis conteúdos autoritários ou discriminatórios.',
      privacy:'Privacidade e avisos sobre IA', privacyText:'Não é necessária uma conta. Definições e listas ficam normalmente no dispositivo. Para traduzir, resumir ou criar áudio, o texto selecionado pode ser enviado ao serviço indicado; resultados automáticos são sempre identificados.',
      social:'Redes sociais alternativas · preparação curada', socialText:'Mastodon, PeerTube, Mobilizon e outras redes livres serão integradas mais tarde através de contas e instâncias selecionadas com transparência, nunca como fluxo não filtrado.',
      feedback: 'Participa', feedbackText: 'Conheces uma fonte em falta, encontraste um erro ou tens uma ideia? Escreve-nos. Agradecemos especialmente sugestões de regiões e idiomas pouco representados.',
      button: 'Enviar feedback', note: 'A coleção não pretende ser completa. Palavras, perspetivas e movimentos mudam — a app deve crescer com quem a utiliza.'
    },
    ru: {
      nav: 'О приложении', title: 'Зачем существует World Revolution News',
      lead: 'World Revolution News помогает находить независимые, анархистские, лево-либертарианские и антиавторитарные материалы из разных регионов.',
      why: 'Зачем мы создаём приложение', whyText: 'Важные голоса распределены по небольшим сайтам, языкам и форматам. Приложение собирает их вместе, не заменяя оригинальные источники.',
      found: 'Что здесь есть', items: ['Новости по регионам и темам', 'События Radar.squat и других календарей', 'Подкасты, созданное аудио, радио и видео', 'Инструменты перевода, резюмирования, сохранения и создания собственного зина'],
      principles: 'Как мы работаем', principlesText: 'Источники остаются видимыми и доступны по ссылкам. Автоматические переводы и резюме могут содержать ошибки. Выбор материалов открыт критике и изменениям.',
      sourceSelection:'Как выбираются источники', sourceSelectionText:'Приоритет отдается независимым, проверяемым и связанным с движениями источникам. Учитываются регион, язык, актуальность, техническая доступность и возможный авторитарный или дискриминационный контент.',
      privacy:'Конфиденциальность и сведения об ИИ', privacyText:'Учетная запись не нужна. Настройки и списки обычно остаются на устройстве. Для перевода, резюме или аудио выбранный текст может отправляться указанному сервису; автоматические результаты всегда помечаются.',
      social:'Альтернативные соцсети · редакционная подготовка', socialText:'Mastodon, PeerTube, Mobilizon и другие свободные сети будут добавлены позже через прозрачно отобранные аккаунты и инстансы, а не как нефильтрованная лента.',
      feedback: 'Участвовать', feedbackText: 'Знаете отсутствующий источник, нашли ошибку или есть идея? Напишите нам. Особенно важны предложения из слабо представленных регионов и языков.',
      button: 'Отправить отзыв', note: 'Коллекция не претендует на полноту. Слова, взгляды и движения меняются — приложение должно развиваться вместе с пользователями.'
    },
    el: {
      nav: 'Σχετικά', title: 'Γιατί υπάρχει το World Revolution News',
      lead: 'Το World Revolution News διευκολύνει την εύρεση ανεξάρτητης, αναρχικής, αριστερής ελευθεριακής και αντιεξουσιαστικής ενημέρωσης από πολλές περιοχές.',
      why: 'Γιατί φτιάχνουμε την εφαρμογή', whyText: 'Σημαντικές φωνές είναι διασκορπισμένες σε μικρούς ιστότοπους, γλώσσες και μορφές. Η εφαρμογή τις συγκεντρώνει χωρίς να αντικαθιστά τις αρχικές πηγές.',
      found: 'Τι θα βρείτε', items: ['Ειδήσεις ανά περιοχή και θέμα', 'Εκδηλώσεις από το Radar.squat και άλλα ημερολόγια', 'Podcast, παραγόμενο ήχο, ραδιόφωνο και βίντεο', 'Εργαλεία μετάφρασης, σύνοψης, αποθήκευσης και δημιουργίας zine'],
      principles: 'Πώς εργαζόμαστε', principlesText: 'Οι πηγές παραμένουν ορατές και συνδεδεμένες. Οι αυτόματες μεταφράσεις και συνόψεις μπορεί να έχουν λάθη. Η επιλογή παραμένει ανοιχτή σε κριτική και αλλαγή.',
      sourceSelection:'Πώς επιλέγονται οι πηγές', sourceSelectionText:'Προτιμούμε ανεξάρτητες, επαληθεύσιμες πηγές που συνδέονται με κινήματα. Εξετάζονται η περιοχή, η γλώσσα, η συνάφεια, η τεχνική διαθεσιμότητα και τυχόν αυταρχικό ή μεροληπτικό περιεχόμενο.',
      privacy:'Ιδιωτικότητα και πληροφορίες για ΤΝ', privacyText:'Δεν απαιτείται λογαριασμός. Ρυθμίσεις και λίστες παραμένουν συνήθως στη συσκευή. Για μετάφραση, σύνοψη ή ήχο, επιλεγμένο κείμενο μπορεί να σταλεί στην αναφερόμενη υπηρεσία· τα αυτόματα αποτελέσματα επισημαίνονται.',
      social:'Εναλλακτικά κοινωνικά δίκτυα · επιμελημένη προετοιμασία', socialText:'Mastodon, PeerTube, Mobilizon και άλλα ελεύθερα δίκτυα θα προστεθούν αργότερα μέσω λογαριασμών και instances που επιλέγονται με διαφάνεια, ποτέ ως αφιλτράριστη ροή.',
      feedback: 'Συμμετοχή', feedbackText: 'Γνωρίζετε πηγή που λείπει, βρήκατε λάθος ή έχετε ιδέα; Γράψτε μας. Ιδιαίτερα ευπρόσδεκτες είναι προτάσεις από περιοχές και γλώσσες με μικρή εκπροσώπηση.',
      button: 'Αποστολή σχολίου', note: 'Η συλλογή δεν ισχυρίζεται ότι είναι πλήρης. Λέξεις, οπτικές και κινήματα αλλάζουν — η εφαρμογή πρέπει να εξελίσσεται μαζί με τους χρήστες της.'
    },
    tr: {
      nav: 'Uygulama hakkında', title: 'World Revolution News neden var',
      lead: 'World Revolution News, birçok bölgeden bağımsız, anarşist, sol-liberter ve otorite karşıtı haberlere ulaşmayı kolaylaştırır.',
      why: 'Uygulamayı neden yapıyoruz', whyText: 'Önemli sesler küçük sitelere, dillere ve formatlara dağılmış durumda. Uygulama özgün kaynakların yerini almadan onları bir araya getirir.',
      found: 'Burada ne var', items: ['Bölge ve konuya göre haberler', 'Radar.squat ve diğer takvimlerden etkinlikler', 'Podcastler, üretilen sesler, radyo ve videolar', 'Çeviri, özetleme, kaydetme ve kendi zine’ını oluşturma araçları'],
      principles: 'Nasıl çalışıyoruz', principlesText: 'Kaynaklar görünür ve bağlantılı kalır. Otomatik çeviri ve özetler hata içerebilir. Seçim ve çerçeveleme eleştiri ve değişime açıktır.',
      sourceSelection:'Kaynaklar nasıl seçiliyor', sourceSelectionText:'Bağımsız, doğrulanabilir ve hareketlerle bağlantılı kaynaklara öncelik veriyoruz. Bölge, dil, içerik ilgisi, teknik erişilebilirlik ve olası otoriter ya da ayrımcı içerik denetleniyor.',
      privacy:'Gizlilik ve yapay zekâ bilgileri', privacyText:'Hesap gerekmez. Ayarlar ve listeler normalde cihazda kalır. Çeviri, özet veya ses üretimi için seçilen metin belirtilen hizmete gönderilebilir; otomatik sonuçlar her zaman işaretlenir.',
      social:'Alternatif sosyal ağlar · küratörlü hazırlık', socialText:'Mastodon, PeerTube, Mobilizon ve diğer özgür ağlar daha sonra şeffafça seçilen hesap ve sunucular üzerinden eklenecek; filtrelenmemiş bir akış olmayacak.',
      feedback: 'Katılın', feedbackText: 'Eksik bir kaynak, hata veya fikriniz mi var? Bize yazın. Özellikle az temsil edilen bölge ve dillerden önerileri bekliyoruz.',
      button: 'Geri bildirim gönder', note: 'Bu koleksiyon eksiksiz olma iddiasında değildir. Sözcükler, bakış açıları ve hareketler değişir; uygulama kullanıcılarıyla birlikte büyümelidir.'
    }
  };

  const hiddenNodes = new Map();
  const lang = value => String(value || document.getElementById('ui-language')?.value || document.documentElement.lang || 'en').toLowerCase().split(/[-_]/)[0];
  const copy = code => ({ ...COPY.en, ...(COPY[lang(code)] || {}) });

  function ensureRoot() {
    let root = document.getElementById('wrn-about-184');
    if (root) return root;
    root = document.createElement('section');
    root.id = 'wrn-about-184';
    root.className = 'wrn-about-184';
    root.hidden = true;
    const anchor = document.getElementById('feed-container');
    anchor?.parentNode?.insertBefore(root, anchor);
    return root;
  }

  function render() {
    const root = ensureRoot();
    const t = copy();
    root.textContent = '';
    const header = document.createElement('header');
    header.innerHTML = `<span>WORLD REVOLUTION NEWS</span><h2></h2><p></p>`;
    header.querySelector('h2').textContent = t.title;
    header.querySelector('p').textContent = t.lead;
    root.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'wrn-about-grid-184';
    [
      [t.why, t.whyText],
      [t.sourceSelection, t.sourceSelectionText],
      [t.principles, t.principlesText],
      [t.privacy, t.privacyText]
    ].forEach(([title, body]) => {
      const section = document.createElement('section');
      const heading = document.createElement('h3');
      const paragraph = document.createElement('p');
      heading.textContent = title;
      paragraph.textContent = body;
      section.append(heading, paragraph);
      grid.appendChild(section);
    });
    const found = document.createElement('section');
    const foundTitle = document.createElement('h3');
    const list = document.createElement('ul');
    foundTitle.textContent = t.found;
    t.items.forEach(value => {
      const item = document.createElement('li');
      item.textContent = value;
      list.appendChild(item);
    });
    found.append(foundTitle, list);
    grid.insertBefore(found, grid.children[1]);
    root.appendChild(grid);

    const social = document.createElement('section');
    social.className = 'wrn-about-social-185';
    const socialTitle = document.createElement('h3');
    const socialText = document.createElement('p');
    const socialList = document.createElement('div');
    socialTitle.textContent = t.social;
    socialText.textContent = t.socialText;
    socialList.className = 'wrn-about-social-list-185';
    [
      ['Mastodon', 'Föderierte Kurzbeiträge', 'https://joinmastodon.org/servers'],
      ['PeerTube', 'Föderierte Videos', 'https://joinpeertube.org/browse-content'],
      ['Mobilizon', 'Termine und Gruppen', 'https://mobilizon.org/'],
      ['Funkwhale', 'Freies Audio', 'https://www.funkwhale.audio/']
    ].forEach(([name, description, url]) => {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.referrerPolicy = 'no-referrer';
      link.innerHTML = `<strong>${name}</strong><span>${description}</span>`;
      socialList.appendChild(link);
    });
    social.append(socialTitle, socialText, socialList);
    root.appendChild(social);

    const feedback = document.createElement('section');
    feedback.className = 'wrn-about-feedback-184';
    const feedbackTitle = document.createElement('h3');
    const feedbackText = document.createElement('p');
    const button = document.createElement('button');
    feedbackTitle.textContent = t.feedback;
    feedbackText.textContent = t.feedbackText;
    button.type = 'button';
    button.textContent = t.button;
    button.addEventListener('click', () => window.openFeedback?.());
    feedback.append(feedbackTitle, feedbackText, button);
    root.appendChild(feedback);

    const note = document.createElement('p');
    note.className = 'wrn-about-note-184';
    note.textContent = t.note;
    root.appendChild(note);
  }

  function hideStandard() {
    ['feed-container', 'archive-container', 'event-filter-panel', 'status-container', 'txt-archive-title', 'wrn-video-hub', 'wrn-stories-view', 'wrn-audio-tab-183', 'wrn-briefing-2', 'wrn-lexicon-184'].forEach(id => {
      const node = document.getElementById(id);
      if (!node || node.id === 'wrn-about-184') return;
      if (!hiddenNodes.has(node)) hiddenNodes.set(node, { hidden: node.hidden, display: node.style.display });
      node.hidden = true;
      node.style.display = 'none';
    });
  }

  function show() {
    hideStandard();
    const root = ensureRoot();
    render();
    root.hidden = false;
    root.style.display = 'block';
    document.body.dataset.wrnTab = 'about';
  }

  function hide() {
    const root = document.getElementById('wrn-about-184');
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

  window.WRNAbout184 = Object.freeze({
    show, hide, render,
    label: code => copy(code).nav
  });
})();
