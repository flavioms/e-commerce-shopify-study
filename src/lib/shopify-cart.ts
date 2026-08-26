import { shopifyClient } from "./shopify";

type Money = {
  amount: string;
  currencyCode: string;
}

type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
  };
  merchandise: {
    id: string;
    title: string;
    image: {
      url: string;
      altText: string | null;
    } | null;
    price: Money;
    product: {
      id: string;
      title: string;
      handle: string;
    };
  };
}

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  note: string | null;
  buyerIdentity: {
    email: string | null;
    phone: string | null;
  };
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: {
    edges: { node: CartLine }[];
  };
}

type CartUserError = {
  code: string | null;
  field: string[] | null;
  message: string;
}

export type CartLineInput = {
  merchandiseId: string;
  quantity?: number;
}

type CartLineUpdateInput = {
  id: string;
  quantity?: number;
  merchandiseId?: string;
}

type CartBuyerIdentityInput = {
  email?: string;
  phone?: string;
  countryCode?: string;
}

type CartMutationPayload = {
  cart: Cart | null;
  userErrors: CartUserError[];
}

// Shared field selection so every operation below returns the same Cart shape.
const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    buyerIdentity {
      email
      phone
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount { amount currencyCode }
            amountPerQuantity { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image { url altText }
              price { amount currencyCode }
              product { id title handle }
            }
          }
        }
      }
    }
  }
`;

function assertNoUserErrors(context: string, userErrors: CartUserError[]) {
  if (userErrors.length > 0) {
    throw new Error(`${context}: ` + userErrors.map((error) => error.message).join(', '));
  }
}

/**
 * Creates a new cart, optionally pre-populated with lines.
 * https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate
 */
export async function createCart(lines: CartLineInput[] = []) {
  const query = `
    mutation CartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart { ...CartFragment }
        userErrors { code field message }
      }
    }
    ${CART_FRAGMENT}`;
  const variables = { input: lines.length > 0 ? { lines } : {} };
  const { data, errors } = await shopifyClient.request<{ cartCreate: CartMutationPayload }>(query, { variables });
  if (errors) throw new Error('Error to create cart: ' + JSON.stringify(errors));
  assertNoUserErrors('Error to create cart', data?.cartCreate.userErrors ?? []);
  return data?.cartCreate.cart ?? null;
}

/**
 * Fetches an existing cart by id.
 * https://shopify.dev/docs/api/storefront/latest/queries/cart
 */
export async function getCart(cartId: string) {
  const query = `
    query CartQuery($cartId: ID!) {
      cart(id: $cartId) { ...CartFragment }
    }
    ${CART_FRAGMENT}`;
  const variables = { cartId };
  const { data, errors } = await shopifyClient.request<{ cart: Cart | null }>(query, { variables });
  if (errors) throw new Error('Error to fetch cart: ' + JSON.stringify(errors));
  return data?.cart ?? null;
}

/**
 * Adds one or more lines (products/variants) to an existing cart.
 * https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesAdd
 */
export async function addCartLines(cartId: string, lines: CartLineInput[]) {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFragment }
        userErrors { code field message }
      }
    }
    ${CART_FRAGMENT}`;
  const variables = { cartId, lines };
  const { data, errors } = await shopifyClient.request<{ cartLinesAdd: CartMutationPayload }>(query, { variables });
  if (errors) throw new Error('Error to add cart lines: ' + JSON.stringify(errors));
  assertNoUserErrors('Error to add cart lines', data?.cartLinesAdd.userErrors ?? []);
  return data?.cartLinesAdd.cart ?? null;
}

/**
 * Adds lines to a cart, creating the cart first if `cartId` is `null`
 * (e.g. the buyer's first "Add to cart" of the session).
 */
export async function addToCart(cartId: string | null, lines: CartLineInput[]) {
  if (!cartId) return createCart(lines);
  return addCartLines(cartId, lines);
}

/**
 * Removes lines from a cart by their line ids.
 * https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesRemove
 */
export async function removeCartLines(cartId: string, lineIds: string[]) {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFragment }
        userErrors { code field message }
      }
    }
    ${CART_FRAGMENT}`;
  const variables = { cartId, lineIds };
  const { data, errors } = await shopifyClient.request<{ cartLinesRemove: CartMutationPayload }>(query, { variables });
  if (errors) throw new Error('Error to remove cart lines: ' + JSON.stringify(errors));
  assertNoUserErrors('Error to remove cart lines', data?.cartLinesRemove.userErrors ?? []);
  return data?.cartLinesRemove.cart ?? null;
}

/**
 * Updates existing lines (quantity and/or merchandise) in a cart.
 * https://shopify.dev/docs/api/storefront/latest/mutations/cartLinesUpdate
 */
export async function updateCartLines(cartId: string, lines: CartLineUpdateInput[]) {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFragment }
        userErrors { code field message }
      }
    }
    ${CART_FRAGMENT}`;
  const variables = { cartId, lines };
  const { data, errors } = await shopifyClient.request<{ cartLinesUpdate: CartMutationPayload }>(query, { variables });
  if (errors) throw new Error('Error to update cart lines: ' + JSON.stringify(errors));
  assertNoUserErrors('Error to update cart lines', data?.cartLinesUpdate.userErrors ?? []);
  return data?.cartLinesUpdate.cart ?? null;
}

/** Convenience wrapper around {@link updateCartLines} for the common "change quantity" case. */
export async function updateCartLineQuantity(cartId: string, lineId: string, quantity: number) {
  return updateCartLines(cartId, [{ id: lineId, quantity }]);
}

/**
 * Updates buyer information (email, phone, country) attached to the cart.
 * https://shopify.dev/docs/api/storefront/latest/mutations/cartBuyerIdentityUpdate
 */
export async function updateCartBuyerIdentity(cartId: string, buyerIdentity: CartBuyerIdentityInput) {
  const query = `
    mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart { ...CartFragment }
        userErrors { code field message }
      }
    }
    ${CART_FRAGMENT}`;
  const variables = { cartId, buyerIdentity };
  const { data, errors } = await shopifyClient.request<{ cartBuyerIdentityUpdate: CartMutationPayload }>(query, { variables });
  if (errors) throw new Error('Error to update cart buyer identity: ' + JSON.stringify(errors));
  assertNoUserErrors('Error to update cart buyer identity', data?.cartBuyerIdentityUpdate.userErrors ?? []);
  return data?.cartBuyerIdentityUpdate.cart ?? null;
}

/**
 * Updates the free-text note attached to the cart (e.g. delivery instructions).
 * https://shopify.dev/docs/api/storefront/latest/mutations/cartNoteUpdate
 */
export async function updateCartNote(cartId: string, note: string) {
  const query = `
    mutation CartNoteUpdate($cartId: ID!, $note: String!) {
      cartNoteUpdate(cartId: $cartId, note: $note) {
        cart { ...CartFragment }
        userErrors { code field message }
      }
    }
    ${CART_FRAGMENT}`;
  const variables = { cartId, note };
  const { data, errors } = await shopifyClient.request<{ cartNoteUpdate: CartMutationPayload }>(query, { variables });
  if (errors) throw new Error('Error to update cart note: ' + JSON.stringify(errors));
  assertNoUserErrors('Error to update cart note', data?.cartNoteUpdate.userErrors ?? []);
  return data?.cartNoteUpdate.cart ?? null;
}

/**
 * Returns the URL to redirect the buyer to in order to complete checkout.
 * Lighter than {@link getCart} when only the redirect target is needed.
 */
export async function getCartCheckoutUrl(cartId: string) {
  const query = `
    query CartCheckoutUrl($cartId: ID!) {
      cart(id: $cartId) { id checkoutUrl }
    }`;
  const variables = { cartId };
  const { data, errors } = await shopifyClient.request<{ cart: { id: string; checkoutUrl: string } | null }>(query, { variables });
  if (errors) throw new Error('Error to fetch checkout URL: ' + JSON.stringify(errors));
  return data?.cart?.checkoutUrl ?? null;
}
