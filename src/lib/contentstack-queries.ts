import type { BaseEntry } from '@contentstack/delivery-sdk';

import { Stack } from './contentstack';

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

export type HomePageEntry = BaseEntry & {
  hero: Hero;
  // "Featured Categories" is a Contentstack `blocks` field: each item is keyed by
  // its block uid — this stack only defines one block type ("instances").
  featured_categories: { instances: FeaturedCategory }[];
  promo_banner: PromoBanner;
};

export async function getHomePage() {
  const result = await Stack.contentType('home').entry().query().find<HomePageEntry>();
  return result.entries?.[0] ?? null;
}

export type ContactEntry = BaseEntry & {
  address: string;
  contact_number: number[];
  email_address: string;
};

export async function getContacts() {
  const result = await Stack.contentType('contact').entry().query().find<ContactEntry>();
  return result.entries ?? [];
}

type NavLink = {
  label: string;
  href: string;
};

export type NavigationEntry = BaseEntry & {
  brand_name: string;
  nav_links: NavLink[];
};

export async function getNavigation() {
  const result = await Stack.contentType('navigation').entry().query().find<NavigationEntry>();
  return result.entries?.[0] ?? null;
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

export async function getFooter() {
  const result = await Stack.contentType('footer').entry().query().find<FooterEntry>();
  return result.entries?.[0] ?? null;
}

export type PageEntry = BaseEntry & {
  slug: string;
  summary: string;
  body: string;
};

export async function getPageBySlug(slug: string) {
  const result = await Stack.contentType('page').entry().query().equalTo('slug', slug).find<PageEntry>();
  return result.entries?.[0] ?? null;
}

export type FaqItemEntry = BaseEntry & {
  // `title` doubles as the question (Contentstack's mandatory default field).
  answer: string;
  order: number;
};

export async function getFaqItems() {
  const result = await Stack.contentType('faq_item')
    .entry()
    .query()
    .orderByAscending('order')
    .find<FaqItemEntry>();
  return result.entries ?? [];
}
