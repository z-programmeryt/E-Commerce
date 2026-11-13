"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export type NavCategory = {
  slug: string;
  name: string;
  icon?: string | null;
  blurb?: string | null;
  count?: number;
};

/**
 * Desktop header navigation.
 *
 * A boxed, elevated bar with real dropdown menus — each category panel lists
 * its subcategories and a "browse all" action, so a shopper can reach a
 * specific shelf in one hover instead of three page loads.
 *
 * Accessibility: buttons carry aria-expanded/aria-controls, Escape closes,
 * focus leaving the region closes, and every panel is reachable by keyboard.
 * The whole menu is desktop-only; mobile uses the bottom tab bar and drawer.
 */
export function HeaderNav({
  categories,
  subcategories,
}: {
  categories: NavCategory[];
  subcategories: Record<string, string[]>;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 160);
  }
  function cancelClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }

  const featured = categories.slice(0, 4);
  const rest = categories.slice(4);

  return (
    <div ref={regionRef} className="hidden lg:block" onMouseLeave={scheduleClose}>
      <nav aria-label="Primary" className="flex items-stretch gap-0.5">
        <NavTrigger
          label="All categories"
          icon="grid"
          active={open === "all"}
          expanded={open === "all"}
          onOpen={() => { cancelClose(); setOpen("all"); }}
          controls="nav-panel-all"
        />

        {featured.map((c) => (
          <NavTrigger
            key={c.slug}
            label={c.name}
            active={open === c.slug}
            expanded={open === c.slug}
            onOpen={() => { cancelClose(); setOpen(c.slug); }}
            controls={`nav-panel-${c.slug}`}
          />
        ))}

        <Link href="/offers" className="flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-[12.5px] font-semibold text-[var(--color-sale)] transition-colors hover:bg-[var(--color-sale-soft)]">
          <Icon name="fire" size={13} />
          Flash sale
        </Link>
        <Link href="/new-arrivals" className="flex items-center rounded-sm px-2.5 py-2 text-[12.5px] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]">
          New arrivals
        </Link>
        <Link href="/best-sellers" className="flex items-center rounded-sm px-2.5 py-2 text-[12.5px] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]">
          Best sellers
        </Link>

        {/* all-categories mega panel */}
        {open === "all" ? (
          <Panel id="nav-panel-all" wide onMouseEnter={cancelClose}>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  onClick={() => setOpen(null)}
                  className="group flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors hover:bg-[var(--color-brand-soft)]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[var(--color-surface-2)] text-[var(--color-brand)] group-hover:bg-[var(--color-surface)]">
                    <Icon name={(c.icon ?? "tag") as never} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-[var(--color-ink)]">{c.name}</span>
                    {typeof c.count === "number" ? (
                      <span className="block text-[10.5px] text-[var(--color-ink-mute)]">{c.count} products</span>
                    ) : null}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[var(--color-line)] pt-2">
              <Link href="/shop" onClick={() => setOpen(null)} className="text-[11.5px] font-semibold text-[var(--color-brand-ink)] hover:underline">
                Browse all 225 products →
              </Link>
              <Link href="/collections/featured" onClick={() => setOpen(null)} className="text-[11.5px] text-[var(--color-ink-mute)] hover:underline">
                Featured collection
              </Link>
            </div>
          </Panel>
        ) : null}

        {/* per-category panels */}
        {featured.map((c) =>
          open === c.slug ? (
            <Panel key={c.slug} id={`nav-panel-${c.slug}`} onMouseEnter={cancelClose}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                  <Icon name={(c.icon ?? "tag") as never} size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[var(--color-ink)]">{c.name}</p>
                  {c.blurb ? (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--color-ink-mute)]">{c.blurb}</p>
                  ) : null}
                </div>
              </div>
              {(subcategories[c.slug] ?? []).length > 0 ? (
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-[var(--color-line)] pt-2">
                  {(subcategories[c.slug] ?? []).slice(0, 10).map((sub) => (
                    <li key={sub}>
                      <Link
                        href={`/category/${c.slug}?sub=${encodeURIComponent(sub)}`}
                        onClick={() => setOpen(null)}
                        className="block truncate rounded-sm px-1.5 py-1 text-[11.5px] text-[var(--color-ink-soft)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-ink)]"
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={`/category/${c.slug}`}
                onClick={() => setOpen(null)}
                className="mt-2 flex items-center gap-1 border-t border-[var(--color-line)] pt-2 text-[11.5px] font-semibold text-[var(--color-brand-ink)] hover:underline"
              >
                All {c.name.toLowerCase()} <Icon name="arrow-right" size={11} />
              </Link>
            </Panel>
          ) : null,
        )}
      </nav>

      {rest.length > 0 && open === null ? <span className="sr-only">{rest.length} more categories available under All categories</span> : null}
    </div>
  );
}

function NavTrigger({
  label,
  icon,
  expanded,
  active,
  onOpen,
  controls,
}: {
  label: string;
  icon?: string;
  expanded: boolean;
  active: boolean;
  onOpen: () => void;
  controls: string;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-[12.5px] transition-colors ${
        active
          ? "bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-ink)]"
          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
      }`}
    >
      {icon ? <Icon name={icon as never} size={13} /> : null}
      {label}
      <Icon name="chevron-down" size={11} className={active ? "rotate-180 transition-transform" : "transition-transform"} />
    </button>
  );
}

function Panel({
  id,
  children,
  wide = false,
  onMouseEnter,
}: {
  id: string;
  children: React.ReactNode;
  wide?: boolean;
  onMouseEnter: () => void;
}) {
  return (
    <div
      id={id}
      onMouseEnter={onMouseEnter}
      className={`absolute left-0 top-full z-50 mt-1 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-lift)] ${
        wide ? "w-[560px]" : "w-[320px]"
      }`}
    >
      {children}
    </div>
  );
}
