"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddToCartButton } from "@/components/organisms/add-to-cart-button";
import { Price } from "@/components/atoms/price";
import type { Product } from "@/types/product";

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-full w-full max-w-sm">
      <Image
        src={product.featuredImage?.url ?? "/file.svg"}
        alt={product.featuredImage?.altText ?? product.title}
        width={400}
        height={400}
        className="aspect-square w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
      />

      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <Price money={product.price} className="text-base font-semibold text-foreground" />
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="flex-1"
          render={<Link href={`/products/${product.handle}`} />}
        >
          Details
        </Button>
        <AddToCartButton
          variantId={product.variant?.id ?? null}
          available={product.variant?.availableForSale ?? false}
          className="flex-1"
        />
      </CardFooter>
    </Card>
  );
}
