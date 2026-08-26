"use client";

import { useActionState, useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { addToCartAction, type AddToCartState } from "@/lib/cart-actions";
import { useCart } from "@/lib/cart-store";
import type { VariantProps } from "class-variance-authority";

const initialState: AddToCartState = { status: "idle" };

export interface AddToCartButtonProps {
  variantId: string | null;
  available?: boolean;
  quantity?: number;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
}

export function AddToCartButton({
  variantId,
  available = true,
  quantity = 1,
  className,
  size,
}: AddToCartButtonProps) {
  const [state, formAction, isPending] = useActionState(addToCartAction, initialState);
  const { refresh: refreshCart } = useCart();

  // Flip on immediately when a fresh `state` comes back from the action, without an
  // effect: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [handledState, setHandledState] = useState(state);
  const [justAdded, setJustAdded] = useState(false);
  if (state !== handledState) {
    setHandledState(state);
    setJustAdded(state.status === "success");
  }

  // The timer is a real external system, so clearing the flag after a delay belongs in an effect.
  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  // Let the header badge know the cart changed. This is subscribing to an external
  // update (the action result) and reacting via a callback, so it belongs in an effect.
  useEffect(() => {
    if (state.status === "success") refreshCart();
  }, [state, refreshCart]);

  const canAddToCart = Boolean(variantId) && available;

  return (
    // `contents` keeps the <form> out of the layout tree so `className` (e.g. flex-1,
    // w-full sm:w-auto) sizes this wrapper exactly like a plain <Button> would.
    <form action={formAction} className="contents">
      <div className={className}>
        <input type="hidden" name="merchandiseId" value={variantId ?? ""} />
        <input type="hidden" name="quantity" value={quantity} />

        <Button type="submit" size={size} className="w-full" disabled={!canAddToCart || isPending}>
          <ShoppingCart />
          {isPending ? "Adding..." : justAdded ? "Added" : !available ? "Sold out" : "Add to cart"}
        </Button>

        {state.status === "error" && (
          <p role="alert" className="mt-1.5 text-xs text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
