# Roadmap-Fortsetzung: erster P0-Schritt, 3. Oktober 2026

Die Podcast-Veröffentlichung ist repariert und öffentlich bestätigt. Der abgelaufene Regionalterminkatalog ist als isolierter, unabhängig geprüfter Quellstand erneuert; der Website-Arbeiter übernimmt ihn in seinen bestehenden Kandidaten. Das gesamte erste Roadmap-Paket ist noch nicht abgeschlossen.

## Podcasts: Veröffentlichung wiederhergestellt

[Data PR44](https://github.com/Blackfront161/Revolution-News-Data/pull/44) ergänzt die Validierung und das gemeinsame Staging von `podcast-archive.json`. Aggregator, Rechteprüfung und Safe-Push bleiben unverändert. Vier Integrationstests prüfen tatsächliche Git-Commits und Pushes, fehlendes/ungültiges Archiv, fremde ungestagte Änderungen und unveränderte Ausgaben. Neun bestehende Podcasttests und beide GitHub-Prüfungen bestanden. Der Kontrolleur reproduzierte die vier Integrationstests und akzeptierte den exakten Produktcommit `ae688f2fd9b0810ef4b790b6c5b00f6d5d280d38`.

Mergecommit: `445979a32f9d8e11e74e6f912bbbd1cc05ed542d`. Der normale Produktionsworkflow auf main wurde anschließend per workflow_dispatch gestartet: [Lauf 37085213675](https://github.com/Blackfront161/Revolution-News-Data/actions/runs/37085213675) endete erfolgreich und veröffentlichte Commit `5304fa0032a6761071962e4b74b66cb6f114c49f`. Ein späterer zeitgesteuerter Lauf ist noch nicht beobachtet; derselbe Veröffentlichungsweg wurde durch diesen echten main-Lauf geprüft.

Der öffentliche [Podcastfeed](https://blackfront161.github.io/Revolution-News-Data/podcasts.json) wurde mit HTTP200 und identischem SHA256 zur veröffentlichten Commitversion zurückgelesen. Er enthält 1865 Zeilen mit 1806 unterschiedlichen Episoden-URLs. 860 Zeilen besitzen Audiolinks, 1005 enthalten Metadaten beziehungsweise Originalverweise. Das Archiv enthält 1901 Zeilen. Diese Zählung belegt keinen Gerätetest aller Folgen; der Katalog erzeugter Hörfassungen bleibt leer. Hashes, Größen, URLs und Prüfgrenzen stehen in [podcast-publication.json](evidence/roadmap-continuation-2026-10-03/podcast-publication.json).

## Regionaltermine: Quelle und lokales Paket geprüft

Revision4 beruht auf vier frisch bestätigten Originalankündigungen: [EWOC Workers’ Circle](https://interferencearchive.org/event/ewoc-workers-circle/), [Londoner ISRF-Buchvorstellung](https://mailinglist.isrf.org/p/isrf-book-launch-announcement-constitutionalisin), [Manchester & Salford Anarchist Bookfair](https://bookfair.org.uk/) und [Santiago](https://lazarzamora.cl/invitacion-al-8vo-encuentro-del-libro-y-la-propaganda-anarquista-de-santiago-2026/). Unbekannte Angaben bleiben unbekannt; für London wird weiterhin Tagespräzision verwendet, weil kein vollständiges Zeitintervall belegt ist. Die vorübergehend nicht erreichbare São-Paulo-Ankündigung bleibt im Reviewregister zur erneuten Prüfung erhalten. Sie wird weder als frisch bestätigt angeboten noch als abgesagt bezeichnet.

Gültigkeit: bis **10. Oktober 2026, 09:10:45 Uhr Singapurzeit / 01:10:45 UTC**. Input-SHA256: `571eb5866536482dc6f5c046b8d82824bc85adedaf127316ac4b79b771d40236`. Produktcommit: `03c2aaadcc4988a4911a97522aafd4246fae04bb`; Belegcommit: `20bb8746eec1cb34c360b775e4438acc051fac98`. Sieben-Tage-Gültigkeit, 48-Stunden-Vorlauf, Hashbindung und Metadatenrechte bleiben aktiv. Der Workflow bindet seinen Status an die tatsächliche geprüfte Revision und Anzahl statt an die alte feste Anzahl fünf.

Acht Werkzeug-/Workflowtests, 38 Inhaltsvertragstests und 46 Mobile-Tests bestanden. Der Kontrolleur akzeptierte die Quellkorrektur und reproduzierte unabhängig acht Werkzeugtests, zwölf Regionalverträge und sieben Regional-UI-Tests. Sein Review umfasst keinen zweiten unabhängigen Liveabruf der Originalseiten und keine abschließende Veröffentlichungskontrolle.

Der Website-Build besteht mit Node24.19.0. Die Offline-Shell benötigt 7805953 Bytes bei unverändertem Limit 8388608; das größte JavaScriptpaket benötigt 418517 Bytes bei 500000-Byte-Limit. Das bestehende Paketwerkzeug erzeugte einen Kandidaten mit 46 Dateien; Manifest, Closure und Bytes wurden rekonstruktiv geprüft. Paketshell: `e0a50e0cd362402653bd5257b7e9a41a551900d070d31f2ccdf1230039da2c82`.

Die gebaute [lokale Vorschau](http://127.0.0.1:43241/#home) zeigt Europa mit aktuellen Terminen und Brasilien mit einem ehrlichen Leerzustand. Dauerhafte Regionseinstellungen und Standortzugriff wurden nicht ausgelöst. Quellreview und lokale Paketprüfung ersetzen nicht die noch offenen Live-Header-, Readback- und Offline-Neustartprüfungen.

Vollständiger Regionalbeleg: [REPORT.md](<C:/Users/patri/Documents/World Revolution News/wrn-next-regional-renewal/docs/evidence/WRN-REGIONAL-REVIEW-2026-10-03/REPORT.md>). Der isolierte Checkout liegt unter `C:/Users/patri/Documents/World Revolution News/wrn-next-regional-renewal`; die bestehende Website-Arbeit wurde erhalten.

## Koordination und nächster Schritt

Der bestehende Chat **WRN Website – Inhaltsparität** erhielt Quellcommits, unabhängige Reviews, Paketpfade und den neuen Data-Stand. Er bestätigt die Übernahme des Regionalfixes in seinen bestehenden Zweig und bereitet einen kombinierten Kandidaten mit der laufenden Solidaritätsarbeit vor. Ein zusätzlicher Website-Arbeiter oder eine zweite Implementierung wurde nicht angelegt.

Die bestehende Roadmap führt nun:

1. Abschluss der Website-Integration und unabhängige Kontrolle des kombinierten Pakets; die alte Live-Website bleibt bis zur Veröffentlichung getrennt bewertet.
2. ID-, Rechte- und Versionsabgleich: veröffentlichter Podcastfeed mit 1806 unterschiedlichen Episoden-URLs gegenüber bisher 1722 Website-Episodenkarten sowie Data731 gegenüber App/Website728 Bibliothekseinträgen. Die Differenz allein ist kein Nachweis neu zulässiger Inhalte.
3. Danach vorhandene Navigation, Medien-/Wissenseinstiege, Direktlinks, Rückkehrkontext und verständliche Verfügbarkeitsanzeigen vervollständigen. Lexikon-, Video-, Atlas- und iOS-Ausbau bleiben in ihren bestehenden Aufgaben.

Kein neuer nativer Build oder Play-Upload wurde in diesem Schritt durchgeführt. Der bisher festgestellte Stand bleibt Code32 in Produktion und Next-Code27 im internen Test. Die früheren Auditbelege bleiben als historische Aufnahme erhalten; die aktuellen Ergebnisse und Grenzen stehen in diesem Bericht und der aktualisierten [ROADMAP.json](../ROADMAP.json).
