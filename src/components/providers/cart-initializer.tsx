"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart-store";

/**
 * Kicks off the cart store's initial fetch once when the app mounts. Doesn't
 * wrap children the way the old Context-based `CartProvider` did — the store
 * is a module-level singleton, so `useCart()` works from anywhere in the tree
 * without sitting under this component. This only exists because the cart
 * cookie is httpOnly: the client can't read it itself, so something has to
 * ask the server for the cart once on load.
 */
export function CartInitializer() {
  const refresh = useCartStore((state) => state.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return null;
}
