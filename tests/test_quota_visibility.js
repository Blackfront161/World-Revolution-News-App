'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('shared-translation-client.js', 'utf8');
const calls = [], states = [], timers = [];
const window = {WRN_CONFIG:{sharedTranslationUrl:'https://cache.test',proxyUrl:'https://proxy.test'},
  setTimeout(fn, ms) {timers.push(ms); return setTimeout(fn, ms);}, clearTimeout,
  dispatchEvent(event) {states.push(event.detail);}};
let rateLimited = false, healthMode = '';
const quota = metric => ({metric,used:940,limit:950,remaining:10,resetAt:'2026-10-04T00:00:00.000Z',available:true});
vm.runInNewContext(code, {window,document:{documentElement:{lang:'de'}},AbortController,URL,Intl,Date,
  CustomEvent:class {constructor(type, options) {this.detail=options.detail;}},
  fetch:async (url, options={}) => {
    calls.push({url,options});
    if (options.method === 'POST') return {ok:false,status:429,headers:{get:()=>null},text:async()=>JSON.stringify({code:'RATE_LIMITED',retryAfterSeconds:60})};
    const metric = url.includes('/health') ? 'translation_kv_writes' : url.includes('translation.status') ? 'translation_upstream' : 'azure_characters';
    const cache=url.includes('/health');
    const proxy=url.includes('translation.status');
    const failed=rateLimited || (healthMode==='proxy-http' && proxy) || (healthMode==='cache-http' && cache);
    const enabled=!((healthMode==='proxy-disabled' && proxy) || (healthMode==='cache-disabled' && cache));
    const healthy=!((healthMode==='proxy-guard' && proxy) || (healthMode==='cache-guard' && cache));
    const data={ok:true,enabled,healthy,quotas:[quota(metric)]};
    if((healthMode==='cache-missing-enabled' && cache) || (healthMode==='proxy-missing-enabled' && proxy)) delete data.enabled;
    if((healthMode==='cache-missing-healthy' && cache) || (healthMode==='proxy-missing-healthy' && proxy)) delete data.healthy;
    return {ok:!failed,status:failed?503:200,json:async()=>data};
  }});
(async () => {
  const api = window.WRNSharedTranslations;
  const health = await api.health();
  assert.equal(calls.length,3); assert.equal(health.quotas.length,3); assert.equal(health.translationAvailable,true);
  assert(calls.every(call => call.options.cache === 'no-store' && call.options.signal));
  assert(timers.every(ms => ms === 8000));
  for (const lang of ['de','en','es','fr','it','pt','ru','el','tr']) {
    const lines = api.statusLines(health.quotas,lang);
    assert(lines[0].known && lines[0].value.includes('940 / 950'));
    assert(lines[0].reset); assert(!lines[3].known && !lines[3].value.includes('0'));
    assert(!lines[4].known);
  }
  assert(!api.statusLines([{...quota('translation_upstream'),reason:'quota_guard_unavailable',used:0,remaining:0}])[0].known);
  assert(!api.statusLines([{...quota('translation_upstream'),used:null}])[0].known);
  for(const mode of ['proxy-http','proxy-disabled','cache-http','cache-disabled','proxy-guard','cache-guard','cache-missing-enabled','proxy-missing-enabled','cache-missing-healthy','proxy-missing-healthy']) {
    healthMode=mode;
    const status=await api.health();
    assert.equal(status.translationAvailable,false, mode+' must never claim translation availability');
    if(mode==='proxy-http') assert.equal(status.ok,true,'cache transport can remain healthy while translation is unavailable');
  }
  healthMode='';
  rateLimited=true;
  assert.equal((await api.health()).quotas.length,0,'failed HTTP must not trust a payload claiming ok:true');
  const count=calls.length;
  const result=await api.request({title:'Public title',text:'Public text',targetLanguage:'de'});
  assert(result.error); assert.equal(calls.length,count+1,'429 never bypasses guards through the proxy');
  assert(states.some(state => state.status===429 && state.retryAt));
  assert(api.failureMessage('de','Übersetzung nicht verfügbar.').includes('Erneut versuchen ab'));
  assert(!JSON.stringify(states).includes('Public text'),'status events contain no article text');
  console.log('Public quota health, nine languages, unknown limits and guarded wait state: PASS');
})().catch(error => {console.error(error);process.exitCode=1;});
