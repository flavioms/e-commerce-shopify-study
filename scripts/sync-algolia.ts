// scripts/sync-algolia.ts
//
// Syncs the full Shopify product catalog into Algolia.
// Usage: npm run sync-algolia
//
// Requires (see .env.local):
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_PRIVATE_TOKEN (src/lib/shopify.ts)
//   ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY
//   ALGOLIA_INDEX_NAME (optional, defaults to "products")
//
// Uses `replaceAllObjects`, an atomic full-index replace done via a temporary
// index. That means products removed/unpublished in Shopify since the last sync
// are also removed from Algolia — a plain `saveObjects` call would leave them
// behind, silently drifting the index from the real catalog over time.

import { algoliasearch } from 'algoliasearch';

import { getAllProducts, type ProductForSync } from '../src/lib/shopify-queries';

const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? 'products';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toAlgoliaRecord(product: ProductForSync) {
  return {
    objectID: product.handle,
    title: product.title,
    handle: product.handle,
    description: product.description,
    tags: product.tags,
    productType: product.productType,
    vendor: product.vendor,
    availableForSale: product.availableForSale,
    price: Number(product.priceRange.minVariantPrice.amount),
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
    imageUrl: product.featuredImage?.url ?? null,
    variantId: product.selectedOrFirstAvailableVariant?.id ?? null,
  };
}

async function main() {
  const client = algoliasearch(requireEnv('ALGOLIA_APP_ID'), requireEnv('ALGOLIA_ADMIN_KEY'));

  console.log('Fetching products from Shopify...');
  const products = await getAllProducts();
  console.log(`Fetched ${products.length} product(s).`);

  const objects = products.map(toAlgoliaRecord);

  console.log(`Replacing "${INDEX_NAME}" in Algolia (atomic full sync)...`);
  await client.replaceAllObjects({
    indexName: INDEX_NAME,
    objects,
  });

  console.log(`Synced ${objects.length} product(s) to Algolia index "${INDEX_NAME}".`);
}

main().catch((error: unknown) => {
  console.error('Failed to sync Shopify products to Algolia:');
  console.error(error);
  process.exitCode = 1;
});
