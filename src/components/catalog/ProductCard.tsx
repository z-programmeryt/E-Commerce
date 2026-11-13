import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBdt } from "@/lib/brand";
import { discountPercent, effectivePrice, parseFlags } from "@/lib/repo";
import { Icon } from "@/components/ui/Icon";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

type Props = {
  product: Product;
  priority?: boolean;
  wishlisted?: boolean;
  compact?: boolean;
};

/**
 * Marketplace tile: near-square image, orange discount tag top-right, title
 * clamped to two lines, price-led footer. Deliberately dense — six or seven
 * per row on desktop, which is the density shoppers expect from a marketplace.
 *
 * No star rating and no sold-count is rendered, because there are no real
 * reviews or sales history behind them. Showing invented ones would be fake
 * social proof; the layout keeps that space for delivery and stock facts
 * instead, which are true.
 */
export function ProductCard({ product, wishlisted = false, compact = false }: Props) {
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const flags = parseFlags(product);
  const stock = product.total_stock ?? 0;
  const soldOut = stock <= 0;
  const low = stock > 0 && stock <= 6;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] transition-shadow duration-150 hover:shadow-[var(--shadow-hover)]">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
          <div className="relative aspect-square overflow-hidden bg-[var(--color-media)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url ?? "/placeholder.svg"}
              alt={`${product.name} — placeholder illustration`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            />
            {soldOut ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]/72">
                <span className="rounded-sm bg-[var(--color-ink)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Sold out
                </span>
              </div>
            ) : null}
          </div>
        </Link>

        {off ? <span className="tile-discount">-{off}%</span> : null}

        {/* wishlist sits bottom-right of the image, as on Daraz */}
        <div className="absolute bottom-1.5 right-1.5">
          <WishlistButton productId={product.id} initial={wishlisted} variant="icon" />
        </div>

        {!compact && !soldOut ? (
          <div className="absolute inset-x-1.5 bottom-1.5 pr-10 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 max-md:hidden">
            <AddToCartButton productId={product.id} soldOut={soldOut} full />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3 className="line-clamp-2 text-[12.5px] leading-[1.35] text-[var(--color-ink)]">
          <Link href={`/product/${product.slug}`} className="hover:text-[var(--color-brand-deep)]">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline gap-1.5">
          <span className="price-now">{formatBdt(price)}</span>
          {off ? <span className="price-was">{formatBdt(product.retail_price)}</span> : null}
        </div>

        <div className="flex min-h-[16px] flex-wrap items-center gap-1">
          {soldOut ? (
            <span className="text-[11px] text-[var(--color-ink-mute)]">Out of stock</span>
          ) : low ? (
            <span className="text-[11px] font-semibold text-[var(--color-warn)]">Only {stock} left</span>
          ) : flags.includes("newArrival") ? (
            <span className="badge badge-new">New</span>
          ) : flags.includes("bestseller") ? (
            <span className="badge">Bestseller</span>
          ) : null}
          {price >= 2500 ? <span className="badge badge-free">Free delivery</span> : null}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  wishlistedIds = [],
  dense = false,
}: {
  products: Product[];
  wishlistedIds?: number[];
  dense?: boolean;
}) {
  return (
    <div
      className={
        dense
          ? "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          : "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      }
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} wishlisted={wishlistedIds.includes(p.id)} />
      ))}
    </div>
  );
}
