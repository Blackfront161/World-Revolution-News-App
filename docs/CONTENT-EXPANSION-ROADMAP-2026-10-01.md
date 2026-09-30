# Ergänzung der aktuellen Roadmap: gemeinsamer Inhalt und Wissen

Auftrag vom 1. Oktober 2026: Website-Inhalte und App-Quellen angleichen, Lexikon/Wissensbibliothek ausbauen und mehr Podcastquellen bzw. größere Archive erschließen. Diese Ergänzung ist in [ROADMAP.json](../ROADMAP.json) unter vier eigenen Arbeitspaketen erfasst. Inventar und Recherche sind erfolgt; Produktausbau, Datenabgleich und Veröffentlichung bleiben als offene Arbeit benannt.

## 1. Website-Abweichung schließen

Ausgangsbeobachtung vom 1. Oktober 2026 vor dem Veröffentlichungsauftrag: Die [Live-Startseite](https://solinaridao.com/) wurde über Firecrawl mit `maxAge: 0` gelesen. Sie zeigte den Titel „WRN Website Foundation“ und einen Nachrichtenarchiv-Snapshot vom 26. September. Der öffentlich gelesene [Produktionspointer](https://solinaridao.com/wrn-production-content/current.json) bezeichnete `wrn-production-news-2026-09-26-v8`, der [Quellenpasspointer](https://solinaridao.com/wrn-source-passes/current.json) `wrn-source-pass-2026-09-25-v2`. Dies bestätigte keine Veröffentlichung des neuen Website-Kandidaten. Der vermittelte Seitentext war kein vollständiger interaktiver Browser- oder Offline-Nachweis.

Der alleinige Website-Schreiber **„WRN Website – Inhaltsparität“** erstellt bereits die Nachrichten-/Quellenprojektion. Laut dessen lokalem Bericht: 500 Eingangsartikel, 480 aufgenommene Metadaten/Originallinks, 20 begründete Ausschlüsse und 397 von 406 Registerendpunkten; 476 Links ohne passenden Quellenpass. Die zwölf zuvor zugelassenen Volltexte bleiben eine separate Klasse. Diese Zahlen sind Writer-Bericht, kein unabhängiges Abschluss-PASS und keine Live-Bestandszählung. Endpunkte dürfen nicht als Anzahl verschiedener Herausgeber ausgegeben werden.

Der Kontrolleur wurde mit der aktuellen Nutzerabweichung und den Abnahmebedingungen beauftragt. Er bestätigt die Koordination und übernimmt die unabhängige Commit-/Paketprüfung. Keine zweite Website-Schreibarbeit wird begonnen. Erledigt ist diese Priorität erst nach separat autorisierter Veröffentlichung und tatsächlicher Live-Prüfung von Revision, Herkunft, Zählungen, Ausschlüssen, mobilen Ansichten und Aktualisierung. Lexikon, Bibliothek und Podcasts benötigen anschließend ihre eigenen Projektionen; Nachrichtenparität allein erfüllt keine vollständige Inhaltsparität.

## 2. Gemeinsamen Katalog herstellen

Der lokale Bestandsabgleich ist datei- und hashgebunden im [Inventar](CONTENT-EXPANSION-INVENTORY-2026-10-01.json) abgelegt:

| Bestand | App-Paket `a84d979` | Kanonische Daten `17b3604` |
| --- | ---: | ---: |
| Podcast-Katalogzeilen | 52 | 36 |
| Podcast-Episodenzeilen | 908 | 749 |
| Bibliotheksquellen konfiguriert | 9 | 9 |
| Bibliothekseinträge | 609 | 266 |
| Quellen mit indexierten Bibliothekstiteln | 4 | 5 |
| Deutsche Bibliothekstitel | 0 | 53 |

Das App-Paket enthält 16 zusätzliche stabile Podcastquellen-IDs. Die App-Episoden liegen in neun Sprachen vor; die kanonische Datei enthält derzeit DE/EN/ES/IT/ZH. Chinesisch ist im App-Katalog ausdrücklich zurückgestellt; vorhandene Zeilen im Datenarchiv sind kein Auftrag, diese Sprachentscheidung aufzuheben. Datenumfang und sichtbare Sprachfreigabe müssen getrennt geprüft werden.

Die App-Bibliotheksdateien stammen laut Healthbericht vom 5. August, der kanonische Bibliothekslauf vom 30. September. Dessen weniger Titel bedeuten nicht, dass ältere gültige Werke gelöscht werden sollen. Zusammenführung nach stabilen IDs und Werk/Edition/Sprachvariante; Sperren, gelöschte Titel und legitime Archivbestände getrennt behandeln. Ein neues Feedfenster ersetzt kein Vollarchiv. Der deutsche OPDS-Abruf war im alten App-Healthbericht leer, im neueren Datenlauf liefert er 53 Titel: zuerst synchronisieren und aktualisieren, nicht eine bereits behobene historische Verbindung erneut als aktuellen Fehler ausgeben.

Das konkrete erste Implementierungspaket gehört in den kanonischen Datenworkflow: ID-Zuordnung für Radio Dreyeckland, Prüfung der 16 App-exklusiven Quellen, Bibliothekszusammenführung und ein reproduzierbarer Paritätsbericht. App-/Website-Projektionen folgen mit den freigegebenen IDs. Prüfen: gespeicherte Zustände, Sprachregeln, Widerrufe, Teilausfall, letzter gültiger Stand und Zeit-/Hashangabe. Nicht blind eine ältere größere JSON-Datei über einen neueren Bestand kopieren.

Folgeschritt umgesetzt: [offline Katalogprüfwerkzeug und Zusammenführungswarteschlange](CONTENT-CATALOG-PARITY-AUDIT-2026-10-01.md), mit neu gebundenem Bericht und elf Regressionstests nach Controller-Korrektur. Die Bestände selbst bleiben unverändert; Aufnahme und Zusammenführung stehen weiterhin aus.

## 3. Lexikon und Wissensbibliothek ausbauen

Das tatsächlich ausgeführte Lexikonmodul lieferte im Ausgangsinventar **154 Begriffe und zwölf Referenzquellen**. Definitionen sind DE/EN; neun UI-Sprachen bedeuten noch keine neun Definitionensprachen. Kategorien des Ausgangsinventars: Grundlagen 13, Organisierung 33, Gerechtigkeit/Fürsorge 17, Kämpfe/Kritik 22, Herrschaft/Analyse 27, Praxis 34, Ökologie/Gemeingüter 8.

Erste Inhaltsrunde: mindestens 20 neue oder wesentlich überarbeitete Begriffe, Schwerpunkt auf dem schmaleren Ökologiebereich sowie Arbeitskämpfen, autonomer Organisierung und regionalen Varianten. Vorher bestehende Begriffe abgleichen. Eigene kurze Texte mit konkretem Quellenbeleg, Praxisbezug, unterschiedlichen Perspektiven und datierter Revision; neue Texte in DE/EN, weitere Sprachen nach inhaltlicher Prüfung. Bestehende Definitionen nicht automatisch als fachlich geprüft ausgeben.

Parallel drei Lernpfade, jeweils mindestens zehn tatsächliche vorhandene Texte: **Grundlagen und Selbstorganisation**, **Arbeit und Wohnen**, **Ökologie und Gemeingüter**. Erklärungen, Texte, geeignete Podcastfolgen und Dossiers über stabile, redaktionell begründete Beziehungen verknüpfen. Die 30 Zuordnungen sind ein erstes Arbeitsergebnis, keine zusätzlichen 30 Bücher.

Bibliotheksadapter für Libcom, Kate Sharpley Library, Zabalaza Books und Anarchist Archive prüfen. Alle vier sind derzeit als Kataloglinks konfiguriert, liefern im geprüften Bestand aber keine indexierten Titel. Erster Meilenstein: deutsche Titel übernehmen und bestehende vier/fünf Kataloge vollständig nachvollziehbar synchronisieren; anschließend je Adapter prüfen, ob ein zulässiger Metadatenimport oder nur das Quellenverzeichnis möglich ist.

Suche nach Thema, Autor, Sprache, Format und Quelle ausbauen; Werke, Ausgaben und Übersetzungen unterscheiden. Lernpfade erhalten Direktlinks und Merkliste. Offlinepakete enthalten nur tatsächlich freigegebene Inhalte; externe Originaldownloads und gespeicherte WRN-Dateien bekommen unterschiedliche Zustände. Aufnahme-/Korrekturhistorie bleibt pro Begriff und Werk nachvollziehbar.

Abnahme: keine verwaisten Beziehungen; klare Originalsprache/Fallback; Quellenbelege an konkreten Aussagen; redaktionelle Prüfung der ersten 20 Begriffsänderungen und 30 Lernpfadzuordnungen; Suche und Filter, Tastatur, neun UI-Sprachen und 320/390/768/1440 Pixel. Reine Mengen- oder Strukturtests ersetzen keine Inhaltsprüfung.

## 4. Podcastvielfalt und Archive erweitern

Sechs neue Programm-/Katalogkandidaten von vier Anbietern sind mit Primärlinks und offenen Prüfungen im [Recherchebericht](PODCAST-CANDIDATES-2026-10-01.md) vorgemerkt: Anarchist World This Week, Stick Together, Green Left Radio, Rebel Steps, Radio Kurruf und Radio LoRa Zürich. Die ersten vier besitzen auf ihren offiziellen Seiten verlinkte RSS-Adressen; technische Feedabnahme noch offen. Die letzten beiden werden zunächst als Audiothek-/Verzeichniskandidaten behandelt.

Mehr Umfang zuerst aus vorhandenen Quellen: 35-Folgen-Limit je Quelle konfigurierbar machen; erste drei geprüfte Serien mit bis zu 100 tatsächlich verfügbaren Folgen, eigener Serienseite und Pagination. Die heutige Auswahl von 30 unabhängigen Folgen je Sprache/50 Radiobeiträgen bleibt der schnelle Einstieg. Größere Archive werden separat geladen, nach Quelle und Sprache balanciert und als Archive bezeichnet. Keine pauschale Vergrößerung des Startpakets oder stilles Leeren anderer Sprachgruppen.

Abnahme: gleiche stabile IDs beim Refresh und Fortsetzen, echte GUID-/URL-Dublettenprüfung, belegte Seriensprache, Ausschluss zukünftiger Datumswerte, gesicherte Aufnahme-/Stream-/Offline-Rechte, Originalpfad und korrektes Verhalten bei gesperrten oder verschwundenen Folgen. Mindestens drei Serien zeigen einen tatsächlichen Archivzuwachs oder eine belegte Verfügbarkeitsgrenze. Ein konfigurierter Feed ohne erreichbare Episoden wird nicht als gewachsener Inhalt gezählt.

## Zuständigkeiten und Paketgrenzen

| Arbeit | Zuständig / Ablage | Abschlussbedingung |
| --- | --- | --- |
| Website-Nachrichten-/Quellenprojektion | vorhandener Website-Schreiber, Next-Repository | unabhängige Paketabnahme; danach autorisierte Live-Veröffentlichung und Live-Prüfung |
| Katalogabgleich und Quellenaufnahme | eigenes folgendes Datenpaket, Revolution-News-Data | stabile IDs, Rechte-/Sprachentscheidungen, reproduzierbare Aktualisierung und Paritätsnachweis |
| Lexikon, Lernpfade und App-Nutzung | folgendes App-Inhalts-/Runtimepaket | geprüfte Inhalte, Beziehungen, Suche, mobile/offline Abnahme |
| Unabhängige Prüfung | WRN Kontrolleur | konkrete Commits und Belege statt Sammelfreigabe |

Die ursprüngliche Planungsergänzung veränderte keinen Runtime-, Website- oder Datenbestand. Die inzwischen ausgeführten Folgeschritte sind unten ausdrücklich benannt. Das bereits akzeptierte AAB bleibt Code31 aus Runtime `8d2ef234`, mit unveränderter Artefakthashbindung. Neue Runtimeänderungen benötigen einen neuen Kandidaten und eigenen Build-/Prüfnachweis; sie werden Code31 nicht rückwirkend zugerechnet. Aktueller Datenstand `17b3604` bleibt lokal und unverändert. Der gesonderte Website-Veröffentlichungsauftrag erweitert keine Android-Signier- oder Store-Uploadbefugnis.

## Prüfung dieser Ergänzung

### Fortführung am 1. Oktober 2026

Der Website-Veröffentlichungsauftrag wurde ausdrücklich erteilt und ist inzwischen abgeschlossen: [Veröffentlichungsbericht mit unabhängigem Live-PASS](WEBSITE-PUBLICATION-2026-10-01.md). Nach realen Hosting- und Offlinefehlern wurden die fehlgeschlagenen Kandidaten zurückgenommen und gezielt repariert. Der finale Stand `5df01f1` ist live, einschließlich 480 Nachrichtenlinks, 397 Quellenendpunkten und vollständigem Chrome-Prozessneustart ohne Netzwerk. Die oben beschriebene Ausgangsbeobachtung ist historisch. Lexikon, Bibliothek und Podcasts benötigen weiterhin eigene Website-Projektionen; vollständige Inhaltsparität ist damit nicht abgeschlossen.

Im App-Arbeitsstand ist die [erste Lexikonrunde](LEXICON-FIRST-CONTENT-BATCH-2026-10-01.md) umgesetzt: ein belegter DE/EN-Begriff zu Faschismus und drei korrigierte Beziehungen zum vorhandenen Begriff Antifaschismus. Der ausgeführte öffentliche Katalog enthält nun 155 eindeutige Begriffe und 13 Referenzen; alle fünf zuvor verwaisten Beziehungen sind aufgelöst. Das entspricht einem von 20 geplanten Begriffsbeiträgen. Weitere 19 Beiträge, drei Lernpfade mit 30 Zuordnungen, Bibliothekssynchronisierung und die spätere Produktabnahme bleiben offen. Dieser lokale Entwurf ist weder Website-Inhalt noch Bestandteil des bestehenden Code31-AAB; die unabhängige Inhaltsprüfung steht aus.

Die [Radio-Dreyeckland-ID-Zuordnung](RDL-SOURCE-IDENTITY-PROPOSAL-2026-10-01.md) ist als gehashter Vorschlag für 33 App- und 28 Datenzeilen vorbereitet. Sie ist nicht angewendet. Vor der Zuordnung muss die restriktive Metadaten-/Originallinkregel auch in Podcastpipeline und Player wirksam sein.

Der Kontrolleur hat diese lokalen Entwurfs-/Nachweisstände und die Publikationsstatusbindung inzwischen [gezielt unabhängig akzeptiert](CONTENT-EXPANSION-CONTROLLER-REVIEW-2026-10-01.md). Die Annahme ist auf die jeweilige Nichtaufnahme bzw. technische Entwurfsprüfung begrenzt. Fachredaktion des neuen Begriffs, RDL-Anwendung und Podcastaufnahme bleiben offen.

Vier offizielle RSS-Endpunkte wurden direkt über HTTPS technisch beobachtet: [Feedbericht](PODCAST-CANDIDATE-FEED-PROBE-2026-10-01.md). Zusammen enthalten die gelesenen Antworten 1.673 Zeilen; darunter ein zukünftiges Datum, 73 ausschließlich über HTTP referenzierte Audiodateien und ein doppelter Episodenlink. Diese Zeilen sind keine aufgenommenen Folgen. Die drei 3CR-Feeds zeigen grundsätzlich genügend Archivzeilen für eine spätere Erweiterung; Rebel Steps enthält 35 Zeilen und wird als Archiv behandelt. Rechte, erreichbare Einzelmedien, Aufnahme und unabhängige Prüfung bleiben offen.

JSON-Parsing, eindeutige Roadmap-IDs, sämtliche lokalen Nachweislinks, zwölf Eingangshashes des Inventars und die unveränderten Code31-Bindungen bestanden. Die bestehenden Funktionen `test_current_release_metadata_is_consistent` und `test_consumed_code25_bindings_remain_historical` sowie die unveränderten Modulassertions aus `test_release_200_assets.py` wurden direkt mit Python ausgeführt und bestanden; `git diff --check` ist sauber. Das ist kein neuer Runtime- oder Gesamtrelease-Testlauf. Der reguläre pytest-Aufruf war wegen lokaler Dateirechte auf dem pytest-Verzeichnis nicht ausführbar; es wird kein pytest-PASS behauptet.
