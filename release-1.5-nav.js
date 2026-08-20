/* WRN 1.8.1 – Entwicklungen, Video, Audio-Herkunft und vollständige Sprachen */
'use strict';

(() => {
  if (window.__wrnAppNav175Loaded) return;
  window.__wrnAppNav175Loaded = true;

  const NAV_TEXTS = {
    de: {
      briefing: 'Briefing', stories: 'Entwicklungen', video: 'Video', start: 'Start', regions: 'Regionen', topics: 'Themen', events: 'Termine',
      audio: 'Audio', saved: 'Gespeichert', zine: 'Zine', search: 'Suche', settings: 'Mehr & Einstellungen',
      lexicon: 'Lexikon', solidarity: 'Solidarität', about: 'Über das Projekt',
      sources: 'Quellen', back: 'Zurück', article: 'Artikel', language: 'Sprache', design: 'Design',
      fontSize: 'Schriftgröße', view: 'Artikelansicht', format: 'Format', sort: 'Sortierung', info: 'Info',
      contact: 'Feedback', donate: 'Spenden', storage: 'Speicher', status: 'App-Selbsttest', diagnostics: 'Diagnose', clear: 'Cache leeren',
      searchPlaceholder: 'Artikel durchsuchen…', originalPodcasts: 'Original-Podcasts',
      generatedPodcasts: 'Erzeugte Podcasts', liveRadio: 'Live-Radio', bookmarks: 'Später lesen', read: 'Gelesen'
    },
    en: {
      briefing: 'Briefing', stories: 'Developments', video: 'Video', start: 'Start', regions: 'Regions', topics: 'Topics', events: 'Events',
      audio: 'Audio', saved: 'Saved', zine: 'Zine', search: 'Search', settings: 'More & settings',
      lexicon: 'Glossary', solidarity: 'Solidarity', about: 'About the project',
      sources: 'Sources', back: 'Back', article: 'Article', language: 'Language', design: 'Design',
      fontSize: 'Font size', view: 'Article view', format: 'Format', sort: 'Sorting', info: 'Info',
      contact: 'Feedback', donate: 'Donate', storage: 'Storage', status: 'App self-test', diagnostics: 'Diagnostics', clear: 'Clear cache',
      searchPlaceholder: 'Search articles…', originalPodcasts: 'Original podcasts',
      generatedPodcasts: 'Generated podcasts', liveRadio: 'Live radio', bookmarks: 'Read later', read: 'Read'
    }
  };

  const TABS = [
    {
      key: 'briefing',
      activate: () => {
        closeAuxiliaryPanels();
        window.WRNBriefing?.show?.();
      }
    },
    {
      key: 'stories',
      activate: () => {
        closeAuxiliaryPanels();
        window.WRNStories?.show?.();
      }
    },
    {
      key: 'start',
      activate: () => {
        prepareArticleView();
        if (typeof ladeKontinentNews === 'function') ladeKontinentNews('Global');
      }
    },
    {
      key: 'regions',
      subTabs: [
        ['Global','Global'], ['Europe','Europa'], ['Africa','Afrika'],
        ['North America','Nordamerika'], ['Latin America','Lateinamerika'],
        ['Asia','Asien'], ['Australia & NZ','Ozeanien']
      ],
      activate: subKey => {
        prepareArticleView();
        const target = subKey || state.subSelections.regions || 'Global';
        state.subSelections.regions = target;
        if (typeof ladeKontinentNews === 'function') ladeKontinentNews(target);
      }
    },
    {
      key: 'topics',
      subTabs: [
        ['Labor Struggles','Arbeitskämpfe'],
        ['Antifascism','Antifaschismus'],
        ['Antisexism','Antisexismus'],
        ['Queer-Feminism','Queer-Feminismus'],
        ['Antiracism','Antirassismus'],
        ['No Borders','No Borders'],
        ['Anticapitalism','Antikapitalismus'],
        ['Theory & Strategy','Theorie & Strategie'],
        ['Anticolonialism','Antikolonialismus'],
        ['Anti-Imperialism','Anti-Imperialismus'],
        ['Squatting & Housing','Hausbesetzungen'],
        ['Demonstrations','Demonstrationen'],
        ['Anti-Rep & Prisons','Anti-Rep & Knast'],
        ['Cyberactivism','Cyber-Aktivismus'],
        ['No War','Kriegsdienstverweigerung'],
        ['Animal Liberation','Tierbefreiung'],
        ['Eco-Anarchism','Ökologie & Klima'],
        ['Indigenous Struggles','Indigene Kämpfe'],
        ['Radical Health & Disability','Radical Health'],
        ['Libraries','Bibliotheken'],
        ['Movement News','Bewegungsnews'],
        ['WRN Corruption','Korruption']
      ],
      activate: subKey => {
        prepareArticleView();
        const target = subKey || state.subSelections.topics || 'Labor Struggles';
        state.subSelections.topics = target;
        if (typeof ladeKontinentNews === 'function') ladeKontinentNews(target);
      }
    },
    {
      key: 'video',
      subTabs: [
        ['current', 'current'],
        ['information', 'information']
      ],
      activate: subKey => {
        closeAuxiliaryPanels();
        const target = subKey || state.subSelections.video || 'current';
        state.subSelections.video = target;
        window.WRNVideoHub?.show?.(target);
      }
    },
    {
      key: 'events',
      activate: () => {
        prepareArticleView();
        if (typeof ladeKontinentNews === 'function') ladeKontinentNews('Radar');
        const panel = document.getElementById('event-filter-panel');
        if (panel) panel.hidden = false;
      }
    },
    {
      key: 'audio',
      subTabs: [
        ['original','originalPodcasts'],
        ['generated','generatedPodcasts'],
        ['radio','liveRadio']
      ],
      activate: subKey => {
        closeAuxiliaryPanels();
        const target = subKey || state.subSelections.audio || 'original';
        state.subSelections.audio = target;
        if (window.WRNAudioTab181?.open) window.WRNAudioTab181.open(target);
        else if (typeof openAudioHub === 'function') openAudioHub(target);
      }
    },
    {
      key: 'saved',
      subTabs: [
        ['bookmarks','bookmarks'],
        ['read','read']
      ],
      activate: subKey => {
        prepareArticleView();
        const target = subKey || state.subSelections.saved || 'bookmarks';
        state.subSelections.saved = target;
        if (target === 'bookmarks' && typeof ladeBookmarks === 'function') ladeBookmarks();
        if (target === 'read' && typeof ladeReadArticles === 'function') ladeReadArticles();
      }
    },
    {
      key: 'solidarity',
      subTabs: [
        ['current', 'current'],
        ['people', 'people'],
        ['write', 'write'],
        ['rules', 'rules'],
        ['sources', 'sources']
      ],
      activate: subKey => {
        closeAuxiliaryPanels();
        const target = subKey || state.subSelections.solidarity || 'current';
        state.subSelections.solidarity = target;
        window.WRNPrisonerSolidarity190?.show?.(target);
      }
    },
    {
      key: 'zine',
      activate: () => {
        closeAuxiliaryPanels();
        if (typeof openZineManager === 'function') openZineManager();
      }
    },
    {
      key: 'lexicon',
      subTabs: [
        ['basics', 'basics'],
        ['organisation', 'organisation'],
        ['justice', 'justice'],
        ['power', 'power'],
        ['tactics', 'tactics'],
        ['ecology', 'ecology'],
        ['struggles', 'struggles'],
        ['all', 'all'],
        ['sources', 'sources']
      ],
      activate: subKey => {
        closeAuxiliaryPanels();
        const target = subKey || state.subSelections.lexicon || 'basics';
        state.subSelections.lexicon = target;
        window.WRNLexicon184?.show?.(target);
      }
    },
    {
      key: 'about',
      menuOnly: true,
      activate: () => {
        closeAuxiliaryPanels();
        window.WRNAbout184?.show?.();
      }
    }
  ];

  const state = {
    activeTab: 'briefing',
    subSelections: {
      regions: 'Global',
      topics: 'Labor Struggles',
      video: 'current',
      audio: 'original',
      saved: 'bookmarks',
      lexicon: 'basics',
      solidarity: 'current'
    }
  };

  let detailState = null;
  let suppressCardClickUntil = 0;
  let navigationHistoryReady = false;
  let restoringNavigationHistory = false;

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function languageKey() {
    const value = document.getElementById('ui-language')?.value
      || document.documentElement.lang
      || 'en';
    return window.WRNI18n?.normalizeLanguage?.(value)
      || String(value).toLowerCase().split(/[-_]/)[0]
      || 'en';
  }

  function texts() {
    const language = languageKey();
    return {
      ...NAV_TEXTS.en,
      ...(window.WRNI18n?.dictionary?.(language)?.nav || {}),
      ...(NAV_TEXTS[language] || {})
    };
  }

  function navigationSnapshot() {
    return {
      wrnNavigation: true,
      wrnTab: state.activeTab,
      wrnSubSelections: { ...state.subSelections }
    };
  }

  function navigationStateMatches(value) {
    if (!value?.wrnNavigation || value.wrnTab !== state.activeTab) return false;
    return Object.entries(state.subSelections).every(([key, selection]) => (
      value.wrnSubSelections?.[key] === selection
    ));
  }

  function writeNavigationHistory(mode = 'push') {
    if (restoringNavigationHistory) return;
    const snapshot = navigationSnapshot();
    if (mode === 'push' && navigationStateMatches(history.state)) return;
    const url = new URL(location.href);
    url.hash = `tab=${encodeURIComponent(state.activeTab)}`;
    try {
      if (mode === 'replace') history.replaceState(snapshot, '', url);
      else history.pushState(snapshot, '', url);
      navigationHistoryReady = true;
    } catch {
      navigationHistoryReady = false;
    }
  }

  function subTabLabel(tab, key, fallback) {
    const language = languageKey();
    if (key === 'WRN Corruption') {
      return ({
        de: 'Korruption', en: 'Corruption', es: 'Corrupción',
        fr: 'Corruption', it: 'Corruzione', pt: 'Corrupção',
        ru: 'Коррупция', el: 'Διαφθορά', tr: 'Yolsuzluk'
      })[language] || 'Corruption';
    }
    if (tab?.key === 'topics') return window.WRNI18n?.topicLabel?.(key, language) || fallback || key;
    if (tab?.key === 'regions') return window.WRNI18n?.regionLabel?.(key, language) || fallback || key;
    if (tab?.key === 'video') return window.WRNVideoHub?.modeLabel?.(key) || fallback || key;
    if (tab?.key === 'audio' || tab?.key === 'saved') return texts()[fallback] || fallback || key;
    if (tab?.key === 'lexicon') return window.WRNLexicon184?.sectionLabel?.(key, language) || fallback || key;
    if (tab?.key === 'solidarity') return window.WRNPrisonerSolidarity190?.sectionLabel?.(key, language) || fallback || key;
    return fallback || key;
  }

  function closeAuxiliaryPanels() {
    const panel = document.getElementById('event-filter-panel');
    if (panel) panel.hidden = true;
    window.WRNBriefing?.hide?.();
    window.WRNAudioTab181?.close?.();
    window.WRNVideoHub?.hide?.();
    window.WRNAbout184?.hide?.();
    window.WRNLexicon184?.hide?.();
    window.WRNPrisonerSolidarity190?.hide?.();
  }

  function prepareArticleView() {
    closeAuxiliaryPanels();
    ['feed-container', 'status-container'].forEach(id => {
      const node = document.getElementById(id);
      if (!node) return;
      node.hidden = false;
      node.style.removeProperty('display');
    });
  }

  function makeButton(className, text, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    if (title) button.title = title;
    return button;
  }

  function injectBrand(header) {
    const first = header?.querySelector('div');
    if (!first || $('.wrn-brand', first)) return;

    const title = first.querySelector('h1');
    if (!title) return;

    const brand = document.createElement('div');
    brand.className = 'wrn-brand';

    const logo = document.createElement('img');
    logo.src = './wrn-logo.webp?v=175';
    logo.alt = 'World Revolution News Logo';

    const textWrap = document.createElement('div');
    textWrap.className = 'wrn-brand-text';

    title.parentNode.insertBefore(brand, title);
    brand.append(logo, textWrap);
    textWrap.appendChild(title);

    const version = first.querySelector('.app-version-inline');
    if (version) textWrap.appendChild(version);
  }

  function buildSearchPanel(referenceNode) {
    if ($('.wrn-search-panel')) return $('.wrn-search-panel');

    const panel = document.createElement('div');
    panel.className = 'wrn-search-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <input class="wrn-search-input" type="search" placeholder="${texts().searchPlaceholder}" aria-label="${texts().searchPlaceholder}">
      <button class="wrn-search-clear" type="button" aria-label="Suche leeren">×</button>
    `;
    referenceNode.insertAdjacentElement('afterend', panel);

    const input = $('.wrn-search-input', panel);
    const clear = $('.wrn-search-clear', panel);

    input.addEventListener('input', () => {
      const original = document.getElementById('search-input');
      if (original) original.value = input.value;
      if (typeof applyFilters === 'function') applyFilters();
    });

    clear.addEventListener('click', () => {
      input.value = '';
      const original = document.getElementById('search-input');
      if (original) original.value = '';
      if (typeof applyFilters === 'function') applyFilters();
      input.focus();
    });

    return panel;
  }

  function copyOptions(source, target) {
    target.textContent = '';
    if (!source) return;
    Array.from(source.options).forEach(option => {
      const clone = document.createElement('option');
      clone.value = option.value;
      clone.textContent = option.textContent;
      clone.disabled = option.disabled;
      target.appendChild(clone);
    });
    target.value = source.value;
  }

  function makeProxyField(labelText, originalId, handler) {
    const field = document.createElement('label');
    field.className = 'wrn-more-field';

    const label = document.createElement('span');
    label.textContent = labelText;

    const select = document.createElement('select');
    select.dataset.originalId = originalId;
    copyOptions(document.getElementById(originalId), select);

    select.addEventListener('change', () => {
      const original = document.getElementById(originalId);
      if (original) original.value = select.value;
      try {
        handler(select.value, original);
      } catch (error) {
        console.error(error);
      }
    });

    field.append(label, select);
    return field;
  }

  function donationStarMarkup() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="wrnMenuStarGrad157" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="50%" stop-color="#ff0033"></stop>
            <stop offset="50%" stop-color="#050508"></stop>
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#wrnMenuStarGrad157)"
          stroke="#ff334f"
          stroke-width="1.1"
          stroke-linejoin="round">
        </path>
      </svg>
    `;
  }

  function actionButton(label, iconMarkup, actionKey, callback) {
    const button = makeButton('wrn-more-action', '');
    button.dataset.wrnAction = actionKey || '';

    const icon = document.createElement('span');
    icon.className = 'wrn-menu-action-icon';
    icon.innerHTML = iconMarkup || '';

    const text = document.createElement('span');
    text.className = 'wrn-menu-action-label';
    text.textContent = label;

    button.append(icon, text);
    button.addEventListener('click', () => {
      closeMorePanel();
      try {
        callback();
      } catch (error) {
        console.error(error);
      }
    });
    return button;
  }

  function buildMorePanel() {
    if ($('.wrn-more-panel')) return $('.wrn-more-panel');

    const panel = document.createElement('section');
    panel.className = 'wrn-more-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', texts().settings);

    const head = document.createElement('div');
    head.className = 'wrn-more-head';

    const heading = document.createElement('strong');
    heading.className = 'wrn-more-title';
    heading.textContent = texts().settings;

    const close = makeButton('wrn-more-close', '×', 'Schließen');
    close.addEventListener('click', closeMorePanel);
    head.append(heading, close);

    const grid = document.createElement('div');
    grid.className = 'wrn-more-grid';

    grid.append(
      makeProxyField(texts().language, 'ui-language', () => {
        if (typeof changeLanguage === 'function') changeLanguage();
        window.setTimeout(updateLanguage, 0);
      }),
      makeProxyField(texts().design, 'ui-theme', value => {
        if (typeof changeTheme === 'function') changeTheme(value);
      }),
      makeProxyField(texts().fontSize, 'ui-fontsize', value => {
        if (typeof changeFontSize === 'function') changeFontSize(value);
      }),
      makeProxyField(texts().view, 'ui-news-view', value => {
        if (typeof changeNewsView === 'function') changeNewsView(value);
      }),
      makeProxyField(texts().format, 'content-type-filter', () => {
        if (typeof applyFilters === 'function') applyFilters();
      }),
      makeProxyField(texts().sort, 'sort-select', () => {
        if (typeof applyFilters === 'function') applyFilters();
      })
    );

    const actions = document.createElement('div');
    actions.className = 'wrn-more-actions';
    actions.append(
      actionButton(
        texts().sources,
        '☰',
        'sources',
        () => typeof openSourcesModal === 'function' && openSourcesModal()
      ),
      actionButton(
        window.WRNAbout184?.label?.(languageKey()) || texts().about || 'About the project',
        'ⓘ',
        'about',
        () => activateTab('about')
      ),
      actionButton(
        texts().contact,
        '💬',
        'contact',
        () => typeof openFeedback === 'function' && openFeedback()
      ),
      actionButton(
        texts().donate,
        donationStarMarkup(),
        'donate',
        () => typeof openDonate === 'function' && openDonate()
      ),
      actionButton(
        texts().storage,
        '💾',
        'storage',
        () => typeof openDataControl === 'function' && openDataControl()
      ),
      actionButton(
        texts().clear,
        '🗑️',
        'clear',
        () => typeof clearAllData === 'function' && clearAllData()
      )
    );

    const adminTools = document.createElement('div');
    adminTools.className = 'wrn-more-admin-tools-184';
    const diagnosticsTitle = document.createElement('strong');
    diagnosticsTitle.className = 'wrn-more-diagnostics-title-185';
    diagnosticsTitle.textContent = texts().diagnostics || 'Diagnostics';
    adminTools.append(diagnosticsTitle);
    panel.append(head, grid, actions, adminTools);
    document.body.appendChild(panel);

    const sourceVerification = document.getElementById(
      'wrn-source-verification-open'
    );
    if (sourceVerification) {
      sourceVerification.hidden = false;
      adminTools.appendChild(sourceVerification);
    }

    return panel;
  }

  function syncMoreControls() {
    const panel = $('.wrn-more-panel');
    if (!panel) return;

    $all('select[data-original-id]', panel).forEach(select => {
      const original = document.getElementById(select.dataset.originalId);
      if (!original) return;
      if (select.options.length !== original.options.length) copyOptions(original, select);
      select.value = original.value;
    });
  }

  function closeMorePanel() {
    const panel = $('.wrn-more-panel');
    const menuButton = $('.wrn-header-menu');
    if (panel) panel.hidden = true;
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('wrn-more-open');
  }

  function toggleMorePanel() {
    const panel = buildMorePanel();
    const menuButton = $('.wrn-header-menu');
    const search = $('.wrn-search-panel');

    if (search) search.hidden = true;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) syncMoreControls();
    document.body.classList.toggle('wrn-more-open', !panel.hidden);
    if (menuButton) menuButton.setAttribute('aria-expanded', String(!panel.hidden));
  }

  function injectHeaderControls(header) {
    if (!header || $('.wrn-header-actions', header)) return;

    const right = header.querySelector('.header-controls') || document.createElement('div');
    right.classList.add('header-controls');

    const actions = document.createElement('div');
    actions.className = 'wrn-header-actions';


    const menuButton = makeButton(
      'wrn-header-button wrn-header-button-icon wrn-header-menu',
      '☰',
      texts().settings
    );
    menuButton.setAttribute('aria-label', texts().settings);
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => {
      const panel = $('.wrn-search-panel');
      if (panel) panel.hidden = true;
      toggleMorePanel();
      const morePanel = $('.wrn-more-panel');
      menuButton.setAttribute('aria-expanded', String(Boolean(morePanel && !morePanel.hidden)));
    });

    const searchButton = makeButton(
      'wrn-header-button wrn-header-button-icon wrn-header-search',
      '⌕',
      texts().search
    );
    searchButton.setAttribute('aria-label', texts().search);
    searchButton.addEventListener('click', () => {
      closeMorePanel();
      menuButton.setAttribute('aria-expanded', 'false');
      const panel = $('.wrn-search-panel');
      const input = $('.wrn-search-input', panel);
      if (!panel || !input) return;
      panel.hidden = !panel.hidden;
      if (!panel.hidden) window.setTimeout(() => input.focus(), 70);
    });

    actions.append(menuButton, searchButton);

    if (!right.parentElement) header.appendChild(right);
    right.appendChild(actions);
  }

  function buildTopNavigation() {
    if ($('.wrn-top-tabs')) return;

    const header = document.querySelector('header');
    if (!header) return;

    const topTabs = document.createElement('nav');
    topTabs.className = 'wrn-top-tabs';
    topTabs.setAttribute('aria-label', 'Hauptnavigation');

    TABS.filter(tab => !tab.menuOnly).forEach(tab => {
      const label = tab.key === 'about'
        ? window.WRNAbout184?.label?.(languageKey()) || texts()[tab.key] || 'About'
        : tab.key === 'lexicon'
          ? window.WRNLexicon184?.label?.(languageKey()) || texts()[tab.key] || 'Glossary'
        : tab.key === 'solidarity'
          ? window.WRNPrisonerSolidarity190?.label?.(languageKey()) || texts()[tab.key] || 'Solidarity'
        : texts()[tab.key] || tab.key;
      const button = makeButton('wrn-top-tab', label);
      button.dataset.key = tab.key;
      button.addEventListener('click', () => activateTab(tab.key));
      topTabs.appendChild(button);
    });

    header.insertAdjacentElement('afterend', topTabs);

    const subWrap = document.createElement('div');
    subWrap.className = 'wrn-subtabs-wrap';
    subWrap.hidden = true;
    subWrap.innerHTML = '<div class="wrn-subtabs" aria-label="Unterkategorien"></div>';
    topTabs.insertAdjacentElement('afterend', subWrap);

    buildSearchPanel(subWrap);
  }

  function renderSubTabs(tab) {
    const wrap = $('.wrn-subtabs-wrap');
    const bar = $('.wrn-subtabs', wrap);
    if (!wrap || !bar) return;

    bar.textContent = '';
    if (!tab?.subTabs?.length) {
      wrap.hidden = true;
      return;
    }

    const selected = state.subSelections[tab.key] || tab.subTabs[0][0];
    tab.subTabs.forEach(([key, label]) => {
      const button = makeButton(
        `wrn-subtab${selected === key ? ' active' : ''}`,
        subTabLabel(tab, key, label)
      );
      button.dataset.subkey = key;
      button.addEventListener('click', () => {
        if (state.subSelections[tab.key] === key) return;
        state.subSelections[tab.key] = key;
        renderSubTabs(tab);
        tab.activate(key);
        writeNavigationHistory('push');
      });
      bar.appendChild(button);
    });

    wrap.hidden = false;
    const active = $('.wrn-subtab.active', bar);
    active?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function activateTab(key, fromSwipe = false, runAction = true) {
    if (detailState) closeArticleDetail(false);

    const tab = TABS.find(item => item.key === key);
    if (!tab) return;

    state.activeTab = key;
    document.body.dataset.wrnTab = key;
    closeMorePanel();

    const search = $('.wrn-search-panel');
    if (search && !search.hidden) search.hidden = true;

    $all('.wrn-top-tab').forEach(button => {
      const active = button.dataset.key === key;
      button.classList.toggle('active', active);
      if (active) {
        button.scrollIntoView({
          behavior: fromSwipe ? 'smooth' : 'auto',
          inline: 'center',
          block: 'nearest'
        });
      }
    });

    renderSubTabs(tab);

    if (key === 'briefing') window.WRNBriefing?.show?.();
    else window.WRNBriefing?.hide?.();

    if (key === 'stories') window.WRNStories?.show?.();
    else window.WRNStories?.hide?.();

    if (key === 'video') window.WRNVideoHub?.show?.();
    else window.WRNVideoHub?.hide?.();

    if (key !== 'audio') window.WRNAudioTab181?.close?.();
    if (key !== 'lexicon') window.WRNLexicon184?.hide?.();
    if (key !== 'solidarity') window.WRNPrisonerSolidarity190?.hide?.();
    if (key !== 'about') window.WRNAbout184?.hide?.();

    if (!runAction) return;

    try {
      tab.activate();
    } catch (error) {
      console.error(error);
    } finally {
      if (state.activeTab === key) {
        if (key === 'briefing') window.WRNBriefing?.show?.();
        else window.WRNBriefing?.hide?.();
      }
      if (runAction) writeNavigationHistory('push');
    }
  }

  function updateLanguage() {
    window.WRNI18n?.auditLegacyTranslations?.();
    const copy = texts();

    $all('.wrn-top-tab').forEach(button => {
      button.textContent = button.dataset.key === 'about'
        ? window.WRNAbout184?.label?.(languageKey()) || copy.about || 'About'
        : button.dataset.key === 'lexicon'
          ? window.WRNLexicon184?.label?.(languageKey()) || copy.lexicon || 'Glossary'
        : button.dataset.key === 'solidarity'
          ? window.WRNPrisonerSolidarity190?.label?.(languageKey()) || copy.solidarity || 'Solidarity'
        : copy[button.dataset.key] || button.dataset.key;
    });

    const menuButton = $('.wrn-header-menu');
    const searchButton = $('.wrn-header-search');
    if (menuButton) {
      menuButton.title = copy.settings;
      menuButton.setAttribute('aria-label', copy.settings);
    }
    if (searchButton) {
      searchButton.title = copy.search;
      searchButton.setAttribute('aria-label', copy.search);
    }

    const searchInput = $('.wrn-search-input');
    if (searchInput) {
      searchInput.placeholder = copy.searchPlaceholder;
      searchInput.setAttribute('aria-label', copy.searchPlaceholder);
    }

    const detail = $('.wrn-article-detail');
    if (detail) {
      detail.setAttribute('aria-label', copy.article);
      const back = $('.wrn-detail-back', detail);
      if (back) back.textContent = `← ${copy.back}`;
    }

    const activeTab = TABS.find(tab => tab.key === state.activeTab);
    if (activeTab) renderSubTabs(activeTab);
    if (state.activeTab === 'lexicon') window.WRNLexicon184?.render?.();
    if (state.activeTab === 'solidarity') window.WRNPrisonerSolidarity190?.render?.();
    if (state.activeTab === 'about') window.WRNAbout184?.render?.();

    const morePanel = $('.wrn-more-panel');
    if (morePanel) morePanel.remove();
    window.WRNBriefing?.refreshLanguage?.();
  }

  function buildDetailView() {
    if ($('.wrn-article-detail')) return $('.wrn-article-detail');

    const detail = document.createElement('section');
    detail.className = 'wrn-article-detail';
    detail.hidden = true;
    detail.setAttribute('aria-label', texts().article);
    detail.innerHTML = `
      <div class="wrn-detail-topbar">
        <button class="wrn-detail-back" type="button">← ${texts().back}</button>
        <div class="wrn-detail-heading">${texts().article}</div>
        <img class="wrn-detail-logo" src="./wrn-logo.webp?v=175" alt="">
      </div>
      <div class="wrn-detail-scroll">
        <div class="wrn-detail-host"></div>
      </div>
      <div class="wrn-detail-actions" aria-label="Artikelaktionen"></div>
    `;

    $('.wrn-detail-back', detail).addEventListener('click', () => {
      if (detailState?.historyPushed) history.back();
      else closeArticleDetail(false);
    });

    document.body.appendChild(detail);
    return detail;
  }

  function articleIndex(card) {
    const match = String(card?.id || '').match(/^card-(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  function openArticleDetail(card) {
    if (!card || detailState) return;

    const index = articleIndex(card);
    if (!Number.isInteger(index)) return;

    const detail = buildDetailView();
    const host = $('.wrn-detail-host', detail);
    const heading = $('.wrn-detail-heading', detail);
    const placeholder = document.createElement('div');
    placeholder.className = 'wrn-card-placeholder';

    card.parentNode.insertBefore(placeholder, card);
    const savedScrollY = window.scrollY;

    if (card.dataset.expanded !== 'true' && typeof toggleArticle === 'function') {
      toggleArticle(index);
    }

    card.classList.add('wrn-detail-card');
    card.setAttribute('role', 'article');
    card.removeAttribute('tabindex');

    const buttonRow = card.querySelector('.button-row');
    const buttonPlaceholder = document.createElement('div');
    buttonPlaceholder.className = 'wrn-button-row-placeholder';
    const actionHost = $('.wrn-detail-actions', detail);
    const summaryButton = buttonRow?.querySelector('.wrn-summary-action') || null;
    const summaryPlaceholder = document.createComment('wrn-summary-action');
    const meta = card.querySelector('.meta');

    if (buttonRow && actionHost) {
      if (summaryButton && meta) {
        buttonRow.insertBefore(summaryPlaceholder, summaryButton);
        summaryButton.classList.add('wrn-summary-meta-action-184');
        meta.appendChild(summaryButton);
      }
      buttonRow.parentNode.insertBefore(buttonPlaceholder, buttonRow);
      actionHost.appendChild(buttonRow);

      const expandButton = buttonRow.querySelector('.btn-expand, [id^="expand-"]');
      if (expandButton) {
        expandButton.hidden = true;
        expandButton.setAttribute('aria-hidden', 'true');
        expandButton.tabIndex = -1;
      }
    }

    const title = card.querySelector('.title')?.textContent?.trim() || texts().article;
    if (heading) heading.textContent = title;

    host.appendChild(card);
    detail.hidden = false;
    document.body.classList.add('wrn-detail-open');
    $('.wrn-detail-scroll', detail).scrollTop = 0;

    detailState = {
      card,
      placeholder,
      index,
      savedScrollY,
      buttonRow,
      buttonPlaceholder,
      summaryButton,
      summaryPlaceholder,
      historyPushed: false
    };
    card.dataset.wrnActiveArticle = 'true';
    installPublisherContinuation(currentFilteredItems[index]);

    try {
      history.pushState({ wrnArticleDetail: true }, '', location.href);
      detailState.historyPushed = true;
    } catch {
      detailState.historyPushed = false;
    }
  }

  function closeArticleDetail(restoreScroll = true) {
    if (!detailState) return;

    try { window.WRNSummary?.closeForCard?.(detailState.card); } catch {}

    const {
      card,
      placeholder,
      index,
      savedScrollY,
      buttonRow,
      buttonPlaceholder,
      summaryButton,
      summaryPlaceholder,
      publisherObserver,
      externalRestore
    } = detailState;
    const detail = $('.wrn-article-detail');

    if (card?.dataset.expanded === 'true' && typeof toggleArticle === 'function') {
      toggleArticle(index);
    }

    if (buttonPlaceholder?.parentNode && buttonRow) {
      buttonPlaceholder.parentNode.replaceChild(buttonRow, buttonPlaceholder);
    }
    if (summaryButton && summaryPlaceholder?.parentNode) {
      summaryButton.classList.remove('wrn-summary-meta-action-184');
      summaryPlaceholder.parentNode.replaceChild(summaryButton, summaryPlaceholder);
    }

    card?.classList.remove('wrn-detail-card');
    card?.removeAttribute('data-wrn-active-article');
    card?.setAttribute('role', 'button');
    card?.setAttribute('tabindex', '0');

    if (placeholder?.parentNode && card) {
      placeholder.parentNode.replaceChild(card, placeholder);
    }

    publisherObserver?.disconnect?.();
    $('.wrn-publisher-continuation', detail)?.remove();
    if (detail) detail.hidden = true;
    document.body.classList.remove('wrn-detail-open');
    detailState = null;

    if (typeof externalRestore === 'function') {
      try { externalRestore(); } catch (error) { console.error(error); }
    }

    if (restoreScroll) {
      window.setTimeout(() => window.scrollTo({ top: savedScrollY, behavior: 'auto' }), 0);
    }
  }

  function keyForArticle(article) {
    try {
      return window.WRNReading?.articleKey?.(article)
        || String(article?.link || `${article?.quelleName || ''}::${article?.title || ''}::${article?.pubDate || ''}`);
    } catch {
      return String(article?.link || article?.title || '');
    }
  }

  function publisherForArticle(article) {
    return String(
      article?.quelleName
      || article?.sourceName
      || article?.source
      || ''
    ).trim();
  }

  function publisherContinuationLabel(source) {
    const labels = {
      de: `Weitere Artikel von ${source}`,
      en: `More articles from ${source}`,
      es: `Más artículos de ${source}`,
      fr: `Plus d’articles de ${source}`,
      it: `Altri articoli di ${source}`,
      pt: `Mais artigos de ${source}`,
      ru: `Другие статьи: ${source}`,
      el: `Περισσότερα άρθρα από ${source}`,
      tr: `${source} kaynağından diğer yazılar`
    };
    return labels[languageKey()] || labels.en;
  }

  function installPublisherContinuation(article) {
    if (!detailState?.card || !article) return;
    const source = publisherForArticle(article);
    const currentKey = keyForArticle(article);
    if (!source) return;

    let available = [];
    try {
      const cutoff = Date.now() - (31 * 24 * 60 * 60 * 1000);
      available = (Array.isArray(allNewsData) ? allNewsData : [])
        .filter(item => {
          if (publisherForArticle(item).toLocaleLowerCase() !== source.toLocaleLowerCase()) return false;
          if (keyForArticle(item) === currentKey) return false;
          const stamp = new Date(item?.pubDate || item?.published || item?.date || 0).getTime();
          return !Number.isFinite(stamp) || stamp >= cutoff;
        })
        .sort((left, right) =>
          new Date(right?.pubDate || right?.published || 0)
          - new Date(left?.pubDate || left?.published || 0)
        );
    } catch {
      available = [];
    }
    if (!available.length) return;

    const unique = new Map();
    available.forEach(item => unique.set(keyForArticle(item), item));
    available = [...unique.values()];

    const section = document.createElement('section');
    section.className = 'wrn-publisher-continuation';
    const heading = document.createElement('h2');
    heading.textContent = publisherContinuationLabel(source);
    const list = document.createElement('div');
    list.className = 'wrn-publisher-continuation-list';
    const sentinel = document.createElement('div');
    sentinel.className = 'wrn-publisher-continuation-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    section.append(heading, list, sentinel);
    $('.wrn-detail-host')?.appendChild(section);

    let displayed = 0;

    const renderMore = () => {
      const batch = available.slice(displayed, displayed + 10);
      batch.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wrn-publisher-article-title';
        button.dataset.articleKey = keyForArticle(item);
        const date = new Date(item?.pubDate || item?.published || 0);
        const dateText = Number.isFinite(date.getTime())
          ? date.toLocaleDateString(languageKey())
          : '';
        const title = document.createElement('strong');
        title.textContent = String(item?.title || texts().article);
        button.appendChild(title);
        if (dateText) {
          const dateLabel = document.createElement('span');
          dateLabel.textContent = dateText;
          button.appendChild(dateLabel);
        }
        list.appendChild(button);
      });
      displayed += batch.length;
      if (displayed >= available.length) sentinel.hidden = true;
    };

    section.addEventListener('click', event => {
      const button = event.target.closest('.wrn-publisher-article-title');
      if (!button) return;
      const key = button.dataset.articleKey;
      closeArticleDetail(false);
      window.setTimeout(() => openArticleByKey(key), 0);
    });

    renderMore();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) renderMore();
      }, {
        root: $('.wrn-detail-scroll'),
        rootMargin: '320px 0px'
      });
      observer.observe(sentinel);
      detailState.publisherObserver = observer;
    } else {
      while (displayed < available.length) renderMore();
    }
  }

  function openArticleByKey(key) {
    if (!key || detailState) return false;

    let article = null;
    try {
      if (typeof allNewsData !== 'undefined' && Array.isArray(allNewsData)) {
        article = allNewsData.find(item => keyForArticle(item) === key || String(item?.link || '') === key) || null;
      }
    } catch {}
    if (!article) return false;

    const feed = document.getElementById('feed-container');
    const archive = document.getElementById('archive-container');
    const archiveTitle = document.getElementById('txt-archive-title');
    if (!feed || !archive || typeof renderNextBatch !== 'function') return false;

    const feedFragment = document.createDocumentFragment();
    const archiveFragment = document.createDocumentFragment();
    while (feed.firstChild) feedFragment.appendChild(feed.firstChild);
    while (archive.firstChild) archiveFragment.appendChild(archive.firstChild);

    const snapshot = {
      filtered: typeof currentFilteredItems !== 'undefined' ? currentFilteredItems : [],
      displayed: typeof currentlyDisplayedCount !== 'undefined' ? currentlyDisplayedCount : 0,
      activeKontinent: typeof activeKontinent !== 'undefined' ? activeKontinent : 'Global',
      sourceFilter: typeof currentSourceFilter !== 'undefined' ? currentSourceFilter : 'ALL',
      archiveDisplay: archiveTitle?.style.display || ''
    };

    try {
      currentFilteredItems = [article];
      currentlyDisplayedCount = 0;
      if (typeof isRendering !== 'undefined') isRendering = false;
      renderNextBatch();
      const card = document.getElementById('card-0');
      if (!card) throw new Error('Article card could not be rendered.');
      decorateCard(card);
      openArticleDetail(card);
      if (!detailState) throw new Error('Article detail could not be opened.');

      detailState.externalRestore = () => {
        feed.textContent = '';
        archive.textContent = '';
        feed.appendChild(feedFragment);
        archive.appendChild(archiveFragment);
        currentFilteredItems = snapshot.filtered;
        currentlyDisplayedCount = snapshot.displayed;
        activeKontinent = snapshot.activeKontinent;
        currentSourceFilter = snapshot.sourceFilter;
        if (archiveTitle) archiveTitle.style.display = snapshot.archiveDisplay;
        decorateExistingCards();
        if (state.activeTab === 'briefing') window.WRNBriefing?.show?.();
      };
      return true;
    } catch (error) {
      console.error(error);
      feed.textContent = '';
      archive.textContent = '';
      feed.appendChild(feedFragment);
      archive.appendChild(archiveFragment);
      currentFilteredItems = snapshot.filtered;
      currentlyDisplayedCount = snapshot.displayed;
      activeKontinent = snapshot.activeKontinent;
      currentSourceFilter = snapshot.sourceFilter;
      if (archiveTitle) archiveTitle.style.display = snapshot.archiveDisplay;
      return false;
    }
  }

  window.WRNOpenArticleByKey = openArticleByKey;
  window.WRNActivateTab = key => activateTab(key);

  function decorateCard(card) {
    if (!card || card.dataset.wrnDetailReady === 'true') return;
    card.dataset.wrnDetailReady = 'true';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${texts().article}: ${card.querySelector('.title')?.textContent || ''}`);

    card.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !detailState) {
        event.preventDefault();
        openArticleDetail(card);
      }
    });
  }

  function decorateExistingCards() {
    $all('#feed-container .card, #archive-container .card').forEach(decorateCard);
  }

  function attachCardHandling() {
    decorateExistingCards();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('.card')) decorateCard(node);
          $all('.card', node).forEach(decorateCard);
        });
      });
    });

    ['feed-container', 'archive-container'].forEach(id => {
      const container = document.getElementById(id);
      if (container) observer.observe(container, { childList: true, subtree: true });
    });

    document.addEventListener('click', event => {
      if (detailState) return;

      if (Date.now() < suppressCardClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const card = event.target.closest?.('#feed-container .card, #archive-container .card');
      if (!card) return;
      if (event.target.closest('button, a, input, select, textarea, summary, label')) return;
      openArticleDetail(card);
    });
  }

  function attachSwipe() {
    if (window.__wrnSwipe175Bound) return;
    window.__wrnSwipe175Bound = true;

    let tracking = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let horizontalIntent = false;
    let swipeMode = '';
    let suppressSubtabClickUntil = 0;

    const interactive = [
      'button', 'a', 'input', 'select', 'textarea', 'summary', 'label',
      '.wrn-top-tabs', '.wrn-subtabs', '.wrn-more-panel',
      '.wrn-article-detail', '.feedback-modal', '.global-media-bar'
    ].join(', ');

    const isSwipeSurface = target => Boolean(
      target?.closest?.('#feed-container, #archive-container')
    );

    const isSubtabSurface = target => Boolean(target?.closest?.('.wrn-subtabs'));

    const changeSubtabFromDistance = (dx, dy, duration) => {
      const horizontal = Math.abs(dx);
      const vertical = Math.abs(dy);
      if (horizontal < 44 || horizontal < vertical * 1.15 || duration > 1100) return;

      const tab = TABS.find(item => item.key === state.activeTab);
      if (!tab?.subTabs?.length) return;
      const selected = state.subSelections[tab.key] || tab.subTabs[0][0];
      const index = tab.subTabs.findIndex(([key]) => key === selected);
      const nextIndex = dx < 0
        ? Math.min(tab.subTabs.length - 1, index + 1)
        : Math.max(0, index - 1);
      if (index < 0 || nextIndex === index) return;

      const nextKey = tab.subTabs[nextIndex][0];
      suppressSubtabClickUntil = Date.now() + 420;
      state.subSelections[tab.key] = nextKey;
      renderSubTabs(tab);
      tab.activate(nextKey);
      writeNavigationHistory('push');
    };

    document.addEventListener('click', event => {
      if (Date.now() >= suppressSubtabClickUntil) return;
      if (!event.target.closest?.('.wrn-subtabs')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    const changeTabFromDistance = (dx, dy, duration) => {
      const horizontal = Math.abs(dx);
      const vertical = Math.abs(dy);

      if (horizontal < 48) return;
      if (horizontal < vertical * 1.18) return;
      if (duration > 1100) return;

      const swipeTabs = TABS.filter(tab => !tab.menuOnly);
      const index = swipeTabs.findIndex(tab => tab.key === state.activeTab);
      if (index < 0) return;

      suppressCardClickUntil = Date.now() + 480;

      if (dx < 0 && index < swipeTabs.length - 1) {
        activateTab(swipeTabs[index + 1].key, true);
      } else if (dx > 0 && index > 0) {
        activateTab(swipeTabs[index - 1].key, true);
      }
    };

    if ('PointerEvent' in window) {
      document.addEventListener('pointerdown', event => {
        if (detailState || tracking) return;
        if (event.pointerType === 'mouse') return;
        const onSubtabs = isSubtabSurface(event.target);
        if (!onSubtabs && !isSwipeSurface(event.target)) return;
        if (!onSubtabs && event.target.closest(interactive)) return;

        tracking = true;
        swipeMode = onSubtabs ? 'subtabs' : 'tabs';
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        startTime = performance.now();
        horizontalIntent = false;

        event.target.setPointerCapture?.(event.pointerId);
      }, { passive: true });

      document.addEventListener('pointermove', event => {
        if (!tracking || event.pointerId !== pointerId || detailState) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (
          Math.abs(dx) > 10
          && Math.abs(dx) > Math.abs(dy) * 1.12
        ) {
          horizontalIntent = true;
          event.preventDefault();
        }
      }, { passive: false });

      const finishPointer = event => {
        if (!tracking || event.pointerId !== pointerId) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const duration = performance.now() - startTime;

        tracking = false;
        pointerId = null;

        if (horizontalIntent && !detailState) {
          if (swipeMode === 'subtabs') changeSubtabFromDistance(dx, dy, duration);
          else changeTabFromDistance(dx, dy, duration);
        }
        swipeMode = '';
      };

      document.addEventListener('pointerup', finishPointer, { passive: true });
      document.addEventListener('pointercancel', () => {
        tracking = false;
        pointerId = null;
        horizontalIntent = false;
        swipeMode = '';
      }, { passive: true });

      return;
    }

    /* Rückfall für ältere WebViews. */
    document.addEventListener('touchstart', event => {
      if (detailState || tracking) return;
      const touch = event.changedTouches?.[0];
      const onSubtabs = isSubtabSurface(event.target);
      if (!touch || (!onSubtabs && !isSwipeSurface(event.target))) return;
      if (!onSubtabs && event.target.closest(interactive)) return;

      tracking = true;
      swipeMode = onSubtabs ? 'subtabs' : 'tabs';
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = performance.now();
      horizontalIntent = false;
    }, { passive: true });

    document.addEventListener('touchmove', event => {
      if (!tracking || detailState) return;
      const touch = event.changedTouches?.[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (
        Math.abs(dx) > 10
        && Math.abs(dx) > Math.abs(dy) * 1.12
      ) {
        horizontalIntent = true;
        event.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', event => {
      if (!tracking || detailState) return;
      const touch = event.changedTouches?.[0];
      tracking = false;

      if (!touch || !horizontalIntent) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const duration = performance.now() - startTime;
      if (swipeMode === 'subtabs') changeSubtabFromDistance(dx, dy, duration);
      else changeTabFromDistance(dx, dy, duration);
      swipeMode = '';
    }, { passive: true });

    document.addEventListener('touchcancel', () => {
      tracking = false;
      horizontalIntent = false;
      swipeMode = '';
    }, { passive: true });
  }

  function patchLanguageFunction() {
    if (window.__wrnLanguage175Patched) return;
    window.__wrnLanguage175Patched = true;

    const original = window.changeLanguage;
    if (typeof original !== 'function') return;

    window.changeLanguage = function(...args) {
      const result = original.apply(this, args);
      window.setTimeout(() => {
        updateLanguage();
        window.dispatchEvent(new CustomEvent('wrn-language-change'));
      }, 0);
      return result;
    };
  }

  function updateNormalStatusVisibility() {
    const status = document.getElementById('status-container');
    if (!status) return;

    const normalized = String(status.textContent || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLocaleLowerCase();

    const normalLabels = new Set([
      'aktuelle updates:',
      'aktuelle updates',
      'latest updates:',
      'latest updates',
      'últimas actualizaciones:',
      'últimas actualizaciones',
      'dernières mises à jour :',
      'dernières mises à jour:',
      'ultimi aggiornamenti:',
      'ultimi aggiornamenti',
      'últimas atualizações:',
      'últimas atualizações',
      'последние обновления:',
      'последние обновления',
      'τελευταίες ενημερώσεις:',
      'τελευταίες ενημερώσεις',
      'son güncellemeler:',
      'son güncellemeler'
    ]);

    status.classList.toggle('wrn-normal-update', normalLabels.has(normalized));
  }

  function observeStatusMessage() {
    const status = document.getElementById('status-container');
    if (!status || status.dataset.wrnStatusObserver === '175') return;

    status.dataset.wrnStatusObserver = '175';
    const observer = new MutationObserver(updateNormalStatusVisibility);
    observer.observe(status, {
      childList: true,
      characterData: true,
      subtree: true
    });
    updateNormalStatusVisibility();
  }

  function removeLegacyMobileArtifacts() {
    document.querySelectorAll(
      '#mobile-more-menu, .mobile-more-menu, #language-beta-note'
    ).forEach(element => element.remove());
  }

  function watchForLegacyMobileArtifacts() {
    if (window.__wrnLegacyMenuObserver175) return;
    window.__wrnLegacyMenuObserver175 = true;

    removeLegacyMobileArtifacts();

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;

          if (
            node.matches?.('#mobile-more-menu, .mobile-more-menu, #language-beta-note')
          ) {
            node.remove();
            continue;
          }

          node.querySelectorAll?.(
            '#mobile-more-menu, .mobile-more-menu, #language-beta-note'
          ).forEach(element => element.remove());
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    /* Nach dem vollständigen Start wird nichts Altes mehr neu erzeugt. */
    window.setTimeout(() => observer.disconnect(), 12000);
  }

  function hasLoadedDataset() {
    try {
      return typeof allNewsData !== 'undefined'
        && Array.isArray(allNewsData)
        && allNewsData.length > 0;
    } catch {
      return false;
    }
  }

  function hasRenderedArticles() {
    return Boolean(document.querySelector(
      '#feed-container .card, #archive-container .card'
    ));
  }

  function hasRealStartupError() {
    const status = document.getElementById('status-container');
    const text = String(status?.textContent || '').toLocaleLowerCase();
    return text.includes('kritischer start-fehler')
      || text.includes('[ fehler ]')
      || text.includes('critical startup error');
  }

  function removePrematureNoDataMessage() {
    if (hasLoadedDataset()) return;

    ['feed-container', 'archive-container'].forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;

      Array.from(container.children).forEach(child => {
        const value = String(child.textContent || '')
          .trim()
          .toLocaleUpperCase();

        if (value.includes('NO DATA FOUND')) child.remove();
      });
    });
  }

  let wrnReadyWasSent = false;

  function signalAppReady() {
    if (wrnReadyWasSent) return;
    wrnReadyWasSent = true;
    removePrematureNoDataMessage();
    window.dispatchEvent(new CustomEvent('wrn-app-ready'));
  }

  function waitForInitialContent() {
    const startedAt = Date.now();
    let requestedInitialTab = false;

    const check = () => {
      removeLegacyMobileArtifacts();
      removePrematureNoDataMessage();

      /* Bei einem direkten Link zu einem anderen Reiter wird dieser erst
         aktiviert, nachdem der Datensatz wirklich geladen ist. */
      if (
        !requestedInitialTab
        && !['start', 'briefing'].includes(state.activeTab)
        && hasLoadedDataset()
      ) {
        requestedInitialTab = true;
        activateTab(state.activeTab, false, false);
      }

      if (hasRenderedArticles() || hasRealStartupError()) {
        window.setTimeout(signalAppReady, 180);
        return;
      }

      /* Fallback: Bei sehr langsamen oder blockierten Verbindungen soll
         die Startanimation nicht endlos stehen bleiben. */
      if (Date.now() - startedAt >= 11000) {
        signalAppReady();
        return;
      }

      window.setTimeout(check, 110);
    };

    check();
  }

  function init() {
    const header = document.querySelector('header');
    if (!header) return;

    watchForLegacyMobileArtifacts();
    removeLegacyMobileArtifacts();

    injectBrand(header);
    buildTopNavigation();
    injectHeaderControls(header);
    buildMorePanel();
    buildDetailView();
    attachCardHandling();
    attachSwipe();
    patchLanguageFunction();
    updateLanguage();
    observeStatusMessage();
    window.addEventListener('wrn-briefing-rendered', () => {
      if (state.activeTab !== 'briefing') window.WRNBriefing?.hide?.();
    });

    const hashKey = location.hash?.replace('#tab=', '');
    if (hashKey && TABS.some(tab => tab.key === hashKey)) state.activeTab = hashKey;

    /* Nur die Navigation markieren. Die Haupt-App lädt Global selbst,
       sobald news.json und events.json bereit sind. */
    activateTab(state.activeTab, false, false);
    writeNavigationHistory('replace');

    if (!window.__wrnInitialContentWatch175) {
      window.__wrnInitialContentWatch175 = true;
      waitForInitialContent();
    }
  }

  window.addEventListener('popstate', event => {
    closeMorePanel();
    const search = $('.wrn-search-panel');
    if (search) search.hidden = true;
    if (detailState) {
      closeArticleDetail(true);
      return;
    }
    if (!navigationHistoryReady || !event.state?.wrnNavigation) return;
    const tab = TABS.find(item => item.key === event.state.wrnTab);
    if (!tab) return;
    restoringNavigationHistory = true;
    try {
      state.subSelections = {
        ...state.subSelections,
        ...(event.state.wrnSubSelections || {})
      };
      activateTab(tab.key, false, true);
    } finally {
      restoringNavigationHistory = false;
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (detailState) {
        if (detailState.historyPushed) history.back();
        else closeArticleDetail(true);
      } else {
        closeMorePanel();
      }
    }
  });

  document.addEventListener('click', event => {
    const panel = $('.wrn-more-panel');
    const button = $('.wrn-header-menu');
    if (!panel || panel.hidden) return;
    if (panel.contains(event.target) || button?.contains(event.target)) return;
    closeMorePanel();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('load', () => window.setTimeout(init, 180), { once: true });
})();
