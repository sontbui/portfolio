import type { NavLink } from "@/types";

/**
 * Site-wide configuration. Centralised so SEO, structured data, the nav, and
 * the footer all read from one place. The canonical URL falls back sensibly
 * for local builds and is overridable per deploy target via env.
 */
export const SITE = {
  name: "Son Bui Thanh",
  fullName: "Bui Thanh Son",
  role: "Software Engineer in Test · AI Automation",
  title: "Son Bui Thanh — Software Engineer in Test · AI Automation",
  description:
    "Software Engineer in Test focused on intelligent test platforms, framework architecture, and testing infrastructure that make software quality scalable across an engineering organization. Creator of an AI-powered, multi-agent test-automation platform.",
  shortDescription: "I build AI-powered automation platforms — not just automated tests.",
  location: "Ho Chi Minh City, VN",
  availability: "Open to remote worldwide",
  email: "sonbuithanh306@gmail.com",
  // `||` (not `??`) so an empty env var falls back instead of yielding "".
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sontbui.github.io").replace(/\/$/, ""),
  locale: "en_US",
  keywords: [
    "Son Bui Thanh",
    "SDET",
    "Software Engineer in Test",
    "Test Automation",
    "Playwright",
    "TypeScript",
    "AI Automation",
    "Multi-agent systems",
    "Model Context Protocol",
    "Test Platform Engineering",
    "QA Automation",
  ],
} as const;

export const SOCIALS = {
  github: "https://github.com/sontbui",
  githubHandle: "github.com/sontbui",
  linkedin: "https://www.linkedin.com/in/sontbui2783",
  email: `mailto:${SITE.email}`,
  resume: "/Son-Bui-Resume.pdf",
  ecommerceRepo: "https://github.com/sontbui/E-commerce-Platform",
} as const;

export const NAV_LINKS: readonly NavLink[] = [
  { href: "#ai-platform", label: "AI Platform" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#approach", label: "Approach" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact", cta: true },
] as const;
