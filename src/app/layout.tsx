import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BRAND } from "@/lib/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "SUPER Z SHOP is a Bangladesh-based online store for premium everyday essentials — fashion, jewellery, watches, bags, tech accessories and gifting. Cash on delivery nationwide.",
  keywords: ["SUPER Z SHOP", "online shopping Bangladesh", "Dhaka fashion store", "jewellery Bangladesh", "cash on delivery"],
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "Premium everyday essentials, priced for Bangladesh and delivered nationwide.",
  },
  robots: { index: false, follow: false }, // local demo build
};

export const viewport: Viewport = {
  themeColor: "#1d1c1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
