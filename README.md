# SUPER Z SHOP

Premium everyday essentials for Bangladesh. A complete, working e-commerce demo — storefront, checkout, admin — plus a 17-sheet business-planning workbook that prices the business honestly.

**Everything runs locally with no paid services.** No cloud database, no payment gateway, no courier account, no external API keys.

> **Demo software with unverified data.** Every price in the catalogue is an estimate pending supplier quotations and is labelled `unverified` in the database and on the product page. Admin authentication is a demo mechanism, not production security. See [KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md).

---

## Quick start

```bash
npm install
npm run db:reset     # create the schema
npm run db:seed      # 225 products, 1,028 variants, 18 orders, coupons, banners
npm run dev          # http://localhost:3000
```

Open **http://localhost:3000**. The admin area lives at **http://localhost:3000/admin**.

| Demo admin login | |
|---|---|
| Email | `admin@superzshop.bd` |
| Password | `SuperZ@2026` |

These credentials are seeded into a local SQLite file. They are printed in the UI and are not a secret — read the authentication section of the limitations document before deploying anything resembling this to the internet.

### Requirements

Node.js 22 or newer (the project uses the built-in `node:sqlite` module, so there are **no native database dependencies to compile**). Python 3.11+ with `openpyxl` is needed only to rebuild the workbook.

---

## What is included

### Storefront — 22 pages

Home, Shop All (with category, price, tag and sort filters), Category, Product Details, Search, New Arrivals, Best Sellers, Featured Collections, Offers, Wishlist, Cart, Checkout, Order Confirmation, Order Tracking, About, Contact, FAQ, Shipping, Returns, Privacy and Terms, all bilingual in English and Bangla.

- **Catalogue:** 225 products across 15 categories, unique SKUs (`SZS-{CAT}{NN}-{NNN}`), variants by size, colour and style (1,028 in total), specs, tags, and featured / trending / new-arrival / best-seller flags.
- **Shopping:** persistent cart and wishlist, variant selection, stock validation, coupon codes, checkout with Bangladeshi district and area, cash on delivery only, unique order numbers, order history, and demo tracking.
- **Inventory:** automatic deduction on order, restoration on cancellation.

### Admin — protected demo area

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

**Auth:** scrypt password hashing, an HMAC-signed httpOnly cookie, a route gate for `/admin/*` and `/api/export/*`, and a per-action authorisation check. Adequate for a local demo; unsuitable for production as-is.

**Catalogue generation:** `scripts/build_catalogue.py` produces the product data and `scripts/build_images.py` renders 225 deterministic SVG placeholders. Because the seed reads the same JSON, the site and the workbook can never disagree about a SKU, a price or a cost.

---

## Interface: marketplace layout system

The storefront is styled as a dense marketplace — the structure people already know from Daraz and eBay, with the warmer reading rhythm of Rokomari — rather than a boutique catalogue. Everything ships from one small set of primitives so the experience never shifts shape between sections.

| Primitive | Where | What it does |
|---|---|---|
| Design tokens (`src/app/globals.css`) | every page | Orange brand ramp (`#f57224` → `#b8480a`), `#f5f5f5` page paper, 14px/1.5 body, 1px `#e8e8e8` hairlines, `--radius-card` 6px. |
| `.section-bar` / `.section-bar-title` | every white panel | Uppercase 13px panel header on a hairline rule — the repeating unit of the whole layout. |
| `ListingHeader` / `ListingPanel` / `ListingSkeleton` | `components/catalog/ListingHeader.tsx` | Breadcrumb + title + count + right action, the white grid panel, and the matching loading state. |
| `ProductGrid` (`dense`) | all listing pages | 2/3/4/6 columns, square `object-contain` tiles, orange price, struck list price, `-N%` tile tag. |
| `CartLineItem`, `CouponForm`, `CheckoutForm`, `ProductDetailPanel`, `Pagination`, `EmptyState` | shared | Flat 1px controls, 28px steppers, `section-bar` grouping, no rounded-pill chrome. |

Layout constants: sticky offsets `top-[132px]`, listing sidebar `210px`, product buy-box `[400px_1fr_290px]`, cart `[1fr_330px]`, checkout `[1fr_300px]`.

**What the denser UI still refuses to do.** No star ratings, no "sold" counters, no review sections, no countdown urgency beyond the fixed 24-hour flash-sale cycle, no supplier names or phone numbers invented to fill a box. Stock numbers on the product page are the live rows in the database, and placeholder product art says so on the page.

---

## Design principles applied

- **No invented facts.** Supplier names, phone numbers, wholesale prices and demand figures that could not be verified are written as `NOT VERIFIED` rather than filled in plausibly. The workbook's sources sheet records every external claim with its URL, date and caveat.
- **No fake social proof.** There are no invented reviews, testimonials, ratings or scarcity messages anywhere in the storefront.
- **Labelled placeholders.** Product imagery is generated SVG art clearly presented as placeholder, never a random or misleading photograph.
- **Honest terminology.** Gross profit and contribution are never called net profit, in the workbook or in the admin reports.
- **No real money.** Checkout creates a local order record only. No payment is taken and no courier is contacted.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/QA-REPORT.md](docs/QA-REPORT.md) | Every test, every result, and the eight bugs found and fixed |
| [docs/KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md) | What this demo deliberately does not do, and what it would take to go live |
| `docs/SUPER-Z-SHOP-business-plan.xlsx` | The business plan |
