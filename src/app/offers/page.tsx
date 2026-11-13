import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, saleProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { SectionHeading } from "@/components/EmptyState";
import { formatBdt } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Offers & discounts",
  description: "Current demo offers, coupon codes and discounted products at SUPER Z SHOP.",
};
export const dynamic = "force-dynamic";

const coupons = [
  { code: "WELCOME10", title: "10% off your first order", detail: "Minimum ৳1,000 · maximum discount ৳300", tone: "olive" },
  { code: "EID500", title: "৳500 off festive orders", detail: "Minimum ৳5,000 · limited to 200 uses", tone: "clay" },
  { code: "FREESHIP", title: "Free delivery", detail: "Orders over ৳1,500 · inside Dhaka", tone: "ink" },
  { code: "SUPERZ15", title: "15% off lifestyle picks", detail: "Minimum ৳2,000 · maximum discount ৳500", tone: "sand" },
];

const tones: Record<string, string> = {
  olive: "bg-[#eef2ea] border-[#dbe3d5] text-[var(--color-olive-deep)]",
  clay: "bg-[#f8ece7] border-[#ecd3cb] text-[var(--color-clay)]",
  ink: "bg-[var(--color-ink)] border-[var(--color-ink)] text-white",
  sand: "bg-[var(--color-paper-2)] border-[var(--color-line-strong)] text-[var(--color-ink)]",
};

export default async function OffersPage() {
  const products = saleProducts(48);
  const categories = listCategories();
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  return (
    <div className="container-page py-10">
      <p className="eyebrow mb-2">Save more</p>
      <h1 className="font-display text-2xl md:text-3xl">Offers & discounts</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
        Demo coupons below work at checkout. Discounts reduce the order total; they never change the
        displayed product price, so what you see on a product page is what you pay.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {coupons.map((c) => (
          <div key={c.code} className={`rounded-[var(--radius-card)] border p-4 ${tones[c.tone]}`}>
            <p className="font-mono text-sm font-bold tracking-wider">{c.code}</p>
            <p className="mt-2 text-sm font-semibold leading-snug">{c.title}</p>
            <p className="mt-1 text-[0.6875rem] opacity-75">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#f0e2c4] bg-[#fbf6ea] px-4 py-3 text-xs text-[#6d5211]">
        Coupons are demo data stored in the local database. No real promotion is running, and usage limits are
        enforced only inside this demo.
      </div>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Price drops"
          title={`${products.length} products on sale`}
          subtitle="These SKUs have a sale price below their list price in the catalogue."
        />
        <ProductGrid products={products} wishlistedIds={savedIds} />
      </section>

      <section className="mt-12 border-t border-[var(--color-line)] pt-8">
        <p className="eyebrow mb-3">Shop sale by category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}?sale=1`} className="badge hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]">
              {c.name}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--color-ink-mute)]">
          Largest current saving: {products[0] ? `${products[0].name} at ${formatBdt(products[0].sale_price ?? 0)}` : "none"}.
        </p>
      </section>
    </div>
  );
}
