'use strict';

const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('news-app-2.js', 'utf8');
const workerSource = fs.readFileSync('cloudflare/revolution-proxy/src/index.js', 'utf8');

assert(
  source.includes("libraryUrl.searchParams.set('action', 'podcasts.list')"),
  'News App 2 does not load the generated podcast library from the worker'
);
assert(
  source.includes('dataMirrors.generatedPodcasts') &&
  source.includes('dataUrls.generatedPodcasts') &&
  source.includes("'generated-podcasts.json'"),
  'News App 2 does not retain the static generated podcast fallback'
);
assert(
  source.includes("console.warn('Generated podcast library unavailable; using static fallback'"),
  'News App 2 does not report when it uses the static generated podcast fallback'
);
assert(
  source.includes('[...workerItems, ...fallbackItems]'),
  'News App 2 does not merge the worker library with its static recovery snapshot'
);
assert(
  source.includes('Array.isArray(fallbackCandidates)') &&
  source.includes("fallbackItems.push(...fallback)"),
  'The live-data preview cannot recover generated podcasts from its local snapshot'
);
assert(
  source.includes('expiresAt <= now'),
  'Expired generated podcasts are still exposed by the static recovery snapshot'
);
assert(
  source.includes("libraryUrl.searchParams.set('limit', '500')"),
  'The generated podcast library still hides older active items behind the former 100-item ceiling'
);
assert(
  source.includes("podcast.mode === 'full' ? t('fullPodcast') : t('shortPodcast')") &&
  source.includes("podcast.voiceLabel"),
  'Generated podcast cards do not distinguish short/full versions and their Azure voice'
);
assert(
  workerSource.includes('const PODCAST_LIST_LIMIT = 500;') &&
  workerSource.includes('Math.min(PODCAST_LIST_LIMIT'),
  'The worker still truncates the generated podcast library below the client limit'
);
assert(
  source.includes('state.media.favoritesOnly = false'),
  'Switching media sections can still hide all generated podcasts behind a stale favorites filter'
);
assert(
  source.includes("${['podcasts', 'radio-podcasts', 'generated'].includes(section) ? `"),
  'The audio queue is not limited to on-demand podcast sections'
);
assert(
  source.includes("if (document.getElementById('audio-queue-panel'))"),
  'The queue renderer still runs without a visible podcast queue'
);
assert(
  source.includes('function personalizedHomeGroups(items, excludedIds = [])'),
  'The home page has no dedicated selection for followed regions, topics and sources'
);
assert(
  source.includes('${personalizedHomeMarkup(homeGroups.personalized)}'),
  'The personalized news block is not rendered on the home page'
);
assert(
  source.includes('const BRIEFING_DURATIONS = Object.freeze([3, 5, 10, 20])') &&
  source.includes('const targetWords = state.briefing.amount * BRIEFING_WORDS_PER_MINUTE'),
  'Briefing duration choices are not translated into a spoken-word target'
);
assert(
  source.includes('function briefingEstimatedMinutes()') &&
  source.includes('${estimatedMinutes} ${escapeHtml(t(\'briefingMinutes\'))}'),
  'The briefing preview does not show its estimated spoken duration'
);
assert(
  source.includes('const AZURE_PODCAST_VOICES = Object.freeze({') &&
  source.includes('Katja · Azure (weiblich)') &&
  source.includes('Conrad · Azure (männlich)'),
  'The article podcast panel does not expose clearly labelled Azure voices'
);
assert(
  source.includes("cloudVoiceAvailable:'Azure online: verfügbar.") &&
  source.includes("deviceVoiceUnavailable:'Kostenlose Gerätestimme: auf diesem Gerät nicht verfügbar.") &&
  !source.includes('Vorlesen ist in diesem Browser nicht verfügbar.'),
  'The app does not clearly distinguish Azure availability from an unavailable device voice'
);
assert(
  source.includes('action=podcast.status') &&
  source.includes("status?.naturalVoicesAvailable === false") &&
  source.includes("updateCloudPodcastAvailability('cloudVoiceAvailable', 'is-available')"),
  'The Azure controls do not expose their current backend availability'
);
assert(
  source.indexOf('<div class="podcast-cloud-options">') <
  source.indexOf('${deviceSpeechAvailable ? `'),
  'Azure voices are still hidden below the device voice controls'
);
assert(
  source.includes("const requestedVoice = document.getElementById('next-cloud-podcast-voice')?.value || ''") &&
  source.includes('const voice = requestedVoice'),
  'The selected Azure voice can be lost while the article is translated'
);
assert(
  !source.includes("if (!article || !('speechSynthesis' in window))"),
  'Cloud podcast controls are still blocked when Android device speech is unavailable'
);
assert(
  source.includes("const deviceSpeechAvailable = 'speechSynthesis' in window"),
  'News App 2 does not distinguish optional device speech from cloud podcasts'
);
assert(
  source.includes("? (shortText || fullText)"),
  'Short cloud podcasts do not fall back to the article text when summarization is unavailable'
);
assert(
  source.includes("core.text(error?.message)"),
  'Cloud podcast failures do not expose a useful error in the article panel'
);

console.log('Generated podcast loading and generation contract: OK');
