import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Image pipeline.
   *
   * `unoptimized` stays on because the product art is hand-rendered SVG and
   * the banners ship pre-cropped at three widths (see public/banners). Routing
   * them through the optimiser would re-encode files that are already sized
   * for their slot, and it needs a native binary this environment lacks.
   * Formats are declared here so `next/image` still emits correct hints.
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
