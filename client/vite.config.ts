import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { resolveRegionConfig, type RegionConfig } from "./src/config/regionConfig";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Fills the `__REGION_*__` placeholders in index.html from the region config. */
function regionHtml(region: RegionConfig): Plugin {
  const tokens: Record<string, string> = {
    __APP_NAME__: region.appName,
    __APP_TAGLINE__: region.appTagline,
    __APP_DESCRIPTION__: region.appDescription,
    __APP_URL__: region.appUrl,
    __THEME_COLOR__: region.themeColor,
    __REGION_NAME__: region.cityName,
    __HERO_IMAGE__: region.heroImage,
  };
  return {
    name: "region-html",
    transformIndexHtml(html) {
      return html.replace(/__(APP_NAME|APP_TAGLINE|APP_DESCRIPTION|APP_URL|THEME_COLOR|REGION_NAME|HERO_IMAGE)__/g, (token) => escapeHtml(tokens[token]));
    },
  };
}

export default defineConfig(({ mode }) => {
  const region = resolveRegionConfig({ ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env });

  return {
    plugins: [
      react(),
      regionHtml(region),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["brand-logo.png", "favicon.png", "pwa-192-v2.png", "pwa-512-v2.png", "apple-touch-icon-v2.png"],
        manifest: {
          name: `${region.appName} – Direktori Kontak ${region.cityName}`,
          short_name: region.appName,
          description: region.appDescription,
          theme_color: region.themeColor,
          background_color: region.themeColor,
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          lang: "id",
          icons: [
            {
              src: "/pwa-192-v2.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512-v2.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/pwa-512-v2.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          categories: ["utilities", "lifestyle"],
          shortcuts: [
            {
              name: "Cari Kontak",
              short_name: "Cari",
              description: "Cari kontak di direktori",
              url: "/search",
              icons: [{ src: "/pwa-192-v2.png", sizes: "192x192" }],
            },
            {
              name: "Tambah Kontak",
              short_name: "Kontribusi",
              description: "Tambahkan kontak baru",
              url: "/submit",
              icons: [{ src: "/pwa-192-v2.png", sizes: "192x192" }],
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
          runtimeCaching: [
            {
              // Network-first for API calls
              urlPattern: /^https?:\/\/.*\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24h
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Cache-first for Google Fonts
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Category artwork is immutable within a release and reused by
              // home tiles, search chips, and contact-card fallbacks.
              urlPattern: /\/category-icons\/.*\.(?:webp|png|svg)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "category-icons-cache",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Stale-while-revalidate for images
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Keep disabled in dev to avoid conflicts
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: "http://api:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
