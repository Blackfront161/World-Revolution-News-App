# App: Direktlinks, Rückkehrkontext und Bibliotheksangleichung

Produkt: `7f60477b1deabf8229f7040f2ff542ee1345acc5`, Basis `2130e024f565f744e39f3eb4e68408884623236a`. Lokale Prüfungen bestanden; unabhängiger Abschlussreview steht zunächst aus. Kein nativer Build, Storeupload oder App-Deployment.

## Erreichbare Änderung

Die bestehenden elf App-Bereiche besitzen Direktlinks, etwa `#library`, `#lexicon`, `#media/podcasts`, `#media/generated`, `#media/radio`, `#media/radio-podcasts` und `#media/video`. Quelle, Sprache, Thema, Format beziehungsweise Region werden bei passenden Bereichen als öffentliche Filter unterstützt. `next.html` erhält den Fragmentteil beim bisherigen Redirect.

Zurück/Vorwärts stellt unabhängige Filter-/Suchzustände, Archivquellen, Scrollposition und vorhandenen Fokus wieder her. Suchtexte, Hilfesuche, Entwürfe, Artikeltexte und Standortkoordinaten werden nicht in Direktlinks aufgenommen; die Historie übernimmt nur ausdrücklich aufgeführte UI-Felder. Geokoordinaten und Briefentwürfe werden auch nicht in die Historie kopiert. Ein reproduzierter Fehler durch zwei konkurrierende Artikel-Close-/History-Fokuscallbacks wurde behoben.

Die vorhandenen Designs und Renderer bleiben erhalten. Core-Assetrevision7 und App-Assetrevision68 sind in Einstieg und beiden Service Workern gebunden; Produktionsshell r24 und Vorschau v112 erzwingen das konsistente Offline-Update. Die native Versionsnummer bleibt unverändert. Die Cachepin-Tests und App-Prüfseite wurden exakt nachgeführt; keine Schutzprüfung wurde deaktiviert.

## Inhaltsabgleich und Aufnahmegrenze

[catalog-parity-before.json](catalog-parity-before.json) vergleicht den bisherigen App-Worktree mit den unveränderlichen Git-Dateibytes des veröffentlichten Data-Commits `5304fa0032a6761071962e4b74b66cb6f114c49f`. App-Hashes sind die tatsächlichen Worktreebytes; Data-Hashes die Commitbytes. Die Aufnahme im Bericht ist keine allgemeine redaktionelle Freigabe.

Bibliothek vorher728, Data731: alle bisherigen IDs/Felder und alle neun Quellen stimmen überein. Genau drei bereits unabhängig im Website-Kandidaten `d738a94` geprüfte Metadateneinträge wurden über den vorhandenen Merge-/Widerrufsvertrag übernommen: „Sobre las mujeres“, „Actually Existing Multipolarity“ und „Reading ‘What is Property?’ Pt. I — On the Character of Proudhon“. Die 728 bisherigen Einträge bleiben feldgleich. Keine neue Quelle, Buchdatei oder Buchtexte wurden aufgenommen/abgerufen. SHA256 der neuen App-Bibliothek ist bytegleich zu Data: `283f3661c2b528e3fe39da753f9ef4b18d5e07109c082705e509f5f4d75e5db8`. [Aufnahmebeleg](library-refresh.json).

Podcasts: App1778 Zeilen, Data1865; 1778 gemeinsame eindeutige IDs, 87 zusätzliche IDs und 20 Feldabweichungen. Alle 56 Quellen sind feldgleich. Podcastdaten wurden in diesem App-Paket nicht verändert. Der bestehende Website-Arbeiter prüft seinen gesonderten URL-Abgleich mit 16 Final-Straw-Migrationen und zwei wiederverwendeten LORA-IDs. Eine Kennung oder Feedpräsenz allein beweist keine Episode/Aliasbeziehung; Abwesenheit führt zu keiner automatischen Löschung.

## Prüfung des konkreten Produkts

- Node24.19.0: neue Route-/Filter-/URL-Privacytests, vorhandene Core-, Navigation-, Bibliotheksmerge-, Lernpfad-, Update- und atomare Cachetests bestanden; JavaScript-Syntax und dependency-freier App-Validator bestanden.
- Python: 52 Tests und vier Subtests bestanden; Bibliotheksimport, Widerrufe, Katalogaudit und betroffene Offline-/Medien-/Assetmodule. Zusätzlich importierte ältere Assetmodule prüfen ihre aktualisierten aktuellen Cachepins weiterhin.
- Echter isolierter Chrome-Browser mit lokalen News-/Dienstfixtures: kalter Redirect nach Bibliothek mit DE/EPUB, Browser-Zurück/Vorwärts mit unterschiedlichen Suchtexten und Medienbereichen, echte Scroll-/Fokuswiederherstellung und Artikelöffner, Direktlinks nach Radio/Sendungen/Video/Lexikon/Hilfe, DE/EN bei360/768/1440 ohne horizontalen Überlauf. Keine Browserfehler. [Navigationsbeleg](navigation-browser-result.json).
- Bestehender Bibliotheks-Browsertest: alle731 stabilen Einträge trotz partieller Remoteantwort, persistenter Widerruf, Suche/Autor/Format/Tastatur bei320/390/768/1440 und neun UI-Sprachen; alle Katalogrequests beim Reload fehlgeschlagen, gespeicherter Bestand und Widerruf bleiben erhalten. Nach Reload werden die nun bewusst erhaltenen DE/EPUB-Routenfilter explizit geleert, bevor der gesamte Bestand gezählt wird. [Bibliotheksbeleg](library-browser-result.json).

Die Browsertests belegen UI und lokale Speicherung mit Fixtures, keine Live-Feeds, tatsächliche Audio-/Videodecodierung oder native Hintergrund-/Sperrbildschirmsteuerung. Vollständige Item-ID-Direktlinks, alle neun Sprachen in der gesamten Navigationsmatrix, 200%-Reflow, ein veröffentlichter Offline-Neustart und die übrigen Roadmap-Szenarien stehen weiter aus.

## Koordination

Der bestehende Website-Kandidat `d738a94`/`2d890ff` wurde vom Kontrolleur unabhängig mit PASS akzeptiert; 46 Website-/49 Hostingdateien und fünf ZIPs/49 Rollbackdateien geprüft. Der Website-Arbeiter führt den bereits menschlich beauftragten Rollout selbst aus und dokumentiert abschließend Live-Hashes, Header und Offline-Neustart. Bis zu diesem Beleg wird der neue Website-Stand nicht als live abgeschlossen geführt. Keine zweite Website-Implementierung.

Nächste Aufgaben: laufenden Website-Rollout abschließen, Podcast-ID-/Rechtekonflikte im bestehenden Workflow klären, Navigationsabnahme vervollständigen und Radio-/Kontingent-/Hilfeszenarien in ihren bestehenden Aufgaben bearbeiten. Das gesamte erste Roadmap-Paket bleibt in Arbeit.
