import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { getCurrentCart } from "@/lib/cart-actions";
import type { Cart } from "@/lib/shopify-cart";

type CartState = {
  cart: Cart | null;
  isLoading: boolean;
  /** Re-fetches the cart from the server (e.g. after a mutation elsewhere in the tree). */
  refresh: () => void;
  /** Applies a cart a mutation already returned, skipping an extra round-trip. */
  setCart: (cart: Cart | null) => void;
};

/**
 * The cart lives in a module-level Zustand store instead of React Context, so
 * any client component can read it directly — no `<CartProvider>` wrapping the
 * tree, and no "must be used within a CartProvider" to guard against. See
 * `CartInitializer` for where the initial fetch gets kicked off.
 */
export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: true,
  refresh: () => {
    // No synchronous set() here: every update happens inside a promise
    // callback, so `refresh` stays safe to call directly from an effect
    // (mount, or after a mutation) without tripping React's set-state-in-
    // render rules.
    getCurrentCart()
      .then((cart) => set({ cart }))
      .catch(() => set({ cart: null }))
      .finally(() => set({ isLoading: false }));
  },
  setCart: (cart) => set({ cart }),
}));

/**
 * Convenience hook for components that need multiple fields at once — mirrors
 * the old `useCart()` Context API. `useShallow` keeps the returned object from
 * causing a re-render just because it's a new literal each call; only an
 * actual change to one of these fields does. Components that only care about
 * one slice (e.g. just `cart`) can skip this and call `useCartStore(s => s.cart)`
 * directly for an even narrower subscription.
 */
export function useCart() {
  return useCartStore(
    useShallow((state) => ({
      cart: state.cart,
      isLoading: state.isLoading,
      refresh: state.refresh,
      setCart: state.setCart,
    })),
  );
}
