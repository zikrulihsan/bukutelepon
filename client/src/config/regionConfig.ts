/**
 * Region (instance) settings for a single-city deployment.
 *
 * Each region runs its own copy of the app with its own database, so the
 * name, city, and contact details all come from environment variables. The
 * fallbacks below are the original Sumbawa Besar instance; other regions
 * should set every VITE_REGION_* / VITE_APP_* value in their own .env.
 *
 * This module is shared with vite.config.ts (Node), so it must stay free of
 * browser globals and `import.meta.env`.
 */
export interface RegionConfig {
  /** Brand shown in the UI, page titles, PWA, and share previews. */
  appName: string;
  /** Short tagline next to the brand in the browser tab. */
  appTagline: string;
  /** One-sentence description for meta tags and the PWA manifest. */
  appDescription: string;
  /** Public origin without trailing slash, used for Open Graph URLs. */
  appUrl: string;
  /** Browser/PWA theme color. */
  themeColor: string;
  /** The single city this instance serves. */
  cityName: string;
  citySlug: string;
  province: string;
  /** Admin WhatsApp in international format without "+", e.g. 6281234567890. */
  adminWhatsapp: string;
  /** Fallback hero image (path under client/public or absolute URL). */
  heroImage: string;
}

type Env = Record<string, string | undefined>;

const DEFAULTS: RegionConfig = {
  appName: "CariKontak",
  appTagline: "Berbagi Kemudahan",
  appDescription: "Temukan dan bagikan kontak penting di kotamu.",
  appUrl: "https://carikontak.com",
  themeColor: "#0d3b2e",
  cityName: "Sumbawa Besar",
  citySlug: "sumbawa-besar",
  province: "Nusa Tenggara Barat",
  adminWhatsapp: "6282338588078",
  heroImage: "/hero-sumbawa-v2.webp",
};

function pick(env: Env, key: string, fallback: string): string {
  const value = env[key]?.trim();
  return value ? value : fallback;
}

export function resolveRegionConfig(env: Env): RegionConfig {
  return {
    appName: pick(env, "VITE_APP_NAME", DEFAULTS.appName),
    appTagline: pick(env, "VITE_APP_TAGLINE", DEFAULTS.appTagline),
    appDescription: pick(env, "VITE_APP_DESCRIPTION", DEFAULTS.appDescription),
    appUrl: pick(env, "VITE_APP_URL", DEFAULTS.appUrl).replace(/\/+$/, ""),
    themeColor: pick(env, "VITE_THEME_COLOR", DEFAULTS.themeColor),
    cityName: pick(env, "VITE_REGION_NAME", DEFAULTS.cityName),
    citySlug: pick(env, "VITE_REGION_SLUG", DEFAULTS.citySlug),
    province: pick(env, "VITE_REGION_PROVINCE", DEFAULTS.province),
    adminWhatsapp: pick(env, "VITE_ADMIN_WHATSAPP", DEFAULTS.adminWhatsapp).replace(/\D/g, ""),
    heroImage: pick(env, "VITE_HERO_IMAGE", DEFAULTS.heroImage),
  };
}
