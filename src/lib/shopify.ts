import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const shopifyClient = createStorefrontApiClient({
  storeDomain: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}`,
  apiVersion: '2026-07',
  privateAccessToken: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN!,
});