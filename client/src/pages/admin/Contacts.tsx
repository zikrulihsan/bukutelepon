import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Contact, PaginatedResponse } from "../../types";

export default function AdminContacts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Contact>>({
    queryKey: ["admin", "contacts", status, page],
    queryFn: async () => (await apiClient.get(`/admin/contacts?status=${status}&page=${page}`)).data,
    enabled: profile?.role === "ADMIN",
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/contacts/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/contacts/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] }),
  });

  if (profile?.role !== "ADMIN") {
    return <div className="text-center py-16 text-gray-500">Akses ditolak</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Kontak</h1>

      <div className="flex gap-2 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              status === s ? "bg-primary-600 text-white" : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.phone} - {contact.city?.name}</p>
                  <Badge variant={contact.status === "APPROVED" ? "success" : contact.status === "REJECTED" ? "danger" : "warning"}>
                    {contact.status}
                  </Badge>
                </div>
                {contact.status === "PENDING" && (
                  <div className="flex gap-2">
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
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
