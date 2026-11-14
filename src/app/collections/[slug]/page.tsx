import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
import { EmptyState } from "@/components/EmptyState";
import { COLLECTIONS } from "@/lib/collections";
import { absolute, metaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) return { title: "Collection not found", robots: { index: false, follow: true } };
  return {
    title: `${c.title} — ${c.eyebrow.toLowerCase()}`,
    description: metaDescription(c.description),
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { title: `${c.title} — SUPER Z SHOP`, description: metaDescription(c.description), url: absolute(`/collections/${c.slug}`) },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) notFound();

  const { rows } = queryProducts({ ...c.query, perPage: 60 });
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  return (
    <div className="container-page pb-6">
      <ListingHeader
        title={c.title}
        count={`${rows.length} products`}
        subtitle={c.description}
        crumb={[{ label: "Collections", href: "/shop" }, { label: c.title }]}
      />

      <ListingPanel>
        {rows.length === 0 ? (
          <EmptyState
            title="This collection is being curated"
            subtitle="Nothing matches yet. Browse the full catalogue in the meantime."
            action={{ label: "Shop all", href: "/shop" }}
          />
        ) : (
          <ProductGrid products={rows} wishlistedIds={savedIds} dense />
        )}
      </ListingPanel>

      <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="section-bar">
          <h2 className="section-bar-title">Other collections</h2>
        </div>
        <div className="flex flex-wrap gap-1.5 p-3">
          {COLLECTIONS.filter((x) => x.slug !== slug).map((x) => (
            <Link
              key={x.slug}
              href={`/collections/${x.slug}`}
              className="rounded-sm border border-[var(--color-line)] px-2 py-1 text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
            >
              {x.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
