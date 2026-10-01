# Memory Mug Company

**Live at [www.memorymugco.com](https://www.memorymugco.com)** — served by GitHub Pages,
republished on every push to `main`.

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

The site is served by **GitHub Pages**, with **memorymugco.com** registered at GoDaddy
and pointed at it. No hosting plan, no monthly bill, HTTPS that renews itself, and
every push to `main` republishes.

All of this is already done. It is written down for whoever has to redo it on a new
domain, a new repository, or a new owner.

### 1. Turn Pages on

Only a repository admin can, and no workflow can do it for you:

> Settings → Pages → Build and deployment → Source → **GitHub Actions**

Then, on the same page, set **Custom domain** to `www.memorymugco.com`. The `CNAME`
file in this repository holds the same value, and that is what stops the setting being
wiped on the next deploy — **if you change one, change the other**, or each deploy
will undo the settings page.

`www` is the primary name rather than the bare domain because a CNAME follows GitHub
wherever its edge addresses move, while the apex is pinned to four fixed IPs. The bare
domain still works: the A records below make it resolve, and GitHub redirects it to
`www`.

### 2. Point the domain at it

At GoDaddy: **My Products → the domain → DNS → Manage DNS**.

Delete GoDaddy's parked `@` A record first, and remove any domain forwarding, or they
will fight what you add next. Then:

| Type | Name | Value | TTL | What it does |
|---|---|---|---|---|
| CNAME | www | `signarama2023.github.io` | 600 | serves the site |
| A | @ | `185.199.108.153` | 600 | bare domain resolves… |
| A | @ | `185.199.109.153` | 600 | … |
| A | @ | `185.199.110.153` | 600 | … |
| A | @ | `185.199.111.153` | 600 | … and redirects to www |

The CNAME is the one that actually serves the site. The four A records exist so that
somebody typing the domain without `www` still arrives; GitHub redirects them. All
four are needed — they are four edge addresses, so listing one is a single point of
failure rather than a shortcut. Optionally add the matching
AAAA records for IPv6: `2606:50c0:8000::153` through `2606:50c0:8003::153`.

### 3. Wait, then force HTTPS

DNS takes anywhere from a few minutes to a few hours. Once GitHub reports the domain
as verified, tick **Enforce HTTPS** on the Pages settings page. The certificate is
issued and renewed by GitHub; there is nothing to buy or remember.

Until all of that is done, the site is still reachable at
`signarama2023.github.io/memorymugco`.

### If the shop ever moves to real hosting

An FTPS deploy workflow for GoDaddy cPanel was written and then removed when it
turned out there was no hosting plan. It is in the git history —
`git log --diff-filter=D -- .github/workflows/deploy.yml` — and can be restored
rather than rewritten. Any static host works: the whole site is one file.

---|---|---|
   | A | @ | `185.199.108.153` |
   | A | @ | `185.199.109.153` |
   | A | @ | `185.199.110.153` |
   | A | @ | `185.199.111.153` |
   | CNAME | www | `signarama2023.github.io` |

   Delete GoDaddy's parked A record for `@` first, or it will fight these.
4. Back in Pages, tick **Enforce HTTPS** once the certificate is issued. DNS can take
   anywhere from minutes to a few hours.

Then run the **Deploy to GitHub Pages (manual)** workflow from the Actions tab, or
push anything.

### GoDaddy cPanel hosting

If the account has a hosting plan, upload `index.html` into `public_html` through
cPanel's File Manager and the site is live. Nothing else needs to go up: the mug
photo, the styles and the scripts are all inside that one file.

To stop that being a manual job every time, `.github/workflows/deploy.yml` will push
it over FTPS on every commit as soon as three secrets exist — `FTP_SERVER`,
`FTP_USERNAME`, `FTP_PASSWORD`, under Settings → Secrets and variables → Actions.
Until then the workflow runs, finds nothing, says so, and exits clean. Make a
dedicated FTP account in cPanel scoped to `public_html` rather than using the main
cPanel login, so a leaked deploy password costs you one folder and not the hosting
account.

Any other static host works just as well — Netlify, Cloudflare Pages, S3.

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

They can place it, though. Dragging the photo on the mug moves it, a zoom slider
crops in, arrow keys do the same for anyone not using a pointer, and **Center** puts
it back. However far it is dragged, the photo keeps covering the print area, so the
preview never shows a crop the press could not produce.

Where they do adjust it, the placement rides along on the order as
`Photo placement: zoom 165%, offset -12% across, -4% down`, so the work is not thrown
away at checkout. Nothing is added when they leave it alone, and this only applies to
the cart-permalink flow — a Shopify product URL carries no attributes.

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
