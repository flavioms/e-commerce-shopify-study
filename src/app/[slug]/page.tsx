import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPageBySlug } from "@/lib/contentstack-queries";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60; // ISR

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);
  if (!page) return {};

  const title = page.seo?.meta_title || page.title;
  const description = page.seo?.meta_description || page.summary || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    robots: page.seo?.enable_search_indexing === false ? { index: false } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ContentPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const paragraphs = page.body.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
        {page.title}
      </h1>
      {page.summary && <p className="mb-8 text-sm text-muted-foreground">{page.summary}</p>}

      <div className="flex flex-col gap-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
