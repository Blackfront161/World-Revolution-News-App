/* World Revolution News – Offline Service Worker · News App 2 production 2.1.1 */
'use strict';

const APP_CACHE = 'wrn-app-v2.1.1-r1';
const DATA_CACHE = 'wrn-data-v2.1.1-r1';
const APP_INSTALL_CACHE = `${APP_CACHE}-installing`;
const APP_CACHE_PREFIX = 'wrn-app-';
const DATA_CACHE_PREFIX = 'wrn-data-';
const SOLIDARITY_FALLBACK_HEADER = 'X-WRN-Synthetic-Offline-Fallback';
const SOLIDARITY_FALLBACK_VALUE = 'solidarity-network-empty-v1';

const APP_SHELL = [
  './',
  './index.html',
  './next.html',
  './classic.html',
  './news-app-2-release-checklist.html',
  './news-app-2-release-checklist.css?release=2',
  './news-app-2.css?release=43',
  './news-app-2-release.css?release=5',
  './news-app-2-website.css?release=5',
  './prisoner-solidarity.css?release=2',
  './zine-designer.css?release=5',
  './source-verification.css?release=1',
  './editorial-review-ui.css?release=1',
  './news-app-2-config.js?release=14',
  './native-device-bridge.js?release=2',
  './local-diagnostics.js?release=1',
  './news-card-copy.js?release=1',
  './news-app-2-core.js?release=4',
  './news-app-2-specialty.js?release=3',
  './wrn-product-21.js?release=1',
  './news-app-2-media.js?release=2',
  './news-app-2-release.js?release=2',
  './article-summary-core.js?release=1',
  './shared-translation-client.js?release=3',
  './stories-core.js?release=3',
  './lexicon-tab.js?release=6',
  './prisoner-solidarity.js?release=4',
  './zine-designer.js?release=3',
  './media-player.js?release=4',
  './audio-tools.js?release=1',
  './source-passport-21.js?release=1',
  './solidarity-network-21.js?release=6',
  './source-profiles.js?release=1',
  './source-verification.js?release=1',
  './source-health-freshness.js?release=1',
  './editorial-review-ui.js?release=1',
  './language-origin.js?release=1',
  './news-app-2.js?release=48',
  './solinaridao-header-logo-light-transparent.png',
  './solinaridao-header-mark-filled.png',
  './solinaridao-world-revolution-news-mask.png',
  './solinaridao-header-logo-transparent.png',
  './solinaridao-header-logo.png',
  './wrn-logo-preview-transparent.png',
  './mobile-repair.html',
  './source-check.html',
  './audio-check.html',
  './app-check.html',
  './styles.css',
  './release-1.4.css',
  './release-1.5-nav.css',
  './briefing.css',
  './briefing-2.css',
  './stories-timeline.css',
  './video-hub.css',
  './lexicon-tab.css',
  './prisoner-solidarity.css',
  './action-radar.css',
  './editorial-review-ui.css',
  './source-health-freshness.css',
  './about-tab.css',
  './audio-catalog.css',
  './article-summary.css',
  './interface-qol.css',
  './shared-translation-status.css',
  './typography.css',
  './app-background.css',
  './wrn-header.css',
  './source-verification.css',
  './briefing-loader.css',
  './article-actions.css',
  './sticky-dialogs.css',
  './audio-tab.css',
  './audio-tab-183.css',
  './interface-block3.css',
  './source-recovery-ui-183.css',
  './audio-reliability.css',
  './runtime-selftest.css',
  './intro-screen.css',
  './recovery-audit.css',
  './language-source-status.css',
  './zine-designer.css',
  './light-theme.css',
  './app-diagnostics.css',
  './app-background.webp',
  './wrn-logo.webp',
  './wrn-future-header.webp',
  './wrn-future-header.png',
  './wrn-future-header-white.png',
  './wrn-header-banner.webp',
  './config.js',
  './wrn-origin-safety.js',
  './offline-db.js',
  './data-control.js',
  './status-center.js',
  './utils.js',
  './source-profiles.js',
  './source-passport-21.js',
  './source-filters.js',
  './translation-tools.js?release=2',
  './accessibility.js',
  './media-player.js',
  './audio-tools.js',
  './events.js',
  './reading-state.js',
  './audio-hub.js',
  './release-1.4.js',
  './release-1.5-nav.js',
  './wrn-i18n.js',
  './audio-region-core.js',
  './language-qol.js',
  './language-status.js',
  './shared-translation-client.js',
  './shared-translation-status.js',
  './translation-dialog-l10n.js',
  './typography.js',
  './wrn-header.js',
  './source-verification.js',
  './source-health-freshness.js',
  './action-radar.js',
  './editorial-review-ui.js',
  './briefing-loader.js',
  './stories-core.js',
  './briefing-2.js',
  './stories-timeline.js',
  './video-hub.js',
  './lexicon-tab.js',
  './prisoner-solidarity.js',
  './about-tab.js',
  './article-actions.js',
  './sticky-dialogs.js',
  './audio-tab.js',
  './audio-tab-183.js',
  './interface-block3.js',
  './source-recovery-ui-183.js',
  './audio-reliability.js',
  './runtime-selftest.js',
  './intro-screen.js',
  './recovery-audit.js',
  './language-source-status.js',
  './zine-designer.js',
  './app-safety.js',
  './app-diagnostics.js',
  './article-summary-core.js',
  './article-summary.js',
  './briefing.js',
  './audio-player-fixes.js',
  './audio-catalog.js',
  './app.js',
  './manifest.json',
  './wrn-product-21.js',
  './verified-solidarity-actions.json',
  './solidarity-network.json',
  './solidarity-resources.json',
  './icon.svg',
  './prisoner-solidarity.json'
];

// These files are the minimum boot contract. A worker with an incomplete core
// must never replace the currently active worker. Everything else in APP_SHELL
// is an offline enhancement and may be cached best-effort.
const CORE_APP_SHELL = [
  './index.html',
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
  './news-app-2-release.js?release=2',
  './article-summary-core.js?release=1',
  './shared-translation-client.js?release=3',
  './stories-core.js?release=3',
  './lexicon-tab.js?release=6',
  './prisoner-solidarity.js?release=4',
  './zine-designer.js?release=3',
  './media-player.js?release=4',
  './audio-tools.js?release=1',
  './source-passport-21.js?release=1',
  './solidarity-network-21.js?release=6',
  './source-profiles.js?release=1',
  './source-verification.js?release=1',
  './source-health-freshness.js?release=1',
  './editorial-review-ui.js?release=1',
  './language-origin.js?release=1',
  './news-app-2.js?release=48'
];
const APP_INSTALL_MARKER = new Request(
  new URL(`./__wrn-cache-ready-${APP_CACHE}`, self.location.href)
);

const JSON_FALLBACKS = new Map([
  [new URL('./news.json', self.location.href).pathname, '[]'],
  [new URL('./news-feed.json', self.location.href).pathname, '[]'],
  [new URL('./news-archive-manifest.json', self.location.href).pathname, '{"schemaVersion":1,"sources":[]}'],
  [new URL('./events.json', self.location.href).pathname, '[]'],
  [new URL('./events-feed.json', self.location.href).pathname, '[]'],
  [new URL('./podcasts.json', self.location.href).pathname, '[]'],
  [new URL('./generated-podcasts.json', self.location.href).pathname, '[]'],
  [new URL('./video-feed.json', self.location.href).pathname, '{"schemaVersion":1,"items":[],"stats":{"acceptedCount":0}}'],
  [new URL('./video-health.json', self.location.href).pathname, '{"schemaVersion":1,"status":"unavailable"}'],
  [new URL('./video-sources-registry.json', self.location.href).pathname, '{"schemaVersion":1,"sources":[]}'],
  [new URL('./radio-stations.json', self.location.href).pathname, '[]'],
  [new URL('./source-health.json', self.location.href).pathname, '{}'],
  [new URL('./source-health-report.json', self.location.href).pathname, '{"sources":[]}'],
  [new URL('./source-catalog.json', self.location.href).pathname, '[]'],
  [new URL('./podcast-health.json', self.location.href).pathname, '{}'],
  [new URL('./radio-health.json', self.location.href).pathname, '{}'],
  [new URL('./podcast-sources.json', self.location.href).pathname, '[]'],
  [new URL('./radio-sources.json', self.location.href).pathname, '[]'],
  [new URL('./audio-health.json', self.location.href).pathname, '{}'],
  [new URL('./feature-audit.json', self.location.href).pathname, '{}'],
  [new URL('./language-source-audit.json', self.location.href).pathname, '{}'],
  [new URL('./multilingual-source-registry.json', self.location.href).pathname, '{}'],
  [new URL('./editorial-review.json', self.location.href).pathname, '{"items":[]}'],
  [new URL('./alternative-social-media.json', self.location.href).pathname, '{"platforms":[]}'],
  [new URL('./prisoner-solidarity.json', self.location.href).pathname, '{"schemaVersion":1,"profiles":[],"sources":[]}'],
  [new URL('./library-sources.json', self.location.href).pathname, '[]'],
  [new URL('./library-feed.json', self.location.href).pathname, '[]'],
  [new URL('./library-health.json', self.location.href).pathname, '{"schemaVersion":1,"sources":{}}'],
  [new URL('./editorial-decisions.json', self.location.href).pathname, '{"schemaVersion":1,"decisions":[]}'],
  [new URL('./verified-solidarity-actions.json', self.location.href).pathname, '{"schemaVersion":1,"actions":[],"note":"Offline fallback: no verified actions available."}'],
  [new URL('./solidarity-network.json', self.location.href).pathname, '{"schemaVersion":2,"profiles":[],"note":"Offline fallback: no verified profiles available."}'],
  [new URL('./solidarity-resources.json', self.location.href).pathname, '{"schemaVersion":1,"resources":[],"note":"Offline fallback: no verified resources available."}']
]);

const DATA_FILES = new Set([
  new URL('./news.json', self.location.href).pathname,
  new URL('./news-feed.json', self.location.href).pathname,
  new URL('./news-archive-manifest.json', self.location.href).pathname,
  new URL('./events.json', self.location.href).pathname,
  new URL('./events-feed.json', self.location.href).pathname,
  new URL('./source-health.json', self.location.href).pathname,
  new URL('./source-health-report.json', self.location.href).pathname,
  new URL('./source-catalog.json', self.location.href).pathname,
  new URL('./podcasts.json', self.location.href).pathname,
  new URL('./generated-podcasts.json', self.location.href).pathname,
  new URL('./video-feed.json', self.location.href).pathname,
  new URL('./video-health.json', self.location.href).pathname,
  new URL('./video-sources-registry.json', self.location.href).pathname,
  new URL('./podcast-health.json', self.location.href).pathname,
  new URL('./radio-stations.json', self.location.href).pathname,
  new URL('./radio-health.json', self.location.href).pathname,
  new URL('./podcast-sources.json', self.location.href).pathname,
  new URL('./radio-sources.json', self.location.href).pathname,
  new URL('./audio-health.json', self.location.href).pathname,
  new URL('./feature-audit.json', self.location.href).pathname,
  new URL('./language-source-audit.json', self.location.href).pathname,
  new URL('./multilingual-source-registry.json', self.location.href).pathname,
  new URL('./editorial-review.json', self.location.href).pathname,
  new URL('./editorial-decisions.json', self.location.href).pathname,
  new URL('./library-sources.json', self.location.href).pathname,
  new URL('./library-feed.json', self.location.href).pathname,
  new URL('./library-health.json', self.location.href).pathname,
  new URL('./alternative-social-media.json', self.location.href).pathname,
  new URL('./prisoner-solidarity.json', self.location.href).pathname,
  new URL('./verified-solidarity-actions.json', self.location.href).pathname,
  new URL('./solidarity-network.json', self.location.href).pathname,
  new URL('./solidarity-resources.json', self.location.href).pathname
]);

async function fetchShellResource(cache, resource) {
  const request = new Request(new URL(resource, self.location.href), { cache: 'reload' });
  const response = stripReservedFallbackHeader(await fetch(request));
  if (!response.ok) throw new Error(`${resource}: HTTP ${response.status}`);
  await cache.put(request, response);
}

async function installValidatedAppShell() {
  await caches.delete(APP_INSTALL_CACHE);
  const staging = await caches.open(APP_INSTALL_CACHE);
  try {
    const coreResults = await Promise.allSettled(
      CORE_APP_SHELL.map(resource => fetchShellResource(staging, resource))
    );
    const failedCore = coreResults.find(result => result.status === 'rejected');
    if (failedCore) throw failedCore.reason;
    const optional = APP_SHELL.filter(resource => !CORE_APP_SHELL.includes(resource));
    const optionalResults = await Promise.allSettled(
      optional.map(resource => fetchShellResource(staging, resource))
    );
    const failedOptional = optionalResults.filter(result => result.status === 'rejected');
    if (failedOptional.length) {
      console.warn(`WRN offline cache: ${failedOptional.length} optionale Dateien konnten nicht gespeichert werden.`);
    }

    const appCache = await caches.open(APP_CACHE);
    await appCache.delete(APP_INSTALL_MARKER);
    const stagedRequests = await staging.keys();
    await Promise.all(stagedRequests.map(async request => {
      const response = await staging.match(request);
      if (!response) throw new Error(`Staged response missing: ${request.url}`);
      await appCache.put(request, response);
    }));
    await appCache.put(APP_INSTALL_MARKER, new Response(APP_CACHE, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    }));
  } catch (error) {
    // APP_CACHE is a new generation, so a failed promotion can be removed
    // without changing the cache used by the currently active worker.
    await caches.delete(APP_CACHE);
    throw error;
  } finally {
    await caches.delete(APP_INSTALL_CACHE);
  }
}

async function assertValidAppShell() {
  const appCache = await caches.open(APP_CACHE);
  const marker = await appCache.match(APP_INSTALL_MARKER);
  if (!marker || await marker.text() !== APP_CACHE) {
    throw new Error('WRN app cache activation refused: validated install marker missing');
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await installValidatedAppShell();
    await self.skipWaiting();
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
      data: { url: String(payload.url || './index.html') }
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification?.data?.url || './index.html', self.location.href).href;
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

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await assertValidAppShell();
    const keep = new Set([APP_CACHE, DATA_CACHE]);
    const cacheNames = await caches.keys();

    await Promise.all(
      cacheNames
        .filter(name =>
          (name.startsWith(APP_CACHE_PREFIX) || name.startsWith(DATA_CACHE_PREFIX))
          && !keep.has(name)
        )
        .map(name => caches.delete(name))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    DATA_FILES.has(url.pathname)
    || /\/news-detail-\d+\.json$/i.test(url.pathname)
    || /\/news-archive\/[a-z0-9_-]+\.json$/i.test(url.pathname)
  ) {
    event.respondWith(networkFirstData(request));
    return;
  }

  if (['script', 'style', 'manifest', 'font'].includes(
    request.destination
  )) {
    event.respondWith(networkFirstAsset(request));
    return;
  }

  event.respondWith((async () => {
    try {
      return stripReservedFallbackHeader(await fetch(request));
    } catch {
      return stripReservedFallbackHeader(await caches.match(request));
    }
  })());
});

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

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_CACHE);
  const requestUrl = new URL(request.url);
  const rootPath = new URL('./', self.location.href).pathname;
  const indexPath = new URL('./index.html', self.location.href).pathname;
  const isIndexNavigation = (
    requestUrl.pathname === rootPath
    || requestUrl.pathname === indexPath
  );

  try {
    const response = stripReservedFallbackHeader(await fetchWithTimeout(request, 5000));
    if (response?.ok) {
      await cache.put(
        isIndexNavigation ? './index.html' : request,
        response.clone()
      );
    }
    return response;
  } catch {
    return stripReservedFallbackHeader(await cache.match(request, { ignoreSearch: true }))
      || stripReservedFallbackHeader(await cache.match('./index.html'))
      || new Response(
        'Offline: Die App-Oberfläche ist noch nicht gespeichert.',
        {
          status: 503,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        }
      );
  }
}

async function networkFirstData(request) {
  const cache = await caches.open(DATA_CACHE);
  const appCache = await caches.open(APP_CACHE);
  try {
    const response = stripReservedFallbackHeader(await fetchWithTimeout(request, 8000));
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(
      request,
      { ignoreSearch: true }
    );
    const url = new URL(request.url);
    const fallback = /\/news-archive\/[a-z0-9_-]+\.json$/i.test(url.pathname)
      ? '[]'
      : JSON_FALLBACKS.get(url.pathname) || 'null';
    const preloaded = await appCache.match(request, { ignoreSearch: true });
    const solidarityFallback = url.pathname === new URL('./solidarity-network.json', self.location.href).pathname;
    return stripReservedFallbackHeader(cached) || stripReservedFallbackHeader(preloaded) || new Response(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-WRN-Offline-Fallback': 'empty',
        ...(solidarityFallback ? { [SOLIDARITY_FALLBACK_HEADER]: SOLIDARITY_FALLBACK_VALUE } : {})
      }
    });
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = stripReservedFallbackHeader(await fetchWithTimeout(request, 5000));
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return stripReservedFallbackHeader(await cache.match(
      request,
      { ignoreSearch: true }
    )) || new Response('', { status: 504 });
  }
}

async function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  );
  try {
    return await fetch(request, {
      signal: controller.signal,
      cache: 'no-store'
    });
  } finally {
    clearTimeout(timeout);
  }
}
