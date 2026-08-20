'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
global.window = {};
global.document = {
  documentElement: { lang: 'de' },
  addEventListener() {},
  querySelectorAll() { return []; }
};

vm.runInThisContext(fs.readFileSync(path.join(root, 'language-origin.js'), 'utf8'), {
  filename: 'language-origin.js'
});
vm.runInThisContext(fs.readFileSync(path.join(root, 'news-card-copy.js'), 'utf8'), {
  filename: 'news-card-copy.js'
});
window.WRNNewsCardCopy = global.WRNNewsCardCopy;

const origin = window.WRNLanguageOrigin;
assert(origin, 'language-origin helper must be exposed');

for (const value of ['', 'und', 'mul', 'zxx', 'mis', 'unknown', 'null', 'undefined', 'n-a', 'garbage', 'zz']) {
  assert.strictEqual(origin.normalize(value), '', `${value} must not become an origin claim`);
}
assert.strictEqual(origin.normalize('de_de'), 'de-DE');
assert.match(origin.displayName('de', 'de'), /Deutsch/i);
assert.match(origin.displayName('en', 'de'), /Englisch/i);
assert.strictEqual(origin.fromArticle({ language: 'und', title: 'Deutscher Beispielsatz' }, 'de'), null);
assert.strictEqual(origin.fromArticle({ detectedLanguage: 'fr' }, 'de'), null, 'unqualified detection must not be claimed');
assert.match(origin.fromArticle({ detectedLanguage: 'fr', languageConfidence: 0.95 }, 'de').label, /Franz/i);

vm.runInThisContext(fs.readFileSync(path.join(root, 'translation-tools.js'), 'utf8'), {
  filename: 'translation-tools.js'
});

const tools = window.WRNTranslationTools;
assert(tools, 'translation tools must remain exposed');
assert.strictEqual(tools.sourceLanguage({ language: 'und' }), null);
const unknownStatus = tools.translationStatus({ article: { language: 'und' }, language: 'de' });
assert.strictEqual(unknownStatus, 'Maschinell übersetzt');
const knownStatus = tools.translationStatus({ article: { language: 'en' }, language: 'de' });
assert.strictEqual(knownStatus, 'Maschinell übersetzt aus Englisch');
assert(!/Originalsprache| · |→/i.test(knownStatus), knownStatus);

console.log('language origin assertions passed');
