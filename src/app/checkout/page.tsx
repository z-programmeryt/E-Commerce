import type { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { cartLines, getOrCreateCart, priceCart } from "@/lib/repo";
import { cartTokenReadOnly } from "@/lib/session";
import { BRAND, formatBdt } from "@/lib/brand";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { EmptyState } from "@/components/EmptyState";

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
      <div className="container-page py-12">
        <h1 className="mb-6 font-display text-2xl md:text-3xl">Checkout</h1>
        <EmptyState
          title="There is nothing to check out"
          subtitle="Add a product to your cart first, then return here."
          action={{ label: "Browse products", href: "/shop" }}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Checkout</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
            {lines.length} product line{lines.length === 1 ? "" : "s"} ·{" "}
            {formatBdt(totals.subtotal)} subtotal
          </p>
        </div>
        <Link href="/cart" className="link-underline text-xs font-semibold uppercase tracking-wide">Back to cart</Link>
      </div>

      <CheckoutForm
        districts={locations}
        subtotal={totals.subtotal}
        deliveryInside={BRAND.deliveryFees.insideDhaka}
        deliveryOutside={BRAND.deliveryFees.outsideDhaka}
        freeThreshold={BRAND.freeDeliveryThreshold}
        defaultCoupon={coupon}
      />
    </div>
  );
}
