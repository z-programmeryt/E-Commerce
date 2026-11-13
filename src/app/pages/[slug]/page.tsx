import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage, PAGES } from "@/lib/content";
import { Alert } from "@/components/EmptyState";
import { BRAND } from "@/lib/brand";
import { ContactForm } from "@/components/forms/ContactForm";

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
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--color-ink-mute)]">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink)]">{page.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article className="max-w-3xl">
          <p className="eyebrow mb-2">{page.eyebrow}</p>
          <h1 className="font-display text-[1.9rem] leading-tight md:text-[2.35rem]">{page.title}</h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-ink-soft)]">{page.description}</p>
          <p className="mt-2 text-xs text-[var(--color-ink-mute)]">Last updated {page.updated}</p>

          {page.notice ? (
            <div className="mt-6">
              <Alert tone="warn">{page.notice}</Alert>
            </div>
          ) : null}

          <div className="prose-shop mt-8">
            {page.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.list ? (
                  <ul>
                    {s.list.map((li, i) => (
                      <li key={i}>{li}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {slug === "contact-us" ? (
            <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5">
              <h2 className="font-display text-xl">Send a message</h2>
              <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
                Stored in the local database. Demo only — no email is sent.
              </p>
              <div className="mt-4">
                <ContactForm />
              </div>
            </div>
          ) : null}

          <div className="mt-10 border-t border-[var(--color-line)] pt-6 text-sm">
            <p className="text-[var(--color-ink-mute)]">
              Still need help? Call {BRAND.phone} or email {BRAND.email} — {BRAND.supportHours}.
            </p>
            <p className="mt-2">
              <Link href="/order/track" className="link-underline font-semibold">Track an order</Link>
              <span className="mx-2 text-[var(--color-line-strong)]">·</span>
              <Link href="/pages/faq" className="link-underline font-semibold">Read the FAQ</Link>
            </p>
          </div>
        </article>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-4">
            <p className="eyebrow mb-2">Pages</p>
            <ul className="space-y-1.5 text-xs">
              {PAGES.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/pages/${p.slug}`}
                    className={p.slug === slug ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-ink-soft)] hover:underline"}
                    aria-current={p.slug === slug ? "page" : undefined}
                  >
                    {p.title}
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
