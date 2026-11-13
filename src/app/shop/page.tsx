import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ActiveChips, FilterPanel, SortSelect } from "@/components/catalog/Filters";
import { Pagination } from "@/components/catalog/Pagination";
import { EmptyState, SectionHeading } from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse all 225 SUPER Z SHOP products across 15 categories with filters and sorting.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PER_PAGE = 24;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);

  const query = {
    category: first(sp.category),
    subcategory: first(sp.sub),
    q: first(sp.q),
    minPrice: first(sp.min) ? Number(first(sp.min)) : undefined,
    maxPrice: first(sp.max) ? Number(first(sp.max)) : undefined,
    sort: first(sp.sort),
    tag: first(sp.tag),
    onSale: first(sp.sale) === "1",
    inStock: first(sp.stock) === "1",
    page,
    perPage: PER_PAGE,
  };

  const { rows, total } = queryProducts(query);
  const categories = listCategories();
  const totalPages = Math.ceil(total / PER_PAGE);
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const catOptions = categories.map((c) => ({ value: c.slug, label: c.name }));
  const subOptions = [...new Set(queryProducts({ category: query.category, perPage: 500 }).rows.map((p) => p.subcategory))]
    .sort()
    .map((s) => ({ value: s, label: s }));

  const paramRecord = {
    category: query.category,
    sub: query.subcategory,
    q: query.q,
    min: first(sp.min),
    max: first(sp.max),
    sort: query.sort,
    tag: query.tag,
    sale: first(sp.sale),
    stock: first(sp.stock),
  };

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink)]">Shop all</span>
      </nav>

      <SectionHeading
        eyebrow="Catalogue"
        title="Shop all products"
        subtitle={`${total} product${total === 1 ? "" : "s"} across 15 categories. Prices are demo estimates — see each product page for the sourcing note.`}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--color-line)] py-3">
        <ActiveChips
          labels={{ category: "Category", sub: "Type", min: "Min ৳", max: "Max ৳", tag: "Style", q: "Search" }}
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-xs text-[var(--color-ink-mute)] sm:inline">
            Showing {rows.length} of {total}
          </span>
          <SortSelect />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <FilterPanel categories={catOptions} subcategories={subOptions} tags={[]} />

        <div>
          {rows.length === 0 ? (
            <EmptyState
              title="No products match those filters"
              subtitle="Try widening the price range or clearing a filter."
              action={{ label: "Clear filters", href: "/shop" }}
            />
          ) : (
            <>
              <ProductGrid products={rows} wishlistedIds={savedIds} />
              <Pagination page={page} totalPages={totalPages} basePath="/shop" params={paramRecord} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
