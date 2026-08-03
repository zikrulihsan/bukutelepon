import { useI18n } from "../../i18n/LanguageContext";
import { LANGUAGES, type Lang } from "../../i18n/translations";

interface LanguageToggleProps {
  /** "pill" is the compact header switch, "row" the wider one used in menus. */
  variant?: "pill" | "row";
  className?: string;
}

export function LanguageToggle({ variant = "pill", className = "" }: LanguageToggleProps) {
  const { lang, setLang } = useI18n();

  const compact = variant === "pill";

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center gap-0.5 rounded-full bg-gray-100 p-0.5 ${className}`}
    >
      {LANGUAGES.map(({ code, nativeLabel }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code as Lang)}
          aria-pressed={lang === code}
          className={`rounded-full font-bold transition-colors active:scale-95 ${
            compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs"
          } ${
            lang === code
              ? "bg-white text-primary-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {compact ? code.toUpperCase() : nativeLabel}
        </button>
      ))}
    </div>
  );
}
