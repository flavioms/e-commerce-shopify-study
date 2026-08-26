import type { Money } from "@/lib/currency";

export type { Money };

export type ProductImage = {
  url: string;
  altText: string | null;
};

export type ProductVariant = {
  id: string;
  availableForSale: boolean;
};

export type ProductCategory = {
  name: string;
};

export type ProductMediaItem =
  | { kind: "image"; id: string; url: string; alt: string | null }
  | {
      kind: "video";
      id: string;
      alt: string | null;
      previewUrl: string | null;
      sources: { url: string; mimeType: string }[];
    }
  | { kind: "external-video"; id: string; alt: string | null; embedUrl: string };

/**
 * The canonical product shape — the "core" of the onion. Every data source
 * (Shopify GraphQL, Algolia search hits, ...) has its own small adapter that
 * maps its raw external shape into this one at the boundary — see
 * `toProduct()` in `src/lib/shopify-queries.ts` and `hitToProduct()` in
 * `product-search.tsx` — so nothing *outside* those adapters (pages,
 * components, other scripts) ever needs to know about GraphQL response
 * shapes, Relay-style edges/nodes, or Algolia's flat record format. Add a
 * field here once and every consumer picks it up; there's nowhere else that
 * should be redefining "what a product looks like".
 */
export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: Money;
  featuredImage: ProductImage | null;
  variant: ProductVariant | null;
};

/** The richer shape needed by the product detail page: category + full media gallery. */
export type ProductDetail = Product & {
  category: ProductCategory | null;
  media: ProductMediaItem[];
};

/** Extra fields a search index needs on top of the base Product — used by the Algolia sync script. */
export type ProductForSearch = Product & {
  tags: string[];
  productType: string;
  vendor: string;
  availableForSale: boolean;
};
