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
    <div className={`flex gap-4 py-5 ${pending ? "opacity-70" : ""}`}>
      <Link href={`/product/${line.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded border border-[var(--color-line)] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={line.image_url ?? "/placeholder.svg"} alt={line.name} className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-[0.5625rem]">{line.category_name}</p>
            <Link href={`/product/${line.slug}`} className="block truncate text-sm font-semibold hover:underline">
              {line.name}
            </Link>
            <p className="mt-0.5 text-xs text-[var(--color-ink-mute)]">
              {line.color} · {line.size} · <span className="font-mono text-[0.625rem]">{line.variant_sku}</span>
            </p>
          </div>
          <button
            onClick={() => startTransition(async () => { await removeCartLineAction(line.variant_id); })}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-mute)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-danger)]"
            aria-label={`Remove ${line.name} from cart`}
            disabled={pending}
          >
            <Icon name="trash" size={15} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-[var(--color-line-strong)] bg-white">
            <button
              onClick={() => update(qty - 1)}
              disabled={qty <= 1 || pending}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center disabled:opacity-35"
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="min-w-7 text-center text-xs font-semibold" aria-live="polite">{qty}</span>
            <button
              onClick={() => update(qty + 1)}
              disabled={qty >= max || pending}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center disabled:opacity-35"
            >
              <Icon name="plus" size={12} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatBdt(unit * qty)}</p>
            {line.sale_price ? (
              <p className="text-[0.6875rem] text-[var(--color-ink-mute)] line-through">{formatBdt(line.retail_price * qty)}</p>
            ) : null}
          </div>
        </div>
        {qty >= max ? (
          <p className="mt-1 text-[0.6875rem] text-[var(--color-warn)]">Maximum available: {max}</p>
        ) : null}
        {error ? <p className="mt-1 text-[0.6875rem] text-[var(--color-danger)]" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
