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

export function ProductCard({ product, wishlisted = false, compact = false }: Props) {
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const flags = parseFlags(product);
  const stock = product.total_stock ?? 0;
  const soldOut = stock <= 0;
  const low = stock > 0 && stock <= 6;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
        <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
          <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-paper-2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url ?? "/placeholder.svg"}
              alt={`${product.name} — studio illustration`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            />
            {soldOut ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <span className="rounded-full bg-white px-3 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                  Sold out
                </span>
              </div>
            ) : null}
          </div>
        </Link>

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {off ? <span className="badge badge-sale">−{off}%</span> : null}
          {flags.includes("newArrival") ? <span className="badge badge-new">New</span> : null}
          {low ? <span className="badge badge-low">{stock} left</span> : null}
        </div>

        <div className="absolute right-2.5 top-2.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
          <WishlistButton productId={product.id} initial={wishlisted} variant="icon" />
        </div>

        {!compact && !soldOut ? (
          <div className="absolute inset-x-2.5 bottom-2.5 translate-y-1 opacity-0 transition-all duration-150 focus-within:translate-y-0 focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
            <AddToCartButton productId={product.id} soldOut={soldOut} full />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="eyebrow mb-1 text-[0.625rem]">{product.category_name}</p>
        <h3 className="text-sm font-semibold leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:underline hover:underline-offset-2">
            {product.name}
          </Link>
        </h3>
        {!compact ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-ink-mute)]">
            {product.short_description}
          </p>
        ) : null}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formatBdt(price)}</span>
          {off ? (
            <span className="text-xs text-[var(--color-ink-mute)] line-through">{formatBdt(product.retail_price)}</span>
          ) : null}
        </div>
        {soldOut ? (
          <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-[var(--color-ink-mute)]">
            <Icon name="alert" size={12} /> Out of stock
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ProductGrid({ products, wishlistedIds = [] }: { products: Product[]; wishlistedIds?: number[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} wishlisted={wishlistedIds.includes(p.id)} />
      ))}
    </div>
  );
}
