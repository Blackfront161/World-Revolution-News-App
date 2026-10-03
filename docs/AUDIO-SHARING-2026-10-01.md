# Radios und Podcasts teilen

Die Audio-Karten der aktuellen App und des Classic-Audio-Hubs bieten **Teilen** und **Link kopieren**. Sender ohne direkten Browser-Stream behalten beide Aktionen über ihre Senderseite. Original-Podcasts teilen die konkrete Episodenseite, ersatzweise den Audio-Link. Erzeugte Podcasts teilen den konkreten Audio-Link inklusive Sprach- und Kurz-/Vollversion. Deren bestehende zeitlich begrenzte Verfügbarkeit bleibt gültig.

Die vorhandene Capacitor-Share-Bridge öffnet auf Android den Systemdialog. Im Browser wird Web Share verwendet. Ohne verfügbaren Dialog oder nach einem technischen Fehler folgt der Kopierweg. Ein abgebrochener Dialog kopiert nichts und meldet keinen Erfolg. Bei verweigerter Zwischenablage versucht die App den alten Kopierweg; scheitert auch dieser, erscheint ein beschriftetes, ausgewähltes Linkfeld zum manuellen Kopieren. Alle neun Oberflächensprachen sind vorhanden. Teilen lädt keine Audiodatei herunter und verändert weder Wiedergabe noch Favoriten oder Quellenaufnahmen.

Absolute HTTP(S)-Links werden aus vorhandenen Einträgen gewählt. Relative WebView-/Cache-Links, lokale Loopback-Links, eingebettete Zugangsdaten und andere Protokolle sind keine teilbaren Ziele. Der erzeugte Podcast fällt nicht auf die Artikelseite zurück, weil das eine andere Ressource wäre.

## Prüfung

- Acht gezielte JS-Verträge bestanden: Audio-Sharing, Audio-Hub, Audio-Regionen, News-App-Medien, Generated-Library, atomarer Cache, Next-Update-Integration und Autonom-Verhalten.
- Zehn Python-Vertragsmodule und 37 direkte Funktionsaufrufe bestanden, einschließlich Cache-Diagnose mit `unittest.mock`. Dies war kein pytest-Lauf.
- `tests/validate_app.py` bestanden.
- Isolierter Chrome mit ausschließlich abgefangenen Testdaten: echte Podcast-, Radio- und Generated-Karten; Web Share und gemockte native Bridge; Abbruch ohne Kopieren; Clipboard-Verweigerung und sichtbarer manueller Fallback; Classic-Radio ohne Stream und konkrete Originalfolge; Sprachwechsel; vier Breiten (320, 390, 768, 1440), mindestens 44px hohe Teilen-Schaltflächen und kein Seitenüberlauf. Kein Teilen an Kontakte und keine Audiowiedergabe.
- Browser-Ergebnis und Screenshot: `docs/evidence/audio-sharing-2026-10-01/`.

Der Browser-Test lässt sich mit `WRN_PLAYWRIGHT_MODULE` als absolutem Pfad zur vorhandenen `@playwright/test/index.mjs` und `node tests/browser_audio_sharing.mjs` ausführen. Der VM-Verhaltenstest benötigt nur Node: `node tests/test_audio_sharing.js`.

## Verteilungsstand

Dies ist ein lokaler Folge-Draft: App-Cache **r8**, Preview **v96**, App-JS **54**, CSS **49**, Audio-Tools **2**. Der App-Check und die gegenwärtigen Cache-/Asset-Verträge wurden entsprechend erhöht.

Das bereits akzeptierte Code31-AAB bleibt an Runtime `8d2ef2346a7ce85e1a07904aef90f21b65657408` gebunden und unverändert (SHA-256 `17B0D27E8BFF5913DE4A5A950AF2E19EC50F6D005416511ACBE934C010DE54D7`). Die neue Funktion ist darin nicht enthalten. Nach der Runtime-Abnahme wurde auf ausdrücklichen Nutzerauftrag **Code32** aus `6821a0245b581b0268e5f7fcbb9b2688c7b5a12f` gebaut; dieser neue unsignierte Kandidat enthält Audio-Sharing. Bericht: `RELEASE-CANDIDATE-CODE32-2026-10-01.md`. Prüfung auf einem physischen Gerät, Signierung und Veröffentlichung bleiben offen. Die bestehende Website-Veröffentlichung wurde durch diese Änderung nicht ersetzt.

## Unabhängige Abnahme

WRN Kontrolleur hat Commit `fe2c527f08d4284f4d97b828a74dc9451a25374a` am 2026-10-01 begrenzt auf Audio-Sharing akzeptiert: **PASS**, keine blockierenden P1/P2-Codebefunde. Die acht JS-Verträge, 37 direkten Python-Aufrufe, Validator, Cache-/Asset-Bindungen und Android-SharePlugin-Registrierung wurden unabhängig geprüft; Browserbericht und Screenshot wurden geprüft. Das Code31-AAB wurde erneut als unverändert bestätigt. Der native Systemdialog auf einem physischen Android-Gerät und ein neuer veröffentlichter Build bleiben offen. Nachweis: `docs/evidence/audio-sharing-2026-10-01/controller-acceptance.json`.
