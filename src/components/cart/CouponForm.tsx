"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Coupon validation is applied at checkout on the server. This panel previews
 * whether a code is valid and stores it for the checkout form via URL param.
 */
const DEMO = [
  { code: "WELCOME10", text: "10% off over ৳1,000 (max ৳300)" },
  { code: "EID500", text: "৳500 off over ৳5,000" },
  { code: "FREESHIP", text: "Free delivery over ৳1,500" },
  { code: "SUPERZ15", text: "15% off over ৳2,000 (max ৳500)" },
];

export function CouponForm({ initial = "" }: { initial?: string }) {
  const [code, setCode] = useState(initial);
  const [saved, setSaved] = useState<string | null>(initial || null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label htmlFor="coupon" className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-mute)]">
        Coupon code
      </label>
      <div className="flex gap-1.5">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="WELCOME10"
          className="field h-8 min-h-0 flex-1 font-mono text-[11.5px] uppercase"
          autoComplete="off"
        />
        <button type="button" onClick={() => setSaved(code.trim() || null)} className="btn btn-outline btn-sm shrink-0">
          Apply
        </button>
      </div>
      {saved ? (
        <p className="mt-1 flex items-center gap-1 text-[10.5px] text-[var(--color-success)]">
          <Icon name="check" size={10} /> {saved} will be applied at checkout
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1.5 text-[10.5px] text-[var(--color-ink-mute)] underline underline-offset-2 hover:text-[var(--color-brand-deep)]"
        aria-expanded={open}
      >
        {open ? "Hide demo codes" : "Which demo codes work?"}
      </button>
      {open ? (
        <ul className="mt-1.5 space-y-1 rounded-sm bg-[#fafafa] p-2">
          {DEMO.map((d) => (
            <li key={d.code} className="flex items-baseline justify-between gap-2 text-[10.5px]">
              <button
                type="button"
                onClick={() => { setCode(d.code); setSaved(d.code); }}
                className="font-mono font-semibold text-[var(--color-brand-deep)] hover:underline"
              >
                {d.code}
              </button>
              <span className="text-right text-[var(--color-ink-mute)]">{d.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
