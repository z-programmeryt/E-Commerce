/**
 * Reporting queries for the admin dashboard. All figures come from the local
 * database. "Revenue" means gross collected order value; "contribution" means
 * revenue minus product cost — it is not net profit (overheads are excluded,
 * because this demo has no operating-expense ledger).
 */
import { all, one } from "./db";

export type DashboardMetrics = {
  productCount: number;
  activeProductCount: number;
  orderCount: number;
  customerCount: number;
  revenue: number;
  deliveredRevenue: number;
  productCost: number;
  contribution: number;
  avgOrderValue: number;
  pendingOrders: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  stockUnits: number;
  inventoryValueAtCost: number;
  inventoryValueAtRetail: number;
};

export function dashboardMetrics(): DashboardMetrics {
  const productCount = one<{ n: number }>(`SELECT COUNT(*) AS n FROM products`)?.n ?? 0;
  const activeProductCount = one<{ n: number }>(`SELECT COUNT(*) AS n FROM products WHERE is_active = 1`)?.n ?? 0;
  const orderCount = one<{ n: number }>(`SELECT COUNT(*) AS n FROM orders`)?.n ?? 0;
  const customerCount = one<{ n: number }>(`SELECT COUNT(*) AS n FROM customers`)?.n ?? 0;

  const revenue = one<{ s: number }>(
    `SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status NOT IN ('cancelled','returned')`,
  )?.s ?? 0;
  const deliveredRevenue = one<{ s: number }>(
    `SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status = 'delivered'`,
  )?.s ?? 0;
  const productCost = one<{ s: number }>(
    `SELECT COALESCE(SUM(oi.unit_cost * oi.qty),0) AS s FROM order_items oi
     JOIN orders o ON o.id = oi.order_id WHERE o.status NOT IN ('cancelled','returned')`,
  )?.s ?? 0;
  const avgOrderValue = one<{ s: number }>(
    `SELECT COALESCE(AVG(total),0) AS s FROM orders WHERE status NOT IN ('cancelled','returned')`,
  )?.s ?? 0;
  const pendingOrders = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','confirmed','packed')`,
  )?.n ?? 0;
  const lowStockVariants = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM product_variants WHERE stock > 0 AND stock <= 5`,
  )?.n ?? 0;
  const outOfStockVariants = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM product_variants WHERE stock = 0`,
  )?.n ?? 0;
  const stockUnits = one<{ n: number }>(`SELECT COALESCE(SUM(stock),0) AS n FROM product_variants`)?.n ?? 0;
  const inventoryValueAtCost = one<{ s: number }>(
    `SELECT COALESCE(SUM(v.stock * p.wholesale_cost),0) AS s FROM product_variants v JOIN products p ON p.id = v.product_id`,
  )?.s ?? 0;
  const inventoryValueAtRetail = one<{ s: number }>(
    `SELECT COALESCE(SUM(v.stock * COALESCE(p.sale_price, p.retail_price)),0) AS s FROM product_variants v JOIN products p ON p.id = v.product_id`,
  )?.s ?? 0;

  return {
    productCount, activeProductCount, orderCount, customerCount,
    revenue: Math.round(revenue), deliveredRevenue: Math.round(deliveredRevenue),
    productCost: Math.round(productCost), contribution: Math.round(revenue - productCost),
    avgOrderValue: Math.round(avgOrderValue), pendingOrders, lowStockVariants, outOfStockVariants,
    stockUnits, inventoryValueAtCost: Math.round(inventoryValueAtCost),
    inventoryValueAtRetail: Math.round(inventoryValueAtRetail),
  };
}

export function ordersByStatus(): { status: string; count: number; total: number }[] {
  return all(`SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS total FROM orders GROUP BY status ORDER BY count DESC`);
}

export function revenueByDay(days = 30): { day: string; orders: number; revenue: number }[] {
  return all(
    `SELECT substr(created_at,1,10) AS day, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
     FROM orders WHERE status NOT IN ('cancelled','returned')
       AND date(created_at) >= date('now', ?)
     GROUP BY day ORDER BY day`,
    [`-${days} days`],
  );
}

export function topProductsByRevenue(limit = 8) {
  return all<{ name: string; sku: string; units: number; revenue: number; cost: number }>(
    `SELECT oi.name, oi.sku, SUM(oi.qty) AS units, SUM(oi.line_total) AS revenue, SUM(oi.unit_cost * oi.qty) AS cost
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status NOT IN ('cancelled','returned')
     GROUP BY oi.product_id ORDER BY revenue DESC LIMIT ?`,
    [limit],
  );
}

export function categoryPerformance() {
  return all<{ category: string; units: number; revenue: number; cost: number }>(
    `SELECT c.name AS category, COALESCE(SUM(oi.qty),0) AS units,
            COALESCE(SUM(oi.line_total),0) AS revenue, COALESCE(SUM(oi.unit_cost * oi.qty),0) AS cost
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id AND o.status NOT IN ('cancelled','returned')
     GROUP BY c.id ORDER BY revenue DESC`,
  );
}

export function lowStockList(limit = 12) {
  return all<{ variant_sku: string; name: string; size: string; color: string; stock: number; sku: string }>(
    `SELECT v.variant_sku, p.name, v.size, v.color, v.stock, p.sku
     FROM product_variants v JOIN products p ON p.id = v.product_id
     WHERE v.stock <= 5 ORDER BY v.stock ASC, p.name LIMIT ?`,
    [limit],
  );
}

export function recentOrders(limit = 8) {
  return all<{ id: number; order_number: string; ship_name: string; total: number; status: string; created_at: string }>(
    `SELECT id, order_number, ship_name, total, status, created_at FROM orders ORDER BY id DESC LIMIT ?`,
    [limit],
  );
}

export function monthlyPnL() {
  return all<{ month: string; orders: number; revenue: number; productCost: number; deliveryCollected: number }>(
    `SELECT substr(o.created_at,1,7) AS month, COUNT(*) AS orders,
            COALESCE(SUM(o.total),0) AS revenue,
            COALESCE(SUM(o.delivery_fee),0) AS deliveryCollected,
            (SELECT COALESCE(SUM(oi.unit_cost*oi.qty),0) FROM order_items oi WHERE oi.order_id IN (
               SELECT id FROM orders o2 WHERE substr(o2.created_at,1,7) = substr(o.created_at,1,7)
                 AND o2.status NOT IN ('cancelled','returned')
            )) AS productCost
     FROM orders o WHERE o.status NOT IN ('cancelled','returned')
     GROUP BY month ORDER BY month`,
  );
}
