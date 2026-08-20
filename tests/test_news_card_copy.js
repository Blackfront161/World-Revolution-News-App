'use strict';

const assert = require('node:assert/strict');
const copy = require('../news-card-copy.js');

const dateExample = 'Kommt am 10. Oktober 2026, 18 Uhr, am U5-Brandenburger Tor. Noch immer fehlt eine Reaktion.';
assert.equal(copy.completeFirstSentence(dateExample, 'de'),
  'Kommt am 10. Oktober 2026, 18 Uhr, am U5-Brandenburger Tor.');

class ThrowingSegmenter { constructor() { throw new Error('unsupported'); } }
assert.equal(copy.completeFirstSentence(dateExample, 'de', { Segmenter: ThrowingSegmenter }),
  'Kommt am 10. Oktober 2026, 18 Uhr, am U5-Brandenburger Tor.');

class BrokenDateSegmenter {
  segment() {
    return [
      { segment: 'Kommt am 10.' },
      { segment: ' Oktober 2026, 18 Uhr, am U5-Brandenburger Tor. ' },
      { segment: 'Noch immer fehlt eine Reaktion.' }
    ];
  }
}
assert.equal(copy.completeFirstSentence(dateExample, 'de', { Segmenter: BrokenDateSegmenter }),
  'Kommt am 10. Oktober 2026, 18 Uhr, am U5-Brandenburger Tor.');

assert.equal(copy.completeFirstSentence('Treffen mit Dr. Meier beginnt jetzt. Danach folgt die Beratung.', 'de', { Segmenter: null }),
  'Treffen mit Dr. Meier beginnt jetzt.');
assert.equal(copy.completeFirstSentence('Treffpunkt ist Pariser Pl. vor der Botschaft. Danach beginnt die Kundgebung.', 'de', { Segmenter: null }),
  'Treffpunkt ist Pariser Pl. vor der Botschaft.');
assert.equal(copy.completeFirstSentence('Kein vollständiger Satz vorhanden', 'de', { Segmenter: null }), '');
assert.equal(copy.completeFirstSentence(`${'Sehr '.repeat(100)}lang. Zweiter Satz.`, 'de', { Segmenter: null }), '');
assert.equal(copy.completeFirstSentence('Ein vollständiger Satz. Ein zweiter Satz.', 'de'), 'Ein vollständiger Satz.');
assert.equal(copy.translationNotice('Maschinell übersetzt', 'Maschinell übersetzt aus {language}', 'Englisch'),
  'Maschinell übersetzt aus Englisch');
assert.equal(copy.translationNotice('Maschinell übersetzt', 'Maschinell übersetzt aus {language}', ''),
  'Maschinell übersetzt');

const existing = { textContent: 'old', removed: false, remove() { this.removed = true; } };
const existingContainer = { querySelector(selector) { return selector === 'p' ? existing : null; } };
assert.equal(copy.syncTeaserParagraph(existingContainer, 'p', '.actions', ''), null);
assert.equal(existing.removed, true, 'an empty translated teaser must remove the old paragraph');

const beforeNode = { inserted: null, before(node) { this.inserted = node; } };
const newContainer = { querySelector(selector) { return selector === '.actions' ? beforeNode : null; } };
const created = copy.syncTeaserParagraph(newContainer, 'p', '.actions', 'Ein vollständiger Satz.', {
  createElement(tag) { return { tag, textContent: '' }; }
});
assert.equal(beforeNode.inserted, created, 'a newly available translated teaser must be inserted before card actions');
assert.equal(created.textContent, 'Ein vollständiger Satz.');

console.log('Shared one-sentence card copy and translation status: OK');
