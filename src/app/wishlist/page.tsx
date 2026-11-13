import type { Metadata } from "next";
import { wishlistIds, wishlistProducts } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const key = await wishlistKeyReadOnly();
  const ids = key ? wishlistIds(key) : [];
  const products = key ? wishlistProducts(key) : [];

  return (
    <div className="container-page py-10">
      <p className="eyebrow mb-2">Saved</p>
      <h1 className="font-display text-2xl md:text-3xl">Your wishlist</h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-mute)]">
        {products.length > 0
          ? `${products.length} saved product${products.length === 1 ? "" : "s"} — stored in this browser.`
          : "Products you save are kept in this browser."}
      </p>

      <div className="mt-7">
        {products.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            subtitle="Tap the heart on any product card to keep it here for later."
            action={{ label: "Browse products", href: "/shop" }}
          />
        ) : (
          <ProductGrid products={products} wishlistedIds={ids} />
        )}
      </div>
    </div>
  );
}
