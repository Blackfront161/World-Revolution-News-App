# Code32: Play-Uploadauftrag und Nutzerfreigaben

Am 1. Oktober 2026 hat der Nutzer das Lexikon ausdrücklich freigegeben, den abgeschlossenen Test bestätigt und den Upload in Google Play Console sowie eine verbindliche Aktualisierung angefordert. Dies gilt für den bereits gebauten Code32-Kandidaten aus `6821a0245b581b0268e5f7fcbb9b2688c7b5a12f`. Die Bestätigung des physischen Tests ist eine Nutzeraussage; ein zusätzlicher unabhängiger Gerätebericht liegt nicht vor. Der Lexikon-Nachtrag ist damit für diesen Release durch den Nutzer freigegeben. Weitere Lexikon-/Bibliotheks-Roadmaparbeit bleibt offen.

Die signierte Datei ist `outputs/audio-sharing-code32/WorldRevolutionNews-2.1.2-code32-6821a02-signed.aab`, Paket `com.world.revolution`, Version 2.1.2 / Code32, SHA-256 `66D6D96D6234FA7D390EDD58A3640602187ECFBFEAFAA8AF8A4D72D982F7975A`. Dieser Hash wurde vor dem Uploadauftrag erneut bestätigt. Die bestehende Signatur- und unabhängige Kontrolleur-Abnahme bleiben gültig; weder Runtime noch signierte Datei wurden geändert.

## Aktueller Console-Status

Google Play Console wurde im vorhandenen Chrome geöffnet. Das zunächst ausgewählte Google-Konto führte auf die Entwicklerkonto-Neuanlage und hatte keinen bestehenden Entwicklerzugang. Die sichtbare Kontoauswahl wurde geöffnet; die Zuordnung des richtigen WRN-Entwicklerkontos wurde beim Nutzer angefragt. Es wurde kein neues Konto angelegt, keine Zugriffsberechtigung erweitert, kein Bundle hochgeladen und kein Release eingereicht. Der Upload ist bis zur Kontozuordnung offen.

## Aktualisierung für bestehende Nutzer

Die [offiziellen Play-Wiederherstellungstools](https://support.google.com/googleplay/android-developer/answer/13812041?hl=de) können für ausgewählte alte Bundles und alle betroffenen Nutzer einen Vollbild-Updatehinweis beim nächsten Kaltstart auslösen. Wird er geschlossen, erscheint er bei weiteren Kaltstarts erneut. Das ist eine wiederkehrende Aufforderung, keine absolute Nutzungssperre. Voraussetzung ist eine neuere kompatible veröffentlichte Version in allen betroffenen Tracks; die Aktion kann deshalb erst nach verfügbarer neuer Version aktiviert werden.

Der vorhandene native Quellcode enthält außerdem einen Immediate-Updatefluss ab Play-Priorität 4, sofern Google den Typ erlaubt, sowie einen flexiblen Fallback und Abbruch-Cooldown. Die [Priorität wird über die Play Developer API](https://developer.android.com/guide/playcore/in-app-updates/kotlin-java) gesetzt. Dies liefert keinen nachträglich erzwingbaren Sperrmechanismus für jede bereits installierte Altversion. Ein neuer obligatorischer Mindestversionsmechanismus müsste in den betreffenden installierten Versionen vorhanden sein; er wird hier nicht als aktiviert behauptet.

## Vorbereitete Releasehinweise

Autonom als wählbares Design, Teilen und Kopieren von Radios und Podcastfolgen, erweitertes Lexikon sowie Verbesserungen an Offline-Lesen und Darstellung. Das rot-schwarze Windrosen-Appsymbol bleibt erhalten.
