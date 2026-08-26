"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CountBadge } from "@/components/atoms/count-badge";
import { EmptyState } from "@/components/atoms/empty-state";
import { CartLineItem } from "@/components/organisms/cart-line-item";
import { formatMoney } from "@/lib/currency";
import { useCart } from "@/lib/cart-store";

export function CartDrawer() {
  const { cart, isLoading } = useCart();
  const [open, setOpen] = useState(false);

  const lines = cart?.lines.edges ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;
  const hasItems = !isLoading && totalQuantity > 0;
  const formattedTotal = cart?.cost.totalAmount ? formatMoney(cart.cost.totalAmount) : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <span className="relative">
          <ShoppingCart className="size-5" />
          {hasItems && <CountBadge count={totalQuantity} />}
        </span>
        <span>Cart</span>
        {hasItems && formattedTotal && <span className="text-muted-foreground">{formattedTotal}</span>}
      </Button>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <EmptyState>{isLoading ? "Loading cart..." : "Your cart is empty."}</EmptyState>
          ) : (
            <ul className="flex flex-col gap-4 pb-4">
              {lines.map(({ node: line }) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">
                {formatMoney(cart.cost.subtotalAmount)}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full"
              render={<Link href="/checkout" onClick={() => setOpen(false)} />}
            >
              Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
