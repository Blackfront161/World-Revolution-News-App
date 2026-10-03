# Roadmap-Fortsetzung: App, Wissen und Cloudflare

Der aktuelle App-Quellstand ist unabhängig akzeptiert. Die beiden bestehenden Cloudflare-Worker sind veröffentlicht und zurückgeprüft. Das gesamte Roadmap-Paket bleibt teilweise offen; neue App-Oberflächen sind noch kein Storeupdate.

## Umgesetzt und unabhängig akzeptiert

Produkt: `e9c8088806f60ad8b9605705f686cc91f2536f90`; Beleg: `972c56cd9aee208d9a5e2259518c3b2aba48d1a6`. Der Kontrolleur schloss die drei Statusbefunde mit PASS im Turn `01a100c9-a90f-7ff0-9088-b3353b03300a`. [Aktuelle Abnahme und Livebelege](evidence/WRN-ROADMAP-APP-2026-10-03/live/REPORT.md).

- Zehn eigene DE/EN-Lexikonentwürfe ergänzen die bisherigen167 Begriffe: jetzt177 Begriffe und54 Referenzen. Exakte Primärreferenzen und verwandte Begriffe sind gebunden. Die neuen Texte behalten den Entwurfsstatus; keine externen Volltexte oder neuen Nutzungsrechte wurden übernommen. [Abgrenzung der zehn Lücken](LEXICON-GAP-MATRIX-2026-10-03.json).
- Bestehende geprüfte Lernpfade führen vom Begriff direkt zum passenden Buch oder Podcast und mit Zurück zum geöffneten Begriff. Vier Pfade und33 Buchbindungen bleiben erhalten. Funding Worker Cooperatives ist zusätzlich mit dem neuen Begriff worker-cooperative verbunden; weitere Zusammenhänge wurden nicht erfunden.
- Öffentliche Item-ID-Direktlinks öffnen und fokussieren den tatsächlichen Eintrag. Nicht verfügbare IDs zeigen einen Hinweis; Medien spielen nicht automatisch. Such-/Filterrückkehr, Scroll/Fokus und die Hilfeprivacy bleiben erhalten. Ein vom Browser kopierter alter History-Zustand überschreibt einen neuen Direktlink nicht mehr.
- Systemstatus zeigt bestätigte aggregierte WRN-Kontingente und Resetzeiten. Unbekannte Providerlimits/Tarife bleiben unbekannt. Bei429 gibt es einen Wartehinweis und Original-/Gerätestimmenalternativen. Verfügbarkeit setzt sechs ausdrücklich bestätigte Statusfelder voraus; fehlende Felder gelten als unbestätigt.
- Radio-Pause ist erreichbar. Bei einer defekten oder hängenden Streamadresse wechselt der Player nach seinem15-Sekunden-Ladebudget zum nächsten freigegebenen Kandidaten. Pause/Stop räumen den Timer auf; Autoplay-Verweigerung wird nicht umgangen.

Prüfungen:39 aktuelle Python-Assettests, neun Nodeverträge und30 Cloudflare-Tests bestehen. Echte Chrome-Navigation: acht Szenarien, darunter Begriffs-/Buch-/Podcast-Rückwege, neun UI-Sprachen im Lexikon bei360/768/1440 Pixeln und200% Roottext, erreichbare Kontingente und Teilfehler. Sieben echte App-/Classic-Sharing-Szenarien bestehen. Chrome dekodierte3CR, CORAX und ORANGE mit Start/Pause/Fortsetzen/Stop sowie Fehler- und15-Sekunden-Hangfallback. Das ist kein Nachweis aller Sender oder nativer Hintergrundwiedergabe.

[Frische App-Vorschau](http://127.0.0.1:43245/index.html?preview=8&data=snapshot#lexicon?item=worker-cooperative).

## Cloudflare veröffentlicht

Root veröffentlichte nach der unabhängigen Quellprüfung die vorhandenen Worker mit Wrangler4.114.0, `--keep-vars` und `--strict`. Konfiguration, Bindings, Migrations und Modelle blieben unverändert.

- Proxyversion: `aa18e5e2-d095-41b5-af71-71db1eb3d07a`.
- Cacheversion: `da809aa7-3de3-4d83-b178-c13542bfe17e`.

Sieben begrenzte GET-Readbacks bestehen: öffentliche QuotenHTTP200/no-store, exakt erlaubte Antwortfelder, fremde Browser-Origins403, private Administration ohne Token401, öffentlicher Cachehealth ohne Origin200. Sämtliche Livevariablen einschliesslich GEMINI_MODEL und die Secretbindungsnamen sind gegenüber den Vorversionen erhalten. Keine Secretwerte gespeichert und keine Übersetzungs-/Hördateierzeugung oder Quotenreservierung als Test ausgeführt.

Die Erstprüfung fand die rohe öffentliche Cacheantwort und eine falsche Verfügbarkeitsanzeige. Eine Nachprüfung fand den Missing-Field-Randfall. Diese historischen FAIL-Belege bleiben erhalten; die konkreten Korrekturen und ihre Abnahme stehen im aktuellen Paket.

## Website und Kataloge

Die bestätigte Website-Livebasis bleibt `d738a9454161f1f6aff624bcb9c2a9f0bc2ccf60`:731 Bücher, vier aktuelle Regionaltermine und fünf Solidaritätslinks.45 öffentliche Datei-/Headerprüfungen und voller Offline-Neustart über HTTPS/HTTP1.1 bestanden. Die zuvor gemessene HTTP/3-Latenz war damit nicht behoben.

Der neuere Home-/Reader-/Bilder-/Ladefix-Kandidat `f6649dc804a6029bdcceb4eafe47041aace9587b` wurde unabhängig angenommen. Er ist noch nicht hochgeladen: Die automatische Freigabeprüfung lehnte eine neue Hostinger-Dateimanagersitzung ab, weil ihre Begrenzung auf solinaridao.com nicht belegt war. Der bestehende Website-Arbeiter klärt diesen Scope und führt Direktlinks/Rückkehrkontext, Podcastabgleich und vier Bibliotheksadapter unabhängig davon fort.

Der neue gebundene Handoff `docs/handoffs/website-content-2026-10-03-roadmap/manifest.json` enthält14 gehashte Payloaddateien plus Manifest:177 Begriffe,731 Buchmetadaten, vier Lernpfade/33 Buchbindungen,1778 App-Podcastmetadaten,28 Radioverzeichniseinträge und441 App-sichtbare Artikelmetadaten. Er stammt aus dem akzeptierten App-Commit und der bestätigten Datarevision5304fa0. Keine Publisher-Volltexte, Audios, Artwork oder Gefangenenadressen exportiert. Die Website übernimmt die neuen Begriffe mit ihrem Entwurfs-/Sprachfallbackstatus.

## Podcast-Warteschlange und offene Abnahmen

Die Veröffentlichung samt Archiv wurde durch [PR44](https://github.com/Blackfront161/Revolution-News-Data/pull/44) repariert; Main-Dispatch37085213675 und öffentlicher Feedreadback sind bestätigt. Der spätere Schedule37100648981 endete cancelled mit jobs[]. Das passt zur bisherigen Einzelwarteschlange, beweist aber keinen konkreten verdrängenden Lauf.

[Draft-PR45](https://github.com/Blackfront161/Revolution-News-Data/pull/45) ergänzt nur `queue: max` bei acht vorhandenen Schreibern. Der Kontrolleur akzeptiert den Patch. CI37106392158 bleibt wegen einer unveränderten Baseline rot: news.json enthält sieben geeignete Asien-Quellenlabels, der bestehende Test verlangt mindestens acht. Kein Test wurde abgeschwächt, kein roter Check umgangen, kein Merge durchgeführt. Die Queue behält genau einen aktiven Schreiber und höchstens100 Wartende.

Nächste bestehende Aufgaben: Website-Podcast-/Rechte-/ID-Abgleich und Bibliothekskandidaten abschliessen; aktuelle Quoten-/Lexikonoberflächen in den nächsten App-Kandidaten übernehmen; vollständige Navigation über alle Ansichten/Sprachen/Plattformen und Android-Hintergrund-/Sperrbildschirm prüfen; Data-Baseline reparieren und einen erfolgreichen echten Schedulelauf samt Archiv zurücklesen. Quellen-Holds und ungeklärte Final-Straw-/LORA-Identitäten bleiben bis zur Klärung erhalten.

Kein neuer nativer Build, App-Deployment oder Play-Upload in diesem Schritt. Der zuletzt bestätigte Storestand bleibt Code32/2.1.2 in Produktion; Next-Code27/2.2.0 bleibt interner Test. Atlas und iOS verbleiben in ihren bereits angelegten Aufgaben. Die22 bestehenden Roadmap-Aufgaben wurden aktualisiert; es wurde keine zweite Website-Implementierung angelegt.
