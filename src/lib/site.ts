// Central place for the site's canonical public URL. Everything that needs an
// absolute URL — metadataBase (so relative OG images/canonicals resolve),
// sitemap.ts, robots.ts, and JSON-LD — reads from here instead of hardcoding
// or re-deriving it, so there's one spot to update per environment.
//
// Falls back to localhost so `next build`/`next dev` work without the env var
// set, but NEXT_PUBLIC_SITE_URL should always be set in real deployments —
// see .env.example.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "flavio-commerce";
