import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBdt } from "@/lib/brand";
import { discountPercent, effectivePrice } from "@/lib/repo";
import { Icon } from "@/components/ui/Icon";
import { Countdown } from "./Countdown";

/**
 * Daraz-style flash-sale rail: orange header, live countdown to a stated
 * deadline, horizontally scrollable discounted tiles.
 *
 * The deals are real records in the local database and the discounts are
 * genuinely applied at checkout. The countdown is the demo's own 24-hour
 * cycle, not a manufactured "only 3 minutes left" pressure device, and it
 * resets predictably rather than pretending stock is about to vanish.
 */
export function FlashSaleRail({ products, wishlistedIds = [] }: { products: Product[]; wishlistedIds?: number[] }) {
  if (products.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[13px] font-extrabold uppercase tracking-wide text-[var(--color-brand-deep)]">
            <Icon name="lightning" size={15} /> Flash sale
          </span>
          <Countdown />
        </div>
        <Link href="/offers" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
          View all deals →
        </Link>
      </div>

      <div className="rail gap-0 p-2">
        {products.map((p) => {
          const off = discountPercent(p);
          return (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="w-[132px] shrink-0 px-1 transition-transform hover:-translate-y-0.5 md:w-[152px]"
            >
              <span className="relative block aspect-square overflow-hidden rounded border border-[var(--color-line)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url ?? "/placeholder.svg"} alt={p.name} className="h-full w-full object-contain p-1.5" />
                {off ? <span className="tile-discount">-{off}%</span> : null}
              </span>
              <span className="mt-1.5 block line-clamp-2 text-[11.5px] leading-tight text-[var(--color-ink-soft)]">
                {p.name}
              </span>
              <span className="mt-0.5 block text-[13px] font-bold text-[var(--color-brand-ink)]">
                {formatBdt(effectivePrice(p))}
              </span>
              <span className="block text-[10.5px] text-[var(--color-ink-mute)] line-through">
                {formatBdt(p.retail_price)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
