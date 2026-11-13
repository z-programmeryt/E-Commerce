"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = [
    { href: "/shop", label: "Shop all" },
    { href: "/new-arrivals", label: "New arrivals" },
    { href: "/best-sellers", label: "Best sellers" },
    { href: "/offers", label: "Offers & discounts" },
    { href: "/collections/couple-collections", label: "Couple collections" },
    { href: "/collections/gifting", label: "Gifting" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/order/track", label: "Track order" },
    { href: "/account", label: "My orders" },
    { href: "/admin/login", label: "Admin demo" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-paper-2)] lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <Icon name="menu" size={20} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu" id="mobile-menu">
          <button className="absolute inset-0 bg-[var(--color-ink)]/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-[var(--color-paper)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <span className="font-display text-base tracking-[0.12em]">SUPER Z SHOP</span>
              <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-paper-2)]" aria-label="Close menu">
                <Icon name="close" size={18} />
              </button>
            </div>
            <nav className="flex-1 px-5 py-4" aria-label="Mobile">
              <p className="eyebrow mb-2">Categories</p>
              <ul className="mb-5 space-y-0.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-md py-2 text-sm hover:text-[var(--color-olive-deep)]">
                      <span>{c.name}</span>
                      <Icon name="chevron-right" size={14} className="text-[var(--color-ink-mute)]" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mb-2">Shop</p>
              <ul className="space-y-0.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-md py-2 text-sm hover:text-[var(--color-olive-deep)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-[var(--color-line)] px-5 py-4 text-xs text-[var(--color-ink-mute)]">
              Local demo · Cash on delivery · 7-day replacement on selected items
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
