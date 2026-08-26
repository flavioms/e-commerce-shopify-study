"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { removeCartLineAction, setCartLineQuantityAction } from "@/lib/cart-actions";
import type { Cart } from "@/lib/shopify-cart";
import { formatMoney } from "@/lib/currency";

type CartLine = Cart["lines"]["edges"][number]["node"];

export function CartLineItem({ line }: { line: CartLine }) {
  const { setCart } = useCart();
  const [pending, setPending] = useState(false);

  async function handleQuantityChange(quantity: number) {
    setPending(true);
    const updated = await setCartLineQuantityAction(line.id, quantity);
    setCart(updated);
    setPending(false);
  }

  async function handleRemove() {
    setPending(true);
    const updated = await removeCartLineAction(line.id);
    setCart(updated);
    setPending(false);
  }

  return (
    <li className="flex gap-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
        {line.merchandise.image && (
          <Image
            src={line.merchandise.image.url}
            alt={line.merchandise.image.altText ?? line.merchandise.title}
            width={64}
            height={64}
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{line.merchandise.product.title}</p>
        {line.merchandise.title !== "Default Title" && (
          <p className="text-xs text-muted-foreground">{line.merchandise.title}</p>
        )}
        <p className="text-sm font-semibold text-foreground">{formatMoney(line.cost.totalAmount)}</p>

        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => handleQuantityChange(line.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => handleQuantityChange(line.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            onClick={handleRemove}
            aria-label="Remove item"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  );
}
