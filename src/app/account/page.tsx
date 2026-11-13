import type { Metadata } from "next";
import Link from "next/link";
import { all } from "@/lib/db";
import { customerOrders } from "@/lib/repo";
import type { Order } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/brand";
import { EmptyState } from "@/components/EmptyState";
import { OrderLookupForm } from "@/components/order/OrderLookupForm";

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
    <div className="container-page max-w-3xl py-10">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-2xl md:text-3xl">Order history</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
        This local demo has no passwords or accounts. Enter the email you used at checkout to see orders tied to it —
        clearly a demo-only shortcut, and not how a production store should authenticate users.
      </p>

      <div className="mt-5">
        <OrderLookupForm defaultValue={email} />
      </div>

      {email && !customer ? (
        <div className="mt-6">
          <EmptyState
            title={`No account found for ${email}`}
            subtitle="Try one of the seeded demo emails below, or place a demo order first."
            action={{ label: "Shop now", href: "/shop" }}
          />
        </div>
      ) : null}

      {customer ? (
        <>
          <div className="mt-7 flex items-baseline justify-between border-b border-[var(--color-line)] pb-3">
            <p className="text-sm">
              <span className="font-semibold">{customer.name}</span>{" "}
              <span className="text-[var(--color-ink-mute)]">· {customer.email}</span>
            </p>
            <p className="text-xs text-[var(--color-ink-mute)]">{orders.length} order{orders.length === 1 ? "" : "s"}</p>
          </div>
          {orders.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No orders yet" subtitle="Orders placed with this email will appear here." action={{ label: "Start shopping", href: "/shop" }} />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--color-line)]">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <Link href={`/order/track?order=${o.order_number}`} className="font-mono text-sm font-semibold hover:underline">
                      {o.order_number}
                    </Link>
                    <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">
                      {formatDate(o.created_at)} · {o.ship_area}, {o.ship_district}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${o.status === "delivered" ? "badge-new" : o.status === "cancelled" ? "badge-out" : "badge-low"}`}>
                      {o.status}
                    </span>
                    <span className="text-sm font-semibold">{formatBdt(o.total)}</span>
                    <Link href={`/order/track?order=${o.order_number}`} className="link-underline text-xs">Track</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {!email ? (
        <div className="mt-6 rounded-lg border border-[var(--color-line)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">Seeded demo emails</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["ayesha.rahman@example.com", "tanvir.hossain@example.com", "nusrat.jahan@example.com"].map((e) => (
              <Link key={e} href={`/account?email=${encodeURIComponent(e)}`} className="badge hover:border-[var(--color-ink)]">
                {e}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
