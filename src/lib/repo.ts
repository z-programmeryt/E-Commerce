/**
 * Data access layer. Every SQL statement in the storefront and admin lives
 * here or in a sibling module under src/lib, so pages stay declarative.
 */
import { all, one, run, transaction } from "./db";
import type { CartLine, Category, Order, OrderItem, Product, Variant } from "./types";

const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name,
    (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1) AS image_url,
    (SELECT kind FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1) AS image_kind,
    (SELECT COALESCE(SUM(stock), 0) FROM product_variants v WHERE v.product_id = p.id) AS total_stock
  FROM products p JOIN categories c ON c.id = p.category_id
`;

export function effectivePrice(p: { retail_price: number; sale_price: number | null }): number {
  return p.sale_price ?? p.retail_price;
}

export function discountPercent(p: { retail_price: number; sale_price: number | null }): number | null {
  if (!p.sale_price || p.sale_price >= p.retail_price) return null;
  return Math.round(((p.retail_price - p.sale_price) / p.retail_price) * 100);
}

export function parseFlags(p: Product): string[] {
  try {
    return JSON.parse(p.flags_json) as string[];
  } catch {
    return [];
  }
}

export function parseTags(p: Product): string[] {
  try {
    return JSON.parse(p.tags_json) as string[];
  } catch {
    return [];
  }
}

export function parseSpecs(p: Product): Record<string, string> {
  try {
    return JSON.parse(p.specs_json) as Record<string, string>;
  } catch {
    return {};
  }
}

export function listCategories(): Category[] {
  return all<Category>(`SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order`);
}

export function getCategory(slug: string): Category | undefined {
  return one<Category>(`SELECT * FROM categories WHERE slug = ?`, [slug]);
}

export type ProductQuery = {
  category?: string;
  subcategory?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  flag?: string;
  tag?: string;
  onSale?: boolean;
  inStock?: boolean;
  page?: number;
  perPage?: number;
};

export function queryProducts(q: ProductQuery): { rows: Product[]; total: number } {
  const where: string[] = ["p.is_active = 1"];
  const params: unknown[] = [];

  if (q.category) {
    where.push("c.slug = ?");
    params.push(q.category);
  }
  if (q.subcategory) {
    where.push("p.subcategory = ?");
    params.push(q.subcategory);
  }
  if (q.q) {
    where.push("(p.name LIKE ? OR p.name_bn LIKE ? OR p.short_description LIKE ? OR p.sku LIKE ? OR p.tags_json LIKE ?)");
    const like = `%${q.q}%`;
    params.push(like, like, like, like, like);
  }
  if (typeof q.minPrice === "number") {
    where.push("COALESCE(p.sale_price, p.retail_price) >= ?");
    params.push(q.minPrice);
  }
  if (typeof q.maxPrice === "number") {
    where.push("COALESCE(p.sale_price, p.retail_price) <= ?");
    params.push(q.maxPrice);
  }
  if (q.flag) {
    where.push("p.flags_json LIKE ?");
    params.push(`%"${q.flag}"%`);
  }
  if (q.tag) {
    where.push("p.tags_json LIKE ?");
    params.push(`%"${q.tag}"%`);
  }
  if (q.onSale) where.push("p.sale_price IS NOT NULL AND p.sale_price < p.retail_price");
  if (q.inStock) where.push("(SELECT COALESCE(SUM(stock),0) FROM product_variants v WHERE v.product_id = p.id) > 0");

  const orderBy = {
    newest: "p.id DESC",
    "price-asc": "COALESCE(p.sale_price, p.retail_price) ASC",
    "price-desc": "COALESCE(p.sale_price, p.retail_price) DESC",
    name: "p.name ASC",
    featured: "(SELECT COUNT(*) FROM json_each(p.flags_json) WHERE json_each.value = 'featured') DESC, p.id ASC",
  }[q.sort ?? "featured"] ?? "p.id ASC";

  const perPage = q.perPage ?? 24;
  const page = Math.max(1, q.page ?? 1);
  const whereSql = `WHERE ${where.join(" AND ")}`;
  const total = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`,
    params,
  )?.n ?? 0;
  const rows = all<Product>(
    `${PRODUCT_SELECT} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, perPage, (page - 1) * perPage],
  );
  return { rows, total };
}

export function getProductBySlug(slug: string): Product | undefined {
  return one<Product>(`${PRODUCT_SELECT} WHERE p.slug = ?`, [slug]);
}

export function getProductById(id: number): Product | undefined {
  return one<Product>(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
}

export function getVariants(productId: number): Variant[] {
  return all<Variant>(
    `SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY color, size`,
    [productId],
  );
}

export function getVariant(id: number): (Variant & { product_slug: string; product_name: string }) | undefined {
  return one(
    `SELECT v.*, p.slug AS product_slug, p.name AS product_name
     FROM product_variants v JOIN products p ON p.id = v.product_id WHERE v.id = ?`,
    [id],
  );
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1 ORDER BY p.id LIMIT ?`,
    [product.category_id, product.id, limit],
  );
}

export function topProducts(flag: string, limit = 8): Product[] {
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.flags_json LIKE ? AND p.is_active = 1 ORDER BY p.id LIMIT ?`,
    [`%"${flag}"%`, limit],
  );
}

export function saleProducts(limit = 8): Product[] {
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.sale_price IS NOT NULL AND p.sale_price < p.retail_price AND p.is_active = 1 ORDER BY (p.retail_price - p.sale_price) DESC LIMIT ?`,
    [limit],
  );
}

export function categoryCounts(): Record<string, number> {
  const rows = all<{ slug: string; n: number }>(
    `SELECT c.slug, COUNT(p.id) AS n FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.slug`,
  );
  return Object.fromEntries(rows.map((r) => [r.slug, r.n]));
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------
export function getOrCreateCart(token: string): number {
  const existing = one<{ id: number }>(`SELECT id FROM carts WHERE token = ?`, [token]);
  if (existing) return existing.id;
  const res = run(`INSERT INTO carts (token) VALUES (?)`, [token]);
  return Number(res.lastInsertRowid);
}

export function cartLines(cartId: number): CartLine[] {
  return all<CartLine>(
    `SELECT ci.variant_id, ci.qty, v.size, v.color, v.variant_sku, v.stock, v.price_delta,
            p.id AS product_id, p.slug, p.name, p.sku, p.retail_price, p.sale_price,
            (SELECT url FROM product_images i WHERE i.product_id = p.id LIMIT 1) AS image_url,
            (SELECT kind FROM product_images i WHERE i.product_id = p.id LIMIT 1) AS image_kind,
            c.name AS category_name
     FROM cart_items ci
     JOIN product_variants v ON v.id = ci.variant_id
     JOIN products p ON p.id = v.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE ci.cart_id = ? ORDER BY ci.id`,
    [cartId],
  );
}

export function addToCart(cartId: number, variantId: number, qty: number) {
  const variant = getVariant(variantId);
  if (!variant) throw new Error("Variant not found");
  const existing = one<{ qty: number }>(
    `SELECT qty FROM cart_items WHERE cart_id = ? AND variant_id = ?`,
    [cartId, variantId],
  );
  const next = Math.min((existing?.qty ?? 0) + qty, variant.stock);
  if (next <= 0) throw new Error("This variant is out of stock");
  if (existing) {
    run(`UPDATE cart_items SET qty = ? WHERE cart_id = ? AND variant_id = ?`, [next, cartId, variantId]);
  } else {
    run(`INSERT INTO cart_items (cart_id, variant_id, qty) VALUES (?, ?, ?)`, [cartId, variantId, next]);
  }
  return next;
}

export function setCartQty(cartId: number, variantId: number, qty: number) {
  if (qty <= 0) {
    run(`DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?`, [cartId, variantId]);
    return 0;
  }
  const variant = getVariant(variantId);
  if (!variant) throw new Error("Variant not found");
  const capped = Math.min(qty, variant.stock);
  run(`UPDATE cart_items SET qty = ? WHERE cart_id = ? AND variant_id = ?`, [capped, cartId, variantId]);
  return capped;
}

export function removeCartLine(cartId: number, variantId: number) {
  run(`DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?`, [cartId, variantId]);
}

export function cartCount(cartId: number): number {
  return one<{ n: number }>(`SELECT COALESCE(SUM(qty),0) AS n FROM cart_items WHERE cart_id = ?`, [cartId])?.n ?? 0;
}

export function clearCart(cartId: number) {
  run(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
}

export type CartTotals = {
  subtotal: number;
  saved: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
  couponMessage: string | null;
  freeDeliveryShortfall: number;
};

export function priceCart(
  lines: CartLine[],
  options: { district?: string; couponCode?: string | null; freeDeliveryThreshold?: number; insideFee?: number; outsideFee?: number },
): CartTotals {
  const insideFee = options.insideFee ?? 70;
  const outsideFee = options.outsideFee ?? 130;
  const threshold = options.freeDeliveryThreshold ?? 2500;
  const subtotal = lines.reduce((s, l) => s + effectivePrice(l) * l.qty, 0);
  const saved = lines.reduce(
    (s, l) => s + (l.sale_price ? (l.retail_price - l.sale_price) * l.qty : 0),
    0,
  );
  let deliveryFee = lines.length === 0 ? 0 : options.district && options.district !== "Dhaka" ? outsideFee : insideFee;
  let discount = 0;
  let couponMessage: string | null = null;
  let validCoupon: string | null = null;

  if (options.couponCode) {
    const result = validateCoupon(options.couponCode, subtotal);
    if (result.ok && result.coupon) {
      const c = result.coupon;
      validCoupon = c.code;
      if (c.type === "percent") {
        const raw = Math.round((subtotal * c.value) / 100);
        discount = c.max_discount ? Math.min(raw, c.max_discount) : raw;
      } else if (c.type === "fixed") {
        discount = Math.min(c.value, subtotal);
      } else if (c.type === "freeship") {
        deliveryFee = 0;
      }
      couponMessage = `${c.code} applied — ${c.description}`;
    } else {
      couponMessage = result.message;
    }
  }

  if (subtotal >= threshold && subtotal > 0) deliveryFee = 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  return {
    subtotal,
    saved,
    discount,
    deliveryFee,
    total,
    couponCode: validCoupon,
    couponMessage,
    freeDeliveryShortfall: Math.max(0, threshold - subtotal),
  };
}

export type Coupon = {
  id: number;
  code: string;
  description: string;
  type: string;
  value: number;
  min_subtotal: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: number;
  starts_at: string | null;
  ends_at: string | null;
};

export function validateCoupon(
  code: string,
  subtotal: number,
): { ok: boolean; coupon?: Coupon; message: string } {
  const coupon = one<Coupon>(`SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)`, [code.trim()]);
  if (!coupon) return { ok: false, message: "That coupon code does not exist." };
  if (!coupon.is_active) return { ok: false, message: "This coupon is no longer active." };
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { ok: false, message: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.min_subtotal) {
    return { ok: false, message: `Add ${(coupon.min_subtotal - subtotal).toLocaleString()} ৳ more to use this coupon.` };
  }
  return { ok: true, coupon, message: `${coupon.code} applied.` };
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------
export function wishlistProducts(ownerKey: string): Product[] {
  return all<Product>(
    `${PRODUCT_SELECT} JOIN wishlist w ON w.product_id = p.id WHERE w.owner_key = ? ORDER BY w.id DESC`,
    [ownerKey],
  );
}

export function wishlistIds(ownerKey: string): number[] {
  return all<{ product_id: number }>(`SELECT product_id FROM wishlist WHERE owner_key = ?`, [ownerKey]).map(
    (r) => r.product_id,
  );
}

export function toggleWishlist(ownerKey: string, productId: number): boolean {
  const existing = one<{ id: number }>(
    `SELECT id FROM wishlist WHERE owner_key = ? AND product_id = ?`,
    [ownerKey, productId],
  );
  if (existing) {
    run(`DELETE FROM wishlist WHERE id = ?`, [existing.id]);
    return false;
  }
  run(`INSERT INTO wishlist (owner_key, product_id) VALUES (?, ?)`, [ownerKey, productId]);
  return true;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export function getOrderByNumber(orderNumber: string): Order | undefined {
  return one<Order>(`SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?)`, [orderNumber]);
}

export function getOrderItems(orderId: number): OrderItem[] {
  return all<OrderItem>(`SELECT * FROM order_items WHERE order_id = ? ORDER BY id`, [orderId]);
}

export function customerOrders(customerId: number): Order[] {
  return all<Order>(`SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC`, [customerId]);
}

export function findCustomerByEmail(email: string) {
  return one<{ id: number; name: string; email: string; phone: string }>(
    `SELECT * FROM customers WHERE LOWER(email) = LOWER(?)`,
    [email],
  );
}

export type PlaceOrderInput = {
  cartId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  district: string;
  postcode?: string;
  notes?: string;
  couponCode?: string | null;
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; error: string };

/**
 * Creates an order inside a transaction: validates stock, decrements inventory,
 * records movements, writes the order + items and empties the cart.
 */
export function placeOrder(input: PlaceOrderInput): PlaceOrderResult {
  try {
    return transaction<PlaceOrderResult>(() => {
      const lines = cartLines(input.cartId);
      if (lines.length === 0) return { ok: false, error: "Your cart is empty." };

      for (const line of lines) {
        if (line.qty > line.stock) {
          return { ok: false, error: `Only ${line.stock} left of ${line.name} (${line.size} / ${line.color}).` };
        }
      }

      const totals = priceCart(lines, { district: input.district, couponCode: input.couponCode });

      const existing = findCustomerByEmail(input.email);
      let customerId: number;
      if (existing) {
        customerId = existing.id;
        run(`UPDATE customers SET name = ?, phone = ? WHERE id = ?`, [input.name, input.phone, customerId]);
      } else {
        const res = run(`INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`, [
          input.name,
          input.email,
          input.phone,
        ]);
        customerId = Number(res.lastInsertRowid);
      }

      // Address book: keep one current address per customer for this demo.
      const addr = one<{ id: number }>(`SELECT id FROM addresses WHERE customer_id = ? LIMIT 1`, [customerId]);
      if (addr) {
        run(
          `UPDATE addresses SET address_line = ?, area = ?, district = ?, postcode = ?, phone = ? WHERE id = ?`,
          [input.address, input.area, input.district, input.postcode ?? "", input.phone, addr.id],
        );
      } else {
        run(
          `INSERT INTO addresses (customer_id, label, address_line, area, district, postcode, phone, is_default)
           VALUES (?, 'Home', ?, ?, ?, ?, ?, 1)`,
          [customerId, input.address, input.area, input.district, input.postcode ?? "", input.phone],
        );
      }

      const seq = one<{ n: number }>(`SELECT COUNT(*) AS n FROM orders`)?.n ?? 0;
      const orderNumber = `SZS-${new Date().getFullYear()}${String(1000 + seq + 1)}`;

      const orderRes = run(
        `INSERT INTO orders (order_number, customer_id, status, payment_method, payment_status, subtotal, discount,
           delivery_fee, total, coupon_code, ship_name, ship_phone, ship_email, ship_address, ship_area, ship_district, notes)
         VALUES (?, ?, 'pending', 'cod', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, customerId, totals.subtotal, totals.discount, totals.deliveryFee, totals.total,
          totals.couponCode, input.name, input.phone, input.email, input.address, input.area, input.district,
          input.notes ?? "",
        ],
      );
      const orderId = Number(orderRes.lastInsertRowid);

      for (const line of lines) {
        const product = one<{ wholesale_cost: number }>(`SELECT wholesale_cost FROM products WHERE id = ?`, [
          line.product_id,
        ]);
        run(
          `INSERT INTO order_items (order_id, product_id, variant_id, name, sku, variant_label, unit_price, qty, line_total, unit_cost)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, line.product_id, line.variant_id, line.name, line.sku,
            `${line.size} / ${line.color}`, effectivePrice(line), line.qty, effectivePrice(line) * line.qty,
            product?.wholesale_cost ?? 0,
          ],
        );
        run(`UPDATE product_variants SET stock = MAX(stock - ?, 0) WHERE id = ?`, [line.qty, line.variant_id]);
        run(
          `INSERT INTO inventory_movements (product_id, variant_id, change_qty, reason, reference, note)
           VALUES (?, ?, ?, 'order', ?, 'Automatic reduction on order placement')`,
          [line.product_id, line.variant_id, -line.qty, orderNumber],
        );
      }

      if (totals.couponCode) {
        run(`UPDATE coupons SET used_count = used_count + 1 WHERE code = ?`, [totals.couponCode]);
      }

      run(`DELETE FROM cart_items WHERE cart_id = ?`, [input.cartId]);
      return { ok: true, orderNumber, total: totals.total };
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not place the order." };
  }
}
