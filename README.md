# Ride Fit – Stand 19.09.2026

Vier Aufbauoptionen, neue separate Lenkerkalibrierung direkt zur Achsenmitte.
Keine Radiuskorrektur. Eckwerte nach unabhängigen M/M-Kontrollen vom Benutzer als geprüft akzeptiert.
Keine Wiederholungsprüfung; keine garantierte globale Toleranz.
Hoods rechts bei 400 mm gemessen und vom Benutzer als kalibriert akzeptiert;
links laut Benutzer symmetrisch. Weitere Kontrollen auf Benutzerwunsch erlassen.
Sattelmechanik für alle vier Füße gemessen. Satteloberfläche mit 52 mm Aufbau
und 21,5 mm horizontalem Schienenweg als Ausgangseinstellung angenähert.
Keine Modell-Datenbank.

Rechenprotokoll: KALIBRIERUNG-2026-09-16.md. Anleitung: AGENTS.md.
Rohdaten und archivierte frühere Messreihen: calibration-history.json.

Node 22+: `npm run check`, `npm test`, `npm run build`.
Website in dist/, eigenständige Vorschau ride-fit-preview.html.
GitHub-Pages-Workflow enthalten; noch nicht veröffentlicht.

Drei Cockpitmodi: Klemmmitte, Lenker-Reach-Näherung, vollständige Hood-Offsets.
Der Reach-Modus verschiebt nur X um Ziel-Reach minus 85 mm. Y bleibt gleich;
vergleichbare Griffmontage und Rotation vorausgesetzt. Ausgabe als Näherung.

Traineranhebung: manuelle Eingabe 0–100 mm und Vorschlag je Fuß. Geschätzte
Auflagegeometrie; alle Ride-Koordinaten werden gedreht, Ergebnis als Näherung.
Suchgrenze ist keine mechanische Freigabe. Kalibrierwerte bleiben unverändert.

Sattel: schräge Höhe und optionaler Setback am gleichen Oberflächenpunkt.
Ausgabe A–X, diskrete Klemme 0/+20/+40/+60 und Schienenstellung. Auswahl bevorzugt
Reserve in beide Richtungen. Ohne Setback Schienen mittig, bevorzugt Klemme 0.
Neigung manuell; keine erfundene Winkelkorrektur. Sattel-Messprotokoll:
KALIBRIERUNG-SATTEL-2026-09-19.md. AGENTS.md beschreibt die aktuelle Rekalibrierung.
