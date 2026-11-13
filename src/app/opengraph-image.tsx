import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SUPER Z SHOP — everyday essentials, delivered across Bangladesh";

/**
 * Default social card for every page that does not set its own. Generated at
 * build time by Satori, so there is no binary to keep in the repo.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #12359d 0%, #1b4fd8 55%, #3d74f2 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 16,
              background: "#ffffff",
              color: "#1b4fd8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            SZ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: 2 }}>{BRAND.name}</span>
            <span style={{ fontSize: 17, opacity: 0.75 }}>{BRAND.tagline}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Satori ignores <br/>, so each line is its own flex row. The taka
              sign has no glyph in the bundled font, so prices read "BDT". */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5 }}>
              Everyday essentials,
            </span>
            <span style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, color: "#ffd79a" }}>
              delivered to your door.
            </span>
          </div>
          <span style={{ fontSize: 24, opacity: 0.86 }}>
            225 products · 15 categories · cash on delivery in all 64 districts
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 19 }}>
          {["Free delivery over BDT 2,500", "7-day replacement*", "Dhaka-based support"].map((t) => (
            <span
              key={t}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
