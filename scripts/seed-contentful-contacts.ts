// scripts/seed-contentful-contacts.ts
//
// Fills the (currently empty) `contact` content type in Contentful with a
// couple of realistic-looking, made-up contact entries — there's no upstream
// source of truth for this data (unlike products/home, which come from
// Shopify), so this is fake data meant to make the /contact page demoable.
//
// Usage: npm run seed-contentful-contacts
//
// Requires (see .env.local): CONTENTFUL_SPACE_ID / CONTENTFUL_MANAGEMENT_TOKEN

import { createIfMissingByTitle } from './lib/contentful-management';

const CONTACTS: (Record<string, unknown> & { title: string })[] = [
  {
    title: 'Customer Support',
    address: '500 Market Street, Suite 300\nSan Francisco, CA 94105\nUnited States',
    contact_number: [14155550142],
    email_address: 'support@flavio-commerce.com',
  },
  {
    title: 'European Distribution',
    address: '12 Rue de Rivoli\n75004 Paris\nFrance',
    contact_number: [33142860142],
    email_address: 'eu@flavio-commerce.com',
  },
];

async function main() {
  for (const contact of CONTACTS) {
    await createIfMissingByTitle('contact', contact);
  }

  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error('Failed to seed Contentful contact entries:');
  console.error(error);
  process.exitCode = 1;
});
