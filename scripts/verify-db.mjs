/**
 * Data integrity audit. Verifies the seeded catalogue and order data are
 * internally consistent — runs without a server.
 */
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.env.DATABASE_PATH || "db/super-z-shop.db");
const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const count = (sql, params = []) => db.prepare(sql).get(...params).n;

check("225 products present", count(`SELECT COUNT(*) AS n FROM products`) === 225, `${count(`SELECT COUNT(*) AS n FROM products`)}`);
check("15 categories present", count(`SELECT COUNT(*) AS n FROM categories`) === 15);
check("every product belongs to a category",
  count(`SELECT COUNT(*) AS n FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE c.id IS NULL`) === 0);
check("every product has at least one variant",
  count(`SELECT COUNT(*) AS n FROM products p WHERE NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)`) === 0);
check("every product has an image record",
  count(`SELECT COUNT(*) AS n FROM products p WHERE NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)`) === 0);
check("unique product SKUs", count(`SELECT COUNT(*) AS n FROM (SELECT sku FROM products GROUP BY sku HAVING COUNT(*) > 1)`) === 0);
check("unique product slugs", count(`SELECT COUNT(*) AS n FROM (SELECT slug FROM products GROUP BY slug HAVING COUNT(*) > 1)`) === 0);
check("unique variant SKUs", count(`SELECT COUNT(*) AS n FROM (SELECT variant_sku FROM product_variants GROUP BY variant_sku HAVING COUNT(*) > 1)`) === 0);
check("no negative stock", count(`SELECT COUNT(*) AS n FROM product_variants WHERE stock < 0`) === 0);
check("retail price above zero for all products",
  count(`SELECT COUNT(*) AS n FROM products WHERE retail_price <= 0`) === 0);
check("sale price always below retail price",
  count(`SELECT COUNT(*) AS n FROM products WHERE sale_price IS NOT NULL AND sale_price >= retail_price`) === 0);
check("wholesale cost below retail price",
  count(`SELECT COUNT(*) AS n FROM products WHERE wholesale_cost >= retail_price`) === 0,
  `${count(`SELECT COUNT(*) AS n FROM products WHERE wholesale_cost >= retail_price`)} rows exceed retail`);
check("all prices flagged unverified",
  count(`SELECT COUNT(*) AS n FROM products WHERE price_status != 'unverified'`) === 0);
check("every order has line items",
  count(`SELECT COUNT(*) AS n FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)`) === 0);
check("order totals reconcile",
  count(`SELECT COUNT(*) AS n FROM orders WHERE total != subtotal - discount + delivery_fee`) === 0);
check("order subtotals equal line-item sums",
  count(`SELECT COUNT(*) AS n FROM orders o WHERE o.subtotal != (SELECT COALESCE(SUM(line_total),0) FROM order_items oi WHERE oi.order_id = o.id)`) === 0);
check("order numbers unique", count(`SELECT COUNT(*) AS n FROM (SELECT order_number FROM orders GROUP BY order_number HAVING COUNT(*) > 1)`) === 0);
check("all orders use cash on delivery", count(`SELECT COUNT(*) AS n FROM orders WHERE payment_method != 'cod'`) === 0);
check("admin account exists", count(`SELECT COUNT(*) AS n FROM admin_users`) >= 1);
check("admin password is hashed (not plaintext)",
  count(`SELECT COUNT(*) AS n FROM admin_users WHERE password_hash LIKE 'scrypt:%'`) === count(`SELECT COUNT(*) AS n FROM admin_users`));
check("coupons seeded", count(`SELECT COUNT(*) AS n FROM coupons`) >= 4);
check("store settings seeded", count(`SELECT COUNT(*) AS n FROM store_settings`) >= 6);
check("inventory movements recorded", count(`SELECT COUNT(*) AS n FROM inventory_movements`) > 300);

const byCat = db.prepare(
  `SELECT c.name, COUNT(p.id) AS n FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.sort_order`,
).all();
const uneven = byCat.filter((r) => r.n !== 15);
check("each category has 15 products", uneven.length === 0, uneven.map((r) => `${r.name}=${r.n}`).join(", "));

const units = db.prepare(`SELECT COALESCE(SUM(stock),0) AS s FROM product_variants`).get().s;
check("stock units available for sale", units > 1000, `${units} units`);

const variants = db.prepare(`SELECT COUNT(*) AS n FROM product_variants`).get().n;
console.log(`\nProducts: 225 · Variants: ${variants} · Stock units: ${units} · Orders: ${count(`SELECT COUNT(*) AS n FROM orders`)}`);

db.close();
const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} integrity checks passed`);
process.exit(failed.length ? 1 : 0);
