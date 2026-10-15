# Memory Mug Company — working notes

Read this before changing `index.html`. `README.md` covers the product and the setup;
this file covers the things that are easy to break and the reasons behind decisions
that look arbitrary.

## Shape

One file. `index.html` holds the markup, the CSS, a hand-written SVG mug, and two
`<script>` IIFEs. There is no build step and no dependency to install. Do not
introduce one — the page has to outlive whoever is maintaining it.

**The two script blocks do not share scope.** Block 1 owns the mug-style chips and
`show()`. Block 2 owns the shop, the cart, the Shopify handoff and the admin panel.
Calling a block-1 function from block 2 throws. Where block 2 needs to switch the
previewed scene it calls `chip.click()` and lets block 1's own handler run.

## Panel geometry

Every scene on the mug is drawn in one fixed box, `ART_BOX = [190, 152, 116, 140]`,
and `layoutPanel()` maps that box onto wherever the print actually goes — a slightly
larger panel on the drawn mug, or a measured slice of a product photograph. It sets
the clip, the white ground, the outline and the transform together.

Those four used to be written out by hand in four bits of markup, and moving the print
meant getting all four right. Change the print area in `layoutPanel()`, never in the
markup, and never rescale the scenes.

`MUG_PHOTO` holds the shop's mug as a data URI and `PRINT_AREA` is measured against
that one photograph: its body runs x 221-756, y 250-930 of 1100, and the print is
inset from that. Swap the photo and those four numbers are wrong until they are
redone. `assets/15ozMugTemplate.webp` is the source image.

`getBBox()` reports coordinates in an element's **own** user space and ignores the
scale wrapper. Measure in screen pixels (`getBoundingClientRect`) when checking
whether artwork lands where you think it does.

## One predicate drives the artwork copy

`uploadFlow()` decides whether the order hands over to the Shopify cart or to the
product page. `handoffUrl()` reads it, and so does every sentence on the page about
how a photo reaches the shop — step 1 of How It Works, the FAQ answer, the line under
the order panel, the picker note, the checkout button label, and whether the order-note
box exists at all.

Keep it that way. If you add copy about sending photos, drive it from
`applyArtworkCopy()` rather than writing a second source of truth.

## The photo fits inside the shape at zoom 1

`layoutCrop()` places the customer's photo. Zoom 1 fits the whole picture inside
the square (by the long side) or the circle (by the diagonal), so a wide logo
keeps its edges and white space in the spare is expected. A circle crop from the
picker is already that composed square; do not shrink it a second time. Above
zoom 1 the offset is clamped so panning cannot open a gap. Anything that moves
the photo goes through `movePhoto`, `zoomPhoto` or `centerPhoto` and then
repaints — do not write to `ownPhoto.ox`/`oy`/`zoom` and paint separately, or
the clamp is skipped.

An SVG with no width or height decodes at a browser default (often 300×150).
`readImage()` sizes it from the viewBox before drawing, or the canvas stretches
the artwork. JPEG has no alpha; the white fill under the draw is what keeps a
transparent PNG or SVG from coming back with black corners.

Remove background is a separate step, after the crop. It lazy-loads
`@imgly/background-removal` from a CDN the first time the button is pressed
and stores a PNG with alpha on `ownPhoto.cutout`. Do not run that result
through `toDataURL('image/jpeg')`. Skip the white `face-plate` while the
cutout is showing, or a pattern cannot show through. Re-cropping replaces
`ownPhoto`, which is what clears the cutout. The runtime is pinned to one
WASM thread because this page is not cross-origin isolated.

The mug only becomes a drag target while the customer's own photo is the scene on
show. That is also the only time `touch-action: none` applies, because otherwise a
finger on the mug could not scroll the page.

## Traps already paid for

- Presentation attributes cannot resolve CSS custom properties. `fill="var(--ink)"`
  does nothing; use a class.
- Bare `1fr` grid tracks carry an `auto` minimum and overflow at phone width. Use
  `minmax(0, 1fr)` with `min-width: 0`.
- `document.fonts.check()` returns true optimistically even when a font never loaded.
  Do not trust it. SVG text is pinned with `textLength` instead.
- Chrome serialises `color-mix()` as `color(srgb r g b / a)` with 0–1 channels, not
  `rgb()` with 0–255. `tools/audit.mjs` handles both; anything else parsing computed
  colour must too.
- A canvas re-encoded to JPEG has no alpha, so a cut-out PNG comes back with black
  corners. `readImage()` lays down white first.
- `mountPhotos()` sweeps `image` elements out of the SVG. It excludes `.mug-base`,
  which is the product photograph, not an overlay.
- `#mug-wrap` and `#admin-wrap` are nested svgs. Each clip is a polygon in that
  svg's own viewBox, starting near 0,0. A clip written in the parent mug's
  coordinates sits off that viewBox and hides the whole template, even though
  the motif is still in the DOM. `getBoundingClientRect` still reports a size.
  The outline itself is stored as fractions of the mug photograph (`WRAP_OUTLINE`).
- The config region is rewritten wholesale by the admin download. Anything that must
  survive a rebuild has to be emitted by `configSource()` as well as read by `cfg()`.

## Checks

```
node tools/audit.mjs      # WCAG AA across every text/background pair; expect 0
```

Also worth doing by hand before shipping: load the page at 390px and 320px wide and
confirm there is no horizontal scroll, and open the admin panel, change something,
download the rebuilt file, and load it in a browser with storage cleared.

## Tone

Plain, warm, specific, never slick. No exclamation marks in body copy, no stock
marketing verbs, no invented testimonials, ratings, guarantees or turnaround promises.
US spelling throughout. If a sentence makes a claim about the shop, somebody at the
shop has to have confirmed it.
