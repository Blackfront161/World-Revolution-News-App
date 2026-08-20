# Android-Release mit einem Befehl

Das Release-Skript baut die Android-App immer aus einem ausdrücklich
gewählten Git-Commit. Es:

1. löst den Commit auf und erstellt dafür einen temporären, sauberen Worktree,
2. kopiert genau dessen Webdateien einschließlich `news-archive/**` mit ihren
   relativen Pfaden in das Capacitor-Projekt und entfernt vorher den alten
   `webDir`-Inhalt innerhalb einer geprüften Sicherheitsgrenze,
3. erhöht den Versionscode automatisch oder verwendet einen ausdrücklich
   angegebenen gleichen oder höheren lokalen Code,
4. führt `npm run sync:android` sowie `lintRelease`,
   `testReleaseUnitTest` und `bundleRelease` aus,
5. erzeugt AAB sowie JSON- und Markdownbericht ausschließlich unter eindeutig
   benannten temporären Pfaden in ihren jeweiligen finalen Ausgabeordnern,
6. prüft dort Signatur, Zertifikat sowie rekursiv Pfadmenge und SHA-256 aller
   eingebetteten Webdateien; nur die von Capacitor erzeugten Root-Dateien
   `cordova.js` und `cordova_plugins.js` sind ausgenommen,
7. liest beide temporären Berichte erneut ein, prüft ihre wesentlichen Angaben
   gegen die AAB und veröffentlicht erst danach AAB und Berichte gemeinsam in
   einer rücknehmbaren Commit-Phase.

Beispiel:

```powershell
.\scripts\build-android-release.ps1 `
  -AndroidProject "C:\Pfad\zum\Capacitor-Projekt" `
  -Commit "origin/main" `
  -VersionName "1.8.5" `
  -Keystore "C:\Pfad\world-revolution.jks" `
  -KeyAlias "WRN_KEY"
```

Ohne `-VersionCode` verwendet das Skript automatisch den lokal vorhandenen Code
plus eins. Ein ausdrücklich angegebener kleinerer Code wird abgelehnt; derselbe
lokale Code darf für einen korrigierten Kandidaten erneut gebaut werden, solange
er noch nicht zu Google Play hochgeladen wurde. Das Skript kann nicht erkennen,
welche Versionscodes bereits in der Play Console verwendet wurden. Vor dem
Upload muss dort bestätigt werden, dass Code 23 noch unbenutzt ist. Wurde Code
23 bereits verwendet, ist ein höherer Code zu bauen und vollständig neu zu
prüfen und zu dokumentieren. Ohne `-VersionName` übernimmt das Skript die
Version aus `WRN_CONFIG` des gewählten Commits. Eine abweichende Android- und
Webversion wird abgelehnt.

Das Kennwort wird nicht im Repository oder Bericht gespeichert. `jarsigner`
fragt es sicher im Terminal ab. Für lokale Automatisierung können die
temporären Umgebungsvariablen `WRN_KEYSTORE_PASSWORD` und
`WRN_KEY_PASSWORD` gesetzt werden; das Skript nutzt dann die
`jarsigner`-Option `:env`, sodass Kennwörter nicht in der Befehlszeile stehen.

## Unsignierter Prüf-Kandidat

Für einen reproduzierbaren Kandidaten ohne Zugriff auf private Schlüssel wird
`-Unsigned` verwendet. `-Keystore` ist dann nicht erlaubt oder erforderlich:

```powershell
.\scripts\build-android-release.ps1 `
  -AndroidProject "C:\Pfad\zum\Capacitor-Projekt" `
  -Commit "<vollständiger Fix-Commit>" `
  -VersionCode 23 `
  -VersionName "2.0.8" `
  -OutputDirectory "C:\neues\leeres\Prüfverzeichnis" `
  -SkipFetch `
  -OfflineGradle `
  -Unsigned
```

Der Dateiname enthält den kurzen Quell-Commit. Der Bericht darf bei einem
unsignierten Kandidaten `status: passed` für Build und rekursiven Assetvergleich
melden, muss aber `releaseReady: false` und `signatureVerified: false` behalten.

Für eine unabhängige Attestierung werden die AAB-Bytes gegen einen zweiten
frischen Detached-Worktree desselben vollständigen Commits verglichen. Nicht der
aktuelle Arbeitsordner ist die Bytequelle: Git-Zeilenendefilter können dort trotz
identischer Commit-Inhalte andere Arbeitsdatei-Bytes erzeugen.

## Sichere Webverzeichnis-Bereinigung

Der Android-Root, das `webDir` und alle bereits vorhandenen Pfadkomponenten
dazwischen müssen frei von Reparse Points, Junctions und Symlinks sein. Der
bestehende `webDir`-Baum wird nicht mehr in-place geleert: Nach einer
No-Follow-Vorprüfung wird er innerhalb desselben Elternverzeichnisses atomar auf
einen zufälligen, aufrufgebundenen Quarantänepfad umbenannt. Danach wird ein
neues normales `webDir` erzeugt und erneut geprüft. Nur der exakt bekannte
Quarantänebaum wird ohne Folgen von Verknüpfungen entfernt. Fehler beim Rename
oder Neuerstellen stellen den ursprünglichen Baum wieder her; fremde oder ältere
Quarantänepfade werden nicht berührt.

## Signatur-Gate

Vor der Passwortabfrage wird der SHA-256 der Eingabe-AAB mit dem fest
hinterlegten erwarteten Wert verglichen. Nach der Signierung müssen vorhanden
sein:

- mindestens eine `META-INF/*.SF`-Datei,
- mindestens ein Signaturblock `META-INF/*.RSA`, `*.DSA` oder `*.EC`,
- eine ausdrückliche Verifikationsmeldung von `jarsigner`,
- der erwartete SHA-256-Fingerprint des Upload-Zertifikats aus `keytool`.

Ein Exitcode 0 von `jarsigner` allein genügt ausdrücklich nicht. Vorhandene
Ausgabe-AABs oder Berichte werden nicht überschrieben. AAB und Berichte werden
als eine exception-rücknehmbare Gruppe behandelt: Alle finalen Ziele müssen
vorab frei sein. Unmittelbar vor Beginn der Commitphase erfolgt eine vollständige
erneute Fach- und Byteprüfung aller temporären Artefakte. Vor jedem Move werden
alle bereits veröffentlichten und noch ausstehenden Dateien erneut gegen ihre
festgehaltene Identität geprüft; sämtliche noch offenen Ziele müssen frei sein.
Scheitert die Vorbereitung, Berichtsprüfung oder ein einzelner finaler Move,
werden nur die durch genau diesen Aufruf erzeugten und per SHA-256 identifizierten
finalen Artefakte zurückgenommen. Aufrufgebundene temporäre Pfade werden erst
nach einer Reparse-Point-verwerfenden Identitätsprüfung entfernt. Fremde Dateien
bleiben unangetastet, und ein erneuter Versuch bleibt möglich.

Die Mehrdatei-Veröffentlichung führt nun unter dem validierten Build-Root ein
durables, atomar ersetztes Recovery-Journal und hält parallel einen exklusiven
OS-Lock. Nach jedem Move wird der Fortschritt mit Write-Through/Flush
festgeschrieben. Ein Wiederanlauf rollt einen unvollständigen Commit nur dann
zurück, wenn finale Dateien exakt der journalisierten SHA-256-/Größenidentität
entsprechen. Ein vollständig journalisierter Commit bleibt vollständig erhalten.
Windows-Hartabbruchtests nach dem ersten und zweiten Move sowie nach dem
Commitmarker belegen diese Wiederanlaufpfade.

Finale, temporäre, Lock- und Journalpfade müssen innerhalb des ausdrücklich
übergebenen, reparse-freien Build-Roots liegen. Cleanup folgt weder Junctions
noch Symlinks und löscht ausschließlich normale Dateien mit genau einem
Hardlink. Ein manipuliertes Hardlink-Ziel bleibt bewusst liegen und blockiert
die Recovery, bis die Ausleitung sicher entfernt ist. Traversal-, Junction-,
Hardlink- und stale-Lock-Tests laufen unter Windows. Ein Power-Loss genau
während des physischen Datenträger-Flushs bleibt wie bei jedem
Dateisystemprotokoll von der Hardware-/Dateisystemgarantie abhängig; das Journal
behauptet keine über NTFS hinausgehende Atomarität.
Der erfolgreiche Bericht nennt den SHA-256 der unsignierten Eingabe und der
signierten Ausgabe getrennt. Warnungen und vollständige Prüfausgaben bleiben
darin sichtbar.
