'use strict';

const assert = require('assert');
const path = require('path');
const core = require(path.resolve(__dirname, '..', 'news-app-2-core.js'));

assert.strictEqual(core.safeImageUrl('https://example.org/photo.jpg'), 'https://example.org/photo.jpg');
assert.strictEqual(core.safeImageUrl('https://example.org/video.mp4'), '');
assert.strictEqual(core.safeImageUrl('https://example.org/audio.ogg?download=1'), '');
assert.deepStrictEqual(
  core.articleImageUrls([
    'https://example.org/photo-768x429.jpg',
    'https://example.org/photo.jpg',
    'https://example.org/site-logo-300x50.png',
    'https://example.org/wp-content/themes/example/background.jpg',
    'https://example.org/second-image.jpg'
  ], 'https://example.org/photo.jpg'),
  ['https://example.org/second-image.jpg'],
  'article galleries must remove the lead image, resized duplicates and layout graphics'
);
assert.deepStrictEqual(core.normalizeContentBlocks([
  { type: 'heading', level: 9, text: 'A section' },
  { type: 'paragraph', text: 'A complete paragraph.' },
  { type: 'image', url: 'https://example.org/story-image.jpg', alt: 'Story', caption: 'Caption' },
  { type: 'image', url: 'https://example.org/site-logo.png' },
  { type: 'script', text: 'unsafe' }
]), [
  { type: 'heading', text: 'A section', level: 4 },
  { type: 'paragraph', text: 'A complete paragraph.' },
  { type: 'image', url: 'https://example.org/story-image.jpg', alt: 'Story', caption: 'Caption' }
]);
assert.strictEqual(
  core.normalizeArticle({ title:'Full', content:'A complete article.', contentComplete:true }).contentMode,
  'full'
);
assert.strictEqual(
  core.normalizeArticle({ title:'Excerpt', content:'Available excerpt.', contentComplete:false }).contentMode,
  'excerpt'
);
assert.strictEqual(
  core.normalizeArticle({ title:'Metadata only', content:'', contentComplete:false }).contentMode,
  'metadata'
);
assert.strictEqual(
  core.articleContentMode({ contentMode:'full', contentComplete:false }, 'Only an excerpt was delivered.'),
  'excerpt',
  'an incomplete delivery flag must take precedence over stale full-content metadata'
);
assert.strictEqual(
  core.articleContentMode({ contentMode:'full', webFeedTruncated:true }, 'Only a shortened feed text.'),
  'excerpt',
  'a truncated web-feed article must always trigger detail hydration'
);
assert.strictEqual(
  core.hasCompleteArticle({ content:'Short source excerpt.', contentComplete:false }),
  false,
  'a source excerpt without a recoverable full-text target must stay out of the app feed'
);
assert.strictEqual(
  core.hasCompleteArticle({ content:'Short web-feed excerpt.', contentComplete:false, webFeedTruncated:true, detailPath:'news-detail-01.json' }),
  true,
  'a deliberately shortened web-feed item may remain when its full article can be hydrated'
);

const articles = core.normalizeArticles([
  {
    title: 'Newest A',
    quelleName: 'Source A',
    link: 'https://example.org/a-1',
    pubDate: '2026-07-27T12:00:00Z',
    content: '<p>First introduction with <strong>safe text</strong>.</p>',
    primaryRegion: 'Australia & NZ',
    primaryTopic: 'Antifascism'
  },
  {
    title: 'Newest A again',
    quelleName: 'Source A',
    link: 'https://example.org/a-2',
    pubDate: '2026-07-27T11:00:00Z',
    content: 'Second introduction.',
    primaryRegion: 'Europe',
    primaryTopic: 'Antifascism'
  },
  {
    title: 'Source B',
    quelleName: 'Source B',
    link: 'https://example.org/b',
    pubDate: '2026-07-27T10:00:00Z',
    content: 'Third introduction.',
    primaryRegion: 'Asia',
    primaryTopic: 'Labor Struggles'
  },
  {
    title: 'Source C',
    quelleName: 'Source C',
    link: 'javascript:alert(1)',
    pubDate: '2026-07-27T09:00:00Z',
    content: 'Video https://kolektiva.media/w/abc',
    primaryRegion: 'Latin America',
    primaryTopic: 'Antiracism'
  }
]);

assert.strictEqual(articles.length, 4);
assert.strictEqual(articles[0].primaryRegion, 'Oceania');
assert.strictEqual(articles[0].intro, 'First introduction with safe text.');
assert.strictEqual(articles[3].link, '', 'unsafe article URLs must be removed');
assert.strictEqual(core.hasVideo(articles[3]), true);
assert.strictEqual(core.videoUrl(articles[3]), 'https://kolektiva.media/w/abc');
assert.strictEqual(
  core.videoUrl({ description: 'Watch https://www.youtube.com/watch?v=abc123&amp;feature=share.' }),
  'https://www.youtube.com/watch?v=abc123&feature=share'
);
assert.strictEqual(
  core.videoUrl({ link: 'https://example.org/story', content: 'This article mentions YouTube without a link.' }),
  '',
  'a platform name without a verified video URL must not create a video card'
);
assert.strictEqual(core.videoUrl({ videoUrl: 'javascript:alert(1)' }), '');

const glossaryAnnotation = core.annotateGlossaryText(
  'Gegenseitige Hilfe und direkte Aktion stärken gegenseitige Hilfe.',
  [
    { id:'mutual-aid', title:{ de:'Gegenseitige Hilfe', en:'Mutual aid' }, aliases:{} },
    { id:'direct-action', title:{ de:'Direkte Aktion', en:'Direct action' }, aliases:{} }
  ],
  'de'
);
assert.strictEqual(glossaryAnnotation.matchCount, 2, 'each glossary concept should be marked only once');
assert.deepStrictEqual(
  glossaryAnnotation.segments.filter(segment => segment.termId).map(segment => segment.termId),
  ['mutual-aid', 'direct-action']
);
assert.strictEqual(
  glossaryAnnotation.segments.map(segment => segment.text).join(''),
  'Gegenseitige Hilfe und direkte Aktion stärken gegenseitige Hilfe.',
  'glossary annotation must preserve the full article text'
);

const balanced = core.balanceBySource(articles, 4, 2);
assert.strictEqual(balanced.length, 4);
for (let index = 1; index < balanced.length; index += 1) {
  assert.notStrictEqual(
    balanced[index - 1].source,
    balanced[index].source,
    'the same publisher must not appear twice in a row when alternatives exist'
  );
}
assert(
  [...balanced.reduce((counts, article) => {
    counts.set(article.source, (counts.get(article.source) || 0) + 1);
    return counts;
  }, new Map()).values()].every(count => count <= 2),
  'the home selection must respect the per-source ceiling'
);

assert.strictEqual(core.sourceFamily('Bianet Türkçe'), 'bianet');
assert.strictEqual(core.sourceFamily('Bianet Kurdî'), 'bianet');
assert.strictEqual(core.sourceFamily('ZNetwork (English)'), 'znetwork');
assert.strictEqual(core.canonicalEditorialCountry('TR'), 'turkey');
assert.strictEqual(core.canonicalEditorialCountry('Türkiye'), 'turkey');
assert.strictEqual(core.canonicalEditorialCountry('Turkey'), 'turkey');

const editorialCandidates = core.normalizeArticles([
  { title: 'Evrensel 1', quelleName: 'Evrensel', pubDate: '2026-08-04T12:00:00Z', originCountryCode: 'TR', primaryRegion: 'West Asia', primaryTopic: 'Labor' },
  { title: 'Bianet 1', quelleName: 'Bianet Türkçe', pubDate: '2026-08-04T11:59:00Z', originCountryCode: 'TR', primaryRegion: 'West Asia', primaryTopic: 'Labor' },
  { title: 'Bianet 2', quelleName: 'Bianet Kurdî', pubDate: '2026-08-04T11:58:00Z', originCountryCode: 'TR', primaryRegion: 'West Asia', primaryTopic: 'Antirepression' },
  { title: 'Freedom', quelleName: 'Freedom News', pubDate: '2026-08-04T11:57:00Z', originCountryCode: 'GB', primaryRegion: 'Europe', primaryTopic: 'Anarchism' },
  { title: 'Bulatlat', quelleName: 'Bulatlat', pubDate: '2026-08-04T11:56:00Z', originCountryCode: 'PH', primaryRegion: 'Asia', primaryTopic: 'Anticolonialism' },
  { title: 'Libcom', quelleName: 'Libcom', pubDate: '2026-08-04T11:55:00Z', originCountryCode: 'GB', primaryRegion: 'Europe', primaryTopic: 'Labor' }
]);
const editorial = core.balanceEditorially(editorialCandidates, 6, { poolSize: 20 });
assert.strictEqual(editorial.length, 6);
assert.strictEqual(
  new Set(editorial.slice(0, 3).map(item => core.sourceFamily(item.source))).size,
  3,
  'the first three home reports must come from different publisher families when alternatives exist'
);
assert(
  new Set(editorial.slice(0, 3).map(item => item.originCountryCode)).size >= 2,
  'the first three home reports should not all originate from the same country when alternatives exist'
);
assert([...editorial.reduce((counts, item) => {
  const family = core.sourceFamily(item.source);
  counts.set(family, (counts.get(family) || 0) + 1);
  return counts;
}, new Map()).values()].every(count => count <= 2),
'the editorial selection must cap every publisher family');

const turkeyHeavy = core.balanceEditorially(core.normalizeArticles([
  { title: 'Bianet 1', quelleName: 'Bianet Türkçe', pubDate: '2026-08-04T12:00:00Z', primaryRegion: 'West Asia', primaryTopic: 'Rights' },
  { title: 'Evrensel 1', quelleName: 'Evrensel', pubDate: '2026-08-04T11:59:00Z', primaryRegion: 'West Asia', primaryTopic: 'Labor' },
  { title: 'Bianet 2', quelleName: 'Bianet Kurdî', pubDate: '2026-08-04T11:58:00Z', primaryRegion: 'West Asia', primaryTopic: 'Antirepression' },
  { title: 'Bulatlat 1', quelleName: 'Bulatlat', pubDate: '2026-08-04T11:57:00Z', primaryRegion: 'Asia', primaryTopic: 'Labor' },
  { title: 'Freedom 1', quelleName: 'Freedom News', pubDate: '2026-08-04T11:56:00Z', primaryRegion: 'Europe', primaryTopic: 'Ecology' },
  { title: 'CrimethInc 1', quelleName: 'CrimethInc.', pubDate: '2026-08-04T11:55:00Z', originCountry: 'United States', primaryRegion: 'North America', primaryTopic: 'Movement' }
]), 5);
assert.ok(
  turkeyHeavy.slice(0, 3).filter(item => ['bianet', 'evrensel'].includes(core.sourceFamily(item.source))).length <= 1,
  'the first three home stories are still dominated by Bianet and Evrensel'
);

const europeCountryBalanced = core.balanceEditorially(core.normalizeArticles([
  ...Array.from({ length: 9 }, (_, index) => ({
    title:`Turkey ${index + 1}`,
    quelleName:index % 2 ? 'Bianet Türkçe' : `Turkish source ${index}`,
    pubDate:`2026-08-04T11:${String(59 - index).padStart(2, '0')}:00Z`,
    originCountry:index % 3 === 0 ? 'Türkiye' : (index % 3 === 1 ? 'TR' : 'Turkey'),
    primaryRegion:'Europe',
    primaryTopic:'Labor'
  })),
  ...['Germany', 'France', 'Spain', 'Italy', 'Greece', 'United Kingdom'].map((country, index) => ({
    title:`Europe ${index + 1}`,
    quelleName:`Europe source ${index + 1}`,
    pubDate:`2026-08-04T10:${String(59 - index).padStart(2, '0')}:00Z`,
    originCountry:country,
    primaryRegion:'Europe',
    primaryTopic:index % 2 ? 'Ecology' : 'Antifascism'
  }))
]), 10, { maxPerFamily:2, maxPerCountry:4, poolSize:40 });
assert.ok(
  europeCountryBalanced.filter(item => core.canonicalEditorialCountry(item.originCountry || item.originCountryCode) === 'turkey').length <= 4,
  'one country must not dominate the editorial Europe lead window'
);
const editorialQuality = core.editorialQuality(editorial);
assert.strictEqual(editorialQuality.sampleSize, 6);
assert.ok(editorialQuality.uniqueSourceFamilies >= 5);
assert.ok(editorialQuality.uniqueRegions >= 2);
assert.ok(editorialQuality.maxSourceStreak <= 1);
assert.ok(editorialQuality.maxSourceShare <= (2 / 6));

const decided = core.applyEditorialDecisions(editorial.slice(0, 1), {
  decisions: [{
    id: 'decision-1',
    status: 'approved',
    link: editorial[0].link,
    articleId: editorial[0].id,
    primaryRegion: 'Europe',
    primaryTopic: 'Antifascism',
    correctionNote: 'Classification corrected.',
    decidedAt: '2026-08-05T12:00:00Z'
  }]
});
assert.strictEqual(decided[0].primaryRegion, 'Europe');
assert.strictEqual(decided[0].primaryTopic, 'Antifascism');
assert.strictEqual(decided[0].correctionNote, 'Classification corrected.');

const personalized = articles.filter(article => core.matchesPreferences(article, {
  regions: ['Asia'],
  topics: ['Antiracism'],
  sources: [],
  blockedSources: []
}));
assert.deepStrictEqual(
  personalized.map(article => article.title),
  ['Source B', 'Source C']
);

const filtered = core.filterArticles(articles, { query: 'safe text' });
assert.strictEqual(filtered.length, 1);
assert.strictEqual(filtered[0].title, 'Newest A');

assert.deepStrictEqual(
  core.splitTranslatedTeaser('Übersetzter Titel\n---\nÜbersetzte Einleitung'),
  { title: 'Übersetzter Titel', intro: 'Übersetzte Einleitung' }
);
assert.deepStrictEqual(
  core.splitTranslatedTeaser('Übersetzter Titel---Übersetzte Einleitung'),
  { title: 'Übersetzter Titel', intro: 'Übersetzte Einleitung' }
);

assert.strictEqual(core.isLeadEligible({
  title: 'Skandinavientour 26 Tag 02',
  link: 'https://kolektiva.media/w/example',
  content: '⚠️ No text available. Please use the [ ORIGINAL ] button below.'
}), false);
assert.strictEqual(core.isLeadEligible({
  title: 'Complete report',
  link: 'https://example.org/report',
  content: 'This report contains a complete and meaningful introduction with enough context to serve as the leading story safely.'
}), true);

console.log('News App 2 core contracts: OK');
