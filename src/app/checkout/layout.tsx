import type { Metadata } from "next";

// checkout/page.tsx is a Client Component (uses hooks/context), which can't export
// `metadata` itself — this layout carries it instead. Checkout pages generally
// shouldn't be indexed.
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return children;
}
