import Script from "next/script";

import { analyticsConfig } from "@/lib/analytics";

/**
 * Loads whichever analytics providers are configured via env vars.
 * Nothing loads unless a provider is explicitly enabled — no IDs are baked in,
 * keeping the default build privacy-friendly and dependency-free.
 *
 * Vercel Analytics is intentionally left as an opt-in comment to avoid adding a
 * hard dependency; enable it by installing `@vercel/analytics` and rendering
 * <VercelAnalytics /> when NEXT_PUBLIC_VERCEL_ANALYTICS=1.
 */
export function Analytics() {
  const { gaId, plausibleDomain } = analyticsConfig;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {plausibleDomain ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
