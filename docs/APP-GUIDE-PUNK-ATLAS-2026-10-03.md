# Punk-Atlas-Icon und App-Aufgabenhilfe – 3. Oktober 2026

Produktquelle: `2481ef1a0cdd23a839c38f0058cfc9b73c0c90a6`.

## Punk-Icon

Das vorhandene Atlas-Signet wurde als repo-natives SVG weiterentwickelt: rot-schwarze Windrose, gebrochener Stencil-Rand, warme helle Kontur und dezente Globuslinien. Header und vorbereitete Atlas-Hostansicht verwenden `world-revolution-atlas-punk.svg`. Die ursprüngliche bytegenaue Vorlage `world-revolution-atlas-icon.svg` und ihr historischer Herkunftsnachweis bleiben erhalten; die neue Variante ist eine eigene App-Bearbeitung, keine Behauptung eines unveränderten Atlas-Originals. Keine Rastergenerierung oder externe Grafikdaten.

`#atlas` und `#next-atlas-mount` bleiben vorbereitet. Kein Game wurde importiert oder aktiviert. [Bisheriger Einbauvertrag](ATLAS-HEADER-PREPARATION-2026-10-03.md) gilt weiterhin. Die dortigen ursprünglichen Pins/Assethashes beschreiben den vorigen Quellstand; aktuell sind JS73, Core9, CSS57, Appcache r29 und Previewcache v117.

## Roadmap-Schritt HELP-AUDIO-TRANSLATION-20261003

Die neue **App-Hilfe** im Menü unterscheidet sich vom bestehenden Solidaritätshilfeverzeichnis. Sechs aufklappbare Aufgaben erklären Radio, Podcasts/Gerätestimme/gemeinsame Hördatei, Teilen, Übersetzen/Cache/Wartezeiten, Offline/Gespeichert und Feedback. Neun Sprachfassungen stehen lokal in `app-guide.js`; keine Übersetzungs-API wird zum Öffnen aufgerufen.

Die Radioanleitung nennt Start/Pause/Stop, das 15-Sekunden-Fallbackbudget und die Grenze zwischen Originalwebsite und freigegebenem Stream. Sharing erklärt Original-/Appverweise und übersetzte Artikelüberschriften. Übersetzung erklärt Original- und Zielsprache, passenden gemeinsamen Cache, bestätigte WRN-Kontingente/Reset und unbekannte Providerlimits. Offlinehilfe unterscheidet zuletzt verfügbare Daten und Merkliste von heruntergeladenem Audio/Video/Buch. Feedback wird erst nach Absenden übertragen.

Direktaktionen führen zu Radio, Originalpodcasts, Bibliothek, Nachrichtensuche, Systemstatus, lokalen Daten und Feedback. Die App-Weiterempfehlung verwendet den vorhandenen Sharingweg. Öffnen der Anleitung spielt keine Medien ab, erzeugt keine Hördatei und sendet keine Meldung. Schließen oder Escape stellt den Header-Menüfokus wieder her; beim Öffnen eines Inhalts erhält dieser den regulären Navigationsfokus. Zurück hält Suchfilter und Position.

## Prüfung und Grenze

[Eingefrorene Belege](evidence/WRN-APP-GUIDE-PUNK-2026-10-03/source-report.json): 33 Pythonprüfungen, vier Nodeverträge, Appkonsistenz und Syntax bestehen. Echte Chrome-Bedienung prüft alle neun Sprachfassungen, sechs Aufgaben, 320/360/768/1440 Pixel, neun Themes bei360 und 200 % Text. Escape/Schließen, Radio-/Bibliotheksrückkehr, Suchfokus, Systemstatus, lokale Daten und Feedback funktionieren. App-Sharing wird mit einem lokalen Share-Mock geprüft. Keine Media-/Speechstarts und keine POST-Anfragen wurden beobachtet. Das Punk-SVG lädt in Autonom, Hell und Dunkel.

Die bereits geladene App öffnet die Hilfe auch offline. Beide Service-Worker führen Modul und SVG als lokale Shellassets. Das ersetzt keinen kalten Offline-Neustart oder Android-/iOS-Gerätenachweis. Die übrigen Sprachfassungen sind UI-geprüft, noch keine menschlich-redaktionelle Sprachabnahme. Website/iOS werden separat angepasst; ihr laufender/freigegebener Stand bleibt unverändert. Kein neuer nativer Build oder Storeupload; bestätigte Produktion bleibt Code32/2.1.2.

Der Browsernachweis `browser-check.mjs` wird aus dem App-Repository mit `WRN_PLAYWRIGHT_MODULE` auf die vorhandene Playwright-Installation ausgeführt. Er erzeugt lokale `.tmp/app-guide-20261003`-Dateien und ist kein schreibfreier Hashverifier. Belegtexthashes sind ausdrücklich auf LF normalisiert, Binärdateien bytegenau; Git-Blobs binden den Produktstand.
