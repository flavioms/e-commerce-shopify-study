import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartDrawer } from "@/components/cart-drawer";
import { getNavigation } from "@/lib/contentstack-queries";

const FALLBACK_BRAND_NAME = "flavio-commerce";
const FALLBACK_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export async function SiteHeader() {
  const navigation = await getNavigation();
  const brandName = navigation?.brand_name || FALLBACK_BRAND_NAME;
  const navLinks = navigation?.nav_links?.length
    ? navigation.nav_links.map((link) => ({ href: link.href, label: link.label }))
    : FALLBACK_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          <ShoppingBag className="size-5" aria-hidden="true" />
          {brandName}
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <CartDrawer />
      </div>
    </header>
  );
}
