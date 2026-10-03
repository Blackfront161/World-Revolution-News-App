# Atlas-Header vorbereitet – 3. Oktober 2026

## Ergebnis und Umfang

Die Lupe im App-Header wurde durch das vorhandene kompakte World-Revolution-Atlas-Signet ersetzt. Ein Klick öffnet die lokale Hostansicht `#atlas`. Sie zeigt den Namen World Revolution Game und einen Hinweis, dass das Game noch nicht eingebunden ist. Die Nachrichtensuche ist weiterhin über „Suche öffnen“ im Menü erreichbar.

Die aktuelle Nutzeranweisung erlaubt ausdrücklich nur die Vorbereitung: kein Game-Import. Es gibt daher keinen Game-Loader, keine iframe-Quelle, keine Atlas-Daten, Kartenbibliothek, Tiles, Supabase-Verbindung oder Game-Backendaktivierung. Website, iOS und Play-Store-Verteilung wurden in diesem Auftrag nicht geändert.

## Branding-Herkunft

Nur das vorhandene kompakte SVG wurde bytegenau übernommen, keine Game-Dateien:

- Herkunft: `C:/Users/patri/.codex/worktrees/2892/Widerstands Karte/assets/brand/world-revolution-atlas-mark-v1.svg`
- App-Datei: `world-revolution-atlas-icon.svg`
- SHA-256: `53add4992671d6e57d9e079c020df4aff691b04a1d316bc40d043d915622319a`

Das kompakte Globe-/Kompass-Signet ist für den 32-Pixel-Header vorgesehen. Es ist nicht das große beschriftete Logo. Beide App-Service-Worker führen das lokale Signet als Shellasset. Revisionspins: JS72, Core9, CSS56, App-Cache r28, Preview-Cache v116; versionCode32 bleibt unverändert.

## Vorbereiteter Einbauvertrag

- Einstieg: `#next-atlas-toggle`, erreichbar mit Tastatur, mindestens 44 × 44 Pixel; lokalisierter Name in neun App-Sprachen.
- Route: `#atlas`; kein zweiter Browser oder fremder Link. Die bestehende Navigation sichert die vorherige Appansicht, Filter, Position und Fokus. „Zurück“ führt nach einem Headerklick dorthin zurück; bei kaltem Direkteinstieg nach Entdecken.
- Einbaustelle: `#next-atlas-mount`. Ihr Status ist ausdrücklich `data-atlas-status="not-imported"`. Der Hinweis `#next-atlas-status` bleibt bis zum tatsächlichen erfolgreichen Einbau sichtbar. Jetzt kein versteckter Vorabimport.
- Späterer Host übernimmt Appsprache/Theme und Rücknavigation. Das Game wird erst nach Nutzerauftrag, Paketabnahme und beim Öffnen geladen. Keine automatische Aktivierung beim Appstart.

Für den späteren Import liefert das Atlas-Projekt ein unveränderliches Paket mit Versionsstand, Dateihashes, Herkunft/Attribution und Zulassungsstatus der Inhalte. Laufender r76-Workerstand ist kein freigegebener WRN-Handoff; ältere r68-Embeddinganleitung allein reicht nicht aus. Fremden Atlas-WIP nicht verändern.

Bei der eigentlichen Integration werden Embeddingparameter und APIs am eingefrorenen Paket geprüft: Hostsprache, Theme, `embed=1`, keine eigene eingebettete Service-Worker-Registrierung (`offline=0`), kein ungeprüftes Supabase-/Backend-Opt-in. Nur lokal gleich-origin oder ausdrücklich zugelassenes Origin; PostMessage verlangt exaktes `event.origin`, die konkrete Framequelle, ein festes Nachrichtenformat und erlaubte Nachrichtentypen. Keine Wildcard-Zielorigin und keine sensiblen Koordinaten in URL, Verlauf oder Telemetrie.

Start-/Transfer-/RAM-/Cachebudgets werden vor dem Import festgelegt und gemessen; das vorhandene Website-Shelllimit 8 MiB bleibt bestehen. Hostverantwortetes Offlinepaket, kalter Offline-Neustart, Mobilbedienung, Fehler/Abbruch, Android-WebView-Medien und Rücknavigation gehören zur späteren Abnahme. Die Vorbereitung ist kein Geräte- oder Offline-Game-PASS.

## Lokale Prüfung

Chrome mit echten App-Dateien, isolierten Nachrichten-/Providerfixtures und blockiertem Service Worker:

- Atlas-Icon per Enter, Route/Status/geladenes SVG, kein iframe; Zurück/Vorwärts erhält Suche und Fokus.
- Neun UI-Sprachen und Themes; Icon erreichbar bei 320/360/768/1440 Pixeln und Autonom bei 200 % Schrift.
- Menüsuchfeld funktioniert; kalter Atlas-Direkteinstieg hat sicheren Rückweg.
- Keine Game-/Karten-/Backendrequests und keine JavaScript-Seitenfehler.
- Bestehende Navigation im realen Chrome zusätzlich PASS: Artikel, Lexikon/Bibliothek/Podcasts, Filter, Scroll/Fokus und Quota-Anzeige.
- 33 Asset-/Offlineprüfungen, drei vorhandene Node-Navigations-/Integrationsprüfungen und `tests/validate_app.py` PASS.

Nachweis: `docs/evidence/WRN-ATLAS-HEADER-2026-10-03/`. Der ausführbare Browsernachweis schreibt ausschließlich lokale temporäre Ergebnisse; er ist kein schreibfreier Hashprüfer. Aus App-Repository starten:

```powershell
$env:WRN_PLAYWRIGHT_MODULE = '<Pfad zur vorhandenen playwright/test.mjs>'
node docs/evidence/WRN-ATLAS-HEADER-2026-10-03/browser-check.mjs
```

Roadmap: vorhandener Auftrag `ATLAS-HOST-INTEGRATION-20261003`, Status `header-entry-prepared-game-not-imported`; die eigentliche Gameintegration bleibt offen.
