# Korrigierter App-Kandidat

Produkt `b96111dc1f1f2e865d2682844392406d95449161` ersetzt den unabhängig mit RED geprüften Navigationsstand `7f60477`. Der erste Bericht und seine Hashbindungen bleiben als historischer, nicht freigegebener Kandidat erhalten. Der Bibliotheksimport war im ersten Review bereits bestätigt und ist unverändert.

Der Kontrolleur beanstandete im Turn `01a0ffd3-060e-7e72-b581-3464665884d3` zwei Punkte:

1. **Hilfeprivacy:** Die UI verspricht, Hilfefilter und geöffnete Profile nicht im Verlauf zu speichern. `helpFilters` wird jetzt vollständig aus den Historienfiltern ausgeschlossen; Hilfe-Fokus und -Scrollposition werden ebenfalls nicht gespeichert. Suchtext/Orte bleiben im flüchtigen UI-Zustand und werden weder in URLs noch in History-Snapshots geschrieben. Keine neue Persistenz oder Übertragung.
2. **Browsernavigation:** Scroll und Fokus werden jetzt auch bei Scroll-/Focusin-Ereignissen gesichert. Ein Ansichtswechsel schreibt seinen Fokus nicht in den noch ausgehenden Eintrag. Die App verwendet manuelle Scrollwiederherstellung und unmittelbare Scrollwechsel, damit Browserautomatik und noch laufende weiche Scrollbewegungen den restaurierten Zustand nicht überschreiben.

Der Korrekturcommit verändert genau vier Dateien: `news-app-2-core.js`, `news-app-2.js` sowie die beiden neuen Route-/Browsernavigationstests. Bibliothek731, ursprüngliche728Records, alle Quellen-/Widerrufsregeln, native Version und Offline-Assetpins bleiben unverändert. Das [finale Manifest](hash-manifest.json) bindet alle25 Pfade des vollständigen ursprünglichen Produktpakets jetzt an den Korrekturcommit und benennt zusätzlich dessen vier geänderte Pfade.

Gezielte Nachprüfung mit Node24.19.0: Route-/Privacy-Unitprüfung, bestehende Navigation-Smoketests, Syntax-/App-Validator und beide Chrome-Fälle bestanden. Der neue Browserfall scrollt im Podcastbereich, setzt den Fokus, geht über Browser-Back zurück und über Forward wieder vor – ohne vorgeschalteten DOM-Klick. Scrollposition und Fokus werden tatsächlich wiederhergestellt. Der negative Hilfetest bestätigt fehlende `helpFilters` und fehlenden Hilfesuchtext in `history.state`, leeren Hilfefokus und keinen gespeicherten Hilfescroll. [Navigationsbeleg](navigation-browser-result.json).

Der Bibliotheks-Browsertest wurde nach der letzten Änderung erneut bestanden:731 Metadaten, partielle/fehlgeschlagene Abrufe, persistenter Widerruf, Lernpfade, neun UI-Sprachen und vier Breiten. [Bibliotheksbeleg](library-browser-result.json). Die vorherigen52 Python-Tests/vier Subtests und atomaren Cacheverträge gelten für die unveränderten Bibliotheks-/Assetpfade; sie ersetzen nicht die fokussierte Korrekturprüfung.

Status zunächst: **lokal PASS; gezielte unabhängige Nachprüfung der beiden Findings ausstehend**. Vorschau: [App-Bibliothek](http://127.0.0.1:43243/index.html?preview=8&data=snapshot#library?language=de&format=epub). Kein App-Deployment, kein nativer Build oder Storeupload.

Das ganze Navigations-Roadmapziel bleibt teilweise offen: Item-ID-Links, vollständige Sprach-/Reflowmatrix, veröffentlichter Offline-Neustart und native Szenarien. Podcast-/Websitearbeiten bleiben beim bestehenden Arbeiter;89 Alt-Dateneinträge aus drei ausdrücklich gesperrten App-Quellen werden nicht automatisch aktiviert.
