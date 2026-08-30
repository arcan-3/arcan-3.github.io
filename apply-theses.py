#!/usr/bin/env python3
"""
Adds the master's thesis and master's project abstracts + PDF links to
research.html and publications.html.

Run from the repository root (the directory containing index.html):

    python3 apply-theses.py

Idempotent: running it twice makes no further changes.
The two PDFs must already exist at:
    assets/ankit-ghosh-master-thesis.pdf
    assets/ankit-ghosh-master-project.pdf
"""
import pathlib
import sys

T_ANCHOR = "Modellierung des Flachwasserkanals mit synthetischen Impulsantworten, um Echoanteile bei unbekannter Quellposition beurteilen zu können.</li>\n        </ul>\n"

T_BLOCK = "        <div style=\"margin:22px 0 0;padding:22px 24px;border-left:2px solid var(--mg-dim);border-radius:0 var(--r) var(--r) 0;background:var(--bg-2)\">\n          <div class=\"kicker\" style=\"margin-bottom:12px\"><span lang=\"en\">Abstract · abridged</span><span lang=\"de\">Abstract · gekürzt</span></div>\n          <p style=\"margin:0;color:var(--ink-2);font-size:16.5px\">“In this thesis work, a system is proposed for detection of echolocation click of toothed whales and thereby extracting three unique features of the echolocation clicks to identify a toothed whale species. Generalised Weiner filtering based source separation algorithms helped in isolating the clicks from other vocal artefacts — whistle, creeks and other harmonic vocalisations. […] The separated clicks are the fingerprint of these toothed whales which propelled the motivation to analyse them using methods like Hilbert transform, wavelet analysis and correlation. As detection of echo from a click signal is virtually impossible given that the source location is unknown, these methods helped in the analysis of clicks or rather echoes of the clicks providing determining factors about them. […] Finally, click length is found out through an adaptation of the correlation technique using information about the band-limitation of each pulse.”</p>\n          <p style=\"margin:14px 0 0;font-size:13px;color:var(--ink-3)\"><span lang=\"en\">Abridged from the thesis abstract; ellipses mark omissions. Full text in the PDF.</span><span lang=\"de\">Gekürzt aus dem Abstract der Arbeit; Auslassungen sind markiert. Vollständiger Text im PDF.</span></p>\n        </div>\n        <div class=\"pub-foot\">\n          <a class=\"chip\" href=\"assets/ankit-ghosh-master-thesis.pdf\"><span lang=\"en\">Thesis PDF · 110 pp.</span><span lang=\"de\">Arbeit als PDF · 110 S.</span></a>\n        </div>\n"

P_ANCHOR = "Nachweis, dass die Abtastrate der Signalerzeugung von 2 MHz auf 500 kHz reduziert werden kann, bevor Nebenpeaks auftreten — die Randbedingung für die Portierung auf Embedded-Hardware.</li>\n        </ul>\n"

P_BLOCK = "        <div style=\"margin:22px 0 0;padding:22px 24px;border-left:2px solid var(--mg-dim);border-radius:0 var(--r) var(--r) 0;background:var(--bg-2)\">\n          <div class=\"kicker\" style=\"margin-bottom:12px\"><span lang=\"en\">Abstract · abridged</span><span lang=\"de\">Abstract · gekürzt</span></div>\n          <p style=\"margin:0;color:var(--ink-2);font-size:16.5px\">“Underwater communication is difficult due to problems like multipath propagation, scattering, attenuation and others which forced to research for a resilient technique to communicate underwater efficiently and accurately enough […]. Packet based preamble synchronization is a widely popular idea in order to synchronize two or more µAUVs prior to communication within them and this is used by research group smartPORT, Hamburg University of Technology. The modulation technique the institute is using at present to communicate is frequency shift keying (FSK) which is creating ambiguity in detecting the preamble boundaries due to multipath propagation and so chirp modulation is explored as the information in this case is spread over a frequency band rather than a single carrier frequency […]. So, chirp is explored in the project through different scenarios and experimental results are discussed to suggests that boundary detection efficiency and accuracy with chirp modulation is better rather than that of FSK in any given condition. Moreover, the effects of Doppler shift is investigated to check the robustness of chirp.”</p>\n          <p style=\"margin:14px 0 0;font-size:13px;color:var(--ink-3)\"><span lang=\"en\">Abridged from the project abstract; ellipses mark omissions. Full text in the PDF.</span><span lang=\"de\">Gekürzt aus dem Abstract des Projekts; Auslassungen sind markiert. Vollständiger Text im PDF.</span></p>\n        </div>\n        <div class=\"pub-foot\">\n          <a class=\"chip\" href=\"assets/ankit-ghosh-master-project.pdf\"><span lang=\"en\">Project PDF · 70 pp.</span><span lang=\"de\">Projekt als PDF · 70 S.</span></a>\n        </div>\n"

PUB_ANCHOR = "      <p class=\"rv\" style=\"margin-top:34px;color:var(--ink-3);font-size:15px\">"

PUB_BLOCK = "      <div class=\"pub rv\">\n        <div class=\"kicker\"><span lang=\"en\">Theses</span><span lang=\"de\">Abschlussarbeiten</span> · 2017 — 2018 · TUHH / HSU</div>\n        <h3><span lang=\"en\">Master’s thesis and master’s project</span><span lang=\"de\">Masterarbeit und Masterprojekt</span></h3>\n        <p class=\"where\"><span lang=\"en\">Source Separation and Echo Detection of Underwater Acoustic Signals of Whales (2018) · Chirp Modulation for Resilient Underwater Acoustic Communication (2017). Abstracts on the <a href=\"research.html\">Research</a> page.</span><span lang=\"de\">Source Separation and Echo Detection of Underwater Acoustic Signals of Whales (2018) · Chirp Modulation for Resilient Underwater Acoustic Communication (2017). Abstracts auf der Seite <a href=\"research.html\">Forschung</a>.</span></p>\n        <div class=\"pub-foot\">\n          <a class=\"chip\" href=\"assets/ankit-ghosh-master-thesis.pdf\"><span lang=\"en\">Thesis PDF</span><span lang=\"de\">Arbeit als PDF</span></a>\n          <a class=\"chip\" href=\"assets/ankit-ghosh-master-project.pdf\"><span lang=\"en\">Project PDF</span><span lang=\"de\">Projekt als PDF</span></a>\n        </div>\n      </div>\n\n"

EDITS = [
    ("research.html", [(T_ANCHOR, T_ANCHOR + T_BLOCK, "thesis abstract"),
                       (P_ANCHOR, P_ANCHOR + P_BLOCK, "project abstract")]),
    ("publications.html", [(PUB_ANCHOR, PUB_BLOCK + PUB_ANCHOR, "theses card")]),
]

MARKERS = ("ankit-ghosh-master-thesis.pdf", "ankit-ghosh-master-project.pdf")


def main():
    root = pathlib.Path(".")
    if not (root / "index.html").exists():
        sys.exit("! Run this from the repository root (index.html not found here).")

    for asset in ("assets/ankit-ghosh-master-thesis.pdf",
                  "assets/ankit-ghosh-master-project.pdf"):
        print(("  ok  " if (root / asset).exists() else "  MISSING  ") + asset)

    failed = False
    for name, edits in EDITS:
        path = root / name
        if not path.exists():
            print(f"! {name} not found"); failed = True; continue
        text = original = path.read_text(encoding="utf-8")
        for old, new, label in edits:
            if any(m in text for m in MARKERS) and old not in text:
                print(f"  = {name}: {label} already applied"); continue
            count = text.count(old)
            if count == 0:
                print(f"  ! {name}: anchor for {label} not found"); failed = True; continue
            if count > 1:
                print(f"  ! {name}: anchor for {label} found {count}x, skipped"); failed = True; continue
            if new.replace(old, "") and new.replace(old, "") in text:
                print(f"  = {name}: {label} already present"); continue
            text = text.replace(old, new, 1)
            print(f"  + {name}: {label} inserted")
        if text != original:
            path.write_text(text, encoding="utf-8")

    print()
    print("Done. Review with:  git diff")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
