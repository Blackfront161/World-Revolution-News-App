# Katalogabgleich: Prüfwerkzeug und konkrete Zusammenführungswarteschlange

1. Oktober 2026, Asia/Singapore. Arbeitspaket `CONTENT-CATALOG-PARITY` in [ROADMAP.json](../ROADMAP.json).

**Umgesetzt:** ein rein lesendes, offline arbeitendes Prüfwerkzeug mit elf Regressionstests. **Offen:** redaktionelle Zusammenführungsentscheidungen, Quellenaufnahme, App-/Website-Projektion und Veröffentlichung. Das Werkzeug verändert keine Eingaben, holt keine URLs ab und übernimmt keine Inhalte.

Der Kontrolleur hat den Korrekturcommit `eaf55e2fdfff3e3bab9b3a08e7a40e2d13c8330b` am 1. Oktober 2026 unabhängig read-only akzeptiert: beide Ausschlusspfade adversarial wiederholt, elf Tests bestanden, Werkzeughash und Berichtbindung geprüft, Arbeitsbäume unverändert. Diese Abnahme betrifft das Prüfwerkzeug; fachliche Aufnahme und Zusammenführung bleiben offen. Der vorherige reine Roadmap-Commit `8f283355` bleibt bis zu seiner gesonderten Abschlussnachprüfung als `review pending` geführt.

Das [Werkzeug](../scripts/audit_content_catalog_parity.py) bindet sechs Eingabedateien je Repository per SHA-256 und Dateigröße. Es dokumentiert den jeweiligen HEAD als Kontext; maßgeblich für den tatsächlich gelesenen Arbeitsbaum sind die zwölf Bytehashes. Ändert sich eine Datei oder HEAD während der Prüfung, wird kein gültiger Bericht geschrieben. Existierende Berichte und Katalogeingaben dürfen nicht als Ausgabe überschrieben werden.

Der [maschinenlesbare Bericht](CONTENT-CATALOG-PARITY-AUDIT-2026-10-01.json) bindet App-Basis `5e12d8433604b078413766b3c22d37022190cae0` und Datenbasis `17b3604979a27411666048c082345b704261af93` sowie den Hash des korrigierten Prüfwerkzeugs. Er enthält nur IDs, Zeilenpositionen, geänderte Feldnamen, Mengen, Aufnahmegrenzen und Hashes. Originaltexte, Beschreibungen, Audio-/Bildadressen und Kontaktinformationen werden nicht kopiert. Ungültige Objekt-/Listen-IDs werden auch in den beiden Ausschlusspfaden ausschließlich als `null` ausgegeben. Die Eingabedateien wurden am Ende erneut gehasht und waren unverändert.

## Befunde

| Vergleich | Podcastfolgen | Bibliothekstitel |
| --- | ---: | ---: |
| Zeilen App | 908 | 609 |
| Zeilen kanonische Daten | 749 | 266 |
| Gemeinsame eindeutige IDs | 312 | 160 |
| IDs ausschließlich App | 596 | 449 |
| IDs ausschließlich Daten | 437 | 106 |
| Gemeinsame IDs mit abweichenden geprüften Feldern | 28 | 2 |

Die 28 Episodenabweichungen betreffen 22 Originalseitenadressen, fünf Sprachangaben und einen Datensatz mit Originaladresse plus Publikationszeit. Die zwei Bibliotheksabweichungen betreffen Autor*innenangaben. Das sind Prüfentscheidungen, keine bereits bestätigten Fehler. Übereinstimmende IDs oder Felder belegen weder Rechte noch Aktualität.

Die Podcastkataloge teilen 35 stabile Quellen-IDs. 16 IDs sind bislang nur im App-Katalog vorhanden. Vier gemeinsame Quellen haben abweichende geprüfte Felder: Sprachlisten bei A-Radio Berlin, A-Radio Wien und Dissens sowie die Aktivierungseinstellung bei Leftover Talk. Letztere Quelle ist in der App ausdrücklich zurückgestellt; im Datenkatalog fehlt diese Sperre, und dessen Episodendatei enthält 35 zugehörige Folgen. Der Bericht kennzeichnet alle 35 als durch die bestehende App-Policy gegen Aktivierung gesperrt. Keine Quelle wird durch bloße Anwesenheit in der Datendatei freigegeben.

In beiden Katalogen existiert zusätzlich eine Radio-Dreyeckland-Zeile ohne stabile ID. 33 App-Folgen und 28 Datenfolgen haben keinen auflösbaren `sourceId`. Ein Abgleich der konfigurierten HTTPS-Homepage ergibt `radio-dreyeckland` als möglichen vorhandenen Bezug. Dies bleibt ausdrücklich ein Zuordnungsvorschlag zur Prüfung: ein gemeinsamer Host beweist keinen Betreiber oder Rechteumfang. Die zusätzliche Zeile enthält `metadata_and_links_only`; diese Einschränkung darf beim Zusammenführen nicht verschwinden. Episoden-IDs und gespeicherte Zustände bleiben erhalten.

Die Bibliothek enthält keine gefundenen unterschiedlichen IDs mit exakt gleicher sicherer Original-/Downloadadresse zwischen beiden Beständen. Dieses negative Ergebnis schließt Werk-/Ausgaben-/Übersetzungsdubletten nicht aus. Titelähnlichkeit allein wird vom Werkzeug nicht als Identitätsbeweis benutzt. Anker werden für den direkten URL-Vergleich entfernt; Pfad-Großschreibung und Queryparameter bleiben identitätsrelevant. HTTP-Adressen und URLs mit Zugangsdaten sind keine Zuordnungsbelege.

## Nächster Implementierungsbatch

1. Die 61 fehlenden Episodenzuordnungen und beide ID-losen Katalogzeilen anhand der bestehenden Quelle prüfen. Eine bestätigte gemeinsame Identität als Beziehung festhalten; `sourceId` ergänzen, ohne Episoden-IDs umzuschreiben. Metadatenbeschränkung erhalten.
2. Die vier Quellenfeldabweichungen, fünf Episodensprachkonflikte, 23 Originalpfad-/Zeitabweichungen und zwei Autor*innenkonflikte anhand konkreter Primärbelege entscheiden. Keinen Bestand allein wegen seines neueren Datums pauschal bevorzugen.
3. Die 16 App-exklusiven Quellen einzeln im kanonischen Datenworkflow prüfen. Die App-Sperre für Leftover Talk bleibt wirksam; eine spätere Sprachfreigabe wäre eine eigene Produktentscheidung.
4. Die 449 App-exklusiven und 106 Daten-exklusiven Bibliotheks-IDs getrennt nach gültigem Archiv, neuer Aufnahme, Ausgabe/Übersetzung, Widerruf und unbekanntem Zustand beurteilen. Die 53 deutschen Titel aus dem freigegebenen Datenbestand gehören zum anschließenden App-Projektionsbatch.
5. Ein neues Zusammenführungspaket zuerst lokal vorbereiten; anschließend Eingabehashes, Ausschlüsse, Rechte, gespeicherte Zustände, Feedausfall und unabhängige Abnahme prüfen. Veröffentlichung bleibt ein gesonderter Schritt.

## Prüfung und Reproduktion

Elf Standardbibliothek-`unittest`-Fälle bestanden. Sie prüfen beschädigte IDs, doppelte IDs, mehrdeutige Hostzuordnung, Erhalt der Metadatenrestriktion, ausgeschlossene Quellen, widersprüchliche App-/Datenpolicy, sichere URL-Identitätsgrenzen, Feldkonflikte ohne Text-/URLausgabe, Drift während der Prüfung sowie Verweigerung des Überschreibens von Eingaben oder Berichten. Zwei zusätzliche Testmethoden prüfen Objekt- und Listen-IDs mit eingebettetem Body und Audio-URL getrennt im Quellen-Ausschlusspfad und im App-Policy-Ausschlusspfad; beide prüfen die Abwesenheit dieser Inhalte im serialisierten Gesamtbericht. Der reguläre pytest-Runner wird weiterhin nicht als bestanden behauptet.

Der Kontrolleur hatte diesen Inhaltsübertrag in den beiden Ausschlusspfaden von `5e12d84` unabhängig reproduziert; die neun damaligen Tests erfassten ihn nicht. Der akzeptierte Fix beschränkt beide `episodeId`-Ausgaben auf Strings, sonst `null`. Die fachlichen Befunde des realen Kataloglaufs bleiben unverändert; nur Zeit, HEAD-Kontext und Werkzeughash wurden neu gebunden. Der Status des fachlichen Berichts bleibt ausdrücklich `review_required_not_admission_not_merge_not_live_parity`.

```powershell
# Mit dem vorhandenen Python, ohne zusätzliche Pakete und ohne Netzwerk:
python tests/test_content_catalog_parity_audit.py -v
python scripts/audit_content_catalog_parity.py --app-root . --data-root '..\wrn-data-autonom-current' --output '.tmp\content-parity-replay.json'
```

Für einen Replay einen noch nicht existierenden Ausgabepfad wählen. Zeit und HEAD-Kontext können nach weiteren reinen Dokumentationscommits abweichen; gleiche Eingabehashes ergeben dieselben fachlichen Befunde. Ein Prozessabschluss mit Exitcode 0 bestätigt nur die Erstellung eines gültigen Prüfberichts. Sein Status lautet weiterhin `review_required_not_admission_not_merge_not_live_parity`.

`scripts/`, `tests/` und `docs/` gehören laut bestehendem AAB-Assetselektor nicht zu den Webasset-Verzeichnissen. Das bestehende Code31-Artefakt wird weder neu gebaut noch verändert; seine Runtime bleibt `8d2ef234`. Die einzige Änderung an einer vorhandenen Root-JSON-Datei ist die Roadmap-Nachpflege; das gebaute Code31-Artefakt enthält weiterhin seinen ursprünglichen gebundenen Roadmapstand. Kein vollständiger Asset-Gleichheitsnachweis zwischen dem neuen HEAD und Code31 wird daraus abgeleitet. Der kanonische Datenarbeitsbaum bleibt unverändert.
