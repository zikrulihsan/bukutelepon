import { useLocation, useNavigate } from "react-router-dom";
import { HiHome, HiOutlineHome, HiMagnifyingGlass, HiBookmark, HiOutlineBookmark, HiPlusCircle, HiOutlinePlusCircle, HiUser, HiOutlineUser } from "react-icons/hi2";

const HIDDEN_ROUTES = ["/login", "/register", "/admin", "/kontak"];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  const active = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        <div className="bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)] pt-1">
            {/* Home */}
            <button onClick={() => {
              if (location.pathname === "/") {
                window.dispatchEvent(new Event("reset-home"));
              } else {
                navigate("/");
              }
            }} className="flex flex-col items-center pt-2.5 pb-2 gap-1 active:scale-95 transition-transform">
              {active("/") ? (
                <HiHome className="h-6 w-6 text-primary-700" />
              ) : (
                <HiOutlineHome className="h-6 w-6 text-gray-400" />
              )}
              <span className={`text-[10px] leading-tight ${active("/") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                Beranda
              </span>
            </button>

            {/* Search */}
            <button onClick={() => navigate("/search")} className="flex flex-col items-center pt-2.5 pb-2 gap-1 active:scale-95 transition-transform">
              <HiMagnifyingGlass className={`h-6 w-6 ${active("/search") ? "text-primary-700 stroke-[0.5]" : "text-gray-400"}`} />
              <span className={`text-[10px] leading-tight ${active("/search") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                Cari
              </span>
            </button>

            {/* Saved */}
            <button onClick={() => navigate("/saved")} className="flex flex-col items-center pt-2.5 pb-2 gap-1 active:scale-95 transition-transform">
              {active("/saved") ? (
                <HiBookmark className="h-6 w-6 text-primary-700" />
              ) : (
                <HiOutlineBookmark className="h-6 w-6 text-gray-400" />
              )}
              <span className={`text-[10px] leading-tight ${active("/saved") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                Tersimpan
              </span>
            </button>

            {/* Contribute */}
            <button onClick={() => navigate("/submit")} className="flex flex-col items-center pt-2.5 pb-2 gap-1 active:scale-95 transition-transform">
              {active("/submit") ? (
                <HiPlusCircle className="h-6 w-6 text-primary-700" />
              ) : (
                <HiOutlinePlusCircle className="h-6 w-6 text-gray-400" />
              )}
              <span className={`text-[10px] leading-tight ${active("/submit") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                Kontribusi
              </span>
            </button>

            {/* Account */}
            <button onClick={() => navigate("/account")} className="flex flex-col items-center pt-2.5 pb-2 gap-1 active:scale-95 transition-transform">
              {active("/account") ? (
                <HiUser className="h-6 w-6 text-primary-700" />
              ) : (
                <HiOutlineUser className="h-6 w-6 text-gray-400" />
              )}
              <span className={`text-[10px] leading-tight ${active("/account") ? "font-bold text-primary-700" : "font-medium text-gray-500"}`}>
                Akun
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
