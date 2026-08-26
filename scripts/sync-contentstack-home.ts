// scripts/sync-contentstack-home.ts
//
// Updates the Contentstack "home" singleton entry with real data from the
// Shopify catalog: hero, featured categories, and promo banner all reference
// real products - real title/description/price-derived copy, and a real
// product photo re-uploaded as a Contentstack asset (Contentstack's image
// fields reference assets in its own library, they can't point at an
// arbitrary external URL) - then publishes the entry so the Delivery API
// (and the home page) picks it up.
//
// Usage: npm run sync-contentstack-home
//
// Requires (see .env.local):
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_PRIVATE_TOKEN
//   CONTENTSTACK_API_KEY / CONTENTSTACK_MANAGEMENT_TOKEN (read/write on the stack -
//     the CONTENTSTACK_DELIVERY_TOKEN used by the app is read-only and won't work here)

import { getAllProducts, type ProductForSync } from '../src/lib/shopify-queries';
import { formatMoney } from '../src/lib/currency';
import { cma, cmaHeaders, CMA_BASE_URL, ENVIRONMENT, LOCALE } from './lib/contentstack-cma';

const CONTENT_TYPE_UID = 'home';
const FEATURED_COUNT = 3;

type ContentstackAsset = { uid: string; url: string; title: string };

/** Downloads a product's featured image from Shopify's CDN and re-uploads it as a Contentstack asset. */
async function uploadProductImage(product: ProductForSync): Promise<ContentstackAsset> {
  const featuredImage = product.featuredImage;
  if (!featuredImage) throw new Error(`Product "${product.title}" has no featured image.`);

  const imageRes = await fetch(featuredImage.url);
  if (!imageRes.ok) {
    throw new Error(`Failed to download image for "${product.title}": ${imageRes.status}`);
  }
  const blob = await imageRes.blob();
  const filename = featuredImage.url.split('/').pop()?.split('?')[0] || `${product.handle}.jpg`;

  const form = new FormData();
  form.append('asset[upload]', blob, filename);
  form.append('asset[title]', product.title);

  const res = await fetch(`${CMA_BASE_URL}/assets`, { method: 'POST', headers: cmaHeaders(), body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(`Failed to upload asset for "${product.title}": ${JSON.stringify(body)}`);
  const asset = body.asset as ContentstackAsset;

  // A new asset isn't visible via the Delivery API (and so wouldn't render on the home
  // page) until it's published too - publishing the entry alone isn't enough.
  await cma(`/assets/${asset.uid}/publish`, {
    method: 'POST',
    body: JSON.stringify({ asset: { environments: [ENVIRONMENT], locales: [LOCALE] } }),
  });

  return asset;
}

/** Picks up to `count` products, preferring distinct product types, then filling with whatever's left. */
function pickDiverse(products: ProductForSync[], count: number): ProductForSync[] {
  const picked: ProductForSync[] = [];
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

function productPrice(product: ProductForSync) {
  return formatMoney(product.priceRange.minVariantPrice, 'en-US');
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

  console.log('Uploading product photos to Contentstack...');
  const heroAsset = await uploadProductImage(hero);
  const featuredAssets = await Promise.all(featured.map(uploadProductImage));
  const promoAsset = await uploadProductImage(promo);

  console.log(`Fetching current "${CONTENT_TYPE_UID}" entry...`);
  const { entries } = await cma<{ entries: { uid: string; title: string }[] }>(
    `/content_types/${CONTENT_TYPE_UID}/entries`,
  );
  const entry = entries[0];
  if (!entry) throw new Error(`No "${CONTENT_TYPE_UID}" entry found in Contentstack.`);

  const updatedFields = {
    title: entry.title,
    hero: {
      heading: hero.title,
      subheading: hero.description.trim() || `Starting at ${productPrice(hero)}`,
      // Contentstack `file` fields take the asset uid directly (a plain string),
      // not `{ uid }` like reference fields - confirmed against the live API.
      image: heroAsset.uid,
      cta_label: 'Shop now',
      cta_link: `/products/${hero.handle}`,
    },
    featured_categories: featured.map((product, index) => ({
      instances: {
        name: product.title,
        image: featuredAssets[index].uid,
        link: `/products/${product.handle}`,
      },
    })),
    promo_banner: {
      heading: promo.title,
      body: promo.description.trim() || `${promo.productType || 'Featured'} · ${productPrice(promo)}`,
      image: promoAsset.uid,
      cta_label: 'Explore',
      cta_link: `/products/${promo.handle}`,
    },
  };

  console.log(`Updating entry ${entry.uid}...`);
  await cma(`/content_types/${CONTENT_TYPE_UID}/entries/${entry.uid}`, {
    method: 'PUT',
    body: JSON.stringify({ entry: updatedFields }),
  });

  console.log(`Publishing entry ${entry.uid} to "${ENVIRONMENT}"...`);
  await cma(`/content_types/${CONTENT_TYPE_UID}/entries/${entry.uid}/publish`, {
    method: 'POST',
    body: JSON.stringify({ entry: { environments: [ENVIRONMENT], locales: [LOCALE] } }),
  });

  console.log('Done. The home page now reflects real Shopify product data.');
}

main().catch((error: unknown) => {
  console.error('Failed to sync Contentstack home with real product data:');
  console.error(error);
  process.exitCode = 1;
});
