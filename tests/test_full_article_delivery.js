'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const classic = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const nextApp = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const builder = fs.readFileSync(path.join(root, 'build_web_feeds.py'), 'utf8');

assert(builder.includes('write_news_detail_chunks'), 'The feed does not publish lazy full-text packages');
assert(builder.includes('quick_item["detailPath"] = filename'), 'Quick-feed articles do not point to full text');
assert(classic.includes('async function hydrateArticleContent(article)'), 'Classic app cannot hydrate a full article');
assert(classic.includes('await hydrateArticleContent(article)'), 'Opening an article does not request its full text');
assert(classic.includes('await hydrateArticleContent(currentFilteredItems[idNum])'), 'Translation and podcast can still receive an excerpt');
assert(nextApp.includes('async function hydrateArticleDetail(article)'), 'News App 2 cannot hydrate a full article');
assert(nextApp.includes('payload = await fetchJson(article.detailUrl'), 'News App 2 does not fetch its detail chunk');

console.log('Full article delivery: OK');
