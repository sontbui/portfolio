import localFont from "next/font/local";

/**
 * Self-hosted fonts (Geist + JetBrains Mono), vendored under ./fonts as woff2.
 * Self-hosting removes the render-blocking request to Google Fonts, improves
 * LCP, keeps builds reproducible offline, and avoids a third-party dependency.
 * Exposed as CSS variables consumed by the design tokens in globals.css.
 */

export const geistSans = localFont({
  variable: "--font-geist",
  display: "swap",
  fallback: ["Inter", "system-ui", "sans-serif"],
  src: [
    { path: "./fonts/geist-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/geist-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/geist-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/geist-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const jetBrainsMono = localFont({
  variable: "--font-mono-code",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  src: [
    { path: "./fonts/jetbrains-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/jetbrains-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/jetbrains-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});
