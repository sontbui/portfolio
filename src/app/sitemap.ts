import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

export const dynamic = "force-static";

/**
 * Static sitemap, emitted as /sitemap.xml at build time: the single-page
 * home plus the Beacon case-study route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/work/beacon`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
