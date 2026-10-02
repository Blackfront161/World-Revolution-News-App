# Radio, Wissen und Website: Fortsetzung vom 3. Oktober 2026

## Umgesetzt in diesem Arbeitspaket

Autonom erhält eine Kopfzeile mit Menü, einzeiligem Titel, WEB und Sprache. Die Lupe entfällt nur dort; WEB und Sprache sind kleiner, behalten aber 44-Pixel-Bedienflächen. Neun Sprachen, vier Breiten und 200 Prozent Textgröße wurden geprüft.

Teilen und Link kopieren geben jetzt Originalverweis und Play-Store-App-Link zusammen weiter. Bei Sendern ohne hinterlegten Stream behauptet der Text keine direkte Wiedergabe in der App. Die Radioladung behält Ersatzstreams, auch wenn die Statusdatei nicht erreichbar ist.

27 bestehende Sender wurden am 2. Oktober technisch geprüft: acht hatten hinterlegte Streams und lieferten Audioantworten. Als 28. Sender kommt 3CR Community Radio aus Melbourne hinzu, dessen offizielle Streamingseite den geprüften Direktlink ausdrücklich für externe Player veröffentlicht. Ergebnis: neun Audioantworten, 19 Verzeichniseinträge ohne zugelassenen Stream. Das sind keine 19 abgeschalteten Sender. Genaue UTC-Zeiten und Kandidatenergebnisse stehen in `radio-health.json`. Daten-PR43 wurde nach beiden grünen Gates gemerged (`e1f59d9171ad0f75f57b57123410a768582cda2c`); der erste automatische Radio-Wartungslauf37067219561 bestand. Der öffentlich abgerufene Datenstand enthält28 Sender und9 Audioantworten. Aktueller Veröffentlichungsstatus steht in `ROADMAP.json`.

Weitere Kandidaten: Freies Radio für Stuttgart (offizielle Seite derzeit HTTP403 bei unserer Prüfung), Radio LoRa Zürich (als Audiothek bereits vorgemerkt, verschieden von LORA München). Bei Radio Blau ist nur ein offizieller HTTP-Stream belegt; ein browserfähiger HTTPS-Stream bleibt zu prüfen. Zuerst fehlen die Streamadressen bei bestehenden Sendern. Keine geratenen Ersatzadressen wurden als funktionierend aufgenommen.

## Nächste Inhaltsarbeit mit Abnahmekriterien

1. **Gefangenensolidarität aktualisieren:** öffentliche Unterstützerseiten zu jedem vorhandenen Eintrag prüfen; Haft-/Freilassungsstatus, Briefadresse, erlaubte Sendungen und nächstes Prüfdatum getrennt belegen. Der Katalogstand vom 9. August hat sein 45-Tage-Prüffenster überschritten. Ein Datum wird erst nach tatsächlicher Prüfung erneuert. Veraltete Adressen bleiben für Kopieren/Drucken gesperrt. Danach mindestens fünf zusätzliche öffentlich belegte Unterstützungsangebote prüfen; keine privaten Familien- oder Anwaltsadressen.
2. **Bibliothek:** die vier bereits geplanten Adapter für Libcom, Kate Sharpley Library, Zabalaza Books und Anarchist Archive umsetzen, zunächst kleine geprüfte Metadatenimporte. Titel/Autor/Sprache/Originallink, Dubletten und Rücknahmen prüfen. Zehn weitere deutsche Kandidaten redaktionell einordnen. Bestand derzeit 728 Titel; dieser Arbeitsgang behauptet keinen zusätzlichen importierten Buchbestand.
3. **Lexikon:** nächste Runde mit zehn neuen oder wesentlich überarbeiteten Begriffen und DE/EN-Erklärungen; Schwerpunkt indigene Selbstbestimmung, Commons, Syndikalismus, Gefangenensolidarität und transformative Gerechtigkeit. Vor Aufnahme gegen die vorhandenen 167 Begriffe auf Dubletten prüfen. Jede Erklärung erhält Primärbelege, Gegenpositionen, Revisionsdatum und echte Buch-/Podcastverknüpfungen. Weitere Sprachen erst nach sprachlicher Prüfung; keine leeren Übersetzungen als fertig ausgeben.
4. **Hilfe:** Radios starten/pausieren/stoppen, Senderseite versus Direktstream, App-Verweis beim Teilen, Übersetzung und Originalsprache, gespeicherte Übersetzungen, Offline-Stand und Meldung defekter Quellen in verständlichen DE/EN-Anleitungen erklären. Anschließend die sieben weiteren UI-Sprachen prüfen. Eine neue Nutzerin soll die jeweilige Funktion ohne internes Projektwissen erreichen können.
5. **Gemeinsame Inhalte und Bilder:** Website bekommt artikelgebundene WRN-Notizen, Metadaten, die aktuellen Kataloge und ein Hashmanifest. Bestehende Website-Auswahl aus dem früheren Freeze bleibt von der neuen App-Auswahl getrennt. Fremde Volltexte und Bilder sind nicht pauschal freigegeben. Eigenes WRN-Bild ist eindeutig als KI-Illustration gekennzeichnet; Original-PNG und die kleinere WebP-Variante bleiben mit Herkunft und SHA256 erhalten.

## Zuständigkeit und Release

`WRN Website – Inhaltsparität` besitzt die Website-Integration und Veröffentlichung; Head Chief liefert Daten und Bildhandoff und schreibt nicht parallel in dessen Website-Arbeitsstand. Der erste konkrete Bildhandoff ist an App-Commit `b777198` gebunden, Originalbild an `914163f`.

Die App-Runtime-Änderungen sind lokal vorbereitet und werden mit der vollständigen Vertragsmatrix geprüft. Google Play bleibt bei dem bereits veröffentlichten Code32. Ein neuer Android-Build für diese Änderungen ist weiterhin separat offen; ältere Code33-Artefakte enthalten dieses Paket nicht.
