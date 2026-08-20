# Website porting manifest – next-update candidate

This manifest documents reusable app logic only. The website repository was not changed.

## Reusable rules

- `news-card-copy.js`: use `completeFirstSentence()` for initial and translated card copy. It deliberately returns an empty string when no reliable complete sentence exists or the first sentence exceeds the safety limit. Keep the `10. Oktober` and abbreviation tests for both `Intl.Segmenter` and scanner fallback.
- Translation provenance: keep exactly one `.translation-note`; call `translationNotice()` with a verified source-language label or no label. Unknown language metadata must remain generic.
- `solidarity-network-21.js`: reuse query, hierarchical region, manual location, confirmed-counselling-language and topic filters. Never infer location, request geolocation or persist searches, selected filters or opened profiles.
- Preserve the distinction between `confirmedCounsellingLanguages` and `informationLanguages`. Information or website language is not a counselling promise.
- Reuse the visible service boundary: advice-only profiles are not emergency numbers; crisis contacts still require reading their limits.

## Data boundary

- Port only the reviewed records `opferhilfe-schweiz-142`, `dargebotene-hand-143` and `pro-juventute-147` together with their dates, official-domain allowlists and field evidence.
- 142 is explicitly not an emergency number. Do not broaden this profile.
- Do not publish submissions automatically. The app currently creates an unpersisted local draft only.
- Categories shown as uncovered are an editorial gap, not a claim that no support exists.

## Integration boundary

- Adapt the CSS to website breakpoints; do not copy app cache names into a website worker.
- Bump website revisions only after its own desktop/mobile, keyboard and offline QA.
- Acceptance: zero or one complete teaser per card; exactly one translation notice; native search/select/reset controls; no help-filter data in storage, URLs or analytics.

