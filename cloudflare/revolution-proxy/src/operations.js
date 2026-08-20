const ALERT_THRESHOLDS = Object.freeze([80, 90, 100]);

const METRIC_LABELS = Object.freeze({
  translation_upstream: 'Cloudflare Übersetzungsanfragen',
  feedback_submissions: 'Feedback-Eingänge',
  azure_characters: 'Azure Speech Zeichen',
  podcast_storage: 'Cloudflare R2 Podcast-Speicher'
});

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function usagePercent(status = {}) {
  const used = safeNumber(status.used);
  const limit = safeNumber(status.limit);
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 1000) / 10);
}

function reachedThreshold(status = {}) {
  const percent = usagePercent(status);
  return [...ALERT_THRESHOLDS].reverse().find(value => percent >= value) || 0;
}

function metricWindow(status = {}) {
  return String(status.windowKey || status.resetAt || 'unknown').slice(0, 80);
}

function quotaAlertPlan(statuses = [], previous = {}) {
  const alerts = [];
  const next = {};
  for (const status of statuses) {
    const metric = String(status?.metric || '').trim();
    if (!metric) continue;
    const windowKey = metricWindow(status);
    const threshold = reachedThreshold(status);
    const prior = previous?.[metric];
    const priorThreshold = prior?.windowKey === windowKey
      ? safeNumber(prior.threshold)
      : 0;
    next[metric] = {
      windowKey,
      threshold,
      used: safeNumber(status.used),
      limit: safeNumber(status.limit),
      percent: usagePercent(status),
      resetAt: String(status.resetAt || ''),
      updatedAt: new Date().toISOString()
    };
    if (threshold > priorThreshold) {
      alerts.push({
        metric,
        label: METRIC_LABELS[metric] || metric,
        threshold,
        used: next[metric].used,
        limit: next[metric].limit,
        percent: next[metric].percent,
        resetAt: next[metric].resetAt
      });
    }
  }
  return { alerts, state: next };
}

function publicOperationalStatus(statuses = [], checkedAt = new Date().toISOString()) {
  return {
    schemaVersion: 1,
    checkedAt,
    healthy: statuses.every(status => status?.reason !== 'quota_guard_unavailable'),
    quotas: statuses.map(status => ({
      metric: String(status?.metric || ''),
      label: METRIC_LABELS[String(status?.metric || '')] || String(status?.metric || ''),
      used: safeNumber(status?.used),
      limit: safeNumber(status?.limit),
      remaining: safeNumber(status?.remaining),
      percent: usagePercent(status),
      threshold: reachedThreshold(status),
      resetAt: String(status?.resetAt || ''),
      available: status?.reason !== 'quota_guard_unavailable'
    }))
  };
}

export {
  ALERT_THRESHOLDS,
  METRIC_LABELS,
  publicOperationalStatus,
  quotaAlertPlan,
  reachedThreshold,
  usagePercent
};
