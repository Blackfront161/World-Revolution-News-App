# WRN independent catalog and knowledge review

Date: 2026-10-01 (Asia/Singapore)

Status: **GREEN for the exact local catalog/knowledge draft scope.** This is not an Android, signing, Play, website, hosting, or live-publication approval.

## Immutable scope

- App repository: `C:\Users\patri\Documents\World Rev Ne\wrn-github-app-current`
- App baseline: `25b521fac2a4b06e051614d166f8caadf8dd9c40`
- App candidate: `58e0bc3dc26a7d38f7a38faec1d1e278483cd655`
- Data repository: `C:\Users\patri\Documents\World Rev Ne\wrn-data-autonom-current`
- Data baseline: `e62f56280b737ce6559b830d4a4bba7c349d506f`
- Data candidate: `4153d5f2baccbc0d7ccc16a546d08e7808dff753`
- Both worktrees and indexes were clean before and after review. No product file was changed.

## Verified results

- App and Data contain the same 1,345 unique archive IDs and the same 1,310 unique active IDs.
- Exactly 35 `leftover-talk` rows remain in the archive and none is active.
- The 52 existing sources remain; the four holds are `twelve-rules-for-what`, `l-orage`, `contrabanda-specials`, and `infowar-greece`.
- All five declared DE/EN conflict IDs occur once and are `language=und`, `languageVerified=false`, `languageReviewRequired=true`.
- The stored/runtime merge preserves partial results and persistent withdrawal tombstones. The historic RDL blank-source-ID case is projected to the canonical RDL source before source filtering.
- Library: 715 stable works, 53 with German in `languages`.
- Knowledge: 19 revised existing terms, no new term, 155 unique public terms, 32 references, no broken relations.
- Learning paths: three draft paths, ten entries each, 30 unique existing books; all entry URLs exactly match an original-host read/download URL in the corresponding library record. No copied book body or new media/download right was added.
- Service-worker generations are production `wrn-app-v2.1.2-r11` and preview `v99`; the new archive, paths, and revisioned lexicon asset are included by the tested cache contracts.
- No Android wrapper, versionCode, AAB, signing, Play upload, or deployment file changed in this candidate.

## Independent executions

- Full contract matrix: 53 JavaScript contracts passed; 148 pytest tests and four subtests passed; three prerequisite-dependent historical tests skipped; four standalone Python scripts passed.
- `tests/validate_app.py`: exit 0.
- `release_audit_183.py --no-write`: 161 passed, 0 warnings, 0 failed.
- Data `unittest discover`: 13 tests passed.
- Browser library package: passed, including partial response, persistent withdrawal, failed reload recovery, four widths, nine UI languages, and learning-path navigation.
- Browser archive package: passed, including 1,310 IDs, 30/60 pagination, UND filter, five holds, exclusion, partial/failing requests, persistent withdrawal, four widths, and nine UI languages.
- Browser policy package: six checks passed; no remote media request and no page error.
- Four immutable input SHA-256 bindings in `PODCAST-ARCHIVE-PARITY-2026-10-01.json`: zero mismatches against Git blob bytes.
- Output/policy bindings: zero mismatches against candidate bytes.

## Content/source assessment

The 19 DE/EN revisions are substantive WRN-authored summaries. They distinguish definition, practice, and debate; avoid presenting a single tactic as universally sufficient; and preserve the draft/review warning. References are unique HTTPS targets and contain no bundled downloads.

Publication warning (non-blocking for this explicitly local draft): the shared source description says “Primärtext oder Selbstdarstellung”. At least `knowledge-federation`, `knowledge-self-organisation`, and `knowledge-ecofeminism` point to sections of *An Anarchist FAQ*, which are contextual/synthetic references rather than a primary text or the reviewed subject’s self-description. Before any App or website publication, label evidence per entry or use a neutral phrase such as “Referenz zur Einordnung”; do not advertise all 19 as primary sources. The IWW preamble is correctly qualified in the term text as a comparison rather than proof that the IWW is exclusively anarcho-syndicalist.

## Exact candidate byte bindings

| Repository | File | Bytes | SHA-256 |
|---|---|---:|---|
| App/Data | `podcasts.json` | 2,567,528 | `139a3c11778de6fe95a820a7bd85b840ccd75154442bb231a226f98a6ec731ef` |
| App/Data | `podcast-archive.json` | 2,763,609 | `6aec0e67aab43625df72619ced68f49d46a33758d329b6912e3f38a12fc1d23c` |
| App/Data | `podcast-sources.json` | 42,695 | `e2771845470e8e027d759b41868a1f2a1cc7f8c0062b999b27c82a4aedf840a9` |
| App/Data | `podcast-content-policy.json` | 20,766 | `d284dff28933b7d39f2316831c3e1a55abb2e4137bef8df38f7c511316b61e4c` |
| App | `library-feed.json` | 392,718 | `b533b6d8b56cf3bbaab11e8d3d318aee7c5bb8f0ff63bcffe301a368eb27a9e4` |
| App | `library-sources.json` | 4,670 | `2682f6f345702a127f7f87434a892ee4599ca5108a00a8af70a91af39da90a39` |
| App/Data | `learning-paths.json` | 17,596 | `5ccfe8b3891c19ba08d4a4ac1ecdd6151fb3cc4512d586263b227ac2423edae7` |
| App | `lexicon-tab.js` | 244,471 | `af77b63dd6e28a17a1d6615e9cb6b0a89150d9746e0c42fbbf7b6481f708c6d4` |
| App | `news-app-2-media.js` | 12,965 | `ea579adaef259858094c1ac937517fd25551ddd118ee7924b882969a86fa1b4e` |
| App | `podcast_content_policy.py` | 5,263 | `bbc387e2102cf6eab14f74b268283dab26d054d9b1aa5148166c6ab50e0ad3eb` |
| App | `service-worker.js` | 20,568 | `65a140e36803a4866d00d9b87a9e670a57bc0aa78ec7b868b4cbc20cf5cdf4a7` |
| App | `news-app-2-sw.js` | 13,229 | `387bcc227ad3a8c577abb04383d79812278cc506ebdd18ef88e6affac5570fc8` |
| App | `docs/CATALOG-KNOWLEDGE-EXPANSION-2026-10-01.md` | 2,766 | `a63f089428a1cc2c2ff1b1455b055f386a592d671a5e32e24e2b01937f1f41fe` |
| App | `docs/KNOWLEDGE-REVISIONS-2026-10-01.json` | 10,178 | `4f54ed0cdef7bf9c59501e183f0945d950c76285381946e72dc048197d6becf0` |
| App | `docs/PODCAST-ARCHIVE-PARITY-2026-10-01.json` | 1,432 | `84d4e944ac527ce3f9df7e1d87fed1cba418ac16e7b55cac27b53b6506a96b4d` |
| App evidence | `archive-browser.json` | 353 | `3ff22f42292ae751545ad4fa3a06e7ef90f0e2dab350397b61cbf98c612d8d20` |
| App evidence | `library-browser.json` | 432 | `f03883732e72029bfb5a9b504643cfc2ed320bba71671c4397f399f15f1d08b5` |
| App evidence | `policy-browser.json` | 818 | `295a94a7b792c78d99a8d3caa8dc23f9ce109192718d53880367c845df41cca9` |
| App evidence | `app-archive.png` | 358,633 | `439cf9de7cec1ed245e70fa04dc7a5a6d6939953a48c57408177385e9f3ae218` |
| App evidence | `app-library.png` | 246,800 | `8826a28421ce2a69e254488f936a9947b260536b5acb45b99cef351072c060d0` |

## Coordination and release boundary

- Website work may consume only the exact committed inputs above. It must preserve `editorialStatus=draft`, the original-link-only rights model, archive exclusions, holds, `und` conflict labels, and persistent withdrawals.
- Before website or future App publication, correct the over-broad “primary/self-description” evidence label. This can be an editorial-only follow-up; it does not require changing the 19 substantive term texts.
- The Play Console state is only the supplied read-only snapshot recorded in `docs/PLAY-REVIEW-DIAGNOSIS-2026-10-01.md`: submission 43 under review since 14:25 Singapore time, 41/42 cancelled, 14 changes, no visible policy issue, managed publishing off. This review did not reopen or mutate the console and does not establish approval or live availability.
- The catalog/knowledge candidate is not in signed Code32. No new AAB was built, signed, uploaded, or submitted.

