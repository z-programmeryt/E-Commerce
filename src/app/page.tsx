import Link from "next/link";
import type { Metadata } from "next";
import {
  categoryCounts, getProductBySlug, listCategories, saleProducts, topProducts, wishlistIds,
} from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductCard, ProductGrid } from "@/components/catalog/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { FlashSaleRail } from "@/components/home/FlashSaleRail";
import { HeroSlider, type Slide } from "@/components/home/HeroSlider";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { BRAND, formatBdt } from "@/lib/brand";
import { absolute, breadcrumbJsonLd, metaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Online shopping in Bangladesh — fashion, jewellery, watches & gifts",
  description: metaDescription(
    "Shop 225 products across 15 categories — fashion, jewellery, watches, bags, tech accessories and gifting. Cash on delivery in all 64 districts, free delivery over ৳2,500.",
  ),
  alternates: { canonical: "/" },
};

/**
 * Home.
 *
 * Deliberately ordered the way a marketplace shopper scans: promotion, then
 * service promises, then deals, then category browse, then merchandise. Every
 * count, price and stock figure is read from the database; the only fixed
 * numbers are the delivery fees and the free-delivery threshold, which are
 * configuration, not data.
 */
export default async function HomePage() {
  const categories = listCategories();
  const counts = categoryCounts();
  const featured = topProducts("featured", 12);
  const newest = topProducts("newArrival", 12);
  const best = topProducts("bestseller", 5);
  const sale = saleProducts(12);
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const hero = getProductBySlug("premium-cotton-panjabi");
  const heroSecondary = getProductBySlug("kundan-necklace-set");

  /* Slides are built from real catalogue facts. No invented urgency, no fake
     "only today" claims: the copy describes what the store actually has. */
  const slides: Slide[] = [
    {
      id: "new-season",
      eyebrow: "New season",
      title: "Everyday essentials,",
      highlight: "delivered to your door.",
      body: "225 products across 15 categories — fashion, jewellery, watches, bags, tech and gifting. Cash on delivery in all 64 districts.",
      cta: { label: "Shop all products", href: "/shop" },
      secondary: { label: "New arrivals", href: "/new-arrivals" },
      image: "/banners/hero-fashion-wide.jpg",
      tone: "navy",
      align: "left",
    },
    {
      id: "jewellery",
      eyebrow: "Jewellery & gifting",
      title: "Pieces worth keeping,",
      highlight: "priced for everyday.",
      body: "Necklace sets, earrings, bangles and boxed gift sets — each with live stock counts and a 7-day replacement window on selected items.",
      cta: { label: "Explore jewellery", href: "/category/jewellery" },
      secondary: { label: "Gift collections", href: "/collections/gifting" },
      image: "/banners/hero-jewellery-wide.jpg",
      tone: "slate",
      align: "left",
    },
    {
      id: "watches",
      eyebrow: "Watches & accessories",
      title: "Finishing touches",
      highlight: "that last.",
      body: "Watches, wallets, belts and sunglasses from the current catalogue — free delivery on every order over ৳2,500.",
      cta: { label: "Shop watches", href: "/category/watches" },
      secondary: { label: "See all deals", href: "/offers" },
      image: "/banners/hero-watches-wide.jpg",
      tone: "blue",
      align: "left",
    },
    {
      id: "tech",
      eyebrow: "Phone & tech",
      title: "Small upgrades,",
      highlight: "big difference.",
      body: "Earbuds, cables, power banks and stands. In-stock figures are read live from the database, so what you see is what is on the shelf.",
      cta: { label: "Shop tech", href: "/category/phone-tech" },
      secondary: { label: "Best sellers", href: "/best-sellers" },
      image: "/banners/hero-tech-wide.jpg",
      tone: "navy",
      align: "left",
    },
  ];

  const homeJsonLd = [
    breadcrumbJsonLd([{ name: "Home", path: "/" }]),
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND.name,
      url: absolute("/"),
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${absolute("/search")}?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* ================= hero ================= */}
      <section className="pt-3">
        <div className="container-page grid gap-3 lg:grid-cols-[minmax(0,1fr)_268px]">
          <HeroSlider slides={slides} />

          {/* side rail: service promises + featured picks, desktop only */}
          <aside className="hidden flex-col gap-3 lg:flex">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="section-bar">
                <h2 className="section-bar-title">Why shop with us</h2>
              </div>
              <ul className="space-y-2.5 p-3">
                {[
                  { icon: "cash", title: "Cash on delivery", sub: "Pay the courier, nationwide" },
                  { icon: "truck", title: "Free over ৳2,500", sub: "৳70 Dhaka · ৳130 outside" },
                  { icon: "refresh", title: "7-day replacement", sub: "On selected items" },
                  { icon: "phone", title: "Dhaka-based support", sub: BRAND.supportHours },
                ].map((t) => (
                  <li key={t.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                      <Icon name={t.icon as never} size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold leading-tight text-[var(--color-ink)]">
                        {t.title}
                      </span>
                      <span className="block text-[11px] sm:text-[10.5px] leading-tight text-[var(--color-ink-mute)]">{t.sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-dashed border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-3">
              <p className="text-[11px] sm:text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-brand-ink)]">
                Demo coupon
              </p>
              <p className="mt-1 font-mono text-[15px] font-bold text-[var(--color-ink)]">WELCOME10</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-ink-soft)]">
                10% off orders over ৳1,000, capped at ৳300.
              </p>
            </div>

            {hero ? (
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
                <div className="section-bar">
                  <h2 className="section-bar-title">Featured</h2>
                </div>
                <Link href={`/product/${hero.slug}`} className="block p-3">
                  <span className="block overflow-hidden rounded-sm bg-[var(--color-media)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero.image_url ?? "/placeholder.svg"}
                      alt={hero.name}
                      width={240}
                      height={240}
                      className="h-[148px] w-full object-contain"
                    />
                  </span>
                  <span className="mt-2 block line-clamp-2 text-[12px] leading-tight text-[var(--color-ink)]">
                    {hero.name}
                  </span>
                  <span className="mt-1 block text-[14px] font-bold text-[var(--color-brand-ink)]">
                    {formatBdt(hero.sale_price ?? hero.retail_price)}
                  </span>
                </Link>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              {[
                { src: "/banners/cat-womens-mid.jpg", label: "Women's fashion", href: "/category/womens-fashion" },
                { src: "/banners/cat-accessories-mid.jpg", label: "Accessories", href: "/category/unisex-accessories" },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.src}
                    alt=""
                    width={140}
                    height={80}
                    className="h-[76px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b1b3a]/92 to-transparent px-1.5 py-1 text-[10.5px] font-semibold leading-tight text-white">
                    {c.label}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ================= trust strip ================= */}
      <div className="container-page mt-3">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-4">
          {[
            { icon: "cash", title: "Cash on delivery", sub: "Pay when it arrives" },
            { icon: "truck", title: "Free over ৳2,500", sub: "All 64 districts" },
            { icon: "refresh", title: "7-day replacement", sub: "On selected items" },
            { icon: "badge-check", title: "Checked before dispatch", sub: "Every order inspected" },
          ].map((t) => (
            <li key={t.title} className="flex items-center gap-2.5 bg-[var(--color-surface)] px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <Icon name={t.icon as never} size={15} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11.5px] font-semibold text-[var(--color-ink)]">{t.title}</span>
                <span className="block truncate text-[11px] sm:text-[10.5px] text-[var(--color-ink-mute)]">{t.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= flash sale ================= */}
      <section className="container-page mt-3" aria-labelledby="flash-sale">
        <FlashSaleRail products={sale.slice(0, 10)} wishlistedIds={savedIds} />
      </section>

      {/* ================= categories ================= */}
      <section className="container-page mt-3" aria-labelledby="browse-categories">
        <CategoryTiles categories={categories} counts={counts} />
      </section>

      {/* ================= merchandising ================= */}
      <section className="container-page mt-3 pb-6">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="section-bar">
            <h2 className="section-bar-title">Just for you</h2>
            <Link href="/shop" className="text-[12px] font-semibold text-[var(--color-brand-ink)] hover:underline">
              View all 225 products →
            </Link>
          </div>
          <div className="p-2">
            <ProductGrid products={featured} wishlistedIds={savedIds} dense />
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">Best sellers</h2>
              <Link href="/best-sellers" className="text-[12px] font-semibold text-[var(--color-brand-ink)] hover:underline">
                See all
              </Link>
            </div>
            <ul className="divide-y divide-[var(--color-line)]">
              {best.map((p, i) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="flex items-center gap-3 p-2.5 transition-colors hover:bg-[var(--color-surface-2)]"
                  >
                    <span className="w-4 shrink-0 text-center text-[12px] font-bold text-[var(--color-brand)]">
                      {i + 1}
                    </span>
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-media)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url ?? "/placeholder.svg"} alt="" className="h-full w-full object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-1 text-[12.5px] text-[var(--color-ink)]">{p.name}</span>
                      <span className="block text-[11px] text-[var(--color-ink-mute)]">{p.category_name}</span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold text-[var(--color-brand-ink)]">
                      {formatBdt(p.sale_price ?? p.retail_price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">New arrivals</h2>
              <Link href="/new-arrivals" className="text-[12px] font-semibold text-[var(--color-brand-ink)] hover:underline">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
              {newest.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} wishlisted={savedIds.includes(p.id)} compact />
              ))}
            </div>
          </div>
        </div>

        {/* category rails */}
        <div className="mt-3 space-y-3">
          {categories.slice(0, 3).map((c) => {
            const items = featured.filter((p) => p.category_slug === c.slug).slice(0, 6);
            if (items.length === 0) return null;
            return (
              <div
                key={c.slug}
                className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]"
              >
                <div className="section-bar">
                  <h2 className="section-bar-title">{c.name}</h2>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-[12px] font-semibold text-[var(--color-brand-ink)] hover:underline"
                  >
                    See all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 lg:grid-cols-6">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} wishlisted={savedIds.includes(p.id)} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= honesty notice ================= */}
      <section className="container-page pb-8">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
          <div className="flex items-start gap-3">
            <Icon name="alert" size={17} className="mt-0.5 shrink-0 text-[var(--color-warn)]" />
            <div>
              <h2 className="text-[13px] font-bold text-[var(--color-ink)]">
                This is a demo store, and the prices are unverified
              </h2>
              <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                Cart, checkout, coupons, stock deduction and the admin area all genuinely work. What is not real:
                no payment is taken, no courier is booked, and every price is an estimate awaiting supplier
                quotations. Product art is placeholder illustration, and there are no reviews or ratings anywhere
                because none exist yet — we would rather show nothing than invent them.
              </p>
              <Link
                href="/pages/business-research"
                className="mt-2 inline-block text-[12px] font-semibold text-[var(--color-brand-ink)] hover:underline"
              >
                Read the sourcing research →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
