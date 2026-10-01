# Memory Mug Company

A one-page storefront for custom photo mugs, operated by [H3 Customs](https://h3customs.com).

One product: a 15 oz white ceramic mug, $28, the customer's photo wrapped around it.
The page takes the order and hands it to Shopify to be paid for. **No card, no payment
and no customer record ever touches this site.**

---

## The whole thing is one file

`index.html` is the site. Open it in a browser and it works — off a disk, off a USB
stick, off any host. There is no build step, no `npm install`, no framework, no
bundler, and nothing to go out of date. That is deliberate: this page has to still
work in five years, in the hands of whoever owns the business then.

Everything is inline — markup, CSS, the mug illustration (hand-written SVG), and the
JavaScript. The only outside request is a Google Fonts stylesheet, and the page is
built to look right when that request fails.

| | |
|---|---|
| `index.html` | The site. The product. Edit this one. |
| `.github/workflows/pages.yml` | Publishes to GitHub Pages on every push to `main`. |
| `tools/audit.mjs` | Checks every text/background pair on the page against WCAG AA. |
| `tools/serve-mac.command`, `tools/serve-windows.bat` | Double-click to preview on a local server. |

---

## Hosting it

The workflow deploys to GitHub Pages automatically. It needs **one** setting that only
a repository admin can turn on:

> Settings → Pages → Build and deployment → Source → **GitHub Actions**

Then every push to `main` republishes the site. For `memorymugcompany.com`, add the
domain under Settings → Pages → Custom domain and point the DNS at GitHub.

Any static host works just as well — drop `index.html` on Netlify, Cloudflare Pages,
S3, or the shop's existing server.

---

## Changing it without touching code

The page has a built-in admin panel. Scroll to the footer → **Shop owner? Open admin**
→ passphrase `mugs2026`.

From there you can set the prices, the product name and bullets, the shipping note,
the support email, the shop name and link, the Shopify connection, the example photos,
and the mug photograph. Changes preview live in the browser behind the panel.

When it looks right, **Download updated site** hands back a complete `index.html`
with your settings written into it. Commit that file over the old one and the change
is live for everyone.

> **The passphrase is not security.** It sits in the page source, where anyone can
> read it. It keeps the panel out of a customer's way, nothing more. Never put
> anything sensitive behind it.

To edit by hand instead, everything configurable is between the
`/* ADMIN-CONFIG-START */` and `/* ADMIN-CONFIG-END */` markers. The admin download
rewrites exactly that region, so hand edits and panel edits are interchangeable.

---

## Connecting Shopify

The page never charges anybody. It builds an order and hands it over.

1. In Shopify admin, open the mug product and click its variant.
2. The address ends `/variants/44012345678901` — that number is the variant ID.
3. Put it, and the store's permanent `.myshopify.com` address, into the admin panel.
4. Make sure the product is published to the **Online Store** channel, or the link
   opens an empty cart.

Until a store is connected the page says so plainly and still lets people build an
order, so it is safe to put live early.

### How the customer's photo reaches the shop

Two options, set in the admin panel under **Customer artwork**.

**Emailed after checkout** (the default, needs no apps). The order goes to Shopify
through a cart permalink. The customer emails the photo afterwards, and the filename
they picked rides along on the order as `Photo to expect` so it can be matched up.

**Uploaded with the order** — [Uploadery](https://apps.shopify.com/uploadery) by
ShopPad, a paid Shopify app. It puts a real file field on the Shopify *product* page
and saves the upload onto the order. A cart permalink skips the product page, so this
option hands over to the product page instead and the customer attaches the file there.

To set it up: install Uploadery, create an upload set with one **file** field and
assign it to the mug product, then put the product's handle (`/products/the-memory-mug`
→ `the-memory-mug`) into the admin panel and switch the setting over.

Every sentence on the page about sending photos is generated from the same check the
link itself uses, so the copy and the handover cannot drift apart. A missing or
misspelled handle falls back to the email flow on its own rather than sending anyone
to a dead page.

### The photo picker is a preview, not an upload

On both flows, the "See your photo on the mug" picker reads the image **in the
customer's own browser** and draws it on the mug. The file never leaves their device
from this page — a Shopify cart permalink can carry text but not a file. The wording
on the page says exactly that, and it must keep saying it unless the underlying
behaviour changes.

---

## The mug photograph

The shop's own 15 oz mug is already in place. It is embedded in `index.html` as a
data URI so the page stays a single file; the source image is kept alongside it at
`assets/15ozMugTemplate.webp` so it can be re-derived or re-measured.

The artwork **multiplies** onto the photograph, so the ceramic's shading and
highlights read through it the way a pressed print does, rather than sitting on top
like a sticker. The illustrated mug is still in the file and takes over automatically
if the photo is ever removed.

To swap in a different mug: admin panel → **The mug itself**. Shoot it straight on,
handle to the right, on a transparent or white background. Four percentage boxes then
place the print area on it, with a live preview. Those numbers are measured against
one specific photograph — change the photo and they need redoing, which is exactly
why they are editable and not baked in.

---

## House rules

Keep these and the page keeps working.

- **Plain HTML, CSS and JavaScript.** No framework, no build step, no package manager.
- **Colours come from the CSS variables** on `:root`. Never hardcode a hex value.
- **Light only.** The page pins `color-scheme: light` on purpose. A dark palette was
  built once and removed; do not reintroduce one.
- **SVG paint goes through CSS classes** (`.f-ink`, `.s-rule2`, …). A presentation
  attribute like `fill="var(--ink)"` silently does nothing.
- **Grid tracks are `minmax(0, 1fr)`**, never bare `1fr`, which carries an `auto`
  minimum and blows layouts out at phone width.
- **SVG text carries `textLength` and `lengthAdjust="spacingAndGlyphs"`** so it stays
  inside the artwork when a webfont fails to load.
- **Run `node tools/audit.mjs` before shipping a colour change.** It walks every
  text-bearing element, resolves the background actually painted behind it, and
  checks the contrast ratio. It should report zero failures.
- **Never invent a claim.** Everything on the page about what the shop does has to be
  something the shop actually does.

---

## Known gaps

Honest list. None of these are bugs; they are things only the owner can answer.

- **`hello@memorymugcompany.com` is a placeholder** and goes nowhere. It must be a
  real, monitored inbox before the page is put in front of customers.
- **Two service claims were written speculatively** and need confirming or cutting:
  "Background removal if you want it — no charge" and "Color correction by hand,
  every time."
- **The mug is real; the artwork on it is not.** The blank mug is the shop's own
  photograph, but every example design printed on it is an illustration. Photographs
  of actual finished mugs would do more for the page than anything else left on this
  list. Load them in the admin panel under **Example photos**.
- **The shipping note must match the real Shopify shipping rates.**
