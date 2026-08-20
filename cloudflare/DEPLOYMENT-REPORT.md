# Cloudflare-Schutzprüfung vom 27. Juli 2026

## Ergebnis

Beide produktiven Worker wurden mit einem mehrstufigen Kostenschutz
veröffentlicht. Das Cloudflare-Konto verwendet den Workers-Free-Tarif. Dessen
Plattformgrenzen laufen fail-closed; bei Erreichen der kostenlosen Grenzen
entstehen dadurch keine automatischen Workers-Request-Überkosten.

## Aktive Versionen und Rollback

| Worker | Aktive Version | Vorherige Rollback-Version |
| --- | --- | --- |
| `revolution-proxy` | `b93b551d-1993-4fc8-9958-61f7971d5bd3` | `24462deb-b226-4c45-98e4-ba8e0526f17a` |
| `wrn-translation-cache` | `a49dd758-b1d6-4100-af20-3f94c50fc8c8` | `d7603167-84c7-47ae-af52-d453686e7bc3` |

## Aktive Schutzgrenzen

- maximal 950 neue Übersetzungsanfragen pro UTC-Tag;
- maximal 950 persistente KV-Schreibvorgänge pro UTC-Tag;
- maximal 475.000 Azure-Speech-Zeichen pro UTC-Kalendermonat;
- maximal 9 GiB Podcast-Speicher pro UTC-Kalendermonat;
- maximal 20 Proxy-Übersetzungen pro Client/IP und Minute;
- maximal 2 Podcast-Erzeugungen pro Client/IP und Minute;
- maximal 60 Cache-Anfragen pro Client/IP und Minute;
- neue kostenrelevante Arbeit wird blockiert, wenn der Quota-Guard nicht
  erreichbar ist;
- tägliche und monatliche Sperren werden im nächsten UTC-Zeitfenster
  automatisch aufgehoben;
- die manuellen Notschalter `WRN_TRANSLATION_ENABLED` und
  `WRN_PODCAST_GENERATION_ENABLED` bleiben verfügbar;
- versionsspezifische Vorschau-URLs sind deaktiviert.

## Speicher und Bindings

- R2-Bucket: `worldrevnews-podcasts`;
- Podcastdateien unter `podcasts/` verfallen nach 30 Tagen;
- unvollständige Multipart-Uploads werden nach 7 Tagen abgebrochen;
- öffentliche R2-Entwicklungs-URL ist deaktiviert;
- vorhandene Azure-, Gemini- und Hugging-Face-Secrets wurden beim Deployment
  erhalten und nicht in das Repository geschrieben;
- der Übersetzungs-Cache verwendet die bestehende KV-Namespace-ID;
- der Cache ruft den Proxy intern über ein Service Binding auf.

## Live-Prüfung

- Proxy-Status: HTTP 200;
- Cache-Health: HTTP 200;
- Android-CORS (`capacitor://localhost`): HTTP 204;
- fremde Origin: HTTP 403;
- erster kurzer Übersetzungstest: `MISS`, erfolgreich in KV gespeichert;
- identischer Folgeaufruf: `HIT`, keine erneute KI-Anfrage;
- Podcast-Status: natürliche Azure-Stimmen verfügbar;
- sechs automatisierte Quota-Tests bestanden;
- beide Wrangler-Dry-Runs und alle JavaScript-Syntaxprüfungen bestanden.

## Wichtiger Betriebs-Hinweis

Cloudflare-Budgetwarnungen sind nur Benachrichtigungen und kein Abschalter.
Der Workers-Free-Tarif sollte deshalb beibehalten werden. Ein späterer Wechsel
auf einen kostenpflichtigen Workers-Tarif darf erst nach einer neuen Prüfung
erfolgen, weil dort Worker-Anfragen über das Inklusivvolumen hinaus berechnet
werden können. Die eingebauten Quoten schützen weiterhin Gemini, Azure, KV und
R2, können aber eine bereits bei Cloudflare eingegangene Worker-Anfrage nicht
rückwirkend ungeschehen machen.
