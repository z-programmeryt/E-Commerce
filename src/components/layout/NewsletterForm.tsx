"use client";

import { useActionState } from "react";
import { newsletterAction } from "@/app/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(newsletterAction, { ok: false, message: "" });
  return (
    <form action={action} className="space-y-2">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="flex gap-1.5">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="field h-8 min-h-0 flex-1 text-[12px]"
        />
        <button type="submit" className="btn btn-primary btn-sm shrink-0" disabled={pending}>
          {pending ? "…" : "Join"}
        </button>
      </div>
      {state.message ? (
        <p className={`text-[11px] ${state.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`} role="status">
          {state.message}
        </p>
      ) : (
        <p className="text-[11px] sm:text-[10.5px] text-[var(--color-ink-mute)]">No spam. Unsubscribe anytime.</p>
      )}
    </form>
  );
}
