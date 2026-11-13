"use client";

import { useEffect, useState } from "react";

/**
 * Countdown to the end of the current 24-hour demo cycle.
 *
 * Rendered empty on the server and filled on the client, so the markup is
 * stable and there is no hydration mismatch. A missing countdown degrades to
 * nothing rather than to a wrong value.
 */
function nextMidnightUtc(): number {
  const now = new Date();
  const end = new Date(now);
  end.setUTCHours(24, 0, 0, 0);
  return end.getTime();
}

export function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = nextMidnightUtc();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) {
    return <span className="countdown text-[var(--color-ink-mute)]" aria-hidden="true" />;
  }

  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="countdown" aria-label={`Sale ends in ${h} hours ${m} minutes`}>
      <span className="text-[var(--color-ink-mute)]">Ends in</span>
      <span>{pad(h)}</span>
      <b className="text-[var(--color-ink-mute)]">:</b>
      <span>{pad(m)}</span>
      <b className="text-[var(--color-ink-mute)]">:</b>
      <span>{pad(s)}</span>
    </span>
  );
}
