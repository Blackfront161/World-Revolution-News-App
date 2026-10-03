# WRN iOS: Anweisungen für AI-Agenten

Geltungsbereich: `ios-wrapper/` und der dazugehörige iOS-Export, Build, Test und
Workflow aus der Dateizuordnung in der übergeordneten `AGENTS.md`.

## Identität und Stand

- Plattform: Apple iOS, iPhone/iPad, Mindestversion iOS 17.
- App: bestehende WRN-App 2.1.2, keine WRN-Next-App.
- Bestehender Port: `codex/ios-app`. Separater aktueller Frontend-Kandidat:
  `codex/ios-guide-content-20261003`; Änderungen nur im dafür vorgesehenen Worktree.
- Vorgesehene PR-Basis: `codex/ios-source-baseline-83db917`, ein Snapshot der vorhandenen
  gemeinsamen App vor dem Port. Der PR-Diff enthält ausschließlich den iOS-Port.
  Vor einer späteren Integration nach `main` zuerst die gemeinsame Basis mit
  dem dafür verantwortlichen App-Arbeitsstand abgleichen.
- Der Benutzer hat den dokumentierten öffentlichen Branch-/PR-Upload am
  2026-10-03 ausdrücklich freigegeben; Umfang und vorherige Ablehnung stehen
  in `../docs/IOS-PUBLICATION-SCOPE-2026-10-03.md`. Den tatsächlichen Remote-
  und PR-Status bei einer Übergabe prüfen.
- Frontend-Ausgangscommit: `83db91794d0e2f167eca3037fb7d725b31f52ab7`.
- Native Hülle: Capacitor 8.4.0, Swift Package Manager, Xcode 26+ und Node.js 22+.
- Der aktuelle Prüfstatus steht in `../docs/IOS-PORT-2026-10-01.md`.
  Ein vorhandenes Xcode-Projekt oder ein grüner JavaScript-Test ist kein
  Nachweis einer erfolgreichen Swift-Kompilierung oder iPhone-Installation.

## Autoritative Quellen

- Native Funktionen: `ios/App/App/WRNDevicePlugin.swift` und
  `ios/App/App/WRNViewController.swift`; Xcode-Konfiguration in `ios/App/`.
- Webadapter: `web/wrn-ios.js`, `web/wrn-ios-assets.js`, `web/wrn-ios.css`.
- Abhängigkeiten: `package.json` und `package-lock.json` gemeinsam pflegen.
- Gemeinsames Frontend in der Repositorywurzel pflegen. Der iOS-Sync fügt
  die Plattformanpassungen in der generierten Ausgabe hinzu.
- `www/`, `ios/App/App/public/`, `ios/App/App/capacitor.config.json`,
  `.tmp/`, `node_modules/` und Buildausgaben sind generiert; nicht manuell
  patchen oder als neue Quelländerung committen.
- `ios/App/CapApp-SPM/Package.swift` wird vom Sync erzeugt und vom
  Finalisierungsskript auf portable Pfade geprüft. Abhängigkeiten über
  Paketkonfiguration/Sync ändern; diese versionierte Datei nicht allein patchen.

## Prüfungen und Übergabe

Im Verzeichnis `ios-wrapper` ausführen:

```sh
npm ci --ignore-scripts
npm run sync:ios
npm test
```

Der Sync prüft die Export- und native Hashparität. Für Änderungen an Offline-
Speicherung oder Download/Export zusätzlich den vorhandenen
`../tests/ios/browser.mjs`-Lauf mit WebKit verwenden und seine gemockte Bridge
im Bericht nennen. Gemeinsame Änderungen brauchen die betroffenen gemeinsamen
Vertragstests und die Prüfungen aus `../OPERATIONS.md`.

Auf macOS `npm run build:simulator` und `npm run build:device:unsigned` nutzen.
Ohne eigenen Mac steht `WRN iOS Build` bereit: nur manuell, keine Apple-Secrets,
Signierung aus, separate Simulator-/Geräteausgaben und Protokolle. Für den
ersten manuellen Start muss die Workflow-Datei auf dem Standardbranch vorhanden
sein; anschließend kann der iOS-Prüfbranch ausgewählt werden.

Bei jeder Übergabe Branch, Commit, ausgeführte Prüfungen und offene native
Prüfungen benennen. PR-Titel mit `[iOS]` kennzeichnen. Keine automatische
Freigabe oder Installation aus einem erfolgreichen unsignierten Build ableiten.

## Native Funktionen und offene Punkte

Systemdialoge für Teilen, Export, Kalender und Druck entstehen nur auf bewusste
Benutzeraktionen. Kalender nutzt den Systemeditor ohne Kalenderlesezugriff.
Artikel-Assets werden nur bei explizitem Offline-Speichern geladen; Größenlimits,
HTTPS-/MIME-Prüfung, cookiefreie Requests und Löschschutz erhalten.

WKWebView auf `capacitor://localhost` ersetzt keinen PWA-Service-Worker.
Persistenz, Berechtigungen, VoiceOver und Hintergrundaudio bleiben echte
Geräteprüfungen. Nachrichten-Push braucht noch APNs und den passenden
Backendvertrag; der vorhandene Web-Push/VAPID-Dienst ist keine APNs-Anbindung.
Apple-Team, Bundle-ID-Verfügbarkeit, Signierung und TestFlight sind eigene
Freigabeschritte. Zugangsdaten nie in Quellen, Logs oder PRs aufnehmen.
