import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../i18n/LanguageContext";
import { LanguageToggle } from "../shared/LanguageToggle";
import type { TranslationKey } from "../../i18n/translations";
import { BrandLogo } from "../shared/BrandLogo";
import { BrandLoadingScreen } from "../shared/BrandLoadingScreen";

const navItems: { to: string; labelKey: TranslationKey; end?: boolean }[] = [
  { to: "/admin", labelKey: "admin.dashboard", end: true },
  { to: "/admin/contacts", labelKey: "admin.contacts" },
  { to: "/admin/add-contact", labelKey: "admin.addContact" },
  { to: "/admin/reviews", labelKey: "admin.reviews" },
  { to: "/admin/users", labelKey: "admin.users" },
  { to: "/admin/hero-promotions", labelKey: "admin.heroPromotions" },
];

export function AdminLayout() {
  const { t } = useI18n();
  const { profile, loading } = useAuth();

  if (loading) {
    return <BrandLoadingScreen label={t("common.loading")} />;
  }

  if (profile?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            <NavLink to="/" aria-label="CariKontak" className="mr-4 inline-flex items-center gap-2 text-primary-700 font-bold text-lg">
              <BrandLogo decorative className="h-8 w-8" />
              <span className="hidden sm:inline">CariKontak</span>
            </NavLink>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium">{t("admin.badge")}</span>
            <LanguageToggle className="ml-auto" />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-primary-700 text-primary-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
}
