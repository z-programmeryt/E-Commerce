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

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 24;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Category not found" };
  return { title: `${cat.name} — shop ${cat.name} online in Bangladesh`, description: cat.blurb };
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

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/shop" className="hover:underline">Shop</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink)]">{cat.name}</span>
      </nav>

      <header className="mb-6 border-b border-[var(--color-line)] pb-6">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-2)] text-[var(--color-olive-deep)]">
            <Icon name={cat.icon} size={19} />
          </span>
          <div>
            <h1 className="font-display text-[1.9rem] leading-tight md:text-[2.3rem]">{cat.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[var(--color-ink-soft)]">{cat.blurb}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
              {counts[cat.slug] ?? all.total} products · {subs.length} types
            </p>
          </div>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ActiveChips labels={{ sub: "Type", min: "Min ৳", max: "Max ৳", tag: "Style" }} />
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-xs text-[var(--color-ink-mute)] sm:inline">Showing {rows.length} of {total}</span>
          <SortSelect />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <FilterPanel
          categories={[{ value: cat.slug, label: cat.name }]}
          subcategories={subs.map((s) => ({ value: s, label: s }))}
          tags={[]}
        />
        <div>
          {rows.length === 0 ? (
            <EmptyState
              title="Nothing here with those filters"
              subtitle="Clear a filter or browse the full category."
              action={{ label: "Reset filters", href: `/category/${cat.slug}` }}
            />
          ) : (
            <>
              <ProductGrid products={rows} wishlistedIds={savedIds} />
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
