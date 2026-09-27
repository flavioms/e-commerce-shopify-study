# flavio-commerce

> **This is a study/learning project.** It exists to explore how a Next.js
> storefront can be composed from several real third-party services (Shopify,
> Contentful, Algolia) — it is not a production store, and the catalog,
> home page copy, and static pages (About, Careers, FAQ, ...) are all seeded
> with placeholder/demo content. Don't point it at a real store's credentials
> expecting production-grade behavior (in particular: nothing here builds a
> custom checkout — it hands off to Shopify's own hosted checkout, since the
> Storefront API doesn't support more than that with a private token).

A Next.js (App Router) storefront that pulls its catalog from **Shopify**
(Storefront API), its marketing content (home page, header/footer, About/
Careers/FAQ/...) from **Contentful**, and product search from **Algolia**
— with a cookie-based cart backed by React Server Functions and Zustand.

## Stack

- **Next.js 16** (App Router, Turbopack, React Server Functions, React Compiler)
- **React 19**
- **Shopify Storefront API** — catalog, cart mutations, checkout handoff
- **Contentful** — home page, header/footer, static content pages, FAQ, contact
- **Algolia** (`react-instantsearch`) — product search
- **Zustand** — client-side cart store (see [Architecture notes](#architecture-notes))
- **OpenTelemetry** (`@vercel/otel`) → **New Relic** — request tracing and error reporting, via New Relic's OTLP ingest endpoint
- **Tailwind CSS v4** + **shadcn/ui** (on top of [Base UI](https://base-ui.com/) primitives)

## Features

- Product listing (ISR) and detail pages, sourced live from Shopify
- Cart: add/update/remove line items via Server Functions, cookie-based
  session, slide-out drawer — state shared across the app through a Zustand
  store (no Context provider wrapping the tree)
- Checkout: reviews the cart, lets the buyer set an email, then hands off to
  Shopify's hosted checkout
- Product search (Algolia `react-instantsearch`), with the on-page listing as
  a fallback while the search box is empty
- Home page, header, footer, and static pages (About, Careers, Privacy,
  Terms, Shipping & Returns, Track Order, FAQ, Contact) all authored in
  Contentful — nothing here is hardcoded copy
- SEO: dynamic `sitemap.xml` and `robots.txt`, per-page canonical URLs and
  Open Graph/Twitter metadata, JSON-LD `Product` structured data on product
  pages, and a per-entry "exclude from search indexing" flag in Contentful
- `loading.tsx` route-level skeletons so navigation streams in instead of
  blocking on data
- Observability: every request is traced with OpenTelemetry and exported to
  New Relic (server errors are recorded onto the active span, not just
  logged) — optional, the app runs fine without it configured

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in real values (see the
   comments in that file for where each token comes from):

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list with inline comments. Grouped by service:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL — `metadataBase`, `sitemap.xml`, `robots.txt`, JSON-LD |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Shopify Storefront API (catalog, cart) |
| `CONTENTFUL_SPACE_ID`, `CONTENTFUL_DELIVERY_TOKEN` | Contentful Delivery API (read, used at request time) |
| `CONTENTFUL_MANAGEMENT_TOKEN` | Contentful Management API — **scripts only**, never used by the app itself |
| `CONTENTFUL_ENVIRONMENT` | Contentful environment name — optional, defaults to `master` |
| `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_INDEX_NAME` | Algolia admin — **scripts only** (`sync-algolia`) |
| `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` | Algolia search-only key, used client-side by `/search` |
| `NEW_RELIC_LICENSE_KEY` | New Relic OTLP ingest — optional, see [Observability](#observability) |
| `NEW_RELIC_OTLP_ENDPOINT` | Override for an EU-region New Relic account — optional, defaults to the US endpoint |

## Content & data setup scripts

The catalog comes from Shopify directly — no setup needed there beyond the
env vars. Everything else (Contentful content types/entries, the Algolia
index) needs to be created once, via the scripts in `scripts/`:

```bash
# 1. Create the Contentful content types this app expects
#    (navigation, footer, page, faq_item — home/contact predate this repo)
npm run setup-contentful-content-types

# 2. Seed placeholder content: header/footer, About/Careers/Privacy/Terms/
#    Shipping & Returns/Track Order pages, and FAQ items
npm run seed-contentful-site-content

# 3. Seed a couple of placeholder contact cards
npm run seed-contentful-contacts

# 4. Push the Shopify catalog into Algolia (needed before /search works)
npm run sync-algolia

# 5. Optional: replace the home page's placeholder hero/category/promo
#    content with real products from the Shopify catalog
npm run sync-contentful-home
```

All of these are idempotent — safe to re-run after editing the placeholder
content inside each script.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run sync-algolia` | Push the full Shopify catalog into the Algolia index |
| `npm run sync-contentful-home` | Replace the home page's hero/category/promo with real Shopify products |
| `npm run setup-contentful-content-types` | Create the Contentful content types this app expects |
| `npm run seed-contentful-site-content` | Seed header/footer/static pages/FAQ placeholder content |
| `npm run seed-contentful-contacts` | Seed placeholder contact cards |

## Project structure

```
src/
  app/                          routes (App Router)
    page.tsx                    — home (Contentful)
    products/                   — product listing (ISR) + loading.tsx
    products/[product]/         — product detail (ISR) + loading.tsx + not-found.tsx
    search/                     — Algolia-powered search
                                   (layout.tsx carries its metadata — the page
                                   itself is a Client Component)
    checkout/                   — cart review → Shopify hosted checkout handoff
    contact/, faq/               — Contentful-backed static pages
    [slug]/                     — any other Contentful `page` entry
    sitemap.ts, robots.ts       — generated from the Shopify catalog + Contentful pages
    loading.tsx                 — generic fallback for routes without their own
  components/
    ui/                         — shadcn primitives (Button, Card, Sheet, Separator, ...)
    atoms/                      — small shared building blocks (IconButton, BrandLogo,
                                   Price, CountBadge, EmptyState)
    molecules/                  — QuantityStepper
    organisms/                  — SiteHeader, SiteFooter, CartDrawer, ProductCard,
                                   ProductGrid, ProductSearch, ProductMediaCarousel, ...
    providers/                  — CartInitializer (kicks off the cart store's initial fetch)
  types/
    product.ts                  — the canonical `Product` domain type (see below)
  instrumentation.ts             — OpenTelemetry setup, exported to New Relic (see Observability)
  lib/
    shopify.ts, shopify-queries.ts, shopify-cart.ts   — Shopify Storefront API client + queries
    contentful.ts, contentful-queries.ts          — Contentful Delivery SDK + queries
    algolia-client.ts           — Algolia search client (browser-safe, search-only key)
    cart-store.ts                — Zustand cart store + useCart() hook
    cart-actions.ts              — cart Server Functions (add/update/remove line items)
    json-ld.ts                   — schema.org structured-data builders
    site.ts, currency.ts, utils.ts
  hooks/
    use-locale.ts                — hydration-safe browser-locale hook
scripts/                        one-off/CLI setup & seed scripts (run via `npm run <name>`, tsx)
```

## Observability

Every request is instrumented with [OpenTelemetry](https://opentelemetry.io/)
(`src/instrumentation.ts`, via `@vercel/otel`) and exported straight to
[New Relic](https://newrelic.com/)'s OTLP ingest endpoint — no OpenTelemetry
Collector needed, and no proprietary `newrelic` Node agent: since New Relic
accepts standard OTLP directly, the app only ever depends on vendor-neutral
OpenTelemetry APIs, so pointing it at a different backend later (Honeycomb,
Datadog, an in-house collector, ...) is an env var change, not a rewrite.

- **Traces**: every request gets a root span (method + route), plus Next.js's
  own built-in spans for rendering, data fetching, `fetch()` calls, etc.
- **Errors**: server errors (Server Components, Route Handlers, Server
  Actions) are recorded onto the active span via `onRequestError` — they show
  up attached to the trace that produced them, not as a bare log line.
- **Optional by design**: without `NEW_RELIC_LICENSE_KEY` set, OpenTelemetry
  still initializes (so nothing crashes and custom spans still work locally),
  it just has nowhere to export to — a warning is logged once at startup.

To wire it up, set in `.env.local` (or your deploy platform's env vars):

```bash
NEW_RELIC_LICENSE_KEY=your-ingest-license-key   # Account settings > API keys > "Ingest - License"
# NEW_RELIC_OTLP_ENDPOINT=https://otlp.eu01.nr-data.net:4318   # only for an EU-region account
```

## Architecture notes

**Domain types follow an onion pattern.** `src/types/product.ts` defines one
canonical `Product` shape (plus `ProductDetail`/`ProductForSearch` variants).
Every data source has its own small adapter that maps its raw external shape
into it at the boundary — `toProduct()`/`toMediaItems()` in
`shopify-queries.ts` for Shopify's GraphQL response, `hitToProduct()` in
`product-search.tsx` for Algolia's flat record. Nothing outside those
adapters — pages, components, scripts — ever deals with GraphQL edges/nodes
or Algolia's record format; they all just consume `Product`.

**Components follow Atomic Design.** `components/ui/` (shadcn primitives) is
left untouched; everything built on top of it is organized into
`atoms/ → molecules/ → organisms/ → providers/`, with shared pieces
(`IconButton`, `QuantityStepper`, ...) extracted once instead of duplicated
across the header, footer, and cart drawer.

**Cart state lives in a Zustand store**, not React Context. `CartInitializer`
replaces the old Context provider — it doesn't wrap the tree, it just
triggers the store's initial fetch once on mount (the cart cookie is
httpOnly, so the client has to ask the server for its contents). Any client
component reads it directly via `useCart()`.

**Rendering strategy.** Most routes are Server Components with
`revalidate = 60` (ISR) rather than fully static or fully dynamic — content
from Shopify/Contentful can change without a redeploy, but pages still
serve from cache between revalidations. `/checkout` and `/search` are the
exceptions (Client Components, since they depend on client-only state/hooks).

## Learn more

This project was bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
See the [Next.js documentation](https://nextjs.org/docs) for framework
features and APIs.
