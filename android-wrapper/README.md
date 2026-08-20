# World Revolution News – Android-Wrapper

Capacitor-/Android-Hülle für **World Revolution News**. Dieses Verzeichnis enthält die nativen Android-Quellen, Gradle-Konfiguration, App-Icons und Splash-Ressourcen. Die eigentlichen Webassets werden aus dem eigenständigen App-Quellprojekt übernommen und sind hier generierte Build-Eingaben.

## Aktueller Status

| Merkmal | Stand |
|---|---|
| Android Application ID | `com.world.revolution` |
| Android `versionName` | `2.1.0` |
| Android `versionCode` | `25` |
| min / target / compile SDK | 24 / 36 / 36 |
| Capacitor-Basis | exakt `8.4.0` für Core, Android und CLI |
| Paketmanager | npm mit versionierter `package-lock.json` |
| Autoritative App-Quelle | Wurzel dieses App-Repositories (`../`) |

> **Kein AAB direkt aus dem Repository bauen oder veröffentlichen.** `www/` und
> `android/app/src/main/assets/public/` sind generierte, nicht versionierte
> Release-Eingaben. Sie müssen für jeden Kandidaten aus einem ausdrücklich
> freigegebenen App-Commit erzeugt, synchronisiert und per Hashvergleich geprüft
> werden.

Zusätzliche Freigabeblocker:

- `package.json` und `package-lock.json` führen Wrapper-Metadaten `2.1.0` und
  pinnen `@capacitor/core`, `@capacitor/android` und `@capacitor/cli` gemeinsam
  auf `8.4.0`. npm ist der einzige unterstützte Paketmanager.
- `android/capacitor.settings.gradle` ist eine Sync-Ausgabe und wird nicht als
  Quellkonfiguration versioniert. Nach `npm ci` erzeugt das lokale Capacitor-CLI
  sie neu; ein sauberer Sync darf weder pnpm-Pfade noch Capacitor 8.5.0
  referenzieren.
- Der instrumentierte Smoke-Test verwendet die Produktions-ID
  `com.world.revolution` und startet `MainActivity`; seine Ausführung benötigt
  weiterhin ein verbundenes Gerät oder einen Emulator und vorher erzeugte
  Webassets.
- Google-Play-In-App-Updates sind noch nicht nativ integriert. Ein Service Worker kann die Play-Store-Aktualisierungsaufforderung nicht ersetzen.
- Eine Release-Signaturkonfiguration ist nicht Teil des öffentlichen Projekts und darf auch keine privaten Schlüssel enthalten.
- Die lokalen SDK-36-Dateien sind vorhanden und direkt lesbar; die aktuelle
  Gradle-Buildfähigkeit ist ohne einen kontrollierten Sync und Build dennoch
  nicht nachgewiesen. Vor dem Release müssen Android Studio, Plattform 36,
  Build Tools und Command-line Tools geprüft und die Gradle-Gates ausgeführt
  werden. API 36 darf dabei nicht abgesenkt werden.

## Verzeichnisrollen

| Pfad | Rolle | Git-Status |
|---|---|---|
| `android/` | Gradle-Projekt und native Android-Quellen | versionieren, abzüglich generierter/privater Dateien |
| `android/app/src/main/java/` | `MainActivity` und WRN-Geräte-Plugin | versionieren |
| `android/app/src/main/res/` | Manifest-Ressourcen, Icons, Splash, Themes, XML | versionieren |
| `android/app/src/test/`, `android/app/src/androidTest/` | Native Tests | versionieren |
| `package.json`, `package-lock.json` | reproduzierbare Node-/Capacitor-Abhängigkeiten | versionieren |
| `capacitor.config.json` | App-ID, Name und Webasset-Quelle | versionieren |
| `assets/`, `icons/`, `font/` | Quellmaterial für App-Ressourcen | nach Rechteprüfung versionieren |
| `www/` | aus dem App-Projekt synchronisierte Webassets | generiert, nicht versionieren |
| `android/app/src/main/assets/public/` | von Capacitor kopierte Webassets | generiert, nicht versionieren |
| `release/`, `archive/`, `*.aab`, `*.apk`, `*.zip` | lokale Release-/Historienartefakte | nicht versionieren; extern archivieren |
| `node_modules/`, `.gradle/`, `**/build/` | reproduzierbare Abhängigkeiten und Buildausgaben | nicht versionieren |
| `local.properties`, Keystores, Signaturdateien, `.env*` | maschinenlokal oder geheim | niemals versionieren |

`Website code/` und `Cloudflare Worker/` sind vermischte historische Fremdbereiche und gehören nicht in das Android-Wrapper-Repository. Ihre noch relevanten Inhalte müssen vor einer Löschung in die jeweils zuständigen Website-/Backend-Repositories überführt und separat geprüft werden.

## Reproduzierbares Sync-Konzept

Der Sync muss automatisiert, prüfbar und immer in derselben Richtung erfolgen:

```text
geprüfte App-Quelle
        │
        ▼
temporäres, manifestiertes Webasset-Paket
        │ Hash-/Vollständigkeitsprüfung
        ▼
www/
        │ npm run sync:android
        ▼
android/app/src/main/assets/public/
        │ Android-/Gerätetests
        ▼
signierte AAB außerhalb des Repositories
```

Das versionierte Release-Skript `../scripts/build-android-release.ps1` muss:

1. ausschließlich von der autoritativen App-Quelle lesen;
2. eine explizite Dateiliste beziehungsweise ein Manifest verwenden;
3. in ein temporäres Ziel kopieren und erst nach erfolgreicher Prüfung atomar nach `www/` übernehmen;
4. veraltete Dateien im Ziel erkennen, statt sie still stehen zu lassen;
5. alle erwarteten Kernmodule, insbesondere `news-card-copy.js`, prüfen;
6. Quell- und Zielhashes protokollieren;
7. niemals Keystores, lokale Konfiguration oder App-Repo-Metadaten kopieren.

Manuelle Explorer-Kopien sind kein reproduzierbarer Releaseprozess.

## Abhängigkeiten und Capacitor normalisieren

Es gilt genau ein Paketmanager und genau eine Capacitor-Version: npm mit
`package-lock.json` sowie Capacitor 8.4.0 für Core, Android und CLI. Die
Lockdatei ist die installierbare Abhängigkeitsautorität; pnpm-Arbeitsbereiche
und manuell gepflegte generierte Capacitor-Pfade gehören nicht in die Quelle.

Vor dem nächsten Sync:

1. Node.js 22 oder neuer verwenden;
2. Abhängigkeiten ausschließlich mit `npm ci` aus der bestätigten Lockdatei
   installieren;
3. ausschließlich das lokal installierte Capacitor-CLI verwenden;
4. `android/capacitor.settings.gradle`, Plugin-Konfigurationen und kopierte
   Assets mit `npm run sync:android` neu erzeugen;
5. prüfen, dass keine pnpm-/8.5.0-Pfade enthalten sind.

Geplanter Ablauf nach Umsetzung des Sync-Skripts:

```powershell
npm ci
# geprüftes WRN-Release-/Sync-Skript ausführen; das npm-Skript verbietet Downloads
npm run sync:android
Set-Location android
.\gradlew.bat clean test lint assembleDebug
```

`npm run sync:android` ruft ausschließlich das durch npm in
`node_modules/.bin` bereitgestellte `cap` auf; fehlt die lokal aus der
Lockdatei installierte CLI, muss der Sync abbrechen statt eine andere Version
aus dem Netz nachzuladen.

## Releaseprüfung

Erst nach erfolgreicher Synchronisierung:

1. Quell-Diff und Webasset-Manifest vollständig abnehmen.
2. `versionName` und `versionCode` erhöhen und mit Releaseinformationen abgleichen.
3. Unit-, Instrumentierungs- und Lintprüfungen ausführen. Der
   `AppLaunchInstrumentedTest` muss Produktions-ID und Start von `MainActivity`
   auf einem verbundenen Gerät oder Emulator bestätigen.
4. Debug-Build auf einem echten Gerät prüfen.
5. Kaltstart online, langsames Netz, Flugmodus, Hintergrund/Fortsetzen und zweiten Start nach Cacheaktualisierung testen.
6. Übersetzung, Teilen, Benachrichtigungen, gespeicherte Artikel, Datenschutz und externe Links testen.
7. Falls umgesetzt, den flexiblen Google-Play-In-App-Update-Ablauf separat testen.
8. Release ausschließlich mit extern verwalteter Signatur erzeugen:

   ```powershell
   .\gradlew.bat bundleRelease
   ```

9. AAB-Hash, Versionsdaten, Testprotokoll und Signaturidentität als Release-Nachweis dokumentieren.
10. AAB und Nachweise extern archivieren; die Binärdatei nicht in Git einchecken.

## Signierung und Geheimnisse

- Keystore, Alias-Passwort, Store-Passwort und private Schlüssel gehören weder in Git noch in `gradle.properties` des Repositories.
- Maschinenlokale Android-SDK-Pfade verbleiben in `android/local.properties`.
- Signaturwerte werden über eine nicht versionierte lokale Properties-Datei oder geschützte CI-Secrets bereitgestellt.
- `google-services.json` und andere Anbieter-Konfigurationen werden erst nach Datenschutz- und Geheimnisprüfung verwendet und standardmäßig nicht versioniert.
- Vor jedem Push ist ein Secret-Scan über alle neu hinzukommenden Dateien erforderlich.

`package.json` nennt derzeit `ISC`, im Projekt liegt jedoch keine eigenständige `LICENSE`-Datei. Vor einer öffentlichen Wiederverwendungsfreigabe müssen Code, Icons, Splash- und sonstige Quellassets rechtlich geprüft und die tatsächlich gewählte Lizenz ausdrücklich ergänzt werden.

## Was in Git gehört

- `README.md`, `.gitignore` und relevante technische Dokumentation;
- `package.json`, bestätigte Lockdatei und `capacitor.config.json`;
- Gradle Wrapper einschließlich `gradle-wrapper.jar` und `gradle-wrapper.properties`;
- Gradle-Konfigurationen, Manifest, ProGuard-Regeln;
- Java-/Kotlin-Quellen und native Tests;
- XML-Ressourcen, App-Icons, adaptive Icons und Splash-Ressourcen;
- geprüfte, lizenzierbare Quellassets und sichere Automatisierungsskripte.

## Was nicht in Git gehört

- synchronisierte Webassets in `www/` und `android/app/src/main/assets/public/`;
- `node_modules/`, `.gradle/`, Build-, Lint-, Test- und IDE-Ausgaben;
- AAB, APK, ZIP, alte Releases und Archive;
- Keystores, Signaturwerte, `.env*`, lokale SDK-Pfade und Anbieter-Geheimnisse;
- historische Website-, Worker- oder Marketingkopien ohne klaren Android-Bezug.
