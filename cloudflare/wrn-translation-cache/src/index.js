import { QuotaCoordinator } from '../../shared/quota-coordinator.js';
import {
  releaseQuota,
  reserveQuota,
  serviceEnabled
} from '../../shared/quota-client.js';

export { QuotaCoordinator };

/**
 * World Revolution News – Shared Translation Cache Worker 1.7.7
 */

const DEFAULT_UPSTREAM =
  'https://revolution-proxy.paghklo.workers.dev';

const DEFAULT_TTL_SECONDS = 604800;

const DEFAULT_ORIGINS = [
  'https://blackfront161.github.io',
  'https://solinaridao.com',
  'https://www.solinaridao.com',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'http://127.0.0.1:8765'
];

function allowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  return configured.length ? configured : DEFAULT_ORIGINS;
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin') || '';
  return Boolean(origin && allowedOrigins(env).includes(origin));
}

async function requestAllowed(request, env) {
  if (!env.CACHE_RATE_LIMITER?.limit) return true;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const client = String(request.headers.get('X-Client-Id') || 'unknown')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 100);
  const result = await env.CACHE_RATE_LIMITER.limit({ key: `${ip}:${client}` });
  return result.success;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const accepted = allowed.includes(origin)
    ? origin
    : allowed[0];

  return {
    'Access-Control-Allow-Origin': accepted,
    'Access-Control-Allow-Headers':
      'Content-Type, X-Client-Id, X-WRN-Cache-Key',
    'Access-Control-Allow-Methods':
      'GET, POST, OPTIONS',
    'Access-Control-Expose-Headers':
      'X-WRN-Shared-Cache, X-WRN-Storage',
    'Vary': 'Origin'
  };
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value || ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function cacheTtl(env) {
  return Math.max(
    3600,
    Number(env.CACHE_TTL_SECONDS || DEFAULT_TTL_SECONDS)
  );
}

function kvKey(stableKey) {
  return `translation:v1:${stableKey}`;
}

function edgeCacheRequest(stableKey) {
  return new Request(
    `https://wrn-translation-cache.invalid/v1/${stableKey}`,
    { method: 'GET' }
  );
}

async function readCache(env, stableKey) {
  if (env.TRANSLATIONS?.get) {
    const value = await env.TRANSLATIONS.get(
      kvKey(stableKey),
      {
        type: 'json',
        cacheTtl: 60
      }
    );

    if (value?.body) {
      return {
        body: String(value.body),
        contentType: String(
          value.contentType ||
          'application/json; charset=utf-8'
        ),
        storage: 'kv'
      };
    }

    return null;
  }

  const cached = await caches.default.match(
    edgeCacheRequest(stableKey)
  );

  if (!cached) return null;

  return {
    body: await cached.text(),
    contentType:
      cached.headers.get('Content-Type') ||
      'application/json; charset=utf-8',
    storage: 'edge-cache'
  };
}

async function writeCache(
  env,
  ctx,
  stableKey,
  body,
  contentType,
  metadata
) {
  const ttl = cacheTtl(env);
  let persistentWriteSkipped = false;

  if (env.TRANSLATIONS?.put) {
    const reservation = await reserveQuota(env, 'translation_kv_writes', 1);
    if (reservation.allowed) {
      try {
        await env.TRANSLATIONS.put(
          kvKey(stableKey),
          JSON.stringify({
            body,
            contentType,
            storedAt: new Date().toISOString(),
            targetLanguage: metadata.targetLanguage,
            mode: metadata.mode
          }),
          {
            expirationTtl: ttl
          }
        );
        return { storage: 'kv', persistentWriteSkipped: false };
      } catch (error) {
        await releaseQuota(env, 'translation_kv_writes', 1);
        throw error;
      }
    }
    persistentWriteSkipped = true;
  }

  const response = new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${ttl}`
    }
  });

  ctx.waitUntil(
    caches.default.put(
      edgeCacheRequest(stableKey),
      response
    )
  );

  return { storage: 'edge-cache', persistentWriteSkipped };
}

function responseFromCached(cached, request, env) {
  return new Response(cached.body, {
    status: 200,
    headers: {
      'Content-Type': cached.contentType,
      'X-WRN-Shared-Cache': 'HIT',
      'X-WRN-Storage': cached.storage,
      ...corsHeaders(request, env)
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      if (!originAllowed(request, env)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: cors
      });
    }

    if (
      request.method === 'GET' &&
      (url.pathname === '/' || url.pathname === '/health')
    ) {
      return jsonResponse(
        {
          ok: true,
          service: 'wrn-shared-translation-cache',
          version: '1.7.7',
          storage: env.TRANSLATIONS
            ? 'kv'
            : 'edge-cache-fallback',
          upstreamConfigured: Boolean(env.UPSTREAM_URL),
          ttlSeconds: cacheTtl(env)
        },
        200,
        cors
      );
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'POST required' },
        405,
        cors
      );
    }

    if (!originAllowed(request, env)) {
      return jsonResponse(
        { error: 'Origin not allowed' },
        403,
        cors
      );
    }

    if (!(await requestAllowed(request, env))) {
      return jsonResponse(
        { error: true, code: 'RATE_LIMITED', message: 'Too many requests. Please wait one minute.' },
        429,
        cors
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { error: 'Invalid JSON' },
        400,
        cors
      );
    }

    if (body?.action !== 'translate') {
      return jsonResponse(
        { error: 'Unsupported action' },
        400,
        cors
      );
    }

    const title = String(body.title || '').slice(0, 500);
    const text = String(body.text || '').slice(0, 6000);
    const targetLanguage = String(
      body.targetLanguage || ''
    ).slice(0, 20);
    const mode = String(
      body.mode || 'title_and_text'
    ).slice(0, 40);

    if (!text.trim()) {
      return jsonResponse(
        { error: 'Missing text' },
        400,
        cors
      );
    }

    const requestedStableKey =
      String(
        body.sharedCacheKey ||
        request.headers.get('X-WRN-Cache-Key') ||
        ''
      ).trim();
    const stableKey = /^[a-f0-9]{64}$/i.test(requestedStableKey)
      ? requestedStableKey.toLowerCase()
      : await sha256(
        JSON.stringify({
          version: 1,
          targetLanguage,
          mode,
          title,
          text
        })
      );

    try {
      const cached = await readCache(env, stableKey);

      if (cached) {
        return responseFromCached(
          cached,
          request,
          env
        );
      }
    } catch (error) {
      console.warn(
        'Shared translation cache read failed:',
        error
      );
    }

    if (!serviceEnabled(env, 'WRN_TRANSLATION_ENABLED')) {
      return jsonResponse(
        {
          error: true,
          code: 'TRANSLATION_PAUSED',
          message: 'Neue Übersetzungen sind vorübergehend pausiert. Bereits gespeicherte Übersetzungen bleiben verfügbar.'
        },
        503,
        cors
      );
    }

    const upstreamUrl = String(
      env.UPSTREAM_URL || DEFAULT_UPSTREAM
    );

    const upstreamRequest = new Request(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': request.headers.get('Origin') || '',
        'X-Client-Id':
          request.headers.get('X-Client-Id') ||
          'wrn-shared-cache'
      },
      body: JSON.stringify({
        action: 'translate',
        targetLanguage,
        mode,
        title,
        text
      })
    });
    const upstream = env.PROXY_SERVICE?.fetch
      ? await env.PROXY_SERVICE.fetch(upstreamRequest)
      : await fetch(upstreamRequest);

    const responseText = await upstream.text();

    const contentType =
      upstream.headers.get('Content-Type') ||
      'application/json; charset=utf-8';

    let storage = env.TRANSLATIONS
      ? 'kv'
      : 'edge-cache';

    if (upstream.ok && responseText.trim()) {
      try {
        const writeResult = await writeCache(
          env,
          ctx,
          stableKey,
          responseText,
          contentType,
          {
            targetLanguage,
            mode
          }
        );
        storage = writeResult.storage;
      } catch (error) {
        console.warn(
          'Shared translation cache write failed:',
          error
        );
      }
    }

    return new Response(responseText, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'X-WRN-Shared-Cache': 'MISS',
        'X-WRN-Storage': storage,
        ...cors
      }
    });
  }
};
