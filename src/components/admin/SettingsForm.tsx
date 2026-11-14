"use client";

import { useActionState } from "react";
import { saveSettingsAction, type AdminFormState } from "@/app/admin/actions";

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "store_name", label: "Store name" },
  { key: "tagline", label: "Tagline" },
  { key: "currency", label: "Currency code" },
  { key: "delivery_fee_dhaka", label: "Delivery fee — Dhaka (৳)", type: "number" },
  { key: "delivery_fee_outside", label: "Delivery fee — outside Dhaka (৳)", type: "number" },
  { key: "free_delivery_threshold", label: "Free delivery threshold (৳)", type: "number" },
  { key: "support_phone", label: "Support phone" },
  { key: "support_email", label: "Support email" },
  { key: "maintenance_mode", label: "Maintenance mode" },
];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveSettingsAction, { ok: false });
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className={`rounded-md px-3 py-2 text-xs ${state.ok ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-danger-soft)] text-[var(--color-danger-ink)]"}`} role="status">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`s-${f.key}`} className="label">{f.label}</label>
            <input
              id={`s-${f.key}`}
              name={`setting_${f.key}`}
              type={f.type ?? "text"}
              defaultValue={settings[f.key] ?? ""}
              className="field h-9 min-h-0 text-xs"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="s-price_disclaimer" className="label">Price disclaimer</label>
          <textarea id="s-price_disclaimer" name="setting_price_disclaimer" rows={3} defaultValue={settings.price_disclaimer ?? ""} className="field text-xs" />
        </div>
      </div>
      <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
      <p className="text-[0.625rem] text-[var(--color-ink-mute)]">
        Note: checkout currently reads delivery fees from the brand config module, so editing them here records the
        intended value but does not reprice checkout yet. That is listed as a known limitation.
      </p>
    </form>
  );
}
