import { liteClient } from "algoliasearch/lite";

// Client-side (browser) search only — must use the search-only key, never the
// admin key used by scripts/sync-algolia.ts. `liteClient` is Algolia's
// bundle-optimized client meant specifically for InstantSearch integrations.
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

if (!appId || !searchKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_ALGOLIA_APP_ID or NEXT_PUBLIC_ALGOLIA_SEARCH_KEY environment variable.",
  );
}

export const searchClient = liteClient(appId, searchKey);
export const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "products";
