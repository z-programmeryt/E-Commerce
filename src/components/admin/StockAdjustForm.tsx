"use client";

import { useActionState } from "react";
import { adjustStockAction, type AdminFormState } from "@/app/admin/actions";

export function StockAdjustForm({ variants }: { variants: { id: number; label: string }[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(adjustStockAction, { ok: false });
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className={`rounded-md px-3 py-2 text-xs ${state.ok ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-danger-soft)] text-[var(--color-danger-ink)]"}`} role="status">
          {state.message}
        </p>
      ) : null}
      <div>
        <label htmlFor="variant_id" className="label">Variant</label>
        <select id="variant_id" name="variant_id" required className="field h-10 min-h-0 text-xs">
          {variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="mode" className="label">Mode</label>
          <select id="mode" name="mode" className="field h-10 min-h-0 text-xs">
            <option value="set">Set stock to</option>
            <option value="add">Add / remove</option>
          </select>
        </div>
        <div>
          <label htmlFor="qty" className="label">Quantity</label>
          <input id="qty" name="qty" type="number" required defaultValue={0} className="field h-10 min-h-0" />
        </div>
      </div>
      <div>
        <label htmlFor="note" className="label">Note</label>
        <input id="note" name="note" className="field h-10 min-h-0 text-xs" placeholder="Restock invoice, damaged return…" />
      </div>
      <button className="btn btn-primary btn-sm w-full" disabled={pending}>{pending ? "Saving…" : "Apply stock change"}</button>
      <p className="text-[0.625rem] text-[var(--color-ink-mute)]">
        Every change writes an inventory movement row with reason and note.
      </p>
    </form>
  );
}
