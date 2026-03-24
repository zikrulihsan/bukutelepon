import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ContributionWall() {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="text-base font-bold text-gray-900 mb-1">
        Akses Penuh Diperlukan
      </h3>
      <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
        Daftar dan kontribusikan minimal 1 kontak untuk melihat semua data di direktori.
      </p>
      {user ? (
        <Link
          to="/submit"
          className="inline-block bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-800 active:scale-95 transition-all"
        >
          Tambah Kontak
        </Link>
      ) : (
        <div className="flex gap-2.5 justify-center">
          <Link
            to="/register"
            className="inline-block bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-800 active:scale-95 transition-all"
          >
            Daftar Gratis
          </Link>
          <Link
            to="/login"
            className="inline-block bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-95 transition-all"
          >
            Masuk
          </Link>
        </div>
      )}
    </div>
  );
}
