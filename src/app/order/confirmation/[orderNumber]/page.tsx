import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber, getOrderItems } from "@/lib/repo";
import { formatBdt, formatDateTime, BRAND } from "@/lib/brand";
import { Icon } from "@/components/ui/Icon";
import { ActivityTimeline } from "@/components/order/ActivityTimeline";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = getOrderByNumber(orderNumber);
  if (!order) notFound();
  const items = getOrderItems(order.id);

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ea] text-[var(--color-olive-deep)]">
          <Icon name="check" size={26} strokeWidth={2} />
        </span>
        <p className="eyebrow mt-4">Order placed</p>
        <h1 className="mt-1 font-display text-2xl md:text-3xl">Thank you, {order.ship_name.split(" ")[0]}.</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Your order <span className="font-mono font-semibold text-[var(--color-ink)]">{order.order_number}</span> is
          recorded in the local database and stock has been reduced.
        </p>
        <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
          Placed {formatDateTime(order.created_at)} · Demo build — no courier was booked and no payment was taken.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="eyebrow mb-1">Total</p>
          <p className="font-display text-xl">{formatBdt(order.total)}</p>
          <p className="mt-0.5 text-[0.6875rem] text-[var(--color-ink-mute)]">Cash on delivery</p>
        </div>
        <div className="card p-4">
          <p className="eyebrow mb-1">Status</p>
          <p className="font-display text-xl capitalize">{order.status}</p>
          <p className="mt-0.5 text-[0.6875rem] text-[var(--color-ink-mute)]">Payment: {order.payment_status}</p>
        </div>
        <div className="card p-4">
          <p className="eyebrow mb-1">Delivery to</p>
          <p className="text-sm font-semibold">{order.ship_area}, {order.ship_district}</p>
          <p className="mt-0.5 text-[0.6875rem] text-[var(--color-ink-mute)]">{order.ship_phone}</p>
        </div>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="mb-3 font-display text-lg">What happens next</h2>
        <ActivityTimeline status={order.status} />
      </section>

      <section className="card mt-6 overflow-hidden">
        <h2 className="border-b border-[var(--color-line)] px-5 py-4 font-display text-lg">Items</h2>
        <ul className="divide-y divide-[var(--color-line)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">{item.variant_label} · {item.sku} · ×{item.qty}</p>
              </div>
              <p className="shrink-0 font-semibold">{formatBdt(item.line_total)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-[var(--color-line)] px-5 py-4 text-sm">
          <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Subtotal</dt><dd>{formatBdt(order.subtotal)}</dd></div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-[var(--color-success)]"><dt>Discount {order.coupon_code}</dt><dd>−{formatBdt(order.discount)}</dd></div>
          ) : null}
          <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Delivery</dt><dd>{order.delivery_fee === 0 ? "Free" : formatBdt(order.delivery_fee)}</dd></div>
          <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatBdt(order.total)}</dd></div>
        </dl>
      </section>

      <section className="card mt-6 p-5 text-sm">
        <h2 className="mb-2 font-display text-lg">Delivery address</h2>
        <p className="text-[var(--color-ink-soft)]">
          {order.ship_name}<br />
          {order.ship_address}<br />
          {order.ship_area}, {order.ship_district}<br />
          {order.ship_phone} · {order.ship_email}
        </p>
        {order.notes ? <p className="mt-2 text-xs text-[var(--color-ink-mute)]">Notes: {order.notes}</p> : null}
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/order/track?order=${order.order_number}`} className="btn btn-primary">Track this order</Link>
        <Link href="/shop" className="btn btn-outline">Continue shopping</Link>
        <Link href="/account" className="btn btn-outline">My orders</Link>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--color-ink-mute)]">
        Questions? Call {BRAND.phone} or email {BRAND.email} · {BRAND.supportHours}
      </p>
    </div>
  );
}
