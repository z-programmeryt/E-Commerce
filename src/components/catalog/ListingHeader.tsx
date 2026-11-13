import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/**
 * Standard marketplace listing header: breadcrumb, title with a count, and a
 * right-side action. Every listing page uses it so the shopping experience
 * never shifts shape between sections.
 */
export function ListingHeader({
  title,
  count,
  subtitle,
  crumb,
  action,
}: {
  title: string;
  count?: number | string;
  subtitle?: string;
  crumb?: { label: string; href?: string }[];
  action?: { label: string; href: string };
}) {
  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]"
      >
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        {(crumb ?? []).map((c) => (
          <span key={c.label} className="flex items-center gap-1">
            <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
            {c.href ? (
              <Link href={c.href} className="hover:text-[var(--color-brand-deep)] hover:underline">{c.label}</Link>
            ) : (
              <span className="text-[var(--color-ink-soft)]" aria-current="page">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold leading-tight text-[var(--color-ink)]">
              {title}
              {count !== undefined ? (
                <span className="ml-2 text-[12px] font-normal text-[var(--color-ink-mute)]">{count}</span>
              ) : null}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[var(--color-ink-mute)]">{subtitle}</p>
            ) : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className="shrink-0 text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline"
            >
              {action.label}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** Wraps a product grid in the standard white catalogue panel. */
export function ListingPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-2 ${className}`}>
      {children}
    </div>
  );
}

/** Loading placeholder shaped like a marketplace listing page. */
export function ListingSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="container-page pb-6" aria-busy="true" aria-live="polite">
      <div className="py-2.5">
        <div className="skeleton h-3 w-28 rounded-sm" />
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-line)] px-3 py-2.5">
          <div className="skeleton h-4 w-40 rounded-sm" />
          <div className="skeleton mt-2 h-3 w-2/3 rounded-sm" />
        </div>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <div className="skeleton h-64 rounded-[var(--radius-card)]" />
        </div>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-[var(--color-line)]">
                <div className="skeleton aspect-square w-full" />
                <div className="p-1.5">
                  <div className="skeleton h-2.5 w-4/5 rounded-sm" />
                  <div className="skeleton mt-1.5 h-2.5 w-1/3 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
