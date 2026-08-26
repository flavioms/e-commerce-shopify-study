import type { Metadata } from "next";

// search/page.tsx is a Client Component (uses InstantSearch hooks), which
// can't export `metadata` itself — this layout carries it instead, same
// pattern as checkout/layout.tsx. Kept out of the index: it's a
// client-rendered duplicate of /products with no stable canonical query, and
// would otherwise compete with /products for the same search intent.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchLayout({ children }: LayoutProps<"/search">) {
  return children;
}
