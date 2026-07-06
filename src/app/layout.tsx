import type { Metadata, Viewport } from "next";

import { Analytics } from "@/components/layout/analytics";
import { DataFlowBackground } from "@/components/background/data-flow-background";
import { AssistantLauncher } from "@/components/assistant/assistant-launcher";
import { StructuredData } from "@/components/layout/structured-data";
import { SITE } from "@/constants/site";
import { geistSans, jetBrainsMono } from "@/app/fonts";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.fullName, url: SITE.url }],
  creator: SITE.fullName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.title,
    title: SITE.title,
    description: SITE.description,
    // Open Graph / Twitter images are auto-wired from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${jetBrainsMono.variable}`}>
      <body className="antialiased">
        <a href="#main" className="sr-only-focusable">
          Skip to content
        </a>
        {/* Ambient distributed-system graph behind all content (z-index -1). */}
        <DataFlowBackground />
        {children}
        <AssistantLauncher />
        <StructuredData />
        <Analytics />
      </body>
    </html>
  );
}
