const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'news-app-2.js'), 'utf8');

function extract(name) {
  const start = source.indexOf(`  ${name}(`);
  assert(start >= 0, `${name} exists`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} is incomplete`);
}

async function main() {
  const values = new Map([
    ['wrn_bookmarks', '[]'], ['wrn_read_list', '["article"]'],
    ['wrn_read_snapshots_v1', '[{"title":"Article"}]'],
    ['wrn_video_watch_later_v1', '["video"]'],
    ['wrn_video_history_v1', '["watched"]'],
    ['wrn_briefing_history_v1', '["briefing"]'],
    ['wrn_zine_articles', '["zine"]'],
    ['wrn_event_reminders_v2', '{"event":{"nativeNotificationId":"native-42"}}'],
    ['wrn_notification_preferences_v1', '{"enabled":true}']
  ]);
  const writes = [];
  let rendered = 0;
  let nativeCancelled = false;
  let pushDisconnected = false;
  const state = {
    savedArticles: [{ title: 'Article' }], translations: { de: { article: {} } },
    videoWatchLater: ['video'], videoHistory: ['watched'],
    briefingHistory: ['briefing'], preferences: {}, developmentWatch: [],
    eventFilter: { location: { latitude: 1 }, radius: 20 }
  };
  const context = vm.createContext({
    BOOKMARKS_KEY: 'wrn_bookmarks', READ_KEY: 'wrn_read_list',
    READ_SNAPSHOTS_KEY: 'wrn_read_snapshots_v1',
    READING_POSITIONS_KEY: 'wrn_read_positions', ZINE_KEY: 'wrn_zine_articles',
    state, savedDataGeneration: 0,
    localStorage: {
      get length() { return values.size; }, key(index) { return [...values.keys()][index]; },
      getItem(key) { return values.get(key) ?? null; },
      setItem(key, value) { values.set(key, value); },
      removeItem(key) { values.delete(key); }
    },
    window: { confirm: () => true, WRNDeviceBridge: {
      cancelReminder: async id => {
        assert.equal(id, 'native-42');
        assert.equal(values.has('wrn_event_reminders_v2'), true);
        nativeCancelled = true;
      }
    }, WRNStorage: {
      putDataset: async (...args) => { writes.push(args); return true; },
      clearAll: async () => {}
    } },
    caches: { delete: async () => true },
    clearPreviewCaches: async () => {}, normalizedPreferences: () => ({}),
    eventReminders: () => JSON.parse(values.get('wrn_event_reminders_v2') || '{}'),
    disconnectPushSubscription: async () => {
      assert.equal(values.has('wrn_notification_preferences_v1'), true);
      pushDisconnected = true;
    },
    t: key => key, render: () => { rendered += 1; },
    renderDataControl: () => {}, showToast: () => {}
  });
  vm.runInContext(extract('async function clearLocalData'), context);
  await vm.runInContext("clearLocalData('reading')", context);
  assert.equal(values.has('wrn_bookmarks'), false);
  assert.equal(values.has('wrn_read_snapshots_v1'), false);
  assert.equal(values.get('wrn_video_watch_later_v1'), '["video"]');
  assert.equal(values.get('wrn_video_history_v1'), '["watched"]');
  assert.equal(values.get('wrn_briefing_history_v1'), '["briefing"]');
  assert.equal(state.savedArticles.length, 0);
  assert.equal(writes.at(-1)[0], 'news-app-2-saved-articles');
  assert.equal(rendered, 1);
  await vm.runInContext("clearLocalData('full')", context);
  assert.equal(values.size, 0);
  assert.equal(nativeCancelled, true);
  assert.equal(pushDisconnected, true);
  assert.equal(state.videoWatchLater.length, 0);
  assert.equal(state.briefingHistory.length, 0);
  assert.equal(state.eventFilter.location, null);
  assert.equal(state.eventFilter.radius, 0);
  assert.equal(rendered, 2);

  let offlineStarted = false;
  const quotaContext = vm.createContext({
    bookmarks: () => [], core: { articleId: item => item.id },
    writeJson: () => false, BOOKMARKS_KEY: 'wrn_bookmarks',
    showToast: () => {}, t: key => key,
    prepareSavedArticle: () => { offlineStarted = true; }
  });
  vm.runInContext(extract('function toggleSaved'), quotaContext);
  assert.equal(vm.runInContext("toggleSaved({ id: 'article', title: 'Article' })", quotaContext), false);
  assert.equal(offlineStarted, false, 'a failed bookmark write must not start offline saving');

  console.log('Reader data controls: OK');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
