import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

export const dynamic = "force-static";

/** Web app manifest (emitted as /manifest.webmanifest at build time). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
