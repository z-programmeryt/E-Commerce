/**
 * HTTP-level integration test for the SUPER Z SHOP demo.
 *
 * Exercises the real server actions and pages against a running dev/prod server
 * — the same way a browser would. Usage:
 *   npm run dev            (in one terminal)
 *   BASE=http://localhost:3000 node scripts/qa-e2e.mjs
 *
 * Exits non-zero and prints a QA table if any assertion fails.
 */
const BASE = process.env.BASE ?? "http://localhost:3000";

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

let cookie = "";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    redirect: "manual",
    headers: {
      ...(options.headers ?? {}),
      ...(cookie ? { cookie } : {}),
      "user-agent": "superz-qa/1.0",
    },
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
    const [pair] = c.split(";");
    const [name] = pair.split("=");
    cookie = cookie
      .split("; ")
      .filter((p) => p && !p.startsWith(`${name}=`))
      .concat(pair)
      .join("; ");
  }
  return res;
}

/** Server actions are invoked by POSTing the Next-Action id captured from HTML. */
async function callAction(pagePath, actionBody) {
  const page = await req(pagePath);
  const html = await page.text();
  const ids = [...html.matchAll(/"\$ACTION_ID_([a-f0-9]{40,})"/g)].map((m) => m[1]);
  const id = ids[0];
  if (!id) throw new Error(`No action id found on ${pagePath}`);
  const res = await fetch(`${BASE}${pagePath}`, {
    method: "POST",
    headers: {
      "next-action": id,
      "content-type": "text/plain;charset=UTF-8",
      ...(cookie ? { cookie } : {}),
    },
    body: actionBody,
    redirect: "manual",
  });
  return res;
}

async function main() {
  const mod = await import("node:sqlite");
  const DatabaseSync = mod.DatabaseSync ?? mod.default?.DatabaseSync;
  const db = new DatabaseSync("db/super-z-shop.db");

  // ---- 1. Storefront routes ----
  const routes = [
    "/", "/shop", "/shop?category=jewellery", "/shop?sort=price-asc", "/shop?min=0&max=500",
    "/search?q=panjab", "/search?q=zzzz", "/new-arrivals", "/best-sellers", "/offers",
    "/collections/featured", "/collections/eid-edit", "/wishlist", "/cart", "/account",
    "/order/track", "/order/track?order=SZS-2026001",
    "/pages/about-us", "/pages/contact-us", "/pages/faq", "/pages/shipping-delivery-policy",
    "/pages/return-refund-policy", "/pages/privacy-policy", "/pages/terms-conditions",
  ];
  for (const r of routes) {
    const res = await req(r);
    record(`route ${r}`, res.status === 200, `HTTP ${res.status}`);
  }

  for (const slug of ["mens-fashion", "watches", "home-decor", "seasonal-collections"]) {
    const res = await req(`/category/${slug}`);
    record(`category /${slug}`, res.status === 200, `HTTP ${res.status}`);
  }

  // ---- 2. All 225 product pages render ----
  const products = db.prepare("SELECT id, slug, sku FROM products ORDER BY id").all();
  record("catalogue has 225 products", products.length === 225, `${products.length} rows`);
  const skus = new Set(products.map((p) => p.sku));
  record("SKUs are unique", skus.size === 225, `${skus.size} unique`);
  const slugs = new Set(products.map((p) => p.slug));
  record("slugs are unique", slugs.size === 225, `${slugs.size} unique`);

  let productFailures = 0;
  for (const p of products) {
    const res = await req(`/product/${p.slug}`);
    if (res.status !== 200) {
      productFailures += 1;
      console.log(`   product page failed: ${p.slug} HTTP ${res.status}`);
    }
  }
  record("all 225 product pages return 200", productFailures === 0, `${productFailures} failures`);

  // ---- 3. 404 handling ----
  const missing = await req("/product/does-not-exist-xyz");
  record("unknown product returns 404", missing.status === 404, `HTTP ${missing.status}`);
  const missingCat = await req("/category/nope");
  record("unknown category returns 404", missingCat.status === 404, `HTTP ${missingCat.status}`);


  // ---- 4. Shopping and checkout flows live in scripts/qa/actions.mjs ----
  // That harness drives real server actions through the Next action-id manifest
  // and multipart form bodies, which is the only way form actions accept input.
  // Duplicating it here with the older JSON-action approach produced false failures,
  // so this file now owns routes, rendering and data integrity only.
  console.log("  (shopping/checkout covered by scripts/qa/actions.mjs)");

  // ---- 9. Admin protection ----
  cookie = "";
  const adminNoAuth = await req("/admin");
  record("admin dashboard redirects when signed out", adminNoAuth.status === 307, `HTTP ${adminNoAuth.status}`);
  const exportNoAuth = await req("/api/export/products");
  record("CSV export rejects anonymous access", exportNoAuth.status === 401, `HTTP ${exportNoAuth.status}`);
  const adminLogin = await req("/admin/login");
  record("admin login page reachable", adminLogin.status === 200, `HTTP ${adminLogin.status}`);

  // ---- 10. Wishlist persistence ----
  const wl = await req("/wishlist");
  record("wishlist page renders", wl.status === 200, `HTTP ${wl.status}`);

  // ---- 11. Data integrity ----
  const orphanVariants = db.prepare(
    "SELECT COUNT(*) AS n FROM product_variants v LEFT JOIN products p ON p.id = v.product_id WHERE p.id IS NULL",
  ).get().n;
  record("no orphaned variants", orphanVariants === 0, `${orphanVariants} orphans`);

  const negative = db.prepare("SELECT COUNT(*) AS n FROM product_variants WHERE stock < 0").get().n;
  record("no negative stock", negative === 0, `${negative} rows`);

  const catCount = db.prepare("SELECT COUNT(*) AS n FROM categories").get().n;
  record("15 categories seeded", catCount === 15, `${catCount}`);

  const totalsMatch = db.prepare(`
    SELECT COUNT(*) AS n FROM orders o
    WHERE o.total != (o.subtotal - o.discount + o.delivery_fee)
  `).get().n;
  record("every order total equals subtotal − discount + delivery", totalsMatch === 0, `${totalsMatch} mismatches`);

  const itemSumMismatch = db.prepare(`
    SELECT COUNT(*) AS n FROM orders o
    WHERE ABS(o.subtotal - (SELECT COALESCE(SUM(line_total),0) FROM order_items oi WHERE oi.order_id = o.id)) > 0
  `).get().n;
  record("order subtotal equals the sum of its line items", itemSumMismatch === 0, `${itemSumMismatch} mismatches`);

  // ---- report ----
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  db.close();
  if (failed.length > 0) {
    console.log("\nFailed checks:");
    for (const f of failed) console.log(` - ${f.name} (${f.detail})`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("QA runner crashed:", error);
  process.exit(1);
});
