import type { Metadata } from "next";
import { all } from "@/lib/db";
import { BannerForm } from "@/components/admin/BannerForm";
import { toggleBannerAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Banners" };
export const dynamic = "force-dynamic";

type Banner = {
  id: number; placement: string; title: string; subtitle: string; cta_label: string;
  cta_href: string; theme: string; sort_order: number; is_active: number;
};

export default async function BannersPage() {
  const banners = all<Banner>(`SELECT * FROM banners ORDER BY placement, sort_order`);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">Homepage banners</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
          Banner records are stored and editable here. The homepage hero layout is a fixed editorial design in
          this build, so saved banners act as a managed content queue rather than live overlays.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {banners.map((b) => (
            <article key={b.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge capitalize">{b.placement}</span>
                    <span className="badge capitalize">{b.theme}</span>
                    <span className={`badge ${b.is_active ? "badge-new" : "badge-out"}`}>{b.is_active ? "Active" : "Hidden"}</span>
                  </div>
                  <h2 className="mt-2 font-display text-lg leading-snug">{b.title}</h2>
                  <p className="text-xs text-[var(--color-ink-soft)]">{b.subtitle}</p>
                  <p className="mt-1 font-mono text-[0.625rem] text-[var(--color-ink-mute)]">
                    {b.cta_label} → {b.cta_href} · sort {b.sort_order}
                  </p>
                </div>
                <form action={toggleBannerAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="rounded border border-[var(--color-line-strong)] px-2 py-1 text-[0.625rem] hover:border-[var(--color-ink)]">
                    {b.is_active ? "Hide" : "Show"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4">
            <h2 className="font-display text-lg">Add banner</h2>
            <BannerForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
