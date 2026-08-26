"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getCurrentCart } from "@/lib/cart-actions";
import type { Cart } from "@/lib/shopify-cart";

type CartContextValue = {
  cart: Cart | null;
  isLoading: boolean;
  /** Re-fetches the cart from the server (e.g. after a mutation elsewhere in the tree). */
  refresh: () => void;
  /** Applies a cart a mutation already returned, skipping an extra round-trip. */
  setCart: (cart: Cart | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // No synchronous setState here: every update happens inside a promise callback,
  // so `refresh` stays safe to call directly from an effect (mount, or after a mutation).
  const refresh = useCallback(() => {
    getCurrentCart()
      .then(setCart)
      .catch(() => setCart(null))
      .finally(() => setIsLoading(false));
  }, []);

  // Cart cookie is httpOnly, so the client only learns its contents by asking the server.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ cart, isLoading, refresh, setCart }),
    [cart, isLoading, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
