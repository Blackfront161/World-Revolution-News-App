/* World Revolution News 2.0 – datensparsames Aktionsradar */
'use strict';

(() => {
    if (window.WRNActionRadar) return;

    const STORAGE_KEY = 'wrn_event_reminders_v2';
    const state = {
        mode: 'all',
        position: null,
        radiusKm: 50,
        reminderOffsetHours: 24,
        mapRows: [],
        timer: 0
    };

    const TEXT = {
        de: { title:'Aktionsradar', all:'Alle Termine', nearby:'In der Nähe', reminders:'Erinnerungen', map:'Kartenansicht', useLocation:'Standort verwenden', locationReady:'Standort nur auf diesem Gerät aktiv', locationHint:'Dein Standort wird nur im Browser für die Entfernung berechnet und nicht übertragen.', radius:'Umkreis', remind:'Erinnern', reminded:'Erinnerung aktiv', reminderHint:'Erinnerungen werden lokal gespeichert und beim Öffnen der App geprüft.', mapTitle:'Kartenansicht der Termine', mapHint:'Schematische Übersicht. Öffne einen Punkt für die genaue Karte bei OpenStreetMap.', close:'Schließen', noCoordinates:'Für die aktuelle Auswahl sind keine Termine mit Koordinaten vorhanden.', locationError:'Der Standort konnte nicht gelesen werden. Du kannst Termine weiterhin nach Land und Stadt filtern.', permissionDenied:'Benachrichtigungen sind nicht freigegeben. Die Erinnerung bleibt trotzdem lokal gespeichert.', due:'Demnächst', distance:'Entfernung', hoursBefore:'vorher' },
        en: { title:'Action radar', all:'All events', nearby:'Nearby', reminders:'Reminders', map:'Map view', useLocation:'Use location', locationReady:'Location active on this device only', locationHint:'Your location is only used in the browser to calculate distance and is not transmitted.', radius:'Radius', remind:'Remind me', reminded:'Reminder active', reminderHint:'Reminders are stored locally and checked when the app opens.', mapTitle:'Event map', mapHint:'Schematic overview. Open a point for the exact map at OpenStreetMap.', close:'Close', noCoordinates:'No events with coordinates are available for this selection.', locationError:'Your location could not be read. You can still filter events by country and city.', permissionDenied:'Notifications are not allowed. The reminder remains stored locally.', due:'Coming up', distance:'Distance', hoursBefore:'before' },
        es: { title:'Radar de acciones', all:'Todos los eventos', nearby:'Cerca', reminders:'Recordatorios', map:'Vista de mapa', useLocation:'Usar ubicación', locationReady:'Ubicación activa solo en este dispositivo', locationHint:'Tu ubicación solo se usa en el navegador para calcular la distancia y no se transmite.', radius:'Radio', remind:'Recordar', reminded:'Recordatorio activo', reminderHint:'Los recordatorios se guardan localmente y se comprueban al abrir la aplicación.', mapTitle:'Mapa de eventos', mapHint:'Vista esquemática. Abre un punto para ver el mapa exacto en OpenStreetMap.', close:'Cerrar', noCoordinates:'No hay eventos con coordenadas para esta selección.', locationError:'No se pudo leer tu ubicación.', permissionDenied:'Las notificaciones no están permitidas. El recordatorio sigue guardado localmente.', due:'Próximamente', distance:'Distancia', hoursBefore:'antes' },
        fr: { title:'Radar des actions', all:'Tous les événements', nearby:'À proximité', reminders:'Rappels', map:'Vue carte', useLocation:'Utiliser la position', locationReady:'Position active uniquement sur cet appareil', locationHint:'Votre position sert uniquement au calcul de distance dans le navigateur et n’est pas transmise.', radius:'Rayon', remind:'Rappeler', reminded:'Rappel actif', reminderHint:'Les rappels sont stockés localement et vérifiés à l’ouverture.', mapTitle:'Carte des événements', mapHint:'Vue schématique. Ouvrez un point pour la carte exacte sur OpenStreetMap.', close:'Fermer', noCoordinates:'Aucun événement avec coordonnées pour cette sélection.', locationError:'La position n’a pas pu être lue.', permissionDenied:'Les notifications ne sont pas autorisées. Le rappel reste enregistré localement.', due:'À venir', distance:'Distance', hoursBefore:'avant' },
        it: { title:'Radar delle azioni', all:'Tutti gli eventi', nearby:'Nelle vicinanze', reminders:'Promemoria', map:'Vista mappa', useLocation:'Usa posizione', locationReady:'Posizione attiva solo su questo dispositivo', locationHint:'La posizione viene usata solo nel browser per calcolare la distanza e non viene trasmessa.', radius:'Raggio', remind:'Ricorda', reminded:'Promemoria attivo', reminderHint:'I promemoria sono salvati localmente e controllati all’apertura.', mapTitle:'Mappa degli eventi', mapHint:'Vista schematica. Apri un punto per la mappa esatta su OpenStreetMap.', close:'Chiudi', noCoordinates:'Nessun evento con coordinate per questa selezione.', locationError:'Impossibile leggere la posizione.', permissionDenied:'Le notifiche non sono consentite. Il promemoria resta salvato localmente.', due:'In arrivo', distance:'Distanza', hoursBefore:'prima' },
        pt: { title:'Radar de ações', all:'Todos os eventos', nearby:'Perto', reminders:'Lembretes', map:'Vista do mapa', useLocation:'Usar localização', locationReady:'Localização ativa apenas neste dispositivo', locationHint:'A localização só é usada no navegador para calcular a distância e não é transmitida.', radius:'Raio', remind:'Lembrar', reminded:'Lembrete ativo', reminderHint:'Os lembretes são guardados localmente e verificados ao abrir a aplicação.', mapTitle:'Mapa de eventos', mapHint:'Vista esquemática. Abra um ponto para o mapa exato no OpenStreetMap.', close:'Fechar', noCoordinates:'Não há eventos com coordenadas nesta seleção.', locationError:'Não foi possível ler a localização.', permissionDenied:'As notificações não estão autorizadas. O lembrete continua guardado localmente.', due:'Em breve', distance:'Distância', hoursBefore:'antes' },
        ru: { title:'Радар акций', all:'Все события', nearby:'Рядом', reminders:'Напоминания', map:'Карта', useLocation:'Использовать местоположение', locationReady:'Местоположение активно только на этом устройстве', locationHint:'Местоположение используется только в браузере для расчёта расстояния и не передаётся.', radius:'Радиус', remind:'Напомнить', reminded:'Напоминание включено', reminderHint:'Напоминания хранятся локально и проверяются при открытии приложения.', mapTitle:'Карта событий', mapHint:'Схематичный обзор. Откройте точку для точной карты OpenStreetMap.', close:'Закрыть', noCoordinates:'Нет событий с координатами.', locationError:'Не удалось получить местоположение.', permissionDenied:'Уведомления не разрешены. Напоминание всё равно сохранено локально.', due:'Скоро', distance:'Расстояние', hoursBefore:'до начала' },
        el: { title:'Ραντάρ δράσεων', all:'Όλες οι εκδηλώσεις', nearby:'Κοντά', reminders:'Υπενθυμίσεις', map:'Προβολή χάρτη', useLocation:'Χρήση τοποθεσίας', locationReady:'Η τοποθεσία είναι ενεργή μόνο σε αυτή τη συσκευή', locationHint:'Η τοποθεσία χρησιμοποιείται μόνο στον περιηγητή για τον υπολογισμό απόστασης και δεν μεταδίδεται.', radius:'Ακτίνα', remind:'Υπενθύμιση', reminded:'Ενεργή υπενθύμιση', reminderHint:'Οι υπενθυμίσεις αποθηκεύονται τοπικά και ελέγχονται κατά το άνοιγμα.', mapTitle:'Χάρτης εκδηλώσεων', mapHint:'Σχηματική προβολή. Ανοίξτε ένα σημείο για τον ακριβή χάρτη OpenStreetMap.', close:'Κλείσιμο', noCoordinates:'Δεν υπάρχουν εκδηλώσεις με συντεταγμένες.', locationError:'Δεν ήταν δυνατή η ανάγνωση της τοποθεσίας.', permissionDenied:'Οι ειδοποιήσεις δεν επιτρέπονται. Η υπενθύμιση παραμένει αποθηκευμένη.', due:'Σύντομα', distance:'Απόσταση', hoursBefore:'νωρίτερα' },
        tr: { title:'Eylem radarı', all:'Tüm etkinlikler', nearby:'Yakınımda', reminders:'Hatırlatıcılar', map:'Harita görünümü', useLocation:'Konumu kullan', locationReady:'Konum yalnızca bu cihazda etkin', locationHint:'Konumunuz yalnızca tarayıcıda mesafeyi hesaplamak için kullanılır ve aktarılmaz.', radius:'Yarıçap', remind:'Hatırlat', reminded:'Hatırlatıcı etkin', reminderHint:'Hatırlatıcılar yerel olarak saklanır ve uygulama açıldığında kontrol edilir.', mapTitle:'Etkinlik haritası', mapHint:'Şematik görünüm. OpenStreetMap’te tam harita için bir noktayı açın.', close:'Kapat', noCoordinates:'Koordinatlı etkinlik bulunmuyor.', locationError:'Konum okunamadı.', permissionDenied:'Bildirimlere izin verilmedi. Hatırlatıcı yine de yerel olarak saklandı.', due:'Yakında', distance:'Mesafe', hoursBefore:'önce' }
    };

    const lang = () => {
        const raw = document.getElementById('ui-language')?.value
            || document.documentElement.lang || 'en';
        const code = String(raw).toLowerCase().split(/[-_]/)[0];
        return TEXT[code] ? code : 'en';
    };
    const t = () => TEXT[lang()] || TEXT.en;
    const escapeHtml = value => String(value ?? '')
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    const safeNumber = value => {
        const number = Number(String(value ?? '').replace(',', '.'));
        return Number.isFinite(number) ? number : null;
    };
    const coordinatesOf = article => {
        const latitude = safeNumber(article?.eventLatitude);
        const longitude = safeNumber(article?.eventLongitude);
        return latitude !== null && longitude !== null
            && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
            ? { latitude, longitude } : null;
    };
    const distanceKm = (left, right) => {
        if (!left || !right) return null;
        const radians = value => value * Math.PI / 180;
        const deltaLatitude = radians(right.latitude - left.latitude);
        const deltaLongitude = radians(right.longitude - left.longitude);
        const a = Math.sin(deltaLatitude / 2) ** 2
            + Math.cos(radians(left.latitude))
            * Math.cos(radians(right.latitude))
            * Math.sin(deltaLongitude / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    const eventId = article => {
        const raw = `${article?.link || ''}|${article?.title || ''}|${article?.eventStart || article?.pubDate || ''}`;
        let hash = 2166136261;
        for (let index = 0; index < raw.length; index += 1) {
            hash ^= raw.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return `event-${(hash >>> 0).toString(16)}`;
    };
    const readReminders = () => {
        try {
            const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(rows) ? rows.filter(row => row?.id) : [];
        } catch {
            return [];
        }
    };
    const writeReminders = rows => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(-100)));
        updateControls();
    };
    const reminderFor = article => readReminders().find(row => row.id === eventId(article));

    const matches = article => {
        if (state.mode === 'reminders') return Boolean(reminderFor(article));
        if (state.mode !== 'nearby') return true;
        const eventPosition = coordinatesOf(article);
        const distance = distanceKm(state.position, eventPosition);
        return distance !== null && distance <= state.radiusKm;
    };

    const requestLocation = () => new Promise(resolve => {
        if (!navigator.geolocation) {
            alert(t().locationError);
            resolve(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(position => {
            state.position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            state.mode = 'nearby';
            updateControls();
            if (typeof window.applyFilters === 'function') window.applyFilters();
            resolve(true);
        }, () => {
            alert(t().locationError);
            resolve(false);
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    });

    const selectMode = async mode => {
        if (mode === 'nearby' && !state.position) {
            if (!await requestLocation()) return;
        } else {
            state.mode = mode;
            updateControls();
            if (typeof window.applyFilters === 'function') window.applyFilters();
        }
    };

    const toggleReminder = async article => {
        if (!article) return;
        const id = eventId(article);
        const rows = readReminders();
        const existingIndex = rows.findIndex(row => row.id === id);
        if (existingIndex >= 0) {
            rows.splice(existingIndex, 1);
        } else {
            const start = typeof window.getEventStartMs === 'function'
                ? window.getEventStartMs(article)
                : new Date(article.eventStart || article.pubDate || '').getTime();
            rows.push({
                id,
                title: String(article.title || ''),
                link: String(article.link || ''),
                start: Number(start || 0),
                remindAt: Math.max(Date.now(), Number(start || Date.now()) - state.reminderOffsetHours * 3600000),
                notified: false
            });
            if ('Notification' in window && Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') alert(t().permissionDenied);
            } else if ('Notification' in window && Notification.permission === 'denied') {
                alert(t().permissionDenied);
            }
        }
        writeReminders(rows);
        if (typeof window.applyFilters === 'function') window.applyFilters();
    };

    const notifyDue = async () => {
        const now = Date.now();
        const rows = readReminders();
        let changed = false;
        for (const row of rows) {
            if (row.notified || !row.remindAt || row.remindAt > now || (row.start && row.start < now - 7200000)) continue;
            row.notified = true;
            changed = true;
            if ('Notification' in window && Notification.permission === 'granted') {
                const options = { body: new Date(row.start).toLocaleString(lang()), tag: row.id, data: { url: row.link } };
                try {
                    const registration = await navigator.serviceWorker?.ready;
                    if (registration?.showNotification) await registration.showNotification(`${t().due}: ${row.title}`, options);
                    else new Notification(`${t().due}: ${row.title}`, options);
                } catch {
                    new Notification(`${t().due}: ${row.title}`, options);
                }
            }
        }
        if (changed) writeReminders(rows);
    };

    const updateControls = () => {
        const root = document.getElementById('wrn-action-radar');
        if (!root) return;
        const labels = t();
        root.querySelector('[data-label="title"]').textContent = labels.title;
        root.querySelector('[data-label="hint"]').textContent = state.position ? labels.locationReady : labels.locationHint;
        root.querySelectorAll('[data-mode]').forEach(button => {
            button.classList.toggle('active', button.dataset.mode === state.mode);
            button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
        });
        root.querySelector('[data-mode="all"]').textContent = labels.all;
        root.querySelector('[data-mode="nearby"]').textContent = labels.nearby;
        root.querySelector('[data-mode="reminders"]').textContent = `${labels.reminders} (${readReminders().length})`;
        root.querySelector('[data-action="map"]').textContent = labels.map;
        root.querySelector('[data-action="location"]').textContent = labels.useLocation;
        root.querySelector('[data-label="radius"]').textContent = labels.radius;
        root.querySelector('[data-label="reminder"]').textContent = labels.reminderHint;
    };

    const ensureControls = () => {
        const panel = document.getElementById('event-filter-panel');
        if (!panel || document.getElementById('wrn-action-radar')) return;
        const root = document.createElement('section');
        root.id = 'wrn-action-radar';
        root.className = 'wrn-action-radar';
        root.innerHTML = `
            <div class="wrn-action-radar-head">
                <div><strong data-label="title"></strong><small data-label="hint"></small></div>
                <button type="button" data-action="map"></button>
            </div>
            <div class="wrn-action-radar-modes" role="group">
                <button type="button" data-mode="all"></button>
                <button type="button" data-mode="nearby"></button>
                <button type="button" data-mode="reminders"></button>
            </div>
            <div class="wrn-action-radar-options">
                <button type="button" data-action="location"></button>
                <label><span data-label="radius"></span>
                    <select data-control="radius">
                        <option value="10">10 km</option><option value="25">25 km</option>
                        <option value="50" selected>50 km</option><option value="100">100 km</option>
                        <option value="250">250 km</option>
                    </select>
                </label>
                <label><span>⏰</span>
                    <select data-control="offset">
                        <option value="2">2 h</option><option value="24" selected>24 h</option>
                        <option value="48">48 h</option><option value="168">7 d</option>
                    </select>
                </label>
            </div>
            <p data-label="reminder"></p>`;
        panel.prepend(root);
        root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => void selectMode(button.dataset.mode)));
        root.querySelector('[data-action="location"]').addEventListener('click', () => void requestLocation());
        root.querySelector('[data-action="map"]').addEventListener('click', openMap);
        root.querySelector('[data-control="radius"]').addEventListener('change', event => {
            state.radiusKm = Number(event.target.value) || 50;
            if (state.mode === 'nearby' && typeof window.applyFilters === 'function') window.applyFilters();
        });
        root.querySelector('[data-control="offset"]').addEventListener('change', event => {
            state.reminderOffsetHours = Number(event.target.value) || 24;
        });
        updateControls();
    };

    const openMap = async () => {
        const modal = ensureMapModal();
        modal.hidden = false;
        document.documentElement.classList.add('wrn-action-map-open');
        const canvas = modal.querySelector('.wrn-action-map-canvas');
        const list = modal.querySelector('.wrn-action-map-list');
        canvas.innerHTML = '';
        list.textContent = '';
        try {
            const url = window.WRN_CONFIG?.dataUrls?.events || './events.json';
            const response = await fetch(url, { headers: { Accept: 'application/json' } });
            const data = await response.json();
            const now = Date.now() - 7200000;
            state.mapRows = (Array.isArray(data) ? data : data.items || [])
                .filter(row => coordinatesOf(row) && new Date(row.eventEnd || row.eventStart || row.pubDate || 0).getTime() >= now)
                .filter(row => state.mode !== 'nearby' || matches(row))
                .slice(0, 120);
            renderMapRows(canvas, list);
        } catch (error) {
            list.textContent = t().noCoordinates;
        }
    };

    const renderMapRows = (canvas, list) => {
        const rows = state.mapRows;
        if (!rows.length) {
            list.textContent = t().noCoordinates;
            return;
        }
        rows.forEach((row, index) => {
            const point = coordinatesOf(row);
            const x = ((point.longitude + 180) / 360) * 100;
            const latitudeRadians = point.latitude * Math.PI / 180;
            const mercator = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
            const y = Math.max(3, Math.min(97, (1 - mercator / Math.PI) / 2 * 100));
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'wrn-action-map-point';
            button.style.left = `${x}%`;
            button.style.top = `${y}%`;
            button.title = String(row.title || '');
            button.setAttribute('aria-label', String(row.title || 'Event'));
            button.addEventListener('click', () => {
                list.innerHTML = `<strong>${escapeHtml(row.title || '')}</strong><span>${escapeHtml([row.eventCity, row.eventCountry].filter(Boolean).join(' · '))}</span><a target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=14/${point.latitude}/${point.longitude}">${escapeHtml(t().map)}</a>`;
            });
            canvas.append(button);
            if (index === 0) button.click();
        });
    };

    const ensureMapModal = () => {
        let modal = document.getElementById('wrn-action-map-modal');
        if (modal) {
            modal.querySelector('h2').textContent = t().mapTitle;
            modal.querySelector('.wrn-action-map-hint').textContent = t().mapHint;
            modal.querySelector('[data-action="close"]').textContent = t().close;
            return modal;
        }
        modal = document.createElement('section');
        modal.id = 'wrn-action-map-modal';
        modal.className = 'wrn-action-map-modal';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `<header><div><h2></h2><p class="wrn-action-map-hint"></p></div><button type="button" data-action="close"></button></header><div class="wrn-action-map-canvas" role="img"></div><div class="wrn-action-map-list" aria-live="polite"></div>`;
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.hidden = true;
            document.documentElement.classList.remove('wrn-action-map-open');
        });
        document.body.append(modal);
        return ensureMapModal();
    };

    const installHooks = () => {
        if (typeof window.eventMatchesSpecialFilters === 'function' && !window.eventMatchesSpecialFilters.__wrnRadar) {
            const original = window.eventMatchesSpecialFilters;
            const wrapped = article => original(article) && matches(article);
            wrapped.__wrnRadar = true;
            window.eventMatchesSpecialFilters = wrapped;
        }
        if (typeof window.buildEventActionButtons === 'function' && !window.buildEventActionButtons.__wrnRadar) {
            const original = window.buildEventActionButtons;
            const wrapped = (article, itemIndex) => {
                const base = original(article, itemIndex);
                if (!Number.isInteger(itemIndex)) return base;
                const active = Boolean(reminderFor(article));
                const label = active ? t().reminded : t().remind;
                return `${base}<div class="event-action-row wrn-reminder-row"><button type="button" class="event-action-button reminder${active ? ' active' : ''}" onclick="WRNActionRadar.toggleReminderByIndex(${itemIndex})">★ ${escapeHtml(label)}</button></div>`;
            };
            wrapped.__wrnRadar = true;
            window.buildEventActionButtons = wrapped;
        }
        if (typeof window.buildEventDetailsHtml === 'function' && !window.buildEventDetailsHtml.__wrnRadar) {
            const original = window.buildEventDetailsHtml;
            const wrapped = (article, labels, itemIndex) => {
                const base = original(article, labels, itemIndex);
                const value = distanceKm(state.position, coordinatesOf(article));
                return value === null ? base : `${base}<p class="wrn-event-distance">${escapeHtml(t().distance)}: <strong>${value < 10 ? value.toFixed(1) : Math.round(value)} km</strong></p>`;
            };
            wrapped.__wrnRadar = true;
            window.buildEventDetailsHtml = wrapped;
        }
    };

    const toggleReminderByIndex = index => {
        const article = typeof window.getEventByIndex === 'function' ? window.getEventByIndex(index) : null;
        return toggleReminder(article);
    };

    const init = () => {
        installHooks();
        ensureControls();
        ensureMapModal();
        void notifyDue();
        state.timer = window.setInterval(notifyDue, 60000);
        document.getElementById('ui-language')?.addEventListener('change', () => {
            updateControls();
            ensureMapModal();
        });
    };

    window.WRNActionRadar = Object.freeze({
        selectMode,
        requestLocation,
        openMap,
        toggleReminderByIndex,
        reminders: () => readReminders().map(row => ({ ...row })),
        distanceKm
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
