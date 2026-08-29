/**
 * Builds the link a user shares from the search page.
 *
 * The keyword, category, and city all ride along in the query string — that is
 * what `netlify/edge-functions/search-preview.ts` reads to title the chat
 * preview ("Rumah Sakit di Bandung"), and what makes the receiver land on the
 * same results the sender saw.
 */
export interface SearchShareParams {
  q?: string;
  category?: string;
  city?: string | null;
}

export function buildSearchShareUrl(
  { q, category, city }: SearchShareParams,
  origin: string = window.location.origin
): string {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (city) params.set("city", city);

  const query = params.toString();
  return `${origin}/search${query ? `?${query}` : ""}`;
}
