import Link from "next/link";
import {
  categoryPerformance, dashboardMetrics, lowStockList, ordersByStatus, recentOrders, revenueByDay, topProductsByRevenue,
} from "@/lib/admin-reports";
import { all } from "@/lib/db";
import { formatBdt, formatDate } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";
import { Sparkline, BarList, StatusBar } from "@/components/admin/Charts";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const m = dashboardMetrics();
  const statuses = ordersByStatus();
  const revenue = revenueByDay(45);
  const top = topProductsByRevenue(6);
  const cats = categoryPerformance().filter((c) => c.revenue > 0).slice(0, 6);
  const low = lowStockList(6);
  const recent = recentOrders(6);
  const migrations = all<{ name: string; applied_at: string }>(`SELECT name, applied_at FROM _migrations ORDER BY name`);

  const statusMap = Object.fromEntries(statuses.map((s) => [s.status, s.count]));
  const margin = m.revenue > 0 ? ((m.contribution / m.revenue) * 100).toFixed(1) : "0.0";

  const kpis = [
    { label: "Revenue (excl. cancelled)", value: formatBdt(m.revenue), sub: `${m.orderCount} orders · AOV ${formatBdt(m.avgOrderValue)}`, icon: "chart" },
    { label: "Product contribution", value: formatBdt(m.contribution), sub: `${margin}% of revenue (before overheads)`, icon: "tag" },
    { label: "Products", value: String(m.productCount), sub: `${m.activeProductCount} active · ${m.stockUnits} units in stock`, icon: "box" },
    { label: "Customers", value: String(m.customerCount), sub: `${m.pendingOrders} orders need action`, icon: "users" },
  ] as const;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Dashboard overview</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
            Every figure is read live from the local SQLite database.
          </p>
        </div>
        <Link href="/admin/reports" className="btn btn-outline btn-sm">
          <Icon name="download" size={13} /> Reports & CSV
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">{k.label}</p>
              <Icon name={k.icon} size={15} className="text-[var(--color-ink-mute)]" />
            </div>
            <p className="mt-2 font-display text-2xl">{k.value}</p>
            <p className="mt-1 text-[0.6875rem] leading-snug text-[var(--color-ink-mute)]">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg">Revenue trend</h2>
              <p className="text-xs text-[var(--color-ink-mute)]">Order value per day, last 45 days, excluding cancellations.</p>
            </div>
            <p className="text-right">
              <span className="block font-display text-lg">{formatBdt(revenue.reduce((s, r) => s + r.revenue, 0))}</span>
              <span className="text-[0.625rem] text-[var(--color-ink-mute)]">{revenue.reduce((s, r) => s + r.orders, 0)} orders</span>
            </p>
          </div>
          <Sparkline data={revenue} />
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg">Order status</h2>
          <p className="text-xs text-[var(--color-ink-mute)]">Where every order currently sits.</p>
          <div className="mt-4 space-y-2.5">
            {["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"].map((s) => (
              <StatusBar key={s} label={s} count={statusMap[s] ?? 0} total={m.orderCount} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-lg">Top products by revenue</h2>
          <p className="mb-3 text-xs text-[var(--color-ink-mute)]">Excludes cancelled and returned orders.</p>
          <BarList
            items={top.map((t) => ({
              label: t.name,
              value: t.revenue,
              hint: `${t.units} units · contribution ${formatBdt(t.revenue - t.cost)}`,
            }))}
          />
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg">Category performance</h2>
          <p className="mb-3 text-xs text-[var(--color-ink-mute)]">Revenue by catalogue category.</p>
          <BarList
            items={cats.map((c) => ({
              label: c.category,
              value: c.revenue,
              hint: `${c.units} units`,
            }))}
          />
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
            <h2 className="font-display text-lg">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]">View all</Link>
          </div>
          <table className="table-base">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Status</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.order_number}</Link>
                    <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{formatDate(o.created_at)}</span>
                  </td>
                  <td className="text-xs">{o.ship_name}</td>
                  <td><span className={`badge ${o.status === "delivered" ? "badge-new" : o.status === "cancelled" ? "badge-out" : "badge-low"}`}>{o.status}</span></td>
                  <td className="text-right text-xs font-semibold">{formatBdt(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
            <div>
              <h2 className="font-display text-lg">Low-stock alerts</h2>
              <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">{m.lowStockVariants} variants at 5 units or fewer · {m.outOfStockVariants} sold out</p>
            </div>
            <Link href="/admin/inventory" className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]">Manage</Link>
          </div>
          <table className="table-base">
            <thead><tr><th>Variant</th><th>Product</th><th className="text-right">Stock</th></tr></thead>
            <tbody>
              {low.map((l) => (
                <tr key={l.variant_sku}>
                  <td className="font-mono text-[0.6875rem]">{l.variant_sku}</td>
                  <td className="text-xs">{l.name}<span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{l.size} / {l.color}</span></td>
                  <td className="text-right">
                    <span className={`badge ${l.stock === 0 ? "badge-out" : "badge-low"}`}>{l.stock}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="font-display text-lg">Inventory valuation</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[0.625rem] uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">At wholesale cost</dt>
            <dd className="font-display text-xl">{formatBdt(m.inventoryValueAtCost)}</dd>
          </div>
          <div>
            <dt className="text-[0.625rem] uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">At retail value</dt>
            <dd className="font-display text-xl">{formatBdt(m.inventoryValueAtRetail)}</dd>
          </div>
          <div>
            <dt className="text-[0.625rem] uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">Potential gross margin</dt>
            <dd className="font-display text-xl">{formatBdt(m.inventoryValueAtRetail - m.inventoryValueAtCost)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[0.6875rem] leading-relaxed text-[var(--color-ink-mute)]">
          Valuation uses the recorded wholesale cost column. It shows potential
          margin on stock, not realised profit.
        </p>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[var(--color-surface)] px-4 py-3 text-[0.6875rem] text-[var(--color-ink-mute)]">
        <p>Database migrations applied: {migrations.map((x) => x.name).join(", ") || "none"}</p>
        <p>Last migration: {migrations.length ? formatDate(migrations[migrations.length - 1].applied_at) : "—"}</p>
      </footer>
    </div>
  );
}
