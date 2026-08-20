# World Revolution News – Betrieb

## Aktive Workflows

Dauerhaft aktiv bleiben:

- `Refresh News Fast` (stündlich: RSS/Atom, Feed-Bilder, Metadaten)
- `Enrich News and Sources` (alle sechs Stunden: Volltexte, zusätzliche Bilder,
  Quellenprüfung und redaktionelle Zuordnung)
- `Refresh Radar Events` (alle sechs Stunden: vollständiger Terminbestand)
- `Update library catalogues` (täglich: freigegebene Bibliothekskataloge)
- `Monitor WRN Operations` (alle zwei Stunden: inhaltsfreie Frische- und Fehlerzähler)
- `Update Podcasts`
- `Merge Multilingual Sources`
- `Repair Audio`
- `WRN Quality Gate`
- `App prüfen`

Alle Workflows, die nach `main` schreiben, verwenden:

```yaml
concurrency:
  group: wrn-main-write
  cancel-in-progress: false
```

Ein Workflow darf niemals andere Dateien unter `.github/workflows/`
automatisch verändern oder committen.

## Empfohlene Reihenfolge

1. Änderungen lokal auf einem separaten Branch einspielen.
2. Pull Request öffnen.
3. `WRN Quality Gate` und `App prüfen` abwarten.
4. Erst bei grünen Prüfungen nach `main` mergen.
5. Den passenden Datenworkflow nur danach manuell starten.
6. `Repair Audio` nur bei Änderungen an Audioquellen ausführen.

Nie zwei schreibende Workflows gleichzeitig starten.

Die gemeinsame Concurrency-Gruppe reiht zeitgleich fällige automatische
Läufe sicher nacheinander ein. Nachrichtenabruf, Anreicherung und Termine
schreiben dadurch nie gleichzeitig nach `main`.

## Lokale Arbeits- und Chatregeln

- Pro Arbeitsverzeichnis und Branch darf gleichzeitig nur ein Chat oder Prozess
  schreibend arbeiten. Ein zweiter Kontrollchat bleibt bis zu einem ausdrücklich
  genannten, commit-basierten Prüfpunkt ausschließlich lesend.
- Parallele Änderungen benötigen getrennte Branches und getrennte Worktrees.
  Zwei schreibende Chats im selben Ordner sind nicht zulässig.
- Vor einer größeren Erweiterung wird der vorhandene Stand auf einem eigenen
  Branch gesichert. Fremde oder unklare Änderungen werden nicht stillschweigend
  überschrieben.
- Ein gestoppter Arbeitslauf gilt erst dann als sauber übergeben, wenn Branch,
  letzter Commit, offene Punkte und bereits ausgeführte Prüfungen dokumentiert
  sind.
- Externe Quellen, Gefangenenadressen und Aktionsdaten erhalten ein Prüfdatum.
  Überfällige oder nicht bestätigte Angaben dürfen nicht als aktuell oder direkt
  nutzbar dargestellt werden.
- Signierung, Upload, Deployment und produktive Datenänderungen erfolgen nur
  nach einer eigenen Freigabe. Ein lokaler Build ist keine Veröffentlichung.

## Verbindliche lokale Quality Gates

Vor einem Release-Kandidaten müssen mindestens erfolgreich sein:

1. `pytest -q`
2. alle JavaScript-Vertragstests unter `tests/`
3. `python tests/validate_app.py`
4. `python validate_release_1722.py --no-write`
5. `python release_audit_183.py --no-write`
6. mobile Browserprüfung bei 320 und 390 Pixel Breite ohne horizontales
   Überlaufen sowie Stichproben in Nachrichten, Medien, Lexikon,
   Gefangenensolidarität und Zine
7. Android `lintRelease`, `testReleaseUnitTest` und `bundleRelease`

Warnungen durch absichtlich nicht verfügbare lokale HTTPS-Dienste müssen im
Prüfbericht benannt werden. Echte JavaScript-Laufzeitfehler, fehlgeschlagene
Quelldaten oder abweichende Webdateien blockieren die Freigabe.

Der schreibende Aufruf `python release_audit_183.py` ist kein Standard-Gate und
darf nur bewusst verwendet werden, wenn die versionierte historische Baseline
`release-readiness-183.json` kontrolliert ersetzt werden soll. CI lädt diese
historische Datei nicht hoch: Dort wird derselbe Read-only-Audit mit
`--no-write --artifact <temporärer Pfad>` ausgeführt, der persistierte
temporäre Bericht gegen das In-Memory-Ergebnis geprüft und nur dieses aktuelle
Artefakt bereitgestellt.

## Release-Regel

Neue Releases werden nicht durch einmalige selbstverändernde Apply-Workflows
installiert. Änderungen werden gegen eine vollständige aktuelle
Repository-Kopie getestet und als normaler Branch/Commit eingespielt.

## Release-Kandidat 2.0.8

### Entwicklungen und Briefing 2

- Der sichtbare Reiter heißt „Entwicklungen“.
- Story-Clustering bleibt intern unter `WRNStories` kompatibel.
- Beobachtungsbegriffe liegen unter `wrn_story_watchlist_v1`.
- Briefing-Verlauf und Briefing-2-Modus bleiben lokal.

### Audio

Die sichtbare Hierarchie lautet:

1. Audio
2. Original-Podcasts / Erzeugte Podcasts / Live-Radio
3. Herkunftsfilter nur innerhalb von Original-Podcasts

Die Herkunftszuordnung wird durch `audio-region-core.js` normalisiert.
Radiosender dürfen mehrere `streamCandidates` besitzen.

### Sprachen

Unterstützt und auswählbar sind:

- Deutsch
- Englisch
- Spanisch
- Französisch
- Italienisch
- Portugiesisch
- Russisch
- Griechisch
- Türkisch

Keine dieser Sprachen wird als Beta behandelt.

### Quellenprüfung

- Ein echter permanenter HTTP-/DNS-Fehler darf als defekt erscheinen.
- Ein noch nicht ausgeführter Audio-Check erscheint als „Nicht geprüft“.
- Fehlende optionale Berichtdateien werden als Warnung behandelt.
- Radioeinträge werden mit `radio-stations.json` abgeglichen.

### Video-Hub

- Der Hub wertet nur bereits geladene Nachrichtendaten lokal aus.
- Externe Player werden erst nach einer bewussten Auswahl geladen.
- Es gibt keine automatische Wiedergabe.
- YouTube-Einbettungen verwenden `youtube-nocookie.com`.

## Aggregator-Sicherheit

`aggregate.py` verarbeitet jeden Feed-Eintrag innerhalb einer eigenen
Fehlergrenze. Fehlerhafte Einträge dürfen nicht den vollständigen Lauf
abbrechen. Fehler werden nach `aggregate-errors.json` geschrieben.

Der schnelle Modus übernimmt vorhandene Volltexte und Bilder als unveränderbare
Basis. Kürzere Feed-Auszüge oder vorübergehend fehlende Medien dürfen bereits
gespeicherte Inhalte nicht verkürzen. `aggregate-run-status.json` dokumentiert
Laufart, Dauer, Quellabdeckung, neue Artikel und einen möglichen Budgetabbruch.

`news-feed.json` bleibt als schneller Einstieg begrenzt. Wenn ein Volltext dort
gekürzt wurde, verweist `detailPath` auf eines der kleinen
`news-detail-*.json`-Pakete. Die App lädt dieses Paket erst beim Öffnen des
Artikels. Damit bleiben Startzeit und Datenvolumen niedrig, ohne den vorhandenen
Volltext oder die Artikelbilder aufzugeben.

## Generierte Podcasts

`generated-podcasts.json` muss immer gültiges JSON und eine Liste enthalten.
Der Service Worker besitzt einen eigenen Fallback für diese Datei.

## Direktes Feedback und geschützter Posteingang

Die App sendet Feedback ausschließlich über den eigenen `revolution-proxy`
Worker. Der Worker begrenzt Anfragen, akzeptiert höchstens 4.000 Zeichen,
verwendet ein unsichtbares Bot-Feld und schreibt weder Nachricht noch
Antwortadresse ins Log. Der Inhalt wird zuerst privat unter `feedback/` im
R2-Bucket abgelegt. Eine optionale E-Mail enthält im Normalbetrieb nur den
Hinweis, dass neues Feedback vorliegt – nicht den Feedbacktext.

Der lokale geschützte Posteingang liegt unter `admin/feedback-inbox.html`.
Er wird nicht in die Android-App gepackt und speichert weder Worker-Adresse
noch Admin-Token. Für den Zugriff wird am Worker einmalig ein Secret gesetzt:

```powershell
wrangler secret put ADMIN_TOKEN --config revolution-proxy/wrangler.jsonc
```

Die Admin-Routen vergleichen das Bearer-Token konstantzeitnah und geben keine
Liste ohne gültige Authentifizierung zurück. Das Token gehört weder in Git noch
in die App-Konfiguration.

Vor der ersten Bereitstellung muss für eine Domain im eigenen
Cloudflare-Konto Email Routing aktiviert werden. Danach werden im Worker
folgende Werte gesetzt:

- `FEEDBACK_TO_ADDRESS=worldrevnews@brief.li`
- `FEEDBACK_FROM_ADDRESS=<Absenderadresse der aktivierten Cloudflare-Domain>`
- Email-Binding `FEEDBACK_EMAIL` mit festem Ziel
  `worldrevnews@brief.li`

Ohne Email-Binding bleibt die private R2-Ablage funktionsfähig. Ohne R2 und
Email antwortet der Worker bewusst mit `FEEDBACK_DELIVERY_FAILED`; die App zeigt
dann die E-Mail-Alternative an. Der Absender darf nicht erfunden werden: Er
muss zu einer für Cloudflare Email Routing eingerichteten Domain gehören.

## Budget- und Betriebswarnungen

Der Worker prüft stündlich die vorhandenen Zähler für Übersetzungsanfragen,
Azure-Zeichen und Podcast-Speicher. Bei 80, 90 und 100 Prozent wird jede Stufe
pro Abrechnungsfenster höchstens einmal gemeldet. Ohne Email-Binding bleibt der
Status im privaten R2-Objekt `operations/latest.json` und ist über den
geschützten Admin-Posteingang sichtbar.

`Monitor WRN Operations` prüft zusätzlich alle zwei Stunden Feed-Alter,
Artikelalter, Quellfehler, Podcastfehler und Budgetabbrüche. Der Workflow lädt
nur `operations-status.json` als kurzlebiges Artefakt hoch. Bei einem echten
Fehler wird ein einzelnes GitHub-Issue aktualisiert; nach der Behebung wird es
automatisch geschlossen. Bericht und Issue enthalten nur Zähler und
Zeitabstände, nie Artikel-, Feedback- oder Nutzerdaten.

## Freiwilliger News-Push

Der Release enthält ein fail-closed Push-Gateway mit Durable-Object-Speicher.
Eine Anmeldung entsteht ausschließlich nach der ausdrücklichen
Benachrichtigungsfreigabe. Gespeichert werden die pseudonyme Push-Adresse,
Themen, Regionen, Ruhezeiten, Sprache, Zeitzone und App-Version – kein
Leseverlauf und keine Artikeltexte. Abgelaufene Endpunkte werden bei HTTP 404
oder 410 entfernt.

Vor der produktiven Aktivierung werden einmalig ein VAPID-Schlüsselpaar erzeugt
und diese drei Worker-Secrets gesetzt:

```powershell
wrangler secret put VAPID_PUBLIC_KEY --config revolution-proxy/wrangler.jsonc
wrangler secret put VAPID_PRIVATE_KEY --config revolution-proxy/wrangler.jsonc
wrangler secret put VAPID_SUBJECT --config revolution-proxy/wrangler.jsonc
```

Die App ruft den öffentlichen Schlüssel zur Laufzeit über `push.config` ab;
deshalb ist bei einer späteren Secret-Aktivierung keine neue AAB erforderlich.
Der Versand erfolgt ausschließlich über die mit `ADMIN_TOKEN` geschützte Aktion
`admin.push.send`. Ruhezeiten, gefolgte Themen/Regionen und die getrennte
Korrekturkategorie werden serverseitig berücksichtigt.

## Gemeinsame redaktionelle Entscheidungen

Freigegebene Zuordnungs- und Korrekturentscheidungen liegen in
`editorial-decisions.json`. Die App lädt diese kleine Datei unabhängig vom
News-Feed und wendet nur Einträge mit `status: approved` an. Dadurch gelten
freigegebene Regions-/Themenkorrekturen und Korrekturhinweise auf allen Geräten,
während ungeprüfte Hinweise weiterhin lokal bleiben und zuerst exportiert bzw.
redaktionell geprüft werden müssen.

## Abhängigkeiten

Normale Datenworkflows sollen `requirements-wrn.lock.txt` verwenden.
Versionsänderungen erfolgen nur bewusst in einem eigenen Wartungscommit.


## Quellen- und Sprachregeln ab 1.8.2

- Neue Quellen werden ausschließlich additiv in `multilingual-source-registry.json` und über den idempotenten Aggregator-Block ergänzt.
- Das bestehende `quellen`-Wörterbuch darf nicht vollständig ersetzt werden.
- Türkische Quellen verwenden `tr`, kurdische Quellen `ku`.
- `language_source_audit.py` muss für beide Codes eine aktive Quellenabdeckung bestätigen.
- `Democracy Now!` bleibt von Erweiterungen ausgeschlossen; ein bereits vorhandener Eintrag wird nicht gelöscht.
- Herkunftsangaben beschreiben den Sitz bzw. Publikationskontext der Quelle und werden nicht aus der Artikelsprache geraten.

## Lokale Signiervorbereitung für 2.1.0 / Code 25

Der GUI-Signer ist ausschließlich an den akzeptierten Commit-`6a86e75`-
Kandidaten, seinen SHA-256, den Alias `WRN_KEY` und den dokumentierten
Zertifikat-Fingerprint gebunden. Vor dem GUI kann der rein lesende Vorabtest
ausgeführt werden:

```powershell
pwsh -NoLogo -NoProfile -File scripts/sign-google-play-aab-2.1.0-code25-gui.ps1 -PreflightOnly
```

Die eigentliche lokale Signierung wird bewusst und interaktiv mit verdeckten
Passwortfeldern gestartet:

```powershell
pwsh -STA -NoLogo -NoProfile -File scripts/sign-google-play-aab-2.1.0-code25-gui.ps1
```

Das Skript lädt nichts hoch, überschreibt keine vorhandene Ausgabe und entfernt
die kurzzeitig gesetzten Passwort-Umgebungsvariablen in jedem Abschluss- und
Fehlerpfad. Ein anderer AAB-Kandidat benötigt einen neuen Review und Signer.
