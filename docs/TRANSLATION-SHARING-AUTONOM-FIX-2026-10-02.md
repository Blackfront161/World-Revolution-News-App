# Übersetzen, Teilen und Autonom – 2. Oktober 2026

Dieser Folgeauftrag ersetzt den bisherigen unsignierten Code33-Kandidaten `fb937dd`. Google Play bleibt beim bestätigten Code32. Der alte Code33-Signer gehört ausschließlich zum alten Artefakt und darf nicht für diesen Stand verwendet werden.

## Verhalten

- Radio- und abspielbare Podcast-Teiltexte verweisen auf das Hören mit der World Revolution News App und auf deren Play-Store-Seite. Der ursprüngliche Sender-/Episodenlink bleibt erhalten. Der Kopierfallback beim Teilen enthält ebenfalls den App-Hinweis; „Link kopieren“ kopiert weiterhin nur die Originaladresse. Quellen ohne Wiedergabefreigabe werden als Originalfolgen zum Entdecken bezeichnet.
- Die automatische Übersetzung des Aufmachers wird nach ihrem Abschluss sofort angezeigt, auch während weitere Karten noch übersetzt werden. Öffentliche weitere Startseitenkarten werden ebenfalls berücksichtigt.
- Artikel mit gültiger Übersetzung in der gewählten Sprache werden mit dieser Überschrift geteilt. Direkt darunter steht auf Deutsch „Übersetzt mit World Revolution News App.“; der Hinweis ist in allen neun App-Sprachen hinterlegt. Originaladresse und App-Link folgen. Unübersetzte Artikel werden nicht als übersetzt bezeichnet.
- Autonom zeigt auf der Startseite größere, flächenfüllende Bilder neben der Überschrift. Kartenteaser, Metadaten und Aktionen entfallen dort. Die Überschrift öffnet den Artikel mit seinen Aktionen. Andere Ansichten behalten ihren Funktionsumfang.
- Karten- und Leseraktionen dürfen umbrechen. Browserprüfungen bestehen bei 320/390/768/1440 Pixeln, neun Sprachen und auf der Startseite auch mit 200 % Schrift.

## Übersetzungsfehler und Korrekturen

1. Die Startseite aktualisierte sich erst nach dem ganzen Übersetzungsbatch. Eine langsame Folgeanfrage verzögerte dadurch den schon übersetzten Aufmacher. Jetzt wird jedes erfolgreiche Ergebnis sofort angezeigt.
2. Die manuelle Kurztextübersetzung erfasste die Zielsprache nicht vor der Anfrage. Ein Sprachwechsel konnte das Ergebnis der falschen Sprache zuordnen. Zielsprache und Quellfingerabdruck werden jetzt vorab gebunden; veraltete DOM-Elemente werden nicht verändert.
3. Der Client brach nach 45 Sekunden ab, die begrenzten Worker-Phasen können zusammen 50 Sekunden plus Cachezugriffe beanspruchen. Der Client wartet jetzt bis zu 65 Sekunden. Identische gleichzeitige Anfragen werden zusammengeführt.
4. App2 lädt die alte `app.js`-Übersetzungsfunktion nicht. Der bisherige Rückfall hatte dort deshalb kein Ziel. Bei Infrastruktur-/Netzfehlern kann der Client jetzt den vorhandenen Übersetzungsproxy direkt verwenden. Origin-, Auth-, Quoten- und bereits ausgeschöpfte Providerfehler bleiben terminal; Limits werden nicht umgangen.
5. Der Vorschauport 8795 ist live nicht freigegeben: OPTIONS 403. Der bestehende freigegebene Port 8765 und `capacitor://localhost` liefern OPTIONS 204. Die korrigierte Vorschau läuft auf 8765. Keine neue Origin-Freigabe wurde hinzugefügt.

Der reale öffentliche Übersetzungstest lieferte HTTP200 mit `gemini-3.1-flash-lite`; der aktuelle Aufmacher wurde anschließend in der echten Browser-Vorschau auf Deutsch sichtbar. Das belegt erfolgreiche Anfragen, keine unbegrenzte Verfügbarkeit. Bestehende Tages-/Minutenlimits und externe Anbieterfehler können weiterhin zu einer sichtbaren Fehlermeldung führen.

## Gemini / Cloudflare

Google nennt für neue Projekte 3.5 Flash-Lite oder 3.8 Flash. Für 3.1 Flash-Lite ist 3.5 Flash-Lite der empfohlene Ersatz; frühester Abschalttermin ist der 7. Mai 2027. Für unsere kurzen Textübersetzungen ist 3.5 Flash-Lite als Standard im Worker vorbereitet; ein bestehender expliziter Modell-Override hat weiterhin Vorrang. Das ist eine projektspezifische Auswahl, keine Behauptung eines gemessenen Qualitätsgewinns.

Quellen: [Google Modell-Lebenszyklus](https://ai.google.dev/gemini-api/docs/deprecations), [3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).

Worker-Syntax, elf Worker-Tests und Wrangler-Dry-run bestehen. Die Cloudflare-Anmeldung ist abgelaufen und konnte nicht automatisch erneuert werden. **Keine Worker-Veröffentlichung erfolgte; live bleibt das getestete bestehende Modell.** Neue Modellqualität und Kontofreigabe müssen nach erfolgreicher Anmeldung geprüft werden. Die App-Korrekturen benötigen diesen Modellwechsel nicht.

## Prüfung und Release

56 JavaScript-Testmodule, 151 Python-Tests, drei historische Skips, vier Subtests und vier Main-only-Prüfskripte bestehen. Die neuen ausführbaren Regressionen prüfen Sprachwechsel, frühes Aufmacher-Rendering, übersetzte Teilüberschriften, Deduplizierung, Timeout und Quotenfehler. Zwei isolierte Browser-Suiten prüfen tatsächliche App-Aktionen mit Testdaten und abgefangenen Share-/KI-Aufrufen; sie senden nichts an Kontakte und ersetzen keinen nativen Gerätetest.

Die echte Browseraufnahme unter `evidence/translation-autonom-2026-10-02/autonom-live-390.jpg` verwendet reale aktuelle Inhalte, keine Testdaten. Temporäre Browserbreite wurde anschließend zurückgesetzt.

Aktuelle Produktgeneration nach Kontrolleur-Korrektur: JS62, CSS51, Shared-Translation-Client5, Audio-Tools4, Produktionscache `2.1.2-r16`, Vorschaucache `v104`.

Der Kontrolleur fand im Freeze `465442ab` eine UI-Regression: Die manuelle Aufmacherübersetzung setzte `h1.textContent` und entfernte dabei den eingebetteten Öffnen-Button. Der Folgefix setzt ausschließlich die Beschriftung des Buttons. Ausführbare VM- und echte Browser-Regression prüfen, dass der Titel danach weiterhin den Artikel öffnet.

Bei einem vorübergehenden Fehler erhält der aktuell sichtbare Aufmacher einmal pro Quellfingerabdruck und Sprache nach 30 Sekunden einen automatischen Wiederholungsversuch. Vor diesem Versuch werden Ansicht, Sprache, Artikel und Fingerabdruck erneut geprüft. Weitere Fehler bleiben im fünfminütigen Cooldown; Origin-, Auth-, Quoten- und ausgeschöpfte Providerfehler erhalten keinen automatischen Wiederholungsversuch. Ausführbare Tests prüfen den einzelnen Netzfehler-Retry, den Stopp nach erneutem Fehler und 403/429 ohne Auto-Retry.

**Die folgenden Artefakte sind historisch und überholt: nicht signieren.** Ein neuer Freeze und neue Builds werden nach dieser Korrektur separat gebunden.

Neuer Produkt-Freeze: `465442ab6526afafdd2030d09b59f4982f934de4`. Zwei bytegleiche unsignierte AABs für 2.1.2 / Code33 bestehen: je 44.338.550 Byte, 356 gebundene Quellassets, 802 Payload-Dateien, keine Signaturdateien. SHA-256 `508C1DA603CB79335774137DBC2A18ACB1ED548AE88B82369EBD95E58580C41D`. Pfade: `outputs/translation-autonom-code33/build1/WorldRevolutionNews-2.1.2-code33-465442a-unsigned.aab` und entsprechendes `build2`. Beide Buildberichte bestätigen sauberen detached Quellstand und null Kopier-/Paketunterschiede; die zusätzliche Root-Prüfung bestätigt Bytegleichheit, fehlende Signatur und eingebettete Generations-/Verhaltenstokens.

Diese Artefakte enthalten den damaligen ROADMAP-Snapshot des Produkt-Freeze. Die nachgepflegte Artefaktbindung ist ein Dokumentations-Folgecommit und verändert sie nicht. Signierung, unabhängige Abnahme, physischer Test, Play-Upload und Cloudflare-Modellmigration sind getrennte offene Schritte. Status und Artefaktbindung stehen in `ROADMAP.json`; frühere Belege bleiben historisch erhalten.

Der einzelne Aufmacher-Retry verwendet direkt den bereits deduplizierten Anforderungsweg. Er kann deshalb nicht durch den Abbruch des anderen Startseitenbatches nach drei Fehlern verloren gehen.

## Endgültiger korrigierter Kandidat

Freeze `ce2b5565e539cbd1373fef5684cf1997fab5b6e2` ist unabhängig vom Kontrolleur als Runtime-PASS abgenommen. Zwei neue bytegleiche **unsignierte** AABs: je 44.339.190 Byte, SHA-256 `3B833A549CC8B4B3085AA9701620883A20150AD1D268FDF3625043BBC04277AD`, 356 gebundene Quellassets und 802 Payload-Dateien, null Quell-/Paketunterschiede, keine Signaturdateien. Pfade: `outputs/translation-autonom-code33-controller/build1/WorldRevolutionNews-2.1.2-code33-ce2b556-unsigned.aab` und entsprechend `build2`.

Aktuelle Belege: `evidence/translation-autonom-2026-10-02/controller-followup/`. Die Aufnahme `autonom-live-js62-390.jpg` zeigt die echte endgültige Vorschau. Die AABs wurden zur separaten unabhängigen Paketabnahme übergeben. Keine Signierung, kein Play-Upload und kein Cloudflare-Deployment. ROADMAP-/Artefaktstatus ist nachgepflegte Dokumentation; die AABs bleiben unverändert an `ce2b556` gebunden.
