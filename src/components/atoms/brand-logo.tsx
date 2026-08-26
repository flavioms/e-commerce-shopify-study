import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  name: string;
  /** @default "lg" */
  size?: "sm" | "lg";
  className?: string;
}

/** The brand mark + name, linking home — shared by the header and footer. */
export function BrandLogo({ name, size = "lg", className }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-heading font-semibold tracking-tight text-foreground",
        size === "lg" ? "text-lg" : "text-base",
        className,
      )}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {name}
    </Link>
  );
}
