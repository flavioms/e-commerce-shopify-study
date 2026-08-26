// scripts/lib/contentstack-cma.ts
//
// Tiny fetch wrapper around Contentstack's Content Management API, shared by
// the scripts under scripts/ that need to write to the stack (the
// CONTENTSTACK_DELIVERY_TOKEN used by the app itself is read-only).

export const CMA_BASE_URL = 'https://api.contentstack.io/v3';
export const ENVIRONMENT = 'development';
export const LOCALE = 'en-us';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const API_KEY = requireEnv('CONTENTSTACK_API_KEY');
const MANAGEMENT_TOKEN = requireEnv('CONTENTSTACK_MANAGEMENT_TOKEN');

export function cmaHeaders(extra?: Record<string, string>) {
  return { api_key: API_KEY, authorization: MANAGEMENT_TOKEN, ...extra };
}

export async function cma<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CMA_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...cmaHeaders({ 'Content-Type': 'application/json' }),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Contentstack API error (${res.status}) on ${path}: ${JSON.stringify(body)}`);
  }
  return body as T;
}
