# arcan-3.github.io

Static site. No build step, no dependencies, no Jekyll. Edit HTML, push, done.

## Deploy

The repository name determines the URL. For `https://arcan-3.github.io` the repo must be
named exactly `arcan-3.github.io` and owned by `arcan-3`.

```bash
cd site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:arcan-3/arcan-3.github.io.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch →
Branch: `main` / `(root)` → Save.** First publish takes a couple of minutes.

Add `.nojekyll` at the root if you ever add a directory starting with an underscore that
you need served — `projects/_template.html` is not served as a page anyway, so this is
only relevant later.

## Structure

```
index.html                      home: hero, thread, write-up cards, contact
assets/style.css                all styling
assets/signal.js                the hero waveform figure
assets/Ghosh_CV.pdf             TODO: export from Overleaf and drop in
projects/amp-toolkit.html       doctoral work write-up
projects/underwater-acoustics.html
projects/_template.html         duplicate this for each new write-up
```

To add a write-up: copy `_template.html` to a real filename, write it, then add a card in
`index.html` and remove `card--soon` from that card.

## Before it goes live

- [ ] Search the HTML for `TODO` and resolve every one.
- [ ] Export the CV PDF from Overleaf to `assets/Ghosh_CV.pdf`.
- [ ] **Check what you are allowed to publish.** BATO and Metric-space work is customer
      work. Confirm before writing anything about a specific client, system or dataset.
      Confirm there is no embargo on the dissertation material.
- [ ] Add at least one real figure to `amp-toolkit.html`. A write-up with no figure reads
      as a summary; a write-up with one good figure reads as work.
- [ ] Update `\homepage{arcan-3.github.io}` in `resume.tex` (it is already there,
      commented out).

## Notes on the design

Palette and typography are fixed in the `:root` block of `style.css`. The accent is
`#0E7C86` from the Arcane identity, with `#1FB6C4` as the brighter variant used for the
recovered trace, since the base teal is too dark to read against `#101418` at 2px.

The hero figure computes a real signal, adds real noise at the SNR you select, and
recovers it with a sliding quadratic fit. The method is deliberately trivial. If you
replace it with something better, keep the note that says what it is — the figure is
honest about being an illustration, and that is the point.

Responsive to mobile, keyboard focus visible, `prefers-reduced-motion` respected.
