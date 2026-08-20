/* World Revolution News 1.9.0 – curated prisoner solidarity and local letter workshop */
'use strict';

(() => {
  if (window.WRNPrisonerSolidarity190) return;

  const DATA_URL = './prisoner-solidarity.json';
  const STORAGE_PREFIX = 'wrn_prisoner_letter_';
  const LETTER_LANGUAGES = Object.freeze({
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    el: 'Ελληνικά',
    tr: 'Türkçe'
  });
  const hiddenNodes = new Map();
  const state = {
    section: 'current',
    data: null,
    loading: null,
    selectedProfileId: '',
    query: '',
    workshopOpen: false,
    imageUrl: '',
    translation: null
  };

  const UI = {
    en: {
      nav: 'Solidarity',
      title: 'Prisoner solidarity',
      lead: 'Write informed, respectful letters using public addresses verified by established solidarity groups.',
      building: 'Curated · in development',
      limited: 'This is a deliberately small, incomplete directory. An entry is not a legal assessment or a claim to represent every political prisoner.',
      privacy: 'Your draft, return address and inserted image stay on this device. Nothing is uploaded automatically.',
      sections: { current: 'Current', people: 'People', write: 'Write letters', rules: 'Guidance', sources: 'Sources & changes' },
      verified: 'Address checked', reviewDue: 'Review due', stale: 'Address needs rechecking', staleHelp: 'Writing, copying and printing are locked until the public address is verified again.',
      write: 'Write a letter', copy: 'Copy address', copied: 'Address copied', source: 'Check source', related: 'Related WRN articles',
      noRelated: 'No matching article in the current 30-day archive.', search: 'Search people, countries or movements…',
      noPeople: 'No matching profile.', language: 'Suggested correspondence language', institution: 'Institution', country: 'Country',
      address: 'Public mailing address', birthday: 'Birthday', tags: 'Context', profileSources: 'Verification sources',
      start: 'Choose a verified person to open the private letter workshop.', openWorkshop: 'Open workshop',
      guideTitle: 'Before you write', guideIntro: 'Prison mail is usually read and institution rules can change. Check the current address and rules immediately before sending.',
      guideItems: [
        'Introduce yourself without sharing more personal information than you want to make public.',
        'For pre-trial prisoners, do not ask about the alleged case or write anything that could harm them.',
        'Use blue or black ink and plain paper unless the current institution rules say otherwise.',
        'Put your return address on the envelope and inside the letter; number multiple pages.',
        'Avoid promises you cannot keep. Say honestly whether this is a one-time letter or possible correspondence.',
        'Never include glitter, stickers, cash or unconfirmed enclosures. Check photos and printouts separately.'
      ],
      workshopTitle: 'Private letter workshop', workshopPrivacy: 'Local only: the draft and sender field are stored in this browser. Translation sends only the letter text after your confirmation—never the address or sender field.',
      recipient: 'Recipient', returnAddress: 'Your return address (optional)', salutation: 'Greeting', body: 'Letter text', closing: 'Closing',
      template: 'Insert starter', templateText: 'Hello {name},\n\nI learned about you through a prisoner-solidarity project and wanted to send a sign of support. I hope this letter reaches you well. I would like to share a small detail from life outside: \n\nIn solidarity,',
      starterInserted: 'Starter inserted and saved locally.',
      save: 'Save locally', saved: 'Saved on this device', clear: 'Delete draft', translate: 'Translate letter text', translating: 'Translating…',
      translationLanguage: 'Translation language', chooseTranslationLanguage: 'Choose the language for the letter text.', continueTranslation: 'Translate', cancel: 'Cancel',
      translateConfirm: 'Only the letter text will be sent to the configured translation service. Names, prison address and return address are excluded. Continue?',
      translationFailed: 'The translation could not be created.', compare: 'Original and machine translation', useTranslation: 'Use translation', machine: 'Machine translation — please review before printing.',
      image: 'Insert image', imageBlocked: 'Images are disabled because the current mail rules do not confirm that they are allowed.',
      print: 'Print / save PDF', close: 'Close', printWarning: 'Check the address and institution rules again before mailing.',
      sourceTitle: 'Sources and editorial changes', sourcePolicy: 'Only publicly shared prison addresses from trusted support groups are used. Private family, legal-team and release addresses are excluded.',
      download: 'Download current data (JSON)', changes: 'Change log', updated: 'Dataset updated', usedFor: 'Linked profiles',
      rulesUnknown: 'Institution-specific enclosure rules are not confirmed. Use a plain text-only letter and verify current rules at the linked source.',
      error: 'The solidarity directory could not be loaded.'
    },
    de: {
      nav: 'Solidarität',
      title: 'Gefangenen-Solidarität',
      lead: 'Schreibe informierte und respektvolle Briefe mit öffentlichen Adressen, die von etablierten Solidaritätsgruppen geprüft wurden.',
      building: 'Kuratiert · im Aufbau',
      limited: 'Dies ist bewusst ein kleines, unvollständiges Verzeichnis. Ein Eintrag ist keine juristische Bewertung und beansprucht nicht, alle politischen Gefangenen abzubilden.',
      privacy: 'Dein Entwurf, deine Absenderadresse und ein eingefügtes Bild bleiben auf diesem Gerät. Nichts wird automatisch hochgeladen.',
      sections: { current: 'Aktuell', people: 'Personen', write: 'Briefe schreiben', rules: 'Regeln & Hinweise', sources: 'Quellen & Änderungen' },
      verified: 'Adresse geprüft', reviewDue: 'Nächste Prüfung', stale: 'Adresse muss neu geprüft werden', staleHelp: 'Schreiben, Kopieren und Drucken bleiben gesperrt, bis die öffentliche Adresse erneut bestätigt wurde.',
      write: 'Brief schreiben', copy: 'Adresse kopieren', copied: 'Adresse kopiert', source: 'Quelle prüfen', related: 'Passende WRN-Artikel',
      noRelated: 'Kein passender Artikel im aktuellen 30-Tage-Archiv.', search: 'Personen, Länder oder Bewegungen durchsuchen…',
      noPeople: 'Kein passendes Profil.', language: 'Empfohlene Korrespondenzsprache', institution: 'Haftanstalt', country: 'Land',
      address: 'Öffentliche Postadresse', birthday: 'Geburtstag', tags: 'Kontext', profileSources: 'Prüfquellen',
      start: 'Wähle eine geprüfte Person, um die private Schreibwerkstatt zu öffnen.', openWorkshop: 'Schreibwerkstatt öffnen',
      guideTitle: 'Bevor du schreibst', guideIntro: 'Gefängnispost wird meist gelesen und Regeln können sich ändern. Prüfe Adresse und Vorschriften unmittelbar vor dem Versand erneut.',
      guideItems: [
        'Stelle dich vor, ohne mehr persönliche Angaben preiszugeben, als du öffentlich machen möchtest.',
        'Frage Untersuchungshäftlinge nicht nach dem vorgeworfenen Fall und schreibe nichts, das ihnen schaden könnte.',
        'Nutze blauen oder schwarzen Stift und schlichtes Papier, sofern die aktuellen Regeln nichts anderes erlauben.',
        'Schreibe deine Absenderadresse auf den Umschlag und in den Brief; nummeriere mehrere Seiten.',
        'Versprich nur, was du einhalten kannst. Sage ehrlich, ob es ein einmaliger Brief oder mögliche Korrespondenz ist.',
        'Kein Glitzer, keine Aufkleber, kein Bargeld und keine ungeprüften Beilagen. Fotos und Ausdrucke immer gesondert prüfen.'
      ],
      workshopTitle: 'Private Schreibwerkstatt',
      workshopPrivacy: 'Nur lokal: Entwurf und Absenderfeld werden in diesem Browser gespeichert. Beim Übersetzen wird erst nach deiner Bestätigung ausschließlich der Brieftext übertragen – niemals Haft- oder Absenderadresse.',
      recipient: 'Empfänger*in', returnAddress: 'Deine Absenderadresse (optional)', salutation: 'Anrede', body: 'Brieftext', closing: 'Abschluss',
      template: 'Starthilfe einfügen', templateText: 'Hallo {name},\n\nich habe durch ein Gefangenen-Solidaritätsprojekt von dir erfahren und möchte dir ein Zeichen der Unterstützung senden. Ich hoffe, dieser Brief erreicht dich gut. Ich möchte dir eine kleine Beobachtung aus dem Leben draußen erzählen: \n\nIn Solidarität,',
      starterInserted: 'Starthilfe eingefügt und lokal gespeichert.',
      save: 'Lokal speichern', saved: 'Auf diesem Gerät gespeichert', clear: 'Entwurf löschen', translate: 'Brieftext übersetzen', translating: 'Wird übersetzt…',
      translationLanguage: 'Übersetzungssprache', chooseTranslationLanguage: 'Wähle die Sprache für den Brieftext.', continueTranslation: 'Übersetzen', cancel: 'Abbrechen',
      translateConfirm: 'Nur der Brieftext wird an den eingerichteten Übersetzungsdienst gesendet. Namen, Haftadresse und Absenderadresse bleiben ausgeschlossen. Fortfahren?',
      translationFailed: 'Die Übersetzung konnte nicht erstellt werden.', compare: 'Original und maschinelle Übersetzung', useTranslation: 'Übersetzung übernehmen', machine: 'Maschinelle Übersetzung – bitte vor dem Drucken sorgfältig prüfen.',
      image: 'Bild einfügen', imageBlocked: 'Bilder sind deaktiviert, weil die aktuellen Postregeln keine Erlaubnis bestätigen.',
      print: 'Drucken / als PDF speichern', close: 'Schließen', printWarning: 'Prüfe Adresse und Anstaltsregeln vor dem Versand noch einmal.',
      sourceTitle: 'Quellen und redaktionelle Änderungen', sourcePolicy: 'Verwendet werden nur öffentlich geteilte Haftadressen vertrauenswürdiger Solidaritätsgruppen. Private Familien-, Rechtsbeistands- und Entlassungsadressen sind ausgeschlossen.',
      download: 'Aktuelle Daten herunterladen (JSON)', changes: 'Änderungsverlauf', updated: 'Datensatz aktualisiert', usedFor: 'Verknüpfte Profile',
      rulesUnknown: 'Anstaltsspezifische Regeln für Beilagen sind nicht bestätigt. Nutze einen schlichten Textbrief und prüfe die aktuellen Regeln über die verlinkte Quelle.',
      error: 'Das Solidaritätsverzeichnis konnte nicht geladen werden.'
    },
    es: {
      nav: 'Solidaridad', title: 'Solidaridad con personas presas', lead: 'Escribe cartas respetuosas con direcciones públicas verificadas.', building: 'Curado · en construcción',
      limited: 'Directorio deliberadamente pequeño e incompleto; no es una valoración jurídica.', privacy: 'El borrador y tus datos permanecen en este dispositivo.',
      sections: { current: 'Actual', people: 'Personas', write: 'Escribir', rules: 'Reglas y consejos', sources: 'Fuentes y cambios' }
    },
    fr: {
      nav: 'Solidarité', title: 'Solidarité avec les prisonnier·ères', lead: 'Écrivez des lettres respectueuses à partir d’adresses publiques vérifiées.', building: 'Sélectionné · en construction',
      limited: 'Répertoire volontairement limité et incomplet; il ne constitue pas une évaluation juridique.', privacy: 'Le brouillon et vos données restent sur cet appareil.',
      sections: { current: 'Actuel', people: 'Personnes', write: 'Écrire', rules: 'Règles et conseils', sources: 'Sources et changements' }
    },
    it: {
      nav: 'Solidarietà', title: 'Solidarietà con le persone prigioniere', lead: 'Scrivi lettere rispettose usando indirizzi pubblici verificati.', building: 'Curato · in costruzione',
      limited: 'Elenco volutamente limitato e incompleto; non è una valutazione giuridica.', privacy: 'La bozza e i tuoi dati restano su questo dispositivo.',
      sections: { current: 'Attuale', people: 'Persone', write: 'Scrivere', rules: 'Regole e consigli', sources: 'Fonti e modifiche' }
    },
    pt: {
      nav: 'Solidariedade', title: 'Solidariedade com pessoas presas', lead: 'Escreva cartas respeitosas usando endereços públicos verificados.', building: 'Curado · em construção',
      limited: 'Diretório deliberadamente pequeno e incompleto; não é uma avaliação jurídica.', privacy: 'O rascunho e os seus dados ficam neste dispositivo.',
      sections: { current: 'Atual', people: 'Pessoas', write: 'Escrever', rules: 'Regras e dicas', sources: 'Fontes e alterações' }
    },
    ru: {
      nav: 'Солидарность', title: 'Солидарность с заключёнными', lead: 'Пишите уважительные письма по проверенным публичным адресам.', building: 'Подборка · в разработке',
      limited: 'Это намеренно небольшой и неполный список, а не юридическая оценка.', privacy: 'Черновик и ваши данные остаются на этом устройстве.',
      sections: { current: 'Актуальное', people: 'Люди', write: 'Написать', rules: 'Правила и советы', sources: 'Источники и изменения' }
    },
    el: {
      nav: 'Αλληλεγγύη', title: 'Αλληλεγγύη σε φυλακισμένους/ες', lead: 'Γράψτε με σεβασμό χρησιμοποιώντας επαληθευμένες δημόσιες διευθύνσεις.', building: 'Επιμελημένο · υπό κατασκευή',
      limited: 'Σκόπιμα μικρός και ελλιπής κατάλογος· δεν αποτελεί νομική αξιολόγηση.', privacy: 'Το προσχέδιο και τα στοιχεία σας μένουν σε αυτή τη συσκευή.',
      sections: { current: 'Τρέχοντα', people: 'Πρόσωπα', write: 'Γράψτε', rules: 'Κανόνες και συμβουλές', sources: 'Πηγές και αλλαγές' }
    },
    tr: {
      nav: 'Dayanışma', title: 'Tutsaklarla dayanışma', lead: 'Doğrulanmış kamusal adreslerle saygılı mektuplar yazın.', building: 'Küratörlü · yapım aşamasında',
      limited: 'Bu bilinçli olarak küçük ve eksik bir listedir; hukuki değerlendirme değildir.', privacy: 'Taslak ve bilgileriniz bu cihazda kalır.',
      sections: { current: 'Güncel', people: 'Kişiler', write: 'Mektup yaz', rules: 'Kurallar ve öneriler', sources: 'Kaynaklar ve değişiklikler' }
    }
  };

  function lang() {
    const value = document.getElementById('ui-language')?.value || document.documentElement.lang || 'en';
    return window.WRNI18n?.normalizeLanguage?.(value) || String(value).toLowerCase().split(/[-_]/)[0] || 'en';
  }

  function ui(code = lang()) {
    return { ...UI.en, ...(UI[code] || {}), sections: { ...UI.en.sections, ...(UI[code]?.sections || {}) } };
  }

  function localized(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return String(value || '');
    return String(value[lang()] || value.en || value.de || Object.values(value)[0] || '');
  }

  function safeDate(value) {
    const date = new Date(`${String(value || '')}T12:00:00Z`);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function formatDate(value) {
    const date = safeDate(value);
    return date ? new Intl.DateTimeFormat(lang(), { year: 'numeric', month: 'short', day: 'numeric' }).format(date) : '—';
  }

  function isCurrent(profile) {
    const review = String(profile?.verification?.nextReviewAt || '');
    const today = new Date().toISOString().slice(0, 10);
    return profile?.verification?.status === 'verified'
      && /^\d{4}-\d{2}-\d{2}$/.test(review)
      && review >= today;
  }

  function normalize(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function externalLink(url, label, className = '') {
    const link = document.createElement('a');
    link.href = String(url || '#');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    if (className) link.className = className;
    return link;
  }

  async function loadData() {
    if (state.data) return state.data;
    if (state.loading) return state.loading;
    state.loading = fetch(DATA_URL, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data?.profiles) || !Array.isArray(data?.sources)) throw new Error('Invalid solidarity data');
        state.data = data;
        if (!state.selectedProfileId) state.selectedProfileId = data.profiles.find(isCurrent)?.id || data.profiles[0]?.id || '';
        return data;
      })
      .finally(() => { state.loading = null; });
    return state.loading;
  }

  function ensureRoot() {
    let root = document.getElementById('wrn-prisoner-solidarity-190');
    if (root) return root;
    root = document.createElement('section');
    root.id = 'wrn-prisoner-solidarity-190';
    root.className = 'wrn-prisoner-solidarity-190';
    root.hidden = true;
    /*
     * Briefing and other auxiliary views may temporarily hide their own
     * <main> element. Keep this independent top-level view directly below
     * <body> so it cannot inherit another module's hidden state.
     */
    document.body.appendChild(root);
    return root;
  }

  function hideStandard() {
    [
      'feed-container', 'archive-container', 'event-filter-panel', 'status-container',
      'txt-archive-title', 'wrn-video-hub', 'wrn-stories-view', 'wrn-audio-tab-183',
      'wrn-briefing-2', 'wrn-about-184', 'wrn-lexicon-184'
    ].forEach(id => {
      const node = document.getElementById(id);
      if (!node || node.id === 'wrn-prisoner-solidarity-190') return;
      if (!hiddenNodes.has(node)) hiddenNodes.set(node, { hidden: node.hidden, display: node.style.display });
      node.hidden = true;
      node.style.display = 'none';
    });
  }

  function findRelated(profile) {
    let items = [];
    try {
      if (typeof allNewsData !== 'undefined' && Array.isArray(allNewsData)) items = allNewsData;
    } catch {}
    const aliases = (profile?.aliases || []).map(normalize).filter(alias => alias.length >= 5);
    if (!aliases.length) return [];
    const unique = new Map();
    items.forEach(article => {
      const haystack = normalize([
        article?.title, article?.teaser, article?.description, article?.content,
        article?.text, article?.quelleName
      ].filter(Boolean).join(' '));
      if (!aliases.some(alias => haystack.includes(alias))) return;
      const key = window.WRNReading?.articleKey?.(article) || String(article?.link || '');
      if (key) unique.set(key, { key, article });
    });
    return [...unique.values()]
      .sort((a, b) => new Date(b.article?.pubDate || 0) - new Date(a.article?.pubDate || 0))
      .slice(0, 12);
  }

  function renderRelated(profile, host) {
    const t = ui();
    const section = document.createElement('section');
    section.className = 'wrn-solidarity-related-190';
    const title = document.createElement('h4');
    title.textContent = t.related;
    section.appendChild(title);
    const related = findRelated(profile);
    if (!related.length) {
      const empty = document.createElement('p');
      empty.textContent = t.noRelated;
      section.appendChild(empty);
    } else {
      related.forEach(({ key, article }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wrn-solidarity-article-190';
        const source = String(article?.quelleName || article?.sourceName || '');
        button.innerHTML = `<strong></strong><small></small>`;
        button.querySelector('strong').textContent = String(article?.title || t.related);
        button.querySelector('small').textContent = [source, formatDate(String(article?.pubDate || '').slice(0, 10))].filter(Boolean).join(' · ');
        button.addEventListener('click', () => {
          hide();
          window.WRNOpenArticleByKey?.(key);
        });
        section.appendChild(button);
      });
    }
    host.appendChild(section);
  }

  function addressText(profile) {
    return (profile?.mailingAddress?.lines || []).join('\n');
  }

  function sourceById(sourceId) {
    return state.data?.sources?.find(source => source.id === sourceId) || null;
  }

  function renderProfileSourceLinks(profile, host) {
    const sourceIds = [...new Set(profile?.verification?.sourceIds || [])];
    sourceIds.forEach(sourceId => {
      const source = sourceById(sourceId);
      if (!source?.url) return;
      host.appendChild(externalLink(source.url, source.name || sourceId));
    });
    if (!host.children.length && profile?.verification?.profileUrl) {
      host.appendChild(externalLink(profile.verification.profileUrl, ui().source));
    }
  }

  async function copyAddress(profile, button) {
    if (!isCurrent(profile)) return;
    try {
      await navigator.clipboard.writeText(addressText(profile));
    } catch {
      const area = document.createElement('textarea');
      area.value = addressText(profile);
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const original = button.textContent;
    button.textContent = ui().copied;
    window.setTimeout(() => { button.textContent = original; }, 1600);
  }

  function profileCard(profile, detailed = false) {
    const t = ui();
    const current = isCurrent(profile);
    const card = document.createElement('article');
    card.className = `wrn-solidarity-profile-190${current ? '' : ' stale'}`;
    const head = document.createElement('div');
    head.className = 'wrn-solidarity-profile-head-190';
    const title = document.createElement('div');
    const badge = document.createElement('span');
    const name = document.createElement('h3');
    const meta = document.createElement('p');
    name.textContent = profile.publicName;
    meta.textContent = `${profile.institution} · ${profile.country}`;
    badge.className = `wrn-solidarity-verified-190 ${current ? 'valid' : 'stale'}`;
    badge.textContent = current ? `${t.verified}: ${formatDate(profile.verification.verifiedAt)}` : t.stale;
    title.append(name, meta);
    head.append(title, badge);

    const context = document.createElement('p');
    context.textContent = localized(profile.context);
    const tags = document.createElement('div');
    tags.className = 'wrn-solidarity-tags-190';
    (profile.movementTags || []).forEach(value => {
      const tag = document.createElement('span');
      tag.textContent = value;
      tags.appendChild(tag);
    });

    const address = document.createElement('address');
    address.textContent = addressText(profile);
    const review = document.createElement('small');
    review.className = 'wrn-solidarity-review-190';
    review.textContent = `${t.reviewDue}: ${formatDate(profile.verification.nextReviewAt)}`;
    const actions = document.createElement('div');
    actions.className = 'wrn-solidarity-actions-190';
    const write = document.createElement('button');
    const copy = document.createElement('button');
    write.type = copy.type = 'button';
    write.textContent = t.write;
    copy.textContent = t.copy;
    write.disabled = copy.disabled = !current;
    write.addEventListener('click', () => openWorkshop(profile.id));
    copy.addEventListener('click', () => copyAddress(profile, copy));
    actions.append(write, copy, externalLink(profile.verification.profileUrl, t.source));

    card.append(head, context, tags, address, review);
    if (!current) {
      const warning = document.createElement('p');
      warning.className = 'wrn-solidarity-stale-help-190';
      warning.textContent = t.staleHelp;
      card.appendChild(warning);
    }
    card.appendChild(actions);
    if (detailed) {
      const details = document.createElement('dl');
      details.innerHTML = `<div><dt></dt><dd></dd></div><div><dt></dt><dd></dd></div><div><dt></dt><dd></dd></div>`;
      const rows = details.querySelectorAll('div');
      rows[0].querySelector('dt').textContent = t.language;
      rows[0].querySelector('dd').textContent = (profile.languages || []).join(', ').toUpperCase();
      rows[1].querySelector('dt').textContent = t.birthday;
      rows[1].querySelector('dd').textContent = profile.birthday || '—';
      rows[2].querySelector('dt').textContent = t.profileSources;
      rows[2].querySelector('dd').className = 'wrn-solidarity-profile-sources-190';
      renderProfileSourceLinks(profile, rows[2].querySelector('dd'));
      card.appendChild(details);
      renderRelated(profile, card);
    }
    return card;
  }

  function renderCurrent(host) {
    const profiles = (state.data?.profiles || [])
      .filter(isCurrent)
      .sort((a, b) => {
        const regionPriority = value => value === 'Europe' ? 0 : 1;
        return regionPriority(a.region) - regionPriority(b.region)
          || String(a.publicName).localeCompare(String(b.publicName), lang());
      });
    profiles.forEach(profile => host.appendChild(profileCard(profile)));
  }

  function renderPeople(host) {
    const t = ui();
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'wrn-solidarity-search-190';
    search.placeholder = t.search;
    search.value = state.query;
    search.addEventListener('input', () => {
      state.query = search.value;
      render();
      const next = ensureRoot().querySelector('.wrn-solidarity-search-190');
      next?.focus();
      next?.setSelectionRange(state.query.length, state.query.length);
    });
    host.appendChild(search);
    const query = normalize(state.query);
    const profiles = (state.data?.profiles || []).filter(profile =>
      !query || normalize([
        profile.publicName, profile.country, profile.institution,
        ...(profile.movementTags || []), ...(profile.aliases || [])
      ].join(' ')).includes(query)
    );
    if (!profiles.length) {
      const empty = document.createElement('p');
      empty.textContent = t.noPeople;
      host.appendChild(empty);
      return;
    }
    profiles.forEach(profile => host.appendChild(profileCard(profile, true)));
  }

  function renderWrite(host) {
    const t = ui();
    const card = document.createElement('section');
    card.className = 'wrn-solidarity-write-start-190';
    const intro = document.createElement('p');
    intro.textContent = t.start;
    const select = document.createElement('select');
    select.setAttribute('aria-label', t.recipient);
    (state.data?.profiles || []).forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = `${profile.publicName}${isCurrent(profile) ? '' : ` — ${t.stale}`}`;
      option.disabled = !isCurrent(profile);
      select.appendChild(option);
    });
    select.value = state.selectedProfileId;
    select.addEventListener('change', () => { state.selectedProfileId = select.value; });
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = t.openWorkshop;
    open.addEventListener('click', () => openWorkshop(select.value));
    card.append(intro, select, open);
    host.appendChild(card);
  }

  function renderRules(host) {
    const t = ui();
    const panel = document.createElement('section');
    panel.className = 'wrn-solidarity-guidance-190';
    const title = document.createElement('h3');
    const intro = document.createElement('p');
    title.textContent = t.guideTitle;
    intro.textContent = t.guideIntro;
    const list = document.createElement('ol');
    t.guideItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    const unknown = document.createElement('p');
    unknown.className = 'wrn-solidarity-notice-190';
    unknown.textContent = t.rulesUnknown;
    panel.append(title, intro, list, unknown, externalLink('https://nycabc.wordpress.com/write-a-letter/', t.source, 'primary'));
    host.appendChild(panel);
  }

  function downloadData() {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wrn-prisoner-solidarity-${String(state.data?.generatedAt || '').slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function renderSources(host) {
    const t = ui();
    const panel = document.createElement('section');
    panel.className = 'wrn-solidarity-sources-190';
    const title = document.createElement('h3');
    const policy = document.createElement('p');
    title.textContent = t.sourceTitle;
    policy.textContent = t.sourcePolicy;
    panel.append(title, policy);
    (state.data?.sources || []).forEach(source => {
      const card = document.createElement('article');
      const heading = document.createElement('h4');
      const meta = document.createElement('small');
      const usedFor = document.createElement('p');
      heading.textContent = source.name;
      meta.textContent = `${source.kind} · ${t.verified}: ${formatDate(source.checkedAt)}`;
      const linkedProfiles = (state.data?.profiles || [])
        .filter(profile => profile.verification?.sourceIds?.includes(source.id))
        .map(profile => profile.publicName);
      usedFor.textContent = `${t.usedFor}: ${linkedProfiles.join(', ') || '—'}`;
      card.append(heading, meta, usedFor, externalLink(source.url, t.source));
      if (source.downloadUrl) card.appendChild(externalLink(source.downloadUrl, 'PDF'));
      panel.appendChild(card);
    });
    const download = document.createElement('button');
    download.type = 'button';
    download.textContent = t.download;
    download.addEventListener('click', downloadData);
    const changed = document.createElement('h4');
    changed.textContent = t.changes;
    const list = document.createElement('ul');
    (state.data?.changes || []).forEach(change => {
      const item = document.createElement('li');
      item.textContent = `${formatDate(change.date)} · ${change.text}`;
      list.appendChild(item);
    });
    panel.append(download, changed, list);
    host.appendChild(panel);
  }

  function renderHeader(root) {
    const t = ui();
    const header = document.createElement('header');
    header.className = 'wrn-solidarity-header-190';
    const meta = document.createElement('div');
    const badge = document.createElement('span');
    const title = document.createElement('h2');
    const lead = document.createElement('p');
    const limited = document.createElement('p');
    const privacy = document.createElement('p');
    badge.textContent = t.building;
    title.textContent = t.title;
    lead.textContent = t.lead;
    limited.className = 'wrn-solidarity-limited-190';
    limited.textContent = t.limited;
    privacy.className = 'wrn-solidarity-privacy-190';
    privacy.textContent = `🔒 ${t.privacy}`;
    meta.append(badge, title, lead);
    header.append(meta, limited, privacy);
    root.appendChild(header);
  }

  function render() {
    const root = ensureRoot();
    root.textContent = '';
    renderHeader(root);
    if (!state.data) {
      const status = document.createElement('p');
      status.className = 'wrn-solidarity-loading-190';
      status.textContent = ui().error;
      root.appendChild(status);
      return;
    }
    const content = document.createElement('div');
    content.className = 'wrn-solidarity-content-190';
    root.appendChild(content);
    if (state.section === 'people') renderPeople(content);
    else if (state.section === 'write') renderWrite(content);
    else if (state.section === 'rules') renderRules(content);
    else if (state.section === 'sources') renderSources(content);
    else renderCurrent(content);
  }

  function selectedProfile(id = state.selectedProfileId) {
    return state.data?.profiles?.find(profile => profile.id === id) || null;
  }

  function draftKey(profileId) {
    return `${STORAGE_PREFIX}${profileId}`;
  }

  function getDraft(profileId) {
    try { return JSON.parse(localStorage.getItem(draftKey(profileId)) || '{}'); } catch { return {}; }
  }

  function workshopValues(dialog) {
    return {
      returnAddress: dialog.querySelector('[name="returnAddress"]')?.value || '',
      salutation: dialog.querySelector('[name="salutation"]')?.value || '',
      body: dialog.querySelector('[name="body"]')?.value || '',
      closing: dialog.querySelector('[name="closing"]')?.value || '',
      savedAt: new Date().toISOString()
    };
  }

  function saveDraft(dialog, announce = true) {
    const profile = selectedProfile();
    if (!profile) return;
    localStorage.setItem(draftKey(profile.id), JSON.stringify(workshopValues(dialog)));
    if (announce) setWorkshopStatus(ui().saved);
  }

  function setWorkshopStatus(message, error = false) {
    const node = document.querySelector('.wrn-solidarity-workshop-status-190');
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', error);
  }

  function clearDraft(dialog) {
    const profile = selectedProfile();
    if (!profile) return;
    localStorage.removeItem(draftKey(profile.id));
    ['returnAddress', 'salutation', 'body', 'closing'].forEach(name => {
      const field = dialog.querySelector(`[name="${name}"]`);
      if (field) field.value = '';
    });
    state.translation = null;
    dialog.querySelector('.wrn-solidarity-translation-190')?.replaceChildren();
    setWorkshopStatus(ui().clear);
  }

  function insertStarter(dialog, profile) {
    const t = ui();
    const lines = t.templateText
      .replace('{name}', profile.publicName)
      .split(/\r?\n/);
    const nonEmpty = lines.map(line => line.trim()).filter(Boolean);
    const salutation = dialog.querySelector('[name="salutation"]');
    const body = dialog.querySelector('[name="body"]');
    const closing = dialog.querySelector('[name="closing"]');
    if (salutation && !salutation.value.trim()) salutation.value = nonEmpty[0] || '';
    if (body) body.value = nonEmpty.slice(1, -1).join('\n\n');
    if (closing && !closing.value.trim()) closing.value = nonEmpty.at(-1) || '';
    body?.dispatchEvent(new Event('input', { bubbles: true }));
    saveDraft(dialog, false);
    setWorkshopStatus(t.starterInserted);
    body?.focus();
  }

  function openTranslationLanguageDialog(workshop, button) {
    const t = ui();
    const profile = selectedProfile();
    const dialog = document.createElement('dialog');
    dialog.className = 'wrn-solidarity-language-dialog-190';
    dialog.setAttribute('aria-labelledby', 'wrn-solidarity-language-title-190');
    const languageOptions = Object.entries(LETTER_LANGUAGES)
      .map(([code, label]) => `<option value="${code}">${label}</option>`)
      .join('');
    dialog.innerHTML = `
      <form method="dialog">
        <h3 id="wrn-solidarity-language-title-190">${t.translationLanguage}</h3>
        <p>${t.chooseTranslationLanguage}</p>
        <label>
          <span>${t.translationLanguage}</span>
          <select name="targetLanguage">${languageOptions}</select>
        </label>
        <p class="wrn-solidarity-language-privacy-190">🔒 ${t.translateConfirm}</p>
        <div>
          <button type="submit" value="cancel">${t.cancel}</button>
          <button type="button" class="primary">${t.continueTranslation}</button>
        </div>
      </form>`;
    const select = dialog.querySelector('select');
    const preferred = profile?.languages?.find(code => LETTER_LANGUAGES[code])
      || (LETTER_LANGUAGES[lang()] ? lang() : 'en');
    select.value = preferred;
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    dialog.querySelector('.primary').addEventListener('click', () => {
      const targetLanguage = select.value;
      dialog.close();
      translateDraft(workshop, button, targetLanguage);
    });
    workshop.appendChild(dialog);
    dialog.showModal();
    select.focus();
  }

  async function translateDraft(dialog, button, targetLanguage) {
    const t = ui();
    const body = dialog.querySelector('[name="body"]')?.value.trim();
    if (!body) return;
    button.disabled = true;
    button.textContent = t.translating;
    setWorkshopStatus(t.translating);
    try {
      const result = await window.WRNSharedTranslations?.request?.({
        title: '',
        text: body,
        mode: 'continuation',
        targetLanguage
      });
      if (!result || result.error || !String(result.text || '').trim()) throw new Error(result?.message || 'Translation failed');
      state.translation = { original: body, translated: String(result.text).trim(), language: targetLanguage };
      renderTranslation(dialog);
      setWorkshopStatus(t.machine);
    } catch (error) {
      console.error(error);
      setWorkshopStatus(t.translationFailed, true);
    } finally {
      button.disabled = false;
      button.textContent = t.translate;
    }
  }

  function renderTranslation(dialog) {
    const t = ui();
    const host = dialog.querySelector('.wrn-solidarity-translation-190');
    if (!host || !state.translation) return;
    host.textContent = '';
    const title = document.createElement('h3');
    const grid = document.createElement('div');
    const original = document.createElement('section');
    const translated = document.createElement('section');
    const use = document.createElement('button');
    title.textContent = t.compare;
    original.innerHTML = '<h4>Original</h4><p></p>';
    translated.innerHTML = `<h4>${t.machine}</h4><p></p>`;
    original.querySelector('p').textContent = state.translation.original;
    translated.querySelector('p').textContent = state.translation.translated;
    use.type = 'button';
    use.textContent = t.useTranslation;
    use.addEventListener('click', () => {
      dialog.querySelector('[name="body"]').value = state.translation.translated;
      saveDraft(dialog);
    });
    grid.append(original, translated);
    host.append(title, grid, use);
  }

  function handleImage(dialog, file) {
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.imageUrl = file ? URL.createObjectURL(file) : '';
    const preview = dialog.querySelector('.wrn-solidarity-image-preview-190');
    preview.textContent = '';
    if (!state.imageUrl) return;
    const image = document.createElement('img');
    image.src = state.imageUrl;
    image.alt = '';
    preview.appendChild(image);
  }

  async function printLetter(dialog) {
    const profile = selectedProfile();
    if (!profile || !isCurrent(profile)) return;
    saveDraft(dialog, false);
    const values = workshopValues(dialog);
    const printArea = document.createElement('article');
    printArea.id = 'wrn-solidarity-print-190';
    const address = document.createElement('address');
    const sender = document.createElement('address');
    const letter = document.createElement('div');
    address.textContent = addressText(profile);
    sender.textContent = values.returnAddress;
    letter.innerHTML = '<p class="salutation"></p><div class="body"></div><p class="closing"></p>';
    letter.querySelector('.salutation').textContent = values.salutation;
    letter.querySelector('.body').textContent = values.body;
    letter.querySelector('.closing').textContent = values.closing;
    printArea.append(sender, address, letter);
    if (state.imageUrl && profile.mailRules?.imagesAllowed === true) {
      const image = document.createElement('img');
      image.src = state.imageUrl;
      image.alt = '';
      printArea.appendChild(image);
    }
    const warning = document.createElement('footer');
    warning.textContent = ui().printWarning;
    printArea.appendChild(warning);
    document.body.appendChild(printArea);
    const cleanup = () => printArea.remove();
    window.addEventListener('afterprint', cleanup, { once: true });
    try {
      await (window.WRNDeviceBridge?.print?.(ui().print) || Promise.resolve(window.print()));
    } catch (error) {
      console.warn('Letter print unavailable', error?.name || 'error');
      cleanup();
      return;
    }
    window.setTimeout(cleanup, 60_000);
  }

  function closeWorkshop() {
    const dialog = document.getElementById('wrn-solidarity-workshop-190');
    if (dialog) {
      saveDraft(dialog, false);
      dialog.remove();
    }
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.imageUrl = '';
    state.translation = null;
    state.workshopOpen = false;
    document.body.classList.remove('wrn-solidarity-workshop-open');
  }

  function openWorkshop(profileId) {
    const profile = selectedProfile(profileId);
    if (!profile || !isCurrent(profile)) return false;
    state.selectedProfileId = profile.id;
    closeWorkshop();
    state.workshopOpen = true;
    document.body.classList.add('wrn-solidarity-workshop-open');
    const t = ui();
    const draft = getDraft(profile.id);
    const overlay = document.createElement('section');
    overlay.id = 'wrn-solidarity-workshop-190';
    overlay.className = 'wrn-solidarity-workshop-190';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wrn-solidarity-workshop-title-190');
    overlay.innerHTML = `
      <header>
        <div><span>${t.recipient}</span><h2 id="wrn-solidarity-workshop-title-190"></h2><small></small></div>
        <button type="button" class="wrn-solidarity-close-190" aria-label="${t.close}">×</button>
      </header>
      <div class="wrn-solidarity-workshop-scroll-190">
        <p class="wrn-solidarity-workshop-privacy-190"></p>
        <div class="wrn-solidarity-workshop-grid-190">
          <aside><h3>${t.address}</h3><address></address><p></p><a target="_blank" rel="noopener noreferrer"></a></aside>
          <main>
            <label><span>${t.returnAddress}</span><textarea name="returnAddress" rows="3"></textarea></label>
            <label><span>${t.salutation}</span><input name="salutation" type="text"></label>
            <label><span>${t.body}</span><textarea name="body" rows="14"></textarea></label>
            <label><span>${t.closing}</span><textarea name="closing" rows="3"></textarea></label>
            <div class="wrn-solidarity-image-field-190"><label><span>${t.image}</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp"></label><small></small><div class="wrn-solidarity-image-preview-190"></div></div>
            <div class="wrn-solidarity-translation-190"></div>
          </main>
        </div>
      </div>
      <footer>
        <div class="wrn-solidarity-workshop-status-190" aria-live="polite"></div>
        <div class="wrn-solidarity-workshop-actions-190">
          <button type="button" data-action="template">${t.template}</button>
          <button type="button" data-action="save">${t.save}</button>
          <button type="button" data-action="translate">${t.translate}</button>
          <button type="button" data-action="clear">${t.clear}</button>
          <button type="button" data-action="print" class="primary">${t.print}</button>
          <button type="button" data-action="close">${t.close}</button>
        </div>
      </footer>`;
    overlay.querySelector('h2').textContent = profile.publicName;
    overlay.querySelector('header small').textContent = `${profile.institution} · ${t.verified}: ${formatDate(profile.verification.verifiedAt)}`;
    overlay.querySelector('.wrn-solidarity-workshop-privacy-190').textContent = `🔒 ${t.workshopPrivacy}`;
    overlay.querySelector('aside address').textContent = addressText(profile);
    overlay.querySelector('aside p').textContent = localized(profile.mailRules?.notes) || t.rulesUnknown;
    const sourceLink = overlay.querySelector('aside a');
    sourceLink.href = profile.verification.profileUrl;
    sourceLink.textContent = t.source;
    overlay.querySelector('[name="returnAddress"]').value = draft.returnAddress || '';
    overlay.querySelector('[name="salutation"]').value = draft.salutation || '';
    overlay.querySelector('[name="body"]').value = draft.body || '';
    overlay.querySelector('[name="closing"]').value = draft.closing || '';
    const imageInput = overlay.querySelector('[name="image"]');
    imageInput.disabled = profile.mailRules?.imagesAllowed !== true;
    overlay.querySelector('.wrn-solidarity-image-field-190 small').textContent =
      imageInput.disabled ? t.imageBlocked : '';
    imageInput.addEventListener('change', () => handleImage(overlay, imageInput.files?.[0]));
    overlay.querySelector('.wrn-solidarity-close-190').addEventListener('click', closeWorkshop);
    overlay.querySelector('[data-action="close"]').addEventListener('click', closeWorkshop);
    overlay.querySelector('[data-action="save"]').addEventListener('click', () => saveDraft(overlay));
    overlay.querySelector('[data-action="clear"]').addEventListener('click', () => clearDraft(overlay));
    overlay.querySelector('[data-action="template"]').addEventListener('click', () => insertStarter(overlay, profile));
    overlay.querySelector('[data-action="translate"]').addEventListener('click', event => {
      openTranslationLanguageDialog(overlay, event.currentTarget);
    });
    overlay.querySelector('[data-action="print"]').addEventListener('click', () => void printLetter(overlay));
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeWorkshop();
    });
    document.body.appendChild(overlay);
    overlay.querySelector('[name="salutation"]')?.focus();
    return true;
  }

  async function show(section = state.section) {
    state.section = UI.en.sections[section] ? section : 'current';
    hideStandard();
    const root = ensureRoot();
    root.hidden = false;
    root.style.display = 'block';
    root.textContent = '';
    const loading = document.createElement('p');
    loading.className = 'wrn-solidarity-loading-190';
    loading.textContent = '…';
    root.appendChild(loading);
    try {
      await loadData();
      render();
    } catch (error) {
      console.error(error);
      loading.textContent = ui().error;
    }
    document.body.dataset.wrnTab = 'solidarity';
  }

  function hide() {
    closeWorkshop();
    const root = document.getElementById('wrn-prisoner-solidarity-190');
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

  window.addEventListener('wrnlanguagechange', () => {
    if (!document.getElementById('wrn-prisoner-solidarity-190')?.hidden) render();
    if (state.workshopOpen) {
      const profileId = state.selectedProfileId;
      closeWorkshop();
      openWorkshop(profileId);
    }
  });

  window.WRNPrisonerSolidarity190 = Object.freeze({
    show,
    hide,
    render,
    openWorkshop,
    closeWorkshop,
    label: code => ui(code).nav,
    sectionLabel: (section, code) => ui(code).sections[section] || section,
    isCurrent,
    loadData,
    draftPrefix: STORAGE_PREFIX
  });
})();
