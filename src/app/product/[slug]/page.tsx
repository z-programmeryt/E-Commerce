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
import { Alert } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.category_name}`,
    description: product.short_description,
    openGraph: { title: product.name, description: product.short_description },
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
  const related = relatedProducts(product, 4);
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const stock = product.total_stock ?? 0;

  const wkey = await wishlistKeyReadOnly();
  const savedIds = wkey ? wishlistIds(wkey) : [];

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: `/category/${product.category_slug}`, label: product.category_name ?? "" },
    { href: `/product/${product.slug}`, label: product.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.short_description,
    category: product.category_name,
    brand: { "@type": "Brand", name: BRAND.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price,
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-[var(--color-ink-mute)]">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {i === crumbs.length - 1 ? (
              <span className="text-[var(--color-ink)]" aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:underline">{c.label}</Link>
            )}
          </span>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url ?? "/placeholder.svg"}
              alt={`${product.name} — studio illustration, not a supplier photograph`}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[0.6875rem] text-[var(--color-ink-mute)]">
            <Icon name="alert" size={12} className="mt-0.5 shrink-0" />
            Studio illustration. A verified supplier photograph has not been sourced for this SKU.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/category/${product.category_slug}`} className="eyebrow hover:underline">
              {product.category_name}
            </Link>
            <span className="text-[var(--color-ink-mute)]">·</span>
            <span className="text-[0.6875rem] text-[var(--color-ink-mute)]">{product.subcategory}</span>
          </div>

          <h1 className="mt-2 font-display text-[1.75rem] leading-tight md:text-[2.1rem]">{product.name}</h1>
          {product.name_bn ? <p className="mt-1 text-sm text-[var(--color-ink-mute)]">{product.name_bn}</p> : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold">{formatBdt(price)}</span>
            {off ? (
              <>
                <span className="text-sm text-[var(--color-ink-mute)] line-through">{formatBdt(product.retail_price)}</span>
                <span className="badge badge-sale">Save {off}%</span>
              </>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {flags.includes("featured") ? <span className="badge">Featured</span> : null}
            {flags.includes("trending") ? <span className="badge">Trending</span> : null}
            {flags.includes("bestseller") ? <span className="badge">Best seller</span> : null}
            {flags.includes("newArrival") ? <span className="badge badge-new">New arrival</span> : null}
            <span className={`badge ${stock === 0 ? "badge-out" : stock <= 6 ? "badge-low" : "badge-new"}`}>
              {stock === 0 ? "Out of stock" : `${stock} in stock`}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">{product.short_description}</p>

          <div className="mt-6 border-t border-[var(--color-line)] pt-6">
            <ProductDetailPanel
              variants={variants}
              retailPrice={product.retail_price}
              salePrice={product.sale_price}
              name={product.name}
            />
          </div>

          <div className="mt-4">
            <WishlistButton productId={product.id} initial={savedIds.includes(product.id)} variant="button" />
          </div>

          <div className="mt-6 grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 text-xs sm:grid-cols-2">
            <p className="flex items-start gap-2"><Icon name="truck" size={15} className="mt-0.5 shrink-0 text-[var(--color-olive-deep)]" /> Delivery ৳70 inside Dhaka, ৳130 outside. Free over ৳2,500.</p>
            <p className="flex items-start gap-2"><Icon name="shield" size={15} className="mt-0.5 shrink-0 text-[var(--color-olive-deep)]" /> Cash on delivery available nationwide.</p>
            <p className="flex items-start gap-2"><Icon name="refresh" size={15} className="mt-0.5 shrink-0 text-[var(--color-olive-deep)]" /> {product.warranty} on manufacturing defects.</p>
            <p className="flex items-start gap-2"><Icon name="box" size={15} className="mt-0.5 shrink-0 text-[var(--color-olive-deep)]" /> Packed in Dhaka, dispatched within 1–2 working days.</p>
          </div>

          <div className="mt-5">
            <Alert tone="warn" title="Price is unverified demo data">
              {formatBdt(product.retail_price)} retail and {formatBdt(product.wholesale_cost)} indicative wholesale
              are planning estimates, not a supplier quotation. Confirm with a Dhaka supplier before selling.
            </Alert>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 border-t border-[var(--color-line)] pt-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl">Product details</h2>
          <div className="prose-shop mt-3 whitespace-pre-line text-sm">{product.description}</div>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li key={t} className="badge">{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl">Specifications</h2>
          <dl className="mt-3 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)] text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[var(--color-ink-mute)]">SKU</dt>
              <dd className="font-mono text-xs">{product.sku}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[var(--color-ink-mute)]">Category</dt>
              <dd>{product.category_name} · {product.subcategory}</dd>
            </div>
            {Object.entries(specs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--color-ink-mute)]">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[var(--color-ink-mute)]">Variants</dt>
              <dd>{variants.length} colour/size combinations</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[var(--color-ink-mute)]">Sourcing MOQ</dt>
              <dd>{product.moq} pcs</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-xl">More in {product.category_name}</h2>
          <ProductGrid products={related} wishlistedIds={savedIds} />
        </section>
      ) : null}
    </div>
  );
}
