"use client";

import { useActionState } from "react";
import { saveBannerAction, type AdminFormState } from "@/app/admin/actions";

export function BannerForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveBannerAction, { ok: false });
  return (
    <form action={action} className="mt-3 space-y-2.5">
      {state.message ? (
        <p className={`rounded-md px-2.5 py-1.5 text-[0.6875rem] ${state.ok ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-danger-soft)] text-[var(--color-danger-ink)]"}`} role="status">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="b-title" className="label">Title</label>
        <input id="b-title" name="title" required className="field h-9 min-h-0 text-xs" />
      </div>
      <div>
        <label htmlFor="b-subtitle" className="label">Subtitle</label>
        <textarea id="b-subtitle" name="subtitle" rows={2} className="field text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="b-cta" className="label">CTA label</label>
          <input id="b-cta" name="cta_label" defaultValue="Shop now" className="field h-9 min-h-0 text-xs" />
        </div>
        <div>
          <label htmlFor="b-href" className="label">CTA link</label>
          <input id="b-href" name="cta_href" defaultValue="/shop" className="field h-9 min-h-0 text-xs" />
        </div>
        <div>
          <label htmlFor="b-placement" className="label">Placement</label>
          <select id="b-placement" name="placement" className="field h-9 min-h-0 text-xs">
            <option value="hero">Hero</option>
            <option value="promo">Promo</option>
            <option value="strip">Strip</option>
          </select>
        </div>
        <div>
          <label htmlFor="b-theme" className="label">Theme</label>
          <select id="b-theme" name="theme" className="field h-9 min-h-0 text-xs">
            <option value="ink">Ink</option>
            <option value="sand">Sand</option>
            <option value="olive">Olive</option>
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="b-sort" className="label">Sort order</label>
          <input id="b-sort" name="sort_order" type="number" defaultValue={10} className="field h-9 min-h-0 text-xs" />
        </div>
      </div>
      <button className="btn btn-primary btn-sm w-full" disabled={pending}>{pending ? "Saving…" : "Create banner"}</button>
    </form>
  );
}
