import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Contact, PaginatedResponse } from "../../types";

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "PENDING");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Contact>>({
    queryKey: ["admin", "contacts", status, page],
    queryFn: async () => (await apiClient.get(`/admin/contacts?status=${status}&page=${page}`)).data,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/contacts/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/contacts/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Kelola Kontak</h1>

      <div className="flex gap-2 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === s ? "bg-primary-600 text-white" : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Tidak ada kontak {status.toLowerCase()}</div>
          )}
          {data?.data.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {contact.city?.name} &middot; {contact.category?.name}
                  </p>
                  {contact.address && <p className="text-xs text-gray-400">{contact.address}</p>}
                  <div className="mt-2">
                    <Badge variant={contact.status === "APPROVED" ? "success" : contact.status === "REJECTED" ? "danger" : "warning"}>
                      {contact.status}
                    </Badge>
                  </div>
                </div>
                {contact.status === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(contact.id)}
                      loading={approveMutation.isPending}
                    >
                      Setuju
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => rejectMutation.mutate(contact.id)}
                      loading={rejectMutation.isPending}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-xl disabled:opacity-50 text-sm"
          >
            Sebelumnya
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 border rounded-xl disabled:opacity-50 text-sm"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
