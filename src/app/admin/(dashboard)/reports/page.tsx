import type { Metadata } from "next";
import Link from "next/link";
import { categoryPerformance, dashboardMetrics, monthlyPnL, ordersByStatus, topProductsByRevenue } from "@/lib/admin-reports";
import { all } from "@/lib/db";
import { formatBdt } from "@/lib/brand";
import { BarList, StackedBar } from "@/components/admin/Charts";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

const EXPORTS = [
  { slug: "products", label: "Products", desc: "Catalogue with cost, retail price, stock and margin" },
  { slug: "orders", label: "Orders", desc: "All orders with status, totals and destination" },
  { slug: "order-items", label: "Order items", desc: "Line-level detail including unit cost" },
  { slug: "customers", label: "Customers", desc: "Customers with order count and lifetime value" },
  { slug: "inventory", label: "Inventory", desc: "Every variant with current stock and value" },
  { slug: "profit", label: "Profitability", desc: "Revenue, cost and contribution per product" },
];

export default async function ReportsPage() {
  const m = dashboardMetrics();
  const statuses = ordersByStatus();
  const month = monthlyPnL();
  const top = topProductsByRevenue(10);
  const cats = categoryPerformance();
  const scenarios = all<{ label: string; revenue: number; cost: number }>(
    `SELECT 'Delivered only' AS label, COALESCE(SUM(o.total),0) AS revenue,
            (SELECT COALESCE(SUM(oi.unit_cost*oi.qty),0) FROM order_items oi JOIN orders o2 ON o2.id=oi.order_id WHERE o2.status='delivered') AS cost
     FROM orders o WHERE o.status='delivered'
     UNION ALL
     SELECT 'All non-cancelled' AS label, COALESCE(SUM(o.total),0) AS revenue,
            (SELECT COALESCE(SUM(oi.unit_cost*oi.qty),0) FROM order_items oi JOIN orders o2 ON o2.id=oi.order_id WHERE o2.status NOT IN ('cancelled','returned'))
     FROM orders o WHERE o.status NOT IN ('cancelled','returned')`,
  );

  const grossMargin = m.revenue > 0 ? (m.contribution / m.revenue) * 100 : 0;
  const deliveryCollected = all<{ s: number }>(`SELECT COALESCE(SUM(delivery_fee),0) AS s FROM orders WHERE status NOT IN ('cancelled','returned')`)[0]?.s ?? 0;
  const courierEstimate = all<{ n: number; inside: number }>(
    `SELECT COUNT(*) AS n, SUM(CASE WHEN ship_district='Dhaka' THEN 1 ELSE 0 END) AS inside FROM orders WHERE status NOT IN ('cancelled','returned')`,
  )[0] ?? { n: 0, inside: 0 };
  const courierCost = courierEstimate.inside * 60 + (courierEstimate.n - courierEstimate.inside) * 115;
  const packagingCost = courierEstimate.n * 25;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl">Reports</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">Sales, profitability and CSV exports from the local database.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Revenue", value: formatBdt(m.revenue), hint: "Non-cancelled order value" },
          { label: "Product cost", value: formatBdt(m.productCost), hint: "Snapshot cost at sale time" },
          { label: "Gross contribution", value: formatBdt(m.contribution), hint: `${grossMargin.toFixed(1)}% margin on revenue` },
          { label: "Delivery collected", value: formatBdt(deliveryCollected), hint: `${courierEstimate.n} shipments` },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">{k.label}</p>
            <p className="mt-1.5 font-display text-xl">{k.value}</p>
            <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">{k.hint}</p>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg">Contribution walk-forward (estimated)</h2>
        <p className="text-xs text-[var(--color-ink-mute)]">
          Starts from gross contribution and subtracts estimated courier and packaging cost. Advertising, salaries,
          rent and payment fees are <strong>not</strong> in this database, so the last line is not net profit.
        </p>
        <table className="table-base mt-3">
          <tbody>
            <tr><td>Gross contribution (revenue − product cost)</td><td className="text-right font-semibold">{formatBdt(m.contribution)}</td></tr>
            <tr><td>Less estimated courier cost (৳60 Dhaka / ৳115 outside)</td><td className="text-right text-[var(--color-sale)]">−{formatBdt(courierCost)}</td></tr>
            <tr><td>Less packaging (৳25 per shipment)</td><td className="text-right text-[var(--color-sale)]">−{formatBdt(packagingCost)}</td></tr>
            <tr className="border-t-2 border-[var(--color-line-strong)]">
              <td className="font-semibold">Contribution after delivery and packaging</td>
              <td className="text-right font-semibold">{formatBdt(m.contribution - courierCost - packagingCost)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-[0.6875rem] text-[var(--color-ink-mute)]">
          Courier and packaging figures are planning assumptions from the business workbook, not invoices.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-lg">Order status split</h2>
          <div className="mt-3">
            <StackedBar
              segments={statuses.map((s) => ({
                label: s.status,
                value: s.count,
                className: {
                  pending: "bg-[#b98527]", confirmed: "bg-[#7b8a6b]", packed: "bg-[#5d6a4f]",
                  shipped: "bg-[#3f5b6b]", delivered: "bg-[#3f6b4f]", cancelled: "bg-[#a4553a]", returned: "bg-[#8a6516]",
                }[s.status] ?? "bg-[var(--color-ink)]",
              }))}
            />
          </div>
          <table className="table-base mt-4">
            <thead><tr><th>Status</th><th className="text-right">Orders</th><th className="text-right">Value</th></tr></thead>
            <tbody>
              {statuses.map((s) => (
                <tr key={s.status}><td className="capitalize text-xs">{s.status}</td><td className="text-right text-xs">{s.count}</td><td className="text-right text-xs">{formatBdt(s.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg">Two revenue bases</h2>
          <p className="text-xs text-[var(--color-ink-mute)]">
            Read both before claiming a number. "Delivered only" is cash actually collected; the wider base includes
            orders still in transit that could still be returned.
          </p>
          <div className="mt-3 space-y-3">
            {scenarios.map((s) => (
              <div key={s.label} className="rounded-md border border-[var(--color-line)] p-3">
                <p className="text-xs font-semibold">{s.label}</p>
                <dl className="mt-1 grid grid-cols-3 gap-2 text-[0.6875rem]">
                  <div><dt className="text-[var(--color-ink-mute)]">Revenue</dt><dd className="font-semibold">{formatBdt(s.revenue)}</dd></div>
                  <div><dt className="text-[var(--color-ink-mute)]">Product cost</dt><dd>{formatBdt(s.cost)}</dd></div>
                  <div><dt className="text-[var(--color-ink-mute)]">Contribution</dt><dd className="font-semibold">{formatBdt(s.revenue - s.cost)}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-lg">Top products</h2>
          <div className="mt-3">
            <BarList items={top.map((t) => ({ label: t.name, value: t.revenue, hint: `${t.units} units · cost ${formatBdt(t.cost)}` }))} />
          </div>
        </section>
        <section className="card p-5">
          <h2 className="font-display text-lg">Revenue by month</h2>
          <table className="table-base mt-3">
            <thead><tr><th>Month</th><th className="text-right">Orders</th><th className="text-right">Revenue</th><th className="text-right">Cost</th><th className="text-right">Contribution</th></tr></thead>
            <tbody>
              {month.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-xs text-[var(--color-ink-mute)]">No orders yet</td></tr>
              ) : month.map((r) => (
                <tr key={r.month}>
                  <td className="text-xs">{r.month}</td>
                  <td className="text-right text-xs">{r.orders}</td>
                  <td className="text-right text-xs">{formatBdt(r.revenue)}</td>
                  <td className="text-right text-xs">{formatBdt(r.productCost)}</td>
                  <td className="text-right text-xs font-semibold">{formatBdt(r.revenue - r.productCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="font-display text-lg">Category contribution</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="table-base min-w-[540px]">
            <thead><tr><th>Category</th><th className="text-right">Units</th><th className="text-right">Revenue</th><th className="text-right">Cost</th><th className="text-right">Contribution</th><th className="text-right">Margin</th></tr></thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.category}>
                  <td className="text-xs">{c.category}</td>
                  <td className="text-right text-xs">{c.units}</td>
                  <td className="text-right text-xs">{formatBdt(c.revenue)}</td>
                  <td className="text-right text-xs">{formatBdt(c.cost)}</td>
                  <td className="text-right text-xs font-semibold">{formatBdt(c.revenue - c.cost)}</td>
                  <td className="text-right text-xs">{c.revenue > 0 ? `${Math.round(((c.revenue - c.cost) / c.revenue) * 100)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">CSV exports</h2>
          <span className="badge">Spreadsheet-safe</span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-ink-mute)]">Downloads are generated live from the database on each request.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXPORTS.map((e) => (
            <a key={e.slug} href={`/api/export/${e.slug}`} download
              className="flex items-start justify-between gap-3 rounded-md border border-[var(--color-line)] p-3 transition-colors hover:border-[var(--color-ink)]">
              <span>
                <span className="block text-xs font-semibold">{e.label}</span>
                <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{e.desc}</span>
              </span>
              <Icon name="download" size={15} className="mt-0.5 shrink-0 text-[var(--color-ink-mute)]" />
            </a>
          ))}
        </div>
        <p className="mt-3 text-[0.625rem] text-[var(--color-ink-mute)]">
          Requirement: signed-in admin. Values that begin with =, +, - or @ are prefixed with an apostrophe to
          prevent spreadsheet formula injection.
        </p>
      </section>

      <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">
        For the full planning model — sourcing, unit economics and break-even — open the{" "}
        <Link href="/pages/business-research" className="underline">business research page</Link>.
      </p>
    </div>
  );
}
