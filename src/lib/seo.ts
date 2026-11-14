import { BRAND } from "@/lib/brand";

/**
 * Absolute site URL, resolved once. Set NEXT_PUBLIC_SITE_URL in production —
 * canonical URLs, the sitemap and Open Graph images all depend on it being
 * the real domain rather than localhost.
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absolute(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trim a description to a length search engines actually show. */
export function metaDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : cut.length)}…`;
}

/**
 * Schema.org BreadcrumbList for a trail of {name, path}.
 * Google renders this as the breadcrumb in results instead of a raw URL.
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absolute(c.path),
    })),
  };
}

/** Organization / store node reused by page-level graphs. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: BRAND.name,
    url: siteUrl(),
    email: BRAND.email,
    telephone: BRAND.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.address,
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
  };
}
