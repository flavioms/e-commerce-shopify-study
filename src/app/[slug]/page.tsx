import { notFound } from "next/navigation";

import { getPageBySlug } from "@/lib/contentstack-queries";

export const revalidate = 60; // ISR

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
