# World Revolution News 1.4 – Update-Anleitung

Diese Projektkopie behält die bestehende Play-App-ID `com.world.revolution` bei.

- `versionCode`: 4 (vorher 3)
- `versionName`: 1.4 (vorher 1.3)
- `compileSdk`: 36
- `targetSdk`: 36
- `minSdk`: 24
- Capacitor: 8.4.0

## 1. Website/GitHub aktualisieren

Der Ordner `Website code` enthält die neue Web-App und die aktualisierten GitHub-Actions. Seine Dateien gehören in das Repository `Blackfront161/Revolution-News-Data`.

Danach in GitHub unter **Actions → Update News → Run workflow** den Datenlauf einmal manuell starten. Der Lauf erzeugt nun neben `news.json` auch `events.json`. Erst danach kann der Status reale Event-Zahlen anzeigen.

## 2. Cloudflare Worker aktualisieren

Die Web-App enthält kein öffentliches Shared Secret mehr. Sie verwendet nur noch das strukturierte Worker-Protokoll mit `X-Client-Id`.

Die geprüfte Datei liegt unter `Cloudflare Worker/worker.js`. In Cloudflare den
gesamten bisherigen Worker-Code durch diese Datei ersetzen und anschließend
**Bereitstellen**. Sie unterstützt die Web-App und die Android-App. Keine
Worker-Secrets oder API-Schlüssel in App-, GitHub- oder ZIP-Dateien speichern.

Die Datei `worker.js` gehört nicht in das öffentliche GitHub-Repository und
nicht in den Ordner `Website code`.

## 3. Android-Projekt vorbereiten

Im Projektordner ausführen:

```text
npm ci
npm run sync:android
```

Danach in Android Studio den Ordner `android` öffnen und die Gradle-Synchronisierung abwarten.

## 4. Signiertes App Bundle erzeugen

In Android Studio:

1. **Build → Generate Signed App Bundle or APK**
2. **Android App Bundle** auswählen
3. Den bereits für die Testversion verwendeten Upload-Key auswählen
4. Release-Build erzeugen

Keystore und Kennwörter gehören nicht in dieses Projekt oder nach GitHub.

## 5. In Google Play Console aktualisieren

Das neue signierte `.aab` in denselben internen Test-Track hochladen. Vor dem Rollout prüfen:

- Play Console erkennt `versionCode 4` als höher als 3.
- Paketname bleibt `com.world.revolution`.
- App-Signatur/Upload-Key wird akzeptiert.
- Daten­sicherheit und Datenschutzerklärung beschreiben GitHub Pages, externe Artikelbilder/-links, Cloudflare-Übersetzung, optionale Azure-Podcasts, Radio/Podcasts und PayPal korrekt.

## Enthaltene Bedienkorrekturen

- „Bewegung“ entfernt; die App folgt automatisch der Systemeinstellung.
- „Karten“ in „Standard“ umbenannt; zusätzlich bleiben „Kompakt“ und „Nur Titel“.
- obere Aktions- und Navigationsknöpfe kompakter.
- „Daten“ als einfaches „Speicher“-Fenster neu aufgebaut.
- rot-schwarzer Stern bei „Später lesen“ wiederhergestellt.
- Lesestatus wird nicht mehr durch Übersetzen oder bloßes Öffnen des Originals gesetzt.
- Zine ist lokal gespeichert, einzelne Artikel können entfernt werden.
- Zine-Druck nutzt eine randlose Druckseite ohne eigenen Titel-/URL-Kopf.
- abgeschnittene „Read more“-Feeds werden pro Quelle begrenzt; „Anarchist News“ maximal vier aktuelle unvollständige Beiträge.
- der Datenlauf erzeugt eine eigene `events.json`.
