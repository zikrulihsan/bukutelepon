import { useLocation, useNavigate } from "react-router-dom";

const HIDDEN_ROUTES = ["/login", "/register", "/admin"];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  const active = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        <div className="bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
            {/* Home */}
            <button onClick={() => navigate("/")} className="flex flex-col items-center pt-2 pb-1.5 gap-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-[22px] w-[22px] ${active("/") ? "text-primary-700" : "text-gray-400"}`}
                fill={"none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active("/") ? 1.5 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={`text-[10px] leading-tight ${active("/") ? "font-semibold text-primary-700" : "font-medium text-gray-400"}`}>
                Beranda
              </span>
            </button>

            {/* Search */}
            <button onClick={() => navigate("/search")} className="flex flex-col items-center pt-2 pb-1.5 gap-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-[22px] w-[22px] ${active("/search") ? "text-primary-700" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active("/search") ? 2 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className={`text-[10px] leading-tight ${active("/search") ? "font-semibold text-primary-700" : "font-medium text-gray-400"}`}>
                Cari
              </span>
            </button>

            {/* Saved */}
            <button onClick={() => navigate("/saved")} className="flex flex-col items-center pt-2 pb-1.5 gap-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-[22px] w-[22px] ${active("/saved") ? "text-primary-700" : "text-gray-400"}`}
                fill={active("/saved") ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active("/saved") ? 0 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className={`text-[10px] leading-tight ${active("/saved") ? "font-semibold text-primary-700" : "font-medium text-gray-400"}`}>
                Tersimpan
              </span>
            </button>

            {/* Contribute */}
            <button onClick={() => navigate("/submit")} className="flex flex-col items-center pt-2 pb-1.5 gap-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-[22px] w-[22px] ${active("/submit") ? "text-primary-700" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active("/submit") ? 2 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-[10px] leading-tight ${active("/submit") ? "font-semibold text-primary-700" : "font-medium text-gray-400"}`}>
                Kontribusi
              </span>
            </button>

            {/* Account */}
            <button onClick={() => navigate("/account")} className="flex flex-col items-center pt-2 pb-1.5 gap-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-[22px] w-[22px] ${active("/account") ? "text-primary-700" : "text-gray-400"}`}
                fill={active("/account") ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={active("/account") ? 0 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-[10px] leading-tight ${active("/account") ? "font-semibold text-primary-700" : "font-medium text-gray-400"}`}>
                Akun
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
