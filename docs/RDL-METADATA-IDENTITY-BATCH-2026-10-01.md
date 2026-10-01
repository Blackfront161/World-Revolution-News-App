# Radio Dreyeckland: erste Katalogkorrektur umgesetzt

1. Oktober 2026. Teilabschluss von `CONTENT-CATALOG-PARITY`, lokal für den nächsten Kandidaten. Ausgangsstände: App `9505c46`, Daten `17b3604`. Der bestehende signierte Code32 aus `6821a02` enthält diesen Batch nicht. Google-Einreichung, Website und Store-Versionen wurden dadurch nicht verändert.

## Identität und Umfang

Die unveränderten lokalen Primärbeobachtungen im [Identitätsvorschlag](RDL-SOURCE-IDENTITY-PROPOSAL-2026-10-01.md) nennen Radio Dreyeckland gBetriebs-GmbH als Betreiber des offiziellen Impressums und den RSS-Endpunkt `https://rdl.de/podcasts/all` mit Seriennamen und GUIDs. Dieser Arbeitsgang bewertet diese vorhandenen Belege offline; er behauptet keine neue Live-Recherche, Feedabnahme oder Rechtefreigabe.

Die vorhandene Herausgeber-ID `radio-dreyeckland` bleibt erhalten. Die bisher ID-lose Katalogzeile bekommt die gesonderte Endpoint-ID `radio-dreyeckland-podcasts-all`, `entityType: feed-endpoint` und einen Verweis `canonicalSourceId` auf den Herausgeber. Sie zählt nicht als neuer Herausgeber. Ihre bestehende Beschränkung `metadata_and_links_only` bleibt unverändert und ist jetzt wirksam.

33 bestehende App-Zeilen und 28 Datenzeilen erhalten die kanonische `sourceId`, Endpoint-ID und explizite Inhaltsbeschränkung. Alle bisherigen Episoden-IDs, Reihenfolge, Sprach- und Datumsfelder bleiben erhalten. Das sind 61 Datensätze über zwei lokale Snapshots. Kein zusätzliches Podcastangebot wurde aufgenommen. Die 16 weiteren App-Quellen, Bibliotheksabgleich und vollständige Website-Projektionen bleiben offen.

Künftige RSS-Episoden aus diesem Endpoint verwenden die bisherige Hash-Namensbasis `None` über `episodeIdNamespace`, obwohl der Endpoint nun eine eigene ID besitzt. Die korrigierte Herausgeber-ID erzeugt keine neuen IDs für vorhandene GUIDs.

## Wirksame Beschränkung

Beide Podcastpipelines projizieren diese Zeilen auf Metadaten und bestätigte HTTPS-Originallinks. Fremde Beschreibungen, Bilder, Audiolinks, Transkripte und alternative Medienfelder werden entfernt. Folgen mit Originallink bleiben auch ohne Audio-Enclosure katalogisierbar. Die Audio-Fallbacksuche auf Episodenseiten wird für diese Klasse nicht aufgerufen. Der gezielte Abruf des Herausgebers schließt den zugehörigen Endpoint ein. Bei fehlgeschlagenem gezieltem Abruf bleiben die bereinigten letzten gültigen Zeilen und unbetroffene Einträge erhalten.

Die gemeinsame Browserregel schützt auch alte Katalogantworten und die 61 bekannten historischen IDs in Warteschlangen. Current/Autonom und Classic zeigen die Folge als Metadatenkarte mit Originallink. Teilen verwendet diesen Originallink; ein reiner Audiolink ist für diese Klasse kein Ersatz. Neue Aufnahme in die Audio-Warteschlange und direkter Aufruf des gemeinsamen Players werden abgewiesen. Alte eingeschränkte Warteschlangenpositionen sind nicht abspielbar; das Lesen setzt weder die gespeicherte Warteschlange noch Favoriten zurück. Regeln am konkreten Endpoint haben Vorrang vor einer weniger eingeschränkten Herausgeberzeile. Andere Radio-Dreyeckland-Endpunkte werden dadurch nicht pauschal eingeschränkt.

Produktions- und Vorschau-Cache wechseln lokal auf `wrn-app-v2.1.2-r9` beziehungsweise `wrn-news-app-2-v97`. Das Regelmodul gehört jeweils zum verpflichtenden App-Shell-Satz und wird vor Player/Normalisierung geladen. Der Daten-Cache bleibt unverändert; auch ältere Antworten werden bei der Darstellung bereinigt.

Fehlt das Regelmodul bei einem unvollständigen Laden, bleiben Podcastmedien, Player, Audio-Sharing und Queue gesperrt. Dieser Ausfallpfad ist gesondert getestet; eine fehlende Regeldatei gilt nicht als Audiofreigabe.

## Verifikation

- Vollständige Contract-Matrix: 50 JavaScript-Verträge, 136 Python-Tests, vier Subtests und vier weitere Python-Prüfscripte bestanden; drei bestehende Tests übersprungen.
- App-Validator und lesende Release-Prüfung bestanden. Veraltete Prüfannahmen wurden auf die neue lokale Cachegeneration und die bereits bestätigten Store-Stände Code28/Code32 korrigiert; historische signierte Artefakte und Wrapper-Bindungen blieben unverändert.
- Vier eigene Offline-Unittests des kanonischen Datenrepositorys bestanden. Ein gezielter Fehlabruf ist auch gegen künstlich verengte globale Katalogbudgets getestet: unbetroffene Einträge werden dabei nicht abgeschnitten.
- Isolierter Chrome-Test mit unbereinigter alter Katalogantwort: Current/Autonom und Classic, Originalverweis, Teilen, Favoritenerhalt, Queue-Sperre, direkter Playeraufruf und unverändert abspielbare andere Karte bestanden. Keine Audio-/Bildanforderung an den eingeschränkten Endpoint, keine Seitenfehler. Alle fremden Netzantworten wurden im Test ersetzt; es wurde keine Audiodatei abgespielt und nichts an Kontakte versendet.
- Ein- und Ausgangshashes, stabile IDs sowie unveränderte übrige Datensätze sind im [Batchnachweis](evidence/rdl-metadata-2026-10-01/bindings.json) gebunden. [Browsernachweis](evidence/rdl-metadata-2026-10-01/browser-result.json).

Das ist ein lokaler Runtime- und Katalogteilabschluss. Unabhängige Kontrolleurprüfung steht bei Erstellung dieses Berichts aus. Es gibt keinen neuen Android-Build, Emulator-/Gerätenachweis, neuen VersionCode oder Veröffentlichungs-PASS für diesen Batch. Feedtechnik, Audio-/Bildrechte und vollständige Katalogzusammenführung bleiben offen.
