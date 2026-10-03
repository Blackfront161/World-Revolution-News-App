/* World Revolution News 1.8.4 – gemeinsamer Übersetzungs-Cache mit sicherem Rückfall */
'use strict';

(() => {
  if (window.WRNSharedTranslations) return;

  const originalRequest = window.fetchTranslationRequest;
  let lastFailure = null;
  const STATUS_COPY = {
    de: ['WRN-Kontingent', 'Verbraucht', 'Verfügbar', 'Nächste Freigabe', 'Unbekannt', 'Provider-Limits und Kontotarif sind nicht bestätigt.', 'Erneut versuchen ab', 'Original lesen oder lokal vorlesen lassen.', 'Anfragen', 'Cache-Schreibvorgänge', 'Sprachzeichen', 'Speicherbytes'],
    en: ['WRN quota', 'Used', 'Available', 'Next reset', 'Unknown', 'Provider limits and account tariff are unverified.', 'Try again after', 'Read the original or use the device voice.', 'Requests', 'Cache writes', 'Speech characters', 'Storage bytes'],
    es: ['Cuota WRN', 'Usado', 'Disponible', 'Próximo reinicio', 'Desconocido', 'Los límites del proveedor y la tarifa de la cuenta no están confirmados.', 'Reintentar después de', 'Lee el original o usa la voz del dispositivo.', 'Solicitudes', 'Escrituras de caché', 'Caracteres de voz', 'Bytes almacenados'],
    fr: ['Quota WRN', 'Utilisé', 'Disponible', 'Prochaine remise à zéro', 'Inconnu', 'Les limites du fournisseur et le tarif du compte ne sont pas confirmés.', 'Réessayer après', 'Lire l’original ou utiliser la voix de l’appareil.', 'Requêtes', 'Écritures du cache', 'Caractères vocaux', 'Octets stockés'],
    it: ['Quota WRN', 'Utilizzato', 'Disponibile', 'Prossimo ripristino', 'Sconosciuto', 'I limiti del fornitore e la tariffa dell’account non sono confermati.', 'Riprova dopo', 'Leggi l’originale o usa la voce del dispositivo.', 'Richieste', 'Scritture cache', 'Caratteri vocali', 'Byte archiviati'],
    pt: ['Quota WRN', 'Usado', 'Disponível', 'Próxima reposição', 'Desconhecido', 'Os limites do fornecedor e a tarifa da conta não estão confirmados.', 'Tentar novamente após', 'Lê o original ou usa a voz do dispositivo.', 'Pedidos', 'Escritas na cache', 'Caracteres de voz', 'Bytes armazenados'],
    ru: ['Квота WRN', 'Использовано', 'Доступно', 'Следующий сброс', 'Неизвестно', 'Лимиты провайдера и тариф аккаунта не подтверждены.', 'Повторить после', 'Читайте оригинал или используйте голос устройства.', 'Запросы', 'Записи кэша', 'Символы речи', 'Байты хранения'],
    el: ['Όριο WRN', 'Χρησιμοποιήθηκαν', 'Διαθέσιμα', 'Επόμενη επαναφορά', 'Άγνωστο', 'Τα όρια παρόχου και το τιμολόγιο λογαριασμού δεν έχουν επιβεβαιωθεί.', 'Δοκιμάστε ξανά μετά', 'Διαβάστε το πρωτότυπο ή χρησιμοποιήστε τη φωνή της συσκευής.', 'Αιτήματα', 'Εγγραφές cache', 'Χαρακτήρες ομιλίας', 'Bytes αποθήκευσης'],
    tr: ['WRN kotası', 'Kullanılan', 'Kullanılabilir', 'Sonraki sıfırlama', 'Bilinmiyor', 'Sağlayıcı sınırları ve hesap tarifesi doğrulanmadı.', 'Şu saatten sonra tekrar deneyin', 'Asıl metni okuyun veya cihaz sesini kullanın.', 'İstekler', 'Önbellek yazımları', 'Konuşma karakterleri', 'Depolama baytları']
  };

  function statusLines(quotas = [], language = targetLanguage()) {
    const copy = STATUS_COPY[normalizedTargetLanguage(language)];
    const metrics = ['translation_upstream', 'translation_kv_writes', 'azure_characters', 'podcast_storage'];
    return metrics.map((metric, index) => {
      const quota = quotas.find(value => value?.metric === metric);
      const known = quota && quota.available !== false && quota.reason !== 'quota_guard_unavailable'
        && ['used', 'limit', 'remaining'].every(key => typeof quota[key] === 'number' && Number.isFinite(quota[key]) && quota[key] >= 0)
        && quota.limit > 0 && quota.remaining === Math.max(0, quota.limit - quota.used);
      return { metric, label: `${copy[0]} · ${copy[8 + index]}`, known: Boolean(known),
        value: known ? `${copy[1]}: ${quota.used} / ${quota.limit} · ${copy[2]}: ${quota.remaining}` : copy[4],
        reset: known && validDate(quota.resetAt) ? `${copy[3]}: ${dateLabel(quota.resetAt, language)}` : '' };
    }).concat([{metric:'provider', label:'Provider', known:false, value:copy[5], reset:''}]);
  }

  function validDate(value) { return typeof value === 'string' && Boolean(value) && Number.isFinite(Date.parse(value)); }
  function dateLabel(value, language) {
    return new Intl.DateTimeFormat(normalizedTargetLanguage(language), {dateStyle:'short', timeStyle:'medium'}).format(new Date(value));
  }
  function failureMessage(language, fallback) {
    if (!lastFailure) return fallback;
    const copy = STATUS_COPY[normalizedTargetLanguage(language)];
    const wait = validDate(lastFailure.retryAt) && Date.parse(lastFailure.retryAt) > Date.now()
      ? `${copy[6]} ${dateLabel(lastFailure.retryAt, language)}. ` : '';
    return `${fallback} ${wait}${copy[7]}`;
  }

  function targetLanguage() {
    try {
      return typeof currentLang !== 'undefined' ? currentLang : (document.documentElement.lang || 'en');
    } catch {
      return document.documentElement.lang || 'en';
    }
  }

  function normalizedTargetLanguage(value) {
    const language = String(value || '').trim().toLowerCase().split(/[-_]/)[0];
    return ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr'].includes(language)
      ? language
      : 'en';
  }

  function extractText(data) {
    if (typeof window.extractTranslationText === 'function') {
      return window.extractTranslationText(data);
    }
    if (typeof data === 'string') return data.trim();
    return String(
      data?.text
      || data?.translation
      || data?.translatedText
      || data?.result?.text
      || ''
    ).trim();
  }

  async function fallbackToOriginal(args, failure) {
    lastFailure = { status: Number(failure?.status || 0), retryAt: failure?.retryAt || failure?.data?.resetAt || '' };
    // Rate/quota/origin failures are terminal; retrying must not bypass their guards.
    if ([400, 401, 403, 429].includes(Number(failure?.status))
      || failure?.data?.reason || failure?.data?.code === 'QUOTA_GUARD_UNAVAILABLE'
      || Array.isArray(failure?.data?.details)) {
      dispatchState({type:'translation', ok:false, status:lastFailure.status, retryAt:lastFailure.retryAt});
      return failure;
    }
    const proxy = String(window.WRN_CONFIG?.proxyUrl || '').trim();
    const canFallback = typeof originalRequest === 'function' || Boolean(proxy);
    dispatchState({
      type: 'translation',
      ok: false,
      fallback: canFallback,
      status: Number(failure?.status || 0),
      error: String(failure?.message || 'Shared translation request failed.')
    });

    if (!canFallback) return failure;

    try {
      const result = typeof originalRequest === 'function'
        ? await originalRequest(args) : await directRequest(proxy, args);
      if (result && typeof result === 'object') {
        if (result.error === false && result.text) lastFailure = null;
        return { ...result, sharedFallback: true };
      }
      return result;
    } catch (error) {
      return {
        ...failure,
        fallbackError: String(error?.message || error)
      };
    }
  }

  async function directRequest(endpoint, args) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Client-Id': 'wrn-web' },
        body: JSON.stringify({ action: 'translate', targetLanguage: args.targetLanguage,
          mode: args.mode || 'title_and_text', title: String(args.title || '').slice(0, 500), text: String(args.text || '').slice(0, 6000) }),
        signal: controller.signal
      });
      const data = await response.json();
      const text = extractText(data);
      return response.ok && text ? { error: false, text, status: response.status, provider: data.provider || '' }
        : { error: true, status: response.status, message: data.message || 'Translation unavailable.', data };
    } finally { window.clearTimeout(timer); }
  }

  const inFlight = new Map();
  function request(args = {}) {
    const normalized = { ...args, targetLanguage: normalizedTargetLanguage(args.targetLanguage || targetLanguage()) };
    const key = JSON.stringify([normalized.targetLanguage, normalized.mode || 'title_and_text', String(normalized.title || '').slice(0, 500), String(normalized.text || '').slice(0, 6000)]);
    if (inFlight.has(key)) return inFlight.get(key);
    const pending = performRequest(normalized).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
    return pending;
  }

  async function performRequest(args = {}) {
    const endpoint = String(window.WRN_CONFIG?.sharedTranslationUrl || '').trim();
    if (!endpoint) {
      return typeof originalRequest === 'function'
        ? originalRequest(args)
        : { error: true, message: 'Translation function unavailable.' };
    }

    const title = String(args.title || '').slice(0, 500);
    const text = String(args.text || '').slice(0, 6000);
    const mode = String(args.mode || 'title_and_text');
    const language = normalizedTargetLanguage(args.targetLanguage || targetLanguage());
    const controller = new AbortController();
    // The bounded provider phases take up to 26+15+9 seconds, plus cache I/O.
    const timer = window.setTimeout(() => controller.abort(), 65000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': 'wrn-web'
        },
        body: JSON.stringify({
          action: 'translate',
          targetLanguage: language,
          mode,
          title,
          text,
          cacheVersion: 1
        }),
        signal: controller.signal
      });

      const raw = await response.text();
      let data = raw;
      try { data = raw ? JSON.parse(raw) : {}; } catch {}

      const translatedText = typeof cleanTranslationOutput === 'function'
        ? cleanTranslationOutput(extractText(data))
        : extractText(data);
      const cacheState = response.headers.get('X-WRN-Shared-Cache') || data?.sharedCache || '';
      const storage = response.headers.get('X-WRN-Storage') || data?.storage || '';
      const providerBase = String(data?.provider || '');
      const provider = [providerBase, cacheState ? `shared:${cacheState.toLowerCase()}` : '']
        .filter(Boolean)
        .join(' · ');

      if (response.ok && translatedText) {
        lastFailure = null;
        dispatchState({ type: 'translation', ok: true, cacheState, storage, language, mode });
        return {
          error: false,
          text: translatedText,
          status: response.status,
          provider,
          sharedCache: cacheState,
          cached: cacheState.toUpperCase() === 'HIT',
          storage
        };
      }

      return fallbackToOriginal(args, {
        error: true,
        status: response.status,
        message: data?.message || data?.error?.message || 'Shared translation request failed.',
        data,
        retryAt: retryTimestamp(response.headers.get('Retry-After') || data?.retryAfterSeconds, data?.resetAt)
      });
    } catch (error) {
      return fallbackToOriginal(args, {
        error: true,
        status: 0,
        message: error?.name === 'AbortError'
          ? 'The shared translation request timed out.'
          : String(error?.message || error)
      });
    } finally {
      window.clearTimeout(timer);
    }
  }

  window.fetchTranslationRequest = request;
  try { fetchTranslationRequest = request; } catch {}

  function dispatchState(detail) {
    window.dispatchEvent(new CustomEvent('wrnsharedtranslationstate', { detail }));
  }

  function retryTimestamp(value, resetAt) {
    if (validDate(resetAt)) return resetAt;
    if (value === null || value === undefined || value === '') return '';
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds > 0 && seconds <= 2678400) return new Date(Date.now() + seconds * 1000).toISOString();
    return validDate(value) ? new Date(value).toISOString() : '';
  }

  async function statusRequest(url) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {cache:'no-store', signal:controller.signal});
      const data = await response.json();
      return {...data, ok:response.ok && data?.ok === true, status:response.status};
    } catch { return {ok:false}; }
    finally { window.clearTimeout(timer); }
  }

  async function health() {
    const endpoint = String(window.WRN_CONFIG?.sharedTranslationUrl || '').trim().replace(/\/$/, '');
    if (!endpoint) return { ok: false, disabled: true };
    try {
      const proxy = String(window.WRN_CONFIG?.proxyUrl || '').trim();
      const proxyStatusUrl = action => { const url = new URL(proxy); url.searchParams.set('action', action); return url.href; };
      const [cache, translation, voice] = await Promise.all([
        statusRequest(`${endpoint}/health`),
        proxy ? statusRequest(proxyStatusUrl('translation.status')) : {},
        proxy ? statusRequest(proxyStatusUrl('podcast.status')) : {}
      ]);
      const result = {...cache, quotas:[cache, translation, voice].flatMap(result => result.ok && Array.isArray(result.quotas) ? result.quotas : []),
        translationEnabled:translation.ok ? translation.enabled : null,
        translationAvailable:cache.ok === true && cache.enabled !== false && cache.healthy !== false
          && translation.ok === true && translation.enabled === true && translation.healthy !== false,
        providerQuota:null, providerTariff:null};
      dispatchState({ type: 'health', ...result });
      return result;
    } catch (error) {
      const result = { ok: false, error: String(error?.message || error) };
      dispatchState({ type: 'health', ...result });
      return result;
    }
  }

  window.WRNSharedTranslations = Object.freeze({
    enabled: () => Boolean(String(window.WRN_CONFIG?.sharedTranslationUrl || '').trim()),
    request,
    health,
    statusLines,
    failureMessage
  });
})();
