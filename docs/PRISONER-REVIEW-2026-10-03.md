# Gefangenensolidarität: Primärquellenprüfung vom 3. Oktober 2026

Alle 30 vorhandenen Profile wurden gegen ihre öffentlichen Unterstützungsquellen gelesen. Der Datenblock ist als App-Kandidat umgesetzt, noch nicht in einer neuen Android-/Play-Version veröffentlicht. Es wurden keine neuen Personen, privaten Kontakte, Spendenziele, fremden Biografien, Fotos oder Audios aufgenommen.

## Datierte Adressprüfung und offene Aktualität

13 US-Adressblöcke stimmen mit dem am 24. September angekündigten [NYC-ABC-Leitfaden 19.8](https://nycabc.wordpress.com/2026/09/24/guide_19_8/) überein. Die direkt gelesene PDF hat 16 Seiten, 4.705.368 Bytes und SHA256 `d7b19d149db3c1aa63df4b3a414d89bf313e2f72b443da7dd49ccc3f2745c4ab`. Mehrspaltige Blöcke wurden zusätzlich visuell geprüft. Der neue Adressprüftermin liegt am 3. Oktober; die Frist endet am 8. November, spätestens 45 Tage nach dem Belegdatum. Haftstatus und individuelle Versandvorschriften wurden nicht unabhängig bestätigt. Vor jedem Versand ist der Originalstand erneut zu prüfen.

Die zehn deutschen und sieben britischen Profile stehen weiterhin in den direkt gelesenen Verzeichnissen von [ABC Dresden](https://abcdd.org/gefangene/) und [Prisoners for Palestine](https://prisonersforpalestine.org/writing-to-prisoners/). Die Seiten nennen kein hinreichend klares aktuelles Datum für die einzelnen Adressbestätigungen. Ihre alten Prüfdaten wurden nicht verlängert: Status `needs-review`, Schreiben/Kopieren/Drucken bleiben gesperrt. Ein HTTP200 oder ein vorhandener Name bestätigt keinen aktuellen Haftstatus. Für diese 17 Profile bleibt eine datierte individuelle Bestätigung offen; niemand wurde allein wegen eines fehlenden Datums als freigelassen eingestuft.

Die veröffentlichten Anschriften für Hanna, Finn und Carmen wurden genauer an die Originalschreibweise angepasst. Finns Weiterleitungszusatz `c/o Scheffel` ist jetzt enthalten. Pauls bestehender Hinweis enthält das von der Quelle genannte Verbot von Zeitungsartikeln. Bei Oso Blanco wurde der im aktuellen Leitfaden enthaltene Geburtstag ergänzt. Weiterleitungsadressen von öffentlichen Solidaritätsorganisationen sind von privaten Familien- oder Rechtsbeistandsadressen getrennt.

## Fünf zusätzliche Unterstützungsangebote

Nur Namen, selbst verfasste Beschreibung, geprüfter Originalverweis und Zugriffsbeleg wurden aufgenommen. Diese Verzeichniseinträge bestätigen keine einzelne Person und räumen keine Mediennutzungsrechte ein:

- [NYC Books Through Bars](https://www.booksthroughbarsnyc.org/): öffentliches Buchunterstützungsangebot.
- [Water Protector Legal Collective](https://www.waterprotectorlegal.org/): indigene Organisation für Rechte und rechtliche Unterstützung; keine individuelle Rechtsberatung durch WRN.
- [Jericho Movement](https://www.thejerichomovement.com/): öffentliches Netzwerk für Gefangenensolidarität.
- [Prison Radio](https://www.prisonradio.org/): Originalberichte und Stimmen von Gefangenen; kein Audioimport in diesem Block.
- [Prisoner Solidarity](https://www.prisonersolidarity.com/): nach eigener Beschreibung von Philadelphia ABC betreutes Verzeichnis, ursprünglich von Los Angeles ABC aufgebaut. Verzeichnisangaben werden weiterhin einzeln geprüft.

Alle fünf antworteten beim direkten begrenzten Abruf mit HTTP200. Die Web-Leseoberfläche konnte einzelne Angebote zusätzlich nicht laden; aus dieser technischen Differenz wurde weder eine Rechtefreigabe noch eine dauerhafte Verfügbarkeit abgeleitet. UTC-Zeit, Endadresse, Bytezahl und SHA256 stehen in `docs/evidence/prisoner-roadmap-2026-10-03/source-observations.json`. Quellentexte/PDF und Prüfabbildungen bleiben temporäres Lesematerial und sind kein Produktinhalt.

## Abnahme und weiterer Weg

Die gezielten JS-/Datenverträge bestanden. Sie prüfen die wirkliche Aktualitätsfunktion, eine trotz zukünftigem Datum gesperrte `needs-review`-Adresse, sämtliche 17 offenen Profile, Ablauf der bestätigten Profile, maximal 45 Tage ab Belegdatum und die SHA-Bindung jedes beobachteten Profils. Der echte Browserlauf mit tatsächlichem Modul und Datensatz zeigt 30 Profile/34 gesperrte Aktionen für die 17 offenen Profile, verweigert direkten Werkstattzugriff, zeigt 13 aktuell bestätigte Adressen und sperrt nach dem 8. November alle 30 Profile. Kein Geräte- oder Haftstatusnachweis aus diesem Lauf. App-Validator PASS; schreibfreier Audit 161/161 ohne Warnungen/Fehler. Unabhängige Prüfung des konkreten Daten-Freezes steht noch aus.

Dieser Block ändert keine Worker, Cachegenerationen oder Android-Artefakte. Eine spätere App-Veröffentlichung muss die Daten zusammen mit einer frischen Cache-/Assetgeneration binden und prüfen; Google Play bleibt beim veröffentlichten Code32. Der Website-Arbeiter erhält erst den geprüften Folge-Freeze, getrennt von seinem Radio-/Lexikon-/Lernpfadpaket.

Danach folgen die vier Bibliotheksadapter (Libcom, Kate Sharpley Library, Zabalaza Books, Anarchist Archive), die nächste DE/EN-Lexikonredaktion und die Hilfe-Erweiterung. Der aktuelle Gefangenenblock ersetzt diese noch geplanten Aufgaben nicht.
