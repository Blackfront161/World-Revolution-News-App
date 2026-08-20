import { DurableObject } from 'cloudflare:workers';
import webpush from 'web-push';

const MAX_FILTERS = 30;
const MAX_SUBSCRIPTIONS_PER_BROADCAST = 2500;

function clean(value, maximum = 200) {
  return String(value || '').trim().slice(0, maximum);
}

function cleanList(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map(item => clean(item, 80))
    .filter(Boolean))].slice(0, MAX_FILTERS);
}

function validTime(value, fallback) {
  const text = clean(value, 5);
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : fallback;
}

function validSubscription(value) {
  const endpoint = clean(value?.endpoint, 1500);
  const p256dh = clean(value?.keys?.p256dh, 300);
  const auth = clean(value?.keys?.auth, 200);
  try {
    const parsed = new URL(endpoint);
    if (parsed.protocol !== 'https:' || !p256dh || !auth) return null;
  } catch {
    return null;
  }
  return { endpoint, expirationTime: value?.expirationTime || null, keys: { p256dh, auth } };
}

function normalizedPreferences(input = {}) {
  return {
    breakingOnly: input.breakingOnly !== false,
    followedOnly: input.followedOnly !== false,
    corrections: input.corrections !== false,
    quietFrom: validTime(input.quietFrom, '22:00'),
    quietUntil: validTime(input.quietUntil, '07:00'),
    regions: cleanList(input.regions),
    topics: cleanList(input.topics)
  };
}

function minutesInTimeZone(timeZone, now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: clean(timeZone, 80) || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(now);
    const hour = Number(parts.find(item => item.type === 'hour')?.value || 0);
    const minute = Number(parts.find(item => item.type === 'minute')?.value || 0);
    return hour * 60 + minute;
  } catch {
    return now.getUTCHours() * 60 + now.getUTCMinutes();
  }
}

function inQuietHours(preferences, timeZone, now = new Date()) {
  const toMinutes = value => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const current = minutesInTimeZone(timeZone, now);
  const start = toMinutes(preferences.quietFrom);
  const end = toMinutes(preferences.quietUntil);
  if (start === end) return false;
  return start < end
    ? current >= start && current < end
    : current >= start || current < end;
}

function intersects(left, right) {
  const accepted = new Set(right);
  return left.some(item => accepted.has(item));
}

function parsedPreferences(value) {
  try {
    const parsed = JSON.parse(String(value || '{}'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function acceptsNotification(record, payload, now = new Date()) {
  const preferences = normalizedPreferences(record.preferences);
  const kind = clean(payload.kind, 20) || 'news';
  if (kind === 'correction' && !preferences.corrections) return false;
  if (preferences.breakingOnly && !['breaking', 'correction'].includes(kind)) return false;
  if (inQuietHours(preferences, record.timeZone, now)) return false;
  if (!preferences.followedOnly) return true;
  const regions = cleanList(payload.regions);
  const topics = cleanList(payload.topics);
  return intersects(regions, preferences.regions) || intersects(topics, preferences.topics);
}

async function endpointHash(endpoint) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export class PushGateway extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS push_subscription (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        preferences TEXT NOT NULL,
        language TEXT NOT NULL,
        time_zone TEXT NOT NULL,
        app_version TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  async subscribe(input = {}) {
    const subscription = validSubscription(input.subscription);
    if (!subscription) return { ok: false, reason: 'invalid_subscription' };
    const id = await endpointHash(subscription.endpoint);
    this.sql.exec(
      `INSERT INTO push_subscription
        (id, endpoint, p256dh, auth, preferences, language, time_zone, app_version, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         endpoint = excluded.endpoint,
         p256dh = excluded.p256dh,
         auth = excluded.auth,
         preferences = excluded.preferences,
         language = excluded.language,
         time_zone = excluded.time_zone,
         app_version = excluded.app_version,
         updated_at = excluded.updated_at`,
      id,
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      JSON.stringify(normalizedPreferences(input.preferences)),
      clean(input.language, 10),
      clean(input.timeZone, 80),
      clean(input.appVersion, 30),
      new Date().toISOString()
    );
    return { ok: true, id };
  }

  async unsubscribe(input = {}) {
    const endpoint = clean(input.endpoint, 1500);
    if (!endpoint) return { ok: false, reason: 'invalid_endpoint' };
    const id = await endpointHash(endpoint);
    this.sql.exec('DELETE FROM push_subscription WHERE id = ?', id);
    return { ok: true };
  }

  status() {
    const row = this.sql.exec('SELECT COUNT(*) AS count FROM push_subscription').toArray()[0];
    return { ok: true, subscriptions: Number(row?.count || 0) };
  }

  async publish(input = {}) {
    const payload = {
      title: clean(input.payload?.title, 160),
      body: clean(input.payload?.body, 500),
      url: clean(input.payload?.url, 500),
      tag: clean(input.payload?.tag, 100),
      kind: clean(input.payload?.kind, 20),
      regions: cleanList(input.payload?.regions),
      topics: cleanList(input.payload?.topics)
    };
    if (!payload.title || !payload.body || !input.vapid?.publicKey || !input.vapid?.privateKey || !input.vapid?.subject) {
      return { ok: false, reason: 'push_not_configured' };
    }
    webpush.setVapidDetails(input.vapid.subject, input.vapid.publicKey, input.vapid.privateKey);
    const rows = this.sql.exec(
      `SELECT id, endpoint, p256dh, auth, preferences, language, time_zone
       FROM push_subscription ORDER BY updated_at DESC LIMIT ?`,
      MAX_SUBSCRIPTIONS_PER_BROADCAST
    ).toArray();
    const accepted = rows.filter(row => acceptsNotification({
      preferences: parsedPreferences(row.preferences),
      timeZone: row.time_zone
    }, payload));
    const counts = { matched: accepted.length, sent: 0, failed: 0, removed: 0 };
    for (let start = 0; start < accepted.length; start += 40) {
      const batch = accepted.slice(start, start + 40);
      await Promise.all(batch.map(async row => {
        try {
          await webpush.sendNotification({
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth }
          }, JSON.stringify(payload), { TTL: 60 * 60 * 6, urgency: payload.kind === 'breaking' ? 'high' : 'normal' });
          counts.sent += 1;
        } catch (error) {
          const statusCode = Number(error?.statusCode || 0);
          if (statusCode === 404 || statusCode === 410) {
            this.sql.exec('DELETE FROM push_subscription WHERE id = ?', row.id);
            counts.removed += 1;
          } else {
            counts.failed += 1;
          }
        }
      }));
    }
    return { ok: true, ...counts };
  }
}

export const pushInternals = {
  acceptsNotification,
  inQuietHours,
  normalizedPreferences,
  validSubscription
};
