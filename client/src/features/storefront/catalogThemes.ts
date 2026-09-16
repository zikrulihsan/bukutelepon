import type { CSSProperties } from "react";
import type { StorefrontBusiness } from "./storefrontData";

type CatalogCssProperties = CSSProperties & Record<`--catalog-${string}`, string>;

function normalizeHex(value: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : "#0F766E";
}

function channels(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1);
  return [Number.parseInt(value.slice(0, 2), 16), Number.parseInt(value.slice(2, 4), 16), Number.parseInt(value.slice(4, 6), 16)];
}

function mix(first: string, second: string, amount: number): string {
  const a = channels(first);
  const b = channels(second);
  const channel = (index: number) => Math.round(a[index] * amount + b[index] * (1 - amount)).toString(16).padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`.toUpperCase();
}

function readableText(background: string): string {
  const [red, green, blue] = channels(background).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.45 ? "#111827" : "#FFFFFF";
}

export function catalogThemeStyle(business: StorefrontBusiness): CatalogCssProperties {
  const accent = normalizeHex(business.catalogAccent);
  const accentText = readableText(accent);
  const shared: CatalogCssProperties = {
    "--catalog-bg": "#F8FAF7",
    "--catalog-surface": "#FFFFFF",
    "--catalog-surface-alt": "#F0F4F1",
    "--catalog-text": "#08234B",
    "--catalog-muted": "#71809B",
    "--catalog-border": "#E2E8E4",
    "--catalog-accent": accent,
    "--catalog-accent-text": accentText,
    "--catalog-soft": mix(accent, "#FFFFFF", 0.09),
    "--catalog-dark": "#08234B",
    "--catalog-highlight": mix(accent, "#F8FAF7", 0.055),
    "--catalog-heading-font": "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    "--catalog-radius-lg": "20px",
    "--catalog-radius-md": "14px",
    "--catalog-shadow": "0 4px 14px rgba(16,46,70,.07)",
    "--catalog-hero-gradient": "linear-gradient(90deg, rgba(8,35,75,.72), rgba(8,35,75,.16))",
    "--catalog-promo-gradient": `linear-gradient(120deg, ${mix(accent, "#FFFFFF", 0.07)}, #FFFFFF)`,
  };

  if (business.catalogTheme === "retro") {
    return {
      ...shared,
      "--catalog-bg": "#F8F6F0",
      "--catalog-surface-alt": "#F4F0E7",
      "--catalog-border": "#E6E0D3",
      "--catalog-muted": "#6E7788",
      "--catalog-dark": "#28213A",
      "--catalog-highlight": mix(accent, "#FBF9F4", 0.055),
      "--catalog-soft": mix(accent, "#FFFFFF", 0.08),
      "--catalog-hero-gradient": "linear-gradient(90deg, rgba(40,33,58,.70), rgba(40,33,58,.12))",
      "--catalog-promo-gradient": `linear-gradient(120deg, ${mix(accent, "#FFFFFF", 0.07)}, #FFFFFF)`,
    };
  }

  if (business.catalogTheme === "minimal") {
    return {
      ...shared,
      "--catalog-bg": "#F4F4F1",
      "--catalog-surface": "#FFFFFF",
      "--catalog-surface-alt": "#ECECE8",
      "--catalog-text": "#17212B",
      "--catalog-muted": "#68727D",
      "--catalog-border": "#DFE1DD",
      "--catalog-soft": mix(accent, "#FFFFFF", 0.09),
      "--catalog-dark": "#17212B",
      "--catalog-highlight": "#ECEEEA",
      "--catalog-radius-lg": "16px",
      "--catalog-radius-md": "12px",
      "--catalog-shadow": "0 3px 12px rgba(23,33,43,.06)",
      "--catalog-hero-gradient": "linear-gradient(90deg, rgba(23,33,43,.70), rgba(23,33,43,.12))",
      "--catalog-promo-gradient": "linear-gradient(120deg, #ECEEEA, #FFFFFF)",
    };
  }

  if (business.catalogTheme === "bold") {
    return {
      ...shared,
      "--catalog-bg": mix(accent, "#F8FAFC", 0.035),
      "--catalog-surface-alt": mix(accent, "#F5F7FA", 0.055),
      "--catalog-border": mix(accent, "#E4E9F0", 0.055),
      "--catalog-soft": mix(accent, "#FFFFFF", 0.09),
      "--catalog-dark": mix(accent, "#08234B", 0.18),
      "--catalog-highlight": mix(accent, "#F8FAFC", 0.06),
      "--catalog-hero-gradient": `linear-gradient(90deg, ${mix(accent, "#08234B", 0.18)}CC, rgba(8,35,75,.12))`,
      "--catalog-promo-gradient": `linear-gradient(120deg, ${mix(accent, "#FFFFFF", 0.08)}, #FFFFFF)`,
    };
  }

  if (business.catalogTheme === "warm") {
    return {
      ...shared,
      "--catalog-bg": "#FAF8F3",
      "--catalog-surface-alt": "#F6F1E8",
      "--catalog-border": "#ECE5D9",
      "--catalog-muted": "#74766F",
      "--catalog-soft": mix(accent, "#FFFFFF", 0.08),
      "--catalog-dark": mix(accent, "#08234B", 0.17),
      "--catalog-highlight": mix(accent, "#FBF8F2", 0.05),
      "--catalog-hero-gradient": "linear-gradient(90deg, rgba(8,35,75,.68), rgba(8,35,75,.10))",
      "--catalog-promo-gradient": `linear-gradient(120deg, ${mix(accent, "#FFFFFF", 0.065)}, #FFFFFF)`,
    };
  }

  return shared;
}
