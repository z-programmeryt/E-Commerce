import type { Metadata } from "next";
import { queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
import { EmptyState } from "@/components/EmptyState";
import { absolute, metaDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "New arrivals — the latest additions to the catalogue",
  description: metaDescription(
    "The newest products added to the SUPER Z SHOP catalogue, newest SKU first. Cash on delivery nationwide, free delivery over ৳2,500.",
  ),
  alternates: { canonical: "/new-arrivals" },
  openGraph: { title: "New arrivals — SUPER Z SHOP", description: "The newest SKUs in the catalogue, updated as items are added.", url: absolute("/new-arrivals") },
};
export const dynamic = "force-dynamic";

export default async function NewArrivalsPage() {
  const { rows } = queryProducts({ sort: "newest", perPage: 36 });
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];
  const flagged = rows.filter((p) => p.flags_json.includes("newArrival"));

  return (
    <div className="container-page pb-6">
      <ListingHeader
        title="New arrivals"
        count={`${rows.length} products`}
        subtitle={`Newest SKUs first. ${flagged.length} currently carry the new-arrival flag; the rest of the list is the catalogue ordered by when it was added.`}
        crumb={[{ label: "New arrivals" }]}
        action={{ label: "Shop all products →", href: "/shop" }}
      />
      <ListingPanel>
        {rows.length === 0 ? (
          <EmptyState title="No products yet" action={{ label: "Shop all", href: "/shop" }} />
        ) : (
          <ProductGrid products={rows} wishlistedIds={savedIds} dense />
        )}
      </ListingPanel>
    </div>
  );
}
