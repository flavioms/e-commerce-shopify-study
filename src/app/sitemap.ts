import type { MetadataRoute } from "next";

import { getProducts } from "@/lib/shopify-queries";
import { getAllPages } from "@/lib/contentstack-queries";
import { SITE_URL } from "@/lib/site";

// Static, indexable routes. /checkout and /search are intentionally excluded —
// both are marked `robots: { index: false }` at the route level (checkout is
// a dead end for crawlers, and /search is a client-rendered duplicate of
// /products with no stable canonical query).
const STATIC_ROUTES = ["", "/products", "/contact", "/faq"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, pages] = await Promise.all([getProducts(), getAllPages()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.handle}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Contentstack pages opt out of indexing individually via seo.enable_search_indexing
  // (same flag [slug]/page.tsx honors for `robots`) — keep the sitemap consistent
  // with what's actually allowed to be indexed.
  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.seo?.enable_search_indexing !== false)
    .map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updated_at,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [...staticEntries, ...productEntries, ...pageEntries];
}
