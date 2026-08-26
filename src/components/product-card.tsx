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
import { Price } from "@/components/price";
import type { Money } from "@/lib/currency";

export interface ProductCardProps {
  title: string;
  description: string;
  price: Money;
  imageUrl: string;
  imageAlt?: string;
  detailsHref: string;
}

export function ProductCard({
  title,
  description,
  price,
  imageUrl,
  imageAlt = title,
  detailsHref,
}: ProductCardProps) {
  return (
    <Card className="h-full w-full max-w-sm">
      <Image
        src={imageUrl}
        alt={imageAlt}
        width={400}
        height={400}
        className="aspect-square w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
      />

      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <Price money={price} className="text-base font-semibold text-foreground" />
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="w-full"
          render={<Link href={detailsHref} />}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}
