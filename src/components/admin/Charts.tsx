/**
 * Lightweight chart primitives built from divs and inline SVG. No chart library,
 * so the admin bundle stays small and there is no canvas/SSR mismatch.
 */
import { formatBdt } from "@/lib/brand";

export function Sparkline({ data }: { data: { day: string; orders: number; revenue: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-xs text-[var(--color-ink-mute)]">No orders in this period yet.</p>;
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]" role="img" aria-label="Daily revenue bar chart">
        {data.map((d) => (
          <div key={d.day} className="group relative flex-1">
            <div
              className="w-full rounded-t bg-[var(--color-olive)]/75 transition-colors hover:bg-[var(--color-olive-deep)]"
              style={{ height: `${Math.max(3, (d.revenue / max) * 132)}px` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-ink)] px-2 py-1 text-[0.625rem] text-white group-hover:block">
              {d.day.slice(5)} · {formatBdt(d.revenue)} · {d.orders} orders
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[0.5625rem] uppercase tracking-wide text-[var(--color-ink-mute)]">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export function BarList({ items }: { items: { label: string; value: number; hint?: string }[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-xs text-[var(--color-ink-mute)]">Nothing to show yet.</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium">{item.label}</span>
            <span className="shrink-0 tabular-nums">{formatBdt(item.value)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-paper-2)]">
            <div className="h-full rounded-full bg-[var(--color-olive)]" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          {item.hint ? <p className="mt-0.5 text-[0.625rem] text-[var(--color-ink-mute)]">{item.hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}

const statusTone: Record<string, string> = {
  pending: "bg-[#b98527]",
  confirmed: "bg-[#7b8a6b]",
  packed: "bg-[#5d6a4f]",
  shipped: "bg-[#3f5b6b]",
  delivered: "bg-[#3f6b4f]",
  cancelled: "bg-[#a4553a]",
  returned: "bg-[#8a6516]",
};

export function StatusBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="capitalize text-[var(--color-ink-soft)]">{label}</span>
        <span className="tabular-nums font-semibold">{count}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-paper-2)]">
        <div className={`h-full rounded-full ${statusTone[label] ?? "bg-[var(--color-ink)]"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StackedBar({ segments }: { segments: { label: string; value: number; className: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--color-paper-2)]">
        {segments.map((s) => (
          <div key={s.label} className={s.className} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.625rem]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${s.className}`} />
            <span className="text-[var(--color-ink-mute)]">{s.label}</span>
            <span className="font-semibold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
