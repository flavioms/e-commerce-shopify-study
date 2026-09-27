// scripts/lib/contentful-management.ts
//
// Thin wrapper around the official contentful-management SDK's "plain"
// client, shared by the scripts under scripts/ that need to write to the
// space (the CONTENTFUL_DELIVERY_TOKEN used by the app itself is read-only).

import { createClient } from 'contentful-management';
import type { ContentTypeProps, CreateContentTypeProps } from 'contentful-management';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const SPACE_ID = requireEnv('CONTENTFUL_SPACE_ID');
const MANAGEMENT_TOKEN = requireEnv('CONTENTFUL_MANAGEMENT_TOKEN');
export const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

// The "plain" client (function calls returning plain objects) rather than the
// deprecated chainable one — every call below defaults to this space/environment.
export const client = createClient(
  { accessToken: MANAGEMENT_TOKEN },
  { type: 'plain', defaults: { spaceId: SPACE_ID, environmentId: ENVIRONMENT_ID } },
);

let defaultLocalePromise: Promise<string> | null = null;

/** The space's default locale code (usually "en-US") — entry fields are keyed by it. */
export function getDefaultLocale(): Promise<string> {
  if (!defaultLocalePromise) {
    defaultLocalePromise = client.locale
      .getMany({})
      .then((locales) => locales.items.find((locale) => locale.default)?.code ?? 'en-US');
  }
  return defaultLocalePromise;
}

export async function getContentType(contentTypeId: string): Promise<ContentTypeProps | null> {
  try {
    return await client.contentType.get({ contentTypeId });
  } catch {
    return null;
  }
}

export async function createContentType(contentTypeId: string, data: CreateContentTypeProps) {
  const created = await client.contentType.createWithId({ contentTypeId }, data);
  return client.contentType.publish({ contentTypeId }, created);
}

type Fields = Record<string, unknown> & { title: string };

function withLocale(fields: Fields, locale: string): Record<string, Record<string, unknown>> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, { [locale]: value }]));
}

export async function findEntries(contentTypeId: string) {
  const { items } = await client.entry.getMany({ query: { content_type: contentTypeId } });
  return items;
}

/** Creates or updates the content type's one entry, keyed by content type rather than title. */
export async function upsertSingleton(contentTypeId: string, fields: Fields) {
  const [locale, entries] = await Promise.all([getDefaultLocale(), findEntries(contentTypeId)]);
  const localizedFields = withLocale(fields, locale);
  const existing = entries[0];

  if (existing) {
    console.log(`Updating singleton "${contentTypeId}"...`);
    const updated = await client.entry.update(
      { entryId: existing.sys.id },
      { ...existing, fields: { ...existing.fields, ...localizedFields } },
    );
    return client.entry.publish({ entryId: updated.sys.id }, updated);
  }

  console.log(`Creating singleton "${contentTypeId}"...`);
  const created = await client.entry.create({ contentTypeId }, { fields: localizedFields });
  return client.entry.publish({ entryId: created.sys.id }, created);
}

/** Creates or updates an entry matched by its `title` field — safe to re-run after editing the seed data. */
export async function upsertByTitle(contentTypeId: string, fields: Fields) {
  const [locale, entries] = await Promise.all([getDefaultLocale(), findEntries(contentTypeId)]);
  const localizedFields = withLocale(fields, locale);
  const existing = entries.find((entry) => entry.fields.title?.[locale] === fields.title);

  if (existing) {
    console.log(`Updating "${fields.title}" (${contentTypeId})...`);
    const updated = await client.entry.update(
      { entryId: existing.sys.id },
      { ...existing, fields: { ...existing.fields, ...localizedFields } },
    );
    return client.entry.publish({ entryId: updated.sys.id }, updated);
  }

  console.log(`Creating "${fields.title}" (${contentTypeId})...`);
  const created = await client.entry.create({ contentTypeId }, { fields: localizedFields });
  return client.entry.publish({ entryId: created.sys.id }, created);
}

/** Creates an entry matched by its `title` field, unless one already exists — never updates. */
export async function createIfMissingByTitle(contentTypeId: string, fields: Fields) {
  const [locale, entries] = await Promise.all([getDefaultLocale(), findEntries(contentTypeId)]);

  if (entries.some((entry) => entry.fields.title?.[locale] === fields.title)) {
    console.log(`Skipping "${fields.title}" (${contentTypeId}) — an entry with that title already exists.`);
    return null;
  }

  console.log(`Creating "${fields.title}" (${contentTypeId})...`);
  const created = await client.entry.create({ contentTypeId }, { fields: withLocale(fields, locale) });
  return client.entry.publish({ entryId: created.sys.id }, created);
}
