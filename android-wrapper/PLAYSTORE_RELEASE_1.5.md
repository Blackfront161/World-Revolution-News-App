# World Revolution News – Play-Store-Release 1.5

## Release-Daten

- Paketname: `com.world.revolution`
- `versionCode`: `5`
- `versionName`: `1.5`
- `minSdk`: `24`
- `compileSdk`: `36`
- `targetSdk`: `36`
- Web-App: World Revolution News `1.8.4`

Der Paketname und der vorhandene Upload-Schlüssel bleiben unverändert. Der
Schlüssel und seine Kennwörter dürfen nicht in dieses Repository, in den
Android-Projektordner oder in ein Release-Archiv kopiert werden.

## Geprüfter Inhalt

- weißer Hauptschriftzug „WORLD REVOLUTION NEWS“
- deutsche Schaltfläche „Übersetzen“
- stabiler 1.8.4-Release-Build ohne Vorab-Markierung
- neuer App- und Daten-Cache
- vollständige lokale Capacitor-Web-App

## Signiertes App Bundle

Das Projekt in Android Studio öffnen und dann:

1. **Build → Generate Signed App Bundle or APK**
2. **Android App Bundle** auswählen
3. den bereits für die früheren Versionen verwendeten Upload-Schlüssel wählen
4. den Build-Typ **release** erzeugen

Vor dem Upload muss die Signatur denselben SHA-256-Fingerabdruck wie die
früheren AAB-Dateien besitzen:

`7E:4E:00:0A:93:69:8A:50:DB:F3:31:A8:C6:93:1A:0A:27:68:30:BF:34:D2:4E:3B:50:F9:73:4D:F8:2D:79:A8`

## Play Console

Das signierte AAB zuerst in den internen Test-Track laden. Vor dem Rollout
prüfen:

- Play Console erkennt `versionCode 5` als höher als `4`.
- Paketname ist weiterhin `com.world.revolution`.
- Upload-Signatur wird akzeptiert.
- Datenschutzerklärung und Datensicherheit beschreiben GitHub Pages,
  Cloudflare-Übersetzung, optionale Azure-Podcasts, externe Medienquellen,
  freie Radios und PayPal korrekt.
