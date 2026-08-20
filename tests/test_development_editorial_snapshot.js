'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../stories-core.js');
const specialty = require('../news-app-2-specialty.js');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'news-feed.json'), 'utf8'));
const clusters = specialty.developmentClusters(articles, core, {
  days: 30,
  threshold: 0.72
});

const approvedCases = [
  { sources: 'ANRed (Argentina)|Indymedia Argentina', anchor: 'tierra no se vende' },
  { sources: 'Democracy Now! (Global)|Truthout', anchor: 'abdul el-sayed' },
  { sources: 'Democracy Now! (Global)|Truthout', anchor: 'citizens bank' },
  { sources: 'Mapuexpress (Mapuche)|Radio Kurruf Noticias', anchor: 'palimpsesto' }
];

assert.ok(clusters.length > 0, 'the current feed contains no approved development grouping');
assert.ok(clusters.length <= approvedCases.length, 'the editorial snapshot contains an unexpected development grouping');
for (const cluster of clusters) {
  assert.ok(cluster.matchConfidence >= 0.72, 'snapshot grouping is below the editorial confidence floor');
  assert.ok(cluster.matchReasons.length >= 2, 'snapshot grouping lacks independent matching signals');
  assert.ok(cluster.sourceCount >= 2, 'snapshot grouping must contain independent sources');
  const pair = [...new Set(cluster.items.map(item => item.quelleName || item.source).filter(Boolean))]
    .sort()
    .join('|');
  const titles = cluster.items.map(item => item.title).join(' ').toLocaleLowerCase();
  assert.ok(
    approvedCases.some(item => item.sources === pair && titles.includes(item.anchor)),
    `unreviewed grouping: ${pair} — ${cluster.title}`
  );
}

console.log('Development editorial snapshot: OK');
