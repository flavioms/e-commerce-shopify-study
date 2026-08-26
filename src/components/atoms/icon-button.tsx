"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";

export interface IconButtonProps extends Omit<ComponentProps<typeof Button>, "size" | "children"> {
  /** The icon to render (a lucide-react element, sized by the button itself). */
  icon: ReactNode;
  /** Required — becomes the button's accessible name, since there's no visible text. */
  label: string;
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg";
}

/**
 * A square button that renders only an icon. Used anywhere a `<Button
 * size="icon*">{icon}</Button>` pattern would otherwise be repeated (carousel
 * arrows, quantity steppers, header/footer icon links, ...) — centralizes the
 * icon sizing and, more importantly, makes the `aria-label` mandatory instead
 * of something each call site has to remember on its own.
 */
export function IconButton({ icon, label, size = "icon-sm", ...props }: IconButtonProps) {
  return (
    <Button size={size} aria-label={label} {...props}>
      {icon}
    </Button>
  );
}
