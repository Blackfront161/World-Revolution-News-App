/* World Revolution News 1.7.9 – fehlertoleranter Offline-Speicher */
(() => {
    'use strict';

    const DB_NAME = 'world-revolution-news';
    const DB_VERSION = 1;
    const DATASET_STORE = 'datasets';
    const TRANSLATION_STORE = 'translations';
    const TIMEOUT_MS = 1800;

    let databasePromise = null;
    let disabled = !('indexedDB' in window);
    let lastError = '';

    function withTimeout(promise, fallback = null, timeoutMs = TIMEOUT_MS) {
        return new Promise(resolve => {
            let settled = false;
            const timer = window.setTimeout(() => {
                if (settled) return;
                settled = true;
                resolve(fallback);
            }, timeoutMs);

            Promise.resolve(promise).then(value => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                resolve(value);
            }).catch(error => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                lastError = String(error?.message || error || 'Speicherfehler');
                resolve(fallback);
            });
        });
    }

    function openDatabaseRaw() {
        if (disabled) return Promise.resolve(null);
        if (databasePromise) return databasePromise;

        databasePromise = new Promise(resolve => {
            let request;
            try {
                request = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (error) {
                disabled = true;
                lastError = String(error?.message || error);
                resolve(null);
                return;
            }

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(DATASET_STORE)) {
                    db.createObjectStore(DATASET_STORE, { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains(TRANSLATION_STORE)) {
                    const store = db.createObjectStore(TRANSLATION_STORE, { keyPath: 'key' });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                disabled = true;
                lastError = String(request.error?.message || 'IndexedDB konnte nicht geöffnet werden.');
                resolve(null);
            };
            request.onblocked = () => {
                disabled = true;
                lastError = 'IndexedDB wird durch einen anderen Tab blockiert.';
                resolve(null);
            };
        });

        return databasePromise;
    }

    async function openDatabase() {
        const db = await withTimeout(openDatabaseRaw(), null);
        if (!db) disabled = true;
        return db;
    }

    async function runTransaction(storeName, mode, callback, fallback = null) {
        if (disabled) return fallback;
        const db = await openDatabase();
        if (!db) return fallback;

        return withTimeout(new Promise(resolve => {
            let transaction;
            let result = fallback;
            try {
                transaction = db.transaction(storeName, mode);
                result = callback(transaction.objectStore(storeName));
            } catch (error) {
                lastError = String(error?.message || error);
                resolve(fallback);
                return;
            }

            transaction.oncomplete = () => resolve(result);
            transaction.onerror = () => {
                lastError = String(transaction.error?.message || 'Transaktion fehlgeschlagen.');
                resolve(fallback);
            };
            transaction.onabort = () => resolve(fallback);
        }), fallback);
    }

    async function putDataset(key, data) {
        if (!key || disabled) return false;
        return Boolean(await runTransaction(DATASET_STORE, 'readwrite', store => {
            store.put({ key, data, updatedAt: new Date().toISOString() });
            return true;
        }, false));
    }

    async function getDatasetRecord(key) {
        if (!key || disabled) return null;
        const db = await openDatabase();
        if (!db) return null;

        return withTimeout(new Promise(resolve => {
            let request;
            try {
                request = db.transaction(DATASET_STORE, 'readonly')
                    .objectStore(DATASET_STORE)
                    .get(key);
            } catch {
                resolve(null);
                return;
            }
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        }), null);
    }

    async function getDataset(key) {
        const record = await getDatasetRecord(key);
        return record?.data ?? null;
    }

    async function putTranslation(key, value) {
        if (!key || disabled) return false;
        return Boolean(await runTransaction(TRANSLATION_STORE, 'readwrite', store => {
            store.put({ key, value, updatedAt: Date.now() });
            return true;
        }, false));
    }

    async function getTranslation(key) {
        if (!key || disabled) return null;
        const db = await openDatabase();
        if (!db) return null;

        return withTimeout(new Promise(resolve => {
            let request;
            try {
                request = db.transaction(TRANSLATION_STORE, 'readonly')
                    .objectStore(TRANSLATION_STORE)
                    .get(key);
            } catch {
                resolve(null);
                return;
            }
            request.onsuccess = () => resolve(request.result?.value ?? null);
            request.onerror = () => resolve(null);
        }), null);
    }

    async function getAllRecords(storeName) {
        if (disabled) return [];
        const db = await openDatabase();
        if (!db) return [];

        return withTimeout(new Promise(resolve => {
            let request;
            try {
                request = db.transaction(storeName, 'readonly')
                    .objectStore(storeName)
                    .getAll();
            } catch {
                resolve([]);
                return;
            }
            request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
            request.onerror = () => resolve([]);
        }), []);
    }

    function getAllDatasetRecords() {
        return getAllRecords(DATASET_STORE);
    }

    function getAllTranslationRecords() {
        return getAllRecords(TRANSLATION_STORE);
    }

    async function clearStore(storeName) {
        if (disabled) return false;
        return Boolean(await runTransaction(storeName, 'readwrite', store => {
            store.clear();
            return true;
        }, false));
    }

    function clearDatasets() {
        return clearStore(DATASET_STORE);
    }

    function clearTranslations() {
        return clearStore(TRANSLATION_STORE);
    }

    async function replaceStoreRecords(storeName, records) {
        if (!Array.isArray(records) || disabled) return 0;
        const safeRecords = records
            .filter(record => record && typeof record === 'object' && typeof record.key === 'string')
            .slice(0, 50000);

        const db = await openDatabase();
        if (!db) return 0;

        return withTimeout(new Promise(resolve => {
            let transaction;
            try {
                transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                store.clear();
                safeRecords.forEach(record => store.put(record));
            } catch {
                resolve(0);
                return;
            }
            transaction.oncomplete = () => resolve(safeRecords.length);
            transaction.onerror = () => resolve(0);
            transaction.onabort = () => resolve(0);
        }), 0);
    }

    function replaceDatasetRecords(records) {
        return replaceStoreRecords(DATASET_STORE, records);
    }

    function replaceTranslationRecords(records) {
        return replaceStoreRecords(TRANSLATION_STORE, records);
    }

    function approximateBytes(value) {
        try {
            return new Blob([JSON.stringify(value)]).size;
        } catch {
            return 0;
        }
    }

    async function getStorageSummary() {
        const [datasets, translations] = await Promise.all([
            getAllDatasetRecords(),
            getAllTranslationRecords()
        ]);
        return {
            datasetCount: datasets.length,
            translationCount: translations.length,
            datasetBytes: approximateBytes(datasets),
            translationBytes: approximateBytes(translations),
            available: !disabled,
            error: lastError
        };
    }

    async function clearAll() {
        const [datasets, translations] = await Promise.all([
            clearDatasets(),
            clearTranslations()
        ]);
        return Boolean(datasets || translations);
    }

    async function migrateLegacyLocalStorage() {
        if (disabled) return false;
        const migrations = [
            ['news', 'cached_news_articles'],
            ['events', 'cached_event_data']
        ];

        for (const [datasetKey, oldKey] of migrations) {
            const existing = await getDataset(datasetKey);
            if (Array.isArray(existing) && existing.length > 0) continue;

            try {
                const raw = localStorage.getItem(oldKey);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) continue;
                const stored = await putDataset(datasetKey, parsed);
                if (stored) localStorage.removeItem(oldKey);
            } catch {}

            if (disabled) break;
        }
        return !disabled;
    }

    async function requestPersistentStorage() {
        if (!navigator.storage?.persist) return false;
        return withTimeout(navigator.storage.persist(), false, 800);
    }

    window.WRNStorage = {
        version: '1.7.9',
        openDatabase,
        putDataset,
        getDataset,
        getDatasetRecord,
        putTranslation,
        getTranslation,
        getAllDatasetRecords,
        getAllTranslationRecords,
        clearDatasets,
        clearTranslations,
        clearAll,
        replaceDatasetRecords,
        replaceTranslationRecords,
        getStorageSummary,
        migrateLegacyLocalStorage,
        requestPersistentStorage,
        isAvailable: () => !disabled,
        lastError: () => lastError
    };
})();
