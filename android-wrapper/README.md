# World Revolution News – Android-Wrapper

Capacitor-/Android-Hülle für **World Revolution News**. Dieses Verzeichnis enthält die nativen Android-Quellen, Gradle-Konfiguration, App-Icons und Splash-Ressourcen. Die eigentlichen Webassets werden aus dem eigenständigen App-Quellprojekt übernommen und sind hier generierte Build-Eingaben.

## Aktueller Status

| Merkmal | Stand |
|---|---|
| Android Application ID | `com.world.revolution` |
| Android `versionName` | `2.1.0` |
| Android `versionCode` | `25` |
| min / target / compile SDK | 24 / 36 / 36 |
| Deklarierte Capacitor-Basis | `8.4.0` |
| Autoritative App-Quelle | `C:\Users\patri\Documents\World Rev Ne\revolution-news-app-2` |

> **Kein AAB aus diesem Stand bauen oder veröffentlichen.** Der Webasset-Ordner `www/` ist nicht mit der autoritativen App-Quelle synchron: 13 geprüfte Kerndateien weichen ab und `news-card-copy.js` fehlt. Eine daraus erzeugte AAB wäre nicht der geprüfte App-Stand.

Zusätzliche Freigabeblocker:

- `package.json` und `package-lock.json` deklarieren Capacitor `^8.4.0`; die aktuell generierte `android/capacitor.settings.gradle` verweist jedoch auf nicht vorhandene pnpm-Pfade einer früheren Capacitor-8.5.0-Installation. Diese Datei muss durch einen kontrollierten Sync aus einer einheitlichen Installation neu erzeugt werden.
- `package.json` trägt noch die Paketmetadaten-Version `2.0.8`; die Android-Releaseversion kommt derzeit aus `android/app/build.gradle`. Vor dem Release müssen Versionsquellen bewusst vereinheitlicht oder ihre Zuständigkeiten dokumentiert werden.
- Die instrumentierte Beispielprüfung erwartet noch `com.getcapacitor.app` statt `com.world.revolution`.
- Google-Play-In-App-Updates sind noch nicht nativ integriert. Ein Service Worker kann die Play-Store-Aktualisierungsaufforderung nicht ersetzen.
- Eine Release-Signaturkonfiguration ist nicht Teil des öffentlichen Projekts und darf auch keine privaten Schlüssel enthalten.
- Die lokale Android-SDK-36-Installation ist aktuell nicht buildfähig: Gradle kann `platforms/android-36/package.xml` nicht lesen und findet deshalb das Ziel `android-36` nicht. SDK 36 muss außerhalb des Repositories repariert beziehungsweise sauber neu installiert werden.

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
        │ npx cap sync android
        ▼
android/app/src/main/assets/public/
        │ Android-/Gerätetests
        ▼
signierte AAB außerhalb des Repositories
```

Ein noch zu ergänzendes Sync-Skript soll:

1. ausschließlich von der autoritativen App-Quelle lesen;
2. eine explizite Dateiliste beziehungsweise ein Manifest verwenden;
3. in ein temporäres Ziel kopieren und erst nach erfolgreicher Prüfung atomar nach `www/` übernehmen;
4. veraltete Dateien im Ziel erkennen, statt sie still stehen zu lassen;
5. alle erwarteten Kernmodule, insbesondere `news-card-copy.js`, prüfen;
6. Quell- und Zielhashes protokollieren;
7. niemals Keystores, lokale Konfiguration oder App-Repo-Metadaten kopieren.

Manuelle Explorer-Kopien sind kein reproduzierbarer Releaseprozess.

## Abhängigkeiten und Capacitor normalisieren

Es muss genau ein Paketmanager und genau eine Capacitor-Version gelten. Der derzeit nachvollziehbare Ausgangspunkt ist npm mit `package-lock.json` und Capacitor 8.4.0.

Vor dem nächsten Sync:

1. unterstützte Node-LTS-Version festlegen und dokumentieren;
2. npm als Paketmanager bestätigen oder vollständig auf einen anderen Paketmanager migrieren – keine Mischinstallation;
3. Abhängigkeiten ausschließlich aus der bestätigten Lockdatei installieren;
4. `@capacitor/core`, `@capacitor/android` und `@capacitor/cli` auf exakt dieselbe freigegebene Version setzen;
5. `android/capacitor.settings.gradle`, Plugin-Konfigurationen und kopierte Assets mit `npx cap sync android` neu erzeugen;
6. prüfen, dass keine alten pnpm-/8.5.0-Pfade mehr enthalten sind.

Geplanter Ablauf nach Umsetzung des Sync-Skripts:

```powershell
npm ci
# geprüftes WRN-Sync-Skript ausführen
npx cap sync android
Set-Location android
.\gradlew.bat clean test lint assembleDebug
```

`npm ci` ist im aktuellen Zustand noch kein Releasegate, solange Paketmanager und Capacitor-Versionen nicht abschließend normalisiert sind.

## Releaseprüfung

Erst nach erfolgreicher Synchronisierung:

1. Quell-Diff und Webasset-Manifest vollständig abnehmen.
2. `versionName` und `versionCode` erhöhen und mit Releaseinformationen abgleichen.
3. Unit-, Instrumentierungs- und Lintprüfungen ausführen; den falschen Beispiel-Paketnamen vorher korrigieren.
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
