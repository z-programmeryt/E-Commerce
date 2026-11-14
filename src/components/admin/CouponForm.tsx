"use client";

import { useActionState } from "react";
import { saveCouponAction, type AdminFormState } from "@/app/admin/actions";

export function CouponForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveCouponAction, { ok: false });
  return (
    <form action={action} className="space-y-2.5">
      {state.message ? (
        <p className={`rounded-md px-2.5 py-1.5 text-[0.6875rem] ${state.ok ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-danger-soft)] text-[var(--color-danger-ink)]"}`} role="status">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="code" className="label">Code</label>
        <input id="code" name="code" required placeholder="SPRING10" className="field h-9 min-h-0 font-mono text-xs uppercase" />
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <input id="description" name="description" className="field h-9 min-h-0 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="type" className="label">Type</label>
          <select id="type" name="type" className="field h-9 min-h-0 text-xs">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed ৳</option>
            <option value="freeship">Free shipping</option>
          </select>
        </div>
        <div>
          <label htmlFor="value" className="label">Value</label>
          <input id="value" name="value" type="number" defaultValue={10} className="field h-9 min-h-0 text-xs" />
        </div>
        <div>
          <label htmlFor="min_subtotal" className="label">Min spend ৳</label>
          <input id="min_subtotal" name="min_subtotal" type="number" defaultValue={1000} className="field h-9 min-h-0 text-xs" />
        </div>
        <div>
          <label htmlFor="max_discount" className="label">Max discount</label>
          <input id="max_discount" name="max_discount" type="number" className="field h-9 min-h-0 text-xs" />
        </div>
        <div className="col-span-2">
          <label htmlFor="usage_limit" className="label">Usage limit</label>
          <input id="usage_limit" name="usage_limit" type="number" className="field h-9 min-h-0 text-xs" placeholder="Unlimited" />
        </div>
      </div>
      <button className="btn btn-primary btn-sm w-full" disabled={pending}>{pending ? "Saving…" : "Save coupon"}</button>
    </form>
  );
}
