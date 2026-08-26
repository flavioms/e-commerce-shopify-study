"use client";

import type { ReactNode } from "react";
import { InstantSearch, SearchBox, Hits, useSearchBox, useHits } from "react-instantsearch";
import type { Hit } from "instantsearch.js";

import { searchClient, ALGOLIA_INDEX_NAME } from "@/lib/algolia-client";
import { ProductCard } from "@/components/organisms/product-card";
import { PRODUCT_GRID_CLASSNAME } from "@/components/organisms/product-grid";
import { EmptyState } from "@/components/atoms/empty-state";
import type { Product } from "@/types/product";

// Algolia's own flat record shape — this data source's external representation,
// distinct from the domain `Product`. `hitToProduct()` below is its adapter.
export type ProductHit = {
  objectID: string;
  title: string;
  description: string;
  price: number;
  currencyCode: string;
  imageUrl: string | null;
  variantId: string | null;
  availableForSale: boolean;
  handle: string;
};

function hitToProduct(hit: Hit<ProductHit>): Product {
  return {
    id: hit.objectID,
    title: hit.title,
    handle: hit.handle,
    description: hit.description,
    price: { amount: hit.price, currencyCode: hit.currencyCode },
    featuredImage: hit.imageUrl ? { url: hit.imageUrl, altText: hit.title } : null,
    variant: hit.variantId ? { id: hit.variantId, availableForSale: hit.availableForSale } : null,
  };
}

function ProductHitCard({ hit }: { hit: Hit<ProductHit> }) {
  return <ProductCard product={hitToProduct(hit)} />;
}

function ProductHits() {
  return (
    <Hits<ProductHit>
      hitComponent={ProductHitCard}
      classNames={{ list: PRODUCT_GRID_CLASSNAME }}
    />
  );
}

const SEARCH_BOX_CLASS_NAMES = {
  root: "mb-8",
  form: "relative",
  input:
    "h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  submit: "absolute left-0 top-0 flex h-10 w-9 items-center justify-center text-muted-foreground",
  submitIcon: "size-4",
  reset: "absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-muted-foreground hover:text-foreground",
  resetIcon: "size-4",
  loadingIndicator: "absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-muted-foreground",
  loadingIcon: "size-4 animate-spin",
};

/**
 * While the box is empty, `fallback` (the page's own default listing) is shown.
 * Once the visitor types, Algolia-powered results replace it — and if `fallback`
 * isn't provided, Algolia's results are shown even for an empty query (its default
 * "no query" behavior is to return the whole catalog, ranked by nothing but
 * popularity/attributes — used by the dedicated /search page to browse everything).
 */
function SearchOrFallback({ fallback }: { fallback?: ReactNode }) {
  const { query } = useSearchBox();
  const { items } = useHits<ProductHit>();

  if (!query.trim() && fallback) {
    return <>{fallback}</>;
  }

  if (items.length === 0) {
    return <EmptyState className="py-16">No products matched your search.</EmptyState>;
  }

  return <ProductHits />;
}

export interface ProductSearchProps {
  /** The page's own default product listing, shown while the search box is empty. */
  children?: ReactNode;
  autoFocus?: boolean;
}

export function ProductSearch({ children, autoFocus = false }: ProductSearchProps) {
  return (
    <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
      <SearchBox placeholder="Search products…" autoFocus={autoFocus} classNames={SEARCH_BOX_CLASS_NAMES} />
      <SearchOrFallback fallback={children} />
    </InstantSearch>
  );
}
