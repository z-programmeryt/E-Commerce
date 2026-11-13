import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { SearchBox } from "@/components/layout/SearchBox";
import { EmptyState } from "@/components/EmptyState";
import { SortSelect } from "@/components/catalog/Filters";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the SUPER Z SHOP catalogue.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const sort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const { rows, total } = q ? queryProducts({ q, sort, perPage: 48 }) : { rows: [], total: 0 };
  const categories = listCategories();
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl md:text-3xl">
        {q ? <>Results for “{q}”</> : "Search the catalogue"}
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-ink-mute)]">
        {q ? `${total} product${total === 1 ? "" : "s"} matched.` : "Search by product name, Bangla name, SKU, tag or description."}
      </p>

      <div className="mt-5 max-w-2xl">
        <SearchBox large />
      </div>

      {!q ? (
        <div className="mt-8">
          <p className="eyebrow mb-3">Try a category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="badge hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]">
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="text-[var(--color-ink-mute)]">Popular:</span>
            {["panjabi", "watch", "jewellery", "gift", "backpack", "bedsheet"].map((t) => (
              <Link key={t} href={`/search?q=${t}`} className="link-underline">{t}</Link>
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={`No products found for “${q}”`}
            subtitle="Check the spelling, use a shorter word, or browse a category instead."
            action={{ label: "Browse all products", href: "/shop" }}
          />
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex justify-end border-b border-[var(--color-line)] pb-3">
            <SortSelect />
          </div>
          <ProductGrid products={rows} wishlistedIds={savedIds} />
        </div>
      )}
    </div>
  );
}
