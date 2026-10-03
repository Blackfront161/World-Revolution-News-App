# Autonom: Code31-Build und isolierte Android-Abnahme

Produktions-Webstand: `8d2ef2346a7ce85e1a07904aef90f21b65657408`.
Kanonisches Quellenpaket: `17b3604979a27411666048c082345b704261af93`.
Dieser spätere Nachweiscommit ändert weder Runtime noch Inhalt der AAB.
Der Export packt auch die ungenutzte Root-Metadatendatei `ROADMAP.json`:
Code31 enthält deren Fassung aus `8d2ef23`. Die später nachgeführte Repository-
Roadmap gehört nicht nachträglich zur AAB. Es wird keine vollständige
Webasset-Bytegleichheit mit einem späteren Dokumentations-HEAD behauptet;
der Buildbericht bleibt ausdrücklich an `8d2ef23` gebunden.

## Unsignierter Build

2.1.2 / Code31, `outputs/autonom-code31/WorldRevolutionNews-2.1.2-code31-8d2ef23-unsigned.aab`.
SHA-256: `17B0D27E8BFF5913DE4A5A950AF2E19EC50F6D005416511ACBE934C010DE54D7`.
`lintRelease`, `testReleaseUnitTest` und `bundleRelease` erfolgreich; unveränderte
Gradle-Prüfungen konnten auf vorhandene gültige Taskoutputs zurückgreifen.
350 Webdateien, keine Abweichungen vor dem Build oder in der AAB gegen den
detached Commit-Checkout nach Git-Filter-/Zeilenendennormalisierung.
Die unabhängige ZIP-/Hashprüfung bestätigte die gepackten Inhalte.

Belegkopien: `evidence/autonom-2026-09-30/release-report-code31.json` und `.md`.
`signatureVerified: false`, `releaseReady: false`; kein Store- oder Signaturnachweis.
Die Wrapperquelle bleibt auf ihrer Code29-Baseline; Code31 wurde ausdrücklich
als Buildparameter gesetzt. Code30 bleibt historischer Zwischenkandidat.

## Tatsächliche Emulatorprüfung

WRN_API36_Play / Android API36. Vorhandene Nutzer-App `com.world.revolution`
bleibt Code27/2.2.0; keine Deinstallation oder Datenänderung dieses Pakets.
Die eigene Test-App heißt `WRN Autonom Test`, Paket `com.world.revolution.autonomtest`.
Testzertifikat SHA-256: `c257570904bc86860db675e539b628067f06bc16ac3674972e51ecaeed8facff`.
Es ist kein Produktionszertifikat.

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Vorversion Code29 aus verifizierten `8e95685`-Webassets; realen Artikel und OLED/Groß/Kompakt vorbereiten | OK (1 test) |
| `adb install -r` auf Code31; Einstellungen/Lesezeichen bytegleich; Autonom wählen und Activity/WebView erneut starten | OK (1 test) |
| QA-Variante mit entferntem INTERNET-Recht: gespeicherter vollständiger LabourNet-Reader (>2000 Zeichen) nach Activity-Neustart; echte Android-Systempräferenz und CSS ohne Glow/verkürzte Übergänge | OK (2 tests) |
| `am force-stop` nur der Test-App; anschließender Offline-Neustart/Reader | OK (1 test) |

Belege im gleichen Ordner: `android-code31-seed.txt`, `android-code31-upgrade.txt`,
`android-code31-offline-motion.txt`, `android-code31-offline-process.txt`.
Die Testmethoden stehen in `AutonomUpgradeInstrumentedTest.java` im Wrapper-
Testverzeichnis sowie `tests/android/AutonomOfflineMotionInstrumentedTest.java`.

Nur die isolierte Debugvariante entfernt INTERNET über ihren Debug-Manifestoverlay;
normaler Wrapper, Release-AAB, Host und andere Apps behalten ihre Netzkonfiguration.
Der ursprüngliche globale Emulatorwert `animator_duration_scale=null` wurde jeweils
nach der Prüfung per `finally` wiederhergestellt. Die Test-App ist am Namen erkennbar.

Grenzen: Debugzertifikat und abweichende Testpaketkennung prüfen das Upgradeverhalten,
keinen Updatepfad der produktiv signierten Nutzerinstallation. Kein physisches Gerät
geprüft; kein vollständiger Netzausfall des Produktionsbrowsers erzwungen. Übersetzungen
und externe Player werden nicht als offline verfügbar behauptet. Signierung,
Produktionszertifikat, Play-Annahme und Veröffentlichung bleiben getrennte Gates.

## Wiederholung

Die ignorierten Test-APKs liegen unter `outputs/autonom-upgrade-tests`. Zuerst
die isolierte Code29-APK und das Code31-Instrumentationspaket installieren, nur
`seedPreviousVersion` mit `wrnIsolatedUpgradeTest=true` ausführen; dann Code31
per `install -r` aktualisieren und nur `verifyUpgradeAndAutonomPersistence` mit
`wrnExpectedVersionCode=31` ausführen. Die Vorversionsphase schreibt Testdaten
und darf ausschließlich im isolierten Testpaket laufen.

Für die Zusatz-QA die Offline-Testquelle in die isolierte Wrapperkopie übernehmen,
das Debugmanifest um `uses-permission INTERNET tools:node="remove"` ergänzen und
unter derselben Testpaketkennung neu bauen. `AutonomOfflineMotionInstrumentedTest`
mit der temporären Emulatorpräferenz ausführen und deren Ausgangswert wiederherstellen.
Nach einem Stop ausschließlich der Test-App den Offline-Test einzeln wiederholen.
