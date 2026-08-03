import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "./translations";

const LS_KEY = "bt_lang";

type Vars = Record<string, string | number>;

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key, filling `{placeholders}` from `vars`. */
  t: (key: TranslationKey, vars?: Vars) => string;
  /** Category names live in the DB in Indonesian — translate by slug, fall back to the stored name. */
  categoryName: (category?: { slug?: string; name?: string } | null) => string;
  /** Locale-aware date formatting. */
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  locale: string;
}

const LOCALES: Record<Lang, string> = { id: "id-ID", en: "en-US" };

const LanguageContext = createContext<I18nState | undefined>(undefined);

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === "id" || stored === "en") return stored;
  } catch {
    // storage unavailable — fall through to browser detection
  }
  // Indonesian stays the default for everyone except explicitly-English browsers.
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "id";
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LS_KEY, next);
    } catch {
      // Preference is session-only when storage is unavailable.
    }
  }, []);

  const value = useMemo<I18nState>(() => {
    const dict = translations[lang];

    const t = (key: TranslationKey, vars?: Vars) => interpolate(dict[key] ?? key, vars);

    return {
      lang,
      setLang,
      t,
      locale: LOCALES[lang],
      categoryName: (category) => {
        if (!category) return "";
        const key = `category.${category.slug}` as TranslationKey;
        return dict[key] ?? category.name ?? "";
      },
      formatDate: (date, options) =>
        new Date(date).toLocaleDateString(LOCALES[lang], options),
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return context;
}
