import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type Cat = { slug: string; name: string; name_bn?: string | null; icon?: string | null };

/**
 * Daraz-style category tiles: a single white panel, one row of icon + label
 * cells that wraps on small screens. Counts come from the database rather
 * than being hardcoded.
 */
export function CategoryTiles({
  categories,
  counts,
}: {
  categories: Cat[];
  counts: Record<string, number>;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="section-bar">
        <h2 className="section-bar-title">Categories</h2>
        <Link href="/shop" className="text-[12px] font-semibold text-[var(--color-brand-deep)] hover:underline">
          All categories
        </Link>
      </div>
      <ul className="grid grid-cols-3 divide-x divide-y divide-[var(--color-line)] sm:grid-cols-5 lg:grid-cols-8">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="flex h-full flex-col items-center gap-1.5 px-2 py-3 text-center transition-colors hover:bg-[var(--color-brand-soft)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-deep)]">
                <Icon name={(c.icon ?? "grid") as never} size={17} />
              </span>
              <span className="line-clamp-2 text-[11.5px] leading-tight text-[var(--color-ink-soft)]">{c.name}</span>
              <span className="text-[10px] text-[var(--color-ink-mute)]">{counts[c.slug] ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
