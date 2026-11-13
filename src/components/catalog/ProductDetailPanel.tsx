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
    <div className="space-y-5">
      <div>
        <p className="label mb-2">Colour: <span className="font-normal normal-case tracking-normal text-[var(--color-ink)]">{color}</span></p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
          {colors.map((c) => {
            const stock = variants.filter((v) => v.color === c).reduce((s, v) => s + v.stock, 0);
            return (
              <button
                key={c}
                role="radio"
                aria-checked={c === color}
                onClick={() => chooseColor(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  c === color
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-line-strong)] bg-white hover:border-[var(--color-ink)]"
                } ${stock === 0 ? "opacity-50" : ""}`}
              >
                {c}
                {stock === 0 ? " (sold out)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label mb-2">Size / variant</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {sizesForColor.map((v) => (
            <button
              key={v.id}
              role="radio"
              aria-checked={v.size === size}
              onClick={() => { setSize(v.size); setQty(1); setFeedback(null); }}
              disabled={v.stock === 0}
              className={`min-w-12 rounded-md border px-3 py-2 text-xs transition-colors ${
                v.size === size
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                  : "border-[var(--color-line-strong)] bg-white hover:border-[var(--color-ink)]"
              } ${v.stock === 0 ? "cursor-not-allowed line-through opacity-45" : ""}`}
              title={v.stock === 0 ? "Out of stock" : `${v.stock} in stock`}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selected ? (
          <p className="mt-2 text-xs text-[var(--color-ink-mute)]">
            SKU {selected.variant_sku} ·{" "}
            {selected.stock === 0 ? (
              <span className="text-[var(--color-danger)]">Out of stock</span>
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
          <p className="label mb-2">Quantity</p>
          <div className="flex items-center rounded-full border border-[var(--color-line-strong)] bg-white">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Icon name="minus" size={14} />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))}
              className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
              disabled={!maxQty || qty >= maxQty}
              aria-label="Increase quantity"
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-40">
          <p className="label mb-2">Subtotal</p>
          <p className="text-lg font-semibold">{formatBdt(price * qty)}</p>
        </div>
      </div>

      <button
        onClick={add}
        disabled={!selected || selected.stock === 0 || pending}
        className="btn btn-primary w-full"
      >
        <Icon name="bag" size={16} />
        {selected?.stock === 0 ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
      </button>

      {feedback ? (
        <p
          role="status"
          className={`text-xs ${feedback.tone === "ok" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
        >
          {feedback.text}{" "}
          {feedback.tone === "ok" ? (
            <Link href="/cart" className="link-underline font-semibold">View cart →</Link>
          ) : null}
        </p>
      ) : null}

      <p className="text-[0.6875rem] leading-relaxed text-[var(--color-ink-mute)]">
        Order today for dispatch in 1–2 working days. Cash on delivery available nationwide.
        Stock shown is the live figure from the local database.
      </p>
    </div>
  );
}
