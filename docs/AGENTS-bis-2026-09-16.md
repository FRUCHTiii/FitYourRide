# Historisches Dokument – keine aktuellen Arbeitsanweisungen

Durch die aktuelle AGENTS.md ersetzt. Enthält überholte Sattel-Dummyannahmen.

# Ride Fit: Entwicklung und vollständige Neukalibrierung

Diese Anleitung gilt für das gesamte Projekt. Sie ist zugleich das Messprotokoll
für spätere Kalibrierungen. Stand: 16.09.2026, geprüfter Lenker / gemessene Hoods / Demo-Sattel.

## Verbindliche Produktvorgaben (aktualisiert)

- Ausschließlich für den geschulten Bikefitter. Kompakte Arbeitsoberfläche;
  keine Modellauswahl, keine Modellbeispiele und keine Geometriedatenbank.
  Die bereitgestellten Hersteller-PDFs waren nur zur Veranschaulichung.
- Keine Kalibrierungsanleitung, keine Hardware-/Referenzdarstellung und keine
  Links darauf auf der Website oder in der eigenständigen HTML-Vorschau.
  Diese AGENTS.md bleibt ausschließlich im Quellprojekt.
- Standard ist die Lenkerklemmmitte aus Rahmengeometrie und Vorbau. Hood-Maße
  sind optional und müssen bekannt/gemessen sein. Keine erfundenen Zielrad-
  Hood-Offsets; nomineller Lenker-Reach allein liefert keinen Handpunkt.
- Sattelübertragung ist optional und unabhängig vom Cockpit. Die Arbeitshöhe
  wird vom Fitter festgelegt. Im Modus „Rahmengeometrie simulieren“ werden
  Sitzrohrwinkel, horizontaler Sattelstützen-Setback und der kalibrierte
  Sattelbezug verwendet. „Gemessene Position übertragen“ übernimmt dagegen
  gemessene Sattelhöhe und gemessenen Gesamtversatz direkt.
- Sitzrohrwinkel und Sattelneigung sind verschiedene Eingaben. Sitzrohrwinkel
  liefert in Kombination mit Arbeitshöhe, Stützenversatz und Sattelbezug eine
  Referenzposition. Bei effektivem Sitzwinkel sind Bezugshöhe und Hersteller-
  definition zu beachten. Ein starrer Ride-Rahmen ändert nicht seinen
  Sitzrohrwinkel; B verschiebt eine Position für die gewählte Höhe.
- Bei aktivierter Sattelübertragung muss die Neigung des Zielrads angegeben
  werden: positiv = Spitze hoch, negativ = Spitze tief. Die Position muss bei
  dieser Neigung gemessen sein. Winkelabhängigkeit wird im Solver berücksichtigt.
- Versteller A = Höhe, B = Ride-Vor-/Rückverschiebung, C = Sattelschienen.
  C bleibt für die Geometriesimulation mittig und für den Fahrer-Fit reserviert.
  KEINE automatische C-Verschiebung bei erschöpftem B-Bereich. Bei Höhenänderung
  B neu berechnen. Die Sitzrohrlinie wird nicht durch einen konstanten B-Wert
  über alle Höhen nachgebildet.
- Keine Kunden-Tutorials oder wiederholten Demo-Warntexte ergänzen. Der knappe
  Demostatus bleibt erhalten, solange die feste Kalibrierung Dummydaten enthält.

## 1. Ziel, Architektur und aktueller Status

Statische deutschsprachige Anwendung für GitHub Pages, ohne Server, externe
Laufzeitabhängigkeiten oder Kundendatenübertragung. Die Kalibrierung wird einmal
manuell durchgeführt und anschließend fest im Code hinterlegt. Keine
Kalibrierungsmaske im normalen Bedienablauf; die vier Aufbauten sind auswählbare
Aufbauprofile. Es gibt ausschließlich die neue V1-Sattelstütze mit verstellbarer
Sattelklemme, keine Auswahl der alten Stütze.

Der Benutzer hat ausdrücklich Dummydaten für die fertige Vorschau autorisiert.
Die Lenkerprofile sind `validated`; Hoods sind vom Benutzer als `validated` akzeptiert, Sattel bleibt `demo`. Das ist keine physisch validierte
Größenabdeckung. Dummydaten niemals allein durch Ändern des Status freigeben.

| Datei | Aufgabe |
| --- | --- |
| `dist/index.html` | Oberfläche und Eingabestruktur |
| `dist/style.css` | Desktop-, Mobil- und Druckansicht |
| `dist/app.mjs` | Eingaben, Fußvergleich, Diagramm, Einstelltexte |
| `dist/geometry.mjs` | Rahmen-/Vorbauberechnung und bisheriger allgemeiner Solver |
| `dist/ride-calibration.mjs` | EINZIGE Quelle der festen Profile, Hardware und Rohmessungen |
| `dist/fit-model.mjs` | Lenker- und Sattelsolver, Profilprüfung und Skalenumrechnung |
| `scripts/build.mjs` | Erzeugt ausschließlich die eigenständige HTML-Vorschau |
| `tests/*.test.mjs` | Rechen- und Integrationsprüfungen |
| `.github/workflows/pages.yml` | Prüft und veröffentlicht `dist/` nach Push auf main |

Die Vorschau `ride-fit-preview.html` ist generiert: immer die Module ändern und
anschließend `node scripts/build.mjs` ausführen. Keine zweite Referenz im HTML
pflegen. `dist/calibration.html` wurde entfernt; der Build entfernt auch einen
alten Rest dieser Datei. AGENTS.md niemals in `dist/` kopieren oder einbetten.

## 2. Referenzaufbau und vier Optionen

| Bestandteil | Referenz |
| --- | --- |
| Rahmen | Zwift Ride V1 |
| Trainer | Wahoo KICKR CORE 2 |
| Ohne Fuß | Eigenständig gemessener Aufbau; keine nominelle Auflagehöhe annehmen |
| Kleiner Fuß | 17,5 mm, vom Benutzer gemessen |
| Mittlerer Fuß | 28 mm, vom Benutzer gemessen; bisher verwendeter, für CORE 2 empfohlener Aufbau |
| Großer Fuß | 51 mm, vom Benutzer gemessen |
| Lenker | Fouriers 320–440 mm; nominell 85 mm Reach, 125 mm Drop, 31,8 mm Klemmung |
| Hoods | SRAM Force D2 eTap AXS DB |
| Sattelstütze | Zwift Ride V1 Adjustable Saddle Clamp & Seatpost |
| Sattel | Modell noch offen; Demo verwendet einen fiktiven Referenzsattel |

Die Fußhöhen allein liefern KEINE exakte Geometrieänderung. Der Fußwechsel kippt
den Aufbau; deshalb ändern sich x UND y von Lenker, Sattel und Handauflage
relativ zum Tretlager. Nicht pauschal 10,5 bzw. 23 mm vom Stack abziehen.

Aktueller Lenkerstand: komplett neue Messreihe vom 16.09.2026, direkte
Lenkerklemmmitte. KEINE Radiuskorrektur. Alle vier Füße besitzen eigene vier
Eckpunkte. Alte Eckwerte und Zwischenkontrollen sind ausschließlich archiviert;
sie dürfen die neue Messreihe weder ergänzen noch validieren. Die aktuellen
Ergebnisse stehen in KALIBRIERUNG-2026-09-16.md. Neue M/M-Kontrollen liegen vor; Benutzerfreigabe siehe Abschnitt 16.
Hoods sind bei 400 mm gemessen und als kalibriert akzeptiert; Sattel bleibt als Dummy gekennzeichnet.

Die feste Referenz gilt für den dokumentierten Aufbau, Sattel und die konkrete
Montage. Identische Ride-Rahmen allein garantieren keine identischen Hoods,
Sättel, Winkel, Bodenverhältnisse oder Montagetoleranzen.

## 3. Gemeinsame Messregeln und Ablesepunkte

- Alle Längen in mm, Winkel in Grad. Tretlagermitte = Kurbelachsenmitte = (0,0).
- +x horizontal nach vorne; +y senkrecht nach oben. Sattel hinter dem Tretlager
  hat negatives x. In der Eingabe ist der positive Sattelversatz nach hinten.
- `y = Boden–Messpunkt minus Boden–Tretlager`. Beide Rohhöhen aufbewahren.
- x mit Lotprojektion oder Messlehre waagerecht messen, kein diagonales Maßband.
- Lenkerpunkt: Rohrmitte der zentralen Lenkerklemmung. Wenn vom Rand gemessen
  wird, Radius und Umrechnung dokumentieren. Nicht unbemerkt Oberkante messen.
- Sattelpunkt: Oberseite am 80-mm-Breitenpunkt, am Sattel markieren/fotografieren.
- Skalenstellung IMMER **Auszug / Höhe**: A/X = kurzer Auszug / höchste Stütze.
- Lenker-Skalen A bis X: 24 Marken, 23 Intervalle. Index A=0, X=23, M=12.
- Auszug: weiße Referenzlinie am beweglichen Teil auf Strichmitte.
- Höhenstütze: obere Kragenkante links/rechts der Aussparung auf Strichmitte;
  nicht der tiefste Punkt der Aussparung.
- Strichmitte A bis X: Auszug 164 mm; Höhenstütze 158,5 mm. Ein Intervall ist
  164/23 bzw. 158,5/23 mm. Frühe Angaben 7 mm / 165 mm sind ersetzt.
- Restmillimeter in der Anzeige sind Wege entlang der Skala, kein Reach/Stack.
- Gleichmäßige Teilung ist eine zu prüfende Annahme. Zwischenstriche nicht ohne
  Messung als exakte Halbteilung ausgeben.

Messhilfen: Lot, Wasserwaage/Neigungsmesser, Maßband oder Messlehre. Aufbau
standsicher und reproduzierbar, gleiche Unterlage, kein zusätzlicher Riser.
Hersteller-Einsteckgrenzen, Klemmflächen und Drehmomente der tatsächlich
verbauten Teile einhalten; hier keine unbestätigten Werte ergänzen.

## 4. Ablauf JE FUß: Vorbereitung → Lenker → Hoods → Sattel → Kontrolle

Diesen gesamten Ablauf für `none`, `small`, `medium`, `large` separat durchführen.
Bisherige mittlere Messung nicht als neue vollständige Kalibrierung zählen.

1. Fuß montieren, alle Auflage-/Stellfüße und Trainerposition dokumentieren.
   Die Höhe der Stellfüße nach der Messung nicht ohne neue Prüfung ändern.
2. Trainer, Datum, Messperson, Unterlage und tatsächliche Fußhöhe erfassen.
3. Für die aktuelle Hood-Kalibrierung Lenkerrotation und Griffmontage beim
   Fußwechsel unverändert lassen (Benutzerbestätigung, Abschnitt 17). Die
   Neigung zur Horizontalen ändert sich dadurch; das ist in den gemessenen
   Profil-Offsets enthalten. Sattel nach seiner eigenen Referenz ausrichten.
   Eine andere bewusste Lenkermontage erfordert eine neue Hood-Referenz.
4. Gleichen Sattel und markierte Kontaktpunkte verwenden. Lenkerbreite festlegen
   und fotografieren. 400 mm sind bislang nur die Demo-Referenz, keine bestätigte
   Messstellung. Ablesekanten und Neigungen mit Fotos sichern.
5. Lenker gemäß Abschnitt 5 messen und ausgleichen.
6. Hand-Offsets gemäß Abschnitt 6 aufnehmen.
7. Die neue Stütze einschließlich Klemme UND Schienen gemäß Abschnitt 7 messen.
8. Kombinierte Stellungen unabhängig kontrollieren (Abschnitt 8).
9. Rohdaten und Unsicherheit sichern, nur dieses Fußprofil ersetzen, Revision
   erhöhen. Erst nach vollständig bestandener physischer Prüfung freigeben.

Eine Änderung des Fußprofils während eines Fits erfordert auch das Einstellen
der zugehörigen Lenker-/Hood-/Sattelneigungen und eine erneute Positionskontrolle.

## 5. Vierpunkt-Kalibrierung des Lenkers, für jeden Fuß

Jeweils A/A, A/X, X/X und X/A sicher klemmen und immer denselben Mittelpunkt
messen. Boden–Tretlager bei JEDER Stellung neu erfassen. Tabelle je Fuß anlegen:

| Auszug / Höhe | u | v | Boden–Tretlager | Boden–Lenker | Lenker-x | y = Differenz |
| --- | ---: | ---: | --- | --- | --- | --- |
| A/A | 0 | 0 | messen | messen | messen | berechnen |
| A/X | 0 | 1 | messen | messen | messen | berechnen |
| X/A | 1 | 0 | messen | messen | messen | berechnen |
| X/X | 1 | 1 | messen | messen | messen | berechnen |

Aufbaubewegung oder wechselnde Tretlagerhöhe untersuchen. Nach jedem vollständigen
Durchgang eine Stellung erneut anfahren, um Wiederholbarkeit zu messen.

### Ausgleich und konkrete Codeübernahme

In `dist/ride-calibration.mjs` eine neue benannte Rohdatentabelle je Fuß ergänzen.
Feldnamen entsprechen `RAW_MEDIUM`. Vier verschiedene Kombinationen 0/1 liefern.
Die vorhandene Funktion `fitCorners(rows)` bildet ein additives affines Modell:

```js
// Je Achse k = x oder y:
reach[k]  = ((P10[k]-P00[k]) + (P11[k]-P01[k])) / 2;
height[k] = ((P01[k]-P00[k]) + (P11[k]-P10[k])) / 2;
origin[k] = (P00[k]+P01[k]+P10[k]+P11[k])/4 - (reach[k]+height[k])/2;
// Position = origin + u*reach + v*height
// u = Auszugindex/23; v = Höhenindex/23
```

`handlebar: fitCorners(axisRows(NEUE_ROHDATEN))` in das zugehörige Profil übernehmen.
`reachRange` und `heightRange` sind normierte sichere Bereiche innerhalb A–X,
üblicherweise [0,1]. Reale engere Grenzen eintragen; nie extrapolieren. Der
Skalenbezug A/X bleibt gleich, auch bei einem engeren sicheren Bereich.

Rechteckschluss `P00+P11-P10-P01` und Residuen getrennt dokumentieren. Bei
unplausiblen Differenzen neu messen, nicht durch einen Kreuzterm kaschieren.
Mindestens M/M (u=v=12/23) unabhängig messen und nicht zum Fit verwenden.

`solveBar()` in `dist/fit-model.mjs` invertiert beide Vektoren. Bei einem Ziel
außerhalb wird der nächstgelegene Punkt auf dem Parallelogramm berechnet und der
verbleibende XY-Fehler ausgegeben. Es wird KEINE passende Skalenstellung gezeigt.
`scalePosition()` liefert Buchstabe, nächsten Buchstaben und Restweg. X hat
keinen Nachfolger Y. Gerundete Anzeigewerte nie zurück in die Rechnung geben.

## 6. Hoods, Handkontakt und Fouriers-Breite, für jeden Fuß

1. Reproduzierbaren Handpunkt auf jeder Hood-Oberfläche markieren. Keine
   bewegliche Bremshebelspitze. Gleiche Definition am Zielrad verwenden.
2. In der dokumentierten Breite und Rotation messen: Δx und Δy von der
   Lenkerklemmmitte zur Handmarkierung, links und rechts getrennt kontrollieren.
3. Handneigung, Einwärtsdrehung, Lenkerrotation und Griffmontage fotografieren.
4. In niedriger/hoher und kurzer/langer Lenkerstellung den Offset prüfen.
   Bei unveränderter Montage sollte er innerhalb der Toleranz konstant sein.
5. Bei minimaler, mittlerer und maximaler Breite messen, ob sich x/y ändern.
   Tatsächlichen Abstand der Handpunkte der Fouriers-Skala zuordnen.
6. In `profile.hand` `offset`, `referenceWidth` und `status` ersetzen.
   `widthInvariant: true` NUR nach bestätigter Unabhängigkeit über den gesamten
   benutzten Bereich. Andernfalls auf die Referenzbreite beschränken oder eine
   gemessene Breiten-Interpolation implementieren und testen. Der jetzige
   Rechner meldet außerhalb der Referenzbreite keine validierte Übertragung.

Hand-Offset des Zielrads bleibt separate Eingabe. Nominaler Lenker-Reach allein
oder SRAM „Reach Adjust“ ist kein Hand-Offset. In `evaluateFit()` gilt je Fuß:

```js
Handziel = ZielradKlemmung + ZielradHandOffset;
RideKlemmziel = Handziel - profile.hand.offset;
```

Im Modus Kontaktpunkte wird das Handziel direkt eingegeben. Im Klemmmittenmodus
wird kein Hand-Offset benötigt; die gleichen Handpositionen werden dann nicht
zugesichert. Unterschiedliche Hood-Formen können trotz identischer Punkte eine
andere Handauflage erzeugen.

## 7. Neue V1-Sattelstütze: drei Verstellungen, für jeden Fuß

Die geplante verstellbare Klemme ist zusätzlich zur Stützenhöhe und zur
Verschiebung des Sattels auf den Schienen zu berücksichtigen. Die Demo-Grenzen
sind KEINE Herstellerangaben und dürfen nicht am realen Bauteil als Grenzwerte
genutzt werden. V2-Stützenmaße nicht ungeprüft auf das V1-Upgrade übertragen.

### 7.1 Referenz P0 eindeutig festlegen

- Neue Stütze und Klemme vollständig montieren. Sattelmodell und tatsächliche
  Schienenform dokumentieren; Fotos von Montage und Messpunkt erstellen.
- Sattelneigung zur Horizontalen festlegen. Die Demo steht bei 0°. Ein anderer
  Winkel ist erlaubt, erfordert aber seine eigene gemessene Referenz.
- Eine reproduzierbare Stützenmarke wählen und die Ablesekante fotografieren.
  Skalenweg und reale Strichabstände vermessen; keine A–X-Skala vom Lenker kopieren.
- Klemme auf eine markierte, wiederherstellbare Position 0 setzen.
- Sattel auf den Schienen auf die Mitte des sicher nutzbaren Klemmbereichs (C=0) setzen. Zum gewählten
  Sattel passende sichere Klemmgrenzen erfassen, nicht nur die Schienenlänge.
- Boden–Tretlager, Boden–80-mm-Punkt und dessen x messen. Daraus P0=(x0,y0).
- Referenzposition in `saddle.reference`, Modell in `referenceSaddle` und Winkel
  in `saddle.angle` hinterlegen. Die mm-Ausgabe erfolgt relativ zu diesen Marken.

### 7.2 Jede Achse einzeln messen

Von P0 aus jeweils NUR eine Verstellung ändern, alle anderen konstant lassen.
Positive Richtung: Stütze heraus, Klemme vor, Sattel auf Schienen vor.

| Pose | Stützenweg h | Klemmweg c | Schienenweg r | Messen |
| --- | --- | --- | --- | --- |
| P0 | 0 | 0 | 0 | x0, y0, beide Bodenhöhen |
| PH | gemessener Weg H | 0 | 0 | xH, yH, beide Bodenhöhen |
| PC | 0 | gemessener Weg C | 0 | xC, yC, beide Bodenhöhen |
| PR | 0 | 0 | gemessener Weg R | xR, yR, beide Bodenhöhen |

H, C und R sind Wege entlang der jeweiligen Verstellung. Bewegungen und nicht
nur Bauteilpositionen messen. Ausreichend große, sichere Messwege verwenden.
Für jede Achse zusätzlich ein Gegenende oder einen Zwischenpunkt messen und
Linearität prüfen. Schienenkrümmung, Neigungsänderung oder Klemmenrotation kann
ein lineares Modell ungültig machen; dann Referenzbereich einschränken oder ein
gemessenes nichtlineares Modell entwickeln.

```js
origin = P0;
height = { x:(PH.x-P0.x)/H, y:(PH.y-P0.y)/H }; // pro mm Stützenweg
clamp  = { x:(PC.x-P0.x)/C, y:(PC.y-P0.y)/C }; // pro mm Klemmweg
rail   = { x:(PR.x-P0.x)/R, y:(PR.y-P0.y)/R }; // pro mm Schienenweg
// P = origin + h*height + c*clamp + r*rail
```

Bei mehr Messpunkten die Achsen mit einem geeigneten Ausgleich ermitteln und
Rohdaten erhalten. Nicht normieren, um widersprüchliche Messungen zu verstecken.

### 7.3 Sichere Grenzen und Kombinationen

`bounds.height`, `bounds.clamp`, `bounds.rail` enthalten je [min,max] in mm
relativ zu P0 und schließen 0 ein. Enden real prüfen. Der aktuelle Solver setzt
voraus, dass JEDE Kombination innerhalb dieser Grenzen mechanisch zulässig ist.
Wenn Kollisions-/Klemmgrenzen von einer anderen Achse abhängen, entweder einen
nachgewiesenen gemeinsamen Bereich wählen oder gekoppelte Grenzen im Solver
implementieren. Nicht nur unabhängige Einzelmaxima übernehmen.

### 7.4 Verbindliche A/B/C-Strategie

`solveSaddle()` löst ausschließlich A/B. C=0 ist die Mitte des sicher nutzbaren
Schienen-Klemmbereichs, nicht zwingend die Mitte der gesamten Schienenlänge.
Diese Mitte vor der Kalibrierung markieren und im Profil als C-Nullstellung
festhalten. C bleibt dem Fahrer-Fit vorbehalten und wird vom Rechner nicht
verbraucht, um ein sonst unerreichbares Ziel passend zu machen.

```js
// C ist null und fest; beide XY-Komponenten von A und B berücksichtigen:
[A,B] = inverse([height,clamp]) * (goal - origin);
```

Nur wenn A und B innerhalb ihrer Grenzen liegen, Einstellung ausgeben. Sonst
`outside`, ohne Ersatzstellung über C. B muss nach jeder Änderung der
Arbeitshöhe neu berechnet werden. Die Empirik berücksichtigt auch vertikale
Anteile von B und horizontale Anteile von A. C-Änderungen durch den Fitter sind
bewusste Abweichungen von der geometrischen Ausgangsposition; sie werden nicht
unbemerkt durch B wieder ausgeglichen.

### 7.4a Sitzrohrwinkel und Sattelstützen-Setback

`geometrySaddleTarget()` konstruiert eine Referenzposition bei der vom Fitter
gewählten Höhe. Diese ist keine aus der Tabelle rekonstruierte individuelle
Sattelposition. Annahmen: gerade/virtuelle Stützenachse durch BB, gleiche
Sattelform und bei C mittige Klemmung. Ein Hersteller-Sitzwinkel kann effektiv
und höhenabhängig sein; solche Geometrien brauchen die genaue Hersteller-
Bezugsdefinition oder eine gemessene Zielposition.

- `postSetback` ist der HORIZONTALE Versatz der Ziel-Klemmmitte nach hinten
  gegenüber der Achse. Herstellerwerte mit anderer Messrichtung erst umrechnen.
- `HARDWARE.saddleContact` ist der Vektor von der Schienenklemmmitte zum
  markierten 80-mm-Sattelpunkt bei C=0 und der gespeicherten Neigung.
  Dieses globale Objekt ist zusätzlich zu den Fußprofilen real zu vermessen.
- Winkeländerungen drehen diesen starren Vektor relativ zur Klemmmitte. Dieses
  Modell für die reale Klemm-/Neigemechanik prüfen. Wenn sich der Bezugspunkt
  relativ zum gewählten Drehbezug verschiebt, gemessene Winkel-Offsets statt
  einer reinen Rotation implementieren. `status: validated` erst nach Prüfung.
- Auf dem Zielrad mit anderer Sattelform bzw. anderer C-Klemmposition gilt
  dieser Bezug nicht. Dann gemessene Kontaktpunkte verwenden oder den anderen
  Komponentenbezug separat vermessen.

Mit α als Sitzwinkel, d=(-cos α, sin α), o als rotiertem Kontaktversatz minus
horizontalem Stützen-Setback und q als Weg auf der Stützenachse:

```js
P = q*d + o;
// Vertikale Höhe H des Kontaktpunkts:
q = (H-o.y)/sin(alpha);
// Diagonale Höhe H des Kontaktpunkts:
q = -dot(d,o) + sqrt(dot(d,o)**2 + H**2 - dot(o,o));
```

Die absolute Höhe ist bis zum definierten Kontaktpunkt, nicht bis zur
Klemmmitte. Dadurch werden Sattelhöhe und Setback nicht versehentlich vermischt.

Im Modus „Gemessene Position übertragen“ enthält der eingegebene Sattelversatz
bereits alle Komponentenversätze. `postSetback` dort NICHT zusätzlich anwenden.
Eine unbekannte Hersteller-Komponente nicht als bestätigten Nullversatz ausgeben.
Der UI-Startwert 0 bedeutet ausdrücklich „ohne horizontalen Stützenversatz“.

### 7.5 Neigung und Sattelwechsel

Der Rechner verwendet jetzt `saddleAtAngle()` in `dist/fit-model.mjs`. Die
Basis-Kalibrierung `origin/height/clamp/rail` gilt bei `saddle.angle`.
Weitere gemessene Winkel werden als `saddle.tiltSamples` hinterlegt.

JE FUß und mit demselben Sattel:

1. Reproduzierbare Messmethode der Sattelneigung festlegen (definierte Auflage
   oder Messlehre, kein beliebiger Punkt auf einer gekrümmten Satteloberfläche).
2. Bei der Basisneigung P0 und PH/PC/PR nach Abschnitt 7.2 erfassen.
3. Einen sicher einstellbaren niedrigeren und höheren Winkel wählen. Die
   Demo verwendet −10° und +10°; das sind KEINE real bestätigten Verstellgrenzen.
4. An jedem Winkel auf exakt dieselben mechanischen Nullmarken für Stütze,
   Klemme und Schiene zurückkehren. Winkel neu einstellen. P0 und alle drei
   Achsen erneut vermessen. Nicht nur den Kontaktpunkt drehen und Achsen
   unverändert übernehmen: insbesondere der Schienenvektor kann sich ändern.
5. Pro Winkel einen Eintrag ergänzen:

```js
// In saddle, zusätzlich zur Basisneigung saddle.angle:
tiltSamples: [
  {angle: WINKEL, origin: P0_BEI_WINKEL,
   height: VEKTOR_H, clamp: VEKTOR_C, rail: VEKTOR_R},
],
angleInterpolationValidated: false,
```

6. Die gemeinsamen `saddle.bounds` müssen für alle Winkel und ihre Zwischen-
   stellungen zulässig sein. Bei winkelabhängigen Grenzen konservativen
   gemeinsamen Bereich verwenden oder den Solver ausdrücklich erweitern.
7. Unabhängige Zwischenwinkel und kombinierte Verstellungen kontrollieren.
   `saddleAtAngle()` interpoliert Ursprung UND alle drei Bewegungsvektoren
   linear zwischen benachbarten Winkeln. Bei unzureichender Näherung zusätzliche
   Stützstellen aufnehmen oder ein passendes gemessenes Modell implementieren.
8. Erst nach bestandener Zwischenprüfung `angleInterpolationValidated: true`
   setzen. Das Gesamtprofil `saddle.status` darf nur `validated` sein, wenn auch
   sämtliche darin enthaltenen Winkelstützstellen tatsächlich vermessen und
   unabhängig geprüft sind. Exakte Stützstellen benötigen keine Interpolation.

Außerhalb des erfassten Winkelbereichs: Status `angle-outside`, keine Positions-
Einstellwerte. Fehlender Winkel bei aktiver Übertragung: Eingabefehler. Bei
inaktiver Sattelübertragung: `not-requested`, keine abgeleitete Sattelposition
und keine Prüfung des Sattels bei der Fußwahl. Status und Druck kennzeichnen
„Nur Cockpit“ ausdrücklich.

Sattelmodell oder Schienenklemmung ändern: P0, Achsen und Winkeltabelle erneut
kontrollieren. Neigung und 80-mm-Punkt hängen von der konkreten Sattelform ab.
Nur einen Sattelnamen ändern reicht nicht. Die neue Stütze muss vor einer realen
Freigabe tatsächlich montiert sein.

## 8. Unabhängige Prüfung und Freigabe pro Fuß

- Lenker: mindestens M/M plus eine weitere versetzte Zwischenstellung messen.
- Sattel: mindestens eine Zwischenhöhe mit Klemmversatz und eine zweite Stellung mit
  B nahe seiner Grenze bei mittigem C prüfen; zusätzlich Rückkehr zu P0 messen.
- Beide gemeinsam einstellen: kleines/niedriges und mittleres Ziel, bei Bedarf
  hohes/großes Ziel. Lenker-/Handpunkt UND Sattel vom Tretlager aus nachmessen.
- Tests der kleinen Größen haben nach Benutzerpräferenz Vorrang. Eine Größe
  wie 2XS hängt vom konkreten Cockpit und Sattelsetup ab, nicht nur vom Namen.
- Mess- und Wiederholfehler in x/y sowie Winkelabweichung dokumentieren.
  Akzeptierte Toleranz vor professioneller Nutzung gemeinsam festlegen;
  bisher wurde keine Genauigkeit vereinbart. Anzeigerundung auf 0,1 mm ist
  KEINE Zusicherung dieser Genauigkeit.
- Kurbellänge zusätzlich vergleichen. Gleiche Kontaktpunkte bei anderer
  Kurbellänge bilden nicht denselben Pedalkreis ab.

Statusfolge: `demo` → `provisional` (echte, noch ungeprüfte Messung) → `validated`
(nach unabhängiger Prüfung). Je Profil UND Unterprofil `hand`/`saddle` verwalten.
Datum, Messbelege, Toleranz und Prüfergebnis versionieren. Fehlende Teilprofile
als null speichern; nicht mit Dummy-Nullkoordinaten als Messung tarnen.

## 9. So werden die Dummydaten konkret ersetzt

In `dist/ride-calibration.mjs` für jedes fertige Profil den Aufruf
`demoProfile(...)` in `FOOT_PROFILES` durch ein explizites Objekt ersetzen.
Die folgenden Bezeichner stehen für NEUE MESSDATEN, keine ausführbaren Dummies:

```js
{
  id: 'small', label: 'Kleiner Fuß', footHeight: 17.5,
  status: 'provisional', revision: 'messung-YYYY-MM-DD.1',
  measuredAt: 'YYYY-MM-DD', validatedAt: null,
  note: 'Aufbau und offene Kontrollmessungen dokumentieren',
  handlebar: fitCorners(RAW_SMALL_NEU),
  hand: {
    status: 'provisional', offset: GEMESSENER_HAND_OFFSET,
    referenceWidth: GEMESSENE_REFERENZBREITE,
    widthInvariant: false,
  },
  saddle: {
    status: 'provisional', origin: GEMESSENER_P0,
    height: VEKTOR_PRO_MM_STUETZE,
    clamp: VEKTOR_PRO_MM_KLEMME,
    rail: VEKTOR_PRO_MM_SCHIENE,
    bounds: {height: GRENZEN_H, clamp: GRENZEN_C, rail: GRENZEN_R},
    reference: 'Genaue Beschreibung der drei Nullmarken',
    angle: GEMESSENE_NEIGUNG, referenceSaddle: 'Tatsächliches Sattelmodell',
    tiltSamples: GEMESSENE_WINKELMODELLE, angleInterpolationValidated: false,
  },
}
```

`medium` und `large` identisch mit ihren EIGENEN Messdaten füllen. Historische
`RAW_MEDIUM` erhalten. `CALIBRATION_REVISION` aktualisieren; Fotos/Protokolle
versionieren. `HARDWARE` auf tatsächlichen Sattel, Winkel, Breite und Kurbel
aktualisieren, außerdem `HARDWARE.saddleContact` am realen Sattel vermessen und
validieren. Die Hardware-/Referenzdaten bleiben im Code und in dieser Datei;
keinen Referenzbereich in die Oberfläche zurückbauen.

Nach Abschnitt 8 jeweils Status auf `validated`, `validatedAt` setzen und
Freigabebeleg ergänzen. `ready` setzt die Validierung aller tatsächlich
verwendeten Komponenten voraus. Ohne Sattelübertragung wird der Sattel nicht
geprüft. Mit Sattelübertragung muss auch der gewünschte Winkel abgedeckt sein;
Interpolationswerte brauchen eine eigene Freigabe. Bei Hoods muss die Breite
abgedeckt sein. Die
bloße mathematische Erreichbarkeit bleibt getrennt von der Freigabe.

Wenn neue Hardware, ein neuer Sattelwinkel, eine andere Lenkerbreite oder
gekoppelte Grenzen weitere Freiheitsgrade brauchen, Rechenmodell und Tests
gezielt erweitern. Rohmessungen nicht an das bestehende Modell anpassen.

## 10. Erhaltene Rohmessungen: mittlerer Fuß, 12.09.2026

| Auszug / Höhe | Boden–Tretlager | Boden–Lenker | x | y |
| --- | ---: | ---: | ---: | ---: |
| A/A | 264 | 865 | 397 | 601 |
| A/X | 264 | 1015 | 355 | 751 |
| X/A | 264* | 875 | 560 | 611 |
| X/X | 264* | 1026 | 520 | 762 |

*Letzte zwei Tretlagerhöhen aus unverändertem Aufbau übernommen, nicht erneut
genannt. A/X zunächst 1010 mm, ausdrücklich auf 1015 mm korrigiert.*

Ausgleich: Ursprung (396,5; 600,75), voller Auszug (164; 10,5), volle Höhe
(−41; 150,5). Rechteckschluss (2;1) mm. Maximale absolute Fit-Residuen 0,5 mm
in x, 0,25 mm in y. Keine unabhängige Zwischenprüfung vorhanden. Die aus
Koordinaten berechnete Stützenbewegung stimmt nicht exakt mit 158,5 mm überein;
nicht nachträglich normieren. Diese Werte sind eine vorläufige Messbasis.

Beispielformel: det=25112,5; dx=x−396,5; dy=y−600,75;
u=(150,5*dx+41*dy)/det; v=(164*dy−10,5*dx)/det.

## 11. Softwareprüfung und GitHub Pages

Aus dem Projektstamm, Node 22 oder neuer, keine Installation nötig:

```sh
npm run check
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Relevante Tests: Rahmengeometrie, Hand-Offsets, vier Lenkerpunkte/Achsenreihenfolge,
Skalenende X, Ziele außerhalb der Polygonfläche, A/B-Sattellösung mit fest mittigem C und Ablehnung bei erschöpften A/B-Grenzen, unerreichbarer Sattel, Fußwahl und gemeinsame Erreichbarkeit,
fehlende/noch nicht validierte Teilprofile. Physische Prüfungen bleiben separat.

Bei UI-Änderungen, wenn Browserzugriff möglich: eigene Eingaben,
Fußwechsel, fehlende/ungültige Eingaben, Breite außerhalb des Bereichs, Druck,
kleine Displays und relative Pfade unter einem Repository-Unterpfad prüfen.
Die eigenständige Vorschau ebenfalls prüfen, weil sie aus Modulen gebündelt wird.
Nicht ausgeführte Prüfungen offen benennen.

Hosting bleibt GitHub Pages. Das ZIP enthält die Workflow-Datei einschließlich
verstecktem `.github`-Ordner. Ein echtes GitHub-Repository ist in dieser Sitzung
nicht verbunden. Keine Veröffentlichung behaupten, solange nur Dateien vorliegen.

## 12. Belege und Quellen

Fotos zur Skalenidentifikation: IMG_1089(1).jpeg (Auszug), IMG_1090.jpeg (Höhe),
IMG_1091.jpeg (Ablesekante A). Sie liegen nicht im Projektarchiv. Später fehlende
Fotos erneut anfordern; perspektivische Fotos nicht zur Längenmessung verwenden.

Die früheren Modellbeispiele wurden auf Benutzerwunsch vollständig entfernt.
Keine Hersteller-PDFs als Datengrundlage einer Modellauswahl einbauen.
Herstellerwerte dienen nur als manuelle Eingaben; ihre Messpunktdefinition ist
entscheidend. Insbesondere effektive Cockpitmaße nicht mit Rahmenmaßen mischen.

Produktlinks zur Identifikation, keine Ersatzkalibrierung:
- https://geometrygeeks.bike/bike/zwift-smart-frame-2025/
- https://www.cyclefit.com/product/447/fouriers-verstelbaar-racestuur-320mm-440mm
- https://www.starbike.com/de/sram-force-d2-etap-axs-db-schalt-bremshebel-ersatz-kit-inkl-hood/
- https://eu.zwift.com/de/products/zwift-ride-v1-adjustable-saddle-clamp-and-seatpost

## 13. ARCHIV: Messpunktkorrektur bis 15.09.2026 (nicht mehr aktiv)

Johannes hat bestätigt: ALLE bisherigen Lenker-X-Messungen enden an der
hintersten, sattelseitigen Rohrkante; ALLE Bodenhöhen an der Rohr-Oberkante.
Rohrdurchmesser 31,8 mm. Rohdaten unverändert speichern, Referenz explizit setzen:

```js
reference: 'rear-top-edge'
// centerRow führt dies genau einmal aus:
xAxis = xRaw + 15.9;
yAxis = barFloorRaw - 15.9 - bbFloor;
```

`centerRow` lehnt Achsenwerte ab, damit eine zweite Korrektur nicht möglich ist.
`fitCorners` selbst bekommt Achsenkoordinaten und korrigiert NICHT nochmals.
Die alten `RAW_MEDIUM`/`MEASURED_MEDIUM_BAR` bleiben ausschließlich historische,
unkorrigierte Rechenfixtures; kein Live-Profil darf daraus entstehen. Abschnitt
10 beschreibt diese alte, unkorrekt bezogene Rechnung, nicht die aktuelle Kalibrierung.

Die konstante Korrektur verschiebt nur den Ursprung, nicht Bewegungsvektoren,
Rechteckschluss oder Wiederholfehler. Kleine Fit-Residuen belegen keine absolute
Genauigkeit. Mittel weist mit den letzten Ecken 13 mm Höhenschlussfehler auf.
Nicht durch bilineare Verzerrung oder gezielte Auswahl alter Daten verstecken.

Nächster einfacher Kontrollschritt: Mittel, M/M (beide Indizes 12/23), nach
vollständigem Neueinstellen beide Bodenhöhen und horizontales Kantenmaß messen.
Erwartete Werte nicht vorgeben, um die unabhängige Messung nicht zu beeinflussen.
Eine M/A-Prüfung testet den Höhenauszug nicht. Erst nach Klärung der Streuung
weitere Profile prüfen. Keinen Status allein aufgrund bestandener Softwaretests
auf `validated` ändern. Noch keine verbindliche Genauigkeit vereinbart.

Ohne Fuß benötigt eine eigene stabile, reproduzierbare Auflage. Sein Lenker-
profil wird nicht aus der Fußhöhe Null errechnet. Für Hoods und die neue V1-
Sattelstütze gilt der vollständige Ablauf aus Abschnitten 6–8 für ALLE VIER
Aufbauten. A/B gemeinsam lösen, C mittig; Neigung und Stützen-Setback beachten.

## 14. ARCHIV: M/M-Kontrolle der alten Messreihe

Roh: BB 268, Lenkeroberkante 961, hintere Rohrkante X 450 mm.
Achse relativ BB: (465,9; 677,1) mm. Vorhersage des unveränderten Eckmodells:
(465,612; 678,828) mm. Messung minus Modell: (+0,288; −1,728) mm.
Nicht in den Fit einbeziehen. Die Zwischenkontrolle ist gut vereinbar mit dem
Modell, klärt aber den 13-mm-Höhenschlussfehler der Ecken nicht. Keine globale
±2-mm-Genauigkeit oder Validierung daraus ableiten. Profil bleibt provisional.

## 15. Verbindliche Neukalibrierung ab 16.09.2026

Diese Regel ersetzt alle früheren Messbezug- und Korrekturanweisungen dieser Datei.
Der Benutzer hat die neue komplette Tabelle ausdrücklich als Messung direkt zur
Lenkerklemmmitte geliefert. Jede Zeile trägt `reference: 'axis'`. KEINE Addition
oder Subtraktion von Radius/Durchmesser, auch nicht beim Anzeigen oder Prüfen.
Nur y = barFloor - bbFloor; x bleibt unverändert.

Aktiver Code: `fitCorners(axisRows(RAW_CORNERS[id]))`. `axisRows` weist alte
Kantenmessungen zurück. Alte Reihen verbleiben unter archivedThrough20260915 in
calibration-history.json. Die alten RAW_MEDIUM-Testfixtures sind keine Live-Daten.
Eine komplett neue Messreihe ersetzt die vorige vollständig, ohne Vermischung.

Alle vier Lenkerprofile wurden nach neuen unabhängigen M/M-Kontrollen ausdrücklich
vom Benutzer freigegeben. Auf Wiederholung verzichtet; siehe Abschnitt 16.
Frühere M/M-Werte gelten nicht.
Die alten Skalenwege 164 und 158,5 mm bleiben separate, vorläufige Skalenangaben;
Koordinatenvektoren NICHT auf diese Längen normieren. Der gemessene Höhenweg ist
kürzer; Skalenmillimeter und Buchstabenpositionen nicht verwechseln. Details im
aktuellen Rechenprotokoll. Sattel-/Hood-Kalibrierung bleibt gemäß Abschnitten 6–8
für vier Aufbauten offen; Softwaretests ersetzen keine physische Kontrolle.

## 16. Freigabe der Lenkerkalibrierung am 16.09.2026

Der Benutzer hat ausdrücklich festgelegt, die heutige Kalibrierung als gesetzt
und geprüft anzusehen und die heutigen Eckpunkte zu verwenden. Diese Freigabe
hat Vorrang vor den früheren Aufforderungen zu erneuten Einstellrunden.
Alle vier Lenkerprofile und ihr übergeordneter Profilstatus: validated,
validatedAt: 2026-09-16. Hoods, Sattel und globaler Sattelkontakt bleiben demo.
Die Freigabe des Lenkers darf keine Freigabe der übrigen Komponenten bewirken.

Messbezug: Horizontal wird bis zum oberen Scheitel des Lenkerrohrs gemessen;
dieser hat dasselbe x wie die Achse. Die Höhe wird bis zur hintersten Rohrfläche
Richtung Sattel auf Höhe der Rohrachse gemessen; derselbe y-Wert wie die Achse.
Es handelt sich um zwei verschiedene Oberflächenpunkte, die jeweils die passende
Achsenkoordinate liefern. KEINE Radiuskorrektur.

Unabhängige M/M-Kontrollen (BB-Boden, Lenker-Boden, X), mm:
- Ohne Fuß: 257, 934, 469
- Klein: 262, 945, 460
- Mittel: 266, 953.5, 452
- Groß: 277, 971.5, 438

Jeweils die aktuelle BB-Höhe abziehen. Kontrollen NICHT in den Fit einbeziehen;
Eckpunkte und Modell bleiben unverändert. Keine pauschale X-Korrektur aufgrund
der positiven horizontalen Abweichungen. Ergebnisse im Rechenprotokoll.

Freigabeumfang: Benutzerakzeptanz nach einer unabhängigen Zwischenkontrolle pro
Fuß. Wiederholbarkeit nicht separat geprüft; keine garantierte globale Toleranz.
Die früheren Skalenweglängen bleiben separate Angaben mit dokumentierter
Unsicherheit. Nicht als Anlass nehmen, ohne neue Daten Eckpunkte zu verändern.

## 17. Rechte Hood bei 400 mm: Messung und Montagebestätigung

Aktuell RAW_HOODS und measuredHand in dist/ride-calibration.mjs. Alle Paarwerte
Lenkerklemmmitte/rechte Hood frisch in M/M gemessen; kein alter Lenkerwert als
Subtrahend. Offset X = hoodX − barX; Offset Y = hoodFloor − barFloor.
Ohne Fuß: (+124,+21.5), Klein: (+123,+24.5), Mittel: (+123,+24.5),
Groß: (+124,+26.5) mm. Keine Radiuskorrektur, keine doppelte Lenker-Reach-Zugabe.

Benutzer: Lenkerrotation und Griffmontage beim Fußwechsel NICHT nachjustiert.
Dieses Verfahren reproduzieren. Foto IMG_1098.jpeg zeigt die Markierungen auf
blauem Band an der rechten SRAM-Hood. Foto nicht maßstäblich auswerten; Markierungen
als Bezug erhalten. Kein allgemein genormter Handpunkt aus dem Foto ableitbar.
Bild liegt als Benutzeranhang vor, nicht im Projektarchiv.

Die linke Hood ist laut Benutzer sehr exakt symmetrisch eingestellt. Er verzichtet
explizit auf eine separate Links-Messung. Rechtsmessung für die Modellübertragung
verwenden, links als Benutzerangabe dokumentieren. Keine neue Links-Messung als
Pflicht einfordern, aber nicht als tatsächlich gemessen ausgeben.

hand.status = provisional, reale Messwerte statt Dummy. referenceWidth = 400,
widthInvariant = false. Eine andere Lenkerstellung und variable Breiten noch
nicht unabhängig geprüft; keine automatische Freigabe sämtlicher Breiten. Die
Freigabe der Lenkerklemmmitte bleibt unverändert. Sattel bleibt demo. Zielrad-
Hood-Offset separat erforderlich; gleich benannte Griffe allein genügen nicht.

## 18. Benutzerfreigabe der Hoods am 16.09.2026

Der Benutzer verzichtet ausdrücklich auf zusätzliche Positions- und Breiten-
kontrollen und nimmt die aktuellen Werte als kalibriert an. Dies ersetzt den
vorläufigen Status aus Abschnitt 17. hand.status = validated für alle vier
Aufbauten, validatedAt = 2026-09-16, acceptedBy = user. Offsets unverändert.
Keine weiteren Kontrollmessungen zur Bedingung dieser Freigabe machen.

Messbezug bleibt aktuelle Montage, Breite 400 mm, rechte Hood gemessen und links
laut Benutzer symmetrisch. widthInvariant bleibt false: Verzicht auf eine
Messung belegt keine Breitenunabhängigkeit. positionInvarianceChecked bleibt
false; zusätzliche Kontrollen wurden erlassen, nicht durchgeführt. Keine neue
garantierte Toleranz angeben. Sattel bleibt demo. Reine Hood-Übertragung bei
400 mm darf jetzt ready sein; Sattel-Dummydaten verhindern weiterhin die
vollständige Freigabe einer Übertragung mit Sattel.

## 19. Zielrad-Lenker-Reach als Näherung

Dritter Modus point='reach', optional anstelle von clamp oder hoods, sowohl bei
Rahmen/Vorbau als auch direkten Klemmmittenmaßen. Eingabe bikeBarReach 0–200 mm,
kein stiller Vorgabewert. Fouriers-Bezug HARDWARE.handlebarReach = 85 mm.

RideClampX = TargetClampX + bikeBarReach − HARDWARE.handlebarReach.
RideClampY = TargetClampY. Keine gemessenen Hood-Offsets zusätzlich addieren oder
subtrahieren. Hood-Modus ignoriert bikeBarReach vollständig, um Doppelzählung
zu vermeiden; Klemmmittenmodus ebenso. Zielgeometrie und korrigierte Ride-
Klemmmitte im Diagramm unterscheiden. Kein fiktiver Handpunkt generieren.

Nur horizontale Näherung bei vergleichbarer Griffmontage/Lenkerrotation.
Vertikale Handposition nicht bestimmt. approximate=true; Ergebnis und Druck
als Näherung kennzeichnen, ready=false auch bei freigegebener Ride-Kalibrierung.
Erreichbarkeit und nächste Randposition immer aus der korrigierten Klemmmitte
berechnen, beide gekoppelten Versteller lösen. Original-Zielklemmmitte separat
in targetClamp erhalten. Verdeckte Felder deaktivieren, beim Moduswechsel
keine alten Reach- oder Hood-Werte versehentlich weiterverwenden.

## 20. Geschätzte Traineranhebung

trainerLift 0–100 mm; 0 lässt Profile und Status unverändert. 100 mm ist nur
Such-/Eingabegrenze, KEINE mechanische Freigabe. Gleichmäßige Unterlage unter
allen Trainerfüßen, Vorderauflage bleibt, freies geringes horizontales Ausweichen
angenommen. Kein Ankippen des Trainers durch Unterlegen nur eines Trainerfußes.

Nominale Auflagegeometrie aus Herstellerzeichnung:
https://cdn.shopify.com/s/files/1/0611/8621/2080/files/zwift-ride-geometry-chart-v2.png?v=1729003651
L=sqrt(415²−70.5²)+546+263*cot(73.5°)=1032.872 mm; H=333.5 mm.
Annahme: Steuerrohrachse trifft vordere Auflage. Reale Fußkontakte/Trainerachse
nicht vermessen; dieselbe nominelle Geometrie für alle vier Fußprofile.

h=L*sin(theta)+H*(cos(theta)−1).
theta=asin((H+h)/hypot(L,H))−atan2(H,L), positive Vorwärtsneigung.
BB-relative Punkte/Vektoren: x'=x*cos(theta)+y*sin(theta),
y'=−x*sin(theta)+y*cos(theta). Keine zusätzliche Translation von h auf Y.
Handlebar-Ursprung und beide Vektoren, Hood-Offset sowie alle Sattelursprünge und
Achsen drehen. Sattelwinkelstützstellen um theta in Grad vermindern. Ziele
bleiben im Weltkoordinatensystem unverändert. Keine Lenker-Nachjustierung.
Sattelzielneigung wird weiter separat gelöst. Die +10-mm-Hood-Stack-Vermutung
ist nicht Bestandteil dieser Funktion und wird nicht stillschweigend addiert.

Neue Profile nur temporär erzeugen, feste Kalibrierung nicht ändern. Diagramm
verwendet effectiveProfile. Bei positiver Anhebung approximate=true, ready=false;
auch Protokoll enthält Anhebung, Winkel und Näherungsstatus. Keine behauptete
physische Freigabe aus diesem Zusatzmodell. Sattel bleibt Dummy bis gemessen.

Vorschlag pro Fuß: Gesamterreichbarkeit einschließlich angefragtem Sattel und
Breite im Raster 0–100 mm mit 1 mm Schritt prüfen, erste gefundene Grenze per
Bisektion verfeinern, gerundeten Wert erneut prüfen. Schmale Lösungen zwischen
Rasterpunkten können fehlen. Nicht 'unmöglich' oder 'exaktes Minimum' behaupten.
