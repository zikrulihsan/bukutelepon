import { useLocation, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiOutlineHome,
  HiMagnifyingGlass,
  HiBookmark,
  HiOutlineBookmark,
  HiPlusCircle,
  HiOutlinePlusCircle,
  HiUser,
  HiOutlineUser,
} from "react-icons/hi2";
import { useI18n } from "../../i18n/LanguageContext";
import { useKeyboardOpen } from "../../hooks/useKeyboardOpen";

const HIDDEN_ROUTES = ["/login", "/register", "/admin", "/kontak", "/catalog", "/katalog", "/buat-katalog", "/jastip-kontak"];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const keyboardOpen = useKeyboardOpen();

  if (HIDDEN_ROUTES.some((route) => location.pathname.startsWith(route))) return null;
  if (keyboardOpen) return null;

  const active = (path: string) => location.pathname === path;
  const iconClass = "h-6 w-6";
  const itemClass = "flex flex-col items-center justify-start gap-0.5 pt-1.5 transition-transform active:scale-95";
  const labelClass = (isActive: boolean) =>
    `text-[11px] leading-4 ${isActive ? "font-bold text-primary-700" : "font-medium text-gray-500"}`;
  const goTo = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    navigate(path);
  };

  return (
    <div className="app-bottom-nav z-40">
      <div className="mx-auto max-w-[425px]">
        <div className="app-bottom-nav__surface rounded-t-[14px] border-t border-gray-100 bg-white shadow-[0_-4px_15px_rgba(8,35,75,0.09)]">
          <div className="grid min-h-[68px] grid-cols-5 pb-[env(safe-area-inset-bottom)] pt-1.5">
            <button
              onClick={() => goTo("/")}
              className={itemClass}
            >
              {active("/") ? (
                <HiHome className={`${iconClass} text-primary-700`} />
              ) : (
                <HiOutlineHome className={`${iconClass} text-gray-400`} />
              )}
              <span className={labelClass(active("/"))}>{t("nav.home")}</span>
            </button>

            <button onClick={() => goTo("/search")} className={itemClass}>
              <HiMagnifyingGlass className={`${iconClass} ${active("/search") ? "text-primary-700 stroke-[0.5]" : "text-gray-400"}`} />
              <span className={labelClass(active("/search"))}>{t("nav.search")}</span>
            </button>

            <button onClick={() => goTo("/saved")} className={itemClass}>
              {active("/saved") ? (
                <HiBookmark className={`${iconClass} text-primary-700`} />
              ) : (
                <HiOutlineBookmark className={`${iconClass} text-gray-400`} />
              )}
              <span className={labelClass(active("/saved"))}>{t("nav.saved")}</span>
            </button>

            <button onClick={() => goTo("/submit")} className={itemClass}>
              {active("/submit") ? (
                <HiPlusCircle className={`${iconClass} text-primary-700`} />
              ) : (
                <HiOutlinePlusCircle className={`${iconClass} text-gray-400`} />
              )}
              <span className={labelClass(active("/submit"))}>{t("nav.contribute")}</span>
            </button>

            <button onClick={() => goTo("/account")} className={itemClass}>
              {active("/account") ? (
                <HiUser className={`${iconClass} text-primary-700`} />
              ) : (
                <HiOutlineUser className={`${iconClass} text-gray-400`} />
              )}
              <span className={labelClass(active("/account"))}>{t("nav.account")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
