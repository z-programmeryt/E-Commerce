import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber, getOrderItems } from "@/lib/repo";
import { formatBdt, formatDateTime } from "@/lib/brand";
import { ActivityTimeline } from "@/components/order/ActivityTimeline";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";
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
    <div className="container-page pb-6">
      <ListingHeader
        title="Where is my parcel?"
        subtitle="Enter the order number from your confirmation — it looks like SZS-2026001. This demo has no live courier feed; the timeline reflects the status stored in the local database."
        crumb={[{ label: "Track order" }]}
        action={{ label: "My orders →", href: "/account" }}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <ListingPanel className="p-3">
            <form action="/order/track" method="get" className="flex gap-2">
              <label htmlFor="order" className="sr-only">Order number</label>
              <input
                id="order"
                name="order"
                defaultValue={raw}
                placeholder="SZS-2026001"
                className="field h-9 min-h-0 flex-1 font-mono uppercase"
                required
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary btn-sm shrink-0">Track</button>
            </form>
          </ListingPanel>

          {attempted && !order ? (
            <div className="rounded-[var(--radius-card)] border border-[#f0e2c4] bg-[#fbf6ea] p-3 text-[12px] text-[#6d5211]" role="alert">
              <p className="font-semibold">No order found for “{raw}”.</p>
              <p className="mt-1 leading-relaxed">
                Check the number and try again. In this demo you can also{" "}
                <Link href="/account" className="font-semibold underline underline-offset-2">open your order history</Link>{" "}
                or sign in to the{" "}
                <Link href="/admin/login" className="font-semibold underline underline-offset-2">admin demo</Link>{" "}
                to see every seeded order.
              </p>
            </div>
          ) : null}

          {order ? (
            <>
              <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
                <div className="section-bar">
                  <h2 className="section-bar-title">Order {order.order_number}</h2>
                  <span className={`badge ${order.status === "delivered" ? "badge-new" : order.status === "cancelled" ? "badge-out" : "badge-low"}`}>
                    {order.status}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] pb-2.5">
                    <div>
                      <p className="text-[11px] text-[var(--color-ink-mute)]">Placed {formatDateTime(order.created_at)}</p>
                      <p className="text-[12px] text-[var(--color-ink-soft)]">
                        Delivering to {order.ship_area}, {order.ship_district} · {order.ship_phone}
                      </p>
                    </div>
                    <p className="text-[15px] font-bold text-[var(--color-brand-ink)]">{formatBdt(order.total)}</p>
                  </div>
                  <div className="pt-3">
                    <ActivityTimeline status={order.status} />
                  </div>
                  {order.tracking_code ? (
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 rounded-sm bg-[#fafafa] px-2.5 py-2 text-[11px]">
                      <Icon name="truck" size={12} />
                      {order.courier} · tracking <span className="font-mono font-semibold">{order.tracking_code}</span>
                      <span className="ml-auto text-[10px] text-[var(--color-ink-mute)]">Demo code — not a live courier record</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
                <div className="section-bar">
                  <h2 className="section-bar-title">Items in this order</h2>
                  <span className="text-[12px] text-[var(--color-ink-mute)]">{items.length} lines</span>
                </div>
                <ul className="divide-y divide-[var(--color-line)]">
                  {items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3 px-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px]">{i.name}</span>
                        <span className="block text-[11px] text-[var(--color-ink-mute)]">{i.variant_label} · ×{i.qty}</span>
                      </span>
                      <span className="shrink-0 text-[12.5px] font-semibold">{formatBdt(i.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[var(--color-line)] p-3">
                  <Link href={`/order/confirmation/${order.order_number}`} className="btn btn-outline btn-sm">
                    View full receipt
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[132px] lg:self-start">
          {!attempted ? (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
              <div className="section-bar">
                <h2 className="section-bar-title">Demo orders to try</h2>
              </div>
              <div className="space-y-1.5 p-3">
                <p className="text-[11px] leading-relaxed text-[var(--color-ink-mute)]">
                  Seeded orders covering different statuses:
                </p>
                {["SZS-2026001", "SZS-2026004", "SZS-2026010", "SZS-2026013"].map((o) => (
                  <Link
                    key={o}
                    href={`/order/track?order=${o}`}
                    className="block rounded-sm border border-[var(--color-line)] px-2 py-1.5 font-mono text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
                  >
                    {o}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">Need help?</p>
            <p className="text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
              Delivery takes 1–2 working days inside Dhaka and 2–4 outside. Cash on delivery only in this demo.
            </p>
            <Link href="/pages/contact" className="mt-2 inline-block text-[11.5px] font-semibold text-[var(--color-brand-deep)] hover:underline">
              Contact page →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
