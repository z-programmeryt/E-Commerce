"use client";

import { useActionState } from "react";
import { contactAction } from "@/app/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, { ok: false, message: "" });
  return (
    <form action={action} className="grid gap-2.5 sm:grid-cols-2">
      <div>
        <label htmlFor="c-name" className="label">Name *</label>
        <input id="c-name" name="name" required className="field h-9 min-h-0" />
      </div>
      <div>
        <label htmlFor="c-email" className="label">Email *</label>
        <input id="c-email" name="email" type="email" required className="field h-9 min-h-0" />
      </div>
      <div>
        <label htmlFor="c-phone" className="label">Phone</label>
        <input id="c-phone" name="phone" className="field h-9 min-h-0" inputMode="tel" />
      </div>
      <div>
        <label htmlFor="c-subject" className="label">Subject *</label>
        <input id="c-subject" name="subject" required className="field h-9 min-h-0" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="label">Message *</label>
        <textarea id="c-message" name="message" rows={4} required className="field min-h-0" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </button>
        {state.message ? (
          <p className={`mt-2 text-[11.5px] ${state.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
