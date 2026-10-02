# Independent exact-code review

Controller thread 019ff285-63dc-7ed2-88a8-cab5f06ed26e, received 2026-10-02.
Exact code commit: 3a429a8d3b732793118859afeb8bd62a5f089f65. Result PASS; all three original findings FIXED. Descends from examined e9ee202; working tree clean before/after review.

- occ_ab5ca8bbb3ca03da4b8f1e8f: actual body bytes capped, stream cancelled, JSON parsed only after size acceptance, handler413; missing/false/chunked lengths, UTF-8 and exact40000 boundary passed.
- occ_e3bf41e7dbffacf77d09807b: fixed provider hosts with HTTPS/port/userinfo/fragment restrictions and revalidation of legacy endpoints before send. Accepted real provider hosts; rejected localhost/IP/private/link-local/IPv6/userinfo/suffix/trailing-dot. Current web-push send path does not follow redirects.
- occ_4002e5e5c7716f38e0b3053c: synchronous transaction caps total10000/client50, edge identity required, forwarded/custom/body IDs ignored, stable owner,180day pruning, complete keyset pages250. Actual2602row test reached older recipient; unsafe legacy row removed.

Controller ran19/19 Cloudflare tests, syntax checks and feedback contract; evidence hashes matched. Preserved raw CRLF/trailing whitespace in diagnostic logs is not a code or release blocker. Exact code commit approved for publication with --keep-vars, followed by health/CORS/body-limit/translation/cache/push-config smoke. No real push broadcast.

Additional root local DO runtime proof is separately bound: real SQLite storage/RPC,60 concurrent registrations yielded50 accepted/10 rejected. Fixture uses installed workerd's maximum2026-07-29; production compatibility2026-08-05 unchanged.
