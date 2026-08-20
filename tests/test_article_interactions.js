'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const tools = fs.readFileSync(path.join(root, 'translation-tools.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const audio = fs.readFileSync(path.join(root, 'audio-hub.js'), 'utf8');

for (const marker of [
  'dataset.translationAction',
  'translationRecordKey',
  'function handleControlClick(',
  "if (action === 'original') showOriginal(idNum)",
  "if (action === 'translated') showTranslated(idNum)",
  "if (action === 'compare') openCompare(idNum)",
  "if (action === 'report') openReport(idNum)"
]) {
  assert(tools.includes(marker), `Missing reliable translation action marker: ${marker}`);
}

assert(
  !tools.includes("meta.className = 'translation-view-meta'"),
  'Technical translation metadata must not be rendered below the action buttons.'
);
assert(
  !tools.includes("cacheNote.className = 'translation-cache-note'"),
  'The local cache/provider note must not be rendered in the article.'
);

for (const marker of [
  'function getShareableArticleUrl(',
  'function copyShareUrl(',
  'navigator.clipboard.writeText(url)',
  "if (error?.name === 'AbortError') return"
]) {
  assert(app.includes(marker), `Missing safe article sharing marker: ${marker}`);
}

assert(
  !app.includes('navigator.clipboard.writeText(title + " - " + link)'),
  'Clipboard fallback must contain a browser-safe URL without a title prefix.'
);
assert(
  app.includes("if (typeof pausePodcastLibraryAudio === 'function')"),
  'Opening article tools must remain safe when the optional audio module is unavailable.'
);
assert(
  audio.includes('async function openPodcastOptions(idNum)'),
  'The article podcast button must keep its options entry point.'
);

assert(styles.includes('min-height: 28px'), 'Translation follow-up buttons must stay compact.');
assert(
  styles.includes('.translation-view-button[data-translation-action="report"]'),
  'Translation report/compare controls must use the compact article design.'
);

console.log('Article translation, share and podcast interaction contract: OK');
