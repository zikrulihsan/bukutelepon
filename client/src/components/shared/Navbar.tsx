import { Link, useLocation } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi2";
import { useI18n } from "../../i18n/LanguageContext";
import { BrandLogo } from "./BrandLogo";

// Pages that have their own header or don't need the navbar
const HIDDEN_ROUTES = ["/", "/search", "/saved", "/account", "/submit", "/kontak", "/catalog", "/katalog", "/buat-katalog", "/jastip-kontak"];

export function Navbar() {
  const location = useLocation();
  const { t } = useI18n();

  if (HIDDEN_ROUTES.some((r) => location.pathname === r) || location.pathname.startsWith("/admin") || location.pathname.startsWith("/kontak") || location.pathname.startsWith("/catalog/") || location.pathname.startsWith("/katalog/")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center h-12">
          <Link to="/" className="flex items-center gap-2">
            <HiChevronLeft className="h-4 w-4 text-gray-500" />
            <BrandLogo decorative className="h-7 w-7" />
            <span className="text-sm font-bold text-primary-700">{t("nav.brand")}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
