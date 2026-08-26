"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartLineItem } from "@/components/organisms/cart-line-item";
import { formatMoney } from "@/lib/currency";
import { useCart } from "@/components/providers/cart-provider";
import { updateBuyerEmailAction, type CartActionState } from "@/lib/cart-actions";

const initialEmailState: CartActionState = { status: "idle" };

export default function CheckoutPage() {
  const { cart, isLoading, refresh } = useCart();
  const [emailState, emailAction, isEmailPending] = useActionState(
    updateBuyerEmailAction,
    initialEmailState,
  );

  // Keep the cart in context (and any other place reading buyerIdentity) up to date
  // once the email mutation resolves.
  useEffect(() => {
    if (emailState.status === "success") refresh();
  }, [emailState, refresh]);

  const lines = cart?.lines.edges ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        Loading checkout...
      </div>
    );
  }

  if (!cart || lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Your cart is empty
        </h1>
        <p className="text-sm text-muted-foreground">Add some products before checking out.</p>
        <Button render={<Link href="/products" />}>Browse products</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Continue shopping
      </Link>

      <h1 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col gap-4">
          {lines.map(({ node: line }) => (
            <CartLineItem key={line.id} line={line} />
          ))}
        </ul>

        <div className="flex h-fit flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-base font-semibold text-foreground">Contact</h2>
            <p className="text-xs text-muted-foreground">
              We&apos;ll use this to pre-fill your Shopify checkout.
            </p>
            <form action={emailAction} className="flex flex-col gap-2">
              <input
                type="email"
                name="email"
                required
                defaultValue={cart.buyerIdentity.email ?? ""}
                placeholder="you@example.com"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" variant="outline" size="sm" disabled={isEmailPending}>
                {isEmailPending ? "Saving..." : "Save email"}
              </Button>
              {emailState.status === "success" && (
                <p className="text-xs text-muted-foreground">Email saved.</p>
              )}
              {emailState.status === "error" && (
                <p role="alert" className="text-xs text-destructive">
                  {emailState.message}
                </p>
              )}
            </form>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatMoney(cart.cost.subtotalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatMoney(cart.cost.totalAmount)}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" render={<a href={cart.checkoutUrl} />}>
            Proceed to checkout
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You&apos;ll enter shipping and payment on Shopify&apos;s secure checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
