# Gemeinsamer Archiv- und Wissenskandidat

Lokale Umsetzung, noch nicht veröffentlicht und nicht Bestandteil von Code32.

App und Datenkatalog enthalten dieselben 1.345 stabilen Podcast-IDs. 1.310
Folgen sind aktiv; 35 chinesische Leftover-Talk-Datensätze bleiben ausschließlich
im Archiv erhalten. 52 bestehende Quellen, keine neue Quellenaufnahme.
Ein wählbares, paginiertes Archiv ergänzt die bisherige aktuelle Auswahl.
Teilantworten und begrenzte erfolgreiche RSS-Refreshs löschen keine historischen
Folgen. Widerrufe bleiben dauerhaft wirksam; restriktive Rechteprojektionen
gelten vor Speicherung und Anzeige. Unbekannte historische Quellen bleiben
archiviert, erscheinen aber nicht ohne passende Quellenkonfiguration im Player.

Fünf widersprüchliche DE-/EN-Folgen wurden auf `und` gesetzt. Die alte
automatische Textanalyse gilt nicht als bestätigte Audiosprache. Statische
ID-Regeln verhindern die Wiederherstellung alter vermeintlich bestätigter Labels.
Vier bisherige Intake-Holds und die sechs neuen Quellenkandidaten bleiben offen.

Die gemeinsame Bibliothek enthält 715 Werk-IDs, darunter 53 deutsche Titel.
19 vorhandene Lexikonbegriffe sind substanziell mit eigenen DE-/EN-Texten
überarbeitet: weiterhin 155 eindeutige Begriffe, jetzt 32 Referenzquellen.
Revisionen und 30 Lesezuordnungen stehen ausdrücklich als redaktioneller
Entwurf zur unabhängigen inhaltlichen Prüfung. Drei Lernpfade verknüpfen
je zehn vorhandene Bücher und passende Begriffe. Bücher öffnen nur an der
Originalquelle; kein fremder Volltext, kein neues Medienrecht und keine neue
Offline-Freigabe. Die übrigen sieben UI-Sprachen zeigen den ehrlichen EN-Fallback.

App-Laufzeit: Produktionscache r11, Vorschaucache v99. Keine Änderung von
Android-Version oder versionCode. Eingangscommits und Kataloghashes stehen
in PODCAST-ARCHIVE-PARITY-2026-10-01.json; Begriffsliste in
KNOWLEDGE-REVISIONS-2026-10-01.json. Website-Kandidat und endgültige
Test-/Reviewbelege werden im gemeinsamen Abschlussbeleg gebunden.

Lokale Prüfungen: 53 JavaScript-Verträge, 148 pytest-Fälle, vier Subtests
und vier eigenständige Python-Skripte bestanden; drei historische Fälle
überspringen ausdrücklich fehlende Voraussetzungen. App-Validator und
Produktionsaudit 161/161 bestanden. Datenrepository: 13 unittest-Fälle.
Nach der Korrektur der historischen RDL-Zuordnung bestanden die gezielten
Archiv-/Assets-/Cacheverträge erneut. Drei Browserpakete bestehen: gemeinsame
Bibliothek/Lernpfade, Archiv mit Teil-/Fehlerantworten und persistenten
Widerrufen, sowie aktuelle/Classic-/Legacy-Rechte- und Sprachsperren.
Archiv und Bibliothek wurden bei 320/390/768/1440 und neun UI-Sprachen geprüft.
Das sind lokale Funktionsbelege, keine native Geräte- oder Live-Abnahme.

Der unabhängige inhaltliche Review benannte drei An-Anarchist-FAQ-Nachweise
als Kontext-/Sekundärtexte. Ihre Beschreibungen wurden entsprechend korrigiert;
eine Primärquellenklassifikation wird für diese drei Nachweise nicht behauptet.

Abgeschlossen: App-Produkt `6428cfef51e50818eba79950970ccef2a30ae170`,
Data `4153d5f2baccbc0d7ccc16a546d08e7808dff753`, Website-Produkt
`83abb0f3cc3ac385b5df3409edc623cf592e733a` sind unabhängig lokal GREEN.
Die Website zeigt 715 Bücher, 155 Begriffe/32 Referenzen und dieselben drei
Lernpfade. 1.310 Podcast-IDs werden als 1.256 eindeutige Originalseiten
projiziert (54 URL-Dubletten). Historische Websitebytes bleiben unverändert.
Website 231 Vitest/84 Node, fokussiert 24/12 erneut und unabhängig bestanden;
Typprüfung/Lint, vier Browserfälle und Offline-Shell 7.025.513 Bytes bestanden.
Ein lokal geprüftes Website-/Hostingpaket ist aus `83abb0f` vorbereitet.
Die aktuelle Erweiterung wurde nicht live veröffentlicht oder in Play hochgeladen.
