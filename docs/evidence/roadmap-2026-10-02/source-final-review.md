# Independent final content/source-policy review

Disposition: **PASS for the scoped App/Data metadata, source policy and knowledge changes. No unresolved findings.**

Reviewed at 2026-10-02T06:06:03.513820+00:00. App freeze: `c5181b500bccba682f61644a6f77672bb810dcc8`. Data freeze: `2342289bb126c6356f20088d5a97fe20a08980e1`. Baseline for addition counts: `e5a8cbf5daac5bf49472c35eacf96caf9f92a95d`. The final App worktree was clean at capture. This review assesses source admission, factual metadata, rights/language boundaries, withdrawal behavior and integration; deployment, Play Console, APK signing and the separate browser UI acceptance remain the owner's release checks.

## Content and admission results

- The 433 scoped podcast admissions remain intact: 100 Anarchist World This Week, 100 Stick Together, 100 Green Left Radio, 33 Rebel Steps and 100 Red Flare under preserved `twelve-rules-for-what` identity. All 433 have metadata-only policy, empty description/audio/artwork, unverified rights, secure credential-free original URLs, UND episode language and `languageVerified:false`. No future dates are admitted.
- Current totals are **1,778 active episodes / 1,814 archive episodes / 728 Library titles**. The additional 35 active / 36 archive IDs after the initial 1,743/1,778 source-admission batch are maintained-source remote synchronization, not additional source admissions. Every baseline ID survives; both episode catalogs have unique IDs. This review does not grant new media rights to those maintained-source synchronization records.
- All 13 new Library IDs, titles and exact original URLs match the independent `anarchist-archive-de-dispositions.json` metadata-only decisions. The other 10 pending German titles are absent. Authors and topics remain empty; downloads remain empty; no publication date is invented. German denotes the source catalogue/path language; `languageVerified:false` preserves that distinction. `updatedAtMeaning` explicitly denotes WRN catalogue refresh, not publisher publication.
- `l-orage`, `contrabanda-specials` and `infowar-greece` remain disabled with intake on hold. Radio Kurruf and Radio LoRa Zürich are two original-link directories with UND and `feedConfirmed:false`; no audio-feed or episode-language admission is implied. LoRa Zürich remains distinct from LORA München.
- JSON, inline JS and Python policy enforce metadata-only projection. Official feed aliases, including an appended fragment, also enforce UND/unverified language. Source IDs remain stable. `normalizePodcast` retains the IDs and episode-original URLs required for all **seven** new learning relationships across six original pages.
- All six official learning-original URLs returned HTTP 200 in bounded independent checks. Five final URLs exactly match the configured originals; the Shareable tool-library `/response/` URL redirects to its `/podcasts/` page. The working redirect remains bound to its existing catalog episode URL. Editorial notes identify historical/topic context and attribute the tenant-organizing account; they do not turn participant claims into WRN verification.
- Four complete French/Spanish term drafts use WRN original editorial text and visibly retain draft status. Partial/unsafe translations fall back as a whole. The DE/EN source snapshot is not mutated. Each specialty load starts from a fresh glossary snapshot before overlaying the current document, so removed translations do not linger from a previous load.
- Reviewed collection skips unreviewed homepage feed discovery, uses maintained explicit feed URLs, caps responses at 4 MiB, caps admission at 100/source, rejects non-HTTPS final endpoints and skips held intake before network access. Audio/artwork URLs may be parsed from RSS in memory; media is not fetched or persisted for these admissions.

## Findings corrected and rechecked

1. Directory source tombstones were previously accepted. `mediaDirectories` now excludes withdrawn/revoked/deleted records.
2. Revoked glossary terms previously survived new learning relationships. Both knowledge helpers now exclude unavailable terms; revoked episode/book records are excluded too.
3. Valid empty directory responses previously left a stale offline cache. Valid successful empty snapshots are now persisted.
4. Legacy aliases bound to reviewed feeds could retain a false verified episode language. Both policies now canonicalize the feed URL before enforcing UND, including `#cached` aliases.
5. Reviewed feed intake previously performed unbounded homepage discovery. Explicit reviewed feeds now bypass that discovery.
6. The Data JS mirror briefly lacked the latest canonical-feed correction. Final byte comparison now matches all 12 shared scoped files.

## Independent verification

Focused execution on the corrected snapshot: `tests/test_reviewed_podcast_intake.py`: **3 passed**; `tests/test_knowledge_links_locales.js`: **PASS**; `tests/test_learning_paths.js`: **PASS**, including 30 existing bound book relationships. Independent `final-check.js` confirmed exact JSON/inline policy equality, UND/unverified/media-cleared feed-fragment alias projection, seven runtime-normalized podcast relationships, zero revoked-directory results and zero revoked-term relationships. The helper's isolated reuse-of-an-already-translated-snapshot probe is not a runtime failure: the actual loader resets to the original glossary every load, as inspected at `news-app-2.js`.

Evidence in this directory: `final-inventory.json`, `learning-originals-observations.json`, `final-check.js`, the earlier six-podcast/four-hold source `REPORT.md` and source observations, and `ANARCHIST-ARCHIVE-DE.md` with its 23-title dispositions. No remote bodies or audio/artwork/documents were persisted by this reviewer. All reviewer writes are confined to this evidence directory; product changes and commits were performed solely by the root writer.

## Exact reviewed file SHA-256

These hashes, rather than later branch state, define the accepted bytes. Any subsequent product edits need a focused recheck.

| App-relative path | SHA-256 |
| --- | --- |
| `podcast-content-policy.json` | `ee866fa0d9d8584bc0fe4f07860986fe5e78cb41d7ed90e6c75bf139384cca19` |
| `podcast-content-policy.js` | `d8ff181b3bde013143e14d97fd88d05e86f4008c152b64a4955b58c722515382` |
| `podcast_content_policy.py` | `bd2399a66e8981d3541a0ea4173fdc1af29259c87fd5a6724410f992b4fd69ea` |
| `aggregate_podcasts.py` | `d9af8435a33ed0871fc1a81ed29bac80343a954a111e829c2c0094deefcd6c72` |
| `podcasts.json` | `8812bc5b3a0acac6d500854831ee3274cefd4e6f3f67fe573c6616abf833d93d` |
| `podcast-archive.json` | `e08785cf053a8bbae35bc19680a86c04f9b84c699e137277ce21659bff18c606` |
| `podcast-sources.json` | `fa29a65aac737c699a95faa27b5b04674cc388c8623dece48703ffb1a7ba46da` |
| `library-feed.json` | `c30586e88a7519d80e1892a85cae016efe447eb6b1c0f29f4128c187875a9728` |
| `library-sources.json` | `5defa43d30ddd6e23d4c1667b6d14e1170ef77862606987fad40e2beb8ce8a54` |
| `learning-paths.json` | `21202a3413946506f6abd303ad9ef960f7dfe80ee16ed5cac1b1a4b617d8b006` |
| `lexicon-locales.json` | `5b59354be8a764fef375e63a3ddae53e21d15c2d63320b224f43ea17067f30b0` |
| `media-directory-sources.json` | `9c8cdc3b5323b6675c3dc48537e941df482a8323df2d28f43300f1723b3f2211` |
| `news-app-2-specialty.js` | `7d01901386028be1eba8c55e1ad695013213544471271f5a833a471837c41f9c` |
| `news-app-2.js` | `2be4c18a81166e73ecb89c30bb9928eaf3f831680f860900ebc150287b3edb5b` |
| `index.html` | `2222bfc9b98892d546e1888a6942df5be26bf5fa9993f9d7c46ba01072ff08fc` |
| `service-worker.js` | `62902814ede53cf7c55c441e44388eb9d9b3b2c34e5da2ade9f1e6cae9d3c918` |
