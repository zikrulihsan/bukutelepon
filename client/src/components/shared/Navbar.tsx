import { Link, useLocation } from "react-router-dom";

// Pages that have their own header or don't need the navbar
const HIDDEN_ROUTES = ["/", "/search", "/saved", "/account", "/submit"];

export function Navbar() {
  const location = useLocation();

  if (HIDDEN_ROUTES.some((r) => location.pathname === r) || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center h-12">
          <Link to="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-bold text-primary-700">Buku Telepon</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
