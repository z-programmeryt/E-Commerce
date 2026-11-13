"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  body: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  /** tint applied over the photo so white type stays legible on any crop */
  tone: "navy" | "blue" | "slate";
  align: "left" | "center";
};

const TONES: Record<Slide["tone"], string> = {
  navy: "from-[#0b1b3a]/93 via-[#0b1b3a]/72 to-[#0b1b3a]/15",
  blue: "from-[#12359d]/93 via-[#1b4fd8]/70 to-[#1b4fd8]/10",
  slate: "from-[#101a2e]/92 via-[#1c2a45]/70 to-[#1c2a45]/12",
};

/**
 * Marketplace hero carousel.
 *
 * Accessibility and etiquette decisions that matter more than the animation:
 *  • pauses on hover, on focus, and when the tab is hidden
 *  • never auto-advances if the visitor has asked for reduced motion
 *  • arrow keys, Home/End and swipe all work; dots are real buttons
 *  • the first slide is server-rendered and prioritised, so LCP stays fast
 *  • no invented urgency — the copy describes real catalogue facts
 */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchStart = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || reduced || slides.length <= 1) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, reduced, slides.length]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(slides.length - 1);
    }
  }

  return (
    <section
      ref={regionRef}
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="relative h-[248px] sm:h-[300px] md:h-[340px] lg:h-[380px]">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${s.title}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-500 ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 76rem, 1216px"
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${TONES[s.tone]}`} aria-hidden="true" />
              <div
                className={`relative flex h-full flex-col justify-center px-5 py-6 sm:px-8 md:px-12 ${
                  s.align === "center" ? "items-center text-center" : "items-start"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-white/15 px-2 py-1 text-[11px] sm:text-[10.5px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/25">
                  {s.eyebrow}
                </span>
                <h2 className="mt-3 max-w-[19ch] text-[24px] font-extrabold leading-[1.12] text-white sm:max-w-[24ch] sm:text-[32px] md:text-[40px]">
                  {s.title}
                  {s.highlight ? (
                    <>
                      {" "}
                      <span className="text-[#ffd79a]">{s.highlight}</span>
                    </>
                  ) : null}
                </h2>
                <p className="mt-2 max-w-[46ch] text-[12px] leading-relaxed text-white/80 sm:text-[13.5px]">
                  {s.body}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={s.cta.href}
                    tabIndex={active ? 0 : -1}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-white px-4 py-2.5 text-[13px] font-bold text-[var(--color-brand-ink)] transition-transform hover:scale-[1.02]"
                  >
                    {s.cta.label}
                    <Icon name="arrow-right" size={14} />
                  </Link>
                  {s.secondary ? (
                    <Link
                      href={s.secondary.href}
                      tabIndex={active ? 0 : -1}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-white/40 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/12"
                    >
                      {s.secondary.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45 sm:flex"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45 sm:flex"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 border-t border-[var(--color-line)] bg-[var(--color-surface)] py-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-[var(--color-brand)]"
                  : "w-1.5 bg-[var(--color-line-strong)] hover:bg-[var(--color-ink-mute)]"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
