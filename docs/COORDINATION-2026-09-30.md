# Bestehende WRN-App: Korrekturen und Koordination

Nutzerauftrag am 30.09.2026: Autonom als wählbares Design integrieren, Roadmap
weiterführen und den Kontrolleur nach Befunden, laufender Arbeit und gemeinsamer
Koordination fragen. Keine neuen Chats angelegt.

## Aktueller Abnahmestand

WRN Kontrolleur hat0c8aa3d7972aca99ff8127d917181d2c98a4410b gegen8e95685 am
30.09.2026 unabhängig und ausschließlich lesend geprüft und funktional akzeptiert:
45/45 JS-Module,117 Pytest-Tests bestanden mit3 historischen Skips,4/4 main-only-
Skripte, Validator und Read-only-Audit160/160 bestanden. Arbeitsbaum unverändert.
Die noch gemeldete Status-/Diagnosenachpflege ist ein eigenes kleines Folgepaket.
Offen bleiben Browser-/Fokus-/Reflow-Automation einschließlich reduced motion,
kompletter Offline-Neustart, Android-Gerät/Upgrade, neuer commitgenauer Build,
Signierung und Play-Veröffentlichung. Technische Paketabnahme ist keine Storefreigabe.

Status-/Diagnosenachpflege lokal abgeschlossen: Der Validator verwendet für
Prüfung und Fehlermeldung dieselbe Vorschaucache-Konstante. Ein zusätzlicher
Verhaltenstest bestätigt, dass der aktuelle Worker akzeptiert, ein veränderter
Cache abgelehnt und dabei die richtige erforderliche Generation genannt wird.
Erneuter Original-Matrixlauf:45 JS-Module,118 Pytest-Tests und4 main-only-Skripte
bestanden,3 historische Skips. Validator und Read-only-Audit160/160 bestanden.
Die zusätzliche Python-Assertion erklärt den Unterschied zum akzeptierten
0c8aa3d-Stand mit117 Tests. Diese Nachpflege wird als eigener Folgecommit geprüft;
Produktdateien, Cachegenerationen und Android-/Builddateien wurden nicht verändert.

## Ziel und Stand

- Repository: `C:\Users\patri\Documents\World Rev Ne\wrn-github-app-current`
- Remote: `https://github.com/Blackfront161/World-Revolution-News-App.git`
- Branch: `codex/code26-home-correction-20260927`
- Ausgangscommit: `8e9568577e8ce1fcc97bf5a4f3d5a42a779e41e3`
- Lokale Ergänzungen: Autonom, CSS47/JS53, Produktion-App-Cache2.1.2-r4,
  alternativer Worker v92; Daten-Cache r1 unverändert. Android2.1.2/Code29.

Autonom ist in der vorhandenen Theme-Auswahl integriert. Der Vorgang benötigt
keine zweite Designimplementierung. Die manuellen Browserbelege liegen im
[Designbericht](AUTONOM-DESIGN-AND-SOURCES-2026-09-30.md).

## Historische Übergabe vor der Abnahme von0c8aa3d

Der jüngste Korrekturauftrag von **WRN Kontrolleur** wurde gelesen und eine
aktuelle Rückmeldung angefordert. Er betrifft die bestehende App; die alte
Chatbeschreibung mit fe3abc9/Next ist nicht sein aktueller Prüfgegenstand.
Der Auftrag enthielt Cachewerte des Zwischenstands46/52/r3/v91. Aktuelle
Quelldateien sind maßgeblich; keine Rückstufung dieser Werte.

| Befund | Stand | Nächster Nachweis |
|---|---|---|
| Atomarer Cachetest verwendet veraltete Generationen | Lokaler Fix r4/v92 vorhanden; direkter Test am 30.09. bestanden | Vollmatrix und unabhängige Abnahme; Fehlersimulationen erhalten |
| Bildlayouttest hängt am Zeilenumbruch | Lokaler Fix vorhanden; direkter Test am 30.09. bestanden | Semantische Prüfung unverändert in Vollmatrix |
| Android-/Releasepolicy erwartet ältere Version | Lokale Erwartung Code29 vorhanden | Komplette Python-Matrix und Belegbindung |
| Widersprüchliche Worker-/Asseterwartungen | CSS47/JS53/r4/v92 lokal synchronisiert; gezielte Assetprüfungen bestanden | Komplette Matrix; unveränderten Datenvertrag beachten |
| Weitere Python-Policy erwartet App-Cache r1/Preview v88 | Sechs gemeldete Dateien und zusätzlicher Restwert im Audit korrigiert | Unabhängige Abnahme; semantische Garantien erhalten |
| Reproduzierbare Autonom-Verhaltenstests fehlen | Node-Verhaltenstest für tatsächliche App-Funktionen ergänzt und bestanden | Browserregression für Fokus, reduced motion und Reflow automatisieren |
| Vollständige Python-/JS-Matrix nicht aktuell belegt | Jetzt lokal bestanden:45 JS,117 Pytest,4 main-only-Skripte;3 historische Fixtures übersprungen | Unabhängige Paketabnahme; CI/Browser/Gerätegates separat |
| Unveränderlicher Prüfstand fehlt | Uncommittiertes Paket | Nach Abschluss aller Schreiber und grüner Matrix konkreten Commit kontrollieren |

Die beiden vom Kontrolleur gemeldeten JS-Fehler bestehen bei der aktuellen
gezielten Probe nicht mehr. Das ist kein Ersatz für die vollständige Matrix und
keine unabhängige Freigabe. Die System-Python-Laufzeit ist unvollständig; die
vorhandene gebündelte Python-Laufzeit funktioniert isoliert, Pytest-Verfügbarkeit
und vollständige Collection müssen gesondert nachgewiesen werden.

Aktuelle unabhängige Rückmeldung von **WRN Kontrolleur**: 44 vorhandene
JavaScript-Module bestanden vollständig, null Fehler. Python-Gesamtgate und
automatisierte Autonom-Abdeckung bleiben offen. Konkrete Python-Resttreffer:
`tests/test_audio_block2_assets.py:16`, `tests/test_release_181.py:79`,
`tests/test_release_182.py:22`, `tests/test_source_recovery_assets.py:46/50`,
`tests/test_video_assets.py:56`, `tests/validate_app.py:15/498`.
Reproduktion: `rg -n 'wrn-app-v2\.1\.2-r1|CACHE_PREFIX\}v88' tests`.
Diese Angaben beziehen sich auf den lokalen Zwischenstand, nicht auf einen
bereits abgeschlossenen Korrekturcommit. Der Daten-Cache r1 ist kein Restfehler.

## Zuständigkeiten

Es wurde festgestellt, dass **World Rev Ne Anforderungen umsetzen** und
**Orchestreier** denselben Korrekturauftrag im gemeinsamen Checkout begonnen
hatten. Beide wurden direkt über die Dateiaufteilung informiert. Bereits
geschriebene Änderungen bleiben erhalten und werden übergeben.

- **Head Chief**: Autonom-Paket, Roadmap/Dokumentation und nach bestätigter Übergabe
  alleiniger technischer Schreiber für die verbleibenden App-Korrekturen und Tests.
- **World Rev Ne Anforderungen umsetzen**: hat den App-Korrekturbereich ausdrücklich
  freigegeben und keine Dateien/Commits für dieses Paket beigetragen. Seine andere
  Websitearbeit wird hier nicht als App-Fortschritt gezählt.
- **Orchestreier**: lesende Koordination und Übergabe seiner bereits geschriebenen
  drei Testkorrekturen; keine parallelen technischen Schreibzugriffe.
- **WRN Kontrolleur**: ausschließlich unabhängige lesende Kontrolle eines konkret
  benannten Stands. Befunde mit Datei, Reproduktion und Priorität; technische
  Zuständigkeit vor einem neuen Änderungsauftrag klären.

**Orchestreier** hat die Übergabe und den Wechsel zur lesenden Rolle bestätigt.
Seine drei bereits geschriebenen Testfixes betreffen atomaren Cachetest,
Zeilenumbruchrobustheit und Android-Code29. **WRN Kontrolleur** hat die lesende
Rolle bestätigt und verteilt keine weiteren STOP/GO-Aufträge. Der Arbeiter hat
anschließend ausdrücklich geantwortet: App-Korrekturbereich frei, keine Dateien
geändert und keine Commits erstellt. Head Chief hat danach die technischen
Restkorrekturen übernommen; Kontrolleur und Orchestrierer wurden informiert.
Ein gemeinsamer Commit darf erst nach fertig gemeldeten Dokumentations- und
Technikbereichen entstehen. Kein AAB, Signieren, Upload oder Deploy in diesem
Korrekturpaket. Android-/Offline-/Store-Schritte bleiben anschließend eigene Gates.

## Abschluss der lokalen Vertragsprüfung

Ausgeführt mit vorhandener gebündelter Python-Laufzeit und vorhandenem Paketordner
`C:\Users\patri\Documents\World Rev Ne\wrn-pytest-code26-20260820` (Pytest9.1.1).
Keine Installation, kein Download und keine Reparatur von System-Python.
Prozesslokal gesetzte Python-Pfade gelten auch für die Collection-Unterprozesse.

`tests/run_contract_matrix.py`:45 JavaScript-Module bestanden,117 Pytest-Tests
bestanden,3 übersprungen,36 Pytest-Module sowie4 main-only-Python-Skripte.
Die drei Skips betreffen historische Code25/Code26-Preflight-Ausgabepfade, die
bereits belegt sind, und ein fehlendes historisches2.0.8-Signaturfixture.
Sie werden nicht als bestanden gezählt und bestätigen keinen neuen Build.
`tests/validate_app.py` bestanden; Read-only-Release-Audit160/160 bestanden.

Bei der ersten echten Collection scheiterte zusätzlich der Audit an seiner
veralteten App-Cache-r1-Erwartung. Auch diese konkrete Ursache wurde auf r4
korrigiert; anschließend lief die komplette Matrix ohne Collectionfehler durch.
Der neue Node-Test führt tatsächliche Funktionen und Dispatchzweige aus
`news-app-2.js` mit Speicher-/Steuerungsdoubles sowie echte Core-/Releasefilter aus.
Er prüft keine Browsergeometrie, Tastaturfokusse oder Betriebssystempräferenzen.
Diese Browserregression bleibt ausdrücklich in der Roadmap.

Belege: [vollständiger Matrixlauf](evidence/autonom-2026-09-30/full-contract-matrix.txt)
und [Read-only-Audit](evidence/autonom-2026-09-30/release-audit.json).

## Fortsetzung der Roadmap

1. Status-/Diagnosenachpflege getrennt vom bereits akzeptierten Korrekturpaket prüfen.
2. Autonom auf Android sowie Offline-Neustart und Upgrade prüfen.
3. Autonome/antifaschistische Kandidaten aus dem Designbericht anhand Betreiber,
   Feed, Aktualität und Rechte prüfen. Recherche kann unabhängig vom technischen
   Paket weiterlaufen; Aufnahme erfolgt im dafür vorgesehenen Datenprojekt.
4. Vorhandene redaktionelle Claims, Aktionen und Dossiers mit echten geprüften
   Daten vervollständigen; Audio/Druck/Offline-Materialien folgen gemäß Roadmap.

Next, die separate Website und historische App-Kopien liegen außerhalb dieser
Arbeit. Ihre Funktionen oder Releasebelege werden nicht für diese App mitgezählt.

## Folgepaket vom 1. Oktober

Nach akzeptiertem `0b315a6` bearbeitet Head Chief ausschließlich die App und das
separate Quellenpaket auf aktuellem Daten-main `33509ac`. Der Kontrolleur arbeitet
daneben an einem eigenständig beauftragten Website-Plan; dafür werden keine App-
Schreibbereiche freigegeben. Das neue App-/Datenpaket wird ihm mit festen Commits
zur unabhängigen, lesenden Prüfung übergeben.

Aktuelle Ergebnisse und offene Gerätegates stehen in
[Autonom-Abnahme](AUTONOM-ACCEPTANCE-2026-10-01.md). Der Code30-Build ist ein
eigener, unsignierter Kandidat; die früheren akzeptierten Korrekturpakete bleiben
historisch. Signierung und Veröffentlichung benötigen einen späteren Auftrag.
