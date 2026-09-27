import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache configured yet — ISR revalidation is not persisted.
// See https://opennext.js.org/cloudflare/caching to set up R2/KV.
export default defineCloudflareConfig({});
