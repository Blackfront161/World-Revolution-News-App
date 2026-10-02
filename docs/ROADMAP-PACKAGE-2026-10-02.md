# Roadmap-Paket 2. Oktober 2026

Das beauftragte Inhalts- und Wissenspaket ist implementiert und unabhängig geprüft. Der Datenkatalog ist veröffentlicht. Android-Code33 ist reproduzierbar gebaut und unabhängig als **unsignierter Kandidat** abgenommen. Google Play verteilt weiterhin Code32 / 2.1.2 mit vollständigem Rollout in 178 Ländern.

## Umgesetzter Umfang

- 728 Bibliothekstitel, darunter 13 neue deutsche Originalverweise; 155 Lexikonbegriffe mit 32 Primärquellenverweisen.
- Drei Lernpfade mit 30 Buch- und sieben Podcastbeziehungen. Vier Begriffe besitzen vollständige französische und spanische redaktionelle Entwürfe mit sichtbarer Kennzeichnung und ehrlichem Sprachfallback.
- 1.778 aktive Podcasteinträge und 1.814 erhaltene Archivdatensätze; die Website fasst sie zu 1.722 unterschiedlichen Originalseiten zusammen. 56 Podcastquellen.
- Vier neue Programme: Anarchist World This Week, Stick Together, Green Left Radio und Rebel Steps. Der dokumentierte Übergang von 12 Rules For WHAT zu Red Flare erhält die bestehende Quellen-ID. Insgesamt 433 neue geprüfte Metadateneinträge; zusätzliche Aktualisierungen vorhandener Quellen sind darin nicht mitgezählt.
- Original-Audioverzeichnisse von Radio LoRa Zürich und Radio Kurruf. Radio LoRa München bleibt eine andere Quelle. Teilen und Kopieren funktionieren auch nach dem Wechsel in die tatsächliche Medienansicht.
- Autonome Antifa Freiburg und antifa-frankfurt.org als Verzeichnisquellen ohne automatischen Artikelimport; Untergrund Blättle als Metadatenquelle.

Die neuen Einträge enthalten Metadaten und Originalverweise. Daraus folgt keine neue Freigabe für fremde Volltexte, Audiodateien oder Bilder. Neue Podcastfolgen bleiben `und` / `languageVerified: false`; deklarierte Sendersprache wird getrennt geführt. Alle bisherigen Archiv-IDs bleiben erhalten.

## Veröffentlichung und Zusammenarbeit

Datenstand `d7da528c9a996a2ec13bf3912c45e18e7d58bdfa` wurde regulär veröffentlicht. Originalquellen und Verzeichnis-Modi sind unabhängig geprüft. Die öffentliche deutsche Play-Store-Seite zeigt sechs Screenshots und den Trailer `JeTP62KaBhQ`. Die zuvor laufende Google-Prüfung ist abgeschlossen; Code32 ist vollständig verfügbar, ohne sichtbaren ausstehenden Veröffentlichungsauftrag.

Website-Inhaltsbasis `7533fe1d487ccf702428485d7d104035271ec9e4` wurde lokal mit 45 Website-Dateien / 48 Hosting-Dateien unabhängig abgenommen. Sie enthält dasselbe Wissens- und Podcastpaket. Das bedeutet keine Live-Veröffentlichung. **WRN Website – Inhaltsparität** bearbeitet inzwischen den neueren direkten Nutzerauftrag für das 20min-Layout und besitzt Website und Hostinger-Veröffentlichung. Head Chief veröffentlicht das ältere Paket nicht parallel. Das allgemeine Hostinger-Backup meldete Erfolg; ein privates Webroot-Archiv wurde angelegt, durch Head Chief aber noch nicht heruntergeladen und vollständig verifiziert. Der Website-Writer muss Backup, beide alten Inhaltszeiger, Rücknahmen, Header und Offline-Neustart vor beziehungsweise nach seinem Transfer prüfen.

## Historischer Android-Kandidat

**Durch den anschließenden Nutzerauftrag zu Übersetzung, Sharing und Autonom überholt.** `fb937dd` und sein Signer bleiben historische Belege und dürfen nicht als neuer Kandidat signiert werden. Der neue unsignierte Freeze und sein Status stehen in [Übersetzung-/Sharing-Folgeauftrag](TRANSLATION-SHARING-AUTONOM-FIX-2026-10-02.md).

- Produkt-Freeze: `fb937dd73355b9bb6f037c2b0e547da9cdb6bbaf`.
- VersionName `2.1.2`, VersionCode **33**.
- Zwei bytegleiche unsignierte AABs, jeweils **44.335.811 Byte**.
- SHA-256: `A55A3E13AFF32A07D1692B1F6937E1E4F59C4846D990AE191A24F66E53EC385E`.
- 356 commitgebundene Webassets, 802 Payload-Dateien, keine Signaturdateien.
- JS59, Produktionscache `2.1.2-r13`, Vorschaucache `v101`.

Der ältere Kandidat `5d5b623` ist gesperrt: Beim Eintritt in die Videoansicht verwendete ein Verzeichnisblock eine dort undefinierte Variable `section`. Der Block liegt jetzt korrekt in `renderMedia`; der echte Medien-Einstieg ist in Browser und Android geprüft. Die alten Code33-Dateien dürfen nicht signiert werden.

Gebundener Signer: `scripts/sign-google-play-aab-2.1.2-code33-fb937dd-gui.ps1`, SHA-256 `B91DAFA1C4CC5FFCCAF8DADBFFFE4E001F4F865308669E0ECB9A794832414B67`. Preflight und unabhängige Prüfung bestehen. Er prüft Artefakte, Quell-Freeze und bestehendes Zertifikat; Passwörter gehören ausschließlich in das maskierte lokale Fenster. Es fand keine Signierung statt. Die automatische Sicherheitsprüfung lehnte das Öffnen des Fensters wegen fehlender ausdrücklicher Freigabe für Code33 ab; die konkrete Nutzerfrage ist gestellt. Keine Umgehung und kein Play-Upload.

Die nachgepflegten Statusangaben und zusätzlichen QA-Belege sind ein Dokumentations-Folgecommit. Die AABs bleiben unverändert an `fb937dd` gebunden und enthalten dessen damaligen ROADMAP-Snapshot.

## Abschlussprüfung

54 JavaScript-Testmodule, 151 Python-Tests mit drei historischen Skips und vier Subtests sowie vier Main-only-Skripte bestehen. Validator und Releaseaudit bestehen mit 161/161 Prüfungen. Wissensansicht: neun Sprachen und vier Breiten PASS. Audio-Sharing: echte Karten, Episodenlink, Abbruch ohne Kopieren, manueller Kopierfallback und Classic-Audio-Hub PASS.

Isolierter Android-Test mit eigener Paket-ID und ohne INTERNET-Berechtigung: echte Code32-Einstellungen und Lesezeichen setzen, Update auf Code33, Einstellungen und Autonom-Auswahl nach Neustart erhalten. Nach Prozessstop bestehen vier Knowledge-/Sharing-Tests, einschließlich tatsächlichem Medien-Einstieg, beider Originalverzeichnisse und echtem Systemdialog für drei Linktypen. Das ist kein physischer Code33-Gerätenachweis und kein Test des signierten Produktionspakets.

Der Kontrolleur bestätigte die AABs gegen einen frischen sauberen Checkout, null Unterschiede zwischen den Builds, Medienfix, Asset-Bindungen und Signer. [Unabhängiger Abschlussbericht](evidence/roadmap-2026-10-02/controller-final-review.md), SHA-256 `89A5BCA89E3FB64A05D09FDACA6557E8C352CD729A13D7E08202071F4B8E9918`.

## Noch offen

1. Code33 ausdrücklich zur lokalen Signierung freigeben und Passwort selbst im geschützten Fenster eingeben; signierte AAB unabhängig prüfen, physischen Code33-Test durchführen und Uploadfreigabe an das finale Artefakt binden.
2. Website-Writer: neues 20min-Layout abschließend prüfen und gebundenes Paket mit Backup und Live-/Offline-Verifikation veröffentlichen.
3. Vier automatische Bibliotheksadapter implementieren. Originaladressen sind vorbereitet, vollständige Adapter noch nicht umgesetzt. Zehn weitere deutsche Titel benötigen Kontextprüfung.
4. Podcast-Holds L’Orage, Contrabanda Specials und Infowar Greece sowie RSS-Pfade der zwei Verzeichnisquellen prüfen. Individuelle Sprachverifikation bleibt offen.
5. Weitere Lexikonübersetzungen, redaktionell kuratierte Dossiers und freigegebene Offline-Lernmaterialien ergänzen. Lernverknüpfungen ersetzen keine abgeschlossene Dossierredaktion.

Aktuelle Belege und Hashmanifest: `docs/evidence/roadmap-2026-10-02/`. Operative Übersicht: `ROADMAP.json`.
