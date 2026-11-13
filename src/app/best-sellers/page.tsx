import type { Metadata } from "next";
import Link from "next/link";
import { topProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
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
    <div className="container-page py-10">
      <p className="eyebrow mb-2">Customer favourites</p>
      <h1 className="font-display text-2xl md:text-3xl">Best sellers</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
        Ordered by the best-seller flag set by the buying team. This is a merchandising label, not a claim about
        sales volume — the demo has no live sales history yet.
      </p>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <ProductGrid products={best} wishlistedIds={savedIds} />
        </div>
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-4">
            <p className="eyebrow mb-2">Trending now</p>
            <ol className="divide-y divide-[var(--color-line)]">
              {trending.slice(0, 8).map((p, i) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} className="flex items-center gap-3 py-2.5 hover:text-[var(--color-olive-deep)]">
                    <span className="w-4 text-xs text-[var(--color-ink-mute)]">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{p.name}</span>
                      <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">{formatBdt(p.sale_price ?? p.retail_price)}</span>
                    </span>
                    <Icon name="chevron-right" size={12} className="text-[var(--color-ink-mute)]" />
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
