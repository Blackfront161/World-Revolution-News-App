# Strict health correction

Product `e9c8088806f60ad8b9605705f686cc91f2536f90`, correcting99bb9cc. Review pending; no deployment.

Independent follow-up found that missing cache enabled/healthy or proxy healthy fields were treated as confirmed. The client now requires all six booleans exactlytrue: cache.ok, cache.enabled, cache.healthy, translation.ok, translation.enabled, translation.healthy. No older or malformed200 response is treated as confirmed availability. UI continues to use translationAvailable strictly.

Ten client partial-failure cases include four missing-field combinations. Real Chrome8-check navigation report now includes both cache and proxy missing-health responses, returning system-warning/Offline. Explicit healthy fixture responses remain system-ok in nine UI languages.39 Pythonassettests and current-candidate/cachepin contract PASS. Worker sources are byte-identical to99bb9cc and retain their30-test PASS and corrected cache dryrun22.54KiB. Radio, knowledge and sharing sources are unchanged. Cachepins nowr27/v115; App71/client8/legacyalias13.

Read-only live configuration comparison confirms all declared vars already match both Workers; extra proxy GEMINI_MODEL remains preserved through--keep-vars. Existing target versions are bound in live-config-comparison.json. No secret values were printed or retained. No model/configuration/quotaguard/native/store update is added.

This closes the missing-field implementation gap; final independent acceptance is still required. Earlier FAIL reports remain historical; this report does not grant deployment or a complete platform/native PASS.
