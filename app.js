/* WRN 1.7.21c: browser deletion is repository-scoped. */
// World Revolution News – Hauptlogik, Phase 1K
window.onerror = function(msg, url, line, col, error) {
    const stat = document.getElementById('status-container');
    if (stat) { stat.style.color = '#FF0033'; stat.innerText = `CRASH GEFUNDEN: ${msg} (Zeile ${line})`; }
    return false;
};

// Zentrale Adressen und Versionsangaben liegen in config.js.
// Die Rückfallwerte sorgen dafür, dass die App auch nach einem unvollständigen
// Upload weiterhin startet.
const WRN_CONFIG = window.WRN_CONFIG || {};
const WRN_DATA_URLS = WRN_CONFIG.dataUrls || {};
const GITHUB_NEWS_URL = WRN_DATA_URLS.news || "https://blackfront161.github.io/Revolution-News-Data/news.json";
const GITHUB_EVENTS_URL = WRN_DATA_URLS.events || "https://blackfront161.github.io/Revolution-News-Data/events.json";
const GITHUB_PODCASTS_URL = WRN_DATA_URLS.podcasts || "https://blackfront161.github.io/Revolution-News-Data/podcasts.json";
const GITHUB_RADIO_URL = WRN_DATA_URLS.radio || "https://blackfront161.github.io/Revolution-News-Data/radio-stations.json";
const PROXY_URL = WRN_CONFIG.proxyUrl || "https://revolution-proxy.paghklo.workers.dev";
let capVal1 = 0; let capVal2 = 0;

// Allgemeine Hilfsfunktionen wurden nach utils.js ausgelagert.

function extractTranslationText(data) {
    if (!data) return "";

    if (typeof data === "string") {
        return data.trim();
    }

    // Normale Gemini-Antwort
    const geminiText = data?.candidates?.[0]?.content?.parts
        ?.map(part => typeof part?.text === "string" ? part.text : "")
        .join("")
        .trim();
    if (geminiText) return geminiText;

    // Unterstützt auch vereinfachte Antworten eines eigenen Workers.
    const possibleTexts = [
        data.text,
        data.translation,
        data.translatedText,
        data.result?.text,
        data.data?.text,
        data.output?.text,
        data.choices?.[0]?.message?.content,
        data.choices?.[0]?.text
    ];

    for (const value of possibleTexts) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

// Entfernt typische KI-Vorsätze wie „Hier ist die deutsche Übersetzung:“.
// Das ist nur ein Sicherheitsnetz; der Worker fordert die Modelle zusätzlich
// ausdrücklich auf, ohne Einleitung direkt mit der Übersetzung zu beginnen.
function cleanTranslationOutput(value) {
    let text = String(value ?? "").trim();

    // Entfernt versehentlich ausgegebene Markdown-Codeblöcke.
    text = text
        .replace(/^```(?:text|markdown)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    const unwantedIntroductions = [
        /^(?:\*\*)?\s*Hier ist (?:die )?(?:ins Deutsche übersetzte(?: Fassung| Version)?|deutsche Übersetzung|Übersetzung)(?: des Textes)?\s*:?\s*(?:\*\*)?\s*/i,
        /^(?:\*\*)?\s*Hier folgt (?:die )?(?:deutsche Übersetzung|Übersetzung)\s*:?\s*(?:\*\*)?\s*/i,
        /^(?:\*\*)?\s*Deutsche Übersetzung\s*:?\s*(?:\*\*)?\s*/i,
        /^(?:\*\*)?\s*Here is (?:the )?(?:German translation|translation|translated version)(?: of the text)?\s*:?\s*(?:\*\*)?\s*/i,
        /^(?:\*\*)?\s*Translation\s*:?\s*(?:\*\*)?\s*/i
    ];

    for (const pattern of unwantedIntroductions) {
        text = text.replace(pattern, "").trim();
    }

    return text;
}

function extractTranslationError(data, status) {
    const possibleMessages = [
        data?.error?.message,
        typeof data?.error === "string" ? data.error : "",
        data?.message,
        data?.detail,
        data?.error_description
    ];

    for (const value of possibleMessages) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    if (status === 401 || status === 403) {
        return "Der Übersetzungsserver lehnt die Anfrage ab. Bitte später erneut versuchen.";
    }
    if (status === 429) {
        return "Das kostenlose Übersetzungslimit wurde vorübergehend erreicht. Bitte später erneut versuchen.";
    }
    if (status >= 500) {
        return "Der Übersetzungsserver oder Gemini ist vorübergehend nicht erreichbar.";
    }

    return `Unbekannter Übersetzungsfehler (HTTP ${status || "ohne Status"}).`;
}

async function performTranslationFetch({ headers, body, timeoutMs = 45000 }) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(PROXY_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal: controller.signal
        });

        const rawResponse = await response.text();
        let data = {};

        if (rawResponse.trim()) {
            try {
                data = JSON.parse(rawResponse);
            } catch {
                data = rawResponse;
            }
        }

        const translatedText = cleanTranslationOutput(extractTranslationText(data));
        if (response.ok && translatedText) {
            return {
                error: false,
                text: translatedText,
                status: response.status,
                provider: data?.provider || ""
            };
        }

        return {
            error: true,
            message: extractTranslationError(data, response.status),
            status: response.status,
            data
        };
    } catch (error) {
        return {
            error: true,
            message: error?.name === "AbortError"
                ? "Die Übersetzung hat länger als 45 Sekunden gedauert und wurde abgebrochen."
                : `Der Übersetzungsserver konnte nicht erreicht werden: ${error?.message || error}`,
            status: 0,
            networkError: true
        };
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function fetchTranslationRequest({
    title = "",
    text = "",
    mode = "title_and_text",
    targetLanguage = currentLang,
}) {
    const safeTitle = String(title || "").slice(0, 500);
    const safeText = String(text || "").slice(0, 6000);

    // Neues, eingeschränktes Protokoll.
    const result = await performTranslationFetch({
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": getClientId()
        },
        body: {
            action: "translate",
            targetLanguage,
            mode,
            title: safeTitle,
            text: safeText
        }
    });

    if (result.error) console.error("Übersetzungsserver-Fehler:", result);
    return result;
}

function showTranslationError(buttonElement, cardElement, result) {
    const message = result?.message || "Unbekannter Übersetzungsfehler.";
    const shortLabel = currentLang === "de"
        ? "[ ÜBERSETZUNG FEHLER ]"
        : "[ TRANSLATION ERROR ]";

    if (buttonElement) {
        buttonElement.textContent = shortLabel;
        buttonElement.title = message;
    }

    if (cardElement) {
        cardElement.dataset.translated = "none";
    }

    const statusElement = document.getElementById("status-container");
    if (statusElement) {
        statusElement.style.color = "#FF0033";
        statusElement.textContent = currentLang === "de"
            ? `Übersetzung fehlgeschlagen: ${message}`
            : `Translation failed: ${message}`;
    }
}

const starSpinner = `<svg class="spinner" viewBox="0 0 24 24" width="1.4em" height="1.4em"><path fill="url(#rbGrad)" stroke="var(--color-accent)" stroke-width="0.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const rbStar = `<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" style="vertical-align: sub; margin-left: 4px;"><path fill="url(#rbGrad)" stroke="#FF0000" stroke-width="0.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

const uiTexte = {
    en: {
        init: "Loading data...", error: "Offline Mode.", btnTranslate: "Translate", btnLoading: "Translating...", btnDone: "Translated",
        btnReadMore: "Original", btnExpand: "Read More ⬇️", btnCollapse: "Collapse ⬆️", filterAll: "All Portals", sortNew: "Newest", sortOld: "Oldest",
        searchRegion: "🌍 Region", searchTopic: "🏷️ Topic", latestNews: "Latest Updates:", translatingRest: "Translating remaining text...",
        topBookmarks: "Bookmarks", btnDonateTop: "Donate", donateTitle: "Support the Project", 
        donateBody: "This project runs independently. Donations are voluntary.", donateWarning: "⚠️ WARNING: By proceeding, you are leaving the anonymous app environment and will be redirected to PayPal.",
        btnPaypal: "Continue to PayPal", btnDonateCancel: "Close", dateLabel: "DATE:", langLabel: "Language:",
        searchPlace: "Search articles...", bookmarkCat: "Saved Bookmarks", btnBookmark: "Bookmark" + rbStar, btnUnbookmark: "Saved" + rbStar,
        themeLabel: "Design:", themeDark: "Dark", themeLight: "Light", clearBtn: "Clear Cache 🗑️",
        catGlobal: "Global", catEurope: "Europe", catAfrica: "Africa", catNorthAmerica: "North Am.", catLatinAmerica: "Latin Am.", catAsia: "Asia", catAustralia: "Oceania",
        catLabor: "Labor", catAntifascism: "Antifa", catAntisexism: "Antisexism", catQueer: "Queer", catAntiracism: "Antiracism", catNoBorders: "No Borders", catAnticapitalism: "Anti-Cap", catTheory: "Theory", catAnticolonialism: "Anti-Col", catAntiimperialism: "Anti-Imp", catSquatting: "Housing/Squats", catDemos: "Demos", catAntirepression: "Anti-Rep/Prisons", catCyber: "Cyber", catNoWar: "No War", catAnimal: "Animal Lib", catEco: "Eco-Anarchy", catIndigenous: "Indigenous", catHealth: "Health/Disability", catLibraries: "Libraries",
        fbBtn: "💬 Contact", fbTitle: "Contact", fbPlace: "Write your ideas or bug reports here...", fbCaptcha: "Captcha: What is", fbCancel: "Cancel", fbSend: "Send via Mail", fbErrCap: "Captcha is wrong!", fbErrEmpty: "Please write something first.",
        infoBtn: "ℹ️ Info", infoTitle: "App Info & Security (OPSEC)", archiveTitle: "🗄️ Archive (> 3 Months)", publisherLabel: "SOURCE:", authorLabel: "AUTHOR:", contactLabel: "Contact:",
        radarSummary: "Events", radarCat: "Events",
        infoBody: `<p><strong>Passion Project:</strong> This is an independent, non-commercial passion project. It may contain errors. Please report bugs or broken sources via the "Contact" section.</p><p><strong>Local app data:</strong> This app does not require user accounts and does not intentionally set advertising or analytics cookies. Bookmarks and settings are stored locally in your browser. News, events, and generated translations are stored in IndexedDB for offline use.</p><p><strong>External connections:</strong> Loading news data, article images, translations, original articles, and PayPal may connect your browser to external providers. Those providers can receive normal technical connection data such as an IP address.</p><p><strong>Shared podcasts:</strong> When a natural-voice podcast is generated, the translated title and article text are sent through the Cloudflare worker to Microsoft Azure Speech. The resulting audio and basic metadata are publicly listed in the app for up to 30 days. No username is stored with the podcast.</p><p><strong>Content & AI translations:</strong> This app aggregates external RSS content. AI-generated translations and summaries may contain errors. Please check the original source when accuracy is important.</p>`
    },
    de: {
        init: "Lade Daten...", error: "Offline Modus.", btnTranslate: "Übersetzen", btnLoading: "Übersetze...", btnDone: "Übersetzt",
        btnReadMore: "Zum Original", btnExpand: "Weiterlesen ⬇️", btnCollapse: "Zuklappen ⬆️", filterAll: "Alle Quellen", sortNew: "Neueste", sortOld: "Älteste",
        searchRegion: "🌍 Region", searchTopic: "🏷️ Thema", latestNews: "Aktuelle Updates:", translatingRest: "Übersetze Rest...",
        topBookmarks: "Lesezeichen", btnDonateTop: "Spenden", donateTitle: "Projekt unterstützen", 
        donateBody: "Dieses Projekt läuft unabhängig. Spenden von Unterstützer*innen sind freiwillig.", donateWarning: "⚠️ HINWEIS: Wenn du fortfährst, verlässt du die anonyme App-Umgebung und wirst zu PayPal weitergeleitet.",
        btnPaypal: "Weiter zu PayPal", btnDonateCancel: "Schließen", dateLabel: "DATUM:", langLabel: "Sprache:",
        searchPlace: "Artikel suchen...", bookmarkCat: "Lesezeichen", btnBookmark: "Merken" + rbStar, btnUnbookmark: "Gemerkt" + rbStar,
        themeLabel: "Design:", themeDark: "Dunkel", themeLight: "Hell", clearBtn: "Cache leeren 🗑️",
        catGlobal: "Global", catEurope: "Europa", catAfrica: "Afrika", catNorthAmerica: "Nordam.", catLatinAmerica: "Lateinam.", catAsia: "Asien", catAustralia: "Ozeanien",
        catLabor: "Arbeitskämpfe", catAntifascism: "Antifaschismus", catAntisexism: "Antisexismus", catQueer: "Queer-Feminismus", catAntiracism: "Antirassismus", catNoBorders: "No Borders", catAnticapitalism: "Antikapitalismus", catTheory: "Theorie & Strategie", catAnticolonialism: "Antikolonialismus", catAntiimperialism: "Anti-Imperialismus", catSquatting: "Hausbesetzungen", catDemos: "Demonstrationen", catAntirepression: "Anti-Rep & Knast", catCyber: "Cyber-Aktivismus", catNoWar: "Kriegsdienstverweigerung", catAnimal: "Tierbefreiung", catEco: "Ökologie & Klima", catIndigenous: "Indigene Kämpfe", catHealth: "Radical Health", catLibraries: "Bibliotheken",
        fbBtn: "💬 Kontakt", fbTitle: "Kontakt", fbPlace: "Schreibe hier Ideen, Fehler oder neue Quellen...", fbCaptcha: "Captcha: Was ist", fbCancel: "Abbrechen", fbSend: "Senden (Mail)", fbErrCap: "Captcha ist falsch!", fbErrEmpty: "Bitte schreibe zuerst einen Text.",
        infoBtn: "ℹ️ Info", infoTitle: "App Info & Sicherheit", archiveTitle: "🗄️ Archiv (> 3 Monate)", publisherLabel: "QUELLE:", authorLabel: "AUTOR*IN:", contactLabel: "Kontakt:",
        radarSummary: "Termine", radarCat: "Termine",
        infoBody: `<p><strong>Aus Leidenschaft:</strong> Dieses Projekt ist ein unabhängiges Leidenschaftsprojekt von und für Aktivist*innen. Bitte melde Bugs oder fehlerhafte Quellen über den Kontakt-Bereich.</p><p><strong>Lokale App-Daten:</strong> Die App benötigt keine Benutzer*innenkonten und setzt selbst keine beabsichtigten Werbe- oder Analyse-Cookies. Lesezeichen und Einstellungen werden lokal im Browser gespeichert. Nachrichten, Events und bereits erzeugte Übersetzungen werden für die Offline-Nutzung in IndexedDB gespeichert.</p><p><strong>Externe Verbindungen:</strong> Beim Laden der Nachrichtendaten, externer Artikelbilder, Übersetzungen, Originalartikel oder von PayPal kann dein Browser Verbindungen zu anderen Anbietern herstellen. Diese Anbieter können dabei übliche technische Verbindungsdaten wie eine IP-Adresse erhalten.</p><p><strong>Gemeinsame Podcasts:</strong> Beim Erzeugen eines Podcasts mit natürlicher Stimme werden der übersetzte Titel und Artikeltext über den Cloudflare-Worker an Microsoft Azure Speech gesendet. Die erzeugte Audiodatei und grundlegende Metadaten werden bis zu 30 Tage öffentlich in der App angezeigt. Mit dem Podcast wird kein Benutzer*innenname gespeichert.</p><p><strong>Inhalte und KI-Übersetzungen:</strong> Die App bündelt fremde RSS-Inhalte. KI-generierte Übersetzungen und Zusammenfassungen können Fehler enthalten. Prüfe bei wichtigen Angaben bitte die Originalquelle.</p>`
    },
    es: { btnTranslate: "Traducir", catGlobal: "Global", catEurope: "Europa", catAustralia: "Oceanía", searchRegion: "🌍 Región", searchTopic: "🏷️ Tema", radarSummary: "Eventos", radarCat: "Eventos" },
    fr: { btnTranslate: "Traduire", catGlobal: "Global", catEurope: "Europe", catAustralia: "Océanie", searchRegion: "🌍 Région", searchTopic: "🏷️ Thème", radarSummary: "Événements", radarCat: "Événements" },
    it: { btnTranslate: "Traduci", catGlobal: "Globale", catEurope: "Europa", catAustralia: "Oceania", searchRegion: "🌍 Regione", searchTopic: "🏷️ Tema", radarSummary: "Eventi", radarCat: "Eventi" },
    pt: { btnTranslate: "Traduzir", catGlobal: "Global", catEurope: "Europa", catAustralia: "Oceania", searchRegion: "🌍 Região", searchTopic: "🏷️ Tema", radarSummary: "Eventos", radarCat: "Eventos" },
    ru: { btnTranslate: "Перевести", catGlobal: "Мир", catEurope: "Европа", catAustralia: "Океания", searchRegion: "🌍 Регион", searchTopic: "🏷️ Тема", radarSummary: "События", radarCat: "События" },
    el: { btnTranslate: "Μετάφραση", catGlobal: "Παγκόσμια", catEurope: "Ευρώπη", catAustralia: "Ωκεανία", searchRegion: "🌍 Περιοχή", searchTopic: "🏷️ Θέμα", radarSummary: "Εκδηλώσεις", radarCat: "Εκδηλώσεις" },
    tr: { btnTranslate: "Çevir", catGlobal: "Küresel", catEurope: "Avrupa", catAustralia: "Okyanusya", searchRegion: "🌍 Bölge", searchTopic: "🏷️ Konu", radarSummary: "Etkinlikler", radarCat: "Etkinlikler" }
};

const fallbackLang = uiTexte['en'];
Object.keys(uiTexte).forEach(lang => {
    Object.keys(fallbackLang).forEach(key => {
        if (uiTexte[lang][key] === undefined) { uiTexte[lang][key] = fallbackLang[key]; }
    });
});


const eventUiTexte = {
    en: { eventFilterTitle:"Event filters", eventDate:"Period", eventUpcoming:"Upcoming", eventToday:"Today", eventTomorrow:"Tomorrow", eventWeekend:"This weekend", event7days:"Next 7 days", event14days:"Next 14 days", eventNextMonth:"Next calendar month", event30days:"Next 30 days", eventAllDates:"All dates", eventFrom:"From", eventTo:"To", eventCountry:"Country", eventCity:"City", eventPostal:"Postal code", eventCategory:"Category", eventTag:"Tag", eventGroup:"Group", eventPrice:"Price", eventMode:"Format", eventAll:"All", eventFree:"Free", eventPaid:"Paid", eventUnknown:"Unknown", eventOnline:"Online", eventOffline:"In person", eventReset:"Reset filters", eventStarts:"START:", eventPlace:"PLACE:", eventCategoriesLabel:"CATEGORIES:", eventTagsLabel:"TAGS:", eventGroupsLabel:"GROUPS:", eventPriceLabel:"PRICE:", eventStatusLabel:"STATUS:", eventSortSoon:"Soonest", eventSortLate:"Latest", eventCount:"events" },
    de: { eventFilterTitle:"Event-Filter", eventDate:"Zeitraum", eventUpcoming:"Kommende", eventToday:"Heute", eventTomorrow:"Morgen", eventWeekend:"Dieses Wochenende", event7days:"Nächste 7 Tage", event14days:"Nächste 14 Tage", eventNextMonth:"Nächster Kalendermonat", event30days:"Nächste 30 Tage", eventAllDates:"Alle Termine", eventFrom:"Von", eventTo:"Bis", eventCountry:"Land", eventCity:"Stadt", eventPostal:"Postleitzahl", eventCategory:"Kategorie", eventTag:"Tag", eventGroup:"Gruppe", eventPrice:"Preis", eventMode:"Format", eventAll:"Alle", eventFree:"Kostenlos", eventPaid:"Kostenpflichtig", eventUnknown:"Unbekannt", eventOnline:"Online", eventOffline:"Vor Ort", eventReset:"Filter zurücksetzen", eventStarts:"BEGINN:", eventPlace:"ORT:", eventCategoriesLabel:"KATEGORIEN:", eventTagsLabel:"TAGS:", eventGroupsLabel:"GRUPPEN:", eventPriceLabel:"PREIS:", eventStatusLabel:"STATUS:", eventSortSoon:"Nächste zuerst", eventSortLate:"Spätere zuerst", eventCount:"Events" },
    es: { eventFilterTitle:"Filtros de eventos", eventDate:"Período", eventUpcoming:"Próximos", eventToday:"Hoy", eventTomorrow:"Mañana", eventWeekend:"Este fin de semana", event7days:"Próximos 7 días", event14days:"Próximos 14 días", eventNextMonth:"Próximo mes natural", event30days:"Próximos 30 días", eventAllDates:"Todas las fechas", eventFrom:"Desde", eventTo:"Hasta", eventCountry:"País", eventCity:"Ciudad", eventPostal:"Código postal", eventCategory:"Categoría", eventTag:"Etiqueta", eventGroup:"Grupo", eventPrice:"Precio", eventMode:"Formato", eventAll:"Todos", eventFree:"Gratis", eventPaid:"De pago", eventUnknown:"Desconocido", eventOnline:"En línea", eventOffline:"Presencial", eventReset:"Restablecer filtros", eventStarts:"INICIO:", eventPlace:"LUGAR:", eventCategoriesLabel:"CATEGORÍAS:", eventTagsLabel:"ETIQUETAS:", eventGroupsLabel:"GRUPOS:", eventPriceLabel:"PRECIO:", eventStatusLabel:"ESTADO:", eventSortSoon:"Próximos", eventSortLate:"Más tarde", eventCount:"eventos" },
    fr: { eventFilterTitle:"Filtres d’événements", eventDate:"Période", eventUpcoming:"À venir", eventToday:"Aujourd’hui", eventTomorrow:"Demain", eventWeekend:"Ce week-end", event7days:"7 prochains jours", event14days:"14 prochains jours", eventNextMonth:"Mois civil suivant", event30days:"30 prochains jours", eventAllDates:"Toutes les dates", eventFrom:"Du", eventTo:"Au", eventCountry:"Pays", eventCity:"Ville", eventPostal:"Code postal", eventCategory:"Catégorie", eventTag:"Tag", eventGroup:"Groupe", eventPrice:"Prix", eventMode:"Format", eventAll:"Tous", eventFree:"Gratuit", eventPaid:"Payant", eventUnknown:"Inconnu", eventOnline:"En ligne", eventOffline:"Sur place", eventReset:"Réinitialiser", eventStarts:"DÉBUT :", eventPlace:"LIEU :", eventCategoriesLabel:"CATÉGORIES :", eventTagsLabel:"TAGS :", eventGroupsLabel:"GROUPES :", eventPriceLabel:"PRIX :", eventStatusLabel:"STATUT :", eventSortSoon:"Plus proches", eventSortLate:"Plus tard", eventCount:"événements" },
    it: { eventFilterTitle:"Filtri eventi", eventDate:"Periodo", eventUpcoming:"In arrivo", eventToday:"Oggi", eventTomorrow:"Domani", eventWeekend:"Questo fine settimana", event7days:"Prossimi 7 giorni", event14days:"Prossimi 14 giorni", eventNextMonth:"Prossimo mese di calendario", event30days:"Prossimi 30 giorni", eventAllDates:"Tutte le date", eventFrom:"Da", eventTo:"A", eventCountry:"Paese", eventCity:"Città", eventPostal:"CAP", eventCategory:"Categoria", eventTag:"Tag", eventGroup:"Gruppo", eventPrice:"Prezzo", eventMode:"Formato", eventAll:"Tutti", eventFree:"Gratis", eventPaid:"A pagamento", eventUnknown:"Sconosciuto", eventOnline:"Online", eventOffline:"In presenza", eventReset:"Reimposta filtri", eventStarts:"INIZIO:", eventPlace:"LUOGO:", eventCategoriesLabel:"CATEGORIE:", eventTagsLabel:"TAG:", eventGroupsLabel:"GRUPPI:", eventPriceLabel:"PREZZO:", eventStatusLabel:"STATO:", eventSortSoon:"Più vicini", eventSortLate:"Più tardi", eventCount:"eventi" },
    pt: { eventFilterTitle:"Filtros de eventos", eventDate:"Período", eventUpcoming:"Próximos", eventToday:"Hoje", eventTomorrow:"Amanhã", eventWeekend:"Este fim de semana", event7days:"Próximos 7 dias", event14days:"Próximos 14 dias", eventNextMonth:"Próximo mês civil", event30days:"Próximos 30 dias", eventAllDates:"Todas as datas", eventFrom:"De", eventTo:"Até", eventCountry:"País", eventCity:"Cidade", eventPostal:"Código postal", eventCategory:"Categoria", eventTag:"Tag", eventGroup:"Grupo", eventPrice:"Preço", eventMode:"Formato", eventAll:"Todos", eventFree:"Grátis", eventPaid:"Pago", eventUnknown:"Desconhecido", eventOnline:"Online", eventOffline:"Presencial", eventReset:"Limpar filtros", eventStarts:"INÍCIO:", eventPlace:"LOCAL:", eventCategoriesLabel:"CATEGORIAS:", eventTagsLabel:"TAGS:", eventGroupsLabel:"GRUPOS:", eventPriceLabel:"PREÇO:", eventStatusLabel:"ESTADO:", eventSortSoon:"Mais próximos", eventSortLate:"Mais tarde", eventCount:"eventos" },
    ru: { eventFilterTitle:"Фильтры событий", eventDate:"Период", eventUpcoming:"Предстоящие", eventToday:"Сегодня", eventTomorrow:"Завтра", eventWeekend:"Эти выходные", event7days:"Следующие 7 дней", event14days:"Следующие 14 дней", eventNextMonth:"Следующий календарный месяц", event30days:"Следующие 30 дней", eventAllDates:"Все даты", eventFrom:"С", eventTo:"До", eventCountry:"Страна", eventCity:"Город", eventPostal:"Индекс", eventCategory:"Категория", eventTag:"Тег", eventGroup:"Группа", eventPrice:"Цена", eventMode:"Формат", eventAll:"Все", eventFree:"Бесплатно", eventPaid:"Платно", eventUnknown:"Неизвестно", eventOnline:"Онлайн", eventOffline:"Очно", eventReset:"Сбросить фильтры", eventStarts:"НАЧАЛО:", eventPlace:"МЕСТО:", eventCategoriesLabel:"КАТЕГОРИИ:", eventTagsLabel:"ТЕГИ:", eventGroupsLabel:"ГРУППЫ:", eventPriceLabel:"ЦЕНА:", eventStatusLabel:"СТАТУС:", eventSortSoon:"Ближайшие", eventSortLate:"Поздние", eventCount:"событий" },
    el: { eventFilterTitle:"Φίλτρα εκδηλώσεων", eventDate:"Περίοδος", eventUpcoming:"Επερχόμενα", eventToday:"Σήμερα", eventTomorrow:"Αύριο", eventWeekend:"Αυτό το Σαββατοκύριακο", event7days:"Επόμενες 7 ημέρες", event14days:"Επόμενες 14 ημέρες", eventNextMonth:"Επόμενος ημερολογιακός μήνας", event30days:"Επόμενες 30 ημέρες", eventAllDates:"Όλες οι ημερομηνίες", eventFrom:"Από", eventTo:"Έως", eventCountry:"Χώρα", eventCity:"Πόλη", eventPostal:"Ταχυδρομικός κώδικας", eventCategory:"Κατηγορία", eventTag:"Ετικέτα", eventGroup:"Ομάδα", eventPrice:"Τιμή", eventMode:"Μορφή", eventAll:"Όλα", eventFree:"Δωρεάν", eventPaid:"Με πληρωμή", eventUnknown:"Άγνωστο", eventOnline:"Online", eventOffline:"Με φυσική παρουσία", eventReset:"Επαναφορά φίλτρων", eventStarts:"ΕΝΑΡΞΗ:", eventPlace:"ΤΟΠΟΣ:", eventCategoriesLabel:"ΚΑΤΗΓΟΡΙΕΣ:", eventTagsLabel:"ΕΤΙΚΕΤΕΣ:", eventGroupsLabel:"ΟΜΑΔΕΣ:", eventPriceLabel:"ΤΙΜΗ:", eventStatusLabel:"ΚΑΤΑΣΤΑΣΗ:", eventSortSoon:"Πλησιέστερα", eventSortLate:"Αργότερα", eventCount:"εκδηλώσεις" },
    tr: { eventFilterTitle:"Etkinlik filtreleri", eventDate:"Dönem", eventUpcoming:"Yaklaşan", eventToday:"Bugün", eventTomorrow:"Yarın", eventWeekend:"Bu hafta sonu", event7days:"Sonraki 7 gün", event14days:"Sonraki 14 gün", eventNextMonth:"Sonraki takvim ayı", event30days:"Sonraki 30 gün", eventAllDates:"Tüm tarihler", eventFrom:"Başlangıç", eventTo:"Bitiş", eventCountry:"Ülke", eventCity:"Şehir", eventPostal:"Posta kodu", eventCategory:"Kategori", eventTag:"Etiket", eventGroup:"Grup", eventPrice:"Fiyat", eventMode:"Biçim", eventAll:"Tümü", eventFree:"Ücretsiz", eventPaid:"Ücretli", eventUnknown:"Bilinmiyor", eventOnline:"Çevrimiçi", eventOffline:"Yüz yüze", eventReset:"Filtreleri sıfırla", eventStarts:"BAŞLANGIÇ:", eventPlace:"YER:", eventCategoriesLabel:"KATEGORİLER:", eventTagsLabel:"ETİKETLER:", eventGroupsLabel:"GRUPLAR:", eventPriceLabel:"FİYAT:", eventStatusLabel:"DURUM:", eventSortSoon:"En yakın", eventSortLate:"Daha sonra", eventCount:"etkinlik" }
};

Object.keys(uiTexte).forEach(lang => {
    Object.assign(uiTexte[lang], eventUiTexte[lang] || eventUiTexte.en);
});

const podcastUiTexte = {
    en: { btnPodcast:"Podcast", podcastTitle:"Podcast player", podcastPreparing:"Preparing article…", podcastTranslating:"Translating full article…", podcastSpeaking:"Playing", podcastPaused:"Paused", podcastFinished:"Finished", podcastPlay:"Play", podcastReady:"Ready – press Play", podcastPause:"Pause", podcastResume:"Resume", podcastStop:"Stop", podcastVoice:"Voice", podcastSpeed:"Speed", podcastAutoVoice:"Automatic voice", podcastNoVoice:"No matching voice is installed; the browser default will be used.", podcastUnsupported:"Text-to-speech is not supported by this browser.", podcastTranslationFailed:"The article could not be translated for playback.", podcastLocal:"local", podcastOnline:"online" },
    de: { btnPodcast:"Podcast", podcastTitle:"Podcast-Player", podcastPreparing:"Artikel wird vorbereitet…", podcastTranslating:"Vollständiger Artikel wird übersetzt…", podcastSpeaking:"Wiedergabe läuft", podcastPaused:"Pausiert", podcastFinished:"Beendet", podcastPlay:"Abspielen", podcastReady:"Bereit – bitte auf Abspielen drücken", podcastPause:"Pause", podcastResume:"Weiter", podcastStop:"Stopp", podcastVoice:"Stimme", podcastSpeed:"Tempo", podcastAutoVoice:"Automatische Stimme", podcastNoVoice:"Keine passende Stimme installiert; die Standardstimme des Browsers wird verwendet.", podcastUnsupported:"Dieser Browser unterstützt keine Vorlesefunktion.", podcastTranslationFailed:"Der Artikel konnte für die Wiedergabe nicht übersetzt werden.", podcastLocal:"lokal", podcastOnline:"online" },
    es: { btnPodcast:"Pódcast", podcastTitle:"Reproductor de pódcast", podcastPreparing:"Preparando el artículo…", podcastTranslating:"Traduciendo el artículo completo…", podcastSpeaking:"Reproduciendo", podcastPaused:"En pausa", podcastFinished:"Finalizado", podcastPlay:"Reproducir", podcastReady:"Listo – pulsa Reproducir", podcastPause:"Pausa", podcastResume:"Continuar", podcastStop:"Detener", podcastVoice:"Voz", podcastSpeed:"Velocidad", podcastAutoVoice:"Voz automática", podcastNoVoice:"No hay una voz adecuada instalada; se usará la voz predeterminada del navegador.", podcastUnsupported:"Este navegador no admite la lectura en voz alta.", podcastTranslationFailed:"No se pudo traducir el artículo para la reproducción.", podcastLocal:"local", podcastOnline:"en línea" },
    fr: { btnPodcast:"Podcast", podcastTitle:"Lecteur podcast", podcastPreparing:"Préparation de l’article…", podcastTranslating:"Traduction de l’article complet…", podcastSpeaking:"Lecture en cours", podcastPaused:"En pause", podcastFinished:"Terminé", podcastPlay:"Lire", podcastReady:"Prêt – appuyez sur Lire", podcastPause:"Pause", podcastResume:"Continuer", podcastStop:"Arrêter", podcastVoice:"Voix", podcastSpeed:"Vitesse", podcastAutoVoice:"Voix automatique", podcastNoVoice:"Aucune voix adaptée n’est installée ; la voix par défaut du navigateur sera utilisée.", podcastUnsupported:"Ce navigateur ne prend pas en charge la lecture vocale.", podcastTranslationFailed:"L’article n’a pas pu être traduit pour la lecture.", podcastLocal:"locale", podcastOnline:"en ligne" },
    it: { btnPodcast:"Podcast", podcastTitle:"Lettore podcast", podcastPreparing:"Preparazione dell’articolo…", podcastTranslating:"Traduzione dell’articolo completo…", podcastSpeaking:"Riproduzione in corso", podcastPaused:"In pausa", podcastFinished:"Terminato", podcastPlay:"Riproduci", podcastReady:"Pronto – premi Riproduci", podcastPause:"Pausa", podcastResume:"Continua", podcastStop:"Stop", podcastVoice:"Voce", podcastSpeed:"Velocità", podcastAutoVoice:"Voce automatica", podcastNoVoice:"Non è installata una voce adatta; verrà usata la voce predefinita del browser.", podcastUnsupported:"Questo browser non supporta la lettura vocale.", podcastTranslationFailed:"Non è stato possibile tradurre l’articolo per la riproduzione.", podcastLocal:"locale", podcastOnline:"online" },
    pt: { btnPodcast:"Podcast", podcastTitle:"Leitor de podcast", podcastPreparing:"A preparar o artigo…", podcastTranslating:"A traduzir o artigo completo…", podcastSpeaking:"A reproduzir", podcastPaused:"Em pausa", podcastFinished:"Terminado", podcastPlay:"Reproduzir", podcastReady:"Pronto – prima Reproduzir", podcastPause:"Pausa", podcastResume:"Continuar", podcastStop:"Parar", podcastVoice:"Voz", podcastSpeed:"Velocidade", podcastAutoVoice:"Voz automática", podcastNoVoice:"Não está instalada uma voz adequada; será usada a voz predefinida do navegador.", podcastUnsupported:"Este navegador não suporta leitura em voz alta.", podcastTranslationFailed:"Não foi possível traduzir o artigo para reprodução.", podcastLocal:"local", podcastOnline:"online" },
    ru: { btnPodcast:"Подкаст", podcastTitle:"Проигрыватель подкаста", podcastPreparing:"Подготовка статьи…", podcastTranslating:"Перевод полной статьи…", podcastSpeaking:"Воспроизведение", podcastPaused:"Пауза", podcastFinished:"Завершено", podcastPlay:"Воспроизвести", podcastReady:"Готово — нажмите «Воспроизвести»", podcastPause:"Пауза", podcastResume:"Продолжить", podcastStop:"Стоп", podcastVoice:"Голос", podcastSpeed:"Скорость", podcastAutoVoice:"Автоматический голос", podcastNoVoice:"Подходящий голос не установлен; будет использован голос браузера по умолчанию.", podcastUnsupported:"Этот браузер не поддерживает озвучивание текста.", podcastTranslationFailed:"Не удалось перевести статью для воспроизведения.", podcastLocal:"локальный", podcastOnline:"онлайн" },
    el: { btnPodcast:"Podcast", podcastTitle:"Αναπαραγωγή podcast", podcastPreparing:"Προετοιμασία άρθρου…", podcastTranslating:"Μετάφραση ολόκληρου του άρθρου…", podcastSpeaking:"Αναπαραγωγή", podcastPaused:"Παύση", podcastFinished:"Ολοκληρώθηκε", podcastPlay:"Αναπαραγωγή", podcastReady:"Έτοιμο – πατήστε Αναπαραγωγή", podcastPause:"Παύση", podcastResume:"Συνέχεια", podcastStop:"Διακοπή", podcastVoice:"Φωνή", podcastSpeed:"Ταχύτητα", podcastAutoVoice:"Αυτόματη φωνή", podcastNoVoice:"Δεν υπάρχει εγκατεστημένη κατάλληλη φωνή· θα χρησιμοποιηθεί η προεπιλεγμένη φωνή του προγράμματος περιήγησης.", podcastUnsupported:"Αυτό το πρόγραμμα περιήγησης δεν υποστηρίζει εκφώνηση κειμένου.", podcastTranslationFailed:"Το άρθρο δεν μπόρεσε να μεταφραστεί για αναπαραγωγή.", podcastLocal:"τοπική", podcastOnline:"online" },
    tr: { btnPodcast:"Podcast", podcastTitle:"Podcast oynatıcı", podcastPreparing:"Makale hazırlanıyor…", podcastTranslating:"Makalenin tamamı çevriliyor…", podcastSpeaking:"Oynatılıyor", podcastPaused:"Duraklatıldı", podcastFinished:"Bitti", podcastPlay:"Oynat", podcastReady:"Hazır – Oynat düğmesine basın", podcastPause:"Duraklat", podcastResume:"Devam", podcastStop:"Durdur", podcastVoice:"Ses", podcastSpeed:"Hız", podcastAutoVoice:"Otomatik ses", podcastNoVoice:"Uygun bir ses yüklü değil; tarayıcının varsayılan sesi kullanılacak.", podcastUnsupported:"Bu tarayıcı sesli okumayı desteklemiyor.", podcastTranslationFailed:"Makale oynatma için çevrilemedi.", podcastLocal:"yerel", podcastOnline:"çevrimiçi" }
};

Object.keys(uiTexte).forEach(lang => {
    Object.assign(uiTexte[lang], podcastUiTexte[lang] || podcastUiTexte.en);
});

const sharedPodcastUiTexte = {
    en: { podcastLibrary:"Podcasts", podcastLibraryTitle:"Shared podcasts – last 30 days", podcastLibraryLoading:"Loading podcasts…", podcastLibraryEmpty:"No podcast has been generated yet.", podcastLibraryRefresh:"Refresh", podcastOptionsTitle:"Create podcast", podcastShort:"Short podcast", podcastShortHelp:"A concise 3–5 minute summary.", podcastFull:"Full article", podcastFullHelp:"The translated article, up to about 10 minutes.", podcastDevice:"Device voice", podcastDeviceHelp:"Free local browser voice; not added to the shared library.", podcastAzureVoice:"Azure voice", podcastGenerate:"Generate", podcastGenerating:"Translating and generating audio…", podcastGenerated:"Podcast created. Press Play when you are ready.", podcastGenerationFailed:"Podcast generation failed.", podcastModeShort:"Short", podcastModeFull:"Full article", podcastCreated:"Created", podcastLanguage:"Language", podcastSource:"Source", podcastOriginal:"Original article", podcastVoiceFixed:"The voice is stored in the audio. Choose another voice to generate a new version.", podcastClose:"Close" },
    de: { podcastLibrary:"Podcasts", podcastLibraryTitle:"Gemeinsame Podcasts – letzte 30 Tage", podcastLibraryLoading:"Podcasts werden geladen…", podcastLibraryEmpty:"Noch wurde kein Podcast erzeugt.", podcastLibraryRefresh:"Aktualisieren", podcastOptionsTitle:"Podcast erzeugen", podcastShort:"Kurz-Podcast", podcastShortHelp:"Eine kompakte Zusammenfassung von etwa 3–5 Minuten.", podcastFull:"Ganzer Artikel", podcastFullHelp:"Der übersetzte Artikel, begrenzt auf ungefähr 10 Minuten.", podcastDevice:"Gerätestimme", podcastDeviceHelp:"Kostenlose lokale Browserstimme; wird nicht in der gemeinsamen Bibliothek gespeichert.", podcastAzureVoice:"Azure-Stimme", podcastGenerate:"Erzeugen", podcastGenerating:"Artikel wird übersetzt und Audio erzeugt…", podcastGenerated:"Podcast wurde erzeugt. Starte ihn selbst mit Play.", podcastGenerationFailed:"Podcast konnte nicht erzeugt werden.", podcastModeShort:"Kurz", podcastModeFull:"Ganzer Artikel", podcastCreated:"Erstellt", podcastLanguage:"Sprache", podcastSource:"Quelle", podcastOriginal:"Originalartikel", podcastVoiceFixed:"Die Stimme ist fest in der Audiodatei gespeichert. Für eine andere Stimme bitte eine neue Version erzeugen.", podcastClose:"Schließen" },
    es: { podcastLibrary:"Pódcasts", podcastLibraryTitle:"Pódcasts compartidos – últimos 30 días", podcastLibraryLoading:"Cargando pódcasts…", podcastLibraryEmpty:"Todavía no se ha generado ningún pódcast.", podcastLibraryRefresh:"Actualizar", podcastOptionsTitle:"Crear pódcast", podcastShort:"Pódcast breve", podcastShortHelp:"Resumen de unos 3–5 minutos.", podcastFull:"Artículo completo", podcastFullHelp:"Artículo traducido, hasta unos 10 minutos.", podcastDevice:"Voz del dispositivo", podcastDeviceHelp:"Voz local gratuita; no se guarda en la biblioteca.", podcastAzureVoice:"Voz de Azure", podcastGenerate:"Generar", podcastGenerating:"Traduciendo y generando audio…", podcastGenerated:"Pódcast creado. Pulsa reproducir cuando quieras.", podcastGenerationFailed:"No se pudo crear el pódcast.", podcastModeShort:"Breve", podcastModeFull:"Artículo completo", podcastCreated:"Creado", podcastLanguage:"Idioma", podcastSource:"Fuente", podcastOriginal:"Artículo original", podcastVoiceFixed:"La voz queda fijada en el audio. Genera otra versión para cambiarla.", podcastClose:"Cerrar" },
    fr: { podcastLibrary:"Podcasts", podcastLibraryTitle:"Podcasts partagés – 30 derniers jours", podcastLibraryLoading:"Chargement des podcasts…", podcastLibraryEmpty:"Aucun podcast n’a encore été généré.", podcastLibraryRefresh:"Actualiser", podcastOptionsTitle:"Créer un podcast", podcastShort:"Podcast court", podcastShortHelp:"Un résumé d’environ 3 à 5 minutes.", podcastFull:"Article complet", podcastFullHelp:"L’article traduit, jusqu’à environ 10 minutes.", podcastDevice:"Voix de l’appareil", podcastDeviceHelp:"Voix locale gratuite, non ajoutée à la bibliothèque.", podcastAzureVoice:"Voix Azure", podcastGenerate:"Générer", podcastGenerating:"Traduction et création de l’audio…", podcastGenerated:"Podcast créé. Lancez vous-même la lecture.", podcastGenerationFailed:"La création du podcast a échoué.", podcastModeShort:"Court", podcastModeFull:"Article complet", podcastCreated:"Créé", podcastLanguage:"Langue", podcastSource:"Source", podcastOriginal:"Article original", podcastVoiceFixed:"La voix est intégrée au fichier audio. Générez une autre version pour la changer.", podcastClose:"Fermer" },
    it: { podcastLibrary:"Podcast", podcastLibraryTitle:"Podcast condivisi – ultimi 30 giorni", podcastLibraryLoading:"Caricamento podcast…", podcastLibraryEmpty:"Non è ancora stato generato alcun podcast.", podcastLibraryRefresh:"Aggiorna", podcastOptionsTitle:"Crea podcast", podcastShort:"Podcast breve", podcastShortHelp:"Un riassunto di circa 3–5 minuti.", podcastFull:"Articolo completo", podcastFullHelp:"L’articolo tradotto, fino a circa 10 minuti.", podcastDevice:"Voce del dispositivo", podcastDeviceHelp:"Voce locale gratuita; non viene salvata nella libreria.", podcastAzureVoice:"Voce Azure", podcastGenerate:"Genera", podcastGenerating:"Traduzione e generazione audio…", podcastGenerated:"Podcast creato. Premi Play quando vuoi.", podcastGenerationFailed:"Impossibile creare il podcast.", podcastModeShort:"Breve", podcastModeFull:"Articolo completo", podcastCreated:"Creato", podcastLanguage:"Lingua", podcastSource:"Fonte", podcastOriginal:"Articolo originale", podcastVoiceFixed:"La voce è incorporata nell’audio. Genera una nuova versione per cambiarla.", podcastClose:"Chiudi" },
    pt: { podcastLibrary:"Podcasts", podcastLibraryTitle:"Podcasts partilhados – últimos 30 dias", podcastLibraryLoading:"A carregar podcasts…", podcastLibraryEmpty:"Ainda não foi gerado nenhum podcast.", podcastLibraryRefresh:"Atualizar", podcastOptionsTitle:"Criar podcast", podcastShort:"Podcast curto", podcastShortHelp:"Um resumo de cerca de 3–5 minutos.", podcastFull:"Artigo completo", podcastFullHelp:"O artigo traduzido, até cerca de 10 minutos.", podcastDevice:"Voz do dispositivo", podcastDeviceHelp:"Voz local gratuita; não é guardada na biblioteca.", podcastAzureVoice:"Voz Azure", podcastGenerate:"Gerar", podcastGenerating:"A traduzir e gerar áudio…", podcastGenerated:"Podcast criado. Prima Play quando quiser.", podcastGenerationFailed:"Não foi possível criar o podcast.", podcastModeShort:"Curto", podcastModeFull:"Artigo completo", podcastCreated:"Criado", podcastLanguage:"Idioma", podcastSource:"Fonte", podcastOriginal:"Artigo original", podcastVoiceFixed:"A voz fica incorporada no áudio. Gere outra versão para a alterar.", podcastClose:"Fechar" },
    ru: { podcastLibrary:"Подкасты", podcastLibraryTitle:"Общие подкасты — последние 30 дней", podcastLibraryLoading:"Загрузка подкастов…", podcastLibraryEmpty:"Подкасты ещё не создавались.", podcastLibraryRefresh:"Обновить", podcastOptionsTitle:"Создать подкаст", podcastShort:"Короткий подкаст", podcastShortHelp:"Краткое изложение на 3–5 минут.", podcastFull:"Полная статья", podcastFullHelp:"Переведённая статья, примерно до 10 минут.", podcastDevice:"Голос устройства", podcastDeviceHelp:"Бесплатный локальный голос; не сохраняется в библиотеке.", podcastAzureVoice:"Голос Azure", podcastGenerate:"Создать", podcastGenerating:"Перевод и создание аудио…", podcastGenerated:"Подкаст создан. Нажмите Play, когда будете готовы.", podcastGenerationFailed:"Не удалось создать подкаст.", podcastModeShort:"Короткий", podcastModeFull:"Полная статья", podcastCreated:"Создан", podcastLanguage:"Язык", podcastSource:"Источник", podcastOriginal:"Оригинал", podcastVoiceFixed:"Голос встроен в аудиофайл. Для другого голоса создайте новую версию.", podcastClose:"Закрыть" },
    el: { podcastLibrary:"Podcast", podcastLibraryTitle:"Κοινά podcast – τελευταίες 30 ημέρες", podcastLibraryLoading:"Φόρτωση podcast…", podcastLibraryEmpty:"Δεν έχει δημιουργηθεί ακόμη podcast.", podcastLibraryRefresh:"Ανανέωση", podcastOptionsTitle:"Δημιουργία podcast", podcastShort:"Σύντομο podcast", podcastShortHelp:"Περίληψη περίπου 3–5 λεπτών.", podcastFull:"Ολόκληρο άρθρο", podcastFullHelp:"Το μεταφρασμένο άρθρο, έως περίπου 10 λεπτά.", podcastDevice:"Φωνή συσκευής", podcastDeviceHelp:"Δωρεάν τοπική φωνή· δεν αποθηκεύεται στη βιβλιοθήκη.", podcastAzureVoice:"Φωνή Azure", podcastGenerate:"Δημιουργία", podcastGenerating:"Μετάφραση και δημιουργία ήχου…", podcastGenerated:"Το podcast δημιουργήθηκε. Πατήστε Play όταν είστε έτοιμοι.", podcastGenerationFailed:"Η δημιουργία του podcast απέτυχε.", podcastModeShort:"Σύντομο", podcastModeFull:"Ολόκληρο άρθρο", podcastCreated:"Δημιουργήθηκε", podcastLanguage:"Γλώσσα", podcastSource:"Πηγή", podcastOriginal:"Πρωτότυπο άρθρο", podcastVoiceFixed:"Η φωνή είναι ενσωματωμένη στο αρχείο. Δημιουργήστε νέα έκδοση για άλλη φωνή.", podcastClose:"Κλείσιμο" },
    tr: { podcastLibrary:"Podcastler", podcastLibraryTitle:"Ortak podcastler – son 30 gün", podcastLibraryLoading:"Podcastler yükleniyor…", podcastLibraryEmpty:"Henüz podcast oluşturulmadı.", podcastLibraryRefresh:"Yenile", podcastOptionsTitle:"Podcast oluştur", podcastShort:"Kısa podcast", podcastShortHelp:"Yaklaşık 3–5 dakikalık özet.", podcastFull:"Tam makale", podcastFullHelp:"Çevrilmiş makale, yaklaşık 10 dakikaya kadar.", podcastDevice:"Cihaz sesi", podcastDeviceHelp:"Ücretsiz yerel ses; ortak kitaplığa kaydedilmez.", podcastAzureVoice:"Azure sesi", podcastGenerate:"Oluştur", podcastGenerating:"Çeviri ve ses oluşturma…", podcastGenerated:"Podcast oluşturuldu. Hazır olduğunuzda Play’e basın.", podcastGenerationFailed:"Podcast oluşturulamadı.", podcastModeShort:"Kısa", podcastModeFull:"Tam makale", podcastCreated:"Oluşturuldu", podcastLanguage:"Dil", podcastSource:"Kaynak", podcastOriginal:"Orijinal makale", podcastVoiceFixed:"Ses, ses dosyasına sabitlenir. Başka bir ses için yeni sürüm oluşturun.", podcastClose:"Kapat" }
};

Object.keys(uiTexte).forEach(lang => {
    Object.assign(uiTexte[lang], sharedPodcastUiTexte[lang] || sharedPodcastUiTexte.en);
});

const podcastQuotaUiTexte = {
    en: { podcastQuotaTitle:"Monthly voice quota", podcastQuotaInfo:"Natural Azure voices and shared MP3 podcasts use a limited monthly app quota. When it is exhausted, only the free device or smartphone voices are available until the next month.", podcastQuotaChecking:"Checking the monthly quota…", podcastQuotaAvailable:"Natural voices are currently available.", podcastQuotaUnavailable:"The monthly quota is exhausted. Only the free device voice is currently available.", podcastQuotaReset:"Natural voices are expected to return on", podcastQuotaDevice:"The device voice remains free and does not use the shared quota." },
    de: { podcastQuotaTitle:"Monatliches Stimmen-Kontingent", podcastQuotaInfo:"Natürliche Azure-Stimmen und gemeinsam gespeicherte MP3-Podcasts verwenden ein begrenztes monatliches App-Kontingent. Ist es aufgebraucht, stehen bis zum nächsten Monat nur noch die kostenlosen Geräte- oder Smartphone-Stimmen zur Verfügung.", podcastQuotaChecking:"Monatliches Kontingent wird geprüft…", podcastQuotaAvailable:"Natürliche Stimmen sind derzeit verfügbar.", podcastQuotaUnavailable:"Das monatliche Kontingent ist aufgebraucht. Derzeit steht nur die kostenlose Gerätestimme zur Verfügung.", podcastQuotaReset:"Natürliche Stimmen werden voraussichtlich wieder verfügbar am", podcastQuotaDevice:"Die Gerätestimme bleibt kostenlos und verbraucht kein gemeinsames Kontingent." },
    es: { podcastQuotaTitle:"Cuota mensual de voces", podcastQuotaInfo:"Las voces naturales de Azure y los pódcasts MP3 compartidos usan una cuota mensual limitada de la aplicación. Cuando se agota, hasta el mes siguiente solo están disponibles las voces gratuitas del dispositivo o teléfono.", podcastQuotaChecking:"Comprobando la cuota mensual…", podcastQuotaAvailable:"Las voces naturales están disponibles actualmente.", podcastQuotaUnavailable:"La cuota mensual está agotada. Actualmente solo está disponible la voz gratuita del dispositivo.", podcastQuotaReset:"Se espera que las voces naturales vuelvan el", podcastQuotaDevice:"La voz del dispositivo sigue siendo gratuita y no consume la cuota compartida." },
    fr: { podcastQuotaTitle:"Quota mensuel de voix", podcastQuotaInfo:"Les voix naturelles Azure et les podcasts MP3 partagés utilisent un quota mensuel limité de l’application. Lorsqu’il est épuisé, seules les voix gratuites de l’appareil ou du smartphone restent disponibles jusqu’au mois suivant.", podcastQuotaChecking:"Vérification du quota mensuel…", podcastQuotaAvailable:"Les voix naturelles sont actuellement disponibles.", podcastQuotaUnavailable:"Le quota mensuel est épuisé. Seule la voix gratuite de l’appareil est disponible pour le moment.", podcastQuotaReset:"Les voix naturelles devraient revenir le", podcastQuotaDevice:"La voix de l’appareil reste gratuite et n’utilise pas le quota partagé." },
    it: { podcastQuotaTitle:"Quota mensile delle voci", podcastQuotaInfo:"Le voci naturali di Azure e i podcast MP3 condivisi usano una quota mensile limitata dell’app. Quando è esaurita, fino al mese successivo restano disponibili solo le voci gratuite del dispositivo o smartphone.", podcastQuotaChecking:"Controllo della quota mensile…", podcastQuotaAvailable:"Le voci naturali sono attualmente disponibili.", podcastQuotaUnavailable:"La quota mensile è esaurita. Al momento è disponibile solo la voce gratuita del dispositivo.", podcastQuotaReset:"Le voci naturali dovrebbero tornare il", podcastQuotaDevice:"La voce del dispositivo resta gratuita e non usa la quota condivisa." },
    pt: { podcastQuotaTitle:"Quota mensal de vozes", podcastQuotaInfo:"As vozes naturais do Azure e os podcasts MP3 partilhados usam uma quota mensal limitada da aplicação. Quando se esgota, até ao mês seguinte ficam disponíveis apenas as vozes gratuitas do dispositivo ou smartphone.", podcastQuotaChecking:"A verificar a quota mensal…", podcastQuotaAvailable:"As vozes naturais estão atualmente disponíveis.", podcastQuotaUnavailable:"A quota mensal esgotou-se. Neste momento só está disponível a voz gratuita do dispositivo.", podcastQuotaReset:"Prevê-se que as vozes naturais regressem em", podcastQuotaDevice:"A voz do dispositivo continua gratuita e não usa a quota partilhada." },
    ru: { podcastQuotaTitle:"Месячный лимит голосов", podcastQuotaInfo:"Естественные голоса Azure и общие MP3-подкасты используют ограниченный месячный лимит приложения. После его исчерпания до следующего месяца доступны только бесплатные голоса устройства или смартфона.", podcastQuotaChecking:"Проверка месячного лимита…", podcastQuotaAvailable:"Естественные голоса сейчас доступны.", podcastQuotaUnavailable:"Месячный лимит исчерпан. Сейчас доступен только бесплатный голос устройства.", podcastQuotaReset:"Ожидается, что естественные голоса снова станут доступны", podcastQuotaDevice:"Голос устройства остаётся бесплатным и не расходует общий лимит." },
    el: { podcastQuotaTitle:"Μηνιαίο όριο φωνών", podcastQuotaInfo:"Οι φυσικές φωνές Azure και τα κοινόχρηστα podcast MP3 χρησιμοποιούν περιορισμένο μηνιαίο όριο της εφαρμογής. Όταν εξαντληθεί, μέχρι τον επόμενο μήνα είναι διαθέσιμες μόνο οι δωρεάν φωνές της συσκευής ή του smartphone.", podcastQuotaChecking:"Έλεγχος μηνιαίου ορίου…", podcastQuotaAvailable:"Οι φυσικές φωνές είναι διαθέσιμες αυτή τη στιγμή.", podcastQuotaUnavailable:"Το μηνιαίο όριο εξαντλήθηκε. Προς το παρόν είναι διαθέσιμη μόνο η δωρεάν φωνή της συσκευής.", podcastQuotaReset:"Οι φυσικές φωνές αναμένεται να επιστρέψουν στις", podcastQuotaDevice:"Η φωνή της συσκευής παραμένει δωρεάν και δεν χρησιμοποιεί το κοινό όριο." },
    tr: { podcastQuotaTitle:"Aylık ses kotası", podcastQuotaInfo:"Doğal Azure sesleri ve paylaşılan MP3 podcastler uygulamanın sınırlı aylık kotasını kullanır. Kota bittiğinde bir sonraki aya kadar yalnızca ücretsiz cihaz veya telefon sesleri kullanılabilir.", podcastQuotaChecking:"Aylık kota kontrol ediliyor…", podcastQuotaAvailable:"Doğal sesler şu anda kullanılabilir.", podcastQuotaUnavailable:"Aylık kota tükendi. Şu anda yalnızca ücretsiz cihaz sesi kullanılabilir.", podcastQuotaReset:"Doğal seslerin yeniden kullanılabilir olacağı tahmini tarih", podcastQuotaDevice:"Cihaz sesi ücretsiz kalır ve ortak kotayı kullanmaz." }
};

Object.keys(uiTexte).forEach(lang => {
    Object.assign(uiTexte[lang], podcastQuotaUiTexte[lang] || podcastQuotaUiTexte.en);
});


const audioHubUiTexte = {
    en: { audioHub:"Podcasts & Radio", audioHubTitle:"Podcasts & Live Radio", tabOriginal:"Original podcasts", tabGenerated:"Generated podcasts", tabRadio:"Live radio", allSources:"All sources", allLanguages:"All languages", searchPodcasts:"Search podcasts…", originalLoading:"Loading original podcasts…", originalEmpty:"No original podcast episodes were found.", originalSource:"Source", originalPublished:"Published", originalDuration:"Duration", listenOriginal:"Open original", feedLink:"Podcast feed", liveRadioNote:"Live stations never start automatically. If a stream is blocked, open the station website.", radioOpen:"Open station", radioStreamError:"The stream could not be played in this browser. Try the station website." },
    de: { audioHub:"Podcasts & Radio", audioHubTitle:"Podcasts & Live-Radio", tabOriginal:"Original-Podcasts", tabGenerated:"Erzeugte Podcasts", tabRadio:"Live-Radio", allSources:"Alle Quellen", allLanguages:"Alle Sprachen", searchPodcasts:"Podcasts durchsuchen…", originalLoading:"Original-Podcasts werden geladen…", originalEmpty:"Keine Original-Podcastfolgen gefunden.", originalSource:"Quelle", originalPublished:"Veröffentlicht", originalDuration:"Laufzeit", listenOriginal:"Beim Original öffnen", feedLink:"Podcast-Feed", liveRadioNote:"Live-Sender starten niemals automatisch. Falls ein Stream blockiert ist, öffne die Senderseite.", radioOpen:"Senderseite öffnen", radioStreamError:"Der Stream konnte in diesem Browser nicht abgespielt werden. Versuche die Senderseite." },
    es: { audioHub:"Pódcasts y radio", audioHubTitle:"Pódcasts y radio en directo", tabOriginal:"Pódcasts originales", tabGenerated:"Pódcasts generados", tabRadio:"Radio en directo", allSources:"Todas las fuentes", allLanguages:"Todos los idiomas", searchPodcasts:"Buscar pódcasts…", originalLoading:"Cargando pódcasts originales…", originalEmpty:"No se encontraron episodios.", originalSource:"Fuente", originalPublished:"Publicado", originalDuration:"Duración", listenOriginal:"Abrir original", feedLink:"Feed", liveRadioNote:"Las radios nunca se inician automáticamente. Si un stream falla, abre la web de la emisora.", radioOpen:"Abrir emisora", radioStreamError:"El stream no pudo reproducirse en este navegador." },
    fr: { audioHub:"Podcasts et radio", audioHubTitle:"Podcasts et radio en direct", tabOriginal:"Podcasts originaux", tabGenerated:"Podcasts générés", tabRadio:"Radio en direct", allSources:"Toutes les sources", allLanguages:"Toutes les langues", searchPodcasts:"Rechercher…", originalLoading:"Chargement des podcasts originaux…", originalEmpty:"Aucun épisode trouvé.", originalSource:"Source", originalPublished:"Publié", originalDuration:"Durée", listenOriginal:"Ouvrir l’original", feedLink:"Flux", liveRadioNote:"Les radios ne démarrent jamais automatiquement. Si un flux échoue, ouvrez le site de la station.", radioOpen:"Ouvrir la station", radioStreamError:"Le flux ne peut pas être lu dans ce navigateur." },
    it: { audioHub:"Podcast e radio", audioHubTitle:"Podcast e radio dal vivo", tabOriginal:"Podcast originali", tabGenerated:"Podcast generati", tabRadio:"Radio dal vivo", allSources:"Tutte le fonti", allLanguages:"Tutte le lingue", searchPodcasts:"Cerca podcast…", originalLoading:"Caricamento podcast originali…", originalEmpty:"Nessun episodio trovato.", originalSource:"Fonte", originalPublished:"Pubblicato", originalDuration:"Durata", listenOriginal:"Apri originale", feedLink:"Feed", liveRadioNote:"Le radio non partono mai automaticamente. Se lo stream non funziona, apri il sito della stazione.", radioOpen:"Apri stazione", radioStreamError:"Impossibile riprodurre lo stream in questo browser." },
    pt: { audioHub:"Podcasts e rádio", audioHubTitle:"Podcasts e rádio ao vivo", tabOriginal:"Podcasts originais", tabGenerated:"Podcasts gerados", tabRadio:"Rádio ao vivo", allSources:"Todas as fontes", allLanguages:"Todos os idiomas", searchPodcasts:"Pesquisar podcasts…", originalLoading:"A carregar podcasts originais…", originalEmpty:"Nenhum episódio encontrado.", originalSource:"Fonte", originalPublished:"Publicado", originalDuration:"Duração", listenOriginal:"Abrir original", feedLink:"Feed", liveRadioNote:"As rádios nunca iniciam automaticamente. Se um stream falhar, abra o site da estação.", radioOpen:"Abrir estação", radioStreamError:"O stream não pôde ser reproduzido neste navegador." },
    ru: { audioHub:"Подкасты и радио", audioHubTitle:"Подкасты и прямой эфир", tabOriginal:"Оригинальные подкасты", tabGenerated:"Созданные подкасты", tabRadio:"Радио", allSources:"Все источники", allLanguages:"Все языки", searchPodcasts:"Поиск подкастов…", originalLoading:"Загрузка оригинальных подкастов…", originalEmpty:"Эпизоды не найдены.", originalSource:"Источник", originalPublished:"Опубликовано", originalDuration:"Длительность", listenOriginal:"Открыть оригинал", feedLink:"Лента", liveRadioNote:"Радио никогда не запускается автоматически. Если поток не работает, откройте сайт станции.", radioOpen:"Открыть станцию", radioStreamError:"Поток не воспроизводится в этом браузере." },
    el: { audioHub:"Podcast και ραδιόφωνο", audioHubTitle:"Podcast και ζωντανό ραδιόφωνο", tabOriginal:"Πρωτότυπα podcast", tabGenerated:"Δημιουργημένα podcast", tabRadio:"Ζωντανό ραδιόφωνο", allSources:"Όλες οι πηγές", allLanguages:"Όλες οι γλώσσες", searchPodcasts:"Αναζήτηση podcast…", originalLoading:"Φόρτωση πρωτότυπων podcast…", originalEmpty:"Δεν βρέθηκαν επεισόδια.", originalSource:"Πηγή", originalPublished:"Δημοσιεύτηκε", originalDuration:"Διάρκεια", listenOriginal:"Άνοιγμα πρωτοτύπου", feedLink:"Ροή", liveRadioNote:"Οι σταθμοί δεν ξεκινούν ποτέ αυτόματα. Αν η ροή αποτύχει, ανοίξτε τον ιστότοπο του σταθμού.", radioOpen:"Άνοιγμα σταθμού", radioStreamError:"Η ροή δεν αναπαράγεται σε αυτό το πρόγραμμα περιήγησης." },
    tr: { audioHub:"Podcast ve radyo", audioHubTitle:"Podcast ve canlı radyo", tabOriginal:"Orijinal podcastler", tabGenerated:"Oluşturulan podcastler", tabRadio:"Canlı radyo", allSources:"Tüm kaynaklar", allLanguages:"Tüm diller", searchPodcasts:"Podcast ara…", originalLoading:"Orijinal podcastler yükleniyor…", originalEmpty:"Bölüm bulunamadı.", originalSource:"Kaynak", originalPublished:"Yayınlandı", originalDuration:"Süre", listenOriginal:"Orijinali aç", feedLink:"Besleme", liveRadioNote:"Canlı istasyonlar otomatik başlamaz. Akış çalışmazsa istasyon sitesini açın.", radioOpen:"İstasyonu aç", radioStreamError:"Akış bu tarayıcıda oynatılamadı." }
};
Object.keys(uiTexte).forEach(lang => Object.assign(uiTexte[lang], audioHubUiTexte[lang] || audioHubUiTexte.en));

// Podcast- und Radio-Bibliothek: siehe audio-hub.js.

// Der gemeinsame Audio-Player liegt in media-player.js.
let currentLang = "en";
let activeKontinent = "Global"; 
let allNewsData = []; 
const articleDetailPayloadCache = new Map();

function articleDetailUrl(article) {
    const path = String(article?.detailPath || '').trim();
    if (!path) return '';
    try {
        return new URL(path, new URL(GITHUB_NEWS_URL, window.location.href)).href;
    } catch {
        return '';
    }
}

async function hydrateArticleContent(article) {
    if (!article || article.detailHydrated === true) return article;
    const url = articleDetailUrl(article);
    if (!url) return article;

    try {
        let request = articleDetailPayloadCache.get(url);
        if (!request) {
            request = fetchJsonFile(url).then(result => result.data);
            articleDetailPayloadCache.set(url, request);
        }
        const rows = await request;
        const detail = rows.find(candidate => (
            String(candidate?.link || '') === String(article.link || '')
            || (
                candidate?.title === article.title
                && candidate?.quelleName === article.quelleName
            )
        ));
        if (!detail) return article;

        const quickContent = String(article.content || '');
        const fullContent = String(detail.content || '');
        const detailPath = article.detailPath;
        Object.assign(article, detail, {
            detailPath,
            detailHydrated: true,
            webFeedTruncated: false,
            content: fullContent.length >= quickContent.length
                ? fullContent
                : quickContent
        });
        return article;
    } catch (error) {
        articleDetailPayloadCache.delete(url);
        console.warn('Volltextpaket konnte nicht geladen werden:', error);
        return article;
    }
}

let currentFilteredItems = []; 
let currentlyDisplayedCount = 0;
const ITEMS_PER_PAGE = 10;
let isRendering = false;

let currentSourceFilter = "ALL"; 
const ZINE_KEY = 'wrn_zine_articles';
let zineArticles = loadZineArticles();

const translationCache = new Map();
const speechLanguageTags = {
    en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT',
    pt: 'pt-PT', ru: 'ru-RU', el: 'el-GR', tr: 'tr-TR'
};
let podcastVoices = [];
let podcastState = {
    articleId: null,
    chunks: [],
    index: 0,
    paused: false,
    loading: false,
    stopped: true,
    started: false,
    utterance: null
};

// Azure-Podcast-Konfiguration und Bibliotheksstatus: siehe audio-hub.js.



// DOM-Kurzfunktionen liegen in utils.js.

function getTargetLanguageName() {
    const languageSelect = document.getElementById('ui-language');
    return languageSelect?.options?.[languageSelect.selectedIndex]?.text || 'English';
}

function getGenderInstruction() {
    return currentLang === 'de'
        ? ' Verwende konsequent geschlechtergerechte deutsche Sprache mit Gendersternchen, zum Beispiel Aktivist*innen, Arbeiter*innen und Autor*innen. Vermeide das generische Maskulinum. Verändere Eigennamen, Organisationsnamen und direkte Zitate nicht.'
        : '';
}

function createArticleChunks(rawText, maxLength = 1800) {
    const paragraphs = String(rawText || '').split(/\n\n+/).map(value => value.trim()).filter(Boolean);
    const chunks = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        if (paragraph.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            for (let start = 0; start < paragraph.length; start += maxLength) {
                chunks.push(paragraph.slice(start, start + maxLength));
            }
            continue;
        }

        if (currentChunk && currentChunk.length + paragraph.length + 2 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
    }

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}

function translationCacheKey(article, language = currentLang) {
    const fingerprint = window.WRNTranslationTools?.articleFingerprint(article) || '';
    return `translation-full::${article?.link || article?.title || 'article'}::${language}::${fingerprint}`;
}

function parseTranslatedTitleAndText(value, fallbackTitle = '') {
    const cleanValue = cleanTranslationOutput(value);
    const parts = cleanValue.split('---');
    if (parts.length >= 2) {
        return {
            title: parts.shift().trim() || fallbackTitle,
            text: parts.join('---').trim()
        };
    }
    return { title: fallbackTitle, text: cleanValue };
}

async function getStoredFullTranslation(article, language = currentLang) {
    if (!article) return null;
    const key = translationCacheKey(article, language);
    if (translationCache.has(key)) {
        return { ...translationCache.get(key), cached: true };
    }

    if (window.WRNStorage) {
        try {
            const storedTranslation = await window.WRNStorage.getTranslation(key);
            if (storedTranslation?.text) {
                translationCache.set(key, storedTranslation);
                return { ...storedTranslation, cached: true };
            }
        } catch (error) {
            console.warn("Gespeicherte Übersetzung konnte nicht gelesen werden:", error);
        }
    }
    return null;
}

async function translateFullArticle(
    article,
    onProgress = null,
    language = currentLang,
) {
    if (!article) return { error: true, message: 'Artikel nicht gefunden.' };

    const cached = await getStoredFullTranslation(article, language);
    if (cached?.text) {
        return { error: false, ...cached, cached: true };
    }
    const key = translationCacheKey(article, language);

    const originalTitle = String(article.title || '').trim();
    const originalText = String(article.content || '').trim();
    if (!originalText) {
        return {
            error: true,
            message: language === 'de'
                ? 'Dieser Artikel enthält keinen übersetzbaren Text.'
                : 'This article contains no text to translate.'
        };
    }

    const chunks = createArticleChunks(originalText);
    let translatedTitle = originalTitle;
    const translatedParts = [];
    const translationProviders = new Set();

    for (let index = 0; index < chunks.length; index++) {
        if (typeof onProgress === 'function') onProgress(index + 1, chunks.length);

        let result = await window.WRNTranslationTools?.getCachedChunk(article, language, index, chunks[index]);
        if (!result) {
            result = await fetchTranslationRequest({
                title: index === 0 ? originalTitle : "",
                text: chunks[index],
                mode: index === 0 ? "title_and_text" : "continuation",
                targetLanguage: language,
            });
            if (!result.error && result.text) {
                window.WRNTranslationTools?.putCachedChunk(article, language, index, chunks[index], result);
            }
        }
        if (result.error || !result.text) return result;
        if (result.provider) translationProviders.add(result.provider);

        if (index === 0) {
            const parsed = parseTranslatedTitleAndText(result.text, originalTitle);
            translatedTitle = parsed.title;
            if (parsed.text) translatedParts.push(parsed.text);
        } else {
            translatedParts.push(cleanTranslationOutput(result.text));
        }
    }

    const translated = {
        title: translatedTitle,
        text: translatedParts.filter(Boolean).join('\n\n'),
        language,
        providers: [...translationProviders],
        translatedAt: new Date().toISOString()
    };
    translationCache.set(key, translated);
    if (window.WRNStorage) {
        window.WRNStorage.putTranslation(key, translated).catch(error => {
            console.warn("Übersetzung konnte nicht offline gespeichert werden:", error);
        });
    }
    return { error: false, ...translated };
}

async function translateFullArticleForLanguage(idNum, onProgress = null) {
    await hydrateArticleContent(currentFilteredItems[idNum]);
    return translateFullArticle(
        currentFilteredItems[idNum],
        onProgress,
        currentLang,
    );
}

function applyFullTranslationToCard(idNum, translated) {
    const titleEl = document.getElementById(`title-${idNum}`);
    const teaserEl = document.getElementById(`teaser-${idNum}`);
    const contentEl = document.getElementById(`content-${idNum}`);
    const btnEl = document.getElementById(`btn-${idNum}`);
    const card = document.getElementById(`card-${idNum}`);
    const t = uiTexte[currentLang] || uiTexte.en;

    if (titleEl && translated.title) {
        titleEl.textContent = translated.title;
        titleEl.classList.add('translated');
    }
    if (contentEl) {
        contentEl.textContent = translated.text || '';
    }
    if (teaserEl) {
        const sentence = String(translated.text || '').match(/[^.!?]+[.!?]+/)?.[0];
        teaserEl.textContent = sentence || String(translated.text || '').slice(0, 180) + (translated.text?.length > 180 ? '…' : '');
    }
    if (btnEl) {
        btnEl.innerHTML = `[ ${t.btnDone} ]`;
        btnEl.removeAttribute('title');
    }
    if (card) {
        card.dataset.translated = 'full';
        card.dataset.translationLanguage = currentLang;
        window.WRNSourceProfiles?.markTranslated(card, currentFilteredItems[idNum], currentLang);
        window.WRNTranslationTools?.registerTranslation(idNum, currentFilteredItems[idNum], translated, 'full');
    }
}

window.WRNArticleTranslation = Object.freeze({
    getCached: getStoredFullTranslation,
    translate: translateFullArticle,
});

function splitTextForSpeech(value, maxLength = 280) {
    const cleanText = String(value || '')
        .replace(/\s+/g, ' ')
        .replace(/https?:\/\/\S+/g, '')
        .trim();
    if (!cleanText) return [];

    const sentences = cleanText.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [cleanText];
    const chunks = [];
    let current = '';

    for (const sentenceRaw of sentences) {
        const sentence = sentenceRaw.trim();
        if (!sentence) continue;

        if (sentence.length > maxLength) {
            if (current) {
                chunks.push(current);
                current = '';
            }
            const words = sentence.split(/\s+/);
            let wordChunk = '';
            for (const word of words) {
                if (wordChunk && wordChunk.length + word.length + 1 > maxLength) {
                    chunks.push(wordChunk);
                    wordChunk = word;
                } else {
                    wordChunk += (wordChunk ? ' ' : '') + word;
                }
            }
            if (wordChunk) chunks.push(wordChunk);
            continue;
        }

        if (current && current.length + sentence.length + 1 > maxLength) {
            chunks.push(current);
            current = sentence;
        } else {
            current += (current ? ' ' : '') + sentence;
        }
    }

    if (current) chunks.push(current);
    return chunks;
}

function updatePodcastUiText() {
    const t = uiTexte[currentLang] || uiTexte.en;
    setTxt('txt-podcast-voice', t.podcastVoice);
    setTxt('txt-podcast-speed', t.podcastSpeed);
    setTxt('btn-podcast-stop', t.podcastStop);
    const pauseButton = document.getElementById('btn-podcast-pause');
    if (pauseButton) {
        const readyToStart = !podcastState.loading && !podcastState.stopped && !podcastState.started;
        pauseButton.textContent = readyToStart
            ? (t.podcastPlay || 'Play')
            : (podcastState.paused ? t.podcastResume : t.podcastPause);
        pauseButton.disabled = podcastState.loading || podcastState.stopped;
    }
    const title = document.getElementById('podcast-player-title');
    if (title && podcastState.articleId === null) title.textContent = t.podcastTitle;
}

function refreshPodcastVoices() {
    if (!('speechSynthesis' in window)) return;
    podcastVoices = window.speechSynthesis.getVoices() || [];
    populatePodcastVoiceOptions();
}

function populatePodcastVoiceOptions() {
    const select = document.getElementById('podcast-voice-select');
    if (!select) return;
    const t = uiTexte[currentLang] || uiTexte.en;
    const previous = localStorage.getItem(`wrn_podcast_voice_${currentLang}`) || select.value;
    const languagePrefix = (speechLanguageTags[currentLang] || currentLang).split('-')[0].toLowerCase();

    const matching = podcastVoices
        .filter(voice => String(voice.lang || '').toLowerCase().startsWith(languagePrefix))
        .sort((a, b) => Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name));
    const otherVoices = podcastVoices
        .filter(voice => !String(voice.lang || '').toLowerCase().startsWith(languagePrefix))
        .sort((a, b) => String(a.lang || '').localeCompare(String(b.lang || '')) || a.name.localeCompare(b.name));

    select.textContent = '';
    const autoOption = document.createElement('option');
    autoOption.value = '';
    autoOption.textContent = t.podcastAutoVoice;
    select.append(autoOption);

    const appendVoice = voice => {
        const option = document.createElement('option');
        option.value = voice.voiceURI || `${voice.name}::${voice.lang}`;
        option.textContent = `${voice.name} (${voice.lang}, ${voice.localService ? t.podcastLocal : t.podcastOnline})`;
        select.append(option);
    };

    matching.forEach(appendVoice);

    // Auf manchen Smartphones liefert der Browser nur sehr wenige Stimmen für
    // die ausgewählte Sprache. Deshalb werden danach auch die übrigen
    // installierten Stimmen angeboten, statt das Auswahlfeld praktisch leer zu lassen.
    if (otherVoices.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '──────────';
        select.append(separator);
        otherVoices.forEach(appendVoice);
    }

    if ([...select.options].some(option => option.value === previous)) {
        select.value = previous;
    }
}

function getPodcastVoice() {
    const selected = document.getElementById('podcast-voice-select')?.value || '';
    const languagePrefix = (speechLanguageTags[currentLang] || currentLang).split('-')[0].toLowerCase();
    if (selected) {
        const exact = podcastVoices.find(voice =>
            (voice.voiceURI || `${voice.name}::${voice.lang}`) === selected
        );
        if (exact) return exact;
    }
    return podcastVoices.find(voice => voice.localService && String(voice.lang || '').toLowerCase().startsWith(languagePrefix))
        || podcastVoices.find(voice => String(voice.lang || '').toLowerCase().startsWith(languagePrefix))
        || null;
}

function setPodcastStatus(text, progress = '') {
    const status = document.getElementById('podcast-player-status');
    const progressEl = document.getElementById('podcast-player-progress');
    if (status) status.textContent = text || '';
    if (progressEl) progressEl.textContent = progress || '';
}

function speakCurrentPodcastChunk() {
    if (!('speechSynthesis' in window) || podcastState.stopped || podcastState.paused) return;
    const t = uiTexte[currentLang] || uiTexte.en;

    if (podcastState.index >= podcastState.chunks.length) {
        podcastState.stopped = true;
        podcastState.started = false;
        podcastState.utterance = null;
        setPodcastStatus(t.podcastFinished, `${podcastState.chunks.length}/${podcastState.chunks.length}`);
        updatePodcastUiText();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(podcastState.chunks[podcastState.index]);
    utterance.lang = speechLanguageTags[currentLang] || currentLang;
    utterance.rate = Number(document.getElementById('podcast-rate-select')?.value || 1);
    const voice = getPodcastVoice();
    if (voice) utterance.voice = voice;

    podcastState.utterance = utterance;
    podcastState.started = true;
    podcastState.paused = false;

    utterance.onend = () => {
        // Wenn Stimme oder Tempo geändert wurden, ist diese alte Äußerung nicht
        // mehr die aktuelle. Dann darf sie den Abschnittszähler nicht erhöhen.
        if (podcastState.stopped || podcastState.utterance !== utterance) return;
        podcastState.utterance = null;
        podcastState.index += 1;
        speakCurrentPodcastChunk();
    };
    utterance.onerror = event => {
        if (podcastState.utterance !== utterance) return;
        if (podcastState.stopped || event.error === 'canceled' || event.error === 'interrupted') return;
        podcastState.stopped = true;
        podcastState.started = false;
        podcastState.utterance = null;
        setPodcastStatus(`${t.podcastUnsupported} (${event.error || 'error'})`);
        updatePodcastUiText();
    };

    setPodcastStatus(t.podcastSpeaking, `${podcastState.index + 1}/${podcastState.chunks.length}`);
    updatePodcastUiText();
    window.speechSynthesis.speak(utterance);
}

async function startPodcast(idNum) {
    const t = uiTexte[currentLang] || uiTexte.en;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        alert(t.podcastUnsupported);
        return;
    }

    stopPodcast(false);
    podcastState.articleId = idNum;
    podcastState.loading = true;
    podcastState.stopped = false;
    podcastState.paused = true;
    podcastState.started = false;

    const player = document.getElementById('podcast-player');
    const playerTitle = document.getElementById('podcast-player-title');
    const article = currentFilteredItems[idNum];
    const podcastButton = document.getElementById(`podcast-${idNum}`);
    const card = document.getElementById(`card-${idNum}`);
    if (player) player.hidden = false;
    if (playerTitle) playerTitle.textContent = article?.title || t.podcastTitle;
    if (podcastButton) podcastButton.innerHTML = `${starSpinner} <span>[ ${t.podcastPreparing} ]</span>`;
    setPodcastStatus(t.podcastTranslating, '0%');

    const result = await translateFullArticleForLanguage(idNum, (current, total) => {
        const percent = Math.round((current - 1) / Math.max(total, 1) * 100);
        setPodcastStatus(t.podcastTranslating, `${percent}%`);
    });

    if (result.error || !result.text) {
        podcastState.loading = false;
        podcastState.stopped = true;
        if (podcastButton) podcastButton.innerHTML = `[ 🎧 ${t.btnPodcast} ]`;
        setPodcastStatus(`${t.podcastTranslationFailed} ${result.message || ''}`.trim());
        showTranslationError(document.getElementById(`btn-${idNum}`), card, result);
        return;
    }

    applyFullTranslationToCard(idNum, result);
    if (playerTitle) playerTitle.textContent = result.title || article?.title || t.podcastTitle;
    if (podcastButton) podcastButton.innerHTML = `[ 🎧 ${t.btnPodcast} ]`;

    const voice = getPodcastVoice();
    if (!voice) {
        setPodcastStatus(t.podcastNoVoice);
    }

    podcastState.chunks = splitTextForSpeech(`${result.title}. ${result.text}`);
    podcastState.index = 0;
    podcastState.loading = false;
    podcastState.stopped = false;
    podcastState.paused = true;
    podcastState.started = false;
    podcastState.utterance = null;
    window.speechSynthesis.cancel();
    setPodcastStatus(t.podcastReady || 'Ready – press Play', `0/${podcastState.chunks.length}`);
    updatePodcastUiText();
}

function togglePodcastPause() {
    if (!('speechSynthesis' in window) || podcastState.loading || podcastState.stopped) return;
    const t = uiTexte[currentLang] || uiTexte.en;

    // Der erste Klick startet die vorbereitete Aufnahme. Nach der Übersetzung
    // wird nichts mehr automatisch abgespielt.
    if (!podcastState.started) {
        podcastState.paused = false;
        speakCurrentPodcastChunk();
        return;
    }

    if (podcastState.paused) {
        window.speechSynthesis.resume();
        podcastState.paused = false;
        setPodcastStatus(t.podcastSpeaking, `${podcastState.index + 1}/${podcastState.chunks.length}`);
    } else {
        window.speechSynthesis.pause();
        podcastState.paused = true;
        setPodcastStatus(t.podcastPaused, `${podcastState.index + 1}/${podcastState.chunks.length}`);
    }
    updatePodcastUiText();
}

function stopPodcast(hidePlayer = true) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    podcastState = {
        articleId: null,
        chunks: [],
        index: 0,
        paused: false,
        loading: false,
        stopped: true,
        started: false,
        utterance: null
    };
    const player = document.getElementById('podcast-player');
    if (player && hidePlayer) player.hidden = true;
    setPodcastStatus('');
    updatePodcastUiText();
}

function restartPodcastChunkAfterSettingChange() {
    if (!('speechSynthesis' in window) || podcastState.loading || podcastState.stopped || !podcastState.started) return;

    const wasPlaying = !podcastState.paused;
    podcastState.utterance = null;
    window.speechSynthesis.cancel();

    if (wasPlaying) {
        window.setTimeout(() => {
            podcastState.started = false;
            podcastState.paused = false;
            speakCurrentPodcastChunk();
        }, 120);
    } else {
        podcastState.started = false;
        podcastState.paused = true;
        const t = uiTexte[currentLang] || uiTexte.en;
        setPodcastStatus(t.podcastReady || 'Ready – press Play', `${podcastState.index + 1}/${podcastState.chunks.length}`);
        updatePodcastUiText();
    }
}

function changePodcastRate(value) {
    localStorage.setItem('wrn_podcast_rate', String(value || 1));
    restartPodcastChunkAfterSettingChange();
}

function changePodcastVoice() {
    const value = document.getElementById('podcast-voice-select')?.value || '';
    localStorage.setItem(`wrn_podcast_voice_${currentLang}`, value);
    restartPodcastChunkAfterSettingChange();
}

function initializePodcast() {
    const rateSelect = document.getElementById('podcast-rate-select');
    const savedRate = localStorage.getItem('wrn_podcast_rate') || '1';
    if (rateSelect && [...rateSelect.options].some(option => option.value === savedRate)) {
        rateSelect.value = savedRate;
    }
    updatePodcastUiText();
    refreshPodcastVoices();
    if ('speechSynthesis' in window) {
        window.speechSynthesis.addEventListener('voiceschanged', refreshPodcastVoices);
        // Safari und manche Android-Browser stellen die Stimmen erst verspätet bereit.
        [150, 600, 1500, 3000].forEach(delay => window.setTimeout(refreshPodcastVoices, delay));
    }
}


// Podcast-, Original-Podcast- und Radio-Bibliothek: siehe audio-hub.js.

// Event-Filter, Kalenderexport, Kartenlinks und gespeicherte Event-Filter: siehe events.js.

function changeTheme(themeName) {
    if (window.WRNAccessibility?.applyTheme) {
        return window.WRNAccessibility.applyTheme(themeName);
    }
    const body = document.getElementById('app-body');
    if (body) {
        body.classList.remove('theme-dark', 'theme-light', 'theme-oled', 'theme-contrast', 'theme-soft');
        body.classList.add(themeName || 'theme-dark');
        localStorage.setItem('wrn_theme_style', themeName || 'theme-dark');
    }
    return themeName || 'theme-dark';
}

async function clearAllData() {
    const confirmTxt = currentLang === "de"
        ? "Möchtest du wirklich alle Lesezeichen, Einstellungen, Offline-Nachrichten und gespeicherten Übersetzungen löschen?"
        : "Delete all bookmarks, settings, offline news and saved translations?";

    if (!confirm(confirmTxt)) return;

    window.WRNOriginSafety.clearOwnedStorage(window.localStorage);

    if (window.WRNStorage) {
        try { await window.WRNStorage.clearAll(); } catch (error) { console.warn(error); }
    }

    if ('caches' in window) {
        try {
            const names = await window.WRNOriginSafety.getOwnedCacheNames();
            await Promise.all(names.map(name => caches.delete(name)));
        } catch (error) {
            console.warn("Browser-Caches konnten nicht vollständig gelöscht werden:", error);
        }
    }

    window.location.reload();
}

function changeLanguage() {
    const previousLang = currentLang;
    const langSelect = document.getElementById('ui-language');
    if(langSelect) { currentLang = langSelect.value; }
    if (previousLang !== currentLang && podcastState.articleId !== null) stopPodcast();
    localStorage.setItem('wrn_system_lang', currentLang); 
    
    const t = uiTexte[currentLang] || uiTexte['en'];
    document.documentElement.lang = currentLang;
    window.WRNAccessibility?.updateLanguage(currentLang);
    window.WRNSourceProfiles?.updateUi(currentLang);
    
    setTxt('txt-lang-label', t.langLabel); setTxt('txt-theme-label', t.themeLabel); setTxt('opt-theme-dark', t.themeDark); setTxt('opt-theme-light', t.themeLight); setTxt('btn-clear-cache', t.clearBtn); setTxt('txt-region-summary', t.searchRegion); setTxt('txt-topic-summary', t.searchTopic); setTxt('txt-archive-title', t.archiveTitle); setTxt('txt-contact-label', t.contactLabel); setTxt('opt-sort-new', t.sortNew); setTxt('opt-sort-old', t.sortOld); setTxt('txt-top-bookmarks', t.topBookmarks); setTxt('txt-donate-btn', t.btnDonateTop); setTxt('txt-donate-title', t.donateTitle); setTxt('txt-donate-body', t.donateBody); setTxt('txt-donate-warning', t.donateWarning); setTxt('btn-paypal', t.btnPaypal); setTxt('btn-donate-cancel', t.btnDonateCancel); setPh('search-input', t.searchPlace);
    
    setTxt('btn-glob', t.catGlobal); setTxt('btn-eur', t.catEurope); setTxt('btn-afr', t.catAfrica); setTxt('btn-nam', t.catNorthAmerica); setTxt('btn-lam', t.catLatinAmerica); setTxt('btn-asi', t.catAsia); setTxt('btn-aus', t.catAustralia);
    setTxt('cat-labor', t.catLabor); setTxt('cat-antifascism', t.catAntifascism); setTxt('cat-antisexism', t.catAntisexism); setTxt('cat-queer', t.catQueer); setTxt('cat-antiracism', t.catAntiracism); setTxt('cat-noborders', t.catNoBorders); setTxt('cat-anticapitalism', t.catAnticapitalism); setTxt('cat-theory', t.catTheory); setTxt('cat-anticolonialism', t.catAnticolonialism); setTxt('cat-antiimperialism', t.catAntiimperialism); setTxt('cat-squatting', t.catSquatting); setTxt('cat-demos', t.catDemos); setTxt('cat-antirepression', t.catAntirepression); setTxt('cat-cyber', t.catCyber); setTxt('cat-nowar', t.catNoWar); setTxt('cat-animal', t.catAnimal); setTxt('cat-eco', t.catEco); setTxt('cat-indigenous', t.catIndigenous); setTxt('cat-health', t.catHealth); setTxt('btn-lib', t.catLibraries); 
    setTxt('txt-radar-summary', t.radarSummary);

    setTxt('btn-open-info', "ℹ️ " + t.infoBtn); setTxt('txt-info-title', t.infoTitle); setHtml('txt-info-body', t.infoBody); setTxt('btn-open-feedback', t.fbBtn); setTxt('txt-fb-title', t.fbTitle); setPh('fb-text', t.fbPlace); setTxt('txt-captcha-q', t.fbCaptcha); setTxt('btn-fb-cancel', t.fbCancel); setTxt('btn-fb-send', t.fbSend);

    setTxt('txt-event-filter-title', t.eventFilterTitle); setTxt('txt-event-country', t.eventCountry); setTxt('txt-event-city', t.eventCity); setTxt('txt-event-category', t.eventCategory); setTxt('txt-event-date', t.eventDate); setTxt('txt-event-group', t.eventGroup); setTxt('btn-event-reset', t.eventReset);
    updateSortLabels();
    updatePodcastUiText();
    populatePodcastVoiceOptions();
    populateAzurePodcastVoiceOptions();
    updateSharedPodcastUiText();
    updateGlobalMediaButtons();
    updateGlobalMediaProgress();
    window.WRNReading?.updateUi();
    window.WRNTranslationTools?.refreshTexts();
    window.WRNDataControl?.refreshLanguage();
    updateZineUi();
    if (allNewsData.length > 0) populateEventFilters();
    
    if(activeKontinent === "Bookmarks") { showBookmarks(); }
    else if (activeKontinent === "Read") { showReadArticles(); }
    else if (allNewsData.length > 0) { setTxt('status-container', t.latestNews); applyFilters(); }
}

function getSavedBookmarks() { return window.WRNReading?.getBookmarks() || JSON.parse(localStorage.getItem('wrn_bookmarks') || '[]'); }
function getReadArticles() { return window.WRNReading?.getReadLinks() || JSON.parse(localStorage.getItem('wrn_read_list') || '[]'); }

function markAsRead(link, idNum) {
    window.WRNReading?.setRead(link, true);
    const card = document.getElementById(`card-${idNum}`);
    if (card) card.classList.add('read');
    window.WRNReading?.updateUi();
}

function toggleBookmark(idNum) {
    const article = currentFilteredItems[idNum];
    if (!article) return;
    const saved = window.WRNReading?.toggleBookmark(article);
    const button = document.getElementById(`bmark-${idNum}`);
    if (button && window.WRNReading) {
        button.innerHTML = window.WRNReading.bookmarkButtonHtml(Boolean(saved));
        button.classList.toggle('is-bookmarked', Boolean(saved));
        button.setAttribute('aria-pressed', String(Boolean(saved)));
    }
    window.WRNReading?.updateUi();
    if(activeKontinent === "Bookmarks") showBookmarks();
}

function toggleReadState(idNum) {
    const article = currentFilteredItems[idNum];
    if (!article) return;
    window.WRNReading?.toggleRead(article);
    window.WRNReading?.updateUi();
    if (activeKontinent === "Read") showReadArticles();
}

// Wird nur beim Klick auf den Lesezeichen-Button benutzt und schaltet die Ansicht um.
function ladeBookmarks() {
    if (activeKontinent === "Bookmarks") {
        ladeKontinentNews("Global");
        return;
    }
    showBookmarks();
}

// Zeigt oder aktualisiert die Lesezeichen, ohne unbeabsichtigt zu Global zurückzuspringen.
function showBookmarks() {
    activeKontinent = "Bookmarks";
    updateEventUiVisibility();
    updateSortLabels();
    const rawBookmarks = getSavedBookmarks();

    document.querySelectorAll('.btn-nav').forEach(btn => btn.classList.remove('active'));
    const bBtn = document.getElementById('btn-bookmarks');
    if (bBtn) bBtn.classList.add('active');

    setTxt('status-container', window.WRNReading?.listLabel('bookmarks', rawBookmarks.length) || `Read later (${rawBookmarks.length})`);

    currentSourceFilter = "ALL";
    currentFilteredItems = rawBookmarks;
    applyFilters(true);
}

function ladeReadArticles() {
    if (activeKontinent === "Read") {
        ladeKontinentNews("Global");
        return;
    }
    showReadArticles();
}

function showReadArticles() {
    activeKontinent = "Read";
    updateEventUiVisibility();
    updateSortLabels();
    const items = window.WRNReading?.getReadArticleItems(allNewsData) || [];

    document.querySelectorAll('.btn-nav').forEach(btn => btn.classList.remove('active'));
    const button = document.getElementById('btn-read-articles');
    if (button) button.classList.add('active');

    setTxt('status-container', window.WRNReading?.listLabel('read', items.length) || `Read (${items.length})`);
    currentSourceFilter = "ALL";
    applyFilters();
}

function zineArticleKey(article) {
    return String(article?.link || `${article?.quelleName || ''}::${article?.title || ''}::${article?.pubDate || ''}`).trim();
}

function loadZineArticles() {
    try {
        const saved = JSON.parse(localStorage.getItem(ZINE_KEY) || '[]');
        return Array.isArray(saved) ? saved.filter(item => item && typeof item === 'object') : [];
    } catch {
        return [];
    }
}

function saveZineArticles() {
    try {
        localStorage.setItem(ZINE_KEY, JSON.stringify(zineArticles));
    } catch (error) {
        console.warn('Zine konnte nicht lokal gespeichert werden:', error);
    }
    window.dispatchEvent(new CustomEvent('wrnzinechange', { detail: { count: zineArticles.length } }));
}

function isInZine(article) {
    const key = zineArticleKey(article);
    return Boolean(key && zineArticles.some(item => zineArticleKey(item) === key));
}

function zineButtonLabel(article) {
    if (isInZine(article)) return currentLang === 'de' ? '✓ Aus Zine entfernen' : '✓ Remove from Zine';
    return currentLang === 'de' ? '📄 Zum Zine' : '📄 Add to Zine';
}

function updateZineUi() {
    setTxt('txt-zine-count', `📄 Zine (${zineArticles.length})`);
    document.querySelectorAll('[id^="zine-"]').forEach(button => {
        const index = Number(button.id.slice(5));
        const article = currentFilteredItems[index];
        if (!article) return;
        const selected = isInZine(article);
        button.textContent = zineButtonLabel(article);
        button.classList.toggle('is-in-zine', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
    if (document.getElementById('zine-modal')?.style.display === 'block') renderZineList();
}

function toggleZine(globalIndex) {
    const article = currentFilteredItems[globalIndex];
    if (!article) return;
    const key = zineArticleKey(article);
    const existingIndex = zineArticles.findIndex(item => zineArticleKey(item) === key);
    if (existingIndex >= 0) zineArticles.splice(existingIndex, 1);
    else zineArticles.push(article);
    saveZineArticles();
    updateZineUi();
}

function removeFromZine(key) {
    zineArticles = zineArticles.filter(article => zineArticleKey(article) !== key);
    saveZineArticles();
    updateZineUi();
}

function renderZineList() {
    const list = document.getElementById('zine-list');
    if (!list) return;
    list.textContent = '';
    if (!zineArticles.length) {
        const empty = document.createElement('p');
        empty.className = 'zine-empty';
        empty.textContent = currentLang === 'de' ? 'Das Zine ist noch leer.' : 'The Zine is empty.';
        list.append(empty);
    } else {
        zineArticles.forEach((article, index) => {
            const row = document.createElement('div');
            row.className = 'zine-list-item';
            const copy = document.createElement('div');
            const number = document.createElement('strong');
            number.textContent = `${index + 1}. ${article.title || (currentLang === 'de' ? 'Ohne Titel' : 'Untitled')}`;
            const source = document.createElement('small');
            source.textContent = article.quelleName || '';
            copy.append(number, source);
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'zine-remove-button';
            remove.textContent = currentLang === 'de' ? 'Entfernen' : 'Remove';
            remove.addEventListener('click', () => removeFromZine(zineArticleKey(article)));
            row.append(copy, remove);
            list.append(row);
        });
    }
    const printButton = document.getElementById('btn-zine-print');
    const clearButton = document.getElementById('btn-zine-clear');
    if (printButton) printButton.disabled = zineArticles.length === 0;
    if (clearButton) clearButton.disabled = zineArticles.length === 0;
}

function openZineManager() {
    const overlay = document.getElementById('fb-overlay');
    const modal = document.getElementById('zine-modal');
    if (overlay) overlay.style.display = 'block';
    if (modal) modal.style.display = 'block';
    setTxt('zine-modal-title', currentLang === 'de' ? 'Zine zusammenstellen' : 'Build your Zine');
    setTxt('zine-modal-hint', currentLang === 'de'
        ? 'Hier kannst du einzelne Artikel entfernen und das Zine drucken oder als PDF speichern.'
        : 'Remove individual articles, then print the Zine or save it as a PDF.');
    setTxt('btn-zine-print', currentLang === 'de' ? 'Drucken / PDF' : 'Print / PDF');
    setTxt('btn-zine-clear', currentLang === 'de' ? 'Zine leeren' : 'Clear Zine');
    setTxt('btn-zine-close', currentLang === 'de' ? 'Schließen' : 'Close');
    renderZineList();
}

function clearZine() {
    if (!zineArticles.length) return;
    const question = currentLang === 'de' ? 'Alle Artikel aus dem Zine entfernen?' : 'Remove every article from the Zine?';
    if (!window.confirm(question)) return;
    zineArticles = [];
    saveZineArticles();
    updateZineUi();
}

function printZine() {
    if (!zineArticles.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert(currentLang === 'de' ? 'Bitte erlaube das Druckfenster für diese App.' : 'Please allow the print window for this app.');
        return;
    }
    let html = `<!doctype html><html><head><meta charset="utf-8"><title></title>
    <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; color: #000; }
        .print-area { box-sizing: border-box; padding: 12mm; font-family: Georgia, serif; line-height: 1.42; }
        .zine-article { column-count: 2; column-gap: 9mm; margin-bottom: 12mm; border-bottom: 2px solid #000; padding-bottom: 8mm; break-after: page; }
        .zine-article:last-child { break-after: auto; }
        h1 { column-span: all; margin: 0 0 4mm; padding-bottom: 3mm; border-bottom: 1px solid #000; font: 700 18pt Arial, sans-serif; text-align: center; }
        .meta { column-span: all; margin-bottom: 5mm; font: italic 9pt Arial, sans-serif; text-align: center; }
        p { margin: 0 0 3mm; text-indent: 5mm; orphans: 3; widows: 3; }
    </style></head><body><main class="print-area">`;
    zineArticles.forEach(article => {
        const text = escapeHtml(article.content || '').replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
        const date = article.pubDate ? String(article.pubDate).substring(0, 10) : '';
        html += `<article class="zine-article"><h1>${escapeHtml(article.title || 'Ohne Titel')}</h1>`;
        html += `<div class="meta">${currentLang === 'de' ? 'Quelle' : 'Source'}: ${escapeHtml(article.quelleName || 'Unknown')} · ${escapeHtml(date)}</div>`;
        html += `<p>${text}</p></article>`;
    });
    html += '</main></body></html>';
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.document.title = '';
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 350);
}

function openDonate() { const ov = document.getElementById('fb-overlay'); if(ov) ov.style.display = 'block'; const md = document.getElementById('donate-modal'); if(md) md.style.display = 'block'; }
function openFeedback() {
    const ov = document.getElementById('fb-overlay'); if(ov) ov.style.display = 'block'; const md = document.getElementById('fb-modal'); if(md) md.style.display = 'block';
    capVal1 = Math.floor(Math.random() * 10) + 1; capVal2 = Math.floor(Math.random() * 10) + 1;
    setTxt('captcha-num1', capVal1); setTxt('captcha-num2', capVal2);
    const ca = document.getElementById('captcha-answer'); if(ca) ca.value = ''; const ft = document.getElementById('fb-text'); if(ft) ft.value = '';
}
function openInfo() { const ov = document.getElementById('fb-overlay'); if(ov) ov.style.display = 'block'; const md = document.getElementById('info-modal'); if(md) md.style.display = 'block'; }
function closeAllModals() { 
    const ov = document.getElementById('fb-overlay'); if(ov) ov.style.display = 'none'; 
    const m1 = document.getElementById('fb-modal'); if(m1) m1.style.display = 'none'; 
    const m2 = document.getElementById('info-modal'); if(m2) m2.style.display = 'none'; 
    const m3 = document.getElementById('donate-modal'); if(m3) m3.style.display = 'none'; 
    const m4 = document.getElementById('sources-modal'); if(m4) m4.style.display = 'none';
    const m5 = document.getElementById('podcast-options-modal'); if(m5) m5.style.display = 'none';
    const m6 = document.getElementById('podcast-library-modal'); if(m6) m6.style.display = 'none';
    const m7 = document.getElementById('system-status-modal'); if(m7) m7.style.display = 'none';
    const m8 = document.getElementById('zine-modal'); if(m8) m8.style.display = 'none';
    document.body.classList.remove('wrn-podcast-options-open');
    window.WRNSourceProfiles?.close();
    window.WRNTranslationTools?.closeModals();
    window.WRNDataControl?.close();
    if (typeof pausePodcastLibraryAudio === 'function') {
        pausePodcastLibraryAudio();
    }
}

function articlePublisherKey(article) {
    return String(article?.quelleName || article?.source || '')
        .trim()
        .toLocaleLowerCase();
}

function articlePublisherFamilyKey(article) {
    const publisher = articlePublisherKey(article);
    return publisher === 'bianet türkçe' || publisher === 'bianet kurdî'
        ? 'bianet'
        : publisher;
}

function normalizedArticleUrl(value) {
    try {
        const url = new URL(String(value || ''));
        [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
            'utm_content', 'fbclid', 'gclid', 'mc_cid', 'mc_eid'
        ].forEach(key => url.searchParams.delete(key));
        url.hash = '';
        return `${url.origin}${url.pathname.replace(/\/+$/, '')}${url.search}`.toLocaleLowerCase();
    } catch {
        return '';
    }
}

function normalizedArticleText(value) {
    return String(value || '')
        .normalize('NFKD')
        .replace(/\p{M}/gu, '')
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
}

function articleDedupeKeys(article) {
    const url = normalizedArticleUrl(article?.link);
    const source = articlePublisherKey(article);
    const title = normalizedArticleText(article?.title);
    const content = normalizedArticleText(article?.content).slice(0, 700);
    return [
        url ? `url:${url}` : '',
        title ? `title:${source}:${title}` : '',
        content.length >= 160 ? `content:${content}` : ''
    ].filter(Boolean);
}

function deduplicateArticles(items) {
    const result = [];
    const keyToIndex = new Map();
    (Array.isArray(items) ? items : []).forEach(article => {
        const keys = articleDedupeKeys(article);
        const existingIndex = keys
            .map(key => keyToIndex.get(key))
            .find(index => Number.isInteger(index));
        if (!Number.isInteger(existingIndex)) {
            const index = result.length;
            result.push(article);
            keys.forEach(key => keyToIndex.set(key, index));
            return;
        }
        const existing = result[existingIndex] || {};
        const existingLength = String(existing.content || '').length;
        const nextLength = String(article?.content || '').length;
        result[existingIndex] = nextLength >= existingLength
            ? { ...existing, ...article }
            : { ...article, ...existing };
        articleDedupeKeys(result[existingIndex]).forEach(key => keyToIndex.set(key, existingIndex));
    });
    return result;
}

function interleaveArticlesByPublisher(items, options = {}) {
    const explicitSource = options.explicitSource === true;
    const deduped = deduplicateArticles(items);
    if (explicitSource) return deduped;

    const remaining = [...deduped];
    const mixed = [];
    let previous = '';
    const firstTenCounts = new Map();

    while (remaining.length) {
        const inFirstTen = mixed.length < 10;
        let nextIndex = remaining.findIndex(article => {
            const publisher = articlePublisherKey(article);
            const family = articlePublisherFamilyKey(article);
            if (family === previous) return false;
            if (!inFirstTen) return true;
            const limit = family === 'bianet' ? 1 : 2;
            return (firstTenCounts.get(family) || 0) < limit;
        });
        if (nextIndex < 0) {
            nextIndex = remaining.findIndex(article => articlePublisherFamilyKey(article) !== previous);
        }
        if (nextIndex < 0) nextIndex = 0;
        const [next] = remaining.splice(nextIndex, 1);
        mixed.push(next);
        previous = articlePublisherFamilyKey(next);
        if (mixed.length <= 10) {
            firstTenCounts.set(previous, (firstTenCounts.get(previous) || 0) + 1);
        }
    }

    return mixed;
}

window.WRNFeedOrder = Object.freeze({
    interleaveArticlesByPublisher,
    deduplicateArticles,
    normalizedArticleUrl
});

function limitDominantPublishersForSection(items, sourceFilter = 'ALL') {
    // Keinen Beitrag löschen: dominante Quellen werden ausschließlich
    // umsortiert. Bei einer expliziten Quellenwahl bleibt die Reihenfolge.
    return sourceFilter === 'ALL'
        ? interleaveArticlesByPublisher(items)
        : deduplicateArticles(items);
}
function submitFeedback() {
    const ca = document.getElementById('captcha-answer'); const ft = document.getElementById('fb-text'); if(!ca || !ft) return;
    const userAnswer = parseInt(ca.value); const text = ft.value.trim(); const t = uiTexte[currentLang] || uiTexte['en'];
    if (text === "") { alert(t.fbErrEmpty); return; }
    if (userAnswer !== (capVal1 + capVal2)) { alert(t.fbErrCap); return; }
    window.location.href = `mailto:worldrevnews@brief.li?subject=Contact&body=${encodeURIComponent(text)}`; closeAllModals();
}

function openSourcesModal() {
    const ov = document.getElementById('fb-overlay');
    if (ov) ov.style.display = 'block';

    const md = document.getElementById('sources-modal');
    if (md) md.style.display = 'block';

    const listContainer = document.getElementById('sources-list-container');
    if (!listContainer) return;
    listContainer.textContent = '';

    const t = uiTexte[currentLang] || uiTexte['en'];

    const createSourceButton = (label, sourceName, isActive, isAll = false) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-micro';
        button.style.width = '100%';
        button.style.textAlign = 'left';
        button.style.padding = '10px';
        button.style.fontSize = '0.8rem';
        button.style.justifyContent = 'flex-start';

        if (isAll) {
            button.style.borderColor = 'var(--color-green)';
            button.style.color = 'var(--color-green)';
        } else if (isActive) {
            button.style.background = 'rgba(0, 240, 255, 0.2)';
            button.style.borderColor = 'var(--color-cyan)';
            button.style.color = 'var(--text-main)';
        }

        button.textContent = label;
        button.addEventListener('click', () => filterBySource(sourceName));
        return button;
    };

    listContainer.append(createSourceButton(`🌍 ${t.filterAll}`, 'ALL', currentSourceFilter === 'ALL', true));

    const baseList = activeKontinent === 'Bookmarks'
        ? getSavedBookmarks()
        : activeKontinent === 'Read'
            ? (window.WRNReading?.getReadArticleItems(allNewsData) || [])
            : allNewsData.filter(item => articleMatchesCategory(item, activeKontinent));

    const portals = [...new Set(baseList.map(item => item.quelleName).filter(Boolean))].sort();
    portals.forEach(portal => {
        const profileRow = window.WRNSourceProfiles?.makeSourceListRow(
            portal,
            currentSourceFilter === portal,
            () => filterBySource(portal)
        );
        listContainer.append(profileRow || createSourceButton(portal, portal, currentSourceFilter === portal));
    });
}

function filterBySource(sourceName) { currentSourceFilter = sourceName; closeAllModals(); applyFilters(); }

async function fetchJsonFile(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error(`${url}: JSON ist keine Liste.`);
    }
    return {
        data,
        updatedAt: response.headers.get('last-modified') || response.headers.get('date') || new Date().toISOString()
    };
}

async function loadDatasetWithOfflineFallback(datasetKey, url, legacyLocalStorageKey) {
    try {
        const freshResult = await fetchJsonFile(url);
        const freshData = freshResult.data;
        if (window.WRNStorage) {
            await window.WRNStorage.putDataset(datasetKey, freshData);
        }
        return { data: freshData, source: "network", updatedAt: freshResult.updatedAt };
    } catch (networkError) {
        console.warn(`${datasetKey} konnte nicht aktualisiert werden:`, networkError);

        if (window.WRNStorage) {
            try {
                const stored = await window.WRNStorage.getDataset(datasetKey);
                if (Array.isArray(stored) && stored.length > 0) {
                    return { data: stored, source: "indexeddb", error: networkError };
                }
            } catch (storageError) {
                console.warn(`${datasetKey} konnte nicht aus IndexedDB gelesen werden:`, storageError);
            }
        }

        // Nur für die erste Migration von älteren App-Versionen.
        try {
            const legacy = JSON.parse(localStorage.getItem(legacyLocalStorageKey) || "[]");
            if (Array.isArray(legacy) && legacy.length > 0) {
                return { data: legacy, source: "legacy", error: networkError };
            }
        } catch {}

        return { data: [], source: "none", error: networkError };
    }
}

function mergeArticleDatasets(...datasets) {
    return deduplicateArticles(datasets.flat().filter(Boolean)).sort((left, right) =>
        new Date(right?.pubDate || right?.eventStart || 0)
        - new Date(left?.pubDate || left?.eventStart || 0)
    );
}

async function initialisiereApp() {
    setTxt('status-container', "Lade Nachrichten und Events...");

    if (window.WRNStorage) {
        try {
            await window.WRNStorage.migrateLegacyLocalStorage();
            window.WRNStorage.requestPersistentStorage().catch(() => false);
        } catch (error) {
            console.warn("Offline-Speicher konnte nicht vorbereitet werden:", error);
        }
    }

    const [newsResult, eventsResult] = await Promise.all([
        loadDatasetWithOfflineFallback('news', GITHUB_NEWS_URL, 'cached_news_articles'),
        loadDatasetWithOfflineFallback('events', GITHUB_EVENTS_URL, 'cached_event_data')
    ]);

    let newsItems = newsResult.data;
    const eventItems = eventsResult.data;
    if (window.WRNStorage) {
        try {
            const storedArchive = await window.WRNStorage.getDataset('news-30-day');
            const cutoff = Date.now() - (31 * 24 * 60 * 60 * 1000);
            const recentStored = (Array.isArray(storedArchive) ? storedArchive : []).filter(item => {
                const stamp = new Date(item?.pubDate || item?.published || item?.date || 0).getTime();
                return Number.isFinite(stamp) && stamp >= cutoff;
            });
            newsItems = mergeArticleDatasets(newsItems, recentStored);
        } catch (error) {
            console.warn('30-Tage-Archiv konnte beim Start nicht ergänzt werden:', error);
        }
    }
    allNewsData = mergeArticleDatasets(newsItems, eventItems);
    window.WRNSourceProfiles?.setArticles(allNewsData);

    window.WRNStatusCenter?.noteDataset('news', newsResult);
    window.WRNStatusCenter?.noteDataset('events', eventsResult);

    if (allNewsData.length === 0) {
        setTxt('status-container', "[ FEHLER ] Es sind weder Online- noch Offline-Daten vorhanden.");
        return;
    }

    populateEventFilters();
    ladeKontinentNews("Global");

    // Ein Offline-Rückfall ist technisch nützlich, aber keine Meldung, die
    // dauerhaft vor dem ersten Artikel stehen muss. Die App zeigt deshalb
    // weiterhin die normale Überschrift. Für die Fehlersuche bleibt die
    // Information nur in der Browser-Konsole erhalten.
    if (newsResult.source !== 'network' || eventsResult.source !== 'network') {
        console.warn('Offline-Rückfall verwendet:', {
            nachrichten: newsResult.source,
            events: eventsResult.source
        });
    }
}

function ladeKontinentNews(kontinent) {
    if(kontinent === "Bookmarks") return ladeBookmarks();
    if(kontinent === "Read") return ladeReadArticles();
    activeKontinent = kontinent; currentSourceFilter = "ALL"; 
    
    document.querySelectorAll('.btn-nav').forEach(btn => btn.classList.remove('active'));
    const btnMap = { 'Global': 'btn-glob', 'Europe': 'btn-eur', 'Africa': 'btn-afr', 'North America': 'btn-nam', 'Latin America': 'btn-lam', 'Asia': 'btn-asi', 'Australia & NZ': 'btn-aus', 'Labor Struggles': 'cat-labor', 'Antifascism': 'cat-antifascism', 'Antisexism': 'cat-antisexism', 'Queer-Feminism': 'cat-queer', 'Antiracism': 'cat-antiracism', 'No Borders': 'cat-noborders', 'Anticapitalism': 'cat-anticapitalism', 'Theory & Strategy': 'cat-theory', 'Anticolonialism': 'cat-anticolonialism', 'Anti-Imperialism': 'cat-antiimperialism', 'Squatting & Housing': 'cat-squatting', 'Demonstrations': 'cat-demos', 'Anti-Rep & Prisons': 'cat-antirepression', 'Cyberactivism': 'cat-cyber', 'No War': 'cat-nowar', 'Animal Liberation': 'cat-animal', 'Eco-Anarchism': 'cat-eco', 'Indigenous Struggles': 'cat-indigenous', 'Radical Health & Disability': 'cat-health', 'Libraries': 'btn-lib', 'Radar': 'cat-radar' };
    if(btnMap[kontinent]) { const b = document.getElementById(btnMap[kontinent]); if(b) b.classList.add('active'); }

    updateEventUiVisibility();
    updateSortLabels();
    if (kontinent === 'Radar') populateEventFilters();

    const t = uiTexte[currentLang] || uiTexte['en']; setTxt('status-container', t.latestNews);
    applyFilters();
}

function applyFilters(isBookmark = false) {
    const iSel = document.getElementById('search-input');
    const selPortal = currentSourceFilter || "ALL"; 
    const searchQuery = iSel ? iSel.value.toLowerCase().trim() : "";
    const sortOrder = document.getElementById('sort-select') ? document.getElementById('sort-select').value : "new";
    const contentType = document.getElementById('content-type-filter')?.value || "";
    
    let baseList;
    if (activeKontinent === "Bookmarks" || isBookmark) baseList = getSavedBookmarks();
    else if (activeKontinent === "Read") baseList = window.WRNReading?.getReadArticleItems(allNewsData) || [];
    else {
        const customRows = window.WRNInterfaceBlock3?.rowsForCategory?.(allNewsData, activeKontinent);
        baseList = Array.isArray(customRows)
            ? customRows
            : allNewsData.filter(item => articleMatchesCategory(item, activeKontinent));
    }
    let filtered = (selPortal === "ALL") ? baseList : baseList.filter(a => a.quelleName === selPortal);

    if (window.WRNInterfaceBlock3?.filterRows) {
        filtered = window.WRNInterfaceBlock3.filterRows(filtered, { category: activeKontinent });
    }

    if (activeKontinent === 'Radar') {
        filtered = filtered.filter(eventMatchesSpecialFilters);
        if (typeof window.WRNCollapseRecurringEvents === 'function') {
            filtered = window.WRNCollapseRecurringEvents(filtered);
        }
    }
    if (contentType) {
        filtered = filtered.filter(article => window.WRNSourceProfiles?.matchesType(article, contentType) ?? true);
    }
    if (window.WRNSourceFilters?.matches) {
        filtered = filtered.filter(article => window.WRNSourceFilters.matches(article));
    }
    
    if (searchQuery !== "") { filtered = filtered.filter(a => (a.title && a.title.toLowerCase().includes(searchQuery)) || (a.content && a.content.toLowerCase().includes(searchQuery)) || normalizedStringArray(a.eventTags).join(' ').toLowerCase().includes(searchQuery) || normalizedStringArray(a.eventCategories).join(' ').toLowerCase().includes(searchQuery) || String(a.eventCity || '').toLowerCase().includes(searchQuery)); }

    filtered.sort((a, b) => {
        if (activeKontinent === 'Radar') {
            const da = getEventStartMs(a); const db = getEventStartMs(b);
            return sortOrder === 'old' ? db - da : da - db;
        }
        let da = 0; let db = 0;
        if(a.pubDate) da = new Date(a.pubDate).getTime(); if(b.pubDate) db = new Date(b.pubDate).getTime();
        if (sortOrder === "old") return (isNaN(da) ? 0 : da) - (isNaN(db) ? 0 : db); 
        else return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da); 
    });

    filtered = limitDominantPublishersForSection(filtered, selPortal);

    if (activeKontinent === 'Radar') {
        const t = uiTexte[currentLang] || uiTexte.en;
        setTxt('event-filter-count', `${filtered.length} ${t.eventCount}`);
    }
    
    currentFilteredItems = filtered;
    currentlyDisplayedCount = 0;
    
    const container = document.getElementById('feed-container'); const archiveContainer = document.getElementById('archive-container');
    if(container) container.innerHTML = "";
    if(archiveContainer) archiveContainer.innerHTML = "";
    
    renderNextBatch();
}

function articleMediaLabel() {
    const labels = {
        en: 'Images from the original article',
        de: 'Bilder aus dem Originalartikel',
        es: 'Imágenes del artículo original',
        fr: 'Images de l’article original',
        it: 'Immagini dell’articolo originale',
        pt: 'Imagens do artigo original',
        ru: 'Изображения из оригинальной статьи',
        el: 'Εικόνες από το αρχικό άρθρο',
        tr: 'Özgün makaledeki görseller'
    };
    return labels[currentLang] || labels.en;
}

function articleMediaMarkup(item, idNum, heroUrl) {
    const seen = new Set(heroUrl ? [heroUrl] : []);
    const images = (Array.isArray(item?.images) ? item.images : [])
        .map(getSafeHttpUrl)
        .filter(url => {
            if (!url || seen.has(url)) return false;
            seen.add(url);
            return true;
        });
    if (!images.length) return '';
    const label = articleMediaLabel();
    return `
        <section class="article-inline-media" id="article-media-${idNum}" hidden aria-label="${escapeHtml(label)}">
            <div class="article-inline-media-label">${escapeHtml(label)}</div>
            <div class="article-inline-media-grid">
                ${images.map((url, imageIndex) => `
                    <img data-src="${escapeHtml(url)}" alt="${escapeHtml(`${item.title || label} · ${imageIndex + 1}`)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                `).join('')}
            </div>
        </section>
    `;
}

function loadArticleMedia(idNum) {
    const media = document.getElementById(`article-media-${idNum}`);
    if (!media) return;
    media.querySelectorAll('img[data-src]').forEach(image => {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
    });
    media.hidden = false;
}

// === DER REPARIERTE RENDER-BLOCK FÜR ABSÄTZE UND HTML-SCHUTZ ===
function renderNextBatch() {
    if (isRendering) return;
    isRendering = true;

    const container = document.getElementById('feed-container'); 
    const archiveContainer = document.getElementById('archive-container'); 
    const archiveTitle = document.getElementById('txt-archive-title');
    if(!container || !archiveContainer) { isRendering = false; return; }
    
    const batch = currentFilteredItems.slice(currentlyDisplayedCount, currentlyDisplayedCount + ITEMS_PER_PAGE);
    
    if (batch.length === 0 && currentlyDisplayedCount === 0) { 
        container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted); font-family:monospace;">[ NO DATA FOUND ]</div>`;
        isRendering = false; return; 
    } 

    const t = uiTexte[currentLang] || uiTexte['en'];
    let bookmarks = getSavedBookmarks(); let readList = getReadArticles();
    const today = new Date(); const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    let archiveCount = archiveContainer.children.length; 
    
    batch.forEach((item, batchIndex) => {
        const globalIndex = currentlyDisplayedCount + batchIndex;
        const isEvent = isEventArticle(item);
        let formatDatum = "LIVE"; let isOld = false;
        try {
            const dateValue = isEvent ? (item.eventStart || item.pubDate) : item.pubDate;
            if (dateValue) {
                const articleDate = new Date(dateValue);
                if (!isNaN(articleDate.getTime())) {
                    formatDatum = articleDate.toISOString().substring(0, 10);
                    if ((today - articleDate) > ninetyDaysMs) { isOld = true; }
                }
            }
        } catch(e) {}

        const fullText = item.content || "Text not available.";
        
        // NEU: Wandelt die Python-Zeilenumbrüche sicher in echte HTML-Absätze (<br>) um!
        const safeFullText = fullText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        
        let teaserText = fullText.substring(0, 100) + "...";
        try { const sentenceMatch = fullText.match(/[^.!?]+[.!?]+/); if(sentenceMatch) teaserText = sentenceMatch[0]; } catch(e) {}
        const safeTeaserText = teaserText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        const safeImageUrl = getSafeHttpUrl(item.image);
        const safeArticleUrl = getSafeHttpUrl(item.link);
        const encodedArticleLink = encodeText(item.link || '');
        const encodedArticleTitle = encodeText(item.title || '');
        const imgHtml = safeImageUrl
            ? `<img src="${escapeHtml(safeImageUrl)}" class="article-img" style="display:block;" loading="lazy" referrerpolicy="no-referrer" alt="${escapeHtml(item.title || '')}">`
            : '';
        const articleMediaHtml = articleMediaMarkup(item, globalIndex, safeImageUrl);

        let isSaved = window.WRNReading?.isBookmarked(item) ?? bookmarks.some(b => b.link === item.link);
        let bookmarkTxt = window.WRNReading?.bookmarkButtonHtml(isSaved) || (isSaved ? t.btnUnbookmark : t.btnBookmark);
        let isRead = window.WRNReading?.isRead(item) ?? readList.includes(item.link);
        let isReadClass = isRead ? "read" : "";
        const readStateTxt = window.WRNReading?.readButtonHtml(isRead) || (isRead ? '[ ✓ Read ]' : '[ ○ Mark read ]');
        const readingProgressHtml = window.WRNReading?.progressMarkup(item, globalIndex) || '';

        let publisherName = item.quelleName ? item.quelleName.trim() : "Unbekannte Quelle";
        let authorName = item.author ? item.author.trim() : "";
        const encodedPublisherName = encodeText(publisherName);
        const sourceNameHtml = window.WRNSourceProfiles
            ? `<button type="button" class="source-profile-link" onclick="openSourceProfileEncoded('${encodedPublisherName}')">${escapeHtml(publisherName)}</button>`
            : `<span style="color:var(--text-main);">${escapeHtml(publisherName)}</span>`;
        const editorialBadgesHtml = window.WRNSourceProfiles?.badgeMarkup(item, currentLang) || '';
        const contentTypeKey = window.WRNSourceProfiles?.classifyArticle(item)?.key || '';
        
        let isRadar = articleMatchesCategory(item, "Radar");
        // Der grüne Look für die Termine
        let cardStyle = isRadar ? `style="border: 1px solid var(--color-green); box-shadow: 0 0 15px rgba(0, 255, 0, 0.15);"` : "";
        let titleColor = isRadar ? `color: var(--color-green);` : "";
        const eventDetailsHtml = buildEventDetailsHtml(item, t, globalIndex);
        const cancelledClass = String(item.eventStatus || '').toLowerCase().includes('cancel') ? 'event-cancelled' : '';
        
        let metaHtml = `<span class="meta-label">${escapeHtml(t.publisherLabel)}</span> ${sourceNameHtml} <br>`;
        if (authorName !== "" && authorName.toLowerCase() !== "unknown" && authorName.toLowerCase() !== publisherName.toLowerCase()) {
            metaHtml += `<span class="meta-label">${escapeHtml(t.authorLabel)}</span> <span style="color:var(--text-main);">${escapeHtml(authorName)}</span> <br>`;
        }
        const metaDateText = isEvent ? formatEventDateRange(item) : formatDatum;
        metaHtml += `<span class="meta-label">${escapeHtml(isEvent ? t.eventStarts : t.dateLabel)}</span> <span style="color:var(--text-main);">${escapeHtml(metaDateText || formatDatum)}</span>`;

        let articleHTML = `
            <div class="card ${isReadClass} ${cancelledClass}" id="card-${globalIndex}" data-translated="none" data-content-type="${escapeHtml(contentTypeKey)}" data-article-key="${escapeHtml(window.WRNReading?.articleKey(item) || item.link || '')}" ${cardStyle}>
                <div class="meta">${metaHtml}</div>
                ${editorialBadgesHtml}
                ${readingProgressHtml}
                <div class="title" id="title-${globalIndex}" style="${titleColor}">${escapeHtml(item.title || 'No Title')}</div>
                <div class="translation-tools" id="translation-tools-${globalIndex}" hidden></div>
                ${eventDetailsHtml}
                ${imgHtml}
                <div class="teaser" id="teaser-${globalIndex}">${safeTeaserText}</div>
                <div class="full-content" id="content-${globalIndex}">${safeFullText}</div>
                ${articleMediaHtml}
                <div class="button-row">
                    <button class="btn-expand" id="expand-${globalIndex}" onclick="toggleArticle(${globalIndex}, event)">${t.btnExpand}</button>
                    <button class="btn-translate" id="btn-${globalIndex}" onclick="translateArticle(${globalIndex})"><span>[ ${t.btnTranslate} ]</span></button>
                    <button class="btn-translate btn-podcast" id="podcast-${globalIndex}" onclick="openPodcastOptions(${globalIndex})"><span>[ 🎧 ${escapeHtml(t.btnPodcast)} ]</span></button>
                    <button class="btn-translate btn-read-later ${isSaved ? 'is-bookmarked' : ''}" id="bmark-${globalIndex}" onclick="toggleBookmark(${globalIndex})" aria-pressed="${isSaved}">${bookmarkTxt}</button>
                    <button class="btn-translate btn-read-state ${isRead ? 'is-read' : ''}" id="readstate-${globalIndex}" onclick="toggleReadState(${globalIndex})" aria-pressed="${isRead}">${readStateTxt}</button>
                    <button class="btn-translate btn-zine-article ${isInZine(item) ? 'is-in-zine' : ''}" id="zine-${globalIndex}" onclick="toggleZine(${globalIndex})" aria-pressed="${isInZine(item)}">${escapeHtml(zineButtonLabel(item))}</button>
                    <button type="button" class="btn-translate" style="border-color: var(--color-cyan); color: var(--color-cyan);" onclick="shareArticle('${encodedArticleTitle}', '${encodedArticleLink}')">[ SHARE 🔗 ]</button>
                    ${safeArticleUrl ? `<a href="${escapeHtml(safeArticleUrl)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" class="btn-translate" style="border-color: var(--color-accent); color: var(--color-accent); text-decoration:none;">[ ${escapeHtml(t.btnReadMore)} ]</a>` : ''}
                </div>
            </div>
        `;

        if (isOld) { archiveContainer.insertAdjacentHTML('beforeend', articleHTML); archiveCount++; } 
        else { container.insertAdjacentHTML('beforeend', articleHTML); }

        getStoredFullTranslation(item, currentLang).then(stored => {
            if (
                stored?.text
                && currentFilteredItems[globalIndex] === item
                && document.getElementById(`card-${globalIndex}`)
            ) {
                applyFullTranslationToCard(globalIndex, stored);
            }
        }).catch(() => {});
    });

    if (archiveTitle) { if (archiveCount > 0) { archiveTitle.style.display = "block"; } else { archiveTitle.style.display = "none"; } }
    window.WRNReading?.decorateRenderedCards(currentFilteredItems, currentlyDisplayedCount, batch.length);
    updateZineUi();
    
    currentlyDisplayedCount += batch.length;
    isRendering = false;
}

function getShareUiText() {
    const messages = {
        en: { copied: 'Link copied.', failed: 'The link could not be copied.' },
        de: { copied: 'Link kopiert.', failed: 'Der Link konnte nicht kopiert werden.' },
        es: { copied: 'Enlace copiado.', failed: 'No se pudo copiar el enlace.' },
        fr: { copied: 'Lien copié.', failed: 'Impossible de copier le lien.' },
        it: { copied: 'Link copiato.', failed: 'Impossibile copiare il link.' },
        pt: { copied: 'Ligação copiada.', failed: 'Não foi possível copiar a ligação.' },
        ru: { copied: 'Ссылка скопирована.', failed: 'Не удалось скопировать ссылку.' },
        el: { copied: 'Ο σύνδεσμος αντιγράφηκε.', failed: 'Δεν ήταν δυνατή η αντιγραφή του συνδέσμου.' },
        tr: { copied: 'Bağlantı kopyalandı.', failed: 'Bağlantı kopyalanamadı.' }
    };
    return messages[currentLang] || messages.en;
}

function getShareableArticleUrl(value) {
    const originalUrl = getSafeHttpUrl(value);
    if (originalUrl) return originalUrl;
    try {
        const appUrl = new URL(window.location.href);
        appUrl.hash = '';
        return appUrl.href;
    } catch {
        return '';
    }
}

async function copyShareUrl(url) {
    if (!url) return false;
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
    }

    const field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand?.('copy') === true;
    field.remove();
    return copied;
}

async function shareArticle(encodedTitle, encodedLink) {
    try {
        const title = decodeText(encodedTitle);
        const link = getShareableArticleUrl(decodeText(encodedLink));
        if (!link) throw new Error('No shareable URL');

        if (navigator.share) {
            try {
                await navigator.share({ title, url: link });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }

        const copied = await copyShareUrl(link);
        alert(copied ? getShareUiText().copied : getShareUiText().failed);
    } catch {
        alert(getShareUiText().failed);
    }
}

// === DER REPARIERTE KLICK-BLOCK ===
async function toggleArticle(idNum, event) {
    if (event) event.stopPropagation(); // <-- Verhindert das automatische Schließen
    
    const teaser = document.getElementById(`teaser-${idNum}`); 
    const fullContent = document.getElementById(`content-${idNum}`);
    const btn = document.getElementById(`expand-${idNum}`); 
    const card = document.getElementById(`card-${idNum}`);
    if(!teaser || !fullContent || !btn || !card) return;
    const t = uiTexte[currentLang] || uiTexte['en'];

    const article = currentFilteredItems[idNum];

    if (card.dataset.expanded === "true") {
        window.WRNReading?.onCollapse(idNum, article, fullContent);
        teaser.style.display = "block"; fullContent.style.display = "none";
        const media = document.getElementById(`article-media-${idNum}`);
        if (media) media.hidden = true;
        btn.innerText = t.btnExpand; card.dataset.expanded = "false";
    } else {
        const needsFullText = Boolean(
            article?.detailPath
            && article?.detailHydrated !== true
            && (article?.webFeedTruncated || article?.contentComplete === false)
        );
        if (needsFullText) {
            btn.disabled = true;
            btn.setAttribute('aria-busy', 'true');
            const originalLabel = btn.innerText;
            btn.innerText = currentLang === 'de' ? 'Volltext wird geladen …' : 'Loading full article …';
            const previousLength = String(article.content || '').length;
            await hydrateArticleContent(article);
            if (String(article.content || '').length > previousLength) {
                fullContent.textContent = article.content;
            }
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
            btn.innerText = originalLabel;
        }
        teaser.style.display = "none"; fullContent.style.display = "block";
        loadArticleMedia(idNum);
        btn.innerText = t.btnCollapse; card.dataset.expanded = "true";
        window.WRNReading?.onExpand(idNum, article, card, fullContent);
        if (card.dataset.translated === 'teaser' && card.dataset.translationLanguage === currentLang) {
            window.setTimeout(() => translateArticle(idNum), 0);
        }
    }
}


async function translateArticle(idNum) {
    const titleEl = document.getElementById(`title-${idNum}`);
    const teaserEl = document.getElementById(`teaser-${idNum}`);
    const contentEl = document.getElementById(`content-${idNum}`);
    const btnEl = document.getElementById(`btn-${idNum}`);
    const card = document.getElementById(`card-${idNum}`);
    const article = currentFilteredItems[idNum];

    if (!titleEl || !teaserEl || !contentEl || !btnEl || !card || !article) return;
    const t = uiTexte[currentLang] || uiTexte.en;

    if (card.dataset.translated === 'translating') return;
    if (card.dataset.translated === 'full' && card.dataset.translationLanguage === currentLang) return;

    card.dataset.translated = 'translating';
    btnEl.disabled = true;
    btnEl.classList.add('is-loading');

    try {
        const isExpanded = card.dataset.expanded === 'true' || contentEl.style.display === 'block';
        if (!isExpanded) {
            btnEl.innerHTML = `${starSpinner} <span style="margin-left: 8px;">[ ${t.btnLoading} ]</span>`;

            const originalText = String(article.content || '').trim();
            let originalTeaser = originalText.slice(0, 500);
            const sentence = originalText.match(/[^.!?]+[.!?]+/)?.[0];
            if (sentence) originalTeaser = sentence;

            const result = await fetchTranslationRequest({
                title: article.title || "",
                text: originalTeaser,
                mode: "title_and_text"
            });

            if (result.error || !result.text) {
                showTranslationError(btnEl, card, result);
                return;
            }

            const parsed = parseTranslatedTitleAndText(result.text, article.title || '');
            if (parsed.title) titleEl.textContent = parsed.title;
            if (parsed.text) teaserEl.textContent = parsed.text;
            titleEl.classList.add('translated');
            btnEl.innerHTML = `[ ${t.btnDone} ]`;
            btnEl.removeAttribute('title');
            card.dataset.translated = 'teaser';
            card.dataset.translationLanguage = currentLang;
            window.WRNSourceProfiles?.markTranslated(card, article, currentLang);
            window.WRNTranslationTools?.registerTranslation(idNum, article, {
                title: parsed.title,
                teaser: parsed.text,
                text: '',
                language: currentLang,
                provider: result.provider || '',
                translatedAt: new Date().toISOString()
            }, 'teaser');
            return;
        }

        btnEl.innerHTML = `${starSpinner} <span style="margin-left: 8px;">[ ${t.btnLoading} ]</span>`;
        const result = await translateFullArticleForLanguage(idNum, (current, total) => {
            const progressText = total > 1 ? `[ ${t.btnLoading} ${current}/${total} ]` : `[ ${t.btnLoading} ]`;
            btnEl.innerHTML = `${starSpinner} <span style="margin-left: 8px;">${progressText}</span>`;
        });

        if (result.error || !result.text) {
            showTranslationError(btnEl, card, result);
            return;
        }

        applyFullTranslationToCard(idNum, result);
    } catch (error) {
        showTranslationError(btnEl, card, {
            message: error?.message || String(error)
        });
    } finally {
        btnEl.disabled = false;
        btnEl.classList.remove('is-loading');
    }
}

function additionalArticleLoadingIsRequested() {
    let rangeState = null;
    try { rangeState = window.WRNInterfaceBlock3?.state?.(); } catch {}
    const search = String(document.getElementById('search-input')?.value || '').trim();
    return Boolean(
        Number(rangeState?.appliedDays || 0) > 0
        || String(currentSourceFilter || 'ALL') !== 'ALL'
        || search
        || ['Bookmarks', 'Read', 'Radar'].includes(String(activeKontinent || ''))
    );
}

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
        if (
            additionalArticleLoadingIsRequested()
            && currentlyDisplayedCount < currentFilteredItems.length
        ) {
            renderNextBatch();
        }
    }
});

window.addEventListener('offline', () => {
    const status = document.getElementById('status-container');
    if (status) {
        status.style.color = 'var(--color-accent)';
        status.textContent = currentLang === 'de'
            ? 'Offline: Gespeicherte Nachrichten und Events bleiben verfügbar.'
            : 'Offline: Saved news and events remain available.';
    }
});

window.addEventListener('online', () => {
    const status = document.getElementById('status-container');
    if (status) {
        status.style.color = 'var(--color-green)';
        status.textContent = currentLang === 'de'
            ? 'Wieder online. Daten werden beim nächsten Laden aktualisiert.'
            : 'Back online. Data will refresh on the next load.';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    try {
        let savedZoom = localStorage.getItem('wrn_font_zoom') || "115";
        changeFontSize(savedZoom);
        const fsSelect = document.getElementById('ui-fontsize');
        if (fsSelect) fsSelect.value = savedZoom;

        const savedLang = localStorage.getItem('wrn_system_lang'); const ls = document.getElementById('ui-language');
        if (savedLang && ls) { ls.value = savedLang; }
        
        window.WRNAccessibility?.init();
        const savedTheme = window.WRNAccessibility?.getTheme?.() || localStorage.getItem('wrn_theme_style') || 'theme-dark';
        const ut = document.getElementById('ui-theme'); if (ut) ut.value = savedTheme;
        window.WRNStatusCenter?.init();
        window.WRNReading?.init();
        changeTheme(savedTheme); changeLanguage(); initializePodcast(); updateSharedPodcastUiText(); updateZineUi(); initialisiereApp(); 

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    registration.update().catch(() => {});
                })
                .catch(error => {
                    console.warn('Service Worker konnte nicht registriert werden:', error);
                });
        }
    } catch (e) {
        const stat = document.getElementById('status-container');
        if(stat) stat.innerText = "Kritischer Start-Fehler: " + e.message;
    }
});

window.addEventListener('wrnzinechange', () => {
    zineArticles = loadZineArticles();
    updateZineUi();
});
