'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const network = require('../solidarity-network-21.js');

const ROOT = path.resolve(__dirname, '..');
const HEADER = 'X-WRN-Synthetic-Offline-Fallback';
const VALUE = 'solidarity-network-empty-v1';

async function workerResponse(workerName, resourceName, options = {}) {
  const handlers = {};
  const responseCopy = response => response ? response.clone() : null;
  const cache = {
    match: async request => new URL(request.url || request, 'https://wrn.invalid/').pathname.endsWith(`/${resourceName}`)
      ? responseCopy(options.cachedResponse)
      : null,
    put: async () => true
  };
  const context = {
    AbortController, Headers, Map, Request, Response, Set, URL,
    clearTimeout, console, setTimeout,
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
      match: async () => null
    },
    fetch: async () => {
      if (options.networkResponse) return responseCopy(options.networkResponse);
      throw new Error('simulated-offline');
    },
    self: {
      location: { href: 'https://wrn.invalid/', origin: 'https://wrn.invalid' },
      addEventListener(type, handler) { handlers[type] = handler; },
      clients: { claim: async () => true },
      skipWaiting: async () => true,
      registration: { showNotification: async () => true }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, workerName), 'utf8'), context, { filename: workerName });
  let responsePromise;
  handlers.fetch({
    request: new Request(`https://wrn.invalid/${resourceName}`),
    respondWith(value) { responsePromise = value; }
  });
  assert(responsePromise, `${workerName} did not route ${resourceName}`);
  return responsePromise;
}

(async () => {
  for (const worker of ['service-worker.js', 'news-app-2-sw.js']) {
    const solidarity = await workerResponse(worker, 'solidarity-network.json');
    const payload = await solidarity.json();
    assert.deepEqual(payload.profiles, []);
    assert.equal('fallbackContext' in payload, false, `${worker} must not trust a body marker`);
    assert.equal(solidarity.headers.get(HEADER), VALUE, `${worker} must identify only its synthetic solidarity fallback by response metadata`);

    const resources = await workerResponse(worker, 'solidarity-resources.json');
    assert.equal(resources.headers.get(HEADER), null, `${worker} must not attach the solidarity marker to ordinary JSON fallbacks`);

    for (const source of ['networkResponse', 'cachedResponse']) {
      const spoofed = await workerResponse(worker, 'solidarity-network.json', {
        [source]: new Response(JSON.stringify({
          schemaVersion: 2,
          profiles: [],
          fallbackContext: 'service-worker-offline-empty'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', [HEADER]: VALUE }
        })
      });
      const spoofedPayload = await spoofed.json();
      assert.equal(spoofed.headers.get(HEADER), null, `${worker} must strip a reserved marker from ${source}`);
      assert.equal(network.regionalPayloadMode({
        data: spoofedPayload,
        responseMetadata: { syntheticSolidarityFallback: spoofed.headers.get(HEADER) === VALUE }
      }, true), 'authoritative-response', `${worker} must keep a spoofed empty ${source} authoritative`);
    }
  }
  console.log('WRN workers strip spoofed network/cache fallback headers and mark only local synthetic responses: OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
