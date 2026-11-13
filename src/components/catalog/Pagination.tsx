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
    <nav
      className="mt-3 flex items-center justify-center gap-1 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white px-3 py-2.5"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-outline btn-sm" rel="prev">Previous</Link>
      ) : (
        <span className="btn btn-outline btn-sm cursor-not-allowed opacity-40">Previous</span>
      )}
      {list.map((p, idx) => (
        <span key={p} className="flex items-center gap-1">
          {idx > 0 && p - list[idx - 1] > 1 ? (
            <span className="px-1 text-[11px] text-[var(--color-ink-mute)]">…</span>
          ) : null}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-7 min-w-7 items-center justify-center rounded-sm border px-1.5 text-[11.5px] font-semibold ${
              p === page
                ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn btn-outline btn-sm" rel="next">Next</Link>
      ) : (
        <span className="btn btn-outline btn-sm cursor-not-allowed opacity-40">Next</span>
      )}
    </nav>
  );
}
