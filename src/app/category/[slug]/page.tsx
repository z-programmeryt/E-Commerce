import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryCounts, getCategory, listCategories, queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ActiveChips, FilterPanel, SortSelect } from "@/components/catalog/Filters";
import { Pagination } from "@/components/catalog/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { absolute, breadcrumbJsonLd, metaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 24;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Category not found", robots: { index: false, follow: true } };
  const description = metaDescription(
    cat.blurb ||
      `Shop ${cat.name} online in Bangladesh. Cash on delivery in all 64 districts, free delivery over ৳2,500.`,
  );
  return {
    title: `${cat.name} — shop ${cat.name} online in Bangladesh`,
    description,
    alternates: { canonical: `/category/${cat.slug}` },
    openGraph: { title: `${cat.name} — SUPER Z SHOP`, description, url: absolute(`/category/${cat.slug}`) },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);
  const all = queryProducts({ category: slug, perPage: 500 });
  const { rows, total } = queryProducts({
    category: slug,
    subcategory: first(sp.sub),
    minPrice: first(sp.min) ? Number(first(sp.min)) : undefined,
    maxPrice: first(sp.max) ? Number(first(sp.max)) : undefined,
    sort: first(sp.sort),
    tag: first(sp.tag),
    onSale: first(sp.sale) === "1",
    inStock: first(sp.stock) === "1",
    page,
    perPage: PER_PAGE,
  });

  const subs = [...new Set(all.rows.map((p) => p.subcategory))].sort();
  const counts = categoryCounts();
  const categories = listCategories();
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const ld = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop all products", path: "/shop" },
    { name: cat.name, path: `/category/${cat.slug}` },
  ]);

  return (
    <div className="container-page pb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <Link href="/shop" className="hover:text-[var(--color-brand-deep)] hover:underline">All products</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]" aria-current="page">{cat.name}</span>
      </nav>

      {/* category masthead */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-deep)]">
            <Icon name={cat.icon} size={19} />
          </span>
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold leading-tight text-[var(--color-ink)]">{cat.name}</h1>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--color-ink-mute)]">{cat.blurb}</p>
          </div>
          <span className="ml-auto shrink-0 text-[12px] text-[var(--color-ink-mute)]">
            {counts[cat.slug] ?? all.total} products
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[12px] text-[var(--color-ink-mute)]">{total} item{total === 1 ? "" : "s"}</span>
            <div className="min-w-0">
              <ActiveChips labels={{ sub: "Type", min: "Min ৳", max: "Max ৳", tag: "Style" }} />
            </div>
          </div>
          <SortSelect />
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-[132px] lg:self-start">
          <FilterPanel
            categories={[{ value: cat.slug, label: cat.name }]}
            subcategories={subs.map((s) => ({ value: s, label: s }))}
            tags={[]}
          />
        </div>
        <div>
          {rows.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
              <EmptyState
                title="Nothing here with those filters"
                subtitle="Clear a filter or browse the full category."
                action={{ label: "Reset filters", href: `/category/${cat.slug}` }}
              />
            </div>
          ) : (
            <>
              <ProductGrid products={rows} wishlistedIds={savedIds} dense />
              <Pagination
                page={page}
                totalPages={Math.ceil(total / PER_PAGE)}
                basePath={`/category/${cat.slug}`}
                params={{
                  sub: first(sp.sub), min: first(sp.min), max: first(sp.max), sort: first(sp.sort),
                  tag: first(sp.tag), sale: first(sp.sale), stock: first(sp.stock),
                }}
              />
            </>
          )}
        </div>
      </div>

      <section className="mt-14 border-t border-[var(--color-line)] pt-8">
        <p className="eyebrow mb-3">Other categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.filter((c) => c.slug !== cat.slug).map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="badge hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]">
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
