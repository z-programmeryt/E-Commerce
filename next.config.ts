/**
 * Build directly into `.next/standalone`.
 *
 * Why this exists: a deployment of this project was serving its `public/`
 * files but answering 404 to every Next.js route, which means Vercel had no
 * server entrypoint to hand a request to. Building in standalone mode emits a
 * self-contained server (`.next/standalone/server.js`) plus a minimal
 * `package.json`, so the platform always has an explicit, framework-independent
 * entrypoint — no reliance on how a preset happens to infer one.
 *
 * Only applied when VERCEL is set, so local `npm run build` / `npm start`
 * behave exactly as before.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(process.env.VERCEL ? { output: "standalone" as const } : {}),
  /**
   * Image pipeline.
   *
   * `unoptimized` stays on because the product photography and banners ship
   * pre-sized (see public/products and public/banners). Routing them through
   * the optimiser would re-encode files that are already sized for their slot,
   * and it needs a native binary this environment lacks. Formats are declared
   * here so `next/image` still emits correct hints.
   */
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
  },
  experimental: {
    optimizePackageImports: ["@/components/ui/Icon"],
  },
  async headers() {
    return [
      {
        // The service worker must never be cached by the browser, or a new
        // deploy can serve a stale offline shell indefinitely.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/banners/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;
