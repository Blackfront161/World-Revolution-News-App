# Cloudflare cost protection

The Worker source in this directory is the deployable source of truth. Secrets
must only be stored with `wrangler secret put` or in the Cloudflare dashboard;
never add them to this repository.

## Protection model

- Strongly consistent Durable Object reservations happen **before** any
  cost-sensitive upstream request or persistent cache write.
- Daily and monthly windows select a new counter automatically at 00:00 UTC.
  No manual reactivation or Cron trigger is needed.
- Quota-guard failures are fail-closed: new paid/limited work is rejected while
  cached translations, stored podcasts and device speech remain usable.
- Cloudflare Rate Limiting bindings absorb bursts; Durable Objects provide the
  exact aggregate counters.
- Manual emergency switches remain available:
  `WRN_TRANSLATION_ENABLED` and `WRN_PODCAST_GENERATION_ENABLED`.

Default safety ceilings use roughly five percent reserve:

| Resource | Default ceiling | Automatic reset |
| --- | ---: | --- |
| Translation cache misses | 950/day | 00:00 UTC |
| Azure Speech | 475,000 characters/month | first day, 00:00 UTC |
| KV cache writes | 950/day | 00:00 UTC |
| Podcast R2 storage | 9 GiB | monthly recount and automatic reset |

Cloudflare budget alerts are monitoring only and do not stop products. For
Worker request charges, keep the account on Workers Free (as currently
configured). The platform then fails closed at the included request and CPU
limits. A paid Workers subscription has no hard request ceiling.

## Required deployment checks

1. Export or download the currently deployed Worker versions.
2. Fill exact existing KV/R2 binding identifiers in each `wrangler.jsonc`.
3. Deploy with `--keep-vars`; do not replace existing secrets.
4. Add the R2 lifecycle rule for `podcasts/` with a 30-day expiration.
5. Confirm public R2 development URLs are disabled.
6. Test allowed web and Android origins, cache HIT/MISS, quota exhaustion and
   automatic next-window reactivation.
