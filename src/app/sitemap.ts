import type { MetadataRoute } from "next";
import { all } from "@/lib/db";
import { PAGES } from "@/lib/content";
import { COLLECTIONS } from "@/lib/collections";
import { absolute } from "@/lib/seo";

/**
 * Full sitemap: every product, category, collection and policy page, with
 * real lastModified dates where the database has them.
 */
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absolute("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absolute("/new-arrivals"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absolute("/best-sellers"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/offers"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absolute("/order/track"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absolute("/pages/contact-us"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // categories have no updated_at column — the catalogue is seeded as a unit,
  // so the build time is the honest lastModified for them.
  const categories = all<{ slug: string }>(
    `SELECT slug FROM categories ORDER BY sort_order`,
  ).map<MetadataRoute.Sitemap[number]>((c) => ({
    url: absolute(`/category/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const products = all<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY id`,
  ).map<MetadataRoute.Sitemap[number]>((p) => ({
    url: absolute(`/product/${p.slug}`),
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collections = COLLECTIONS.map<MetadataRoute.Sitemap[number]>((c) => ({
    url: absolute(`/collections/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const pages = PAGES.map<MetadataRoute.Sitemap[number]>((p) => ({
    url: absolute(`/pages/${p.slug}`),
    lastModified: now,
    changeFrequency: "yearly",
    priority: p.slug === "faq" ? 0.6 : 0.4,
  }));

  return [...staticRoutes, ...categories, ...products, ...collections, ...pages];
}
