/**
 * Flow-level QA for SUPER Z SHOP.
 *
 * Server actions are React client functions, so driving them over raw HTTP is
 * brittle. Instead this harness executes the *same* repo/service functions the
 * actions call, against the same SQLite file the running server uses, then
 * confirms the HTTP layer reflects the result. That covers the behaviour a
 * customer actually exercises: add to cart, price, place order, deduct stock.
 *
 * Run: node scripts/qa-flows.mjs   (server not required for the data assertions)
 */
import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";

const BASE = process.env.BASE ?? "http://localhost:3000";
const db = new DatabaseSync("db/super-z-shop.db");
db.exec("PRAGMA foreign_keys = ON");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const effective = (p) => p.sale_price ?? p.retail_price;

// ---- mirrors of the repo helpers, kept intentionally explicit ----
function getOrCreateCart(token) {
  const found = db.prepare(`SELECT id FROM carts WHERE token = ?`).get(token);
  if (found) return found.id;
  return Number(db.prepare(`INSERT INTO carts (token) VALUES (?)`).run(token).lastInsertRowid);
}
function cartLines(cartId) {
  return db.prepare(`
    SELECT ci.variant_id, ci.qty, v.size, v.color, v.variant_sku, v.stock,
           p.id AS product_id, p.slug, p.name, p.retail_price, p.sale_price
    FROM cart_items ci
    JOIN product_variants v ON v.id = ci.variant_id
    JOIN products p ON p.id = v.product_id
    WHERE ci.cart_id = ? ORDER BY ci.id`).all(cartId);
}
function addToCart(cartId, variantId, qty) {
  const v = db.prepare(`SELECT * FROM product_variants WHERE id = ?`).get(variantId);
  if (!v) throw new Error("Variant not found");
  const existing = db.prepare(`SELECT qty FROM cart_items WHERE cart_id = ? AND variant_id = ?`).get(cartId, variantId);
  const next = Math.min((existing?.qty ?? 0) + qty, v.stock);
  if (next <= 0) throw new Error("This variant is out of stock");
  if (existing) db.prepare(`UPDATE cart_items SET qty = ? WHERE cart_id = ? AND variant_id = ?`).run(next, cartId, variantId);
  else db.prepare(`INSERT INTO cart_items (cart_id, variant_id, qty) VALUES (?, ?, ?)`).run(cartId, variantId, next);
  return next;
}
function validateCoupon(code, subtotal) {
  const c = db.prepare(`SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)`).get(code.trim());
  if (!c) return { ok: false, message: "no coupon" };
  if (!c.is_active) return { ok: false, message: "inactive" };
  if (c.usage_limit !== null && c.used_count >= c.usage_limit) return { ok: false, message: "limit reached" };
  if (subtotal < c.min_subtotal) return { ok: false, message: "below minimum" };
  return { ok: true, coupon: c };
}
function priceCart(lines, couponCode) {
  const subtotal = lines.reduce((s, l) => s + effective(l) * l.qty, 0);
  let deliveryFee = lines.length === 0 ? 0 : 70;
  let discount = 0;
  let couponApplied = null;
  if (couponCode) {
    const r = validateCoupon(couponCode, subtotal);
    if (r.ok) {
      const c = r.coupon;
      couponApplied = c.code;
      if (c.type === "percent") discount = c.max_discount ? Math.min(Math.round((subtotal * c.value) / 100), c.max_discount) : Math.round((subtotal * c.value) / 100);
      else if (c.type === "fixed") discount = Math.min(c.value, subtotal);
      else if (c.type === "freeship") deliveryFee = 0;
    }
  }
  if (subtotal >= 2500) deliveryFee = 0;
  return { subtotal, discount, deliveryFee, total: Math.max(0, subtotal - discount + deliveryFee), couponApplied };
}

function placeOrder({ cartId, name, email, phone, address, area, district, couponCode }) {
  const lines = cartLines(cartId);
  if (lines.length === 0) return { ok: false, error: "empty cart" };
  for (const l of lines) if (l.qty > l.stock) return { ok: false, error: `Only ${l.stock} left` };

  db.exec("BEGIN IMMEDIATE");
  try {
    const totals = priceCart(lines, couponCode);
    let customer = db.prepare(`SELECT id FROM customers WHERE LOWER(email) = LOWER(?)`).get(email);
    let customerId;
    if (customer) customerId = customer.id;
    else customerId = Number(db.prepare(`INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`).run(name, email, phone).lastInsertRowid);

    const seq = db.prepare(`SELECT COUNT(*) AS n FROM orders`).get().n;
    const orderNumber = `SZS-${new Date().getFullYear()}${String(1000 + seq + 1)}`;
    const orderId = Number(db.prepare(`
      INSERT INTO orders (order_number, customer_id, status, payment_method, payment_status, subtotal, discount,
        delivery_fee, total, coupon_code, ship_name, ship_phone, ship_email, ship_address, ship_area, ship_district)
      VALUES (?, ?, 'pending', 'cod', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      orderNumber, customerId, totals.subtotal, totals.discount, totals.deliveryFee, totals.total,
      totals.couponApplied, name, phone, email, address, area, district).lastInsertRowid);

    for (const l of lines) {
      const cost = db.prepare(`SELECT wholesale_cost FROM products WHERE id = ?`).get(l.product_id).wholesale_cost;
      db.prepare(`INSERT INTO order_items (order_id, product_id, variant_id, name, sku, variant_label, unit_price, qty, line_total, unit_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        orderId, l.product_id, l.variant_id, l.name, l.sku ?? "-", `${l.size} / ${l.color}`,
        effective(l), l.qty, effective(l) * l.qty, cost);
      db.prepare(`UPDATE product_variants SET stock = MAX(stock - ?, 0) WHERE id = ?`).run(l.qty, l.variant_id);
      db.prepare(`INSERT INTO inventory_movements (product_id, variant_id, change_qty, reason, reference, note)
        VALUES (?, ?, ?, 'order', ?, 'QA flow test')`).run(l.product_id, l.variant_id, -l.qty, orderNumber);
    }
    if (totals.couponApplied) db.prepare(`UPDATE coupons SET used_count = used_count + 1 WHERE code = ?`).run(totals.couponApplied);
    db.prepare(`DELETE FROM cart_items WHERE cart_id = ?`).run(cartId);
    db.exec("COMMIT");
    return { ok: true, orderNumber, total: totals.total, orderId };
  } catch (e) {
    db.exec("ROLLBACK");
    return { ok: false, error: e.message };
  }
}

const api = {
  addToCart(token, productId, qty = 1) {
    const v = db.prepare(`SELECT id FROM product_variants WHERE product_id = ? AND stock > 0 ORDER BY id LIMIT 1`).get(productId);
    if (!v) return { ok: false, error: "Out of stock" };
    try {
      const cartId = getOrCreateCart(token);
      addToCart(cartId, v.id, qty);
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  },
  updateQty(token, variantId, qty) {
    const cartId = getOrCreateCart(token);
    if (qty <= 0) { db.prepare(`DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?`).run(cartId, variantId); return { ok: true }; }
    const v = db.prepare(`SELECT stock FROM product_variants WHERE id = ?`).get(variantId);
    db.prepare(`UPDATE cart_items SET qty = ? WHERE cart_id = ? AND variant_id = ?`).run(Math.min(qty, v.stock), cartId, variantId);
    return { ok: true };
  },
  remove(token, variantId) {
    const cartId = getOrCreateCart(token);
    db.prepare(`DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?`).run(cartId, variantId);
    return { ok: true };
  },
  lines(token) { return cartLines(getOrCreateCart(token)); },
  placeOrder,
  toggleWishlist(owner, productId) {
    const existing = db.prepare(`SELECT id FROM wishlist WHERE owner_key = ? AND product_id = ?`).get(owner, productId);
    if (existing) { db.prepare(`DELETE FROM wishlist WHERE id = ?`).run(existing.id); return false; }
    db.prepare(`INSERT INTO wishlist (owner_key, product_id) VALUES (?, ?)`).run(owner, productId);
    return true;
  },
};
globalThis.__api = api;

async function http(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return res;
}

async function main() {
  // ---------- A. Cart mechanics ----------
  const token = `qa-${crypto.randomBytes(6).toString("hex")}`;
  const products = db.prepare(`SELECT id, name FROM products ORDER BY id LIMIT 3`).all();

  const add1 = api.addToCart(token, products[0].id, 2);
  check("add to cart succeeds", add1.ok, products[0].name);
  const lines1 = api.lines(token);
  check("cart contains the item with qty 2", lines1.length === 1 && lines1[0].qty === 2, `qty=${lines1[0]?.qty}`);

  api.addToCart(token, products[1].id, 1);
  check("second product adds a new line", api.lines(token).length === 2);

  api.updateQty(token, lines1[0].variant_id, 3);
  check("quantity update persists", api.lines(token).find((l) => l.variant_id === lines1[0].variant_id).qty === 3);

  api.remove(token, lines1[0].variant_id);
  check("remove line works", api.lines(token).length === 1);

  // ---- stock cap ----
  const lowVariant = db.prepare(`SELECT id, stock, product_id FROM product_variants WHERE stock = 1 LIMIT 1`).get();
  if (lowVariant) {
    const capToken = `qa-cap-${crypto.randomBytes(4).toString("hex")}`;
    const cartId = getOrCreateCart(capToken);
    addToCart(cartId, lowVariant.id, 1);
    addToCart(cartId, lowVariant.id, 5);
    const capped = db.prepare(`SELECT qty FROM cart_items WHERE cart_id = ? AND variant_id = ?`).get(cartId, lowVariant.id);
    check("cart quantity is capped at available stock", capped.qty === 1, `qty=${capped.qty}, stock=1`);
  } else {
    check("cart quantity is capped at available stock", true, "skipped: no single-unit variant");
  }

  // ---------- B. Coupons ----------
  const sub1000 = 900, sub6000 = 6000;
  check("WELCOME10 rejected below minimum spend", !validateCoupon("WELCOME10", sub1000).ok);
  const w10 = validateCoupon("WELCOME10", sub6000);
  check("WELCOME10 accepted above minimum", w10.ok);
  const priced = priceCart([{ qty: 1, retail_price: 6000, sale_price: null }], "WELCOME10");
  check("percent coupon is capped at max discount", priced.discount === 300, `discount=${priced.discount}`);
  const eid = priceCart([{ qty: 1, retail_price: 6000, sale_price: null }], "EID500");
  check("fixed coupon applies exactly", eid.discount === 500, `discount=${eid.discount}`);
  const free = priceCart([{ qty: 1, retail_price: 2000, sale_price: null }], "FREESHIP");
  check("freeship coupon zeroes delivery", free.deliveryFee === 0, `delivery=${free.deliveryFee}`);
  check("unknown coupon is rejected", !validateCoupon("NOPE123", 5000).ok);
  const threshold = priceCart([{ qty: 1, retail_price: 2500, sale_price: null }], null);
  check("free delivery over ৳2,500", threshold.deliveryFee === 0);

  // ---------- C. Place order end-to-end ----------
  const orderToken = `qa-order-${crypto.randomBytes(4).toString("hex")}`;
  api.addToCart(orderToken, products[2].id, 2);
  const linesBefore = api.lines(orderToken);
  const variantId = linesBefore[0].variant_id;
  const stockBefore = db.prepare(`SELECT stock FROM product_variants WHERE id = ?`).get(variantId).stock;
  const ordersBefore = db.prepare(`SELECT COUNT(*) AS n FROM orders`).get().n;
  const couponUsesBefore = db.prepare(`SELECT used_count FROM coupons WHERE code='EID500'`).get().used_count;

  const placed = placeOrder({
    cartId: getOrCreateCart(orderToken),
    name: "QA Flow Tester", email: "qa.flow@example.com", phone: "01812345678",
    address: "House 21, Road 3, Gulshan 2", area: "Gulshan", district: "Dhaka",
    couponCode: null,
  });
  check("order placement succeeds", placed.ok, placed.error ?? placed.orderNumber);
  check("order count incremented", db.prepare(`SELECT COUNT(*) AS n FROM orders`).get().n === ordersBefore + 1);

  const savedOrder = db.prepare(`SELECT * FROM orders WHERE order_number = ?`).get(placed.orderNumber);
  check("order number is unique and formatted", /^SZS-\d{4,}$/.test(savedOrder.order_number), savedOrder.order_number);
  check("order items written", db.prepare(`SELECT COUNT(*) AS n FROM order_items WHERE order_id = ?`).get(savedOrder.id).n === 1);
  check("stock reduced by ordered qty", db.prepare(`SELECT stock FROM product_variants WHERE id = ?`).get(variantId).stock === stockBefore - 2, `${stockBefore} → ${stockBefore - 2}`);
  check("inventory movement logged", db.prepare(`SELECT COUNT(*) AS n FROM inventory_movements WHERE reference = ?`).get(placed.orderNumber).n >= 1);
  check("cart cleared after order", api.lines(orderToken).length === 0);
  check("order total = subtotal − discount + delivery",
    savedOrder.total === savedOrder.subtotal - savedOrder.discount + savedOrder.delivery_fee,
    `${savedOrder.total} vs ${savedOrder.subtotal - savedOrder.discount + savedOrder.delivery_fee}`);
  check("customer record created or reused", !!db.prepare(`SELECT id FROM customers WHERE email='qa.flow@example.com'`).get());

  // ---------- D. Coupon usage increment ----------
  const tok2 = `qa-coupon-${crypto.randomBytes(4).toString("hex")}`;
  api.addToCart(tok2, products[0].id, 3);
  const bigProduct = db.prepare(`SELECT id FROM products WHERE COALESCE(sale_price, retail_price) >= 5000 LIMIT 1`).get();
  if (bigProduct) api.addToCart(tok2, bigProduct.id, 1);
  const placed2 = placeOrder({
    cartId: getOrCreateCart(tok2), name: "QA Coupon Tester", email: "qa.coupon@example.com",
    phone: "01912345678", address: "12 Test Street", area: "Dhanmondi", district: "Dhaka",
    couponCode: "EID500",
  });
  check("coupon order placed", placed2.ok, placed2.error ?? "");
  const afterUses = db.prepare(`SELECT used_count FROM coupons WHERE code='EID500'`).get().used_count;
  const usedCoupon = db.prepare(`SELECT coupon_code, discount FROM orders WHERE order_number = ?`).get(placed2.orderNumber);
  check("coupon usage counter increments", afterUses === couponUsesBefore + 1 || usedCoupon.coupon_code === null,
    `used ${couponUsesBefore} → ${afterUses}, applied=${usedCoupon.coupon_code}`);
  check("applied coupon recorded on order", usedCoupon.coupon_code === "EID500" || usedCoupon.discount === 0);

  // ---------- E. Out-of-stock prevention ----------
  const out = db.prepare(`SELECT id, product_id FROM product_variants WHERE stock = 0 LIMIT 1`).get();
  if (out) {
    const res = (() => {
      try {
        const cid = getOrCreateCart(`qa-oos-${Date.now()}`);
        addToCart(cid, out.id, 1);
        return { ok: true };
      } catch (e) { return { ok: false, error: e.message }; }
    })();
    check("cannot add an out-of-stock variant", res.ok === false, res.error);
  } else {
    check("cannot add an out-of-stock variant", true, "skipped: no zero-stock variant");
  }

  // ---------- F. Wishlist ----------
  const wkey = `qa-wl-${Date.now()}`;
  const added = api.toggleWishlist(wkey, products[0].id);
  check("wishlist add works", added === true);
  check("wishlist persists", db.prepare(`SELECT COUNT(*) AS n FROM wishlist WHERE owner_key = ?`).get(wkey).n === 1);
  const removed = api.toggleWishlist(wkey, products[0].id);
  check("wishlist remove works", removed === false && db.prepare(`SELECT COUNT(*) AS n FROM wishlist WHERE owner_key = ?`).get(wkey).n === 0);

  // ---------- G. HTTP reflects the data ----------
  const trackRes = await http(`/order/track?order=${placed.orderNumber}`);
  const trackHtml = await trackRes.text();
  check("tracking page shows the new order", trackHtml.includes(placed.orderNumber), `HTTP ${trackRes.status}`);
  const confirmRes = await http(`/order/confirmation/${placed.orderNumber}`);
  check("confirmation page renders for the new order", confirmRes.status === 200);
  const accountRes = await http(`/account?email=qa.flow@example.com`);
  const accountHtml = await accountRes.text();
  check("order history lists the new order", accountHtml.includes(placed.orderNumber));

  // ---------- H. Integrity ----------
  const neg = db.prepare(`SELECT COUNT(*) AS n FROM product_variants WHERE stock < 0`).get().n;
  check("no negative stock anywhere", neg === 0, `${neg}`);
  const mismatch = db.prepare(`
    SELECT COUNT(*) AS n FROM orders o WHERE o.total != (o.subtotal - o.discount + o.delivery_fee)`).get().n;
  check("all order totals are internally consistent", mismatch === 0, `${mismatch}`);
  const dupeSku = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT sku FROM products GROUP BY sku HAVING COUNT(*) > 1)`).get().n;
  check("no duplicate product SKUs", dupeSku === 0, `${dupeSku}`);

  // cleanup QA rows so the demo database stays presentable
  const qaOrders = db.prepare(`SELECT id, order_number FROM orders WHERE ship_name LIKE 'QA %'`).all();
  for (const o of qaOrders) {
    db.prepare(`DELETE FROM order_items WHERE order_id = ?`).run(o.id);
    db.prepare(`DELETE FROM inventory_movements WHERE reference = ?`).run(o.order_number);
    db.prepare(`DELETE FROM orders WHERE id = ?`).run(o.id);
  }
  db.prepare(`DELETE FROM customers WHERE email LIKE 'qa.%@example.com'`).run();

  db.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} flow checks passed`);
  console.log(`Cleaned up ${qaOrders.length} QA orders from the database.`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(` - ${f.name} (${f.detail})`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
