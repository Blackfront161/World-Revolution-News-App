'use strict';

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('audio-region-core.js', 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(code, context);

const core = context.window.WRNAudioRegionCore;
assert(core, 'WRNAudioRegionCore fehlt');
assert.strictEqual(core.canonicalRegion('DACH'), 'europe');
assert.strictEqual(core.canonicalRegion('Europa'), 'europe');
assert.strictEqual(core.canonicalRegion('', 'US'), 'north-america');
assert.strictEqual(core.canonicalRegion('Lateinamerika'), 'latin-america');
assert.strictEqual(core.canonicalRegion('Australia & NZ'), 'oceania');
assert.strictEqual(core.matches('europe', 'DACH', 'DE'), true);
assert.strictEqual(core.matches('north-america', '', 'CA'), true);
assert.strictEqual(core.matches('asia', 'Europa', 'IT'), false);
assert.strictEqual(core.matches('all', 'Europa', 'IT'), true);
console.log('Audio-Herkunftsfilter: OK');
