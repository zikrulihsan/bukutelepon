import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { supabase } from "../../lib/supabase";
import { useCategories } from "../../context/CategoriesContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Contact, City, Category, PaginatedResponse } from "../../types";

interface EditForm {
  name: string;
  phone: string;
  address: string;
  website: string;
  mapsUrl: string;
  description: string;
  imageUrl: string;
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
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Contact>>({
    queryKey: ["admin", "contacts", status, page],
    queryFn: async () => (await apiClient.get(`/admin/contacts?status=${status}&page=${page}`)).data,
  });

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
  });

  const { categories: categoriesData } = useCategories();

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
    mutationFn: async ({ id, data }: { id: string; data: EditForm }) => {
      let imageUrl = data.imageUrl || null;

      if (editImageFile) {
        setEditImageUploading(true);
        const ext = editImageFile.name.split(".").pop();
        const path = `contacts/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("contact-images").upload(path, editImageFile, { upsert: false });
        setEditImageUploading(false);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("contact-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      return apiClient.put(`/admin/contacts/${id}`, {
        ...data,
        address: data.address || null,
        website: data.website || null,
        mapsUrl: data.mapsUrl || null,
        description: data.description || null,
        imageUrl,
      });
    },
    onSuccess: () => {
      invalidateAll();
      setEditingId(null);
      setEditForm(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    },
  });

  function startEdit(contact: Contact) {
    setEditingId(contact.id);
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      address: contact.address || "",
      website: contact.website || "",
      mapsUrl: contact.mapsUrl || "",
      description: contact.description || "",
      imageUrl: contact.imageUrl || "",
      cityId: contact.cityId,
      categoryId: contact.categoryId,
      status: contact.status,
    });
    setEditImageFile(null);
    setEditImagePreview(contact.imageUrl || null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  }

  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function removeEditImage() {
    setEditImageFile(null);
    if (editImagePreview && editImageFile) URL.revokeObjectURL(editImagePreview);
    setEditImagePreview(null);
    if (editForm) setEditForm({ ...editForm, imageUrl: "" });
  }

  const cities = citiesData?.data ?? [];
  const categories = categoriesData ?? [];
  const inputClass = "w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none";

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Kelola Kontak</h1>

      <div className="flex gap-2 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === s ? "bg-primary-700 text-white" : "bg-white border border-gray-300 text-gray-700"
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
                      <label className="block text-xs font-medium text-gray-500 mb-1">Link Google Maps</label>
                      <input value={editForm.mapsUrl} onChange={(e) => setEditForm({ ...editForm, mapsUrl: e.target.value })} className={inputClass} placeholder="Opsional" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={`${inputClass} bg-white`}>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Deskripsi</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Opsional" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>
                    {editImagePreview ? (
                      <div className="relative w-16 h-16">
                        <img src={editImagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={removeEditImage}
                          className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => editImageInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload foto
                      </button>
                    )}
                    <input ref={editImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => editMutation.mutate({ id: contact.id, data: editForm })} loading={editMutation.isPending || editImageUploading}>
                      {editImageUploading ? "Mengupload..." : "Simpan"}
                    </Button>
                    <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
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
                      className="p-1.5 text-gray-400 hover:text-primary-700 rounded-xl hover:bg-gray-50 transition-colors"
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
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 text-sm"
          >
            Sebelumnya
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 text-sm"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}
