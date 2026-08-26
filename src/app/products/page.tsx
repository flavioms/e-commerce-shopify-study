// src/app/products/page.tsx
import type { Metadata } from 'next';

import { getProducts } from '@/lib/shopify-queries';
import { ProductCard } from '@/components/product-card';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse the full flavio-commerce catalog.',
};

export default async function ProductsPage() {
  const data = await getProducts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        Products List
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map(({ node }) => (
          <ProductCard
            key={node.id}
            title={node.title}
            description={node.description}
            price={node.priceRange.minVariantPrice}
            imageUrl={node.featuredImage?.url ?? '/file.svg'}
            imageAlt={node.title}
            detailsHref={`/products/${node.handle}`}
            variantId={node.selectedOrFirstAvailableVariant?.id ?? null}
            available={node.selectedOrFirstAvailableVariant?.availableForSale ?? false}
          />
        ))}
      </div>
    </div>
  );
}
