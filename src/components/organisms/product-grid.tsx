import { ProductCard } from "@/components/organisms/product-card";
import type { Product } from "@/types/product";

// Shared with product-search.tsx's Algolia `Hits` results list, so the two
// grids (Shopify-sourced and Algolia-sourced) never drift apart visually.
export const PRODUCT_GRID_CLASSNAME = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

export interface ProductGridProps {
  products: Product[];
}

/**
 * Renders a responsive grid of ProductCards from a list of domain products.
 * Extracted because /products and the related-products section on the product
 * detail page were both hand-rolling this same list.map(...) block.
 */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className={PRODUCT_GRID_CLASSNAME}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
