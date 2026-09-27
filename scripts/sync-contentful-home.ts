// scripts/sync-contentful-home.ts
//
// Updates the Contentful `home` singleton entry with real data from the
// Shopify catalog: hero, featured categories, and promo banner all reference
// real products — real title/description/price-derived copy, and the
// product's own Shopify-hosted photo (Contentful's Object fields can hold any
// JSON, including a plain `{ url, title }` pointing at an external image, so
// unlike Contentstack's asset-library-only image fields there's no need to
// re-upload the photo into the CMS's own storage) — then publishes the entry
// so the Delivery API (and the home page) picks it up.
//
// Usage: npm run sync-contentful-home
//
// Requires (see .env.local):
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_PRIVATE_TOKEN
//   CONTENTFUL_SPACE_ID / CONTENTFUL_MANAGEMENT_TOKEN (read/write on the space —
//     the CONTENTFUL_DELIVERY_TOKEN used by the app is read-only and won't work here)

import { getAllProducts } from '../src/lib/shopify-queries';
import type { ProductForSearch } from '../src/types/product';
import { formatMoney } from '../src/lib/currency';
import { upsertSingleton } from './lib/contentful-management';

const FEATURED_COUNT = 3;

function toImageField(product: ProductForSearch) {
  const featuredImage = product.featuredImage;
  if (!featuredImage) throw new Error(`Product "${product.title}" has no featured image.`);
  return { url: featuredImage.url, title: product.title };
}

/** Picks up to `count` products, preferring distinct product types, then filling with whatever's left. */
function pickDiverse(products: ProductForSearch[], count: number): ProductForSearch[] {
  const picked: ProductForSearch[] = [];
  const seenTypes = new Set<string>();

  for (const product of products) {
    if (picked.length >= count) break;
    if (product.productType && seenTypes.has(product.productType)) continue;
    seenTypes.add(product.productType);
    picked.push(product);
  }
  for (const product of products) {
    if (picked.length >= count) break;
    if (!picked.includes(product)) picked.push(product);
  }

  return picked;
}

function productPrice(product: ProductForSearch) {
  return formatMoney(product.price, 'en-US');
}

async function main() {
  console.log('Fetching products from Shopify...');
  const allProducts = await getAllProducts();
  const eligible = allProducts.filter((product) => product.availableForSale && product.featuredImage);
  if (eligible.length === 0) {
    throw new Error('No available products with images found to feature on the home page.');
  }

  // Hero: prefer a product with real description copy; featured/promo: diverse,
  // non-overlapping picks from what's left.
  const hero = eligible.find((product) => product.description.trim().length > 0) ?? eligible[0];
  const remainingAfterHero = eligible.filter((product) => product.id !== hero.id);
  const featured = pickDiverse(remainingAfterHero, FEATURED_COUNT);
  const usedIds = new Set([hero.id, ...featured.map((product) => product.id)]);
  const promo = remainingAfterHero.find((product) => !usedIds.has(product.id)) ?? remainingAfterHero[0] ?? hero;

  console.log(`Hero: ${hero.title}`);
  console.log(`Featured: ${featured.map((product) => product.title).join(', ')}`);
  console.log(`Promo: ${promo.title}`);

  console.log('Updating "home" entry...');
  await upsertSingleton('home', {
    title: 'Home',
    hero: {
      heading: hero.title,
      subheading: hero.description.trim() || `Starting at ${productPrice(hero)}`,
      image: toImageField(hero),
      cta_label: 'Shop now',
      cta_link: `/products/${hero.handle}`,
    },
    featured_categories: featured.map((product) => ({
      name: product.title,
      image: toImageField(product),
      link: `/products/${product.handle}`,
    })),
    promo_banner: {
      heading: promo.title,
      body: promo.description.trim() || `${promo.productType || 'Featured'} · ${productPrice(promo)}`,
      image: toImageField(promo),
      cta_label: 'Explore',
      cta_link: `/products/${promo.handle}`,
    },
    seo: {
      meta_title: 'flavio-commerce — Performance apparel and gear',
      meta_description: `Shop ${hero.title} and more — thoughtfully made products, delivered to your door.`,
      keywords: [hero.productType, promo.productType, 'apparel', 'gear'].filter(Boolean).join(', '),
      enable_search_indexing: true,
    },
  });

  console.log('Done. The home page now reflects real Shopify product data.');
}

main().catch((error: unknown) => {
  console.error('Failed to sync Contentful home with real product data:');
  console.error(error);
  process.exitCode = 1;
});
