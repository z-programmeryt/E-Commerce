"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authenticate, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { all, one, run, transaction } from "@/lib/db";

// ---------------------------------------------------------------------------
// Authentication (demo grade — see src/lib/auth.ts)
// ---------------------------------------------------------------------------
/**
 * Usable from a plain <form action={...}> so sign-in works without JavaScript.
 * On failure it redirects back with a readable message instead of returning
 * state, because a no-JS form has nowhere to render returned state.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=missing");

  const admin = await authenticate(email, password);
  if (!admin) redirect("/admin/login?error=invalid");

  await createSession(admin);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z.string().trim().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  sku: z.string().trim().min(3, "SKU is required"),
  category_id: z.coerce.number().int().positive("Choose a category"),
  subcategory: z.string().trim().min(1, "Subcategory is required"),
  short_description: z.string().trim().min(10, "Add a short description (10+ chars)"),
  description: z.string().trim().default(""),
  retail_price: z.coerce.number().int().min(1, "Retail price must be at least ৳1"),
  wholesale_cost: z.coerce.number().int().min(0).default(0),
  sale_price: z.union([z.coerce.number().int().min(0), z.literal("")]).optional(),
  moq: z.coerce.number().int().min(1).default(6),
  warranty: z.string().trim().default("7-day replacement"),
  tags: z.string().trim().default(""),
  is_active: z.union([z.literal("on"), z.literal("off")]).optional(),
});

export type AdminFormState = { ok: boolean; message?: string; errors?: Record<string, string> };

export async function saveProductAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;
  const salePrice = d.sale_price === "" || d.sale_price === undefined ? null : Number(d.sale_price);
  if (salePrice !== null && salePrice >= d.retail_price) {
    return { ok: false, message: "Sale price must be lower than the retail price.", errors: { sale_price: "Must be below retail price" } };
  }
  const tags = JSON.stringify(d.tags.split(",").map((t) => t.trim()).filter(Boolean));

  try {
    if (id) {
      run(
        `UPDATE products SET name=?, slug=?, sku=?, category_id=?, subcategory=?, short_description=?, description=?,
           retail_price=?, wholesale_cost=?, sale_price=?, moq=?, warranty=?, tags_json=?, is_active=?, updated_at=datetime('now')
         WHERE id=?`,
        [d.name, d.slug, d.sku, d.category_id, d.subcategory, d.short_description, d.description,
         d.retail_price, d.wholesale_cost, salePrice, d.moq, d.warranty, tags, d.is_active === "on" ? 1 : 0, id],
      );
      revalidatePath(`/admin/products`);
      revalidatePath(`/product/${d.slug}`);
      return { ok: true, message: `Updated “${d.name}”.` };
    }
    const res = run(
      `INSERT INTO products (name, slug, sku, category_id, subcategory, short_description, description,
         retail_price, wholesale_cost, sale_price, moq, warranty, tags_json, price_status, flags_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified', '[]')`,
      [d.name, d.slug, d.sku, d.category_id, d.subcategory, d.short_description, d.description,
       d.retail_price, d.wholesale_cost, salePrice, d.moq, d.warranty, tags],
    );
    const pid = Number(res.lastInsertRowid);
    run(`INSERT INTO product_variants (product_id, variant_sku, size, color, stock) VALUES (?, ?, 'One Size', 'Default', 0)`,
      [pid, `${d.sku}-DEF-ONESIZE`]);
    run(`INSERT INTO product_images (product_id, url, alt, kind) VALUES (?, '/placeholder.svg', ?, 'placeholder')`,
      [pid, `${d.name} — placeholder image`]);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true, message: `Created “${d.name}”. Add stock in Inventory.` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Save failed";
    if (msg.includes("UNIQUE")) return { ok: false, message: "That SKU or slug already exists." };
    return { ok: false, message: msg };
  }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const inOrders = one<{ n: number }>(`SELECT COUNT(*) AS n FROM order_items WHERE product_id = ?`, [id])?.n ?? 0;
  if (inOrders > 0) {
    run(`UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?`, [id]);
  } else {
    run(`DELETE FROM products WHERE id = ?`, [id]);
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  run(`UPDATE products SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`, [id]);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
export async function adjustStockAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const variantId = Number(formData.get("variant_id"));
  const mode = String(formData.get("mode") ?? "set");
  const qty = Number(formData.get("qty"));
  const note = String(formData.get("note") ?? "").trim();
  if (!variantId || Number.isNaN(qty)) return { ok: false, message: "Choose a variant and enter a quantity." };

  const variant = one<{ id: number; product_id: number; stock: number; variant_sku: string }>(
    `SELECT id, product_id, stock, variant_sku FROM product_variants WHERE id = ?`,
    [variantId],
  );
  if (!variant) return { ok: false, message: "Variant not found." };

  const next = mode === "set" ? qty : Math.max(0, variant.stock + qty);
  if (next < 0) return { ok: false, message: "Stock cannot be negative." };
  const change = next - variant.stock;
  if (change === 0) return { ok: false, message: "No change in stock." };

  transaction(() => {
    run(`UPDATE product_variants SET stock = ? WHERE id = ?`, [next, variantId]);
    run(
      `INSERT INTO inventory_movements (product_id, variant_id, change_qty, reason, reference, note)
       VALUES (?, ?, ?, ?, 'ADMIN', ?)`,
      [variant.product_id, variantId, change, mode === "set" ? "adjustment" : "restock", note || "Manual admin adjustment"],
    );
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { ok: true, message: `${variant.variant_sku}: stock ${variant.stock} → ${next}.` };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as (typeof STATUSES)[number];
  if (!id || !STATUSES.includes(status)) return;

  const order = one<{ status: string; order_number: string }>(`SELECT status, order_number FROM orders WHERE id = ?`, [id]);
  if (!order) return;

  transaction(() => {
    run(
      `UPDATE orders SET status = ?, updated_at = datetime('now'),
         payment_status = CASE WHEN ? = 'delivered' THEN 'paid' WHEN ? = 'cancelled' THEN 'void' ELSE payment_status END
       WHERE id = ?`,
      [status, status, status, id],
    );

    if (status === "cancelled" && order.status !== "cancelled") {
      const items = all<{ product_id: number; variant_id: number | null; qty: number }>(
        `SELECT product_id, variant_id, qty FROM order_items WHERE order_id = ?`, [id],
      );
      for (const item of items) {
        if (item.variant_id) {
          run(`UPDATE product_variants SET stock = stock + ? WHERE id = ?`, [item.qty, item.variant_id]);
          run(
            `INSERT INTO inventory_movements (product_id, variant_id, change_qty, reason, reference, note)
             VALUES (?, ?, ?, 'return', ?, 'Order cancelled — stock restored')`,
            [item.product_id, item.variant_id, item.qty, order.order_number],
          );
        }
      }
    }
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  revalidatePath("/order/track");
}

export async function updateOrderShippingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const courier = String(formData.get("courier") ?? "Not assigned").trim();
  const tracking = String(formData.get("tracking_code") ?? "").trim();
  if (!id) return;
  run(`UPDATE orders SET courier = ?, tracking_code = ?, updated_at = datetime('now') WHERE id = ?`, [courier, tracking, id]);
  revalidatePath(`/admin/orders/${id}`);
}

// ---------------------------------------------------------------------------
// Categories, coupons, banners, settings
// ---------------------------------------------------------------------------
export async function saveCategoryAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const schema = z.object({
    name: z.string().trim().min(2), slug: z.string().trim().regex(/^[a-z0-9-]+$/),
    name_bn: z.string().trim().default(""), blurb: z.string().trim().default(""), icon: z.string().trim().default("grid"),
    sort_order: z.coerce.number().int().default(99),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid category" };
  const d = parsed.data;
  try {
    run(`INSERT INTO categories (name, slug, name_bn, blurb, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET name=excluded.name, name_bn=excluded.name_bn, blurb=excluded.blurb, icon=excluded.icon, sort_order=excluded.sort_order`,
      [d.name, d.slug, d.name_bn, d.blurb, d.icon, d.sort_order]);
    revalidatePath("/admin/categories");
    return { ok: true, message: `Saved category “${d.name}”.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save category" };
  }
}

export async function toggleCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  run(`UPDATE categories SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?`, [id]);
  revalidatePath("/admin/categories");
}

export async function saveCouponAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const schema = z.object({
    code: z.string().trim().min(3).transform((v) => v.toUpperCase()),
    description: z.string().trim().default(""),
    type: z.enum(["percent", "fixed", "freeship"]),
    value: z.coerce.number().int().min(0).default(0),
    min_subtotal: z.coerce.number().int().min(0).default(0),
    max_discount: z.union([z.coerce.number().int().min(0), z.literal("")]).optional(),
    usage_limit: z.union([z.coerce.number().int().min(1), z.literal("")]).optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid coupon" };
  const d = parsed.data;
  if (d.type === "percent" && (d.value < 1 || d.value > 90)) {
    return { ok: false, message: "Percent coupons must be between 1 and 90." };
  }
  run(
    `INSERT INTO coupons (code, description, type, value, min_subtotal, max_discount, usage_limit)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(code) DO UPDATE SET description=excluded.description, type=excluded.type, value=excluded.value,
       min_subtotal=excluded.min_subtotal, max_discount=excluded.max_discount, usage_limit=excluded.usage_limit`,
    [d.code, d.description, d.type, d.value, d.min_subtotal,
     d.max_discount === "" || d.max_discount === undefined ? null : Number(d.max_discount),
     d.usage_limit === "" || d.usage_limit === undefined ? null : Number(d.usage_limit)],
  );
  revalidatePath("/admin/coupons");
  revalidatePath("/offers");
  return { ok: true, message: `Saved coupon ${d.code}.` };
}

export async function toggleCouponAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  run(`UPDATE coupons SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?`, [id]);
  revalidatePath("/admin/coupons");
}

export async function saveBannerAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const schema = z.object({
    title: z.string().trim().min(4), subtitle: z.string().trim().default(""),
    cta_label: z.string().trim().default("Shop now"), cta_href: z.string().trim().default("/shop"),
    placement: z.enum(["hero", "promo", "strip"]).default("hero"), theme: z.string().trim().default("ink"),
    sort_order: z.coerce.number().int().default(0),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid banner" };
  const d = parsed.data;
  run(`INSERT INTO banners (title, subtitle, cta_label, cta_href, placement, theme, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [d.title, d.subtitle, d.cta_label, d.cta_href, d.placement, d.theme, d.sort_order]);
  revalidatePath("/admin/banners");
  return { ok: true, message: `Banner “${d.title}” created.` };
}

export async function toggleBannerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  run(`UPDATE banners SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?`, [id]);
  revalidatePath("/admin/banners");
}

export async function saveSettingsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const entries = Object.fromEntries(formData) as Record<string, string>;
  for (const [key, value] of Object.entries(entries)) {
    if (key.startsWith("setting_")) {
      run(`INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key.replace("setting_", ""), String(value)]);
    }
  }
  revalidatePath("/admin/settings");
  return { ok: true, message: "Store settings saved." };
}
