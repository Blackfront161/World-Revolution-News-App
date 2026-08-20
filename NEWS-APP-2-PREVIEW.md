# News App 2 – isolierte Vorschau

Diese Vorschau entwickelt World Revolution News parallel zur veröffentlichten App weiter. Sie ersetzt keine bestehende Einstiegsdatei und verändert weder `index.html` noch die produktiven Cloudflare Worker. Ihr eigener Service Worker gilt ausschließlich für den Pfad `next.html` und verwendet getrennt benannte Caches.

## Lokal testen

```powershell
node scripts/serve_news_app_2.js
```

Danach `http://127.0.0.1:8765/next.html` öffnen.

Für einen Test auf einem Smartphone im selben privaten WLAN:

```powershell
node scripts/serve_news_app_2.js --host 0.0.0.0
```

Das Skript gibt anschließend die passenden WLAN-Adressen für das Smartphone aus. Eine Windows-Firewall-Freigabe nur für private Netzwerke erteilen.

Die lokale Vorschau verwendet öffentliche Daten aus dem Repository. Übersetzungsanfragen von `127.0.0.1` können vom produktiven Worker wegen dessen Origin-Schutz abgelehnt werden. Das ist beabsichtigt; die produktive Origin-Liste wird für diese Vorschau nicht gelockert.

## Bereits umgesetzt

- getrennte Navigation für Start, Für mich, Entdecken, Medien und Gespeichert
- zehn aktuelle, nach Quellen durchmischte Artikel als Standardansicht
- höchstens zwei Beiträge derselben Quelle unter den ersten zehn
- eigener Startseitenblock für aktuelle Meldungen aus gefolgten Regionen, Themen und Quellen, ohne das Zehn-Artikel-Limit zu überschreiten
- lokale Interessenwahl nach Regionen und Themen
- Suche und Filter mit schrittweisem Nachladen
- nativer Medienbereich mit getrennten Ansichten für aktuelle und informative Videos, Original-Podcasts, erzeugte Podcasts und Live-Radio
- Podcast-Suche sowie Filter nach Region und den Kategorien Politik, Gesellschaft und Kultur
- datensparsames Audio: Podcasts und Radios starten niemals automatisch; defekte Streams verweisen auf die Originalseite
- Live-Radio ohne irreführende Warteschlange; Favoriten bleiben verfügbar
- kompatible gespeicherte Artikel über den bestehenden Schlüssel `wrn_bookmarks`
- Übersetzen direkt in der Artikelübersicht für Titel und Einleitung
- Artikelansicht mit kompakter Werkzeugleiste für Zusammenfassen, Übersetzungsvergleich, kostenlose Gerätestimme, Zine, Lesestatus und Teilen
- Originalquelle als ruhiger Link im Artikel statt als großer Aktionsbutton
- am Artikelende bis zu fünf weitere Meldungen derselben Quelle; der aktuell geöffnete Artikel ist links cyan markiert
- neun angebotene Oberflächensprachen
- mobile Vollbild-Artikelansicht und mindestens 44 × 44 Pixel große Bedienflächen
- sinnorientiertes Hamburger-Menü ohne doppelte Navigation: Farbdarstellung, Schriftgröße und Artikeldichte sowie getrennte Bereiche für Projekt und Diagnose
- dreistufiger, vollständig lokaler Briefing-Assistent für Themen/Regionen, Sprache, Vorlesen und wortmengenbasierte Längen von 3, 5, 10 oder 20 Minuten
- automatische Übersetzung der fünf Start-Kurzmeldungen in die App-Sprache; bereits übersetzte Meldungen werden lokal wiederverwendet
- erzeugte Podcasts aus dem R2-Livebestand mit automatisch erneuertem, ablaufgeprüftem Wiederherstellungs-Snapshot
- responsive Bilder ohne Abschneiden: vollständige Darstellung im Desktop-Rahmen und auf Smartphones oberhalb des Artikels
- vollständige Smartphone-Bilder innerhalb des Cyan-Rot-Bildrahmens sowie dauerhaft sichtbare seitliche Verlaufsmarkierung
- vollständige Einleitungen in der Nachrichtenübersicht ohne harte Zeilenbegrenzung
- klar getrennte Bereiche für Themen-/Regionsmarkierungen und Artikelaktionen
- Nachrichtenarchiv mit den Zeiträumen aktuell, 7 Tage, 30 Tage und alle Artikel
- Regionen als einheitliches Filterraster und Themen in vier redaktionellen Ressorts statt einer unstrukturierten Gesamtliste
- erweiterte lokale Feed-Einrichtung für Regionen, Themen, bevorzugte oder ausgeblendete Quellen, beobachtete Gefangene und Entwicklungen, App-Sprache und Briefing-Länge
- kompaktere Entdecken- und Medienauswahl mit redaktionell geordneten Themen
- Zine-Werkstatt im Medienbereich mit gemeinsamer lokaler Artikelliste, Gestaltung sowie Druck-/PDF-Ausgabe
- Termine mit Suche, Länderfilter, Enddatum-Logik, Archiv und zusammengefassten Wiederholungen
- Lexikon mit mehreren Unterbereichen, Suche, 100+ Begriffen, Quellen und Downloads
- Gefangenen-Solidarität mit verifizierten Profilen, zugehörigen Nachrichten und privater Briefwerkstatt
- „Entwicklungen · Beta“ mit strengem Mehrquellenabgleich, sichtbarer Verbindungsbegründung und lokaler Beobachtungsliste
- eigener Offline-Cache mit netzwerkbevorzugten Updates für JavaScript, CSS und Daten
- eigener Vorschau-Header mit dem neuen WRN-Bildlogo, klarer Größenhierarchie und stabil gerenderter Smartphone-Navigation
- identisch geformte Schaltflächen für „Artikel öffnen“ und „Übersetzen“ in allen Übersichtskarten
- Spenden-Schaltfläche im Hamburger-Menü mit demselben ausdrücklichen PayPal-Hinweis wie in der bisherigen App

## Release-Kandidat

Der Stand `2.0.0-rc.1` ist der erste vollständige Veröffentlichungskandidat
der parallelen Oberfläche. Er bleibt über `next.html?preview=8` vollständig
von der bisherigen App getrennt.

Zusätzlich zum bisherigen Vorschauumfang enthält RC1:

- Quellenprofile sowie redaktionelle Format-, Aktualisierungs- und Korrekturhinweise
- vollständige, abschnittsweise Übersetzung langer Artikel
- Übersetzungsvergleich und vorbereitete Fehlermeldung
- lokale und serverseitig erzeugte Artikel-Podcasts mit kurzer oder vollständiger Fassung
- globalen Audioplayer mit Warteschlange, Favoriten, Weiterhören, Zeitsprüngen, Tempo, Schlaf-Timer und Media Session
- gelesene Artikel, Lesefortschritt und Wiederaufnahme an der letzten Position
- erweiterte Nachrichtenfilter nach Sprache, Herkunft, Format, Quelle und Sortierung
- Karten-, Kompakt- und Schlagzeilenansicht
- professionell gruppierte Terminarten, Stadt-, Gruppen-, Datums- und optionale Umkreisfilter
- Kalenderdatei, Karten-/Routenlink, lokale Erinnerung und gespeicherte Terminfilter
- lokalen Datenexport/-import sowie getrenntes Löschen von Leselisten, Vorschau-Cache und App-Daten
- integrierten Systemstatus, Quellenprofile, Quellenprüfung und redaktionelle Prüfliste
- OLED-, gedämpfte und 200-Prozent-Darstellung
- vollständig übersetzte RC1-Bedienoberfläche in allen neun App-Sprachen

Die zugehörige Prüfliste steht in
`NEWS-APP-2-RELEASE-CHECKLIST.md`.

## Noch nicht produktiv geschaltet

- produktive Freischaltung des neuen Designs
- Änderung an Google Play, GitHub Pages oder Cloudflare
- Freigabe einer Vorschau-Origin für Übersetzungen und natürliche Podcast-Stimmen

## Funktionsabgleich mit der bisherigen App

Der erneute Abgleich vom 28. Juli 2026 zeigt: Die aktuell genutzten
Nachrichten-, Übersetzungs-, Audio-, Zine-, Termin-, Lexikon-, Solidaritäts-,
Such-, Lesezeichen-, Diagnose- und Personalisierungsabläufe der bisherigen
App sind in RC1 vorhanden. Die neue Oberfläche ordnet diese Funktionen
teilweise neu, entfernt sie aber nicht.

Nicht in RC1 aufgenommen wurden ausschließlich später geplante Erweiterungen,
insbesondere alternative soziale Medien und ein zukünftiger Briefing-Verlauf
mit Export, Import und Rückmeldungen.

Die lokale Smartphone-Vorschau bleibt absichtlich von den produktiven
Übersetzungs-Origins getrennt. Automatische Übersetzungen werden in einer
freigegebenen App- oder Web-Origin ausgeführt und anschließend lokal
wiederverwendet; die Live-Worker werden für LAN-Adressen nicht geöffnet.
