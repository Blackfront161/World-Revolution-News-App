# Release-Übergabe 2.0.8 · Code 23

Stand: 12. August 2026

> Historischer 2.0.8-Ausgangsstand: Die aktuelle Produktarbeit auf diesem Branch
> gehört zu `2.1-dev` und darf nicht als 2.0.8-Patch paketiert werden. Außerdem
> ist die Mehrdatei-Veröffentlichung bei Power-Loss noch nicht crash-atomar;
> dieser Bericht ist daher keine aktuelle Releasefreigabe.

- Web- und Android-Version: `2.0.8`
- Android-Versionscode: `23`
- App-Cache: `wrn-app-v2.0.8-release-r2`
- R8-Minifizierung und Resource Shrinking aktiv
- aktueller Webstand wird vor und nach dem AAB-Build bytegenau geprüft
- Upload zu Google Play erfolgt ausschließlich durch den Nutzer

Die frühere AAB 2.0.7 / Code 21 bleibt unverändert. Die neue AAB wird aus dem
aktuellen Quellstand erzeugt und mit demselben privaten Upload-Schlüssel
signiert.

## Abgelehnter R2-Build vom 11. August 2026

- Branch: `codex/wrn-2.1-stabilization`
- Quell-Commit: `e324dcd`
- Unsignierte AAB: `WorldRevolutionNews_v2.0.8-code23-r2-unsigned.aab`
- SHA-256: `4D60681F60D4A8AA1B2E8C56BDC0BBED136FC5445AEB97A3193707E73DEEF8ED`
- Status: **abgelehnt, nicht signieren und nicht hochladen**.
- Ursache: Der damalige Vergleich erfasste nur 218 Dateien im Repository-Root
  und übersah den rekursiven Bestand unter `news-archive/`.
- Im R2-Bundle fehlt eine referenzierte Archivdatei, sieben alte Archivdateien
  sind zusätzlich enthalten und 91 von 121 gemeinsamen Archivdateien weichen ab.
- `lintRelease`, `testReleaseUnitTest` und `bundleRelease` waren zwar erfolgreich;
  diese Prüfungen heben den fehlerhaften Assetbestand nicht auf.

Der lokale Signierdialog bleibt blockiert, bis ein korrigierter unsignierter
Kandidat aus einem exakt benannten Fix-Commit gebaut, rekursiv geprüft und mit
seinem tatsächlichen SHA-256 fest hinterlegt wurde.

## Korrigierter unsignierter Kandidat

- Code-Fix-Commit: `4a1f2b4ae1383d9657d8df62abeb3ef331b91d64`
- AAB: `WorldRevolutionNews-2.0.8-code23-4a1f2b4-unsigned.aab`
- SHA-256: `14F27FCDBBEC918654BAA6B83242AB6D7982A1D778AB53742F1A41F19878D6D6`
- Artefaktmodus: `unsigned-candidate`
- 340 Webpfade insgesamt, davon 122 unter `news-archive/**`
- fehlende Pfade: 0; zusätzliche Pfade: 0; abweichende SHA-256-Werte: 0
- derselbe Null-Abweichungsstand wurde zusätzlich gegen einen zweiten frischen
  Detached-Worktree des Fix-Commits geprüft
- `bundleRelease`, `lintRelease` und `testReleaseUnitTest` erfolgreich
- Signaturdateien: 0; `signatureVerified: false`; `releaseReady: false`

Der Signierdialog ist jetzt fest an diesen Dateipfad und SHA-256 gebunden. Er
verweigert andere Eingaben und vorhandene Ausgabedateien. Die Signierung erfolgt
in einer temporären AAB; der zugehörige Bericht wird ebenfalls zunächst unter
einem nicht final wirkenden temporären Pfad vollständig geschrieben und erneut
gelesen. Erst nach Signatur-, Zertifikats-, rekursiver Asset- und Berichtsprüfung
werden AAB und Bericht gemeinsam in einer rücknehmbaren Commit-Phase
veröffentlicht. Eingabe- und Ausgabe-SHA-256 werden getrennt berichtet. Eine
Signierung wurde in diesem Arbeitsschritt ausdrücklich nicht ausgeführt.

„Rücknehmbar“ gilt nur für gefangene Fehler und Exceptions. Bei einem harten
Prozessabbruch oder Stromausfall nach dem ersten finalen Move läuft die
Rücknahme nicht. Ohne dauerhaftes Journal mit Wiederanlauf-Recovery kann ein
Teilzustand verbleiben. Eine teilweise vorhandene AAB-/Berichtgruppe ist nie
als erfolgreicher Release zu behandeln.

## Versionscode vor dem Upload

Das Buildskript blockiert einen Versionscode, der kleiner als der lokal im
Android-Projekt konfigurierte Code ist. Es erlaubt denselben lokalen Code für
einen korrigierten, noch nicht hochgeladenen Kandidaten. Ob Code 23 bereits bei
Google Play verwendet wurde, kann das lokale Skript nicht erkennen. Vor dem
Upload muss dies in der Play Console bestätigt werden. Ist Code 23 dort bereits
verwendet, muss ein höherer Versionscode gebaut, erneut vollständig geprüft und
dokumentiert werden.

## Offene Release-Gates

- [x] korrigierter Build aus einem exakt benannten Code-Fix-Commit
- [x] rekursiv identische Pfadmenge und SHA-256-Werte einschließlich `news-archive/**`
- [x] dokumentierter SHA-256 der unsignierten Eingabe
- [ ] dauerhaftes Journal und getestetes Wiederanlauf-Recovery für harten
  Abbruch der gemeinsamen AAB-/Berichtsveröffentlichung
- [ ] dokumentierter SHA-256 der signierten Ausgabe
- [ ] echte Signaturdateien, erfolgreiche `jarsigner`-Prüfung und erwarteter
  SHA-256-Fingerprint des Upload-Zertifikats
- [ ] Installation, Update von der Vorversion und Offline-Neustart auf Android
- [ ] HTTPS-Test von Übersetzung und natürlicher Podcast-Erzeugung
- [ ] Google-Play-Upload und Kontrolle des Gerätekatalogs durch den Nutzer
- [ ] Post-Rollout-Prüfung von Feed-Aktualisierung und Podcast-Bibliothek
