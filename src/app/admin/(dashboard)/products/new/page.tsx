import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/repo";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = listCategories();
  return (
    <div className="space-y-4">
      <nav className="text-xs text-[var(--color-ink-mute)]">
        <Link href="/admin/products" className="hover:underline">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink)]">New product</span>
      </nav>
      <h1 className="font-display text-2xl">Create a product</h1>
      <p className="max-w-2xl text-sm text-[var(--color-ink-mute)]">
        A placeholder image and a single zero-stock variant are created automatically. Add colours, sizes and
        opening stock from the Inventory screen.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
