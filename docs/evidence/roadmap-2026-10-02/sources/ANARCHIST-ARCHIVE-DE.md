# Focused German catalogue review — 2 October 2026

**13 metadata-only title/original-link listings recommended; ten remain pending context/content review.** Exact proposed IDs, titles and original URLs are in `anarchist-archive-de-dispositions.json`. This is a deliberately limited catalogue proposal, not approval of full texts, media, copied excerpts, licence claims, publisher allegations or claims made inside the texts.

The official [German RSS](https://anarchist-archive.org/feed/rss.de.xml) supplies 23 titles and explicit HTTPS original-page GUIDs. All 23 were requested directly with TLS verification, 1 MB cap, 20-second timeout and four workers. All returned 200 at their exact requested URLs, without credential-bearing URLs or redirects; titles match the source feed. No `rel=canonical` was observed. Original availability is verified, not a publisher canonical tag. No article body or media was persisted. Evidence includes response hashes and minimal headings/context indicators.

Stable proposed ID formula: `anarchist-archive-` plus the first 24 hex characters of SHA256 of the **exact source-provided original URL**, preserving percent encoding. No existing source ID change. Root must check original-title identity against accepted catalogue to avoid duplicate works.

The source declares German by feed choice and `/library/de/` namespace. All original pages use `html lang=en`, apparently the site/template language; this does not make the German catalogue entries verified English or verified German. Use declared German and `languageVerified=false`, not a verified translation badge. `authors=[]` intentionally remains unknown; no author inferred from slug. The RSS contains no publication dates, so `published=null`. Product `updatedAt` means the WRN refresh date only. Retain no copied descriptions/body/artwork, no download fields and no offline document availability. `formats=['html']` means the observed original web page, not an admitted readable document body.

## Recommended factual metadata listings

- Gegen die Logik der Guillotine
- Das Subalterne ist verdammt noch mal am sprechen!
- Archipel
- Nazis of Color
- Ein nicht-binäres Zine
- Nähe gesucht
- Stop FLINTA Bullshit, Destroy All Binaries!
- ACSD 2022
- Über das Phänomen unsinniger Jobs
- Seht es ein!
- Was, Sexismus ir Szenä?!
- Kill the Couple in Your Head
- Geschichte der Auswirkungen von Postones Thesen in der radikalen Linken und These für neue Taktik gegen den Rechtsruck

These are source titles displayed as factual catalogue records with attribution/original link, not WRN endorsements, factual verification of an article's claims, current-event entries or operating guidance. Topic arrays remain empty rather than manufacturing classifications from an ambiguous title. Metaphorical rhetoric or a critical reference to recruitment is not classified as violent instruction or recruitment advocacy merely by a keyword.

## Pending titles

The ten pending records and per-title reasons are preserved in the JSON. They concern unresolved action/claim-letter context, ambiguous case/accountability claims, a health allegation about an identifiable historical event, practical-action framing, insurrectional organising/violent-confrontation context, perpetrator-support case/privacy handling, sparse prison-publication metadata, security-culture/privacy context, pandemic-practice claims and contemporary conflict context. These are **review requirements, not allegations against publishers or an assertion that these texts contain prohibited material**. Original pages remain source evidence; pending records must not automatically enter the public metadata catalogue in this batch.

No full-text snippets, authors, personal addresses, download links, publication dates or unverified claims were admitted. No media files were followed. A policy/content final check must bind Root's actual adapter output, especially metadata-only rights, date semantics, duplicate identity and declared-language display.
