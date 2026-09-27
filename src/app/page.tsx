import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getHomePage } from "@/lib/contentful-queries";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60; // ISR

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage();
  if (!home) return {};

  const title = home.seo?.meta_title || undefined;
  const description = home.seo?.meta_description || home.hero?.subheading || undefined;

  return {
    title,
    description,
    alternates: { canonical: "/" },
    // Same flag [slug]/page.tsx honors — the home entry can opt out of
    // indexing from Contentful too, without a code change.
    robots: home.seo?.enable_search_indexing === false ? { index: false } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: title || SITE_NAME,
      description,
      images: home.hero?.image ? [{ url: home.hero.image.url }] : undefined,
    },
    // Set explicitly rather than left to inherit: a page that sets its own
    // openGraph but not twitter still inherits the ROOT layout's generic
    // twitter.title/description (Next only auto-derives twitter:image from
    // openGraph.images, not the text fields).
    twitter: {
      card: "summary_large_image",
      title: title || SITE_NAME,
      description,
    },
  };
}

export default async function Home() {
  const home = await getHomePage();

  if (!home) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          flavio-commerce
        </h1>
        <p className="text-sm text-muted-foreground">
          Home page content isn&apos;t available right now.
        </p>
        <Button render={<Link href="/products" />}>Browse products</Button>
      </div>
    );
  }

  const { hero, featured_categories: featuredCategories, promo_banner: promoBanner } = home;

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {hero.heading}
          </h1>
          {hero.subheading && (
            <p className="max-w-md text-lg text-muted-foreground">{hero.subheading}</p>
          )}
          {hero.cta_label && hero.cta_link && (
            <Button size="lg" render={<Link href={hero.cta_link} />}>
              {hero.cta_label}
              <ArrowRight />
            </Button>
          )}
        </div>

        <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 lg:aspect-4/3">
          {hero.image && (
            <Image
              src={hero.image.url}
              alt={hero.image.title}
              width={800}
              height={800}
              priority
              className="size-full object-cover"
            />
          )}
        </div>
      </section>

      {/* Featured categories */}
      {featuredCategories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-foreground">
            Shop by category
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featuredCategories.map((category, index) => (
              <Link
                key={`${category.name}-${index}`}
                href={category.link || "/products"}
                className="group/category flex flex-col gap-3"
              >
                <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
                  {category.image && (
                    <Image
                      src={category.image.url}
                      alt={category.image.title}
                      width={600}
                      height={450}
                      className="size-full object-cover transition-transform duration-300 group-hover/category:scale-105"
                    />
                  )}
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                  {category.name}
                  <ArrowRight className="size-4 opacity-0 transition-opacity group-hover/category:opacity-100" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promo banner */}
      {promoBanner?.heading && (
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 lg:grid-cols-2">
            <div className="aspect-video w-full lg:aspect-square">
              {promoBanner.image && (
                <Image
                  src={promoBanner.image.url}
                  alt={promoBanner.image.title}
                  width={800}
                  height={800}
                  className="size-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col items-start gap-4 px-6 pb-8 lg:px-4 lg:py-8">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {promoBanner.heading}
              </h2>
              {promoBanner.body && (
                <p className="max-w-md text-muted-foreground">{promoBanner.body}</p>
              )}
              {promoBanner.cta_label && promoBanner.cta_link && (
                <Button variant="outline" render={<Link href={promoBanner.cta_link} />}>
                  {promoBanner.cta_label}
                  <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
