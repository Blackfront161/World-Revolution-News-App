const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const origin = 'https://wrn.invalid/';
const requiredScripts = [...fs.readFileSync(path.resolve('index.html'),'utf8').matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(match=>new URL(match[1],origin).pathname);
function harness(name, failedPath='', stores=new Map()) {
  const handlers={}, calls={skip:0,claim:0}; let offline=false;
  const key=request=>new URL(request.url||request,origin).href;
  const cache=name=>({
    async match(request) { return stores.get(name)?.get(key(request))?.clone(); },
    async put(request,response) { stores.get(name).set(key(request),response.clone()); },
    async delete(request) { return stores.get(name).delete(key(request)); },
    async keys() { return [...stores.get(name).keys()].map(url=>new Request(url)); }
  });
  const caches={
    async open(name) { if(!stores.has(name))stores.set(name,new Map()); return cache(name); },
    async keys(){return [...stores.keys()];},
    async delete(name){return stores.delete(name);},
    async match(request) { for(const name of stores.keys()) {const found=await cache(name).match(request);if(found)return found;} }
  };
  const context=vm.createContext({URL,Request,Response,Headers,Map,Set,AbortController,setTimeout,clearTimeout,console,
    caches,fetch:async request=>{
      const url=new URL(key(request));
      if(offline)throw new Error('offline');
      if(url.pathname===failedPath)return new Response('missing',{status:503});
      return new Response('content:'+url.pathname);
    },self:{location:{href:origin+name,origin:origin.slice(0,-1)},addEventListener:(kind,fn)=>handlers[kind]=fn,
      skipWaiting:async()=>calls.skip++,clients:{claim:async()=>calls.claim++},registration:{showNotification:async()=>{}}}
  });
  vm.runInContext(fs.readFileSync(name,'utf8'),context,{filename:name});
  const core=Array.from(vm.runInContext(name==='service-worker.js'?'CORE_APP_SHELL':'CORE_SHELL',context));
  const generation=vm.runInContext(name==='service-worker.js'?'APP_CACHE':'CACHE_NAME',context);
  const dispatch=kind=>{let pending;handlers[kind]({waitUntil:p=>pending=p});return pending;};
  const response=request=>{let pending;handlers.fetch({request:new Request(new URL(request,origin)),respondWith:p=>pending=p});return pending;};
  return {stores,calls,core,generation,dispatch,response,goOffline:()=>offline=true};
}
(async()=>{
  for(const name of ['service-worker.js','news-app-2-sw.js']) {
    const graph=harness(name);
    const corePaths=new Set(graph.core.map(url=>new URL(url,origin).pathname));
    for(const script of requiredScripts)assert(corePaths.has(script),`${name}: required script ${script} not in validated core`);
    assert(corePaths.has('/world-revolution-atlas-punk.svg'));
    for(const failedPath of ['/app-guide.js','/world-revolution-atlas-punk.svg']) {
      const oldName=name==='service-worker.js'?'wrn-app-v2.1.2-r29':'wrn-news-app-2-v117';
      const stores=new Map([[oldName,new Map([[origin+'old-sentinel',new Response('preserved')]])]]);
      const failing=harness(name,failedPath,stores);
      await assert.rejects(failing.dispatch('install'),/HTTP 503/);
      assert.equal(failing.calls.skip,0,'failed core must never skip waiting');
      assert.equal(stores.has(failing.generation),false,'failed generation removed');
      assert.equal([...stores.keys()].some(key=>key.endsWith('-installing')),false,'staging cleaned');
      await assert.rejects(failing.dispatch('activate'),/marker missing/);
      assert.equal(failing.calls.claim,0,'invalid activation must never claim');
      assert.equal(await stores.get(oldName).get(origin+'old-sentinel').text(),'preserved');
    }
    const ok=harness(name);await ok.dispatch('install');await ok.dispatch('activate');
    assert.equal(ok.calls.skip,1);assert.equal(ok.calls.claim,1);
    const cold=harness(name,'',ok.stores);cold.goOffline();
    for(const resource of ['app-guide.js?release=1','world-revolution-atlas-punk.svg']) {
      const response=await cold.response(resource);assert(response?.ok);assert((await response.text()).includes(resource.split('?')[0]));
    }
  }
  console.log('Worker dependency graph, failed core install/activation preserves old caches, fresh worker offline assets: PASS');
})().catch(error=>{console.error(error);process.exitCode=1;});
