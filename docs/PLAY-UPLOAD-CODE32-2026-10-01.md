# Code32: Play-Uploadauftrag und Nutzerfreigaben

Am 1. Oktober 2026 hat der Nutzer das Lexikon ausdrücklich freigegeben, den abgeschlossenen Test bestätigt und den Upload in Google Play Console sowie eine verbindliche Aktualisierung angefordert. Dies gilt für den bereits gebauten Code32-Kandidaten aus `6821a0245b581b0268e5f7fcbb9b2688c7b5a12f`. Die Bestätigung des physischen Tests ist eine Nutzeraussage; ein zusätzlicher unabhängiger Gerätebericht liegt nicht vor. Der Lexikon-Nachtrag ist damit für diesen Release durch den Nutzer freigegeben. Weitere Lexikon-/Bibliotheks-Roadmaparbeit bleibt offen.

Die signierte Datei ist `outputs/audio-sharing-code32/WorldRevolutionNews-2.1.2-code32-6821a02-signed.aab`, Paket `com.world.revolution`, Version 2.1.2 / Code32, SHA-256 `66D6D96D6234FA7D390EDD58A3640602187ECFBFEAFAA8AF8A4D72D982F7975A`. Dieser Hash wurde vor dem Uploadauftrag erneut bestätigt. Die bestehende Signatur- und unabhängige Kontrolleur-Abnahme bleiben gültig; weder Runtime noch signierte Datei wurden geändert.

## Aktueller Console-Status

Nach der Kontoauswahl durch den Nutzer wurde die richtige App `World Revolution News`, Paket `com.world.revolution`, in der bestehenden Play Console geöffnet. Die Console bestätigte den bisherigen Produktionsstand **Code28 (2.1.2)** als bei Google Play verfügbar. Der frühere nur nutzerbestätigte Code25-Stand ist damit historisch überholt.

Die geprüfte signierte Code32-AAB wurde hochgeladen und von Play als **32 (2.1.2), min API24, Ziel-SDK36** erkannt. Release `32 (2.1.2) – Autonom und Audio-Teilen`, Produktionsrelease-ID `23`, vollständiger Roll-out **100 %** in **178 Ländern/Regionen**, Versionshinweise in **9 von 9 Sprachen**. Die Geräteprüfung der Console zeigte keine neu ausgeschlossenen Geräte gegenüber Code28. Die Einreichungsschaltfläche wurde bestätigt; der sichtbare Status ist **„Änderungen, die überprüft werden“ / „Wird überprüft“**. Schnelle Vorabprüfungen laufen noch und Google führt danach die eigentliche Überprüfung durch. Code32 wird nicht als bereits live behauptet.

Verwaltete Veröffentlichung ist ausgeschaltet; nach Googles erfolgreicher Freigabe kann der eingereichte vollständige Roll-out automatisch veröffentlicht werden. Es wurde kein API-Prioritätswert gesetzt und kein neuer Build hergestellt. Signierte Datei und Quellbindung bleiben unverändert.

Nachweise in `docs/evidence/audio-sharing-2026-10-01/`: `code32-play-submitted-final.jpg` und `.txt`, die exakten Storehinweise in `code32-play-release-notes.txt` sowie `code32-play-production-submission.json`. Der Console-Tab wurde als Ergebnis offen gehalten.

## Aktualisierung für bestehende Nutzer

Die [offiziellen Play-Wiederherstellungstools](https://support.google.com/googleplay/android-developer/answer/13812041?hl=de) können für ausgewählte alte Bundles und alle betroffenen Nutzer einen Vollbild-Updatehinweis beim nächsten Kaltstart auslösen. Wird er geschlossen, erscheint er bei weiteren Kaltstarts erneut. Das ist eine wiederkehrende Aufforderung, keine absolute Nutzungssperre. Die tatsächliche Aktualisierung benötigt die neueste verfügbare kompatible Version.

**Für Code28 wurde die Aufforderung aktiviert.** Der Console-Assistent meldete „Neuere Version in allen Tracks verfügbar“. Targeting wurde auf **„alle Nutzer dieser Version“** gesetzt und „Aufforderung initiieren“ bestätigt. Danach erschien **„Aufforderung initiiert“** und der neue Wiederherstellungstab zeigte die aktive Verwaltung sowie das Targeting, zuletzt bearbeitet am 1. Oktober 2026, 11:08 Uhr (Asia/Singapore). Die angezeigte Zahl bereits aufgeforderter Nutzer beträgt **0**; es wird keine bereits erfolgte Zustellung oder Installation behauptet. Nachweis: `code28-play-recovery.jpg` und `.txt`. Die Bundleübersicht zeigte für Code25 und Code26 bereits bestehende Wiederherstellungen, die nicht neu verändert wurden.

Code27 aus dem internen Test ist derzeit für die Aufforderung nicht verfügbar: im internen Track sowie im pausierten Alpha-Track fehlt eine neuere Version. Nach der Nutzerpräzisierung **„lade sie in produktion hoch“** wurde keine zusätzliche Testveröffentlichung vorgenommen. Ein kurz angelegter, vollständig leerer eigener Alpha-Entwurf wurde verworfen; der pausierte Alpha-Track blieb bei Code27. Der Produktionsrelease32 und die aktive Wiederherstellung28 sind davon unabhängig. Die Testtrack-Voraussetzung ist in `code27-recovery-prerequisite.txt` dokumentiert.

Der vorhandene native Quellcode enthält außerdem einen Immediate-Updatefluss ab Play-Priorität 4, sofern Google den Typ erlaubt, sowie einen flexiblen Fallback und Abbruch-Cooldown. Die [Priorität wird über die Play Developer API](https://developer.android.com/guide/playcore/in-app-updates/kotlin-java) gesetzt. Dies liefert keinen nachträglich erzwingbaren Sperrmechanismus für jede bereits installierte Altversion. Ein neuer obligatorischer Mindestversionsmechanismus müsste in den betreffenden installierten Versionen vorhanden sein; er wird hier nicht als aktiviert behauptet.

## Vorbereitete Releasehinweise

Autonom als wählbares Design, Teilen und Kopieren von Radios und Podcastfolgen, erweitertes Lexikon sowie Verbesserungen an Offline-Lesen und Darstellung. Das rot-schwarze Windrosen-Appsymbol bleibt erhalten.

## Erneute Prüfung auf Nutzerauftrag

Auf den Folgeauftrag, Nutzer beim Öffnen zur Aktualisierung aufzufordern, wurden die laufenden Wiederherstellungen für **Code25, Code26 und Code28** einzeln erneut gelesen. Alle drei haben das Targeting **„alle Nutzer dieser Version“** und die aktive Aufforderungsverwaltung. Die Console meldet 12 bereits aufgeforderte Nutzer für Code25, 14 für Code26 und 0 für Code28. Bestehende aktive Aktionen wurden nicht dupliziert. Die Aufforderung erscheint beim Kaltstart als schließbarer Vollbilddialog und wiederholt sich bei weiteren Kaltstarts, sofern sie geschlossen wird. Eine bloße Rückkehr zu einer schon laufenden App ist kein neuer Kaltstart.

Code32 befindet sich inzwischen in der eigentlichen Google-Prüfung: „Deine Änderungen werden jetzt überprüft.“ Die Vorabprüfungen sind in diesem Status nicht mehr angezeigt. Code32 wird weiterhin nicht als bereits öffentlich verfügbar behauptet. Nachweis: `play-update-prompt-recheck.json` und die drei `codeXX-update-prompt-rechecked.txt`-Snapshots; Screenshot `code28-update-prompt-rechecked.jpg`.
