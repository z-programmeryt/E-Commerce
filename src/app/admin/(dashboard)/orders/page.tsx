import type { Metadata } from "next";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { formatBdt, formatDate } from "@/lib/brand";
import { updateOrderStatusAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "";
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();

  const where = ["1=1"];
  const params: unknown[] = [];
  if (status) { where.push("o.status = ?"); params.push(status); }
  if (q) { where.push("(o.order_number LIKE ? OR o.ship_name LIKE ? OR o.ship_phone LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }

  const rows = all<{
    id: number; order_number: string; ship_name: string; ship_phone: string; ship_district: string;
    status: string; total: number; created_at: string; items: number; courier: string;
  }>(
    `SELECT o.id, o.order_number, o.ship_name, o.ship_phone, o.ship_district, o.status, o.total, o.created_at, o.courier,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items
     FROM orders o WHERE ${where.join(" AND ")} ORDER BY o.id DESC`,
    params,
  );
  const counts = all<{ status: string; n: number }>(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`);
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c.n]));
  const totalRevenue = one<{ s: number }>(`SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status NOT IN ('cancelled','returned')`)?.s ?? 0;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Orders</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
          {rows.length} shown · {formatBdt(totalRevenue)} realised on non-cancelled orders
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        <Link href="/admin/orders" className={`badge ${!status ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : ""}`}>
          All orders
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`badge capitalize ${status === s ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : ""}`}>
            {s} {countMap[s] ? `(${countMap[s]})` : ""}
          </Link>
        ))}
      </div>

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="label">Search orders</label>
          <input id="q" name="q" defaultValue={q} placeholder="Order number, name or phone" className="field h-10 min-h-0" />
        </div>
        <button className="btn btn-outline btn-sm">Search</button>
        {q ? <Link href="/admin/orders" className="text-xs underline">Clear</Link> : null}
      </form>

      <div className="card overflow-x-auto">
        <table className="table-base min-w-[860px]">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>District</th><th className="text-right">Items</th><th className="text-right">Total</th><th>Status</th><th>Update</th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.order_number}</Link>
                  <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{formatDate(o.created_at)}</span>
                </td>
                <td className="text-xs">
                  {o.ship_name}
                  <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{o.ship_phone}</span>
                </td>
                <td className="text-xs">{o.ship_district}</td>
                <td className="text-right text-xs tabular-nums">{o.items}</td>
                <td className="text-right text-xs font-semibold tabular-nums">{formatBdt(o.total)}</td>
                <td>
                  <span className={`badge ${o.status === "delivered" ? "badge-new" : o.status === "cancelled" ? "badge-out" : "badge-low"}`}>{o.status}</span>
                </td>
                <td>
                  <form action={updateOrderStatusAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className="field h-8 min-h-0 w-28 py-0 text-[0.6875rem]" aria-label={`Status for ${o.order_number}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="rounded border border-[var(--color-line-strong)] px-2 py-1 text-[0.625rem] hover:border-[var(--color-ink)]">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">
        Setting an order to <strong>cancelled</strong> returns its units to inventory once and logs the movement.
      </p>
    </div>
  );
}
