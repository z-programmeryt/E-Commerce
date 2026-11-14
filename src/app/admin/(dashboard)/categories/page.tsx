import type { Metadata } from "next";
import { all } from "@/lib/db";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { toggleCategoryAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = all<{
    id: number; slug: string; name: string; name_bn: string; blurb: string; icon: string;
    sort_order: number; is_active: number; products: number; subs: number;
  }>(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products,
            (SELECT COUNT(*) FROM subcategories s WHERE s.category_id = c.id) AS subs
     FROM categories c ORDER BY c.sort_order`,
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Categories</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">{rows.length} categories · hides immediately from the storefront navigation</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card overflow-x-auto">
          <table className="table-base min-w-[620px]">
            <thead><tr><th>#</th><th>Category</th><th>Slug</th><th className="text-right">Products</th><th className="text-right">Subcategories</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="text-xs text-[var(--color-ink-mute)]">{c.sort_order}</td>
                  <td className="text-xs">
                    <span className="font-semibold">{c.name}</span>
                    <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{c.name_bn}</span>
                  </td>
                  <td className="font-mono text-[0.625rem]">{c.slug}</td>
                  <td className="text-right text-xs tabular-nums">{c.products}</td>
                  <td className="text-right text-xs tabular-nums">{c.subs}</td>
                  <td><span className={`badge ${c.is_active ? "badge-new" : "badge-out"}`}>{c.is_active ? "Active" : "Hidden"}</span></td>
                  <td>
                    <form action={toggleCategoryAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="rounded border border-[var(--color-line-strong)] px-2 py-1 text-[0.625rem] hover:border-[var(--color-ink)]">
                        {c.is_active ? "Hide" : "Show"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4">
            <h2 className="font-display text-lg">Add or update</h2>
            <p className="mb-3 text-[0.6875rem] text-[var(--color-ink-mute)]">
              Uses the slug as the key: an existing slug updates that category.
            </p>
            <CategoryForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
