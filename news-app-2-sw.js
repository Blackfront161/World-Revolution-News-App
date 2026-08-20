'use strict';

const CACHE_PREFIX = 'wrn-news-app-2-';
const CACHE_NAME = `${CACHE_PREFIX}v86`;
const INSTALL_CACHE_NAME = `${CACHE_NAME}-installing`;
const SOLIDARITY_FALLBACK_HEADER = 'X-WRN-Synthetic-Offline-Fallback';
const SOLIDARITY_FALLBACK_VALUE = 'solidarity-network-empty-v1';
const SHELL = [
  './index.html?preview=8',
  './next.html',
  './privacy.html',
  './news-app-2-release-checklist.html',
  './news-app-2-release-checklist.css?preview=1',
  './news-app-2.css?release=43',
  './news-app-2-release.css?release=5',
  './news-app-2-website.css?release=5',
  './prisoner-solidarity.css?preview=4',
  './zine-designer.css?release=5',
  './source-verification.css?preview=1',
  './editorial-review-ui.css?preview=1',
  './news-app-2-config.js?release=14',
  './native-device-bridge.js?release=2',
  './offline-db.js?release=2',
  './local-diagnostics.js?release=1',
  './news-card-copy.js?release=1',
  './news-app-2-core.js?release=4',
  './news-app-2-specialty.js?release=3',
  './wrn-product-21.js?release=1',
  './news-app-2-media.js?release=2',
  './news-app-2-release.js?preview=4',
  './article-summary-core.js?preview=1',
  './shared-translation-client.js?release=3',
  './stories-core.js?release=3',
  './lexicon-tab.js?release=6',
  './prisoner-solidarity.js?release=4',
  './zine-designer.js?release=3',
  './media-player.js?release=4',
  './audio-tools.js?preview=1',
  './source-passport-21.js?release=1',
  './solidarity-network-21.js?release=6',
  './source-profiles.js?preview=1',
  './source-verification.js?preview=1',
  './source-health-freshness.js?preview=1',
  './editorial-review-ui.js?preview=1',
  './language-origin.js?release=1',
  './news-app-2.js?release=48',
  './solinaridao-header-logo-light-transparent.png',
  './solinaridao-header-mark-filled.png',
  './solinaridao-world-revolution-news-mask.png',
  './solinaridao-header-logo-transparent.png',
  './solinaridao-header-logo.png',
  './wrn-logo-preview-transparent.png',
  './verified-solidarity-actions.json',
  './solidarity-network.json',
  './solidarity-resources.json',
  './wrn-logo.webp'
];
const CORE_SHELL = [
  './index.html?preview=8',
  './news-app-2.css?release=43',
  './news-app-2-release.css?release=5',
  './news-app-2-config.js?release=14',
  './native-device-bridge.js?release=2',
  './offline-db.js?release=2',
  './local-diagnostics.js?release=1',
  './news-card-copy.js?release=1',
  './news-app-2-core.js?release=4',
  './news-app-2-specialty.js?release=3',
  './wrn-product-21.js?release=1',
  './news-app-2-media.js?release=2',
  './news-app-2-release.js?preview=4',
  './article-summary-core.js?preview=1',
  './shared-translation-client.js?release=3',
  './stories-core.js?release=3',
  './lexicon-tab.js?release=6',
  './prisoner-solidarity.js?release=4',
  './zine-designer.js?release=3',
  './media-player.js?release=4',
  './audio-tools.js?preview=1',
  './source-passport-21.js?release=1',
  './solidarity-network-21.js?release=6',
  './source-profiles.js?preview=1',
  './source-verification.js?preview=1',
  './source-health-freshness.js?preview=1',
  './editorial-review-ui.js?preview=1',
  './language-origin.js?release=1',
  './news-app-2.js?release=48'
];
const INSTALL_MARKER = new Request(
  new URL(`./__wrn-cache-ready-${CACHE_NAME}`, self.location.href)
);
const DATA_PATHS = new Set([
  new URL('./news-feed.json', self.location.href).pathname,
  new URL('./news.json', self.location.href).pathname,
  new URL('./news-archive-manifest.json', self.location.href).pathname,
  new URL('./events-feed.json', self.location.href).pathname,
  new URL('./events.json', self.location.href).pathname,
  new URL('./prisoner-solidarity.json', self.location.href).pathname,
  new URL('./podcasts.json', self.location.href).pathname,
  new URL('./generated-podcasts.json', self.location.href).pathname,
  new URL('./video-feed.json', self.location.href).pathname,
  new URL('./video-health.json', self.location.href).pathname,
  new URL('./video-sources-registry.json', self.location.href).pathname,
  new URL('./radio-stations.json', self.location.href).pathname,
  new URL('./radio-health.json', self.location.href).pathname,
  new URL('./sources-registry.json', self.location.href).pathname,
  new URL('./source-health.json', self.location.href).pathname,
  new URL('./editorial-review.json', self.location.href).pathname,
  new URL('./audio-health.json', self.location.href).pathname,
  new URL('./podcast-health.json', self.location.href).pathname,
  new URL('./library-sources.json', self.location.href).pathname,
  new URL('./library-feed.json', self.location.href).pathname,
  new URL('./library-health.json', self.location.href).pathname,
  new URL('./editorial-decisions.json', self.location.href).pathname,
  new URL('./verified-solidarity-actions.json', self.location.href).pathname,
  new URL('./solidarity-network.json', self.location.href).pathname,
  new URL('./solidarity-resources.json', self.location.href).pathname
]);
const JSON_FALLBACKS = new Map([
  [new URL('./video-feed.json', self.location.href).pathname, '{"schemaVersion":1,"items":[],"stats":{"acceptedCount":0}}'],
  [new URL('./video-health.json', self.location.href).pathname, '{"schemaVersion":1,"status":"unavailable"}'],
  [new URL('./video-sources-registry.json', self.location.href).pathname, '{"schemaVersion":1,"sources":[]}'],
  [new URL('./prisoner-solidarity.json', self.location.href).pathname, '{"schemaVersion":1,"profiles":[],"sources":[]}'],
  [new URL('./verified-solidarity-actions.json', self.location.href).pathname, '{"schemaVersion":1,"actions":[],"note":"Offline fallback: no verified actions available."}'],
  [new URL('./solidarity-network.json', self.location.href).pathname, '{"schemaVersion":2,"profiles":[],"note":"Offline fallback: no verified profiles available."}'],
  [new URL('./solidarity-resources.json', self.location.href).pathname, '{"schemaVersion":1,"resources":[],"note":"Offline fallback: no verified resources available."}']
]);

async function fetchShellResource(cache, resource) {
  const request = new Request(new URL(resource, self.location.href), { cache: 'reload' });
  const response = stripReservedFallbackHeader(await fetch(request));
  if (!response.ok) throw new Error(`${resource}: HTTP ${response.status}`);
  await cache.put(request, response);
}

async function installValidatedShell() {
  await caches.delete(INSTALL_CACHE_NAME);
  const staging = await caches.open(INSTALL_CACHE_NAME);
  try {
    const coreResults = await Promise.allSettled(
      CORE_SHELL.map(resource => fetchShellResource(staging, resource))
    );
    const failedCore = coreResults.find(result => result.status === 'rejected');
    if (failedCore) throw failedCore.reason;
    const optional = SHELL.filter(resource => !CORE_SHELL.includes(resource));
    const optionalResults = await Promise.allSettled(
      optional.map(resource => fetchShellResource(staging, resource))
    );
    const failedOptional = optionalResults.filter(result => result.status === 'rejected');
    if (failedOptional.length) {
      console.warn(`WRN preview cache: ${failedOptional.length} optional assets unavailable.`);
    }

    const cache = await caches.open(CACHE_NAME);
    await cache.delete(INSTALL_MARKER);
    const stagedRequests = await staging.keys();
    await Promise.all(stagedRequests.map(async request => {
      const response = await staging.match(request);
      if (!response) throw new Error(`Staged response missing: ${request.url}`);
      await cache.put(request, response);
    }));
    await cache.put(INSTALL_MARKER, new Response(CACHE_NAME, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    }));
  } catch (error) {
    await caches.delete(CACHE_NAME);
    throw error;
  } finally {
    await caches.delete(INSTALL_CACHE_NAME);
  }
}

async function assertValidShell() {
  const cache = await caches.open(CACHE_NAME);
  const marker = await cache.match(INSTALL_MARKER);
  if (!marker || await marker.text() !== CACHE_NAME) {
    throw new Error('WRN preview cache activation refused: validated install marker missing');
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await installValidatedShell();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await assertValidShell();
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, fallbackBody = '', fallbackHeaders = {}) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = stripReservedFallbackHeader(await fetch(request));
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return stripReservedFallbackHeader(cached);
    return new Response(fallbackBody, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...fallbackHeaders }
    });
  }
}

function stripReservedFallbackHeader(response) {
  if (!response) return response;
  const headers = new Headers(response.headers);
  headers.delete(SOLIDARITY_FALLBACK_HEADER);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function navigationFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = stripReservedFallbackHeader(await fetch(request));
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return stripReservedFallbackHeader(await cache.match(request))
      || stripReservedFallbackHeader(await cache.match(new Request(new URL('./index.html?preview=8', self.location.href))))
      || stripReservedFallbackHeader(await cache.match(new Request(new URL('./next.html', self.location.href))))
      || new Response('<h1>World Revolution News</h1><p>Die Offline-Vorschau ist noch nicht gespeichert.</p>', {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationFirst(request));
    return;
  }

  if (
    DATA_PATHS.has(url.pathname)
    || /\/news-detail-\d+\.json$/i.test(url.pathname)
    || /\/news-archive\/[a-z0-9_-]+\.json$/i.test(url.pathname)
  ) {
    const fallbackHeaders = url.pathname === new URL('./solidarity-network.json', self.location.href).pathname
      ? { [SOLIDARITY_FALLBACK_HEADER]: SOLIDARITY_FALLBACK_VALUE }
      : {};
    event.respondWith(networkFirst(request, JSON_FALLBACKS.get(url.pathname) || '[]', fallbackHeaders));
    return;
  }

  if (['script', 'style'].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return stripReservedFallbackHeader(cached);
    const response = stripReservedFallbackHeader(await fetch(request));
    if (response.ok && ['script', 'style', 'image', 'font'].includes(request.destination)) {
      await cache.put(request, response.clone());
    }
    return response;
  })());
});

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let payload = {};
    try { payload = event.data?.json?.() || {}; } catch {}
    const title = String(payload.title || 'World Revolution News');
    await self.registration.showNotification(title, {
      body: String(payload.body || ''),
      icon: './wrn-logo.webp',
      badge: './wrn-logo.webp',
      tag: String(payload.tag || 'wrn-update'),
      renotify: false,
      data: { url: String(payload.url || './next.html?preview=8') }
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './next.html?preview=8', self.location.href).href;
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = clientsList.find(client => client.url.startsWith(self.location.origin));
    if (existing) {
      await existing.focus();
      if ('navigate' in existing) await existing.navigate(target);
      return;
    }
    await self.clients.openWindow(target);
  })());
});
