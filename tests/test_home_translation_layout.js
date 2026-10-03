'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'news-app-2.css'), 'utf8');
const websiteCss = fs.readFileSync(path.join(root, 'news-app-2-website.css'), 'utf8');

const home = app.slice(app.indexOf('function renderHome()'), app.indexOf('function articleNeedsTeaserTranslation('));
assert(home.includes('void ensureHomeTranslations(['), 'Visible home headlines must be translated automatically');
assert(home.includes('...topStories') && home.includes('...briefingItems'), 'Visible editorial home stories must be covered');
assert(!home.includes('...balanced') && !home.includes('...state.articles.slice(0, 5)'), 'Invisible stories must not trigger automatic translation');
assert(!home.includes('...homeServices.homeEvents.items'), 'Location or preference-based events must not trigger automatic translation');
assert(home.includes('home-translation-disclosure'), 'Home must disclose automatic translation');
assert(home.includes('state.quickArticleIds.has(article.id)'), 'Home headlines must stay in the quick feed after archive loading');
assert(app.includes('Math.min(3, homeTranslationQueue.length)'), 'Automatic requests must have bounded concurrency');
assert(app.includes('data-action="translate"'), 'Readers need an explicit teaser translation action');
assert(app.includes('translationFor(event)?.title || event.title'), 'Translated event titles are not rendered');
assert(app.includes('developmentHomeTitle(story)'), 'Translated development titles are not rendered');

assert(css.includes('object-fit: scale-down'), 'Hero image has no full-image desktop fallback');
assert(/max-height: min\((?:60|62)vh, 520px\)/.test(css), 'Hero image has no bounded full-image mobile layout');
assert(css.includes('aspect-ratio: auto'), 'Hero image is still forced into a cropping aspect ratio');
assert(css.includes('--brand-size: 118px') && css.includes('aspect-ratio: 1254 / 1068'), 'Header mark sizing is not aligned with the repaired APK-derived logo');
assert(css.includes('solinaridao-world-revolution-news-mask.png'), 'APK-derived subtitle mask is missing');
assert(css.includes('linear-gradient(90deg, var(--cyan) 0 50%, var(--red) 50% 100%)'), 'Theme-reactive 50/50 header subtitle is missing');
assert(websiteCss.includes('width: var(--brand-size)') && websiteCss.includes('height: auto'), 'Website header logo must preserve the repaired mark aspect ratio');

console.log('Home translation and full-image layout: OK');
