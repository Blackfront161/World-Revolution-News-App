'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const app = fs.readFileSync('news-app-2.js', 'utf8');
const loadData = app.slice(
  app.indexOf('async function loadData('),
  app.indexOf('function refreshLiveData(')
);

assert(app.includes('const LIVE_STARTUP_BUDGET_MS = 8000'));
assert(app.includes('const INDEXEDDB_STARTUP_BUDGET_MS = 1200'));
assert(app.includes("getDataset?.('news-app-2-news')"));
assert(app.includes("source: 'packaged-feed', url: 'news-feed.json'"));
assert(app.includes('Promise.allSettled(sources.map(async item =>'));
assert(app.includes('signal: controller.signal'));
assert(app.includes('externalSignal?.addEventListener?.'));
assert(loadData.indexOf('readStoredNewsWithinBudget()') < loadData.indexOf('const liveResult = await liveAttempt'));
assert(loadData.indexOf('render();') < loadData.indexOf('void scheduleSpecialtyHydration();'));
assert(!loadData.includes('await loadSpecialtyData()'));
assert(loadData.includes('if (!background)'));

function cacheHarness({ failPutCache = '', failPutFragment = '' } = {}) {
  const stores = new Map();
  const key = request => typeof request === 'string' ? request : request.url;
  const cacheFor = name => {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async put(request, response) {
        if (name === failPutCache && key(request).includes(failPutFragment)) {
          throw new Error(`simulated promotion failure: ${name}`);
        }
        entries.set(key(request), response.clone());
      },
      async match(request) { return entries.get(key(request))?.clone(); },
      async delete(request) { return entries.delete(key(request)); },
      async keys() { return [...entries.keys()].map(url => new Request(url)); }
    };
  };
  return {
    stores,
    api: {
      async open(name) { return cacheFor(name); },
      async keys() { return [...stores.keys()]; },
      async delete(name) { return stores.delete(name); }
    }
  };
}

async function loadWorker(workerName, options = {}) {
  const { failFetchFragment = '', failPutCache = '', failPutFragment = '' } = options;
  const source = fs.readFileSync(workerName, 'utf8');
  const handlers = new Map();
  const harness = cacheHarness({ failPutCache, failPutFragment });
  let skipWaitingCalls = 0;
  let claimCalls = 0;
  const self = {
    location: { href: 'https://app.example.test/', origin: 'https://app.example.test' },
    addEventListener(type, handler) { handlers.set(type, handler); },
    async skipWaiting() { skipWaitingCalls += 1; },
    clients: {
      async claim() { claimCalls += 1; },
      async matchAll() { return []; },
      async openWindow() {}
    },
    registration: { async showNotification() {} }
  };
  const context = {
    self,
    caches: harness.api,
    fetch: async request => {
      const url = typeof request === 'string' ? request : request.url;
      return new Response(failFetchFragment && url.includes(failFetchFragment) ? 'missing' : 'asset', {
        status: failFetchFragment && url.includes(failFetchFragment) ? 404 : 200
      });
    },
    Request,
    Response,
    Headers,
    URL,
    console,
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(source, context, { filename: workerName });
  const dispatch = type => {
    let promise;
    handlers.get(type)({
      waitUntil(value) { promise = Promise.resolve(value); },
      request: new Request('https://app.example.test/index.html')
    });
    return promise;
  };
  return {
    dispatch,
    stores: harness.stores,
    skipWaitingCalls: () => skipWaitingCalls,
    claimCalls: () => claimCalls
  };
}

function seedCache(worker, name, body = 'old-generation') {
  const url = 'https://app.example.test/sentinel';
  worker.stores.set(name, new Map([[url, new Response(body)]]));
  return url;
}

async function verifyWorker({ workerName, oldCache, newCache, optionalAsset, foreignCaches }) {
  const failedCore = await loadWorker(workerName, { failFetchFragment: 'news-app-2.js' });
  failedCore.stores.set(oldCache, new Map());
  await assert.rejects(failedCore.dispatch('install'));
  assert.equal(failedCore.skipWaitingCalls(), 0, `${workerName} activated after a core failure`);
  assert(failedCore.stores.has(oldCache), `${workerName} removed an old cache during failed install`);

  const failedPromotion = await loadWorker(workerName, {
    failPutCache: newCache,
    failPutFragment: 'news-app-2.js'
  });
  const sentinelUrl = seedCache(failedPromotion, oldCache);
  await assert.rejects(failedPromotion.dispatch('install'));
  assert.equal(failedPromotion.skipWaitingCalls(), 0, `${workerName} activated after promotion failure`);
  assert.equal(await failedPromotion.stores.get(oldCache).get(sentinelUrl).text(), 'old-generation');
  assert(!failedPromotion.stores.has(newCache), `${workerName} retained a partial promoted cache`);

  const optionalFailure = await loadWorker(workerName, { failFetchFragment: optionalAsset });
  optionalFailure.stores.set(oldCache, new Map());
  optionalFailure.stores.set('wrn-saved-articles-v1', new Map());
  foreignCaches.forEach(name => optionalFailure.stores.set(name, new Map()));
  await optionalFailure.dispatch('install');
  assert.equal(optionalFailure.skipWaitingCalls(), 1, `${workerName} rejected an optional cache miss`);
  assert(optionalFailure.stores.has(oldCache), `${workerName} removed old caches before activation`);
  await optionalFailure.dispatch('activate');
  assert.equal(optionalFailure.claimCalls(), 1);
  assert(!optionalFailure.stores.has(oldCache), `${workerName} retained an obsolete cache after validated activation`);
  assert(optionalFailure.stores.has('wrn-saved-articles-v1'), `${workerName} deleted saved articles`);
  foreignCaches.forEach(name => {
    assert(optionalFailure.stores.has(name), `${workerName} deleted foreign cache ${name}`);
  });
}

(async () => {
  await verifyWorker({
    workerName: 'service-worker.js',
    oldCache: 'wrn-app-v2.1.0-r3',
    newCache: 'wrn-app-v2.1.0-r4',
    optionalAsset: 'classic.html',
    foreignCaches: ['wrn-news-app-2-v85', 'wrn-foreign-cache-v1', 'unrelated-cache']
  });
  await verifyWorker({
    workerName: 'news-app-2-sw.js',
    oldCache: 'wrn-news-app-2-v85',
    newCache: 'wrn-news-app-2-v86',
    optionalAsset: 'next.html',
    foreignCaches: ['wrn-app-v2.1.0-r3', 'wrn-data-v2.1.0-r2', 'wrn-foreign-cache-v1']
  });
  console.log('Fast start and atomic worker installation: OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
