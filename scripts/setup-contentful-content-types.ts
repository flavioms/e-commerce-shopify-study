// scripts/setup-contentful-content-types.ts
//
// Creates the Contentful content types needed to move the header/footer and
// the site's static content pages (About, Careers, FAQ, ...) into the CMS.
// Idempotent: skips any content type that already exists.
//
// Usage: npm run setup-contentful-content-types
//
// Requires (see .env.local): CONTENTFUL_SPACE_ID / CONTENTFUL_MANAGEMENT_TOKEN

import type { ContentFields } from 'contentful-management';

import { createContentType, getContentType } from './lib/contentful-management';

function symbolField(id: string, name: string, extra: Partial<ContentFields> = {}): ContentFields {
  return { id, name, type: 'Symbol', required: false, localized: false, ...extra };
}

function textField(id: string, name: string, extra: Partial<ContentFields> = {}): ContentFields {
  return { id, name, type: 'Text', required: false, localized: false, ...extra };
}

function intField(id: string, name: string, extra: Partial<ContentFields> = {}): ContentFields {
  return { id, name, type: 'Integer', required: false, localized: false, ...extra };
}

// Nested/repeatable shapes (a hero, a list of nav links, an SEO block, ...)
// are stored as a single freeform JSON field rather than as Contentful
// "group"/reference fields — there's no Contentful field type for an inline
// group of scalars, and modeling each as its own linked content type would be
// a lot of ceremony for content nobody but this site's seed scripts edits.
function objectField(id: string, name: string, extra: Partial<ContentFields> = {}): ContentFields {
  return { id, name, type: 'Object', required: false, localized: false, ...extra };
}

const CONTENT_TYPES: { id: string; name: string; description: string; fields: ContentFields[] }[] = [
  {
    id: 'home',
    name: 'Home Page',
    description: 'The home page: hero, featured categories, and promo banner. Singleton by convention.',
    fields: [
      symbolField('title', 'Title', { required: true }),
      objectField('hero', 'Hero'),
      objectField('featured_categories', 'Featured Categories'),
      objectField('promo_banner', 'Promo Banner'),
      objectField('seo', 'SEO'),
    ],
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'The site header: brand name and top nav links. Singleton by convention.',
    fields: [
      symbolField('title', 'Title', { required: true }),
      symbolField('brand_name', 'Brand Name'),
      objectField('nav_links', 'Nav Links'),
    ],
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'The site footer: link columns, social links, and legal links. Singleton by convention.',
    fields: [
      symbolField('title', 'Title', { required: true }),
      symbolField('brand_name', 'Brand Name'),
      symbolField('tagline', 'Tagline'),
      objectField('footer_links', 'Footer Links'),
      objectField('social_links', 'Social Links'),
      objectField('legal_links', 'Legal Links'),
      symbolField('copyright_text', 'Copyright Text'),
    ],
  },
  {
    id: 'page',
    name: 'Page',
    description: 'A generic static content page (About, Careers, Privacy, ...), addressed by slug.',
    fields: [
      symbolField('title', 'Title', { required: true }),
      symbolField('slug', 'Slug', { required: true, validations: [{ unique: true }] }),
      textField('summary', 'Summary'),
      textField('body', 'Body'),
      objectField('seo', 'SEO'),
    ],
  },
  {
    id: 'faq_item',
    name: 'FAQ Item',
    description: 'A single question/answer pair shown on the FAQ page.',
    fields: [
      // Doubles as the question — kept as `title` (rather than e.g. `question`)
      // so it lines up with every other content type's display field.
      symbolField('title', 'Question', { required: true }),
      textField('answer', 'Answer'),
      intField('order', 'Order'),
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'A regional contact card shown on the Contact page.',
    fields: [
      symbolField('title', 'Title', { required: true }),
      textField('address', 'Address'),
      objectField('contact_number', 'Contact Numbers'),
      symbolField('email_address', 'Email Address'),
    ],
  },
];

async function main() {
  for (const contentType of CONTENT_TYPES) {
    const existing = await getContentType(contentType.id);
    if (existing) {
      console.log(`Skipping "${contentType.id}" — already exists.`);
      continue;
    }

    console.log(`Creating content type "${contentType.id}"...`);
    await createContentType(contentType.id, {
      name: contentType.name,
      description: contentType.description,
      displayField: 'title',
      fields: contentType.fields,
    });
  }

  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error('Failed to set up Contentful content types:');
  console.error(error);
  process.exitCode = 1;
});
