import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { one, all } from "@/lib/db";
import { listCategories } from "@/lib/repo";
import { ProductForm } from "@/components/admin/ProductForm";
import { formatBdt } from "@/lib/brand";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = one<Record<string, unknown>>(`SELECT * FROM products WHERE id = ?`, [Number(id)]);
  if (!product) notFound();
  const categories = listCategories();
  const variants = all<{ id: number; variant_sku: string; size: string; color: string; stock: number }>(
    `SELECT id, variant_sku, size, color, stock FROM product_variants WHERE product_id = ? ORDER BY color, size`,
    [Number(id)],
  );

  return (
    <div className="space-y-4">
      <nav className="text-xs text-[var(--color-ink-mute)]">
        <Link href="/admin/products" className="hover:underline">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink)]">{String(product.name)}</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl">{String(product.name)}</h1>
        <Link href={`/product/${String(product.slug)}`} className="btn btn-outline btn-sm">View on storefront</Link>
      </div>

      <ProductForm
        product={product as never}
        categories={categories}
      />

      <section className="card p-5">
        <h2 className="font-display text-lg">Variants & stock</h2>
        <p className="mb-3 text-xs text-[var(--color-ink-mute)]">
          {variants.length} variants. Adjust stock from <Link href="/admin/inventory" className="underline">Inventory</Link>.
        </p>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Variant SKU</th><th>Colour</th><th>Size</th><th className="text-right">Stock</th></tr></thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  <td className="font-mono text-[0.6875rem]">{v.variant_sku}</td>
                  <td className="text-xs">{v.color}</td>
                  <td className="text-xs">{v.size}</td>
                  <td className="text-right text-xs">
                    <span className={`badge ${v.stock === 0 ? "badge-out" : v.stock <= 5 ? "badge-low" : ""}`}>{v.stock}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg">Recent stock movements</h2>
        <ul className="mt-3 space-y-1.5 text-xs">
          {all<{ change_qty: number; reason: string; reference: string; created_at: string; note: string }>(
            `SELECT change_qty, reason, reference, created_at, note FROM inventory_movements WHERE product_id = ? ORDER BY id DESC LIMIT 10`,
            [Number(id)],
          ).map((m, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-[var(--color-line)] pb-1.5">
              <span>
                <span className={m.change_qty > 0 ? "font-semibold text-[var(--color-success)]" : "font-semibold text-[var(--color-sale)]"}>
                  {m.change_qty > 0 ? "+" : ""}{m.change_qty}
                </span>{" "}
                <span className="text-[var(--color-ink-soft)]">{m.reason} · {m.reference}</span>
              </span>
              <span className="text-[var(--color-ink-mute)]">{m.created_at} · {m.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.6875rem] text-[var(--color-ink-mute)]">
          Current retail: {formatBdt(Number(product.retail_price))} · wholesale: {formatBdt(Number(product.wholesale_cost))}
        </p>
      </section>
    </div>
  );
}
