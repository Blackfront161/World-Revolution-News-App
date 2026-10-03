'use strict';
// Execute the actual profile module and its installed key handler with DOM doubles.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
const document = {activeElement:null, documentElement:{lang:'de'},
  getElementById:id => elements.get(id) || null,
  addEventListener(){},
  createElement:() => element(''),
  body:{append:node => elements.set(node.id,node), classList:{remove(){}}},
};
function element(id) {
  const node = {id, hidden:false, isConnected:true, handlers:{}, style:{},
    setAttribute(){}, getClientRects:() => [1],
    addEventListener(name,callback){ this.handlers[name] = callback; },
    focus(){document.activeElement = this;},
    querySelectorAll(){return ['source-profile-filter','source-profile-website','source-profile-close'].map(x=>elements.get(x));},
  };
  Object.defineProperty(node,'innerHTML',{set(value){this.markup=value;
    for (const match of value.matchAll(/\bid="([^"]+)"/g)) {
      if (!elements.has(match[1])) elements.set(match[1],element(match[1]));
    }
  }});
  return node;
}
const trigger = element('trigger'); trigger.focus();
const context = {document, console, URL, setTimeout,
  escapeHtml:value => String(value ?? ''), getSafeHttpUrl:value => value,
  fetch:async () => ({ok:true,json:async () => ({sources:[]})}),
  window:{WRN_CONFIG:{dataUrls:{sourceCatalog:'https://example.org/registry.json',sourceHealth:'https://example.org/health.json'}}},
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require.resolve('../source-profiles.js'),'utf8'),context);
// Classic loads the actual shared modal closer, including the profile close hook.
const classic = fs.readFileSync(require.resolve('../app.js'),'utf8');
const classicCloser = classic.match(/function closeAllModals\(\) \{[\s\S]*?\n\}/);
assert(classicCloser, 'actual classic closeAllModals must be present');
vm.runInContext(classicCloser[0], context);
(async () => {
  await context.window.WRNSourceProfiles.open('Example');
  const modal = elements.get('source-profile-modal');
  const first = elements.get('source-profile-filter');
  const last = elements.get('source-profile-close');
  assert.equal(document.activeElement,last,'open must focus a real control');
  assert.equal(modal.style.display,'block','classic display:none styling must be explicitly opened');
  let prevented = 0;
  const key = (value,shiftKey=false) => modal.handlers.keydown({key:value,shiftKey,
    preventDefault(){prevented++;},stopPropagation(){}});
  key('Tab'); assert.equal(document.activeElement,first,'Tab must wrap inside modal');
  key('Tab',true); assert.equal(document.activeElement,last,'Shift+Tab must wrap inside modal');
  key('Escape');
  assert(modal.hidden,'Escape must close the profile');
  assert.equal(modal.style.display,'none','close must also clear the classic display state');
  assert.equal(document.activeElement,trigger,'close must restore the invoking control');
  assert.equal(prevented,3);
  await context.window.WRNSourceProfiles.open('Example');
  trigger.isConnected = false;
  assert.doesNotThrow(()=>context.window.WRNSourceProfiles.close(),'detached trigger must not break closing');
  delete context.closeAllModals;
  trigger.isConnected = true; trigger.focus();
  await context.window.WRNSourceProfiles.open('Example');
  key('Escape');
  assert.equal(document.activeElement,trigger,'new App without classic closer must also restore focus');
  console.log('WRN source profile keyboard: actual handler PASS');
})().catch(error => {console.error(error); process.exitCode=1;});
