import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { getProductByHandle } from '@/lib/shopify-queries';
import { Separator } from '@/components/ui/separator';
import { ProductMediaCarousel, type ProductMediaItem } from '@/components/product-media-carousel';
import { ProductCard } from '@/components/product-card';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Price } from '@/components/price';

export const revalidate = 60; // ISR

export default async function ProductDetailsPage(props: PageProps<'/products/[product]'>) {
    const { product: handle } = await props.params;

    if (!handle) {
        notFound();
    }

    const { product, products } = await getProductByHandle(handle);

    if (!product) {
        notFound();
    }

    const mediaItems: ProductMediaItem[] = product.media.edges.flatMap(({ node }): ProductMediaItem[] => {
        if (node.__typename === 'Video') {
            return [{
                kind: 'video',
                id: node.id,
                alt: node.previewImage?.altText ?? null,
                previewUrl: node.previewImage?.url ?? null,
                sources: node.sources,
            }];
        }

        if (node.__typename === 'ExternalVideo') {
            return [{
                kind: 'external-video',
                id: node.id,
                alt: node.previewImage?.altText ?? null,
                embedUrl: node.embedUrl,
            }];
        }

        // MediaImage and Model3d are shown using their preview image.
        if (!node.previewImage) return [];
        return [{
            kind: 'image',
            id: node.id,
            url: node.previewImage.url,
            alt: node.previewImage.altText,
        }];
    });

    const galleryItems: ProductMediaItem[] = mediaItems.length > 0
        ? mediaItems
        : product.featuredImage
            ? [{ kind: 'image', id: 'featured', url: product.featuredImage.url, alt: product.title }]
            : [];

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
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
                            money={product.priceRange.minVariantPrice}
                            className="text-2xl font-semibold text-foreground"
                        />
                    </div>

                    <Separator />

                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                        {product.description || 'No description available for this product.'}
                    </p>

                    <AddToCartButton
                        variantId={product.selectedOrFirstAvailableVariant?.id ?? null}
                        available={product.selectedOrFirstAvailableVariant?.availableForSale ?? false}
                        size="lg"
                        className="w-full sm:w-auto"
                    />
                </div>
            </div>

            {products.length > 0 && (
                <div className="mt-16">
                    <Separator className="mb-10" />

                    <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-foreground">
                        Related Products
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(({ node }) => (
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
            )}
        </div>
    );
}
