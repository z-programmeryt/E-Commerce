import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber, getOrderItems } from "@/lib/repo";
import { formatBdt, formatDateTime } from "@/lib/brand";
import { ActivityTimeline } from "@/components/order/ActivityTimeline";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Enter your SUPER Z SHOP order number to see its current status.",
};
export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = (Array.isArray(sp.order) ? sp.order[0] : sp.order)?.trim().toUpperCase() ?? "";
  const attempted = raw.length > 0;
  const order = raw ? getOrderByNumber(raw) : undefined;
  const items = order ? getOrderItems(order.id) : [];

  return (
    <div className="container-page max-w-2xl py-10">
      <p className="eyebrow mb-2">Order tracking</p>
      <h1 className="font-display text-2xl md:text-3xl">Where is my parcel?</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        Enter the order number from your confirmation (for example <code className="rounded bg-[var(--color-paper-2)] px-1.5 py-0.5 font-mono text-xs">SZS-20261001</code>).
      </p>

      <form action="/order/track" method="get" className="mt-5 flex gap-2">
        <label htmlFor="order" className="sr-only">Order number</label>
        <input
          id="order"
          name="order"
          defaultValue={raw}
          placeholder="SZS-20261001"
          className="field h-11 flex-1 font-mono uppercase"
          required
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-sm shrink-0">Track</button>
      </form>

      {attempted && !order ? (
        <div className="mt-6 rounded-lg border border-[#f0e2c4] bg-[#fbf6ea] p-4 text-sm text-[#6d5211]" role="alert">
          <p className="font-semibold">No order found for “{raw}”.</p>
          <p className="mt-1">
            Check the number and try again. In this demo you can also{" "}
            <Link href="/account" className="underline">open your order history</Link> or sign in to the{" "}
            <Link href="/admin/login" className="underline">admin demo</Link> to see every seeded order.
          </p>
        </div>
      ) : null}

      {order ? (
        <div className="mt-7 space-y-5">
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">Order</p>
                <p className="font-mono text-lg font-semibold">{order.order_number}</p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-mute)]">Placed {formatDateTime(order.created_at)}</p>
              </div>
              <div className="text-right">
                <span className={`badge ${order.status === "delivered" ? "badge-new" : order.status === "cancelled" ? "badge-out" : "badge-low"}`}>
                  {order.status}
                </span>
                <p className="mt-1.5 text-sm font-semibold">{formatBdt(order.total)}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-[var(--color-line)] pt-4">
              <ActivityTimeline status={order.status} />
            </div>
            {order.tracking_code ? (
              <p className="mt-1 flex items-center gap-1.5 rounded-md bg-[var(--color-paper-2)] px-3 py-2 text-xs">
                <Icon name="truck" size={13} />
                {order.courier} · tracking <span className="font-mono font-semibold">{order.tracking_code}</span>
                <span className="ml-auto text-[0.625rem] text-[var(--color-ink-mute)]">Demo code — not a live courier record</span>
              </p>
            ) : null}
          </div>

          <div className="card p-5">
            <h2 className="mb-2 font-display text-base">Items in this order</h2>
            <ul className="divide-y divide-[var(--color-line)] text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate">{i.name}</span>
                    <span className="block text-[0.6875rem] text-[var(--color-ink-mute)]">{i.variant_label} · ×{i.qty}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatBdt(i.line_total)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
              Delivering to {order.ship_area}, {order.ship_district} · {order.ship_phone}
            </p>
          </div>

          <Link href={`/order/confirmation/${order.order_number}`} className="btn btn-outline">View full receipt</Link>
        </div>
      ) : null}

      {!attempted ? (
        <div className="mt-8 rounded-lg border border-[var(--color-line)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Demo order numbers to try</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["SZS-2026001", "SZS-2026004", "SZS-2026010", "SZS-2026013"].map((o) => (
              <Link key={o} href={`/order/track?order=${o}`} className="badge font-mono hover:border-[var(--color-ink)]">{o}</Link>
            ))}
          </div>
          <p className="mt-2 text-[0.6875rem] text-[var(--color-ink-mute)]">
            These are seeded demo orders covering different statuses.
          </p>
        </div>
      ) : null}
    </div>
  );
}
