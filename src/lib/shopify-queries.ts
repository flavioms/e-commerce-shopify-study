import { shopifyClient } from "./shopify";
import type { Product, ProductDetail, ProductForSearch, ProductMediaItem } from "@/types/product";

// ---- Raw Shopify GraphQL response shapes ------------------------------------
// Private to this file. Nothing outside `shopify-queries.ts` should ever see
// these — every exported function below maps them into the domain types from
// `@/types/product` before returning, so pages/components/scripts never need
// to know about GraphQL's wire format (union __typename discrimination,
// Relay-style edges/nodes, ...).

type RawImage = {
  url: string;
  altText?: string | null;
} | null;

type RawVariant = {
  id: string;
  availableForSale: boolean;
} | null;

type RawProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: RawImage;
  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    };
  };
  selectedOrFirstAvailableVariant: RawVariant;
};

type RawMediaPreviewImage = {
  altText: string | null;
  id: string;
  url: string;
} | null;

type RawMediaNode =
  | { __typename: 'MediaImage'; id: string; previewImage: RawMediaPreviewImage }
  | {
      __typename: 'Video';
      id: string;
      previewImage: RawMediaPreviewImage;
      sources: { url: string; mimeType: string }[];
    }
  | { __typename: 'ExternalVideo'; id: string; previewImage: RawMediaPreviewImage; embedUrl: string; host: string }
  | { __typename: 'Model3d'; id: string; previewImage: RawMediaPreviewImage };

type RawProductDetailNode = RawProductNode & {
  category: { name: string } | null;
  media: { edges: { node: RawMediaNode }[] };
};

type RawProductForSearchNode = RawProductNode & {
  tags: string[];
  productType: string;
  vendor: string;
  availableForSale: boolean;
};

// ---- Adapters: raw Shopify shape -> domain type -----------------------------

function toProduct(node: RawProductNode): Product {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    price: node.priceRange.minVariantPrice,
    featuredImage: node.featuredImage
      ? { url: node.featuredImage.url, altText: node.featuredImage.altText ?? null }
      : null,
    variant: node.selectedOrFirstAvailableVariant,
  };
}

function toMediaItems(edges: { node: RawMediaNode }[]): ProductMediaItem[] {
  return edges.flatMap(({ node }): ProductMediaItem[] => {
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
}

// ---- Queries -----------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const query = `
    query Products {
      products(first: 20) {
        edges {
          node {
            id title handle description
            featuredImage { url }
            priceRange { minVariantPrice { amount currencyCode } }
            selectedOrFirstAvailableVariant { id availableForSale }
          }
        }
      }
    }`;
  const { data, errors } = await shopifyClient.request<{ products: { edges: { node: RawProductNode }[] } }>(query);
  if (errors) throw new Error('Error to search products: ' + JSON.stringify(errors));
  return (data?.products?.edges ?? []).map(({ node }) => toProduct(node));
}

/**
 * Fetches every product in the catalog (paginating past Shopify's per-page limit),
 * with the extra fields a search index needs (tags, type, vendor, availability).
 * Meant for offline/batch jobs (e.g. syncing to Algolia) — not for request-time use.
 */
export async function getAllProducts(): Promise<ProductForSearch[]> {
  const query = `
    query Products($after: String) {
      products(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id title handle description
            tags
            productType
            vendor
            availableForSale
            featuredImage { url }
            priceRange { minVariantPrice { amount currencyCode } }
            selectedOrFirstAvailableVariant { id availableForSale }
          }
        }
      }
    }`;

  type ProductsPage = {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: RawProductForSearchNode }[];
    };
  };

  const products: ProductForSearch[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables: { after: string | null } = { after };
    const { data, errors } = await shopifyClient.request<ProductsPage>(query, { variables });
    if (errors) throw new Error('Error to search all products: ' + JSON.stringify(errors));

    const edges = data?.products?.edges ?? [];
    products.push(...edges.map(({ node }) => ({
      ...toProduct(node),
      tags: node.tags,
      productType: node.productType,
      vendor: node.vendor,
      availableForSale: node.availableForSale,
    })));
    hasNextPage = data?.products?.pageInfo?.hasNextPage ?? false;
    after = data?.products?.pageInfo?.endCursor ?? null;
  }

  return products;
}

export async function getProductByHandle(handle: string): Promise<{
  product: ProductDetail | null;
  relatedProducts: Product[];
}> {
  const query = `
    query ProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        handle
        category { name }
        media(first:5) {
          edges {
            node {
              __typename
              id
              previewImage { altText id url }
              ... on Video { sources { url mimeType } }
              ... on ExternalVideo { embedUrl host }
            }
          }
        }
        featuredImage { url id altText }
        priceRange { minVariantPrice { amount currencyCode } }
        selectedOrFirstAvailableVariant { id availableForSale }
      }

     products(first: 5) {
        edges {
          node {
            id title handle description
            featuredImage { url }
            priceRange { minVariantPrice { amount currencyCode } }
            selectedOrFirstAvailableVariant { id availableForSale }
          }
        }
      }
    }`;
  const variables = { handle };
  const { data, errors } = await shopifyClient.request<{
    productByHandle: RawProductDetailNode | null;
    products: { edges: { node: RawProductNode }[] };
  }>(query, { variables });
  if (errors) throw new Error('Error to search product by handle: ' + JSON.stringify(errors));

  const rawProduct = data?.productByHandle ?? null;
  const product: ProductDetail | null = rawProduct
    ? {
        ...toProduct(rawProduct),
        category: rawProduct.category,
        media: toMediaItems(rawProduct.media.edges),
      }
    : null;

  const relatedProducts = (data?.products?.edges ?? [])
    .filter(({ node }) => node.id !== rawProduct?.id)
    .map(({ node }) => toProduct(node));

  return { product, relatedProducts };
}
