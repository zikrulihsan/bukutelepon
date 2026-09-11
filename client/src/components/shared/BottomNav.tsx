import { useLocation, useNavigate } from "react-router-dom";
import { HiHome, HiOutlineHome, HiMagnifyingGlass, HiBookmark, HiOutlineBookmark, HiPlusCircle, HiOutlinePlusCircle, HiUser, HiOutlineUser } from "react-icons/hi2";
import { useI18n } from "../../i18n/LanguageContext";
import { useKeyboardOpen } from "../../hooks/useKeyboardOpen";

const HIDDEN_ROUTES = ["/login", "/register", "/admin", "/kontak", "/catalog"];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const keyboardOpen = useKeyboardOpen();

  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  // While typing there is nothing to navigate to, and on iOS the bar would be
  // stranded halfway up the screen on top of the keyboard.
  if (keyboardOpen) return null;

  const active = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-[850px]">
        <div className="rounded-t-[28px] border-t border-gray-100 bg-white shadow-[0_-8px_30px_rgba(8,35,75,0.09)]">
          <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)] pt-1 min-[700px]:min-h-[134px] min-[700px]:pt-3">
            {/* Home */}
            <button onClick={() => {
              if (location.pathname === "/") {
                window.dispatchEvent(new Event("reset-home"));
              } else {
                navigate("/");
              }
            }} className="flex flex-col items-center gap-1 pt-2.5 pb-2 transition-transform active:scale-95 min-[700px]:gap-2 min-[700px]:pt-2">
              {active("/") ? (
                <HiHome className="h-6 w-6 text-primary-700 min-[700px]:h-9 min-[700px]:w-9" />
              ) : (
                <HiOutlineHome className="h-6 w-6 text-gray-400 min-[700px]:h-9 min-[700px]:w-9" />
              )}
              <span className={`text-[10px] leading-tight min-[700px]:text-[16px] ${active("/") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                {t("nav.home")}
              </span>
            </button>

            {/* Search */}
            <button onClick={() => navigate("/search")} className="flex flex-col items-center gap-1 pt-2.5 pb-2 transition-transform active:scale-95 min-[700px]:gap-2 min-[700px]:pt-2">
              <HiMagnifyingGlass className={`h-6 w-6 min-[700px]:h-9 min-[700px]:w-9 ${active("/search") ? "text-primary-700 stroke-[0.5]" : "text-gray-400"}`} />
              <span className={`text-[10px] leading-tight min-[700px]:text-[16px] ${active("/search") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                {t("nav.search")}
              </span>
            </button>

            {/* Saved */}
            <button onClick={() => navigate("/saved")} className="flex flex-col items-center gap-1 pt-2.5 pb-2 transition-transform active:scale-95 min-[700px]:gap-2 min-[700px]:pt-2">
              {active("/saved") ? (
                <HiBookmark className="h-6 w-6 text-primary-700 min-[700px]:h-9 min-[700px]:w-9" />
              ) : (
                <HiOutlineBookmark className="h-6 w-6 text-gray-400 min-[700px]:h-9 min-[700px]:w-9" />
              )}
              <span className={`text-[10px] leading-tight min-[700px]:text-[16px] ${active("/saved") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                {t("nav.saved")}
              </span>
            </button>

            {/* Contribute */}
            <button onClick={() => navigate("/submit")} className="flex flex-col items-center gap-1 pt-2.5 pb-2 transition-transform active:scale-95 min-[700px]:gap-2 min-[700px]:pt-2">
              {active("/submit") ? (
                <HiPlusCircle className="h-6 w-6 text-primary-700 min-[700px]:h-9 min-[700px]:w-9" />
              ) : (
                <HiOutlinePlusCircle className="h-6 w-6 text-gray-400 min-[700px]:h-9 min-[700px]:w-9" />
              )}
              <span className={`text-[10px] leading-tight min-[700px]:text-[16px] ${active("/submit") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                {t("nav.contribute")}
              </span>
            </button>

            {/* Account */}
            <button onClick={() => navigate("/account")} className="flex flex-col items-center gap-1 pt-2.5 pb-2 transition-transform active:scale-95 min-[700px]:gap-2 min-[700px]:pt-2">
              {active("/account") ? (
                <HiUser className="h-6 w-6 text-primary-700 min-[700px]:h-9 min-[700px]:w-9" />
              ) : (
                <HiOutlineUser className="h-6 w-6 text-gray-400 min-[700px]:h-9 min-[700px]:w-9" />
              )}
              <span className={`text-[10px] leading-tight min-[700px]:text-[16px] ${active("/account") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                {t("nav.account")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
