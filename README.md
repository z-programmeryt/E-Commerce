# SUPER Z SHOP

Premium everyday essentials for Bangladesh. A complete, working e-commerce build — storefront, checkout, admin — plus a 17-sheet business-planning workbook that prices the business honestly.

**Everything runs locally with no paid services.** No cloud database, no payment gateway, no courier account, no external API keys.

> **Unverified commercial data.** Every price in the catalogue is an estimate pending supplier quotations and is labelled `unverified` in the database and on the product page. Admin authentication is a single-account mechanism, not production identity security. See [KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md).

---

## Quick start

```bash
npm install
npm run db:reset     # create the schema
npm run db:seed      # 225 products, 1,028 variants, 18 orders, coupons, banners
npm run dev          # http://localhost:3000
```

Open **http://localhost:3000**. The admin area lives at **http://localhost:3000/admin**.

| Admin login | |
|---|---|
| Email | `admin@superzshop.bd` |
| Password | `SuperZ@2026` |

These credentials are seeded into a local SQLite file. Read the authentication section of the limitations document before deploying anything resembling this to the internet.

### Requirements

Node.js 22 or newer (the project uses the built-in `node:sqlite` module, so there are **no native database dependencies to compile**). Python 3.11+ with `openpyxl` is needed only to rebuild the workbook.

---

## What is included

### Storefront — 22 pages

Home, Shop All (with category, price, tag and sort filters), Category, Product Details, Search, New Arrivals, Best Sellers, Featured Collections, Offers, Wishlist, Cart, Checkout, Order Confirmation, Order Tracking, About, Contact, FAQ, Shipping, Returns, Privacy and Terms, all bilingual in English and Bangla.

- **Catalogue:** 225 products across 15 categories, unique SKUs (`SZS-{CAT}{NN}-{NNN}`), variants by size, colour and style (1,028 in total), specs, tags, and featured / trending / new-arrival / best-seller flags.
- **Shopping:** persistent cart and wishlist, variant selection, stock validation, coupon codes, checkout with Bangladeshi district and area, cash on delivery only, unique order numbers, order history and order tracking.
- **Inventory:** automatic deduction on order, restoration on cancellation.

### Admin — protected staff area

Dashboard KPIs, product management, category management, inventory adjustment with movement history, order management with status transitions, customer list, coupons, banners, sales reports, a contribution-based P&L view, and CSV export (products, orders, order items, customers, inventory, profit).

### Business workbook

`docs/SUPER-Z-SHOP-business-plan.xlsx` — 17 sheets, 13,551 live formulas, 10 charts, verified to zero formula errors.

Covers market research with sources and dates, a 225-product catalogue, per-SKU unit economics (landed cost → gross profit → contribution → break-even), a research and supplier verification tracker, three startup budget scenarios (৳3,000 / ৳5,000 / ৳10,000), inventory, sales tracking, marketing and ROAS, six-month cash flow and P&L, risk scoring, a 30-day launch plan, and a sources register.

Rebuild it with:

```bash
pip install --break-system-packages openpyxl     # once
npm run workbook
```

---

## Deploying to Vercel

Read this before pointing a Vercel project at this repository — there are two
things that will bite, and both have a documented answer.

**1. Deploy the right branch.** This project lives on `arena/42d55d38-e-commerce`,
not on `main`. `main` is still the initial commit. A Vercel project left on
`main` builds a repository with no application in it and every URL answers
`404 NOT_FOUND`. Set **Settings → Git → Production Branch** to the branch above
(or merge it into `main`) — that single change is usually the whole fix.

**2. A serverless filesystem is read-only, so the database is built at build time.**
`npm run build` now runs `node scripts/ensure-db.mjs` first, which creates and
seeds `db/super-z-shop.db` if it is missing. Next traces that file into the
server bundle (`outputFileTracingIncludes`), and at runtime `src/lib/db.ts`
copies it into `os.tmpdir()` because SQLite cannot write to the bundle. No
database configuration, no environment variables and no native modules are
needed.

What that means in practice, stated plainly:

- **Reads** (browsing, searching, filters, product pages) work normally.
- **Writes** (placing an order, adjusting stock in admin) land in that serverless
  instance's own copy. Another instance will not see them, and they are lost when
  the instance recycles. This build is a demonstration of the storefront, not a
  shop that can take real orders — see
  [KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md), which has always said a real
  database is required before trading.
- Builds are reproducible: every deploy reseeds from the same catalogue JSON, so
  no deployment drifts from another.

For a deployment that genuinely persists writes, replace `src/lib/db.ts` and
`src/lib/repo.ts` with a managed Postgres instance. Nothing else in the app
touches SQLite directly.

### Environment variables (all optional)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_PATH` | `db/super-z-shop.db` | Where the seeded file lives in the bundle |
| `DATABASE_WRITABLE_PATH` | `os.tmpdir()/super-z-shop/` | Where the writable copy is made (set this to a mounted volume if you have one) |
| `ADMIN_SESSION_SECRET` | insecure local default | **Set this in production.** Signs the admin session cookie |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Origin used for canonical URLs, the sitemap and OG images — set it to the deployment URL or SEO metadata will point at localhost |

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` / `npm run start` | Production build and serve |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run db:reset` | Drop and recreate the schema |
| `npm run db:seed` | Seed the catalogue, orders and admin user |
| `npm run db:verify` | 25 offline data-integrity checks |
| `npm run workbook` | Rebuild the `.xlsx` from `scripts/research_data.py` |
| `node scripts/qa/run-all.mjs` | Run all four QA suites (needs a running server) |

---

## Verification

**136 / 136 checks pass** against the production build. Full detail in [docs/QA-REPORT.md](docs/QA-REPORT.md).

```
Database integrity .......... 25/25
Route smoke tests ........... 43/43
Business logic flows ........ 35/35
Browser action flows ........ 33/33
```

```bash
npm run build && npm run start      # terminal 1
node scripts/qa/run-all.mjs         # terminal 2
```

---

## Architecture

```
src/app/             storefront routes, server actions
src/app/admin/       login (public) and (dashboard) route group
src/lib/             db access, repositories, auth, session, reports
src/components/      UI, catalogue, admin components
db/migrations/       SQL schema
data/catalogue/      generated product, category and location data
scripts/             seeders, QA harnesses, workbook builder
```

**Data layer:** local SQLite through Node's built-in driver, wrapped in a small typed repository layer. Row results are normalised so `null`-prototype objects never leak into React.

**Auth:** scrypt password hashing, an HMAC-signed httpOnly cookie, a route gate for `/admin/*` and `/api/export/*`, and a per-action authorisation check. A single-account staff login — replace it with a maintained identity provider before opening admin access to the internet.

**Catalogue generation:** `scripts/build_catalogue.py` produces the product data and `scripts/build_photos.py` derives 225 product photographs from ten generated studio line-up sheets (automatic background detection, connected-component cut-out, white balance, square pad, unsharp). Because the seed reads the same JSON, the site and the workbook can never disagree about a SKU, a price or a cost.

---

## Interface: Rokomari-family retail system

A dense, blue-and-white storefront built on the Rokomari reading rhythm — generous category browse, price-forward tiles, a persistent trust strip — with eBay's breadcrumb-led clarity. One token set drives every page, in both light and dark themes.

### Colour and theme

| Token group | Light | Dark |
|---|---|---|
| Page / surface / surface-2 | `#f2f4f8` / `#ffffff` / `#f6f8fb` | `#0b1120` / `#131c30` / `#1a2438` |
| Ink / soft / mute | `#14203a` / `#3d4a63` / `#6b7891` | `#eef2fa` / `#b9c4d8` / `#8695ae` |
| Brand / deep / soft / ink | `#1b4fd8` / `#123bab` / `#eaf0fe` / `#12359d` | `#3d74f2` / `#2a5bd6` / `#1a2b4d` / `#8fb2ff` |
| Hairlines | `#e2e7f0` / `#cbd4e3` | `#253148` / `#35435e` |

**Dark mode is a real theme, not an inversion filter.** Every surface, hairline and text colour is a CSS variable, so `bg-[var(--color-surface)]` resolves to white in light mode and slate in dark. The OS preference is honoured with no JavaScript at all (`prefers-color-scheme`), and an explicit choice is written to `localStorage` and applied by a tiny inline script *before first paint* — so a dark-mode visitor never sees a white flash. The header control cycles light → dark → system; the mobile drawer exposes all three.

### Primitives

| Primitive | Where | What it does |
|---|---|---|
| `.section-bar` / `.section-bar-title` | every panel | Uppercase 13px panel header on a hairline rule — the repeating unit of the layout. |
| `ListingHeader` / `ListingPanel` / `ListingSkeleton` | `components/catalog/ListingHeader.tsx` | Breadcrumb + title + count + right action, the grid panel, and the matching loading state. |
| `HeroSlider` | `components/home/HeroSlider.tsx` | Four-slide carousel: arrow keys, Home/End, swipe, dots, pause on hover/focus, respects `prefers-reduced-motion`. |
| `ProductGallery` | `components/catalog/ProductGallery.tsx` | Thumbnail + keyboard + swipe gallery on the product page, honestly labelled as one studio photograph shown in three framings. |
| `HeaderNav` | `components/layout/HeaderNav.tsx` | Desktop mega-menu: four featured category panels plus an all-categories panel, hover-with-delay, `aria-expanded`, Escape and outside-click close. |
| `MobileTabBar` | `components/layout/MobileTabBar.tsx` | Fixed five-tab app bar (Home / Shop / Saved / Cart / Account) with live badges and safe-area padding on `lg:hidden`. |
| `ProductGrid` (`dense`) | all listing pages | 2/3/4/6 columns, square tiles, brand-blue price, struck list price, `-N%` tag. |
| `ThemeToggle`, `ServiceWorkerBridge` | `components/layout/` | Theme control, and the offline banner + install prompt. |

Layout constants: sticky header offset `top-[132px]`, listing sidebar `210px`, product buy-box `[400px_1fr_290px]`, cart `[1fr_330px]`, checkout `[1fr_300px]`.

### Imagery

Eight studio photographs were generated for the hero and category banners, each shipped as three pre-cropped widths (1400×612, 860×430, 620×620) as progressive JPEG — 916 KB for all 24 files, served `immutable`.

All 225 product tiles use real studio photography, not illustration. Ten category line-up sheets are generated once (`public/photos/src/*.png`, 1408×768), then `scripts/build_photos.py` cuts each sheet into individual items automatically: it samples the background from the corner patches, builds a colour-distance mask, labels connected components with `scipy.ndimage`, rejects fragments by area/side/fill ratio, pads each item to a square with a margin, corrects white balance against the sheet's own highlight gain, applies an unsharp pass and writes a 760 px mozjpeg JPEG. Each sheet yields 3–9 clean items (69 crops in total), cycled within a category — 7.3 MB for all 225 files at 760×760. Items whose drawing runs off the canvas edge are rejected rather than shipped with a cut-off strap, and each crop is composed from the item's own bounding box only, never from a padded window that could include a neighbour.

**The photography is honest about itself.** These are real photographs of real product categories, not photographs of the exact unit a customer would receive, and the gallery caption says exactly that on every product page. `docs/KNOWN-LIMITATIONS.md` records the same boundary.

### Mobile first

Single-column by default and enhanced upward: `grid-cols-2` tiles at 360px, `sm:`/`md:`/`lg:` breakpoints for 3/4/6 columns, a bottom-sheet filter drawer, and a drawer-based mobile menu.

On phones the chrome becomes app-like: a **fixed five-tab bottom bar** (Home / Shop / Saved / Cart / Account) with live cart and wishlist badges, sitting above `env(safe-area-inset-bottom)` on notched devices, while `<main>` reserves matching bottom padding so nothing is ever hidden behind it. From `lg:` upward that bar disappears and the **boxed desktop header** takes over — a floating card with a utility strip, search row, and a full mega-menu row of real icons and dropdown panels. Touch targets grow to 44px on coarse pointers via `@media (pointer: coarse)`, and nothing informational drops below 11px on small screens. The hero is fixed-height and crops rather than pushing content down.

### Offline and installable

`public/sw.js` + `manifest.webmanifest` make the store installable and give it a genuine offline mode:

- **Navigations** — network first, cache fallback, then a designed `/offline` page. Orders and stock are never served stale when the network is up.
- **Static assets** — stale-while-revalidate. Safe because they are content-hashed.
- **Never cached** — `/api/`, `/admin`, `/checkout`, `/cart`, `/account`, `/order/`. A cached price or a cached POST would be a bug, not a feature.
- An **offline banner** appears the moment the connection drops, so a cached page is never mistaken for a live one.

### SEO

| Feature | Implementation |
|---|---|
| Canonicals | Every indexable route via `alternates.canonical`, absolute through `NEXT_PUBLIC_SITE_URL`. |
| Sitemap | `src/app/sitemap.ts` — 262 URLs (7 static + 15 categories + 225 products + collections + policy pages) with real `lastModified`. |
| robots.txt | `src/app/robots.ts` — storefront allowed, admin/cart/checkout/account/order disallowed, sitemap declared. |
| Social cards | `src/app/opengraph-image.tsx` renders a 1200×630 card at build time; product pages use their own product image. |
| Structured data | `OnlineStore` (root), `Product` + `Offer` + `BreadcrumbList` (product), `BreadcrumbList` (category, shop), `WebSite` + `SearchAction` (home). |
| PWA metadata | `manifest`, apple-touch-icon, `theme-color` per colour scheme, `applicationName`, `formatDetection`. |

**No `aggregateRating` and no `review` schema anywhere.** The store has no reviews; emitting rating markup for them would be both dishonest and a Google policy violation. That absence is deliberate, and it is why the meta descriptions talk about delivery and stock instead of "5 stars".

---

## Design principles applied

- **No invented facts.** Supplier names, phone numbers, wholesale prices and demand figures that could not be verified are written as `NOT VERIFIED` rather than filled in plausibly. The workbook's sources sheet records every external claim with its URL, date and caveat.
- **No fake social proof.** There are no invented reviews, testimonials, ratings or scarcity messages anywhere in the storefront.
- **Photography that names its own limits.** Product imagery is genuine studio photography, but it is category-representative rather than a photograph of the exact SKU, and every product page says so. No stock photo is passed off as a specific supplier's goods.
- **Honest terminology.** Gross profit and contribution are never called net profit, in the workbook or in the admin reports.
- **No real money.** Checkout creates an order record only. Cash on delivery is the single method; no payment gateway is connected and no courier is contacted.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/QA-REPORT.md](docs/QA-REPORT.md) | Every test, every result, and the eight bugs found and fixed |
| [docs/KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md) | What this build deliberately does not do, and what it would take to go live |
| `docs/SUPER-Z-SHOP-business-plan.xlsx` | The business plan |
