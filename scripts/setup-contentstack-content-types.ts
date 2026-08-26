// scripts/setup-contentstack-content-types.ts
//
// Creates the Contentstack content types needed to move the header/footer and
// the site's static content pages (About, Careers, FAQ, ...) into the CMS.
// Idempotent: skips any content type that already exists.
//
// Usage: npm run setup-contentstack-content-types
//
// Requires (see .env.local): CONTENTSTACK_API_KEY / CONTENTSTACK_MANAGEMENT_TOKEN

import { cma } from './lib/contentstack-cma';

type Field = Record<string, unknown>;

function textField(uid: string, display_name: string, extra: Field = {}): Field {
  return {
    data_type: 'text',
    display_name,
    uid,
    field_metadata: { description: '', default_value: '' },
    mandatory: false,
    multiple: false,
    unique: false,
    non_localizable: false,
    ...extra,
  };
}

function groupField(uid: string, display_name: string, schema: Field[], extra: Field = {}): Field {
  return {
    data_type: 'group',
    display_name,
    uid,
    schema,
    field_metadata: {},
    mandatory: false,
    multiple: true,
    non_localizable: false,
    ...extra,
  };
}

// The stack already ships a reusable "SEO" global field (meta_title, meta_description,
// keywords, enable_search_indexing) — reference it instead of redefining those fields.
function seoField(): Field {
  return {
    data_type: 'global_field',
    display_name: 'SEO',
    reference_to: 'seo',
    uid: 'seo',
    field_metadata: { description: '' },
    mandatory: false,
    multiple: false,
    unique: false,
    non_localizable: false,
  };
}

const CONTENT_TYPES: { uid: string; title: string; description: string; singleton: boolean; schema: Field[] }[] = [
  {
    uid: 'navigation',
    title: 'Navigation',
    description: 'The site header: brand name and top nav links.',
    singleton: true,
    schema: [
      textField('title', 'Title', { mandatory: true, unique: true }),
      textField('brand_name', 'Brand Name'),
      groupField('nav_links', 'Nav Links', [textField('label', 'Label'), textField('href', 'Href')]),
    ],
  },
  {
    uid: 'footer',
    title: 'Footer',
    description: 'The site footer: link columns, social links, and legal links.',
    singleton: true,
    schema: [
      textField('title', 'Title', { mandatory: true, unique: true }),
      textField('brand_name', 'Brand Name'),
      textField('tagline', 'Tagline'),
      groupField('footer_links', 'Footer Links', [
        textField('column', 'Column', {
          display_type: 'dropdown',
          enum: { advanced: false, choices: [{ value: 'Shop' }, { value: 'Company' }, { value: 'Support' }] },
        }),
        textField('label', 'Label'),
        textField('href', 'Href'),
      ]),
      groupField('social_links', 'Social Links', [
        textField('label', 'Label'),
        textField('href', 'Href'),
        textField('icon', 'Icon', {
          display_type: 'dropdown',
          enum: { advanced: false, choices: [{ value: 'instagram' }, { value: 'twitter' }, { value: 'facebook' }] },
        }),
      ]),
      groupField('legal_links', 'Legal Links', [textField('label', 'Label'), textField('href', 'Href')]),
      textField('copyright_text', 'Copyright Text'),
    ],
  },
  {
    uid: 'page',
    title: 'Page',
    description: 'A generic static content page (About, Careers, Privacy, ...), addressed by slug.',
    singleton: false,
    schema: [
      textField('title', 'Title', { mandatory: true, unique: true }),
      textField('slug', 'Slug', { mandatory: true, unique: true }),
      textField('summary', 'Summary'),
      textField('body', 'Body', { field_metadata: { description: '', default_value: '', multiline: true } }),
      seoField(),
    ],
  },
  {
    uid: 'faq_item',
    title: 'FAQ Item',
    description: 'A single question/answer pair shown on the FAQ page.',
    singleton: false,
    schema: [
      textField('title', 'Question', { mandatory: true, unique: true }),
      textField('answer', 'Answer', { field_metadata: { description: '', default_value: '', multiline: true } }),
      {
        data_type: 'number',
        display_name: 'Order',
        uid: 'order',
        field_metadata: { description: '', default_value: '' },
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
    ],
  },
];

async function getContentType(uid: string): Promise<{ title: string; schema: Field[] } | null> {
  try {
    const { content_type } = await cma<{ content_type: { title: string; schema: Field[] } }>(
      `/content_types/${uid}`,
    );
    return content_type;
  } catch {
    return null;
  }
}

/** Adds `field` to an existing content type's schema, unless it's already there. */
async function ensureField(contentTypeUid: string, field: Field) {
  const contentType = await getContentType(contentTypeUid);
  if (!contentType) {
    console.log(`Skipping "${contentTypeUid}.${field.uid}" — content type doesn't exist.`);
    return;
  }
  if (contentType.schema.some((existing) => existing.uid === field.uid)) {
    console.log(`Skipping "${contentTypeUid}.${field.uid}" — field already exists.`);
    return;
  }

  console.log(`Adding field "${field.uid}" to "${contentTypeUid}"...`);
  await cma(`/content_types/${contentTypeUid}`, {
    method: 'PUT',
    body: JSON.stringify({
      content_type: { title: contentType.title, schema: [...contentType.schema, field] },
    }),
  });
}

async function main() {
  for (const contentType of CONTENT_TYPES) {
    if (await getContentType(contentType.uid)) {
      console.log(`Skipping "${contentType.uid}" — already exists.`);
      continue;
    }

    console.log(`Creating content type "${contentType.uid}"...`);
    await cma('/content_types', {
      method: 'POST',
      body: JSON.stringify({
        content_type: {
          title: contentType.title,
          uid: contentType.uid,
          description: contentType.description,
          schema: contentType.schema,
          options: { is_page: false, singleton: contentType.singleton, title: 'title', sub_title: [] },
        },
      }),
    });
  }

  // `home` predates this script, and `page` may have been created by an earlier
  // version of it (before `seo` was added here) — ensure both have it either way.
  await ensureField('home', seoField());
  await ensureField('page', seoField());

  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error('Failed to set up Contentstack content types:');
  console.error(error);
  process.exitCode = 1;
});
