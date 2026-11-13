import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { listCategories } from "@/lib/repo";
import { Icon } from "@/components/ui/Icon";
import { NewsletterForm } from "./NewsletterForm";

const policyLinks = [
  { href: "/pages/shipping-delivery-policy", label: "Shipping & delivery" },
  { href: "/pages/return-refund-policy", label: "Return & refund" },
  { href: "/pages/privacy-policy", label: "Privacy policy" },
  { href: "/pages/terms-conditions", label: "Terms & conditions" },
  { href: "/pages/faq", label: "Help & FAQ" },
];

const companyLinks = [
  { href: "/pages/about-us", label: "About SUPER Z SHOP" },
  { href: "/pages/contact-us", label: "Contact customer care" },
  { href: "/order/track", label: "Track your order" },
  { href: "/pages/business-research", label: "Business research" },
  { href: "/admin/login", label: "Seller Centre (demo admin)" },
];

export function Footer() {
  const categories = listCategories().slice(0, 8);
  return (
    <footer className="mt-4 border-t border-[var(--color-line)] bg-white">
      {/* payment / service strip — marketplace footer convention */}
      <div className="border-b border-[var(--color-line)]">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-[12px] font-semibold text-[var(--color-ink-soft)]">Payment method</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-[var(--color-line-strong)] bg-[#fafafa] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-ink-soft)]">
              Cash on Delivery
            </span>
            <span className="rounded border border-[var(--color-line-strong)] bg-[#fafafa] px-2 py-0.5 text-[11px] text-[var(--color-ink-mute)]">
              bKash
            </span>
            <span className="rounded border border-[var(--color-line-strong)] bg-[#fafafa] px-2 py-0.5 text-[11px] text-[var(--color-ink-mute)]">
              Nagad
            </span>
            <span className="text-[10.5px] text-[var(--color-ink-mute)]">
              (bKash / Nagad shown for reference — not enabled in this demo)
            </span>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[17px] font-extrabold tracking-tight text-[var(--color-brand-deep)]">
            SUPER<span className="text-[var(--color-ink)]">Z</span> SHOP
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-ink-mute)]">{BRAND.tagline}</p>
          <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
            A Bangladesh-first online shop for everyday essentials — clothing, jewellery, watches, bags,
            small tech and gifting. Cash on delivery across all 64 districts.
          </p>
          <dl className="mt-3 space-y-1 text-[11.5px] text-[var(--color-ink-soft)]">
            <div className="flex items-start gap-1.5">
              <dt className="sr-only">Address</dt>
              <Icon name="pin" size={12} className="mt-0.5 shrink-0 text-[var(--color-brand-deep)]" />
              <dd>{BRAND.address}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Phone</dt>
              <Icon name="phone" size={12} className="shrink-0 text-[var(--color-brand-deep)]" />
              <dd>{BRAND.phone}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Hours</dt>
              <Icon name="clock" size={12} className="shrink-0 text-[var(--color-brand-deep)]" />
              <dd>{BRAND.supportHours}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center gap-1.5">
            {(["facebook", "instagram", "youtube", "tiktok", "whatsapp"] as const).map((s) => (
              <a
                key={s}
                href={BRAND.social[s as keyof typeof BRAND.social] ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
              >
                <Icon name={s} size={13} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)]">Shop</p>
          <ul className="space-y-1.5 text-[12px] text-[var(--color-ink-soft)]">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-[var(--color-brand-deep)] hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop" className="font-semibold hover:underline">
                All 15 categories →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
            Customer service
          </p>
          <ul className="space-y-1.5 text-[12px] text-[var(--color-ink-soft)]">
            {policyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-[var(--color-brand-deep)] hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)]">Company</p>
          <ul className="space-y-1.5 text-[12px] text-[var(--color-ink-soft)]">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-[var(--color-brand-deep)] hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
            Get the deals first
          </p>
          <p className="mb-2 text-[12px] text-[var(--color-ink-soft)]">
            One short email a month. Demo subscription — stored in the local database only.
          </p>
          <NewsletterForm />
          <p className="mt-2 text-[11px] text-[var(--color-ink-mute)]">
            Prefer WhatsApp? {BRAND.phone} · {BRAND.supportHours}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3 text-[11px] text-[var(--color-ink-mute)]">
          <p>© {new Date().getFullYear()} SUPER Z SHOP. Demo storefront — no real payments are processed.</p>
          <p className="flex items-center gap-2">
            <span className="rounded bg-[var(--color-brand-soft)] px-1.5 py-0.5 font-semibold text-[var(--color-brand-ink)]">
              Demo build
            </span>
            <span>All prices unverified pending supplier quotes</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
