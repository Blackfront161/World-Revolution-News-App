/* World Revolution News 1.8.1 – Briefing 2 und Entwicklungen */
'use strict';

(() => {
  if (window.WRNBriefing2) return;

  const MODE_KEY = 'wrn_briefing2_mode_v1';
  const WATCHLIST_KEY = 'wrn_story_watchlist_v1';

  const TEXTS = {
    de: {
      morning:'Morgen', evening:'Abend', week:'Woche', watch:'Beobachtet', openStories:'Entwicklungen öffnen',
      local:'Diese Auswertung bleibt auf diesem Gerät.', weekTitle:'Wochenrückblick', days:'Tage', items:'Einträge', sources:'Quellen',
      recurring:'Weiterlaufende Entwicklungen', topSources:'Häufige Quellen', noHistory:'Noch nicht genug gespeicherte Briefings.',
      morningTitle:'Morgenlage', eveningTitle:'Abendlage', newItems:'Neue Entwicklungen', updatedItems:'Veränderte Entwicklungen',
      add:'Begriff hinzufügen', placeholder:'Ort, Organisation oder Kampagne…', noMatches:'Keine aktuellen Treffer für die Beobachtungsliste.',
      remove:'Entfernen', open:'Öffnen', copy:'Zusammenfassung kopieren', copied:'Kopiert'
    },
    en: {
      morning:'Morning', evening:'Evening', week:'Week', watch:'Watched', openStories:'Open developments',
      local:'This analysis stays on this device.', weekTitle:'Weekly review', days:'days', items:'items', sources:'sources',
      recurring:'Continuing developments', topSources:'Frequent sources', noHistory:'Not enough saved briefings yet.',
      morningTitle:'Morning view', eveningTitle:'Evening view', newItems:'New developments', updatedItems:'Changed developments',
      add:'Add term', placeholder:'Place, organization or campaign…', noMatches:'No current watchlist matches.',
      remove:'Remove', open:'Open', copy:'Copy summary', copied:'Copied'
    },
    es: {
      morning:'Mañana', evening:'Tarde', week:'Semana', watch:'Observado', openStories:'Abrir desarrollos', local:'El análisis permanece en este dispositivo.',
      weekTitle:'Resumen semanal', days:'días', items:'entradas', sources:'fuentes', recurring:'Desarrollos en curso', topSources:'Fuentes frecuentes',
      noHistory:'Aún no hay suficientes resúmenes guardados.', morningTitle:'Vista matinal', eveningTitle:'Vista nocturna',
      newItems:'Nuevos desarrollos', updatedItems:'Cambios', add:'Añadir término', placeholder:'Lugar, organización o campaña…',
      noMatches:'No hay coincidencias actuales.', remove:'Quitar', open:'Abrir', copy:'Copiar resumen', copied:'Copiado'
    },
    fr: {
      morning:'Matin', evening:'Soir', week:'Semaine', watch:'Suivi', openStories:'Ouvrir les évolutions', local:'Cette analyse reste sur cet appareil.',
      weekTitle:'Revue de la semaine', days:'jours', items:'éléments', sources:'sources', recurring:'Évolutions en cours', topSources:'Sources fréquentes',
      noHistory:'Pas encore assez de briefings enregistrés.', morningTitle:'Vue du matin', eveningTitle:'Vue du soir',
      newItems:'Nouveaux développements', updatedItems:'Développements modifiés', add:'Ajouter un terme', placeholder:'Lieu, organisation ou campagne…',
      noMatches:'Aucun résultat actuel.', remove:'Retirer', open:'Ouvrir', copy:'Copier le résumé', copied:'Copié'
    },
    it: {
      morning:'Mattina', evening:'Sera', week:'Settimana', watch:'Osservati', openStories:'Apri sviluppi', local:'L’analisi resta su questo dispositivo.',
      weekTitle:'Riepilogo settimanale', days:'giorni', items:'elementi', sources:'fonti', recurring:'Sviluppi in corso', topSources:'Fonti frequenti',
      noHistory:'Non ci sono ancora abbastanza briefing salvati.', morningTitle:'Vista mattutina', eveningTitle:'Vista serale',
      newItems:'Nuovi sviluppi', updatedItems:'Sviluppi aggiornati', add:'Aggiungi termine', placeholder:'Luogo, organizzazione o campagna…',
      noMatches:'Nessuna corrispondenza attuale.', remove:'Rimuovi', open:'Apri', copy:'Copia riepilogo', copied:'Copiato'
    },
    pt: {
      morning:'Manhã', evening:'Noite', week:'Semana', watch:'Observado', openStories:'Abrir desenvolvimentos', local:'A análise permanece neste dispositivo.',
      weekTitle:'Resumo semanal', days:'dias', items:'itens', sources:'fontes', recurring:'Desenvolvimentos em curso', topSources:'Fontes frequentes',
      noHistory:'Ainda não há briefings guardados suficientes.', morningTitle:'Visão da manhã', eveningTitle:'Visão da noite',
      newItems:'Novos desenvolvimentos', updatedItems:'Desenvolvimentos alterados', add:'Adicionar termo', placeholder:'Local, organização ou campanha…',
      noMatches:'Sem resultados atuais.', remove:'Remover', open:'Abrir', copy:'Copiar resumo', copied:'Copiado'
    },
    ru: {
      morning:'Утро', evening:'Вечер', week:'Неделя', watch:'Наблюдение', openStories:'Открыть развитие событий', local:'Анализ остается на этом устройстве.',
      weekTitle:'Обзор недели', days:'дней', items:'материалов', sources:'источников', recurring:'Продолжающиеся события', topSources:'Частые источники',
      noHistory:'Сохраненных обзоров пока недостаточно.', morningTitle:'Утренняя картина', eveningTitle:'Вечерняя картина',
      newItems:'Новые события', updatedItems:'Изменившиеся события', add:'Добавить термин', placeholder:'Место, организация или кампания…',
      noMatches:'Совпадений пока нет.', remove:'Удалить', open:'Открыть', copy:'Копировать обзор', copied:'Скопировано'
    },
    el: {
      morning:'Πρωί', evening:'Βράδυ', week:'Εβδομάδα', watch:'Παρακολούθηση', openStories:'Άνοιγμα εξελίξεων', local:'Η ανάλυση μένει σε αυτή τη συσκευή.',
      weekTitle:'Εβδομαδιαία ανασκόπηση', days:'ημέρες', items:'στοιχεία', sources:'πηγές', recurring:'Εξελίξεις που συνεχίζονται', topSources:'Συχνές πηγές',
      noHistory:'Δεν υπάρχουν ακόμη αρκετές αποθηκευμένες ενημερώσεις.', morningTitle:'Πρωινή εικόνα', eveningTitle:'Βραδινή εικόνα',
      newItems:'Νέες εξελίξεις', updatedItems:'Αλλαγμένες εξελίξεις', add:'Προσθήκη όρου', placeholder:'Τόπος, οργάνωση ή καμπάνια…',
      noMatches:'Δεν υπάρχουν τρέχοντα αποτελέσματα.', remove:'Αφαίρεση', open:'Άνοιγμα', copy:'Αντιγραφή σύνοψης', copied:'Αντιγράφηκε'
    },
    tr: {
      morning:'Sabah', evening:'Akşam', week:'Hafta', watch:'İzlenen', openStories:'Gelişmeleri aç', local:'Bu analiz bu cihazda kalır.',
      weekTitle:'Haftalık değerlendirme', days:'gün', items:'öğe', sources:'kaynak', recurring:'Devam eden gelişmeler', topSources:'Sık kaynaklar',
      noHistory:'Henüz yeterli kayıtlı briefing yok.', morningTitle:'Sabah görünümü', eveningTitle:'Akşam görünümü',
      newItems:'Yeni gelişmeler', updatedItems:'Değişen gelişmeler', add:'Terim ekle', placeholder:'Yer, örgüt veya kampanya…',
      noMatches:'Güncel eşleşme yok.', remove:'Kaldır', open:'Aç', copy:'Özeti kopyala', copied:'Kopyalandı'
    }
  };

  let mode = readMode();

  function language() {
    return window.WRNI18n?.currentLanguage?.()
      || document.documentElement.lang
      || 'en';
  }

  function text() {
    return TEXTS[language()] || TEXTS.en;
  }

  function readMode() {
    try {
      const value = localStorage.getItem(MODE_KEY);
      return ['morning','evening','week','watch'].includes(value)
        ? value
        : (new Date().getHours() < 15 ? 'morning' : 'evening');
    } catch {
      return 'morning';
    }
  }

  function saveMode(value) {
    mode = value;
    try { localStorage.setItem(MODE_KEY, value); } catch {}
  }

  function readWatchlist() {
    try {
      return window.WRNStoriesCore?.normalizeWatchTerms(
        JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]')
      ) || [];
    } catch {
      return [];
    }
  }

  function writeWatchlist(values) {
    const normalized = window.WRNStoriesCore?.normalizeWatchTerms(values) || [];
    try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(normalized)); } catch {}
    window.dispatchEvent(new CustomEvent('wrn-watchlist-change', { detail: { terms: normalized } }));
    return normalized;
  }

  function allArticles() {
    try {
      return Array.isArray(allNewsData) ? allNewsData : [];
    } catch {
      return [];
    }
  }

  function flattenCurrent(briefing) {
    return (briefing?.sections || [])
      .flatMap(section => section?.items || [])
      .filter(item => item && !item.isConnection);
  }

  function openItem(item) {
    try {
      const index = allArticles().findIndex(article =>
        window.WRNStoriesCore.itemKey(article)
        === window.WRNStoriesCore.itemKey(item)
      );

      if (index >= 0 && typeof openArticleDetail === 'function') {
        openArticleDetail(index);
        return;
      }
    } catch {}

    if (/^https?:\/\//i.test(String(item?.link || ''))) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  }

  function listItems(items, headingText) {
    const copy = text();
    const section = document.createElement('section');
    const heading = document.createElement('h4');
    heading.textContent = headingText;
    section.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'wrn-briefing2-list';

    items.slice(0, 6).forEach(item => {
      const row = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = window.WRNStoriesCore.cleanText(item.title);
      button.addEventListener('click', () => openItem(item));
      const meta = document.createElement('span');
      meta.textContent = window.WRNStoriesCore.sourceName(item);
      row.append(button, meta);
      list.appendChild(row);
    });

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'wrn-briefing2-empty';
      empty.textContent = copy.noMatches;
      section.appendChild(empty);
    } else {
      section.appendChild(list);
    }

    return section;
  }

  function renderMorning(content, briefing) {
    const copy = text();
    const items = flattenCurrent(briefing);
    const newItems = items.filter(item => item.isNew);
    const events = items.filter(item => window.WRNStoriesCore.isEvent(item));

    content.append(
      listItems(newItems.length ? newItems : items, copy.newItems),
      listItems(events, window.WRNI18n?.dictionary?.(language())?.briefing?.events || 'Events')
    );
  }

  function renderEvening(content, briefing) {
    const copy = text();
    const items = flattenCurrent(briefing);
    const updated = items.filter(item => item.isUpdated);
    const recent = [...items].sort((a, b) =>
      window.WRNStoriesCore.dateMs(b) - window.WRNStoriesCore.dateMs(a)
    );

    content.append(
      listItems(updated.length ? updated : recent, copy.updatedItems),
      listItems(recent.filter(item => !item.isUpdated), copy.newItems)
    );
  }

  function renderWeek(content) {
    const copy = text();
    const history = window.WRNBriefing?.getHistory?.() || [];
    const insights = window.WRNStoriesCore.weeklyInsights(history);

    if (!insights.itemCount) {
      const empty = document.createElement('p');
      empty.className = 'wrn-briefing2-empty';
      empty.textContent = copy.noHistory;
      content.appendChild(empty);
      return;
    }

    const stats = document.createElement('div');
    stats.className = 'wrn-briefing2-stats';
    [
      [insights.daysCovered, copy.days],
      [insights.itemCount, copy.items],
      [insights.sourceCount, copy.sources]
    ].forEach(([value, label]) => {
      const card = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = String(value);
      const span = document.createElement('span');
      span.textContent = label;
      card.append(strong, span);
      stats.appendChild(card);
    });
    content.appendChild(stats);

    const stories = document.createElement('section');
    const heading = document.createElement('h4');
    heading.textContent = copy.recurring;
    stories.appendChild(heading);
    const list = document.createElement('ol');
    list.className = 'wrn-briefing2-story-list';

    insights.stories.forEach(story => {
      const item = document.createElement('li');
      item.textContent = `${story.title} · ${story.itemCount} ${copy.items} · ${story.sourceCount} ${copy.sources}`;
      list.appendChild(item);
    });
    stories.appendChild(list);
    content.appendChild(stories);

    const sourceSection = document.createElement('section');
    const sourceHeading = document.createElement('h4');
    sourceHeading.textContent = copy.topSources;
    const sourceList = document.createElement('div');
    sourceList.className = 'wrn-briefing2-source-chips';
    insights.topSources.forEach(item => {
      const chip = document.createElement('span');
      chip.textContent = `${item.source} · ${item.count}`;
      sourceList.appendChild(chip);
    });
    sourceSection.append(sourceHeading, sourceList);
    content.appendChild(sourceSection);
  }

  function renderWatch(content) {
    const copy = text();
    let terms = readWatchlist();

    const form = document.createElement('form');
    form.className = 'wrn-briefing2-watch-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = copy.placeholder;
    const add = document.createElement('button');
    add.type = 'submit';
    add.textContent = copy.add;
    form.append(input, add);

    const chips = document.createElement('div');
    chips.className = 'wrn-briefing2-watch-chips';

    const rerenderChips = () => {
      chips.textContent = '';
      terms.forEach(term => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.textContent = `${term} ×`;
        chip.title = copy.remove;
        chip.addEventListener('click', () => {
          terms = writeWatchlist(terms.filter(value => value !== term));
          renderActiveContent(content.closest('.wrn-briefing2-panel'));
        });
        chips.appendChild(chip);
      });
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      terms = writeWatchlist([...terms, input.value]);
      input.value = '';
      renderActiveContent(content.closest('.wrn-briefing2-panel'));
    });

    rerenderChips();
    content.append(form, chips);

    const matches = allArticles()
      .filter(item => window.WRNStoriesCore.matchesWatchlist(item, terms))
      .sort((a, b) =>
        window.WRNStoriesCore.dateMs(b) - window.WRNStoriesCore.dateMs(a)
      );

    content.appendChild(listItems(matches, copy.watch));
  }

  function renderActiveContent(panel, briefing) {
    if (!panel) return;
    const content = panel.querySelector('.wrn-briefing2-content');
    if (!content) return;
    content.textContent = '';

    if (mode === 'morning') renderMorning(content, briefing || panel.__wrnBriefing);
    if (mode === 'evening') renderEvening(content, briefing || panel.__wrnBriefing);
    if (mode === 'week') renderWeek(content);
    if (mode === 'watch') renderWatch(content);

    panel.querySelectorAll('[data-briefing2-mode]').forEach(button => {
      const active = button.dataset.briefing2Mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function inject(view, briefing) {
    if (!view || !window.WRNStoriesCore) return;

    view.querySelector('.wrn-briefing2-panel')?.remove();

    const panel = document.createElement('section');
    panel.className = 'wrn-briefing2-panel';
    panel.__wrnBriefing = briefing;

    const copy = text();
    const header = document.createElement('div');
    header.className = 'wrn-briefing2-header';

    const modes = document.createElement('div');
    modes.className = 'wrn-briefing2-modes';
    [
      ['morning', copy.morning],
      ['evening', copy.evening],
      ['week', copy.week],
      ['watch', copy.watch]
    ].forEach(([key, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.briefing2Mode = key;
      button.textContent = label;
      button.addEventListener('click', () => {
        saveMode(key);
        renderActiveContent(panel, briefing);
      });
      modes.appendChild(button);
    });

    const stories = document.createElement('button');
    stories.type = 'button';
    stories.className = 'wrn-briefing2-open-stories';
    stories.textContent = copy.openStories;
    stories.addEventListener('click', () => window.WRNActivateTab?.('stories'));

    header.append(modes, stories);

    const content = document.createElement('div');
    content.className = 'wrn-briefing2-content';

    const privacy = document.createElement('p');
    privacy.className = 'wrn-briefing2-privacy';
    privacy.textContent = `🔒 ${copy.local}`;

    panel.append(header, content, privacy);

    const stats = view.querySelector('.wrn-briefing-stats');
    if (stats?.parentElement) stats.insertAdjacentElement('afterend', panel);
    else view.appendChild(panel);

    renderActiveContent(panel, briefing);
  }

  window.addEventListener('wrn-briefing-rendered', event => {
    inject(event.detail?.view, event.detail?.briefing);
  });

  window.addEventListener('wrn-watchlist-change', () => {
    const panel = document.querySelector('.wrn-briefing2-panel');
    if (panel && mode === 'watch') renderActiveContent(panel);
  });

  window.WRNBriefing2 = Object.freeze({
    inject,
    getMode: () => mode,
    setMode: value => {
      if (!['morning','evening','week','watch'].includes(value)) return false;
      saveMode(value);
      return true;
    },
    getWatchlist: readWatchlist,
    setWatchlist: writeWatchlist,
    test: Object.freeze({
      flattenCurrent,
      weeklyInsights: (...args) => window.WRNStoriesCore.weeklyInsights(...args)
    })
  });
})();
