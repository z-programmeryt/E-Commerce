import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { queryProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
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
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/shop" className="hover:underline">Collections</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink)]">{c.title}</span>
      </nav>

      <p className="eyebrow mb-2">{c.eyebrow}</p>
      <h1 className="font-display text-2xl md:text-3xl">{c.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">{c.description}</p>
      <p className="mt-1 text-xs text-[var(--color-ink-mute)]">{rows.length} products</p>

      <div className="mt-7">
        {rows.length === 0 ? (
          <EmptyState
            title="This collection is being curated"
            subtitle="Nothing matches yet. Browse the full catalogue in the meantime."
            action={{ label: "Shop all", href: "/shop" }}
          />
        ) : (
          <ProductGrid products={rows} wishlistedIds={savedIds} />
        )}
      </div>

      <div className="mt-12 border-t border-[var(--color-line)] pt-6">
        <p className="eyebrow mb-3">Other collections</p>
        <div className="flex flex-wrap gap-2">
          {COLLECTIONS.filter((x) => x.slug !== slug).map((x) => (
            <Link key={x.slug} href={`/collections/${x.slug}`} className="badge hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]">
              {x.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
