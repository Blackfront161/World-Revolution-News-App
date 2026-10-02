# Gemeinsame Übersetzungen, Quellen und Autonom-Kopfzeile

Öffentliche Artikelübersetzungen werden schon im zentralen Cloudflare-KV gespeichert.
Der Schlüssel umfasst Zielsprache, Modus, Titel und Originaltext; er enthält keine
Nutzerkennung. Zwei Nutzerkennungen und zwei erlaubte App-Ursprünge lieferten live
MISS und HIT mit identischem Text. Eine weitere Cache-Lesung bestätigte storage=kv.
Die bestehende Aufbewahrung beträgt sieben Tage, danach kann neu übersetzt werden.
Ein Test mit verschiedenen IP-Adressen bestätigt Wiederverwendung für Titel/Text
und Fortsetzungsabschnitte sowie getrennte Ergebnisse für geänderte Sprache oder Text.
Kein Worker-Neudeployment war dafür nötig. Regionale Edge-Fallbacks und direkte
Client-Fallbacks bei Störungen sind keine globale KV-Speicherzusage.

ACIN - Tejido de Comunicación und Debates Indígenas sind als neue Metadatenfeeds
integriert. Mapuexpress wird unter seiner bestehenden Feed-Adresse angereichert.
Quellenbewertung und Primärnachweise: Datenrepo docs/INDIGENOUS-SOURCES-2026-10-02.md.
[PR 40](https://github.com/Blackfront161/Revolution-News-Data/pull/40) wurde nach
beiden grünen Projektprüfungen eingespielt (32fa88c). Der automatische Schnellabruf
37016044973 war erfolgreich; im veröffentlichten Nachrichtenarchiv sind zwei ACIN-
und sechs Debates-Meldungen mit Originalverweisen und ohne fremde Texte/Medien belegt.
Der App-Offline-Quellenbestand ist ebenfalls ergänzt; unbekannte Herkunft bleibt unbekannt.

Im Autonom-Design stehen Menü, App-Titel, rot-schwarzer WEB-Link, Sprache und Suche
in einer gemeinsamen Kopfzeile. Titel darf bei schmaler Ansicht und großer Schrift
umbrechen. Alle Bedienelemente behalten mindestens 44px Touch-Fläche.
CSS 53, Produktionscache r20 und Vorschaucache v108 sind gemeinsam gebunden;
JavaScript bleibt 65. Die aktuelle Vorschau bestätigt CSS53 und Grid-Zeile1.

Prüfung: 162 Python-Tests (kompletter Lauf vor dem zusätzlichen Kategorien-Regressionsfall), 57 JavaScript-Testdateien, acht Worker-Cachetests,
neun Daten-Aufnahme-/Alias-/Kategorientests, App-Validator und 161 Release-Auditprüfungen bestanden.
Header: neun Sprachen und vier Breiten; zusätzlich vier Breiten bei 200% Textgröße.
Der historische Bibliotheksabgleich verwendet seinen unveränderlichen angenommenen
Datenstand d7da528 statt späterer geplanter Aktualisierungen im Daten-Arbeitsbaum.

Google Play bleibt auf Code32. Der bisherige unsignierte Code33 aus 34e22d9 enthält
diese neue Kopfzeile und die neue Offline-Quellenliste noch nicht. Er ist als aktueller
Kandidat abgelöst; erneuter Build, Signierung und Gerätetest bleiben offen.
Seine historischen Hash-Nachweise werden erhalten und nicht nachträglich umgebunden.

## Abschluss des Quellenarchivs

Der sichtbare Quellenwähler zeigte eine weitere Integrationslücke: Die beiden
Nachrichtenabläufe erzeugten das gezielt geladene Quellenarchiv nicht erneut.
[PR41](https://github.com/Blackfront161/Revolution-News-Data/pull/41) ergänzt den
vorhandenen Archiv-Generator und seine Dateien im regulären Commit-Schritt.
Das geprüfte Archiv enthält 124 Quellen und 3097 Meldungen, darunter beide neuen
Quellen. Importmodus und Rechtehinweis bleiben im Archiv erhalten. Der Offline-
Archivbestand der App wurde auf denselben Stand gebracht; alte unreferenzierte
Dateien wurden nicht gelöscht.

Der Kontrolleur fand einen Mapuexpress-Homepage-Alias mit veralteter Sprache/Policy.
Die Registry-Erzeugung überträgt geprüfte Angaben nun auf gleichnamige Aliase
desselben Hosts. Feed- und Homepage-Adressen bleiben erhalten. Andere Hosts oder
Namen erhalten diese Angaben nicht. Ein Test mit vertauschter Reihenfolge prüft
die echte App-Filterlaufzeit auf Spanisch, Metadatenbegrenzung und geprüfte Herkunft.

Die Gates fanden zudem vier schon zuvor eingespielte UB-Metadatenmeldungen mit
nichtkanonischem Europa und fehlenden Klassifikationsfeldern. Der bestehende
Classifier erhält für Metadatenmeldungen ausschließlich Überschrift und
Quellenkategorien, keinen fremden Text. Die neunzehn bestehenden Metadatensätze
wurden entsprechend korrigiert. Generische unklare Themen bleiben prüfbar.
Die Aufnahmebegrenzung wurde auch in den archivierten App-Generatorskripten
übernommen, sodass ein späterer Lauf dort keine Volltexte dieser Quellen kopiert.
Beide GitHub-Gates bestanden am korrigierten PR-Stand d792478.


## Behaltene Altbeiträge

Die zweite unabhängige Abnahme fand noch einen alten Mapuexpress-Beitrag mit
Fremdtext und Bild im behaltenen Archiv. Der Archiv-Generator wendet die
explizit freigegebene metadata-only-Policy jetzt auf alle zusammengeführten
Datensätze an, einschließlich allein im bisherigen Archiv vorhandener Links.
Alle sechs Mapuexpress-Archivbeiträge sind nun Spanisch, ohne fremde Inhalte oder
Medien. Fremde/nicht-HTTPS Links unter diesem Publisher werden ausgeschlossen,
andere Publisher bleiben unverändert. Vierzehn historische Metadatensätze im
App-news.json wurden ebenfalls begrenzt; Original-Link und vorhandene ID bleiben.
Der komplette App-Testlauf danach: 164 PASS, drei historische SKIPs, vier Subtests.
Der Daten-Regressionslauf: zehn PASS. Weitere Veröffentlichung per Folge-PR42.
