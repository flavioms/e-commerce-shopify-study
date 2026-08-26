import type { Instrumentation } from "next";

import { SITE_NAME } from "@/lib/site";

const DEFAULT_OTLP_ENDPOINT = "https://otlp.nr-data.net:4318";

/**
 * Called once when a new Next.js server instance starts, in both the Node.js
 * and edge runtimes — see https://nextjs.org/docs/app/guides/open-telemetry.
 *
 * Wired up to New Relic via its OTLP ingest endpoint (not the proprietary
 * `newrelic` Node agent): New Relic accepts standard OpenTelemetry data
 * directly, so the app stays on vendor-neutral OTel APIs and swapping
 * backends later is just an env var change, not a rewrite.
 */
export async function register() {
  const { registerOTel, OTLPHttpJsonTraceExporter } = await import("@vercel/otel");
  const licenseKey = process.env.NEW_RELIC_LICENSE_KEY;

  if (!licenseKey) {
    // Never let missing telemetry config break the app (especially local dev,
    // where nobody has this credential set) — register with no export
    // destination. Spans are still created (so custom spans / onRequestError
    // below don't crash on a missing tracer), they just aren't shipped anywhere.
    console.warn(
      "[otel] NEW_RELIC_LICENSE_KEY is not set — OpenTelemetry is initialized but not exporting to New Relic.",
    );
    registerOTel({ serviceName: SITE_NAME });
    return;
  }

  const endpoint = (process.env.NEW_RELIC_OTLP_ENDPOINT || DEFAULT_OTLP_ENDPOINT).replace(/\/+$/, "");

  registerOTel({
    serviceName: SITE_NAME,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${endpoint}/v1/traces`,
      // New Relic's license key doubles as the OTLP ingest API key.
      headers: { "api-key": licenseKey },
    }),
  });
}

/**
 * Reports server errors (Server Components, Route Handlers, Server Actions)
 * onto the active OpenTelemetry span, so they show up in New Relic attached
 * to the trace that produced them instead of as a bare log line.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { trace, SpanStatusCode } = await import("@opentelemetry/api");

  const span = trace.getActiveSpan();
  if (!span) return;

  const normalizedError = error instanceof Error ? error : new Error(String(error));
  span.recordException(normalizedError);
  span.setStatus({ code: SpanStatusCode.ERROR, message: normalizedError.message });
  span.setAttributes({
    "next.route_type": context.routeType,
    "next.router_kind": context.routerKind,
    "http.request.method": request.method,
  });
};
