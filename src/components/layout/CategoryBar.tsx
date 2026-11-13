import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type Cat = { slug: string; name: string; name_bn?: string | null };

/**
 * Daraz-style horizontal category strip. The all-categories link opens the
 * same drawer the mobile menu uses, so there is one browse surface, not two.
 */
export function CategoryBar({ categories }: { categories: Cat[] }) {
  return (
    <div className="border-b border-[var(--color-line)] bg-white">
      <div className="container-page">
        <nav aria-label="Categories" className="rail items-center gap-0 py-0">
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-1.5 border-r border-[var(--color-line)] py-2.5 pr-3 text-[12.5px] font-semibold text-[var(--color-ink)] hover:text-[var(--color-brand-deep)] md:pr-4"
          >
            <Icon name="grid" size={14} />
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap px-3 py-2.5 text-[12.5px] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-brand-deep)] md:px-4"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/offers"
            className="whitespace-nowrap px-3 py-2.5 text-[12.5px] font-semibold text-[var(--color-brand-deep)] md:px-4"
          >
            Flash Sale
          </Link>
          <Link
            href="/new-arrivals"
            className="whitespace-nowrap px-3 py-2.5 text-[12.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-brand-deep)] md:px-4"
          >
            New Arrivals
          </Link>
        </nav>
      </div>
    </div>
  );
}
