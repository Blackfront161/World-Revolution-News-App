'use strict';

const assert = require('node:assert/strict');
const safety = require('../wrn-origin-safety.js');

class FakeStorage {
    constructor(values) {
        this.values = new Map(Object.entries(values));
    }

    get length() {
        return this.values.size;
    }

    key(index) {
        return [...this.values.keys()][index] ?? null;
    }

    removeItem(key) {
        this.values.delete(key);
    }

    has(key) {
        return this.values.has(key);
    }
}

(async () => {
    assert.equal(
        safety.isOwnedCacheName('wrn-app-v1.7.21'),
        true
    );
    assert.equal(
        safety.isOwnedCacheName('another-project-cache'),
        false
    );

    assert.equal(safety.isOwnedStorageKey('wrn_theme'), true);
    assert.equal(safety.isOwnedStorageKey('wrn-reading'), true);
    assert.equal(safety.isOwnedStorageKey('wrn:queue'), true);
    assert.equal(safety.isOwnedStorageKey('wrnReadingState'), true);
    assert.equal(safety.isOwnedStorageKey('other_project'), false);

    const storage = new FakeStorage({
        wrn_theme: 'dark',
        'wrn-reading': '1',
        other_project: 'keep'
    });

    assert.equal(safety.clearOwnedStorage(storage), 2);
    assert.equal(storage.has('wrn_theme'), false);
    assert.equal(storage.has('wrn-reading'), false);
    assert.equal(storage.has('other_project'), true);

    const deletedCaches = [];

    const fakeCaches = {
        async keys() {
            return [
                'wrn-app-v1',
                'wrn-data-v1',
                'foreign-cache'
            ];
        },
        async delete(name) {
            deletedCaches.push(name);
            return true;
        }
    };

    assert.deepEqual(
        await safety.getOwnedCacheNames(fakeCaches),
        ['wrn-app-v1', 'wrn-data-v1']
    );

    assert.equal(
        await safety.clearOwnedCaches(fakeCaches),
        2
    );

    assert.deepEqual(
        deletedCaches,
        ['wrn-app-v1', 'wrn-data-v1']
    );

    assert.equal(
        safety.isOwnedScope(
            'https://blackfront161.github.io/Revolution-News-Data/'
        ),
        true
    );

    assert.equal(
        safety.isOwnedScope(
            'https://blackfront161.github.io/Other-Project/'
        ),
        false
    );

    console.log('WRN origin safety tests: OK');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
