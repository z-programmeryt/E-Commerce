"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { placeOrderAction, type CheckoutState } from "@/app/actions";
import { formatBdt } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";

type Option = { name: string; areas: string[] };

const initial: CheckoutState = { ok: false };

export function CheckoutForm({
  districts,
  subtotal,
  deliveryInside,
  deliveryOutside,
  freeThreshold,
  defaultCoupon,
}: {
  districts: Record<string, string[]>;
  subtotal: number;
  deliveryInside: number;
  deliveryOutside: number;
  freeThreshold: number;
  defaultCoupon: string;
}) {
  const [state, action, pending] = useActionState(placeOrderAction, initial);
  const [district, setDistrict] = useState("Dhaka");
  const [coupon, setCoupon] = useState(defaultCoupon);
  const [payment, setPayment] = useState("cod");

  const districtNames = Object.keys(districts);
  const areas = districts[district] ?? [];

  const delivery = useMemo(() => {
    if (subtotal >= freeThreshold) return 0;
    return district === "Dhaka" ? deliveryInside : deliveryOutside;
  }, [district, subtotal, freeThreshold, deliveryInside, deliveryOutside]);

  // Discount preview only — the authoritative calculation happens server-side.
  const [discount, setDiscount] = useState(0);
  useEffect(() => {
    const code = coupon.trim().toUpperCase();
    let d = 0;
    if (code === "WELCOME10" && subtotal >= 1000) d = Math.min(Math.round(subtotal * 0.1), 300);
    if (code === "EID500" && subtotal >= 5000) d = 500;
    if (code === "SUPERZ15" && subtotal >= 2000) d = Math.min(Math.round(subtotal * 0.15), 500);
    setDiscount(d);
  }, [coupon, subtotal]);

  const freeShip = coupon.trim().toUpperCase() === "FREESHIP" && subtotal >= 1500;
  const shownDelivery = freeShip ? 0 : delivery;
  const total = Math.max(0, subtotal - discount + shownDelivery);

  const err = state.errors ?? {};

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-6">
        {state.message && !state.ok ? (
          <div className="rounded-lg border border-[#ecd3cb] bg-[#fbf1ee] px-4 py-3 text-sm text-[#7e2b1f]" role="alert">
            {state.message}
          </div>
        ) : null}

        <section className="card p-5">
          <h2 className="mb-4 font-display text-lg">1. Contact details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Full name *</label>
              <input id="name" name="name" required className="field" aria-invalid={!!err.name} autoComplete="name" />
              {err.name ? <p className="error-text">{err.name}</p> : null}
            </div>
            <div>
              <label htmlFor="phone" className="label">Mobile number *</label>
              <input id="phone" name="phone" required inputMode="tel" placeholder="01712345678" className="field" aria-invalid={!!err.phone} autoComplete="tel" />
              {err.phone ? <p className="error-text">{err.phone}</p> : <p className="help">Bangladeshi number, e.g. 01712345678</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="label">Email *</label>
              <input id="email" name="email" type="email" required className="field" aria-invalid={!!err.email} autoComplete="email" />
              {err.email ? <p className="error-text">{err.email}</p> : <p className="help">Used for the order receipt only.</p>}
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-display text-lg">2. Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className="label">Street address *</label>
              <input id="address" name="address" required className="field" aria-invalid={!!err.address} autoComplete="street-address" placeholder="House / road / block, landmark" />
              {err.address ? <p className="error-text">{err.address}</p> : null}
            </div>
            <div>
              <label htmlFor="district" className="label">District *</label>
              <select
                id="district"
                name="district"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="field"
                aria-invalid={!!err.district}
              >
                {districtNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {err.district ? <p className="error-text">{err.district}</p> : null}
            </div>
            <div>
              <label htmlFor="area" className="label">Area / thana *</label>
              <select id="area" name="area" required className="field" aria-invalid={!!err.area} key={district}>
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {err.area ? <p className="error-text">{err.area}</p> : null}
            </div>
            <div>
              <label htmlFor="postcode" className="label">Postcode</label>
              <input id="postcode" name="postcode" inputMode="numeric" maxLength={4} className="field" autoComplete="postal-code" />
              <p className="help">Optional. District defaults apply.</p>
            </div>
            <div>
              <label htmlFor="coupon" className="label">Coupon code</label>
              <input
                id="coupon"
                name="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="field font-mono uppercase"
                placeholder="WELCOME10"
                autoComplete="off"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="label">Delivery notes</label>
              <textarea id="notes" name="notes" rows={2} className="field" placeholder="Landmark, preferred delivery window, gift note…" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-display text-lg">3. Payment</h2>
          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${payment === "cod" ? "border-[var(--color-ink)] bg-[var(--color-paper)]" : "border-[var(--color-line)]"}`}>
              <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} className="mt-1" />
              <span>
                <span className="block text-sm font-semibold">Cash on delivery</span>
                <span className="block text-xs text-[var(--color-ink-mute)]">Pay the courier when your parcel arrives. Available nationwide.</span>
              </span>
            </label>
            <label className="mt-2 flex cursor-not-allowed items-start gap-3 rounded-lg border border-[var(--color-line)] p-3 opacity-55">
              <input type="radio" disabled className="mt-1" />
              <span>
                <span className="block text-sm font-semibold">Card / bKash / Nagad</span>
                <span className="block text-xs text-[var(--color-ink-mute)]">
                  Not connected in this local demo. No payment gateway is wired up.
                </span>
              </span>
            </label>
          </fieldset>
          <div className="mt-3">
            <label className="flex items-start gap-2 text-xs text-[var(--color-ink-soft)]">
              <input type="checkbox" required className="mt-0.5" />
              <span>I have reviewed the <Link href="/pages/terms-conditions" className="link-underline">terms</Link> and <Link href="/pages/return-refund-policy" className="link-underline">return policy</Link>.</span>
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="card p-5">
          <h2 className="font-display text-lg">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-mute)]">Subtotal</dt>
              <dd className="font-semibold">{formatBdt(subtotal)}</dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-[var(--color-success)]">
                <dt>Coupon {coupon.trim().toUpperCase()}</dt>
                <dd className="font-semibold">−{formatBdt(discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-mute)]">Delivery to {district}</dt>
              <dd>{shownDelivery === 0 ? <span className="font-semibold text-[var(--color-success)]">Free</span> : formatBdt(shownDelivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--color-line)] pt-2.5 text-base">
              <dt className="font-semibold">Total to pay on delivery</dt>
              <dd className="font-semibold">{formatBdt(total)}</dd>
            </div>
          </dl>

          <p className="mt-3 rounded-md bg-[var(--color-paper-2)] px-3 py-2 text-[0.625rem] leading-relaxed text-[var(--color-ink-mute)]">
            Preview only. The server recalculates discounts, delivery and stock when you place the order.
          </p>

          <button type="submit" className="btn btn-primary mt-4 w-full" disabled={pending}>
            {pending ? "Placing order…" : `Place order · ${formatBdt(total)}`}
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.625rem] text-[var(--color-ink-mute)]">
            <Icon name="shield" size={11} /> Demo order — nothing is charged or shipped
          </p>
        </div>
      </aside>
    </form>
  );
}
