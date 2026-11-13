"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

/**
 * App-style bottom navigation for phones.
 *
 * This is the pattern shoppers already have in their thumb reach from every
 * other app on the device, so it replaces the usual hamburger-only header on
 * small screens. It is fixed to the bottom, respects the iOS home-indicator
 * safe area, and marks the current section with aria-current.
 *
 * Cart is shown with a live count so the badge is the same number the header
 * shows — both come from the same server-rendered value.
 */
export function MobileTabBar({ cartCount = 0, wishlistCount = 0 }: { cartCount?: number; wishlistCount?: number }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Home", icon: "home-nav", exact: true },
    { href: "/shop", label: "Shop", icon: "grid-nav" },
    { href: "/wishlist", label: "Saved", icon: "heart-nav", badge: wishlistCount },
    { href: "/cart", label: "Cart", icon: "bag-nav", badge: cartCount },
    { href: "/account", label: "Account", icon: "user-nav" },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  active ? "text-[var(--color-brand)]" : "text-[var(--color-ink-mute)]"
                }`}
              >
                <span className="relative">
                  <Icon name={t.icon as never} size={21} strokeWidth={active ? 2 : 1.6} />
                  {t.badge ? (
                    <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--color-sale)] px-1 text-[9px] font-bold leading-none text-white">
                      {t.badge > 9 ? "9+" : t.badge}
                    </span>
                  ) : null}
                </span>
                <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>{t.label}</span>
                {active ? (
                  <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[var(--color-brand)]" aria-hidden="true" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
