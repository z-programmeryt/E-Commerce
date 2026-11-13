"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export type GalleryShot = {
  src: string;
  label: string;
  caption: string;
};

/**
 * Product image gallery.
 *
 * The catalogue has one rendered studio illustration per SKU, so the gallery
 * shows that image at three honest framings — full product, detail crop, and
 * the scale/reference view — rather than pretending there are supplier photos
 * from different angles. Each frame is labelled with what it actually is.
 *
 * Interaction: thumbnails, arrow keys, and horizontal swipe on touch. No
 * auto-rotation: a shopper inspecting a product should not have it change
 * under them.
 */
export function ProductGallery({
  shots,
  name,
  discount,
}: {
  shots: GalleryShot[];
  name: string;
  discount: number | null;
}) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const current = shots[Math.min(active, shots.length - 1)];

  const go = (n: number) => setActive(((n % shots.length) + shots.length) % shots.length);

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-media)]"
        tabIndex={0}
        role="group"
        aria-label={`${name} — image ${active + 1} of ${shots.length}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(active + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(active - 1);
          }
        }}
        onTouchStart={(e) => {
          touchStart.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.src}
          src={current.src}
          alt={`${name} — ${current.caption}`}
          width={800}
          height={800}
          className="aspect-square w-full object-contain"
        />
        {discount ? <span className="tile-discount text-[12px]">-{discount}%</span> : null}

        {shots.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)]/90 text-[var(--color-ink-soft)] shadow-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              <Icon name="chevron-left" size={15} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)]/90 text-[var(--color-ink-soft)] shadow-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              <Icon name="chevron-right" size={15} />
            </button>
          </>
        ) : null}
      </div>

      <div className="mt-2 flex gap-1.5" role="tablist" aria-label="Product images">
        {shots.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={s.label}
            onClick={() => setActive(i)}
            className={`h-12 w-12 overflow-hidden rounded-sm border-2 bg-[var(--color-media)] transition-colors ${
              i === active
                ? "border-[var(--color-brand)]"
                : "border-[var(--color-line)] hover:border-[var(--color-line-strong)]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" className="h-full w-full object-contain" style={{ objectPosition: s.label === "Detail" ? "center" : "center" }} />
          </button>
        ))}
      </div>

      <p className="mt-2 flex items-start gap-1 text-[11px] sm:text-[10.5px] leading-snug text-[var(--color-ink-mute)]">
        <Icon name="alert" size={11} className="mt-0.5 shrink-0" />
        Placeholder studio illustration — not a supplier photograph. No verified product photography has been sourced
        for this SKU yet.
      </p>
    </div>
  );
}
