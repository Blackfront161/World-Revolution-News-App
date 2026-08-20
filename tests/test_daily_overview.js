'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'news-app-2.css'), 'utf8');

assert(app.includes("const LAST_VISIT_KEY = 'wrn_last_visit_v1'"), 'Local last-visit timestamp is missing');
assert(app.includes('function homeTodayData'), 'Daily overview data model is missing');
assert(app.includes('function homeTodayMarkup'), 'Daily overview UI is missing');
assert(app.includes("data-action=\"daily-edition\""), 'Daily edition cannot be opened');
assert(app.includes("data-action=\"daily-offline\""), 'Daily edition cannot be saved offline');
assert(app.includes('function saveDailyEditionOffline'), 'Offline daily-edition workflow is missing');
assert(app.includes('product21.activeVerifiedActions(state.solidarityActions, now)'), 'Solidarity actions are not schema/freshness gated');
assert(app.includes('product21.solidarityActionAssessment(action, now)'), 'Rejected solidarity records have no explicit assessment');
assert(app.includes('product21.ACTION_INPUT_FIELDS'), 'Solidarity empty state has no concrete input checklist');
assert(app.includes('product21.dossierInputChecklist(story, state.solidarityActions)'), 'Dossier missing-data checklist is not integrated');
assert(!app.includes('const actionPattern = /solidarit'), 'Keyword matches must not be presented as verified solidarity');
assert(!app.includes("solidarity:'Geprüfte Solidarität'"), 'Misleading verified-solidarity label remains in the app');
for (const misleadingLabel of [
  'Geprüfte Solidarität',
  'Verified solidarity',
  'Solidaridad verificada',
  'Solidarité vérifiée',
  'Solidarietà verificata',
  'Solidariedade verificada',
  'Проверенная солидарность',
  'Επαληθευμένη αλληλεγγύη',
  'Doğrulanmış dayanışma'
]) {
  assert(!app.includes(misleadingLabel), `Misleading source label remains: ${misleadingLabel}`);
}
assert(app.includes("fetchJson('verified-solidarity-actions.json')"), 'Structured solidarity dataset is not loaded');
assert(app.includes('dominantLanguageShare > .62'), 'Source-diversity blind-spot signal is missing');
assert(app.includes("data-action=\"open-action-kit\""), 'Existing print-studio shortcut is missing');
assert(app.includes('data-dossier-card'), 'Dossier deep-link target is missing');
assert(app.includes("scrollIntoView?.({ behavior: 'smooth', block: 'start' })"), 'Dossier deep link does not scroll to its target');
assert(app.includes("dossierUpdates = data.developmentChanges.firstVisit ? ''"), 'First visit incorrectly claims since-visit dossier changes');
assert(app.includes('change.removedCluster'), 'Removed dossiers do not have a non-clickable history state');
assert(app.includes('structuredMatchOnly'), 'Perspective matrix does not explain its strict claim-ID matching rule');
assert(app.includes('Number.isFinite(dateValue)'), 'Perspective evidence dates are not guarded against invalid values');
assert(app.includes('product21.normalizeSnapshotHistory'), 'Legacy development snapshots are not migrated to bounded history');
assert(app.includes('product21.appendSnapshotHistory'), 'Development snapshot history is not persisted');

const perspectiveBlock = app.slice(app.indexOf('const PERSPECTIVE_LABELS'), app.indexOf('function developmentPerspectivesMarkup'));
for (const language of ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
  assert(perspectiveBlock.includes(`${language}:{`), `Perspective-matrix labels missing: ${language}`);
}

for (const language of ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
  assert(app.includes(`${language}: { todayTitle:`), `Daily overview translation missing: ${language}`);
}

assert(css.includes('.home-today__grid'), 'Daily overview grid styles are missing');
assert(css.includes('.home-today-card.has-warning'), 'Blind-spot warning has no visible state');
assert(css.includes('.home-today-card--wide'), 'Action-kit responsive card is missing');
assert(css.includes('.perspective-matrix-scroll'), 'Perspective matrix has no overflow-safe container');
assert(css.includes('.development-card.is-active-dossier'), 'Focused dossier has no visible state');
assert(css.includes('.data-input-checklist'), 'Editorial input checklist has no visible style');

console.log('Daily overview and offline edition: OK');
