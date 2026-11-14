"use client";

import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/app/actions";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";

export function WishlistButton({
  productId,
  initial,
  variant = "icon",
  label = "Save for later",
}: {
  productId: number;
  initial: boolean;
  variant?: "icon" | "button";
  label?: string;
}) {
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (!res.ok) setActive(!next);
      else router.refresh();
    });
  }

  if (variant === "button") {
    return (
      <button type="button" onClick={toggle} disabled={pending} className="btn btn-outline w-full" aria-pressed={active}>
        <Icon name="heart" size={16} strokeWidth={active ? 2.5 : 1.5} />
        {active ? "Saved to wishlist" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)]/95 text-[var(--color-ink-soft)] shadow-sm transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
    >
      <Icon name="heart" size={16} strokeWidth={active ? 2.5 : 1.6} className={active ? "fill-[var(--color-sale)] text-[var(--color-sale)]" : ""} />
    </button>
  );
}
