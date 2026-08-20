# Konzept: Gefangenen-Solidarität

Status: Der sichere MVP dieses Konzepts ist seit WRN 1.9.0 umgesetzt. Das
Verzeichnis startet bewusst klein; weitere Profile werden erst nach derselben
Adress- und Quellenprüfung aufgenommen.

## Ziel

Der Bereich hilft Menschen, politische Gefangene aus anarchistischen,
antiautoritären und libertär-kommunistischen Zusammenhängen sicher und
respektvoll zu unterstützen. Er ist kein automatisch erzeugtes Register.
Jeder Eintrag wird redaktionell geprüft und verweist auf die veröffentlichende
Solidaritätsgruppe.

Empfohlener Reitername: **Gefangenen-Solidarität**.

## Aufbau in der App

1. **Aktuell** – neue Verlegungen, dringende Schreibaufrufe und Adressänderungen.
2. **Personen** – filterbar nach Region, Sprache und überprüftem Status.
3. **Briefe schreiben** – einfache Anleitung und auswählbare, anpassbare
   Textbausteine.
4. **Schreibwerkstatt** – Vollbildeditor, Übersetzungshilfe, Vergleich zwischen
   Original und Übersetzung sowie Druck- und PDF-Ansicht.
5. **Regeln & Hinweise** – allgemeine Hinweise und die Regeln der jeweiligen
   Haftanstalt.
6. **Quellen & Änderungen** – Quellen, Prüfdatum, Änderungsverlauf und
   Möglichkeit, eine veraltete Adresse zu melden.

## Inhalt eines geprüften Profils

- öffentlich verwendeter Name und Pronomen;
- bevorzugte Briefsprache oder bekannte Sprachen;
- Land, Haftanstalt, öffentliche Postadresse und erforderliche Gefangenen-ID;
- kurzer, sachlicher Kontext ohne Spekulation zu laufenden Verfahren;
- zulässige Brief-, Papier-, Foto- und Umschlagarten;
- nicht zulässige Inhalte oder Beilagen;
- veröffentlichende Bezugs- oder Solidaritätsgruppe;
- letzte Prüfung, nächste fällige Prüfung und Status;
- bestätigte Namensvarianten für passende WRN-Nachrichten.

Die Zustände lauten: `bestätigt`, `Verlegung möglich`, `Freilassung angekündigt`
und `archiviert`. Ist die Adresse länger als 30 Tage ungeprüft, bleibt das
Profil sichtbar, aber Adressetikett und Druck werden bis zur erneuten Prüfung
gesperrt.

## Briefablauf

1. Person auswählen und aktuelle Adresse samt Quelle prüfen.
2. Anstaltsregeln lesen und bestätigen.
3. Persönlichen Brief oder eine neutrale Vorlage wählen.
4. Text lokal bearbeiten; ein Bild kann nur eingefügt werden, wenn die
   dokumentierten Regeln es zulassen.
5. Optional in die bevorzugte Sprache übersetzen und beide Fassungen
   nebeneinander vergleichen.
6. Brief und Adressfeld drucken oder als PDF speichern.

Die App versendet keine Briefe automatisch. Absenderadresse und Brieftext
werden standardmäßig nur auf dem Gerät verarbeitet und nicht gespeichert.

## Sicherheits- und Redaktionsregeln

- Nur Haftadressen übernehmen, die die betroffene Person oder eine erkennbare
  Bezugsgruppe ausdrücklich für Solidaritätspost veröffentlicht hat.
- Keine Privatadressen von Angehörigen, Anwält:innen oder Unterstützer:innen.
- Keine Angaben zu nicht bestätigten Vorwürfen, verdeckten Strukturen,
  Fluchtplänen oder anderen gefährdenden Informationen.
- Eine Adresse benötigt zwei übereinstimmende Quellen oder eine aktuelle
  Primärquelle der zuständigen Bezugsgruppe.
- Änderungen und Freilassungen werden protokolliert; alte Adressen werden
  sofort für Druck und Kopieren gesperrt.
- Keine Analyse darüber, welche Profile einzelne Nutzer:innen ansehen oder
  wem sie schreiben.
- Übersetzungen werden als maschinell unterstützt gekennzeichnet. Namen,
  Gefangenen-ID und Adresse dürfen niemals übersetzt oder verändert werden.
- Vor externer Übersetzung wird ausdrücklich erklärt, welcher Text den
  Übersetzungsdienst verlässt. Persönliche Absenderdaten werden nie übertragen.

## Geeignete Ausgangsquellen

- NYC Anarchist Black Cross: aktuelle internationale Gefangenenliste und
  Schreibhinweise;
- Anarchist Black Cross Federation: Personenprofile, Kampagnen und
  Adressänderungen;
- Solidarity International / Prisoner Solidarity: internationale
  Solidaritätsaufrufe;
- die jeweils benannte lokale Bezugsgruppe;
- offizielle Postregeln der jeweiligen Haftanstalt ausschließlich für
  Versandvorgaben, nicht zur politischen Einordnung.

Veraltete, nicht mehr gepflegte ABC-Seiten dürfen nur als historische Spur
dienen und nie als alleinige Adressquelle.

## Datenmodell

Die kuratierte Datei `prisoner-solidarity.json` erhält pro Person eine stabile
interne ID, öffentliche Namen, Sprachen, Adressfelder, Regeln, Quellen,
Prüfdaten und bestätigte Namensvarianten. Verknüpfte Nachrichten werden
anhand dieser Varianten und der angegebenen Bezugsgruppen gesucht. Eine bloße
unscharfe Titelähnlichkeit reicht nicht.

## Umsetzung in Etappen

1. Read-only-Verzeichnis, Quellen, Prüfdatum, Regeln und Adressetikett.
2. Lokale Schreibwerkstatt mit Vorlagen, Übersetzung, Vergleich und Druck.
3. Verknüpfte WRN-Nachrichten, Korrekturmeldungen und Änderungsverlauf.
4. Optionale lokale Erinnerung an internationale Aktionstage – ohne Tracking
   und ohne automatischen Versand.
