import type { Metadata } from "next";
import Link from "next/link";
import { all } from "@/lib/db";
import { customerOrders } from "@/lib/repo";
import type { Order } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/brand";
import { EmptyState } from "@/components/EmptyState";
import { OrderLookupForm } from "@/components/order/OrderLookupForm";
import { ListingHeader, ListingPanel } from "@/components/catalog/ListingHeader";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const email = (Array.isArray(sp.email) ? sp.email[0] : sp.email)?.trim().toLowerCase() ?? "";

  const customer = email
    ? all<{ id: number; name: string; email: string }>(
        `SELECT id, name, email FROM customers WHERE LOWER(email) = ?`,
        [email],
      )[0]
    : undefined;
  const orders: Order[] = customer ? customerOrders(customer.id) : [];

  return (
    <div className="container-page pb-6">
      <ListingHeader
        title="My orders"
        count={customer ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : undefined}
        subtitle="Enter the email address you used at checkout to see the orders tied to it."
        crumb={[{ label: "My orders" }]}
        action={{ label: "Continue shopping →", href: "/shop" }}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <ListingPanel className="p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
              Find your orders
            </p>
            <OrderLookupForm defaultValue={email} />
          </ListingPanel>

          {email && !customer ? (
            <ListingPanel className="p-6">
              <EmptyState
                title={`No account found for ${email}`}
                subtitle="Check the spelling, or place an order first and it will appear here."
                action={{ label: "Shop now", href: "/shop" }}
              />
            </ListingPanel>
          ) : null}

          {customer ? (
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="section-bar">
                <h2 className="section-bar-title">Order history</h2>
                <span className="text-[12px] text-[var(--color-ink-mute)]">
                  {customer.name} · {customer.email}
                </span>
              </div>
              {orders.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No orders yet"
                    subtitle="Orders placed with this email will appear here."
                    action={{ label: "Start shopping", href: "/shop" }}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-[var(--color-line)]">
                  {orders.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 hover:bg-[var(--color-surface-2)]">
                      <div className="min-w-0">
                        <Link
                          href={`/order/track?order=${o.order_number}`}
                          className="font-mono text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline"
                        >
                          {o.order_number}
                        </Link>
                        <p className="text-[11px] text-[var(--color-ink-mute)]">
                          {formatDate(o.created_at)} · {o.ship_area}, {o.ship_district}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${o.status === "delivered" ? "badge-new" : o.status === "cancelled" ? "badge-out" : "badge-low"}`}>
                          {o.status}
                        </span>
                        <span className="text-[12.5px] font-semibold text-[var(--color-brand-ink)]">{formatBdt(o.total)}</span>
                        <Link
                          href={`/order/track?order=${o.order_number}`}
                          className="rounded-sm border border-[var(--color-line)] px-2 py-0.5 text-[11.5px] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
                        >
                          Track
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[132px] lg:self-start">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="section-bar">
              <h2 className="section-bar-title">Sign in</h2>
            </div>
            <div className="space-y-1.5 p-3">
              <p className="text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
                Seeded sample customers with sample order history:
              </p>
              {["ayesha.rahman@example.com", "tanvir.hossain@example.com", "nusrat.jahan@example.com"].map((e) => (
                <Link
                  key={e}
                  href={`/account?email=${encodeURIComponent(e)}`}
                  className="block truncate rounded-sm border border-[var(--color-line)] px-2 py-1.5 font-mono text-[11px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
                >
                  {e}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
              Need help?
            </p>
            <p className="text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
              Use your order number to check the tracking timeline at any time.
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
