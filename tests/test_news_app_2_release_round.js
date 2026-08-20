'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const core = require('../news-app-2-core.js');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'news-app-2.js'), 'utf8');
const player = fs.readFileSync(path.join(root, 'media-player.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'news-app-2.css'), 'utf8');
const websiteCss = fs.readFileSync(path.join(root, 'news-app-2-website.css'), 'utf8');
const zineCss = fs.readFileSync(path.join(root, 'zine-designer.css'), 'utf8');
const aggregate = fs.readFileSync(path.join(root, 'aggregate.py'), 'utf8');
const prisoners = JSON.parse(fs.readFileSync(path.join(root, 'prisoner-solidarity.json'), 'utf8'));

const mediaOrder = [
  "mediaTab('video'",
  "mediaTab('podcasts'",
  "mediaTab('generated'",
  "mediaTab('radio'",
  "mediaTab('radio-podcasts'",
  "mediaTab('zine'"
].map(token => script.indexOf(token));
assert(mediaOrder.every(index => index >= 0), 'A media tab is missing');
assert.deepStrictEqual(mediaOrder, [...mediaOrder].sort((a, b) => a - b), 'Media tabs are in the wrong order');

assert(html.includes('id="global-media-close"'), 'The persistent audio bar has no close control');
assert(script.includes("document.getElementById('global-media-close').addEventListener"), 'The audio close control is not wired');
assert(script.includes('stopArticleCloudPodcast();'), 'Closing an article does not stop its generated podcast');
assert(script.includes('checkEventReminders();'), 'Loaded event archives do not refresh reminders');
assert(!script.includes('scheduleEventReminders();'), 'Obsolete event reminder call is still present');
assert(script.includes("Oceania:'Ozeanien'"), 'Oceania is not translated in the German region filter');
assert(script.includes('function originLabel(value)'), 'Source-origin labels are not localised');
assert(!player.includes("getMediaUiText().failed} ${error?.message"), 'Raw browser media errors are still exposed to users');
assert(player.includes("reason:'error'"), 'A failed audio stream does not close the persistent player');
assert(
  /function personalizedHomeGroups\([\s\S]*?core\.balanceBySource\([\s\S]*?,\s*3,\s*1\s*\)/.test(script),
  'The prominent personal home block is not limited to one item per source'
);

assert(script.includes("data-action=\"zine-add-text\""), 'Zine cannot add custom text');
assert(script.includes("data-action=\"zine-add-image\""), 'Zine cannot add custom images');
assert(script.includes("data-action=\"zine-edit\""), 'Zine items cannot be edited');
assert(script.includes('readZineImageFile'), 'Zine has no safe local image import');
assert(script.includes('class="zine-tool-group zine-tool-group--add"'), 'Zine content tools are not grouped');
assert(script.includes('class="zine-item-action-group"'), 'Zine edit and delete actions are not grouped');
assert(css.includes('.zine-tool-group--add > button'), 'Zine tools have no responsive wrapping layout');
assert(zineCss.includes('flex-wrap: wrap'), 'Zine export controls cannot wrap on narrow screens');

assert(css.includes('padding: 24px 0 calc(116px + env(safe-area-inset-bottom));'), 'Main content does not clear the Android bottom safe area');
assert(css.includes('scroll-margin-bottom: calc(92px + env(safe-area-inset-bottom));'), 'Load-more controls can still be obscured by bottom navigation');

assert(script.includes('data-audio-card-mode="podcast"'), 'Podcast cards are not using compact playback controls');
assert(script.includes('showStop: !compactPodcastCard'), 'Podcast cards still render a stop control');
assert(player.includes('if (mediaConfig.showStop !== false)'), 'The media player cannot omit redundant card controls');
for (const control of ['global-media-progress', 'global-media-back', 'global-media-play', 'global-media-pause', 'global-media-forward', 'global-media-speed', 'global-media-sleep', 'global-media-close']) {
  assert(html.includes(`id="${control}"`), `The opened podcast player is missing ${control}`);
}

assert(html.includes('id="next-menu-share-app"'), 'The app recommendation action is missing from the menu');
assert(html.includes('data-action="share-app"'), 'The app recommendation action is not wired');
assert(!html.includes('id="next-menu-playstore"'), 'The app menu must not show a Play Store download link');
assert(html.includes('id="next-menu-updates-list"'), 'The menu has no user-facing recent updates box');
assert(script.includes('const MENU_UPDATES_COPY ='), 'Recent menu updates are not translated');
assert(!html.includes('id="next-menu-settings-local"'), 'The menu still exposes an internal local-settings note');
assert(!html.includes('id="next-menu-share-note"'), 'The menu still exposes an unnecessary sharing note');
assert(html.includes('news-app-2-website.css?release=5'), 'The desktop website stylesheet is missing');
assert(html.indexOf('class="bottom-nav"') < html.indexOf('id="next-main"'), 'The primary navigation must be part of the website header');
assert(websiteCss.includes('@media (min-width: 920px)'), 'The desktop website breakpoint is missing');
assert(websiteCss.includes('position: static'), 'The desktop navigation must not remain a mobile fixed bar');
assert(websiteCss.includes('grid-template-columns: repeat(3'), 'The wide news portal grid is missing');
assert(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8').includes('./news-app-2-website.css?release=5'), 'The production worker does not cache the website layout');
assert(fs.readFileSync(path.join(root, 'news-app-2-sw.js'), 'utf8').includes('./news-app-2-website.css?release=5'), 'The preview worker does not cache the website layout');
assert(script.includes("const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.world.revolution'"), 'The Play Store listing URL is missing or invalid');
assert(script.includes("window.Capacitor?.Plugins?.Share"), 'The Android native share integration is missing');
assert(script.includes('await navigator.share(shareData)'), 'The browser share fallback is missing');
assert(script.includes("await navigator.clipboard.writeText(localizedShareText)"), 'The localized copy fallback is missing');
assert(script.includes("`${t('shareAppText')}\\n${PLAY_STORE_URL}`"), 'The recommendation text and Play Store link are not shared together');
assert(script.includes('const ARTICLE_SHARE_ATTRIBUTION = Object.freeze({'), 'Article shares have no localized WRN attribution');
assert(script.includes('const shareText = `${article.title}\\n${article.link}\\n\\n${attribution}\\n${PLAY_STORE_URL}`;'), 'Article shares do not include the original article and WRN app link');
assert(script.includes("await nativeShare.share({ ...shareData, dialogTitle: t('share') })"), 'Article sharing does not use the native Android share dialog');
assert(script.includes('await navigator.clipboard.writeText(shareText)'), 'Article sharing has no complete clipboard fallback');
for (const language of ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
  assert(new RegExp(`${language}: \\{[\\s\\S]*?shareApp:`).test(script), `App sharing is not translated for ${language}`);
  assert(new RegExp(`const ARTICLE_SHARE_ATTRIBUTION = Object\\.freeze\\(\\{[\\s\\S]*?${language}:`).test(script), `Article share attribution is not translated for ${language}`);
}

assert(script.includes("status.textContent = t('feedbackSent');"), 'Feedback success is not presented as a localized message');
assert(!script.includes("`${t('feedbackSent')} ID:"), 'A technical feedback reference is still shown to users');
assert(script.includes("failureKind === 'offline'"), 'Feedback has no localized offline state');
assert(script.includes("failureKind === 'timeout'"), 'Feedback has no localized timeout state');

const aboutBlock = script.match(/function renderAbout\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert(aboutBlock.includes('ABOUT_PROJECT_COPY'), 'About the project has no editorial project information');
assert(!aboutBlock.includes('WRN_CONFIG?.version'), 'About the project still exposes a version number');
assert(!aboutBlock.includes('WRN_CONFIG?.build'), 'About the project still exposes a build number');
assert(!aboutBlock.includes('state.facets.sources.length'), 'About the project still exposes technical source counts');

const paragraphs = core.articleContentParagraphs('<p>First paragraph.</p><p>Second paragraph.</p>');
assert.deepStrictEqual(paragraphs, ['First paragraph.', 'Second paragraph.']);
assert(script.includes('article-inline-image--inferred'), 'Legacy full-text articles do not place images through the article');
assert(script.includes('class="article-lead-image-link"'), 'The full lead image cannot be opened directly');
assert(css.includes('.article-inline-image img {\n  height: auto;\n  max-height: none;'), 'Full article images can still be height-clipped');
assert(script.includes("addEventListener?.('voiceschanged', refreshArticleVoiceOptions)"), 'Late-loading Android device voices do not refresh the selector');
assert(script.includes("data-action=\"${article.offlineReady ? 'offline-remove' : 'offline-save'}\""), 'Saved articles have no individual offline control');
assert(script.includes('removeSavedArticleAssets'), 'Offline assets cannot be removed per article');
assert(script.includes('articleHistoryMarkup(article)'), 'Article change history is not rendered');
assert(script.includes('<aside class="article-correction" role="note">'), 'Visible corrections have no clear user-facing notice');
assert(aggregate.includes('"changeHistory": change_history'), 'Article changes are not retained by the aggregator');
assert(aggregate.includes('"lastSeenAt": observed_at'), 'Article observation time is not retained');

for (const source of ['ABC Dresden', 'Bristol ABC']) {
  assert(aggregate.includes(`"name": "${source}"`), `${source} is missing from the news sources`);
}
for (const id of ['paul-muentnich', 'emilie-dieckmann', 'hanna-nuernberg', 'luca-amelie-schaller', 'nele-aschoff']) {
  const profile = prisoners.profiles.find(item => item.id === id);
  assert(profile, `Verified prisoner profile ${id} is missing`);
  assert.strictEqual(profile.verification.status, 'verified');
  assert(profile.verification.sourceIds.includes('abc-dresden-prisoners'));
}

assert(script.includes("const BRIEFING_HISTORY_KEY = 'wrn_briefing_history_v1'"), 'Briefing history has no stable local key');
assert(/function rememberBriefing\([^)]*\)/.test(script), 'Generated briefings are not retained locally');
assert(/async function openBriefingHistory\(index\)/.test(script), 'Saved briefings cannot be reopened');
assert(script.includes('data-action="briefing-history-clear"'), 'Briefing history cannot be cleared');
assert(css.includes('.briefing-history'), 'Briefing history has no app-native layout');

const lexiconBlock = script.match(/function renderLexicon\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert(!lexiconBlock.includes("t('underConstruction')"), 'The glossary still shows an internal construction notice');
const prisonerBlock = script.match(/function renderPrisoners\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert(!prisonerBlock.includes("t('underConstruction')"), 'The prisoner directory still shows an internal construction notice');
assert(!prisonerBlock.includes("t('localOnly')"), 'The prisoner directory still shows an implementation note');
const developmentsBlock = script.match(/function renderDevelopments\(\) \{[\s\S]*?\n  \}/)?.[0] || '';
assert(!developmentsBlock.includes('development-review-queue'), 'The editorial review queue is still exposed in the normal app');
assert(!developmentsBlock.includes('development-review-open'), 'Editorial grouping reports are still exposed in the normal app');

console.log('News App 2 release round contracts: OK');
