# Website-Veröffentlichung vom 1. Oktober 2026

Die ausdrücklich autorisierte Veröffentlichung auf [solinaridao.com](https://solinaridao.com/) ist abgeschlossen und vom **WRN Kontrolleur** unabhängig live abgenommen. Veröffentlicht wurde exakt Website-Commit `5df01f13937b4c7957aeb097b7116587b86eb144` aus `work/website-projection-favicon-compression-release-v2/READY.json`. Der alleinige Website-Schreiber führte die Hostinger-Aktivierung aus. Der [gebundene Nachweis](WEBSITE-PUBLICATION-2026-10-01.json) enthält Paketbindung, unabhängige Browserbelege und Prüfsummen aller 43 öffentlich abrufbaren Dateien.

## Inhalt und Grenzen

- 480 von 500 Eingangszeilen sind als Nachrichtenmetadaten und sichere Originallinks sichtbar; 20 begründete Ausschlüsse bleiben erhalten.
- 397 von 406 Registerendpunkten sind aufgenommen. Dies ist keine Zählung verschiedener Herausgeber. 476 Nachrichtenlinks haben keinen bestätigten Quellenpass und werden nicht als redaktionell geprüft ausgegeben.
- Zwölf zuvor zugelassene Volltexte und drei vorhandene Quellenprofile bleiben eine eigene Klasse; dieses Paket nimmt keine neuen Volltexte oder Medien auf.
- Kanonische Eingangsbindung: `33509ace3d3b2f7f275ebc05fe3522a59d62964f`. Der spätere lokale Datencommit `17b3604` wurde dadurch nicht veröffentlicht.
- Directory-Sequenz `202609301530`, Snapshot-SHA `72fea07011df07b18ea274524530a53bc6485b1b17f575c050d8e4857bbf71ff`. Der Produktionsvolltextstand bleibt `wrn-production-news-2026-09-26-v8`.

Die Nachrichten-/Quellenprojektion ist live abgeschlossen. Die vollständige App-Inhaltsparität bleibt offen: Lexikon, Bibliothek und Podcasts benötigen ihre eigenen Katalogabgleiche und Website-Projektionen. Der lokale Lexikonentwurf mit 155 Begriffen ist nicht durch dieses Website-Paket veröffentlicht.

## Unabhängige Prüfung

Der Kontrolleur führte 209 Frontendtests, 82 Node-Vertragstests, TypeScript `noEmit` und die echte Chrome-Corematrix einschließlich Brotli/gzip aus; alle bestanden. Paketdateien: 44/44 Website und 47/47 Hosting byte- und hashgenau.

Nach Aktivierung prüfte er direkt auf der Live-Website: sechs Projektionskarten, 480/500 und 20 Ausschlüsse, sichere Originalverweise, News-/Sources-Direktlinks und ungeprüfte Quellenkennzeichnung. 1440 × 900 und 390 × 844 hatten keinen horizontalen Überlauf. Er betätigte die sichtbare Aktion „Save website shell“, bestätigte `saved|active` und den aktiven Worker, beendete Chrome vollständig und startete denselben temporären Profilstand ohne Netzwerk neu. Die sechs Artikel-IDs und ihre Reihenfolge blieben identisch; der Worker kontrollierte die Offlineansicht, ohne Seitenfehler.

Das eigene Logo dient als Favicon und wurde online sowie nach dem Offline-Neustart exakt bestätigt: PNG, 1254 × 1076, 1.123.871 Bytes, SHA-256 `9dca207bc008384ef45cf435a134bf170037ae0149d27c43c732b754912b61b9`. Anschließend bestanden alle 43 öffentlich abrufbaren Dateien den unabhängigen Live-Abgleich von Bytes, Längen, SHA und Headern, einschließlich Startseite, Worker, Inhaltszeigern und Widerrufen. Hosting-Steuerdateien sind nicht alle öffentlich abrufbar; 43 ist daher nicht die vollständige Hosting-Paketdateizahl.

## Reparaturen und Rollback

Vorherige Aktivierungsversuche wurden nach echten Fehlern zurückgenommen. Hostinger benötigte explizite UTF-8-Content-Type-Header. Der Offline-Worker verglich anschließend die komprimierte HTTP-Übertragungslänge mit der dekomprimierten Datei und lehnte gültige Dateien ab. Die Reparatur lässt diesen Vorvergleich nur bei unveränderter/Identity-Übertragung zu; exakte gelesene Bytezahl, Streamingbudget, MIME und SHA bleiben zwingend. Negative Integritätsfälle und echte komprimierte Browserpfade bestehen. Die letzte TypeScript-Korrektur blieb auf optionale Directory-Felder und Testtypisierung beschränkt.

Aktivierung nach frischem Widerrufsabgleich: gebundene Dateien zuerst, Worker und Startseite, Produktionszeiger, Directory-Zeiger zuletzt. Ein vollständiges serverseitiges Rollbackarchiv liegt privat außerhalb von `public_html`; sein lokaler Komplettdownload war nicht erfolgreich. Der archivierte Zustand ist daher nicht als lokal vollständig heruntergeladen beschrieben.

## Nachweisbindung und Folgearbeit

Shell-ID: `2cf0f8ba57ca78142efbd38fca1197f652ac3b48ff59b7d20044c966a5e7f1cf`.

Website-Manifest-SHA: `4c50b23160a92efa382ba5621113a1181e0a913a7512b707c76fcd78deb3d99a`. Hosting-Manifest-SHA: `34a0b8cdf6c7dd425e0e9525e690484aa4eb310c3ec89689e345c668ba62d822`.

Der JSON-Nachweis ist aus den tatsächlich ausgeführten unabhängigen Controllerbelegen abgeleitet. Seine Erfassung hat keinen weiteren Browserlauf oder Deployment ausgeführt. Die ursprünglichen Livebelege verbleiben im Website-/Controller-Arbeitsbereich; ihre SHA-Bindungen stehen im Nachweis. Das vorher als `LOCAL-PASS` erzeugte READY bleibt als historische Vorbereitung unverändert, statt nachträglich einen Live-Test vorzutäuschen.

Die [Ergänzungsroadmap](CONTENT-EXPANSION-ROADMAP-2026-10-01.md) führt Katalogzusammenführung, deutsche Bibliothekstitel, weitere Lexikonbeiträge/Lernpfade und Podcastarchive weiter. Das bestehende unsignierte Android-Code31-AAB aus Runtime `8d2ef234` bleibt unverändert; Android-Signierung und Store-Upload sind kein Bestandteil dieser Website-Veröffentlichung.
