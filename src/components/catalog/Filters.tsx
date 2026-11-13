"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";

export type FilterOption = { value: string; label: string; count?: number };

const PRICE_BANDS: FilterOption[] = [
  { value: "0-500", label: "Under ৳500" },
  { value: "500-1500", label: "৳500 – ৳1,500" },
  { value: "1500-3000", label: "৳1,500 – ৳3,000" },
  { value: "3000-6000", label: "৳3,000 – ৳6,000" },
  { value: "6000-", label: "৳6,000+" },
];

const SORTS: FilterOption[] = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = params.get("sort") ?? "featured";

  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="whitespace-nowrap text-[var(--color-ink-mute)]">Sort</span>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
        }}
        className="field h-9 min-h-0 py-0 text-xs"
        aria-label="Sort products"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </label>
  );
}

export function ActiveChips({ labels }: { labels: Record<string, string> }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const entries = Object.entries(labels).filter(([k]) => params.get(k));

  if (entries.length === 0) return null;

  const remove = (key: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map(([key, label]) => (
        <button
          key={key}
          onClick={() => remove(key)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white px-2.5 py-1 text-[0.6875rem] hover:border-[var(--color-ink)]"
        >
          {label}: <span className="font-semibold">{params.get(key)}</span>
          <Icon name="close" size={11} />
        </button>
      ))}
      <button
        onClick={() => router.push(pathname, { scroll: false })}
        className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
      >
        Clear all
      </button>
    </div>
  );
}

export function FilterPanel({
  categories,
  subcategories,
  tags,
}: {
  categories: FilterOption[];
  subcategories: FilterOption[];
  tags: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value || next.get(key) === value) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggle = (key: string, value: string, multi: boolean) => {
    const next = new URLSearchParams(params.toString());
    const current = next.get(key);
    if (current === value) next.delete(key);
    else next.set(key, value);
    if (multi) next.delete("page");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const priceValue = (() => {
    const min = params.get("min");
    const max = params.get("max");
    if (!min && !max) return "";
    return `${min ?? "0"}-${max ?? ""}`;
  })();

  const setPrice = (band: string) => {
    const next = new URLSearchParams(params.toString());
    if (priceValue === band) {
      next.delete("min");
      next.delete("max");
    } else if (band) {
      const [min, max] = band.split("-");
      next.set("min", min || "0");
      if (max) next.set("max", max);
      else next.delete("max");
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-[var(--color-line)] py-4 last:border-0">
      <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">{title}</p>
      {children}
    </div>
  );

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-[0.6875rem] transition-colors ${
        active
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
          : "border-[var(--color-line-strong)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-ink)]"
      }`}
    >
      {children}
    </button>
  );

  const body = (
    <div className="text-sm">
      <Section title="Category">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <Chip key={c.value} active={params.get("category") === c.value} onClick={() => toggle("category", c.value, false)}>
              {c.label}{c.count !== undefined ? <span className="ml-1 opacity-60">{c.count}</span> : null}
            </Chip>
          ))}
        </div>
      </Section>

      {subcategories.length > 0 ? (
        <Section title="Type">
          <div className="flex flex-wrap gap-1.5">
            {subcategories.map((s) => (
              <Chip key={s.value} active={params.get("sub") === s.value} onClick={() => toggle("sub", s.value, true)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Price">
        <div className="flex flex-wrap gap-1.5">
          {PRICE_BANDS.map((b) => (
            <Chip key={b.value} active={priceValue === b.value} onClick={() => setPrice(b.value)}>
              {b.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Availability">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={params.get("stock") === "1"}
            onChange={() => setParam("stock", params.get("stock") === "1" ? null : "1")}
            className="h-4 w-4 rounded border-[var(--color-line-strong)]"
          />
          In stock only
        </label>
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={params.get("sale") === "1"}
            onChange={() => setParam("sale", params.get("sale") === "1" ? null : "1")}
            className="h-4 w-4 rounded border-[var(--color-line-strong)]"
          />
          On sale
        </label>
      </Section>

      {tags.length > 0 ? (
        <Section title="Style & occasion">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Chip key={t.value} active={params.get("tag") === t.value} onClick={() => toggle("tag", t.value, false)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <button onClick={() => setOpen(true)} className="btn btn-outline btn-sm w-full">
          <Icon name="filter" size={14} /> Filters
        </button>
        {open ? (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
            <button className="absolute inset-0 bg-black/40" aria-label="Close filters" onClick={() => setOpen(false)} />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--color-paper)] p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-lg">Filters</p>
                <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-paper-2)]" aria-label="Close">
                  <Icon name="close" size={18} />
                </button>
              </div>
              {body}
              <div className="sticky bottom-0 mt-4 bg-[var(--color-paper)] pt-3">
                <button onClick={() => setOpen(false)} className="btn btn-primary w-full">Show results</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="hidden lg:block" aria-label="Product filters">
        <div className="sticky top-32">{body}</div>
      </aside>
    </>
  );
}
