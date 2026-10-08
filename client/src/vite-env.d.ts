/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_TAGLINE?: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_THEME_COLOR?: string;
  readonly VITE_REGION_NAME?: string;
  readonly VITE_REGION_SLUG?: string;
  readonly VITE_REGION_PROVINCE?: string;
  readonly VITE_ADMIN_WHATSAPP?: string;
  readonly VITE_HERO_IMAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
