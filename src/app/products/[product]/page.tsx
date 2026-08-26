import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { getProductByHandle } from '@/lib/shopify-queries';
import { Separator } from '@/components/ui/separator';
import { ProductMediaCarousel } from '@/components/organisms/product-media-carousel';
import { ProductGrid } from '@/components/organisms/product-grid';
import { AddToCartButton } from '@/components/organisms/add-to-cart-button';
import { Price } from '@/components/atoms/price';
import type { ProductMediaItem } from '@/types/product';
import { SITE_NAME } from '@/lib/site';
import { productJsonLd } from '@/lib/json-ld';

export const revalidate = 60; // ISR

export async function generateMetadata(props: PageProps<'/products/[product]'>): Promise<Metadata> {
    const { product: handle } = await props.params;
    if (!handle) return {};

    const { product } = await getProductByHandle(handle);
    if (!product) return {};

    const description = product.description || `Shop ${product.title} at flavio-commerce.`;

    return {
        title: product.title,
        description,
        alternates: { canonical: `/products/${handle}` },
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title: product.title,
            description,
            images: product.featuredImage ? [{ url: product.featuredImage.url }] : undefined,
        },
        twitter: { card: 'summary_large_image', title: product.title, description },
    };
}

export default async function ProductDetailsPage(props: PageProps<'/products/[product]'>) {
    const { product: handle } = await props.params;

    if (!handle) {
        notFound();
    }

    const { product, relatedProducts } = await getProductByHandle(handle);

    if (!product) {
        notFound();
    }

    const galleryItems: ProductMediaItem[] = product.media.length > 0
        ? product.media
        : product.featuredImage
            ? [{ kind: 'image', id: 'featured', url: product.featuredImage.url, alt: product.title }]
            : [];

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                // Server-rendered, product data only (never user input) — safe to inline.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
            />

            <Link
                href="/products"
                className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Back to products
            </Link>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                <ProductMediaCarousel items={galleryItems} fallbackAlt={product.title} />

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        {product.category?.name && (
                            <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                                {product.category.name}
                            </span>
                        )}
                        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                            {product.title}
                        </h1>
                        <Price
                            money={product.price}
                            className="text-2xl font-semibold text-foreground"
                        />
                    </div>

                    <Separator />

                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                        {product.description || 'No description available for this product.'}
                    </p>

                    <AddToCartButton
                        variantId={product.variant?.id ?? null}
                        available={product.variant?.availableForSale ?? false}
                        size="lg"
                        className="w-full sm:w-auto"
                    />
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <Separator className="mb-10" />

                    <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-foreground">
                        Related Products
                    </h2>

                    <ProductGrid products={relatedProducts} />
                </div>
            )}
        </div>
    );
}
