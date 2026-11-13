import type { Metadata } from "next";
import { queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
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
    <div className="container-page py-10">
      <p className="eyebrow mb-2">Just arrived</p>
      <h1 className="font-display text-2xl md:text-3xl">New arrivals</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
        Newest SKUs in the catalogue first. {flagged.length} products currently carry the new-arrival flag; the
        rest of the list is the full catalogue ordered by when it was added.
      </p>
      <div className="mt-7">
        {rows.length === 0 ? <EmptyState title="No products yet" action={{ label: "Shop all", href: "/shop" }} /> : (
          <ProductGrid products={rows} wishlistedIds={savedIds} />
        )}
      </div>
    </div>
  );
}
