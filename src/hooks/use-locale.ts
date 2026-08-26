"use client";

import { useEffect, useState } from "react";

// A fixed locale for the very first render keeps server HTML and the client's
// first paint identical (React would otherwise warn about a hydration mismatch,
// since the server has no notion of the visitor's browser locale).
const FALLBACK_LOCALE = "en-US";

/**
 * The visitor's browser locale (e.g. `navigator.language`), safe to use in
 * server-rendered content: it returns {@link FALLBACK_LOCALE} until mounted,
 * then swaps to the real value right after hydration.
 */
export function useLocale(): string {
  const [locale, setLocale] = useState(FALLBACK_LOCALE);

  useEffect(() => {
    // Deferred to a microtask (a real callback, not a synchronous call in the effect
    // body) so this still fires right after mount, before the fallback-locale paint
    // is visible to the user.
    queueMicrotask(() => setLocale(navigator.language));
  }, []);

  return locale;
}
