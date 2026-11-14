import type { Metadata } from "next";
import { all } from "@/lib/db";
import type { Coupon } from "@/lib/repo";
import { formatBdt } from "@/lib/brand";
import { CouponForm } from "@/components/admin/CouponForm";
import { toggleCouponAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Coupons" };
export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = all<Coupon>(`SELECT * FROM coupons ORDER BY id`);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Coupons</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
          Validated server-side at checkout. Usage counts increment when an order is placed.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card overflow-x-auto">
          <table className="table-base min-w-[640px]">
            <thead><tr><th>Code</th><th>Type</th><th className="text-right">Value</th><th className="text-right">Min spend</th><th className="text-right">Used</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-semibold">{c.code}<span className="block font-sans text-[0.625rem] font-normal text-[var(--color-ink-mute)]">{c.description}</span></td>
                  <td className="text-xs capitalize">{c.type}</td>
                  <td className="text-right text-xs tabular-nums">
                    {c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? formatBdt(c.value) : "Free ship"}
                    {c.max_discount ? <span className="block text-[0.625rem] text-[var(--color-ink-mute)]">max {formatBdt(c.max_discount)}</span> : null}
                  </td>
                  <td className="text-right text-xs tabular-nums">{formatBdt(c.min_subtotal)}</td>
                  <td className="text-right text-xs tabular-nums">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                  <td><span className={`badge ${c.is_active ? "badge-new" : "badge-out"}`}>{c.is_active ? "Active" : "Disabled"}</span></td>
                  <td>
                    <form action={toggleCouponAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="rounded border border-[var(--color-line-strong)] px-2 py-1 text-[0.625rem] hover:border-[var(--color-ink)]">
                        {c.is_active ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4">
            <h2 className="font-display text-lg">New / update coupon</h2>
            <p className="mb-3 text-[0.6875rem] text-[var(--color-ink-mute)]">Existing codes are updated in place.</p>
            <CouponForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
