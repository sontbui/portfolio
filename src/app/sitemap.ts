import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

export const dynamic = "force-static";

/**
 * Static sitemap. With `output: "export"` this is emitted as /sitemap.xml at
 * build time. Single-page site, so one canonical entry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
