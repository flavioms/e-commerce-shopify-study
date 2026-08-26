// scripts/seed-contentstack-contacts.ts
//
// Fills the (currently empty) `contact` content type in Contentstack with a
// couple of realistic-looking, made-up contact entries — there's no upstream
// source of truth for this data (unlike products/home, which come from
// Shopify), so this is fake data meant to make the /contact page demoable.
//
// Usage: npm run seed-contentstack-contacts
//
// Requires (see .env.local): CONTENTSTACK_API_KEY / CONTENTSTACK_MANAGEMENT_TOKEN

import { cma, ENVIRONMENT, LOCALE } from './lib/contentstack-cma';

const CONTENT_TYPE_UID = 'contact';

type ContactSeed = {
  title: string;
  address: string;
  contact_number: number[];
  email_address: string;
};

const CONTACTS: ContactSeed[] = [
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
  console.log(`Fetching existing "${CONTENT_TYPE_UID}" entries...`);
  const { entries: existing } = await cma<{ entries: { uid: string; title: string }[] }>(
    `/content_types/${CONTENT_TYPE_UID}/entries`,
  );
  const existingTitles = new Set(existing.map((entry) => entry.title));

  for (const contact of CONTACTS) {
    if (existingTitles.has(contact.title)) {
      console.log(`Skipping "${contact.title}" — an entry with that title already exists.`);
      continue;
    }

    console.log(`Creating "${contact.title}"...`);
    const { entry } = await cma<{ entry: { uid: string } }>(`/content_types/${CONTENT_TYPE_UID}/entries`, {
      method: 'POST',
      body: JSON.stringify({ entry: contact }),
    });

    console.log(`Publishing "${contact.title}" (${entry.uid}) to "${ENVIRONMENT}"...`);
    await cma(`/content_types/${CONTENT_TYPE_UID}/entries/${entry.uid}/publish`, {
      method: 'POST',
      body: JSON.stringify({ entry: { environments: [ENVIRONMENT], locales: [LOCALE] } }),
    });
  }

  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error('Failed to seed Contentstack contact entries:');
  console.error(error);
  process.exitCode = 1;
});
