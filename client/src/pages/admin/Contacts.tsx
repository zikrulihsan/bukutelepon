import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Contact, City, Category, PaginatedResponse } from "../../types";

interface EditForm {
  name: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  cityId: string;
  categoryId: string;
  status: string;
}

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "PENDING");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Contact>>({
    queryKey: ["admin", "contacts", status, page],
    queryFn: async () => (await apiClient.get(`/admin/contacts?status=${status}&page=${page}`)).data,
  });

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
  });

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/contacts/${id}/approve`),
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/contacts/${id}/reject`),
    onSuccess: invalidateAll,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditForm }) =>
      apiClient.put(`/admin/contacts/${id}`, {
        ...data,
        address: data.address || null,
        website: data.website || null,
        description: data.description || null,
      }),
    onSuccess: () => {
      invalidateAll();
      setEditingId(null);
      setEditForm(null);
    },
  });

  function startEdit(contact: Contact) {
    setEditingId(contact.id);
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      address: contact.address || "",
      website: contact.website || "",
      description: contact.description || "",
      cityId: contact.cityId,
      categoryId: contact.categoryId,
      status: contact.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  const cities = citiesData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none";

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
              {editingId === contact.id && editForm ? (
                /* ── Edit mode ── */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nama</label>
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Telepon</label>
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Kota</label>
                      <select value={editForm.cityId} onChange={(e) => setEditForm({ ...editForm, cityId: e.target.value })} className={`${inputClass} bg-white`}>
                        {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                      <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className={`${inputClass} bg-white`}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
                    <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} placeholder="Opsional" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
                      <input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className={inputClass} placeholder="Opsional" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={`${inputClass} bg-white`}>
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Deskripsi</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Opsional" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => editMutation.mutate({ id: contact.id, data: editForm })} loading={editMutation.isPending}>
                      Simpan
                    </Button>
                    <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
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
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(contact)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {contact.status === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => approveMutation.mutate(contact.id)} loading={approveMutation.isPending}>
                          Setuju
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => rejectMutation.mutate(contact.id)} loading={rejectMutation.isPending}>
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
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
