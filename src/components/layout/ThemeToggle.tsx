"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export type ThemeChoice = "light" | "dark" | "system";

/**
 * Theme control.
 *
 * The OS preference is the default (the CSS media query handles it with no
 * JavaScript at all), and an explicit choice is stored in localStorage and
 * applied by the inline script in the root layout *before first paint*, so a
 * dark-mode visitor never sees a white flash.
 *
 * Rendered as a three-way segmented control on mobile and a compact icon
 * button on desktop, where the cycle is light → dark → system.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("szs-theme") as ThemeChoice | null) ?? "system";
    setChoice(stored);
    setMounted(true);
  }, []);

  function apply(next: ThemeChoice) {
    setChoice(next);
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem("szs-theme");
    } else {
      root.setAttribute("data-theme", next);
      localStorage.setItem("szs-theme", next);
    }
  }

  if (compact) {
    const next: ThemeChoice = choice === "light" ? "dark" : choice === "dark" ? "system" : "light";
    const label =
      choice === "light" ? "Light theme — switch to dark" : choice === "dark" ? "Dark theme — switch to system" : "System theme — switch to light";
    return (
      <button
        type="button"
        onClick={() => apply(next)}
        className="flex h-8 w-8 items-center justify-center rounded-sm text-white/85 transition-colors hover:bg-white/15 hover:text-white"
        aria-label={label}
        title={label}
      >
        <Icon name={mounted && choice === "dark" ? "moon" : mounted && choice === "light" ? "sun" : "monitor"} size={17} />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center rounded-sm border border-[var(--color-line)] bg-[var(--color-surface-2)] p-0.5" role="group" aria-label="Colour theme">
      {(
        [
          { key: "light", icon: "sun", label: "Light" },
          { key: "dark", icon: "moon", label: "Dark" },
          { key: "system", icon: "monitor", label: "System" },
        ] as const
      ).map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => apply(t.key)}
          aria-pressed={mounted && choice === t.key}
          className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11.5px] font-medium transition-colors ${
            mounted && choice === t.key
              ? "bg-[var(--color-surface)] text-[var(--color-brand-ink)] shadow-[var(--shadow-card)]"
              : "text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
          }`}
        >
          <Icon name={t.icon} size={13} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
