# QA Report — SUPER Z SHOP

**Run date:** 13 November 2026
**Target:** production build (`npm run build` → `npm run start`) on `http://0.0.0.0:3000`
**Branch:** `arena/42d55d38-e-commerce`
**Result:** **136 / 136 checks passed, 0 failed**

```
Database integrity .......... 25/25   PASS
Route smoke tests ........... 43/43   PASS
Business logic flows ........ 35/35   PASS
Browser action flows ........ 33/33   PASS
```

Reproduce with:

```bash
npm run db:reset && npm run db:seed
npm run build && npm run start     # in one terminal
node scripts/qa/run-all.mjs        # in another
```

---

## 1. Database integrity — 25/25

`scripts/verify-db.mjs`, offline checks against `db/super-z-shop.db`.

| Check | Result |
|---|---|
| 225 products present | 225 |
| 15 categories present | 15 |
| Every product belongs to a category | 0 orphans |
| Every product has at least one variant | 0 without |
| Every product has an image record | 0 without |
| Unique product SKUs / slugs | 225 unique each |
| Unique variant SKUs | 1,028 unique |
| No negative stock | 0 rows |
| Retail price above zero | all 225 |
| Sale price always below retail | 0 violations |
| Wholesale cost below retail | 0 rows exceed |
| All prices flagged `unverified` | 225 |
| Every order has line items | 0 orphans |
| Order totals reconcile | 0 mismatches |
| Order subtotals equal line-item sums | 0 mismatches |
| Order numbers unique | 18 unique |
| All orders cash-on-delivery | 18/18 |
| Admin account exists | yes |
| Admin password hashed, not plaintext | scrypt |
| Coupons / settings / inventory movements seeded | 4 / 1 / 300+ |
| Each category holds 15 products | 15 × 15 |
| Stock units available | 15,298 |

**Snapshot:** 225 products · 1,028 variants · 15,298 stock units · 18 orders.

---

## 2. Route smoke tests — 43/43

`scripts/qa-e2e.mjs`, real HTTP against the running server.

All storefront routes return **200**: `/`, `/shop` (plus category/sort/price filters), `/search` (with results and with zero results), `/new-arrivals`, `/best-sellers`, `/offers`, `/collections/featured`, `/collections/eid-edit`, `/wishlist`, `/cart`, `/account`, `/order/track` (blank and with an order number), all seven static pages (about, contact, FAQ, shipping, returns, privacy, terms), and sample category pages (mens-fashion, watches, home-decor, seasonal-collections).

| Check | Result |
|---|---|
| All 225 product pages render | 0 failures |
| Unknown product returns 404 | HTTP 404 |
| Unknown category returns 404 | HTTP 404 |
| Admin dashboard redirects when signed out | HTTP 307 |
| CSV export rejects anonymous access | HTTP 401 |
| Admin login page reachable | HTTP 200 |
| Catalogue holds 225 rows with unique SKUs and slugs | 225 / 225 / 225 |

### Three bugs found and fixed during this run

**1. Not-found pages returned HTTP 200.** A `loading.tsx` at the application root wrapped every route in a Suspense boundary. Next.js then streamed a `200` shell immediately, so `notFound()` — which fires after the data fetch resolves — could only swap in the not-found UI, never the status code. Search engines and uptime monitors would have seen a soft 404 for every bogus product URL.

The root `loading.tsx` was removed and loading states added only to routes that never call `notFound()`: `/shop`, `/search`, `/best-sellers`, `/new-arrivals`, `/offers`, `/wishlist`, `/cart`, `/account`. Dynamic routes (`/product/[slug]`, `/category/[slug]`, `/collections/[slug]`, `/pages/[slug]`, `/order/confirmation/[orderNumber]`) keep correct status codes. Verified: all four dynamic 404 cases now return 404, and all eight loading-enabled routes still return 200.

**2. Cookie writes during page render.** `/cart` and `/checkout` called the cookie-*writing* `cartToken()` during server rendering, which Next.js rejects (`Cookies can only be modified in a Server Action or Route Handler`). The error was being swallowed into an error digest on every fresh visit — the pages still looked fine because a second request found the cookie already set. Both pages now use the read-only accessor and treat a missing token as an empty cart. Only server actions write cookies.

**3. The e2e harness carried a known-broken action driver.** `qa-e2e.mjs` invoked server actions by scraping `$ACTION_ID_*` and POSTing a JSON body. Form-bound actions (`placeOrderAction`, `loginAction`) reject that encoding, which is why this suite previously reported two failures and then crashed with `No action id found`. That capability now lives in `scripts/qa/actions.mjs`, which reads the build's action manifest and posts real `multipart/form-data`; `qa-e2e.mjs` is scoped to routes, rendering and data integrity.

---

## 3. Business logic flows — 35/35

`scripts/qa-flows.mjs`, direct database-level checks of the domain rules.

Cart add/update/remove, quantity capped to available stock, wishlist toggle and persistence, coupon validation (percentage with cap, flat amount, minimum spend, free shipping), delivery charge bands (৳70 inside Dhaka, ৳130 outside, free above ৳2,500), order-number generation and uniqueness, stock deduction on order, stock restoration on cancel, order status transitions, total maths (`subtotal − discount + delivery`), no orphaned variants, no duplicate SKUs, no negative stock.

---

## 4. Browser action flows — 33/33

`scripts/qa/actions.mjs`, real server actions driven over HTTP with a cookie jar — the closest possible substitute for a browser, since this sandbox has no browser runtime.

```
add variant to cart ................ SZS-ME00-001-WHI-M
cart row created with qty 2 ........ qty=2
cart page lists the item
update quantity .................... persisted as 3
quantity capped to available stock . qty=15, stock=15
wishlist toggle .................... 1 row persisted
checkout rejects invalid input ..... HTTP 200 (no order created)
checkout creates an order .......... 18 → 19 (HTTP 303)
order has unique SZS number ........ SZS-20261019
WELCOME10 discount applied ......... discount=300
order total maths correct .......... 32,550
inventory reduced by exact qty ..... 15 → 0 (ordered 15)
cart emptied after the order
admin login rejects wrong password . 303 → /admin/login?error=invalid
admin login accepts seeded login ... 303 → /admin
session cookie issued .............. szs_admin (httpOnly)
dashboard authorised + live metrics
admin pages × 9 .................... all HTTP 200
CSV export signed in ............... 226 rows, correct header
reports page ....................... contribution walk-forward present
```

Each run creates and then deletes its own QA orders, cart rows and wishlist entries, so repeated runs leave the database unchanged.

---

## 5. Build and type checks

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | clean, exit 0 |
| `npm run build` | succeeds, 35 route entries compiled (incl. 7 static policy pages) |
| `npm run db:verify` | 25/25 |
| `npm run workbook` | regenerates the 17-sheet `.xlsx` |

---

## 5b. Marketplace UI verification

The interface was rebuilt into a dense marketplace layout. Layout changes cannot be screenshot-verified in this sandbox (no browser runtime is installed), so verification was done with HTML string probes against the production server plus a static audit of the styling layer.

| Check | Method | Result |
|---|---|---|
| Every page renders after the restyle | `curl` status + byte size on 13 storefront routes + 8 loading routes | all 200; 62–253 KB each |
| Unknown product / category still 404 | `curl` | HTTP 404 (no soft 404s reintroduced) |
| No undefined CSS custom properties | `grep -rho "var(--color-*)" src/` vs the tokens declared in `globals.css` | **0 dangling references** |
| Shared layout primitives in use | `ListingHeader` / `ListingPanel` on shop, category, collections, offers, new arrivals, best sellers, wishlist, search, account | 9 pages |
| Loading states match the new layout | `ListingSkeleton` in 8 route-level `loading.tsx` files | 8/8 |
| Product tiles carry no fabricated social proof | probe for star/review/sold markup in card + PDP output | none present |
| Prices, coupons, stock, orders unchanged by the restyle | full QA run against the rebuilt server | 136/136 |

The restyle touched presentation only: no route, action, query or seed file changed, which the unchanged 136/136 result confirms.

---

## 5c. Theme, offline and SEO verification

Added with the blue/white Rokomari-family rebuild. There is still no browser runtime in this sandbox (Playwright's CDN is unreachable), so these are markup, stylesheet and HTTP-level checks rather than screenshots.

| Check | Method | Result |
|---|---|---|
| Both palettes emitted | grep the compiled CSS chunk for `:root[data-theme=dark]` and the `prefers-color-scheme` block | both present, 30+ variables each |
| No flash of light theme | inline `<script>` in `<head>` reads `localStorage` before first paint | present on every page |
| Theme defaults to the OS | `prefers-color-scheme: dark` media query in CSS, no JS required | verified in compiled CSS |
| Theme colour metas | `curl` `/` → two `theme-color` metas, light `#1b4fd8` dark `#0b1120` | 2/2 |
| Manifest is valid JSON and linked | `curl` + `rel="manifest"` probe | HTTP 200, 1,211 bytes, linked |
| Service worker served uncached | `/sw.js` → `Cache-Control: max-age=0, must-revalidate` | correct |
| Offline fallback exists | `/offline` route | HTTP 200 |
| Sitemap | `/sitemap.xml` | HTTP 200, **262 URLs** |
| robots.txt | `/robots.txt` | correct disallow list + sitemap line |
| OG image | `/opengraph-image` | HTTP 200, 1200×630 PNG |
| Canonicals | product / category / shop / offers | all absolute and self-referential |
| Product structured data | JSON-LD probe | `Product` + `Offer` + `BreadcrumbList`, **no** `aggregateRating`, **no** `review` |
| Category & shop structured data | JSON-LD probe | `BreadcrumbList` with correct depth |
| No dangling CSS variables | `grep -rho "var(--color-*)"` vs declared tokens | 0 undefined |
| Mobile touch targets | `@media (pointer: coarse)` block | `.btn` 44px, `.field` 44px |
| Catalogue/behaviour unchanged | full QA re-run after the restyle | **136/136** |

One bug found and fixed during this pass: `sitemap.ts` selected `updated_at` from `categories`, a column that does not exist, which made `/sitemap.xml` return HTTP 500. Discovered by probing the route rather than by the build, because the route is dynamic.

---

## 6. Workbook verification

The Excel workbook is verified separately because spreadsheet formulas fail silently — a `#REF!` in a business plan looks like a number until someone reads it.

`docs/SUPER-Z-SHOP-business-plan.xlsx` was recalculated in full with an independent formula engine (`formulas`, 1.3.4). `npm run workbook` now also self-checks every formula's parentheses before writing, so a broken build fails loudly:

| Metric | Result |
|---|---|
| Sheets | 17 (16 required + an Assumptions engine sheet) |
| Catalogue rows | 225 unique SKUs |
| Formulas evaluated | **13,551 cells** |
| Formula errors (`#REF!`, `#VALUE!`, `#DIV/0!`) | **0** |
| Charts | 10 |
| Parenthesis / reference sanity pass | 0 defects |

### Formula bugs found and fixed

1. **The assumptions engine wrote to column B while every dependent formula read column C.** Every cost, margin and break-even figure resolved to zero or `#DIV/0!`. Root cause: a hand-written cell map that drifted from the sheet layout. Fixed by generating the addresses programmatically from the row list, so the map cannot drift again.
2. **`COUNTA` ranges were off by one**, reporting 224 products instead of 225 and dropping the last catalogue row from every aggregate.
3. **`AVERAGE` over a column containing a text header** poisoned the margin KPI with `#DIV/0!`. Replaced with a revenue-weighted `SUM/SUM`.
4. **The gross-margin total multiplied two columns** (`SUMPRODUCT(K,I)/SUM(I)`) instead of summing gross profit — it reported 1,481% margin. Now `SUM(K)/SUM(I)` = 51.5%.
5. **A genuine circular reference** in the launch roadmap: tier totals summed depth × cost, while depth was capped by the tier total. Rewritten as a single-pass greedy allocation, cheapest landed cost first, which also matches how you would actually buy.
6. **The unit-economics calculator read column B (inputs) instead of column E (results)**, so contribution and break-even were silently wrong. Every reference is now explicit.
7. **The scenario block double-counted revenue** (`100*price*100`) and computed product cost on gross rather than kept units, understating the return-rate penalty. Rewritten to charge product cost only on kept units and add reverse logistics on returns.

### Economic finding the workbook surfaced

The original shortlist asked for 220 units costing **৳30,193** — more than three times the ৳10,000 capital and 18× the ৳3,000 plan. The roadmap now funds **one to two pieces per SKU, cheapest first**, and at ৳10,000 buys 12 SKUs / 23 units for ৳5,419, leaving ৳81 of the inventory budget and the full 45% reserve intact. This is the difference between a plan and a wish.

---

## 7. Known limitations

See `docs/KNOWN-LIMITATIONS.md`. In summary: no real payment gateway, no real courier integration, single-account admin authentication, local SQLite rather than a production database, and every price, cost and demand figure unverified pending supplier quotations.

---

## 8. What is *not* claimed

This report verifies that the software behaves as specified. It does **not** verify that:

- any product will sell,
- any supplier will honour a quoted price,
- the ৳95 assumed ad cost per delivered order is achievable,
- the 6% return rate matches reality.

Those are business questions the workbook asks you to answer with real data, and the storefront labels every price `unverified` for exactly that reason.
