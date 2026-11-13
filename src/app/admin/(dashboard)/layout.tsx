import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/app/admin/actions";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · SUPER Z SHOP Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="min-h-screen bg-[var(--color-paper-2)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-ink)] text-white">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-display text-sm tracking-[0.14em]">SUPER Z SHOP</Link>
            <span className="rounded bg-white/12 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.14em]">Admin</span>
            <span className="hidden rounded bg-[#8a6516]/30 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.1em] text-[#f0d9a8] sm:inline">
              Demo auth
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden text-white/70 sm:inline">{session.email}</span>
            <Link href="/" className="hidden items-center gap-1 text-white/80 hover:text-white sm:flex">
              <Icon name="arrow-right" size={12} /> View store
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-1 rounded-full border border-white/25 px-3 py-1.5 text-[0.6875rem] hover:bg-white/10">
                <Icon name="logout" size={12} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[196px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
