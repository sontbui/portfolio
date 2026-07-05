import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

// Required for these metadata routes under `output: "export"`.
export const dynamic = "force-static";

/**
 * Static robots.txt (emitted at build time under static export). Allows all
 * crawlers and points them to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
