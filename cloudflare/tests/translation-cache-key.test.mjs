import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { translationCacheKey } from '../shared/translation-cache-key.js';

test('a supplied cache key cannot select a translation for different text', async () => {
  const common = {
    targetLanguage: 'de', mode: 'continuation', title: '',
    sharedCacheKey: 'a'.repeat(64)
  };
  const first = await translationCacheKey({ ...common, text: 'first article' });
  const second = await translationCacheKey({ ...common, text: 'different article' });
  const same = await translationCacheKey({
    ...common, sharedCacheKey: 'b'.repeat(64), text: 'first article'
  });
  assert.notEqual(first, second);
  assert.equal(first, same);
  const worker = await readFile(new URL('../wrn-translation-cache/src/index.js', import.meta.url), 'utf8');
  assert.match(worker, /translationCacheKey\(\{\s*targetLanguage,\s*mode,\s*title,\s*text/);
  assert.doesNotMatch(worker, /body\.sharedCacheKey|request\.headers\.get\('X-WRN-Cache-Key'\)/);
});
