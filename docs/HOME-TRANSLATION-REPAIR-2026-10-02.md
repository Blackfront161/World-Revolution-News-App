# Automatische Übersetzung beim Start · 2. Oktober 2026

Der normale Start der deutschen Vorschau erzeugte 37 Übersetzungsanfragen in rund 40 Sekunden: erst für den eingebauten August-Datenstand, anschließend für die aktuellen Nachrichten. Der Proxy begrenzt Anfragen auf 20 pro Minute. Die Antworten enthielten HTTP 429 mit „Bitte warte eine Minute“ sowie HTTP 400 für leere Kurztexte. Nach der Sperre gab die App die Versuche später wieder frei, startete die automatische Übersetzung aber nicht selbst neu. Beide Übersetzungsdienste beantworteten gezielte Prüfungen erfolgreich; die manuelle Volltextübersetzung des italienischen Leitartikels funktionierte ebenfalls.

Geprüfter lokaler Quellstand: `63b7a38bc077c8cb21409fbd5dafee771dce7063`. SHA-256 von `news-app-2.js`: `133c9c0a348317a47be54bce84dfc059d814438b0ba6ef1b6c0652aa7eef0f01`.

Der Fix zeigt Offline-Nachrichten sofort, beginnt die automatische Home-Übersetzung aber erst nach dem begrenzten Live-Ladeversuch. Er bearbeitet höchstens zwölf automatische Aufträge je Minutenfenster und priorisiert die Schlagzeile. Ein Neuaufbau der Ansicht setzt dieses Budget nicht zurück. Eine serverseitige Minutensperre pausiert die Home-Aufträge für 65 Sekunden; danach kann die Ansicht sie selbst fortsetzen. Tagesquoten und nicht verfügbare Quotenkontrollen werden nicht als Minutensperre behandelt. Leere Kurztexte lösen keine automatischen API-Anfragen aus. Beim Hintergrundrefresh beginnt die laufende Warteschlange keine weiteren Aufträge für den abzulösenden Datenstand.

Modell, Worker, Bindungen und serverseitige Kontingente wurden in diesem Arbeitsgang nicht verändert. Das Budget reserviert Kapazität für manuelle Aufträge, garantiert jedoch keine Verfügbarkeit bei vielen gleichzeitig aktiven Clients oder ausgeschöpfter Tagesquote. Die Qualität bereits gespeicherter generierter Übersetzungen ist von diesem Startfehler zu unterscheiden.

Prüfungen:

- 57 JavaScript-Verträge; 151 Python-Tests und vier Subtests bestanden; drei historische Skips; vier zusätzliche Main-Verträge bestanden.
- App-Validator erfolgreich; Release-Audit 161/161 ohne Warnungen oder Fehler.
- Isolierter Browser: Offline-Schlagzeile sofort sichtbar, keine Übersetzung des alten Bestands während des Live-Versuchs, aktuelle Schlagzeile anschließend automatisch deutsch.
- Übersetzen/Teilen-Regressionsbrowser erfolgreich: unabhängig übersetzte Schlagzeile, manuelle Übersetzung, übersetzte Teilen-Überschrift, neun Sprachen und vier Bildschirmbreiten.
- Echter normaler Start nach Fix: zwölf POSTs, alle HTTP 200, keine Übersetzungs-Netzwerkfehler, deutsche Schlagzeile. Die erste Anfrage galt dem aktuellen Leitartikel. Der neue JS64-Stand wurde anschließend auch im vorhandenen Nutzer-Tab geladen und die deutsche Schlagzeile dort bestätigt.

Belege liegen unter [evidence/home-translation-repair-2026-10-02](evidence/home-translation-repair-2026-10-02). Die unabhängige technische Prüfung ist beim bestehenden WRN Kontrolleur angefordert. Eine bestätigte Abnahme wird gesondert nachgetragen.

Cachebindung: JS64, CSS52 und Lexikon9; Produktionscode `2.1.2-r18`, Vorschau `v106`. Der Quellstand ergänzt die vorherige Autonom-/Inhaltserweiterung und ist die neue Grundlage für den nächsten Android-Kandidaten. Google Play bleibt bei Code32. Es erfolgten weder neuer Android-Build noch Signierung, Upload oder App-Veröffentlichung.
