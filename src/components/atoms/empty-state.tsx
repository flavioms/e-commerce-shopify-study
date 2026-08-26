import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

/** A centered, muted one-line message — "cart is empty", "no results", etc. */
export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <p className={cn("py-10 text-center text-sm text-muted-foreground", className)}>{children}</p>
  );
}
