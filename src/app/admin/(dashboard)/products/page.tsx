import type { Metadata } from "next";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { listCategories } from "@/lib/repo";
import { formatBdt } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";
import { deleteProductAction, toggleProductActiveAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

type Row = {
  id: number; sku: string; name: string; slug: string; category_name: string; retail_price: number;
  sale_price: number | null; wholesale_cost: number; is_active: number; stock: number;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const cat = (Array.isArray(sp.category) ? sp.category[0] : sp.category) ?? "";
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const perPage = 25;

  const where = ["1=1"];
  const params: unknown[] = [];
  if (q) { where.push("(p.name LIKE ? OR p.sku LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (cat) { where.push("c.slug = ?"); params.push(cat); }

  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id=p.category_id WHERE ${where.join(" AND ")}`, params)?.n ?? 0;
  const rows = all<Row>(
    `SELECT p.id, p.sku, p.name, p.slug, c.name AS category_name, p.retail_price, p.sale_price,
            p.wholesale_cost, p.is_active,
            (SELECT COALESCE(SUM(stock),0) FROM product_variants v WHERE v.product_id = p.id) AS stock
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE ${where.join(" AND ")} ORDER BY p.id LIMIT ? OFFSET ?`,
    [...params, perPage, (page - 1) * perPage],
  );
  const categories = listCategories();
  const pages = Math.ceil(total / perPage);

  const qs = (p: number) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (cat) s.set("category", cat);
    if (p > 1) s.set("page", String(p));
    return `/admin/products?${s.toString()}`;
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Products</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-mute)]">{total} products · {categories.length} categories</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm"><Icon name="plus" size={13} /> New product</Link>
      </header>

      <form className="card flex flex-wrap items-end gap-3 p-4" method="get">
        <div className="min-w-40 flex-1">
          <label htmlFor="q" className="label">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name or SKU" className="field h-10 min-h-0" />
        </div>
        <div className="min-w-40">
          <label htmlFor="category" className="label">Category</label>
          <select id="category" name="category" defaultValue={cat} className="field h-10 min-h-0">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn btn-outline btn-sm">Filter</button>
        {q || cat ? <Link href="/admin/products" className="text-xs underline">Clear</Link> : null}
      </form>

      <div className="card overflow-x-auto">
        <table className="table-base min-w-[820px]">
          <thead>
            <tr>
              <th>Product</th><th>Category</th><th className="text-right">Cost</th><th className="text-right">Retail</th>
              <th className="text-right">Margin</th><th className="text-right">Stock</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const price = r.sale_price ?? r.retail_price;
              const margin = price > 0 ? Math.round(((price - r.wholesale_cost) / price) * 100) : 0;
              return (
                <tr key={r.id}>
                  <td className="max-w-64">
                    <Link href={`/admin/products/${r.id}`} className="block truncate text-xs font-semibold hover:underline">{r.name}</Link>
                    <span className="font-mono text-[0.625rem] text-[var(--color-ink-mute)]">{r.sku}</span>
                  </td>
                  <td className="text-xs">{r.category_name}</td>
                  <td className="text-right text-xs tabular-nums">{formatBdt(r.wholesale_cost)}</td>
                  <td className="text-right text-xs tabular-nums">
                    {formatBdt(price)}
                    {r.sale_price ? <span className="block text-[0.625rem] text-[var(--color-sale)] line-through">{formatBdt(r.retail_price)}</span> : null}
                  </td>
                  <td className={`text-right text-xs tabular-nums ${margin < 25 ? "text-[var(--color-warn)]" : ""}`}>{margin}%</td>
                  <td className="text-right text-xs tabular-nums">
                    <span className={`badge ${r.stock === 0 ? "badge-out" : r.stock <= 5 ? "badge-low" : ""}`}>{r.stock}</span>
                  </td>
                  <td>
                    <span className={`badge ${r.is_active ? "badge-new" : "badge-out"}`}>{r.is_active ? "Active" : "Hidden"}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/products/${r.id}`} className="rounded border border-[var(--color-line-strong)] px-2 py-1 text-[0.625rem] hover:border-[var(--color-ink)]">Edit</Link>
                      <form action={toggleProductActiveAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded border border-[var(--color-line-strong)] px-2 py-1 text-[0.625rem] hover:border-[var(--color-ink)]">
                          {r.is_active ? "Hide" : "Show"}
                        </button>
                      </form>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded border border-[var(--color-danger-line)] px-2 py-1 text-[0.625rem] text-[var(--color-danger)] hover:border-[var(--color-danger)]">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">
        Deleting a product that appears in an order will hide it instead, so order history stays intact.
      </p>

      {pages > 1 ? (
        <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={qs(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs ${
                p === page ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-line-strong)] bg-[var(--color-surface)]"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
