// scripts/seed-contentstack-site-content.ts
//
// Seeds the CMS-driven header (navigation), footer, static content pages
// (About, Careers, ...), and FAQ — all placeholder copy, since (unlike
// products/home) there's no upstream source of truth for this content.
// Idempotent: entries are matched by title and updated in place if they
// already exist, so re-running this after editing the content below is safe.
//
// Usage: npm run seed-contentstack-site-content
//
// Requires (see .env.local): CONTENTSTACK_API_KEY / CONTENTSTACK_MANAGEMENT_TOKEN

import { cma, ENVIRONMENT, LOCALE } from './lib/contentstack-cma';

type Entry = Record<string, unknown> & { title: string };

async function upsertSingleton(contentTypeUid: string, fields: Entry) {
  const { entries } = await cma<{ entries: { uid: string }[] }>(`/content_types/${contentTypeUid}/entries`);
  const existing = entries[0];

  if (existing) {
    console.log(`Updating singleton "${contentTypeUid}"...`);
    await cma(`/content_types/${contentTypeUid}/entries/${existing.uid}`, {
      method: 'PUT',
      body: JSON.stringify({ entry: fields }),
    });
    await publish(contentTypeUid, existing.uid);
    return;
  }

  console.log(`Creating singleton "${contentTypeUid}"...`);
  const { entry } = await cma<{ entry: { uid: string } }>(`/content_types/${contentTypeUid}/entries`, {
    method: 'POST',
    body: JSON.stringify({ entry: fields }),
  });
  await publish(contentTypeUid, entry.uid);
}

async function upsertByTitle(contentTypeUid: string, fields: Entry) {
  const { entries } = await cma<{ entries: { uid: string; title: string }[] }>(
    `/content_types/${contentTypeUid}/entries`,
  );
  const existing = entries.find((entry) => entry.title === fields.title);
  if (existing) {
    console.log(`Updating "${fields.title}" (${contentTypeUid})...`);
    await cma(`/content_types/${contentTypeUid}/entries/${existing.uid}`, {
      method: 'PUT',
      body: JSON.stringify({ entry: fields }),
    });
    await publish(contentTypeUid, existing.uid);
    return;
  }

  console.log(`Creating "${fields.title}" (${contentTypeUid})...`);
  const { entry } = await cma<{ entry: { uid: string } }>(`/content_types/${contentTypeUid}/entries`, {
    method: 'POST',
    body: JSON.stringify({ entry: fields }),
  });
  await publish(contentTypeUid, entry.uid);
}

async function publish(contentTypeUid: string, entryUid: string) {
  await cma(`/content_types/${contentTypeUid}/entries/${entryUid}/publish`, {
    method: 'POST',
    body: JSON.stringify({ entry: { environments: [ENVIRONMENT], locales: [LOCALE] } }),
  });
}

async function main() {
  await upsertSingleton('navigation', {
    title: 'Main Navigation',
    brand_name: 'flavio-commerce',
    nav_links: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
    ],
  });

  await upsertSingleton('footer', {
    title: 'Site Footer',
    brand_name: 'flavio-commerce',
    tagline: 'Thoughtfully made products, delivered to your door.',
    footer_links: [
      { column: 'Shop', label: 'All products', href: '/products' },
      { column: 'Shop', label: 'New arrivals', href: '/products?filter=new' },
      { column: 'Shop', label: 'Best sellers', href: '/products?filter=best-sellers' },
      { column: 'Company', label: 'About', href: '/about' },
      { column: 'Company', label: 'Careers', href: '/careers' },
      { column: 'Company', label: 'Contact', href: '/contact' },
      { column: 'Support', label: 'FAQ', href: '/faq' },
      { column: 'Support', label: 'Shipping & returns', href: '/shipping-returns' },
      { column: 'Support', label: 'Track order', href: '/track-order' },
    ],
    social_links: [
      { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
      { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
      { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
    ],
    legal_links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    // Rendered as "© {current year} {copyright_text}" — the year stays correct
    // without needing a yearly CMS edit.
    copyright_text: 'flavio-commerce. All rights reserved.',
  });

  const pages: Entry[] = [
    {
      title: 'About',
      slug: 'about',
      summary: 'Who we are and why we make what we make.',
      body: [
        "flavio-commerce started with a simple idea: gear that works as hard as you do, without the marketing fluff. We design for the ride to the mountain, the warm-up before it, and everything in between.",
        'Every product in our catalog is tested by the people who ride, run, and train in it — not just photographed for a lookbook. If it does not hold up, it does not ship.',
        "We're a small team, which means every order, every review, and every support email gets read by someone who actually cares about getting it right.",
      ].join('\n\n'),
    },
    {
      title: 'Careers',
      slug: 'careers',
      summary: 'Join the team.',
      body: [
        "We're a small, product-obsessed team building the next generation of performance gear — and we're always open to hearing from people who care about craft as much as we do.",
        "We don't have a big list of open reqs posted here right now, but if you think you'd be a great fit — in design, engineering, operations, or customer experience — reach out via our Contact page and tell us what you'd want to work on.",
      ].join('\n\n'),
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      summary: 'How we handle your data.',
      body: [
        'This is placeholder legal copy for demo purposes and is not a real privacy policy.',
        'We collect the information you give us at checkout (name, shipping address, email) to fulfill your order and to contact you about it. We do not sell your personal information to third parties.',
        'You can request a copy of the data we hold about you, or ask us to delete it, at any time by contacting us.',
      ].join('\n\n'),
    },
    {
      title: 'Terms of Service',
      slug: 'terms',
      summary: 'The rules for using this site and buying from us.',
      body: [
        'This is placeholder legal copy for demo purposes and is not a real terms of service agreement.',
        'By placing an order, you agree to pay the listed price plus applicable taxes and shipping. Prices and availability are subject to change without notice.',
        'All content on this site — text, images, and design — belongs to flavio-commerce unless otherwise noted.',
      ].join('\n\n'),
    },
    {
      title: 'Shipping & Returns',
      slug: 'shipping-returns',
      summary: 'Delivery times, costs, and how to send something back.',
      body: [
        'Standard shipping takes 3–7 business days within the country of purchase. You will get a shipping confirmation email with tracking as soon as your order leaves the warehouse.',
        'Not the right fit? Unused items in their original packaging can be returned within 30 days of delivery for a full refund. Start a return from your order confirmation email or by contacting us.',
        'Return shipping is free on defective items; otherwise a small return label fee is deducted from your refund.',
      ].join('\n\n'),
    },
    {
      title: 'Track Order',
      slug: 'track-order',
      summary: 'Check the status of an order you already placed.',
      body: [
        "As soon as your order ships, you'll get an email with a tracking link — that's the fastest way to see exactly where it is.",
        "Can't find that email, or has it been more than a week without an update? Reach out on the Contact page with your order number and we'll look into it for you.",
      ].join('\n\n'),
    },
  ];

  for (const page of pages) {
    await upsertByTitle('page', page);
  }

  const faqItems: Entry[] = [
    {
      title: 'How long does shipping take?',
      answer: 'Standard shipping takes 3–7 business days. You will receive a tracking link by email as soon as your order ships.',
      order: 1,
    },
    {
      title: 'What is your return policy?',
      answer: 'Unused items in their original packaging can be returned within 30 days of delivery for a full refund. See our Shipping & Returns page for details.',
      order: 2,
    },
    {
      title: 'Do you ship internationally?',
      answer: "We currently ship within the country listed at checkout. If you don't see your country as an option, reach out and we'll let you know if we can make an exception.",
      order: 3,
    },
    {
      title: 'How can I track my order?',
      answer: 'Use the tracking link from your shipping confirmation email, or visit the Track Order page and contact us with your order number.',
      order: 4,
    },
    {
      title: 'What payment methods do you accept?',
      answer: 'All major credit and debit cards, plus any wallet options (Apple Pay, Google Pay, Shop Pay) available at checkout.',
      order: 5,
    },
    {
      title: 'How do I contact customer support?',
      answer: 'Head to our Contact page for phone and email details for the team closest to you — we typically reply within one business day.',
      order: 6,
    },
  ];

  for (const faq of faqItems) {
    await upsertByTitle('faq_item', faq);
  }

  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error('Failed to seed Contentstack site content:');
  console.error(error);
  process.exitCode = 1;
});
