import assert from 'node:assert/strict';
import test from 'node:test';
import {
  publicOperationalStatus,
  quotaAlertPlan,
  reachedThreshold,
  usagePercent
} from '../revolution-proxy/src/operations.js';

const status = (metric, used, limit, windowKey = '2026-08') => ({
  metric, used, limit, remaining: Math.max(0, limit - used), windowKey,
  resetAt: '2026-09-01T00:00:00.000Z'
});

test('quota thresholds are reported at 80, 90 and 100 percent', () => {
  assert.equal(usagePercent(status('azure_characters', 799, 1000)), 79.9);
  assert.equal(reachedThreshold(status('azure_characters', 800, 1000)), 80);
  assert.equal(reachedThreshold(status('azure_characters', 900, 1000)), 90);
  assert.equal(reachedThreshold(status('azure_characters', 1000, 1000)), 100);
});

test('a threshold is notified once per quota window', () => {
  const first = quotaAlertPlan([status('azure_characters', 820, 1000)], {});
  assert.equal(first.alerts[0].threshold, 80);
  const duplicate = quotaAlertPlan([status('azure_characters', 850, 1000)], first.state);
  assert.equal(duplicate.alerts.length, 0);
  const next = quotaAlertPlan([status('azure_characters', 910, 1000)], duplicate.state);
  assert.equal(next.alerts[0].threshold, 90);
  const reset = quotaAlertPlan([status('azure_characters', 810, 1000, '2026-09')], next.state);
  assert.equal(reset.alerts[0].threshold, 80);
});

test('public operations status contains counters but no request content', () => {
  const result = publicOperationalStatus([
    status('translation_upstream', 80, 100, '2026-08-05')
  ], '2026-08-05T12:00:00.000Z');
  assert.equal(result.healthy, true);
  assert.equal(result.quotas[0].percent, 80);
  assert.equal(JSON.stringify(result).includes('message'), false);
});
