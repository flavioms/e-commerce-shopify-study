// src/app/products/page.tsx
import type { Metadata } from 'next';

import { getProducts } from '@/lib/shopify-queries';
import { ProductGrid } from '@/components/organisms/product-grid';
import { ProductSearch } from '@/components/organisms/product-search';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 60; // ISR

const TITLE = 'All Products';
const DESCRIPTION = 'Browse the full flavio-commerce catalog.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/products' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        Products List
      </h1>

      <ProductSearch>
        <ProductGrid products={products} />
      </ProductSearch>
    </div>
  );
}
