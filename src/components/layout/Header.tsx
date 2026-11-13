import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cartCount, getOrCreateCart, listCategories, wishlistIds } from "@/lib/repo";
import { cartTokenReadOnly, wishlistKeyReadOnly } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";

export async function Header() {
  const categories = listCategories();
  const token = await cartTokenReadOnly();
  const cartId = token ? getOrCreateCart(token) : null;
  const count = cartId ? cartCount(cartId) : 0;
  const wkey = await wishlistKeyReadOnly();
  const saved = wkey ? wishlistIds(wkey).length : 0;

  const primary = categories.slice(0, 7);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[0.6875rem] tracking-wide">
          <p className="truncate">
            Free delivery over ৳2,500 · Cash on delivery nationwide
            <span className="ml-2 hidden rounded bg-white/10 px-1.5 py-0.5 text-[0.625rem] uppercase tracking-[0.1em] sm:inline">
              Local demo
            </span>
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/order/track" className="hover:underline">Track order</Link>
            <Link href="/pages/faq" className="hover:underline">Help</Link>
            <span className="text-white/60">{BRAND.supportHours}</span>
          </div>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-4">
        <MobileNav categories={categories} />

        <Link href="/" className="shrink-0" aria-label={`${BRAND.name} home`}>
          <span className="font-display text-[1.15rem] tracking-[0.14em] md:text-[1.3rem]">
            SUPER Z <span className="text-[var(--color-olive-deep)]">SHOP</span>
          </span>
          <span className="mt-0.5 hidden text-[0.5625rem] uppercase tracking-[0.24em] text-[var(--color-ink-mute)] sm:block">
            {BRAND.tagline}
          </span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-5 lg:flex">
          <Link href="/shop" className="text-[0.8125rem] font-semibold hover:text-[var(--color-olive-deep)]">Shop all</Link>
          {primary.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="text-[0.8125rem] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/offers" className="text-[0.8125rem] font-semibold text-[var(--color-sale)] hover:underline">
            Offers
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <Link
            href="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-paper-2)]"
            aria-label={`Wishlist${saved ? `, ${saved} saved` : ""}`}
          >
            <Icon name="heart" size={19} />
            {saved > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-clay)] px-1 text-[0.5625rem] font-bold text-white">
                {saved}
              </span>
            ) : null}
          </Link>
          <Link
            href="/account"
            className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-paper-2)] sm:flex"
            aria-label="Account and orders"
          >
            <Icon name="user" size={19} />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 items-center gap-2 rounded-full px-2 hover:bg-[var(--color-paper-2)] md:px-3"
            aria-label={`Cart${count ? `, ${count} items` : ""}`}
          >
            <Icon name="bag" size={19} />
            <span className="hidden text-xs font-semibold md:inline">Cart</span>
            {count > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-ink)] px-1 text-[0.5625rem] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="container-page pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
