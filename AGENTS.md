# Ride Fit – Arbeitsanweisungen und Kalibrierung

Stand 19.09.2026. Diese Datei ist maßgeblich. `docs/AGENTS-bis-2026-09-16.md`
bleibt ausschließlich als historischer Beleg erhalten; dessen Sattel-Dummyregeln
und Pflichtmessungen sind durch den ausdrücklich vereinfachten Benutzerablauf ersetzt.

## Produktvorgaben

- Statische deutschsprachige GitHub-Pages-Anwendung, ausschließlich für Johannes
  als geschulten Bikefitter. Keine Modellwahl/Datenbank, keine Kalibrierungsanleitung
  oder Referenzansicht auf der Website. Dokumentation nicht nach dist kopieren.
- Keine externen Laufzeitabhängigkeiten, keine Kundendatenübertragung.
- Vier separat gemessene Füße: ohne, klein 17,5 mm, mittel 28 mm, groß 51 mm.
  Hardware: Ride V1, KICKR CORE 2, Fouriers 320–440 mm, SRAM Force D2 Hoods,
  neue verstellbare Zwift V1-Sattelstütze. Sattelmodell nicht angegeben.
- Sattel standardmäßig aus schräger Höhe ab Tretlagermitte UND optionalem
  horizontalem Setback zum selben Oberflächenpunkt bestimmen. Positive
  Setback-Eingabe liegt hinter BB. Keine doppelte Addition eines Stützenversatzes
  im gemessenen Modus. Senkrechte Höhenmessung bleibt optional.
- Ergebnis: A = Stützenskala A–X; B = diskrete Montageposition 0/+20/+40/+60;
  C = tatsächlicher vermessener Schienenbereich. C darf jetzt zur Zielübertragung
  verwendet werden. Unter möglichen Lösungen möglichst viel Reserve in beide
  Schienenrichtungen erhalten. Keine erfundene stufenlose B-Verstellung.
- Sattel ist eine grobe Ausgangseinstellung, keine winkelkalibrierte exakte
  Position. Fitter stellt Neigung und Setback ein und kontrolliert danach die
  schräge Höhe. Weitere Winkel-/Schienen-Höhenmessungen sind auf Benutzerwunsch
  NICHT Voraussetzung. Neigung optional, manuelle Einstellanweisung ohne
  erfundene numerische Positionskorrektur.
- Bei leerem Setback Schienen mittig und möglichst Klemmposition 0; Radialhöhe
  entlang des gemessenen Stützenwegs lösen. Der daraus entstehende Setback ist
  nur Ride-Ausgangsstellung und kein Zielrad-Messwert.

## Dateien und Prüfung

- `dist/ride-calibration.mjs`: einzige feste Datenquelle, RAW_CORNERS,
  RAW_HOODS, RAW_SADDLE, SADDLE_CONTACT und FOOT_PROFILES.
- `dist/fit-model.mjs`: Zielberechnung, diskreter Sattelsolver, Lenkerlösung,
  Traineranhebung. Alte allgemeine affine Hilfsfunktionen nur für historische
  Rechenmodelle; aktuelle Sattelprofile haben kind='discrete-saddle'.
- `dist/app.mjs`, `dist/index.html`, `dist/style.css`: UI und Druck.
- `scripts/build.mjs`: generierte Offline-Datei, nie direkt darin pflegen.
- `calibration-history.json`: Messhistorie mit ersetzten Werten.
- `KALIBRIERUNG-SATTEL-2026-09-19.md`: aktueller Sattel-Messbeleg.
- `npm run check`, `npm test`, `npm run build`; Node 22+, keine Installation.
  Grenzfälle, diskrete Klemmen, Schienenreserve, radiale/vertikale Höhe,
  Höhenmodus ohne Setback, unverändertes Cockpit und Trainerrotation testen.
- GitHub-Pages-Workflow veröffentlicht dist nach Push auf main. Keine erfolgte
  Veröffentlichung behaupten, solange nur das lokale Projekt übergeben wurde.

## Messkonventionen

Alle Längen mm; internes +x nach vorne, +y nach oben, BB=(0,0).
`y = Boden–Messpunkt minus Boden–BB`. Pro Messreihe deren eigene BB-Höhe
verwenden: die neu gemessenen Sattel-BB-Höhen ändern NICHT die alte Lenkerreihe.
Sattelstützen-Messpunkt ist die Mitte der großen seitlichen Schraube.
Sattel-Oberflächenpunkt muss zwischen Höhen- und Setback-Messung derselbe sein;
keine unbestätigte Gleichsetzung mit Sattelspitze. 80-mm-Punkt wurde vorgeschlagen,
seine genaue Realisierung und der Sattelname sind nicht zusätzlich bestätigt.
Keine Radiuskorrektur der akzeptierten direkten Lenkerachsenmessungen.
Hersteller-Einsteck- und Schienen-Klemmgrenzen einhalten; keine neuen erfinden.

## Lenker und Hoods – unverändert

Neue Lenkerkampagne vom 16.09.2026 für jeden Fuß: A/A, A/X, X/A, X/X.
Reihenfolge Auszug/Höhe; A=0, M=12, X=23. A–X hat 23 Intervalle.
Auszugweg 164 mm, Stützen-Skalenweg 158,5 mm. Gemessene XY-Wege nicht normieren.
Vierpunkt-Ausgleich je Achse k:

```
R[k] = ((P10[k]-P00[k])+(P11[k]-P01[k]))/2
H[k] = ((P01[k]-P00[k])+(P11[k]-P10[k]))/2
O[k] = (P00[k]+P10[k]+P01[k]+P11[k])/4 - (R[k]+H[k])/2
P(u,v) = O + u*R + v*H
```

M/M-Kontrollen unabhängig, nicht in den Fit nehmen. Grenzpolygon statt
unabhängiger X/Y-Extrema verwenden; unerreichbare Ziele nicht schönrechnen.
Lenker accepted/validated, keine zugesicherte globale Genauigkeit.
Hood-Offsets je Fuß: ohne (124;21,5), klein (123;24,5), mittel (123;24,5),
groß (124;26,5). Rechte Hood bei 400 mm gemessen, links laut Benutzer symmetrisch.
Weitere Kontrollen erlassen; widthInvariant=false, positionInvarianceChecked=false.
Die später erwähnte etwa 10 mm tiefere Hood-Höhenmarkierung wurde nicht eindeutig
als vertikaler Abstand bestätigt: KEINE stillschweigende +10-mm-Korrektur.
Zielrad-Hoods benötigen separate echte Offsets. Nominaler Lenker-Reach wird nur
im Näherungsmodus berücksichtigt: X += Zielreach−85 mm, Y unverändert, keine
zusätzliche Hood-Korrektur. Näherungsstatus in Ergebnis und Druck erhalten.

## Neue Sattelmechanik kalibrieren – sechs Messungen je Fuß

1. Keine zusätzliche Traineranhebung. Fuß montieren, Boden–BB neu messen.
2. Schraubenmittelpunkt bei A/0, M/0, X/0 messen: Bodenhöhe und horizontaler
   Abstand hinter BB. Strichmitte an gleicher Ablesekante. A/M/X innerhalb
   des erlaubten Verstellbereichs, gleiche Markierungen an allen Füßen.
3. Bei M zusätzlich +20/+40/+60 messen. Für +40/+60 Kopf gemäß Hersteller
   umdrehen. Bei jeder Stellung denselben Schraubenmittelpunkt verwenden.
4. Daten in RAW_SADDLE pro Fuß ersetzen; Originalwerte und Datum archivieren.
   Achse ausschließlich aus A und X: O=(-SetbackA, floorA−bbFloor),
   H=(SetbackA−SetbackX, floorX−floorA). Normierte Höhe u in [0,1].
5. M als unabhängige Kontrolle gegen O+(12/23)*H prüfen. Keine neue perfekte
   Genauigkeit behaupten. Aktuelle größte Achsabweichung ca. 2,4 mm.
6. Jede B-Position als gemessenen Vektor relativ zu M/0 speichern:
   dx=SetbackM0−SetbackMB, dy=floorMB−floorM0. NICHT pauschal 20/40/60 addieren.
   Dieselben Vektoren über den Höhenweg anzuwenden setzt einen starren Aufbau voraus.
7. Groß: korrigierte Achsenmessungen M=922, X=1040. Die ursprüngliche gepaarte
   M/0-Höhe 921,5 bleibt als Basis der Klemmreihe erhalten. Höhenanstieg bei +60
   nur 2 mm gegenüber 5–6,5 mm anderer Füße: verbleibende Messunsicherheit,
   nicht durch erfundene Korrektur beseitigen.

## Vereinfachter Sattel- und Schienenbezug

Benutzer wünscht keine vollständige Winkelkalibrierung. SADDLE_CONTACT:
- Vertikaler Aufbau: 970−918=52 mm.
- Mittlerer Fuß, M/0: Schrauben-Setback 223,5 mm; Sattelreferenzpunkt
  ganz vorne 210 mm, ganz hinten 231,5 mm. Frühere 23,15 war bestätigter Tippfehler.
- Schienenmitte hat Setback 220,75; Kontakt-x relativ zur Schraube +2,75 mm.
- Horizontaler Schienenweg 21,5 mm: r in [-10,75;+10,75], positiv Sattel vor.
  Das ist kein gemessener Weg entlang einer geneigten/gebogenen Schiene!
- Kontakt-y konstant 52; keine gemessene Höhenfunktion der Schienen oder Winkel.
- Gemeinsamen Kontaktvektor/Schienenweg für alle Füße und Kopfmontagen zu verwenden
  ist eine Näherung, insbesondere bei gedrehtem Kopf. Keine physische Prüfung
  aller Kombinationen behaupten. Klemmbereich gilt für den vermessenen Sattel.

Bei Sattelwechsel: die zwei Aufbauhöhen und die beiden Schienen-Endpositionen
neu messen, gemeinsamen Oberflächenpunkt sicherstellen. Stützenmechanik bleibt,
wenn deren Hardware und Montage gleich sind. Neue Eingaben ersetzen keine
physische Kontrolle der vom Benutzer gewünschten groben Ausgangsstellung.

## Rechenmodell und Ausgabe

```
P(u,B,r) = SchraubenO + u*H + KlemmOffset[B] + (2.75,52) + r*(1,0)
Ziel bei Radialhöhe h und Setback s: (-s, sqrt(h*h-s*s))
Ziel bei vertikaler Höhe h: (-s,h)
```

Je B in [0,20,40,60] das 2x2-System nach u,r lösen. Nur innerhalb A–X und
Schienenfenster akzeptieren; Grenzen nicht unbemerkt clippen/extrapolieren.
Maximale minimale Schienenreserve auswählen, bei Gleichstand kleinere B-Position.
Ohne Setback r=0: Schnitt mit Kreis Radius h bzw. Linie y=h lösen.
A-Ausgabe als Buchstabe plus Prozent bis zum nächsten Buchstaben: Sattelskalenweg
in mm wurde NICHT gemessen; keinen Lenker-Skalenweg hierfür verwenden.
C-Ausgabe horizontal ab nutzbarer Schienenmitte und Prozent von hinten nach vorne.
Aufbauhöhe nicht einfach von der diagonalen Eingabehöhe abziehen.

Sattelstatus 'measured-approximation'; Gesamtfit mit Sattel approximate=true,
ready=false. Cockpit-only behält seine vorhandene Freigabe. Oberflächenwinkel
wird auf Wunsch als manuelle Anweisung ausgegeben, nicht als kalibrierte Lösung.
Geometriesimulation aus Sitzwinkel/Stützenversatz bleibt ausdrücklich eine
Näherung: der Bezug zur Zielrad-Klemmmitte wurde nicht gemessen. Bei gemessenem
Setback keine Sitzwinkel-/Stützenversatzkorrektur zusätzlich anwenden.

## Traineranhebung

0–100 mm bleibt rechnerische Option, keine mechanische Freigabe. Nominale
Geometrie aus Zwift-Zeichnung (wie bisher):
https://cdn.shopify.com/s/files/1/0611/8621/2080/files/zwift-ride-geometry-chart-v2.png?v=1729003651
L=sqrt(415²−70,5²)+546+263*cot(73,5°)=1032,872 mm, H=333,5 mm.
Gleiche geschätzte Auflagegeometrie für alle Füße; reale Kontakte nicht vermessen.
Anhebung h=L*sin(theta)+H*(cos(theta)−1).
Rotation BB-relativ x'=x*cos(theta)+y*sin(theta), y'=−x*sin(theta)+y*cos(theta).
Lenker, Hoods UND Sattelursprung, Höhenvektor, vier Montagevektoren, Kontaktvektor
und Schienenvektor drehen. Keine Translation des BB-relativen Y um die Anhebung.
Originalprofile nicht verändern. Auch diese Ergebnisse bleiben Näherungen.
Rastervorschlag 0–100 mm/1 mm, erste gefundene Grenze verfeinern und gerundete
Ausgabe erneut prüfen. Keine Aussage globaler Unmöglichkeit aus fehlendem Treffer.
