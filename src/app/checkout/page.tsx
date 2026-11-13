import type { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { cartLines, getOrCreateCart, priceCart } from "@/lib/repo";
import { cartTokenReadOnly } from "@/lib/session";
import { BRAND, formatBdt } from "@/lib/brand";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const coupon = (Array.isArray(sp.coupon) ? sp.coupon[0] : sp.coupon) ?? "";
  const token = await cartTokenReadOnly();
  const lines = token ? cartLines(getOrCreateCart(token)) : [];
  const totals = priceCart(lines, { freeDeliveryThreshold: BRAND.freeDeliveryThreshold });

  const locations = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "data/catalogue/locations.json"), "utf8"),
  ) as Record<string, string[]>;

  if (lines.length === 0) {
    return (
      <div className="container-page pb-6">
        <div className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
          <span className="text-[var(--color-ink-soft)]">Checkout</span>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
          <div className="section-bar">
            <h1 className="section-bar-title">Checkout</h1>
          </div>
          <div className="p-4">
            <EmptyState
              title="There is nothing to check out"
              subtitle="Add a product to your cart first, then return here."
              action={{ label: "Browse products", href: "/shop" }}
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
        <Link href="/cart" className="hover:text-[var(--color-brand-deep)] hover:underline">Cart</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]" aria-current="page">Checkout</span>
      </nav>

      {/* step indicator */}
      <ol className="mb-3 flex items-center gap-2 text-[11.5px]">
        {["Cart", "Delivery & payment", "Confirmation"].map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            {i > 0 ? <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" /> : null}
            <span
              className={
                i === 1
                  ? "flex items-center gap-1.5 font-semibold text-[var(--color-brand-deep)]"
                  : i === 0
                    ? "flex items-center gap-1.5 text-[var(--color-ink-soft)]"
                    : "flex items-center gap-1.5 text-[var(--color-ink-mute)]"
              }
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                  i === 0
                    ? "bg-[var(--color-success)] text-white"
                    : i === 1
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-[var(--color-line)] text-[var(--color-ink-mute)]"
                }`}
              >
                {i === 0 ? "✓" : i + 1}
              </span>
              {step}
            </span>
          </li>
        ))}
      </ol>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[17px] font-bold">Checkout</h1>
          <p className="text-[12px] text-[var(--color-ink-mute)]">
            {lines.length} product line{lines.length === 1 ? "" : "s"} · {formatBdt(totals.subtotal)} subtotal
          </p>
        </div>
        <Link href="/cart" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
          Back to cart
        </Link>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-3 md:p-4">
        <CheckoutForm
          districts={locations}
          subtotal={totals.subtotal}
          deliveryInside={BRAND.deliveryFees.insideDhaka}
          deliveryOutside={BRAND.deliveryFees.outsideDhaka}
          freeThreshold={BRAND.freeDeliveryThreshold}
          defaultCoupon={coupon}
        />
      </div>
    </div>
  );
}
