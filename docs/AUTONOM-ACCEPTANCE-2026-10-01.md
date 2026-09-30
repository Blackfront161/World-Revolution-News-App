# Autonom: Browser, Quellen und Android-Kandidat

Fortsetzung des vom Nutzer beauftragten Pakets, Ausgangsstand `0b315a6`.
Die vorherigen Pakete `0c8aa3d` und `0b315a6` wurden unabhängig akzeptiert.
Neue Änderungen und deren Abnahme werden davon getrennt nachgewiesen.

## Umsetzung

- Autonom bleibt ausdrücklich wählbar; weitere Designs bleiben erhalten.
- Ein realer langer spanischer Titel lief bei großer Schrift über seine Breite.
  Serifentitel bekommen jetzt `overflow-wrap: anywhere`.
- Quellenprofile hatten keinen Escape-/Tab-Handler und keinen verlässlichen
  Rückkehrfokus. Der tatsächliche Handler schließt mit Escape, begrenzt Tab und
  Shift+Tab auf die Profilaktionen und fokussiert anschließend den Aufrufer.
- Bei reduzierter Bewegung werden neben Animationen auch Übergänge verkürzt;
  der rote aktive Themenchip besitzt dann keinen Leuchteffekt.
- Der Kontrolleur fand zusätzlich im ausgelieferten Classic-Pfad einen echten
  Integrationsfehler: `closeAllModals()` schließt selbst das Quellenprofil und
  löschte den zu früh global gespeicherten Aufrufer. Der Aufrufer wird jetzt
  vor dem Laden lokal erfasst und erst nach dem gemeinsamen Schließen global
  gespeichert. Der Test führt die tatsächliche Classic-Funktion aus `app.js`
  aus und prüft zusätzlich die neue App ohne diese Funktion.
- Classic-Karten übernehmen Enter/Leertaste nur bei Fokus auf der Karte selbst;
  eingebettete Quellenschaltflächen und Links behalten ihre native Aktion.
  Das Profil setzt zusätzlich den von Classic-CSS benötigten Displayzustand und
  benutzt dort die vorhandene Fokusverwaltung vor deren asynchronem Observer.
  Ein echter Browserlauf bestätigt: Enter öffnet nur das Profil, Escape verbirgt
  es und gibt Fokus an LabourNet DE zurück; kein Artikeldetail öffnet sich.
  Beleg: `classic-profile-browser.json` im Belegordner.
- CSS48, Quellenprofile4, Haupt-App-JS53; App-Cache `wrn-app-v2.1.2-r7`,
  alternativer Worker v95. Daten-Cache r1 bleibt unverändert. Das Classic-
  Navigationsmodul verwendet konsistent `navigation-recovery-11` im Loader
  und Produktionsworker.

## Browserbelege

`tests/browser_autonom_acceptance.cua.mjs` ist mit den dokumentierten Codex-CUA-
Browsermethoden wiederholbar. Zwölf tatsächliche Browserprüfungen bestanden:
Tastaturauswahl, sichtbarer Fokus, Escape-Rückkehr, 200-%-Schrift bei 320/390/768/
1440 Pixeln ohne horizontales Überlaufen oder beschnittene Titel, Designrückwechsel,
Persistenz nach Reload, Themenfilter, Reader und Quellenprofil einschließlich
Escape und Rückkehrfokus. Der Reader-Test prüft das Öffnen; das Laden eines
gespeicherten Volltextes wird getrennt im Offline-Test nachgewiesen.

Offline-Test: eigener Server auf 127.0.0.1:8795, lokaler Snapshot-Modus. Ein realer
LabourNet-Artikel wurde vollständig offline gespeichert. Der Tab wurde geschlossen,
der eigene Server beendet und der TCP-Port als nicht erreichbar nachgewiesen.
Ein neuer Tab startete anschließend Autonom mit CSS48 und Quellenprofile3 aus
dem Worker-Cache. Der gespeicherte Reader enthielt 6254 Zeichen ohne Testserver.

Grenzen: Die Internetverbindung des Hosts blieb aktiv. Der Snapshot-Test weist
einen fehlenden App-/Datenursprung nach, keinen vollständigen Offlinezustand des
Produktionsbrowsers. Neue Übersetzungen und externe Player werden nicht als
offline verfügbar behauptet. Der Browserbackend bietet keine Emulation der
Betriebssystempräferenz für reduzierte Bewegung; die tatsächliche Android-
Systemprüfung steht separat im Geräteabschnitt.

Belege: `docs/evidence/autonom-2026-09-30/browser-acceptance-r5.json`,
`offline-restart-r5.json` und `autonom-r5-offline.png`.

Die erste vollständige Vertragsmatrix bestand: 46 JavaScript-Testmodule,
120 Pytest-Tests, drei historische Skips und vier main-only-Python-Skripte.
App-Validator bestanden; Read-only-Release-Audit 160/160 ohne Warnungen.
Die Skips sind keine Android- oder Signaturabnahme des neuen Kandidaten.
Belege: `full-contract-matrix-r5.txt` und `release-audit-r5.json` im gleichen
Belegordner. Die neue Tastaturprüfung führt den tatsächlichen Profilhandler aus.
Die Classic-Korrektur erhält zusätzlich einen Test des tatsächlichen
Kartenhandlers. Finale Matrix: 47 JavaScript-Module, 120 Pytest-Tests,
drei historische Skips und vier main-only-Skripte bestanden; Validator und
Read-only-Audit 160/160 bestanden. Belege: `full-contract-matrix-r7.txt`,
`release-audit-r7.json` und `browser-acceptance-verified-viewport.json`.
Der ursprüngliche r7-Browsernachweis ist ausdrücklich verworfen: Die
Viewport-Capability skalierte den aktiven Tab, während der versteckte Testtab
bei 1280 Pixeln blieb. Seine Rohmessungen bleiben mit `valid: false` erhalten.
Der Replay-Test erzwingt jetzt tatsächliche Breite und Höhe und erfasst zusätzlich
Client-/Scrollbreite. Am aktiven Tab wurden 320/390/768/1440 jeweils bei 900 Pixeln
Höhe und 200-%-Schrift erneut geprüft: Client-/Scrollbreite identisch
305/375/753/1425; kein Überlauf oder beschnittener Titel. Alle zwölf Checks
bestanden. Die ursprünglichen r5-Messungen hatten bereits echte Zielbreiten;
ihre Gültigkeit bleibt auf den früheren Stand begrenzt.
`tests/browser_classic_source_profile.cua.mjs` wiederholt den Classic-Browserlauf.

## Quellen

Freiburg und Frankfurt sind Verzeichniseinträge ohne automatischen Artikelimport.
Untergrund-Blättle ist im kanonischen Datenpaket auf Überschrift, Autor, Datum und
Originalverweis begrenzt. Volltexte aus RSS, Zusammenfassungen, Bilder und
Enclosures werden im tatsächlichen Aggregatorzweig vor jeder Extraktion übersprungen.
Die App erhält drei additive Schema-3-Projektionen mit expliziter Herkunft und
Rechte-/Importhinweisen. Die App-Projektion aktiviert ihren alten Aggregator nicht.

Kanonisches Datenpaket: `wrn-data-autonom-current`, Branch
`codex/autonom-sources-20261001`, Basis `33509ac` von origin/main; tatsächlicher
Quellencommit `17b3604979a27411666048c082345b704261af93` wurde vom Kontrolleur
unabhängig lesend mit 52 Tests akzeptiert. Vorhandene
Quellen-URLs bleiben erhalten; die Regeneration bestätigt dieselben Identitäten.
52 Python-Tests bestanden. Ausführliche Primärbelege, Betreiber-Selbstauskünfte
und Grenzen stehen im Datenpaket unter
`docs/AUTONOMOUS-SOURCE-ADMISSION-2026-10-01.md`.
Die Quellen sind lokal aufgenommen; noch keine Veröffentlichung nach main und
kein schreibender Update-News-Lauf. Wien und Enough14D bleiben vorgemerkt.

## Android

Eine isolierte Wrapperkopie liegt unter `.tmp/autonom-native`; die normale
Wrapperquelle und das gespeicherte WRN-AVD wurden nicht mit Testdaten überschrieben.
Die Vorversion `8e95685` wurde mit Version 2.1.2/Code29 als Grundlage gebaut.
Der Code30-Zwischenkandidat aus `fd2afe0` wurde gebaut, mit 350 gepackten
Webdateien ohne inhaltliche Abweichungen nach Git-Zeilenendennormalisierung
unabhängig geprüft. Wegen des Classic-Fokusbefunds ist er kein finaler Kandidat.
Der korrigierte Kandidat wird aus seinem festen Quellcommit mit Code31 gebaut;
Signierung und Store-Veröffentlichung sind getrennte Schritte.

`AutonomUpgradeInstrumentedTest` hat zwei getrennte Phasen: Vorversion mit einem
realen gepackten Artikel, OLED/Groß/Kompakt befüllen; danach `adb install -r` des
neuen Pakets und Einstellungen/Lesezeichen sowie Autonom-Persistenz prüfen.
Das App-Testpaket kompiliert. Es ist ausschließlich für eine isolierte Testinstallation.

Die ersten Emulatorversuche waren instabil und lieferten kein abschließendes
`OK`; diese Versuche zählen nicht als bestanden. Später wurde der vorhandene
WRN_API36_Play-Emulator stabil erreichbar. Die darin vorhandene Nutzer-App
`com.world.revolution`, Code27/2.2.0, wurde weder überschrieben noch gelöscht.
Stattdessen wurden QA-Varianten mit der eigenen Kennung
`com.world.revolution.autonomtest` und identischem Debug-Testzertifikat verwendet.
Code29->Code30 mit `adb install -r`: Vorversionsphase `OK (1 test)`;
Einstellungen/Lesezeichen/Autonom und neuer Activity-/WebView-Start `OK (1 test)`.

Zusatz-QA mit entferntem INTERNET-Recht ausschließlich im isolierten
Debugmanifest: vollständiger gespeicherter LabourNet-Reader (>2000 Zeichen)
nach Activity-Neustart und echte Android-Systempräferenz für reduzierte Bewegung
einschließlich fehlendem Glow und verkürzten Übergängen `OK (2 tests)`.
Nach `am force-stop` der Test-App bestand der Offline-Neustart nochmals
`OK (1 test)`. Der vorherige globale `animator_duration_scale`-Wert `null` wurde
per `finally` durch Löschen der nur vorübergehend gesetzten Testeinstellung
wiederhergestellt. Host und andere Apps blieben online.

Die ersten Gerätebelege gehören zum Webstand `fd2afe0`. Am korrigierten
Webstand `8d2ef2346a7ce85e1a07904aef90f21b65657408` wurden alle Geräteprüfungen
erneut abgeschlossen: Code29->Code31-Vorversionsphase `OK (1 test)`,
Upgrade/Persistenz `OK (1 test)`, Offline-Reader/Systembewegung `OK (2 tests)`,
Offline nach Test-App-Prozessstop `OK (1 test)`. Das ist kein Nachweis einer
Play-Signatur oder eines Updates der produktiven Nutzerinstallation. Ein
physisches Gerät und vollständiger Produktionsbrowser-Netzausfall bleiben offen.
Die QA-Quelle `tests/android/AutonomOfflineMotionInstrumentedTest.java` wird
ausschließlich in die isolierte Wrapperkopie übernommen; sie gehört nicht in
Produktions-Webassets. Genaue Belegpfade und Varianten stehen im
[Android-Code31-Bericht](AUTONOM-ANDROID-CODE31-2026-10-01.md).
