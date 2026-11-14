import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { all, one } from "@/lib/db";
import type { Order, OrderItem } from "@/lib/types";
import { formatBdt, formatDateTime } from "@/lib/brand";
import { updateOrderShippingAction, updateOrderStatusAction } from "@/app/admin/actions";
import { ActivityTimeline } from "@/components/order/ActivityTimeline";

export const metadata: Metadata = { title: "Order detail" };
export const dynamic = "force-dynamic";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = one<Order>(`SELECT * FROM orders WHERE id = ?`, [Number(id)]);
  if (!order) notFound();
  const items = all<OrderItem>(`SELECT * FROM order_items WHERE order_id = ? ORDER BY id`, [order.id]);
  const customer = one<{ id: number; name: string; email: string; created_at: string }>(
    `SELECT id, name, email, created_at FROM customers WHERE id = ?`, [order.customer_id],
  );
  const cost = items.reduce((s, i) => s + i.unit_cost * i.qty, 0);
  const contribution = items.reduce((s, i) => s + i.line_total, 0) - cost;

  return (
    <div className="space-y-4">
      <nav className="text-xs text-[var(--color-ink-mute)]">
        <Link href="/admin/orders" className="hover:underline">Orders</Link>
        <span className="mx-1.5">/</span>
        <span className="font-mono text-[var(--color-ink)]">{order.order_number}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">{order.order_number}</h1>
          <p className="text-xs text-[var(--color-ink-mute)]">Placed {formatDateTime(order.created_at)} · updated {formatDateTime(order.updated_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${order.status === "delivered" ? "badge-new" : order.status === "cancelled" ? "badge-out" : "badge-low"}`}>{order.status}</span>
          <Link href={`/order/track?order=${order.order_number}`} className="btn btn-outline btn-sm">Customer view</Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-4">
          <h2 className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">Customer</h2>
          <p className="text-sm font-semibold">{order.ship_name}</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{order.ship_phone}</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{order.ship_email}</p>
          {customer ? (
            <Link href={`/admin/customers?q=${encodeURIComponent(customer.email)}`} className="mt-2 inline-block text-[0.6875rem] underline">
              Customer since {customer.created_at.slice(0, 10)}
            </Link>
          ) : null}
        </section>

        <section className="card p-4">
          <h2 className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">Delivery</h2>
          <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
            {order.ship_address}<br />{order.ship_area}, {order.ship_district}
          </p>
          {order.notes ? <p className="mt-2 text-[0.6875rem] text-[var(--color-ink-mute)]">Note: {order.notes}</p> : null}
        </section>

        <section className="card p-4">
          <h2 className="mb-2 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">Unit economics</h2>
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Order value</dt><dd className="font-semibold">{formatBdt(order.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Product cost</dt><dd>{formatBdt(cost)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Contribution</dt><dd className="font-semibold">{formatBdt(contribution)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Delivery charged</dt><dd>{formatBdt(order.delivery_fee)}</dd></div>
          </dl>
          <p className="mt-2 text-[0.625rem] text-[var(--color-ink-mute)]">
            Contribution excludes delivery cost paid to the courier, packaging and ad spend.
          </p>
        </section>
      </div>

      <section className="card overflow-hidden">
        <h2 className="border-b border-[var(--color-line)] px-5 py-3 font-display text-lg">Items</h2>
        <table className="table-base">
          <thead><tr><th>Product</th><th>Variant</th><th className="text-right">Unit</th><th className="text-right">Qty</th><th className="text-right">Line</th><th className="text-right">Cost</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td className="text-xs">{i.name}<span className="block font-mono text-[0.625rem] text-[var(--color-ink-mute)]">{i.sku}</span></td>
                <td className="text-xs">{i.variant_label}</td>
                <td className="text-right text-xs tabular-nums">{formatBdt(i.unit_price)}</td>
                <td className="text-right text-xs tabular-nums">{i.qty}</td>
                <td className="text-right text-xs font-semibold tabular-nums">{formatBdt(i.line_total)}</td>
                <td className="text-right text-xs tabular-nums text-[var(--color-ink-mute)]">{formatBdt(i.unit_cost * i.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="space-y-1 border-t border-[var(--color-line)] px-5 py-3 text-xs">
          <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Subtotal</dt><dd>{formatBdt(order.subtotal)}</dd></div>
          {order.discount > 0 ? <div className="flex justify-between text-[var(--color-success)]"><dt>Discount ({order.coupon_code})</dt><dd>−{formatBdt(order.discount)}</dd></div> : null}
          <div className="flex justify-between"><dt className="text-[var(--color-ink-mute)]">Delivery</dt><dd>{formatBdt(order.delivery_fee)}</dd></div>
          <div className="flex justify-between border-t border-[var(--color-line)] pt-1 text-sm font-semibold"><dt>Total</dt><dd>{formatBdt(order.total)}</dd></div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-display text-lg">Update status</h2>
          <form action={updateOrderStatusAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={order.status} className="field h-10 min-h-0 w-40">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm">Save status</button>
          </form>
          <div className="mt-4 border-t border-[var(--color-line)] pt-3">
            <ActivityTimeline status={order.status} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-display text-lg">Courier & tracking</h2>
          <form action={updateOrderShippingAction} className="space-y-3">
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label htmlFor="courier" className="label">Courier</label>
              <select id="courier" name="courier" defaultValue={order.courier} className="field h-10 min-h-0">
                {["Not assigned", "Pathao Courier", "Steadfast", "RedX"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tracking_code" className="label">Tracking code</label>
              <input id="tracking_code" name="tracking_code" defaultValue={order.tracking_code} className="field h-10 min-h-0 font-mono text-xs" placeholder="TRK…" />
            </div>
            <button className="btn btn-outline btn-sm">Save shipping</button>
          </form>
          <p className="mt-3 text-[0.625rem] text-[var(--color-ink-mute)]">
            This records a reference only. No courier API is connected, so no real booking is created.
          </p>
        </section>
      </div>
    </div>
  );
}
