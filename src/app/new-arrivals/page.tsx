import type { Metadata } from "next";
import { queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "New arrivals",
  description: "The newest additions to the SUPER Z SHOP catalogue.",
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
