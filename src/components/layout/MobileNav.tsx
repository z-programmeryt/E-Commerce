"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "./ThemeToggle";

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
    { href: "/shop", label: "Shop all products" },
    { href: "/new-arrivals", label: "New arrivals" },
    { href: "/best-sellers", label: "Best sellers" },
    { href: "/offers", label: "Offers & discounts" },
    { href: "/collections/couple-collections", label: "Couple collections" },
    { href: "/collections/gifting", label: "Gifting" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/order/track", label: "Track order" },
    { href: "/account", label: "My orders" },
    { href: "/admin", label: "Seller Centre" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)] lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <Icon name="menu" size={20} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu" id="mobile-menu">
          <button className="absolute inset-0 bg-[#050b18]/55 backdrop-blur-[1px]" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-[var(--color-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-brand)] text-[13px] font-extrabold text-white">
                  SZ
                </span>
                <span className="text-[14px] font-extrabold text-[var(--color-ink)]">SUPER Z SHOP</span>
              </span>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)]" aria-label="Close menu">
                <Icon name="close" size={17} />
              </button>
            </div>
            <nav className="flex-1 py-1" aria-label="Mobile">
              <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
                Categories
              </p>
              <ul className="border-b border-[var(--color-line)] pb-1">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} onClick={() => setOpen(false)} className="flex items-center justify-between px-4 py-2 text-[13px] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-ink)]">
                      <span>{c.name}</span>
                      <Icon name="chevron-right" size={14} className="text-[var(--color-ink-mute)]" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
                Shop
              </p>
              <ul className="pb-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-ink)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-3">
              <p className="mb-2 text-[11px] sm:text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
                Appearance
              </p>
              <ThemeToggle />
              <p className="mt-2.5 text-[11px] sm:text-[10.5px] leading-relaxed text-[var(--color-ink-mute)]">
                Cash on delivery · 7-day replacement on selected items
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
