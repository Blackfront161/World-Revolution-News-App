'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'cloudflare', 'revolution-proxy', 'src', 'index.js'), 'utf8');
const config = fs.readFileSync(path.join(root, 'cloudflare', 'revolution-proxy', 'wrangler.jsonc'), 'utf8');

assert(worker.includes("body?.action === 'feedback.submit'"));
assert(worker.includes('FEEDBACK_MAX_MESSAGE_LENGTH = 4000'));
assert(worker.includes('FEEDBACK_RETENTION_DAYS = 90'));
assert(worker.includes('FEEDBACK_RATE_LIMITER?.limit'));
assert(worker.includes("reserveQuota(env, 'feedback_submissions', 1)"));
assert(worker.includes('pruneFeedbackInbox(env)'));
assert(worker.includes("website) return { ok: false"), 'the bot trap must reject automated submissions');
assert(worker.includes('env.FEEDBACK_EMAIL.send({'));
assert(worker.includes('env.PODCAST_BUCKET.put(key'), 'feedback must have a private R2 inbox fallback');
assert(worker.includes("'private-r2-inbox-with-notification'"), 'private storage must confirm optional notification delivery');
assert(worker.includes("action === 'admin.feedback.list'"), 'the protected feedback inbox cannot list submissions');
assert(worker.includes("action === 'admin.feedback.read'"), 'the protected feedback inbox cannot read a submission');
assert(worker.includes('constantTimeSecretEqual'), 'admin authentication must use constant-time comparison');
assert(worker.includes("rateLimitKey(request, 'translation')"));
assert(worker.includes("rateLimitKey(request, 'podcast')"));
assert(!worker.includes('`${ip}:${clientId}`'), 'client-controlled IDs must not bypass rate limits');
assert(!worker.includes('geminiKeys: getAllGeminiKeys'), 'public health responses must not expose provider inventory');
assert(!worker.includes('podcastStorageLimitBytes:'), 'public health responses must not expose operational limits');
assert(worker.includes('runOperationalMonitor(env)'), 'scheduled quota monitoring is missing');
assert(worker.includes("code: 'FEEDBACK_DELIVERY_FAILED'"), 'delivery must still fail closed if neither channel works');
assert(!worker.includes('console.log(parsed.value.message)'), 'feedback text must never be logged');
assert(config.includes('"FEEDBACK_TO_ADDRESS": "worldrevnews@brief.li"'));
assert(config.includes('"FEEDBACK_DAILY_LIMIT": "250"'));
assert(config.includes('"name": "FEEDBACK_RATE_LIMITER"'));
assert(config.includes('"crons": ["23 * * * *"]'));
assert(worker.includes("action === 'push.config'"), 'the app cannot retrieve the VAPID public key');
assert(worker.includes("requestedAction === 'push.subscribe'"), 'push subscriptions are not accepted');
assert(worker.includes("requestedAction === 'admin.push.send'"), 'protected editorial push delivery is missing');
assert(config.includes('"name": "PUSH_RATE_LIMITER"'));
assert(config.includes('"class_name": "PushGateway"'));

console.log('Direct feedback delivery contract: OK');
