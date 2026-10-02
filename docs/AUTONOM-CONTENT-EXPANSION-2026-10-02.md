# Autonom-Themen und Wissenserweiterung · 2. Oktober 2026

Der App-Auftrag ist lokal umgesetzt: Alle 21 bestehenden Themen aus `TOPIC_GROUPS` erscheinen im Autonom-Design, ergänzt um zusätzliche Themen aus dem tatsächlich geladenen Nachrichtenbestand. Die Auswahl bleibt auf Start und Entdecken verfügbar. Die Reiter haben zwei horizontal verschiebbare Reihen, übersetzte Beschriftungen, mindestens 44 px große Ziele und einen sichtbaren aktiven Zustand. Auswahl, Zurücksetzen und Tastaturbedienung verwenden die bestehenden Nachrichtenfilter. Der gewählte Reiter bleibt nach einem Neuaufbau sichtbar.

Produktänderung: `fcbd5cdf65db85b63bf7444a5788b6498d09e5ee`. Endgültiger Gesamtstand einschließlich aktualisierter Tests: `dbc5df0e3635822ace50e2f1c09f1c43984aff69`. Dazwischen wurden ausschließlich zwei Testdateien angepasst; Runtime und Inhalte blieben identisch. Die unabhängige technische Abnahme wurde beim bestehenden WRN Kontrolleur angefordert. Sie ist von der redaktionellen Prüfung der neuen Texte zu unterscheiden.

## Inhalt

| Bestand | Vorher | Jetzt |
| --- | ---: | ---: |
| Eindeutige Lexikonbegriffe | 155 | 167 |
| Lexikonreferenzen | 32 | 44 |
| Lernpfade | 3 | 4 |
| Gebundene Buchbeziehungen | 30 | 33 |
| Bibliothekstitel | 728 | 728 |
| Podcastbeziehungen in Lernpfaden | 7 | 7 |

Neue eigene DE/EN-Entwürfe: Agrarökologie, Saatgutsouveränität, Energiedemokratie, Klimareparationen, Umweltrassismus, solidarische Landwirtschaft, digitale Gemeingüter, föderierte Netzwerke, Interoperabilität, offene Standards, freies Wissen und kollektive Zugänglichkeit. Jeder Eintrag enthält Erklärung, Praxisbeispiel, Streitfragen, bestehende Begriffsverweise und eine konkrete Primärreferenz. Quellenlinks und ausstehende redaktionelle Prüfung sind direkt in den Karten sichtbar. Die Originalsprache einer Quelle bleibt erkennbar. Für weitere UI-Sprachen greift der vorhandene explizite Sprachfallback; diese neuen Einträge wurden nicht als bereits übersetzt ausgegeben.

Der neue Lernpfad „Digitale Gemeingüter und Selbstorganisation“ verbindet drei bereits vorhandene Datensätze: Frank Miroslav, *The Future of Digital Proudhonism*; Kevin Carson, *Communal Property: A Libertarian Analysis*; Colin Ward, *Anarquismo como teoría de organización*. Die DE/EN-Lesehinweise kennzeichnen die Vergleiche ausdrücklich. Wards historischer Text wird nicht als Protokolldokumentation und gemeinschaftliches Land nicht als identisch mit Daten dargestellt. Der Pfad verwendet die vorhandenen stabilen IDs und exakt deren Original-EPUB-Links.

Es wurden keine neuen Nachrichten-/Podcast-Feeds aufgenommen und keine fremden Volltexte, Bilder oder Audios kopiert. Neue Referenzen sind Quellen für die Einordnung, keine Rechtefreigaben oder Behauptungen einer autonomen politischen Identität. Die Texte sind WRN-Originalentwürfe; Primärquellen vertreten die jeweils angegebenen eigenen Perspektiven. Die vollständigen Referenzen und IDs stehen im [Inhaltsinventar](evidence/autonom-content-2026-10-02/content-inventory.json).

## Prüfung

- Vollständige Vertragsmatrix: 56 JavaScript-Module; 151 Python-Tests bestanden, 3 historische Skips, 4 bestandene Subtests; 4 zusätzliche Python-Main-Verträge bestanden.
- 42 gezielte Python-Prüfungen bestanden; Release-Audit 161/161 ohne Warnungen oder Fehler.
- Themen-Browsertest: alle 21 Filter mit passenden Meldungen, „Alle“, Tastatur bis zum letzten Reiter, neun UI-Sprachen × 320/390/768/1440 px, vier Breiten bei 200 % Text, kein Dokumentoverflow oder abgeschnittene Reiter.
- Inhalt-Browsertest: alle zwölf neuen Einträge in DE/EN mit Streitfrage, passendem Quellenlink und Entwurfsstatus; vier Lernpfade und 33 gebundene Buchbeziehungen.
- Bibliotheksregression: 728 Datensätze trotz unvollständigem Fernkatalog, Entnahme bleibt nach fehlgeschlagenem Refresh und Neustart wirksam; Sprache, Suche, Format, Tastatur und Größen bestanden. Widerruf eines neuen Begriffs blendet seine gebundenen Buchvergleiche aus.
- Übersetzungs-/Teilen-Regressionsbrowser bestanden, einschließlich unabhängig übersetzter Schlagzeile, manueller Übersetzung, übersetzter Teilen-Überschrift und Buttons auf kleinen Breiten. Die Browserprüfung verwendet isolierte Antworten, keine neuen externen KI-/Share-Aufrufe.
- Zwei veraltete Testannahmen wurden korrigiert: der VM-Test lädt jetzt das vollständige Themenverzeichnis und seinen Helfer; die historische Mindestabdeckung begrenzt das wachsende Lexikon nicht mehr auf 170 Definitionen. Eindeutige IDs und gültige Beziehungen werden weiterhin anhand des tatsächlich exportierten Lexikons geprüft.

Belege: [Browser](evidence/autonom-content-2026-10-02/browser-topics-content.json), [Bibliothek](evidence/autonom-content-2026-10-02/browser-library.json), [Teilen/Übersetzung](evidence/autonom-content-2026-10-02/browser-translation-sharing.json), [Vertragsmatrix](evidence/autonom-content-2026-10-02/contract-matrix.txt), [Audit](evidence/autonom-content-2026-10-02/release-audit.json).

## Vorschau und Distribution

Aktuelle Vorschau: `http://127.0.0.1:8765/index.html?preview=8`, im Browser geöffnet und dort die 21 Themen plus „Alle“ geprüft. Cachebindung: JS63, CSS52, Lexikon9; Produktion `2.1.2-r17`, Vorschau `v105`. App-Check, Validator und Audit verwenden denselben Stand. Die Produktions-Cachebezeichnung beschreibt vorbereiteten Code; dieser Arbeitsgang hat ihn nicht veröffentlicht.

Google Play bleibt beim verifizierten Code32. Das bisherige unsignierte Code33-Paket mit Quelle `ce2b556` und SHA-256 `3B833A549CC8B4B3085AA9701620883A20150AD1D268FDF3625043BBC04277AD` ist für diesen Auftrag überholt: Es enthält diese Inhalte und Reiter nicht. Dateien bleiben als historische Belege erhalten; dessen Signierer darf nicht als nächster Release-Schritt gestartet werden. Kein neuer Android-Build, keine Signierung und kein Upload erfolgten in diesem Arbeitsgang.

Nächste Roadmap-Schritte: redaktionelle Prüfung der zwölf Entwürfe und drei Leseverknüpfungen; danach einen neuen Android-Kandidaten aus dem endgültigen geprüften Stand bauen und auf Gerät prüfen. Weitere Übersetzungen sowie zusätzliche Bibliotheks-/Podcast-Aufnahmen bleiben separat mit konkreten Quellenbelegen vorgemerkt.

## Spätere Finalisierung desselben Tages

Der oben dokumentierte Entwurfsstand bleibt historisch erhalten. Die zwölf neuen Begriffe und drei Leseverknüpfungen sind inzwischen geprüft und finalisiert; zwei identische unsignierte Android-Kandidaten aus `34e22d9` enthalten diese Inhalte und die Startübersetzungsreparatur. Aktueller Stand und nächste Schritte: [Code-33-Bericht](KNOWLEDGE-TRANSLATION-CODE33-2026-10-02.md). Der konkrete neue Kandidat ist noch nicht signiert, auf einem Gerät abgenommen oder hochgeladen.
