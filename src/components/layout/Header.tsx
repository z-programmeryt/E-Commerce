import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cartCount, getOrCreateCart, listCategories, wishlistIds } from "@/lib/repo";
import { cartTokenReadOnly, wishlistKeyReadOnly } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { CategoryBar } from "./CategoryBar";

export async function Header() {
  const categories = listCategories();
  const token = await cartTokenReadOnly();
  const cartId = token ? getOrCreateCart(token) : null;
  const count = cartId ? cartCount(cartId) : 0;
  const wkey = await wishlistKeyReadOnly();
  const saved = wkey ? wishlistIds(wkey).length : 0;

  return (
    <header className="sticky top-0 z-40 shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      {/* ---------- utility bar ---------- */}
      <div className="bg-[#2b2b2b] text-[11px] text-white/85">
        <div className="container-page flex h-8 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden truncate sm:inline">
              <span className="text-white/55">Deliver to</span>{" "}
              <span className="font-semibold text-white">Dhaka, Bangladesh</span>
            </span>
            <span className="truncate sm:hidden">
              <span className="font-semibold text-white">Dhaka</span>
            </span>
            <Link href="/order/track" className="hidden hover:text-white hover:underline md:inline">
              Track order
            </Link>
            <Link href="/pages/faq" className="hidden hover:text-white hover:underline md:inline">
              Help
            </Link>
            <span className="hidden text-white/45 lg:inline">{BRAND.supportHours}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-sm bg-[var(--color-brand)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">
              Demo store
            </span>
            <Link href="/account" className="hover:text-white hover:underline">
              Account
            </Link>
            <Link href="/wishlist" className="hover:text-white hover:underline">
              Wishlist{saved ? ` (${saved})` : ""}
            </Link>
            <Link href="/admin" className="hidden text-white/60 hover:text-white hover:underline sm:inline">
              Seller Centre
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- brand + search + cart ---------- */}
      <div className="bg-[var(--color-brand)]">
        <div className="container-page flex h-[70px] items-center gap-3 md:gap-6">
          <div className="lg:hidden">
            <MobileNav categories={categories} />
          </div>

          <Link href="/" className="shrink-0" aria-label={`${BRAND.name} home`}>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-extrabold leading-none tracking-tight text-white md:text-[26px]">
                SUPER<span className="text-white/80">Z</span>
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:inline">
                Shop
              </span>
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            <SearchBox />
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/wishlist"
              className="relative hidden h-9 w-9 items-center justify-center rounded text-white hover:bg-white/15 sm:flex"
              aria-label={`Wishlist${saved ? `, ${saved} saved` : ""}`}
            >
              <Icon name="heart" size={20} />
              {saved > 0 ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--color-brand-deep)]">
                  {saved}
                </span>
              ) : null}
            </Link>
            <Link
              href="/account"
              className="hidden h-9 w-9 items-center justify-center rounded text-white hover:bg-white/15 md:flex"
              aria-label="Account and orders"
            >
              <Icon name="user" size={20} />
            </Link>
            <Link
              href="/cart"
              className="relative flex h-9 items-center gap-1.5 rounded px-1 text-white hover:bg-white/15 md:px-2"
              aria-label={`Cart${count ? `, ${count} items` : ""}`}
            >
              <Icon name="bag" size={22} />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--color-brand-deep)]">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- category bar ---------- */}
      <CategoryBar categories={categories} />
    </header>
  );
}
