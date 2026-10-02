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

## The customer's photo keeps covering the print

`photoRect()` works out where the customer's photo is drawn and clamps the offset
back into range on every call, so panning and zooming can never open a white gap
along an edge. Anything that moves the photo goes through `movePhoto`, `zoomPhoto`
or `centerPhoto` and then repaints — do not write to `ownPhoto.ox`/`oy`/`zoom` and
paint separately, or the clamp is skipped and the preview starts promising a crop
the press cannot produce.

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
- `#admin-wrap` is a nested svg. Its clip has to live in that svg's own viewBox,
  starting at 0,0. A clip rect written in the parent mug's coordinates sits off
  that viewBox and hides the whole template, even though the motif is still in the DOM.
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
