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
- CSS48, Quellenprofile3, Haupt-App-JS53; App-Cache `wrn-app-v2.1.2-r5`,
  alternativer Worker v93. Daten-Cache r1 bleibt unverändert.

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
Betriebssystempräferenz für reduzierte Bewegung; deren Systemprüfung bleibt offen.

Belege: `docs/evidence/autonom-2026-09-30/browser-acceptance-r5.json`,
`offline-restart-r5.json` und `autonom-r5-offline.png`.

Die vollständige Vertragsmatrix bestand: 46 JavaScript-Testmodule,
120 Pytest-Tests, drei historische Skips und vier main-only-Python-Skripte.
App-Validator bestanden; Read-only-Release-Audit 160/160 ohne Warnungen.
Die Skips sind keine Android- oder Signaturabnahme des neuen Kandidaten.
Belege: `full-contract-matrix-r5.txt` und `release-audit-r5.json` im gleichen
Belegordner. Die neue Tastaturprüfung führt den tatsächlichen Profilhandler aus.

## Quellen

Freiburg und Frankfurt sind Verzeichniseinträge ohne automatischen Artikelimport.
Untergrund-Blättle ist im kanonischen Datenpaket auf Überschrift, Autor, Datum und
Originalverweis begrenzt. Volltexte aus RSS, Zusammenfassungen, Bilder und
Enclosures werden im tatsächlichen Aggregatorzweig vor jeder Extraktion übersprungen.
Die App erhält drei additive Schema-3-Projektionen mit expliziter Herkunft und
Rechte-/Importhinweisen. Die App-Projektion aktiviert ihren alten Aggregator nicht.

Kanonisches Datenpaket: `wrn-data-autonom-current`, Branch
`codex/autonom-sources-20261001`, Basis `33509ac` von origin/main. Vorhandene
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
Der neue Kandidat wird aus dem Commit dieses Änderungssatzes mit Code30 gebaut;
Signierung und Store-Veröffentlichung sind getrennte Schritte.

`AutonomUpgradeInstrumentedTest` hat zwei getrennte Phasen: Vorversion mit einem
realen gepackten Artikel, OLED/Groß/Kompakt befüllen; danach `adb install -r` des
neuen Pakets und Einstellungen/Lesezeichen sowie Autonom-Persistenz prüfen.
Das App-Testpaket kompiliert. Es ist ausschließlich für eine isolierte Testinstallation.

Die echte Upgrade-Abnahme ist noch nicht bestanden: kein physisches Gerät
angeschlossen; Testemulator nach ersten Start-/Installationsschritten unterbrochen,
weitere Kaltstarts mit eigener Testpartition hängen oder enden. Auch Software-
emulation lieferte keinen stabilen ADB-Nachweis. Die begonnenen Tests ohne
abschließendes `OK` zählen nicht als bestanden. Die eigenen Emulatorprozesse
wurden beendet. Für das Gerätegate wurde ein stabiles Android-Testgerät angefragt.
