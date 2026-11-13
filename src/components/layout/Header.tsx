import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cartCount, getOrCreateCart, listCategories, wishlistIds } from "@/lib/repo";
import { all } from "@/lib/db";
import { cartTokenReadOnly, wishlistKeyReadOnly } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderNav } from "./HeaderNav";
import { MobileTabBar } from "./MobileTabBar";

/**
 * Store header.
 *
 * Desktop: a sticky, elevated white bar — slim utility strip, boxed brand +
 * search + actions row, then a navigation row with real dropdown menus.
 * The whole thing sits on a floating card rather than a full-bleed band, so
 * it reads as a modern product rather than a 2012 marketplace.
 *
 * Mobile: brand + search + cart, with all navigation moved to the app-style
 * bottom tab bar (MobileTabBar) and a full drawer for categories (MobileNav).
 */
export async function Header() {
  const categories = listCategories();
  const token = await cartTokenReadOnly();
  const cartId = token ? getOrCreateCart(token) : null;
  const count = cartId ? cartCount(cartId) : 0;
  const wkey = await wishlistKeyReadOnly();
  const saved = wkey ? wishlistIds(wkey).length : 0;

  // Subcategory names per category, for the dropdown panels.
  const subs = all<{ category_id: number; subcategory: string }>(
    `SELECT DISTINCT p.category_id, p.subcategory FROM products p
     WHERE p.subcategory IS NOT NULL AND p.subcategory <> ''
     ORDER BY p.subcategory`,
  );
  const catById = new Map(categories.map((c) => [c.id, c.slug]));
  const subcategories: Record<string, string[]> = {};
  for (const row of subs) {
    const slug = catById.get(row.category_id);
    if (!slug) continue;
    (subcategories[slug] ??= []).push(row.subcategory);
  }

  const counts = all<{ category_id: number; c: number }>(
    `SELECT category_id, COUNT(*) c FROM products WHERE is_active = 1 GROUP BY category_id`,
  );
  const countBySlug = new Map<string, number>();
  for (const r of counts) {
    const slug = catById.get(r.category_id);
    if (slug) countBySlug.set(slug, r.c);
  }

  const navCategories = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    blurb: c.blurb,
    count: countBySlug.get(c.slug) ?? 0,
  }));

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--color-paper)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-paper)]/70">
        {/* ---------- utility strip ---------- */}
        <div className="hidden bg-[#0a1428] text-[11px] text-white/75 md:block dark:bg-[#060b16]">
          <div className="container-page flex h-8 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex items-center gap-1">
                <Icon name="location" size={11} className="text-white/50" />
                <span className="text-white/50">Deliver to</span>
                <span className="font-semibold text-white">Dhaka, Bangladesh</span>
              </span>
              <span className="hidden text-white/40 lg:inline">{BRAND.supportHours}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/order/track" className="hover:text-white hover:underline">Track order</Link>
              <Link href="/pages/faq" className="hover:text-white hover:underline">Help</Link>
              <Link href="/account" className="hover:text-white hover:underline">Account</Link>
              <Link href="/admin" className="text-white/45 hover:text-white hover:underline">Seller Centre</Link>
            </div>
          </div>
        </div>

        {/* ---------- boxed main bar ---------- */}
        <div className="container-page pt-2 md:pt-0">
          <div className="rounded-b-[var(--radius-card)] border border-t-0 border-[var(--color-line)] bg-[var(--color-surface)] px-3 shadow-[0_4px_18px_-10px_rgb(20_32_58_/0.35)] md:rounded-[var(--radius-card)] md:border-t md:px-4">
            {/* row 1: brand, search, actions */}
            <div className="flex h-[58px] items-center gap-2 md:h-[64px] md:gap-4">
              <div className="lg:hidden">
                <MobileNav categories={categories} />
              </div>

              <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${BRAND.name} home`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-brand)] text-[13px] font-extrabold text-white md:h-9 md:w-9 md:text-[15px]">
                  SZ
                </span>
                <span className="hidden flex-col leading-none sm:flex">
                  <span className="text-[14px] font-extrabold tracking-tight text-[var(--color-ink)] md:text-[16px]">
                    SUPER Z
                  </span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-mute)]">
                    Shop
                  </span>
                </span>
              </Link>

              <div className="min-w-0 flex-1">
                <SearchBox />
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <div className="hidden md:block">
                  <ThemeToggle compact />
                </div>
                <Link
                  href="/wishlist"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-sm text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] md:flex"
                  aria-label={`Wishlist${saved ? `, ${saved} saved` : ""}`}
                >
                  <Icon name="heart" size={19} />
                  {saved > 0 ? (
                    <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-sale)] px-1 text-[9px] font-bold text-white">
                      {saved}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href="/cart"
                  className="relative flex h-9 items-center gap-2 rounded-sm px-1.5 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] md:px-2"
                  aria-label={`Cart${count ? `, ${count} items` : ""}`}
                >
                  <Icon name="bag" size={20} />
                  {count > 0 ? (
                    <span className="absolute -right-0.5 top-0 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--color-sale)] px-1 text-[9px] font-bold text-white md:static md:ml-0.5 md:h-auto md:min-w-0 md:bg-transparent md:p-0 md:text-[11px] md:font-semibold md:text-[var(--color-ink-soft)]">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>

            {/* row 2: navigation with dropdowns (desktop) */}
            <div className="relative hidden border-t border-[var(--color-line)] lg:block">
              <HeaderNav categories={navCategories} subcategories={subcategories} />
            </div>
          </div>
        </div>
      </header>

      {/* mobile bottom tab bar — the app-style nav */}
      <MobileTabBar cartCount={count} wishlistCount={saved} />
    </>
  );
}
