import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const sp = await searchParams;
  const error = Array.isArray(sp.error) ? sp.error[0] : sp.error;

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-7">
          <p className="eyebrow mb-1">Admin</p>
          <h1 className="font-display text-2xl">Sign in to the dashboard</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Administration for products, orders, inventory and reports.
          </p>

          <div className="mt-4 rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-xs text-[var(--color-warn-ink)]">
            <p className="flex items-center gap-1.5 font-semibold">
              <Icon name="shield" size={13} /> Restricted access
            </p>
            <p className="mt-1">
              Credentials are seeded into the local database and the session is a signed cookie. There is no
              rate limiting, MFA or account recovery — do not reuse this for a public store.
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-[var(--color-paper-2)] p-3 text-xs">
            <p className="font-semibold">Seeded credentials</p>
            <p className="mt-1 font-mono">admin@superzshop.bd</p>
            <p className="font-mono">SuperZ@2026</p>
            <p className="mt-1 text-[0.625rem] text-[var(--color-ink-mute)]">
              Created by <code>npm run db:reset</code>. Override with ADMIN_EMAIL / ADMIN_PASSWORD.
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger-ink)]" role="alert">
              {error === "missing"
                ? "Enter both your email and password."
                : "Those credentials do not match an admin account."}
            </p>
          ) : null}

          <div className="mt-5">
            <LoginForm />
          </div>
        </div>
        <p className="mt-4 text-center text-[0.6875rem] text-[var(--color-ink-mute)]">
          Customer-facing store? <a href="/" className="link-underline">Return to the shop</a>
        </p>
      </div>
    </div>
  );
}
