import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      // No Contentful asset domain here: home-page images are stored as plain
      // { url, title } JSON pointing straight at Shopify's CDN (see
      // scripts/sync-contentful-home.ts) rather than re-uploaded into
      // Contentful's own asset library.
    ],
  },
};

export default nextConfig;
