import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();

  // MainScreen has its own header
  if (location.pathname === "/" || location.pathname.startsWith("/kota/")) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between h-12 items-center">
          <Link to="/" className="text-lg font-bold text-primary-700">
            Buku Telepon
          </Link>

          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Link
                  to="/submit"
                  className="text-sm font-medium text-primary-700 hover:text-primary-800"
                >
                  + Tambah
                </Link>
                {profile?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-800">
                  Masuk
                </Link>
                <Link to="/register" className="text-sm font-medium bg-primary-700 text-white px-3 py-1.5 rounded-lg hover:bg-primary-800">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
