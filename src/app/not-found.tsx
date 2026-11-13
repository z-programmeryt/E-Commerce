import Link from "next/link";
import { listCategories } from "@/lib/repo";

export default function NotFound() {
  const categories = listCategories().slice(0, 6);
  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-3xl md:text-4xl">This page has moved on.</h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-ink-mute)]">
        The link may be old, or the product may no longer be stocked. Try one of these instead.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">Shop all products</Link>
        <Link href="/" className="btn btn-outline">Home</Link>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="badge hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]">
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
