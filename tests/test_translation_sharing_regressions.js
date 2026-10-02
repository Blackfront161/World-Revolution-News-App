'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../news-app-2-core.js');
const source = fs.readFileSync(require('node:path').join(__dirname, '../news-app-2.js'), 'utf8');
const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))).trim();
const constants = source.slice(source.indexOf('const PLAY_STORE_URL'), source.indexOf('const AZURE_PODCAST_VOICES'));
const tick = () => new Promise(resolve => setImmediate(resolve));

(async () => {
  let payload;
  const state = { language: 'de', activeArticle: { id: 'one', title: 'Original headline', link: 'https://example.org/one' } };
  let translation = { title: 'Deutsche Überschrift' };
  const share = vm.runInNewContext(`(()=>{${constants}; return (${extract('async function shareOpenArticle()', 'async function shareApp()')});})()`, {
    state, translationFor: () => translation,
    window: {}, navigator: { share: async data => { payload = data; } }, t: key => key, showToast() {}
  });
  await share();
  assert.equal(payload.title, 'Deutsche Überschrift');
  assert(payload.text.startsWith('Deutsche Überschrift\nÜbersetzt mit World Revolution News App.\n'));
  assert(payload.text.includes(state.activeArticle.link));
  assert(payload.text.includes('https://play.google.com/store/apps/details?id=com.world.revolution'));
  translation = null; await share();
  assert.equal(payload.title, 'Original headline');
  assert(!payload.text.includes('Übersetzt mit'));

  // A language switch during a manual translation must never contaminate FR with DE.
  let resolve, requested, stored;
  const article = { id: 'race', title: 'Original', content: 'Original content.' };
  const raceState = { language: 'de' };
  const button = { isConnected: true, setAttribute() {}, removeAttribute() {}, querySelector: () => ({ textContent: '' }) };
  const teaser = vm.runInNewContext(`(${extract('async function translateTeaser(', 'function mergeHydratedArticle(')})`, {
    state: raceState, core, t: key => key, console, window: { WRNSharedTranslations: { request: args => { requested = args; return new Promise(r => { resolve = r; }); } } },
    newsCardTeaser: a => a.content, storeTranslation: (a, value, lang) => { stored = { value, lang }; }, showToast() {}
  });
  const pending = teaser(article, button, null); raceState.language = 'fr';
  resolve({ text: 'Deutscher Titel---Deutscher Inhalt.' }); await pending;
  assert.equal(requested.targetLanguage, 'de'); assert.equal(stored.lang, 'de');

  // Manual translation must update the label without removing the headline button.
  const headlineButton = { textContent: 'Original' };
  const heading = {};
  Object.defineProperty(heading, 'textContent', { set() { throw Error('Destroyed clickable headline'); } });
  const hero = { querySelector: selector => selector === '.home-headline-open' ? headlineButton
    : selector === 'h1' ? heading : selector === '.translation-note' ? {} : null };
  const manualLead = vm.runInNewContext(`(${extract('async function translateTeaser(', 'function mergeHydratedArticle(')})`, {
    state: { language:'de' }, core, t: key => key, console,
    window: { WRNSharedTranslations: { request: async () => ({text:'Deutscher Titel---Text.'}) } },
    document: { querySelector: () => hero }, cardCopy: { syncTeaserParagraph() {} },
    newsCardTeaser: a => a.content, storeTranslation() {}, translationFor: () => ({title:'Deutscher Titel'}),
    translationNoteLabel: () => 'Translated', showToast() {}
  });
  await manualLead(article,button,null);
  assert.equal(headlineButton.textContent,'Deutscher Titel');

  // One transient failure of the currently visible lead gets a bounded automatic retry.
  for (const [status,data] of [[0,undefined],[403,undefined],[429,undefined],[429,{reason:'daily-quota',code:'QUOTA_EXCEEDED'}]]) {
    const timers=[]; let calls=0;
    const retryContext={state:{view:'home',language:'de',cardArticles:[article]},core,cardCopy:{completeFirstSentence:x=>x},
      briefingTranslationsInFlight:new Set(),briefingTranslationsAttempted:new Set(),briefingLeadRetries:new Set(),
      homeTranslationPausedUntil:0, scheduleHomeTranslationWake(){}, Date,
      briefingTranslationWarningShown:false,translationForLanguage:()=>null,newsCardTeaser:a=>a.content,storeTranslation(){},
      console:{warn(){}},document:{querySelector:()=>({dataset:{index:'0'}})},
      renderHome(){},window:{setTimeout:(fn,delay)=>timers.push({fn,delay}),
        WRNSharedTranslations:{request:async()=>{calls++;return {error:true,status,data};}}}};
    const request=vm.runInNewContext(`(()=>{${extract('function articleNeedsTeaserTranslation(', 'async function ensureBriefingTranslations(')};return requestBriefingTranslation;})()`,retryContext);
    await request(article,'de');
    assert.equal(timers[0].delay,status===429&&!data?61000:status===0?30000:300000);
    if(data) assert.equal(retryContext.homeTranslationPausedUntil,0,'daily quota must not be treated as a minute limit');
    await timers[0].fn(); assert.equal(calls,status===0?2:1);
    if(status===0) {
      assert.equal(timers[1].delay,300000,'a second failure cannot start a retry loop');
      await timers[1].fn();assert.equal(calls,2);
    }
  }

  // The lead becomes visible while another translation remains unresolved.
  let finishLead, finishSlow, rendered = 0;
  const homeState = { view: 'home', language: 'de' };
  const context = { state: homeState, homeTranslationRun: null, homeTranslationLanguage: '', homeTranslationQueue: [],
    dataRefreshInFlight:false, homeTranslationWindowStartedAt:0,homeTranslationRequests:0,homeTranslationPausedUntil:0,
    scheduleHomeTranslationWake(){}, Date,
    window: { WRNSharedTranslations: { request() {} } }, articleNeedsTeaserTranslation: () => true,
    requestBriefingTranslation: a => new Promise(r => { if(a.id === 'lead') finishLead = r; else finishSlow = r; }),
    renderHome: () => { rendered++; }, Map, Set, Promise };
  const home = vm.runInNewContext(`(${extract('function ensureHomeTranslations(', 'function hasPreferences()')})`, context);
  const homePending = home([{ id: 'lead' }, { id: 'slow' }]);
  finishLead({ title: 'Übersetzte Schlagzeile' }); await tick();
  assert(rendered > 0, 'lead waits for the slow queue');
  finishSlow({ title: 'Nebenmeldung' }); await homePending;
  console.log('Translated article sharing, target-language isolation and immediate lead rendering: PASS');
})().catch(e => { console.error(e); process.exitCode = 1; });
