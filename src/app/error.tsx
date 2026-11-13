"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this would go to an error reporter; the demo logs locally.
    console.error("Storefront error:", error.message);
  }, [error]);

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
        <div className="section-bar">
          <h2 className="section-bar-title">Something went wrong</h2>
        </div>
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf1ee] text-[#7e2b1f]">
            <Icon name="alert" size={22} />
          </span>
          <h1 className="mt-3 text-[17px] font-bold text-[var(--color-ink)]">We could not load that page</h1>
          <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-[var(--color-ink-mute)]">
            The store hit an unexpected error. Your cart and wishlist are stored locally and are safe.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button onClick={reset} className="btn btn-primary btn-sm">Try again</button>
            <Link href="/" className="btn btn-outline btn-sm">Back to home</Link>
          </div>
          {error.digest ? (
            <p className="mt-3 font-mono text-[10.5px] text-[var(--color-ink-mute)]">ref: {error.digest}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
