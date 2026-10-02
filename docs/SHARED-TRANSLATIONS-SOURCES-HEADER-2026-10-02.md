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

Prüfung: 155 Python-Tests, 57 JavaScript-Testdateien, acht Worker-Cachetests,
sechs Daten-Aufnahmetests, App-Validator und 161 Release-Auditprüfungen bestanden.
Header: neun Sprachen und vier Breiten; zusätzlich vier Breiten bei 200% Textgröße.
Der historische Bibliotheksabgleich verwendet seinen unveränderlichen angenommenen
Datenstand d7da528 statt späterer geplanter Aktualisierungen im Daten-Arbeitsbaum.

Google Play bleibt auf Code32. Der bisherige unsignierte Code33 aus 34e22d9 enthält
diese neue Kopfzeile und die neue Offline-Quellenliste noch nicht. Er ist als aktueller
Kandidat abgelöst; erneuter Build, Signierung und Gerätetest bleiben offen.
Seine historischen Hash-Nachweise werden erhalten und nicht nachträglich umgebunden.
