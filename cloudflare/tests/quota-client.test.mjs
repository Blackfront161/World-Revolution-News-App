import assert from 'node:assert/strict';
import test from 'node:test';
import {
  quotaDefinition,
  quotaStatus,
  releaseQuota,
  reserveQuota,
  serviceEnabled
} from '../shared/quota-client.js';

function fakeEnvironment(overrides = {}) {
  const counters = new Map();
  const namespace = {
    getByName(name) {
      return {
        async reserve(input) {
          const current = counters.get(name);
          const used = !current || current.windowKey !== input.windowKey
            ? Number(input.baseline || 0)
            : current.used;
          if (used + input.amount > input.limit) {
            return {
              allowed: false,
              reason: 'quota_exhausted',
              used,
              limit: input.limit,
              remaining: Math.max(0, input.limit - used),
              resetAt: input.resetAt
            };
          }
          const next = { ...input, used: used + input.amount };
          counters.set(name, next);
          return {
            allowed: true,
            used: next.used,
            limit: input.limit,
            remaining: input.limit - next.used,
            resetAt: input.resetAt
          };
        },
        async release(input) {
          const current = counters.get(name);
          if (!current || current.windowKey !== input.windowKey) {
            return { released: false, reason: 'window_changed' };
          }
          current.used = Math.max(0, current.used - input.amount);
          return { released: true, used: current.used };
        },
        async status(input) {
          const current = counters.get(name);
          const used = current?.windowKey === input.windowKey ? current.used : 0;
          return {
            allowed: used < input.limit,
            used,
            limit: input.limit,
            remaining: input.limit - used,
            resetAt: input.resetAt
          };
        }
      };
    }
  };
  return { QUOTA_COORDINATOR: namespace, ...overrides };
}

test('daily quota blocks at the configured ceiling and reactivates next UTC day', async () => {
  const env = fakeEnvironment({ TRANSLATION_DAILY_LIMIT: '2' });
  const beforeReset = new Date('2026-07-27T23:59:00.000Z');
  assert.equal((await reserveQuota(env, 'translation_upstream', 1, { now: beforeReset })).allowed, true);
  assert.equal((await reserveQuota(env, 'translation_upstream', 1, { now: beforeReset })).allowed, true);
  const blocked = await reserveQuota(env, 'translation_upstream', 1, { now: beforeReset });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.resetAt, '2026-07-28T00:00:00.000Z');

  const afterReset = new Date('2026-07-28T00:00:01.000Z');
  assert.equal((await reserveQuota(env, 'translation_upstream', 1, { now: afterReset })).allowed, true);
});

test('monthly Azure quota reactivates without a manual switch', async () => {
  const env = fakeEnvironment({ AZURE_MONTHLY_CHAR_LIMIT: '10' });
  const july = new Date('2026-07-31T23:59:59.000Z');
  assert.equal((await reserveQuota(env, 'azure_characters', 10, { now: july })).allowed, true);
  assert.equal((await reserveQuota(env, 'azure_characters', 1, { now: july })).allowed, false);

  const august = new Date('2026-08-01T00:00:01.000Z');
  assert.equal((await reserveQuota(env, 'azure_characters', 1, { now: august })).allowed, true);
});

test('feedback has an independent daily ceiling', async () => {
  const env = fakeEnvironment({ FEEDBACK_DAILY_LIMIT: '1' });
  const now = new Date('2026-08-05T12:00:00.000Z');
  assert.equal((await reserveQuota(env, 'feedback_submissions', 1, { now })).allowed, true);
  assert.equal((await reserveQuota(env, 'feedback_submissions', 1, { now })).allowed, false);
  assert.equal(quotaDefinition(env, 'feedback_submissions', now).limit, 1);
});

test('failed work can release its reservation', async () => {
  const now = new Date('2026-07-27T12:00:00.000Z');
  const env = fakeEnvironment({ TRANSLATION_KV_DAILY_WRITE_LIMIT: '2' });
  await reserveQuota(env, 'translation_kv_writes', 2, { now });
  assert.equal((await quotaStatus(env, 'translation_kv_writes', now)).allowed, false);
  assert.equal((await releaseQuota(env, 'translation_kv_writes', 1, now)).released, true);
  assert.equal((await quotaStatus(env, 'translation_kv_writes', now)).allowed, true);
});

test('missing coordinator fails closed', async () => {
  const result = await reserveQuota({}, 'translation_upstream', 1);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'quota_guard_unavailable');
});

test('manual switches default to enabled and accept explicit off values', () => {
  assert.equal(serviceEnabled({}, 'WRN_TRANSLATION_ENABLED'), true);
  assert.equal(serviceEnabled({ WRN_TRANSLATION_ENABLED: 'off' }, 'WRN_TRANSLATION_ENABLED'), false);
});

test('defaults retain a small reserve below the free quota', () => {
  assert.equal(quotaDefinition({}, 'translation_kv_writes').limit, 950);
  assert.equal(quotaDefinition({}, 'azure_characters').limit, 475000);
});
