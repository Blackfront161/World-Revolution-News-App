# Review correction, 3 October 2026

Corrected product `99bb9cc29c515b95a0c7e4ba9a19cf8f106d9c12`, inherited product `ad9074b`. Independent completion review pending. No Worker, App or Play deployment performed.

The initial candidate failed independent review: Cache /health returned the raw quota object and did not set no-store; App translation availability depended on cache health even if the proxy failed or was disabled. The initial REPORT.md claim that every public handler allowlists quota fields was incorrect and is superseded by this correction. Original evidence remains historical.

Cache health now reuses the exact existing publicOperationalStatus allowlist, marks unavailable guards explicitly, returns enabled/healthy and Cache-Control:no-store. An explicitly invalid browser Origin is rejected before the counter read; public No-Origin checks remain available. Adversarial DO status with privateMessage/internalTenant/nested requestText reveals none of those fields. No quota reservation or provider call is added.

The client reports translationAvailable separately: healthy enabled cache AND successful enabled healthy proxy. App UI uses that exact property. Six client partial-failure cases and actual Chrome cases cache200/proxy503 and proxyenabledfalse cannot claim availability. Provider tariffs/model readiness remain unverified and public quotas remain WRN-owned limits.

All30 Worker tests PASS,39 Python asset tests PASS, quota/shared-client/resilience/current-candidate Node contracts PASS. Real Chrome navigation rerun has8 PASS checks/errors[]; earlier seven navigation checks remain and actual false-availability UI regressions are covered. Corrected Cache dry-run PASS22.54KiB/gzip6.05KiB, same configuration/bindings. Unchanged Proxy retains its earlier successful dry-run. Cache pins advanced togetherr26/v114, App70/client7, legacy clientalias12.

Product manifest covers31 current canonical Gitblobs. Knowledge candidate, real radio3-station/15s fallback and final7-case sharing outputs remain at the parent evidence directory; their relevant underlying player/content sources are unchanged. No new native/background/store or all-catalog PASS is asserted. Both review findings must be independently closed before deployment.
