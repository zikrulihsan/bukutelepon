import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AccountPage() {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
        <div className="px-4 pt-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full shimmer mb-3" />
            <div className="h-4 w-32 rounded shimmer mb-2" />
            <div className="h-3 w-40 rounded shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
        <div className="px-4 pt-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Masuk ke Akun</h2>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Masuk atau daftar untuk menyimpan kontak, berkontribusi, dan melihat semua data direktori.
          </p>
          <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
            <Link
              to="/login"
              className="block bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-semibold text-center hover:bg-primary-800 active:scale-[0.98] transition-all"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="block bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-sm font-semibold text-center hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
      {/* Profile header */}
      <div className="bg-white px-4 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-700">
              {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{profile?.name}</h2>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            {profile?.role === "ADMIN" && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-50 text-[10px] font-semibold text-primary-700">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 pt-4 space-y-2">
        {profile?.role === "ADMIN" && (
          <Link to="/admin" className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Admin Dashboard</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        <Link to="/saved" className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Kontak Tersimpan</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link to="/submit" className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Kontribusi Kontak</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <button
          onClick={signOut}
          className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm w-full text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium text-red-600">Keluar</span>
        </button>
      </div>
    </div>
  );
}
