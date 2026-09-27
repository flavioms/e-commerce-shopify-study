import { contentfulClient } from './contentful';

// Every Contentful entry carries this system metadata regardless of content
// type — `uid`/`updated_at` match the field names the app already reads
// (originally shaped after Contentstack's entry envelope), so route code
// didn't need to change when the CMS did.
type BaseEntry = {
  uid: string;
  updated_at: string;
};

function toBaseEntry(sys: { id: string; updatedAt: string }): BaseEntry {
  return { uid: sys.id, updated_at: sys.updatedAt };
}

type ImageAsset = {
  url: string;
  title: string;
};

type Hero = {
  heading: string;
  subheading: string;
  image: ImageAsset | null;
  cta_label: string;
  cta_link: string;
};

type FeaturedCategory = {
  name: string;
  image: ImageAsset | null;
  link: string;
};

type PromoBanner = {
  heading: string;
  body: string;
  image: ImageAsset | null;
  cta_label: string;
  cta_link: string;
};

// The "SEO" shape is repeated as a plain JSON object field on `home` and
// `page` — Contentful has no reusable global-field equivalent worth setting
// up for two fields, so it's just duplicated in both content types.
export type Seo = {
  meta_title: string;
  meta_description: string;
  keywords: string;
  enable_search_indexing: boolean;
} | null;

export type HomePageEntry = BaseEntry & {
  hero: Hero;
  featured_categories: FeaturedCategory[];
  promo_banner: PromoBanner;
  seo: Seo;
};

export async function getHomePage(): Promise<HomePageEntry | null> {
  const result = await contentfulClient.getEntries({ content_type: 'home', limit: 1 });
  const entry = result.items[0];
  if (!entry) return null;
  return { ...toBaseEntry(entry.sys), ...(entry.fields as Omit<HomePageEntry, keyof BaseEntry>) };
}

export type ContactEntry = BaseEntry & {
  title: string;
  address: string;
  contact_number: number[];
  email_address: string;
};

export async function getContacts(): Promise<ContactEntry[]> {
  const result = await contentfulClient.getEntries({ content_type: 'contact' });
  return result.items.map((entry) => ({
    ...toBaseEntry(entry.sys),
    ...(entry.fields as Omit<ContactEntry, keyof BaseEntry>),
  }));
}

type NavLink = {
  label: string;
  href: string;
};

export type NavigationEntry = BaseEntry & {
  brand_name: string;
  nav_links: NavLink[];
};

export async function getNavigation(): Promise<NavigationEntry | null> {
  const result = await contentfulClient.getEntries({ content_type: 'navigation', limit: 1 });
  const entry = result.items[0];
  if (!entry) return null;
  return { ...toBaseEntry(entry.sys), ...(entry.fields as Omit<NavigationEntry, keyof BaseEntry>) };
}

type FooterLink = {
  column: 'Shop' | 'Company' | 'Support';
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
  icon: 'instagram' | 'twitter' | 'facebook';
};

export type FooterEntry = BaseEntry & {
  brand_name: string;
  tagline: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];
  legal_links: NavLink[];
  copyright_text: string;
};

export async function getFooter(): Promise<FooterEntry | null> {
  const result = await contentfulClient.getEntries({ content_type: 'footer', limit: 1 });
  const entry = result.items[0];
  if (!entry) return null;
  return { ...toBaseEntry(entry.sys), ...(entry.fields as Omit<FooterEntry, keyof BaseEntry>) };
}

export type PageEntry = BaseEntry & {
  title: string;
  slug: string;
  summary: string;
  body: string;
  seo: Seo;
};

export async function getPageBySlug(slug: string): Promise<PageEntry | null> {
  const result = await contentfulClient.getEntries({ content_type: 'page', 'fields.slug': slug, limit: 1 });
  const entry = result.items[0];
  if (!entry) return null;
  return { ...toBaseEntry(entry.sys), ...(entry.fields as Omit<PageEntry, keyof BaseEntry>) };
}

/** Every `page` entry — used to build the sitemap. */
export async function getAllPages(): Promise<PageEntry[]> {
  const result = await contentfulClient.getEntries({ content_type: 'page' });
  return result.items.map((entry) => ({
    ...toBaseEntry(entry.sys),
    ...(entry.fields as Omit<PageEntry, keyof BaseEntry>),
  }));
}

export type FaqItemEntry = BaseEntry & {
  // `title` doubles as the question (kept from the previous CMS's mandatory
  // default field, since site-facing code already reads it that way).
  title: string;
  answer: string;
  order: number;
};

export async function getFaqItems(): Promise<FaqItemEntry[]> {
  const result = await contentfulClient.getEntries({ content_type: 'faq_item', order: ['fields.order'] });
  return result.items.map((entry) => ({
    ...toBaseEntry(entry.sys),
    ...(entry.fields as Omit<FaqItemEntry, keyof BaseEntry>),
  }));
}
