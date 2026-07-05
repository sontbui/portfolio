/**
 * Provider-agnostic analytics facade.
 *
 * No IDs are hard-coded. Providers activate only when their env var is present:
 *   - NEXT_PUBLIC_GA_ID          → Google Analytics 4
 *   - NEXT_PUBLIC_PLAUSIBLE_DOMAIN → Plausible
 *   - NEXT_PUBLIC_VERCEL_ANALYTICS=1 → Vercel Analytics (loaded in layout)
 *
 * This keeps the site privacy-friendly by default and lets any deploy target
 * opt in without code changes.
 */

export const analyticsConfig = {
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  vercelEnabled: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1",
} as const;

export const isAnalyticsEnabled =
  Boolean(analyticsConfig.gaId) ||
  Boolean(analyticsConfig.plausibleDomain) ||
  analyticsConfig.vercelEnabled;

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: EventParams }) => void;
  }
}

/**
 * Track a custom event across whichever providers are configured.
 * Safe to call unconditionally — it no-ops when nothing is enabled or on SSR.
 */
export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;

  if (analyticsConfig.gaId && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
  if (analyticsConfig.plausibleDomain && typeof window.plausible === "function") {
    window.plausible(name, params ? { props: params } : undefined);
  }
}
