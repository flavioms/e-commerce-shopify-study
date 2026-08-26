import { shopifyClient } from "./shopify";

type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: {
    url: string
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    }
  }
  selectedOrFirstAvailableVariant: {
    id: string;
    availableForSale: boolean;
  } | null;
}

type MediaPreviewImage = {
  altText: string | null;
  id: string;
  url: string;
} | null;

type MediaImageNode = {
  __typename: 'MediaImage';
  id: string;
  previewImage: MediaPreviewImage;
};

type VideoNode = {
  __typename: 'Video';
  id: string;
  previewImage: MediaPreviewImage;
  sources: {
    url: string;
    mimeType: string;
  }[];
};

type ExternalVideoNode = {
  __typename: 'ExternalVideo';
  id: string;
  previewImage: MediaPreviewImage;
  embedUrl: string;
  host: string;
};

type Model3dNode = {
  __typename: 'Model3d';
  id: string;
  previewImage: MediaPreviewImage;
};

export type ProductMediaNode = MediaImageNode | VideoNode | ExternalVideoNode | Model3dNode;

type ProductByHandle = Product & {
  category: {
    name: string;
  } | null;
  media: {
    edges: {
      node: ProductMediaNode;
    }[]
  }
}

export async function getProducts() {
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
  const { data, errors } = await shopifyClient.request<{ products: { edges: { node: Product }[] } }>(query);
  if (errors) throw new Error('Error to search products: ' + JSON.stringify(errors));
  return data?.products?.edges ?? [];
}

export async function getProductByHandle(handle: string) {
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
  const { data, errors } = await shopifyClient.request<{ productByHandle: ProductByHandle | null, products: { edges: { node: Product }[] } }>(query, { variables });
  if (errors) throw new Error('Error to search product by handle: ' + JSON.stringify(errors));
  return {
    product: data?.productByHandle ?? null,
    products: data?.products?.edges.filter(({ node }) => node.id !== data?.productByHandle?.id) ?? [],
  };
}
