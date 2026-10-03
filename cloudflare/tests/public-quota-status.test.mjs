import assert from 'node:assert/strict';
import test from 'node:test';
import {registerHooks} from 'node:module';
const hook=registerHooks({resolve(name,context,next){
  if(name==='cloudflare:workers') return {shortCircuit:true,url:'data:text/javascript,export class DurableObject {}'};
  if(name==='web-push') return {shortCircuit:true,url:'data:text/javascript,export default {}'};
  return next(name,context);
}});
const {default:proxy}=await import('../revolution-proxy/src/index.js');
const {default:cache}=await import('../wrn-translation-cache/src/index.js');
hook.deregister();
test('public translation counters read only their metric and preserve private admin status',async()=>{
  const reads=[];
  const env={ADMIN_TOKEN:'test-private-token',QUOTA_COORDINATOR:{getByName(name){reads.push(name);return {async status(input){return {...input,allowed:true,used:945,remaining:5,privateMessage:'never public'};}};}}};
  const req=action=>new Request(`https://proxy.test/?action=${action}`,{headers:{Origin:'https://solinaridao.com'}});
  const response=await proxy.fetch(req('translation.status'),env,{});
  const data=await response.json();
  assert.equal(data.quotas[0].used,945); assert.equal(data.providerQuota,null); assert.equal(data.providerTariff,null);
  assert.deepEqual(reads,['wrn-quota:translation_upstream']);
  assert(!JSON.stringify(data).includes('test-private-token')); assert(!JSON.stringify(data).includes('privateMessage'));
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal((await proxy.fetch(req('admin.operations.status'),env,{})).status,401);
  assert.equal((await proxy.fetch(new Request('https://proxy.test/?action=translation.status',{headers:{Origin:'https://untrusted.test'}}),env,{})).status,403);
  assert.equal(reads.length,1,'unauthorised requests never reach counters');
});
test('missing coordinator reports unknown and never reserves quota or calls a provider',async()=>{
  const data=await (await proxy.fetch(new Request('https://proxy.test/?action=translation.status'),{},{})).json();
  assert.equal(data.healthy,false); assert.equal(data.quotas[0].available,false);
  const health=await (await cache.fetch(new Request('https://cache.test/health'),{},{})).json();
  assert.equal(health.healthy,false); assert.equal(health.quotas[0].available,false);
});

test('cache health allowlists aggregate counters and is never stored by HTTP caches',async()=>{
  const reads=[];
  const env={WRN_TRANSLATION_ENABLED:'false',QUOTA_COORDINATOR:{getByName(name){reads.push(name);return {async status(input){return {...input,used:945,remaining:5,privateMessage:'SECRET',internalTenant:'admin',trace:{requestText:'private article'}};}};}}};
  const response=await cache.fetch(new Request('https://cache.test/health',{headers:{Origin:'https://solinaridao.com'}}),env,{});
  const data=await response.json();
  assert.equal(data.enabled,false); assert.equal(data.healthy,true); assert.equal(data.quotas[0].used,945);
  assert.deepEqual(Object.keys(data.quotas[0]).sort(),['metric','label','used','limit','remaining','percent','threshold','resetAt','available'].sort());
  for(const secret of ['SECRET','privateMessage','internalTenant','requestText','private article']) assert(!JSON.stringify(data).includes(secret));
  assert.deepEqual(reads,['wrn-quota:translation_kv_writes']);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal((await cache.fetch(new Request('https://cache.test/health',{headers:{Origin:'https://untrusted.test'}}),env,{})).status,403);
  assert.equal(reads.length,1);
});
