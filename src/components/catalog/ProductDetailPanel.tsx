"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Variant } from "@/lib/types";
import { formatBdt } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";
import { addVariantToCartAction } from "@/app/actions";

export function ProductDetailPanel({
  variants,
  retailPrice,
  salePrice,
  name,
}: {
  variants: Variant[];
  retailPrice: number;
  salePrice: number | null;
  name: string;
}) {
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const [color, setColor] = useState(colors[0] ?? "");
  const sizesForColor = useMemo(
    () => variants.filter((v) => v.color === color),
    [variants, color],
  );
  const firstAvailable = sizesForColor.find((v) => v.stock > 0) ?? sizesForColor[0];
  const [size, setSize] = useState(firstAvailable?.size ?? "");
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  const selected = variants.find((v) => v.color === color && v.size === size);
  const price = (salePrice ?? retailPrice) + (selected?.price_delta ?? 0);
  const maxQty = Math.min(selected?.stock ?? 0, 10);

  function chooseColor(c: string) {
    setColor(c);
    const next = variants.filter((v) => v.color === c);
    const avail = next.find((v) => v.stock > 0) ?? next[0];
    setSize(avail?.size ?? "");
    setQty(1);
    setFeedback(null);
  }

  function add() {
    if (!selected) return;
    startTransition(async () => {
      const res = await addVariantToCartAction(selected.id, qty);
      if (res.ok) {
        setFeedback({ tone: "ok", text: `Added to cart — ${name}, ${selected.color} / ${selected.size}.` });
        router.refresh();
      } else {
        setFeedback({ tone: "err", text: res.error ?? "Could not add to cart." });
      }
    });
  }

  return (
    <div className="space-y-3.5">
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
          Colour: <span className="normal-case tracking-normal text-[var(--color-ink)]">{color}</span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Colour">
          {colors.map((c) => {
            const stock = variants.filter((v) => v.color === c).reduce((s, v) => s + v.stock, 0);
            return (
              <button
                key={c}
                role="radio"
                aria-checked={c === color}
                onClick={() => chooseColor(c)}
                className={`rounded-sm border px-2.5 py-1 text-[11.5px] transition-colors ${
                  c === color
                    ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-deep)]"
                    : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-brand)]"
                } ${stock === 0 ? "opacity-45" : ""}`}
              >
                {c}
                {stock === 0 ? " (sold out)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">Size / variant</p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Size">
          {sizesForColor.map((v) => (
            <button
              key={v.id}
              role="radio"
              aria-checked={v.size === size}
              onClick={() => { setSize(v.size); setQty(1); setFeedback(null); }}
              disabled={v.stock === 0}
              className={`min-w-11 rounded-sm border px-2.5 py-1 text-[11.5px] transition-colors ${
                v.size === size
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-deep)]"
                  : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-brand)]"
              } ${v.stock === 0 ? "cursor-not-allowed line-through opacity-45" : ""}`}
              title={v.stock === 0 ? "Out of stock" : `${v.stock} in stock`}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selected ? (
          <p className="mt-1.5 text-[11px] text-[var(--color-ink-mute)]">
            SKU {selected.variant_sku} ·{" "}
            {selected.stock === 0 ? (
              <span className="text-[var(--color-sale)]">Out of stock</span>
            ) : selected.stock <= 5 ? (
              <span className="text-[var(--color-warn)]">Only {selected.stock} left</span>
            ) : (
              <span className="text-[var(--color-success)]">{selected.stock} in stock</span>
            )}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">Quantity</p>
          <div className="flex items-center overflow-hidden rounded-sm border border-[var(--color-line-strong)] bg-white">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center text-[var(--color-ink-soft)] hover:bg-[#f5f5f5] disabled:opacity-30"
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="min-w-8 border-x border-[var(--color-line)] px-1 text-center text-[12.5px] font-semibold" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))}
              className="flex h-8 w-8 items-center justify-center text-[var(--color-ink-soft)] hover:bg-[#f5f5f5] disabled:opacity-30"
              disabled={!maxQty || qty >= maxQty}
              aria-label="Increase quantity"
            >
              <Icon name="plus" size={12} />
            </button>
          </div>
        </div>
        <div className="min-w-32 flex-1">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">Subtotal</p>
          <p className="text-[15px] font-bold text-[var(--color-brand-ink)]">{formatBdt(price * qty)}</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={add}
          disabled={!selected || selected.stock === 0 || pending}
          className="btn btn-primary flex-1"
        >
          <Icon name="bag" size={15} />
          {selected?.stock === 0 ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
        </button>
        <Link href="/cart" className="btn btn-outline shrink-0">
          Buy now
        </Link>
      </div>

      {feedback ? (
        <p
          role="status"
          className={`text-[11.5px] ${feedback.tone === "ok" ? "text-[var(--color-success)]" : "text-[var(--color-sale)]"}`}
        >
          {feedback.text}{" "}
          {feedback.tone === "ok" ? (
            <Link href="/cart" className="font-semibold underline underline-offset-2">View cart →</Link>
          ) : null}
        </p>
      ) : null}

      <p className="text-[10.5px] leading-relaxed text-[var(--color-ink-mute)]">
        Order today for dispatch in 1–2 working days. Cash on delivery available nationwide. Stock shown is the
        live figure from the local database.
      </p>
    </div>
  );
}
