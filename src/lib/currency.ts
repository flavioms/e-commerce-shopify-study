export type Money = {
  amount: string | number;
  currencyCode: string;
};

/**
 * Formats a Money value (always taking the currency from the product/cart data
 * itself, never hardcoded) as a localized currency string.
 *
 * Pass an explicit `locale` for deterministic output (e.g. matching a value already
 * rendered elsewhere). Omit it to let `Intl` fall back to the current runtime's
 * default locale — in a browser, that already *is* the visitor's own language/region
 * setting. See {@link "@/components/price"} for safely doing this in content that's
 * part of the server-rendered HTML, where the swap has to happen after hydration.
 */
export function formatMoney(money: Money, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}
