const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto, createHash } = require('node:crypto');
const root = path.join(__dirname, '..');
const core = require(path.join(root, 'news-app-2-core.js'));
const code = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const helper = code.slice(code.indexOf('  // WRN immutable details:'), code.indexOf('  // End WRN immutable details.'));
const pub = 'https://blackfront161.github.io/Revolution-News-Data/news-archive/';
const mirror = 'https://raw.githubusercontent.com/Blackfront161/Revolution-News-Data/main/news-archive/';
const raw = { title: 'A title', link: 'https://example.org/story', quelleName: 'Example', pubDate: '2026-11-11T12:00:00Z', content: 'Complete body '.repeat(900).trim(), contentComplete: true };
function fixture(rows = [raw]) {
  const text = JSON.stringify(rows) + '\n';
  const revision = createHash('sha256').update(text).digest('hex');
  const detailPath = `news-archive/details/${revision}.json`;
  return { text, revision, card: core.normalizeArticle({ ...raw, content: raw.content.slice(0, 300), contentComplete: false, webFeedTruncated: true, webFeedOriginalLength: Array.from(raw.content).length, detailRevision: revision, detailPath, detailUrl: pub + `details/${revision}.json`, detailBaseUrl: mirror }) };
}
async function main() {
  let network = true, quota = false, stored = new Map(), requests = [], reply;
  const context = vm.createContext({ core, state: { sourceCatalog: { sources: [] } }, URL, TextDecoder, TextEncoder, Uint8Array, crypto: webcrypto, AbortController, console,
    fetch: async url => { requests.push(url); if (!network) throw Error('offline'); return new Response(reply, { status: 200 }); },
    window: { location: { href: 'https://app.example/next.html', origin: 'https://app.example' }, setTimeout, clearTimeout,
      WRN_CONFIG: { dataUrls: { newsArchiveBase: pub }, dataMirrors: { newsArchiveBase: mirror } },
      WRNStorage: { putDataset: async (key, value) => { if (quota) throw Error('quota'); stored.set(key, value); return true; }, getDataset: async key => stored.get(key) }
    }
  });
  vm.runInContext(helper, context);
  const run = async card => { context.card = card; return vm.runInContext('hydrateRevisionDetail(card)', context); };
  let f = fixture(); reply = f.text;
  await run(f.card);
  assert.equal(f.card.content, raw.content);
  assert.equal(f.card.contentComplete, true);
  assert.equal(requests[0], mirror + `details/${f.revision}.json`);
  assert(stored.has(`news-app-2-immutable-detail-${f.revision}`));
  // New VM-style article object: no in-memory detail cache is needed after restart.
  network = false; const offline = fixture().card; await run(offline); assert.equal(offline.content, raw.content);
  network = true; quota = true; stored.clear(); f = fixture(); reply = f.text; await run(f.card); assert.equal(f.card.content, raw.content);
  quota = false; reply = f.text + ' '; await assert.rejects(run(fixture().card), /revision mismatch/);
  reply = fixture([raw, raw]).text; await assert.rejects(run(fixture([raw, raw]).card), /ambiguous/);
  for (const override of [{ contentComplete: false }, { contentComplete: 'true' }, { webFeedTruncated: true }, { importMode: 'metadata-only' }, { status: 'revoked' }, { title: 'Other title' }, { pubDate: '2026-11-10T12:00:00Z' }, { quelleName: 'Other source' }]) {
    f = fixture([{ ...raw, ...override }]); reply = f.text; await assert.rejects(run(f.card));
  }
  f = fixture(); reply = f.text; await assert.rejects(run({ ...f.card, content: 'Different excerpt', detailExcerptRaw: 'Different excerpt' }), /excerpt/);
  await assert.rejects(run({ ...f.card, webFeedOriginalLength: 12 }), /length/);
  await assert.rejects(run({ ...f.card, webFeedOriginalLength: '12' }), /length/);
  const invalidDate = fixture([{ ...raw, pubDate: 'not-a-date' }]); reply = invalidDate.text;
  await assert.rejects(run({ ...invalidDate.card, pubDate: 'not-a-date' }), /date/);
  for (const boundary of ['&amp; more ', '<strong>more</strong> ']) {
    const body = ('x'.repeat(1398) + boundary.repeat(100)).trim();
    const data = fixture([{ ...raw, content: body }]); reply = data.text;
    const card = core.normalizeArticle({ ...data.card, detailExcerptRaw: body.slice(0, 1400), content: body.slice(0, 1400), webFeedOriginalLength: Array.from(body).length });
    await run(card); assert.equal(card.content, core.normalizeArticle({ ...raw, content: body }).content);
  }
  f = fixture(); reply = f.text; context.state.sourceCatalog.sources = [{ name: 'EXAMPLE', importMode: 'metadata-only' }]; await assert.rejects(run(f.card));
  context.state.sourceCatalog.sources = [{ name: 'STRASSE', importMode: 'metadata-only' }];
  context.special = { ...raw, quelleName: 'Straße' }; assert.equal(vm.runInContext('detailPolicyAllows(special)', context), false);
  context.state.sourceCatalog.sources = [];
  context.card = { ...fixture().card, detailBaseUrl: 'https://evil.example/news-archive/', detailUrl: 'https://evil.example/body.json' };
  assert(!vm.runInContext('revisionDetailUrls(card)', context).some(u => u.includes('evil.example')));
  const invalid = { ...fixture().card, detailPath: 'news-archive/details/../secret.json' }; await assert.rejects(run(invalid));
  context.response = new Response(new Uint8Array(4 * 1024 * 1024 + 1)); await assert.rejects(vm.runInContext('readRevisionBody(response)', context), /Oversized/);
  // Offline data is rehashed; corruption or a different revision cannot substitute.
  network = false; f = fixture(); stored.set(`news-app-2-immutable-detail-${f.revision}`, { revision: f.revision, text: f.text + ' ' }); await assert.rejects(run(f.card), /revision mismatch/);
  // Cache migration never overwrites the old source dataset with compact cards.
  assert(code.includes('const cacheKey = `${legacyCacheKey}-index-v2`;'));
  assert(code.includes('payload = fetched.data;'));
  assert(code.includes('new URL(\'.\', fetched.responseMetadata.sourceUrl).href'));
  console.log('Immutable detail integrity, identity, quota, mirrors, persistence and offline tests: OK');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
