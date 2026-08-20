'use strict';

(() => {
  const workerInput = document.getElementById('worker-url');
  const tokenInput = document.getElementById('admin-token');
  const loginForm = document.getElementById('admin-login');
  const status = document.getElementById('login-status');
  const dashboard = document.getElementById('dashboard');
  const list = document.getElementById('feedback-list');
  const detail = document.getElementById('feedback-detail');
  const count = document.getElementById('feedback-count');
  const operations = document.getElementById('operations');
  const pushCount = document.getElementById('push-count');
  const pushForm = document.getElementById('push-form');
  const pushStatus = document.getElementById('push-status');
  let credentials = null;

  workerInput.value = window.WRN_CONFIG?.proxyUrl || 'https://revolution-proxy.paghklo.workers.dev';

  const escaped = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[character]);

  async function api(action, parameters = {}) {
    const url = new URL(credentials.worker);
    url.searchParams.set('action', action);
    Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      headers: { Authorization: `Bearer ${credentials.token}`, Accept: 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.message || `HTTP ${response.status}`);
    return data;
  }

  async function apiPost(action, payload = {}) {
    const response = await fetch(credentials.worker, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'omit',
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) throw new Error(data.message || `HTTP ${response.status}`);
    return data;
  }

  const commaList = value => [...new Set(String(value || '').split(',').map(item => item.trim()).filter(Boolean))].slice(0, 30);

  function renderOperations(payload) {
    const quotas = payload?.status?.quotas || [];
    operations.innerHTML = quotas.length ? quotas.map(item => {
      const level = item.percent >= 100 ? 'danger' : item.percent >= 80 ? 'warning' : '';
      return `<article class="quota ${level}"><span>${escaped(item.label)}</span><strong>${escaped(item.percent)} %</strong><progress max="100" value="${Number(item.percent) || 0}"></progress><small>${escaped(item.used)} / ${escaped(item.limit)} · Reset ${escaped(item.resetAt || '—')}</small></article>`;
    }).join('') : '<p>Noch kein Betriebsstatus vorhanden.</p>';
  }

  async function openFeedback(key, button) {
    list.querySelectorAll('button').forEach(item => item.removeAttribute('aria-current'));
    button?.setAttribute('aria-current', 'true');
    detail.innerHTML = '<p>Nachricht wird geladen …</p>';
    const payload = await api('admin.feedback.read', { key });
    const item = payload.item || {};
    detail.innerHTML = `<h3>${escaped(item.category || 'Feedback')}</h3><dl><dt>Eingang</dt><dd>${escaped(new Date(item.createdAt).toLocaleString('de-CH'))}</dd><dt>Referenz</dt><dd>${escaped(item.reference || '—')}</dd><dt>Sprache</dt><dd>${escaped(item.language || '—')}</dd><dt>Antwort</dt><dd>${item.replyTo ? `<a href="mailto:${escaped(item.replyTo)}">${escaped(item.replyTo)}</a>` : '—'}</dd></dl><div class="feedback-message">${escaped(item.message || '')}</div>`;
    detail.focus();
  }

  function renderFeedback(payload) {
    const items = payload.items || [];
    count.textContent = String(items.length);
    list.innerHTML = items.length ? items.map((item, index) => `<button type="button" role="listitem" data-key="${escaped(item.key)}"><strong>${escaped(item.category)}</strong><span>${escaped(new Date(item.createdAt).toLocaleString('de-CH'))}</span><small>${escaped(item.reference || item.language)}</small></button>`).join('') : '<p style="padding:16px">Keine Nachrichten vorhanden.</p>';
    list.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => {
      void openFeedback(button.dataset.key, button).catch(error => { detail.textContent = error.message; });
    }));
    const first = list.querySelector('[data-key]');
    if (first) void openFeedback(first.dataset.key, first);
  }

  async function loadDashboard() {
    status.textContent = 'Geschützter Zugang wird geprüft …';
    const [feedback, quotas, push] = await Promise.all([
      api('admin.feedback.list', { limit: '150' }),
      api('admin.operations.status'),
      api('admin.push.status').catch(() => ({ configured: false, subscriptions: 0 }))
    ]);
    status.textContent = '';
    dashboard.hidden = false;
    renderFeedback(feedback);
    renderOperations(quotas);
    pushCount.textContent = push.configured ? `${Number(push.subscriptions || 0)} Abonnements` : 'Noch nicht aktiviert';
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    credentials = { worker: workerInput.value.trim(), token: tokenInput.value };
    void loadDashboard().catch(error => {
      credentials = null;
      dashboard.hidden = true;
      status.textContent = error.message;
    });
  });
  document.getElementById('refresh').addEventListener('click', () => {
    if (credentials) void loadDashboard().catch(error => { status.textContent = error.message; });
  });
  pushForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!credentials) return;
    const payload = {
      kind: document.getElementById('push-kind').value,
      title: document.getElementById('push-title-input').value.trim(),
      message: document.getElementById('push-message').value.trim(),
      url: document.getElementById('push-url').value.trim(),
      regions: commaList(document.getElementById('push-regions').value),
      topics: commaList(document.getElementById('push-topics').value)
    };
    pushStatus.textContent = 'Push wird geprüft und ausgeliefert …';
    void apiPost('admin.push.send', payload).then(result => {
      const delivery = result.delivery || {};
      pushStatus.textContent = `Abgeschlossen: ${Number(delivery.sent || 0)} gesendet, ${Number(delivery.failed || 0)} fehlgeschlagen, ${Number(delivery.removed || 0)} veraltete Abonnements entfernt.`;
      pushForm.reset();
    }).catch(error => { pushStatus.textContent = error.message; });
  });
})();
