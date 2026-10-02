import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { readBoundedJson } from '../revolution-proxy/src/request-body.js';

const deliveries = [];
globalThis.__wrnPushSecurityDeliveries = deliveries;
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { shortCircuit: true, url: 'data:text/javascript,export class DurableObject {}' };
    if (specifier === 'web-push') return { shortCircuit: true, url: 'data:text/javascript,export default {setVapidDetails(){},async sendNotification(s){globalThis.__wrnPushSecurityDeliveries.push(s.endpoint)}}' };
    return nextResolve(specifier, context);
  }
});
const { PushGateway, pushInternals } = await import('../revolution-proxy/src/push-gateway.js');
const { default: worker } = await import('../revolution-proxy/src/index.js');
hook.deregister();

function database() {
  const db = new DatabaseSync(':memory:');
  const sql = { exec(query, ...params) {
    const statement = db.prepare(query);
    const rows = statement.columns().length ? statement.all(...params) : (statement.run(...params), []);
    return { toArray: () => rows };
  } };
  const storage = { sql, transactionSync(callback) {
    db.exec('BEGIN');
    try { const value = callback(); db.exec('COMMIT'); return value; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  } };
  return { db, sql, gateway: new PushGateway({ storage }, {}) };
}
const subscription = id => ({ endpoint: `https://fcm.googleapis.com/fcm/send/${id}`, keys: { p256dh: 'test-public', auth: 'test-auth' } });
const preferences = { followedOnly: false, quietFrom: '00:00', quietUntil: '00:00' };
const broadcast = { payload: { title: 'Test', body: 'Fixture only', kind: 'breaking' }, vapid: { subject: 'mailto:test@example.invalid', publicKey: 'test', privateKey: 'test' } };

test('provider hosts accepted; private addresses and URL authority tricks rejected', () => {
  for (const endpoint of [subscription('google').endpoint, 'https://updates.push.services.mozilla.com/wpush/v2/test', 'https://web.push.apple.com/test', 'https://db3.notify.windows.com/?token=test']) {
    assert.equal(pushInternals.validPushEndpoint(endpoint), true, endpoint);
  }
  for (const host of ['localhost', '127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '0.0.0.0', '[::1]', '[fe80::1]', '[fc00::1]', '[::ffff:127.0.0.1]', '2130706433', 'fcm.googleapis.com.attacker.invalid', 'fcm.googleapis.com.', 'evilpush.apple.com', 'push.apple.com.attacker.invalid']) {
    assert.equal(pushInternals.validPushEndpoint(`https://${host}/test`), false, host);
  }
  for (const endpoint of ['http://fcm.googleapis.com/test', 'https://fcm.googleapis.com:8443/test', 'https://user@fcm.googleapis.com/test', 'https://fcm.googleapis.com@127.0.0.1/test', 'https://fcm.googleapis.com/test#fragment']) {
    assert.equal(pushInternals.validPushEndpoint(endpoint), false, endpoint);
  }
});

test('concurrent registrations atomically cap a client; refreshing cannot move ownership', async () => {
  const { db, sql, gateway } = database();
  try {
    const result = await Promise.all(Array.from({ length: 100 }, (_, id) => gateway.subscribe({ subscription: subscription(id), clientKey: 'a'.repeat(64) })));
    assert.equal(result.filter(row => row.ok).length, 50);
    assert.equal(gateway.status().subscriptions, 50);
    assert.equal((await gateway.subscribe({ subscription: subscription(0), clientKey: 'b'.repeat(64) })).ok, true);
    assert.equal(sql.exec('SELECT COUNT(*) AS count FROM push_subscription WHERE client_key = ?', 'a'.repeat(64)).toArray()[0].count, 50);
    assert.equal((await gateway.subscribe({ subscription: subscription(100), clientKey: 'a'.repeat(64) })).reason, 'subscription_capacity');
    assert.equal((await gateway.subscribe({ subscription: subscription(101), clientKey: 'body-fake-id' })).reason, 'invalid_client');
  } finally { db.close(); }
});

function seed(sql, count, options = {}) {
  const date = options.date || new Date().toISOString();
  for (let id = 0; id < count; id++) {
    sql.exec(`INSERT INTO push_subscription (id, endpoint, p256dh, auth, preferences, language, time_zone, app_version, updated_at, client_key)
      VALUES (?, ?, 'test', 'test', ?, 'de', 'UTC', 'test', ?, ?)`, id.toString(16).padStart(64, '0'), subscription(id).endpoint,
      JSON.stringify(options.preferences || preferences), date, (id % 300).toString(16).padStart(64, '0'));
  }
}

test('global capacity rejects overflow without replacing an existing recipient; TTL cleanup frees space', async () => {
  const { db, sql, gateway } = database();
  try {
    seed(sql, 10000);
    assert.equal((await gateway.subscribe({ subscription: subscription('overflow'), clientKey: 'f'.repeat(64) })).reason, 'subscription_capacity');
    assert.equal(gateway.status().subscriptions, 10000);
    sql.exec('UPDATE push_subscription SET updated_at = ? WHERE id = ?', new Date(Date.now() - pushInternals.INACTIVITY_MS - 60000).toISOString(), '0'.repeat(64));
    assert.equal((await gateway.subscribe({ subscription: subscription('overflow'), clientKey: 'f'.repeat(64) })).ok, true);
    assert.equal(gateway.status().subscriptions, 10000);
    assert.equal(sql.exec('SELECT id FROM push_subscription WHERE id = ?', '0'.repeat(64)).toArray().length, 0);
  } finally { db.close(); }
});

test('over 2500 unrelated newer rows cannot starve an older matching subscriber; legacy unsafe targets never sent', async () => {
  const { db, sql, gateway } = database();
  deliveries.length = 0;
  try {
    seed(sql, 2602, { preferences: { ...preferences, followedOnly: true, topics: ['unrelated'] } });
    sql.exec('UPDATE push_subscription SET preferences = ?, updated_at = ? WHERE id = ?', JSON.stringify(preferences), new Date(Date.now() - 86400000).toISOString(), '0'.repeat(64));
    sql.exec('UPDATE push_subscription SET endpoint = ? WHERE id = ?', 'https://169.254.169.254/private', (1).toString(16).padStart(64, '0'));
    const result = await gateway.publish(broadcast);
    assert.equal(result.ok, true);
    assert.equal(result.matched, 1);
    assert.equal(result.sent, 1);
    assert.equal(result.removed, 1);
    assert.deepEqual(deliveries, [subscription(0).endpoint]);
  } finally { db.close(); }
});

test('existing pre-migration subscriptions preserved while client column is added', () => {
  const db = new DatabaseSync(':memory:');
  db.exec("CREATE TABLE push_subscription (id TEXT PRIMARY KEY, endpoint TEXT, p256dh TEXT, auth TEXT, preferences TEXT, language TEXT, time_zone TEXT, app_version TEXT, updated_at TEXT)");
  db.prepare('INSERT INTO push_subscription VALUES (?,?,?,?,?,?,?,?,?)').run('old', subscription('old').endpoint, 'p', 'a', '{}', 'de', 'UTC', '32', new Date().toISOString());
  const sql = { exec(query, ...params) { const stmt = db.prepare(query); const rows = stmt.columns().length ? stmt.all(...params) : (stmt.run(...params), []); return { toArray: () => rows }; } };
  try {
    const gateway = new PushGateway({ storage: { sql } }, {});
    assert.equal(gateway.status().subscriptions, 1);
    assert.equal(sql.exec('SELECT client_key FROM push_subscription').toArray()[0].client_key, '');
  } finally { db.close(); }
});

function request(body, extraHeaders = {}, edgeIp = '203.0.113.5') {
  const req = new Request('https://worker.invalid', { method: 'POST', headers: { Origin: 'https://solinaridao.com', 'Content-Type': 'application/json', 'CF-Connecting-IP': edgeIp, ...extraHeaders }, body });
  Object.defineProperty(req, 'cf', { value: { colo: 'test' } });
  return req;
}

test('public handler ignores spoofed body/custom/forwarded client IDs and fails closed without edge identity', async () => {
  const inputs = [];
  const env = { VAPID_SUBJECT: 'mailto:test@example.invalid', VAPID_PUBLIC_KEY: 'test', VAPID_PRIVATE_KEY: 'test', PUSH_RATE_LIMITER: { async limit() { return { success: true }; } }, PUSH_GATEWAY: { idFromName() { return 'test'; }, get() { return { async subscribe(input) { inputs.push(input); return { ok: true }; } }; } } };
  for (const fake of ['a', 'b']) {
    const response = await worker.fetch(request(JSON.stringify({ action: 'push.subscribe', subscription: subscription(fake), clientKey: fake, clientId: fake }), { 'X-Forwarded-For': fake, 'X-Client-ID': fake }), env, {});
    assert.equal(response.status, 200);
  }
  assert.match(inputs[0].clientKey, /^[a-f0-9]{64}$/);
  assert.equal(inputs[0].clientKey, inputs[1].clientKey);
  const nativeRequest = new Request('https://worker.invalid', { method: 'POST', headers: { Origin: 'https://solinaridao.com', 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.5' }, body: JSON.stringify({ action: 'push.subscribe' }) });
  assert.equal((await worker.fetch(nativeRequest, env, {})).status, 503);
  assert.equal((await worker.fetch(request('{"action":"push.subscribe"}', {}, 'invalid'), env, {})).status, 503);
  assert.equal(inputs.length, 2);
});

test('handler rejects actual oversized bytes with missing, false and chunked length before JSON parsing', async () => {
  for (const headers of [{}, { 'Content-Length': '1' }, { 'Transfer-Encoding': 'chunked' }]) {
    let cancelled = false;
    const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(10001).fill(120)); }, cancel() { cancelled = true; } });
    const req = new Request('https://worker.invalid', { method: 'POST', headers: { Origin: 'https://solinaridao.com', 'Content-Type': 'application/json', ...headers }, body: stream, duplex: 'half' });
    const response = await worker.fetch(req, {}, {});
    assert.equal(response.status, 413);
    assert.equal(cancelled, true);
  }
  assert.equal((await worker.fetch(request('"' + 'ü'.repeat(20000) + '"'), {}, {})).status, 413);
  assert.equal((await worker.fetch(request('bad json'), {}, {})).status, 400);
});

test('valid JSON exactly at the byte boundary remains accepted', async () => {
  const body = '"' + 'a'.repeat(39998) + '"';
  assert.equal(new TextEncoder().encode(body).byteLength, 40000);
  assert.equal((await readBoundedJson(request(body))).length, 39998);
});
