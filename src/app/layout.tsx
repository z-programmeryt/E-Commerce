import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerBridge } from "@/components/layout/ServiceWorkerBridge";
import { BRAND } from "@/lib/brand";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: BRAND.name,
  title: {
    default: `${BRAND.name} — ${BRAND.tagline} | Cash on delivery in Bangladesh`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "SUPER Z SHOP is a Bangladesh-based online store for everyday essentials — fashion, jewellery, watches, bags, tech accessories and gifting. 225 products, cash on delivery to all 64 districts, free delivery over ৳2,500.",
  keywords: [
    "online shopping Bangladesh",
    "SUPER Z SHOP",
    "cash on delivery Bangladesh",
    "Dhaka online store",
    "panjabi",
    "jewellery Bangladesh",
    "wristwatch Bangladesh",
    "gift shop Dhaka",
    "free delivery Dhaka",
  ],
  authors: [{ name: BRAND.name, url: siteUrl() }],
  creator: BRAND.name,
  publisher: BRAND.name,
  category: "shopping",
  alternates: {
    canonical: "/",
    languages: { "en-BD": "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: BRAND.name,
    url: siteUrl(),
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Fashion, jewellery, watches, bags, tech and gifting — 225 products, cash on delivery in all 64 districts.",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "SUPER Z SHOP — everyday essentials, delivered across Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "Everyday essentials, cash on delivery across Bangladesh.",
    images: ["/og/home.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b4fd8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Runs before first paint: applies a stored theme choice so a dark-mode
 * visitor never sees a white flash. Kept inline and tiny on purpose — it has
 * to execute before the first pixel, which rules out a React effect.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('szs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

/** Store-level structured data, printed once in the root layout. */
const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: BRAND.name,
  url: siteUrl(),
  description:
    "Bangladesh online store for fashion, jewellery, watches, bags, tech accessories and gifting. Cash on delivery nationwide.",
  currenciesAccepted: "BDT",
  paymentAccepted: "Cash on delivery",
  areaServed: { "@type": "Country", name: "Bangladesh" },
  address: {
    "@type": "PostalAddress",
    streetAddress: BRAND.address,
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  email: BRAND.email,
  telephone: BRAND.phone,
  openingHours: "Sa-Th 10:00-19:00",
  sameAs: [BRAND.social.facebook, BRAND.social.instagram, BRAND.social.youtube],
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl()}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-BD" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <link rel="preconnect" href={siteUrl()} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <ServiceWorkerBridge />
        <Header />
        {/* pb on mobile clears the fixed bottom tab bar */}
        <main id="main" className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
