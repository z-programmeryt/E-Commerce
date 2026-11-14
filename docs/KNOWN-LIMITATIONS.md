# Known Limitations

This document exists because a build that hides its gaps is more dangerous than one that names them. Everything below is a deliberate boundary of this build, not an unfinished task that was quietly dropped.

---

## 1. Data that is not verified

| Data | Status | What "verified" would require |
|---|---|---|
| Wholesale cost of all 225 SKUs | **NOT VERIFIED** | Three dated quotes per SKU from named shops in Chandni Chowk, Gausia or New Market |
| Retail prices | **NOT VERIFIED** | A competitor price survey with listing URLs and observation dates (sheet 5 is built for this) |
| Demand for any product | **NOT VERIFIED** | Real sales history, which cannot exist before launch |
| Supplier names, owners, phone numbers | **NOT VERIFIED** | Physical market visits with recorded contacts (sheet 15 is the checklist) |
| Market size figures | **SECONDARY** | Primary research or a named statistical agency |
| Courier rates and COD fees | **SECONDARY** | Signed rate cards from Pathao, Redfoot, Steadfast or RedX |
| Ad cost per delivered order | **ESTIMATE** | Your own campaign data after the first 50 orders |

Every product row carries `priceStatus = 'unverified'` in the database, and the product page says so. **Do not treat any price in this store as a real price.**

No supplier, phone number, address beyond a published market name, review, rating or testimonial has been invented anywhere in this project. Where something was unknown it says so.

---

## 2. Commerce

**Cash on delivery only.** No card, bKash or Nagad integration exists. The merchant fee assumptions in the workbook exist to model prepaid *if* you add it later — nothing is charged today.

**No payment gateway.** Checkout validates the form, checks stock, writes an order to local SQLite and shows a confirmation. No money moves. There is no order in any real system.

**No courier integration.** Order statuses (`pending → confirmed → packed → shipped → delivered`, plus `cancelled` and `returned`) are manual admin transitions. No parcel is booked, no tracking number is generated, and the "tracking" page reads local order status only.

**No email or SMS.** Order confirmation is an on-screen page. Nothing is sent.

**Single currency, single locale.** BDT only. English and Bangla copy are both present, but there is no locale switcher and no translated URL structure.

**One tax assumption: none.** No VAT, no customs duty on imported tech items, and no BIN handling. If you cross the turnover threshold this becomes a real problem, correctly flagged as a risk on the risk sheet.

---

## 3. Security and authentication

**The admin login is single-factor and single-account.** It uses scrypt hashing and an HMAC-signed httpOnly cookie, which is better than a hardcoded password but still not production-grade:

- **No rate limiting.** Credentials can be attacked without throttling.
- **No CSRF tokens.** Protection relies on cookie `SameSite` behaviour.
- **No password reset, no 2FA, no session revocation**, no audit log of admin actions.
- **One seeded admin account**, created by the seed script, sharing a single HMAC secret from an environment variable.
- **The credentials are published in the README and printed on the login page.** They are not secret.
- **No role separation.** Any admin session can do everything, including deleting products.

Before this touches a real customer, replace authentication entirely — use a maintained identity provider or a framework with a reviewed auth implementation.

**Data protection.** Customer records (name, phone, address) live in an unencrypted local SQLite file. There is no encryption at rest, no retention policy, no data-export or deletion workflow, and no consent record. Bangladesh's data-protection expectations, and any future regulation, are not addressed.

---

## 4. Infrastructure

**Serverless deployments get a per-instance copy of the database.** On Vercel (or any platform with a read-only filesystem) the seeded SQLite file is copied into the instance's temp directory at first use so SQLite can open it read-write. Browsing works normally, but an order placed on one instance is invisible to another and is discarded when the instance recycles. That is acceptable for a storefront demonstration and unacceptable for a shop taking real orders — swapping `src/lib/db.ts` and `src/lib/repo.ts` for a managed Postgres instance is the only fix, and nothing else in the app touches SQLite.

**SQLite, not a server database.** Fine for one process and a single-store deployment. It will not survive multiple app instances, has no connection pooling, no replication and no point-in-time recovery. `node:sqlite` is also marked experimental in Node — acceptable here because the alternative was a native module that would not build without a toolchain.

**No migrations runner.** `db/migrations/001_init.sql` is applied by `db:reset`, which drops everything and rebuilds. There is no versioned, incremental, non-destructive migration path. Adding a column means editing the init file and re-seeding.

**Local file storage.** Product photographs are pre-rendered JPEGs in `public/products/` (800 px, served `immutable`). There is no upload pipeline, no CDN, no on-demand image optimisation (`images.unoptimized` is on) and no ability for an admin to upload a real photograph — the `product_images` table is written by the seed and the admin action only ever sets a fallback image.

**Not load-tested.** No horizontal scaling, no caching layer, no queue for order processing. Performance under concurrent traffic is unmeasured.

**No backups, no monitoring, no error tracking, no uptime alerting.** Errors surface as a Next.js error page and a server log.

---

## 5. The build's own boundaries

**Product photography is category-representative, not SKU-specific.** The 225 tiles are genuine studio photographs produced from ten generated line-up sheets (see `scripts/build_photos.py`), but a given tile shows a product of that type rather than the exact unit a customer would receive. Each product page states this in the gallery caption. SKU-specific supplier photography has to be shot and uploaded before those listings go live, which is the single largest imagery gap in this build.

**No reviews or ratings.** There is no review system, and none was faked. The product page shows no stars because inventing them would be dishonest.

**Dark mode is untested on real hardware.** The theme resolves through CSS variables and the compiled stylesheet was inspected to confirm both palettes are emitted, but with no browser runtime in this sandbox the dark palette has not been eyeballed on a device. Contrast ratios were chosen to clear WCAG AA for body text (`#eef2fa` on `#131c30` is ~15:1), but tinted badges and the flash-sale rail deserve a visual pass before launch.

**Offline mode is honest about its limits.** Pages you have already visited open from the cache; anything else falls back to `/offline`. Placing an order needs a connection because stock is checked and written server-side. Cart and wishlist survive offline because they live in this browser, but a cached product page can show a price or a stock figure that has since changed — the offline banner says exactly that.

**The service worker caches per browser, not per user.** On a shared device, `/account` and `/order/` are excluded from caching for that reason, but `/cart` content is hydrated from the cookie, so it is never served from a static cache entry.

**Banner photography is generic studio art.** The hero and category banners are generated studio photographs of *product categories*, not of this catalogue's specific SKUs, and they are used as decorative banners only. Product tiles and the product gallery use their own studio photographs, captioned as category-representative.

**The bottom tab bar and mega-menu are markup-verified.** The fixed five-tab mobile bar, its safe-area padding and the desktop mega-menu panels are deterministic and compile cleanly, but `iOS` safe-area behaviour on a notched device and dropdown hover timing have not been exercised on real hardware in this sandbox.

**The interface is verified by markup, not by screenshot.** No browser runtime exists in this build sandbox, so the UI was checked with HTML probes and a CSS token audit rather than visual regression tests. The structure is deterministic and compiles cleanly, but pixel-level polish (small-screen wrapping, unusually long product names) has not been eyeballed in a real browser and should get a pass on a device before anyone calls it launch-ready.

**Density is deliberate.** The storefront packs more products per screen than its earlier boutique layout — smaller type, 1px hairlines, six-column grids on wide screens. That is the marketplace convention being copied, but it trades away breathing room and some largeness of type; the earlier, roomier styling is a real design alternative, not a mistake that was fixed.

**No customer accounts with passwords.** Customers are identified by a cookie-based session, not a login. Order history is tied to that cookie, so clearing cookies loses access to past orders.

**Coupons are seeded examples.** `WELCOME10`, `EID500`, `FREESHIP` and `SUPERZ15` are sample campaigns with working validation rules and usage caps, created by the seed script.

**One warehouse, one country.** Delivery is priced for 12 metro districts plus a flat rest-of-Bangladesh rate. There is no multi-warehouse logic, no international shipping and no per-upazila pricing.

---

## 6. The workbook's boundaries

**Prices are indicative.** The workbook and the store share one catalogue file, so they agree with each other — but both rest on estimated costs, not supplier quotations.

**Contribution is not profit.** The workbook is explicit about this everywhere it matters, and so is the admin P&L. Fixed costs (rent, salaries, utilities, financing) are excluded from unit economics by design, and default to zero in the calculator.

**The allocation model is a plan, not an optimiser.** The launch roadmap funds SKUs cheapest-first up to a depth cap. It is transparent and auditable, but it is not solving for maximum expected profit, because there is no demand data to optimise against.

**No live data connection.** Editing a price in Excel does not change the website, and vice versa. Both read the same source JSON at build time. Regenerate the seed data to reconcile them.

---

## 7. What going live would actually require

Not a checklist to tick off casually — this is a genuine rebuild of the foundation, roughly in dependency order.

1. **Verified supplier quotations** for every SKU you intend to sell, with dated paperwork. Until this exists, every other number in the plan is a guess.
2. **A production database** (managed PostgreSQL), with real versioned migrations, backups and a restore drill.
3. **Reviewed authentication** for admin access, with roles, audit logging and rate limiting; customer accounts with hashed credentials and password reset.
4. **A payment gateway** with proper webhook handling and idempotency — and, before that, the business registrations (TIN, BIN, trade licence) those gateways require.
5. **Courier API integration** with webhook status updates, so order status is driven by reality rather than by an admin clicking a button.
6. **Real product photography** and a managed image pipeline with a CDN.
7. **Transactional email and SMS** for confirmations and delivery updates.
8. **Observability**: structured logging, error tracking, uptime monitoring, and an alert when the checkout fails.
9. **Legal and compliance work**: privacy policy reviewed by a lawyer, data retention and deletion, consumer-protection compliance, and VAT registration before crossing the threshold.
10. **Load and security testing**, including a penetration test of the checkout and admin surfaces, before taking a single real order.
11. **Customer support process** — returns, disputes and COD reconciliation need an owner and a documented flow.

Until all of that is done, this project is what it says on the cover: **a working storefront and a planning tool**, with every unverified number labelled as such.
