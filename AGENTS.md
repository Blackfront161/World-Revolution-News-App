# WRN-App: Plattformen und Arbeitsbereiche

Dieses Repository enthält die bestehende World-Revolution-News-App mit gemeinsamem
Webfrontend und Backend sowie getrennten nativen Plattformprojekten. Es ist nicht
das eigenständige Projekt WRN Next.

## Vor Änderungen

- Zuerst Repositorywurzel, aktuellen Branch und `git status` prüfen.
- Die gewünschte Plattform aus dem Benutzerauftrag bestimmen. Für iOS
  zusätzlich `ios-wrapper/AGENTS.md` und `ios-wrapper/README.md` lesen.
- `OPERATIONS.md` gilt für Betrieb, getrennte Worktrees, Prüfungen und Freigaben.
  Pro Worktree und Branch arbeitet nur ein schreibender Chat/Prozess.
- Der bestehende iOS-Port bleibt auf `codex/ios-app`. Die vom Nutzer beauftragte
  Hilfe-/Inhaltsintegration wird getrennt auf `codex/ios-guide-content-20261003`
  aus dem aktuellen gemeinsamen App-Frontend geprüft.
  Ein Branchname kennzeichnet den Arbeitszweck; er ersetzt nicht die Prüfung
  des tatsächlichen Dateidiffs. Parallele Android-/Webarbeit braucht einen
  anderen Worktree und Branch.
- Die vorgesehene Basis des iOS-Entwurfs-PR ist der festgehaltene Quellstand
  `codex/ios-source-baseline-83db917`. Dieser Basisbranch bildet die bereits
  vorhandene lokale App ab und enthält keine neuen iOS-Änderungen. Er ist kein
  Release und wird nicht automatisch nach `main` integriert. Den iOS-PR nicht
  ungeprüft auf `main` umstellen: dadurch würden bisher lokale gemeinsame
  App-/Android-Änderungen in denselben Diff geraten.
- Der Benutzer hat am 2026-10-03 den Upload des iOS-Ports und des dokumentierten
  Ausgangsstands einschließlich Betriebsdokumentation in das öffentliche
  Repository ausdrücklich freigegeben. Der genaue Umfang steht in
  `docs/IOS-PUBLICATION-SCOPE-2026-10-03.md`. Diese Freigabe umfasst getrennte
  Branches und einen iOS-Entwurfs-PR, keinen Merge, Cloud-Build, Apple-Upload
  oder produktive Datenänderungen. Den tatsächlichen Branch-/PR-Status bei
  einer Übergabe auf GitHub prüfen.

## Dateizuordnung

| Bereich | Autoritative Dateien |
|---|---|
| Gemeinsames Frontend | HTML, JavaScript, CSS und öffentliche Appdaten in der Repositorywurzel sowie `news-archive/` |
| Gemeinsames Backend | `revolution-proxy/`, weitere vorhandene Worker und Daten-/Aggregatorwerkzeuge |
| Android | `android-wrapper/` und zugehörige Android-Build-/Signierskripte |
| iOS native App und Adapter | `ios-wrapper/` |
| iOS Export und Build | `scripts/prepare-ios-web.mjs`, `scripts/finalize-ios-sync.mjs`, `scripts/verify-ios-project.mjs`, `scripts/build-ios.mjs` |
| iOS Tests | `tests/ios/` |
| iOS Cloud-Kompilierung | `.github/workflows/ios-build.yml` mit dem Namen `WRN iOS Build` |
| iOS Übergabe und Prüfbelege | `docs/IOS-PORT-2026-10-01.md`, `docs/evidence/ios-port-2026-10-01/` |

## Gemeinsame Quellen und Plattformgrenzen

iOS übernimmt das gemeinsame Frontend durch den reproduzierbaren Export und
nutzt die vorhandenen öffentlichen Backendadressen. Keine zweite unabhängig
gepflegte Kopie des Frontends oder Backends anlegen. Plattformbezogene Adapter
und native Funktionen im jeweiligen Plattformbereich ändern. Gemeinsame
Änderungen ausdrücklich als solche im Bericht/PR kennzeichnen und die
betroffenen Plattformen prüfen. Bei einem reinen iOS-Auftrag gehören
Android-Signierung und Backendbereitstellung nicht zum Auftrag.

Generierte Apppakete nicht als Quellcode bearbeiten oder committen. Secrets,
Zertifikate, Provisioning Profiles und installierbare/signierte Pakete gehören
nicht in Git. Berichte müssen Quell-/Browserprüfung, native Kompilierung,
Geräteprüfung und Signierung als getrennte Ergebnisse benennen.

Uploads und PRs ändern keine Produktionsfreigabe. Ohne weitere Freigabe keine
PRs mergen, Apps signieren, nach Apple hochladen oder Backenddaten verändern.
