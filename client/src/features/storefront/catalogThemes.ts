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

  if (business.catalogTheme === "minimal") {
    return {
      "--catalog-bg": "#F4F4F1",
      "--catalog-surface": "#FFFFFF",
      "--catalog-surface-alt": "#ECECE8",
      "--catalog-text": "#111111",
      "--catalog-muted": "#656565",
      "--catalog-border": "#CFCFC9",
      "--catalog-accent": accent,
      "--catalog-accent-text": accentText,
      "--catalog-soft": mix(accent, "#FFFFFF", 0.09),
      "--catalog-dark": "#111111",
      "--catalog-highlight": "#E8E8E3",
      "--catalog-heading-font": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--catalog-radius-lg": "10px",
      "--catalog-radius-md": "6px",
      "--catalog-shadow": "0 1px 0 rgba(17,17,17,.12)",
      "--catalog-hero-gradient": "linear-gradient(100deg, rgba(0,0,0,.88), rgba(0,0,0,.28))",
      "--catalog-promo-gradient": `linear-gradient(120deg, ${mix(accent, "#FFFFFF", 0.94)}, ${mix(accent, "#111111", 0.62)})`,
    };
  }

  if (business.catalogTheme === "bold") {
    return {
      "--catalog-bg": "#160F24",
      "--catalog-surface": "#251739",
      "--catalog-surface-alt": "#322048",
      "--catalog-text": "#FFF8ED",
      "--catalog-muted": "#C8BBD4",
      "--catalog-border": "#49345F",
      "--catalog-accent": accent,
      "--catalog-accent-text": accentText,
      "--catalog-soft": mix(accent, "#251739", 0.20),
      "--catalog-dark": "#10091C",
      "--catalog-highlight": "#3A2453",
      "--catalog-heading-font": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--catalog-radius-lg": "22px",
      "--catalog-radius-md": "16px",
      "--catalog-shadow": `8px 10px 0 ${mix(accent, "#160F24", 0.30)}`,
      "--catalog-hero-gradient": `linear-gradient(115deg, ${mix(accent, "#10091C", 0.22)}, rgba(16,9,28,.35))`,
      "--catalog-promo-gradient": `linear-gradient(125deg, ${accent}, ${mix(accent, "#FFD166", 0.58)})`,
    };
  }

  if (business.catalogTheme === "warm") {
    return {
      "--catalog-bg": "#F4EFE5",
      "--catalog-surface": "#FFFCF6",
      "--catalog-surface-alt": "#EBE2D3",
      "--catalog-text": "#283D32",
      "--catalog-muted": "#6F786F",
      "--catalog-border": "#DDD3C3",
      "--catalog-accent": accent,
      "--catalog-accent-text": accentText,
      "--catalog-soft": mix(accent, "#FFF8EB", 0.12),
      "--catalog-dark": mix(accent, "#18392D", 0.32),
      "--catalog-highlight": "#EFE4D2",
      "--catalog-heading-font": "Georgia, Cambria, serif",
      "--catalog-radius-lg": "30px",
      "--catalog-radius-md": "20px",
      "--catalog-shadow": "0 20px 55px rgba(61,47,30,.12)",
      "--catalog-hero-gradient": "linear-gradient(110deg, rgba(21,50,38,.88), rgba(21,50,38,.18))",
      "--catalog-promo-gradient": `linear-gradient(125deg, ${mix(accent, "#F4D8A3", 0.66)}, ${mix(accent, "#FFF8E9", 0.24)})`,
    };
  }

  return {
    "--catalog-bg": mix(accent, "#F7FAFC", 0.045),
    "--catalog-surface": "#FFFFFF",
    "--catalog-surface-alt": mix(accent, "#F2F7FA", 0.08),
    "--catalog-text": "#102A43",
    "--catalog-muted": "#627D98",
    "--catalog-border": "#D9E2EC",
    "--catalog-accent": accent,
    "--catalog-accent-text": accentText,
    "--catalog-soft": mix(accent, "#FFFFFF", 0.10),
    "--catalog-dark": mix(accent, "#0B1220", 0.30),
    "--catalog-highlight": mix(accent, "#E6F6F7", 0.10),
    "--catalog-heading-font": "Inter, ui-sans-serif, system-ui, sans-serif",
    "--catalog-radius-lg": "24px",
    "--catalog-radius-md": "16px",
    "--catalog-shadow": `0 20px 55px ${mix(accent, "#FFFFFF", 0.15)}33`,
    "--catalog-hero-gradient": `linear-gradient(110deg, ${mix(accent, "#08111F", 0.26)}, rgba(8,17,31,.18))`,
    "--catalog-promo-gradient": `linear-gradient(125deg, ${accent}, ${mix(accent, "#67E8F9", 0.50)})`,
  };
}
