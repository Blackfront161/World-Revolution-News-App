# Roadmap: Navigation und gemeinsame Bibliotheksmetadaten

Die App-Navigation und Bibliotheksangleichung sind als Quellkandidat unabhängig akzeptiert: Produkt `b96111dc1f1f2e865d2682844392406d95449161`, Beleg `7a8c3252ab4662fab19896b5fd1d89bb94792da3`. Der Kontrolleur schloss seine beiden ursprünglichen Findings mit PASS im Turn `01a0ffdc-fdcc-7160-9168-b53100192aa5`. [Korrektur und Prüfgrenzen](evidence/WRN-APP-NAVIGATION-2026-10-03/correction/REPORT.md), [unabhängige Abnahme](evidence/WRN-APP-NAVIGATION-2026-10-03/correction/independent-review.json).

## Umgesetzt und geprüft

- Direktlinks zu den elf bestehenden Bereichen und sechs Medienunterbereichen, zum Beispiel `#library`, `#lexicon`, `#media/podcasts` und `#media/radio`. Geeignete Quellen-, Sprach-, Themen-, Format- und Regionsfilter sind verlinkbar; der bestehende Redirect erhält sie.
- Zurück/Vorwärts erhält unabhängige Such-/Filterzustände und die Position/Fokus der vorherigen Ansicht. Der tatsächliche Browserfall ohne vorgeschalteten DOM-Klick und der Rückweg aus einem Artikel sind geprüft. Konkurrierende Fokus-/Scrollwiederherstellung wurde korrigiert.
- Die sichtbare Hilfeprivacy-Zusage bleibt erhalten: keine Hilfesuche, manuell eingegebene Orte, Standortkoordinaten oder Briefentwürfe in Direktlinks oder History-Snapshots. Hilfe-Fokus/-Scroll werden ebenfalls nicht gespeichert.
- App-Bibliothek und Data haben nun bytegleiche731 Metadateneinträge: genau drei zuvor in der Website unabhängig bestätigte Ergänzungen. Alle728 bisherigen Records bleiben feldgleich, alle neun Quellen unverändert. Keine Buchdateien oder Volltexte importiert.
- Offline-Assetpins und die App-Prüfseite sind konsistent nachgeführt. Bestehende Rechte-, Widerrufs- und atomare Updateprüfungen bleiben erhalten.

Lokale Prüfung:52 Python-Tests/vier Subtests, bestehende Core-/Navigation-/Cache-/Bibliotheks-/Lernpfadverträge und zwei echte Chrome-Prüfungen mit isolierten Dienstfixtures bestanden. Nach den Review-Findings wurden die betroffenen Unit-/Browserfälle erneut geprüft; der Kontrolleur reproduzierte die konkrete Korrektur, prüfte25/25 Produktblobs und4/4 Korrekturbelege und akzeptierte das Paket. Seine Erstprüfung bestätigte bereits die vollständige Bibliotheksherkunft. Kein allgemeiner Live-Feed-/Playback- oder nativer Geräte-PASS wird daraus abgeleitet.

## Bestehende Website-Arbeit

Der bereits vorhandene Website-Arbeiter integriert die angeglichene Bibliothek731, vier frisch geprüfte Regionaltermine und fünf Solidaritätslinks im Kombinationsstand `d738a9454161f1f6aff624bcb9c2a9f0bc2ccf60`/Beleg `2d890ffd0ae09af219ce124c4dbb951191db210b`. Der unabhängige Website-Paketreview besteht:46 Website-/49 Hostingdateien, fünf ZIPs,49 Rollbackdateien,7830361 Shellbytes unter8MiB; Widerrufsstand unverändert.

Der menschlich beauftragte Rollout läuft beim selben Arbeiter. Die öffentliche Bibliothek und Medienkataloge sind dort im normalen Chrome sichtbar. Er grenzt die Abbruchfälle im separaten Testbrowser auf HTTP/3-Abrufe mit12–19Sekunden gegenüber unter einer Sekunde über HTTPS/HTTP1.1 für dieselben geprüften Bytes ein. Der Test über den funktionierenden Transport ist kein Nachweis behobener HTTP/3-Latenz. Diese bleibt in der bestehenden Website-Aufgabe offen. Die abschließende Live-/Header-/Offlineprüfung ist bei dieser Aufnahme noch nicht fertig. Daher wird der neue Website-Stand noch nicht als vollständig live abgenommen geführt. [Website-Kandidat und Belege](<C:/Users/patri/Documents/World Revolution News/wrn-next-live-work/docs/evidence/WRN-WEBSITE-LIBRARY-REGIONAL-2026-10-03/REPORT.md>).

## Nächste bestehende Aufgaben

1. Website-Rollout mit tatsächlichen Hash-/Header-/Offlinebelegen abschließen; Prüfprobleme sauber von erfolgreichen Livefällen trennen.
2. Podcast-ID-/Rechteabgleich im vorhandenen Workflow: App1778 gemeinsame IDs mit Data1865,87 weitere IDs,20 Feldabweichungen. Website-Abgleich unterscheidet16 Final-Straw-Domainmigrationen von zwei wiederverwendeten LORA-IDs. Diese werden nicht stillschweigend zusammengeführt.89 ältere Dataeinträge aus drei ausdrücklich gesperrten App-Quellen bleiben gesperrt; keine der87 neuen IDs gehört dazu. Podcastkataloge wurden in diesem App-Paket nicht verändert.
3. Navigationsabnahme vervollständigen: Item-ID-Direktlinks, neunsprachige vollständige Matrix,200%-Reflow, Website-Rückkehrkontext und native Szenarien. Radio-/Wiedergabe-, Kontingent-/Fallback- und Hilfetests folgen in ihren vorhandenen Roadmap-Aufgaben.

Lexikon-/Bibliotheksredaktion, Videoqualität, Atlas und iOS bleiben in den bereits angelegten Aufgaben. Es wurden keine zusätzlichen Roadmap-Aufgaben oder parallelen Website-Implementierungen angelegt. Das gesamte erste Roadmap-Paket bleibt in Arbeit.

Frische lokale [App-Vorschau](http://127.0.0.1:43244/index.html?preview=8&data=snapshot#library?language=de&format=epub). Kein neuer nativer Build, Play-Upload oder App-Deployment wurde ausgeführt; ein gespeicherter Quellkandidat ist kein Storeupdate.
