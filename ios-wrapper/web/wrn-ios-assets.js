/* Explicitly saved article assets on WKWebView, which has no PWA service worker. */
'use strict';
(() => {
  if (window.Capacitor?.getPlatform?.() !== 'ios' || !window.indexedDB) return;
  const plugin = window.Capacitor.Plugins.WRNDevice;
  if (!plugin?.fetchAsset) return;
  const cacheName = 'wrn-saved-articles-v1';
  const maxTotalBytes = 64 * 1024 * 1024;
  const originalFetch = window.fetch.bind(window);
  const nativeCaches = window.caches;
  const imageURLs = new Map();
  let generation = 0;
  const database = new Promise((resolve, reject) => {
    const request = indexedDB.open('wrn-ios-saved-assets-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets', { keyPath: 'url' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('asset-database-blocked'));
  });
  // A failed database is surfaced by save(), never an unhandled startup rejection.
  database.catch(() => {});
  const key = value => new URL(typeof value === 'string' ? value : value.url, window.location.href).href;
  async function transaction(mode, operation) {
    const db = await database;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', mode);
      let value;
      operation(tx.objectStore('assets'), result => { value = result; }, tx);
      tx.oncomplete = () => resolve(value);
      tx.onerror = () => reject(tx.error || new Error('asset-storage-failed'));
      tx.onabort = () => reject(tx.error || new Error('asset-storage-aborted'));
    });
  }
  const read = url => transaction('readonly', (store, finish) => {
    const request = store.get(key(url)); request.onsuccess = () => finish(request.result);
  });
  function releaseImage(url) {
    const blobURL = imageURLs.get(url);
    if (!blobURL) return;
    imageURLs.delete(url);
    document.querySelectorAll('img').forEach(image => { if (image.src === blobURL) image.src = url; });
    URL.revokeObjectURL(blobURL);
  }
  async function remove(url) {
    generation += 1; // A concurrent save must not resurrect deleted reading data.
    const normalized = key(url);
    const exists = Boolean(await read(normalized));
    await transaction('readwrite', (store, finish) => { store.delete(normalized); finish(exists); });
    releaseImage(normalized);
    return exists;
  }
  async function clear() {
    generation += 1;
    await transaction('readwrite', store => store.clear());
    [...imageURLs.keys()].forEach(releaseImage);
    return true;
  }
  async function save(urls) {
    const epoch = generation;
    const results = [];
    const saveOne = async url => {
      if (epoch !== generation) throw new Error('asset-save-cancelled');
      const normalized = key(url);
      const parsed = new URL(normalized);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('invalid-asset-url');
      const result = await plugin.fetchAsset({ url: normalized });
      const binary = window.atob(result.base64);
      const data = Uint8Array.from(binary, character => character.charCodeAt(0));
      const record = { url: normalized, data: data.buffer, contentType: result.contentType, bytes: data.byteLength };
      if (epoch !== generation) throw new Error('asset-save-cancelled');
      await transaction('readwrite', (store, finish, tx) => {
        const request = store.getAll();
        request.onsuccess = () => {
          if (epoch !== generation) { tx.abort(); return; }
          const bytes = request.result.filter(item => item.url !== normalized).reduce((total, item) => total + item.bytes, 0);
          if (bytes + record.bytes > maxTotalBytes) { tx.abort(); return; }
          store.put(record); finish(true);
        };
      });
      releaseImage(normalized);
    };
    // Bound memory and network use on older iPhones. Never fetch all 30 files
    // simultaneously; clearing data also prevents starting remaining downloads.
    for (const url of [...new Set(urls)].slice(0, 30)) {
      try { await saveOne(url); results.push({ status: 'fulfilled' }); }
      catch (reason) { results.push({ status: 'rejected', reason }); }
    }
    results.filter(result => result.status === 'rejected').forEach(result => console.warn('iOS article asset storage failed', result.reason?.name || 'storage-error'));
    return results.every(result => result.status === 'fulfilled');
  }
  const savedCache = { delete: remove, match: async url => {
    const record = await read(url);
    return record ? new Response(record.data, { headers: { 'Content-Type': record.contentType } }) : undefined;
  } };
  // Preserve the existing app's deletion API. Its datasets and help packages still
  // use WRNStorage/IndexedDB, including their original validation and expiry rules.
  Object.defineProperty(window, 'caches', { configurable: true, value: {
    open: async name => name === cacheName ? savedCache : nativeCaches?.open(name),
    delete: async name => name === cacheName ? clear() : (await nativeCaches?.delete(name) || false),
    keys: async () => [...new Set([...(await nativeCaches?.keys() || []), cacheName])]
  } });
  window.fetch = async (input, options) => {
    try { return await originalFetch(input, options); }
    catch (error) {
      if (options?.signal?.aborted || error?.name === 'AbortError') throw error;
      const method = String(options?.method || (typeof input === 'object' ? input.method : 'GET') || 'GET').toUpperCase();
      if (method !== 'GET') throw error;
      const cached = await savedCache.match(input).catch(() => undefined);
      if (cached) return cached;
      throw error;
    }
  };
  async function restoreImage(image) {
    if (!image?.src || image.src.startsWith('blob:') || image.src.startsWith('data:')) return;
    const original = image.src;
    const epoch = generation;
    const record = await read(original).catch(() => null);
    if (!record || !record.contentType.startsWith('image/') || epoch !== generation || image.src !== original) return;
    let blobURL = imageURLs.get(original);
    if (!blobURL) { blobURL = URL.createObjectURL(new Blob([record.data], { type: record.contentType })); imageURLs.set(original, blobURL); }
    image.src = blobURL;
    image.hidden = false;
    const container = image.closest('[data-optional-image]');
    if (container) container.hidden = false;
  }
  document.addEventListener('error', event => {
    if (event.target?.tagName === 'IMG') void restoreImage(event.target);
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    const inspect = node => {
      if (node.nodeType !== 1 || navigator.onLine !== false) return;
      if (node.tagName === 'IMG') void restoreImage(node);
      node.querySelectorAll?.('img').forEach(image => { void restoreImage(image); });
    };
    inspect(document.documentElement);
    new MutationObserver(records => records.forEach(record => {
      if (record.type === 'attributes') inspect(record.target);
      else record.addedNodes.forEach(inspect);
    })).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  });
  window.WRNIOSAssets = Object.freeze({ save, remove, clear });
})();
