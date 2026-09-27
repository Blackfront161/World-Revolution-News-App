const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'news-app-2.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`  async function ${name}(`);
  assert(start >= 0, `${name} exists`);
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} is incomplete`);
}

async function main() {
  let resolveFetch;
  let fetchCount = 0;
  const state = {
    sourceArchive: {
      generation: 1, manifest: null, manifestLoading: false, manifestFailed: false,
      loadedSources: new Set(), failedSources: new Set(), loadingSources: new Set()
    },
    dataStatus: { revision: 'today' },
    preferences: { sources: ['Followed Source'] }, view: 'following'
  };
  const context = vm.createContext({
    state, sourceArchiveManifestPromise: null, sourceArchiveManifestGeneration: -1,
    followingArchivesInFlight: false,
    window: { WRN_CONFIG: { dataUrls: {}, dataMirrors: {} }, WRNStorage: {
      putDataset: async () => true, getDataset: async () => null
    } },
    fetchFirstJson: () => {
      fetchCount += 1;
      return new Promise(resolve => { resolveFetch = resolve; });
    },
    normalizedSourceArchiveManifest: payload => payload,
    loadSourceArchive: async name => { state.sourceArchive.loadedSources.add(name); },
    renderFollowing: () => { context.rendered += 1; },
    rendered: 0
  });
  vm.runInContext(extract('ensureSourceArchiveManifest'), context);
  vm.runInContext(extract('loadFollowingSourceArchives'), context);
  const first = vm.runInContext('ensureSourceArchiveManifest()', context);
  const second = vm.runInContext('loadFollowingSourceArchives()', context);
  assert.equal(fetchCount, 1, 'a followed-source request shares the current manifest load');
  resolveFetch({ sources: [{ name: 'Followed Source' }] });
  await Promise.all([first, second]);
  assert.equal(state.sourceArchive.loadedSources.has('Followed Source'), true);
  assert.equal(context.rendered, 1, 'the personal feed refreshes after its archive arrives');
  assert.equal(state.sourceArchive.failedSources.size, 0);
  console.log('Followed source archive loading: OK');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
