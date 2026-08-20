'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'release-1.5-nav.js'), 'utf8');
const nextApp = fs.readFileSync(path.join(__dirname, '..', 'news-app-2.js'), 'utf8');

assert(source.includes('function navigationSnapshot()'), 'Navigation state is not captured');
assert(source.includes("writeNavigationHistory('replace')"), 'Initial app view is not installed as the base history entry');
assert(source.includes("writeNavigationHistory('push')"), 'View changes are not added to browser history');
assert(source.includes("window.addEventListener('popstate', event =>"), 'Back navigation does not restore app views');
assert(source.includes('event.state.wrnSubSelections'), 'Subtab history is not restored');
assert(source.includes('if (detailState)'), 'Article detail is not closed before restoring a view');
assert(nextApp.includes('function appNavigationSnapshot('), 'News App 2 view history is not captured');
assert(nextApp.includes("writeAppHistory('replace')"), 'News App 2 has no initial history state');
assert(nextApp.includes("history.state?.wrnOverlay === 'article'"), 'Article dialog does not participate in smartphone back navigation');
assert(nextApp.includes("window.addEventListener('popstate', event =>"), 'News App 2 does not restore the previous view');
assert(nextApp.includes('function restoreArticleReturnFocus()'), 'Article history close does not restore opener focus');
assert(nextApp.includes('closedArticle && restoreArticleReturnFocus()'), 'Article history close incorrectly forces focus to main');
assert(nextApp.includes("previousView === 'help' && view === 'discover'"), 'Help close does not identify its return path');
assert(nextApp.includes("document.querySelector('[data-view-target=\"help\"]')"), 'Help close cannot restore the Help trigger');

console.log('Smartphone back navigation: OK');
