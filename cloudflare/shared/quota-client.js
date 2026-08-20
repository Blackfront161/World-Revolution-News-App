const DEFAULT_LIMITS = Object.freeze({
  // 5 % reserve below common free allocations. Every value can be lowered
  // without a deployment by changing the corresponding Worker variable.
  translationRequestsPerDay: 950,
  feedbackSubmissionsPerDay: 250,
  azureCharactersPerMonth: 475000,
  kvWritesPerDay: 950,
  podcastStorageBytes: 9 * 1024 * 1024 * 1024,
});

function safeInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? Math.floor(number)
    : fallback;
}

function utcDayWindow(now = new Date()) {
  const start = now.toISOString().slice(0, 10);
  const reset = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  ));
  return { key: start, resetAt: reset.toISOString() };
}

function utcMonthWindow(now = new Date()) {
  const key = now.toISOString().slice(0, 7);
  const reset = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    1,
  ));
  return { key, resetAt: reset.toISOString() };
}

function quotaDefinition(env, metric, now = new Date()) {
  switch (metric) {
    case "translation_upstream":
      return {
        ...utcDayWindow(now),
        limit: safeInteger(
          env.TRANSLATION_DAILY_LIMIT,
          DEFAULT_LIMITS.translationRequestsPerDay,
        ),
      };
    case "feedback_submissions":
      return {
        ...utcDayWindow(now),
        limit: safeInteger(
          env.FEEDBACK_DAILY_LIMIT,
          DEFAULT_LIMITS.feedbackSubmissionsPerDay,
        ),
      };
    case "azure_characters":
      return {
        ...utcMonthWindow(now),
        limit: safeInteger(
          env.AZURE_MONTHLY_CHAR_LIMIT,
          DEFAULT_LIMITS.azureCharactersPerMonth,
        ),
      };
    case "translation_kv_writes":
      return {
        ...utcDayWindow(now),
        limit: safeInteger(
          env.TRANSLATION_KV_DAILY_WRITE_LIMIT,
          DEFAULT_LIMITS.kvWritesPerDay,
        ),
      };
    case "podcast_storage":
      return {
        ...utcMonthWindow(now),
        limit: safeInteger(
          env.PODCAST_STORAGE_LIMIT_BYTES,
          DEFAULT_LIMITS.podcastStorageBytes,
        ),
      };
    default:
      throw new Error(`Unknown quota metric: ${metric}`);
  }
}

function coordinator(env, metric) {
  if (!env.QUOTA_COORDINATOR?.getByName) {
    throw new Error("QUOTA_COORDINATOR binding is missing");
  }
  return env.QUOTA_COORDINATOR.getByName(`wrn-quota:${metric}`);
}

export async function reserveQuota(
  env,
  metric,
  amount = 1,
  { baseline = 0, now = new Date() } = {},
) {
  const definition = quotaDefinition(env, metric, now);
  try {
    return await coordinator(env, metric).reserve({
      metric,
      windowKey: definition.key,
      resetAt: definition.resetAt,
      amount,
      limit: definition.limit,
      baseline,
    });
  } catch (error) {
    console.error("Quota reservation failed closed", {
      metric,
      message: String(error?.message || error).slice(0, 200),
    });
    return {
      allowed: false,
      reason: "quota_guard_unavailable",
      metric,
      used: 0,
      limit: definition.limit,
      remaining: 0,
      resetAt: definition.resetAt,
    };
  }
}

export async function releaseQuota(env, metric, amount = 1, now = new Date()) {
  const definition = quotaDefinition(env, metric, now);
  try {
    return await coordinator(env, metric).release({
      metric,
      windowKey: definition.key,
      amount,
    });
  } catch (error) {
    console.error("Quota release failed", {
      metric,
      message: String(error?.message || error).slice(0, 200),
    });
    return { released: false, reason: "quota_guard_unavailable" };
  }
}

export async function quotaStatus(env, metric, now = new Date()) {
  const definition = quotaDefinition(env, metric, now);
  try {
    return await coordinator(env, metric).status({
      metric,
      windowKey: definition.key,
      resetAt: definition.resetAt,
      limit: definition.limit,
    });
  } catch (error) {
    return {
      allowed: false,
      reason: "quota_guard_unavailable",
      metric,
      used: 0,
      limit: definition.limit,
      remaining: 0,
      resetAt: definition.resetAt,
    };
  }
}

export function serviceEnabled(env, variableName) {
  const value = String(env[variableName] ?? "true").trim().toLowerCase();
  return !["0", "false", "off", "disabled"].includes(value);
}

export { DEFAULT_LIMITS, quotaDefinition };
