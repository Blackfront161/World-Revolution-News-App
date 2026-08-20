# World Revolution News

World Revolution News (WRN) ist eine unabhängige, mehrsprachige Nachrichten-
und Wissensplattform für soziale Bewegungen, Arbeitskämpfe, Antifaschismus,
Antirassismus, Feminismus, Queerpolitik, Ökologie, Gefangenensolidarität und
libertäre Perspektiven.

## Versionsstatus

| Kanal | Version | Status |
|---|---:|---|
| Google-Play-App | 2.0.8 | veröffentlichter mobiler Ausgangsstand |
| GitHub-Pages-PWA | 2.0.0 laut öffentlicher Konfiguration | veralteter Legacy-Stand, nicht der 2.0.8-Nachweis |
| Dieses Arbeitsverzeichnis | 2.1.0 | lokaler, noch nicht veröffentlichter Release-Kandidat |
| Android / Google Play | 2.1.0, Code 25 | erst nach Webasset-Sync, Gerätetest und autorisierter Signierung |

Der derzeitige GitHub-Pages-Legacy-Stand ist unter
[blackfront161.github.io/Revolution-News-Data](https://blackfront161.github.io/Revolution-News-Data/)
erreichbar. Er ist nicht mit der veröffentlichten Google-Play-App 2.0.8
gleichzusetzen. Ein Entwicklungsstand darf nicht allein aufgrund seiner
Versionskennung als veröffentlicht, signiert oder produktiv bezeichnet werden.

## Produktumfang

- Mehrsprachige Nachrichten mit Themen-, Regionen-, Quellen-, Sprach- und
  Formatfiltern, Quellenpässen und nachvollziehbaren Herkunftsangaben.
- Tageslage, Briefings, Dossiers, gespeicherte Artikel und gezielt vorbereitete
  Offline-Ausgaben.
- Podcasts, freie Radios, Videos und ein bewusst nutzergesteuerter Medienabruf.
- Termine, Bewegungslexikon, Bibliothekskataloge, Zine- und Druckwerkzeuge.
- Gefangenensolidarität sowie „Hilfe finden“ mit geprüften Profilen, manuellen
  Filtern, sichtbaren Zuständigkeitsgrenzen und regionalen Offline-Paketen.
- Lokale Diagnose-, Quellen- und Releaseprüfungen ohne Popularitätsranking,
  Kommentare oder serverseitige Standortverfolgung.

## Architektur

### App und Progressive Web App

`index.html`, `news-app-2.js`, die funktionsbezogenen JavaScript-/CSS-Module
und `service-worker.js` bilden die produktive statische App. Der alternative
Vorschaupfad verwendet `news-app-2-sw.js`. Cachekennungen und Asset-Parameter
sind Teil des Releasevertrags und werden nur gemeinsam erhöht.

### Daten und Redaktion

Python-Aggregatoren erzeugen die versionierten Feed-, Detail-, Quellen-,
Termin-, Audio-, Video- und Prüfdaten. `news-feed.json` bleibt klein; größere
Artikeltexte liegen in nachgeladenen `news-detail-*.json`-Paketen. Automatisch
ermittelte Merkmale werden nicht als redaktionelle Bestätigung ausgegeben.

### Dienste

Die Worker unter `cloudflare/` kapseln optionale Übersetzungs-, Feedback-,
Cache- und Betriebsfunktionen. Geheimnisse, Tokens und persönliche Inhalte
gehören ausschließlich in die jeweilige Secret-/Speicherumgebung und niemals
in dieses Repository.

### Qualitätssicherung

`tests/`, `tests/validate_app.py`, `validate_release_1722.py` und
`release_audit_183.py` prüfen Datenverträge, Syntax, Offlineverhalten,
Service-Worker, Barrierefreiheit und Releasekonsistenz. GitHub Actions führt
dieselben Kernprüfungen für Pull Requests und `main` aus.

## Repository- und GitHub-Grenzen

Dieses Arbeitsrepository enthält aus historischen Gründen noch App-Webassets,
Datenpipelines und erzeugte Daten gemeinsam. Das ist ein Übergangs-/Legacyzustand
und nicht die Zielarchitektur. Nach gesicherter Historie und reproduzierbaren
Schnittstellen gelten folgende klar getrennte GitHub-Ziele. Für den ersten
bereinigten GitHub-Stand werden App/PWA und der native Wrapper gemeinsam in
einem Repository geführt; der Wrapper liegt dort unter `android-wrapper/`:

1. **App/PWA:** Oberfläche, lokale App-Logik, Offlineverträge und App-Tests.
2. **Daten:** Aggregatoren, redaktionelle Schemata und erzeugte Feedpakete mit
   versionierter Schnittstelle zur App; keine Kopie der App-Oberfläche.
3. **Öffentliche Website:** eigenes Webpaket mit websitespezifischem Layout,
   SEO-Seiten und eigener Deployment-/Rollback-Kette.
4. **Android-Wrapper:** Capacitor-/Gradle-Quellen im Unterordner
   `android-wrapper/` desselben App-Repositories. `www` wird aus einem
   ausdrücklich freigegebenen App-Commit erzeugt und nicht als zweite manuell
   gepflegte Quelle eingecheckt. Eine spätere Abtrennung in ein eigenes
   Repository bleibt möglich, ist aber keine Voraussetzung für den aktuellen
   bereinigten Stand.
5. **Releaseartefakte:** AAB/APK, Signierschlüssel, lokale Prüfberichte,
   Abhängigkeiten und Buildordner werden nicht nach GitHub hochgeladen.
6. **World Revolution Map:** bleibt bis zur freigegebenen Integration ein
   separat versioniertes Daten-/Kartenprojekt mit stabilen IDs und Schnittstelle.

Diese Trennung verhindert, dass Website-, App-, Android- und Kartencode bei
einem Update unkontrolliert überschrieben oder veraltet dupliziert werden.

## Lokale Entwicklung und Tests

Vorausgesetzt werden Python 3.12 und Node.js 22 oder kompatible Versionen.

```powershell
python -m pip install -r requirements.txt
python -m pip install pytest
python -m http.server 8765
```

Die App ist anschließend unter `http://127.0.0.1:8765/index.html` erreichbar.
Vor einem Release-Kandidaten sind mindestens auszuführen:

```powershell
python tests/run_contract_matrix.py
python tests/validate_app.py
python validate_release_1722.py --no-write
python release_audit_183.py --no-write
```

Zusätzlich gehören reale Browserprüfungen bei 320, 390 und 1440 Pixel Breite,
Offline-Neustart, langsames Netz, Hintergrund/Wiederaufnahme und die Android-
Gates `lintRelease`, `testReleaseUnitTest` und `bundleRelease` zur Freigabe.
Die vollständige verbindliche Reihenfolge steht in
[`OPERATIONS.md`](OPERATIONS.md) und
[`NEWS-APP-2-RELEASE-CHECKLIST.md`](NEWS-APP-2-RELEASE-CHECKLIST.md).

## Android-Synchronisation und Release

Das Android-Verzeichnis ist keine unabhängige Quelle für App-Webdateien. Vor
jedem Android-Build gilt:

1. App-Änderungen und Daten im autoritativen Repository abschließen.
2. Vollständige Quality Gates ausführen und einen eindeutigen Commit festlegen.
3. `www` aus genau diesem Commit erzeugen und Capacitor synchronisieren.
4. Hash-/Dateivergleich zwischen Appquelle, `www` und gepackten Assets prüfen.
5. Auf einem realen Gerät online, offline und nach einem Cacheupdate testen.
6. Erst danach die AAB bauen; Signierung und Play-Upload benötigen eine eigene
   Autorisierung.

Ein Service Worker kann keine Google-Play-Aktualisierungsaufforderung auslösen.
Diese Funktion benötigt eine geprüfte native Play-In-App-Update-Integration.

## Datenschutz und Sicherheit

- „Hilfe finden“ überträgt keinen Standort. Such- und Profilzustände werden
  nicht im Browserverlauf oder in dauerhaftem Appspeicher protokolliert.
- Offline-Inhalte und Einstellungen bleiben lokal auf dem Gerät. Ein Löschen
  lokaler Appdaten entfernt diese Bestände.
- Externe Kontakte, Websites und Medien verlassen WRN; die Oberfläche weist auf
  Browser-, Geräte- und Telefonverläufe hin.
- Übersetzungen dürfen Artikeltext nur nach einer bewussten Übersetzungsaktion
  an den konfigurierten Dienst übertragen. Anbieter, Modell, Limits und
  Fallbacks müssen vor Änderungen geprüft werden.
- Feedback läuft über den eigenen Proxy und wird nicht mitsamt Inhalt in
  Betriebslogs geschrieben. Admin-Tokens und API-Schlüssel sind Secrets.
- Unbekannte oder überfällige Quellen-, Hilfe- und Aktionsdaten bleiben als
  unbekannt bzw. ungeprüft gekennzeichnet.

## Lizenzen und Inhalte

Dieses Repository enthält derzeit keine pauschale Open-Source-Lizenz. Bis eine
`LICENSE`-Datei beschlossen ist, wird keine allgemeine Erlaubnis zum Kopieren,
Ändern oder Weiterverbreiten des Codes behauptet. Rechte an übernommenen
Artikeln, Bildern, Audio-/Videoinhalten, Logos und externen Katalogen verbleiben
bei den jeweiligen Rechteinhaberinnen und Rechteinhabern. Quellen-URLs und
Provenienz müssen erhalten bleiben. Offline-Material wird erst aufgenommen,
wenn Aktualität und Verbreitungsrecht dokumentiert sind.

## Arbeitsplan

1. Risikofreie Altbestände und generierte Artefakte bereinigen; relevante
   Arbeitsstände sichern, den Legacy-Mischbestand kontrolliert in App und Daten
   trennen und GitHub über geprüfte Pull Requests aktualisieren.
2. Den 2.1.0-Kandidaten einschließlich „Hilfe finden“, Start/Offline-Cache und
   Barrierefreiheit abschließen.
3. Android-Wrapper versionieren, Webassets atomar synchronisieren, native
   Play-Aktualisierung integrieren und eine vollständig geprüfte AAB erzeugen.
4. Website-Artikelgenerierung, Sitemap, Social-Metadaten und Leistungsmessung
   automatisieren.
5. Quellen, Bibliothek, Lexikon und Termine redaktionell kontrolliert erweitern.
6. World Revolution Map stufenweise über stabile IDs, Deep-Links und eine
   barrierefreie Listenalternative integrieren.

Produktions-, Daten- und Chatregeln sind in `OPERATIONS.md` verbindlich
dokumentiert. Änderungen werden auf einem separaten Branch geprüft; Signierung,
Upload und Deployment erfolgen nie als Nebenwirkung eines lokalen Builds.
