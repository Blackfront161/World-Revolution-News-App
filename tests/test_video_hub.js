'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

global.document = { documentElement: { lang: 'en' } };
global.window = {
  addEventListener() {},
  WRNI18n: { currentLanguage: () => 'en' }
};
global.allNewsData = [];

require(path.join(__dirname, '..', 'video-hub.js'));

const identify = global.window.WRNVideoHub?.identify;
assert.equal(typeof identify, 'function', 'identify must be exported for validation');

const youtube = identify('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
assert.equal(youtube?.platform, 'YouTube');
assert.equal(youtube?.embed, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0');

const shortYoutube = identify('https://youtu.be/dQw4w9WgXcQ?t=8');
assert.equal(shortYoutube?.key, 'youtube:dQw4w9WgXcQ');

const nocookie = identify('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
assert.equal(nocookie?.platform, 'YouTube');

const vimeo = identify('https://vimeo.com/123456789');
assert.equal(vimeo?.embed, 'https://player.vimeo.com/video/123456789?dnt=1');

const vimeoPlayer = identify('https://player.vimeo.com/video/987654321');
assert.equal(vimeoPlayer?.key, 'vimeo:987654321');

const peerTubeWatch = identify('https://video.example.org/videos/watch/0f5f7a76-674d-4b4d-b8fa-8421264f99aa');
assert.equal(peerTubeWatch?.platform, 'PeerTube');
assert.equal(peerTubeWatch?.embed, 'https://video.example.org/videos/embed/0f5f7a76-674d-4b4d-b8fa-8421264f99aa');

const peerTubeEmbed = identify('https://video.example.org/videos/embed/0f5f7a76-674d-4b4d-b8fa-8421264f99aa');
assert.equal(peerTubeEmbed?.platform, 'PeerTube');

const peerTubeShort = identify('https://video.example.org/w/0f5f7a76-674d-4b4d-b8fa-8421264f99aa');
assert.equal(peerTubeShort?.platform, 'PeerTube');

assert.equal(identify('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), null);
assert.equal(identify('javascript:alert(1)'), null);
assert.equal(identify('http://video.example.org/videos/watch/0f5f7a76-674d-4b4d-b8fa-8421264f99aa'), null);
assert.equal(identify('https://video.example.org/videos/embed/not!safe'), null);

console.log('Video-Hub tests passed.');
