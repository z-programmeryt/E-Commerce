import type { Metadata } from "next";
import { all } from "@/lib/db";
import { dbPath } from "@/lib/db";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { formatDateTime } from "@/lib/brand";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rows = all<{ key: string; value: string }>(`SELECT key, value FROM store_settings ORDER BY key`);
  const migrations = all<{ name: string; applied_at: string }>(`SELECT name, applied_at FROM _migrations ORDER BY name`);
  const counts = all<{ table_name: string; n: number }>(
    `SELECT 'products' AS table_name, COUNT(*) AS n FROM products
     UNION ALL SELECT 'variants', COUNT(*) FROM product_variants
     UNION ALL SELECT 'orders', COUNT(*) FROM orders
     UNION ALL SELECT 'customers', COUNT(*) FROM customers
     UNION ALL SELECT 'coupons', COUNT(*) FROM coupons
     UNION ALL SELECT 'banners', COUNT(*) FROM banners
     UNION ALL SELECT 'newsletter', COUNT(*) FROM newsletter_subscribers
     UNION ALL SELECT 'messages', COUNT(*) FROM contact_messages`,
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Store settings</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">Values persist in the local database.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg">Configuration</h2>
          <SettingsForm settings={Object.fromEntries(rows.map((r) => [r.key, r.value]))} />
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h2 className="font-display text-base">Database</h2>
            <dl className="mt-2 space-y-1.5 text-[0.6875rem]">
              <div><dt className="text-[var(--color-ink-mute)]">File</dt><dd className="break-all font-mono">{dbPath()}</dd></div>
              <div><dt className="text-[var(--color-ink-mute)]">Migrations</dt><dd>{migrations.map((m) => m.name).join(", ")}</dd></div>
              <div><dt className="text-[var(--color-ink-mute)]">Last applied</dt><dd>{migrations.length ? formatDateTime(migrations[migrations.length - 1].applied_at) : "—"}</dd></div>
            </dl>
            <p className="mt-2 text-[0.625rem] text-[var(--color-ink-mute)]">
              Reset with <code className="font-mono">npm run db:reset</code>.
            </p>
          </div>
          <div className="card p-4">
            <h2 className="font-display text-base">Record counts</h2>
            <ul className="mt-2 space-y-1 text-[0.6875rem]">
              {counts.map((c) => (
                <li key={c.table_name} className="flex justify-between border-b border-[var(--color-line)] pb-1">
                  <span className="capitalize text-[var(--color-ink-mute)]">{c.table_name}</span>
                  <span className="font-semibold tabular-nums">{c.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
