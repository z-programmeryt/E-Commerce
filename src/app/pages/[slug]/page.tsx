import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage, PAGES } from "@/lib/content";
import { Alert } from "@/components/EmptyState";
import { BRAND } from "@/lib/brand";
import { ContactForm } from "@/components/forms/ContactForm";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return { title: "Page not found" };
  return { title: page.title, description: page.description };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <div className="container-page pb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[12px] text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:text-[var(--color-brand-deep)] hover:underline">Home</Link>
        <Icon name="chevron-right" size={11} className="text-[var(--color-line-strong)]" />
        <span className="text-[var(--color-ink-soft)]" aria-current="page">{page.title}</span>
      </nav>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
        <article className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
          <div className="border-b border-[var(--color-line)] px-3 py-3">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-brand-deep)]">{page.eyebrow}</p>
            <h1 className="mt-0.5 text-[19px] font-bold leading-tight text-[var(--color-ink)]">{page.title}</h1>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">{page.description}</p>
            <p className="mt-1 text-[11px] text-[var(--color-ink-mute)]">Last updated {page.updated}</p>
          </div>

          <div className="p-3 md:p-4">
            {page.notice ? (
              <div className="mb-4">
                <Alert tone="warn">{page.notice}</Alert>
              </div>
            ) : null}

            <div className="prose-shop">
              {page.sections.map((sct) => (
                <section key={sct.heading}>
                  <h2>{sct.heading}</h2>
                  {sct.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {sct.list ? (
                    <ul>
                      {sct.list.map((li, i) => (
                        <li key={i}>{li}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {slug === "contact-us" ? (
              <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
                <div className="section-bar">
                  <h2 className="section-bar-title">Send a message</h2>
                  <span className="text-[11px] text-[var(--color-ink-mute)]">Demo only — no email is sent</span>
                </div>
                <div className="p-3">
                  <ContactForm />
                </div>
              </div>
            ) : null}

            <div className="mt-5 border-t border-[var(--color-line)] pt-3 text-[12px]">
              <p className="text-[var(--color-ink-mute)]">
                Still need help? Call {BRAND.phone} or email {BRAND.email} — {BRAND.supportHours}.
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-2">
                <Link href="/order/track" className="font-semibold text-[var(--color-brand-deep)] hover:underline">
                  Track an order
                </Link>
                <span className="text-[var(--color-line-strong)]">·</span>
                <Link href="/pages/faq" className="font-semibold text-[var(--color-brand-deep)] hover:underline">
                  Read the FAQ
                </Link>
              </p>
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-[132px] lg:self-start">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="section-bar">
              <h2 className="section-bar-title">Help &amp; policies</h2>
            </div>
            <ul className="divide-y divide-[var(--color-line)]">
              {PAGES.map((pg) => (
                <li key={pg.slug}>
                  <Link
                    href={`/pages/${pg.slug}`}
                    className={`block px-3 py-1.5 text-[11.5px] leading-snug hover:bg-[#fffbf7] ${
                      pg.slug === slug
                        ? "border-l-2 border-[var(--color-brand)] bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-deep)]"
                        : "text-[var(--color-ink-soft)]"
                    }`}
                    aria-current={pg.slug === slug ? "page" : undefined}
                  >
                    {pg.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
