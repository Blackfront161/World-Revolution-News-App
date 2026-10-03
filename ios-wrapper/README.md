# World Revolution News für iOS

Lokaler iOS-Port der aktuellen WRN-App **2.1.2**, aus App-Commit
`83db91794d0e2f167eca3037fb7d725b31f52ab7`, getrennt vom Projekt WRN Next.
Das Xcode-Projekt nutzt Capacitor **8.4.0**, Swift Package Manager und
**iOS 17 oder neuer**, auf iPhone und iPad. Die Mindestversion ermöglicht den
systemeigenen Kalendereditor ohne Zugriff auf bestehende Kalenderdaten.

Der iOS-Port besitzt den eigenen Arbeitsbranch `codex/ios-app`, den
Plattformordner `ios-wrapper/` und den Workflow **WRN iOS Build**. Für AI-Agenten
legen `../AGENTS.md` und `AGENTS.md` die Dateizuordnung und Plattformgrenzen fest.
iOS-Pull-Requests werden im Titel mit `[iOS]` gekennzeichnet.

Für den Entwurfs-PR ist `codex/ios-source-baseline-83db917` als Basis vorgesehen:
Der vorhandene lokale gemeinsame App-Stand ist neuer als GitHub-`main`.
Der separate Basisbranch hält diesen Ausgangsstand fest, damit dessen Web- und
Android-Änderungen nicht im iOS-Diff erscheinen. Die spätere Integration der
gemeinsamen Basis und des iOS-Ports wird getrennt geprüft.
Der Benutzer hat den öffentlichen Branch-/PR-Upload am 2026-10-03 nach
Vorlage des vollständigen Umfangs ausdrücklich freigegeben. Umfang und
vorherige automatische Ablehnung stehen in
`../docs/IOS-PUBLICATION-SCOPE-2026-10-03.md`.

## Gemeinsames Frontend und Backend

Die App-Oberfläche wird weiterhin ausschließlich in der Repositorywurzel
gepflegt. Classic und Autonom, neun Sprachen, Nachrichten, Artikel, Quellen,
Termine, Podcasts/Radio, Bibliothek, Lexikon, Solidarität, Hilfe und Zine
werden aus derselben Quelle übernommen. `www/` und das native `public/`
sind generiert. Jede Eingabedatei und ihre gepackte Ausgabe erhalten einen
SHA-256 im lokalen Manifest `ios-wrapper/.tmp/web-manifest.json`.
`index.html` erhält die iOS-Adapter und die Safe-Area-CSS-Ergänzung. Der generierte
Artikel-Speicherpfad erhält einen geprüften Aufruf des iOS-Assetspeichers;
die gemeinsame Frontendquelle bleibt unverändert.

Die öffentlichen Daten- und Worker-Adressen aus `news-app-2-config.js`
bleiben autoritativ. Daten kommen vom vorhandenen GitHub-Datenprojekt mit
dem vorhandenen Mirror; Feedback, Übersetzungen und erzeugte Podcasts nutzen
die vorhandenen Worker. Beide Worker erlauben bereits `capacitor://localhost`.
Backendcode läuft weiterhin auf dem Server. Adminoberfläche, Secrets,
Python-Aggregatoren und Backendquellen werden nicht in die App gepackt.

Native Anbindungen:

- Teilen von Artikeln, Radios und Podcasts über den vorhandenen Share-Plugin.
- AirPrint/PDF über `WRNDevice.print`; Druck-CSS bleibt bis zum Dialogabschluss aktiv.
- Termine mit dem iOS-Kalendereditor; Speichern erfolgt durch die Person im Systemdialog.
- Lokale Erinnerungen mit dem vorhandenen Local-Notifications-Plugin, erst nach Freigabe.
- JSON-/Text-/Zine-/Kalenderexporte über die Systemfreigabe einschließlich „In Dateien sichern“.
- Schwarzer Startbildschirm, vorhandenes WRN-Icon, Safe Areas und Audio-Playback-Session.
- Artikelbilder und Detailpakete auf ausdrückliches Offline-Speichern: separater
  IndexedDB-Assetspeicher, maximal 8 MiB pro Datei und 64 MiB insgesamt.
  HTTPS ohne Cookies, begrenzter Download, Bildwiederherstellung und bestehende
  Löschaktionen sind verbunden. SVG-Downloads bleiben ausgeschlossen.

## Auf Windows prüfen

Im Verzeichnis `ios-wrapper`:

```powershell
npm ci --ignore-scripts --cache .tmp/npm-cache
npm run sync:ios
npm test
```

Der Sync exportiert Appdateien, registriert Share/LocalNotifications, normalisiert
von Windows erzeugte SPM-Pfade und prüft Hashparität. Ein vorheriges `www/`
bleibt unter `.tmp/` als Rückfall erhalten. Es gibt keine Signierung oder Installation.

## Ohne eigenen Mac: GitHub-Build

Der vorbereitete Workflow `.github/workflows/ios-build.yml` kompiliert auf
einem GitHub-Runner mit `macos-26` und Node.js 22. Er startet ausschließlich
manuell, hat nur lesenden Repositoryzugriff und verwendet keine Apple-Secrets.
Er führt den vorhandenen Sync, die iOS-Vertragstests und Xcode-Builds für
Simulator und unsignierte iPhone-/iPad-Geräte aus. Er startet keinen Simulator
und ersetzt keine Geräteprüfung.

Zunächst muss die Workflow-Datei über einen geprüften Pull Request auf den
Standardbranch übernommen werden, damit GitHub `workflow_dispatch` anbietet.
Der gesamte iOS-Port kann dabei auf seinem separaten Prüfbranch bleiben.
Danach in **Actions → WRN iOS Build → Run workflow** den iOS-Branch
`codex/ios-app` auswählen; dessen Quellprojekt und Buildskripte werden gebaut.
Der erste Lauf ist noch nicht ausgeführt. Upload und Start benötigen
die eigene Freigabe gemäß `OPERATIONS.md`; macOS-Läufe können je nach
Repositorysichtbarkeit und Kontingent GitHub-Actions-Minuten verbrauchen.

Ein erfolgreicher Lauf liefert für drei Tage:

- `wrn-ios-unsigned-…`: Simulator-App und unsignierte Geräte-App als `tar.gz`,
  Dateihashes, Quellenmanifest und klare Prüfgrenzen.
- `wrn-ios-build-logs-…`: Commit, Runner-/Xcode-/Node-Versionen und Build-Protokolle,
  auch bei einem Kompilierungsfehler.

Die TAR-Pakete erhalten Dateirechte und Framework-Symlinks. Die Simulator-App
benötigt weiterhin einen Mac mit passendem Simulator. Die unsignierte Geräte-App
ist noch nicht auf einem iPhone installierbar. Ein installierbarer TestFlight-
Kandidat benötigt im nächsten Schritt ein Apple-Developer-Konto, die bestätigte
Bundle-ID und eine separat freigegebene Signierung auf einem macOS-Runner.

Dokumentation: [GitHub-macOS-Runner](https://docs.github.com/en/actions/reference/runners/github-hosted-runners),
[manuelle Workflows](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow),
[Artefakte und Dateirechte](https://github.com/actions/upload-artifact#permission-loss).

## Auf dem Mac bauen

Voraussetzung: Node.js 22+, **Xcode 26+** mit Command Line Tools und iOS-SDK.
Das vollständige Repository übernehmen, nicht nur `ios-wrapper`: der Export
braucht das gemeinsame Frontend. Das bereitgestellte Quell-ZIP funktioniert
auch ohne `.git`; `SOURCE-ORIGIN.json` bindet dann den Frontend-Ausgangsstand,
und der Sync prüft weiterhin alle tatsächlichen Datei-Hashes. Danach:

```sh
cd ios-wrapper
npm ci --ignore-scripts
npm run sync:ios
npm test
npm run build:simulator
npm run open:ios
```

`build:simulator` führt den Sync und die Tests erneut aus und kompiliert ein
unsigniertes Simulatorpaket nach `outputs/ios/simulator/`.
`build:device:unsigned` kompiliert ein unsigniertes Gerätepaket; dieses kann
ohne Signatur nicht auf einem iPhone installiert werden.

Für einen Geräte-/TestFlight-Kandidaten in Xcode das Apple-Developer-Team und
die Bereitstellungsprofile des Projekts auswählen. Die Bundle-ID
`com.world.revolution` ist vom bestehenden Produkt übernommen; ihre freie
Registrierbarkeit im Apple-Konto ist noch zu prüfen. iOS-Buildnummer startet
eigenständig bei 1. Kein Schlüssel und kein Teamkonto sind im Quellprojekt.
Archivierung, Signierung und Upload sind separate Schritte.

## Noch erforderliche Apple-Prüfungen

Der Windows-Lauf bestätigt Export/Hashparität und JavaScript-Verträge,
keine Swift-Kompilierung und keine native Gerätefunktion. Auf Mac/iPhone/iPad
sind diese Prüfungen noch offen:

1. Xcode-Kompilierung und Start mit dem tatsächlichen Capacitor-Bridge.
2. Classic/Autonom, neun Sprachen, VoiceOver, große Schrift, reduzierte Bewegung,
   Safe Areas, Portrait/Landscape und Tastatur.
3. Live-Daten mit Offline-Rückfall; gemerkte Artikel und Einstellungen nach Neustart.
   WKWebView bietet auf `capacitor://` keinen PWA-Service-Worker. Die lokale
   Apphülle, der vorhandene IndexedDB-/Bookmark-/Hilfepaketspeicher und der
   ergänzte Artikel-Assetspeicher stehen zur Verfügung. Persistenz und Offline-
   Bildanzeige nach einem echten iPhone-Neustart bleiben als Gerätetest offen.
4. Systemdialoge für Teilen, Export, Kalender, Abbruch und AirPrint/PDF.
5. Erinnerungsberechtigung, verweigerte Berechtigung, Termin löschen und Daten löschen.
6. Radio/Podcast nach Sperren, Audio-Unterbrechung, Wiederaufnahme und Schlaf-Timer.
7. Feedback-/Übersetzungs-CORS, Datenschutzangaben und Store-Metadaten.

**Nachrichten-Push ist noch offen:** Das existierende Gateway verwendet Web Push
und VAPID. Die native App braucht APNs, Apple-Entitlements und einen getrennten
Backendvertrag. Lokale Termin-Erinnerungen sind davon unabhängig.

Das Privacy-Manifest bildet freiwillig gesendetes Feedback und die optionale
Antwortadresse ab; Tracking ist deaktiviert. Die finalen App-Store-Datenschutz-
Angaben müssen gegen alle tatsächlich genutzten Backendpfade geprüft werden.

Status: **Xcode-Quellprojekt und lokaler Sync-Kandidat; kein signiertes IPA,
keine Geräteabnahme und keine App-Store-Freigabe.**

Primärdokumentation: [Capacitor-Umgebung](https://capacitorjs.com/docs/getting-started/environment-setup),
[native iOS-Plugins](https://capacitorjs.com/docs/ios/custom-code),
[Apple-Kalendereditor](https://developer.apple.com/documentation/eventkit/accessing-calendar-using-eventkit-and-eventkitui).
