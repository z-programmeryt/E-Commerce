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
    <div className="container-page pb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]" aria-current="page">Order confirmed</span>
      </nav>

      {/* success banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-success-line)] bg-[var(--color-success-soft)] px-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Icon name="check" size={18} strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-bold text-[var(--color-ink)]">
            Thank you, {order.ship_name.split(" ")[0]} — your order is placed
          </h1>
          <p className="text-[12px] text-[var(--color-ink-soft)]">
            <span className="font-mono font-semibold">{order.order_number}</span> is recorded in the local
            database and stock has been reduced. Placed {formatDateTime(order.created_at)}.
          </p>
          <p className="text-[11px] text-[var(--color-ink-mute)]">
            Demo build — no courier was booked and no payment was taken.
          </p>
        </div>
        <Link href={`/order/track?order=${order.order_number}`} className="btn btn-primary btn-sm shrink-0">
          Track this order
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total", value: formatBdt(order.total), note: "Cash on delivery" },
          { label: "Status", value: order.status, note: `Payment: ${order.payment_status}`, cap: true },
          { label: "Delivery to", value: `${order.ship_area}`, note: `${order.ship_district} · ${order.ship_phone}` },
        ].map((c) => (
          <div key={c.label} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="border-b border-[var(--color-line)] px-3 py-1.5">
              <p className="text-[11px] sm:text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">{c.label}</p>
            </div>
            <div className="px-3 py-2">
              <p className={`text-[14px] font-bold text-[var(--color-ink)] ${c.cap ? "capitalize" : ""}`}>{c.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--color-ink-mute)]">{c.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">What happens next</h2>
            </div>
            <div className="p-3">
              <ActivityTimeline status={order.status} />
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">Items in this order</h2>
              <span className="text-[12px] text-[var(--color-ink-mute)]">{items.length} lines</span>
            </div>
            <ul className="divide-y divide-[var(--color-line)]">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{item.name}</p>
                    <p className="text-[11px] text-[var(--color-ink-mute)]">
                      {item.variant_label} · {item.sku} · ×{item.qty}
                    </p>
                  </div>
                  <p className="shrink-0 text-[12.5px] font-semibold">{formatBdt(item.line_total)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-[var(--color-line)] px-3 py-2.5 text-[12px]">
              <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Subtotal</dt><dd>{formatBdt(order.subtotal)}</dd></div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-[var(--color-success)]"><dt>Discount {order.coupon_code}</dt><dd>−{formatBdt(order.discount)}</dd></div>
              ) : null}
              <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Delivery</dt><dd>{order.delivery_fee === 0 ? "Free" : formatBdt(order.delivery_fee)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-[var(--color-line)] pt-1.5 text-[14px] font-bold">
                <dt>Total</dt><dd className="text-[var(--color-brand-ink)]">{formatBdt(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[132px] lg:self-start">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">Delivery address</h2>
            </div>
            <address className="p-3 text-[12px] not-italic leading-relaxed text-[var(--color-ink-soft)]">
              <span className="block font-semibold text-[var(--color-ink)]">{order.ship_name}</span>
              <span className="block">{order.ship_address}</span>
              <span className="block">{order.ship_area}, {order.ship_district}</span>
              <span className="block">{order.ship_phone}</span>
              <span className="block break-all">{order.ship_email}</span>
              {order.notes ? (
                <span className="mt-2 block text-[11px] text-[var(--color-ink-mute)]">Notes: {order.notes}</span>
              ) : null}
            </address>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
              Need to change something?
            </p>
            <p className="text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
              Call {BRAND.phone} during {BRAND.supportHours} or email {BRAND.email}.
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link href="/shop" className="btn btn-outline btn-sm">Continue shopping</Link>
              <Link href="/account" className="btn btn-neutral btn-sm">My orders</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
