# Unabhängige AAB-Abnahme: PASS, unsigniert

Empfangen am 2. Oktober 2026 vom bestehenden WRN Kontrolleur (`019ff285-63dc-7ed2-88a8-cab5f06ed26e`). Read-only Abnahme beider Kandidaten aus Freeze `ce2b5565e539cbd1373fef5684cf1997fab5b6e2`.

- Beide AABs bytegleich: je 44.339.190 Byte, SHA-256 `3B833A549CC8B4B3085AA9701620883A20150AD1D268FDF3625043BBC04277AD`.
- 802 vollständig lesbare Payload-Dateien; keine doppelten ZIP-Pfade. Keine META-INF-Signaturen; jarsigner bestätigt unsignierte Datei.
- 356 eingebettete Webassets stimmen nach der dokumentierten Git-Filter-/Zeilenendennormalisierung mit dem Freeze überein. 355 stimmen mit dem späteren Produktcheckout überein; die eingebettete ROADMAP entspricht semantisch exakt `git show ce2b556:ROADMAP.json` und nicht dem späteren Dokumentations-HEAD. Keine Raw-Blob-Bytegleichheit behauptet.
- Beide Reports: requested/resolved/sourceHead exakt ce2b556, saubere Quelle, 2.1.2 / Code33, null Kopier-/Paketunterschiede, signatureVerified=false und releaseReady=false.
- JS62, CSS51, Shared5, Audio4, Produktionscache r16 / Vorschaucache v104 bestätigt. Nachgepflegte Dokumentation verändert die AABs nicht.

Diese Abnahme bestätigt ausschließlich reproduzierbare unsignierte Kandidaten. Signierung mit erwartetem Zertifikat, erneute Signatur-/Hash-/Assetprüfung, physischer Code33-Test und ausdrücklich autorisierter Play-Upload bleiben offen. Die Cloudflare-Modellmigration ist ein getrennter Schritt und wurde nicht veröffentlicht.
