---
title: "Anomaly detection that survives ambient noise"
description: "A detector tuned in the lab meets a factory, a street or a stable. What holds up is preprocessing that matches the physics and thresholds that adapt."
date: 2026-06-25
tags: [anomaly detection, edge, industry]
---

<div lang="en" markdown="1">

Anomaly detection demos are easy. The recording is clean, the anomaly is loud, the threshold is a constant. Deployment is where the assumptions get audited: the ambient level moves, the sensor is bolted somewhere inconvenient, and the hardware has a latency budget measured in milliseconds.

Three deployments shaped how I approach this.

## Vibroacoustic predictive maintenance

Rotating machinery is the friendly case, because the physics tells you where to look — orders of the shaft frequency, sideband structure, envelope of the high-frequency band. Building this from raw sensor data through model development to a production release taught me that most of the difficulty is not the model. It is establishing what "normal" means for a machine that changes with load, temperature, tooling and season, and doing it without a labelled fault set, because customers do not break their own equipment to generate training data.

## Acoustic event detection on the edge

Detecting vehicle tampering in the field means an unpredictable ambient level — traffic, rain, wind, voices — and an inference budget set by a Jetson Xavier NX rather than by a workstation. Wavelet-decomposition-based preprocessing was what made the latency target reachable: decomposing before the model concentrates the transient content the detector needs and discards most of what it does not, so the network can be small enough to run in real time. Choosing the representation is a modelling decision, not a preprocessing detail.

## Adaptive thresholds on infrared imagery

For real-time industrial inspection on infrared imagery, I deployed ensemble anomaly detection with adaptive thresholds on top of the CFLOW anomaly foundation model. Two things earn their keep here. A foundation model gives useful features without a per-line labelling campaign. And an adaptive threshold acknowledges that the scene's baseline drifts — with ambient temperature, with production rate, with the emissivity of whatever is in frame. A fixed cut-off that was correct at commissioning is wrong by the next shift.

## What generalises

- **Match the representation to the physics.** Wavelets for transients, order analysis for rotation, spectrogram-domain separation for overlapping sources. This buys more than a larger network does.
- **Let the threshold move.** Almost every real signal has a baseline that drifts. Estimate it continuously and detect deviation from it.
- **Ensembles for stability, not accuracy.** Averaging several detectors mostly reduces the variance of false alarms, which is what an operator experiences as trustworthiness.
- **Give the alarm a context.** An anomaly score alone gets ignored. Linking a time-series anomaly to the relevant manual section and to the sensors implicated in it — which is what I now build at BATO — turns a number into an action.

</div>

<div lang="de" markdown="1">

Demos zur Anomalieerkennung sind einfach. Die Aufnahme ist sauber, die Anomalie ist laut, die Schwelle ist eine Konstante. Beim Deployment werden die Annahmen geprüft: Der Umgebungspegel wandert, der Sensor sitzt an einer unpraktischen Stelle, und die Hardware hat ein Latenzbudget in Millisekunden.

Drei Deployments haben meine Vorgehensweise geprägt.

## Vibroakustische Predictive Maintenance

Rotierende Maschinen sind der freundliche Fall, weil die Physik sagt, wo man hinsehen muss — Ordnungen der Wellenfrequenz, Seitenbandstruktur, Einhüllende des Hochfrequenzbandes. Das Ganze von Rohsensordaten über die Modellentwicklung bis zum Produktionsrelease zu bauen, hat mir gezeigt: Der Großteil der Schwierigkeit liegt nicht im Modell. Er liegt darin, festzulegen, was „normal" für eine Maschine bedeutet, die sich mit Last, Temperatur, Werkzeug und Jahreszeit verändert — und das ohne gelabelten Fehlerdatensatz, denn Kunden zerstören ihre Anlagen nicht, um Trainingsdaten zu erzeugen.

## Akustische Ereigniserkennung am Edge

Fahrzeugmanipulation im Feld zu erkennen bedeutet einen unvorhersehbaren Umgebungspegel — Verkehr, Regen, Wind, Stimmen — und ein Inferenzbudget, das ein Jetson Xavier NX vorgibt und keine Workstation. Preprocessing per Wavelet-Zerlegung machte das Latenzziel erreichbar: Die Zerlegung vor dem Modell konzentriert die transienten Anteile, die der Detektor braucht, und verwirft den Rest, sodass das Netz klein genug für Echtzeit bleibt. Die Wahl der Repräsentation ist eine Modellierungsentscheidung, kein Preprocessing-Detail.

## Adaptive Schwellen auf Infrarotbildern

Für die Echtzeit-Industrieinspektion auf Infrarotbildern habe ich eine Ensemble-Anomalieerkennung mit adaptiven Schwellen auf Basis des CFLOW-Foundation-Modells deployt. Zwei Dinge zahlen sich hier aus. Ein Foundation-Modell liefert brauchbare Merkmale ohne Labeling-Kampagne pro Linie. Und eine adaptive Schwelle berücksichtigt, dass die Basislinie der Szene driftet — mit Umgebungstemperatur, Produktionsrate und Emissivität dessen, was im Bild ist. Ein fester Schwellwert, der bei der Inbetriebnahme korrekt war, ist in der nächsten Schicht falsch.

## Was verallgemeinerbar ist

- **Repräsentation an die Physik anpassen.** Wavelets für Transienten, Ordnungsanalyse für Rotation, Trennung in der Spektrogramm-Domäne für überlagerte Quellen. Das bringt mehr als ein größeres Netz.
- **Die Schwelle mitlaufen lassen.** Fast jedes reale Signal hat eine driftende Basislinie. Kontinuierlich schätzen und Abweichung davon detektieren.
- **Ensembles für Stabilität, nicht für Accuracy.** Die Mittelung mehrerer Detektoren senkt vor allem die Varianz der Fehlalarme — und genau das erlebt ein Bediener als Vertrauenswürdigkeit.
- **Dem Alarm Kontext geben.** Ein Anomalie-Score allein wird ignoriert. Eine Zeitreihen-Anomalie mit dem passenden Handbuchabschnitt und den betroffenen Sensoren zu verknüpfen — was ich heute bei BATO baue — macht aus einer Zahl eine Handlung.

</div>
