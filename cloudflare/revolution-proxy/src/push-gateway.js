import { DurableObject } from 'cloudflare:workers';
import webpush from 'web-push';

const MAX_FILTERS = 30;
const MAX_SUBSCRIPTIONS = 10000;
const MAX_SUBSCRIPTIONS_PER_CLIENT = 50;
const INACTIVITY_MS = 180 * 24 * 60 * 60 * 1000;
const BROADCAST_PAGE_SIZE = 250;

// Provider-owned hosts only. Deliberately no configurable arbitrary URL or
// generic google.com allowlist. See the deployment report for provider docs.
function validPushEndpoint(endpoint) {
  try {
    const parsed = new URL(endpoint);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password
      || (parsed.port && parsed.port !== '443') || parsed.hash) return false;
    const host = parsed.hostname;
    return host === 'fcm.googleapis.com'
      || host === 'updates.push.services.mozilla.com'
      || /^[a-z0-9-]+\.push\.apple\.com$/.test(host)
      || /^[a-z0-9-]+\.notify\.windows\.com$/.test(host);
  } catch {
    return false;
  }
}

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
  if (!validPushEndpoint(endpoint) || !p256dh || !auth) return null;
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
    this.storage = ctx.storage;
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
    if (!this.sql.exec('PRAGMA table_info(push_subscription)').toArray().some(row => row.name === 'client_key')) {
      this.sql.exec("ALTER TABLE push_subscription ADD COLUMN client_key TEXT NOT NULL DEFAULT ''");
    }
    this.sql.exec('CREATE INDEX IF NOT EXISTS push_client_key ON push_subscription(client_key)');
    this.sql.exec('CREATE INDEX IF NOT EXISTS push_updated_at ON push_subscription(updated_at)');
  }

  prune(now = new Date()) {
    this.sql.exec('DELETE FROM push_subscription WHERE updated_at < ?', new Date(now.getTime() - INACTIVITY_MS).toISOString());
  }

  async subscribe(input = {}) {
    const subscription = validSubscription(input.subscription);
    if (!subscription) return { ok: false, reason: 'invalid_subscription' };
    const clientKey = String(input.clientKey || '');
    if (!/^[a-f0-9]{64}$/.test(clientKey)) return { ok: false, reason: 'invalid_client' };
    const id = await endpointHash(subscription.endpoint);
    // No asynchronous gap between admission and insertion. The synchronous
    // transaction enforces both limits under concurrent RPC registrations.
    return this.storage.transactionSync(() => {
      this.prune();
      const existing = this.sql.exec('SELECT client_key FROM push_subscription WHERE id = ?', id).toArray()[0];
      const owner = existing?.client_key || clientKey;
      if (!existing || !existing.client_key) {
        const clientCount = Number(this.sql.exec('SELECT COUNT(*) AS count FROM push_subscription WHERE client_key = ?', owner).toArray()[0].count);
        const total = Number(this.sql.exec('SELECT COUNT(*) AS count FROM push_subscription').toArray()[0].count);
        if (clientCount >= MAX_SUBSCRIPTIONS_PER_CLIENT || (!existing && total >= MAX_SUBSCRIPTIONS)) {
          return { ok: false, reason: 'subscription_capacity' };
        }
      }
      this.sql.exec(
        `INSERT INTO push_subscription
          (id, endpoint, p256dh, auth, preferences, language, time_zone, app_version, updated_at, client_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           endpoint = excluded.endpoint,
           p256dh = excluded.p256dh,
           auth = excluded.auth,
           preferences = excluded.preferences,
           language = excluded.language,
           time_zone = excluded.time_zone,
           app_version = excluded.app_version,
           updated_at = excluded.updated_at,
           client_key = excluded.client_key`,
        id,
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth,
        JSON.stringify(normalizedPreferences(input.preferences)),
        clean(input.language, 10),
        clean(input.timeZone, 80),
        clean(input.appVersion, 30),
        new Date().toISOString(),
        owner
      );
      return { ok: true, id };
    });
  }

  async unsubscribe(input = {}) {
    const endpoint = clean(input.endpoint, 1500);
    if (!endpoint) return { ok: false, reason: 'invalid_endpoint' };
    const id = await endpointHash(endpoint);
    this.sql.exec('DELETE FROM push_subscription WHERE id = ?', id);
    return { ok: true };
  }

  status() {
    this.prune();
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
    this.prune();
    const counts = { matched: 0, sent: 0, failed: 0, removed: 0 };
    let lastId = '';
    // Keyset pages cover all subscriptions. Newer unrelated preferences cannot
    // push an older matching recipient out of a fixed newest-N candidate list.
    for (;;) {
      const rows = this.sql.exec(
        `SELECT id, endpoint, p256dh, auth, preferences, language, time_zone
         FROM push_subscription WHERE id > ? ORDER BY id LIMIT ?`,
        lastId, BROADCAST_PAGE_SIZE
      ).toArray();
      if (!rows.length) break;
      lastId = rows[rows.length - 1].id;
      const safeRows = rows.filter(row => {
        if (validPushEndpoint(row.endpoint)) return true;
        this.sql.exec('DELETE FROM push_subscription WHERE id = ?', row.id);
        counts.removed += 1;
        return false;
      });
      const accepted = safeRows.filter(row => acceptsNotification({
        preferences: parsedPreferences(row.preferences),
        timeZone: row.time_zone
      }, payload));
      counts.matched += accepted.length;
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
    }
    return { ok: true, ...counts };
  }
}

export const pushInternals = {
  acceptsNotification,
  inQuietHours,
  normalizedPreferences,
  validSubscription,
  validPushEndpoint,
  MAX_SUBSCRIPTIONS,
  MAX_SUBSCRIPTIONS_PER_CLIENT,
  INACTIVITY_MS
};
