'use server';

import { cookies } from 'next/headers';

import {
  addToCart,
  getCart,
  removeCartLines,
  updateCartBuyerIdentity,
  updateCartLineQuantity,
  type Cart,
} from '@/lib/shopify-cart';

const CART_COOKIE_NAME = 'cartId';
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CartActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

/** @deprecated use {@link CartActionState} — kept as an alias so existing imports keep working. */
export type AddToCartState = CartActionState;

async function getCartIdFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
}

/** Reads the cart tied to the current visitor's cookie. Safe to call from Client Components. */
export async function getCurrentCart(): Promise<Cart | null> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return null;
  return getCart(cartId);
}

/** Sets a line's quantity (removing it if `quantity` drops below 1). Returns the updated cart. */
export async function setCartLineQuantityAction(lineId: string, quantity: number): Promise<Cart | null> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return null;

  if (quantity < 1) {
    return removeCartLines(cartId, [lineId]);
  }
  return updateCartLineQuantity(cartId, lineId, quantity);
}

/** Removes a line from the cart. Returns the updated cart. */
export async function removeCartLineAction(lineId: string): Promise<Cart | null> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return null;
  return removeCartLines(cartId, [lineId]);
}

/** Saves the buyer's email on the cart (shown pre-filled on Shopify's hosted checkout). */
export async function updateBuyerEmailAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const email = formData.get('email');

  if (typeof email !== 'string' || !email) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return { status: 'error', message: 'Your cart is empty.' };
  }

  try {
    await updateCartBuyerIdentity(cartId, { email });
    return { status: 'success' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to save email.',
    };
  }
}

export async function addToCartAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const merchandiseId = formData.get('merchandiseId');
  const quantity = Number(formData.get('quantity') ?? 1);

  if (typeof merchandiseId !== 'string' || !merchandiseId) {
    return { status: 'error', message: 'This product is unavailable right now.' };
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return { status: 'error', message: 'Invalid quantity.' };
  }

  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE_NAME)?.value ?? null;

    const cart = await addToCart(cartId, [{ merchandiseId, quantity }]);

    if (cart && cart.id !== cartId) {
      cookieStore.set(CART_COOKIE_NAME, cart.id, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: CART_COOKIE_MAX_AGE,
      });
    }

    return { status: 'success' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to add product to cart.',
    };
  }
}
