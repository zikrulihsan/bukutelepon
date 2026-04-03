import { Link, useLocation } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi2";

// Pages that have their own header or don't need the navbar
const HIDDEN_ROUTES = ["/", "/search", "/saved", "/account", "/submit", "/kontak"];

export function Navbar() {
  const location = useLocation();

  if (HIDDEN_ROUTES.some((r) => location.pathname === r) || location.pathname.startsWith("/admin") || location.pathname.startsWith("/kontak")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center h-12">
          <Link to="/" className="flex items-center gap-2">
            <HiChevronLeft className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-bold text-primary-700">Buku Telepon</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
