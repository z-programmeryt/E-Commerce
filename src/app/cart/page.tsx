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
      <div className="container-page pb-6">
        <div className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
          <span className="text-[var(--color-ink-soft)]">Shopping cart</span>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
          <div className="section-bar">
            <h1 className="section-bar-title">Shopping cart</h1>
          </div>
          <div className="p-4">
            <EmptyState
              title="Your cart is empty"
              subtitle="Browse the catalogue and add something you like — your cart is saved in this browser."
              action={{ label: "Start shopping", href: "/shop" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]">Shopping cart</span>
      </nav>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
          <div className="section-bar">
            <h1 className="section-bar-title">
              Shopping cart <span className="font-normal text-[var(--color-ink-mute)]">({lines.reduce((s, l) => s + l.qty, 0)} items)</span>
            </h1>
            <Link href="/shop" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
              Continue shopping
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-line)] px-3">
            {lines.map((line) => (
              <CartLineItem key={line.variant_id} line={line} />
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-[132px] lg:self-start" aria-label="Order summary">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="section-bar">
              <h2 className="section-bar-title">Order summary</h2>
            </div>
            <div className="p-3">
              <dl className="space-y-2 text-[12.5px]">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-mute)]">Subtotal ({lines.reduce((s, l) => s + l.qty, 0)} items)</dt>
                  <dd className="font-semibold">{formatBdt(totals.subtotal)}</dd>
                </div>
                {totals.saved > 0 ? (
                  <div className="flex justify-between text-[var(--color-sale)]">
                    <dt>Discount</dt>
                    <dd className="font-semibold">−{formatBdt(totals.saved)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-mute)]">Delivery (inside Dhaka)</dt>
                  <dd>
                    {totals.freeDeliveryShortfall === 0 ? (
                      <span className="font-semibold text-[var(--color-success)]">Free</span>
                    ) : (
                      formatBdt(70)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-[15px]">
                  <dt className="font-semibold">Estimated total</dt>
                  <dd className="font-bold text-[var(--color-brand-ink)]">{formatBdt(totals.total)}</dd>
                </div>
              </dl>

              {totals.freeDeliveryShortfall > 0 ? (
                <p className="mt-2.5 rounded-sm bg-[var(--color-brand-soft)] px-2.5 py-1.5 text-[11.5px] text-[var(--color-brand-ink)]">
                  Add {formatBdt(totals.freeDeliveryShortfall)} more for free delivery.
                </p>
              ) : null}

              <div className="mt-3 border-t border-[var(--color-line)] pt-3">
                <CouponForm />
              </div>

              <Link href="/checkout" className="btn btn-primary btn-lg btn-block mt-3">
                Proceed to checkout
              </Link>
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[10.5px] text-[var(--color-ink-mute)]">
                <Icon name="shield" size={11} /> Demo checkout — no payment is taken
              </p>

              <ul className="mt-3 space-y-1.5 border-t border-[var(--color-line)] pt-2.5 text-[11px] text-[var(--color-ink-mute)]">
                <li className="flex items-center gap-1.5">
                  <Icon name="cash" size={12} className="text-[var(--color-brand-deep)]" /> Cash on delivery available
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="truck" size={12} className="text-[var(--color-brand-deep)]" /> Outside Dhaka: {formatBdt(130)}
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="refresh" size={12} className="text-[var(--color-brand-deep)]" /> 7-day replacement on selected items
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
