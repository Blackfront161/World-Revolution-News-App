# WRN Code 33 – finale unabhängige App-/AAB-/Signer-Abnahme

Datum: 2. Oktober 2026  
Prüfmodus: read-only; keine Signierung, kein Upload, kein Deployment  
Ergebnis: **PASS – maximal verifizierter unsigned Release Candidate**

## 1. Verbindlicher Freeze

- Repository: `C:\Users\patri\Documents\World Rev Ne\wrn-github-app-current`
- Finaler Commit: `fb937dd73355b9bb6f037c2b0e547da9cdb6bbaf`
- Produktfix: `396a798`
- Nachfolgender Freeze-Commit ergänzt ausschließlich die geprüfte `ROADMAP.json`-Metadatenverifikation.
- Der frühere Stand `5d5b62315e4db1f8c847d99b94b933582a6f0e7b`, seine AAB mit SHA-256 `26A205B5…` und sein Signer bleiben gesperrter historischer Zwischenstand.

Der aktuelle Arbeitsbaum enthält nach dem Freeze bewusst nachgelagerte QA-Evidence, einen modifizierten Android-QA-Test und den ungetrackten finalen Signer. Diese Dateien sind nicht Bestandteil des eingefrorenen Produktcommits und nicht in die AAB-Provenienz eingerechnet.

## 2. Behobener Browserfehler

Der reale Fehler im Audio-Verzeichnis ist geschlossen:

- Der Verzeichnisblock wurde aus `renderVideoSection` entfernt.
- Er befindet sich jetzt in `renderMedia`, unmittelbar nach den Medientabs.
- Dort wird die gültige lokale Variable `section = state.media.section` verwendet.
- In `renderVideoSection` verbleibt kein Zugriff auf die dort undefinierte Variable `section`.
- Verzeichnisse werden nur in `podcasts` und `radio-podcasts` angezeigt.
- Externe Links verwenden `target="_blank"`, `rel="noopener noreferrer"` und `referrerpolicy="no-referrer"`.

Auslieferungsvertrag:

- `news-app-2.js?release=59`
- Produktionscache `wrn-app-v2.1.2-r13`
- Previewcache `wrn-news-app-2-v101`
- `app-check.html` erwartet ebenfalls `r13`
- Produktions- und Preview-Worker referenzieren JavaScript-Revision 59

Gegen die gesperrte AAB `5d5b623` unterscheiden sich genau sechs Webdateien:

- `ROADMAP.json`
- `app-check.html`
- `index.html`
- `news-app-2-sw.js`
- `news-app-2.js`
- `service-worker.js`

Alle 444 nativen AAB-Dateien außerhalb von `base/assets/public/` sind bytegleich mit dem bereits unabhängig dekodierten Vorgänger; insbesondere ist `base/manifest/AndroidManifest.xml` bytegleich.

## 3. Reproduzierbare unsigned AABs

Geprüfte Dateien:

- `outputs/roadmap-code33-release/build1/WorldRevolutionNews-2.1.2-code33-fb937dd-unsigned.aab`
- `outputs/roadmap-code33-release/build2/WorldRevolutionNews-2.1.2-code33-fb937dd-unsigned.aab`

Ergebnis:

- Größe jeweils: **44.335.811 Byte**
- SHA-256 jeweils: `A55A3E13AFF32A07D1692B1F6937E1E4F59C4846D990AE191A24F66E53EC385E`
- 802 Datei-/Payload-Einträge je AAB
- Build 1 gegen Build 2: 0 Pfad-, Größen-, CRC- oder SHA-Abweichungen
- 0 Signatur-Einträge
- 356 gebundene Quell-Webassets
- Zusätzlich zwei erwartete, beim Capacitor-Sync generierte Webassets: `cordova.js` und `cordova_plugins.js`
- Damit befinden sich 358 tatsächliche Dateien unter `base/assets/public/`; die Signerzahl 356 bezeichnet korrekt die Quellassets und schließt die beiden generierten Cordova-Dateien aus.

Ein frischer, sauberer Checkout des exakten Commits wurde gegen den AAB-Inhalt geprüft:

- Checkout-HEAD exakt `fb937dd73355b9bb6f037c2b0e547da9cdb6bbaf`
- sauberer Checkout
- alle 356 Quell-Webassets bytes- und hashgleich
- 0 Byteabweichungen
- ausschließlich die zwei erwarteten generierten Cordova-Dateien besitzen keine direkte Quelldatei im Checkout

Manifestvertrag, aufgrund bytegleichen binären Manifests weiterhin gültig:

- Paket `com.world.revolution`
- `versionCode=33`
- `versionName=2.1.2`
- `minSdkVersion=24`
- `targetSdkVersion=36`
- Compile SDK 36
- `allowBackup=false`
- `fullBackupContent=false`
- `usesCleartextTraffic=false`
- `FileProvider` nicht exportiert

## 4. Provenienzberichte

- Build-1-Bericht: `outputs/roadmap-code33-release/build1/release-report-code33.json`
- SHA-256: `05E83B376C5C1ECBF26687F3D9311F1D0CE83018F106E6C5265569E1666A1F06`
- Build-2-Bericht: `outputs/roadmap-code33-release/build2/release-report-code33.json`
- SHA-256: `B99A493B1841B79B2B5EDD0799FFE0395EECEFDF83250975F4B3ECAA02C970CE`

Beide Berichte bestätigen:

- angeforderter, aufgelöster und Quell-HEAD-Commit exakt `fb937dd…`
- sauberer Commit-Checkout
- Version 2.1.2 / Code 33
- 356 Quelldateien
- keine Pre-Build- oder Packaged-Differenzen
- korrekte AAB-Pfade und SHA-256
- `signatureVerified=false`, `releaseReady=false`
- Status `passed`

## 5. Browser-, Vertrags- und Auditnachweise

Browserintegration `.tmp/roadmap-20261002/audio-browser.log`: PASS.

Abgedeckt wurden:

- tatsächliche Audio-Hauptansicht
- Original-Podcast und Free-Radio-Podcast
- Radio ohne direkten Stream
- generierter Podcast
- Web Share und Capacitor Share
- Copy, Cancel und manueller Fallback
- Classic Audio-Hub
- Deutsch/Französisch
- 320, 390, 768 und 1440 Pixel
- sichtbare Ziele mindestens 44 Pixel
- kein horizontaler Overflow
- keine Page Errors

Wissensbrowser `docs/evidence/roadmap-2026-10-02/browser-result.json`: PASS.

- 9 Sprachen
- 4 Breiten
- 30 Buchlinks
- 7 Podcastlinks
- Autonom-Theme und Französisch
- keine Page Errors
- zwei Screenshot-Hashes im JSON gebunden

Finale native Wiederholung für den tatsächlichen Freeze `fb937dd`: PASS.

- reale Code-32→Code-33-Folge mit UI-basierter Seed-Phase: 1 Seed-Test und 1 Upgrade-Test PASS
- Prozessneustart mit Offline-Wissen und Audio-Sharing: 4 Tests PASS
- tatsächlicher Medieneinstieg sowie beide Original-Audioverzeichnisse geprüft
- QA-only-Änderung an `tests/android/RoadmapKnowledgeInstrumentedTest.java` erfolgte nach dem Freeze und verändert die AAB nicht
- Logs:
  - `.tmp/roadmap-20261002/release-upgrade-seed32.log`
  - `.tmp/roadmap-20261002/release-upgrade-verify.log`
  - `.tmp/roadmap-20261002/release-native.log`

Unabhängig erneut ausgeführt und bestanden:

- 54/54 JavaScript-Vertragstests
- `tests/test_audio_sharing.js`
- `tests/test_fast_start_atomic_cache.js`
- `tests/test_next_update_candidate.js`
- `tests/validate_app.py`
- `tests/test_news_app_2_assets.py`
- `release_audit_183.py --no-write`: 161 PASS, 0 Warnungen, 0 Fehler

Der eingefrorene vollständige Matrixnachweis enthält 151 bestandene Python-Tests, 3 dokumentierte historische Skips und 4 bestandene Main-only-Skripte. Ein zusätzlicher Controllerlauf erreichte 144 bestandene Python-Tests; sieben Setups wurden ausschließlich durch einen fremdbesitzten globalen Pytest-Tempordner blockiert, nicht durch fehlgeschlagene Assertions. Ein weiterer isolierter Versuch konnte wegen einer abweichenden lokalen Pytest-Modulauflösung nicht maschinenlesbar sammeln. Diese beiden lokalen Umgebungsgrenzen ändern den vorhandenen vollständigen PASS-Nachweis nicht; sie werden ausdrücklich nicht als Produktfehler dargestellt.

## 6. Finaler Signer

Signer:

`scripts/sign-google-play-aab-2.1.2-code33-fb937dd-gui.ps1`

Bindungen:

- Signer SHA-256: `B91DAFA1C4CC5FFCCAF8DADBFFFE4E001F4F865308669E0ECB9A794832414B67`
- Preflight-JSON SHA-256: `6D79E952A7D61D3EBC6679BD336FDEB01B021F9B2D77F9BB04F365A787808E6D`
- Helper SHA-256: `C8AA22BDADD02022975D9B9A21BB806D60BD936A0C896054E488400F2E76AEFB`
- erwartete AAB SHA-256: `A55A3E13AFF32A07D1692B1F6937E1E4F59C4846D990AE191A24F66E53EC385E`
- erwartetes Zertifikat: `7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8`
- Alias: `WRN_KEY`

Ergebnisse:

- PowerShell-Parser: 0 Fehler
- `-PreflightOnly`: PASS
- AAB-, Peer-AAB-, Berichts-, Commit-, Versions-, Asset-, Payload-, Helper-, Alias- und Zertifikatsbindungen fail-closed
- beide Eingaben müssen unsigned und bytegleich sein
- vorhandene signierte Ausgabe oder vorhandener Signaturbericht blockiert statt überschrieben
- geerbte Passwortvariablen werden vor Benutzung gelöscht
- Passwörter werden ausschließlich im lokalen GUI übernommen und in `finally` sowie beim Schließen gelöscht
- kein Uploadpfad implementiert; `uploadPerformed=false`
- Preflight erzeugte weder signierte AAB noch Signaturbericht

Codex-Security-Diffscan:

- Scan-ID `f7c1ac3a-e686-4283-87b4-86348d96adc3`
- vollständige Abdeckung des einzigen geänderten Signers
- 0 Befunde

## 7. Entscheidung und Restgates

**PASS – `fb937dd` mit AAB SHA-256 `A55A3E13…` ist der maximal verifizierte unsigned Release Candidate.**

Vor einer Veröffentlichung bleiben zwingend:

1. ausdrückliche Nutzerfreigabe zur lokalen Signierung;
2. Passwort-/Keystore-Schritt mit dem gebundenen Alias und Zertifikat;
3. unabhängige Nachprüfung der erzeugten signierten AAB einschließlich SHA, ZIP/CRC, Signatur, Zertifikatsfingerprint, Manifest und Webassets;
4. gesonderte ausdrückliche Nutzerfreigabe für den Upload zur Play Console;
5. keine Vermischung mit dem gesperrten Kandidaten `5d5b623`.

Die Website-Freigabe `7533fe1d487ccf702428485d7d104035271ec9e4` bleibt eine separat geprüfte, historische inhaltliche Basis, ist aber **nicht mehr der zu deployende Website-Kandidat**. Ein direkter neuerer Website-Auftrag hat Inhaltsparität, Layout sowie Website-/Hostinger-Besitz übernommen und benötigt eine eigene Abschlussabnahme. `7533fe1` darf nicht parallel deployed werden. Zum Zeitpunkt dieser App-Abnahme war kein Website-Upload erfolgt.

## 8. Unveränderlichkeitsvermerk

Während dieser unabhängigen Abnahme wurden keine Produktdateien geändert, keine AAB signiert, keine Dateien hochgeladen und nichts deployed. Temporäre Controller-Testverzeichnisse wurden außerhalb des Produktrepositories angelegt und nach dem Test entfernt. Der aktuelle Produkt-Freeze und die beiden AABs blieben unverändert.
