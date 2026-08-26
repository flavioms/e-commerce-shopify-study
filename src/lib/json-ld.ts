import type { ProductDetail } from "@/types/product";
import { SITE_URL } from "@/lib/site";

/**
 * Builds a schema.org Product record for a product detail page. This is what
 * lets Google show price/availability directly in the search result (a "rich
 * snippet") instead of a generic blue link — without it, a product page reads
 * to a crawler exactly like any other page of text.
 *
 * Returns a plain object, not a string — render it via
 * `JSON.stringify(productJsonLd(...))` inside a `<script type="application/ld+json">`.
 */
export function productJsonLd(product: ProductDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: product.featuredImage ? [product.featuredImage.url] : undefined,
    category: product.category?.name || undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.handle}`,
      priceCurrency: product.price.currencyCode,
      price: product.price.amount,
      availability: product.variant?.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
