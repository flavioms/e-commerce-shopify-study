"use client";

import { useLocale } from "@/hooks/use-locale";
import { formatMoney, type Money } from "@/lib/currency";

export interface PriceProps {
  money: Money;
  className?: string;
}

export function Price({ money, className }: PriceProps) {
  const locale = useLocale();
  return <span className={className}>{formatMoney(money, locale)}</span>;
}
