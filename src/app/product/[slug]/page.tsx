import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  discountPercent, effectivePrice, getProductBySlug, getVariants, parseFlags, parseSpecs, parseTags, relatedProducts, wishlistIds,
} from "@/lib/repo";
import { wishlistKeyReadOnly } from "@/lib/session";
import { BRAND, formatBdt } from "@/lib/brand";
import { ProductDetailPanel } from "@/components/catalog/ProductDetailPanel";
import { WishlistButton } from "@/components/catalog/WishlistButton";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { absolute, breadcrumbJsonLd, metaDescription } from "@/lib/seo";
import { Alert } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: true } };

  const price = effectivePrice(product);
  const off = discountPercent(product);
  const title = `${product.name}${off ? ` — ${off}% off` : ""} | ${product.category_name}`;
  const description = metaDescription(
    product.short_description ||
      `Buy ${product.name} online in Bangladesh for ${formatBdt(price)}. Cash on delivery nationwide, free delivery over ৳2,500.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: absolute(`/product/${product.slug}`),
      images: [{ url: product.image_url ?? "/og/home.png", width: 800, height: 1000, alt: `${product.name} — studio product photograph` }],
    },
    twitter: { card: "summary_large_image", title: product.name, description },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "BDT",
      "product:availability": (product.total_stock ?? 0) > 0 ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const variants = getVariants(product.id);
  const flags = parseFlags(product);
  const specs = parseSpecs(product);
  const tags = parseTags(product);
  const related = relatedProducts(product, 6);
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const stock = product.total_stock ?? 0;

  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/category/${product.category_slug}`, label: product.category_name ?? "" },
    { href: `/product/${product.slug}`, label: product.name },
  ];

  /* Structured data. Deliberately no aggregateRating and no review array:
     there are no real reviews, and inventing them would be both dishonest
     and a Google structured-data violation. */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      description: product.short_description,
      category: product.category_name,
      ...(product.name_bn ? { alternateName: product.name_bn } : {}),
      brand: { "@type": "Brand", name: BRAND.name },
      image: [absolute(product.image_url ?? "/og/home.png")],
      offers: {
        "@type": "Offer",
        url: absolute(`/product/${product.slug}`),
        priceCurrency: "BDT",
        price,
        availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: BRAND.name },
      },
    },
    breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href }))),
  ];

  return (
    <div className="pb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-page">
        {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]"
        >
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex min-w-0 items-center gap-1">
              {i > 0 ? <Icon name="chevron-right" size={11} className="shrink-0 text-[var(--color-line-strong)]" /> : null}
              {i === crumbs.length - 1 ? (
                <span className="truncate text-[var(--color-ink-soft)]" aria-current="page">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="shrink-0 hover:text-[var(--color-brand-deep)] hover:underline">
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* ============ buy box ============ */}
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)_290px]">
            {/* gallery */}
            <div className="border-[var(--color-line)] p-3 lg:border-r">
              <ProductGallery
                name={product.name}
                discount={off}
                shots={[
                  {
                    src: product.image_url ?? "/products/fallback.jpg",
                    label: "Product",
                    caption: "full studio view",
                  },
                  {
                    src: product.image_url ?? "/products/fallback.jpg",
                    label: "Detail",
                    caption: "detail view",
                  },
                  {
                    src: product.image_url ?? "/products/fallback.jpg",
                    label: "Scale",
                    caption: "scale reference",
                  },
                ]}
              />
            </div>

            {/* title, price, variants */}
            <div className="min-w-0 p-3 md:p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {flags.includes("newArrival") ? <span className="badge badge-new">New arrival</span> : null}
                {flags.includes("bestseller") ? <span className="badge">Bestseller</span> : null}
                {flags.includes("trending") ? <span className="badge">Trending</span> : null}
                <span className="badge-out badge">{stock === 0 ? "Out of stock" : "In stock"}</span>
              </div>

              <h1 className="mt-1.5 text-[17px] font-semibold leading-snug text-[var(--color-ink)] md:text-[19px]">
                {product.name}
              </h1>
              {product.name_bn ? (
                <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-mute)]">{product.name_bn}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[22px] font-bold text-[var(--color-brand-ink)]">{formatBdt(price)}</span>
                {off ? (
                  <>
                    <span className="price-was text-[13px]">{formatBdt(product.retail_price)}</span>
                    <span className="rounded-sm bg-[var(--color-brand-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--color-brand-ink)]">
                      -{off}%
                    </span>
                  </>
                ) : null}
              </div>

              {/* an honest stand-in for the rating row: real stock, real policy */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[var(--color-ink-mute)]">
                <span>
                  {stock > 0 ? (
                    <>
                      <b className="text-[var(--color-ink-soft)]">{stock}</b> units available
                    </>
                  ) : (
                    "Currently unavailable"
                  )}
                </span>
                <span className="text-[var(--color-line-strong)]">|</span>
                <span>{product.moq} pcs sourcing MOQ</span>
                {stock > 0 && stock <= 6 ? (
                  <>
                    <span className="text-[var(--color-line-strong)]">|</span>
                    <span className="font-semibold text-[var(--color-warn)]">Low stock</span>
                  </>
                ) : null}
              </div>

              <dl className="mt-3 grid grid-cols-[72px_1fr] gap-x-2 gap-y-1.5 border-t border-[var(--color-line)] pt-3 text-[12px]">
                <dt className="text-[var(--color-ink-mute)]">Brand</dt>
                <dd className="text-[var(--color-ink-soft)]">SUPER Z SHOP</dd>
                <dt className="text-[var(--color-ink-mute)]">Category</dt>
                <dd>
                  <Link href={`/category/${product.category_slug}`} className="text-[var(--color-brand-deep)] hover:underline">
                    {product.category_name}
                  </Link>
                  <span className="text-[var(--color-ink-mute)]"> · {product.subcategory}</span>
                </dd>
                <dt className="text-[var(--color-ink-mute)]">SKU</dt>
                <dd className="font-mono text-[11px] text-[var(--color-ink-soft)]">{product.sku}</dd>
                <dt className="text-[var(--color-ink-mute)]">Delivery</dt>
                <dd className="text-[var(--color-ink-soft)]">
                  ৳70 Dhaka · ৳130 outside · <span className="font-semibold text-[var(--color-success)]">Free over ৳2,500</span>
                </dd>
              </dl>

              <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                {product.short_description}
              </p>

              <div className="mt-3 border-t border-[var(--color-line)] pt-3">
                <ProductDetailPanel
                  variants={variants}
                  retailPrice={product.retail_price}
                  salePrice={product.sale_price}
                  name={product.name}
                />
              </div>

              <div className="mt-2.5">
                <WishlistButton productId={product.id} initial={savedIds.includes(product.id)} variant="button" />
              </div>
            </div>

            {/* delivery / seller panel */}
            <aside className="border-t border-[var(--color-line)] p-3 lg:border-l lg:border-t-0">
              <p className="text-[12px] font-bold text-[var(--color-ink)]">Delivery &amp; service</p>
              <ul className="mt-2 space-y-2 text-[11.5px]">
                <li className="flex items-start gap-2">
                  <Icon name="truck" size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-deep)]" />
                  <span className="text-[var(--color-ink-soft)]">
                    <b className="text-[var(--color-ink)]">৳70</b> inside Dhaka · <b className="text-[var(--color-ink)]">৳130</b> outside
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="cash" size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-deep)]" />
                  <span className="text-[var(--color-ink-soft)]">Cash on delivery, all 64 districts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="box" size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-deep)]" />
                  <span className="text-[var(--color-ink-soft)]">Dispatched in 1–2 working days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="refresh" size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-deep)]" />
                  <span className="text-[var(--color-ink-soft)]">{product.warranty}</span>
                </li>
              </ul>

              <div className="mt-3 rounded border border-[var(--color-line)] bg-[var(--color-surface-2)] p-2.5">
                <p className="text-[11px] font-bold text-[var(--color-ink)]">Sold by</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-soft)]">SUPER Z SHOP</p>
                <p className="text-[11px] sm:text-[10.5px] text-[var(--color-ink-mute)]">Dhanmondi, Dhaka · Since 2026</p>
              </div>

              <div className="mt-3">
                <div className="rounded-sm bg-[var(--color-surface-2)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--color-ink-soft)]">
                  <p className="flex items-center gap-1 font-semibold text-[var(--color-ink)]">
                    <Icon name="refresh" size={11} /> Price match
                  </p>
                  <p className="mt-0.5">
                    Found this cheaper elsewhere? Send us the link and we will match it where we can. Prices include
                    VAT and are confirmed again before dispatch.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ============ description + specs ============ */}
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">Product details</h2>
            </div>
            <div className="p-4">
              <div className="prose-shop whitespace-pre-line text-[13px]">{product.description}</div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <li key={t} className="badge">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">Specifications</h2>
            </div>
            <dl className="divide-y divide-[var(--color-line)] text-[12px]">
              <div className="flex justify-between gap-3 px-3 py-2">
                <dt className="text-[var(--color-ink-mute)]">SKU</dt>
                <dd className="font-mono text-[11px]">{product.sku}</dd>
              </div>
              <div className="flex justify-between gap-3 px-3 py-2">
                <dt className="text-[var(--color-ink-mute)]">Category</dt>
                <dd className="text-right">{product.category_name} · {product.subcategory}</dd>
              </div>
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-[var(--color-ink-mute)]">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 px-3 py-2">
                <dt className="text-[var(--color-ink-mute)]">Variants</dt>
                <dd>{variants.length} combinations</dd>
              </div>
              <div className="flex justify-between gap-3 px-3 py-2">
                <dt className="text-[var(--color-ink-mute)]">Sourcing MOQ</dt>
                <dd>{product.moq} pcs</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* ============ related ============ */}
        {related.length > 0 ? (
          <section className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">You may also like</h2>
              <Link
                href={`/category/${product.category_slug}`}
                className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline"
              >
                More in {product.category_name} →
              </Link>
            </div>
            <div className="p-2">
              <ProductGrid products={related} wishlistedIds={savedIds} dense />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
