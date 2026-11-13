import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * The storefront is indexable; the admin area, checkout, cart, account and
 * order pages are not — they are private or duplicate content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/checkout", "/cart", "/account", "/order/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
