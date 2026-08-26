/**
 * Streamed in immediately on navigation, while a route's server data (Shopify,
 * Contentstack) resolves — without this, the browser shows a blank tab until
 * every fetch on the page finishes.
 *
 * This is the ROOT loading.tsx: Next uses it as the Suspense fallback for
 * every route that doesn't define a more specific loading.tsx of its own
 * (currently just /products and /products/[product] do) — including "/",
 * "/faq", "/contact", and "/[slug]". So this stays deliberately generic
 * (a plain content skeleton) rather than shaped like any one page's layout;
 * a hero-shaped skeleton here would look broken showing up on /faq.
 */
export default function RootLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-muted" />
      <div className="mt-4 h-48 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
