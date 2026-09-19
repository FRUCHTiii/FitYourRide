# Lenkerkalibrierung 16.09.2026

Neue eigenständige Messreihe. Alle Koordinaten direkt zur Klemmmitte, ohne Radiuskorrektur. Ursprung Tretlagermitte; x nach vorne, y nach oben. Stellung Auszug/Höhe.

## Rohdaten und Koordinaten

| Fuß | Stellung | Boden BB | Boden Lenker | X | Y über BB |
|---|---|---:|---:|---:|---:|
| Ohne Fuß | A/A | 257 | 852.5 | 402 | 595.5 |
| Ohne Fuß | A/X | 257 | 999.5 | 362 | 742.5 |
| Ohne Fuß | X/A | 257 | 863 | 565 | 606 |
| Ohne Fuß | X/X | 257 | 1008.5 | 525 | 751.5 |
| Klein | A/A | 263 | 863 | 394 | 600 |
| Klein | A/X | 263 | 1009 | 353 | 746 |
| Klein | X/A | 263 | 875 | 557 | 612 |
| Klein | X/X | 263 | 1020.5 | 516 | 757.5 |
| Mittel | A/A | 268 | 871 | 388 | 603 |
| Mittel | A/X | 268 | 1017 | 345.5 | 749 |
| Mittel | X/A | 268 | 885 | 550 | 617 |
| Mittel | X/X | 268 | 1030.5 | 508.5 | 762.5 |
| Groß | A/A | 275 | 887 | 374.5 | 612 |
| Groß | A/X | 275 | 1033 | 328 | 758 |
| Groß | X/A | 275 | 904 | 536 | 629 |
| Groß | X/X | 275 | 1049.5 | 491 | 774.5 |

## Modell

`P(u,v) = O + u·R + v·H`, u/v = Buchstabenindex / 23 (A=0, M=12, X=23). Vier Ecken gleichgewichtet im additiven affinen Ausgleich. R und H gelten jeweils für den gesamten Weg A–X.

| Fuß | O (x,y) mm | R (x,y) mm | H (x,y) mm | Schlussfehler (x,y) mm | Max. Eckresiduum je Achse (x,y) mm |
|---|---|---|---|---|---|
| Ohne Fuß | [402.0, 595.875] | [163.0, 9.75] | [-40.0, 146.25] | [0, -1.5] | [0.0, 0.375] |
| Klein | [394.0, 600.125] | [163.0, 11.75] | [-41.0, 145.75] | [0, -0.5] | [0.0, 0.125] |
| Mittel | [387.75, 603.125] | [162.5, 13.75] | [-42.0, 145.75] | [1.0, -0.5] | [0.25, 0.125] |
| Groß | [374.125, 612.125] | [162.25, 16.75] | [-45.75, 145.75] | [1.5, -0.5] | [0.375, 0.125] |

Schlussfehler = P00 + P11 − P10 − P01. Kleine Residuen belegen interne Konsistenz, keine absolute Genauigkeit. Unverzerrtes additives Modell statt eines Kreuzterms, der alle Ecken künstlich exakt trifft.

## Verstellwege und tiefe Positionen

| Fuß | Länge Auszugsweg mm | Länge Höhenweg mm | Winkel der Verstellachsen | Mindest-Y bei X=480 mm |
|---|---:|---:|---:|---:|
| Ohne Fuß | 163.29 | 151.62 | 101.87° | 600.54 |
| Klein | 163.42 | 151.41 | 101.59° | 606.32 |
| Mittel | 163.08 | 151.68 | 101.24° | 610.93 |
| Groß | 163.11 | 152.76 | 101.53° | 623.06 |

Die Höhenbewegung A–X beträgt aus den Koordinaten rund 151–153 mm statt der früheren axialen Skalenmessung 158,5 mm. Nicht stillschweigend gleichsetzen oder normieren. Die Buchstabeninterpolation nutzt die gemessenen Ecken und 23 Intervalle. Die Ausgabe zusätzlicher Skalenmillimeter verwendet weiterhin die früher angegebenen 164/158,5 mm und bleibt deshalb vorläufig.

Die Achsenwinkel unterscheiden sich zwischen den Fußprofilen; bei starrer Mechanik wäre dieser Winkel durch reines Kippen unverändert. Messunsicherheit oder Aufbauunterschiede bleiben daher möglich, auch bei gutem Rechteckschluss.

Die Mindesthöhen sind Modellwerte der Klemmmitte, keine Hoods- oder Rahmen-Stack-Werte. Alle vier Werte bei X=480 liegen innerhalb des jeweiligen Auszugsbereichs.

## Unabhängige M/M-Kontrolle und Benutzerfreigabe

Am 16.09.2026 ausdrücklich vom Benutzer als gesetzt und geprüft akzeptiert.
Die 16 Eckpunkte und das daraus berechnete Modell bleiben unverändert.

| Fuß | BB-Boden | Lenker-Boden | X gemessen | Y relativ BB | ΔX Messung − Modell | ΔY Messung − Modell |
|---|---:|---:|---:|---:|---:|---:|
| Ohne Fuß | 257 | 934 | 469 | 677 | +2,826 | −0,266 |
| Klein | 262 | 945 | 460 | 683 | +2,348 | +0,701 |
| Mittel | 266 | 953,5 | 452 | 687,5 | +1,380 | +1,158 |
| Groß | 277 | 971,5 | 438 | 694,5 | +3,092 | −2,408 |

Die M/M-Kontrollen sind unabhängig und werden nicht in den Eckpunkte-Fit
aufgenommen. Aktuelle BB-Höhen sind berücksichtigt. Alle horizontalen Residuen
positiv; keine nachträgliche gemeinsame Verschiebung oder andere Anpassung.

Keine zusätzliche Wiederholungsprüfung auf Wunsch des Benutzers. Validiert
bedeutet hier geprüft und vom Benutzer akzeptiert, keine garantierte Toleranz
über den gesamten Bereich. Größte beobachtete absolute Koordinatenabweichung
am Kontrollpunkt: 3,092 mm. Hoods inzwischen gemessen (siehe unten), Sattel bleibt Dummy.

## Eindeutige Definition der Messpunkte

Horizontal bis zum oberen Scheitel des Rohres, Höhe bis zum hintersten Punkt
Richtung Sattel auf halber Rohrhöhe. Diese Oberflächenpunkte repräsentieren
jeweils x bzw. y der Achse. Keine Radiuskorrektur. Messrichtung horizontal bzw.
vertikal; nicht die diagonale Strecke vom BB zum oberen Rohrpunkt verwenden.

## Ergänzung: Hood-Messung bei 400 mm Lenkerbreite

| Fuß | Klemmmitte Boden / X | Rechte Hood Boden / X | Offset X / Y |
|---|---|---|---|
| Ohne Fuß | 933,5 / 469 | 955 / 593 | 124 / 21,5 |
| Klein | 944,5 / 460 | 969 / 583 | 123 / 24,5 |
| Mittel | 953,5 / 452 | 978 / 575 | 123 / 24,5 |
| Groß | 971,5 / 437 | 998 / 561 | 124 / 26,5 |

Alles frisch gemessen in M/M. Lenker beim Fußwechsel nicht nachjustiert.
Markierungen: Benutzerfoto IMG_1098.jpeg. Rechte Seite gemessen; links laut
Benutzer symmetrisch, ohne separate Messung. Einzelmessungen, noch keine
Positions-/Breitenkontrolle. Deshalb reale Hood-Werte mit Status provisional
und Geltungsbreite 400 mm. Kein erneutes Vermessen links verlangt.

## Freigabe Hood-Kalibrierung

Die gemessenen Hood-Offsets aller vier Aufbauten wurden am 16.09.2026 vom
Benutzer ausdrücklich als kalibriert akzeptiert. Status nun validated; die
zuvor dokumentierte vorläufige Einstufung ist ersetzt. Zusätzliche Kontrollen
entfallen auf Benutzerwunsch. Offsets bleiben unverändert, Bezugsbreite 400 mm.
Keine durchgeführte Wiederholungs-/Breitenprüfung behaupten; keine garantierte
Toleranz. Lenker und Hoods abgeschlossen für diesen Bezug, Sattel noch Dummy.
