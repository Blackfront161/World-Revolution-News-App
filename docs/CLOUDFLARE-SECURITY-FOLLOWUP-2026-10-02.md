# Separate Cloudflare correction

Scope: revolution-proxy only. App Code33 remains bound to ce2b556; no App assets or website changed. The independently reported issues were present in the previous worker and the first model-migration deployment. This correction is not published until independent review of its exact commit.

Changes:

- Actual received request bytes are capped at 40,000 before JSON parsing; Content-Length is only an early rejection hint. Oversize streams are cancelled. Invalid JSON remains 400; oversize becomes 413.
- Push destinations are restricted to provider-owned Google, Mozilla, Apple and Microsoft hosts. HTTPS, default TLS port, no userinfo and no fragment are required. The same check runs at registration and again over stored endpoints before sending. Previously stored unsafe targets are removed, never contacted. web-push uses Node HTTPS requests without following redirects.
- Push subscription admission runs in a synchronous SQLite transaction: maximum 10,000 total and 50 per hashed edge client. Body IDs, custom headers and X-Forwarded-For never select the key. Cloudflare's edge-supplied CF-Connecting-IP is required together with platform request.cf; missing/invalid identity fails closed. IPv6 is canonicalized. Existing endpoint ownership remains stable across IP changes; refreshing an existing record does not move it to a new client quota.
- Records not refreshed for 180 days are pruned during registration, status and publication. The expiry is inactivity-based; users reopening or updating their push preferences can renew. A new client_key column and indexes preserve old records. Legacy records acquire an owner on next successful renewal.
- Keyset pagination examines all stored rows in pages of 250, applies preferences, then sends in batches of 40. More than 2,500 newer unrelated records cannot exclude an older matching recipient. At capacity, new admission is rejected without evicting existing subscriptions.

Tests use the actual PushGateway and public fetch handler, real in-memory SQLite, and a mocked external delivery transport (no real push sent). They cover concurrent per-client admission, global overflow, TTL cleanup, preservation of old schema rows, over 2,500 attacker rows, invalid legacy endpoints, forwarded/body client spoofing, missing edge identity, provider URL tricks, oversize chunked/missing/dishonest lengths, cancellation, UTF-8 byte counting and the exact valid boundary. Cloudflare tests, syntax checks, feedback contract and Wrangler dry-run pass. Deployment/runtime acceptance is tracked separately in ROADMAP.

Limits: an IP key groups users behind a shared network; 50 subscriptions per IP is deliberately above typical household use. Different real IPs can still exhaust global admission; bounded storage and refusal to displace existing recipients contain this, not prove identity. No real push broadcast or VAPID secret was used for tests.

Provider/edge references: [Google FCM network configuration](https://firebase.google.com/docs/cloud-messaging/network-configuration), [Mozilla HTTP API](https://mozilla-services.github.io/autopush-rs/http.html), [Apple web push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers), [Microsoft WNS](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/push-notifications/quickstart-send-push-notification), [Cloudflare edge headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/).

## Publication and live acceptance

The controller independently accepted exact code commit `3a429a8d3b732793118859afeb8bd62a5f089f65`, all three findings FIXED. It was then published with preserved vars/secrets as Worker version `b4344450-d9f3-4e2e-9889-1c961c725508`. Root live smoke passes: health, allowed/foreign CORS, actual40001byte stream without Content-Length413, natural German/French translated headlines and body with Gemini3.5Flash-Lite, shared cache MISS then HIT returning identical text. Push-config200/disabled; no broadcast. Previous versions retained. Detailed evidence and review: `evidence/cloudflare-model-2026-10-02/`.

Additional local actual SQLite Durable Object/RPC probe admitted exactly50 of60 concurrent registrations and rejected10 for capacity. The installed local workerd supports only2026-07-29; that date applies exclusively to the isolated fixture. Production2026-08-05 is unchanged.
