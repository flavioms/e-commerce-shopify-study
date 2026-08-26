import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Kept in sync with the `robots: { index: false }` set directly on
      // these routes (checkout/layout.tsx, search/layout.tsx) — disallowing
      // the crawl here too saves crawl budget on pages that were never going
      // to be indexed anyway.
      disallow: ["/checkout", "/search"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
