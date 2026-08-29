# arcan-3.github.io

Personal site for **Ankit Ghosh, PhD** — signal, image and time-series machine learning.
Jekyll on GitHub Pages. Bilingual (EN/DE), dark/light, no build step required for the
static pages.

## Deploy in three steps

1. Create a repository named exactly **`arcan-3.github.io`** on GitHub.
2. Upload **the contents of this folder** to the repository root — not the folder itself.
   (`index.html` must sit at the root of the repo.)
3. Repository → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.

The site appears at <https://arcan-3.github.io> within a minute or two.

## What is where

| Path | What it is |
|---|---|
| `index.html` | Home — hero, about, skills, quote |
| `work.html` | Work experience timeline + education summary |
| `research.html` | Doctorate, research projects, activities & awards (full method detail) |
| `publications.html` | Dissertation + posters, each with copyable BibTeX |
| `blog.html` | Blog index (Jekyll, lists `_posts`) |
| `cv.html` | Condensed résumé, print stylesheet, PDF link |
| `404.html` | Not-found page |
| `_posts/` | Blog posts in Markdown — three samples to replace |
| `_layouts/post.html` | Layout used by blog posts |
| `assets/css/style.css` | All styling |
| `assets/js/site.js` | Theme, language, scroll reveals, shortcuts, BibTeX copy |
| `assets/img/profile.png` | Photo used on the home page |
| `assets/ankit-ghosh-cv.pdf` | CV download |
| `assets/img/og.png` | Social preview image |
| `_config.yml` | Jekyll config, plugins, SEO defaults |

## Things to fill in

- **Google Scholar** — search for `YOUR-SCHOLAR-ID` and replace it in the page footers
  (`index.html`, `work.html`, `research.html`, `publications.html`, `cv.html`,
  `404.html`, `blog.html`, `_layouts/post.html`), or delete those links.
- **Analytics** — an HTML comment near the top of `index.html` marks where to paste a
  snippet (Plausible, GoatCounter, GA4). Add it to the other pages the same way if you want
  site-wide tracking.
- **Proofread the German.** Every page carries a German version; I wrote it, so read it
  before publishing.

## Writing a blog post

Add a file to `_posts/` named `YYYY-MM-DD-some-slug.md`:

```markdown
---
title: "Post title"
description: "One or two sentences — shown on the blog index and in link previews."
date: 2026-09-01
tags: [acoustics, edge]
---

<div lang="en" markdown="1">
English text here.
</div>

<div lang="de" markdown="1">
Deutscher Text hier.
</div>
```

The `lang` wrappers are what the EN/DE switch toggles. A post with only one language
block will show in both modes.

## Keyboard shortcuts

`1`–`6` jump to the six pages, `L` switches language, `T` switches theme.

## Local preview (optional)

Plain HTML pages open directly in a browser. To render the blog locally:

```bash
bundle install
bundle exec jekyll serve
```

## Notes

- Sitemap, RSS feed and SEO tags come from `jekyll-sitemap`, `jekyll-feed` and
  `jekyll-seo-tag`, which GitHub Pages supports natively.
- Custom domain: add a `CNAME` file containing the domain, and set `url` in `_config.yml`.
- The visual direction is an original hextech-inspired treatment (deep indigo, cyan,
  magenta). No third-party brand assets are used.
