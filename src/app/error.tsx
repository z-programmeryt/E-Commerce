"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this would go to an error reporter; the demo logs locally.
    console.error("Storefront error:", error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow mb-3">Something went wrong</p>
      <h1 className="font-display text-3xl">We could not load that page.</h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-ink-mute)]">
        The store hit an unexpected error. Your cart and wishlist are stored locally and are safe.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
      {error.digest ? <p className="mt-4 font-mono text-[0.6875rem] text-[var(--color-ink-mute)]">ref: {error.digest}</p> : null}
    </div>
  );
}
