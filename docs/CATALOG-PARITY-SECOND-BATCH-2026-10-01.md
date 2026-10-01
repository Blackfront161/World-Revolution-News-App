# Zweiter Katalogabgleich: bestehende Podcasts und Bibliothek

Lokaler Kandidat vom 1. Oktober 2026. Der Nutzer hat den vorgeschlagenen nächsten Schritt – die 16 App-exklusiven Quellen prüfen und anschließend die Bibliothek abgleichen – mit „ok mache das bitte“ beauftragt. Dieser begrenzte Auftrag umfasst Quellen-/RSS-Metadatenprüfung und lokale Umsetzung. Er startet keinen anderen Quellenauftrag und erteilt keine Medienrechte. Es wurde nichts signiert, hochgeladen oder veröffentlicht; Code32 bleibt unverändert.

## Ergebnis

- Alle 16 bereits in der App konfigurierten Quellen sind im Datenrepository registriert; beide Registries haben jetzt 52 stabile IDs einschließlich des getrennten RDL-Endpunkts.
- 444 vorhandene Folgen wurden mit denselben IDs als Metadaten und Originalverweise ergänzt: Datenbestand 1.193, Appbestand weiterhin 908. Unbetroffene Folgen und Quellen bleiben unverändert. Vollständige Podcastparität ist damit noch nicht erreicht.
- Ungeprüfte Rechte aktivieren keine fremden Beschreibungen, Bilder, Streams, Transkripte oder Offlineaudios. Die 16 Quellen besitzen eine ausdrückliche Metadatenpolitik; auch alte Queue-Einträge mit bloßer Folgen-ID werden erfasst. Die RDL-Identitätskorrektur gilt weiterhin ausschließlich für den RDL-Endpunkt.
- Vier Quellen sperren frische Aufnahme: 12 Rules For WHAT wegen abweichender Feedidentität, L'Orage und INFOWAR wegen noch offener unabhängiger Endpointbindung sowie Contrabanda wegen gemischter Einzelsprache. Zwei davon sind deaktiviert: 12 Rules und Contrabanda. Vorhandene Metadaten werden erhalten.
- Beide Bibliothekskataloge enthalten dieselben 715 Werk-IDs, darunter 53 deutsche Titel. Alle 609 bisherigen App- und 266 Datenkatalog-IDs bleiben enthalten. Die beiden abweichenden Autorenschreibweisen entsprechen jetzt der Originalbibliothek („Iain Mckay“); eine neuere Werkrevision wird übernommen.
- Bibliothekscollector und App führen Teilkataloge zusammen. Eine fehlende Zeile ist keine Löschung; ausdrückliche `withdrawn`/`revoked`/`deleted`-Einträge bleiben als Rücknahme erhalten und können durch einen alten Cache nicht wieder erscheinen. Inaktive Quellen werden nicht aktiviert. Dies vergibt keine Text-/Download-/Offlinerechte; Links führen weiterhin zum Originalhost.
- Podcastcollector kontaktieren gesperrte Aufnahmen nicht, verwerfen zukünftige Veröffentlichungen und bewahren fehlgeschlagene Quellen auch bei erfolgreicher Teilaktualisierung außerhalb enger Auswahlbudgets.

## Quellenbefunde

Die [technischen Beobachtungen](evidence/catalog-parity-2026-10-01/source-observations.json) trennen erfolgreiche RSS-Antwort, ältere gespeicherte Auswahl und offene Identitäts-/Rechtefragen. Zwölf Feedantworten waren parsebar; vier lieferten Timeout beziehungsweise HTTP 403. Es wurden keine Audiodateien heruntergeladen und keine Kopierrechte bestätigt.

| Quelle | Einordnung dieser Runde |
| --- | --- |
| Queering The Air, Out of the Pan | Offizielle [3CR-Programmseiten](https://www.3cr.org.au/queeringtheair) und [RSS-Verweis](https://www.3cr.org.au/outofthepan); Queering-Homepage auf funktionierende Hauptdomain korrigiert |
| Live Like the World Is Dying | Creator-Homepage verlinkt konfigurierten Pinecast-Feed |
| 12 Rules For WHAT | Alte Homepage 404; Feed heißt Red Flare Podcast. Keine Nachfolgerbeziehung behauptet; Aufnahme gesperrt |
| Histoires d'A | Programmverzeichnis verlinkt Feed; gespeicherte Auswahl als Archiv |
| L'Orage | ORA und passender Creator-Feed beobachtet; unabhängige Bindingprüfung offen, frische Aufnahme gesperrt |
| Carapatage, Chroniques rebelles | Archividentität dokumentiert; Feed-/Homepage-Timeout. Letzte Metadaten erhalten |
| Fumaça | Offizielle Homepage verlinkt konfigurierten Omny-Feed |
| Açık Yeşil, İklim Kuşağı Konuşuyor | Offizielles Programm identifiziert; konfigurierte RSS-Endpunkte 403. Kein frischer Import |
| Contrabanda Specials | Gemischtes Spanisch/Katalanisch; Kanalsprache genügt nicht. 35 gespeicherte Folgen jetzt `und`, Sprachprüfung offen, neue Aufnahme gesperrt |
| INFOWAR | Passender Creator-Feed, offizieller Podcastbereich; Homepage-Probe 403, unabhängig bestätigte Endpointbindung offen |
| ΕΠΑΝΑΣΤΑΣΗ | RSS nennt marxismos.com als Herausgeber; offizielle Homepage passt |
| Mudawanat | Omny-Programmseite verlinkt Feed; historische CC-Angabe bleibt unbestätigt, Metadatenpolitik gilt |
| Jalsa | [Arab Reform Initiative](https://www.arab-reform.net/podcast-serie/) verlinkt RSS; AR/EN bleiben pro Folge bestimmt |

Die zwei Autorenschreibweisen wurden anhand der Originalkatalogseiten für [100,000 plus dead](https://theanarchistlibrary.org/library/anarcho-100-000-plus-dead-mission-accomplished) und [150 years of Libertarian](https://theanarchistlibrary.org/library/anarcho-150-years-of-libertarian) abgeglichen.

## Reproduktion und Prüfung

`scripts/reconcile_existing_catalogs.py` liest die unveränderlichen Gitstände App `71c11c6bd4ff2d3cbc09dec41db54380f32dde58` und Daten `dcb0e7f7e97b9a437019ad4a17c9a3bc9a8c3915`. Ohne `--write` erfolgt keine Produktänderung. Mit `--write` werden zwischenzeitlich geänderte Kataloge abgewiesen. Ein-/Ausgabehashes und Zählungen: [bindings.json](evidence/catalog-parity-2026-10-01/bindings.json).

- Gesamte Vertragsmatrix auf App-Implementierung `6cd25662c46c5b84c556c011a6a397cf0f7993e6`: 51 JS-Verträge; 145 Python-Tests und vier Subtests bestanden, drei übersprungen; vier eigenständige Python-Skripte bestanden.
- Isolierte Browserprüfung: aktuelles Autonom-Design, Classic und alter Classic-Podcastdialog einschließlich fehlendem Politikmodul bestanden; keine Remote-Medienanfrage.
- Isolierte Bibliotheksprüfung: echter 715-Titel-Katalog plus begrenzter Spiegel und Rücknahme; deutsche Suche/Autor/Format, Tastatur, 320/390/768/1440 Pixel, neun UI-Sprachen sowie vollständiger Katalog-Netzwerkausfall mit gespeichertem Rücknahmeeintrag bestanden.
- Neue lokale Cachegeneration App r10 / Preview v98; keine Änderung des Android-Versioncodes. Diese Generation ist nicht im bereits signierten Code32 enthalten.
- Unabhängige Prüfung dieses neuen Batches: angefordert; vorherige RDL-Abnahme gilt nicht als Abnahme dieser Änderungen.

Der Kontrolleur fand im ursprünglichen Kandidaten `50d1122b` / `03a10224` einen Rechteblocker: Die historische Mudawanat-Lizenz wurde im alten Classic-Dialog trotz unbestätigter Rechte sichtbar. Die Korrektur ersetzt Lizenzfelder der 16 Quellen und ihrer Folgen ausdrücklich durch „Rights unverified; original source only“ und propagiert `rightsStatus: unverified`. Die Runtime überschreibt auch alte Cacheangaben und reine historische IDs. Die Browserprüfung umfasst jetzt eine tatsächlich sichtbare Mudawanat-Karte aus einem alten CC-Payload; die CC-Angabe und fremde Medien dürfen dort nicht erscheinen. Das ursprüngliche Zwischenurteil war RED, eine erneute Abnahme dieser Korrektur steht aus.

Die Sprachsperre von Contrabanda gilt zusätzlich für alte Feed-/Cache-Payloads: Quellen-ID oder eine der 35 historischen Folgen-IDs erzwingen `und` und offenen Reviewstatus. Eine alte sichtbare Classic-Karte mit behauptetem Spanisch wird in der Browserprüfung als UND dargestellt. Der frische Intake bleibt gesperrt.

Endgültige Implementierungsstände: App `6cd25662c46c5b84c556c011a6a397cf0f7993e6`, Daten `e62f56280b737ce6559b830d4a4bba7c349d506f`. Der Generator erzeugt alle Bindingfelder selbst; der neue Dry-Repro-Vertrag prüft unveränderte Produkt- und Nachweisbytes. Drei lokale historische Snapshotprüfungen überspringen in einem einzelnen flachen CI-Checkout ausdrücklich fehlende Eingangsrefs/Datencheckout; vier unabhängige Funktionsverträge für Rechte, Sprache, Holds und Archivretention laufen dort weiter. Mit beiden lokalen gebundenen Checkouts bestehen alle sieben Prüfungen. Das Produktverhalten wurde vom Kontrolleur angenommen; der abschließende Abgleich dieses aktualisierten Nachweislogs steht noch aus.

## Noch offen

Vollständige gemeinsame Podcastprojektion einschließlich bewusster Ausschlüsse (u. a. Leftover Talk und zurückgestellter Sprachen), Übernahme des gemeinsamen Katalogs durch den Website-Verantwortlichen und fachredaktionelle Klärung der vier Holds. Danach die 19 weiteren Lexikonbearbeitungen und drei belegten Lernpfade mit jeweils zehn Originaltexten. Die sechs neuen Podcastkandidaten und die Erweiterung dreier separat zugänglicher Archive auf bis zu 100 Folgen bleiben eigene Aufnahme-/Umsetzungsaufgaben.
