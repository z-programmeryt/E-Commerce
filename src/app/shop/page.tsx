import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ActiveChips, FilterPanel, SortSelect } from "@/components/catalog/Filters";
import { Pagination } from "@/components/catalog/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { absolute, metaDescription } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop all products — 225 items across 15 categories",
  description: metaDescription(
    "Browse all 225 SUPER Z SHOP products across 15 categories — fashion, jewellery, watches, bags, tech accessories, home and gifting. Filter by category, price and availability, cash on delivery nationwide.",
  ),
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop all products — SUPER Z SHOP",
    description: "225 products across 15 categories. Cash on delivery in all 64 districts.",
    url: absolute("/shop"),
  },
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

  const ld = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop all products", path: "/shop" },
  ]);

  return (
    <div className="container-page pb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]">All products</span>
      </nav>

      {/* result header: count + active filters + sort, the Daraz toolbar */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-[13px] font-bold text-[var(--color-ink)]">All products</h1>
            <span className="text-[12px] text-[var(--color-ink-mute)]">
              {total} item{total === 1 ? "" : "s"}
            </span>
            <div className="min-w-0">
              <ActiveChips
                labels={{ category: "Category", sub: "Type", min: "Min ৳", max: "Max ৳", tag: "Style", q: "Search" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11.5px] text-[var(--color-ink-mute)] sm:inline">
              Showing {rows.length} of {total}
            </span>
            <SortSelect />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)]">
        <FilterPanel categories={catOptions} subcategories={subOptions} tags={[]} />

        <div>
          <div className="lg:hidden">
            <FilterPanel categories={catOptions} subcategories={subOptions} tags={[]} />
          </div>
          {rows.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
              <EmptyState
                title="No products match those filters"
                subtitle="Try widening the price range or clearing a filter."
                action={{ label: "Clear filters", href: "/shop" }}
              />
            </div>
          ) : (
            <>
              <ProductGrid products={rows} wishlistedIds={savedIds} dense />
              <Pagination page={page} totalPages={totalPages} basePath="/shop" params={paramRecord} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
