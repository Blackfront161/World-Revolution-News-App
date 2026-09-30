# Autonom: Design und Quellenausbau

Auftrag vom 30. September 2026: bestehende WRN-App weiterführen, 20 Minuten als
ungefähre Designreferenz erhalten, zusätzlich das Design „Autonom“ nach dem
gelieferten Screenshot anbieten und mehr autonome/antifaschistische Quellen
in die Roadmap aufnehmen. Zielrepository ausschließlich World-Revolution-News-App.

## Design

Autonom ist eine ausdrückliche Auswahl unter Menü → Darstellung → Farbdarstellung.
Schwarzer Hintergrund, rote Akzente, weiße Serifentitel, WRN-Wortmarke mit rotem
„Revolution“, bebilderter Aufmacher und kompakte Nachrichtenkarten.
Themenchips führen zum vorhandenen Entdecken-Filter. Quellenprofilaktionen
öffnen den bestehenden Quellenpass; sie behaupten keine inhaltliche Verifikation.
Die bisherigen fünf Hauptbereiche und anderen Themes bleiben erhalten.
Schriftgröße, Sprache, Reader, Speicherung und Offline-Verträge bleiben nutzbar.
Die Auswahl benutzt den bestehenden lokalen UI-Speicher. Keine externen Fonts,
keine Demoartikel oder Protestbilder aus dem Mockup werden importiert.

20 Minuten wurde als öffentliche Webansicht direkt im Browser gesehen; die
[offizielle Android-Appbeschreibung und Screenshots](https://play.google.com/store/apps/details?id=ch.iAgentur.i20Min&hl=de)
wurden zusätzlich gelesen. Referenz: klarer Bildaufmacher, kurze Nachrichten-
hierarchie, kompakte Bedienung und untere Navigation. Die installierte native
20-Minuten-App wurde nicht bedient. Das Nutzerbild ist die visuelle Vorlage für
Autonom; darin abgebildete Behauptungen und Medien sind keine WRN-Inhalte.

## Quellenrecherche

Direkte Abrufe am 30.09.2026 über Firecrawl. Beobachtung einer Homepage bestätigt
deren Erreichbarkeit bei diesem Abruf, nicht sämtliche Inhalte, Rechte oder Betreiber.
Keine Volltexte oder Bilder wurden in die App übernommen. Feedprüfung,
Betreiber-/Identitätsprüfung, Rechte und redaktionelle Aufnahme bleiben offen.

| Kandidat | Direkter Befund | Nächster Schritt |
|---|---|---|
| [Autonome Antifa Freiburg](https://autonome-antifa.org/) | HTTP200; Seitentitel nennt die Organisation, Artikel/Datumsangaben sichtbar. | Selbstbeschreibung, Feed und Rechte prüfen. |
| [antifa-frankfurt.org](https://www.antifa-frankfurt.org/) | HTTP200 nach Redirect auf www; antifaschistische und sozialpolitische Kategorien sichtbar. | Betreiberidentität, Feed und Rechte prüfen; Beiträge mit personenbezogenen Anschuldigungen separat redaktionell prüfen. |
| [Untergrund-Blättle](https://www.xn--untergrund-blttle-2qb.ch/) | HTTP200; Selbstbeschreibung als Magazin für kritischen Journalismus aus Großraum Zürich; RSS-Verzeichnis verlinkt. | RSS-Endpunkte und Rechte prüfen; „autonom“ nicht pauschal als politische Eigenbeschreibung ausgeben. |
| [Radikale Linke / Autonome Antifa Wien](https://radikale-linke.at/) | Suchhinweis auf Beziehung vorhanden; zwei direkte Abrufe scheitern am Proxy. | Kanonische Beziehung und Website direkt bestätigen. Nicht als offline oder inaktiv einstufen. |
| [Enough 14 D](https://enough-is-enough14.org/) | HTTP200; oberste gelesene Beiträge von Januar2023. | Archiv-/Aktualitätsstatus klären. Nicht als aktuelle Nachrichtenquelle aktivieren. |

Bereits vorhanden: Antifa Bern, Antifa Infoblatt, Barrikade, Montreal Antifasciste
und Kontrapolis. Diese werden nicht nochmals als neue Quellen gezählt.
[Kontrapolis](https://kontrapolis.info/) lieferte bei der direkten Probe HTTP500
mit Datenbankfehlermeldung: Betriebsprüfung vormerken, vorhandene IDs erhalten.

## Reihenfolge

1. Autonom lokal vollständig prüfen: Auswahl, Reload, andere Themes, neun Sprachen,
   320/390/768/1440px, große Schrift, Reader, Themenchips und Quellenpass.
2. Vorhandene Start-/Archiv-/Offline-Verträge erneut prüfen und Ergebnisse hier binden.
3. Quellkandidaten nach Feed-/Rechteprüfung im getrennten Datenprojekt aufnehmen.
4. Android-Build aus einem neuen geprüften Commit; Code29-Baseline nicht als Build
   des Autonom-Designs ausgeben. Signierung/Play-Track bleiben separate Releaseaktionen.

## Lokale Abschlussprüfung

Autonom ist lokal umgesetzt und am 30.09.2026 im Browser geprüft. Die Auswahl
bleibt beim Reload erhalten. Alle acht bisherigen Theme-Auswahlen, neun
UI-Sprachen und Viewports mit 320/390/768/1440px wurden geprüft. Bei 320px und
200% Schrift sind Nachrichtenkörper nicht mehr horizontal abgeschnitten.
Antifaschismus-Themenchip, vorhandener Artikelreader und Quellenprofildialog
funktionieren. Diese Sprachprüfung bestätigt die Bedienoberfläche, nicht die
Qualität des externen Übersetzungsdienstes oder aller Dialoge in jeder Sprache.

Belege: [Browserprüfungen](evidence/autonom-2026-09-30/browser-checks.json),
[Mobilansicht](evidence/autonom-2026-09-30/autonom-mobile.png) und
[Desktopansicht](evidence/autonom-2026-09-30/autonom-desktop.png).
Die Screenshots zeigen echte vorhandene Feedartikel. Inhalte werden dadurch
nicht redaktionell bestätigt.

Maßgeblicher Stand: **0c8aa3d7972aca99ff8127d917181d2c98a4410b ist funktional
akzeptiert.** WRN Kontrolleur hat am 30.09.2026 die vollständige Vertragsmatrix
ausschließlich lesend reproduziert:45 JavaScript-Module und117 Pytest-Tests
bestanden,3 historische AAB-/Signaturfixturetests übersprungen;4 main-only-
Python-Skripte bestanden. Validator bestanden, Read-only-Audit160/160 bestanden.
Der Arbeitsbaum blieb bei dieser unabhängigen Prüfung sauber und unverändert.

Beleg des Paketlaufs: [vollständige Matrix](evidence/autonom-2026-09-30/full-contract-matrix.txt).
Die Node-Abdeckung prüft Auswahl/Persistenz/Rückwechsel, neun UI-Sprachen,
echte Themenfilter und Quellenprofilaktion. Sie ersetzt keine Browsergeometrie-
oder Geräteprüfung. Status-/Diagnosenachpflege wird separat nachgeprüft.

Assetstand: CSS47 / JS53; App-Cache `wrn-app-v2.1.2-r4`, alternativer Worker v92.
Der Daten-Cache bleibt unverändert. Android-Gerät/Upgrade, vollständiger
Offline-Neustart, neuer AAB-Build und Veröffentlichung sind für diese Änderungen
noch offen. Keine neue Quelle wurde im Produktregister aktiviert.

Offene nächste Gates: automatisierte Browser-/Fokus-/Reflow-Regressionsstrecke
einschließlich reduced motion, kompletter Offline-Neustart, Android-Geräte-
und Upgradeprüfung, neuer commitgenauer Build sowie artefaktgebundene Signierung
und Play-Veröffentlichung. Zuständigkeiten: [Koordination](COORDINATION-2026-09-30.md).

## Historiennotiz zum initialen Zwischenstand

Zu Beginn wurden35 Testfunktionen unmittelbar mit ihren Assertions ausgeführt;
in der zunächst isoliert verwendeten Laufzeit war Pytest nicht vorhanden.
Anschließend wurde der bereits vorhandene lokale Pytest9.1.1-Paketordner mit
der vorhandenen gebündelten Python-Laufzeit verwendet. Die vollständige Matrix
oben hat diese Teilprüfung abgelöst; der initiale Befund ist kein aktuelles Gate.
