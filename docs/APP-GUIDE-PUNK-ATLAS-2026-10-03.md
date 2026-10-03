# Punk-Atlas-Icon und App-Aufgabenhilfe – 3. Oktober 2026

Aktuelle Produktquelle mit Offlinekorrektur: `7a3574aaf4f180a4a435bf174ee4ec2b46c5ba1d`. Ursprüngliche UI-Quelle: `2481ef1a0cdd23a839c38f0058cfc9b73c0c90a6`.

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

## Offlinekorrektur nach unabhängiger Prüfung

Der Kontrolleur verweigerte den ursprünglichen Quell-PASS wegen einer P1-Lücke: Guide und Header-SVG waren zwar in den Shelllisten, aber nur optional. Der alte Installationsvertrag konnte trotz ihres Fehlens einen Cache aktivieren. Der gespeicherte ursprüngliche Browsernachweis war ausdrücklich nur warm offline; er deckte diesen Fehler nicht ab. Historischer Befund bleibt in `correction/initial-controller-findings.json` erhalten.

Korrekturquelle `7a3574a` nimmt `app-guide.js?release=1` und `world-revolution-atlas-punk.svg` in **beide Core-Listen** auf. Cachegenerationen sind Produktion r30 und Preview v118; app-check und bestehende Pinprüfungen stimmen überein. UI-Pins bleiben JS73/Core9/CSS57.

Der neue Verhaltenstest `tests/test_worker_install_contract.js` prüft sämtliche extern geladenen index-Skripte als Core-Abhängigkeiten. Fehlende Guide-/SVGdateien verweigern Installation und Aktivierung, führen weder skipWaiting noch claim aus und lassen vorherige Caches erhalten. Erfolgreiche Installation liefert beide Dateien einer frischen Worker-VM offline.

[Zusätzlicher echter Chrome-Nachweis](evidence/WRN-APP-GUIDE-PUNK-2026-10-03/correction/browser-result.json): Für Produktion und Preview wird zunächst der vollständige frühere Worker aus 2481ef1 aktiviert. Updates auf den exakten korrigierten Worker scheitern gezielt an Guide-HTTP503 und SVG-HTTP503; der tatsächliche alte Worker und Cache bleiben aktiv. Nach vollständigem Fetch aktiviert die neue Generation. Danach funktionieren Hilfe und Icon warm offline sowie nach vollständigem Chrome-/Profilneustart. Während dieser Offlinephasen zerstört der lokale Testserver alle eingehenden Verbindungen zusätzlich zur Browser-Offlinestellung; die App kann keine fehlenden Pflichtdateien vom Testserver nachladen. HTTPS-Dienste sind lokale leere Fixtures. Keine Seiten-JavaScriptfehler; kein Game-Import.

Die ersten Testversuche mit langen Profilpfaden stießen auf CacheStorage-Fehler der Windows-Testumgebung. Der endgültige reproduzierbare Nachweis nutzt kurze eigene Browserprofile im System-TEMP. Er erzeugt dort Profile und lokale .tmp-Ergebnisse und ist kein schreibfreier Hashverifier.

Die korrigierten Assethashes sind ausdrücklich SHA256 der LF-normalisierten Git-Blobbytes. Der frühere SVG-Hash bezeichnete Windows-Checkoutbytes mit CRLF; er bleibt historisch erhalten und wird nicht als kanonischer Git-Dateihash ausgegeben. Neuer Nachweis: `correction/source-report.json` und `correction/sha256.json`.

Damit ist der kalte lokale Chrome-Offlinepfad geprüft. Menschliche Sprachabnahme, native Geräte-/Hintergrund-/Sperrbildschirmprüfung und Website/iOS-Verteilung bleiben offen. Die korrigierte Quelle wird gesondert unabhängig nachgeprüft.
