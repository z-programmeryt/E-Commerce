# Known Limitations

This document exists because a demo that hides its gaps is more dangerous than one that names them. Everything below is a deliberate boundary of this build, not an unfinished task that was quietly dropped.

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

**The admin login is a demo.** It uses scrypt hashing and an HMAC-signed httpOnly cookie, which is better than a hardcoded password but still not production-grade:

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

**SQLite, not a server database.** Fine for one process and a demo. It will not survive multiple app instances, has no connection pooling, no replication and no point-in-time recovery. `node:sqlite` is also marked experimental in Node — acceptable here because the alternative was a native module that would not build without a toolchain.

**No migrations runner.** `db/migrations/001_init.sql` is applied by `db:reset`, which drops everything and rebuilds. There is no versioned, incremental, non-destructive migration path. Adding a column means editing the init file and re-seeding.

**Local file storage.** Product images are generated SVGs in `public/products/`. There is no upload pipeline, no CDN, no image optimisation (`images.unoptimized` is on) and no ability for an admin to upload a real photograph.

**Not load-tested.** No horizontal scaling, no caching layer, no queue for order processing. Performance under concurrent traffic is unmeasured.

**No backups, no monitoring, no error tracking, no uptime alerting.** Errors surface as a Next.js error page and a server log.

---

## 5. The demo's own boundaries

**Product images are placeholders.** 225 deterministic SVG illustrations, deliberately abstract, labelled as placeholders in the UI. They are not photographs of the actual goods and must not be presented as such — real listings need real photography.

**No reviews or ratings.** There is no review system, and none was faked. The product page shows no stars because inventing them would be dishonest.

**No customer accounts with passwords.** Customers are identified by a cookie-based session, not a login. Order history is tied to that cookie, so clearing cookies loses access to past orders.

**Coupons are demos.** `WELCOME10`, `EID500`, `FREESHIP` and `SUPERZ15` are seeded examples with working validation rules, not live marketing campaigns.

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

Until all of that is done, this project is what it says on the cover: **a working demonstration and a planning tool**, with every unverified number labelled as such.
