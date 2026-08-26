import type { Metadata, } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import { CartInitializer } from "@/components/providers/cart-initializer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_DESCRIPTION = "Thoughtfully made performance apparel and gear, delivered to your door.";

export const metadata: Metadata = {
  // Resolves every relative URL below (and every page's `alternates.canonical`
  // / `openGraph.images`) against the real deployed domain instead of leaving
  // them relative — without this, canonical tags and social preview images
  // don't resolve to an absolute URL at all.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  // Site-wide fallback — any page that doesn't set its own `openGraph`/`twitter`
  // inherits this as-is. A page that *does* set `openGraph` should repeat
  // `type`/`siteName` too: Next replaces the whole object per route, it
  // doesn't merge field-by-field with the parent.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartInitializer />
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
