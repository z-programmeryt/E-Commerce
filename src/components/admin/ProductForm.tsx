"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProductAction, type AdminFormState } from "@/app/admin/actions";

type ProductRow = {
  id?: number; name?: string; slug?: string; sku?: string; category_id?: number; subcategory?: string;
  short_description?: string; description?: string; retail_price?: number; wholesale_cost?: number;
  sale_price?: number | null; moq?: number; warranty?: string; tags_json?: string; is_active?: number;
};

export function ProductForm({ product, categories }: { product?: ProductRow; categories: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveProductAction, { ok: false });
  const err = state.errors ?? {};
  const p = product ?? {};
  const tags = (() => {
    try { return (JSON.parse(p.tags_json ?? "[]") as string[]).join(", "); } catch { return ""; }
  })();

  return (
    <form action={action} className="space-y-4">
      {p.id ? <input type="hidden" name="id" value={p.id} /> : null}

      {state.message ? (
        <p className={`rounded-md px-3 py-2 text-xs ${state.ok ? "bg-[#f2f7f1] text-[#2f5539]" : "bg-[#fbf1ee] text-[#7e2b1f]"}`} role="status">
          {state.message}
        </p>
      ) : null}

      <div className="card p-5">
        <h2 className="mb-4 font-display text-lg">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="label">Product name *</label>
            <input id="name" name="name" defaultValue={p.name} required className="field" aria-invalid={!!err.name} />
            {err.name ? <p className="error-text">{err.name}</p> : null}
          </div>
          <div>
            <label htmlFor="slug" className="label">URL slug *</label>
            <input id="slug" name="slug" defaultValue={p.slug} required className="field font-mono text-xs" aria-invalid={!!err.slug} />
            {err.slug ? <p className="error-text">{err.slug}</p> : <p className="help">Lowercase, hyphens only.</p>}
          </div>
          <div>
            <label htmlFor="sku" className="label">SKU *</label>
            <input id="sku" name="sku" defaultValue={p.sku} required className="field font-mono text-xs" aria-invalid={!!err.sku} />
            {err.sku ? <p className="error-text">{err.sku}</p> : null}
          </div>
          <div>
            <label htmlFor="category_id" className="label">Category *</label>
            <select id="category_id" name="category_id" defaultValue={p.category_id} required className="field">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory" className="label">Subcategory *</label>
            <input id="subcategory" name="subcategory" defaultValue={p.subcategory} required className="field" aria-invalid={!!err.subcategory} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="short_description" className="label">Short description *</label>
            <input id="short_description" name="short_description" defaultValue={p.short_description} required className="field" aria-invalid={!!err.short_description} />
            {err.short_description ? <p className="error-text">{err.short_description}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">Full description</label>
            <textarea id="description" name="description" defaultValue={p.description} rows={5} className="field" />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 font-display text-lg">Pricing</h2>
        <p className="mb-4 text-xs text-[var(--color-ink-mute)]">
          All amounts in BDT. Wholesale cost is your own record — keep it accurate so reporting stays honest.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="retail_price" className="label">Retail price ৳ *</label>
            <input id="retail_price" name="retail_price" type="number" min={1} defaultValue={p.retail_price} required className="field" aria-invalid={!!err.retail_price} />
            {err.retail_price ? <p className="error-text">{err.retail_price}</p> : null}
          </div>
          <div>
            <label htmlFor="wholesale_cost" className="label">Wholesale cost ৳</label>
            <input id="wholesale_cost" name="wholesale_cost" type="number" min={0} defaultValue={p.wholesale_cost ?? 0} className="field" />
          </div>
          <div>
            <label htmlFor="sale_price" className="label">Sale price ৳</label>
            <input id="sale_price" name="sale_price" type="number" min={0} defaultValue={p.sale_price ?? ""} className="field" aria-invalid={!!err.sale_price} />
            {err.sale_price ? <p className="error-text">{err.sale_price}</p> : <p className="help">Leave blank for no sale.</p>}
          </div>
          <div>
            <label htmlFor="moq" className="label">Sourcing MOQ</label>
            <input id="moq" name="moq" type="number" min={1} defaultValue={p.moq ?? 6} className="field" />
          </div>
          <div>
            <label htmlFor="warranty" className="label">Replacement policy</label>
            <input id="warranty" name="warranty" defaultValue={p.warranty ?? "7-day replacement"} className="field" />
          </div>
          <div>
            <label htmlFor="is_active" className="label">Visibility</label>
            <select id="is_active" name="is_active" defaultValue={p.is_active === 0 ? "off" : "on"} className="field">
              <option value="on">Active — visible in shop</option>
              <option value="off">Hidden — drafts / discontinued</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="tags" className="label">Tags</label>
            <input id="tags" name="tags" defaultValue={tags} className="field" placeholder="eid, cotton, gift" />
            <p className="help">Comma separated. Used by collections and search.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : p.id ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
