import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/atoms/brand-logo";
import { IconButton } from "@/components/atoms/icon-button";
import { getFooter } from "@/lib/contentful-queries";
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

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
} as const;

const FOOTER_COLUMNS = ["Shop", "Company", "Support"] as const;

const FALLBACK_BRAND_NAME = "flavio-commerce";
const FALLBACK_TAGLINE = "Thoughtfully made products, delivered to your door.";
const FALLBACK_COPYRIGHT_TEXT = "flavio-commerce. All rights reserved.";
const FALLBACK_FOOTER_LINKS: { column: (typeof FOOTER_COLUMNS)[number]; label: string; href: string }[] = [
  { column: "Shop", label: "All products", href: "/products" },
  { column: "Company", label: "Contact", href: "/contact" },
];
const FALLBACK_SOCIAL_LINKS: { label: string; href: string; icon: keyof typeof SOCIAL_ICONS }[] = [
  { href: "https://instagram.com", label: "Instagram", icon: "instagram" },
  { href: "https://twitter.com", label: "Twitter", icon: "twitter" },
  { href: "https://facebook.com", label: "Facebook", icon: "facebook" },
];
const FALLBACK_LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export async function SiteFooter() {
  const footer = await getFooter();

  const brandName = footer?.brand_name || FALLBACK_BRAND_NAME;
  const tagline = footer?.tagline || FALLBACK_TAGLINE;
  const copyrightText = footer?.copyright_text || FALLBACK_COPYRIGHT_TEXT;
  const footerLinks = footer?.footer_links?.length ? footer.footer_links : FALLBACK_FOOTER_LINKS;
  const socialLinks = footer?.social_links?.length ? footer.social_links : FALLBACK_SOCIAL_LINKS;
  const legalLinks = footer?.legal_links?.length ? footer.legal_links : FALLBACK_LEGAL_LINKS;

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <BrandLogo name={brandName} size="sm" />
            <p className="text-sm text-muted-foreground">{tagline}</p>
            <div className="mt-1 flex items-center gap-1">
              {socialLinks.map(({ href, label, icon }) => {
                const Icon = SOCIAL_ICONS[icon];
                return (
                  <IconButton
                    key={label}
                    icon={<Icon />}
                    label={label}
                    variant="ghost"
                    render={<a href={href} target="_blank" rel="noopener noreferrer" />}
                  />
                );
              })}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => {
            const links = footerLinks.filter((link) => link.column === column);
            if (links.length === 0) return null;

            return (
              <div key={column} className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-foreground">{column}</h3>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
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
            );
          })}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {copyrightText}
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
