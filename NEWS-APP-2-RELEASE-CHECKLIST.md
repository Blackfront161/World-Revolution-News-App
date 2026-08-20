# News App 2 – ehrliche Arbeits- und Release-Checkliste

Stand: 12. August 2026
Branch: `codex/wrn-2.1-stabilization`

## Versionsgrenze

- `2.0.8` bleibt der lokal geprüfte Ausgangsstand. Dieser Arbeitsgang hat ihn
  nicht veröffentlicht, signiert oder hochgeladen.
- Die nachgereichten Produktfunktionen A–K gehören zur Version `2.1`. Der
  Produktionspfad ist konsistent auf `2.1.0` promoviert; Test und Vorschau
  bleiben ausdrücklich `2.1.0-dev.1-test` bzw. `2.1.0-dev.1-preview`.
- `2.1.0` bezeichnet hier einen lokalen, unsignierten Produktionskandidaten.
  Er wurde nicht hochgeladen, veröffentlicht oder deployt.
- Vorhandene Überschriften, Zähler, Links, CSS-Klassen oder Schaltflächen gelten
  nicht als Funktionsnachweis.

## Status A–K

| Punkt | Status | Nachweisbarer Stand | Noch fehlend |
|---|---|---|---|
| A Änderungen seit Besuch | Teilweise umgesetzt | Versionierte, auf sieben Stände begrenzte lokale Cluster-Historie; Differenzen für explizit bestätigte Claims, Korrektur/Rücknahme, Löschung, Quellen, Medien, Aktionen und Umgruppierung; Dossier-Fokusziel; Unit-Tests | Echte strukturierte Feed-Claims; Persistenztest über zwei reale Browserbesuche |
| B Perspektiven-Matrix | Teilweise umgesetzt | Acht geforderte Spalten; Gruppierungskonfidenz getrennt von Inhaltsbestätigung; keine Wahrheitsableitung; gemeinsame Claim-ID erforderlich | Breite Claim-/Provenienzdaten; redaktionelle Zuordnung gleichbedeutender Aussagen |
| C Solidaritätsaktionen | Teilweise umgesetzt | Pflichtschema, Ablauf-/Frische-/Statusprüfung, leerer ehrlicher Datenstand, keine Verifizierung per Keyword; Dossierblock „Was kannst du jetzt tun?“ | Prüf-/Freigabeworkflow; erste geprüfte Datensätze; Anzeige unter Einzelartikeln |
| D Live-Dossiers | Teilweise umgesetzt | Überblick, Zeitachse, Änderungen, Claimstatus, Matrix, Korrekturen, Medien, Aktionen, Beobachtung; automatische Gruppierung gekennzeichnet | Termin-/Kartenzuordnung; breite Medienzuordnung; redaktionell geprüfte Dossierdaten; dauerhafte URL-Deep-Links |
| E Übersehen | Teilweise umgesetzt | Eigener Bereich; ausschließlich beobachtete WRN-Cluster; mindestens zwei belegte Fokusquellen und höchstens eine sonstige internationale Quelle; verbindlicher Hinweis; Leerzustand; manuelle Smartphone-Browserabnahme | Reale Metadatenverknüpfung für lokale/Bewegungsquellen im gesamten Quellenbestand; automatisierter Real-Datenlauf |
| F Tagesausgabe | Teilweise umgesetzt | 5/7/10 Meldungen; Morgen/Tag/Woche; Sprachauswahl; Textvorschau; Gerätestimme beitragsweise mit genauer Fortsetzung; stabiler eigener Dataset-Key je Ausgabe; bestätigtes Schreiben/Readback; `offlineReady` aus dem passenden Datensatz; Offline-only-Artikel in gespeicherter Reihenfolge; zwei Ausgaben nach vollständigem Offline-Neustart mit 7 bzw. 5 Artikeln im Browser geöffnet; Abbruch/Fortsetzung bei Beitrag 3 nachgewiesen | Echte erzeugte Audiodateien oder bewusste dauerhafte Produktentscheidung dagegen |
| G Offline-Aktionskoffer | Teilweise umgesetzt | Zine und Schablonen; getrenntes, bewusst leeres Ressourcenschema mit Rechte-/Aktualitäts-Prüfliste; geprüfte Organisations-Regionalpakete offline | Eigener vollständiger Downloadbereich; rechtlich geprüfte Ländergrundlagen, Erste Hilfe, digitale Sicherheit, Festnahme, Briefe und Veranstaltungen |
| H Quellenpass 2.0 | Teilweise umgesetzt | Verlangte Felder und Erklärungen in allen neun Sprachen; lokales Quellenregister und Objekt-Healthmap; unbekannt bleibt unbekannt; 0 Korrekturen nur bei explizitem Leerbestand; kein Score; Pure Tests mit realen Schemata | Automatisierter DOM-/Dialog-Regressionsstest in allen Sprachen; breitere redaktionelle Betreiber-, Finanzierungs-, Nähe- und Provenienzdaten |
| I Bewegungswörterbuch | Teilweise umgesetzt | Lexikon und bestehende lokale Review-/Änderungsfunktionen | Terminologieschutz und Vorrang geprüfter Begriffe in Übersetzungen; regionale Varianten; dauerhafte redaktionelle Korrekturen mit Versionen |
| J Druckstudio | Teilweise umgesetzt | A4/A5/Quadrat/Story, Druckansicht, tintensparend, Zine, Plakate, Schablonen | A3, Stickerbögen, verlässlicher PDF-Generator, Variantenworkflow, verifizierte Zitate, vollständige Rechteprüfung |
| K Ehrliche Statusangaben | Vollständig neu umgesetzt | Diese Matrix und `ROADMAP.json` benennen pro Punkt Belege und Lücken; 2.0.8/2.1 sind getrennt | – |

## Produktschutz

- [x] Keine Kommentare, Likes oder Popularitätsranglisten ergänzt.
- [x] Keine serverseitige Standortverfolgung ergänzt.
- [x] Keyword-Termine werden nicht als „geprüfte Solidarität“ ausgegeben.
- [x] Unbekannte Quellenpass-Angaben werden nicht geraten.
- [x] Matrix-Wiederholung wird nicht automatisch als Wahrheit interpretiert.

## Solidaritätsnetzwerk

- [x] Dauerhafte Organisationen (`solidarity-network.json`), befristete Aktionen
  (`verified-solidarity-actions.json`) und Offline-Materialien
  (`solidarity-resources.json`) sind getrennte Datenarten.
- [x] Sieben Startprofile wurden am 12. August 2026 feldweise gegen offizielle
  Primärseiten zweitgeprüft. Betreiber, Leistungsumfang, Zielgruppen/
  Voraussetzungen, Grenzen, Kontakt und Notfallstatus besitzen deklarierte
  offizielle Domains und eigene Belegfelder. Notfallstatus ist nur beim Alarm
  Phone erlaubt; dessen Grenze „keine Rettungsnummer“ ist sichtbar.
- [x] Manuelle Region-, Sprach- und Themenfilter übertragen keinen Standort und
  werden ebenso wie geöffnete Profile nicht im Verlauf gespeichert.
- [x] Kontextbezüge akzeptieren ausschließlich redaktionelle `helpTopics`; Titel,
  Text oder Personenmerkmale lösen keine Zuordnung aus.
- [x] Die Einreichungsmaske erzeugt ausschließlich einen flüchtigen lokalen
  Entwurf (`local-draft`, `transmitted: false`, `persisted: false`,
  `verified: false`, `published: false`) und behauptet weder Übermittlung noch
  Moderationsspeicherung.
- [x] Regionalpakete melden Erfolg erst nach abgeschlossenem `putDataset()` und
  gültigem Readback. Das Regionalpaket enthält nur kanonische Profil-IDs,
  Region und Prüfmetadaten. Leistungen, Grenzen, Zielgruppen und Kontakte werden
  beim Wiederanlauf ausschließlich aus dem erneut validierten, app-gecachten
  kanonischen Register rekonstruiert. Unbekannte IDs, falsche Regionsschlüssel,
  veraltete Profile und eingebettete bzw. zusätzliche Inhaltsfelder werden
  verworfen. SHA-256 dient hier ausschließlich der Korruptions- und
  Readback-Prüfung; er ist kein Manipulationsschutz gegen lokale Angreifer.
- [x] Speichern und erneutes Speichern laden zwingend das validierte kanonische
  Register aus Storage. `sourceCheckedAt` entspricht exakt dessen
  `sourceUpdatedAt`; ein späterer Speichertag ersetzt das ursprüngliche
  Prüfdatum nicht. Fehlende, beschädigte oder widersprüchliche Registerdaten
  brechen den Speichervorgang ab.
- [x] Nur der von beiden eigenen Service Workern an einem synthetischen
  HTTP-200-Leerfallback gesetzte Response-Header löst Wiederherstellung aus.
  Ein gleichlautender Marker im JSON-Körper wird ignoriert; eine echte leere
  Online-Antwort bleibt autoritativ leer. Die Vertrauensgrenze ist der
  lokal ausgeführte same-origin Worker, keine kryptografische Attestation. Beide
  Worker entfernen den reservierten Header aus sämtlichen Netzwerk- und
  Cacheantworten, bevor diese gespeichert oder an die App weitergegeben werden.
- [ ] Dauerhafter sicherer Eingang, Rollen, Vier-Augen-Freigabe und
  Korrekturhistorie fehlen weiterhin.
- [ ] `solidarity-resources.json` bleibt leer, bis Aktualität, Urheberrecht und
  Offline-Verbreitungsrecht je Material nachgewiesen sind.
- [x] Bestätigte Beratungssprachen und reine Informationssprachen sind getrennt;
  nur erstere wirken auf den Sprachfilter. Queer Base führt das offiziell
  sichtbare mehrsprachige Informationsangebot einschließlich Ukrainisch nur als
  Informationssprachen und gibt keine unbelegte Sprachzusage für Beratung.
  Sprachen, Zuständigkeiten, Grenzen, Kontaktwege und Belegdomains aller sieben
  Profile wurden gegen die deklarierten offiziellen Primärseiten zweitgeprüft;
  humanrights.ch nutzt nun die direkte Freiheitsentzugsberatung (DE/EN und
  Fachkontakt). URL-/Domain-/strikte ISO-Kalender-/Intervall- sowie
  Langtext-/Offline-Tests sind vorhanden.

## Release-Sicherheit

- [x] Fachliche Gesamtvalidierung aller temporären AAB-/Berichtsartefakte direkt
  vor Beginn der Commitphase.
- [x] Identitäts- und Zielprüfung aller veröffentlichten und noch ausstehenden
  Artefakte vor jedem einzelnen Move.
- [x] Exception-Rollback einschließlich Manipulation, Revalidierungsfehler,
  bestehenden Zielen und Fehler nach dem ersten/zweiten Move getestet.
- [x] Durables, atomar ersetztes Recovery-Journal unter dem validierten
  Build-Root; Fortschritt wird nach jedem Move per Write-Through/Flush
  festgeschrieben. Echte Windows-Kindprozess-Hartabbrüche nach Move 1, Move 2
  und nach dem Commitmarker sowie Wiederanlauf/Retry sind grün. Fremde oder
  veränderte finale Dateien werden nicht gelöscht.
- [x] Temp-, Journal- und Lock-Bereinigung sind auf den validierten,
  reparse-freien Build-Root begrenzt und verlangen normale Dateien mit genau
  einem Hardlink. Traversal-, Junction-, Hardlink-Ausleitungs- und stale-Lock-
  Tests sind unter Windows grün.

## Noch erforderliche Prüfungen

- [x] Gesamte Python- und JavaScript-Testmatrix für diesen Korrekturstand:
  37 dynamisch entdeckte JavaScript-Vertragstests, 102 Pytest-Tests, vier
  disjunkt ausgeführte Python-`main()`-Vertragsskripte und der Read-only-Audit
  158/158 grün. Das zentrale Quality Gate verwendet denselben sortierten
  Discovery-Runner und kann neue `tests/test_*.js` oder assertionshaltige
  `test_*.py`-Hauptprogramme nicht durch eine veraltete manuelle Liste
  übergehen. Die Python-Policy prüft echte Pytest-Collection, erkennt
  `main() -> helper`-Verträge transitiv und blockiert leere Module,
  Pytest/Main-Mischformen sowie Import-/Collectionfehler; zusätzlich
  sämtliche mit `git ls-files '*.js'` dynamisch ermittelten 121 versionierten
  JavaScript-Dateien syntaktisch, 62 versionierte Python-Dateien kompilierbar und
  198 versionierte JSON-Dateien parsebar geprüft, `git diff --check` grün.
- [x] CI erzeugt den aktuellen Read-only-Auditbericht aus demselben In-Memory-
  Ergebnis in `${RUNNER_TEMP}`, prüft den JSON-Roundtrip und lädt ausschließlich
  dieses temporäre Artefakt hoch. Die versionierte Datei
  `release-readiness-183.json` ist eine dokumentierte historische Baseline und
  kein CI-Ergebnis dieses Entwicklungsstands.
- [x] Android `lintRelease`, `testReleaseUnitTest` und `bundleRelease` sind mit
  der bereits vorhandenen lokalen Android-Studio-JBR/SDK-36-Toolchain strikt
  offline ausführbar (keine Lizenzannahme, kein Download, kein Schlüsselzugriff).
  Der finale Kandidat wird nach dem sauberen Commit aus exakt diesem Commit als
  **unsigniertes** `2.1.0`/Code-25-AAB gebaut. SHA-256, Größe, Paket, Ziel-SDK,
  ZIP/Manifest/Assetprüfung und fehlende Signatur stehen im Übergabebericht;
  das AAB bleibt ohne autorisierte Signierung nicht uploadfähig.
- [x] Lokale Browserprüfung 390×844, 412×915, 768×1024 und 1440×900 ohne
  horizontalen Überlauf; der Hilfe-Renderpfad und lange Hilfetexte in
  DE/EN/ES/FR/IT/PT/RU/EL/TR wurden nach der Korrektur erneut geprüft.
- [x] Im vorherigen Korrekturstand öffnete die Vorschau nach Abschalten des
  Servers beide zuvor gespeicherten
  Tagesausgaben getrennt mit exakt 5 bzw. 7 Artikeln und zeigte das gespeicherte
  CH-ZH-Regionalpaket über den vollständigen UI-Klickpfad mit einem gültigen
  Profil. Die Tagesausgabe wurde in diesem eng begrenzten Folgeauftrag nicht
  verändert; ihr Integrationsvertrag bleibt grün.
- [x] Die Workerstände Vorschau `v82` und Produktion App/Daten `r1` sind in
  Index, beiden Workern, `app-check.html`, Validator, Audit und Vertragstests
  konsistent. Veraltete Cacheversionen werden in den Aktivierungsroutinen
  entfernt und sind in den Worker-Vertragstests verboten. Der echte
  same-origin Offline-Neustart war bereits für die unmittelbar vorherigen
  Stände `v79`/`r6` grün; die Promotion ändert die Cachekennungen und die
  geprüften Kernmodule, nicht die Installations-/Aktivierungslogik. Ein neuer
  lokaler Chrome-Lauf installierte `r1`, erreichte unter Windows jedoch beim
  Schließen des isolierten Testprofils keine saubere Prozessbereinigung und
  wird deshalb nicht als zusätzlicher Offline-Neustart-Pass gewertet.
- [x] Produktions- und Vorschau-Worker wurden mit einem echten synthetischen
  Offline-Request geprüft: nur ihr Response-Header kennzeichnet den Leerfallback.
  Die Wiederherstellung gegen echten Storage ist verhaltensbasiert integriert
  getestet; eine Online-Leerantwort mit gefälschtem Körpermarker bleibt leer.
- [ ] Ein zusätzlicher echter Browserlauf, der den seltenen Worker-Leerfallback
  nach gezieltem Cacheentzug erzwingt, ist noch nicht nachgewiesen. Der normale
  installierte Worker hält das kanonische Register im App-Cache; dies wird nicht
  als vollständiger Browser-E2E-Nachweis ausgegeben.
- [x] Sichtbarer Tastaturfokus (3px Outline) und native fokussierbare Filter/
  Schaltflächen geprüft; Abbruch/Fortsetzung bei der dritten Meldung im Browser
  und der Segment-Resume-Vertrag automatisiert geprüft.
- [x] Native reine Tab-/Shift-Tab-/Enter-Abnahme im lokal installierten Chrome:
  Skip-Link fokussiert und aktiviert, Headersteuerung und Hauptnavigation in
  Vorwärts-/Rückwärtsrichtung durchlaufen, Artikel per Enter geöffnet und
  geschlossen sowie Hilfe per Enter geöffnet und zurückgeschlossen. Artikel
  und Hilfe geben den Fokus nach dem Schließen an ihren jeweiligen Auslöser
  zurück; keine DOM-`click()`-Simulation wurde als Tastaturpass gewertet.
- [x] Live-Seite ausschließlich lesend vergleichen; sie blieb unverändert auf
  dem älteren 2.0.6-Stand.
- [ ] Webpaket nur aus dem unveränderten 2.0.8-Ausgangscommit erstellen, falls
  weiterhin benötigt; 2.1-Dateien nicht als 2.0.8-Funktionspaket ausgeben.
- [ ] HTTPS-, Geräte-, Play-Console- und Post-Rollout-Prüfungen bleiben extern.

## Verbotene Aktionen in diesem Arbeitsgang

- Nicht deployen.
- Nicht signieren.
- Nicht hochladen.
- Keine Live-Dateien ändern.
- Keine Dateien löschen; Löschkandidaten nur berichten.
