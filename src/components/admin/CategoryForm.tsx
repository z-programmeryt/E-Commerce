"use client";

import { useActionState } from "react";
import { saveCategoryAction, type AdminFormState } from "@/app/admin/actions";

export function CategoryForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveCategoryAction, { ok: false });
  return (
    <form action={action} className="space-y-2.5">
      {state.message ? (
        <p className={`rounded-md px-2.5 py-1.5 text-[0.6875rem] ${state.ok ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-danger-soft)] text-[var(--color-danger-ink)]"}`} role="status">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="c-name" className="label">Name</label>
        <input id="c-name" name="name" required className="field h-9 min-h-0 text-xs" />
      </div>
      <div>
        <label htmlFor="c-slug" className="label">Slug</label>
        <input id="c-slug" name="slug" required placeholder="home-decor" className="field h-9 min-h-0 font-mono text-xs" />
      </div>
      <div>
        <label htmlFor="c-name-bn" className="label">Bangla name</label>
        <input id="c-name-bn" name="name_bn" className="field h-9 min-h-0 text-xs" />
      </div>
      <div>
        <label htmlFor="c-blurb" className="label">Blurb</label>
        <textarea id="c-blurb" name="blurb" rows={2} className="field text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="c-icon" className="label">Icon key</label>
          <input id="c-icon" name="icon" defaultValue="grid" className="field h-9 min-h-0 font-mono text-xs" />
        </div>
        <div>
          <label htmlFor="c-sort" className="label">Sort</label>
          <input id="c-sort" name="sort_order" type="number" defaultValue={99} className="field h-9 min-h-0 text-xs" />
        </div>
      </div>
      <button className="btn btn-primary btn-sm w-full" disabled={pending}>{pending ? "Saving…" : "Save category"}</button>
    </form>
  );
}
