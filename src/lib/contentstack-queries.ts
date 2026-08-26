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
