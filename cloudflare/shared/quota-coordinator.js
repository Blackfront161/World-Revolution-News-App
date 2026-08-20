import { DurableObject } from "cloudflare:workers";

const MAX_SAFE_COUNTER = Number.MAX_SAFE_INTEGER;

function integer(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(MAX_SAFE_COUNTER, Math.floor(number)));
}

function clean(value, maximum = 120) {
  return String(value || "").trim().slice(0, maximum);
}

/**
 * Strongly consistent quota counter.
 *
 * One Durable Object instance is used per resource (Azure characters, KV
 * writes, translation misses, …), so unrelated resources do not share a
 * global bottleneck. A changed windowKey starts a new day/month immediately;
 * no manual reactivation or scheduled job is required.
 */
export class QuotaCoordinator extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS quota_counter (
        metric TEXT PRIMARY KEY,
        window_key TEXT NOT NULL,
        used INTEGER NOT NULL,
        limit_value INTEGER NOT NULL,
        reset_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  async reserve(input = {}) {
    const metric = clean(input.metric);
    const windowKey = clean(input.windowKey);
    const resetAt = clean(input.resetAt, 64);
    const amount = integer(input.amount);
    const limit = integer(input.limit);
    const baseline = integer(input.baseline);
    const initial = Math.min(MAX_SAFE_COUNTER, baseline + amount);
    const updatedAt = new Date().toISOString();

    if (!metric || !windowKey || !resetAt || amount < 1 || limit < 1) {
      return {
        allowed: false,
        reason: "invalid_quota_request",
        metric,
        used: 0,
        limit,
        remaining: 0,
        resetAt,
      };
    }

    const rows = this.sql.exec(
      `INSERT INTO quota_counter
        (metric, window_key, used, limit_value, reset_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(metric) DO UPDATE SET
         window_key = excluded.window_key,
         used = CASE
           WHEN quota_counter.window_key <> excluded.window_key
             THEN excluded.used
           ELSE quota_counter.used + ?
         END,
         limit_value = excluded.limit_value,
         reset_at = excluded.reset_at,
         updated_at = excluded.updated_at
       WHERE CASE
         WHEN quota_counter.window_key <> excluded.window_key
           THEN excluded.used
         ELSE quota_counter.used + ?
       END <= excluded.limit_value
       RETURNING metric, window_key, used, limit_value, reset_at, updated_at`,
      metric,
      windowKey,
      initial,
      limit,
      resetAt,
      updatedAt,
      amount,
      amount,
    ).toArray();

    if (rows.length) return this.#result(rows[0], true);

    const current = this.sql.exec(
      `SELECT metric, window_key, used, limit_value, reset_at, updated_at
       FROM quota_counter WHERE metric = ?`,
      metric,
    ).toArray()[0];

    return {
      ...this.#result(current, false),
      reason: "quota_exhausted",
    };
  }

  async release(input = {}) {
    const metric = clean(input.metric);
    const windowKey = clean(input.windowKey);
    const amount = integer(input.amount);

    if (!metric || !windowKey || amount < 1) {
      return { released: false, reason: "invalid_release" };
    }

    const rows = this.sql.exec(
      `UPDATE quota_counter
       SET used = MAX(0, used - ?), updated_at = ?
       WHERE metric = ? AND window_key = ?
       RETURNING metric, window_key, used, limit_value, reset_at, updated_at`,
      amount,
      new Date().toISOString(),
      metric,
      windowKey,
    ).toArray();

    if (!rows.length) return { released: false, reason: "window_changed" };
    return { released: true, ...this.#result(rows[0], true) };
  }

  async status(input = {}) {
    const metric = clean(input.metric);
    const windowKey = clean(input.windowKey);
    const resetAt = clean(input.resetAt, 64);
    const limit = integer(input.limit);
    const row = this.sql.exec(
      `SELECT metric, window_key, used, limit_value, reset_at, updated_at
       FROM quota_counter WHERE metric = ?`,
      metric,
    ).toArray()[0];

    if (!row || row.window_key !== windowKey) {
      return {
        allowed: true,
        metric,
        windowKey,
        used: 0,
        limit,
        remaining: limit,
        resetAt,
        updatedAt: "",
      };
    }

    return this.#result(row, row.used < row.limit_value);
  }

  #result(row, allowed) {
    const used = integer(row?.used);
    const limit = integer(row?.limit_value);
    return {
      allowed: Boolean(allowed),
      metric: clean(row?.metric),
      windowKey: clean(row?.window_key),
      used,
      limit,
      remaining: Math.max(0, limit - used),
      resetAt: clean(row?.reset_at, 64),
      updatedAt: clean(row?.updated_at, 64),
    };
  }
}
