import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { all } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/** Signed-in admin only — dashboard exports must not be publicly readable. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  }

  const { type } = await params;
  let rows: Record<string, unknown>[] = [];
  let filename = `super-z-shop-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  switch (type) {
    case "products":
      rows = all(
        `SELECT p.sku, p.name, p.name_bn, c.name AS category, p.subcategory,
                p.wholesale_cost AS wholesale_cost_bdt,
                p.retail_price AS retail_price_bdt,
                COALESCE(p.sale_price, p.retail_price) AS selling_price_bdt,
                ROUND((COALESCE(p.sale_price, p.retail_price) - p.wholesale_cost) * 100.0
                      / COALESCE(p.sale_price, p.retail_price), 1) AS gross_margin_pct,
                (SELECT COALESCE(SUM(stock),0) FROM product_variants v WHERE v.product_id = p.id) AS stock_units,
                p.moq, p.price_status, p.is_active
         FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.id`,
      );
      break;
    case "orders":
      rows = all(
        `SELECT o.order_number, o.created_at, o.status, o.payment_method, o.payment_status,
                o.ship_name, o.ship_phone, o.ship_email, o.ship_area, o.ship_district,
                o.subtotal, o.discount, o.delivery_fee, o.total, o.coupon_code, o.courier, o.tracking_code
         FROM orders o ORDER BY o.id`,
      );
      break;
    case "order-items":
      rows = all(
        `SELECT o.order_number, o.created_at, oi.sku, oi.name, oi.variant_label, oi.qty,
                oi.unit_price, oi.line_total, oi.unit_cost, (oi.line_total - oi.unit_cost * oi.qty) AS line_contribution
         FROM order_items oi JOIN orders o ON o.id = oi.order_id ORDER BY o.id, oi.id`,
      );
      break;
    case "customers":
      rows = all(
        `SELECT c.name, c.email, c.phone, c.created_at,
                (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders,
                (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned')) AS lifetime_value_bdt
         FROM customers c ORDER BY lifetime_value_bdt DESC`,
      );
      break;
    case "inventory":
      rows = all(
        `SELECT p.sku, p.name, v.variant_sku, v.size, v.color, v.stock,
                p.wholesale_cost, (v.stock * p.wholesale_cost) AS stock_value_at_cost,
                COALESCE(p.sale_price, p.retail_price) AS selling_price,
                (v.stock * COALESCE(p.sale_price, p.retail_price)) AS stock_value_at_retail
         FROM product_variants v JOIN products p ON p.id = v.product_id ORDER BY p.id, v.id`,
      );
      break;
    case "profit":
      rows = all(
        `SELECT p.sku, p.name, c.name AS category,
                COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','returned') THEN oi.qty ELSE 0 END),0) AS units_sold,
                COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','returned') THEN oi.line_total ELSE 0 END),0) AS revenue_bdt,
                COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','returned') THEN oi.unit_cost * oi.qty ELSE 0 END),0) AS product_cost_bdt,
                COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','returned') THEN oi.line_total - oi.unit_cost * oi.qty ELSE 0 END),0) AS contribution_bdt
         FROM products p
         JOIN categories c ON c.id = p.category_id
         LEFT JOIN order_items oi ON oi.product_id = p.id
         LEFT JOIN orders o ON o.id = oi.order_id
         GROUP BY p.id ORDER BY contribution_bdt DESC`,
      );
      break;
    default:
      return NextResponse.json({ error: "Unknown export type" }, { status: 404 });
  }

  const csv = rows.length === 0 ? "no rows" : toCsv(rows);
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
