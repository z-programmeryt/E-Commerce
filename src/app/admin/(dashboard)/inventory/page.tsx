import type { Metadata } from "next";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { formatBdt } from "@/lib/brand";
import { StockAdjustForm } from "@/components/admin/StockAdjustForm";

export const metadata: Metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = (Array.isArray(sp.filter) ? sp.filter[0] : sp.filter) ?? "all";
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const perPage = 30;

  const where = ["1=1"];
  const params: unknown[] = [];
  if (filter === "low") where.push("v.stock > 0 AND v.stock <= 5");
  if (filter === "out") where.push("v.stock = 0");
  if (q) { where.push("(p.name LIKE ? OR v.variant_sku LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }

  const total = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM product_variants v JOIN products p ON p.id=v.product_id WHERE ${where.join(" AND ")}`, params,
  )?.n ?? 0;

  const rows = all<{
    id: number; variant_sku: string; size: string; color: string; stock: number;
    name: string; sku: string; wholesale_cost: number; retail_price: number; sale_price: number | null;
  }>(
    `SELECT v.id, v.variant_sku, v.size, v.color, v.stock, p.name, p.sku, p.wholesale_cost, p.retail_price, p.sale_price
     FROM product_variants v JOIN products p ON p.id = v.product_id
     WHERE ${where.join(" AND ")} ORDER BY v.stock ASC, p.name LIMIT ? OFFSET ?`,
    [...params, perPage, (page - 1) * perPage],
  );

  const stats = one<{ units: number; cost: number; retail: number }>(
    `SELECT COALESCE(SUM(v.stock),0) AS units,
            COALESCE(SUM(v.stock * p.wholesale_cost),0) AS cost,
            COALESCE(SUM(v.stock * COALESCE(p.sale_price,p.retail_price)),0) AS retail
     FROM product_variants v JOIN products p ON p.id = v.product_id`,
  );
  const low = one<{ n: number }>(`SELECT COUNT(*) AS n FROM product_variants WHERE stock > 0 AND stock <= 5`)?.n ?? 0;
  const out = one<{ n: number }>(`SELECT COUNT(*) AS n FROM product_variants WHERE stock = 0`)?.n ?? 0;

  const variants = all<{ id: number; label: string }>(
    `SELECT v.id, p.name || ' · ' || v.size || ' / ' || v.color || ' (' || v.stock || ')' AS label
     FROM product_variants v JOIN products p ON p.id = v.product_id ORDER BY p.name LIMIT 400`,
  );
  const pages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Inventory</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
          {stats?.units ?? 0} units across {total} variants · cost value {formatBdt(stats?.cost ?? 0)} · retail value {formatBdt(stats?.retail ?? 0)}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "All variants" },
              { key: "low", label: `Low stock (${low})` },
              { key: "out", label: `Out of stock (${out})` },
            ].map((f) => (
              <Link key={f.key} href={`/admin/inventory?filter=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`badge ${filter === f.key ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : ""}`}>
                {f.label}
              </Link>
            ))}
          </div>

          <form method="get" className="card flex gap-2 p-3">
            <input type="hidden" name="filter" value={filter} />
            <input name="q" defaultValue={q} placeholder="Search product or variant SKU" className="field h-9 min-h-0 flex-1 text-xs" aria-label="Search inventory" />
            <button className="btn btn-outline btn-sm">Search</button>
          </form>

          <div className="card overflow-x-auto">
            <table className="table-base min-w-[680px]">
              <thead><tr><th>Variant</th><th>Product</th><th className="text-right">Cost</th><th className="text-right">Retail</th><th className="text-right">Stock</th><th className="text-right">Cost value</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-[0.6875rem]">{r.variant_sku}<span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{r.size} / {r.color}</span></td>
                    <td className="max-w-56 truncate text-xs">{r.name}</td>
                    <td className="text-right text-xs tabular-nums">{formatBdt(r.wholesale_cost)}</td>
                    <td className="text-right text-xs tabular-nums">{formatBdt(r.sale_price ?? r.retail_price)}</td>
                    <td className="text-right">
                      <span className={`badge ${r.stock === 0 ? "badge-out" : r.stock <= 5 ? "badge-low" : ""}`}>{r.stock}</span>
                    </td>
                    <td className="text-right text-xs tabular-nums">{formatBdt(r.stock * r.wholesale_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 ? (
            <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
              {Array.from({ length: Math.min(pages, 12) }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/admin/inventory?filter=${filter}&page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs ${p === page ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-line-strong)] bg-[var(--color-surface)]"}`}>
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4">
            <h2 className="font-display text-lg">Adjust stock</h2>
            <p className="mb-3 text-[0.6875rem] text-[var(--color-ink-mute)]">Records a movement row for the audit trail.</p>
            <StockAdjustForm variants={variants} />
          </div>
          <div className="card p-4">
            <h2 className="font-display text-base">Recent movements</h2>
            <ul className="mt-2 space-y-1.5 text-[0.6875rem]">
              {all<{ change_qty: number; reason: string; reference: string; created_at: string }>(
                `SELECT change_qty, reason, reference, created_at FROM inventory_movements ORDER BY id DESC LIMIT 8`,
              ).map((m, i) => (
                <li key={i} className="flex justify-between gap-2 border-b border-[var(--color-line)] pb-1">
                  <span>
                    <span className={m.change_qty > 0 ? "font-semibold text-[var(--color-success)]" : "font-semibold text-[var(--color-sale)]"}>
                      {m.change_qty > 0 ? "+" : ""}{m.change_qty}
                    </span>{" "}
                    {m.reason}
                  </span>
                  <span className="text-[var(--color-ink-mute)]">{m.reference}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
