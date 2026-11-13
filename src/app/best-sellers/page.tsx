import type { Metadata } from "next";
import Link from "next/link";
import { topProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
import { formatBdt } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Best sellers",
  description: "The most requested SUPER Z SHOP products.",
};
export const dynamic = "force-dynamic";

export default async function BestSellersPage() {
  const best = topProducts("bestseller", 24);
  const trending = topProducts("trending", 12);
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  return (
    <div className="container-page pb-6">
      <ListingHeader
        title="Best sellers"
        count={`${best.length} products`}
        subtitle="Flagged by the buying team as the strongest repeat-purchase candidates. This is a merchandising label, not a sales-volume claim — the demo has no live sales history yet."
        crumb={[{ label: "Best sellers" }]}
        action={{ label: "Browse new arrivals →", href: "/new-arrivals" }}
      />

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_250px]">
        <ListingPanel>
          <ProductGrid products={best} wishlistedIds={savedIds} dense />
        </ListingPanel>

        <aside className="lg:sticky lg:top-[132px] lg:self-start" aria-label="Trending now">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="section-bar">
              <h2 className="section-bar-title">Trending now</h2>
            </div>
            <ol className="divide-y divide-[var(--color-line)]">
              {trending.slice(0, 8).map((p, i) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} className="flex items-center gap-2 p-2 hover:bg-[#fffbf7]">
                    <span className="w-3.5 shrink-0 text-center text-[11px] font-bold text-[var(--color-brand)]">
                      {i + 1}
                    </span>
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded border border-[var(--color-line)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url ?? "/placeholder.svg"} alt="" className="h-full w-full object-contain p-0.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-1 text-[11.5px] leading-tight">{p.name}</span>
                      <span className="block text-[11px] font-semibold text-[var(--color-brand-ink)]">
                        {formatBdt(p.sale_price ?? p.retail_price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
