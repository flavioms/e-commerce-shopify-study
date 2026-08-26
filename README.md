# flavio-commerce

> **This is a study/learning project.** It exists to explore how a Next.js
> storefront can be composed from several real third-party services (Shopify,
> Contentstack, Algolia) — it is not a production store, and the catalog,
> home page copy, and static pages (About, Careers, FAQ, ...) are all seeded
> with placeholder/demo content. Don't point it at a real store's credentials
> expecting production-grade behavior (in particular: nothing here builds a
> custom checkout — it hands off to Shopify's own hosted checkout, since the
> Storefront API doesn't support more than that with a private token).

A Next.js (App Router) storefront that pulls its catalog from **Shopify**
(Storefront API), its marketing content (home page, header/footer, About/
Careers/FAQ/...) from **Contentstack**, and product search from **Algolia**
— with a cookie-based cart backed by React Server Functions.

## Stack

- **Next.js 16** (App Router, Turbopack, React Server Functions)
- **Shopify Storefront API** — catalog, cart, checkout handoff
- **Contentstack** — home page, header/footer, static content pages, FAQ, contact
- **Algolia** (`react-instantsearch`) — product search
- **Tailwind CSS v4** + **shadcn/ui** (on top of Base UI primitives)

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

## Content & data setup scripts

The catalog comes from Shopify directly — no setup needed there beyond the
env vars. Everything else (Contentstack content types/entries, the Algolia
index) needs to be created once, via the scripts in `scripts/`:

```bash
# 1. Create the Contentstack content types this app expects
#    (navigation, footer, page, faq_item — home/contact predate this repo)
npm run setup-contentstack-content-types

# 2. Seed placeholder content: header/footer, About/Careers/Privacy/Terms/
#    Shipping & Returns/Track Order pages, and FAQ items
npm run seed-contentstack-site-content

# 3. Seed a couple of placeholder contact cards
npm run seed-contentstack-contacts

# 4. Push the Shopify catalog into Algolia (needed before /search works)
npm run sync-algolia

# 5. Optional: replace the home page's placeholder hero/category/promo
#    content with real products from the Shopify catalog
npm run sync-contentstack-home
```

All of these are idempotent — safe to re-run after editing the placeholder
content inside each script.

## Project structure

- `src/app/` — routes (App Router)
- `src/components/` — UI components (`ui/` holds the shadcn primitives)
- `src/lib/` — API clients and data-fetching (`shopify*.ts`, `contentstack*.ts`,
  `algolia-client.ts`, `cart-actions.ts` for the cart's Server Functions)
- `scripts/` — one-off/CLI scripts for setting up and seeding Contentstack and
  Algolia (run with `npm run <script-name>`, powered by `tsx`)

## Learn more

This project was bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
See the [Next.js documentation](https://nextjs.org/docs) for framework
features and APIs.
