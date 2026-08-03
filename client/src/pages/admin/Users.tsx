import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { Badge } from "../../components/ui/Badge";
import type { Profile, PaginatedResponse } from "../../types";
import { useI18n } from "../../i18n/LanguageContext";

export default function AdminUsers() {
  const { t, formatDate } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Profile>>({
    queryKey: ["admin", "users", page],
    queryFn: async () => (await apiClient.get(`/admin/users?page=${page}`)).data,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t("admin.users")}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.colName")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.colEmail")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.colRole")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.colContributions")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.colRegistered")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "ADMIN" ? "success" : "default"}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.hasContributed ? "success" : "warning"}>
                        {user.hasContributed ? t("common.yes") : t("common.notYet")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 text-sm"
          >
            {t("pagination.prev")}
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 text-sm"
          >
            {t("pagination.next")}
          </button>
        </div>
      )}
    </div>
  );
}
