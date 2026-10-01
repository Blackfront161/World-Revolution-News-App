# Release-Kandidat 2.1.2 / Code32

Auf Nutzerauftrag vom 1. Oktober 2026 gebaut und im Folgeauftrag **lokal signiert und geprüft**. Die physische Geräteprüfung und Veröffentlichung stehen weiterhin aus. Die folgende Tabelle dokumentiert die unveränderte unsignierte Eingabe; die signierte Ausgabe ist am Ende dieses Berichts gebunden.

| Bindung | Wert |
| --- | --- |
| Version | 2.1.2 / Code32 |
| Quellcommit | `6821a0245b581b0268e5f7fcbb9b2688c7b5a12f` |
| Audio-Sharing-Abnahme | `fe2c527f08d4284f4d97b828a74dc9451a25374a`, unabhängig PASS |
| AAB | `outputs/audio-sharing-code32/WorldRevolutionNews-2.1.2-code32-6821a02-unsigned.aab` |
| Größe | 43.168.897 Bytes |
| SHA-256 | `2919E8A0C3ADC9DAFB6045184DF4439E22A6CA5B562E34D98907549C142B8C85` |
| Cache | Produktion r8 / Preview v96 |
| Release-Freigabe | `releaseReady: false` |

Die AAB enthält die neue gemeinsame Teilen-/Kopieren-Funktion für Radio, Original-Podcasts und erzeugte Podcasts. Die native Capacitor-Share-Bridge ist im Paket registriert. Autonom und die bisherigen Funktionen bleiben enthalten. Der lokale Lexikon-Nachtrag ist ebenfalls im Quellstand; dessen eigenständige redaktionelle Freigabe bleibt offen. Eine neue RDL-/Podcast-Quellenaufnahme ist durch diesen Build nicht erfolgt.

Die **App-Startseite** übersetzt fremdsprachige Überschriften und Kurztexte automatisch in die gewählte App-Sprache. `ensureHomeTranslations` verwendet den gemeinsamen Übersetzungsclient, begrenzt parallele Anfragen und nutzt gespeicherte Übersetzungen erneut. Bei fehlendem Dienst oder Fehler bleiben Originaltexte stehen. Volltextübersetzung ist eine gesonderte Aktion. Die Aussage betrifft die App, nicht eine neue Funktion der separaten Website. `test_home_translation_layout.js` und `test_shared_translation_client.js` wurden erneut erfolgreich ausgeführt.

## Build und Nachweise

Der vorhandene Build-Weg wurde mit `-Commit 6821a02 -VersionCode 32 -VersionName 2.1.2 -Unsigned -SkipFetch -OfflineGradle` im isolierten `.tmp/autonom-native`-Wrapper verwendet. Der Quellstand wurde als detached Checkout materialisiert. Der Root-Checkout und bestehende AABs wurden nicht überschrieben.

Gradle `lintRelease`, `testReleaseUnitTest` und `bundleRelease` liefen erfolgreich durch (47 Sekunden). Die native Unit-Test-Aufgabe enthält keine eigenständigen Tests (`NO-SOURCE`); sie ersetzt weder die ausgeführten JS-Verhaltenstests noch eine Geräteprüfung. Alle 350 eingebetteten Webdateien stimmen rekursiv mit den Checkout-Bytes überein, sowohl vor dem Build als auch in der AAB. Kein neuer externer Dependency-Download war nötig.

Direkt im ZIP wurden Teilen-Aktionen, Startseitenübersetzung, Produktionscache r8 und SharePlugin geprüft. JAR-Signatureinträge fehlen wie für den unsignierten Kandidaten erwartet. Die native 72×72-Windrose ist nach Dekodierung pixelgleich zum Original und im kompilierten Paket bytegleich zu Code31. Android komprimiert das PNG beim Ressourcenbuild neu: Quell-SHA `78b3dbd6c6de3876c6a15012dd0ea683136ace682382f50036d68d2250d2314f`, Paket-SHA `90775e9dbd7d89fe520c66041d13b101b8d0da2221a5afb47d8656056c6f9a9c`.

Zusätzlich bestanden die bestehenden PowerShell-Prüfungen für sichere Assetübernahme und atomare AAB-/Berichtsausgabe, der App-Validator sowie erneut der Audio-Sharing-Verhaltenstest. Die vorhandenen Browser-/VM-Nachweise für Audio-Sharing bleiben auf ihren geprüften Runtime-Commit bezogen. Der neue AAB-Build allein liefert keine physische Android-Systemdialog-Freigabe.

Nachweise liegen unter `docs/evidence/audio-sharing-2026-10-01/`: `release-report-code32.json`, `release-report-code32.md` und `code32-artifact-check.json`. Der vollständige lokale Build-Log liegt in `.tmp/audio-sharing/code32-build.log`.

Code31 bleibt historisch unverändert an `8d2ef2346a7ce85e1a07904aef90f21b65657408` und seine bisherige SHA gebunden. Nächste Auslieferungsschritte: native Geräteprüfung, erforderliche redaktionelle Freigabe, artefaktgebundene Signierung und gesonderte Veröffentlichung.

## Unabhängige Artefaktabnahme

WRN Kontrolleur hat Code32 am 1. Oktober 2026 im begrenzten Artefaktumfang akzeptiert: **PASS als unsignierter Kandidat**, weiterhin nicht veröffentlichungsfertig. Hash, Größe, alle 796 ZIP-Einträge, fehlende Signaturen, Quell-/Berichtsbindung, zentrale eingebettete Runtime-Dateien und Pins, SharePlugin sowie Original-Windrosenpixel wurden unabhängig geprüft. Beide Übersetzungstests wurden unabhängig erneut bestanden. Bericht: `code32-controller-acceptance.json` im Nachweisordner. Der Kontrolleur behauptet keinen unabhängigen Protobuf-Manifestdump. Root hat zusätzlich die Paket-/Versionsattribute direkt aus dem AAB-Protobuf gelesen: `com.world.revolution`, `2.1.2`, `32`; dieser gesonderte Check steht in `code32-artifact-check.json`.

## Android-Prüfung und Signiervorbereitung

Auf den Folgeauftrag „ok mache das“ wurde derselbe Quellcommit erneut gebaut. Die zweite AAB in `outputs/audio-sharing-code32-repro/` ist byteidentisch: SHA-256 `2919E8A0C3ADC9DAFB6045184DF4439E22A6CA5B562E34D98907549C142B8C85`. Der Build nutzt vorhandene Gradle-Caches; dies ist kein Nachweis eines Builds mit leerem Cache.

Ein eigener API36-Emulator prüfte eine separate Debug-App `com.world.revolution.autonomtest`. INTERNET wurde aus deren Manifest entfernt. Alle 352 Webasset-Einträge einschließlich der zwei Capacitor-Dateien stimmen bytegenau mit der Produktions-AAB überein. Der private Teilen-Empfänger existiert ausschließlich in der QA-APK; die Produktions-AAB enthält ihn nicht.

Sieben Instrumentation-Tests bestanden: Code31 vorbereiten, Upgrade auf Code32 mit erhaltenen Favoriten/Einstellungen, echter Android-Teilen-Dialog für Senderseite/Originalepisode/erzeugtes Audio, Kopieren per echtem Touch mit unverändertem Linkschlüssel, Abbruch ohne Clipboardänderung, gespeicherter Volltext offline nach Activity-Neustart und derselbe Volltext nach `force-stop` ohne erneute Dateneinspeisung. Die Teilen-Tests verwenden synthetische Einträge mit dem Produktionshelper und der echten Capacitor-Bridge; das Ziel ist ausschließlich der private QA-Empfänger. Ein initiales Fixture wurde von einer Startseitenaktualisierung entfernt; außerdem benötigt Clipboard-Zugriff echte Nutzeraktivierung. Beide Testaufbaufehler wurden in den QA-Tests korrigiert, ohne die Kandidaten-Runtime zu ändern. Nachweise: `code32-android-emulator.json` und fünf zugehörige Testlogs im Nachweisordner.

Der neue GUI-Signer `scripts/sign-google-play-aab-2.1.2-code32-6821a02-gui.ps1` bindet beide AABs, deren Berichte, Quellcommit, Version, 350 Quell-Webassets, 796 Payload-Einträge und das vorhandene Upload-Zertifikat. Der Kontrolleur hat Skript und schreibfreien `-PreflightOnly` unabhängig mit PASS akzeptiert (`code32-signer-controller-acceptance.json`, `code32-signer-preflight.json`). Nach lokaler Passworteingabe wurden AAB/Bericht atomar erzeugt. Root prüfte die fertige Datei anschließend erneut ohne Keystore-Zugriff: JAR-Signatur gültig, erwartetes Zertifikat und sämtliche Payload-/Webasset-Bytes unverändert.

| Signierte Ausgabe | Wert |
| --- | --- |
| Datei | `outputs/audio-sharing-code32/WorldRevolutionNews-2.1.2-code32-6821a02-signed.aab` |
| Größe | 43.275.817 Bytes |
| SHA-256 | `66D6D96D6234FA7D390EDD58A3640602187ECFBFEAFAA8AF8A4D72D982F7975A` |
| Zertifikat SHA-256 | `7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8` |
| Signaturbericht | `code32-signature-report.json` im Nachweisordner |
| Erneute Root-Prüfung | `code32-signed-root-verification.json` im Nachweisordner |

Physische Geräteprüfung, redaktionelle Lexikon-Freigabe und gesonderte Veröffentlichung bleiben offen. `releaseReady` bleibt `false`. Die Emulatorprüfung ist keine Abnahme einer physischen Produktionsinstallation; es wurde nichts hochgeladen.

Der Kontrolleur prüfte anschließend auch die fertige signierte AAB unabhängig mit **PASS als lokal signierter Kandidat**: echter JAR-/Zertifikatcheck und vollständiger Vergleich aller 796 Payload-Einträge sowie 350 Quell-Webassets ohne Differenzen. Der Signaturbericht und sämtliche Hash-/Versionsbindungen stimmen überein. Nachweis: `code32-signed-controller-acceptance.json`. Diese Abnahme erteilt keine Play-Freigabe.
