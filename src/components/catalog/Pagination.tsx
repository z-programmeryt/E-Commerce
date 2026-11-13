import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-outline btn-sm" rel="prev">Previous</Link>
      ) : null}
      {list.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && p - list[idx - 1] > 1 ? <span className="px-1 text-xs text-[var(--color-ink-mute)]">…</span> : null}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-semibold ${
              p === page
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                : "border-[var(--color-line-strong)] bg-white hover:border-[var(--color-ink)]"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn btn-outline btn-sm" rel="next">Next</Link>
      ) : null}
    </nav>
  );
}
