'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const style = fs.readFileSync(path.join(root, 'news-app-2.css'), 'utf8');

for (const section of ['new', 'reports', 'interviews', 'documentaries', 'education', 'live', 'saved']) {
  assert(script.includes(`${section}: 'video`), `Video portal section is missing: ${section}`);
}

for (const filter of ['query', 'language', 'topic', 'region', 'source', 'platform', 'duration', 'sort']) {
  assert(script.includes(`next-video-${filter}`), `Video portal filter is missing: ${filter}`);
}

assert(script.includes('data-action="video-play"'), 'Video player has no user-triggered load action');
assert(script.includes('data-action="video-close"'), 'Video player has no close action');
assert(script.includes('data-action="video-watch-later"'), 'Watch-later action is missing');
assert(script.includes('VIDEO_HISTORY_KEY'), 'Local playback history is missing');
assert(script.includes('VIDEO_WATCH_LATER_KEY'), 'Local watch-later list is missing');
assert(script.includes("fetchFirstJson([dataMirrors.videoFeed, dataUrls.videoFeed, 'video-feed.json'])"), 'Independent video feed is not loaded');

const playerBlock = script.slice(script.indexOf('function videoPlayerMarkup'), script.indexOf('function videoPortalCardMarkup'));
assert(playerBlock.includes('<iframe src='), 'The on-demand player does not render embeds');
assert(!playerBlock.includes('autoplay'), 'The video player must not autoplay');
assert(playerBlock.includes('videoOriginal'), 'The player has no original-source fallback');

for (const selector of ['.video-portal-grid', '.video-portal-card', '.video-filter-grid', '.video-player-frame']) {
  assert(style.includes(selector), `Video portal styling is missing: ${selector}`);
}

console.log('Video portal contracts: OK');
