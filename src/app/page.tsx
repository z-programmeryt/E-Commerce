import Link from "next/link";
import type { Metadata } from "next";
import {
  categoryCounts, getProductBySlug, listCategories, saleProducts, topProducts, wishlistIds,
} from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { ProductCard, ProductGrid } from "@/components/catalog/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { FlashSaleRail } from "@/components/home/FlashSaleRail";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { BRAND, formatBdt } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Online shopping in Bangladesh — SUPER Z SHOP",
  description:
    "Shop 225 products across fashion, jewellery, watches, bags, tech and gifting. Cash on delivery in all 64 districts, free delivery over ৳2,500.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = listCategories();
  const counts = categoryCounts();
  const featured = topProducts("featured", 10);
  const newest = topProducts("newArrival", 10);
  const best = topProducts("bestseller", 5);
  const sale = saleProducts(12);
  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const hero = getProductBySlug("premium-cotton-panjabi");
  const heroSecondary = getProductBySlug("kundan-necklace-set");

  return (
    <>
      {/* ================= hero: promo stack + side deal panel ================= */}
      <section className="bg-[var(--color-paper)] pt-3">
        <div className="container-page grid gap-3 lg:grid-cols-[1fr_248px]">
          {/* main promo band */}
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-r from-[#1f2430] via-[#2d3546] to-[#3d4657]">
            <div className="relative grid items-center gap-6 p-6 sm:grid-cols-[1.15fr_1fr] md:p-8">
              <div>
                <span className="inline-flex items-center gap-1 rounded-sm bg-[var(--color-brand)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Icon name="lightning" size={11} /> Mega deals
                </span>
                <h1 className="mt-3 text-[26px] font-bold leading-[1.15] text-white sm:text-[32px] md:text-[38px]">
                  Everything for everyday life,
                  <span className="text-[var(--color-brand)]"> delivered to your door.</span>
                </h1>
                <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-white/70">
                  Fashion, jewellery, watches, bags, phone accessories and gifting — cash on delivery
                  in all 64 districts.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Link href="/shop" className="btn btn-primary btn-lg">
                    Shop all products <Icon name="arrow-right" size={15} />
                  </Link>
                  <Link
                    href="/offers"
                    className="btn btn-lg border border-white/25 bg-transparent text-white hover:bg-white/10"
                  >
                    Today&apos;s deals
                  </Link>
                </div>
                <p className="mt-4 text-[11px] text-white/45">
                  Demo storefront — prices are unverified estimates, no real payments are taken.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[hero, heroSecondary].filter(Boolean).map((p) => (
                  <Link
                    key={p!.id}
                    href={`/product/${p!.slug}`}
                    className="group overflow-hidden rounded-sm bg-white p-2"
                  >
                    <span className="block aspect-square overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p!.image_url ?? "/placeholder.svg"}
                        alt={p!.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-1.5 block line-clamp-1 text-[11.5px] text-[var(--color-ink-soft)]">
                      {p!.name}
                    </span>
                    <span className="block text-[13px] font-bold text-[var(--color-brand-ink)]">
                      {formatBdt(p!.sale_price ?? p!.retail_price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* side panel: delivery promises + coupon */}
          <aside className="hidden flex-col gap-3 lg:flex">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-3">
              <p className="text-[12px] font-bold text-[var(--color-ink)]">Why shop here</p>
              <ul className="mt-2 space-y-2">
                {[
                  { icon: "cash", text: "Cash on delivery, nationwide" },
                  { icon: "truck", text: "Free delivery over ৳2,500" },
                  { icon: "refresh", text: "7-day replacement where stated" },
                  { icon: "phone", text: "Dhaka-based support, Sat–Thu" },
                ].map((t) => (
                  <li key={t.text} className="trust-item">
                    <Icon name={t.icon as never} size={14} className="shrink-0 text-[var(--color-brand-deep)]" />
                    <span className="text-[11.5px] leading-snug">{t.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-brand)] bg-[var(--color-brand-soft)] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-brand-ink)]">
                Demo coupon
              </p>
              <p className="mt-1 font-mono text-[15px] font-bold text-[var(--color-ink)]">WELCOME10</p>
              <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                10% off orders over ৳1,000, capped at ৳300.
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-3">
              <p className="text-[12px] font-bold">Delivery charges</p>
              <dl className="mt-2 space-y-1 text-[11.5px]">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Inside Dhaka</dt>
                  <dd className="font-semibold">৳70</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Outside Dhaka</dt>
                  <dd className="font-semibold">৳130</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Free over</dt>
                  <dd className="font-semibold">৳2,500</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* ================= trust strip ================= */}
      <div className="container-page mt-3">
        <ul className="grid grid-cols-2 divide-[var(--color-line)] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white sm:grid-cols-4 sm:divide-x">
          {[
            { icon: "cash", title: "Cash on delivery", sub: "Pay when it arrives" },
            { icon: "truck", title: "Free over ৳2,500", sub: "64 districts covered" },
            { icon: "refresh", title: "7-day replacement", sub: "On selected items" },
            { icon: "shield", title: "Checked before dispatch", sub: "Every order inspected" },
          ].map((t) => (
            <li key={t.title} className="flex items-center gap-2.5 px-3 py-2.5">
              <Icon name={t.icon as never} size={17} className="shrink-0 text-[var(--color-brand-deep)]" />
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-[var(--color-ink)]">{t.title}</span>
                <span className="block truncate text-[10.5px] text-[var(--color-ink-mute)]">{t.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= flash sale ================= */}
      <section className="container-page mt-3">
        <FlashSaleRail products={sale.slice(0, 8)} wishlistedIds={savedIds} />
      </section>

      {/* ================= categories ================= */}
      <section className="container-page mt-3">
        <CategoryTiles categories={categories} counts={counts} />
      </section>

      {/* ================= just for you (main grid) ================= */}
      <section className="container-page mt-3 pb-6">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
          <div className="section-bar">
            <h2 className="section-bar-title">Just for you</h2>
            <Link href="/shop" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
              View all
            </Link>
          </div>
          <div className="p-2">
            <ProductGrid products={featured} wishlistedIds={savedIds} dense />
          </div>
        </div>

        {/* best sellers + offers side by side */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="section-bar">
              <h2 className="section-bar-title">Best sellers</h2>
              <Link href="/best-sellers" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
                See all
              </Link>
            </div>
            <ul className="divide-y divide-[var(--color-line)]">
              {best.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} className="flex items-center gap-3 p-2.5 hover:bg-[#fffbf7]">
                    <span className="w-4 shrink-0 text-center text-[12px] font-bold text-[var(--color-brand)]">
                      {i + 1}
                    </span>
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded border border-[var(--color-line)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url ?? "/placeholder.svg"} alt="" className="h-full w-full object-contain p-0.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-1 text-[12.5px]">{p.name}</span>
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

          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="section-bar">
              <h2 className="section-bar-title">New arrivals</h2>
              <Link href="/new-arrivals" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
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
              <div key={c.slug} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
                <div className="section-bar">
                  <h2 className="section-bar-title">{c.name}</h2>
                  <Link href={`/category/${c.slug}`} className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
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
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line-strong)] bg-[#fffdf7] p-4">
          <div className="flex items-start gap-3">
            <Icon name="alert" size={17} className="mt-0.5 shrink-0 text-[var(--color-warn)]" />
            <div>
              <h2 className="text-[13px] font-bold">This is a demo store, and the prices are unverified</h2>
              <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                Cart, checkout, coupons, stock deduction and the admin area all genuinely work. What is not real:
                no payment is taken, no courier is booked, and every price is an estimate awaiting supplier
                quotations. Product art is placeholder illustration, and there are no reviews or ratings anywhere
                because none exist yet — we would rather show nothing than invent them.
              </p>
              <Link
                href="/pages/business-research"
                className="mt-2 inline-block text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline"
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
