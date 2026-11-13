import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "You are offline",
  robots: { index: false, follow: false },
};

/**
 * Served by the service worker when the browser loses its connection and the
 * page is not in the cache. Deliberately static and dependency-free — it has
 * to render from the cache with no network and no server.
 */
export default function OfflinePage() {
  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex flex-col items-center px-5 py-9 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <Icon name="wifi-off" size={22} />
          </span>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
            No connection
          </p>
          <h1 className="mt-1 text-[19px] font-bold text-[var(--color-ink)]">You are offline</h1>
          <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
            This page was not saved for offline reading. Pages you have already visited, and the pages linked
            below, will open from the cache while you are offline.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn btn-primary btn-sm">Home</Link>
            <Link href="/shop" className="btn btn-outline btn-sm">Shop all</Link>
            <Link href="/offers" className="btn btn-neutral btn-sm">Offers</Link>
            <Link href="/cart" className="btn btn-neutral btn-sm">Cart</Link>
          </div>

          <p className="mt-5 w-full rounded-sm bg-[var(--color-surface-2)] px-3 py-2 text-left text-[11px] leading-relaxed text-[var(--color-ink-mute)]">
            <strong className="font-semibold text-[var(--color-ink-soft)]">What still works offline:</strong>{" "}
            browsing cached pages, your saved cart and wishlist (stored in this browser). Placing an order needs
            a connection, because stock is checked and the order is written on the server.
          </p>
        </div>
      </div>
    </div>
  );
}
