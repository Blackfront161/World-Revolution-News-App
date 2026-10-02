import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { translationCacheKey } from '../shared/translation-cache-key.js';
const hook = registerHooks({resolve(specifier,context,next) {
  return specifier==='cloudflare:workers'
    ? {shortCircuit:true,url:'data:text/javascript,export class DurableObject {}'} : next(specifier,context);
}});
const {default:worker} = await import('../wrn-translation-cache/src/index.js');
hook.deregister();
const payload=text=>({action:'translate',targetLanguage:'de',mode:'title_and_text',title:'Title',text});
const headers={'Origin':'https://solinaridao.com','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'};
const request=(body,extra={})=>new Request('https://cache.example/',{method:'POST',headers:{...headers,...extra},body,duplex:'half'});
function environment() {
  const rows=new Map(),keys=[],reads=[],calls=[];
  const env={CACHE_RATE_LIMITER:{async limit({key}){keys.push(key);return {success:true};}},
    TRANSLATIONS:{async get(key){reads.push(key);return rows.get(key)||null;},async put(key,value){rows.set(key,JSON.parse(value));}},
    QUOTA_COORDINATOR:{getByName(){return {async reserve(){return {allowed:true};},async release(){return {released:true};}};}},
    PROXY_SERVICE:{async fetch(req){const body=await req.json();calls.push({body,ip:req.headers.get('CF-Connecting-IP')});return Response.json({text:`translated:${body.text}`});}}};
  return {env,rows,keys,reads,calls,ctx:{waitUntil(){}}};
}
function stream(parts,onCancel=()=>{}) {
  let i=0;return new ReadableStream({pull(controller){if(i<parts.length)controller.enqueue(new TextEncoder().encode(parts[i++]));else controller.close();},cancel:onCancel});
}
test('received-byte limit rejects chunked and falsely declared oversized bodies before cache/upstream',async()=>{
  for(const extra of [{},{'Content-Length':'2'}]) {
    const e=environment();let cancelled=false;
    const req=request(stream([' '.repeat(20000),' '.repeat(20001),'unread'],()=>{cancelled=true;}),extra);
    const res=await worker.fetch(req,e.env,e.ctx);
    assert.equal(res.status,413);assert.equal(cancelled,true);
    assert.equal(e.calls.length,0);assert.equal(e.reads.length,0);
  }
});
test('byte limit handles multi-byte text and early Content-Length rejection',async()=>{
  const e=environment();
  const res=await worker.fetch(request(stream(['界'.repeat(13334)])),e.env,e.ctx);
  assert.equal(res.status,413);
  assert.equal((await worker.fetch(request('{}',{'Content-Length':'40001'}),e.env,e.ctx)).status,413);
});
test('valid small JSON still translates; malformed JSON remains400',async()=>{
  const e=environment();
  const good=await worker.fetch(request(JSON.stringify(payload('first'))),e.env,e.ctx);
  assert.equal(good.status,200);assert.equal((await good.json()).text,'translated:first');
  assert.equal((await worker.fetch(request('{'),e.env,e.ctx)).status,400);
});
test('rotating caller IDs share one edge-derived limiter key and cannot bypass exhaustion',async()=>{
  const e=environment();let count=0;
  e.env.CACHE_RATE_LIMITER.limit=async({key})=>{e.keys.push(key);return {success:++count<=2};};
  for(let i=0;i<4;i++) {
    const res=await worker.fetch(request(JSON.stringify(payload('same')),{'X-Client-Id':`rotate-${i}`}),e.env,e.ctx);
    assert.equal(res.status,i<2?200:429);
  }
  assert.equal(new Set(e.keys).size,1);assert.match(e.keys[0],/^[a-f0-9]{64}$/);
  assert.equal(e.calls.length,1,'second request is a cache hit, rejected requests never reach upstream');
  assert.equal(e.calls[0].ip,headers['CF-Connecting-IP'],'trusted edge identity reaches the bound proxy');
});
test('missing/throwing limiter and missing edge identity fail closed',async()=>{
  for(const [setup,extra] of [[e=>{delete e.env.CACHE_RATE_LIMITER;},{}],[e=>{e.env.CACHE_RATE_LIMITER.limit=async()=>{throw Error('unavailable');};},{}],[()=>{},{'CF-Connecting-IP':''}]]) {
    const e=environment();setup(e);
    const res=await worker.fetch(request(JSON.stringify(payload('first')),extra),e.env,e.ctx);
    assert.equal(res.status,429);assert.equal(e.calls.length,0);assert.equal(e.reads.length,0);
  }
});
test('legacy poisoned keys are never read or copied; supplied keys cannot select a different result',async()=>{
  const e=environment(),first=payload('one'),second=payload('two');
  const key=await translationCacheKey(first);
  e.rows.set(`translation:v1:${key}`,{body:JSON.stringify({text:'poisoned legacy value'})});
  const call=body=>worker.fetch(request(JSON.stringify({...body,sharedCacheKey:key}),{'X-WRN-Cache-Key':key}),e.env,e.ctx);
  const a=await call(first),b=await call(second),hit=await call(first);
  assert.equal((await a.json()).text,'translated:one');assert.equal(a.headers.get('X-WRN-Shared-Cache'),'MISS');
  assert.equal((await b.json()).text,'translated:two');assert.equal(b.headers.get('X-WRN-Shared-Cache'),'MISS');
  assert.equal((await hit.json()).text,'translated:one');assert.equal(hit.headers.get('X-WRN-Shared-Cache'),'HIT');
  assert(e.reads.every(key=>key.startsWith('translation:v2:')));assert.equal(e.calls.length,2);
  assert(e.rows.has(`translation:v1:${key}`),'legacy record retained without trusting it');
});
test('health is public; invalid origins fail before limiter/cache/provider calls',async()=>{
  const e=environment();
  const health=await worker.fetch(new Request('https://cache.example/health'),e.env,e.ctx);
  assert.equal((await health.json()).cacheSchema,'v2');
  const bad=await worker.fetch(request(JSON.stringify(payload('first')),{'Origin':'https://untrusted.example'}),e.env,e.ctx);
  assert.equal(bad.status,403);assert.equal(e.keys.length,0);assert.equal(e.calls.length,0);
});


test('public article translations are reused across users, IPs and allowed origins',async()=>{
  const e=environment();
  for(const mode of ['title_and_text','continuation']) {
    const input={...payload('Public article paragraph'),mode,title:mode==='continuation'?'':'Public headline'};
    const first=await worker.fetch(request(JSON.stringify(input),{'X-Client-Id':'reader-a'}),e.env,e.ctx);
    const firstBody=await first.json();
    const second=await worker.fetch(request(JSON.stringify(input),{'X-Client-Id':'reader-b','CF-Connecting-IP':'198.51.100.2','Origin':'https://blackfront161.github.io'}),e.env,e.ctx);
    assert.equal(first.headers.get('X-WRN-Shared-Cache'),'MISS');
    assert.equal(second.headers.get('X-WRN-Shared-Cache'),'HIT');
    assert.deepEqual(await second.json(),firstBody);
  }
  assert.equal(e.calls.length,2,'one provider request per distinct article mode, not per reader');
  assert.equal(e.rows.size,2);
  for(const input of [{...payload('Public article paragraph'),targetLanguage:'es'},payload('Changed article paragraph')]) {
    const res=await worker.fetch(request(JSON.stringify(input)),e.env,e.ctx);
    assert.equal(res.headers.get('X-WRN-Shared-Cache'),'MISS');
  }
  assert.equal(e.calls.length,4,'different languages and source text must retain separate results');
});
