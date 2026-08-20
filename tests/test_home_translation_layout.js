'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'news-app-2.css'), 'utf8');
const websiteCss = fs.readFileSync(path.join(root, 'news-app-2-website.css'), 'utf8');

assert(app.includes('function ensureHomeTranslations'), 'Home-wide automatic translation is missing');
assert(app.includes('...homeGroups.personalized'), 'Personalised content above more news is not translated');
assert(app.includes('...serviceTranslationItems'), 'Developments and events above more news are not translated');
assert(app.includes('translationFor(event)?.title || event.title'), 'Translated event titles are not rendered');
assert(app.includes('developmentHomeTitle(story)'), 'Translated development titles are not rendered');
assert(app.includes('visibleBriefingIds'), 'Briefing translation should not depend on CSS.escape support');

assert(css.includes('object-fit: scale-down'), 'Hero image has no full-image desktop fallback');
assert(css.includes('max-height: min(62vh, 520px)'), 'Hero image has no bounded full-image mobile layout');
assert(css.includes('aspect-ratio: auto'), 'Hero image is still forced into a cropping aspect ratio');
assert(css.includes('--brand-size: 118px') && css.includes('aspect-ratio: 1254 / 1068'), 'Header mark sizing is not aligned with the repaired APK-derived logo');
assert(css.includes('solinaridao-world-revolution-news-mask.png'), 'APK-derived subtitle mask is missing');
assert(css.includes('linear-gradient(90deg, var(--cyan) 0 50%, var(--red) 50% 100%)'), 'Theme-reactive 50/50 header subtitle is missing');
assert(websiteCss.includes('width: var(--brand-size)') && websiteCss.includes('height: auto'), 'Website header logo must preserve the repaired mark aspect ratio');

console.log('Home translation and full-image layout: OK');
