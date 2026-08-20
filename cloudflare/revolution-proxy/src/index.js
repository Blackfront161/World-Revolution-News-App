import { QuotaCoordinator } from '../../shared/quota-coordinator.js';
import {
  quotaStatus,
  releaseQuota,
  reserveQuota,
  serviceEnabled
} from '../../shared/quota-client.js';
import {
  publicOperationalStatus,
  quotaAlertPlan
} from './operations.js';
import { PushGateway } from './push-gateway.js';

export { PushGateway, QuotaCoordinator };

/*
 * World Revolution News – Übersetzung, Azure-Podcasts und 30-Tage-Bibliothek
 *
 * Unterstützt gleichzeitig:
 * 1. das neue strukturierte App-Protokoll
 * 2. das ältere Gemini-kompatible Protokoll während der Umstellung
 *
 * Anbieter-Reihenfolge: Gemini 1–4, danach Hugging Face, zuletzt Gemini 5.
 */

const DEFAULT_ALLOWED_ORIGINS = [
  'https://blackfront161.github.io',
  'https://solinaridao.com',
  'https://www.solinaridao.com',
  // Capacitor lädt die Android-App standardmäßig von https://localhost.
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost:8000',
  'http://127.0.0.1',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:8765'
];

const LANGUAGE_NAMES = {
  en: 'English',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  el: 'Greek',
  tr: 'Turkish'
};

const MAX_TITLE_LENGTH = 500;
const MAX_TEXT_LENGTH = 6000;
const MAX_LEGACY_PROMPT_LENGTH = 12000;
const MAX_BODY_BYTES = 40000;
const GEMINI_PHASE_MS = 26000;
const HF_PHASE_MS = 15000;
const GEMINI_RESERVE_PHASE_MS = 9000;
const FEEDBACK_MAX_MESSAGE_LENGTH = 4000;
const FEEDBACK_TYPES = new Set(['feedback', 'source', 'correction', 'technical']);
const FEEDBACK_PREFIX = 'feedback/';
const FEEDBACK_RETENTION_DAYS = 90;
const FEEDBACK_PRUNE_LIMIT = 2000;
const OPERATIONS_PREFIX = 'operations/';
const QUOTA_ALERT_STATE_KEY = `${OPERATIONS_PREFIX}quota-alerts.json`;
const OPERATIONS_STATUS_KEY = `${OPERATIONS_PREFIX}status.json`;

const PODCAST_PREFIX = 'podcasts/';
const PODCAST_RETENTION_DAYS = 30;
const PODCAST_MAX_ITEMS = 1500;
const PODCAST_LIST_LIMIT = 500;
// Eine einzelne MP3 darf bis zu 25 MB groß sein. Azure F0 erzeugt pro Anfrage
// maximal 10 Minuten Audio, normalerweise bleiben die Dateien deutlich kleiner.
const PODCAST_MAX_AUDIO_BYTES = 25 * 1024 * 1024;
// Harte Sicherheitsgrenze: Der gemeinsame Podcast-Speicher darf höchstens 7 GiB belegen.
const PODCAST_STORAGE_LIMIT_BYTES = 9 * 1024 * 1024 * 1024;
const PODCAST_MONTHLY_CHAR_LIMIT = 475000;
const PODCAST_SHORT_INPUT_LENGTH = 12000;
const PODCAST_FULL_INPUT_LENGTH = 9000;
const PODCAST_SHORT_AUDIO_LENGTH = 3600;
const PODCAST_FULL_AUDIO_LENGTH = 8000;

const AZURE_VOICES = {
  en: [
    { name: 'en-US-AriaNeural', locale: 'en-US', label: 'Aria – professional' },
    { name: 'en-US-GuyNeural', locale: 'en-US', label: 'Guy – newscast' }
  ],
  de: [
    { name: 'de-DE-KatjaNeural', locale: 'de-DE', label: 'Katja' },
    { name: 'de-DE-ConradNeural', locale: 'de-DE', label: 'Conrad' }
  ],
  es: [
    { name: 'es-ES-ElviraNeural', locale: 'es-ES', label: 'Elvira' },
    { name: 'es-ES-AlvaroNeural', locale: 'es-ES', label: 'Álvaro' }
  ],
  fr: [
    { name: 'fr-FR-DeniseNeural', locale: 'fr-FR', label: 'Denise' },
    { name: 'fr-FR-HenriNeural', locale: 'fr-FR', label: 'Henri' }
  ],
  it: [
    { name: 'it-IT-ElsaNeural', locale: 'it-IT', label: 'Elsa' },
    { name: 'it-IT-DiegoNeural', locale: 'it-IT', label: 'Diego' }
  ],
  pt: [
    { name: 'pt-BR-FranciscaNeural', locale: 'pt-BR', label: 'Francisca' },
    { name: 'pt-BR-AntonioNeural', locale: 'pt-BR', label: 'Antonio' }
  ],
  ru: [
    { name: 'ru-RU-SvetlanaNeural', locale: 'ru-RU', label: 'Светлана' },
    { name: 'ru-RU-DmitryNeural', locale: 'ru-RU', label: 'Дмитрий' }
  ],
  el: [
    { name: 'el-GR-AthinaNeural', locale: 'el-GR', label: 'Αθηνά' },
    { name: 'el-GR-NestorasNeural', locale: 'el-GR', label: 'Νέστορας' }
  ],
  tr: [
    { name: 'tr-TR-EmelNeural', locale: 'tr-TR', label: 'Emel' },
    { name: 'tr-TR-AhmetNeural', locale: 'tr-TR', label: 'Ahmet' }
  ]
};

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

const DEFAULT_HF_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct-1M:fastest',
  'google/gemma-2-2b-it:fastest'
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || '';
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = getAllowedOrigins(env);
    const originAllowed = !origin || allowedOrigins.has(origin);

    if (request.method === 'OPTIONS') {
      if (!origin || !originAllowed) {
        return new Response(null, { status: 403, headers: securityHeaders() });
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if ((request.method === 'GET' || request.method === 'HEAD') && action === 'podcast.audio') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      return handlePodcastAudio(request, env, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'podcasts.list') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      return handlePodcastList(request, env, ctx, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'podcast.status') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      return handlePodcastStatus(env, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'push.config') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      return jsonResponse({
        ok: true,
        enabled: pushConfigured(env),
        publicKey: pushConfigured(env) ? String(env.VAPID_PUBLIC_KEY) : ''
      }, 200, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'admin.feedback.list') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      if (!(await isAdminRequest(request, env))) return adminUnauthorized(originAllowed ? origin : '');
      return handleAdminFeedbackList(request, env, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'admin.feedback.read') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      if (!(await isAdminRequest(request, env))) return adminUnauthorized(originAllowed ? origin : '');
      return handleAdminFeedbackRead(request, env, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'admin.operations.status') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      if (!(await isAdminRequest(request, env))) return adminUnauthorized(originAllowed ? origin : '');
      return handleAdminOperationsStatus(env, originAllowed ? origin : '');
    }

    if (request.method === 'GET' && action === 'admin.push.status') {
      if (!originAllowed) return jsonResponse({ error: true, message: 'Origin nicht erlaubt.' }, 403, '');
      if (!(await isAdminRequest(request, env))) return adminUnauthorized(originAllowed ? origin : '');
      return handleAdminPushStatus(env, originAllowed ? origin : '');
    }

    if (request.method === 'GET') {
      return jsonResponse({
        ok: true,
        service: 'World Revolution News service',
        api: 'v2'
      }, 200, originAllowed ? origin : '');
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: true, message: 'Nur POST-Anfragen sind erlaubt.' }, 405, originAllowed ? origin : '');
    }

    if (!origin || !originAllowed) {
      return jsonResponse({ error: true, message: 'Diese Webseite darf den Dienst nicht verwenden.' }, 403, '');
    }

    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return jsonResponse({ error: true, message: 'Content-Type muss application/json sein.' }, 415, origin);
    }

    const declaredLength = Number(request.headers.get('Content-Length') || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: true, message: 'Die Anfrage ist zu groß.' }, 413, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: true, message: 'Die Anfrage enthält kein gültiges JSON.' }, 400, origin);
    }

    const requestedAction = String(body?.action || action || '');

    if (requestedAction === 'push.subscribe') {
      if (!(await allowPushRequest(env, request))) {
        return jsonResponse({ error: true, message: 'Zu viele Push-Anfragen. Bitte später erneut versuchen.' }, 429, origin);
      }
      return handlePushSubscribe(env, body, origin);
    }

    if (requestedAction === 'push.unsubscribe') {
      if (!(await allowPushRequest(env, request))) {
        return jsonResponse({ error: true, message: 'Zu viele Push-Anfragen. Bitte später erneut versuchen.' }, 429, origin);
      }
      return handlePushUnsubscribe(env, body, origin);
    }

    if (requestedAction === 'admin.push.send') {
      if (!(await isAdminRequest(request, env))) return adminUnauthorized(origin);
      return handleAdminPushSend(env, body, origin);
    }

    if (body?.action === 'feedback.submit') {
      if (!(await allowFeedbackRequest(env, request))) {
        return jsonResponse({ error: true, message: 'Zu viele Feedback-Anfragen. Bitte später erneut versuchen.' }, 429, origin);
      }
      return handleFeedbackSubmit(env, body, origin, ctx);
    }

    if (body?.action === 'podcast.generate') {
      if (!(await allowPodcastRequest(env, request))) {
        return jsonResponse({ error: true, message: 'Zu viele Podcast-Anfragen. Bitte später erneut versuchen.' }, 429, origin);
      }
      return handlePodcastGenerate(request, env, body, origin);
    }

    const parsed = parseRequest(body, request, env);
    if (!parsed.ok) {
      return jsonResponse({ error: true, message: parsed.message }, parsed.status, origin);
    }

    if (!(await allowRequest(env, request))) {
      return jsonResponse({
        error: true,
        message: 'Zu viele Übersetzungsanfragen. Bitte warte eine Minute.'
      }, 429, origin);
    }

    const generated = await generateTextWithProviders(env, parsed.prompt);
    if (generated.ok) {
      return successResponse(generated.text, generated.provider, generated.model, parsed.protocol, origin);
    }
    if (generated.quotaBlocked) {
      return jsonResponse({
        error: true,
        code: 'TRANSLATION_QUOTA_PAUSED',
        message: 'Das tägliche Übersetzungskontingent ist vorübergehend ausgeschöpft. Gespeicherte Übersetzungen bleiben verfügbar.',
        resetAt: generated.resetAt,
        reason: generated.reason
      }, 429, origin);
    }

    console.warn('Alle Übersetzungsanbieter fehlgeschlagen:', generated.errors);
    return jsonResponse({
      error: true,
      message: makeSimpleErrorMessage(generated.errors, generated.configured),
      details: generated.errors.slice(0, 12)
    }, 502, origin);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(Promise.allSettled([
      runOperationalMonitor(env),
      prunePodcastLibrary(env),
      pruneFeedbackInbox(env)
    ]));
  }
};

function parseRequest(body, request, env) {
  if (body?.action === 'translate') {
    const validation = validateStructuredRequest(body);
    if (!validation.ok) return validation;
    return {
      ok: true,
      protocol: 'structured-v2',
      prompt: buildTranslationPrompt(validation.value)
    };
  }

  const suppliedSecret = request.headers.get('X-App-Secret') || '';
  const expectedSecret = String(env.APP_SECRET || '').trim();
  if (!expectedSecret || suppliedSecret !== expectedSecret) {
    return { ok: false, status: 403, message: 'Das ältere Anfrageformat benötigt das richtige App-Secret.' };
  }

  const legacyPrompt = extractLegacyPrompt(body);
  if (!legacyPrompt) {
    return { ok: false, status: 400, message: 'Es wurde kein Text zum Übersetzen übertragen.' };
  }
  if (legacyPrompt.length > MAX_LEGACY_PROMPT_LENGTH) {
    return { ok: false, status: 413, message: `Der Text ist zu lang. Maximal erlaubt: ${MAX_LEGACY_PROMPT_LENGTH} Zeichen.` };
  }

  return {
    ok: true,
    protocol: 'legacy-v1',
    prompt: makeStrictLegacyPrompt(legacyPrompt)
  };
}

function validateStructuredRequest(body) {
  const targetLanguage = String(body?.targetLanguage || '').trim().toLowerCase();
  if (!LANGUAGE_NAMES[targetLanguage]) {
    return { ok: false, status: 400, message: 'Diese Zielsprache wird nicht unterstützt.' };
  }

  const mode = String(body?.mode || 'title_and_text');
  if (!['title_and_text', 'continuation'].includes(mode)) {
    return { ok: false, status: 400, message: 'Unbekannter Übersetzungsmodus.' };
  }

  const title = normalizePlainText(body?.title, MAX_TITLE_LENGTH);
  const text = normalizePlainText(body?.text, MAX_TEXT_LENGTH);

  if (!text) {
    return { ok: false, status: 400, message: 'Es wurde kein Text zum Übersetzen übertragen.' };
  }
  if (mode === 'title_and_text' && !title) {
    return { ok: false, status: 400, message: 'Für den ersten Abschnitt fehlt der Titel.' };
  }

  return { ok: true, value: { targetLanguage, mode, title, text } };
}

function buildTranslationPrompt({ targetLanguage, mode, title, text }) {
  const languageName = LANGUAGE_NAMES[targetLanguage];
  const genderRule = targetLanguage === 'de'
    ? 'Use consistent German gender-inclusive language with the gender star, for example Aktivist*innen, Arbeiter*innen and Autor*innen. Avoid the generic masculine. Do not change names, organization names or direct quotations.'
    : '';

  const commonRules = [
    `Translate fluently into ${languageName}.`,
    genderRule,
    'Return only the translation.',
    'Do not add an introduction, explanation, heading, commentary, quotation marks or closing sentence.',
    'Preserve paragraph breaks and meaning.',
    'Never write phrases such as “Here is the translation” or “Hier ist die deutsche Übersetzung”.'
  ].filter(Boolean).join(' ');

  if (mode === 'continuation') {
    return `${commonRules}\n\nText:\n${text}`;
  }

  return [
    commonRules,
    'Return exactly two sections separated by three hyphens: translated title---translated text.',
    '',
    `Title:\n${title}`,
    '',
    `Text:\n${text}`
  ].join('\n');
}

function extractLegacyPrompt(body) {
  if (typeof body?.prompt === 'string' && body.prompt.trim()) return body.prompt.trim();
  if (!Array.isArray(body?.contents)) return '';

  const parts = [];
  for (const content of body.contents) {
    if (!Array.isArray(content?.parts)) continue;
    for (const part of content.parts) {
      if (typeof part?.text === 'string' && part.text.trim()) parts.push(part.text.trim());
    }
  }
  return parts.join('\n\n').trim();
}

function makeStrictLegacyPrompt(prompt) {
  return [
    'IMPORTANT OUTPUT RULES:',
    'Act only as a translation engine.',
    'Return only the requested translated content.',
    'Do not add an introduction, explanation, heading, commentary, quotation marks, or closing sentence.',
    'Preserve the exact separator --- when requested.',
    'Preserve paragraph breaks and meaning.',
    '',
    prompt
  ].join('\n');
}

function normalizePlainText(value, maxLength) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, maxLength);
}

function getAllowedOrigins(env) {
  const custom = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  // Eigene Cloudflare-Einträge ergänzen die sicheren Standardwerte. Dadurch
  // bleibt die Android-App auch dann erreichbar, wenn ALLOWED_ORIGINS gesetzt ist.
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...custom]);
}

async function rateLimitKey(request, scope) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return sha256Hex(`${scope}:${ip}`);
}

async function allowRequest(env, request) {
  const key = await rateLimitKey(request, 'translation');
  if (env.TRANSLATION_RATE_LIMITER?.limit) {
    const { success } = await env.TRANSLATION_RATE_LIMITER.limit({ key });
    return success;
  }
  console.error('Translation rate limiter binding is unavailable');
  return false;
}

function getGeminiKeys(env) {
  return uniqueValues([env.GEMINI_KEY_1, env.GEMINI_KEY_2, env.GEMINI_KEY_3, env.GEMINI_KEY_4]);
}

function getReserveGeminiKeys(env) {
  return uniqueValues([env.GEMINI_KEY_5]);
}

function getAllGeminiKeys(env) {
  return uniqueValues([...getGeminiKeys(env), ...getReserveGeminiKeys(env)]);
}

function uniqueValues(values) {
  const result = [];
  for (const value of values) {
    const clean = typeof value === 'string' ? value.trim() : '';
    if (clean && !result.includes(clean)) result.push(clean);
  }
  return result;
}


async function generateTextWithProviders(env, prompt) {
  const errors = [];
  const geminiKeys = getGeminiKeys(env);
  const reserveGeminiKeys = getReserveGeminiKeys(env);
  const allGeminiKeys = uniqueValues([...geminiKeys, ...reserveGeminiKeys]);
  const geminiModels = uniqueValues([env.GEMINI_MODEL, ...DEFAULT_GEMINI_MODELS]);
  const configured = allGeminiKeys.length > 0 || Boolean(env.HF_TOKEN);

  if (!serviceEnabled(env, 'WRN_TRANSLATION_ENABLED')) {
    return {
      ok: false,
      errors,
      configured: { geminiConfigured: allGeminiKeys.length > 0, hfConfigured: Boolean(env.HF_TOKEN) },
      quotaBlocked: true,
      reason: 'manually_disabled',
      resetAt: ''
    };
  }

  if (configured) {
    const quota = await reserveQuota(env, 'translation_upstream', 1);
    if (!quota.allowed) {
      return {
        ok: false,
        errors,
        configured: { geminiConfigured: allGeminiKeys.length > 0, hfConfigured: Boolean(env.HF_TOKEN) },
        quotaBlocked: true,
        reason: quota.reason,
        resetAt: quota.resetAt
      };
    }
  }

  if (geminiKeys.length > 0) {
    const deadline = Date.now() + GEMINI_PHASE_MS;
    keyLoop:
    for (let keyIndex = 0; keyIndex < geminiKeys.length; keyIndex += 1) {
      for (const model of geminiModels) {
        const remaining = deadline - Date.now();
        if (remaining < 800) break keyLoop;
        const result = await callGemini({
          apiKey: geminiKeys[keyIndex],
          model,
          prompt,
          timeoutMs: Math.min(8000, remaining)
        });
        if (result.ok) return { ok: true, text: result.text, provider: 'gemini', model };
        errors.push({ provider: 'gemini', model, status: result.status, message: result.message });
        if ([401, 403].includes(result.status)) continue keyLoop;
      }
    }
  }

  if (env.HF_TOKEN) {
    const hfModels = uniqueValues([env.HF_MODEL, ...DEFAULT_HF_MODELS]);
    const deadline = Date.now() + HF_PHASE_MS;
    for (const model of hfModels) {
      const remaining = deadline - Date.now();
      if (remaining < 800) break;
      const result = await callHuggingFace({
        token: env.HF_TOKEN,
        model,
        prompt,
        timeoutMs: Math.min(12000, remaining)
      });
      if (result.ok) return { ok: true, text: result.text, provider: 'huggingface', model };
      errors.push({ provider: 'huggingface', model, status: result.status, message: result.message });
      if ([401, 403].includes(result.status)) break;
    }
  }

  if (reserveGeminiKeys.length > 0) {
    const deadline = Date.now() + GEMINI_RESERVE_PHASE_MS;
    reserveKeyLoop:
    for (const apiKey of reserveGeminiKeys) {
      for (const model of geminiModels) {
        const remaining = deadline - Date.now();
        if (remaining < 800) break reserveKeyLoop;
        const result = await callGemini({
          apiKey,
          model,
          prompt,
          timeoutMs: Math.min(8000, remaining)
        });
        if (result.ok) return { ok: true, text: result.text, provider: 'gemini-reserve', model };
        errors.push({ provider: 'gemini-reserve', model, status: result.status, message: result.message });
        if ([401, 403].includes(result.status)) continue reserveKeyLoop;
      }
    }
  }

  return {
    ok: false,
    errors,
    configured: { geminiConfigured: allGeminiKeys.length > 0, hfConfigured: Boolean(env.HF_TOKEN) }
  };
}

async function allowPodcastRequest(env, request) {
  const key = await rateLimitKey(request, 'podcast');
  if (env.PODCAST_RATE_LIMITER?.limit) {
    const { success } = await env.PODCAST_RATE_LIMITER.limit({ key });
    return success;
  }
  console.error('Podcast rate limiter binding is unavailable');
  return false;
}

async function allowFeedbackRequest(env, request) {
  const key = await rateLimitKey(request, 'feedback');
  if (env.FEEDBACK_RATE_LIMITER?.limit) {
    const { success } = await env.FEEDBACK_RATE_LIMITER.limit({ key });
    return success;
  }
  console.error('Feedback rate limiter binding is unavailable');
  return false;
}

async function allowPushRequest(env, request) {
  const key = await rateLimitKey(request, 'push');
  if (env.PUSH_RATE_LIMITER?.limit) {
    const { success } = await env.PUSH_RATE_LIMITER.limit({ key });
    return success;
  }
  console.error('Push rate limiter binding is unavailable');
  return false;
}

function pushConfigured(env) {
  const subject = String(env.VAPID_SUBJECT || '').trim();
  return Boolean(
    env.PUSH_GATEWAY
    && String(env.VAPID_PUBLIC_KEY || '').trim()
    && String(env.VAPID_PRIVATE_KEY || '').trim()
    && (/^mailto:[^\s@]+@[^\s@]+$/.test(subject) || /^https:\/\//.test(subject))
  );
}

function pushGateway(env) {
  if (!env.PUSH_GATEWAY?.idFromName) return null;
  return env.PUSH_GATEWAY.get(env.PUSH_GATEWAY.idFromName('wrn-global'));
}

async function handlePushSubscribe(env, body, origin) {
  if (!pushConfigured(env)) {
    return jsonResponse({ error: true, code: 'PUSH_NOT_CONFIGURED', message: 'News-Push ist noch nicht eingerichtet.' }, 503, origin);
  }
  const gateway = pushGateway(env);
  const result = await gateway.subscribe({
    subscription: body?.subscription,
    preferences: {
      ...body?.preferences,
      regions: body?.preferences?.regions,
      topics: body?.preferences?.topics
    },
    language: normalizePlainText(body?.language, 10),
    timeZone: normalizePlainText(body?.timeZone, 80),
    appVersion: normalizePlainText(body?.appVersion, 30)
  });
  if (!result?.ok) return jsonResponse({ error: true, message: 'Die Push-Anmeldung ist ungültig.' }, 400, origin);
  return jsonResponse({ ok: true }, 200, origin);
}

async function handlePushUnsubscribe(env, body, origin) {
  const gateway = pushGateway(env);
  if (!gateway) return jsonResponse({ error: true, message: 'News-Push ist nicht eingerichtet.' }, 503, origin);
  const result = await gateway.unsubscribe({ endpoint: body?.endpoint });
  return jsonResponse(result?.ok ? { ok: true } : { error: true, message: 'Ungültige Push-Abmeldung.' }, result?.ok ? 200 : 400, origin);
}

async function handleAdminPushStatus(env, origin) {
  const gateway = pushGateway(env);
  if (!gateway) return jsonResponse({ error: true, message: 'News-Push ist nicht eingerichtet.' }, 503, origin);
  const status = await gateway.status();
  return jsonResponse({ ok: true, configured: pushConfigured(env), subscriptions: Number(status?.subscriptions || 0) }, 200, origin);
}

async function handleAdminPushSend(env, body, origin) {
  if (!pushConfigured(env)) {
    return jsonResponse({ error: true, code: 'PUSH_NOT_CONFIGURED', message: 'News-Push ist nicht eingerichtet.' }, 503, origin);
  }
  const payload = {
    title: normalizePlainText(body?.title, 160),
    body: normalizePlainText(body?.message, 500),
    url: normalizeHttpUrl(body?.url),
    tag: normalizePlainText(body?.tag, 100),
    kind: ['news', 'breaking', 'correction'].includes(String(body?.kind)) ? String(body.kind) : 'news',
    regions: (Array.isArray(body?.regions) ? body.regions : []).map(value => normalizePlainText(value, 80)).filter(Boolean).slice(0, 30),
    topics: (Array.isArray(body?.topics) ? body.topics : []).map(value => normalizePlainText(value, 80)).filter(Boolean).slice(0, 30)
  };
  if (!payload.title || !payload.body || !payload.url) {
    return jsonResponse({ error: true, message: 'Titel, Nachricht oder sichere Zieladresse fehlt.' }, 400, origin);
  }
  const result = await pushGateway(env).publish({
    payload,
    vapid: {
      subject: String(env.VAPID_SUBJECT),
      publicKey: String(env.VAPID_PUBLIC_KEY),
      privateKey: String(env.VAPID_PRIVATE_KEY)
    }
  });
  return jsonResponse(result?.ok ? { ok: true, delivery: result } : { error: true, message: 'Push-Versand fehlgeschlagen.' }, result?.ok ? 200 : 503, origin);
}

function validateFeedbackRequest(body) {
  const type = String(body?.type || 'feedback').trim().toLowerCase();
  const language = String(body?.language || 'en').trim().toLowerCase().slice(0, 5);
  const message = normalizePlainText(body?.message, FEEDBACK_MAX_MESSAGE_LENGTH);
  const email = normalizePlainText(body?.email, 254);
  const website = normalizePlainText(body?.website, 200);
  if (website) return { ok: false, status: 400, message: 'Ungültige Anfrage.' };
  if (!FEEDBACK_TYPES.has(type)) return { ok: false, status: 400, message: 'Unbekannte Feedback-Kategorie.' };
  if (message.length < 3) return { ok: false, status: 400, message: 'Die Nachricht ist zu kurz.' };
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return { ok: false, status: 400, message: 'Die Antwortadresse ist ungültig.' };
  }
  return { ok: true, value: { type, language, message, email } };
}

async function handleFeedbackSubmit(env, body, origin, ctx) {
  const parsed = validateFeedbackRequest(body);
  if (!parsed.ok) return jsonResponse({ error: true, message: parsed.message }, parsed.status, origin);
  const quota = await reserveQuota(env, 'feedback_submissions', 1);
  if (!quota.allowed) {
    return jsonResponse({
      error: true,
      code: 'FEEDBACK_DAILY_LIMIT_REACHED',
      message: 'Das tägliche Feedback-Kontingent ist vorübergehend ausgeschöpft.',
      resetAt: quota.resetAt
    }, 429, origin);
  }
  const from = String(env.FEEDBACK_FROM_ADDRESS || '').trim();
  const to = String(env.FEEDBACK_TO_ADDRESS || '').trim();
  const reference = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + FEEDBACK_RETENTION_DAYS * 86400000).toISOString();
  const labels = {
    feedback: 'Allgemeines Feedback',
    source: 'Neue Quelle',
    correction: 'Korrektur',
    technical: 'Technisches Problem'
  };
  const text = [
    `Kategorie: ${labels[parsed.value.type]}`,
    `App-Sprache: ${parsed.value.language || 'unbekannt'}`,
    parsed.value.email ? `Antwortadresse: ${parsed.value.email}` : 'Antwortadresse: nicht angegeben',
    `Referenz: ${reference}`,
    '',
    parsed.value.message
  ].join('\n');
  let inboxStored = false;
  if (env.PODCAST_BUCKET?.put) {
    try {
      const month = createdAt.slice(0, 7).replace('-', '/');
      const key = `${FEEDBACK_PREFIX}${month}/${createdAt.replace(/[:.]/g, '-')}-${reference}.json`;
      await env.PODCAST_BUCKET.put(key, JSON.stringify({
        reference,
        createdAt,
        expiresAt,
        category: parsed.value.type,
        language: parsed.value.language,
        replyTo: parsed.value.email || '',
        message: parsed.value.message
      }), {
        httpMetadata: { contentType: 'application/json; charset=utf-8' },
        customMetadata: {
          reference,
          createdAt,
          expiresAt,
          category: parsed.value.type,
          language: parsed.value.language || 'und'
        }
      });
      inboxStored = true;
    } catch (error) {
      console.error('Feedback inbox storage failed', { reference, name: error?.name || 'Error' });
    }
  }

  if (env.FEEDBACK_EMAIL?.send && from && to) {
    const emailText = inboxStored
      ? [
          `Neues Feedback: ${labels[parsed.value.type]}`,
          `Referenz: ${reference}`,
          `Eingang: ${createdAt}`,
          '',
          'Der Inhalt liegt ausschließlich im privaten R2-Postfach.'
        ].join('\n')
      : text;
    const sending = env.FEEDBACK_EMAIL.send({
      to,
      from,
      subject: `World Revolution News – ${labels[parsed.value.type]}`,
      text: emailText,
      ...(!inboxStored && parsed.value.email ? { replyTo: parsed.value.email } : {})
    });
    const guardedSending = sending.catch(error => {
      console.error('Feedback email delivery failed', { reference, name: error?.name || 'Error' });
      throw error;
    });
    if (inboxStored) {
      ctx?.waitUntil(guardedSending.catch(() => undefined));
    } else {
      try {
        await guardedSending;
        return jsonResponse({ ok: true, reference, delivery: 'email' }, 200, origin);
      } catch {
        // The fail-closed response below reports that nothing was delivered.
      }
    }
  }

  if (inboxStored) {
    return jsonResponse({
      ok: true,
      reference,
      delivery: env.FEEDBACK_EMAIL?.send && from && to
        ? 'private-r2-inbox-with-notification'
        : 'private-r2-inbox'
    }, 200, origin);
  }

  return jsonResponse({ error: true, code: 'FEEDBACK_DELIVERY_FAILED', message: 'Die Nachricht konnte nicht gesendet werden.' }, 502, origin);
}

async function sha256Bytes(value) {
  return new Uint8Array(await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(String(value || ''))
  ));
}

async function constantTimeSecretEqual(left, right) {
  if (!left || !right) return false;
  const [leftHash, rightHash] = await Promise.all([
    sha256Bytes(left),
    sha256Bytes(right)
  ]);
  let difference = leftHash.length ^ rightHash.length;
  const length = Math.max(leftHash.length, rightHash.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (leftHash[index] || 0) ^ (rightHash[index] || 0);
  }
  return difference === 0;
}

async function isAdminRequest(request, env) {
  const expected = String(env.ADMIN_TOKEN || '').trim();
  const authorization = String(request.headers.get('Authorization') || '');
  const supplied = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';
  return constantTimeSecretEqual(supplied, expected);
}

function adminUnauthorized(origin) {
  return jsonResponse({
    error: true,
    code: 'ADMIN_AUTH_REQUIRED',
    message: 'Der geschützte Verwaltungszugang ist nicht freigegeben.'
  }, 401, origin);
}

function isSafeFeedbackKey(key) {
  return key.startsWith(FEEDBACK_PREFIX)
    && key.endsWith('.json')
    && /^[a-zA-Z0-9_./:-]{20,260}$/.test(key)
    && !key.includes('..');
}

async function handleAdminFeedbackList(request, env, origin) {
  if (!env.PODCAST_BUCKET?.list) {
    return jsonResponse({ error: true, message: 'Das private Feedback-Postfach ist nicht eingerichtet.' }, 503, origin);
  }
  const requested = Number(new URL(request.url).searchParams.get('limit') || 100);
  const limit = Math.max(1, Math.min(250, Number.isFinite(requested) ? requested : 100));
  const listed = await env.PODCAST_BUCKET.list({
    prefix: FEEDBACK_PREFIX,
    limit,
    include: ['customMetadata']
  });
  const items = listed.objects.map(object => ({
    key: object.key,
    reference: String(object.customMetadata?.reference || ''),
    createdAt: String(object.customMetadata?.createdAt || object.uploaded?.toISOString?.() || ''),
    category: String(object.customMetadata?.category || 'feedback'),
    language: String(object.customMetadata?.language || 'und'),
    size: Number(object.size || 0)
  })).sort((left, right) => Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0));
  return jsonResponse({
    ok: true,
    private: true,
    count: items.length,
    truncated: Boolean(listed.truncated),
    items
  }, 200, origin);
}

async function handleAdminFeedbackRead(request, env, origin) {
  if (!env.PODCAST_BUCKET?.get) {
    return jsonResponse({ error: true, message: 'Das private Feedback-Postfach ist nicht eingerichtet.' }, 503, origin);
  }
  const key = String(new URL(request.url).searchParams.get('key') || '');
  if (!isSafeFeedbackKey(key)) return jsonResponse({ error: true, message: 'Ungültiger Feedback-Schlüssel.' }, 400, origin);
  const object = await env.PODCAST_BUCKET.get(key);
  if (!object) return jsonResponse({ error: true, message: 'Feedback wurde nicht gefunden.' }, 404, origin);
  try {
    const value = await object.json();
    return jsonResponse({
      ok: true,
      item: {
        reference: normalizePlainText(value?.reference, 80),
        createdAt: normalizePlainText(value?.createdAt, 80),
        expiresAt: normalizePlainText(value?.expiresAt, 80),
        category: normalizePlainText(value?.category, 40),
        language: normalizePlainText(value?.language, 10),
        replyTo: normalizePlainText(value?.replyTo, 254),
        message: normalizePlainText(value?.message, FEEDBACK_MAX_MESSAGE_LENGTH)
      }
    }, 200, origin);
  } catch {
    return jsonResponse({ error: true, message: 'Der Feedback-Eintrag ist beschädigt.' }, 500, origin);
  }
}

function feedbackExpiryTime(object) {
  const metadata = object?.customMetadata || {};
  const explicit = Date.parse(metadata.expiresAt || '');
  if (Number.isFinite(explicit)) return explicit;
  const created = Date.parse(metadata.createdAt || object?.uploaded?.toISOString?.() || '');
  return Number.isFinite(created)
    ? created + FEEDBACK_RETENTION_DAYS * 86400000
    : Number.POSITIVE_INFINITY;
}

async function pruneFeedbackInbox(env) {
  if (!env.PODCAST_BUCKET?.list || !env.PODCAST_BUCKET?.delete) return;
  const expired = [];
  let scanned = 0;
  let cursor;
  do {
    const listed = await env.PODCAST_BUCKET.list({
      prefix: FEEDBACK_PREFIX,
      limit: Math.min(500, FEEDBACK_PRUNE_LIMIT - scanned),
      cursor,
      include: ['customMetadata']
    });
    scanned += listed.objects.length;
    const now = Date.now();
    for (const object of listed.objects) {
      if (feedbackExpiryTime(object) <= now) expired.push(object.key);
      if (expired.length >= FEEDBACK_PRUNE_LIMIT) break;
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor && scanned < FEEDBACK_PRUNE_LIMIT);

  for (let index = 0; index < expired.length; index += 1000) {
    await env.PODCAST_BUCKET.delete(expired.slice(index, index + 1000));
  }
}

async function readR2Json(env, key) {
  if (!env.PODCAST_BUCKET?.get) return {};
  try {
    const object = await env.PODCAST_BUCKET.get(key);
    return object ? await object.json() : {};
  } catch {
    return {};
  }
}

async function writeR2Json(env, key, value) {
  if (!env.PODCAST_BUCKET?.put) return false;
  await env.PODCAST_BUCKET.put(key, JSON.stringify(value), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' }
  });
  return true;
}

async function currentQuotaStatuses(env) {
  return Promise.all([
    quotaStatus(env, 'translation_upstream'),
    quotaStatus(env, 'feedback_submissions'),
    quotaStatus(env, 'azure_characters'),
    quotaStatus(env, 'podcast_storage')
  ]);
}

async function sendQuotaAlert(env, alerts, checkedAt) {
  const from = String(env.FEEDBACK_FROM_ADDRESS || '').trim();
  const to = String(env.FEEDBACK_TO_ADDRESS || '').trim();
  if (!env.FEEDBACK_EMAIL?.send || !from || !to || !alerts.length) return false;
  await env.FEEDBACK_EMAIL.send({
    to,
    from,
    subject: `World Revolution News – Verbrauchswarnung ${Math.max(...alerts.map(item => item.threshold))}%`,
    text: [
      `Prüfzeit: ${checkedAt}`,
      '',
      ...alerts.map(item => (
        `${item.label}: ${item.percent}% (${item.used}/${item.limit}), Schwelle ${item.threshold}%, Reset ${item.resetAt || 'unbekannt'}`
      )),
      '',
      'Diese Meldung enthält keine Artikeltexte, persönlichen Einstellungen oder Feedbackinhalte.'
    ].join('\n')
  });
  return true;
}

async function runOperationalMonitor(env) {
  const checkedAt = new Date().toISOString();
  const statuses = await currentQuotaStatuses(env);
  const previous = await readR2Json(env, QUOTA_ALERT_STATE_KEY);
  const plan = quotaAlertPlan(statuses, previous?.metrics || previous);
  const publicStatus = publicOperationalStatus(statuses, checkedAt);
  await Promise.all([
    writeR2Json(env, QUOTA_ALERT_STATE_KEY, {
      schemaVersion: 1,
      checkedAt,
      metrics: plan.state
    }),
    writeR2Json(env, OPERATIONS_STATUS_KEY, publicStatus)
  ]);
  if (plan.alerts.length) await sendQuotaAlert(env, plan.alerts, checkedAt);
  console.log(JSON.stringify({ event: 'operations-check', checkedAt, alerts: plan.alerts.length, healthy: publicStatus.healthy }));
  return publicStatus;
}

async function handleAdminOperationsStatus(env, origin) {
  const stored = await readR2Json(env, OPERATIONS_STATUS_KEY);
  const status = stored?.schemaVersion ? stored : await runOperationalMonitor(env);
  return jsonResponse({ ok: true, status }, 200, origin);
}

function validatePodcastRequest(body) {
  const targetLanguage = String(body?.targetLanguage || '').trim().toLowerCase();
  if (!LANGUAGE_NAMES[targetLanguage]) return { ok: false, status: 400, message: 'Nicht unterstützte Podcast-Sprache.' };
  const mode = String(body?.mode || 'short').trim().toLowerCase();
  if (!['short', 'full'].includes(mode)) return { ok: false, status: 400, message: 'Unbekannter Podcast-Modus.' };
  const voices = AZURE_VOICES[targetLanguage] || [];
  const requestedVoice = String(body?.voice || '').trim();
  const voice = voices.find(item => item.name === requestedVoice) || voices[0];
  if (!voice) return { ok: false, status: 400, message: 'Für diese Sprache ist keine Azure-Stimme eingerichtet.' };
  const title = normalizePlainText(body?.title, 300);
  const maxInput = mode === 'short' ? PODCAST_SHORT_INPUT_LENGTH : PODCAST_FULL_INPUT_LENGTH;
  const text = normalizePlainText(body?.text, maxInput);
  if (!title || !text) return { ok: false, status: 400, message: 'Titel oder Artikeltext fehlt.' };
  const articleUrl = normalizeHttpUrl(body?.articleUrl);
  const source = normalizePlainText(body?.source, 120);
  return { ok: true, value: { targetLanguage, mode, voice, title, text, articleUrl, source } };
}

async function handlePodcastGenerate(request, env, body, origin) {
  if (!serviceEnabled(env, 'WRN_PODCAST_GENERATION_ENABLED')) {
    return jsonResponse({
      error: true,
      code: 'PODCAST_GENERATION_PAUSED',
      message: 'Die Erzeugung neuer Podcasts ist vorübergehend pausiert. Gespeicherte Podcasts und die Gerätestimme bleiben verfügbar.',
      deviceVoiceOnly: true
    }, 503, origin);
  }
  if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) {
    return jsonResponse({ error: true, message: 'Azure Speech ist in Cloudflare noch nicht vollständig eingerichtet.', deviceVoiceOnly: true }, 503, origin);
  }
  if (!env.PODCAST_BUCKET) {
    return jsonResponse({ error: true, message: 'Der R2-Speicher PODCAST_BUCKET ist noch nicht mit dem Worker verbunden.', deviceVoiceOnly: true }, 503, origin);
  }

  const validation = validatePodcastRequest(body);
  if (!validation.ok) return jsonResponse({ error: true, message: validation.message }, validation.status, origin);
  const value = validation.value;

  // Der Cache-Schlüssel basiert auf dem übersetzten Eingabetext und nicht auf der
  // variablen KI-Zusammenfassung. Dadurch wird dieselbe Audiofassung zuverlässig
  // wiederverwendet und verbraucht weder Azure-Zeichen noch neuen Speicher.
  const contentHash = await sha256Hex([
    value.articleUrl || value.title,
    value.targetLanguage,
    value.mode,
    value.voice.name,
    value.title,
    value.text
  ].join('|'));
  const key = `${PODCAST_PREFIX}${value.targetLanguage}/${value.mode}/${contentHash}.mp3`;
  const existing = await env.PODCAST_BUCKET.head(key);
  if (existing && !isPodcastExpired(existing.customMetadata)) {
    return jsonResponse({ ok: true, cached: true, podcast: podcastObjectToItem(existing, request, key) }, 200, origin);
  }

  const availability = await getPodcastAvailability(env);
  if (!availability.naturalVoicesAvailable) {
    return jsonResponse({
      error: true,
      code: 'PODCAST_MONTHLY_LIMIT',
      message: 'Das monatliche Kontingent für natürliche Stimmen ist aufgebraucht. Bis zum nächsten Monatswechsel steht nur die kostenlose Gerätestimme zur Verfügung.',
      deviceVoiceOnly: true,
      resetAt: availability.resetAt,
      reason: availability.reason
    }, 429, origin);
  }

  let spokenText = value.text;
  if (value.mode === 'short') {
    const prompt = buildPodcastSummaryPrompt(value);
    const summary = await generateTextWithProviders(env, prompt);
    spokenText = summary.ok ? cleanModelOutput(summary.text) : value.text;
    spokenText = spokenText.slice(0, PODCAST_SHORT_AUDIO_LENGTH);
  } else {
    spokenText = spokenText.slice(0, PODCAST_FULL_AUDIO_LENGTH);
  }

  const speechText = `${value.title}.\n\n${spokenText}`.trim();
  const limits = getPodcastLimits(env);
  const state = availability.state;
  const azureReservation = await reserveQuota(
    env,
    'azure_characters',
    speechText.length,
    { baseline: state.characters }
  );
  if (!azureReservation.allowed) {
    return jsonResponse({
      error: true,
      code: 'PODCAST_MONTHLY_LIMIT',
      message: 'Das monatliche Azure-Sprachkontingent der App ist aufgebraucht. Bis zum nächsten Monatswechsel steht nur die kostenlose Gerätestimme zur Verfügung.',
      deviceVoiceOnly: true,
      resetAt: azureReservation.resetAt,
      reason: azureReservation.reason
    }, 429, origin);
  }

  // Vor dem Azure-Aufruf werden die maximal möglichen 25 MiB atomar reserviert.
  // Nach dem Speichern wird die Differenz zur tatsächlichen Größe freigegeben.
  const storageReservation = await reserveQuota(
    env,
    'podcast_storage',
    PODCAST_MAX_AUDIO_BYTES,
    { baseline: state.storageBytes }
  );
  if (!storageReservation.allowed) {
    await releaseQuota(env, 'azure_characters', speechText.length);
    return jsonResponse({
      error: true,
      code: 'PODCAST_MONTHLY_LIMIT',
      message: 'Der gemeinsame Podcast-Speicher hat seine Sicherheitsgrenze erreicht. Bis zum nächsten Monatswechsel steht nur die kostenlose Gerätestimme zur Verfügung.',
      deviceVoiceOnly: true,
      resetAt: storageReservation.resetAt,
      reason: storageReservation.reason
    }, 429, origin);
  }

  const audioResult = await callAzureSpeech(env, value.voice, value.title, spokenText);
  if (!audioResult.ok) {
    await Promise.all([
      releaseQuota(env, 'azure_characters', speechText.length),
      releaseQuota(env, 'podcast_storage', PODCAST_MAX_AUDIO_BYTES)
    ]);
    return jsonResponse({ error: true, message: audioResult.message, deviceVoiceOnly: true }, audioResult.status || 502, origin);
  }
  if (audioResult.audio.byteLength > PODCAST_MAX_AUDIO_BYTES) {
    await Promise.all([
      releaseQuota(env, 'azure_characters', speechText.length),
      releaseQuota(env, 'podcast_storage', PODCAST_MAX_AUDIO_BYTES)
    ]);
    return jsonResponse({ error: true, message: 'Die erzeugte Audiodatei ist größer als 25 MB. Nutze bitte den Kurz-Podcast oder die Gerätestimme.', deviceVoiceOnly: true }, 413, origin);
  }

  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + PODCAST_RETENTION_DAYS * 86400000).toISOString();
  const metadata = {
    title: value.title.slice(0, 180),
    source: value.source.slice(0, 100),
    articleUrl: value.articleUrl.slice(0, 500),
    language: value.targetLanguage,
    mode: value.mode,
    voice: value.voice.name,
    voiceLabel: value.voice.label,
    createdAt,
    expiresAt,
    characters: String(speechText.length)
  };

  let stored;
  try {
    stored = await env.PODCAST_BUCKET.put(key, audioResult.audio, {
      httpMetadata: { contentType: 'audio/mpeg', cacheControl: 'public, max-age=3600' },
      customMetadata: metadata
    });
  } catch (error) {
    await Promise.all([
      releaseQuota(env, 'azure_characters', speechText.length),
      releaseQuota(env, 'podcast_storage', PODCAST_MAX_AUDIO_BYTES)
    ]);
    console.error('Podcast konnte nicht gespeichert werden:', error?.message || error);
    return jsonResponse({
      error: true,
      message: 'Der Podcast konnte nicht sicher gespeichert werden. Das reservierte Kontingent wurde wieder freigegeben.',
      deviceVoiceOnly: true
    }, 503, origin);
  }

  const unusedStorage = PODCAST_MAX_AUDIO_BYTES - audioResult.audio.byteLength;
  if (unusedStorage > 0) {
    await releaseQuota(env, 'podcast_storage', unusedStorage);
  }

  await writePodcastMonthlyUsage(env, {
    ...state,
    characters: state.characters + speechText.length,
    storageBytes: state.storageBytes + audioResult.audio.byteLength,
    generatedCount: state.generatedCount + 1,
    updatedAt: new Date().toISOString()
  });
  await prunePodcastLibrary(env);

  return jsonResponse({ ok: true, cached: false, podcast: podcastObjectToItem(stored, request, key) }, 200, origin);
}

function buildPodcastSummaryPrompt({ targetLanguage, title, text, source }) {
  const languageName = LANGUAGE_NAMES[targetLanguage];
  const genderRule = targetLanguage === 'de'
    ? 'Use consistent gender-inclusive German with the gender star and avoid the generic masculine.'
    : '';
  return [
    `Create a factual single-narrator podcast summary in ${languageName}.`,
    'Target length: roughly 3 to 5 minutes of spoken audio.',
    'Use flowing natural paragraphs, no bullet points, no markdown and no meta commentary.',
    'Do not invent facts and do not add opinions that are absent from the article.',
    'Start directly with the topic. End with a short source attribution.',
    genderRule,
    '',
    `Title: ${title}`,
    source ? `Source: ${source}` : '',
    '',
    `Article:\n${text}`
  ].filter(Boolean).join('\n');
}

async function callAzureSpeech(env, voice, title, text) {
  const region = String(env.AZURE_SPEECH_REGION || '').trim().toLowerCase().replace(/\s+/g, '');
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = buildAzureSsml(voice, title, text);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
        'Content-Type': 'application/ssml+xml; charset=utf-8',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'WorldRevolutionNews'
      },
      body: ssml,
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = (await response.text()).trim().slice(0, 500);
      return { ok: false, status: response.status, message: detail || `Azure Speech Fehler ${response.status}` };
    }
    return { ok: true, status: 200, audio: await response.arrayBuffer() };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error?.name === 'AbortError' ? 'Azure Speech hat zu lange gebraucht.' : `Azure Speech Netzwerkfehler: ${error?.message || error}`
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildAzureSsml(voice, title, text) {
  const cleanTitle = escapeXml(title);
  const cleanText = escapeXml(text).replace(/\n{2,}/g, '<break time="650ms"/>').replace(/\n/g, '<break time="300ms"/>');
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.locale}"><voice name="${voice.name}"><prosody rate="0%">${cleanTitle}<break time="900ms"/>${cleanText}</prosody></voice></speak>`;
}

async function handlePodcastList(request, env, ctx, origin) {
  if (!env.PODCAST_BUCKET) return jsonResponse({ error: true, message: 'Podcast-Speicher ist noch nicht eingerichtet.' }, 503, origin);
  const requestedLimit = Number(new URL(request.url).searchParams.get('limit') || PODCAST_LIST_LIMIT);
  const limit = Math.min(PODCAST_LIST_LIMIT, Math.max(1, requestedLimit));
  const objects = await listAllPodcastObjects(env, 2000);
  const expiredKeys = [];
  const items = [];
  for (const object of objects) {
    if (isPodcastExpired(object.customMetadata)) {
      expiredKeys.push(object.key);
      continue;
    }
    items.push(podcastObjectToItem(object, request, object.key));
  }
  items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (expiredKeys.length) ctx?.waitUntil(env.PODCAST_BUCKET.delete(expiredKeys));
  return jsonResponse({ ok: true, retentionDays: PODCAST_RETENTION_DAYS, items: items.slice(0, limit) }, 200, origin);
}

async function handlePodcastAudio(request, env, origin) {
  if (!env.PODCAST_BUCKET) return jsonResponse({ error: true, message: 'Podcast-Speicher ist noch nicht eingerichtet.' }, 503, origin);
  const url = new URL(request.url);
  const key = String(url.searchParams.get('key') || '');
  if (!isSafePodcastKey(key)) return jsonResponse({ error: true, message: 'Ungültiger Podcast-Schlüssel.' }, 400, origin);
  const head = await env.PODCAST_BUCKET.head(key);
  if (!head) return jsonResponse({ error: true, message: 'Podcast nicht gefunden.' }, 404, origin);
  if (isPodcastExpired(head.customMetadata)) return jsonResponse({ error: true, message: 'Dieser Podcast ist abgelaufen.' }, 410, origin);

  const range = parseByteRange(request.headers.get('Range'), head.size);
  if (range?.invalid) return new Response(null, { status: 416, headers: { ...(origin ? corsHeaders(origin) : securityHeaders()), 'Content-Range': `bytes */${head.size}` } });
  const object = await env.PODCAST_BUCKET.get(key, range ? { range: { offset: range.offset, length: range.length } } : undefined);
  if (!object) return jsonResponse({ error: true, message: 'Podcast nicht gefunden.' }, 404, origin);

  const headers = new Headers(origin ? corsHeaders(origin) : securityHeaders());
  headers.set('Content-Type', 'audio/mpeg');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=3600');
  const etag = object.httpEtag || head.httpEtag;
  if (etag) headers.set('ETag', etag);
  if (range) {
    headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`);
    headers.set('Content-Length', String(range.length));
  } else {
    headers.set('Content-Length', String(head.size));
  }
  if (request.method === 'HEAD') return new Response(null, { status: range ? 206 : 200, headers });
  return new Response(object.body, { status: range ? 206 : 200, headers });
}

function podcastObjectToItem(object, request, key) {
  const meta = object.customMetadata || {};
  const url = new URL(request.url);
  url.pathname = '/';
  url.search = '';
  url.searchParams.set('action', 'podcast.audio');
  url.searchParams.set('key', key);
  return {
    id: key,
    title: meta.title || 'Podcast',
    source: meta.source || '',
    articleUrl: meta.articleUrl || '',
    language: meta.language || '',
    mode: meta.mode || 'full',
    voice: meta.voice || '',
    voiceLabel: meta.voiceLabel || meta.voice || '',
    createdAt: meta.createdAt || object.uploaded?.toISOString?.() || '',
    expiresAt: meta.expiresAt || '',
    size: object.size || 0,
    audioUrl: url.toString()
  };
}

async function listAllPodcastObjects(env, maximum = 500) {
  const objects = [];
  let cursor;
  do {
    const listed = await env.PODCAST_BUCKET.list({
      prefix: PODCAST_PREFIX,
      limit: Math.min(500, maximum - objects.length),
      cursor,
      include: ['customMetadata', 'httpMetadata']
    });
    objects.push(...listed.objects);
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor && objects.length < maximum);
  return objects;
}

async function prunePodcastLibrary(env) {
  const objects = await listAllPodcastObjects(env, 2000);
  const expired = objects.filter(object => isPodcastExpired(object.customMetadata)).map(object => object.key);
  const active = objects.filter(object => !isPodcastExpired(object.customMetadata));
  active.sort((a, b) => new Date(a.customMetadata?.createdAt || a.uploaded || 0) - new Date(b.customMetadata?.createdAt || b.uploaded || 0));
  const excess = Math.max(0, active.length - PODCAST_MAX_ITEMS);
  const keys = [...expired, ...active.slice(0, excess).map(object => object.key)];
  if (keys.length) await env.PODCAST_BUCKET.delete(keys);
}

function isPodcastExpired(metadata = {}) {
  const expires = Date.parse(metadata?.expiresAt || '');
  return Number.isFinite(expires) && expires <= Date.now();
}

function isSafePodcastKey(key) {
  return key.startsWith(PODCAST_PREFIX) && key.endsWith('.mp3') && /^[a-zA-Z0-9_./-]{20,240}$/.test(key) && !key.includes('..');
}

function parseByteRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return { invalid: true };
  let start;
  let end;
  if (match[1] === '' && match[2] !== '') {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return { invalid: true };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) return { invalid: true };
  end = Math.min(end, size - 1);
  return { offset: start, length: end - start + 1 };
}

function getPodcastLimits(env) {
  return {
    characterLimit: Math.max(10000, Number(env.AZURE_MONTHLY_CHAR_LIMIT || PODCAST_MONTHLY_CHAR_LIMIT)),
    storageLimit: Math.max(
      PODCAST_MAX_AUDIO_BYTES,
      Number(env.PODCAST_STORAGE_LIMIT_BYTES || PODCAST_STORAGE_LIMIT_BYTES)
    )
  };
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function nextMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)).toISOString();
}

async function readPodcastMonthlyUsage(env) {
  const month = currentMonthKey();
  const key = `usage/podcast-${month}.json`;
  try {
    const object = await env.PODCAST_BUCKET.get(key);
    if (object) {
      const data = JSON.parse(await object.text());
      return {
        key,
        month,
        characters: Math.max(0, Number(data?.characters || 0)),
        storageBytes: Math.max(0, Number(data?.storageBytes || 0)),
        generatedCount: Math.max(0, Number(data?.generatedCount || 0)),
        paused: Boolean(data?.paused),
        pauseReason: String(data?.pauseReason || ''),
        resetAt: String(data?.resetAt || nextMonthIso()),
        updatedAt: String(data?.updatedAt || '')
      };
    }
  } catch (error) {
    console.warn('Podcast-Nutzungsstand konnte nicht gelesen werden:', error?.message || error);
    throw error;
  }

  // Beim ersten Zugriff eines neuen Kalendermonats wird der tatsächlich noch
  // vorhandene 30-Tage-Bestand gezählt. Danach wird konservativ hochgezählt.
  let storageBytes = 0;
  try {
    const objects = await listAllPodcastObjects(env, 2000);
    storageBytes = objects
      .filter(object => !isPodcastExpired(object.customMetadata))
      .reduce((sum, object) => sum + Math.max(0, Number(object.size || 0)), 0);
  } catch (error) {
    console.warn('Podcast-Speicherstand konnte nicht initialisiert werden:', error?.message || error);
    throw error;
  }

  const state = {
    key,
    month,
    characters: 0,
    storageBytes,
    generatedCount: 0,
    paused: false,
    pauseReason: '',
    resetAt: nextMonthIso(),
    updatedAt: new Date().toISOString()
  };
  await writePodcastMonthlyUsage(env, state);
  return state;
}

async function writePodcastMonthlyUsage(env, state) {
  const month = state?.month || currentMonthKey();
  const key = state?.key || `usage/podcast-${month}.json`;
  const payload = {
    month,
    characters: Math.max(0, Number(state?.characters || 0)),
    storageBytes: Math.max(0, Number(state?.storageBytes || 0)),
    generatedCount: Math.max(0, Number(state?.generatedCount || 0)),
    paused: Boolean(state?.paused),
    pauseReason: String(state?.pauseReason || ''),
    resetAt: String(state?.resetAt || nextMonthIso()),
    updatedAt: String(state?.updatedAt || new Date().toISOString())
  };
  await env.PODCAST_BUCKET.put(key, JSON.stringify(payload), {
    httpMetadata: { contentType: 'application/json' }
  });
  return { ...payload, key };
}

async function pausePodcastForMonth(env, state, reason) {
  return writePodcastMonthlyUsage(env, {
    ...state,
    paused: true,
    pauseReason: reason,
    resetAt: nextMonthIso(),
    updatedAt: new Date().toISOString()
  });
}

async function getPodcastAvailability(env) {
  const limits = getPodcastLimits(env);
  const resetAt = nextMonthIso();

  if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) {
    return { naturalVoicesAvailable: false, reason: 'azure_not_configured', resetAt, state: null, limits };
  }
  if (!env.PODCAST_BUCKET) {
    return { naturalVoicesAvailable: false, reason: 'storage_not_configured', resetAt, state: null, limits };
  }

  let state;
  try {
    state = await readPodcastMonthlyUsage(env);
  } catch (error) {
    console.error('Podcast-Nutzungsstand ist nicht verfügbar; Erzeugung bleibt sicher pausiert.', error?.message || error);
    return {
      naturalVoicesAvailable: false,
      reason: 'usage_state_unavailable',
      resetAt,
      state: null,
      limits
    };
  }
  const [azureQuota, storageQuota] = await Promise.all([
    quotaStatus(env, 'azure_characters'),
    quotaStatus(env, 'podcast_storage')
  ]);
  const manuallyEnabled = serviceEnabled(env, 'WRN_PODCAST_GENERATION_ENABLED');
  const reason = !manuallyEnabled
    ? 'manually_disabled'
    : !azureQuota.allowed
      ? azureQuota.reason || 'azure_characters'
      : !storageQuota.allowed
        ? storageQuota.reason || 'storage'
        : '';

  return {
    naturalVoicesAvailable: manuallyEnabled && azureQuota.allowed && storageQuota.allowed,
    reason,
    resetAt: azureQuota.resetAt || state.resetAt || resetAt,
    state,
    limits,
    quotas: { azure: azureQuota, storage: storageQuota }
  };
}

async function handlePodcastStatus(env, origin) {
  const availability = await getPodcastAvailability(env);
  const state = availability.state;
  return jsonResponse({
    ok: true,
    naturalVoicesAvailable: availability.naturalVoicesAvailable,
    deviceVoiceAvailable: true,
    reason: availability.reason,
    resetAt: availability.resetAt,
    month: state?.month || currentMonthKey(),
    retentionDays: PODCAST_RETENTION_DAYS,
    maxAudioBytes: PODCAST_MAX_AUDIO_BYTES,
    usage: {
      characters: state?.characters || 0,
      characterLimit: availability.limits.characterLimit,
      storageBytes: Math.max(state?.storageBytes || 0, availability.quotas?.storage?.used || 0),
      storageLimitBytes: availability.limits.storageLimit,
      generatedCount: state?.generatedCount || 0
    }
  }, 200, origin);
}

function normalizeHttpUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.href.slice(0, 500) : '';
  } catch { return ''; }
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function callGemini({ apiKey, model, prompt, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192 }
      }),
      signal: controller.signal
    });

    const rawText = await response.text();
    const data = safeJson(rawText);
    const answer = extractGeminiText(data);
    if (response.ok && answer) return { ok: true, status: response.status, text: answer };

    return {
      ok: false,
      status: response.status,
      message: extractErrorMessage(data, rawText) || 'Gemini hat keinen Text zurückgegeben.'
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error?.name === 'AbortError'
        ? 'Zeitüberschreitung bei Gemini.'
        : `Netzwerkfehler bei Gemini: ${error?.message || error}`
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callHuggingFace({ token, model, prompt, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a precise translation engine. Follow the requested output format exactly and output no commentary.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4096,
        stream: false
      }),
      signal: controller.signal
    });

    const rawText = await response.text();
    const data = safeJson(rawText);
    const answer = extractHuggingFaceText(data);
    if (response.ok && answer) return { ok: true, status: response.status, text: answer };

    return {
      ok: false,
      status: response.status,
      message: extractErrorMessage(data, rawText) || 'Hugging Face hat keinen Text zurückgegeben.'
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error?.name === 'AbortError'
        ? 'Zeitüberschreitung bei Hugging Face.'
        : `Netzwerkfehler bei Hugging Face: ${error?.message || error}`
    };
  } finally {
    clearTimeout(timeout);
  }
}

function successResponse(text, provider, model, protocol, origin) {
  const cleanText = cleanModelOutput(text);
  return jsonResponse({
    ok: true,
    text: cleanText,
    provider,
    model,
    protocol,
    candidates: [{ content: { parts: [{ text: cleanText }] } }]
  }, 200, origin);
}

function cleanModelOutput(value) {
  let text = String(value || '').trim()
    .replace(/^```(?:text|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const introductions = [
    /^(?:\*\*)?\s*Hier ist (?:die )?(?:ins Deutsche übersetzte(?: Fassung| Version)?|deutsche Übersetzung|Übersetzung)(?: des Textes)?\s*:?\s*(?:\*\*)?\s*/i,
    /^(?:\*\*)?\s*Hier folgt (?:die )?(?:deutsche Übersetzung|Übersetzung)\s*:?\s*(?:\*\*)?\s*/i,
    /^(?:\*\*)?\s*Deutsche Übersetzung\s*:?\s*(?:\*\*)?\s*/i,
    /^(?:\*\*)?\s*Here is (?:the )?(?:German translation|translation|translated version)(?: of the text)?\s*:?\s*(?:\*\*)?\s*/i,
    /^(?:\*\*)?\s*Translation\s*:?\s*(?:\*\*)?\s*/i
  ];
  for (const pattern of introductions) text = text.replace(pattern, '').trim();
  return text;
}

function safeJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map(part => typeof part?.text === 'string' ? part.text : '').join('').trim();
}

function extractHuggingFaceText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content.map(part => typeof part === 'string' ? part : (part?.text || '')).join('').trim();
}

function extractErrorMessage(data, rawText) {
  const candidates = [data?.error?.message, typeof data?.error === 'string' ? data.error : '', data?.message, data?.detail];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 600);
  }
  return typeof rawText === 'string' ? rawText.trim().slice(0, 600) : '';
}

function makeSimpleErrorMessage(errors, configured) {
  if (!configured.geminiConfigured && !configured.hfConfigured) {
    return 'In Cloudflare fehlt ein Gemini-Schlüssel und außerdem HF_TOKEN.';
  }
  if (errors.some(error => error.status === 429)) {
    return 'Das kostenlose Kontingent oder Anfragelimit ist momentan erreicht.';
  }
  if (errors.some(error => [401, 403].includes(error.status))) {
    return 'Mindestens ein API-Schlüssel oder Token ist ungültig oder nicht berechtigt.';
  }
  if (configured.hfConfigured) {
    return 'Sowohl Gemini als auch Hugging Face konnten die Übersetzung nicht erstellen.';
  }
  return 'Alle Gemini-Übersetzungsversuche sind fehlgeschlagen.';
}

function corsHeaders(origin) {
  return {
    ...securityHeaders(),
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Client-Id, X-App-Secret, Range',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function securityHeaders() {
  return {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
  };
}

function jsonResponse(data, status, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...(origin ? corsHeaders(origin) : securityHeaders()),
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
