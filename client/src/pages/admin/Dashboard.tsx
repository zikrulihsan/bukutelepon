import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/axios";

interface AdminStats {
  totalContacts: number;
  pendingContacts: number;
  totalUsers: number;
  totalReviews: number;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<{ success: boolean; data: AdminStats }>({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await apiClient.get("/admin/stats")).data,
  });

  const stats = data?.data;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Kontak</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalContacts}</p>
          </div>
          <Link
            to="/admin/contacts?status=PENDING"
            className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-yellow-700">Menunggu Review</p>
            <p className="text-3xl font-bold text-yellow-800 mt-1">{stats?.pendingContacts}</p>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">Total Pengguna</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers}</p>
          </Link>
          <Link
            to="/admin/reviews"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">Total Ulasan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalReviews}</p>
          </Link>
        </div>
      )}
    </div>
  );
}
