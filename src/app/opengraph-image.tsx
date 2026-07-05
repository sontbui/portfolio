import { ImageResponse } from "next/og";

import { SITE } from "@/constants/site";

/**
 * Build-time Open Graph image (1200×630). Generated statically so no runtime
 * is required — works on Vercel and static hosts alike. Also serves as the
 * Twitter card image (Next reuses it when no twitter-image is defined).
 */
export const dynamic = "force-static";
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#18181b",
              border: "1px solid #3f3f46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            S
          </div>
          <div style={{ fontSize: 26, color: "#a1a1aa" }}>{SITE.role}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 92, fontWeight: 700, color: "#fff", letterSpacing: "-0.04em" }}>
            {SITE.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#a78bfa",
              maxWidth: 960,
              lineHeight: 1.25,
            }}
          >
            I build AI-powered automation platforms — not just automated tests.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Playwright", "TypeScript", "Multi-Agent AI", "MCP"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 22,
                color: "#93c5fd",
                border: "1px solid rgba(59,130,246,0.3)",
                background: "rgba(59,130,246,0.08)",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
