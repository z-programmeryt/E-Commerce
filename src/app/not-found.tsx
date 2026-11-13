import Link from "next/link";
import { listCategories } from "@/lib/repo";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  const categories = listCategories().slice(0, 8);
  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <Icon name="search" size={22} />
          </span>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">Error 404</p>
          <h1 className="mt-1 text-[19px] font-bold text-[var(--color-ink)]">This page has moved on</h1>
          <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-[var(--color-ink-mute)]">
            The link may be old, or the product may no longer be stocked. Try one of these instead.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/shop" className="btn btn-primary btn-sm">Shop all products</Link>
            <Link href="/" className="btn btn-outline btn-sm">Back to home</Link>
          </div>
        </div>
        <div className="border-t border-[var(--color-line)] p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
            Popular categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-sm border border-[var(--color-line)] px-2 py-1 text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
