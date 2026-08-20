/* World Revolution News 1.8.4 – eigenständige Artikel-Zusammenfassung */
'use strict';

(() => {
  if (window.WRNSummary) return;

  const CACHE_KEY = 'wrn_article_summaries_v1';
  const PREF_KEY = 'wrn_article_summary_preferences_v1';
  const MAX_CACHE_ITEMS = 80;
  let observer = null;
  let activeUtterance = null;
  let activeView = null;
  let returnFocus = null;

  function language() {
    return window.WRNI18n?.currentLanguage?.() || 'en';
  }

  function t(key, vars = {}) {
    return window.WRNI18n?.t?.(`summary.${key}`, language(), vars) || key;
  }

  function safeJson(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readCache() {
    const parsed = safeJson(localStorage.getItem(CACHE_KEY), {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }

  function writeCache(cache) {
    try {
      const trimmed = Object.fromEntries(
        Object.entries(cache)
          .sort(([, a], [, b]) => Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0))
          .slice(0, MAX_CACHE_ITEMS)
      );
      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  function preferences() {
    const parsed = safeJson(localStorage.getItem(PREF_KEY), {});
    return {
      length: ['short', 'standard', 'detailed'].includes(parsed?.length) ? parsed.length : 'standard'
    };
  }

  function savePreferences(next) {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch {}
  }

  function indexFromCard(card) {
    const match = String(card?.id || '').match(/^card-(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  function articleForCard(card) {
    const index = indexFromCard(card);
    try {
      if (Number.isInteger(index) && typeof currentFilteredItems !== 'undefined') {
        return currentFilteredItems[index] || null;
      }
    } catch {}
    return null;
  }

  function visibleArticleText(card, article) {
    const content = card?.querySelector('.full-content')?.textContent || '';
    if (content && !/^(Text not available|Text nicht verfügbar)\.?$/i.test(content.trim())) return content;
    return article?.content || article?.description || article?.summary || '';
  }

  function visibleTitle(card, article) {
    return card?.querySelector('.title')?.textContent?.trim() || article?.title || '';
  }

  function articleLanguage(card, article) {
    return String(
      card?.dataset.translationLanguage
      || article?.language
      || article?.lang
      || article?.sourceLanguage
      || language()
    ).toLowerCase().split(/[-_]/)[0];
  }

  function articleKey(card, article, text, title) {
    try {
      const base = window.WRNReading?.articleKey?.(article)
        || card?.dataset.articleKey
        || article?.link
        || title;
      return `${base}::${window.WRNSummaryCore.hashText(`${title}|${text}`)}`;
    } catch {
      return `${title}::${text.length}`;
    }
  }

  function getCached(key, length) {
    return readCache()?.[key]?.summaries?.[length] || null;
  }

  function saveCached(key, length, summary, title, source) {
    const cache = readCache();
    const previous = cache[key] || {};
    cache[key] = {
      ...previous,
      title,
      source,
      updatedAt: Date.now(),
      summaries: { ...(previous.summaries || {}), [length]: summary }
    };
    writeCache(cache);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    activeUtterance = null;
    document.querySelectorAll('.wrn-summary-listen').forEach(button => {
      button.textContent = `▶ ${t('listen')}`;
      button.setAttribute('aria-pressed', 'false');
    });
  }

  function speakSummary(summary, button) {
    if (!('speechSynthesis' in window) || !summary?.plainText) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(summary.plainText);
    utterance.lang = summary.language || language();
    const prefix = String(utterance.lang).split('-')[0].toLowerCase();
    const voices = window.speechSynthesis.getVoices?.() || [];
    utterance.voice = voices.find(item => item.localService && String(item.lang || '').toLowerCase().startsWith(prefix))
      || voices.find(item => String(item.lang || '').toLowerCase().startsWith(prefix))
      || null;
    utterance.onend = stopSpeaking;
    utterance.onerror = stopSpeaking;
    activeUtterance = utterance;
    button.textContent = `■ ${t('stop')}`;
    button.setAttribute('aria-pressed', 'true');
    window.speechSynthesis.speak(utterance);
  }

  function summaryText(title, summary) {
    const lines = [title, '', summary.lead];
    summary.bullets.forEach(value => lines.push(`• ${value}`));
    lines.push('', t('notice'));
    return lines.filter(value => value !== undefined).join('\n').trim();
  }

  async function copySummary(title, summary, status) {
    try {
      await navigator.clipboard.writeText(summaryText(title, summary));
      status.textContent = t('copied');
    } catch {
      status.textContent = t('copyFailed');
    }
  }

  async function shareSummary(title, summary, status) {
    const text = summaryText(title, summary);
    try {
      if (navigator.share) await navigator.share({ title: `${t('title')}: ${title}`, text });
      else await copySummary(title, summary, status);
    } catch (error) {
      if (error?.name !== 'AbortError') status.textContent = t('copyFailed');
    }
  }

  function createButton(className, label, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  function setActionExpanded(card, expanded) {
    const index = indexFromCard(card);
    const action = card?.querySelector('.wrn-summary-action')
      || (Number.isInteger(index) ? document.getElementById(`summary-${index}`) : null);
    action?.setAttribute('aria-expanded', String(expanded));
  }

  function ensureView() {
    let view = document.getElementById('wrn-summary-view');
    if (view) return view;

    view = document.createElement('section');
    view.id = 'wrn-summary-view';
    view.className = 'wrn-summary-view';
    view.hidden = true;
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-modal', 'true');
    view.setAttribute('aria-labelledby', 'wrn-summary-view-title');
    view.innerHTML = `
      <header class="wrn-summary-view-header">
        <button type="button" class="wrn-summary-back" data-summary-close></button>
        <div>
          <span class="wrn-summary-kicker"></span>
          <h2 id="wrn-summary-view-title"></h2>
        </div>
        <span class="wrn-summary-private"></span>
      </header>
      <main class="wrn-summary-view-main">
        <section class="wrn-summary-chooser">
          <h3></h3>
          <p></p>
          <div class="wrn-summary-lengths"></div>
        </section>
        <section class="wrn-summary-result" aria-live="polite"></section>
      </main>
    `;
    view.querySelector('[data-summary-close]').addEventListener('click', () => closePanel());
    document.body.appendChild(view);
    return view;
  }

  function updateViewLabels() {
    const view = ensureView();
    view.querySelector('.wrn-summary-back').textContent = `← ${t('back')}`;
    view.querySelector('.wrn-summary-kicker').textContent = `✦ ${t('title')}`;
    view.querySelector('.wrn-summary-private').textContent = `🔒 ${t('local')}`;
    view.querySelector('.wrn-summary-chooser h3').textContent = t('chooseTitle');
    view.querySelector('.wrn-summary-chooser p').textContent = t('chooseHint');
  }

  function closePanel(card = null) {
    if (card && activeView?.card && card !== activeView.card) return;
    stopSpeaking();
    if (activeView?.card) setActionExpanded(activeView.card, false);
    const view = document.getElementById('wrn-summary-view');
    if (view) {
      view.hidden = true;
      view.querySelector('.wrn-summary-result').textContent = '';
    }
    document.body.classList.remove('wrn-summary-view-open');
    activeView = null;
    const focusTarget = returnFocus;
    returnFocus = null;
    focusTarget?.focus?.({ preventScroll: true });
  }

  function renderLengthChoices() {
    if (!activeView) return;
    const view = ensureView();
    const lengths = view.querySelector('.wrn-summary-lengths');
    lengths.textContent = '';
    [
      ['short', t('short')],
      ['standard', t('standard')],
      ['detailed', t('detailed')]
    ].forEach(([value, label]) => {
      const selected = activeView.length === value;
      const button = createButton(
        `wrn-summary-length${selected ? ' active' : ''}`,
        label,
        () => renderSummary(value, false)
      );
      button.setAttribute('aria-pressed', String(selected));
      lengths.appendChild(button);
    });
  }

  function renderSummary(length, force = false) {
    if (!activeView) return;
    activeView.length = length;
    savePreferences({ length });
    renderLengthChoices();

    const { card, article, text, title, source, lang } = activeView;
    const result = ensureView().querySelector('.wrn-summary-result');
    result.textContent = '';

    if (text.length < 120) {
      const empty = document.createElement('p');
      empty.className = 'wrn-summary-empty';
      empty.textContent = t('noText');
      result.appendChild(empty);
      return;
    }

    const cacheKey = articleKey(card, article, text, title);
    let summary = !force ? getCached(cacheKey, length) : null;
    if (!summary) {
      summary = window.WRNSummaryCore.summarizeText(text, { title, length, language: lang });
      summary.createdAt = new Date().toISOString();
      saveCached(cacheKey, length, summary, title, source);
    }

    const body = document.createElement('article');
    body.className = 'wrn-summary-body';
    const lead = document.createElement('p');
    lead.className = 'wrn-summary-lead';
    lead.textContent = summary.lead;
    body.appendChild(lead);
    if (summary.bullets.length) {
      const list = document.createElement('ul');
      summary.bullets.forEach(value => {
        const item = document.createElement('li');
        item.textContent = value;
        list.appendChild(item);
      });
      body.appendChild(list);
    }

    const meta = document.createElement('p');
    meta.className = 'wrn-summary-meta';
    meta.textContent = `${t('compression')}: ${summary.summaryWords}/${summary.sourceWords} ${t('words')} · ${summary.compressionPercent}%`;
    const notice = document.createElement('p');
    notice.className = 'wrn-summary-notice';
    notice.textContent = t('notice');
    const status = document.createElement('div');
    status.className = 'wrn-summary-status';
    status.setAttribute('role', 'status');
    const actions = document.createElement('div');
    actions.className = 'wrn-summary-actions';
    actions.append(
      createButton('wrn-summary-secondary', `↻ ${t('regenerate')}`, () => renderSummary(length, true)),
      createButton('wrn-summary-secondary', `⧉ ${t('copy')}`, () => copySummary(title, summary, status)),
      createButton('wrn-summary-secondary', `↗ ${t('share')}`, () => shareSummary(title, summary, status))
    );
    const listen = createButton('wrn-summary-secondary wrn-summary-listen', `▶ ${t('listen')}`, () => {
      if (activeUtterance) stopSpeaking();
      else speakSummary(summary, listen);
    });
    listen.setAttribute('aria-pressed', 'false');
    actions.appendChild(listen);
    result.append(body, meta, notice, actions, status);
    result.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function openView(card, length = null, force = false) {
    if (!card) return;
    const article = articleForCard(card);
    const text = window.WRNSummaryCore.cleanText(visibleArticleText(card, article));
    const title = visibleTitle(card, article);
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    activeView = {
      card,
      article,
      text,
      title,
      source: article?.quelleName || article?.source || '',
      lang: articleLanguage(card, article),
      length
    };

    const view = ensureView();
    updateViewLabels();
    view.querySelector('#wrn-summary-view-title').textContent = title || t('title');
    view.querySelector('.wrn-summary-result').textContent = '';
    view.hidden = false;
    document.body.classList.add('wrn-summary-view-open');
    setActionExpanded(card, true);
    renderLengthChoices();
    view.scrollTop = 0;
    view.querySelector('.wrn-summary-back')?.focus({ preventScroll: true });
    if (length) renderSummary(length, force);
  }

  function toggleSummary(card) {
    if (!card) return;
    if (activeView?.card === card) closePanel(card);
    else openView(card);
  }

  function ensureSummaryButton(card) {
    if (!(card instanceof Element) || card.querySelector('.wrn-summary-action')) return;
    const row = card.querySelector('.button-row');
    if (!row) return;
    const index = indexFromCard(card);
    const button = createButton('btn-translate wrn-summary-action', `[ ✦ ${t('button')} ]`, event => {
      event.preventDefault();
      event.stopPropagation();
      toggleSummary(card);
    });
    button.id = Number.isInteger(index) ? `summary-${index}` : '';
    button.setAttribute('aria-expanded', 'false');
    const translate = Number.isInteger(index) ? row.querySelector(`#btn-${index}`) : row.querySelector('.btn-translate');
    if (translate?.nextSibling) row.insertBefore(button, translate.nextSibling);
    else row.appendChild(button);
  }

  function scan(root = document) {
    root.querySelectorAll?.('#feed-container .card, #archive-container .card, .wrn-detail-card')
      .forEach(ensureSummaryButton);
  }

  function refreshLabels() {
    document.querySelectorAll('.wrn-summary-action').forEach(button => {
      button.textContent = `[ ✦ ${t('button')} ]`;
    });
    if (activeView) {
      const selectedLength = activeView.length;
      updateViewLabels();
      renderLengthChoices();
      if (selectedLength) renderSummary(selectedLength, false);
    }
  }

  function init() {
    scan();
    ensureView();
    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('.card')) ensureSummaryButton(node);
          scan(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.getElementById('ui-language')?.addEventListener('change', () => {
      window.setTimeout(refreshLabels, 30);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && activeView) {
        event.preventDefault();
        closePanel();
      }
    });
  }

  window.WRNSummary = Object.freeze({
    toggleForCard: toggleSummary,
    renderForCard: (card, length = preferences().length, force = false) => openView(card, length, force),
    closeForCard: closePanel,
    refreshLabels,
    summarizeText: (...args) => window.WRNSummaryCore.summarizeText(...args),
    clearCache() {
      try { localStorage.removeItem(CACHE_KEY); } catch {}
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
