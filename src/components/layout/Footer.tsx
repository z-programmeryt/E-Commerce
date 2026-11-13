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
  { href: "/pages/faq", label: "FAQ" },
];

const companyLinks = [
  { href: "/pages/about-us", label: "About us" },
  { href: "/pages/contact-us", label: "Contact us" },
  { href: "/order/track", label: "Track your order" },
  { href: "/pages/business-research", label: "Business research (workbook)" },
  { href: "/admin/login", label: "Admin demo" },
];

export function Footer() {
  const categories = listCategories().slice(0, 8);
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-[var(--color-paper-2)]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg tracking-[0.14em]">SUPER Z SHOP</p>
          <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-ink-mute)]">{BRAND.tagline}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ink-soft)]">
            A Bangladesh-first online shop for everyday essentials — clothing, jewellery, watches, bags, small tech and gifting.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {(["facebook", "instagram", "youtube", "tiktok", "whatsapp"] as const).map((s) => (
              <a
                key={s}
                href={BRAND.social[s as keyof typeof BRAND.social] ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-white text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
              >
                <Icon name={s} size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-[var(--color-ink-soft)]">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-[var(--color-ink)] hover:underline hover:underline-offset-2">
                  {c.name}
                </Link>
              </li>
            ))}
            <li><Link href="/shop" className="font-semibold hover:underline">All 15 categories →</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">Help & policies</p>
          <ul className="space-y-2 text-sm text-[var(--color-ink-soft)]">
            {policyLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-[var(--color-ink)] hover:underline hover:underline-offset-2">{l.label}</Link></li>
            ))}
          </ul>
          <p className="eyebrow mb-3 mt-6">Company</p>
          <ul className="space-y-2 text-sm text-[var(--color-ink-soft)]">
            {companyLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-[var(--color-ink)] hover:underline hover:underline-offset-2">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">Stay in touch</p>
          <p className="mb-3 text-sm text-[var(--color-ink-soft)]">
            Join the newsletter for new arrivals. Demo form — stored locally, no emails are sent.
          </p>
          <NewsletterForm />

          <div className="mt-6 space-y-2 text-sm text-[var(--color-ink-soft)]">
            <p className="flex items-start gap-2"><Icon name="phone" size={15} className="mt-0.5 shrink-0" /> {BRAND.phone}</p>
            <p className="flex items-start gap-2"><Icon name="mail" size={15} className="mt-0.5 shrink-0" /> {BRAND.email}</p>
            <p className="flex items-start gap-2"><Icon name="pin" size={15} className="mt-0.5 shrink-0" /> {BRAND.address}</p>
            <p className="flex items-start gap-2"><Icon name="truck" size={15} className="mt-0.5 shrink-0" /> Delivery via Pathao · Steadfast · RedX</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="container-page flex flex-col gap-3 py-5 text-[0.6875rem] text-[var(--color-ink-mute)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SUPER Z SHOP · Dhaka, Bangladesh. Local demonstration build.</p>
          <p className="max-w-xl md:text-right">
            No real payments are processed and no courier bookings are made. Prices are unverified demo estimates.
          </p>
        </div>
      </div>
    </footer>
  );
}
