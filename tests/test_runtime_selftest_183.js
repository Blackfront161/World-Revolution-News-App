'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
    path.join(root, 'runtime-selftest.js'),
    'utf8'
);

assert.doesNotThrow(
    () => new Function(source),
    'runtime-selftest.js must be valid JavaScript'
);
assert.match(source, /const EXPECTED_VERSION = '2\.1\.0';/);
assert.doesNotMatch(source, /EXPECTED_VERSION\s*=\s*['"]1\.7\.(?:5|17)['"]/);

for (const language of ['en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr']) {
    assert.match(
        source,
        new RegExp(`\\b${language}: Object\\.freeze\\(\\{`),
        `missing self-test language: ${language}`
    );
}

const textBlock = source.slice(source.indexOf('const TEXTS'), source.indexOf('let latestReport'));
for (const forbidden of [
    'published app', 'Release build', 'veröffentlichte App', 'Release-Build',
    'lanzamiento', 'app publicada', 'publication', 'application publiée',
    'rilascio', 'app pubblicata', 'aplicação publicada', 'релиза', 'опубликованного',
    'Αυτοέλεγχος έκδοσης', 'δημοσιευμένη εφαρμογή', 'yayımlanan uygulama', 'Sürüm derlemesi'
]) {
    assert.ok(!textBlock.includes(forbidden), `release wording remains in self-test copy: ${forbidden}`);
}

for (const moduleName of [
    'WRNVideoHub',
    'WRNAudioTab183',
    'WRNInterfaceBlock3',
    'WRNSourceRecoveryUI183',
    'WRNSourceVerification',
    'WRNActionRadar',
    'WRNEditorialReview',
    'WRNSourceHealthFreshness'
]) {
    assert.ok(source.includes(`'${moduleName}'`), `missing module check: ${moduleName}`);
}

assert.ok(source.includes('localStorage.setItem(TEMP_STORAGE_KEY'));
assert.ok(source.includes('localStorage.removeItem(TEMP_STORAGE_KEY)'));
assert.ok(source.includes("event.key === 'Escape'"));
assert.ok(source.includes("cache: 'no-store'"));
assert.ok(source.includes('target.origin === location.origin'));
assert.ok(source.includes('navigator.serviceWorker.getRegistration()'));
assert.ok(source.includes('navigator.serviceWorker?.controller'));
assert.ok(source.includes("'./manifest.json'"));
assert.ok(source.includes('new MutationObserver'));

console.log('WRN 2.1.0 runtime self-test contracts: OK');
