import { useEffect, useState } from "react";

/** Wait until typing pauses before the Search tab subscribes to Convex. */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Same bar as `normalizeExactSearchTerm` in convex/search.ts.
 * One letter, or a string with no letters or numbers, does not search.
 */
const MIN_TERM_LENGTH = 2;
const MAX_TERM_LENGTH = 80;

export function normalizeSearchTerm(raw: string): string | null {
  const term = raw.trim().replace(/\s+/g, " ").slice(0, MAX_TERM_LENGTH);
  if (
    term.length < MIN_TERM_LENGTH ||
    !/[0-9A-Za-z\u00C0-\u024F]/u.test(term)
  ) {
    return null;
  }
  return term;
}

export function useDebouncedSearchTerm(raw: string): string | null {
  const normalized = normalizeSearchTerm(raw);
  const [term, setTerm] = useState<string | null>(null);

  useEffect(() => {
    const delay = normalized === null ? 0 : SEARCH_DEBOUNCE_MS;
    const handle = setTimeout(() => {
      setTerm(normalized);
    }, delay);
    return () => {
      clearTimeout(handle);
    };
  }, [normalized]);

  return term;
}
