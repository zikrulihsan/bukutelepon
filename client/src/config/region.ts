import { resolveRegionConfig } from "./regionConfig";

/** Settings for the single region this build serves. See regionConfig.ts. */
export const region = resolveRegionConfig(import.meta.env as Record<string, string | undefined>);

/** wa.me link to this instance's admin, optionally with a prefilled message. */
export function adminWhatsappUrl(text?: string): string {
  const base = `https://wa.me/${region.adminWhatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
