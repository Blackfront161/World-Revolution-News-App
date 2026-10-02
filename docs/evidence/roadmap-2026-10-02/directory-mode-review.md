# Independent directory-mode supplement

Disposition: **PASS** for the two-field source-directory correction reviewed on 2026-10-02.

The Data diff changes only `importMode` from `disabled` to `directory-only` for `https://autonome-antifa.org/` and `https://www.antifa-frankfurt.org/`. The regenerated `sources-registry.json` changes the same two fields and its generation timestamp. Stable IDs, URLs, status, active flags, attribution and rights notes are unchanged; the registry retains 433 sources / 431 active sources.

Both records retain `status:directory-only`, `action:register_only`, and `adapter:directory`. Generated records retain `active:false`. `build_sources_registry.py` explicitly computes directory-only status as inactive. `merge_multilingual_sources.py` admits only `kind:news`, `status:approved`, `adapter:rss` into the generated collector block; neither directory record meets that predicate. Their names/domains are absent from the actual `aggregate.py` and `podcast-sources.json`. The import-mode display correction therefore admits no new news or podcast collection and grants no media/body rights.

This supplement reviews configuration display and collector exclusion; it preserves the earlier source judgments and does not make a new publisher identity or episode-language verification claim. Root remains sole product writer.

Reviewed Data file SHA-256:

| File | SHA-256 |
| --- | --- |
| multilingual-source-registry.json | fdc203c0e386fad9a855d0fc87f74ff5ac0f0df5bacca6f022d5882161ccb928 |
| sources-registry.json | 5a926121e875073d4985d497173cffbeb71b850647fe3160a5dc37bee8d4f108 |
| merge_multilingual_sources.py | 4bbe55e0d90088c60cc1946b4cac618d5dcbcafaa6fd29451e1cf3d752f2b0a4 |
| aggregate.py | cb0c6610bfbc0bf13034b18fab6526179568a6572b55ccd77acecdd0d5efc0be |
| build_sources_registry.py | 97ad2be26d7e010833a32309d0f10bb7fe90ae2c03f33eb52393cf68f592ed1f |

No findings remain in this scoped change.
