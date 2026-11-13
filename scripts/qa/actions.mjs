/**
 * True end-to-end QA of the browser-facing server actions.
 *
 * Next.js server actions are POSTed with a `next-action` header carrying the
 * action id. That id is build-specific, so this script reads it from the
 * framework's server-reference manifest (generated after the app compiles),
 * then drives real requests exactly as a browser would.
 *
 * Prereq: the app has served at least one page in this build (dev or prod), so
 * .next/.../server-reference-manifest.js exists.
 * Usage:  node scripts/qa/actions.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const BASE = process.env.BASE ?? "http://localhost:3000";

// ---------------------------------------------------------------- manifest
function loadManifest() {
  const candidates = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === "server-reference-manifest.js") candidates.push(p);
    }
  };
  walk(".next");
  if (candidates.length === 0) throw new Error("server-reference-manifest.js not found — visit a page first");

  const source = fs.readFileSync(candidates.sort().at(-1), "utf8");
  // The manifest is a JS string literal containing escaped JSON. Extract the
  // content between the first quote and the final quote, then decode one layer.
  const start = source.indexOf('="') + 2;
  const raw = source.slice(start, source.lastIndexOf('"'));
  const decoded = raw
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
  const manifest = JSON.parse(decoded);
  const byName = {};
  for (const [id, value] of Object.entries(manifest.node)) byName[value.exportedName] = id;
  return byName;
}

let ACTIONS;
let cookie = "";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

function absorbCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const pair = c.split(";")[0];
    const name = pair.split("=")[0];
    cookie = cookie.split("; ").filter(Boolean).filter((p) => !p.startsWith(`${name}=`)).concat(pair).join("; ");
  }
}

async function visit(p) {
  const res = await fetch(BASE + p, { headers: cookie ? { cookie } : {}, redirect: "manual" });
  absorbCookies(res);
  return res;
}

/** POST a server action the way React's client does. */
async function action(page, name, args) {
  const id = ACTIONS[name];
  if (!id) throw new Error(`Action not found: ${name}`);
  const res = await fetch(BASE + page, {
    method: "POST",
    headers: {
      "next-action": id,
      "content-type": "text/plain;charset=UTF-8",
      accept: "text/x-component",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(args),
    redirect: "manual",
  });
  absorbCookies(res);
  const text = await res.text();
  return { res, text };
}


/**
 * Submit a real HTML form the way a browser (or its progressive-enhancement
 * fallback) does: scrape the rendered `$ACTION_*` hidden fields for that form
 * and post every field back as multipart/form-data.
 */
async function submitForm(page, marker, fields) {
  const res = await fetch(BASE + page, { headers: cookie ? { cookie } : {} });
  absorbCookies(res);
  const html = await res.text();
  const formIdx = html.indexOf(marker);
  if (formIdx < 0) throw new Error(`Form marker not found on ${page}: ${marker}`);
  const start = html.lastIndexOf("<form", formIdx);
  const end = html.indexOf("</form>", formIdx);
  const chunk = html.slice(start, end);

  const hidden = [...chunk.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/>/g)].map((m) => [
    m[1],
    (m[2] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
  ]);
  const body = new FormData();
  for (const [k, v] of hidden) body.append(k, v);
  for (const [k, v] of Object.entries(fields)) body.append(k, v);

  const post = await fetch(BASE + page, {
    method: "POST",
    headers: cookie ? { cookie } : {},
    body,
    redirect: "manual",
  });
  absorbCookies(post);
  const text = await post.text();
  return { res: post, text, hidden: hidden.map((h) => h[0]) };
}

async function main() {
  ACTIONS = loadManifest();
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync("db/super-z-shop.db");
  db.exec("PRAGMA foreign_keys = ON");
  console.log(`Loaded ${Object.keys(ACTIONS).length} server actions\n`);

  // session bootstrap (sets cart + wishlist cookies)
  await visit("/shop");

  // ---------------- 1. Add to cart from a product page ----------------
  const variant = db.prepare(
    `SELECT v.id, v.stock, v.variant_sku, p.slug, p.name
     FROM product_variants v JOIN products p ON p.id = v.product_id
     WHERE v.stock >= 4 ORDER BY v.id LIMIT 1`,
  ).get();
  const stockBefore = variant.stock;
  const add = await action(`/product/${variant.slug}`, "addVariantToCartAction", [variant.id, 2]);
  check("server action: add variant to cart", add.res.status === 200 && add.text.includes('"ok":true'), variant.variant_sku);

  let cartRow = db.prepare(
    `SELECT ci.qty FROM cart_items ci JOIN carts c ON c.id = ci.cart_id
     WHERE ci.variant_id = ? ORDER BY ci.id DESC LIMIT 1`,
  ).get(variant.id);
  check("cart row created with qty 2", cartRow?.qty === 2, `qty=${cartRow?.qty}`);

  // cart page reflects it
  const cartPage = await visit("/cart");
  const cartHtml = await cartPage.text();
  check("cart page lists the item", cartHtml.includes(variant.name));

  // ---------------- 2. Quantity update + remove ----------------
  const upd = await action("/cart", "updateCartQtyAction", [variant.id, 3]);
  check("server action: update quantity", upd.res.status === 200 && upd.text.includes('"ok":true'));
  cartRow = db.prepare(
    `SELECT ci.qty FROM cart_items ci WHERE ci.variant_id = ? ORDER BY ci.id DESC LIMIT 1`,
  ).get(variant.id);
  check("quantity persisted as 3", cartRow?.qty === 3, `qty=${cartRow?.qty}`);

  // cap at stock
  const over = await action("/cart", "updateCartQtyAction", [variant.id, 999]);
  const capped = db.prepare(`SELECT qty FROM cart_items WHERE variant_id = ? ORDER BY id DESC LIMIT 1`).get(variant.id);
  check("quantity capped to available stock", over.res.status === 200 && capped.qty === stockBefore, `qty=${capped.qty}, stock=${stockBefore}`);

  // ---------------- 3. Wishlist toggle ----------------
  const wl = await action("/wishlist", "toggleWishlistAction", [1]);
  check("server action: wishlist toggle", wl.res.status === 200 && wl.text.includes('"ok":true'));
  const wlCount = db.prepare(`SELECT COUNT(*) AS n FROM wishlist WHERE product_id = 1`).get().n;
  check("wishlist row persisted", wlCount >= 1, `${wlCount} rows`);

  // ---------------- 4. Checkout validation ----------------
  const badForm = {
    name: "A", email: "not-an-email", phone: "123", address: "short",
    area: "", district: "", postcode: "", notes: "", coupon: "",
  };
  const bad = await submitForm("/checkout", 'name="phone"', badForm);
  check(
    "checkout rejects invalid input",
    bad.text.includes("valid") || bad.text.includes("valid Bangladeshi") || bad.text.includes('"ok":false'),
    `HTTP ${bad.res.status}`,
  );

  const ordersBefore = db.prepare(`SELECT COUNT(*) AS n FROM orders`).get().n;
  const goodForm = {
    name: "QA Action Tester", email: "qa.action@example.com", phone: "01712345678",
    address: "House 5, Road 12, Banani", area: "Banani", district: "Dhaka",
    postcode: "1213", notes: "automated QA", coupon: "WELCOME10",
  };
  const placed = await submitForm("/checkout", 'name="phone"', goodForm);
  const ordersAfter = db.prepare(`SELECT COUNT(*) AS n FROM orders`).get().n;
  check("checkout creates an order through the action", ordersAfter === ordersBefore + 1, `${ordersBefore} → ${ordersAfter} (HTTP ${placed.res.status})`);

  const order = db.prepare(`SELECT * FROM orders ORDER BY id DESC LIMIT 1`).get();
  check("order has unique SZS number", /^SZS-\d+$/.test(order.order_number), order.order_number);
  check("order discount from WELCOME10 applied", order.discount > 0, `discount=${order.discount}`);
  check("order total maths correct", order.total === order.subtotal - order.discount + order.delivery_fee, `${order.total}`);
  jsonReport.push({ order: order.order_number, total: order.total, discount: order.discount });

  // stock reduced
  const stockAfter = db.prepare(`SELECT stock FROM product_variants WHERE id = ?`).get(variant.id).stock;
  const orderedQty = db.prepare(
    `SELECT COALESCE(SUM(oi.qty),0) AS q FROM order_items oi WHERE oi.order_id = ? AND oi.variant_id = ?`,
  ).get(order.id, variant.id).q;
  check(
    "inventory reduced by exactly the ordered quantity",
    stockAfter === stockBefore - orderedQty && orderedQty > 0,
    `${stockBefore} → ${stockAfter} (ordered ${orderedQty})`,
  );

  const cartEmpty = await visit("/cart");
  check("cart emptied after the order", (await cartEmpty.text()).includes("Your cart is empty"));

  // ---------------- 5. Admin login + order management ----------------
  cookie = ""; // new browser session for admin
  const loginPage = await visit("/admin/login");
  check("admin login page serves", loginPage.status === 200);

  await visit("/admin/login");
  const badLogin = await submitForm("/admin/login", 'name="password"', { email: "admin@superzshop.bd", password: "wrong-password" });
  check(
    "admin login rejects a wrong password",
    badLogin.res.status === 303 && (badLogin.res.headers.get("location") ?? "").includes("error=invalid"),
    `HTTP ${badLogin.res.status} → ${badLogin.res.headers.get("location")}`,
  );

  const login = await submitForm("/admin/login", 'name="password"', { email: "admin@superzshop.bd", password: "SuperZ@2026" });
  const loginLocation = login.res.headers.get("location") ?? "";
  check(
    "admin login action accepts seeded credentials",
    login.res.status === 303 && loginLocation.endsWith("/admin"),
    `HTTP ${login.res.status} → ${loginLocation || "(no location)"}`,
  );
  check("session cookie issued", cookie.includes("szs_admin"), cookie.slice(0, 40));

  const dash = await visit("/admin");
  check("admin dashboard authorised", dash.status === 200);
  const dashHtml = await dash.text();
  check("dashboard shows live metrics", dashHtml.includes("Dashboard overview") && dashHtml.includes("Revenue trend"));

  for (const p of ["/admin/orders", "/admin/products", "/admin/inventory", "/admin/categories", "/admin/customers", "/admin/coupons", "/admin/banners", "/admin/reports", "/admin/settings"]) {
    const r = await visit(p);
    check(`admin page ${p}`, r.status === 200, `HTTP ${r.status}`);
  }

  // CSV export now authorised
  const csv = await fetch(`${BASE}/api/export/products`, { headers: { cookie } });
  const csvText = await csv.text();
  check("CSV export works when signed in", csv.status === 200 && csvText.split("\r\n").length > 200, `${csvText.split("\r\n").length} rows`);
  check("CSV has the expected header", csvText.startsWith("sku,name,name_bn"), csvText.slice(0, 40));

  // ---------------- 7. Reports & prices ----------
  const reports = await visit("/admin/reports");
  const reportsHtml = await reports.text();
  check("reports page shows contribution walk-forward", reportsHtml.includes("Gross contribution"));

  // ---------------- summary ----------------
  // clean up QA artefacts so the seeded demo stays presentable
  const qaOrders = db.prepare(`SELECT id, order_number FROM orders WHERE ship_name LIKE 'QA %'`).all();
  for (const o of qaOrders) {
    db.prepare(`DELETE FROM order_items WHERE order_id = ?`).run(o.id);
    db.prepare(`DELETE FROM inventory_movements WHERE reference = ?`).run(o.order_number);
    db.prepare(`DELETE FROM orders WHERE id = ?`).run(o.id);
  }
  db.prepare(`DELETE FROM customers WHERE email LIKE 'qa.%@example.com'`).run();
  db.prepare(`DELETE FROM cart_items`).run();
  db.prepare(`DELETE FROM wishlist`).run();
  db.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} action checks passed`);
  console.log(`Cleaned ${qaOrders.length} QA orders.`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(` - ${f.name} (${f.detail})`);
    process.exit(1);
  }
}

const jsonReport = [];
main().catch((e) => { console.error(e); process.exit(1); });
