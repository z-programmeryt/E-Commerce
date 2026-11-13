import type { OrderStatus } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

const STEPS: { key: OrderStatus; label: string; copy: string }[] = [
  { key: "pending", label: "Order placed", copy: "We received your order and reserved the stock." },
  { key: "confirmed", label: "Confirmed", copy: "The team confirmed stock and pricing by phone or SMS." },
  { key: "packed", label: "Packed", copy: "Quality checked and packed in Dhaka." },
  { key: "shipped", label: "Shipped", copy: "Handed to the courier with a tracking code." },
  { key: "delivered", label: "Delivered", copy: "Cash collected by the courier." },
];

export function ActivityTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="flex items-start gap-3 rounded-sm bg-[var(--color-danger-soft)] p-3 text-[12px] text-[var(--color-danger-ink)]">
        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
        <p>
          This order is marked <strong>{status}</strong>.{" "}
          {status === "cancelled"
            ? "Stock has been returned to inventory in the demo database."
            : "A return was recorded against this order."}
        </p>
      </div>
    );
  }

  const currentIndex = Math.max(0, STEPS.findIndex((s) => s.key === status));
  return (
    <ol className="space-y-0">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  done
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                    : "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-mute)]"
                }`}
                aria-hidden="true"
              >
                {done ? <Icon name="check" size={12} strokeWidth={2.5} /> : i + 1}
              </span>
              {i < STEPS.length - 1 ? (
                <span className={`w-px flex-1 ${i < currentIndex ? "bg-[var(--color-brand)]" : "bg-[var(--color-line)]"}`} style={{ minHeight: 22 }} />
              ) : null}
            </div>
            <div className="pb-3">
              <p className={`text-[12.5px] leading-tight ${active ? "font-bold text-[var(--color-ink)]" : done ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-ink-mute)]"}`}>
                {step.label}
                {active ? <span className="ml-1.5 rounded-sm bg-[var(--color-brand-soft)] px-1.5 py-0.5 text-[11px] sm:text-[10.5px] sm:text-[9.5px] font-bold uppercase tracking-wide text-[var(--color-brand-deep)]">Current</span> : null}
              </p>
              <p className="text-[11px] text-[var(--color-ink-mute)]">{step.copy}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
