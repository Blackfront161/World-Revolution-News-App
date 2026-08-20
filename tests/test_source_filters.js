#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const storage = new Map();
const context = {
  console,
  URL,
  fetch: async () => ({ ok: true, json: async () => ({ sources: [] }) }),
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  window: {
    location: { href: 'https://example.test/' },
    WRN_CONFIG: { dataUrls: { sourceCatalog: './sources-registry.json' } }
  }
};
context.window.window = context.window;
context.window.localStorage = context.localStorage;
context.window.fetch = context.fetch;
vm.createContext(context);
vm.runInContext(fs.readFileSync('source-filters.js', 'utf8'), context);

const filters = context.window.WRNSourceFilters;
assert(filters, 'WRNSourceFilters fehlt');
filters.setRegistry({ sources: [
  { name: 'Bianet Türkçe', languages: ['tr'], originCountry: 'Türkiye', originRegion: 'Türkiye' },
  { name: 'Pressin Kurdî', languages: ['ku'], originCountry: 'Iraq', originRegion: 'Kurdistan Region' }
] });

const turkish = { quelleName: 'Bianet Türkçe', title: 'Test' };
const kurdish = { quelleName: 'Pressin Kurdî', title: 'Test' };
assert(filters.matches(turkish, { language: 'tr', origin: '' }));
assert(!filters.matches(turkish, { language: 'ku', origin: '' }));
assert(filters.matches(kurdish, { language: 'ku', origin: 'Kurdistan Region' }));
assert(!filters.matches(kurdish, { language: 'tr', origin: 'Kurdistan Region' }));
assert.deepStrictEqual(Array.from(filters.articleLanguages(kurdish)), ['ku']);
assert(Array.from(filters.articleOrigins(kurdish)).includes('Iraq'));

console.log('WRN source filters: OK');
