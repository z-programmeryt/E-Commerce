import Link from "next/link";
import { Icon } from "./ui/Icon";

type Props = {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
};

export function EmptyState({ title, subtitle, action }: Props) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-paper-2)] text-[var(--color-ink-mute)]">
        <Icon name="box" size={22} />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      {subtitle ? <p className="mt-2 max-w-md text-sm text-[var(--color-ink-mute)]">{subtitle}</p> : null}
      {action ? (
        <Link href={action.href} className="btn btn-primary mt-5">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "danger" | "success";
  title?: string;
  children: React.ReactNode;
}) {
  const tones = {
    info: "border-[var(--color-line-strong)] bg-white text-[var(--color-ink-soft)]",
    warn: "border-[#f0e2c4] bg-[#fbf6ea] text-[#6d5211]",
    danger: "border-[#ecd3cb] bg-[#fbf1ee] text-[#7e2b1f]",
    success: "border-[#d6e3d6] bg-[#f2f7f1] text-[#2f5539]",
  } as const;
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`} role={tone === "danger" ? "alert" : undefined}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="[&_a]:underline [&_a]:underline-offset-2">{children}</div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h2 className="font-display text-2xl md:text-[1.75rem]">{title}</h2>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-[var(--color-ink-mute)]">{subtitle}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="link-underline shrink-0 text-xs font-semibold uppercase tracking-[0.08em]">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />;
}
