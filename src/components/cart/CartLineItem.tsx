"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { CartLine } from "@/lib/types";
import { formatBdt } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";
import { removeCartLineAction, updateCartQtyAction } from "@/app/actions";

export function CartLineItem({ line }: { line: CartLine }) {
  const unit = line.sale_price ?? line.retail_price;
  const [qty, setQty] = useState(line.qty);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const max = Math.min(line.stock, 10);

  function update(next: number) {
    if (next < 1 || next > max) return;
    setQty(next);
    startTransition(async () => {
      const res = await updateCartQtyAction(line.variant_id, next);
      if (!res.ok) setError(res.error ?? "Could not update");
      else setError(null);
    });
  }

  return (
    <div className={`flex gap-3 px-3 py-3 hover:bg-[var(--color-surface-2)] ${pending ? "opacity-60" : ""}`}>
      <Link
        href={`/product/${line.slug}`}
        className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded border border-[var(--color-line)] bg-[var(--color-surface)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={line.image_url ?? "/products/fallback.jpg"} alt={line.name} className="h-full w-full object-contain" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${line.slug}`}
              className="block line-clamp-2 text-[13px] leading-snug hover:text-[var(--color-brand-deep)] hover:underline"
            >
              {line.name}
            </Link>
            <p className="mt-0.5 text-[11px] text-[var(--color-ink-mute)]">
              {line.color} · {line.size} · <span className="font-mono">{line.variant_sku}</span>
            </p>
            <p className="text-[11px] text-[var(--color-ink-mute)]">{line.category_name}</p>
          </div>
          <button
            onClick={() => startTransition(async () => { await removeCartLineAction(line.variant_id); })}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[var(--color-ink-mute)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-sale)]"
            aria-label={`Remove ${line.name} from cart`}
            disabled={pending}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden rounded-sm border border-[var(--color-line-strong)] bg-[var(--color-surface)]">
            <button
              onClick={() => update(qty - 1)}
              disabled={qty <= 1 || pending}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] disabled:opacity-30"
            >
              <Icon name="minus" size={11} />
            </button>
            <span className="min-w-7 border-x border-[var(--color-line)] px-1 text-center text-[12px] font-semibold" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => update(qty + 1)}
              disabled={qty >= max || pending}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] disabled:opacity-30"
            >
              <Icon name="plus" size={11} />
            </button>
          </div>
          <div className="text-right leading-tight">
            <p className="text-[13.5px] font-bold text-[var(--color-brand-ink)]">{formatBdt(unit * qty)}</p>
            {line.sale_price ? (
              <p className="text-[11px] text-[var(--color-ink-mute)] line-through">{formatBdt(line.retail_price * qty)}</p>
            ) : null}
          </div>
        </div>
        {qty >= max ? (
          <p className="mt-1 text-[11px] sm:text-[10.5px] text-[var(--color-warn)]">Maximum available: {max}</p>
        ) : null}
        {error ? <p className="mt-1 text-[11px] sm:text-[10.5px] text-[var(--color-sale)]" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
