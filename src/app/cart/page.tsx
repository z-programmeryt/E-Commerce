import type { Metadata } from "next";
import Link from "next/link";
import { cartLines, getOrCreateCart, priceCart } from "@/lib/repo";
import { cartTokenReadOnly } from "@/lib/session";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CouponForm } from "@/components/cart/CouponForm";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { BRAND, formatBdt } from "@/lib/brand";

export const metadata: Metadata = { title: "Shopping cart", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  // Read the token only: a page render must not write cookies. A first-time
  // visitor has no cart yet, which is simply an empty cart.
  const token = await cartTokenReadOnly();
  const lines = token ? cartLines(getOrCreateCart(token)) : [];
  const totals = priceCart(lines, { freeDeliveryThreshold: BRAND.freeDeliveryThreshold });

  if (lines.length === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="mb-6 font-display text-2xl md:text-3xl">Shopping cart</h1>
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse the catalogue and add something you like — your cart is saved in this browser."
          action={{ label: "Start shopping", href: "/shop" }}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-2xl md:text-3xl">Shopping cart</h1>
        <Link href="/shop" className="link-underline text-xs font-semibold uppercase tracking-wide">Continue shopping</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Cart items" className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {lines.map((line) => (
            <CartLineItem key={line.variant_id} line={line} />
          ))}
        </section>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-5">
            <h2 className="font-display text-lg">Order summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-mute)]">Subtotal ({lines.reduce((s, l) => s + l.qty, 0)} items)</dt>
                <dd className="font-semibold">{formatBdt(totals.subtotal)}</dd>
              </div>
              {totals.saved > 0 ? (
                <div className="flex justify-between text-[var(--color-success)]">
                  <dt>You save</dt>
                  <dd className="font-semibold">−{formatBdt(totals.saved)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-mute)]">Delivery (inside Dhaka)</dt>
                <dd>{totals.freeDeliveryShortfall === 0 ? <span className="font-semibold text-[var(--color-success)]">Free</span> : formatBdt(70)}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--color-line)] pt-2.5 text-base">
                <dt className="font-semibold">Estimated total</dt>
                <dd className="font-semibold">{formatBdt(totals.total)}</dd>
              </div>
            </dl>

            {totals.freeDeliveryShortfall > 0 ? (
              <p className="mt-3 rounded-md bg-[var(--color-paper-2)] px-3 py-2 text-[0.6875rem] text-[var(--color-ink-soft)]">
                Add {formatBdt(totals.freeDeliveryShortfall)} more for free delivery.
              </p>
            ) : null}

            <div className="mt-4 border-t border-[var(--color-line)] pt-4">
              <CouponForm />
            </div>

            <Link href="/checkout" className="btn btn-primary mt-5 w-full">
              Proceed to checkout <Icon name="arrow-right" size={15} />
            </Link>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-[0.625rem] text-[var(--color-ink-mute)]">
              <Icon name="shield" size={11} /> Demo checkout — no payment is taken
            </p>
            <div className="mt-4 space-y-1.5 border-t border-[var(--color-line)] pt-3 text-[0.6875rem] text-[var(--color-ink-mute)]">
              <p className="flex items-center gap-1.5"><Icon name="truck" size={12} /> Delivery outside Dhaka: {formatBdt(130)}</p>
              <p className="flex items-center gap-1.5"><Icon name="refresh" size={12} /> 7-day replacement on selected items</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
