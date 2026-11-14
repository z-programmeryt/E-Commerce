"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Marketplace search: one wide input with a solid brand-blue submit button.
 * The button is a real <button type="submit"> on a GET form, so search still
 * works with JavaScript disabled or before hydration.
 */
export function SearchBox({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const id = large ? "search-large" : "search";

  return (
    <form
      role="search"
      action="/search"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/shop");
      }}
      className={`flex w-full items-stretch overflow-hidden rounded-sm border border-transparent bg-[var(--color-surface-2)] transition-colors focus-within:border-[var(--color-brand)] focus-within:bg-[var(--color-surface)] ${
        large ? "h-12" : "h-9 md:h-10"
      }`}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={large ? "Search 225 products — panjabi, watch, gift box…" : "Search in SUPER Z SHOP…"}
        autoComplete="off"
        className={`min-w-0 flex-1 bg-transparent px-3 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-mute)] ${
          large ? "text-sm" : "text-[13px]"
        }`}
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex shrink-0 items-center justify-center bg-[var(--color-brand)] px-4 text-white transition-colors hover:bg-[var(--color-brand-deep)]"
      >
        <Icon name="search" size={large ? 20 : 18} />
      </button>
    </form>
  );
}
