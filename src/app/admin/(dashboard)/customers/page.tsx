import type { Metadata } from "next";
import Link from "next/link";
import { all } from "@/lib/db";
import { formatBdt, formatDate } from "@/lib/brand";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();
  const params: unknown[] = [];
  let filter = "";
  if (q) {
    filter = "WHERE (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const rows = all<{
    id: number; name: string; email: string; phone: string; created_at: string;
    orders: number; spent: number; last_order: string | null; district: string | null;
  }>(
    `SELECT c.id, c.name, c.email, c.phone, c.created_at,
            (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders,
            (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned')) AS spent,
            (SELECT MAX(created_at) FROM orders o WHERE o.customer_id = c.id) AS last_order,
            (SELECT district FROM addresses a WHERE a.customer_id = c.id LIMIT 1) AS district
     FROM customers c ${filter} ORDER BY spent DESC LIMIT 100`,
    params,
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Customers</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">{rows.length} customers · sorted by lifetime value</p>
      </header>

      <form method="get" className="card flex gap-2 p-3">
        <input name="q" defaultValue={q} placeholder="Name, email or phone" className="field h-9 min-h-0 flex-1 text-xs" aria-label="Search customers" />
        <button className="btn btn-outline btn-sm">Search</button>
        {q ? <Link href="/admin/customers" className="self-center text-xs underline">Clear</Link> : null}
      </form>

      <div className="card overflow-x-auto">
        <table className="table-base min-w-[720px]">
          <thead><tr><th>Customer</th><th>Contact</th><th>District</th><th className="text-right">Orders</th><th className="text-right">Lifetime value</th><th>Last order</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="text-xs">
                  <span className="font-semibold">{c.name}</span>
                  <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">Since {formatDate(c.created_at)}</span>
                </td>
                <td className="text-xs">{c.email}<span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{c.phone}</span></td>
                <td className="text-xs">{c.district ?? "—"}</td>
                <td className="text-right text-xs tabular-nums">{c.orders}</td>
                <td className="text-right text-xs font-semibold tabular-nums">{formatBdt(c.spent)}</td>
                <td className="text-xs">{c.last_order ? formatDate(c.last_order) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">
        Lifetime value counts non-cancelled order value. It is not profit, and excludes delivery cost and returns.
      </p>
    </div>
  );
}
