"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const LINKS = [
  { href: "/admin", label: "Overview", icon: "chart" },
  { href: "/admin/orders", label: "Orders", icon: "box" },
  { href: "/admin/products", label: "Products", icon: "tag" },
  { href: "/admin/inventory", label: "Inventory", icon: "grid" },
  { href: "/admin/categories", label: "Categories", icon: "filter" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  { href: "/admin/coupons", label: "Coupons", icon: "gift" },
  { href: "/admin/banners", label: "Banners", icon: "sun" },
  { href: "/admin/reports", label: "Reports", icon: "chart" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="lg:sticky lg:top-6 lg:self-start">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-ink-soft)] hover:bg-white"
                }`}
              >
                <Icon name={l.icon} size={14} />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 hidden rounded-md border border-[#f0e2c4] bg-[#fbf6ea] p-3 text-[0.625rem] leading-relaxed text-[#6d5211] lg:block">
        <p className="font-bold uppercase tracking-wide">Demo dashboard</p>
        <p className="mt-1">
          Authentication is demonstration-grade. All changes write to the local SQLite file.
        </p>
      </div>
    </nav>
  );
}
