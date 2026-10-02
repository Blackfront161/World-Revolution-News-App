# Android-Kandidat 2.1.2 / Code 33 · 2. Oktober 2026

Die zwölf neuen eigenen DE/EN-Lexikonbegriffe und drei neuen Leseverknüpfungen sind redaktionell geprüft. Der neue Android-Kandidat enthält außerdem die 21 Themenbereiche im Autonom-Design und die geprüfte Reparatur der automatischen Startseitenübersetzung. Zwei getrennte Builds aus demselben geprüften Commit ergeben eine identische unsignierte AAB. Google Play bleibt bei Code 32; dieser Arbeitsgang hat nichts signiert oder hochgeladen.

## Inhalt und Quellen

167 eindeutige Begriffe, 44 Referenzen, vier Lernpfade, 33 Buchbeziehungen und 728 Bibliothekstitel. Die zwölf neuen Begriffe haben jeweils eine eigene Erklärung, ein Praxisbeispiel, Streitfragen und eine konkrete Primärreferenz. Die App zeigt für diese zwölf Einträge „Redaktionell geprüft · 2026-10-02“. Ältere Entwürfe wurden nicht pauschal freigegeben.

Der WRN Kontrolleur hat die Inhalte zunächst sachlich und anschließend den finalisierten Stand `5d1dac89d22ab35b48dc209773d87a9279eb0faa` gegen `69806e2` abgenommen. Korrigiert wurden „Das Bullard Center“ sowie die präzisere DE/EN-Formulierung zur bezahlbaren und zugänglichen Lebensmittelversorgung. Die FAO-Referenz verwendet die kanonische Übersicht; für Klimareparationen wird die sachlich passendere Just-Transition-Seite der Climate Justice Alliance verwendet. Alle zwölf Primärreferenzen wurden direkt geprüft; konkrete Befunde und URLs stehen im [Quellenprotokoll](evidence/knowledge-translation-code33-2026-10-02/primary-reference-checks.json).

Die drei bestehenden Bibliotheksdatensätze im neuen Lernpfad bleiben exakt an ihre Katalog-IDs, Originalsprache und Original-EPUB-Links gebunden. Eigene Vergleiche sind als solche kenntlich. Referenzen begründen keine allgemeine Rechtefreigabe oder politische Identität einer Quelle. Es wurden keine neuen Feeds zugelassen und keine fremden Volltexte, Bilder oder Audios in das Produkt übernommen.

Aktuelles [Inhaltsinventar](evidence/knowledge-translation-code33-2026-10-02/content-inventory.json). Das ältere Inventar aus `dbc5df0` bleibt als historischer Entwurfsbeleg erhalten.

## Geprüfter Build

- Quellcommit: `34e22d99834c66d67114e1b796e181e87d021c5f`. Laufzeit/Inhalte entsprechen der Inhaltsabnahme `5d1dac8`; danach wurden ausschließlich Build-Cleanup und dessen Windows-Tests korrigiert und unabhängig abgenommen.
- Native Basis: die getrackten Dateien aus `android-wrapper`, kopiert in zwei neue getrennte Projektordner. Paket `com.world.revolution`, Version `2.1.2`, Code `33`, Mindest-SDK `24`, Ziel-SDK `36`.
- Buildparameter: exakter Commit, `-SkipFetch -OfflineGradle -Unsigned`; vorhandene lokale Capacitor- und Gradle-Abhängigkeiten. Beide Builds verwenden gemeinsame Abhängigkeitscaches; vollständige Reproduzierbarkeit ohne Caches wird nicht behauptet.
- Beide Builds: `lintRelease`, `testReleaseUnitTest`, `bundleRelease` erfolgreich; jeweils 223 Aufgaben ausgeführt. Fünf native Update-Policy-Tests bestanden. Android-Lint: keine Fehler, 13 Warnungen zu bestehenden Ressourcen/SDK-Konfigurationen.
- SHA-256 beider AABs: `8DF3D03E02EC1AC355332AA776D5C005CAB331349C8C75E6F12528F6BAF1F15E`.
- Größe: 44.349.593 Bytes; 802 ZIP-Einträge, keine Duplikate oder Lesefehler, keine Signaturdateien.
- 356 eingebettete Webdateien stimmen mit dem isolierten Checkout überein; keine Unterschiede vor oder nach der Verpackung. PNG-Komprimierung verändert native Dateibytes; die tatsächlichen Launcher-Pixel stimmen in allen vorhandenen Dichten mit der ursprünglichen rot-schwarzen Windrose aus der nativen Quelle überein. Das native Share-Plugin ist enthalten.

Cachebindung: JS65, CSS52, Lexikon10; Produktion `2.1.2-r19`, Vorschau `v107`. Die Bezeichnung des vorbereiteten Produktionscaches ist keine Veröffentlichung.

Die nachträglichen Buildnachweise, die vorbereitete Signiererdatei und die aktualisierte `ROADMAP.json` bilden einen Folgecommit. Die AABs bleiben exakt an `34e22d9` gebunden und enthalten dessen damaligen Roadmap-Snapshot; spätere Abnahmeangaben werden nicht rückwirkend als Paketinhalt behauptet.

Belege: [Build 1](evidence/knowledge-translation-code33-2026-10-02/build1-report.json), [Build 2](evidence/knowledge-translation-code33-2026-10-02/build2-report.json), [Root-Artefaktprüfung](evidence/knowledge-translation-code33-2026-10-02/root-artifact-verification.json).

## Validierung

57 JavaScript-Verträge, 151 Python-Tests, vier Subtests und vier zusätzliche Python-Main-Verträge bestanden; drei historische Skips. Validator bestanden, Release-Audit 161/161 ohne Warnung oder Fehler. Nach der isolierten Buildkorrektur zusätzlich zwölf gezielte Python-Tests bestanden, ein historischer Skip; darunter vier Windows-Proben für Erfolg/Fehler mit und ohne verschachtelte Junction. Externe Sentinel-Dateien bleiben beim abgelehnten Cleanup unverändert.

Browserprüfungen bestehen: alle 21 Themen plus „Alle“, neun UI-Sprachen, vier Breiten und 200 % Text; zwölf neue Karten DE/EN mit Prüfdatum und passendem Quellenlink; Startseitenübersetzung einschließlich Schlagzeile sowie Übersetzung/Teilen. Die breite UI-Regression verwendet isolierte Antworten; der bestehende separate Live-Beleg für den Übersetzungsstart weist zwölf erfolgreiche Cache-Anfragen nach. Die echte Benutzervorschau wurde zusätzlich auf den neuen Lexikoneintrag und dessen datierte Freigabe kontrolliert.

Belege: [Vertragsmatrix](evidence/knowledge-translation-code33-2026-10-02/contract-matrix.txt), [Audit](evidence/knowledge-translation-code33-2026-10-02/release-audit.json), [Inhaltsbrowser](evidence/knowledge-translation-code33-2026-10-02/browser-content.json), [Startübersetzung](evidence/knowledge-translation-code33-2026-10-02/browser-startup.json), [Übersetzung/Teilen](evidence/knowledge-translation-code33-2026-10-02/browser-translation-sharing.json).

## Nächste Release-Schritte

Die AAB ist unsigniert und deshalb noch nicht zur Installation oder zum Play-Upload bereit. Gerätetest/Upgrade/Offline-Smoke für diesen konkreten Code-33-Stand stehen aus. Der neue GUI-Signierer `scripts/sign-google-play-aab-2.1.2-code33-34e22d9-gui.ps1` bindet ausschließlich diesen Kandidaten und beide Buildberichte an ihre vollständigen Hashes. Nur seine lesende Vorprüfung wurde ausgeführt und bestanden; keine Passwortabfrage oder Schlüsselverwendung. [Vorprüfung](evidence/knowledge-translation-code33-2026-10-02/signer-preflight.json).

Ältere Code-33-Pakete und deren Signierer für `ce2b556` oder `fb937dd` sind für diesen Stand überholt. Weitere Sprachfassungen und zusätzliche Bibliotheks-/Podcast-Aufnahmen bleiben mit konkreten Quellenbelegen separat vorgemerkt. Push/Admin-Aktivierung erfordert weiterhin die eigene operative Konfiguration.
