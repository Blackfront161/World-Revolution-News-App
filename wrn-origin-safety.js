/* World Revolution News 1.7.21 – Origin safety guard */
'use strict';

(function installWRNOriginSafety(root, factory) {
    const existing = root.WRNOriginSafety;

    if (existing?.version === '1.7.21') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = existing;
        }
        return;
    }

    const api = factory(root);
    root.WRNOriginSafety = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (root.document || root.window === root) {
        api.install();
    }
})(
    typeof globalThis !== 'undefined' ? globalThis : window,
    root => {
        const VERSION = '1.7.21';
        const CACHE_PREFIX = 'wrn-';
        const BLOCKED_DB_SENTINEL = '__wrn_blocked_foreign_delete__';

        const native = {
            storageClear: null,
            cacheKeys: null,
            cacheDelete: null,
            getRegistrations: null,
            unregister: null,
            databases: null,
            deleteDatabase: null
        };

        const scriptUrl = (() => {
            try {
                return root.document?.currentScript?.src || root.location?.href;
            } catch {
                return '';
            }
        })();

        const scopePath = (() => {
            try {
                return new URL('./', scriptUrl || root.location.href).pathname;
            } catch {
                return '/Revolution-News-Data/';
            }
        })();

        const isOwnedCacheName = name =>
            String(name || '').startsWith(CACHE_PREFIX);

        const isOwnedStorageKey = key => {
            const value = String(key || '');

            return (
                /^wrn(?:_|-|:)/i.test(value)
                || /^wrn[A-Z]/.test(value)
            );
        };

        const isOwnedDatabaseName = name => {
            const value = String(name || '');

            return (
                /^wrn(?:_|-|:)/i.test(value)
                || /^wrn[A-Z]/.test(value)
            );
        };

        const isOwnedScope = scope => {
            try {
                const url = new URL(String(scope || ''), root.location?.href);
                return url.pathname.startsWith(scopePath);
            } catch {
                return false;
            }
        };

        const clearOwnedStorage = storage => {
            if (!storage) return 0;

            const keys = [];

            for (let index = 0; index < storage.length; index += 1) {
                const key = storage.key(index);
                if (isOwnedStorageKey(key)) keys.push(key);
            }

            keys.forEach(key => storage.removeItem(key));
            return keys.length;
        };

        const getOwnedCacheNames = async cacheStorage => {
            const target = cacheStorage || root.caches;
            if (!target) return [];

            const keysMethod = native.cacheKeys
                || target.keys.bind(target);

            const names = await keysMethod();
            return names.filter(isOwnedCacheName);
        };

        const clearOwnedCaches = async cacheStorage => {
            const target = cacheStorage || root.caches;
            if (!target) return 0;

            const deleteMethod = native.cacheDelete
                || target.delete.bind(target);

            const names = await getOwnedCacheNames(target);

            const results = await Promise.all(
                names.map(name => deleteMethod(name))
            );

            return results.filter(Boolean).length;
        };

        const getOwnedServiceWorkerRegistrations = async container => {
            const target = container || root.navigator?.serviceWorker;
            if (!target) return [];

            const method = native.getRegistrations
                || target.getRegistrations.bind(target);

            const registrations = await method();

            return registrations.filter(registration =>
                isOwnedScope(registration?.scope)
            );
        };

        const unregisterOwnedServiceWorkers = async container => {
            const registrations =
                await getOwnedServiceWorkerRegistrations(container);

            const results = await Promise.all(
                registrations.map(registration =>
                    registration.unregister()
                )
            );

            return results.filter(Boolean).length;
        };

        const getOwnedDatabases = async factory => {
            const target = factory || root.indexedDB;

            if (!target || typeof target.databases !== 'function') {
                return [];
            }

            const method = native.databases
                || target.databases.bind(target);

            const databases = await method();

            return databases.filter(database =>
                isOwnedDatabaseName(database?.name)
            );
        };

        const deleteOwnedDatabases = async factory => {
            const target = factory || root.indexedDB;

            if (!target) return 0;

            const databases = await getOwnedDatabases(target);
            const deleteMethod = native.deleteDatabase
                || target.deleteDatabase.bind(target);

            await Promise.all(databases.map(database =>
                new Promise(resolve => {
                    const request = deleteMethod(database.name);
                    request.onsuccess = () => resolve(true);
                    request.onerror = () => resolve(false);
                    request.onblocked = () => resolve(false);
                })
            ));

            return databases.length;
        };

        const clearAllOwnedData = async () => ({
            localStorage: clearOwnedStorage(root.localStorage),
            sessionStorage: clearOwnedStorage(root.sessionStorage),
            caches: await clearOwnedCaches(root.caches),
            databases: await deleteOwnedDatabases(root.indexedDB),
            serviceWorkers:
                await unregisterOwnedServiceWorkers(
                    root.navigator?.serviceWorker
                )
        });

        const patchStorage = () => {
            const prototype = root.Storage?.prototype;

            if (!prototype || prototype.__wrnSafeClear1721) return;

            native.storageClear = prototype.clear;

            Object.defineProperty(prototype, 'clear', {
                configurable: true,
                writable: true,
                value: function scopedClear() {
                    return clearOwnedStorage(this);
                }
            });

            Object.defineProperty(prototype, '__wrnSafeClear1721', {
                configurable: false,
                value: true
            });
        };

        const patchCaches = () => {
            const target = root.caches;

            if (!target || target.__wrnSafeCaches1721) return;

            native.cacheKeys = target.keys.bind(target);
            native.cacheDelete = target.delete.bind(target);

            target.keys = async () => {
                const names = await native.cacheKeys();
                return names.filter(isOwnedCacheName);
            };

            target.delete = name => {
                if (!isOwnedCacheName(name)) {
                    console.warn(
                        'WRN blocked deletion of foreign cache:',
                        name
                    );
                    return Promise.resolve(false);
                }

                return native.cacheDelete(name);
            };

            Object.defineProperty(target, '__wrnSafeCaches1721', {
                configurable: false,
                value: true
            });
        };

        const patchServiceWorkers = () => {
            const container = root.navigator?.serviceWorker;

            if (
                container
                && !container.__wrnSafeRegistrations1721
                && typeof container.getRegistrations === 'function'
            ) {
                native.getRegistrations =
                    container.getRegistrations.bind(container);

                container.getRegistrations = async () => {
                    const registrations =
                        await native.getRegistrations();

                    return registrations.filter(registration =>
                        isOwnedScope(registration?.scope)
                    );
                };

                Object.defineProperty(
                    container,
                    '__wrnSafeRegistrations1721',
                    {
                        configurable: false,
                        value: true
                    }
                );
            }

            const prototype =
                root.ServiceWorkerRegistration?.prototype;

            if (
                prototype
                && !prototype.__wrnSafeUnregister1721
                && typeof prototype.unregister === 'function'
            ) {
                native.unregister = prototype.unregister;

                prototype.unregister = function scopedUnregister() {
                    if (!isOwnedScope(this.scope)) {
                        console.warn(
                            'WRN blocked unregister of foreign worker:',
                            this.scope
                        );
                        return Promise.resolve(false);
                    }

                    return native.unregister.call(this);
                };

                Object.defineProperty(
                    prototype,
                    '__wrnSafeUnregister1721',
                    {
                        configurable: false,
                        value: true
                    }
                );
            }
        };

        const patchIndexedDB = () => {
            const target = root.indexedDB;

            if (!target || target.__wrnSafeIndexedDB1721) return;

            if (typeof target.databases === 'function') {
                native.databases = target.databases.bind(target);

                target.databases = async () => {
                    const databases = await native.databases();

                    return databases.filter(database =>
                        isOwnedDatabaseName(database?.name)
                    );
                };
            }

            if (typeof target.deleteDatabase === 'function') {
                native.deleteDatabase =
                    target.deleteDatabase.bind(target);

                target.deleteDatabase = name => {
                    if (!isOwnedDatabaseName(name)) {
                        console.warn(
                            'WRN blocked deletion of foreign database:',
                            name
                        );

                        return native.deleteDatabase(
                            BLOCKED_DB_SENTINEL
                        );
                    }

                    return native.deleteDatabase(name);
                };
            }

            Object.defineProperty(target, '__wrnSafeIndexedDB1721', {
                configurable: false,
                value: true
            });
        };

        const install = () => {
            patchStorage();
            patchCaches();
            patchServiceWorkers();
            patchIndexedDB();

            return api;
        };

        const api = Object.freeze({
            version: VERSION,
            scopePath,
            cachePrefix: CACHE_PREFIX,
            isOwnedCacheName,
            isOwnedStorageKey,
            isOwnedDatabaseName,
            isOwnedScope,
            clearOwnedStorage,
            getOwnedCacheNames,
            clearOwnedCaches,
            getOwnedServiceWorkerRegistrations,
            unregisterOwnedServiceWorkers,
            getOwnedDatabases,
            deleteOwnedDatabases,
            clearAllOwnedData,
            install
        });

        return api;
    }
);
