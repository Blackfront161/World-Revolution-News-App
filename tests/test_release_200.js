'use strict';

const assert = require('node:assert/strict');

global.window = global;
global.document = {
  readyState: 'loading',
  documentElement: { lang: 'de' },
  getElementById() { return null; },
  addEventListener() {}
};

require('../action-radar.js');

assert.ok(global.WRNActionRadar);
assert.equal(
  Math.round(global.WRNActionRadar.distanceKm(
    { latitude: 47.3769, longitude: 8.5417 },
    { latitude: 46.948, longitude: 7.4474 }
  )),
  95
);
assert.equal(global.WRNActionRadar.distanceKm(null, null), null);

console.log('WRN 2.0 action radar contracts: OK');
