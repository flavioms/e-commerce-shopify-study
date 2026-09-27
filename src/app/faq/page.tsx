import type { Metadata } from "next";
import Link from "next/link";

import { getFaqItems } from "@/lib/contentful-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60; // ISR

const TITLE = "FAQ";
const DESCRIPTION = "Answers to common questions about shipping, returns, and orders.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function FaqPage() {
  const faqItems = await getFaqItems();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Frequently asked questions
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Can&apos;t find what you&apos;re looking for?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
          Contact us
        </Link>
        .
      </p>

      {faqItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">FAQ content isn&apos;t available right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {faqItems.map((item) => (
            <Card key={item.uid}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
