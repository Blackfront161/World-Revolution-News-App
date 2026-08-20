/* Public, secret-free configuration for the isolated News App 2 preview. */
'use strict';

const WRN_PREVIEW_PARAMETERS = new URLSearchParams(window.location.search);
const WRN_REQUESTED_CHANNEL = WRN_PREVIEW_PARAMETERS.get('channel');
const WRN_RELEASE_CHANNEL = WRN_REQUESTED_CHANNEL === 'test'
  ? 'test'
  : (
      window.location.pathname.endsWith('/next.html')
      || WRN_PREVIEW_PARAMETERS.has('preview')
    )
    ? 'preview'
    : 'production';
const WRN_PREVIEW_SNAPSHOT_DATA = WRN_RELEASE_CHANNEL === 'preview'
  && WRN_PREVIEW_PARAMETERS.get('data') === 'snapshot';
const WRN_REMOTE_DATA_BASE = 'https://blackfront161.github.io/Revolution-News-Data/';
const WRN_REMOTE_DATA_MIRROR_BASE = 'https://raw.githubusercontent.com/Blackfront161/Revolution-News-Data/main/';
const WRN_USES_LIVE_DATA = WRN_RELEASE_CHANNEL === 'production'
  || !WRN_PREVIEW_SNAPSHOT_DATA;
const WRN_DATA_BASE = WRN_USES_LIVE_DATA
  ? WRN_REMOTE_DATA_BASE
  : '';
const wrnDataUrl = filename => `${WRN_DATA_BASE}${filename}`;
const wrnMirrorDataUrl = filename => WRN_USES_LIVE_DATA
  ? `${WRN_REMOTE_DATA_MIRROR_BASE}${filename}`
  : '';

window.WRN_CONFIG = Object.freeze({
  version: WRN_RELEASE_CHANNEL === 'production'
    ? '2.1.0'
    : WRN_RELEASE_CHANNEL === 'test'
      ? '2.1.0-dev.1-test'
      : '2.1.0-dev.1-preview',
  build: WRN_RELEASE_CHANNEL === 'production'
    ? '2026.08.12-wrn-2.1.0-release'
    : WRN_RELEASE_CHANNEL === 'test'
      ? '2026.08.12-wrn-2.1-development-test'
      : '2026.08.12-wrn-2.1-development-preview',
  releaseChannel: WRN_RELEASE_CHANNEL,
  dataMode: WRN_RELEASE_CHANNEL === 'production'
    ? 'live-readonly-with-offline-fallback'
    : WRN_PREVIEW_SNAPSHOT_DATA
      ? 'branch-snapshot'
      : 'live-readonly-with-offline-fallback',
  dataUrls: Object.freeze({
    feedStatus: wrnDataUrl('feed-status.json'),
    newsFeed: wrnDataUrl('news-feed.json'),
    news: wrnDataUrl('news.json'),
    newsArchiveManifest: wrnDataUrl('news-archive-manifest.json'),
    newsArchiveBase: wrnDataUrl('news-archive/'),
    events: wrnDataUrl('events-feed.json'),
    eventArchive: wrnDataUrl('events.json'),
    podcasts: wrnDataUrl('podcasts.json'),
    generatedPodcasts: wrnDataUrl('generated-podcasts.json'),
    videoFeed: wrnDataUrl('video-feed.json'),
    videoHealth: wrnDataUrl('video-health.json'),
    videoSources: wrnDataUrl('video-sources-registry.json'),
    radio: wrnDataUrl('radio-stations.json'),
    radioHealth: wrnDataUrl('radio-health.json'),
    sourceHealth: wrnDataUrl('source-health.json'),
    sourceCatalog: wrnDataUrl('sources-registry.json'),
    editorialReview: wrnDataUrl('editorial-review.json'),
    audioHealth: wrnDataUrl('audio-health.json'),
    podcastHealth: wrnDataUrl('podcast-health.json'),
    librarySources: wrnDataUrl('library-sources.json'),
    libraryFeed: wrnDataUrl('library-feed.json'),
    libraryHealth: wrnDataUrl('library-health.json'),
    editorialDecisions: wrnDataUrl('editorial-decisions.json')
  }),
  dataMirrors: Object.freeze({
    feedStatus: wrnMirrorDataUrl('feed-status.json'),
    newsFeed: wrnMirrorDataUrl('news-feed.json'),
    news: wrnMirrorDataUrl('news.json'),
    newsArchiveManifest: wrnMirrorDataUrl('news-archive-manifest.json'),
    newsArchiveBase: wrnMirrorDataUrl('news-archive/'),
    events: wrnMirrorDataUrl('events-feed.json'),
    eventArchive: wrnMirrorDataUrl('events.json'),
    podcasts: wrnMirrorDataUrl('podcasts.json'),
    generatedPodcasts: wrnMirrorDataUrl('generated-podcasts.json'),
    videoFeed: wrnMirrorDataUrl('video-feed.json'),
    videoHealth: wrnMirrorDataUrl('video-health.json'),
    videoSources: wrnMirrorDataUrl('video-sources-registry.json'),
    radio: wrnMirrorDataUrl('radio-stations.json'),
    radioHealth: wrnMirrorDataUrl('radio-health.json'),
    sourceCatalog: wrnMirrorDataUrl('sources-registry.json'),
    librarySources: wrnMirrorDataUrl('library-sources.json'),
    libraryFeed: wrnMirrorDataUrl('library-feed.json'),
    libraryHealth: wrnMirrorDataUrl('library-health.json'),
    editorialDecisions: wrnMirrorDataUrl('editorial-decisions.json')
  }),
  sharedTranslationUrl: 'https://wrn-translation-cache.paghklo.workers.dev',
  proxyUrl: 'https://revolution-proxy.paghklo.workers.dev',
  // The gateway remains fail-closed until its VAPID secrets are configured.
  // Permission and subscription are created only after explicit user action.
  push: Object.freeze({
    enabled: true,
    publicKey: '',
    publicKeyUrl: 'https://revolution-proxy.paghklo.workers.dev/?action=push.config',
    subscriptionUrl: 'https://revolution-proxy.paghklo.workers.dev/?action=push.subscribe'
  })
});
