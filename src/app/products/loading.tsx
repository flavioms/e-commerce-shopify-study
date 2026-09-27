import { PRODUCT_GRID_CLASSNAME } from "@/components/organisms/product-grid";

/**
 * Streamed in immediately on navigation to /products, while getProducts() and
 * the Contentful-backed header/footer resolve — without this, the browser
 * shows a blank tab until every fetch on the page finishes.
 */
export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mb-8 h-10 w-full animate-pulse rounded-lg bg-muted" />

      <div className={PRODUCT_GRID_CLASSNAME}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
