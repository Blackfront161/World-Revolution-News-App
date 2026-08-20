'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('news-app-2-config.js', 'utf8');
const appSource = fs.readFileSync('news-app-2.js', 'utf8');
const htmlSource = fs.readFileSync('index.html', 'utf8');
const styleSource = fs.readFileSync('news-app-2.css', 'utf8');
const remoteBase = 'https://blackfront161.github.io/Revolution-News-Data/';
const mirrorBase = 'https://raw.githubusercontent.com/Blackfront161/Revolution-News-Data/main/';

function configuration(pathname, search = '') {
  const context = {
    URLSearchParams,
    window: {
      location: { pathname, search }
    }
  };
  vm.runInNewContext(source, context);
  return context.window.WRN_CONFIG;
}

const production = configuration('/index.html');
assert.strictEqual(
  production.dataUrls.newsFeed,
  `${remoteBase}news-feed.json`,
  'The packaged production app does not load the current public news feed'
);
assert.strictEqual(
  production.dataMode,
  'live-readonly-with-offline-fallback',
  'The production data mode does not document its live-first behaviour'
);
assert.strictEqual(
  production.dataUrls.feedStatus,
  `${remoteBase}feed-status.json`,
  'The production app cannot check when the public feed was generated'
);
assert.strictEqual(
  production.dataMirrors.newsFeed,
  `${mirrorBase}news-feed.json`,
  'The production app has no direct main-branch fallback when Pages is stale'
);
assert.strictEqual(
  production.dataMirrors.news,
  `${mirrorBase}news.json`,
  'The complete article archive has no direct main-branch fallback'
);

const previewLive = configuration('/next.html', '?preview=8');
assert.strictEqual(
  previewLive.dataUrls.newsFeed,
  `${remoteBase}news-feed.json`,
  'The normal preview URL does not use the current public feed'
);
assert.strictEqual(
  previewLive.dataMode,
  'live-readonly-with-offline-fallback',
  'The normal preview URL does not retain its packaged offline fallback'
);

const previewSnapshot = configuration('/next.html', '?preview=8&data=snapshot');
assert.strictEqual(
  previewSnapshot.dataUrls.newsFeed,
  'news-feed.json',
  'The explicit preview snapshot mode does not use packaged data'
);

const testChannel = configuration('/index.html', '?channel=test');
assert.strictEqual(testChannel.releaseChannel, 'test');
assert.strictEqual(testChannel.version, '2.1.1-dev.1-test');
assert.strictEqual(
  testChannel.dataMode,
  'live-readonly-with-offline-fallback',
  'The test channel must remain isolated while reading the same current public data'
);

assert(
  appSource.includes('const LIVE_DATA_REFRESH_INTERVAL_MS = 15 * 60 * 1000') &&
  appSource.includes('window.setInterval(refreshLiveData, LIVE_DATA_REFRESH_INTERVAL_MS)'),
  'The installed app does not periodically check for fresh feed data'
);
assert(
  appSource.includes("document.addEventListener('visibilitychange'") &&
  appSource.includes("window.addEventListener('online', () => refreshLiveData(true))"),
  'The installed app does not refresh when it becomes visible or reconnects'
);
assert(
  appSource.includes("cacheKey: 'wrn_status'") &&
  appSource.includes("cacheKey: 'wrn_revision'") &&
  appSource.includes("source: 'github-main'") &&
  appSource.includes('void loadData({ background: true })'),
  'Background refreshes do not validate and version the public feed'
);
assert(
  appSource.includes('function dataStatusDetailsMarkup()') &&
  appSource.includes('lastSuccessfulFetchAt') &&
  appSource.includes('lastPublishedAt') &&
  !appSource.includes('Aktualisierung verzögert') &&
  !appSource.includes('Update delayed') &&
  styleSource.includes('.data-freshness--warning'),
  'The app does not distinguish fetch and publication times without showing the removed delayed-refresh warning'
);
assert(
  appSource.includes("? 'snapshot' : 'offline'") &&
  appSource.includes('dataStatusLabel()'),
  'The app does not expose when it had to use the packaged offline feed'
);
assert(
  appSource.includes('async function hydrateArticleDetail(article)') &&
  appSource.includes('async function hydrateArticleFromArchive(article)') &&
  appSource.includes("cacheKey: 'wrn_archive'") &&
  appSource.includes("'news-app-2-article-archive'") &&
  appSource.includes("cacheKey: 'wrn_detail'") &&
  appSource.includes('new URL(article.detailPath, feedBaseUrl).href') &&
  appSource.includes('detail.content.length >= article.content.length') &&
  appSource.includes("const contentMode = core.articleContentMode(article, article.content)") &&
  appSource.includes("core.articleContentMode(article, article.content) !== 'full'") &&
  appSource.includes("article.contentMode = contentMode") &&
  appSource.includes("contentMode !== 'full'") &&
  appSource.includes("openArticle(article, { allowPartial: true })") &&
  appSource.includes("article.contentComplete === false") &&
  appSource.includes('class="article-continuation"') &&
  appSource.includes('article-metadata-only') &&
  appSource.includes("continueOriginal:'Im Original weiterlesen'") &&
  appSource.includes("articleImages:'Weitere Artikelbilder'") &&
  appSource.includes('core.articleImageUrls(article.images, [primaryImage, ...articleBody.inlineImages])') &&
  appSource.includes('structuredArticleMarkup(article, Boolean(translation?.fullContent), articleBodyText)') &&
  appSource.includes('class="article-image-gallery"'),
  'Truncated quick-feed articles are not upgraded with their lazy full text'
);
assert(
  htmlSource.includes('class="dialog-close article-back-button"') &&
  htmlSource.includes('<span data-i18n="back">Zurück</span>') &&
  styleSource.includes('env(safe-area-inset-top, 0px)') &&
  styleSource.includes('.article-dialog .save-icon') &&
  styleSource.includes('.article-continuation'),
  'The article header or incomplete-article continuation is not smartphone-safe'
);

console.log('News App 2 live-data routing: OK');
