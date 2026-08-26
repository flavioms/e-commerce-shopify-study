import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SVGProps } from "react";

// lucide-react no longer ships trademarked brand glyphs, so the social
// icons are inlined here as minimal outline SVGs.
function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2h3.3l-7.2 8.2L23.4 22h-6.6l-5.2-6.8L5.6 22H2.3l7.7-8.8L1.6 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 4h-2l12.3 16Z" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

const footerLinks = [
  {
    heading: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?filter=new", label: "New arrivals" },
      { href: "/products?filter=best-sellers", label: "Best sellers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/track-order", label: "Track order" },
    ],
  },
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
  { href: "https://twitter.com", label: "Twitter", icon: TwitterIcon },
  { href: "https://facebook.com", label: "Facebook", icon: FacebookIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-foreground"
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              flavio-commerce
            </Link>
            <p className="text-sm text-muted-foreground">
              Thoughtfully made products, delivered to your door.
            </p>
            <div className="mt-1 flex items-center gap-1">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon-sm"
                  render={
                    <a href={href} target="_blank" rel="noopener noreferrer" />
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-foreground">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} flavio-commerce. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
