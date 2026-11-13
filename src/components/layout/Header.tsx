import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cartCount, getOrCreateCart, listCategories, wishlistIds } from "@/lib/repo";
import { cartTokenReadOnly, wishlistKeyReadOnly } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { CategoryBar } from "./CategoryBar";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const categories = listCategories();
  const token = await cartTokenReadOnly();
  const cartId = token ? getOrCreateCart(token) : null;
  const count = cartId ? cartCount(cartId) : 0;
  const wkey = await wishlistKeyReadOnly();
  const saved = wkey ? wishlistIds(wkey).length : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_1px_3px_rgb(20_32_58_/_0.06)]">
      {/* ---------- utility bar: deep navy, white type ---------- */}
      <div className="bg-[#0d1730] text-[11px] text-white/80 dark:bg-[#070d1a]">
        <div className="container-page flex h-8 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="hidden items-center gap-1 sm:flex">
              <Icon name="location" size={12} className="text-white/60" />
              <span className="text-white/55">Deliver to</span>
              <span className="font-semibold text-white">Dhaka</span>
            </span>
            <Link href="/order/track" className="hidden hover:text-white hover:underline md:inline">
              Track order
            </Link>
            <Link href="/offers" className="hidden text-[#ffcf87] hover:underline md:inline">
              Flash sale
            </Link>
            <Link href="/pages/faq" className="hidden hover:text-white hover:underline lg:inline">
              Help
            </Link>
            <span className="hidden text-white/40 lg:inline">{BRAND.supportHours}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-sm bg-white/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90 sm:inline">
              Demo store
            </span>
            <Link href="/account" className="hover:text-white hover:underline">
              Account
            </Link>
            <Link href="/wishlist" className="hover:text-white hover:underline">
              Wishlist{saved ? ` (${saved})` : ""}
            </Link>
            <Link href="/admin" className="hidden text-white/50 hover:text-white hover:underline sm:inline">
              Seller Centre
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- brand + search + actions: white ---------- */}
      <div className="container-page flex h-[62px] items-center gap-3 md:h-[70px] md:gap-5">
        <div className="lg:hidden">
          <MobileNav categories={categories} />
        </div>

        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${BRAND.name} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-brand)] text-[15px] font-extrabold text-white md:h-10 md:w-10 md:text-[17px]">
            SZ
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[15px] font-extrabold tracking-tight text-[var(--color-ink)] md:text-[17px]">
              SUPER Z
            </span>
            <span className="mt-1 text-[11px] sm:text-[10.5px] sm:text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
              Shop
            </span>
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <SearchBox />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:block">
            <ThemeToggle compact />
          </div>
          <Link
            href="/wishlist"
            className="relative hidden h-9 w-9 items-center justify-center rounded-sm text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] sm:flex"
            aria-label={`Wishlist${saved ? `, ${saved} saved` : ""}`}
          >
            <Icon name="heart" size={19} />
            {saved > 0 ? (
              <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-sale)] px-1 text-[11px] sm:text-[10.5px] sm:text-[9.5px] font-bold text-white">
                {saved}
              </span>
            ) : null}
          </Link>
          <Link
            href="/account"
            className="hidden h-9 w-9 items-center justify-center rounded-sm text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] md:flex"
            aria-label="Account and orders"
          >
            <Icon name="user" size={19} />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-9 items-center gap-1.5 rounded-sm px-1.5 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] md:px-2"
            aria-label={`Cart${count ? `, ${count} items` : ""}`}
          >
            <Icon name="bag" size={21} />
            {count > 0 ? (
              <span className="absolute -right-0.5 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--color-sale)] px-1 text-[11px] sm:text-[10.5px] sm:text-[9.5px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* ---------- category bar ---------- */}
      <CategoryBar categories={categories} />
    </header>
  );
}
