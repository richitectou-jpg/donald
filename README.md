# Tat In Ou — Architecture Portfolio

A dependency-free static portfolio site. No build step, no npm, no framework —
open `index.html` in a browser and it works.

**Live site:** https://richitectou-jpg.github.io/donald/ *(after you enable Pages — see below)*

---

## Turning on GitHub Pages

1. Go to https://github.com/richitectou-jpg/donald/settings/pages
2. Under **Source**, choose **Deploy from a branch**
3. Branch: **`main`**, folder: **`/ (root)`** → **Save**
4. Wait ~1 minute. The site appears at `https://richitectou-jpg.github.io/donald/`

Every `git push` to `main` republishes it automatically.

---

## Structure

```
index.html                  Home — hero, index of works, about + contact
projects/
  reverie.html              Case study: Reverie
assets/
  css/site.css              All styling (design tokens at the top)
  js/site.js                Lightbox, PDF viewer, scroll reveal, hover preview
  favicon.svg
  projects/reverie/
    renders/                18 render plates (.png)
    drawings/               11 drawing sheets, A–K (.pdf)
    process/                Storyboard + iterative sketch
.nojekyll                   Tells GitHub Pages to serve files as-is
```

---

## Things you still need to edit

Placeholder text is **underlined in yellow** on the live site so you can spot it.
Search the HTML for `class="todo"` to find every instance.

| Where | What |
|---|---|
| `index.html` → About | Your bio, school, year of study |
| `index.html` → Contact | Email, location, availability |
| `projects/reverie.html` → Specs | Course code, software used |
| `projects/reverie.html` → Statement | The real brief: site, program, the question set |

Also worth doing: the three greyed-out rows in the index (`work--soon`) are
placeholders named after folders in your Downloads. Rename or delete them.

---

## Adding a project

1. Create `assets/projects/<slug>/` with `renders/`, `drawings/`, `process/`
   subfolders. **Use lowercase, hyphenated filenames** — no spaces, they cause
   URL-encoding problems.
2. Copy `projects/reverie.html` → `projects/<slug>.html` and replace the content.
3. In `index.html`, replace one of the `work--soon` placeholder rows with a copy
   of the `work--live` row, pointing at your new page.

### How the lightbox works

Any element with these attributes becomes a viewer trigger:

```html
<button data-lb="renders"          <!-- group name: arrow keys page within a group -->
        data-type="image"          <!-- "image" or "pdf" -->
        data-src="path/to/full.png"
        data-caption="Shown under the image">
```

Items sharing a `data-lb` group are navigable with ← / → and dismissed with `Esc`.

---

## Known trade-off: image weight

The renders ship as the original 1920×1080 PNGs — about **25 MB total**. They are
lazy-loaded, so the page is usable immediately, but a first visit on mobile data
is heavy.

There was no image tooling on the machine this was built on (no ImageMagick,
Python or Node), so nothing was re-encoded. When you get a chance, converting the
renders to WebP at ~85% quality would cut this by roughly 80% with no visible
loss:

```bash
for f in assets/projects/reverie/renders/*.png; do cwebp -q 85 "$f" -o "${f%.png}.webp"; done
```

Then update the `src` and `data-src` attributes to `.webp`. Squoosh.app does the
same thing in a browser if you'd rather not install anything.

---

## Local preview

Opening `index.html` directly from disk works. If PDFs misbehave in the viewer
under `file://`, serve it over HTTP instead — any static server will do.
