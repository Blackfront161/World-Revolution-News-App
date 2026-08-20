/* World Revolution News – Eventlogik und Event-QoL, Phase 1D */
'use strict';

const WRN_EVENT_FILTER_STORAGE_KEY = 'wrn_saved_event_filters_v1';

const WRN_EVENT_TEXTS = {
    en: { today:'TODAY', tomorrow:'TOMORROW', live:'HAPPENING NOW', cancelled:'CANCELLED', changed:'UPDATED', calendar:'Add to calendar', map:'Show on map', route:'Open route', saveFilter:'Save filter', deleteFilter:'Delete', savedFilters:'Saved filters', filterName:'Name for this event filter:', filterSaved:'Filter saved.', filterDeleted:'Filter deleted.', noLocation:'No usable location is available.', calendarError:'The calendar file could not be created.' },
    de: { today:'HEUTE', tomorrow:'MORGEN', live:'LÄUFT GERADE', cancelled:'ABGESAGT', changed:'AKTUALISIERT', calendar:'Zum Kalender', map:'Auf Karte', route:'Route öffnen', saveFilter:'Filter speichern', deleteFilter:'Löschen', savedFilters:'Gespeicherte Filter', filterName:'Name für diesen Event-Filter:', filterSaved:'Filter gespeichert.', filterDeleted:'Filter gelöscht.', noLocation:'Für dieses Event ist kein nutzbarer Ort hinterlegt.', calendarError:'Die Kalenderdatei konnte nicht erstellt werden.' },
    es: { today:'HOY', tomorrow:'MAÑANA', live:'EN CURSO', cancelled:'CANCELADO', changed:'ACTUALIZADO', calendar:'Añadir al calendario', map:'Ver en el mapa', route:'Abrir ruta', saveFilter:'Guardar filtro', deleteFilter:'Eliminar', savedFilters:'Filtros guardados', filterName:'Nombre para este filtro de eventos:', filterSaved:'Filtro guardado.', filterDeleted:'Filtro eliminado.', noLocation:'No hay una ubicación utilizable.', calendarError:'No se pudo crear el archivo de calendario.' },
    fr: { today:'AUJOURD’HUI', tomorrow:'DEMAIN', live:'EN COURS', cancelled:'ANNULÉ', changed:'MIS À JOUR', calendar:'Ajouter au calendrier', map:'Voir sur la carte', route:'Ouvrir l’itinéraire', saveFilter:'Enregistrer le filtre', deleteFilter:'Supprimer', savedFilters:'Filtres enregistrés', filterName:'Nom de ce filtre d’événements :', filterSaved:'Filtre enregistré.', filterDeleted:'Filtre supprimé.', noLocation:'Aucun lieu exploitable n’est disponible.', calendarError:'Le fichier calendrier n’a pas pu être créé.' },
    it: { today:'OGGI', tomorrow:'DOMANI', live:'IN CORSO', cancelled:'ANNULLATO', changed:'AGGIORNATO', calendar:'Aggiungi al calendario', map:'Mostra sulla mappa', route:'Apri percorso', saveFilter:'Salva filtro', deleteFilter:'Elimina', savedFilters:'Filtri salvati', filterName:'Nome per questo filtro eventi:', filterSaved:'Filtro salvato.', filterDeleted:'Filtro eliminato.', noLocation:'Non è disponibile una posizione utilizzabile.', calendarError:'Impossibile creare il file calendario.' },
    pt: { today:'HOJE', tomorrow:'AMANHÃ', live:'A DECORRER', cancelled:'CANCELADO', changed:'ATUALIZADO', calendar:'Adicionar ao calendário', map:'Mostrar no mapa', route:'Abrir rota', saveFilter:'Guardar filtro', deleteFilter:'Eliminar', savedFilters:'Filtros guardados', filterName:'Nome deste filtro de eventos:', filterSaved:'Filtro guardado.', filterDeleted:'Filtro eliminado.', noLocation:'Não existe uma localização utilizável.', calendarError:'Não foi possível criar o ficheiro de calendário.' },
    ru: { today:'СЕГОДНЯ', tomorrow:'ЗАВТРА', live:'ИДЁТ СЕЙЧАС', cancelled:'ОТМЕНЕНО', changed:'ОБНОВЛЕНО', calendar:'Добавить в календарь', map:'Показать на карте', route:'Открыть маршрут', saveFilter:'Сохранить фильтр', deleteFilter:'Удалить', savedFilters:'Сохранённые фильтры', filterName:'Название фильтра событий:', filterSaved:'Фильтр сохранён.', filterDeleted:'Фильтр удалён.', noLocation:'Подходящее местоположение отсутствует.', calendarError:'Не удалось создать файл календаря.' },
    el: { today:'ΣΗΜΕΡΑ', tomorrow:'ΑΥΡΙΟ', live:'ΣΕ ΕΞΕΛΙΞΗ', cancelled:'ΑΚΥΡΩΘΗΚΕ', changed:'ΕΝΗΜΕΡΩΘΗΚΕ', calendar:'Προσθήκη στο ημερολόγιο', map:'Προβολή στον χάρτη', route:'Άνοιγμα διαδρομής', saveFilter:'Αποθήκευση φίλτρου', deleteFilter:'Διαγραφή', savedFilters:'Αποθηκευμένα φίλτρα', filterName:'Όνομα φίλτρου εκδηλώσεων:', filterSaved:'Το φίλτρο αποθηκεύτηκε.', filterDeleted:'Το φίλτρο διαγράφηκε.', noLocation:'Δεν υπάρχει διαθέσιμη τοποθεσία.', calendarError:'Δεν ήταν δυνατή η δημιουργία αρχείου ημερολογίου.' },
    tr: { today:'BUGÜN', tomorrow:'YARIN', live:'ŞİMDİ DEVAM EDİYOR', cancelled:'İPTAL EDİLDİ', changed:'GÜNCELLENDİ', calendar:'Takvime ekle', map:'Haritada göster', route:'Rotayı aç', saveFilter:'Filtreyi kaydet', deleteFilter:'Sil', savedFilters:'Kayıtlı filtreler', filterName:'Bu etkinlik filtresinin adı:', filterSaved:'Filtre kaydedildi.', filterDeleted:'Filtre silindi.', noLocation:'Kullanılabilir konum bulunmuyor.', calendarError:'Takvim dosyası oluşturulamadı.' }
};

function getEventUiText() {
    return WRN_EVENT_TEXTS[currentLang] || WRN_EVENT_TEXTS.en;
}

function isEventArticle(article) {
    return article?.type === 'event' || articleMatchesCategory(article, 'Radar');
}

function normalizedStringArray(value) {
    const source = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(source.map(item => String(item ?? '').trim()).filter(Boolean))];
}

function parseDateMs(value) {
    if (!value) return 0;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue) && numberValue > 1000000000) {
        return numberValue < 100000000000 ? numberValue * 1000 : numberValue;
    }
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
}

function getEventStartMs(article) {
    return parseDateMs(article?.eventStart || article?.pubDate);
}

function getEventEndMs(article) {
    return parseDateMs(article?.eventEnd) || getEventStartMs(article);
}

function getEventDateKey(article) {
    const storedDate = String(article?.eventDate || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(storedDate)) return storedDate;

    const rawStart = String(article?.eventStart || article?.pubDate || '').trim();
    const isoMatch = rawStart.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    const startMs = getEventStartMs(article);
    if (!startMs) return '';
    return new Date(startMs).toISOString().slice(0, 10);
}

function getLocalDayBounds(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return [start.getTime(), end.getTime()];
}

function eventOverlaps(article, fromMs, toMs) {
    const start = getEventStartMs(article);
    const end = getEventEndMs(article) || start;
    if (!start) return false;
    return end >= fromMs && start < toMs;
}

function eventIsFree(article) {
    const values = [
        article?.eventPrice,
        ...normalizedStringArray(article?.eventPriceCategories)
    ].join(' ').toLowerCase();
    return /(^|\b)(free|kostenlos|gratis|frei|0(?:[.,]00)?)(\b|$)/i.test(values);
}

function eventMatchesSpecialFilters(article) {
    if (!isEventArticle(article)) return false;

    const end = getEventEndMs(article);
    if (end && end < Date.now() - (2 * 60 * 60 * 1000)) return false;

    const exactChecks = [
        ['event-country-filter', String(article?.eventCountry || '')],
        ['event-city-filter', String(article?.eventCity || '')]
    ];
    for (const [id, articleValue] of exactChecks) {
        const selected = document.getElementById(id)?.value || '';
        if (selected && articleValue.trim().toLocaleLowerCase() !== selected.trim().toLocaleLowerCase()) return false;
    }

    const period = document.getElementById('event-date-filter')?.value || 'upcoming';
    const now = new Date();
    const nowMs = now.getTime();

    if (period === 'today') {
        const [from, to] = getLocalDayBounds(now);
        if (!eventOverlaps(article, from, to)) return false;
    } else if (period === 'tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [from, to] = getLocalDayBounds(tomorrow);
        if (!eventOverlaps(article, from, to)) return false;
    } else if (period === '7days' && !eventOverlaps(article, nowMs - 7200000, nowMs + 7 * 86400000)) {
        return false;
    } else if (period === '14days' && !eventOverlaps(article, nowMs - 7200000, nowMs + 14 * 86400000)) {
        return false;
    } else if (period === '30days' && !eventOverlaps(article, nowMs - 7200000, nowMs + 30 * 86400000)) {
        return false;
    } else if (period === 'nextmonth') {
        const from = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
        const to = new Date(now.getFullYear(), now.getMonth() + 2, 1, 0, 0, 0, 0);
        if (!eventOverlaps(article, from.getTime(), to.getTime())) return false;
    }

    const arrayChecks = [
        ['event-category-filter', article?.eventCategories],
        ['event-group-filter', article?.eventGroups]
    ];
    for (const [id, values] of arrayChecks) {
        const selected = document.getElementById(id)?.value || '';
        if (selected && !normalizedStringArray(values).includes(selected)) return false;
    }

    return true;
}

function displayCountryName(value) {
    if (!value) return '';
    if (String(value).toUpperCase() === 'XC') {
        const labels = {
            de: 'International / unklar', en: 'International / unclear',
            es: 'Internacional / sin aclarar', fr: 'International / indéterminé',
            it: 'Internazionale / non chiaro', pt: 'Internacional / incerto',
            ru: 'Международное / неясно', el: 'Διεθνές / ασαφές',
            tr: 'Uluslararası / belirsiz'
        };
        return labels[currentLang] || labels.en;
    }
    if (String(value).length === 2 && typeof Intl.DisplayNames === 'function') {
        try {
            return new Intl.DisplayNames([currentLang], { type: 'region' }).of(String(value).toUpperCase()) || value;
        } catch (error) {}
    }
    return value;
}

function displayEventCategory(value) {
    const normalized = String(value || '').trim().toLocaleLowerCase();
    const labels = {
        de: {
            meeting:'Treffen', protest:'Protest', workshop:'Workshop',
            discussion:'Diskussion', concert:'Konzert', benefit:'Soli-Veranstaltung',
            film:'Film', party:'Party', food:'Essen', assembly:'Versammlung',
            lecture:'Vortrag', exhibition:'Ausstellung'
        },
        en: {
            meeting:'Meeting', protest:'Protest', workshop:'Workshop',
            discussion:'Discussion', concert:'Concert', benefit:'Benefit',
            film:'Film', party:'Party', food:'Food', assembly:'Assembly',
            lecture:'Lecture', exhibition:'Exhibition'
        },
        es: {
            meeting:'Encuentro', protest:'Protesta', workshop:'Taller',
            discussion:'Debate', concert:'Concierto', benefit:'Evento solidario',
            film:'Cine', party:'Fiesta', food:'Comida', assembly:'Asamblea',
            lecture:'Charla', exhibition:'Exposición'
        },
        fr: {
            meeting:'Rencontre', protest:'Manifestation', workshop:'Atelier',
            discussion:'Discussion', concert:'Concert', benefit:'Événement solidaire',
            film:'Film', party:'Fête', food:'Repas', assembly:'Assemblée',
            lecture:'Conférence', exhibition:'Exposition'
        },
        it: {
            meeting:'Incontro', protest:'Protesta', workshop:'Laboratorio',
            discussion:'Discussione', concert:'Concerto', benefit:'Evento solidale',
            film:'Film', party:'Festa', food:'Cibo', assembly:'Assemblea',
            lecture:'Conferenza', exhibition:'Mostra'
        },
        pt: {
            meeting:'Encontro', protest:'Protesto', workshop:'Oficina',
            discussion:'Debate', concert:'Concerto', benefit:'Evento solidário',
            film:'Filme', party:'Festa', food:'Comida', assembly:'Assembleia',
            lecture:'Palestra', exhibition:'Exposição'
        },
        ru: {
            meeting:'Встреча', protest:'Протест', workshop:'Мастерская',
            discussion:'Обсуждение', concert:'Концерт', benefit:'Благотворительное событие',
            film:'Кино', party:'Вечеринка', food:'Еда', assembly:'Собрание',
            lecture:'Лекция', exhibition:'Выставка'
        },
        el: {
            meeting:'Συνάντηση', protest:'Διαμαρτυρία', workshop:'Εργαστήριο',
            discussion:'Συζήτηση', concert:'Συναυλία', benefit:'Εκδήλωση αλληλεγγύης',
            film:'Ταινία', party:'Πάρτι', food:'Φαγητό', assembly:'Συνέλευση',
            lecture:'Ομιλία', exhibition:'Έκθεση'
        },
        tr: {
            meeting:'Buluşma', protest:'Protesto', workshop:'Atölye',
            discussion:'Tartışma', concert:'Konser', benefit:'Dayanışma etkinliği',
            film:'Film', party:'Parti', food:'Yemek', assembly:'Meclis',
            lecture:'Söyleşi', exhibition:'Sergi'
        }
    };
    return (labels[currentLang] || labels.en)[normalized] || value;
}

function normalizeFilterOption(value, label = value, count = 0) {
    const cleanValue = String(value ?? '').trim();
    const cleanLabel = String(label ?? cleanValue).trim();
    if (!cleanValue || !cleanLabel) return null;
    return {
        value: cleanValue,
        label: cleanLabel,
        count: Number.isFinite(Number(count)) ? Number(count) : 0
    };
}

function mergeFilterOptions(primaryOptions, fallbackValues, valueKey = 'value') {
    const map = new Map();

    const add = option => {
        if (!option) return;
        const normalized = typeof option === 'string'
            ? normalizeFilterOption(option)
            : normalizeFilterOption(option[valueKey] ?? option.value, option.label ?? option.formatted, option.count);
        if (!normalized) return;
        const key = normalized.value.toLocaleLowerCase();
        const old = map.get(key);
        if (!old || normalized.count > old.count) map.set(key, normalized);
    };

    (Array.isArray(primaryOptions) ? primaryOptions : []).forEach(add);
    (Array.isArray(fallbackValues) ? fallbackValues : []).forEach(add);

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, currentLang));
}

function setDynamicSelectOptions(id, values, allLabel, labelFormatter = value => value) {
    const select = document.getElementById(id);
    if (!select) return;
    const previous = select.value;
    select.textContent = '';

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = allLabel;
    select.append(allOption);

    values.forEach(item => {
        const optionData = typeof item === 'object'
            ? normalizeFilterOption(item.value, item.label, item.count)
            : normalizeFilterOption(item, labelFormatter(item));
        if (!optionData) return;

        const option = document.createElement('option');
        option.value = optionData.value;
        const visibleLabel = labelFormatter(optionData.label);
        option.textContent = optionData.count > 0
            ? `${visibleLabel} (${optionData.count})`
            : visibleLabel;
        select.append(option);
    });

    if ([...select.options].some(option => option.value === previous)) {
        select.value = previous;
    }
}

function populateEventFilters() {
    const t = uiTexte[currentLang] || uiTexte.en;
    const events = allNewsData.filter(article => (
        articleMatchesCategory(article, 'Radar')
        && isEventArticle(article)
        && (!getEventEndMs(article) || getEventEndMs(article) >= Date.now() - 7200000)
    ));

    const countedOptions = (rows, valuesForRow) => {
        const counts = new Map();
        rows.forEach(event => {
            normalizedStringArray(valuesForRow(event)).forEach(value => {
                counts.set(value, (counts.get(value) || 0) + 1);
            });
        });
        return [...counts.entries()]
            .map(([value, count]) => ({ value, label:value, count }))
            .sort((a, b) => a.label.localeCompare(b.label, currentLang));
    };

    const countryOptions = countedOptions(events, event => event?.eventCountry);
    setDynamicSelectOptions('event-country-filter', countryOptions, t.eventAll, displayCountryName);

    const selectedCountry = document.getElementById('event-country-filter')?.value || '';
    const cityEvents = selectedCountry
        ? events.filter(event => String(event?.eventCountry || '').trim().toUpperCase() === selectedCountry.toUpperCase())
        : events;
    const cityOptions = countedOptions(cityEvents, event => event?.eventCity);
    setDynamicSelectOptions('event-city-filter', cityOptions, t.eventAll);

    const categoryOptions = countedOptions(events, event => event?.eventCategories);
    const groupOptions = countedOptions(events, event => event?.eventGroups);

    setDynamicSelectOptions('event-category-filter', categoryOptions, t.eventAll, displayEventCategory);
    setDynamicSelectOptions('event-group-filter', groupOptions, t.eventAll);

    const periodSelect = document.getElementById('event-date-filter');
    if (periodSelect) {
        const previousPeriod = periodSelect.value || 'upcoming';
        const periodOptions = [
            ['upcoming', t.eventUpcoming],
            ['today', t.eventToday],
            ['tomorrow', t.eventTomorrow],
            ['7days', t.event7days],
            ['14days', t.event14days],
            ['30days', t.event30days],
            ['nextmonth', t.eventNextMonth]
        ];
        periodSelect.textContent = '';
        for (const [value, label] of periodOptions) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            periodSelect.append(option);
        }
        periodSelect.value = periodOptions.some(([value]) => value === previousPeriod)
            ? previousPeriod
            : 'upcoming';
    }

    renderSavedEventFilters();
}

function handleEventCountryChange() {
    const citySelect = document.getElementById('event-city-filter');
    if (citySelect) citySelect.value = '';
    populateEventFilters();
    applyFilters();
}

function resetEventFilters() {
    const ids = [
        'event-country-filter',
        'event-city-filter',
        'event-date-filter',
        'event-category-filter',
        'event-group-filter'
    ];
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        element.value = id === 'event-date-filter' ? 'upcoming' : '';
    });
    const savedSelect = document.getElementById('event-saved-filter');
    if (savedSelect) savedSelect.value = '';
    populateEventFilters();
    applyFilters();
}

function updateEventUiVisibility() {
    const panel = document.getElementById('event-filter-panel');
    if (panel) panel.hidden = activeKontinent !== 'Radar';
}

function updateSortLabels() {
    const t = uiTexte[currentLang] || uiTexte.en;
    setTxt('opt-sort-new', activeKontinent === 'Radar' ? t.eventSortSoon : t.sortNew);
    setTxt('opt-sort-old', activeKontinent === 'Radar' ? t.eventSortLate : t.sortOld);
}

function formatEventDateRange(article) {
    const startMs = getEventStartMs(article);
    if (!startMs) return '';
    const endMs = getEventEndMs(article);
    const start = new Date(startMs);
    const end = endMs ? new Date(endMs) : null;
    const dateFormatter = new Intl.DateTimeFormat(currentLang, { weekday:'short', year:'numeric', month:'2-digit', day:'2-digit' });
    const timeFormatter = new Intl.DateTimeFormat(currentLang, { hour:'2-digit', minute:'2-digit', timeZoneName:'short' });
    let text = `${dateFormatter.format(start)}, ${timeFormatter.format(start)}`;
    if (end && endMs !== startMs) {
        const sameDay = start.toDateString() === end.toDateString();
        text += sameDay ? `–${timeFormatter.format(end)}` : ` – ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`;
    }
    const declaredTimezone = String(article?.eventTimezone || '').trim();
    if (declaredTimezone && !text.toLocaleLowerCase().includes(declaredTimezone.toLocaleLowerCase())) {
        text += ` · ${declaredTimezone}`;
    }
    return text;
}

function collapseRecurringEvents(items) {
    const groups = new Map();
    (Array.isArray(items) ? items : []).forEach(event => {
        const title = String(event?.title || '').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
        const place = `${event?.eventVenue || ''}|${event?.eventCity || ''}`.toLocaleLowerCase();
        const key = `${title}|${place}`;
        if (!title) return;
        const bucket = groups.get(key) || [];
        bucket.push(event);
        groups.set(key, bucket);
    });
    return [...groups.values()].map(rows => {
        rows.sort((left, right) => getEventStartMs(left) - getEventStartMs(right));
        const primary = { ...rows[0] };
        if (rows.length > 1) {
            primary.eventRecurrenceCount = rows.length;
            primary.eventRecurrenceDates = rows
                .map(row => row.eventStart || row.pubDate)
                .filter(Boolean)
                .slice(0, 12);
        }
        return primary;
    });
}

window.WRNCollapseRecurringEvents = collapseRecurringEvents;

function getEventLocationText(article) {
    const values = [
        article?.eventVenue,
        article?.eventAddress,
        article?.eventPostal || article?.eventPostalCode,
        article?.eventCity,
        article?.eventCountry
    ].map(value => String(value || '').trim()).filter(Boolean);
    return [...new Set(values)].join(', ');
}

function localCalendarDateKey(dateValue) {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function eventStatusFlags(article) {
    const status = String(article?.eventStatus || '').toLowerCase();
    const start = getEventStartMs(article);
    const end = getEventEndMs(article) || start;
    const now = Date.now();
    const todayKey = localCalendarDateKey(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = localCalendarDateKey(tomorrow);
    const eventKey = getEventDateKey(article);

    return {
        cancelled: /(cancel|abgesagt|annul|cancelad|annull|отмен|ακυρ|iptal)/i.test(status),
        changed: /(updated|changed|moved|verschoben|geändert|aktualisiert|modifi|actualiz|aggiornat|обнов|измен|ενημερ|değiş|güncell)/i.test(status),
        live: Boolean(start && end && start <= now && now <= end && end > start),
        today: eventKey === todayKey,
        tomorrow: eventKey === tomorrowKey
    };
}

function buildEventStatusBadges(article) {
    const text = getEventUiText();
    const flags = eventStatusFlags(article);
    const badges = [];
    if (flags.cancelled) badges.push(`<span class="event-state-badge cancelled">${escapeHtml(text.cancelled)}</span>`);
    else if (flags.live) badges.push(`<span class="event-state-badge live">${escapeHtml(text.live)}</span>`);
    else if (flags.today) badges.push(`<span class="event-state-badge today">${escapeHtml(text.today)}</span>`);
    else if (flags.tomorrow) badges.push(`<span class="event-state-badge tomorrow">${escapeHtml(text.tomorrow)}</span>`);
    if (flags.changed && !flags.cancelled) badges.push(`<span class="event-state-badge changed">${escapeHtml(text.changed)}</span>`);
    return badges.length ? `<div class="event-state-row">${badges.join('')}</div>` : '';
}

function buildEventActionButtons(article, itemIndex) {
    if (!Number.isInteger(itemIndex)) return '';
    const text = getEventUiText();
    const hasDate = Boolean(getEventStartMs(article));
    const hasLocation = Boolean(getEventLocationText(article));
    const buttons = [];

    if (hasDate) {
        buttons.push(`<button type="button" class="event-action-button calendar" onclick="downloadEventCalendar(${itemIndex})">📅 ${escapeHtml(text.calendar)}</button>`);
    }
    if (hasLocation) {
        buttons.push(`<button type="button" class="event-action-button map" onclick="openEventMap(${itemIndex})">🗺️ ${escapeHtml(text.map)}</button>`);
        buttons.push(`<button type="button" class="event-action-button route" onclick="openEventRoute(${itemIndex})">➜ ${escapeHtml(text.route)}</button>`);
    }

    return buttons.length ? `<div class="event-action-row">${buttons.join('')}</div>` : '';
}

function buildEventDetailsHtml(article, t, itemIndex = null) {
    if (!isEventArticle(article)) return '';
    const lines = [];
    const dateText = formatEventDateRange(article);
    const locationParts = [article?.eventVenue, article?.eventAddress || article?.eventCity].filter(Boolean);
    if (dateText) lines.push(`<div><strong>${escapeHtml(t.eventStarts)}</strong> ${escapeHtml(dateText)}</div>`);
    if (locationParts.length) lines.push(`<div><strong>${escapeHtml(t.eventPlace)}</strong> ${escapeHtml([...new Set(locationParts)].join(' · '))}</div>`);
    if (article?.eventPrice || normalizedStringArray(article?.eventPriceCategories).length) {
        const priceText = [article.eventPrice, ...normalizedStringArray(article.eventPriceCategories)].filter(Boolean).join(' · ');
        lines.push(`<div><strong>${escapeHtml(t.eventPriceLabel)}</strong> ${escapeHtml(priceText)}</div>`);
    }
    if (article?.eventStatus) lines.push(`<div><strong>${escapeHtml(t.eventStatusLabel)}</strong> ${escapeHtml(article.eventStatus)}</div>`);
    if (Number(article?.eventRecurrenceCount) > 1) {
        const recurringLabel = currentLang === 'de' ? 'Wiederkehrend' : 'Recurring';
        lines.push(`<div><strong>${escapeHtml(recurringLabel)}:</strong> ${Number(article.eventRecurrenceCount)}×</div>`);
    }

    const badges = [
        ...normalizedStringArray(article?.eventCategories),
        ...normalizedStringArray(article?.eventTags)
    ];
    const badgeHtml = badges.length
        ? `<div class="event-badges">${badges.slice(0, 12).map(value => `<span class="event-badge">${escapeHtml(displayEventCategory(value))}</span>`).join('')}</div>`
        : '';

    return `${buildEventStatusBadges(article)}<div class="event-facts">${lines.join('')}${badgeHtml}${buildEventActionButtons(article, itemIndex)}</div>`;
}

function getEventByIndex(itemIndex) {
    const index = Number(itemIndex);
    if (!Number.isInteger(index) || index < 0) return null;
    return currentFilteredItems?.[index] || null;
}

function icsEscape(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

function icsUtcDate(ms) {
    const date = new Date(ms);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function makeSafeFilename(value) {
    const cleaned = String(value || 'event')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
    return cleaned || 'event';
}

function downloadEventCalendar(itemIndex) {
    const article = getEventByIndex(itemIndex);
    const start = getEventStartMs(article);
    if (!article || !start) {
        alert(getEventUiText().calendarError);
        return;
    }

    const end = getEventEndMs(article) || (start + 2 * 60 * 60 * 1000);
    const title = String(article.title || 'Event');
    const location = getEventLocationText(article);
    const description = String(article.content || article.teaser || '').slice(0, 2500);
    const articleUrl = getSafeHttpUrl(article.link);
    const uidSource = `${articleUrl || title}-${start}`;
    const uid = `${btoa(unescape(encodeURIComponent(uidSource))).replace(/[^a-zA-Z0-9]/g, '').slice(0, 48)}@worldrevolutionnews`;

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//World Revolution News//Event Export//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${icsUtcDate(Date.now())}`,
        `DTSTART:${icsUtcDate(start)}`,
        `DTEND:${icsUtcDate(Math.max(end, start + 30 * 60 * 1000))}`,
        `SUMMARY:${icsEscape(title)}`,
        location ? `LOCATION:${icsEscape(location)}` : '',
        description ? `DESCRIPTION:${icsEscape(description)}` : '',
        articleUrl ? `URL:${icsEscape(articleUrl)}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean);

    try {
        const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${makeSafeFilename(title)}.ics`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        console.error('Kalenderexport fehlgeschlagen:', error);
        alert(getEventUiText().calendarError);
    }
}

function openExternalEventUrl(url) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) opened.opener = null;
}

function openEventMap(itemIndex) {
    const article = getEventByIndex(itemIndex);
    const location = getEventLocationText(article);
    if (!location) {
        alert(getEventUiText().noLocation);
        return;
    }
    openExternalEventUrl(`https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`);
}

function openEventRoute(itemIndex) {
    const article = getEventByIndex(itemIndex);
    const location = getEventLocationText(article);
    if (!location) {
        alert(getEventUiText().noLocation);
        return;
    }
    openExternalEventUrl(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`);
}

function getSavedEventFilters() {
    try {
        const parsed = JSON.parse(localStorage.getItem(WRN_EVENT_FILTER_STORAGE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(item => item && item.id && item.name && item.values) : [];
    } catch (error) {
        return [];
    }
}

function setSavedEventFilters(items) {
    localStorage.setItem(WRN_EVENT_FILTER_STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

function readCurrentEventFilterValues() {
    const value = id => document.getElementById(id)?.value || '';
    return {
        country: value('event-country-filter'),
        city: value('event-city-filter'),
        period: value('event-date-filter') || 'upcoming',
        group: value('event-group-filter'),
        category: value('event-category-filter')
    };
}

function renderSavedEventFilters(selectedId = '') {
    const select = document.getElementById('event-saved-filter');
    const saveButton = document.getElementById('btn-event-filter-save');
    const deleteButton = document.getElementById('btn-event-filter-delete');
    if (!select) return;

    const text = getEventUiText();
    const previous = selectedId || select.value;
    const items = getSavedEventFilters();
    select.textContent = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = text.savedFilters;
    select.append(placeholder);

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.append(option);
    });

    if ([...select.options].some(option => option.value === previous)) select.value = previous;
    if (saveButton) saveButton.textContent = text.saveFilter;
    if (deleteButton) {
        deleteButton.textContent = text.deleteFilter;
        deleteButton.disabled = !select.value;
    }
}

function saveCurrentEventFilter() {
    const text = getEventUiText();
    const defaultName = [
        document.getElementById('event-city-filter')?.value,
        document.getElementById('event-category-filter')?.value,
        document.getElementById('event-date-filter')?.selectedOptions?.[0]?.textContent
    ].filter(Boolean).join(' · ').slice(0, 80);
    const name = window.prompt(text.filterName, defaultName || text.savedFilters)?.trim();
    if (!name) return;

    const items = getSavedEventFilters();
    const item = {
        id: `event-filter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.slice(0, 80),
        values: readCurrentEventFilterValues()
    };
    items.unshift(item);
    setSavedEventFilters(items);
    renderSavedEventFilters(item.id);
    alert(text.filterSaved);
}

function applySavedEventFilter(id) {
    const selected = getSavedEventFilters().find(item => item.id === id);
    const deleteButton = document.getElementById('btn-event-filter-delete');
    if (deleteButton) deleteButton.disabled = !selected;
    if (!selected) return;

    const values = selected.values || {};
    const set = (elementId, value) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        if ([...element.options].some(option => option.value === String(value || ''))) {
            element.value = String(value || '');
        }
    };

    set('event-country-filter', values.country);
    populateEventFilters();
    set('event-city-filter', values.city);
    set('event-date-filter', values.period || 'upcoming');
    set('event-group-filter', values.group);
    set('event-category-filter', values.category);
    const select = document.getElementById('event-saved-filter');
    if (select) select.value = id;
    applyFilters();
}

function deleteSelectedEventFilter() {
    const select = document.getElementById('event-saved-filter');
    const id = select?.value || '';
    if (!id) return;
    const items = getSavedEventFilters().filter(item => item.id !== id);
    setSavedEventFilters(items);
    renderSavedEventFilters();
    alert(getEventUiText().filterDeleted);
}
