"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function SearchBox({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      action="/search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/shop");
      }}
      className="relative"
    >
      <label htmlFor={large ? "search-large" : "search"} className="sr-only">Search products</label>
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-mute)]" />
      <input
        id={large ? "search-large" : "search"}
        name="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={large ? "Search 225 products — panjabi, watch, gift box…" : "Search products"}
        autoComplete="off"
        className={`w-full rounded-full border border-[var(--color-line-strong)] bg-white pl-9 pr-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-olive)] focus:outline-none ${
          large ? "h-12 text-sm" : "h-9 text-xs md:w-56"
        }`}
      />
    </form>
  );
}
