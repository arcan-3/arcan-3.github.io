---
title: "Staging meiosis without a human in the loop"
description: "Manual staging of meiosis from confocal live-cell imaging is slow, subjective and unrepeatable. aMP replaces it with segmentation, ensemble detection, constrained tracking and sequence validation."
date: 2026-04-09
tags: [microscopy, deep learning, tracking]
---

<div lang="en" markdown="1">

Meiosis in a living anther is a moving target in every sense. The tissue drifts out of the focal plane, the cells of interest are small and low-contrast, and the biological question is not "what is in this frame" but "how long did each phase last". For years the answer came from a person watching a time-lapse and writing down stage boundaries. That is slow, and two experts do not produce the same numbers.

My doctorate built aMP, an end-to-end pipeline that produces the timeline instead. It has four stages, and each one exists because the stage after it could not work otherwise.

## Hold the plane still

Confocal live-cell imaging of anthers drifts. Before anything can be detected, the anther has to be segmented and the sequence stabilised — in aMP, by segmenting the anther and applying an affine transformation to hold the focal plane across frames. On the held-out test set this reached Dice 88.9%, IoU 80.8%, F1 88.9%. Stabilisation is not cosmetic: a tracker that has to absorb both cell motion and global drift will spend its capacity on the drift.

## Find the meiocytes

Meiocyte localisation runs an ensemble of EfficientDet backbones with non-maximum suppression, evaluated under the COCO protocol: precision 0.77, recall 0.79, F1 0.78. Those numbers are modest by natural-image standards and entirely reasonable here — the objects are faint, crowded and partially occluded. What matters downstream is not per-frame perfection but that misses are not systematic, because tracking can bridge an occasional gap.

## Constrain the association

Cells do not teleport. The tracker exploits that with a restricted-space motion model, associating detections across frames on normalised cross-correlation and IoU. Restricting the search space cut computation time against unconstrained association, and it also removes a class of implausible matches that would otherwise need to be filtered later.

## Make the sequence a first-class object

The last stage is where the biology enters. Meiosis phases are represented as state vectors, and predicted sequences are validated against a knowledge graph — a phase cannot follow a phase it biologically cannot follow. From the validated sequences, Z-normalised staging pathways give a piece-wise meiotic timeline. Per-stage classification accuracy came out at 76–91%.

Sequence validation is the step I would defend most strongly. A per-frame classifier optimised on accuracy will happily emit transitions that no meiocyte performs. Checking the sequence against known structure turns a bag of frame labels into something a biologist can read.

## What it produced

Applied to tetraploid *Arabidopsis thaliana*, the timeline showed meiosis I comparable to diploid while meiosis II was markedly prolonged, and quantified temporal dynamics in *tcx5;6* mutants and ATM insertions. The pipeline's modules were then reused for other quantification tasks — DNA double-strand-break foci, BiFC analysis, pollen counting — which is the practical argument for building stages that stand alone. I continued the work as a postdoc on unsupervised staging of maize meiocytes.

The dissertation is [open access](https://ediss.sub.uni-hamburg.de/handle/ediss/11301).

</div>

<div lang="de" markdown="1">

Meiose in einer lebenden Anthere ist in jeder Hinsicht ein bewegliches Ziel. Das Gewebe driftet aus der Fokusebene, die interessierenden Zellen sind klein und kontrastarm, und die biologische Frage lautet nicht „was ist in diesem Frame", sondern „wie lange dauerte jede Phase". Jahrelang lieferte ein Mensch die Antwort, indem er eine Zeitreihe betrachtete und Stadiengrenzen notierte. Das ist langsam, und zwei Experten kommen nicht auf dieselben Zahlen.

In meiner Promotion entstand aMP, eine Ende-zu-Ende-Pipeline, die die Timeline selbst erzeugt. Sie hat vier Stufen, und jede existiert, weil die nächste ohne sie nicht funktionieren würde.

## Die Ebene ruhig halten

Konfokale Lebendzell-Aufnahmen von Antheren driften. Bevor überhaupt detektiert werden kann, muss die Anthere segmentiert und die Sequenz stabilisiert werden — in aMP durch Segmentierung der Anthere und eine affine Transformation, die die Fokusebene über die Frames hält. Auf dem Held-out-Testset: Dice 88,9 %, IoU 80,8 %, F1 88,9 %. Stabilisierung ist nicht kosmetisch: Ein Tracker, der Zellbewegung und globale Drift gleichzeitig auffangen muss, verbraucht seine Kapazität auf die Drift.

## Die Meiozyten finden

Die Lokalisierung nutzt ein Ensemble aus EfficientDet-Backbones mit Non-Maximum Suppression, evaluiert nach COCO-Protokoll: Precision 0,77, Recall 0,79, F1 0,78. Nach Maßstäben natürlicher Bilder sind das moderate Werte und hier völlig angemessen — die Objekte sind schwach, dicht gedrängt und teils verdeckt. Entscheidend ist nicht Perfektion pro Frame, sondern dass Fehldetektionen nicht systematisch auftreten, denn Tracking kann eine gelegentliche Lücke überbrücken.

## Die Zuordnung einschränken

Zellen teleportieren nicht. Der Tracker nutzt das über ein Bewegungsmodell mit eingeschränktem Suchraum und ordnet Detektionen über Frames per normalisierter Kreuzkorrelation und IoU zu. Die Einschränkung senkte die Rechenzeit gegenüber unbeschränkter Assoziation und entfernt zugleich eine Klasse unplausibler Zuordnungen, die sonst später gefiltert werden müssten.

## Die Sequenz als eigenes Objekt behandeln

In der letzten Stufe kommt die Biologie ins Spiel. Meiosephasen werden als State Vectors dargestellt, und vorhergesagte Sequenzen werden gegen einen Knowledge Graph validiert — eine Phase darf keiner Phase folgen, der sie biologisch nicht folgen kann. Aus den validierten Sequenzen ergeben Z-normalisierte Staging-Pfade eine stückweise Meiose-Timeline. Die Klassifikationsgenauigkeit pro Stadium lag bei 76–91 %.

Die Sequenzvalidierung würde ich am stärksten verteidigen. Ein auf Accuracy optimierter Frame-Klassifikator gibt bereitwillig Übergänge aus, die kein Meiozyt vollzieht. Der Abgleich der Sequenz mit bekannter Struktur macht aus einer Menge Frame-Labels etwas, das ein Biologe lesen kann.

## Was dabei herauskam

Angewandt auf tetraploide *Arabidopsis thaliana* zeigte die Timeline eine mit diploid vergleichbare Meiose I, während Meiose II deutlich verlängert war; zusätzlich wurde die zeitliche Dynamik in *tcx5;6*-Mutanten und ATM-Insertionen quantifiziert. Die Module der Pipeline wurden anschließend für weitere Quantifizierungen genutzt — DNA-Doppelstrangbruch-Foci, BiFC-Analyse, Pollenzählung. Das ist das praktische Argument dafür, Stufen eigenständig zu bauen. Als Postdoc habe ich die Arbeit zum unsupervised Staging von Mais-Meiozyten fortgesetzt.

Die Dissertation ist [Open Access](https://ediss.sub.uni-hamburg.de/handle/ediss/11301) verfügbar.

</div>
