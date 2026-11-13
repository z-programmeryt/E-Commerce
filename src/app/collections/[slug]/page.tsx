import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Collection = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  query: { flag?: string; tag?: string; category?: string; onSale?: boolean; sort?: string };
};

const COLLECTIONS: Collection[] = [
  {
    slug: "featured",
    title: "Featured collection",
    eyebrow: "Buying team picks",
    description: "A cross-category edit of pieces with the strongest supplier confidence and the widest size availability.",
    query: { flag: "featured" },
  },
  {
    slug: "eid-edit",
    title: "Eid edit",
    eyebrow: "Festive",
    description: "Panjabi, saree, three-piece sets and gifting for Eid — organised so one order covers the family.",
    query: { tag: "eid" },
  },
  {
    slug: "gifting",
    title: "Gifting",
    eyebrow: "Ready to give",
    description: "Pre-packed hampers, boxed sets and small gifts. Everything ships with the option of a handwritten card.",
    query: { tag: "gift" },
  },
  {
    slug: "couple-collections",
    title: "Couple collections",
    eyebrow: "For two",
    description: "Matched pairs — apparel, jewellery, mugs and travel sets designed as a single gift.",
    query: { tag: "couple" },
  },
  {
    slug: "wedding-season",
    title: "Wedding season",
    eyebrow: "Occasion",
    description: "Bridal jewellery, suits, sarees and gifts for the wedding months.",
    query: { tag: "wedding" },
  },
  {
    slug: "winter-edit",
    title: "Winter edit",
    eyebrow: "Seasonal",
    description: "Hoodies, mufflers, shawls and thermals for the short but sharp Dhaka winter.",
    query: { tag: "winter" },
  },
  {
    slug: "everyday-office",
    title: "Everyday office",
    eyebrow: "Workwear",
    description: "Shirts, chinos, watches, bags and desk pieces that make a weekday easier.",
    query: { tag: "office" },
  },
  {
    slug: "travel-ready",
    title: "Travel ready",
    eyebrow: "On the move",
    description: "Luggage, organisers, comfort items and adapters for the next trip.",
    query: { tag: "travel" },
  },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) return { title: "Collection not found" };
  return { title: c.title, description: c.description };
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

      <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
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
