// Local task guidance; opening it never contacts providers or generates audio.
(function(root) {
  'use strict';
  const COPY = {
  "de": {
    "title": "App-Hilfe",
    "intro": "So findest, hörst und teilst du Inhalte. Deine Suche und Filter bleiben beim Zurückgehen erhalten.",
    "radio": [
      "Radio hören",
      "Öffne Medien → Radio. Wähle einen Sender mit Wiedergabe und starte ihn selbst. Pause unterbricht, Stop beendet die Wiedergabe. Bei einem defekten oder länger als 15 Sekunden ladenden Stream versucht die App einen hinterlegten Ersatzstream. Ein Sender ohne freigegebenen Stream führt zur Originalwebsite; nicht jeder Eintrag ist direkt abspielbar."
    ],
    "podcasts": [
      "Podcasts und Vorlesen",
      "Unter Medien → Podcasts öffnet der Original-Link die Seite des Anbieters. Eine direkt abspielbare Folge hat eine Audiodatei. Im Artikel liest die Gerätestimme den verfügbaren Text lokal vor; das ist keine Podcastfolge des Anbieters. Eine gemeinsam erzeugte Hördatei benötigt den Cloud-Dienst und freie Kontingente."
    ],
    "sharing": [
      "Inhalte teilen",
      "Nutze Teilen am Sender, an der Folge oder im Artikel. Radio- und Podcasttexte enthalten den Original-Link und einen Verweis auf die App. Wurde der Artikel bereits übersetzt, wird die übersetzte Überschrift geteilt, ergänzt um „übersetzt mit World Revolution News App“. Die Originalquelle bleibt erkennbar."
    ],
    "translation": [
      "Übersetzen und Wartezeiten",
      "Wähle oben deine Zielsprache. Öffne einen Artikel und nutze Übersetzen; prüfe auch die angegebene Originalsprache. Erfolgreiche gemeinsame Übersetzungen können andere Nutzer aus dem Cache erhalten, wenn derselbe Text und dieselbe Zielsprache passen. Neue Übersetzungen brauchen eine Verbindung und verfügbare Dienste. Unter Systemstatus stehen bestätigte WRN-Kontingente und Resetzeiten; unbekannte Providerlimits bleiben unbekannt. Bei einem Wartehinweis bis zum angegebenen Zeitpunkt warten. Originaltext oder Gerätestimme bleiben Alternativen."
    ],
    "offline": [
      "Offline und gespeicherte Inhalte",
      "Achte auf das Datum und die Offlineanzeige des Inhalts. Offline bedeutet zuletzt verfügbare Daten, keine aktuellen Nachrichten. Gespeichert merkt einen Artikel; es lädt nicht automatisch externe Audio-, Video- oder Buchdateien herunter. Die lokale Gerätestimme kann verfügbaren Text vorlesen. Live-Radio und neue Cloud-Übersetzungen brauchen eine Verbindung. Lokale Daten lassen sich im Menü prüfen und löschen."
    ],
    "feedback": [
      "Fehler oder defekte Quelle melden",
      "Öffne im Menü Feedback & neue Quellen. Nenne Quelle, Original-Link, Zielsprache und was nicht funktioniert; füge die Fehlermeldung hinzu. Teile keine Passwörter oder privaten Kontaktadressen. Die Meldung wird erst nach deinem Absenden übertragen."
    ],
    "radioAction": "Radio öffnen",
    "libraryAction": "Bibliothek öffnen"
  },
  "en": {
    "title": "App help",
    "intro": "Find, listen to and share content. Going back preserves your search and filters.",
    "radio": [
      "Listen to radio",
      "Open Media → Radio. Choose a station with playback and start it yourself. Pause interrupts playback; Stop ends it. If a stream fails or loads for more than 15 seconds, the app tries a configured alternative. Stations without an approved stream link to their original website; not every listing plays directly."
    ],
    "podcasts": [
      "Podcasts and read aloud",
      "In Media → Podcasts, the original link opens the provider’s page. A directly playable episode has an audio file. In an article, the device voice reads available text locally; this is not an episode from the publisher. A shared generated audio file needs the cloud service and available allowance."
    ],
    "sharing": [
      "Share content",
      "Use Share on a station, episode or article. Radio and podcast messages include the original link and a link to the app. If an article has already been translated, its translated headline is shared with the note “translated with World Revolution News App”. The original source remains identifiable."
    ],
    "translation": [
      "Translate and waiting times",
      "Choose your target language in the header. Open an article and use Translate; check the original language too. Other users can receive successful shared translations from the cache when the text and target language match. New translations need a connection and available services. System status shows confirmed WRN allowances and reset times; unknown provider limits remain unknown. If a waiting time is shown, wait until that time. Original text or the device voice remain alternatives."
    ],
    "offline": [
      "Offline and saved content",
      "Check the content’s date and offline indicator. Offline means the last available data, not current news. Saved bookmarks an article; it does not automatically download external audio, video or book files. The local device voice can read available text. Live radio and new cloud translations need a connection. Review and delete local data in the menu."
    ],
    "feedback": [
      "Report a problem or broken source",
      "Open Feedback & new sources in the menu. Include the source, original link, target language, what failed and the error message. Do not include passwords or private contact addresses. The report is transmitted only when you send it."
    ],
    "radioAction": "Open radio",
    "libraryAction": "Open library"
  },
  "es": {
    "title": "Ayuda de la app",
    "intro": "Busca, escucha y comparte contenidos. Al volver se conservan la búsqueda y los filtros.",
    "radio": [
      "Escuchar radio",
      "Abre Medios → Radio y elige una emisora con reproducción. Iníciala tú: Pausa la interrumpe y Detener la finaliza. Si falla o tarda más de 15 segundos, la app prueba una alternativa configurada. Sin un stream aprobado se abre la web original; no todas las entradas se reproducen directamente."
    ],
    "podcasts": [
      "Podcasts y lectura en voz alta",
      "En Medios → Podcasts, el enlace original abre la página del proveedor. Una entrega reproducible tiene un archivo de audio. La voz del dispositivo lee localmente el texto disponible del artículo; no es un episodio del editor. Un audio generado compartido necesita el servicio en la nube y cuota disponible."
    ],
    "sharing": [
      "Compartir contenidos",
      "Usa Compartir en una emisora, episodio o artículo. Los mensajes de radio y podcasts incluyen el enlace original y la app. Si el artículo ya está traducido, se comparte el titular traducido con una nota que atribuye la traducción a World Revolution News App. La fuente original sigue identificada."
    ],
    "translation": [
      "Traducir y tiempos de espera",
      "Elige el idioma de destino arriba, abre un artículo y pulsa Traducir. Comprueba su idioma original. Otros usuarios pueden recibir la traducción compartida de la caché si coinciden texto e idioma de destino. Una traducción nueva requiere conexión y servicios disponibles. Estado del sistema muestra cuotas WRN confirmadas y sus reinicios; los límites desconocidos del proveedor siguen desconocidos. Respeta la hora de espera indicada. El original o la voz del dispositivo son alternativas."
    ],
    "offline": [
      "Sin conexión y guardados",
      "Comprueba la fecha y el indicador sin conexión. Son los últimos datos disponibles, no noticias actuales. Guardar marca un artículo; no descarga automáticamente audio, vídeos o libros externos. La voz local puede leer el texto disponible. La radio en directo y traducciones nuevas en la nube requieren conexión. Revisa y elimina datos locales en el menú."
    ],
    "feedback": [
      "Informar de errores",
      "Abre Comentarios y nuevas fuentes en el menú. Indica fuente, enlace original, idioma de destino, fallo y mensaje de error. No incluyas contraseñas ni direcciones privadas. El informe solo se transmite cuando lo envías."
    ],
    "radioAction": "Abrir radio",
    "libraryAction": "Abrir biblioteca"
  },
  "fr": {
    "title": "Aide de l’app",
    "intro": "Trouver, écouter et partager des contenus. Le retour conserve la recherche et les filtres.",
    "radio": [
      "Écouter la radio",
      "Ouvre Médias → Radio et choisis une station avec lecture. Démarre-la toi-même : Pause interrompt, Arrêter termine la lecture. Si le flux échoue ou charge plus de 15 secondes, l’app essaie une alternative configurée. Sans flux approuvé, le lien mène au site original ; toutes les entrées ne se lisent pas directement."
    ],
    "podcasts": [
      "Podcasts et lecture à voix haute",
      "Dans Médias → Podcasts, le lien original ouvre la page du fournisseur. Un épisode directement lisible possède un fichier audio. La voix de l’appareil lit localement le texte disponible d’un article ; ce n’est pas un épisode de l’éditeur. Un fichier audio généré partagé nécessite le service cloud et un quota disponible."
    ],
    "sharing": [
      "Partager des contenus",
      "Utilise Partager sur une station, un épisode ou un article. Les messages radio et podcast contiennent le lien original et celui de l’app. Si l’article est déjà traduit, le titre traduit est partagé avec une mention de World Revolution News App. La source originale reste identifiable."
    ],
    "translation": [
      "Traduction et attente",
      "Choisis la langue cible en haut, ouvre un article et utilise Traduire. Vérifie sa langue originale. Le cache peut fournir une traduction partagée aux autres utilisateurs si le texte et la langue cible correspondent. Une nouvelle traduction nécessite connexion et services disponibles. État du système indique les quotas WRN confirmés et leur réinitialisation ; les limites inconnues du fournisseur restent inconnues. Respecte l’heure d’attente indiquée. Le texte original et la voix de l’appareil restent disponibles."
    ],
    "offline": [
      "Hors ligne et contenus enregistrés",
      "Vérifie la date et l’indicateur hors ligne. Ce sont les dernières données disponibles, pas des nouvelles actuelles. Enregistrer marque un article ; cela ne télécharge pas automatiquement de fichiers audio, vidéo ou livres externes. La voix locale peut lire le texte disponible. Radio en direct et nouvelles traductions cloud nécessitent une connexion. Examine et supprime les données locales dans le menu."
    ],
    "feedback": [
      "Signaler un problème",
      "Ouvre Commentaires et nouvelles sources dans le menu. Indique source, lien original, langue cible, problème et message d’erreur. N’inclus ni mots de passe ni adresses privées. Le rapport est transmis uniquement quand tu l’envoies."
    ],
    "radioAction": "Ouvrir la radio",
    "libraryAction": "Ouvrir la bibliothèque"
  },
  "it": {
    "title": "Guida dell’app",
    "intro": "Trova, ascolta e condividi contenuti. Tornando indietro conservi ricerca e filtri.",
    "radio": [
      "Ascoltare la radio",
      "Apri Media → Radio e scegli una stazione con riproduzione. Avviala tu: Pausa interrompe, Stop termina. Se lo stream fallisce o carica per oltre 15 secondi, l’app prova un’alternativa configurata. Senza uno stream approvato si apre il sito originale; non tutte le voci si riproducono direttamente."
    ],
    "podcasts": [
      "Podcast e lettura ad alta voce",
      "In Media → Podcast, il link originale apre la pagina del fornitore. Un episodio riproducibile ha un file audio. La voce del dispositivo legge localmente il testo disponibile dell’articolo; non è un episodio dell’editore. Un audio generato condiviso richiede il servizio cloud e una quota disponibile."
    ],
    "sharing": [
      "Condividere contenuti",
      "Usa Condividi su stazione, episodio o articolo. I messaggi radio e podcast includono il link originale e l’app. Se l’articolo è già tradotto, si condivide il titolo tradotto con una nota che attribuisce la traduzione a World Revolution News App. La fonte originale resta identificabile."
    ],
    "translation": [
      "Tradurre e attendere",
      "Scegli la lingua di destinazione in alto, apri un articolo e usa Traduci. Controlla la lingua originale. La cache può fornire la traduzione condivisa ad altri utenti quando testo e lingua corrispondono. Le nuove traduzioni richiedono connessione e servizi disponibili. Stato del sistema mostra le quote WRN confermate e i tempi di ripristino; i limiti sconosciuti del fornitore restano sconosciuti. Rispetta l’orario di attesa indicato. Originale o voce del dispositivo sono alternative."
    ],
    "offline": [
      "Offline e contenuti salvati",
      "Controlla data e indicatore offline. Sono gli ultimi dati disponibili, non notizie attuali. Salvare aggiunge un segnalibro; non scarica automaticamente file audio, video o libri esterni. La voce locale può leggere il testo disponibile. Radio in diretta e nuove traduzioni cloud richiedono connessione. Controlla ed elimina i dati locali dal menu."
    ],
    "feedback": [
      "Segnalare problemi",
      "Apri Feedback e nuove fonti nel menu. Indica fonte, link originale, lingua di destinazione, problema e messaggio di errore. Non includere password o indirizzi privati. La segnalazione viene trasmessa solo quando la invii."
    ],
    "radioAction": "Apri radio",
    "libraryAction": "Apri biblioteca"
  },
  "pt": {
    "title": "Ajuda da app",
    "intro": "Encontra, ouve e partilha conteúdos. Ao voltar, a pesquisa e os filtros mantêm-se.",
    "radio": [
      "Ouvir rádio",
      "Abre Media → Rádio e escolhe uma estação com reprodução. Inicia-a: Pausa interrompe e Parar termina. Se o stream falhar ou carregar por mais de 15 segundos, a app tenta uma alternativa configurada. Sem stream aprovado, o link abre o site original; nem todas as entradas permitem reprodução direta."
    ],
    "podcasts": [
      "Podcasts e leitura em voz alta",
      "Em Media → Podcasts, o link original abre a página do fornecedor. Um episódio reproduzível tem um ficheiro áudio. A voz do dispositivo lê localmente o texto disponível do artigo; não é um episódio do editor. Um áudio gerado partilhado precisa do serviço cloud e de quota disponível."
    ],
    "sharing": [
      "Partilhar conteúdos",
      "Usa Partilhar numa estação, episódio ou artigo. As mensagens de rádio e podcast incluem o link original e a app. Se o artigo já foi traduzido, partilha-se o título traduzido com uma nota que atribui a tradução à World Revolution News App. A fonte original continua identificável."
    ],
    "translation": [
      "Traduzir e esperar",
      "Escolhe o idioma de destino no topo, abre um artigo e usa Traduzir. Confirma o idioma original. A cache pode disponibilizar traduções partilhadas a outros utilizadores quando texto e idioma coincidem. Novas traduções requerem ligação e serviços disponíveis. Estado do sistema mostra quotas WRN confirmadas e reposições; limites desconhecidos do fornecedor continuam desconhecidos. Respeita a hora de espera indicada. Texto original ou voz do dispositivo são alternativas."
    ],
    "offline": [
      "Offline e guardados",
      "Verifica a data e o indicador offline. São os últimos dados disponíveis, não notícias atuais. Guardar marca um artigo; não descarrega automaticamente áudio, vídeo ou livros externos. A voz local pode ler texto disponível. Rádio em direto e novas traduções cloud precisam de ligação. Revê e elimina dados locais no menu."
    ],
    "feedback": [
      "Comunicar problemas",
      "Abre Feedback e novas fontes no menu. Indica fonte, link original, idioma de destino, problema e mensagem de erro. Não incluas palavras-passe nem endereços privados. O relatório só é transmitido quando o envias."
    ],
    "radioAction": "Abrir rádio",
    "libraryAction": "Abrir biblioteca"
  },
  "ru": {
    "title": "Помощь по приложению",
    "intro": "Как находить, слушать и делиться материалами. При возврате поиск и фильтры сохраняются.",
    "radio": [
      "Слушать радио",
      "Откройте Медиа → Радио и выберите станцию с воспроизведением. Запустите её сами: Пауза приостанавливает, Стоп завершает. При ошибке или загрузке дольше 15 секунд приложение пробует настроенный запасной поток. Без разрешённого потока ссылка ведёт на исходный сайт; не каждую запись можно слушать напрямую."
    ],
    "podcasts": [
      "Подкасты и чтение вслух",
      "В Медиа → Подкасты исходная ссылка открывает страницу автора. Для прямого воспроизведения нужен аудиофайл. Голос устройства читает доступный текст статьи локально; это не выпуск издателя. Общий сгенерированный аудиофайл требует облачного сервиса и доступной квоты."
    ],
    "sharing": [
      "Поделиться материалом",
      "Используйте Поделиться у станции, выпуска или статьи. Сообщения о радио и подкастах содержат исходную ссылку и ссылку на приложение. Для уже переведённой статьи используется переведённый заголовок с указанием World Revolution News App. Исходный источник остаётся указанным."
    ],
    "translation": [
      "Перевод и ожидание",
      "Выберите целевой язык вверху, откройте статью и нажмите Перевести. Проверьте исходный язык. Другие пользователи могут получить общий перевод из кэша, если текст и целевой язык совпадают. Новый перевод требует соединения и доступных сервисов. Состояние системы показывает подтверждённые квоты WRN и время сброса; неизвестные лимиты провайдера остаются неизвестными. Дождитесь указанного времени. Исходный текст или голос устройства остаются альтернативами."
    ],
    "offline": [
      "Офлайн и сохранённое",
      "Проверяйте дату и отметку офлайн. Это последние доступные данные, а не актуальные новости. Сохранение добавляет статью в закладки; оно не скачивает автоматически внешние аудио, видео или книги. Локальный голос может читать доступный текст. Прямой эфир и новые облачные переводы требуют соединения. Проверяйте и удаляйте локальные данные в меню."
    ],
    "feedback": [
      "Сообщить о проблеме",
      "Откройте Отзывы и новые источники в меню. Укажите источник, исходную ссылку, целевой язык, проблему и сообщение об ошибке. Не указывайте пароли или личные адреса. Сообщение передаётся только после отправки."
    ],
    "radioAction": "Открыть радио",
    "libraryAction": "Открыть библиотеку"
  },
  "el": {
    "title": "Βοήθεια εφαρμογής",
    "intro": "Βρες, άκου και μοιράσου περιεχόμενο. Η επιστροφή διατηρεί αναζήτηση και φίλτρα.",
    "radio": [
      "Ακρόαση ραδιοφώνου",
      "Άνοιξε Μέσα → Ραδιόφωνο και επίλεξε σταθμό με αναπαραγωγή. Ξεκίνα εσύ: Παύση διακόπτει προσωρινά και Διακοπή τερματίζει. Σε σφάλμα ή φόρτωση άνω των 15 δευτερολέπτων, η εφαρμογή δοκιμάζει ορισμένη εναλλακτική ροή. Χωρίς εγκεκριμένη ροή ανοίγει η αρχική ιστοσελίδα· δεν παίζουν όλες οι καταχωρίσεις απευθείας."
    ],
    "podcasts": [
      "Podcast και ανάγνωση",
      "Στα Μέσα → Podcast, ο αρχικός σύνδεσμος ανοίγει τη σελίδα του παρόχου. Ένα επεισόδιο με άμεση αναπαραγωγή έχει αρχείο ήχου. Η φωνή της συσκευής διαβάζει το διαθέσιμο κείμενο τοπικά· δεν είναι επεισόδιο του εκδότη. Ένα κοινό παραγόμενο αρχείο ήχου χρειάζεται υπηρεσία cloud και διαθέσιμο όριο."
    ],
    "sharing": [
      "Κοινοποίηση περιεχομένου",
      "Χρησιμοποίησε Κοινοποίηση σε σταθμό, επεισόδιο ή άρθρο. Τα μηνύματα ραδιοφώνου και podcast περιλαμβάνουν αρχικό σύνδεσμο και εφαρμογή. Αν το άρθρο έχει μεταφραστεί, κοινοποιείται ο μεταφρασμένος τίτλος με αναφορά στη World Revolution News App. Η αρχική πηγή παραμένει αναγνωρίσιμη."
    ],
    "translation": [
      "Μετάφραση και αναμονή",
      "Επίλεξε γλώσσα προορισμού πάνω, άνοιξε άρθρο και πάτησε Μετάφραση. Έλεγξε την αρχική γλώσσα. Άλλοι χρήστες μπορούν να λάβουν κοινή μετάφραση από την προσωρινή μνήμη αν κείμενο και γλώσσα ταιριάζουν. Νέες μεταφράσεις απαιτούν σύνδεση και διαθέσιμες υπηρεσίες. Η Κατάσταση συστήματος δείχνει επιβεβαιωμένα όρια WRN και επαναφορά· άγνωστα όρια παρόχου παραμένουν άγνωστα. Περίμενε μέχρι την αναφερόμενη ώρα. Πρωτότυπο και φωνή συσκευής παραμένουν επιλογές."
    ],
    "offline": [
      "Εκτός σύνδεσης και αποθηκευμένα",
      "Έλεγξε ημερομηνία και ένδειξη εκτός σύνδεσης. Πρόκειται για τα τελευταία διαθέσιμα δεδομένα, όχι τρέχουσες ειδήσεις. Η αποθήκευση σημειώνει άρθρο· δεν κατεβάζει αυτόματα εξωτερικά αρχεία ήχου, βίντεο ή βιβλίων. Η τοπική φωνή μπορεί να διαβάσει διαθέσιμο κείμενο. Ζωντανό ραδιόφωνο και νέες μεταφράσεις cloud απαιτούν σύνδεση. Έλεγξε και διέγραψε τοπικά δεδομένα από το μενού."
    ],
    "feedback": [
      "Αναφορά προβλήματος",
      "Άνοιξε Σχόλια και νέες πηγές στο μενού. Γράψε πηγή, αρχικό σύνδεσμο, γλώσσα προορισμού, πρόβλημα και μήνυμα σφάλματος. Μη στείλεις κωδικούς ή ιδιωτικές διευθύνσεις. Η αναφορά μεταδίδεται μόνο όταν την αποστείλεις."
    ],
    "radioAction": "Άνοιγμα ραδιοφώνου",
    "libraryAction": "Άνοιγμα βιβλιοθήκης"
  },
  "tr": {
    "title": "Uygulama yardımı",
    "intro": "İçerik bul, dinle ve paylaş. Geri döndüğünde arama ve filtreler korunur.",
    "radio": [
      "Radyo dinleme",
      "Medya → Radyo bölümünü aç ve oynatılabilir bir istasyon seç. Kendin başlat: Duraklat geçici olarak durdurur, Durdur bitirir. Akış hata verirse veya 15 saniyeden uzun yüklenirse uygulama kayıtlı alternatifi dener. Onaylı akış yoksa özgün site açılır; her kayıt doğrudan oynatılamaz."
    ],
    "podcasts": [
      "Podcast ve sesli okuma",
      "Medya → Podcast bölümündeki özgün bağlantı sağlayıcının sayfasını açar. Doğrudan oynatılabilir bölümün ses dosyası vardır. Cihaz sesi makalenin mevcut metnini yerel olarak okur; bu, yayıncının bir bölümü değildir. Paylaşılan üretilmiş ses dosyası bulut hizmeti ve kullanılabilir kota gerektirir."
    ],
    "sharing": [
      "İçerik paylaşma",
      "İstasyon, bölüm veya makalede Paylaş seçeneğini kullan. Radyo ve podcast mesajları özgün bağlantıyı ve uygulama bağlantısını içerir. Makale çevrilmişse çevrilmiş başlık World Revolution News App çeviri notuyla paylaşılır. Özgün kaynak belirtilmeye devam eder."
    ],
    "translation": [
      "Çeviri ve bekleme",
      "Üstten hedef dili seç, makaleyi aç ve Çevir seçeneğini kullan. Özgün dili kontrol et. Metin ve hedef dil eşleşirse diğer kullanıcılar paylaşılan çeviriyi önbellekten alabilir. Yeni çeviriler bağlantı ve kullanılabilir hizmetler gerektirir. Sistem durumu doğrulanmış WRN kotalarını ve sıfırlama zamanlarını gösterir; bilinmeyen sağlayıcı sınırları bilinmiyor olarak kalır. Belirtilen bekleme zamanına uy. Özgün metin veya cihaz sesi alternatiflerdir."
    ],
    "offline": [
      "Çevrimdışı ve kaydedilenler",
      "İçeriğin tarihini ve çevrimdışı işaretini kontrol et. Bunlar son mevcut verilerdir, güncel haberler değildir. Kaydet bir makaleyi işaretler; dış ses, video veya kitap dosyalarını otomatik indirmez. Yerel ses mevcut metni okuyabilir. Canlı radyo ve yeni bulut çevirileri bağlantı gerektirir. Menüden yerel verileri inceleyip silebilirsin."
    ],
    "feedback": [
      "Sorun bildirme",
      "Menüden Geri bildirim ve yeni kaynakları aç. Kaynak, özgün bağlantı, hedef dil, sorun ve hata mesajını belirt. Şifre veya özel adres ekleme. Bildirim yalnızca sen gönderdiğinde iletilir."
    ],
    "radioAction": "Radyoyu aç",
    "libraryAction": "Kütüphaneyi aç"
  }
};
  root.WRNAppGuide = Object.freeze({copy(language) { return COPY[language] || COPY.en; }});
})(globalThis);
