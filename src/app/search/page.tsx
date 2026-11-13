import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { SearchBox } from "@/components/layout/SearchBox";
import { Icon } from "@/components/ui/Icon";
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
    <div className="container-page pb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]">Search</span>
      </nav>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
        <div className="border-b border-[var(--color-line)] p-3">
          <div className="max-w-2xl">
            <SearchBox large />
          </div>
          <h1 className="mt-2.5 text-[15px] font-bold">
            {q ? <>Results for “{q}”</> : "Search the catalogue"}
            {q ? (
              <span className="ml-2 text-[12px] font-normal text-[var(--color-ink-mute)]">
                {total} product{total === 1 ? "" : "s"} matched
              </span>
            ) : null}
          </h1>
          {!q ? (
            <p className="mt-0.5 text-[12px] text-[var(--color-ink-mute)]">
              Search by product name, Bangla name, SKU, tag or description.
            </p>
          ) : null}
        </div>

        {!q ? (
          <div className="p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
              Try a category
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="rounded-sm border border-[var(--color-line)] px-2 py-1 text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px]">
              <span className="text-[var(--color-ink-mute)]">Popular searches:</span>
              {["panjabi", "watch", "jewellery", "gift", "backpack", "bedsheet"].map((t) => (
                <Link key={t} href={`/search?q=${t}`} className="font-semibold text-[var(--color-brand-deep)] hover:underline">
                  {t}
                </Link>
              ))}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={`No products found for “${q}”`}
              subtitle="Check the spelling, use a shorter word, or browse a category instead."
              action={{ label: "Browse all products", href: "/shop" }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-[12px] text-[var(--color-ink-mute)]">Showing {rows.length} of {total}</span>
            <SortSelect />
          </div>
        )}
      </div>

      {q && rows.length > 0 ? (
        <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2">
          <ProductGrid products={rows} wishlistedIds={savedIds} dense />
        </div>
      ) : null}
    </div>
  );
}
