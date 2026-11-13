import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, saleProducts, wishlistIds } from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { Countdown } from "@/components/home/Countdown";
import { Icon } from "@/components/ui/Icon";
import { absolute, metaDescription } from "@/lib/seo";
import { formatBdt } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Flash sale — offers, coupon codes and price drops",
  description: metaDescription(
    "Every product currently below list price, plus the demo coupon codes that work at checkout: WELCOME10, EID500, FREESHIP and SUPERZ15.",
  ),
  alternates: { canonical: "/offers" },
  openGraph: { title: "Flash sale — SUPER Z SHOP", description: "Price drops and working coupon codes, updated live from the catalogue.", url: absolute("/offers") },
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
  clay: "bg-[var(--color-danger-soft)] border-[var(--color-danger-line)] text-[var(--color-clay)]",
  ink: "bg-[var(--color-ink)] border-[var(--color-ink)] text-white",
  sand: "bg-[var(--color-paper-2)] border-[var(--color-line-strong)] text-[var(--color-ink)]",
};

export default async function OffersPage() {
  const products = saleProducts(48);
  const categories = listCategories();
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  return (
    <div className="container-page pb-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]" aria-current="page">Flash sale</span>
      </nav>

      {/* flash sale masthead */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[#ff9a3c] px-3 py-3">
          <div className="flex items-center gap-2 text-white">
            <Icon name="lightning" size={20} />
            <div>
              <h1 className="text-[16px] font-extrabold uppercase tracking-wide">Flash sale</h1>
              <p className="text-[11.5px] text-white/85">
                {products.length} products currently below list price
              </p>
            </div>
          </div>
          <Countdown />
        </div>

        <div className="p-3">
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
            Coupons below work at checkout. Discounts reduce the order total; they never change the displayed
            product price, so what you see on a product page is what you pay.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {coupons.map((c) => (
              <div key={c.code} className={`rounded-[var(--radius-card)] border p-3 ${tones[c.tone]}`}>
                <p className="font-mono text-[13px] font-bold tracking-wider">{c.code}</p>
                <p className="mt-1.5 text-[12px] font-semibold leading-snug">{c.title}</p>
                <p className="mt-0.5 text-[11px] opacity-75">{c.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-2.5 rounded-sm bg-[var(--color-warn-soft)] px-2.5 py-1.5 text-[11px] text-[var(--color-warn-ink)]">
            Coupons are demo data stored in the local database. No real promotion is running, and usage limits
            are enforced only inside this demo.
          </p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="section-bar">
          <h2 className="section-bar-title">On sale now</h2>
          <span className="text-[12px] text-[var(--color-ink-mute)]">{products.length} products</span>
        </div>
        <div className="p-2">
          <ProductGrid products={products} wishlistedIds={savedIds} dense />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="section-bar">
          <h2 className="section-bar-title">Shop sale by category</h2>
        </div>
        <div className="flex flex-wrap gap-1.5 p-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}?sale=1`}
              className="rounded-sm border border-[var(--color-line)] px-2 py-1 text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
