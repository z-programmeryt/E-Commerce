import type { Metadata } from "next";
import { wishlistIds, wishlistProducts } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const key = await wishlistKeyReadOnly();
  const ids = key ? wishlistIds(key) : [];
  const products = key ? wishlistProducts(key) : [];

  return (
    <div className="container-page pb-6">
      <ListingHeader
        title="Your wishlist"
        count={products.length > 0 ? `${products.length} saved` : undefined}
        subtitle="Saved products are stored in this browser, so they survive a reload but not a different device."
        crumb={[{ label: "Wishlist" }]}
        action={{ label: "Continue shopping →", href: "/shop" }}
      />
      <ListingPanel>
        {products.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            subtitle="Tap the heart on any product card to keep it here for later."
            action={{ label: "Browse products", href: "/shop" }}
          />
        ) : (
          <ProductGrid products={products} wishlistedIds={ids} dense />
        )}
      </ListingPanel>
    </div>
  );
}
