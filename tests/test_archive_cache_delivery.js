const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
async function main() {
  for (const file of ['service-worker.js', 'news-app-2-sw.js'].filter(f => fs.existsSync(path.join(root, f)))) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const preview = file.includes('news-app-2-sw');
    const name = preview ? 'networkFirst' : 'networkFirstData';
    const start = source.indexOf(`async function ${name}(`);
    const end = source.indexOf(preview ? '\nfunction stripReservedFallbackHeader' : '\nasync function networkFirstAsset', start);
    const fn = source.slice(start, end);
    for (const mode of ['put-fails', 'open-fails', 'offline-cached', 'offline-empty', 'network-500']) {
      const context = vm.createContext({ URL, Response, Headers, Request, console: { warn() {} },
        DATA_CACHE: 'data', APP_CACHE: 'app', CACHE_NAME: 'preview', LEGACY_DATA_CACHES: ['old-preview'], JSON_FALLBACKS: new Map(),
        SOLIDARITY_FALLBACK_HEADER: 'X-Test', SOLIDARITY_FALLBACK_VALUE: 'yes',
        self: { location: { href: 'https://example.org/app/service-worker.js' } },
        stripReservedFallbackHeader: r => r,
        caches: { open: async () => {
          if (mode === 'open-fails') throw Error('quota');
          return { put: async (_, r) => { await r.text(); if (mode === 'put-fails') throw Error('quota'); },
            match: async () => mode === 'offline-cached' || mode === 'put-fails' ? new Response('["OLD"]') : null };
        } },
        fetch: async () => { if (mode.startsWith('offline')) throw Error('offline'); return new Response('["NEW"]', { status: mode === 'network-500' ? 500 : 200 }); },
      });
      context.fetchWithTimeout = context.fetch;
      context.request = new Request('https://example.org/app/news-archive/details/' + 'a'.repeat(64) + '.json');
      vm.runInContext(fn, context);
      const response = await vm.runInContext(`${name}(request)`, context);
      assert.equal(response.status, mode === 'offline-empty' ? 503 : mode === 'network-500' ? 500 : 200, `${file} ${mode}`);
      if (mode !== 'offline-empty') assert.equal(await response.text(), mode === 'offline-cached' ? '["OLD"]' : '["NEW"]', `${file} ${mode}`);
    }
    assert(source.includes('(?:details\\/)?'), `${file}: new body path is routed`);
  }
  console.log('Archive worker quota, consumed clone, offline and HTTP-error delivery: OK');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
