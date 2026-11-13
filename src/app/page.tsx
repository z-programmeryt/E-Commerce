import Link from "next/link";
import type { Metadata } from "next";
import {
  categoryCounts, getProductBySlug, listCategories, saleProducts, topProducts, wishlistIds,
} from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/EmptyState";
import { BRAND, formatBdt } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Premium everyday essentials, sourced in Dhaka",
  description:
    "Shop 225 curated essentials at SUPER Z SHOP — fashion, jewellery, watches, bags, tech and gifts. Cash on delivery across Bangladesh.",
};

export const dynamic = "force-dynamic";

const trust = [
  { icon: "truck", title: "Nationwide delivery", copy: "Pathao, Steadfast and RedX partner routes to all 64 districts." },
  { icon: "shield", title: "Cash on delivery", copy: "Pay when the parcel reaches you. No card details needed." },
  { icon: "refresh", title: "7-day replacement", copy: "On selected items, with a written replacement policy." },
  { icon: "phone", title: "Dhaka-based support", copy: "Sat–Thu, 10:00–19:00 on phone and WhatsApp." },
] as const;

export default async function HomePage() {
  const categories = listCategories();
  const counts = categoryCounts();
  const featured = topProducts("featured", 8);
  const trending = topProducts("trending", 4);
  const newest = topProducts("newArrival", 8);
  const best = topProducts("bestseller", 4);
  const sale = saleProducts(4);
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const hero = getProductBySlug("premium-cotton-panjabi");
  const heroSecondary = getProductBySlug("kundan-necklace-set");
  const heroThird = getProductBySlug("steel-chronograph-watch");

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-2)]">
        <div className="container-page grid items-center gap-10 py-12 md:grid-cols-[1.05fr_1fr] md:py-16 lg:py-20">
          <div>
            <p className="eyebrow mb-4">Dhaka · Est. 2026 · {counts ? "225 products" : ""}</p>
            <h1 className="font-display text-[2.1rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.2rem]">
              Premium everyday essentials, sourced in Dhaka.
            </h1>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-ink-soft)]">
              Clothing, jewellery, watches, bags, small tech and gifting — chosen for a Bangladesh
              climate, checked before dispatch, and delivered to your door with cash on delivery.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn btn-primary">Shop all products <Icon name="arrow-right" size={15} /></Link>
              <Link href="/collections/eid-edit" className="btn btn-outline">Eid edit</Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--color-line-strong)] pt-5">
              <div>
                <dt className="text-[0.625rem] uppercase tracking-[0.12em] text-[var(--color-ink-mute)]">Catalogue</dt>
                <dd className="font-display text-xl">225 SKUs</dd>
              </div>
              <div>
                <dt className="text-[0.625rem] uppercase tracking-[0.12em] text-[var(--color-ink-mute)]">Delivery</dt>
                <dd className="font-display text-xl">64 districts</dd>
              </div>
              <div>
                <dt className="text-[0.625rem] uppercase tracking-[0.12em] text-[var(--color-ink-mute)]">Free shipping</dt>
                <dd className="font-display text-xl">৳2,500+</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[hero, heroSecondary, heroThird].filter(Boolean).map((p, i) => (
              <Link
                key={p!.id}
                href={`/product/${p!.slug}`}
                className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white ${
                  i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p!.image_url ?? "/placeholder.svg"}
                  alt={p!.name}
                  className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                    i === 0 ? "object-cover object-center" : "object-cover"
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent p-3">
                  <div>
                    <p className="text-[0.5625rem] uppercase tracking-[0.14em] text-white/75">{p!.category_name}</p>
                    <p className="text-sm font-semibold text-white">{p!.name}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[0.6875rem] font-bold text-[var(--color-ink)]">
                    {formatBdt(p!.sale_price ?? p!.retail_price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section aria-label="Shopping assurances" className="border-b border-[var(--color-line)] bg-white">
        <div className="container-page grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-2)] text-[var(--color-olive-deep)]">
                <Icon name={t.icon} size={16} />
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold">{t.title}</p>
                <p className="text-xs leading-relaxed text-[var(--color-ink-mute)]">{t.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          subtitle="Fifteen categories, curated down to 15 products each — no endless scrolling."
          action={{ label: "All categories", href: "/shop" }}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-paper)]"
            >
              <span className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-paper-2)] text-[var(--color-olive-deep)] transition-colors group-hover:bg-[var(--color-olive-deep)] group-hover:text-white">
                <Icon name={c.icon} size={17} />
              </span>
              <span>
                <span className="block text-[0.8125rem] font-semibold leading-snug">{c.name}</span>
                <span className="mt-0.5 block text-[0.6875rem] text-[var(--color-ink-mute)]">
                  {counts[c.slug] ?? 0} products
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Featured ---------------- */}
      <section className="bg-white py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our edit"
            title="Featured this season"
            subtitle="Pieces the buying team is confident about — with room for every budget."
            action={{ label: "Shop featured", href: "/collections/featured" }}
          />
          <ProductGrid products={featured} wishlistedIds={savedIds} />
        </div>
      </section>

      {/* ---------------- Editorial promo ---------------- */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="container-page grid gap-8 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow mb-3 text-white/60">Festive gifting</p>
            <h2 className="font-display text-[1.9rem] leading-tight md:text-[2.4rem]">
              Eid, weddings and everything in between.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75">
              Panjabi, kantha saree, kundan jewellery and pre-packed gift hampers — organised so a
              single order can cover the whole family. Each piece ships with a 7-day replacement
              option where stated.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/collections/eid-edit" className="btn btn-olive">Eid edit</Link>
              <Link href="/collections/gifting" className="btn border-white/30 text-white hover:bg-white/10">
                Gift collections
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {trending.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="group">
                <span className="block aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url ?? "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </span>
                <span className="mt-2 block text-[0.6875rem] text-white/80">{p.name}</span>
                <span className="block text-[0.6875rem] font-semibold">{formatBdt(p.sale_price ?? p.retail_price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- New arrivals ---------------- */}
      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Just in"
          title="New arrivals"
          subtitle="The latest additions to the catalogue, newest first."
          action={{ label: "All new arrivals", href: "/new-arrivals" }}
        />
        <ProductGrid products={newest} wishlistedIds={savedIds} />
      </section>

      {/* ---------------- Two column: best sellers / offers ---------------- */}
      <section className="bg-white py-14">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <SectionHeading eyebrow="Repeat orders" title="Best sellers" action={{ label: "See all", href: "/best-sellers" }} />
            <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {best.map((p, i) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="flex items-center gap-4 py-3 transition-colors hover:bg-[var(--color-paper)]">
                  <span className="w-5 shrink-0 font-display text-sm text-[var(--color-ink-mute)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-16 w-14 shrink-0 overflow-hidden rounded border border-[var(--color-line)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url ?? "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block text-xs text-[var(--color-ink-mute)]">{p.category_name}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">{formatBdt(p.sale_price ?? p.retail_price)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Value" title="Offers & discounts" action={{ label: "All offers", href: "/offers" }} />
            <div className="grid grid-cols-2 gap-4">
              {sale.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group">
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url ?? "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    <span className="absolute left-2 top-2 badge badge-sale">
                      −{Math.round(((p.retail_price - (p.sale_price ?? p.retail_price)) / p.retail_price) * 100)}%
                    </span>
                  </span>
                  <span className="mt-2 block truncate text-xs font-semibold">{p.name}</span>
                  <span className="block text-xs">
                    <span className="font-semibold">{formatBdt(p.sale_price ?? p.retail_price)}</span>{" "}
                    <span className="text-[var(--color-ink-mute)] line-through">{formatBdt(p.retail_price)}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
              <p className="text-[0.8125rem] font-semibold">Demo coupon codes</p>
              <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
                Try <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.6875rem]">WELCOME10</code>,{" "}
                <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.6875rem]">EID500</code> or{" "}
                <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.6875rem]">FREESHIP</code> at checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Honest disclosure ---------------- */}
      <section className="container-page py-14">
        <div className="grid gap-6 rounded-[var(--radius-card)] border border-[var(--color-line-strong)] bg-[var(--color-paper-2)] p-6 md:grid-cols-[auto_1fr] md:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-olive-deep)]">
            <Icon name="alert" size={20} />
          </span>
          <div>
            <h2 className="font-display text-xl">What is real in this demo, and what is not</h2>
            <div className="mt-3 grid gap-4 text-sm text-[var(--color-ink-soft)] md:grid-cols-2">
              <div>
                <p className="mb-1 font-semibold text-[var(--color-ink)]">Working end to end</p>
                <ul className="list-disc space-y-1 pl-4 text-[0.8125rem]">
                  <li>225 products with variants, stock and search</li>
                  <li>Cart, wishlist, coupons and checkout validation</li>
                  <li>Order creation with automatic stock reduction</li>
                  <li>Admin dashboard, order status and CSV export</li>
                </ul>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[var(--color-ink)]">Deliberately not real</p>
                <ul className="list-disc space-y-1 pl-4 text-[0.8125rem]">
                  <li>No payment gateway and no courier booking</li>
                  <li>Wholesale and retail prices are unverified estimates</li>
                  <li>Product art is studio illustration, not supplier photography</li>
                  <li>No reviews or testimonials are shown, because none exist yet</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--color-ink-mute)]">
              Full sourcing research and unit economics live in the downloadable business workbook —{" "}
              <Link href="/pages/business-research" className="link-underline font-semibold text-[var(--color-ink)]">
                see the research page
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Newsletter ---------------- */}
      <section className="border-t border-[var(--color-line)] bg-white py-14">
        <div className="container-page grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Newsletter</p>
            <h2 className="font-display text-2xl">First access to new drops and Eid edits.</h2>
            <p className="mt-2 max-w-md text-sm text-[var(--color-ink-soft)]">
              One short email a month. Demo subscription — addresses are stored in the local database only.
            </p>
          </div>
          <div className="md:justify-self-end md:w-full md:max-w-md">
            <NewsletterInline />
          </div>
        </div>
      </section>
    </>
  );
}

import { NewsletterForm } from "@/components/layout/NewsletterForm";

function NewsletterInline() {
  return (
    <div>
      <NewsletterForm />
      <p className="mt-3 text-xs text-[var(--color-ink-mute)]">
        Prefer WhatsApp? Message {BRAND.phone} — {BRAND.supportHours}.
      </p>
    </div>
  );
}
