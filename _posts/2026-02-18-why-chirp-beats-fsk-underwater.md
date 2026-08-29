---
title: "Why chirp beats FSK underwater"
description: "Multipath propagation smears an FSK preamble until its boundary is unreadable. A linear chirp turns the same problem into a single correlation peak."
date: 2026-02-18
tags: [acoustics, underwater, modulation]
---

<div lang="en" markdown="1">

Underwater acoustic links fail for an unglamorous reason: the packet arrives, but the receiver cannot say exactly when it started. Everything downstream — symbol timing, demodulation, the whole packet — depends on locating the preamble boundary. In a shallow channel, that boundary is exactly what the medium destroys.

## The problem is the channel, not the modem

Sound in shallow water travels by several paths at once. The direct path arrives first; surface and bottom reflections arrive milliseconds later, attenuated but not negligible, and each one is a delayed copy of the signal that was already there. If the preamble is a short frequency-shift-keyed tone burst, the receiver sees the same tone repeated at unknown offsets. Cross-correlating that against the expected preamble does not produce a sharp peak; it produces a broad, triangular region of high correlation. Somewhere inside it is the true arrival, and picking a point inside that region is guesswork with a variance measured in seconds.

Micro autonomous underwater vehicles make this worse. They are small, cheap, battery-constrained, and they operate in test tanks, harbour channels and lakes, all of which are acoustically hostile in different ways. A synchronisation error of a second is not a degradation. It is a lost packet.

## What a chirp changes

A linear frequency chirp sweeps continuously across a band over a fixed duration. Two properties matter here. First, its autocorrelation is a narrow peak rather than a plateau: because instantaneous frequency changes monotonically with time, every delayed copy correlates strongly at exactly one lag and weakly everywhere else. Multipath still adds its copies — but they land as separate, smaller peaks instead of merging into one ambiguous blob. Second, a chirp degrades gracefully under Doppler shift. A moving vehicle shifts the whole sweep; the peak moves slightly and stays a peak.

In my master's project at the smartPORT research group I replaced FSK preambles with chirps for packet-based synchronisation between µAUVs, built the signal generation and evaluation chain, and characterised the acoustic modem and the instrumentation to find a parameter set that a real modem could actually emit.

## Validation in water, not in simulation

Simulated multipath is well-behaved in a way real water never is, so the evaluation ran across four environments of increasing realism: a small container, a test tank, the Channel Harburg, and Außenmühle Lake. Across ten iterations, chirp reduced preamble detection delay from seconds to milliseconds, and the improvement held under both multipath and Doppler.

Two parameter findings mattered more than the headline result. The time–bandwidth product is proportional to the power concentrated in the main lobe, which gives a direct knob to trade sweep length against peak sharpness. And the generation sampling rate could be lowered from 2 MHz to 500 kHz before spurious correlation peaks appeared — the binding constraint on porting the scheme to embedded hardware, and the number I would want first if I were designing the next modem.

## The general lesson

The fix was not a better detector. It was choosing a waveform whose ambiguity function suits the channel, so that the detector's job becomes easy. That pattern recurs: when estimation is hard, check whether the measurement itself can be redesigned before adding another model on top of it.

</div>

<div lang="de" markdown="1">

Akustische Unterwasserverbindungen scheitern aus einem unspektakulären Grund: Das Paket kommt an, aber der Empfänger kann nicht sagen, wann genau es begann. Alles Weitere — Symboltiming, Demodulation, das gesamte Paket — hängt daran, die Präambelgrenze zu finden. Im Flachwasserkanal ist genau diese Grenze das, was das Medium zerstört.

## Das Problem ist der Kanal, nicht das Modem

Schall im Flachwasser läuft gleichzeitig über mehrere Pfade. Der Direktpfad kommt zuerst; Reflexionen von Oberfläche und Grund folgen Millisekunden später, gedämpft aber nicht vernachlässigbar, und jede ist eine verzögerte Kopie des bereits vorhandenen Signals. Ist die Präambel ein kurzer FSK-Tonburst, sieht der Empfänger denselben Ton mit unbekannten Versätzen wiederholt. Die Kreuzkorrelation liefert dann keinen scharfen Peak, sondern einen breiten, dreieckigen Bereich hoher Korrelation. Irgendwo darin liegt die wahre Ankunft; einen Punkt darin zu wählen ist Raten mit einer Varianz in Sekunden.

Autonome Kleinst-Unterwasserfahrzeuge verschärfen das. Sie sind klein, günstig, energiebeschränkt und arbeiten in Testtanks, Hafenkanälen und Seen — akustisch jeweils auf eigene Weise unfreundlich. Ein Synchronisationsfehler von einer Sekunde ist keine Verschlechterung, sondern ein verlorenes Paket.

## Was ein Chirp ändert

Ein linearer Frequenz-Chirp überstreicht ein Band kontinuierlich über eine feste Dauer. Zwei Eigenschaften sind hier entscheidend. Erstens ist seine Autokorrelation ein schmaler Peak und kein Plateau: Weil die Momentanfrequenz monoton mit der Zeit wächst, korreliert jede verzögerte Kopie genau bei einem Lag stark und sonst schwach. Mehrwege addieren ihre Kopien weiterhin — aber als getrennte, kleinere Peaks statt als ein unscharfer Block. Zweitens verhält sich ein Chirp unter Dopplerverschiebung gutartig: Ein bewegtes Fahrzeug verschiebt den gesamten Sweep, der Peak wandert leicht und bleibt ein Peak.

In meinem Masterprojekt in der Forschungsgruppe smartPORT habe ich FSK-Präambeln für die paketbasierte Synchronisation zwischen µAUVs durch Chirps ersetzt, die Signalerzeugung und Auswertungskette aufgebaut und Modem sowie Messtechnik charakterisiert, um einen Parametersatz zu finden, den ein reales Modem auch senden kann.

## Validierung im Wasser, nicht in der Simulation

Simulierte Mehrwegeausbreitung ist auf eine Weise gutmütig, die echtes Wasser nie ist. Die Auswertung lief daher in vier Umgebungen zunehmender Realitätsnähe: Kleinbehälter, Testtank, Kanal Harburg und Außenmühlenteich. Über zehn Iterationen senkte Chirp die Präambel-Detektionsverzögerung von Sekunden auf Millisekunden, robust gegen Mehrwege und Doppler.

Zwei Parameterergebnisse waren wichtiger als das Hauptresultat. Das Zeit-Bandbreite-Produkt ist proportional zur Leistungskonzentration in der Hauptkeule — ein direkter Regler, um Sweeplänge gegen Peakschärfe zu tauschen. Und die Abtastrate der Signalerzeugung ließ sich von 2 MHz auf 500 kHz senken, bevor Nebenpeaks auftraten — die bindende Randbedingung für die Portierung auf Embedded-Hardware.

## Die allgemeine Lehre

Die Lösung war kein besserer Detektor, sondern eine Wellenform, deren Ambiguitätsfunktion zum Kanal passt, sodass die Aufgabe des Detektors leicht wird. Dieses Muster wiederholt sich: Wenn Schätzung schwer ist, prüfe zuerst, ob die Messung selbst umgestaltet werden kann, bevor ein weiteres Modell darauf gesetzt wird.

</div>
