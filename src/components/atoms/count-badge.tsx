export interface CountBadgeProps {
  count: number;
  /** Counts above this show as "{max}+". @default 99 */
  max?: number;
}

/** Small circular count bubble, meant to sit in a parent's `relative` corner (see CartDrawer). */
export function CountBadge({ count, max = 99 }: CountBadgeProps) {
  return (
    <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] leading-none font-semibold text-primary-foreground">
      {count > max ? `${max}+` : count}
    </span>
  );
}
